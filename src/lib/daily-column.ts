/**
 * Berhitung bersusun harian: tujuh soal per operasi dan level, berganti setiap pukul 00.00 WIB.
 * Soal ditentukan dari tanggal, operasi, dan level, jadi semua anak mendapat soal yang sama pada hari yang sama.
 */
export type ColOp = "tambah" | "kurang" | "kali" | "bagi" | "cerita";
export type Calc = "tambah" | "kurang" | "kali" | "bagi";
export type ColLevel = 1 | 2 | 3;
export type ColQuestion = { calc: Calc; a: number; b: number; answer: number; story?: string; storyUnit?: string };

export const COL_OPS: { id: ColOp; name: string; sign: string }[] = [
  { id: "tambah", name: "Tambah", sign: "+" }, { id: "kurang", name: "Kurang", sign: "−" }, { id: "kali", name: "Kali", sign: "×" },
  { id: "bagi", name: "Bagi", sign: ":" }, { id: "cerita", name: "Soal cerita", sign: "?" },
];
export const COL_LEVELS: { id: ColLevel; name: string; grade: string }[] = [
  { id: 1, name: "Mudah", grade: "Kelas 2–3" }, { id: 2, name: "Sedang", grade: "Kelas 3–4" }, { id: 3, name: "Sulit", grade: "Kelas 4–6" },
];
export const SIGN: Record<Calc, string> = { tambah: "+", kurang: "−", kali: "×", bagi: ":" };
export const COUNT = 7;

export function wibDate(now = new Date()): string { return new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10); }
export const validDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

function rng(seed: number) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const digits = (n: number) => String(n).split("").map(Number);
/** Banyak simpanan pada penjumlahan dan banyak pinjaman pada pengurangan. */
export const carries = (a: number, b: number) => { let c = 0, n = 0; const x = digits(a).reverse(), y = digits(b).reverse(); for (let i = 0; i < Math.max(x.length, y.length); i++) { const s = (x[i] ?? 0) + (y[i] ?? 0) + c; c = s >= 10 ? 1 : 0; n += c; } return n; };
export const borrows = (a: number, b: number) => { let br = 0, n = 0; const x = digits(a).reverse(), y = digits(b).reverse(); for (let i = 0; i < x.length; i++) { const d = x[i] - (y[i] ?? 0) - br; br = d < 0 ? 1 : 0; n += br; } return n; };

const RANGE: Record<Calc, Record<ColLevel, () => [number, number, number, number]>> = {
  tambah: { 1: () => [10, 89, 10, 89], 2: () => [100, 899, 100, 899], 3: () => [1000, 8999, 1000, 8999] },
  kurang: { 1: () => [30, 99, 10, 89], 2: () => [300, 999, 100, 899], 3: () => [3000, 9999, 1000, 8999] },
  kali: { 1: () => [12, 49, 2, 5], 2: () => [102, 499, 3, 9], 3: () => [12, 99, 12, 49] },
  bagi: { 1: () => [11, 40, 2, 5], 2: () => [21, 199, 3, 9], 3: () => [101, 999, 4, 9] },
};
/** Satu soal hitung: penjumlahan dan pengurangan selalu memuat simpanan atau pinjaman agar kotak simpanan terpakai. */
function makeCalc(calc: Calc, level: ColLevel, r: () => number): ColQuestion {
  const [a0, a1, b0, b1] = RANGE[calc][level]();
  for (let k = 0; k < 400; k++) {
    let a = int(r, a0, a1), b = int(r, b0, b1);
    if (calc === "tambah") { if (carries(a, b) >= (level === 1 ? 1 : 2)) return { calc, a, b, answer: a + b }; continue; }
    if (calc === "kurang") { if (b > a) [a, b] = [b, a]; if (a - b >= 10 && borrows(a, b) >= (level === 1 ? 1 : 2)) return { calc, a, b, answer: a - b }; continue; }
    if (calc === "kali") { if (a % 10 !== 0 && b % 10 !== 0) return { calc, a, b, answer: a * b }; continue; }
    // Bagi: a adalah hasil bagi, dikalikan b untuk mendapat bilangan yang dibagi (habis dibagi, tanpa sisa).
    const total = a * b; if (total < 10000 && String(total).length >= 2) return { calc, a: total, b, answer: a };
  }
  throw new Error("Soal tidak dapat dibuat");
}

