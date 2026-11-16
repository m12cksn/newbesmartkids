"use client";

import { ArrowLeft, Check, ChevronDown, Divide, Minus, Plus, RotateCcw, Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SaveResult } from "@/components/auth/SaveResult";
import { BrandMark } from "@/components/home/BrandMark";
import {
  answerWidth, COL_LEVELS, COL_OPS, columnKey, COUNT, dailyColumn, emptyColumn, isCorrect, partials, readColumn, SIGN, steps, wibDate,
  type Calc, type ColLevel, type ColOp, type ColQuestion, type SavedColumn,
} from "@/lib/daily-column";

const OP_STYLE: Record<ColOp, { bg: string; icon: ReactNode }> = {
  tambah: { bg: "bg-[#2b8a3e]", icon: <Plus className="size-5" strokeWidth={3} aria-hidden="true" /> },
  kurang: { bg: "bg-[#e03131]", icon: <Minus className="size-5" strokeWidth={3} aria-hidden="true" /> },
  kali: { bg: "bg-[#7048e8]", icon: <X className="size-5" strokeWidth={3} aria-hidden="true" /> },
  bagi: { bg: "bg-[#1c7ed6]", icon: <Divide className="size-5" strokeWidth={2.5} aria-hidden="true" /> },
  cerita: { bg: "bg-[#e8590c]", icon: <span className="text-base font-extrabold" aria-hidden="true">?</span> },
};
const GUIDE: Record<ColOp, string[]> = {
  tambah: ["Tulis kedua bilangan rata kanan: satuan di bawah satuan, puluhan di bawah puluhan.", "Mulai dari kolom paling kanan (satuan).", "Jika hasil satu kolom 10 atau lebih, tulis angka satuannya, lalu simpan 1 di kotak simpanan kolom sebelah kiri.", "Jumlahkan kolom berikutnya bersama simpanannya."],
  kurang: ["Tulis bilangan yang lebih besar di atas, rata kanan.", "Mulai dari kolom satuan.", "Jika angka atas lebih kecil dari angka bawah, pinjam 1 dari kolom sebelah kiri. Angka atas bertambah 10, angka kiri berkurang 1.", "Tulis angka di kotak simpanan untuk mengingat angka yang sudah dipinjam."],
  kali: ["Kalikan angka bawah dengan setiap angka atas, mulai dari satuan.", "Jika hasilnya 10 atau lebih, tulis satuannya dan simpan puluhannya di kotak simpanan.", "Tambahkan simpanan setelah mengalikan kolom berikutnya.", "Untuk pengali dua angka: kalikan dengan satuan dulu, lalu dengan puluhan (geser satu kolom, tulis 0 di satuan), lalu jumlahkan."],
  bagi: ["Bagi dari kiri ke kanan.", "Ambil angka pertama. Jika lebih kecil dari pembagi, ambil satu angka lagi.", "Tulis hasil bagi di atas, lalu tulis sisanya kecil di depan angka berikutnya.", "Ulangi sampai angka terakhir. Soal di sini selalu habis dibagi."],
  cerita: ["Baca soal sampai selesai, lalu cari bilangan-bilangannya.", "Tentukan operasinya: digabung atau ditambah berarti +, sisa atau berkurang berarti −, setiap atau masing-masing berarti × atau :.", "Setelah memilih operasi, kolom hitung bersusun muncul.", "Kerjakan bersusun seperti biasa, lalu periksa apakah jawabannya masuk akal."],
};

/** Kotak satu angka. Fokus pindah ke kiri (atau ke kanan untuk pembagian) setelah diisi. */
function Cell({ value, onChange, label, state, small = false, refCb, onBack }: { value: string; onChange: (v: string) => void; label: string; state?: "ok" | "bad"; small?: boolean; refCb?: (el: HTMLInputElement | null) => void; onBack?: () => void }) {
  return <input ref={refCb} aria-label={label} inputMode="numeric" maxLength={1} value={value === "." ? "" : value}
    onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(-1) || ".")}
    onKeyDown={e => { if (e.key === "Backspace" && (value === "." || value === "")) { e.preventDefault(); onBack?.(); } }}
    onFocus={e => e.target.select()}
    className={`${small ? "h-7 w-7 text-sm" : "h-11 w-10 text-xl"} rounded-lg border-2 bg-white text-center font-extrabold tabular-nums outline-none focus:border-[#208f6d] focus:ring-2 focus:ring-[#208f6d]/30
      ${state === "ok" ? "border-[#2b8a3e] bg-[#e6f6ec] text-[#2b8a3e]" : state === "bad" ? "border-[#e03131] bg-[#fff0f0] text-[#e03131]" : small ? "border-dashed border-[#adb5bd] text-[#e8590c]" : "border-[#17352a]"}`} />;
}
const Fixed = ({ d, muted = false }: { d: string; muted?: boolean }) => <span className={`flex h-11 w-10 items-center justify-center text-xl font-extrabold tabular-nums ${muted ? "text-[#adb5bd]" : ""}`}>{d}</span>;
const Gap = ({ small = false }: { small?: boolean }) => <span className={small ? "h-7 w-7" : "h-11 w-10"} />;

