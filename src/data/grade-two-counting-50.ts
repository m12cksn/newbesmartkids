import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 2 Bab 1 - Ayo Membilang sampai dengan 50 (Buku Matematika SD/MI Kelas II, hlm. 1-36).
 * Sumber: lampiran PDF pengguna (materi, Ayo Berlatih, Coba Pikirkan, dan Evaluasi dalam satu berkas).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 * Evaluasi 24 soal = soal bertipe Evaluasi buku (no. 1-7) + soal bertipe Ayo Berlatih/Coba Pikirkan.
 */

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Thing = "mango" | "mangosteen" | "strawberry" | "ladybug" | "butterfly" | "star" | "candy" | "bee" | "apple" | "marble";

export type Scene =
  | { type: "objects"; thing: Thing; n: number; layout: "rows" | "scatter" }
  | { type: "blocks"; tens: number; ones: number }
  | { type: "cards"; nums: number[] };

export type Part =
  | { kind: "number"; label: string; answer: number }
  | { kind: "count"; label: string; answer: number }
  | { kind: "words"; label: string; tiles: string[]; answer: string[] }
  | { kind: "bond"; tens: number | null; ones: number | null; total: number | null; answer: number[] }
  | { kind: "seq"; label: string; items: (number | null)[]; style: "train" | "flags"; answer: number[] }
  | { kind: "place"; tens: number | null; ones: number | null; total: number | null; answer: number[] }
  | { kind: "split"; total: number; answer: [number, number] }
  | { kind: "choice"; label: string; options: string[]; answer: string; tables?: boolean }
  | { kind: "check"; label: string; options: string[]; answer: number[] }
  | { kind: "order"; label: string; options: string[]; answer: string[] }
  | { kind: "guess"; label: string; answer: number }
  | { kind: "dots"; label: string; from: number; to: number; pts: [number, number][] };