/* Soal cerita: setiap templat memberi operasi dan rentang bilangannya sendiri. */
type Story = { calc: Calc; text: (a: number, b: number) => string; unit: string };
const STORIES: Story[] = [
  { calc: "tambah", unit: "buku", text: (a, b) => `Perpustakaan kelas punya ${a} buku. Hari ini datang kiriman ${b} buku lagi. Berapa banyak buku sekarang?` },
  { calc: "tambah", unit: "pengunjung", text: (a, b) => `Pada hari Sabtu ada ${a} pengunjung taman kota, dan pada hari Minggu ada ${b} pengunjung. Berapa pengunjung selama dua hari itu?` },
  { calc: "tambah", unit: "kg", text: (a, b) => `Pak Tani memanen ${a} kg jagung minggu lalu dan ${b} kg minggu ini. Berapa kg jagung yang dipanen seluruhnya?` },
  { calc: "kurang", unit: "kue", text: (a, b) => `Bu Rina membuat ${a} kue untuk dijual. Sampai sore, ${b} kue sudah terjual. Berapa kue yang belum terjual?` },
  { calc: "kurang", unit: "halaman", text: (a, b) => `Sebuah buku cerita tebalnya ${a} halaman. Dina sudah membaca ${b} halaman. Berapa halaman lagi yang belum dibaca?` },
  { calc: "kurang", unit: "rupiah", text: (a, b) => `Tabungan Raka ${a} ribu rupiah. Ia membeli tas seharga ${b} ribu rupiah. Berapa ribu rupiah sisa tabungannya?` },
  { calc: "kali", unit: "pensil", text: (a, b) => `Setiap kotak berisi ${a} pensil. Guru membeli ${b} kotak. Berapa banyak pensil seluruhnya?` },
  { calc: "kali", unit: "kursi", text: (a, b) => `Di aula ada ${b} baris kursi. Setiap baris berisi ${a} kursi. Berapa kursi di aula itu?` },
  { calc: "kali", unit: "telur", text: (a, b) => `Peternak mengemas telur ke dalam ${b} rak. Setiap rak berisi ${a} telur. Berapa banyak telur seluruhnya?` },
  { calc: "bagi", unit: "permen", text: (a, b) => `Ada ${a} permen yang dibagikan sama banyak kepada ${b} anak. Berapa permen yang diterima setiap anak?` },
  { calc: "bagi", unit: "kelompok", text: (a, b) => `Sebanyak ${a} siswa dibagi menjadi kelompok yang masing-masing berisi ${b} siswa. Berapa kelompok yang terbentuk?` },
  { calc: "bagi", unit: "botol", text: (a, b) => `Ibu menuang ${a} liter jus ke dalam botol yang masing-masing berisi ${b} liter. Berapa botol yang terisi penuh?` },
];

export function dailyColumn(date: string, op: ColOp, level: ColLevel): ColQuestion[] {
  if (!validDate(date)) throw new Error("Tanggal tidak valid");
  const day = Math.floor(Date.parse(date) / 86400000), opIndex = COL_OPS.findIndex(o => o.id === op);
  const r = rng(day * 7919 + opIndex * 104729 + level * 1301);
  const out: ColQuestion[] = [], seen = new Set<string>();
  if (op === "cerita") {
    // Urutkan templat dengan acak tetapi pastikan keempat operasi muncul.
    const order = STORIES.map((s, i) => ({ s, i, k: r() })).sort((x, y) => x.k - y.k).map(x => x.s);
    const pick = (["tambah", "kurang", "kali", "bagi"] as Calc[]).map(c => order.find(s => s.calc === c)!);
    for (const s of order) if (pick.length < COUNT && !pick.includes(s)) pick.push(s);
    const shuffled = pick.map(s => ({ s, k: r() })).sort((x, y) => x.k - y.k).map(x => x.s);
    for (const s of shuffled) { const c = makeCalc(s.calc, level, r); out.push({ ...c, story: s.text(c.a, c.b), storyUnit: s.unit }); }
    return out;
  }
  while (out.length < COUNT) { const c = makeCalc(op, level, r), key = `${c.a}${c.b}`; if (!seen.has(key)) { seen.add(key); out.push(c); } }
  return out;
}

/* ---------- Kotak jawaban ---------- */
/** Penjumlahan, pengurangan, perkalian satu angka: angka hasil per kolom, dari kanan ke kiri. */
export const answerWidth = (q: ColQuestion) => String(q.answer).length;
/** Perkalian dua angka: hasil kali sebagian per baris. */
export const partials = (q: ColQuestion) => (q.calc === "kali" && q.b >= 10 ? digits(q.b).reverse().map((d, i) => q.a * d * 10 ** i) : []);
export const isCorrect = (q: ColQuestion, cells: string) => cells.length === answerWidth(q) && !cells.includes(".") && Number(cells) === q.answer;

