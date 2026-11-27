import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { syncIfStale } from "@/lib/affiliate-sync";
import { authEnabled, rpc } from "@/lib/supabase-rpc";

const noStore = { "Cache-Control": "no-store" };
const str = (v: unknown, max = 80) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const wallet = (b: Record<string, unknown>) => ({ p_wallet_type: str(b.walletType, 20), p_wallet_number: str(b.walletNumber, 30), p_wallet_name: str(b.walletName) });

/** Dasbor affiliate milik akun yang sedang masuk. */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!authEnabled || !token) return NextResponse.json({ error: "session" }, { status: 401, headers: noStore });
  try {
    await syncIfStale();
    const me = await rpc<Record<string, unknown>>("bsk_affiliate_me", { p_token: token });
    if (me?.error) return NextResponse.json(me, { status: 401, headers: noStore });
    return NextResponse.json(me, { headers: noStore });
  } catch { return NextResponse.json({ error: "server" }, { status: 502, headers: noStore }); }
}

export async function POST(request: NextRequest) {
  if (!authEnabled) return NextResponse.json({ error: "disabled" }, { status: 503 });
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    if (b.action === "register") {
      // Pendaftaran terbuka untuk siapa saja; akun baru langsung masuk.
      const r = await rpc<{ error?: string; username?: string; pin?: string; code?: string; token?: string }>("bsk_affiliate_register", {
        p_name: str(b.name), p_phone: str(b.phone, 30), ...wallet(b), p_user_agent: request.headers.get("user-agent") ?? "" });
      if (r.error || !r.token) return NextResponse.json({ error: r.error ?? "server" }, { status: 400, headers: noStore });
      const res = NextResponse.json({ username: r.username, pin: r.pin, code: r.code }, { headers: noStore });
      res.cookies.set(SESSION_COOKIE, r.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
      return res;
    }
    if (!token) return NextResponse.json({ error: "session" }, { status: 401 });
    if (b.action === "join") return NextResponse.json(await rpc("bsk_affiliate_join", { p_token: token, p_name: str(b.name), p_phone: str(b.phone, 30), ...wallet(b) }), { headers: noStore });
    if (b.action === "wallet") return NextResponse.json(await rpc("bsk_affiliate_update_wallet", { p_token: token, ...wallet(b) }), { headers: noStore });
    if (b.action === "withdraw") return NextResponse.json(await rpc("bsk_affiliate_withdraw", { p_token: token }), { headers: noStore });
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  } catch { return NextResponse.json({ error: "server" }, { status: 502 }); }
}
