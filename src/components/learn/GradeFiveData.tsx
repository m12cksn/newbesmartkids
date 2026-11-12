"use client";

import { ArrowLeft, ArrowRight, Check, Minus, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { BarChart, PicSymbol, PictoChart, SymbolRow, Tally } from "./GradeFiveDataArt";
import {
  assessment, cells, correct, formatAnswer, practice, ready, SEP, splitParts, topics,
  type Bars, type DQuestion, type Part, type Picto, type Scene,
} from "@/data/grade-five-data";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, wide = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; wide?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, wide ? 8 : 4))}
    className={`h-10 ${wide ? "w-32" : "w-16"} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
function Step({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return <button type="button" aria-label={label} className="btn btn-xs h-8 min-w-8 btn-outline px-1.5" disabled={disabled} onClick={onClick}>{children}</button>;
}
const quarterText = (n: number) => { const w = Math.floor(n / 4), r = n % 4; return `${w}${r ? ` ${["", "¼", "½", "¾"][r]}` : ""}`; };
const num = (s: string) => (/^\d+$/.test(s) ? Number(s) : 0);

/* ====================================================================== */
/* Lab A: menghitung data dengan turus                                     */
/* ====================================================================== */
const labScores = [80, 60, 70, 90, 70, 80, 100, 70, 60, 80, 70, 90, 80, 70, 60, 80, 70, 90, 80, 70];
const labCats = [60, 70, 80, 90, 100];
function TallyLab() {
  const [done, setDone] = useState<number[]>([]);
  const counted = (c: number) => done.filter(i => labScores[i] === c).length;
  const total = labScores.length;
  return <div className="space-y-3">
    <p className="text-sm font-bold">Nilai ulangan 20 siswa</p>
    <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Data nilai">{labScores.map((s, i) => { const d = done.includes(i);
      return <button key={i} type="button" aria-label={`Nilai ${s}, data ke-${i + 1}`} aria-pressed={d} disabled={d} onClick={() => setDone(x => [...x, i])}
        className={`rounded-lg border-2 py-1.5 text-sm font-extrabold ${d ? "border-base-300 bg-base-200 text-base-content/35 line-through" : "border-info/50 bg-base-100 hover:border-success"}`}>{s}</button>; })}</div>
    <div className="flex gap-2">
      <button type="button" className="btn btn-xs btn-outline gap-1" disabled={!done.length} onClick={() => setDone(x => x.slice(0, -1))}><Undo2 className="size-3.5" aria-hidden="true" />Batal satu</button>
      <button type="button" className="btn btn-xs btn-outline gap-1" disabled={!done.length} onClick={() => setDone([])}><RotateCcw className="size-3.5" aria-hidden="true" />Ulangi</button>
    </div>
    <table className="w-full border-collapse bg-base-100 text-sm">
      <thead><tr className="bg-success/15"><th className="border border-base-300 px-2 py-1">Nilai</th><th className="border border-base-300 px-2 py-1">Turus</th><th className="border border-base-300 px-2 py-1">Frekuensi</th></tr></thead>
      <tbody>{labCats.map(c => <tr key={c}><td className="border border-base-300 px-2 py-1 text-center font-bold">{c}</td><td className="border border-base-300 px-2 py-1"><Tally n={counted(c)} /></td><td className="border border-base-300 px-2 py-1 text-center font-extrabold">{counted(c)}</td></tr>)}</tbody>
    </table>
    <Result value={String(done.length)}>{done.length < total ? <>Sudah dihitung <strong>{done.length}</strong> dari {total} data. Data yang sudah dicatat dicoret agar tidak terhitung dua kali.</>
      : <>Semua data tercatat. Jumlah frekuensi {labCats.map(counted).join(" + ")} = <strong>{total}</strong>, sama dengan banyak siswa. Nilai yang paling sering muncul adalah <strong>70</strong>.</>}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab B: membuat piktogram                                                */
/* ====================================================================== */
const labDays = [{ d: "Senin", v: 24 }, { d: "Selasa", v: 30 }, { d: "Rabu", v: 18 }, { d: "Kamis", v: 26 }];
function PictoLab() {
  const [unit, setUnit] = useState(4);
  const [q, setQ] = useState([0, 0, 0, 0]);
  const set = (k: number, n: number) => setQ(x => x.map((y, j) => (j === k ? Math.max(0, Math.min(60, n)) : y)));
  const shown = q.map(n => (n * unit) / 4), ok = shown.filter((s, k) => s === labDays[k].v).length;
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Nilai satu gambar" className="flex flex-wrap items-center gap-1.5 text-sm font-bold">Satu gambar mewakili
      {[4, 8].map(u => <button key={u} type="button" role="radio" aria-checked={unit === u} onClick={() => { setUnit(u); setQ([0, 0, 0, 0]); }} className={`btn btn-xs ${unit === u ? "btn-success" : "btn-outline"}`}>{u} kue</button>)}</div>
    <div className="space-y-1.5">{labDays.map(({ d, v }, k) => <div key={d} className="rounded-lg border border-base-300 bg-base-100 p-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-bold">{d}: {v} kue</span>
        <span className="flex gap-1">
          <Step label={`${d} kurangi seperempat`} disabled={!q[k]} onClick={() => set(k, q[k] - 1)}><Minus className="size-3.5" aria-hidden="true" />¼</Step>
          <Step label={`${d} tambah seperempat`} onClick={() => set(k, q[k] + 1)}><Plus className="size-3.5" aria-hidden="true" />¼</Step>
          <Step label={`${d} tambah satu gambar`} onClick={() => set(k, q[k] + 4)}><Plus className="size-3.5" aria-hidden="true" />1</Step>
        </span></div>
      <div className="mt-1 flex items-center gap-2"><SymbolRow sym="apem" quarters={q[k]} size={22} />
        <span className={`ms-auto shrink-0 text-xs font-bold ${shown[k] === v ? "text-success" : "text-base-content/60"}`}>{shown[k] === v && <Check className="me-0.5 inline size-3.5" aria-hidden="true" />}= {shown[k]} kue</span></div>
    </div>)}</div>
    <p className="flex items-center gap-1 text-xs font-semibold"><PicSymbol sym="apem" size={18} /> = {unit} kue. Seperempat gambar = {unit / 4} kue.</p>
    <Result value={String(ok)}>{ok === 4 ? <>Piktogram sudah tepat. Dengan 1 gambar = {unit} kue, Senin perlu {quarterText((24 * 4) / unit)} gambar dan Kamis {quarterText((26 * 4) / unit)} gambar.</>
      : <>Baris yang sudah tepat: <strong>{ok}</strong> dari 4. Bagi banyak kue dengan {unit} untuk mengetahui banyak gambarnya.</>}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab C: menyusun diagram batang                                          */
/* ====================================================================== */
const labBars: Bars = { title: "Cara Siswa Berangkat ke Sekolah", orient: "v", cats: ["Jalan kaki", "Sepeda", "Angkot", "Diantar"], series: [{ name: "Siswa", color: "#2f86d6", values: [7, 9, 4, 6] }], max: 12, minor: 1, major: 2, valueLabel: "Banyak siswa", catLabel: "Cara berangkat" };
function BarLab() {
  const [v, setV] = useState([0, 0, 0, 0]);
  const [orient, setOrient] = useState<"v" | "h">("v");
  const want = labBars.series[0].values as number[];
  const ok = v.filter((x, k) => x === want[k]).length;
  const best = ok === 4 ? labBars.cats[v.indexOf(Math.max(...v))] : "";
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-bold">Bentuk batang</span>
      <span role="radiogroup" aria-label="Bentuk diagram" className="join">{([["v", "Tegak"], ["h", "Mendatar"]] as const).map(([k, n]) => <button key={k} type="button" role="radio" aria-checked={orient === k} onClick={() => setOrient(k)} className={`btn join-item btn-xs ${orient === k ? "btn-success" : "btn-outline"}`}>{n}</button>)}</span>
    </div>
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">{labBars.cats.map((c, k) => <div key={c} className="rounded-lg border border-base-300 bg-base-100 p-1.5 text-center text-xs">
      <p className="font-bold">{c}: {want[k]}</p>
      <div className="mt-1 flex items-center justify-center gap-1">
        <Step label={`${c} turunkan`} disabled={!v[k]} onClick={() => setV(x => x.map((y, j) => (j === k ? y - 1 : y)))}><Minus className="size-3.5" aria-hidden="true" /></Step>
        <span className={`w-6 text-base font-extrabold ${v[k] === want[k] ? "text-success" : ""}`}>{v[k]}</span>
        <Step label={`${c} naikkan`} disabled={v[k] >= labBars.max} onClick={() => setV(x => x.map((y, j) => (j === k ? y + 1 : y)))}><Plus className="size-3.5" aria-hidden="true" /></Step>
      </div></div>)}</div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><BarChart b={{ ...labBars, orient, series: [{ ...labBars.series[0], values: v }] }} /></div>
    <Result value={String(ok)}>{ok === 4 ? <>Semua batang tepat. Batang tertinggi: <strong>{best}</strong> ({Math.max(...v)} siswa). Selisih sepeda dan angkot {want[1] - want[2]} siswa.</>
      : <>Batang yang sudah tepat: <strong>{ok}</strong> dari 4. Naikkan setiap batang sampai garis yang sesuai dengan tabel.</>}</Result>
  </div>;
}
const labs = [TallyLab, PictoLab, BarLab];

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function RawData({ title, items }: { title: string; items: number[] }) {
  const [done, setDone] = useState<number[]>([]);
  return <div className="w-full max-w-lg space-y-1.5">
    <p className="text-center text-sm font-extrabold">{title}</p>
    <div className="grid grid-cols-5 gap-1" role="group" aria-label="Data, ketuk untuk menandai">{items.map((s, i) => { const d = done.includes(i);
      return <button key={i} type="button" aria-pressed={d} aria-label={`Data ke-${i + 1}: ${s}`} onClick={() => setDone(x => (d ? x.filter(y => y !== i) : [...x, i]))}
        className={`rounded-md border py-1 text-sm font-bold ${d ? "border-success bg-success/15 text-base-content/50 line-through" : "border-base-300 bg-base-100"}`}>{s}</button>; })}</div>
    <p className="text-center text-xs text-base-content/60">Ketuk data untuk mencoret yang sudah dihitung. Dicoret {done.length} dari {items.length}.</p>
  </div>;
}
function Cards({ items }: { items: { name: string; likes: string[] }[] }) {
  const [done, setDone] = useState<string[]>([]);
  const count = items.reduce((a, c) => a + c.likes.length, 0);
  return <div className="w-full space-y-1.5">
    <p className="text-center text-sm font-extrabold">Sayuran favorit siswa kelas V</p>
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">{items.map(c => <div key={c.name} className="rounded-lg border border-base-300 bg-base-100 p-1.5">
      <p className="text-xs font-extrabold text-success">{c.name}</p>
      <div className="flex flex-wrap gap-1">{c.likes.map(l => { const k = `${c.name}-${l}`, d = done.includes(k);
        return <button key={l} type="button" aria-pressed={d} aria-label={`${c.name} menyukai ${l}`} onClick={() => setDone(x => (d ? x.filter(y => y !== k) : [...x, k]))}
          className={`rounded px-1.5 py-0.5 text-xs font-semibold ${d ? "bg-success/15 text-base-content/45 line-through" : "bg-base-200"}`}>{l}</button>; })}</div>
    </div>)}</div>
    <p className="text-center text-xs text-base-content/60">Ketuk nama sayuran untuk mencoret yang sudah dihitung. Dicoret {done.length} dari {count}.</p>
  </div>;
}
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "raw": return <RawData title={scene.title} items={scene.items} />;
    case "cards": return <Cards items={scene.items} />;
    case "table": return <figure className="w-full max-w-sm"><figcaption className="mb-1 text-center text-sm font-extrabold">{scene.title}</figcaption>
      <table className="w-full border-collapse bg-base-100 text-sm"><thead><tr className="bg-success/15">{scene.head.map(h => <th key={h} className="border border-base-300 px-2 py-1">{h}</th>)}</tr></thead>
        <tbody>{scene.rows.map(([a, b]) => <tr key={a}><td className="border border-base-300 px-2 py-1 text-center font-bold">{a}</td><td className="border border-base-300 px-2 py-1 text-center">{b}</td></tr>)}</tbody></table></figure>;
    case "picto": return <PictoChart p={scene.picto} showTable={scene.withTable} />;
    case "bars": return <BarChart b={scene.bars} />;
    case "puzzle": return <div className="space-y-2">{scene.lines.map((l, k) => <div key={k} className="flex flex-wrap items-center gap-2 rounded-lg bg-base-100 px-3 py-1.5 text-lg font-extrabold">
      {l.groups.map((g, j) => <span key={j} className="flex items-center gap-1">{j > 0 && <Plus className="size-4" aria-hidden="true" />}<SymbolRow sym={g.sym} quarters={g.n * 4} size={30} /></span>)}
      <span>= {l.value ?? "?"}</span></div>)}</div>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function FreqTable({ p, x, put, checked }: { p: Extract<Part, { kind: "freq" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  return <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
    <thead><tr className="bg-success/15"><th className="border border-base-300 px-2 py-1">{p.head}</th><th className="border border-base-300 px-2 py-1">Turus</th><th className="border border-base-300 px-2 py-1">Frekuensi</th></tr></thead>
    <tbody>{p.rows.map((r, k) => { const t = num(x[2 * k]);
      return <tr key={r.label}><td className="border border-base-300 px-2 py-1 text-center font-bold">{r.label}</td>
        <td className="border border-base-300 px-2 py-1"><div className="flex flex-wrap items-center gap-1.5">
          <Step label={`Turus ${r.label} kurangi`} disabled={checked || !t} onClick={() => put(2 * k, t > 1 ? String(t - 1) : "")}><Minus className="size-3.5" aria-hidden="true" /></Step>
          <Step label={`Turus ${r.label} tambah`} disabled={checked || t >= 30} onClick={() => put(2 * k, String(t + 1))}><Plus className="size-3.5" aria-hidden="true" /></Step>
          <Tally n={t} /></div></td>
        <td className="border border-base-300 px-2 py-1 text-center"><Box label={`Frekuensi ${r.label}`} value={x[2 * k + 1]} onChange={v => put(2 * k + 1, v)} disabled={checked} /></td></tr>; })}</tbody>
  </table></div>;
}
function PicBuild({ picto, x, put, checked }: { picto: Picto; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  return <div className="space-y-1.5">
    {picto.rows.map((r, k) => { const n = num(x[k]); const setN = (m: number) => put(k, m > 0 ? String(m) : "");
      return <div key={r.label} className="rounded-lg border border-base-300 bg-base-100 p-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-bold">{picto.head} {r.label}</span>
          <span className="flex gap-1">
            <Step label={`${r.label} kurangi seperempat`} disabled={checked || !n} onClick={() => setN(n - 1)}><Minus className="size-3.5" aria-hidden="true" />¼</Step>
            <Step label={`${r.label} tambah seperempat`} disabled={checked || n >= 80} onClick={() => setN(n + 1)}><Plus className="size-3.5" aria-hidden="true" />¼</Step>
            <Step label={`${r.label} tambah satu gambar`} disabled={checked || n >= 77} onClick={() => setN(n + 4)}><Plus className="size-3.5" aria-hidden="true" />1</Step>
          </span></div>
        <div className="mt-1 flex items-center gap-2"><SymbolRow sym={picto.symbol} quarters={n} size={22} /><span className="ms-auto shrink-0 text-xs font-bold text-base-content/60">{quarterText(n)} gambar</span></div>
      </div>; })}
    <p className="flex items-center gap-1 text-xs font-semibold"><PicSymbol sym={picto.symbol} size={18} /> = {picto.unitText}</p>
  </div>;
}
function BarBuild({ p, x, put, checked }: { p: Extract<Part, { kind: "barBuild" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  const vals = p.bars.series[0].values.map((v, i) => { const f = p.fill.indexOf(i); return f < 0 ? v : num(x[f]) || null; });
  const { minor, major, max } = p.bars;
  return <div className="space-y-2">
    <div className="grid place-items-center rounded-xl bg-base-200/60 p-2"><BarChart b={p.bars} override={vals} highlight={p.fill} /></div>
    <div className="flex flex-wrap gap-2">{p.fill.map((c, k) => { const n = num(x[k]); const setN = (m: number) => put(k, m > 0 ? String(Math.min(max, m)) : "");
      return <div key={c} role="group" aria-label={`Batang ${p.bars.cats[c]}`} className="flex items-center gap-1 rounded-lg border border-base-300 bg-base-100 p-1.5 text-sm">
        <span className="me-1 font-bold">{p.bars.cats[c]}</span>
        <Step label={`${p.bars.cats[c]} turun ${major}`} disabled={checked || n < major} onClick={() => setN(n - major)}><Minus className="size-3.5" aria-hidden="true" />{major}</Step>
        <Step label={`${p.bars.cats[c]} turun ${minor}`} disabled={checked || !n} onClick={() => setN(n - minor)}><Minus className="size-3.5" aria-hidden="true" />{minor}</Step>
        <span className="w-9 text-center text-base font-extrabold">{n || "…"}</span>
        <Step label={`${p.bars.cats[c]} naik ${minor}`} disabled={checked || n >= max} onClick={() => setN(n + minor)}><Plus className="size-3.5" aria-hidden="true" />{minor}</Step>
        <Step label={`${p.bars.cats[c]} naik ${major}`} disabled={checked || n + major > max} onClick={() => setN(n + major)}><Plus className="size-3.5" aria-hidden="true" />{major}</Step>
      </div>; })}</div>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 text-lg font-bold">{p.label}<Box label={p.label} value={value} onChange={set} disabled={checked} wide={p.answer >= 1000} />{p.unit}</label>;
    case "items": return <div className="space-y-2">{p.items.map((it, k) => <label key={it.label} className="flex flex-wrap items-center gap-2 font-bold">{it.label}<Box label={it.label} value={x[k]} onChange={v => put(k, v)} disabled={checked} wide={it.answer >= 1000} /></label>)}</div>;
    case "freq": return <FreqTable p={p} x={x} put={put} checked={checked} />;
    case "picBuild": return <PicBuild picto={p.picto} x={x} put={put} checked={checked} />;
    case "barBuild": return <BarBuild p={p} x={x} put={put} checked={checked} />;
    case "order": { const seq = value ? value.split(";") : [];
      return <div className="space-y-2"><p className="text-sm font-bold">{p.label}: ketuk berurutan</p>
        <ol className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border-2 border-dashed border-orange-300 p-1.5" aria-label="Urutan yang dipilih">{seq.map((s, k) => <li key={s} className="badge badge-success badge-lg gap-1">{k + 1}. {s}</li>)}</ol>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" disabled={checked || seq.includes(o)} onClick={() => set([...seq, o].join(";"))} className="btn btn-sm btn-outline">{o}</button>)}
          <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join(";"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div></div>; }
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span>{s.text}</span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      {p.charts ? <div className="grid gap-2 sm:grid-cols-2">{p.options.map((op, k) => <button key={op} type="button" aria-label={op} aria-pressed={value === op} disabled={checked} onClick={() => set(op)}
        className={`flex flex-col items-center rounded-2xl border-4 p-2 text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><BarChart b={p.charts![k]} compact label={op} />{op}</button>)}</div>
        : <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div>}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: DQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeFiveData() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 5, Bab 8</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Data</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Kumpulkan data dengan turus dan tabel frekuensi, sajikan dengan piktogram, lalu baca dan buat diagram batang tegak, mendatar, dan ganda.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-40"><BarChart b={labBars} compact label="Contoh diagram batang" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Data penjualan donat Bu Nisa</h2>
        <p className="mt-2 text-sm">Dari catatan penjualan, Bu Nisa tahu rasa donat mana yang perlu dibuat lebih banyak. Begitulah data membantu kita mengambil keputusan.</p>
        <p className="mt-2 text-sm text-base-content/60">3 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-data">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-data" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<DQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 8"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt + q.answer} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
