import type { ReactNode } from "react";
import type { Pan, Ray, Scene } from "@/data/grade-eight-linear";
import { idn } from "@/data/grade-eight-linear";
import { FigView } from "./GradeSevenSimilarityArt";
import { M } from "./GradeEightPowersArt";

export { M };
const ink = "#1f3b30", blue = "#1c64b5";

/* ---------- Timbangan dua lengan ---------- */
type Item = { w: number; h: number; node: (x: number, y: number, k: string) => ReactNode };
const boxItem = (label: string): Item => ({ w: 22, h: 22, node: (x, y, k) => <g key={k}><rect x={x} y={y} width="22" height="22" rx="2" fill="#f4a340" stroke="#9a5b0a" strokeWidth="1.2" /><path d={`M${x} ${y + 6}h22`} stroke="#9a5b0a" strokeWidth="0.8" /><text x={x + 11} y={y + 17} textAnchor="middle" fontSize="10" fontWeight="800" fill="#5b3200">{label}</text></g> });
const unitItem: Item = { w: 12, h: 12, node: (x, y, k) => <g key={k}><circle cx={x + 6} cy={y + 6} r="5.4" fill="#3fa36b" stroke="#1f6b46" strokeWidth="1" /><circle cx={x + 4.3} cy={y + 4.2} r="1.5" fill="#d9f5e5" /></g> };
const barItem: Item = { w: 32, h: 8, node: (x, y, k) => <g key={k}><rect x={x} y={y} width="32" height="8" rx="1.5" fill="#8a96a3" stroke="#4a5560" strokeWidth="1" /><path d={`M${x + 3} ${y + 2.5}h26`} stroke="#c3ccd5" strokeWidth="1" /></g> };
const weightItem = (g: number): Item => ({ w: 22, h: 24, node: (x, y, k) => <g key={k}><path d={`M${x + 7} ${y + 6}a4 4 0 1 1 8 0`} fill="none" stroke="#5b6b64" strokeWidth="2" /><path d={`M${x + 3} ${y + 7}h16l3 17h-22z`} fill="#c9d2cf" stroke="#5b6b64" strokeWidth="1.2" /><text x={x + 11} y={y + 20} textAnchor="middle" fontSize="8" fontWeight="800" fill={ink}>{g}g</text></g> });
function itemsOf(p: Pan, boxLabel: string): Item[] {
  return [...Array.from({ length: p.box ?? 0 }, () => boxItem(boxLabel)), ...Array.from({ length: p.bar ?? 0 }, () => barItem), ...(p.weights ?? []).map(weightItem), ...Array.from({ length: p.unit ?? 0 }, () => unitItem)];
}
function stack(items: Item[], cx: number, base: number, width = 104): ReactNode[] {
  const rows: Item[][] = [[]]; let used = 0;
  for (const it of items) { if (used + it.w > width && rows.at(-1)!.length) { rows.push([]); used = 0; } rows.at(-1)!.push(it); used += it.w + 2; }
  const out: ReactNode[] = []; let y = base;
  rows.forEach((row, r) => { const h = Math.max(...row.map(i => i.h)), w = row.reduce((a, i) => a + i.w + 2, -2); let x = cx - w / 2;
    row.forEach((it, j) => { out.push(it.node(x, y - it.h, `${r}-${j}`)); x += it.w + 2; }); y -= h + 1; });
  return out;
}
const describe = (p: Pan, boxLabel: string) => [p.box ? `${p.box} kotak ${boxLabel}` : "", p.bar ? `${p.bar} batang besi` : "", p.weights?.length ? `anak timbangan ${p.weights.join(" g, ")} g` : "", p.unit ? `${p.unit} kelereng` : ""].filter(Boolean).join(", ") || "kosong";
export function BalanceView({ left, right, tilt = 0, boxLabel = "x", className = "w-full max-w-sm", label }: { left: Pan; right: Pan; tilt?: -1 | 0 | 1; boxLabel?: string; className?: string; label?: string }) {
  const a = (tilt * 7 * Math.PI) / 180, L: [number, number] = [150 - 112 * Math.cos(a), 52 - 112 * Math.sin(a)], R: [number, number] = [150 + 112 * Math.cos(a), 52 + 112 * Math.sin(a)];
  const pan = ([x, y]: [number, number], p: Pan, k: string) => <g key={k}>
    <path d={`M${x} ${y}L${x - 50} ${y + 78}M${x} ${y}L${x + 50} ${y + 78}`} stroke="#7b8a84" strokeWidth="1" />
    {stack(itemsOf(p, boxLabel), x, y + 77)}
    <path d={`M${x - 58} ${y + 78}h116l-10 9h-96z`} fill="#b7c4bf" stroke="#5b6b64" strokeWidth="1.2" />
  </g>;
  const state = tilt === 0 ? "seimbang" : tilt > 0 ? "lengan kanan lebih berat" : "lengan kiri lebih berat";
  return <svg viewBox="0 0 300 200" className={className} role="img" aria-label={label ?? `Timbangan ${state}. Kiri: ${describe(left, boxLabel)}. Kanan: ${describe(right, boxLabel)}.`}>
    <path d="M150 52L132 186h36z" fill="#d7dfdb" stroke="#5b6b64" strokeWidth="1.2" /><rect x="112" y="184" width="76" height="8" rx="2" fill="#5b6b64" />
    <line x1={L[0]} y1={L[1]} x2={R[0]} y2={R[1]} stroke="#33413b" strokeWidth="4" strokeLinecap="round" />
    <circle cx="150" cy="52" r="5" fill="#33413b" />
    {pan(L, left, "l")}{pan(R, right, "r")}
  </svg>;
}