/** Kerangka hitung bersusun untuk satu soal. cells: kotak hasil dari kiri ke kanan. */
function Column({ q, cells, setCells, checked, carry, id }: { q: ColQuestion; cells: string; setCells: (c: string) => void; checked: boolean; carry: boolean; id: string }) {
  const W = answerWidth(q), refs = useRef<(HTMLInputElement | null)[]>([]);
  const [helper, setHelper] = useState<Record<string, string>>({});
  const put = (i: number, v: string) => { const arr = cells.padEnd(W, ".").split(""); arr[i] = v; setCells(arr.join("")); if (v !== ".") refs.current[q.calc === "bagi" ? i + 1 : i - 1]?.focus(); };
  const back = (i: number) => refs.current[q.calc === "bagi" ? i - 1 : i + 1]?.focus();
  const want = String(q.answer);
  const result = <>{Array.from({ length: W }, (_, i) => { const v = cells[i] ?? "."; return <Cell key={i} value={v} refCb={el => { refs.current[i] = el; }} label={`Soal ${id}, angka hasil ke-${i + 1} dari kiri`}
    onChange={x => put(i, x)} onBack={() => back(i)} state={checked ? (v === want[i] ? "ok" : "bad") : undefined} />; })}</>;
  const help = (k: string, label: string) => <Cell key={k} small value={helper[k] ?? "."} onChange={v => setHelper({ ...helper, [k]: v })} label={label} />;

  if (q.calc === "bagi") {
    const dv = String(q.a), lead = dv.length - W;
    return <div className="inline-flex flex-col items-end" aria-label={`Pembagian bersusun ${q.a} dibagi ${q.b}`} role="group">
      <div className="flex gap-1">{Array.from({ length: lead }, (_, i) => <Gap key={i} />)}{result}</div>
      <div className="flex items-stretch gap-1">
        <Fixed d={String(q.b)} />
        <div className="flex gap-1 rounded-tl-xl border-l-[3px] border-t-[3px] border-[#17352a] pl-1">
          {dv.split("").map((d, i) => <span key={i} className="relative">{carry && i > 0 && <span className="absolute -left-3.5 bottom-0 z-10 [&_input]:h-6 [&_input]:w-6 [&_input]:text-xs">{help(`r${i}`, `Soal ${id}, sisa sebelum angka ke-${i + 1}`)}</span>}<Fixed d={d} /></span>)}
        </div>
      </div>
    </div>;
  }
  const a = String(q.a), b = String(q.b), parts = partials(q);
  const cols = Math.max(W, a.length, b.length + 1, ...parts.map(p => String(p).length));
  const rowOf = (s: string, pre?: string) => <div className="flex justify-end gap-1">{pre && <Fixed d={pre} />}{Array.from({ length: cols - s.length - (pre ? 1 : 0) }, (_, i) => <Gap key={i} />)}{s.split("").map((d, i) => <Fixed key={i} d={d} />)}</div>;
  return <div className="inline-flex flex-col items-end gap-1" role="group" aria-label={`Hitung bersusun ${q.a} ${SIGN[q.calc]} ${q.b}`}>
    {carry && <div className="flex justify-end gap-1">{Array.from({ length: cols }, (_, i) => <span key={i} className="flex w-10 justify-center">{i < cols - 1 && help(`c${i}`, `Soal ${id}, kotak simpanan kolom ke-${cols - i} dari kanan`)}</span>)}</div>}
    {rowOf(a)}
    <div className="flex justify-end gap-1"><Fixed d={SIGN[q.calc]} />{Array.from({ length: cols - b.length - 1 }, (_, i) => <Gap key={i} />)}{b.split("").map((d, i) => <Fixed key={i} d={d} />)}</div>
    <div className="h-[3px] w-full rounded bg-[#17352a]" />
    {parts.length > 0 && <>
      {parts.map((p, r) => { const s = String(p); return <div key={r} className="flex justify-end gap-1">{r === parts.length - 1 && <Fixed d="+" />}{Array.from({ length: cols - s.length - (r === parts.length - 1 ? 1 : 0) }, (_, i) => <Gap key={i} />)}
        {s.split("").map((d, i) => (i >= s.length - r ? <Fixed key={i} d="0" muted /> : <span key={i} className="flex h-11 w-10 items-center justify-center">{help(`p${r}-${i}`, `Soal ${id}, hasil sebagian baris ${r + 1}, angka ke-${i + 1}`)}</span>))}</div>; })}
      <div className="h-[3px] w-full rounded bg-[#17352a]" />
    </>}
    <div className="flex justify-end gap-1">{Array.from({ length: cols - W }, (_, i) => <Gap key={i} />)}{result}</div>
  </div>;
}

