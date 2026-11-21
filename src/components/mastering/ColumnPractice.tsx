"use client";

import { ArrowLeft, BookOpen, Check, ChevronDown, Delete, Divide, Hand, Lightbulb, Minus, Plus, RotateCcw, Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { SaveResult } from "@/components/auth/SaveResult";
import { BrandMark } from "@/components/home/BrandMark";
import {
  answerWidth, borrowTops, COL_LEVELS, COL_OPS, columnKey, COUNT, dailyColumn, emptyColumn, isCorrect, longLayout, partials, readColumn, SIGN, steps, wibDate,
  type Calc, type LongCell, type ColLevel, type ColOp, type ColQuestion, type SavedColumn,
} from "@/lib/daily-column";

/* Tampilan: buku tulis berpetak dengan warna hijau BeSmartKids. */
const OP_ICON: Record<ColOp, ReactNode> = {
  tambah: <Plus className="size-4" strokeWidth={2} aria-hidden="true" />,
  kurang: <Minus className="size-4" strokeWidth={2} aria-hidden="true" />,
  kali: <X className="size-4" strokeWidth={2} aria-hidden="true" />,
  bagi: <Divide className="size-4" strokeWidth={2} aria-hidden="true" />,
  cerita: <BookOpen className="size-4" strokeWidth={2} aria-hidden="true" />,
};
/** Warna tiap jenis soal: c = utama (teks putih di atasnya tetap terbaca), s = lembut, g = garis petak, p = latar halaman. */
const THEME: Record<ColOp, { c: string; s: string; g: string; p: string }> = {
  tambah: { c: "#0b7a75", s: "#dcf5f1", g: "#c4e8e2", p: "#effaf8" },
  kurang: { c: "#c2255c", s: "#fde7ef", g: "#f6cddc", p: "#fdf3f7" },
  kali: { c: "#b53a0a", s: "#ffead9", g: "#f9d4b7", p: "#fff6ee" },
  bagi: { c: "#3b5bdb", s: "#e5eafd", g: "#cbd5f8", p: "#f2f5fe" },
  cerita: { c: "#7048e8", s: "#eee7fd", g: "#dacdf8", p: "#f6f2fe" },
};
const vars = (op: ColOp) => ({ "--c": THEME[op].c, "--s": THEME[op].s, "--g": THEME[op].g, "--p": THEME[op].p }) as CSSProperties;
/** Latar kertas berpetak untuk area hitung, garisnya mengikuti warna jenis soal. */
const GRID_PAPER = "bg-white bg-[linear-gradient(var(--g)_1px,transparent_1px),linear-gradient(90deg,var(--g)_1px,transparent_1px)] bg-[size:22px_22px]";
const GUIDE: Record<ColOp, string[]> = {
  tambah: ["Tulis kedua bilangan rata kanan: satuan di bawah satuan, puluhan di bawah puluhan.", "Mulai dari kolom paling kanan (satuan).", "Jika hasil satu kolom 10 atau lebih, tulis angka satuannya, lalu simpan 1 di kotak simpanan kolom sebelah kiri.", "Jumlahkan kolom berikutnya bersama simpanannya."],
  kurang: ["Tulis bilangan yang lebih besar di atas, rata kanan.", "Mulai dari kolom satuan.", "Jika angka atas lebih kecil dari angka bawah, pinjam 1 dari kolom sebelah kiri. Angka atas bertambah 10, angka kiri berkurang 1.", "Tulis angka baru di kotak pinjaman di atasnya, misalnya 71 − 46: angka 1 menjadi 11 dan angka 7 menjadi 6. Angka lama otomatis tercoret.", "Kurangkan memakai angka baru: 11 − 6 = 5, lalu 6 − 4 = 2."],
  kali: ["Kalikan angka bawah dengan setiap angka atas, mulai dari satuan.", "Jika hasilnya 10 atau lebih, tulis satuannya dan simpan puluhannya di kotak simpanan.", "Tambahkan simpanan setelah mengalikan kolom berikutnya.", "Untuk pengali dua angka: kalikan dengan satuan dulu, lalu dengan puluhan (geser satu kolom, tulis 0 di satuan), lalu jumlahkan."],
  bagi: ["Porogapit dikerjakan langkah demi langkah. Kursor pindah sendiri ke kotak berikutnya, dan petunjuk biru menyebut apa yang harus dihitung.", "Contoh 72 : 4. 7 : 4 = 1, tulis 1 di atas. 1 × 4 = 4, tulis di bawah 7. 7 − 4 = 3. Turunkan 2 sehingga menjadi 32.", "32 : 4 = 8, tulis 8 di atas. 8 × 4 = 32, tulis di bawah. 32 − 32 = 0. Hasilnya 18.", "Angka paling bawah adalah sisa. Jika ada kotak Sisa, tulis angka itu (0 jika habis dibagi). Di tingkat Mudah dan Sedang semua kotak langkah wajib diisi; di tingkat Sulit boleh langsung menulis hasil."],
  cerita: ["Baca soal sampai selesai, lalu cari bilangan-bilangannya.", "Tentukan operasinya: digabung atau ditambah berarti +, sisa atau berkurang berarti −, setiap atau masing-masing berarti × atau :.", "Setelah memilih operasi, kolom hitung bersusun muncul.", "Kerjakan bersusun seperti biasa, lalu periksa apakah jawabannya masuk akal."],
};

/* ---------- Kotak isian ---------- */
type CellApi = { type: (d: string) => void; back: () => void };
/** Kotak yang sedang aktif, dipakai papan angka di layar. */
const active: { current: { current: CellApi | null } | null } = { current: null };

/** Kotak angka. max = banyak angka yang muat (kotak pinjaman muat dua angka, misalnya 11). */
function Cell({ value, onChange, label, state, size = "lg", max = 1, refCb, onBack, onFocusCell, pad, solid = false }: {
  value: string; onChange: (v: string) => void; label: string; state?: "ok" | "bad"; size?: "lg" | "md" | "sm"; max?: number;
  refCb?: (el: HTMLInputElement | null) => void; onBack?: () => void; onFocusCell?: () => void; pad: boolean; solid?: boolean;
}) {
  const api = useRef<CellApi | null>(null);
  useEffect(() => { api.current = { type: d => onChange(max === 1 ? d : value.length < max ? value + d : d), back: () => (value ? onChange("") : onBack?.()) }; });
  const sz = size === "lg" ? "h-11 w-10 text-xl" : size === "md" ? "h-8 w-9 text-base" : "h-7 w-7 text-sm";
  return <input ref={refCb} aria-label={label} inputMode={pad ? "none" : "numeric"} maxLength={max} value={value}
    onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(-max))}
    onKeyDown={e => { if (e.key === "Backspace" && !value) { e.preventDefault(); onBack?.(); } }}
    onFocus={e => { e.target.select(); active.current = api; onFocusCell?.(); }}
    className={`${sz} rounded-md border bg-white text-center font-bold tabular-nums outline-none focus:border-[var(--c)] focus:ring-2 focus:ring-[var(--c)]/35
      ${state === "ok" ? "border-[#2b8a3e] bg-[#e9f7ef] text-[#2b8a3e]" : state === "bad" ? "border-[#e03131] bg-[#fff0f0] text-[#c92a2a]" : size === "lg" ? "border-[var(--c)]/60 shadow-[inset_0_-2px_0_var(--g)]" : solid ? "border-[var(--c)] text-[#17352a]" : "border-dashed border-[#9fb8ad] text-[#b35c00]"}`} />;
}
const Fixed = ({ d, muted = false, struck = false }: { d: string; muted?: boolean; struck?: boolean }) =>
  <span className={`flex h-11 w-10 items-center justify-center text-xl font-bold tabular-nums ${muted ? "text-[#9fb8ad]" : ""} ${struck ? "text-[#9fb8ad] line-through decoration-[#e03131] decoration-2" : ""}`}>{d}</span>;
