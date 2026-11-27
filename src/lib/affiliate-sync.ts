import { toSyncOrders, type ScalevOrder, type SyncResult } from "./affiliate";
import { rpc } from "./supabase-rpc";

/** Sinkronisasi pesanan Scalev bertanda affiliate (utm_source=affiliate) ke komisi BeSmartKids.
 *  Hanya dijalankan di server. Butuh SCALEV_API_KEY (kunci Scalev dengan izin order:list). */
export const syncConfigured = () => Boolean(process.env.SCALEV_API_KEY);

export async function syncAffiliateOrders(auth: { key?: string; token?: string }, maxPages = 8): Promise<SyncResult> {
  const apiKey = process.env.SCALEV_API_KEY;
  if (!apiKey) return { error: "not_configured" };
  const base = (process.env.SCALEV_API_BASE_URL || "https://api.scalev.com").replace(/\/$/, "");
  const orders: ScalevOrder[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < maxPages; page++) {
    const u = new URL(`${base}/v3/orders`);
    u.searchParams.set("utm_source", "affiliate"); u.searchParams.set("page_size", "25");
    u.searchParams.set("columns", "order_id,gross_revenue,payment_status,status,metadata,customer,confirmed_time,transfer_time,draft_time");
    if (cursor) u.searchParams.set("next_cursor", cursor);
    const r = await fetch(u, { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" });
    if (!r.ok) return { error: `scalev_${r.status}` };
    const j = (await r.json()) as { data?: ScalevOrder[]; has_next?: boolean; next_cursor?: string | null };
    orders.push(...(j.data ?? []));
    if (!j.has_next || !j.next_cursor) break;
    cursor = j.next_cursor;
  }
  const list = toSyncOrders(orders);
  const res = await rpc<SyncResult>("bsk_affiliate_record", { p_key: auth.key ?? null, p_token: auth.token ?? null, p_orders: list });
  return { checked: list.length, ...res };
}

/** Sinkron otomatis saat dasbor dibuka, paling sering sekali per 30 menit. */
export async function syncIfStale(minutes = 30) {
  const key = process.env.AFFILIATE_SYNC_KEY;
  if (!key || !syncConfigured()) return;
  const last = await rpc<string | null>("bsk_affiliate_last_sync", {}).catch(() => null);
  if (last && Date.now() - new Date(last).getTime() < minutes * 60_000) return;
  await syncAffiliateOrders({ key }).catch(() => null);
}