const noop = () => () => {};
const subscribeDay = (cb: () => void) => { const t = setInterval(cb, 30000); window.addEventListener("focus", cb); return () => { clearInterval(t); window.removeEventListener("focus", cb); }; };
function loadSave(op: ColOp, level: ColLevel): { save: SavedColumn; stored: boolean } {
  const day = wibDate();
  try { const s = readColumn(localStorage.getItem(columnKey(op, level))); return { save: s && (s.date === day || s.answers.some(a => /\d/.test(a))) ? s : emptyColumn(day), stored: true }; }
  catch { return { save: emptyColumn(day), stored: false }; }
}

export default function ColumnPractice() {
  const [op, setOp] = useState<ColOp>("tambah"); const [level, setLevel] = useState<ColLevel>(1); const [carry, setCarry] = useState(true);
  // Lembar soal baru dibuat setelah halaman berjalan di browser, karena jawaban tersimpan di perangkat.
  const ready = useSyncExternalStore(noop, () => true, () => false);
  return ready ? <Sheet key={`${op}-${level}`} op={op} level={level} setOp={setOp} setLevel={setLevel} carry={carry} setCarry={setCarry} /> : <Sheet op={op} level={level} setOp={setOp} setLevel={setLevel} carry={carry} setCarry={setCarry} loading />;
}

