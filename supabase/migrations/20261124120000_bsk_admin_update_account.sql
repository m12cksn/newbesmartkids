-- Admin dapat memperbaiki nama, username, nomor WhatsApp dan catatan akun siswa (misalnya salah ketik).
-- PIN, paket dan sesi tidak berubah; username baru langsung dipakai untuk masuk berikutnya.
create or replace function public.bsk_admin_update_account(p_token text, p_account uuid, p_username text, p_display_name text, p_phone text, p_note text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_user text := lower(trim(p_username));
begin
  perform bsk.require_admin(p_token);
  if not exists (select 1 from bsk.accounts where id = p_account) then return jsonb_build_object('error', 'not_found'); end if;
  if v_user !~ '^[a-z0-9._-]{3,32}$' then return jsonb_build_object('error', 'bad_username'); end if;
  if exists (select 1 from bsk.accounts where username = v_user and id <> p_account) then return jsonb_build_object('error', 'taken'); end if;
  update bsk.accounts set username = v_user, display_name = left(coalesce(trim(p_display_name), ''), 80),
    phone = left(coalesce(trim(p_phone), ''), 30), note = left(coalesce(trim(p_note), ''), 200)
  where id = p_account;
  return (select bsk.account_json(a) from bsk.accounts a where a.id = p_account);
end $$;
revoke all on function public.bsk_admin_update_account(text, uuid, text, text, text, text) from public;
grant execute on function public.bsk_admin_update_account(text, uuid, text, text, text, text) to anon, authenticated;
