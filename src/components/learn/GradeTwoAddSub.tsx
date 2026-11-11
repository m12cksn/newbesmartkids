"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, RotateCcw, Scissors } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Abacus, Bird, Bunny, FlowerPot, ShapeArt, ThingArt } from "./GradeTwoAddSubArt";
import {
  assessment, cells, correct, formatAnswer, practice, ready, SEP, splitParts, topics,
  type AQuestion, type Op, type Part, type Scene,
} from "@/data/grade-two-add-sub";

const sym = (op: Op) => (op === "+" ? "+" : "−");

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, w = "w-12 sm:w-14" }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className={`h-11 ${w} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
const Fixed = ({ children }: { children: ReactNode }) => <span className="grid h-11 w-14 place-items-center rounded-xl border-2 border-base-300 bg-base-200 text-xl font-extrabold">{children}</span>;
function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return <div role="group" aria-label={label} className="flex items-center gap-1.5">
    <button type="button" aria-label={`${label} kurangi 1`} className="btn btn-sm btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-4" aria-hidden="true" /></button>
    <span className="w-10 text-center text-2xl font-extrabold">{value}</span>
    <button type="button" aria-label={`${label} tambah 1`} className="btn btn-sm btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-4" aria-hidden="true" /></button>
  </div>;
}

/** Garis bilangan dengan lompatan dari start ke pos. */
function NumberLine({ lo, hi, start, pos }: { lo: number; hi: number; start: number; pos: number }) {
  const n = hi - lo + 1, step = pos >= start ? 1 : -1;
  const hops = Array.from({ length: Math.abs(pos - start) }, (_, i) => start + i * step);
  return <div className="w-full">
    <svg viewBox={`0 0 ${n * 10} 12`} className="block h-6 w-full" preserveAspectRatio="none" aria-hidden="true">
      {hops.map(f => { const x1 = (f - lo) * 10 + 5, x2 = x1 + step * 10; return <path key={f} d={`M${x1} 11Q${(x1 + x2) / 2} -2 ${x2} 11`} fill="none" stroke="#f08a24" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />; })}
    </svg>
    <div className="grid w-full" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {Array.from({ length: n }, (_, i) => lo + i).map(k => <span key={k} className={`relative grid h-9 place-items-center border-y border-l border-purple-300 text-[11px] font-bold last:border-r sm:text-sm ${k === start ? "bg-orange-100" : k === pos ? "bg-success/20" : (k - lo) % 2 ? "bg-purple-50" : "bg-purple-100"}`}>
        {k}{k === pos && <span className="absolute -top-7 left-1/2 -translate-x-1/2"><Bunny className="size-6" /></span>}
      </span>)}
    </div>
  </div>;
}

/** Balok puluhan dan satuan. */
const Rod = () => <span className="flex h-16 w-3 flex-col overflow-hidden rounded-sm border border-red-800/50" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i} className="flex-1 border-b border-red-900/20 bg-red-500 last:border-0" />)}</span>;
const Cube = ({ faded = false }: { faded?: boolean }) => <span className={`size-3 rounded-[2px] border border-red-800/50 ${faded ? "bg-red-200" : "bg-red-500"}`} aria-hidden="true" />;
function Blocks({ n, label }: { n: number; label: string }) {
  const t = Math.floor(n / 10), u = n % 10;
  return <div role="img" aria-label={label} className="grid w-32 grid-cols-2 overflow-hidden rounded-lg border border-purple-300 text-center text-[11px]">
    <span className="bg-purple-200 py-0.5 font-bold">Puluhan</span><span className="bg-purple-200 py-0.5 font-bold">Satuan</span>
    <span className="flex min-h-20 items-center justify-center gap-1 bg-purple-50 p-1.5">{Array.from({ length: t }, (_, i) => <Rod key={i} />)}</span>
    <span className="flex min-h-20 flex-wrap content-center items-center justify-center gap-0.5 bg-purple-50 p-1.5">{Array.from({ length: u }, (_, i) => <Cube key={i} />)}</span>
  </div>;
}

/* ====================================================================== */
/* Lab A: penjumlahan tiga cara                                            */
/* ====================================================================== */
function AddLab() {
  const [a, setA] = useState(12), [b, setB] = useState(6), [pos, setPos] = useState(12);
  const s = a + b, ao = a - 10, os = ao + b;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-base-100 p-3">
      <Stepper label="Bilangan pertama" value={a} set={n => { setA(n); setPos(n); }} min={11} max={19} />
      <span className="text-2xl font-extrabold">+</span>
      <Stepper label="Bilangan kedua" value={b} set={n => { setB(n); setPos(a); }} min={1} max={9} />
    </div>
    <section className="rounded-xl bg-base-100 p-3">
      <h3 className="text-sm font-bold">Cara 1: Menghitung maju</h3>
      <div className="mt-6"><NumberLine lo={a - 1} hi={s + 1} start={a} pos={pos} /></div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-sm btn-success gap-1" disabled={pos >= s} onClick={() => setPos(pos + 1)}>Lompat maju<ArrowRight className="size-4" aria-hidden="true" /></button>
        <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={pos === a} onClick={() => setPos(a)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
      </div>
      <output data-testid="lab-result" data-value={String(pos)} aria-live="polite" className="mt-2 block text-sm leading-6">{pos === a ? `Mulai dari ${a}. Lompat ${b} kali ke kanan.` : pos < s ? `Sudah ${pos - a} lompatan, sekarang di ${pos}.` : <>Sudah {b} lompatan. <strong>{a} + {b} = {s}</strong>.</>}</output>
    </section>
    <section className="rounded-xl bg-base-100 p-3">
      <h3 className="text-sm font-bold">Cara 2: Penjumlahan bersusun</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2"><Blocks n={a} label={`${a} dengan balok`} /><span className="font-bold">+</span><Blocks n={b} label={`${b} dengan balok`} /><span className="font-bold">=</span><Blocks n={s} label={`${s} dengan balok`} /></div>
      <p className="mt-2 text-sm">Satuan: {ao} + {b} = {os}.{os >= 10 ? <> 10 satuan dipindah menjadi 1 puluhan, sisa {os - 10} satuan. Puluhan: 1 + 1 = 2.</> : <> Puluhan: 1.</>} Hasilnya <strong>{s}</strong>.</p>
    </section>
    <section className="rounded-xl bg-base-100 p-3 text-sm">
      <h3 className="font-bold">Cara 3: Pasangan bilangan</h3>
      <p className="mt-1">{a} adalah 10 dan {ao}. {ao} + {b} = {os}. 10 + {os} = <strong>{s}</strong>.</p>
    </section>
  </div>;
}

/* ====================================================================== */
/* Lab B: pengurangan dan mengurai puluhan                                 */
/* ====================================================================== */
function SubLab() {
  const [a, setA] = useState(12), [b, setB] = useState(8), [pos, setPos] = useState(12);
  const [rods, setRods] = useState(1), [cubes, setCubes] = useState(2), [taken, setTaken] = useState(0);
  const reset = (na: number, nb: number) => { setA(na); setB(nb); setPos(na); setRods(Math.floor(na / 10)); setCubes(na % 10); setTaken(0); };
  const left = b - taken, d = a - b;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-base-100 p-3">
      <Stepper label="Bilangan pertama" value={a} set={n => reset(n, Math.min(b, n - 1))} min={11} max={20} />
      <span className="text-2xl font-extrabold">−</span>
      <Stepper label="Bilangan kedua" value={b} set={n => reset(a, n)} min={1} max={a - 1} />
    </div>
    <section className="rounded-xl bg-base-100 p-3">
      <h3 className="text-sm font-bold">Cara 1: Menghitung mundur</h3>
      <div className="mt-6"><NumberLine lo={Math.max(0, d - 1)} hi={Math.min(20, a + 1)} start={a} pos={pos} /></div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-sm btn-success gap-1" disabled={pos <= d} onClick={() => setPos(pos - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Lompat mundur</button>
        <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={pos === a} onClick={() => setPos(a)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
      </div>
      <output data-testid="lab-result" data-value={String(pos)} aria-live="polite" className="mt-2 block text-sm leading-6">{pos === a ? `Mulai dari ${a}. Lompat ${b} kali ke kiri.` : pos > d ? `Sudah ${a - pos} lompatan, sekarang di ${pos}.` : <>Sudah {b} lompatan. <strong>{a} − {b} = {d}</strong>.</>}</output>
    </section>
    <section className="rounded-xl bg-base-100 p-3">
      <h3 className="text-sm font-bold">Cara 2: Ambil balok</h3>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <div className="flex min-h-20 items-end gap-1 rounded-lg bg-purple-50 p-2">{Array.from({ length: rods }, (_, i) => <Rod key={i} />)}<span className="ms-2 flex max-w-36 flex-wrap gap-0.5">{Array.from({ length: cubes }, (_, i) => <Cube key={i} />)}</span></div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className="btn btn-sm btn-outline" disabled={left <= 0 || cubes === 0} onClick={() => { setCubes(cubes - 1); setTaken(taken + 1); }}>Ambil 1 satuan</button>
          <button type="button" className="btn btn-sm btn-outline" disabled={left < 10 || rods === 0} onClick={() => { setRods(rods - 1); setTaken(taken + 10); }}>Ambil 1 puluhan</button>
          <button type="button" className="btn btn-sm btn-warning gap-1" disabled={left <= 0 || cubes > 0 || rods === 0 || left >= 10} onClick={() => { setRods(rods - 1); setCubes(cubes + 10); }}><Scissors className="size-4" aria-hidden="true" />Urai 1 puluhan</button>
        </div>
      </div>
      <p data-testid="blocks-result" data-value={String(rods * 10 + cubes)} aria-live="polite" className="mt-2 text-sm">
        {left > 0 ? (cubes === 0 && left < 10 && rods > 0 ? <>Satuan tidak cukup. Urai 1 puluhan menjadi 10 satuan.</> : <>Masih harus diambil {left}. Tersisa {rods * 10 + cubes}.</>) : <>Sudah diambil {b}. Sisa <strong>{rods * 10 + cubes}</strong>, jadi {a} − {b} = {d}.</>}
      </p>
    </section>
    <section className="rounded-xl bg-base-100 p-3 text-sm">
      <h3 className="font-bold">Cara 3: Pasangan bilangan</h3>
      <p className="mt-1">{b >= 10 ? <>{a} adalah 10 dan {a - 10}. {b} adalah 10 dan {b - 10}. 10 − 10 = 0, {a - 10} − {b - 10} = {d}. Jadi {a} − {b} = <strong>{d}</strong>.</> : <>Ubah bilangan kedua menjadi 10 atau lebih untuk mencoba cara ini, misalnya {Math.min(a - 1, 12)}.</>}</p>
    </section>
  </div>;
}

/* ====================================================================== */
/* Lab C: lebihnya, kurangnya, selisih, jumlah                             */
/* ====================================================================== */
function StoryLab() {
  const [g, setG] = useState(4), [r, setR] = useState(5);
  const diff = Math.abs(g - r), more = g > r ? "hijau" : "merah", less = g > r ? "merah" : "hijau";
  const row = (n: number, color: string, other: number, name: string, set: (x: number) => void) => <div className="flex items-center gap-2">
    <Stepper label={`Burung ${name}`} value={n} set={set} min={1} max={9} />
    <span className="flex flex-wrap gap-0.5">{Array.from({ length: n }, (_, i) => <span key={i} className={`rounded-md ${i >= other ? "bg-warning/30 ring-1 ring-warning" : ""}`}><Bird color={color} className="size-8 sm:size-9" /></span>)}</span>
  </div>;
  return <div className="space-y-4">
    <div className="space-y-2 rounded-xl bg-base-100 p-3">{row(g, "#5fb246", r, "hijau", setG)}{row(r, "#e8467c", g, "merah", setR)}
      <p className="text-xs text-base-content/60">Burung yang ditandai kuning tidak punya pasangan. Banyaknya adalah selisih.</p></div>
    <output data-testid="compare-result" data-value={`${diff}|${g + r}`} aria-live="polite" className="block space-y-1 rounded-lg bg-success/10 p-3 text-sm leading-6">
      {diff === 0 ? <p>Burung hijau dan merah sama banyak, selisihnya 0.</p> : <>
        <p>Banyak burung {less} <strong>{diff} kurangnya</strong> dari banyak burung {more}.</p>
        <p>Banyak burung {more} <strong>{diff} lebihnya</strong> dari banyak burung {less}.</p>
        <p><strong>Selisih</strong> burung hijau dan merah adalah {Math.max(g, r)} − {Math.min(g, r)} = {diff}.</p></>}
      <p><strong>Jumlah</strong> burung hijau dan merah adalah {g} + {r} = {g + r}.</p>
    </output>
  </div>;
}
const labs = [AddLab, SubLab, StoryLab];

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  if (scene.type === "groups") return <div className="w-full max-w-xl space-y-2">{scene.groups.map(gr => <div key={gr.who} className="flex items-center gap-2">
    <span className="w-24 shrink-0 text-xs font-bold sm:text-sm">{gr.who}</span>
    {gr.n === null ? <span className="grid h-9 w-12 place-items-center rounded-lg border-2 border-dashed border-orange-400 text-lg font-extrabold" aria-label="Belum diketahui">?</span>
      : <span role="img" aria-label={`${gr.n} gambar`} className="flex flex-wrap gap-0.5">{Array.from({ length: gr.n }, (_, i) => <ThingArt key={i} t={gr.thing} className="size-6 sm:size-7" />)}</span>}
  </div>)}</div>;
  return <div className="space-y-2 text-sm">
    <div className="flex flex-wrap gap-4">{scene.legend.map(l => <span key={l.shape} className="flex items-center gap-1"><ShapeArt s={l.shape} className="size-6" />bernilai {l.value}</span>)}</div>
    <div role="img" aria-label={scene.row.join(", ")} className="flex flex-wrap gap-2">{scene.row.map((s, i) => <ShapeArt key={i} s={s} className="size-10" />)}</div>
  </div>;
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked }: { p: Part; value: string; set: (v: string) => void; checked: boolean }) {
  const x = cells(p, value);
  const put = (k: number, v: string, fixed: number[] = []) => { const a = [...x]; a[k] = v; fixed.forEach(f => (a[f] = "10")); set(a.join("|")); };
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 text-xl font-bold">{p.label} <Box label={p.label} value={value} onChange={set} disabled={checked} /></label>;
    case "hop": {
      const pos = x[0] === "" ? p.a : Number(x[0]);
      return <div className="w-full space-y-2">
        <div className="pt-6"><NumberLine lo={p.lo} hi={p.hi} start={p.a} pos={pos} /></div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" className="btn btn-sm btn-outline gap-1" disabled={checked || pos <= p.lo} onClick={() => put(0, String(pos - 1))}><ArrowLeft className="size-4" aria-hidden="true" />Lompat mundur</button>
          <button type="button" className="btn btn-sm btn-outline gap-1" disabled={checked || pos >= p.hi} onClick={() => put(0, String(pos + 1))}>Lompat maju<ArrowRight className="size-4" aria-hidden="true" /></button>
          <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={checked || pos === p.a} onClick={() => put(0, "")}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
          <span className="text-xs text-base-content/60">Lompatkan kelinci dulu. Lompatan: {Math.abs(pos - p.a)}</span>
        </div>
        <label className="flex flex-wrap items-center gap-2 text-xl font-bold">{p.a} {sym(p.op)} {p.b} = <Box label="Hasil" value={x[1]} onChange={v => put(1, v)} disabled={checked} /></label>
      </div>;
    }
    case "column": {
      const digits = (n: number) => [n >= 10 ? String(Math.floor(n / 10)) : "", String(n % 10)];
      const [at, ao] = digits(p.a), [bt, bo] = digits(p.b);
      const cell = "grid h-11 w-14 place-items-center text-2xl font-bold";
      return <div className="inline-grid grid-cols-[auto_auto_auto] items-center">
        <span className="pb-1 text-center text-xs font-semibold">Puluhan</span><span className="border-l-2 border-purple-300 pb-1 text-center text-xs font-semibold">Satuan</span><span />
        <span className={cell}>{at}</span><span className={`${cell} border-l-2 border-purple-300`}>{ao}</span><span />
        <span className={cell}>{bt}</span><span className={`${cell} border-l-2 border-purple-300`}>{bo}</span><span className="px-2 text-2xl font-extrabold text-purple-600" aria-label={p.op === "+" ? "tambah" : "kurang"}>{sym(p.op)}</span>
        <span className="col-span-2 my-1 h-0.5 bg-purple-500" /><span />
        <span className="grid place-items-center p-1"><Box label="Puluhan hasil" value={x[0]} onChange={v => put(0, v)} disabled={checked} /></span>
        <span className="grid place-items-center border-l-2 border-purple-300 p-1"><Box label="Satuan hasil" value={x[1]} onChange={v => put(1, v)} disabled={checked} /></span><span />
      </div>;
    }
    case "split": {
      const fixed = p.tensGiven ? [0] : [];
      const f = (k: number, label: string) => <Box label={label} value={x[k]} onChange={v => put(k, v, fixed)} disabled={checked} />;
      return <div className="space-y-3">
        <div className="relative inline-grid grid-cols-[3.5rem_2rem_3.5rem] text-center text-2xl font-bold">
          <span>{p.a}</span><span>+</span><span className="rounded-full border-2 border-orange-400 px-1">{p.b}</span>
          <svg viewBox="0 0 56 28" className="col-span-1 h-7 w-14" aria-hidden="true"><path d="M8 26L28 2L48 26" fill="none" stroke="#1f3b30" strokeWidth="2" /></svg><span /><span />
        </div>
        <div className="flex items-center gap-2">{p.tensGiven ? <Fixed>10</Fixed> : f(0, `Puluhan dari ${p.a}`)}<span className="rounded-2xl border-2 border-orange-400 p-0.5">{f(1, `Satuan dari ${p.a}`)}</span><span className="text-xs text-base-content/60">dipasangkan dengan {p.b}</span></div>
        <div className="space-y-1.5 rounded-xl bg-orange-50 p-3 text-lg font-bold">
          <p className="flex flex-wrap items-center gap-1.5">{f(2, "Baris 1 bilangan pertama")} + {p.b} = {f(3, "Baris 1 hasil")}</p>
          <p className="flex flex-wrap items-center gap-1.5">10 + {f(4, "Baris 2 bilangan kedua")} = {f(5, "Baris 2 hasil")}</p>
          <p className="flex flex-wrap items-center gap-1.5">Jadi, {p.a} + {p.b} = {f(6, "Jadi")}</p>
        </div>
      </div>;
    }
    case "split2": {
      const fixed = p.tensGiven ? [0, 2] : [];
      const f = (k: number, label: string) => <Box label={label} value={x[k]} onChange={v => put(k, v, fixed)} disabled={checked} />;
      const tree = (n: number, kt: number, ko: number) => <div className="flex flex-col items-center">
        <span className="grid size-12 place-items-center rounded-full border-2 border-purple-400 text-xl font-bold">{n}</span>
        <svg viewBox="0 0 80 20" className="h-5 w-20" aria-hidden="true"><path d="M10 20L40 0L70 20" fill="none" stroke="#8d63c7" strokeWidth="2" /></svg>
        <div className="flex gap-2">{p.tensGiven ? <Fixed>10</Fixed> : f(kt, `Puluhan dari ${n}`)}{f(ko, `Satuan dari ${n}`)}</div>
      </div>;
      return <div className="space-y-3">
        <div className="flex flex-wrap items-start gap-3">{tree(p.a, 0, 1)}<span className="mt-2 text-3xl font-extrabold text-purple-600">−</span>{tree(p.b, 2, 3)}</div>
        <div className="space-y-1.5 rounded-xl bg-orange-50 p-3 text-lg font-bold">
          <p className="flex flex-wrap items-center gap-1.5">10 − 10 = {f(4, "Hasil puluhan")}</p>
          <p className="flex flex-wrap items-center gap-1.5">{x[1] || "…"} − {x[3] || "…"} = {f(5, "Hasil satuan")}</p>
          <p className="flex flex-wrap items-center gap-1.5">Jadi, {p.a} − {p.b} = {f(6, "Jadi")}</p>
        </div>
      </div>;
    }
    case "story": {
      const k = p.known.length, s0 = k + 1, c0 = s0 + p.steps.length;
      const fill = (text: string, idx: number) => { const [l, r] = text.split("___"); return <p key={idx} className="flex flex-wrap items-center gap-1.5">{l}<Box label={text.replace("___", "…")} value={x[idx]} onChange={v => put(idx, v)} disabled={checked} />{r}</p>; };
      return <div className="w-full space-y-3 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-xl border-2 border-purple-300 p-3"><h4 className="mb-1 font-bold">Diketahui:</h4><div className="space-y-1.5">{p.known.map((kn, i) => fill(kn.text, i))}</div></section>
          <section role="group" aria-label="Ditanya" className="rounded-xl border-2 border-purple-300 p-3"><h4 className="mb-1 font-bold">Ditanya:</h4>
            <div className="flex flex-col gap-1.5">{p.ask.options.map(op => <button key={op} type="button" disabled={checked} aria-pressed={x[k] === op} onClick={() => put(k, op)} className={`btn btn-sm h-auto min-h-8 justify-start whitespace-normal py-1 text-left ${x[k] === op ? "btn-success disabled:bg-success! disabled:text-success-content!" : "btn-outline"}`}>{op}</button>)}</div></section>
        </div>
        <section className="space-y-2 rounded-xl border-2 border-purple-300 p-3"><h4 className="font-bold">Solusi:</h4>
          {p.steps.map((st, j) => { const idx = s0 + j, [a = "", op = "", b = "", c = ""] = x[idx].split(","); const setRow = (i: number, v: string) => { const r = [a, op, b, c]; r[i] = v; put(idx, r.join(",")); };
            return <div key={st.label} className="space-y-1"><span className="block text-sm font-bold">{st.label}</span><div className="flex flex-wrap items-center gap-1 text-lg font-bold">
              <Box label={`${st.label} bilangan pertama`} value={a} onChange={v => setRow(0, v)} disabled={checked} />
              <span role="group" aria-label={`Operasi ${st.label}`} className="join">{(["+", "-"] as const).map(o => <button key={o} type="button" disabled={checked} aria-label={o === "+" ? "tambah" : "kurang"} aria-pressed={op === o} onClick={() => setRow(1, o)} className={`btn join-item btn-sm w-9 text-lg ${op === o ? "btn-success disabled:bg-success! disabled:text-success-content!" : "btn-outline"}`}>{sym(o)}</button>)}</span>
              <Box label={`${st.label} bilangan kedua`} value={b} onChange={v => setRow(2, v)} disabled={checked} />=
              <Box label={`${st.label} hasil`} value={c} onChange={v => setRow(3, v)} disabled={checked} /></div></div>; })}
          <div className="space-y-1.5 border-t border-dashed border-base-300 pt-2">{p.conclude.map((c, i) => fill(c.text, c0 + i))}</div>
        </section>
      </div>;
    }
    case "choice": return <div role="group" aria-label="Pilihan" className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map((op, k) => <button key={op} type="button" aria-label={op} aria-pressed={value === op} disabled={checked} onClick={() => set(op)}
        className={`flex flex-col items-center gap-1 rounded-2xl border-4 p-2 font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>
        {p.pots ? <><FlowerPot n={p.pots[k]} /><span>{op}</span></> : p.abacus ? <><Abacus n={p.abacus[k]} /><span>{op}</span></> : <span className="px-2 text-lg">{op}</span>}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: AQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeTwoAddSub() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 2, Bab 2</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Penjumlahan dan Pengurangan</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Menjumlah dan mengurang dengan menghitung maju dan mundur, cara bersusun, dan pasangan bilangan, lalu menyelesaikan soal cerita langkah demi langkah.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-1">{Array.from({ length: 5 }, (_, i) => <ThingArt key={i} t="jambu" className="size-8" />)}</div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Panen jambu air</h2>
        <p className="mt-2 text-sm text-base-content/60">3 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-hitung">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-hitung" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-4 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 whitespace-normal ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
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
      </> : <GradeFourQuiz<AQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
