-- Simpan snapshot seluruh soal evaluasi agar setiap lingkaran pada riwayat
-- dapat membuka pertanyaan yang sama seperti hasil evaluasi langsung.
alter table bsk.results add column review jsonb;

create or replace function public.bsk_save_result(
  p_token text, p_path text, p_title text, p_kind text, p_part text,
  p_correct int, p_total int, p_incorrect jsonb, p_review jsonb default null
)
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
  if p_incorrect is not null and (jsonb_typeof(p_incorrect) is distinct from 'array' or octet_length(p_incorrect::text) > 380000 or jsonb_array_length(p_incorrect) <> p_total - p_correct) then
    return jsonb_build_object('error', 'invalid');
  end if;
  if p_review is not null and (jsonb_typeof(p_review) is distinct from 'array' or octet_length(p_review::text) > 500000 or jsonb_array_length(p_review) <> p_total) then
    return jsonb_build_object('error', 'invalid');
  end if;
  if p_review is not null and exists (
    select 1 from jsonb_array_elements(p_review) as item(entry)
    where jsonb_typeof(entry -> 'number') is distinct from 'number'
       or jsonb_typeof(entry -> 'prompt') is distinct from 'string'
       or jsonb_typeof(entry -> 'submitted') is distinct from 'string'
       or jsonb_typeof(entry -> 'expected') is distinct from 'string'
       or jsonb_typeof(entry -> 'explanation') is distinct from 'string'
       or jsonb_typeof(entry -> 'correct') is distinct from 'boolean'
       or (entry ? 'options' and jsonb_typeof(entry -> 'options') is distinct from 'array')
  ) then
    return jsonb_build_object('error', 'invalid');
  end if;
  insert into bsk.results (account_id, path, chapter_title, kind, part, correct, total, incorrect, review)
  values (a.id, left(p_path, 200), left(coalesce(p_title, ''), 160), p_kind, left(coalesce(p_part, ''), 120), p_correct, p_total, p_incorrect, p_review);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.bsk_my_evaluation(p_token text, p_result_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return null; end if;
  return (
    select jsonb_build_object(
      'id', r.id::text, 'path', r.path, 'title', r.chapter_title, 'kind', r.kind, 'part', r.part,
      'correct', r.correct, 'total', r.total, 'score', r.score, 'at', r.created_at,
      'incorrect', r.incorrect, 'review', r.review
    )
    from bsk.results r where r.account_id = a.id and r.id = p_result_id and r.kind = 'evaluasi'
  );
end $$;

revoke all on function public.bsk_save_result(text, text, text, text, text, int, int, jsonb, jsonb), public.bsk_my_evaluation(text, bigint) from public;
grant execute on function public.bsk_save_result(text, text, text, text, text, int, int, jsonb, jsonb), public.bsk_my_evaluation(text, bigint) to anon, authenticated;
notify pgrst, 'reload schema';
