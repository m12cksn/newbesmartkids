"use client";

import { ChevronLeft, ChevronRight, Hand, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { lipatParts, loncatParts, methodFor, methodName, steps, tempelParts } from "@/lib/daily-jarimatika";

const ink = "#5a3b28";
const skin = "#f6d2b0";
const tens = "#7cc98f";
const units = "#f6ad55";
const ease = "cubic-bezier(.2,.8,.2,1)";
const tr = { transition: `transform .55s ${ease}, fill .45s ${ease}, opacity .45s ${ease}` };

/* ====================================================================== */
/* Tangan mendatar untuk tempel jari                                       */
/* ====================================================================== */
/** Urutan dari atas: ibu jari (10), telunjuk (9), tengah (8), manis (7), kelingking (6). */
const H_FINGERS = [
  { v: 10, name: "ibu jari", len: 58, w: 26, y: 18 },
  { v: 9, name: "telunjuk", len: 92, w: 24, y: 50 },
  { v: 8, name: "jari tengah", len: 102, w: 24, y: 78 },
  { v: 7, name: "jari manis", len: 94, w: 23, y: 106 },
  { v: 6, name: "kelingking", len: 76, w: 21, y: 134 },
];
const PALM_X = 60, W = 360;
const tipX = (f: (typeof H_FINGERS)[number], touch: boolean) => PALM_X + f.len + (touch ? 12 : 0);
/** Satu tangan mendatar di dalam SVG bersama. Tangan kanan adalah cerminan tangan kiri. */
function SideHand({ side, touch, step, onTap }: { side: "kiri" | "kanan"; touch: number; step: number; onTap: (v: number) => void }) {
  const mirror = side === "kanan";
  return <g transform={mirror ? `translate(${W} 0) scale(-1 1)` : undefined} role="group" aria-label={`Tangan ${side}`}>
    {H_FINGERS.map(f => {
      const isTouch = f.v === touch, down = f.v <= touch;
      const fill = step >= 2 && down ? tens : step >= 3 && !down ? units : skin;
      const lx = PALM_X + f.len / 2 + 10;
      return <g key={f.v} role="button" tabIndex={0} aria-label={`${f.name} tangan ${side}, nilai ${f.v}`} aria-pressed={isTouch} onClick={() => onTap(f.v)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(f.v); } }}
        className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[4]" style={{ ...tr, transform: `translateX(${isTouch && step >= 1 ? 12 : 0}px)` }}>
        <rect x="20" y={f.y} width={PALM_X - 20 + f.len} height={f.w} rx={f.w / 2} fill={fill} stroke={ink} strokeWidth="2" style={tr} />
        <rect x={PALM_X + f.len - 16} y={f.y + 4} width="12" height={f.w - 8} rx="4" fill="#fbe7d6" stroke={ink} strokeWidth="1" />
        <g transform={mirror ? `translate(${2 * lx} 0) scale(-1 1)` : undefined}><text x={lx} y={f.y + f.w / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={ink}>{f.v}</text></g>
      </g>;
    })}
    <path d="M10 40 C10 22 26 14 44 14 L66 14 L66 172 L40 172 C20 172 8 160 8 140 Z" fill={skin} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    <path d="M30 70 q14 8 30 4 M28 120 q16 6 32 2" fill="none" stroke="#d9a982" strokeWidth="1.5" strokeLinecap="round" />
  </g>;
}
function TempelView({ a, b, step, setA, setB }: { a: number; b: number; step: number; setA: (v: number) => void; setB: (v: number) => void }) {
  const p = tempelParts(a, b), fa = H_FINGERS.find(f => f.v === a)!, fb = H_FINGERS.find(f => f.v === b)!;
  const x1 = tipX(fa, true), y1 = fa.y + fa.w / 2, x2 = W - tipX(fb, true), y2 = fb.y + fb.w / 2;
  return <div className="flex flex-col items-center gap-2">
    <svg viewBox={`0 0 ${W} 186`} className="h-auto w-full max-w-md" role="group" aria-label={`Tangan kiri jari ${a} menempel tangan kanan jari ${b}`}>
      <SideHand side="kiri" touch={a} step={step} onTap={setA} />
      <SideHand side="kanan" touch={b} step={step} onTap={setB} />
      <path d={`M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`} fill="none" stroke="#208f6d" strokeWidth="5" strokeLinecap="round" style={{ ...tr, opacity: step >= 1 ? 1 : 0 }} />
    </svg>
    <div className="flex flex-wrap justify-center gap-2 text-sm font-bold">
      <span className="rounded-full px-3 py-1 transition-opacity duration-500" style={{ background: "#e6f6ea", opacity: step >= 2 ? 1 : 0.35 }}>Bawah {p.downL} + {p.downR} = {p.downL + p.downR}, jadi {p.tens}</span>
      <span className="rounded-full px-3 py-1 transition-opacity duration-500" style={{ background: "#fdf0dd", opacity: step >= 3 ? 1 : 0.35 }}>Atas {p.upL} × {p.upR} = {p.units}</span>
    </div>
  </div>;
}

