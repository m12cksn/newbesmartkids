import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { syncAffiliateOrders } from "@/lib/affiliate-sync";
import { authEnabled, RpcError } from "@/lib/supabase-rpc";

const noStore = { "Cache-Control": "no-store" };

/** Jadwal harian Vercel (Authorization: Bearer CRON_SECRET). */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET, key = process.env.AFFILIATE_SYNC_KEY;
  if (!authEnabled || !secret || !key || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: noStore });
  try { return NextResponse.json(await syncAffiliateOrders({ key }), { headers: noStore }); }
  catch { return NextResponse.json({ error: "server" }, { status: 502, headers: noStore }); }
}

/** Tombol "Sinkronkan pesanan" di halaman admin. */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!authEnabled || !token) return NextResponse.json({ error: "not_admin" }, { status: 403, headers: noStore });
  try { return NextResponse.json(await syncAffiliateOrders({ token }), { headers: noStore }); }
  catch (e) { const s = e instanceof RpcError ? e.status : 502; return NextResponse.json({ error: s === 403 ? "not_admin" : "server" }, { status: s, headers: noStore }); }
}
