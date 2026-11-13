import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { adminWaLink, adminWaText } from "@/lib/contact";

export type LegalSection = { id: string; title: string; body: ReactNode };

/** Tata letak halaman kebijakan: judul, tanggal berlaku, daftar isi, isi, dan kontak admin. */
export function LegalPage({ title, intro, updated, sections }: { title: string; intro: string; updated: string; sections: LegalSection[] }) {
  const wa = adminWaLink(`Halo admin BeSmartKids, saya ingin bertanya tentang ${title.toLowerCase()}.`);
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content">
    <SiteHeader />
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-base-content/60">Berlaku sejak {updated}</p>
      <p className="mt-4 leading-7">{intro}</p>
      <nav aria-label="Daftar isi" className="mt-6 rounded-md border border-base-300 bg-base-100 p-4">
        <p className="font-bold">Daftar isi</p>
        <ol className="mt-2 list-decimal space-y-1 ps-5 text-sm">{sections.map(s => <li key={s.id}><a href={`#${s.id}`} className="link link-hover text-success">{s.title}</a></li>)}</ol>
      </nav>
      <div className="mt-8 space-y-8">{sections.map((s, i) => <section key={s.id} id={s.id} aria-labelledby={`${s.id}-judul`} className="scroll-mt-24">
        <h2 id={`${s.id}-judul`} className="text-xl font-bold">{i + 1}. {s.title}</h2>
        <div className="mt-2 space-y-3 leading-7 [&_li]:ms-5 [&_ul]:list-disc [&_ul]:space-y-1">{s.body}</div>
      </section>)}</div>
      <section aria-labelledby="kontak" className="mt-10 rounded-md border-s-4 border-success bg-base-100 p-4">
        <h2 id="kontak" className="font-bold">Pertanyaan</h2>
        <p className="mt-1 text-sm leading-6">Pertanyaan, permintaan data, atau keluhan dapat disampaikan kepada admin BeSmartKids{adminWaText ? <> melalui WhatsApp {adminWaText}</> : " melalui kontak yang Anda terima saat membeli paket"}.</p>
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm mt-3 gap-1"><MessageCircle className="size-4" aria-hidden="true" />Hubungi admin lewat WhatsApp</a>}
      </section>
    </article>
    <SiteFooter />
  </main>;
}
