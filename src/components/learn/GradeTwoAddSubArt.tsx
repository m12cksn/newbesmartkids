import type { ReactNode } from "react";
import { objectArtNodes } from "@/components/illustrations/ObjectArt";
import type { Thing } from "@/data/grade-two-add-sub";

/* Gambar Bab 2 dalam kotak 48 × 48, dibuat sesuai bentuk benda aslinya. */
export const ink = "#1f3b30";
const o = { stroke: ink, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const butterfly = (wing: string, inner: string) => <>
  <path d="M24 22C20 9 8 8 8 16s8 9 16 6z" fill={wing} {...o} /><path d="M24 22c4-13 16-14 16-6s-8 9-16 6z" fill={wing} {...o} />
  <path d="M24 24c-6 2-14 6-12 12 2 4 9 1 12-12z" fill={inner} {...o} /><path d="M24 24c6 2 14 6 12 12-2 4-9 1-12-12z" fill={inner} {...o} />
  <path d="M24 14v20" stroke={ink} strokeWidth="3" strokeLinecap="round" /><path d="M24 14c-1-4-3-6-5-7M24 14c1-4 3-6 5-7" fill="none" {...o} />
</>;

const art: Record<Thing, ReactNode> = {
  jambu: <><path d="M24 8c-6 0-9 5-10 11-2 8-6 13-6 18 0 4 4 6 8 5 2 0 3-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2c4 1 8-1 8-5 0-5-4-10-6-18-1-6-4-11-10-11z" fill="#e8364f" {...o} /><path d="M18 18c1-4 3-6 5-6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".7" /><path d="M24 8V3" stroke="#6b4a1d" strokeWidth="2" strokeLinecap="round" /><path d="M24 5c3-3 8-3 10 0-3 2-7 2-10 0z" fill="#3fa16b" {...o} /></>,
  donat: objectArtNodes.donut,
  pesawat: <><path d="M4 26c0-2 2-4 6-4h26l8-8h3l-4 10c2 1 3 2 3 3s-2 3-6 3H10c-4 0-6-2-6-4z" fill="#f2b134" {...o} /><path d="M18 22l6-10h5l-3 10M18 30l6 10h5l-3-10" fill="#e5484d" {...o} />{[12, 17, 22, 27, 32].map(x => <circle key={x} cx={x} cy="26" r="1.6" fill="#bfe3f7" stroke={ink} strokeWidth=".8" />)}</>,
  mobil: <><path d="M4 34v-8l6-2 6-10h18l8 10 4 2v8z" fill="#e5484d" {...o} /><path d="M18 16h14l5 8H14z" fill="#bfe3f7" {...o} /><path d="M25 16v8" stroke={ink} strokeWidth="1.4" /><circle cx="14" cy="36" r="5" fill={ink} /><circle cx="14" cy="36" r="2" fill="#d4d4d8" /><circle cx="36" cy="36" r="5" fill={ink} /><circle cx="36" cy="36" r="2" fill="#d4d4d8" /></>,
  kupuMerah: butterfly("#e5484d", "#f59fa3"),
  kupuHijau: butterfly("#3fa16b", "#9fd8a9"),
  kupuKuning: butterfly("#f5c542", "#fbe39a"),
  kelereng: objectArtNodes["marble-blue"],
  ikan: <><path d="M6 24c6-10 22-12 30 0-8 12-24 10-30 0z" fill="#2f86d6" {...o} /><path d="M36 24l9-8v16z" fill="#2f86d6" {...o} /><path d="M18 18c3 4 3 8 0 12M25 17c3 4 3 10 0 14" fill="none" stroke="#bfe3f7" strokeWidth="1.6" /><circle cx="11" cy="22" r="1.6" fill={ink} /></>,
  pisangGoreng: <><path d="M6 30c2-10 12-16 24-16 8 0 13 4 12 9-1 6-10 12-22 13-9 1-15-1-14-6z" fill="#d9952f" {...o} /><path d="M12 28c6-6 16-9 24-7" fill="none" stroke="#a8641a" strokeWidth="2" strokeLinecap="round" />{[[14, 32], [22, 30], [30, 26], [18, 24], [27, 20]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="#f6d28b" />)}</>,
  jeruk: objectArtNodes.orange,
  kue: <><path d="M8 22h32v14c0 3-7 5-16 5S8 39 8 36z" fill="#f2c27b" {...o} /><ellipse cx="24" cy="22" rx="16" ry="5" fill="#f9e2b8" {...o} /><path d="M8 29c0 3 7 5 16 5s16-2 16-5" fill="none" stroke="#c9873a" strokeWidth="2" /><circle cx="24" cy="18" r="3" fill="#e5484d" {...o} /></>,
  tomat: <><circle cx="24" cy="27" r="15" fill="#e5484d" {...o} /><path d="M16 14l8 4 8-4-3 6h-10z" fill="#3fa16b" {...o} /><path d="M24 14V8" stroke="#3fa16b" strokeWidth="2.4" strokeLinecap="round" /></>,
};
export function ThingArt({ t, className = "size-7" }: { t: Thing; className?: string }) {
  return <svg viewBox="0 0 48 48" className={className} aria-hidden="true">{art[t]}</svg>;
}

/** Pot bunga dengan n bunga. */
export function FlowerPot({ n, className = "h-24 w-16" }: { n: number; className?: string }) {
  const spots = [[24, 10], [14, 16], [34, 16], [20, 24], [30, 26], [12, 30], [36, 32], [24, 36], [16, 42]].slice(0, n);
  return <svg viewBox="0 0 48 80" className={className} role="img" aria-label={`Tanaman dengan ${n} bunga`}>
    <path d="M24 70V20" stroke="#3a9a48" strokeWidth="2" />
    {spots.map(([x, y], i) => <g key={i}><path d={`M24 ${y + 14}L${x} ${y}`} stroke="#3a9a48" strokeWidth="1.4" />{[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx={x} cy={y - 3} rx="2.4" ry="3.4" fill="#f27bb3" stroke="#c2357a" strokeWidth=".7" transform={`rotate(${a} ${x} ${y})`} />)}<circle cx={x} cy={y} r="1.6" fill="#a31d5d" /></g>)}
    <path d="M16 54c4-6 6-8 8-8s4 2 8 8" fill="#5fb246" stroke="#3a7a2e" strokeWidth="1" />
    <path d="M10 56h28l-3 20H13z" fill="#e98a3f" {...o} /><rect x="8" y="54" width="32" height="5" rx="1.5" fill="#f2a65a" {...o} />
  </svg>;
}

/** Sempoa dua tiang: kiri biru untuk puluhan, kanan merah untuk satuan. */
export function Abacus({ n, className = "h-20 w-24" }: { n: number; className?: string }) {
  const t = Math.floor(n / 10), u = n % 10;
  const beads = (k: number, x: number, c: string) => Array.from({ length: k }, (_, i) => <rect key={i} x={x - 8} y={56 - (i + 1) * 5.2} width="16" height="4.6" rx="2.3" fill={c} stroke="#00000055" strokeWidth=".6" />);
  return <svg viewBox="0 0 64 70" className={className} role="img" aria-label={`Sempoa ${t} manik biru dan ${u} manik merah`}>
    <path d="M20 10v46M44 10v46" stroke="#6b6b8a" strokeWidth="2.4" strokeLinecap="round" />
    {beads(t, 20, "#2f86d6")}{beads(u, 44, "#e5484d")}
    <rect x="4" y="56" width="56" height="8" rx="3" fill="#8d63c7" {...o} />
  </svg>;
}

/** Bentuk bernilai. */
export function ShapeArt({ s, className = "size-9" }: { s: "lingkaran" | "bintang" | "segitiga"; className?: string }) {
  const node = s === "lingkaran" ? <circle cx="12" cy="12" r="9" fill="#14a3e0" />
    : s === "bintang" ? <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5-4.9-4.5 6.6-.8z" fill="#e0198a" />
      : <path d="M12 3l9.5 17h-19z" fill="#f2b134" />;
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{node}</svg>;
}

/** Kelinci kecil penanda posisi di garis bilangan. */
export const Bunny = ({ className = "size-7" }: { className?: string }) => <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
  <path d="M18 18c-3-8-2-15 1-15s5 7 4 15M28 18c0-8 2-15 5-15s3 7-1 15" fill="#fff" {...o} /><path d="M20 7c0 3 1 6 2 9M31 7c0 3-1 6-2 9" stroke="#f2b8c6" strokeWidth="1.6" />
  <ellipse cx="25" cy="36" rx="13" ry="10" fill="#fff" {...o} /><circle cx="25" cy="23" r="9" fill="#fff" {...o} /><circle cx="22" cy="22" r="1.3" fill={ink} /><circle cx="28" cy="22" r="1.3" fill={ink} /><path d="M24 26h2" stroke="#e8559a" strokeWidth="1.8" strokeLinecap="round" />
</svg>;

/** Burung untuk peraga soal cerita. */
export const Bird = ({ color, className = "size-9" }: { color: string; className?: string }) => <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
  <path d="M8 26c0-9 7-14 15-14 6 0 10 3 12 7l7 1-5 4c0 9-8 13-16 13-8 0-13-4-13-11z" fill={color} {...o} />
  <path d="M15 26c5 0 10 3 12 7-7 1-11-1-12-7z" fill="#00000026" /><circle cx="32" cy="19" r="5" fill="#f5c542" {...o} /><circle cx="33" cy="18" r="1.3" fill={ink} /><path d="M37 19l5 1-5 2z" fill="#a8641a" {...o} />
  <path d="M20 38l-2 6M27 38l1 6" fill="none" stroke="#a8641a" strokeWidth="1.8" strokeLinecap="round" />
</svg>;
