"use client";

import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Bars, DistTable, Grid, Hist, M, Ogive, plainMath, SceneView } from "./GradeTwelveStatisticsArt";
import {
  ages80, assessment, bookDists, boundsOf, cells, classesOf, classText, classWidth, correct, cosmetics, cumOf, formatAnswer, groupRaw, idn, locate, meanOf, midsOf,
  modeInfo, nOf, practice, r9, ready, round, sections, SEP, splitParts, srOf, sumFX, topics, varOf, type Dist, type Part, type PQuestion,
} from "@/data/grade-twelve-statistics";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, unit = "", show }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string; show?: string }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => set(r9(value - step))}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{show ?? idn(value)}{unit}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => set(r9(value + step))}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-label={plainMath(o)} aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm h-auto min-h-8 normal-case ${value === o ? "btn-success" : "btn-outline"}`}><M text={o} /></button>)}</div>;
}
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-start gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">{children}</div>;
const r2 = (v: number) => round(v, 2);
const withF = (d: Dist, f: number[]): Dist => ({ ...d, f });

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
function KelasLab() {
  const [k, setK] = useState(5);
  const min = Math.min(...ages80), max = Math.max(...ages80), R = max - min, p = classWidth(R, k), f = groupRaw(ages80, min, p, k), d: Dist = { lows: f.map((_, i) => min + i * p), width: p, f };
  return <div className="space-y-3">
    <Stepper label="Banyak kelas" value={k} set={setK} min={4} max={8} />
    <ul className="space-y-1 text-sm leading-7">
      <li>Data usia 80 pengusaha: terkecil {min}, terbesar {max}.</li>
      <li><M text={`Jangkauan R = ${max} − ${min} = ${R}`} /></li>
      <li><M text={`Panjang kelas = {${R}/${k}} = ${idn(r2(R / k))}, dibulatkan menjadi ${p}`} /></li>
    </ul>
    <DistTable dist={d} cols={["kelas", "batas", "f"]} title="Usia memulai usaha (tahun)" />
    <Result value={`${k}|${p}|${f.join(",")}`}>{`${k} kelas dengan panjang ${p}. Jumlah frekuensi ${f.reduce((s, x) => s + x, 0)}, sama dengan banyak data. Kelas terbanyak ${classText(d, f.indexOf(Math.max(...f)))} (${Math.max(...f)} orang).`}</Result>
  </div>;
}

function KumulatifLab() {
  const d = bookDists.bensin, b = boundsOf(d), limits = [b[0][0], ...b.map(x => x[1])], cum = [0, ...cumOf(d)], n = nOf(d);
  const opts = limits.map(x => `Kurang dari ${idn(x)}`);
  const [o, setO] = useState(opts[3]); const i = opts.indexOf(o), pct = r2((cum[i] / n) * 100);
  return <div className="space-y-3">
    <Radios label="Batas" options={opts} value={o} set={setO} />
    <Pair>
      <Hist dist={d} title="Bensin per minggu" xlabel="Liter" highlight={Array.from({ length: i }, (_, k) => k)} mark={{ x: limits[i], label: idn(limits[i]) }} />
      <Grid head={["Batas", "Frek. kumulatif", "Persentase"]} rows={limits.map((x, k) => [`< ${idn(x)}`, String(cum[k]), `${idn(r2((cum[k] / n) * 100))}%`])} />
    </Pair>
    <Result value={`${idn(limits[i])}|${cum[i]}|${pct}`}>{i === 0 ? `Belum ada mobil di bawah ${idn(limits[0])} liter.` : `${cum[i]} dari ${n} mobil menghabiskan kurang dari ${idn(limits[i])} liter (${d.f.slice(0, i).join(" + ")}), yaitu ${idn(pct)}%.`}</Result>
  </div>;
}

function HistogramLab() {
  const base = bookDists.usia; const [f, setF] = useState(base.f); const [view, setView] = useState<"Histogram" | "Poligon" | "Keduanya">("Histogram");
  const d = withF(base, f), top = Math.max(...f), at = f.filter(x => x === top).length > 1 ? "lebih dari satu kelas" : classText(d, f.indexOf(top));
  return <div className="space-y-3">
    <Radios label="Tampilan" options={["Histogram", "Poligon", "Keduanya"] as const} value={view} set={setView} />
    <div className="flex flex-wrap gap-x-4 gap-y-2">{f.map((x, i) => <Stepper key={i} label={`Frekuensi ${classText(d, i)}`} value={x} set={v => setF(f.map((y, j) => (j === i ? v : y)))} min={0} max={25} />)}</div>
    <Pair>
      <Hist dist={d} show={view === "Histogram" ? "bar" : view === "Poligon" ? "poly" : "both"} title="Usia memulai usaha" xlabel="Usia (tahun)" />
      <Grid head={["Batas kelas", "Titik tengah", "f"]} rows={f.map((x, i) => [`${idn(boundsOf(d)[i][0])}–${idn(boundsOf(d)[i][1])}`, idn(midsOf(d)[i]), String(x)])} />
    </Pair>
    <Result value={`${view}|${f.join(",")}`}>{`Batang dan titik poligon tertinggi ada di ${at}. Titik poligon berada di atas titik tengah ${midsOf(d).map(idn).join(", ")}.`}</Result>
  </div>;
}

function OgiveLab() {
  const d = bookDists.nilai, b = boundsOf(d), xs = [b[0][0], ...b.map(x => x[1])], ys = [0, ...cumOf(d)];
  const [x, setX] = useState(70.5);
  const j = xs.findIndex(v => v >= x - 1e-9), y = j === 0 ? 0 : r9(ys[j - 1] + ((ys[j] - ys[j - 1]) * (x - xs[j - 1])) / (xs[j] - xs[j - 1]));
  return <div className="space-y-3">
    <Stepper label="Garis baca di nilai" value={x} set={setX} min={xs[0]} max={xs[xs.length - 1]} step={5} />
    <Pair>
      <Ogive dist={d} title="Nilai ujian 44 siswa" xlabel="Nilai" mark={x} />
      <ul className="space-y-1 text-sm leading-7"><li>Titik ogive: {xs.map((v, i) => `(${idn(v)}; ${ys[i]})`).join(", ")}.</li>
        {Math.abs(xs[j] - x) > 1e-9 && j > 0 && <li><M text={`${idn(x)} ada di tengah kelas ${idn(xs[j - 1])}–${idn(xs[j])}: ${ys[j - 1]} + {${ys[j] - ys[j - 1]}/2} = ${idn(y)}`} /></li>}</ul>
    </Pair>
    <Result value={`${x}|${y}`}>{`Siswa dengan nilai kurang dari ${idn(x)}: ${Math.abs(xs[j] - x) > 1e-9 ? "kira-kira " : ""}${idn(y)} siswa.`}</Result>
  </div>;
}

function SkalaLab() {
  const [start, setStart] = useState(82); const [scale, setScale] = useState<"Tampilkan skala" | "Sembunyikan skala">("Tampilkan skala");
  const v = cosmetics.vals, ratio = r2((v[1] - start) / (v[0] - start));
  return <div className="space-y-3">
    <Stepper label="Sumbu tegak mulai dari" value={start} set={setStart} min={0} max={82} step={2} />
    <Radios label="Skala" options={["Tampilkan skala", "Sembunyikan skala"] as const} value={scale} set={setScale} />
    <Pair>
      <Bars cats={cosmetics.cats} vals={v} yMin={start} yMax={86} scale={scale === "Tampilkan skala"} title="Membeli ulang kosmetik (%)" />
      <ul className="space-y-1 text-sm leading-7"><li>Nilai sebenarnya: A 83%, B 85%, C 84%.</li>
        <li><M text={`Tinggi B : A pada gambar = (85 − ${start}) : (83 − ${start}) = ${idn(ratio)} : 1`} /></li>
        <li><M text={`Perbandingan sebenarnya {85/83} ≈ 1,02`} /></li></ul>
    </Pair>
    <Result value={`${start}|${ratio}|${scale === "Tampilkan skala" ? "skala" : "tanpa"}`}>{scale === "Sembunyikan skala" ? "Tanpa skala, yang bisa disimpulkan hanya urutannya: B, lalu C, lalu A." : `Batang B tampak ${idn(ratio)} kali batang A, padahal selisih sebenarnya hanya 2%.${start === 0 ? " Dengan sumbu dari 0, tinggi batang sebanding dengan nilainya." : ""}`}</Result>
  </div>;
}

function RerataLab() {
  const base = bookDists.kaya; const [f, setF] = useState(base.f); const d = withF(base, f), n = nOf(d), mean = n ? meanOf(d) : 0;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-4 gap-y-2">{f.map((x, i) => <Stepper key={i} label={`Frekuensi ${classText(d, i)}`} value={x} set={v => setF(f.map((y, j) => (j === i ? v : y)))} min={0} max={25} />)}</div>
    <Pair>
      <Hist dist={d} title="Usia 50 orang terkaya" xlabel="Usia (tahun)" mark={n ? { x: mean, label: `x̄ = ${idn(r2(mean))}` } : undefined} />
      <Grid head={["Kelas", "xᵢ", "fᵢ", "fᵢxᵢ"]} rows={[...f.map((x, i) => [classText(d, i), idn(midsOf(d)[i]), String(x), idn(r9(x * midsOf(d)[i]))]), ["Jumlah", "", String(n), idn(sumFX(d))]]} />
    </Pair>
    <Result value={`${f.join(",")}|${r2(mean)}`}>{n ? <M text={`x̄ = {${idn(sumFX(d))}/${n}} = ${idn(r2(mean))} tahun.`} /> : "Isi frekuensi terlebih dahulu."}</Result>
  </div>;
}

function MedianLab() {
  const d = bookDists.kaya, n = nOf(d); const [k, setK] = useState(n / 2); const o = locate(d, k);
  return <div className="space-y-3">
    <Stepper label="Data ke-" value={k} set={setK} min={1} max={n} />
    <Pair>
      <Hist dist={d} title="Usia 50 orang terkaya" xlabel="Usia (tahun)" highlight={[o.i]} mark={{ x: o.value, label: idn(r2(o.value)) }} />
      <ul className="space-y-1 text-sm leading-7"><li>Frekuensi kumulatif: {cumOf(d).join(", ")}.</li><li>Data ke-{k} ada di kelas {classText(d, o.i)}.</li>
        <li><M text={`L = ${idn(o.L)}, F = ${o.F}, f = ${o.f}, p = ${d.width}`} /></li>
        <li><M text={`Nilai = ${idn(o.L)} + ${d.width} × {(${k} − ${o.F})/${o.f}} = ${idn(r2(o.value))}`} /></li></ul>
    </Pair>
    <Result value={`${k}|${classText(d, o.i)}|${r2(o.value)}`}>{k === n / 2 ? `Data ke-${k} = data ke-n/2, jadi median = ${idn(r2(o.value))} tahun.` : `Data ke-${k} kira-kira ${idn(r2(o.value))} tahun. Kembalikan ke data ke-${n / 2} untuk mendapatkan median.`}</Result>
  </div>;
}

function ModusLab() {
  const base = bookDists.kaya; const [prev, setPrev] = useState(base.f[2]); const [next, setNext] = useState(base.f[4]);
  const d = withF(base, [base.f[0], base.f[1], prev, base.f[3], next]), m = modeInfo(d);
  const b = boundsOf(d)[3];
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-4 gap-y-2"><Stepper label="Frekuensi kelas sebelum" value={prev} set={setPrev} min={0} max={19} /><Stepper label="Frekuensi kelas sesudah" value={next} set={setNext} min={0} max={19} /></div>
    <Pair>
      <div className="w-full max-w-sm"><Hist dist={d} title="Kelas modus 45–49 (frekuensi 20)" xlabel="Usia (tahun)" highlight={[3]} cross={3} mark={{ x: m.value, label: `Mo = ${idn(r2(m.value))}` }} /></div>
      <ul className="space-y-1 text-sm leading-7"><li>Kelas modus {classText(d, 3)}, batas {idn(b[0])}–{idn(b[1])}.</li>
        <li><M text={`d₁ = 20 − ${prev} = ${m.d1}, d₂ = 20 − ${next} = ${m.d2}`} /></li>
        <li><M text={`Mo = 44,5 + 5 × {${m.d1}/(${m.d1} + ${m.d2})} = ${idn(r2(m.value))}`} /></li></ul>
    </Pair>
    <Result value={`${m.d1}|${m.d2}|${r2(m.value)}`}>{m.d1 === m.d2 ? `d₁ = d₂, jadi modus tepat di tengah kelas: ${idn(r2(m.value))}.` : `Modus ${idn(r2(m.value))} bergeser ke arah kelas ${m.d1 > m.d2 ? "sesudah" : "sebelum"} yang lebih padat.`}</Result>
  </div>;
}

function SimpanganLab() {
  const [a, setA] = useState(2); const d: Dist = { lows: [18, 23, 28, 33, 38], width: 5, f: [a, 5, 10 - 2 * a, 5, a] }, mean = meanOf(d), sr = srOf(d);
  return <div className="space-y-3">
    <Stepper label="Data di setiap kelas tepi" value={a} set={setA} min={0} max={5} />
    <Pair>
      <Hist dist={d} title="Waktu antar 20 pesanan" xlabel="Menit" mark={{ x: mean, label: `x̄ = ${idn(mean)}` }} />
      <Grid head={["xᵢ", "fᵢ", "|xᵢ − x̄|", "fᵢ|xᵢ − x̄|"]} rows={[...midsOf(d).map((x, i) => [idn(x), String(d.f[i]), idn(Math.abs(x - mean)), idn(d.f[i] * Math.abs(x - mean))]), ["Jumlah", "20", "", idn(r9(sr * 20))]]} />
    </Pair>
    <Result value={`${a}|${sr}`}><M text={`Rata-rata tetap ${idn(mean)} menit. SR = {${idn(r9(sr * 20))}/20} = ${idn(sr)} menit. ${a === 0 ? "Data paling mengumpul." : a === 5 ? "Semua data jauh dari rata-rata." : "Makin banyak data di tepi, makin besar SR."}`} /></Result>
  </div>;
}

const ragamSets = { "Contoh 2.15 pendapatan": bookDists.pendapatan, "Contoh 2.16 bensin motor": bookDists.motor } as const;
const bookVar: Record<string, string> = { "Contoh 2.15 pendapatan": "212,3", "Contoh 2.16 bensin motor": "25,7" };
function RagamLab() {
  const [set, setSet] = useState<keyof typeof ragamSets>("Contoh 2.15 pendapatan"); const [den, setDen] = useState<"Sampel (n − 1)" | "Populasi (n)">("Sampel (n − 1)");
  const d = ragamSets[set], pop = den === "Populasi (n)", v = varOf(d, pop), n = nOf(d), sx = sumFX(d), mids = midsOf(d), sxx = r9(mids.reduce((s, x, i) => s + d.f[i] * x * x, 0));
  return <div className="space-y-3">
    <Radios label="Data" options={Object.keys(ragamSets) as (keyof typeof ragamSets)[]} value={set} set={setSet} />
    <Radios label="Pembagi" options={["Sampel (n − 1)", "Populasi (n)"] as const} value={den} set={setDen} />
    <Grid head={["Kelas", "fᵢ", "xᵢ", "fᵢxᵢ", "fᵢxᵢ^{2}"]} rows={[...classesOf(d).map((_, i) => [classText(d, i), String(d.f[i]), idn(mids[i]), idn(r9(d.f[i] * mids[i])), idn(r9(d.f[i] * mids[i] * mids[i]))]), ["Jumlah", String(n), "", idn(sx), idn(sxx)]]} />
    <p className="text-sm leading-7"><M text={pop ? `s^{2} = {(${n} × ${idn(sxx)} − ${idn(sx)}^{2})/${n}^{2}} = ${idn(r2(v))}` : `s^{2} = {(${n} × ${idn(sxx)} − ${idn(sx)}^{2})/(${n} × ${n - 1})} = ${idn(r2(v))}`} /></p>
    <Result value={`${set.slice(7, 11)}|${pop ? "n" : "n-1"}|${r2(v)}`}><M text={`Ragam ${idn(r2(v))}, simpangan baku ${idn(r2(Math.sqrt(v)))}. ${pop ? "Pembagi n memberi hasil sedikit lebih kecil." : `Sama dengan nilai di buku (${bookVar[set]}).`}`} /></Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { kelas: KelasLab, kumulatif: KumulatifLab, histogram: HistogramLab, ogive: OgiveLab, skala: SkalaLab, rerata: RerataLab, median: MedianLab, modus: ModusLab, simpangan: SimpanganLab, ragam: RagamLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-20" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,.\-−]/g, "").slice(0, 12))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-bold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} w="w-28" />{p.unit && <span className="font-semibold">{p.unit}</span>}
      {p.dp !== undefined && <span className="basis-full text-xs text-base-content/60">Boleh dibulatkan sampai {p.dp} angka di belakang koma.</span>}</div>;
    case "row": return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      <div className="flex flex-wrap gap-2">{p.cells.map((c, k) => <label key={c} className="flex flex-col items-center gap-1 rounded-lg bg-base-100 p-1.5 text-xs font-semibold ring-1 ring-base-300"><M text={c} /><In label={`${plainMath(p.label)} ${plainMath(c)}`} value={x[k]} set={v => put(k, v)} disabled={checked} /></label>)}</div></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      <div className={p.pics ? "grid gap-2 sm:grid-cols-3" : "flex flex-wrap gap-2"}>{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>
        {p.pics?.[op] && <span className="mb-1 block"><SceneView scene={p.pics[op]} /></span>}<M text={op} /></button>)}</div></div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-bold"><M text={r.text} /></span><span className="flex shrink-0 flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm h-auto min-h-8 ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeTwelveStatistics() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 12, Bab 2</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Statistika</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Menyajikan data berkelompok dalam tabel, histogram, poligon, dan ogive, lalu menghitung rata-rata, median, modus, simpangan rata-rata, ragam, dan simpangan baku.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-56"><Hist dist={bookDists.usia} show="both" /></div>
        <p className="mt-1 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Dari ratusan angka menjadi satu gambaran</h2>
        <p className="mt-2 text-sm">Catatan penjualan, nilai ujian, atau berat balita sulit dibaca jika hanya berupa deretan angka. Setelah dikelompokkan dan digambar, polanya terlihat, dan beberapa angka ringkas cukup untuk mengambil keputusan.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-statistika-12">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-statistika-12" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map(x => <button key={x.code} type="button" aria-current={x === t ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${x === t ? "btn-success" : "btn-outline"}`} onClick={() => go(sections.findIndex(o => o.topic === x))}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {inTopic.map(({ x, i }) => <button key={x.code} type="button" role="tab" aria-selected={i === idx} onClick={() => go(i)} className={`rounded-md px-2.5 py-1 text-left text-sm font-semibold ${i === idx ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{x.code} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={idx} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{s.code} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><M text={x} /></li>)}</ol>
            <div className="mt-4 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Studi kasus sehari-hari</p><p><M text={s.life} /></p></div>
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
        title={mode === "practice" ? `Latihan ${s.code} ${s.title}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
