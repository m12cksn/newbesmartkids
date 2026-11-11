"use client";

import { useState } from "react";

const point = (i: number, n: number) => {
  const a = (2 * Math.PI * i) / n - Math.PI / 2;
  return `${50 + 44 * Math.cos(a)} ${50 + 44 * Math.sin(a)}`;
};
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const fmt = (v: number, max = 3) => Number(v.toFixed(max)).toString().replace(".", ",");

/** Peraga pecahan mini di beranda: anak langsung bisa mencoba sebelum memilih kelas. */
export function HeroPlayground() {
  const [parts, setParts] = useState(4);
  const [filled, setFilled] = useState(3);
  const value = filled / parts;
  const g = gcd(filled, parts) || 1;
  const setPartsSafe = (n: number) => { setParts(n); setFilled((f) => Math.min(f, n)); };
  const exact = Number.isInteger(value * 1000);
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="bsk-pop-in relative overflow-hidden rounded-box border border-base-300 bg-base-100 p-5 shadow-xl shadow-success/10 sm:p-7" style={{ ["--d" as string]: ".15s" }}>
        <div className="bsk-graph-paper pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-base-content/60">Coba geser sendiri</span>
            <span className="badge badge-warning badge-outline">Peraga pecahan</span>
          </div>
          <div className="mt-4 grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <svg viewBox="0 0 100 100" className="mx-auto w-40 sm:w-full sm:max-w-52" role="img" aria-label={`Lingkaran dibagi ${parts} bagian, ${filled} bagian diarsir`}>
              {parts === 1
                ? <circle cx="50" cy="50" r="44" fill={filled ? "#208f6d" : "#ecfdf5"} stroke="#17352a" strokeWidth="1.2" />
                : Array.from({ length: parts }, (_, i) => (
                  <path key={`${parts}-${i}`} d={`M50 50 L${point(i, parts)} A44 44 0 0 1 ${point(i + 1, parts)} Z`}
                    fill={i < filled ? (i % 2 ? "#2aa883" : "#208f6d") : "#ffffff"} stroke="#17352a" strokeWidth="1.2"
                    className="cursor-pointer transition-[fill] duration-300 hover:opacity-80"
                    onClick={() => setFilled(i < filled ? i : i + 1)} />
                ))}
            </svg>
            <div className="space-y-3">
              <p className="flex items-center gap-3 text-5xl font-extrabold text-success" aria-live="polite">
                <span className="inline-flex flex-col items-center leading-none tabular-nums">
                  <span>{filled}</span><span className="my-1 h-1 w-full rounded bg-success" /><span>{parts}</span>
                </span>
                <span className="text-base font-bold leading-6 text-base-content/70">
                  ≈ {fmt(value)}{!exact && "…"}<br />= {fmt(value * 100, 1)}%
                  {g > 1 && filled > 0 && <><br />= {filled / g}/{parts / g}</>}
                </span>
              </p>
              <label className="block text-xs font-bold text-base-content/60">Banyak bagian: {parts}
                <input type="range" min={1} max={12} value={parts} onChange={(e) => setPartsSafe(Number(e.target.value))} aria-label="Banyak bagian" className="range range-success range-xs mt-1" />
              </label>
              <label className="block text-xs font-bold text-base-content/60">Bagian diarsir: {filled}
                <input type="range" min={0} max={parts} value={filled} onChange={(e) => setFilled(Number(e.target.value))} aria-label="Bagian diarsir" className="range range-warning range-xs mt-1" />
              </label>
            </div>
          </div>
          <div className="mt-5" aria-hidden="true">
            <div className="relative h-6 border-b-2 border-base-content/60">
              {Array.from({ length: parts + 1 }, (_, i) => <span key={i} className="absolute bottom-0 h-2.5 w-0.5 -translate-x-1/2 bg-base-content/60" style={{ left: `${(i / parts) * 100}%` }} />)}
              <span className="absolute -bottom-2 size-4 -translate-x-1/2 rounded-full border-2 border-white bg-warning shadow transition-[left] duration-500" style={{ left: `${value * 100}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-xs font-bold text-base-content/60"><span>0</span><span>1</span></div>
          </div>
          <p className="mt-4 text-xs text-base-content/55">Ketuk potongan lingkaran atau geser penggeser. Pecahan, desimal, persen, dan posisinya di garis bilangan ikut berubah.</p>
        </div>
      </div>
      <div className="bsk-drift absolute -right-3 -top-5 hidden rotate-6 rounded-box border border-base-300 bg-base-100 px-3 py-2 text-sm font-extrabold text-success shadow-lg sm:block" style={{ ["--t" as string]: "9s", ["--r" as string]: "6deg" }} aria-hidden="true">7 × 8 = 56</div>
      <div className="bsk-drift absolute -bottom-5 -left-4 hidden -rotate-6 rounded-box border border-base-300 bg-warning px-3 py-2 text-sm font-extrabold text-warning-content shadow-lg sm:block" style={{ ["--t" as string]: "11s", ["--d" as string]: "-4s", ["--r" as string]: "-6deg" }} aria-hidden="true">0,75 = ¾</div>
    </div>
  );
}
