import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, rpc, RpcError } from "@/lib/supabase-rpc";

const str = (v: unknown, max = 80) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pkg = (v: unknown) => (v === "semua" ? "semua" : "kelas");
const cls = (v: unknown) => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 12 ? n : null; };
const uuid = (v: unknown) => (typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v) ? v : null);
const list = (v: unknown, max: number, len = 80) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map(x => x.trim().slice(0, len)).filter(Boolean).slice(0, max) : []);

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
      case "role": return NextResponse.json(await rpc("bsk_admin_set_role", { p_token: token, p_account: id, p_role: b.role === "teacher" ? "teacher" : "student" }));
      case "groups": return NextResponse.json(await rpc("bsk_admin_groups", { p_token: token }));
      case "groupSave": return NextResponse.json(await rpc("bsk_admin_group_save", { p_token: token, p_group: uuid(b.group), p_name: str(b.name), p_teacher: uuid(b.teacher), p_class: cls(b.classId) }));
      case "groupDelete": return NextResponse.json(await rpc("bsk_admin_group_delete", { p_token: token, p_group: uuid(b.group) }));
      case "groupAdd": return NextResponse.json(await rpc("bsk_admin_group_add", { p_token: token, p_group: uuid(b.group), p_usernames: list(b.usernames, 200, 32).map(u => u.toLowerCase()) }));
      case "groupRemove": return NextResponse.json(await rpc("bsk_admin_group_remove", { p_token: token, p_group: uuid(b.group), p_account: id }));
      case "bulk": return NextResponse.json(await rpc("bsk_admin_bulk_create", { p_token: token, p_group: uuid(b.group), p_prefix: str(b.prefix, 24).toLowerCase(), p_names: list(b.names, 60), p_package: pkg(b.package), p_class: pkg(b.package) === "kelas" ? cls(b.classId) : null }));
      case "logout": return NextResponse.json(await rpc("bsk_admin_logout_devices", { p_token: token, p_account: id }));
      default: return NextResponse.json({ error: "bad_action" }, { status: 400 });
    }
  } catch (e) {
    const status = e instanceof RpcError ? e.status : 502;
    return NextResponse.json({ error: status === 403 ? "not_admin" : "server" }, { status });
  }
}
