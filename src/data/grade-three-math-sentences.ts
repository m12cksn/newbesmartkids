import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 3 Bab 2 - Kalimat Matematika (Buku Matematika SD/MI Kelas III).
 * Sumber lampiran pengguna: "Kalimat matematika berkaitan dengan penjumlahan bilangan cacah" (9 hlm.),
 * "Kalimat matematika berkaitan dengan pengurangan bilangan cacah" (9 hlm.), dan "Evaluasi kelas 3 bab 2"
 * (Asesmen, 10 soal). Jenis soal dan cara menjawab mengikuti buku: kalimat matematika "awan" dengan
 * titik-titik, soal cerita dengan kotak jawaban, dan tabel "buatlah lima kemungkinan". Angka, gambar,
 * dan tingkat kesulitan diganti. Jumlah soal evaluasi mengikuti aturan proyek (24).
 */

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Icon = "marble" | "candy" | "durian" | "book" | "patient" | "chicken" | "mangosteen" | "egg" | "paper" | "ticket" | "tv" | "bottle" | "orange";

/** Kalimat matematika dengan satu titik-titik. blank = posisi yang dikosongkan (0, 1, atau 2). */
export type Sentence = { a: number; op: "+" | "−"; b: number; c: number; blank: 0 | 1 | 2 };

/** Diagram batang seperti di buku: satu batang keseluruhan dan dua bagian. null = yang ditanyakan. */
export type Bar = { whole: number | null; parts: [number | null, number | null]; labels: { whole: string; parts: [string, string] } };

export type Possibilities = {
  op: "+" | "−";
  headers: [string, string, string];
  /** Kolom yang sudah ditentukan oleh soal (misalnya jumlah penonton 95). */
  fixed?: { col: 0 | 1 | 2; value: number };
  /** Batas tambahan untuk soal yang lebih menantang. */
  range?: { col: 0 | 1 | 2; min: number; max: number };
};

export type MSQuestion = Question & {
  topic: 0 | 1;
  level?: Level;
  kind: "sentence" | "story" | "possibilities";
  sentence?: Sentence;
  bar?: Bar;
  icon?: Icon;
  unit?: string;
  possibilities?: Possibilities;
};

const sentence = (topic: 0 | 1, s: Sentence, explanation: string, level?: Level): MSQuestion => {
  const values = [s.a, s.b, s.c];
  return { topic, kind: "sentence", sentence: s, level, prompt: "Isilah titik-titik pada kalimat matematika berikut.", answer: String(values[s.blank]), explanation };
};
const add = (a: number, b: number, blank: 0 | 1): Sentence => ({ a, op: "+", b, c: a + b, blank });
const sub = (a: number, b: number, blank: 0 | 1): Sentence => ({ a, op: "−", b, c: a - b, blank });

const story = (topic: 0 | 1, prompt: string, bar: Bar, icon: Icon, unit: string, explanation: string, level?: Level): MSQuestion => {
  const missing = bar.whole === null ? null : bar.parts[0] === null ? bar.whole - (bar.parts[1] ?? 0) : bar.whole - (bar.parts[0] ?? 0);
  const answer = bar.whole === null ? (bar.parts[0] ?? 0) + (bar.parts[1] ?? 0) : missing!;
  return { topic, kind: "story", prompt, bar, icon, unit, level, answer: String(answer), explanation };
};

const possibilities = (topic: 0 | 1, prompt: string, p: Possibilities, sample: number[][], explanation: string, level?: Level): MSQuestion =>
  ({ topic, kind: "possibilities", prompt, possibilities: p, level, answer: sample.map(r => r.join(",")).join(";"), explanation });

/* ---------- Pemeriksaan jawaban ---------- */
export const rows = (value: string) => value.split(";").map(r => r.split(",").map(x => x.trim()));

/** Setiap baris harus lengkap, benar secara hitungan, memenuhi syarat soal, dan kelima baris berbeda. */
export function checkRow(p: Possibilities, row: string[]): boolean {
  if (row.length !== 3 || row.some(x => !/^\d{1,4}$/.test(x))) return false;
  const [a, b, c] = row.map(Number);
  if (p.op === "+" ? a + b !== c : a - b !== c || b > a) return false;
  if (p.fixed && [a, b, c][p.fixed.col] !== p.fixed.value) return false;
  if (p.range) { const v = [a, b, c][p.range.col]; if (v < p.range.min || v > p.range.max) return false; }
  return [a, b, c].every(v => v > 0);
}

export function correct(q: MSQuestion, raw: string | undefined): boolean {
  const value = raw ?? "";
  if (!value) return false;
  if (q.kind === "possibilities") {
    const r = rows(value);
    return r.length === 5 && r.every(row => checkRow(q.possibilities!, row)) && new Set(r.map(x => x.map(Number).join(","))).size === 5;
  }
  return /^\d+$/.test(value) && Number(value) === Number(q.answer);
}

