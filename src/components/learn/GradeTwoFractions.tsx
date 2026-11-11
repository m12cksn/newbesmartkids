"use client";

import { ArrowLeft, ArrowRight, Check, Minus, PaintBucket, PenLine, Plus, RotateCcw, Scissors, X } from "lucide-react";
import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { FoldBoard, FracFig, GroupsFig, ObjIcon, SetFig } from "./FractionVisuals";
import {
  assessment, baseName, correct, equalParts, formatAnswer, foldResult, H, objName, pieces, practice, ready, SEP, shadedShare, splitParts, through, topics, V, D1, D2, RD1,
  type Base, type Fig, type FQuestion, type Line, type Obj, type Part,
} from "@/data/grade-two-fractions";

function FigView({ fig, big = false }: { fig: Fig; big?: boolean }) {
  if (fig.t === "frac") return <FracFig base={fig.base} lines={fig.lines} shaded={fig.shaded} className={big ? "size-36" : "size-20"} />;
  if (fig.t === "groups") return <GroupsFig obj={fig.obj} a={fig.a} b={fig.b} obj2={fig.obj2} size={big ? "size-7" : "size-5"} />;
  return <SetFig obj={fig.obj} n={fig.n} />;
}
const nameOf = (share: number, equal: boolean, n: number) => !equal ? "bukan" : Math.abs(share - 0.5) < 0.005 ? "setengah" : Math.abs(share - 0.25) < 0.005 ? "seperempat" : n === 0 ? "kosong" : "lain";

function ModeToggle({ mode, setMode, disabled = false }: { mode: "garis" | "warnai"; setMode: (m: "garis" | "warnai") => void; disabled?: boolean }) {
  return <div role="group" aria-label="Mode" className="join">
    <button type="button" disabled={disabled} aria-pressed={mode === "garis"} className={`btn btn-sm join-item gap-1 ${mode === "garis" ? "btn-success" : "btn-outline"}`} onClick={() => setMode("garis")}><PenLine className="size-4" aria-hidden="true" />Tarik garis</button>
    <button type="button" disabled={disabled} aria-pressed={mode === "warnai"} className={`btn btn-sm join-item gap-1 ${mode === "warnai" ? "btn-success" : "btn-outline"}`} onClick={() => setMode("warnai")}><PaintBucket className="size-4" aria-hidden="true" />Warnai</button>
  </div>;
}

/* ====================================================================== */
/* Lab A: lipat dan warnai                                                 */
/* ====================================================================== */
const foldGuides: Record<Base, Line[]> = {
  persegi: [V(50), H(50), D1, D2, V(36)], persegiPanjang: [V(50), H(50), RD1, V(30)], lingkaran: [through(90), through(0), through(45), V(30)],
  segitiga: [V(50), H(50), V(35)], belahKetupat: [V(50), H(50), V(34)], segiEnam: [V(50), H(50), V(30)],
};
const labBases: Base[] = ["persegi", "persegiPanjang", "lingkaran", "segitiga", "belahKetupat"];
function FoldLab() {
  const [base, setBase] = useState<Base>("persegi");
  const [chosen, setChosen] = useState<number[]>([0]);
  const [shaded, setShaded] = useState<number[]>([]);
  const [mode, setMode] = useState<"garis" | "warnai">("warnai");
  const ps = pieces(base, chosen.map(g => foldGuides[base][g])), eq = equalParts(ps), share = shadedShare(ps, shaded);
  const name = nameOf(share, eq, shaded.length);
  return <div className="space-y-4">
    <div role="group" aria-label="Pilih bangun" className="flex flex-wrap gap-1.5">{labBases.map(b => <button key={b} type="button" aria-pressed={base === b} className={`btn btn-sm ${base === b ? "btn-success" : "btn-outline"}`} onClick={() => { setBase(b); setChosen([0]); setShaded([]); }}>{baseName[b]}</button>)}</div>
    <ModeToggle mode={mode} setMode={setMode} />
    <div className="grid place-items-center rounded-xl bg-base-100 p-3">
      <FoldBoard key={base} mode={mode} base={base} guides={foldGuides[base]} chosen={chosen} shaded={shaded} onGuide={g => { setChosen(c => c.includes(g) ? c.filter(x => x !== g) : [...c, g]); setShaded([]); }} onPiece={i => setShaded(sh => sh.includes(i) ? sh.filter(x => x !== i) : [...sh, i])} />
    </div>
    <p className="text-xs text-base-content/60">Pilih Tarik garis lalu ketuk garis putus-putus untuk melipat. Pilih Warnai lalu ketuk bagian untuk mewarnainya.</p>
    <output data-testid="lab-result" data-value={name} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      {ps.length} bagian, {eq ? "sama besar" : "tidak sama besar"}. {shaded.length} bagian diwarnai.{" "}
      {name === "setengah" ? <strong>Bagian yang diwarnai adalah setengah.</strong> : name === "seperempat" ? <strong>Bagian yang diwarnai adalah seperempat.</strong> : name === "bukan" ? "Karena bagiannya tidak sama besar, ini bukan setengah atau seperempat." : "Warnai bagian untuk melihat namanya."}
    </output>
  </div>;
}

