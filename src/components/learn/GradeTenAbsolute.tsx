"use client";

import { ArrowLeft, ArrowRight, Footprints, Minus, Plus, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { AbsGraph, fnValue, M, NumberLine, plainMath, SceneView } from "./GradeTenAbsoluteArt";
import {
  assessment, cells, correct, fmt, formatAnswer, idn, intervalText, NONE, num, oneEnd, practice, ready, sections, SEP, SHAPES, splitParts, topics, twoEnds,
  type Fn, type Part, type PQuestion, type Shape,
} from "@/data/grade-ten-absolute";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, skip }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; skip?: number }) {
  const go = (d: number) => { let v = Math.round((value + d) * 100) / 100; if (v === skip) v = Math.round((v + d) * 100) / 100; if (v >= min && v <= max) set(v); };
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold"><M text={label} /></span>
    <button type="button" aria-label={`${plainMath(label)} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min} onClick={() => go(-step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{idn(value)}</span>
    <button type="button" aria-label={`${plainMath(label)} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max} onClick={() => go(step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm normal-case ${value === o ? "btn-success" : "btn-outline"}`}><M text={o} /></button>)}</div>;
}
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-center gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,18rem)_1fr]">{children}</div>;
const Steps = ({ lines }: { lines: string[] }) => <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">{lines.map(l => <li key={l}><M text={l} /></li>)}</ol>;
/** Bentuk ax + b yang rapi: 2x − 6, −x + 3, x. */
const lin = (a: number, b: number) => { const ax = a === 0 ? "" : a === 1 ? "x" : a === -1 ? "−x" : `${fmt(a)}x`; if (!b) return ax || "0"; if (!ax) return fmt(b); return `${ax} ${b < 0 ? "−" : "+"} ${fmt(Math.abs(b))}`; };
const sols = (a1: number, b1: number, a2: number, b2: number) => { const out: number[] = []; const add = (v: number) => { if (Number.isFinite(v) && !out.some(o => Math.abs(o - v) < 1e-9)) out.push(v); };
  if (a1 !== a2) add((b2 - b1) / (a1 - a2)); if (a1 !== -a2) add((-b2 - b1) / (a1 + a2)); return out.sort((p, q) => p - q); };

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
function JarakLab() {
  const [steps, setSteps] = useState<number[]>([3, -5, 4, -1]);
  const pos = steps.reduce((a, b) => a + b, 0), total = steps.reduce((a, b) => a + Math.abs(b), 0);
  const arrows = steps.map((s, i) => { const from = steps.slice(0, i).reduce((a, b) => a + b, 0); return { from, to: from + s, label: s > 0 ? `maju ${s}` : `mundur ${-s}` }; });
  const add = (s: number) => setSteps(x => (x.length < 8 ? [...x, s] : x));
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-1.5">{[1, 2, 3].map(k => <button key={`m${k}`} type="button" className="btn btn-sm btn-outline gap-1" onClick={() => add(k)}><Footprints className="size-4" aria-hidden="true" />Maju {k}</button>)}
      {[1, 2, 3].map(k => <button key={`b${k}`} type="button" className="btn btn-sm btn-outline gap-1" onClick={() => add(-k)}><Footprints className="size-4 -scale-x-100" aria-hidden="true" />Mundur {k}</button>)}
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setSteps([])}><RotateCcw className="size-3.5" aria-hidden="true" />Ulang</button></div>
    <Pair><NumberLine min={-8} max={8} arrows={arrows} marks={[{ x: pos, label: "akhir" }]} />
      <Steps lines={[`Langkah: ${steps.length ? steps.map(s => (s < 0 ? `(${fmt(s)})` : fmt(s))).join(" + ") : "belum ada"}`, `Posisi akhir = ${fmt(pos)}`, `Banyak langkah = ${steps.length ? steps.map(s => `|${fmt(s)}|`).join(" + ") : "0"} = ${total}`]} /></Pair>
    <Result value={`${pos}|${total}`}>{steps.length ? `Posisi akhir ${pos === 0 ? "kembali ke tempat semula" : pos > 0 ? `${pos} langkah di depan` : `${-pos} langkah di belakang`} posisi awal, tetapi langkah yang ditempuh ${total}.` : "Tambahkan langkah maju atau mundur."}</Result>
  </div>;
}

function DefinisiLab() {
  const [a, setA] = useState(2); const [b, setB] = useState(3); const [x, setX] = useState(0);
  const t = -b / a, inside = a * x + b, val = Math.abs(inside), up = inside >= 0;
  const posBranch = a > 0 ? `x ≥ ${fmt(t)}` : `x ≤ ${fmt(t)}`, negBranch = a > 0 ? `x < ${fmt(t)}` : `x > ${fmt(t)}`;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="a" value={a} set={setA} min={-3} max={3} skip={0} /><Stepper label="b" value={b} set={setB} min={-6} max={6} /><Stepper label="x" value={x} set={setX} min={-6} max={6} step={0.5} /></div>
    <Pair><NumberLine min={-6} max={6} marks={[{ x: t, label: "batas" }, { x, label: "x" }]} caption={`Titik batas x = ${fmt(t)}`} />
      <div className="space-y-1 text-sm leading-7"><p className="font-bold"><M text={`|${lin(a, b)}| =`} /></p>
        <p className={`rounded px-2 ${up ? "bg-success/20 font-semibold" : ""}`}><M text={`${lin(a, b)} jika ${posBranch}`} /></p>
        <p className={`rounded px-2 ${!up ? "bg-success/20 font-semibold" : ""}`}><M text={`${lin(-a, -b)} jika ${negBranch}`} /></p></div></Pair>
    <Result value={`${a}|${b}|${x}|${val}`}><M text={`Untuk x = ${fmt(x)}: isi tanda mutlak ${lin(a, b)} = ${fmt(inside)} ${up ? "tidak negatif, jadi nilainya tetap" : "negatif, jadi tandanya dibalik"}: |${fmt(inside)}| = ${fmt(val)}.`} /></Result>
  </div>;
}

function PersamaanLab() {
  const [a, setA] = useState(2); const [b, setB] = useState(-5); const [c, setC] = useState(9);
  const roots = c > 0 ? [(c - b) / a, (-c - b) / a].sort((p, q) => p - q) : c === 0 ? [-b / a] : [];
  const f: Fn = { a, b, label: `y = |${lin(a, b)}|` };
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="a" value={a} set={setA} min={-3} max={3} skip={0} /><Stepper label="b" value={b} set={setB} min={-8} max={8} /><Stepper label="c" value={c} set={setC} min={-3} max={10} /></div>
    <Pair><AbsGraph fns={[f]} hline={{ y: c, label: `y = ${c}` }} xmin={-8} xmax={10} ymin={-4} ymax={12} points={roots.map(r => [r, c] as [number, number])} />
      <Steps lines={c > 0 ? [`${lin(a, b)} = ${c} atau ${lin(a, b)} = ${-c}`, `x = ${fmt(roots[1])} atau x = ${fmt(roots[0])}`] : c === 0 ? [`${lin(a, b)} = 0`, `x = ${fmt(roots[0])}`] : [`c = ${c} < 0`, "Nilai mutlak tidak pernah negatif."]} /></Pair>
    <Result value={`${a}|${b}|${c}|${roots.length}`}><M text={`|${lin(a, b)}| = ${c}: ${roots.length === 2 ? `dua penyelesaian, x = ${fmt(roots[0])} atau x = ${fmt(roots[1])}` : roots.length === 1 ? `tepat satu penyelesaian, x = ${fmt(roots[0])}` : "tidak ada penyelesaian, garis y = c berada di bawah grafik"}.`} /></Result>
  </div>;
}

const pairs: { name: string; f: [number, number]; g: [number, number] }[] = [
  { name: "|2x − 1| = |x + 3|", f: [2, -1], g: [1, 3] },
  { name: "|x − 2| = |x − 8|", f: [1, -2], g: [1, -8] },
  { name: "|x − 2| = |2x + 2|", f: [1, -2], g: [2, 2] },
];
function GrafikLab() {
  const [k, setK] = useState(pairs[0].name);
  const p = pairs.find(x => x.name === k)!, s = sols(p.f[0], p.f[1], p.g[0], p.g[1]);
  const F: Fn = { a: p.f[0], b: p.f[1], label: `y = |${lin(p.f[0], p.f[1])}|` }, G: Fn = { a: p.g[0], b: p.g[1], label: `y = |${lin(p.g[0], p.g[1])}|` };
  const xs = [-4, -2, 0, 2, 4];
  return <div className="space-y-3">
    <Radios label="Persamaan" options={pairs.map(x => x.name)} value={k} set={setK} />
    <Pair><AbsGraph fns={[F, G]} xmin={-6} xmax={10} ymin={-1} ymax={12} points={s.map(r => [r, fnValue(F, r)] as [number, number])} />
      <div className="space-y-2 text-sm"><table className="w-full border-collapse text-center text-xs"><thead><tr className="bg-base-200"><th className="p-1">x</th>{xs.map(x => <th key={x} className="p-1">{fmt(x)}</th>)}</tr></thead>
        <tbody>{[F, G].map(fn => <tr key={fn.label} className="border-t border-base-300"><th className="p-1 text-left"><M text={fn.label} /></th>{xs.map(x => <td key={x} className="p-1">{fmt(fnValue(fn, x))}</td>)}</tr>)}</tbody></table>
        <Steps lines={[`Batas: x = ${fmt(-p.f[1] / p.f[0])} dan x = ${fmt(-p.g[1] / p.g[0])}`, `Titik potong: x = ${s.map(fmt).join(" atau x = ")}`]} /></div></Pair>
    <Result value={`${k}|${s.map(v => Math.round(v * 1000) / 1000).join(";")}`}><M text={`Kedua grafik berpotongan di ${s.map(v => `x = ${fmt(v)}`).join(" dan ")}, jadi penyelesaiannya ${s.map(v => `x = ${fmt(v)}`).join(" atau ")}.`} /></Result>
  </div>;
}

const signs = ["≤", "<", "≥", ">"] as const;
function IntervalLab() {
  const [p, setP] = useState(2); const [qq, setQ] = useState(3); const [sg, setSg] = useState<(typeof signs)[number]>("≤");
  const closed = sg === "≤" || sg === "≥", inner = sg === "≤" || sg === "<";
  const shape: Shape = qq === 0 ? (sg === "<" ? "kosong" : sg === ">" ? "luar" : sg === "≥" ? "semua" : "antara") : inner ? "antara" : "luar";
  const a = p - qq, b = p + qq, text = qq === 0 && sg === "≤" ? `x = ${fmt(p)}` : qq === 0 && sg === ">" ? `x ≠ ${fmt(p)}` : intervalText(shape, fmt(a), fmt(b), closed);
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-3"><Stepper label="p" value={p} set={setP} min={-5} max={5} /><Stepper label="q" value={qq} set={setQ} min={0} max={5} /><Radios label="Tanda" options={signs} value={sg} set={setSg} /></div>
    <Pair><NumberLine min={-10} max={10} shade={{ shape, a, b, closed }} marks={[{ x: p, label: "p" }]} caption={`|x − ${fmt(p)}| ${sg} ${qq}`} />
      <Steps lines={[`Jarak x ke ${fmt(p)} ${inner ? "paling jauh" : "paling dekat"} ${qq}${closed ? "" : " (batas tidak termasuk)"}`, inner ? `${fmt(p)} − ${qq} ${closed ? "≤" : "<"} x ${closed ? "≤" : "<"} ${fmt(p)} + ${qq}` : `x ${closed ? "≤" : "<"} ${fmt(p)} − ${qq} atau x ${closed ? "≥" : ">"} ${fmt(p)} + ${qq}`]} /></Pair>
    <Result value={`${sg}|${text}`}><M text={`Penyelesaian |x − ${fmt(p)}| ${sg} ${qq}: ${text}. ${closed ? "Titik penuh: batasnya termasuk." : "Titik kosong: batasnya tidak termasuk."}`} /></Result>
  </div>;
}

const ineqs: { name: string; quad: string; fac: string; z: [number, number]; pick: "+" | "−"; closed: boolean; f: [number, number]; g: [number, number] }[] = [
  { name: "|2x + 1| ≥ |x − 3|", quad: "3x^{2} + 10x − 8 ≥ 0", fac: "(3x − 2)(x + 4) ≥ 0", z: [-4, 2 / 3], pick: "+", closed: true, f: [2, 1], g: [1, -3] },
  { name: "|2x − 1| < |x + 4|", quad: "3x^{2} − 12x − 15 < 0", fac: "(x − 5)(x + 1) < 0", z: [-1, 5], pick: "−", closed: false, f: [2, -1], g: [1, 4] },
  { name: "|x − 3| ≤ |2x|", quad: "3x^{2} + 6x − 9 ≥ 0", fac: "(x + 3)(x − 1) ≥ 0", z: [-3, 1], pick: "+", closed: true, f: [1, -3], g: [2, 0] },
];
function TandaLab() {
  const [k, setK] = useState(ineqs[0].name);
  const it = ineqs.find(x => x.name === k)!, [z1, z2] = it.z, shape: Shape = it.pick === "+" ? "luar" : "antara";
  const text = intervalText(shape, fmt(z1), fmt(z2), it.closed);
  const W = 300, X = (v: number) => 30 + ((v + 6) / 12) * (W - 60);
  return <div className="space-y-3">
    <Radios label="Pertidaksamaan" options={ineqs.map(x => x.name)} value={k} set={setK} />
    <Pair><div className="space-y-2">
      <svg viewBox={`0 0 ${W} 70`} className="w-full max-w-sm" role="img" aria-label={`Garis tanda dengan pembuat nol ${fmt(z1)} dan ${fmt(z2)}, tanda plus, minus, plus`}>
        <line x1="10" x2={W - 10} y1="40" y2="40" stroke="#1f3b30" strokeWidth="1.5" />
        {(["+", "−", "+"] as const).map((sg, i) => { const cx = i === 0 ? (10 + X(z1)) / 2 : i === 1 ? (X(z1) + X(z2)) / 2 : (X(z2) + W - 10) / 2, on = sg === it.pick;
          return <g key={i}>{on && <rect x={i === 0 ? 10 : i === 1 ? X(z1) : X(z2)} y="34" width={i === 0 ? X(z1) - 10 : i === 1 ? X(z2) - X(z1) : W - 10 - X(z2)} height="12" fill="#2b8a3e" opacity="0.35" />}
            <text x={cx} y="24" textAnchor="middle" fontSize="18" fontWeight="700" fill={on ? "#2b8a3e" : "#5b6b64"}>{sg}</text></g>; })}
        {[z1, z2].map(z => <g key={z}><circle cx={X(z)} cy="40" r="5" fill={it.closed ? "#2b8a3e" : "#fff"} stroke="#2b8a3e" strokeWidth="2" /><text x={X(z)} y="62" textAnchor="middle" fontSize="11" fill="#1f3b30">{plainMath(fmt(z))}</text></g>)}
      </svg>
      <AbsGraph fns={[{ a: it.f[0], b: it.f[1], label: `y = |${lin(it.f[0], it.f[1])}|` }, { a: it.g[0], b: it.g[1], label: `y = |${lin(it.g[0], it.g[1])}|` }]} xmin={-6} xmax={6} ymin={-1} ymax={10} /></div>
      <Steps lines={[`Kuadratkan: ${it.quad}`, `Faktor: ${it.fac}`, `Pembuat nol: ${fmt(z1)} dan ${fmt(z2)}`, `Pilih daerah ${it.pick === "+" ? "positif (+)" : "negatif (−)"}`]} /></Pair>
    <Result value={`${k}|${text}`}><M text={`Penyelesaian ${it.name}: ${text}.`} /></Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { jarak: JarakLab, definisi: DefinisiLab, persamaan: PersamaanLab, grafik: GrafikLab, interval: IntervalLab, tanda: TandaLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-24" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="text" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,./\-−]/g, "").slice(0, 10))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-bold text-neutral focus:border-success focus:outline-none`} />;
}
function SolsetInput({ label, value, set, checked }: { label: string; value: string; set: (v: string) => void; checked: boolean }) {
  const none = value === NONE;
  return <div className="space-y-1.5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={label} /></span>
    <input aria-label={`${plainMath(label)} himpunan penyelesaian`} value={none ? "" : value} disabled={checked || none} placeholder="contoh: 4; −3" autoCapitalize="none" spellCheck={false}
      onChange={e => set(e.target.value.replace(/[^0-9,./;\-−\s]/g, "").slice(0, 24))}
      className="h-10 w-40 rounded-lg border-2 border-orange-400 bg-white px-2 text-center text-lg font-bold text-neutral focus:border-success focus:outline-none disabled:opacity-50" />
    <button type="button" aria-pressed={none} disabled={checked} onClick={() => set(none ? "" : NONE)} className={`btn btn-sm ${none ? "btn-success" : "btn-outline"}`}>Tidak ada penyelesaian</button></div>
    <p className="text-xs text-base-content/60">Pisahkan beberapa nilai dengan titik koma, misalnya 4; −3. Pecahan ditulis 2/3.</p></div>;
}
function IntervalInput({ p, value, set, checked }: { p: Extract<Part, { kind: "interval" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const x = cells(p, value), [shape, a, b, cl] = x, put = (k: number, v: string) => { const n = [...x]; n[k] = v; set(n.join("|")); };
  const A = num(a), B = num(b), closed = cl === "tutup";
  const preview = twoEnds(shape) && !Number.isNaN(A) && !Number.isNaN(B) && A < B ? { shape: shape as Shape, a: A, b: B, closed }
    : oneEnd(shape) && !Number.isNaN(A) ? { shape: shape as Shape, a: A, closed } : shape === "semua" ? { shape: "semua" as Shape } : null;
  const span = preview && preview.a !== undefined ? [Math.floor(Math.min(preview.a, preview.b ?? preview.a) - 4), Math.ceil(Math.max(preview.a, preview.b ?? preview.a) + 4)] : [-8, 8];
  return <div role="group" aria-label={plainMath(p.label)} className="space-y-2"><p className="font-bold"><M text={p.label} /></p>
    <div role="radiogroup" aria-label={`${plainMath(p.label)} bentuk`} className="flex flex-wrap gap-1.5">{SHAPES.map(s => <button key={s.id} type="button" role="radio" aria-checked={shape === s.id} disabled={checked} onClick={() => set([s.id, a, b, cl].join("|"))} className={`btn btn-sm ${shape === s.id ? "btn-success" : "btn-outline"}`}>{s.label}</button>)}</div>
    {(twoEnds(shape) || oneEnd(shape)) && <div className="flex flex-wrap items-center gap-2 text-sm">
      <span>{twoEnds(shape) ? "Batas kiri" : "Batas"}</span><In label={`${plainMath(p.label)} ${twoEnds(shape) ? "batas kiri" : "batas"}`} value={a} set={v => put(1, v)} disabled={checked} />
      {twoEnds(shape) && <><span>Batas kanan</span><In label={`${plainMath(p.label)} batas kanan`} value={b} set={v => put(2, v)} disabled={checked} /></>}
      <span className="join">{([["tutup", "Termasuk batas (≤, ≥)"], ["buka", "Tidak termasuk (<, >)"]] as const).map(([k, t]) => <button key={k} type="button" aria-pressed={cl === k} disabled={checked} onClick={() => put(3, k)} className={`btn join-item btn-sm ${cl === k ? "btn-success" : "btn-outline"}`}>{t}</button>)}</span></div>}
    {shape && <div className="rounded-lg bg-base-200/60 p-2"><NumberLine min={span[0]} max={span[1]} shade={preview} cls="w-full max-w-sm" />
      <p className="text-center text-sm font-semibold"><M text={intervalText(shape, a ? fmt(num(a)) : "…", b ? fmt(num(b)) : "…", closed)} /></p></div>}
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "solset": return <SolsetInput label={p.label} value={value} set={set} checked={checked} />;
    case "piece": return <div role="group" aria-label={`Bentuk ${plainMath(p.expr)}`} className="space-y-2 text-base"><p className="font-bold"><M text={`${p.expr} =`} /></p>
      <div className="flex flex-wrap items-center gap-1.5 ps-3"><In label={`${plainMath(p.expr)} bagian pertama koefisien x`} value={x[0]} set={v => put(0, v)} disabled={checked} w="w-16" /><span>x +</span><In label={`${plainMath(p.expr)} bagian pertama konstanta`} value={x[1]} set={v => put(1, v)} disabled={checked} w="w-16" /><span>jika x ≥</span><In label={`${plainMath(p.expr)} titik batas`} value={x[2]} set={v => put(2, v)} disabled={checked} w="w-16" /></div>
      <div className="flex flex-wrap items-center gap-1.5 ps-3"><In label={`${plainMath(p.expr)} bagian kedua koefisien x`} value={x[3]} set={v => put(3, v)} disabled={checked} w="w-16" /><span>x +</span><In label={`${plainMath(p.expr)} bagian kedua konstanta`} value={x[4]} set={v => put(4, v)} disabled={checked} w="w-16" /><span>jika x &lt; {x[2] || "…"}</span></div>
      <p className="text-xs text-base-content/60">Koefisien negatif ditulis dengan tanda minus, misalnya −2. Pecahan ditulis 3/2.</p></div>;
    case "interval": return <IntervalInput p={p} value={value} set={set} checked={checked} />;
    case "tbl": return <div className="overflow-x-auto"><table className="border-collapse text-center text-sm"><tbody>
      <tr><th className="border border-base-300 bg-base-200 px-2 py-1">x</th>{p.xs.map(t => <td key={t} className="border border-base-300 px-2 py-1 font-bold">{fmt(t)}</td>)}</tr>
      <tr><th className="border border-base-300 bg-base-200 px-2 py-1"><M text={p.label} /></th>{p.xs.map((t, k) => <td key={t} className="border border-base-300 p-1"><In label={`y untuk x = ${idn(t)}`} value={x[k]} set={v => put(k, v)} disabled={checked} w="w-14" /></td>)}</tr></tbody></table></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      {p.pics ? <div className="grid gap-2 sm:grid-cols-3">{p.options.map((op, k) => <button key={op} type="button" aria-label={`Pilihan ${op}`} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`flex flex-col items-center gap-1 rounded-2xl border-4 bg-base-100 p-1.5 ${value === op ? "border-error bg-error/5" : "border-transparent ring-1 ring-base-300"}`}><span className="self-start font-extrabold">{op}.</span><SceneView scene={p.pics![k]} /></button>)}</div>
        : <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div>}</div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeTenAbsolute() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 10, Bab 1</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Persamaan dan Pertidaksamaan Nilai Mutlak Linear Satu Variabel</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Memahami nilai mutlak sebagai jarak, menuliskannya tanpa tanda mutlak, menyelesaikan persamaan dan pertidaksamaan nilai mutlak, serta membaca penyelesaiannya pada garis bilangan dan grafik.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-56"><AbsGraph fns={[{ a: 1, b: 0, label: "" }]} xmin={-5} xmax={5} ymin={-1} ymax={5} cls="w-full" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Maju 4 langkah atau mundur 4 langkah?</h2>
        <p className="mt-2 text-sm">Arahnya berbeda, tetapi jaraknya sama: 4 langkah. Nilai mutlak mengukur jarak tanpa melihat arah, dan ide sederhana ini dipakai untuk batas suhu inkubator, toleransi berat kemasan, sampai perubahan debit sungai.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-nilai-mutlak">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-nilai-mutlak" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map(x => <button key={x.code} type="button" aria-current={x === t ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${x === t ? "btn-success" : "btn-outline"}`} onClick={() => go(sections.findIndex(o => o.topic === x))}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {inTopic.map(({ x, i }) => <button key={x.code} type="button" role="tab" aria-selected={i === idx} onClick={() => go(i)} className={`rounded-md px-2.5 py-1 text-left text-sm font-semibold ${i === idx ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{x.code} {plainMath(x.title)}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={idx} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{s.code} <M text={s.title} /></h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><M text={x} /></li>)}</ol>
            <div className="mt-4 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Dalam kehidupan sehari-hari</p><p><M text={s.life} /></p></div>
            <div className="mt-4 border-s-4 border-success ps-3 text-sm leading-7"><p><span className="font-bold">Contoh. </span><M text={s.example} /></p>
              <ol className="mt-1 list-decimal space-y-0.5 ps-5">{s.work.map(w => <li key={w}><M text={w} /></li>)}</ol></div>
            <div className="mt-4 text-sm leading-7"><p className="font-bold">Perlu diperhatikan</p><ul className="list-disc space-y-1 ps-5">{s.notes.map(w => <li key={w}><M text={w} /></li>)}</ul></div>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong><M text={s.demo} /></p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={idx === 0} onClick={() => go(idx - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan {s.code}</button>
            {idx < sections.length - 1 ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(idx + 1)}>{sections[idx + 1].topic === t ? "Bagian berikutnya" : "Materi berikutnya"}<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<PQuestion> key={`${mode}-${idx}`}
        questions={mode === "practice" ? practice[idx] : assessment}
        title={mode === "practice" ? `Latihan ${s.code} ${plainMath(s.title)}` : "Evaluasi Bab 1"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
