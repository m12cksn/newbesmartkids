"use client";

import { ArrowLeft, ArrowRight, Check, Eraser, RotateCcw, Scissors, Undo2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  angleCount, angles, assessment, cells, congruent, correct, dist, formatAnswer, parallelPairs, polyName, practice, quadNames, ready, SEP, sides, splitParts, tangram, thingName, topics, triKind,
  type Fig, type Part, type Piece, type Pt, type Scene, type SQuestion, type Thing,
} from "@/data/grade-four-shapes-v2";

const ink = "#2b2320", fillA = "#bfe3d0", strokeA = "#1f6f50";
const palette = ["#f4a12f", "#4caf50", "#e2468e", "#7cb8e8", "#f6d32d", "#2e7d4f", "#2f6fb5", "#c4562f"];

/* ====================================================================== */
/* Gambar bangun                                                           */
/* ====================================================================== */
type Box = [number, number, number, number];
const boxOf = (f: Fig): Box => {
  if (f.pts) { const xs = f.pts.map(p => p[0]), ys = f.pts.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
  if (f.c) return [f.c[0] - f.c[2], f.c[1] - f.c[2], f.c[0] + f.c[2], f.c[1] + f.c[2]];
  return [0, 0, 100, 100];
};
/** Tanda sisi sama panjang (garis kecil) dan sudut siku-siku (kotak kecil). */
function Marks({ pts, k }: { pts: Pt[]; k: number }) {
  const s = sides(pts), group: number[] = s.map(() => 0); let g = 0;
  s.forEach((x, i) => { if (group[i]) return; const same = s.map((y, j) => (Math.abs(x - y) < 0.006 * x ? j : -1)).filter(j => j >= 0); if (same.length > 1) { g++; same.forEach(j => (group[j] = g)); } });
  const ang = angles(pts), t = 5 / k, out: ReactNode[] = [];
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length], L = dist(a, b), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    for (let n = 0; n < group[i]; n++) { const o = (n - (group[i] - 1) / 2) * 2.6 / k; out.push(<line key={`t${i}-${n}`} x1={mx + ux * o - uy * t} y1={my + uy * o + ux * t} x2={mx + ux * o + uy * t} y2={my + uy * o - ux * t} stroke={ink} strokeWidth={1.6 / k} />); }
    if (Math.abs(ang[i] - 90) < 1) {
      const p = pts[(i - 1 + pts.length) % pts.length], q = b, r = 7 / k;
      const u = [(p[0] - a[0]) / dist(a, p) * r, (p[1] - a[1]) / dist(a, p) * r], v = [(q[0] - a[0]) / dist(a, q) * r, (q[1] - a[1]) / dist(a, q) * r];
      out.push(<path key={`r${i}`} d={`M${a[0] + u[0]} ${a[1] + u[1]} L${a[0] + u[0] + v[0]} ${a[1] + u[1] + v[1]} L${a[0] + v[0]} ${a[1] + v[1]}`} fill="none" stroke={ink} strokeWidth={1.4 / k} />);
    }
  });
  return <>{out}</>;
}
/** Satu bangun. `unit` memberi ukuran nyata (px per satuan) agar beberapa bangun sebanding. */
export function FigView({ fig, size = 96, unit, color = fillA, label = true }: { fig: Fig; size?: number; unit?: number; color?: string; label?: boolean }) {
  const [x0, y0, x1, y1] = boxOf(fig), w = Math.max(x1 - x0, 1), h = Math.max(y1 - y0, 1);
  const k = unit ?? Math.min(size / w, size / h), pad = 4 / k;
  const W = (w + 2 * pad) * k, H = (h + 2 * pad) * k, sw = 2.2 / k;
  return <figure className="flex flex-col items-center gap-0.5">
    <svg role="img" aria-label={`Bangun ${fig.label ?? ""}`.trim()} width={W} height={H} viewBox={`${x0 - pad} ${y0 - pad} ${w + 2 * pad} ${h + 2 * pad}`} className="h-auto max-w-full">
      {fig.pts && <polygon points={fig.pts.map(p => p.join(",")).join(" ")} fill={fig.color ?? color} stroke={strokeA} strokeWidth={sw} strokeLinejoin="round" />}
      {fig.d && <path d={fig.d} fill={fig.color ?? color} stroke={strokeA} strokeWidth={sw} strokeLinejoin="round" />}
      {fig.c && <circle cx={fig.c[0]} cy={fig.c[1]} r={fig.c[2]} fill={fig.color ?? color} stroke={strokeA} strokeWidth={sw} />}
      {fig.cuts?.map(([a, b], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={ink} strokeWidth={sw} strokeDasharray={`${5 / k} ${3 / k}`} />)}
      {fig.marks && fig.pts && <Marks pts={fig.pts} k={k} />}
    </svg>
    {label && fig.label && <figcaption className="text-base font-extrabold leading-none text-sky-700">{fig.label}</figcaption>}
  </figure>;
}
/** Ukuran bersama untuk beberapa bangun agar besar-kecilnya bisa dibandingkan. */
const sharedUnit = (fs: Fig[], size: number) => size / Math.max(...fs.map(f => { const [a, b, c, d] = boxOf(f); return Math.max(c - a, d - b); }));
function MosaicView({ pieces, name, size = 200 }: { pieces: Piece[]; name: string; size?: number }) {
  const all = pieces.flatMap(p => (p.pts ? p.pts : p.c ? [[p.c[0] - p.c[2], p.c[1] - p.c[2]], [p.c[0] + p.c[2], p.c[1] + p.c[2]]] as Pt[] : []));
  const x0 = Math.min(...all.map(p => p[0])), y0 = Math.min(...all.map(p => p[1])), x1 = Math.max(...all.map(p => p[0])), y1 = Math.max(...all.map(p => p[1]));
  const w = x1 - x0, h = y1 - y0, k = Math.min(size / w, (size * 0.85) / h), pad = 0.3;
  return <svg role="img" aria-label={`Gambar ${name} dari ${pieces.length} bangun datar`} width={(w + 2 * pad) * k} height={(h + 2 * pad) * k} viewBox={`${x0 - pad} ${y0 - pad} ${w + 2 * pad} ${h + 2 * pad}`} className="h-auto max-w-full">
    {pieces.map((p, i) => p.c ? <circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.c[2]} fill={p.color} stroke={ink} strokeWidth={0.06} /> : <polygon key={i} points={p.pts!.map(q => q.join(",")).join(" ")} fill={p.color} stroke={ink} strokeWidth={0.07} strokeLinejoin="round" />)}
  </svg>;
}

