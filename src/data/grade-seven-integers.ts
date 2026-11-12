import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 7 Bab 1 - Bilangan Bulat (Buku Matematika SMP/MTs Kelas VII, Kurikulum Merdeka 2022, hlm. 1-34).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Hitungan ---------- */
const group = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
/** Bilangan bulat dengan tanda minus tipografis. */
export const show = (n: number) => (n < 0 ? `−${group(-n)}` : group(n));
export const isPrime = (n: number) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
export const factorsOf = (n: number) => { const a = Math.abs(n), out: number[] = []; for (let k = 1; k <= a; k++) if (a % k === 0) out.push(k); return out; };
/** Pasangan faktor positif dan negatif, misalnya 12: (1,12), (2,6), (3,4), (−1,−12), ... */
export const factorPairs = (n: number) => { const pos = factorsOf(n).filter(k => k * k <= n).map(k => [k, n / k] as [number, number]); return [...pos, ...pos.map(([a, b]) => [-a, -b] as [number, number])]; };
export const primeExponents = (n: number, primes: number[]) => primes.map(p => { let e = 0, m = n; while (m % p === 0) { m /= p; e++; } return e; });
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (...xs: number[]) => xs.reduce((a, b) => (a * b) / gcd(a, b));

/* ---------- Gambar ---------- */
export type Weather = "salju" | "hujan" | "berawan" | "cerah" | "kabut";
export type Scene =
  | { type: "weather"; items: { city: string; temp: number; weather: Weather }[] }
  | { type: "text"; lines: string[] }
  | { type: "rules"; rows: [string, string, string][] }
  | { type: "bank"; owner: string; rows: { month: string; debit: number | null; credit: number | null }[] }
  | { type: "ac"; temp: number; buttons: number[] }
  | { type: "tree"; n: number }
  | { type: "thermo"; temp: number }
  | { type: "line"; min: number; max: number; step: number; marks: { v: number; label: string }[] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "number"; label: string; answer: number; unit?: string }
  | { kind: "items"; items: { label: string; answer: number; unit?: string }[] }
  | { kind: "signs"; pairs: [number, number][] }
  | { kind: "order"; label: string; options: number[]; answer: number[] }
  /** Meletakkan titik pada garis bilangan. */
  | { kind: "place"; min: number; max: number; step: number; items: { label: string; value: number }[] }
  /** Mengetuk semua pilihan yang tepat. */
  | { kind: "select"; label: string; options: string[]; answer: number[] }
  /** Pasangan faktor: urutan bebas. */
  | { kind: "pairs"; n: number }
  /** Faktorisasi prima dalam bentuk pangkat. */
  | { kind: "primeExp"; n: number; primes: number[] }
  /** Tabel dengan isian kosong (null). */
  | { kind: "table"; head: string[]; rows: (string | null)[][]; answers: number[] }
  /** Tombol pengatur suhu: hasil kali angka pada tombol. */
  | { kind: "dials"; target: number; count: number; min: number; max: number; primesOnly?: boolean; sample: number[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type IQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

const pairCount = (n: number) => factorPairs(n).length;
export const fieldCount = (p: Part) => {
  switch (p.kind) {
    case "items": return p.items.length;
    case "signs": return p.pairs.length;
    case "place": return p.items.length;
    case "pairs": return pairCount(p.n) * 2;
    case "primeExp": return p.primes.length;
    case "table": return p.answers.length;
    case "dials": return p.count;
    case "tf": return p.statements.length;
    default: return 1;
  }
};
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "number": return [String(p.answer)];
    case "items": return p.items.map(i => String(i.answer));
    case "signs": return p.pairs.map(([a, b]) => (a > b ? ">" : "<"));
    case "order": return [p.answer.join(";")];
    case "place": return p.items.map(i => String(i.value));
    case "select": return [p.answer.join(",")];
    case "pairs": return factorPairs(p.n).flat().map(String);
    case "primeExp": return primeExponents(p.n, p.primes).map(String);
    case "table": return p.answers.map(String);
    case "dials": return p.sample.map(String);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
export const int = (v: string | undefined) => (v !== undefined && /^-?\d+$/.test(v.trim()) ? Number(v) : NaN);
const numericKinds = new Set(["number", "items", "place", "primeExp", "table"]);
/** Pasangan faktor diterima dalam urutan apa pun, asal semua pasangan lengkap dan tidak ganda. */
export function pairsOk(n: number, x: string[]) {
  const got = Array.from({ length: x.length / 2 }, (_, k) => [int(x[2 * k]), int(x[2 * k + 1])]);
  if (got.some(([a, b]) => Number.isNaN(a) || Number.isNaN(b) || a * b !== n)) return false;
  const key = ([a, b]: number[]) => (Math.abs(a) <= Math.abs(b) ? `${a},${b}` : `${b},${a}`);
  const want = new Set(factorPairs(n).map(key)), have = new Set(got.map(key));
  return have.size === want.size && [...want].every(k => have.has(k));
}
export function dialsOk(p: Extract<Part, { kind: "dials" }>, x: string[]) {
  const v = x.map(int);
  if (v.some(a => Number.isNaN(a) || a < p.min || a > p.max)) return false;
  if (p.primesOnly && !v.every(isPrime)) return false;
  return v.reduce((a, b) => a * b, 1) === p.target;
}
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "pairs") return pairsOk(p.n, x);
  if (p.kind === "dials") return dialsOk(p, x);
  if (p.kind === "order" || p.kind === "select" || p.kind === "choice") return v === fields(p)[0];
  const want = fields(p);
  return numericKinds.has(p.kind) ? want.every((w, i) => int(x[i]) === Number(w)) : x.join("|") === want.join("|");
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "order") return v.split(";").filter(Boolean).length === p.options.length;
  if (p.kind === "select") return v.length > 0;
  if (p.kind === "choice") return v.length > 0;
  if (p.kind === "signs" || p.kind === "tf") return x.every(Boolean);
  return x.every(y => !Number.isNaN(int(y)));
}
export const correct = (q: IQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: IQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: IQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => (Number.isNaN(int(s)) ? "…" : show(int(s)));
    switch (p.kind) {
      case "number": return `${p.label} ${d(x[0])}${p.unit ? ` ${p.unit}` : ""}`;
      case "items": return p.items.map((it, k) => `${it.label} ${d(x[k])}${it.unit ? ` ${it.unit}` : ""}`).join(", ");
      case "signs": return p.pairs.map(([a, b], k) => `${show(a)} ${x[k] || "…"} ${show(b)}`).join(", ");
      case "order": return v[i] ? v[i].split(";").map(s => show(Number(s))).join(", ") : "…";
      case "place": return p.items.map((it, k) => `${it.label} di ${d(x[k])}`).join(", ");
      case "select": return v[i] ? v[i].split(",").map(k => p.options[Number(k)]).join(", ") : "…";
      case "pairs": return Array.from({ length: x.length / 2 }, (_, k) => `(${d(x[2 * k])}, ${d(x[2 * k + 1])})`).join(", ");
      case "primeExp": return p.primes.map((pr, k) => `${pr}^${x[k] || "…"}`).join(" × ");
      case "table": return x.map(d).join(", ");
      case "dials": return x.map(d).join(" × ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return v[i] || "…";
    }
  }).join(" | ");
}

