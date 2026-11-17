"use client";

import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, Eraser, Landmark, House, RotateCcw, School, Store, Trees, Waves } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  assessment, cells, COLORS, correct, formatAnswer, fromHeights, heightsOf, LETTERS, manhattan, paintKey, practice, pt, ptName, ready, sameGrid, SEP, shape, showPt, splitParts, topics, viewOf, VIEWS,
  type Color, type CQuestion, type Cube, type Die, type Grid, type Mark, type Part, type Place, type Scene, type View, type Visual,
} from "@/data/grade-six-cubes-v2";

const ink = "#2b2320";
const CA = 0.866, CB = 0.5;

/* ====================================================================== */
/* Gambar bangun (isometrik)                                               */
/* ====================================================================== */
function tint(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16), f = (c: number) => Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
type Face = "top" | "front" | "right";
/** Susunan kubus dilihat dari depan-kanan-atas. Kubus dengan nomor balok (g) yang sama tampil tanpa garis sambungan. */
function Iso({ cubes, s = 26, lift = 0, axes = true, title }: { cubes: Cube[]; s?: number; lift?: number; axes?: boolean; title?: string }) {
  const at = new Map(cubes.map(c => [`${c.x},${c.y},${c.z}`, c]));
  const get = (x: number, y: number, z: number) => at.get(`${x},${y},${z}`);
  const P = (x: number, y: number, z: number): [number, number] => [(x + y) * CA * s, (x - y) * CB * s - z * s];
  const open = (c: Cube, f: Face) => (f === "top" ? lift > 0 || !get(c.x, c.y, c.z + 1) : f === "front" ? !get(c.x, c.y - 1, c.z) : !get(c.x + 1, c.y, c.z));
  const pts: [number, number][] = [];
  const shapes = [...cubes].sort((a, b) => a.x - a.y + a.z - (b.x - b.y + b.z)).map(c => {
    const { x, y } = c, z = c.z * (1 + lift);
    const faces: Record<Face, { p: [number, number][]; n: [number, number, number][]; k: number }> = {
      top: { p: [P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], n: [[0, -1, 0], [1, 0, 0], [0, 1, 0], [-1, 0, 0]], k: 0.3 },
      front: { p: [P(x, y, z), P(x + 1, y, z), P(x + 1, y, z + 1), P(x, y, z + 1)], n: [[0, 0, -1], [1, 0, 0], [0, 0, 1], [-1, 0, 0]], k: 0 },
      right: { p: [P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)], n: [[0, 0, -1], [0, 1, 0], [0, 0, 1], [0, -1, 0]], k: -0.22 },
    };
    return (["top", "front", "right"] as Face[]).filter(f => open(c, f)).map(f => {
      const { p, n, k } = faces[f]; pts.push(...p);
      const hex = COLORS[c.f?.[f] ?? c.c].hex;
      const edges = p.map((a, i) => ({ a, b: p[(i + 1) % 4], nb: get(c.x + n[i][0], c.y + n[i][1], c.z + n[i][2]) })).filter(e => !(c.g !== undefined && e.nb && e.nb.g === c.g && open(e.nb, f)));
      return <g key={`${x},${y},${c.z},${f}`}><polygon points={p.map(q => q.join(",")).join(" ")} fill={tint(hex, k)} />{edges.map((e, i) => <line key={i} x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]} stroke={ink} strokeWidth={1.2} strokeLinecap="round" />)}</g>;
    });
  });
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), m = 3;
  const vb = [Math.min(...xs) - m, Math.min(...ys) - m, Math.max(...xs) - Math.min(...xs) + 2 * m, Math.max(...ys) - Math.min(...ys) + 2 * m];
  return <figure className="inline-flex flex-col items-center" role="img" aria-label={title ?? `Susunan ${cubes.length} kubus`}>
    <svg viewBox={vb.join(" ")} width={vb[2]} height={vb[3]} aria-hidden="true" className="max-w-full">{shapes}</svg>
    {axes && <figcaption className="flex w-full justify-between gap-3 px-1 text-[11px] font-semibold text-base-content/60"><span className="flex items-center gap-0.5"><ArrowUpRight className="size-3" aria-hidden="true" />depan</span><span className="flex items-center gap-0.5">kanan<ArrowUpLeft className="size-3" aria-hidden="true" /></span></figcaption>}
  </figure>;
}

