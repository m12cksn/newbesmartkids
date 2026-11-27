-- BeSmartKids: program affiliate.
-- Siapa saja bisa mendaftar dan mendapat kode. Link /r/KODE meneruskan pengunjung ke halaman
-- penjualan Scalev dengan utm_source=affiliate&utm_campaign=KODE. Sinkronisasi server membaca
-- pesanan Scalev yang lunas dan mencatat komisi 16%. Komisi bisa dicairkan 3 hari setelah
-- pesanan lunas, minimal Rp50.000, ke e-wallet. Admin menandai pencairan sudah dibayar.

create table bsk.affiliates (
  account_id uuid primary key references bsk.accounts(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{4,16}$'),
  full_name text not null check (length(full_name) between 2 and 80),
  phone text not null check (phone ~ '^62[0-9]{8,13}$'),
  wallet_type text not null check (wallet_type in ('DANA', 'OVO', 'GoPay', 'ShopeePay', 'LinkAja')),
  wallet_number text not null check (wallet_number ~ '^[0-9]{8,16}$'),
  wallet_name text not null check (length(wallet_name) between 2 and 80),
  status text not null default 'active' check (status in ('active', 'blocked')),
  created_at timestamptz not null default now()
);
create index on bsk.affiliates (phone);

create table bsk.affiliate_clicks (
  affiliate_id uuid not null references bsk.affiliates(account_id) on delete cascade,
  day date not null,
  clicks int not null default 0,
  primary key (affiliate_id, day)
);

create table bsk.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references bsk.affiliates(account_id) on delete cascade,
  amount int not null check (amount > 0),
  wallet text not null,
  status text not null default 'requested' check (status in ('requested', 'paid', 'rejected')),
  note text not null default '',
  requested_at timestamptz not null default now(),
  decided_at timestamptz
);
create index on bsk.affiliate_payouts (affiliate_id);

create table bsk.affiliate_commissions (
  order_id text primary key,
  affiliate_id uuid not null references bsk.affiliates(account_id) on delete cascade,
  order_amount int not null check (order_amount >= 0),
  amount int not null check (amount >= 0),
  paid_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'void')),
  void_reason text not null default '',
  payout_id uuid references bsk.affiliate_payouts(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on bsk.affiliate_commissions (affiliate_id);

create table bsk.settings (key text primary key, value text not null);

alter table bsk.affiliates enable row level security;
alter table bsk.affiliate_clicks enable row level security;
alter table bsk.affiliate_payouts enable row level security;
alter table bsk.affiliate_commissions enable row level security;
alter table bsk.settings enable row level security;
revoke all on all tables in schema bsk from public, anon, authenticated;

-- ---------- Bantuan internal ----------
create or replace function bsk.norm_phone(p text) returns text
language sql immutable set search_path = '' as $$
  select case when d like '0%' then '62' || substr(d, 2) when d like '8%' then '62' || d else d end
  from (select regexp_replace(coalesce(p, ''), '[^0-9]', '', 'g') as d) x;
$$;

create or replace function bsk.new_affiliate_code(p_name text) returns text
language plpgsql volatile set search_path = '' as $$
declare v_base text := left(upper(regexp_replace(coalesce(p_name, ''), '[^A-Za-z]', '', 'g')), 8); v_code text;
begin
  if length(v_base) < 3 then v_base := 'BSK'; end if;
  for i in 1..20 loop
    v_code := v_base || lpad((floor(random() * 1000))::int::text, 3, '0');
    if not exists (select 1 from bsk.affiliates where code = v_code) then return v_code; end if;
  end loop;
  return v_base || upper(encode(extensions.gen_random_bytes(3), 'hex'));
end $$;

-- Saldo: tertahan (lunas < 3 hari), siap cair (>= 3 hari, belum diajukan), diajukan, dibayar.
create or replace function bsk.affiliate_json(f bsk.affiliates) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'code', f.code, 'fullName', f.full_name, 'phone', f.phone, 'walletType', f.wallet_type, 'walletNumber', f.wallet_number,
    'walletName', f.wallet_name, 'status', f.status, 'createdAt', f.created_at,
    'clicks', coalesce((select sum(clicks) from bsk.affiliate_clicks c where c.affiliate_id = f.account_id), 0),
    'clicks30', coalesce((select sum(clicks) from bsk.affiliate_clicks c where c.affiliate_id = f.account_id and c.day > current_date - 30), 0),
    'sales', (select count(*) from bsk.affiliate_commissions m where m.affiliate_id = f.account_id and m.status = 'pending'),
    'held', coalesce((select sum(amount) from bsk.affiliate_commissions m where m.affiliate_id = f.account_id and m.status = 'pending' and m.payout_id is null and m.paid_at > now() - interval '3 days'), 0),
    'available', coalesce((select sum(amount) from bsk.affiliate_commissions m where m.affiliate_id = f.account_id and m.status = 'pending' and m.payout_id is null and m.paid_at <= now() - interval '3 days'), 0),
    'requested', coalesce((select sum(amount) from bsk.affiliate_payouts p where p.affiliate_id = f.account_id and p.status = 'requested'), 0),
    'paid', coalesce((select sum(amount) from bsk.affiliate_payouts p where p.affiliate_id = f.account_id and p.status = 'paid'), 0));
