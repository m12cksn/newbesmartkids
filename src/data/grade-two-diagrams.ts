import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 2 Bab 8 - Berbagai Diagram (Buku Matematika SD/MI Kelas II, hlm. 225-248).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";

export const things = {
  apel: "Apel", jeruk: "Jeruk", anggur: "Anggur", pisang: "Pisang", mangga: "Mangga", semangka: "Semangka", alpukat: "Alpukat", manggis: "Manggis", stroberi: "Stroberi",
  brokoli: "Brokoli", bayam: "Bayam", wortel: "Wortel", jagung: "Jagung",
  mobilan: "Mobil-mobilan", boneka: "Boneka", kelereng: "Kelereng", balok: "Mainan balok",
  mawar: "Mawar", lili: "Lili", tulip: "Tulip", aster: "Aster",
  ayam: "Ayam", bebek: "Bebek", kambing: "Kambing", sapi: "Sapi",
  kucing: "Kucing", ikan: "Ikan", kelinci: "Kelinci", burung: "Burung",
  cucur: "Kue cucur", onde: "Onde-onde", lemper: "Lemper", talam: "Kue talam",
  sepeda: "Naik sepeda", motor: "Diantar motor", jalan: "Jalan kaki", mobil: "Diantar mobil", bus: "Bus",
  gasing: "Gasing", layang: "Layang-layang", congklak: "Congklak", tali: "Lompat tali",
  kalengCokelat: "Kaleng cokelat", kalengHijau: "Kaleng hijau", kalengMerah: "Kaleng merah muda", kalengBiru: "Kaleng biru",
} as const;
export type Thing = keyof typeof things;
export type PicSymbol = "bintang" | "lingkaran" | "hati" | "senyum" | "pelari";
export const symbolName: Record<PicSymbol, string> = { bintang: "bintang", lingkaran: "lingkaran", hati: "hati", senyum: "wajah senyum", pelari: "anak berlari" };
export type Swatch = "merah" | "kuning" | "biru" | "hijau" | "hitam" | "jingga" | "ungu";
export const swatchHex: Record<Swatch, string> = { merah: "#e23d5f", kuning: "#f2b134", biru: "#2f9ad6", hijau: "#5fb246", hitam: "#28282c", jingga: "#f08a24", ungu: "#8d63c7" };

/** Baris tabel: name ditulis di kolom pertama; thing (jika ada) digambar di sampingnya. */
export type Row = { name: string; thing?: Thing; n: number; color?: Swatch };
export type Scene =
  /** Kumpulan benda acak (bisa diketuk untuk menandai). */
  | { type: "scatter"; items: { thing: Thing; n: number }[]; frame?: "meja" | "vas" | "keranjang" | "awan" }
  /** Diagram turus; showCount false berarti kolom banyak tidak ditampilkan. */
  | { type: "tally"; title: string; head: [string, string]; rows: Row[]; showCount?: boolean }
  /** Diagram gambar; setiap simbol mewakili 1. */
  | { type: "picto"; title: string; head: [string, string]; rows: Row[]; symbol: PicSymbol; color?: Swatch; unit: string; rowLabel?: "name" | "thing" }
  /** Data berupa kalimat. */
  | { type: "list"; lines: string[] };

export type Part =
  | { kind: "number"; label: string; answer: number }
  /** Kolom banyak pada diagram turus yang turusnya sudah ada. */
  | { kind: "tallyFill"; title: string; head: [string, string, string]; rows: Row[] }
  /** Membuat turus dan menulis banyaknya. */
  | { kind: "tallyBuild"; title: string; head: [string, string, string]; rows: Row[] }
  /** Membuat diagram gambar dengan mengetuk baris. */
  | { kind: "picBuild"; title: string; head: [string, string]; rows: Row[]; symbol: PicSymbol; color?: Swatch; unit: string }
  /** Kalimat rumpang berisi satu nama: label memuat ___. */
  | { kind: "pick"; label: string; options: string[]; answer: string }
  /** Kalimat "___ dan ___ sama banyak": urutan bebas. */
  | { kind: "pair"; label: string; options: string[]; answer: [string, string] }
  /** Pilihan ganda; tallies berarti pilihan digambar sebagai turus, things berarti pilihan bergambar. */
  | { kind: "choice"; label: string; options: string[]; answer: string; tallies?: boolean; things?: Thing[] };

export type DQuestion = Question & { topic: 0 | 1; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);