export type CQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Kata bilangan ---------- */
const units = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
export function numberWords(n: number): string[] {
  if (n < 10) return [units[n]];
  if (n === 10) return ["sepuluh"];
  if (n === 11) return ["sebelas"];
  if (n < 20) return [units[n - 10], "belas"];
  const t = Math.floor(n / 10), o = n % 10;
  return [units[t], "puluh", ...(o ? [units[o]] : [])];
}
export const wordTiles = ["dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "satu", "puluh", "belas"];

/* ---------- Pemeriksaan jawaban (bagian dipisah "‖", nilai dalam bagian dipisah "|") ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);

function partAnswer(p: Part): string {
  switch (p.kind) {
    case "number": case "count": return String(p.answer);
    case "words": return p.answer.join(" ");
    case "bond": case "seq": case "place": return p.answer.join("|");
    case "split": return p.answer.join("|");
    case "choice": return p.answer;
    case "check": return [...p.answer].sort((a, b) => a - b).join(",");
    case "order": return p.answer.join("|");
    case "guess": return `${p.answer}|${p.answer}`;
    case "dots": return Array.from({ length: p.to - p.from + 1 }, (_, i) => p.from + i).join("|");
  }
}
function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": case "count": return int(v) === p.answer;
    case "words": return v.trim().replace(/\s+/g, " ") === p.answer.join(" ");
    case "bond": case "seq": case "place": case "split": { const x = v.split("|"); return p.answer.every((a, i) => int(x[i]) === a) && x.length === p.answer.length; }
    case "choice": return v === p.answer;
    case "check": return v.split(",").filter(Boolean).map(Number).sort((a, b) => a - b).join(",") === partAnswer(p);
    case "order": return v === partAnswer(p);
    case "guess": { const [g, c] = v.split("|"); return !Number.isNaN(int(g)) && int(c) === p.answer; }
    case "dots": return v === partAnswer(p);
  }
}
function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": case "count": return !Number.isNaN(int(v));
    case "words": return v.trim().length > 0;
    case "bond": case "seq": case "place": case "split": { const x = v.split("|"); return x.length === p.answer.length && x.every(y => !Number.isNaN(int(y))); }
    case "choice": return Boolean(v);
    case "check": return v.split(",").filter(Boolean).length > 0;
    case "order": return v.split("|").filter(Boolean).length === p.options.length;
    case "guess": { const [g, c] = v.split("|"); return !Number.isNaN(int(g)) && !Number.isNaN(int(c)); }
    case "dots": return v.split("|").filter(Boolean).length === p.to - p.from + 1;
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
      case "bond": return `${p.tens ?? "…"} + ${p.ones ?? "…"} = ${p.total ?? "…"}; isian: ${x.split("|").join(", ") || "…"}`;
      case "place": return `puluhan, satuan${p.total === null ? ", bilangan" : ""}: ${x.split("|").join(", ") || "…"}`;
      case "split": { const [a, b] = x.split("|"); return `${p.total} = ${a || "…"} puluhan + ${b || "…"} satuan`; }
      case "seq": return x.split("|").join(", ") || "…";
      case "check": return x ? x.split(",").filter(Boolean).map(n => p.options[Number(n)]).join("; ") : "tidak ada";
      case "order": return x.split("|").filter(Boolean).join(", ") || "…";
      case "guess": { const [g, c] = x.split("|"); return `tebakan ${g || "…"}, hitungan ${c || "…"}`; }
      case "dots": return x.split("|").filter(Boolean).join(" → ") || "…";
      default: return x || "…";
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: CQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): CQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(partAnswer).join(SEP), ...extra });
const count = (n: number): Part => ({ kind: "count", label: "Banyaknya", answer: n });
const words = (n: number): Part => ({ kind: "words", label: `${n} dibaca`, tiles: wordTiles, answer: numberWords(n) });
const bond = (tens: number, ones: number, hide: "tens" | "ones" | "total"): Part => {
  const total = tens + ones;
  return { kind: "bond", tens: hide === "tens" ? null : tens, ones: hide === "ones" ? null : ones, total: hide === "total" ? null : total, answer: [hide === "tens" ? tens : hide === "ones" ? ones : total] };
};
const seq = (label: string, items: (number | null)[], full: number[], style: "train" | "flags"): Part =>
  ({ kind: "seq", label, items, style, answer: full.filter((_, i) => items[i] === null) });
/** Titik-titik untuk "tarik garis secara berurutan", tersusun melingkar dan diacak urutan tampilnya. */
const ring = (n: number): [number, number][] => Array.from({ length: n }, (_, i) => { const a = (2 * Math.PI * i) / n - Math.PI / 2; return [50 + 40 * Math.cos(a), 52 + 40 * Math.sin(a)]; });

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Menghitung, Membaca, dan Menulis Bilangan sampai 50", short: "Membilang",
    steps: [
      "Hitung benda satu per satu, atau kelompokkan setiap 10 benda agar lebih mudah: 10, 20, 30, 40, 50.",
      "Bilangan 26 adalah 20 dan 6. Ditulis 20 + 6 = 26 dan dibaca dua puluh enam.",
      "Bilangan 11 dibaca sebelas, 12 sampai 19 dibaca …belas, dan 21 sampai 49 dibaca … puluh ….",
      "Menghitung maju: 20, 21, 22, … 30. Menghitung mundur: 30, 29, 28, … 20.",
    ],
    demo: "Tambah atau kurangi benda. Setiap 10 benda otomatis menjadi satu ikat. Lihat lambang bilangan dan cara membacanya berubah.",
  },
  {
    code: "B", title: "Nilai Tempat", short: "Nilai tempat",
    steps: [
      "Tabel nilai tempat punya kolom puluhan dan satuan. 10 satuan sama dengan 1 puluhan.",
      "28 = 2 puluhan dan 8 satuan, ditulis 28 = 2 puluhan + 8 satuan.",
      "Bilangan yang sama dapat ditulis dengan cara berbeda: 26 = 2 puluhan 6 satuan = 1 puluhan 16 satuan = 26 satuan.",
      "Jika satuannya 10 atau lebih, tukar 10 satuan menjadi 1 puluhan: 2 puluhan dan 15 satuan = 3 puluhan dan 5 satuan = 35.",
    ],
    demo: "Tambah balok puluhan atau satuan. Tekan Tukar untuk mengubah 10 satuan menjadi 1 puluhan, atau Pecah untuk sebaliknya. Bilangannya tetap sama!",
  },
  {
    code: "C", title: "Membandingkan Dua Bilangan atau Lebih", short: "Membandingkan",
    steps: [
      "Bandingkan dulu puluhannya. Bilangan dengan puluhan lebih banyak adalah bilangan yang lebih besar: 32 lebih besar dari 26.",
      "Jika puluhannya sama, bandingkan satuannya: 45 lebih kecil dari 47.",
      "Untuk mengurutkan, cari bilangan paling kecil (atau paling besar) satu per satu.",
      "Kita bisa menebak banyak benda lalu membuktikannya dengan menghitung.",
    ],
    demo: "Ubah dua bilangan. Lihat tabel nilai tempat dan garis bilangan menunjukkan mana yang lebih besar.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: CQuestion[][] = [
  [
    q(0, "Hitunglah banyak bintang berikut. Tulis hasilnya pada kotak.", [count(23)], "Ada 2 baris berisi 10 bintang dan 3 bintang lagi: 10 + 10 + 3 = 23.", { scene: { type: "objects", thing: "star", n: 23, layout: "rows" } }),
    q(0, "Lengkapi titik-titik berikut dengan bilangan yang tepat.", [bond(20, 6, "total"), words(26)], "20 + 6 = 26, dibaca dua puluh enam."),
    q(0, "Lengkapilah urutan bilangan berikut.", [seq("Urutan", [35, null, 37, 38, null, null], [35, 36, 37, 38, 39, 40], "flags")], "Menghitung maju satu-satu: 35, 36, 37, 38, 39, 40."),
    q(0, "Tarik garis dari bilangan 20 sampai 30 secara berurutan. Ketuk titiknya satu per satu.", [{ kind: "dots", label: "Titik", from: 20, to: 30, pts: ring(11) }], "Mulai dari 20, lalu 21, 22, … sampai 30."),
  ],
  [
    q(1, "Lengkapi tabel nilai tempat berikut.", [{ kind: "place", tens: null, ones: null, total: null, answer: [2, 4, 24] }], "Ada 2 batang puluhan dan 4 balok satuan: 2 puluhan dan 4 satuan = 24.", { scene: { type: "blocks", tens: 2, ones: 4 } }),
    q(1, "Isilah titik-titik berikut dengan bilangan yang tepat.", [{ kind: "split", total: 32, answer: [3, 2] }], "32 = 3 puluhan + 2 satuan."),
    q(1, "Tika memikirkan sebuah bilangan: 2 puluhan dan 15 satuan. Bilangannya adalah …", [{ kind: "number", label: "Bilangannya", answer: 35 }], "15 satuan = 1 puluhan dan 5 satuan. Jadi 2 puluhan + 1 puluhan + 5 satuan = 3 puluhan 5 satuan = 35."),
    q(1, "Lili ingin menuliskan bilangan 46 ke dalam nilai tempat. Kemungkinan mana saja yang benar?", [{ kind: "check", label: "Kemungkinan", options: ["4 puluhan dan 6 satuan", "3 puluhan dan 16 satuan", "2 puluhan dan 16 satuan"], answer: [0, 1] }],
      "40 + 6 = 46 dan 30 + 16 = 46 benar. 20 + 16 = 36, bukan 46."),
  ],
  [
    q(2, "Lingkari bilangan yang lebih besar.", [{ kind: "choice", label: "Bilangan yang lebih besar", options: ["44", "34"], answer: "44", tables: true }], "44 punya 4 puluhan, 34 punya 3 puluhan. Jadi 44 lebih besar."),
    q(2, "Lingkari bilangan yang lebih kecil.", [{ kind: "choice", label: "Bilangan yang lebih kecil", options: ["45", "47"], answer: "45" }], "Puluhannya sama (4). Satuan 5 lebih kecil dari 7, jadi 45 lebih kecil."),
    q(2, "Urutkan bilangan dari yang paling kecil: 24, 45, 44, 32.", [{ kind: "order", label: "Urutan", options: ["24", "45", "44", "32"], answer: ["24", "32", "44", "45"] }], "Bandingkan puluhan: 2 < 3 < 4. Untuk 44 dan 45 bandingkan satuan. Urutannya 24, 32, 44, 45."),
    q(2, "Tebaklah banyak kupu-kupu berikut. Buktikan dengan cara menghitungnya.", [{ kind: "guess", label: "Kupu-kupu", answer: 21 }], "Kelompokkan sepuluh-sepuluh: 10, 20, lalu 1 lagi. Ada 21 kupu-kupu.", { scene: { type: "objects", thing: "butterfly", n: 21, layout: "scatter" } }),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
export const assessment: CQuestion[] = [
  q(0, "Hitunglah banyak kumpulan buah mangga di bawah ini.", [count(27)], "Ada 2 baris berisi 10 mangga dan 7 mangga: 10 + 10 + 7 = 27.", { level: "Sedang", scene: { type: "objects", thing: "mango", n: 27, layout: "rows" } }),
  q(1, "Lengkapi tabel nilai tempat di bawah ini.", [{ kind: "place", tens: null, ones: null, total: null, answer: [3, 5, 35] }], "3 batang puluhan dan 5 balok satuan: 3 puluhan dan 5 satuan = 35.", { level: "Sedang", scene: { type: "blocks", tens: 3, ones: 5 } }),
  q(2, "Lingkari bilangan yang lebih besar.", [{ kind: "choice", label: "Bilangan yang lebih besar", options: ["29", "26"], answer: "29", tables: true }], "Puluhannya sama (2). Satuan 9 lebih besar dari 6, jadi 29 lebih besar.", { level: "Sedang" }),
  q(0, "Lengkapi titik-titik berikut.", [bond(20, 9, "total"), words(29)], "20 + 9 = 29, dibaca dua puluh sembilan.", { level: "Sedang" }),
  q(1, "Isilah dengan bilangan yang tepat.", [{ kind: "split", total: 26, answer: [2, 6] }], "26 = 2 puluhan + 6 satuan.", { level: "Sedang" }),
  q(0, "Lengkapi urutan bilangan di bawah ini.", [seq("Gerbong", [31, null, 33, null, null], [31, 32, 33, 34, 35], "train")], "Menghitung maju: 31, 32, 33, 34, 35.", { level: "Sedang" }),
  q(2, "Lingkari bilangan yang lebih kecil.", [{ kind: "choice", label: "Bilangan yang lebih kecil", options: ["38", "35"], answer: "35" }], "Puluhannya sama (3). Satuan 5 lebih kecil dari 8, jadi 35 lebih kecil.", { level: "Sedang" }),
  q(1, "Lengkapi tabel nilai tempat. Bilangannya sudah diketahui.", [{ kind: "place", tens: null, ones: null, total: 47, answer: [4, 7] }], "47 terdiri atas 4 batang puluhan dan 7 balok satuan.", { level: "Menantang", scene: { type: "blocks", tens: 4, ones: 7 } }),
  q(0, "Lengkapi titik-titik berikut.", [bond(40, 7, "tens"), words(47)], "… + 7 = 47, maka bilangan yang hilang 40. 47 dibaca empat puluh tujuh.", { level: "Menantang" }),
  q(2, "Urutkan bilangan dari yang paling kecil: 41, 24, 32, 29.", [{ kind: "order", label: "Urutan", options: ["41", "24", "32", "29"], answer: ["24", "29", "32", "41"] }], "Puluhan 2 paling kecil: 24 dan 29 (bandingkan satuan, 4 < 9). Lalu 32, lalu 41.", { level: "Menantang" }),
  q(1, "Tika memikirkan sebuah bilangan: 3 puluhan dan 12 satuan. Bilangannya adalah …", [{ kind: "number", label: "Bilangannya", answer: 42 }], "12 satuan = 1 puluhan 2 satuan. 3 + 1 = 4 puluhan, jadi bilangannya 42.", { level: "Menantang" }),
  q(0, "Hitunglah banyak kepik berikut. Kalian dapat mengelompokkan sepuluh-sepuluh.", [count(34)], "Kepik tersebar acak. Tandai sambil menghitung dan kelompokkan per 10: 10, 20, 30, lalu 4 lagi = 34.", { level: "Sangat menantang", scene: { type: "objects", thing: "ladybug", n: 34, layout: "scatter" } }),
  q(1, "Balok berikut terdiri atas 1 batang puluhan dan 16 balok satuan. Berapa bilangannya?", [{ kind: "number", label: "Bilangannya", answer: 26 }], "1 puluhan = 10. 10 + 16 = 26. Ini cara lain menulis 26 (2 puluhan 6 satuan).", { level: "Menantang", scene: { type: "blocks", tens: 1, ones: 16 } }),
  q(2, "Tebak banyak permen berikut, lalu buktikan dengan menghitungnya.", [{ kind: "guess", label: "Permen", answer: 28 }], "Kelompokkan per 10: 10, 20, lalu 8 lagi. Ada 28 permen.", { level: "Menantang", scene: { type: "objects", thing: "candy", n: 28, layout: "scatter" } }),
  q(0, "Tarik garis dari bilangan 25 sampai 40 secara berurutan. Ketuk titiknya satu per satu.", [{ kind: "dots", label: "Titik", from: 25, to: 40, pts: ring(16) }], "Mulai dari 25, 26, 27, … sampai 40. Perhatikan setelah 29 adalah 30.", { level: "Sedang" }),
  q(1, "Tulis 31 dengan cara lain: … puluhan dan 11 satuan.", [{ kind: "number", label: "Banyak puluhan", answer: 2 }], "11 satuan = 1 puluhan 1 satuan. 31 = 3 puluhan 1 satuan = 2 puluhan 11 satuan, karena 20 + 11 = 31.", { level: "Menantang" }),
  q(2, "Kartu bilangan Kira adalah 34. Bilangan Lili 2 kurangnya dari bilangan Kira. Bilangan Malosi 3 lebihnya dari bilangan Lili. Urutkan nama mereka dari bilangan terkecil.", [{ kind: "order", label: "Urutan nama", options: ["Malosi", "Kira", "Lili"], answer: ["Lili", "Kira", "Malosi"] }],
    "Kira 34. Lili 34 − 2 = 32. Malosi 32 + 3 = 35. Dari terkecil: Lili (32), Kira (34), Malosi (35).", { level: "Sangat menantang" }),
  q(0, "Lengkapilah urutan bilangan berikut (menghitung mundur).", [seq("Urutan", [42, 41, null, null, 38, null], [42, 41, 40, 39, 38, 37], "flags")], "Mundur satu-satu: 42, 41, 40, 39, 38, 37. Setelah 40 adalah 39, puluhannya berubah.", { level: "Menantang" }),
  q(1, "Tika memikirkan sebuah bilangan: 2 puluhan dan 23 satuan. Bilangannya adalah …", [{ kind: "number", label: "Bilangannya", answer: 43 }], "23 satuan = 2 puluhan 3 satuan. 2 + 2 = 4 puluhan, jadi 4 puluhan 3 satuan = 43.", { level: "Sangat menantang" }),
  q(2, "Perhatikan kelima bilangan berikut: 36, 29, 33, 40, 26.", [{ kind: "order", label: "Dari yang paling kecil", options: ["36", "29", "33", "40", "26"], answer: ["26", "29", "33", "36", "40"] }, { kind: "order", label: "Dari yang paling besar", options: ["36", "29", "33", "40", "26"], answer: ["40", "36", "33", "29", "26"] }],
    "Puluhan 2: 26, 29. Puluhan 3: 33, 36. Puluhan 4: 40. Dari terkecil 26, 29, 33, 36, 40; dari terbesar kebalikannya.", { level: "Sangat menantang" }),
  q(1, "Ali ingin menuliskan bilangan 38 ke dalam nilai tempat. Kemungkinan mana saja yang benar?", [{ kind: "check", label: "Kemungkinan", options: ["3 puluhan dan 8 satuan", "2 puluhan dan 18 satuan", "1 puluhan dan 18 satuan", "2 puluhan dan 8 satuan"], answer: [0, 1] }],
    "30 + 8 = 38 dan 20 + 18 = 38 benar. 10 + 18 = 28 dan 20 + 8 = 28 salah.", { level: "Sangat menantang" }),
  q(2, "Bilangan mana yang lebih besar?", [{ kind: "choice", label: "Pilih", options: ["2 puluhan dan 3 satuan", "1 puluhan dan 14 satuan"], answer: "1 puluhan dan 14 satuan" }],
    "2 puluhan dan 3 satuan = 23. 1 puluhan dan 14 satuan = 10 + 14 = 24. Jadi 24 lebih besar walaupun puluhannya hanya 1.", { level: "Sangat menantang" }),
  q(0, "Tulislah lambang bilangan dan cara membacanya.", [{ kind: "number", label: "Lambang bilangan", answer: 43 }, words(43)], "4 baris berisi 10 kelereng dan 3 kelereng: 40 + 3 = 43, dibaca empat puluh tiga.", { level: "Menantang", scene: { type: "objects", thing: "marble", n: 43, layout: "rows" } }),
  q(2, "Tika mempunyai kartu 1, 2, 3, dan 4. Ia mengambil dua kartu untuk membuat bilangan.", [{ kind: "number", label: "Bilangan paling besar", answer: 43 }, { kind: "number", label: "Bilangan paling kecil", answer: 12 }],
    "Paling besar: ambil 4 dan 3, letakkan 4 di puluhan → 43. Paling kecil: ambil 1 dan 2, letakkan 1 di puluhan → 12.", { level: "Sangat menantang", scene: { type: "cards", nums: [1, 2, 3, 4] } }),
];
