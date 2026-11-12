import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 5 Bab 4 - Keliling Bangun Datar (Buku Matematika SD/MI Kelas V, hlm. 105-130).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Pt = [number, number];

/**
 * Bangun datar: titik sudut berurutan, panjang setiap sisi (sisi i dari pts[i] ke pts[i+1]),
 * dan tampilan label: "show" angka, "?" belum diketahui, "hide" kosong / diukur, "none" tanpa label.
 */
export type ShapeSpec = {
  pts: Pt[]; lens: number[]; unit: string;
  show: ("show" | "?" | "hide" | "none")[];
  ticks?: number[];
  /** Garis putus-putus di dalam bangun (bukan sisi luar). */
  inner?: { a: Pt; b: Pt; label?: string }[];
  /** Persegi panjang putus-putus yang melingkupi bangun. */
  frame?: boolean;
  names?: string[];
};

/* ---------- Pembuat bangun ---------- */
const dist = (p: Pt, q: Pt) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const all = (n: number, v: "show" | "?" | "hide" | "none" = "show") => Array.from({ length: n }, () => v);
const spec = (pts: Pt[], lens: number[], unit: string, show?: ShapeSpec["show"], extra: Partial<ShapeSpec> = {}): ShapeSpec => ({ pts, lens, unit, show: show ?? all(pts.length), ...extra });
export function triangle(a: number, b: number, c: number, unit = "cm", extra: Partial<ShapeSpec> = {}, show?: ShapeSpec["show"]): ShapeSpec {
  // Sisi alas a, sisi kanan b, sisi kiri c.
  const x = (a * a + c * c - b * b) / (2 * a), y = Math.sqrt(Math.max(c * c - x * x, 0.01));
  return spec([[0, y], [a, y], [x, 0]], [a, b, c], unit, show, extra);
}
export const rect = (p: number, l: number, unit = "cm", show?: ShapeSpec["show"], extra: Partial<ShapeSpec> = {}) => spec([[0, 0], [p, 0], [p, l], [0, l]], [p, l, p, l], unit, show, extra);
export function parallelogram(a: number, b: number, unit = "cm", show?: ShapeSpec["show"]) {
  const dx = b * 0.4, dy = b * Math.sqrt(1 - 0.16);
  return spec([[dx, 0], [dx + a, 0], [a, dy], [0, dy]], [a, b, a, b], unit, show, { ticks: [1, 2, 1, 2] });
}
export function kite(a: number, b: number, unit = "cm", show?: ShapeSpec["show"]) {
  const w = Math.min(a, b) * 0.75, t = Math.sqrt(a * a - w * w), d = Math.sqrt(b * b - w * w);
  return spec([[0, 0], [w, t], [0, t + d], [-w, t]], [a, b, b, a], unit, show, { ticks: a === b ? [1, 1, 1, 1] : [1, 2, 2, 1], inner: [{ a: [0, 0], b: [0, t + d] }, { a: [-w, t], b: [w, t] }] });
}
export function trapezoid(top: number, bottom: number, left: number, right: number, unit = "cm", show?: ShapeSpec["show"]) {
  const h = Math.sqrt(Math.max(left * left - ((bottom - top) / 2) ** 2, 1)), off = (bottom - top) / 2;
  return spec([[off, 0], [off + top, 0], [bottom, h], [0, h]], [top, right, bottom, left], unit, show);
}
export function regular(n: number, s: number, unit = "cm", show?: ShapeSpec["show"]) {
  const r = s / (2 * Math.sin(Math.PI / n));
  const pts = Array.from({ length: n }, (_, i): Pt => { const a = -Math.PI / 2 - Math.PI / n + (i * 2 * Math.PI) / n; return [r * Math.cos(a), r * Math.sin(a)]; });
  return spec(pts, all(n).map(() => s), unit, show ?? all(n, "none").map((v, i) => (i === 0 ? "show" : v)), { ticks: all(n).map(() => 1) });
}
/** Bangun gabungan siku-siku; panjang sisi dihitung dari titiknya. */
export function ortho(pts: Pt[], show: ShapeSpec["show"], unit = "m", extra: Partial<ShapeSpec> = {}): ShapeSpec {
  return spec(pts, pts.map((p, i) => dist(p, pts[(i + 1) % pts.length])), unit, show, extra);
}
export const perimeter = (s: ShapeSpec) => s.lens.reduce((a, b) => a + b, 0);

export type Scene =
  | { type: "shape"; shape: ShapeSpec; measure?: boolean }
  | { type: "shapes"; items: { shape: ShapeSpec; caption: string }[] }
  | { type: "field"; w: number; h: number; unit: string };

