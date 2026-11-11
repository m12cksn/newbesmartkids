"use client";

import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  assessment, correct, formatAnswer, idNumber, practice, ready, SEP, splitParts, topics,
  type MQuestion, type Part, type Thing,
} from "@/data/grade-three-measurement";
import { BalanceScale, DialScale, DigitalScale, RulerScene, SceneView, ThingIcon } from "./MeasurementVisuals";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const pill = "inline-flex items-center rounded-full border-2 border-[#9d4fa8]/50 bg-[#fbf7d9] px-3 py-1.5 font-bold";
/** Label pendek tampil sebagai pil seperti di buku; label panjang tampil sebagai teks di atas isian. */
const Prefix = ({ text }: { text?: string }) => !text ? null : text.length > 18 ? <p className="w-full text-sm font-bold">{text}</p> : <span className={pill}>{text}</span>;
function NumBox({ value, onChange, label, disabled = false, wide = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; wide?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…"
    onChange={e => onChange(e.target.value.replace(/[^\d.]/g, "").slice(0, 7))}
    className={`h-10 ${wide ? "w-24" : "w-16"} rounded-lg border-2 border-dashed border-neutral/40 bg-white text-center text-lg font-extrabold tabular-nums text-success focus:border-success focus:outline-none`} />;
}
function Result({ value, ok, children }: { value: string; ok: boolean; children: ReactNode }) {
  return <output data-testid="lab-result" data-value={value} aria-live="polite" className={`block rounded-lg p-3 text-sm leading-6 ${ok ? "bg-success/10" : "bg-base-100"}`}>{children}</output>;
}
function Chips<T extends string | number>({ label, items, value, onChange, text }: { label: string; items: readonly T[]; value: T; onChange: (v: T) => void; text?: (v: T) => ReactNode }) {
  return <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5"><span className="me-1 text-sm font-bold">{label}</span>
    {items.map(it => <button key={String(it)} type="button" aria-pressed={it === value} className={`btn btn-sm ${it === value ? "btn-neutral" : "btn-outline"}`} onClick={() => onChange(it)}>{text ? text(it) : String(it)}</button>)}</div>;
}
/** Coba sendiri: daftar soal kecil yang bisa diulang. */
function TryList({ items }: { items: { prompt: ReactNode; answer: number[]; units: string[]; hint: string }[] }) {
  const [i, setI] = useState(0);
  const [v, setV] = useState<string[]>([]);
  const [ok, setOk] = useState<null | boolean>(null);
  const it = items[i];
  return <div className="space-y-2 rounded-xl border border-dashed border-success/50 bg-base-100 p-3">
    <p className="text-sm font-bold text-success">Coba sendiri ({i + 1}/{items.length})</p>
    <div className="text-sm font-semibold">{it.prompt}</div>
    <div className="flex flex-wrap items-center gap-2">
      {it.units.map((u, k) => <span key={u + k} className="flex items-center gap-1"><NumBox label={`Coba ${u}`} value={v[k] ?? ""} onChange={x => { setV(o => { const n = [...o]; n[k] = x; return n; }); setOk(null); }} wide={u === "gram" || u === "cm"} /><span className="font-bold">{u}</span></span>)}
      <button type="button" className="btn btn-success btn-sm" disabled={it.units.some((_, k) => !v[k])} onClick={() => setOk(it.answer.every((a, k) => Number((v[k] ?? "").replace(/\./g, "")) === a))}>Periksa</button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setI((i + 1) % items.length); setV([]); setOk(null); }}>Soal lain</button>
    </div>
    {ok !== null && <p role="status" className="text-sm"><strong>{ok ? "Tepat!" : "Belum tepat."}</strong> {ok ? "" : it.hint}</p>}
  </div>;
}