/** Langkah per kolom untuk pembahasan. */
export function steps(q: ColQuestion): string[] {
  const place = ["satuan", "puluhan", "ratusan", "ribuan", "puluh ribuan"];
  const x = digits(q.a).reverse(), y = digits(q.b).reverse(), out: string[] = [];
  if (q.calc === "tambah") { let c = 0; for (let i = 0; i < Math.max(x.length, y.length); i++) { const s = (x[i] ?? 0) + (y[i] ?? 0) + c; out.push(`Kolom ${place[i]}: ${x[i] ?? 0} + ${y[i] ?? 0}${c ? " + 1 (simpanan)" : ""} = ${s}${s >= 10 ? `, tulis ${s % 10}, simpan 1` : `, tulis ${s}`}.`); c = s >= 10 ? 1 : 0; } if (c) out.push("Simpanan 1 ditulis di kolom paling kiri."); }
  if (q.calc === "kurang") { let br = 0; for (let i = 0; i < x.length; i++) { let top = x[i] - br, note = ""; br = 0; if (top < (y[i] ?? 0)) { top += 10; br = 1; note = ` (pinjam 1 dari kolom ${place[i + 1]}, jadi ${top})`; } out.push(`Kolom ${place[i]}: ${top} − ${y[i] ?? 0}${note} = ${top - (y[i] ?? 0)}.`); } }
  if (q.calc === "kali" && q.b < 10) { let c = 0; for (let i = 0; i < x.length; i++) { const s = x[i] * q.b + c; out.push(`Kolom ${place[i]}: ${x[i]} × ${q.b}${c ? ` + ${c} (simpanan)` : ""} = ${s}${s >= 10 && i < x.length - 1 ? `, tulis ${s % 10}, simpan ${Math.floor(s / 10)}` : `, tulis ${s}`}.`); c = Math.floor(s / 10); } }
  if (q.calc === "kali" && q.b >= 10) { partials(q).forEach((p, i) => out.push(`${q.a} × ${digits(q.b).reverse()[i]}${i ? "0" : ""} = ${p}.`)); out.push(`Jumlahkan: ${partials(q).join(" + ")} = ${q.answer}.`); }
  if (q.calc === "bagi") { let rem = 0; digits(q.a).forEach((d, i) => { const cur = rem * 10 + d, qd = Math.floor(cur / q.b); if (i > 0 || qd > 0) out.push(`${cur} : ${q.b} = ${qd}${cur - qd * q.b ? `, sisa ${cur - qd * q.b} diturunkan` : ""}.`); else out.push(`${d} lebih kecil dari ${q.b}, ambil satu angka lagi.`); rem = cur - qd * q.b; }); }
  return out;
}

/* ---------- Penyimpanan ---------- */
/** answers[i]: isi kotak hasil dari kiri ke kanan, "." untuk kotak kosong. ops[i]: operasi yang dipilih pada soal cerita. */
export type SavedColumn = { date: string; answers: string[]; ops: string[]; checked: boolean[] };
export const columnKey = (op: ColOp, level: ColLevel) => `bsk-bersusun-v1-${op}-${level}`;
export const emptyColumn = (date: string): SavedColumn => ({ date, answers: Array(COUNT).fill(""), ops: Array(COUNT).fill(""), checked: Array(COUNT).fill(false) });
export const cellsToNumber = (cells: string) => cells.replace(/\./g, "");
export function readColumn(raw: string | null): SavedColumn | null {
  try {
    const v = JSON.parse(raw ?? "null");
    if (!v || !validDate(v.date) || !Array.isArray(v.answers) || v.answers.length !== COUNT) return null;
    const list = (x: unknown, f: (y: unknown) => string) => Array.from({ length: COUNT }, (_, i) => (Array.isArray(x) ? f(x[i]) : ""));
    return { date: v.date, answers: list(v.answers, a => (typeof a === "string" ? a.replace(/[^0-9.]/g, "").slice(0, 8) : "")),
      ops: list(v.ops, a => (typeof a === "string" && ["tambah", "kurang", "kali", "bagi"].includes(a) ? a : "")),
      checked: Array.from({ length: COUNT }, (_, i) => Array.isArray(v.checked) && v.checked[i] === true) };
  } catch { return null; }
}