/* ---------- Garis bilangan ---------- */
export function NumberLine({ ray, className = "w-full max-w-md", label }: { ray: Ray; className?: string; label?: string }) {
  const span = ray.to - ray.from, step = ray.step ?? (span > 16 ? 2 : 1), W = 320, x0 = 24, x1 = W - 24, X = (v: number) => x0 + ((v - ray.from) / span) * (x1 - x0);
  const ticks: number[] = []; for (let v = Math.ceil(ray.from / step) * step; v <= ray.to; v += step) ticks.push(v);
  const ax = X(ray.at), end = ray.dir === "right" ? x1 + 10 : x0 - 10;
  const words = `${ray.closed ? "bulatan penuh" : "bulatan kosong"} di ${idn(ray.at)}, arsiran ke ${ray.dir === "right" ? "kanan" : "kiri"}`;
  return <svg viewBox={`0 0 ${W} 54`} className={className} role="img" aria-label={label ?? `Garis bilangan ${ray.label ? ray.label + " " : ""}dengan ${words}`}>
    {ray.label && <text x="4" y="16" fontSize="12" fontWeight="800" fill={ink}>{ray.label}.</text>}
    <line x1={x0 - 14} x2={x1 + 14} y1="26" y2="26" stroke="#33413b" strokeWidth="1.5" />
    <path d={`M${x0 - 14} 26l7 -4v8zM${x1 + 14} 26l-7 -4v8z`} fill="#33413b" />
    {ticks.map(v => <g key={v}><line x1={X(v)} x2={X(v)} y1="21" y2="31" stroke="#33413b" strokeWidth="1.2" /><text x={X(v)} y="46" fontSize="10" textAnchor="middle" fill={ink} fontWeight={v === ray.at ? 800 : 500}>{v < 0 ? `−${-v}` : v}</text></g>)}
    <line x1={ax} x2={end} y1="26" y2="26" stroke={blue} strokeWidth="5" strokeLinecap="round" opacity=".85" />
    <path d={ray.dir === "right" ? `M${end + 6} 26l-9 -6v12z` : `M${end - 6} 26l9 -6v12z`} fill={blue} />
    <circle cx={ax} cy="26" r="6" fill={ray.closed ? blue : "#ffffff"} stroke={blue} strokeWidth="2.4" />
  </svg>;
}

