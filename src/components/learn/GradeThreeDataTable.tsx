"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, RotateCcw, Shuffle, Undo2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { ThingIcon as BaseIcon } from "./GradeOneCounting10Art";
import { ThingIcon as BeadIcon } from "./GradeThreeWhole1000Art";
import {
  assessment, cells, correct, formatAnswer, frequency, lettersOf, practice, ready, SEP, splitParts, thingName, topics,
  type DQuestion, type Part, type Scene, type Thing,
} from "@/data/grade-three-data-table";

function Icon({ thing, className = "size-8", alt = false }: { thing: Thing; className?: string; alt?: boolean }) {
  return thing === "manik" ? <BeadIcon thing="manik" className={className} /> : <BaseIcon thing={thing} className={className} alt={alt} />;
}

/* ====================================================================== */
/* Turus                                                                   */
/* ====================================================================== */
/** Turus: kelompok lima, garis kelima miring. `stick` menggambar lidi. */
export function Tally({ n, h = 28, stick = false, label }: { n: number; h?: number; stick?: boolean; label?: string }) {
  const groups = Math.floor(n / 5), rest = n % 5, gw = 26, gap = 8, w = Math.max(1, groups * (gw + gap) + rest * 6 + 4);
  const col = stick ? "#d6a53a" : "#2b2320", sw = stick ? 3.4 : 2;
  const line = (x: number, k: string) => <path key={k} d={`M${x} 3V25`} stroke={col} strokeWidth={sw} strokeLinecap="round" />;
  return <svg viewBox={`0 0 ${w} 28`} height={h} width={(w * h) / 28} role="img" aria-label={label ?? `${n} turus`}>
    {Array.from({ length: groups }, (_, g) => { const x0 = 3 + g * (gw + gap); return <g key={g}>{[0, 1, 2, 3].map(i => line(x0 + i * 6, `${g}-${i}`))}<path d={`M${x0 - 3} 21L${x0 + 21} 7`} stroke={stick ? "#b9822a" : "#2b2320"} strokeWidth={sw} strokeLinecap="round" /></g>; })}
    {Array.from({ length: rest }, (_, i) => line(3 + groups * (gw + gap) + i * 6, `r${i}`))}
  </svg>;
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function Box({ value, onChange, label, disabled = false, small = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; small?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className={`${small ? "h-9 w-12 text-xl" : "h-11 w-14 text-2xl"} rounded-xl border-2 border-orange-400 bg-white text-center font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function TallyInput({ value, set, label, disabled }: { value: number; set: (n: number) => void; label: string; disabled?: boolean }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1.5">
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={disabled || value <= 0} onClick={() => set(value - 1)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="grid h-8 min-w-12 place-items-center rounded-lg border-2 border-dashed border-orange-300 bg-white px-1">{value ? <Tally n={value} h={22} /> : <span className="text-xs text-base-content/40">kosong</span>}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={disabled || value >= 20} onClick={() => set(value + 1)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
const Card = ({ v, on, dim }: { v: number | string; on?: boolean; dim?: boolean }) => <span className={`grid h-9 w-8 place-items-center rounded-lg border-2 text-lg font-extrabold sm:h-11 sm:w-10 sm:text-xl ${on ? "border-success bg-success text-white" : "border-amber-300 bg-amber-50"} ${dim ? "opacity-30" : ""}`}>{v}</span>;
/** Orang kecil untuk anggota keluarga. */
function Person({ className = "size-4" }: { className?: string }) {
  return <svg viewBox="0 0 16 20" className={className} aria-hidden="true"><circle cx="8" cy="5" r="3.6" fill="#f2c08f" stroke="#2b2320" strokeWidth=".8" /><path d="M2 19c0-5 2.6-8 6-8s6 3 6 8z" fill="#208f6d" stroke="#2b2320" strokeWidth=".8" /></svg>;
}

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
const familySets: Record<string, number>[] = [{ Ani: 5, Budi: 3, Cici: 7, Dedi: 4, Eka: 3, Fani: 6 }, { Gita: 4, Hadi: 6, Intan: 2, Joko: 5, Kiki: 6, Lani: 8 }];
function SortLab() {
  const [k, setK] = useState(0), [seq, setSeq] = useState<string[]>([]), [miss, setMiss] = useState<string | null>(null);
  const data = familySets[k], names = Object.keys(data), sorted = [...names].sort((a, b) => data[a] - data[b]);
  const val = (n: string) => data[n];
  const next = sorted.filter(n => !seq.includes(n)).map(val)[0];
  const done = seq.length === names.length, vals = names.map(val), min = Math.min(...vals), max = Math.max(...vals);
  const same = [...frequency(vals)].filter(([, c]) => c > 1).map(([v]) => names.filter(n => String(val(n)) === v).join(" dan "));
  return <div className="space-y-3">
    <p className="text-sm font-semibold">Ketuk anak yang anggota keluarganya paling sedikit, lalu berikutnya.</p>
    <div className={`grid grid-cols-3 gap-2 rounded-xl bg-base-100 p-2 sm:p-3 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.1]`}>{names.map(n => <button key={n} type="button" aria-label={`Kartu ${n}`} disabled={seq.includes(n)} onClick={() => { if (val(n) === next) { setSeq([...seq, n]); setMiss(null); } else setMiss(n); }}
      className={`flex flex-col items-center rounded-xl border-2 p-1.5 disabled:opacity-25 ${miss === n ? "border-error bg-error/5" : "border-amber-300 bg-amber-50"}`}>
      <span className="text-sm font-bold">{n}</span><span className="flex max-w-20 flex-wrap justify-center">{Array.from({ length: val(n) }, (_, i) => <Person key={i} />)}</span><span className="text-2xl font-extrabold">{val(n)}</span></button>)}</div>
    <div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-semibold">Urutan:</span>{names.map((_, i) => <span key={i} className="grid h-10 min-w-10 place-items-center rounded-lg border-2 border-dashed border-orange-300 bg-white px-1 text-lg font-extrabold">{seq[i] ? val(seq[i]) : ""}</span>)}</div>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!seq.length} onClick={() => { setSeq([]); setMiss(null); }}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => { setK((k + 1) % familySets.length); setSeq([]); setMiss(null); }}><Shuffle className="size-4" aria-hidden="true" />Kelompok lain</button></div>
    <Result value={done ? "selesai" : String(seq.length)}>{done ? <>Urutannya {sorted.map(val).join(", ")}. Terkecil <strong>{min}</strong> ({sorted[0]}), terbesar <strong>{max}</strong> ({sorted.at(-1)}).{same.length ? ` Sama banyak: ${same.join("; ")}.` : ""}</> : miss ? `${miss} punya ${val(miss)}. Masih ada yang lebih sedikit.` : `Cari yang paling sedikit di antara kartu yang tersisa.`}</Result>
  </div>;
}
const scoreSets = [[9, 9, 7, 8, 6, 10, 5, 9, 8, 7, 7, 9, 6, 6, 6, 8, 9, 10, 7, 7], [8, 6, 9, 7, 7, 10, 4, 8, 9, 8, 6, 7, 9, 8, 5, 8, 7, 9, 10, 8]];
function RangeLab() {
  const [k, setK] = useState(0), [sorted, setSorted] = useState(false), [pick, setPick] = useState<number | null>(null);
  const data = scoreSets[k], shown = sorted ? [...data].sort((a, b) => a - b) : data, min = Math.min(...data), max = Math.max(...data);
  const kinds = [...new Set(data)].sort((a, b) => a - b), count = pick === null ? 0 : data.filter(v => v === pick).length;
  return <div className="space-y-3">
    <div className={`flex flex-wrap justify-center gap-1 rounded-xl bg-base-100 p-2 sm:p-3 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.15]`} role="img" aria-label={`Nilai ${shown.join(", ")}`}>{shown.map((v, i) => <Card key={i} v={v} on={pick === v} />)}</div>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-success" aria-pressed={sorted} onClick={() => setSorted(!sorted)}>{sorted ? "Kembalikan acak" : "Urutkan dari terkecil"}</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => { setK((k + 1) % scoreSets.length); setPick(null); setSorted(false); }}><Shuffle className="size-4" aria-hidden="true" />Kelas lain</button></div>
    <div role="group" aria-label="Pilih nilai" className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-semibold">Hitung nilai:</span>{kinds.map(v => <button key={v} type="button" aria-pressed={pick === v} onClick={() => setPick(v)} className={`btn btn-sm w-11 text-lg ${pick === v ? "btn-success" : "btn-outline"}`}>{v}</button>)}</div>
    <p className="text-lg font-bold">Jangkauan = {max} − {min} = {max - min}</p>
    <Result value={pick === null ? `j${max - min}` : `${pick}:${count}`}>{pick === null ? `Terbesar ${max}, terkecil ${min}. Ada ${kinds.length} macam nilai: ${kinds.join(", ")}.` : <>Ada <strong>{count} siswa</strong> yang mendapat nilai {pick}.</>}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
function TallyLab() {
  const [n, setN] = useState(4);
  const groups = Math.floor(n / 5), rest = n % 5;
  return <div className="space-y-3">
    <div className={`grid min-h-28 place-items-center rounded-xl bg-amber-50 p-3 [@media(max-height:700px)]:min-h-20 lg:[zoom:1.3]`}>{n ? <Tally n={n} h={56} stick label={`${n} lidi`} /> : <span className="text-sm text-base-content/50">Belum ada lidi.</span>}</div>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn btn-success gap-1" disabled={n >= 20} onClick={() => setN(n + 1)}><Plus className="size-4" aria-hidden="true" />Tambah lidi</button>
      <button type="button" className="btn btn-outline gap-1" disabled={n <= 0} onClick={() => setN(n - 1)}><Minus className="size-4" aria-hidden="true" />Ambil lidi</button>
      <span className="text-4xl font-extrabold text-success">{n}</span>
    </div>
    <Result value={String(n)}>{n === 0 ? "Tambah lidi untuk mulai." : <>{groups > 0 ? `${groups} kelompok lima` : ""}{groups && rest ? " dan " : ""}{rest ? `${rest} lidi tegak` : ""}: {Array(groups).fill(5).concat(rest ? [rest] : []).join(" + ")} = <strong>{n}</strong>.{rest === 4 ? " Lidi berikutnya dipasang miring." : ""}</>}</Result>
  </div>;
}
const tableSets: { name: string; items: string[]; head: string }[] = [
  { name: "Kata SELAMAT PAGI", items: lettersOf("SELAMATPAGI"), head: "Huruf" },
  { name: "Manik merah 10 anak", items: ["2", "4", "3", "3", "5", "2", "3", "4", "3", "1"], head: "Manik merah" },
];
function TableLab() {
  const [k, setK] = useState(0), [done, setDone] = useState<number[]>([]);
  const set = tableSets[k], rows = [...frequency(set.items).keys()], ordered = k === 1 ? [...rows].sort((a, b) => Number(a) - Number(b)) : rows;
  const tally = (r: string) => done.filter(i => set.items[i] === r).length;
  const all = done.length === set.items.length, f = frequency(set.items), mx = Math.max(...f.values()), mn = Math.min(...f.values());
  return <div className="space-y-3">
    <p className="text-sm font-semibold">{set.name}. Ketuk setiap {k ? "kartu anak" : "huruf"} satu per satu.</p>
    <div className={`flex flex-wrap justify-center gap-1 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.85] lg:[zoom:1.1]`}>{set.items.map((it, i) => <button key={i} type="button" aria-label={`${k ? "Anak" : "Huruf"} ${i + 1}: ${it}`} disabled={done.includes(i)} onClick={() => setDone([...done, i])}
      className={`grid h-9 w-8 place-items-center rounded-lg border-2 text-lg font-extrabold disabled:opacity-25 sm:h-11 sm:w-10 sm:text-xl ${k ? "border-rose-300 bg-rose-50" : "border-sky-300 bg-sky-50"}`}>{it}</button>)}</div>
    <table className={`w-full max-w-sm overflow-hidden rounded-xl border-2 border-violet-300 bg-white text-center [@media(max-height:700px)]:text-sm [@media(max-height:700px)]:[zoom:0.85]`}>
      <thead className="bg-violet-200 text-sm"><tr><th className="py-0.5">{set.head}</th><th>Turus</th><th>Banyak</th></tr></thead>
      <tbody>{ordered.map(r => <tr key={r} className="border-t border-violet-100"><td className="font-extrabold">{r}</td><td className="h-7">{tally(r) ? <Tally n={tally(r)} h={18} /> : null}</td><td className="font-extrabold">{all ? tally(r) : ""}</td></tr>)}</tbody>
    </table>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!done.length} onClick={() => setDone([])}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => { setK((k + 1) % tableSets.length); setDone([]); }}><Shuffle className="size-4" aria-hidden="true" />Data lain</button></div>
    <Result value={all ? "lengkap" : String(done.length)}>{all ? <>Tabel lengkap. Paling banyak: <strong>{ordered.filter(r => f.get(r) === mx).join(", ")}</strong> ({mx}). Paling sedikit: {ordered.filter(r => f.get(r) === mn).join(", ")} ({mn}).</> : `Sudah ${done.length} dari ${set.items.length}. Setiap ketukan menambah satu turus.`}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { sort: SortLab, range: RangeLab, tally: TallyLab, table: TableLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
const spots = [[8, 12, -12], [34, 6, 8], [60, 14, -4], [84, 8, 14], [16, 40, 6], [44, 36, -10], [70, 42, 4], [92, 34, -8], [6, 70, 10], [30, 66, -6], [56, 72, 12], [80, 66, -14], [18, 92, -4], [44, 94, 6], [68, 92, -10], [90, 88, 4], [4, 50, -2], [96, 60, 8], [26, 20, 16], [76, 20, -12]];
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "cards": return <figure className="flex flex-col items-center gap-1"><figcaption className="text-sm font-bold">{scene.caption}</figcaption><div className="flex max-w-md flex-wrap justify-center gap-1">{scene.values.map((v, i) => <Card key={i} v={v} />)}</div></figure>;
    case "tallyTable": return <table className="overflow-hidden rounded-xl border-2 border-violet-300 bg-white text-center"><thead className="bg-violet-200 text-sm"><tr>{scene.head.map(h => <th key={h} className="px-2 py-0.5">{h}</th>)}</tr></thead>
      <tbody>{scene.rows.map(r => <tr key={r.label} className="border-t border-violet-100"><td className="px-2 font-extrabold">{r.label}</td><td className="px-2 py-0.5"><Tally n={r.n} h={22} /></td><td className="px-2 text-lg font-extrabold">{r.showCount ? r.n : ""}</td></tr>)}</tbody></table>;
    case "story": return <div className="flex flex-wrap justify-center gap-3">{scene.items.map(it => <div key={it.name} className="flex flex-col items-center"><span className="relative"><Icon thing={it.thing} className="size-10" /><span className="absolute -end-3 -top-1.5 rounded-full bg-success px-1.5 text-base font-extrabold text-white">{it.n}</span></span><span className="text-sm font-bold">{it.name}</span></div>)}</div>;
    case "objects": { let k = 0; return <div className="relative h-44 w-full max-w-xs rounded-xl border-2 border-rose-200 bg-white" role="img" aria-label={scene.items.map(i => `${i.n} ${thingName[i.thing]}`).join(", ")}>
      {scene.items.flatMap(it => Array.from({ length: it.n }, () => { const [x, y, r] = spots[k++ % spots.length]; return <span key={k} className="absolute" style={{ left: `${x * 0.86}%`, top: `${y * 0.8}%`, transform: `rotate(${r}deg)` }}><Icon thing={it.thing} className="size-8" /></span>; }))}
    </div>; }
    case "letters": return <div className="grid grid-cols-9 gap-1 rounded-xl border-2 border-rose-200 bg-white p-2 font-mono text-xl font-bold" role="img" aria-label={`Kotak huruf: ${scene.text}`}>{scene.text.split(" ").map((c, i) => <span key={i} className="grid size-7 place-items-center">{c}</span>)}</div>;
    case "word": return <div className="flex flex-wrap justify-center gap-1" role="img" aria-label={`Kata ${scene.word}`}>{scene.word.split("").map((c, i) => <span key={i} className="grid h-10 w-8 place-items-center rounded-md border-2 border-sky-300 bg-sky-50 text-xl font-extrabold">{c}</span>)}</div>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      // Tanda baca setelah kotak ikut menempel pada kotak agar tidak turun ke awal baris.
      const lead = (k: number) => (k > 0 && /^[,.]/.test(bits[k]) ? bits[k][0] : ""), body = (k: number) => (lead(k) ? bits[k].slice(1) : bits[k]).trim();
      return <p className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xl font-bold leading-10 [@media(max-height:700px)]:gap-y-1 [@media(max-height:700px)]:text-lg [@media(max-height:700px)]:leading-8">{bits.map((_, k) => <span key={k} className="contents">{body(k) && <span>{body(k)}</span>}{k < bits.length - 1 && <span className="inline-flex items-end"><Box label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} />{lead(k + 1)}</span>}</span>)}</p>; }
    case "choice": return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-x-2 gap-y-1.5"><p className="text-lg font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`min-h-10 rounded-2xl border-4 px-3 text-lg font-bold [@media(max-height:700px)]:min-h-8 [@media(max-height:700px)]:px-2.5 [@media(max-height:700px)]:text-base ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
    case "multi": { const on = value ? value.split("|") : [];
      return <div role="group" aria-label={p.label} className="space-y-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1.5"><p className="text-lg font-bold">{p.label}</p>
        <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-pressed={on.includes(op)} disabled={checked} onClick={() => set((on.includes(op) ? on.filter(o => o !== op) : [...on, op]).join("|"))} className={`min-h-10 min-w-11 rounded-full border-4 px-3 text-lg font-extrabold [@media(max-height:700px)]:min-h-8 [@media(max-height:700px)]:text-base ${on.includes(op) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>
        <p className={`text-xs text-base-content/60 [@media(max-height:700px)]:hidden`}>Boleh lebih dari satu. Ketuk lagi untuk membatalkan.</p></div>; }
    case "rank": { const seq = value ? value.split("|").map(Number) : [];
      return <div className="space-y-1.5"><p className={`text-lg font-bold [@media(max-height:700px)]:text-base`}>{p.label}</p>
        <div role="group" aria-label={p.label} className="flex flex-wrap gap-1.5">{p.items.map((it, k) => <button key={k} type="button" aria-label={`Pilih ${k + 1}: ${it.label}`} disabled={checked || seq.includes(k)} onClick={() => set([...seq, k].join("|"))} className={`btn btn-outline min-w-11 px-2.5 text-lg [@media(max-height:700px)]:btn-sm [@media(max-height:700px)]:text-base`}>{it.label}</button>)}</div>
        <div className="flex flex-wrap items-center gap-1">{p.items.map((_, k) => <span key={k} className="grid h-9 min-w-9 place-items-center rounded-lg border-2 border-dashed border-orange-300 bg-white px-1.5 text-base font-extrabold">{seq[k] !== undefined ? p.items[seq[k]].label : k + 1}</span>)}
          <button type="button" className="btn btn-ghost btn-sm gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join("|"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div>
      </div>; }
    case "tally": return <div className="flex flex-wrap items-center gap-2 text-lg font-bold">{p.label}<TallyInput label="Turus" value={Number(value || 0)} set={n => set(n ? String(n) : "")} disabled={checked} /></div>;
    case "table": { const t = p.rows.filter(r => r.tally);
      return <table className="overflow-hidden rounded-xl border-2 border-violet-300 bg-white text-center">
        <thead className="bg-violet-200 text-sm"><tr>{p.head.filter((_, hi) => !(p.noTally && hi === 1)).map(h => <th key={h} className="px-2 py-0.5">{h}</th>)}</tr></thead>
        <tbody>{p.rows.map((r, ri) => { const ti = t.indexOf(r), ci = p.rows.filter(rr => rr.count).indexOf(r);
          return <tr key={ri} className="border-t border-violet-100"><td className="px-2 text-lg font-extrabold">{r.label}</td>
            {!p.noTally && <td className="px-1.5 py-0.5">{ti >= 0 ? <TallyInput label={`Turus ${r.label}`} value={Number(x[ti] || 0)} set={n => put(ti, n ? String(n) : "")} disabled={checked} /> : <Tally n={r.n} h={22} />}</td>}
            <td className="px-1.5 py-0.5">{ci >= 0 ? <Box small label={`Banyak ${r.label}`} value={x[t.length + ci]} onChange={v => put(t.length + ci, v)} disabled={checked} /> : <span className="text-lg font-extrabold">{r.n}</span>}</td></tr>; })}</tbody>
      </table>; }
  }
}
function Answer({ q, value, record, checked }: { q: DQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className={`space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.78]`}>{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeThreeDataTable() {
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
    <h1 className="text-3xl font-extrabold sm:text-5xl">Penyajian Data dalam Tabel</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Urutkan data, cari data terkecil, terbesar, dan jangkauannya, lalu catat data dengan turus dan sajikan dalam tabel.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true"><Tally n={8} h={40} stick /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Pemilihan ketua kelas</h2>
        <p className="mt-2 text-sm">Setiap siswa memilih satu calon ketua kelas. Suara dicatat dengan turus di papan tulis. Siapa yang suaranya paling banyak? Ayo belajar mengurutkan dan menyajikan data.</p>
        <p className="mt-2 text-sm text-base-content/60">4 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-data-tabel">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-data-tabel" ref={area} className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<DQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 5"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className={`flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2.5 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.62]`}><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