function partAnswer(p: Part): string {
  switch (p.kind) {
    case "number": return String(p.answer);
    case "tallyFill": return p.rows.map(r => r.n).join("|");
    case "tallyBuild": return p.rows.map(r => `${r.n},${r.n}`).join("|");
    case "picBuild": return p.rows.map(r => r.n).join("|");
    case "pick": case "choice": return p.answer;
    case "pair": return p.answer.join("|");
  }
}
function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": return int(v) === p.answer;
    case "tallyFill": case "picBuild": { const x = v.split("|"); return x.length === p.rows.length && p.rows.every((r, i) => int(x[i]) === r.n); }
    case "tallyBuild": { const x = v.split("|"); return x.length === p.rows.length && p.rows.every((r, i) => { const [t, c] = (x[i] ?? "").split(","); return int(t) === r.n && int(c) === r.n; }); }
    case "pair": { const x = v.split("|"); return x.length === 2 && x[0] !== x[1] && x.every(y => p.answer.includes(y)); }
    default: return v === partAnswer(p);
  }
}
function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": return !Number.isNaN(int(v));
    case "tallyFill": { const x = v.split("|"); return x.length === p.rows.length && x.every(y => !Number.isNaN(int(y))); }
    case "picBuild": { const x = v.split("|"); return x.length === p.rows.length && x.every(y => int(y) > 0); }
    case "tallyBuild": { const x = v.split("|"); return x.length === p.rows.length && x.every(y => { const [t, c] = y.split(","); return int(t) > 0 && !Number.isNaN(int(c)); }); }
    case "pair": { const x = v.split("|"); return x.length === 2 && x.every(Boolean); }
    default: return Boolean(v);
  }
}
export const correct = (q: DQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: DQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const fillBlanks = (label: string, xs: string[]) => { let k = 0; return label.replace(/___/g, () => xs[k++] || "…"); };
export function formatAnswer(q: DQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = v[i];
    switch (p.kind) {
      case "number": return `${p.label} ${x || "…"}`;
      case "tallyFill": case "picBuild": { const xs = x.split("|"); return p.rows.map((r, k) => `${r.name} ${xs[k] || "…"}`).join(", "); }
      case "tallyBuild": { const xs = x.split("|"); return p.rows.map((r, k) => { const [t, c] = (xs[k] ?? "").split(","); return `${r.name} ${t || 0} turus, ditulis ${c || "…"}`; }).join("; "); }
      case "pick": return fillBlanks(p.label, [x]);
      case "pair": return fillBlanks(p.label, x.split("|"));
      default: return x || "…";
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: DQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): DQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(partAnswer).join(SEP), ...extra });
const rows = (list: [Thing, number][], names?: string[]): Row[] => list.map(([t, n], i) => ({ name: names?.[i] ?? things[t], thing: t, n }));
const scatter = (list: [Thing, number][], frame?: "meja" | "vas" | "keranjang" | "awan"): Scene => ({ type: "scatter", items: list.map(([thing, n]) => ({ thing, n })), frame });
const names = (r: Row[]) => r.map(x => x.name);

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Diagram Turus", short: "Diagram turus",
    steps: [
      "Diagram turus memakai garis tegak seperti lidi. Satu turus I mewakili satu benda.",
      "Setiap lima data dikelompokkan: empat garis tegak lalu satu garis miring. Kelompok lima memudahkan kita menghitung.",
      "Hitung kelompok lima dulu, lalu tambah turus sisanya. Dua kelompok lima dan 2 turus berarti 5 + 5 + 2 = 12.",
      "Dari diagram turus kita tahu benda yang paling banyak, yang sama banyak, dan berapa lebihnya atau kurangnya.",
    ],
    demo: "Ketuk setiap buah di gambar. Buah yang diketuk diberi tanda dan satu turus masuk ke barisnya. Lalu pilih dua baris untuk dibandingkan.",
  },
  {
    code: "B", title: "Diagram Gambar", short: "Diagram gambar",
    steps: [
      "Diagram gambar memakai gambar untuk mewakili data. Setiap gambar mewakili 1 benda atau 1 anak.",
      "Gambar boleh berupa bintang, lingkaran, hati, atau wajah senyum. Yang penting ukurannya sama dan berjajar rapi.",
      "Untuk membaca diagram gambar, hitung gambar pada setiap baris.",
      "Baris yang gambarnya paling panjang adalah yang paling banyak. Jumlahkan baris untuk mengetahui jumlah semuanya.",
    ],
    demo: "Pilih gambar, lalu ketuk Tambah pada setiap baris sampai banyaknya sesuai dengan data.",
  },
] as const;

