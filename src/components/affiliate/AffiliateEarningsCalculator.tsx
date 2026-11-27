"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AFF_COMMISSION_JENJANG, AFF_COMMISSION_KELUARGA, AFF_MIN_PAYOUT, rupiah } from "@/lib/affiliate";

const MAX = 99;

/** Kalkulator komisi: pengunjung memilih jumlah penjualan, total komisi ikut bergerak. */
export function AffiliateEarningsCalculator() {
  const [jenjang, setJenjang] = useState(3);
  const [keluarga, setKeluarga] = useState(1);
  const total = jenjang * AFF_COMMISSION_JENJANG + keluarga * AFF_COMMISSION_KELUARGA;
  const shown = useCountUp(total);
  const rows = [
    { id: "jenjang", label: "Paket satu jenjang", each: AFF_COMMISSION_JENJANG, value: jenjang, set: setJenjang },
    { id: "keluarga", label: "Paket Keluarga", each: AFF_COMMISSION_KELUARGA, value: keluarga, set: setKeluarga },
  ];
  return <div className="grid gap-6 rounded-3xl bg-base-100 p-5 shadow-sm sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
    <div className="space-y-4">
      {rows.map(r => <div key={r.id} className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-semibold" id={`calc-${r.id}`}>{r.label}</p><p className="text-sm text-base-content/60">{rupiah(r.each)} per paket</p></div>
        <div className="flex items-center gap-2" role="group" aria-labelledby={`calc-${r.id}`}>
          <button type="button" className="btn btn-circle btn-sm btn-outline btn-success" aria-label={`Kurangi ${r.label}`} disabled={r.value <= 0} onClick={() => r.set(v => Math.max(0, v - 1))}><Minus className="size-4" strokeWidth={2} /></button>
          <output className="w-10 text-center text-xl font-bold tabular-nums" data-testid={`calc-${r.id}`} aria-live="polite">{r.value}</output>
          <button type="button" className="btn btn-circle btn-sm btn-success" aria-label={`Tambah ${r.label}`} disabled={r.value >= MAX} onClick={() => r.set(v => Math.min(MAX, v + 1))}><Plus className="size-4" strokeWidth={2} /></button>
        </div>
      </div>)}
    </div>
    <div className="rounded-2xl bg-success/10 p-5 text-center md:min-w-64">
      <p className="text-sm text-base-content/70">Total komisi</p>
      <p className="mt-1 text-4xl font-extrabold tabular-nums text-success" data-testid="calc-total">{rupiah(shown)}</p>
      <p className="mt-2 text-sm text-base-content/70" aria-live="polite">{total >= AFF_MIN_PAYOUT ? "Sudah bisa dicairkan ke e-wallet." : `Kurang ${rupiah(AFF_MIN_PAYOUT - total)} lagi untuk bisa dicairkan.`}</p>
    </div>
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
