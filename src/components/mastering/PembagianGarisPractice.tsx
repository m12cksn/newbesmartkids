"use client";

import { ArrowRight, Link2, Minus, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";

/**
 * Peraga kerja untuk satu soal latihan harian. Murid sendiri yang mencoret garis, mengikat per pembagi,
 * memindahkan sisa ke kolom kanan dan menulis angka hasil per kolom. Peraga tidak pernah menghitung jawaban.
 */
const INK = "#24407a", CARRY = "#d9822b", TIE = "#d6453b", GRID = "#e8a29b", MAX = 40;
const PLACES = ["ribuan", "ratusan", "puluhan", "satuan"];
type Col = { own: number; carried: number; tied: number; moved: number; note: string };
const fresh = (len: number): Col[] => Array.from({ length: len }, () => ({ own: 0, carried: 0, tied: 0, moved: 0, note: "" }));

function Strokes({ col, q }: { col: Col; q: number }) {
  const total = col.carried + col.own;
  if (!total) return <p className="py-4 text-center text-xs font-bold text-[#9aa59e]">Belum ada garis</p>;
  const ids = Array.from({ length: total }, (_, i) => i), groups: number[][] = [];
  for (let g = 0; g < col.tied; g++) groups.push(ids.slice(g * q, g * q + q));
  const loose = ids.slice(col.tied * q);
  const stroke = (i: number) => <span key={i} aria-hidden="true" className="block h-7 w-[3px] rounded-full" style={{ background: i < col.carried ? CARRY : INK, transform: `rotate(${(i * 37) % 7 - 3}deg)` }} />;
  return <div className="flex flex-wrap content-start justify-center gap-x-3 gap-y-2 py-2">
    {groups.map((g, k) => <span key={k} className="relative inline-flex items-end gap-[5px] px-1" data-ikat="ya">{g.map(stroke)}
      <span aria-hidden="true" className="absolute left-[-3px] right-[-3px] top-1/2 h-[3px] rounded-full" style={{ background: TIE, transform: "rotate(-24deg)" }} /></span>)}
    {loose.length > 0 && <span className="inline-flex items-end gap-[5px] px-1" data-ikat="belum">{loose.map(stroke)}</span>}
  </div>;
}

export default function PembagianGarisPractice({ n, q, guess }: { n: number; q: number; guess: "none" | "dividend" | "divisor" }) {
  const [text, setText] = useState(guess === "dividend" ? "" : String(n));
  const [dq, setDq] = useState(guess === "divisor" ? 0 : q);
  const value = Number(text), digits = /^\d{2,3}$/.test(text) ? text.split("").map(Number) : [];
  const ready = digits.length > 0 && dq >= 2;
  const key = `${text}:${dq}`;
  const [state, setState] = useState({ key, cols: fresh(digits.length) });
  const cols = state.key === key ? state.cols : fresh(digits.length);
  const update = (i: number, f: (c: Col, all: Col[]) => void) => setState(() => { const all = cols.map(c => ({ ...c })); f(all[i], all); return { key, cols: all }; });
  const places = PLACES.slice(PLACES.length - digits.length);
  const loose = (c: Col) => c.carried + c.own - c.tied * dq;
  const btn = "inline-flex h-9 w-full items-center justify-center gap-1 rounded-lg border border-[#dbe5dc] bg-white px-2 text-sm font-bold text-[#33583e] hover:bg-[#edf6ef] disabled:cursor-not-allowed disabled:opacity-40";

  return <div className="rounded-2xl border border-[#e0e9df] bg-[#fbfcf9] p-3 text-[#17352a] sm:p-4" data-testid="peraga-latihan">
    <p className="text-sm leading-6 sm:text-base">Kerjakan sendiri: <strong>coret garis</strong> sebanyak angkanya, <strong>ikat</strong> setiap {dq >= 2 ? dq : "pembagi"} garis, <strong>pindahkan sisa</strong> ke kanan (1 garis jadi 10), lalu tulis banyak ikatan di bawah.</p>
    {guess !== "none" && <div className="mt-2 flex flex-wrap items-end gap-3 rounded-xl bg-[#fff8e6] p-2">
      {guess === "dividend" ? <label className="text-sm font-bold">Coba bilangan yang dibagi
        <input type="text" inputMode="numeric" maxLength={3} value={text} onChange={e => { if (/^\d{0,3}$/.test(e.target.value)) setText(e.target.value); }} className="input input-bordered input-sm mt-1 block w-28 text-lg font-extrabold" />
      </label> : <div role="radiogroup" aria-label="Coba pembagi" className="text-sm font-bold">Coba pembagi
        <div className="mt-1 flex flex-wrap gap-1">{[2, 3, 4, 5, 6, 7, 8, 9].map(d => <button key={d} type="button" role="radio" aria-checked={dq === d} onClick={() => setDq(d)} className={`h-9 w-9 rounded-lg font-extrabold ${dq === d ? "bg-[#208f6d] text-white" : "border border-[#dbe5dc] bg-white"}`}>{d}</button>)}</div>
      </div>}
      <span className="text-xs text-[#6b5a2a]">Coba-coba sampai hasilnya cocok dengan soal.</span>
    </div>}
    {!ready ? <p className="mt-3 rounded-lg bg-white p-3 text-sm text-[#617367]">{guess === "dividend" ? "Tulis bilangan 2 atau 3 angka untuk dicoba." : "Pilih pembagi untuk dicoba."}</p> : <>
      <p className="mt-2 text-center text-2xl font-extrabold tabular-nums">{value} : {dq}</p>
      <div className="mt-2 overflow-hidden rounded-xl border-2 bg-white" style={{ borderColor: GRID, backgroundImage: "linear-gradient(#e6eef8 1px, transparent 1px), linear-gradient(90deg, #e6eef8 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${digits.length}, minmax(0, 1fr))` }}>
          {digits.map((d, i) => {
            const c = cols[i], last = i === digits.length - 1, rest = loose(c);
            return <div key={i} className="flex min-w-0 flex-col border-r-2 last:border-r-0" style={{ borderColor: GRID }} data-testid={`latihan-kolom-${i}`} role="group" aria-label={`Kolom ${places[i]}`}>
              <div className="border-b-2 py-1 text-center" style={{ borderColor: GRID }}><span className="text-2xl font-extrabold">{d}</span><span className="block text-[11px] font-bold text-[#6b7a70]">{places[i]}</span></div>
              <div className="min-h-24 flex-1 px-1"><Strokes col={c} q={dq} />{c.moved > 0 && <p className="mb-1 text-center text-[11px] font-bold text-[#a3561a]">{c.moved} garis dipindah ke kanan</p>}</div>
              <div className="grid gap-1 border-t px-1 py-1.5" style={{ borderColor: "#f1d3cf" }}>
                <div className="grid grid-cols-2 gap-1"><button type="button" className={btn} aria-label={`Tambah garis kolom ${places[i]}`} disabled={c.carried + c.own >= MAX} onClick={() => update(i, x => { x.own++; })}><Plus className="size-4" aria-hidden="true" /></button>
                <button type="button" className={btn} aria-label={`Hapus garis kolom ${places[i]}`} disabled={c.own === 0 || rest === 0} onClick={() => update(i, x => { x.own--; })}><Minus className="size-4" aria-hidden="true" /></button></div>
                <button type="button" className={btn} aria-label={`Ikat ${dq} garis kolom ${places[i]}`} disabled={rest < dq} onClick={() => update(i, x => { x.tied++; })}><Link2 className="size-4" aria-hidden="true" />Ikat</button>
                {!last && <button type="button" className={btn} aria-label={`Pindahkan sisa kolom ${places[i]} ke kanan`} disabled={rest === 0} onClick={() => update(i, (x, all) => { const mine = Math.min(x.own, rest); x.moved += rest; x.own -= mine; x.carried -= rest - mine; all[i + 1].carried += rest * 10; })}>Sisa<ArrowRight className="size-4" aria-hidden="true" /></button>}
              </div>
              <div className="flex items-center justify-center border-t-2 py-1.5" style={{ borderColor: GRID }}>
                <input type="text" inputMode="numeric" maxLength={1} value={c.note} aria-label={`Banyak ikatan kolom ${places[i]}`} onChange={e => { if (/^\d?$/.test(e.target.value)) { const v = e.target.value; update(i, x => { x.note = v; }); } }}
                  className="h-11 w-12 rounded-lg border-2 border-[#c5a64a] bg-[#fffdf2] text-center text-2xl font-extrabold text-[#208f6d]" />
              </div>
            </div>;
          })}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#617367] sm:text-sm">
        <span>Garis oranye datang dari sisa kolom kiri. Baca angka di bawah dari kiri, lalu tulis di kotak jawaban.</span>
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setState({ key, cols: fresh(digits.length) })}><RotateCcw className="size-4" aria-hidden="true" />Ulangi peraga</button>
      </div>
    </>}
  </div>;
}
