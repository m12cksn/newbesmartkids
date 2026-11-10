import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 6 Bab 1 - Pecahan dan Desimal (Buku Matematika SD/MI Kelas VI, Kurikulum Merdeka).
 * Sumber: lampiran PDF pengguna "Perkalian pecahan" (hlm. 7-16), "Pembagian pecahan" (hlm. 16-28)
 * dan "Bilangan desimal" (hlm. 29-41). Halaman Uji Kompetensi tidak dilampirkan, sehingga
 * evaluasi diturunkan dari pola Latihan 1.1, 1.2, dan 1.3 dengan angka, gambar, dan tingkat
 * kesulitan yang berbeda (disetujui pengguna).
 */

export type Frac = [number, number];
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Item = "mango" | "orange" | "guava" | "pastel";
export type Liquid = "juice" | "guava" | "water" | "sugar" | "chocolate";

export type Scene =
  | { type: "buckets"; count: number; per: Frac }
  | { type: "bars"; count: number; per: Frac; item: "pita" | "kain" | "petak" }
  | { type: "bottles"; count: number; fill: Frac }
  | { type: "collection"; sets: { label: string; total: number; groups: number; item: Item }[] }
  | { type: "pour"; amount: Frac; glasses: number }
  | { type: "containers"; count: number; split: number; item: Liquid }
  | { type: "land"; parts: number; filled: number; split: number }
  | { type: "grid"; shaded: number; pattern?: "columns" | "blocks" }
  | { type: "jug"; ml: number }
  | { type: "scale"; item: "orange" | "tomato" | "salak"; display: string }
  | { type: "table"; head: [string, string]; rows: [string, string][]; note?: string }
  | { type: "tape"; total: number; unit: string; parts: number; sub: number; subFilled: number }
  | { type: "compare"; values: [string, string] };

export type Response =
  | { kind: "choice"; options: string[]; pictures?: Scene[] }
  | { kind: "multi"; options: string[]; pictures: Scene[] }
  | { kind: "fraction"; unit?: string }
  | { kind: "decimal"; unit?: string }
  | { kind: "number"; unit?: string }
  | { kind: "shade"; wholes: number; parts: number; label: "Pita" | "Lahan" | "Liter" }
  | { kind: "grid" }
  | { kind: "mark"; total: number; groups: number; item: Item }
  | { kind: "order"; options: string[] }
  | { kind: "match"; left: string[]; right: string[] }
  | { kind: "line"; from: number; to: number }
  | { kind: "place" };

export type FDQuestion = Question & { topic: number; level?: Level; scene?: Scene; response: Response };

/* ---------- Bilangan dan pecahan ---------- */
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export function simplify([n, d]: Frac): Frac { const g = gcd(n, d) || 1; return [n / g, d / g]; }
/** Teks pecahan: 15/4 -> "3 3/4" bila mixed, "15/4" bila tidak. */
export function fracText([n, d]: Frac, mixed = false): string {
  const [a, b] = simplify([n, d]);
  if (b === 1) return String(a);
  if (mixed && a > b) return `${Math.floor(a / b)} ${a % b}/${b}`;
  return `${a}/${b}`;
}
export const decimalText = (value: number, places?: number) =>
  (places === undefined ? String(Math.round(value * 1e6) / 1e6) : value.toFixed(places)).replace(".", ",");

/** Membaca "n/d", "w n/d", "w|n|d" (isian), atau bilangan bulat. */
export function parseFraction(raw: string): Frac | null {
  const value = raw.trim();
  if (!value) return null;
  let w = 0, n: number, d: number;
  if (value.includes("|")) {
    const [a, b, c] = value.split("|");
    if (!b || !c) return null;
    w = a ? Number(a) : 0; n = Number(b); d = Number(c);
  } else {
    const m = value.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
    if (m) { w = Number(m[1] ?? 0); n = Number(m[2]); d = Number(m[3]); }
    else if (/^\d+$/.test(value)) { n = Number(value); d = 1; }
    else return null;
  }
  if (![w, n, d].every(Number.isInteger) || d <= 0 || n < 0 || w < 0) return null;
  return [w * d + n, d];
}
export function parseDecimal(raw: string): number | null {
  const value = raw.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  return Number(value);
}
const indices = (count: number) => Array.from({ length: count }, (_, i) => i).join(",");
const listCount = (value: string) => (value ? value.split(",").filter(Boolean).length : 0);
const sameSet = (a: string, b: string) => a.split("|").sort().join("|") === b.split("|").sort().join("|");

