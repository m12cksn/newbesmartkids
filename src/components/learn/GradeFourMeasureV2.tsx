"use client";

import { ArrowLeft, ArrowRight, Droplet, Eraser, Minus, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  assessment, cells, correct, fmt, formatAnswer, practice, ready, SEP, splitParts, thingName, topics,
  type MQuestion, type Part, type Poly, type Scene, type Thing,
} from "@/data/grade-four-measure-v2";

const ink = "#2b2320";

/* ====================================================================== */
/* Bangun berpetak                                                         */
/* ====================================================================== */
const halfPath = (c: string, x: number, y: number, s: number) => {
  const [l, r, t, b] = [x, x + s, y, y + s];
  return c === "a" ? `M${r} ${t}L${r} ${b}L${l} ${b}Z` : c === "b" ? `M${l} ${t}L${r} ${b}L${l} ${b}Z` : c === "c" ? `M${l} ${t}L${r} ${t}L${r} ${b}Z` : `M${l} ${t}L${r} ${t}L${l} ${b}Z`;
};
const polySize = (p: Poly) => [Math.max(...p.rows.map(r => r.length)) + 1, p.rows.length + 1] as const;
export function PolyView({ poly, cell = 26, fill = "#f6b26b", fluid = false }: { poly: Poly; cell?: number; fill?: string; fluid?: boolean }) {
  const rows = poly.rows, [W, H] = polySize(poly), pad = 0.5;
  return <figure className={`flex min-w-0 flex-col items-center gap-0.5 ${fluid ? "" : "shrink-0"}`} style={fluid ? { flex: `${W} 1 0`, maxWidth: W * cell } : undefined}>
    {poly.label && <figcaption className="text-base font-extrabold leading-tight text-sky-700">{poly.label}</figcaption>}
    <svg role="img" aria-label={`Bangun ${poly.label ?? ""} pada kertas berpetak`} width={fluid ? undefined : W * cell} viewBox={`0 0 ${W * cell} ${H * cell}`} className="h-auto w-full">
      <rect width="100%" height="100%" fill="#fff" />
      {Array.from({ length: W }, (_, i) => <line key={`v${i}`} x1={(i + pad) * cell} y1={0} x2={(i + pad) * cell} y2={H * cell} stroke="#b9d4ec" strokeWidth="1" />)}
      {Array.from({ length: H }, (_, i) => <line key={`h${i}`} x1={0} y1={(i + pad) * cell} x2={W * cell} y2={(i + pad) * cell} stroke="#b9d4ec" strokeWidth="1" />)}
      {rows.flatMap((r, y) => r.split("").map((c, x) => {
        const X = (x + pad) * cell, Y = (y + pad) * cell;
        if (c === "#") return <rect key={`${x}-${y}`} x={X} y={Y} width={cell} height={cell} fill={fill} stroke={ink} strokeWidth="1.3" />;
        if ("abcd".includes(c)) return <path key={`${x}-${y}`} d={halfPath(c, X, Y, cell)} fill={fill} stroke={ink} strokeWidth="1.3" strokeLinejoin="round" />;
        return null;
      }))}
    </svg>
  </figure>;
}
/** Semua bangun dalam satu gambar memakai ukuran petak yang sama agar luasnya bisa dibandingkan. */
function PolyRow({ polys, cell, total }: { polys: Poly[]; cell: number; total: number }) {
  const w = polys.reduce((a, p) => a + polySize(p)[0], 0);
  return <div className="mx-auto flex items-end justify-center gap-2" style={{ width: `${(100 * w) / total}%`, maxWidth: w * cell + (polys.length - 1) * 8 }}>{polys.map((p, i) => <PolyView key={i} poly={p} cell={cell} fluid />)}</div>;
}
function PolyScene({ polys }: { polys: Poly[] }) {
  const h = Math.max(...polys.map(p => polySize(p)[1])), wAll = polys.reduce((a, p) => a + polySize(p)[0], 0);
  const cell = Math.max(16, Math.min(30, Math.floor(620 / wAll), Math.floor(200 / h)));
  const rows = polys.length > 3 ? [polys.slice(0, Math.ceil(polys.length / 2)), polys.slice(Math.ceil(polys.length / 2))] : [polys];
  const widest = Math.max(...rows.map(r => r.reduce((a, p) => a + polySize(p)[0], 0)));
  return <div className="w-full">
    <div className={`flex-col gap-1.5 ${rows.length > 1 ? "flex sm:hidden" : "hidden"}`}>{rows.map((r, i) => <PolyRow key={i} polys={r} cell={24} total={widest} />)}</div>
    <div className={rows.length > 1 ? "hidden sm:block" : ""}><PolyRow polys={polys} cell={cell} total={wAll} /></div>
  </div>;
}

