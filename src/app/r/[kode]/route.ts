import { NextResponse, type NextRequest } from "next/server";
import { affiliateTarget } from "@/lib/affiliate";
import { authEnabled, rpc } from "@/lib/supabase-rpc";

/** Link affiliate: catat klik, lalu teruskan ke halaman penjualan dengan kode affiliate di UTM. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  const raw = kode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
  let code: string | null = null;
  if (authEnabled && raw.length >= 4) code = await rpc<string | null>("bsk_affiliate_click", { p_code: raw }).catch(() => null);
  const res = NextResponse.redirect(affiliateTarget(code), 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
