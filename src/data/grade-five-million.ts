import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 5 Bab 9 - Bilangan Cacah sampai 1.000.000 (Buku Matematika SD/MI Kelas V, hlm. 273-291).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export const places = ["Ratus ribuan", "Puluh ribuan", "Ribuan", "Ratusan", "Puluhan", "Satuan"] as const;
export const units = [100000, 10000, 1000, 100, 10, 1];
export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const digitsOf = (n: number) => String(n).padStart(6, "0").slice(-6).split("").map(Number);

const ones = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
function under1000(n: number): string[] {
  const out: string[] = [], h = Math.floor(n / 100), r = n % 100;
  if (h === 1) out.push("seratus"); else if (h > 1) out.push(ones[h], "ratus");
  if (r === 10) out.push("sepuluh"); else if (r === 11) out.push("sebelas");
  else if (r > 11 && r < 20) out.push(ones[r - 10], "belas");
  else { if (r >= 20) out.push(ones[Math.floor(r / 10)], "puluh"); if (r % 10) out.push(ones[r % 10]); }
  return out;
}
/** Bilangan dalam kata, 0 sampai 1.000.000. */
export function words(n: number): string {
  if (n === 0) return "nol";
  if (n === 1000000) return "satu juta";
  const th = Math.floor(n / 1000), r = n % 1000, out: string[] = [];
  if (th === 1) out.push("seribu"); else if (th > 1) out.push(...under1000(th), "ribu");
  out.push(...under1000(r));
  return out.join(" ");
}
/** Kartu kata untuk menyusun bacaan bilangan. */
export const wordTiles = ["satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas", "seratus", "seribu", "belas", "puluh", "ratus", "ribu", "juta"];

/* ---------- Gambar ---------- */
export type Thing = "lemari" | "sepatu" | "speaker" | "mouse" | "hardisk" | "headset" | "jam";
export type Scene =
  | { type: "things"; items: { thing: Thing; label: string; price: number; color?: string }[] }
  | { type: "wallet"; groups: { name?: string; notes: [number, number][] }[] }
  | { type: "line"; title: string; labels: string[]; values: number[]; max: number; step: number }
  | { type: "text"; lines: string[] }
  | { type: "big"; text: string };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "number"; label: string; answer: number }
  | { kind: "items"; items: { label: string; answer: number }[] }
  /** Menyusun bacaan bilangan dengan kartu kata. */
  | { kind: "words"; label: string; n: number }
  /** Tabel nilai tempat: satu angka setiap kolom. */
  | { kind: "place"; rows: { label: string; n: number }[] }
  /** Memilih nama nilai tempat untuk angka tertentu. */
  | { kind: "placeName"; rows: { text: string; answer: (typeof places)[number] }[] }
  | { kind: "signs"; pairs: [number, number][] }
  | { kind: "order"; label: string; options: string[]; answer: string[] }
  | { kind: "seq"; rows: (number | null)[][]; answers: number[] }
  /** Bentuk panjang: nilai setiap tempat. */
  | { kind: "expand"; n: number }
  /** Menyusun bilangan dari kartu angka. */
  | { kind: "cards"; label: string; digits: number[]; answer: number }
  /** Beberapa cara membayar dengan persediaan uang. */
  | { kind: "payment"; price: number; denoms: number[]; stock: number[]; ways: number; sample: number[][] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type MQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

const sign = (a: number, b: number) => (a > b ? ">" : a < b ? "<" : "=");
export const fieldCount = (p: Part) => {
  switch (p.kind) {
    case "items": return p.items.length;
    case "place": return p.rows.length * 6;
    case "placeName": return p.rows.length;
    case "signs": return p.pairs.length;
    case "seq": return p.answers.length;
    case "expand": return 6;
    case "payment": return p.ways * p.denoms.length;
    case "tf": return p.statements.length;
    default: return 1;
  }
};
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "number": return [String(p.answer)];
    case "items": return p.items.map(i => String(i.answer));
    case "words": return [words(p.n)];
    case "place": return p.rows.flatMap(r => digitsOf(r.n).map(String));
    case "placeName": return p.rows.map(r => r.answer);
    case "signs": return p.pairs.map(([a, b]) => sign(a, b));
    case "order": return [p.answer.join(";")];
    case "seq": return p.answers.map(String);
    case "expand": return digitsOf(p.n).map((d, i) => String(d * units[i]));
    case "cards": return [String(p.answer)];
    case "payment": return p.sample.flat().map(String);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);