/* ====================================================================== */
/* Benda nyata                                                             */
/* ====================================================================== */
export function ThingArt({ thing, size = 56 }: { thing: Thing; size?: number }) {
  const s = { width: size, height: size, viewBox: "0 0 60 60", "aria-hidden": true } as const;
  switch (thing) {
    case "lapangan": return <svg {...s}><rect x="3" y="12" width="54" height="36" rx="2" fill="#4caf50" stroke={ink} strokeWidth="1.4" /><g stroke="#fff" strokeWidth="1.3" fill="none"><rect x="6" y="15" width="48" height="30" /><path d="M30 15v30" /><circle cx="30" cy="30" r="5" /><rect x="6" y="23" width="6" height="14" /><rect x="48" y="23" width="6" height="14" /></g></svg>;
    case "kolam": return <svg {...s}><rect x="4" y="14" width="52" height="34" rx="3" fill="#d9e3ea" stroke={ink} strokeWidth="1.4" /><rect x="8" y="18" width="44" height="26" fill="#4fb3e8" />{[24, 31, 38].map(y => <path key={y} d={`M8 ${y}h44`} stroke="#fff" strokeWidth="1" strokeDasharray="3 2" />)}<path d="M46 10v12M51 10v12M46 14h5M46 19h5" stroke="#8a97a3" strokeWidth="1.6" /></svg>;
    case "bingkai": return <svg {...s}><rect x="10" y="8" width="40" height="44" rx="1" fill="#a0672f" stroke={ink} strokeWidth="1.4" /><rect x="16" y="14" width="28" height="32" fill="#cfe9f7" stroke={ink} strokeWidth="1" /><circle cx="30" cy="25" r="5" fill="#f2c6a0" /><path d="M20 46c1-8 6-11 10-11s9 3 10 11z" fill="#e2574c" /></svg>;
    case "buku": return <svg {...s}><path d="M14 8h30a2 2 0 012 2v40a2 2 0 01-2 2H14z" fill="#2f74c0" stroke={ink} strokeWidth="1.4" /><path d="M14 8v44" stroke="#1d4f86" strokeWidth="4" /><rect x="22" y="16" width="18" height="8" rx="1" fill="#fff" /><path d="M22 30h18M22 34h14" stroke="#cfe0f5" strokeWidth="1.5" /></svg>;
    case "perangko": return <svg {...s}><path d="M16 10h28v40H16z" fill="#fff" stroke={ink} strokeWidth="1.2" strokeDasharray="2.2 1.6" /><rect x="19" y="13" width="22" height="26" fill="#f3c74a" /><path d="M21 37l7-10 5 6 3-4 5 8z" fill="#4c9a4c" /><circle cx="35" cy="19" r="3" fill="#e2574c" /><text x="30" y="47" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink}>1000</text></svg>;
    case "halaman": return <svg {...s}><rect x="3" y="30" width="54" height="22" fill="#d6c8a6" stroke={ink} strokeWidth="1.2" /><path d="M8 30V16l22-8 22 8v14z" fill="#f4efe4" stroke={ink} strokeWidth="1.3" /><rect x="26" y="20" width="8" height="10" fill="#a0672f" /><rect x="12" y="19" width="7" height="6" fill="#9fd1ec" /><rect x="41" y="19" width="7" height="6" fill="#9fd1ec" /><path d="M30 38v12M30 38h7l-2 2 2 2h-7" stroke={ink} strokeWidth="1.2" fill="#e2574c" /></svg>;
    case "saputangan": return <svg {...s}><path d="M10 12h40v36H10z" fill="#f9d8e3" stroke={ink} strokeWidth="1.4" /><rect x="14" y="16" width="32" height="28" fill="none" stroke="#e2789c" strokeWidth="1.5" strokeDasharray="3 2" /><path d="M10 48l6-6M50 48l-6-6" stroke="#e2789c" strokeWidth="1.2" /></svg>;
    case "basket": return <svg {...s}><rect x="3" y="12" width="54" height="36" rx="2" fill="#e09a52" stroke={ink} strokeWidth="1.4" /><g stroke="#fff" strokeWidth="1.3" fill="none"><path d="M30 12v36" /><circle cx="30" cy="30" r="5" /><path d="M3 22h8a8 8 0 010 16H3M57 22h-8a8 8 0 000 16h8" /></g></svg>;
    case "sendok": return <svg {...s}><path d="M22 34c0-8 4-14 10-14s10 6 10 14-4 10-10 10-10-2-10-10z" fill="#fff" stroke={ink} strokeWidth="1.4" transform="rotate(-35 32 32)" /><path d="M24 44L10 56" stroke={ink} strokeWidth="4" strokeLinecap="round" /><path d="M24 44L10 56" stroke="#d6dde3" strokeWidth="2" strokeLinecap="round" /><path d="M32 26l8 6M30 30l8 6" stroke="#9aa6b1" strokeWidth="1" /></svg>;
    case "ember": return <svg {...s}><path d="M12 18h36l-4 34H16z" fill="#3a8fd8" stroke={ink} strokeWidth="1.4" /><ellipse cx="30" cy="18" rx="18" ry="4" fill="#7cc0f2" stroke={ink} strokeWidth="1.4" /><path d="M12 18C12 2 48 2 48 18" fill="none" stroke={ink} strokeWidth="1.6" /></svg>;
    case "parfum": return <svg {...s}><rect x="26" y="6" width="8" height="6" fill="#c9a24a" stroke={ink} strokeWidth="1.1" /><rect x="28" y="12" width="4" height="6" fill="#e8e8e8" stroke={ink} strokeWidth="1" /><rect x="16" y="18" width="28" height="34" rx="6" fill="#f7c8dc" stroke={ink} strokeWidth="1.4" /><rect x="22" y="28" width="16" height="12" rx="2" fill="#fff" opacity=".8" /></svg>;
    case "tong": return <svg {...s}><path d="M14 10h32v42H14z" fill="#2e7fc2" stroke={ink} strokeWidth="1.4" /><ellipse cx="30" cy="10" rx="16" ry="4" fill="#5aa7e3" stroke={ink} strokeWidth="1.4" /><ellipse cx="30" cy="52" rx="16" ry="4" fill="#2e7fc2" stroke={ink} strokeWidth="1.4" /><path d="M14 22c10 4 22 4 32 0M14 40c10 4 22 4 32 0" stroke="#1c5a8f" strokeWidth="2" fill="none" /><rect x="40" y="44" width="10" height="4" fill="#9aa6b1" stroke={ink} strokeWidth="1" /></svg>;
    case "obat": return <svg {...s}><path d="M27 6h6l2 10h-10z" fill="#fff" stroke={ink} strokeWidth="1.2" /><rect x="22" y="16" width="16" height="6" rx="1" fill="#3f9b45" stroke={ink} strokeWidth="1.1" /><rect x="20" y="22" width="20" height="30" rx="4" fill="#e8f3fb" stroke={ink} strokeWidth="1.4" /><rect x="23" y="30" width="14" height="12" fill="#fff" stroke="#9aa6b1" strokeWidth=".8" /><path d="M30 33v6M27 36h6" stroke="#e2574c" strokeWidth="1.6" /></svg>;
    case "galon": return <svg {...s}><rect x="25" y="4" width="10" height="6" fill="#3a8fd8" /><path d="M18 14c0-3 4-4 7-4h10c3 0 7 1 7 4v36c0 3-2 6-6 6H24c-4 0-6-3-6-6z" fill="#bfe3fb" stroke={ink} strokeWidth="1.4" /><path d="M18 26h24M18 38h24" stroke="#7cc0f2" strokeWidth="1.4" /></svg>;
  }
}

