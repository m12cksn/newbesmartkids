// Kelas 4 Bab 5: Bangun Datar (Matematika SD/MI Kelas IV, Kemendikbudristek).
// A ciri-ciri bangun datar (segi banyak, segitiga, segiempat), B komposisi dan dekomposisi bangun datar.
import type { Question } from "./grade-four-whole-numbers";

/* ====================================================================== */
/* Geometri                                                                */
/* ====================================================================== */
export type Pt = [number, number];
/** Bangun: segi banyak (titik sudut) atau bangun lengkung (path SVG dalam kotak 100 × 100). */
export type Fig = { pts?: Pt[]; d?: string; c?: [number, number, number]; label?: string; color?: string; marks?: boolean; cuts?: [Pt, Pt][] };
const TOL = 0.006;
const near = (a: number, b: number) => Math.abs(a - b) <= TOL * Math.max(1, Math.abs(a), Math.abs(b));
export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const sides = (p: Pt[]) => p.map((a, i) => dist(a, p[(i + 1) % p.length]));
const signedArea = (p: Pt[]) => p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0) / 2;
export const area = (p: Pt[]) => Math.abs(signedArea(p));
/** Sudut dalam (derajat) di setiap titik sudut, termasuk sudut refleks pada bangun cekung. */
export function angles(p: Pt[]): number[] {
  const o = Math.sign(signedArea(p));
  return p.map((b, i) => {
    const a = p[(i - 1 + p.length) % p.length], c = p[(i + 1) % p.length];
    const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
    const ang = (Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]) * 180) / Math.PI;
    // Arah putar menentukan apakah sudut dalam adalah ang atau 360 − ang.
    const inner = o > 0 ? (ang < 0 ? -ang : 360 - ang) : (ang > 0 ? ang : 360 + ang);
    return Math.round(inner * 10) / 10;
  });
}
export type AngleKind = "lancip" | "siku-siku" | "tumpul" | "refleks";
export const angleKind = (a: number): AngleKind => (Math.abs(a - 90) < 1 ? "siku-siku" : a < 90 ? "lancip" : a < 180 ? "tumpul" : "refleks");
export const angleCount = (p: Pt[], k: AngleKind) => angles(p).filter(a => angleKind(a) === k).length;
const parallel = (a: Pt, b: Pt, c: Pt, d: Pt) => { const u = [b[0] - a[0], b[1] - a[1]], v = [d[0] - c[0], d[1] - c[1]]; return Math.abs(u[0] * v[1] - u[1] * v[0]) <= 0.01 * Math.hypot(...u) * Math.hypot(...v); };
export const parallelPairs = (p: Pt[]) => (p.length === 4 ? [parallel(p[0], p[1], p[2], p[3]), parallel(p[1], p[2], p[3], p[0])].filter(Boolean).length : 0);
export const isRegular = (p: Pt[]) => { const s = sides(p), a = angles(p); return s.every(x => near(x, s[0])) && a.every(x => Math.abs(x - a[0]) < 1); };
export const equalSidePairs = (p: Pt[]) => { const s = sides(p); let n = 0; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (near(s[i], s[j])) n++; return n; };
export const polyName = (n: number) => ({ 3: "segitiga", 4: "segiempat", 5: "segilima", 6: "segienam", 7: "segitujuh", 8: "segidelapan" } as Record<number, string>)[n] ?? `segi-${n}`;
/** Nama segitiga menurut sisi dan menurut sudut. */
export function triKind(p: Pt[]) {
  const s = sides(p), eq = equalSidePairs(p), big = Math.max(...angles(p));
  return { bySide: eq === 3 ? "sama sisi" : eq === 1 ? "sama kaki" : "sembarang", byAngle: angleKind(big) === "siku-siku" ? "siku-siku" : big > 90 ? "tumpul" : "lancip", s } as const;
}
/** Semua nama segiempat yang tepat menurut hubungan di buku (persegi juga persegi panjang, dst.). */
export function quadNames(p: Pt[]): string[] {
  const s = sides(p), all = s.every(x => near(x, s[0])), right = angleCount(p, "siku-siku"), par = parallelPairs(p);
  const kite = (near(s[0], s[1]) && near(s[2], s[3])) || (near(s[1], s[2]) && near(s[3], s[0]));
  const out: string[] = [];
  if (all && right === 4) out.push("persegi");
  if (par === 2 && right === 4) out.push("persegi panjang");
  if (all) out.push("belah ketupat");
  if (par === 2) out.push("jajargenjang");
  if (kite && angleCount(p, "refleks") === 0) out.push("layang-layang");
  if (par === 1) out.push("trapesium");
  if (!out.length) out.push("segiempat sembarang");
  return out;
}
/** Nama utama (paling khusus). */
export const quadName = (p: Pt[]) => quadNames(p)[0];
/** Nama bangun untuk menghitung penyusun gambar: segitiga, persegi, persegi panjang, … */
export function shapeName(f: Fig): string {
  if (f.c) return "lingkaran";
  if (!f.pts) return "lengkung";
  if (f.pts.length === 3) return "segitiga";
  if (f.pts.length === 4) { const n = quadNames(f.pts); return n.includes("layang-layang") && n[0] === "layang-layang" ? "layang-layang" : n[0]; }
  return polyName(f.pts.length);
}
/** Dua keping sama bentuk dan ukuran (boleh diputar atau dibalik). */
export const congruent = (a: Pt[], b: Pt[]) => { if (a.length !== b.length || !near(area(a), area(b))) return false; const x = sides(a).sort((m, n) => m - n), y = sides(b).sort((m, n) => m - n); return x.every((v, i) => near(v, y[i])); };
const reg = (n: number, r = 44, rot = -90, cx = 50, cy = 50): Pt[] => Array.from({ length: n }, (_, i) => { const t = ((rot + (360 * i) / n) * Math.PI) / 180; return [Math.round((cx + r * Math.cos(t)) * 100) / 100, Math.round((cy + r * Math.sin(t)) * 100) / 100]; });

