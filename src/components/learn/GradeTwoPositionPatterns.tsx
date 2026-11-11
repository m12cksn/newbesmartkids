"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Eraser, Volume2 } from "lucide-react";
import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { PairView, RowView, SceneView, TokenView } from "./PositionVisuals";
import {
  assessment, colorHex, correct, formatAnswer, periodOf, practice, ready, SEP, splitParts, tokenName, topics,
  type Fig, type Mover, type Part, type Pos, type PQuestion, type Ref, type Token,
} from "@/data/grade-two-position-patterns";

function FigView({ fig, size = "md" }: { fig: Fig; size?: "sm" | "md" | "lg" }) {
  if (fig.t === "pair") return <PairView mover={fig.mover} target={fig.ref} pos={fig.pos} className={size === "sm" ? "w-28" : size === "md" ? "w-40" : "w-full max-w-64"} />;
  if (fig.t === "scene") return <SceneView s={fig.s} />;
  if (fig.t === "row") return <RowView items={fig.items} className={size === "sm" ? "size-6" : "size-9"} />;
  return <TokenView tk={fig.tk} className={size === "sm" ? "size-8" : "size-12"} />;
}

/* ====================================================================== */
/* Lab A: pindahkan benda                                                  */
/* ====================================================================== */
const opposite: Record<Pos, Pos> = { atas: "bawah", bawah: "atas", depan: "belakang", belakang: "depan", kanan: "kiri", kiri: "kanan" };
const refs: { id: Ref; name: string; no: Pos[] }[] = [
  { id: "meja", name: "Meja", no: [] }, { id: "kursi", name: "Kursi", no: [] }, { id: "kotak", name: "Kotak", no: ["bawah"] }, { id: "sepeda", name: "Sepeda", no: ["bawah"] },
];
const dirIcon: Partial<Record<Pos, typeof ArrowUp>> = { atas: ArrowUp, bawah: ArrowDown, kiri: ArrowLeft, kanan: ArrowRight };
const say = (p: Pos) => (p === "kanan" || p === "kiri" ? `di sebelah ${p}` : `di ${p}`);
function PositionLab() {
  const [ref, setRef] = useState<Ref>("meja");
  const [mover, setMover] = useState<Mover>("bola");
  const [pos, setPos] = useState<Pos>("atas");
  const r = refs.find(x => x.id === ref)!, M = mover === "bola" ? "Bola" : "Kucing", R = r.name;
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-3">
      <div role="group" aria-label="Benda patokan" className="flex flex-wrap gap-1.5">{refs.map(x => <button key={x.id} type="button" aria-pressed={ref === x.id} className={`btn btn-sm ${ref === x.id ? "btn-success" : "btn-outline"}`} onClick={() => { setRef(x.id); if (x.no.includes(pos)) setPos("atas"); }}>{x.name}</button>)}</div>
      <div role="group" aria-label="Benda yang dipindah" className="flex gap-1.5">{(["bola", "kucing"] as Mover[]).map(m => <button key={m} type="button" aria-pressed={mover === m} className={`btn btn-sm ${mover === m ? "btn-info" : "btn-outline"}`} onClick={() => setMover(m)}>{m === "bola" ? "Bola" : "Kucing"}</button>)}</div>
    </div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-2"><PairView mover={mover} target={ref} pos={pos} className="w-full max-w-80" /></div>
    <div role="group" aria-label="Pindahkan" className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
      {(["atas", "bawah", "depan", "belakang", "kiri", "kanan"] as Pos[]).map(p => { const I = dirIcon[p]; return <button key={p} type="button" disabled={r.no.includes(p)} aria-pressed={pos === p} className={`btn btn-sm gap-1 ${pos === p ? "btn-success" : "btn-outline"}`} onClick={() => setPos(p)}>{I && <I className="size-4" aria-hidden="true" />}{p[0].toUpperCase() + p.slice(1)}</button>; })}
    </div>
    <output data-testid="lab-result" data-value={pos} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      <strong>{M} {say(pos)} {R.toLowerCase()}.</strong><br />Kalimat kebalikannya: {R} {say(opposite[pos])} {M.toLowerCase()}.
      {(pos === "kanan" || pos === "kiri") && <> Kanan dan kiri mengikuti tanganmu saat melihat gambar.</>}
    </output>
  </div>;
}