/* ====================================================================== */
/* Botol, kotak minuman, kubus                                             */
/* ====================================================================== */
/** Botol sabun pompa; `level` 0..1 isi cairan. */
function PumpBottle({ level = 1, h = 120, label }: { level?: number; h?: number; label?: string }) {
  const id = "pb" + useId().replace(/[^a-zA-Z0-9]/g, ""), w = h * 0.55, inner = 64, top = 46, fillH = inner * Math.min(1, level);
  return <svg role="img" aria-label={label ? `Botol besar ${label}` : "Botol besar"} width={w} height={h} viewBox="0 0 66 120">
    <path d="M28 4h18v5H38v6h-6V9h-4z" fill="#3a3a3a" /><rect x="29" y="15" width="8" height="10" fill="#555" /><rect x="22" y="25" width="22" height="9" rx="2" fill="#e8e8e8" stroke={ink} strokeWidth="1.2" />
    <path d="M10 46c0-8 6-12 12-12h22c6 0 12 4 12 12v62a8 8 0 01-8 8H18a8 8 0 01-8-8z" fill="#fff" stroke={ink} strokeWidth="1.6" />
    <clipPath id={id}><path d="M11 46c0-7 6-11 11-11h22c5 0 11 4 11 11v62a7 7 0 01-7 7H18a7 7 0 01-7-7z" /></clipPath>
    <rect x="10" y={top + inner + 6 - fillH} width="46" height={fillH + 10} fill="#7bc9a8" clipPath={`url(#${id})`} />
    {label && <text x="33" y="80" textAnchor="middle" fontSize="18" fontWeight="800" fill={ink}>{label}</text>}
  </svg>;
}
function SmallBottle({ full = true, h = 34 }: { full?: boolean; h?: number }) {
  return <svg aria-hidden="true" width={h * 0.55} height={h} viewBox="0 0 22 40"><rect x="8" y="1" width="6" height="5" fill="#3a3a3a" /><path d="M5 10c0-3 2-4 4-4h4c2 0 4 1 4 4v26a3 3 0 01-3 3H8a3 3 0 01-3-3z" fill={full ? "#7bc9a8" : "#fff"} stroke={ink} strokeWidth="1.3" /></svg>;
}
function Carton({ name, ml }: { name: string; ml: number }) {
  const color = /cokelat/i.test(name) ? "#8b5a2b" : /stroberi/i.test(name) ? "#e2789c" : /jeruk/i.test(name) ? "#f59e2b" : /teh/i.test(name) ? "#b5651d" : /vanila/i.test(name) ? "#e8c766" : "#3a8fd8";
  const h = ml >= 1000 ? 110 : ml >= 500 ? 88 : ml >= 250 ? 66 : 54;
  return <figure className="flex flex-col items-center gap-1">
    <svg role="img" aria-label={`${name} ${fmt(ml)} ml`} width={h * 0.55} height={h} viewBox="0 0 44 80" preserveAspectRatio="none"><path d="M6 14l6-10h20l6 10z" fill="#f4f4f4" stroke={ink} strokeWidth="1.3" /><rect x="6" y="14" width="32" height="64" fill="#fff" stroke={ink} strokeWidth="1.4" /><rect x="6" y="30" width="32" height="28" fill={color} /><path d="M30 4v-3" stroke={ink} strokeWidth="1.2" /></svg>
    <figcaption className="text-center text-sm font-bold leading-tight">{name}<br /><span className="text-base font-extrabold text-sky-700">{fmt(ml)} ml</span></figcaption>
  </figure>;
}
/** Bangun kubus satuan isometrik. heights[r][c]: r = baris depan → belakang. */
export function CubeStack({ heights, a = 18, label }: { heights: number[][]; a?: number; label?: string }) {
  const list: { x: number; y: number; z: number }[] = [];
  heights.forEach((row, r) => row.forEach((h, c) => { for (let z = 0; z < h; z++) list.push({ x: c, y: heights.length - 1 - r, z }); }));
  // Proyeksi isometrik: +x ke kanan-bawah, +y ke kiri-bawah (ke arah pembaca), +z ke atas.
  const ca = a * 0.866, P = (x: number, y: number, z: number) => [(x - y) * ca, (x + y) * a * 0.5 - z * a] as const;
  list.sort((p, q) => (p.x + p.y) - (q.x + q.y) || p.z - q.z);
  const all = list.flatMap(({ x, y, z }) => [0, 1].flatMap(i => [0, 1].flatMap(j => [0, 1].map(k => P(x + i, y + j, z + k)))));
  const minX = Math.min(...all.map(p => p[0])) - 2, maxX = Math.max(...all.map(p => p[0])) + 2, minY = Math.min(...all.map(p => p[1])) - 2, maxY = Math.max(...all.map(p => p[1])) + 2;
  const pts = (...ps: (readonly [number, number])[]) => ps.map(p => p.join(",")).join(" ");
  return <figure className="flex flex-col items-center gap-1">
    {label && <figcaption className="text-base font-extrabold text-sky-700">{label}</figcaption>}
    <svg role="img" aria-label={`Bangun ${label ?? ""} dari kubus satuan. Tinggi tumpukan dari baris depan ke belakang: ${heights.map(r => r.join(", ")).join("; ")}`} width={maxX - minX} height={maxY - minY} viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} className="h-auto max-w-full">
      {list.map(({ x, y, z }, i) => {
        const top = pts(P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1));
        const front = pts(P(x, y + 1, z), P(x, y + 1, z + 1), P(x + 1, y + 1, z + 1), P(x + 1, y + 1, z));
        const side = pts(P(x + 1, y, z), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x + 1, y + 1, z));
        return <g key={i} stroke={ink} strokeWidth="1" strokeLinejoin="round"><polygon points={top} fill="#a8daf8" /><polygon points={front} fill="#4a9fdb" /><polygon points={side} fill="#2f7fbf" /></g>;
      })}
    </svg>
  </figure>;
}
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "polys": return <PolyScene polys={scene.polys} />;
    case "bottles": return <div className="flex flex-wrap items-end justify-center gap-3">{scene.rows.map(r => <figure key={r.label} className="flex flex-col items-center gap-1">
      <PumpBottle label={r.label} h={66} />
      <div className="flex max-w-20 flex-wrap justify-center gap-0.5" role="img" aria-label={`${r.small} botol kecil`}>{Array.from({ length: r.small }, (_, k) => <SmallBottle key={k} h={20} />)}</div>
</figure>)}</div>;
    case "cartons": return <div className="flex flex-wrap items-end justify-center gap-4">{scene.items.map(c => <Carton key={c.name} {...c} />)}</div>;
    case "cubes": { const big = Math.max(...scene.shapes.map(s => Math.max(s.heights.length, ...s.heights.map(r => r.length)))); return <div className="flex flex-wrap items-end justify-center gap-6">{scene.shapes.map((s, i) => <CubeStack key={i} heights={s.heights} label={s.label} a={big > 3 ? 20 : 24} />)}</div>; }
  }
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, disabled }: { label: string; value: number; set: (n: number) => void; min: number; max: number; disabled?: boolean }) {
  return <span role="group" aria-label={label} className="flex flex-col items-center gap-0.5"><span className="text-xs font-bold">{label}</span>
    <span className="flex items-center gap-1"><button type="button" aria-label={`${label} kurangi`} className="btn btn-sm btn-square btn-outline" disabled={disabled || value <= min} onClick={() => set(value - 1)}><Minus className="size-4" aria-hidden="true" /></button>
      <span className="min-w-8 text-center text-xl font-extrabold tabular-nums">{value}</span>
      <button type="button" aria-label={`${label} tambah`} className="btn btn-sm btn-square btn-outline" disabled={disabled || value >= max} onClick={() => set(value + 1)}><Plus className="size-4" aria-hidden="true" /></button></span>
  </span>;
}
/** Kertas berpetak yang bisa diarsir dengan mengetuk. */
function ShadeGrid({ cols, rows, on, toggle, disabled, cell = 40 }: { cols: number; rows: number; on: number[]; toggle: (k: number) => void; disabled?: boolean; cell?: number }) {
  return <div role="group" aria-label="Kertas berpetak" className="inline-grid border-l border-t border-sky-300 bg-white" style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)` }}>
    {Array.from({ length: cols * rows }, (_, k) => <button key={k} type="button" aria-label={`Petak baris ${Math.floor(k / cols) + 1} kolom ${(k % cols) + 1}`} aria-pressed={on.includes(k)} disabled={disabled} onClick={() => toggle(k)}
      className={`border-b border-r border-sky-300 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-success ${on.includes(k) ? "bg-[#f6b26b]" : "bg-white hover:bg-orange-50"}`} style={{ height: cell }} />)}
  </div>;
}
/** Tuang botol kecil ke botol besar. */
function PourView({ small, poured, pour, undo, disabled }: { small: number; poured: number; pour: () => void; undo: () => void; disabled?: boolean }) {
  const over = poured > small;
  return <div className="flex flex-wrap items-end justify-center gap-4">
    <div className="flex flex-col items-center gap-1"><PumpBottle level={poured / small} h={130} />
      <span className={`text-sm font-bold ${over ? "text-error" : poured === small ? "text-success" : ""}`}>{over ? "Tumpah! Terlalu banyak." : poured === small ? "Tepat penuh" : poured ? "Belum penuh" : "Masih kosong"}</span></div>
    <div className="flex flex-col items-center gap-2">
      <div className="flex max-w-40 flex-wrap justify-center gap-1" aria-label={`${poured} botol kecil sudah dituang`}>{Array.from({ length: Math.max(poured, 1) }, (_, k) => k < poured ? <SmallBottle key={k} full={false} h={30} /> : <span key={k} className="text-xs text-base-content/50">belum ada</span>)}</div>
      <div className="flex gap-2"><button type="button" className="btn btn-success gap-1" disabled={disabled || poured >= 12} onClick={pour}><Droplet className="size-4" aria-hidden="true" />Tuang 1 botol kecil</button>
        <button type="button" aria-label="Batal satu tuangan" className="btn btn-ghost btn-square" disabled={disabled || poured <= 0} onClick={undo}><Undo2 className="size-4" aria-hidden="true" /></button></div>
      <SmallBottle h={44} />
    </div>
  </div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
function AreaLab() {
  const [on, setOn] = useState<number[]>([]), [unit, setUnit] = useState<"cm" | "m">("cm");
  const n = on.length, cols = 8, rows = 5;
  const filled = on.map(k => [k % cols, Math.floor(k / cols)]), xs = filled.map(f => f[0]), ys = filled.map(f => f[1]);
  const w = n ? Math.max(...xs) - Math.min(...xs) + 1 : 0, h = n ? Math.max(...ys) - Math.min(...ys) + 1 : 0, isRect = n > 0 && w * h === n;
  return <div className="space-y-2.5">
    <div role="radiogroup" aria-label="Ukuran petak" className="flex flex-wrap gap-1.5">{(["cm", "m"] as const).map(u => <button key={u} type="button" role="radio" aria-checked={unit === u} onClick={() => setUnit(u)} className={`btn btn-sm ${unit === u ? "btn-success" : "btn-outline"}`}>Petak 1 {u} × 1 {u}</button>)}</div>
    <div className="flex justify-center overflow-x-auto [@media(max-height:700px)]:[zoom:0.75]"><ShadeGrid cols={cols} rows={rows} on={on} cell={34} toggle={k => setOn(on.includes(k) ? on.filter(x => x !== k) : [...on, k])} /></div>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-ghost btn-sm gap-1" disabled={!n} onClick={() => setOn([])}><RotateCcw className="size-4" aria-hidden="true" />Hapus arsiran</button></div>
    <Result value={`${n}:${unit}:${isRect ? `${w}x${h}` : "-"}`}>{n === 0 ? "Ketuk petak untuk mengarsir. Setiap petak adalah 1 persegi satuan." : <>Luas yang diarsir <strong>{n} {unit}²</strong>.{isRect && n > 1 ? ` Bentuknya persegi panjang ${w} × ${h} = ${n}.` : ""}{unit === "m" ? ` Itu sama dengan ${fmt(n * 10000)} cm².` : ""}</>}</Result>
  </div>;
}
function VolumeLab() {
  const [tab, setTab] = useState<"botol" | "kubus">("botol");
  const [small, setSmall] = useState(4), [poured, setPoured] = useState(0);
  const [p, setP] = useState(3), [l, setL] = useState(2), [t, setT] = useState(2);
  return <div className="space-y-2.5">
    <div role="tablist" aria-label="Peraga volume" className="flex flex-wrap gap-1.5">{([["botol", "Tuang botol"], ["kubus", "Susun kubus"]] as const).map(([k, n]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`btn btn-sm ${tab === k ? "btn-success" : "btn-outline"}`}>{n}</button>)}</div>
    {tab === "botol" ? <>
      <div className="flex justify-center"><Stepper label="Isi botol besar (botol kecil)" value={small} set={x => { setSmall(x); setPoured(0); }} min={2} max={8} /></div>
      <div className="[@media(max-height:700px)]:[zoom:0.75]"><PourView small={small} poured={poured} pour={() => setPoured(poured + 1)} undo={() => setPoured(poured - 1)} /></div>
      <Result value={`botol:${small}:${poured}`}>{poured === small ? `Tepat penuh! Volume botol besar = ${small} botol kecil.` : poured > small ? "Botol besar meluap. Batalkan satu tuangan." : `Sudah ${poured} botol kecil. Tuang lagi sampai tepat penuh.`}</Result>
    </> : <>
      <div className="flex flex-wrap justify-around gap-2"><Stepper label="Panjang" value={p} set={setP} min={1} max={5} /><Stepper label="Lebar" value={l} set={setL} min={1} max={4} /><Stepper label="Tinggi" value={t} set={setT} min={1} max={4} /></div>
      <div className="flex justify-center rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.7]"><CubeStack heights={Array.from({ length: l }, () => Array(p).fill(t))} a={p + l > 7 ? 18 : 22} /></div>
      <Result value={`kubus:${p}x${l}x${t}`}>Satu lapis berisi {p} × {l} = {p * l} kubus. Ada {t} lapis, jadi volumenya <strong>{p} × {l} × {t} = {p * l * t} cm³</strong>.</Result>
    </>}
  </div>;
}
const labs: Record<string, () => ReactNode> = { area: AreaLab, volume: VolumeLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function Box({ value, onChange, label, disabled, size = 3 }: { value: string; onChange: (v: string) => void; label: string; disabled: boolean; size?: number }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/[^\d.]/g, "").slice(0, 7))}
    className={`h-11 ${size >= 5 ? "w-28" : size >= 3 ? "w-20" : size >= 2 ? "w-16" : "w-12"} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none sm:text-2xl`} />;
}
function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = Array.from({ length: p.left.length }, (_, k) => (value ? value.split("|") : [])[k] ?? ""), n = p.left.length, m = p.right.length, H = 1000;
  return <div className="space-y-1.5">
    <p className="text-sm text-base-content/70">{sel === null ? "Ketuk kotak di kiri, lalu ketuk pasangannya di kanan." : "Sekarang ketuk pasangannya di kanan."}</p>
    <div className="grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)]" style={{ minHeight: Math.max(n, m) * 46 }}>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${l}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`rounded-xl border-2 px-1.5 py-1 text-lg font-extrabold ${sel === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-info/60 bg-base-100" : "border-orange-300 bg-orange-50"}`}>{l}</button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / m) * H} stroke="#0f766e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${m}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || sel === null} aria-label={`Hubungkan ke ${r}`} onClick={() => { if (sel === null) return; const v = [...vals]; v[sel] = String(j); set(v.join("|")); setSel(null); }}
        className="rounded-xl border-2 border-purple-300 bg-purple-50 px-1.5 py-1 text-lg font-extrabold">{r}</button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
function SortPart({ p, value, set, checked }: { p: Extract<Part, { kind: "sort" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = Array.from({ length: p.items.length }, (_, k) => (value ? value.split("|") : [])[k] ?? "");
  const put = (bin: number) => { if (sel === null) return; const v = [...vals]; v[sel] = String(bin); set(v.join("|")); setSel(null); };
  const card = (k: number) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${thingName[p.items[k]]}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
    className={`flex w-[4.6rem] flex-col items-center rounded-xl border-2 bg-white p-0.5 text-xs font-bold leading-tight sm:w-24 ${sel === k ? "border-success ring-2 ring-success" : "border-base-300"}`}><ThingArt thing={p.items[k]} size={40} />{thingName[p.items[k]]}</button>;
  const loose = vals.map((v, k) => (v === "" ? k : -1)).filter(k => k >= 0);
  return <div className="space-y-2">
    <p className="text-sm text-base-content/70">{sel === null ? "Ketuk benda, lalu ketuk kotak tujuannya." : `Masukkan ${thingName[p.items[sel]]} ke kotak mana?`}</p>
    <div className="flex min-h-12 flex-wrap justify-center gap-1.5">{loose.length ? loose.map(card) : <span className="self-center text-sm text-base-content/50">Semua benda sudah masuk kotak.</span>}</div>
    <div className="grid grid-cols-2 gap-2">{p.bins.map((b, bi) => <div key={b} className="flex flex-col rounded-xl border-2 border-dashed border-sky-400 bg-sky-50 p-1.5">
      <button type="button" disabled={checked || sel === null} onClick={() => put(bi)} aria-label={`Masukkan ke ${b}`} className="btn btn-sm btn-info mb-1.5">{b}</button>
      <div className="flex min-h-20 flex-wrap justify-center gap-1">{vals.map((v, k) => (v === String(bi) ? card(k) : null))}</div>
    </div>)}</div>
  </div>;
}
function CuboidPart({ p, value, set, checked }: { p: Extract<Part, { kind: "cuboid" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const x = cells(p, value).map(v => Number(v) || 1), [a, b, c] = x, put = (k: number, v: number) => { const y = [...x]; y[k] = v; set(y.join("|")); };
  return <div className="space-y-2">
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Panjang" value={a} set={v => put(0, v)} min={1} max={p.max} disabled={checked} /><Stepper label="Lebar" value={b} set={v => put(1, v)} min={1} max={Math.min(p.max, 4)} disabled={checked} /><Stepper label="Tinggi" value={c} set={v => put(2, v)} min={1} max={Math.min(p.max, 4)} disabled={checked} /></div>
    <div className="flex justify-center"><CubeStack heights={Array.from({ length: b }, () => Array(a).fill(c))} a={a + b > 7 ? 14 : 18} /></div>
    <p className="text-center text-xl font-extrabold tabular-nums">{a} × {b} × {c} = {a * b * c} kubus satuan</p>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      return <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xl font-bold sm:text-2xl">{bits.map((b, k) => <span key={k} className="contents">{b && <span>{b.trim()}</span>}{k < bits.length - 1 && <Box label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} size={fmt(p.answers[k]).length} />}</span>)}</p>; }
    case "choice": return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-x-3 gap-y-1.5"><p className="text-xl font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`min-h-11 rounded-2xl border-4 px-3 text-lg font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
    case "rank": { const seq = value ? value.split("|").map(Number) : [];
      return <div className="space-y-1.5"><p className="text-lg font-bold">{p.label}</p>
        <div role="group" aria-label={p.label} className="flex flex-wrap gap-1.5">{p.items.map((it, k) => <button key={k} type="button" aria-label={`Pilih ${it.label}`} disabled={checked || seq.includes(k)} onClick={() => set([...seq, k].join("|"))} className="btn btn-outline h-12 min-w-14 text-lg">{it.label}</button>)}</div>
        <div className="flex flex-wrap items-center gap-1">{p.items.map((_, k) => <span key={k} className="grid h-12 min-w-14 place-items-center rounded-lg border-2 border-dashed border-orange-300 bg-white px-1.5 text-lg font-extrabold">{seq[k] !== undefined ? p.items[seq[k]].label : k + 1}</span>)}
          <button type="button" className="btn btn-ghost btn-sm gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join("|"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div>
      </div>; }
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "multi": { const on = value ? value.split("|") : [];
      return <div role="group" aria-label={p.label} className="space-y-1"><p className="text-lg font-bold">{p.label}</p>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" aria-pressed={on.includes(o)} disabled={checked} onClick={() => set((on.includes(o) ? on.filter(y => y !== o) : [...on, o]).join("|"))} className={`min-h-12 min-w-14 rounded-full border-4 px-2 text-xl font-extrabold ${on.includes(o) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{o}</button>)}</div>
        <p className="text-xs text-base-content/60 [@media(max-height:700px)]:hidden">Pilih semua yang benar. Ketuk lagi untuk membatalkan.</p></div>; }
    case "sort": return <SortPart p={p} value={value} set={set} checked={checked} />;
    case "shade": { const on = value ? value.split("|").map(Number) : [];
      return <div className="space-y-1.5"><div className="flex justify-center overflow-x-auto"><ShadeGrid cols={p.cols} rows={p.rows} on={on} disabled={checked} cell={p.cols > 5 ? 36 : 40} toggle={k => set((on.includes(k) ? on.filter(y => y !== k) : [...on, k]).join("|"))} /></div>
        <p className="flex flex-wrap items-center justify-center gap-2 text-lg font-bold">Diarsir: {on.length} persegi satuan<button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || !on.length} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus</button></p></div>; }
    case "pour": { const n = Number(value || 0); return <PourView small={p.small} poured={n} disabled={checked} pour={() => set(String(n + 1))} undo={() => set(n - 1 ? String(n - 1) : "")} />; }
    case "cuboid": return <CuboidPart p={p} value={value} set={set} checked={checked} />;
  }
}
function Answer({ q, value, record, checked }: { q: MQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.76]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeFourMeasureV2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], s = t.sections[0], Lab = labs[s.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Pengukuran Luas dan Volume</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Ukur luas permukaan dengan persegi satuan, cm², dan m². Ukur isi wadah dengan botol, mililiter, liter, dan kubus satuan.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-4"><PolyView poly={{ rows: ["##", "##"] }} cell={20} /><CubeStack heights={[[2, 2], [2, 2]]} a={16} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Taplak meja dan botol sabun</h2>
        <p className="mt-2 text-sm">Berapa kertas origami yang menutupi meja lipat? Berapa botol kecil untuk mengisi botol sabun besar? Kita belajar mengukur luas dan volume dengan satuan yang tepat.</p>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-ukur-4">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-ukur-4" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-1.5">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} title={x.title} className={`btn btn-sm h-auto min-h-9 ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.short}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={topic} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {s.title}</h2>
            <p className="mt-1 text-sm text-base-content/60">{t.title}</p>
            <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-base leading-7">{s.steps.map(x => <li key={x}>{x}</li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-base leading-7">{s.example}</p>}
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{s.demo}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0} onClick={() => go(topic - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => open("practice")}>Latihan {t.code}</button>
            {!last ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(topic + 1)}>Materi berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => open("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<MQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 4"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.64]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}

