"use client";

import { ArrowLeft, ArrowRight, Footprints, Minus, Move, Plus, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Field, ShapeFig } from "./GradeFivePerimeterArt";
import {
  assessment, cells, correct, formatAnswer, kite, ortho, parallelogram, perimeter, practice, ready, rect, regular, SEP, splitParts, topics, trapezoid, triangle,
  type Part, type PQuestion, type Scene, type ShapeSpec,
} from "@/data/grade-five-perimeter";

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
function Picker<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-xs h-auto min-h-7 ${value === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div>;
}

/* ====================================================================== */
/* Lab A: berlari mengelilingi lapangan                                    */
/* ====================================================================== */
function FieldLab() {
  const [w, setW] = useState(100), [h, setH] = useState(50), [k, setK] = useState(0);
  const sides = [w, h, w, h], dist = sides.slice(0, k).reduce((a, b) => a + b, 0), per = 2 * (w + h);
  const reset = (f: (x: number) => void) => (x: number) => { f(x); setK(0); };
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Panjang" value={w} set={reset(setW)} min={40} max={120} step={10} /><Stepper label="Lebar" value={h} set={reset(setH)} min={20} max={80} step={10} /></div>
    <div className="rounded-xl bg-base-100 p-2"><Field w={w} h={h} unit="m" runner={(dist / per) % 1} /></div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-success gap-1" disabled={k >= 4} onClick={() => setK(k + 1)}><Footprints className="size-4" aria-hidden="true" />Lari ke sudut berikutnya</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!k} onClick={() => setK(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    </div>
    <Result value={String(dist)}>{k === 0 ? "Pelari berada di titik start." : <>Jarak lari: {sides.slice(0, k).join(" + ")} = <strong>{dist} m</strong>.{k === 4 && <> Pelari kembali ke titik start. Jarak ini adalah <strong>keliling</strong> lapangan.</>}</>}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab B: segitiga                                                         */
/* ====================================================================== */
const triTypes = ["Sembarang", "Sama kaki", "Sama sisi"] as const;
function TriLab() {
  const [t, setT] = useState<(typeof triTypes)[number]>("Sembarang"), [a, setA] = useState(7), [b, setB] = useState(5), [c, setC] = useState(4);
  const [A, B, C] = t === "Sama sisi" ? [a, a, a] : t === "Sama kaki" ? [a, b, b] : [a, b, c];
  const ok = A < B + C && B < A + C && C < A + B, per = A + B + C;
  const shape = ok ? triangle(A, B, C, "cm", { ticks: t === "Sama sisi" ? [1, 1, 1] : t === "Sama kaki" ? [0, 1, 1] : [0, 0, 0] }) : null;
  return <div className="space-y-3">
    <Picker label="Jenis segitiga" options={triTypes} value={t} set={setT} />
    <div className="flex flex-wrap gap-3"><Stepper label={t === "Sama kaki" ? "Alas" : "Sisi 1"} value={a} set={setA} min={2} max={12} />{t !== "Sama sisi" && <Stepper label={t === "Sama kaki" ? "Kaki" : "Sisi 2"} value={b} set={setB} min={2} max={12} />}{t === "Sembarang" && <Stepper label="Sisi 3" value={c} set={setC} min={2} max={12} />}</div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2">{shape ? <ShapeFig s={shape} className="w-full max-w-64" /> : <p className="p-6 text-sm">Sisi-sisi ini tidak dapat membentuk segitiga. Satu sisi harus lebih pendek dari jumlah dua sisi lainnya.</p>}</div>
    <Result value={ok ? String(per) : ""}>{ok ? (t === "Sama sisi" ? <>Keliling = {a} + {a} + {a} = 3 × {a} = <strong>{per} cm</strong>.</> : t === "Sama kaki" ? <>Keliling = {a} + {b} + {b} = {a} + (2 × {b}) = <strong>{per} cm</strong>.</> : <>Keliling = {a} + {b} + {c} = <strong>{per} cm</strong>.</>) : "Ubah panjang sisinya."}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab C: segi empat                                                       */
/* ====================================================================== */
const quadTypes = ["Persegi panjang", "Persegi", "Jajargenjang", "Layang-layang", "Belah ketupat", "Trapesium"] as const;
function QuadLab() {
  const [t, setT] = useState<(typeof quadTypes)[number]>("Persegi panjang"), [a, setA] = useState(6), [b, setB] = useState(4), [c, setC] = useState(9);
  const one = t === "Persegi" || t === "Belah ketupat";
  const shape: ShapeSpec = t === "Persegi panjang" ? rect(a, b, "cm", ["show", "show", "none", "none"], { ticks: [1, 2, 1, 2] }) : t === "Persegi" ? rect(a, a, "cm", ["show", "none", "none", "none"], { ticks: [1, 1, 1, 1] })
    : t === "Jajargenjang" ? parallelogram(a, b) : t === "Layang-layang" ? kite(a, b, "cm", ["show", "show", "none", "none"]) : t === "Belah ketupat" ? kite(a, a, "cm", ["show", "none", "none", "none"]) : trapezoid(a, Math.max(c, a + 1), b, b);
  const per = perimeter(shape);
  const formula = one ? <>Keliling = 4 × {a} = <strong>{per} cm</strong></> : t === "Trapesium" ? <>Keliling = {shape.lens.join(" + ")} = <strong>{per} cm</strong></> : <>Keliling = (2 × {a}) + (2 × {b}) = {2 * a} + {2 * b} = <strong>{per} cm</strong></>;
  return <div className="space-y-3">
    <Picker label="Bangun segi empat" options={quadTypes} value={t} set={setT} />
    <div className="flex flex-wrap gap-3"><Stepper label={one ? "Sisi" : t === "Trapesium" ? "Sisi atas" : "Sisi a"} value={a} set={setA} min={2} max={10} />{!one && <Stepper label={t === "Trapesium" ? "Kaki" : "Sisi b"} value={b} set={setB} min={2} max={10} />}{t === "Trapesium" && <Stepper label="Sisi bawah" value={Math.max(c, a + 1)} set={setC} min={a + 1} max={14} />}</div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><ShapeFig s={shape} className="w-full max-w-64" /></div>
    <Result value={String(per)}>{formula}. {one ? "Keempat sisinya sama panjang." : t === "Trapesium" ? "Jumlahkan keempat sisinya." : "Ada dua pasang sisi yang sama panjang."}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab D: segi banyak beraturan                                            */
/* ====================================================================== */
const polyName: Record<number, string> = { 3: "Segitiga sama sisi", 4: "Persegi", 5: "Segi lima beraturan", 6: "Segi enam beraturan", 7: "Segi tujuh beraturan", 8: "Segi delapan beraturan" };
function PolyLab() {
  const [n, setN] = useState(5), [s, setS] = useState(3);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Banyak sisi" value={n} set={setN} min={3} max={8} /><Stepper label="Panjang sisi" value={s} set={setS} min={1} max={12} /></div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><ShapeFig s={regular(n, s)} className="w-full max-w-60" /><p className="text-sm font-bold">{polyName[n]}</p></div>
    <Result value={String(n * s)}>Keliling = {Array.from({ length: n }, () => s).join(" + ")} = {n} × {s} = <strong>{n * s} cm</strong>.</Result>
  </div>;
}

/* ====================================================================== */
/* Lab E: bangun gabungan                                                  */
/* ====================================================================== */
function CompLab() {
  const [W, setW] = useState(10), [H, setH] = useState(8), [nx, setNx] = useState(3), [ny, setNy] = useState(3), [slide, setSlide] = useState(false);
  const x = Math.min(nx, W - 1), y = Math.min(ny, H - 1);
  const shape = ortho([[0, 0], [W - x, 0], [W - x, y], [W, y], [W, H], [0, H]], ["show", "show", "show", "show", "show", "show"], "m", { frame: slide });
  const per = perimeter(shape);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Lebar" value={W} set={setW} min={4} max={12} /><Stepper label="Tinggi" value={H} set={setH} min={4} max={12} /><Stepper label="Potongan mendatar" value={x} set={setNx} min={1} max={W - 1} /><Stepper label="Potongan tegak" value={y} set={setNy} min={1} max={H - 1} /></div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><ShapeFig s={shape} className="w-full max-w-72" /></div>
    <button type="button" aria-pressed={slide} className={`btn btn-sm gap-1 ${slide ? "btn-success" : "btn-outline"}`} onClick={() => setSlide(!slide)}><Move className="size-4" aria-hidden="true" />Geser sisi ke luar</button>
    <Result value={String(per)}>Cara Asep: {shape.lens.join(" + ")} = <strong>{per} m</strong>.{slide && <> Cara Komang: sisi {y} m digeser ke kanan dan sisi {x} m digeser ke atas, menjadi persegi panjang {W} m × {H} m. Keliling = (2 × {W}) + (2 × {H}) = <strong>{2 * (W + H)} m</strong>, sama.</>}</Result>
  </div>;
}
const labs = [FieldLab, TriLab, QuadLab, PolyLab, CompLab];

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  const [m, setM] = useState<number[]>([]);
  if (scene.type === "field") return <Field w={scene.w} h={scene.h} unit={scene.unit} />;
  if (scene.type === "shapes") return <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">{scene.items.map(it => <figure key={it.caption} className="flex flex-col items-center"><ShapeFig s={it.shape} className="w-full max-w-48" fontScale={2.4} /><figcaption className="text-xs font-bold">{it.caption}</figcaption></figure>)}</div>;
  return <div className="w-full space-y-1 text-center"><ShapeFig s={scene.shape} measured={m} onMeasure={scene.measure ? i => setM(x => (x.includes(i) ? x : [...x, i])) : undefined} className="mx-auto w-full max-w-80" />
    {scene.measure && <p className="text-xs text-base-content/60">Ketuk setiap sisi untuk mengukurnya dengan penggaris. Sudah diukur {m.length} dari {scene.shape.show.filter(v => v === "hide").length} sisi.</p>}</div>;
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const b = (k: number, label: string, w?: string) => <Box label={label} value={x[k]} onChange={v => put(k, v)} disabled={checked} w={w} />;
  switch (p.kind) {
    case "sum": { const k = p.sides.length; return <Eq>Keliling = {p.sides.map((_, j) => <span key={j} className="flex items-center gap-1.5">{j > 0 && "+"}{b(j, `Sisi ${j + 1}`, "w-12")}</span>)} = {b(k, "Keliling", "w-16")} {p.unit}</Eq>; }
    case "mult": return <Eq>Keliling = {b(0, "Pengali pertama", "w-12")} × {b(1, "Pengali kedua", "w-12")} = {b(2, "Keliling", "w-16")} {p.unit}</Eq>;
    case "rectf": return <div className="space-y-2"><Eq>Keliling = (2 × {b(0, "Sisi pertama", "w-12")}) + (2 × {b(1, "Sisi kedua", "w-12")})</Eq><Eq><span className="w-20" /> = {b(2, "Hasil pertama", "w-14")} + {b(3, "Hasil kedua", "w-14")} = {b(4, "Keliling", "w-16")} {p.unit}</Eq></div>;
    case "number": return <Eq>{p.label} {b(0, p.label, "w-20")} {p.unit}</Eq>;
    case "fill": return <div className="flex flex-wrap gap-4">{p.items.map((it, k) => <Eq key={it.label}><span className="text-base">{it.label} =</span>{b(k, it.label)} {p.unit}</Eq>)}</div>;
    case "table": return <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr className="bg-sky-700 text-white"><th className="p-1.5 text-left">Bangun datar</th><th className="p-1.5">Banyak sisi</th><th className="p-1.5">Keliling</th></tr></thead>
      <tbody>{p.rows.map((r, k) => <tr key={r.name} className="border-b border-base-300"><td className="p-1.5 font-semibold">{r.name}</td><td className="p-1.5 text-center">{b(2 * k, `Banyak sisi ${r.name}`, "w-12")}</td><td className="p-1.5"><span className="flex items-center gap-1">{b(2 * k + 1, `Pengali ${r.name}`, "w-12")} × panjang sisi</span></td></tr>)}</tbody></table></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeFivePerimeter() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 5, Bab 4</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Keliling Bangun Datar</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Keliling adalah jumlah panjang sisi-sisi bangun datar. Hitung keliling segitiga, segi empat, segi banyak, dan bangun gabungan seperti denah rumah.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-56"><Field w={100} h={50} unit="m" runner={0.3} className="w-full" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Berlari mengelilingi lapangan</h2>
        <p className="mt-2 text-sm text-base-content/60">5 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-keliling">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-keliling" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<PQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 4"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
