import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, rpc } from "@/lib/supabase-rpc";

export async function POST(request: NextRequest) {
  if (!authEnabled) return NextResponse.json({ error: "disabled" }, { status: 503 });
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "session" }, { status: 401 });
  const b = (await request.json().catch(() => ({}))) as { old?: unknown; pin?: unknown };
  const old = typeof b.old === "string" ? b.old.trim() : "", pin = typeof b.pin === "string" ? b.pin.trim() : "";
  if (!/^\d{6}$/.test(old) || !/^\d{6}$/.test(pin)) return NextResponse.json({ error: "format" }, { status: 400 });
  try {
    const r = await rpc<{ ok?: boolean; error?: string }>("bsk_change_pin", { p_token: token, p_old: old, p_new: pin });
    return NextResponse.json(r, { status: r.ok ? 200 : r.error === "session" ? 401 : r.error === "locked" ? 429 : 400 });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 502 });
  }
}
