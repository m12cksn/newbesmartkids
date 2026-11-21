"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  assessment, cells, correct, formatAnswer, practice, ready, SEP, splitParts, thingName, topics,
  type Group, type Layout, type Part, type PQuestion, type Scene, type Thing,
} from "@/data/grade-four-patterns-v2";

const ink = "#2b2320";

/* ====================================================================== */
/* Benda                                                                   */
/* ====================================================================== */
export function ThingArt({ thing, size = 26 }: { thing: Thing; size?: number }) {
  const s = { width: size, height: size, "aria-hidden": true } as const;
  switch (thing) {
    case "jeruk": return <svg viewBox="0 0 30 30" {...s}><circle cx="15" cy="17" r="12" fill="#f59e2b" stroke={ink} strokeWidth="1.4" /><circle cx="11" cy="13" r="3" fill="#fff" opacity=".35" /><path d="M15 5c3-4 7-3 8-2-2 3-5 4-8 2z" fill="#3f9b45" stroke={ink} strokeWidth="1" /></svg>;
    case "semangka": return <svg viewBox="0 0 30 30" {...s}><ellipse cx="15" cy="15" rx="13" ry="11" fill="#3f8f3a" stroke={ink} strokeWidth="1.4" />{[-6, 0, 6].map(d => <path key={d} d={`M${15 + d} 4.5c${d * 0.6 - 3} 6 ${d * 0.6 - 3} 15 0 21`} fill="none" stroke="#1f5c22" strokeWidth="2" />)}</svg>;
    case "bola": return <svg viewBox="0 0 30 30" {...s}><circle cx="15" cy="15" r="13" fill="#fff" stroke={ink} strokeWidth="1.4" /><path d="M15 9l5 3.6-1.9 5.9h-6.2L10 12.6z" fill={ink} /><path d="M15 9V3M20 12.6l5.5-2M18.1 18.5l3.5 5M11.9 18.5l-3.5 5M10 12.6l-5.5-2" stroke={ink} strokeWidth="1.2" /></svg>;
    case "lolipop": return <svg viewBox="0 0 30 30" {...s}><path d="M15 17v12" stroke="#c9a26b" strokeWidth="2.4" strokeLinecap="round" /><circle cx="15" cy="10" r="8.5" fill="#f2557a" stroke={ink} strokeWidth="1.3" /><path d="M15 10a2 2 0 012 2 4 4 0 01-6-2 6 6 0 0110-2" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>;
    case "apel": return <svg viewBox="0 0 30 30" {...s}><path d="M15 9c-3-2-11-2-11 7 0 7 5 12 8 12 1.5 0 2-1 3-1s1.5 1 3 1c3 0 8-5 8-12 0-9-8-9-11-7z" fill="#e23c3c" stroke={ink} strokeWidth="1.3" /><path d="M15 9c0-3 1-5 2-6" stroke="#6b4423" strokeWidth="1.6" fill="none" /><path d="M17 5c3-2 6-1 6 0-2 2-4 2-6 0z" fill="#3f9b45" /></svg>;
    case "bata": return <svg viewBox="0 0 30 20" width={size} height={size * 0.66} aria-hidden="true"><rect x="1" y="1" width="28" height="18" rx="1.5" fill="#c4562f" stroke={ink} strokeWidth="1.2" /><path d="M3 6h24M3 14h24" stroke="#e08a63" strokeWidth="1" opacity=".7" /></svg>;
    case "kue": return <svg viewBox="0 0 30 30" {...s}><path d="M6 15h18l-3 13H9z" fill="#c98b4a" stroke={ink} strokeWidth="1.2" /><path d="M8 17l1 10M12 17l.5 10M16 17l-.3 10M20 17l-1 10" stroke="#a96e33" strokeWidth=".8" /><path d="M5 15c0-6 4-9 10-9s10 3 10 9z" fill="#f8b4c8" stroke={ink} strokeWidth="1.2" /><circle cx="15" cy="5" r="2.4" fill="#e23c3c" stroke={ink} strokeWidth=".8" /></svg>;
    case "kelereng": return <svg viewBox="0 0 30 30" {...s}><circle cx="15" cy="15" r="12" fill="#5aa9e6" stroke={ink} strokeWidth="1.3" /><path d="M8 18c4-6 9 2 14-5" fill="none" stroke="#f6c544" strokeWidth="2.4" strokeLinecap="round" /><circle cx="11" cy="10" r="2.6" fill="#fff" opacity=".7" /></svg>;
  }
}
/** Letak benda ke-i pada susunan: kolom dan baris. */
function cellsOf(layout: Layout, n: number, per = 3): [number, number][] {
  if (n <= 0) return [];
  if (layout === "frame") { const s = n / 4 + 1, out: [number, number][] = []; for (let x = 0; x < s; x++) out.push([x, 0]); for (let y = 1; y < s; y++) out.push([s - 1, y]); for (let x = s - 2; x >= 0; x--) out.push([x, s - 1]); for (let y = s - 2; y >= 1; y--) out.push([0, y]); return out; }
  if (layout === "x") { const k = (n - 1) / 4, out: [number, number][] = [[k, k]]; for (let j = 1; j <= k; j++) out.push([k - j, k - j], [k + j, k - j], [k - j, k + j], [k + j, k + j]); return out; }
  if (layout === "lshape") { const k = (n + 1) / 2, out: [number, number][] = []; for (let y = 0; y < k; y++) out.push([0, y]); for (let x = 1; x < k; x++) out.push([x, k - 1]); return out; }
  if (layout === "band") return Array.from({ length: n }, (_, i) => [Math.floor(i / per), i % per]);
  return Array.from({ length: n }, (_, i) => [i % per, Math.floor(i / per)]);
}
export function GroupArt({ group, n, size = 22 }: { group: Group; n: number; size?: number }) {
  const pos = cellsOf(group.layout, n, group.per), cols = Math.max(1, ...pos.map(p => p[0] + 1)), rows = Math.max(1, ...pos.map(p => p[1] + 1));
  const w = group.thing === "bata" ? size * 1.15 : size;
  return <span role="img" aria-label={`${n} ${thingName[group.thing]}`} className="inline-grid place-items-center gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, ${w}px)`, gridTemplateRows: `repeat(${rows}, ${group.thing === "bata" ? size * 0.7 : size}px)` }}>
    {pos.map(([x, y], i) => <span key={i} style={{ gridColumn: x + 1, gridRow: y + 1 }}><ThingArt thing={group.thing} size={w} /></span>)}
  </span>;
}
function GroupCard({ group, n, label, size }: { group: Group; n: number | null; label: string; size?: number }) {
  return <figure className={`flex min-w-16 flex-col items-center gap-1 rounded-xl border-2 border-dashed px-1.5 py-1 ${n === null ? "border-orange-300 bg-orange-50" : "border-sky-300 bg-white"}`}>
    <figcaption className="text-xs font-bold text-sky-700">{label}</figcaption>
    <div className="grid min-h-12 flex-1 place-items-center">{n === null ? <span className="text-3xl font-extrabold text-orange-400">?</span> : <GroupArt group={group} n={n} size={size} />}</div>
  </figure>;
}
function SceneView({ scene }: { scene: Scene }) {
  if (scene.type === "table") return <table className="overflow-hidden rounded-lg border-2 border-sky-300 bg-white text-center text-base"><thead><tr className="bg-sky-100">{scene.head.map(h => <th key={h} className="px-3 py-1 font-bold">{h}</th>)}</tr></thead>
    <tbody>{scene.rows.map(([a, b]) => <tr key={a} className="border-t border-sky-200"><td className="px-3 py-0.5">{a}</td><td className="px-3 py-0.5 font-bold">{b}</td></tr>)}</tbody></table>;
  const big = Math.max(...scene.counts), size = big > 16 ? 14 : big > 8 ? 16 : 20;
  return <div className="flex flex-wrap items-stretch justify-center gap-1.5">{scene.counts.map((c, i) => <GroupCard key={i} group={scene} n={c} label={`Kumpulan ${i + 1}`} size={size} />)}
    {scene.ask && <GroupCard group={scene} n={null} label={`Kumpulan ${scene.counts.length + 1}`} />}</div>;
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, skip, plus }: { label: string; value: number; set: (n: number) => void; min: number; max: number; skip?: number; plus?: boolean }) {
  const step = (d: number) => { let x = value + d; if (x === skip) x += d; if (x >= min && x <= max) set(x); };
  return <span role="group" aria-label={label} className="flex flex-col items-center gap-0.5"><span className="text-xs font-bold">{label}</span>
    <span className="flex items-center gap-1"><button type="button" aria-label={`${label} kurangi`} className="btn btn-sm btn-square btn-outline" disabled={value - 1 < min || (value - 1 === skip && value - 2 < min)} onClick={() => step(-1)}><Minus className="size-4" aria-hidden="true" /></button>
      <span className="min-w-8 text-center text-xl font-extrabold tabular-nums">{value > 0 && (min < 0 || plus) ? `+${value}` : value}</span>
      <button type="button" aria-label={`${label} tambah`} className="btn btn-sm btn-square btn-outline" disabled={value + 1 > max} onClick={() => step(1)}><Plus className="size-4" aria-hidden="true" /></button></span>
  </span>;
}
const signed = (d: number) => (d > 0 ? `+${d}` : `−${-d}`);
/** Rak bilangan seperti di buku: kotak biru di atas papan, kotak kosong bisa diisi. */
function Shelf({ items, render, steps }: { items: (number | null)[]; render: (k: number, i: number) => ReactNode; steps?: string[] }) {
  let k = 0;
  return <div className="flex flex-col items-center">
    <div className="flex flex-wrap items-end justify-center gap-x-1 gap-y-2">{items.map((n, i) => <span key={i} className="flex items-end gap-1">
      {i > 0 && steps && <span className="mb-4 text-xs font-bold text-orange-600">{steps[i - 1]}</span>}
      <span className="grid size-14 place-items-center rounded-md border-2 border-sky-500 bg-sky-200 text-2xl font-extrabold shadow-[3px_3px_0_#7fb2dd]">{n === null ? render(k++, i) : n}</span>
    </span>)}</div>
    <span aria-hidden="true" className="mt-1 h-3 w-full max-w-md rounded-sm bg-[#f5deb0] shadow-[0_3px_0_#e2c48a]" />
  </div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const labThings: Thing[] = ["jeruk", "apel", "kue"];
function PictureLab() {
  const [thing, setThing] = useState<Thing>("jeruk"), [start, setStart] = useState(2), [d, setD] = useState(2), [k, setK] = useState(3);
  const counts = Array.from({ length: k }, (_, i) => start + i * d), next = start + k * d;
  const group: Group = { thing, layout: "rows", per: 3 };
  return <div className="space-y-2.5">
    <div role="radiogroup" aria-label="Benda" className="flex flex-wrap gap-1.5">{labThings.map(t => <button key={t} type="button" role="radio" aria-checked={thing === t} onClick={() => setThing(t)} className={`btn btn-sm gap-1 ${thing === t ? "btn-success" : "btn-outline"}`}><ThingArt thing={t} size={18} />{thingName[t]}</button>)}</div>
    {/* Tiga kumpulan pertama selalu berisi benda: banyak awal + 2 × perubahan > 0. */}
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Banyak awal" value={start} set={x => { setStart(x); setK(3); }} min={Math.max(1, 1 - 2 * d)} max={12} /><Stepper label="Perubahan" value={d} set={x => { setD(x); setK(3); }} min={Math.max(-3, Math.ceil((1 - start) / 2))} max={4} skip={0} /></div>
    <div className="flex flex-wrap items-stretch justify-center gap-1.5 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.75]">{counts.map((c, i) => <GroupCard key={i} group={group} n={c} label={`Kumpulan ${i + 1}`} size={k > 4 || start + 3 * Math.max(d, 0) > 12 ? 16 : 20} />)}</div>
    <p className="text-center text-lg font-extrabold tabular-nums">{counts.join(", ")}<span className="text-sm font-bold text-orange-600"> ({signed(d)} setiap kumpulan)</span></p>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-success gap-1" disabled={k >= 6 || next <= 0} onClick={() => setK(k + 1)}>Kumpulan berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>
      <button type="button" className="btn btn-ghost gap-1" onClick={() => setK(3)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
    <Result value={`${start}:${d}:${k}`}>Pola gambar <strong>{d > 0 ? "membesar" : "mengecil"}</strong>: setiap kumpulan {d > 0 ? "bertambah" : "berkurang"} {Math.abs(d)} {thingName[thing]}.{k < 6 && next > 0 ? ` Kumpulan ke-${k + 1} berisi ${counts[k - 1]} ${signed(d)} = ${next}.` : next <= 0 ? " Bendanya sudah habis." : ""}</Result>
  </div>;
}
function NumberLab() {
  const [a, setA] = useState(3), [d, setD] = useState(2), [guess, setGuess] = useState("");
  // Bilangan berikutnya (a + 5d) tidak boleh kurang dari 0, jadi batas bilangan awal dan selisih saling menjaga.
  const shown = Array.from({ length: 5 }, (_, i) => a + i * d), next = a + 5 * d;
  const state = guess === "" ? "" : Number(guess) === next ? "ok" : "no";
  const reset = () => setGuess("");
  const pick = (a2: number, d2: number) => { setA(a2); setD(d2); reset(); };
  return <div className="space-y-2.5">
    <div className="flex flex-wrap justify-center gap-1.5">{([["Pola membesar", 3, 2, d > 0], ["Pola mengecil", 30, -5, d < 0]] as const).map(([name, a2, d2, on]) => <button key={name} type="button" aria-pressed={on} onClick={() => pick(a2, d2)} className={`btn btn-sm ${on ? "btn-success" : "btn-outline"}`}>{name}</button>)}</div>
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Bilangan awal" value={a} set={x => { setA(x); reset(); }} min={d < 0 ? -5 * d : 1} max={60} /><Stepper label="Selisih" value={d} set={x => { setD(x); reset(); }} min={Math.max(-9, -Math.floor(a / 5))} max={9} skip={0} plus /></div>
    <div className="rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.8]"><Shelf items={[...shown, null]} steps={Array(5).fill(signed(d))} render={() => <input aria-label="Tebak bilangan berikutnya" inputMode="numeric" value={guess} placeholder="?" onChange={e => setGuess(e.target.value.replace(/\D/g, "").slice(0, 3))} className="size-11 rounded bg-white text-center text-xl font-extrabold focus:outline-success" />} /></div>
    <Result value={`${a}:${d}:${state}`}>{state === "" ? <>Selisih setiap bilangan {signed(d)}, jadi polanya <strong>{d > 0 ? "membesar" : "mengecil"}</strong>. Tebak bilangan berikutnya.</> : state === "ok" ? `Tepat! ${shown[4]} ${signed(d)} = ${next}.` : `Belum tepat. Coba hitung ${shown[4]} ${signed(d)}.`}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { picture: PictureLab, number: NumberLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function Box({ value, onChange, label, disabled, size = 3 }: { value: string; onChange: (v: string) => void; label: string; disabled: boolean; size?: number }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
    className={`h-11 ${size >= 3 ? "w-20" : "w-16"} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none sm:text-2xl`} />;
}
function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = Array.from({ length: p.left.length }, (_, k) => (value ? value.split("|") : [])[k] ?? ""), n = p.left.length, m = p.right.length, H = 1000;
  return <div className="space-y-1.5">
    <p className="text-sm text-base-content/70">{sel === null ? "Ketuk kotak di kiri, lalu ketuk pasangannya di kanan." : "Sekarang ketuk pasangannya di kanan."}</p>
    <div className="grid grid-cols-[minmax(0,1.4fr)_2rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1.4fr)_4rem_minmax(0,1fr)]" style={{ minHeight: Math.max(n, m) * 46 }}>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${l}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`rounded-xl border-2 px-1.5 py-1 text-base font-extrabold sm:text-lg ${sel === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-info/60 bg-base-100" : "border-orange-300 bg-orange-50"}`}>{l}</button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / m) * H} stroke="#0f766e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${m}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || sel === null} aria-label={`Hubungkan ke ${r}`} onClick={() => { if (sel === null) return; const v = [...vals]; v[sel] = String(j); set(v.join("|")); setSel(null); }}
        className="rounded-xl border-2 border-purple-300 bg-purple-50 px-1.5 py-1 text-xl font-extrabold">{r}</button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      return <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xl font-bold sm:text-2xl">{bits.map((b, k) => <span key={k} className="contents">{b && <span>{b.trim()}</span>}{k < bits.length - 1 && <Box label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} size={String(p.answers[k]).length} />}</span>)}</p>; }
    case "seq": return <Shelf items={p.items} render={k => <input aria-label={`Bagian ${i + 1} kotak ${k + 1}`} inputMode="numeric" value={x[k]} disabled={checked} placeholder="…" onChange={e => put(k, e.target.value.replace(/\D/g, "").slice(0, 3))} className="size-11 rounded bg-white text-center text-xl font-extrabold focus:outline-success" />} />;
    case "choice": return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-x-3 gap-y-1.5"><p className="text-xl font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`min-h-11 rounded-2xl border-4 px-3 text-lg font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
    case "rank": { const seq = value ? value.split("|").map(Number) : [];
      return <div className="space-y-1.5"><p className="text-lg font-bold">{p.label}</p>
        <div role="group" aria-label={p.label} className="flex flex-wrap gap-1.5">{p.items.map((it, k) => <button key={k} type="button" aria-label={`Pilih ${it}`} disabled={checked || seq.includes(k)} onClick={() => set([...seq, k].join("|"))} className="btn btn-outline h-12 min-w-14 text-xl">{it}</button>)}</div>
        <div className="flex flex-wrap items-center gap-1">{p.items.map((_, k) => <span key={k} className="grid h-12 min-w-14 place-items-center rounded-lg border-2 border-dashed border-orange-300 bg-white px-1.5 text-xl font-extrabold">{seq[k] !== undefined ? p.items[seq[k]] : k + 1}</span>)}
          <button type="button" className="btn btn-ghost btn-sm gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join("|"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div>
      </div>; }
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "multi": { const on = value ? value.split("|").map(Number) : [];
      return <div role="group" aria-label={p.label} className="space-y-1"><p className="text-lg font-bold">{p.label}</p>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" aria-pressed={on.includes(o)} disabled={checked} onClick={() => set((on.includes(o) ? on.filter(y => y !== o) : [...on, o]).join("|"))} className={`min-h-12 min-w-14 rounded-full border-4 px-2 text-xl font-extrabold ${on.includes(o) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{o}</button>)}</div>
        <p className="text-xs text-base-content/60 [@media(max-height:700px)]:hidden">Pilih semua yang benar. Ketuk lagi untuk membatalkan.</p></div>; }
    case "build": { const n = Number(value || 0);
      return <div className="space-y-1.5"><p className="text-lg font-bold">{p.label} ketuk tambah atau kurangi.</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5"><button type="button" aria-label="Kurangi satu" className="btn btn-square btn-outline" disabled={checked || n <= 0} onClick={() => set(String(n - 1))}><Minus className="size-5" aria-hidden="true" /></button>
            <span className="min-w-20 text-center text-lg font-extrabold">{n} {thingName[p.group.thing]}</span>
            <button type="button" aria-label="Tambah satu" className="btn btn-square btn-outline" disabled={checked || n >= p.max} onClick={() => set(String(n + 1))}><Plus className="size-5" aria-hidden="true" /></button></span>
          <span className="grid min-h-14 min-w-24 place-items-center rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-1.5">{n > 0 ? <GroupArt group={p.group} n={n} size={n > 12 ? 16 : 18} /> : <span className="text-sm text-base-content/50">kosong</span>}</span>
        </div></div>; }
    case "pick": return <div role="group" aria-label={p.label} className="space-y-2">
      <div className="flex flex-wrap items-stretch justify-center gap-1.5">{p.row.map((c, k) => <GroupCard key={k} group={p.group} n={c} label={`Kumpulan ${k + 1}`} size={16} />)}</div>
      <p className="text-lg font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map(o => <button key={o} type="button" aria-label={`${o} ${thingName[p.group.thing]}`} aria-pressed={value === String(o)} disabled={checked} onClick={() => set(String(o))} className={`rounded-2xl border-4 p-1.5 ${value === String(o) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><GroupArt group={p.group} n={o} size={16} /></button>)}</div>
    </div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.78]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeFourPatternsV2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], s = t.sections[0], Lab = labs[s.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Pola Gambar dan Pola Bilangan</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Temukan aturan pada susunan gambar dan deretan bilangan, lalu lanjutkan polanya yang membesar maupun mengecil.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-3">{[2, 4, 6].map(n => <GroupArt key={n} group={{ thing: "jeruk", layout: "rows", per: 2 }} n={n} size={20} />)}</div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Jeruk di meja Bu guru</h2>
        <p className="mt-2 text-sm">Kumpulan pertama 2 jeruk, kumpulan kedua 4, kumpulan ketiga 6. Berapa jeruk pada kumpulan ketujuh? Dengan mengenali polanya, kita bisa menjawab tanpa menggambar semuanya.</p>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-pola-4">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-pola-4" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-1.5">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} title={x.title} className={`btn btn-sm h-auto min-h-9 ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.short}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={topic} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {s.title}</h2>
            <p className="mt-1 text-sm text-base-content/60">{t.title}</p>
            <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-base leading-7">{s.steps.map(x => <li key={x}>{x}</li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-base leading-7">{s.example}</p>}
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{s.demo}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0} onClick={() => go(topic - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => open("practice")}>Latihan {t.code}</button>
            {!last ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(topic + 1)}>Materi berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => open("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<PQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.66]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
