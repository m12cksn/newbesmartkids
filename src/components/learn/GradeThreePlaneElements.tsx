"use client";

import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { assessment, correct, formatAnswer, practice, ready, SEP, splitParts, topics, type PQuestion, type Part } from "@/data/grade-three-plane-elements";
import { AngleFig, AngleTool, CutTool, FigView, GridFig, SegmentTool } from "./PlaneVisuals";

function Result({ value, ok, children }: { value: string; ok: boolean; children: ReactNode }) {
  return <output data-testid="lab-result" data-value={value} aria-live="polite" className={`block rounded-lg p-3 text-sm leading-6 ${ok ? "bg-success/10" : "bg-base-100"}`}>{children}</output>;
}
const fmt = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");
const angleType = (d: number) => d === 0 ? "Belum membentuk sudut (0°)" : d < 90 ? "Sudut lancip" : d === 90 ? "Sudut siku-siku" : d < 180 ? "Sudut tumpul" : d === 180 ? "Sudut lurus" : "Sudut refleks";

/* ====================================================================== */
/* Lab A: ruas garis dan sisi                                              */
/* ====================================================================== */
function SidesLab() {
  const [len, setLen] = useState(5.5);
  const [n, setN] = useState(4);
  const names = "ABCDEFGH".slice(0, n).split("");
  const pts = names.map((_, i) => { const a = -Math.PI / 2 - Math.PI / n + (2 * Math.PI * i) / n; return [80 + 58 * Math.cos(a), 74 + 58 * Math.sin(a)]; });
  const sides = names.map((x, i) => `${x}${names[(i + 1) % n]}`);
  return <div className="space-y-4">
    <SegmentTool value={len} onChange={setLen} />
    <p className="rounded-lg bg-base-100 p-2 text-sm">AB = <strong>{Math.floor(len)} cm {Math.round((len % 1) * 10)} mm</strong> = <strong>{fmt(len)} cm</strong>. Ingat: 1 cm = 10 mm.</p>
    <div className="grid items-center gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-2">
      <svg viewBox="0 0 160 150" className="mx-auto w-44" role="img" aria-label={`Bangun dengan ${n} sisi`}>
        <path d={`M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`} fill="#dcfce7" stroke="#16a34a" strokeWidth="2.6" strokeLinejoin="round" />
        {pts.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="3" fill="#17352a" /><text x={80 + (x - 80) * 1.22} y={74 + (y - 74) * 1.22 + 4} fontSize="12" fontWeight="800" textAnchor="middle">{names[i]}</text></g>)}
      </svg>
      <div className="space-y-2">
        <label className="block text-sm font-bold">Banyak sisi: {n}
          <input type="range" aria-label="Banyak sisi" min={3} max={8} value={n} onChange={e => setN(Number(e.target.value))} className="range range-success range-sm mt-1 w-full" />
        </label>
        <Result value={String(n)} ok>{n} sisi: {sides.join(", ")}.<br />{n} sudut: {names.map(x => `∠${x}`).join(", ")}.<br />Banyak sisi = banyak sudut = <strong>{n}</strong>.</Result>
      </div>
    </div>
  </div>;
}

/* ====================================================================== */
/* Lab B: busur derajat                                                     */
/* ====================================================================== */
function AnglesLab() {
  const [deg, setDeg] = useState(60);
  return <div className="space-y-4">
    <AngleTool value={deg} onChange={setDeg} />
    <div className="flex flex-wrap gap-1.5">{[30, 90, 120, 180].map(d => <button key={d} type="button" className="btn btn-sm btn-outline" onClick={() => setDeg(d)}>{d}°</button>)}</div>
    <Result value={String(deg)} ok={deg === 90}>
      ∠AOB = <strong>{deg}°</strong>: <strong>{angleType(deg)}</strong>.{" "}
      {deg > 0 && deg < 180 && <>Sudut refleks pasangannya 360° − {deg}° = <strong>{360 - deg}°</strong>.</>}
      {deg === 90 && <> Pojok kertas yang dilipat dua kali pas menempel di sudut ini.</>}
    </Result>
    <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold sm:grid-cols-4">{[[40, "Lancip < 90°"], [90, "Siku-siku = 90°"], [130, "Tumpul 90°–180°"], [180, "Lurus = 180°"]].map(([d, t]) =>
      <figure key={t as string} className="rounded-lg border border-base-300 bg-base-100 p-1"><AngleFig deg={d as number} names={["", "", ""]} size="w-full" /><figcaption>{t}</figcaption></figure>)}</div>
  </div>;
}

