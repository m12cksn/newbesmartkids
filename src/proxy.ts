import { NextResponse, type NextRequest } from "next/server";
import { canOpen, requirementFor, SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, sessionFor } from "@/lib/supabase-rpc";

export async function proxy(request: NextRequest) {
  if (!authEnabled) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  const req = requirementFor(pathname);
  if (req.kind === "public" || (req.kind === "class" && req.free)) return NextResponse.next();
  let session = null;
  try { session = await sessionFor(request.cookies.get(SESSION_COOKIE)?.value); }
  catch { /* Database tidak dapat dihubungi: anggap belum masuk. */ }
  if (canOpen(req, session)) return NextResponse.next();
  const to = new URL("/masuk", request.url);
  to.searchParams.set("lanjut", pathname + search);
  if (session) to.searchParams.set("alasan", req.kind === "admin" ? "admin" : req.kind === "teacher" ? "guru" : "paket");
  if (req.kind === "class") to.searchParams.set("kelas", String(req.classId));
  return NextResponse.redirect(to);
}

export const config = {
  matcher: ["/kelas/:slug/:path+", "/mastering-penjumlahan-pengurangan/:path*", "/mastering-perkalian-pembagian/:path*", "/admin/:path*", "/guru/:path*"],
};
