-- Hasil lama dan klien lama tetap memakai fungsi simpan dengan tujuh parameter.
alter table bsk.results add column incorrect jsonb;

create or replace function public.bsk_save_result(p_token text, p_path text, p_title text, p_kind text, p_part text, p_correct int, p_total int, p_incorrect jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return jsonb_build_object('error', 'session'); end if;
  if p_kind not in ('latihan', 'evaluasi', 'harian') or p_total is null or p_total < 1 or p_total > 100 or p_correct is null or p_correct < 0 or p_correct > p_total
     or not (p_path ~ '^/kelas/[a-z0-9-]+/materi/[a-z0-9-]+' or p_path ~ '^/mastering-(penjumlahan-pengurangan|perkalian-pembagian|jarimatika|pembagian-garis)/level-[1-3]$')
     or length(p_path) > 200 then
    return jsonb_build_object('error', 'invalid');
  end if;
  if (select count(*) from bsk.results where account_id = a.id and created_at > now() - interval '1 day') >= 300 then
    return jsonb_build_object('error', 'limit');
  end if;
  if jsonb_typeof(p_incorrect) is distinct from 'array' or octet_length(p_incorrect::text) > 380000 then
    return jsonb_build_object('error', 'invalid');
  end if;
  if jsonb_array_length(p_incorrect) <> p_total - p_correct then
    return jsonb_build_object('error', 'invalid');
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_incorrect) as answer(entry)
    where jsonb_typeof(entry -> 'number') is distinct from 'number'
       or coalesce(entry ->> 'number', '') !~ '^([1-9][0-9]?|100)$'
       or jsonb_typeof(entry -> 'prompt') is distinct from 'string'
       or jsonb_typeof(entry -> 'submitted') is distinct from 'string'
       or jsonb_typeof(entry -> 'expected') is distinct from 'string'
       or jsonb_typeof(entry -> 'explanation') is distinct from 'string'
  ) then
    return jsonb_build_object('error', 'invalid');
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_incorrect) as answer(entry)
    group by entry ->> 'number'
    having count(*) > 1 or (entry ->> 'number')::int > p_total
  ) then
    return jsonb_build_object('error', 'invalid');
  end if;
  insert into bsk.results (account_id, path, chapter_title, kind, part, correct, total, incorrect)
  values (a.id, left(p_path, 200), left(coalesce(p_title, ''), 160), p_kind, left(coalesce(p_part, ''), 120), p_correct, p_total, p_incorrect);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.bsk_my_results(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return null; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('path', r.path, 'title', r.chapter_title, 'kind', r.kind, 'part', r.part,
      'correct', r.correct, 'total', r.total, 'score', r.score, 'at', r.created_at, 'incorrect', case when r.position <= 10 then r.incorrect end) order by r.created_at desc, r.id desc)
    from (select *, row_number() over (order by created_at desc, id desc) as position
      from bsk.results where account_id = a.id order by created_at desc, id desc limit 300) r), '[]'::jsonb);
end $$;

revoke all on function public.bsk_save_result(text, text, text, text, text, int, int, jsonb) from public;
grant execute on function public.bsk_save_result(text, text, text, text, text, int, int, jsonb) to anon, authenticated;
notify pgrst, 'reload schema';