/** Gambar tampak: kotak berwarna, kotak kosong bergaris putus-putus. */
function ViewGrid({ grid, cell = 26, mono = false }: { grid: Grid; cell?: number; mono?: boolean }) {
  return <div className="inline-grid" style={{ gridTemplateColumns: `repeat(${grid[0].length}, ${cell}px)` }}>
    {grid.flatMap((row, r) => row.map((v, k) => <span key={`${r}-${k}`} style={{ height: cell, background: v ? (mono ? "#c3cad1" : COLORS[v].hex) : "transparent" }} className={v ? "border border-neutral" : "border border-dashed border-base-300"} />))}
  </div>;
}
function ThreeViews({ cubes, mono, cell = 24 }: { cubes: Cube[]; mono?: boolean; cell?: number }) {
  return <div className="flex flex-wrap items-end justify-center gap-3" role="img" aria-label={`Gambar tampak depan, kanan, dan atas ${mono ? "(tanpa warna)" : ""}`}>
    {VIEWS.map(v => <figure key={v} className="flex flex-col items-center gap-1"><ViewGrid grid={viewOf(v, cubes)} cell={cell} mono={mono} /><figcaption className="text-xs font-bold">{v}</figcaption></figure>)}
  </div>;
}

/* ====================================================================== */
/* Dadu dan kardus                                                         */
/* ====================================================================== */
const PIPS: Record<number, [number, number][]> = { 1: [[.5, .5]], 2: [[.25, .25], [.75, .75]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.25, .25], [.75, .25], [.25, .75], [.75, .75]], 5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.25, .22], [.75, .22], [.25, .5], [.75, .5], [.25, .78], [.75, .78]] };
function DieArt({ die, s = 56 }: { die: Die; s?: number }) {
  const P = (x: number, y: number, z: number): [number, number] => [(x + y) * CA * s, (x - y) * CB * s - z * s];
  const face = (o: [number, number], u: [number, number], v: [number, number], n: number | null, fill: string, key: string) => <g key={key}>
    <polygon points={[o, [o[0] + u[0], o[1] + u[1]], [o[0] + u[0] + v[0], o[1] + u[1] + v[1]], [o[0] + v[0], o[1] + v[1]]].map(q => q.join(",")).join(" ")} fill={fill} stroke={ink} strokeWidth="1.3" strokeLinejoin="round" />
    {n && <g transform={`matrix(${u[0]} ${u[1]} ${v[0]} ${v[1]} ${o[0]} ${o[1]})`}>{PIPS[n].map(([a, b], i) => <circle key={i} cx={a} cy={b} r=".09" fill={ink} />)}</g>}
  </g>;
  const o = P(0, 0, 1), sub = (a: [number, number], b: [number, number]): [number, number] => [a[0] - b[0], a[1] - b[1]];
  const vb = [-2, P(0, 1, 1)[1] - 2, P(1, 1, 0)[0] + 4, P(1, 0, 0)[1] - P(0, 1, 1)[1] + 4];
  return <svg viewBox={vb.join(" ")} width={vb[2]} height={vb[3]} role="img" aria-label={`Dadu: atas ${die.top}, depan ${die.front}, kanan ${die.right ?? "kosong"}`}>
    {face(P(0, 0, 1), sub(P(1, 0, 1), P(0, 0, 1)), sub(P(0, 1, 1), P(0, 0, 1)), die.top, "#ffffff", "t")}
    {face(o, sub(P(1, 0, 1), o), sub(P(0, 0, 0), o), die.front, "#f1efe9", "f")}
    {face(P(1, 0, 1), sub(P(1, 1, 1), P(1, 0, 1)), sub(P(1, 0, 0), P(1, 0, 1)), die.right, die.right ? "#e2ded5" : "#d8d3c8", "r")}
  </svg>;
}
function Kardus({ dims: [w, d, h], lines }: { dims: [number, number, number]; lines: string[] }) {
  const k = 1.8, P = (x: number, y: number, z: number): [number, number] => [(x + y) * CA * k, (x - y) * CB * k - z * k];
  const poly = (p: [number, number][], fill: string) => <polygon points={p.map(q => q.join(",")).join(" ")} fill={fill} stroke={ink} strokeWidth="1.2" strokeLinejoin="round" />;
  const all = [P(0, 0, 0), P(w, 0, 0), P(w, d, 0), P(0, d, h), P(w, d, h), P(0, 0, h)];
  const mid = (a: [number, number], b: [number, number], dx = 0, dy = 0) => ({ x: (a[0] + b[0]) / 2 + dx, y: (a[1] + b[1]) / 2 + dy });
  const lw = mid(P(0, 0, 0), P(w, 0, 0), -14, 16), ld = mid(P(w, 0, 0), P(w, d, 0), 18, 14), lh = mid(P(w, d, 0), P(w, d, h), 24, 4);
  const xs = [...all.map(p => p[0]), lw.x - 22, ld.x + 22, lh.x + 22], ys = [...all.map(p => p[1]), lw.y + 4, ld.y + 4];
  const vb = [Math.min(...xs) - 4, Math.min(...ys) - 6, Math.max(...xs) - Math.min(...xs) + 8, Math.max(...ys) - Math.min(...ys) + 12];
  return <div className="flex flex-wrap items-center justify-center gap-3">
    <svg viewBox={vb.join(" ")} width={vb[2]} height={vb[3]} role="img" aria-label={`Kardus ${w} cm × ${d} cm × ${h} cm`}>
      {poly([P(0, 0, h), P(w, 0, h), P(w, d, h), P(0, d, h)], "#e4b77e")}
      {poly([P(0, 0, 0), P(w, 0, 0), P(w, 0, h), P(0, 0, h)], "#c9935a")}
      {poly([P(w, 0, 0), P(w, d, 0), P(w, d, h), P(w, 0, h)], "#a8763f")}
      <line x1={P(w / 2, 0, h)[0]} y1={P(w / 2, 0, h)[1]} x2={P(w / 2, d, h)[0]} y2={P(w / 2, d, h)[1]} stroke="#f3e2c4" strokeWidth="5" />
      {[[lw, `${w} cm`], [ld, `${d} cm`], [lh, `${h} cm`]].map(([p, t]) => <text key={t as string} x={(p as { x: number }).x} y={(p as { y: number }).y} fontSize="12" fontWeight="700" textAnchor="middle" fill={ink}>{t as string}</text>)}
    </svg>
    <ul className="space-y-0.5 text-sm font-semibold">{lines.map(l => <li key={l}>{l}</li>)}</ul>
  </div>;
}

