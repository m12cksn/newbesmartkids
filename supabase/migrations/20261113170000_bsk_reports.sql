-- Laporan belajar untuk orang tua: tautan baca-saja yang bisa dibagikan, dan akses admin.

create table bsk.report_links (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references bsk.accounts(id) on delete cascade,
  code_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);
alter table bsk.report_links enable row level security;
revoke all on bsk.report_links from public, anon, authenticated;

-- Isi laporan: nama dan riwayat nilai (paling banyak 300 hasil terbaru).
create or replace function bsk.report_json(a bsk.accounts) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('name', coalesce(nullif(a.display_name, ''), a.username), 'generatedAt', now(),
    'results', coalesce((select jsonb_agg(jsonb_build_object('path', r.path, 'title', r.chapter_title, 'kind', r.kind, 'part', r.part,
        'correct', r.correct, 'total', r.total, 'score', r.score, 'at', r.created_at) order by r.created_at desc)
      from (select * from bsk.results where account_id = a.id order by created_at desc limit 300) r), '[]'::jsonb));
$$;

-- Buat tautan baru (tautan lama otomatis tidak berlaku). Kode hanya dikembalikan sekali; yang disimpan hanya hash-nya.
create or replace function public.bsk_report_link(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts; v_code text; v_exp timestamptz;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return jsonb_build_object('error', 'session'); end if;
  v_code := encode(extensions.gen_random_bytes(12), 'hex');
  delete from bsk.report_links where account_id = a.id;
  insert into bsk.report_links (account_id, code_hash) values (a.id, bsk.hash_token(v_code)) returning expires_at into v_exp;
  return jsonb_build_object('code', v_code, 'expiresAt', v_exp);
end $$;

create or replace function public.bsk_report_status(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return null; end if;
  return (select jsonb_build_object('expiresAt', l.expires_at) from bsk.report_links l where l.account_id = a.id and l.expires_at > now());
end $$;

create or replace function public.bsk_report_revoke(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return jsonb_build_object('error', 'session'); end if;
  delete from bsk.report_links where account_id = a.id;
  return jsonb_build_object('ok', true);
end $$;

-- Dibuka orang tua lewat tautan, tanpa login.
create or replace function public.bsk_report_public(p_code text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare l bsk.report_links; a bsk.accounts;
begin
  if p_code is null or p_code !~ '^[0-9a-f]{24}$' then return null; end if;
  select * into l from bsk.report_links where code_hash = bsk.hash_token(p_code) and expires_at > now();
  if not found then return null; end if;
  select * into a from bsk.accounts where id = l.account_id and not disabled;
  if not found then return null; end if;
  return bsk.report_json(a) || jsonb_build_object('expiresAt', l.expires_at);
end $$;

-- Admin melihat laporan siswa mana pun.
create or replace function public.bsk_admin_report(p_token text, p_account uuid)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  perform bsk.require_admin(p_token);
  select * into a from bsk.accounts where id = p_account;
  if not found then return null; end if;
  return bsk.report_json(a);
end $$;

-- Laporan untuk akun sendiri.
create or replace function public.bsk_my_report(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return null; end if;
  return bsk.report_json(a);
end $$;

revoke all on function bsk.report_json(bsk.accounts) from public, anon, authenticated;
revoke all on function public.bsk_report_link(text), public.bsk_report_status(text), public.bsk_report_revoke(text), public.bsk_report_public(text),
  public.bsk_admin_report(text, uuid), public.bsk_my_report(text) from public;
grant execute on function public.bsk_report_link(text), public.bsk_report_status(text), public.bsk_report_revoke(text), public.bsk_report_public(text),
  public.bsk_admin_report(text, uuid), public.bsk_my_report(text) to anon, authenticated;
