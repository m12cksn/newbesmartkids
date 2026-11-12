"use client";

import { ArrowLeft, ArrowRight, Check, Minus, PenLine, Plus, RotateCcw, Scissors } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { GridFig } from "./GradeFiveAreaArt";
import {
  areaOf, assessment, cells, composeScene, correct, formatAnswer, pieceColors, pieceDims, practice, ready, SEP, shapeName, shapeScene, splitParts, topics,
  type AQuestion, type Part, type Scene, type Shape,
} from "@/data/grade-five-area";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, w = "w-14" }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function Stepper({ label, value, set, min, max, step = 1 }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value <= min} onClick={() => set(value - step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="w-8 text-center text-lg font-extrabold">{value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value >= max} onClick={() => set(value + step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
const Eq = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap items-center gap-1.5 text-lg font-bold">{children}</div>;
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
const on = "btn-success disabled:bg-success! disabled:text-success-content!";

/* ====================================================================== */
/* Lab A: memasang ubin                                                    */
/* ====================================================================== */
function TileLab() {
  const [p, setP] = useState(4), [l, setL] = useState(3), [m, setM] = useState<string[]>([]);
  const inside = (k: string) => { const [x, y] = k.split(",").map(Number); return x >= 1 && x <= p && y >= 1 && y <= l; };
  const tiles = m.filter(inside), full = tiles.length === p * l;
  const scene: Scene = { type: "grid", w: p + 2, h: l + 2, polys: [{ pts: [[1, 1], [p + 1, 1], [p + 1, l + 1], [1, l + 1]], fill: "#ffffff00" }], mark: true };
  const nextRow = () => { for (let y = 1; y <= l; y++) { const row = Array.from({ length: p }, (_, x) => `${x + 1},${y}`); if (row.some(k => !m.includes(k))) { setM([...new Set([...m, ...row])]); return; } } };
  const reset = (f: (x: number) => void) => (x: number) => { f(x); setM([]); };
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Panjang (m)" value={p} set={reset(setP)} min={2} max={8} /><Stepper label="Lebar (m)" value={l} set={reset(setL)} min={2} max={6} /></div>
    <div className="rounded-xl bg-base-100 p-2"><GridFig s={scene} marked={m} onTap={k => inside(k) && setM(x => (x.includes(k) ? x.filter(y => y !== k) : [...x, k]))} /></div>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-success" disabled={full} onClick={nextRow}>Pasang ubin sebaris</button><button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!m.length} onClick={() => setM([])}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
    <Result value={String(tiles.length)}>Terpasang {tiles.length} ubin 1 m × 1 m.{full ? <> Lantai tertutup rapat. Luas lantai = {p} × {l} = <strong>{p * l} m²</strong>.</> : ` Masih kurang ${p * l - tiles.length} ubin.`}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab B: rumus luas                                                       */
/* ====================================================================== */
const shapes: Shape[] = ["rect", "square", "tri", "para", "trap", "kite"];
const labels: Record<Shape, string[]> = { rect: ["Panjang", "Lebar"], square: ["Sisi"], tri: ["Alas", "Tinggi"], para: ["Alas", "Tinggi"], trap: ["Sisi atas", "Sisi alas", "Tinggi"], kite: ["Diagonal 1", "Diagonal 2"] };
const start: Record<Shape, number[]> = { rect: [6, 4], square: [5], tri: [8, 4], para: [6, 4], trap: [4, 8, 4], kite: [6, 8] };
function FormulaLab() {
  const [s, setS] = useState<Shape>("tri"), [v, setV] = useState(start.tri), [cut, setCut] = useState(false);
  const area = areaOf(s, v);
  const pick = (x: Shape) => { setS(x); setV(start[x]); setCut(false); };
  const rect: [number, number] | null = s === "tri" ? [v[0], v[1] / 2] : s === "para" ? [v[0], v[1]] : s === "trap" ? [v[0] + v[1], v[2] / 2] : s === "kite" ? [v[0], v[1] / 2] : null;
  const text: Record<Shape, string> = {
    rect: `Luas = panjang × lebar = ${v[0]} × ${v[1]} = ${area} cm²`, square: `Luas = sisi × sisi = ${v[0]} × ${v[0]} = ${area} cm²`,
    tri: `Luas = ½ × alas × tinggi = ½ × ${v[0]} × ${v[1]} = ${area} cm²`, para: `Luas = alas × tinggi = ${v[0]} × ${v[1]} = ${area} cm²`,
    trap: `Luas = ½ × (${v[0]} + ${v[1]}) × ${v[2]} = ${area} cm²`, kite: `Luas = ½ × ${v[0]} × ${v[1]} = ${area} cm²`,
  };
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Bangun datar" className="flex flex-wrap gap-1.5">{shapes.map(x => <button key={x} type="button" role="radio" aria-checked={s === x} onClick={() => pick(x)} className={`btn btn-xs h-auto min-h-7 ${s === x ? "btn-success" : "btn-outline"}`}>{x === "kite" ? "Belah ketupat" : shapeName[x][0].toUpperCase() + shapeName[x].slice(1)}</button>)}</div>
    <div className="flex flex-wrap gap-3">{labels[s].map((lb, i) => <Stepper key={lb} label={lb} value={v[i]} set={x => { setV(v.map((y, j) => (j === i ? x : y))); setCut(false); }} min={2} max={12} step={s === "tri" || s === "trap" || s === "kite" ? (i === labels[s].length - 1 ? 2 : 1) : 1} />)}</div>
    <div className="grid gap-2 rounded-xl bg-base-100 p-2 sm:grid-cols-2"><GridFig s={shapeScene(s, v)} className="w-full max-w-60" />
      {cut && rect && <div className="text-center text-xs"><GridFig s={{ type: "grid", w: rect[0], h: rect[1], plain: true, polys: [{ pts: [[0, 0], [rect[0], 0], [rect[0], rect[1]], [0, rect[1]]], fill: "#fde2c8" }], texts: [{ at: [rect[0] / 2, rect[1] + 0.9], text: `${rect[0]} cm` }, { at: [rect[0] + 0.7, rect[1] / 2], text: `${rect[1]} cm` }] }} className="w-full max-w-60" />Persegi panjang {rect[0]} cm × {rect[1]} cm</div>}</div>
    {rect && <button type="button" aria-pressed={cut} className={`btn btn-sm gap-1 ${cut ? "btn-success" : "btn-outline"}`} onClick={() => setCut(!cut)}><Scissors className="size-4" aria-hidden="true" />Potong dan pindahkan</button>}
    <Result value={String(area)}>{text[s]}.{cut && rect && <> Setelah dipotong dan dipindah, bangun menjadi persegi panjang {rect[0]} × {rect[1]} = {rect[0] * rect[1]} cm². Luasnya tetap.</>}</Result>
  </div>;
}

/* ====================================================================== */
/* Bangun gabungan dengan garis bantu                                      */
/* ====================================================================== */
type ComposePart = Extract<Part, { kind: "compose" }>;
function ComposeView({ p, version, setVersion, disabled, children }: { p: ComposePart; version: number | null; setVersion: (v: number | null) => void; disabled?: boolean; children?: (k: number) => ReactNode }) {
  const ver = version === null ? null : p.versions[version];
  return <div className="w-full space-y-3">
    <div className="rounded-xl bg-base-100 p-2"><GridFig s={composeScene(p, version)} className="w-full max-w-80" /></div>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" aria-pressed={version !== null} disabled={disabled} className={`btn btn-sm gap-1 ${version !== null ? on : "btn-outline"}`} onClick={() => setVersion(version === null ? 0 : null)}><PenLine className="size-4" aria-hidden="true" />{version === null ? "Tampilkan garis bantu" : "Sembunyikan garis bantu"}</button>
      {version !== null && <span role="radiogroup" aria-label="Versi garis bantu" className="join">{p.versions.map((v, k) => <button key={v.name} type="button" role="radio" aria-checked={version === k} disabled={disabled} onClick={() => setVersion(k)} className={`btn join-item btn-sm ${version === k ? on : "btn-outline"}`}>{v.name}</button>)}</span>}
    </div>
    {ver ? <ul className="space-y-2">{ver.pieces.map((pc, k) => <li key={pc.label} className="rounded-lg border border-base-300 p-2 text-sm"><span className="flex items-start gap-2"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded font-extrabold" style={{ background: pieceColors[k % pieceColors.length] }}>{pc.label}</span><span>Bangun {pc.label}: {pieceDims(pc)}</span></span>{children?.(k)}</li>)}</ul>
      : <p className="text-sm text-base-content/60">Ketuk Tampilkan garis bantu untuk membagi bangun gabungan menjadi beberapa bangun yang sudah kamu kenal.</p>}
  </div>;
}
const composeLabs: ComposePart[] = [
  { kind: "compose", unit: "cm²", outline: [[0, 3], [4, 0], [8, 3], [8, 5], [11, 5], [11, 8], [0, 8]], texts: [{ at: [5.5, 9], text: "11 cm" }, { at: [-0.4, 5.5], text: "5 cm", anchor: "end" }, { at: [11.4, 6.5], text: "3 cm" }, { at: [9.5, 4.1], text: "3 cm" }],
    versions: [
      { name: "Garis bantu 1", pieces: [{ label: "A", shape: "tri", vals: [8, 3], pts: [[0, 3], [4, 0], [8, 3]] }, { label: "B", shape: "rect", vals: [8, 5], pts: [[0, 3], [8, 3], [8, 8], [0, 8]] }, { label: "C", shape: "rect", vals: [3, 3], pts: [[8, 5], [11, 5], [11, 8], [8, 8]] }] },
      { name: "Garis bantu 2", pieces: [{ label: "A", shape: "tri", vals: [8, 3], pts: [[0, 3], [4, 0], [8, 3]] }, { label: "B", shape: "rect", vals: [8, 2], pts: [[0, 3], [8, 3], [8, 5], [0, 5]] }, { label: "C", shape: "rect", vals: [11, 3], pts: [[0, 5], [11, 5], [11, 8], [0, 8]] }] },
    ] },
  { kind: "compose", unit: "cm²", outline: [[5, 0], [8, 4], [8, 12], [10, 15], [0, 15], [2, 12], [2, 4]], texts: [{ at: [5, 16], text: "10 cm" }, { at: [8.4, 8], text: "8 cm", anchor: "start" }, { at: [10.4, 13.5], text: "3 cm" }],
    versions: [
      { name: "Garis bantu 1", pieces: [{ label: "A", shape: "tri", vals: [6, 4], pts: [[2, 4], [5, 0], [8, 4]] }, { label: "B", shape: "rect", vals: [6, 8], pts: [[2, 4], [8, 4], [8, 12], [2, 12]] }, { label: "C", shape: "trap", vals: [6, 10, 3], pts: [[2, 12], [8, 12], [10, 15], [0, 15]] }] },
      { name: "Garis bantu 2", pieces: [{ label: "A", shape: "tri", vals: [6, 4], pts: [[2, 4], [5, 0], [8, 4]] }, { label: "B", shape: "rect", vals: [6, 11], pts: [[2, 4], [8, 4], [8, 15], [2, 15]] }, { label: "C", shape: "tri", vals: [2, 3], pts: [[0, 15], [2, 12], [2, 15]] }, { label: "D", shape: "tri", vals: [2, 3], pts: [[8, 12], [10, 15], [8, 15]] }] },
    ] },
];
function ComposeLab() {
  const [f, setF] = useState(0), [version, setVersion] = useState<number | null>(null), [shown, setShown] = useState<number[]>([]);
  const p = composeLabs[f], ver = version === null ? null : p.versions[version];
  const areas = ver ? ver.pieces.map(pc => areaOf(pc.shape, pc.vals)) : [], all = ver !== null && shown.length === areas.length, sum = shown.reduce((a, k) => a + areas[k], 0);
  const formula = (k: number) => { const pc = ver!.pieces[k], v = pc.vals; return pc.shape === "rect" ? `${v[0]} × ${v[1]}` : pc.shape === "trap" ? `½ × (${v[0]} + ${v[1]}) × ${v[2]}` : pc.shape === "para" ? `${v[0]} × ${v[1]}` : `½ × ${v[0]} × ${v[1]}`; };
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Bangun gabungan" className="flex flex-wrap gap-1.5">{["Rumah dengan teras", "Roket"].map((n, k) => <button key={n} type="button" role="radio" aria-checked={f === k} onClick={() => { setF(k); setVersion(null); setShown([]); }} className={`btn btn-xs ${f === k ? "btn-success" : "btn-outline"}`}>{n}</button>)}</div>
    <ComposeView p={p} version={version} setVersion={v => { setVersion(v); setShown([]); }}>
      {k => shown.includes(k) ? <p className="mt-1 ps-8 font-bold">Luas {ver!.pieces[k].label} = {formula(k)} = {areas[k]} cm²</p> : <button type="button" className="btn btn-xs btn-outline mt-1 ms-8" onClick={() => setShown([...shown, k])}>Hitung luas {ver!.pieces[k].label}</button>}
    </ComposeView>
    <Result value={all ? String(sum) : ""}>{ver === null ? "Bangun gabungan belum dibagi." : all ? <>Luas gabungan = {areas.join(" + ")} = <strong>{sum} cm²</strong>. Coba versi garis bantu yang lain: hasilnya tetap sama.</> : `Hitung luas setiap bangun dulu. Sudah ${shown.length} dari ${areas.length}.`}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab D: kerangka kawat                                                   */
/* ====================================================================== */
function WireLab() {
  const [K, setK] = useState(24), [p, setP] = useState(8), [rows, setRows] = useState<[number, number][]>([]);
  const half = K / 2, P = Math.min(Math.max(p, Math.ceil(half / 2)), half - 1), l = half - P;
  const scene: Scene = { type: "grid", w: half, h: Math.ceil(half / 2), polys: [{ pts: [[0, 0], [P, 0], [P, l], [0, l]] }] };
  const best = rows.length ? Math.max(...rows.map(([a, b]) => a * b)) : 0;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Panjang kawat" value={K} set={x => { setK(x); setRows([]); }} min={12} max={40} step={4} /><Stepper label="Panjang" value={P} set={setP} min={Math.ceil(half / 2)} max={half - 1} /></div>
    <div className="rounded-xl bg-base-100 p-2"><GridFig s={scene} className="w-full max-w-md" /></div>
    <button type="button" className="btn btn-sm btn-success gap-1" disabled={rows.some(([a]) => a === P)} onClick={() => setRows([...rows, [P, l] as [number, number]].sort((a, b) => b[0] - a[0]))}><Check className="size-4" aria-hidden="true" />Catat ukuran</button>
    {rows.length > 0 && <table className="w-full text-center text-sm"><thead><tr className="bg-sky-700 text-white"><th className="p-1">Panjang</th><th>Lebar</th><th>Keliling</th><th>Luas</th></tr></thead>
      <tbody>{rows.map(([a, b]) => <tr key={a} className={a * b === best ? "bg-success/15 font-bold" : "border-b border-base-300"}><td className="p-1">{a}</td><td>{b}</td><td>{K}</td><td>{a * b}</td></tr>)}</tbody></table>}
    <Result value={String(P * l)}>Panjang + lebar = {K} : 2 = {half}, jadi lebar = {l} cm. Keliling = 2 × ({P} + {l}) = {K} cm. Luas = {P} × {l} = <strong>{P * l} cm²</strong>.{P === l && " Ini persegi, luasnya paling besar untuk keliling ini."}</Result>
  </div>;
}
const labs = [TileLab, FormulaLab, ComposeLab, WireLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const b = (k: number, label: string, w?: string) => <Box label={label} value={x[k]} onChange={v => put(k, v)} disabled={checked} w={w} />;
  switch (p.kind) {
    case "number": return <Eq>{p.label} {b(0, p.label, "w-20")} {p.unit}</Eq>;
    case "formula": {
      const k = x.length - 1, res = <>= {b(k, "Luas", "w-20")} {p.unit}</>;
      if (p.shape === "trap") return <Eq>Luas = ½ × ( {b(0, "Sisi pertama", "w-12")} + {b(1, "Sisi kedua", "w-12")} ) × {b(2, "Tinggi", "w-12")} {res}</Eq>;
      if (p.shape === "tri" || p.shape === "kite") return <Eq>Luas = ½ × {b(0, "Bilangan pertama", "w-12")} × {b(1, "Bilangan kedua", "w-12")} {res}</Eq>;
      return <Eq>Luas = {b(0, "Bilangan pertama", "w-12")} × {b(1, "Bilangan kedua", "w-12")} {res}</Eq>;
    }
    case "items": return <div className="space-y-2">{p.items.map((it, k) => <Eq key={it.label}><span className="text-base">{it.label} =</span>{b(k, it.label, "w-20")} {p.unit}</Eq>)}</div>;
    case "compose": {
      const vi = x[0] === "" ? null : Number(x[0]), ver = vi === null ? null : p.versions[vi];
      return <div className="w-full space-y-3"><ComposeView p={p} version={vi} disabled={checked} setVersion={v => set(v === null ? "" : [String(v), ...x.slice(1).map(() => "")].join("|"))}>
        {k => <div className="mt-1"><Eq><span className="text-base">Luas {ver!.pieces[k].label} =</span>{b(1 + k, `Luas ${ver!.pieces[k].label}`, "w-20")} {p.unit}</Eq></div>}
      </ComposeView>
        {ver && <Eq><span className="text-base">Luas gabungan = {ver.pieces.map(pc => pc.label).join(" + ")} =</span>{b(x.length - 1, "Luas gabungan", "w-20")} {p.unit}</Eq>}</div>;
    }
    case "pairs": return <div className="overflow-x-auto"><table className="w-full border-collapse text-center text-sm"><thead><tr className="bg-sky-700 text-white"><th className="p-1.5">Bentuk</th><th>Panjang (cm)</th><th>Lebar (cm)</th><th>Keliling (cm)</th><th>Luas (cm²)</th></tr></thead>
      <tbody><tr className="bg-orange-50"><td className="p-1.5">1</td><td>{p.example[0]}</td><td>{p.example[1]}</td><td>{p.K}</td><td>{p.example[0] * p.example[1]}</td></tr>
        {Array.from({ length: p.rows }, (_, r) => <tr key={r} className="border-b border-base-300"><td className="p-1.5">{r + 2}</td>{["Panjang", "Lebar", "Keliling", "Luas"].map((c, j) => <td key={c} className="p-1">{b(4 * r + j, `Bentuk ${r + 2} ${c}`, "w-14")}</td>)}</tr>)}</tbody></table>
      <p className="mt-1 text-xs text-base-content/60">Setiap bentuk harus berbeda dari contoh dan dari bentuk lainnya.</p></div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span>{s.text}</span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: AQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeFiveArea() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 5, Bab 5</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Luas Daerah Bangun Datar</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Ukur luas dengan persegi satuan, temukan rumus luas segi empat dan segitiga, hitung luas bangun gabungan, lalu bandingkan keliling dan luas.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-40"><GridFig s={{ type: "grid", w: 6, h: 4, polys: [{ pts: [[1, 1], [5, 1], [5, 3], [1, 3]] }] }} className="w-full" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Memasang ubin di lantai rumah</h2>
        <p className="mt-2 text-sm text-base-content/60">4 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-luas">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-luas" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-4 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={topic} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{t.steps.map(x => <li key={x}>{x}</li>)}</ol>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{t.demo}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0} onClick={() => go(topic - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan materi</button>
            {topic < topics.length - 1 ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(topic + 1)}>Materi berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<AQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 5"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><GridFig key={q.prompt} s={q.scene} className={q.scene.plain ? "w-full max-w-80" : "w-full max-w-md"} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
