"use client";

import { ArrowLeft, ArrowRight, Delete, Minus, Plus, RotateCcw, Scissors } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { BarChart, M, SceneView } from "./GradeEightStatisticsArt";
import {
  assessment, blanks, cells, correct, expand, formatAnswer, idn, median, plain, practice, quartiles, ready, SEP, sorted, splitParts, sum, topics,
  type Part, type SQuestion,
} from "@/data/grade-eight-statistics";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, hideLabel }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; hideLabel?: boolean }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className={hideLabel ? "sr-only" : "font-semibold"}>{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => set(Math.round((value - step) * 100) / 100)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-8 text-center text-base font-extrabold tabular-nums">{idn(value)}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => set(Math.round((value + step) * 100) / 100)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm ${value === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div>;
}
const r2 = (v: number) => Math.round(v * 100) / 100;
const Chip = ({ v, tone }: { v: number; tone?: "mid" | "off" | "q" }) => <span className={`inline-grid h-8 min-w-9 place-items-center rounded-md px-1 text-sm font-extrabold ${tone === "mid" ? "bg-warning/40 ring-2 ring-warning" : tone === "q" ? "bg-info/25 ring-1 ring-info" : tone === "off" ? "bg-base-200 text-base-content/40 line-through" : "bg-base-100 ring-1 ring-base-300"}`}>{idn(v)}</span>;

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
const SIZES = [36, 37, 38, 39, 40, 41, 42];
function ModeLab() {
  const [f, setF] = useState([2, 4, 8, 12, 8, 5, 1]);
  const top = Math.max(...f), md = SIZES.filter((_, i) => f[i] === top && top > 0);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-4 gap-y-2">{SIZES.map((s, i) => <Stepper key={s} label={`Ukuran ${s}`} value={f[i]} set={v => setF(f.map((x, j) => (j === i ? v : x)))} min={0} max={16} />)}</div>
    <div className="rounded-xl bg-base-100 p-2"><BarChart title="Ukuran sepatu terjual" labels={SIZES.map(String)} values={f} highlight={SIZES.map((_, i) => i).filter(i => f[i] === top)} unit="pasang" /></div>
    <Result value={md.join(",")}>{md.length === 1 ? `Modus = ukuran ${md[0]} (${top} pasang).` : md.length === SIZES.length ? "Semua frekuensi sama: data ini tidak mempunyai modus." : `Ada ${md.length} modus: ukuran ${md.join(" dan ")}, masing-masing ${top} pasang.`}</Result>
  </div>;
}

const medianSets = { "11 ukuran sepatu": [41, 39, 38, 36, 40, 37, 38, 40, 42, 38, 39], "10 nilai UTS": [67, 89, 78, 96, 80, 77, 68, 90, 72, 88] } as const;
type MSet = keyof typeof medianSets;
function MedianLab() {
  const [set, setSet] = useState<MSet>("11 ukuran sepatu");
  const [pairs, setPairs] = useState(0);
  const s = sorted([...medianSets[set]]), nn = s.length, maxPairs = Math.floor((nn - 1) / 2), done = pairs === maxPairs, mid = nn % 2 ? [maxPairs] : [maxPairs, maxPairs + 1];
  const kind = nn % 2 ? "ganjil" : "genap";
  return <div className="space-y-3">
    <Radios label="Data" options={Object.keys(medianSets) as MSet[]} value={set} set={v => { setSet(v); setPairs(0); }} />
    <div className="space-y-2 rounded-xl bg-base-100 p-3">
      <p className="text-sm">Data asli: {medianSets[set].join(", ")}</p>
      <p className="text-sm font-semibold">Diurutkan:</p>
      <div className="flex flex-wrap gap-1">{s.map((v, i) => <Chip key={i} v={v} tone={i < pairs || i >= nn - pairs ? "off" : done && mid.includes(i) ? "mid" : undefined} />)}</div>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-success gap-1" disabled={done} onClick={() => setPairs(pairs + 1)}><Scissors className="size-4" aria-hidden="true" />Pasangkan dari luar</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setPairs(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    </div>
    <Result value={`${kind}|${pairs}|${done ? idn(median(s)) : ""}`}>{done ? (nn % 2 ? <>Tersisa satu data tengah: median = <strong>{median(s)}</strong>.</> : <>Tersisa dua data tengah: median = <M text={`{${s[mid[0]]} + ${s[mid[1]]}/2}`} /> = <strong>{idn(median(s))}</strong>.</>) : `Banyak data ${nn} (${kind}). Sudah ${pairs} pasang dicoret.`}</Result>
  </div>;
}

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
function MeanLab() {
  const [v, setV] = useState([12, 15, 9, 18, 16, 20]);
  const total = sum(v), m = total / v.length;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-4 gap-y-2">{DAYS.map((d, i) => <Stepper key={d} label={d} value={v[i]} set={x => setV(v.map((y, j) => (j === i ? x : y)))} min={0} max={30} />)}</div>
    <div className="rounded-xl bg-base-100 p-2"><BarChart title="Motor terjual" labels={DAYS} values={v} meanLine={m} unit="motor" /></div>
    <p className="text-sm">Selisih terhadap rata-rata: {v.map((x, i) => <span key={i} className="me-2 font-semibold">{x - m >= 0 ? "+" : "−"}{idn(r2(Math.abs(x - m)))}</span>)} (jumlahnya 0)</p>
    <Result value={`${total}|${idn(r2(m))}`}>Rata-rata = <M text={`{${total}/${v.length}}`} /> = {idn(r2(m))} motor per hari.</Result>
  </div>;
}