function Sheet({ op, level, setOp, setLevel, carry, setCarry, loading = false }: { op: ColOp; level: ColLevel; setOp: (o: ColOp) => void; setLevel: (l: ColLevel) => void; carry: boolean; setCarry: (c: boolean) => void; loading?: boolean }) {
  const [init] = useState(() => (loading ? null : loadSave(op, level)));
  const [save, setSave] = useState<SavedColumn | null>(init?.save ?? null); const stored = init?.stored ?? true;
  const today = useSyncExternalStore(subscribeDay, wibDate, () => "");
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => { if (!save) return; try { localStorage.setItem(columnKey(op, level), JSON.stringify(save)); } catch { /* penyimpanan tidak tersedia */ } }, [save, op, level]);
  const questions = save ? dailyColumn(save.date, op, level) : [];
  const done = save ? save.checked.filter(Boolean).length : 0, right = save ? questions.filter((q, i) => save.checked[i] && isCorrect(q, save.answers[i]) && (op !== "cerita" || save.ops[i] === q.calc)).length : 0;
  const dateText = save ? new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jakarta" }).format(new Date(save.date + "T00:00:00+07:00")) : "";
  const upd = (i: number, f: (s: SavedColumn) => Partial<SavedColumn>) => setSave(s => (s ? { ...s, ...f(s) } : s));
  const setAt = <T,>(arr: T[], i: number, v: T) => arr.map((x, k) => (k === i ? v : x));
  const opName = COL_OPS.find(o => o.id === op)!.name, lv = COL_LEVELS.find(l => l.id === level)!;

  return <main data-theme="besmartkids" className="min-h-screen bg-[#f6f3ea] pb-16 text-[#17352a]">
    <header className="border-b-[3px] border-[#17352a] bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="Beranda BeSmartKids" className="shrink-0 [&_img]:w-[140px]"><BrandMark /></Link>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border-[3px] border-[#17352a] bg-white px-3 py-1 font-extrabold shadow-[0_3px_0_#17352a]" aria-label={`${right} bintang hari ini`}><Star className="size-4 fill-[#ffd34f] text-[#e8a400]" aria-hidden="true" />{right}</span>
          <Link href="/" className="btn btn-sm rounded-full border-[3px] border-[#17352a] bg-white shadow-[0_3px_0_#17352a]"><ArrowLeft className="size-4" aria-hidden="true" /><span className="max-sm:hidden">Beranda</span></Link>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Berhitung bersusun</h1>
      <p className="mt-2 text-[0.95rem] leading-6 text-[#4b5f57]">Isi setiap kotak dengan satu angka. Kerjakan dari kanan ke kiri; setelah mengetik, kursor pindah sendiri ke kotak sebelah kiri. Soal baru setiap hari pukul 00.00 WIB.</p>

      <div role="radiogroup" aria-label="Jenis soal" className="mt-5 grid grid-cols-5 gap-2">
        {COL_OPS.map(o => <button key={o.id} type="button" role="radio" aria-checked={o.id === op} onClick={() => setOp(o.id)}
          className={`flex flex-col items-center gap-1 rounded-2xl border-[3px] border-[#17352a] px-1 py-2 text-xs font-extrabold shadow-[0_4px_0_#17352a] transition active:translate-y-0.5 sm:text-sm ${o.id === op ? "bg-[#ffd34f]" : "bg-white"}`}>
          <span className={`flex size-8 items-center justify-center rounded-lg text-white ${OP_STYLE[o.id].bg}`}>{OP_STYLE[o.id].icon}</span><span className="leading-tight">{o.name}</span></button>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="Tingkat" className="grid basis-full grid-cols-3 gap-2 sm:flex-1 sm:basis-auto">
          {COL_LEVELS.map(l => <button key={l.id} type="button" role="radio" aria-checked={l.id === level} onClick={() => setLevel(l.id)}
            className={`rounded-2xl border-[3px] border-[#17352a] px-2 py-1.5 shadow-[0_4px_0_#17352a] ${l.id === level ? "bg-[#ffd34f]" : "bg-white"}`}><span className="block text-sm font-extrabold">{l.name}</span><span className="block text-[11px] text-[#4b5f57]">{l.grade}</span></button>)}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold"><input type="checkbox" className="checkbox checkbox-success" checked={carry} onChange={e => setCarry(e.target.checked)} />Kotak simpanan</label>
      </div>

      <details className="group mt-4 rounded-2xl border-[3px] border-[#17352a] bg-[#ffd34f] shadow-[0_4px_0_#17352a]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-extrabold"><ChevronDown className="size-5 -rotate-90 transition-transform group-open:rotate-0 motion-reduce:transition-none" aria-hidden="true" />Cara menghitung {op === "cerita" ? "soal cerita" : opName.toLowerCase()}</summary>
        <ol className="list-decimal space-y-1 rounded-b-2xl bg-white px-4 py-3 ps-9 text-sm leading-6">{GUIDE[op].map(g => <li key={g}>{g}</li>)}</ol>
      </details>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2"><p className="font-bold">{opName}, {lv.name}</p><p className="text-sm text-[#4b5f57]">{dateText}{save && save.date !== today ? " (paket kemarin)" : ""}</p></div>
      {save && save.date !== today && <div role="status" className="mt-2 rounded-2xl border-2 border-[#e8a400] bg-[#fff6d6] p-3 text-sm">Paket hari baru sudah tersedia. <button type="button" className="link font-bold" onClick={() => setSave(emptyColumn(wibDate()))}>Buka soal hari ini</button></div>}
      {!stored && <p role="status" className="mt-2 text-sm text-[#e03131]">Penyimpanan perangkat tidak tersedia. Jawaban tidak tersimpan setelah halaman ditutup.</p>}

      {save && <ol className="mt-3 space-y-4">{questions.map((q, i) => {
        const chosen = (op === "cerita" ? save.ops[i] : q.calc) as Calc | "", checked = save.checked[i], good = checked && isCorrect(q, save.answers[i]) && chosen === q.calc;
        const tone = ["bg-[#e03131]", "bg-[#1c7ed6]", "bg-[#2b8a3e]", "bg-[#e8590c]", "bg-[#7048e8]"][i % 5];
        return <li key={`${save.date}-${op}-${level}-${i}`} data-testid={`bersusun-${i}`} className={`rounded-3xl border-[3px] border-[#17352a] bg-white p-4 shadow-[0_5px_0_#17352a] ${checked ? (good ? "ring-4 ring-[#2b8a3e]/30" : "ring-4 ring-[#e03131]/25") : ""}`}>
          <p className="flex items-center gap-2 font-bold"><span className={`flex size-7 items-center justify-center rounded-lg text-sm font-extrabold text-white ${tone}`}>{i + 1}</span>{q.story ? "Soal cerita" : `${q.a} ${SIGN[q.calc]} ${q.b}`}</p>
          {q.story && <><p className="mt-2 leading-7">{q.story}</p>
            <div role="radiogroup" aria-label={`Operasi soal ${i + 1}`} className="mt-2 flex flex-wrap items-center gap-2"><span className="text-sm font-bold">Operasinya:</span>
              {(["tambah", "kurang", "kali", "bagi"] as Calc[]).map(c => <button key={c} type="button" role="radio" aria-checked={chosen === c} aria-label={`Operasi ${COL_OPS.find(o => o.id === c)!.name}`} disabled={checked}
                onClick={() => upd(i, s => ({ ops: setAt(s.ops, i, c), answers: setAt(s.answers, i, "") }))}
                className={`flex size-10 items-center justify-center rounded-xl border-[3px] border-[#17352a] text-lg font-extrabold shadow-[0_3px_0_#17352a] ${chosen === c ? "bg-[#ffd34f]" : "bg-white"}`}>{SIGN[c]}</button>)}</div>
            {!chosen && <p className="mt-2 text-sm text-[#4b5f57]">Pilih operasi dulu untuk menampilkan kolom hitung.</p>}</>}
          {chosen && <div className="mt-3 flex justify-center overflow-x-auto py-2">
            <Column id={String(i + 1)} q={chosen === q.calc ? q : { ...q, calc: chosen, answer: chosen === "tambah" ? q.a + q.b : chosen === "kurang" ? Math.abs(q.a - q.b) : chosen === "kali" ? q.a * q.b : Math.floor(q.a / q.b) }}
              cells={save.answers[i]} setCells={c => upd(i, s => ({ answers: setAt(s.answers, i, c) }))} checked={checked} carry={carry} />
          </div>}
          {chosen && <div className="mt-3 flex flex-wrap items-center gap-2">
            {!checked ? <button type="button" className="btn rounded-2xl border-[3px] border-[#17352a] bg-[#208f6d] text-white shadow-[0_4px_0_#17352a] hover:bg-[#18785a]" disabled={!/^\d+$/.test(save.answers[i].replace(/\./g, "")) || save.answers[i].includes(".")}
              onClick={() => upd(i, s => ({ checked: setAt(s.checked, i, true) }))}>Periksa</button>
              : <button type="button" className="btn btn-sm rounded-xl border-2 border-[#17352a] bg-white" onClick={() => { upd(i, s => ({ checked: setAt(s.checked, i, false), answers: setAt(s.answers, i, "") })); setOpen(null); }}><RotateCcw className="size-4" aria-hidden="true" />Coba lagi</button>}
            {checked && <p role="status" className={`flex items-center gap-1 font-bold ${good ? "text-[#2b8a3e]" : "text-[#e03131]"}`}>{good ? <><Check className="size-5" aria-hidden="true" />Tepat! {q.answer}{q.storyUnit ? ` ${q.storyUnit}` : ""}.</> : <><X className="size-5" aria-hidden="true" />{chosen !== q.calc ? "Operasinya belum tepat." : "Ada kotak yang belum tepat."}</>}</p>}
            {checked && !good && <button type="button" className="link text-sm font-bold" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>Lihat pembahasan</button>}
          </div>}
          {checked && !good && open === i && <ol className="mt-2 list-decimal space-y-0.5 rounded-xl bg-[#fff6d6] p-3 ps-8 text-sm leading-6">
            {chosen !== q.calc && <li>Soal ini memakai operasi {COL_OPS.find(o => o.id === q.calc)!.name.toLowerCase()}: {q.a} {SIGN[q.calc]} {q.b}.</li>}
            {steps(q).map(s => <li key={s}>{s}</li>)}<li>Jawaban: {q.answer}{q.storyUnit ? ` ${q.storyUnit}` : ""}.</li></ol>}
        </li>; })}</ol>}

      {save && <div className="mt-6 rounded-3xl border-[3px] border-[#17352a] bg-white p-4 shadow-[0_5px_0_#17352a]" role="status">
        <p className="font-extrabold">Benar {right} dari {COUNT} · {done} soal sudah diperiksa</p>
        <progress className="progress progress-success mt-2 h-3 w-full" value={right} max={COUNT} aria-label="Soal benar" />
        {done === COUNT && <div className="mt-3"><SaveResult kind="harian" part={`${opName}, ${lv.name}, ${dateText}`} correct={right} total={COUNT} title="Berhitung Bersusun" once={`bersusun-${op}-${level}-${save.date}`} /></div>}
        <p className="mt-2 text-xs text-[#4b5f57]">{stored ? "Jawaban tersimpan di perangkat ini." : ""} Coba juga <Link href="/mastering-penjumlahan-pengurangan/level-1" className="link">mastering penjumlahan</Link> dan <Link href="/mastering-perkalian-pembagian/level-1" className="link">perkalian</Link>.</p>
      </div>}
    </div>
  </main>;
}