/* ====================================================================== */
/* Lab C: garis tegak lurus dan sejajar di kertas berpetak                  */
/* ====================================================================== */
function LinesLab() {
  const [turn, setTurn] = useState(45);
  const [shift, setShift] = useState(2);
  // Garis 1 mendatar di y = 4. Garis 2 melewati (3, 4 - shift) dengan arah turn derajat.
  const r = (turn * Math.PI) / 180, cx = 3, cy = 4 - shift, L = 4;
  const seg2: [number, number, number, number, string] = [cx - L * Math.cos(r), cy + L * Math.sin(r), cx + L * Math.cos(r), cy - L * Math.sin(r), "#2563eb"];
  const clip = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const s2 = seg2.map((v, i) => i < 4 ? clip(v as number, 0.2, i % 2 ? 4.8 : 5.8) : v) as typeof seg2;
  const kind = turn === 0 || turn === 180 ? (shift === 0 ? "berimpit" : "sejajar") : turn === 90 ? "tegak lurus" : "berpotongan";
  const cross = turn === 90 ? [[cx, 4]] as [number, number][] : [];
  return <div className="space-y-4">
    <div className="rounded-xl bg-base-100 p-3"><GridFig fig={{ t: "grid", w: 6, h: 5, segs: [[0.2, 4, 5.8, 4, "#e11d48"], turn === 90 ? [cx, 0.2, cx, 4.8, "#2563eb"] : s2], right: cross, arrows: kind === "sejajar" ? [0, 1] : [] }} className="mx-auto w-full max-w-72" /></div>
    <label className="block text-sm font-bold">Putar garis biru: {turn}°
      <input type="range" aria-label="Putar garis biru" min={0} max={180} step={15} value={turn} onChange={e => setTurn(Number(e.target.value))} className="range range-info range-sm mt-1 w-full" />
    </label>
    <label className="block text-sm font-bold">Geser garis biru ke atas: {shift} petak
      <input type="range" aria-label="Geser garis biru" min={0} max={3} value={shift} onChange={e => setShift(Number(e.target.value))} className="range range-success range-sm mt-1 w-full" />
    </label>
    <Result value={kind} ok={kind === "sejajar" || kind === "tegak lurus"}>
      {kind === "sejajar" ? <>Garis merah dan biru <strong>sejajar</strong>: jaraknya di kiri dan di kanan sama-sama {shift} petak, jadi tidak pernah berpotongan.</>
        : kind === "tegak lurus" ? <>Garis merah dan biru <strong>tegak lurus</strong>: keduanya berpotongan membentuk sudut siku-siku.</>
        : kind === "berimpit" ? <>Kedua garis berimpit (menumpuk). Geser garis biru agar terlihat sejajar.</>
        : <>Kedua garis <strong>berpotongan</strong>, tetapi sudutnya {turn < 90 ? "lancip" : "tumpul"}, bukan siku-siku. Jadi tidak tegak lurus dan tidak sejajar.</>}
    </Result>
  </div>;
}