const numericKinds = new Set(["number", "items", "place", "seq", "expand", "cards"]);
/** Baris cara membayar: jumlah tepat, tidak melebihi persediaan, dan semua cara berbeda. */
export function paymentOk(p: Extract<Part, { kind: "payment" }>, x: string[]) {
  const d = p.denoms.length, rows = Array.from({ length: p.ways }, (_, r) => x.slice(r * d, r * d + d).map(c => (c === "" ? 0 : int(c))));
  if (rows.some(r => r.some(Number.isNaN))) return false;
  const ok = rows.every(r => r.reduce((a, c, k) => a + c * p.denoms[k], 0) === p.price && r.every((c, k) => c <= p.stock[k]));
  return ok && new Set(rows.map(r => r.join(","))).size === p.ways;
}
function partCorrect(p: Part, v: string): boolean {
  if (p.kind === "payment") return paymentOk(p, cells(p, v));
  if (p.kind === "words" || p.kind === "order" || p.kind === "choice") return v.trim() === fields(p)[0];
  const x = cells(p, v), want = fields(p);
  return numericKinds.has(p.kind) ? want.every((w, i) => int(x[i]) === Number(w)) : x.join("|") === want.join("|");
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "order") return v.split(";").filter(Boolean).length === p.options.length;
  if (p.kind === "words") return v.trim().length > 0;
  if (p.kind === "cards") return v.length === p.digits.length;
  if (p.kind === "payment") { const d = p.denoms.length; return Array.from({ length: p.ways }, (_, r) => x.slice(r * d, r * d + d)).every(r => r.some(c => int(c) > 0)); }
  return numericKinds.has(p.kind) ? x.every(y => !Number.isNaN(int(y))) : x.every(Boolean);
}
export const correct = (q: MQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: MQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: MQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => (s === "" ? "…" : /^\d+$/.test(s) ? fmt(Number(s)) : s);
    switch (p.kind) {
      case "number": return `${p.label} ${d(x[0])}`;
      case "items": return p.items.map((it, k) => `${it.label} ${d(x[k])}`).join(", ");
      case "words": return `${p.label} ${v[i] || "…"}`;
      case "place": return p.rows.map((r, k) => `${r.label}: ${x.slice(6 * k, 6 * k + 6).map(c => c || "…").join(" ")}`).join("; ");
      case "placeName": return p.rows.map((r, k) => `${r.text} ${x[k] ? x[k].toLowerCase() : "…"}`).join(", ");
      case "signs": return p.pairs.map(([a, b], k) => `${fmt(a)} ${x[k] || "…"} ${fmt(b)}`).join(", ");
      case "order": return v[i] ? v[i].split(";").join(", ") : "…";
      case "seq": return p.answers.map((_, k) => d(x[k])).join(", ");
      case "expand": return x.map(d).join(" + ");
      case "cards": return `${p.label} ${v[i] ? fmt(Number(v[i])) : "…"}`;
      case "payment": { const n = p.denoms.length; return Array.from({ length: p.ways }, (_, r) => `Cara ${r + 1}: ${p.denoms.map((dn, k) => (x[r * n + k] && x[r * n + k] !== "0" ? `${x[r * n + k]} × ${fmt(dn)}` : "")).filter(Boolean).join(" + ") || "…"}`).join("; "); }
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return v[i] || "…";
    }
  }).join(" | ");
}