/* ====================================================================== */
/* Lab A: penggaris                                                        */
/* ====================================================================== */
const rulerThings = { pencil: { name: "Pensil", length: 14 }, crayon: { name: "Krayon", length: 9 }, pen: { name: "Bolpoin", length: 12 }, marker: { name: "Spidol", length: 10 } } as const;
type RulerThing = keyof typeof rulerThings;
function RulerLab() {
  const [thing, setThing] = useState<RulerThing>("pencil");
  const [start, setStart] = useState(0);
  const L = rulerThings[thing].length, end = start + L;
  return <div className="space-y-4">
    <Chips label="Benda" items={Object.keys(rulerThings) as RulerThing[]} value={thing} onChange={t => { setThing(t); setStart(0); }} text={t => rulerThings[t].name} />
    <label className="block text-sm font-bold">Geser benda: ujung kiri di angka {start}
      <input type="range" aria-label="Geser benda" min={0} max={20 - L} value={start} onChange={e => setStart(Number(e.target.value))} className="range range-success range-sm mt-1 w-full" />
    </label>
    <div className="rounded-xl bg-base-100 p-3"><RulerScene max={20} objects={[{ thing, from: start, to: end }]} /></div>
    <Result value={String(L)} ok={start === 0}>
      Ujung kiri di angka <strong>{start}</strong>, ujung kanan di angka <strong>{end}</strong>.{" "}
      {start === 0 ? <>Karena dimulai dari 0, panjang {rulerThings[thing].name.toLowerCase()} langsung terbaca: <strong>{L} cm</strong>.</>
        : <>Panjangnya {end} − {start} = <strong>{L} cm</strong>. Panjang benda tidak berubah walaupun digeser.</>}
    </Result>
    <TryList items={[
      { prompt: <>Ujung krayon di angka 4 dan 13. Berapa panjang krayon?</>, answer: [9], units: ["cm"], hint: "Kurangi angka ujung kanan dengan angka ujung kiri: 13 − 4." },
      { prompt: <>Pensil diletakkan dari angka 0 sampai 17. Berapa panjangnya?</>, answer: [17], units: ["cm"], hint: "Jika dimulai dari 0, baca angka di ujung kanan." },
      { prompt: <>Bolpoin dari angka 5 sampai 16. Berapa panjangnya?</>, answer: [11], units: ["cm"], hint: "16 − 5 = …" },
    ]} />
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{([["ruler", "Penggaris", "benda kecil: pensil, buku"], ["tape", "Meteran gulung", "pintu, lemari, meja"], ["sewing", "Meteran jahit", "lingkar perut, lengan"], ["stadiometer", "Pengukur tinggi", "tinggi badan"]] as [Thing, string, string][]).map(([t, n, use]) =>
      <figure key={t} className="flex flex-col items-center rounded-lg border border-base-300 bg-base-100 p-2 text-center"><ThingIcon thing={t} className="size-12" /><figcaption className="text-xs font-bold">{n}<span className="block font-normal text-base-content/60">{use}</span></figcaption></figure>)}</div>
  </div>;
}

/* ====================================================================== */
/* Lab B: meteran (cm dan m)                                               */
/* ====================================================================== */
function MeterLab() {
  const [cm, setCm] = useState(215);
  const m = Math.floor(cm / 100), r = cm % 100;
  return <div className="space-y-4">
    <label className="block text-sm font-bold">Tarik meteran: {idNumber(cm)} cm
      <input type="range" aria-label="Tarik meteran" min={0} max={600} value={cm} onChange={e => setCm(Number(e.target.value))} className="range range-warning range-sm mt-1 w-full" />
    </label>
    <div className="rounded-xl bg-base-100 p-3" aria-hidden="true">
      <div className="relative h-10 overflow-hidden rounded border-2 border-neutral/50 bg-base-200">
        {Array.from({ length: 6 }, (_, k) => <span key={k} className={`absolute inset-y-0 border-r border-neutral/40 ${k % 2 ? "bg-yellow-300" : "bg-yellow-200"}`} style={{ left: `${k * 100 / 6}%`, width: `${Math.max(0, Math.min(100, cm - k * 100)) / 6}%` }} />)}
        {Array.from({ length: 7 }, (_, k) => <span key={`t${k}`} className="absolute bottom-0 top-0 w-px bg-neutral/60" style={{ left: `${k * 100 / 6}%` }} />)}
      </div>
      <div className="relative mt-1 h-4 text-[10px] font-bold">{Array.from({ length: 7 }, (_, k) => <span key={k} className="absolute -translate-x-1/2" style={{ left: `${k * 100 / 6}%` }}>{k * 100}</span>)}</div>
      <p className="mt-1 text-xs text-base-content/60">Setiap kotak kuning = 100 cm = 1 m.</p>
    </div>
    <div className="rounded-xl border-4 border-amber-600 bg-[#14532d] p-4 font-mono text-sm leading-7 text-white">
      <p>{idNumber(cm)} cm = {idNumber(m * 100)} cm + {r} cm</p>
      <p className="ps-[4.5ch]">= {m} m + {r} cm</p>
      <p className="ps-[4.5ch]">= <strong className="text-yellow-300">{m} m {r} cm</strong></p>
    </div>
    <Result value={`${m}|${r}`} ok={r === 0}>{r === 0 ? <>Tepat {m} meter! {idNumber(cm)} cm = {m} m.</> : <>{m} meter penuh dan sisa {r} cm.</>}</Result>
    <TryList items={[
      { prompt: <>305 cm = … m … cm</>, answer: [3, 5], units: ["m", "cm"], hint: "Ambil ratusannya: 300 cm = 3 m, sisanya 5 cm." },
      { prompt: <>4 m 20 cm = … cm</>, answer: [420], units: ["cm"], hint: "4 m = 400 cm, lalu tambah 20 cm." },
      { prompt: <>700 cm = … m</>, answer: [7], units: ["m"], hint: "Setiap 100 cm = 1 m." },
    ]} />
  </div>;
}