export type Part =
  /** Keliling = … + … + … = … (urutan sisi bebas). */
  | { kind: "sum"; sides: number[]; unit: string }
  /** Keliling = … × … = … (urutan bebas). */
  | { kind: "mult"; n: number; s: number; unit: string }
  /** Keliling = (2 × …) + (2 × …) = … + … = … */
  | { kind: "rectf"; a: number; b: number; unit: string }
  | { kind: "number"; label: string; answer: number; unit?: string }
  /** Mengisi panjang sisi yang belum diketahui. */
  | { kind: "fill"; items: { label: string; answer: number; side?: number }[]; unit: string }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  /** Tabel bangun beraturan: banyak sisi dan Keliling = … × panjang sisi. */
  | { kind: "table"; rows: { name: string; n: number }[] };

export type PQuestion = Question & { topic: 0 | 1 | 2 | 3 | 4; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Isian ---------- */
export const fieldCount = (p: Part) => {
  switch (p.kind) {
    case "sum": return p.sides.length + 1;
    case "mult": return 3;
    case "rectf": return 5;
    case "fill": return p.items.length;
    case "table": return p.rows.length * 2;
    default: return 1;
  }
};
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "sum": return [...p.sides.map(String), String(p.sides.reduce((a, b) => a + b, 0))];
    case "mult": return [String(p.n), String(p.s), String(p.n * p.s)];
    case "rectf": return [String(p.a), String(p.b), String(2 * p.a), String(2 * p.b), String(2 * (p.a + p.b))];
    case "number": return [String(p.answer)];
    case "fill": return p.items.map(it => String(it.answer));
    case "choice": return [p.answer];
    case "table": return p.rows.flatMap(r => [String(r.n), String(r.n)]);
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);
const sortJoin = (xs: number[]) => [...xs].sort((a, b) => a - b).join(",");
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v).map(int);
  switch (p.kind) {
    case "sum": { const k = p.sides.length; return sortJoin(x.slice(0, k)) === sortJoin(p.sides) && x[k] === p.sides.reduce((a, b) => a + b, 0); }
    case "mult": return sortJoin(x.slice(0, 2)) === sortJoin([p.n, p.s]) && x[2] === p.n * p.s;
    case "rectf": { const ok = (a: number, b: number) => x[0] === a && x[1] === b && x[2] === 2 * a && x[3] === 2 * b; return (ok(p.a, p.b) || ok(p.b, p.a)) && x[4] === 2 * (p.a + p.b); }
    case "choice": return v === p.answer;
    default: return fields(p).every((w, i) => x[i] === Number(w));
  }
}
const partReady = (p: Part, v: string) => (p.kind === "choice" ? Boolean(v) : cells(p, v).every(y => !Number.isNaN(int(y))));
export const correct = (q: PQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: PQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: PQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => s || "…";
    switch (p.kind) {
      case "sum": { const k = p.sides.length; return `Keliling = ${x.slice(0, k).map(d).join(" + ")} = ${d(x[k])} ${p.unit}`; }
      case "mult": return `Keliling = ${d(x[0])} × ${d(x[1])} = ${d(x[2])} ${p.unit}`;
      case "rectf": return `Keliling = (2 × ${d(x[0])}) + (2 × ${d(x[1])}) = ${d(x[2])} + ${d(x[3])} = ${d(x[4])} ${p.unit}`;
      case "number": return `${p.label} ${d(x[0])}${p.unit ? ` ${p.unit}` : ""}`;
      case "fill": return p.items.map((it, k) => `${it.label} = ${d(x[k])} ${p.unit}`).join(", ");
      case "table": return p.rows.map((r, k) => `${r.name}: ${d(x[2 * k])} sisi, keliling = ${d(x[2 * k + 1])} × sisi`).join("; ");
      default: return d(v[i]);
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: PQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): PQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const one = (shape: ShapeSpec, measure = false): Scene => ({ type: "shape", shape, measure });
const sumOf = (s: ShapeSpec): Part => ({ kind: "sum", sides: s.lens, unit: s.unit });
export const shapeNames = ["Persegi panjang", "Persegi", "Jajargenjang", "Layang-layang", "Belah ketupat", "Trapesium", "Segitiga sama sisi", "Segitiga sama kaki", "Segitiga sembarang"];

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Apakah Keliling Bangun Datar Itu?", short: "Pengertian keliling",
    steps: [
      "Berlari mengelilingi lapangan berarti berangkat dari satu titik, menyusuri semua tepiannya, lalu kembali ke titik semula.",
      "Jarak yang ditempuh sama dengan jumlah panjang semua sisi lapangan: 100 + 50 + 100 + 50 = 300 m.",
      "Keliling bangun datar adalah jumlah panjang sisi-sisi bangun datar tersebut.",
      "Jika panjang sisi belum diketahui, ukur dulu setiap sisi dengan penggaris, lalu jumlahkan.",
    ],
    demo: "Atur panjang dan lebar lapangan, lalu ketuk Lari ke sudut berikutnya. Jarak lari bertambah setiap melewati satu sisi.",
  },
  {
    code: "B", title: "Keliling Segitiga", short: "Segitiga",
    steps: [
      "Keliling segitiga = sisi 1 + sisi 2 + sisi 3.",
      "Segitiga sama sisi memiliki tiga sisi sama panjang (tanda garis sama). Keliling = 3 × panjang sisi.",
      "Segitiga sama kaki memiliki dua sisi sama panjang. Keliling = (2 × kaki) + alas.",
      "Segitiga sembarang tidak memiliki sisi yang sama panjang. Jumlahkan ketiga sisinya.",
    ],
    demo: "Pilih jenis segitiga dan atur panjang sisinya. Perhatikan tanda sisi yang sama panjang dan cara menghitung kelilingnya.",
  },
  {
    code: "C", title: "Keliling Segi Empat", short: "Segi empat",
    steps: [
      "Persegi panjang: sisi yang berhadapan sama panjang. Keliling = (2 × panjang) + (2 × lebar).",
      "Persegi: keempat sisinya sama panjang. Keliling = 4 × panjang sisi.",
      "Jajargenjang, layang-layang, dan belah ketupat juga punya sisi yang sama panjang. Cari pasangan sisi yang sama, lalu kalikan.",
      "Trapesium dan segi empat sembarang: jumlahkan panjang keempat sisinya.",
    ],
    demo: "Pilih bangun segi empat dan ubah ukurannya. Rumus keliling berubah sesuai sisi-sisi yang sama panjang.",
  },
  {
    code: "D", title: "Keliling Segi Banyak", short: "Segi banyak",
    steps: [
      "Segi banyak beraturan memiliki semua sisi sama panjang: segi lima, segi enam, segi delapan beraturan.",
      "Keliling segi lima beraturan = 5 × panjang sisi. Segi enam = 6 × panjang sisi. Segi delapan = 8 × panjang sisi.",
      "Jadi keliling segi banyak beraturan = banyak sisi × panjang sisi.",
      "Jika sisi-sisinya tidak sama panjang, jumlahkan semua panjang sisinya.",
    ],
    demo: "Atur banyak sisi dan panjang sisinya. Bandingkan cara menjumlahkan dengan cara mengalikan.",
  },
  {
    code: "E", title: "Keliling Bangun Gabungan", short: "Bangun gabungan",
    steps: [
      "Bangun gabungan tersusun dari beberapa bangun datar, misalnya denah rumah. Hanya sisi terluar yang dihitung sebagai keliling.",
      "Cari dulu panjang sisi yang belum diketahui dari sisi di seberangnya. Misalnya sisi kanan = tinggi seluruhnya − sisi yang sudah diketahui.",
      "Cara Komang: pada bangun siku-siku seperti tangga, geser sisi-sisi ke luar sehingga membentuk persegi panjang yang melingkupi. Kelilingnya sama.",
      "Garis di dalam bangun (garis putus-putus) bukan sisi terluar, jadi tidak ikut dihitung.",
    ],
    demo: "Ubah ukuran potongan sudut pada bangun gabungan, lalu ketuk Geser sisi ke luar. Kelilingnya tetap sama dengan persegi panjang yang melingkupi.",
  },
] as const;

