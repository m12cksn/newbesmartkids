import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, rpc, RpcError } from "@/lib/supabase-rpc";

const noStore = { "Cache-Control": "no-store" };

/** Rekap kelas sekolah untuk guru, dan laporan seorang siswa di kelasnya. */
export async function POST(request: NextRequest) {
  if (!authEnabled) return NextResponse.json({ error: "disabled" }, { status: 503 });
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "not_teacher" }, { status: 403 });
  const b = (await request.json().catch(() => ({}))) as { action?: unknown; account?: unknown };
  try {
    if (b.action === "overview") return NextResponse.json(await rpc("bsk_teacher_overview", { p_token: token }), { headers: noStore });
    if (b.action === "report") {
      const id = typeof b.account === "string" && /^[0-9a-f-]{36}$/i.test(b.account) ? b.account : null;
      const r = id ? await rpc("bsk_teacher_report", { p_token: token, p_account: id }) : null;
      return r ? NextResponse.json(r, { headers: noStore }) : NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  } catch (e) {
    const status = e instanceof RpcError ? e.status : 502;
    return NextResponse.json({ error: status === 403 ? "not_teacher" : "server" }, { status });
  }
}
