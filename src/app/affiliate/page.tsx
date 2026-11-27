import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateSignup } from "@/components/affiliate/AffiliateSignup";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { AFF_HOLD_DAYS, AFF_MIN_PAYOUT, AFF_RATE, commissionFor, rupiah } from "@/lib/affiliate";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Program affiliate",
  description: `Bagikan link BeSmartKids dan dapatkan komisi ${AFF_RATE * 100}% dari setiap penjualan. Pencairan ke e-wallet mulai ${rupiah(AFF_MIN_PAYOUT)}.`,
};

const packages = [{ name: "Paket satu jenjang (SD, SMP, atau SMA)", price: 79_000 }, { name: "Paket Keluarga (2 akun, semua jenjang)", price: 129_000 }];
const steps = [
  { title: "Daftar dan dapatkan link", text: "Isi nama, nomor WhatsApp, dan e-wallet. Anda langsung mendapat kode dan link pribadi." },
  { title: "Bagikan ke orang tua lain", text: "Kirim link lewat WhatsApp, grup sekolah, atau media sosial. Teks promosi siap pakai ada di dasbor." },
  { title: "Penjualan tercatat otomatis", text: "Saat orang membeli lewat link Anda dan pembayarannya lunas, komisi masuk ke dasbor." },
  { title: "Cairkan ke e-wallet", text: `Komisi bisa dicairkan ${AFF_HOLD_DAYS} hari setelah pesanan lunas, minimal ${rupiah(AFF_MIN_PAYOUT)}. Admin mengirimnya ke e-wallet Anda.` },
];
const rules = [
  `Komisi ${AFF_RATE * 100}% dihitung dari nilai pesanan yang sudah lunas.`,
  `Komisi tertahan ${AFF_HOLD_DAYS} hari setelah pesanan lunas. Jika pesanan dibatalkan dalam masa itu, komisinya batal.`,
  `Pencairan diajukan dari dasbor saat komisi siap cair mencapai ${rupiah(AFF_MIN_PAYOUT)}, lalu dikirim ke e-wallet yang terdaftar.`,
  "Pembelian dengan nomor WhatsApp yang sama dengan nomor affiliate tidak mendapat komisi.",
  "Penjualan tercatat jika pembeli membuka halaman pembelian lewat link Anda. Jika pembeli membeli lewat jalur lain, mintalah ia menyebut kode Anda kepada admin.",
  "Dilarang spam, dilarang membuat klaim yang tidak benar (misalnya nilai pasti naik), dan dilarang memasang iklan berbayar memakai nama BeSmartKids.",
  "BeSmartKids dapat menonaktifkan affiliate yang melanggar ketentuan. Komisi dari penjualan yang tidak wajar tidak dibayarkan.",
];

export default function Page() {
  let n = 0;
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content">
    <SiteHeader />
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Rekomendasikan BeSmartKids, dapatkan komisi {AFF_RATE * 100}%</h1>
          <p className="mt-4 max-w-xl leading-7 text-base-content/80">Program affiliate terbuka untuk siapa saja: orang tua, guru, atau pengelola komunitas. Bagikan link pribadi Anda, dan setiap penjualan yang lunas lewat link itu memberi Anda komisi.</p>

          <h2 className="mt-10 text-xl font-bold">Besar komisi</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-base-300 bg-base-100">
            <table className="table">
              <thead><tr><th>Paket</th><th className="text-right">Harga</th><th className="text-right">Komisi</th></tr></thead>
              <tbody>{packages.map(p => <tr key={p.name}><td>{p.name}</td><td className="text-right">{rupiah(p.price)}</td><td className="text-right font-bold text-success">{rupiah(commissionFor(p.price))}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-base-content/60">Komisi mengikuti nilai pesanan. Jika harga promo berbeda, komisinya tetap {AFF_RATE * 100}% dari nilai yang dibayar.</p>

          <h2 className="mt-10 text-xl font-bold">Cara kerjanya</h2>
          <ol className="mt-4 space-y-5">{steps.map(s => <li key={s.title} className="flex gap-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success font-bold text-success-content">{++n}</span><div><p className="font-bold">{s.title}</p><p className="mt-1 text-sm leading-6 text-base-content/75">{s.text}</p></div></li>)}</ol>

          <h2 className="mt-10 text-xl font-bold">Ketentuan program</h2>
          <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-6 text-base-content/80">{rules.map(r => <li key={r}>{r}</li>)}</ul>
          <p className="mt-4 text-sm text-base-content/60">Sudah terdaftar? <Link href="/akun/affiliate" className="font-semibold text-success hover:underline">Buka dasbor affiliate</Link>.</p>
        </div>
        <div id="daftar" className="lg:sticky lg:top-24"><AffiliateSignup origin={SITE_URL} /></div>
      </div>
    </div>
    <SiteFooter />
  </main>;
}
