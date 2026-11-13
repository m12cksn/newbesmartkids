-- Paket sekolah: akun guru, kelas sekolah (rombel) berisi akun siswa, dan rekap nilai untuk guru.
-- Tabel di schema bsk (tertutup); aplikasi hanya memakai fungsi public.bsk_* (security definer).

alter table bsk.accounts drop constraint accounts_role_check;
alter table bsk.accounts add constraint accounts_role_check check (role in ('student', 'teacher', 'admin'));

create table bsk.groups (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references bsk.accounts(id) on delete set null,
  name text not null check (length(name) between 1 and 80),
  class_id int check (class_id between 1 and 12),
  created_at timestamptz not null default now()
);
create index on bsk.groups (teacher_id);

create table bsk.group_members (
  group_id uuid not null references bsk.groups(id) on delete cascade,
  account_id uuid not null references bsk.accounts(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (group_id, account_id)
);
create index on bsk.group_members (account_id);

alter table bsk.groups enable row level security;
alter table bsk.group_members enable row level security;
revoke all on bsk.groups, bsk.group_members from public, anon, authenticated;

-- ---------- Bantuan internal ----------
create or replace function bsk.require_teacher(p_token text) returns bsk.accounts
language plpgsql volatile set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null or a.role not in ('teacher', 'admin') then raise exception 'not_teacher' using errcode = '42501'; end if;
  return a;
end $$;

-- Ringkasan per siswa: nilai evaluasi terbaik dan terakhir serta banyak latihan per bab.
create or replace function bsk.member_summary(p_account uuid) returns jsonb
language sql stable set search_path = '' as $$
  with r as (
    select regexp_replace(path, '^(/kelas/[^/]+/materi/[^/?#]+).*$', '\1') as chapter, chapter_title, kind, score, created_at, id
    from bsk.results where account_id = p_account and kind in ('latihan', 'evaluasi')
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'path', c.chapter, 'title', c.title, 'best', c.best, 'last', c.last, 'evals', c.evals, 'practice', c.practice, 'lastAt', c.last_at) order by c.chapter), '[]'::jsonb)
  from (
    select chapter,
      (array_agg(chapter_title order by created_at desc, id desc))[1] as title,
      max(score) filter (where kind = 'evaluasi') as best,
      (array_agg(score order by created_at desc, id desc) filter (where kind = 'evaluasi'))[1] as last,
      count(*) filter (where kind = 'evaluasi') as evals,
      count(*) filter (where kind = 'latihan') as practice,
      max(created_at) as last_at
    from r group by chapter
  ) c;
$$;

create or replace function bsk.group_json(g bsk.groups, p_detail boolean) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('id', g.id, 'name', g.name, 'classId', g.class_id, 'createdAt', g.created_at,
    'teacher', (select jsonb_build_object('id', t.id, 'username', t.username, 'displayName', t.display_name) from bsk.accounts t where t.id = g.teacher_id),
    'members', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'username', a.username, 'displayName', a.display_name, 'disabled', a.disabled)
        || case when p_detail then jsonb_build_object(
          'lastAt', (select max(x.created_at) from bsk.results x where x.account_id = a.id),
          'week', (select count(*) from bsk.results x where x.account_id = a.id and x.created_at > now() - interval '7 days'),
          'chapters', bsk.member_summary(a.id)) else '{}'::jsonb end
        order by lower(coalesce(nullif(a.display_name, ''), a.username)))
      from bsk.group_members m join bsk.accounts a on a.id = m.account_id where m.group_id = g.id), '[]'::jsonb));
$$;

