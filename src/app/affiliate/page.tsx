import type { Metadata } from "next";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AffiliateEarningsCalculator } from "@/components/affiliate/AffiliateEarningsCalculator";
import { AffiliateFlowScene } from "@/components/affiliate/AffiliateFlowScene";
import { ChainLink, ChatBubble, Coin, PaperPlane, Sparkle, WalletArt } from "@/components/affiliate/AffiliateOrnaments";
import { AffiliateSignup } from "@/components/affiliate/AffiliateSignup";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { AFF_COMMISSION_JENJANG, AFF_COMMISSION_KELUARGA, AFF_HOLD_DAYS, AFF_MIN_PAYOUT, commissionFor, FAMILY_PRICE, PRICE_JENJANG, rupiah } from "@/lib/affiliate";
import { SITE_URL } from "@/lib/site";
import "./affiliate-page.css";

export const metadata: Metadata = {
  title: "Program affiliate",
  description: `Bagikan link BeSmartKids dan dapatkan komisi sampai ${rupiah(AFF_COMMISSION_KELUARGA)} per penjualan. Cair ke e-wallet mulai ${rupiah(AFF_MIN_PAYOUT)}.`,
};

/** Gaya gerak ornamen: lama putaran, jeda awal, dan jarak naik-turun. */
const v = (t: string, d = "0s", dy = "-12px") => ({ "--t": t, "--d": d, "--dy": dy }) as CSSProperties;
const PROMO = { jenjang: 59_000, keluarga: 99_000 };
const packages = [
  { name: "Paket satu jenjang", detail: "SD, SMP, atau SMA. 1 akun, 1 tahun.", price: PRICE_JENJANG, commission: AFF_COMMISSION_JENJANG, bg: "bg-[#fdf1c7]", ink: "text-[#6b5410]",
    art: <Coin className="-right-3 -top-6 size-20 sm:size-24" style={v("9s", "-1s")} />, promo: PROMO.jenjang, promoCommission: commissionFor({ jenjang: 1, keluarga: 0 }, PROMO.jenjang) },
  { name: "Paket Keluarga", detail: "2 akun, 12 bulan.", price: FAMILY_PRICE, commission: AFF_COMMISSION_KELUARGA, bg: "bg-[#fde2dd]", ink: "text-[#7a3326]",
    art: <WalletArt className="-right-3 -top-6 size-20 sm:size-24" style={v("11s", "-3s")} />, promo: PROMO.keluarga, promoCommission: commissionFor({ jenjang: 0, keluarga: 1 }, PROMO.keluarga) },
];
const steps = [
  { title: "Daftar", text: "Isi nama, WhatsApp, dan e-wallet. Link pribadi langsung jadi.", dot: "bg-[#208f6d] text-white" },
  { title: "Bagikan", text: "Kirim ke grup sekolah, teman, atau media sosial. Teks promosi tersedia di dasbor.", dot: "bg-[#f7d774] text-[#4a3a08]" },
  { title: "Tercatat otomatis", text: "Setiap pembelian lunas lewat link Anda masuk ke dasbor.", dot: "bg-[#f2b2a6] text-[#5c2318]" },
  { title: "Cairkan", text: `Setelah ${AFF_HOLD_DAYS} hari, komisi bisa dicairkan ke e-wallet mulai ${rupiah(AFF_MIN_PAYOUT)}.`, dot: "bg-[#a9d0ec] text-[#173a55]" },
];
const rules = [
  `Komisi ${rupiah(AFF_COMMISSION_JENJANG)} untuk setiap paket satu jenjang (harga normal ${rupiah(PRICE_JENJANG)}) dan ${rupiah(AFF_COMMISSION_KELUARGA)} untuk setiap Paket Keluarga (harga normal ${rupiah(FAMILY_PRICE)}).`,
  "Jika paket dibeli dengan harga promo, komisi turun dengan perbandingan yang sama. Jika satu pesanan berisi beberapa paket, komisi dihitung per paket.",
  `Komisi tertahan ${AFF_HOLD_DAYS} hari setelah pesanan lunas. Jika pesanan dibatalkan dalam masa itu, komisinya batal.`,
  `Pencairan diajukan dari dasbor saat komisi siap cair mencapai ${rupiah(AFF_MIN_PAYOUT)}, lalu dikirim ke e-wallet yang terdaftar.`,
  "Pembelian dengan nomor WhatsApp yang sama dengan nomor affiliate tidak mendapat komisi.",
  "Penjualan tercatat jika pembeli membuka halaman pembelian lewat link Anda. Jika pembeli membeli lewat jalur lain, mintalah ia menyebut kode Anda kepada admin.",
  "Dilarang spam, dilarang membuat klaim yang tidak benar (misalnya nilai pasti naik), dan dilarang memasang iklan berbayar memakai nama BeSmartKids.",
  "BeSmartKids dapat menonaktifkan affiliate yang melanggar ketentuan. Komisi dari penjualan yang tidak wajar tidak dibayarkan.",
];