export function correct(q: FDQuestion, raw: string | undefined): boolean {
  const answer = raw ?? "";
  if (!answer) return false;
  const r = q.response;
  switch (r.kind) {
    case "fraction": {
      const a = parseFraction(answer), b = parseFraction(q.answer);
      return Boolean(a && b && a[0] * b[1] === b[0] * a[1]);
    }
    case "decimal": {
      const a = parseDecimal(answer), b = parseDecimal(q.answer);
      return a !== null && b !== null && Math.abs(a - b) < 1e-9;
    }
    case "number": return /^\d+$/.test(answer) && Number(answer) === Number(q.answer);
    case "shade": {
      const counts = (v: string) => v.split("|").map(s => [...s].filter(c => c === "1").length).join("|");
      return answer.split("|").length === r.wholes && counts(answer) === counts(q.answer);
    }
    case "grid": case "mark": return listCount(answer) === listCount(q.answer);
    case "multi": case "match": return sameSet(answer, q.answer);
    default: return answer === q.answer;
  }
}

export function ready(q: FDQuestion, answer: string): boolean {
  const r = q.response;
  if (!answer) return false;
  switch (r.kind) {
    case "fraction": { const [, n, d] = answer.includes("|") ? answer.split("|") : ["", "1", "1"]; return Boolean(n && d && parseFraction(answer)); }
    case "decimal": return parseDecimal(answer) !== null;
    case "shade": return answer.includes("1");
    case "grid": case "mark": return listCount(answer) > 0;
    case "order": return answer.split("|").length === r.options.length;
    case "match": return answer.split("|").length === r.left.length;
    case "place": return answer.split("|").length === 4 && answer.split("|").every(x => /^\d$/.test(x));
    default: return Boolean(answer.trim());
  }
}

export function formatAnswer(q: FDQuestion, raw: string): string {
  const r = q.response;
  if (!raw) return "(kosong)";
  switch (r.kind) {
    case "fraction": { const f = parseFraction(raw); return f ? `${fracText(f, true)}${r.unit ? ` ${r.unit}` : ""}` : raw; }
    case "decimal": case "number": return `${raw.replace(".", ",")}${r.unit ? ` ${r.unit}` : ""}`;
    case "shade": return raw.split("|").map(s => [...s].filter(c => c === "1").length).join(", ") + ` bagian diarsir (dari ${r.parts} bagian per ${r.label.toLowerCase()})`;
    case "grid": return `${listCount(raw)} dari 100 petak diarsir`;
    case "mark": return `${listCount(raw)} ditandai`;
    case "order": return raw.split("|").join(" → ");
    case "match": return raw.split("|").map(p => p.replace("=", " ↔ ")).join("; ");
    case "multi": return raw.split("|").map(x => `Gambar ${x}`).join(", ");
    case "line": return decimalText(Number(raw) / 100, 2);
    case "place": { const names = ["puluhan", "satuan", "persepuluhan", "perseratusan"]; return raw.split("|").map((d, i) => `${d} ${names[i]}`).join(", "); }
    default: return raw;
  }
}

/* ---------- Materi ---------- */
export const groups = [
  { code: "A", title: "Perkalian Pecahan" },
  { code: "B", title: "Pembagian Pecahan" },
  { code: "C", title: "Bilangan Desimal" },
] as const;