/* ====================================================================== */
/* Lab B: bagikan satu-satu                                                */
/* ====================================================================== */
const shareObjs: Obj[] = ["marble-blue", "apple", "cupcake", "pencil"];
function ShareLab() {
  const [obj, setObj] = useState<Obj>("marble-blue");
  const [n, setN] = useState(6);
  const [given, setGiven] = useState(0);
  const upe = Math.ceil(given / 2), malosi = Math.floor(given / 2), left = n - given;
  const done = left === 0 || (left === 1 && n % 2 === 1);
  const value = `${upe},${malosi},${left}`;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3">
      <div role="group" aria-label="Pilih benda" className="flex gap-1">{shareObjs.map(o => <button key={o} type="button" aria-label={objName[o]} aria-pressed={obj === o} className={`btn btn-sm btn-square ${obj === o ? "btn-success" : "btn-outline"}`} onClick={() => { setObj(o); setGiven(0); }}><ObjIcon obj={o} className="size-6" /></button>)}</div>
      <div className="flex items-center gap-1" role="group" aria-label="Banyak benda">
        <button type="button" aria-label="Kurangi benda" className="btn btn-sm btn-square btn-outline" disabled={n <= 2} onClick={() => { setN(n - 1); setGiven(0); }}><Minus className="size-4" aria-hidden="true" /></button>
        <span className="w-16 text-center font-bold">{n} {objName[obj]}</span>
        <button type="button" aria-label="Tambah benda" className="btn btn-sm btn-square btn-outline" disabled={n >= 14} onClick={() => { setN(n + 1); setGiven(0); }}><Plus className="size-4" aria-hidden="true" /></button>
      </div>
    </div>
    <div className="rounded-xl bg-base-100 p-3">
      <div className="flex min-h-10 flex-wrap justify-center gap-1">{Array.from({ length: left }, (_, i) => <ObjIcon key={i} obj={obj} className="size-8" />)}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">{[["Upe", upe], ["Malosi", malosi]].map(([who, k]) => <div key={who} className="rounded-xl border-2 border-dashed border-info/50 bg-info/5 p-2 text-center">
        <p className="text-sm font-bold">{who}</p><div className="mt-1 flex min-h-9 flex-wrap justify-center gap-0.5">{Array.from({ length: k as number }, (_, i) => <ObjIcon key={i} obj={obj} className="size-6" />)}</div></div>)}</div>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-success" disabled={done} onClick={() => setGiven(g => g + 1)}>Bagikan satu</button>
      <button type="button" className="btn btn-sm btn-outline" disabled={done} onClick={() => setGiven(n % 2 ? n - 1 : n)}>Bagikan semua</button>
      <button type="button" className="btn btn-ghost btn-sm gap-1" disabled={!given} onClick={() => setGiven(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    </div>
    <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      Upe {upe}, Malosi {malosi}, tersisa {left}.{" "}
      {done ? (n % 2 === 0 ? <strong>Setengah dari {n} {objName[obj]} adalah {n / 2} {objName[obj]}.</strong> : <>Tersisa 1 {objName[obj]}. {n} tidak dapat dibagi menjadi dua kelompok sama banyak.</>) : "Bagikan satu-satu bergantian sampai habis."}
    </output>
  </div>;
}

/* ====================================================================== */
/* Lab C: potong makanan menjadi seperempat                                */
/* ====================================================================== */
const foods: { id: string; name: string; base: Base; fill: string; cuts: Record<string, Line[]> }[] = [
  { id: "martabak", name: "Martabak", base: "lingkaran", fill: "#e3b26a", cuts: { Lurus: [V(50), H(50)], Silang: [through(45), through(135)] } },
  { id: "bolu", name: "Kue bolu", base: "persegi", fill: "#c98a4b", cuts: { Lurus: [V(50), H(50)], Silang: [D1, D2], Lajur: [V(50), V(32.5), V(67.5)] } },
  { id: "roti", name: "Roti tawar", base: "persegiPanjang", fill: "#f2d39b", cuts: { Lurus: [V(50), H(50)], Lajur: [V(50), V(27), V(73)] } },
];
function QuarterLab() {
  const [f, setF] = useState(0);
  const [style, setStyle] = useState("Lurus");
  const [step, setStep] = useState(0);
  const [take, setTake] = useState<number[]>([]);
  const food = foods[f], cuts = food.cuts[style] ?? food.cuts.Lurus;
  const lines = step === 0 ? [] : step === 1 ? cuts.slice(0, 1) : cuts;
  const ps = pieces(food.base, lines), name = nameOf(shadedShare(ps, take), equalParts(ps), take.length);
  return <div className="space-y-4">
    <div role="group" aria-label="Pilih makanan" className="flex flex-wrap gap-1.5">{foods.map((x, i) => <button key={x.id} type="button" aria-pressed={f === i} className={`btn btn-sm ${f === i ? "btn-success" : "btn-outline"}`} onClick={() => { setF(i); setStyle("Lurus"); setStep(0); setTake([]); }}>{x.name}</button>)}</div>
    <div role="group" aria-label="Cara memotong" className="flex flex-wrap gap-1.5">{Object.keys(food.cuts).map(s => <button key={s} type="button" aria-pressed={style === s} className={`btn btn-xs ${style === s ? "btn-info" : "btn-outline"}`} onClick={() => { setStyle(s); setTake([]); }}>Potong {s.toLowerCase()}</button>)}</div>
    <div className="grid place-items-center rounded-xl bg-base-100 p-3"><FracFig base={food.base} lines={lines} shaded={take} fill={food.fill} shade="#7a4a20" className="w-full max-w-60" label={food.name} onTap={i => step > 0 && setTake(t => t.includes(i) ? t.filter(x => x !== i) : [...t, i])} /></div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-success gap-1" disabled={step >= 2} onClick={() => { setStep(step + 1); setTake([]); }}><Scissors className="size-4" aria-hidden="true" />{step === 0 ? "Potong jadi 2" : "Potong lagi jadi 4"}</button>
      <button type="button" className="btn btn-ghost btn-sm gap-1" disabled={!step} onClick={() => { setStep(0); setTake([]); }}><RotateCcw className="size-4" aria-hidden="true" />Utuhkan lagi</button>
    </div>
    <output data-testid="lab-result" data-value={`${ps.length}:${take.length}`} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      {food.name} {step === 0 ? "masih utuh." : `dipotong menjadi ${ps.length} bagian sama besar.`}{" "}
      {take.length ? <>Kamu mengambil {take.length} potong. {name === "seperempat" ? <strong>Itu seperempat {food.name.toLowerCase()}.</strong> : name === "setengah" ? <strong>Itu setengah {food.name.toLowerCase()}.</strong> : ""}</> : step ? "Ketuk satu potong untuk mengambilnya." : "Potong menjadi dua, lalu potong lagi."}
    </output>
  </div>;
}
const labs = [FoldLab, ShareLab, QuarterLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function FoldPart({ p, value, set, checked }: { p: Extract<Part, { kind: "fold" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const r = foldResult(p, value || "/");
  const enc = (lines: number[], s: number | null) => `${[...lines].sort((a, b) => a - b).join("+")}/${s ?? ""}`;
  const [mode, setMode] = useState<"garis" | "warnai">("garis");
  return <div className="space-y-2">
    <p className="text-xs text-base-content/60">Pilih Tarik garis, lalu ketuk garis putus-putus yang ingin kamu tarik. Setelah itu pilih Warnai dan ketuk satu bagian.</p>
    <ModeToggle mode={mode} setMode={setMode} disabled={checked} />
    <div className="grid place-items-center"><FoldBoard mode={mode} base={p.base} guides={p.guides} chosen={r.lines} shaded={r.shaded === null ? [] : [r.shaded]} disabled={checked}
      onGuide={g => set(enc(r.lines.includes(g) ? r.lines.filter(x => x !== g) : [...r.lines, g], null))} onPiece={i => set(enc(r.lines, i))} /></div>
    <p role="status" className="text-center text-sm font-semibold">{r.lines.length ? `${r.ps.length} bagian, ${equalParts(r.ps) ? "sama besar" : "tidak sama besar"}.` : "Belum ada garis."}</p>
  </div>;
}
function PickPart({ p, value, set, checked }: { p: Extract<Part, { kind: "pick" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const sel = value ? value.split(",").filter(Boolean).map(Number) : [];
  return <div className="space-y-2"><p className="text-xs text-base-content/60">Ketuk benda untuk {p.mode === "warnai" ? "mewarnainya" : "melingkarinya"}. Ketuk lagi untuk membatalkan. Terpilih {sel.length}.</p>
    <div className="flex max-w-md flex-wrap gap-1.5">{Array.from({ length: p.n }, (_, k) => { const on = sel.includes(k); return <button key={k} type="button" disabled={checked} aria-label={`${p.label} ${k + 1}`} aria-pressed={on}
      onClick={() => set((on ? sel.filter(x => x !== k) : [...sel, k]).sort((a, b) => a - b).join(","))}
      className={`rounded-full p-1 ${on ? (p.mode === "lingkari" ? "ring-[3px] ring-error" : "bg-warning/50") : ""}`}><span className={!on && p.mode === "warnai" ? "block opacity-45 grayscale" : "block"}><ObjIcon obj={p.obj} className="size-9" /></span></button>; })}</div></div>;
}
function SharePart({ p, value, set, checked }: { p: Extract<Part, { kind: "share" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [a, b] = value ? value.split(",").map(Number) : [0, 0], left = p.n - a - b;
  return <div className="space-y-2">
    <div className="flex min-h-10 flex-wrap gap-0.5 rounded-xl bg-base-200/60 p-2" aria-label={`Sisa ${left}`}>{Array.from({ length: left }, (_, i) => <ObjIcon key={i} obj={p.obj} className="size-7" />)}{!left && <span className="text-sm text-base-content/60">Semua sudah dibagikan.</span>}</div>
    <div className="grid grid-cols-2 gap-2">{p.boxes.map((bx, k) => { const c = k ? b : a; return <div key={bx} className="rounded-xl border-2 border-dashed border-info/50 bg-info/5 p-2 text-center">
      <p className="text-sm font-bold">{bx}: {c}</p><div className="mt-1 flex min-h-8 flex-wrap justify-center gap-0.5">{Array.from({ length: c }, (_, i) => <ObjIcon key={i} obj={p.obj} className="size-5" />)}</div>
      <div className="mt-1 flex justify-center gap-1">
        <button type="button" disabled={checked || !left} aria-label={`Masukkan ke ${bx}`} className="btn btn-xs btn-info" onClick={() => set(k ? `${a},${b + 1}` : `${a + 1},${b}`)}><Plus className="size-3.5" aria-hidden="true" /></button>
        <button type="button" disabled={checked || !c} aria-label={`Ambil dari ${bx}`} className="btn btn-xs btn-outline" onClick={() => set(k ? `${a},${b - 1}` : `${a - 1},${b}`)}><Minus className="size-3.5" aria-hidden="true" /></button>
      </div></div>; })}</div>
  </div>;
}
function SortPart({ p, value, set, checked }: { p: Extract<Part, { kind: "sort" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = Array.from({ length: p.items.length }, (_, k) => value.split(",")[k] ?? "");
  const put = (k: number, b: string) => { const v = [...vals]; v[k] = b; set(v.join(",")); setSel(null); };
  const loose = p.items.map((_, k) => k).filter(k => vals[k] === "");
  return <div className="space-y-2">
    <div role="group" aria-label="Gambar yang belum dikelompokkan" className="flex min-h-16 flex-wrap gap-2 rounded-xl bg-base-200/60 p-2">
      {loose.length ? loose.map(k => <button key={k} type="button" disabled={checked} aria-label={`Ambil ${p.items[k].name}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`flex flex-col items-center rounded-xl border-2 bg-base-100 p-1 text-xs font-semibold ${sel === k ? "border-success ring-2 ring-success/40" : "border-base-300"}`}><FigView fig={p.items[k].fig} />{p.items[k].name}</button>)
        : <p className="self-center px-2 text-sm text-base-content/60">Semua sudah dikelompokkan.</p>}
    </div>
    <p className="text-xs text-base-content/60">{sel === null ? "Ketuk satu gambar, lalu ketuk kotak tujuannya." : `Gambar ${p.items[sel].name} dipilih. Ketuk kotak tujuannya.`}</p>
    <div className="grid grid-cols-2 gap-2">{p.bins.map((b, bi) => <div key={b} className="flex min-w-0 flex-col rounded-xl border-2 border-dashed border-info/50 bg-info/5 p-2">
      <button type="button" disabled={checked || sel === null} aria-label={`Masukkan ke ${b}`} onClick={() => sel !== null && put(sel, String(bi))} className="btn btn-xs btn-info btn-outline h-auto min-h-7 whitespace-normal">{b}</button>
      <div className="mt-2 flex min-h-12 flex-wrap gap-1">{p.items.map((it, k) => vals[k] === String(bi) && <button key={k} type="button" disabled={checked} aria-label={`Keluarkan ${it.name}`} onClick={() => put(k, "")} className="flex flex-col items-center rounded-lg bg-base-100 p-0.5 text-[11px] font-semibold"><FigView fig={it.fig} />{it.name}</button>)}</div>
    </div>)}</div>
  </div>;
}
function PartView({ p, i, value, set, checked }: { p: Part; i: number; value: string; set: (v: string) => void; checked: boolean }) {
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 font-bold">{p.label} = <input aria-label={p.label} inputMode="numeric" value={value} disabled={checked} placeholder="…" onChange={e => set(e.target.value.replace(/\D/g, "").slice(0, 2))}
      className="h-11 w-20 rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none" /></label>;
    case "choice": return <div role="group" aria-label={`Bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{p.options.map((o, k) => <button key={o} type="button" aria-label={o} aria-pressed={value === o} disabled={checked} onClick={() => set(o)}
        className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 font-bold ${value === o ? "border-success bg-success/10" : "border-base-300 bg-base-100 hover:border-success/40"}`}>{p.figs && <FigView fig={p.figs[k]} />}<span>{o}</span></button>)}</div></div>;
    case "shade": { const sel = value ? value.split(",").filter(Boolean).map(Number) : []; return <div className="space-y-1"><p className="text-xs text-base-content/60">Ketuk bagian untuk mewarnainya. Ketuk lagi untuk menghapus warna.</p>
      <div className="grid place-items-center"><FracFig base={p.base} lines={p.lines} shaded={sel} label={p.label} className="w-full max-w-60" onTap={k => !checked && set((sel.includes(k) ? sel.filter(x => x !== k) : [...sel, k]).sort((a, b) => a - b).join(","))} /></div></div>; }
    case "fold": return <FoldPart p={p} value={value} set={set} checked={checked} />;
    case "mark": { const vals = Array.from({ length: p.items.length }, (_, k) => value.split(",")[k] ?? ""); const put = (k: number, m: string) => { const v = [...vals]; v[k] = m; set(v.join(",")); };
      return <div className="grid gap-2 sm:grid-cols-2">{p.items.map((it, k) => <div key={k} className="flex min-w-0 items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-2">
        <span className="font-bold">{it.name}.</span><div className="min-w-0 flex-1"><FigView fig={it.fig} /></div>
        <div className="flex shrink-0 flex-col gap-1">
          <button type="button" disabled={checked} aria-label={`Benar ${it.name}`} aria-pressed={vals[k] === "y"} onClick={() => put(k, "y")} className={`grid size-9 place-items-center rounded-lg border-2 ${vals[k] === "y" ? "border-success bg-success text-white" : "border-base-300 bg-white"}`}><Check className="size-5" aria-hidden="true" /></button>
          <button type="button" disabled={checked} aria-label={`Salah ${it.name}`} aria-pressed={vals[k] === "n"} onClick={() => put(k, "n")} className={`grid size-9 place-items-center rounded-lg border-2 ${vals[k] === "n" ? "border-error bg-error text-white" : "border-base-300 bg-white"}`}><X className="size-5" aria-hidden="true" /></button>
        </div></div>)}</div>; }
    case "sort": return <SortPart p={p} value={value} set={set} checked={checked} />;
    case "check": { const sel = value ? value.split(",").filter(Boolean).map(Number) : []; return <div className="space-y-1"><p className="text-xs text-base-content/60">Ketuk untuk melingkari. Ketuk lagi untuk membatalkan.</p>
      <div className="grid gap-2 sm:grid-cols-2">{p.items.map((it, k) => { const on = sel.includes(k); return <button key={k} type="button" disabled={checked} aria-label={`Lingkari ${it.name}`} aria-pressed={on} onClick={() => set((on ? sel.filter(x => x !== k) : [...sel, k]).sort((a, b) => a - b).join(","))}
        className={`flex items-center gap-2 rounded-2xl border-[3px] bg-base-100 p-2 text-left ${on ? "border-error" : "border-transparent ring-1 ring-base-300"}`}><span className="font-bold">{it.name}.</span><FigView fig={it.fig} /></button>; })}</div></div>; }
    case "pick": return <PickPart p={p} value={value} set={set} checked={checked} />;
    case "share": return <SharePart p={p} value={value} set={set} checked={checked} />;
  }
}
function Answer({ q, value, record, checked }: { q: FQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} p={p} i={i} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeTwoFractions() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 2, Bab 5</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Pecahan</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Bagi benda utuh menjadi dua atau empat bagian sama besar, bagi kumpulan benda sama banyak, lalu kenali setengah dan seperempat.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div className="flex items-center gap-3" aria-hidden="true"><FracFig base="lingkaran" lines={[V(50), H(50)]} shaded={[0]} fill="#e3b26a" shade="#7a4a20" className="size-16" /><FracFig base="persegi" lines={[V(50)]} shaded={[1]} className="size-14" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Sama besar, sama banyak</h2>
        <p className="mt-2 text-sm text-base-content/60">3 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-pecahan">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-pecahan" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<FQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 5"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.fig ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><FigView fig={q.fig} big /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
