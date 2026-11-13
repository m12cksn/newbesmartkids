/**
 * Kelas 9 Bab 1 - Sistem Persamaan Linear Dua Variabel (Buku Siswa Matematika SMP/MTs Kelas IX, Kurikulum Merdeka 2022, hlm. 1-40).
 * A. Persamaan Linear Dua Variabel  B. Sistem Persamaan Linear Dua Variabel (1. grafik, 2. substitusi, 3. eliminasi, 4. campuran)
 * Bentuk jawaban mengikuti buku: menentukan PLDV atau bukan, memeriksa pasangan berurutan, memodelkan pernyataan menjadi ax + by = c,
 * persamaan dari grafik, himpunan penyelesaian (bilangan cacah), benar atau salah, mencocokkan sistem dengan grafik,
 * menyelesaikan sistem dengan grafik/substitusi/eliminasi/campuran, nilai n atau p + q, serta soal cerita (Uji Kompetensi).
 * Teks matematika memakai penanda: ^{…} pangkat, {a/b} pecahan bertumpuk.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka: 1.500 (ribuan), 0,15 (desimal), −3, dan pecahan -1/2 ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  const f = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t);
  if (f) { const a = num(f[1]), b = num(f[2]); return b === 0 ? NaN : a / b; }
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
/** Pecahan sederhana untuk ditampilkan: 0,5 → {1/2}, −1,5 → −{3/2}. */
export function frac(v: number): string {
  if (Number.isInteger(Math.round(v * 1e9) / 1e9)) return idn(Math.round(v));
  for (let d = 2; d <= 30; d++) { const n = Math.round(v * d); if (Math.abs(n / d - v) < 1e-9) return `${n < 0 ? "−" : ""}{${Math.abs(n)}/${d}}`; }
  return idn(Math.round(v * 100) / 100);
}
/** "ax + by = c" dalam teks: 2x − y = 4, −x + 3y = 0. */
export function eqText(a: number, b: number, c: number, x = "x", y = "y") {
  const term = (k: number, v: string, first: boolean) => {
    if (k === 0) return "";
    const abs = Math.abs(k), coef = abs === 1 ? "" : frac(abs);
    return first ? `${k < 0 ? "−" : ""}${coef}${v}` : ` ${k < 0 ? "−" : "+"} ${coef}${v}`;
  };
  const left = `${term(a, x, true)}${term(b, y, a === 0)}` || "0";
  return `${left} = ${frac(c)}`;
}
/** Penyelesaian sistem dua persamaan: titik, "sejajar" (tidak ada) atau "berimpit" (tak hingga). */
export function solve(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number): { x: number; y: number } | "sejajar" | "berimpit" {
  const d = a1 * b2 - a2 * b1;
  if (Math.abs(d) < 1e-12) return Math.abs(a1 * c2 - a2 * c1) < 1e-9 && Math.abs(b1 * c2 - b2 * c1) < 1e-9 ? "berimpit" : "sejajar";
  return { x: (c1 * b2 - c2 * b1) / d, y: (a1 * c2 - a2 * c1) / d };
}

/* ---------- Gambar ---------- */
export type Eq = [number, number, number];
export type GPoint = { x: number; y: number; label?: string };
export type Scene =
  | { type: "plane"; eqs: Eq[]; labels?: string[]; points?: GPoint[]; r?: number }
  | { type: "planes"; items: { eqs: Eq[]; caption: string }[]; r?: number }
  | { type: "receipt"; title: string; rows: { items: string; total: string }[] }
  | { type: "chase"; a: { name: string; start: number; speed: number }; b: { name: string; start: number; speed: number }; clock: number; hours: number }
  | { type: "angles"; small: string; big: string }
  | { type: "card"; title: string; lines: string[] };

export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; pre?: string }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "table"; label: string; xs: number[]; ys: number[] }
  | { kind: "point"; label: string; x: number; y: number }
  | { kind: "eq"; label: string; a: number; b: number; c: number; x?: string; y?: string }
  | { kind: "draw"; label: string; a: number; b: number; c: number; r: number }
  | { kind: "pick"; label: string; a: number; b: number; c: number; r: number };