const pick = (d: string, want: string | undefined): "ok" | "bad" | undefined => (!d || want === undefined ? undefined : d === want ? "ok" : "bad");

/** Petunjuk satu langkah pembagian untuk kotak hasil di kolom c: bilangan yang dibagi pada langkah itu. */
function divisionHint(q: ColQuestion, c: number, lead: number) {
  const dv = String(q.a), prevRem = c === 0 ? 0 : Number(dv.slice(0, c)) % q.b, cur = prevRem * 10 + Number(dv[c]);
  if (c === lead && lead > 0) return `${dv.slice(0, lead)} lebih kecil dari ${q.b}, jadi ambil ${cur}. Berapa ${cur} : ${q.b}?`;
  if (prevRem > 0) return `Sisa langkah sebelumnya ${prevRem}, gabungkan dengan ${dv[c]} menjadi ${cur}. Berapa ${cur} : ${q.b}?`;
  return `Berapa ${cur} : ${q.b}?${cur < q.b ? ` ${cur} lebih kecil dari ${q.b}, jadi tulis 0.` : ""}`;
}
const Hint = ({ text }: { text: string }) => <p className="mt-2 flex max-w-xs items-start gap-1.5 border-s-4 border-[#f0b429] bg-[#fff8e1] px-3 py-2 text-sm font-semibold text-[#6b4e00]" role="status"><Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{text}</p>;

