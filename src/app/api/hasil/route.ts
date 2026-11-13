import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, rpc } from "@/lib/supabase-rpc";

export type SavedResult = { path: string; title: string; kind: "latihan" | "evaluasi"; part: string; correct: number; total: number; score: number; at: string };
const noStore = { "Cache-Control": "no-store" };

/** Riwayat nilai akun yang sedang masuk. */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!authEnabled || !token) return NextResponse.json({ results: null }, { headers: noStore });
  try {
    const results = await rpc<SavedResult[] | null>("bsk_my_results", { p_token: token });
    return NextResponse.json({ results }, { headers: noStore });
  } catch { return NextResponse.json({ error: "server" }, { status: 502, headers: noStore }); }
}

/** Simpan satu hasil latihan atau evaluasi. Tanpa akun, permintaan diabaikan. */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!authEnabled || !token) return NextResponse.json({ error: "session" }, { status: 401 });
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
  const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : -1);
  const kind = b.kind === "evaluasi" ? "evaluasi" : b.kind === "latihan" ? "latihan" : "";
  const path = str(b.path, 200), correct = int(b.correct), total = int(b.total);
  if (!kind || !/^\/kelas\/[a-z0-9-]+\/materi\/[a-z0-9-]+/.test(path) || total < 1 || total > 100 || correct < 0 || correct > total) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const r = await rpc<{ ok?: boolean; error?: string }>("bsk_save_result", { p_token: token, p_path: path, p_title: str(b.title, 160), p_kind: kind, p_part: str(b.part, 120), p_correct: correct, p_total: total });
    return NextResponse.json(r, { status: r.ok ? 200 : r.error === "session" ? 401 : r.error === "limit" ? 429 : 400 });
  } catch { return NextResponse.json({ error: "server" }, { status: 502 }); }
}
