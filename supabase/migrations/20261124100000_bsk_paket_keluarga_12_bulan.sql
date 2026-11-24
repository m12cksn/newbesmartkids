-- Paket Keluarga (paket 'semua') kini aktif 12 bulan, sama dengan halaman Scalev.
-- Hanya mengubah pemberian paket berikutnya; hak akses yang sudah ada tidak diubah.
create or replace function bsk.grant_package(p_account uuid, p_package text, p_class integer)
returns void language plpgsql set search_path = '' as $$
declare v_from timestamptz;
begin
  if p_package not in ('kelas', 'semua') then raise exception 'bad_package'; end if;
  if p_package = 'kelas' and (p_class is null or p_class not between 1 and 12) then raise exception 'bad_class'; end if;
  select max(expires_at) into v_from from bsk.entitlements
    where account_id = p_account and package = p_package and class_id is not distinct from (case when p_package = 'kelas' then p_class end) and expires_at > now();
  v_from := greatest(coalesce(v_from, now()), now());
  insert into bsk.entitlements (account_id, package, class_id, starts_at, expires_at)
  values (p_account, p_package, case when p_package = 'kelas' then p_class end, v_from, v_from + interval '12 months');
end $$;
