"use client";

import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Delete, Minus, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { LineChart, Money, ThingCard } from "./GradeFiveMillionArt";
import {
  assessment, cells, correct, digitsOf, fmt, formatAnswer, money, places, practice, ready, SEP, splitParts, topics, units, words, wordTiles,
  type MQuestion, type Part, type Scene,
} from "@/data/grade-five-million";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, size = "lg" }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; size?: "lg" | "sm" | "digit" }) {
  const max = size === "digit" ? 1 : size === "sm" ? 2 : 7;
  return <input aria-label={label} inputMode="numeric" value={size === "lg" && value ? fmt(Number(value)) : value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, max))}
    className={`h-10 ${size === "lg" ? "w-32" : size === "sm" ? "w-11" : "w-10"} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
const short = ["RR", "PR", "Rb", "R", "P", "S"];
function PlaceHead() {
  return <thead><tr className="bg-info/15">{places.map(p => <th key={p} className="border border-base-300 px-0.5 py-1 text-[11px] leading-tight sm:text-xs">{p}</th>)}</tr></thead>;
}

/* ====================================================================== */
/* Lab A: kolom nilai tempat                                               */
/* ====================================================================== */
function PlaceLab() {
  const [d, setD] = useState([7, 2, 0, 7, 3, 6]);
  const [sel, setSel] = useState(1);
  const n = d.reduce((a, x, i) => a + x * units[i], 0);
  const bump = (i: number, k: number) => setD(x => x.map((y, j) => (j === i ? (y + k + 10) % 10 : y)));
  return <div className="space-y-3">
    <p className="text-center text-4xl font-extrabold tracking-wide" aria-label={`Bilangan ${fmt(n)}`}>{d.map((x, i) => <span key={i}>{i === 3 && "."}<span className={i === sel ? "rounded bg-warning/40 px-0.5" : ""}>{x}</span></span>)}</p>
    <div className="grid grid-cols-6 gap-1">{d.map((x, i) => <div key={i} className={`flex flex-col items-center rounded-lg border-2 p-1 ${i === sel ? "border-warning bg-warning/10" : "border-base-300 bg-base-100"}`}>
      <button type="button" aria-label={`${places[i]} tambah`} className="btn btn-xs btn-ghost px-1" onClick={() => bump(i, 1)}><ChevronUp className="size-4" aria-hidden="true" /></button>
      <button type="button" aria-label={`Pilih ${places[i]}`} aria-pressed={i === sel} onClick={() => setSel(i)} className="w-full text-center"><span className="block text-2xl font-extrabold">{x}</span><span className="block text-[10px] font-bold leading-tight text-base-content/70 sm:text-xs">{short[i]}</span></button>
      <button type="button" aria-label={`${places[i]} kurangi`} className="btn btn-xs btn-ghost px-1" onClick={() => bump(i, -1)}><ChevronDown className="size-4" aria-hidden="true" /></button>
    </div>)}</div>
    <p className="text-xs text-base-content/60">RR ratus ribuan, PR puluh ribuan, Rb ribuan, R ratusan, P puluhan, S satuan.</p>
    <Result value={`${n}|${sel}`}><strong>{fmt(n)}</strong> dibaca <strong>{words(n)}</strong>.<br />Angka {d[sel]} menempati <strong>{places[sel].toLowerCase()}</strong> dan bernilai {d[sel]} × {fmt(units[sel])} = <strong>{fmt(d[sel] * units[sel])}</strong>.</Result>
  </div>;
}

/* ====================================================================== */
/* Lab B: membandingkan kolom demi kolom                                   */
/* ====================================================================== */
const pairs: [number, number][] = [[599198, 599047], [720736, 702736], [342231, 432543], [126789, 126789]];
function CompareLab() {
  const [k, setK] = useState(0);
  const [col, setCol] = useState(0);
  const [a, b] = pairs[k], da = digitsOf(a), db = digitsOf(b);
  const diff = da.findIndex((x, i) => x !== db[i]), done = diff < 0 ? col >= 6 : col > diff;
  const sign = a > b ? ">" : a < b ? "<" : "=";
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Pasangan bilangan" className="flex flex-wrap gap-1.5">{pairs.map(([x, y], i) => <button key={i} type="button" role="radio" aria-checked={k === i} onClick={() => { setK(i); setCol(0); }} className={`btn btn-xs h-auto min-h-7 ${k === i ? "btn-success" : "btn-outline"}`}>{fmt(x)} dan {fmt(y)}</button>)}</div>
    <table className="w-full table-fixed border-collapse bg-base-100 text-center"><PlaceHead />
      <tbody>{[da, db].map((row, r) => <tr key={r}>{row.map((x, i) => <td key={i} className={`border border-base-300 py-2 text-2xl font-extrabold ${i < col ? (i === diff ? "bg-warning/40" : "bg-success/15") : ""}`}>{x}</td>)}</tr>)}</tbody></table>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-success gap-1" disabled={done} onClick={() => setCol(c => c + 1)}>Bandingkan kolom berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!col} onClick={() => setCol(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    </div>
    <Result value={done ? sign : ""}>{!col ? "Mulai dari kolom paling kiri, ratus ribuan." : done ? (diff < 0 ? <>Semua angka sama, jadi <strong>{fmt(a)} = {fmt(b)}</strong>.</> : <>Angka pertama yang berbeda ada di {places[diff].toLowerCase()}: {da[diff]} {sign} {db[diff]}. Jadi <strong>{fmt(a)} {sign} {fmt(b)}</strong>.</>)
      : <>{places[col - 1]}: {da[col - 1]} dan {db[col - 1]} sama. Lanjut ke kolom berikutnya.</>}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab C: dompet uang                                                      */
/* ====================================================================== */
function WalletLab() {
  const [c, setC] = useState<number[]>([3, 0, 2, 0, 1, 0, 0, 1, 0]);
  const total = c.reduce((a, x, i) => a + x * money[i], 0), d = digitsOf(total);
  return <div className="space-y-3">
    <div className="grid grid-cols-1 gap-1.5 min-[400px]:grid-cols-2">{money.map((m, i) => <div key={m} className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 p-1.5">
      <Money value={m} size={0.8} /><span className="w-6 text-center font-extrabold">{c[i]}</span>
      <span className="ms-auto flex gap-1">
        <button type="button" aria-label={`Kurangi ${fmt(m)}`} className="btn btn-xs btn-outline btn-square" disabled={!c[i]} onClick={() => setC(x => x.map((y, j) => (j === i ? y - 1 : y)))}><Minus className="size-3.5" aria-hidden="true" /></button>
        <button type="button" aria-label={`Tambah ${fmt(m)}`} className="btn btn-xs btn-outline btn-square" disabled={c[i] >= 9 || total + m > 1000000} onClick={() => setC(x => x.map((y, j) => (j === i ? y + 1 : y)))}><Plus className="size-3.5" aria-hidden="true" /></button>
      </span></div>)}</div>
    <table className="w-full table-fixed border-collapse bg-base-100 text-center"><PlaceHead /><tbody><tr>{d.map((x, i) => <td key={i} className="border border-base-300 py-2 text-xl font-extrabold">{total >= 1000000 && i === 0 ? "10" : x}</td>)}</tr></tbody></table>
    <Result value={String(total)}>Jumlah uang <strong>Rp{fmt(total)},00</strong>, dibaca {words(total)} rupiah.<br />Bentuk panjang: {d.map((x, i) => fmt(x * units[i])).filter(s => s !== "0").join(" + ") || "0"}.</Result>
  </div>;
}
const labs = [PlaceLab, CompareLab, WalletLab];

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "things": return <div className="flex flex-wrap justify-center gap-2">{scene.items.map(it => <ThingCard key={it.label} {...it} />)}</div>;
    case "wallet": return <div className="flex w-full flex-wrap justify-center gap-3">{scene.groups.map((g, k) => <figure key={k} className="rounded-xl bg-base-100 p-2">
      {g.name && <figcaption className="mb-1 text-center text-sm font-extrabold">{g.name}</figcaption>}
      <ul className="space-y-1">{g.notes.map(([v, n]) => <li key={v} className="flex items-center gap-2"><Money value={v} size={0.85} /><span className="text-sm font-bold">× {n} lembar</span></li>)}</ul></figure>)}</div>;
    case "line": return <LineChart {...scene} />;
    case "text": return <div className="space-y-1 rounded-lg bg-base-100 px-4 py-2 text-center text-lg font-bold">{scene.lines.map(l => <p key={l}>{l}</p>)}</div>;
    case "big": return <p className="rounded-lg bg-base-100 px-4 py-2 text-center text-2xl font-extrabold sm:text-3xl">{scene.text}</p>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function WordBuilder({ value, set, checked, label }: { value: string; set: (v: string) => void; checked: boolean; label: string }) {
  const w = value ? value.split(" ") : [];
  return <div className="space-y-2">
    <p className="text-sm font-bold">{label}</p>
    <p aria-label="Bacaan yang disusun" className="min-h-11 rounded-lg border-2 border-dashed border-orange-300 bg-white p-2 text-base font-bold">{value || <span className="text-base-content/40">Ketuk kartu kata di bawah.</span>}</p>
    <div role="group" aria-label="Kartu kata" className="flex flex-wrap gap-1.5">{wordTiles.map(t => <button key={t} type="button" disabled={checked} onClick={() => set([...w, t].join(" "))} className="btn btn-sm btn-outline normal-case">{t}</button>)}</div>
    <div className="flex gap-2">
      <button type="button" className="btn btn-xs btn-ghost gap-1" disabled={checked || !w.length} onClick={() => set(w.slice(0, -1).join(" "))}><Delete className="size-3.5" aria-hidden="true" />Hapus kata terakhir</button>
      <button type="button" className="btn btn-xs btn-ghost gap-1" disabled={checked || !w.length} onClick={() => set("")}><RotateCcw className="size-3.5" aria-hidden="true" />Kosongkan</button>
    </div>
  </div>;
}
function DigitCards({ p, value, set, checked }: { p: Extract<Part, { kind: "cards" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const used = (x: number) => value.split("").filter(c => c === String(x)).length;
  const nth = (i: number) => p.digits.slice(0, i).filter(y => y === p.digits[i]).length;
  return <div role="group" aria-label={p.label} className="space-y-2">
    <p className="text-sm font-bold">{p.label}</p>
    <div className="flex gap-1" aria-label="Kotak bilangan">{Array.from({ length: p.digits.length }, (_, i) => <span key={i} className="flex items-center">{i === 3 && <span className="px-0.5 font-extrabold">.</span>}<span className="grid h-11 w-9 place-items-center rounded-md border-2 border-orange-300 bg-white text-xl font-extrabold">{value[i] ?? ""}</span></span>)}</div>
    <div className="flex flex-wrap gap-1.5">{p.digits.map((x, i) => { const avail = nth(i) >= used(x);
      return <button key={i} type="button" aria-label={`Kartu ${x}`} disabled={checked || !avail} onClick={() => set(value + x)} className="h-11 w-10 rounded-lg border-2 border-orange-400 bg-orange-50 text-xl font-extrabold shadow-sm disabled:opacity-30">{x}</button>; })}
      <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={checked || !value} onClick={() => set(value.slice(0, -1))}><Undo2 className="size-4" aria-hidden="true" />Batal</button></div>
  </div>;
}
function Payment({ p, x, put, checked }: { p: Extract<Part, { kind: "payment" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  const n = p.denoms.length;
  return <div className="space-y-2">
    <p className="text-sm">Isi banyak lembar atau keping pada setiap cara. Kotak kosong berarti 0. Persediaan uang tertulis di bawah gambarnya.</p>
    {Array.from({ length: p.ways }, (_, r) => { const s = p.denoms.reduce((a, d, k) => a + (Number(x[r * n + k]) || 0) * d, 0);
      return <fieldset key={r} className="rounded-lg border border-base-300 p-2">
        <legend className="px-1 text-sm font-bold">Cara {r + 1}</legend>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">{p.denoms.map((d, k) => <label key={d} className="flex flex-col items-center gap-0.5 rounded-md bg-base-100 p-1 text-[11px] font-semibold">
          <Money value={d} size={0.62} />ada {p.stock[k]}
          <Box size="digit" label={`Cara ${r + 1} uang ${fmt(d)}`} value={x[r * n + k]} onChange={v => put(r * n + k, v)} disabled={checked} /></label>)}</div>
        <p className={`mt-1 text-right text-sm font-bold ${s === p.price ? "text-success" : ""}`}>Jumlah: Rp{fmt(s)}</p>
      </fieldset>; })}
    <p className="text-xs text-base-content/60">Harga yang harus dibayar: Rp{fmt(p.price)},00. Setiap cara harus berbeda.</p>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 text-lg font-bold">{p.label}<Box label={p.label} value={value} onChange={set} disabled={checked} /></label>;
    case "items": return <div className="space-y-2">{p.items.map((it, k) => <label key={it.label} className="flex flex-wrap items-center gap-2 font-bold">{it.label}<Box label={it.label} value={x[k]} onChange={v => put(k, v)} disabled={checked} /></label>)}</div>;
    case "words": return <WordBuilder value={value} set={set} checked={checked} label={p.label} />;
    case "place": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.label}><p className="mb-1 text-sm font-bold">{r.label}</p>
      <table className="w-full table-fixed border-collapse text-center"><PlaceHead /><tbody><tr>{places.map((pl, j) => <td key={pl} className="border border-base-300 p-1"><Box size="digit" label={`${r.label} ${pl}`} value={x[6 * k + j]} onChange={v => put(6 * k + j, v)} disabled={checked} /></td>)}</tr></tbody></table></div>)}</div>;
    case "placeName": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="group" aria-label={r.text} className="rounded-lg border border-base-300 p-2">
      <p className="mb-1 text-sm font-bold">{r.text}</p>
      <div className="flex flex-wrap gap-1">{places.map(o => <button key={o} type="button" disabled={checked} aria-pressed={x[k] === o} onClick={() => put(k, o)} className={`btn btn-xs h-8 ${x[k] === o ? on : "btn-outline"}`}>{o}</button>)}</div></div>)}</div>;
    case "signs": return <div className="space-y-2">{p.pairs.map(([a, b], k) => <div key={k} role="group" aria-label={`Pasangan ${k + 1}`} className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-base-300 p-2 text-lg font-extrabold">
      <span className="w-24 text-right">{fmt(a)}</span>
      <span className="join">{(["<", "=", ">"] as const).map(s => <button key={s} type="button" disabled={checked} aria-pressed={x[k] === s} aria-label={s === "<" ? "kurang dari" : s === ">" ? "lebih dari" : "sama dengan"} onClick={() => put(k, s)} className={`btn join-item btn-sm w-10 text-lg ${x[k] === s ? on : "btn-outline"}`}>{s}</button>)}</span>
      <span className="w-24">{fmt(b)}</span></div>)}</div>;
    case "order": { const seq = value ? value.split(";") : [];
      return <div className="space-y-2"><p className="text-sm font-bold">{p.label}: ketuk berurutan</p>
        <ol className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border-2 border-dashed border-orange-300 p-1.5" aria-label="Urutan yang dipilih">{seq.map((s, k) => <li key={s} className="badge badge-success badge-lg gap-1">{k + 1}. {s}</li>)}</ol>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" disabled={checked || seq.includes(o)} onClick={() => set([...seq, o].join(";"))} className="btn btn-sm btn-outline">{o}</button>)}
          <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join(";"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div></div>; }
    case "seq": { let k = 0;
      return <div className="space-y-2">{p.rows.map((row, r) => <div key={r} className="flex flex-wrap items-center gap-2 font-bold"><span className="me-1 text-sm">{String.fromCharCode(97 + r)}.</span>
        {row.map((v, j) => { if (v !== null) return <span key={j} className="rounded-md bg-base-100 px-2 py-2 text-base ring-1 ring-base-300">{fmt(v)}</span>; const idx = k++;
          return <Box key={j} label={`Barisan ${String.fromCharCode(97 + r)} kotak ${j + 1}`} value={x[idx]} onChange={val => put(idx, val)} disabled={checked} />; })}</div>)}</div>; }
    case "expand": return <div className="flex flex-wrap items-center gap-1.5 text-lg font-extrabold"><span>{fmt(p.n)} =</span>
      {places.map((pl, j) => <span key={pl} className="flex items-center gap-1.5">{j > 0 && "+"}<Box label={`Nilai ${pl.toLowerCase()}`} value={x[j]} onChange={v => put(j, v)} disabled={checked} /></span>)}</div>;
    case "cards": return <DigitCards p={p} value={value} set={set} checked={checked} />;
    case "payment": return <Payment p={p} x={x} put={put} checked={checked} />;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span>{s.text}</span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: MQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeFiveMillion() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 5, Bab 9</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Bilangan Cacah sampai 1.000.000</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Baca dan tulis bilangan sampai satu juta, tentukan nilai tempatnya, bandingkan dan urutkan, lalu susun dan uraikan bilangan dengan uang.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-1"><Money value={100000} /><Money value={50000} size={0.85} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Membaca 720.736</h2>
        <p className="mt-2 text-sm">Jumlah penduduk, harga barang, dan banyak wisatawan sering ditulis dengan enam angka. Di bab ini kamu belajar membacanya dengan tepat.</p>
        <p className="mt-2 text-sm text-base-content/60">3 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-sejuta">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-sejuta" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<MQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 9"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt + q.answer} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