/* ====================================================================== */
/* Tangan tegak untuk lipat jari dan hitung loncat                         */
/* ====================================================================== */
/** Tangan kiri dilihat dari punggung tangan: kelingking di kiri, ibu jari di kanan. Tangan kanan dicerminkan. */
const U_FINGERS = [
  { x: 22, len: 56, w: 20 }, { x: 44, len: 74, w: 21 }, { x: 67, len: 82, w: 21 }, { x: 90, len: 74, w: 21 },
];
/** Sepuluh jari tegak, nomor 1–10 dari kiri. */
function TenFingers({ state, color, label, onTap }: { state: ("up" | "fold")[]; color: (k: number) => string; label: (k: number) => string; onTap?: (k: number) => void }) {
  const hand = (side: 0 | 1) => {
    const mirror = side === 1, keyOf = (j: number) => (side === 0 ? j : 9 - j);
    const finger = (j: number) => {
      const k = keyOf(j), fold = state[k] === "fold", isThumb = j === 4;
      const f = isThumb ? { x: 116, len: 44, w: 24 } : U_FINGERS[j], base = isThumb ? 132 : 104, top = base - f.len;
      const lx = f.x + f.w / 2, txt = label(k);
      const tap = onTap ? { role: "button", tabIndex: 0, "aria-label": `Jari ke-${k + 1}${fold ? ", terlipat" : ""}`, onClick: () => onTap(k), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(k); } } } : { "aria-label": `Jari ke-${k + 1}${fold ? ", terlipat" : ""}` };
      return <g key={k}>
        <g {...tap} className={onTap ? "cursor-pointer outline-none [&:focus-visible>rect]:stroke-[4]" : ""} style={{ ...tr, transformBox: "fill-box", transformOrigin: "50% 100%", transform: `scaleY(${fold ? 0.3 : 1})` }}>
          <rect x={f.x} y={top} width={f.w} height={f.len + 14} rx={f.w / 2} fill={color(k)} stroke={ink} strokeWidth="2" style={tr} />
          <rect x={f.x + 4} y={top + 4} width={f.w - 8} height="12" rx="4" fill="#fbe7d6" stroke={ink} strokeWidth="1" />
        </g>
        {txt && <g transform={mirror ? `translate(${2 * lx} 0) scale(-1 1)` : undefined}><text x={lx} y={fold ? base - 22 : top - 6} textAnchor="middle" fontSize="13" fontWeight="800" fill={ink} style={tr}>{txt}</text></g>}
      </g>;
    };
    return <svg viewBox="0 0 160 196" className="h-auto w-full max-w-[160px]" role="group" aria-label={side === 0 ? "Tangan kiri" : "Tangan kanan"}>
      <g transform={mirror ? "translate(160 0) scale(-1 1)" : undefined}>
        {[0, 1, 2, 3].map(finger)}
        <path d="M16 104 L118 104 C126 104 128 116 126 132 L120 170 C116 186 106 192 90 192 L46 192 C28 192 18 182 16 166 Z" fill={skin} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
        <path d="M40 150 q20 8 44 0" fill="none" stroke="#d9a982" strokeWidth="1.5" strokeLinecap="round" />
        {finger(4)}
      </g>
    </svg>;
  };
  return <div className="grid w-full max-w-sm grid-cols-2 gap-2">{hand(0)}{hand(1)}</div>;
}
function LipatView({ n, step, setN }: { n: number; step: number; setN: (v: number) => void }) {
  const p = lipatParts(n);
  return <div className="flex flex-col items-center gap-2">
    <TenFingers state={Array.from({ length: 10 }, (_, k) => (step >= 1 && k === n - 1 ? "fold" : "up"))}
      color={k => (k === n - 1 && step >= 1 ? "#d9b99c" : step >= 2 && k < n - 1 ? tens : step >= 3 && k > n - 1 ? units : skin)} label={k => String(k + 1)} onTap={k => setN(k + 1)} />
    <div className="flex flex-wrap justify-center gap-2 text-sm font-bold">
      <span className="rounded-full px-3 py-1 transition-opacity duration-500" style={{ background: "#e6f6ea", opacity: step >= 2 ? 1 : 0.35 }}>Kiri {p.left} jari, jadi {p.left * 10}</span>
      <span className="rounded-full px-3 py-1 transition-opacity duration-500" style={{ background: "#fdf0dd", opacity: step >= 3 ? 1 : 0.35 }}>Kanan {p.right} jari, jadi {p.right}</span>
    </div>
  </div>;
}
function LoncatView({ a, b, step }: { a: number; b: number; step: number }) {
  const p = loncatParts(a, b), raised = Math.min(step, p.fingers);
  return <div className="flex flex-col items-center gap-2">
    <TenFingers state={Array.from({ length: 10 }, (_, k) => (k < raised ? "up" : "fold"))} color={k => (k < raised ? (k === raised - 1 ? units : tens) : "#ead6c3")} label={k => (k < raised ? String(p.totals[k]) : "")} />
    <p className="text-center text-lg font-extrabold tabular-nums">{p.totals.slice(0, raised).join(", ") || `Setiap jari bernilai ${p.step}`}</p>
  </div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const N = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
function Picker({ label, value, set }: { label: string; value: number; set: (v: number) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-1">
    <span className="w-full text-xs font-bold text-[#56715c] sm:w-auto sm:pe-1">{label}</span>
    {N.map(v => <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => set(v)}
      className={`grid size-9 place-items-center rounded-lg text-base font-extrabold transition-colors ${value === v ? "bg-[#208f6d] text-white" : "border border-[#dbe5dc] bg-white text-[#33583e] hover:bg-[#edf6ef]"}`}>{v}</button>)}
  </div>;
}
export default function JarimatikaLab({ a, b, setPair }: { a: number; b: number; setPair: (a: number, b: number) => void }) {
  const [step, setStep] = useState(0), [play, setPlay] = useState(false);
  const m = methodFor(a, b), all = steps(a, b), last = all.length - 1;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!play) return;
    timer.current = setInterval(() => setStep(s => { if (s >= last) { setPlay(false); return s; } return s + 1; }), 1500);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [play, last]);
  const go = (s: number) => { setPlay(false); setStep(Math.max(0, Math.min(last, s))); };
  const nine = a === 9 ? b : a;
  return <section id="peraga" aria-label="Peraga jarimatika" className="scroll-mt-4 rounded-[22px] border border-[#e0e9df] bg-white p-4 shadow-[0_12px_40px_#264e3010] sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#17352a]"><Hand className="size-5 text-[#208f6d]" strokeWidth={1.75} aria-hidden="true" />Peraga jarimatika</h2>
      <span className="rounded-full bg-[#f1f6ef] px-3 py-1 text-xs font-bold text-[#56715c]">{methodName[m]}</span>
    </div>
    <div className="mt-3 space-y-1.5">
      <Picker label="Bilangan pertama" value={a} set={v => setPair(v, b)} />
      <Picker label="Bilangan kedua" value={b} set={v => setPair(a, v)} />
    </div>
    <p className="mt-3 text-center text-3xl font-extrabold tabular-nums text-[#17352a]">{a} × {b} = <span className="inline-block min-w-12 rounded-lg bg-[#fffdf2] px-2 transition-colors duration-500" style={{ color: step >= last ? "#208f6d" : "#c5a64a" }}>{step >= last ? a * b : "?"}</span></p>
    <div className="mt-2 rounded-2xl bg-[#faf9f3] p-2 [@media(max-height:700px)]:[zoom:0.8]">
      {m === "tempel" ? <TempelView a={a} b={b} step={step} setA={v => setPair(v, b)} setB={v => setPair(a, v)} />
        : m === "lipat9" ? <LipatView n={nine} step={step} setN={v => setPair(9, v)} />
          : <LoncatView a={a} b={b} step={step} />}
    </div>
    <output data-testid="lab-result" data-value={`${a}x${b}:${step}`} aria-live="polite" className="mt-3 block min-h-14 rounded-xl bg-[#edf7ee] px-3 py-2 text-sm leading-6 text-[#17352a]">
      <strong>Langkah {step + 1} dari {all.length}.</strong> {all[step]}
    </output>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="btn btn-sm btn-ghost gap-1"><ChevronLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
      <button type="button" onClick={() => go(step + 1)} disabled={step >= last} className="btn btn-sm btn-success gap-1">Langkah berikutnya<ChevronRight className="size-4" aria-hidden="true" /></button>
      <button type="button" onClick={() => { if (step >= last) setStep(0); setPlay(!play); }} className="btn btn-sm btn-outline gap-1" aria-pressed={play}>{play ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}{play ? "Jeda" : "Putar otomatis"}</button>
      <button type="button" onClick={() => go(0)} className="btn btn-sm btn-ghost gap-1 ms-auto"><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    </div>
    <p className="mt-2 text-xs text-[#617367]">{m === "tempel" ? "Ketuk jari di tangan kiri dan kanan untuk memilih bilangan 6 sampai 10." : m === "lipat9" ? "Ketuk jari mana saja untuk mengganti bilangan yang dikali 9." : "Untuk bilangan 1 sampai 5, angkat jari satu per satu dan hitung loncat."}</p>
  </section>;
}