/* ---------- Segitiga dengan label sudut dan sisi (tidak berskala) ---------- */
export function TriView({ angles, sides, tall }: { angles?: [string, string, string]; sides?: [string, string, string]; tall?: boolean }) {
  const A: [number, number] = [40, 150], B: [number, number] = [tall ? 160 : 240, 150], C: [number, number] = tall ? [100, 12] : [110, 22];
  const words = [angles ? `sudut ${angles.join(", ")}` : "", sides ? `sisi alas ${sides[0]}, sisi kanan ${sides[1]}, sisi kiri ${sides[2]}` : ""].filter(Boolean).join("; ");
  return <svg viewBox={`0 0 ${tall ? 200 : 280} 175`} className="w-full max-w-xs" role="img" aria-label={`Segitiga dengan ${words}`}>
    <polygon points={[A, B, C].map(p => p.join(",")).join(" ")} fill="#e8f3fb" stroke="#2563a6" strokeWidth="2" strokeLinejoin="round" />
    {angles && <g fontSize="13" fontWeight="800" fill={ink}>
      <text x={A[0] + 14} y={A[1] - 10}>{angles[0]}</text><text x={B[0] - 26} y={B[1] - 10} textAnchor="end">{angles[1]}</text><text x={C[0]} y={C[1] + 28} textAnchor="middle">{angles[2]}</text></g>}
    {sides && <g fontSize="13" fontWeight="800" fill={blue}>
      <text x={(A[0] + B[0]) / 2} y={A[1] + 18} textAnchor="middle">{sides[0]}</text><text x={(B[0] + C[0]) / 2 + 10} y={(B[1] + C[1]) / 2}>{sides[1]}</text><text x={(A[0] + C[0]) / 2 - 10} y={(A[1] + C[1]) / 2} textAnchor="end">{sides[2]}</text></g>}
  </svg>;
}

/* ---------- Kolam balok ---------- */
export function PoolView({ p, l, t }: { p: string; l: string; t: string }) {
  return <svg viewBox="-56 0 336 170" className="w-full max-w-xs" role="img" aria-label={`Kolam berbentuk balok, panjang ${p}, lebar ${l}, kedalaman ${t}`}>
    <path d="M40 60h150l50 -34h-150z" fill="#bfe3f6" stroke="#2563a6" strokeWidth="1.5" />
    <path d="M40 60v80h150v-80" fill="#d9eef9" stroke="#2563a6" strokeWidth="1.5" /><path d="M190 140l50 -34v-80" fill="#c5e4f4" stroke="#2563a6" strokeWidth="1.5" />
    <path d="M40 60v80h150l50 -34" fill="none" stroke="#2563a6" strokeWidth="1.5" />
    {[78, 102, 126].map(y => <path key={y} d={`M48 ${y}q12 -5 24 0t24 0t24 0t24 0t24 0t14 0`} fill="none" stroke="#7fb6dc" strokeWidth="1.2" />)}
    <text x="115" y="158" textAnchor="middle" fontSize="12" fontWeight="800" fill={blue}>{p}</text>
    <text x="226" y="132" fontSize="12" fontWeight="800" fill={blue}>{l}</text>
    <text x="34" y="104" textAnchor="end" fontSize="12" fontWeight="800" fill="#b42318">{t}</text>
  </svg>;
}

/* ---------- Mobil pick up ---------- */
export function TruckView({ cap, crew, box }: { cap: string; crew: string; box: string }) {
  return <svg viewBox="0 0 300 160" className="w-full max-w-sm" role="img" aria-label={`Mobil pick up dengan muatan maksimal ${cap}, pengemudi dan kernet ${crew}, setiap kotak ${box}`}>
    <line x1="0" x2="300" y1="138" y2="138" stroke="#5b6b64" strokeWidth="2" />
    <path d="M190 112V66h40l26 26h18v20z" fill="#2b8a3e" stroke="#1d5c2a" strokeWidth="1.5" />
    <path d="M200 72h26l18 20h-44z" fill="#d6ecf7" stroke="#1d5c2a" strokeWidth="1" />
    <rect x="30" y="92" width="162" height="22" fill="#2b8a3e" stroke="#1d5c2a" strokeWidth="1.5" />
    {[0, 1, 2, 3, 4].map(i => <g key={i}><rect x={38 + i * 30} y="64" width="28" height="28" fill="#d9a066" stroke="#8a5a2b" strokeWidth="1.2" /><path d={`M${38 + i * 30} 72h28M${52 + i * 30} 64v8`} stroke="#8a5a2b" strokeWidth="1" /></g>)}
    {[[70, 0], [238, 1]].map(([x, k]) => <g key={k}><circle cx={x} cy="120" r="16" fill="#33413b" /><circle cx={x} cy="120" r="7" fill="#c9d2cf" /></g>)}
    <text x="110" y="56" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>{`kotak ${box} per buah`}</text>
    <text x="110" y="108" textAnchor="middle" fontSize="11" fontWeight="800" fill="#ffffff">{`muatan maks. ${cap}`}</text>
    <text x="226" y="58" textAnchor="middle" fontSize="10" fontWeight="800" fill={ink}>{`awak ${crew}`}</text>
  </svg>;
}

