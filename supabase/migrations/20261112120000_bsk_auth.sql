-- BeSmartKids: akun username + PIN, paket akses, dan sesi perangkat.
-- Tabel berada di schema `bsk` yang tidak dibuka lewat API. Aplikasi hanya
-- memanggil fungsi public.bsk_* (security definer) dengan kunci publishable.

create schema if not exists bsk;
revoke all on schema bsk from public, anon, authenticated;

create table bsk.accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username ~ '^[a-z0-9._-]{3,32}$'),
  pin_hash text not null,
  display_name text not null default '',
  phone text not null default '',
  note text not null default '',
  role text not null default 'student' check (role in ('student', 'admin')),
  disabled boolean not null default false,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table bsk.entitlements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references bsk.accounts(id) on delete cascade,
  package text not null check (package in ('kelas', 'semua')),
  class_id int check (class_id between 1 and 12),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check ((package = 'kelas') = (class_id is not null))
);
create index on bsk.entitlements (account_id);

create table bsk.sessions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references bsk.accounts(id) on delete cascade,
  token_hash text not null unique,
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);
create index on bsk.sessions (account_id);

alter table bsk.accounts enable row level security;
alter table bsk.entitlements enable row level security;
alter table bsk.sessions enable row level security;
revoke all on all tables in schema bsk from public, anon, authenticated;

-- ---------- Bantuan internal ----------
create or replace function bsk.hash_token(p_token text) returns text
language sql immutable set search_path = '' as $$
  select encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');
$$;

create or replace function bsk.new_pin() returns text
language sql volatile set search_path = '' as $$
  select lpad(((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text, 6, '0');
$$;

create or replace function bsk.session_account(p_token text) returns bsk.accounts
language plpgsql volatile set search_path = '' as $$
declare s bsk.sessions; a bsk.accounts;
begin
  select * into s from bsk.sessions where token_hash = bsk.hash_token(p_token) and expires_at > now();
  if not found then return null; end if;
  select * into a from bsk.accounts where id = s.account_id and not disabled;
  if not found then return null; end if;
  if s.last_seen_at < now() - interval '10 minutes' then
    update bsk.sessions set last_seen_at = now() where id = s.id;
  end if;
  return a;
end $$;

create or replace function bsk.account_json(a bsk.accounts) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'id', a.id, 'username', a.username, 'displayName', a.display_name, 'phone', a.phone, 'note', a.note,
    'role', a.role, 'disabled', a.disabled, 'createdAt', a.created_at,
    'entitlements', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'package', e.package, 'classId', e.class_id, 'startsAt', e.starts_at, 'expiresAt', e.expires_at) order by e.expires_at desc)
      from bsk.entitlements e where e.account_id = a.id), '[]'::jsonb),
    'devices', (select count(*) from bsk.sessions s where s.account_id = a.id and s.expires_at > now()));
$$;

create or replace function bsk.require_admin(p_token text) returns bsk.accounts
language plpgsql volatile set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null or a.role <> 'admin' then raise exception 'not_admin' using errcode = '42501'; end if;
  return a;
end $$;

create or replace function bsk.grant_package(p_account uuid, p_package text, p_class int) returns void
language plpgsql volatile set search_path = '' as $$
declare v_from timestamptz;
begin
  if p_package not in ('kelas', 'semua') then raise exception 'bad_package'; end if;
  if p_package = 'kelas' and (p_class is null or p_class not between 1 and 12) then raise exception 'bad_class'; end if;
  -- Perpanjangan dimulai dari akhir paket yang sama yang masih aktif.
  select max(expires_at) into v_from from bsk.entitlements
    where account_id = p_account and package = p_package and class_id is not distinct from (case when p_package = 'kelas' then p_class end) and expires_at > now();
  v_from := greatest(coalesce(v_from, now()), now());
  insert into bsk.entitlements (account_id, package, class_id, starts_at, expires_at)
  values (p_account, p_package, case when p_package = 'kelas' then p_class end, v_from,
          v_from + case when p_package = 'semua' then interval '24 months' else interval '12 months' end);
end $$;

-- ---------- Fungsi publik ----------
create or replace function public.bsk_login(p_username text, p_pin text, p_user_agent text default '')
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts; v_token text;
begin
  select * into a from bsk.accounts where username = lower(trim(p_username));
  if not found or a.disabled then return jsonb_build_object('error', 'invalid'); end if;
  if a.locked_until is not null and a.locked_until > now() then
    return jsonb_build_object('error', 'locked', 'until', a.locked_until);
  end if;
  if p_pin is null or a.pin_hash <> extensions.crypt(p_pin, a.pin_hash) then
    -- Kesalahan ke-5 mengunci akun selama 15 menit.
    update bsk.accounts set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
      locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
    where id = a.id;
    return jsonb_build_object('error', 'invalid');
  end if;
  update bsk.accounts set failed_attempts = 0, locked_until = null where id = a.id;
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into bsk.sessions (account_id, token_hash, user_agent) values (a.id, bsk.hash_token(v_token), left(coalesce(p_user_agent, ''), 300));
  -- Paling banyak 2 perangkat: sesi terlama keluar otomatis.
  delete from bsk.sessions where account_id = a.id and id not in (
    select id from bsk.sessions where account_id = a.id and expires_at > now() order by created_at desc limit 2);
  return jsonb_build_object('token', v_token, 'role', a.role);
