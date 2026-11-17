"use client";

import { ChevronLeft, ChevronRight, Hand, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { lesson, lipatParts, loncatParts, methodFor, methodName, tempelParts } from "@/lib/daily-jarimatika";

/* ====================================================================== */
/* Jari dan tangan                                                         */
/* ====================================================================== */
const LINE = "#b9805a", CREASE = "#c78b66", GREEN = "#208f6d", ORANGE = "#d9822b";
const EASE = "cubic-bezier(.22,.9,.25,1)";
/** Ruas pangkal jari (bagian yang tetap terlihat saat jari ditekuk), sebagai bagian dari panjang jari. */
const BASE = 0.42;
type Tone = "skin" | "tens" | "units" | "off";
const fillOf = (t: Tone) => `url(#jm-${t})`;

function Defs() {
  const g = (id: string, a: string, b: string) => <linearGradient id={`jm-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset=".38" stopColor={b} /><stop offset=".62" stopColor={b} /><stop offset="1" stopColor={a} /></linearGradient>;
  return <defs>
    {g("skin", "#e7ae86", "#f8d6b8")}{g("tens", "#8fc98a", "#d3efc9")}{g("units", "#f0aa62", "#fde2bf")}{g("off", "#d9b294", "#ecd2bd")}
    <radialGradient id="jm-palm" cx=".55" cy=".45" r=".7"><stop offset="0" stopColor="#f9d9bd" /><stop offset=".7" stopColor="#f2c6a1" /><stop offset="1" stopColor="#e5ad86" /></radialGradient>
  </defs>;
}

/**
 * Satu jari, digambar mengarah ke kanan lalu diputar. `reach` 1 berarti jari lurus penuh;
 * nilai lebih kecil menekuk ruas ujung sehingga yang terlihat hanya ruas pangkal dan buku jari.
 */
function Finger({ x, y, ang, L, w, reach, tone, nail, delay = 0, ring }: { x: number; y: number; ang: number; L: number; w: number; reach: number; tone: Tone; nail: boolean; delay?: number; ring?: boolean }) {
  const P = BASE * L, x0 = P - w / 2, s = Math.max(0, Math.min(1, (reach * L - x0) / (L - x0)));
  const tr = { transition: `transform .7s ${EASE} ${delay}ms` };
  const fill = fillOf(tone), stroke = ring ? GREEN : LINE, sw = ring ? 3 : 1.6;
  return <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    <rect x={-12} y={-w / 2} width={P + 12} height={w} fill={fill} />
    <path d={`M-12 ${-w / 2} H${P} M-12 ${w / 2} H${P}`} stroke={stroke} strokeWidth={sw} />
    <circle cx={P} cy={0} r={w / 2} fill={fill} stroke={stroke} strokeWidth={sw} />
    <path d={`M${P - 4} ${-w * 0.28} q5 ${w * 0.28} 0 ${w * 0.56}`} fill="none" stroke={CREASE} strokeWidth="1.4" strokeLinecap="round" opacity={s < 0.3 ? 0.9 : 0} />
    <path d={`M${P * 0.62} ${-w * 0.32} q-3 ${w * 0.32} 0 ${w * 0.64}`} fill="none" stroke={CREASE} strokeWidth="1.3" strokeLinecap="round" />
    <g style={{ ...tr, transformBox: "fill-box", transformOrigin: "0% 50%", transform: `scaleX(${s})` }}>
      <rect x={x0} y={-w / 2} width={L - x0} height={w} rx={w / 2} fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d={`M${L * 0.7} ${-w * 0.34} q-3 ${w * 0.34} 0 ${w * 0.68} M${L * 0.7 + 4} ${-w * 0.26} q-2 ${w * 0.26} 0 ${w * 0.52}`} fill="none" stroke={CREASE} strokeWidth="1.2" strokeLinecap="round" />
      {nail
        ? <rect x={L - w * 0.92} y={-w * 0.31} width={w * 0.7} height={w * 0.62} rx={w * 0.28} fill="#fbe6d6" stroke="#d8a27e" strokeWidth="1.1" />
        : <ellipse cx={L - w * 0.55} cy={0} rx={w * 0.34} ry={w * 0.3} fill="#fff" opacity=".22" />}
    </g>
  </g>;
}
const at = (f: { x: number; y: number; ang: number; L: number }, d: number) => ({ x: f.x + Math.cos((f.ang * Math.PI) / 180) * d, y: f.y + Math.sin((f.ang * Math.PI) / 180) * d });
function Bubble({ x, y, text, color, light = false, show = true, delay = 0 }: { x: number; y: number; text: string | number; color: string; light?: boolean; show?: boolean; delay?: number }) {
  const r = String(text).length > 2 ? 21 : 17;
  return <g style={{ transition: `opacity .45s ease ${delay}ms`, opacity: show ? 1 : 0, pointerEvents: "none" }} aria-hidden="true">
    <circle cx={x} cy={y} r={r} fill={light ? "#fff" : color} stroke={color} strokeWidth="2" />
    <text x={x} y={y + 6} textAnchor="middle" fontSize={String(text).length > 2 ? 16 : 18} fontWeight="800" fill={light ? color : "#fff"}>{text}</text>
  </g>;
}
function tapProps(label: string, onTap?: () => void, pressed?: boolean) {
  if (!onTap) return { "aria-label": label };
  return { role: "button", tabIndex: 0, "aria-label": label, "aria-pressed": pressed, onClick: onTap, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(); } }, className: "cursor-pointer outline-none [&:focus-visible_rect]:stroke-[#208f6d] [&:focus-visible_rect]:stroke-[3]" };
}

/* ====================================================================== */
/* Tempel jari: dua tangan mendatar, telapak menghadap kita                 */
/* ====================================================================== */
const SIDE = [
  { v: 10, name: "ibu jari", x: 124, y: 66, ang: -14, L: 122, w: 31 },
  { v: 9, name: "telunjuk", x: 158, y: 94, ang: 0, L: 124, w: 30 },
  { v: 8, name: "jari tengah", x: 162, y: 126, ang: 0, L: 134, w: 31 },
  { v: 7, name: "jari manis", x: 160, y: 158, ang: 1, L: 126, w: 29 },
  { v: 6, name: "kelingking", x: 154, y: 188, ang: 4, L: 104, w: 25 },
];
const SW = 660, SC = SW / 2, SY = 92;
const tipOf = (f: (typeof SIDE)[number], reach = 1) => at(f, f.L * reach);
const MAXTIP = Math.max(...SIDE.map(f => tipOf(f).x));
/** Jari yang bertemu tetap lurus; jari lain sedikit ditekuk agar tidak menabrak tangan seberang. */
function sideReach(f: (typeof SIDE)[number], touch: number, step: number) {
  if (step >= 2 && f.v <= touch) return 0;
  if (step >= 1 && f.v !== touch) return Math.max(0.6, Math.min(1, (tipOf(SIDE.find(g => g.v === touch)!).x - 14 - f.x) / (f.L * Math.cos((f.ang * Math.PI) / 180))));
  return 1;
}
function SideHand({ side, touch, step, onTap }: { side: "kiri" | "kanan"; touch: number; step: number; onTap: (v: number) => void }) {
  const reachOf = (f: (typeof SIDE)[number]) => sideReach(f, touch, step);
  const toneOf = (f: (typeof SIDE)[number]): Tone => (step >= 2 && f.v <= touch ? "tens" : step >= 3 ? "units" : "skin");
  const finger = (f: (typeof SIDE)[number]) => <g key={f.v} {...tapProps(`${f.name} tangan ${side}, nilai ${f.v}`, () => onTap(f.v), f.v === touch)}>
    <Finger {...f} reach={reachOf(f)} tone={toneOf(f)} nail={false} ring={step === 1 && f.v === touch} delay={step >= 2 && f.v <= touch ? (touch - f.v) * 160 : 0} />
  </g>;
  return <>
    {SIDE.slice(1).map(finger)}
    <path d="M74 90 C84 80 90 70 100 62 C120 56 142 60 156 76 C166 86 172 96 172 110 L174 198 C172 210 160 216 140 216 C112 216 92 212 74 206 Z" fill="url(#jm-palm)" stroke={LINE} strokeWidth="1.6" />
    <path d="M150 110 C128 106 108 114 96 126 M156 150 C132 146 114 152 102 162 M122 80 C104 102 100 134 110 172" fill="none" stroke={CREASE} strokeWidth="1.3" strokeLinecap="round" opacity=".7" />
    {finger(SIDE[0])}
  </>;
}
/** Penanda di atas tangan; dihitung tanpa cermin agar angka tetap terbaca. */
function SideMarks({ dir, touch, step }: { dir: 1 | -1; touch: number; step: number }) {
  const up = SIDE.filter(f => f.v > touch);
  return <>{SIDE.map(f => {
    const v = at(f, BASE * f.L * 0.55), folded = step >= 2 && f.v <= touch, k = up.indexOf(f);
    const tens = at(f, BASE * f.L + f.w / 2 + 18), tip = tipOf(f, sideReach(f, touch, step));
    return <g key={f.v}>
      <Bubble x={dir * v.x} y={v.y} text={f.v} color="#8a5a3b" light show={step === 0 || (step === 1 && f.v === touch)} />
      <Bubble x={dir * tens.x} y={tens.y} text="10" color={GREEN} show={folded} delay={step === 2 ? (touch - f.v) * 160 + 350 : 0} />
      {k >= 0 && <Bubble x={dir * (tip.x - 20)} y={tip.y} text={k + 1} color={ORANGE} show={step >= 3} delay={step === 3 ? k * 160 : 0} />}
    </g>;
  })}</>;
}
function TempelView({ a, b, step, setA, setB }: { a: number; b: number; step: number; setA: (v: number) => void; setB: (v: number) => void }) {
  const fa = SIDE.find(f => f.v === a)!, fb = SIDE.find(f => f.v === b)!, ta = tipOf(fa), tb = tipOf(fb);
  const met = step >= 1, dy = (tb.y - ta.y) / 2;
  const L = { x: met ? SC - 2 - ta.x : SC - 18 - MAXTIP, y: SY + (met ? dy : 0) };
  const R = { x: met ? SC + 2 + tb.x : SC + 18 + MAXTIP, y: SY - (met ? dy : 0) };
  const move = { transition: `transform .9s ${EASE}` };
  const contact = { x: SC, y: L.y + ta.y };
  return <svg viewBox={`84 ${SY - 52} ${SW - 168} 350`} className="mx-auto h-auto w-full max-w-xl" role="group" aria-label={`Tangan kiri jari ${a} dan tangan kanan jari ${b}`}>
    <Defs />
    <g style={{ ...move, transform: `translate(${L.x}px, ${L.y}px)` }}><g role="group" aria-label="Tangan kiri"><SideHand side="kiri" touch={a} step={step} onTap={setA} /></g><SideMarks dir={1} touch={a} step={step} /></g>
    <g style={{ ...move, transform: `translate(${R.x}px, ${R.y}px)` }}><g role="group" aria-label="Tangan kanan" transform="scale(-1 1)"><SideHand side="kanan" touch={b} step={step} onTap={setB} /></g><SideMarks dir={-1} touch={b} step={step} /></g>
    <circle cx={contact.x} cy={contact.y} r="11" fill="none" stroke={GREEN} strokeWidth="3" style={{ transition: "opacity .4s ease .7s", opacity: step === 1 ? 1 : 0 }} />
  </svg>;
}

/* ====================================================================== */
/* Lipat jari dan hitung loncat: dua tangan tegak, punggung tangan terlihat */
/* ====================================================================== */
const UP = [
  { x: 54, y: 152, ang: -94, L: 98, w: 26 },
  { x: 86, y: 146, ang: -91, L: 120, w: 29 },
  { x: 120, y: 144, ang: -89, L: 130, w: 30 },
  { x: 154, y: 148, ang: -86, L: 120, w: 29 },
  { x: 182, y: 216, ang: -68, L: 94, w: 32 },
];
const UW = 500;
/** Jari ke-k (0–9) dari kiri: tangan kiri kelingking sampai ibu jari, tangan kanan ibu jari sampai kelingking. */
const upFinger = (k: number) => (k < 5 ? UP[k] : UP[9 - k]);
function TenFingers({ reach, tone, marks, onTap, label }: { reach: (k: number) => number; tone: (k: number) => Tone; marks: (k: number) => { text: string | number; color: string; light?: boolean } | null; onTap?: (k: number) => void; label: (k: number) => string }) {
  const finger = (k: number) => <g key={k} {...tapProps(label(k), onTap && (() => onTap(k)))}><Finger {...upFinger(k)} reach={reach(k)} tone={tone(k)} nail delay={0} /></g>;
  const hand = (right: boolean) => {
    const ks = right ? [9, 8, 7, 6] : [0, 1, 2, 3], thumb = right ? 5 : 4;
    return <g transform={right ? `translate(${UW} 0) scale(-1 1)` : undefined} role="group" aria-label={right ? "Tangan kanan" : "Tangan kiri"}>
      {ks.map(finger)}
      <path d="M36 152 C36 140 50 134 70 134 L162 136 C178 138 186 150 188 170 L190 206 C192 236 176 258 150 268 L146 292 L66 292 L62 268 C44 258 36 240 36 214 Z" fill="url(#jm-palm)" stroke={LINE} strokeWidth="1.6" />
      <path d="M62 158 q8 -5 16 0 M96 154 q8 -5 16 0 M130 154 q8 -5 16 0" fill="none" stroke={CREASE} strokeWidth="1.3" strokeLinecap="round" opacity=".8" />
      {finger(thumb)}
    </g>;
  };
  return <svg viewBox={`0 -24 ${UW} 316`} className="mx-auto h-auto w-full max-w-xl" role="group" aria-label="Sepuluh jari">
    <Defs />
    {hand(false)}{hand(true)}
    {Array.from({ length: 10 }, (_, k) => {
      const f = upFinger(k), m = marks(k), p = at(f, f.L * Math.max(BASE + 0.12, reach(k)) + 20), x = k < 5 ? p.x : UW - p.x;
      return m && <g key={k} style={{ transition: `transform .7s ${EASE}`, transform: `translate(${x}px, ${p.y}px)` }}><Bubble x={0} y={0} text={m.text} color={m.color} light={m.light} /></g>;
    })}
  </svg>;
}
function LipatView({ n, step, setN }: { n: number; step: number; setN: (v: number) => void }) {
  const fold = n - 1, left = (k: number) => k < fold, right = (k: number) => k > fold;
  return <TenFingers
    reach={k => (step >= 1 && k === fold ? 0 : 1)}
    tone={k => (step >= 1 && k === fold ? "off" : step >= 2 && left(k) ? "tens" : step >= 3 && right(k) ? "units" : "skin")}
    marks={k => (step >= 1 && k === fold ? { text: k + 1, color: "#9b7a63", light: true } : step >= 2 && left(k) ? { text: k + 1, color: GREEN } : step >= 3 && right(k) ? { text: k + 1, color: ORANGE } : { text: k + 1, color: "#8a5a3b", light: true })}
    label={k => `Jari ke-${k + 1}${step >= 1 && k === fold ? ", ditekuk" : ""}`} onTap={k => setN(k + 1)} />;
}
function LoncatView({ a, b, step }: { a: number; b: number; step: number }) {
  const p = loncatParts(a, b), raised = Math.min(step, p.fingers);
  return <TenFingers
    reach={k => (k < raised ? 1 : 0)}
    tone={k => (k < raised ? (k === raised - 1 ? "units" : "tens") : "skin")}
    marks={k => (k < raised ? { text: p.totals[k], color: k === raised - 1 ? ORANGE : GREEN } : null)}
    label={k => `Jari ke-${k + 1}${k < raised ? ", berdiri" : ", ditekuk"}`} />;
}

/* ====================================================================== */
/* Papan hitung: angka besar yang mengikuti langkah                        */
/* ====================================================================== */
function Board({ a, b, step }: { a: number; b: number; step: number }) {
  const m = methodFor(a, b);
  const cell = (on: boolean, color: string, label: string, value: string) => <div className="rounded-2xl border-2 px-2 py-2 text-center transition-all duration-500 sm:px-3" style={{ borderColor: on ? color : "#e4e8e2", background: on ? `${color}14` : "#fff", opacity: on ? 1 : 0.6 }}>
    <div className="text-xs font-bold sm:text-sm" style={{ color }}>{label}</div>
    <div className="text-lg font-extrabold tabular-nums text-[#17352a] sm:text-2xl">{on ? value : "?"}</div>
  </div>;
  if (m === "loncat") {
    const p = loncatParts(a, b), shown = p.totals.slice(0, Math.min(step, p.fingers));
    return <div className="rounded-2xl border-2 border-[#e4e8e2] bg-white px-3 py-2 text-center">
      <div className="text-sm font-bold text-[#56715c]">Hitung loncat {p.step}</div>
      <div className="min-h-9 text-2xl font-extrabold tabular-nums text-[#17352a] sm:text-3xl">{shown.length ? shown.join(", ") : "…"}</div>
    </div>;
  }
  if (m === "tempel") {
    const p = tempelParts(a, b);
    return <div className="grid grid-cols-3 gap-2">
      {cell(step >= 2, GREEN, "Puluhan", `${p.downL + p.downR} × 10 = ${p.tens}`)}{cell(step >= 3, ORANGE, "Satuan", `${p.upL} × ${p.upR} = ${p.units}`)}{cell(step >= 4, "#17352a", "Hasil", `${p.tens} + ${p.units} = ${a * b}`)}
    </div>;
  }
  const p = lipatParts(a === 9 ? b : a);
  return <div className="grid grid-cols-3 gap-2">
    {cell(step >= 2, GREEN, "Puluhan", `${p.left} jari = ${p.left * 10}`)}{cell(step >= 3, ORANGE, "Satuan", `${p.right} jari = ${p.right}`)}{cell(step >= 4, "#17352a", "Hasil", `${p.left * 10} + ${p.right} = ${a * b}`)}
  </div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const N = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
function Picker({ label, value, set }: { label: string; value: number; set: (v: number) => void }) {
  return <div role="radiogroup" aria-label={label}>
    <span className="mb-1 block text-sm font-bold text-[#56715c]">{label}</span>
    <div className="grid grid-cols-10 gap-1">
      {N.map(v => <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => set(v)}
        className={`h-9 rounded-lg text-base font-extrabold transition-colors sm:h-10 ${value === v ? "bg-[#208f6d] text-white" : "border border-[#dbe5dc] bg-white text-[#33583e] hover:bg-[#edf6ef]"}`}>{v}</button>)}
    </div>
  </div>;
}
export default function JarimatikaLab({ a, b, setPair }: { a: number; b: number; setPair: (a: number, b: number) => void }) {
  const [step, setStep] = useState(0), [play, setPlay] = useState(false);
  const m = methodFor(a, b), all = lesson(a, b), last = all.length - 1;
  useEffect(() => {
    if (!play) return;
    const t = setInterval(() => setStep(s => { if (s >= last) { setPlay(false); return s; } return s + 1; }), 2400);
    return () => clearInterval(t);
  }, [play, last]);
  const go = (s: number) => { setPlay(false); setStep(Math.max(0, Math.min(last, s))); };
  const nine = a === 9 ? b : a, done = step >= last;
  return <section id="peraga" aria-label="Peraga jarimatika" className="jm scroll-mt-4 rounded-[22px] border border-[#e0e9df] bg-white p-3 shadow-[0_12px_40px_#264e3010] sm:p-6">
    <style>{"@media (prefers-reduced-motion: reduce){.jm *{transition:none!important}}"}</style>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#17352a]"><Hand className="size-6 text-[#208f6d]" strokeWidth={1.75} aria-hidden="true" />Peraga jarimatika</h2>
      <span className="rounded-full bg-[#f1f6ef] px-3 py-1 text-sm font-bold text-[#33583e]">{methodName[m]}</span>
    </div>
    <div className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-4">
      <Picker label="Bilangan pertama" value={a} set={v => setPair(v, b)} />
      <Picker label="Bilangan kedua" value={b} set={v => setPair(a, v)} />
    </div>
    <p className="mt-3 text-center text-4xl font-extrabold tabular-nums text-[#17352a]">{a} × {b} = <span className="inline-block min-w-14 rounded-xl px-2 transition-colors duration-500" style={{ background: done ? "#e3f4e8" : "#fff8dc", color: done ? GREEN : "#b8962e" }}>{done ? a * b : "?"}</span></p>
    <div className="mt-2 rounded-2xl bg-[#fbf8f2] px-1 py-2 sm:px-4">
      {m === "tempel" ? <TempelView a={a} b={b} step={step} setA={v => setPair(v, b)} setB={v => setPair(a, v)} />
        : m === "lipat9" ? <LipatView n={nine} step={step} setN={v => setPair(9, v)} />
          : <LoncatView a={a} b={b} step={step} />}
    </div>
    <div className="mt-3"><Board a={a} b={b} step={step} /></div>
    <output data-testid="lab-result" data-value={`${a}x${b}:${step}`} aria-live="polite" className="mt-3 block rounded-2xl bg-[#edf7ee] px-4 py-3 text-[#17352a]">
      <span className="flex items-center gap-2"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#208f6d] text-base font-extrabold text-white">{step + 1}</span><strong className="text-lg leading-tight sm:text-xl">{all[step].title}</strong></span>
      <span className="mt-1.5 block text-base leading-7 sm:text-lg sm:leading-8">{all[step].text}</span>
    </output>
    <div className="mt-3 flex items-center justify-center gap-1.5" aria-label="Pilih langkah">
      {all.map((l, i) => <button key={i} type="button" onClick={() => go(i)} aria-label={`Langkah ${i + 1}: ${l.title}`} aria-current={i === step ? "step" : undefined}
        className={`h-2.5 rounded-full transition-all ${i === step ? "w-8 bg-[#208f6d]" : i < step ? "w-2.5 bg-[#8cc9a9]" : "w-2.5 bg-[#dbe5dc]"}`} />)}
    </div>
    <div className="mt-3 grid grid-cols-[auto_1fr] gap-2 sm:flex sm:items-center">
      <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="btn btn-md gap-1"><ChevronLeft className="size-5" aria-hidden="true" />Kembali</button>
      <button type="button" onClick={() => go(step + 1)} disabled={done} className="btn btn-md btn-primary gap-1 text-base sm:min-w-44">Lanjut<ChevronRight className="size-5" aria-hidden="true" /></button>
      <button type="button" onClick={() => { if (done) setStep(0); setPlay(!play); }} className="btn btn-md btn-outline gap-1 sm:ms-auto" aria-pressed={play}>{play ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}{play ? "Jeda" : "Putar otomatis"}</button>
      <button type="button" onClick={() => go(0)} className="btn btn-md btn-ghost gap-1"><RotateCcw className="size-5" aria-hidden="true" />Ulangi</button>
    </div>
    <p className="mt-2 text-sm text-[#617367]">{m === "tempel" ? "Ketuk jari di gambar untuk mengganti bilangan 6 sampai 10." : m === "lipat9" ? "Ketuk jari mana saja untuk mengganti bilangan yang dikali 9." : "Pilih bilangan di atas, lalu tekan Lanjut untuk mengangkat jari satu per satu."}</p>
  </section>;
}