/* ---------- Data bersama ---------- */
const ternak1 = rows([["ayam", 9], ["kambing", 6], ["sapi", 3], ["bebek", 10]]);
const bunga1 = rows([["mawar", 7], ["lili", 4], ["tulip", 5], ["aster", 4]]);
const kue1 = rows([["cucur", 6], ["onde", 5], ["lemper", 3], ["talam", 7]]);
const parsel1 = rows([["jeruk", 5], ["apel", 3], ["pisang", 6], ["mangga", 2]]);
const warna1: Row[] = [{ name: "Merah", n: 7, color: "merah" }, { name: "Kuning", n: 3, color: "kuning" }, { name: "Biru", n: 5, color: "biru" }, { name: "Hitam", n: 2, color: "hitam" }];

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: DQuestion[][] = [
  [
    q(0, "Kira mendata buah di keranjang. Lengkapi diagram turus dengan mengisi kolom paling kanan.",
      [{ kind: "tallyFill", title: "Diagram Turus Buah di Keranjang", head: ["Nama Buah", "Turus", "Banyak Buah"], rows: rows([["apel", 3], ["jeruk", 5], ["mangga", 7], ["pisang", 4]]) }],
      "III = 3, satu kelompok lima = 5, kelompok lima dan II = 7, IIII = 4."),
    q(0, "Malosi mendata sayur kesukaan teman-temannya. Buatlah diagram turus dari data di atas.",
      [{ kind: "tallyBuild", title: "Diagram Turus Sayur Kesukaan", head: ["Nama Sayuran", "Turus", "Banyak Anak"], rows: rows([["brokoli", 5], ["bayam", 2], ["wortel", 6], ["jagung", 3]]) }],
      "Brokoli 5 (satu kelompok lima), bayam 2, wortel 6 (kelompok lima dan I), jagung 3.", { scene: scatter([["brokoli", 5], ["bayam", 2], ["wortel", 6], ["jagung", 3]], "awan") }),
    q(0, "Perhatikan diagram turus hewan ternak Paman Halim. Lengkapi kalimatnya.",
      [{ kind: "pick", label: "Hewan yang paling banyak adalah ___.", options: names(ternak1), answer: "Bebek" }, { kind: "number", label: "Banyak bebek … lebihnya dari banyak ayam:", answer: 1 }],
      "Bebek 10 paling banyak. Ayam 9. 10 adalah 1 lebihnya dari 9.", { scene: { type: "tally", title: "Diagram Turus Hewan Ternak Paman Halim", head: ["Nama Hewan", "Banyak Hewan"], rows: ternak1 } }),
    q(0, "Tika dan Ibu merangkai bunga. Lengkapi kalimat sesuai diagram turus.",
      [{ kind: "pair", label: "Bunga ___ dan ___ sama banyak.", options: names(bunga1), answer: ["Lili", "Aster"] }, { kind: "number", label: "Banyak bunga aster … kurangnya dari banyak bunga mawar:", answer: 3 }],
      "Lili 4 dan aster 4 sama banyak. Mawar 7, aster 4. 4 adalah 3 kurangnya dari 7.", { scene: { type: "tally", title: "Diagram Turus Banyak Bunga dalam Satu Rangkaian", head: ["Bunga", "Banyak Bunga"], rows: bunga1 } }),
  ],
  [
    q(1, "Kira mendata kue kesukaan teman sekelasnya. Lengkapi kalimat sesuai diagram gambar.",
      [{ kind: "number", label: "Ada … anak yang suka kue cucur.", answer: 6 }, { kind: "number", label: "Ada … anak yang suka kue talam.", answer: 7 }],
      "Hitung bintang pada setiap baris: kue cucur 6 bintang, kue talam 7 bintang.", { scene: { type: "picto", title: "Diagram Gambar Kue Kesukaan", head: ["Kue Kesukaan", "Banyak Anak"], rows: kue1, symbol: "bintang", color: "merah", unit: "anak", rowLabel: "thing" } }),
    q(1, "Upe mendata permainan tradisional kesukaan teman-temannya. Buatlah diagram gambar berdasarkan data.",
      [{ kind: "picBuild", title: "Diagram Gambar Permainan Tradisional Kesukaan", head: ["Permainan", "Banyak Anak"], rows: rows([["gasing", 4], ["layang", 6], ["congklak", 5], ["tali", 7]]), symbol: "bintang", color: "jingga", unit: "anak" }],
      "Gasing 4 bintang, layang-layang 6 bintang, congklak 5 bintang, lompat tali 7 bintang.",
      { scene: { type: "list", lines: ["Ada 4 anak yang suka bermain gasing.", "Ada 6 anak yang suka bermain layang-layang.", "Ada 5 anak yang suka bermain congklak.", "Ada 7 anak yang suka bermain lompat tali."] } }),
    q(1, "Ibu merangkai parsel buah untuk Bibi. Lengkapi kalimat sesuai diagram gambar.",
      [{ kind: "number", label: "Ada … buah mangga.", answer: 2 }, { kind: "number", label: "Jumlah buah mangga dan pisang adalah", answer: 8 }],
      "Mangga 2 gambar, pisang 6 gambar. 2 + 6 = 8.", { scene: { type: "picto", title: "Diagram Gambar Banyak Buah dalam Parsel", head: ["Buah", "Banyak Buah"], rows: parsel1, symbol: "bintang", color: "hijau", unit: "buah", rowLabel: "thing" } }),
    q(1, "Perhatikan diagram gambar warna kesukaan siswa kelas II.",
      [{ kind: "pick", label: "Warna yang paling disukai adalah ___.", options: names(warna1), answer: "Merah" }, { kind: "number", label: "Penyuka warna biru … lebihnya dari penyuka warna hitam:", answer: 3 }],
      "Merah 7 bintang paling banyak. Biru 5, hitam 2. 5 adalah 3 lebihnya dari 2.", { scene: { type: "picto", title: "Diagram Gambar Warna Kesukaan Siswa Kelas II", head: ["Warna", "Banyak Siswa"], rows: warna1, symbol: "bintang", unit: "siswa" } }),
  ],
];

