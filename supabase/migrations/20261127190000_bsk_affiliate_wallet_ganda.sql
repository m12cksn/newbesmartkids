-- Tanda untuk admin: e-wallet yang sama dipakai affiliate lain. Mencegah satu orang membuka banyak akun affiliate
-- lalu membeli lewat link sendiri. Hanya penanda; pembayaran tetap diputuskan admin.
create or replace function public.bsk_admin_affiliates(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform bsk.require_admin(p_token);
  return jsonb_build_object(
    'affiliates', coalesce((select jsonb_agg(bsk.affiliate_json(f) || jsonb_build_object('id', f.account_id, 'username', a.username,
        'sharedWith', coalesce((select jsonb_agg(o.code order by o.code) from bsk.affiliates o where o.account_id <> f.account_id and o.wallet_number = f.wallet_number), '[]'::jsonb))
        order by f.created_at desc)
      from bsk.affiliates f join bsk.accounts a on a.id = f.account_id), '[]'::jsonb),
    'payouts', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'amount', p.amount, 'wallet', p.wallet, 'status', p.status, 'note', p.note, 'requestedAt', p.requested_at, 'decidedAt', p.decided_at,
        'code', f.code, 'fullName', f.full_name, 'phone', f.phone,
        'sharedWith', coalesce((select jsonb_agg(o.code order by o.code) from bsk.affiliates o where o.account_id <> f.account_id and o.wallet_number = f.wallet_number), '[]'::jsonb))
        order by p.status = 'requested' desc, p.requested_at desc)
      from (select * from bsk.affiliate_payouts order by requested_at desc limit 100) p join bsk.affiliates f on f.account_id = p.affiliate_id), '[]'::jsonb),
    'lastSync', (select value from bsk.settings where key = 'affiliate_last_sync'));
end $$;