export function ready(q: MSQuestion, value: string): boolean {
  if (!value) return false;
  if (q.kind === "possibilities") { const r = rows(value); return r.length === 5 && r.every(row => row.length === 3 && row.every(x => x !== "")); }
  return /^\d+$/.test(value);
}

export function formatAnswer(q: MSQuestion, value: string): string {
  if (!value) return "(kosong)";
  if (q.kind === "possibilities") {
    const op = q.possibilities!.op;
    return rows(value).map(r => `${r[0] || "…"} ${op} ${r[1] || "…"} = ${r[2] || "…"}`).join("; ") + (value === q.answer ? " (contoh; jawaban lain yang memenuhi aturan juga benar)" : "");
  }
  return `${value}${q.unit ? ` ${q.unit}` : ""}`;
}
export const sentenceText = (s: Sentence) => [s.a, s.b, s.c].map((v, i) => (i === s.blank ? "…" : String(v))).reduce((t, v, i) => (i === 0 ? v : i === 1 ? `${t} ${s.op} ${v}` : `${t} = ${v}`), "");

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Kalimat Matematika Berkaitan dengan Penjumlahan", short: "Penjumlahan",
    steps: [
      "Kalimat matematika adalah bentuk hitungan yang ditulis dengan angka dan tanda, misalnya 30 + … = 50.",
      "Titik-titik (…) adalah bilangan yang belum diketahui. Ia bisa berada di depan atau di tengah: … + 16 = 54 atau 23 + … = 45.",
      "Pada penjumlahan, dua bagian digabung menjadi jumlah. Jika satu bagian belum diketahui, kurangi jumlah dengan bagian yang diketahui: 50 − 30 = 20.",
      "Periksa jawaban dengan memasukkannya kembali: 30 + 20 = 50. Benar!",
    ],
    demo: "Pilih kalimat matematika, lalu isi kantong yang kosong dengan kelereng sampai jumlahnya pas. Perhatikan diagram batangnya ikut berubah.",
  },
  {
    code: "B", title: "Kalimat Matematika Berkaitan dengan Pengurangan", short: "Pengurangan",
    steps: [
      "Pada pengurangan, ada bilangan mula-mula, bilangan yang diambil, dan sisa. Contoh: 80 − … = 45.",
      "Jika yang diambil belum diketahui, kurangi mula-mula dengan sisa: 80 − 45 = 35.",
      "Jika bilangan mula-mula belum diketahui, jumlahkan yang diambil dengan sisa: … − 45 = 26, maka 45 + 26 = 71.",
      "Periksa jawaban dengan memasukkannya kembali ke kalimat matematika: 80 − 35 = 45.",
    ],
    demo: "Pilih kalimat matematika, lalu ambil atau kembalikan permen sampai kalimatnya benar. Diagram batang menunjukkan mula-mula, yang diambil, dan sisa.",
  },
] as const;

/* ---------- Latihan (4 soal per subtopik, mengikuti Latihan 1 dan 2) ---------- */
export const practice: MSQuestion[][] = [
  [
    sentence(0, add(8, 9, 1), "17 − 8 = 9. Jadi 8 + 9 = 17."),
    sentence(0, add(36, 27, 0), "63 − 27 = 36. Jadi 36 + 27 = 63."),
    story(0, "Pak Darto memanen jeruk dan memasukkannya ke dalam dua keranjang. Keranjang pertama berisi 36 buah jeruk. Jumlah jeruk di kedua keranjang adalah 85 buah. Berapa banyak jeruk di keranjang kedua?",
      { whole: 85, parts: [36, null], labels: { whole: "Jumlah jeruk", parts: ["Keranjang 1", "Keranjang 2"] } }, "orange", "buah", "Kalimat matematikanya 36 + … = 85. Kurangi jumlah dengan keranjang pertama: 85 − 36 = 49 buah."),
    possibilities(0, "Tiket film yang terjual hari ini 80 lembar. Berapa banyak penonton laki-laki dan perempuan yang mungkin membeli tiket? Buatlah lima kemungkinan!",
      { op: "+", headers: ["Penonton laki-laki", "Penonton perempuan", "Jumlah penonton"], fixed: { col: 2, value: 80 } },
      [[40, 40, 80], [30, 50, 80], [25, 55, 80], [61, 19, 80], [12, 68, 80]], "Setiap baris harus berjumlah 80 dan kelima pasangan harus berbeda, misalnya 30 + 50 = 80."),
  ],
  [
    sentence(1, sub(17, 8, 1), "17 − 9 = 8. Jadi 17 − 8 = 9."),
    sentence(1, sub(63, 38, 0), "Mula-mula = yang diambil + sisa = 38 + 25 = 63. Jadi 63 − 38 = 25."),
    story(1, "Bu Rina memanen 86 buah manggis. Sebagian manggis dibagikan kepada tetangga. Sisa manggis ada 47 buah. Berapa banyak manggis yang dibagikan?",
      { whole: 86, parts: [null, 47], labels: { whole: "Manggis mula-mula", parts: ["Dibagikan", "Sisa"] } }, "mangosteen", "buah", "Kalimat matematikanya 86 − … = 47. Kurangi mula-mula dengan sisa: 86 − 47 = 39 buah."),
    possibilities(1, "Sebuah toko memiliki 50 televisi. Selama sebulan sejumlah televisi terjual. Berapa banyak televisi terjual dan sisa televisi yang mungkin? Buatlah lima kemungkinan!",
      { op: "−", headers: ["Jumlah televisi", "Televisi terjual", "Sisa televisi"], fixed: { col: 0, value: 50 } },
      [[50, 10, 40], [50, 25, 25], [50, 32, 18], [50, 7, 43], [50, 44, 6]], "Setiap baris dimulai dari 50. Yang terjual ditambah sisa harus sama dengan 50, misalnya 50 − 32 = 18."),
  ],
];

