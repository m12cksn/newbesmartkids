/**
 * Kelas 8 Bab 1 - Bilangan Berpangkat (Buku Siswa Matematika SMP/MTs Kelas VIII, Kurikulum Merdeka 2022, hlm. 1-44).
 * A. Bilangan Berpangkat Bulat  B. Bilangan Bentuk Akar  C. Penulisan Bentuk Baku
 * Bentuk jawaban mengikuti buku: tulis dalam bentuk berpangkat (bilangan pokok dan pangkat), tentukan nilai,
 * nyatakan sebagai pecahan, sederhanakan bentuk akar, rasionalkan penyebut, tulis bentuk baku, benar/salah, dan pilihan.
 * Teks matematika memakai penanda: ^{…} pangkat, √{…} akar, {a/b} pecahan bertumpuk.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Bilangan Indonesia ---------- */
export const num = (s: string) => { const t = s.trim().replace(/[−–]/g, "-").replace(/\./g, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };
export const idn = (n: number) => { const r = Math.round(n * 1e10) / 1e10; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
/** Desimal tanpa notasi eksponen, untuk bilangan sangat kecil seperti 0,00072. */
export const plainDecimal = (mant: number, exp: number) => {
  const digits = String(mant).replace(".", ""), point = String(mant).split(".")[0].length + exp;
  if (point <= 0) return `0,${"0".repeat(-point)}${digits}`.replace(/0+$/, "");
  const dots = (t: string) => t.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (point >= digits.length) return dots(digits + "0".repeat(point - digits.length));
  return `${dots(digits.slice(0, point))},${digits.slice(point)}`;
};
export const normBase = (s: string) => s.trim().toLowerCase().replace(/[−–]/g, "-").replace(/[\s()]/g, "").replace(",", ".");
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export const squareFree = (n: number) => { for (let k = 2; k * k <= n; k++) if (n % (k * k) === 0) return false; return n >= 1; };
/** a√b dengan b bebas kuadrat. */
export const simplifyRoot = (coef: number, rad: number): [number, number] => { let c = coef, r = rad; for (let k = Math.floor(Math.sqrt(r)); k >= 2; k--) if (r % (k * k) === 0) { c *= k; r /= k * k; k = Math.floor(Math.sqrt(r)) + 1; } return [c, r]; };

/* ---------- Gambar dan bentuk jawaban ---------- */
export type Scene =
  | { type: "square"; area: string; unit: string; label: string }
  | { type: "rect"; w: string; h: string; unit: string; label: string }
  | { type: "cubes"; n: number }
  | { type: "table"; caption?: string; head: string[]; rows: string[][] }
  | { type: "split"; perStep: number; minutes: number; label: string }
  | { type: "card"; title: string; lines: string[] };

export type Part =
  | { kind: "num"; label: string; value: number; unit?: string }
  /** Bilangan berpangkat: bilangan pokok dan pangkat. `fixedBase` = pokok sudah ditulis, siswa mengisi pangkat. */
  | { kind: "pow"; label: string; base: string; exp: number; fixedBase?: boolean }
  /** Pecahan biasa dalam bentuk paling sederhana. */
  | { kind: "frac"; label: string; n: number; d: number }
  /** a√b dalam bentuk paling sederhana. */
  | { kind: "root"; label: string; coef: number; rad: number }
  /** Hasil merasionalkan: (c₁√r₁ + c₂√r₂ + …) / penyebut; diperiksa dari nilai dan bentuknya. */
  | { kind: "surd"; label: string; terms: [number, number][]; den: number }
  /** Bentuk baku a × 10^n dengan 1 ≤ a < 10. */
  | { kind: "sci"; label: string; mant: number; exp: number }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type PQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => p.kind === "pow" ? (p.fixedBase ? 1 : 2) : p.kind === "frac" || p.kind === "root" || p.kind === "sci" ? 2
  : p.kind === "surd" ? p.terms.length * 2 + 1 : p.kind === "tf" ? p.statements.length : 1;
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => idn(n).replace(/\./g, "").replace("−", "-");
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "pow": return p.fixedBase ? [String(p.exp)] : [p.base, String(p.exp)];
    case "frac": return [String(p.n), String(p.d)];
    case "root": return [String(p.coef), String(p.rad)];
    case "surd": return [...p.terms.flat().map(String), String(p.den)];
    case "sci": return [str(p.mant), String(p.exp)];
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}
export const surdValue = (terms: [number, number][], den: number) => terms.reduce((a, [c, r]) => a + c * Math.sqrt(r), 0) / den;
const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const isInt = (s: string) => /^-?\d+$/.test(s.trim().replace(/[−–]/g, "-"));
const int = (s: string) => Number(s.trim().replace(/[−–]/g, "-"));
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return close(num(v), p.value);
    case "pow": return p.fixedBase ? isInt(x[0]) && int(x[0]) === p.exp : normBase(x[0]) === normBase(p.base) && isInt(x[1]) && int(x[1]) === p.exp;
    case "frac": { if (!isInt(x[0]) || !isInt(x[1])) return false; const n = int(x[0]), d = int(x[1]); return d > 0 && gcd(n, d) === 1 && n * p.d === d * p.n; }
    case "root": return isInt(x[0]) && isInt(x[1]) && int(x[0]) === p.coef && int(x[1]) === p.rad;
    case "surd": {
      if (!x.every(isInt)) return false;
      const t: [number, number][] = Array.from({ length: p.terms.length }, (_, k) => [int(x[2 * k]), int(x[2 * k + 1])]), d = int(x.at(-1)!);
      if (d < 1 || !t.every(([c, r]) => c !== 0 && r >= 1 && squareFree(r))) return false;
      if (new Set(t.map(([, r]) => r)).size !== t.length) return false; // suku sejenis sudah digabung
      if (t.reduce((g, [c]) => gcd(g, c), d) !== 1) return false; // bentuk paling sederhana
      return close(surdValue(t, d), surdValue(p.terms, p.den));
    }
    case "sci": { const m = num(x[0]); return !Number.isNaN(m) && m >= 1 && m < 10 && isInt(x[1]) && close(m, p.mant) && int(x[1]) === p.exp; }
    default: return x.join("|") === fields(p).join("|");
  }
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "choice") return v !== "";
  return x.every(c => c.trim() !== "");
}
export const correct = (q: PQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: PQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/√\{([^}]*)\}/g, "√$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2");
export const surdText = (terms: [string, string][], den: string) => {
  const top = terms.map(([c, r], k) => { const neg = c.startsWith("-"), a = c.replace("-", ""); const t = r === "1" ? a : `${a === "1" ? "" : a}√${r}`; return k === 0 ? `${neg ? "−" : ""}${t}` : ` ${neg ? "−" : "+"} ${t}`; }).join("");
  return den === "1" ? top : `(${top}) / ${den}`;
};
export function formatAnswer(q: PQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "pow": return `${plain(p.label)} ${p.fixedBase ? `${p.base}^${x[0]}` : `(${x[0]})^${x[1]}`}`;
      case "frac": return `${plain(p.label)} ${x[0]}/${x[1]}`;
      case "root": return `${plain(p.label)} ${x[0]}√${x[1]}`;
      case "surd": return `${plain(p.label)} ${surdText(Array.from({ length: p.terms.length }, (_, k) => [x[2 * k], x[2 * k + 1]] as [string, string]), x.at(-1)!)}`;
      case "sci": return `${plain(p.label)} ${x[0]} × 10^${x[1]}`;
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      case "choice": return `${plain(p.label)} ${v[i] || "…"}`;
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: PQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): PQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string): Part => ({ kind: "num", label, value, unit });
const pw = (label: string, base: string, exp: number, fixedBase = false): Part => ({ kind: "pow", label, base, exp, fixedBase });
const fr = (label: string, nn: number, d: number): Part => ({ kind: "frac", label, n: nn, d });
const rt = (label: string, coef: number, rad: number): Part => ({ kind: "root", label, coef, rad });
const sc = (label: string, mant: number, exp: number): Part => ({ kind: "sci", label, mant, exp });

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  { code: "A", title: "Bilangan Berpangkat Bulat", short: "Pangkat bulat", sections: [
    { title: "Pengertian bilangan berpangkat", lab: "repeat", steps: [
      "a^{n} artinya a dikalikan berulang sebanyak n kali: a^{n} = a × a × … × a.",
      "a disebut bilangan pokok (basis) dan n disebut pangkat (eksponen).",
      "Bilangan pokok negatif: hasilnya positif jika pangkatnya genap dan negatif jika pangkatnya ganjil. (−2)^{4} = 16, (−2)^{3} = −8.",
      "Perhatikan kurung. (−2)^{4} = 16, tetapi −2^{4} = −(2 × 2 × 2 × 2) = −16.",
      "Pangkat juga berlaku untuk perkalian di dalam kurung: (3a)^{2} = 3a × 3a = 9a^{2}.",
    ], life: "Kapasitas memori ditulis dengan pangkat dua. 1 KB = 2^{10} byte = 1.024 byte, 1 MB = 2^{20} byte = 1.048.576 byte. Banyak kubus kecil pada kubus rubik 3 × 3 × 3 ditulis 3^{3} = 27.",
      example: "2^{8} = 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 256 dan 3^{5} = 3 × 3 × 3 × 3 × 3 = 243.",
      demo: "Atur bilangan pokok dan pangkat. Lihat perkalian berulang, hasilnya, dan tandanya untuk bilangan pokok negatif." },
    { title: "Sifat perkalian dan pembagian", lab: "laws", steps: [
      "Perkalian dengan bilangan pokok sama: pangkatnya dijumlahkan. a^{m} × a^{n} = a^{m + n}.",
      "Pembagian dengan bilangan pokok sama: pangkatnya dikurangkan. {a^{m}/a^{n}} = a^{m − n}.",
      "Sifat ini hanya berlaku jika bilangan pokoknya sama. 2^{3} × 3^{2} tidak bisa digabung menjadi satu pangkat.",
      "Jika bilangan pokok berbeda tetapi bisa ditulis sebagai pangkat dari bilangan yang sama, ubah dulu. 4^{3} = (2^{2})^{3} = 2^{6}.",
    ], life: "Ahmad memakai 10 GB kuota sehari. 10 GB = 10^{7} KB, jadi selama 100 = 10^{2} hari ia memakai 10^{2} × 10^{7} = 10^{9} KB. SSD 1 TB = 10^{6} MB dan satu film 10^{3} MB, sehingga muat {10^{6}/10^{3}} = 10^{3} = 1.000 film.",
      example: "3^{4} × 3^{5} = 3^{4 + 5} = 3^{9}. {4^{5}/4^{3}} = 4^{5 − 3} = 4^{2} = 16.",
      demo: "Pilih perkalian atau pembagian, lalu atur kedua pangkat. Faktor yang dicoret saat dibagi terlihat langsung." },
    { title: "Pangkat dari pangkat dan perkalian", lab: "power", steps: [
      "Bilangan berpangkat yang dipangkatkan lagi: pangkatnya dikalikan. (a^{m})^{n} = a^{m × n}.",
      "Perkalian yang dipangkatkan: setiap faktor dipangkatkan. (a × b)^{m} = a^{m} × b^{m}.",
      "Pecahan yang dipangkatkan: pembilang dan penyebut dipangkatkan. ({a/b})^{n} = {a^{n}/b^{n}}.",
      "Hati-hati: 4^{2} × 4^{5} = 4^{7}, bukan 16^{7}. Bilangan pokok tidak ikut dikalikan.",
    ], life: "Sebuah gudang berisi 5 rak, setiap rak 5 kardus, setiap kardus 5 kotak, dan setiap kotak 5 bungkus: 5 × 5 × 5 × 5 = 5^{4} = 625 bungkus. Jika gudang seperti itu ada 5^{4} buah, banyak bungkusnya (5^{4})^{2} = 5^{8}.",
      example: "(3^{4})^{3} = 3^{4} × 3^{4} × 3^{4} = 3^{12}. (2 × 6)^{4} = 2^{4} × 6^{4}. ({2/3})^{3} = {8/27}.",
      demo: "Atur pangkat dalam dan pangkat luar. Setiap kelompok faktor ditampilkan sehingga banyaknya faktor terlihat sebagai perkalian." },
    { title: "Pangkat nol dan pangkat negatif", lab: "ladder", steps: [
      "Setiap bilangan (bukan nol) yang dibagi dirinya sendiri hasilnya 1. {a^{n}/a^{n}} = a^{n − n} = a^{0}, jadi a^{0} = 1.",
      "Turun satu pangkat sama dengan membagi dengan bilangan pokok: 10^{2} = 100, 10^{1} = 10, 10^{0} = 1, 10^{−1} = {1/10}.",
      "Pangkat negatif adalah kebalikan: a^{−n} = {1/a^{n}}. Sebaliknya {1/a^{−n}} = a^{n}.",
      "Pangkat negatif dipakai untuk ukuran sangat kecil, misalnya 1 nanometer = 1 × 10^{−9} meter.",
    ], life: "Panjang gelombang radio sekitar 10^{−3} meter = {1/1.000} meter = 0,001 meter. Sebuah amuba berdiameter 5^{−3} cm = {1/125} cm = 0,008 cm.",
      example: "7^{0} = 1. 2^{−5} = {1/2^{5}} = {1/32}. {1/9^{−4}} = 9^{4}.",
      demo: "Turuni tangga pangkat. Setiap langkah membagi dengan bilangan pokok, dan nilai pecahan serta desimalnya ikut berubah." },
  ] },
  { code: "B", title: "Bilangan Bentuk Akar", short: "Bentuk akar", sections: [
    { title: "Akar dan pangkat pecahan", lab: "square", steps: [
      "Menarik akar adalah kebalikan memangkatkan. √{a} = b ⇔ b^{2} = a, dengan a dan b positif.",
      "Secara umum, akar pangkat n: b^{n} = a ⇔ akar pangkat n dari a adalah b. Akar pangkat 3 dari 27 adalah 3.",
      "Bentuk akar juga dapat ditulis sebagai pangkat pecahan: √{a} = a^{1/2}.",
      "Bilangan kuadrat sempurna (1, 4, 9, 16, 25, …) mempunyai akar bilangan bulat. Akar bilangan lain seperti √{2} adalah bilangan irasional.",
    ], life: "Saputangan Christina berbentuk persegi dengan luas 625 cm^{2}. Panjang sisinya √{625} = 25 cm, karena 25 × 25 = 625. Cara yang sama dipakai untuk mencari sisi ubin atau taman persegi dari luasnya.",
      example: "√{36} = 6 karena 6^{2} = 36. √{144} = 12 karena 12^{2} = 144.",
      demo: "Atur luas persegi. Jika luasnya bilangan kuadrat, sisinya bilangan bulat; jika tidak, sisinya ditulis sebagai bentuk akar." },
    { title: "Menyederhanakan, menjumlah, dan mengurangi akar", lab: "simplify", steps: [
      "Sederhanakan dengan memisahkan faktor kuadrat terbesar: √{72} = √{36 × 2} = √{36} × √{2} = 6√{2}.",
      "Bentuk akar sejenis (bilangan di dalam akar sama) dapat dijumlah atau dikurang: a√{m} + b√{m} = (a + b)√{m}.",
      "Bentuk akar tidak sejenis tidak dapat digabung langsung. Sederhanakan dulu, siapa tahu menjadi sejenis.",
      "Contoh: 5√{3} + 2√{12} = 5√{3} + 4√{3} = 9√{3}.",
    ], life: "Sebuah bingkai berbentuk persegi panjang dengan panjang 3√{5} cm dan lebar 2√{5} cm. Kelilingnya 3√{5} + 2√{5} + 3√{5} + 2√{5} = 10√{5} cm.",
      example: "2√{8} + 6√{18} = 2 × 2√{2} + 6 × 3√{2} = 4√{2} + 18√{2} = 22√{2}.",
      demo: "Pilih bilangan di dalam akar. Faktor kuadrat terbesarnya dicari, lalu bentuk paling sederhana ditampilkan." },
    { title: "Perkalian dan pembagian akar", lab: "multiply", steps: [
      "Perkalian: a√{p} × b√{q} = (a × b)√{p × q}, lalu sederhanakan.",
      "Pembagian: {√{a}/√{b}} = √{a/b}. Koefisien di luar akar dibagi dengan koefisien.",
      "√{a} × √{a} = a. Misalnya √{5} × √{5} = 5.",
      "Setelah dikali atau dibagi, selalu periksa apakah akarnya masih bisa disederhanakan.",
    ], life: "Selembar kertas berukuran √{5} cm × √{2} cm luasnya √{5} × √{2} = √{10} cm^{2}. Ubin berukuran 2√{3} dm × 3√{3} dm luasnya 6 × 3 = 18 dm^{2}.",
      example: "3√{5} × 5√{10} = 15√{50} = 15 × 5√{2} = 75√{2}. {9√{24}/3√{3}} = 3√{8} = 6√{2}.",
      demo: "Atur koefisien dan bilangan di dalam akar dari dua sisi persegi panjang. Luasnya dihitung dan disederhanakan." },
    { title: "Merasionalkan penyebut", lab: "rational", steps: [
      "Merasionalkan penyebut berarti membuat penyebut tidak lagi memuat akar.",
      "Penyebut √{a}: kalikan pembilang dan penyebut dengan √{a}, karena √{a} × √{a} = a.",
      "Penyebut a + √{b}: kalikan dengan sekawannya a − √{b}, karena (a + √{b})(a − √{b}) = a^{2} − b.",
      "Penyebut √{a} + √{b}: kalikan dengan √{a} − √{b}, karena hasilnya a − b. Untuk penyebut dengan tanda minus, sekawannya bertanda plus.",
    ], life: "Kalkulator dan perhitungan teknik lebih mudah memakai penyebut bilangan bulat. Nilai {1/√{2}} sulit dibagi dengan tangan, tetapi {√{2}/2} cukup dihitung 1,414 : 2 ≈ 0,707.",
      example: "{6/5 + √{3}} = {6(5 − √{3})/25 − 3} = {30 − 6√{3}/22} = {15 − 3√{3}/11}.",
      demo: "Pilih jenis penyebut. Langkah mengalikan dengan sekawannya ditampilkan satu per satu sampai penyebutnya bilangan bulat." },
  ] },
  { code: "C", title: "Penulisan Bentuk Baku", short: "Bentuk baku", sections: [
    { title: "Menulis bentuk baku", lab: "sci", steps: [
      "Bentuk baku bilangan positif ditulis a × 10^{n} dengan 1 ≤ a < 10 dan n bilangan bulat.",
      "Untuk bilangan besar, geser koma ke kiri sampai tersisa satu angka bukan nol di depan koma. Banyak geseran menjadi pangkat positif.",
      "Untuk bilangan kecil, geser koma ke kanan sampai melewati angka bukan nol pertama. Banyak geseran menjadi pangkat negatif.",
      "Sebaliknya, untuk menulis bentuk biasa, geser koma ke kanan sebanyak pangkat positif atau ke kiri sebanyak pangkat negatif.",
    ], life: "Berat Bumi sekitar 6.000.000.000.000.000.000.000 ton = 6 × 10^{21} ton. Truk tambang mengangkut 400.000 kg = 4 × 10^{5} kg, dan berat operasinya 687.500 kg = 6,875 × 10^{5} kg.",
      example: "456.000.000 = 4,56 × 10^{8}. 0,0000000796 = 7,96 × 10^{−8}. 2,3 × 10^{6} = 2.300.000.",
      demo: "Ketuk tombol geser koma. Banyak geseran dan pangkat 10 berubah bersamaan sampai bentuk bakunya tepat." },
    { title: "Operasi bentuk baku", lab: "sciops", steps: [
      "Perkalian: kalikan bilangan depannya dan jumlahkan pangkat 10. (a × 10^{m}) × (b × 10^{n}) = (a × b) × 10^{m + n}.",
      "Pembagian: bagi bilangan depannya dan kurangkan pangkat 10. (a × 10^{m}) : (b × 10^{n}) = (a : b) × 10^{m − n}.",
      "Jika hasil bilangan depannya 10 atau lebih, atau kurang dari 1, rapikan lagi. 12 × 10^{11} = 1,2 × 10^{12}.",
      "Samakan satuan dulu sebelum menghitung, misalnya kg menjadi gram atau meter menjadi kilometer.",
    ], life: "Cahaya bergerak 3 × 10^{8} meter setiap detik. Dalam 1 menit = 6 × 10^{1} detik, cahaya menempuh (3 × 10^{8}) × (6 × 10^{1}) = 18 × 10^{9} = 1,8 × 10^{10} meter.",
      example: "(2 × 10^{6}) × (8 × 10^{4}) = 16 × 10^{10} = 1,6 × 10^{11}. (8 × 10^{10}) : (2 × 10^{−5}) = 4 × 10^{15}.",
      demo: "Atur dua bilangan dalam bentuk baku dan pilih operasinya. Hasil dirapikan menjadi bentuk baku langkah demi langkah." },
  ] },
];

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: PQuestion[][] = [
  [
    q(0, "Tentukan nilai dari bilangan berpangkat berikut.", [n("2^{9} =", 512), n("(−3)^{5} =", -243)], "2^{9} = 2 × 2 × … × 2 (9 kali) = 512. (−3)^{5}: pangkat ganjil sehingga negatif, 3^{5} = 243, jadi −243."),
    q(0, "Tulislah dalam bentuk bilangan berpangkat.", [pw("1,5 × 1,5 × 1,5 =", "1,5", 3), pw("a × a × a × a × a × a =", "a", 6)], "1,5 dikalikan 3 kali: (1,5)^{3}. a dikalikan 6 kali: a^{6}."),
    q(0, "Sederhanakan menggunakan sifat bilangan berpangkat.", [pw("4^{3} × 4^{5} =", "4", 8, true), pw("{10^{9}/10^{4}} =", "10", 5, true)], "Perkalian: 3 + 5 = 8. Pembagian: 9 − 4 = 5."),
    q(0, "Nyatakan sebagai pecahan biasa.", [fr("10^{−3} =", 1, 1000), fr("({2/5})^{3} =", 8, 125)], "10^{−3} = {1/10^{3}} = {1/1.000}. ({2/5})^{3} = {2^{3}/5^{3}} = {8/125}."),
  ],
  [
    q(1, "Saputangan berbentuk persegi mempunyai luas 225 cm^{2}. Berapa panjang sisinya?", [n("Panjang sisi =", 15, "cm")], "√{225} = 15 karena 15 × 15 = 225.", { scene: { type: "square", area: "225 cm^{2}", unit: "cm", label: "Saputangan" } }),
    q(1, "Sederhanakan.", [rt("5√{3} + 8√{3} =", 13, 3), rt("12√{6} − 8√{6} =", 4, 6)], "Akar sejenis: koefisiennya dijumlah atau dikurang. 5 + 8 = 13, 12 − 8 = 4."),
    q(1, "Tulislah dalam bentuk akar yang paling sederhana.", [rt("√{72} =", 6, 2), rt("√{75} =", 5, 3)], "√{72} = √{36 × 2} = 6√{2}. √{75} = √{25 × 3} = 5√{3}."),
    q(1, "Rasionalkan penyebutnya.", [{ kind: "surd", label: "{1/√{5}} =", terms: [[1, 5]], den: 5 }], "{1/√{5}} × {√{5}/√{5}} = {√{5}/5}."),
  ],
  [
    q(2, "Tulislah dalam bentuk baku.", [sc("8.400.000 =", 8.4, 6), sc("0,00052 =", 5.2, -4)], "8.400.000: koma digeser 6 kali ke kiri. 0,00052: koma digeser 4 kali ke kanan, jadi pangkat −4."),
    q(2, "Tulislah dalam bentuk biasa.", [n("3,1 × 10^{−3} =", 0.0031), n("2,05 × 10^{4} =", 20500)], "3,1 × 10^{−3}: koma geser 3 kali ke kiri, 0,0031. 2,05 × 10^{4}: koma geser 4 kali ke kanan, 20.500."),
    q(2, "Sederhanakan dan tulis dalam bentuk baku.", [sc("(2 × 10^{4}) × (3 × 10^{5}) =", 6, 9), sc("(9 × 10^{7}) : (3 × 10^{2}) =", 3, 5)], "2 × 3 = 6 dan 4 + 5 = 9. 9 : 3 = 3 dan 7 − 2 = 5."),
    q(2, "Truk tambang mampu mengangkut 450.000 kg pasir sekali jalan. Tulis daya angkutnya dalam bentuk baku.", [sc("Daya angkut =", 4.5, 5)], "450.000 = 4,5 × 10^{5} kg.", { scene: { type: "card", title: "Truk tambang", lines: ["Daya angkut: 450.000 kg"] } }),
  ],
];