$$;

create or replace function bsk.affiliate_detail(f bsk.affiliates) returns jsonb
language sql stable set search_path = '' as $$
  select bsk.affiliate_json(f) || jsonb_build_object(
    'commissions', coalesce((select jsonb_agg(jsonb_build_object('orderId', right(m.order_id, 6), 'orderAmount', m.order_amount, 'amount', m.amount, 'paidAt', m.paid_at,
        'state', case when m.status = 'void' then 'void' when m.payout_id is not null then 'payout' when m.paid_at > now() - interval '3 days' then 'held' else 'available' end,
        'availableAt', m.paid_at + interval '3 days') order by m.paid_at desc)
      from (select * from bsk.affiliate_commissions where affiliate_id = f.account_id order by paid_at desc limit 50) m), '[]'::jsonb),
    'payouts', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'amount', p.amount, 'wallet', p.wallet, 'status', p.status, 'note', p.note, 'requestedAt', p.requested_at, 'decidedAt', p.decided_at) order by p.requested_at desc)
      from (select * from bsk.affiliate_payouts where affiliate_id = f.account_id order by requested_at desc limit 20) p), '[]'::jsonb),
    'lastSync', (select value from bsk.settings where key = 'affiliate_last_sync'));
$$;

create or replace function bsk.check_wallet(p_type text, p_number text, p_name text) returns text
language sql immutable set search_path = '' as $$
  select case
    when p_type not in ('DANA', 'OVO', 'GoPay', 'ShopeePay', 'LinkAja') then 'bad_wallet'
    when bsk.norm_phone(p_number) !~ '^62[0-9]{8,13}$' and regexp_replace(coalesce(p_number, ''), '[^0-9]', '', 'g') !~ '^[0-9]{8,16}$' then 'bad_wallet_number'
    when length(trim(coalesce(p_name, ''))) < 2 then 'bad_wallet_name'
  end;
$$;

-- ---------- Fungsi publik ----------
/** Pendaftaran terbuka: membuat akun (tanpa paket) + data affiliate, lalu langsung masuk. */
create or replace function public.bsk_affiliate_register(p_name text, p_phone text, p_wallet_type text, p_wallet_number text, p_wallet_name text, p_user_agent text default '')
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_name text := left(trim(coalesce(p_name, '')), 80); v_phone text := bsk.norm_phone(p_phone); v_err text;
  v_base text; v_user text; v_pin text := bsk.new_pin(); v_id uuid; v_code text; v_token text;
begin
  if length(v_name) < 2 then return jsonb_build_object('error', 'bad_name'); end if;
  if v_phone !~ '^62[0-9]{8,13}$' then return jsonb_build_object('error', 'bad_phone'); end if;
  v_err := bsk.check_wallet(p_wallet_type, p_wallet_number, p_wallet_name); if v_err is not null then return jsonb_build_object('error', v_err); end if;
  if exists (select 1 from bsk.affiliates where phone = v_phone) then return jsonb_build_object('error', 'phone_used'); end if;
  -- Batas kasar terhadap pendaftaran otomatis.
  if (select count(*) from bsk.affiliates where created_at > now() - interval '1 hour') >= 40 then return jsonb_build_object('error', 'busy'); end if;
  v_base := left(lower(regexp_replace(v_name, '[^A-Za-z0-9]', '', 'g')), 10); if length(v_base) < 3 then v_base := v_base || 'aff'; end if;
  for i in 1..20 loop
    v_user := v_base || lpad((floor(random() * 1000))::int::text, 3, '0');
    exit when not exists (select 1 from bsk.accounts where username = v_user);
  end loop;
  insert into bsk.accounts (username, pin_hash, display_name, phone, note)
  values (v_user, extensions.crypt(v_pin, extensions.gen_salt('bf', 10)), v_name, v_phone, 'Affiliate')
  returning id into v_id;
  v_code := bsk.new_affiliate_code(v_name);
  insert into bsk.affiliates (account_id, code, full_name, phone, wallet_type, wallet_number, wallet_name)
  values (v_id, v_code, v_name, v_phone, p_wallet_type, regexp_replace(p_wallet_number, '[^0-9]', '', 'g'), left(trim(p_wallet_name), 80));
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into bsk.sessions (account_id, token_hash, user_agent) values (v_id, bsk.hash_token(v_token), left(coalesce(p_user_agent, ''), 300));
  return jsonb_build_object('username', v_user, 'pin', v_pin, 'code', v_code, 'token', v_token);