/* ====================================================================== */
/* Lab C: timbangan digital dan timbangan duduk                            */
/* ====================================================================== */
const goods: { thing: Thing; name: string; g: number }[] = [
  { thing: "sugar", name: "Gula", g: 1000 }, { thing: "flour", name: "Tepung", g: 250 }, { thing: "butter", name: "Mentega", g: 200 }, { thing: "egg", name: "Telur", g: 150 }, { thing: "apple", name: "Apel", g: 400 },
];
function WeightLab() {
  const [on, setOn] = useState<number[]>([0]);
  const total = on.reduce((t, i) => t + goods[i].g, 0);
  const kg = Math.floor(total / 1000), g = total % 1000;
  return <div className="space-y-4">
    <div role="group" aria-label="Benda di timbangan" className="flex flex-wrap gap-2">
      {goods.map((it, i) => { const active = on.includes(i); return <button key={it.name} type="button" aria-pressed={active} aria-label={`${active ? "Ambil" : "Taruh"} ${it.name}`}
        className={`flex flex-col items-center rounded-xl border-2 p-1.5 text-xs font-bold ${active ? "border-success bg-success/10" : "border-base-300 bg-base-100"}`} onClick={() => setOn(o => active ? o.filter(x => x !== i) : [...o, i])}>
        <ThingIcon thing={it.thing} className="size-10" />{it.name}<span className="font-normal">{idNumber(it.g)} g</span></button>; })}
    </div>
    <div className="grid items-end gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-2">
      <DigitalScale display={String(total)} thing={on.length ? goods[on[on.length - 1]].thing : "digital"} label="Timbangan digital (gram)" />
      <DialScale grams={Math.min(total, 5000)} max={5} thing={on.length ? goods[on[0]].thing : "dial"} />
    </div>
    <Result value={String(total)} ok={total > 0}>Timbangan digital: <strong>{idNumber(total)} gram</strong>. Jarum timbangan duduk menunjuk {kg} lebih {g / 100} garis kecil = <strong>{kg} kg {g} gram</strong>.</Result>
    <TryList items={[
      { prompt: <>Jarum menunjuk angka 2 lebih 5 garis. Berapa beratnya?</>, answer: [2, 500], units: ["kg", "gram"], hint: "Satu garis kecil = 100 gram. 5 garis = 500 gram." },
      { prompt: <>Jarum menunjuk angka 4 kurang 3 garis. Berapa beratnya?</>, answer: [3, 700], units: ["kg", "gram"], hint: "4 kg dikurangi 300 gram = 3 kg 700 gram." },
      { prompt: <>Timbangan menunjukkan 100 gram, lalu 600 gram setelah ditambah buah. Berapa berat buah tambahan?</>, answer: [500], units: ["gram"], hint: "Berat akhir − berat awal." },
    ]} />
  </div>;
}