-- ---------- Admin ----------
create or replace function public.bsk_admin_set_role(p_token text, p_account uuid, p_role text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare me bsk.accounts;
begin
  me := bsk.require_admin(p_token);
  if p_role not in ('student', 'teacher') then return jsonb_build_object('error', 'bad_role'); end if;
  if me.id = p_account then return jsonb_build_object('error', 'self'); end if;
  update bsk.accounts set role = p_role where id = p_account and role <> 'admin';
  if p_role = 'student' then update bsk.groups set teacher_id = null where teacher_id = p_account; end if;
  return (select bsk.account_json(a) from bsk.accounts a where a.id = p_account);
end $$;

create or replace function public.bsk_admin_groups(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform bsk.require_admin(p_token);
  return coalesce((select jsonb_agg(bsk.group_json(g, false) order by g.created_at desc) from bsk.groups g), '[]'::jsonb);
end $$;

-- Buat (p_group null) atau ubah kelas sekolah.
create or replace function public.bsk_admin_group_save(p_token text, p_group uuid, p_name text, p_teacher uuid, p_class int)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare g bsk.groups; v_name text := left(trim(coalesce(p_name, '')), 80);
begin
  perform bsk.require_admin(p_token);
  if v_name = '' then return jsonb_build_object('error', 'bad_name'); end if;
  if p_class is not null and p_class not between 1 and 12 then return jsonb_build_object('error', 'bad_class'); end if;
  if p_teacher is not null and not exists (select 1 from bsk.accounts where id = p_teacher and role = 'teacher') then return jsonb_build_object('error', 'bad_teacher'); end if;
  if p_group is null then
    insert into bsk.groups (name, teacher_id, class_id) values (v_name, p_teacher, p_class) returning * into g;
  else
    update bsk.groups set name = v_name, teacher_id = p_teacher, class_id = p_class where id = p_group returning * into g;
    if not found then return jsonb_build_object('error', 'not_found'); end if;
  end if;
  return bsk.group_json(g, false);
end $$;

create or replace function public.bsk_admin_group_delete(p_token text, p_group uuid)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform bsk.require_admin(p_token);
  delete from bsk.groups where id = p_group;
  return jsonb_build_object('ok', true);
end $$;

-- Tambah siswa yang sudah punya akun, berdasarkan username. Username yang tidak ada dikembalikan.
create or replace function public.bsk_admin_group_add(p_token text, p_group uuid, p_usernames text[])
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare g bsk.groups; v_missing text[];
begin
  perform bsk.require_admin(p_token);
  select * into g from bsk.groups where id = p_group;
  if not found then return jsonb_build_object('error', 'not_found'); end if;
  if coalesce(array_length(p_usernames, 1), 0) > 200 then return jsonb_build_object('error', 'too_many'); end if;
  select coalesce(array_agg(u), '{}') into v_missing from (select distinct lower(trim(x)) as u from unnest(p_usernames) x where trim(x) <> '') s
    where not exists (select 1 from bsk.accounts a where a.username = s.u and a.role = 'student');
  insert into bsk.group_members (group_id, account_id)
    select g.id, a.id from bsk.accounts a where a.role = 'student' and a.username in (select lower(trim(x)) from unnest(p_usernames) x)
    on conflict do nothing;
  return jsonb_build_object('missing', to_jsonb(v_missing), 'group', bsk.group_json(g, false));
end $$;

create or replace function public.bsk_admin_group_remove(p_token text, p_group uuid, p_account uuid)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare g bsk.groups;
begin
  perform bsk.require_admin(p_token);
  delete from bsk.group_members where group_id = p_group and account_id = p_account;
  select * into g from bsk.groups where id = p_group;
  if not found then return jsonb_build_object('error', 'not_found'); end if;
  return bsk.group_json(g, false);
end $$;

-- Buat banyak akun siswa sekaligus untuk satu kelas sekolah. Username: awalan + nomor urut (01, 02, ...).
-- PIN hanya dikembalikan sekali.
create or replace function public.bsk_admin_bulk_create(p_token text, p_group uuid, p_prefix text, p_names text[], p_package text, p_class int)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare g bsk.groups; v_prefix text := lower(trim(coalesce(p_prefix, ''))); v_name text; v_user text; v_pin text; v_id uuid; n int := 0; v_out jsonb := '[]'::jsonb;
begin
  perform bsk.require_admin(p_token);
  select * into g from bsk.groups where id = p_group;
  if not found then return jsonb_build_object('error', 'not_found'); end if;
  if v_prefix !~ '^[a-z0-9._-]{2,24}$' then return jsonb_build_object('error', 'bad_prefix'); end if;
  if coalesce(array_length(p_names, 1), 0) not between 1 and 60 then return jsonb_build_object('error', 'bad_count'); end if;
  if p_package not in ('kelas', 'semua') or (p_package = 'kelas' and (p_class is null or p_class not between 1 and 12)) then return jsonb_build_object('error', 'bad_package'); end if;
  foreach v_name in array p_names loop
    v_name := left(trim(coalesce(v_name, '')), 80);
    continue when v_name = '';
    -- Nomor urut berikutnya yang belum dipakai untuk awalan ini.
    loop
      n := n + 1;
      v_user := v_prefix || lpad(n::text, 2, '0');
      exit when not exists (select 1 from bsk.accounts where username = v_user);
    end loop;
    v_pin := bsk.new_pin();
    insert into bsk.accounts (username, pin_hash, display_name, note)
      values (v_user, extensions.crypt(v_pin, extensions.gen_salt('bf', 10)), v_name, left('Sekolah: ' || g.name, 200))
      returning id into v_id;
    perform bsk.grant_package(v_id, p_package, p_class);
    insert into bsk.group_members (group_id, account_id) values (g.id, v_id);
    v_out := v_out || jsonb_build_object('username', v_user, 'pin', v_pin, 'displayName', v_name);
  end loop;
  return jsonb_build_object('created', v_out, 'group', bsk.group_json(g, false));
end $$;

-- ---------- Guru ----------
-- Kelas sekolah milik guru beserta ringkasan nilai setiap siswa. Admin melihat semua kelas sekolah.
create or replace function public.bsk_teacher_overview(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare me bsk.accounts;
begin
  me := bsk.require_teacher(p_token);
  return jsonb_build_object('name', coalesce(nullif(me.display_name, ''), me.username), 'role', me.role,
    'groups', coalesce((select jsonb_agg(bsk.group_json(g, true) order by g.name) from bsk.groups g where me.role = 'admin' or g.teacher_id = me.id), '[]'::jsonb));
end $$;

-- Laporan lengkap seorang siswa, hanya jika siswa itu ada di kelas sekolah milik guru.
create or replace function public.bsk_teacher_report(p_token text, p_account uuid)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare me bsk.accounts; a bsk.accounts;
begin
  me := bsk.require_teacher(p_token);
  if me.role <> 'admin' and not exists (select 1 from bsk.group_members m join bsk.groups g on g.id = m.group_id where m.account_id = p_account and g.teacher_id = me.id) then
    return null;
  end if;
  select * into a from bsk.accounts where id = p_account;
  if not found then return null; end if;
  return bsk.report_json(a);
end $$;

revoke all on function bsk.require_teacher(text), bsk.member_summary(uuid), bsk.group_json(bsk.groups, boolean) from public, anon, authenticated;
revoke all on function public.bsk_admin_set_role(text, uuid, text), public.bsk_admin_groups(text), public.bsk_admin_group_save(text, uuid, text, uuid, int),
  public.bsk_admin_group_delete(text, uuid), public.bsk_admin_group_add(text, uuid, text[]), public.bsk_admin_group_remove(text, uuid, uuid),
  public.bsk_admin_bulk_create(text, uuid, text, text[], text, int), public.bsk_teacher_overview(text), public.bsk_teacher_report(text, uuid) from public;
grant execute on function public.bsk_admin_set_role(text, uuid, text), public.bsk_admin_groups(text), public.bsk_admin_group_save(text, uuid, text, uuid, int),
  public.bsk_admin_group_delete(text, uuid), public.bsk_admin_group_add(text, uuid, text[]), public.bsk_admin_group_remove(text, uuid, uuid),
  public.bsk_admin_bulk_create(text, uuid, text, text[], text, int), public.bsk_teacher_overview(text), public.bsk_teacher_report(text, uuid) to anon, authenticated;