end $$;

/** Akun yang sudah ada (misalnya pembeli) mengaktifkan affiliate. */
create or replace function public.bsk_affiliate_join(p_token text, p_name text, p_phone text, p_wallet_type text, p_wallet_number text, p_wallet_name text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts; v_phone text := bsk.norm_phone(p_phone); v_err text; v_name text := left(trim(coalesce(p_name, '')), 80);
begin
  a := bsk.session_account(p_token); if a.id is null then return jsonb_build_object('error', 'session'); end if;
  if exists (select 1 from bsk.affiliates where account_id = a.id) then return jsonb_build_object('error', 'exists'); end if;
  if length(v_name) < 2 then return jsonb_build_object('error', 'bad_name'); end if;
  if v_phone !~ '^62[0-9]{8,13}$' then return jsonb_build_object('error', 'bad_phone'); end if;
  v_err := bsk.check_wallet(p_wallet_type, p_wallet_number, p_wallet_name); if v_err is not null then return jsonb_build_object('error', v_err); end if;
  if exists (select 1 from bsk.affiliates where phone = v_phone) then return jsonb_build_object('error', 'phone_used'); end if;
  insert into bsk.affiliates (account_id, code, full_name, phone, wallet_type, wallet_number, wallet_name)
  values (a.id, bsk.new_affiliate_code(v_name), v_name, v_phone, p_wallet_type, regexp_replace(p_wallet_number, '[^0-9]', '', 'g'), left(trim(p_wallet_name), 80));
  return (select bsk.affiliate_detail(f) from bsk.affiliates f where f.account_id = a.id);
end $$;

create or replace function public.bsk_affiliate_me(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts;
begin
  a := bsk.session_account(p_token); if a.id is null then return jsonb_build_object('error', 'session'); end if;
  return coalesce((select bsk.affiliate_detail(f) from bsk.affiliates f where f.account_id = a.id), jsonb_build_object('none', true, 'displayName', a.display_name, 'phone', a.phone));
end $$;

create or replace function public.bsk_affiliate_update_wallet(p_token text, p_wallet_type text, p_wallet_number text, p_wallet_name text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts; v_err text;
begin
  a := bsk.session_account(p_token); if a.id is null then return jsonb_build_object('error', 'session'); end if;
  v_err := bsk.check_wallet(p_wallet_type, p_wallet_number, p_wallet_name); if v_err is not null then return jsonb_build_object('error', v_err); end if;
  update bsk.affiliates set wallet_type = p_wallet_type, wallet_number = regexp_replace(p_wallet_number, '[^0-9]', '', 'g'), wallet_name = left(trim(p_wallet_name), 80) where account_id = a.id;
  if not found then return jsonb_build_object('error', 'none'); end if;
  return (select bsk.affiliate_detail(f) from bsk.affiliates f where f.account_id = a.id);
end $$;

/** Ajukan pencairan semua komisi yang siap cair (minimal Rp50.000, satu pengajuan terbuka). */
create or replace function public.bsk_affiliate_withdraw(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare a bsk.accounts; f bsk.affiliates; v_sum int; v_id uuid;
begin
  a := bsk.session_account(p_token); if a.id is null then return jsonb_build_object('error', 'session'); end if;
  select * into f from bsk.affiliates where account_id = a.id for update; if not found then return jsonb_build_object('error', 'none'); end if;
  if f.status <> 'active' then return jsonb_build_object('error', 'blocked'); end if;
  if exists (select 1 from bsk.affiliate_payouts where affiliate_id = a.id and status = 'requested') then return jsonb_build_object('error', 'open'); end if;
  select coalesce(sum(amount), 0) into v_sum from bsk.affiliate_commissions where affiliate_id = a.id and status = 'pending' and payout_id is null and paid_at <= now() - interval '3 days';
  if v_sum < 50000 then return jsonb_build_object('error', 'min', 'available', v_sum); end if;
  insert into bsk.affiliate_payouts (affiliate_id, amount, wallet) values (a.id, v_sum, f.wallet_type || ' ' || f.wallet_number || ' a.n. ' || f.wallet_name) returning id into v_id;
  update bsk.affiliate_commissions set payout_id = v_id where affiliate_id = a.id and status = 'pending' and payout_id is null and paid_at <= now() - interval '3 days';
  return (select bsk.affiliate_detail(x) from bsk.affiliates x where x.account_id = a.id);
end $$;

/** Dipanggil oleh /r/KODE. Mengembalikan kode yang sah (huruf besar) atau null. */
create or replace function public.bsk_affiliate_click(p_code text)
returns text language plpgsql volatile security definer set search_path = '' as $$
declare f bsk.affiliates;
begin
  select * into f from bsk.affiliates where code = upper(trim(coalesce(p_code, ''))) and status = 'active';
  if not found then return null; end if;
  insert into bsk.affiliate_clicks (affiliate_id, day, clicks) values (f.account_id, (now() at time zone 'Asia/Jakarta')::date, 1)
  on conflict (affiliate_id, day) do update set clicks = bsk.affiliate_clicks.clicks + 1;
  return f.code;
end $$;

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
      v_amount := floor(greatest(coalesce((o->>'amount')::numeric, 0), 0) * 16 / 100)::int;
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

create or replace function public.bsk_affiliate_last_sync()
returns text language sql stable security definer set search_path = '' as $$
  select value from bsk.settings where key = 'affiliate_last_sync';
$$;

create or replace function public.bsk_admin_affiliates(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform bsk.require_admin(p_token);
  return jsonb_build_object(
    'affiliates', coalesce((select jsonb_agg(bsk.affiliate_json(f) || jsonb_build_object('id', f.account_id, 'username', a.username) order by f.created_at desc)
      from bsk.affiliates f join bsk.accounts a on a.id = f.account_id), '[]'::jsonb),
    'payouts', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'amount', p.amount, 'wallet', p.wallet, 'status', p.status, 'note', p.note, 'requestedAt', p.requested_at, 'decidedAt', p.decided_at,
        'code', f.code, 'fullName', f.full_name, 'phone', f.phone) order by p.status = 'requested' desc, p.requested_at desc)
      from (select * from bsk.affiliate_payouts order by requested_at desc limit 100) p join bsk.affiliates f on f.account_id = p.affiliate_id), '[]'::jsonb),
    'lastSync', (select value from bsk.settings where key = 'affiliate_last_sync'));
end $$;

create or replace function public.bsk_admin_payout_decide(p_token text, p_payout uuid, p_status text, p_note text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform bsk.require_admin(p_token);
  if p_status not in ('paid', 'rejected') then return jsonb_build_object('error', 'bad_status'); end if;
  update bsk.affiliate_payouts set status = p_status, note = left(coalesce(p_note, ''), 200), decided_at = now() where id = p_payout and status = 'requested';
  if not found then return jsonb_build_object('error', 'not_found'); end if;
  -- Ditolak: komisi kembali menjadi siap cair.
  if p_status = 'rejected' then update bsk.affiliate_commissions set payout_id = null where payout_id = p_payout; end if;
  return public.bsk_admin_affiliates(p_token);
end $$;

create or replace function public.bsk_admin_affiliate_status(p_token text, p_account uuid, p_status text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform bsk.require_admin(p_token);
  if p_status not in ('active', 'blocked') then return jsonb_build_object('error', 'bad_status'); end if;
  update bsk.affiliates set status = p_status where account_id = p_account;
  return public.bsk_admin_affiliates(p_token);
end $$;

revoke all on all functions in schema bsk from public, anon, authenticated;
revoke all on function public.bsk_affiliate_register(text, text, text, text, text, text), public.bsk_affiliate_join(text, text, text, text, text, text),
  public.bsk_affiliate_me(text), public.bsk_affiliate_update_wallet(text, text, text, text), public.bsk_affiliate_withdraw(text), public.bsk_affiliate_click(text),
  public.bsk_affiliate_record(text, text, jsonb), public.bsk_affiliate_last_sync(), public.bsk_admin_affiliates(text), public.bsk_admin_payout_decide(text, uuid, text, text),
  public.bsk_admin_affiliate_status(text, uuid, text) from public;
grant execute on function public.bsk_affiliate_register(text, text, text, text, text, text), public.bsk_affiliate_join(text, text, text, text, text, text),
  public.bsk_affiliate_me(text), public.bsk_affiliate_update_wallet(text, text, text, text), public.bsk_affiliate_withdraw(text), public.bsk_affiliate_click(text),
  public.bsk_affiliate_record(text, text, jsonb), public.bsk_affiliate_last_sync(), public.bsk_admin_affiliates(text), public.bsk_admin_payout_decide(text, uuid, text, text),
  public.bsk_admin_affiliate_status(text, uuid, text) to anon, authenticated;
