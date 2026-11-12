"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Frac, FracText, ModelFig, SceneView } from "./GradeFiveFractionsArt";
import {
  assessment, cells, correct, formatAnswer, fr, gcd, lcm, practice, ready, SEP, splitParts, topics,
  type FQuestion, type Op, type Part,
} from "@/data/grade-five-fractions";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, w = "w-12" }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
    className={`h-9 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-base font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
/** Kotak pecahan: pembilang di atas garis, penyebut di bawah. Penyebut boleh tetap. */
function FracBox({ label, n, d, setN, setD, disabled }: { label: string; n: string; d: string | number; setN: (v: string) => void; setD?: (v: string) => void; disabled?: boolean }) {
  return <span className="inline-flex flex-col items-center gap-0.5 align-middle">
    <Box label={`${label} pembilang`} value={n} onChange={setN} disabled={disabled} />
    <span className="h-0.5 w-12 bg-neutral" aria-hidden="true" />
    {setD ? <Box label={`${label} penyebut`} value={String(d)} onChange={setD} disabled={disabled} /> : <span className="grid h-9 w-12 place-items-center text-base font-extrabold">{d || "…"}</span>}
  </span>;
}
const sym = (op: Op) => (op === "+" ? "+" : "−");
const Eq = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap items-center gap-2 text-lg font-bold">{children}</div>;
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1">
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="w-6 text-center text-lg font-extrabold">{value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
/** Pemilih pecahan untuk peraga: pembilang di atas penyebut. */
function FracPicker({ name, n, d, setN, setD, maxN }: { name: string; n: number; d: number; setN: (x: number) => void; setD: (x: number) => void; maxN?: number }) {
  return <div className="flex flex-col items-center gap-1 rounded-xl bg-base-100 p-2"><span className="text-xs font-semibold">{name}</span>
    <Stepper label={`Pembilang ${name}`} value={n} set={setN} min={1} max={maxN ?? d} /><span className="h-0.5 w-20 bg-neutral" aria-hidden="true" /><Stepper label={`Penyebut ${name}`} value={d} set={x => { setD(x); if (n > (maxN ?? x)) setN(maxN ?? x); }} min={2} max={12} /></div>;
}
const simp = (n: number, d: number) => { const g = gcd(n, d) || 1; const N = n / g, D = d / g; return D === 1 ? String(N) : N > D ? `${Math.floor(N / D)} ${N % D}/${D}` : `${N}/${D}`; };
/** Pita berpetak L dengan beberapa warna. */
function CommonBar({ L, segs, cross = 0, label }: { L: number; segs: { n: number; color: string }[]; cross?: number; label: string }) {
  const units = Math.max(1, Math.ceil(segs.reduce((a, s) => a + s.n, 0) / L));
  const cellsList = segs.flatMap(s => Array.from({ length: s.n }, () => s.color));
  const filled = cellsList.length;
  return <div className="space-y-1" role="img" aria-label={label}>{Array.from({ length: units }, (_, u) => <div key={u} className="flex h-7 w-full overflow-hidden rounded border border-sky-800/50 bg-white">
    {Array.from({ length: L }, (_, i) => { const k = u * L + i; const crossed = k >= filled - cross && k < filled;
      return <span key={i} className="relative flex-1 border-r border-sky-800/30 last:border-0" style={{ background: k < filled ? cellsList[k] : undefined }}>{crossed && <svg viewBox="0 0 10 10" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true"><path d="M0 10L10 0" stroke="#1f3b30" strokeWidth="1" vectorEffect="non-scaling-stroke" /></svg>}</span>; })}
  </div>)}</div>;
}

/* ====================================================================== */
/* Lab A: membandingkan                                                    */
/* ====================================================================== */
function CompareLab() {
  const [an, setAn] = useState(2), [ad, setAd] = useState(3), [bn, setBn] = useState(3), [bd, setBd] = useState(5), [eq, setEq] = useState(false);
  const L = lcm(ad, bd), A = an * (L / ad), B = bn * (L / bd), sign = A === B ? "=" : A > B ? ">" : "<";
  const pos = (n: number, d: number) => `${(n / d) * 100}%`;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-center gap-3"><FracPicker name="A" n={an} d={ad} setN={x => { setAn(x); setEq(false); }} setD={x => { setAd(x); setEq(false); }} /><span className="text-3xl font-extrabold text-success" aria-hidden="true">{sign}</span><FracPicker name="B" n={bn} d={bd} setN={x => { setBn(x); setEq(false); }} setD={x => { setBd(x); setEq(false); }} /></div>
    <div className="space-y-2 rounded-xl bg-base-100 p-3">
      <div className="flex items-center gap-2"><span className="w-6 font-bold">A</span><ModelFig m={{ shape: "bar", d: ad, k: an }} className="w-full" /></div>
      <div className="flex items-center gap-2"><span className="w-6 font-bold">B</span><ModelFig m={{ shape: "bar", d: bd, k: bn }} className="w-full" /></div>
      <div className="relative mx-8 mt-6 h-8 border-t-2 border-sky-800" aria-hidden="true">
        {[0, 1].map(x => <span key={x} className="absolute -top-2 h-3 w-0.5 bg-sky-800" style={{ left: `${x * 100}%` }}><span className="absolute top-3 -translate-x-1/2 text-xs font-bold">{x}</span></span>)}
        <span className="absolute -top-7 -translate-x-1/2 rounded bg-orange-200 px-1 text-xs font-bold" style={{ left: pos(an, ad) }}>A</span>
        <span className="absolute top-4 -translate-x-1/2 rounded bg-sky-200 px-1 text-xs font-bold" style={{ left: pos(bn, bd) }}>B</span>
      </div>
      <p className="text-xs text-base-content/60">Pada garis bilangan, makin ke kanan makin besar.</p>
    </div>
    <button type="button" className="btn btn-sm btn-success" onClick={() => setEq(true)} disabled={eq}>Samakan penyebut</button>
    <output data-testid="lab-result" data-value={eq ? sign : ""} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">
      {eq ? <>KPK dari {ad} dan {bd} adalah {L}. <FracText text={`${an}/${ad} = ${A}/${L}`} /> dan <FracText text={`${bn}/${bd} = ${B}/${L}`} />. Bandingkan pembilangnya: {A} {sign} {B}, jadi <FracText text={`${an}/${ad}`} /> {sign} <FracText text={`${bn}/${bd}`} />.</> : "Tebak dulu dari gambarnya, lalu ketuk Samakan penyebut untuk membuktikan."}
    </output>
  </div>;
}

/* ====================================================================== */
/* Lab B dan C: menjumlah dan mengurang                                    */
/* ====================================================================== */
function OpLab({ op }: { op: Op }) {
  const [an, setAn] = useState(op === "+" ? 1 : 2), [ad, setAd] = useState(op === "+" ? 2 : 3), [bn, setBn] = useState(op === "+" ? 1 : 1), [bd, setBd] = useState(op === "+" ? 3 : 2), [eq, setEq] = useState(false);
  const L = lcm(ad, bd), A = an * (L / ad), B = bn * (L / bd), R = op === "+" ? A + B : A - B;
  const reset = (f: (x: number) => void) => (x: number) => { f(x); setEq(false); };
  const bad = op === "-" && R < 0;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-center gap-3"><FracPicker name="A" n={an} d={ad} setN={reset(setAn)} setD={reset(setAd)} /><span className="text-3xl font-extrabold" aria-hidden="true">{sym(op)}</span><FracPicker name="B" n={bn} d={bd} setN={reset(setBn)} setD={reset(setBd)} /></div>
    <div className="space-y-2 rounded-xl bg-base-100 p-3">
      <div className="flex items-center gap-2"><span className="w-6 font-bold">A</span><ModelFig m={{ shape: "bar", d: ad, k: an }} className="w-full" /></div>
      <div className="flex items-center gap-2"><span className="w-6 font-bold">B</span><ModelFig m={{ shape: "bar", d: bd, k: bn }} className="w-full" /></div>
      {eq && !bad && <div className="space-y-1 border-t border-dashed border-base-300 pt-2"><p className="text-xs">Dipotong menjadi {L} bagian sama besar:</p>
        {op === "+" ? <CommonBar L={L} label={`${A} ditambah ${B} dari ${L}`} segs={[{ n: A, color: "#f08a6e" }, { n: B, color: "#7cc7e8" }]} /> : <CommonBar L={L} label={`${A} dikurangi ${B} dari ${L}`} segs={[{ n: A, color: "#f08a6e" }]} cross={B} />}
        <p className="text-xs text-base-content/60">{op === "+" ? "Jingga = A, biru = B." : "Bagian bergaris miring diambil (B). Yang tersisa adalah hasilnya."}</p></div>}
    </div>
    <button type="button" className="btn btn-sm btn-success" onClick={() => setEq(true)} disabled={eq}>Samakan penyebut</button>
    <output data-testid="lab-result" data-value={eq && !bad ? `${R}/${L}` : ""} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">
      {bad ? "Pecahan A lebih kecil dari B. Pilih A yang lebih besar untuk pengurangan." : eq ? <>KPK dari {ad} dan {bd} adalah {L}. <FracText text={`${an}/${ad} ${sym(op)} ${bn}/${bd} = ${A}/${L} ${sym(op)} ${B}/${L} = ${R}/${L}`} />{R > 0 && simp(R, L) !== `${R}/${L}` && <> = <FracText text={simp(R, L)} /></>}.</> : `Penyebut ${ad} dan ${bd}${ad === bd ? " sudah sama" : " berbeda"}. Ketuk Samakan penyebut.`}
    </output>
  </div>;
}
function AddLab() { return <OpLab op="+" />; }
function SubLab() { return <OpLab op="-" />; }
const labs = [CompareLab, AddLab, SubLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "frac": return <div className="flex flex-wrap items-center gap-2 font-bold"><span>{p.label}</span>
      <Box label={`${p.label} bulat`} value={x[0]} onChange={v => put(0, v)} disabled={checked} w="w-10" />
      <FracBox label={p.label} n={x[1]} d={x[2]} setN={v => put(1, v)} setD={v => put(2, v)} disabled={checked} />
      <span className="text-xs font-normal text-base-content/60">{p.mixed ? "Tulis bilangan bulat di kotak kiri." : "Kotak kiri untuk bilangan bulat, kosongkan jika tidak ada."}</span></div>;
    case "sign": return <div role="group" aria-label={`Tanda bagian ${i + 1}`} className="flex flex-wrap items-center gap-3 text-xl"><Frac s={p.left} />
      <span className="join">{(["<", "=", ">"] as const).map(s => <button key={s} type="button" aria-label={s === "<" ? "kurang dari" : s === ">" ? "lebih dari" : "sama dengan"} aria-pressed={value === s} disabled={checked} onClick={() => set(s)} className={`btn join-item btn-sm w-11 text-lg ${value === s ? on : "btn-outline"}`}>{s}</button>)}</span><Frac s={p.right} /></div>;
    case "order": { const sel = value ? value.split(";") : [];
      return <div role="group" aria-label={p.label} className="space-y-2"><p className="text-sm font-bold">{p.label}</p>
        <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={op} disabled={checked || sel.includes(op)} onClick={() => set([...sel, op].join(";"))} className="btn btn-outline h-auto min-h-14 px-3 text-lg"><Frac s={op} /></button>)}</div>
        <div className="flex flex-wrap items-center gap-1.5">{p.options.map((_, k) => <span key={k} className="flex items-center gap-1.5">{k > 0 && <span className="text-sm">,</span>}<span className="grid min-h-12 min-w-14 place-items-center rounded-lg border-2 border-dashed border-orange-400 bg-white px-1 text-lg">{sel[k] ? <Frac s={sel[k]} /> : "…"}</span></span>)}</div>
        <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || !sel.length} onClick={() => set(sel.slice(0, -1).join(";"))}><Undo2 className="size-3.5" aria-hidden="true" />Batalkan terakhir</button></div>; }
    case "convert": { const f = fr(p.mixed);
      return <Eq><Frac s={p.mixed} className="text-2xl" />=<span className="inline-flex flex-col items-center gap-0.5"><span className="flex items-center gap-1">(<Box label="Dikalikan pertama" value={x[0]} onChange={v => put(0, v)} disabled={checked} />×<Box label="Dikalikan kedua" value={x[1]} onChange={v => put(1, v)} disabled={checked} />) +<Box label="Ditambah" value={x[2]} onChange={v => put(2, v)} disabled={checked} /></span><span className="h-0.5 w-full bg-neutral" /><span>{f.d}</span></span>=
        <FracBox label="Hasil" n={x[3]} d={x[4]} setN={v => put(3, v)} setD={v => put(4, v)} disabled={checked} /></Eq>; }
    case "equalize": return <div className="space-y-2"><label className="flex items-center gap-2 font-bold">KPK dari {p.fracs.map(f => fr(f).d).join(", ")} = <Box label="KPK" value={x[0]} onChange={v => put(0, v)} disabled={checked} /></label>
      <div className="flex flex-wrap gap-4">{p.fracs.map((f, k) => <Eq key={f}><Frac s={f} className="text-xl" />=<FracBox label={`Senilai ${f}`} n={x[k + 1]} d={x[0]} setN={v => put(k + 1, v)} disabled={checked} /></Eq>)}</div></div>;
    case "chain": return <Eq><Frac s={p.a} className="text-xl" />{sym(p.op)}<Frac s={p.b} className="text-xl" />=<FracBox label="Pecahan pertama" n={x[0]} d={p.D} setN={v => put(0, v)} disabled={checked} />{sym(p.op)}<FracBox label="Pecahan kedua" n={x[1]} d={p.D} setN={v => put(1, v)} disabled={checked} />=
      <Box label="Hasil bulat" value={x[2]} onChange={v => put(2, v)} disabled={checked} w="w-10" /><FracBox label="Hasil" n={x[3]} d={p.D} setN={v => put(3, v)} disabled={checked} /><span className="basis-full text-xs font-normal text-base-content/60">Kotak kecil sebelum hasil untuk bilangan bulat jika hasilnya lebih dari 1. Kosongkan jika tidak ada.</span></Eq>;
    case "split": { const a = fr(p.a), b = fr(p.b);
      return <div className="space-y-3">
        <Eq><span className="w-36 text-sm">1. Bilangan bulat:</span>{a.w} {sym(p.op)} {b.w} = <Box label="Hasil bilangan bulat" value={x[0]} onChange={v => put(0, v)} disabled={checked} /></Eq>
        <Eq><span className="w-36 text-sm">2. Pecahan:</span><Frac s={`${a.n}/${a.d}`} />{sym(p.op)}<Frac s={`${b.n}/${b.d}`} />=<FracBox label="Pecahan pertama" n={x[1]} d={p.D} setN={v => put(1, v)} disabled={checked} />{sym(p.op)}<FracBox label="Pecahan kedua" n={x[2]} d={p.D} setN={v => put(2, v)} disabled={checked} />=<FracBox label="Hasil pecahan" n={x[3]} d={p.D} setN={v => put(3, v)} disabled={checked} /></Eq>
        <Eq><span className="w-36 text-sm">3. Gabungkan:</span><Box label="Jadi bulat" value={x[4]} onChange={v => put(4, v)} disabled={checked} /><FracBox label="Jadi" n={x[5]} d={p.D} setN={v => put(5, v)} disabled={checked} /></Eq>
        <p className="text-xs text-base-content/60">Jika hasil pecahan lebih dari 1, tambahkan 1 ke bilangan bulat.</p></div>; }
    case "shade": { const sel = value ? value.split(",").map(Number) : [];
      return <div className="space-y-1"><p className="text-sm font-bold">{p.label}: ketuk bagian untuk mengarsir.</p><ModelFig m={p.model} shaded={sel} disabled={checked} label={p.label} onTap={k => set((sel.includes(k) ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))} /><p className="text-xs text-base-content/60">Diarsir {sel.length} dari {p.model.d} bagian.</p></div>; }
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><FracText text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map((op, k) => <button key={op} type="button" aria-label={op} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`flex items-center gap-2 rounded-2xl border-4 px-3 py-1.5 text-lg ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><span className="text-sm font-bold">{"ABCD"[k]}.</span><Frac s={op} /></button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: FQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-5">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeFiveFractions() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 5, Bab 3</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Bilangan Pecahan</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Bandingkan dan urutkan pecahan, lalu jumlahkan dan kurangkan pecahan biasa maupun campuran dengan menyamakan penyebut.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-2"><ModelFig m={{ shape: "pie", d: 6, k: 2, food: "wingko" }} className="size-16" /><ModelFig m={{ shape: "pie", d: 8, k: 3, food: "martabak" }} className="size-16" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Jajanan pasar dan pecahan</h2>
        <p className="mt-2 text-sm text-base-content/60">3 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-pecahan">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-pecahan" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-4 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={topic} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-8">{t.steps.map(x => <li key={x}><FracText text={x} /></li>)}</ol>
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
      </> : <GradeFourQuiz<FQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <FracText text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
