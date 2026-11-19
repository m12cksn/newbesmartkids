"use client";

import { ArrowLeft, ArrowRight, Eraser, Paintbrush, PenLine, RotateCcw, Undo2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { FigShape, FigView, ItemView, JoinView, ObjArt, PictureView, PieceView, PuzzleBase, sharedUnit, tone } from "./GradeOneShapesArt";
import {
  assessment, catName, cells, correct, fits, formCat, formatAnswer, isName, itemCat, itemName, NAMES, pictures, practice, ready, SEP, splitParts, topics,
  type Cat, type Color, type Fig, type Item, type Obj, type Part, type SQuestion,
} from "@/data/grade-one-shapes-v2";

const sel = (on: boolean) => (on ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300");
const figsOf = (items: (Item | string)[]) => items.filter((x): x is Fig => typeof x !== "string");

/* ====================================================================== */
/* Bentuk jawaban                                                          */
/* ====================================================================== */
function NumBox({ value, onChange, label, disabled }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className="h-12 w-14 rounded-2xl border-4 border-orange-400 bg-white text-center text-2xl font-extrabold text-neutral focus:border-success focus:outline-none" />;
}
const Side = ({ it, unit }: { it: Item | string; unit: number }) => (isName(it) ? <span className="px-1 text-center text-lg font-extrabold leading-tight">{it}</span> : <ItemView it={it as Item} size={54} unit={unit} />);
const sideName = (it: Item | string) => (isName(it) ? it : itemName(it as Item));
function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [pick, setPick] = useState<number | null>(null);
  const vals = cells(p, value), n = p.left.length, m = p.right.length, H = 1000;
  const unitL = sharedUnit(figsOf(p.left), 50), unitR = sharedUnit(figsOf(p.right), 50);
  const row = Math.max(n, m) > 4 ? 58 : 66;
  return <div className="space-y-1">
    <p className="text-sm text-base-content/70">{pick === null ? "Ketuk gambar di kiri, lalu ketuk pasangannya di kanan." : "Sekarang ketuk pasangannya di kanan."}</p>
    <div className="mx-auto grid max-w-md grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)]" style={{ height: Math.max(n, m) * row }}>
      <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${itemName(l)}`} aria-pressed={pick === k} onClick={() => setPick(pick === k ? null : k)}
        className={`flex items-center justify-center rounded-2xl border-4 ${pick === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-sky-300 bg-base-100" : "border-orange-200 bg-orange-50"}`}><ItemView it={l} size={50} unit={unitL} /></button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / m) * H} stroke="#0f766e" strokeWidth="3" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${m}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || pick === null} aria-label={`Hubungkan ke ${sideName(r)}`} onClick={() => { if (pick === null) return; const v = [...vals]; v[pick] = String(j); set(v.join("|")); setPick(null); }}
        className="flex items-center justify-center rounded-2xl border-4 border-purple-200 bg-purple-50 disabled:opacity-100"><Side it={r} unit={unitR} /></button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
function TracePart({ p, value, set, checked }: { p: Extract<Part, { kind: "trace" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [traced, name] = cells(p, value), done = traced === "1";
  return <div className="flex flex-wrap items-center justify-center gap-3">
    <button type="button" disabled={checked || done} onClick={() => set(`1|${name}`)} aria-label={done ? "Garis sudah dihubungkan" : "Hubungkan garis putus-putus"} className="rounded-2xl border-4 border-dashed border-orange-300 bg-white p-2 disabled:opacity-100">
      <FigView fig={p.fig} unit={1.7} dashed={!done} label={done ? itemName(p.fig) : "garis putus-putus"} />
      <span className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-base-content/70"><PenLine className="size-4" aria-hidden="true" />{done ? "Tersambung" : "Ketuk untuk menyambung"}</span>
    </button>
    <div role="group" aria-label="Nama bentuk" className="flex flex-col gap-1.5">{NAMES.map(n => <button key={n} type="button" disabled={checked || !done} aria-pressed={name === n} onClick={() => set(`1|${n}`)} className={`min-h-12 rounded-2xl border-4 px-3 text-xl font-extrabold disabled:opacity-60 ${sel(name === n)}`}>{n}</button>)}</div>
  </div>;
}
function MultiPart({ p, value, set, checked }: { p: Extract<Part, { kind: "multi" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const on = value ? value.split(",").map(Number) : [], unit = sharedUnit(figsOf(p.items), 52);
  return <div role="group" aria-label={p.label} className="space-y-1"><p className="text-xl font-bold">{p.label} <span className="text-sm font-normal">(lingkari semua yang benar)</span></p>
    <div className="grid grid-cols-3 gap-1.5">{p.items.map((it, k) => <button key={k} type="button" aria-label={itemName(it)} aria-pressed={on.includes(k)} disabled={checked} onClick={() => set((on.includes(k) ? on.filter(y => y !== k) : [...on, k]).sort((a, b) => a - b).join(","))}
      className={`grid min-h-20 place-items-center rounded-full border-4 p-1 ${sel(on.includes(k))}`}><ItemView it={it} size={52} unit={unit} /></button>)}</div></div>;
}
function PickPart({ p, value, set, checked }: { p: Extract<Part, { kind: "pick" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const figs = figsOf(p.options), unit = p.same ? sharedUnit([...figs, { f: "rect", w: 44, h: 44, c: "merah" }], 60) : sharedUnit(figs, 60);
  return <div role="group" aria-label={p.label} className="space-y-1"><p className="text-xl font-bold">{p.label}</p>
    <div className="flex flex-wrap justify-center gap-2">{p.options.map((o, k) => <button key={k} type="button" aria-label={sideName(o)} aria-pressed={value === String(k)} disabled={checked} onClick={() => set(String(k))}
      className={`grid min-h-16 min-w-20 place-items-center rounded-full border-4 px-3 py-1 ${sel(value === String(k))}`}>{isName(o) ? <span className="text-xl font-extrabold">{o}</span> : <ItemView it={o as Item} size={60} unit={unit} />}</button>)}</div></div>;
}
function PaintPart({ p, value, set, checked }: { p: Extract<Part, { kind: "paint" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [brush, setBrush] = useState<"m" | "k" | "">("m");
  const x = cells(p, value), unit = sharedUnit(p.figs, 84);
  const fillOf = (c: string) => (c === "m" ? "#ef4444" : c === "k" ? "#facc15" : "#fff");
  return <div className="space-y-2">
    <div role="radiogroup" aria-label="Warna kuas" className="flex flex-wrap justify-center gap-2">
      {([["m", "Merah", "#ef4444"], ["k", "Kuning", "#facc15"], ["", "Hapus", "#fff"]] as const).map(([k, n, c]) => <button key={n} type="button" role="radio" aria-checked={brush === k} disabled={checked} onClick={() => setBrush(k)} className={`btn gap-1.5 ${brush === k ? "btn-neutral" : "btn-outline"}`}>{k ? <Paintbrush className="size-4" aria-hidden="true" style={{ color: c }} /> : <Eraser className="size-4" aria-hidden="true" />}{n}</button>)}
    </div>
    <div className="flex flex-wrap items-end justify-center gap-3 rounded-2xl border-4 border-purple-200 bg-white p-2">{p.figs.map((f, k) => <button key={k} type="button" disabled={checked} aria-label={`Bentuk ${k + 1}`} onClick={() => { const v = [...x]; v[k] = brush; set(v.join("|")); }} className="rounded-xl p-1 hover:bg-base-200">
      <FigView fig={f} unit={unit} fill={fillOf(x[k])} label={`bentuk ${k + 1}${x[k] ? (x[k] === "m" ? ", merah" : ", kuning") : ""}`} /></button>)}</div>
  </div>;
}
function SortPart({ p, value, set, checked }: { p: Extract<Part, { kind: "sort" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [pick, setPick] = useState<number | null>(null);
  const vals = cells(p, value), unit = p.same ? sharedUnit(figsOf(p.items), 46) : undefined;
  const put = (bin: number) => { if (pick === null) return; const v = [...vals]; v[pick] = String(bin); set(v.join("|")); setPick(null); };
  const card = (k: number) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${itemName(p.items[k])}`} aria-pressed={pick === k} onClick={() => setPick(pick === k ? null : k)}
    className={`grid size-[3.6rem] place-items-center rounded-xl border-2 bg-white p-0.5 ${pick === k ? "border-success ring-2 ring-success" : "border-base-300"}`}><ItemView it={p.items[k]} size={46} unit={unit} /></button>;
  const loose = vals.map((v, k) => (v === "" ? k : -1)).filter(k => k >= 0);
  return <div className="space-y-1.5">
    <p className="text-sm text-base-content/70">{pick === null ? "Ketuk gambar, lalu ketuk kotak kelompoknya." : `Masukkan ${itemName(p.items[pick])} ke kotak mana?`}</p>
    <div className="flex min-h-[3.6rem] flex-wrap justify-center gap-1.5">{loose.length ? loose.map(card) : <span className="self-center text-sm text-base-content/50">Semua sudah masuk kotak.</span>}</div>
    <div className={`grid gap-1.5 ${p.bins.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>{p.bins.map((b, bi) => <div key={b} className="flex flex-col rounded-xl border-2 border-dashed border-sky-400 bg-sky-50 p-1">
      <button type="button" disabled={checked || pick === null} onClick={() => put(bi)} aria-label={`Masukkan ke ${b}`} className="btn btn-sm btn-info mb-1 h-auto min-h-8 px-1 leading-tight disabled:!bg-sky-200 disabled:!text-sky-900">{b}</button>
      <div className="flex min-h-14 flex-wrap justify-center gap-1">{vals.map((v, k) => (v === String(bi) ? card(k) : null))}</div>
    </div>)}</div>
  </div>;
}
function PuzzlePart({ p, value, set, checked }: { p: Extract<Part, { kind: "puzzle" }>; value: string; set: (v: string) => void; checked: boolean }) {
  return <div className="flex flex-wrap items-center justify-center gap-3">
    <PuzzleBase id={p.puzzle} chosen={value === "" ? undefined : Number(value)} className="h-36 w-36 sm:h-44 sm:w-44" />
    <div role="group" aria-label="Potongan" className="flex flex-wrap justify-center gap-2">{[0, 1, 2].map(k => <button key={k} type="button" aria-label={`Potongan ${"abc"[k]}`} aria-pressed={value === String(k)} disabled={checked} onClick={() => set(String(k))}
      className={`flex min-h-24 flex-col items-center justify-center gap-0.5 rounded-2xl border-4 p-1.5 ${sel(value === String(k))}`}><PieceView id={p.puzzle} k={k} size={60} /><span className="text-base font-extrabold">{"abc"[k]}</span></button>)}</div>
  </div>;
}
function CountPart({ p, value, set, checked, i }: { p: Extract<Part, { kind: "count" }>; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), [mark, setMark] = useState<boolean[]>([]);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  return <div className="flex flex-wrap items-center justify-center gap-3">
    <div className="flex flex-col items-center"><PictureView id={p.picture} className="h-40 w-auto max-w-full sm:h-52" mark={mark} toggle={checked ? undefined : k => setMark(m => { const n = [...m]; n[k] = !n[k]; return n; })} />
      <p className="text-center text-xs text-base-content/60 [@media(max-height:700px)]:hidden">Ketuk bentuk yang sudah dihitung untuk memberi titik.</p></div>
    <div className="grid gap-1">{p.cats.map((c, k) => <label key={c} className="flex items-center justify-between gap-2 rounded-xl bg-base-100 py-0.5 pe-0.5 ps-2 text-base font-bold ring-1 ring-base-300 sm:text-lg">{c === "semua" ? "Banyak bangun datar" : `${catName[c]} ada`}<NumBox label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} /></label>)}</div>
  </div>;
}
/** Papan susun: tempat bergaris putus-putus dan keping di bawahnya. */
function SlotBoard({ picture, order, value, set, disabled }: { picture: string; order: number[]; value: string[]; set: (v: string[]) => void; disabled?: boolean }) {
  const [pick, setPick] = useState<number | null>(null);
  const pic = pictures[picture], used = new Set(value.filter(Boolean).map(Number));
  const place = (slot: number) => { if (disabled) return; const v = [...value]; if (v[slot] !== "" && pick === null) { v[slot] = ""; set(v); return; } if (pick === null) return; v[slot] = String(pick); set(v); setPick(null); };
  const pieces = order.map(k => pic.figs[k]), boardH = 170, unit = (boardH / pic.vb[1]) * 0.62;
  return <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-center sm:gap-4">
    <svg viewBox={`-2 -2 ${pic.vb[0] + 4} ${pic.vb[1] + 4}`} style={{ height: boardH, width: (boardH * (pic.vb[0] + 4)) / (pic.vb[1] + 4) }} className="max-w-full shrink-0" role="group" aria-label={`papan ${pic.name}`}>
      {pic.figs.map((f, k) => { const got = value[k] === "" ? null : pieces[Number(value[k])]; const ok = got && fits(got, f);
        return <g key={k} role="button" tabIndex={disabled ? -1 : 0} aria-label={`Tempat ${k + 1}${got ? ", terisi" : ""}`} onClick={() => place(k)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); place(k); } }} className="cursor-pointer focus:outline-none [&:focus-visible>*]:stroke-[3]">
          {got ? <FigShape fig={{ ...got, x: f.x, y: f.y }} line={ok ? undefined : "#dc2626"} sw={ok ? 1.4 : 2.4} /> : <FigShape fig={f} dashed fill="#fff" sw={1.2} />}
        </g>; })}
    </svg>
    <div role="group" aria-label="Keping" className="flex max-w-xs flex-wrap items-end justify-center gap-1">{pieces.map((f, k) => <button key={k} type="button" disabled={disabled || used.has(k)} aria-label={`Keping ${k + 1}: ${itemName(f)}`} aria-pressed={pick === k} onClick={() => setPick(pick === k ? null : k)}
      className={`grid place-items-center rounded-xl border-2 bg-white p-1 disabled:opacity-25 ${pick === k ? "border-success ring-2 ring-success" : "border-base-300"}`}><FigView fig={f} unit={unit} /></button>)}</div>
  </div>;
}

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ q }: { q: SQuestion }) {
  const sc = q.scene; if (!sc) return null;
  if (sc.type === "join") return <JoinView mode={sc.mode} colors={sc.colors} />;
  const pick = q.parts.find(p => p.kind === "pick") as Extract<Part, { kind: "pick" }> | undefined;
  const unit = pick?.same ? sharedUnit([...sc.figs, ...figsOf(pick.options), { f: "rect", w: 44, h: 44, c: "merah" }], 60) : sharedUnit(sc.figs, 60);
  return <div role="group" aria-label="gambar di atas" className="flex items-end justify-center gap-4 rounded-2xl border-4 border-purple-300 bg-white px-4 py-2">{sc.figs.map((f, k) => <FigView key={k} fig={f} unit={unit} />)}</div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-2xl bg-success/10 p-3 text-lg font-bold leading-7 sm:text-xl">{children}</output>;
const cats: Cat[] = ["lengkung", "segitiga", "segiempat"];
const catFig: Record<Cat, Fig> = { lengkung: { f: "circle", w: 30, h: 30, c: "merah" }, segitiga: { f: "tri", w: 32, h: 28, c: "ungu" }, segiempat: { f: "rect", w: 36, h: 26, c: "biru" } };
const labObjs: Obj[] = ["jam", "buku", "semangka", "donat", "pintu", "rambu", "telur", "jendela", "penggaris"];
function CariLab() {
  const [pick, setPick] = useState<number | null>(null), [bin, setBin] = useState<(Cat | null)[]>(Array(labObjs.length).fill(null));
  const placed = bin.filter(Boolean).length, right = bin.filter((b, k) => b === itemCat(labObjs[k])).length;
  const put = (c: Cat) => { if (pick === null) return; const b = [...bin]; b[pick] = c; setBin(b); setPick(null); };
  const card = (k: number) => { const wrong = bin[k] && bin[k] !== itemCat(labObjs[k]);
    return <button key={k} type="button" aria-label={`Pilih ${itemName(labObjs[k])}`} aria-pressed={pick === k} onClick={() => setPick(pick === k ? null : k)} className={`relative grid size-14 place-items-center rounded-xl border-2 bg-white sm:size-16 ${pick === k ? "border-success ring-2 ring-success" : wrong ? "border-error" : "border-base-300"}`}>
      <ObjArt obj={labObjs[k]} size={48} />
      {bin[k] && !wrong && <svg viewBox="0 0 48 48" className="pointer-events-none absolute inset-1" aria-hidden="true"><FigShape fig={{ ...catFig[bin[k]!], w: 40, h: bin[k] === "segiempat" ? 34 : 40 }} x={4} y={bin[k] === "segiempat" ? 7 : 4} fill="none" line="#16a34a" sw={2.4} /></svg>}
    </button>; };
  return <div className="space-y-2">
    <div className="flex min-h-14 flex-wrap justify-center gap-1.5">{bin.map((b, k) => (b ? null : card(k)))}{placed === labObjs.length && <span className="self-center text-sm">Semua benda sudah dikelompokkan.</span>}</div>
    <div className="grid grid-cols-3 gap-1.5 [@media(max-height:700px)]:[zoom:0.9]">{cats.map(c => <div key={c} className="flex flex-col items-center rounded-xl border-2 border-dashed border-sky-400 bg-sky-50 p-1">
      <button type="button" aria-label={`Masukkan ke ${catName[c]}`} disabled={pick === null} onClick={() => put(c)} className="btn btn-sm btn-info mb-1 h-auto min-h-12 w-full flex-col gap-0 px-1 leading-tight disabled:!bg-sky-200 disabled:!text-sky-900"><FigView fig={catFig[c]} unit={0.7} />{catName[c]}</button>
      <div className="flex min-h-14 flex-wrap justify-center gap-1">{bin.map((b, k) => (b === c ? card(k) : null))}</div></div>)}</div>
    <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => { setBin(Array(labObjs.length).fill(null)); setPick(null); }}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    <Result value={`cari:${placed}:${right}`}>{placed === 0 ? "Ketuk benda, lalu ketuk kotak bentuknya." : `${right} dari ${placed} benda sudah di kotak yang tepat.${placed > right ? " Benda bergaris merah belum tepat, ketuk lalu pindahkan." : ""}`}</Result>
  </div>;
}
const labFigs: Fig[] = [
  { f: "rect", w: 20, h: 20, c: "merah" }, { f: "tri", w: 40, h: 34, c: "kuning" }, { f: "circle", w: 40, h: 40, c: "merah" }, { f: "diamond", w: 22, h: 22, c: "kuning" },
  { f: "circle", w: 18, h: 18, c: "kuning" }, { f: "right", w: 22, h: 22, c: "merah" }, { f: "rect", w: 42, h: 30, c: "kuning" }, { f: "circle", w: 26, h: 40, c: "merah" },
];
const rules = [["bentuk", "Bentuk"], ["warna", "Warna"], ["ukuran", "Ukuran"]] as const;
function KelompokLab() {
  const [rule, setRule] = useState<(typeof rules)[number][0]>("bentuk");
  const groups: [string, (f: Fig) => boolean][] = rule === "bentuk" ? cats.map(c => [catName[c], (f: Fig) => formCat[f.f] === c]) : rule === "warna" ? (["merah", "kuning"] as Color[]).map(c => [c[0].toUpperCase() + c.slice(1), (f: Fig) => f.c === c]) : [["Besar", (f: Fig) => Math.max(f.w, f.h) >= 34], ["Kecil", (f: Fig) => Math.max(f.w, f.h) < 34]];
  const unit = sharedUnit(labFigs, 46);
  return <div className="space-y-2">
    <div role="radiogroup" aria-label="Aturan kelompok" className="flex flex-wrap gap-2"><span className="self-center font-bold">Kelompokkan menurut</span>{rules.map(([k, n]) => <button key={k} type="button" role="radio" aria-checked={rule === k} onClick={() => setRule(k)} className={`btn ${rule === k ? "btn-success" : "btn-outline"}`}>{n}</button>)}</div>
    <div className={`grid gap-2 ${groups.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>{groups.map(([n, test]) => <div key={n} className="rounded-2xl border-2 border-purple-200 bg-white p-2">
      <p className="text-center font-bold">{n}</p><div className="flex min-h-14 flex-wrap items-end justify-center gap-2">{labFigs.filter(test).map((f, k) => <FigView key={k} fig={f} unit={unit} />)}</div></div>)}</div>
    <Result value={`kelompok:${rule}`}>{rule === "bentuk" ? "Menurut bentuk: 3 bentuk lengkung, 2 segitiga, 3 segi empat. Warna dan ukuran tidak dilihat." : rule === "warna" ? "Menurut warna: 4 merah dan 4 kuning, walaupun bentuknya berbeda." : "Menurut ukuran: 4 besar dan 4 kecil. Bentuk dan warna tidak dilihat."}</Result>
  </div>;
}
function SusunLab() {
  const [tab, setTab] = useState<"gabung" | "rumah">("gabung"), [pos, setPos] = useState<0 | 1 | 2>(0), [slots, setSlots] = useState<string[]>(["", "", "", ""]);
  const pic = pictures.rumahKecil, order = [2, 0, 3, 1], ok = slots.filter((v, k) => v !== "" && fits(pic.figs[order[Number(v)]], pic.figs[k])).length;
  return <div className="space-y-2">
    <div role="tablist" aria-label="Kegiatan" className="flex gap-1.5">{([["gabung", "Gabung dua segitiga"], ["rumah", "Susun rumah"]] as const).map(([k, n]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`btn btn-sm ${tab === k ? "btn-success" : "btn-outline"}`}>{n}</button>)}</div>
    {tab === "gabung" ? <>
      <div className="flex min-h-36 items-center justify-center rounded-2xl border-4 border-purple-200 bg-white p-2">{pos === 0
        ? <svg viewBox="-2 -2 134 64" className="h-32 w-64" role="img" aria-label="dua segitiga yang sama besar, terpisah"><polygon points="0,0 0,60 60,60" fill={tone.merah.fill} stroke={tone.merah.line} strokeWidth="2" /><polygon points="130,0 130,60 70,60" fill={tone.biru.fill} stroke={tone.biru.line} strokeWidth="2" /></svg>
        : <JoinView mode={pos === 1 ? "segitiga" : "kotak"} colors={["merah", "biru"]} />}</div>
      <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-success gap-1" onClick={() => setPos(pos === 2 ? 0 : ((pos + 1) as 1 | 2))}><RotateCcw className="size-4 -scale-x-100" aria-hidden="true" />{pos === 0 ? "Tempelkan" : pos === 1 ? "Putar segitiga biru" : "Pisahkan"}</button></div>
      <Result value={`gabung:${pos}`}>{pos === 0 ? "Dua segitiga ini sama besar. Ketuk Tempelkan." : pos === 1 ? "Sisi tegaknya ditempel. Hasilnya segitiga yang lebih besar." : "Segitiga biru diputar dan sisi miringnya ditempel. Hasilnya segi empat."}</Result>
    </> : <>
      <SlotBoard picture="rumahKecil" order={order} value={slots} set={setSlots} />
      <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setSlots(["", "", "", ""])}><Undo2 className="size-4" aria-hidden="true" />Kosongkan</button>
      <Result value={`rumah:${ok}`}>{ok === 4 ? "Rumah jadi: 1 segitiga dan 3 segi empat." : "Ketuk keping, lalu ketuk tempatnya. Keping harus sama bentuk dan ukurannya."}{slots.filter(Boolean).length > ok && " Tempat bergaris merah belum pas."}</Result>
    </>}
  </div>;
}
const labs: Record<string, () => ReactNode> = { cari: CariLab, kelompok: KelompokLab, susun: SusunLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  switch (p.kind) {
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "trace": return <TracePart p={p} value={value} set={set} checked={checked} />;
    case "multi": return <MultiPart p={p} value={value} set={set} checked={checked} />;
    case "pick": return <PickPart p={p} value={value} set={set} checked={checked} />;
    case "paint": return <PaintPart p={p} value={value} set={set} checked={checked} />;
    case "sort": return <SortPart p={p} value={value} set={set} checked={checked} />;
    case "puzzle": return <PuzzlePart p={p} value={value} set={set} checked={checked} />;
    case "count": return <CountPart p={p} value={value} set={set} checked={checked} i={i} />;
    case "slots": return <div className="space-y-1"><p className="text-sm text-base-content/70">Ketuk keping, lalu ketuk tempatnya. Ketuk tempat yang terisi untuk mengosongkan.</p>
      <SlotBoard picture={p.picture} order={p.order} value={cells(p, value)} set={v => set(v.join("|"))} disabled={checked} /></div>;
  }
}
function Answer({ q, value, record, checked }: { q: SQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.8]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeOneShapesV2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], Lab = labs[t.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Mengenal Bentuk</h1>
    <p className="mt-3 max-w-3xl text-lg text-base-content/70">Kenali bentuk lengkung, segitiga, dan segi empat pada benda, kelompokkan benda, lalu susun bentuk baru.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-3"><ObjArt obj="jam" size={52} /><ObjArt obj="semangka" size={52} /><ObjArt obj="buku" size={52} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Piknik bersama</h2>
        <p className="mt-2">Enam sekawan piknik di taman dan membawa makanan. Ada donat, kue risol, dan kue lapis. Bentuk apa saja yang kamu temukan?</p>
        <p className="mt-2 text-sm text-base-content/60">3 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bentuk-1">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bentuk-1" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-1.5">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} title={x.title} className={`btn btn-sm h-auto min-h-9 ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.short}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={topic} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-lg leading-8">{t.steps.map(x => <li key={x}>{x}</li>)}</ol>
            <p className="mt-3 rounded-lg bg-info/10 p-3"><strong>Coba bersama. </strong>{t.demo}</p>
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
      </> : <GradeFourQuiz<SQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 4"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.7]"><SceneView key={q.prompt} q={q} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
