import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import type { SavedResult } from "@/app/api/hasil/route";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SavedEvaluationReport } from "@/components/report/SavedEvaluationReport";
import { SESSION_COOKIE } from "@/lib/access-rules";
import { authEnabled, rpc } from "@/lib/supabase-rpc";

export const metadata: Metadata = { title: "Hasil evaluasi", robots: { index: false } };

async function Report({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d{0,18}$/.test(id) || (id.length === 19 && id > "9223372036854775807")) notFound();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!authEnabled) notFound();
  if (!token) redirect(`/masuk?lanjut=/akun/hasil/${id}`);
  let result: SavedResult | null;
  try {
    result = await rpc<SavedResult | null>("bsk_my_evaluation", { p_token: token, p_result_id: id });
  } catch {
    return <p role="alert">Hasil evaluasi belum dapat dimuat. Coba muat ulang halaman.</p>;
  }
  if (!result) notFound();
  return <SavedEvaluationReport result={result} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content">
    <SiteHeader />
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/akun#riwayat" className="btn btn-ghost mb-4">Kembali ke riwayat belajar</Link>
      <Suspense fallback={<p role="status">Memuat hasil evaluasi…</p>}><Report params={params} /></Suspense>
    </div>
  </main>;
}