export const topics = [
  {
    code: "A.1", group: 0, title: "Perkalian Bilangan Asli dengan Pecahan", short: "Bilangan asli × pecahan",
    source: "Eksplorasi 1.1 - kebun Agam yang disiram dengan ember besar dan ember kecil.",
    steps: [
      "n × a/b berarti pecahan a/b diambil sebanyak n kali. Ini sama dengan penjumlahan berulang a/b + a/b + … sebanyak n kali.",
      "Satu ember kecil menyiram 3/5 m². Dua ember kecil menyiram 3/5 + 3/5 = 2 × 3/5 m².",
      "Hitung pecahan satuannya: 2 kelompok × 3 bagian 1/5 = 6 bagian 1/5 = 6/5 m².",
      "Aturannya: n × a/b = (n × a)/b. Jika pembilang lebih besar dari penyebut, ubah ke pecahan campuran: 6/5 = 1 1/5.",
    ],
    demo: "Pilih isi satu ember kecil, tambah embernya satu per satu, lalu tekan Gabungkan untuk menyusun potongan menjadi petak 1 m² utuh.",
  },
  {
    code: "A.2", group: 0, title: "Perkalian Pecahan dengan Bilangan Asli", short: "Pecahan × bilangan asli",
    source: "Eksplorasi 1.2 - 2/3 dari 15 pohon mangga Agam adalah mangga manalagi.",
    steps: [
      "a/b × n berarti mencari a/b bagian dari sekumpulan n benda.",
      "Bagi seluruh benda menjadi b kelompok yang sama banyak, lalu ambil a kelompok.",
      "Contoh: 2/3 × 15. Lima belas pohon dibagi 3 kelompok, setiap kelompok 5 pohon. Dua kelompok berisi 10 pohon.",
      "Aturannya: a/b × n = (a × n)/b. Hasilnya sama dengan n × a/b, tetapi maknanya berbeda: bagian dari kumpulan, bukan penjumlahan berulang.",
    ],
    demo: "Pilih banyak pohon dan pecahannya. Pohon otomatis dibagi menjadi kelompok sama banyak. Ketuk kelompok untuk menandai mangga manalagi.",
  },
  {
    code: "B.1", group: 1, title: "Pembagian Pecahan dengan Bilangan Asli", short: "Pecahan ÷ bilangan asli",
    source: "Eksplorasi 1.3 - air dalam botol dituang merata ke 3 gelas.",
    steps: [
      "a/b ÷ n berarti membagi a/b menjadi n bagian yang sama besar.",
      "1 liter dibagi rata ke 3 gelas, setiap gelas berisi 1/3 liter.",
      "1/2 liter dibagi ke 3 gelas: setengah botol dipotong menjadi 3 bagian. Setiap bagian bernilai 1/6 liter. Bagiannya bertambah banyak, tetapi nilainya makin kecil.",
      "Aturannya: a/b ÷ n = a/b × 1/n = a/(b × n). Contoh: 1/2 ÷ 3 = 1/2 × 1/3 = 1/6.",
    ],
    demo: "Pilih isi botol dan banyak gelas, lalu tekan Tuang. Amati satu gelas mendapat berapa bagian dari 1 liter.",
  },
  {
    code: "B.2", group: 1, title: "Pembagian Bilangan Asli dengan Pecahan", short: "Bilangan asli ÷ pecahan",
    source: "Permasalahan hlm. 21-22 - 3 liter jus dituang ke gelas 1/4, 1/2, 1/5 liter dan botol 2/5 liter.",
    steps: [
      "n ÷ a/b berarti mencari berapa banyak takaran a/b yang muat di dalam n.",
      "3 liter jus dituang ke gelas 1/4 liter. Setiap 1 liter mengisi 4 gelas, jadi 3 liter mengisi 3 × 4 = 12 gelas.",
      "Untuk botol 2/5 liter: 3 liter sama dengan 15 bagian 1/5 liter. Setiap botol memakai 2 bagian, jadi 15 ÷ 2 = 7 1/2 botol.",
      "Aturannya: n ÷ a/b = n × b/a. Kalikan dengan kebalikan pecahan pembagi.",
    ],
    demo: "Pilih banyak botol dan ukuran gelas, lalu tekan Isi 1 gelas berulang kali. Hitung gelas yang penuh dan sisa jusnya.",
  },
  {
    code: "C.1", group: 2, title: "Mengubah Pecahan Menjadi Desimal", short: "Pecahan → desimal",
    source: "Ayo Mengingat Kembali dan Permasalahan hlm. 29-30 - timbangan buah 0,50 kg dan 0,20 kg.",
    steps: [
      "Bilangan desimal adalah cara lain menulis pecahan berpenyebut 10, 100, atau 1.000.",
      "Ubah penyebut menjadi 10 atau 100 dengan pecahan senilai: 1/2 = 5/10 = 0,5 dan 1/5 = 20/100 = 0,20.",
      "Pada 100 petak, satu petak bernilai 0,01 dan satu kolom (10 petak) bernilai 0,1.",
      "Cara lain: bagi pembilang dengan penyebut. 3/4 = 3 : 4 = 0,75.",
    ],
    demo: "Pilih pecahan, lalu arsir petak. Gunakan kuas 1 kolom untuk persepuluhan dan kuas 1 petak untuk perseratusan.",
  },
  {
    code: "C.2", group: 2, title: "Membandingkan dan Mengurutkan Bilangan Desimal", short: "Membandingkan desimal",
    source: "Permasalahan dan Eksplorasi 1.6 hlm. 35-38 - jarak rumah ke sekolah dan nilai tempat 3,48.",
    steps: [
      "Angka di kiri koma adalah bilangan asli (puluhan, satuan). Angka di kanan koma adalah persepuluhan (1/10) dan perseratusan (1/100).",
      "Bandingkan mulai dari nilai tempat terbesar. Jika angkanya sama, lanjutkan ke nilai tempat berikutnya.",
      "Samakan banyak angka di belakang koma agar mudah: 3,7 = 3,70, sehingga 3,70 > 3,48.",
      "Untuk mengurutkan, cari bilangan terkecil (atau terbesar) satu per satu.",
    ],
    demo: "Ubah angka kedua bilangan. Nilai tempat pertama yang berbeda akan disorot dan menentukan tanda perbandingan.",
  },
] as const;

/* ---------- Pembuat soal ---------- */
type Extra = { level?: Level; scene?: Scene };
const make = (topic: number, prompt: string, response: Response, answer: string, explanation: string, extra: Extra = {}): FDQuestion =>
  ({ topic, prompt, response, answer, explanation, ...extra });
const bits = (wholes: number, parts: number, filled: number | number[]) =>
  Array.from({ length: wholes }, (_, w) => {
    const f = Array.isArray(filled) ? filled[w] : filled;
    return Array.from({ length: parts }, (_, i) => (i < f ? "1" : "0")).join("");
  }).join("|");

