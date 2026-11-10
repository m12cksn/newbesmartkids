"use client";

import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { GridPicker, labs } from "./GradeSixLabs";
import {
  assessment, correct, decimalText, formatAnswer, groups, practice, ready, topics, type FDQuestion, type Item,
} from "@/data/grade-six-fractions-decimals";
import { Bottle, Bucket, Glass, itemName, MathText, placeNames, SceneView, Tree } from "./GradeSixVisuals";


/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
type AnswerProps = { q: FDQuestion; value: string; record: (v: string) => void; checked: boolean };

function ChoiceAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  if (r.kind !== "choice" && r.kind !== "multi") return null;
  const selected = value ? value.split("|") : [];
  const pick = (o: string) => record(r.kind === "multi" ? (selected.includes(o) ? selected.filter(s => s !== o) : [...selected, o]).sort().join("|") : o);
  if (r.pictures) return <div className="space-y-2">
    {r.kind === "multi" && <p className="text-sm">Boleh memilih lebih dari satu gambar.</p>}
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{r.options.map((o, i) => <button key={o} type="button" aria-label={`Gambar ${o}`} aria-pressed={selected.includes(o)} disabled={checked}
      className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border-2 p-2 ${selected.includes(o) ? "border-success bg-success/10" : "border-base-300 bg-base-100 hover:border-success/60"}`} onClick={() => pick(o)}>
      <span className="self-start rounded bg-base-200 px-1.5 text-xs font-extrabold">{o}</span>
      <div className="w-full min-w-0"><SceneView scene={r.pictures![i]} /></div>
    </button>)}</div>
  </div>;
  return <div className="grid gap-2 sm:grid-cols-2">{r.options.map(o => <button key={o} type="button" aria-pressed={selected.includes(o)} disabled={checked}
    className={`min-h-12 rounded-xl border-2 px-4 py-2 text-left font-semibold ${selected.includes(o) ? "border-success bg-success/15" : "border-base-300 bg-base-100 hover:border-success/60"}`} onClick={() => pick(o)}>
    <span className="sr-only">{o}</span><span aria-hidden="true"><MathText text={o} /></span>
  </button>)}</div>;
}

function FractionAnswer({ q, value, record, checked }: AnswerProps) {
  const [w = "", n = "", d = ""] = value ? value.split("|") : [];
  const set = (i: number, v: string) => record([w, n, d].map((x, j) => j === i ? v.replace(/\D/g, "").slice(0, 4) : x).join("|"));
  const box = (i: number, label: string, v: string, cls = "w-16") => <input aria-label={label} inputMode="numeric" disabled={checked} value={v} onChange={e => set(i, e.target.value)}
    className={`input input-bordered input-sm h-10 ${cls} text-center text-lg font-bold tabular-nums`} />;
  return <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-2">
      {box(0, "Bilangan bulat", w, "w-14")}
      <div className="flex flex-col items-center gap-1">{box(1, "Pembilang", n)}<span className="h-0 w-16 border-t-2 border-base-content" />{box(2, "Penyebut", d)}</div>
      {q.response.kind === "fraction" && q.response.unit && <span className="font-bold">{q.response.unit}</span>}
    </div>
    <p className="max-w-56 text-xs text-base-content/60">Kosongkan bilangan bulat untuk pecahan biasa. Isi untuk pecahan campuran.</p>
  </div>;
}

function TextAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response, decimal = r.kind === "decimal";
  const unit = r.kind === "decimal" || r.kind === "number" ? r.unit : undefined;
  return <label className="flex flex-wrap items-center gap-2 font-bold">{decimal ? "Desimal" : "Jawaban"}
    <input aria-label={decimal ? "Jawaban desimal" : "Jawaban"} inputMode={decimal ? "decimal" : "numeric"} disabled={checked} value={value}
      placeholder={decimal ? "contoh 0,3" : ""} className="input input-bordered w-32 text-lg tabular-nums"
      onChange={e => record(decimal ? e.target.value.replace(/[^\d,.]/g, "").replace(".", ",").slice(0, 8) : e.target.value.replace(/\D/g, "").slice(0, 6))} />
    {unit && <span>{unit}</span>}
  </label>;
}

function ShadeAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  if (r.kind !== "shade") return null;
  const rows = value ? value.split("|") : Array.from({ length: r.wholes }, () => "0".repeat(r.parts));
  const tone = { Pita: "bg-rose-500", Lahan: "bg-lime-500", Liter: "bg-sky-500" }[r.label];
  const flip = (w: number, p: number) => record(rows.map((row, i) => i !== w ? row : [...row].map((c, j) => j === p ? (c === "1" ? "0" : "1") : c).join("")).join("|"));
  return <div className="space-y-2">
    <p className="text-sm">Ketuk bagian untuk mengarsir atau menghapus arsiran.</p>
    {rows.map((row, w) => <div key={w} className="min-w-0">
      <div className={`grid gap-1 ${r.label === "Lahan" ? "h-20" : "h-10"}`} style={{ gridTemplateColumns: `repeat(${r.parts}, minmax(0,1fr))` }}>
        {[...row].map((c, p) => <button key={p} type="button" aria-label={`${r.label} ${w + 1} bagian ${p + 1}`} aria-pressed={c === "1"} disabled={checked}
          className={`min-w-0 rounded border-2 border-slate-600 ${c === "1" ? tone : r.label === "Lahan" ? "bg-lime-50" : "bg-white"}`} onClick={() => flip(w, p)} />)}
      </div>
      <p className="text-xs font-semibold text-base-content/70">{r.label} {w + 1}{r.label === "Pita" ? " · 1 m" : r.label === "Liter" ? " · 1 liter" : ""}: {[...row].filter(c => c === "1").length} dari {r.parts} bagian</p>
    </div>)}
  </div>;
}

function GridAnswer({ value, record, checked }: AnswerProps) {
  const cells = value ? value.split(",").map(Number) : [];
  return <GridPicker value={cells} disabled={checked} onChange={v => record(v.join(","))} />;
}

function MarkAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  if (r.kind !== "mark") return null;
  const marked = value ? value.split(",").map(Number) : [];
  const per = r.total / r.groups, item: Item = r.item;
  return <div className="space-y-2">
    <div className="flex flex-wrap gap-1.5">{Array.from({ length: r.groups }, (_, g) => <div key={g} className="flex flex-wrap gap-0.5 rounded-lg border border-dashed border-success/50 p-1">
      {Array.from({ length: per }, (_, k) => {
        const i = g * per + k, on = marked.includes(i);
        return <button key={i} type="button" aria-label={`${itemName(item)} ${i + 1}`} aria-pressed={on} disabled={checked}
          className={`relative rounded-md p-0.5 ${on ? "bg-rose-100 ring-2 ring-rose-500" : "hover:bg-success/10"}`}
          onClick={() => record((on ? marked.filter(x => x !== i) : [...marked, i]).sort((x, y) => x - y).join(","))}>
          <Tree item={item} fruit={on} className="size-8" />
          {on && <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white" aria-hidden="true">✓</span>}
        </button>;
      })}
    </div>)}</div>
    <p aria-live="polite" className="text-sm font-semibold">{marked.length} dari {r.total} ditandai</p>
  </div>;
}

function OrderAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  if (r.kind !== "order") return null;
  const chosen = value ? value.split("|") : [];
  return <div className="space-y-2">
    <p className="text-sm">Ketuk sesuai urutan. Nomor muncul pada pilihan yang sudah diketuk.</p>
    <div className="flex flex-wrap gap-2">{r.options.map(o => {
      const at = chosen.indexOf(o);
      return <button key={o} type="button" disabled={checked || at >= 0} aria-pressed={at >= 0}
        className={`btn h-auto min-h-11 gap-2 whitespace-normal ${at >= 0 ? "btn-info text-white disabled:bg-info disabled:text-white" : "btn-outline"}`}
        onClick={() => record([...chosen, o].join("|"))}>
        {at >= 0 && <span className="badge badge-sm bg-white text-info" aria-hidden="true">{at + 1}</span>}{o}
      </button>;
    })}</div>
    <p aria-live="polite" className="text-sm font-semibold">{chosen.length ? chosen.map(c => c.split(" · ")[0]).join(" → ") : "Belum ada urutan."}</p>
    <div className="flex gap-2">
      <button type="button" className="btn btn-ghost btn-sm" disabled={checked || !chosen.length} onClick={() => record(chosen.slice(0, -1).join("|"))}>Batalkan terakhir</button>
      <button type="button" className="btn btn-ghost btn-sm" disabled={checked || !chosen.length} onClick={() => record("")}>Ulangi</button>
    </div>
  </div>;
}

const pairColors = ["bg-sky-500", "bg-orange-500", "bg-violet-500", "bg-emerald-600"];
function MatchAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  const [active, setActive] = useState<string | null>(null);
  if (r.kind !== "match") return null;
  const pairs = new Map(value ? value.split("|").map(p => p.split("=") as [string, string]) : []);
  const save = (m: Map<string, string>) => record(r.left.filter(l => m.has(l)).map(l => `${l}=${m.get(l)}`).join("|"));
  const colorOf = (l: string) => pairColors[r.left.indexOf(l)];
  const leftOf = (d: string) => [...pairs].find(([, v]) => v === d)?.[0];
  return <div className="space-y-2">
    <p className="text-sm">Ketuk satu pecahan, lalu ketuk desimal pasangannya. Warna yang sama berarti berpasangan.</p>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">{r.left.map(l => <button key={l} type="button" aria-label={`Pecahan ${l}`} aria-pressed={active === l} disabled={checked}
        className={`btn h-14 w-full gap-2 text-lg ${active === l ? "btn-warning" : "btn-outline"}`}
        onClick={() => { if (pairs.has(l)) { pairs.delete(l); save(pairs); } setActive(active === l ? null : l); }}>
        <MathText text={l} />{pairs.has(l) && <span className={`size-3 rounded-full ${colorOf(l)}`} aria-hidden="true" />}
      </button>)}</div>
      <div className="space-y-2">{r.right.map(d => {
        const owner = leftOf(d);
        return <button key={d} type="button" aria-label={`Desimal ${d}`} disabled={checked || !active} aria-pressed={Boolean(owner)}
          className={`btn h-14 w-full gap-2 text-lg tabular-nums ${owner ? "btn-outline border-2" : "btn-outline"}`}
          onClick={() => { if (!active) return; for (const [k, v] of pairs) if (v === d) pairs.delete(k); pairs.set(active, d); save(pairs); setActive(null); }}>
          {owner && <span className={`size-3 rounded-full ${colorOf(owner)}`} aria-hidden="true" />}{d}
        </button>;
      })}</div>
    </div>
    <p aria-live="polite" className="text-sm font-semibold">{pairs.size} dari {r.left.length} pasangan</p>
  </div>;
}

function LineAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  if (r.kind !== "line") return null;
  const ticks = Array.from({ length: r.to - r.from + 1 }, (_, i) => r.from + i);
  return <div className="max-w-lg px-3 pb-2 pt-8">
    <div className="relative h-10">
      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-700" />
      {ticks.map((t, i) => {
        const on = value === String(t), pct = i / (ticks.length - 1) * 100, major = i === 0 || i === ticks.length - 1 || i === (ticks.length - 1) / 2;
        return <button key={t} type="button" aria-label={`Titik ${decimalText(t / 100, 2)}`} aria-pressed={on} disabled={checked}
          className="absolute top-0 flex h-10 w-7 -translate-x-1/2 flex-col items-center justify-center" style={{ left: `${pct}%` }} onClick={() => record(String(t))}>
          <span className={`w-0.5 bg-slate-700 ${major ? "h-5" : "h-3"}`} />
          {on && <span className="absolute -top-6 grid size-6 place-items-center rounded-full bg-rose-500 text-xs font-bold text-white" aria-hidden="true">▼</span>}
          {major && <span className="absolute top-10 text-xs font-bold tabular-nums">{decimalText(t / 100, 2)}</span>}
        </button>;
      })}
    </div>
    <p aria-live="polite" className="mt-6 text-sm font-semibold">{value ? `Titik dipilih: ${decimalText(Number(value) / 100, 2)}` : "Ketuk salah satu garis kecil."}</p>
  </div>;
}

function PlaceAnswer({ value, record, checked }: AnswerProps) {
  const digits = value ? value.split("|") : ["", "", "", ""];
  return <div className="grid max-w-md grid-cols-4 gap-2">{placeNames.map((p, i) => <label key={p} className="min-w-0 text-center text-xs font-bold">
    <span className="block truncate">{p}</span>
    <input aria-label={p} inputMode="numeric" maxLength={1} disabled={checked} value={digits[i] ?? ""}
      className={`input input-bordered mt-1 h-12 w-full text-center text-xl font-extrabold ${i === 2 ? "border-l-4" : ""}`}
      onChange={e => record(digits.map((d, j) => j === i ? e.target.value.replace(/\D/g, "").slice(-1) : d).join("|"))} />
  </label>)}</div>;
}

function AnswerArea(props: AnswerProps) {
  switch (props.q.response.kind) {
    case "choice": case "multi": return <ChoiceAnswer {...props} />;
    case "fraction": return <FractionAnswer {...props} />;
    case "decimal": case "number": return <TextAnswer {...props} />;
    case "shade": return <ShadeAnswer {...props} />;
    case "grid": return <GridAnswer {...props} />;
    case "mark": return <MarkAnswer {...props} />;
    case "order": return <OrderAnswer {...props} />;
    case "match": return <MatchAnswer {...props} />;
    case "line": return <LineAnswer {...props} />;
    case "place": return <PlaceAnswer {...props} />;
  }
}

/* ====================================================================== */
/* Halaman bab                                                             */
/* ====================================================================== */
function Ornaments() {
  return <svg aria-hidden="true" viewBox="0 0 320 200" className="pointer-events-none absolute -right-6 top-0 hidden h-full w-[22rem] text-info/30 md:block">
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="250" cy="60" r="34" /><path d="M250 26v68M216 60h34" /><path d="M250 60L274 84" />
      <path d="M60 150h120" /><path d="M60 142v16M90 146v8M120 142v16M150 146v8M180 142v16" />
      <path d="M232 120h28l-6 10v26l14 24h-44l14-24v-26z" />
      <path d="M150 30l40 0l-20 34z" />
    </g>
    <text x="40" y="70" fontSize="30" fontWeight="800" fill="currentColor">¾</text>
    <text x="110" y="110" fontSize="22" fontWeight="800" fill="currentColor">0,75</text>
    <text x="270" y="190" fontSize="22" fontWeight="800" fill="currentColor">÷</text>
  </svg>;
}

export default function GradeSixFractionsDecimals() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic];
  const Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <header className="relative overflow-hidden rounded-2xl border border-base-300 bg-[linear-gradient(#e0f2fe_1px,transparent_1px),linear-gradient(90deg,#e0f2fe_1px,transparent_1px)] bg-[size:22px_22px] p-5 sm:p-8">
      <Ornaments />
      <p className="relative text-xs font-bold uppercase tracking-widest text-success">Kelas 6 · Bab 1</p>
      <h1 className="relative mt-2 text-3xl font-extrabold sm:text-5xl">Pecahan dan Desimal</h1>
      <p className="relative mt-3 max-w-2xl text-base-content/70">Kalikan dan bagi pecahan lewat kebun, botol, dan gelas, lalu ubah pecahan menjadi desimal dan bandingkan nilainya.</p>
    </header>

    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-44 flex-col items-center justify-center bg-gradient-to-br from-info/10 to-success/10 p-6 text-center">
        <div className="flex items-end gap-2" aria-hidden="true"><Bucket className="h-10 w-9" /><Bottle fill={0.5} label="½ L" className="h-14 w-7" /><Glass level={0.6} className="h-10 w-7" /><span className="text-2xl font-extrabold text-info">0,5</span></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Belum ada video. Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Amati, coba, lalu buktikan</h2>
        <p className="mt-2 text-sm text-base-content/60">6 materi interaktif, {practice.flat().length} latihan materi, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#bab-content">Mulai belajar</a>
      </div>
    </div>

    <div id="bab-content" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-5 grid gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          {groups.map((g, gi) => <div key={g.code} className="min-w-0 rounded-xl border border-base-300 bg-base-100 p-2">
            <p className="px-1 text-xs font-bold uppercase tracking-wide text-base-content/60">{g.code}. {g.title}</p>
            <div className="mt-1 grid gap-1">{topics.map((x, i) => x.group === gi && <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined}
              className={`btn btn-sm h-auto min-h-9 justify-start whitespace-normal text-left ${i === topic ? "btn-success" : "btn-ghost"}`} onClick={() => go(i)}>{x.code} {x.short}</button>)}</div>
          </div>)}
          <button type="button" className="btn btn-outline btn-success h-auto min-h-11 md:self-stretch" onClick={() => setMode("assessment")}>Evaluasi · 24 soal</button>
        </nav>

        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={topic} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <p className="text-sm font-bold text-success">{t.code} · {groups[t.group].title}</p>
            <h2 className="text-2xl font-extrabold">{t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{t.steps.map(s => <li key={s}><MathText text={s} /></li>)}</ol>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong><MathText text={t.demo} /></p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost" disabled={topic === 0} onClick={() => go(topic - 1)}>← Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan materi →</button>
            {topic < topics.length - 1
              ? <button type="button" className="btn btn-outline" onClick={() => go(topic + 1)}>Materi berikutnya</button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<FDQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code} ${t.short}` : "Evaluasi Bab 1"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <MathText text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold">
          <span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="min-w-0 overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <AnswerArea key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
