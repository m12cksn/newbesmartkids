-- Komisi affiliate menjadi nominal tetap: Rp19.900 per paket satu jenjang, Rp34.900 per Paket Keluarga.
-- 'amount' dari server = harga produk sebelum diskon; harga >= Rp129.000 dianggap Paket Keluarga.
/** Sinkronisasi pesanan Scalev. Dipanggil server dengan kunci sinkronisasi (atau admin).
 *  p_orders: [{orderId, code, amount, paidAt, paid, buyerPhone}] */
create or replace function public.bsk_affiliate_record(p_key text, p_token text, p_orders jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare o jsonb; f bsk.affiliates; v_new int := 0; v_void int := 0; v_skip int := 0; v_amount int; v_hash text;
begin
  select value into v_hash from bsk.settings where key = 'affiliate_sync_key_hash';
  if not coalesce((v_hash is not null and coalesce(p_key, '') <> '' and bsk.hash_token(p_key) = v_hash)
      or (coalesce(p_token, '') <> '' and coalesce((bsk.session_account(p_token)).role = 'admin', false)), false) then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  for o in select * from jsonb_array_elements(coalesce(p_orders, '[]'::jsonb)) loop
    select * into f from bsk.affiliates where code = upper(coalesce(o->>'code', ''));
    if not found then v_skip := v_skip + 1; continue; end if;
    if coalesce((o->>'paid')::boolean, false) then
      -- Membeli lewat link sendiri tidak mendapat komisi.
      if bsk.norm_phone(o->>'buyerPhone') = f.phone then v_skip := v_skip + 1; continue; end if;
      v_amount := case when coalesce((o->>'amount')::numeric, 0) <= 0 then 0 when (o->>'amount')::numeric >= 129000 then 34900 else 19900 end;
      insert into bsk.affiliate_commissions (order_id, affiliate_id, order_amount, amount, paid_at)
      values (o->>'orderId', f.account_id, greatest(coalesce((o->>'amount')::numeric, 0), 0)::int, v_amount, coalesce((o->>'paidAt')::timestamptz, now()))
      on conflict (order_id) do nothing;
      if found then v_new := v_new + 1; end if;
    else
      update bsk.affiliate_commissions set status = 'void', void_reason = 'Pesanan dibatalkan'
      where order_id = o->>'orderId' and status = 'pending' and payout_id is null;
      if found then v_void := v_void + 1; end if;
    end if;
  end loop;
  insert into bsk.settings (key, value) values ('affiliate_last_sync', now()::text) on conflict (key) do update set value = excluded.value;
  return jsonb_build_object('new', v_new, 'void', v_void, 'skipped', v_skip);
end $$;
