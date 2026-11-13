-- Riwayat nilai latihan dan evaluasi per akun.
-- Tabel di schema bsk (tertutup); aplikasi hanya memakai fungsi public.bsk_* (security definer).

create table bsk.results (
  id bigint generated always as identity primary key,
  account_id uuid not null references bsk.accounts(id) on delete cascade,
  path text not null check (path ~ '^/kelas/[a-z0-9-]+/materi/[a-z0-9-]+' and length(path) <= 200),
  chapter_title text not null default '' check (length(chapter_title) <= 160),
  kind text not null check (kind in ('latihan', 'evaluasi')),
  part text not null default '' check (length(part) <= 120),
  correct int not null check (correct >= 0),
  total int not null check (total between 1 and 100 and correct <= total),
  score int generated always as (round(correct * 100.0 / total)) stored,
  created_at timestamptz not null default now()
);
create index on bsk.results (account_id, created_at desc);
alter table bsk.results enable row level security;
revoke all on bsk.results from public, anon, authenticated;

create or replace function public.bsk_save_result(p_token text, p_path text, p_title text, p_kind text, p_part text, p_correct int, p_total int)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return jsonb_build_object('error', 'session'); end if;
  if p_kind not in ('latihan', 'evaluasi') or p_total is null or p_total < 1 or p_total > 100 or p_correct is null or p_correct < 0 or p_correct > p_total
     or p_path !~ '^/kelas/[a-z0-9-]+/materi/[a-z0-9-]+' or length(p_path) > 200 then
    return jsonb_build_object('error', 'invalid');
  end if;
  -- Batas wajar agar tabel tidak dibanjiri: paling banyak 300 hasil per akun per hari.
  if (select count(*) from bsk.results where account_id = a.id and created_at > now() - interval '1 day') >= 300 then
    return jsonb_build_object('error', 'limit');
  end if;
  insert into bsk.results (account_id, path, chapter_title, kind, part, correct, total)
  values (a.id, left(p_path, 200), left(coalesce(p_title, ''), 160), p_kind, left(coalesce(p_part, ''), 120), p_correct, p_total);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.bsk_my_results(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return null; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('path', r.path, 'title', r.chapter_title, 'kind', r.kind, 'part', r.part,
      'correct', r.correct, 'total', r.total, 'score', r.score, 'at', r.created_at) order by r.created_at desc)
    from (select * from bsk.results where account_id = a.id order by created_at desc limit 300) r), '[]'::jsonb);
end $$;

revoke all on function public.bsk_save_result(text, text, text, text, text, int, int), public.bsk_my_results(text) from public;
grant execute on function public.bsk_save_result(text, text, text, text, text, int, int), public.bsk_my_results(text) to anon, authenticated;