/* ---------- Data bersama ---------- */
const q = (topic: IQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): IQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
export const transferRules: [string, string, string][] = [
  ["Mendapatkan pemain bagus", "+(+1)", "Performa naik"], ["Mendapatkan pemain buruk", "+(−1)", "Performa turun"],
  ["Melepaskan pemain bagus", "−(+1)", "Performa turun"], ["Melepaskan pemain buruk", "−(−1)", "Performa naik"],
  ["Mendapatkan pelatih bagus", "+(+3)", "Performa naik"], ["Mendapatkan pelatih buruk", "+(−3)", "Performa turun"],
  ["Melepaskan pelatih bagus", "−(+3)", "Performa turun"], ["Melepaskan pelatih buruk", "−(−3)", "Performa naik"],
];
const cities = [
  { city: "Moskow, Rusia", temp: -15, weather: "salju" as const }, { city: "Seoul, Korea Selatan", temp: -5, weather: "berawan" as const },
  { city: "Tokyo, Jepang", temp: 5, weather: "cerah" as const }, { city: "Bandung, Jawa Barat", temp: 20, weather: "hujan" as const },
  { city: "Kupang, NTT", temp: 30, weather: "cerah" as const },
];
const cities2 = [
  { city: "Yakutsk, Rusia", temp: -28, weather: "salju" as const }, { city: "Zermatt, Swiss", temp: -9, weather: "salju" as const },
  { city: "Seoul, Korea Selatan", temp: -3, weather: "berawan" as const }, { city: "Sapporo, Jepang", temp: -6, weather: "salju" as const },
  { city: "London, Inggris", temp: 4, weather: "kabut" as const }, { city: "Kota Kupang, NTT", temp: 31, weather: "cerah" as const },
];
const effects = ["Performa naik", "Performa turun", "Performa tetap"];
const bank = { owner: "Haris", rows: [{ month: "Januari", debit: 125000, credit: 300000 }, { month: "Februari", debit: null, credit: 150000 }] };

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Memahami Bilangan Bulat", short: "Memahami bilangan bulat",
    steps: [
      "Bilangan bulat terdiri atas bilangan bulat negatif (…, −3, −2, −1), nol, dan bilangan bulat positif (1, 2, 3, …). Nol dan bilangan bulat positif disebut bilangan cacah.",
      "Tanda negatif dipakai untuk suhu di bawah 0°C, kedalaman di bawah permukaan laut, utang, kerugian, atau berat yang berkurang. Tanda positif untuk kebalikannya.",
      "Pada garis bilangan, bilangan di sebelah kanan selalu lebih besar. Jadi −3 > −8 karena −3 berada di kanan −8, walaupun angka 3 lebih kecil dari 8.",
      "Setiap bilangan punya lawan (invers penjumlahan) yang berjarak sama dari 0: lawan dari 7 adalah −7. Jumlah suatu bilangan dan lawannya selalu 0.",
    ],
    demo: "Naikkan atau turunkan suhu termometer. Perhatikan letaknya pada garis bilangan, lalu bandingkan dengan suhu kota lain.",
  },
  {
    code: "B", title: "Operasi Hitung Bilangan Bulat", short: "Operasi hitung",
    steps: [
      "Menambah bilangan positif bergerak ke kanan, menambah bilangan negatif bergerak ke kiri. Contoh 3 + (−5) = −2.",
      "Mengurangi sama dengan menambah lawannya: a − b = a + (−b). Jadi 3 − (−5) = 3 + 5 = 8, seperti melepaskan pemain buruk yang membuat performa naik.",
      "Perkalian: tanda sama hasilnya positif, tanda berbeda hasilnya negatif. (−2) × (−5) = 10 dan (−2) × 5 = −10. Pembagian mengikuti aturan tanda yang sama.",
      "Penjumlahan dan perkalian bersifat komutatif (a + b = b + a) dan asosiatif. Pengurangan dan pembagian tidak. Pada operasi campuran, kerjakan perkalian dan pembagian lebih dulu, kecuali ada tanda kurung.",
    ],
    demo: "Pilih operasi, lalu atur kedua bilangan. Panah biru menunjukkan bilangan kedua; panah oranye menunjukkan hasilnya pada garis bilangan.",
  },
  {
    code: "C", title: "Faktor Bilangan Bulat", short: "Faktor bilangan bulat",
    steps: [
      "Faktor suatu bilangan adalah bilangan yang membaginya habis. Faktor 12 adalah 1, 2, 3, 4, 6, 12, −1, −2, −3, −4, −6, −12.",
      "Pasangan faktor adalah dua bilangan yang hasil kalinya bilangan itu: (1, 12), (2, 6), (3, 4), (−1, −12), (−2, −6), (−3, −4).",
      "Faktorisasi prima menulis bilangan sebagai perkalian bilangan prima, misalnya dengan pohon faktor: 12 = 2 × 2 × 3 = 2² × 3.",
      "FPB adalah faktor persekutuan terbesar, dipakai untuk membagi rata sebanyak-banyaknya. KPK adalah kelipatan persekutuan terkecil, dipakai untuk mencari kapan kejadian berulang terjadi bersamaan lagi.",
    ],
    demo: "Ketuk bilangan prima untuk menurunkan pohon faktor sampai semua ujungnya prima. Lalu coba FPB dan KPK dua bilangan.",
  },
] as const;

