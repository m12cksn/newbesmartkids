import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, rpc } from "@/lib/supabase-rpc";
import type { ReportData } from "@/lib/report";

const noStore = { "Cache-Control": "no-store" };

/** Laporan akun sendiri dan status tautan orang tua. */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!authEnabled || !token) return NextResponse.json({ error: "session" }, { status: 401, headers: noStore });
  try {
    const [report, link] = await Promise.all([rpc<ReportData | null>("bsk_my_report", { p_token: token }), rpc<{ expiresAt: string } | null>("bsk_report_status", { p_token: token })]);
    if (!report) return NextResponse.json({ error: "session" }, { status: 401, headers: noStore });
    return NextResponse.json({ report, link }, { headers: noStore });
  } catch { return NextResponse.json({ error: "server" }, { status: 502, headers: noStore }); }
}

/** Buat tautan baru (tautan lama tidak berlaku) atau cabut tautan. */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!authEnabled || !token) return NextResponse.json({ error: "session" }, { status: 401 });
  const b = (await request.json().catch(() => ({}))) as { action?: unknown };
  try {
    if (b.action === "link") return NextResponse.json(await rpc("bsk_report_link", { p_token: token }), { headers: noStore });
    if (b.action === "revoke") return NextResponse.json(await rpc("bsk_report_revoke", { p_token: token }), { headers: noStore });
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  } catch { return NextResponse.json({ error: "server" }, { status: 502 }); }
}
