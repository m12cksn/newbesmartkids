import { CheckCircle2, Link2, Send, Wallet } from "lucide-react";
import { AFF_COMMISSION_JENJANG, AFF_COMMISSION_KELUARGA, AFF_MIN_PAYOUT, rupiah } from "@/lib/affiliate";

/** Ilustrasi bergerak alur affiliate: link dibagikan, pesanan lunas, komisi terkumpul sampai batas cair.
 *  Hanya CSS (transform/opacity); dengan reduced motion tampil keadaan akhirnya. */
const sales = [
  { name: "Paket satu jenjang", amount: AFF_COMMISSION_JENJANG, edge: "border-l-[#f7d774]" },
  { name: "Paket Keluarga", amount: AFF_COMMISSION_KELUARGA, edge: "border-l-[#f2b2a6]" },
  { name: "Paket satu jenjang", amount: AFF_COMMISSION_JENJANG, edge: "border-l-[#a9d0ec]" },
];
const totals = sales.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + s.amount], [0]);

export function AffiliateFlowScene() {
  return <figure className="aff-scene relative mx-auto w-full min-w-0 max-w-sm rounded-[2rem] bg-[#fff6d9] p-4 shadow-[0_24px_50px_-30px_rgba(23,53,42,.45)] ring-1 ring-[#f3e2a6] sm:p-5" aria-label="Contoh alur: link dibagikan, tiga paket terjual, komisi terkumpul dan bisa dicairkan">
    <div className="aff-share flex items-center gap-3 rounded-2xl bg-base-100 p-3 shadow-sm">
      <Link2 className="size-5 shrink-0 text-success" strokeWidth={2} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-base-content/60">Link Anda</p>
        <p className="truncate font-mono text-sm font-semibold">/r/BUNDARINA</p>
      </div>
      <span className="aff-send inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 text-xs font-semibold text-success-content"><Send className="size-3.5" strokeWidth={2} aria-hidden="true" />Bagikan</span>
    </div>

    <svg className="mx-auto my-1 block h-6 w-4 text-[#d9a92b]" viewBox="0 0 4 24" aria-hidden="true"><line x1="2" y1="0" x2="2" y2="24" stroke="currentColor" strokeWidth="2" className="bsk-dash-flow" /></svg>

    <ul className="space-y-2.5">
      {sales.map((s, i) => <li key={i} className={`aff-sale-${i + 1} flex items-center gap-2 rounded-xl border-l-4 ${s.edge} bg-base-100 px-3 py-2.5 text-sm leading-6 shadow-sm`}>
        <CheckCircle2 className="size-4 shrink-0 text-success" strokeWidth={2} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{s.name} <span className="text-base-content/55">lunas</span></span>
        <span className="font-bold text-success">+{rupiah(s.amount)}</span>
      </li>)}
    </ul>

    <svg className="mx-auto my-1 block h-6 w-4 text-[#d9a92b]" viewBox="0 0 4 24" aria-hidden="true"><line x1="2" y1="0" x2="2" y2="24" stroke="currentColor" strokeWidth="2" className="bsk-dash-flow" /></svg>

    <div className="rounded-2xl bg-base-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-base-content/70"><Wallet className="size-4 text-success" strokeWidth={2} aria-hidden="true" />Komisi terkumpul</div>
      <div className="aff-ticker-box mt-1 overflow-hidden text-3xl font-extrabold leading-[1.2]" style={{ height: "1.2em" }}>
        <div className="aff-ticker">{totals.map(t => <div key={t} style={{ height: "1.2em" }}>{rupiah(t)}</div>)}</div>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-base-200"><div className="aff-bar h-full origin-left rounded-full bg-success" /></div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className="text-base-content/60">Batas cair {rupiah(AFF_MIN_PAYOUT)}</span>
        <span className="aff-ready rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success">Bisa dicairkan</span>
      </div>
    </div>
    <figcaption className="mt-3 text-center text-xs text-base-content/55">Contoh ilustrasi, bukan data penjualan.</figcaption>
  </figure>;
}
