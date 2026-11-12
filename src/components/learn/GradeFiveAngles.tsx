"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, RotateCcw, RotateCw, Ruler, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { AngleFig, Clock, Fan, Roads, ShapeFig, Tiles } from "./GradeFiveAnglesArt";
import {
  assessment, cells, clockAngle, cornerAngles, correct, formatAnswer, kindOf, practice, ready, SEP, splitParts, topics,
  type GQuestion, type Part, type Pt, type Scene,
} from "@/data/grade-five-angles";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, w = "w-20" }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
function ToolToggle({ tool, set }: { tool: boolean; set: (b: boolean) => void }) {
  return <button type="button" aria-pressed={tool} className={`btn btn-sm gap-1 ${tool ? on : "btn-outline"}`} onClick={() => set(!tool)}><Ruler className="size-4" aria-hidden="true" />{tool ? "Lepas busur derajat" : "Pasang busur derajat"}</button>;
}
/** Tombol memutar kaki sudut. */
function Rotator({ value, set, disabled, max = 180, label = "Kaki sudut" }: { value: number; set: (n: number) => void; disabled?: boolean; max?: number; label?: string }) {
  const btn = (d: number) => <button key={d} type="button" aria-label={`${label} ${d > 0 ? "putar maju" : "putar mundur"} ${Math.abs(d)}`} disabled={disabled || value + d < 0 || value + d > max} onClick={() => set(value + d)} className="btn btn-sm btn-outline gap-0.5">
    {d < 0 ? <RotateCw className="size-3.5" aria-hidden="true" /> : <RotateCcw className="size-3.5" aria-hidden="true" />}{Math.abs(d)}°</button>;
  return <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">{[-10, -1].map(btn)}<span className="w-14 text-center text-lg font-extrabold">{value}°</span>{[1, 10].map(btn)}</div>;
}
const hourText = (h: number) => `Pukul ${String(h).padStart(2, "0")}.00`;
function HourPicker({ h, set, disabled }: { h: number; set: (h: number) => void; disabled?: boolean }) {
  return <div role="group" aria-label="Atur jam" className="flex items-center gap-2">
    <button type="button" aria-label="Jam mundur" disabled={disabled} className="btn btn-sm btn-square btn-outline" onClick={() => set(h === 1 ? 12 : h - 1)}><Minus className="size-4" aria-hidden="true" /></button>
    <span className="w-24 text-center font-extrabold">{hourText(h)}</span>
    <button type="button" aria-label="Jam maju" disabled={disabled} className="btn btn-sm btn-square btn-outline" onClick={() => set(h === 12 ? 1 : h + 1)}><Plus className="size-4" aria-hidden="true" /></button>
  </div>;
}

/* ====================================================================== */
/* Lab A: detektif sudut siku-siku                                         */
/* ====================================================================== */
const labShapes: { name: string; pts: Pt[] }[] = [
  { name: "Bingkai", pts: [[0, 0], [6, 0], [6, 4], [0, 4]] },
  { name: "Segi enam", pts: [[1, 0], [5, 0], [6, 1], [6, 4], [0, 4], [0, 1]] },
  { name: "Layang-layang", pts: [[3, 0], [5, 3], [3, 7], [1, 3]] },
  { name: "Huruf L", pts: [[0, 0], [3, 0], [3, 3], [6, 3], [6, 6], [0, 6]] },
];
function CornerLab() {
  const [s, setS] = useState(1), [marks, setMarks] = useState<number[]>([]), [last, setLast] = useState<number | null>(null);
  const sh = labShapes[s], ang = cornerAngles(sh.pts), right = marks.filter(i => Math.abs(ang[i] - 90) < 0.5).length;
  const verdict = (i: number) => { const a = ang[i]; return Math.abs(a - 90) < 0.5 ? "siku-siku: lipatan kertas berimpit tepat" : a < 90 ? "lebih kecil dari sudut siku-siku" : "lebih besar dari sudut siku-siku"; };
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Pilih bangun" className="flex flex-wrap gap-1.5">{labShapes.map((x, k) => <button key={x.name} type="button" role="radio" aria-checked={s === k} onClick={() => { setS(k); setMarks([]); setLast(null); }} className={`btn btn-xs ${s === k ? "btn-success" : "btn-outline"}`}>{x.name}</button>)}</div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><ShapeFig pts={sh.pts} marks={marks} onTap={i => { setMarks(m => (m.includes(i) ? m : [...m, i])); setLast(i); }} /></div>
    <p className="text-xs text-base-content/60">Ketuk pojok bangun untuk menempelkan lipatan kertas. Kotak merah berarti siku-siku, lingkaran jingga berarti bukan.</p>
    <Result value={String(right)}>{last === null ? "Belum ada pojok yang diperiksa." : <>Pojok {String.fromCharCode(65 + last)} {verdict(last)}.</>} Sudut siku-siku yang ditemukan: <strong>{right}</strong> dari {ang.filter(a => Math.abs(a - 90) < 0.5).length}.</Result>
  </div>;
}