/* ====================================================================== */
/* Lab B: buat pola                                                        */
/* ====================================================================== */
const kinds = {
  Bentuk: ["circle:hijau", "triangle:hijau", "square:hijau", "star:hijau", "heart:hijau"],
  Warna: ["circle:merah", "circle:biru", "circle:kuning", "circle:ungu", "circle:oranye"],
  Gerakan: ["pose:atas", "pose:bungkuk", "pose:jongkok"],
  Suara: ["clap:1", "clap:2", "clap:3", "clap:4"],
} as const;
type Kind = keyof typeof kinds;
function playClaps(core: Token[]) {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new Ctx(); let t = ac.currentTime + 0.05;
    for (let r = 0; r < 2; r++) for (const tk of core) {
      const n = Number(tk.split(":")[1]);
      for (let i = 0; i < n; i++) {
        const buf = ac.createBuffer(1, ac.sampleRate * 0.06, ac.sampleRate), d = buf.getChannelData(0);
        for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * Math.exp(-k / (ac.sampleRate * 0.012));
        const src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination); src.start(t); t += 0.22;
      }
      t += 0.45;
    }
  } catch { /* suara tidak tersedia */ }
}
function PatternLab() {
  const [kind, setKind] = useState<Kind>("Bentuk");
  const [core, setCore] = useState<Token[]>(["circle:hijau", "triangle:hijau"]);
  const strip = Array.from({ length: 12 }, (_, i) => core.length ? core[i % core.length] : null);
  const isPattern = core.length >= 2 && new Set(core).size > 1;
  const pick = (k: Kind) => { setKind(k); setCore([kinds[k][0], kinds[k][1]]); };
  return <div className="space-y-4">
    <div role="tablist" aria-label="Jenis pola" className="flex flex-wrap gap-1.5">{(Object.keys(kinds) as Kind[]).map(k => <button key={k} type="button" role="tab" aria-selected={kind === k} className={`btn btn-sm ${kind === k ? "btn-success" : "btn-outline"}`} onClick={() => pick(k)}>Pola {k.toLowerCase()}</button>)}</div>
    <div className="rounded-xl bg-base-100 p-3">
      <p className="text-sm font-semibold">Bagian yang berulang ({core.length}/4)</p>
      <div className="mt-2 flex min-h-12 items-center gap-1 rounded-lg border-2 border-dashed border-success/50 p-1">{core.map((t, i) => <TokenView key={i} tk={t} className="size-10" />)}</div>
      <div role="group" aria-label="Pilih gambar" className="mt-3 flex flex-wrap gap-1.5">{kinds[kind].map(t => <button key={t} type="button" aria-label={`Tambah ${tokenName(t)}`} disabled={core.length >= 4} className="btn btn-sm h-auto bg-base-100 px-1.5 py-1" onClick={() => setCore([...core, t])}><TokenView tk={t} className="size-8" /></button>)}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={!core.length} onClick={() => setCore([])}><Eraser className="size-3.5" aria-hidden="true" />Kosongkan</button>
        {kind === "Suara" && <button type="button" className="btn btn-outline btn-xs gap-1" disabled={!isPattern} onClick={() => playClaps(core)}><Volume2 className="size-3.5" aria-hidden="true" />Dengarkan polanya</button>}
      </div>
    </div>
    <div className="overflow-x-auto rounded-xl bg-base-100 p-3" aria-label="Barisan pola">
      <div className="flex w-max items-center gap-1">{strip.map((t, i) => <span key={i} className={`rounded-md p-0.5 ${i < core.length ? "bg-success/15 ring-1 ring-success/40" : ""}`}><TokenView tk={t} className="size-8" /></span>)}</div>
    </div>
    <output data-testid="lab-result" data-value={isPattern ? core.join("|") : ""} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      {isPattern ? <>Bagian yang berulang: <strong>{core.map(tokenName).join(", ")}</strong>. Barisan di atas mengulang bagian itu dengan urutan yang sama, jadi membentuk pola.</> : <>Pilih paling sedikit dua gambar yang berbeda untuk membuat bagian yang berulang.</>}
    </output>
  </div>;
}
const labs = [PositionLab, PatternLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
const PartBox = ({ children }: { children: React.ReactNode }) => <div className="space-y-2">{children}</div>;
function FillPart({ p, value, set, checked }: { p: Extract<Part, { kind: "fill" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const vals = Array.from({ length: p.sentences.length }, (_, k) => value.split(",")[k] ?? "");
  const [sel, setSel] = useState<number | null>(null);
  const target = sel ?? vals.findIndex(v => v === "");
  const put = (w: string) => { if (target < 0) return; const v = [...vals]; v[target] = w; set(v.join(",")); setSel(null); };
  return <PartBox>
    <p className="text-xs text-base-content/60">Ketuk titik-titik, lalu ketuk kata. Setiap kata hanya dipakai satu kali.</p>
    <div role="group" aria-label="Kata" className="flex flex-wrap gap-1.5">{p.bank.map(w => <button key={w} type="button" disabled={checked || vals.includes(w)} className="btn btn-sm btn-outline" onClick={() => put(w)}>{w}</button>)}</div>
    <ol className="space-y-2 text-base">{p.sentences.map((s, k) => { const [a, b] = s.split("…"); return <li key={k} className="leading-9">{String.fromCharCode(97 + k)}. {a}
      <button type="button" disabled={checked} aria-label={`Isian ${k + 1}`} aria-pressed={target === k} onClick={() => vals[k] ? (() => { const v = [...vals]; v[k] = ""; set(v.join(",")); setSel(k); })() : setSel(k)}
        className={`mx-1 inline-block min-w-20 rounded-lg border-b-2 px-2 font-bold ${target === k && !checked ? "border-success bg-success/10" : "border-orange-400 bg-white"}`}>{vals[k] || "…"}</button>{b}</li>; })}</ol>
  </PartBox>;
}
function SortPart({ p, value, set, checked }: { p: Extract<Part, { kind: "sort" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = Array.from({ length: p.items.length }, (_, k) => value.split(",")[k] ?? "");
  const put = (k: number, b: string) => { const v = [...vals]; v[k] = b; set(v.join(",")); setSel(null); };
  const loose = p.items.map((_, k) => k).filter(k => vals[k] === "");
  return <PartBox>
    <div role="group" aria-label="Gambar yang belum dikelompokkan" className="flex min-h-16 flex-wrap gap-2 rounded-xl bg-base-200/60 p-2">
      {loose.length ? loose.map(k => <button key={k} type="button" disabled={checked} aria-label={`Ambil ${p.items[k].name}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`flex flex-col items-center rounded-xl border-2 bg-base-100 p-1 text-xs font-semibold ${sel === k ? "border-success ring-2 ring-success/40" : "border-base-300"}`}><FigView fig={p.items[k].fig} size="sm" />{p.items[k].name}</button>)
        : <p className="self-center px-2 text-sm text-base-content/60">Semua sudah dikelompokkan.</p>}
    </div>
    <p className="text-xs text-base-content/60">{sel === null ? "Ketuk satu gambar, lalu ketuk kotak tujuannya." : `${p.items[sel].name} dipilih. Ketuk kotak tujuannya.`}</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {p.bins.map((b, bi) => <div key={b} className="flex min-w-0 flex-col rounded-xl border-2 border-dashed border-info/50 bg-info/5 p-2">
        <button type="button" disabled={checked || sel === null} aria-label={`Masukkan ke ${b}`} onClick={() => sel !== null && put(sel, String(bi))} className="btn btn-xs btn-info btn-outline h-auto min-h-7 whitespace-normal">{b}</button>
        <div className="mt-2 flex min-h-12 flex-wrap gap-1">{p.items.map((it, k) => vals[k] === String(bi) && <button key={k} type="button" disabled={checked} aria-label={`Keluarkan ${it.name}`} onClick={() => put(k, "")} className="rounded-lg bg-base-100 p-0.5 text-[11px] font-semibold"><FigView fig={it.fig} size="sm" /></button>)}</div>
      </div>)}
    </div>
  </PartBox>;
}
function SeqPart({ p, value, set, checked }: { p: Extract<Part, { kind: "seq" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const n = p.answer.length, vals = Array.from({ length: n }, (_, k) => value.split(",")[k] ?? "");
  const [sel, setSel] = useState<number | null>(null);
  const target = sel ?? vals.findIndex(v => v === "");
  let b = -1;
  return <PartBox>
    <p className="text-xs text-base-content/60">Ketuk gambar di bawah untuk mengisi kotak kosong. Ketuk kotak yang sudah terisi untuk mengubahnya.</p>
    <div className="flex flex-wrap items-center gap-1">{p.items.map((t, i) => { if (t !== null) return <TokenView key={i} tk={t} className="size-10" />; b++; const k = b; return <button key={i} type="button" disabled={checked} aria-label={`${p.label} kosong ${k + 1}`} aria-pressed={target === k}
      onClick={() => { const v = [...vals]; v[k] = ""; set(v.join(",")); setSel(k); }} className={`rounded-lg ${target === k && !checked ? "ring-2 ring-success" : ""}`}><TokenView tk={vals[k] || null} className="size-10" /></button>; })}</div>
    <div role="group" aria-label="Pilihan gambar" className="flex flex-wrap gap-1.5">{p.palette.map(t => <button key={t} type="button" disabled={checked || target < 0} aria-label={`Isi ${tokenName(t)}`} className="btn btn-sm h-auto bg-base-100 px-1.5 py-1"
      onClick={() => { const v = [...vals]; v[target] = t; set(v.join(",")); setSel(null); }}><TokenView tk={t} className="size-8" /></button>)}</div>
  </PartBox>;
}
function CreatePart({ p, value, set, checked }: { p: Extract<Part, { kind: "create" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const vals = Array.from({ length: p.n }, (_, k) => value.split(",")[k] ?? "");
  const [brush, setBrush] = useState(p.colors[0]);
  const filled = vals.every(Boolean), ok = filled && periodOf(vals.map(c => `${p.shape}:${c}`));
  return <PartBox>
    <div role="group" aria-label="Warna" className="flex flex-wrap gap-1.5">{p.colors.map(c => <button key={c} type="button" disabled={checked} aria-label={`Warna ${c}`} aria-pressed={brush === c} onClick={() => setBrush(c)}
      className={`flex items-center gap-1 rounded-full border-2 px-2 py-1 text-sm font-semibold ${brush === c ? "border-neutral" : "border-base-300"}`}><span className="size-4 rounded-full border border-neutral/40" style={{ background: colorHex[c] }} />{c}</button>)}</div>
    <div className="flex flex-wrap gap-1">{vals.map((c, k) => <button key={k} type="button" disabled={checked} aria-label={`${p.label} ${k + 1}`} onClick={() => { const v = [...vals]; v[k] = brush; set(v.join(",")); }}><TokenView tk={c ? `${p.shape}:${c}` : `${p.shape}:putih`} className="size-10" /></button>)}</div>
    {filled && <p className={`text-sm ${ok ? "text-success" : "text-warning-content"}`}>{ok ? "Warnamu membentuk pola." : "Warnanya belum berulang teratur."}</p>}
  </PartBox>;
}
function PartView({ p, i, value, set, checked }: { p: Part; i: number; value: string; set: (v: string) => void; checked: boolean }) {
  switch (p.kind) {
    case "choice": return <div role="group" aria-label={`Bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className={p.figs ? "grid grid-cols-2 gap-2 sm:grid-cols-4" : "flex flex-wrap gap-2"}>{p.options.map((o, k) => <button key={o} type="button" aria-label={o} aria-pressed={value === o} disabled={checked} onClick={() => set(o)}
        className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 font-bold ${value === o ? "border-success bg-success/10" : "border-base-300 bg-base-100 hover:border-success/40"}`}>
        {p.figs && <FigView fig={p.figs[k]} size="sm" />}<span className={p.figs ? "text-sm" : "px-2 text-lg"}>{o}</span></button>)}</div></div>;
    case "tap": return <div className="space-y-1"><p className="text-xs text-base-content/60">Ketuk benda pada gambar.</p><SceneView s={p.scene} tap={id => !checked && set(id)} picked={value} /></div>;
    case "fill": return <FillPart p={p} value={value} set={set} checked={checked} />;
    case "sort": return <SortPart p={p} value={value} set={set} checked={checked} />;
    case "check": { const sel = value ? value.split(",").filter(Boolean).map(Number) : []; return <div className="space-y-2">{p.items.map((it, k) => { const on = sel.includes(k); return <div key={k} className="flex min-w-0 items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-2">
      <span className="w-5 font-bold">{it.name}.</span><div className="min-w-0 flex-1 overflow-x-auto"><FigView fig={it.fig} size="sm" /></div>
      <button type="button" aria-label={`Centang ${it.name}`} aria-pressed={on} disabled={checked} onClick={() => set((on ? sel.filter(x => x !== k) : [...sel, k]).sort((a, b) => a - b).join(","))}
        className={`grid size-9 shrink-0 place-items-center rounded-lg border-2 ${on ? "border-success bg-success text-white" : "border-orange-400 bg-white"}`}>{on && <Check className="size-5" aria-hidden="true" />}</button></div>; })}</div>; }
    case "seq": return <SeqPart p={p} value={value} set={set} checked={checked} />;
    case "create": return <CreatePart p={p} value={value} set={set} checked={checked} />;
    case "odd": return <div className="space-y-1"><p className="text-xs text-base-content/60">Ketuk gambar yang tidak sesuai pola.</p><div className="flex flex-wrap gap-1">{p.items.map((t, k) => <button key={k} type="button" disabled={checked} aria-label={`Gambar ${k + 1}`} aria-pressed={value === String(k)} onClick={() => set(String(k))}
      className={`rounded-lg p-0.5 ${value === String(k) ? "bg-warning/40 ring-2 ring-warning" : ""}`}><TokenView tk={t} className="size-10" /></button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} p={p} i={i} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeTwoPositionPatterns() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 2, Bab 4</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Posisi Benda dan Pola di Sekitar Kita</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Tunjukkan posisi benda dengan kata atas, bawah, depan, belakang, kanan, dan kiri, lalu temukan dan lanjutkan pola bentuk, warna, gerakan, dan suara.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div className="flex items-center gap-3" aria-hidden="true"><PairView mover="kucing" target="meja" pos="atas" className="w-24" /><RowView items={["heart:pink", "star:oranye", "heart:pink", "star:oranye"]} className="size-6" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Lihat letaknya, cari yang berulang</h2>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-posisi">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-posisi" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<PQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 4"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.fig ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><FigView fig={q.fig} size="lg" /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