/* ====================================================================== */
/* Lab D: timbangan kodok dan bandul                                        */
/* ====================================================================== */
const bobs = [{ name: "1 kg", g: 1000 }, { name: "½ kg", g: 500 }, { name: "2 ons", g: 200 }, { name: "1 ons", g: 100 }, { name: "½ ons", g: 50 }];
const targets = [{ thing: "flour" as Thing, g: 1750 }, { thing: "orange" as Thing, g: 2300 }, { thing: "egg" as Thing, g: 650 }];
function BalanceLab() {
  const [t, setT] = useState(0);
  const [count, setCount] = useState<number[]>([0, 0, 0, 0, 0]);
  const target = targets[t], left = count.reduce((s, c, i) => s + c * bobs[i].g, 0);
  const diff = left - target.g, tilt = Math.max(-12, Math.min(12, -diff / 100));
  const set = (i: number, d: number) => setCount(c => c.map((x, j) => j === i ? Math.max(0, x + d) : x));
  return <div className="space-y-4">
    <Chips label="Benda" items={[0, 1, 2]} value={t} onChange={v => { setT(v); setCount([0, 0, 0, 0, 0]); }} text={v => ["Tepung", "Jeruk", "Telur"][v]} />
    <div className="rounded-xl bg-base-100 p-3">
      <BalanceScale weights={0} thing={target.thing} tilt={tilt} extra={<text x="38" y="40" fontSize="8" textAnchor="middle" fontWeight="800" fill="#17352a">{idNumber(left)} g</text>} />
      <p className="text-center text-xs text-base-content/60">Berat benda dirahasiakan. Seimbangkan dengan bandul!</p>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{bobs.map((b, i) => <div key={b.name} className="rounded-lg border border-base-300 bg-base-100 p-2 text-center">
      <p className="text-xs font-bold">Bandul {b.name}</p><p className="text-[10px] text-base-content/60">{idNumber(b.g)} gram</p>
      <div className="mt-1 flex items-center justify-center gap-1"><button type="button" aria-label={`Ambil bandul ${b.name}`} className="btn btn-xs btn-outline" disabled={!count[i]} onClick={() => set(i, -1)}>−</button><span className="w-5 font-bold">{count[i]}</span><button type="button" aria-label={`Tambah bandul ${b.name}`} className="btn btn-xs btn-success" onClick={() => set(i, 1)}>+</button></div>
    </div>)}</div>
    <Result value={String(left)} ok={diff === 0}>
      {diff === 0 ? <><strong>Seimbang!</strong> Berat benda = {idNumber(target.g)} gram = {Math.floor(target.g / 1000)} kg {target.g % 1000} gram = {String(target.g / 100).replace(".", ",")} ons.</>
        : diff < 0 ? <>Bandul baru {idNumber(left)} gram. Benda lebih berat, tambah bandul.</> : <>Bandul {idNumber(left)} gram terlalu berat. Ambil sebagian bandul.</>}
    </Result>
    <p className="rounded-lg bg-warning/20 p-2 text-center text-sm font-bold">1 kg = 10 ons = 1.000 gram · 1 ons = 100 gram</p>
    <TryList items={[
      { prompt: <>1.753 gram = … kg … gram</>, answer: [1, 753], units: ["kg", "gram"], hint: "Pisahkan ribuannya: 1.000 gram = 1 kg." },
      { prompt: <>4 kg 150 gram = … gram</>, answer: [4150], units: ["gram"], hint: "4 kg = 4.000 gram, lalu tambah 150 gram." },
      { prompt: <>3 ons = … gram</>, answer: [300], units: ["gram"], hint: "1 ons = 100 gram." },
    ]} />
  </div>;
}

