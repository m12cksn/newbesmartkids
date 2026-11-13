import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, rpc } from "@/lib/supabase-rpc";

/** Pemanasan: dipanggil saat halaman masuk dibuka agar fungsi dan koneksi ke database sudah siap. */
export async function GET() {
  if (authEnabled) await rpc("bsk_session", { p_token: "warmup" }).catch(() => null);
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!authEnabled) return NextResponse.json({ error: "disabled" }, { status: 503 });
  const body = (await request.json().catch(() => ({}))) as { username?: unknown; pin?: unknown };
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase().slice(0, 32) : "";
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";
  if (!username || !/^\d{6}$/.test(pin)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const r = await rpc<{ token?: string; role?: string; error?: string; until?: string }>("bsk_login", { p_username: username, p_pin: pin, p_user_agent: request.headers.get("user-agent") ?? "" });
    if (!r.token) return NextResponse.json({ error: r.error ?? "invalid", until: r.until }, { status: r.error === "locked" ? 429 : 401 });
    const res = NextResponse.json({ ok: true, role: r.role });
    res.cookies.set(SESSION_COOKIE, r.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch {
    return NextResponse.json({ error: "server" }, { status: 502 });
  }
}
