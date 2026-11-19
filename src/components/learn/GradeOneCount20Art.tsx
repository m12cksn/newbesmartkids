import type { ReactNode } from "react";
import { Art } from "./GradeOneSub10Art";
import { thingName, type Thing } from "@/data/grade-one-sub10-v2";
import type { Bundle } from "@/data/grade-one-count20-v2";

/* Gambar Kelas 1 Bab 5: bingkai 10, benda puluhan, stoples, ulat, dan es krim. Benda memakai gambar Bab 1–3. */
const ink = "#2b2320";
export const numName = (n: number) => {
  const w = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh"];
  return n <= 10 ? w[n] : n === 11 ? "sebelas" : n < 20 ? `${w[n - 10]} belas` : "dua puluh";
};
/** Letak acak yang tetap (tidak berubah tiap render). */
const jitter = (k: number, s: number) => { const x = Math.sin(k * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };

/** Benda tersebar (acak tetap), berderet, atau dalam bingkai 10. */
export function Objs({ thing, n, layout, size = 34, spread = 1, label }: { thing: Thing; n: number; layout: "scatter" | "rows" | "frames"; size?: number; spread?: number; label?: string }) {
  const aria = label ?? `${n} ${thingName[thing]}`;
  if (layout === "frames") return <TenFrames n={n} thing={thing} cell={Math.round(size * 0.95)} label={aria} />;
  if (layout === "rows") return <span role="img" aria-label={aria} className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${Math.min(5, n)}, ${size}px)` }}>{Array.from({ length: n }, (_, k) => <Art key={k} thing={thing} className="h-full w-full" />)}</span>;
  const cols = Math.ceil(Math.sqrt(n * 1.6)), rows = Math.ceil(n / cols), cell = size * 1.15 * spread;
  return <span role="img" aria-label={aria} className="relative inline-block" style={{ width: cols * cell, height: rows * cell }}>
    {Array.from({ length: n }, (_, k) => { const c = k % cols, r = Math.floor(k / cols), dx = (jitter(k, n) - 0.5) * (cell - size) * 0.9, dy = (jitter(k + 7, n) - 0.5) * (cell - size) * 0.9;
      return <span key={k} className="absolute" style={{ left: c * cell + (cell - size) / 2 + dx, top: r * cell + (cell - size) / 2 + dy, width: size, height: size }}><Art thing={thing} className="h-full w-full" /></span>; })}
  </span>;
}
/** Dua bingkai 10 mendatar (2 × 5) seperti di buku. */
export function TenFrames({ n, thing = "kelereng", cell = 30, label }: { n: number; thing?: Thing; cell?: number; label?: string }) {
  const frame = (f: number) => <span className="grid grid-cols-5 border-2 border-neutral/40 bg-white" style={{ gridTemplateColumns: `repeat(5, ${cell}px)` }}>
    {Array.from({ length: 10 }, (_, k) => { const i = f * 10 + k; return <span key={k} className="grid place-items-center border border-neutral/20" style={{ height: cell }}>{i < n && <Art thing={thing} className="h-[85%] w-[85%]" />}</span>; })}</span>;
  return <span role="img" aria-label={label ?? `${n} ${thingName[thing]} dalam bingkai 10`} className="inline-flex flex-col gap-1">{frame(0)}{frame(1)}</span>;
}

/* ---------- Benda puluhan ---------- */
const s = { stroke: ink, strokeWidth: 1.2, strokeLinejoin: "round" as const };
const marble = (x: number, y: number, c: string, r = 5) => <g key={`${x}-${y}`}><circle cx={x} cy={y} r={r} fill={c} {...s} /><circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.3} fill="#fff" opacity=".7" /></g>;
const mc = ["#e23d3d", "#2f86d6", "#3f9b45", "#f4a12f", "#8b5cf6"];
const bundleArt: Record<Bundle, ReactNode> = {
  kantong: <><path d="M40 14c-8 0-8-6-4-9 2 3 6 3 8 0 4 3 4 9-4 9z" fill="#c9ced3" {...s} /><path d="M33 14c-16 6-26 22-24 38 2 14 14 22 31 22s29-8 31-22c2-16-8-32-24-38z" fill="#eef6fb" fillOpacity=".7" {...s} />{[[24, 34], [36, 30], [48, 33], [56, 44], [44, 44], [30, 46], [20, 52], [34, 58], [48, 58], [60, 56]].map(([x, y], i) => marble(x, y, mc[i % 5]))}</>,
  pensil: <>{Array.from({ length: 10 }, (_, i) => { const x = 10 + (i % 5) * 12 + (i >= 5 ? 6 : 0), y = i >= 5 ? 16 : 10; return <g key={i}><path d={`M${x} ${y + 8}l5-8 5 8z`} fill="#f2c48d" {...s} /><path d={`M${x + 3.2} ${y + 3}l1.8-3 1.8 3z`} fill={ink} /><rect x={x} y={y + 8} width="10" height="52" fill="#2f86d6" {...s} /><rect x={x} y={y + 58} width="10" height="4" fill="#3a3a3a" /></g>; })}<path d="M8 46h66" stroke="#f6c32d" strokeWidth="4" /></>,
  telur: <><path d="M4 44h72l-6 14H10z" fill="#7cc3e8" {...s} />{Array.from({ length: 10 }, (_, i) => { const x = 12 + (i % 5) * 14, y = i < 5 ? 36 : 28, dx = i < 5 ? 0 : 6; return <ellipse key={i} cx={x + dx} cy={y} rx="6" ry="8" fill="#ef9f6a" {...s} />; })}</>,
  balok: <>{Array.from({ length: 10 }, (_, i) => <g key={i}><rect x="28" y={4 + i * 7} width="24" height="7" fill="#e23d3d" {...s} /><rect x="32" y={2 + i * 7} width="6" height="2" fill="#c12a2a" /><rect x="42" y={2 + i * 7} width="6" height="2" fill="#c12a2a" /></g>)}</>,
};
const oneArt: Record<Bundle, (k: number) => ReactNode> = {
  kantong: k => <svg viewBox="0 0 14 14" className="size-7" aria-hidden="true">{marble(7, 7, mc[k % 5], 5.6)}</svg>,
  pensil: () => <svg viewBox="0 0 12 62" className="h-14 w-3" aria-hidden="true"><path d="M1 9l5-8 5 8z" fill="#f2c48d" {...s} /><rect x="1" y="9" width="10" height="50" fill="#2f86d6" {...s} /><rect x="1" y="57" width="10" height="4" fill="#3a3a3a" /></svg>,
  telur: () => <svg viewBox="0 0 14 18" className="h-8 w-6" aria-hidden="true"><ellipse cx="7" cy="9" rx="6" ry="8" fill="#ef9f6a" {...s} /></svg>,
  balok: () => <svg viewBox="0 0 26 11" className="h-5 w-12" aria-hidden="true"><rect x="1" y="3" width="24" height="7" fill="#e23d3d" {...s} /><rect x="5" y="1" width="6" height="2" fill="#c12a2a" /><rect x="15" y="1" width="6" height="2" fill="#c12a2a" /></svg>,
};
export function PvScene({ bundle, ones }: { bundle: Bundle; ones: number }) {
  return <div role="img" aria-label={`1 puluhan (${bundle === "kantong" ? "10 kelereng dalam kantong" : bundle === "pensil" ? "10 pensil diikat" : bundle === "telur" ? "10 telur dalam wadah" : "10 balok disusun"}) dan ${ones} satuan`} className="flex items-end justify-center gap-4">
    <svg viewBox="0 0 80 78" className="h-28 w-28" aria-hidden="true">{bundleArt[bundle]}</svg>
    <span className="flex max-w-32 flex-wrap items-end justify-center gap-1">{Array.from({ length: ones }, (_, k) => <span key={k}>{oneArt[bundle](k)}</span>)}</span>
  </div>;
}
export function Jar({ thing, n }: { thing: Thing; n: number }) {
  return <div role="img" aria-label={`stoples berisi ${thingName[thing]}`} className="relative h-48 w-40">
    <svg viewBox="0 0 100 120" className="absolute inset-0 h-full w-full" aria-hidden="true"><rect x="22" y="2" width="56" height="12" rx="3" fill="#e0a84a" {...s} /><path d="M18 14h64c6 0 10 4 10 10v84c0 6-4 10-10 10H18c-6 0-10-4-10-10V24c0-6 4-10 10-10z" fill="#e8f4fb" fillOpacity=".6" {...s} /><path d="M16 30v70" stroke="#fff" strokeWidth="3" opacity=".8" /></svg>
    <span className="absolute inset-x-5 bottom-4 top-10 flex flex-wrap-reverse content-start justify-center gap-0.5">{Array.from({ length: n }, (_, k) => <span key={k} style={{ transform: `translate(${(jitter(k, 3) - 0.5) * 6}px, ${(jitter(k, 5) - 0.5) * 6}px)` }}><Art thing={thing} alt={k % 3 === 1} className="size-7" /></span>)}</span>
  </div>;
}
/** Kepala ulat. */
export const CaterHead = () => <svg viewBox="0 0 48 48" className="size-14 shrink-0" aria-hidden="true"><path d="M14 10l-4-8M30 10l4-8" stroke="#3f9b45" strokeWidth="3" strokeLinecap="round" /><circle cx="22" cy="26" r="20" fill="#8bd45a" {...s} /><circle cx="15" cy="22" r="4" fill="#fff" {...s} /><circle cx="29" cy="22" r="4" fill="#fff" {...s} /><circle cx="15" cy="23" r="2" fill={ink} /><circle cx="29" cy="23" r="2" fill={ink} /><circle cx="22" cy="31" r="2.4" fill="#e23d3d" /><path d="M15 37c4 3 10 3 14 0" stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg>;
/** Cone es krim. */
export const Cone = ({ children }: { children: ReactNode }) => <span className="relative inline-flex w-16 flex-col items-center">
  <span className="z-10 grid h-14 w-16 place-items-center rounded-t-[2rem] rounded-b-xl border-2 border-neutral/60 bg-pink-50">{children}</span>
  <svg viewBox="0 0 40 40" className="-mt-1 h-10 w-10" aria-hidden="true"><path d="M3 2h34L20 38z" fill="#e9a35a" {...s} /><path d="M8 8l18 18M16 4l15 15M3 6l22 22M32 8L14 26M24 4L9 19M37 6L16 27" stroke="#b5732f" strokeWidth=".9" /></svg>
</span>;
