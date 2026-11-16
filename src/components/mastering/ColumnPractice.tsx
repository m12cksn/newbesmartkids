"use client";

import { ArrowLeft, Check, ChevronDown, Delete, Divide, Hand, Lightbulb, Minus, Plus, RotateCcw, Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SaveResult } from "@/components/auth/SaveResult";
import { BrandMark } from "@/components/home/BrandMark";
import {
  answerWidth, borrowTops, COL_LEVELS, COL_OPS, columnKey, COUNT, dailyColumn, emptyColumn, isCorrect, longDivision, partials, readColumn, SIGN, steps, wibDate,
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
  kurang: ["Tulis bilangan yang lebih besar di atas, rata kanan.", "Mulai dari kolom satuan.", "Jika angka atas lebih kecil dari angka bawah, pinjam 1 dari kolom sebelah kiri. Angka atas bertambah 10, angka kiri berkurang 1.", "Tulis angka baru di kotak pinjaman di atasnya, misalnya 71 − 46: angka 1 menjadi 11 dan angka 7 menjadi 6. Angka lama otomatis tercoret.", "Kurangkan memakai angka baru: 11 − 6 = 5, lalu 6 − 4 = 2."],
  kali: ["Kalikan angka bawah dengan setiap angka atas, mulai dari satuan.", "Jika hasilnya 10 atau lebih, tulis satuannya dan simpan puluhannya di kotak simpanan.", "Tambahkan simpanan setelah mengalikan kolom berikutnya.", "Untuk pengali dua angka: kalikan dengan satuan dulu, lalu dengan puluhan (geser satu kolom, tulis 0 di satuan), lalu jumlahkan."],
  bagi: ["Bagi dari kiri ke kanan. Ambil angka pertama; jika lebih kecil dari pembagi, ambil satu angka lagi.", "Bersusun pendek (Mudah, Sedang): ketuk kotak di atas angka. Kotak biru di bawahnya memberi tahu bilangan yang harus dibagi pada langkah itu.", "Contoh 69 : 3. Kotak di atas 6: 6 : 3 = 2. Kotak di atas 9: 9 : 3 = 3. Jadi hasilnya 23. Jika ada sisa, sisa digabung dengan angka berikutnya, misalnya 75 : 3: 7 : 3 = 2 sisa 1, lalu 15 : 3 = 5.", "Porogapit (Sulit): tulis hasil bagi di atas, kalikan dengan pembagi dan tulis di bawah, kurangkan, lalu turunkan angka berikutnya (berwarna biru). Ulangi sampai angka terakhir.", "Jika ada kotak Sisa, tulis angka yang tersisa di akhir. Tulis 0 jika habis dibagi. Periksa: hasil bagi × pembagi + sisa = bilangan yang dibagi."],
  cerita: ["Baca soal sampai selesai, lalu cari bilangan-bilangannya.", "Tentukan operasinya: digabung atau ditambah berarti +, sisa atau berkurang berarti −, setiap atau masing-masing berarti × atau :.", "Setelah memilih operasi, kolom hitung bersusun muncul.", "Kerjakan bersusun seperti biasa, lalu periksa apakah jawabannya masuk akal."],
};

/* ---------- Kotak isian ---------- */
type CellApi = { type: (d: string) => void; back: () => void };
/** Kotak yang sedang aktif, dipakai papan angka di layar. */
const active: { current: { current: CellApi | null } | null } = { current: null };