export default function Page() {
  return <main data-theme="besmartkids" className="min-h-screen overflow-x-clip bg-base-200 text-base-content">
    <SiteHeader />

    <section className="relative overflow-hidden bg-[#e4f3ec]">
      <ChainLink className="left-[3%] top-8 hidden size-14 lg:block" style={v("12s")} />
      <Coin className="left-[44%] top-10 hidden size-12 lg:block" style={v("10s", "-2s")} />
      <Sparkle className="right-[6%] top-8 size-6 sm:size-8" style={v("8s", "-1s", "-8px")} />
      <ChatBubble className="bottom-12 left-[40%] hidden size-14 lg:block" style={v("13s", "-4s")} />
      <PaperPlane className="right-3 top-[44%] hidden size-12 sm:block sm:right-[2%] sm:size-14" style={v("9s", "-5s", "-16px")} />
      <Sparkle className="bottom-16 left-4 size-5 lg:left-[30%]" style={v("7s", "-3s", "-6px")} />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:pb-24 lg:pt-20">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-extrabold leading-[1.22] sm:text-5xl sm:leading-[1.18]">Bagikan link, dapat komisi sampai <span className="whitespace-nowrap">{rupiah(AFF_COMMISSION_KELUARGA)}</span> per penjualan</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-base-content/75">Terbuka untuk siapa saja. Daftar gratis, link langsung jadi, dan komisi dikirim ke e-wallet Anda.</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#daftar" className="btn btn-success btn-lg rounded-full px-7 shadow-[0_10px_24px_-12px_rgba(32,143,109,.9)]">Daftar gratis<ArrowRight className="size-5" strokeWidth={2} aria-hidden="true" /></a>
            <Link href="/akun/affiliate" className="btn btn-lg rounded-full border-2 border-success/30 bg-base-100 hover:border-success/60 hover:bg-base-100">Buka dasbor</Link>
          </div>
        </div>
        <AffiliateFlowScene />
      </div>
      <svg className="absolute inset-x-0 bottom-0 block h-8 w-full text-base-100 sm:h-12" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true"><path d="M0 48V22c160-26 320-26 480 0s320 26 480 0 320-26 480 0v26Z" fill="currentColor" /></svg>
    </section>

    <section className="bg-base-100 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <h2 className="text-2xl font-extrabold leading-[1.3] sm:text-4xl">Komisi untuk setiap paket</h2>
        <p className="mt-3 leading-7 text-base-content/70">Dihitung dari harga normal. Satu pesanan berisi beberapa paket, komisinya dihitung per paket.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {packages.map(p => <div key={p.name} className={`relative rounded-[2rem] ${p.bg} p-7 sm:p-8`} data-testid="commission-card">
            {p.art}
            <p className="pr-14 text-xl font-extrabold leading-snug">{p.name}</p>
            <p className={`mt-2 pr-10 text-sm leading-6 ${p.ink}`}>{p.detail} Harga normal {rupiah(p.price)}.</p>
            <p className={`mt-7 text-sm font-medium ${p.ink}`}>Komisi Anda</p>
            <p className="mt-1 text-4xl font-extrabold leading-tight text-success sm:text-5xl">{rupiah(p.commission)}</p>
          </div>)}
        </div>

        <div className="mt-6 rounded-[2rem] bg-[#eaf3fb] p-7 sm:p-8">
          <p className="text-lg font-extrabold leading-snug">Saat ada promo</p>
          <p className="mt-2 leading-7 text-base-content/75">Komisi turun dengan perbandingan yang sama dengan harga normal. Contohnya:</p>
          <ul className="mt-5 space-y-3">
            {packages.map(p => <li key={p.name} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-base-100 px-4 py-3 leading-7" data-testid="promo-example">
              <span>{p.name} {rupiah(p.promo)}</span>
              <ArrowRight className="size-4 text-[#4f8fbf]" strokeWidth={2} aria-hidden="true" />
              <span className="font-bold text-success">komisi {rupiah(p.promoCommission)}</span>
            </li>)}
          </ul>
        </div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-[#eef6fc] py-16 sm:py-24">
      <Coin className="right-[4%] top-10 hidden size-16 md:block" style={v("10s", "-6s")} />
      <Sparkle className="left-[5%] top-14 hidden size-7 md:block" style={v("8s", "-2s", "-8px")} />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-8">
        <h2 className="text-2xl font-extrabold leading-[1.3] sm:text-4xl">Hitung komisi Anda</h2>
        <p className="mt-3 leading-7 text-base-content/70">Tekan tombol tambah atau kurang, lalu coba harga normal dan harga promo.</p>
        <div className="mt-10"><AffiliateEarningsCalculator /></div>
      </div>
    </section>

    <section className="bg-[#fff8ea] py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2 className="text-2xl font-extrabold leading-[1.3] sm:text-4xl">Cara kerjanya</h2>
        <ol className="relative mt-12 grid gap-9 sm:grid-cols-4 sm:gap-6">
          <svg aria-hidden="true" className="absolute left-[12.5%] top-6 hidden h-2 w-3/4 text-[#e2b83f] sm:block" viewBox="0 0 100 2" preserveAspectRatio="none"><line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" className="bsk-dash-flow" /></svg>
          {steps.map((s, i) => <li key={s.title} className="relative flex gap-5 sm:flex-col sm:items-center sm:text-center">
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ring-4 ring-[#fff8ea] ${s.dot}`}>{i + 1}</span>
            <div><p className="text-lg font-extrabold leading-snug">{s.title}</p><p className="mt-2 text-sm leading-6 text-base-content/70">{s.text}</p></div>
          </li>)}
        </ol>
      </div>
    </section>

    <section id="daftar" className="relative scroll-mt-20 overflow-hidden bg-[#e4f3ec]">
      <PaperPlane className="left-[3%] top-12 hidden size-14 lg:block" style={v("11s", "-2s", "-14px")} />
      <ChainLink className="bottom-12 left-[40%] hidden size-12 lg:block" style={v("12s", "-7s")} />
      <Sparkle className="right-[4%] top-10 hidden size-7 sm:block" style={v("8s", "-4s", "-8px")} />
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-12 px-4 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-start">
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold leading-[1.3] sm:text-4xl">Daftar sekarang</h2>
          <p className="mt-3 max-w-md leading-7 text-base-content/75">Cukup satu menit. Setelah daftar, Anda langsung mendapat kode dan link pribadi.</p>
          <details className="group mt-9 rounded-3xl bg-base-100 p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">Ketentuan program<ChevronDown className="size-5 transition-transform group-open:rotate-180" strokeWidth={2} aria-hidden="true" /></summary>
            <ul className="mt-5 list-disc space-y-3 ps-5 text-sm leading-6 text-base-content/80">{rules.map(r => <li key={r}>{r}</li>)}</ul>
          </details>
          <p className="mt-5 text-sm leading-6 text-base-content/65">Sudah terdaftar? <Link href="/akun/affiliate" className="font-semibold text-success hover:underline">Masuk ke dasbor</Link>.</p>
        </div>
        <AffiliateSignup origin={SITE_URL} />
      </div>
    </section>
    <SiteFooter />
  </main>;
}
