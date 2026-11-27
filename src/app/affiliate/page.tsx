import type { Metadata } from "next";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { AffiliateEarningsCalculator } from "@/components/affiliate/AffiliateEarningsCalculator";
import { AffiliateFlowScene } from "@/components/affiliate/AffiliateFlowScene";
import { AffiliateSignup } from "@/components/affiliate/AffiliateSignup";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { AFF_COMMISSION_JENJANG, AFF_COMMISSION_KELUARGA, AFF_HOLD_DAYS, AFF_MIN_PAYOUT, rupiah } from "@/lib/affiliate";
import { SITE_URL } from "@/lib/site";
import "./affiliate-page.css";

export const metadata: Metadata = {
  title: "Program affiliate",
  description: `Bagikan link BeSmartKids dan dapatkan komisi ${rupiah(AFF_COMMISSION_JENJANG)} per paket satu jenjang dan ${rupiah(AFF_COMMISSION_KELUARGA)} per Paket Keluarga. Cair ke e-wallet mulai ${rupiah(AFF_MIN_PAYOUT)}.`,
};

const packages = [
  { name: "Paket satu jenjang", detail: "SD, SMP, atau SMA. 1 akun, 1 tahun.", price: 79_000, commission: AFF_COMMISSION_JENJANG },
  { name: "Paket Keluarga", detail: "2 akun, 12 bulan.", price: 129_000, commission: AFF_COMMISSION_KELUARGA },
];
const steps = [
  { title: "Daftar", text: "Isi nama, WhatsApp, dan e-wallet. Link pribadi langsung jadi." },
  { title: "Bagikan", text: "Kirim ke grup sekolah, teman, atau media sosial. Teks promosi tersedia di dasbor." },
  { title: "Tercatat otomatis", text: "Setiap pembelian lunas lewat link Anda masuk ke dasbor." },
  { title: "Cairkan", text: `Setelah ${AFF_HOLD_DAYS} hari, komisi bisa dicairkan ke e-wallet mulai ${rupiah(AFF_MIN_PAYOUT)}.` },
];
const rules = [
  `Komisi ${rupiah(AFF_COMMISSION_JENJANG)} untuk setiap paket satu jenjang dan ${rupiah(AFF_COMMISSION_KELUARGA)} untuk setiap Paket Keluarga yang lunas. Jika pembeli mendapat diskon, komisi tetap sama.`,
  `Komisi tertahan ${AFF_HOLD_DAYS} hari setelah pesanan lunas. Jika pesanan dibatalkan dalam masa itu, komisinya batal.`,
  `Pencairan diajukan dari dasbor saat komisi siap cair mencapai ${rupiah(AFF_MIN_PAYOUT)}, lalu dikirim ke e-wallet yang terdaftar.`,
  "Pembelian dengan nomor WhatsApp yang sama dengan nomor affiliate tidak mendapat komisi.",
  "Penjualan tercatat jika pembeli membuka halaman pembelian lewat link Anda. Jika pembeli membeli lewat jalur lain, mintalah ia menyebut kode Anda kepada admin.",
  "Dilarang spam, dilarang membuat klaim yang tidak benar (misalnya nilai pasti naik), dan dilarang memasang iklan berbayar memakai nama BeSmartKids.",
  "BeSmartKids dapat menonaktifkan affiliate yang melanggar ketentuan. Komisi dari penjualan yang tidak wajar tidak dibayarkan.",
];

export default function Page() {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content">
    <SiteHeader />

    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 pb-14 pt-10 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:pb-20 lg:pt-16">
      <div className="min-w-0">
        <h1 className="text-[2rem] font-extrabold leading-tight sm:text-5xl">Bagikan link, dapat komisi sampai {rupiah(AFF_COMMISSION_KELUARGA)} per penjualan</h1>
        <p className="mt-5 max-w-lg text-lg leading-8 text-base-content/75">Terbuka untuk siapa saja. Daftar gratis, link langsung jadi, dan komisi dikirim ke e-wallet Anda.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#daftar" className="btn btn-success btn-lg rounded-full px-7">Daftar gratis<ArrowRight className="size-5" strokeWidth={2} aria-hidden="true" /></a>
          <Link href="/akun/affiliate" className="btn btn-ghost btn-lg rounded-full">Buka dasbor</Link>
        </div>
      </div>
      <AffiliateFlowScene />
    </section>

    <section className="bg-base-100 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Komisi tetap untuk setiap paket</h2>
        <p className="mt-2 text-base-content/70">Pembeli dapat diskon? Komisi Anda tetap sama.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {packages.map(p => <div key={p.name} className="rounded-3xl border-2 border-success/25 p-6" data-testid="commission-card">
            <p className="text-lg font-bold">{p.name}</p>
            <p className="text-sm text-base-content/60">{p.detail} Harga {rupiah(p.price)}.</p>
            <p className="mt-5 text-sm text-base-content/70">Komisi Anda</p>
            <p className="text-4xl font-extrabold text-success sm:text-5xl">{rupiah(p.commission)}</p>
          </div>)}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-8 sm:py-20">
      <h2 className="text-2xl font-extrabold sm:text-3xl">Hitung komisi Anda</h2>
      <p className="mt-2 text-base-content/70">Tekan tombol tambah atau kurang untuk melihat totalnya.</p>
      <div className="mt-8"><AffiliateEarningsCalculator /></div>
    </section>

    <section className="bg-base-100 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Cara kerjanya</h2>
        <ol className="relative mt-10 grid gap-8 sm:grid-cols-4 sm:gap-6">
          <svg aria-hidden="true" className="absolute left-[12.5%] top-5 hidden h-2 w-3/4 text-success/40 sm:block" viewBox="0 0 100 2" preserveAspectRatio="none"><line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" className="bsk-dash-flow" /></svg>
          {steps.map((s, i) => <li key={s.title} className="relative flex gap-4 sm:flex-col sm:items-center sm:text-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success text-lg font-bold text-success-content">{i + 1}</span>
            <div><p className="font-bold">{s.title}</p><p className="mt-1 text-sm leading-6 text-base-content/70">{s.text}</p></div>
          </li>)}
        </ol>
      </div>
    </section>

    <section id="daftar" className="mx-auto grid max-w-5xl grid-cols-1 scroll-mt-20 gap-10 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1fr] lg:items-start">
      <div className="min-w-0">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Daftar sekarang</h2>
        <p className="mt-2 max-w-md text-base-content/70">Cukup satu menit. Setelah daftar, Anda langsung mendapat kode dan link pribadi.</p>
        <details className="group mt-8 rounded-2xl bg-base-100 p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">Ketentuan program<ChevronDown className="size-5 transition-transform group-open:rotate-180" strokeWidth={2} aria-hidden="true" /></summary>
          <ul className="mt-4 list-disc space-y-2 ps-5 text-sm leading-6 text-base-content/80">{rules.map(r => <li key={r}>{r}</li>)}</ul>
        </details>
        <p className="mt-4 text-sm text-base-content/60">Sudah terdaftar? <Link href="/akun/affiliate" className="font-semibold text-success hover:underline">Masuk ke dasbor</Link>.</p>
      </div>
      <AffiliateSignup origin={SITE_URL} />
    </section>
    <SiteFooter />
  </main>;
}
