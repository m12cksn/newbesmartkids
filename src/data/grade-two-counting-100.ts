import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 2 Bab 7 - Ayo Membilang sampai dengan 100 (Buku Matematika SD/MI Kelas II, hlm. 191-224).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Thing = "jeruk" | "rambutan" | "kelereng" | "pensil" | "kue" | "ikan" | "bintang" | "apel" | "anggur";
export type Holder = "keranjang" | "kantong" | "kotak" | "gelas";
export const thingName: Record<Thing, string> = { jeruk: "buah jeruk", rambutan: "buah rambutan", kelereng: "kelereng", pensil: "pensil warna", kue: "kue cubit", ikan: "ikan hias", bintang: "bintang", apel: "buah apel", anggur: "buah anggur" };
export const holderName: Record<Holder, string> = { keranjang: "keranjang", kantong: "kantong", kotak: "kotak", gelas: "gelas" };

export type Scene =
  /** packs kelompok berisi 10 dalam wadah, ditambah loose benda lepas. */
  | { type: "packs"; thing: Thing; holder: Holder; packs: number; loose: number }
  | { type: "scatter"; thing: Thing; n: number }
  /** Garis bilangan dengan hewan pada posisi tertentu (bilangan di posisi hewan tidak ditulis). */
  | { type: "strip"; from: number; to: number; animal: "kupu" | "capung"; at: number }
  | { type: "cards"; nums: number[]; letters?: boolean };

export type Part =
  | { kind: "number"; label: string; answer: number }
  | { kind: "words"; label: string; tiles: string[]; answer: string[] }
  /** Tabel nilai tempat, pasangan bilangan, dan kalimat: puluhan|satuan|nilai puluhan|nilai satuan|jumlah. */
  | { kind: "pv"; answer: [number, number, number, number, number] }
  | { kind: "match"; left: string[]; right: string[]; answer: number[] }
  | { kind: "guess"; answer: number }
  | { kind: "choice"; label: string; options: string[]; answer: string; tables?: boolean }
  | { kind: "order"; label: string; options: string[]; answer: string[] };