/* ---------- Latihan ---------- */
export const practice: IQuestion[][] = [
  [
    q(0, "Nyatakan setiap kejadian dengan bilangan bulat positif atau negatif.", [{ kind: "items", items: [
      { label: "a. Lia menyetor tabungan Rp150.000,00:", answer: 150000 }, { label: "b. Dino meminjam uang Rp75.000,00:", answer: -75000 }, { label: "c. Toko rugi Rp300.000,00:", answer: -300000 },
    ] }], "Menyetor atau menambah bernilai positif. Meminjam (utang) dan rugi bernilai negatif."),
    q(0, "Isilah dengan tanda > (lebih dari) atau < (kurang dari).", [{ kind: "signs", pairs: [[-253, 108], [38, -79], [-1000, -500]] }],
      "Bilangan negatif selalu kurang dari bilangan positif. −1.000 berada di kiri −500, jadi −1.000 < −500."),
    q(0, "Urutkan bilangan bulat berikut dari yang terkecil ke yang terbesar.", [{ kind: "order", label: "Terkecil ke terbesar", options: [-9, 5, -3, 14], answer: [-9, -3, 5, 14] }],
      "Dari kiri ke kanan pada garis bilangan: −9, −3, 5, 14."),
    q(0, "Letakkan suhu keempat kota pada garis bilangan.", [{ kind: "place", min: -20, max: 20, step: 5, items: [{ label: "Moskow", value: -15 }, { label: "Seoul", value: -5 }, { label: "Tokyo", value: 5 }, { label: "Paris", value: 10 }] }],
      "Suhu negatif di sebelah kiri 0: Moskow −15, Seoul −5. Tokyo 5 dan Paris 10 di sebelah kanan 0.",
      { scene: { type: "weather", items: [cities[0], cities[1], cities[2], { city: "Paris, Prancis", temp: 10, weather: "berawan" }] } }),
  ],
  [
    q(1, "Tuliskan hasil operasi hitung berikut.", [{ kind: "items", items: [{ label: "a. 3 + (−8) − 6 =", answer: -11 }, { label: "b. (−6) × (−4) : 3 =", answer: 8 }] }],
      "a. 3 + (−8) = −5, lalu −5 − 6 = −11. b. (−6) × (−4) = 24, lalu 24 : 3 = 8."),
    q(1, "Klub A mendapatkan 4 pemain bagus dan mendapatkan 3 pemain buruk. Tentukan perhitungan nilai dan efek performanya.", [{ kind: "number", label: "Perhitungan nilai:", answer: 1 }, { kind: "choice", label: "Efek performa", options: effects, answer: "Performa naik" }],
      "4 × (+1) + 3 × (−1) = 4 − 3 = +1. Nilainya positif, jadi performa naik.", { scene: { type: "rules", rows: transferRules.slice(0, 4) } }),
    q(1, "Lengkapi tabel perubahan suhu mesin pendingin ruang.", [{ kind: "table", head: ["Suhu sekarang (°C)", "Tombol yang ditekan", "Suhu baru (°C)"], rows: [["5", "× (−3)", null], [null, "× (+2)", "−8"], ["−3", null, "12"]], answers: [-15, -4, -4] }],
      "5 × (−3) = −15. Suhu sekarang × 2 = −8, jadi suhunya −4. −3 × tombol = 12, jadi tombolnya × (−4).", { scene: { type: "ac", temp: 5, buttons: [-4, -3, -2, 2, 3, 4] } }),
    q(1, "Dalam 4 bulan, seorang YouTuber kehilangan 240 subscriber dengan jumlah yang sama setiap bulan. Berapa perubahan subscriber setiap bulan? Nyatakan dengan bilangan bulat.", [{ kind: "number", label: "Perubahan setiap bulan:", answer: -60 }],
      "Berkurang 240 dalam 4 bulan: (−240) : 4 = −60 setiap bulan."),
  ],
  [
    q(2, "Ketuk semua faktor dari 20, termasuk faktor negatif.", [{ kind: "select", label: "Faktor 20", options: ["1", "2", "3", "4", "5", "6", "8", "10", "20", "−1", "−2", "−3", "−4", "−5", "−8", "−10", "−20"], answer: [0, 1, 3, 4, 7, 8, 9, 10, 12, 13, 15, 16] }],
      "Faktor 20: 1, 2, 4, 5, 10, 20 dan lawannya −1, −2, −4, −5, −10, −20. Angka 3, 6, dan 8 tidak membagi 20 habis."),
    q(2, "Tuliskan semua pasangan faktor dari 15, termasuk pasangan negatif.", [{ kind: "pairs", n: 15 }],
      "(1, 15), (3, 5), (−1, −15), (−3, −5)."),
    q(2, "Buat pohon faktor untuk 36, lalu tuliskan faktorisasi primanya dalam bentuk pangkat.", [{ kind: "primeExp", n: 36, primes: [2, 3, 5] }],
      "36 = 2 × 18 = 2 × 2 × 9 = 2 × 2 × 3 × 3 = 2² × 3². Pangkat 5 adalah 0.", { scene: { type: "tree", n: 36 } }),
    q(2, "Klub sains beranggotakan 18 siswa putri dan 30 siswa putra. Setiap kelompok berisi banyak putri yang sama dan banyak putra yang sama. Berapa kelompok paling banyak?", [{ kind: "number", label: "Banyak kelompok:", answer: 6 }],
      "FPB(18, 30): 18 = 2 × 3², 30 = 2 × 3 × 5. FPB = 2 × 3 = 6 kelompok."),
  ],
];