/* ---------- Sepatu dan sandal ---------- */
const Shoe = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><path d="M2 22c0-6 2-14 6-16l10 6c5 3 12 4 18 5c5 1 8 3 8 7v4H2z" fill="#2f6fb8" stroke="#1c3f6b" strokeWidth="1.2" /><path d="M2 26h42" stroke="#ffffff" strokeWidth="2.5" /><path d="M14 10l-3 5M19 12l-3 5M24 14l-2 4" stroke="#ffffff" strokeWidth="1.3" /></g>;
const Sandal = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><ellipse cx="22" cy="20" rx="20" ry="8" fill="#e8a33d" stroke="#9a5b0a" strokeWidth="1.2" /><path d="M8 18q8 -14 14 -6q6 -8 14 6" fill="none" stroke="#b42318" strokeWidth="2.6" strokeLinecap="round" /></g>;
export function ShopView({ shoes, sandals, total }: { shoes: number; sandals: number; total: string }) {
  return <svg viewBox="0 0 300 120" className="w-full max-w-sm" role="img" aria-label={`${shoes} pasang sepatu dan ${sandals} pasang sandal, total ${total}`}>
    <Shoe x={14} y={18} /><Shoe x={22} y={30} /><text x="78" y="46" fontSize="14" fontWeight="800" fill={ink}>× {shoes}</text>
    <Sandal x={156} y={18} /><Sandal x={164} y={30} /><text x="222" y="46" fontSize="14" fontWeight="800" fill={ink}>× {sandals}</text>
    <text x="40" y="86" textAnchor="middle" fontSize="11" fontWeight="700" fill={blue}>sepatu = 2s</text><text x="184" y="86" textAnchor="middle" fontSize="11" fontWeight="700" fill={blue}>sandal = s</text>
    <text x="150" y="112" textAnchor="middle" fontSize="12" fontWeight="800" fill="#b42318">Total {total}</text>
  </svg>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "balance": return <BalanceView left={scene.left} right={scene.right} tilt={scene.tilt} />;
    case "balances": return <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">{scene.items.map(it => <figure key={it.caption} className="flex flex-col items-center"><BalanceView left={it.left} right={it.right} tilt={it.tilt} className="w-full max-w-64" label={`Gambar ${it.caption}: ${it.tilt === 0 ? "seimbang" : it.tilt === 1 ? "lengan kanan lebih berat" : "lengan kiri lebih berat"}. Kiri: ${describe(it.left, "x")}. Kanan: ${describe(it.right, "x")}.`} /><figcaption className="text-sm font-semibold">{it.caption}</figcaption></figure>)}</div>;
    case "lines": return <div className="w-full space-y-1">{scene.items.map((r, i) => <NumberLine key={i} ray={r} />)}</div>;
    case "fig": return <figure className="flex w-full max-w-xs flex-col items-center gap-1"><FigView fig={scene.fig} className="w-full max-w-56 overflow-visible px-6" label={scene.caption ?? `Segitiga dengan sudut ${(scene.fig.angles ?? []).filter(Boolean).join(", ")}${scene.fig.sides ? `, sisi ${scene.fig.sides.filter(Boolean).join(", ")}` : ""}`} />{scene.caption && <figcaption className="text-sm font-semibold">{scene.caption}</figcaption>}</figure>;
    case "tri": return <TriView angles={scene.angles} sides={scene.sides} tall={scene.tall} />;
    case "pool": return <PoolView p={scene.p} l={scene.l} t={scene.t} />;
    case "truck": return <TruckView cap={scene.cap} crew={scene.crew} box={scene.box} />;
    case "shop": return <ShopView shoes={scene.shoes} sandals={scene.sandals} total={scene.total} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
  }
}
