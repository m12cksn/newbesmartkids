import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { offerById } from "@/lib/packages";
import { authEnabled, rpc, RpcError } from "@/lib/supabase-rpc";

const str = (v: unknown, max = 80) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pkg = (v: unknown) => (v === "semua" ? "semua" : "kelas");
const cls = (v: unknown) => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 12 ? n : null; };

type Created = { error?: string; username: string; pin: string; account: unknown };
const baseName = (s: string) => (s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "").slice(0, 10) || "siswa").padEnd(3, "x");

/** Satu pesanan = beberapa akun dengan paket yang sama (jenjang: beberapa kelas; semua kelas). */
async function createBundle(token: string, b: Record<string, unknown>) {
  const offer = offerById(b.offer);
  if (!offer) return { error: "bad_offer" };
  const buyer = str(b.buyer), phone = str(b.phone, 30), note = str(b.note, 200);
  const names = Array.isArray(b.names) ? b.names.map(x => str(x)).slice(0, offer.accounts) : [];
  const [first, ...rest] = offer.classes === "all" ? [null] : offer.classes;
  for (let attempt = 0; attempt < 3; attempt++) {
    const stem = `${baseName(buyer)}${Math.floor(100 + Math.random() * 900)}`;
    const out: { username: string; pin: string; displayName: string }[] = [];
    for (let i = 0; i < offer.accounts; i++) {
      const displayName = names[i] || (offer.accounts > 1 ? `${buyer} (${i + 1})` : buyer);
      const r = await rpc<Created>("bsk_admin_create", { p_token: token, p_username: `${stem}${String.fromCharCode(97 + i)}`, p_display_name: displayName, p_phone: phone, p_note: note || offer.name, p_package: offer.classes === "all" ? "semua" : "kelas", p_class: first });
      if (r.error === "taken" && i === 0) break; // coba awalan lain
      if (r.error) return { error: r.error, created: out };
      const id = (r.account as { id: string }).id;
      for (const c of rest) await rpc("bsk_admin_extend", { p_token: token, p_account: id, p_package: "kelas", p_class: c });
      out.push({ username: r.username, pin: r.pin, displayName });
    }
    if (out.length === offer.accounts) return { offer: offer.id, created: out };
  }
  return { error: "taken" };
}

export async function POST(request: NextRequest) {
  if (!authEnabled) return NextResponse.json({ error: "disabled" }, { status: 503 });
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "not_admin" }, { status: 403 });
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = str(b.account, 40);
  try {
    switch (b.action) {
      case "bundle": return NextResponse.json(await createBundle(token, b));
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
