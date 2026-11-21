import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, sessionFor } from "@/lib/supabase-rpc";

export async function GET(request: NextRequest) {
  // hasCookie: ada kuki sesi (sah atau tidak). Dipakai agar pixel iklan tidak berjalan bila status masuk tidak pasti.
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!authEnabled) return NextResponse.json({ enabled: false, session: null, hasCookie: Boolean(cookie) });
  const session = await sessionFor(cookie, true).catch(() => null);
  return NextResponse.json({ enabled: true, session, hasCookie: Boolean(cookie) }, { headers: { "Cache-Control": "no-store" } });
}
