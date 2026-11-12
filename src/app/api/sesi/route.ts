import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, sessionFor } from "@/lib/supabase-rpc";

export async function GET(request: NextRequest) {
  if (!authEnabled) return NextResponse.json({ enabled: false, session: null });
  const session = await sessionFor(request.cookies.get(SESSION_COOKIE)?.value, true).catch(() => null);
  return NextResponse.json({ enabled: true, session }, { headers: { "Cache-Control": "no-store" } });
}