/* ====================================================================== */
/* Kertas berpetak dan peta                                                */
/* ====================================================================== */
function MarkArt({ m, x, y }: { m: Mark; x: number; y: number }) {
  const label = m.label && <text x={x} y={y - 16} fontSize="11" fontWeight="700" textAnchor="middle" fill={ink}>{m.label}</text>;
  switch (m.kind) {
    case "kubus": return <g>{label}<polygon points={`${x},${y - 12} ${x + 9},${y - 7} ${x},${y - 2} ${x - 9},${y - 7}`} fill="#a3d36b" stroke={ink} /><polygon points={`${x - 9},${y - 7} ${x},${y - 2} ${x},${y + 9} ${x - 9},${y + 4}`} fill="#7fb247" stroke={ink} /><polygon points={`${x},${y - 2} ${x + 9},${y - 7} ${x + 9},${y + 4} ${x},${y + 9}`} fill="#5e8f2f" stroke={ink} /></g>;
    case "kerucut": return <g><path d={`M${x} ${y - 14}L${x + 8} ${y + 4}A8 3 0 0 1 ${x - 8} ${y + 4}Z`} fill="#b45bc4" stroke={ink} /></g>;
    case "tabung": return <g><path d={`M${x - 8} ${y - 8}V${y + 5}A8 3 0 0 0 ${x + 8} ${y + 5}V${y - 8}`} fill="#f5c518" stroke={ink} /><ellipse cx={x} cy={y - 8} rx="8" ry="3" fill="#ffe27a" stroke={ink} /></g>;
    case "bola": return <g><circle cx={x} cy={y} r="8" fill="#e5484d" stroke={ink} /><circle cx={x - 3} cy={y - 3} r="2.2" fill="#ffd2d2" /></g>;
    case "X": return <g stroke="#2f5fb3" strokeWidth="2.6" strokeLinecap="round"><path d={`M${x - 7} ${y - 7}L${x + 7} ${y + 7}M${x + 7} ${y - 7}L${x - 7} ${y + 7}`} /></g>;
    case "O": return <circle cx={x} cy={y} r="7" fill="none" stroke="#c2410c" strokeWidth="2.6" />;
    case "anak": return <g>{label}<circle cx={x} cy={y - 7} r="4" fill="#f2c9a0" stroke={ink} /><path d={`M${x - 7} ${y + 8}c0-7 3-10 7-10s7 3 7 10z`} fill="#208f6d" stroke={ink} /></g>;
    case "bendera": return <g><path d={`M${x} ${y}V${y - 18}`} stroke={ink} strokeWidth="1.8" /><path d={`M${x} ${y - 18}l12 4-12 4z`} fill="#e5484d" stroke={ink} /></g>;
    default: return <g><circle cx={x} cy={y} r="4.5" fill="#1f4e8c" /><text x={x + 7} y={y - 6} fontSize="13" fontWeight="800" fill="#1f4e8c">{m.kind}</text></g>;
  }
}
function GridBoard({ cols, rows, marks = [], onPick, path, picked, g = 40, label }: { cols: number; rows: number; marks?: Mark[]; onPick?: (p: string) => void; path?: string[]; picked?: string; g?: number; label: string }) {
  const L = 24, T = 22, R = 16, B = 24;
  const X = (c: number) => L + c * g, Y = (r: number) => T + (rows - r) * g;
  const W = L + (cols - 1) * g + R, H = T + (rows - 1) * g + B;
  const key = (e: KeyboardEvent, p: string) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick?.(p); } };
  return <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="max-w-full touch-manipulation" role="group" aria-label={label}>
    {Array.from({ length: cols }, (_, c) => <g key={`c${c}`}><line x1={X(c)} y1={Y(rows)} x2={X(c)} y2={Y(1)} stroke="#b7c3cf" /><text x={X(c)} y={H - 6} fontSize="13" fontWeight="700" textAnchor="middle" fill={ink}>{LETTERS[c]}</text></g>)}
    {Array.from({ length: rows }, (_, i) => <g key={`r${i}`}><line x1={X(0)} y1={Y(i + 1)} x2={X(cols - 1)} y2={Y(i + 1)} stroke="#b7c3cf" /><text x={8} y={Y(i + 1) + 4} fontSize="13" fontWeight="700" textAnchor="middle" fill={ink}>{i + 1}</text></g>)}
    {path && path.length > 1 && <polyline points={path.map(p => { const q = pt(p); return `${X(q.c)},${Y(q.r)}`; }).join(" ")} fill="none" stroke="#208f6d" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />}
    {path?.map(p => { const q = pt(p); return <circle key={`p${p}`} cx={X(q.c)} cy={Y(q.r)} r="4.5" fill="#208f6d" />; })}
    {marks.map(m => { const q = pt(m.at); return <MarkArt key={`${m.kind}${m.at}`} m={m} x={X(q.c)} y={Y(q.r)} />; })}
    {picked && (() => { const q = pt(picked); return <g><circle cx={X(q.c)} cy={Y(q.r)} r="13" fill="none" stroke="#e5484d" strokeWidth="2.5" /><MarkArt m={{ at: picked, kind: "X" }} x={X(q.c)} y={Y(q.r)} /></g>; })()}
    {onPick && Array.from({ length: cols }, (_, c) => Array.from({ length: rows }, (_, i) => { const p = ptName(c, i + 1);
      return <circle key={`h${p}`} cx={X(c)} cy={Y(i + 1)} r={g * 0.42} fill="transparent" role="button" tabIndex={0} aria-label={`Titik ${showPt(p)}`} className="cursor-pointer outline-none focus-visible:stroke-success focus-visible:stroke-[3]" onClick={() => onPick(p)} onKeyDown={e => key(e, p)} />; }))}
  </svg>;
}
const PLACE: Record<Place["icon"], typeof School> = { sekolah: School, pasar: Store, taman: Trees, masjid: Landmark, rumah: House, pantai: Waves };
function MapView({ cols, rows, places }: { cols: number; rows: number; places: Place[] }) {
  return <div className="inline-grid gap-0.5 text-center" style={{ gridTemplateColumns: `1.2rem repeat(${cols}, minmax(3.6rem, 4.6rem))` }} role="img" aria-label={`Peta berpetak: ${places.map(p => `${p.name} di petak ${p.cell}`).join(", ")}`}>
    {Array.from({ length: rows }, (_, i) => rows - i).map(r => <div key={r} className="contents"><span className="self-center text-sm font-bold">{r}</span>
      {Array.from({ length: cols }, (_, c) => { const p = places.find(x => x.cell === ptName(c, r)); const I = p && PLACE[p.icon];
        return <span key={c} className="flex h-14 flex-col items-center justify-center rounded border border-emerald-300 bg-emerald-50 px-0.5 text-[11px] font-bold leading-tight">{I && <I className="size-6 text-success" strokeWidth={1.75} aria-hidden="true" />}{p?.name}</span>; })}</div>)}
    <span />{Array.from({ length: cols }, (_, c) => <span key={c} className="text-sm font-bold">{LETTERS[c]}</span>)}
  </div>;
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function Radio<T extends string>({ label, options, value, set, names }: { label: string; options: readonly T[]; value: T; set: (v: T) => void; names?: Record<string, string> }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-1.5"><span className="text-xs font-bold">{label}:</span>
    {options.map(o => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-xs sm:btn-sm ${value === o ? "btn-success" : "btn-outline"}`}>{names?.[o] ?? o}</button>)}</div>;
}
/** Denah: angka = tinggi tumpukan. Baris bawah = depan. */
function Denah({ h, max, set, disabled = false }: { h: number[][]; max: number; set: (h: number[][]) => void; disabled?: boolean }) {
  const tap = (x: number, y: number) => set(h.map((row, j) => row.map((n, i) => (i === x && j === y ? (n + 1) % (max + 1) : n))));
  return <div className="inline-flex flex-col items-center gap-1">
    <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${h[0].length}, 2.6rem)` }}>
      {[...h.keys()].reverse().flatMap(y => h[y].map((n, x) => <button key={`${x}-${y}`} type="button" disabled={disabled} aria-label={`Denah kolom ${x + 1} baris ${y + 1} dari depan`} onClick={() => tap(x, y)}
        className={`grid h-10 place-items-center rounded-lg border-2 text-xl font-extrabold ${n ? "border-sky-600 bg-sky-100 text-sky-900" : "border-dashed border-base-300 bg-base-100 text-base-content/30"}`}>{n}</button>))}
    </div>
    <span className="text-xs font-semibold text-base-content/60">depan</span>
  </div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
function BuildLab() {
  const [h, setH] = useState([[1, 1, 0], [2, 1, 0], [0, 0, 0]]);
  const cubes = fromHeights(h, "o"), layers = [1, 2, 3].map(z => h.flat().filter(n => n >= z).length).filter(Boolean);
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-center gap-4 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.2]">
      <Denah h={h} max={3} set={setH} />
      <div className="grid min-h-36 min-w-40 place-items-center rounded-xl bg-base-100 p-2">{cubes.length ? <Iso cubes={cubes} s={24} /> : <p className="text-sm">Ketuk petak untuk mulai.</p>}</div>
    </div>
    <div className="flex justify-center"><button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setH([[0, 0, 0], [0, 0, 0], [0, 0, 0]])}><RotateCcw className="size-4" aria-hidden="true" />Kosongkan</button></div>
    <Result value={String(cubes.length)}>Bangunmu tersusun dari <strong>{cubes.length} kubus</strong>{layers.length > 1 ? `: ${layers.map((n, i) => `lantai ${i + 1} ada ${n}`).join(", ")}` : ""}. {layers.length > 1 ? "Kubus yang tertutup tetap dihitung karena menopang kubus di atasnya." : "Coba tumpuk kubus agar bangunnya bertingkat."}</Result>
  </div>;
}
const byLayer = (cubes: Cube[]): Cube[] => cubes.map(c => ({ ...c, c: (["o", "b", "g"] as Color[])[c.z] ?? c.c }));
const splitShapes = [
  { name: "Bangun 1", cubes: byLayer(fromHeights([[1, 1, 1], [2, 2, 0]])) },
  { name: "Bangun 2", cubes: byLayer(fromHeights([[2, 1, 0], [3, 2, 1]])) },
  { name: "Bangun 3", cubes: [...[0, 1].map(y => ({ x: 0, y, z: 0, g: 0 })), ...[0, 1].map(y => ({ x: 1, y, z: 0, g: 1 })), ...[0, 1].map(y => ({ x: 2, y, z: 0, g: 2 })), ...[0, 1].map(x => ({ x, y: 1, z: 1, g: 3 }))].map(c => ({ ...c, c: (c.z ? "b" : "o") as Color })) },
] as const;
function SplitLab() {
  const [k, setK] = useState<string>("Bangun 1"), [apart, setApart] = useState(false);
  const shp = splitShapes.find(s => s.name === k)!, cubes = shp.cubes as Cube[];
  const layers = [0, 1, 2].map(z => cubes.filter(c => c.z === z).length).filter(Boolean);
  const balok = cubes.some(c => c.g !== undefined) ? new Set(cubes.map(c => c.g)).size : 0;
  return <div className="space-y-3">
    <Radio label="Bangun" options={splitShapes.map(s => s.name)} value={k} set={v => { setK(v); setApart(false); }} />
    <div className="grid min-h-48 place-items-center rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.75] lg:[zoom:1.15]"><Iso cubes={cubes} s={26} lift={apart ? 0.9 : 0} /></div>
    <div className="flex justify-center"><button type="button" aria-pressed={apart} className="btn btn-sm btn-success" onClick={() => setApart(!apart)}>{apart ? "Satukan lagi" : "Urai per lantai"}</button></div>
    <Result value={`${layers.join("+")}=${cubes.length}`}>{layers.map((n, i) => `Lantai ${i + 1}: ${n} kubus`).join(", ")}. Seluruhnya {layers.join(" + ")} = <strong>{cubes.length} kubus</strong>{balok ? `, atau ${balok} balok yang masing-masing terdiri atas 2 kubus` : ""}.</Result>
  </div>;
}
const viewShapes: Record<string, Cube[]> = {
  "Susunan Anike": [...fromHeights([[1, 2, 1]], "r").map(c => ({ ...c, c: (["b", "r", "y"] as Color[])[c.x] })).map(c => (c.z === 1 ? { ...c, c: "g" as Color } : c)), { x: 1, y: 1, z: 0, c: "p" }],
  "Tangga": fromHeights([[2, 1, 0], [3, 2, 1]], "o").map(c => ({ ...c, c: (["o", "y", "r"] as Color[])[c.z] })),
  "Huruf L": [{ x: 0, y: 0, z: 0, c: "g" }, { x: 1, y: 0, z: 0, c: "y" }, { x: 0, y: 1, z: 0, c: "b" }, { x: 0, y: 1, z: 1, c: "b" }, { x: 0, y: 2, z: 0, c: "r" }],
};
function ViewsLab() {
  const [k, setK] = useState("Susunan Anike"), [v, setV] = useState<View>("depan");
  const cubes = viewShapes[k], g = viewOf(v, cubes), n = g.flat().filter(Boolean).length;
  const hint = { depan: "Lihat lurus dari depan. Kubus di belakang tertutup kubus di depannya.", kanan: "Lihat dari sisi kanan. Kolom kiri gambar adalah sisi depan bangun.", atas: "Lihat dari atas. Baris bawah gambar adalah sisi depan bangun." }[v];
  return <div className="space-y-2.5">
    <Radio label="Bangun" options={Object.keys(viewShapes)} value={k} set={setK} />
    <Radio label="Dilihat dari" options={VIEWS} value={v} set={setV} />
    <div className="flex flex-wrap items-center justify-center gap-5 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.72] lg:[zoom:1.15]">
      <Iso cubes={cubes} s={24} />
      <figure className="flex flex-col items-center gap-1"><ViewGrid grid={g} cell={34} /><figcaption className="text-sm font-bold">Tampak {v}</figcaption></figure>
    </div>
    <Result value={`${v}:${n}`}>Tampak {v} berisi <strong>{n} kotak</strong>. {hint}</Result>
  </div>;
}
const target = fromHeights([[2, 1, 1], [1, 0, 0]]);
function RebuildLab() {
  const [h, setH] = useState([[0, 0, 0], [0, 0, 0]]);
  const mine = fromHeights(h), dims = { X: 3, Y: 2, Z: 3 };
  const ok = VIEWS.map(v => sameGrid(shape(viewOf(v, mine, dims)), shape(viewOf(v, target, dims))));
  return <div className="space-y-2.5">
    <div className="flex flex-wrap items-end justify-center gap-3 [@media(max-height:700px)]:[zoom:0.72] lg:[zoom:1.1]">
      {VIEWS.map((v, i) => <figure key={v} className="flex flex-col items-center gap-0.5"><span className="text-[11px] font-semibold">contoh</span><ViewGrid grid={viewOf(v, target, dims)} cell={18} mono />
        <span className="text-[11px] font-semibold">punyamu</span><ViewGrid grid={viewOf(v, mine, dims)} cell={18} mono /><figcaption className={`text-xs font-bold ${ok[i] ? "text-success" : ""}`}>{v}{ok[i] ? ", cocok" : ""}</figcaption></figure>)}
    </div>
    <div className="flex flex-wrap items-center justify-center gap-3 [@media(max-height:700px)]:[zoom:0.8]"><Denah h={h} max={3} set={setH} />{mine.length > 0 && <Iso cubes={mine} s={20} axes={false} />}</div>
    <Result value={`${ok.filter(Boolean).length}/3`}>{ok.every(Boolean) ? <>Ketiga gambar tampak <strong>cocok</strong>. Bangunmu memakai {mine.length} kubus.</> : <>Cocok {ok.filter(Boolean).length} dari 3 tampak. Mulai dari tampak atas untuk memilih petak, lalu atur tinggi dengan tampak depan dan kanan.</>}</Result>
  </div>;
}
function LocateLab() {
  const [p, setP] = useState("B4");
  const q = pt(p);
  return <div className="space-y-3">
    <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.2]"><GridBoard cols={6} rows={5} marks={[{ at: "D1", kind: "O" }]} picked={p} onPick={setP} label="Kertas berpetak, ketuk titik potong" /></div>
    <Result value={p}>Tanda X ada di <strong>{showPt(p)}</strong>: perpotongan garis tegak {LETTERS[q.c]} dan garis mendatar {q.r}. Tanda O ada di (D,1).</Result>
  </div>;
}
function PathLab() {
  const from = "B5", to = "E1";
  const [path, setPath] = useState<string[]>([from]);
  const last = path[path.length - 1], steps = path.length - 1, done = last === to, best = manhattan(from, to);
  const tap = (p: string) => { if (p === last && path.length > 1) setPath(path.slice(0, -1)); else if (!done && manhattan(last, p) === 1) setPath([...path, p]); };
  const right = path.slice(1).filter((p, i) => pt(p).c > pt(path[i]).c).length, down = path.slice(1).filter((p, i) => pt(p).r < pt(path[i]).r).length;
  return <div className="space-y-3">
    <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.75] lg:[zoom:1.15]"><GridBoard cols={6} rows={6} marks={[{ at: from, kind: "P" }, { at: to, kind: "Q" }]} path={path} onPick={tap} label="Buat jalur dari P ke Q" /></div>
    <div className="flex justify-center"><button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setPath([from])}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
    <Result value={`${steps}|${done ? 1 : 0}`}>{done ? <>Sampai di Q dengan <strong>{steps} langkah</strong>{steps === best ? `: ${right} ke kanan dan ${down} ke bawah. Ini jalur terpendek.` : `. Jalur terpendek hanya ${best} langkah: 3 ke kanan dan 4 ke bawah.`}</> : <>Sudah {steps} langkah ({right} ke kanan, {down} ke bawah). Lanjutkan ke titik sebelahnya sampai Q(E,1).</>}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { build: BuildLab, split: SplitLab, views: ViewsLab, rebuild: RebuildLab, locate: LocateLab, path: PathLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "iso": return <Iso cubes={scene.cubes} s={28} />;
    case "isos": return <div className="flex flex-wrap items-end justify-center gap-6">{scene.items.map(it => <div key={it.label} className="flex flex-col items-center"><Iso cubes={it.cubes} s={24} /><span className="text-sm font-bold">{it.label}</span></div>)}</div>;
    case "views": return <ThreeViews cubes={scene.cubes} mono={scene.mono} cell={26} />;
    case "grid": return <GridBoard cols={scene.cols} rows={scene.rows} marks={scene.marks} g={36} label="Kertas berpetak" />;
    case "map": return <MapView cols={scene.cols} rows={scene.rows} places={scene.places} />;
    case "dice": return <div className="flex flex-wrap items-center justify-center gap-6">{scene.dice.map((d, i) => <DieArt key={i} die={d} />)}</div>;
    case "kardus": return <Kardus dims={scene.dims} lines={scene.lines} />;
  }
}
function VisualArt({ v }: { v: Visual }) {
  if ("cubes" in v) return <Iso cubes={v.cubes} s={16} axes={false} />;
  if ("view" in v) return <ViewGrid grid={v.view} cell={17} />;
  return <DieArt die={v.die} s={34} />;
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function Box({ value, onChange, label, letter = false, disabled = false }: { value: string; onChange: (v: string) => void; label: string; letter?: boolean; disabled?: boolean }) {
  return <input aria-label={label} inputMode={letter ? "text" : "numeric"} autoCapitalize="characters" value={value} disabled={disabled} placeholder="…"
    onChange={e => onChange(letter ? e.target.value.replace(/[^a-jA-J]/g, "").slice(-1).toUpperCase() : e.target.value.replace(/[^\d.,]/g, "").slice(0, 6))}
    className={`h-10 ${letter ? "w-12" : "w-16"} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none sm:h-11 sm:text-2xl`} />;
}
function Painter({ p, x, put, checked }: { p: Extract<Part, { kind: "paint" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  const key = paintKey(p), w = key[0].length;
  const palette = [...new Set(p.cubes.flatMap(c => [c.c, ...Object.values(c.f ?? {})]))] as Color[];
  const [brush, setBrush] = useState<Color | "">(palette[0]);
  const cell = w > 3 || key.length > 3 ? 34 : 42;
  const note = p.view === "kanan" ? "Kolom kiri = sisi depan." : p.view === "atas" ? "Baris bawah = sisi depan." : "";
  return <div className="flex flex-wrap items-center gap-3">
    <figure className="flex flex-col items-center gap-1">
      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${w}, ${cell}px)` }}>{x.map((v, k) => { const r = Math.floor(k / w), c = k % w;
        return <button key={k} type="button" disabled={checked} aria-label={`Tampak ${p.view} baris ${r + 1} kotak ${c + 1}`} onClick={() => put(k, v === brush ? "" : brush)} style={{ height: cell, background: v ? COLORS[v as Color].hex : undefined }} className={v ? "rounded-sm border-2 border-neutral" : "rounded-sm border-2 border-dashed border-base-300 bg-base-100"} />; })}</div>
      <figcaption className="text-sm font-bold">Tampak {p.view}</figcaption>
    </figure>
    <div className="space-y-1">
      <div role="radiogroup" aria-label={`Warna tampak ${p.view}`} className="flex flex-wrap gap-1.5">
        {palette.map(c => <button key={c} type="button" role="radio" aria-checked={brush === c} aria-label={COLORS[c].name} disabled={checked} onClick={() => setBrush(c)} style={{ background: COLORS[c].hex }} className={`size-9 rounded-full border-2 ${brush === c ? "border-neutral ring-2 ring-neutral ring-offset-2" : "border-white"}`} />)}
        <button type="button" role="radio" aria-checked={brush === ""} aria-label="Penghapus" disabled={checked} onClick={() => setBrush("")} className={`grid size-9 place-items-center rounded-full border-2 bg-base-100 ${brush === "" ? "border-neutral ring-2 ring-neutral ring-offset-2" : "border-base-300"}`}><Eraser className="size-4" strokeWidth={1.75} aria-hidden="true" /></button>
      </div>
      {note && <p className="text-xs font-semibold text-base-content/70">{note}</p>}
    </div>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      const lead = (k: number) => (k > 0 ? (bits[k].match(/^[,.)]+/)?.[0] ?? "") : ""), body = (k: number) => bits[k].slice(lead(k).length).trim();
      return <p className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-lg font-bold leading-10 sm:text-xl [@media(max-height:700px)]:gap-y-1 [@media(max-height:700px)]:leading-8">{bits.map((_, k) => <span key={k} className="contents">{body(k) && <span>{body(k)}</span>}{k < bits.length - 1 && <span className="inline-flex items-end"><Box label={`Bagian ${i + 1} kotak ${k + 1}`} letter={typeof p.answers[k] === "string"} value={x[k]} onChange={v => put(k, v)} disabled={checked} />{lead(k + 1)}</span>}</span>)}</p>; }
    case "choice": return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-x-2 gap-y-1.5"><p className="text-lg font-bold [@media(max-height:700px)]:text-base">{p.label}</p>
      <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`min-h-10 rounded-2xl border-4 px-3 text-base font-bold sm:text-lg ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
    case "pick": return <div role="group" aria-label={p.label} className="space-y-1"><p className="text-lg font-bold">{p.label}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{p.options.map((o, k) => <button key={k} type="button" aria-label={`Gambar ${"ABCD"[k]}`} aria-pressed={value === String(k)} disabled={checked} onClick={() => set(String(k))}
        className={`flex min-h-20 flex-col items-center justify-center gap-0.5 rounded-2xl border-4 bg-base-100 p-1 [@media(max-height:700px)]:min-h-0 ${value === String(k) ? "border-error bg-error/5" : "border-transparent ring-1 ring-base-300"}`}><span className="self-start text-sm font-extrabold leading-none">{"ABCD"[k]}</span><VisualArt v={o} /></button>)}</div></div>;
    case "build": { const h = heightsOf(p, value), mine = fromHeights(h, "b");
      return <div className="flex flex-wrap items-center gap-4"><Denah h={h} max={p.max} disabled={checked} set={nh => set(nh.flat().join("|"))} />
        <div className="grid min-h-28 min-w-32 place-items-center rounded-xl bg-base-100 p-1.5">{mine.length ? <Iso cubes={mine} s={18} axes={false} title={`Bangunmu: ${mine.length} kubus`} /> : <p className="max-w-32 text-center text-sm">Ketuk petak denah. Angka = tinggi tumpukan.</p>}</div></div>; }
    case "paint": return <Painter p={p} x={x} put={put} checked={checked} />;
    case "point": return <div className="flex flex-wrap items-center gap-3"><GridBoard cols={p.cols} rows={p.rows} marks={p.marks} picked={value || undefined} onPick={v => !checked && set(v)} g={38} label="Kertas berpetak untuk menjawab" />
      <p className="text-lg font-bold">Pilihanmu: {value ? showPt(value) : "…"}</p></div>;
    case "path": { const steps = value ? value.split(";") : [], path = [p.from, ...steps], last = path[path.length - 1];
      const tap = (q: string) => { if (checked) return; if (q === last && steps.length) set(steps.slice(0, -1).join(";")); else if (last !== p.to && manhattan(last, q) === 1) set([...steps, q].join(";")); };
      return <div className="flex flex-wrap items-center gap-3"><GridBoard cols={p.cols} rows={p.rows} marks={p.marks ?? [{ at: p.from, kind: "P" }, { at: p.to, kind: "Q" }]} path={path} onPick={tap} g={38} label="Kertas berpetak untuk membuat jalur" />
        <div className="flex items-center gap-2 sm:flex-col sm:items-start"><p className="text-lg font-bold">Langkah: {steps.length}</p><button type="button" className="btn btn-sm btn-ghost gap-1" disabled={checked || !steps.length} onClick={() => set("")}><RotateCcw className="size-4" aria-hidden="true" />Ulangi jalur</button></div></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: CQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.78]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

const hero = fromHeights([[1, 1, 1], [2, 2, 1], [3, 2, 0]], "o").map(c => ({ ...c, c: (["o", "b", "g"] as Color[])[c.z] }));
export default function GradeSixCubesV2() {
  const [topic, setTopic] = useState(0);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], s = t.sections[sec], Lab = labs[s.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number, si = 0) => { setTopic(ti); setSec(si); setMode("learn"); show(); };
  const last = topic === topics.length - 1 && sec === t.sections.length - 1;
  const next = () => (sec < t.sections.length - 1 ? go(topic, sec + 1) : go(topic + 1, 0));
  const prev = () => (sec > 0 ? go(topic, sec - 1) : go(topic - 1, topics[topic - 1].sections.length - 1));
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Kubus dan Balok</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Susun dan urai bangun dari kubus, gambar tampaknya dari depan, kanan, dan atas, lalu tentukan lokasi, jalur, dan jarak pada sistem berpetak.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true"><Iso cubes={hero} s={20} axes={false} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Bangunan dari kontainer bekas</h2>
        <p className="mt-2 text-sm">Ada perpustakaan dan hotel yang dibangun dari tumpukan kontainer. Berapa kontainer yang dipakai? Seperti apa bangunannya dari depan atau dari atas? Di sini kamu menjadi arsiteknya.</p>
        <p className="mt-2 text-sm text-base-content/60">6 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-kubus">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-kubus" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.short}`} className="mb-3 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-base leading-7">{s.steps.map(x => <li key={x}>{x}</li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-base leading-7">{s.example}</p>}
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{s.demo}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0 && sec === 0} onClick={prev}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => open("practice")}>Latihan {t.code}</button>
            {!last ? <button type="button" className="btn btn-outline gap-1" onClick={next}>{sec < t.sections.length - 1 ? "Bagian berikutnya" : "Materi berikutnya"}<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => open("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<CQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2.5 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.65]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