/* ---------- Bangun contoh (kotak 100 × 100) ---------- */
export const F = {
  samaSisi: { pts: [[50, 12], [93.3, 87], [6.7, 87]] as Pt[] },
  samaKaki: { pts: [[50, 6], [80, 92], [20, 92]] as Pt[] },
  sembarangLancip: { pts: [[38, 8], [94, 84], [6, 70]] as Pt[] },
  sikuSamaKaki: { pts: [[14, 14], [14, 86], [86, 86]] as Pt[] },
  sikuSembarang: { pts: [[10, 22], [10, 84], [92, 84]] as Pt[] },
  tumpulSembarang: { pts: [[30, 78], [96, 78], [4, 40]] as Pt[] },
  tumpulSamaKaki: { pts: [[4, 72], [96, 72], [50, 40]] as Pt[] },
  persegi: { pts: [[18, 18], [82, 18], [82, 82], [18, 82]] as Pt[] },
  persegiPanjang: { pts: [[4, 28], [96, 28], [96, 72], [4, 72]] as Pt[] },
  jajargenjang: { pts: [[28, 24], [96, 24], [72, 76], [4, 76]] as Pt[] },
  belahKetupat: { pts: [[50, 4], [78, 50], [50, 96], [22, 50]] as Pt[] },
  layang: { pts: [[50, 4], [76, 34], [50, 96], [24, 34]] as Pt[] },
  trapesium: { pts: [[26, 24], [74, 24], [96, 76], [4, 76]] as Pt[] },
  trapesiumSiku: { pts: [[8, 24], [60, 24], [92, 76], [8, 76]] as Pt[] },
  sembarang4: { pts: [[14, 30], [70, 8], [94, 78], [30, 90]] as Pt[] },
  segilima: { pts: reg(5) },
  segienam: { pts: reg(6, 44, 0) },
  segidelapan: { pts: reg(8, 44, -67.5) },
  segienamTak: { pts: [[22, 10], [70, 8], [96, 44], [76, 90], [30, 84], [4, 50]] as Pt[] },
  panah: { pts: [[8, 16], [64, 16], [94, 50], [64, 84], [8, 84], [38, 50]] as Pt[] },
  petir: { pts: [[6, 94], [52, 46], [44, 46], [72, 22], [66, 22], [94, 4], [70, 40], [78, 40], [48, 66], [56, 66]] as Pt[] },
  lingkaran: { c: [50, 50, 42] as [number, number, number] },
  setengahLingkaran: { d: "M6 70 A44 44 0 0 1 94 70 Z" },
  sudutLengkung: { d: "M22 10 H78 A12 12 0 0 0 90 22 V78 A12 12 0 0 0 78 90 H22 A12 12 0 0 0 10 78 V22 A12 12 0 0 0 22 10 Z" },
  sisiOmbak: { d: "M10 12 H90 V74 C70 66 52 96 30 88 C20 84 14 86 10 90 Z" },
  bentukD: { d: "M10 40 C10 6 90 6 90 50 C90 80 60 90 40 90 H10 Z" },
} satisfies Record<string, Fig>;
const L = (f: Fig, label: string, extra: Partial<Fig> = {}): Fig => ({ ...f, label, ...extra });

/* ---------- Benda nyata ---------- */
export type Thing = "papan" | "mur" | "penggaris" | "ban" | "gelang" | "eskrim" | "rambu" | "jam";
export const thingName: Record<Thing, string> = { papan: "papan tulis", mur: "mur", penggaris: "penggaris segitiga", ban: "ban", gelang: "gelang", eskrim: "es krim cone", rambu: "rambu segitiga", jam: "jam dinding" };

/* ---------- Gambar gabungan dan keping ---------- */
/** Satu keping bangun dalam satuan petak. */
export type Piece = { pts?: Pt[]; c?: [number, number, number]; color: string };
export type Scene =
  | { type: "figs"; figs: Fig[] }
  /** Gambar yang tersusun dari beberapa bangun datar. */
  | { type: "mosaic"; name: string; pieces: Piece[] };

