create or replace function public.bsk_my_results(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return null; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', r.id::text, 'path', r.path, 'title', r.chapter_title, 'kind', r.kind, 'part', r.part,
      'correct', r.correct, 'total', r.total, 'score', r.score, 'at', r.created_at,
      'incorrect', case when r.kind <> 'evaluasi' and r.position <= 10 then r.incorrect end
    ) order by r.created_at desc, r.id desc)
    from (
      select *, row_number() over (order by created_at desc, id desc) as position
      from bsk.results where account_id = a.id order by created_at desc, id desc limit 300
    ) r
  ), '[]'::jsonb);
end $$;

create function public.bsk_my_evaluation(p_token text, p_result_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return null; end if;
  return (
    select jsonb_build_object(
      'id', r.id::text, 'path', r.path, 'title', r.chapter_title, 'kind', r.kind, 'part', r.part,
      'correct', r.correct, 'total', r.total, 'score', r.score, 'at', r.created_at, 'incorrect', r.incorrect
    )
    from bsk.results r where r.account_id = a.id and r.id = p_result_id and r.kind = 'evaluasi'
  );
end $$;

revoke all on function public.bsk_my_evaluation(text, bigint) from public;
grant execute on function public.bsk_my_evaluation(text, bigint) to anon, authenticated;
notify pgrst, 'reload schema';