/* ---------- Data bersama ---------- */
const q = (topic: MQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): MQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const visitors = { title: "Wisatawan Mancanegara ke Sebuah Kota", labels: ["2016", "2017", "2018", "2019", "2020"], values: [362415, 398204, 416730, 413067, 71952], max: 500000, step: 50000 };
const museum = { title: "Pengunjung Museum Kota", labels: ["2016", "2017", "2018", "2019", "2020"], values: [215430, 243105, 251820, 249960, 98315], max: 300000, step: 50000 };
const shoes: Scene = { type: "things", items: [{ thing: "sepatu", label: "Sepatu Komang", price: 452300, color: "#2f86d6" }, { thing: "sepatu", label: "Sepatu Lukas", price: 425300, color: "#e5484d" }, { thing: "sepatu", label: "Sepatu Nisa", price: 452030, color: "#7048e8" }] };
const shop: Scene = { type: "things", items: [{ thing: "speaker", label: "Speaker aktif", price: 289450 }, { thing: "mouse", label: "Mouse", price: 196300 }, { thing: "hardisk", label: "Hardisk eksternal", price: 845900 }, { thing: "headset", label: "Headset", price: 154890 }] };
export const money = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 100];
const nineAt = (n: number) => places[digitsOf(n).indexOf(9)];

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Membaca, Menulis, dan Nilai Tempat", short: "Membaca dan menulis",
    steps: [
      "Bilangan sampai 1.000.000 memakai enam tempat: ratus ribuan, puluh ribuan, ribuan, ratusan, puluhan, dan satuan. Bilangan 1.000.000 dibaca satu juta.",
      "Untuk memudahkan membaca, pisahkan setiap tiga angka dari kanan dengan titik. Baca kelompok kiri lalu sebut \"ribu\", kemudian baca tiga angka terakhir. Contoh 875.428 dibaca delapan ratus tujuh puluh lima ribu empat ratus dua puluh delapan.",
      "Angka 0 tidak diucapkan, tetapi tetap ditulis agar setiap angka berada di tempatnya. Contoh 604.007 dibaca enam ratus empat ribu tujuh.",
      "Nilai tempat menunjukkan posisi angka; nilai angka adalah angka dikali nilai tempatnya. Pada 720.736, angka 6 berada di satuan dan bernilai 6, sedangkan angka 2 berada di puluh ribuan dan bernilai 20.000.",
    ],
    demo: "Ubah setiap angka dengan tombol tambah dan kurang. Ketuk satu kolom untuk melihat nilai angkanya, lalu perhatikan cara membacanya.",
  },
  {
    code: "B", title: "Mengurutkan dan Membandingkan", short: "Membandingkan dan mengurutkan",
    steps: [
      "Tuliskan kedua bilangan pada tabel nilai tempat yang sejajar. Bandingkan mulai dari tempat paling kiri, yaitu ratus ribuan.",
      "Jika angkanya sama, pindah ke tempat berikutnya di sebelah kanan. Angka pertama yang berbeda menentukan bilangan yang lebih besar.",
      "Gunakan tanda > untuk lebih dari, < untuk kurang dari, dan = untuk sama dengan. Contoh 599.198 > 599.047 karena angka pertama yang berbeda ada di ratusan: 1 > 0.",
      "Untuk mengurutkan, cari dulu bilangan terbesar atau terkecil, lalu lanjutkan. Pada barisan bilangan, hitung selisih dua bilangan yang berdekatan untuk mengisi yang kosong.",
    ],
    demo: "Pilih dua bilangan, lalu bandingkan kolom demi kolom dari kiri sampai menemukan angka yang berbeda.",
  },
  {
    code: "C", title: "Komposisi dan Dekomposisi", short: "Komposisi dan dekomposisi",
    steps: [
      "Komposisi berarti menyusun bagian-bagian menjadi satu bilangan. Contoh 3 ratus ribuan, 2 puluh ribuan, 7 ribuan, dan 1 ratusan menjadi 327.100.",
      "Dekomposisi berarti menguraikan bilangan menurut nilai tempatnya. Contoh 599.198 = 500.000 + 90.000 + 9.000 + 100 + 90 + 8.",
      "Jika suatu tempat berisi 10 atau lebih, kelompokkan sepuluhnya ke tempat di sebelah kiri. Contoh 12 ribuan = 1 puluh ribuan dan 2 ribuan.",
      "Uang dengan nilai yang sama dapat disusun dengan banyak cara. Rp345.600,00 dapat dibayar dengan lembar dan keping yang berbeda asalkan jumlahnya tepat.",
    ],
    demo: "Masukkan uang ke dompet. Jumlahnya langsung tertulis pada tabel nilai tempat dan dalam bentuk panjang.",
  },
] as const;