/* ====================================================================== */
/* Bagian jawaban                                                          */
/* ====================================================================== */
export type Part =
  | { kind: "fill"; text: string; answers: number[] }
  /** Tabel banyaknya: satu kotak isian untuk setiap nama bangun. */
  | { kind: "count"; labels: string[]; answers: number[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  /** Pilih satu gambar. */
  | { kind: "pick"; label: string; figs: Fig[]; answer: number; same?: boolean }
  /** Pilih semua yang tepat (huruf/nama atau gambar). */
  | { kind: "multi"; label: string; options: string[]; answer: string[]; figs?: Fig[] }
  /** Kelompokkan benda atau bangun ke dua kotak. */
  | { kind: "sort"; items: (Thing | Fig)[]; bins: [string, string]; answer: number[] }
  /** Hubungkan gambar di kiri dengan nama di kanan. */
  | { kind: "match"; left: Fig[]; right: string[]; answer: number[] }
  /** Tabel ciri: centang sel yang benar. */
  | { kind: "table"; rows: string[]; cols: Fig[]; answer: boolean[][] }
  /** Susun keping ke tempatnya pada bangun target. */
  | { kind: "slots"; slots: Pt[][]; pieces: Pt[][]; answer: number[] };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type SQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
const list = (v: string) => (v ? v.split("|") : []);
export const fieldCount = (p: Part) => (p.kind === "fill" || p.kind === "count" ? p.answers.length : p.kind === "sort" ? p.items.length : p.kind === "match" ? p.left.length : p.kind === "slots" ? p.slots.length : p.kind === "table" ? p.rows.length * p.cols.length : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = list(v); return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const toNum = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);
/** Kunci tempat keping: keping pertama yang sama bentuk dan belum terpakai. */
function slotKey(p: Extract<Part, { kind: "slots" }>) { const used = new Set<number>(); return p.slots.map(s => { const k = p.pieces.findIndex((q, i) => !used.has(i) && congruent(q, s)); used.add(k); return k; }); }
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": case "count": return p.answers.join("|");
    case "choice": return p.answer;
    case "pick": return String(p.answer);
    case "multi": return [...p.answer].sort().join("|");
    case "sort": case "match": return p.answer.join("|");
    case "table": return p.answer.flat().map(b => (b ? "1" : "0")).join("|");
    case "slots": return slotKey(p).join("|");
  }
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "fill": case "count": { const got = cells(p, v); return p.answers.every((a, i) => toNum(got[i]) === a); }
    case "multi": return [...list(v)].sort().join("|") === partKey(p);
    case "table": return cells(p, v).map(x => (x === "1" ? "1" : "0")).join("|") === partKey(p);
    case "slots": { const x = cells(p, v); if (x.some(y => y === "") || new Set(x).size !== x.length) return false; return x.every((k, i) => { const q = p.pieces[Number(k)]; return q !== undefined && congruent(q, p.slots[i]); }); }
    default: return v === partKey(p);
  }
}
/** Lengkap (belum tentu benar). */
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "fill" || p.kind === "count" || p.kind === "sort" || p.kind === "match" || p.kind === "slots") return cells(p, v).every(x => x.trim() !== "");
  if (p.kind === "table") return list(v).includes("1");
  return v !== "";
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: SQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: SQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const itemName = (t: Thing | Fig) => (typeof t === "string" ? thingName[t] : `bangun ${t.label}`);
export function formatAnswer(q: SQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "count": return p.labels.map((l, k) => `${l} ${x[k] || "…"}`).join(", ");
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "pick": return `${p.label} ${v[i] ? `gambar ${p.figs[Number(v[i])]?.label ?? Number(v[i]) + 1}` : "…"}`;
      case "multi": return `${p.label} ${list(v[i]).sort().join(", ") || "…"}`;
      case "sort": return p.items.map((t, k) => `${itemName(t)} → ${x[k] ? p.bins[Number(x[k])] : "…"}`).join("; ");
      case "match": return p.left.map((l, k) => `${l.label} → ${x[k] ? p.right[Number(x[k])] : "…"}`).join("; ");
      case "table": return p.rows.map((r, ri) => `${r}: ${p.cols.filter((_, ci) => x[ri * p.cols.length + ci] === "1").map(c => c.label).join(", ") || "tidak ada"}`).join("; ");
      case "slots": return `${x.filter(Boolean).length} dari ${p.slots.length} tempat terisi${partCorrect(p, v[i]) ? " dengan keping yang pas" : ""}`;
    }
  }).join(" | ");
}

