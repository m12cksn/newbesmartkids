"use client";

import { ArrowLeft, LockKeyhole, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { canEvaluate } from "@/lib/access-rules";
import { useAccess } from "./AccessProvider";

/** Evaluasi hanya untuk akun dengan paket kelas ini. Materi dan latihan bab gratis tetap terbuka. */
export function EvaluationGate({ close, children }: { close: () => void; children: ReactNode }) {
  const { loading, enabled, session } = useAccess();
  const pathname = usePathname() ?? "/";
  if (!enabled && !loading) return children;
  if (loading) return <section className="mx-4 my-8 max-w-2xl rounded-xl border border-base-300 bg-base-100 p-6 text-center sm:mx-auto"><span className="loading loading-spinner text-success" aria-label="Memeriksa akses" /></section>;
  if (canEvaluate(pathname, session)) return children;
  return <section className="mx-4 my-8 max-w-2xl space-y-3 rounded-xl border border-base-300 bg-base-100 p-6 sm:mx-auto" aria-labelledby="evaluasi-terkunci">
    <LockKeyhole className="size-8 text-success" strokeWidth={1.75} aria-hidden="true" />
    <h2 id="evaluasi-terkunci" className="text-xl font-extrabold">Evaluasi perlu akun BeSmartKids</h2>
    <p className="text-sm leading-6 text-base-content/70">{session ? "Akun ini belum memiliki paket untuk kelas ini. Hubungi admin tempat Anda membeli untuk menambah paket." : "Materi dan latihan bab ini boleh dicoba gratis. Untuk mengerjakan evaluasi dan membuka bab lain, masuk dengan username dan PIN yang Anda terima setelah membeli paket."}</p>
    <div className="flex flex-wrap gap-2">
      {!session && <Link href={`/masuk?lanjut=${encodeURIComponent(pathname)}`} className="btn btn-success gap-1"><LogIn className="size-4" aria-hidden="true" />Masuk</Link>}
      <button type="button" className="btn btn-ghost gap-1" onClick={close}><ArrowLeft className="size-4" aria-hidden="true" />Kembali ke materi</button>
    </div>
  </section>;
}