const labs = [RulerLab, MeterLab, WeightLab, BalanceLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, i, value, set, checked }: { p: Part; i: number; value: string; set: (v: string) => void; checked: boolean }) {
  const label = `Jawaban ${i + 1}`;
  switch (p.kind) {
    case "number": return <div className="flex flex-wrap items-center gap-2">
      <Prefix text={p.prefix} /><span className={`${pill} gap-1.5`}><NumBox label={label} value={value} onChange={set} disabled={checked} wide />{p.unit}</span></div>;
    case "compound": { const [a = "", b = ""] = value.split("|"); return <div className="flex flex-wrap items-center gap-2">
      <Prefix text={p.prefix} />
      <span className={`${pill} gap-1.5`}><NumBox label={`${label} ${p.units[0]}`} value={a} onChange={x => set(`${x}|${b}`)} disabled={checked} />{p.units[0]}<NumBox label={`${label} ${p.units[1]}`} value={b} onChange={x => set(`${a}|${x}`)} disabled={checked} wide />{p.units[1]}</span></div>; }
    case "choice": return <div role="group" aria-label={`Bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" aria-pressed={value === o} disabled={checked} className={`btn btn-sm h-auto min-h-9 whitespace-normal ${value === o ? "btn-neutral" : "btn-outline"}`} onClick={() => set(o)}>{o}</button>)}</div></div>;
    case "check": { const sel = value ? value.split(",").filter(Boolean).map(Number) : []; return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{p.cards.map((c, k) => { const on = sel.includes(k); return <button key={c + k} type="button" aria-pressed={on} aria-label={`Centang ${p.names[k]}`} disabled={checked}
      className={`relative flex flex-col items-center rounded-2xl border-2 p-2 ${on ? "border-success bg-success/10" : "border-[#d9e35b] bg-base-100"}`} onClick={() => set((on ? sel.filter(x => x !== k) : [...sel, k]).sort((x, y) => x - y).join(","))}>
      <ThingIcon thing={c} className="size-14" /><span className="text-xs font-bold">{p.names[k]}</span>
      <span className={`mt-1 grid h-7 w-12 place-items-center rounded-full border-2 border-[#d9e35b] bg-white text-lg font-extrabold ${on ? "text-success" : "text-base-content/30"}`}>{on ? "✓" : "…"}</span></button>; })}</div>; }
    case "sort": { const sel = value ? value.split(",") : p.items.map(() => ""); return <div className="space-y-2">{p.items.map((it, k) => <div key={it.name} role="group" aria-label={it.name} className="flex flex-wrap items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-2">
      <div className="flex min-w-28 items-center gap-2">{it.scene ? <div className="w-36"><SceneView scene={it.scene} /></div> : it.thing && <ThingIcon thing={it.thing} className="size-10" />}<span className="text-sm font-bold">{it.name}</span></div>
      <span aria-hidden="true" className="text-base-content/40">→</span>
      <div className="flex flex-wrap gap-1.5">{p.bins.map((b, bi) => <button key={b} type="button" aria-pressed={sel[k] === String(bi)} disabled={checked}
        className={`btn btn-sm h-auto min-h-9 gap-1 ${sel[k] === String(bi) ? "btn-neutral" : "btn-outline"}`} onClick={() => set(sel.map((x, j) => j === k ? String(bi) : x).join(","))}>
        {p.binThings?.[bi] && <ThingIcon thing={p.binThings[bi]} className="size-6" />}{b}</button>)}</div>
    </div>)}</div>; }
  }
}
function Answer({ q, value, record, checked }: { q: MQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3">{q.parts.map((p, i) => <PartView key={i} p={p} i={i} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeThreeMeasurement() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 3 · Bab 3</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Pengukuran Panjang dan Berat</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Ukur dengan penggaris dan meteran, timbang dengan berbagai timbangan, lalu ubah cm ke m dan gram ke kg.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-gradient-to-br from-warning/20 to-success/10 p-6 text-center">
        <div className="flex items-end gap-2" aria-hidden="true"><ThingIcon thing="ruler" className="size-14" /><ThingIcon thing="tape" className="size-12" /><ThingIcon thing="balance" className="size-14" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Ukur, timbang, lalu ubah satuannya</h2>
        <p className="mt-2 text-sm text-base-content/60">4 materi interaktif, {practice.flat().length} latihan materi, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-ukur">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-ukur" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-4 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 whitespace-normal ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi · 24 soal</button>
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
          <button type="button" className="btn btn-ghost" disabled={topic === 0} onClick={() => go(topic - 1)}>← Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan materi →</button>
            {topic < topics.length - 1 ? <button type="button" className="btn btn-outline" onClick={() => go(topic + 1)}>Materi berikutnya</button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<MQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