/* ====================================================================== */
/* Tangram dan gambar gabungan                                             */
/* ====================================================================== */
/** Tangram 8 × 8: 2 segitiga besar, 1 segitiga sedang, 2 segitiga kecil, 1 persegi, 1 jajargenjang. */
export const tangram: Piece[] = [
  { pts: [[0, 0], [8, 0], [4, 4]], color: "#f4a12f" },
  { pts: [[0, 0], [4, 4], [0, 8]], color: "#4caf50" },
  { pts: [[8, 4], [8, 8], [4, 8]], color: "#e2468e" },
  { pts: [[8, 0], [8, 4], [6, 2]], color: "#7cb8e8" },
  { pts: [[4, 4], [6, 2], [8, 4], [6, 6]], color: "#f6d32d" },
  { pts: [[4, 4], [6, 6], [2, 6]], color: "#2e7d4f" },
  { pts: [[2, 6], [6, 6], [4, 8], [0, 8]], color: "#2f6fb5" },
];
const roket: Piece[] = [
  { pts: [[4, 3], [6, 3], [6, 9], [4, 9]], color: "#d9e3ea" },
  { pts: [[4, 3], [5, 0.6], [6, 3]], color: "#e2574c" },
  { pts: [[4, 6.4], [4, 9], [2.4, 9]], color: "#2f6fb5" },
  { pts: [[6, 6.4], [6, 9], [7.6, 9]], color: "#2f6fb5" },
  { pts: [[4.5, 4], [5.5, 4], [5.5, 5], [4.5, 5]], color: "#7cb8e8" },
  { pts: [[4.3, 9], [5.7, 9], [6.2, 10.4], [3.8, 10.4]], color: "#f4a12f" },
];
const rumah: Piece[] = [
  { pts: [[1, 4], [5, 0.8], [9, 4]], color: "#c4562f" },
  { pts: [[2, 4], [8, 4], [8, 10], [2, 10]], color: "#f3dfa2" },
  { pts: [[4.2, 6.8], [5.8, 6.8], [5.8, 10], [4.2, 10]], color: "#a0672f" },
  { pts: [[2.6, 5], [3.8, 5], [3.8, 6.2], [2.6, 6.2]], color: "#9fd1ec" },
  { pts: [[6.2, 5], [7.4, 5], [7.4, 6.2], [6.2, 6.2]], color: "#9fd1ec" },
];
const paving: Piece[] = [
  { pts: [[0, 0], [3, 0], [0, 3]], color: "#4caf50" },
  { pts: [[3, 0], [6, 0], [3, 3], [0, 3]], color: "#5bbd5f" },
  { pts: [[6, 0], [6, 3], [3, 3]], color: "#4caf50" },
  { pts: [[6, 0], [8, 0], [8, 3], [6, 3]], color: "#5bbd5f" },
  { pts: [[0, 3], [3, 3], [3, 6], [0, 6]], color: "#3f9b45" },
  { pts: [[3, 3], [5, 6], [3, 6]], color: "#5bbd5f" },
  { pts: [[3, 3], [8, 3], [8, 6], [5, 6]], color: "#4caf50" },
];
const ikan: Piece[] = [
  { pts: [[1, 3], [4, 1], [7, 3], [4, 5]], color: "#f4a12f" },
  { pts: [[7, 3], [9.4, 1.4], [9.4, 4.6]], color: "#e2574c" },
  { pts: [[4, 1], [5.6, 0.2], [5.4, 1.9]], color: "#e2574c" },
  { pts: [[3.4, 5.3], [4.6, 5.3], [5.2, 6.3], [2.8, 6.3]], color: "#e2574c" },
  { c: [2.8, 2.8, 0.4], color: "#2b2320" },
];
const pita: Piece[] = [
  { pts: [[0, 0], [2, 0], [2, 5], [0, 5]], color: "#7cb8e8" },
  { pts: [[2, 0], [9, 0], [9, 1], [2, 3]], color: "#e2574c" },
  { pts: [[2, 3], [5.5, 2], [5.5, 4], [2, 5]], color: "#4caf50" },
  { pts: [[5.5, 2], [9, 1], [9, 3], [5.5, 4]], color: "#f6d32d" },
  { pts: [[2, 5], [9, 3], [9, 5]], color: "#f4a12f" },
];
export const mosaics = { roket, rumah, paving, ikan, pita, tangram };
export const pieceFig = (p: Piece): Fig => (p.c ? { c: p.c } : { pts: p.pts });
/** Banyaknya setiap jenis bangun penyusun gambar. */
export const countShapes = (pieces: Piece[]) => pieces.reduce<Record<string, number>>((m, p) => { const n = shapeName(pieceFig(p)); m[n] = (m[n] ?? 0) + 1; return m; }, {});

/* ====================================================================== */
/* Materi                                                                  */
/* ====================================================================== */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Ciri-Ciri Bangun Datar", short: "Ciri-ciri", sections: [
    { title: "Segi banyak, segitiga, dan segiempat", lab: "shape", steps: [
      "Segi banyak adalah kurva tertutup yang dibatasi paling sedikit 3 ruas garis. Lingkaran dan bangun bersisi lengkung bukan segi banyak.",
      "Nama segi banyak mengikuti banyak sisinya: segitiga, segiempat, segilima, segienam. Segi banyak beraturan punya sisi sama panjang dan sudut sama besar.",
      "Segitiga menurut sisi: sama sisi, sama kaki, sembarang. Menurut sudut: lancip, siku-siku, tumpul.",
      "Segiempat: persegi, persegi panjang, jajargenjang, belah ketupat, layang-layang, trapesium, dan segiempat sembarang. Persegi juga persegi panjang dan belah ketupat.",
    ], example: "Papan tulis dan mur termasuk segi banyak. Ban dan gelang bukan, karena sisinya lengkung.", demo: "Ketuk satu titik sudut, lalu ketuk titik lain di petak untuk memindahkannya. Lihat bagaimana nama dan ciri bangunnya berubah." },
  ] },
  { code: "B", title: "Komposisi dan Dekomposisi Bangun Datar", short: "Susun dan urai", sections: [
    { title: "Menyusun dan mengurai bangun datar", lab: "tangram", steps: [
      "Komposisi berarti menyusun beberapa bangun datar menjadi bangun baru, seperti menyusun keping tangram.",
      "Tangram terdiri dari 5 segitiga, 1 persegi, dan 1 jajargenjang. Ketujuh keping itu bisa disusun menjadi persegi besar.",
      "Dekomposisi berarti mengurai satu bangun menjadi beberapa bangun datar, misalnya atap rumah adat menjadi trapesium dan segitiga.",
      "Satu bangun bisa disusun dan diurai dengan berbagai cara. Keping harus pas tanpa celah dan tanpa bertumpuk.",
    ], example: "Dua segitiga siku-siku yang sama dapat disusun menjadi persegi panjang. Persegi dapat diurai menjadi 4 segitiga oleh kedua diagonalnya.", demo: "Ketuk Uraikan untuk melepas keping tangram, lalu susun kembali: ketuk keping, kemudian ketuk tempatnya." },
  ] },
];

