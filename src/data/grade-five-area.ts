import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 5 Bab 5 - Luas Daerah Bangun Datar (Buku Matematika SD/MI Kelas V, hlm. 131-162).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Pt = [number, number];

/* ---------- Gambar: bangun pada kertas berpetak atau bangun berlabel ---------- */
export type Poly = { pts: Pt[]; label?: string; fill?: string; dashed?: boolean; noFill?: boolean };
export type Scene = {
  type: "grid";
  /** Ukuran kertas berpetak dalam satuan; plain berarti tanpa garis petak. */
  w: number; h: number; plain?: boolean;
  polys: Poly[];
  lines?: { a: Pt; b: Pt; color?: string }[];
  texts?: { at: Pt; text: string; size?: number; anchor?: "start" | "middle" | "end" }[];
  /** Petak dapat diketuk untuk ditandai saat menghitung. */
  mark?: boolean;
};
export const shoelace = (pts: Pt[]) => Math.abs(pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;

export type Shape = "rect" | "square" | "tri" | "para" | "trap" | "kite";
export const shapeName: Record<Shape, string> = { rect: "persegi panjang", square: "persegi", tri: "segitiga", para: "jajargenjang", trap: "trapesium", kite: "layang-layang / belah ketupat" };
export const areaOf = (s: Shape, v: number[]) => s === "rect" || s === "para" ? v[0] * v[1] : s === "square" ? v[0] * v[0] : s === "trap" ? ((v[0] + v[1]) * v[2]) / 2 : (v[0] * v[1]) / 2;

export type Part =
  | { kind: "number"; label: string; answer: number; unit?: string }
  /** Rumus luas: nilai-nilai lalu hasil. */
  | { kind: "formula"; shape: Shape; vals: number[]; unit: string }
  /** Beberapa isian berlabel, misalnya luas setiap bagian dan luas gabungan. */
  | { kind: "items"; items: { label: string; answer: number }[]; unit: string }
  /** Tabel ukuran persegi panjang yang kelilingnya K. */
  /** Bangun gabungan: tampilkan garis bantu (beberapa versi), hitung luas tiap bangun, lalu jumlahkan. */
  | { kind: "compose"; outline: Pt[]; texts: NonNullable<Scene["texts"]>; unit: string; versions: { name: string; pieces: Piece[] }[] }
  | { kind: "pairs"; K: number; rows: number; example: [number, number]; key: [number, number][] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type Piece = { label: string; shape: Shape; vals: number[]; pts: Pt[] };
export type AQuestion = Question & { topic: 0 | 1 | 2 | 3; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Isian ---------- */
export const fieldCount = (p: Part) => {
  switch (p.kind) {
    case "formula": return (p.shape === "square" ? 2 : p.vals.length) + 1;
    case "items": return p.items.length;
    case "pairs": return p.rows * 4;
    case "compose": return 2 + Math.max(...p.versions.map(v => v.pieces.length));
    case "tf": return p.statements.length;
    default: return 1;
  }
};
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "number": return [String(p.answer)];
    case "formula": { const v = p.shape === "square" ? [p.vals[0], p.vals[0]] : p.vals; return [...v.map(String), String(areaOf(p.shape, p.vals))]; }
    case "items": return p.items.map(it => String(it.answer));
    case "compose": { const ps = p.versions[0].pieces, n = fieldCount(p) - 2; return ["0", ...Array.from({ length: n }, (_, k) => (ps[k] ? String(areaOf(ps[k].shape, ps[k].vals)) : "")), String(ps.reduce((a, x) => a + areaOf(x.shape, x.vals), 0))]; }
    case "pairs": return p.key.flatMap(([a, b]) => [String(a), String(b), String(p.K), String(a * b)]);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);
const same = (a: number[], b: number[]) => [...a].sort((x, y) => x - y).join() === [...b].sort((x, y) => x - y).join();
function partCorrect(p: Part, v: string): boolean {
  const raw = cells(p, v), x = raw.map(int);
  switch (p.kind) {
    case "formula": {
      const k = x.length - 1, want = Number(fields(p)[k]);
      if (x[k] !== want) return false;
      if (p.shape === "trap") return same(x.slice(0, 2), p.vals.slice(0, 2)) && x[2] === p.vals[2];
      return same(x.slice(0, k), fields(p).slice(0, k).map(Number));
    }
    case "compose": {
      const vi = x[0], ver = p.versions[vi]; if (!ver) return false;
      const n = raw.length - 2, areas = ver.pieces.map(pc => areaOf(pc.shape, pc.vals));
      return areas.every((a, k) => x[1 + k] === a) && raw.slice(1 + areas.length, 1 + n).every(c => c === "") && x[n + 1] === areas.reduce((a, b) => a + b, 0);
    }
    case "pairs": {
      const seen = new Set<string>([[...p.example].sort().join()]);
      for (let r = 0; r < p.rows; r++) {
        const [a, b, K, L] = x.slice(4 * r, 4 * r + 4);
        if (!(a > 0 && b > 0) || 2 * (a + b) !== p.K || K !== p.K || L !== a * b) return false;
        const key = [a, b].sort().join(); if (seen.has(key)) return false; seen.add(key);
      }
      return true;
    }
    case "tf": case "choice": return raw.join("|") === fields(p).join("|");
    default: return fields(p).every((w, i) => x[i] === Number(w));
  }
}
const partReady = (p: Part, v: string) => p.kind === "compose" ? (() => { const x = cells(p, v), ver = p.versions[int(x[0])]; return Boolean(ver) && ver.pieces.every((_, k) => !Number.isNaN(int(x[1 + k]))) && !Number.isNaN(int(x[x.length - 1])); })() : (p.kind === "choice" ? Boolean(v) : p.kind === "tf" ? cells(p, v).every(Boolean) : cells(p, v).every(y => !Number.isNaN(int(y))));
export const correct = (q: AQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: AQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formulaText(p: Extract<Part, { kind: "formula" }>, x: string[]) {
  const d = (s: string) => s || "…", k = x.length - 1;
  const body = p.shape === "trap" ? `½ × (${d(x[0])} + ${d(x[1])}) × ${d(x[2])}` : p.shape === "tri" || p.shape === "kite" ? `½ × ${d(x[0])} × ${d(x[1])}` : `${d(x[0])} × ${d(x[1])}`;
  return `Luas = ${body} = ${d(x[k])} ${p.unit}`;
}
export function formatAnswer(q: AQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => s || "…";
    switch (p.kind) {
      case "number": return `${p.label} ${d(x[0])}${p.unit ? ` ${p.unit}` : ""}`;
      case "formula": return formulaText(p, x);
      case "items": return p.items.map((it, k) => `${it.label} = ${d(x[k])} ${p.unit}`).join(", ");
      case "compose": { const ver = p.versions[int(x[0])]; if (!ver) return "garis bantu belum ditampilkan"; return `${ver.name}: ${ver.pieces.map((pc, k) => `${pc.label} = ${d(x[1 + k])}`).join(", ")}; luas gabungan = ${d(x[x.length - 1])} ${p.unit}`; }
      case "pairs": return Array.from({ length: p.rows }, (_, r) => `${d(x[4 * r])} × ${d(x[4 * r + 1])}: keliling ${d(x[4 * r + 2])}, luas ${d(x[4 * r + 3])}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return d(v[i]);
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: AQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): AQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const R = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const shift = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy]);
const gridScene = (w: number, h: number, pts: Pt[], extra: Partial<Scene> = {}): Scene => ({ type: "grid", w, h, polys: [{ pts }], mark: true, ...extra });
const plain = (w: number, h: number, polys: Poly[], texts: Scene["texts"], lines?: Scene["lines"]): Scene => ({ type: "grid", w, h, plain: true, polys, texts, lines });
const dash = (a: Pt, b: Pt, color = "#e5484d") => ({ a, b, color });
const formula = (shape: Shape, vals: number[], unit = "cm²"): Part => ({ kind: "formula", shape, vals, unit });

/* Bangun berlabel untuk soal rumus. */
export function shapeScene(shape: Shape, v: number[], u = "cm"): Scene {
  switch (shape) {
    case "rect": return plain(v[0], v[1], [{ pts: R(0, 0, v[0], v[1]) }], [{ at: [v[0] / 2, v[1] + 0.9], text: `${v[0]} ${u}` }, { at: [v[0] + 0.6, v[1] / 2], text: `${v[1]} ${u}` }]);
    case "square": return plain(v[0], v[0], [{ pts: R(0, 0, v[0], v[0]) }], [{ at: [v[0] / 2, v[0] + 0.9], text: `${v[0]} ${u}` }]);
    case "tri": { const t = v[1], a = v[0], x = a / 3; return plain(a, t, [{ pts: [[0, t], [a, t], [x, 0]] }], [{ at: [a / 2, t + 0.9], text: `alas ${a} ${u}` }, { at: [x + 0.4, t / 2], text: `tinggi ${t} ${u}` }], [dash([x, 0], [x, t])]); }
    case "para": { const a = v[0], t = v[1], s = t / 2; return plain(a + s, t, [{ pts: [[0, t], [a, t], [a + s, 0], [s, 0]] }], [{ at: [a / 2, t + 0.9], text: `alas ${a} ${u}` }, { at: [s + 0.4, t / 2], text: `tinggi ${t} ${u}` }], [dash([s, 0], [s, t])]); }
    case "trap": { const [top, bot, t] = v, off = (bot - top) / 2; return plain(bot, t, [{ pts: [[0, t], [bot, t], [off + top, 0], [off, 0]] }], [{ at: [bot / 2, -0.9], text: `${top} ${u}` }, { at: [bot / 2, t + 0.9], text: `${bot} ${u}` }, { at: [off + 0.4, t / 2], text: `tinggi ${t} ${u}` }], [dash([off, 0], [off, t])]); }
    case "kite": { const [d1, d2] = v, c = Math.round(d2 * 0.3); return plain(d1, d2, [{ pts: [[d1 / 2, 0], [d1, c], [d1 / 2, d2], [0, c]] }], [{ at: [d1 * 0.78, c - Math.max(d1, d2) * 0.08], text: `${d1} ${u}` }, { at: [d1 / 2 + Math.max(d1, d2) * 0.03, (c + d2) / 2], text: `${d2} ${u}`, anchor: "start" }], [dash([0, c], [d1, c], "#d6336c"), dash([d1 / 2, 0], [d1 / 2, d2])]); }
  }
}

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Konsep Luas Daerah Bangun Datar", short: "Konsep luas",
    steps: [
      "Luas daerah bangun datar adalah ukuran yang menunjukkan besar kecilnya daerah yang dibatasi oleh bangun datar.",
      "Luas diukur dengan persegi satuan. Persegi 1 cm × 1 cm luasnya 1 cm² (satu sentimeter persegi). Persegi 1 m × 1 m luasnya 1 m².",
      "Untuk mengukur luas lantai, tutup rapat lantai dengan ubin 1 m × 1 m tanpa celah, lalu hitung banyak ubinnya.",
      "Cara Yohana: petak yang tidak utuh dapat dipotong dan ditempelkan ke petak lain sehingga menjadi petak utuh. Luasnya tidak berubah.",
    ],
    demo: "Atur ukuran ruangan, lalu ketuk petak untuk memasang ubin satu per satu atau pasang ubin sebaris sekaligus.",
  },
  {
    code: "B", title: "Luas Daerah Bangun Datar", short: "Rumus luas",
    steps: [
      "Persegi panjang: Luas = panjang × lebar. Persegi: Luas = sisi × sisi.",
      "Segitiga dapat dipotong dan dipindah menjadi persegi panjang dengan lebar ½ tinggi. Luas = ½ × alas × tinggi.",
      "Jajargenjang dapat diubah menjadi persegi panjang. Luas = alas × tinggi. Trapesium: Luas = ½ × (sisi atas + sisi alas) × tinggi.",
      "Belah ketupat dan layang-layang: Luas = ½ × diagonal 1 × diagonal 2.",
    ],
    demo: "Pilih bangun dan atur ukurannya. Ketuk Potong dan pindahkan untuk melihat bangun berubah menjadi persegi panjang dengan luas yang sama.",
  },
  {
    code: "C", title: "Luas Daerah Bangun Gabungan", short: "Bangun gabungan",
    steps: [
      "Bangun gabungan dibagi dulu menjadi bangun-bangun yang sudah kita kenal, misalnya persegi panjang dan segitiga.",
      "Hitung luas setiap bangun penyusunnya dengan rumusnya masing-masing.",
      "Luas bangun gabungan = jumlah luas bangun-bangun penyusunnya.",
      "Satu bangun dapat dibagi dengan cara berbeda (cara Yohana dan cara Komang), hasil luasnya tetap sama.",
    ],
    demo: "Atur ukuran rumah, lalu lihat bangun dibagi menjadi persegi panjang dan segitiga. Luas keduanya dijumlahkan.",
  },
  {
    code: "D", title: "Hubungan Keliling dan Luas Daerah Bangun Datar", short: "Keliling dan luas",
    steps: [
      "Kawat 60 cm dapat dibentuk menjadi banyak persegi panjang berbeda. Kelilingnya sama-sama 60 cm, jadi panjang + lebar = 30 cm.",
      "Walaupun kelilingnya sama, luasnya bisa berbeda: 20 × 10 = 200 cm², tetapi 25 × 5 = 125 cm².",
      "Makin mendekati persegi, makin luas daerahnya. Untuk keliling 60 cm, yang terluas adalah persegi 15 × 15 = 225 cm².",
      "Sebaliknya, untuk luas yang sama, persegi panjang yang paling mendekati persegi memiliki keliling paling kecil.",
    ],
    demo: "Atur panjang kerangka kawat. Lebar menyesuaikan agar keliling tetap. Perhatikan luasnya naik turun.",
  },
] as const;

/* ---------- Bangun gabungan ---------- */
const plus: Pt[] = [[2, 0], [4, 0], [4, 2], [6, 2], [6, 4], [4, 4], [4, 6], [2, 6], [2, 4], [0, 4], [0, 2], [2, 2]];
const pent: Pt[] = [[2, 0], [6, 2], [6, 6], [2, 6], [2, 4], [0, 2]];

/* ---------- Bangun gabungan dengan beberapa versi garis bantu ---------- */
const rp = (x0: number, y0: number, x1: number, y1: number, label: string): Piece => ({ label, shape: "rect", vals: [x1 - x0, y1 - y0], pts: R(x0, y0, x1, y1) });
const tp = (pts: Pt[], a: number, t: number, label: string): Piece => ({ label, shape: "tri", vals: [a, t], pts });
const comp = (outline: Pt[], texts: NonNullable<Scene["texts"]>, v1: Piece[], v2: Piece[], names: [string, string] = ["Garis bantu 1", "Garis bantu 2"]): Part => ({ kind: "compose", outline, texts, unit: "cm²", versions: [{ name: names[0], pieces: v1 }, { name: names[1], pieces: v2 }] });
const compose = (p: Part) => p;
/** Huruf T: lebar atas W, tinggi atas h, batang lebar s, tinggi batang t (batang di tengah). */
function tShape(W: number, h: number, sw: number, t: number): Part {
  const a = (W - sw) / 2, b = a + sw;
  return comp([[0, 0], [W, 0], [W, h], [b, h], [b, h + t], [a, h + t], [a, h], [0, h]],
    [{ at: [W / 2, -0.9], text: `${W} cm` }, { at: [W + 0.4, h / 2], text: `${h} cm` }, { at: [W / 2, h + t + 1], text: `${sw} cm` }, { at: [b + 0.4, h + t / 2], text: `${t} cm`, anchor: "start" }],
    [rp(0, 0, a, h, "A"), rp(a, 0, b, h + t, "B"), rp(b, 0, W, h, "C")],
    [rp(0, 0, b, h, "A"), rp(b, 0, W, h, "B"), rp(a, h, b, h + t, "C")]);
}
/** Rumah dengan teras: badan W × H, atap setinggi r, teras pw × ph di kanan bawah. */
function housePorch(W: number, H: number, r: number, pw: number, ph: number): Part {
  const y0 = r, y1 = r + H, yp = y1 - ph;
  return comp([[0, y0], [W / 2, 0], [W, y0], [W, yp], [W + pw, yp], [W + pw, y1], [0, y1]],
    [{ at: [(W + pw) / 2, y1 + 1], text: `${W + pw} cm` }, { at: [-0.4, (y0 + y1) / 2], text: `${H} cm`, anchor: "end" }, { at: [W + pw + 0.4, (yp + y1) / 2], text: `${ph} cm` }, { at: [W + pw / 2, yp - 0.9], text: `${pw} cm` }],
    [tp([[0, y0], [W / 2, 0], [W, y0]], W, r, "A"), rp(0, y0, W, y1, "B"), rp(W, yp, W + pw, y1, "C")],
    [tp([[0, y0], [W / 2, 0], [W, y0]], W, r, "A"), rp(0, y0, W, yp, "B"), rp(0, yp, W + pw, y1, "C")]);
}
/** Roket: ujung segitiga setinggi n, badan W × B, kaki trapesium melebar e di tiap sisi setinggi f. */
function rocket(W: number, n: number, B: number, e: number, f: number): Part {
  const L = e, Rr = e + W, y1 = n + B, y2 = y1 + f;
  const trap: Piece = { label: "C", shape: "trap", vals: [W, W + 2 * e, f], pts: [[L, y1], [Rr, y1], [Rr + e, y2], [0, y2]] };
  return comp([[L + W / 2, 0], [Rr, n], [Rr, y1], [Rr + e, y2], [0, y2], [L, y1], [L, n]],
    [{ at: [L + W / 2, y2 + 1], text: `${W + 2 * e} cm` }, { at: [Rr + 0.4, n + B / 2], text: `${B} cm`, anchor: "start" }, { at: [L + W / 2, n - 0.5 + 1.6], text: `${W} cm` }, { at: [Rr + e + 0.4, y1 + f / 2], text: `${f} cm` }],
    [tp([[L, n], [L + W / 2, 0], [Rr, n]], W, n, "A"), rp(L, n, Rr, y1, "B"), trap],
    [tp([[L, n], [L + W / 2, 0], [Rr, n]], W, n, "A"), rp(L, n, Rr, y2, "B"), tp([[0, y2], [L, y1], [L, y2]], e, f, "C"), tp([[Rr, y1], [Rr + e, y2], [Rr, y2]], e, f, "D")]);
}
/** Jajargenjang (alas a, tinggi t, geser g) di atas persegi panjang a × h dengan segitiga siku-siku (alas c) di kanan. */
function paraRectTri(a: number, t: number, g: number, h: number, c: number): Part {
  const y2 = t + h;
  return comp([[g, 0], [a + g, 0], [a, t], [a + c, y2], [0, y2], [0, t]],
    [{ at: [g + a / 2, -0.9], text: `${a} cm` }, { at: [-0.4, t / 2], text: `${t} cm`, anchor: "end" }, { at: [-0.4, t + h / 2], text: `${h} cm`, anchor: "end" }, { at: [(a + c) / 2, y2 + 1], text: `${a + c} cm` }],
    [{ label: "A", shape: "para", vals: [a, t], pts: [[g, 0], [a + g, 0], [a, t], [0, t]] }, rp(0, t, a, y2, "B"), tp([[a, t], [a + c, y2], [a, y2]], c, h, "C")],
    [tp([[0, t], [g, 0], [g, t]], t, g, "A"), rp(g, 0, a, t, "B"), tp([[a, 0], [a + g, 0], [a, t]], g, t, "C"), { label: "D", shape: "trap", vals: [a, a + c, h], pts: [[0, t], [a, t], [a + c, y2], [0, y2]] }]);
}
const uSlantC = comp([[0, 0], [3, 0], [3, 3], [7, 3], [7, 0], [9, 0], [11, 6], [0, 6]],
  [{ at: [5.5, 7], text: "11 cm" }, { at: [-0.4, 3], text: "6 cm", anchor: "end" }, { at: [1.5, -0.9], text: "3 cm" }, { at: [5, 2.4], text: "4 cm" }, { at: [8, -0.9], text: "2 cm" }, { at: [3.4, 0.9], text: "3 cm", anchor: "start" }],
  [rp(0, 0, 3, 6, "A"), rp(3, 3, 7, 6, "B"), rp(7, 0, 9, 6, "C"), tp([[9, 0], [11, 6], [9, 6]], 2, 6, "D")],
  [rp(0, 3, 9, 6, "A"), rp(0, 0, 3, 3, "B"), rp(7, 0, 9, 3, "C"), tp([[9, 0], [11, 6], [9, 6]], 2, 6, "D")]);
const kiteC = comp([[4, 0], [12, 0], [10, 4], [12, 10], [4, 10], [0, 4]],
  [{ at: [8, -0.9], text: "8 cm" }, { at: [8, 11], text: "8 cm" }, { at: [12.4, 7], text: "6 cm" }, { at: [10.6, 2], text: "4 cm", anchor: "start" }],
  [{ label: "A", shape: "kite", vals: [10, 10], pts: [[4, 0], [10, 4], [4, 10], [0, 4]] }, tp([[4, 0], [12, 0], [10, 4]], 8, 4, "B"), tp([[10, 4], [12, 10], [4, 10]], 8, 6, "C")],
  [tp([[0, 4], [4, 0], [4, 10]], 10, 4, "A"), { label: "B", shape: "trap", vals: [8, 6, 4], pts: [[4, 0], [12, 0], [10, 4], [4, 4]] }, { label: "C", shape: "trap", vals: [6, 8, 6], pts: [[4, 4], [10, 4], [12, 10], [4, 10]] }],
  ["Cara Yohana", "Cara Komang"]);

const rooms = { tidur: R(0, 0, 3, 3), dapur: R(3, 0, 6, 2), mandi: R(3, 2, 5, 3), tamu: R(0, 3, 4, 6) };
const roomFill = ["#fde2c8", "#d6ecfa", "#e3f2d8", "#f6dbe8"];

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: AQuestion[][] = [
  [
    q(0, "Lantai kamar berukuran 4 m × 3 m akan dipasang ubin 1 m × 1 m. Ketuk petak untuk memasang ubin, lalu tulis banyak ubin yang dibutuhkan.", [{ kind: "number", label: "Banyak ubin =", answer: 12, unit: "buah" }],
      "Ubin menutup rapat 4 ubin setiap baris dan ada 3 baris: 12 ubin. Luas lantai 12 m².", { scene: gridScene(6, 5, shift(R(0, 0, 4, 3), 1, 1)) }),
    q(0, "Perhatikan denah berikut. Setiap petak mewakili ubin 1 m × 1 m. Tuliskan luas setiap ruangan.", [{ kind: "items", unit: "m²", items: [{ label: "Dapur", answer: 6 }, { label: "Kamar mandi", answer: 2 }] }],
      "Dapur 3 m × 2 m = 6 petak, jadi 6 m². Kamar mandi 2 m × 1 m = 2 m².",
      { scene: { type: "grid", w: 6, h: 6, polys: [{ pts: rooms.tidur, label: "R. Tidur", fill: roomFill[0] }, { pts: rooms.dapur, label: "Dapur", fill: roomFill[1] }, { pts: rooms.mandi, label: "K. Mandi", fill: roomFill[2] }, { pts: rooms.tamu, label: "R. Tamu", fill: roomFill[3] }] } }),
    q(0, "Hitunglah luas daerah bangun berikut dengan membilang petak satuan.", [{ kind: "number", label: "Luas =", answer: 14, unit: "satuan luas" }],
      "Bangun menutup 14 petak utuh: 4 petak di bagian atas (2 × 2) dan 10 petak di bagian bawah (5 × 2).", { scene: gridScene(7, 5, shift([[0, 0], [2, 0], [2, 2], [5, 2], [5, 4], [0, 4]], 1, 0)) }),
    q(0, "Hitunglah luas segitiga berikut. Gunakan cara Yohana: pasangkan petak yang tidak utuh menjadi petak utuh.", [{ kind: "number", label: "Luas =", answer: 9, unit: "satuan luas" }],
      "Ada petak utuh dan petak setengah. Dua petak setengah digabung menjadi satu petak utuh. Seluruhnya 9 satuan luas, sama dengan ½ × 6 × 3.", { scene: gridScene(8, 5, shift([[0, 3], [6, 3], [0, 0]], 1, 1)) }),
  ],
  [
    q(1, "Hitunglah luas persegi panjang berikut.", [formula("rect", [7, 4])], "Luas = panjang × lebar = 7 × 4 = 28 cm².", { scene: shapeScene("rect", [7, 4]) }),
    q(1, "Hitunglah luas segitiga berikut.", [formula("tri", [8, 5])], "Luas = ½ × alas × tinggi = ½ × 8 × 5 = 20 cm².", { scene: shapeScene("tri", [8, 5]) }),
    q(1, "Hitunglah luas trapesium berikut.", [formula("trap", [4, 8, 5])], "Luas = ½ × (sisi atas + sisi alas) × tinggi = ½ × (4 + 8) × 5 = ½ × 12 × 5 = 30 cm².", { scene: shapeScene("trap", [4, 8, 5]) }),
    q(1, "Hitunglah luas belah ketupat dengan diagonal 6 cm dan 10 cm.", [formula("kite", [6, 10])], "Luas = ½ × diagonal 1 × diagonal 2 = ½ × 6 × 10 = 30 cm².", { scene: shapeScene("kite", [6, 10]) }),
  ],
  [
    q(2, "Hitunglah luas bangun berbentuk huruf T berikut. Tampilkan garis bantu, hitung luas setiap bangun, lalu jumlahkan.", [compose(tShape(9, 3, 3, 5))], "Cara 1: 9 + 24 + 9 = 42 cm². Cara 2: 18 + 9 + 15 = 42 cm². Hasilnya sama."),
    q(2, "Hitunglah luas bangun rumah dengan teras berikut. Tampilkan garis bantu, hitung luas setiap bangun, lalu jumlahkan.", [compose(housePorch(8, 5, 3, 3, 2))], "Cara 1: segitiga 12 + persegi panjang 40 + teras 6 = 58 cm². Cara 2: 12 + 24 + 22 = 58 cm²."),
    q(2, "Hitunglah luas bangun berbentuk roket berikut. Tampilkan garis bantu, hitung luas setiap bangun, lalu jumlahkan.", [compose(rocket(6, 4, 8, 2, 3))], "Cara 1: segitiga 12 + persegi panjang 48 + trapesium 24 = 84 cm². Cara 2: 12 + 66 + 3 + 3 = 84 cm²."),
    q(2, "Hitunglah luas bangun berikut. Tampilkan garis bantu, hitung luas setiap bangun, lalu jumlahkan.", [compose(paraRectTri(8, 4, 2, 4, 4))], "Cara 1: jajargenjang 32 + persegi panjang 32 + segitiga 8 = 72 cm². Cara 2: 4 + 24 + 4 + trapesium 40 = 72 cm²."),
  ],
  [
    q(3, "Bapak memiliki kawat 24 cm untuk membuat kerangka persegi panjang. Contoh: 8 cm × 4 cm. Tuliskan tiga ukuran lain yang mungkin, lengkap dengan keliling dan luasnya.", [{ kind: "pairs", K: 24, rows: 3, example: [8, 4], key: [[10, 2], [9, 3], [6, 6]] }],
      "Panjang + lebar = 24 : 2 = 12 cm. Ukuran lain: 11 × 1, 10 × 2, 9 × 3, 7 × 5, 6 × 6. Kelilingnya semua 24 cm, tetapi luasnya berbeda."),
    q(3, "Kawat 32 cm dibentuk menjadi persegi panjang. Ukuran manakah yang luasnya paling besar?", [{ kind: "choice", label: "Ukuran terluas", options: ["12 cm × 4 cm", "8 cm × 8 cm", "10 cm × 6 cm", "14 cm × 2 cm"], answer: "8 cm × 8 cm" }],
      "Semua kelilingnya 32 cm. Luasnya 48, 64, 60, dan 28 cm². Persegi 8 × 8 paling luas."),
    q(3, "Keliling persegi panjang 28 cm dan panjangnya 9 cm. Tentukan lebar dan luasnya.", [{ kind: "items", unit: "", items: [{ label: "Lebar (cm)", answer: 5 }, { label: "Luas (cm²)", answer: 45 }] }],
      "Panjang + lebar = 28 : 2 = 14, jadi lebar = 14 − 9 = 5 cm. Luas = 9 × 5 = 45 cm²."),
    q(3, "Tentukan benar atau salah pernyataan berikut.", [{ kind: "tf", statements: [
      { text: "Persegi panjang 6 cm × 4 cm dan 8 cm × 2 cm memiliki keliling yang sama.", answer: true },
      { text: "Karena kelilingnya sama, luas kedua persegi panjang itu juga sama.", answer: false },
    ] }], "Kelilingnya sama-sama 20 cm. Luasnya 24 cm² dan 16 cm², berbeda."),
  ],
];

/* ---------- Evaluasi: 24 soal, A, B, C, D bergantian ---------- */
export const assessment: AQuestion[] = [
  // Sedang (1-8)
  q(0, "Lantai teras berukuran 5 m × 3 m akan dipasang ubin 1 m × 1 m. Berapa banyak ubin yang dibutuhkan?", [{ kind: "number", label: "Banyak ubin =", answer: 15, unit: "buah" }],
    "5 ubin setiap baris dan 3 baris: 15 ubin. Luas teras 15 m².", { level: "Sedang", scene: gridScene(7, 5, shift(R(0, 0, 5, 3), 1, 1)) }),
  q(1, "Hitunglah luas persegi panjang berikut.", [formula("rect", [9, 6])], "Luas = 9 × 6 = 54 cm².", { level: "Sedang", scene: shapeScene("rect", [9, 6]) }),
  q(2, "Hitunglah luas bangun rumah dengan teras berikut. Tampilkan garis bantu, hitung luas setiap bangun, lalu jumlahkan.", [compose(housePorch(10, 6, 4, 4, 3))], "Cara 1: segitiga 20 + persegi panjang 60 + teras 12 = 92 cm². Cara 2: 20 + 30 + 42 = 92 cm².", { level: "Sedang" }),
  q(3, "Bapak memiliki kawat 60 cm untuk kerangka persegi panjang. Contoh: 20 cm × 10 cm. Tuliskan tiga ukuran lain yang mungkin, lengkap dengan keliling dan luasnya.", [{ kind: "pairs", K: 60, rows: 3, example: [20, 10], key: [[25, 5], [18, 12], [15, 15]] }],
    "Panjang + lebar = 60 : 2 = 30 cm, misalnya 25 × 5 (125 cm²), 18 × 12 (216 cm²), atau 15 × 15 (225 cm²). Keliling semuanya 60 cm.", { level: "Sedang" }),
  q(0, "Perhatikan denah rumah berikut. Setiap petak mewakili ubin 1 m × 1 m. Ruangan manakah yang membutuhkan ubin paling banyak? Berapa ubinnya?", [{ kind: "choice", label: "Ruangan", options: ["R. Tidur", "Dapur", "K. Mandi", "R. Tamu"], answer: "R. Tamu" }, { kind: "number", label: "Banyak ubin =", answer: 12, unit: "buah" }],
    "R. Tidur 3 × 3 = 9, Dapur 3 × 2 = 6, Kamar mandi 2 × 1 = 2, R. Tamu 4 × 3 = 12. Ruang tamu paling luas, 12 ubin.",
    { level: "Sedang", scene: { type: "grid", w: 6, h: 6, polys: [{ pts: rooms.tidur, label: "R. Tidur", fill: roomFill[0] }, { pts: rooms.dapur, label: "Dapur", fill: roomFill[1] }, { pts: rooms.mandi, label: "K. Mandi", fill: roomFill[2] }, { pts: rooms.tamu, label: "R. Tamu", fill: roomFill[3] }] } }),
  q(1, "Hitunglah luas persegi berikut.", [formula("square", [7])], "Luas = sisi × sisi = 7 × 7 = 49 cm².", { level: "Sedang", scene: shapeScene("square", [7]) }),
  q(2, "Hitunglah luas bangun berbentuk huruf T berikut. Tampilkan garis bantu, hitung luas setiap bangun, lalu jumlahkan.", [compose(tShape(12, 3, 4, 6))], "Cara 1: 12 + 36 + 12 = 60 cm². Cara 2: 24 + 12 + 24 = 60 cm².", { level: "Sedang" }),
  q(3, "Keliling persegi panjang 36 cm dan panjangnya 10 cm. Tentukan lebar dan luasnya.", [{ kind: "items", unit: "", items: [{ label: "Lebar (cm)", answer: 8 }, { label: "Luas (cm²)", answer: 80 }] }],
    "Panjang + lebar = 36 : 2 = 18, jadi lebar = 8 cm. Luas = 10 × 8 = 80 cm².", { level: "Sedang" }),
  // Menantang (9-17)
  q(0, "Hitunglah luas daerah bangun berikut dengan membilang petak satuan.", [{ kind: "number", label: "Luas =", answer: 20, unit: "satuan luas" }],
    "Kotak 6 × 6 = 36 petak dikurangi 4 pojok yang masing-masing 2 × 2 = 4 petak: 36 − 16 = 20 satuan luas.", { level: "Menantang", scene: gridScene(8, 8, shift(plus, 1, 1)) }),
  q(1, "Hitunglah luas segitiga berikut.", [formula("tri", [12, 7])], "Luas = ½ × 12 × 7 = 42 cm².", { level: "Menantang", scene: shapeScene("tri", [12, 7]) }),
  q(2, "Hitunglah luas bangun berbentuk roket berikut. Tampilkan garis bantu, hitung luas setiap bangun, lalu jumlahkan.", [compose(rocket(8, 3, 7, 2, 3))], "Cara 1: segitiga 12 + persegi panjang 56 + trapesium 30 = 98 cm². Cara 2: 12 + 80 + 3 + 3 = 98 cm².", { level: "Menantang" }),
  q(3, "Kawat 40 cm dibentuk menjadi kerangka persegi panjang. Ukuran manakah yang menghasilkan kerangka paling luas?", [{ kind: "choice", label: "Ukuran terluas", options: ["12 cm × 8 cm", "15 cm × 5 cm", "10 cm × 10 cm", "18 cm × 2 cm"], answer: "10 cm × 10 cm" }],
    "Semua kelilingnya 40 cm. Luasnya 96, 75, 100, dan 36 cm². Persegi 10 × 10 paling luas.", { level: "Menantang" }),
  q(0, "Hitunglah luas segitiga pada kertas berpetak berikut dengan cara Yohana.", [{ kind: "number", label: "Luas =", answer: 16, unit: "satuan luas" }],
    "Pasangkan petak setengah menjadi petak utuh. Luasnya 16 satuan luas, sama dengan ½ × 8 × 4.", { level: "Menantang", scene: gridScene(10, 6, shift([[0, 4], [8, 4], [0, 0]], 1, 1)) }),
  q(1, "Hitunglah luas jajargenjang berikut.", [formula("para", [11, 6])], "Luas = alas × tinggi = 11 × 6 = 66 cm². Sisi miring tidak dipakai.", { level: "Menantang", scene: shapeScene("para", [11, 6]) }),
  q(2, "Bangun berikut tersusun dari jajargenjang, persegi panjang, dan segitiga. Tampilkan garis bantu, hitung luas setiap bangun, lalu jumlahkan.", [compose(paraRectTri(10, 5, 2, 5, 4))], "Cara 1: jajargenjang 50 + persegi panjang 50 + segitiga 10 = 110 cm². Cara 2: 5 + 40 + 5 + trapesium 60 = 110 cm².", { level: "Menantang" }),
  q(3, "Tentukan benar atau salah pernyataan berikut.", [{ kind: "tf", statements: [
    { text: "Persegi panjang 9 cm × 3 cm dan 7 cm × 5 cm memiliki keliling yang sama.", answer: true },
    { text: "Luas kedua persegi panjang itu juga sama.", answer: false },
    { text: "Untuk keliling yang sama, persegi panjang yang paling mendekati persegi memiliki luas paling besar.", answer: true },
  ] }], "Kelilingnya sama-sama 24 cm. Luasnya 27 cm² dan 35 cm², jadi berbeda. Makin mendekati persegi, makin luas.", { level: "Menantang" }),
  q(0, "Tentukan benar atau salah pernyataan berikut tentang lantai yang dipasang ubin 1 m × 1 m.", [{ kind: "tf", statements: [
    { text: "Lantai 4 m × 5 m membutuhkan 20 ubin.", answer: true },
    { text: "Jika dua lantai sama luasnya, banyak ubin yang dibutuhkan tidak sama.", answer: false },
    { text: "Lantai 6 m × 2 m lebih luas daripada lantai 3 m × 3 m.", answer: true },
  ] }], "4 × 5 = 20 ubin. Luas sama berarti ubinnya sama banyak. 6 × 2 = 12 m² lebih dari 3 × 3 = 9 m².", { level: "Menantang" }),
  // Sangat menantang (18-24)
  q(1, "Hitunglah luas trapesium berikut.", [formula("trap", [6, 10, 7])], "Luas = ½ × (6 + 10) × 7 = ½ × 16 × 7 = 56 cm².", { level: "Sangat menantang", scene: shapeScene("trap", [6, 10, 7]) }),
  q(2, "Hitunglah luas bangun berikut. Tampilkan garis bantu, hitung luas setiap bangun, lalu jumlahkan.", [compose(uSlantC)], "Cara 1: 18 + 12 + 12 + segitiga 6 = 48 cm². Cara 2: 27 + 9 + 6 + 6 = 48 cm².", { level: "Sangat menantang" }),
  q(3, "Keliling sebuah persegi 48 cm. Berapa panjang sisi dan luasnya?", [{ kind: "items", unit: "", items: [{ label: "Sisi (cm)", answer: 12 }, { label: "Luas (cm²)", answer: 144 }] }],
    "Sisi = 48 : 4 = 12 cm. Luas = 12 × 12 = 144 cm².", { level: "Sangat menantang" }),
  q(0, "Hitunglah luas daerah bangun A pada kertas berpetak berikut.", [{ kind: "number", label: "Luas =", answer: 24, unit: "satuan luas" }],
    "Petak utuh di bagian persegi 4 × 4 = 16. Bagian atas dan kiri yang miring dapat dipasangkan menjadi 8 petak utuh. Seluruhnya 24 satuan luas.", { level: "Sangat menantang", scene: gridScene(8, 8, shift(pent, 1, 1)) }),
  q(1, "Hitunglah luas layang-layang dengan diagonal 18 cm dan 26 cm.", [formula("kite", [18, 26])], "Luas = ½ × 18 × 26 = 234 cm².", { level: "Sangat menantang", scene: shapeScene("kite", [18, 26]) }),
  q(2, "Hitunglah luas bangun berikut. Cara Yohana membagi menjadi layang-layang dan dua segitiga. Cara Komang membagi menjadi segitiga dan dua trapesium.", [compose(kiteC)], "Cara Yohana: 50 + 16 + 24 = 90 cm². Cara Komang: 20 + 28 + 42 = 90 cm². Hasilnya sama.", { level: "Sangat menantang" }),
  q(3, "Sebuah kebun berbentuk persegi panjang luasnya 48 m². Ukuran manakah yang membutuhkan pagar paling pendek?", [{ kind: "choice", label: "Ukuran kebun", options: ["2 m × 24 m", "3 m × 16 m", "4 m × 12 m", "6 m × 8 m"], answer: "6 m × 8 m" }],
    "Semua luasnya 48 m². Kelilingnya 52 m, 38 m, 32 m, dan 28 m. Ukuran 6 m × 8 m paling mendekati persegi, kelilingnya paling kecil.", { level: "Sangat menantang" }),
];

/** Keterangan ukuran setiap bangun penyusun. */
export function pieceDims(pc: Piece, u = "cm") {
  const v = pc.vals;
  switch (pc.shape) {
    case "rect": return `persegi panjang, panjang ${v[0]} ${u}, lebar ${v[1]} ${u}`;
    case "square": return `persegi, sisi ${v[0]} ${u}`;
    case "tri": return `segitiga, alas ${v[0]} ${u}, tinggi ${v[1]} ${u}`;
    case "para": return `jajargenjang, alas ${v[0]} ${u}, tinggi ${v[1]} ${u}`;
    case "trap": return `trapesium, sisi sejajar ${v[0]} ${u} dan ${v[1]} ${u}, tinggi ${v[2]} ${u}`;
    case "kite": return `layang-layang, diagonal ${v[0]} ${u} dan ${v[1]} ${u}`;
  }
}
export const pieceColors = ["#fde2c8", "#d6ecfa", "#e3f2d8", "#f6dbe8", "#fff3b0"];
/** Gambar bangun gabungan; jika versi dipilih, bangun penyusun diwarnai dan diberi huruf. */
export function composeScene(p: Extract<Part, { kind: "compose" }>, version: number | null): Scene {
  const ver = version === null ? null : p.versions[version];
  const W = Math.max(...p.outline.map(q => q[0])), H = Math.max(...p.outline.map(q => q[1]));
  return { type: "grid", w: W, h: H, plain: true, texts: p.texts,
    polys: [...(ver ? ver.pieces.map((pc, k) => ({ pts: pc.pts, fill: pieceColors[k % pieceColors.length], dashed: true, label: pc.label })) : []), { pts: p.outline, noFill: Boolean(ver) }] };
}