/* ---------- Latihan materi (4 soal per subtopik) ---------- */
export const practice: FDQuestion[][] = [
  [
    make(0, "Satu ember kecil dapat menyiram 2/3 m² kebun. Berapa m² kebun yang dapat disiram dengan 4 ember kecil?",
      { kind: "fraction", unit: "m²" }, "8/3", "4 × 2/3 = (4 × 2)/3 = 8/3 m², sama dengan 2 2/3 m².", { scene: { type: "buckets", count: 4, per: [2, 3] } }),
    make(0, "Hani membuat 3 potong pita, masing-masing 3/4 m. Arsir panjang setiap pita Hani.",
      { kind: "shade", wholes: 3, parts: 4, label: "Pita" }, bits(3, 4, 3), "Setiap pita 1 m dibagi 4 bagian; arsir 3 bagian pada setiap pita. Panjang seluruhnya 3 × 3/4 = 9/4 = 2 1/4 m."),
    make(0, "Perhatikan model. Berapakah hasil 5 × 2/7?",
      { kind: "choice", options: ["10/35", "7/10", "10/7", "2/35"] }, "10/7", "Ada 5 kelompok berisi 2 bagian 1/7, jadi 10 bagian 1/7 = 10/7. Penyebut tidak ikut dikalikan.",
      { scene: { type: "bars", count: 5, per: [2, 7], item: "petak" } }),
    make(0, "Ibu membeli 6 botol minyak goreng, masing-masing berisi 3/4 liter. Berapa liter minyak seluruhnya?",
      { kind: "fraction", unit: "liter" }, "9/2", "6 × 3/4 = 18/4 = 9/2 = 4 1/2 liter.", { scene: { type: "bottles", count: 6, fill: [3, 4] } }),
  ],
  [
    make(1, "Ada 12 pohon mangga. Sebanyak 3/4 di antaranya mangga manalagi. Ketuk semua pohon mangga manalagi.",
      { kind: "mark", total: 12, groups: 4, item: "mango" }, indices(9), "12 pohon dibagi 4 kelompok, tiap kelompok 3 pohon. Ambil 3 kelompok: 3/4 × 12 = 36/4 = 9 pohon."),
    make(1, "Berapa 3/5 dari 20 buah jeruk?",
      { kind: "number", unit: "jeruk" }, "12", "20 jeruk dibagi 5 kelompok, tiap kelompok 4 jeruk. 3 kelompok = 12 jeruk. 3/5 × 20 = 60/5 = 12.",
      { scene: { type: "collection", sets: [{ label: "20 jeruk", total: 20, groups: 5, item: "orange" }] } }),
    make(1, "Fina membuat 60 kue pastel. Sebanyak 2/15 bagian sudah dimakan keluarganya. Berapa kue pastel yang belum dimakan?",
      { kind: "number", unit: "kue" }, "52", "Yang dimakan 2/15 × 60 = 120/15 = 8 kue. Yang belum dimakan 60 − 8 = 52 kue.",
      { scene: { type: "collection", sets: [{ label: "60 kue pastel", total: 60, groups: 15, item: "pastel" }] } }),
    make(1, "Bandingkan 8 × 3/4 dan 3/4 × 8. Pernyataan mana yang benar?",
      { kind: "choice", options: ["8 × 3/4 lebih besar", "Keduanya bernilai 24/32", "Keduanya bernilai 6", "3/4 × 8 lebih besar"] }, "Keduanya bernilai 6",
      "8 × 3/4 = 24/4 = 6 dan 3/4 × 8 = 24/4 = 6. Hasilnya sama, tetapi maknanya berbeda: 8 kali 3/4, atau 3/4 bagian dari 8."),
  ],
  [
    make(2, "1 liter air dituang merata ke dalam 4 gelas. Berapa liter air di setiap gelas?",
      { kind: "fraction", unit: "liter" }, "1/4", "1 ÷ 4 = 1/4. Satu kotak penuh dibagi 4 bagian sama besar.", { scene: { type: "pour", amount: [1, 1], glasses: 4 } }),
    make(2, "1/2 liter air dibagi rata ke 3 gelas. Model 1 liter di bawah dibagi 6 bagian. Arsir air untuk satu gelas.",
      { kind: "shade", wholes: 1, parts: 6, label: "Liter" }, bits(1, 6, 1), "Setengah liter (3 dari 6 bagian) dibagi untuk 3 gelas, satu gelas mendapat 1 bagian: 1/2 ÷ 3 = 1/6 liter.",
      { scene: { type: "pour", amount: [1, 2], glasses: 3 } }),
    make(2, "Pak Rudi membagi 3/4 bagian tanahnya kepada 3 orang anaknya secara adil. Berapa bagian tanah yang diterima setiap anak?",
      { kind: "fraction" }, "1/4", "3/4 ÷ 3 = 3/4 × 1/3 = 3/12 = 1/4 bagian tanah.", { scene: { type: "land", parts: 4, filled: 3, split: 3 } }),
    make(2, "Botol berisi 2/5 liter air dituang rata ke 4 gelas. Berapa liter air di setiap gelas?",
      { kind: "choice", options: ["8/5 liter", "1/10 liter", "2/9 liter", "6/5 liter"] }, "1/10 liter", "2/5 ÷ 4 = 2/5 × 1/4 = 2/20 = 1/10 liter. Hasil pembagian lebih kecil dari 2/5.",
      { scene: { type: "pour", amount: [2, 5], glasses: 4 } }),
  ],
  [
    make(3, "Agam punya 2 botol jus jeruk masing-masing 1 liter. Jus dituang ke gelas berkapasitas 1/4 liter. Berapa gelas yang terisi penuh?",
      { kind: "number", unit: "gelas" }, "8", "Setiap liter mengisi 4 gelas. 2 ÷ 1/4 = 2 × 4 = 8 gelas.", { scene: { type: "containers", count: 2, split: 4, item: "juice" } }),
    make(3, "Botol 1 liter dibagi 6 bagian sama besar. Arsir isi satu gelas yang berkapasitas 1/3 liter.",
      { kind: "shade", wholes: 1, parts: 6, label: "Liter" }, bits(1, 6, 2), "1/3 liter = 2/6 liter, jadi satu gelas memakai 2 bagian. Satu botol mengisi 6 ÷ 2 = 3 gelas, sehingga 1 ÷ 1/3 = 3."),
    make(3, "3 liter air dituang ke botol kecil berkapasitas 2/5 liter. Berapa botol yang diperoleh?",
      { kind: "choice", options: ["6/5 botol", "15 botol", "7 1/2 botol", "5/6 botol"] }, "7 1/2 botol",
      "3 liter = 15 bagian 1/5 liter. Setiap botol memakai 2 bagian: 3 ÷ 2/5 = 3 × 5/2 = 15/2 = 7 1/2 botol (7 botol penuh dan 1 botol terisi setengah).",
      { scene: { type: "containers", count: 3, split: 5, item: "water" } }),
    make(3, "Rina memiliki 6 kg gula pasir. Setiap adonan kue bolu membutuhkan 3/4 kg gula. Berapa adonan kue bolu yang dapat dibuat?",
      { kind: "number", unit: "adonan" }, "8", "6 ÷ 3/4 = 6 × 4/3 = 24/3 = 8 adonan.", { scene: { type: "containers", count: 6, split: 4, item: "sugar" } }),
  ],
  [
    make(4, "Gambar mana saja yang menunjukkan nilai 0,5? Pilih semua yang benar.",
      { kind: "multi", options: ["A", "B", "C", "D"], pictures: [{ type: "jug", ml: 500 }, { type: "grid", shaded: 50, pattern: "blocks" }, { type: "jug", ml: 300 }, { type: "grid", shaded: 35 }] },
      "A|B", "A: 500 ml dari 1.000 ml = 1/2 = 0,5. B: 50 dari 100 petak = 0,50. C hanya 300 ml = 0,3 dan D 35 petak = 0,35."),
    make(4, "Arsir petak untuk menunjukkan bilangan desimal 0,25.",
      { kind: "grid" }, indices(25), "0,25 = 25/100. Arsir 2 kolom (0,2) dan 5 petak (0,05)."),
    make(4, "Ibu meminta Agam membeli 1/2 kg jeruk. Angka berapa yang muncul pada timbangan digital (kg)?",
      { kind: "decimal", unit: "kg" }, "0,5", "1/2 = 5/10 = 0,5. Pada timbangan tertulis 0,50 kg, nilainya sama dengan 0,5 kg.",
      { scene: { type: "scale", item: "orange", display: "?,??" } }),
    make(4, "Rina memotong kain sepanjang 3/4 meter. Tuliskan panjang kain itu dalam bentuk desimal.",
      { kind: "decimal", unit: "m" }, "0,75", "3/4 = (3 × 25)/(4 × 25) = 75/100 = 0,75 m.", { scene: { type: "bars", count: 1, per: [3, 4], item: "kain" } }),
  ],
  [
    make(5, "Isi tabel nilai tempat untuk jarak rumah Budi ke sekolah, yaitu 10,9 km.",
      { kind: "place" }, "1|0|9|0", "10,9 = 1 puluhan + 0 satuan + 9 persepuluhan + 0 perseratusan.",
      { scene: { type: "table", head: ["Nama siswa", "Jarak (km)"], rows: [["Alma", "2,3"], ["Budi", "10,9"], ["Anita", "1,9"]] } }),
    make(5, "Bandingkan jarak rumah Rini (2,6 km) dan Fatim (2,58 km). Tanda mana yang tepat?",
      { kind: "choice", options: ["2,6 < 2,58", "2,6 > 2,58", "2,6 = 2,58"] }, "2,6 > 2,58",
      "Satuan sama (2). Persepuluhan: 6 > 5, jadi 2,6 > 2,58. Tulis 2,6 sebagai 2,60 agar mudah dibandingkan.", { scene: { type: "compare", values: ["2,6", "2,58"] } }),
    make(5, "Urutkan jarak rumah ke sekolah mulai dari yang paling dekat.",
      { kind: "order", options: ["Alma · 2,3 km", "Anita · 1,9 km", "Rini · 2,6 km", "Andi · 1,5 km", "Dias · 3,1 km"] },
      "Andi · 1,5 km|Anita · 1,9 km|Alma · 2,3 km|Rini · 2,6 km|Dias · 3,1 km", "Bandingkan satuan dulu (1, 2, 3), lalu persepuluhan: 1,5 < 1,9 < 2,3 < 2,6 < 3,1.",
      { scene: { type: "table", head: ["Nama siswa", "Jarak (km)"], rows: [["Alma", "2,3"], ["Anita", "1,9"], ["Rini", "2,6"], ["Andi", "1,5"], ["Dias", "3,1"]] } }),
    make(5, "Arman, Bayu, dan Didi mengikuti lomba lompat jauh. Siapa yang melompat paling jauh?",
      { kind: "choice", options: ["Bayu", "Arman", "Didi"] }, "Arman", "Tulis dengan dua angka di belakang koma: 3,70; 3,65; 3,07. Satuannya sama, persepuluhan 7 paling besar, jadi Arman paling jauh.",
      { scene: { type: "table", head: ["Peserta", "Lompatan (m)"], rows: [["Arman", "3,7"], ["Bayu", "3,65"], ["Didi", "3,07"]] } }),
  ],
];

