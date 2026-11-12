import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 5 Bab 3 - Bilangan Pecahan (Buku Matematika SD/MI Kelas V, hlm. 63-104).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 * Pecahan ditulis sebagai teks "n/d" atau "w n/d" (pecahan campuran).
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Op = "+" | "-";

/* ---------- Hitungan pecahan ---------- */
export type Fr = { w: number; n: number; d: number };
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
export const fr = (s: string): Fr => { const m = s.trim().match(/^(?:(\d+) )?(\d+)\/(\d+)$/); if (!m) { const w = Number(s); return { w, n: 0, d: 1 }; } return { w: Number(m[1] ?? 0), n: Number(m[2]), d: Number(m[3]) }; };
/** Pembilang pecahan biasa (tidak disederhanakan). */
export const top = (f: Fr) => f.w * f.d + f.n;
export const val = (s: string) => { const f = fr(s); return top(f) / f.d; };
export const same = (a: Fr, b: Fr) => b.d > 0 && a.d > 0 && top(a) * b.d === top(b) * a.d;
/** Hasil operasi a op b dengan penyebut D. */
export const opNum = (a: string, op: Op, b: string, D: number) => { const x = fr(a), y = fr(b); return op === "+" ? (top(x) * D) / x.d + (top(y) * D) / y.d : (top(x) * D) / x.d - (top(y) * D) / y.d; };
export const lcmAll = (xs: number[]) => xs.reduce(lcm);

export type Shape = "pie" | "bar" | "dots" | "tri" | "grid";
/** d bagian sama besar; untuk tri, d harus bilangan kuadrat. grid memakai rows. */
export type Model = { shape: Shape; d: number; k?: number; rows?: number; food?: "wingko" | "martabak" };
export type Scene =
  | { type: "models"; items: { model: Model; caption?: string }[]; sep?: string }
  /** Potongan pita/tali/benda: setiap baris adalah satu panjang pecahan campuran. */
  | { type: "bars"; items: { label: string; value: string; color: string }[]; unit: string }
  | { type: "apples"; total: number; groups: { n: number; label: string; color: string }[] }
  | { type: "houses"; legs: string[] };

export type Part =
  /** Jawaban pecahan; nilai yang senilai diterima. mixed berarti harus pecahan campuran dengan pembilang < penyebut. */
  | { kind: "frac"; label: string; answer: string; mixed?: boolean }
  | { kind: "sign"; left: string; right: string; answer: "<" | ">" | "=" }
  | { kind: "order"; label: string; options: string[]; answer: string[] }
  /** Mengubah pecahan campuran ke pecahan biasa: ( w × d ) + n / d. */
  | { kind: "convert"; mixed: string }
  /** Menyamakan penyebut dengan KPK. */
  | { kind: "equalize"; fracs: string[] }
  /** a op b = …/D op …/D = …/D (hasil boleh pecahan campuran). */
  | { kind: "chain"; a: string; op: Op; b: string; D: number }
  /** Cara memisahkan bilangan bulat dan pecahan. */
  | { kind: "split"; a: string; op: Op; b: string; D: number }
  /** Arsir bagian model; yang dinilai banyak bagian yang diarsir. */
  | { kind: "shade"; label: string; model: Model; answer: number }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type FQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Isian ---------- */
