import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BrandMark } from "@/components/home/BrandMark";
import { ReportView } from "@/components/report/ReportView";
import type { ReportData } from "@/lib/report";
import { authEnabled, rpc } from "@/lib/supabase-rpc";

export const metadata: Metadata = { title: "Laporan belajar", robots: { index: false, follow: false }, referrer: "no-referrer" };

async function Report({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  const data = authEnabled && /^[0-9a-f]{24}$/.test(kode) ? await rpc<ReportData | null>("bsk_report_public", { p_code: kode }).catch(() => null) : null;
  if (!data) return <section className="mx-auto max-w-md rounded-md bg-base-100 p-6 text-center"><h1 className="text-xl font-extrabold">Laporan tidak ditemukan</h1>
    <p className="mt-2 text-sm text-base-content/70">Tautan ini sudah tidak berlaku atau salah ketik. Minta anak membuat tautan baru dari halaman Akun saya.</p></section>;
  return <ReportView data={data} links={false} />;
}

/** Laporan baca-saja untuk orang tua, dibuka lewat tautan tanpa login. */
export default function Page({ params }: { params: Promise<{ kode: string }> }) {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 px-4 py-8 text-base-content print:bg-white print:p-0">
    <div className="mx-auto mb-5 flex max-w-4xl items-center justify-between print:hidden"><Link href="/" aria-label="Beranda BeSmartKids"><BrandMark /></Link></div>
    <Suspense fallback={<p className="text-center text-base-content/60">Memuat laporan…</p>}><Report params={params} /></Suspense>
  </main>;
}
