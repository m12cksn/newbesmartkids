"use client";

import { ArrowLeft, ArrowRight, BarChart3, Check, ChartLine, ChartPie, Minus, Plus, RotateCcw, Undo2, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { BarChart } from "./GradeFiveDataArt";
import { MathText } from "./GradeSevenRationalArt";
import { AxisBars, LinePlot, LineChart, MiniCharts, PieChart } from "./GradeSevenDataArt";
import {
  assessment, cells, co2, correct, countOf, formatAnswer, idn, medals, names7A, practice, quota, ready, SEP, splitParts, steps, topics,
  type Bars, type DQuestion, type Part, type Scene,
} from "@/data/grade-seven-data";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, unit = "", hide }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string; hide?: boolean }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className={hide ? "sr-only" : "font-semibold"}>{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min} onClick={() => set(value - step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-10 text-center text-base font-extrabold tabular-nums">{idn(value)}{unit}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max} onClick={() => set(value + step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function NumBox({ value, set, label, disabled, wide }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; wide?: boolean }) {
  const neg = value.startsWith("-"), body = value.replace("-", "");
  return <span className="inline-flex items-center gap-0.5">
    <button type="button" aria-label={`${label} ganti tanda`} aria-pressed={neg} disabled={disabled} onClick={() => set((neg ? "" : "-") + body)} className={`btn btn-sm btn-square h-10 w-8 text-lg font-extrabold ${neg ? "btn-info" : "btn-ghost text-base-content/40"}`}>{neg ? "−" : "±"}</button>
    <input aria-label={label} inputMode="decimal" placeholder="…" value={body} disabled={disabled} onChange={e => { const t = e.target.value.replace(/\./g, "").replace(/[^\d,]/g, "").replace(/,(?=.*,)/g, "").slice(0, 10); set((neg ? "-" : "") + t); }}
      className={`h-10 ${wide ? "w-32" : "w-20"} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />
  </span>;
}
const single = (title: string, cats: string[], values: number[], max: number, step = 1, color = "#2f86d6"): Bars => ({ title, orient: cats.some(c => c.length > 8) ? "h" : "v", cats, series: [{ name: title, color, values }], max, minor: step, major: step * 2, valueLabel: "Frekuensi", catLabel: "" });

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
const flowQ = [{ q: "Berapa tinggi badan siswa kelas 7?", ok: true }, { q: "Berapa tinggi badanku?", ok: false }, { q: "Lagu apa yang paling banyak didengar siswa SMP?", ok: true }, { q: "Hari ini hari apa?", ok: false }];
function FlowLab() {
  const [seq, setSeq] = useState<string[]>([]);
  const [pick, setPick] = useState<Record<number, boolean>>({});
  const shuffled = [steps[2], steps[0], steps[3], steps[1]], done = seq.length === 4, right = done && seq.every((s, i) => s === steps[i]);
  const qs = Object.keys(pick).length, qok = Object.entries(pick).filter(([k, v]) => flowQ[Number(k)].ok === v).length;
  return <div className="space-y-3">
    <p className="text-sm font-bold">Susun alur investigasi statistika</p>
    <ol className="flex min-h-12 flex-wrap items-center gap-1 rounded-lg border-2 border-dashed border-orange-300 p-1.5" aria-label="Alur yang disusun">{seq.map((s, k) => <li key={s} className="flex items-center gap-1">{k > 0 && <ArrowRight className="size-4 text-base-content/50" aria-hidden="true" />}<span className={`badge badge-lg h-auto py-1 ${done ? (s === steps[k] ? "badge-success" : "badge-error") : "badge-info"}`}>{s}</span></li>)}</ol>
    <div className="flex flex-wrap gap-1.5">{shuffled.map(s => <button key={s} type="button" disabled={seq.includes(s)} onClick={() => setSeq(x => [...x, s])} className="btn btn-sm btn-outline">{s}</button>)}
      <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!seq.length} onClick={() => setSeq([])}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
    <div className="space-y-1.5 rounded-xl bg-base-100 p-3 text-sm"><p className="font-bold">Pertanyaan statistika atau bukan?</p>
      {flowQ.map((f, k) => <div key={f.q} role="group" aria-label={f.q} className="flex flex-wrap items-center justify-between gap-2"><span>{f.q}</span><span className="join">{[true, false].map(v => <button key={String(v)} type="button" aria-pressed={pick[k] === v} onClick={() => setPick(x => ({ ...x, [k]: v }))} className={`btn join-item btn-xs ${pick[k] === v ? (f.ok === v ? "btn-success" : "btn-error") : "btn-outline"}`}>{v ? "Statistika" : "Bukan"}</button>)}</span></div>)}</div>
    <Result value={`${done ? (right ? "ok" : "no") : seq.length}|${qok}/${qs}`}>{!done ? `Tersusun ${seq.length} dari 4 langkah.` : right ? "Alurnya tepat: pertanyaan dahulu, lalu data dikumpulkan, dianalisis, dan diinterpretasikan." : "Belum tepat. Ingat, tanpa pertanyaan kita tidak tahu data apa yang harus dikumpulkan."} {qs > 0 && `Pertanyaan yang kamu kelompokkan dengan tepat: ${qok} dari ${qs}.`}</Result>
  </div>;
}
function LinePlotLab() {
  const [k, setK] = useState(8);
  const data = names7A.slice(0, k), counts = Array.from({ length: 23 }, (_, i) => countOf(data, 6 + i)), mx = Math.max(...counts), mode = counts.flatMap((c, i) => (c === mx ? [6 + i] : []));
  return <div className="space-y-3">
    <Stepper label="Data yang dicatat" value={k} set={setK} min={1} max={names7A.length} />
    <p className="text-xs text-base-content/70">Data panjang nama: {names7A.map((v, i) => <span key={i} className={i < k ? "font-bold text-info" : ""}>{v}{i < names7A.length - 1 ? ", " : ""}</span>)}</p>
    <div className="rounded-xl bg-base-100 p-2"><LinePlot title="Panjang Nama Siswa Kelas 7A" min={6} max={28} counts={counts} /></div>
    <Result value={`${k}|${mode.join(",")}`}>{k} data tercatat, jadi ada {k} tanda X. Nilai yang paling sering muncul: <strong>{mode.join(" dan ")}</strong> ({mx} kali). Nilai terkecil {Math.min(...data)}, terbesar {Math.max(...data)}.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
const cards = [{ t: "Tinggi badan", k: "Numerik" }, { t: "Warna favorit", k: "Kategorik" }, { t: "Nomor absen", k: "Kategorik" }, { t: "Banyak medali", k: "Numerik" }, { t: "Nama provinsi", k: "Kategorik" }, { t: "Suhu badan", k: "Numerik" }];
function SortLab() {
  const [put, setPut] = useState<Record<string, string>>({});
  const right = cards.filter(c => put[c.t] === c.k).length, done = Object.keys(put).length;
  return <div className="space-y-3">
    <div className="space-y-1.5">{cards.map(c => <div key={c.t} role="group" aria-label={c.t} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-base-300 bg-base-100 p-2 text-sm">
      <span className="font-bold">{c.t}</span>
      <span className="join">{["Kategorik", "Numerik"].map(k => <button key={k} type="button" aria-pressed={put[c.t] === k} onClick={() => setPut(x => ({ ...x, [c.t]: k }))} className={`btn join-item btn-xs ${put[c.t] === k ? (c.k === k ? "btn-success" : "btn-error") : "btn-outline"}`}>{k}</button>)}</span></div>)}</div>
    <Result value={`${right}/${done}`}>Tepat {right} dari {done} kartu. {put["Nomor absen"] === "Numerik" ? "Nomor absen memang angka, tetapi hanya label: tidak masuk akal dijumlahkan, jadi kategorik." : "Data numerik adalah hasil menghitung atau mengukur."}</Result>
  </div>;
}
const tallyData = [3, 2, 4, 3, 1, 3, 2, 5, 3, 4, 2, 3, 0, 4, 3, 2];
function TallyLab() {
  const [k, setK] = useState(0);
  const d = tallyData.slice(0, k), f = Array.from({ length: 6 }, (_, v) => countOf(d, v));
  return <div className="space-y-3">
    <p className="text-sm">Banyak aplikasi permainan di gawai 16 siswa. Ketuk data berikutnya untuk mencatatnya.</p>
    <div className="flex flex-wrap gap-1">{tallyData.map((v, i) => <span key={i} className={`grid size-8 place-items-center rounded-md text-sm font-bold ${i < k ? "bg-base-300 text-base-content/40 line-through" : "bg-base-100 ring-1 ring-base-300"}`}>{v}</span>)}</div>
    <div className="flex gap-2"><button type="button" className="btn btn-sm btn-success" disabled={k >= tallyData.length} onClick={() => setK(k + 1)}>Catat data berikutnya</button><button type="button" className="btn btn-sm btn-outline" disabled={k >= tallyData.length} onClick={() => setK(tallyData.length)}>Catat semua</button><button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!k} onClick={() => setK(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
    <div className="grid gap-2 sm:grid-cols-2">
      <table className="w-full border-collapse bg-base-100 text-center text-sm"><thead><tr className="bg-success text-success-content"><th className="p-1">Aplikasi</th><th className="p-1">Frekuensi</th></tr></thead><tbody>{f.map((c, v) => <tr key={v} className="border-t border-base-300"><td>{v}</td><td className="font-bold">{c}</td></tr>)}</tbody></table>
      <div className="rounded-xl bg-base-100 p-1"><BarChart b={single("Banyak Aplikasi", f.map((_, v) => String(v)), f, 6)} compact /></div>
    </div>
    <Result value={String(k)}>Tercatat {k} dari 16 data; jumlah frekuensi {k}.{k === 16 && " Kebanyakan siswa mempunyai 3 aplikasi (6 siswa)."}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
function ReadLab() {
  const [c, setC] = useState(2);
  const a = medals.series[0].values[c]!, b = medals.series[1].values[c]!;
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Negara" className="flex flex-wrap gap-1.5">{medals.cats.map((x, i) => <button key={x} type="button" role="radio" aria-checked={c === i} onClick={() => setC(i)} className={`btn btn-sm ${c === i ? "btn-success" : "btn-outline"}`}>{x}</button>)}</div>
    <div className="rounded-xl bg-base-100 p-2"><BarChart b={medals} highlight={[c]} /></div>
    <ul className="grid grid-cols-2 gap-1 text-xs sm:grid-cols-4">{["Judul", "Label sumbu", "Skala dari 0", "Legenda"].map(t => <li key={t} className="flex items-center gap-1"><Check className="size-3.5 text-success" aria-hidden="true" />{t}</li>)}</ul>
    <Result value={`${a}|${b}`}>{medals.cats[c]}: 2016 <strong>{a}</strong> medali, 2020 <strong>{b}</strong> medali. {b > a ? `Naik ${b - a}.` : b < a ? `Turun ${a - b}.` : "Sama."}</Result>
  </div>;
}
function AxisLab() {
  const [from, setFrom] = useState(40);
  const v = [50, 70, 60], ratio = (70 - from) / (50 - from);
  return <div className="space-y-3">
    <Stepper label="Sumbu tegak mulai dari" value={from} set={setFrom} min={0} max={40} step={10} />
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><AxisBars title="Nilai Ulangan Matematika" cats={["Eko", "Bella", "Totok"]} values={v} from={from} to={100} step={10} /></div>
    <Result value={idn(ratio)}>Batang Bella tampak <strong>{idn(ratio)} kali</strong> batang Eko, padahal nilainya 70 : 50 = 1,4 kali. {from === 0 ? "Dengan sumbu dari 0, panjang batang sesuai dengan nilainya." : "Sumbu yang tidak dimulai dari 0 membesarkan perbedaan."}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga D                                                                */
/* ====================================================================== */
const buildT = [{ c: "Jalan kaki", f: 7 }, { c: "Bus", f: 9 }, { c: "Ojek online", f: 11 }, { c: "Kendaraan pribadi", f: 5 }];
function BuildLab() {
  const [v, setV] = useState([0, 0, 0, 0]);
  const ok = v.filter((x, i) => x === buildT[i].f).length;
  return <div className="space-y-3">
    <div className="grid gap-1.5 sm:grid-cols-2">{buildT.map((t, i) => <div key={t.c} className="flex items-center justify-between gap-2 rounded-lg border border-base-300 bg-base-100 p-1.5 text-sm">
      <span><span className="font-bold">{t.c}</span> ({t.f} siswa)</span><Stepper label={t.c} hide value={v[i]} set={n => setV(x => x.map((y, j) => (j === i ? n : y)))} min={0} max={12} /></div>)}</div>
    <div className="rounded-xl bg-base-100 p-2"><BarChart b={{ ...single("Cara Siswa ke Sekolah", buildT.map(t => t.c), v, 12), catLabel: "Cara ke sekolah", valueLabel: "Banyak siswa" }} /></div>
    <Result value={String(ok)}>Batang yang sudah tepat: <strong>{ok}</strong> dari 4.{ok === 4 && " Ojek online paling banyak dipilih."}</Result>
  </div>;
}
function ChangeLab() {
  const [c, setC] = useState(0);
  const a = co2.series[0].values[c]!, b = co2.series[1].values[c]!, ch = b - a, pct = (ch / a) * 100;
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Negara" className="flex flex-wrap gap-1.5">{co2.cats.map((x, i) => <button key={x} type="button" role="radio" aria-checked={c === i} onClick={() => setC(i)} className={`btn btn-sm ${c === i ? "btn-success" : "btn-outline"}`}>{x}</button>)}</div>
    <div className="rounded-xl bg-base-100 p-2"><BarChart b={co2} highlight={[c]} /></div>
    <Result value={idn(pct)}>{co2.cats[c]}: perubahan = {idn(b)} − {idn(a)} = <strong>{idn(ch)}</strong> juta ton. Persentase perubahan = <MathText text={`{${idn(Math.abs(ch))}/${idn(a)}}`} /> × 100% = <strong>{idn(Math.abs(pct))}%</strong> ({ch >= 0 ? "naik" : "turun"}). Selisih yang sama besar dapat berarti persentase yang berbeda jika nilai awalnya berbeda.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga E                                                                */
/* ====================================================================== */
const r1 = (n: number) => idn(Math.round(n * 10) / 10);
const pieColors = ["#e5484d", "#2f86d6", "#2b8a3e", "#f5b014"];
function PieLab() {
  const [v, setV] = useState([10, 15, 8, 7]);
  const names = ["Merah", "Biru", "Hijau", "Kuning"], tot = v.reduce((a, b) => a + b, 0) || 1;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-5 gap-y-2">{names.map((nm, i) => <Stepper key={nm} label={nm} value={v[i]} set={n => setV(x => x.map((y, j) => (j === i ? n : y)))} min={0} max={30} />)}</div>
    <div className="grid items-center gap-2 rounded-xl bg-base-100 p-2 sm:grid-cols-2">
      <PieChart pie={{ title: "Kaus Terjual", show: "angle", parts: names.map((nm, i) => ({ name: nm, value: v[i], color: pieColors[i] })) }} size={190} />
      <table className="w-full border-collapse text-center text-xs"><thead><tr className="bg-success text-success-content"><th className="p-1">Warna</th><th>Pecahan</th><th>Sudut</th><th>Persen</th></tr></thead>
        <tbody>{names.map((nm, i) => <tr key={nm} className="border-t border-base-300"><td className="p-1 font-bold">{nm}</td><td><MathText text={`{${v[i]}/${tot}}`} /></td><td>{r1((v[i] / tot) * 360)}°</td><td>{r1((v[i] / tot) * 100)}%</td></tr>)}</tbody></table>
    </div>
    <Result value={`${tot}|${r1((v[0] / tot) * 360)}`}>Jumlah {tot} kaus. Sudut juring merah = <MathText text={`{${v[0]}/${tot}}`} /> × 360° = <strong>{r1((v[0] / tot) * 360)}°</strong>{(v[0] * 3600) % tot ? " (dibulatkan)" : ""}. Jumlah semua sudut 360° dan semua persen 100%.</Result>
  </div>;
}
function PieReadLab() {
  const [tot, setTot] = useState(500);
  const [ang, setAng] = useState(216);
  const pct = (ang / 360) * 100;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Total" value={tot} set={setTot} min={100} max={1000} step={50} unit=" TB" /><Stepper label="Sudut terpakai" value={ang} set={setAng} min={0} max={360} step={18} unit="°" /></div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><PieChart pie={{ title: "Kapasitas Hard Disk", show: "percent", parts: [{ name: "Terpakai", value: ang, color: "#f08a24" }, { name: "Tidak terpakai", value: 360 - ang, color: "#2f86d6" }] }} size={180} /></div>
    <Result value={idn((pct / 100) * tot)}><MathText text={`{${ang}/360}`} /> × 100% = <strong>{idn(pct)}%</strong> terpakai, yaitu {idn(pct)}% × {tot} = <strong>{idn((pct / 100) * tot)} TB</strong>. Sisanya {idn(tot - (pct / 100) * tot)} TB.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga F                                                                */
/* ====================================================================== */
const situations = [
  { s: "Pemakaian listrik keluarga setiap bulan selama setahun", a: "Diagram garis", why: "Data berubah dari waktu ke waktu." },
  { s: "Banyak siswa yang memilih setiap ekstrakurikuler", a: "Diagram batang", why: "Membandingkan jumlah antar kategori." },
  { s: "Persentase uang saku untuk makan, transport, tabungan, dan lainnya", a: "Diagram lingkaran", why: "Setiap bagian dari satu keseluruhan." },
  { s: "Nilai rata-rata kelas 7A dan 7B untuk lima mata pelajaran", a: "Diagram batang ganda", why: "Dua kelompok pada kategori yang sama." },
];
const chartIcons = [{ n: "Diagram batang", I: BarChart3 }, { n: "Diagram batang ganda", I: BarChart3 }, { n: "Diagram garis", I: ChartLine }, { n: "Diagram lingkaran", I: ChartPie }];
function ChooseLab() {
  const [k, setK] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const s = situations[k];
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Situasi" className="flex flex-wrap gap-1.5">{situations.map((x, i) => <button key={x.s} type="button" role="radio" aria-checked={k === i} onClick={() => { setK(i); setPick(null); }} className={`btn btn-xs ${k === i ? "btn-success" : "btn-outline"}`}>Situasi {i + 1}</button>)}</div>
    <p className="rounded-xl bg-base-100 p-3 font-bold">{s.s}</p>
    <div role="group" aria-label="Pilih diagram" className="grid grid-cols-2 gap-1.5">{chartIcons.map(({ n, I }) => <button key={n} type="button" aria-pressed={pick === n} onClick={() => setPick(n)} className={`btn btn-sm h-auto justify-start gap-2 py-2 ${pick === n ? (n === s.a ? "btn-success" : "btn-error") : "btn-outline"}`}><I className="size-4" strokeWidth={1.75} aria-hidden="true" />{n}</button>)}</div>
    <Result value={pick ? (pick === s.a ? "ok" : "no") : ""}>{!pick ? "Pilih diagram yang paling tepat." : pick === s.a ? <><Check className="me-1 inline size-4 text-success" aria-hidden="true" />Tepat. {s.why}</> : <><X className="me-1 inline size-4 text-error" aria-hidden="true" />Belum. Yang paling tepat {s.a.toLowerCase()}: {s.why.toLowerCase()}</>}</Result>
  </div>;
}
function LineViewLab() {
  const [mode, setMode] = useState<"bar" | "line">("bar");
  const v = quota.series[0].values as number[], inc = v.slice(1).filter((x, i) => x > v[i]).length;
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Tampilan" className="join">{([["bar", "Batang"], ["line", "Garis"]] as const).map(([k, t]) => <button key={k} type="button" role="radio" aria-checked={mode === k} onClick={() => setMode(k)} className={`btn join-item btn-sm ${mode === k ? "btn-success" : "btn-outline"}`}>{t}</button>)}</div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2">{mode === "bar" ? <BarChart b={quota} /> : <LineChart line={{ title: quota.title, cats: quota.cats, series: [{ name: "Kuota", color: "#f08a24", values: v }], max: 12, step: 2, valueLabel: "GB" }} />}</div>
    <Result value={mode}>Data yang sama: naik {inc} kali lalu turun dari bulan ke-10. {mode === "line" ? "Pada diagram garis, naik-turunnya dari bulan ke bulan lebih mudah terlihat." : "Pada diagram batang, besar setiap bulan lebih mudah dibandingkan."}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { flow: FlowLab, lineplot: LinePlotLab, sort: SortLab, tally: TallyLab, read: ReadLab, axis: AxisLab, build: BuildLab, change: ChangeLab, pie: PieLab, pieread: PieReadLab, choose: ChooseLab, lineview: LineViewLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "plot": return <LinePlot title={scene.title} min={scene.min} max={scene.max} counts={Array.from({ length: scene.max - scene.min + 1 }, (_, k) => countOf(scene.data, scene.min + k))} />;
    case "bars": return <BarChart b={scene.bars} />;
    case "axis": return <AxisBars {...scene} />;
    case "pie": return <PieChart pie={scene.pie} />;
    case "line": return <LineChart line={scene.line} />;
    case "minis": return <MiniCharts />;
    case "raw": return <div className="w-full max-w-md"><p className="mb-1 text-center text-sm font-bold">{scene.title}</p><p className="flex flex-wrap justify-center gap-1">{scene.items.map((v, i) => <span key={i} className="grid h-8 min-w-8 place-items-center rounded-md bg-base-100 px-1 text-sm font-bold ring-1 ring-base-300">{v}</span>)}</p></div>;
    case "table": return <div className="w-full max-w-sm overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">{scene.caption && <caption className="mb-1 text-sm font-bold">{scene.caption}</caption>}
      <thead><tr className="bg-success text-success-content">{scene.head.map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
      <tbody>{scene.rows.map(r => <tr key={r[0]} className="border-t border-base-300">{r.map((c, j) => <td key={j} className={`px-2 py-1 ${j ? "" : "font-bold"}`}>{c}</td>)}</tr>)}</tbody></table></div>;
    case "text": return <ul className="w-full max-w-lg list-disc space-y-1 rounded-lg bg-base-100 py-2 pe-3 ps-7 text-sm">{scene.lines.map(l => <li key={l}><MathText text={l} /></li>)}</ul>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PlotAnswer({ p, x, set, checked }: { p: Extract<Part, { kind: "plot" }>; x: string[]; set: (v: string) => void; checked: boolean }) {
  const [hist, setHist] = useState<number[]>([]);
  const counts = x.map(c => Number(c) || 0);
  const add = (v: number) => { const c = [...counts]; c[v - p.min]++; setHist(h => [...h, v]); set(c.join("|")); };
  const undo = () => { const v = hist[hist.length - 1]; if (v === undefined) return; const c = [...counts]; c[v - p.min] = Math.max(0, c[v - p.min] - 1); setHist(h => h.slice(0, -1)); set(c.join("|")); };
  return <div className="space-y-1">
    <div className="rounded-xl bg-base-100 p-2"><LinePlot min={p.min} max={p.max} counts={counts} onTick={checked ? undefined : v => add(v)} label="Garis bilangan, ketuk untuk menambah X" /></div>
    <div className="flex flex-wrap items-center gap-2 text-xs"><span className="text-base-content/60">Ketuk di atas sebuah nilai untuk menambah satu X. Tercatat {counts.reduce((a, b) => a + b, 0)} tanda X.</span>
      <button type="button" className="btn btn-xs btn-ghost gap-1" disabled={checked || !hist.length} onClick={undo}><Undo2 className="size-3.5" aria-hidden="true" />Batal satu</button>
      <button type="button" className="btn btn-xs btn-ghost gap-1" disabled={checked || !counts.some(Boolean)} onClick={() => { setHist([]); set(""); }}><RotateCcw className="size-3.5" aria-hidden="true" />Kosongkan</button></div>
  </div>;
}
function BarsAnswer({ p, x, put, checked }: { p: Extract<Part, { kind: "bars" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  const v = x.map(c => Number(c) || 0);
  return <div className="space-y-2">
    <div className="rounded-xl bg-base-200/60 p-2"><BarChart b={{ ...single(p.title, p.cats, v, p.max, p.step), catLabel: "", valueLabel: "Frekuensi" }} /></div>
    <div className="flex flex-wrap gap-2">{p.cats.map((c, k) => <div key={c} className="rounded-lg border border-base-300 bg-base-100 p-1.5">
      <span role="group" aria-label={`Batang ${c}`} className="inline-flex items-center gap-1 text-sm"><span className="me-1 font-bold">{c}</span>
        <button type="button" aria-label={`${c} turun`} disabled={checked || !v[k]} onClick={() => put(k, String(v[k] - p.step))} className="btn btn-xs btn-square btn-outline"><Minus className="size-3.5" aria-hidden="true" /></button>
        <span className="w-7 text-center font-extrabold">{v[k]}</span>
        <button type="button" aria-label={`${c} naik`} disabled={checked || v[k] >= p.max} onClick={() => put(k, String(v[k] + p.step))} className="btn btn-xs btn-square btn-outline"><Plus className="size-3.5" aria-hidden="true" /></button></span></div>)}</div>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const plain = (s: string) => s.replace(/\{([^}]+)\}/g, "$1");
  switch (p.kind) {
    case "num": return <label className="flex flex-wrap items-center gap-2 font-bold"><span><MathText text={p.label} /></span><NumBox label={plain(p.label)} value={value} set={set} disabled={checked} wide={Math.abs(p.value) >= 10000} />{p.unit}</label>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="group" aria-label={r.text} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center">
      <span className="text-sm font-bold sm:w-60">{r.text}</span>
      <div className="flex flex-wrap gap-1">{p.options.map(o => <button key={o} type="button" disabled={checked} aria-pressed={x[k] === o} onClick={() => put(k, o)} className={`btn btn-sm h-auto min-h-8 py-1 ${x[k] === o ? on : "btn-outline"}`}>{o}</button>)}</div></div>)}</div>;
    case "select": { const sel = value ? value.split(",").map(Number) : [];
      return <div className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
        <div role="group" aria-label={p.label} className="flex flex-wrap gap-1.5">{p.options.map((o, k) => { const s = sel.includes(k);
          return <button key={o} type="button" aria-pressed={s} disabled={checked} onClick={() => set((s ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))} className={`btn btn-sm h-auto min-h-8 py-1 ${s ? on : "btn-outline"}`}>{o}</button>; })}</div>
        <p className="text-xs text-base-content/60">Ketuk semua yang benar. Ketuk lagi untuk membatalkan. Dipilih {sel.length}.</p></div>; }
    case "order": { const seq = value ? value.split(";") : [];
      return <div className="space-y-2"><p className="text-sm font-bold">{p.label}: ketuk berurutan</p>
        <ol className="space-y-1 rounded-lg border-2 border-dashed border-orange-300 p-1.5" aria-label="Urutan yang dipilih">{seq.length ? seq.map((s, k) => <li key={s} className="text-sm font-semibold">{k + 1}. {s}</li>) : <li className="text-sm text-base-content/40">Belum ada.</li>}</ol>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" disabled={checked || seq.includes(o)} onClick={() => set([...seq, o].join(";"))} className="btn btn-sm btn-outline h-auto min-h-8 py-1 text-left">{o}</button>)}
          <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join(";"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div></div>; }
    case "table": { let k = 0;
      return <div className="space-y-1.5">{p.rows.map((row, r) => <div key={r} className="rounded-lg border border-base-300 p-2"><p className="mb-1 text-sm font-bold">{row[0]}{row.slice(1).filter(c => c !== null).map((c, j) => <span key={j} className="ms-2 font-normal">{p.head[j + 1]}: {c}</span>)}</p>
        <div className="flex flex-wrap gap-2">{row.map((c, j) => { if (c !== null) return null; const idx = k++;
          return <label key={j} className="flex items-center gap-1 text-sm font-semibold">{p.head[j]}<NumBox label={`${row[0]} ${p.head[j]}`} value={x[idx]} set={v => put(idx, v)} disabled={checked} /></label>; })}</div></div>)}</div>; }
    case "plot": return <PlotAnswer p={p} x={x} set={set} checked={checked} />;
    case "bars": return <BarsAnswer p={p} x={x} put={put} checked={checked} />;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span>{s.text}</span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: DQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeSevenData() {
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
    <p className="text-sm font-semibold text-success">Kelas 7, Bab 6</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Data dan Diagram</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Rumuskan pertanyaan, kumpulkan dan kelompokkan data, lalu sajikan dan baca line plot, diagram batang, diagram garis, dan diagram lingkaran dengan teliti.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-44"><BarChart b={quota} compact label="Contoh diagram batang" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Berapa panjang nama di kelasmu?</h2>
        <p className="mt-2 text-sm">Ada siswa dengan nama 17 kata yang tidak muat di kartu pelajar. Pertanyaan sederhana seperti ini dapat dijawab dengan mengumpulkan data dan menyajikannya dalam diagram.</p>
        <p className="mt-2 text-sm text-base-content/60">{totalSections} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-diagram">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-diagram" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<DQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 6"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <MathText text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt + q.answer} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
