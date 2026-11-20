"use client";

import { Minus, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { decimalText, fracText, parseDecimal, parseFraction, simplify, type Frac } from "@/data/grade-six-fractions-decimals";
import { Fr, HundredGrid, MathText, PlaceChart, placeNames } from "./GradeSixVisuals";

/* ====================================================================== */
/* Komponen kecil bersama                                                  */
/* ====================================================================== */
export const chip = (active: boolean) => `btn btn-sm h-auto min-h-9 ${active ? "btn-info" : "btn-outline"}`;
const same = (a: Frac, b: Frac) => a[0] === b[0] && a[1] === b[1];
function Chips({ label, items, value, onChange }: { label: string; items: Frac[]; value: Frac; onChange: (v: Frac) => void }) {
  return <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
    <span className="me-1 text-sm font-bold">{label}</span>
    {items.map(item => <button key={item.join("/")} type="button" className={chip(same(item, value))} aria-pressed={same(item, value)} onClick={() => onChange(item)}><Fr n={item[0]} d={item[1]} /></button>)}
  </div>;
}
const FracNode = ({ f, mixed = false }: { f: Frac; mixed?: boolean }) => <MathText text={fracText(f, mixed)} />;
function Result({ value, children, tone = "info" }: { value: string; children: ReactNode; tone?: "success" | "info" | "warning" }) {
  return <output data-testid="lab-result" data-value={value} aria-live="polite"
    className={`block rounded-lg p-3 text-sm leading-7 ${tone === "success" ? "bg-success/10" : tone === "warning" ? "bg-warning/20" : "bg-base-100"}`}>{children}</output>;
}
/** "Coba sendiri": siswa menghitung dulu, peraga membuktikan. */
function TryFraction({ prompt, answer, hint }: { prompt: ReactNode; answer: Frac; hint: ReactNode }) {
  const [v, setV] = useState(["", "", ""]);
  const [state, setState] = useState<"idle" | "ok" | "retry">("idle");
  const set = (i: number, x: string) => { setV(old => old.map((o, j) => j === i ? x.replace(/\D/g, "").slice(0, 4) : o)); setState("idle"); };
  const box = (i: number, label: string, cls = "w-14") => <input aria-label={label} inputMode="numeric" value={v[i]} onChange={e => set(i, e.target.value)}
    className={`input input-bordered input-sm h-9 ${cls} text-center font-bold tabular-nums`} />;
  const check = () => { const f = parseFraction(v.join("|")); setState(f && f[0] * answer[1] === answer[0] * f[1] ? "ok" : "retry"); };
  return <div className="space-y-2 rounded-lg border border-dashed border-success/50 bg-base-100 p-3">
    <p className="text-sm font-bold text-success">Coba sendiri</p>
    <p className="text-sm font-semibold">{prompt}</p>
    <div className="flex flex-wrap items-center gap-2">
      {box(0, "Coba bilangan bulat", "w-12")}
      <span className="flex flex-col items-center gap-0.5">{box(1, "Coba pembilang")}<span className="h-0 w-14 border-t-2 border-base-content" />{box(2, "Coba penyebut")}</span>
      <button type="button" className="btn btn-success btn-sm" disabled={!v[1] || !v[2]} onClick={check}>Periksa</button>
    </div>
    {state !== "idle" && <p role="status" className="text-sm"><strong>{state === "ok" ? "Tepat! " : "Belum tepat. "}</strong>{state === "ok" ? <>Hasilnya <FracNode f={answer} />{answer[0] > answer[1] && answer[0] % answer[1] ? <> = <FracNode f={answer} mixed /></> : null}.</> : hint}</p>}
  </div>;
}

/* Batang pecahan umum: setiap potongan bisa diberi warna dan nomor. */
function Strip({ parts, color, label, numbers }: { parts: number; color: (i: number) => string | undefined; label?: ReactNode; numbers?: (i: number) => number | undefined }) {
  return <div className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2">
    <span className="text-right text-xs font-bold text-base-content/70">{label}</span>
    <div className="grid h-9 gap-px overflow-hidden rounded border border-slate-600 bg-slate-600" style={{ gridTemplateColumns: `repeat(${parts}, minmax(0,1fr))` }}>
      {Array.from({ length: parts }, (_, i) => <span key={i} className="grid place-items-center text-[11px] font-bold text-white transition-colors duration-300" style={{ background: color(i) ?? "#fff" }}>{numbers?.(i) ?? ""}</span>)}
    </div>
  </div>;
}

/* ====================================================================== */
/* Peraga perkalian dan pembagian: atur angka, gambar dan caranya langsung  */
/* terlihat. Tidak ada langkah tersembunyi.                                 */
/* ====================================================================== */
function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return <span role="group" aria-label={label} className="flex items-center gap-2">
    <span className="text-sm font-bold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-circle btn-sm btn-outline" disabled={value <= min} onClick={() => onChange(value - 1)}><Minus className="size-4" aria-hidden="true" /></button>
    <span className="min-w-6 text-center text-xl font-extrabold tabular-nums">{value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-circle btn-sm btn-outline" disabled={value >= max} onClick={() => onChange(value + 1)}><Plus className="size-4" aria-hidden="true" /></button>
  </span>;
}
/** Hasil akhir: pecahan biasa, lalu bilangan bulat atau pecahan campuran bila ada. */
function Answer({ f }: { f: Frac }) {
  const d = f[1], s = simplify(f);
  return <>
    {s[1] !== d && s[1] !== 1 && <> = <Fr n={s[0]} d={s[1]} /></>}
    {s[1] === 1 ? <> = {s[0]}</> : s[0] > s[1] && <> = <FracNode f={s} mixed /></>}
  </>;
}
/** Baris cara: ditulis besar, pecahan bertumpuk. */
const Way = ({ children }: { children: ReactNode }) => <p data-testid="lab-way" className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-base-100 p-3 text-2xl font-extrabold leading-none sm:text-3xl">{children}</p>;
const shadeA = "#059669", shadeB = "#38bdf8", red = "#e11d48";

/* ---------- A.1  n × a/b ---------- */
const multFracs: Frac[] = [[1, 2], [2, 3], [3, 4], [2, 5], [3, 5]];
function MultiplyLab() {
  const [f, setF] = useState<Frac>([3, 4]), [n, setN] = useState(3);
  const [a, b] = f, total = n * a;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2"><Chips label="Pecahan" items={multFracs} value={f} onChange={setF} /><Stepper label="Dikali" value={n} min={1} max={5} onChange={setN} /></div>
    <div className="space-y-1.5 rounded-xl bg-base-100 p-3">
      {Array.from({ length: n }, (_, r) => <Strip key={r} parts={b} label={<Fr n={a} d={b} />} color={i => (i < a ? shadeA : undefined)} numbers={i => (i < a ? r * a + i + 1 : undefined)} />)}
    </div>
    <Way>{n} × <Fr n={a} d={b} /> = <Fr n={`${n} × ${a}`} d={b} /> = <Fr n={total} d={b} /><Answer f={[total, b]} /></Way>
    <Result value={fracText([total, b])} tone="success">Kalikan pembilangnya: {n} × {a} = <strong>{total} potongan</strong> berwarna. Penyebutnya tetap {b}.</Result>
    <TryFraction key={`${a}-${b}-${n}`} prompt={<>Berapa {n} × <Fr n={a} d={b} />?</>} answer={[total, b]}
      hint={<>Kalikan pembilangnya: {n} × {a} = ?, penyebutnya tetap {b}.</>} />
  </div>;
}

/* ---------- A.2  a/b × n ---------- */
const partFracs: Frac[] = [[2, 3], [3, 4], [1, 2], [2, 5], [5, 6]];
function PartOfLab() {
  const [f, setF] = useState<Frac>([2, 3]), [per, setPer] = useState(4);
  const [a, b] = f, total = b * per, count = a * per;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2"><Chips label="Pecahan" items={partFracs} value={f} onChange={setF} /><Stepper label="Benda per kelompok" value={per} min={1} max={5} onChange={setPer} /></div>
    <div className="space-y-1 rounded-xl bg-base-100 p-3" role="img" aria-label={`${total} benda dalam ${b} kelompok, ${a} kelompok diambil`}>
      {Array.from({ length: b }, (_, g) => { const on = g < a;
        return <div key={g} className={`flex items-center gap-1.5 rounded-lg border-2 p-1 ${on ? "border-rose-500 bg-rose-50" : "border-dashed border-base-300"}`}>
          <span className="w-14 text-xs font-bold">Kel. {g + 1}</span>
          {Array.from({ length: per }, (_, i) => <span key={i} className={`size-5 rounded-full border-2 ${on ? "border-rose-700 bg-rose-400" : "border-sky-700 bg-sky-200"}`} />)}
        </div>; })}
    </div>
    <Way><Fr n={a} d={b} /> × {total} = <Fr n={`${a} × ${total}`} d={b} /> = <Fr n={a * total} d={b} /> = {count}</Way>
    <Result value={String(count)} tone="success">{total} benda dibagi menjadi {b} kelompok (penyebut). Ambil {a} kelompok (pembilang): <strong>{count} benda</strong>.</Result>
  </div>;
}

/* ---------- B.1  a/b ÷ n ---------- */
const divFracs: Frac[] = [[2, 3], [1, 2], [3, 4], [3, 5], [1, 3]];
function DivideLab() {
  const [f, setF] = useState<Frac>([2, 3]), [n, setN] = useState(4);
  const [a, b] = f, small = b * n;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2"><Chips label="Pecahan" items={divFracs} value={f} onChange={setF} /><Stepper label="Dibagi" value={n} min={2} max={5} onChange={setN} /></div>
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <figure className="w-36 sm:w-44">
        <div className="grid aspect-square gap-px overflow-hidden rounded border-2 border-slate-700 bg-slate-500" role="img" aria-label={`Satu utuh: ${b} kolom, ${a} diarsir, dipotong ${n} baris, satu baris merah`}
          style={{ gridTemplateColumns: `repeat(${b}, minmax(0,1fr))`, gridTemplateRows: `repeat(${n}, minmax(0,1fr))` }}>
          {Array.from({ length: n * b }, (_, k) => { const r = Math.floor(k / b), c = k % b;
            return <span key={k} style={{ background: c < a ? (r === 0 ? red : "#bae6fd") : "#fff" }} />; })}
        </div>
        <figcaption className="mt-1 text-center text-xs font-bold">1 utuh = {small} potongan kecil</figcaption>
      </figure>
      <p className="max-w-[14rem] text-sm"><Fr n={a} d={b} /> (biru) dibagi {n}. Satu bagian adalah yang <strong className="text-rose-600">merah</strong>: {a} potongan dari {small}.</p>
    </div>
    <Way><Fr n={a} d={b} /> ÷ {n} = <Fr n={a} d={`${b} × ${n}`} /> = <Fr n={a} d={small} /><Answer f={[a, small]} /></Way>
    <Result value={fracText([a, small])} tone="success">Pembilangnya tetap {a}. Penyebutnya dikali {n}: {b} × {n} = {small}. Hasilnya lebih kecil dari <Fr n={a} d={b} />.</Result>
    <TryFraction key={`${a}-${b}-${n}`} prompt={<>Berapa <Fr n={a} d={b} /> ÷ {n}?</>} answer={[a, small]}
      hint={<>Pembilang tetap {a}. Penyebutnya {b} × {n}.</>} />
  </div>;
}

/* ---------- B.2  n ÷ a/b ---------- */
const jumpFracs: Frac[] = [[1, 2], [1, 4], [2, 5], [2, 3], [3, 4]];
function MeasureLab() {
  const [n, setN] = useState(3), [f, setF] = useState<Frac>([2, 5]);
  const [a, b] = f, units = n * b, full = Math.floor(units / a), left = units - full * a;
  const W = 300, x = (u: number) => 10 + (W - 20) * u / units, arc = (s: number, e: number) => Math.min(30, (e - s) * 0.9);
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2"><Stepper label="Bilangan" value={n} min={1} max={4} onChange={setN} /><Chips label="Dibagi" items={jumpFracs} value={f} onChange={setF} /></div>
    <div className="rounded-xl bg-base-100 p-3">
      <svg viewBox={`0 0 ${W} 74`} className="w-full" role="img" aria-label={`Garis bilangan 0 sampai ${n}, ${full} lompatan ${a}/${b}`}>
        {Array.from({ length: full }, (_, j) => { const s = x(j * a), e = x((j + 1) * a);
          return <path key={j} d={`M${s} 46 Q${(s + e) / 2} ${46 - arc(s, e)} ${e} 46`} fill="none" stroke={j % 2 ? shadeB : shadeA} strokeWidth="2.5" />; })}
        {left > 0 && <rect x={x(full * a)} y="42" width={x(units) - x(full * a)} height="8" fill="#fde68a" />}
        <path d={`M10 46H${W - 10}`} stroke="#334155" strokeWidth="2" />
        {Array.from({ length: units + 1 }, (_, u) => <g key={u}><path d={`M${x(u)} ${u % b ? 42 : 38}V${u % b ? 50 : 54}`} stroke="#334155" strokeWidth={u % b ? 1 : 2} />
          {u % b === 0 && <text x={x(u)} y="68" fontSize="11" textAnchor="middle" fontWeight="700">{u / b}</text>}</g>)}
      </svg>
      <p className="text-sm">Lompatan <Fr n={a} d={b} /> muat <strong>{full} kali</strong>{left > 0 && <> dan sisa <Fr n={left} d={a} /> lompatan (kuning)</>}.</p>
    </div>
    <Way>{n} ÷ <Fr n={a} d={b} /> = {n} × <Fr n={b} d={a} /> = <Fr n={`${n} × ${b}`} d={a} /> = <Fr n={units} d={a} /><Answer f={[units, a]} /></Way>
    <Result value={fracText([units, a])} tone="success">Balik pecahannya: <Fr n={a} d={b} /> menjadi <Fr n={b} d={a} />, lalu ubah ÷ menjadi ×.</Result>
    <TryFraction key={`${n}-${a}-${b}`} prompt={<>Berapa {n} ÷ <Fr n={a} d={b} />?</>} answer={[units, a]}
      hint={<>Balik pecahannya menjadi <Fr n={b} d={a} />, lalu kalikan dengan {n}.</>} />
  </div>;
}

/* ====================================================================== */
/* C.1  Pecahan → desimal: cari pengali sampai penyebut 10 atau 100        */
/* ====================================================================== */
const decFracs: Frac[] = [[1, 2], [2, 5], [3, 4], [7, 20], [9, 25], [3, 50]];
const multipliers = [2, 4, 5, 10, 20, 25, 50];
function DecimalLab() {
  const [f, setF] = useState<Frac>([7, 20]);
  const [k, setK] = useState(1);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const [a, b] = f, den = b * k, num = a * k, ok = den === 10 || den === 100, value = a / b;
  return <div className="space-y-4">
    <Chips label="Pecahan" items={decFracs} value={f} onChange={v => { setF(v); setK(1); setTyped(""); setChecked(null); }} />
    <div role="group" aria-label="Pengali" className="flex flex-wrap items-center gap-1.5">
      <span className="me-1 text-sm font-bold">Kalikan dengan</span>
      {multipliers.map(m => <button key={m} type="button" className={chip(k === m)} aria-pressed={k === m} onClick={() => setK(m)}>× {m}</button>)}
    </div>
    <p className="text-2xl font-extrabold"><Fr n={a} d={b} />{k > 1 && <> = <Fr n={`${a} × ${k}`} d={`${b} × ${k}`} /> = <Fr n={num} d={den} /></>}{ok && <> = {decimalText(value, den === 10 ? 1 : 2)}</>}</p>
    <div className="grid gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-2">
      <div className="space-y-2">
        <Strip parts={b} label={<FracNode f={f} />} color={i => i < a ? "#f97316" : undefined} />
        {k > 1 && den <= 50 && <Strip parts={den} label={<FracNode f={[num, den]} />} color={i => i < num ? "#fb923c" : undefined} />}
        {den > 100 && <p className="text-sm text-warning-content">Penyebut {den} lebih dari 100. Pilih pengali yang lebih kecil.</p>}
        <div aria-hidden="true">
          <div className="relative mt-4 h-5 border-b-2 border-slate-600">
            {Array.from({ length: 11 }, (_, i) => <span key={i} className="absolute bottom-0 h-2 w-px bg-slate-600" style={{ left: `${i * 10}%` }} />)}
            <span className="absolute -bottom-1.5 size-3 -translate-x-1/2 rounded-full bg-orange-500" style={{ left: `${value * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold"><span>0</span><span>0,5</span><span>1</span></div>
        </div>
      </div>
      {den === 100 ? <HundredGrid shaded={num} className="w-36" /> : den === 10
        ? <div className="mx-auto grid h-36 w-36 grid-cols-10 gap-px border border-slate-500 bg-slate-400">{Array.from({ length: 10 }, (_, i) => <span key={i} className={i < num ? "bg-orange-400" : "bg-white"} />)}</div>
        : <p className="self-center text-sm text-base-content/70">Model 10 atau 100 bagian muncul saat penyebutnya 10 atau 100.</p>}
    </div>
    <Result value={ok ? decimalText(value, den === 10 ? 1 : 2) : ""} tone={ok ? "success" : "info"}>
      {k === 1 ? <>Penyebut {b} belum 10 atau 100. Pengali berapa yang mengubah {b} menjadi 10 atau 100?</>
        : ok ? <>Penyebut sudah {den}. {num} {den === 10 ? "persepuluhan" : "perseratusan"} ditulis <strong>{decimalText(value, den === 10 ? 1 : 2)}</strong>{den === 100 && <>: {Math.floor(num / 10)} di tempat persepuluhan dan {num % 10} di tempat perseratusan</>}. Arsirannya tetap sama panjang, hanya potongannya lebih kecil.</>
        : <>{b} × {k} = {den}, belum 10 atau 100. Coba pengali lain.</>}
    </Result>
    <div className="space-y-2 rounded-lg border border-dashed border-success/50 bg-base-100 p-3">
      <p className="text-sm font-bold text-success">Coba sendiri</p>
      <label className="flex flex-wrap items-center gap-2 text-sm font-semibold">Tulis <Fr n={a} d={b} /> sebagai desimal:
        <input aria-label="Coba desimal" inputMode="decimal" className="input input-bordered input-sm w-24 tabular-nums" value={typed}
          onChange={e => { setTyped(e.target.value.replace(/[^\d,.]/g, "").replace(".", ",")); setChecked(null); }} />
        <button type="button" className="btn btn-success btn-sm" disabled={!typed} onClick={() => setChecked(Math.abs((parseDecimal(typed) ?? -1) - value) < 1e-9)}>Periksa</button>
      </label>
      {checked !== null && <p role="status" className="text-sm"><strong>{checked ? "Tepat!" : "Belum tepat."}</strong> {checked ? <><Fr n={a} d={b} /> = {decimalText(value)}.</> : <>Cari dulu pecahan senilai berpenyebut 10 atau 100.</>}</p>}
    </div>
  </div>;
}

/* ====================================================================== */
/* C.2  Membandingkan desimal: nilai tempat dan garis bilangan             */
/* ====================================================================== */
const show = (d: number[], pad: boolean) => {
  const whole = `${d[0] || ""}${d[1]}`, dec = pad ? `${d[2]}${d[3]}` : `${d[2]}${d[3]}`.replace(/0+$/, "");
  return dec ? `${whole},${dec}` : whole;
};
const valueOf = (d: number[]) => d[0] * 10 + d[1] + d[2] / 10 + d[3] / 100;
function CompareLab() {
  const [x, setX] = useState([0, 3, 4, 8]);
  const [y, setY] = useState([0, 3, 7, 0]);
  const [pad, setPad] = useState(false);
  const first = x.findIndex((d, i) => d !== y[i]);
  const sign = first < 0 ? "=" : x[first] > y[first] ? ">" : "<";
  const vx = valueOf(x), vy = valueOf(y), lo = Math.floor(Math.min(vx, vy)), hi = Math.max(lo + 1, Math.ceil(Math.max(vx, vy) + 1e-9));
  const fine = hi - lo <= 2, pos = (v: number) => `${(v - lo) / (hi - lo) * 100}%`;
  const editor = (name: string, d: number[], set: (v: number[]) => void) => <fieldset className="min-w-0 rounded-lg border border-base-300 p-2">
    <legend className="px-1 text-sm font-bold">Bilangan {name}: {show(d, pad)}</legend>
    <div className="grid grid-cols-4 gap-1">{placeNames.map((p, i) => <label key={p} className="min-w-0 text-center text-[10px] font-semibold">
      <span className="block min-h-6 break-words leading-tight hyphens-manual">{["Puluhan", "Satuan", "Per­sepuluhan", "Per­seratusan"][i]}</span>
      <select aria-label={`Bilangan ${name} ${p.toLowerCase()}`} className="select select-sm w-full min-w-0 px-1 text-center font-bold" value={d[i]}
        onChange={e => set(d.map((v, j) => j === i ? Number(e.target.value) : v))}>
        {Array.from({ length: 10 }, (_, k) => <option key={k} value={k}>{k}</option>)}
      </select>
    </label>)}</div>
  </fieldset>;
  return <div className="space-y-4">
    <div className="grid gap-2 sm:grid-cols-2">{editor("A", x, setX)}{editor("B", y, setY)}</div>
    <button type="button" className={chip(pad)} aria-pressed={pad} onClick={() => setPad(p => !p)}>Samakan angka di belakang koma</button>
    <p className="text-3xl font-extrabold tabular-nums">{show(x, pad)} {sign} {show(y, pad)}</p>
    <PlaceChart values={[show(x, true), show(y, true)]} highlight={first < 0 ? undefined : first} />
    <div className="rounded-xl bg-base-100 px-4 pb-2 pt-8" aria-hidden="true">
      <div className="relative h-6 border-b-2 border-slate-600">
        {Array.from({ length: fine ? (hi - lo) * 10 + 1 : hi - lo + 1 }, (_, i) => <span key={i} className={`absolute bottom-0 w-px bg-slate-600 ${fine && i % 10 ? "h-2" : "h-4"}`} style={{ left: `${i / (fine ? (hi - lo) * 10 : hi - lo) * 100}%` }} />)}
        {[[vx, "A", "bg-sky-600", "-top-7"], [vy, "B", "bg-orange-500", "-top-1"]].map(([v, l, c, t]) => <span key={l as string} className={`absolute ${t} grid size-6 -translate-x-1/2 place-items-center rounded-full text-xs font-bold text-white ${c}`} style={{ left: pos(v as number) }}>{l}</span>)}
      </div>
      <div className="relative h-5 text-[11px] font-bold">{Array.from({ length: hi - lo + 1 }, (_, i) => <span key={i} className="absolute -translate-x-1/2" style={{ left: `${i / (hi - lo) * 100}%` }}>{lo + i}</span>)}</div>
    </div>
    <Result value={sign} tone="success">
      {first < 0 ? "Semua nilai tempat sama, jadi kedua bilangan sama besar."
        : <>Mulai dari kiri. Nilai tempat <strong>{placeNames[first].toLowerCase()}</strong> adalah yang pertama berbeda: {x[first]} {sign} {y[first]}. Jadi {show(x, pad)} {sign} {show(y, pad)}. Di garis bilangan, bilangan yang lebih besar berada lebih kanan.{!pad && `${x[2]}${x[3]}`.replace(/0+$/, "").length !== `${y[2]}${y[3]}`.replace(/0+$/, "").length && <> Tekan &quot;Samakan angka di belakang koma&quot; agar panjang angkanya sama.</>}</>}
    </Result>
  </div>;
}

export const labs = [MultiplyLab, PartOfLab, DivideLab, MeasureLab, DecimalLab, CompareLab];

/* ====================================================================== */
/* 100 petak yang bisa diarsir (dipakai soal)                              */
/* ====================================================================== */
export function GridPicker({ value, onChange, disabled = false }: { value: number[]; onChange: (v: number[]) => void; disabled?: boolean }) {
  const [brush, setBrush] = useState<"cell" | "column">("column");
  const toggle = (i: number) => {
    if (brush === "cell") onChange(value.includes(i) ? value.filter(x => x !== i) : [...value, i].sort((x, y) => x - y));
    else {
      const col = Array.from({ length: 10 }, (_, r) => Math.floor(i / 10) * 10 + r);
      const full = col.every(c => value.includes(c));
      onChange(full ? value.filter(x => !col.includes(x)) : [...new Set([...value, ...col])].sort((x, y) => x - y));
    }
  };
  return <div className="space-y-2">
    <div role="group" aria-label="Kuas arsir" className="flex flex-wrap gap-1.5">
      <button type="button" className={chip(brush === "column")} aria-pressed={brush === "column"} onClick={() => setBrush("column")}>Kuas 1 kolom (0,1)</button>
      <button type="button" className={chip(brush === "cell")} aria-pressed={brush === "cell"} onClick={() => setBrush("cell")}>Kuas 1 petak (0,01)</button>
      <button type="button" className="btn btn-sm btn-ghost" disabled={disabled || !value.length} onClick={() => onChange([])}>Hapus</button>
    </div>
    <div className="grid aspect-square w-full max-w-72 grid-flow-col grid-rows-10 gap-px border border-slate-500 bg-slate-400">
      {Array.from({ length: 100 }, (_, i) => <button key={i} type="button" aria-label={`Petak ${i + 1}`} aria-pressed={value.includes(i)} disabled={disabled}
        className={`min-h-0 min-w-0 ${value.includes(i) ? "bg-orange-400" : "bg-white"} focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-700`}
        onClick={() => toggle(i)} />)}
    </div>
    <p aria-live="polite" className="text-sm font-semibold">{value.length} dari 100 petak = <Fr n={value.length} d={100} /> = {decimalText(value.length / 100, 2)}</p>
  </div>;
}
