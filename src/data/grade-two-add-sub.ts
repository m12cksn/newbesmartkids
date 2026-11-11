import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 2 Bab 2 - Penjumlahan dan Pengurangan (Buku Matematika SD/MI Kelas II, hlm. 37-64).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Op = "+" | "-";
export const things = {
  jambu: "jambu air", donat: "donat", pesawat: "pesawat mainan", mobil: "mobil-mobilan", kupuMerah: "kupu-kupu merah", kupuHijau: "kupu-kupu hijau", kupuKuning: "kupu-kupu kuning",
  kelereng: "kelereng", ikan: "ikan", pisangGoreng: "pisang goreng", jeruk: "jeruk", kue: "kue", tomat: "tomat",
} as const;
export type Thing = keyof typeof things;

export type Scene =
  /** Kelompok benda milik tokoh; n null berarti belum diketahui (ditulis tanda tanya). */
  | { type: "groups"; groups: { who: string; thing: Thing; n: number | null }[] }
  /** Nilai gambar: setiap bentuk bernilai tertentu. */
  | { type: "shapes"; legend: { shape: "lingkaran" | "bintang" | "segitiga"; value: number }[]; row: ("lingkaran" | "bintang" | "segitiga")[] };

export type StoryStep = { label: string; accept: [number, Op, number, number][] };
export type Part =
  | { kind: "number"; label: string; answer: number }
  /** Menghitung maju atau mundur pada garis bilangan. */
  | { kind: "hop"; a: number; b: number; op: Op; lo: number; hi: number }
  /** Bersusun: isi puluhan dan satuan hasil. */
  | { kind: "column"; a: number; b: number; op: Op }
  /** Pasangan bilangan penjumlahan: a dipisah menjadi 10 dan satuan. */
  | { kind: "split"; a: number; b: number; tensGiven: boolean }
  /** Pasangan bilangan pengurangan: a dan b masing-masing dipisah. */
  | { kind: "split2"; a: number; b: number; tensGiven: boolean }
  /** Soal cerita: diketahui, ditanya, solusi, jadi. */
  | { kind: "story"; known: { text: string; answer: number }[]; ask: { options: string[]; answer: string }; steps: StoryStep[]; conclude: { text: string; answer: number }[] }
  /** Pilihan ganda; pots = gambar pot bunga, abacus = gambar sempoa. */
  | { kind: "choice"; label: string; options: string[]; answer: string; pots?: number[]; abacus?: number[] };