/* ---------- Evaluasi: 24 soal, A B C bergantian ---------- */
export const assessment: PQuestion[] = [
  // Sedang (1-8)
  q(0, "Tulislah dalam bentuk bilangan berpangkat, lalu periksa pendapat teman-temanmu.", [pw("(−7) × (−7) × (−7) × (−7) =", "-7", 4), pw("0,4 × 0,4 × 0,4 =", "0,4", 3),
    { kind: "tf", statements: [{ text: "Anton: (−3)^{4} sama dengan −3^{4}.", answer: false }, { text: "Joni: (2a)^{3} sama dengan 8a^{3}.", answer: true }, { text: "Nadiva: −(5 × 5 × 5) senilai dengan (−5) × (−5) × (−5).", answer: true }] }],
    "(−7) dikalikan 4 kali: (−7)^{4}. 0,4 dikalikan 3 kali: (0,4)^{3}. (−3)^{4} = 81 tetapi −3^{4} = −81. (2a)^{3} = 2^{3}a^{3} = 8a^{3}. Pangkat ganjil: −125 = −125.", { level: "Sedang" }),
  q(1, "Taman berbentuk persegi mempunyai luas 196 m^{2}. Tentukan panjang sisinya, lalu lengkapi hubungan pangkat dan akar.", [n("Panjang sisi =", 14, "m"), n("√{324} =", 18)],
    "√{196} = 14 karena 14^{2} = 196. √{324} = 18 karena 18^{2} = 324.", { level: "Sedang", scene: { type: "square", area: "196 m^{2}", unit: "m", label: "Taman" } }),
  q(2, "Tulislah dalam bentuk baku.", [sc("52.700.000 =", 5.27, 7), sc("0,000038 =", 3.8, -5)],
    "52.700.000: koma geser 7 kali ke kiri. 0,000038: koma geser 5 kali ke kanan, jadi pangkat −5.", { level: "Sedang" }),
  q(0, "Tentukan nilai x dari persamaan berikut.", [n("2^{x} = 128, x =", 7), n("5^{x} = 625, x =", 4), n("x^{4} = 1.296, x =", 6)],
    "2^{7} = 128, 5^{4} = 625, dan 6^{4} = 1.296.", { level: "Sedang" }),
  q(1, "Sederhanakan.", [rt("7√{5} + 4√{5} =", 11, 5), rt("15√{6} − 9√{6} =", 6, 6)], "Akar sejenis: 7 + 4 = 11 dan 15 − 9 = 6.", { level: "Sedang" }),
  q(2, "Tulislah dalam bentuk biasa.", [n("4,6 × 10^{5} =", 460000), n("7,2 × 10^{−4} =", 0.00072)],
    "4,6 × 10^{5} = 460.000. 7,2 × 10^{−4} = 0,00072.", { level: "Sedang" }),
  q(0, "Sederhanakan menggunakan sifat bilangan berpangkat.", [pw("3^{5} × 3^{4} =", "3", 9, true), pw("{6^{8}/6^{3}} =", "6", 5, true), pw("(5^{2})^{4} =", "5", 8, true)],
    "Perkalian: 5 + 4 = 9. Pembagian: 8 − 3 = 5. Pangkat dari pangkat: 2 × 4 = 8.", { level: "Sedang" }),
  q(1, "Tulislah dalam bentuk akar yang paling sederhana.", [rt("√{98} =", 7, 2), rt("√{180} =", 6, 5)],
    "√{98} = √{49 × 2} = 7√{2}. √{180} = √{36 × 5} = 6√{5}.", { level: "Sedang" }),
  // Menantang (9-17)
  q(2, "Tulislah dalam bentuk baku.", [sc("Massa Bulan sekitar 73.500.000.000.000.000.000 ton =", 7.35, 19), sc("Truk tambang mengangkut 365.000 kg =", 3.65, 5)],
    "73.500.000.000.000.000.000 = 7,35 × 10^{19}. 365.000 = 3,65 × 10^{5}.", { level: "Menantang" }),
  q(0, "Rina memakai paket internet 10 GB setiap hari selama 1.000 hari. 1 GB = 10^{6} KB. Sebuah SSD berkapasitas 10 TB = 10^{7} MB, dan satu film membutuhkan 10^{3} MB.", [pw("Kuota Rina selama 1.000 hari = … KB", "10", 10), pw("Banyak film yang muat di SSD =", "10", 4)],
    "10 GB = 10 × 10^{6} = 10^{7} KB sehari, 1.000 hari = 10^{3}, jadi 10^{7} × 10^{3} = 10^{10} KB. Film: {10^{7}/10^{3}} = 10^{4}.", { level: "Menantang", scene: { type: "card", title: "Paket data dan SSD", lines: ["Paket harian: 10 GB", "1 GB = 10^{6} KB", "SSD: 10 TB = 10^{7} MB", "1 film = 10^{3} MB"] } }),
  q(1, "Sebuah bingkai berbentuk persegi panjang dengan panjang 4√{3} cm dan lebar 2√{3} cm.", [rt("Keliling =", 12, 3), n("Luas =", 24, "cm^{2}")],
    "Keliling = 2 × (4√{3} + 2√{3}) = 12√{3} cm. Luas = 4√{3} × 2√{3} = 8 × 3 = 24 cm^{2}.", { level: "Menantang", scene: { type: "rect", w: "4√{3} cm", h: "2√{3} cm", unit: "cm", label: "Bingkai" } }),
  q(2, "Sederhanakan dan tulis hasilnya dalam bentuk baku.", [sc("(3 × 10^{5}) × (4 × 10^{6}) =", 1.2, 12), sc("(9 × 10^{8}) : (1,5 × 10^{−3}) =", 6, 11)],
    "3 × 4 = 12 dan 5 + 6 = 11: 12 × 10^{11} = 1,2 × 10^{12}. 9 : 1,5 = 6 dan 8 − (−3) = 11.", { level: "Menantang" }),
  q(0, "Nyatakan dalam bentuk pecahan biasa.", [fr("4^{−3} =", 1, 64), fr("{2^{−2}/2^{3}} =", 1, 32), n("7^{0} + 3^{0} =", 2)],
    "4^{−3} = {1/64}. {2^{−2}/2^{3}} = 2^{−5} = {1/32}. 7^{0} + 3^{0} = 1 + 1 = 2.", { level: "Menantang" }),
  q(1, "Sederhanakan perkalian bentuk akar.", [rt("3√{6} × 2√{12} =", 36, 2), rt("5√{8} × 2√{10} =", 40, 5)],
    "3 × 2 = 6 dan √{72} = 6√{2}, jadi 36√{2}. 5 × 2 = 10 dan √{80} = 4√{5}, jadi 40√{5}.", { level: "Menantang" }),
  q(2, "Sekarung beras beratnya 25 kg. Setiap butir beras beratnya 2 × 10^{−2} gram. Berapa banyak butir beras dalam karung?", [sc("Banyak butir =", 1.25, 6)],
    "25 kg = 25.000 g = 2,5 × 10^{4} g. Banyak butir = (2,5 × 10^{4}) : (2 × 10^{−2}) = 1,25 × 10^{6}.", { level: "Menantang", scene: { type: "card", title: "Sekarung beras", lines: ["Berat karung: 25 kg", "Berat 1 butir: 2 × 10^{−2} g"] } }),
  q(0, "Tulislah dalam bentuk bilangan berpangkat yang paling sederhana.", [pw("{8^{5}/4^{2} × 2^{3}} =", "2", 8), pw("{27^{3} × 9^{2}/3^{5}} =", "3", 8)],
    "8^{5} = 2^{15}, 4^{2} = 2^{4}: 2^{15 − 4 − 3} = 2^{8}. 27^{3} = 3^{9}, 9^{2} = 3^{4}: 3^{9 + 4 − 5} = 3^{8}.", { level: "Menantang" }),
  q(1, "Sederhanakan pembagian bentuk akar.", [rt("{12√{40}/4√{5}} =", 6, 2), n("{√{150}/√{6}} =", 5)],
    "{12/4} = 3 dan √{40 : 5} = √{8} = 2√{2}, jadi 6√{2}. √{150 : 6} = √{25} = 5.", { level: "Menantang" }),
  // Sangat menantang (18-24)
  q(2, "Kecepatan cahaya 3 × 10^{8} m/detik. Berapa km yang ditempuh cahaya dalam 2 jam?", [sc("Jarak =", 2.16, 9)],
    "2 jam = 7.200 detik = 7,2 × 10^{3} detik. Jarak = 3 × 10^{8} × 7,2 × 10^{3} = 21,6 × 10^{11} m = 2,16 × 10^{12} m = 2,16 × 10^{9} km.", { level: "Sangat menantang" }),
  q(0, "Tentukan nilai p.", [n("{(−4)^{2}/2^{3}} × {8^{4}/(−16)^{2}} = 2^{p}, p =", 5), n("9^{p} × {27^{2}/3^{4}} = 3^{12}, p =", 5)],
    "16 : 8 = 2 dan 4.096 : 256 = 16, jadi 2 × 16 = 32 = 2^{5}. 3^{2p} × 3^{6 − 4} = 3^{2p + 2} = 3^{12}, sehingga 2p = 10 dan p = 5.", { level: "Sangat menantang" }),
  q(1, "Rasionalkan penyebutnya dan sederhanakan.", [{ kind: "surd", label: "{6/√{8}} =", terms: [[3, 2]], den: 2 }, { kind: "surd", label: "{4/3 + √{5}} =", terms: [[3, 1], [-1, 5]], den: 1 }],
    "{6/√{8}} = {6/2√{2}} = {3/√{2}} = {3√{2}/2}. {4/3 + √{5}} × {3 − √{5}/3 − √{5}} = {4(3 − √{5})/9 − 5} = 3 − √{5}.", { level: "Sangat menantang" }),
  q(2, "Flashdisk berkapasitas 128 GB, dan 75% kapasitasnya terpakai. 1 GB = 2^{30} byte. Tulis kapasitas yang terpakai dalam bentuk 3 × 2^{n} byte.", [n("3 × 2^{n} byte, n =", 35)],
    "75% × 128 = 96 GB = 3 × 2^{5} GB. 3 × 2^{5} × 2^{30} = 3 × 2^{35} byte.", { level: "Sangat menantang", scene: { type: "card", title: "Flashdisk", lines: ["Kapasitas: 128 GB", "Terpakai: 75%", "1 GB = 2^{30} byte"] } }),
  q(0, "Virus di desa X membelah menjadi 2 setiap 1 menit. Virus di desa Y membelah menjadi 3 setiap 2 menit. Mula-mula di setiap desa ada 1 virus.", [pw("Banyak virus di desa X setelah 12 menit =", "2", 12), pw("Banyak virus di desa Y setelah 12 menit =", "3", 6),
    { kind: "choice", label: "Setelah 1 jam, desa mana yang virusnya lebih banyak?", options: ["Desa X", "Desa Y", "Sama banyak"], answer: "Desa X" }],
    "Desa X membelah 12 kali: 2^{12}. Desa Y membelah 6 kali: 3^{6}. Setelah 60 menit: X = 2^{60} = (2^{2})^{30} = 4^{30}, Y = 3^{30}. 4^{30} > 3^{30}, jadi desa X.", { level: "Sangat menantang", scene: { type: "split", perStep: 2, minutes: 1, label: "Desa X: 1 virus menjadi 2 setiap menit" } }),
  q(1, "Rasionalkan penyebutnya dan sederhanakan.", [{ kind: "surd", label: "{8/√{7} − √{3}} =", terms: [[2, 7], [2, 3]], den: 1 }, { kind: "surd", label: "{3 + √{2}/√{5} − √{2}} =", terms: [[3, 5], [3, 2], [1, 10], [2, 1]], den: 3 }],
    "{8(√{7} + √{3})/7 − 3} = 2√{7} + 2√{3}. {(3 + √{2})(√{5} + √{2})/5 − 2} = {3√{5} + 3√{2} + √{10} + 2/3}.", { level: "Sangat menantang" }),
  q(2, "Satu tahun dihitung 365 hari. Setiap orang yang donor memberikan 500 ml darah, dan setiap 1 ml darah berisi 8 × 10^{3} sel darah putih.", [sc("Banyak detik dalam 50 tahun =", 1.5768, 9), sc("Sel darah putih dari 12 pendonor =", 4.8, 7)],
    "50 × 365 × 86.400 = 1.576.800.000 = 1,5768 × 10^{9} detik. 12 × 500 × 8 × 10^{3} = 48.000.000 = 4,8 × 10^{7} sel.", { level: "Sangat menantang" }),
];

/** Pernyataan benar/salah dari "Ayo Berpikir Kritis" dipakai di peraga A.1. */
export const sources = { bytes: [10, 20, 30] };