export type CQuestion = Question & { topic: 0 | 1; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Kata bilangan sampai 100 ---------- */
const units = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
export function numberWords(n: number): string[] {
  if (n === 100) return ["seratus"];
  if (n < 10) return [units[n]];
  if (n === 10) return ["sepuluh"];
  if (n === 11) return ["sebelas"];
  if (n < 20) return [units[n - 10], "belas"];
  const t = Math.floor(n / 10), o = n % 10;
  return [units[t], "puluh", ...(o ? [units[o]] : [])];
}
export const wordTiles = ["satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "puluh", "seratus"];
export const nameOf = (n: number) => { const w = numberWords(n).join(" "); return w[0].toUpperCase() + w.slice(1); };

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);

function partAnswer(p: Part): string {
  switch (p.kind) {
    case "number": return String(p.answer);
    case "words": return p.answer.join(" ");
    case "pv": return p.answer.join("|");
    case "match": return p.answer.join(",");
    case "guess": return `${p.answer}|${p.answer}`;
    case "choice": return p.answer;
    case "order": return p.answer.join("|");
  }
}
function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": return int(v) === p.answer;
    case "words": return v.trim().replace(/\s+/g, " ") === p.answer.join(" ");
    case "pv": { const x = v.split("|"); return x.length === 5 && p.answer.every((a, i) => int(x[i]) === a); }
    case "guess": { const [g, c] = v.split("|"); return !Number.isNaN(int(g)) && int(c) === p.answer; }
    default: return v === partAnswer(p);
  }
}
function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": return !Number.isNaN(int(v));
    case "words": return v.trim().length > 0;
    case "pv": { const x = v.split("|"); return x.length === 5 && x.every(y => !Number.isNaN(int(y))); }
    case "match": { const x = v.split(","); return x.length === p.left.length && x.every(y => y !== ""); }
    case "guess": { const [g, c] = v.split("|"); return !Number.isNaN(int(g)) && !Number.isNaN(int(c)); }
    case "choice": return Boolean(v);
    case "order": return v.split("|").filter(Boolean).length === p.options.length;
  }
}
export const correct = (q: CQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: CQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: CQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = v[i];
    switch (p.kind) {
      case "pv": { const [t, o, tv, ov, s] = x.split("|"); return `${t || "…"} puluhan dan ${o || "…"} satuan = ${tv || "…"} + ${ov || "…"} = ${s || "…"}`; }
      case "match": return x.split(",").map((r, k) => `${p.left[k]} dengan ${r === "" ? "…" : p.right[Number(r)]}`).join("; ");
      case "guess": { const [g, c] = x.split("|"); return `tebakan ${g || "…"}, hitungan ${c || "…"}`; }
      case "order": return x.split("|").filter(Boolean).join(", ") || "…";
      case "number": return `${p.label} ${x || "…"}`;
      default: return x || "…";
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: CQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): CQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(partAnswer).join(SEP), ...extra });
const pv = (n: number): Part => { const t = Math.floor(n / 10), o = n % 10; return { kind: "pv", answer: [t, o, t * 10, o, n] }; };
const words = (n: number): Part => ({ kind: "words", label: `${n} dibaca`, tiles: wordTiles, answer: numberWords(n) });
const sortAsc = (xs: number[]) => [...xs].sort((a, b) => a - b).map(String);

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Menghitung, Membaca, dan Menulis Bilangan sampai dengan 100", short: "Membilang sampai 100",
    steps: [
      "Kelompokkan benda setiap 10. Satu kelompok berisi 10 benda disebut 1 puluhan.",
      "Hitung kelompoknya: 10, 20, 30, sampai 100. Sepuluh puluhan adalah 100, dibaca seratus.",
      "Tulis puluhan dan satuan pada tabel nilai tempat. 5 puluhan dan 3 satuan = 50 + 3 = 53, dibaca lima puluh tiga.",
      "Untuk menebak banyak benda, perkirakan dulu, lalu buktikan dengan menghitung kelompok sepuluh.",
    ],
    demo: "Tambah atau kurangi kue satu-satu dan sepuluh-sepuluh. Setiap 10 kue masuk ke satu kotak. Baca bilangannya dan perhatikan tabel nilai tempatnya.",
  },
  {
    code: "B", title: "Membandingkan Bilangan", short: "Membandingkan",
    steps: [
      "Maju satu langkah berarti 1 lebihnya. Mundur satu langkah berarti 1 kurangnya.",
      "2 lebihnya dari 58 adalah 60. 3 kurangnya dari 75 adalah 72.",
      "Untuk membandingkan dua bilangan, lihat puluhan dulu. Puluhan lebih banyak berarti bilangan lebih besar.",
      "Jika puluhannya sama, bandingkan satuannya. 58 lebih besar dari 54.",
    ],
    demo: "Gerakkan kupu-kupu maju atau mundur pada garis bilangan. Lalu bandingkan dua bilangan dengan tabel nilai tempat.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: CQuestion[][] = [
  [
    q(0, "Hitunglah banyak pensil warna berikut. Setiap gelas berisi 10 pensil.", [{ kind: "number", label: "Banyak puluhan", answer: 8 }, { kind: "number", label: "Jadi, banyak pensil warna", answer: 80 }],
      "Ada 8 gelas, setiap gelas berisi 10 pensil. 8 puluhan = 80.", { scene: { type: "packs", thing: "pensil", holder: "gelas", packs: 8, loose: 0 } }),
    q(0, "Hitung banyak kelereng berikut dan isi titik-titiknya.", [pv(56)],
      "Ada 5 kantong berisi 10 dan 6 kelereng lepas. 5 puluhan dan 6 satuan = 50 + 6 = 56.", { scene: { type: "packs", thing: "kelereng", holder: "kantong", packs: 5, loose: 6 } }),
    q(0, "Hubungkan dengan bilangan yang tepat.", [{ kind: "match", left: ["8 puluhan dan 1 satuan", "1 puluhan dan 8 satuan", "6 puluhan dan 5 satuan"], right: ["65", "81", "18"], answer: [1, 2, 0] }],
      "8 puluhan dan 1 satuan = 81. 1 puluhan dan 8 satuan = 18. 6 puluhan dan 5 satuan = 65."),
    q(0, "Tulislah lambang bilangan sesuai dengan nama bilangannya: Enam puluh tiga.", [{ kind: "number", label: "Lambang bilangan", answer: 63 }],
      "Enam puluh tiga = 6 puluhan dan 3 satuan = 63."),
  ],
  [
    q(1, "Lingkarilah bilangan yang lebih besar.", [{ kind: "choice", label: "Bilangan yang lebih besar", options: ["67", "76"], answer: "76", tables: true }],
      "76 punya 7 puluhan, 67 punya 6 puluhan. Jadi 76 lebih besar."),
    q(1, "Kupu-kupu berada di antara 51 dan 53. Lalu kupu-kupu maju dua langkah.", [{ kind: "number", label: "Kupu-kupu berada di bilangan", answer: 52 }, { kind: "number", label: "Setelah maju dua langkah, kupu-kupu di bilangan", answer: 54 }],
      "Di antara 51 dan 53 adalah 52. Maju dua langkah: 53, 54. Jadi 2 lebihnya dari 52 adalah 54.", { scene: { type: "strip", from: 50, to: 60, animal: "kupu", at: 52 } }),
    q(1, "Urutkan bilangan dari yang paling kecil: 85, 58, 69.", [{ kind: "order", label: "Urutan", options: ["85", "58", "69"], answer: sortAsc([85, 58, 69]) }],
      "Bandingkan puluhan: 5 < 6 < 8. Urutannya 58, 69, 85."),
    q(1, "Aku adalah bilangan. Aku 3 lebihnya dari bilangan 67. Bilangan berapakah aku?", [{ kind: "number", label: "Aku adalah bilangan", answer: 70 }],
      "Hitung maju 3 langkah dari 67: 68, 69, 70."),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
export const assessment: CQuestion[] = [
  q(0, "Hitunglah banyak jeruk berikut. Setiap keranjang berisi 10 jeruk.", [{ kind: "number", label: "Banyak puluhan", answer: 6 }, { kind: "number", label: "Jadi, banyak buah jeruk", answer: 60 }],
    "Ada 6 keranjang berisi 10 jeruk. 6 puluhan = 60.", { level: "Sedang", scene: { type: "packs", thing: "jeruk", holder: "keranjang", packs: 6, loose: 0 } }),
  q(1, "Lingkarilah bilangan yang lebih besar.", [{ kind: "choice", label: "Bilangan yang lebih besar", options: ["85", "58"], answer: "85", tables: true }],
    "85 punya 8 puluhan, 58 punya 5 puluhan. Jadi 85 lebih besar.", { level: "Sedang" }),
  q(0, "Tulislah lambang bilangan sesuai dengan nama bilangannya: Delapan puluh enam.", [{ kind: "number", label: "Lambang bilangan", answer: 86 }],
    "Delapan puluh enam = 8 puluhan dan 6 satuan = 86.", { level: "Sedang" }),
  q(1, "Amati posisi kupu-kupu pada garis bilangan. Kupu-kupu berada di bilangan berapa?", [{ kind: "number", label: "Kupu-kupu berada di bilangan", answer: 64 }],
    "Kupu-kupu berada di antara 63 dan 65. Jadi kupu-kupu di bilangan 64.", { level: "Sedang", scene: { type: "strip", from: 60, to: 70, animal: "kupu", at: 64 } }),
  q(0, "Hubungkan nama bilangan dengan lambang bilangan yang tepat.", [{ kind: "match", left: ["Tujuh puluh empat", "Empat puluh tujuh", "Seratus", "Sembilan puluh", "Enam puluh delapan"], right: ["90", "47", "68", "100", "74"], answer: [4, 1, 3, 0, 2] }],
    "Tujuh puluh empat = 74, empat puluh tujuh = 47 (angkanya tertukar), seratus = 100, sembilan puluh = 90, enam puluh delapan = 68.", { level: "Sedang" }),
  q(1, "Urutkan bilangan dari yang paling kecil: 74, 47, 66.", [{ kind: "order", label: "Urutan", options: ["74", "47", "66"], answer: sortAsc([74, 47, 66]) }],
    "Puluhan 4 paling sedikit, lalu 6, lalu 7. Urutannya 47, 66, 74.", { level: "Sedang" }),
  q(0, "Hitung banyak rambutan berikut dan isi titik-titiknya.", [pv(74)],
    "Ada 7 keranjang berisi 10 rambutan dan 4 rambutan lepas. 7 puluhan dan 4 satuan = 70 + 4 = 74.", { level: "Sedang", scene: { type: "packs", thing: "rambutan", holder: "keranjang", packs: 7, loose: 4 } }),
  q(1, "Aku adalah bilangan. Aku 2 lebihnya dari bilangan 78. Bilangan berapakah aku?", [{ kind: "number", label: "Aku adalah bilangan", answer: 80 }],
    "Hitung maju 2 langkah dari 78: 79, 80.", { level: "Sedang" }),
  q(0, "Pak Ahmad mempunyai 10 kotak kue cubit. Setiap kotak berisi 10 kue. Berapa banyak kue cubit dan bagaimana membacanya?", [{ kind: "number", label: "Banyak kue cubit", answer: 100 }, words(100)],
    "10 puluhan = 100, dibaca seratus.", { level: "Menantang", scene: { type: "packs", thing: "kue", holder: "kotak", packs: 10, loose: 0 } }),
  q(1, "Kupu-kupu berada di garis bilangan. Lalu kupu-kupu maju tiga langkah.", [{ kind: "number", label: "Kupu-kupu mula-mula di bilangan", answer: 87 }, { kind: "number", label: "Setelah maju tiga langkah", answer: 90 }],
    "Kupu-kupu di antara 86 dan 88, yaitu 87. Maju tiga langkah: 88, 89, 90.", { level: "Menantang", scene: { type: "strip", from: 80, to: 92, animal: "kupu", at: 87 } }),
  q(0, "Tebak dan hitunglah banyak ikan hias berikut.", [{ kind: "guess", answer: 68 }],
    "Kelompokkan setiap 10 ikan: ada 6 kelompok dan 8 ikan lagi. 60 + 8 = 68.", { level: "Menantang", scene: { type: "scatter", thing: "ikan", n: 68 } }),
  q(1, "Urutkan bilangan dari yang paling besar: 89, 98, 91.", [{ kind: "order", label: "Urutan", options: ["89", "98", "91"], answer: sortAsc([89, 98, 91]).reverse() }],
    "98 dan 91 punya 9 puluhan; satuan 8 lebih besar dari 1, jadi 98 paling besar. 89 punya 8 puluhan, paling kecil. Urutannya 98, 91, 89.", { level: "Menantang" }),
  q(0, "Hubungkan dengan bilangan yang tepat.", [{ kind: "match", left: ["9 puluhan dan 2 satuan", "10 puluhan dan 0 satuan", "2 puluhan dan 9 satuan", "7 puluhan dan 3 satuan", "3 puluhan dan 7 satuan"], right: ["37", "92", "29", "100", "73"], answer: [1, 3, 2, 4, 0] }],
    "9 puluhan 2 satuan = 92, 10 puluhan = 100, 2 puluhan 9 satuan = 29, 7 puluhan 3 satuan = 73, 3 puluhan 7 satuan = 37. Perhatikan pasangan yang angkanya tertukar.", { level: "Menantang" }),
  q(1, "Aku adalah bilangan. Aku 1 kurangnya dari bilangan 70. Bilangan berapakah aku?", [{ kind: "number", label: "Aku adalah bilangan", answer: 69 }],
    "Hitung mundur 1 langkah dari 70: 69. Puluhannya berubah dari 7 menjadi 6.", { level: "Menantang" }),
  q(0, "Hitung banyak kelereng berikut dan isi titik-titiknya.", [pv(89)],
    "Ada 8 kantong berisi 10 kelereng dan 9 kelereng lepas. 8 puluhan dan 9 satuan = 80 + 9 = 89.", { level: "Menantang", scene: { type: "packs", thing: "kelereng", holder: "kantong", packs: 8, loose: 9 } }),
  q(1, "Bilangan mana yang paling besar?", [{ kind: "choice", label: "Bilangan yang paling besar", options: ["93", "39", "90", "99"], answer: "99" }],
    "39 punya 3 puluhan. 93, 90, dan 99 punya 9 puluhan; bandingkan satuannya: 9 paling besar. Jadi 99 paling besar.", { level: "Menantang" }),
  q(0, "Tulislah cara membaca bilangan 71.", [words(71)],
    "71 = 7 puluhan dan 1 satuan, dibaca tujuh puluh satu.", { level: "Menantang" }),
  q(1, "Perhatikan kelima bilangan di bawah ini. Urutkan mulai dari yang paling kecil.", [{ kind: "order", label: "Urutan", options: ["68", "86", "61", "80", "59"], answer: sortAsc([68, 86, 61, 80, 59]) }],
    "Puluhan 5: 59. Puluhan 6: 61, 68. Puluhan 8: 80, 86. Urutannya 59, 61, 68, 80, 86.", { level: "Sangat menantang" }),
  q(0, "Ada 6 kotak berisi 10 kue cubit dan 13 kue cubit lepas. Isi titik-titiknya dengan cara yang benar.", [pv(73)],
    "13 kue lepas = 1 puluhan dan 3 satuan. Jadi 6 + 1 = 7 puluhan dan 3 satuan = 70 + 3 = 73.", { level: "Sangat menantang", scene: { type: "packs", thing: "kue", holder: "kotak", packs: 6, loose: 13 } }),
  q(1, "Capung berada di garis bilangan. Lalu capung mundur empat langkah.", [{ kind: "number", label: "Capung mula-mula di bilangan", answer: 72 }, { kind: "number", label: "Setelah mundur empat langkah", answer: 68 }],
    "Capung di antara 71 dan 73, yaitu 72. Mundur empat langkah: 71, 70, 69, 68. Jadi 4 kurangnya dari 72 adalah 68.", { level: "Sangat menantang", scene: { type: "strip", from: 64, to: 76, animal: "capung", at: 72 } }),
  q(0, "Tebak dan hitunglah banyak bintang berikut.", [{ kind: "guess", answer: 94 }],
    "Kelompokkan setiap 10 bintang: ada 9 kelompok dan 4 bintang lagi. 90 + 4 = 94.", { level: "Sangat menantang", scene: { type: "scatter", thing: "bintang", n: 94 } }),
  q(1, "Lili menulis satu bilangan. Lili berkata, \"Jika aku tambahkan 3 pada puluhan dan 5 pada satuan, hasilnya adalah 78.\" Berapa bilangan yang ditulis Lili?", [{ kind: "choice", label: "Bilangan Lili", options: ["A. 34", "B. 43", "C. 73", "D. 45"], answer: "B. 43" }],
    "78 punya 7 puluhan dan 8 satuan. Kurangi 3 puluhan: 4 puluhan. Kurangi 5 satuan: 3 satuan. Bilangan Lili 43.", { level: "Sangat menantang", scene: { type: "cards", nums: [34, 43, 73, 45], letters: true } }),
  q(0, "Bilangan itu mempunyai 8 puluhan dan 14 satuan. Berapakah bilangan itu?", [{ kind: "number", label: "Bilangan itu", answer: 94 }],
    "14 satuan = 1 puluhan dan 4 satuan. 8 + 1 = 9 puluhan dan 4 satuan = 94.", { level: "Sangat menantang" }),
  q(1, "Halim mempunyai 47 kelereng. Kelereng Malosi ada 4 kantong berisi 10 dan 9 kelereng lepas. Kelereng siapa yang lebih banyak?", [{ kind: "choice", label: "Lebih banyak", options: ["Halim", "Malosi", "Sama banyak"], answer: "Malosi" }],
    "Kelereng Malosi 4 puluhan dan 9 satuan = 49. Puluhan sama (4), satuan 9 lebih dari 7. Jadi kelereng Malosi lebih banyak.", { level: "Sangat menantang", scene: { type: "packs", thing: "kelereng", holder: "kantong", packs: 4, loose: 9 } }),
];