/* ====================================================================== */
/* Benda nyata                                                             */
/* ====================================================================== */
export function ThingArt({ thing, size = 52 }: { thing: Thing; size?: number }) {
  const s = { width: size, height: size, viewBox: "0 0 60 60", "aria-hidden": true } as const;
  switch (thing) {
    case "papan": return <svg {...s}><rect x="5" y="10" width="50" height="36" rx="1.5" fill="#a0672f" stroke={ink} strokeWidth="1.3" /><rect x="9" y="14" width="42" height="28" fill="#2f4a3a" /><path d="M14 22c5-3 9 3 14 0M14 30h18" stroke="#e8efe9" strokeWidth="1.2" fill="none" /><rect x="34" y="44" width="10" height="3" fill="#f4f4f4" stroke={ink} strokeWidth=".8" /></svg>;
    case "mur": return <svg {...s}><path d="M30 6l20.8 12v24L30 54 9.2 42V18z" fill="#b8c2cc" stroke={ink} strokeWidth="1.4" /><circle cx="30" cy="30" r="10" fill="#fff" stroke={ink} strokeWidth="1.4" /><circle cx="30" cy="30" r="12.5" fill="none" stroke="#8a97a3" strokeWidth="1" strokeDasharray="2 1.5" /></svg>;
    case "penggaris": return <svg {...s}><path d="M6 52V8l46 44z" fill="#9fd1ec" stroke={ink} strokeWidth="1.4" strokeLinejoin="round" /><path d="M14 44V26l18 18z" fill="#fff" stroke={ink} strokeWidth="1" strokeLinejoin="round" />{[14, 20, 26, 32, 38].map(y => <path key={y} d={`M6 ${y}h4`} stroke={ink} strokeWidth=".9" />)}</svg>;
    case "ban": return <svg {...s}><circle cx="30" cy="30" r="25" fill="#2b2b2b" stroke={ink} strokeWidth="1.2" /><circle cx="30" cy="30" r="13" fill="#c9ced3" stroke={ink} strokeWidth="1.2" /><circle cx="30" cy="30" r="4" fill="#8a97a3" />{[0, 72, 144, 216, 288].map(a => <circle key={a} cx={30 + 8 * Math.cos((a * Math.PI) / 180)} cy={30 + 8 * Math.sin((a * Math.PI) / 180)} r="1.6" fill="#555" />)}</svg>;
    case "gelang": return <svg {...s}><path d="M38 12A20 20 0 1 1 22 12" fill="none" stroke="#e0a526" strokeWidth="5" strokeLinecap="round" /><circle cx="38" cy="12" r="3.4" fill="#f2c94c" stroke={ink} strokeWidth="1" /><circle cx="22" cy="12" r="3.4" fill="#f2c94c" stroke={ink} strokeWidth="1" /></svg>;
    case "eskrim": return <svg {...s}><path d="M17 26l13 30 13-30z" fill="#e0a45a" stroke={ink} strokeWidth="1.3" strokeLinejoin="round" /><path d="M21 30l15 12M25 28l14 4M19 34l14 14" stroke="#b97a32" strokeWidth=".9" /><path d="M15 27c-2-12 6-20 15-20s17 8 15 20z" fill="#f7b6c8" stroke={ink} strokeWidth="1.3" /></svg>;
    case "rambu": return <svg {...s}><rect x="28.5" y="38" width="3" height="20" fill="#8a97a3" /><path d="M30 4l24 40H6z" fill="#e2574c" stroke={ink} strokeWidth="1.3" strokeLinejoin="round" /><path d="M30 14l14 24H16z" fill="#fff" /><path d="M30 20v10M30 33v2" stroke={ink} strokeWidth="2.4" strokeLinecap="round" /></svg>;
    case "jam": return <svg {...s}><circle cx="30" cy="30" r="25" fill="#fff" stroke="#2f6fb5" strokeWidth="4" /><path d="M30 30V14M30 30l10 6" stroke={ink} strokeWidth="2" strokeLinecap="round" />{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={30 + 20 * Math.cos((i * Math.PI) / 6)} cy={30 + 20 * Math.sin((i * Math.PI) / 6)} r="1" fill={ink} />)}</svg>;
  }
}