/** Kotak angka. max = banyak angka yang muat (kotak pinjaman muat dua angka, misalnya 11). */
function Cell({ value, onChange, label, state, size = "lg", max = 1, refCb, onBack, onFocusCell, pad }: {
  value: string; onChange: (v: string) => void; label: string; state?: "ok" | "bad"; size?: "lg" | "md" | "sm"; max?: number;
  refCb?: (el: HTMLInputElement | null) => void; onBack?: () => void; onFocusCell?: () => void; pad: boolean;
}) {
  const api = useRef<CellApi | null>(null);
  useEffect(() => { api.current = { type: d => onChange(max === 1 ? d : value.length < max ? value + d : d), back: () => (value ? onChange("") : onBack?.()) }; });
  const sz = size === "lg" ? "h-11 w-10 text-xl" : size === "md" ? "h-8 w-9 text-base" : "h-7 w-7 text-sm";
  return <input ref={refCb} aria-label={label} inputMode={pad ? "none" : "numeric"} maxLength={max} value={value}
    onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(-max))}
    onKeyDown={e => { if (e.key === "Backspace" && !value) { e.preventDefault(); onBack?.(); } }}
    onFocus={e => { e.target.select(); active.current = api; onFocusCell?.(); }}
    className={`${sz} rounded-lg border-2 bg-white text-center font-extrabold tabular-nums outline-none focus:border-[#208f6d] focus:ring-2 focus:ring-[#208f6d]/30
      ${state === "ok" ? "border-[#2b8a3e] bg-[#e6f6ec] text-[#2b8a3e]" : state === "bad" ? "border-[#e03131] bg-[#fff0f0] text-[#e03131]" : size === "lg" ? "border-[#17352a]" : "border-dashed border-[#adb5bd] text-[#e8590c]"}`} />;
}
const Fixed = ({ d, muted = false, struck = false }: { d: string; muted?: boolean; struck?: boolean }) =>
  <span className={`flex h-11 w-10 items-center justify-center text-xl font-extrabold tabular-nums ${muted ? "text-[#adb5bd]" : ""} ${struck ? "text-[#adb5bd] line-through decoration-[#e03131] decoration-2" : ""}`}>{d}</span>;
const pick = (d: string, want: string | undefined): "ok" | "bad" | undefined => (!d || want === undefined ? undefined : d === want ? "ok" : "bad");

/** Petunjuk satu langkah pembagian untuk kotak hasil di kolom c: bilangan yang dibagi pada langkah itu. */
function divisionHint(q: ColQuestion, c: number, lead: number) {
  const dv = String(q.a), prevRem = c === 0 ? 0 : Number(dv.slice(0, c)) % q.b, cur = prevRem * 10 + Number(dv[c]);
  if (c === lead && lead > 0) return `${dv.slice(0, lead)} lebih kecil dari ${q.b}, jadi ambil ${cur}. Berapa ${cur} : ${q.b}?`;
  if (prevRem > 0) return `Sisa langkah sebelumnya ${prevRem}, gabungkan dengan ${dv[c]} menjadi ${cur}. Berapa ${cur} : ${q.b}?`;
  return `Berapa ${cur} : ${q.b}?${cur < q.b ? ` ${cur} lebih kecil dari ${q.b}, jadi tulis 0.` : ""}`;
}
const Hint = ({ text }: { text: string }) => <p className="mt-2 flex max-w-xs items-start gap-1.5 rounded-xl bg-[#e7f3ff] px-3 py-2 text-sm font-semibold text-[#1c4f8a]" role="status"><Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{text}</p>;