end $$;

create or replace function public.bsk_session(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return null; end if;
  return jsonb_build_object(
    'username', a.username, 'displayName', a.display_name, 'role', a.role,
    'all', a.role = 'admin' or exists (select 1 from bsk.entitlements e where e.account_id = a.id and e.package = 'semua' and e.starts_at <= now() and e.expires_at > now()),
    'classes', coalesce((select jsonb_agg(distinct e.class_id) from bsk.entitlements e where e.account_id = a.id and e.package = 'kelas' and e.starts_at <= now() and e.expires_at > now()), '[]'::jsonb),
    'expiresAt', (select max(e.expires_at) from bsk.entitlements e where e.account_id = a.id and e.expires_at > now()));
end $$;

create or replace function public.bsk_logout(p_token text)
returns void language sql volatile security definer set search_path = '' as $$
  delete from bsk.sessions where token_hash = bsk.hash_token(p_token);
$$;

create or replace function public.bsk_admin_list(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform bsk.require_admin(p_token);
  return coalesce((select jsonb_agg(bsk.account_json(a) order by a.created_at desc) from bsk.accounts a), '[]'::jsonb);
end $$;

create or replace function public.bsk_admin_create(p_token text, p_username text, p_display_name text, p_phone text, p_note text, p_package text, p_class int)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_pin text := bsk.new_pin(); v_id uuid; v_user text := lower(trim(p_username));
begin
  perform bsk.require_admin(p_token);
  if v_user !~ '^[a-z0-9._-]{3,32}$' then return jsonb_build_object('error', 'bad_username'); end if;
  if exists (select 1 from bsk.accounts where username = v_user) then return jsonb_build_object('error', 'taken'); end if;
  insert into bsk.accounts (username, pin_hash, display_name, phone, note)
  values (v_user, extensions.crypt(v_pin, extensions.gen_salt('bf', 10)), left(coalesce(p_display_name, ''), 80), left(coalesce(p_phone, ''), 30), left(coalesce(p_note, ''), 200))
  returning id into v_id;
  perform bsk.grant_package(v_id, p_package, p_class);
  return jsonb_build_object('username', v_user, 'pin', v_pin, 'account', (select bsk.account_json(a) from bsk.accounts a where a.id = v_id));
end $$;

create or replace function public.bsk_admin_extend(p_token text, p_account uuid, p_package text, p_class int)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform bsk.require_admin(p_token);
  perform bsk.grant_package(p_account, p_package, p_class);
  return (select bsk.account_json(a) from bsk.accounts a where a.id = p_account);
end $$;

create or replace function public.bsk_admin_reset_pin(p_token text, p_account uuid)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_pin text := bsk.new_pin(); v_user text;
begin
  perform bsk.require_admin(p_token);
  update bsk.accounts set pin_hash = extensions.crypt(v_pin, extensions.gen_salt('bf', 10)), failed_attempts = 0, locked_until = null
  where id = p_account returning username into v_user;
  if v_user is null then return jsonb_build_object('error', 'not_found'); end if;
  delete from bsk.sessions where account_id = p_account;
  return jsonb_build_object('username', v_user, 'pin', v_pin);
end $$;

create or replace function public.bsk_admin_set_disabled(p_token text, p_account uuid, p_disabled boolean)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare me bsk.accounts;
begin
  me := bsk.require_admin(p_token);
  if me.id = p_account then return jsonb_build_object('error', 'self'); end if;
  update bsk.accounts set disabled = p_disabled where id = p_account;
  if p_disabled then delete from bsk.sessions where account_id = p_account; end if;
  return (select bsk.account_json(a) from bsk.accounts a where a.id = p_account);
end $$;

create or replace function public.bsk_admin_logout_devices(p_token text, p_account uuid)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform bsk.require_admin(p_token);
  delete from bsk.sessions where account_id = p_account;
  return (select bsk.account_json(a) from bsk.accounts a where a.id = p_account);
end $$;

revoke all on all functions in schema bsk from public, anon, authenticated;
revoke all on function public.bsk_login(text, text, text), public.bsk_session(text), public.bsk_logout(text),
  public.bsk_admin_list(text), public.bsk_admin_create(text, text, text, text, text, text, int), public.bsk_admin_extend(text, uuid, text, int),
  public.bsk_admin_reset_pin(text, uuid), public.bsk_admin_set_disabled(text, uuid, boolean), public.bsk_admin_logout_devices(text, uuid) from public;
grant execute on function public.bsk_login(text, text, text), public.bsk_session(text), public.bsk_logout(text),
  public.bsk_admin_list(text), public.bsk_admin_create(text, text, text, text, text, text, int), public.bsk_admin_extend(text, uuid, text, int),
  public.bsk_admin_reset_pin(text, uuid), public.bsk_admin_set_disabled(text, uuid, boolean), public.bsk_admin_logout_devices(text, uuid) to anon, authenticated;