const labs = [SidesLab, AnglesLab, LinesLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, i, value, set, checked }: { p: Part; i: number; value: string; set: (v: string) => void; checked: boolean }) {
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 font-bold"><span className="rounded-full bg-[#fbf7d9] px-3 py-1.5 text-sm">{p.label} =</span>
      <input aria-label={p.label} inputMode="decimal" value={value} disabled={checked} placeholder="…" onChange={e => set(e.target.value.replace(/[^\d,.]/g, "").slice(0, 6))}
        className="h-10 w-20 rounded-lg border-2 border-dashed border-neutral/40 bg-white text-center text-lg font-extrabold text-success focus:border-success focus:outline-none" />{p.unit}</label>;
    case "choice": return <div role="group" aria-label={`Bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" aria-pressed={value === o} disabled={checked} className={`btn btn-sm h-auto min-h-9 whitespace-normal ${value === o ? "btn-neutral" : "btn-outline"}`} onClick={() => set(o)}>{o}</button>)}</div></div>;
    case "check": { const sel = value ? value.split(",").filter(Boolean).map(Number) : []; return <div className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className={`grid gap-2 ${p.cards.some(c => c.fig) ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>{p.cards.map((c, k) => { const on = sel.includes(k); return <button key={c.name} type="button" aria-pressed={on} aria-label={`Centang ${c.name}`} disabled={checked}
        className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 ${on ? "border-success bg-success/10" : "border-base-300 bg-base-100"}`} onClick={() => set((on ? sel.filter(x => x !== k) : [...sel, k]).sort((x, y) => x - y).join(","))}>
        {c.fig && <FigView fig={c.fig} />}<span className="text-sm font-bold">{c.name}</span>
        <span className={`grid h-7 w-12 place-items-center rounded-full border-2 border-[#d9e35b] bg-white text-lg font-extrabold ${on ? "text-success" : "text-base-content/30"}`}>{on ? "✓" : "…"}</span></button>; })}</div></div>; }
    case "sort": { const sel = value ? value.split(",") : p.items.map(() => ""); return <div className="space-y-2">{p.items.map((it, k) => <div key={it.name} role="group" aria-label={it.name} className="flex flex-wrap items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-2">
      <div className="flex min-w-24 items-center gap-2">{it.fig && <FigView fig={it.fig} />}<span className="text-sm font-bold">{it.name}</span></div><span aria-hidden="true" className="text-base-content/40">→</span>
      <div className="flex flex-wrap gap-1">{p.bins.map((b, bi) => <button key={b} type="button" aria-pressed={sel[k] === String(bi)} disabled={checked} className={`btn btn-xs h-auto min-h-8 whitespace-normal sm:btn-sm ${sel[k] === String(bi) ? "btn-neutral" : "btn-outline"}`} onClick={() => set(sel.map((x, j) => j === k ? String(bi) : x).join(","))}>{b}</button>)}</div></div>)}</div>; }
    case "order": { const sel = value ? value.split(",").filter(Boolean).map(Number) : []; return <div className="space-y-2"><p className="text-sm font-bold">{p.label}: ketuk dari yang terkecil.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{p.cards.map((c, k) => { const at = sel.indexOf(k); return <button key={c.name} type="button" aria-label={`Sudut ${c.name}`} aria-pressed={at >= 0} disabled={checked || at >= 0}
        className={`relative flex flex-col items-center rounded-xl border-2 p-1 ${at >= 0 ? "border-info bg-info/10" : "border-base-300 bg-base-100"}`} onClick={() => set([...sel, k].join(","))}>
        {at >= 0 && <span className="badge badge-info absolute right-1 top-1">{at + 1}</span>}{c.fig && <FigView fig={c.fig} />}<span className="font-bold">{c.name}</span></button>; })}</div>
      <p aria-live="polite" className="text-sm font-semibold">{sel.length ? sel.map(k => p.cards[k].name).join(" → ") : "Belum ada urutan."}</p>
      <button type="button" className="btn btn-ghost btn-xs" disabled={checked || !sel.length} onClick={() => set(sel.slice(0, -1).join(","))}>Batalkan terakhir</button></div>; }
    case "angle": return <AngleTool value={Number(value) || 0} disabled={checked} onChange={v => set(String(v))} />;
    case "segment": return <SegmentTool value={Number(value.replace(",", ".")) || 0} a={p.label[0]} b={p.label[1]} disabled={checked} onChange={v => set(fmt(v))} />;
    case "cut": { const sel = value.includes("|") ? value.split("|")[1].split(",").filter(Boolean).map(Number) : []; return <div className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <CutTool selected={sel} disabled={checked} toggle={k => { const n = sel.includes(k) ? sel.filter(x => x !== k) : [...sel, k].sort(); set(`${n.length + 1}|${n.join(",")}`); }} /></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} p={p} i={i} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeThreePlaneElements() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 3 · Bab 4</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Unsur-Unsur Bangun Datar</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Kenali sisi, ukur dan gambar sudut dengan busur derajat, lalu temukan garis tegak lurus dan garis sejajar.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-gradient-to-br from-info/10 to-success/10 p-6 text-center">
        <div className="w-40" aria-hidden="true"><AngleFig deg={60} names={["", "", ""]} protractor size="w-full" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Ukur, putar, lalu periksa</h2>
        <p className="mt-2 text-sm text-base-content/60">3 materi interaktif, {practice.flat().length} latihan materi, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bangun">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bangun" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<PQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 4"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.fig ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><FigView fig={q.fig} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
