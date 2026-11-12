"use client";

import { ArrowLeft, ArrowRight, Check, Minus, Plus, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { ShapeFig, Straw } from "./GradeFiveShapeTraitsArt";
import {
  assessment, bestName, canForm, cells, correct, formatAnswer, interiorAngles, practice, quadInfo, quadNames, ready, SEP, splitParts, topics, triAngleKind, triFromSides, triSideKind,
  type Part, type Pt, type Scene, type SQuestion,
} from "@/data/grade-five-shape-traits";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, w = "w-16" }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, unit = "" }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value <= min} onClick={() => set(value - step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="w-10 text-center text-lg font-extrabold">{value}{unit}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value >= max} onClick={() => set(value + step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
const strawColors = ["#e5484d", "#2f9e44", "#7048e8"];
const letter = (k: number) => String.fromCharCode(65 + k);

/* ====================================================================== */
/* Lab A: sedotan dan segitiga                                             */
/* ====================================================================== */
function TriLab() {
  const [s, setS] = useState<[number, number, number]>([5, 6, 7]);
  const [a, b, c] = s, ok = canForm(a, b, c), pts = ok ? triFromSides(a, b, c) : null, ang = pts ? interiorAngles(pts).map(x => Math.round(x)) : [];
  const set = (k: number) => (v: number) => setS(x => x.map((y, j) => (j === k ? v : y)) as [number, number, number]);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3">{(["a", "b", "c"] as const).map((n, k) => <Stepper key={n} label={`Sedotan ${n}`} value={s[k]} set={set(k)} min={1} max={15} unit=" cm" />)}</div>
    <div className="space-y-1 rounded-xl bg-base-100 p-3">{s.map((l, k) => <div key={k} className="flex items-center gap-2 text-xs font-bold"><span className="w-4">{"abc"[k]}</span><Straw length={l} color={strawColors[k]} /></div>)}</div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2">{pts ? <ShapeFig fig={{ pts, angleLabels: [`${ang[0]}°`, `${ang[1]}°`, `${ang[2]}°`] }} className="w-full max-w-60" /> : <p className="p-6 text-center text-sm"><X className="mx-auto mb-1 size-6 text-error" aria-hidden="true" />Ujung sedotan tidak dapat bertemu.</p>}</div>
    <Result value={pts ? `${triAngleKind(pts)}|${triSideKind(pts)}` : "tidak"}>
      b + c = {b + c}, a + c = {a + c}, a + b = {a + b}.{" "}
      {pts ? <>Setiap jumlah dua sisi lebih dari sisi ketiga, jadi <strong>bisa</strong> dibentuk segitiga. Sudutnya {ang.join("° + ")}° = 180°. Ini segitiga <strong>{triAngleKind(pts).toLowerCase()}</strong> dan <strong>{triSideKind(pts).toLowerCase()}</strong>.</>
        : <>Ada jumlah dua sisi yang tidak lebih dari sisi ketiga, jadi <strong>tidak bisa</strong> dibentuk segitiga.</>}
    </Result>
  </div>;
}

/* ====================================================================== */
/* Lab B: keluarga segi empat                                              */
/* ====================================================================== */
const families = ["Jajargenjang", "Layang-layang", "Trapesium"] as const;
function QuadLab() {
  const [f, setF] = useState<(typeof families)[number]>("Jajargenjang");
  const [p, setP] = useState({ a: 6, b: 4, th: 60, h1: 2, h2: 5, w: 3, t: 4, bb: 8, h: 4, g: 1 });
  const up = (k: keyof typeof p) => (v: number) => setP(x => ({ ...x, [k]: v }));
  let pts: Pt[];
  if (f === "Jajargenjang") { const r = (p.th * Math.PI) / 180, dx = p.b * Math.cos(r), hh = p.b * Math.sin(r); pts = [[0, hh], [p.a, hh], [p.a + dx, 0], [dx, 0]]; }
  else if (f === "Layang-layang") pts = [[p.w, 0], [2 * p.w, p.h1], [p.w, p.h1 + p.h2], [0, p.h1]];
  else { const g = Math.min(p.g, p.bb - p.t); pts = [[g, 0], [g + p.t, 0], [p.bb, p.h], [0, p.h]]; }
  const info = quadInfo(pts), names = quadNames(pts);
  const props: [string, string | number][] = [["Pasangan sisi sejajar", info.parallelPairs], ["Semua sisi sama panjang", info.allEqual ? "ya" : "tidak"], ["Sudut siku-siku", info.rights], ["Simetri lipat", info.axes], ["Simetri putar", info.rot]];
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Keluarga bangun" className="flex flex-wrap gap-1.5">{families.map(x => <button key={x} type="button" role="radio" aria-checked={f === x} onClick={() => setF(x)} className={`btn btn-xs ${f === x ? "btn-success" : "btn-outline"}`}>{x}</button>)}</div>
    <div className="flex flex-wrap gap-3">
      {f === "Jajargenjang" && <><Stepper label="Alas" value={p.a} set={up("a")} min={2} max={8} /><Stepper label="Sisi miring" value={p.b} set={up("b")} min={2} max={8} /><Stepper label="Sudut" value={p.th} set={up("th")} min={45} max={90} step={15} unit="°" /></>}
      {f === "Layang-layang" && <><Stepper label="Tinggi atas" value={p.h1} set={up("h1")} min={1} max={6} /><Stepper label="Tinggi bawah" value={p.h2} set={up("h2")} min={1} max={8} /><Stepper label="Setengah lebar" value={p.w} set={up("w")} min={1} max={5} /></>}
      {f === "Trapesium" && <><Stepper label="Sisi atas" value={p.t} set={up("t")} min={2} max={p.bb - 1} /><Stepper label="Sisi bawah" value={p.bb} set={up("bb")} min={p.t + 1} max={10} /><Stepper label="Geser atas" value={Math.min(p.g, p.bb - p.t)} set={up("g")} min={0} max={p.bb - p.t} /></>}
    </div>
    <div className="grid gap-3 rounded-xl bg-base-100 p-2 sm:grid-cols-2">
      <div className="grid place-items-center"><ShapeFig fig={{ pts }} className="w-full max-w-56" /></div>
      <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 self-center text-sm">{props.map(([k, v]) => <div key={k} className="contents"><dt>{k}</dt><dd className="text-right font-bold">{v}</dd></div>)}</dl>
    </div>
    <div className="flex flex-wrap gap-1.5" aria-label="Nama yang boleh dipakai">{names.map(n => <span key={n} className="badge badge-outline gap-1"><Check className="size-3 text-success" aria-hidden="true" />{n}</span>)}</div>
    <Result value={bestName(pts)}>Nama yang paling tepat: <strong>{bestName(pts)}</strong>. Bangun ini juga boleh disebut {names.filter(n => n !== bestName(pts)).join(", ").toLowerCase()}.</Result>
  </div>;
}
const labs = [TriLab, QuadLab];

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  if (scene.type === "fig") return <ShapeFig fig={scene.fig} className="w-full max-w-64" />;
  return <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">{scene.items.map(it => <figure key={it.label} className="flex flex-col items-center text-xs font-bold"><ShapeFig fig={it.fig} className="w-full max-w-40" />{it.label}</figure>)}</div>;
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 text-lg font-bold">{p.label}<Box label={p.label} value={value} onChange={set} disabled={checked} />{p.unit}</label>;
    case "items": return <div className="space-y-2">{p.items.map((it, k) => <label key={it.label} className="flex flex-wrap items-center gap-2 font-bold">{it.label}<Box label={it.label} value={x[k]} onChange={v => put(k, v)} disabled={checked} /></label>)}</div>;
    case "straws": return <div className="space-y-2">{p.rows.map(([a, b, c], k) => <div key={k} className="rounded-lg border border-base-300 p-2">
      <p className="text-sm font-bold">Percobaan {k + 1}: a = {a} cm, b = {b} cm, c = {c} cm</p>
      <div className="my-1 space-y-0.5">{[a, b, c].map((l, j) => <Straw key={j} length={l} color={strawColors[j]} scale={8} />)}</div>
      <div className="flex flex-wrap items-center gap-2">
        <span role="group" aria-label={`Percobaan ${k + 1} membentuk segitiga`} className="join">{["Bisa", "Tidak"].map(o => <button key={o} type="button" disabled={checked} aria-pressed={x[4 * k] === o} onClick={() => put(4 * k, o)} className={`btn join-item btn-sm ${x[4 * k] === o ? on : "btn-outline"}`}>{o}</button>)}</span>
        {["b+c", "a+c", "a+b"].map((l, j) => <label key={l} className="flex items-center gap-1 text-sm font-bold">{l} =<Box label={`Percobaan ${k + 1} ${l}`} value={x[4 * k + 1 + j]} onChange={v => put(4 * k + 1 + j, v)} disabled={checked} w="w-12" /></label>)}
      </div></div>)}</div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="group" aria-label={r.text} className="flex flex-col gap-2 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 sm:w-44">{r.fig && <ShapeFig fig={r.fig} className="size-20 shrink-0" />}<span className="text-sm font-semibold">{r.text}</span></div>
      <div className="flex flex-wrap gap-1">{p.options.map(o => <button key={o} type="button" disabled={checked} aria-pressed={x[k] === o} onClick={() => put(k, o)} className={`btn btn-xs h-8 ${x[k] === o ? on : "btn-outline"}`}>{o}</button>)}</div></div>)}</div>;
    case "select": { const sel = value ? value.split(",").map(Number) : [];
      return <div className="space-y-1"><div role="group" aria-label={p.label} className="grid grid-cols-3 gap-2">{p.figs.map((f, k) => { const s = sel.includes(k);
        return <button key={k} type="button" aria-label={`Bangun ${letter(k)}`} aria-pressed={s} disabled={checked} onClick={() => set((s ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))}
          className={`flex flex-col items-center rounded-xl border-4 p-1.5 text-sm font-bold ${s ? "border-success bg-success/10" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><ShapeFig fig={f} className="w-full max-w-24" label={`Bangun ${letter(k)}`} />{letter(k)}</button>; })}</div>
        <p className="text-xs text-base-content/60">Ketuk semua yang benar. Ketuk lagi untuk membatalkan. Dipilih {sel.length} bangun.</p></div>; }
    case "tf": { const [y, n] = p.labels ?? ["Benar", "Salah"];
      return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>{s.text}</span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? y : n}</button>)}</span></div>)}</div>; }
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: SQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeFiveShapeTraits() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 5, Bab 7</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Membandingkan Ciri-Ciri Bangun Datar</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Bandingkan segitiga menurut sudut dan sisinya, lalu temukan hubungan antara trapesium, jajargenjang, persegi panjang, belah ketupat, persegi, dan layang-layang.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-3"><ShapeFig fig={{ pts: [[0, 6], [6, 6], [3, 0]] }} className="size-20" /><ShapeFig fig={{ pts: [[0, 0], [5, 0], [5, 5], [0, 5]] }} className="size-16" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Berwisata ke Candi Sewu</h2>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-ciri">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-ciri" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<SQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 7"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt + q.answer} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
