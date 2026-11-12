import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, forgetSession, rpc } from "@/lib/supabase-rpc";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && authEnabled) { forgetSession(token); await rpc("bsk_logout", { p_token: token }).catch(() => null); }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