/* ---------- Evaluasi: 24 soal, A, B, C bergantian ---------- */
export const assessment: IQuestion[] = [
  // Sedang (1-8)
  q(0, "Tuliskan perkiraan letak suhu setiap kota pada garis bilangan.", [{ kind: "place", min: -30, max: 30, step: 5, items: cities.map(c => ({ label: c.city.split(",")[0], value: c.temp })) }],
    "Moskow −15 dan Seoul −5 di kiri 0. Tokyo 5, Bandung 20, Kupang 30 di kanan 0.", { level: "Sedang", scene: { type: "weather", items: cities } }),
  q(1, "Tuliskan hasil operasi hitung berikut.", [{ kind: "items", items: [{ label: "a. 4 + (−9) − 5 =", answer: -10 }, { label: "b. (−3) × 8 : (−6) =", answer: 4 }] }],
    "a. 4 + (−9) = −5, −5 − 5 = −10. b. (−3) × 8 = −24, (−24) : (−6) = 4.", { level: "Sedang" }),
  q(2, "Tuliskan semua pasangan faktor dari 21, termasuk pasangan negatif.", [{ kind: "pairs", n: 21 }],
    "21 = 1 × 21 = 3 × 7, jadi pasangannya (1, 21), (3, 7), (−1, −21), (−3, −7).", { level: "Sedang" }),
  q(0, "Isilah dengan tanda > (lebih dari) atau < (kurang dari).", [{ kind: "signs", pairs: [[-312, 97], [45, -120], [-1500, -1050], [-7, -70]] }],
    "−312 < 97; 45 > −120; −1.500 < −1.050 karena lebih ke kiri; −7 > −70 karena −7 lebih dekat ke 0.", { level: "Sedang" }),
  q(1, "Klub E mendapatkan 3 pemain bagus, melepaskan 1 pelatih buruk, dan mendapatkan 2 pemain buruk. Tentukan perhitungan nilai dan efek performanya.", [{ kind: "number", label: "Perhitungan nilai:", answer: 4 }, { kind: "choice", label: "Efek performa", options: effects, answer: "Performa naik" }],
    "3 × (+1) − (−3) + 2 × (−1) = 3 + 3 − 2 = +4. Performa naik.", { level: "Sedang", scene: { type: "rules", rows: transferRules } }),
  q(2, "Arjuna bersepeda setiap 8 hari dan berenang setiap 12 hari. Hari ini ia melakukan keduanya. Berapa hari lagi ia melakukan keduanya bersamaan?", [{ kind: "number", label: "Setelah", answer: 24, unit: "hari" }],
    "Kelipatan 8: 8, 16, 24. Kelipatan 12: 12, 24. KPK(8, 12) = 24 hari.", { level: "Sedang" }),
  q(0, "Urutkan suhu berikut dari yang paling dingin.", [{ kind: "order", label: "Paling dingin ke paling panas (°C)", options: [6, -4, -11, 9, -1], answer: [-11, -4, -1, 6, 9] }],
    "Paling dingin adalah bilangan terkecil: −11, −4, −1, 6, 9.", { level: "Sedang" }),
  q(1, "Tentukan suhu baru pada mesin pendingin ruang.", [{ kind: "items", items: [{ label: "a. Suhu −6°C, tombol × (−2):", answer: 12, unit: "°C" }, { label: "b. Suhu 3°C, tombol × (+2) lalu × (−3):", answer: -18, unit: "°C" }] }],
    "a. (−6) × (−2) = 12. b. 3 × 2 = 6, lalu 6 × (−3) = −18.", { level: "Sedang", scene: { type: "ac", temp: -6, buttons: [-4, -3, -2, 2, 3, 4] } }),
  // Menantang (9-17)
  q(2, "Ketuk semua faktor dari 28, termasuk faktor negatif.", [{ kind: "select", label: "Faktor 28", options: ["1", "2", "3", "4", "6", "7", "8", "14", "28", "−1", "−2", "−4", "−6", "−7", "−12", "−14", "−28"], answer: [0, 1, 3, 5, 7, 8, 9, 10, 11, 13, 15, 16] }],
    "Faktor 28: ±1, ±2, ±4, ±7, ±14, ±28. Angka 3, 6, 8, dan 12 tidak membagi 28 habis.", { level: "Menantang" }),
  q(0, "Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Suhu −15°C lebih dingin daripada −9°C.", answer: true },
    { text: "Semakin ke kiri pada garis bilangan, nilai bilangan semakin besar.", answer: false },
    { text: "−1 adalah bilangan bulat negatif yang paling besar.", answer: true },
    { text: "0 termasuk bilangan bulat positif.", answer: false },
  ] }], "−15 di kiri −9, jadi lebih dingin. Ke kiri nilainya makin kecil. −1 paling dekat ke 0. Nol bukan positif dan bukan negatif.", { level: "Menantang" }),
  q(1, "Lengkapi tabel perubahan suhu mesin pendingin ruang.", [{ kind: "table", head: ["Suhu sekarang (°C)", "Tombol yang ditekan", "Suhu baru (°C)"], rows: [["−7", "× (+3)", null], [null, "× (−4)", "−20"], ["6", null, "−18"], ["−2", "× (−3) lalu × (+2)", null]], answers: [-21, 5, -3, 12] }],
    "−7 × 3 = −21. Suhu × (−4) = −20, jadi suhunya 5. 6 × tombol = −18, tombolnya × (−3). −2 × (−3) = 6, 6 × 2 = 12.", { level: "Menantang", scene: { type: "ac", temp: -7, buttons: [-4, -3, -2, 2, 3, 4] } }),
  q(2, "Buat pohon faktor untuk 60, lalu tuliskan faktorisasi primanya dalam bentuk pangkat.", [{ kind: "primeExp", n: 60, primes: [2, 3, 5, 7] }],
    "60 = 2 × 30 = 2 × 2 × 15 = 2 × 2 × 3 × 5 = 2² × 3 × 5. Pangkat 7 adalah 0.", { level: "Menantang", scene: { type: "tree", n: 60 } }),
  q(0, "Ketuk semua kota yang lebih dingin daripada Seoul.", [{ kind: "select", label: "Lebih dingin daripada Seoul (−3°C)", options: cities2.map(c => c.city.split(",")[0]), answer: [0, 1, 3] }],
    "Lebih dingin berarti suhunya kurang dari −3: Yakutsk −28, Zermatt −9, Sapporo −6. London 4 dan Kupang 31 lebih panas.", { level: "Menantang", scene: { type: "weather", items: cities2 } }),
  q(1, "Perhatikan buku tabungan Haris. Kredit adalah uang masuk dan debit adalah uang keluar.", [{ kind: "items", items: [{ label: "a. Saldo akhir Februari (Rp):", answer: 325000 }, { label: "b. Maret: Haris akan menarik Rp400.000,00. Setoran paling sedikit agar saldonya tidak kurang dari Rp0,00 (Rp):", answer: 75000 }] }],
    "a. 300.000 − 125.000 + 150.000 = 325.000. b. 325.000 − 400.000 = −75.000, jadi harus disetor paling sedikit 75.000.", { level: "Menantang", scene: { type: "bank", ...bank } }),
  q(2, "Sasha membuat 36 kue nastar dan 54 kue kastengel. Setiap wadah berisi banyak nastar yang sama dan banyak kastengel yang sama. Berapa wadah paling banyak, dan apa isi setiap wadah?", [{ kind: "items", items: [{ label: "Banyak wadah:", answer: 18 }, { label: "Nastar per wadah:", answer: 2 }, { label: "Kastengel per wadah:", answer: 3 }] }],
    "36 = 2² × 3², 54 = 2 × 3³. FPB = 2 × 3² = 18 wadah. Setiap wadah 36 : 18 = 2 nastar dan 54 : 18 = 3 kastengel.", { level: "Menantang" }),
  q(0, "Urutkan suhu berikut dari yang paling panas.", [{ kind: "order", label: "Paling panas ke paling dingin (°C)", options: [18, -7, 25, -12, 0], answer: [25, 18, 0, -7, -12] }],
    "Dari terbesar: 25, 18, 0, −7, −12.", { level: "Menantang" }),
  q(1, "Pada tes masuk sebuah SMP ada 40 soal. Jawaban benar mendapat 4 poin, salah −2, tidak dijawab 0. Saka menjawab 32 soal dan 26 di antaranya benar. Berapa nilai Saka?", [{ kind: "number", label: "Nilai Saka:", answer: 92 }],
    "Benar 26 × 4 = 104. Salah 32 − 26 = 6, nilainya 6 × (−2) = −12. Tidak dijawab 8 × 0 = 0. Total 104 − 12 = 92.", { level: "Menantang" }),
  // Sangat menantang (18-24)
  q(2, "Tiga bus sekolah berhenti di halte setiap 8, 12, dan 15 menit. Ketiganya berangkat bersamaan pukul 06.15. Pukul berapa ketiganya berhenti bersamaan berikutnya?", [{ kind: "items", items: [{ label: "Pukul (jam):", answer: 8 }, { label: "Menit:", answer: 15 }] }],
    "8 = 2³, 12 = 2² × 3, 15 = 3 × 5. KPK = 2³ × 3 × 5 = 120 menit = 2 jam. 06.15 + 2 jam = 08.15.", { level: "Sangat menantang" }),
  q(0, "Letakkan posisi setiap benda terhadap permukaan laut (0 m) pada garis bilangan.", [{ kind: "place", min: -200, max: 150, step: 50, items: [{ label: "Kapal selam", value: -150 }, { label: "Penyelam", value: -50 }, { label: "Puncak mercusuar", value: 50 }, { label: "Burung camar", value: 100 }] }],
    "Di bawah permukaan laut bernilai negatif: kapal selam −150 m, penyelam −50 m. Di atasnya positif: mercusuar 50 m, burung camar 100 m.",
    { level: "Sangat menantang", scene: { type: "text", lines: ["Kapal selam berada 150 m di bawah permukaan laut.", "Penyelam berada 50 m di bawah permukaan laut.", "Puncak mercusuar 50 m di atas permukaan laut.", "Burung camar terbang 100 m di atas permukaan laut."] } }),
  q(1, "Jawablah dengan bilangan bulat.", [{ kind: "items", items: [{ label: "a. Cairan beku bersuhu −12°C dipanaskan. Setiap 3 menit suhunya naik 5°C. Suhu setelah 21 menit (°C):", answer: 23 }, { label: "b. Kapal selam menyelam 240 m dalam 4 jam dengan kecepatan tetap. Posisinya setelah 1 jam (m):", answer: -60 }] }],
    "a. 21 : 3 = 7 kali naik, 7 × 5 = 35, −12 + 35 = 23. b. (−240) : 4 = −60 m.", { level: "Sangat menantang" }),
  q(2, "Mesin pendingin makanan menampilkan hasil kali angka pada tombol pengatur suhu. Atur tombolnya agar suhu yang diinginkan tercapai.", [
    { kind: "dials", target: -20, count: 2, min: -5, max: 5, sample: [4, -5] },
    { kind: "dials", target: 30, count: 3, min: -5, max: 5, primesOnly: true, sample: [2, 3, 5] }],
    "−20 = 4 × (−5) atau (−4) × 5, juga 5 × (−4) dan (−5) × 4. Untuk 30 dengan tiga bilangan prima: 2 × 3 × 5 dalam urutan apa pun.", { level: "Sangat menantang" }),
  q(0, "Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Lawan dari −13 adalah 13.", answer: true },
    { text: "Ada 6 bilangan bulat di antara −4 dan 3.", answer: true },
    { text: "−20 < −200.", answer: false },
    { text: "Jika a lebih kecil dari b, maka lawan a lebih kecil dari lawan b.", answer: false },
  ] }], "Lawan −13 adalah 13. Di antara −4 dan 3: −3, −2, −1, 0, 1, 2 (6 bilangan). −20 > −200. Lawan membalik urutan: 2 < 5 tetapi −2 > −5.", { level: "Sangat menantang" }),
  q(1, "Tuliskan hasil operasi hitung berikut.", [{ kind: "items", items: [{ label: "a. ((−18) + (−6)) : 4 × (−3) =", answer: 18 }, { label: "b. 7 × (−5) − (−4) × 6 =", answer: -11 }] }],
    "a. (−24) : 4 = −6, lalu (−6) × (−3) = 18. b. 7 × (−5) = −35, (−4) × 6 = −24, −35 − (−24) = −35 + 24 = −11.", { level: "Sangat menantang" }),
  q(2, "Pada hari pelanggan, bioskop memberi minuman gratis kepada setiap pelanggan ke-20 dan popcorn gratis kepada setiap pelanggan ke-30. Hari itu datang 1.400 pelanggan. Berapa orang yang menerima minuman dan popcorn sekaligus?", [{ kind: "number", label: "Banyak orang:", answer: 23 }],
    "Yang mendapat keduanya adalah kelipatan KPK(20, 30) = 60. 1.400 : 60 = 23 sisa 20, jadi 23 orang.", { level: "Sangat menantang" }),
];

/** Sumber data untuk pemeriksaan kunci jawaban. */
export const sources = { cities, cities2, bank, transferRules };
