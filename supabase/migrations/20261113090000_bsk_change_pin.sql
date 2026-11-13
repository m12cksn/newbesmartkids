-- Pengguna (termasuk admin) mengganti PIN sendiri. PIN lama wajib benar;
-- salah PIN lama ikut dihitung dalam batas 5 kali. Perangkat lain dikeluarkan.
create or replace function public.bsk_change_pin(p_token text, p_old text, p_new text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token);
  if a.id is null then return jsonb_build_object('error', 'session'); end if;
  if a.locked_until is not null and a.locked_until > now() then return jsonb_build_object('error', 'locked'); end if;
  if p_new !~ '^\d{6}$' then return jsonb_build_object('error', 'format'); end if;
  if p_old is null or a.pin_hash <> extensions.crypt(p_old, a.pin_hash) then
    update bsk.accounts set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
      locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
    where id = a.id;
    return jsonb_build_object('error', 'wrong');
  end if;
  if p_new = p_old then return jsonb_build_object('error', 'same'); end if;
  update bsk.accounts set pin_hash = extensions.crypt(p_new, extensions.gen_salt('bf', 10)), failed_attempts = 0, locked_until = null where id = a.id;
  delete from bsk.sessions where account_id = a.id and token_hash <> bsk.hash_token(p_token);
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.bsk_change_pin(text, text, text) from public;
grant execute on function public.bsk_change_pin(text, text, text) to anon, authenticated;