/* ====================================================================== */
/* Lab B: jenis sudut dan jam                                              */
/* ====================================================================== */
function TypeLab() {
  const [d, setD] = useState(60), [h, setH] = useState(2);
  const ca = clockAngle(h);
  return <div className="space-y-3">
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><AngleFig a={{ base: 0, deg: d, reflex: d > 180 }} className="w-full max-w-60" /></div>
    <Rotator value={d} set={setD} max={360} label="Putar kaki sudut" />
    <Result value={kindOf(d)}>Besar sudut {d}°: <strong>sudut {kindOf(d).toLowerCase()}</strong>.</Result>
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3"><Clock h={h} className="size-28" /><div className="space-y-2"><HourPicker h={h} set={setH} /><p data-testid="clock-result" data-value={kindOf(ca)} className="text-sm">Jarum pendek dan panjang membentuk sudut {ca}°, yaitu sudut <strong>{kindOf(ca).toLowerCase()}</strong>.</p></div></div>
  </div>;
}

/* ====================================================================== */
/* Lab C: mengukur dengan busur derajat                                    */
/* ====================================================================== */
const labAngles = [{ base: 0, deg: 40 }, { base: 0, deg: 125 }, { base: 30, deg: 90 }, { base: 180, deg: 65, side: "cw" as const }, { base: 15, deg: 150 }];
function MeasureLab() {
  const [i, setI] = useState(0), [tool, setTool] = useState(false), [guess, setGuess] = useState("");
  const a = labAngles[i], g = Number(guess);
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Pilih sudut" className="flex flex-wrap gap-1.5">{labAngles.map((_, k) => <button key={k} type="button" role="radio" aria-checked={i === k} onClick={() => { setI(k); setGuess(""); }} className={`btn btn-xs ${i === k ? "btn-success" : "btn-outline"}`}>Sudut {k + 1}</button>)}</div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><AngleFig a={a} tool={tool} className="w-full max-w-80" /></div>
    <div className="flex flex-wrap items-center gap-2"><ToolToggle tool={tool} set={setTool} /><label className="flex items-center gap-2 text-sm font-bold">Hasil ukuranku <Box label="Hasil ukuranku" value={guess} onChange={setGuess} /> °</label></div>
    <Result value={guess && g === a.deg ? String(g) : ""}>{!guess ? "Pasang busur derajat, lalu tulis angka yang dilewati kaki sudut kedua." : g === a.deg ? <>Tepat, besar sudut ini <strong>{a.deg}°</strong> ({kindOf(a.deg).toLowerCase()}).</> : g === 180 - a.deg ? "Hampir. Kamu membaca skala yang salah. Mulailah dari angka 0 pada kaki sudut yang berimpit dengan garis dasar." : "Belum tepat. Periksa lagi letak pusat busur dan garis dasarnya."}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab D: melukis sudut                                                    */
/* ====================================================================== */
function DrawLab() {
  const [t, setT] = useState(150), [d, setD] = useState(0);
  return <div className="space-y-3">
    <div role="group" aria-label="Besar sudut yang dilukis" className="flex flex-wrap items-center gap-2 text-sm font-bold">Lukis sudut
      <button type="button" aria-label="Sudut target kurangi" className="btn btn-xs btn-square btn-outline" disabled={t <= 10} onClick={() => setT(t - 5)}><Minus className="size-3.5" aria-hidden="true" /></button>
      <span className="w-12 text-center text-lg">{t}°</span>
      <button type="button" aria-label="Sudut target tambah" className="btn btn-xs btn-square btn-outline" disabled={t >= 175} onClick={() => setT(t + 5)}><Plus className="size-3.5" aria-hidden="true" /></button></div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><AngleFig a={{ base: 0, deg: d }} tool className="w-full max-w-80" /></div>
    <Rotator value={d} set={setD} label="Putar kaki sudut kedua" />
    <Result value={d === t ? String(d) : ""}>{d === t ? <>Tepat. Sudut {t}° sudah terlukis. Kaki pertama di angka 0, kaki kedua di angka {t}.</> : `Kaki kedua sekarang di ${d}°. ${d < t ? `Putar lagi ${t - d}°.` : `Kelebihan ${d - t}°.`}`}</Result>
  </div>;
}
const labs = [CornerLab, TypeLab, MeasureLab, DrawLab];

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  const [tool, setTool] = useState(false);
  switch (scene.type) {
    case "angle": return <div className="grid w-full place-items-center gap-2"><AngleFig a={scene.angle} tool={tool} className="w-full max-w-80" />{scene.tool && <ToolToggle tool={tool} set={setTool} />}</div>;
    case "angles": return <div className="grid w-full grid-cols-2 gap-2">{scene.items.map(a => <figure key={a.label} className="text-center text-xs font-bold"><AngleFig a={a} className="w-full max-w-40" />{a.label}</figure>)}</div>;
    case "clock": return <Clock h={scene.h} m={scene.m} className="size-40" />;
    case "shapes": return <div className={`grid w-full gap-3 ${scene.items.length > 1 ? "grid-cols-2" : ""} place-items-center`}>{scene.items.map((s, k) => <ShapeFig key={k} pts={s.pts} label={s.label} className={scene.items.length > 1 ? "w-full max-w-40" : "w-full max-w-64"} />)}</div>;
    case "fans": return <div className="w-full space-y-2"><div className="grid grid-cols-2 gap-2">{scene.items.map(f => <figure key={f.label} className="text-center text-xs font-bold"><Fan deg={f.deg} base={f.base} tool={tool} className="w-full max-w-44" />{f.label}</figure>)}</div>{scene.tool && <div className="text-center"><ToolToggle tool={tool} set={setTool} /></div>}</div>;
    case "roads": return <Roads roads={scene.roads} shown={scene.shown} />;
    case "tiles": return <Tiles />;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 text-lg font-bold">{p.label} <Box label={p.label} value={value} onChange={set} disabled={checked} />{p.unit ?? "°"}</label>;
    case "items": return <div className="space-y-2">{p.items.map((it, k) => <label key={it.label} className="flex flex-wrap items-center gap-2 text-lg font-bold">{it.label}<Box label={it.label} value={x[k]} onChange={v => put(k, v)} disabled={checked} /></label>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className={p.figs ? "grid grid-cols-2 gap-2 sm:grid-cols-4" : "flex flex-wrap gap-2"}>{p.options.map((op, k) => <button key={op} type="button" aria-label={op} aria-pressed={value === op} disabled={checked} onClick={() => set(op)}
        className={`flex flex-col items-center rounded-2xl border-4 px-3 py-1.5 text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{p.figs && <AngleFig a={p.figs[k]} className="w-full max-w-32" label={`Gambar ${op}`} />}{op}</button>)}</div></div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="group" aria-label={r.text} className="flex flex-col gap-2 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 sm:w-56">{r.angle && <AngleFig a={r.angle} className="size-20 shrink-0" />}{r.clock && <Clock h={r.clock[0]} m={r.clock[1]} className="size-20 shrink-0" />}<span className="text-sm font-semibold">{r.text}</span></div>
      <div className="flex flex-wrap gap-1">{p.options.map(o => <button key={o} type="button" disabled={checked} aria-pressed={x[k] === o} onClick={() => put(k, o)} className={`btn btn-xs h-8 ${x[k] === o ? on : "btn-outline"}`}>{o}</button>)}</div></div>)}</div>;
    case "corners": { const marks = value ? value.split(",").map(Number) : [];
      return <div className="grid w-full place-items-center gap-1"><ShapeFig pts={p.shape.pts} marks={marks} disabled={checked} onTap={k => set((marks.includes(k) ? marks.filter(y => y !== k) : [...marks, k]).sort((a, b) => a - b).join(","))} className="w-full max-w-72" />
        <p className="text-xs text-base-content/60">Ketuk titik sudut yang siku-siku. Ketuk lagi untuk membatalkan. Dipilih {marks.length} titik.</p></div>; }
    case "draw": { const d = value === "" ? 0 : Number(value);
      return <div className="grid w-full place-items-center gap-2"><AngleFig a={{ base: p.base, deg: d, side: p.side }} tool className="w-full max-w-80" label={`Sudut yang dilukis ${d} derajat`} /><Rotator value={d} set={n => set(String(n))} disabled={checked} label="Putar kaki sudut kedua" /></div>; }
    case "clockSet": { const h = value === "" ? 12 : Number(value);
      return <div className="flex flex-wrap items-center gap-3"><Clock h={h} className="size-36" /><div className="space-y-1"><HourPicker h={h} set={n => set(String(n))} disabled={checked} /><p className="text-xs text-base-content/60">Jarum panjang tetap di angka 12. Atur jarum pendek.</p></div></div>; }
    case "order": { const sel = value ? value.split(";") : [];
      return <div role="group" aria-label={p.label} className="space-y-2"><p className="text-sm font-bold">{p.label}</p>
        <div className="flex flex-col gap-1.5">{p.options.map(op => <button key={op} type="button" aria-label={op} disabled={checked || sel.includes(op)} onClick={() => set([...sel, op].join(";"))} className="btn btn-outline btn-sm h-auto min-h-9 justify-start whitespace-normal py-1 text-left">{op}</button>)}</div>
        <ol className="list-decimal space-y-1 rounded-lg border-2 border-dashed border-orange-300 p-2 ps-7 text-sm">{p.options.map((_, k) => <li key={k} className={sel[k] ? "font-semibold" : "text-base-content/40"}>{sel[k] ?? "…"}</li>)}</ol>
        <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || !sel.length} onClick={() => set(sel.slice(0, -1).join(";"))}><Undo2 className="size-3.5" aria-hidden="true" />Batalkan terakhir</button></div>; }
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span>{s.text}</span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: GQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeFiveAngles() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 5, Bab 6</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Sudut</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Temukan sudut siku-siku di sekitar, kenali jenis-jenis sudut, ukur dan bandingkan sudut dengan busur derajat, lalu lukis sudut dengan ukuran tertentu.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-2"><Fan deg={120} base={30} className="size-24" /><Clock h={8} className="size-20" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Kipas tari pakarena dan jarum jam</h2>
        <p className="mt-2 text-sm text-base-content/60">4 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-sudut">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-sudut" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<GQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 6"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt + q.answer} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