/* ---------- Evaluasi: 24 soal, jenis soal sama dengan Asesmen buku ---------- */
export const assessment: MSQuestion[] = [
  sentence(0, add(22, 37, 0), "59 − 37 = 22. Jadi 22 + 37 = 59.", "Sedang"),
  sentence(1, sub(63, 24, 1), "63 − 39 = 24. Jadi 63 − 24 = 39.", "Sedang"),
  story(0, "Galih dan Andi menggabungkan kelereng mereka. Jumlahnya 58 butir. Kelereng Galih ada 34 butir. Berapa banyak kelereng Andi?",
    { whole: 58, parts: [34, null], labels: { whole: "Jumlah kelereng", parts: ["Galih", "Andi"] } }, "marble", "butir", "34 + … = 58, maka 58 − 34 = 24 butir.", "Sedang"),
  sentence(1, sub(73, 28, 0), "Mula-mula = 28 + 45 = 73. Jadi 73 − 28 = 45.", "Menantang"),
  possibilities(0, "Panitia lomba menjual 120 tiket. Berapa banyak tiket untuk anak-anak dan untuk dewasa yang mungkin terjual? Buatlah lima kemungkinan!",
    { op: "+", headers: ["Tiket anak-anak", "Tiket dewasa", "Jumlah tiket"], fixed: { col: 2, value: 120 } },
    [[60, 60, 120], [70, 50, 120], [45, 75, 120], [100, 20, 120], [33, 87, 120]], "Setiap baris harus berjumlah 120 dan kelima baris berbeda.", "Sedang"),
  story(1, "Perpustakaan sekolah memiliki 84 buku cerita. Sebagian dipinjam siswa. Buku yang masih ada di rak sebanyak 39 buah. Berapa banyak buku yang dipinjam?",
    { whole: 84, parts: [null, 39], labels: { whole: "Semua buku", parts: ["Dipinjam", "Masih di rak"] } }, "book", "buku", "84 − … = 39, maka 84 − 39 = 45 buku.", "Menantang"),
  sentence(0, add(46, 35, 1), "81 − 46 = 35. Jadi 46 + 35 = 81.", "Menantang"),
  sentence(1, sub(66, 14, 0), "Mula-mula = 14 + 52 = 66. Jadi 66 − 14 = 52.", "Sedang"),
  story(0, "Pak Budi menaruh durian di dua keranjang. Keranjang pertama berisi 27 durian. Jumlah durian di kedua keranjang 64 buah. Berapa durian di keranjang kedua?",
    { whole: 64, parts: [27, null], labels: { whole: "Jumlah durian", parts: ["Keranjang 1", "Keranjang 2"] } }, "durian", "buah", "27 + … = 64, maka 64 − 27 = 37 buah.", "Menantang"),
  possibilities(1, "Ibu guru membagikan kertas kepada siswa untuk ulangan. Buatlah lima kemungkinan berbeda untuk banyak kertas yang tersedia, kertas yang dibagikan, dan sisa kertas!",
    { op: "−", headers: ["Kertas tersedia", "Kertas dibagikan", "Sisa kertas"] },
    [[50, 30, 20], [40, 28, 12], [60, 45, 15], [35, 30, 5], [72, 66, 6]], "Setiap baris harus benar: tersedia − dibagikan = sisa, dan kertas yang dibagikan tidak boleh lebih dari yang tersedia.", "Menantang"),
  sentence(0, add(34, 59, 0), "93 − 59 = 34. Jadi 34 + 59 = 93.", "Menantang"),
  story(1, "Sinta mempunyai 75 permen. Sebagian permen diberikan kepada teman-temannya. Sisa permen Sinta 32 butir. Berapa banyak permen yang diberikan?",
    { whole: 75, parts: [null, 32], labels: { whole: "Permen mula-mula", parts: ["Diberikan", "Sisa"] } }, "candy", "butir", "75 − … = 32, maka 75 − 32 = 43 butir.", "Sedang"),
  sentence(0, add(246, 186, 0), "432 − 186 = 246. Jadi 246 + 186 = 432.", "Sangat menantang"),
  sentence(1, sub(92, 45, 1), "92 − 47 = 45. Jadi 92 − 45 = 47.", "Menantang"),
  story(0, "Kelas 3A dan 3B mengumpulkan 96 botol bekas. Kelas 3B mengumpulkan 48 botol. Berapa botol yang dikumpulkan kelas 3A?",
    { whole: 96, parts: [null, 48], labels: { whole: "Jumlah botol", parts: ["Kelas 3A", "Kelas 3B"] } }, "bottle", "botol", "… + 48 = 96, maka 96 − 48 = 48 botol.", "Sedang"),
  story(1, "Ada 92 pasien dirawat di rumah sakit. Setelah dirawat, sebagian pasien sembuh dan pulang. Pasien yang masih dirawat ada 28 orang. Berapa pasien yang sembuh?",
    { whole: 92, parts: [null, 28], labels: { whole: "Pasien mula-mula", parts: ["Sembuh", "Masih dirawat"] } }, "patient", "orang", "92 − … = 28, maka 92 − 28 = 64 orang.", "Menantang"),
  possibilities(0, "Andi dan Galih mengumpulkan kelereng mereka. Buatlah lima kemungkinan berbeda untuk banyak kelereng Andi, kelereng Galih, dan jumlah kelereng semuanya!",
    { op: "+", headers: ["Kelereng Andi", "Kelereng Galih", "Jumlah kelereng"] },
    [[10, 15, 25], [23, 17, 40], [31, 42, 73], [8, 9, 17], [50, 26, 76]], "Setiap baris harus benar: Andi + Galih = jumlah, dan kelima baris berbeda.", "Menantang"),
  sentence(1, sub(425, 257, 0), "Mula-mula = 257 + 168 = 425. Jadi 425 − 257 = 168.", "Sangat menantang"),
  sentence(0, add(315, 387, 1), "702 − 315 = 387. Jadi 315 + 387 = 702.", "Sangat menantang"),
  story(1, "Pak Slamet menjual 136 ekor ayam ke pasar. Sisa ayam di kandang ada 247 ekor. Berapa banyak ayam Pak Slamet mula-mula?",
    { whole: null, parts: [136, 247], labels: { whole: "Ayam mula-mula", parts: ["Dijual", "Sisa"] } }, "chicken", "ekor", "… − 136 = 247. Mula-mula = yang dijual + sisa = 136 + 247 = 383 ekor.", "Sangat menantang"),
  sentence(0, add(25, 43, 1), "68 − 25 = 43. Jadi 25 + 43 = 68.", "Sedang"),
  sentence(1, sub(604, 326, 1), "604 − 278 = 326. Jadi 604 − 326 = 278.", "Sangat menantang"),
  story(0, "Hari Senin toko buku menjual 128 buku. Jumlah buku yang terjual pada hari Senin dan Selasa adalah 305 buku. Berapa buku yang terjual hari Selasa?",
    { whole: 305, parts: [128, null], labels: { whole: "Senin dan Selasa", parts: ["Senin", "Selasa"] } }, "book", "buku", "128 + … = 305, maka 305 − 128 = 177 buku.", "Sangat menantang"),
  possibilities(1, "Pedagang menjual telur di pasar. Sisa telurnya 75 butir. Jumlah telur mula-mula antara 200 dan 300 butir. Buatlah lima kemungkinan untuk telur mula-mula dan telur yang terjual!",
    { op: "−", headers: ["Telur mula-mula", "Telur terjual", "Sisa telur"], fixed: { col: 2, value: 75 }, range: { col: 0, min: 200, max: 300 } },
    [[200, 125, 75], [250, 175, 75], [300, 225, 75], [215, 140, 75], [280, 205, 75]], "Sisa selalu 75, jadi terjual = mula-mula − 75. Mula-mula harus antara 200 dan 300, misalnya 250 − 175 = 75.", "Sangat menantang"),
];