/** Hasil bersih chain/split: [bulat, pembilang] dengan penyebut D. */
export const resultMixed = (num: number, D: number) => [Math.floor(num / D), num % D] as const;
export const fieldCount = (p: Part) => {
  switch (p.kind) {
    case "frac": return 3;
    case "convert": return 5;
    case "equalize": return 1 + p.fracs.length;
    case "chain": return 4;
    case "split": return 6;
    case "tf": return p.statements.length;
    default: return 1;
  }
};
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "frac": { const f = fr(p.answer); return [f.w ? String(f.w) : "", String(f.n), String(f.d)]; }
    case "sign": return [p.answer];
    case "order": return [p.answer.join(";")];
    case "convert": { const f = fr(p.mixed); return [String(f.w), String(f.d), String(f.n), String(top(f)), String(f.d)]; }
    case "equalize": { const L = lcmAll(p.fracs.map(s => fr(s).d)); return [String(L), ...p.fracs.map(s => String((top(fr(s)) * L) / fr(s).d))]; }
    case "chain": { const x = fr(p.a), y = fr(p.b), r = opNum(p.a, p.op, p.b, p.D), [w, n] = resultMixed(r, p.D); return [String((top(x) * p.D) / x.d), String((top(y) * p.D) / y.d), w ? String(w) : "", String(n)]; }
    case "split": {
      const x = fr(p.a), y = fr(p.b), W = p.op === "+" ? x.w + y.w : x.w - y.w;
      const n1 = (x.n * p.D) / x.d, n2 = (y.n * p.D) / y.d, r = p.op === "+" ? n1 + n2 : n1 - n2, [c, n] = resultMixed(r, p.D);
      return [String(W), String(n1), String(n2), String(r), String(W + c), String(n)];
    }
    case "shade": return [Array.from({ length: p.answer }, (_, i) => i).join(",")];
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);
const intOr0 = (v: string) => (v.trim() === "" ? 0 : int(v));
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v), want = fields(p);
  switch (p.kind) {
    case "frac": {
      const got = { w: intOr0(x[0]), n: int(x[1]), d: int(x[2]) };
      if ([got.w, got.n, got.d].some(Number.isNaN) || got.d === 0 || !same(got, fr(p.answer))) return false;
      return !p.mixed || (got.n < got.d && got.n > 0);
    }
    case "convert": { const [a, b] = [int(x[0]), int(x[1])], f = fr(p.mixed); return ((a === f.w && b === f.d) || (a === f.d && b === f.w)) && int(x[2]) === f.n && int(x[3]) === top(f) && int(x[4]) === f.d; }
    case "chain": case "split": return want.every((w, i) => (w === "" ? intOr0(x[i]) === 0 : int(x[i]) === Number(w)));
    case "shade": { const xs = v ? v.split(",") : []; return xs.length === p.answer && new Set(xs).size === xs.length && xs.every(y => int(y) < p.model.d); }
    case "sign": case "order": case "choice": return v === want[0];
    case "tf": return x.join("|") === want.join("|");
    default: return want.every((w, i) => int(x[i]) === Number(w));
  }
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "frac": return !Number.isNaN(int(x[1])) && !Number.isNaN(int(x[2]));
    case "chain": return [0, 1, 3].every(i => !Number.isNaN(int(x[i])));
    case "sign": case "choice": case "shade": return Boolean(v);
    case "order": return v.split(";").length === p.options.length;
    case "tf": return x.every(Boolean);
    default: return x.every(y => !Number.isNaN(int(y)));
  }
}
export const correct = (q: FQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: FQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const show = (w: string, n: string, d: string) => `${w && w !== "0" ? `${w} ` : ""}${n || "…"}/${d || "…"}`;
export function formatAnswer(q: FQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => s || "…";
    switch (p.kind) {
      case "frac": return `${p.label} ${show(x[0], x[1], x[2])}`;
      case "sign": return `${p.left} ${d(v[i])} ${p.right}`;
      case "order": return v[i] ? v[i].split(";").join(", ") : "…";
      case "convert": return `${p.mixed} = (${d(x[0])} × ${d(x[1])}) + ${d(x[2])} per ${fr(p.mixed).d} = ${d(x[3])}/${d(x[4])}`;
      case "equalize": return `KPK ${d(x[0])}: ${p.fracs.map((f, k) => `${f} = ${d(x[k + 1])}/${x[0] || "…"}`).join(", ")}`;
      case "chain": return `${p.a} ${p.op === "+" ? "+" : "−"} ${p.b} = ${d(x[0])}/${p.D} ${p.op === "+" ? "+" : "−"} ${d(x[1])}/${p.D} = ${show(x[2], x[3], String(p.D))}`;
      case "split": return `bulat ${d(x[0])}; pecahan ${d(x[1])}/${p.D} ${p.op === "+" ? "+" : "−"} ${d(x[2])}/${p.D} = ${d(x[3])}/${p.D}; jadi ${show(x[4], x[5], String(p.D))}`;
      case "shade": return `${p.label}: ${v[i] ? v[i].split(",").length : 0} bagian diarsir`;
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return d(v[i]);
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: FQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): FQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const pie = (d: number, k: number, food?: "wingko" | "martabak"): Model => ({ shape: "pie", d, k, food });
const bar = (d: number, k: number): Model => ({ shape: "bar", d, k });
const models = (...items: { model: Model; caption?: string }[]): Scene => ({ type: "models", items });
const red = "#e5484d", green = "#5fb246", blue = "#2f86d6", orange = "#f08a24";

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Membandingkan dan Mengurutkan Pecahan", short: "Membandingkan",
    steps: [
      "Pecahan terdiri atas pembilang (di atas) dan penyebut (di bawah). Pecahan campuran memiliki bilangan bulat dan pecahan, misalnya 2 3/4.",
      "Ubah pecahan campuran menjadi pecahan biasa: 2 3/4 = (2 × 4) + 3 per 4 = 11/4.",
      "Bandingkan dengan menyamakan penyebut memakai KPK, lalu lihat pembilangnya. Pembilang lebih besar berarti pecahan lebih besar.",
      "Pada garis bilangan, makin ke kanan nilainya makin besar. Untuk pecahan campuran, lihat bilangan bulatnya dulu.",
    ],
    demo: "Atur dua pecahan. Bandingkan arsirannya, lihat letaknya pada garis bilangan, lalu ketuk Samakan penyebut.",
  },
  {
    code: "B", title: "Penjumlahan Bilangan Pecahan", short: "Penjumlahan",
    steps: [
      "Syarat menjumlahkan pecahan: penyebutnya harus sama. Jika sudah sama, jumlahkan pembilangnya, penyebutnya tetap. 2/8 + 1/8 = 3/8.",
      "Jika penyebut berbeda, samakan dulu dengan KPK. 1/2 + 1/3 = 3/6 + 2/6 = 5/6.",
      "Pecahan campuran: ubah ke pecahan biasa, atau pisahkan bilangan bulat dan pecahannya lalu jumlahkan masing-masing.",
      "Jika hasilnya lebih dari 1 utuh, ubah menjadi pecahan campuran. 7/6 = 1 1/6.",
    ],
    demo: "Atur dua pecahan. Lihat keduanya dipotong menjadi bagian yang sama besar, lalu digabung dalam satu pita.",
  },
  {
    code: "C", title: "Pengurangan Bilangan Pecahan", short: "Pengurangan",
    steps: [
      "Syarat mengurangkan pecahan: penyebutnya harus sama. Kurangkan pembilangnya, penyebutnya tetap. 2/3 − 1/3 = 1/3.",
      "Jika penyebut berbeda, samakan dulu dengan KPK. 2/3 − 1/2 = 4/6 − 3/6 = 1/6.",
      "Pecahan campuran: ubah ke pecahan biasa, atau kurangkan bilangan bulat dengan bilangan bulat dan pecahan dengan pecahan.",
      "Jika pecahan yang dikurangi lebih kecil, ubah dulu ke pecahan biasa. 2 1/4 − 1 3/4 = 9/4 − 7/4 = 2/4.",
    ],
    demo: "Atur dua pecahan. Bagian yang diambil dicoret pada pita dengan penyebut yang sama, sisanya adalah hasil pengurangan.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: FQuestion[][] = [
  [
    q(0, "Amati dan bandingkan kedua potong wingko berikut. Tuliskan pecahannya, lalu beri tanda <, >, atau =.", [{ kind: "frac", label: "Gambar kiri", answer: "1/2" }, { kind: "sign", left: "1/2", right: "1/3", answer: ">" }, { kind: "frac", label: "Gambar kanan", answer: "1/3" }],
      "Wingko kiri dibagi 2, diambil 1: 1/2. Wingko kanan dibagi 3, diambil 1: 1/3. Satu dari dua bagian lebih besar, jadi 1/2 > 1/3.", { scene: models({ model: pie(2, 1, "wingko"), caption: "Kiri" }, { model: pie(3, 1, "wingko"), caption: "Kanan" }) }),
    q(0, "Ubahlah pecahan campuran berikut menjadi pecahan biasa.", [{ kind: "convert", mixed: "2 3/4" }], "2 3/4 = (2 × 4) + 3 per 4 = 11/4."),
    q(0, "Samakan penyebut pecahan berikut dengan KPK, lalu urutkan dari yang terbesar.", [{ kind: "equalize", fracs: ["3/4", "1/2", "5/8"] }, { kind: "order", label: "Urutan dari yang terbesar", options: ["3/4", "1/2", "5/8"], answer: ["3/4", "5/8", "1/2"] }],
      "KPK dari 4, 2, dan 8 adalah 8. 3/4 = 6/8, 1/2 = 4/8, 5/8 = 5/8. Urutan dari yang terbesar: 3/4, 5/8, 1/2."),
    q(0, "Nisa memiliki tiga potong pita dengan panjang 1 3/5 m, 1 1/2 m, dan 1 3/4 m. Urutkan dari yang terpendek.", [{ kind: "order", label: "Urutan dari yang terpendek", options: ["1 3/5", "1 1/2", "1 3/4"], answer: ["1 1/2", "1 3/5", "1 3/4"] }],
      "Bilangan bulatnya sama, yaitu 1. Bandingkan pecahannya dengan KPK 20: 3/5 = 12/20, 1/2 = 10/20, 3/4 = 15/20. Urutannya 1 1/2, 1 3/5, 1 3/4.",
      { scene: { type: "bars", unit: "m", items: [{ label: "Pita A", value: "1 3/5", color: red }, { label: "Pita B", value: "1 1/2", color: green }, { label: "Pita C", value: "1 3/4", color: blue }] } }),
  ],
  [
    q(1, "Nisa membagi martabak menjadi 8 bagian. Lukas mendapat 1 bagian dan Komang mendapat 2 bagian. Arsirlah bagian yang diberikan kepada keduanya, lalu tuliskan pecahannya.", [{ kind: "shade", label: "Arsiran martabak Lukas dan Komang", model: pie(8, 0, "martabak"), answer: 3 }, { kind: "frac", label: "Jumlah bagian =", answer: "3/8" }],
      "Lukas 1/8 dan Komang 2/8. Penyebutnya sama, jumlahkan pembilangnya: 1/8 + 2/8 = 3/8."),
    q(1, "Hitunglah penjumlahan pecahan berikut.", [{ kind: "chain", a: "2/9", op: "+", b: "5/9", D: 9 }], "Penyebut sudah sama. 2 + 5 = 7, jadi 2/9 + 5/9 = 7/9."),
    q(1, "Hitunglah penjumlahan pecahan berikut dengan menyamakan penyebut.", [{ kind: "chain", a: "1/3", op: "+", b: "1/4", D: 12 }], "KPK dari 3 dan 4 adalah 12. 1/3 = 4/12 dan 1/4 = 3/12. 4/12 + 3/12 = 7/12."),
    q(1, "Joko membeli 1 1/2 kg gula jawa dan 2 1/3 kg tepung. Hitunglah berat seluruh belanjaan dengan memisahkan bilangan bulat dan pecahannya.", [{ kind: "split", a: "1 1/2", op: "+", b: "2 1/3", D: 6 }],
      "Bilangan bulat: 1 + 2 = 3. Pecahan: 1/2 + 1/3 = 3/6 + 2/6 = 5/6. Gabungkan: 3 5/6 kg."),
  ],
  [
    q(2, "Lukas harus melukis 4/5 bagian kertas. Ia sudah melukis 2/5 bagian. Arsirlah bagian yang belum dilukis, lalu tuliskan pecahannya.", [{ kind: "shade", label: "Arsiran bagian yang belum dilukis", model: bar(5, 0), answer: 2 }, { kind: "frac", label: "Bagian yang belum dilukis =", answer: "2/5" }],
      "Penyebut sama, kurangkan pembilangnya: 4/5 − 2/5 = 2/5."),
    q(2, "Asep mempunyai 10 apel. Ia memberikan 7 apel kepada Lukas. Lukas memberikan 2 apel kepada Yohana. Tuliskan pecahan apel yang masih dimiliki Lukas dari seluruh apel.", [{ kind: "chain", a: "7/10", op: "-", b: "2/10", D: 10 }],
      "Apel yang diberikan Asep 7/10, lalu Lukas memberi 2/10. 7/10 − 2/10 = 5/10.",
      { scene: { type: "apples", total: 10, groups: [{ n: 5, label: "Sisa apel Lukas", color: "#e5484d" }, { n: 2, label: "Diberikan ke Yohana", color: "#f2a5a7" }, { n: 3, label: "Apel Asep", color: "#9ccf6b" }] } }),
    q(2, "Hitunglah pengurangan pecahan berikut dengan menyamakan penyebut.", [{ kind: "chain", a: "2/3", op: "-", b: "1/2", D: 6 }], "KPK dari 3 dan 2 adalah 6. 2/3 = 4/6 dan 1/2 = 3/6. 4/6 − 3/6 = 1/6."),
    q(2, "Komang memerlukan tali 5 3/4 m. Ia sudah memiliki 2 1/3 m. Hitunglah panjang tali yang harus dibeli dengan memisahkan bilangan bulat dan pecahannya.", [{ kind: "split", a: "5 3/4", op: "-", b: "2 1/3", D: 12 }],
      "Bilangan bulat: 5 − 2 = 3. Pecahan: 3/4 − 1/3 = 9/12 − 4/12 = 5/12. Jadi 3 5/12 m."),
  ],
];

/* ---------- Evaluasi: 24 soal, A, B, C bergantian ---------- */
export const assessment: FQuestion[] = [
  // Sedang
  q(0, "Bandingkan kedua gambar berikut. Tuliskan pecahan bagian yang diarsir, lalu isilah dengan tanda <, =, atau >.", [{ kind: "frac", label: "Gambar kiri", answer: "7/12" }, { kind: "sign", left: "7/12", right: "10/12", answer: "<" }, { kind: "frac", label: "Gambar kanan", answer: "10/12" }],
    "Kedua lingkaran dibagi 12. Kiri diarsir 7, kanan diarsir 10. Penyebut sama, 7 < 10, jadi 7/12 < 10/12.", { level: "Sedang", scene: models({ model: pie(12, 7), caption: "Kiri" }, { model: pie(12, 10), caption: "Kanan" }) }),
  q(1, "Hitunglah penjumlahan pecahan berikut.", [{ kind: "chain", a: "3/8", op: "+", b: "4/8", D: 8 }], "Penyebut sama, jumlahkan pembilangnya: 3 + 4 = 7. Hasilnya 7/8.", { level: "Sedang" }),
  q(2, "Hitunglah pengurangan pecahan berikut.", [{ kind: "chain", a: "5/7", op: "-", b: "2/7", D: 7 }], "Penyebut sama, kurangkan pembilangnya: 5 − 2 = 3. Hasilnya 3/7.", { level: "Sedang" }),
  q(0, "Ubahlah pecahan campuran berikut menjadi pecahan biasa.", [{ kind: "convert", mixed: "3 2/5" }], "3 2/5 = (3 × 5) + 2 per 5 = 17/5.", { level: "Sedang" }),
  q(1, "Lukas memiliki 12 penghapus. Ia memberikan 3 penghapus kepada Asep dan 4 penghapus kepada Yohana. Arsirlah penghapus yang diberikan, lalu tuliskan pecahannya dari seluruh penghapus.", [{ kind: "shade", label: "Arsiran penghapus yang diberikan", model: { shape: "dots", d: 12, k: 0, rows: 2 }, answer: 7 }, { kind: "frac", label: "Penghapus yang diberikan =", answer: "7/12" }],
    "Asep 3/12 dan Yohana 4/12. 3/12 + 4/12 = 7/12.", { level: "Sedang" }),
  q(2, "Yohana harus mewarnai 5/6 bagian kertas. Ia sudah mewarnai 2/6 bagian. Arsirlah bagian yang belum diwarnai, lalu tuliskan pecahannya.", [{ kind: "shade", label: "Arsiran bagian yang belum diwarnai", model: bar(6, 0), answer: 3 }, { kind: "frac", label: "Bagian yang belum diwarnai =", answer: "3/6" }],
    "5/6 − 2/6 = 3/6. Hasil ini senilai dengan 1/2.", { level: "Sedang" }),
  q(0, "Bandingkan bagian yang diarsir pada kedua segitiga berikut. Tuliskan pecahannya, lalu beri tanda <, =, atau >.", [{ kind: "frac", label: "Segitiga kiri", answer: "3/4" }, { kind: "sign", left: "3/4", right: "6/9", answer: ">" }, { kind: "frac", label: "Segitiga kanan", answer: "6/9" }],
    "Kiri 3 dari 4 bagian = 3/4. Kanan 6 dari 9 bagian = 6/9. Samakan penyebut dengan KPK 36: 27/36 dan 24/36. Jadi 3/4 > 6/9.",
    { level: "Sedang", scene: models({ model: { shape: "tri", d: 4, k: 3 }, caption: "Kiri" }, { model: { shape: "tri", d: 9, k: 6 }, caption: "Kanan" }) }),
  q(1, "Lukas mempunyai 1/2 bagian wingko, sedangkan Komang mempunyai 1/3 bagian wingko. Jika digabungkan, berapa bagian wingko seluruhnya?", [{ kind: "chain", a: "1/2", op: "+", b: "1/3", D: 6 }],
    "KPK dari 2 dan 3 adalah 6. 1/2 = 3/6 dan 1/3 = 2/6. 3/6 + 2/6 = 5/6.", { level: "Sedang", scene: models({ model: pie(2, 1, "wingko"), caption: "Lukas" }, { model: pie(3, 1, "wingko"), caption: "Komang" }) }),
  // Menantang
  q(2, "Yohana mendapat tugas melukis 3/4 bagian kertas. Ia baru melukis 1/3 bagian. Berapa bagian kertas yang belum dilukis?", [{ kind: "chain", a: "3/4", op: "-", b: "1/3", D: 12 }],
    "KPK dari 4 dan 3 adalah 12. 3/4 = 9/12 dan 1/3 = 4/12. 9/12 − 4/12 = 5/12.", { level: "Menantang" }),
  q(0, "Hasil tiga lompatan Yohana adalah 2 2/3 m, 2 3/4 m, dan 2 5/8 m. Urutkan dari lompatan yang terjauh.", [{ kind: "order", label: "Urutan dari yang terjauh", options: ["2 2/3", "2 3/4", "2 5/8"], answer: ["2 3/4", "2 2/3", "2 5/8"] }],
    "Bilangan bulatnya sama. KPK dari 3, 4, 8 adalah 24: 2/3 = 16/24, 3/4 = 18/24, 5/8 = 15/24. Urutan dari yang terjauh: 2 3/4, 2 2/3, 2 5/8.", { level: "Menantang" }),
  q(1, "Joko membeli 2 1/4 kg gula jawa dan 1 2/3 kg tepung. Hitunglah berat seluruh belanjaan dengan memisahkan bilangan bulat dan pecahannya.", [{ kind: "split", a: "2 1/4", op: "+", b: "1 2/3", D: 12 }],
    "Bilangan bulat: 2 + 1 = 3. Pecahan: 1/4 + 2/3 = 3/12 + 8/12 = 11/12. Jadi 3 11/12 kg.", { level: "Menantang" }),
  q(2, "Jarak rumah Asep ke sekolah 5 2/3 km. Pagi ini Asep sudah menempuh 2 1/4 km. Berapa km lagi yang harus ditempuh?", [{ kind: "split", a: "5 2/3", op: "-", b: "2 1/4", D: 12 }],
    "Bilangan bulat: 5 − 2 = 3. Pecahan: 2/3 − 1/4 = 8/12 − 3/12 = 5/12. Jadi 3 5/12 km.", { level: "Menantang" }),
  q(0, "Samakan penyebut kedua pecahan berikut dengan KPK, lalu bandingkan.", [{ kind: "equalize", fracs: ["3/8", "2/5"] }, { kind: "sign", left: "3/8", right: "2/5", answer: "<" }],
    "KPK dari 8 dan 5 adalah 40. 3/8 = 15/40 dan 2/5 = 16/40. Karena 15 < 16, maka 3/8 < 2/5.", { level: "Menantang" }),
  q(1, "Penduduk Kabupaten A adalah 1/4 dari penduduk sebuah provinsi, sedangkan penduduk Kabupaten B adalah 1/6 dari penduduk provinsi itu. Berapa bagian jumlah penduduk kedua kabupaten?", [{ kind: "frac", label: "Jumlah penduduk =", answer: "5/12" }],
    "KPK dari 4 dan 6 adalah 12. 1/4 = 3/12 dan 1/6 = 2/12. 3/12 + 2/12 = 5/12 bagian.", { level: "Menantang" }),
  q(2, "Dalam percakapan sehari-hari, bahasa Indonesia dipakai 1/8 bagian dan bahasa daerah dipakai 3/10 bagian. Berapa bagian selisih keduanya?", [{ kind: "frac", label: "Selisih =", answer: "7/40" }],
    "KPK dari 8 dan 10 adalah 40. 3/10 = 12/40 dan 1/8 = 5/40. Selisihnya 12/40 − 5/40 = 7/40.", { level: "Menantang" }),
  q(0, "Pecahan manakah yang paling besar?", [{ kind: "choice", label: "Pecahan terbesar", options: ["5/6", "7/9", "3/4", "11/12"], answer: "11/12" }],
    "KPK dari 6, 9, 4, dan 12 adalah 36: 5/6 = 30/36, 7/9 = 28/36, 3/4 = 27/36, 11/12 = 33/36. Yang paling besar 11/12.", { level: "Menantang" }),
  q(1, "Tentukan benar atau salah pernyataan berikut.", [{ kind: "tf", statements: [
    { text: "Hasil dari 4/7 + 2/7 = 6/7.", answer: true },
    { text: "Hasil dari 2/5 + 1/3 = 3/8.", answer: false },
    { text: "Operasi penjumlahan yang hasilnya 1 7/12 adalah 1/4 + 1 1/3.", answer: true },
  ] }], "4/7 + 2/7 = 6/7 benar. 2/5 + 1/3 = 6/15 + 5/15 = 11/15, bukan 3/8; penyebut tidak boleh dijumlahkan. 1/4 + 1 1/3 = 3/12 + 1 4/12 = 1 7/12 benar.", { level: "Menantang" }),
  // Sangat menantang
  q(2, "Persediaan gula jawa Ibu tinggal 2 1/4 kg. Ibu memakai 1 5/6 kg untuk membuat wajik. Berapa kg sisa gula jawa Ibu?", [{ kind: "frac", label: "Sisa gula jawa =", answer: "5/12" }],
    "Ubah ke pecahan biasa: 2 1/4 = 9/4 = 27/12 dan 1 5/6 = 11/6 = 22/12. 27/12 − 22/12 = 5/12 kg.", { level: "Sangat menantang" }),
  q(0, "Urutkan pecahan berikut dari yang terkecil.", [{ kind: "order", label: "Urutan dari yang terkecil", options: ["2/3", "5/8", "3/4", "7/12"], answer: ["7/12", "5/8", "2/3", "3/4"] }],
    "KPK dari 3, 8, 4, dan 12 adalah 24: 2/3 = 16/24, 5/8 = 15/24, 3/4 = 18/24, 7/12 = 14/24. Urutannya 7/12, 5/8, 2/3, 3/4.", { level: "Sangat menantang" }),
  q(1, "Rumah Komang berada di antara rumah Yohana dan rumah Lukas. Jarak rumah Yohana ke rumah Komang 1 1/4 km, lebar rumah Komang 1/100 km, dan jarak rumah Komang ke rumah Lukas 2 2/5 km. Berapa jarak rumah Yohana ke rumah Lukas? Tulis dalam pecahan campuran paling sederhana.", [{ kind: "frac", label: "Jarak =", answer: "3 33/50", mixed: true }],
    "Bilangan bulat: 1 + 2 = 3. Pecahan dengan KPK 100: 1/4 = 25/100, 1/100, 2/5 = 40/100. 25 + 1 + 40 = 66/100 = 33/50. Jadi 3 33/50 km.",
    { level: "Sangat menantang", scene: { type: "houses", legs: ["1 1/4", "1/100", "2 2/5"] } }),
  q(2, "Tentukan benar atau salah pernyataan berikut.", [{ kind: "tf", statements: [
    { text: "Hasil pengurangan 1 1/6 − 1/2 adalah 2/3.", answer: true },
    { text: "Hasil dari 5 − 2 1/4 = 3 3/4.", answer: false },
    { text: "Hasil dari 3 1/4 − 1 5/8 = 1 5/8.", answer: true },
  ] }], "1 1/6 − 1/2 = 7/6 − 3/6 = 4/6 = 2/3 benar. 5 − 2 1/4 = 20/4 − 9/4 = 11/4 = 2 3/4, jadi salah. 3 1/4 − 1 5/8 = 26/8 − 13/8 = 13/8 = 1 5/8 benar.", { level: "Sangat menantang" }),
  q(0, "Pecahan manakah yang terletak di antara 2 1/3 dan 2 1/2 pada garis bilangan?", [{ kind: "choice", label: "Pecahan di antaranya", options: ["2 2/5", "2 1/5", "2 3/5", "2 1/4"], answer: "2 2/5" }],
    "Samakan penyebut dengan KPK 30: 1/3 = 10/30, 1/2 = 15/30. 2/5 = 12/30 terletak di antaranya. 1/5 dan 1/4 lebih kecil dari 1/3, sedangkan 3/5 = 18/30 lebih besar dari 1/2.", { level: "Sangat menantang" }),
  q(1, "Nisa membeli 1 3/4 kg tepung, lalu membeli 2 2/3 kg lagi. Hitunglah berat seluruh tepung dengan memisahkan bilangan bulat dan pecahannya.", [{ kind: "split", a: "1 3/4", op: "+", b: "2 2/3", D: 12 }],
    "Bilangan bulat: 1 + 2 = 3. Pecahan: 3/4 + 2/3 = 9/12 + 8/12 = 17/12 = 1 5/12. Gabungkan: 3 + 1 5/12 = 4 5/12 kg.", { level: "Sangat menantang" }),
  q(2, "Untuk membuat jemuran, Komang memerlukan tali sepanjang 6 1/3 m. Ia sudah memiliki tali 2 3/4 m. Berapa meter tali yang harus dibeli? Tulis dalam pecahan campuran.", [{ kind: "frac", label: "Tali yang dibeli =", answer: "3 7/12", mixed: true }],
    "Ubah ke pecahan biasa: 6 1/3 = 19/3 = 76/12 dan 2 3/4 = 11/4 = 33/12. 76/12 − 33/12 = 43/12 = 3 7/12 m.",
    { level: "Sangat menantang", scene: { type: "bars", unit: "m", items: [{ label: "Diperlukan", value: "6 1/3", color: orange }, { label: "Sudah ada", value: "2 3/4", color: green }] } }),
];