export type SQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[]; sys?: [number, number, number, number, number, number]; id?: string };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "table" ? p.xs.length : p.kind === "point" ? 2 : p.kind === "eq" ? 3 : 1);
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => idn(n).replace(/\./g, "");
/** Titik bilangan bulat pada garis ax + by = c di dalam kotak −r…r. */
export const latticeOn = (p: { a: number; b: number; c: number; r: number }, cacah = false) => {
  const out: [number, number][] = [];
  for (let x = cacah ? 0 : -p.r; x <= p.r; x++) for (let y = cacah ? 0 : -p.r; y <= p.r; y++) if (p.a * x + p.b * y === p.c) out.push([x, y]);
  return out;
};
export const drawPoints = (v: string): [number, number][] => (v ? v.split(";").map(s => s.split(",").map(Number) as [number, number]) : []);
const setKey = (pts: [number, number][]) => pts.map(p => p.join(",")).sort().join(";");
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "table": return p.ys.map(str);
    case "point": return [str(p.x), str(p.y)];
    case "eq": return [str(p.a), str(p.b), str(p.c)];
    case "draw": { const pts = latticeOn(p); if (pts.length < 2) throw new Error("garis tanpa dua titik bulat"); return [`${pts[0].join(",")};${pts.at(-1)!.join(",")}`]; }
    case "pick": { const pts = latticeOn(p, true); if (!pts.length) throw new Error("tanpa penyelesaian cacah"); return [pts.map(q => q.join(",")).join(";")]; }
  }
}
const near = (a: number, b: number) => !Number.isNaN(a) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return near(num(v), p.value);
    case "table": return p.ys.every((y, k) => near(num(x[k]), y));
    case "point": return near(num(x[0]), p.x) && near(num(x[1]), p.y);
    case "eq": { const [a, b, c] = x.map(num); if ([a, b, c].some(Number.isNaN) || (a === 0 && b === 0)) return false;
      const z = (u: number) => Math.abs(u) < 1e-12 * Math.max(1, Math.abs(p.a), Math.abs(p.b), Math.abs(p.c)) * Math.max(1, Math.abs(a), Math.abs(b), Math.abs(c));
      return z(a * p.b - b * p.a) && z(a * p.c - c * p.a) && z(b * p.c - c * p.b); }
    case "draw": { const pts = drawPoints(v); return pts.length === 2 && (pts[0][0] !== pts[1][0] || pts[0][1] !== pts[1][1]) && pts.every(([px, py]) => p.a * px + p.b * py === p.c); }
    case "pick": return setKey(drawPoints(v)) === setKey(latticeOn(p, true));
    default: return x.join("|") === fields(p).join("|");
  }
}
function partReady(p: Part, v: string) {
  if (p.kind === "num" || p.kind === "choice") return v.trim() !== "";
  if (p.kind === "draw") return drawPoints(v).length === 2;
  if (p.kind === "pick") return drawPoints(v).length > 0;
  return cells(p, v).every(c => c.trim() !== "");
}
export const correct = (q: SQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: SQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2").replace(/[{}]/g, "");
export function formatAnswer(q: SQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${p.pre ?? ""}${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "choice": return `${plain(p.label)} ${plain(v[i]) || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      case "table": return `${plain(p.label)} ${p.xs.map((xx, k) => `x = ${idn(xx)}: y = ${x[k]}`).join(", ")}`;
      case "point": return `${plain(p.label)} (${x[0]}, ${x[1]})`;
      case "eq": return `${plain(p.label)} (${x[0]})${p.x ?? "x"} + (${x[1]})${p.y ?? "y"} = ${x[2]}`;
      case "draw": case "pick": { const pts = drawPoints(v[i]); return `${plain(p.label)} ${pts.length ? pts.map(([a, b]) => `(${a}, ${b})`).join(p.kind === "draw" ? " dan " : ", ") : "…"}`; }
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: number, prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene; sys?: SQuestion["sys"]; id?: string } = {}): SQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (lbl: string, value: number, unit?: string, pre?: string): Part => ({ kind: "num", label: lbl, value, unit, pre });
const ch = (lbl: string, options: string[], answer: string): Part => ({ kind: "choice", label: lbl, options, answer });
const pt = (lbl: string, x: number, y: number): Part => ({ kind: "point", label: lbl, x, y });
const eq = (lbl: string, a: number, b: number, c: number, x?: string, y?: string): Part => ({ kind: "eq", label: lbl, a, b, c, x, y });
const PL = ["PLDV", "Bukan PLDV"], YB = ["Penyelesaian", "Bukan"], KIND = ["Tepat satu", "Tidak ada", "Tak hingga"];

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Persamaan Linear Dua Variabel", sections: [
    { title: "Bentuk ax + by = c dan model matematika", lab: "model", steps: [
      "Persamaan linear dua variabel (PLDV) adalah persamaan yang dapat dinyatakan dalam bentuk ax + by = c, dengan x dan y variabel, a, b, c bilangan real, serta a dan b tidak keduanya nol.",
      "Ciri PLDV: ada tepat dua variabel, masing-masing berpangkat satu, dan kedua variabel tidak saling dikalikan. 3a = 5 − b dan {x/2} + 2y = 10 termasuk PLDV karena dapat ditulis 3a + b = 5 dan {1/2}x + 2y = 10.",
      "Bukan PLDV: 3p − 6 = 7 dan −n − 3 = 4n (hanya satu variabel), xy + y = 4 (variabel dikalikan), x^{2} + y = 9 (pangkat dua).",
      "Memodelkan masalah: (1) tentukan besaran yang belum diketahui dan beri nama variabel, lengkap dengan satuannya; (2) terjemahkan setiap bagian kalimat, misalnya banyak barang × harga; (3) susun persamaannya.",
      "Persamaan boleh disederhanakan dengan membagi kedua ruas dengan bilangan yang sama: 20.000x + 10.000y = 120.000 sama dengan 2x + y = 12. Penyelesaiannya tidak berubah.",
    ], life: "Veronika membeli beras merah Rp20.000,00 per kg dan tepung terigu Rp10.000,00 per kg, lalu membayar Rp120.000,00. Jika x berat beras merah dan y berat tepung (kg), modelnya 20.000x + 10.000y = 120.000. Satu persamaan ini belum cukup untuk mengetahui berat masing-masing: Veronika bisa membeli 0 kg beras dan 12 kg tepung, 2 kg beras dan 8 kg tepung, dan seterusnya. Contoh lain: neraca pegas yang meregang 2,4 cm untuk beban 200 g dimodelkan 250x − 3y = 0, dengan x regangan (cm) dan y berat beban (g).",
      example: "Tissa membeli 3 buku tulis dan 5 bolpoin dengan membayar Rp19.000,00. Buat modelnya, lalu cari harga bolpoin jika harga buku tulis Rp3.000,00.",
      work: ["Misalkan m = harga 1 buku tulis dan n = harga 1 bolpoin (rupiah).", "3 buku tulis: 3m. 5 bolpoin: 5n. Model: 3m + 5n = 19.000.", "Jika m = 3.000: 9.000 + 5n = 19.000, 5n = 10.000, n = 2.000.", "Pasangan (3.000, 2.000) adalah salah satu penyelesaian. Jika m berubah, n ikut berubah."],
      notes: ["Variabel harus jelas artinya: \"x = beras\" kurang tepat, yang benar \"x = berat beras merah dalam kg\".", "Bentuk y = 35.000x juga PLDV, karena dapat ditulis 35.000x − y = 0.", "Tarif listrik Rp1.444,70 per kWh ditambah biaya tetap Rp6.000,00 menjadi y = 1.444,70x + 6.000, dengan x pemakaian (kWh) dan y tagihan (rupiah)."],
      demo: "Atur harga kedua barang, uang yang dibayar, dan berat beras merah. Berat tepung dihitung dari persamaannya, lalu titik (x, y) ditandai pada grafik." },
    { title: "Penyelesaian dan himpunan penyelesaian", lab: "solutions", steps: [
      "Penyelesaian PLDV adalah pasangan berurutan (x, y) yang membuat persamaan bernilai benar. Caranya: pilih nilai salah satu variabel, lalu hitung variabel yang lain.",
      "Untuk memeriksa sebuah pasangan, substitusikan x dan y sekaligus. Contoh: (−2, 3) pada −3x − 4y = −6 memberi 6 − 12 = −6, benar.",
      "Himpunan penyelesaian adalah himpunan semua penyelesaian. Isinya bergantung pada semesta x dan y: bilangan cacah, bulat, atau real.",
      "2x + y = 8 dengan x, y cacah: {(0, 8), (1, 6), (2, 4), (3, 2), (4, 0)}. Dengan x, y bulat: tak hingga tetapi dapat didaftar, {…, (−1, 10), (0, 8), (1, 6), …}.",
      "Dengan x, y real, penyelesaiannya semua titik pada garis 2x + y = 8: {(x, y) | 2x + y = 8; x, y ∈ R}. Jika semestanya tidak disebutkan, anggap x dan y bilangan real.",
    ], life: "Uang Rp50.000,00 dipakai untuk membeli roti Rp5.000,00 dan susu kotak Rp10.000,00 sampai tepat habis: 5.000x + 10.000y = 50.000, atau x + 2y = 10. Banyak barang tidak mungkin pecahan atau negatif, jadi semestanya bilangan cacah: (0, 5), (2, 4), (4, 3), (6, 2), (8, 1), dan (10, 0). Ada enam cara berbelanja.",
      example: "Tentukan himpunan penyelesaian 3x + 2y = 12 untuk x dan y bilangan cacah.",
      work: ["x = 0: 2y = 12, y = 6 → (0, 6).", "x = 1: 2y = 9, y = 4,5 (bukan cacah).", "x = 2: 2y = 6, y = 3 → (2, 3). x = 3: y = 1,5 (bukan cacah).", "x = 4: y = 0 → (4, 0). Untuk x ≥ 5, y negatif.", "Himpunan penyelesaian: {(0, 6), (2, 3), (4, 0)}."],
      notes: ["Pasangan berurutan: (2, 3) berbeda dengan (3, 2). Urutannya selalu (x, y).", "Pasangan yang memenuhi persamaan tetapi bukan cacah, misalnya (5, −2) pada 2x + y = 8, tidak termasuk himpunan penyelesaian cacah.", "Pada grafik, penyelesaian cacah tampak sebagai titik-titik terpisah, sedangkan penyelesaian real membentuk garis utuh."],
      demo: "Atur a, b, dan c pada ax + by = c, lalu pilih semestanya. Penyelesaiannya ditandai pada bidang koordinat dan didaftar." },
  ] },
  { code: "B", title: "Sistem Persamaan Linear Dua Variabel", sections: [
    { title: "Metode grafik", lab: "graph", steps: [
      "Dua PLDV yang saling berkaitan, ax + by = c dan dx + ey = f, membentuk sistem persamaan linear dua variabel (SPLDV). Penyelesaiannya adalah pasangan (x, y) yang memenuhi kedua persamaan sekaligus.",
      "Langkah metode grafik: (1) gambar kedua garis pada satu bidang koordinat, misalnya melalui titik potong sumbu-x dan sumbu-y; (2) tentukan titik potong kedua garis; (3) periksa titik itu pada kedua persamaan.",
      "Contoh: 4x − 3y = 24 melalui (0, −8) dan (6, 0); 2x − y = 10 melalui (0, −10) dan (5, 0). Kedua garis berpotongan di (3, −4). Periksa: 4(3) − 3(−4) = 24 dan 2(3) − (−4) = 10.",
      "Ada tiga kemungkinan: garis berpotongan di satu titik (tepat satu penyelesaian), sejajar (tidak ada penyelesaian), atau berimpit (tak hingga penyelesaian).",
      "Dari koefisien sistem ax + by = c dan px + qy = r: jika {a/p} ≠ {b/q}, tepat satu penyelesaian; jika {a/p} = {b/q} ≠ {c/r}, sejajar; jika {a/p} = {b/q} = {c/r}, berimpit.",
    ], life: "Pukul 08.00 Putri berangkat dari Yogyakarta ke Semarang dengan kecepatan 60 km/jam. Setengah jam kemudian Akbar menyusul lewat jalan yang sama dengan kecepatan 80 km/jam. Dengan x jam setelah pukul 08.00 dan y jarak (km): Putri y = 60x, Akbar y = 80(x − {1/2}) = 80x − 40. Kedua garis berpotongan di (2, 120): Akbar menyusul Putri pukul 10.00, 120 km dari Yogyakarta. Kemiringan garis menunjukkan kecepatan, jadi garis Akbar lebih curam.",
      example: "Selesaikan dengan metode grafik: x + y = 5 dan 2x − y = 4.",
      work: ["x + y = 5 melalui (0, 5) dan (5, 0).", "2x − y = 4 melalui (0, −4) dan (2, 0).", "Kedua garis tampak berpotongan di (3, 2).", "Periksa: 3 + 2 = 5 dan 2(3) − 2 = 4. Penyelesaiannya (3, 2)."],
      notes: ["Metode grafik kurang teliti jika titik potongnya pecahan, misalnya (1,3; 0,4). Periksa selalu dengan substitusi atau gunakan metode lain.", "3x + 2y = 6 dan 6x + 4y = 12 bukan garis sejajar: persamaan kedua adalah persamaan pertama dikali 2, jadi garisnya berimpit.", "Sistem y = 2x − 2 dan y = 2x + 2 mempunyai kemiringan sama dan titik potong sumbu-y berbeda, jadi garisnya sejajar."],
      demo: "Atur koefisien kedua persamaan. Kedua garis digambar, lalu titik potongnya ditandai, atau ditulis sejajar atau berimpit." },
    { title: "Metode substitusi", lab: "subst", steps: [
      "Ide metode substitusi: nyatakan satu variabel dalam variabel yang lain, lalu gantikan ke persamaan kedua sehingga tersisa satu variabel.",
      "Langkah 1: pilih persamaan yang paling mudah dan ubah menjadi x = … atau y = … . Paling mudah jika koefisiennya 1 atau −1.",
      "Langkah 2: substitusikan hasil langkah 1 ke persamaan yang lain, lalu selesaikan persamaan linear satu variabel yang terbentuk.",
      "Langkah 3: substitusikan nilai yang didapat ke hasil langkah 1 untuk mendapat variabel yang lain. Periksa pasangan itu pada kedua persamaan.",
      "Jika muncul pernyataan yang selalu salah, misalnya 0 = 5, sistem tidak mempunyai penyelesaian. Jika muncul 0 = 0 setelah substitusi ke persamaan yang lain, penyelesaiannya tak hingga.",
    ], life: "Pak Ahmad punya Rp42.000.000,00 untuk membeli 25 sepeda: sepeda gunung Rp1.500.000,00 dan sepeda balap Rp2.000.000,00. Dengan x sepeda gunung dan y sepeda balap: x + y = 25 dan 1.500.000x + 2.000.000y = 42.000.000, disederhanakan menjadi 3x + 4y = 84. Dari x = 25 − y: 3(25 − y) + 4y = 84, 75 + y = 84, y = 9 dan x = 16. Pak Ahmad membeli 16 sepeda gunung dan 9 sepeda balap.",
      example: "Lebar kebun sayur 4 m lebih pendek dari panjangnya, dan kelilingnya 52 m. Berapa luas kebun?",
      work: ["Misalkan p = panjang dan l = lebar (m): l = p − 4 dan 2p + 2l = 52.", "Substitusi: 2p + 2(p − 4) = 52, 4p − 8 = 52, p = 15.", "l = 15 − 4 = 11.", "Luas = 15 × 11 = 165 m²."],
      notes: ["Joko menyelesaikan x + 2y = 10 dan −2x + 3y = −6 dengan memasukkan x = −2y + 10 kembali ke x + 2y = 10, lalu mendapat 10 = 10. Itu keliru: substitusi harus ke persamaan yang lain. Hasil yang benar (6, 2).", "Metode substitusi paling cocok jika salah satu persamaan sudah berbentuk x = … atau y = … .", "Jawaban soal cerita harus masuk akal: banyak sepeda tidak boleh pecahan atau negatif."],
      demo: "Atur banyak sepeda, harga masing-masing, dan uang Pak Ahmad. Ketiga langkah substitusi ditulis, lalu diperiksa apakah hasilnya mungkin dibeli." },
    { title: "Metode eliminasi", lab: "elim", steps: [
      "Ide metode eliminasi: menghilangkan (mengeliminasi) satu variabel dengan menjumlahkan atau mengurangkan kedua persamaan.",
      "Samakan dulu koefisien variabel yang akan dihilangkan dengan mengalikan setiap persamaan, biasanya memakai KPK kedua koefisien.",
      "Jika koefisiennya sama dan tandanya sama, kurangkan kedua persamaan. Jika sama tetapi tandanya berlawanan, jumlahkan.",
      "Ulangi untuk variabel yang lain (eliminasi dua kali), lalu tulis penyelesaiannya sebagai (x, y).",
      "Contoh 3x − 4y = 15 dan 5x + 2y = 12: hilangkan x dengan ×5 dan ×3, didapat −26y = 39, y = −{3/2}. Hilangkan y dengan ×1 dan ×2, didapat 13x = 39, x = 3.",
    ], life: "Di warung, 2 porsi nasi goreng dan 3 gelas es teh harganya Rp41.000,00, sedangkan 2 porsi nasi goreng dan 1 gelas es teh Rp33.000,00. Kurangkan kedua nota: koefisien nasi goreng sama, tersisa 2 gelas es teh = Rp8.000,00, jadi es teh Rp4.000,00 dan nasi goreng Rp14.500,00. Butet memakai cara yang sama untuk Putri dan Akbar: 80x − y = 40 dikurangi 60x − y = 0 memberi 20x = 40, x = 2, lalu y = 120.",
      example: "Selesaikan dengan eliminasi: 2x + 3y = 12 dan 5x − 2y = 11.",
      work: ["Hilangkan x: kalikan persamaan I dengan 5 dan II dengan 2: 10x + 15y = 60 dan 10x − 4y = 22.", "Kurangkan: 19y = 38, y = 2.", "Hilangkan y: kalikan I dengan 2 dan II dengan 3: 4x + 6y = 24 dan 15x − 6y = 33.", "Jumlahkan: 19x = 57, x = 3. Penyelesaiannya (3, 2)."],
      notes: ["Cara eliminasi tidak hanya menjumlahkan: boleh mengurangkan, dan sering perlu mengalikan dulu.", "Saat mengalikan, semua suku dikalikan, termasuk ruas kanan.", "Saat mengurangkan, tanda setiap suku ikut berubah: −4y − 6y = −10y, bukan 2y."],
      demo: "Atur kedua persamaan dan pilih variabel yang dihilangkan dulu. Pengali, persamaan hasil kali, dan hasil eliminasinya ditulis." },
    { title: "Metode campuran", lab: "mixed", steps: [
      "Metode campuran: eliminasi untuk mencari nilai satu variabel, lalu substitusi nilai itu ke salah satu persamaan untuk variabel yang lain.",
      "Pilih variabel yang paling mudah dihilangkan, yaitu yang koefisiennya sudah sama atau kelipatan.",
      "Substitusikan ke persamaan yang paling sederhana agar hitungannya pendek.",
      "Untuk soal cerita: tentukan variabel dan satuannya, susun dua persamaan, selesaikan, lalu jawab pertanyaan yang sebenarnya diminta, misalnya harga 7 kg jeruk dan 1 kg apel.",
      "Periksa apakah jawabannya masuk akal: harga harus positif, banyak barang harus bilangan cacah, dan hasilnya memenuhi kedua persamaan.",
    ], life: "Garlola membeli 5 kain tenun buna dan 2 tenun ikat seharga Rp5.150.000,00, sedangkan Laberi membeli 2 tenun buna dan 3 tenun ikat seharga Rp3.050.000,00. Eliminasi memberi harga tenun buna Rp850.000,00, lalu substitusi memberi tenun ikat Rp450.000,00. Tanesya punya Rp5.500.000,00 untuk 9 kain: 9 tenun ikat (Rp4.050.000,00) terbeli, tetapi 9 tenun buna (Rp7.650.000,00) tidak. Jadi Garlola benar: cukup atau tidaknya bergantung pada jenis kain yang dibeli.",
      example: "Selesaikan dengan metode campuran: 2x + 5y = −1 dan 3x − 2y = 8.",
      work: ["Eliminasi x: kalikan I dengan 3 dan II dengan 2: 6x + 15y = −3 dan 6x − 4y = 16.", "Kurangkan: 19y = −19, y = −1.", "Substitusi y = −1 ke 2x + 5y = −1: 2x − 5 = −1, x = 2.", "Periksa: 3(2) − 2(−1) = 8. Penyelesaiannya (2, −1)."],
      notes: ["Metode campuran sering paling cepat karena eliminasi cukup dilakukan sekali.", "Persamaan dengan pecahan, seperti {1/2}x − 3y = 11, dapat dikalikan dulu dengan penyebutnya agar koefisiennya bilangan bulat.", "Untuk soal campuran larutan atau logam, susun satu persamaan untuk berat total dan satu untuk kandungan zatnya."],
      demo: "Atur isi dua nota belanja buah. Harga per kg dicari dengan eliminasi lalu substitusi, kemudian dipakai menghitung belanja baru." },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: `${t.code}.${j + 1}`, topic: t })));

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: SQuestion[][] = [
  [
    q(0, "Manakah yang merupakan persamaan linear dua variabel?", [{ kind: "classify", options: PL, rows: [
      { text: "4p − 5 = 11", answer: "Bukan PLDV" }, { text: "2a = 7 − b", answer: "PLDV" }, { text: "3p − 5q = −2p", answer: "PLDV" }, { text: "−2n + 1 = 5n", answer: "Bukan PLDV" }, { text: "{x/2} + 3y = 8", answer: "PLDV" }] }],
      "4p − 5 = 11 dan −2n + 1 = 5n hanya memuat satu variabel. 3p − 5q = −2p dapat ditulis 5p − 5q = 0, tetap dua variabel."),
    q(0, "Harga tiket sebuah bioskop Rp40.000,00. y menyatakan pendapatan dari penjualan tiket dan x banyak tiket yang terjual. Tulis dalam bentuk ax + by = c.", [eq("Model:", 40000, -1, 0)],
      "Pendapatan y = 40.000x, ditulis 40.000x − y = 0. Bentuk lain yang setara, misalnya −40.000x + y = 0, juga benar."),
    q(0, "Tarif listrik Rp1.500,00 per kWh ditambah biaya tetap Rp5.000,00 per bulan. x menyatakan pemakaian (kWh) dan y tagihan sebulan (rupiah). Tulis dalam bentuk ax + by = c.", [eq("Model:", 1500, -1, -5000)],
      "y = 1.500x + 5.000, ditulis 1.500x − y = −5.000."),
    q(0, "Rani membeli 4 buku tulis dan 3 bolpoin seharga Rp27.000,00. Misalkan m harga 1 buku tulis dan n harga 1 bolpoin.", [eq("Model:", 4, 3, 27000, "m", "n"), n("Jika harga buku tulis Rp4.500,00, harga 1 bolpoin =", 3000, undefined, "Rp")],
      "4m + 3n = 27.000. Untuk m = 4.500: 18.000 + 3n = 27.000, 3n = 9.000, n = 3.000.", { scene: { type: "receipt", title: "Toko alat tulis", rows: [{ items: "4 buku tulis + 3 bolpoin", total: "Rp27.000,00" }] } }),
  ],
  [
    q(1, "Apakah pasangan berurutan berikut merupakan penyelesaian persamaannya?", [{ kind: "classify", options: YB, rows: [
      { text: "y = 4x; (0, 4)", answer: "Bukan" }, { text: "y = 2x − 5; ({1/2}, −4)", answer: "Penyelesaian" }, { text: "−2x − 3y = −5; (−2, 3)", answer: "Penyelesaian" }, { text: "2y = 3x + 2; (−2, −3)", answer: "Bukan" }] }],
      "4(0) = 0 ≠ 4. 2({1/2}) − 5 = −4. 4 − 9 = −5. 2(−3) = −6, sedangkan 3(−2) + 2 = −4."),
    q(1, "Lengkapi tabel penyelesaian persamaan 3x + y = 9.", [{ kind: "table", label: "Nilai y:", xs: [0, 1, 2, 3], ys: [9, 6, 3, 0] }],
      "y = 9 − 3x: 9, 6, 3, 0. Setiap kali x naik 1, y turun 3."),
    q(1, "Tentukan himpunan penyelesaian 2x + y = 6 untuk x dan y bilangan cacah: ketuk semua titik penyelesaiannya.", [{ kind: "pick", label: "Penyelesaian cacah 2x + y = 6:", a: 2, b: 1, c: 6, r: 6 }],
      "x = 0, 1, 2, 3 memberi y = 6, 4, 2, 0. Himpunan penyelesaian {(0, 6), (1, 4), (2, 2), (3, 0)}."),
    q(1, "Perhatikan persamaan x + 3y = 12.", [n("Banyak penyelesaian jika x dan y bilangan cacah =", 5), ch("Jika x dan y bilangan real, banyak penyelesaiannya", ["5", "Tak hingga", "Tidak ada"], "Tak hingga")],
      "Cacah: (0, 4), (3, 3), (6, 2), (9, 1), (12, 0), ada 5. Real: semua titik pada garis, tak hingga banyaknya."),
  ],
  [
    q(2, "Benar atau salah?", [{ kind: "tf", statements: [
      { text: "Pasangan (x, y) adalah penyelesaian SPLDV jika memenuhi semua persamaan pada sistem itu.", answer: true },
      { text: "Pada sistem ax + by = c dan px + qy = r, jika {a/p} = {b/q} maka sistem itu mempunyai tepat satu penyelesaian.", answer: false }] }],
      "Jika {a/p} = {b/q}, kedua garis mempunyai kemiringan sama: sejajar (tidak ada penyelesaian) atau berimpit (tak hingga)."),
    q(2, "Tentukan penyelesaian sistem y = x + 1 dan x + y = 5 dari grafiknya.", [pt("Penyelesaian:", 2, 3)],
      "Kedua garis berpotongan di (2, 3). Periksa: 3 = 2 + 1 dan 2 + 3 = 5.", { scene: { type: "plane", eqs: [[-1, 1, 1], [1, 1, 5]], labels: ["y = x + 1", "x + y = 5"], r: 6 }, sys: [-1, 1, 1, 1, 1, 5] }),
    q(2, "Selesaikan dengan metode grafik: gambar kedua garis (ketuk dua titik pada setiap garis), lalu tulis titik potongnya.", [
      { kind: "draw", label: "Garis x − y = 1:", a: 1, b: -1, c: 1, r: 5 }, { kind: "draw", label: "Garis x + 2y = 4:", a: 1, b: 2, c: 4, r: 5 }, pt("Titik potong:", 2, 1)],
      "x − y = 1 melalui (1, 0) dan (0, −1). x + 2y = 4 melalui (4, 0) dan (0, 2). Titik potongnya (2, 1).", { sys: [1, -1, 1, 1, 2, 4] }),
    q(2, "Berapa banyak penyelesaian setiap sistem?", [{ kind: "classify", options: KIND, rows: [
      { text: "y = 3x − 1 dan y = 3x + 4", answer: "Tidak ada" }, { text: "x + y = 3 dan 2x − y = 0", answer: "Tepat satu" }, { text: "x − 2y = 4 dan −3x + 6y = −12", answer: "Tak hingga" }] }],
      "Kemiringan sama dan titik potong sumbu-y berbeda: sejajar. Kemiringan berbeda: berpotongan. −3x + 6y = −12 adalah x − 2y = 4 dikali −3: berimpit."),
  ],
  [
    q(3, "Selesaikan dengan metode substitusi: y = 2x − 1 dan 3x + 2y = 12.", [pt("Penyelesaian:", 2, 3)],
      "3x + 2(2x − 1) = 12, 7x − 2 = 12, x = 2. y = 2(2) − 1 = 3.", { sys: [-2, 1, -1, 3, 2, 12] }),
    q(3, "Pak Budi membeli 20 kursi untuk aula: kursi plastik Rp150.000,00 dan kursi kayu Rp250.000,00 per buah. Uangnya Rp3.800.000,00 habis.", [n("Kursi plastik =", 12, "buah"), n("Kursi kayu =", 8, "buah")],
      "x + y = 20 dan 150.000x + 250.000y = 3.800.000 → 3x + 5y = 76. x = 20 − y: 60 − 3y + 5y = 76, y = 8, x = 12.", { sys: [1, 1, 20, 3, 5, 76], id: "kursi" }),
    q(3, "Lebar sebuah kebun 3 m lebih pendek dari panjangnya, dan kelilingnya 46 m.", [n("Panjang =", 13, "m"), n("Luas kebun =", 130, "m²")],
      "l = p − 3 dan 2p + 2l = 46. 2p + 2(p − 3) = 46, 4p = 52, p = 13, l = 10. Luas 13 × 10 = 130 m².", { id: "kebun" }),
    q(3, "Joko menyelesaikan x + 2y = 10 dan −2x + 3y = −6. Ia mengubah persamaan pertama menjadi x = −2y + 10, memasukkannya kembali ke x + 2y = 10, lalu mendapat 10 = 10 sehingga menyimpulkan penyelesaiannya banyak. Manakah yang benar?", [ch("Jawaban:", [
      "Pekerjaan Joko benar, penyelesaiannya tak hingga.", "x = −2y + 10 seharusnya disubstitusikan ke −2x + 3y = −6; penyelesaiannya (6, 2).", "x = −2y + 10 seharusnya disubstitusikan ke −2x + 3y = −6; penyelesaiannya (4, 3).", "Sistem itu tidak mempunyai penyelesaian."],
      "x = −2y + 10 seharusnya disubstitusikan ke −2x + 3y = −6; penyelesaiannya (6, 2).")],
      "−2(−2y + 10) + 3y = −6, 7y − 20 = −6, y = 2, x = 6. Pasangan (4, 3) hanya memenuhi persamaan pertama.", { sys: [1, 2, 10, -2, 3, -6] }),
  ],
  [
    q(4, "Selesaikan dengan metode eliminasi: 3x + 4y = 10 dan 2x − 4y = 0.", [pt("Penyelesaian:", 2, 1)],
      "Koefisien y berlawanan, jumlahkan: 5x = 10, x = 2. Hilangkan x (×2 dan ×3): 6x + 8y = 20 dan 6x − 12y = 0, kurangkan: 20y = 20, y = 1.", { sys: [3, 4, 10, 2, -4, 0] }),
    q(4, "Selesaikan 4x + 3y = 5 dan 6x − 5y = 17 dengan menghilangkan x lebih dulu.", [ch("Pengali persamaan I dan II:", ["3 dan 2", "2 dan 3", "6 dan 5", "5 dan 3"], "3 dan 2"), pt("Penyelesaian:", 2, -1)],
      "KPK 4 dan 6 adalah 12: I × 3 → 12x + 9y = 15, II × 2 → 12x − 10y = 34. Kurangkan: 19y = −19, y = −1. 4x − 3 = 5, x = 2.", { sys: [4, 3, 5, 6, -5, 17] }),
    q(4, "Sinta bersepeda 50 m/menit dari rumah. Kakaknya menyusul 3 menit kemudian. Model jarak (m) setelah x menit: Sinta 50x − y = 0, kakak 70x − y = 210. Kapan kakak menyusul?", [pt("Penyelesaian (x, y):", 10.5, 525)],
      "Kurangkan kedua persamaan: 20x = 210, x = 10,5. y = 50(10,5) = 525. Kakak menyusul pada menit ke-10,5, setelah 525 m.", { sys: [50, -1, 0, 70, -1, 210] }),
    q(4, "Di warung bakso, 3 mangkuk bakso dan 2 gelas es jeruk Rp51.000,00, sedangkan 3 mangkuk bakso dan 4 gelas es jeruk Rp63.000,00.", [n("Harga 1 gelas es jeruk =", 6000, undefined, "Rp"), n("Harga 1 mangkuk bakso =", 13000, undefined, "Rp")],
      "Kurangkan: 2 gelas es jeruk = 12.000, es jeruk 6.000. 3 bakso = 51.000 − 12.000 = 39.000, bakso 13.000.",
      { sys: [3, 2, 51000, 3, 4, 63000], scene: { type: "receipt", title: "Warung bakso", rows: [{ items: "3 bakso + 2 es jeruk", total: "Rp51.000,00" }, { items: "3 bakso + 4 es jeruk", total: "Rp63.000,00" }] } }),
  ],
  [
    q(5, "Selesaikan dengan metode campuran: 3x + 2y = 4 dan x − 4y = 6.", [pt("Penyelesaian:", 2, -1)],
      "I × 2: 6x + 4y = 8. Jumlahkan dengan II: 7x = 14, x = 2. Substitusi: 6 + 2y = 4, y = −1.", { sys: [3, 2, 4, 1, -4, 6] }),
    q(5, "Toko batik: 3 kain batik tulis dan 2 kain batik cap Rp1.900.000,00; 2 kain batik tulis dan 5 kain batik cap Rp2.000.000,00. Rina punya Rp2.400.000,00 dan ingin membeli 6 kain.", [
      n("Harga 1 kain batik tulis =", 500000, undefined, "Rp"), n("Harga 1 kain batik cap =", 200000, undefined, "Rp"), n("Banyak batik tulis paling banyak di antara 6 kain itu =", 4)],
      "Eliminasi: 6t + 4c = 3.800.000 dan 6t + 15c = 6.000.000, 11c = 2.200.000, c = 200.000; t = (1.900.000 − 400.000) : 3 = 500.000. 500.000t + 200.000(6 − t) ≤ 2.400.000 → 300.000t ≤ 1.200.000, t ≤ 4.",
      { sys: [3, 2, 1900000, 2, 5, 2000000], id: "batik", scene: { type: "receipt", title: "Toko batik", rows: [{ items: "3 batik tulis + 2 batik cap", total: "Rp1.900.000,00" }, { items: "2 batik tulis + 5 batik cap", total: "Rp2.000.000,00" }] } }),
    q(5, "Teka-teki dua bilangan: \"{1/3} dari bilangan pertama ditambah 2 sama dengan {1/2} dari bilangan kedua.\" \"Bilangan pertama 9 kurangnya dari dua kali bilangan kedua.\"", [n("Bilangan pertama =", 3), n("Bilangan kedua =", 6)],
      "{a/3} + 2 = {b/2} → 2a − 3b = −12, dan a = 2b − 9. 2(2b − 9) − 3b = −12, b = 6, a = 3.", { sys: [2, -3, -12, 1, -2, -9] }),
    q(5, "Diketahui {x + y/2} = 5 dan {x − y/3} = 2. Tentukan x · y.", [n("x · y =", 16)],
      "x + y = 10 dan x − y = 6. Jumlahkan: 2x = 16, x = 8. y = 2. x · y = 16.", { id: "xy" }),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
export const assessment: SQuestion[] = [
  // Sedang (1-8)
  q(0, "Manakah yang merupakan persamaan linear dua variabel?", [{ kind: "classify", options: PL, rows: [
    { text: "4a = 7 − 2b", answer: "PLDV" }, { text: "5p − 3 = 2p", answer: "Bukan PLDV" }, { text: "{x/3} + 2y = 8", answer: "PLDV" }, { text: "xy − 2y = 6", answer: "Bukan PLDV" }, { text: "3m − 4n = −m", answer: "PLDV" }] }],
    "5p − 3 = 2p hanya satu variabel. xy − 2y = 6 memuat perkalian dua variabel. 3m − 4n = −m sama dengan 4m − 4n = 0.", { level: "Sedang" }),
  q(2, "Benar atau salah?", [{ kind: "tf", statements: [
    { text: "Persamaan {3x/7} − {9y/11} = 12 bukan persamaan linear dua variabel.", answer: false },
    { text: "Cara satu-satunya pada metode eliminasi adalah menjumlahkan persamaan pertama dan kedua.", answer: false },
    { text: "Jika {a/p} = {b/q} ≠ {c/r}, sistem ax + by = c dan px + qy = r tidak mempunyai penyelesaian.", answer: true },
    { text: "Jika grafik kedua persamaan berimpit, sistemnya mempunyai tak hingga penyelesaian.", answer: true }] }],
    "{3x/7} − {9y/11} = 12 tetap PLDV (koefisiennya pecahan). Eliminasi juga boleh mengurangkan. Perbandingan a, b sama tetapi c berbeda berarti sejajar. Berimpit berarti tak hingga.", { level: "Sedang" }),
  q(1, "Apakah pasangan berurutan berikut penyelesaian dari 3x − 2y = 8?", [{ kind: "classify", options: YB, rows: [
    { text: "(2, −1)", answer: "Penyelesaian" }, { text: "(0, 4)", answer: "Bukan" }, { text: "({1/3}, −{7/2})", answer: "Penyelesaian" }, { text: "(6, 4)", answer: "Bukan" }] }],
    "6 + 2 = 8. 0 − 8 = −8. 1 + 7 = 8. 18 − 8 = 10.", { level: "Sedang" }),
  q(4, "Selesaikan dengan metode eliminasi: 3x + 2y = 16 dan 5x − 2y = 16.", [pt("Penyelesaian:", 4, 2)],
    "Koefisien y berlawanan, jumlahkan: 8x = 32, x = 4. 12 + 2y = 16, y = 2.", { level: "Sedang", sys: [3, 2, 16, 5, -2, 16] }),
  q(0, "Harga 3 tangkai bunga lili dan 8 tangkai bunga mawar Rp74.000,00. Misalkan x harga 1 tangkai lili dan y harga 1 tangkai mawar. Tulis persamaannya.", [eq("Model:", 3, 8, 74000)],
    "3 lili: 3x, 8 mawar: 8y. Jadi 3x + 8y = 74.000.", { level: "Sedang", scene: { type: "receipt", title: "Toko bunga", rows: [{ items: "3 lili + 8 mawar", total: "Rp74.000,00" }] } }),
  q(3, "Selesaikan dengan metode substitusi: x = 2y − 3 dan 3x + 4y = 31.", [pt("Penyelesaian:", 5, 4)],
    "3(2y − 3) + 4y = 31, 10y − 9 = 31, y = 4. x = 2(4) − 3 = 5.", { level: "Sedang", sys: [1, -2, -3, 3, 4, 31] }),
  q(2, "Selesaikan dengan metode grafik: gambar garis x + y = 5 dan 2x − y = 4 (ketuk dua titik pada setiap garis), lalu tulis titik potongnya.", [
    { kind: "draw", label: "Garis x + y = 5:", a: 1, b: 1, c: 5, r: 6 }, { kind: "draw", label: "Garis 2x − y = 4:", a: 2, b: -1, c: 4, r: 6 }, pt("Titik potong:", 3, 2)],
    "x + y = 5 melalui (0, 5) dan (5, 0). 2x − y = 4 melalui (0, −4) dan (2, 0). Titik potong (3, 2): 3 + 2 = 5 dan 6 − 2 = 4.", { level: "Sedang", sys: [1, 1, 5, 2, -1, 4] }),
  q(1, "Tentukan himpunan penyelesaian x + 2y = 6 untuk x dan y bilangan cacah: ketuk semua titik penyelesaiannya.", [{ kind: "pick", label: "Penyelesaian cacah x + 2y = 6:", a: 1, b: 2, c: 6, r: 6 }],
    "y = 0, 1, 2, 3 memberi x = 6, 4, 2, 0. Himpunan penyelesaian {(0, 3), (2, 2), (4, 1), (6, 0)}. x ganjil membuat y pecahan.", { level: "Sedang" }),
  // Menantang (9-17)
  q(5, "Selesaikan dengan metode campuran: {1/2}x − 3y = 7 dan 2x + 5y = −6.", [pt("Penyelesaian:", 2, -2)],
    "I × 4: 2x − 12y = 28. Kurangkan dari II: 17y = −34, y = −2. Substitusi: {1/2}x + 6 = 7, x = 2.", { level: "Menantang", sys: [0.5, -3, 7, 2, 5, -6] }),
  q(0, "Tentukan persamaan garis pada grafik berikut dalam bentuk ax + by = c.", [eq("Persamaan:", 3, 4, 12)],
    "Garis melalui (4, 0) dan (0, 3). Bentuk {x/4} + {y/3} = 1, dikali 12: 3x + 4y = 12.", { level: "Menantang", scene: { type: "plane", eqs: [[3, 4, 12]], points: [{ x: 4, y: 0 }, { x: 0, y: 3 }], r: 5 } }),
  q(2, "Pasangkan setiap sistem dengan grafiknya.", [{ kind: "classify", options: ["(i)", "(ii)", "(iii)"], rows: [
    { text: "x + y = 2 dan 2x + 2y = 6", answer: "(iii)" }, { text: "x − y = 2 dan 2x − 2y = 4", answer: "(i)" }, { text: "x + y = 2 dan x − y = 2", answer: "(ii)" }] }],
    "x + y = 2 dan x + y = 3 sejajar: (iii). 2x − 2y = 4 sama dengan x − y = 2, berimpit: (i). x + y = 2 dan x − y = 2 berpotongan di (2, 0): (ii).",
    { level: "Menantang", scene: { type: "planes", r: 4, items: [{ eqs: [[1, -1, 2], [2, -2, 4]], caption: "(i)" }, { eqs: [[1, 1, 2], [1, -1, 2]], caption: "(ii)" }, { eqs: [[1, 1, 2], [2, 2, 6]], caption: "(iii)" }] } }),
  q(3, "Panjang sebuah taman bermain 2 m kurangnya dari dua kali lebarnya, dan kelilingnya 50 m.", [n("Lebar =", 9, "m"), n("Panjang =", 16, "m"), n("Luas taman =", 144, "m²")],
    "p = 2l − 2 dan 2p + 2l = 50 → p + l = 25. (2l − 2) + l = 25, 3l = 27, l = 9, p = 16. Luas 144 m².", { level: "Menantang", id: "taman" }),
  q(1, "Tentukan himpunan penyelesaian {x/2} + {y/3} = 2 untuk x dan y bilangan cacah: ketuk semua titik penyelesaiannya.", [{ kind: "pick", label: "Penyelesaian cacah:", a: 3, b: 2, c: 12, r: 6 }],
    "Kalikan 6: 3x + 2y = 12. x = 0, 2, 4 memberi y = 6, 3, 0. x ganjil membuat y pecahan.", { level: "Menantang" }),
  q(4, "Di toko kue tradisional, 1 lemper dan 3 klepon harganya Rp11.000,00, sedangkan 2 lemper dan 5 klepon Rp20.000,00. Berapa harga 3 lemper dan 4 klepon?", [n("Harga 3 lemper dan 4 klepon =", 23000, undefined, "Rp")],
    "I × 2: 2l + 6k = 22.000. Kurangkan II: k = 2.000. l = 11.000 − 6.000 = 5.000. 3(5.000) + 4(2.000) = 23.000.",
    { level: "Menantang", sys: [1, 3, 11000, 2, 5, 20000], id: "kue", scene: { type: "receipt", title: "Toko kue tradisional", rows: [{ items: "1 lemper + 3 klepon", total: "Rp11.000,00" }, { items: "2 lemper + 5 klepon", total: "Rp20.000,00" }] } }),
  q(5, "Tiket terusan sebuah candi: dewasa Rp75.000,00 dan anak-anak Rp40.000,00. Dalam sehari terjual 150 tiket dengan pendapatan Rp9.150.000,00.", [n("Tiket dewasa =", 90), n("Tiket anak-anak =", 60)],
    "x + y = 150 dan 75.000x + 40.000y = 9.150.000 → 15x + 8y = 1.830. I × 8: 8x + 8y = 1.200. Kurangkan: 7x = 630, x = 90. y = 60.",
    { level: "Menantang", sys: [1, 1, 150, 75000, 40000, 9150000], scene: { type: "card", title: "Harga tiket terusan", lines: ["Dewasa: Rp75.000,00", "Anak-anak: Rp40.000,00", "Terjual 150 tiket, pendapatan Rp9.150.000,00"] } }),
  q(2, "Tentukan nilai n agar sistem x − 2y = 5 dan −3x + ny = 4 tidak mempunyai penyelesaian.", [n("n =", 6)],
    "Tidak ada penyelesaian jika {1/−3} = {−2/n} ≠ {5/4}. Dari {1/−3} = {−2/n}: n = 6. Perbandingan c: {5/4} ≠ −{1/3}, jadi garisnya sejajar.", { level: "Menantang", id: "n" }),
  q(4, "Dua sudut saling berpenyiku (jumlahnya 90°). Sudut yang besar 10° lebih dari tiga kali sudut yang kecil.", [n("Sudut kecil =", 20, "°"), n("Sudut besar =", 70, "°")],
    "a + b = 90 dan b − 3a = 10. Kurangkan: 4a = 80, a = 20, b = 70.", { level: "Menantang", sys: [1, 1, 90, -3, 1, 10], scene: { type: "angles", small: "a", big: "b" } }),
  // Sangat menantang (18-24)
  q(5, "Harga 5 kg jeruk dan 2 kg apel Rp128.000,00, sedangkan 3 kg jeruk dan 4 kg apel Rp144.000,00. Berapa yang harus dibayar untuk 7 kg jeruk dan 1 kg apel?", [n("Harga 1 kg jeruk =", 16000, undefined, "Rp"), n("7 kg jeruk dan 1 kg apel =", 136000, undefined, "Rp")],
    "I × 2: 10j + 4a = 256.000. Kurangkan II: 7j = 112.000, j = 16.000. 80.000 + 2a = 128.000, a = 24.000. 7(16.000) + 24.000 = 136.000.",
    { level: "Sangat menantang", sys: [5, 2, 128000, 3, 4, 144000], id: "buah", scene: { type: "receipt", title: "Toko buah", rows: [{ items: "5 kg jeruk + 2 kg apel", total: "Rp128.000,00" }, { items: "3 kg jeruk + 4 kg apel", total: "Rp144.000,00" }] } }),
  q(2, "Dina berangkat pukul 07.00 dengan kecepatan 40 km/jam. Raka berangkat 30 menit kemudian dari tempat yang sama, lewat jalan yang sama, dengan kecepatan 60 km/jam. Garis jarak keduanya digambar pada grafik.", [ch("Raka menyusul Dina pukul", ["08.00", "08.30", "09.00", "09.30"], "08.30"), n("Jarak dari tempat berangkat saat menyusul =", 60, "km")],
    "x jam setelah 07.00: Dina y = 40x, Raka y = 60x − 30. 40x = 60x − 30, x = 1,5 (pukul 08.30), y = 60 km.",
    { level: "Sangat menantang", sys: [40, -1, 0, 60, -1, 30], scene: { type: "chase", a: { name: "Dina", start: 0, speed: 40 }, b: { name: "Raka", start: 0.5, speed: 60 }, clock: 7, hours: 3 } }),
  q(3, "Seorang perajin mencampur logam berkadar perak 40% dan logam berkadar perak 80% untuk membuat 50 gram logam berkadar perak 64%.", [n("Logam 40% =", 20, "gram"), n("Logam 80% =", 30, "gram")],
    "x + y = 50 dan 0,4x + 0,8y = 0,64 × 50 = 32. Substitusi x = 50 − y: 20 + 0,4y = 32, y = 30, x = 20.", { level: "Sangat menantang", sys: [1, 1, 50, 0.4, 0.8, 32] }),
  q(4, "Pesawat yang terbang searah angin menempuh 2.400 km dalam 4 jam. Melawan angin, dalam 4 jam pesawat hanya menempuh 2.000 km.", [n("Kecepatan pesawat di udara tenang =", 550, "km/jam"), n("Kecepatan angin =", 50, "km/jam")],
    "p + a = 2.400 : 4 = 600 dan p − a = 2.000 : 4 = 500. Jumlahkan: 2p = 1.100, p = 550, a = 50.", { level: "Sangat menantang", sys: [1, 1, 600, 1, -1, 500] }),
  q(2, "Sistem 2x + 3y = 5 + p dan (p + 4)x + 6y = 16 − q mempunyai tak hingga penyelesaian. Tentukan p + q.", [n("p + q =", 6)],
    "Berimpit jika {2/p + 4} = {3/6} = {5 + p/16 − q}. Dari {2/p + 4} = {1/2}: p = 0. Lalu {5/16 − q} = {1/2}: q = 6. p + q = 6.", { level: "Sangat menantang", id: "pq" }),
  q(5, "Selesaikan sistem 3(x + y) − 2(x − y) = 19 dan {x + y/7} + x − y = 2.", [pt("Penyelesaian:", 4, 3)],
    "Persamaan I: x + 5y = 19. Persamaan II × 7: x + y + 7x − 7y = 14, jadi 8x − 6y = 14 atau 4x − 3y = 7. I × 4: 4x + 20y = 76; kurangkan: 23y = 69, y = 3. x = 19 − 15 = 4.",
    { level: "Sangat menantang", sys: [1, 5, 19, 4, -3, 7], id: "pecahan" }),
  q(3, "Kakak berangkat sekolah pukul 06.30 dengan kecepatan 36 km/jam. Adik berangkat 10 menit kemudian lewat jalan yang sama dan menyusul kakak 50 menit setelah adik berangkat. Berapa kecepatan adik?", [n("Kecepatan adik =", 43.2, "km/jam")],
    "Saat menyusul, kakak sudah berjalan 60 menit = 1 jam, jadi jaraknya 36 km. Adik menempuh 36 km dalam 50 menit = {5/6} jam: v = 36 : {5/6} = 43,2 km/jam.", { level: "Sangat menantang", id: "susul" }),
];

export const sources = { PL, YB, KIND };