/* ---------- Evaluasi: 24 soal, A dan B bergantian ---------- */
const mainan = rows([["mobilan", 6], ["boneka", 8], ["kelereng", 11], ["balok", 7]]);
const kue2 = rows([["cucur", 5], ["onde", 8], ["lemper", 4], ["talam", 6]]);
const ternak2 = rows([["ayam", 12], ["kambing", 7], ["sapi", 5], ["bebek", 9]]);
const warna2: Row[] = [{ name: "Merah", n: 6, color: "merah" }, { name: "Kuning", n: 4, color: "kuning" }, { name: "Biru", n: 8, color: "biru" }, { name: "Hijau", n: 3, color: "hijau" }];
const bunga2 = rows([["mawar", 10], ["lili", 6], ["tulip", 8], ["aster", 6]]);
const berangkat = rows([["sepeda", 8], ["motor", 11], ["jalan", 6], ["mobil", 4]]);
const parsel2 = rows([["jeruk", 6], ["apel", 4], ["pisang", 7], ["mangga", 3]]);
const buah3 = rows([["anggur", 7], ["manggis", 9], ["stroberi", 5], ["semangka", 6]]);
const lari1: Row[] = [{ name: "1", n: 4 }, { name: "2", n: 5 }, { name: "3", n: 4 }, { name: "4", n: 3 }];
const peliharaan = rows([["kucing", 7], ["ikan", 5], ["kelinci", 4], ["burung", 3]]);
const bunga3 = rows([["mawar", 13], ["lili", 8], ["tulip", 10], ["aster", 9]]);
const warna3: Row[] = [{ name: "Merah", n: 8, color: "merah" }, { name: "Kuning", n: 4, color: "kuning" }, { name: "Biru", n: 7, color: "biru" }, { name: "Hitam", n: 2, color: "hitam" }];
const ternak3 = rows([["ayam", 14], ["bebek", 9], ["kambing", 7], ["sapi", 5]]);
const lari2: Row[] = [{ name: "1", n: 3 }, { name: "2", n: 6 }, { name: "3", n: 5 }, { name: "4", n: 4 }];
const kaleng = (a: number, b: number, c: number, d: number) => scatter([["kalengCokelat", a], ["kalengHijau", b], ["kalengMerah", c], ["kalengBiru", d]]);
const kalengOpts = ["A. Kaleng cokelat", "B. Kaleng hijau", "C. Kaleng merah muda", "D. Kaleng biru"];
const kalengThings: Thing[] = ["kalengCokelat", "kalengHijau", "kalengMerah", "kalengBiru"];

