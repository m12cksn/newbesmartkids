"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AFF_MIN_PAYOUT, commissionFor, FAMILY_PRICE, PRICE_JENJANG, rupiah } from "@/lib/affiliate";

const MAX = 99;
/** Harga contoh saat promo; komisi turun dengan perbandingan yang sama seperti di sistem. */
const PRICES = {
  normal: { jenjang: PRICE_JENJANG, keluarga: FAMILY_PRICE },
  promo: { jenjang: 59_000, keluarga: 99_000 },
} as const;

/** Kalkulator komisi: pengunjung memilih jumlah penjualan dan jenis harga, total komisi ikut bergerak. */
export function AffiliateEarningsCalculator() {
  const [jenjang, setJenjang] = useState(3);
  const [keluarga, setKeluarga] = useState(1);
  const [mode, setMode] = useState<keyof typeof PRICES>("normal");
  const price = PRICES[mode];
  const each = { jenjang: commissionFor({ jenjang: 1, keluarga: 0 }, price.jenjang), keluarga: commissionFor({ jenjang: 0, keluarga: 1 }, price.keluarga) };
  const total = jenjang * each.jenjang + keluarga * each.keluarga;
  const shown = useCountUp(total);
  const rows = [
    { id: "jenjang", label: "Paket satu jenjang", price: price.jenjang, each: each.jenjang, value: jenjang, set: setJenjang },
    { id: "keluarga", label: "Paket Keluarga", price: price.keluarga, each: each.keluarga, value: keluarga, set: setKeluarga },
  ];
  return <div className="rounded-[2rem] bg-base-100 p-5 shadow-[0_18px_40px_-24px_rgba(23,53,42,.35)] sm:p-8">
    <div className="inline-flex rounded-full bg-[#eaf3fb] p-1" role="radiogroup" aria-label="Harga paket">
      {(["normal", "promo"] as const).map(m => <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${mode === m ? "bg-base-100 text-success shadow-sm" : "text-base-content/70 hover:text-base-content"}`}>
        {m === "normal" ? "Harga normal" : "Harga promo"}
      </button>)}
    </div>
    <div className="mt-7 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
      <div className="space-y-6">
        {rows.map(r => <div key={r.id} className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold leading-snug" id={`calc-${r.id}`}>{r.label}</p>
            <p className="mt-1.5 text-sm leading-6 text-base-content/65">Harga {rupiah(r.price)}, komisi <span className="font-semibold text-success" data-testid={`calc-each-${r.id}`}>{rupiah(r.each)}</span></p>
          </div>
          <div className="flex items-center gap-2" role="group" aria-labelledby={`calc-${r.id}`}>
            <button type="button" className="btn btn-circle btn-sm btn-outline btn-success" aria-label={`Kurangi ${r.label}`} disabled={r.value <= 0} onClick={() => r.set(v => Math.max(0, v - 1))}><Minus className="size-4" strokeWidth={2} /></button>
            <output className="w-10 text-center text-xl font-bold tabular-nums" data-testid={`calc-${r.id}`} aria-live="polite">{r.value}</output>
            <button type="button" className="btn btn-circle btn-sm btn-success" aria-label={`Tambah ${r.label}`} disabled={r.value >= MAX} onClick={() => r.set(v => Math.min(MAX, v + 1))}><Plus className="size-4" strokeWidth={2} /></button>
          </div>
        </div>)}
      </div>
      <div className="rounded-3xl bg-[#fdf1c7] px-6 py-7 text-center md:min-w-72">
        <p className="text-sm font-medium text-[#6b5410]">Total komisi</p>
        <p className="mt-2 text-4xl font-extrabold leading-tight tabular-nums text-success" data-testid="calc-total">{rupiah(shown)}</p>
        <p className="mt-3 text-sm leading-6 text-base-content/75" aria-live="polite">{total >= AFF_MIN_PAYOUT ? "Sudah bisa dicairkan ke e-wallet." : `Kurang ${rupiah(AFF_MIN_PAYOUT - total)} lagi untuk bisa dicairkan.`}</p>
      </div>
    </div>
    {mode === "promo" && <p className="mt-6 text-sm leading-6 text-base-content/65">Contoh harga promo Rp59.000 dan Rp99.000. Komisi turun dengan perbandingan yang sama dengan harga normal.</p>}
  </div>;
}

/** Angka bergerak pelan ke nilai baru; langsung lompat bila pengguna memilih reduced motion. */
function useCountUp(target: number) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
    let raf = 0; const t0 = performance.now();
    const tick = (now: number) => {
      const p = duration ? Math.min(1, (now - t0) / duration) : 1, v = Math.round(start + (target - start) * (1 - (1 - p) ** 3));
      from.current = v; setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}