function SceneView({ scene }: { scene: Scene }) {
  if (scene.type === "mosaic") return <MosaicView pieces={scene.pieces} name={scene.name} />;
  const n = scene.figs.length, size = n === 1 ? 150 : n === 2 ? 120 : n <= 4 ? 84 : 70;
  const unit = scene.figs.every(f => f.pts && Math.max(...f.pts.flat()) <= 12) ? sharedUnit(scene.figs, size) : undefined;
  return <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-2">{scene.figs.map((f, i) => <FigView key={i} fig={f} size={size} unit={unit} />)}</div>;
}

/* ====================================================================== */
/* Susun keping                                                            */
/* ====================================================================== */
const ptsStr = (p: Pt[]) => p.map(q => q.join(",")).join(" ");
const centroid = (p: Pt[]): Pt => [p.reduce((a, q) => a + q[0], 0) / p.length, p.reduce((a, q) => a + q[1], 0) / p.length];
/** Bangun target dengan tempat keping. value: indeks keping per tempat ("" = kosong). */
function SlotBoard({ slots, pieces, value, set, disabled, colors = palette }: { slots: Pt[][]; pieces: Pt[][]; value: string[]; set: (v: string[]) => void; disabled?: boolean; colors?: string[] }) {
  const [sel, setSel] = useState<number | null>(null);
  const all = slots.flat(), x0 = Math.min(...all.map(p => p[0])), y0 = Math.min(...all.map(p => p[1])), x1 = Math.max(...all.map(p => p[0])), y1 = Math.max(...all.map(p => p[1]));
  const unit = Math.min(30, 230 / (x1 - x0), 170 / (y1 - y0)), pad = 0.25;
  const used = new Set(value.filter(Boolean).map(Number));
  const tapSlot = (i: number) => {
    if (disabled) return;
    const v = [...value];
    if (sel !== null) { const old = v.indexOf(String(sel)); if (old >= 0) v[old] = ""; v[i] = String(sel); setSel(null); }
    else if (v[i] !== "") v[i] = "";
    else return;
    set(v);
  };
  const pieceSvg = (p: Pt[], i: number, u: number) => { const xs = p.map(q => q[0]), ys = p.map(q => q[1]), a = Math.min(...xs), b = Math.min(...ys), w = Math.max(...xs) - a, h = Math.max(...ys) - b;
    return <svg aria-hidden="true" width={(w + 0.3) * u} height={(h + 0.3) * u} viewBox={`${a - 0.15} ${b - 0.15} ${w + 0.3} ${h + 0.3}`}><polygon points={ptsStr(p)} fill={colors[i % colors.length]} stroke={ink} strokeWidth={0.06} strokeLinejoin="round" /></svg>; };
  return <div className="flex flex-wrap items-center justify-center gap-3">
    <svg role="group" aria-label="Bangun yang disusun" width={(x1 - x0 + 2 * pad) * unit} height={(y1 - y0 + 2 * pad) * unit} viewBox={`${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`} className="h-auto max-w-full">
      {slots.map((s, i) => { const k = value[i], c = centroid(s), piece = k !== "" ? pieces[Number(k)] : undefined, fits = !!piece && congruent(piece, s);
        // Keping yang tidak pas digambar dengan bentuk aslinya di tengah tempat, agar terlihat tidak cocok.
        const pc = piece ? centroid(piece) : c;
        return <g key={i} role="button" tabIndex={disabled ? -1 : 0} aria-label={`Tempat ${i + 1}${k !== "" ? " terisi" : ""}`} onClick={() => tapSlot(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tapSlot(i); } }} className="cursor-pointer outline-none focus-visible:[&>polygon]:stroke-[0.16]">
          <polygon points={ptsStr(s)} fill={fits ? colors[Number(k) % colors.length] : piece ? "#fde2e2" : sel !== null ? "#fff7e6" : "#f8fafc"} stroke={fits ? ink : piece ? "#c0392b" : "#94a3b8"} strokeWidth={0.07} strokeDasharray={fits ? undefined : "0.18 0.12"} strokeLinejoin="round" />
          {piece && !fits && <polygon pointerEvents="none" points={ptsStr(piece)} transform={`translate(${c[0] - pc[0]} ${c[1] - pc[1]})`} fill={colors[Number(k) % colors.length]} fillOpacity={0.85} stroke="#c0392b" strokeWidth={0.07} strokeLinejoin="round" />}
          {k === "" && <text x={c[0]} y={c[1] + 0.18} textAnchor="middle" fontSize={0.55} fontWeight={800} fill="#64748b">{i + 1}</text>}
        </g>; })}
    </svg>
    <div className="flex max-w-xs flex-wrap items-end justify-center gap-1.5">
      {pieces.map((p, i) => used.has(i) ? null : <button key={i} type="button" disabled={disabled} aria-label={`Keping ${i + 1}`} aria-pressed={sel === i} onClick={() => setSel(sel === i ? null : i)}
        className={`rounded-lg border-2 bg-white p-1 ${sel === i ? "border-success ring-2 ring-success" : "border-base-300"}`}>{pieceSvg(p, i, unit * 0.8)}</button>)}
      {used.size === pieces.length && <span className="text-sm text-base-content/60">Semua keping terpakai.</span>}
    </div>
  </div>;
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const presets: Record<string, Pt[]> = { Segitiga: [[1, 5], [5, 5], [3, 1]], Segiempat: [[1, 1], [5, 1], [5, 4], [1, 4]], Segilima: [[3, 0], [6, 2], [5, 5], [1, 5], [0, 2]], Segienam: [[2, 0], [4, 0], [6, 3], [4, 6], [2, 6], [0, 3]] };
const cross = (a: Pt, b: Pt, c: Pt) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
const segX = (a: Pt, b: Pt, c: Pt, d: Pt) => cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
const onSeg = (v: Pt, a: Pt, b: Pt) => Math.abs(cross(a, b, v)) < 1e-9 && v[0] >= Math.min(a[0], b[0]) && v[0] <= Math.max(a[0], b[0]) && v[1] >= Math.min(a[1], b[1]) && v[1] <= Math.max(a[1], b[1]);
/** Titik sudut yang menempel pada sisi lain, atau tiga titik berurutan segaris (sisi bertumpuk). */
const touches = (p: Pt[]) => p.some((v, i) => Math.abs(cross(p[(i - 1 + p.length) % p.length], v, p[(i + 1) % p.length])) < 1e-9 || p.some((a, j) => j !== i && (j + 1) % p.length !== i && onSeg(v, a, p[(j + 1) % p.length])));
const selfCross = (p: Pt[]) => p.some((a, i) => p.some((c, j) => j > i + 1 && !(i === 0 && j === p.length - 1) && segX(a, p[(i + 1) % p.length], c, p[(j + 1) % p.length])));
const letters = "ABCDEF";
function ShapeLab() {
  const [pts, setPts] = useState<Pt[]>(presets.Segiempat), [sel, setSel] = useState<number | null>(null);
  const N = 7, cell = 36, ok = !selfCross(pts) && !touches(pts) && new Set(pts.map(p => p.join())).size === pts.length && Math.abs(pts.reduce((s, a, i) => { const b = pts[(i + 1) % pts.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0)) > 0.1;
  const move = (x: number, y: number) => { if (sel === null) return; const p = [...pts]; p[sel] = [x, y]; setPts(p); setSel(null); };
  let name = polyName(pts.length), extra = "";
  if (ok && pts.length === 3) { const t = triKind(pts); name = `segitiga ${t.bySide}`; extra = `Menurut sudutnya: segitiga ${t.byAngle}.`; }
  if (ok && pts.length === 4) { const q = quadNames(pts); name = q[0]; extra = q.length > 1 ? `Juga termasuk ${q.slice(1).join(", ")}.` : ""; }
  const lc = angleCount(pts, "lancip"), sk = angleCount(pts, "siku-siku"), tp = angleCount(pts, "tumpul");
  return <div className="space-y-2.5">
    <div role="radiogroup" aria-label="Bangun awal" className="flex flex-wrap gap-1.5">{Object.keys(presets).map(k => <button key={k} type="button" role="radio" aria-checked={pts.length === presets[k].length && pts === presets[k]} onClick={() => { setPts(presets[k]); setSel(null); }} className="btn btn-sm btn-outline">{k}</button>)}</div>
    <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.8]">
      <svg role="group" aria-label="Kertas bertitik" width={(N - 1) * cell + 40} height={(N - 1) * cell + 40} viewBox={`-20 -20 ${(N - 1) * cell + 40} ${(N - 1) * cell + 40}`} className="h-auto max-w-full rounded-lg bg-white">
        <polygon points={pts.map(([x, y]) => `${x * cell},${y * cell}`).join(" ")} fill={ok ? fillA : "#fde2e2"} stroke={ok ? strokeA : "#c0392b"} strokeWidth="2.5" strokeLinejoin="round" />
        {ok && <g transform={`scale(${cell})`}><Marks pts={pts} k={cell} /></g>}
        {Array.from({ length: N * N }, (_, i) => { const x = i % N, y = Math.floor(i / N);
          return <circle key={i} role="button" tabIndex={sel === null ? -1 : 0} aria-label={`Titik petak ${x},${y}`} cx={x * cell} cy={y * cell} r={sel === null ? 3 : 7} fill={sel === null ? "#94a3b8" : "#f4a12f"} opacity={sel === null ? 0.7 : 0.55} onClick={() => move(x, y)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); move(x, y); } }} className="cursor-pointer" />; })}
        {pts.map(([x, y], i) => <g key={i} role="button" tabIndex={0} aria-label={`Titik sudut ${letters[i]}`} aria-pressed={sel === i} onClick={() => setSel(sel === i ? null : i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(sel === i ? null : i); } }} className="cursor-pointer">
          <circle cx={x * cell} cy={y * cell} r="11" fill={sel === i ? "#1f6f50" : "#fff"} stroke={strokeA} strokeWidth="2.5" />
          <text x={x * cell} y={y * cell + 4.5} textAnchor="middle" fontSize="12" fontWeight="800" fill={sel === i ? "#fff" : strokeA}>{letters[i]}</text>
        </g>)}
      </svg>
    </div>
    <Result value={`${pts.length}:${ok ? name : "x"}`}>{!ok ? "Sisinya saling berpotongan, bertumpuk, atau segaris. Pindahkan salah satu titik sudut." : sel !== null ? `Titik ${letters[sel]} dipilih. Ketuk titik petak tujuannya.` : <>
      <strong className="capitalize">{name}</strong>: {pts.length} sisi dan {pts.length} sudut ({[lc && `${lc} lancip`, sk && `${sk} siku-siku`, tp && `${tp} tumpul`].filter(Boolean).join(", ")}).{pts.length === 4 ? ` Sisi sejajar: ${parallelPairs(pts)} pasang.` : ""} {extra}</>}</Result>
  </div>;
}
const tanSlots = tangram.map(p => p.pts!), tanColors = tangram.map(p => p.color);
function TangramLab() {
  const full = tanSlots.map((_, i) => String(i)), [v, setV] = useState<string[]>(full);
  const placed = v.filter(Boolean).length, fit = v.filter((k, i) => k !== "" && congruent(tanSlots[Number(k)], tanSlots[i])).length;
  return <div className="space-y-2.5">
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-outline gap-1" disabled={placed === 0} onClick={() => setV(tanSlots.map(() => ""))}><Scissors className="size-4" aria-hidden="true" />Uraikan</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={placed === 7} onClick={() => setV(full)}><RotateCcw className="size-4" aria-hidden="true" />Susun otomatis</button></div>
    <div className="[@media(max-height:700px)]:[zoom:0.8]"><SlotBoard slots={tanSlots} pieces={tanSlots} value={v} set={setV} colors={tanColors} /></div>
    <Result value={`${fit}:${placed}`}>{placed > fit ? `${placed - fit} keping belum pas: bentuk atau ukurannya berbeda dengan tempatnya. Ketuk tempat bergaris merah untuk melepasnya.` : fit === 7 ? "Tujuh keping tersusun menjadi persegi besar: 5 segitiga (2 besar, 1 sedang, 2 kecil), 1 persegi, dan 1 jajargenjang." : placed === 0 ? "Persegi sudah diurai menjadi 7 keping. Ketuk keping, lalu ketuk tempat yang bentuk dan ukurannya sama." : `${placed} dari 7 keping sudah tersusun.`}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { shape: ShapeLab, tangram: TangramLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function NumBox({ value, onChange, label, disabled }: { value: string; onChange: (v: string) => void; label: string; disabled: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
    className="h-11 w-16 rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none sm:text-2xl" />;
}
const ItemArt = ({ it, size }: { it: Thing | Fig; size: number }) => (typeof it === "string" ? <ThingArt thing={it} size={size} /> : <FigView fig={it} size={size - 8} />);
function SortPart({ p, value, set, checked }: { p: Extract<Part, { kind: "sort" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = cells(p, value), name = (k: number) => { const it = p.items[k]; return typeof it === "string" ? thingName[it] : `bangun ${it.label}`; };
  const put = (bin: number) => { if (sel === null) return; const v = [...vals]; v[sel] = String(bin); set(v.join("|")); setSel(null); };
  const card = (k: number) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${name(k)}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
    className={`flex w-[4.6rem] flex-col items-center rounded-xl border-2 bg-white p-0.5 text-xs font-bold leading-tight ${sel === k ? "border-success ring-2 ring-success" : "border-base-300"}`}><ItemArt it={p.items[k]} size={46} />{typeof p.items[k] === "string" && thingName[p.items[k] as Thing]}</button>;
  const loose = vals.map((v, k) => (v === "" ? k : -1)).filter(k => k >= 0);
  return <div className="space-y-2">
    <p className="text-sm text-base-content/70">{sel === null ? "Ketuk benda, lalu ketuk kotak tujuannya." : `Masukkan ${name(sel)} ke kotak mana?`}</p>
    <div className="flex min-h-12 flex-wrap justify-center gap-1.5">{loose.length ? loose.map(card) : <span className="self-center text-sm text-base-content/50">Semua sudah masuk kotak.</span>}</div>
    <div className="grid grid-cols-2 gap-2">{p.bins.map((b, bi) => <div key={b} className="flex flex-col rounded-xl border-2 border-dashed border-sky-400 bg-sky-50 p-1.5">
      <button type="button" disabled={checked || sel === null} onClick={() => put(bi)} aria-label={`Masukkan ke ${b}`} className="btn btn-sm btn-info mb-1.5 h-auto min-h-8 disabled:!bg-sky-200 disabled:!text-sky-900">{b}</button>
      <div className="flex min-h-16 flex-wrap justify-center gap-1">{vals.map((v, k) => (v === String(bi) ? card(k) : null))}</div>
    </div>)}</div>
  </div>;
}
function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = cells(p, value), n = p.left.length, m = p.right.length, H = 1000;
  return <div className="space-y-1.5">
    <p className="text-sm text-base-content/70">{sel === null ? "Ketuk segitiga di kiri, lalu ketuk namanya di kanan." : "Sekarang ketuk namanya di kanan."}</p>
    <div className="grid grid-cols-[minmax(0,0.8fr)_2rem_minmax(0,1.2fr)] sm:grid-cols-[minmax(0,0.8fr)_4rem_minmax(0,1.2fr)]" style={{ minHeight: Math.max(n, m) * 62 }}>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih segitiga ${l.label}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`flex items-center justify-center gap-1 rounded-xl border-2 p-0.5 ${sel === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-info/60 bg-base-100" : "border-orange-300 bg-orange-50"}`}><FigView fig={{ ...l, label: undefined }} size={46} /><span className="text-lg font-extrabold">{l.label}</span></button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / m) * H} stroke="#0f766e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${m}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || sel === null} aria-label={`Hubungkan ke ${r}`} onClick={() => { if (sel === null) return; const v = [...vals]; v[sel] = String(j); set(v.join("|")); setSel(null); }}
        className="rounded-xl border-2 border-purple-300 bg-purple-50 px-1.5 py-1 text-base font-extrabold leading-tight">{r}</button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
function TablePart({ p, value, set, checked }: { p: Extract<Part, { kind: "table" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const x = cells(p, value).map(c => c === "1"), C = p.cols.length;
  const toggle = (k: number) => { const y = x.map(b => (b ? "1" : "0")); y[k] = x[k] ? "0" : "1"; set(y.join("|")); };
  // Tanda pemenggalan agar nama panjang muat di kolom sempit.
  const show = (l = "") => l.replace("Jajargenjang", "Jajar\u00adgenjang");
  return <div className="overflow-x-auto"><table className="w-full table-fixed border-collapse text-center text-sm">
    <thead><tr><th className="w-[30%] p-1 text-left text-xs font-bold">Ciri</th>{p.cols.map(c => <th key={c.label} className="p-0.5 align-bottom"><div className="flex flex-col items-center"><FigView fig={{ ...c, label: undefined }} size={C > 3 ? 34 : 46} /><span className="text-[11px] font-bold leading-tight sm:text-xs">{show(c.label)}</span></div></th>)}</tr></thead>
    <tbody>{p.rows.map((r, ri) => <tr key={r} className="border-t border-base-300"><th scope="row" className="p-1 text-left text-xs font-semibold leading-tight sm:text-sm">{r}</th>
      {p.cols.map((c, ci) => { const k = ri * C + ci; return <td key={ci} className="p-0.5"><button type="button" disabled={checked} aria-label={`${r}: ${c.label}`} aria-pressed={x[k]} onClick={() => toggle(k)}
        className={`mx-auto grid size-10 place-items-center rounded-lg border-2 ${x[k] ? "border-success bg-success/15" : "border-base-300 bg-white"}`}>{x[k] ? <Check className="size-6 text-success" strokeWidth={2.5} aria-hidden="true" /> : <span aria-hidden="true" className="text-base-content/30">–</span>}</button></td>; })}</tr>)}</tbody>
  </table><p className="mt-1 text-xs text-base-content/60 [@media(max-height:700px)]:hidden">Ketuk kotak untuk mencentang. Ketuk lagi untuk menghapus.</p></div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      return <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xl font-bold sm:text-2xl">{bits.map((b, k) => <span key={k} className="contents">{b && <span>{b.trim()}</span>}{k < bits.length - 1 && <NumBox label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} />}</span>)}</p>; }
    case "count": return <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">{p.labels.map((l, k) => <label key={l} className="flex items-center justify-between gap-1.5 rounded-xl bg-base-100 py-0.5 pe-0.5 ps-2 text-base font-bold leading-tight ring-1 ring-base-300 sm:text-lg">{l}<NumBox label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} /></label>)}</div>;
    case "choice": return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-x-3 gap-y-1.5"><p className="text-xl font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`min-h-11 rounded-2xl border-4 px-3 text-left text-base font-bold leading-tight sm:text-lg ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
    case "pick": { const unit = p.same ? sharedUnit(p.figs, 56) : undefined;
      return <div role="group" aria-label={p.label} className="space-y-1.5"><p className="text-lg font-bold">{p.label}</p>
        <div className="flex flex-wrap justify-center gap-2">{p.figs.map((f, k) => <button key={k} type="button" aria-label={`Gambar ${f.label}`} aria-pressed={value === String(k)} disabled={checked} onClick={() => set(String(k))} className={`rounded-2xl border-4 p-1.5 ${value === String(k) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><FigView fig={f} size={56} unit={unit} /></button>)}</div></div>; }
    case "multi": { const on = value ? value.split("|") : [];
      return <div role="group" aria-label={p.label} className="space-y-1"><p className="text-lg font-bold">{p.label}</p>
        <div className="flex flex-wrap justify-center gap-1.5">{p.options.map((o, k) => <button key={o} type="button" aria-label={o} aria-pressed={on.includes(o)} disabled={checked} onClick={() => set((on.includes(o) ? on.filter(y => y !== o) : [...on, o]).join("|"))}
          className={`min-h-11 rounded-2xl border-4 px-2 font-extrabold ${p.figs ? "p-1" : "text-lg"} ${on.includes(o) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{p.figs ? <FigView fig={p.figs[k]} size={40} /> : o}</button>)}</div>
        <p className="text-xs text-base-content/60 [@media(max-height:700px)]:hidden">Pilih semua yang benar. Ketuk lagi untuk membatalkan.</p></div>; }
    case "sort": return <SortPart p={p} value={value} set={set} checked={checked} />;
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "table": return <TablePart p={p} value={value} set={set} checked={checked} />;
    case "slots": return <div className="space-y-1"><p className="text-sm text-base-content/70">Ketuk keping, lalu ketuk tempatnya. Ketuk tempat yang terisi untuk mengosongkannya.</p>
      <SlotBoard slots={p.slots} pieces={p.pieces} value={x} set={v => set(v.join("|"))} disabled={checked} />
      <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || x.every(y => y === "")} onClick={() => set("")}><Undo2 className="size-3.5" aria-hidden="true" />Kosongkan</button></div>;
  }
}
function Answer({ q, value, record, checked }: { q: SQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.76]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeFourShapesV2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], s = t.sections[0], Lab = labs[s.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Bangun Datar</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Kenali ciri segi banyak, segitiga, dan segiempat, lalu susun dan urai bangun datar seperti bermain tangram.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true"><MosaicView pieces={tangram} name="tangram" size={96} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Tujuh keping tangram</h2>
        <p className="mt-2 text-sm">Lima segitiga, satu persegi, dan satu jajargenjang bisa disusun menjadi persegi, rumah, atau perahu. Apa ciri setiap keping, dan bagaimana menyusunnya?</p>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bangun-4">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bangun-4" ref={area} className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<SQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 5"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.64]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