const VALS = [75, 80, 85, 90, 95, 100];
function FreqLab() {
  const [f, setF] = useState([2, 5, 8, 10, 4, 1]);
  const nn = sum(f), fx = VALS.map((x, i) => x * f[i]), total = sum(fx), cum = f.map((_, i) => sum(f.slice(0, i + 1)));
  const data = expand(VALS, f);
  return <div className="space-y-3">
    <div className="overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">
      <thead><tr className="bg-success text-success-content"><th className="px-2 py-1">Nilai</th><th>Frekuensi</th><th>Nilai × frekuensi</th><th>Frek. kumulatif</th></tr></thead>
      <tbody>{VALS.map((x, i) => <tr key={x} className="border-t border-base-300"><td className="font-bold">{x}</td><td><Stepper label={`Frekuensi ${x}`} hideLabel value={f[i]} set={v => setF(f.map((y, j) => (j === i ? v : y)))} min={0} max={15} /></td><td>{idn(fx[i])}</td><td>{cum[i]}</td></tr>)}
        <tr className="border-t-2 border-base-300 font-bold"><td>Jumlah</td><td>{nn}</td><td>{idn(total)}</td><td /></tr></tbody></table></div>
    <Result value={`${nn}|${total}|${nn ? idn(r2(total / nn)) : "-"}`}>{nn ? <>Rata-rata = <M text={`{${idn(total)}/${nn}}`} /> = {idn(r2(total / nn))}. Median (data ke-{nn % 2 ? (nn + 1) / 2 : `${nn / 2} dan ${nn / 2 + 1}`}) = {idn(median(data))}.</> : "Belum ada data."}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
const people = [["Anton", 156], ["Joko", 162], ["Made", 158], ["Nadiva", 154], ["Cut Mutia", 160], ["Dewa", 168], ["Robert", 167], ["Andika", 166]] as const;
function RangeLab() {
  const [on, setOn] = useState<boolean[]>(people.map(() => true));
  const vals = people.filter((_, i) => on[i]).map(p => p[1]), mx = Math.max(...vals), mn = Math.min(...vals);
  return <div className="space-y-3">
    <p className="text-sm">Ketuk nama untuk mengeluarkan atau memasukkan siswa ke dalam perhitungan.</p>
    <div className="flex flex-wrap gap-1.5">{people.map(([nm, h], i) => <button key={nm} type="button" aria-pressed={on[i]} disabled={on[i] && vals.length <= 2} onClick={() => setOn(on.map((x, j) => (j === i ? !x : x)))} className={`btn btn-sm h-auto py-1 ${on[i] ? "btn-success" : "btn-outline opacity-60"}`}>{nm} {h}</button>)}</div>
    <div className="rounded-xl bg-base-100 p-2"><BarChart title="Tinggi badan (cm)" labels={people.filter((_, i) => on[i]).map(p => p[0].split(" ")[0])} values={vals} highlight={vals.map((v, i) => (v === mx || v === mn ? i : -1)).filter(i => i >= 0)} /></div>
    <Result value={`${mx}|${mn}|${mx - mn}`}>Jangkauan = {mx} − {mn} = <strong>{mx - mn} cm</strong>.</Result>
  </div>;
}

const qSets = { "10 data": [82, 68, 76, 80, 72, 94, 78, 86, 90, 66], "16 data": [60, 90, 76, 76, 80, 64, 66, 80, 64, 90, 76, 80, 90, 66, 76, 92], "11 data": [45, 52, 38, 60, 41, 55, 49, 63, 47, 58, 50] } as const;
type QSet = keyof typeof qSets;
function QuartileLab() {
  const [set, setSet] = useState<QSet>("10 data");
  const s = sorted([...qSets[set]]), nn = s.length, [q1, q2, q3] = quartiles(s), h = Math.floor(nn / 2);
  const idxQ = (part: number[], off: number) => (part.length % 2 ? [off + (part.length - 1) / 2] : [off + part.length / 2 - 1, off + part.length / 2]);
  const marks = { q1: idxQ(s.slice(0, h), 0), q2: nn % 2 ? [h] : [h - 1, h], q3: idxQ(s.slice(nn - h), nn - h) };
  return <div className="space-y-3">
    <Radios label="Kumpulan data" options={Object.keys(qSets) as QSet[]} value={set} set={setSet} />
    <div className="space-y-2 rounded-xl bg-base-100 p-3">
      <div className="flex flex-wrap gap-1">{s.map((v, i) => <Chip key={i} v={v} tone={marks.q2.includes(i) ? "mid" : marks.q1.includes(i) || marks.q3.includes(i) ? "q" : undefined} />)}</div>
      <p className="text-sm">Kiri Q2: {s.slice(0, h).join(", ")} | Kanan Q2: {s.slice(nn - h).join(", ")}</p>
      <p className="text-lg font-bold">Q1 = {idn(q1)}, Q2 = {idn(q2)}, Q3 = {idn(q3)}</p>
    </div>
    <Result value={`${idn(q1)}|${idn(q2)}|${idn(q3)}`}>Q2 adalah median. Q1 dan Q3 adalah median bagian kiri dan kanan{nn % 2 ? "; data Q2 tidak ikut dibagi karena banyak data ganjil" : ""}.</Result>
  </div>;
}

function SpreadLab() {
  const [x, setX] = useState(84);
  const data = [60, 64, 66, 70, 74, 78, 80, x], [q1, , q3] = quartiles(data), rg = Math.max(...data) - Math.min(...data);
  return <div className="space-y-3">
    <Stepper label="Nilai terbesar" value={x} set={setX} min={80} max={130} />
    <div className="rounded-xl bg-base-100 p-3">
      <div className="flex flex-wrap gap-1">{sorted(data).map((v, i) => <Chip key={i} v={v} tone={i === 7 ? "mid" : undefined} />)}</div>
      <svg viewBox="0 0 320 60" className="mt-2 w-full" role="img" aria-label={`Diagram kotak: terkecil 60, Q1 ${idn(q1)}, Q3 ${idn(q3)}, terbesar ${x}`}>
        {(() => { const X = (v: number) => 14 + ((v - 55) / 80) * 292; return <g>
          <line x1={X(60)} x2={X(q1)} y1="28" y2="28" stroke="#33413b" /><line x1={X(q3)} x2={X(x)} y1="28" y2="28" stroke="#33413b" />
          <rect x={X(q1)} y="14" width={X(q3) - X(q1)} height="28" fill="#dbeafe" stroke="#1c64b5" strokeWidth="1.5" />
          {[60, x].map(v => <line key={v} x1={X(v)} x2={X(v)} y1="18" y2="38" stroke="#33413b" strokeWidth="2" />)}
          <text x={X(q1)} y="54" textAnchor="middle" fontSize="9" fill="#1f3b30">Q1 {idn(q1)}</text><text x={X(q3)} y="54" textAnchor="middle" fontSize="9" fill="#1f3b30">Q3 {idn(q3)}</text><text x={X(x)} y="10" textAnchor="middle" fontSize="9" fill="#c2410c">{x}</text></g>; })()}
      </svg>
    </div>
    <ul className="space-y-0.5 text-base"><li>Jangkauan = {x} − 60 = <strong>{rg}</strong></li><li>Jangkauan kuartil = {idn(q3)} − {idn(q1)} = <strong>{idn(q3 - q1)}</strong></li><li>Simpangan kuartil = <M text={`{1/2}`} /> × {idn(q3 - q1)} = <strong>{idn((q3 - q1) / 2)}</strong></li></ul>
    <Result value={`${x}|${rg}|${idn(q3 - q1)}|${idn((q3 - q1) / 2)}`}>Data terbesar hanya mengubah jangkauan. Kotak di tengah (separuh data) tidak bergeser.</Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { mode: ModeLab, median: MedianLab, mean: MeanLab, freq: FreqLab, range: RangeLab, quartile: QuartileLab, spread: SpreadLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-32" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,.\-−]/g, "").slice(0, 14))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const lbl = "label" in p && p.label ? <span className="font-bold"><M text={p.label} /></span> : null, aria = "label" in p ? plain(p.label) : "";
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2">{lbl}{p.pre && <span className="font-semibold">{p.pre}</span>}<In label={aria} value={value} set={set} disabled={checked} />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1">{lbl}
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "sort": { const used = value ? value.split(",").map(Number) : [];
      return <div role="group" aria-label={aria} className="space-y-2">{lbl}<p className="text-xs text-base-content/60">Ketuk kartu dari data terkecil sampai terbesar.</p>
        <div aria-live="polite" className="flex min-h-12 flex-wrap gap-1 rounded-xl border-2 border-dashed border-success/50 bg-base-100 p-2">{used.length ? used.map((k, j) => <Chip key={j} v={p.values[k]} />) : <span className="text-sm text-base-content/50">Belum ada data yang diurutkan.</span>}</div>
        <div className="flex flex-wrap gap-1.5">{p.values.map((v, k) => <button key={k} type="button" aria-label={`Kartu ${k + 1}: ${idn(v)}`} disabled={checked || used.includes(k)} onClick={() => set([...used, k].join(","))} className="btn btn-sm min-w-11 border-2 border-warning bg-warning/20 text-base font-extrabold">{idn(v)}</button>)}
          <button type="button" disabled={checked || !used.length} onClick={() => set(used.slice(0, -1).join(","))} className="btn btn-sm btn-ghost gap-1"><Delete className="size-4" aria-hidden="true" />Hapus</button></div></div>; }
    case "table": { const bl = blanks(p);
      return <div className="space-y-1">{lbl}<div className="overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">
        <thead><tr className="bg-success text-success-content">{p.head.map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
        <tbody>{p.rows.map((r, ri) => <tr key={ri} className="border-t border-base-300">{r.map((c, ci) => { const k = bl.findIndex(([a, b]) => a === ri && b === ci);
          return <td key={ci} className="p-1">{c === null ? <In label={`${p.head[ci]} untuk ${r[0]}`} value={x[k]} set={s => put(k, s)} disabled={checked} w="w-16" /> : typeof c === "number" ? idn(c) : c}</td>; })}</tr>)}</tbody></table></div></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: SQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeEightStatistics() {
  const [topic, setTopic] = useState(0);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], s = t.sections[sec], Lab = labs[s.lab];
  const go = (ti: number, si = 0) => { setTopic(ti); setSec(si); setMode("learn"); };
  const last = topic === topics.length - 1 && sec === t.sections.length - 1;
  const next = () => (sec < t.sections.length - 1 ? go(topic, sec + 1) : go(topic + 1, 0));
  const prev = () => (sec > 0 ? go(topic, sec - 1) : go(topic - 1, topics[topic - 1].sections.length - 1));
  const total = topics.reduce((a, x) => a + x.sections.length, 0);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 8, Bab 6</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Statistika</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Meringkas data dengan satu angka: modus, median, dan rata-rata untuk pusatnya, lalu jangkauan, kuartil, dan simpangan kuartil untuk sebarannya.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-48"><BarChart title="" labels={["S", "S", "R", "K", "J"]} values={[12, 15, 9, 18, 16]} meanLine={14} className="w-full" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Satu angka untuk banyak data</h2>
        <p className="mt-2 text-sm">Toko sepatu ingin tahu ukuran yang paling laris, guru ingin tahu nilai tengah kelas, dan dokter ingin tahu seberapa stabil tekanan darah pasien. Semua itu dijawab dengan ukuran statistik.</p>
        <p className="mt-2 text-sm text-base-content/60">{total} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-statistika">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-statistika" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-left text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><M text={x} /></li>)}</ol>
            <div className="mt-3 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Dalam kehidupan sehari-hari</p><p><M text={s.life} /></p></div>
            <p className="mt-3 border-s-4 border-success ps-3 text-sm leading-7"><span className="font-bold">Contoh. </span><M text={s.example} /></p>
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong><M text={s.demo} /></p>
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
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 6"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