/* ---------- Latihan ---------- */
export const practice: MQuestion[][] = [
  [
    q(0, "Harga lemari ukir Jepara tertera pada label. Bacalah harga tersebut: susun kata-katanya.", [{ kind: "words", label: "Dibaca:", n: 867495 }],
      "867.495 dipisah menjadi 867 ribu dan 495: delapan ratus enam puluh tujuh ribu empat ratus sembilan puluh lima.", { scene: { type: "things", items: [{ thing: "lemari", label: "Lemari ukir", price: 867495 }] } }),
    q(0, "Tuliskan bilangan berikut dalam bentuk angka.", [{ kind: "number", label: "Bentuk angka:", answer: 704060 }],
      "Tujuh ratus empat ribu = 704.000, enam puluh = 60. Jadi 704.060. Ratusan diisi 0.", { scene: { type: "text", lines: ["tujuh ratus empat ribu enam puluh"] } }),
    q(0, "Jumlah penduduk sebuah kabupaten 509.318 jiwa. Tuliskan bilangan itu pada tabel nilai tempat.", [{ kind: "place", rows: [{ label: "Penduduk", n: 509318 }] }],
      "Ratus ribuan 5, puluh ribuan 0, ribuan 9, ratusan 3, puluhan 1, satuan 8.", { scene: { type: "big", text: "509.318" } }),
    q(0, "Perhatikan bilangan 624.957. Angka 2 menempati nilai tempat apa, dan berapa nilainya?", [{ kind: "choice", label: "Nilai tempat angka 2", options: ["Ribuan", "Puluh ribuan", "Ratus ribuan", "Ratusan"], answer: "Puluh ribuan" }, { kind: "number", label: "Nilai angka 2:", answer: 20000 }],
      "Angka 2 adalah angka kedua dari kiri: puluh ribuan. Nilainya 2 × 10.000 = 20.000.", { scene: { type: "big", text: "624.957" } }),
  ],
  [
    q(1, "Tunjukkan hubungan kedua bilangan dengan tanda >, <, atau =.", [{ kind: "signs", pairs: [[445000, 454000], [657300, 657030], [126789, 126789]] }],
      "445.000 < 454.000 (puluh ribuan 4 < 5). 657.300 > 657.030 (ratusan 3 > 0). 126.789 = 126.789."),
    q(1, "Urutkan sepatu dari yang harganya termahal sampai termurah.", [{ kind: "order", label: "Termahal sampai termurah", options: ["Sepatu Komang", "Sepatu Lukas", "Sepatu Nisa"], answer: ["Sepatu Komang", "Sepatu Nisa", "Sepatu Lukas"] }],
      "Ratus ribuan sama (4). Puluh ribuan: Lukas 2, lainnya 5, jadi Lukas termurah. Komang dan Nisa baru berbeda di ratusan: 3 > 0. Urutan: Komang 452.300, Nisa 452.030, Lukas 425.300.", { scene: shoes }),
    q(1, "Isilah kotak kosong dengan bilangan yang urutannya sesuai.", [{ kind: "seq", rows: [[978500, 979500, null, null, 982500]], answers: [980500, 981500] }],
      "Setiap bilangan bertambah 1.000: 980.500 dan 981.500."),
    q(1, "Perhatikan grafik pengunjung museum. Pada tahun berapa pengunjungnya paling banyak?", [{ kind: "choice", label: "Tahun", options: ["2017", "2019", "2018", "2020"], answer: "2018" }],
      "251.820 dan 249.960 sama-sama 2 ratus ribuan. Puluh ribuan 5 > 4, jadi 2018 paling banyak.", { scene: { type: "line", ...museum } }),
  ],
  [
    q(2, "Uraikan 458.306 menurut nilai tempatnya.", [{ kind: "expand", n: 458306 }],
      "458.306 = 400.000 + 50.000 + 8.000 + 300 + 0 + 6.", { scene: { type: "big", text: "458.306" } }),
    q(2, "Berikut uang di dompet Ibu. Berapa jumlah uangnya, dan berapa nilai pada tempat puluh ribuan?", [{ kind: "items", items: [{ label: "Jumlah uang (Rp):", answer: 265000 }, { label: "Nilai puluh ribuan:", answer: 60000 }] }],
      "2 × 100.000 + 1 × 50.000 + 3 × 5.000 = 265.000. Angka puluh ribuan 6, nilainya 60.000.", { scene: { type: "wallet", groups: [{ notes: [[100000, 2], [50000, 1], [5000, 3]] }] } }),
    q(2, "Tuliskan bilangan yang merupakan jumlah dari 3 ratus ribuan, 2 puluh ribuan, 7 ribuan, dan 1 ratusan.", [{ kind: "number", label: "Bilangannya:", answer: 327100 }],
      "300.000 + 20.000 + 7.000 + 100 = 327.100. Puluhan dan satuan diisi 0."),
    q(2, "Ayah membeli jam tangan seharga Rp175.000,00. Tuliskan dua cara berbeda untuk membayarnya dengan uang yang tersedia.", [{ kind: "payment", price: 175000, denoms: [100000, 50000, 20000, 10000, 5000], stock: [1, 2, 3, 2, 2], ways: 2, sample: [[1, 1, 1, 0, 1], [0, 2, 3, 1, 1]] }],
      "Contoh: 100.000 + 50.000 + 20.000 + 5.000, atau 2 × 50.000 + 3 × 20.000 + 10.000 + 5.000. Cara lain juga benar jika jumlahnya tepat dan uangnya cukup.", { scene: { type: "things", items: [{ thing: "jam", label: "Jam tangan", price: 175000 }] } }),
  ],
];