/* ====================================================================== */
/* Pembuat soal                                                            */
/* ====================================================================== */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): SQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B] = [make(0), make(1)];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const count = (...rows: [string, number][]): Part => ({ kind: "count", labels: rows.map(r => r[0]), answers: rows.map(r => r[1]) });
const figs = (...f: Fig[]): Scene => ({ type: "figs", figs: f });
const mosaic = (name: string, pieces: Piece[]): Scene => ({ type: "mosaic", name, pieces });
const M = (f: Fig, label: string) => L(f, label, { marks: true });

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: SQuestion[][] = [
  [
    A({ prompt: "Kelompokkan benda menurut bentuk permukaannya.", parts: [{ kind: "sort", items: ["papan", "ban", "mur", "gelang", "penggaris", "eskrim"], bins: ["Segi banyak", "Bukan segi banyak"], answer: [0, 1, 0, 1, 0, 1] }], explanation: "Papan tulis, mur, dan penggaris segitiga dibatasi ruas garis lurus yang tertutup, jadi segi banyak. Ban dan gelang lengkung. Es krim cone punya satu sisi lengkung, jadi bukan segi banyak." }),
    A({ prompt: "Bangun datar yang bukan segi banyak adalah …", parts: [{ kind: "pick", label: "Ketuk gambarnya:", figs: [L(F.belahKetupat, "a"), L(F.trapesium, "b"), L(F.setengahLingkaran, "c"), L(F.sikuSembarang, "d")], answer: 2 }], explanation: "Bangun c punya satu sisi lengkung. Segi banyak semua sisinya ruas garis lurus." }),
    A({ prompt: "Perhatikan bangun ini. Hitung sisi dan sudutnya, lalu beri nama.", scene: figs(F.segienamTak), parts: [fill("Sisi □, sudut □", 6, 6), { kind: "choice", label: "Namanya:", options: ["Segilima", "Segienam", "Segidelapan"], answer: "Segienam" }], explanation: "Bangun ini dibatasi 6 ruas garis dan punya 6 sudut, jadi namanya segienam. Sisinya tidak sama panjang, jadi segienam tak beraturan." }),
    A({ prompt: "Centang ciri yang dimiliki setiap segitiga. Garis kecil menandai sisi yang sama panjang.", parts: [{ kind: "table", rows: ["Memiliki 3 sisi", "Ada 2 sisi sama panjang", "Ketiga sisi sama panjang"], cols: [M(F.samaKaki, "Sama kaki"), M(F.samaSisi, "Sama sisi"), M(F.sembarangLancip, "Sembarang")], answer: [[true, true, true], [true, true, false], [false, true, false]] }], explanation: "Semua segitiga punya 3 sisi. Segitiga sama kaki dan sama sisi punya 2 sisi sama panjang. Hanya segitiga sama sisi yang ketiga sisinya sama panjang." }),
  ],
  [
    B({ prompt: "Susun dua keping ini menjadi persegi panjang. Ketuk keping, lalu ketuk tempatnya.", parts: [{ kind: "slots", slots: [[[0, 0], [4, 0], [0, 2]], [[4, 0], [4, 2], [0, 2]]], pieces: [[[0, 0], [2, 0], [0, 2]], [[0, 0], [4, 0], [0, 2]], [[4, 0], [4, 2], [0, 2]]], answer: [1, 2] }], explanation: "Kedua tempat berbentuk segitiga siku-siku dengan sisi tegak 4 dan 2 petak. Segitiga kecil 2 × 2 tidak pas." }),
    B({ prompt: "Roket ini tersusun dari beberapa bangun datar. Hitung banyak setiap bangun.", scene: mosaic("roket", roket), parts: [count(["Segitiga", 3], ["Persegi panjang", 1], ["Persegi", 1], ["Trapesium", 1])], explanation: "Ujung roket dan dua sayap adalah 3 segitiga. Badannya persegi panjang, jendelanya persegi, dan apinya trapesium." }),
    B({ prompt: "Kedua segitiga ini digeser tanpa diputar sampai sisi miringnya berimpit. Bangun apa yang terbentuk?", scene: { type: "figs", figs: [{ pts: [[0, 0], [8, 0], [0, 4]] }, { pts: [[8, 0], [8, 4], [0, 4]] }] }, parts: [{ kind: "pick", label: "Ketuk bangunnya:", figs: [L(F.trapesium, "a"), L(F.persegiPanjang, "b"), L(F.segilima, "c"), L(F.layang, "d")], answer: 1 }], explanation: "Kedua sudut siku-siku berada di pojok yang berseberangan, sehingga terbentuk persegi panjang." }),
    B({ prompt: "Persegi ini diurai menurut kedua diagonalnya.", scene: figs({ ...F.persegi, cuts: [[[18, 18], [82, 82]], [[82, 18], [18, 82]]] }), parts: [fill("Terbentuk □ segitiga", 4), { kind: "choice", label: "Jenisnya:", options: ["Sama sisi", "Siku-siku sama kaki", "Tumpul"], answer: "Siku-siku sama kaki" }], explanation: "Kedua diagonal persegi sama panjang dan berpotongan tegak lurus di tengah. Terbentuk 4 segitiga siku-siku sama kaki." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
const tumpulSoal = [M(F.tumpulSembarang, "a"), M(F.samaKaki, "b"), M(F.tumpulSamaKaki, "c"), M(F.sikuSamaKaki, "d")];
export const assessment: SQuestion[] = [
  B({ level: "Sedang", prompt: "Rumah ini tersusun dari beberapa bangun datar. Hitung banyak setiap bangun.", scene: mosaic("rumah", rumah), parts: [count(["Segitiga", 1], ["Persegi", 3], ["Persegi panjang", 1])], explanation: "Atapnya segitiga. Dinding dan dua jendela berbentuk persegi, jadi ada 3 persegi. Pintunya persegi panjang." }),
  A({ level: "Sedang", prompt: "Kelompokkan bangun berikut.", parts: [{ kind: "sort", items: [L(F.panah, "a"), L(F.sudutLengkung, "b"), L(F.segidelapan, "c"), L(F.sisiOmbak, "d"), L(F.petir, "e"), L(F.bentukD, "f")], bins: ["Segi banyak", "Bukan segi banyak"], answer: [0, 1, 0, 1, 0, 1] }], explanation: "Bangun a, c, dan e tertutup dan semua sisinya ruas garis lurus, walaupun a dan e cekung. Bangun b, d, dan f punya sisi lengkung." }),
  B({ level: "Sedang", prompt: "Susun perahu dari keping yang tepat. Ketuk keping, lalu ketuk tempatnya.", parts: [{ kind: "slots", slots: [[[3, 0], [3, 3], [1, 3]], [[0, 3], [6, 3], [5, 5], [1, 5]]], pieces: [[[0, 0], [6, 0], [4, 2], [2, 2]], [[0, 0], [3, 0], [0, 3]], [[0, 0], [6, 0], [5, 2], [1, 2]], [[0, 0], [2, 0], [2, 3]]], answer: [3, 2] }], explanation: "Layar adalah segitiga siku-siku dengan sisi 2 dan 3 petak. Badan perahu trapesium dengan sisi atas 6 dan sisi bawah 4 petak." }),
  A({ level: "Sedang", prompt: "Perhatikan bangun 1 sampai 4. Bangun segi banyak beraturan ditunjukkan oleh nomor …", scene: figs(M(F.belahKetupat, "1"), M(F.segienam, "2"), M(F.persegiPanjang, "3"), M(F.samaSisi, "4")), parts: [{ kind: "choice", label: "Jawaban:", options: ["1 dan 3", "1 dan 4", "2 dan 3", "2 dan 4"], answer: "2 dan 4" }], explanation: "Segienam 2 dan segitiga 4 punya sisi sama panjang dan sudut sama besar. Belah ketupat 1 sisinya sama, tetapi sudutnya tidak sama. Persegi panjang 3 sudutnya sama, tetapi sisinya tidak." }),
  B({ level: "Sedang", prompt: "Perhatikan motif paving ini. Pilih semua bangun yang menyusunnya.", scene: mosaic("paving", paving), parts: [{ kind: "multi", label: "Bangun penyusun:", options: ["a", "b", "c", "d", "e", "f", "g", "h"], figs: [L(F.persegi, "a"), L(F.lingkaran, "b"), L(F.sikuSembarang, "c"), L(F.trapesiumSiku, "d"), L(F.segienam, "e"), L(F.persegiPanjang, "f"), L(F.jajargenjang, "g"), L(F.samaSisi, "h")], answer: ["a", "c", "d", "f", "g"] }], explanation: "Paving tersusun dari persegi, segitiga siku-siku, trapesium, persegi panjang, dan jajargenjang. Tidak ada lingkaran, segienam, atau segitiga sama sisi." }),
  A({ level: "Sedang", prompt: "Taman kota berbentuk segilima beraturan dengan panjang setiap sisi 60 m. Budi berlari mengelilinginya 2 kali.", scene: figs(F.segilima), parts: [fill("Satu putaran = □ m", 300), fill("Dua putaran = □ m", 600)], explanation: "Segilima beraturan punya 5 sisi sama panjang: 5 × 60 = 300 m. Dua putaran 2 × 300 = 600 m." }),
  B({ level: "Sedang", prompt: "Ikan ini tersusun dari beberapa bangun datar. Pilih semua bangun yang menyusunnya.", scene: mosaic("ikan", ikan), parts: [{ kind: "multi", label: "Bangun penyusun:", options: ["a", "b", "c", "d", "e", "f"], figs: [L(F.persegi, "a"), L(F.belahKetupat, "b"), L(F.lingkaran, "c"), L(F.segilima, "d"), L(F.samaKaki, "e"), L(F.trapesium, "f")], answer: ["b", "c", "e", "f"] }], explanation: "Badan ikan belah ketupat, ekor dan sirip atas segitiga, sirip bawah trapesium, dan matanya lingkaran. Tidak ada persegi atau segilima." }),
  A({ level: "Sedang", prompt: "Perhatikan bangun ini. Garis kecil menandai sisi yang sama panjang.", scene: figs(M(F.segidelapan, "")), parts: [fill("Sisi □, sudut □", 8, 8), { kind: "choice", label: "Jenisnya:", options: ["Beraturan", "Tak beraturan"], answer: "Beraturan" }], explanation: "Bangun ini segidelapan: 8 sisi dan 8 sudut. Semua sisinya sama panjang dan sudutnya sama besar, jadi segidelapan beraturan." }),

  B({ level: "Menantang", prompt: "Perhatikan tangram ini. Hitung keping menurut bentuk dan ukurannya.", scene: mosaic("tangram", tangram), parts: [count(["Segitiga besar", 2], ["Segitiga sedang", 1], ["Segitiga kecil", 2], ["Persegi", 1], ["Jajargenjang", 1])], explanation: "Tangram punya 7 keping: 2 segitiga besar, 1 segitiga sedang, 2 segitiga kecil, 1 persegi, dan 1 jajargenjang." }),
  A({ level: "Menantang", prompt: "Hitung banyak sudut lancip dan sudut tumpul pada segi banyak tak beraturan ini.", scene: figs({ pts: [[6, 50], [30, 16], [94, 4], [86, 56], [56, 92], [18, 86]] }), parts: [fill("Sudut lancip □, sudut tumpul □", 1, 5)], explanation: "Bangun ini segienam dengan 6 sudut. Hanya sudut di pojok kanan atas yang lancip (kurang dari siku-siku), kelima sudut lainnya tumpul." }),
  B({ level: "Menantang", prompt: "Bangun mana yang TIDAK bisa disusun dari dua segitiga siku-siku yang sama ini?", scene: figs({ pts: [[0, 0], [0, 4], [6, 4]] }, { pts: [[0, 0], [0, 4], [6, 4]] }), parts: [{ kind: "pick", label: "Ketuk bangunnya:", figs: [L(F.persegiPanjang, "a"), L(F.tumpulSamaKaki, "b"), L(F.trapesium, "c"), L(F.jajargenjang, "d")], answer: 2 }], explanation: "Dua segitiga siku-siku yang sama bisa menjadi persegi panjang, segitiga sama kaki, atau jajargenjang. Trapesium tidak bisa, karena sisi sejajarnya tidak sama panjang." }),
  A({ level: "Menantang", prompt: "Centang ciri yang dimiliki setiap segiempat.", parts: [{ kind: "table", rows: ["2 pasang sisi sejajar", "Tepat 1 pasang sisi sejajar", "4 sudut siku-siku", "4 sisi sama panjang"], cols: [L(F.jajargenjang, "Jajargenjang"), L(F.persegiPanjang, "Persegi panjang"), L(F.trapesium, "Trapesium"), L(F.belahKetupat, "Belah ketupat")], answer: [[true, true, false, true], [false, false, true, false], [false, true, false, false], [false, false, false, true]] }], explanation: "Jajargenjang, persegi panjang, dan belah ketupat punya 2 pasang sisi sejajar; trapesium hanya 1 pasang. Hanya persegi panjang yang keempat sudutnya siku-siku, dan hanya belah ketupat yang keempat sisinya sama panjang." }),
  B({ level: "Menantang", prompt: "Susun trapesium dari keping yang tepat. Ketuk keping, lalu ketuk tempatnya.", parts: [{ kind: "slots", slots: [[[0, 4], [2, 0], [2, 4]], [[2, 0], [6, 0], [6, 4], [2, 4]], [[6, 0], [8, 4], [6, 4]]], pieces: [[[0, 0], [4, 0], [4, 4], [0, 4]], [[0, 0], [4, 0], [0, 4]], [[0, 0], [2, 0], [2, 4]], [[0, 0], [4, 0], [4, 2], [0, 2]], [[0, 0], [2, 0], [0, 4]]], answer: [2, 0, 4] }], explanation: "Trapesium ini terdiri dari persegi 4 × 4 di tengah dan dua segitiga siku-siku bersisi 2 dan 4 petak di kiri dan kanan." }),
  A({ level: "Menantang", prompt: "Hubungkan setiap segitiga dengan namanya. Perhatikan tanda sisi dan sudutnya.", parts: [{ kind: "match", left: [M(F.sikuSembarang, "P"), M(F.tumpulSembarang, "Q"), M(F.samaSisi, "R"), M(F.samaKaki, "S")], right: ["Segitiga sama kaki", "Segitiga siku-siku", "Segitiga sama sisi", "Segitiga tumpul"], answer: [1, 3, 2, 0] }], explanation: "P punya sudut siku-siku, Q punya sudut tumpul, R ketiga sisinya sama panjang, dan S dua sisinya sama panjang." }),
  B({ level: "Menantang", prompt: "Segienam beraturan dipotong menjadi 2 trapesium yang sama. Setiap trapesium dapat diurai lagi menjadi segitiga sama sisi.", scene: figs({ ...F.segienam, cuts: [[[6, 50], [94, 50]]] }), parts: [fill("1 trapesium = □ segitiga sama sisi", 3), fill("Segienam = □ segitiga sama sisi", 6)], explanation: "Sisi panjang trapesium sama dengan 2 sisi pendek, sehingga satu trapesium terurai menjadi 3 segitiga sama sisi. Dua trapesium berarti 6 segitiga." }),
  A({ level: "Menantang", prompt: "Perhatikan bangun A dan B. Ciri apa yang dimiliki A tetapi tidak dimiliki B?", scene: figs(M(F.belahKetupat, "A"), M(F.layang, "B")), parts: [{ kind: "choice", label: "Jawaban:", options: ["Diagonalnya berpotongan tegak lurus", "Keempat sisinya sama panjang", "Memiliki 4 sudut", "Ada pasangan sisi berdekatan yang sama panjang"], answer: "Keempat sisinya sama panjang" }], explanation: "A belah ketupat dan B layang-layang. Keduanya punya 4 sudut, sisi berdekatan yang sama panjang, dan diagonal yang tegak lurus. Hanya A yang keempat sisinya sama panjang." }),
  B({ level: "Menantang", prompt: "Satu keping hilang dari persegi ini. Keping mana yang pas mengisinya?", scene: { type: "mosaic", name: "persegi berlubang", pieces: [{ pts: [[0, 0], [4, 0], [2, 2]], color: "#4caf50" }, { pts: [[4, 0], [4, 4], [2, 2]], color: "#f4a12f" }, { pts: [[0, 0], [2, 2], [0, 4]], color: "#7cb8e8" }] }, parts: [{ kind: "pick", label: "Ketuk kepingnya:", same: true, figs: [{ pts: [[0, 0], [4, 0], [0, 4]], label: "a" }, { pts: [[0, 0], [2, 0], [2, 2], [0, 2]], label: "b" }, { pts: [[0, 0], [2, 0], [0, 2]], label: "c" }, { pts: [[0, 0], [4, 0], [2, 2]], label: "d" }], answer: 3 }], explanation: "Celahnya segitiga dengan alas 4 petak di sisi bawah dan puncak di tengah persegi, sama seperti tiga keping lainnya. Keping a terlalu besar, b persegi, dan c terlalu kecil." }),

  A({ level: "Sangat menantang", prompt: "Pilih semua nama yang tepat untuk segitiga ini.", scene: figs(M(F.sikuSamaKaki, "")), parts: [{ kind: "multi", label: "Nama segitiga:", options: ["Sama kaki", "Sama sisi", "Sembarang", "Lancip", "Siku-siku", "Tumpul"], answer: ["Sama kaki", "Siku-siku"] }], explanation: "Dua sisi tegaknya sama panjang, jadi segitiga sama kaki. Satu sudutnya siku-siku, jadi juga segitiga siku-siku. Segitiga bisa sekaligus siku-siku dan sama kaki." }),
  B({ level: "Sangat menantang", prompt: "Susun segitiga besar ini dari 4 keping yang tepat. Ketuk keping, lalu ketuk tempatnya.", parts: [{ kind: "slots", slots: [[[0, 8], [8, 8], [4, 4]], [[0, 4], [4, 4], [0, 8]], [[0, 0], [2, 2], [0, 4]], [[0, 4], [2, 2], [4, 4]]], pieces: [[[0, 0], [2, 2], [0, 4]], [[0, 0], [4, 0], [4, 4], [0, 4]], [[0, 0], [8, 0], [4, 4]], [[0, 0], [4, 0], [0, 4]], [[0, 0], [2, 0], [4, 2], [2, 2]], [[0, 0], [4, 0], [2, 2]]], answer: [2, 3, 0, 5] }], explanation: "Segitiga besar terurai menjadi 1 segitiga besar (alas 8), 1 segitiga sedang (sisi tegak 4), dan 2 segitiga kecil (sisi miring 4). Persegi dan jajargenjang tidak dipakai." }),
  A({ level: "Sangat menantang", prompt: "Pilih semua nama yang tepat untuk bangun ini.", scene: figs(M(F.persegi, "")), parts: [{ kind: "multi", label: "Nama bangun:", options: ["Persegi", "Persegi panjang", "Belah ketupat", "Jajargenjang", "Layang-layang", "Trapesium"], answer: ["Persegi", "Persegi panjang", "Belah ketupat", "Jajargenjang", "Layang-layang"] }], explanation: "Persegi punya 4 sudut siku-siku dan 4 sisi sama panjang, jadi juga persegi panjang dan belah ketupat. Belah ketupat termasuk jajargenjang dan layang-layang. Persegi bukan trapesium karena sisi sejajarnya 2 pasang." }),
  B({ level: "Sangat menantang", prompt: "Persegi panjang ini diurai menjadi beberapa bangun. Hitung banyak setiap bangun.", scene: mosaic("persegi panjang terurai", pita), parts: [count(["Persegi panjang", 1], ["Trapesium", 1], ["Jajargenjang", 2], ["Segitiga", 1])], explanation: "Bagian kiri persegi panjang. Bagian atas trapesium karena hanya sepasang sisinya sejajar. Dua pita miring jajargenjang, dan bagian kanan bawah segitiga." }),
  A({ level: "Sangat menantang", prompt: "Kelompokkan segiempat berikut: termasuk jajargenjang atau bukan?", parts: [{ kind: "sort", items: [L(F.persegiPanjang, "a"), L(F.trapesium, "b"), L(F.belahKetupat, "c"), L(F.layang, "d"), L(F.persegi, "e")], bins: ["Jajargenjang", "Bukan jajargenjang"], answer: [0, 1, 0, 1, 0] }], explanation: "Persegi panjang, belah ketupat, dan persegi punya 2 pasang sisi sejajar, jadi termasuk jajargenjang. Trapesium hanya 1 pasang, dan layang-layang tidak punya sisi sejajar." }),
  B({ level: "Sangat menantang", prompt: "Persegi panjang ini diurai menurut kedua diagonalnya. Segitiga apa yang terbentuk?", scene: figs({ ...F.persegiPanjang, cuts: [[[4, 28], [96, 72]], [[96, 28], [4, 72]]] }), parts: [{ kind: "choice", label: "Jawaban:", options: ["4 segitiga sama sisi", "4 segitiga siku-siku", "4 segitiga sama kaki", "2 segitiga sama sisi dan 2 siku-siku"], answer: "4 segitiga sama kaki" }], explanation: "Kedua diagonal persegi panjang sama panjang dan saling membagi dua. Jadi setiap segitiga punya 2 sisi sama panjang: semuanya sama kaki. Sudut di tengah tidak siku-siku, karena persegi panjang ini bukan persegi." }),
  A({ level: "Sangat menantang", prompt: "Segitiga mana yang tumpul sekaligus sama kaki?", parts: [{ kind: "pick", label: "Ketuk segitiganya:", figs: tumpulSoal, answer: 2 }], explanation: "Segitiga a tumpul tetapi sisinya tidak ada yang sama. Segitiga b sama kaki tetapi lancip, d sama kaki tetapi siku-siku. Hanya c yang tumpul dan punya 2 sisi sama panjang." }),
];