/* ---------- Bangun-bangun soal ---------- */
const lShape = ortho([[0, 0], [5, 0], [5, 2], [8, 2], [8, 6], [0, 6]], ["show", "show", "?", "?", "show", "show"]);
const pShape2 = ortho([[0, 0], [7, 0], [7, 3], [10, 3], [10, 8], [0, 8]], ["show", "show", "show", "?", "show", "show"], "m", { frame: true });
const crossShape = ortho([[2, 0], [8, 0], [8, 3], [12, 3], [12, 7], [8, 7], [8, 12], [2, 12], [2, 7], [0, 7], [0, 3], [2, 3]],
  ["show", "show", "show", "show", "?", "show", "show", "?", "show", "show", "?", "?"], "m", { frame: true });
const stairs = ortho([[0, 0], [4, 0], [4, 2], [7, 2], [7, 5], [10, 5], [10, 7], [0, 7]], ["?", "?", "?", "?", "?", "?", "show", "show"], "m", { frame: true });
const uShape = ortho([[0, 0], [3, 0], [3, 4], [6, 4], [6, 0], [9, 0], [9, 6], [0, 6]], ["show", "show", "?", "?", "show", "show", "show", "show"]);
const notch = ortho([[0, 0], [8, 0], [8, 3], [11, 3], [11, 8], [4, 8], [4, 12], [0, 12]], ["show", "show", "show", "?", "show", "?", "?", "show"], "cm", { frame: true });
const notch2 = ortho([[0, 0], [6, 0], [6, 2], [9, 2], [9, 7], [0, 7]], ["show", "?", "?", "show", "show", "show"], "m");
const twoTri = { ...spec([[0, 6], [8, 0], [16, 3], [15, 12]], [10, 9, 9, 17], "cm", all(4)), inner: [{ a: [0, 6] as Pt, b: [16, 3] as Pt, label: "15 cm" }], ticks: [0, 1, 1, 0] };

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: PQuestion[][] = [
  [
    q(0, "Asep berlari mengelilingi lapangan berukuran 90 m × 45 m dan kembali ke titik start. Hitunglah jarak larinya.", [{ kind: "sum", sides: [90, 45, 90, 45], unit: "m" }],
      "Mengelilingi lapangan berarti melewati keempat sisinya: 90 + 45 + 90 + 45 = 270 m.", { scene: { type: "field", w: 90, h: 45, unit: "m" } }),
    q(0, "Ukurlah sisi-sisi bangun berikut dengan mengetuk setiap sisinya, lalu hitung kelilingnya.", [sumOf(kite(6, 6, "cm"))],
      "Keempat sisi belah ketupat 6 cm. Keliling = 6 + 6 + 6 + 6 = 24 cm.", { scene: one(kite(6, 6, "cm", all(4, "hide")), true) }),
    q(0, "Pak Guru meminta anak berlari 300 m lalu kembali ke tempat semula untuk melapor. Lintasan siapa yang sama dengan keliling lapangan?", [{ kind: "choice", label: "Lintasan", options: ["Nisa: bolak-balik sisi panjang", "Lukas: bolak-balik sisi pendek", "Asep: menyusuri semua tepian", "Yohana: lewat tengah lapangan"], answer: "Asep: menyusuri semua tepian" }],
      "Keliling berarti menyusuri semua tepian lalu kembali ke titik semula. Hanya lintasan Asep yang begitu: 100 + 50 + 100 + 50 = 300 m.", { scene: { type: "field", w: 100, h: 50, unit: "m" } }),
    q(0, "Ukurlah sisi-sisi trapesium berikut, lalu hitung kelilingnya.", [sumOf(trapezoid(4, 6, 5, 5))],
      "Hasil pengukuran 4 cm, 5 cm, 6 cm, dan 5 cm. Keliling = 4 + 5 + 6 + 5 = 20 cm.", { scene: one(trapezoid(4, 6, 5, 5, "cm", all(4, "hide")), true) }),
  ],
  [
    q(1, "Hitunglah keliling segitiga berikut.", [sumOf(triangle(7, 4, 5))], "Keliling = 7 + 4 + 5 = 16 cm.", { scene: one(triangle(7, 4, 5)) }),
    q(1, "Segitiga sama sisi berikut panjang sisinya 6 cm. Hitunglah kelilingnya dengan perkalian.", [{ kind: "mult", n: 3, s: 6, unit: "cm" }],
      "Ketiga sisinya sama panjang. Keliling = 3 × 6 = 18 cm.", { scene: one(triangle(6, 6, 6, "cm", { ticks: [1, 1, 1] }, ["show", "none", "none"])) }),
    q(1, "Perhatikan segitiga berikut. Apa nama bangun datar ini? Lalu hitung kelilingnya.", [{ kind: "choice", label: "Nama bangun", options: ["Segitiga sama sisi", "Segitiga sama kaki", "Segitiga sembarang"], answer: "Segitiga sama kaki" }, sumOf(triangle(4, 6, 6))],
      "Dua sisinya sama panjang (6 cm), jadi segitiga sama kaki. Keliling = 4 + 6 + 6 = 16 cm.", { scene: one(triangle(4, 6, 6, "cm", { ticks: [0, 1, 1] })) }),
    q(1, "Keliling sebuah segitiga sama sisi adalah 27 cm. Berapa panjang sisinya?", [{ kind: "number", label: "Panjang sisi =", answer: 9, unit: "cm" }],
      "Keliling = 3 × sisi, jadi sisi = 27 : 3 = 9 cm."),
  ],
  [
    q(2, "Hitunglah keliling persegi panjang berikut.", [{ kind: "rectf", a: 7, b: 4, unit: "cm" }], "Keliling = (2 × 7) + (2 × 4) = 14 + 8 = 22 cm.", { scene: one(rect(7, 4, "cm", ["show", "show", "none", "none"])) }),
    q(2, "Hitunglah keliling persegi berikut.", [{ kind: "mult", n: 4, s: 5, unit: "cm" }], "Keempat sisi persegi sama panjang. Keliling = 4 × 5 = 20 cm.", { scene: one(rect(5, 5, "cm", ["none", "show", "none", "none"], { ticks: [1, 1, 1, 1] })) }),
    q(2, "Apa nama bangun datar berikut? Hitunglah kelilingnya.", [{ kind: "choice", label: "Nama bangun", options: ["Persegi panjang", "Jajargenjang", "Trapesium"], answer: "Jajargenjang" }, { kind: "rectf", a: 6, b: 4, unit: "cm" }],
      "Sisi yang berhadapan sejajar dan sama panjang tetapi miring, jadi jajargenjang. Keliling = (2 × 6) + (2 × 4) = 20 cm.", { scene: one(parallelogram(6, 4)) }),
    q(2, "Hitunglah keliling layang-layang berikut.", [{ kind: "rectf", a: 3, b: 5, unit: "cm" }],
      "Layang-layang memiliki dua pasang sisi yang sama panjang: 3 cm dan 5 cm. Keliling = (2 × 3) + (2 × 5) = 6 + 10 = 16 cm.", { scene: one(kite(3, 5, "cm", ["show", "show", "none", "none"])) }),
  ],
  [
    q(3, "Hitunglah keliling segi lima beraturan berikut.", [{ kind: "mult", n: 5, s: 4, unit: "cm" }], "Kelima sisinya sama panjang. Keliling = 5 × 4 = 20 cm.", { scene: one(regular(5, 4)) }),
    q(3, "Ukurlah salah satu sisi segi enam beraturan berikut dengan mengetuknya, lalu hitung kelilingnya.", [{ kind: "mult", n: 6, s: 7, unit: "cm" }],
      "Semua sisi 7 cm. Keliling = 6 × 7 = 42 cm.", { scene: one(regular(6, 7, "cm", all(6, "hide")), true) }),
    q(3, "Lengkapi tabel berikut.", [{ kind: "table", rows: [{ name: "Persegi", n: 4 }, { name: "Segi lima beraturan", n: 5 }, { name: "Segi enam beraturan", n: 6 }] }],
      "Banyak sisi sama dengan bilangan pengali: persegi 4 × sisi, segi lima 5 × sisi, segi enam 6 × sisi.",
      { scene: { type: "shapes", items: [{ shape: regular(4, 3, "cm", all(4, "none")), caption: "Persegi" }, { shape: regular(5, 3, "cm", all(5, "none")), caption: "Segi lima" }, { shape: regular(6, 3, "cm", all(6, "none")), caption: "Segi enam" }] } }),
    q(3, "Segi lima berikut sisi-sisinya tidak sama panjang. Hitunglah kelilingnya.", [{ kind: "sum", sides: [6, 4, 5, 4, 3], unit: "cm" }],
      "Jumlahkan semua sisinya: 6 + 4 + 5 + 4 + 3 = 22 cm.", { scene: one(spec([[0, 2], [6, 0], [9, 3], [6, 7], [1, 6]], [6, 4, 5, 4, 3], "cm")) }),
  ],
  [
    q(4, "Tentukan panjang sisi yang belum diketahui, lalu hitung keliling bangun gabungan berikut.", [{ kind: "fill", unit: "m", items: [{ label: "Sisi mendatar tengah", answer: 3, side: 2 }, { label: "Sisi kanan", answer: 4, side: 3 }] }, { kind: "number", label: "Keliling =", answer: 28, unit: "m" }],
      "Sisi mendatar tengah = 8 − 5 = 3 m. Sisi kanan = 6 − 2 = 4 m. Keliling = 5 + 2 + 3 + 4 + 8 + 6 = 28 m.", { scene: one(lShape) }),
    q(4, "Gunakan cara Komang: geser sisi-sisi ke luar sehingga membentuk persegi panjang yang melingkupi. Berapa keliling bangun ini?", [{ kind: "rectf", a: 10, b: 8, unit: "m" }],
      "Sisi-sisi tangga dapat digeser ke luar menjadi persegi panjang 10 m × 8 m. Keliling = (2 × 10) + (2 × 8) = 36 m.", { scene: one(pShape2) }),
    q(4, "Dua persegi bersisi 5 cm disusun berdampingan. Berapa keliling bangun gabungannya?", [{ kind: "number", label: "Keliling =", answer: 30, unit: "cm" }],
      "Sisi yang menempel tidak dihitung karena berada di dalam. Bangunnya menjadi persegi panjang 10 cm × 5 cm. Keliling = 10 + 5 + 10 + 5 = 30 cm.",
      { scene: one(ortho([[0, 0], [10, 0], [10, 5], [0, 5]], ["show", "show", "none", "none"], "cm", { inner: [{ a: [5, 0], b: [5, 5] }] })) }),
    q(4, "Tentukan panjang sisi yang belum diketahui pada bangun berbentuk huruf U, lalu hitung kelilingnya.", [{ kind: "fill", unit: "m", items: [{ label: "Sisi tegak dalam", answer: 4, side: 3 }, { label: "Sisi mendatar dalam", answer: 3, side: 2 }] }, { kind: "number", label: "Keliling =", answer: 38, unit: "m" }],
      "Kedalaman lekukan sama dengan sisi tegak dalam yang lain, 4 m. Sisi mendatar dalam = 9 − 3 − 3 = 3 m. Keliling = 3 + 4 + 3 + 4 + 3 + 6 + 9 + 6 = 38 m.", { scene: one(uShape) }),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
export const assessment: PQuestion[] = [
  // Sedang
  q(0, "Lapangan basket berukuran 28 m × 15 m. Tika berlari mengelilingi lapangan satu kali dan kembali ke titik start. Hitunglah jarak larinya.", [{ kind: "sum", sides: [28, 15, 28, 15], unit: "m" }],
    "Keliling lapangan = 28 + 15 + 28 + 15 = 86 m.", { level: "Sedang", scene: { type: "field", w: 28, h: 15, unit: "m" } }),
  q(1, "Hitunglah keliling segitiga berikut.", [sumOf(triangle(10, 8, 6))], "Keliling = 10 + 8 + 6 = 24 cm.", { level: "Sedang", scene: one(triangle(10, 8, 6)) }),
  q(2, "Hitunglah keliling persegi panjang berikut.", [{ kind: "rectf", a: 9, b: 5, unit: "cm" }], "Keliling = (2 × 9) + (2 × 5) = 18 + 10 = 28 cm.", { level: "Sedang", scene: one(rect(9, 5, "cm", ["show", "show", "none", "none"])) }),
  q(3, "Hitunglah keliling segi enam beraturan berikut.", [{ kind: "mult", n: 6, s: 5, unit: "cm" }], "Keenam sisi sama panjang. Keliling = 6 × 5 = 30 cm.", { level: "Sedang", scene: one(regular(6, 5)) }),
  q(4, "Tentukan panjang sisi yang belum diketahui, lalu hitung keliling bangun gabungan berikut.", [{ kind: "fill", unit: "m", items: [{ label: "Sisi tegak kecil", answer: 2, side: 1 }, { label: "Sisi mendatar kecil", answer: 3, side: 2 }] }, { kind: "number", label: "Keliling =", answer: 32, unit: "m" }],
    "Sisi tegak kecil = 7 − 5 = 2 m. Sisi mendatar kecil = 9 − 6 = 3 m. Keliling = 6 + 2 + 3 + 5 + 9 + 7 = 32 m.",
    { level: "Sedang", scene: one(notch2) }),
  q(2, "Hitunglah keliling persegi berikut.", [{ kind: "mult", n: 4, s: 8, unit: "cm" }], "Keliling = 4 × 8 = 32 cm.", { level: "Sedang", scene: one(rect(8, 8, "cm", ["none", "show", "none", "none"], { ticks: [1, 1, 1, 1] })) }),
  q(1, "Hitunglah keliling segitiga sama sisi berikut.", [{ kind: "mult", n: 3, s: 8, unit: "cm" }], "Tanda garis menunjukkan ketiga sisi sama panjang, 8 cm. Keliling = 3 × 8 = 24 cm.", { level: "Sedang", scene: one(triangle(8, 8, 8, "cm", { ticks: [1, 1, 1] }, ["none", "none", "show"])) }),
  q(0, "Ukurlah sisi-sisi bangun berikut dengan mengetuk setiap sisinya, lalu hitung kelilingnya.", [sumOf(trapezoid(6, 9, 5, 5))],
    "Hasil pengukuran 6 cm, 5 cm, 9 cm, dan 5 cm. Keliling = 6 + 5 + 9 + 5 = 25 cm.", { level: "Sedang", scene: one(trapezoid(6, 9, 5, 5, "cm", all(4, "hide")), true) }),
  // Menantang
  q(3, "Lengkapi tabel keliling segi banyak beraturan berikut.", [{ kind: "table", rows: [{ name: "Segi lima beraturan", n: 5 }, { name: "Segi enam beraturan", n: 6 }, { name: "Segi delapan beraturan", n: 8 }] }],
    "Banyak sisi segi lima 5, segi enam 6, segi delapan 8. Keliling = banyak sisi × panjang sisi.",
    { level: "Menantang", scene: { type: "shapes", items: [{ shape: regular(5, 3, "cm", all(5, "none")), caption: "Segi lima" }, { shape: regular(6, 3, "cm", all(6, "none")), caption: "Segi enam" }, { shape: regular(8, 3, "cm", all(8, "none")), caption: "Segi delapan" }] } }),
  q(4, "Bangun berbentuk tangga berikut hanya diketahui lebar dan tingginya. Gunakan cara Komang untuk menghitung kelilingnya.", [{ kind: "number", label: "Keliling =", answer: 34, unit: "m" }],
    "Sisi-sisi tangga dapat digeser ke luar menjadi persegi panjang 10 m × 7 m. Keliling = (2 × 10) + (2 × 7) = 34 m.", { level: "Menantang", scene: one(stairs) }),
  q(2, "Hitunglah keliling layang-layang berikut.", [{ kind: "rectf", a: 4, b: 7, unit: "cm" }], "Dua sisi atas 4 cm dan dua sisi bawah 7 cm. Keliling = (2 × 4) + (2 × 7) = 8 + 14 = 22 cm.", { level: "Menantang", scene: one(kite(4, 7, "cm", ["show", "show", "none", "none"])) }),
  q(1, "Keliling segitiga sama kaki adalah 32 cm dan panjang alasnya 10 cm. Berapa panjang setiap kakinya?", [{ kind: "number", label: "Panjang kaki =", answer: 11, unit: "cm" }],
    "Kedua kaki = 32 − 10 = 22 cm. Setiap kaki = 22 : 2 = 11 cm.", { level: "Menantang", scene: one(triangle(10, 11, 11, "cm", { ticks: [0, 1, 1] }, ["show", "?", "?"])) }),
  q(0, "Pak Budi akan memagari salah satu kebun berikut. Kebun mana yang memerlukan pagar paling panjang?", [{ kind: "choice", label: "Kebun", options: ["Kebun A", "Kebun B", "Kebun C"], answer: "Kebun B" }],
    "Keliling kebun A = (2 × 8) + (2 × 3) = 22 m. Kebun B = 4 × 6 = 24 m. Kebun C = 3 × 7 = 21 m. Pagar paling panjang untuk kebun B.",
    { level: "Menantang", scene: { type: "shapes", items: [{ shape: rect(8, 3, "m", ["show", "show", "none", "none"]), caption: "Kebun A" }, { shape: rect(6, 6, "m", ["show", "none", "none", "none"], { ticks: [1, 1, 1, 1] }), caption: "Kebun B" }, { shape: triangle(7, 7, 7, "m", { ticks: [1, 1, 1] }, ["show", "none", "none"]), caption: "Kebun C" }] } }),
  q(3, "Hitunglah keliling segi enam berikut. Sisi-sisinya tidak sama panjang.", [{ kind: "sum", sides: [4, 6, 5, 3, 7, 5], unit: "cm" }],
    "Jumlahkan semua sisi: 4 + 6 + 5 + 3 + 7 + 5 = 30 cm.", { level: "Menantang", scene: one(spec([[2, 0], [6, 0], [10, 4], [9, 9], [3, 9], [0, 5]], [4, 6, 5, 3, 7, 5], "cm")) }),
  q(4, "Tentukan panjang sisi yang belum diketahui pada bangun huruf L berikut, lalu hitung kelilingnya.", [{ kind: "fill", unit: "m", items: [{ label: "Sisi tegak tengah", answer: 3, side: 1 }, { label: "Sisi mendatar tengah", answer: 4, side: 2 }] }, { kind: "number", label: "Keliling =", answer: 36, unit: "m" }],
    "Sisi tegak tengah = 8 − 5 = 3 m. Sisi mendatar tengah = 10 − 6 = 4 m. Keliling = 6 + 3 + 4 + 5 + 10 + 8 = 36 m.",
    { level: "Menantang", scene: one(ortho([[0, 0], [6, 0], [6, 3], [10, 3], [10, 8], [0, 8]], ["show", "?", "?", "show", "show", "show"])) }),
  q(2, "Ukurlah sisi-sisi trapesium berikut, lalu hitung kelilingnya.", [sumOf(trapezoid(7, 13, 5, 5))],
    "Hasil pengukuran 7 cm, 5 cm, 13 cm, dan 5 cm. Keliling = 7 + 5 + 13 + 5 = 30 cm.", { level: "Menantang", scene: one(trapezoid(7, 13, 5, 5, "cm", all(4, "hide")), true) }),
  q(1, "Segitiga manakah yang kelilingnya paling besar?", [{ kind: "choice", label: "Segitiga", options: ["Segitiga A", "Segitiga B", "Segitiga C"], answer: "Segitiga C" }],
    "Keliling A = 5 + 7 + 8 = 20 cm. B = 3 × 7 = 21 cm. C = 9 + 9 + 4 = 22 cm. Yang paling besar segitiga C.",
    { level: "Menantang", scene: { type: "shapes", items: [{ shape: triangle(8, 7, 5), caption: "Segitiga A" }, { shape: triangle(7, 7, 7, "cm", { ticks: [1, 1, 1] }, ["show", "none", "none"]), caption: "Segitiga B" }, { shape: triangle(4, 9, 9, "cm", { ticks: [0, 1, 1] }, ["show", "show", "none"]), caption: "Segitiga C" }] } }),
  // Sangat menantang
  q(3, "Hitunglah keliling segi delapan beraturan berikut.", [{ kind: "mult", n: 8, s: 10, unit: "cm" }], "Kedelapan sisinya sama panjang. Keliling = 8 × 10 = 80 cm.", { level: "Sangat menantang", scene: one(regular(8, 10)) }),
  q(4, "Denah rumah berikut berbentuk tanda tambah. Beberapa ukuran belum diketahui. Hitunglah keliling dinding terluarnya.", [{ kind: "number", label: "Keliling =", answer: 48, unit: "m" }],
    "Dengan cara Komang, sisi-sisi terluar dapat digeser menjadi persegi 12 m × 12 m. Keliling = 4 × 12 = 48 m. Cara Asep: 6 + 3 + 4 + 4 + 4 + 5 + 6 + 5 + 2 + 4 + 2 + 3 = 48 m.", { level: "Sangat menantang", scene: one(crossShape) }),
  q(1, "Bangun berikut tersusun dari dua segitiga. Garis putus-putus bukan sisi terluar. Hitunglah kelilingnya.", [{ kind: "sum", sides: [10, 9, 9, 17], unit: "cm" }],
    "Hanya sisi terluar yang dijumlahkan: 10 + 9 + 9 + 17 = 45 cm. Garis putus-putus 15 cm tidak dihitung.", { level: "Sangat menantang", scene: one(twoTri) }),
  q(2, "Pak Budi memagari kebun berbentuk persegi panjang dengan pagar sepanjang 50 m. Panjang kebun 16 m. Berapa lebar kebun?", [{ kind: "number", label: "Lebar =", answer: 9, unit: "m" }],
    "Keliling = (2 × panjang) + (2 × lebar). 50 − (2 × 16) = 18 m untuk dua lebar. Lebar = 18 : 2 = 9 m.", { level: "Sangat menantang", scene: one(rect(16, 9, "m", ["show", "?", "none", "none"])) }),
  q(0, "Nisa membuat tiga bingkai foto dari kayu: 20 cm × 15 cm, 30 cm × 20 cm, dan persegi bersisi 12 cm. Berapa panjang kayu seluruhnya?", [{ kind: "number", label: "Panjang kayu =", answer: 218, unit: "cm" }],
    "Bingkai 1: (2 × 20) + (2 × 15) = 70 cm. Bingkai 2: (2 × 30) + (2 × 20) = 100 cm. Bingkai 3: 4 × 12 = 48 cm. Jumlahnya 70 + 100 + 48 = 218 cm.",
    { level: "Sangat menantang", scene: { type: "shapes", items: [{ shape: rect(20, 15, "cm", ["show", "show", "none", "none"]), caption: "Bingkai 1" }, { shape: rect(30, 20, "cm", ["show", "show", "none", "none"]), caption: "Bingkai 2" }, { shape: rect(12, 12, "cm", ["show", "none", "none", "none"], { ticks: [1, 1, 1, 1] }), caption: "Bingkai 3" }] } }),
  q(3, "Keliling sebuah segi enam beraturan adalah 54 cm. Berapa panjang sisinya?", [{ kind: "number", label: "Panjang sisi =", answer: 9, unit: "cm" }],
    "Keliling = 6 × sisi, jadi sisi = 54 : 6 = 9 cm.", { level: "Sangat menantang", scene: one(regular(6, 9, "cm", all(6, "none").map((v, i) => (i === 0 ? "?" : v)))) }),
  q(4, "Hitunglah keliling bangun berikut. Garis merah putus-putus adalah persegi panjang yang melingkupinya.", [{ kind: "number", label: "Keliling =", answer: 46, unit: "cm" }],
    "Lebar seluruhnya 8 + 3 = 11 cm dan tinggi 12 cm. Sisi-sisi terluar dapat digeser menjadi persegi panjang 11 cm × 12 cm. Keliling = (2 × 11) + (2 × 12) = 46 cm.", { level: "Sangat menantang", scene: one(notch) }),
];
