"use client";

import { ArrowLeft, ArrowRight, Check, Minus, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { ActCard, Balance, ClockFace, Digital, ThingArt } from "./MeasureVisuals";
import {
  acts, assessment, correct, formatAnswer, practice, ready, SEP, splitParts, things, tilt, topics,
  type Act, type Fig, type MQuestion, type Part, type Thing, type Tod,
} from "@/data/grade-two-measurement";

function FigView({ fig, big = false }: { fig: Fig; big?: boolean }) {
  switch (fig.t) {
    case "balance": return <Balance left={fig.left} right={fig.right} tilt={tilt(fig, fig.w)} style={fig.style} className={big ? "w-full max-w-80" : "w-full max-w-56"} />;
    case "balances": return <div className="grid w-full gap-1 sm:grid-cols-2">{fig.list.map((b, i) => <div key={i} className="flex items-center gap-1"><span className="text-sm font-bold">{i + 1}.</span><Balance left={b.left} right={b.right} tilt={tilt(b, fig.w)} className="w-full max-w-64" /></div>)}</div>;
    case "clock": return fig.act ? <ActCard a={fig.act} tod={fig.tod} h={fig.h} small={!big} /> : <ClockFace h={fig.h} className={big ? "size-36" : "size-20"} />;
    case "clocks": return <div className="flex flex-wrap justify-center gap-3">{fig.list.map(c => <figure key={c.label} className="text-center"><ClockFace h={c.h} className="size-20" /><figcaption className="text-xs font-semibold">{c.label}</figcaption></figure>)}</div>;
    case "digital": return <Digital h={fig.h} />;
    case "act": return <ActCard a={fig.a} tod={fig.tod} small={!big} />;
    case "thing": return <ThingArt t={fig.o} className={big ? "size-20" : "size-12"} />;
  }
}

/* ====================================================================== */
/* Lab A: timbangan                                                        */
/* ====================================================================== */
const unitW: Partial<Record<Thing, number>> = { kelereng: 1, balok: 2, bolaTenis: 3, apel: 6 };
const objW: Partial<Record<Thing, number>> = { buku: 6, kelapa: 12, labu: 18, tas: 24 };
const compareSet: Thing[] = ["kelereng", "apel", "buku", "kelapa", "labu", "tas"];
function BalanceLab() {
  const [obj, setObj] = useState<Thing>("buku");
  const [unit, setUnit] = useState<Thing>("kelereng");
  const [n, setN] = useState(0);
  const [cmp, setCmp] = useState<[Thing, Thing]>(["apel", "kelapa"]);
  const w = { ...unitW, ...objW };
  const b = { left: [{ o: obj, n: 1 }], right: n ? [{ o: unit, n }] : [] };
  const tl = tilt(b, w), level = tl === 0;
  const cb = { left: [{ o: cmp[0], n: 1 }], right: [{ o: cmp[1], n: 1 }] }, ct = tilt(cb, w);
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-3">
      <div role="group" aria-label="Benda yang ditimbang" className="flex flex-wrap gap-1">{(Object.keys(objW) as Thing[]).map(t => <button key={t} type="button" aria-label={things[t].name} aria-pressed={obj === t} className={`btn btn-sm btn-square h-11 w-11 ${obj === t ? "btn-success" : "btn-outline"}`} onClick={() => { setObj(t); setN(0); }}><ThingArt t={t} className="size-8" /></button>)}</div>
      <div role="group" aria-label="Alat ukur" className="flex flex-wrap gap-1">{(Object.keys(unitW) as Thing[]).map(t => <button key={t} type="button" aria-label={`Ukur dengan ${things[t].name.toLowerCase()}`} aria-pressed={unit === t} className={`btn btn-sm btn-square h-11 w-11 ${unit === t ? "btn-info" : "btn-outline"}`} onClick={() => { setUnit(t); setN(0); }}><ThingArt t={t} className="size-8" /></button>)}</div>
    </div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-3"><Balance left={b.left} right={b.right} tilt={tl} className="w-full max-w-80" /></div>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" aria-label={`Tambah ${things[unit].name.toLowerCase()}`} className="btn btn-sm btn-success gap-1" disabled={n >= 24} onClick={() => setN(n + 1)}><Plus className="size-4" aria-hidden="true" />Tambah</button>
      <button type="button" aria-label={`Kurangi ${things[unit].name.toLowerCase()}`} className="btn btn-sm btn-outline gap-1" disabled={!n} onClick={() => setN(n - 1)}><Minus className="size-4" aria-hidden="true" />Kurangi</button>
      <span className="text-sm font-semibold">{n} {things[unit].name.toLowerCase()}</span>
    </div>
    <output data-testid="lab-result" data-value={`${n}:${tl}`} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      {level ? <strong>Timbangan datar. Berat 1 {things[obj].name.toLowerCase()} = {n} {things[unit].name.toLowerCase()}.</strong>
        : tl > 0 ? <>Sisi {things[obj].name.toLowerCase()} masih turun, jadi {things[obj].name.toLowerCase()} lebih berat. Tambahkan {things[unit].name.toLowerCase()}.</>
          : <>Sisi {things[unit].name.toLowerCase()} turun, jadi terlalu banyak. Kurangi satu.</>}
    </output>
    <div className="rounded-xl border border-base-300 bg-base-100 p-3">
      <p className="text-sm font-bold">Bandingkan dua benda dengan jungkat-jungkit</p>
      <div className="mt-2 flex flex-wrap gap-3">{[0, 1].map(k => <div key={k} role="group" aria-label={k ? "Benda kanan" : "Benda kiri"} className="flex flex-wrap gap-1">{compareSet.map(t => <button key={t} type="button" aria-label={`${k ? "Kanan" : "Kiri"} ${things[t].name}`} aria-pressed={cmp[k] === t} className={`btn btn-xs btn-square h-9 w-9 ${cmp[k] === t ? "btn-warning" : "btn-outline"}`} onClick={() => setCmp(c => (k ? [c[0], t] : [t, c[1]]) as [Thing, Thing])}><ThingArt t={t} className="size-6" /></button>)}</div>)}</div>
      <div className="grid place-items-center"><Balance left={cb.left} right={cb.right} tilt={ct} style="jungkat" className="w-full max-w-64" /></div>
      <p data-testid="compare-result" data-value={String(ct)} className="text-center text-sm">{things[cmp[0]].name} {ct > 0 ? "lebih berat dari" : ct < 0 ? "lebih ringan dari" : "sama berat dengan"} {things[cmp[1]].name.toLowerCase()}.</p>
    </div>
  </div>;
}

/* ====================================================================== */
/* Lab B: jam                                                              */
/* ====================================================================== */
const examples: Record<Tod, Partial<Record<number, Act>>> = {
  pagi: { 5: "bangun", 6: "sarapan", 7: "belajar", 8: "belajar", 9: "belajar", 10: "istirahat" },
  siang: { 11: "belajar", 12: "makanSiang", 1: "membaca", 2: "membaca" },
  sore: { 3: "bola", 4: "bola", 5: "mandiSore" },
  malam: { 6: "makanMalam", 7: "makanMalam", 8: "membaca", 9: "tidur", 10: "tidur", 11: "tidur", 12: "tidur", 1: "tidur", 2: "tidur", 3: "tidur", 4: "tidur" },
};
function ClockLab() {
  const [h, setH] = useState(7);
  const [tod, setTod] = useState<Tod>("pagi");
  const a = examples[tod][h];
  return <div className="space-y-4">
    <div className="grid place-items-center rounded-xl bg-base-100 p-3"><ClockFace h={h} onPick={setH} className="w-full max-w-60" label="Jam: ketuk angka untuk memindahkan jarum pendek" /></div>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" aria-label="Mundur satu jam" className="btn btn-sm btn-square btn-outline" onClick={() => setH(((h + 10) % 12) + 1)}><Minus className="size-4" aria-hidden="true" /></button>
      <Digital h={h} className="w-24" />
      <button type="button" aria-label="Maju satu jam" className="btn btn-sm btn-square btn-outline" onClick={() => setH((h % 12) + 1)}><Plus className="size-4" aria-hidden="true" /></button>
      <div role="group" aria-label="Bagian hari" className="flex flex-wrap gap-1">{(["pagi", "siang", "sore", "malam"] as Tod[]).map(t => <button key={t} type="button" aria-pressed={tod === t} className={`btn btn-xs ${tod === t ? "btn-success" : "btn-outline"}`} onClick={() => setTod(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
    </div>
    {a && <ActCard a={a} tod={tod} />}
    <output data-testid="lab-result" data-value={`${h}-${tod}`} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      Jarum pendek di angka {h} dan jarum panjang di angka 12: <strong>pukul {h} {tod}</strong>. {a ? <>Contoh kegiatan: {acts[a].toLowerCase()}.</> : <>Pukul {h} jarang disebut {tod}. Coba bagian hari yang lain.</>}
    </output>
  </div>;
}
const labs = [BalanceLab, ClockLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function OrderPart({ p, value, set, checked }: { p: Extract<Part, { kind: "order" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const sel = value ? value.split(",").filter(Boolean).map(Number) : [];
  return <div className="space-y-2"><p className="text-sm font-bold">{p.label}</p><p className="text-xs text-base-content/60">Ketuk satu per satu sesuai urutan.</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{p.items.map((it, k) => { const at = sel.indexOf(k); return <button key={k} type="button" disabled={checked || at >= 0} aria-label={`Urutkan ${it.name}`} onClick={() => set([...sel, k].join(","))}
      className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-1 text-xs font-semibold ${at >= 0 ? "border-info bg-info/10" : "border-base-300 bg-base-100"}`}><FigView fig={it.fig} />{it.fig.t === "thing" && it.name}{at >= 0 && <span className="badge badge-info absolute -right-1 -top-1">{at + 1}</span>}</button>; })}</div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || !sel.length} onClick={() => set(sel.slice(0, -1).join(","))}><RotateCcw className="size-3.5" aria-hidden="true" />Batalkan terakhir</button></div>;
}
function SortPart({ p, value, set, checked }: { p: Extract<Part, { kind: "sort" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = Array.from({ length: p.items.length }, (_, k) => value.split(",")[k] ?? "");
  const put = (k: number, b: string) => { const v = [...vals]; v[k] = b; set(v.join(",")); setSel(null); };
  const loose = p.items.map((_, k) => k).filter(k => vals[k] === "");
  return <div className="space-y-2">
    <div role="group" aria-label="Kegiatan yang belum dikelompokkan" className="flex min-h-16 flex-wrap gap-2 rounded-xl bg-base-200/60 p-2">
      {loose.length ? loose.map(k => <button key={k} type="button" disabled={checked} aria-label={`Ambil ${p.items[k].name}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)} className={`rounded-xl border-2 ${sel === k ? "border-success ring-2 ring-success/40" : "border-transparent"}`}><FigView fig={p.items[k].fig} /></button>)
        : <p className="self-center px-2 text-sm text-base-content/60">Semua sudah dikelompokkan.</p>}
    </div>
    <p className="text-xs text-base-content/60">{sel === null ? "Ketuk satu kegiatan, lalu ketuk kotak tujuannya." : `${p.items[sel].name} dipilih. Ketuk kotak tujuannya.`}</p>
    <div className={`grid gap-2 ${p.bins.length > 3 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>{p.bins.map((b, bi) => <div key={b} className="flex min-w-0 flex-col rounded-xl border-2 border-dashed border-info/50 bg-info/5 p-2">
      <button type="button" disabled={checked || sel === null} aria-label={`Masukkan ke ${b}`} onClick={() => sel !== null && put(sel, String(bi))} className="btn btn-xs btn-info btn-outline">{b}</button>
      <div className="mt-2 flex min-h-12 flex-wrap gap-1">{p.items.map((it, k) => vals[k] === String(bi) && <button key={k} type="button" disabled={checked} aria-label={`Keluarkan ${it.name}`} onClick={() => put(k, "")}><FigView fig={it.fig} /></button>)}</div>
    </div>)}</div>
  </div>;
}
function ExtremePart({ p, value, set, checked }: { p: Extract<Part, { kind: "extreme" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [hv, lt] = value ? value.split(",") : ["", ""];
  const [brush, setBrush] = useState<"merah" | "kuning">("merah");
  return <div className="space-y-2">
    <div role="group" aria-label="Warna" className="flex gap-2">{([["merah", "Paling berat", "#e5484d"], ["kuning", "Paling ringan", "#f5c542"]] as const).map(([c, label, hex]) => <button key={c} type="button" disabled={checked} aria-pressed={brush === c} aria-label={`Warna ${c}`} onClick={() => setBrush(c)}
      className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-semibold ${brush === c ? "border-neutral" : "border-base-300"}`}><span className="size-4 rounded-full border border-neutral/40" style={{ background: hex }} />{c}: {label.toLowerCase()}</button>)}</div>
    <div className="flex flex-wrap gap-2">{p.items.map((it, k) => { const isH = hv === String(k), isL = lt === String(k); return <button key={k} type="button" disabled={checked} aria-label={`Warnai ${it.name}`} onClick={() => set(brush === "merah" ? `${k},${lt === String(k) ? "" : lt ?? ""}` : `${hv === String(k) ? "" : hv ?? ""},${k}`)}
      className={`flex flex-col items-center rounded-xl border-[3px] p-1 text-xs font-semibold ${isH ? "border-red-500 bg-red-100" : isL ? "border-yellow-400 bg-yellow-100" : "border-base-300 bg-base-100"}`}><ThingArt t={(it.fig as { o: Thing }).o} className="size-14" />{it.name}</button>; })}</div>
  </div>;
}
function PartView({ p, i, value, set, checked }: { p: Part; i: number; value: string; set: (v: string) => void; checked: boolean }) {
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 font-bold">{p.label} <input aria-label={`${p.label}${p.suffix ? ` … ${p.suffix}` : ""}`} inputMode="numeric" value={value} disabled={checked} placeholder="…" onChange={e => set(e.target.value.replace(/\D/g, "").slice(0, 2))}
      className="h-11 w-20 rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none" />{p.suffix}</label>;
    case "choice": return <div role="group" aria-label={`Bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className={p.figs ? "grid grid-cols-2 gap-2 sm:grid-cols-5" : "flex flex-wrap gap-2"}>{p.options.map((o, k) => <button key={o} type="button" aria-label={o} aria-pressed={value === o} disabled={checked} onClick={() => set(o)}
        className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 font-bold ${value === o ? "border-success bg-success/10" : "border-base-300 bg-base-100 hover:border-success/40"}`}>{p.figs && <FigView fig={p.figs[k]} />}<span className={p.figs ? "text-sm" : "px-2"}>{o}</span></button>)}</div></div>;
    case "blanks": { const vals = Array.from({ length: p.sentences.length }, (_, k) => value.split("|")[k] ?? ""); return <ol className="space-y-3">{p.sentences.map((s, k) => { const [a, b] = s.text.split("…"); return <li key={k} className="space-y-1">
      <p className="text-base">{a}<span className="mx-1 inline-block min-w-24 border-b-2 border-orange-400 px-1 text-center font-bold">{vals[k] || "…"}</span>{b}</p>
      <div role="group" aria-label={`Kalimat ${k + 1}`} className="flex flex-wrap gap-1">{s.options.map(o => <button key={o} type="button" disabled={checked} aria-pressed={vals[k] === o} className={`btn btn-xs ${vals[k] === o ? "btn-success" : "btn-outline"}`} onClick={() => { const v = [...vals]; v[k] = o; set(v.join("|")); }}>{o}</button>)}</div></li>; })}</ol>; }
    case "pairs": { const vals = Array.from({ length: p.pairs.length }, (_, k) => value.split(",")[k] ?? ""); return <div className="grid gap-2 sm:grid-cols-2">{p.pairs.map((pr, k) => <div key={k} className="flex items-stretch justify-center gap-2 rounded-xl border border-base-300 bg-base-100 p-2">
      {pr.map((it, j) => <button key={j} type="button" disabled={checked} aria-label={`Centang ${it.name}`} aria-pressed={vals[k] === String(j)} onClick={() => { const v = [...vals]; v[k] = String(j); set(v.join(",")); }}
        className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg border-2 p-1 text-xs font-semibold ${vals[k] === String(j) ? "border-success bg-success/10" : "border-transparent"}`}><FigView fig={it.fig} />{it.fig.t === "thing" && it.name}
        <span className={`grid size-7 place-items-center rounded-md border-2 ${vals[k] === String(j) ? "border-success bg-success text-white" : "border-orange-400 bg-white"}`}>{vals[k] === String(j) && <Check className="size-4" aria-hidden="true" />}</span></button>)}</div>)}</div>; }
    case "extreme": return <ExtremePart p={p} value={value} set={set} checked={checked} />;
    case "order": return <OrderPart p={p} value={value} set={set} checked={checked} />;
    case "sort": return <SortPart p={p} value={value} set={set} checked={checked} />;
    case "setClock": return <div className="grid place-items-center gap-1"><p className="text-xs text-base-content/60">Ketuk angka untuk meletakkan jarum pendek. Jarum panjang tetap di angka 12.</p><ClockFace h={value ? Number(value) : null} onPick={n => !checked && set(String(n))} className="w-full max-w-56" label="Jam yang dapat diatur" /></div>;
  }
}
function Answer({ q, value, record, checked }: { q: MQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} p={p} i={i} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeTwoMeasurement() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 2, Bab 6</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Pengukuran</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Bandingkan berat benda dengan timbangan, ukur berat dengan kelereng atau balok mainan, lalu baca jam dan urutkan kegiatan sehari-hari.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div className="flex items-center gap-3" aria-hidden="true"><Balance left={[{ o: "labu", n: 1 }]} right={[{ o: "apel", n: 2 }]} tilt={1} className="w-32" /><ClockFace h={7} className="size-16" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Timbang, hitung, baca jam</h2>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-ukur">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-ukur" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<MQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 6"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.fig ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><FigView fig={q.fig} big /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