/* ---------- Evaluasi: 24 soal, diselingi antar-subtopik ---------- */
export const assessment: FDQuestion[] = [
  make(0, "Dina memotong 3 pita, masing-masing panjangnya 2/5 m. Arsir panjang setiap pita Dina.",
    { kind: "shade", wholes: 3, parts: 5, label: "Pita" }, bits(3, 5, 2), "Setiap pita 1 m dibagi 5 bagian, arsir 2 bagian. Totalnya 3 × 2/5 = 6/5 = 1 1/5 m.", { level: "Sedang" }),
  make(4, "Gambar mana yang menunjukkan bilangan desimal 0,4?",
    { kind: "choice", options: ["A", "B", "C", "D"], pictures: [{ type: "grid", shaded: 4 }, { type: "bars", count: 1, per: [4, 5], item: "petak" }, { type: "grid", shaded: 40 }, { type: "jug", ml: 40 }] },
    "C", "0,4 = 4/10 = 40/100: 4 kolom atau 40 petak. A hanya 4 petak (0,04), B 4/5 = 0,8, dan D 40 ml dari 1.000 ml = 0,04.", { level: "Sedang" }),
  make(1, "Ada 18 pohon jeruk di kebun Pak Tani. Sebanyak 2/3 pohon sudah berbuah. Ketuk semua pohon yang sudah berbuah.",
    { kind: "mark", total: 18, groups: 3, item: "orange" }, indices(12), "18 pohon dibagi 3 kelompok, tiap kelompok 6 pohon. 2 kelompok = 12 pohon. 2/3 × 18 = 36/3 = 12.", { level: "Menantang" }),
  make(2, "Pak Darto membagi 3/5 bagian tanahnya kepada 2 anaknya sama rata. Berapa bagian tanah yang diterima setiap anak?",
    { kind: "fraction" }, "3/10", "3/5 ÷ 2 = 3/5 × 1/2 = 3/10 bagian tanah.", { level: "Sedang", scene: { type: "land", parts: 5, filled: 3, split: 2 } }),
  make(3, "Bu Sari memiliki 9 kg gula. Setiap adonan kue membutuhkan 3/4 kg gula. Berapa adonan kue yang dapat dibuat?",
    { kind: "number", unit: "adonan" }, "12", "9 ÷ 3/4 = 9 × 4/3 = 36/3 = 12 adonan. Setiap kantong 1 kg berisi 4 bagian 1/4 kg; 36 bagian dibagi 3 bagian per adonan.",
    { level: "Menantang", scene: { type: "containers", count: 9, split: 4, item: "sugar" } }),
  make(5, "Urutkan suhu tertinggi di lima kota berikut, mulai dari yang paling tinggi.",
    { kind: "order", options: ["Kupang · 36,9 °C", "Palu · 38,1 °C", "Tarakan · 36,09 °C", "Palembang · 37,4 °C", "Medan · 37,04 °C"] },
    "Palu · 38,1 °C|Palembang · 37,4 °C|Medan · 37,04 °C|Kupang · 36,9 °C|Tarakan · 36,09 °C",
    "Samakan dua angka di belakang koma: 38,10 > 37,40 > 37,04 > 36,90 > 36,09.",
    { level: "Menantang", scene: { type: "table", head: ["Kota", "Suhu (°C)"], rows: [["Kupang", "36,9"], ["Palu", "38,1"], ["Tarakan", "36,09"], ["Palembang", "37,4"], ["Medan", "37,04"]], note: "Data contoh untuk latihan." } }),
  make(0, "Satu ember kecil dapat menyiram 3/4 m² kebun. Berapa m² kebun yang dapat disiram dengan 5 ember kecil?",
    { kind: "fraction", unit: "m²" }, "15/4", "5 × 3/4 = 15/4 = 3 3/4 m².", { level: "Menantang", scene: { type: "buckets", count: 5, per: [3, 4] } }),
  make(4, "Pasangkan setiap pecahan dengan bilangan desimal yang nilainya sama.",
    { kind: "match", left: ["3/4", "2/5", "7/20", "9/25"], right: ["0,36", "0,75", "0,35", "0,4"] },
    "3/4=0,75|2/5=0,4|7/20=0,35|9/25=0,36", "3/4 = 75/100; 2/5 = 4/10; 7/20 = 35/100; 9/25 = 36/100.", { level: "Sangat menantang" }),
  make(1, "Ada 48 kue pastel di meja. Sebanyak 3/8 kue sudah dimakan. Berapa kue pastel yang belum dimakan?",
    { kind: "number", unit: "kue" }, "30", "Yang dimakan 3/8 × 48 = 144/8 = 18 kue. Sisanya 48 − 18 = 30 kue (atau 5/8 × 48 = 30).",
    { level: "Menantang", scene: { type: "collection", sets: [{ label: "48 kue pastel", total: 48, groups: 8, item: "pastel" }] } }),
  make(5, "Hasil lomba lompat jauh ada pada tabel. Siapa yang melompat paling jauh?",
    { kind: "choice", options: ["Arman", "Dodi", "Citra", "Bayu"] }, "Bayu",
    "Tulis dengan dua angka di belakang koma: 3,47; 3,70; 3,08; 3,50. Persepuluhan terbesar adalah 7, jadi Bayu paling jauh. 47 perseratus lebih kecil dari 70 perseratus.",
    { level: "Sedang", scene: { type: "table", head: ["Peserta", "Lompatan (m)"], rows: [["Arman", "3,47"], ["Bayu", "3,7"], ["Citra", "3,08"], ["Dodi", "3,5"]] } }),
  make(2, "Botol berisi 2/3 liter air dituang merata ke 4 gelas. Berapa liter air di setiap gelas?",
    { kind: "choice", options: ["8/3 liter", "1/6 liter", "2/7 liter", "1/12 liter"] }, "1/6 liter",
    "2/3 ÷ 4 = 2/3 × 1/4 = 2/12 = 1/6 liter. 8/3 terjadi bila dikalikan 4, dan 1/12 bila pembilang tidak diperhatikan.",
    { level: "Menantang", scene: { type: "pour", amount: [2, 3], glasses: 4 } }),
  make(0, "Hasil perkalian manakah yang lebih dari 4?",
    { kind: "choice", options: ["7 × 5/8", "6 × 2/3", "5 × 3/4", "9 × 4/9"] }, "7 × 5/8",
    "7 × 5/8 = 35/8 = 4 3/8 (lebih dari 4). 6 × 2/3 = 4, 5 × 3/4 = 3 3/4, dan 9 × 4/9 = 4.", { level: "Sangat menantang" }),
  make(3, "Astri memiliki 7 batang cokelat. Setiap teman mendapat 2/3 batang. Setelah dibagikan kepada sebanyak mungkin teman, berapa batang cokelat yang tersisa?",
    { kind: "fraction", unit: "batang" }, "1/3",
    "7 batang = 21 bagian 1/3. Setiap teman mendapat 2 bagian: 21 ÷ 2 = 10 sisa 1. Jadi 10 teman mendapat cokelat dan tersisa 1/3 batang.",
    { level: "Sangat menantang", scene: { type: "containers", count: 7, split: 3, item: "chocolate" } }),
  make(4, "Arsir petak untuk menunjukkan pecahan 7/20 dalam bentuk desimal.",
    { kind: "grid" }, indices(35), "7/20 = (7 × 5)/(20 × 5) = 35/100 = 0,35. Arsir 3 kolom dan 5 petak.", { level: "Menantang" }),
  make(1, "Ada 240 siswa kelas 6. Sebanyak 1/6 siswa ikut ekstrakurikuler musik, dan 3/4 dari siswa musik juga ikut melukis. Berapa siswa yang ikut musik dan melukis?",
    { kind: "number", unit: "siswa" }, "30", "Siswa musik = 1/6 × 240 = 40. Yang juga melukis = 3/4 × 40 = 30 siswa (3/24 = 1/8 dari seluruh siswa).",
    { level: "Sangat menantang", scene: { type: "tape", total: 240, unit: "siswa", parts: 6, sub: 4, subFilled: 3 } }),
  make(5, "Ketuk titik yang menunjukkan 2,37 pada garis bilangan.",
    { kind: "line", from: 230, to: 240 }, "237", "Dari 2,30 ke 2,40 ada 10 langkah perseratusan. 2,37 berada 7 langkah setelah 2,30.", { level: "Sedang" }),
  make(2, "Botol berisi 3/4 liter jus dibagi rata ke 3 gelas. Isi satu gelas kemudian dibagi rata lagi untuk 2 anak. Berapa liter jus yang diterima setiap anak?",
    { kind: "fraction", unit: "liter" }, "1/8", "Satu gelas: 3/4 ÷ 3 = 1/4 liter. Setiap anak: 1/4 ÷ 2 = 1/8 liter.",
    { level: "Sangat menantang", scene: { type: "pour", amount: [3, 4], glasses: 3 } }),
  make(3, "Ada 5 botol jus jambu, masing-masing 1 liter. Jus dituang ke gelas berkapasitas 1/3 liter. Berapa gelas yang terisi?",
    { kind: "number", unit: "gelas" }, "15", "5 ÷ 1/3 = 5 × 3 = 15 gelas.", { level: "Sedang", scene: { type: "containers", count: 5, split: 3, item: "guava" } }),
  make(0, "Cerita manakah yang sesuai dengan kalimat matematika 4 × 2/3?",
    { kind: "choice", options: ["Ada 4 kg beras. Sebanyak 2/3 bagiannya dimasak.", "Ada 4 gelas, masing-masing berisi 2/3 liter susu.", "4 liter susu dituang ke gelas berkapasitas 2/3 liter.", "Ani punya 4 kg tepung, lalu membeli 2/3 kg lagi."] },
    "Ada 4 gelas, masing-masing berisi 2/3 liter susu.",
    "4 × 2/3 berarti 2/3 diambil 4 kali (penjumlahan berulang). Cerita pertama adalah 2/3 × 4 (bagian dari 4), cerita ketiga pembagian, dan cerita keempat penjumlahan.", { level: "Menantang" }),
  make(1, "Di kebun ada 24 pohon mangga dan 30 pohon jambu. Sebanyak 3/4 pohon mangga dan 2/3 pohon jambu sedang berbuah. Pernyataan mana yang benar?",
    { kind: "choice", options: ["Jambu lebih banyak berbuah, selisih 2 pohon", "Mangga lebih banyak berbuah, selisih 2 pohon", "Keduanya sama banyak berbuah", "Jambu lebih banyak berbuah, selisih 6 pohon"] },
    "Jambu lebih banyak berbuah, selisih 2 pohon", "Mangga berbuah: 3/4 × 24 = 18. Jambu berbuah: 2/3 × 30 = 20. Selisihnya 20 − 18 = 2 pohon.",
    { level: "Sangat menantang", scene: { type: "collection", sets: [{ label: "24 pohon mangga", total: 24, groups: 4, item: "mango" }, { label: "30 pohon jambu", total: 30, groups: 3, item: "guava" }] } }),
  make(4, "Bu Ani membeli 1/4 kg tomat. Angka berapa yang muncul pada timbangan digital (kg)?",
    { kind: "decimal", unit: "kg" }, "0,25", "1/4 = 25/100 = 0,25 kg.", { level: "Sedang", scene: { type: "scale", item: "tomato", display: "?,??" } }),
  make(2, "Lahan Pak Budi dibagi 6 petak sama besar. Sebanyak 2/3 lahan dibagikan rata kepada 2 anaknya. Arsir bagian lahan untuk satu anak.",
    { kind: "shade", wholes: 1, parts: 6, label: "Lahan" }, bits(1, 6, 2), "2/3 lahan = 4 petak. Dibagi 2 anak, setiap anak 2 petak = 2/6 = 1/3 lahan. 2/3 ÷ 2 = 1/3.", { level: "Sedang" }),
  make(3, "5 liter air dituang ke botol kecil berkapasitas 2/5 liter. Berapa botol yang terisi penuh dan berapa liter air yang tersisa?",
    { kind: "choice", options: ["12 botol, sisa 1/2 liter", "25 botol, tanpa sisa", "12 botol, sisa 1/5 liter", "2 botol, sisa 1 liter"] }, "12 botol, sisa 1/5 liter",
    "5 ÷ 2/5 = 25/2 = 12 1/2. Ada 12 botol penuh (12 × 2/5 = 24/5 liter). Sisa air 5 − 24/5 = 1/5 liter, yaitu setengah botol.",
    { level: "Sangat menantang", scene: { type: "containers", count: 5, split: 5, item: "water" } }),
  make(5, "Urutkan kandungan gizi pada label berikut dari yang paling kecil hingga paling besar.",
    { kind: "order", options: ["Lemak total · 5,4 g", "Karbohidrat · 28,6 g", "Gula · 12,05 g", "Protein · 1,3 g", "Serat pangan · 2,75 g"] },
    "Protein · 1,3 g|Serat pangan · 2,75 g|Lemak total · 5,4 g|Gula · 12,05 g|Karbohidrat · 28,6 g",
    "Bandingkan bagian bilangan asli dulu: 1 < 2 < 5 < 12 < 28. Jadi protein, serat pangan, lemak total, gula, lalu karbohidrat.",
    { level: "Menantang", scene: { type: "table", head: ["Informasi Nilai Gizi", "Per sajian"], rows: [["Protein", "1,3 g"], ["Lemak total", "5,4 g"], ["Karbohidrat", "28,6 g"], ["Gula", "12,05 g"], ["Serat pangan", "2,75 g"]] } }),
];