export const assessment: DQuestion[] = [
  // Sedang
  q(0, "Kira mendata mainan kesukaan teman-temannya. Lengkapi diagram turus dengan mengisi kolom paling kanan.",
    [{ kind: "tallyFill", title: "Diagram Turus Mainan Kesukaan", head: ["Mainan", "Turus", "Banyak Anak"], rows: mainan }],
    "Hitung kelompok lima dulu: mobil-mobilan 5 + 1 = 6, boneka 5 + 3 = 8, kelereng 5 + 5 + 1 = 11, mainan balok 5 + 2 = 7.", { level: "Sedang" }),
  q(1, "Perhatikan diagram gambar kue kesukaan berikut. Lengkapi kalimatnya.",
    [{ kind: "number", label: "Ada … anak yang suka onde-onde.", answer: 8 }, { kind: "number", label: "Ada … anak yang suka lemper.", answer: 4 }],
    "Baris onde-onde berisi 8 bintang dan baris lemper berisi 4 bintang. Setiap bintang mewakili 1 anak.",
    { level: "Sedang", scene: { type: "picto", title: "Diagram Gambar Kue Kesukaan", head: ["Kue Kesukaan", "Banyak Anak"], rows: kue2, symbol: "bintang", color: "merah", unit: "anak", rowLabel: "thing" } }),
  q(0, "Malosi mendata sayur kesukaan teman-temannya. Buatlah diagram turus dari data di atas.",
    [{ kind: "tallyBuild", title: "Diagram Turus Sayur Kesukaan", head: ["Nama Sayuran", "Turus", "Banyak Anak"], rows: rows([["brokoli", 4], ["bayam", 6], ["wortel", 3], ["jagung", 5]]) }],
    "Brokoli IIII = 4, bayam satu kelompok lima dan I = 6, wortel III = 3, jagung satu kelompok lima = 5.",
    { level: "Sedang", scene: scatter([["brokoli", 4], ["bayam", 6], ["wortel", 3], ["jagung", 5]], "awan") }),
  q(1, "Upe mendata permainan tradisional kesukaan teman-temannya. Buatlah diagram gambar berdasarkan data.",
    [{ kind: "picBuild", title: "Diagram Gambar Permainan Tradisional Kesukaan", head: ["Permainan", "Banyak Anak"], rows: rows([["gasing", 3], ["layang", 6], ["congklak", 4], ["tali", 5]]), symbol: "bintang", color: "jingga", unit: "anak" }],
    "Gasing 3 bintang, layang-layang 6 bintang, congklak 4 bintang, lompat tali 5 bintang.",
    { level: "Sedang", scene: { type: "list", lines: ["Ada 3 anak yang suka bermain gasing.", "Ada 6 anak yang suka bermain layang-layang.", "Ada 4 anak yang suka bermain congklak.", "Ada 5 anak yang suka bermain lompat tali."] } }),
  q(0, "Perhatikan diagram turus hewan ternak Paman Halim. Lengkapi kalimatnya.",
    [{ kind: "number", label: "Di peternakan ada … kambing.", answer: 7 }, { kind: "pick", label: "Hewan yang paling banyak adalah ___.", options: names(ternak2), answer: "Ayam" }],
    "Kambing: satu kelompok lima dan II = 7. Ayam dua kelompok lima dan II = 12, paling banyak.",
    { level: "Sedang", scene: { type: "tally", title: "Diagram Turus Hewan Ternak Paman Halim", head: ["Nama Hewan", "Banyak Hewan"], rows: ternak2, showCount: false } }),
  q(1, "Perhatikan diagram gambar warna kesukaan siswa kelas II.",
    [{ kind: "pick", label: "Warna yang paling disukai adalah ___.", options: names(warna2), answer: "Biru" }, { kind: "number", label: "Berapa siswa yang menyukai warna hijau?", answer: 3 }],
    "Biru 8 bintang, barisnya paling panjang. Hijau 3 bintang.",
    { level: "Sedang", scene: { type: "picto", title: "Diagram Gambar Warna Kesukaan", head: ["Warna", "Banyak Siswa"], rows: warna2, symbol: "bintang", unit: "siswa" } }),
  q(0, "Malosi mendata buah yang dibeli Ibu di pasar. Buatlah diagram turus dari buah-buahan di atas meja.",
    [{ kind: "tallyBuild", title: "Diagram Turus Buah yang Dibeli Ibu", head: ["Nama Buah", "Turus", "Banyaknya"], rows: rows([["apel", 4], ["jeruk", 7], ["semangka", 1], ["alpukat", 3]]) }],
    "Apel 4, jeruk 7 (kelompok lima dan II), semangka 1, alpukat 3.",
    { level: "Sedang", scene: scatter([["apel", 4], ["jeruk", 7], ["semangka", 1], ["alpukat", 3]], "meja") }),
  q(1, "Mira mengumpulkan kaleng. Kaleng mana yang paling banyak Mira kumpulkan?",
    [{ kind: "choice", label: "Kaleng paling banyak", options: kalengOpts, answer: "D. Kaleng biru", things: kalengThings }],
    "Kelompokkan menurut warna: cokelat 5, hijau 4, merah muda 3, biru 6. Kaleng biru paling banyak.",
    { level: "Sedang", scene: kaleng(5, 4, 3, 6) }),
  // Menantang
  q(0, "Tika dan Ibu merangkai bunga. Lengkapi kalimat sesuai diagram turus.",
    [{ kind: "pair", label: "Bunga ___ dan ___ sama banyak.", options: names(bunga2), answer: ["Lili", "Aster"] }, { kind: "number", label: "Banyak bunga mawar … lebihnya dari banyak bunga lili:", answer: 4 }],
    "Lili 6 dan aster 6 sama banyak. Mawar 10 (dua kelompok lima), lili 6. 10 adalah 4 lebihnya dari 6.",
    { level: "Menantang", scene: { type: "tally", title: "Diagram Turus Banyak Bunga dalam Satu Rangkaian", head: ["Bunga", "Banyak Bunga"], rows: bunga2, showCount: false } }),
  q(1, "Buatlah diagram gambar buah kesukaan dari gambar di atas.",
    [{ kind: "picBuild", title: "Diagram Gambar Buah Kesukaan", head: ["Nama Buah", "Banyak Siswa"], rows: rows([["pisang", 5], ["manggis", 3], ["jeruk", 7], ["stroberi", 4]]), symbol: "bintang", color: "merah", unit: "siswa" }],
    "Hitung setiap buah dan tandai yang sudah dihitung: pisang 5, manggis 3, jeruk 7, stroberi 4.",
    { level: "Menantang", scene: scatter([["pisang", 5], ["manggis", 3], ["jeruk", 7], ["stroberi", 4]], "awan") }),
  q(0, "Perhatikan diagram turus cara berangkat ke sekolah. Lengkapi kalimatnya.",
    [{ kind: "number", label: "Anak yang diantar motor … lebihnya dari anak yang naik sepeda:", answer: 3 }, { kind: "number", label: "Anak yang jalan kaki … kurangnya dari anak yang diantar motor:", answer: 5 }],
    "Diantar motor 11, naik sepeda 8, jalan kaki 6. 11 adalah 3 lebihnya dari 8. 6 adalah 5 kurangnya dari 11.",
    { level: "Menantang", scene: { type: "tally", title: "Diagram Turus Cara Berangkat ke Sekolah", head: ["Cara Berangkat", "Banyak Anak"], rows: berangkat, showCount: false } }),
  q(1, "Upe dan Ibu membawa parsel buah untuk Nenek. Lengkapi kalimat sesuai diagram gambar.",
    [{ kind: "number", label: "Jumlah buah apel dan jeruk adalah", answer: 10 }, { kind: "number", label: "Jumlah semua buah dalam parsel adalah", answer: 20 }],
    "Apel 4 dan jeruk 6: 4 + 6 = 10. Semua buah: 6 + 4 + 7 + 3 = 20.",
    { level: "Menantang", scene: { type: "picto", title: "Diagram Gambar Banyak Buah dalam Parsel", head: ["Buah", "Banyak Buah"], rows: parsel2, symbol: "bintang", color: "hijau", unit: "buah", rowLabel: "thing" } }),
  q(0, "Perhatikan diagram turus buah kesukaan. Lengkapi kalimatnya.",
    [{ kind: "pick", label: "Buah ___ lebih banyak disukai daripada buah anggur.", options: names(buah3), answer: "Manggis" }, { kind: "number", label: "Penyuka anggur … lebihnya dari penyuka stroberi:", answer: 2 }],
    "Anggur 7. Hanya manggis (9) yang lebih dari 7. Anggur 7 dan stroberi 5: 7 adalah 2 lebihnya dari 5.",
    { level: "Menantang", scene: { type: "tally", title: "Diagram Turus Buah Kesukaan", head: ["Nama Buah", "Banyak Anak"], rows: buah3, showCount: false } }),
  q(1, "Para siswa kelas II berlari mengelilingi lapangan. Diagram berikut menunjukkan data 16 siswa yang berlari.",
    [{ kind: "number", label: "Jumlah siswa yang berlari lebih dari dua putaran adalah", answer: 7 }, { kind: "number", label: "Siswa yang berlari 2 putaran … lebihnya dari siswa yang berlari 4 putaran:", answer: 2 }],
    "Lebih dari dua putaran berarti 3 putaran dan 4 putaran: 4 + 3 = 7. Dua putaran 5 siswa, empat putaran 3 siswa: 5 adalah 2 lebihnya dari 3.",
    { level: "Menantang", scene: { type: "picto", title: "Diagram Gambar Siswa yang Berlari", head: ["Banyak Putaran", "Banyak Siswa"], rows: lari1, symbol: "pelari", color: "biru", unit: "siswa" } }),
  q(0, "Siti mencatat kendaraan yang lewat di depan sekolah. Buatlah diagram turus dari data berikut.",
    [{ kind: "tallyBuild", title: "Diagram Turus Kendaraan yang Lewat", head: ["Kendaraan", "Turus", "Banyaknya"], rows: rows([["sepeda", 7], ["motor", 12], ["mobil", 5], ["bus", 2]], ["Sepeda", "Motor", "Mobil", "Bus"]) }],
    "Sepeda 7 = kelompok lima dan II. Motor 12 = dua kelompok lima dan II. Mobil 5 = satu kelompok lima. Bus 2 = II.",
    { level: "Menantang", scene: { type: "list", lines: ["Ada 7 sepeda.", "Ada 12 motor.", "Ada 5 mobil.", "Ada 2 bus."] } }),
  q(1, "Perhatikan diagram gambar hewan peliharaan kesukaan. Setiap lingkaran mewakili 1 anak.",
    [{ kind: "pick", label: "Hewan peliharaan yang paling sedikit disukai adalah ___.", options: names(peliharaan), answer: "Burung" }, { kind: "number", label: "Jumlah anak yang suka kucing dan kelinci adalah", answer: 11 }],
    "Burung 3 lingkaran, paling sedikit. Kucing 7 dan kelinci 4: 7 + 4 = 11.",
    { level: "Menantang", scene: { type: "picto", title: "Diagram Gambar Hewan Peliharaan Kesukaan", head: ["Hewan", "Banyak Anak"], rows: peliharaan, symbol: "lingkaran", color: "ungu", unit: "anak" } }),
  q(0, "Kira menghitung 12 kelereng. Diagram turus mana yang benar?",
    [{ kind: "choice", label: "Turus untuk 12", options: ["13", "7", "12", "11"], answer: "12", tallies: true }],
    "12 = 5 + 5 + 2, jadi dua kelompok lima dan dua turus. Satu kelompok lima dan dua turus hanya 7.", { level: "Menantang" }),
  // Sangat menantang
  q(1, "Buatlah diagram gambar cara berangkat ke sekolah dari data berikut.",
    [{ kind: "picBuild", title: "Diagram Gambar Cara Berangkat ke Sekolah", head: ["Cara Berangkat", "Banyak Anak"], rows: rows([["sepeda", 4], ["motor", 7], ["jalan", 5], ["mobil", 4]]), symbol: "senyum", color: "kuning", unit: "anak" }],
    "Sepeda 4. Diantar motor 3 lebihnya dari 4 = 7. Jalan kaki 2 kurangnya dari 7 = 5. Diantar mobil sama dengan sepeda = 4.",
    { level: "Sangat menantang", scene: { type: "list", lines: ["Ada 4 anak yang naik sepeda.", "Anak yang diantar motor 3 lebihnya dari anak yang naik sepeda.", "Anak yang jalan kaki 2 kurangnya dari anak yang diantar motor.", "Anak yang diantar mobil sama banyak dengan anak yang naik sepeda."] } }),
  q(0, "Paman Halim mendata hewan di peternakannya. Buatlah diagram turus dari gambar di atas.",
    [{ kind: "tallyBuild", title: "Diagram Turus Hewan Ternak", head: ["Nama Hewan", "Turus", "Banyak Hewan"], rows: rows([["ayam", 11], ["bebek", 8], ["kambing", 6], ["sapi", 4]]) }],
    "Tandai hewan yang sudah dihitung agar tidak terhitung dua kali. Ayam 11, bebek 8, kambing 6, sapi 4.",
    { level: "Sangat menantang", scene: scatter([["ayam", 11], ["bebek", 8], ["kambing", 6], ["sapi", 4]]) }),
  q(1, "Mira ingin setiap jenis kaleng ada 7. Kaleng mana yang harus ditambah paling banyak?",
    [{ kind: "choice", label: "Paling banyak ditambah", options: kalengOpts, answer: "A. Kaleng cokelat", things: kalengThings }],
    "Hitung setiap warna: cokelat 2, hijau 6, merah muda 5, biru 4. Kaleng cokelat paling sedikit, jadi perlu ditambah 5 kaleng, paling banyak.",
    { level: "Sangat menantang", scene: kaleng(2, 6, 5, 4) }),
  q(0, "Perhatikan diagram turus bunga dalam satu rangkaian. Lengkapi kalimatnya.",
    [{ kind: "pick", label: "Bunga ___ lebih banyak dari bunga tulip.", options: names(bunga3), answer: "Mawar" }, { kind: "number", label: "Banyak bunga aster … kurangnya dari banyak bunga mawar:", answer: 4 }],
    "Mawar 13 (dua kelompok lima dan III), tulip 10, aster 9, lili 8. Hanya mawar yang lebih dari tulip. 9 adalah 4 kurangnya dari 13.",
    { level: "Sangat menantang", scene: { type: "tally", title: "Diagram Turus Banyak Bunga dalam Satu Rangkaian", head: ["Bunga", "Banyak Bunga"], rows: bunga3, showCount: false } }),
  q(1, "Perhatikan diagram gambar warna kesukaan siswa kelas II.",
    [{ kind: "number", label: "Penyuka warna biru … lebihnya dari penyuka warna hitam:", answer: 5 }, { kind: "pick", label: "Jika 3 anak lagi menyukai warna kuning, penyuka kuning menjadi sama banyak dengan penyuka warna ___.", options: names(warna3), answer: "Biru" }],
    "Biru 7, hitam 2: 7 adalah 5 lebihnya dari 2. Kuning 4 + 3 = 7, sama dengan biru.",
    { level: "Sangat menantang", scene: { type: "picto", title: "Diagram Gambar Warna Kesukaan Siswa Kelas II", head: ["Warna", "Banyak Siswa"], rows: warna3, symbol: "bintang", unit: "siswa" } }),
  q(0, "Perhatikan diagram turus hewan ternak berikut. Lengkapi kalimatnya.",
    [{ kind: "number", label: "Jumlah semua hewan di peternakan adalah", answer: 35 }, { kind: "number", label: "Jika 3 ayam dijual, banyak ayam … lebihnya dari banyak bebek:", answer: 2 }],
    "Ayam 14, bebek 9, kambing 7, sapi 5. 14 + 9 + 7 + 5 = 35. Ayam tinggal 14 - 3 = 11, dan 11 adalah 2 lebihnya dari 9.",
    { level: "Sangat menantang", scene: { type: "tally", title: "Diagram Turus Hewan Ternak", head: ["Nama Hewan", "Banyak Hewan"], rows: ternak3, showCount: false } }),
  q(1, "Diagram berikut menunjukkan siswa kelas II yang berlari mengelilingi lapangan.",
    [{ kind: "number", label: "Siswa yang berlari kurang dari tiga putaran ada", answer: 9 }, { kind: "number", label: "Banyak siswa yang berlari semuanya ada", answer: 18 }],
    "Kurang dari tiga putaran berarti 1 dan 2 putaran: 3 + 6 = 9. Semua siswa: 3 + 6 + 5 + 4 = 18.",
    { level: "Sangat menantang", scene: { type: "picto", title: "Diagram Gambar Siswa yang Berlari", head: ["Banyak Putaran", "Banyak Siswa"], rows: lari2, symbol: "pelari", color: "biru", unit: "siswa" } }),
];
export const sceneRows = (s: Scene | undefined): Row[] | undefined => (s && (s.type === "tally" || s.type === "picto") ? s.rows : undefined);
