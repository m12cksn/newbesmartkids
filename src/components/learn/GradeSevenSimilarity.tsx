"use client";

import { ArrowLeft, ArrowRight, FlipHorizontal2, Minus, MoveHorizontal, Plus, RotateCcw, RotateCw, ZoomIn } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { MathText } from "./GradeSevenRationalArt";
import { Picture } from "./GradeSevenRatioArt";
import { FigView, Fractal, House, Transversal } from "./GradeSevenSimilarityArt";
import {
  assessment, cells, correct, formatAnswer, greek, idn, practice, ready, relations, SEP, splitParts, topics, transValue, triFromAngles, triFromSides,
  type Fig, type Part, type Pt, type Scene, type SQuestion,
} from "@/data/grade-seven-similarity";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, unit = "" }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => set(Math.round((value - step) * 100) / 100)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-12 text-center text-base font-extrabold tabular-nums">{idn(value)}{unit}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => set(Math.round((value + step) * 100) / 100)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function NumBox({ value, set, label, disabled }: { value: string; set: (v: string) => void; label: string; disabled?: boolean }) {
  return <input aria-label={label} inputMode="decimal" placeholder="…" value={value} disabled={disabled} onChange={e => set(e.target.value.replace(/\./g, ",").replace(/[^\d,]/g, "").replace(/,(?=.*,)/g, "").slice(0, 8))}
    className="h-10 w-24 rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none" />;
}

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
function PairLab() {
  const [a, setA] = useState(40);
  const r = (a * Math.PI) / 180;
  return <div className="space-y-3">
    <Stepper label="Besar sudut" value={a} set={setA} min={5} max={175} step={5} unit="°" />
    <div className="rounded-xl bg-base-100 p-3"><svg viewBox="0 0 240 130" className="mx-auto w-full max-w-sm" role="img" aria-label={`Sudut ${a} derajat dan pelurusnya ${180 - a} derajat`}>
      <line x1="20" y1="110" x2="220" y2="110" stroke="#33413b" strokeWidth="2" />
      <line x1="120" y1="110" x2={120 + Math.cos(r) * 95} y2={110 - Math.sin(r) * 95} stroke="#1c64b5" strokeWidth="2.5" />
      {a < 90 && <line x1="120" y1="110" x2="120" y2="15" stroke="#9aa5a0" strokeDasharray="4 3" />}
      <path d={`M150 110 A30 30 0 0 0 ${120 + Math.cos(r) * 30} ${110 - Math.sin(r) * 30}`} fill="none" stroke="#e8590c" strokeWidth="2" />
      <path d={`M${120 + Math.cos(r) * 42} ${110 - Math.sin(r) * 42} A42 42 0 0 0 78 110`} fill="none" stroke="#2b8a3e" strokeWidth="2" />
      <text x={120 + Math.cos(r / 2) * 52} y={110 - Math.sin(r / 2) * 40} fontSize="12" fontWeight="800" fill="#e8590c">{a}°</text>
      <text x={120 - Math.cos((Math.PI - r) / 2) * 62} y={110 - Math.sin((Math.PI - r) / 2) * 50} fontSize="12" fontWeight="800" fill="#2b8a3e">{180 - a}°</text>
    </svg></div>
    <Result value={`${a < 90 ? 90 - a : "-"}|${180 - a}`}>Pelurus {a}° adalah 180° − {a}° = <strong>{180 - a}°</strong> (busur hijau). {a < 90 ? <>Penyikunya 90° − {a}° = <strong>{90 - a}°</strong> (garis putus-putus menunjukkan 90°).</> : <>Sudut {a}° {a === 90 ? "adalah siku-siku; penyikunya 0°" : "tumpul, jadi tidak mempunyai penyiku"}.</>}</Result>
  </div>;
}
const relColor = ["#e8590c", "#2f86d6", "#7048e8", "#2b8a3e"];
function TransLab() {
  const [t, setT] = useState(65);
  const [rel, setRel] = useState(1);
  const R = relations[rel], colors: Record<number, string> = {};
  R.pairs.forEach((p, i) => p.forEach(k => { colors[k] = relColor[i]; }));
  return <div className="space-y-3">
    <Stepper label="Sudut garis potong" value={t} set={setT} min={30} max={150} step={5} unit="°" />
    <div role="radiogroup" aria-label="Hubungan sudut" className="flex flex-wrap gap-1.5">{relations.map((r, i) => <button key={r.name} type="button" role="radio" aria-checked={rel === i} onClick={() => setRel(i)} className={`btn btn-xs h-auto min-h-7 ${rel === i ? "btn-success" : "btn-outline"}`}>{r.name}</button>)}</div>
    <div className="rounded-xl bg-base-100 p-2"><Transversal t={t} labels={greek.map((g, k) => `${g} ${transValue(t, k)}°`)} colors={colors} /></div>
    <Result value={`${R.name}|${R.equal ? "sama" : "pelurus"}`}><strong>{R.name}</strong>: {R.pairs.map(([a, b]) => `${greek[a]} dan ${greek[b]}`).join(", ")}. {R.equal ? "Setiap pasangan sama besar." : "Setiap pasangan berpelurus: jumlahnya 180°."} Contoh: {greek[R.pairs[0][0]]} = {transValue(t, R.pairs[0][0])}° dan {greek[R.pairs[0][1]]} = {transValue(t, R.pairs[0][1])}°.</Result>
  </div>;
}
function TriangleLab() {
  const [A, setA] = useState(70);
  const [B, setB] = useState(50);
  const C = 180 - A - B, ok = C > 0;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="∠A" value={A} set={setA} min={10} max={160} step={5} unit="°" /><Stepper label="∠B" value={B} set={setB} min={10} max={160} step={5} unit="°" /></div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2">{ok ? <FigView fig={{ pts: triFromAngles(A, B), labels: ["A", "B", "C"], angles: [`${A}°`, `${B}°`, `${C}°`], extra: [{ pts: (() => { const P = triFromAngles(A, B); return [[P[2][0] - 3, P[2][1]], [P[2][0] + 3, P[2][1]]] as Pt[]; })() }] }} className="w-full max-w-64" /> : <p className="p-6 text-center text-sm">∠A + ∠B sudah {A + B}°. Tidak ada segitiga dengan dua sudut sebesar ini.</p>}</div>
    <Result value={ok ? String(C) : "tidak"}>{ok ? <>∠C = 180° − {A}° − {B}° = <strong>{C}°</strong>. Garis ungu melalui C sejajar AB: sudut di kiri dan kanannya sama dengan ∠A dan ∠B (dalam berseberangan), sehingga ketiga sudut membentuk garis lurus 180°.</> : <>Jumlah dua sudut harus kurang dari 180°.</>}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
const ks = [0.5, 1, 1.5, 2, 3];
function ScaleLab() {
  const [k, setK] = useState(2);
  const w = 6 * k, h = 5 * k, kel0 = 6 + 5 + 4.5 + Math.hypot(1.5, 2) + 3, luas0 = 6 * 3 + (6 + 4.5) * 2 / 2;
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Faktor skala" className="flex flex-wrap gap-1.5">{ks.map(x => <button key={x} type="button" role="radio" aria-checked={k === x} onClick={() => setK(x)} className={`btn btn-sm ${k === x ? "btn-success" : "btn-outline"}`}>k = {idn(x)}</button>)}</div>
    <div className="flex flex-wrap items-end justify-center gap-4 overflow-x-auto rounded-xl bg-base-100 p-3"><figure className="flex flex-col items-center"><House k={1} unit={10} /><figcaption className="text-xs font-bold">Awal</figcaption></figure><figure className="flex flex-col items-center"><House k={k} unit={10} /><figcaption className="text-xs font-bold">Hasil</figcaption></figure></div>
    <table className="w-full border-collapse bg-base-100 text-sm"><thead><tr className="bg-success text-success-content"><th className="p-1 text-left">Ukuran</th><th className="p-1">Awal</th><th className="p-1">Hasil</th><th className="p-1">Dikali</th></tr></thead>
      <tbody>{[["Lebar", 6, w, k], ["Tinggi", 5, h, k], ["Keliling", kel0, kel0 * k, k], ["Luas", luas0, luas0 * k * k, k * k]].map(([n, a, b, m]) => <tr key={n as string} className="border-t border-base-300 text-center"><td className="p-1 text-left font-bold">{n}</td><td>{idn(a as number)}</td><td>{idn(b as number)}</td><td className="font-bold">× {idn(m as number)}</td></tr>)}
        <tr className="border-t border-base-300 text-center"><td className="p-1 text-left font-bold">Sudut</td><td colSpan={2}>tetap</td><td className="font-bold">× 1</td></tr></tbody></table>
    <Result value={`${idn(k)}|${idn(k * k)}`}>Faktor skala {idn(k)}: setiap sisi dan keliling dikali {idn(k)}, luas dikali {idn(k)}² = <strong>{idn(k * k)}</strong>, sudut tidak berubah. {k < 1 ? "Faktor kurang dari 1 berarti diperkecil." : k === 1 ? "Ukurannya sama." : "Gambar diperbesar."}</Result>
  </div>;
}
function ResizeLab() {
  const [w, setW] = useState(8);
  const [h, setH] = useState(6);
  const same = Math.abs(w * 12 - h * 16) < 1e-9;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Lebar" value={w} set={setW} min={4} max={24} unit=" cm" /><Stepper label="Tinggi" value={h} set={setH} min={3} max={18} unit=" cm" /></div>
    <div className="flex flex-wrap items-end justify-center gap-4 rounded-xl bg-base-100 p-3"><Picture w={16} h={12} scale={5} label="Asli" /><Picture w={w} h={h} scale={5} label="Hasil" /></div>
    <Result value={same ? "ya" : "tidak"}>Lebar : lebar = {w} : 16 = {idn(w / 16)}, tinggi : tinggi = {h} : 12 = {idn(h / 12)}. {same ? <><strong>Sebangun</strong>: kedua perbandingan sama dan sudutnya tetap 90°.</> : <><strong>Tidak sebangun</strong>: perbandingannya berbeda sehingga gambarnya berubah bentuk.</>}</Result>
  </div>;
}
const ellPts: Pt[] = [[0, 0], [3, 0], [3, 1], [1, 1], [1, 4], [0, 4]];
function TransformLab() {
  const [st, setSt] = useState({ rot: 0, flip: false, sx: 1, sy: 1 });
  const pts = ellPts.map(([x, y]): Pt => { let X = x * st.sx * (st.flip ? -1 : 1), Y = y * st.sy; const c = Math.cos(st.rot), s = Math.sin(st.rot); [X, Y] = [X * c - Y * s, X * s + Y * c]; return [X, Y]; });
  const sim = Math.abs(st.sx - st.sy) < 1e-9;
  const act = [
    { k: "Putar 90°", Icon: RotateCw, f: () => setSt(x => ({ ...x, rot: x.rot + Math.PI / 2 })) },
    { k: "Cerminkan", Icon: FlipHorizontal2, f: () => setSt(x => ({ ...x, flip: !x.flip })) },
    { k: "Perbesar 1,5 kali", Icon: ZoomIn, f: () => setSt(x => ({ ...x, sx: x.sx * 1.5, sy: x.sy * 1.5 })) },
    { k: "Rentang mendatar", Icon: MoveHorizontal, f: () => setSt(x => ({ ...x, sx: x.sx * 1.5 })) },
    { k: "Ulangi", Icon: RotateCcw, f: () => setSt({ rot: 0, flip: false, sx: 1, sy: 1 }) },
  ];
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-1.5">{act.map(({ k, Icon, f }) => <button key={k} type="button" onClick={f} className="btn btn-sm btn-outline gap-1"><Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />{k}</button>)}</div>
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl bg-base-100 p-3"><FigView fig={{ pts: ellPts }} className="w-24" label="Bangun awal" /><FigView fig={{ pts }} className="w-36" fill={sim ? "#d3f9d8" : "#ffe3e3"} stroke={sim ? "#2b8a3e" : "#c92a2a"} label="Bangun hasil" /></div>
    <Result value={sim ? "ya" : "tidak"}>{sim ? <><strong>Sebangun</strong> dengan bangun awal. Putar, cermin, dan perbesar tidak mengubah bentuk.</> : <><strong>Tidak sebangun</strong>: arah mendatar dikali {idn(st.sx)}, arah tegak dikali {idn(st.sy)}.</>}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
const t1 = triFromSides(6, 7, 5), t2 = triFromSides(9, 10.5, 7.5).map(([x, y]): Pt => [x + 0, y]);
function MatchLab() {
  const [sel, setSel] = useState<{ v?: number; s?: number }>({ v: 0 });
  const V = ["A", "B", "C"], W = ["D", "E", "F"], sides = ["AB", "BC", "CA"], sides2 = ["DE", "EF", "FD"], len1 = [6, 7, 5], len2 = [9, 10.5, 7.5];
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-1.5">{V.map((v, i) => <button key={v} type="button" aria-pressed={sel.v === i} onClick={() => setSel({ v: i })} className={`btn btn-sm ${sel.v === i ? "btn-success" : "btn-outline"}`}>∠{v}</button>)}
      {sides.map((s, i) => <button key={s} type="button" aria-pressed={sel.s === i} onClick={() => setSel({ s: i })} className={`btn btn-sm ${sel.s === i ? "btn-success" : "btn-outline"}`}>{s}</button>)}</div>
    <div className="grid grid-cols-2 items-end gap-2 rounded-xl bg-base-100 p-2">
      <FigView fig={{ pts: t1, labels: V, sides: len1.map(String) }} highlight={{ vertex: sel.v, side: sel.s }} className="w-full" />
      <FigView fig={{ pts: t2, labels: W, sides: len2.map(x => idn(x)) }} highlight={{ vertex: sel.v, side: sel.s }} className="w-full" />
    </div>
    <Result value={sel.v !== undefined ? W[sel.v] : sides2[sel.s!]}>△ABC ~ △DEF. {sel.v !== undefined ? <>∠{V[sel.v]} bersesuaian dengan <strong>∠{W[sel.v]}</strong> dan besarnya sama.</> : <>{sides[sel.s!]} bersesuaian dengan <strong>{sides2[sel.s!]}</strong>: {idn(len2[sel.s!])} : {len1[sel.s!]} = 1,5. Semua pasangan sisi mempunyai perbandingan 1,5.</>}</Result>
  </div>;
}
function AnglesLab() {
  const [A, setA] = useState(70);
  const [B, setB] = useState(60);
  const C = 180 - A - B, ref = [50, 60, 70], ok = C > 0 && [A, B, C].sort((a, b) => a - b).join() === ref.join();
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Sudut pertama" value={A} set={setA} min={10} max={150} step={5} unit="°" /><Stepper label="Sudut kedua" value={B} set={setB} min={10} max={150} step={5} unit="°" /></div>
    <div className="grid grid-cols-2 items-end gap-2 rounded-xl bg-base-100 p-2">
      <FigView fig={{ pts: triFromAngles(50, 60), labels: ["P", "Q", "R"], angles: ["50°", "60°", "70°"] }} className="w-full" />
      {C > 0 ? <FigView fig={{ pts: triFromAngles(A, B, 8), labels: ["K", "L", "M"], angles: [`${A}°`, `${B}°`, `${C}°`] }} className="w-full" fill={ok ? "#d3f9d8" : "#fff4e6"} /> : <p className="text-sm">Jumlah dua sudut harus kurang dari 180°.</p>}
    </div>
    <Result value={ok ? "ya" : "tidak"}>Segitiga pertama 50°, 60°, 70°. Segitiga kedua {A}°, {B}°, {C > 0 ? `${C}°` : "…"}. {ok ? <><strong>Sebangun</strong>: ketiga sudutnya sama, walaupun ukuran dan posisinya berbeda.</> : <><strong>Tidak sebangun</strong>: ada sudut yang berbeda.</>}</Result>
  </div>;
}
function ParallelLab() {
  const [ad, setAd] = useState(8);
  const AB = 12, BC = 15, AC = 9, P = triFromSides(AB, BC, AC), k = ad / AB, D: Pt = [P[0][0] + (P[1][0] - P[0][0]) * k, P[0][1] + (P[1][1] - P[0][1]) * k], E: Pt = [P[0][0] + (P[2][0] - P[0][0]) * k, P[0][1] + (P[2][1] - P[0][1]) * k];
  const fig: Fig = { pts: P, labels: ["A", "B", "C"], sides: ["12", "15", "9"], extra: [{ pts: [D, E], labels: ["D", "E"] }] };
  return <div className="space-y-3">
    <Stepper label="AD" value={ad} set={setAd} min={1} max={11} unit=" cm" />
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><FigView fig={fig} className="w-full max-w-72" /></div>
    <Result value={idn((BC * ad) / AB)}>DE ∥ BC, jadi △ADE ~ △ABC dengan perbandingan AD/AB = {ad}/12. DE = <MathText text={`{${ad}/12}`} /> × 15 = <strong>{idn((BC * ad) / AB)} cm</strong> dan AE = <MathText text={`{${ad}/12}`} /> × 9 = {idn((AC * ad) / AB)} cm.</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { pair: PairLab, trans: TransLab, triangle: TriangleLab, scale: ScaleLab, resize: ResizeLab, transform: TransformLab, match: MatchLab, angles: AnglesLab, parallel: ParallelLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "fig": return <FigView fig={scene.fig} className="w-full max-w-72" />;
    case "figs": return <div className="grid w-full grid-cols-2 items-end gap-3">{scene.items.map(it => <figure key={it.label} className="flex flex-col items-center"><FigView fig={it.fig} className="w-full max-w-56" /><figcaption className="text-sm font-bold">{it.label}</figcaption></figure>)}</div>;
    case "pairs": return <div className="grid w-full grid-cols-2 gap-3">{scene.items.map(it => <figure key={it.label} className="rounded-xl bg-base-100 p-2"><div className="flex items-center justify-center gap-2"><FigView fig={it.a} className="w-20" label={`Pasangan ${it.label} bangun pertama`} /><FigView fig={it.b} className="w-20" label={`Pasangan ${it.label} bangun kedua`} /></div><figcaption className="text-center text-sm font-bold">Pasangan {it.label}</figcaption></figure>)}</div>;
    case "trans": return <Transversal t={scene.t} labels={scene.labels} />;
    case "pictures": return <div className="flex flex-wrap justify-center gap-3">{scene.items.map(p => <Picture key={p.label} w={p.w} h={p.h} scale={6} label={p.label} />)}</div>;
    case "fractal": return <div className="flex flex-wrap items-end justify-center gap-3">{scene.n.map(k => <figure key={k} className="flex flex-col items-center"><Fractal n={k} size={72} /><figcaption className="text-xs font-bold">n = {k}</figcaption></figure>)}</div>;
    case "text": return <ul className="w-full max-w-lg list-disc space-y-1 rounded-lg bg-base-100 py-2 pe-3 ps-7 text-sm">{scene.lines.map(l => <li key={l}><MathText text={l} /></li>)}</ul>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <label className="flex flex-wrap items-center gap-2 font-bold"><span><MathText text={p.label} /></span><NumBox label={p.label} value={value} set={set} disabled={checked} />{p.unit}</label>;
    case "pickAngle": { const sel = value ? value.split(",").map(Number) : [];
      return <div className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
        <div className="rounded-xl bg-base-100 p-2"><Transversal t={p.t} labels={greek.map((g, k) => (k === p.given ? `${g} = ${transValue(p.t, k)}°` : g))} picked={sel} colors={{ [p.given]: "#f5b014" }}
          onPick={checked ? undefined : k => { if (k === p.given) return; set((sel.includes(k) ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(",")); }} label="Ketuk sudut pada gambar" /></div>
        <p className="text-xs text-base-content/60">Ketuk huruf sudut pada gambar. Ketuk lagi untuk membatalkan. Dipilih {sel.length}.</p></div>; }
    case "select": { const sel = value ? value.split(",").map(Number) : [];
      return <div className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
        <div role="group" aria-label={p.label} className={p.pictures ? "grid grid-cols-2 gap-2 sm:grid-cols-4" : "flex flex-wrap gap-1.5"}>{p.options.map((o, k) => { const s = sel.includes(k);
          return <button key={o} type="button" aria-pressed={s} aria-label={o} disabled={checked} onClick={() => set((s ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))}
            className={p.pictures ? `flex flex-col items-center rounded-xl border-4 p-1 ${s ? "border-success bg-success/10" : "border-transparent bg-base-100 ring-1 ring-base-300"}` : `btn btn-sm ${s ? on : "btn-outline"}`}>
            {p.pictures ? <Picture w={p.pictures[k].w} h={p.pictures[k].h} scale={4.5} label={o} /> : o}</button>; })}</div>
        <p className="text-xs text-base-content/60">Ketuk semua yang benar. Ketuk lagi untuk membatalkan. Dipilih {sel.length}.</p></div>; }
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="group" aria-label={r.text} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center">
      <span className="text-sm font-bold sm:w-52">{r.text}</span>
      <div className="flex flex-wrap gap-1">{p.options.map(o => <button key={o} type="button" disabled={checked} aria-pressed={x[k] === o} onClick={() => put(k, o)} className={`btn btn-sm h-auto min-h-8 py-1 ${x[k] === o ? on : "btn-outline"}`}>{o}</button>)}</div></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><MathText text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: SQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeSevenSimilarity() {
  const [topic, setTopic] = useState(0);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], s = t.sections[sec], Lab = labs[s.lab];
  const go = (ti: number, si = 0) => { setTopic(ti); setSec(si); setMode("learn"); };
  const last = topic === topics.length - 1 && sec === t.sections.length - 1;
  const next = () => (sec < t.sections.length - 1 ? go(topic, sec + 1) : go(topic + 1, 0));
  const prev = () => (sec > 0 ? go(topic, sec - 1) : go(topic - 1, topics[topic - 1].sections.length - 1));
  const totalSections = topics.reduce((a, x) => a + x.sections.length, 0);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 7, Bab 5</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Kesebangunan</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Temukan sudut yang sama besar tanpa mengukur, pahami arti sebangun lewat perbesaran dan perkecilan, lalu gunakan segitiga sebangun untuk menghitung panjang yang tidak dapat diukur langsung.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-2"><Fractal n={0} size={36} /><Fractal n={1} size={52} /><Fractal n={2} size={70} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Maket, peta, dan pas foto</h2>
        <p className="mt-2 text-sm">Maket rumah adat Bolon, peta Indonesia, dan pas foto 2 × 3 sampai 4 × 6 berbeda ukuran, tetapi bentuknya sama dengan aslinya. Semuanya sebangun.</p>
        <p className="mt-2 text-sm text-base-content/60">{totalSections} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-sebangun">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-sebangun" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.2fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><MathText text={x} /></li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-sm leading-6"><MathText text={s.example} /></p>}
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{s.demo}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0 && sec === 0} onClick={prev}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan {t.code}</button>
            {!last ? <button type="button" className="btn btn-outline gap-1" onClick={next}>{sec < t.sections.length - 1 ? "Bagian berikutnya" : "Materi berikutnya"}<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<SQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 5"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <MathText text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt + q.answer} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
