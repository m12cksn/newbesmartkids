import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, rpc, RpcError } from "@/lib/supabase-rpc";

const str = (v: unknown, max = 80) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pkg = (v: unknown) => (v === "semua" ? "semua" : "kelas");
const cls = (v: unknown) => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 12 ? n : null; };

export async function POST(request: NextRequest) {
  if (!authEnabled) return NextResponse.json({ error: "disabled" }, { status: 503 });
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "not_admin" }, { status: 403 });
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = str(b.account, 40);
  try {
    switch (b.action) {
      case "list": return NextResponse.json(await rpc("bsk_admin_list", { p_token: token }));
      case "create": return NextResponse.json(await rpc("bsk_admin_create", { p_token: token, p_username: str(b.username, 32).toLowerCase(), p_display_name: str(b.displayName), p_phone: str(b.phone, 30), p_note: str(b.note, 200), p_package: pkg(b.package), p_class: pkg(b.package) === "kelas" ? cls(b.classId) : null }));
      case "extend": return NextResponse.json(await rpc("bsk_admin_extend", { p_token: token, p_account: id, p_package: pkg(b.package), p_class: pkg(b.package) === "kelas" ? cls(b.classId) : null }));
      case "reset": return NextResponse.json(await rpc("bsk_admin_reset_pin", { p_token: token, p_account: id }));
      case "disable": return NextResponse.json(await rpc("bsk_admin_set_disabled", { p_token: token, p_account: id, p_disabled: b.disabled === true }));
      case "report": return NextResponse.json(await rpc("bsk_admin_report", { p_token: token, p_account: id }));
      case "logout": return NextResponse.json(await rpc("bsk_admin_logout_devices", { p_token: token, p_account: id }));
      default: return NextResponse.json({ error: "bad_action" }, { status: 400 });
    }
  } catch (e) {
    const status = e instanceof RpcError ? e.status : 502;
    return NextResponse.json({ error: status === 403 ? "not_admin" : "server" }, { status });
  }
}
