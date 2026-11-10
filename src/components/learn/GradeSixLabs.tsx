"use client";

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
function Range({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return <label className="block text-sm font-bold">{label}: <output className="tabular-nums">{value}</output>
    <input type="range" aria-label={label} className="range range-info range-sm mt-1 w-full" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
  </label>;
}
const FracNode = ({ f, mixed = false }: { f: Frac; mixed?: boolean }) => <MathText text={fracText(f, mixed)} />;
function Result({ value, children, tone = "info" }: { value: string; children: ReactNode; tone?: "success" | "info" | "warning" }) {
  return <output data-testid="lab-result" data-value={value} aria-live="polite"
    className={`block rounded-lg p-3 text-sm leading-7 ${tone === "success" ? "bg-success/10" : tone === "warning" ? "bg-warning/20" : "bg-base-100"}`}>{children}</output>;
}
/** Penunjuk langkah peraga: siswa maju/mundur sendiri. */
function Steps({ titles, stage, setStage }: { titles: string[]; stage: number; setStage: (s: number) => void }) {
  return <div className="space-y-2">
    <ol className="flex flex-wrap gap-1 text-xs font-bold" aria-label="Langkah peraga">
      {titles.map((t, i) => <li key={t} aria-current={i === stage ? "step" : undefined}
        className={`rounded-full px-2.5 py-1 ${i === stage ? "bg-success text-white" : i < stage ? "bg-success/20" : "bg-base-200 text-base-content/60"}`}>{i + 1}. {t}</li>)}
    </ol>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-outline btn-sm" disabled={stage === 0} onClick={() => setStage(stage - 1)}>Langkah sebelumnya</button>
      <button type="button" className="btn btn-success btn-sm" disabled={stage === titles.length - 1} onClick={() => setStage(stage + 1)}>Langkah berikutnya</button>
    </div>
  </div>;
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
const palette = ["#059669", "#0ea5e9", "#f97316", "#8b5cf6", "#e11d48", "#ca8a04"];

/* ====================================================================== */
/* A.1  n × a/b — kelompok potongan yang sama                             */
/* ====================================================================== */
function MultiplyLab() {
  const [b, setB] = useState(4), [a, setA] = useState(3), [n, setN] = useState(3), [stage, setStage] = useState(0);
  const total = n * a, wholes = Math.ceil(total / b);
  const reset = (f: () => void) => { f(); setStage(0); };
  const rows = stage < 2
    ? Array.from({ length: n }, (_, r) => <Strip key={r} parts={b} label={<>Kel. {r + 1}</>} color={i => i < a ? palette[r % palette.length] : undefined} numbers={i => stage === 1 && i < a ? r * a + i + 1 : undefined} />)
    : Array.from({ length: wholes }, (_, r) => <Strip key={r} parts={b} label={r * b + b <= total ? "1 utuh" : <FracNode f={[total - r * b, b]} />}
        color={i => r * b + i < total ? palette[Math.floor((r * b + i) / a) % palette.length] : undefined} numbers={i => r * b + i < total ? r * b + i + 1 : undefined} />);
  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-3">
      <Range label="Penyebut" value={b} min={2} max={8} onChange={v => reset(() => { setB(v); setA(x => Math.min(x, v - 1)); })} />
      <Range label="Pembilang" value={a} min={1} max={b - 1} onChange={v => reset(() => setA(v))} />
      <Range label="Banyak kelompok" value={n} min={1} max={6} onChange={v => reset(() => setN(v))} />
    </div>
    <p className="text-2xl font-extrabold">{n} × <Fr n={a} d={b} /></p>
    <Steps titles={["Buat kelompok", "Hitung potongan", "Susun ulang"]} stage={stage} setStage={setStage} />
    <div className="space-y-1.5 rounded-xl bg-base-100 p-3">{rows}</div>
    <Result value={fracText([total, b])} tone={stage === 2 ? "success" : "info"}>
      {stage === 0 && <>Ada {n} kelompok yang sama, masing-masing <Fr n={a} d={b} />. Perkalian adalah penjumlahan berulang: <MathText text={Array.from({ length: n }, () => `${a}/${b}`).join(" + ")} />.</>}
      {stage === 1 && <>{n} kelompok × {a} potongan = <strong>{total} potongan</strong>. Setiap potongan berukuran <Fr n={1} d={b} />, jadi hasilnya <Fr n={total} d={b} />. Penyebut tidak dikalikan karena ukuran potongan tidak berubah.</>}
      {stage === 2 && <><strong>{n} × <Fr n={a} d={b} /> = <Fr n={`${n} × ${a}`} d={b} /> = <Fr n={total} d={b} /></strong>{total >= b && total % b !== 0 && <> = <FracNode f={[total, b]} mixed /></>}{total % b === 0 && <> = {total / b}</>}. Potongan yang sama disusun menjadi {Math.floor(total / b)} utuh{total % b ? <> dan <Fr n={total % b} d={b} /></> : ""}.</>}
    </Result>
    <TryFraction key={`${a}-${b}-${n}`} prompt={<>Berapa {n} × <Fr n={a} d={b} />?</>} answer={[total, b]}
      hint={<>Hitung potongannya: {n} × {a} = ?, lalu tulis di atas penyebut {b}.</>} />
  </div>;
}

/* ====================================================================== */
/* A.2  a/b × n — bagian dari kumpulan                                     */
/* ====================================================================== */
const partFracs: Frac[] = [[2, 3], [3, 4], [1, 2], [2, 5], [5, 6]];
function PartOfLab() {
  const [f, setF] = useState<Frac>([2, 3]);
  const [per, setPer] = useState(4);
  const [grouped, setGrouped] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [a, b] = f, total = b * per, count = picked.length * per, done = picked.length === a;
  const reset = () => { setGrouped(false); setPicked([]); };
  return <div className="space-y-4">
    <Chips label="Pecahan" items={partFracs} value={f} onChange={v => { setF(v); reset(); }} />
    <Range label="Benda per kelompok" value={per} min={1} max={5} onChange={v => { setPer(v); reset(); }} />
    <p className="text-2xl font-extrabold"><Fr n={a} d={b} /> × {total}</p>
    {!grouped ? <div className="space-y-3">
      <div className="flex max-w-sm flex-wrap gap-1.5 rounded-xl bg-base-100 p-3" role="img" aria-label={`${total} benda`}>
        {Array.from({ length: total }, (_, i) => <span key={i} className="size-6 rounded-full border-2 border-sky-700 bg-sky-300" />)}
      </div>
      <button type="button" className="btn btn-success btn-sm" onClick={() => setGrouped(true)}>Bagi menjadi {b} kelompok</button>
    </div> : <div className="space-y-1.5 rounded-xl bg-base-100 p-3">
      {Array.from({ length: b }, (_, g) => {
        const on = picked.includes(g);
        return <button key={g} type="button" aria-pressed={on} aria-label={`Kelompok ${g + 1}, ${per} benda`}
          className={`flex w-full items-center gap-1.5 rounded-lg border-2 p-1.5 transition ${on ? "border-rose-500 bg-rose-50" : "border-dashed border-base-300 hover:border-success"}`}
          onClick={() => setPicked(p => on ? p.filter(x => x !== g) : [...p, g])}>
          <span className="w-16 text-left text-xs font-bold">Kel. {g + 1}</span>
          {Array.from({ length: per }, (_, i) => <span key={i} className={`size-6 rounded-full border-2 ${on ? "border-rose-700 bg-rose-400" : "border-sky-700 bg-sky-300"}`} />)}
        </button>;
      })}
    </div>}
    <Result value={String(count)} tone={done ? "success" : picked.length > a ? "warning" : "info"}>
      {!grouped ? <>Penyebut {b} berarti kumpulan {total} benda dibagi menjadi {b} kelompok sama banyak. Tekan tombol untuk membaginya.</>
        : done ? <><strong><Fr n={a} d={b} /> × {total} = <Fr n={`${a} × ${total}`} d={b} /> = {count}</strong>. Satu kelompok berisi {total} : {b} = {per} benda, diambil {a} kelompok. Bandingkan: {total} × <Fr n={a} d={b} /> juga {count}, tetapi artinya {total} kelompok berisi <Fr n={a} d={b} />.</>
        : picked.length > a ? <>Terlalu banyak. Pembilang {a} berarti ambil {a} kelompok saja.</>
        : <>Setiap kelompok berisi {per} benda. Pembilang {a}: ketuk {a} kelompok. Sekarang terpilih {count} benda.</>}
    </Result>
  </div>;
}

/* ====================================================================== */
/* B.1  a/b ÷ n — potong setiap bagian                                     */
/* ====================================================================== */
const divFracs: Frac[] = [[2, 3], [1, 2], [3, 4], [3, 5], [1, 3]];
function DivideLab() {
  const [f, setF] = useState<Frac>([2, 3]);
  const [n, setN] = useState(4);
  const [stage, setStage] = useState(0);
  const [a, b] = f, rows = stage === 0 ? 1 : n, small = b * n, share = simplify([a, small]);
  return <div className="space-y-4">
    <Chips label="Pecahan" items={divFracs} value={f} onChange={v => { setF(v); setStage(0); }} />
    <Range label="Dibagi menjadi" value={n} min={2} max={5} onChange={v => { setN(v); setStage(0); }} />
    <p className="text-2xl font-extrabold"><Fr n={a} d={b} /> ÷ {n}</p>
    <Steps titles={["Arsir pecahan", "Potong", "Ambil satu bagian"]} stage={stage} setStage={setStage} />
    <figure className="max-w-xs">
      <div className="grid aspect-square gap-px overflow-hidden rounded border-2 border-slate-700 bg-slate-500" role="img"
        aria-label={`Satu utuh, ${b} kolom${stage ? ` dan ${n} baris` : ""}`}
        style={{ gridTemplateColumns: `repeat(${b}, minmax(0,1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0,1fr))` }}>
        {Array.from({ length: rows * b }, (_, k) => {
          const r = Math.floor(k / b), c = k % b, shaded = c < a, mine = stage === 2 && r === 0 && shaded;
          return <span key={k} className="transition-colors duration-300" style={{ background: mine ? "#e11d48" : shaded ? (stage === 2 ? "#bae6fd" : "#38bdf8") : "#fff" }} />;
        })}
      </div>
      <figcaption className="mt-1 text-center text-xs font-bold">1 utuh</figcaption>
    </figure>
    <Result value={fracText(share)} tone={stage === 2 ? "success" : "info"}>
      {stage === 0 && <><Fr n={a} d={b} /> berarti {a} kolom dari {b} kolom diarsir. Arsiran ini akan dibagi menjadi {n} bagian sama besar.</>}
      {stage === 1 && <>Setiap kolom dipotong menjadi {n}. Satu utuh sekarang berisi {b} × {n} = <strong>{small} potongan kecil</strong>, masing-masing <Fr n={1} d={small} />.</>}
      {stage === 2 && <>Satu bagian (merah) berisi {a} potongan kecil: <strong><Fr n={a} d={b} /> ÷ {n} = <Fr n={a} d={b} /> × <Fr n={1} d={n} /> = <Fr n={a} d={small} /></strong>{share[1] !== small && <> = <FracNode f={share} /></>}. Hasilnya lebih kecil dari <Fr n={a} d={b} />.</>}
    </Result>
    <TryFraction key={`${a}-${b}-${n}`} prompt={<>Berapa <Fr n={a} d={b} /> ÷ {n}?</>} answer={[a, small]}
      hint={<>Pembilang tetap {a}. Penyebut menjadi {b} × {n}.</>} />
  </div>;
}

/* ====================================================================== */
/* B.2  n ÷ a/b — berapa kali muat (lompatan pada garis bilangan)          */
/* ====================================================================== */
const jumpFracs: Frac[] = [[1, 2], [1, 4], [2, 5], [2, 3], [3, 4]];
function MeasureLab() {
  const [n, setN] = useState(3);
  const [f, setF] = useState<Frac>([2, 5]);
  const [jumps, setJumps] = useState(0);
  const [a, b] = f, units = n * b, used = jumps * a, left = units - used, can = left >= a;
  const W = 300, x = (u: number) => 10 + (W - 20) * u / units;
  return <div className="space-y-4">
    <Range label="Banyak utuh" value={n} min={1} max={4} onChange={v => { setN(v); setJumps(0); }} />
    <Chips label="Ukuran lompatan" items={jumpFracs} value={f} onChange={v => { setF(v); setJumps(0); }} />
    <p className="text-2xl font-extrabold">{n} ÷ <Fr n={a} d={b} /></p>
    <div className="rounded-xl bg-base-100 p-3">
      <svg viewBox={`0 0 ${W} 80`} className="w-full" role="img" aria-label={`Garis bilangan 0 sampai ${n}, ${jumps} lompatan`}>
        {Array.from({ length: jumps }, (_, j) => {
          const s = x(j * a), e = x((j + 1) * a);
          return <g key={j}><path d={`M${s} 50 Q${(s + e) / 2} ${50 - Math.min(36, (e - s) * .9)} ${e} 50`} fill="none" stroke={palette[j % palette.length]} strokeWidth="2.5" />
            <text x={(s + e) / 2} y={Math.max(10, 44 - Math.min(36, (e - s) * .9) / 2)} fontSize="9" textAnchor="middle" fontWeight="700" fill={palette[j % palette.length]}>{j + 1}</text></g>;
        })}
        {left > 0 && jumps > 0 && !can && <rect x={x(used)} y="46" width={x(units) - x(used)} height="8" fill="#fde68a" />}
        <path d={`M10 50H${W - 10}`} stroke="#334155" strokeWidth="2" />
        {Array.from({ length: units + 1 }, (_, u) => <g key={u}><path d={`M${x(u)} ${u % b ? 46 : 42}V${u % b ? 54 : 58}`} stroke="#334155" strokeWidth={u % b ? 1 : 2} />
          {u % b === 0 && <text x={x(u)} y="72" fontSize="11" textAnchor="middle" fontWeight="700">{u / b}</text>}</g>)}
      </svg>
      <p className="text-xs text-base-content/70">Garis kecil = <Fr n={1} d={b} />. Satu lompatan = {a} garis kecil.</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-success btn-sm" disabled={!can} onClick={() => setJumps(j => j + 1)}>Lompat <Fr n={a} d={b} /></button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setJumps(0)}>Ulangi</button>
    </div>
    <Result value={String(jumps)} tone={can ? "info" : "success"}>
      {can ? <>Sudah {jumps} lompatan. Masih tersisa <FracNode f={[left, b]} /> dari {n}. Terus lompat sampai tidak cukup.</>
        : <><strong>{jumps} lompatan penuh</strong>{left > 0 && <> dan sisa <Fr n={left} d={b} />, yaitu <Fr n={left} d={a} /> lompatan</>}. Jadi <strong>{n} ÷ <Fr n={a} d={b} /> = {n} × <Fr n={b} d={a} /> = <FracNode f={[units, a]} /></strong>{units % a !== 0 && units > a && <> = <FracNode f={[units, a]} mixed /></>}. {n} utuh = {units} garis kecil, dibagi {a} garis per lompatan.</>}
    </Result>
    <TryFraction key={`${n}-${a}-${b}`} prompt={<>Berapa {n} ÷ <Fr n={a} d={b} />?</>} answer={[units, a]}
      hint={<>Ubah {n} menjadi potongan <Fr n={1} d={b} />: ada {n} × {b} potongan. Bagi dengan {a}.</>} />
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