/** Kerangka hitung bersusun untuk satu soal. cells: kotak hasil dari kiri ke kanan ("." = kosong). */
function Column({ q, cells, setCells, rem, setRem, checked, carry, id, pad }: { q: ColQuestion; cells: string; setCells: (c: string) => void; rem: string; setRem: (r: string) => void; checked: boolean; carry: boolean; id: string; pad: boolean }) {
  const W = answerWidth(q), refs = useRef<(HTMLInputElement | null)[]>([]), remRef = useRef<HTMLInputElement | null>(null);
  const [helper, setHelper] = useState<Record<string, string>>({});
  const [focusCol, setFocusCol] = useState<number | null>(null);
  const ltr = q.calc === "bagi", want = String(q.answer);
  const put = (i: number, v: string) => { const arr = cells.padEnd(W, ".").split(""); arr[i] = v || "."; setCells(arr.join("")); if (v) (ltr ? (i + 1 < W ? refs.current[i + 1] : remRef.current) : refs.current[i - 1])?.focus(); };
  const back = (i: number) => refs.current[ltr ? i - 1 : i + 1]?.focus();
  const H = (k: string, label: string, col: number, o: { want?: string; size?: "md" | "sm"; max?: number } = {}) =>
    <Cell key={k} pad={pad} size={o.size ?? "sm"} max={o.max ?? 1} value={helper[k] ?? ""} onChange={v => setHelper(h => ({ ...h, [k]: v }))} label={label} onFocusCell={() => setFocusCol(col)} state={checked ? pick(helper[k] ?? "", o.want) : undefined} />;
  const resultCell = (i: number, col: number) => { const v = (cells[i] ?? ".").replace(".", ""); return <Cell key={i} pad={pad} value={v} refCb={el => { refs.current[i] = el; }} label={`Soal ${id}, angka hasil ke-${i + 1} dari kiri`}
    onChange={x => put(i, x)} onBack={() => back(i)} onFocusCell={() => setFocusCol(col)} state={checked ? (v === want[i] ? "ok" : "bad") : undefined} />; };
  /** Satu baris berisi `n` slot kolom. Kolom yang sedang dikerjakan diberi latar kuning muda. */
  const Row = ({ n, slot, gutter, k, cls = "" }: { n: number; slot: (c: number) => ReactNode; gutter?: ReactNode; k: string; cls?: string }) =>
    <div key={k} className={`flex items-center gap-1 ${cls}`}><span className="flex w-6 justify-center text-xl font-extrabold">{gutter}</span>
      {Array.from({ length: n }, (_, c) => { const x = slot(c); return <span key={c} className={`flex min-h-7 w-10 justify-center rounded-md ${focusCol === c && x != null ? "bg-[#fff1b8]" : ""}`}>{x}</span>; })}</div>;
  const remBox = q.withRem && <div className="mt-2 flex items-center justify-center gap-2 font-bold"><span>Sisa</span>
    <Cell pad={pad} max={2} value={rem} onChange={setRem} refCb={el => { remRef.current = el; }} label={`Soal ${id}, sisa pembagian`} onBack={() => refs.current[W - 1]?.focus()}
      state={checked ? (rem === String(q.rem ?? 0) ? "ok" : "bad") : undefined} /></div>;

  if (q.calc === "bagi" && !q.long) {
    const dv = String(q.a), lead = dv.length - W;
    return <div className="inline-flex flex-col items-end" aria-label={`Pembagian bersusun ${q.a} dibagi ${q.b}`} role="group">
      <div className="flex gap-1">{Array.from({ length: dv.length }, (_, c) => <span key={c} className={`flex w-10 justify-center rounded-md ${focusCol === c && c >= lead ? "bg-[#fff1b8]" : ""}`}>{c >= lead ? resultCell(c - lead, c) : null}</span>)}</div>
      <div className="flex items-stretch gap-1">
        <Fixed d={String(q.b)} />
        <div className="flex gap-1 rounded-tl-xl border-l-[3px] border-t-[3px] border-[#17352a] pl-1">
          {dv.split("").map((d, c) => <span key={c} className={`relative rounded-md ${focusCol === c ? "bg-[#fff1b8]" : ""}`}>{carry && c > lead && <span className="absolute -left-2.5 -top-1 z-10 [&_input]:h-5 [&_input]:w-5 [&_input]:rounded-md [&_input]:text-[11px]">{H(`r${c}`, `Soal ${id}, sisa yang digabung dengan angka ke-${c + 1}`, c)}</span>}<Fixed d={d} /></span>)}
        </div>
      </div>
      {!checked && focusCol !== null && focusCol >= lead && <Hint text={divisionHint(q, focusCol, lead)} />}
      {remBox}
    </div>;
  }
  if (q.calc === "bagi") {
    // Porogapit: hasil di atas, lalu hasil kali dan hasil pengurangan untuk setiap langkah.
    const dv = String(q.a), N = dv.length, lead = N - W, st = longDivision(q.a, q.b);
    return <div className="inline-flex flex-col items-start" aria-label={`Porogapit ${q.a} dibagi ${q.b}`} role="group">
      <div className="flex"><span className="h-11" style={{ width: `${String(q.b).length * 1.6 + 0.5}rem` }} />{Row({ k: "q", n: N, slot: c => (c >= lead ? resultCell(c - lead, c) : null) })}</div>
      <div className="flex items-start">
        <span className="flex h-11 items-center justify-end pe-1 text-xl font-extrabold" style={{ width: `${String(q.b).length * 1.6 + 0.5}rem` }}>{q.b}</span>
        <div className="rounded-tl-xl border-l-[3px] border-t-[3px] border-[#17352a]">
          {Row({ k: "d", n: N, slot: c => <Fixed d={dv[c]} /> })}
          {st.map((x, s) => { const ps = String(x.prod), p0 = x.end - ps.length + 1, ds = String(x.diff), last = s === st.length - 1, showDiff = x.diff > 0 || x.brings.length === 0, d0 = x.end - ds.length + 1;
            return <div key={s}>
              {Row({ k: `p${s}`, n: N, gutter: "−", cls: "mt-1", slot: c => (c >= p0 && c <= x.end ? <span className="border-b-[3px] border-[#17352a] pb-0.5">{H(`lp${s}-${c}`, `Soal ${id}, langkah ${s + 1}, hasil kali angka ke-${c - p0 + 1}`, c, { want: ps[c - p0], size: "md" })}</span> : null) })}
              {Row({ k: `r${s}`, n: N, cls: "mt-1", slot: c => (showDiff && c >= d0 && c <= x.end ? H(`ld${s}-${c}`, `Soal ${id}, langkah ${s + 1}, hasil kurang angka ke-${c - d0 + 1}`, c, { want: ds[c - d0], size: "md" })
                : x.brings.includes(c) ? <span className="flex h-8 items-center text-base font-extrabold text-[#1c7ed6]" title="angka yang diturunkan">{dv[c]}</span> : null) })}
              {last && q.withRem && <p className="ps-7 text-xs text-[#4b5f57]">Angka terakhir di bawah adalah sisanya.</p>}
            </div>; })}
        </div>
      </div>
      {!checked && focusCol !== null && focusCol >= lead && <Hint text={`${divisionHint(q, focusCol, lead)} Tulis hasilnya di atas, lalu tulis hasil kalinya di bawah dan kurangkan.`} />}
      <div className="self-center">{remBox}</div>
    </div>;
  }
  const a = String(q.a), b = String(q.b), parts = partials(q);
  const cols = Math.max(W, a.length, b.length, ...parts.map(p => String(p).length));
  const at = (str: string, c: number) => { const k = c - (cols - str.length); return k >= 0 ? str[k] : undefined; };
  const tops = q.calc === "kurang" ? borrowTops(q.a, q.b) : [];
  const fromRight = (c: number) => cols - c;
  return <div className="inline-flex flex-col items-end gap-1" role="group" aria-label={`Hitung bersusun ${q.a} ${SIGN[q.calc]} ${q.b}`}>
    {carry && q.calc === "kurang" && Row({ k: "b", n: cols, slot: c => (at(a, c) !== undefined ? H(`b${c}`, `Soal ${id}, kotak pinjaman kolom ke-${fromRight(c)} dari kanan`, c, { size: "md", max: 2, want: (() => { const t = tops[c - (cols - a.length)]; return t == null ? undefined : String(t); })() }) : null) })}
    {carry && q.calc !== "kurang" && Row({ k: "c", n: cols, slot: c => (c < cols - 1 ? H(`c${c}`, `Soal ${id}, kotak simpanan kolom ke-${fromRight(c)} dari kanan`, c) : null) })}
    {Row({ k: "a", n: cols, slot: c => { const d = at(a, c); return d === undefined ? null : <Fixed d={d} struck={q.calc === "kurang" && Boolean(helper[`b${c}`])} />; } })}
    {Row({ k: "bb", n: cols, gutter: SIGN[q.calc], slot: c => { const d = at(b, c); return d === undefined ? null : <Fixed d={d} />; } })}
    <div className="ms-7 h-[3px] w-[calc(100%-1.75rem)] rounded bg-[#17352a]" />
    {parts.map((p, r) => { const ps = String(p);
      return <div key={r}>
        {carry && Row({ k: `pc${r}`, n: cols, slot: c => (at(ps, c) !== undefined && c < cols - 1 - r && c >= cols - ps.length ? H(`pc${r}-${c}`, `Soal ${id}, simpanan baris ${r + 1}, kolom ke-${fromRight(c)} dari kanan`, c) : null) })}
        {Row({ k: `p${r}`, n: cols, gutter: r === parts.length - 1 ? "+" : undefined, slot: c => { const d = at(ps, c); if (d === undefined) return null; if (c >= cols - r) return <Fixed d="0" muted />;
          return H(`p${r}-${c}`, `Soal ${id}, hasil sebagian baris ${r + 1}, kolom ke-${fromRight(c)} dari kanan`, c, { want: d, size: "md" }); } })}
      </div>; })}
    {parts.length > 0 && <>
      <div className="ms-7 h-[3px] w-[calc(100%-1.75rem)] rounded bg-[#17352a]" />
      {carry && Row({ k: "sc", n: cols, slot: c => (c < cols - 1 ? H(`sc${c}`, `Soal ${id}, simpanan penjumlahan kolom ke-${fromRight(c)} dari kanan`, c) : null) })}
    </>}
    {Row({ k: "res", n: cols, slot: c => (c >= cols - W ? resultCell(c - (cols - W), c) : null) })}
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
  const [op, setOp] = useState<ColOp>("tambah"); const [level, setLevel] = useState<ColLevel>(1);
  // Kotak bantu menyala untuk tambah, kurang, dan kali; untuk bagi dimatikan dulu karena petunjuk langkah sudah menuntun.
  const [helpers, setHelpers] = useState<Record<string, boolean>>({ bagi: false });
  const carry = helpers[op] ?? true, setCarry = (c: boolean) => setHelpers(h => ({ ...h, [op]: c }));
  // Lembar soal baru dibuat setelah halaman berjalan di browser, karena jawaban tersimpan di perangkat.
  const ready = useSyncExternalStore(noop, () => true, () => false);
  return ready ? <Sheet key={`${op}-${level}`} op={op} level={level} setOp={setOp} setLevel={setLevel} carry={carry} setCarry={setCarry} /> : <Sheet op={op} level={level} setOp={setOp} setLevel={setLevel} carry={carry} setCarry={setCarry} loading />;
}

