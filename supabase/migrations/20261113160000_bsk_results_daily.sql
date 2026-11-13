-- Riwayat nilai: tambah latihan harian (mastering) sebagai jenis 'harian'.
alter table bsk.results drop constraint results_path_check;
alter table bsk.results add constraint results_path_check check (
  (path ~ '^/kelas/[a-z0-9-]+/materi/[a-z0-9-]+' or path ~ '^/mastering-(penjumlahan-pengurangan|perkalian-pembagian)/level-[1-3]$') and length(path) <= 200);
alter table bsk.results drop constraint results_kind_check;
alter table bsk.results add constraint results_kind_check check (kind in ('latihan', 'evaluasi', 'harian'));

create or replace function public.bsk_save_result(p_token text, p_path text, p_title text, p_kind text, p_part text, p_correct int, p_total int)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return jsonb_build_object('error', 'session'); end if;
  if p_kind not in ('latihan', 'evaluasi', 'harian') or p_total is null or p_total < 1 or p_total > 100 or p_correct is null or p_correct < 0 or p_correct > p_total
     or not (p_path ~ '^/kelas/[a-z0-9-]+/materi/[a-z0-9-]+' or p_path ~ '^/mastering-(penjumlahan-pengurangan|perkalian-pembagian)/level-[1-3]$')
     or length(p_path) > 200 then
    return jsonb_build_object('error', 'invalid');
  end if;
  if (select count(*) from bsk.results where account_id = a.id and created_at > now() - interval '1 day') >= 300 then
    return jsonb_build_object('error', 'limit');
  end if;
  insert into bsk.results (account_id, path, chapter_title, kind, part, correct, total)
  values (a.id, left(p_path, 200), left(coalesce(p_title, ''), 160), p_kind, left(coalesce(p_part, ''), 120), p_correct, p_total);
  return jsonb_build_object('ok', true);
end $$;