/** Kerangka hitung bersusun untuk satu soal. cells: kotak hasil dari kiri ke kanan ("." = kosong). */
function Column({ q, cells, setCells, rem, setRem, checked, carry, id, pad, work, setWork }: { q: ColQuestion; cells: string; setCells: (c: string) => void; rem: string; setRem: (r: string) => void; checked: boolean; carry: boolean; id: string; pad: boolean; work: Record<string, string>; setWork: (w: Record<string, string>) => void }) {
  const refsByKey = useRef<Record<string, HTMLInputElement | null>>({});
  const [focusKey, setFocusKey] = useState<string | null>(null);
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
    <div key={k} className={`flex items-center gap-1 ${cls}`}><span className="flex w-6 justify-center text-xl font-bold text-[var(--c)]">{gutter}</span>
      {Array.from({ length: n }, (_, c) => { const x = slot(c); return <span key={c} className={`flex min-h-7 w-10 justify-center rounded-md ${focusCol === c && x != null ? "bg-[var(--s)]" : ""}`}>{x}</span>; })}</div>;
  const remBox = q.withRem && <div className="mt-2 flex items-center justify-center gap-2 font-bold"><span>Sisa</span>
    <Cell pad={pad} max={2} value={rem} onChange={setRem} refCb={el => { remRef.current = el; }} label={`Soal ${id}, sisa pembagian`} onBack={() => refs.current[W - 1]?.focus()} onFocusCell={() => setFocusKey("rem")}
      state={checked ? (rem === String(q.rem ?? 0) ? "ok" : "bad") : undefined} /></div>;

  if (q.calc === "bagi" && !q.long) {
    const dv = String(q.a), lead = dv.length - W;
    return <div className="inline-flex flex-col items-end" aria-label={`Pembagian bersusun ${q.a} dibagi ${q.b}`} role="group">
      <div className="flex gap-1">{Array.from({ length: dv.length }, (_, c) => <span key={c} className={`flex w-10 justify-center rounded-md ${focusCol === c && c >= lead ? "bg-[var(--s)]" : ""}`}>{c >= lead ? resultCell(c - lead, c) : null}</span>)}</div>
      <div className="flex items-stretch gap-1">
        <Fixed d={String(q.b)} />
        <div className="flex gap-1 rounded-tl-lg border-l-2 border-t-2 border-[#17352a] pl-1">
          {dv.split("").map((d, c) => <span key={c} className={`relative rounded-md ${focusCol === c ? "bg-[var(--s)]" : ""}`}>{carry && c > lead && <span className="absolute -left-2.5 -top-1 z-10 [&_input]:h-5 [&_input]:w-5 [&_input]:rounded-md [&_input]:text-[11px]">{H(`r${c}`, `Soal ${id}, sisa yang digabung dengan angka ke-${c + 1}`, c)}</span>}<Fixed d={d} /></span>)}
        </div>
      </div>
      {!checked && focusCol !== null && focusCol >= lead && <Hint text={divisionHint(q, focusCol, lead)} />}
      {remBox}
    </div>;
  }
  if (q.calc === "bagi") {
    // Porogapit: setiap kotak (hasil di atas, hasil kali, hasil kurang, angka turun) diisi berurutan; kursor mengikuti urutan itu.
    const dv = String(q.a), lay = longLayout(q), N = lay.N, divW = `${String(q.b).length * 1.6 + 0.5}rem`;
    const order = lay.cells, at = new Map(order.map(c => [`${c.row}:${c.col}`, c]));
    const val = (c: LongCell) => (c.kind === "q" ? (cells[c.col - lay.lead] ?? ".").replace(".", "") : work[c.key] ?? "");
    const focusNext = (c: LongCell) => { const k = order.indexOf(c); const nx = order[k + 1]; if (nx) refsByKey.current[nx.key]?.focus(); else remRef.current?.focus(); };
    const focusPrev = (c: LongCell) => { const k = order.indexOf(c); if (k > 0) refsByKey.current[order[k - 1].key]?.focus(); };
    const setVal = (c: LongCell, v: string) => {
      if (c.kind === "q") { const arr = cells.padEnd(W, ".").split(""); arr[c.col - lay.lead] = v || "."; setCells(arr.join("")); }
      else setWork({ ...work, [c.key]: v });
      if (v) focusNext(c);
    };
    const box = (c: LongCell) => <Cell key={c.key} pad={pad} size={c.kind === "q" ? "lg" : "md"} value={val(c)} onChange={v => setVal(c, v)} onBack={() => focusPrev(c)}
      refCb={el => { refsByKey.current[c.key] = el; }} onFocusCell={() => { setFocusCol(c.col); setFocusKey(c.key); }}
      label={`Soal ${id}, ${c.kind === "q" ? `angka hasil ke-${c.col - lay.lead + 1} dari kiri` : c.kind === "p" ? `langkah ${Math.ceil(c.row / 2)}, hasil kali kolom ke-${c.col + 1}` : c.kind === "d" ? `langkah ${c.row / 2}, hasil kurang kolom ke-${c.col + 1}` : `langkah ${c.row / 2}, angka turun kolom ke-${c.col + 1}`}`}
      state={checked ? (val(c) ? (val(c) === c.want ? "ok" : "bad") : c.kind === "q" ? "bad" : undefined) : undefined} solid={c.kind !== "q"} />;
    const hint = order.find(c => c.key === focusKey);
    return <div className="inline-flex flex-col items-start" aria-label={`Porogapit ${q.a} dibagi ${q.b}`} role="group">
      <div className="flex"><span className="h-11" style={{ width: divW }} />{Row({ k: "q", n: N, slot: c => { const x = at.get(`-1:${c}`); return x ? box(x) : null; } })}</div>
      <div className="flex items-start">
        <span className="flex h-11 items-center justify-end pe-1 text-xl font-extrabold" style={{ width: divW }}>{q.b}</span>
        <div className="rounded-tl-lg border-l-2 border-t-2 border-[#17352a]">
          {Row({ k: "dv", n: N, slot: c => <Fixed d={dv[c]} /> })}
          {Array.from({ length: lay.rows - 1 }, (_, r0) => { const r = r0 + 1, prod = r % 2 === 1;
            return Row({ k: `r${r}`, n: N, gutter: prod ? "−" : undefined, cls: "mt-1", slot: c => { const x = at.get(`${r}:${c}`); return x ? (prod ? <span className="border-b-2 border-[#17352a] pb-0.5">{box(x)}</span> : box(x)) : null; } }); })}
        </div>
      </div>
      {!checked && hint && <Hint text={hint.hint} />}
      {!checked && !hint && focusKey === "rem" && <Hint text="Angka paling bawah adalah sisa. Tulis 0 jika habis dibagi." />}
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
    <div className="ms-7 h-0.5 w-[calc(100%-1.75rem)] bg-[#17352a]" />
    {parts.map((p, r) => { const ps = String(p);
      return <div key={r}>
        {carry && Row({ k: `pc${r}`, n: cols, slot: c => (at(ps, c) !== undefined && c < cols - 1 - r && c >= cols - ps.length ? H(`pc${r}-${c}`, `Soal ${id}, simpanan baris ${r + 1}, kolom ke-${fromRight(c)} dari kanan`, c) : null) })}
        {Row({ k: `p${r}`, n: cols, gutter: r === parts.length - 1 ? "+" : undefined, slot: c => { const d = at(ps, c); if (d === undefined) return null; if (c >= cols - r) return <Fixed d="0" muted />;
          return H(`p${r}-${c}`, `Soal ${id}, hasil sebagian baris ${r + 1}, kolom ke-${fromRight(c)} dari kanan`, c, { want: d, size: "md" }); } })}
      </div>; })}
    {parts.length > 0 && <>
      <div className="ms-7 h-0.5 w-[calc(100%-1.75rem)] bg-[#17352a]" />
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

  const card = "rounded-2xl bg-white ring-1 ring-[var(--g)]";
  const controls = <>
    <div role="radiogroup" aria-label="Jenis soal" className="flex flex-wrap gap-1.5 lg:flex-col">
      {COL_OPS.map(o => <button key={o.id} type="button" role="radio" aria-checked={o.id === op} onClick={() => setOp(o.id)}
        style={vars(o.id)} className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors lg:rounded-lg lg:py-2 ${o.id === op ? "bg-[var(--c)] text-white" : "bg-[var(--s)] text-[var(--c)] hover:ring-1 hover:ring-[var(--c)]"}`}>
        {OP_ICON[o.id]}<span>{o.name}</span></button>)}
    </div>
    <div role="radiogroup" aria-label="Tingkat" className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg ring-1 ring-[#dbe7e1]">
      {COL_LEVELS.map(l => <button key={l.id} type="button" role="radio" aria-checked={l.id === level} onClick={() => setLevel(l.id)}
        className={`border-s border-[#dbe7e1] px-1 py-1.5 text-center first:border-s-0 ${l.id === level ? "bg-[var(--c)] text-white" : "bg-white"}`}><span className="block text-sm font-bold">{l.name}</span><span className={`block text-[11px] ${l.id === level ? "text-white/85" : "text-[#5b6f66]"}`}>{l.grade}</span></button>)}
    </div>
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 lg:flex-col">
      {op !== "bagi" && <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" className="toggle toggle-sm [--tglbg:white] checked:border-[var(--c)] checked:bg-[var(--c)] checked:text-white" checked={carry} onChange={e => setCarry(e.target.checked)} />{op === "kurang" ? "Kotak pinjaman" : "Kotak simpanan"}</label>}
      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" className="toggle toggle-sm [--tglbg:white] checked:border-[var(--c)] checked:bg-[var(--c)] checked:text-white" checked={pad} onChange={e => setPad(e.target.checked)} />Papan angka</label>
    </div>
    <details className="group mt-3 rounded-lg bg-[var(--s)]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-bold"><BookOpen className="size-4 text-[var(--c)]" aria-hidden="true" />Cara menghitung {op === "cerita" ? "soal cerita" : opName.toLowerCase()}<ChevronDown className="ms-auto size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" /></summary>
      <ol className="list-decimal space-y-1 px-3 pb-3 ps-8 text-sm leading-6">{GUIDE[op].map(g => <li key={g}>{g}</li>)}</ol>
    </details>
  </>;

  return <main data-theme="besmartkids" style={vars(op)} className={`min-h-screen bg-[var(--p)] text-[#17352a] transition-colors motion-reduce:transition-none ${pad ? "pb-36" : "pb-16"}`}>
    <header className="border-b-4 border-[var(--c)] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" aria-label="Beranda BeSmartKids" className="shrink-0 [&_img]:w-[132px]"><BrandMark /></Link>
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1.5 rounded-full bg-[#fff8e1] px-3 py-1 text-sm font-bold text-[#6b4e00]" aria-label={`${stars} bintang hari ini`}><Star className="size-4 fill-[#f0b429] text-[#f0b429]" aria-hidden="true" />{stars}</span>
          <Link href="/" className="btn btn-ghost btn-sm gap-1"><ArrowLeft className="size-4" aria-hidden="true" /><span className="max-sm:hidden">Beranda</span></Link>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-5xl px-4 pt-5">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Berhitung bersusun</h1>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#4b5f57]">Isi setiap kotak dengan satu angka. Kerjakan dari kanan ke kiri (pembagian dari kiri ke kanan); setelah mengetik, kursor pindah sendiri ke kotak berikutnya. Soal baru setiap hari pukul 00.00 WIB.</p>
      <div className="mt-4 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-start lg:gap-6">
      <aside aria-label="Pengaturan latihan" className={`${card} p-3 lg:sticky lg:top-4`}>{controls}
        {save && <div className="mt-3 border-t border-[#dbe7e1] pt-3 max-lg:hidden" aria-hidden="true"><p className="text-sm font-bold">{right} dari {COUNT} benar</p><progress className="progress mt-1 h-2 w-full text-[var(--c)] [&::-webkit-progress-value]:bg-[var(--c)] [&::-moz-progress-bar]:bg-[var(--c)]" value={right} max={COUNT} /></div>}
      </aside>
      <section aria-label="Lembar soal" className="max-lg:mt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-bold">{opName}, {lv.name}</h2><p className="text-sm text-[#4b5f57]">{dateText}{save && save.date !== today ? " (paket kemarin)" : ""}</p></div>
      {save && save.date !== today && <div role="status" className="mt-2 rounded-lg border-s-4 border-[#f0b429] bg-[#fff8e1] p-3 text-sm">Paket hari baru sudah tersedia. <button type="button" className="link font-bold" onClick={() => setSave(emptyColumn(wibDate()))}>Buka soal hari ini</button></div>}
      {!stored && <p role="status" className="mt-2 text-sm text-[#c92a2a]">Penyimpanan perangkat tidak tersedia. Jawaban tidak tersimpan setelah halaman ditutup.</p>}

      {save && <ol className="mt-3 space-y-3">{questions.map((q, i) => {
        const chosen = (op === "cerita" ? save.ops[i] : q.calc) as Calc | "", checked = save.checked[i], ok = good(i);
        const shown: ColQuestion = chosen === q.calc || !chosen ? q : { ...q, calc: chosen, withRem: false, long: false, answer: chosen === "tambah" ? q.a + q.b : chosen === "kurang" ? Math.abs(q.a - q.b) : chosen === "kali" ? q.a * q.b : Math.floor(q.a / q.b) };
        // Porogapit Mudah dan Sedang: semua kotak langkah wajib diisi. Sulit: cukup hasil dan sisa.
        const stepCells = shown.calc === "bagi" && shown.long ? longLayout(shown).cells.filter(c => c.kind !== "q") : [];
        const stepsDone = level === 3 || stepCells.every(c => (save.work[i][c.key] ?? "") !== "");
        const full = !save.answers[i].includes(".") && save.answers[i].length === answerWidth(shown) && (!shown.withRem || save.rems[i] !== "") && stepsDone;
        /** Bantu satu langkah: pilih operasi yang benar, atau isi satu kotak hasil berikutnya. Soal yang dibantu tidak mendapat bintang. */
        const assist = () => upd(i, s => {
          if (op === "cerita" && s.ops[i] !== q.calc) return { ops: setAt(s.ops, i, q.calc), answers: setAt(s.answers, i, ""), rems: setAt(s.rems, i, ""), helped: setAt(s.helped, i, true) };
          const W = answerWidth(q), cur = s.answers[i].padEnd(W, ".").split(""), want = String(q.answer);
          if (q.calc === "bagi" && q.long) {
            const lay = longLayout(q), next = lay.cells.find(c => (c.kind === "q" ? cur[c.col - lay.lead] : s.work[i][c.key] ?? "") !== c.want);
            if (next?.kind === "q") { cur[next.col - lay.lead] = next.want; return { answers: setAt(s.answers, i, cur.join("")), helped: setAt(s.helped, i, true) }; }
            if (next) return { work: setAt(s.work, i, { ...s.work[i], [next.key]: next.want }), helped: setAt(s.helped, i, true) };
          }
          const order = q.calc === "bagi" ? [...Array(W).keys()] : [...Array(W).keys()].reverse(), k = order.find(j => cur[j] !== want[j]);
          if (k !== undefined) { cur[k] = want[k]; return { answers: setAt(s.answers, i, cur.join("")), helped: setAt(s.helped, i, true) }; }
          if (q.withRem && s.rems[i] !== String(q.rem ?? 0)) return { rems: setAt(s.rems, i, String(q.rem ?? 0)), helped: setAt(s.helped, i, true) };
          return {};
        });
        return <li key={`${save.date}-${op}-${level}-${i}`} data-testid={`bersusun-${i}`} className={`overflow-hidden rounded-2xl bg-white ring-1 ${checked ? (ok ? "ring-2 ring-[#2b8a3e]" : "ring-2 ring-[#e03131]") : "ring-[var(--g)]"}`}>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 bg-[var(--s)] px-4 py-2 font-bold"><span className="flex size-7 items-center justify-center rounded-full bg-[var(--c)] text-sm text-white"><span className="sr-only">Soal </span>{i + 1}</span><span>{q.story ? "Soal cerita" : `${q.a} ${SIGN[q.calc]} ${q.b}`}</span>{q.long && !q.story && <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[var(--c)]">porogapit</span>}{q.long && level === 3 && !q.story && <span className="text-xs font-normal text-[#5b6f66]">kotak langkah boleh dilewati</span>}
            {checked && <span className={`ms-auto flex items-center gap-1 text-sm ${ok ? "text-[#2b8a3e]" : "text-[#c92a2a]"}`} aria-hidden="true">{ok ? <Check className="size-4" /> : <X className="size-4" />}{ok ? "Benar" : "Belum tepat"}</span>}</p>
          <div className="p-4 pt-3">
          {q.story && <><p className="leading-7">{q.story}</p>
            <div role="radiogroup" aria-label={`Operasi soal ${i + 1}`} className="mt-2 flex flex-wrap items-center gap-2"><span className="text-sm font-bold">Operasinya:</span>
              {(["tambah", "kurang", "kali", "bagi"] as Calc[]).map(c => <button key={c} type="button" role="radio" aria-checked={chosen === c} aria-label={`Operasi ${COL_OPS.find(o => o.id === c)!.name}`} disabled={checked}
                onClick={() => upd(i, s => ({ ops: setAt(s.ops, i, c), answers: setAt(s.answers, i, ""), rems: setAt(s.rems, i, ""), work: setAt(s.work, i, {}) }))}
                className={`flex size-10 items-center justify-center rounded-lg text-lg font-bold ${chosen === c ? "bg-[var(--c)] text-white" : "bg-[var(--s)] text-[var(--c)]"}`}>{SIGN[c]}</button>)}</div>
            {!chosen && <p className="mt-2 text-sm text-[#4b5f57]">Pilih operasi dulu untuk menampilkan kolom hitung.</p>}</>}
          {chosen && <div className={`mt-3 flex justify-center overflow-x-auto rounded-xl px-2 py-3 ring-1 ring-[var(--g)] ${GRID_PAPER}`}>
            <Column key={chosen} id={String(i + 1)} q={shown} pad={pad} rem={save.rems[i]} setRem={r => upd(i, s => ({ rems: setAt(s.rems, i, r) }))}
              cells={save.answers[i]} setCells={c => upd(i, s => ({ answers: setAt(s.answers, i, c) }))} checked={checked} carry={carry}
              work={save.work[i]} setWork={w => upd(i, s => ({ work: setAt(s.work, i, w) }))} />
          </div>}
          {chosen && <div className="mt-3 flex flex-wrap items-center gap-2">
            {!checked ? <button type="button" className="btn rounded-full border-0 bg-[var(--c)] px-6 text-white hover:bg-[var(--c)] hover:brightness-110" disabled={!full}
              onClick={() => upd(i, s => ({ checked: setAt(s.checked, i, true) }))}>Periksa</button>
              : <button type="button" className="btn btn-sm rounded-full border-[var(--c)] bg-white text-[var(--c)]" onClick={() => { upd(i, s => ({ checked: setAt(s.checked, i, false), answers: setAt(s.answers, i, ""), rems: setAt(s.rems, i, ""), work: setAt(s.work, i, {}) })); setOpen(null); }}><RotateCcw className="size-4" aria-hidden="true" />Coba lagi</button>}
            {!checked && <button type="button" className="btn btn-sm rounded-full border-0 bg-[var(--s)] text-[var(--c)] hover:bg-[var(--s)] hover:brightness-95" onClick={assist}><Hand className="size-4" aria-hidden="true" />Bantu satu langkah</button>}
            {save.helped[i] && <span className="text-xs text-[#4b5f57]">Dibantu, tanpa bintang</span>}
            {checked && <p role="status" className={`flex items-center gap-1 font-bold ${ok ? "text-[#2b8a3e]" : "text-[#c92a2a]"}`}>{ok ? <><Check className="size-5" aria-hidden="true" />Tepat! {q.answer}{q.withRem ? ` sisa ${q.rem ?? 0}` : ""}{q.storyUnit ? ` ${q.storyUnit}` : ""}.</> : <><X className="size-5" aria-hidden="true" />{chosen !== q.calc ? "Operasinya belum tepat." : "Ada kotak yang belum tepat."}</>}</p>}
            {checked && !ok && <button type="button" className="link text-sm font-bold" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>Lihat pembahasan</button>}
          </div>}
          {checked && !ok && open === i && <ol className="mt-2 list-decimal space-y-0.5 rounded-lg border-s-4 border-[#f0b429] bg-[#fff8e1] p-3 ps-8 text-sm leading-6">
            {chosen !== q.calc && <li>Soal ini memakai operasi {COL_OPS.find(o => o.id === q.calc)!.name.toLowerCase()}: {q.a} {SIGN[q.calc]} {q.b}.</li>}
            {steps(q).map(s => <li key={s}>{s}</li>)}<li>Jawaban: {q.answer}{q.withRem ? ` sisa ${q.rem ?? 0}` : ""}{q.storyUnit ? ` ${q.storyUnit}` : ""}.</li></ol>}
          </div>
        </li>; })}</ol>}

      {save && <div className={`mt-5 ${card} p-4`} role="status">
        <p className="font-bold">Benar {right} dari {COUNT}, {done} soal sudah diperiksa</p>
        <progress className="progress mt-2 h-2.5 w-full text-[var(--c)] [&::-webkit-progress-value]:bg-[var(--c)] [&::-moz-progress-bar]:bg-[var(--c)]" value={right} max={COUNT} aria-label="Soal benar" />
        {done === COUNT && <div className="mt-3"><SaveResult kind="harian" part={`${opName}, ${lv.name}, ${dateText}`} correct={right} total={COUNT} title="Berhitung Bersusun" once={`bersusun-${op}-${level}-${save.date}`} /></div>}
        <p className="mt-2 text-xs text-[#4b5f57]">{stored ? "Jawaban tersimpan di perangkat ini." : ""} Coba juga <Link href="/mastering-penjumlahan-pengurangan/level-1" className="link">mastering penjumlahan</Link> dan <Link href="/mastering-perkalian-pembagian/level-1" className="link">perkalian</Link>.</p>
      </div>}
      </section>
      </div>
    </div>
    {pad && <div role="group" aria-label="Papan angka" className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-[var(--c)] bg-white/95 px-2 py-2 shadow-[0_-4px_16px_rgba(23,53,42,0.08)] backdrop-blur print:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map(d => <button key={d} type="button" aria-label={`Angka ${d}`} onPointerDown={e => e.preventDefault()} onClick={() => active.current?.current?.type(d)}
          className="h-11 rounded-lg bg-[var(--s)] text-xl font-bold text-[var(--c)] active:bg-[var(--c)] active:text-white">{d}</button>)}
        <button type="button" aria-label="Hapus" onPointerDown={e => e.preventDefault()} onClick={() => active.current?.current?.back()} className="col-span-2 flex h-11 items-center justify-center rounded-lg bg-[#fff0f0] text-[#c92a2a] ring-1 ring-[#ffc9c9]"><Delete className="size-6" aria-hidden="true" /></button>
      </div>
    </div>}
  </main>;
}