function Sheet({ op, level, setOp, setLevel, carry, setCarry, loading = false }: { op: ColOp; level: ColLevel; setOp: (o: ColOp) => void; setLevel: (l: ColLevel) => void; carry: boolean; setCarry: (c: boolean) => void; loading?: boolean }) {
  const [init] = useState(() => (loading ? null : loadSave(op, level)));
  const [save, setSave] = useState<SavedColumn | null>(init?.save ?? null); const stored = init?.stored ?? true;
  const today = useSyncExternalStore(subscribeDay, wibDate, () => "");
  const [open, setOpen] = useState<number | null>(null);
  // Papan angka di layar menyala otomatis di perangkat sentuh.
  const [pad, setPad] = useState(() => !loading && typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true);
  useEffect(() => { if (!save) return; try { localStorage.setItem(columnKey(op, level), JSON.stringify(save)); } catch { /* penyimpanan tidak tersedia */ } }, [save, op, level]);
  const questions = save ? dailyColumn(save.date, op, level) : [];
  const done = save ? save.checked.filter(Boolean).length : 0, good = (i: number) => Boolean(save && save.checked[i] && isCorrect(questions[i], save.answers[i], save.rems[i]) && (op !== "cerita" || save.ops[i] === questions[i].calc));
  const right = save ? questions.filter((_, i) => good(i)).length : 0, stars = save ? questions.filter((_, i) => good(i) && !save.helped[i]).length : 0;
  const dateText = save ? new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jakarta" }).format(new Date(save.date + "T00:00:00+07:00")) : "";
  const upd = (i: number, f: (s: SavedColumn) => Partial<SavedColumn>) => setSave(s => (s ? { ...s, ...f(s) } : s));
  const setAt = <T,>(arr: T[], i: number, v: T) => arr.map((x, k) => (k === i ? v : x));
  const opName = COL_OPS.find(o => o.id === op)!.name, lv = COL_LEVELS.find(l => l.id === level)!;

  return <main data-theme="besmartkids" className={`min-h-screen bg-[#f6f3ea] text-[#17352a] ${pad ? "pb-36" : "pb-16"}`}>
    <header className="border-b-[3px] border-[#17352a] bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="Beranda BeSmartKids" className="shrink-0 [&_img]:w-[140px]"><BrandMark /></Link>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border-[3px] border-[#17352a] bg-white px-3 py-1 font-extrabold shadow-[0_3px_0_#17352a]" aria-label={`${stars} bintang hari ini`}><Star className="size-4 fill-[#ffd34f] text-[#e8a400]" aria-hidden="true" />{stars}</span>
          <Link href="/" className="btn btn-sm rounded-full border-[3px] border-[#17352a] bg-white shadow-[0_3px_0_#17352a]"><ArrowLeft className="size-4" aria-hidden="true" /><span className="max-sm:hidden">Beranda</span></Link>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Berhitung bersusun</h1>
      <p className="mt-2 text-[0.95rem] leading-6 text-[#4b5f57]">Isi setiap kotak dengan satu angka. Kerjakan dari kanan ke kiri (pembagian dari kiri ke kanan); setelah mengetik, kursor pindah sendiri ke kotak berikutnya. Soal baru setiap hari pukul 00.00 WIB.</p>

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
        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold"><input type="checkbox" className="checkbox checkbox-success" checked={carry} onChange={e => setCarry(e.target.checked)} />{op === "kurang" ? "Kotak pinjaman" : op === "bagi" ? "Kotak sisa" : "Kotak simpanan"}</label>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold"><input type="checkbox" className="checkbox checkbox-success" checked={pad} onChange={e => setPad(e.target.checked)} />Papan angka</label>
      </div>

      <details className="group mt-4 rounded-2xl border-[3px] border-[#17352a] bg-[#ffd34f] shadow-[0_4px_0_#17352a]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-extrabold"><ChevronDown className="size-5 -rotate-90 transition-transform group-open:rotate-0 motion-reduce:transition-none" aria-hidden="true" />Cara menghitung {op === "cerita" ? "soal cerita" : opName.toLowerCase()}</summary>
        <ol className="list-decimal space-y-1 rounded-b-2xl bg-white px-4 py-3 ps-9 text-sm leading-6">{GUIDE[op].map(g => <li key={g}>{g}</li>)}</ol>
      </details>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2"><p className="font-bold">{opName}, {lv.name}</p><p className="text-sm text-[#4b5f57]">{dateText}{save && save.date !== today ? " (paket kemarin)" : ""}</p></div>
      {save && save.date !== today && <div role="status" className="mt-2 rounded-2xl border-2 border-[#e8a400] bg-[#fff6d6] p-3 text-sm">Paket hari baru sudah tersedia. <button type="button" className="link font-bold" onClick={() => setSave(emptyColumn(wibDate()))}>Buka soal hari ini</button></div>}
      {!stored && <p role="status" className="mt-2 text-sm text-[#e03131]">Penyimpanan perangkat tidak tersedia. Jawaban tidak tersimpan setelah halaman ditutup.</p>}

      {save && <ol className="mt-3 space-y-4">{questions.map((q, i) => {
        const chosen = (op === "cerita" ? save.ops[i] : q.calc) as Calc | "", checked = save.checked[i], ok = good(i);
        const shown: ColQuestion = chosen === q.calc || !chosen ? q : { ...q, calc: chosen, withRem: false, long: false, answer: chosen === "tambah" ? q.a + q.b : chosen === "kurang" ? Math.abs(q.a - q.b) : chosen === "kali" ? q.a * q.b : Math.floor(q.a / q.b) };
        const full = !save.answers[i].includes(".") && save.answers[i].length === answerWidth(shown) && (!shown.withRem || save.rems[i] !== "");
        /** Bantu satu langkah: pilih operasi yang benar, atau isi satu kotak hasil berikutnya. Soal yang dibantu tidak mendapat bintang. */
        const assist = () => upd(i, s => {
          if (op === "cerita" && s.ops[i] !== q.calc) return { ops: setAt(s.ops, i, q.calc), answers: setAt(s.answers, i, ""), rems: setAt(s.rems, i, ""), helped: setAt(s.helped, i, true) };
          const W = answerWidth(q), cur = s.answers[i].padEnd(W, ".").split(""), want = String(q.answer);
          const order = q.calc === "bagi" ? [...Array(W).keys()] : [...Array(W).keys()].reverse(), k = order.find(j => cur[j] !== want[j]);
          if (k !== undefined) { cur[k] = want[k]; return { answers: setAt(s.answers, i, cur.join("")), helped: setAt(s.helped, i, true) }; }
          if (q.withRem && s.rems[i] !== String(q.rem ?? 0)) return { rems: setAt(s.rems, i, String(q.rem ?? 0)), helped: setAt(s.helped, i, true) };
          return {};
        });
        const tone = ["bg-[#e03131]", "bg-[#1c7ed6]", "bg-[#2b8a3e]", "bg-[#e8590c]", "bg-[#7048e8]"][i % 5];
        return <li key={`${save.date}-${op}-${level}-${i}`} data-testid={`bersusun-${i}`} className={`rounded-3xl border-[3px] border-[#17352a] bg-white p-4 shadow-[0_5px_0_#17352a] ${checked ? (ok ? "ring-4 ring-[#2b8a3e]/30" : "ring-4 ring-[#e03131]/25") : ""}`}>
          <p className="flex items-center gap-2 font-bold"><span className={`flex size-7 items-center justify-center rounded-lg text-sm font-extrabold text-white ${tone}`}>{i + 1}</span>{q.story ? "Soal cerita" : `${q.a} ${SIGN[q.calc]} ${q.b}`}{q.long && !q.story && <span className="rounded-full bg-[#e7f3ff] px-2 py-0.5 text-xs font-bold text-[#1c7ed6]">porogapit</span>}</p>
          {q.story && <><p className="mt-2 leading-7">{q.story}</p>
            <div role="radiogroup" aria-label={`Operasi soal ${i + 1}`} className="mt-2 flex flex-wrap items-center gap-2"><span className="text-sm font-bold">Operasinya:</span>
              {(["tambah", "kurang", "kali", "bagi"] as Calc[]).map(c => <button key={c} type="button" role="radio" aria-checked={chosen === c} aria-label={`Operasi ${COL_OPS.find(o => o.id === c)!.name}`} disabled={checked}
                onClick={() => upd(i, s => ({ ops: setAt(s.ops, i, c), answers: setAt(s.answers, i, ""), rems: setAt(s.rems, i, "") }))}
                className={`flex size-10 items-center justify-center rounded-xl border-[3px] border-[#17352a] text-lg font-extrabold shadow-[0_3px_0_#17352a] ${chosen === c ? "bg-[#ffd34f]" : "bg-white"}`}>{SIGN[c]}</button>)}</div>
            {!chosen && <p className="mt-2 text-sm text-[#4b5f57]">Pilih operasi dulu untuk menampilkan kolom hitung.</p>}</>}
          {chosen && <div className="mt-3 flex justify-center overflow-x-auto py-2">
            <Column key={chosen} id={String(i + 1)} q={shown} pad={pad} rem={save.rems[i]} setRem={r => upd(i, s => ({ rems: setAt(s.rems, i, r) }))}
              cells={save.answers[i]} setCells={c => upd(i, s => ({ answers: setAt(s.answers, i, c) }))} checked={checked} carry={carry} />
          </div>}
          {chosen && <div className="mt-3 flex flex-wrap items-center gap-2">
            {!checked ? <button type="button" className="btn rounded-2xl border-[3px] border-[#17352a] bg-[#208f6d] text-white shadow-[0_4px_0_#17352a] hover:bg-[#18785a]" disabled={!full}
              onClick={() => upd(i, s => ({ checked: setAt(s.checked, i, true) }))}>Periksa</button>
              : <button type="button" className="btn btn-sm rounded-xl border-2 border-[#17352a] bg-white" onClick={() => { upd(i, s => ({ checked: setAt(s.checked, i, false), answers: setAt(s.answers, i, ""), rems: setAt(s.rems, i, "") })); setOpen(null); }}><RotateCcw className="size-4" aria-hidden="true" />Coba lagi</button>}
            {!checked && <button type="button" className="btn btn-sm rounded-xl border-2 border-[#17352a] bg-[#fff6d6]" onClick={assist}><Hand className="size-4" aria-hidden="true" />Bantu satu langkah</button>}
            {save.helped[i] && <span className="text-xs text-[#4b5f57]">Dibantu, tanpa bintang</span>}
            {checked && <p role="status" className={`flex items-center gap-1 font-bold ${ok ? "text-[#2b8a3e]" : "text-[#e03131]"}`}>{ok ? <><Check className="size-5" aria-hidden="true" />Tepat! {q.answer}{q.withRem ? ` sisa ${q.rem ?? 0}` : ""}{q.storyUnit ? ` ${q.storyUnit}` : ""}.</> : <><X className="size-5" aria-hidden="true" />{chosen !== q.calc ? "Operasinya belum tepat." : "Ada kotak yang belum tepat."}</>}</p>}
            {checked && !ok && <button type="button" className="link text-sm font-bold" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>Lihat pembahasan</button>}
          </div>}
          {checked && !ok && open === i && <ol className="mt-2 list-decimal space-y-0.5 rounded-xl bg-[#fff6d6] p-3 ps-8 text-sm leading-6">
            {chosen !== q.calc && <li>Soal ini memakai operasi {COL_OPS.find(o => o.id === q.calc)!.name.toLowerCase()}: {q.a} {SIGN[q.calc]} {q.b}.</li>}
            {steps(q).map(s => <li key={s}>{s}</li>)}<li>Jawaban: {q.answer}{q.withRem ? ` sisa ${q.rem ?? 0}` : ""}{q.storyUnit ? ` ${q.storyUnit}` : ""}.</li></ol>}
        </li>; })}</ol>}

      {save && <div className="mt-6 rounded-3xl border-[3px] border-[#17352a] bg-white p-4 shadow-[0_5px_0_#17352a]" role="status">
        <p className="font-extrabold">Benar {right} dari {COUNT}, {done} soal sudah diperiksa</p>
        <progress className="progress progress-success mt-2 h-3 w-full" value={right} max={COUNT} aria-label="Soal benar" />
        {done === COUNT && <div className="mt-3"><SaveResult kind="harian" part={`${opName}, ${lv.name}, ${dateText}`} correct={right} total={COUNT} title="Berhitung Bersusun" once={`bersusun-${op}-${level}-${save.date}`} /></div>}
        <p className="mt-2 text-xs text-[#4b5f57]">{stored ? "Jawaban tersimpan di perangkat ini." : ""} Coba juga <Link href="/mastering-penjumlahan-pengurangan/level-1" className="link">mastering penjumlahan</Link> dan <Link href="/mastering-perkalian-pembagian/level-1" className="link">perkalian</Link>.</p>
      </div>}
    </div>
    {pad && <div role="group" aria-label="Papan angka" className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-[#17352a] bg-white/95 px-2 py-2 backdrop-blur print:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map(d => <button key={d} type="button" aria-label={`Angka ${d}`} onPointerDown={e => e.preventDefault()} onClick={() => active.current?.current?.type(d)}
          className="h-11 rounded-xl border-[3px] border-[#17352a] bg-white text-xl font-extrabold shadow-[0_3px_0_#17352a] active:translate-y-0.5">{d}</button>)}
        <button type="button" aria-label="Hapus" onPointerDown={e => e.preventDefault()} onClick={() => active.current?.current?.back()} className="col-span-2 flex h-11 items-center justify-center rounded-xl border-[3px] border-[#17352a] bg-[#ffe3e3] shadow-[0_3px_0_#17352a]"><Delete className="size-6" aria-hidden="true" /></button>
      </div>
    </div>}
  </main>;
}