/* ---------- Evaluasi: 24 soal, A, B, C bergantian ---------- */
export const assessment: MQuestion[] = [
  // Sedang (1-8)
  q(0, "Nyatakan bilangan berikut dalam bentuk angka.", [{ kind: "number", label: "Bentuk angka:", answer: 580307 }],
    "Lima ratus delapan puluh ribu = 580.000, tiga ratus tujuh = 307. Jadi 580.307.", { level: "Sedang", scene: { type: "text", lines: ["lima ratus delapan puluh ribu tiga ratus tujuh"] } }),
  q(1, "Tunjukkan hubungan kedua bilangan dengan tanda >, <, atau =.", [{ kind: "signs", pairs: [[548000, 584000], [732105, 731250], [409990, 410009], [860600, 860060]] }],
    "548.000 < 584.000; 732.105 > 731.250 (ribuan 2 > 1); 409.990 < 410.009 (puluh ribuan 0 < 1); 860.600 > 860.060 (ratusan 6 > 0).", { level: "Sedang" }),
  q(2, "Tuliskan bilangan yang merupakan jumlah dari 4 ratus ribuan, 6 ribuan, 3 ratusan, dan 8 satuan.", [{ kind: "number", label: "Bilangannya:", answer: 406308 }],
    "400.000 + 6.000 + 300 + 8 = 406.308. Puluh ribuan dan puluhan diisi 0.", { level: "Sedang" }),
  q(0, "Jumlah penduduk sebuah kabupaten tahun 2021 sebanyak 238.415 jiwa. Bacalah bilangan tersebut: susun kata-katanya.", [{ kind: "words", label: "Dibaca:", n: 238415 }],
    "238 ribu dan 415: dua ratus tiga puluh delapan ribu empat ratus lima belas.", { level: "Sedang", scene: { type: "big", text: "238.415 jiwa" } }),
  q(1, "Urutkan sepatu dari yang harganya termahal sampai termurah.", [{ kind: "order", label: "Termahal sampai termurah", options: ["Sepatu Lukas", "Sepatu Nisa", "Sepatu Komang"], answer: ["Sepatu Komang", "Sepatu Nisa", "Sepatu Lukas"] }],
    "Puluh ribuan: Lukas 2, lainnya 5. Komang 452.300 dan Nisa 452.030 berbeda di ratusan: 3 > 0.", { level: "Sedang", scene: shoes }),
  q(2, "Uraikan 703.592 menurut nilai tempatnya.", [{ kind: "expand", n: 703592 }],
    "703.592 = 700.000 + 0 + 3.000 + 500 + 90 + 2.", { level: "Sedang", scene: { type: "big", text: "703.592" } }),
  q(0, "Tuliskan harga lemari pada tabel nilai tempat berikut.", [{ kind: "place", rows: [{ label: "Harga lemari", n: 897645 }] }],
    "897.645: ratus ribuan 8, puluh ribuan 9, ribuan 7, ratusan 6, puluhan 4, satuan 5.", { level: "Sedang", scene: { type: "things", items: [{ thing: "lemari", label: "Lemari ukir", price: 897645 }] } }),
  q(1, "Isilah kotak kosong dengan bilangan yang urutannya sesuai.", [{ kind: "seq", rows: [[462350, null, 462390, null, 462430]], answers: [462370, 462410] }],
    "Dari 462.390 ke 462.430 bertambah 40 dalam dua langkah, jadi setiap langkah bertambah 20: 462.370 dan 462.410.", { level: "Sedang" }),
  // Menantang (9-17)
  q(2, "Berikut uang di dompet Ibu. Berapa jumlahnya? Tuliskan juga pada tabel nilai tempat.", [{ kind: "number", label: "Jumlah uang: Rp", answer: 601000 }, { kind: "place", rows: [{ label: "Uang Ibu", n: 601000 }] }],
    "4 × 100.000 + 3 × 50.000 + 2 × 20.000 + 5.000 + 3 × 2.000 = 400.000 + 150.000 + 40.000 + 5.000 + 6.000 = 601.000. Puluh ribuan berisi 0.", { level: "Menantang", scene: { type: "wallet", groups: [{ notes: [[100000, 4], [50000, 3], [20000, 2], [5000, 1], [2000, 3]] }] } }),
  q(0, "Ibu membayar di kasir sebesar Rp538.274,00. Tentukan nilai tempat setiap angka.", [{ kind: "placeName", rows: [{ text: "Angka 5", answer: "Ratus ribuan" }, { text: "Angka 3", answer: "Puluh ribuan" }, { text: "Angka 8", answer: "Ribuan" }, { text: "Angka 2", answer: "Ratusan" }, { text: "Angka 7", answer: "Puluhan" }, { text: "Angka 4", answer: "Satuan" }] }],
    "Dari kiri: 5 ratus ribuan, 3 puluh ribuan, 8 ribuan, 2 ratusan, 7 puluhan, 4 satuan.", { level: "Menantang", scene: { type: "big", text: "Total Rp538.274,00" } }),
  q(1, "Isilah kotak kosong dengan bilangan yang urutannya sesuai.", [{ kind: "seq", rows: [[null, 350000, 500000, 650000, null], [981250, null, 981750, null, 982250]], answers: [200000, 800000, 981500, 982000] }],
    "Barisan pertama bertambah 150.000: 200.000 dan 800.000. Barisan kedua bertambah 250: 981.500 dan 982.000.", { level: "Menantang" }),
  q(2, "Tuliskan bilangan yang merupakan jumlah dari 3 ratus ribuan, 12 ribuan, 5 ratusan, dan 14 satuan.", [{ kind: "number", label: "Bilangannya:", answer: 312514 }],
    "300.000 + 12.000 + 500 + 14 = 312.514. Dua belas ribuan sama dengan 1 puluh ribuan dan 2 ribuan.", { level: "Menantang" }),
  q(0, "Toko Keenan menjual peralatan komputer. Tuliskan nilai tempat angka 9 pada setiap harga.", [{ kind: "placeName", rows: shop.type === "things" ? shop.items.map(it => ({ text: `${it.label} (${fmt(it.price)})`, answer: nineAt(it.price) })) : [] }],
    "289.450: ribuan. 196.300: puluh ribuan. 845.900: ratusan. 154.890: puluhan.", { level: "Menantang", scene: shop }),
  q(1, "Perhatikan grafik wisatawan mancanegara. Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Wisatawan tahun 2019 lebih banyak daripada tahun 2018.", answer: false },
    { text: "Wisatawan paling sedikit terjadi pada tahun 2020.", answer: true },
    { text: "Ada dua tahun yang wisatawannya lebih dari 400.000.", answer: true },
    { text: "Wisatawan tahun 2016 dibaca tiga ratus enam puluh dua ribu empat ratus lima puluh.", answer: false },
  ] }], "413.067 < 416.730, jadi pernyataan pertama salah. 71.952 paling sedikit. 2018 dan 2019 lebih dari 400.000. 362.415 dibaca ... empat ratus lima belas.", { level: "Menantang", scene: { type: "line", ...visitors } }),
  q(2, "Ibu akan membeli jam tangan seharga Rp345.600,00. Tuliskan dua cara berbeda untuk membayar dengan uang yang Ibu miliki.", [{ kind: "payment", price: 345600, denoms: [100000, 50000, 20000, 10000, 5000, 500, 100], stock: [2, 3, 4, 2, 2, 3, 3], ways: 2, sample: [[2, 2, 2, 0, 1, 1, 1], [1, 3, 4, 1, 1, 1, 1]] }],
    "Contoh: 2 × 100.000 + 2 × 50.000 + 2 × 20.000 + 5.000 + 500 + 100, atau 100.000 + 3 × 50.000 + 4 × 20.000 + 10.000 + 5.000 + 500 + 100.", { level: "Menantang", scene: { type: "things", items: [{ thing: "jam", label: "Jam tangan", price: 345600 }] } }),
  q(0, "Susun kartu angka 4, 0, 7, 2, 9, 5 menjadi bilangan enam angka. Setiap kartu dipakai satu kali dan angka 0 tidak boleh di depan.", [{ kind: "cards", label: "Bilangan terbesar:", digits: [4, 0, 7, 2, 9, 5], answer: 975420 }, { kind: "cards", label: "Bilangan terkecil:", digits: [4, 0, 7, 2, 9, 5], answer: 204579 }],
    "Terbesar: angka dari yang terbesar, 975.420. Terkecil: 0 tidak boleh di depan, jadi 2 di depan lalu 0: 204.579.", { level: "Menantang" }),
  q(1, "Urutkan tahun dari jumlah wisatawan yang paling sedikit sampai yang paling banyak.", [{ kind: "order", label: "Paling sedikit sampai paling banyak", options: visitors.labels, answer: ["2020", "2016", "2017", "2019", "2018"] }],
    "71.952 < 362.415 < 398.204 < 413.067 < 416.730.", { level: "Menantang", scene: { type: "line", ...visitors } }),
  // Sangat menantang (18-24)
  q(2, "Kakak membeli rak mainan seharga Rp287.500,00. Tuliskan tiga cara berbeda untuk membayarnya dengan uang yang tersedia.", [{ kind: "payment", price: 287500, denoms: [100000, 50000, 20000, 10000, 5000, 2000, 500], stock: [2, 2, 3, 1, 3, 2, 3], ways: 3, sample: [[2, 1, 1, 1, 1, 1, 1], [1, 2, 3, 1, 3, 1, 1], [2, 0, 3, 1, 3, 1, 1]] }],
    "Setiap cara harus berjumlah tepat 287.500 dan tidak melebihi persediaan. Bagian 500 dibayar dengan keping 500. Contoh: 2 × 100.000 + 50.000 + 20.000 + 10.000 + 5.000 + 2.000 + 500.", { level: "Sangat menantang" }),
  q(0, "Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Pada 608.040, angka 8 bernilai 8.000.", answer: true },
    { text: "604.007 dibaca enam ratus empat ribu tujuh.", answer: true },
    { text: "Angka 6 pada 316.825 bernilai 600.", answer: false },
    { text: "Bilangan 1.000.000 dibaca sepuluh ratus ribu.", answer: false },
  ] }], "608.040: 8 di ribuan, bernilai 8.000. 604.007 benar. Angka 6 pada 316.825 di ribuan, bernilai 6.000. 1.000.000 dibaca satu juta.", { level: "Sangat menantang" }),
  q(1, "Pilihlah pernyataan yang benar dan yang salah.", [{ kind: "tf", statements: [
    { text: "Dua ratus tujuh puluh lima ribu lebih banyak daripada dua ratus lima puluh tujuh ribu.", answer: true },
    { text: "Urutan dari yang terkecil ke yang terbesar adalah 676.785, 786.897, 789.876, 789.867.", answer: false },
    { text: "Sembilan ratus ribu sembilan lebih kecil daripada sembilan ratus sembilan ribu.", answer: true },
  ] }], "275.000 > 257.000. 789.876 > 789.867, jadi urutannya salah. 900.009 < 909.000.", { level: "Sangat menantang" }),
  q(2, "Perhatikan uang Yosep dan uang Komang. Berapa jumlah uang masing-masing, dan berapa selisihnya?", [{ kind: "items", items: [{ label: "Uang Yosep (Rp):", answer: 539000 }, { label: "Uang Komang (Rp):", answer: 571000 }, { label: "Selisih (Rp):", answer: 32000 }] }],
    "Yosep: 400.000 + 100.000 + 20.000 + 15.000 + 4.000 = 539.000. Komang: 500.000 + 20.000 + 40.000 + 5.000 + 6.000 = 571.000. Selisih 32.000.",
    { level: "Sangat menantang", scene: { type: "wallet", groups: [{ name: "Uang Yosep", notes: [[100000, 4], [20000, 5], [10000, 2], [5000, 3], [2000, 2]] }, { name: "Uang Komang", notes: [[100000, 5], [20000, 1], [10000, 4], [5000, 1], [2000, 3]] }] } }),
  q(0, "Bacalah bilangan berikut: susun kata-katanya.", [{ kind: "words", label: "Dibaca:", n: 905040 }],
    "905 ribu dan 040: sembilan ratus lima ribu empat puluh. Angka 0 tidak diucapkan.", { level: "Sangat menantang", scene: { type: "big", text: "905.040" } }),
  q(1, "Angka berapakah yang paling kecil untuk mengisi kotak agar pernyataan berikut benar?", [{ kind: "number", label: "Angka di kotak:", answer: 5 }],
    "Ratus ribuan sama (5). Kotak berada di puluh ribuan, dibandingkan dengan 4. Jika kotak 4, 548.214 < 548.300. Jadi angka terkecil adalah 5.", { level: "Sangat menantang", scene: { type: "big", text: "5□8.214 > 548.300" } }),
  q(2, "Bagian manakah yang hilang dari dekomposisi berikut?", [{ kind: "number", label: "Bagian yang hilang:", answer: 10000 }],
    "614.385 = 600.000 + 10.000 + 4.000 + 300 + 80 + 5. Yang belum ada adalah 10.000.", { level: "Sangat menantang", scene: { type: "big", text: "614.385 = 4.000 + 300 + … + 5 + 600.000 + 80" } }),
];

/** Sumber data untuk pemeriksaan kunci jawaban. */
export const sources = { visitors, museum, shoes, shop };