export type AQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Hitungan ---------- */
export const calc = (a: number, op: Op, b: number) => (op === "+" ? a + b : a - b);
export const fieldCount = (p: Part): number => {
  switch (p.kind) {
    case "hop": case "column": return 2;
    case "split": case "split2": return 7;
    case "story": return p.known.length + 1 + p.steps.length + p.conclude.length;
    default: return 1;
  }
};
/** Isian yang benar untuk setiap kotak. */
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "number": return [String(p.answer)];
    case "hop": { const r = calc(p.a, p.op, p.b); return [String(r), String(r)]; }
    case "column": { const r = calc(p.a, p.op, p.b); return [String(Math.floor(r / 10)), String(r % 10)]; }
    case "split": { const o = p.a - 10, s = o + p.b; return ["10", String(o), String(o), String(s), String(s), String(10 + s), String(p.a + p.b)]; }
    case "split2": { const ao = p.a - 10, bo = p.b - 10; return ["10", String(ao), "10", String(bo), "0", String(ao - bo), String(p.a - p.b)]; }
    case "story": return [...p.known.map(k => String(k.answer)), p.ask.answer, ...p.steps.map(s => s.accept[0].join(",")), ...p.conclude.map(c => String(c.answer))];
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const rowOk = (step: StoryStep, raw: string) => {
  const [a, op, b, c] = raw.split(","); const A = int(a), B = int(b), C = int(c);
  return step.accept.some(([x, o, y, z]) => o === op && C === z && ((A === x && B === y) || (o === "+" && A === y && B === x)));
};
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v), want = fields(p);
  switch (p.kind) {
    case "column": { const r = calc(p.a, p.op, p.b); return int(x[1]) === r % 10 && (r < 10 ? x[0] === "" || int(x[0]) === 0 : int(x[0]) === Math.floor(r / 10)); }
    case "story": {
      const k = p.known.length;
      return p.known.every((kn, i) => int(x[i]) === kn.answer) && x[k] === p.ask.answer && p.steps.every((s, i) => rowOk(s, x[k + 1 + i])) && p.conclude.every((c, i) => int(x[k + 1 + p.steps.length + i]) === c.answer);
    }
    case "choice": return v === p.answer;
    default: return want.every((w, i) => int(x[i]) === Number(w));
  }
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "column": return !Number.isNaN(int(x[1]));
    case "choice": return Boolean(v);
    case "story": { const k = p.known.length; return x.every((y, i) => (i === k ? Boolean(y) : i > k && i <= k + p.steps.length ? y.split(",").length === 4 && y.split(",").every(Boolean) : !Number.isNaN(int(y)))); }
    case "hop": return !Number.isNaN(int(x[1]));
    default: return x.every(y => !Number.isNaN(int(y)));
  }
}
export const correct = (q: AQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: AQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const opText = (op: Op | string) => (op === "-" ? "−" : "+");
export function formatAnswer(q: AQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => s || "…";
    switch (p.kind) {
      case "number": return `${p.label} ${d(x[0])}`;
      case "hop": return `${p.a} ${opText(p.op)} ${p.b} = ${d(x[1])}`;
      case "column": return `${p.a} ${opText(p.op)} ${p.b} = ${x[0]}${d(x[1])}`;
      case "split": return `${p.a} = ${d(x[0])} dan ${d(x[1])}; ${d(x[2])} + ${p.b} = ${d(x[3])}; 10 + ${d(x[4])} = ${d(x[5])}; jadi ${d(x[6])}`;
      case "split2": return `${p.a} = ${d(x[0])} dan ${d(x[1])}; ${p.b} = ${d(x[2])} dan ${d(x[3])}; 10 − 10 = ${d(x[4])}; satuan ${d(x[5])}; jadi ${d(x[6])}`;
      case "story": {
        const k = p.known.length;
        const rows = p.steps.map((s, j) => { const [a, op, b, c] = x[k + 1 + j].split(","); return `${s.label} ${d(a)} ${op ? opText(op) : "…"} ${d(b)} = ${d(c ?? "")}`; });
        return `Diketahui ${x.slice(0, k).map(d).join(", ")}; ditanya: ${d(x[k])}; solusi ${rows.join("; ")}; jadi ${x.slice(k + 1 + p.steps.length).map(d).join(", ")}`;
      }
      default: return d(v[i]);
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: AQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): AQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const hop = (a: number, op: Op, b: number, lo: number, hi: number): Part => ({ kind: "hop", a, b, op, lo, hi });
const col = (a: number, op: Op, b: number): Part => ({ kind: "column", a, b, op });
const step = (label: string, a: number, op: Op, b: number, ...alt: [number, Op, number, number][]): StoryStep => ({ label, accept: [[a, op, b, calc(a, op, b)], ...alt] });

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Berbagai Cara Melakukan Penjumlahan", short: "Penjumlahan",
    steps: [
      "Menghitung maju: mulai dari bilangan pertama, lalu lompat ke kanan sebanyak bilangan kedua. 12 + 6: 13, 14, 15, 16, 17, 18.",
      "Penjumlahan bersusun: satuan ditulis lurus dengan satuan. Jumlahkan satuan dulu, lalu puluhan.",
      "Jika satuan berjumlah 10 atau lebih, 10 satuan dipindah menjadi 1 puluhan. 18 + 2: 8 + 2 = 10, jadi hasilnya 2 puluhan 0 satuan = 20.",
      "Pasangan bilangan: pisah 12 menjadi 10 dan 2. Jumlahkan 2 + 6 = 8, lalu 10 + 8 = 18.",
    ],
    demo: "Atur dua bilangan. Lompatkan kelinci di garis bilangan, lihat balok pada tabel nilai tempat, lalu cocokkan dengan pasangan bilangan.",
  },
  {
    code: "B", title: "Berbagai Cara Melakukan Pengurangan", short: "Pengurangan",
    steps: [
      "Menghitung mundur: mulai dari bilangan pertama, lalu lompat ke kiri sebanyak bilangan pengurang. 18 − 12: lompat 12 kali sampai 6.",
      "Pengurangan bersusun: kurangi satuan dengan satuan, lalu puluhan dengan puluhan.",
      "Jika satuan tidak cukup, urai 1 puluhan menjadi 10 satuan. 12 − 8: 2 + 10 = 12 satuan, 12 − 8 = 4.",
      "Pasangan bilangan: 18 adalah 10 dan 8, 12 adalah 10 dan 2. 10 − 10 = 0 dan 8 − 2 = 6. Jadi 18 − 12 = 6.",
    ],
    demo: "Atur dua bilangan. Lompat mundur di garis bilangan, ambil balok satuan, dan urai satu puluhan jika satuannya tidak cukup.",
  },
  {
    code: "C", title: "Soal Cerita Penjumlahan dan Pengurangan", short: "Soal cerita",
    steps: [
      "Kata lebihnya dan jumlah biasanya diselesaikan dengan penjumlahan. Kata kurangnya, selisih, dan sisa biasanya dengan pengurangan.",
      "Tulis yang diketahui: bilangan apa saja yang ada di cerita.",
      "Tulis yang ditanya, lalu pilih operasi hitung yang tepat dan tulis solusinya.",
      "Akhiri dengan kesimpulan: Jadi, … . Periksa lagi apakah jawabanmu masuk akal.",
    ],
    demo: "Tambah atau kurangi burung pada dua baris. Pasangkan burungnya untuk melihat lebihnya, kurangnya, selisih, dan jumlah.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: AQuestion[][] = [
  [
    q(0, "Hitunglah dengan menghitung maju. Lompatkan kelinci, lalu tulis hasilnya.", [hop(11, "+", 7, 10, 20)], "Mulai dari 11, lompat 7 kali ke kanan: 12, 13, 14, 15, 16, 17, 18. Jadi 11 + 7 = 18."),
    q(0, "Hitunglah penjumlahan bersusun berikut.", [col(13, "+", 4)], "Satuan: 3 + 4 = 7. Puluhan: 1. Hasilnya 17."),
    q(0, "Hitunglah penjumlahan berikut menggunakan pasangan bilangan.", [{ kind: "split", a: 12, b: 5, tensGiven: true }], "12 adalah 10 dan 2. 2 + 5 = 7, lalu 10 + 7 = 17."),
    q(0, "Hitunglah penjumlahan berikut. Gunakan cara yang menurutmu paling mudah.", [{ kind: "number", label: "14 + 6 =", answer: 20 }], "4 + 6 = 10, jadi 14 + 6 = 10 + 10 = 20."),
  ],
  [
    q(1, "Hitunglah dengan menghitung mundur. Lompatkan kelinci, lalu tulis hasilnya.", [hop(16, "-", 5, 6, 20)], "Mulai dari 16, lompat 5 kali ke kiri: 15, 14, 13, 12, 11. Jadi 16 − 5 = 11."),
    q(1, "Hitunglah pengurangan bersusun berikut.", [col(19, "-", 6)], "Satuan: 9 − 6 = 3. Puluhan: 1. Hasilnya 13."),
    q(1, "Hitunglah pengurangan berikut menggunakan pasangan bilangan.", [{ kind: "split2", a: 18, b: 12, tensGiven: true }], "18 adalah 10 dan 8, 12 adalah 10 dan 2. 10 − 10 = 0, 8 − 2 = 6. Jadi 18 − 12 = 6."),
    q(1, "Hitunglah pengurangan berikut. Gunakan cara yang menurutmu paling mudah.", [{ kind: "number", label: "15 − 8 =", answer: 7 }], "5 kurang 8 tidak cukup. Urai 15 menjadi 15 satuan: 15 − 8 = 7. Bisa juga mundur 8 langkah dari 15."),
  ],
  [
    q(2, "Di toko mainan ada 8 pesawat mainan dan 11 mobil-mobilan. a. Berapa jumlah seluruh mainan? b. Berapa selisih banyak pesawat dan mobil-mobilan?", [{
      kind: "story", known: [{ text: "Ada ___ pesawat mainan.", answer: 8 }, { text: "Ada ___ mobil-mobilan.", answer: 11 }],
      ask: { options: ["Jumlah seluruh mainan dan selisih banyak pesawat dan mobil-mobilan", "Banyak mainan yang dijual", "Selisih harga pesawat dan mobil-mobilan"], answer: "Jumlah seluruh mainan dan selisih banyak pesawat dan mobil-mobilan" },
      steps: [step("a.", 8, "+", 11), step("b.", 11, "-", 8)],
      conclude: [{ text: "Jadi, jumlah seluruh mainan ada ___.", answer: 19 }, { text: "Selisihnya ___.", answer: 3 }],
    }], "Jumlah: 8 + 11 = 19. Selisih: bilangan besar dikurangi bilangan kecil, 11 − 8 = 3.", { scene: { type: "groups", groups: [{ who: "Pesawat", thing: "pesawat", n: 8 }, { who: "Mobil-mobilan", thing: "mobil", n: 11 }] } }),
    q(2, "Ada 7 kupu-kupu hinggap di atas bunga, 5 kupu-kupu di atas daun, dan 4 kupu-kupu di rumput. Berapa jumlah seluruh kupu-kupu?", [{
      kind: "story", known: [{ text: "Di atas bunga ___ kupu-kupu.", answer: 7 }, { text: "Di atas daun ___ kupu-kupu.", answer: 5 }, { text: "Di rumput ___ kupu-kupu.", answer: 4 }],
      ask: { options: ["Jumlah seluruh kupu-kupu", "Selisih kupu-kupu di bunga dan di daun", "Sisa kupu-kupu di rumput"], answer: "Jumlah seluruh kupu-kupu" },
      steps: [step("Langkah 1", 7, "+", 5), step("Langkah 2", 12, "+", 4)],
      conclude: [{ text: "Jadi, jumlah seluruh kupu-kupu ada ___.", answer: 16 }],
    }], "Jumlahkan dua dulu: 7 + 5 = 12. Lalu 12 + 4 = 16."),
    q(2, "Upe mempunyai 12 kelereng. Kelereng Upe 4 lebihnya dari kelereng Halim. a. Berapa banyak kelereng Halim? b. Berapa jumlah kelereng Halim dan Upe?", [{
      kind: "story", known: [{ text: "Kelereng Upe ___.", answer: 12 }, { text: "Kelereng Upe ___ lebihnya dari kelereng Halim.", answer: 4 }],
      ask: { options: ["Banyak kelereng Halim dan jumlah kelereng mereka", "Banyak kelereng Upe", "Selisih kelereng Upe dan Halim"], answer: "Banyak kelereng Halim dan jumlah kelereng mereka" },
      steps: [step("a.", 12, "-", 4), step("b.", 8, "+", 12)],
      conclude: [{ text: "Jadi, kelereng Halim ___.", answer: 8 }, { text: "Jumlah kelereng mereka ___.", answer: 20 }],
    }], "Upe 4 lebihnya, berarti Halim 4 kurangnya dari Upe: 12 − 4 = 8. Jumlah: 8 + 12 = 20.", { scene: { type: "groups", groups: [{ who: "Upe", thing: "kelereng", n: 12 }, { who: "Halim", thing: "kelereng", n: null }] } }),
    q(2, "Ibu membuat 18 pisang goreng. Tika memakan 5 pisang goreng. Adik memakan 2 pisang goreng. Berapa sisa pisang goreng Ibu sekarang?", [{
      kind: "story", known: [{ text: "Ibu membuat ___ pisang goreng.", answer: 18 }, { text: "Tika memakan ___.", answer: 5 }, { text: "Adik memakan ___.", answer: 2 }],
      ask: { options: ["Sisa pisang goreng Ibu", "Jumlah pisang goreng yang dimakan", "Pisang goreng yang dibuat Ibu"], answer: "Sisa pisang goreng Ibu" },
      steps: [step("Langkah 1", 18, "-", 5), step("Langkah 2", 13, "-", 2, [18, "-", 7, 11])],
      conclude: [{ text: "Jadi, sisa pisang goreng ada ___.", answer: 11 }],
    }], "18 − 5 = 13, lalu 13 − 2 = 11. Bisa juga 5 + 2 = 7 dan 18 − 7 = 11.", { scene: { type: "groups", groups: [{ who: "Buatan Ibu", thing: "pisangGoreng", n: 18 }] } }),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
const ask3 = (answer: string, a: string, b: string) => ({ options: [answer, a, b], answer });
export const assessment: AQuestion[] = [
  // Sedang
  q(0, "Hitunglah penjumlahan berikut dengan menghitung maju.", [hop(13, "+", 5, 10, 20)],
    "Mulai dari 13, lompat 5 kali: 14, 15, 16, 17, 18. Jadi 13 + 5 = 18.", { level: "Sedang" }),
  q(1, "Hitunglah pengurangan berikut dengan menghitung mundur.", [hop(18, "-", 6, 6, 20)],
    "Mulai dari 18, lompat 6 kali ke kiri: 17, 16, 15, 14, 13, 12. Jadi 18 − 6 = 12.", { level: "Sedang" }),
  q(2, "Di toko ada 7 pesawat mainan dan 12 mobil-mobilan. Berapa jumlah seluruh mainan di toko?", [{
    kind: "story", known: [{ text: "Ada ___ pesawat mainan.", answer: 7 }, { text: "Ada ___ mobil-mobilan.", answer: 12 }],
    ask: ask3("Jumlah seluruh mainan di toko", "Selisih pesawat dan mobil-mobilan", "Sisa mobil-mobilan"),
    steps: [step("Solusi", 7, "+", 12)], conclude: [{ text: "Jadi, jumlah seluruh mainan ada ___.", answer: 19 }],
  }], "Kata jumlah berarti dijumlahkan: 7 + 12 = 19.", { level: "Sedang", scene: { type: "groups", groups: [{ who: "Pesawat", thing: "pesawat", n: 7 }, { who: "Mobil-mobilan", thing: "mobil", n: 12 }] } }),
  q(0, "Hitunglah penjumlahan bersusun berikut.", [col(14, "+", 5)], "Satuan: 4 + 5 = 9. Puluhan: 1. Hasilnya 19.", { level: "Sedang" }),
  q(1, "Hitunglah pengurangan bersusun berikut.", [col(18, "-", 5)], "Satuan: 8 − 5 = 3. Puluhan: 1. Hasilnya 13.", { level: "Sedang" }),
  q(2, "Kira dan Tika senang menanam bunga. Tanaman Kira memiliki 3 bunga. Tanaman Tika mempunyai 4 bunga lebihnya dari milik Kira. Yang manakah tanaman Tika?", [
    { kind: "choice", label: "Tanaman Tika", options: ["A", "B", "C", "D"], answer: "C", pots: [4, 5, 7, 8] }],
    "4 lebihnya dari 3 adalah 3 + 4 = 7. Tanaman C punya 7 bunga.", { level: "Sedang" }),
  q(0, "Hitunglah penjumlahan berikut menggunakan pasangan bilangan.", [{ kind: "split", a: 15, b: 3, tensGiven: true }],
    "15 adalah 10 dan 5. 5 + 3 = 8, lalu 10 + 8 = 18.", { level: "Sedang" }),
  q(1, "Hitunglah pengurangan berikut menggunakan pasangan bilangan.", [{ kind: "split2", a: 17, b: 13, tensGiven: true }],
    "17 adalah 10 dan 7, 13 adalah 10 dan 3. 10 − 10 = 0, 7 − 3 = 4. Jadi 17 − 13 = 4.", { level: "Sedang" }),
  // Menantang
  q(2, "Upe dan Malosi pergi memancing. Upe mendapat 9 ikan. Malosi mendapat 5 lebihnya dari banyak ikan Upe. a. Berapa banyak ikan Malosi? b. Berapa jumlah ikan mereka?", [{
    kind: "story", known: [{ text: "Ikan Upe ___.", answer: 9 }, { text: "Ikan Malosi ___ lebihnya dari ikan Upe.", answer: 5 }],
    ask: ask3("Banyak ikan Malosi dan jumlah ikan mereka", "Selisih ikan Upe dan Malosi", "Banyak ikan Upe"),
    steps: [step("a.", 9, "+", 5), step("b.", 9, "+", 14)],
    conclude: [{ text: "Jadi, ikan Malosi ___.", answer: 14 }, { text: "Jumlah ikan mereka ___.", answer: 23 }],
  }], "5 lebihnya dari 9: 9 + 5 = 14. Jumlah: 9 + 14 = 23.", { level: "Menantang", scene: { type: "groups", groups: [{ who: "Upe", thing: "ikan", n: 9 }, { who: "Malosi", thing: "ikan", n: null }] } }),
  q(0, "Hitunglah penjumlahan bersusun berikut. Ingat, 10 satuan dipindah menjadi 1 puluhan.", [col(17, "+", 6)],
    "Satuan: 7 + 6 = 13, tulis 3 dan pindahkan 1 puluhan. Puluhan: 1 + 1 = 2. Hasilnya 23.", { level: "Menantang" }),
  q(1, "Hitunglah pengurangan bersusun berikut.", [col(13, "-", 7)],
    "3 dikurang 7 tidak cukup. Urai 1 puluhan: 10 + 3 = 13 satuan. 13 − 7 = 6. Puluhan tinggal 0. Hasilnya 6.", { level: "Menantang" }),
  q(2, "Ibu membuat 20 kue. Tika memakan 4 kue. Adik memakan 3 kue. Berapa sisa kue Ibu sekarang?", [{
    kind: "story", known: [{ text: "Ibu membuat ___ kue.", answer: 20 }, { text: "Tika memakan ___ kue.", answer: 4 }, { text: "Adik memakan ___ kue.", answer: 3 }],
    ask: ask3("Sisa kue Ibu", "Jumlah kue yang dimakan Tika dan Adik", "Banyak kue yang dibuat Ibu"),
    steps: [step("Langkah 1", 20, "-", 4, [4, "+", 3, 7]), step("Langkah 2", 16, "-", 3, [20, "-", 7, 13])],
    conclude: [{ text: "Jadi, sisa kue ada ___.", answer: 13 }],
  }], "20 − 4 = 16, lalu 16 − 3 = 13. Bisa juga 4 + 3 = 7, lalu 20 − 7 = 13.", { level: "Menantang", scene: { type: "groups", groups: [{ who: "Buatan Ibu", thing: "kue", n: 20 }] } }),
  q(0, "Hitunglah penjumlahan berikut menggunakan pasangan bilangan.", [{ kind: "split", a: 16, b: 4, tensGiven: false }],
    "16 adalah 10 dan 6. 6 + 4 = 10, lalu 10 + 10 = 20.", { level: "Menantang" }),
  q(1, "17 − 9 = 15 − ?  Bilangan untuk ? adalah ….", [{ kind: "choice", label: "Bilangan untuk ?", options: ["A. 6", "B. 7", "C. 8", "D. 2"], answer: "B. 7" }],
    "17 − 9 = 8. Bilangan berapa yang dikurangkan dari 15 agar hasilnya 8? 15 − 7 = 8. Jadi ? = 7.", { level: "Menantang" }),
  q(2, "Tika memetik 15 jambu air. Jambu air Lili 6 kurangnya dari jambu air Tika. a. Berapa jambu air Lili? b. Berapa jumlah jambu air mereka?", [{
    kind: "story", known: [{ text: "Jambu air Tika ___.", answer: 15 }, { text: "Jambu air Lili ___ kurangnya dari Tika.", answer: 6 }],
    ask: ask3("Banyak jambu air Lili dan jumlah jambu air mereka", "Selisih jambu air Tika dan Lili", "Banyak jambu air Tika"),
    steps: [step("a.", 15, "-", 6), step("b.", 15, "+", 9)],
    conclude: [{ text: "Jadi, jambu air Lili ___.", answer: 9 }, { text: "Jumlah jambu air mereka ___.", answer: 24 }],
  }], "6 kurangnya dari 15: 15 − 6 = 9. Jumlah: 15 + 9 = 24.", { level: "Menantang", scene: { type: "groups", groups: [{ who: "Tika", thing: "jambu", n: 15 }, { who: "Lili", thing: "jambu", n: null }] } }),
  q(1, "Hitunglah pengurangan berikut dengan menghitung mundur.", [hop(20, "-", 7, 10, 20)],
    "Mulai dari 20, lompat 7 kali ke kiri: 19, 18, 17, 16, 15, 14, 13. Jadi 20 − 7 = 13.", { level: "Menantang" }),
  q(0, "Kira menyusun hasil 16 + 7 pada sempoa. Biru menunjukkan puluhan, merah menunjukkan satuan. Gambar manakah yang benar?", [
    { kind: "choice", label: "Sempoa yang benar", options: ["A", "B", "C", "D"], answer: "D", abacus: [13, 32, 22, 23] }],
    "16 + 7 = 23, yaitu 2 puluhan dan 3 satuan: 2 manik biru dan 3 manik merah.", { level: "Menantang" }),
  // Sangat menantang
  q(1, "Hitunglah pengurangan berikut menggunakan pasangan bilangan.", [{ kind: "split2", a: 19, b: 14, tensGiven: false }],
    "19 adalah 10 dan 9, 14 adalah 10 dan 4. 10 − 10 = 0, 9 − 4 = 5. Jadi 19 − 14 = 5.", { level: "Sangat menantang" }),
  q(2, "Halim mempunyai satu keranjang jeruk. Halim memberikan 6 jeruk kepada Lili. Sekarang jeruk Halim tersisa 13 buah. Berapa banyak jeruk Halim sebelum diberikan kepada Lili?", [{
    kind: "story", known: [{ text: "Jeruk yang diberikan ___.", answer: 6 }, { text: "Sisa jeruk Halim ___.", answer: 13 }],
    ask: ask3("Banyak jeruk Halim sebelumnya", "Banyak jeruk Lili sekarang", "Selisih jeruk Halim dan Lili"),
    steps: [step("Solusi", 13, "+", 6, [19, "-", 6, 13])],
    conclude: [{ text: "Jadi, jeruk Halim sebelumnya ada ___.", answer: 19 }],
  }], "… − 6 = 13. Bilangan yang dikurangi 6 hasilnya 13 adalah 13 + 6 = 19.", { level: "Sangat menantang", scene: { type: "groups", groups: [{ who: "Sisa Halim", thing: "jeruk", n: 13 }, { who: "Diberikan", thing: "jeruk", n: 6 }] } }),
  q(0, "Kira menggambar bentuk untuk menunjukkan sebuah bilangan. Berapakah nilai gambar berikut?", [{ kind: "number", label: "Nilai gambar =", answer: 18 }],
    "Lingkaran bernilai 5 dan bintang bernilai 2. 5 + 5 = 10, lalu 2 + 2 + 2 + 2 = 8. 10 + 8 = 18.",
    { level: "Sangat menantang", scene: { type: "shapes", legend: [{ shape: "lingkaran", value: 5 }, { shape: "bintang", value: 2 }], row: ["bintang", "lingkaran", "bintang", "bintang", "lingkaran", "bintang"] } }),
  q(1, "Hitunglah pengurangan bersusun berikut.", [col(20, "-", 8)],
    "0 dikurang 8 tidak cukup. Urai 1 puluhan menjadi 10 satuan: 10 − 8 = 2. Puluhan tinggal 1. Hasilnya 12.", { level: "Sangat menantang" }),
  q(2, "Kira membuat 11 donat. Upe membuat 4 donat lebih banyak dari donat Kira. a. Berapa donat Upe? b. Berapa jumlah donat mereka jika digabungkan? c. Berapa selisih donat Upe dan Kira?", [{
    kind: "story", known: [{ text: "Donat Kira ___.", answer: 11 }, { text: "Donat Upe ___ lebihnya dari donat Kira.", answer: 4 }],
    ask: ask3("Banyak donat Upe, jumlah, dan selisih donat mereka", "Banyak donat Kira saja", "Sisa donat setelah dimakan"),
    steps: [step("a.", 11, "+", 4), step("b.", 11, "+", 15), step("c.", 15, "-", 11)],
    conclude: [{ text: "Jadi, donat Upe ___.", answer: 15 }, { text: "Jumlah donat mereka ___.", answer: 26 }, { text: "Selisihnya ___.", answer: 4 }],
  }], "Upe: 11 + 4 = 15. Jumlah: 11 + 15 = 26. Selisih: 15 − 11 = 4, sama dengan kata lebihnya.", { level: "Sangat menantang", scene: { type: "groups", groups: [{ who: "Kira", thing: "donat", n: 11 }, { who: "Upe", thing: "donat", n: null }] } }),
  q(0, "Hitunglah penjumlahan berikut dengan menghitung maju.", [hop(18, "+", 7, 15, 30)],
    "Mulai dari 18, lompat 7 kali: 19, 20, 21, 22, 23, 24, 25. Jadi 18 + 7 = 25.", { level: "Sangat menantang" }),
  q(2, "Di atas bunga hinggap kupu-kupu merah, kuning, dan hijau. Ada 6 kupu-kupu merah dan 5 kupu-kupu hijau. Banyak kupu-kupu kuning 3 lebihnya dari kupu-kupu merah. a. Berapa kupu-kupu kuning? b. Berapa jumlah semua kupu-kupu?", [{
    kind: "story", known: [{ text: "Kupu-kupu merah ___.", answer: 6 }, { text: "Kupu-kupu hijau ___.", answer: 5 }, { text: "Kuning ___ lebihnya dari merah.", answer: 3 }],
    ask: ask3("Banyak kupu-kupu kuning dan jumlah semua kupu-kupu", "Selisih kupu-kupu merah dan hijau", "Banyak kupu-kupu merah"),
    steps: [step("a.", 6, "+", 3), step("b. Langkah 1", 6, "+", 5), step("b. Langkah 2", 11, "+", 9)],
    conclude: [{ text: "Jadi, kupu-kupu kuning ___.", answer: 9 }, { text: "Jumlah semua kupu-kupu ___.", answer: 20 }],
  }], "Kuning: 6 + 3 = 9. Merah dan hijau: 6 + 5 = 11. Semua: 11 + 9 = 20.",
    { level: "Sangat menantang", scene: { type: "groups", groups: [{ who: "Merah", thing: "kupuMerah", n: 6 }, { who: "Hijau", thing: "kupuHijau", n: 5 }, { who: "Kuning", thing: "kupuKuning", n: null }] } }),
];

/* Jawaban "Ditanya" diputar agar letaknya tidak selalu di atas. */
[...practice.flat(), ...assessment].flatMap(x => x.parts).filter(p => p.kind === "story").forEach((p, i) => {
  if (p.kind !== "story") return;
  const k = (i * 2 + 1) % p.ask.options.length, rest = p.ask.options.filter(o => o !== p.ask.answer);
  p.ask.options = [...rest.slice(0, k), p.ask.answer, ...rest.slice(k)];
});
