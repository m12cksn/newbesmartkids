import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 5 Bab 7 - Membandingkan Ciri-Ciri Bangun Datar (Buku Matematika SD/MI Kelas V, hlm. 191-234).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 * Semua ciri bangun (sisi sejajar, sisi sama panjang, sudut, simetri) dihitung dari koordinat titik sudutnya.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Pt = [number, number];

/* ---------- Geometri ---------- */
const EPS = 1e-6;
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const len = (v: Pt) => Math.hypot(v[0], v[1]);
const near = (a: number, b: number, t = 1e-3) => Math.abs(a - b) < t * Math.max(1, Math.abs(a), Math.abs(b));
export const sideLengths = (pts: Pt[]) => pts.map((p, i) => len(sub(pts[(i + 1) % pts.length], p)));
/** Sudut dalam (derajat) di setiap titik; poligon boleh cekung. */
export function interiorAngles(pts: Pt[]): number[] {
  const n = pts.length, area = pts.reduce((a, p, i) => { const q = pts[(i + 1) % n]; return a + p[0] * q[1] - q[0] * p[1]; }, 0), s = Math.sign(area);
  return pts.map((p, i) => {
    const u = sub(pts[(i + n - 1) % n], p), v = sub(pts[(i + 1) % n], p);
    let a = (Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]) * 180) / Math.PI;
    a = s > 0 ? -a : a; if (a < 0) a += 360;
    return a;
  });
}
const parallel = (a: Pt, b: Pt) => Math.abs(a[0] * b[1] - a[1] * b[0]) < 1e-3 * len(a) * len(b);
/** Banyak sumbu simetri (simetri lipat). */
export function mirrorAxes(pts: Pt[]): number {
  const n = pts.length, c: Pt = [pts.reduce((a, p) => a + p[0], 0) / n, pts.reduce((a, p) => a + p[1], 0) / n];
  const cands = [...pts, ...pts.map((p, i) => [(p[0] + pts[(i + 1) % n][0]) / 2, (p[1] + pts[(i + 1) % n][1]) / 2] as Pt)];
  const dirs: number[] = [];
  for (const p of cands) {
    const d = sub(p, c); if (len(d) < EPS) continue;
    const ang = ((Math.atan2(d[1], d[0]) * 180) / Math.PI + 360) % 180;
    if (dirs.some(x => Math.abs(x - ang) < 0.5 || Math.abs(x - ang) > 179.5)) continue;
    const ux = d[0] / len(d), uy = d[1] / len(d);
    const refl = pts.map(([x, y]): Pt => { const rx = x - c[0], ry = y - c[1], dot = rx * ux + ry * uy; return [c[0] + 2 * dot * ux - rx, c[1] + 2 * dot * uy - ry]; });
    if (refl.every(r => pts.some(p => len(sub(p, r)) < 1e-3 * (1 + len(sub(p, c)))))) dirs.push(ang);
  }
  return dirs.length;
}
/** Banyak simetri putar (termasuk satu putaran penuh), seperti di buku. */
export function rotationOrder(pts: Pt[]): number {
  const n = pts.length, c: Pt = [pts.reduce((a, p) => a + p[0], 0) / n, pts.reduce((a, p) => a + p[1], 0) / n];
  let best = 1;
  for (let m = 2; m <= n; m++) {
    const t = (2 * Math.PI) / m, rot = pts.map(([x, y]): Pt => { const rx = x - c[0], ry = y - c[1]; return [c[0] + rx * Math.cos(t) - ry * Math.sin(t), c[1] + rx * Math.sin(t) + ry * Math.cos(t)]; });
    if (rot.every(r => pts.some(p => len(sub(p, r)) < 1e-3 * (1 + len(sub(p, c)))))) best = m;
  }
  return best;
}
export const canForm = (a: number, b: number, c: number) => a < b + c && b < a + c && c < a + b;
export type TriAngleKind = "Lancip" | "Siku-siku" | "Tumpul";
export type TriSideKind = "Sama sisi" | "Sama kaki" | "Sembarang";
export function triAngleKind(pts: Pt[]): TriAngleKind { const m = Math.max(...interiorAngles(pts)); return Math.abs(m - 90) < 0.5 ? "Siku-siku" : m > 90 ? "Tumpul" : "Lancip"; }
export function triSideKind(pts: Pt[]): TriSideKind { const [a, b, c] = sideLengths(pts), e = [near(a, b), near(b, c), near(a, c)].filter(Boolean).length; return e === 3 ? "Sama sisi" : e ? "Sama kaki" : "Sembarang"; }
export type QuadInfo = { parallelPairs: number; allEqual: boolean; rights: number; axes: number; rot: number; kite: boolean; convex: boolean };
export function quadInfo(pts: Pt[]): QuadInfo {
  const s = sideLengths(pts), e = (i: number) => sub(pts[(i + 1) % 4], pts[i]), ang = interiorAngles(pts);
  const parallelPairs = (parallel(e(0), e(2)) ? 1 : 0) + (parallel(e(1), e(3)) ? 1 : 0);
  const kite = ((near(s[0], s[1]) && near(s[2], s[3])) || (near(s[1], s[2]) && near(s[3], s[0])));
  return { parallelPairs, allEqual: s.every(x => near(x, s[0])), rights: ang.filter(a => Math.abs(a - 90) < 0.5).length, axes: mirrorAxes(pts), rot: rotationOrder(pts), kite, convex: ang.every(a => a < 180) };
}
/** Semua nama yang boleh dipakai untuk segi empat ini (definisi buku, inklusif). */
export function quadNames(pts: Pt[]): string[] {
  if (pts.length !== 4) return [];
  const q = quadInfo(pts), out = ["Segi empat"];
  if (q.parallelPairs >= 1) out.push("Trapesium");
  if (q.parallelPairs === 1 && q.rights >= 1) out.push("Trapesium siku-siku");
  if (q.parallelPairs === 1 && q.axes >= 1) out.push("Trapesium sama kaki");
  if (q.parallelPairs === 2) out.push("Jajargenjang");
  if (q.parallelPairs === 2 && q.rights >= 1) out.push("Persegi panjang");
  if (q.parallelPairs === 2 && q.allEqual) out.push("Belah ketupat");
  if (q.parallelPairs === 2 && q.rights >= 1 && q.allEqual) out.push("Persegi");
  if (q.kite && q.convex) out.push("Layang-layang");
  return out;
}
/** Nama yang paling tepat. */
export function bestName(pts: Pt[]): string {
  const n = quadNames(pts);
  for (const x of ["Persegi", "Persegi panjang", "Belah ketupat", "Jajargenjang", "Layang-layang", "Trapesium siku-siku", "Trapesium sama kaki", "Trapesium"]) if (n.includes(x)) return x;
  return "Segi empat";
}
/** Segitiga dengan alas 6 dan sudut alas A, B (derajat). */
export function triFromAngles(A: number, B: number, base = 6): Pt[] {
  const C = 180 - A - B, b = (base * Math.sin((B * Math.PI) / 180)) / Math.sin((C * Math.PI) / 180);
  const x = b * Math.cos((A * Math.PI) / 180), y = b * Math.sin((A * Math.PI) / 180);
  return [[0, y], [base, y], [x, 0]];
}
/** Segitiga dari panjang sisi a (alas), b (kanan), c (kiri). */
export function triFromSides(a: number, b: number, c: number): Pt[] {
  const x = (a * a + c * c - b * b) / (2 * a), y = Math.sqrt(Math.max(c * c - x * x, 0));
  return [[0, y], [a, y], [x, 0]];
}

/* ---------- Gambar ---------- */
export type Fig = { pts?: Pt[]; circle?: boolean; angleLabels?: (string | null)[]; plain?: boolean; names?: boolean };
export type Scene = { type: "fig"; fig: Fig } | { type: "figs"; items: { fig: Fig; label: string }[] };

export type Part =
  | { kind: "number"; label: string; answer: number; unit?: string }
  | { kind: "items"; items: { label: string; answer: number }[] }
  /** Tabel sedotan: Bisa/Tidak lalu b+c, a+c, a+b. */
  | { kind: "straws"; rows: [number, number, number][] }
  | { kind: "classify"; rows: { text: string; fig?: Fig }[]; options: string[]; answers: string[] }
  /** Ketuk semua gambar yang memenuhi syarat. */
  | { kind: "select"; label: string; figs: Fig[]; answer: number[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[]; labels?: [string, string] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type SQuestion = Question & { topic: 0 | 1; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Isian ---------- */
export const fieldCount = (p: Part) => (p.kind === "items" ? p.items.length : p.kind === "straws" ? p.rows.length * 4 : p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : 1);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "number": return [String(p.answer)];
    case "items": return p.items.map(i => String(i.answer));
    case "straws": return p.rows.flatMap(([a, b, c]) => [canForm(a, b, c) ? "Bisa" : "Tidak", String(b + c), String(a + c), String(a + b)]);
    case "classify": return p.answers;
    case "select": return [[...p.answer].sort((a, b) => a - b).join(",")];
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v), want = fields(p);
  if (p.kind === "select") return [...(v ? v.split(",").map(Number) : [])].sort((a, b) => a - b).join(",") === want[0];
  if (p.kind === "number" || p.kind === "items") return want.every((w, i) => int(x[i]) === Number(w));
  if (p.kind === "straws") return want.every((w, i) => (i % 4 === 0 ? x[i] === w : int(x[i]) === Number(w)));
  return x.join("|") === want.join("|");
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "number" || p.kind === "items") return x.every(y => !Number.isNaN(int(y)));
  if (p.kind === "straws") return x.every((y, i) => (i % 4 === 0 ? Boolean(y) : !Number.isNaN(int(y))));
  return x.every(Boolean);
}
export const correct = (q: SQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: SQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const letter = (k: number) => String.fromCharCode(65 + k);
export function formatAnswer(q: SQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => s || "…";
    switch (p.kind) {
      case "number": return `${p.label} ${d(x[0])}${p.unit ?? ""}`;
      case "items": return p.items.map((it, k) => `${it.label} ${d(x[k])}`).join(", ");
      case "straws": return p.rows.map(([a, b, c], k) => `${a}, ${b}, ${c}: ${d(x[4 * k])} (b+c ${d(x[4 * k + 1])}, a+c ${d(x[4 * k + 2])}, a+b ${d(x[4 * k + 3])})`).join("; ");
      case "classify": return p.rows.map((r, k) => `${r.text}: ${d(x[k])}`).join("; ");
      case "select": return v[i] ? `bangun ${v[i].split(",").map(k => letter(Number(k))).join(", ")}` : "belum ada yang dipilih";
      case "tf": { const [y, n] = p.labels ?? ["Benar", "Salah"]; return p.statements.map((_, k) => (x[k] === "B" ? y : x[k] === "S" ? n : "…")).join(", "); }
      default: return d(v[i]);
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: SQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): SQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const F = (pts: Pt[], extra: Partial<Fig> = {}): Fig => ({ pts, ...extra });
const H3 = Math.sqrt(27);
export const shapes = {
  // segitiga
  acute: [[0, 5], [8, 5], [3, 0]] as Pt[],
  right: [[0, 0], [0, 5], [6, 5]] as Pt[],
  obtuse: [[0, 5], [8, 5], [-2, 2]] as Pt[],
  equi: [[0, H3], [6, H3], [3, 0]] as Pt[],
  iso: [[0, 6], [6, 6], [3, 0]] as Pt[],
  scal: [[0, 5], [8, 5], [2, 0]] as Pt[],
  rightIso: [[0, 0], [0, 5], [5, 5]] as Pt[],
  obtuseIso: [[0, 2], [8, 2], [4, 0]] as Pt[],
  // segi empat
  par: [[2, 0], [8, 0], [6, 4], [0, 4]] as Pt[],
  rect: [[0, 0], [7, 0], [7, 4], [0, 4]] as Pt[],
  rhombus: [[3, 0], [6, 4], [3, 8], [0, 4]] as Pt[],
  square: [[0, 0], [5, 0], [5, 5], [0, 5]] as Pt[],
  kite: [[3, 0], [5, 3], [3, 8], [1, 3]] as Pt[],
  trapIso: [[2, 0], [6, 0], [8, 4], [0, 4]] as Pt[],
  trapRight: [[0, 0], [4, 0], [7, 4], [0, 4]] as Pt[],
  trapGen: [[1, 0], [5, 0], [8, 4], [0, 4]] as Pt[],
  quadGen: [[0, 1], [6, 0], [7, 5], [1, 4]] as Pt[],
  dart: [[0, 6], [2, 0], [7, 4], [3, 3.2]] as Pt[],
  // lainnya
  pent: [[2, 0], [6, 1], [6, 5], [1, 5], [0, 2]] as Pt[],
  chevron: [[0, 0], [3, 2], [6, 0], [5, 3], [1, 3]] as Pt[],
  hexa: [[1, 0], [5, 0], [6, 2], [5, 4], [1, 4], [0, 2]] as Pt[],
  star: Array.from({ length: 10 }, (_, k): Pt => { const r = k % 2 ? 2 : 5, a = -Math.PI / 2 + (k * Math.PI) / 5; return [5 + r * Math.cos(a), 5 + r * Math.sin(a)]; }),
};
const C: Fig = { circle: true };
const S = shapes;

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Membandingkan Ciri-Ciri Segitiga", short: "Segitiga",
    steps: [
      "Tiga sedotan dapat dibentuk menjadi segitiga jika jumlah panjang dua sisi selalu lebih dari panjang sisi ketiga. Sedotan 5 cm, 4 cm, 12 cm tidak bisa karena 5 + 4 kurang dari 12.",
      "Menurut sudutnya: segitiga lancip (ketiga sudutnya lancip), segitiga siku-siku (salah satu sudutnya siku-siku), segitiga tumpul (salah satu sudutnya tumpul).",
      "Jumlah sudut-sudut dalam segitiga selalu 180°. Karena itu segitiga tidak mungkin punya dua sudut siku-siku atau dua sudut tumpul.",
      "Menurut sisinya: segitiga sama kaki setidaknya punya 2 sisi sama panjang, 2 sudut sama besar, 1 simetri lipat, dan 1 simetri putar. Segitiga sama sisi punya 3 sisi sama panjang, 3 sudut 60°, 3 simetri lipat, 3 simetri putar, sehingga juga termasuk segitiga sama kaki. Segitiga sembarang sisinya berbeda semua.",
    ],
    demo: "Atur panjang tiga sedotan. Lihat apakah segitiga terbentuk, berapa besar sudut-sudutnya, dan apa nama segitiganya.",
  },
  {
    code: "B", title: "Membandingkan Ciri-Ciri Segi Empat", short: "Segi empat",
    steps: [
      "Segi empat adalah bangun datar yang dibatasi empat sisi. Trapesium adalah segi empat yang mempunyai setidaknya sepasang sisi sejajar.",
      "Jajargenjang: sisi berhadapan sejajar dan sama panjang, sudut berhadapan sama besar. Jajargenjang termasuk trapesium, tetapi bukan trapesium sama kaki.",
      "Persegi panjang adalah jajargenjang yang salah satu sudutnya siku-siku. Belah ketupat adalah jajargenjang dengan sisi-sisi berurutan sama panjang, dan juga layang-layang yang semua diagonalnya sumbu simetri.",
      "Persegi adalah belah ketupat yang salah satu sudutnya siku-siku, juga persegi panjang yang sisi-sisi berurutannya sama panjang. Layang-layang adalah segi empat yang salah satu diagonalnya sumbu simetri.",
    ],
    demo: "Pilih keluarga bangun lalu ubah ukuran dan sudutnya. Perhatikan ciri-cirinya dan nama-nama yang boleh dipakai berubah.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: SQuestion[][] = [
  [
    q(0, "Tiga sedotan dirangkai dengan tali. Isi tabel: apakah bisa membentuk segitiga, lalu hitung jumlah sisi-sisinya.", [{ kind: "straws", rows: [[4, 6, 6], [5, 4, 12], [5, 12, 13]] }],
      "4, 6, 6 bisa: 12 > 4 dan 10 > 6. 5, 4, 12 tidak bisa: 5 + 4 = 9 kurang dari 12. 5, 12, 13 bisa: 5 + 12 = 17 > 13."),
    q(0, "Tentukan jenis setiap segitiga berikut menurut besar sudutnya.", [{ kind: "classify", options: ["Lancip", "Siku-siku", "Tumpul"], rows: [{ text: "Segitiga 1", fig: F(S.acute) }, { text: "Segitiga 2", fig: F(S.right) }, { text: "Segitiga 3", fig: F(S.obtuse) }], answers: ["Lancip", "Siku-siku", "Tumpul"] }],
      "Segitiga 1 ketiga sudutnya lancip. Segitiga 2 punya satu sudut siku-siku. Segitiga 3 punya satu sudut tumpul."),
    q(0, "Dua sudut sebuah segitiga besarnya 65° dan 48°. Berapa besar sudut ketiganya?", [{ kind: "number", label: "Sudut ketiga =", answer: 67, unit: "°" }],
      "Jumlah sudut segitiga 180°. 180° − 65° − 48° = 67°.", { scene: { type: "fig", fig: F(triFromAngles(65, 48), { angleLabels: ["65°", "48°", "?"] }) } }),
    q(0, "Tentukan jenis setiap segitiga berikut menurut panjang sisinya. Garis kecil menandai sisi yang sama panjang.", [{ kind: "classify", options: ["Sama sisi", "Sama kaki", "Sembarang"], rows: [{ text: "Segitiga 1", fig: F(S.iso) }, { text: "Segitiga 2", fig: F(S.scal) }, { text: "Segitiga 3", fig: F(S.equi) }], answers: ["Sama kaki", "Sembarang", "Sama sisi"] }],
      "Segitiga 1 dua sisinya sama panjang. Segitiga 2 ketiga sisinya berbeda. Segitiga 3 ketiga sisinya sama panjang."),
  ],
  [
    q(1, "Ketuk semua bangun yang merupakan segi empat.", [{ kind: "select", label: "Segi empat", figs: [F(S.quadGen), F(S.trapIso), F(S.obtuse), F(S.chevron), F(S.star), F(S.kite), F(S.pent), F(S.dart), C], answer: [0, 1, 5, 7] }],
      "Segi empat dibatasi tepat empat sisi: A, B, F, dan H (H cekung tetapi tetap bersisi empat). C segitiga, D, E, dan G bersisi lebih dari empat, I lingkaran."),
    q(1, "Bandingkan persegi panjang dengan ciri-ciri jajargenjang. Jawab Ya atau Tidak.", [{ kind: "tf", labels: ["Ya", "Tidak"], statements: [
      { text: "Sisi-sisi persegi panjang yang berhadapan sejajar.", answer: true },
      { text: "Sisi-sisi persegi panjang yang berhadapan sama panjang.", answer: true },
      { text: "Sudut-sudut persegi panjang yang berhadapan sama besar.", answer: true },
      { text: "Persegi panjang tidak dapat digolongkan sebagai jajargenjang.", answer: false },
    ] }], "Semua ciri jajargenjang dimiliki persegi panjang, jadi persegi panjang termasuk jajargenjang.", { scene: { type: "fig", fig: F(S.rect) } }),
    q(1, "Perhatikan trapesium berikut. Apa jenisnya, dan berapa banyak sudut siku-sikunya?", [{ kind: "choice", label: "Jenis trapesium", options: ["Trapesium sama kaki", "Trapesium siku-siku", "Trapesium sembarang"], answer: "Trapesium siku-siku" }, { kind: "number", label: "Banyak sudut siku-siku =", answer: 2 }],
      "Sisi kiri tegak lurus terhadap sisi atas dan bawah, jadi ada 2 sudut siku-siku. Trapesium ini trapesium siku-siku.", { scene: { type: "fig", fig: F(S.trapRight) } }),
    q(1, "Tentukan benar atau salah pernyataan berikut.", [{ kind: "tf", statements: [
      { text: "Persegi panjang adalah jajargenjang yang salah satu sudutnya siku-siku.", answer: true },
      { text: "Jajargenjang dapat digolongkan sebagai trapesium.", answer: true },
      { text: "Sembarang jajargenjang boleh disebut belah ketupat.", answer: false },
    ] }], "Jajargenjang punya dua pasang sisi sejajar, jadi termasuk trapesium. Tetapi jajargenjang belum tentu sisi-sisinya sama panjang, jadi belum tentu belah ketupat."),
  ],
];

/* ---------- Evaluasi: 24 soal, A dan B bergantian ---------- */
export const assessment: SQuestion[] = [
  // Sedang (1-8)
  q(0, "Isi tabel percobaan sedotan berikut.", [{ kind: "straws", rows: [[6, 8, 10], [3, 4, 9], [7, 7, 7]] }],
    "6, 8, 10 bisa (6 + 8 = 14 > 10). 3, 4, 9 tidak bisa (3 + 4 = 7 < 9). 7, 7, 7 bisa dan menjadi segitiga sama sisi.", { level: "Sedang" }),
  q(1, "Ketuk semua bangun yang merupakan segi empat.", [{ kind: "select", label: "Segi empat", figs: [F(S.hexa), F(S.par), F(S.right), F(S.dart), F(S.trapGen), C, F(S.rhombus), F(S.pent)], answer: [1, 3, 4, 6] }],
    "B jajargenjang, D bangun cekung bersisi empat, E trapesium, G belah ketupat. A dan H bersisi lebih dari empat, C segitiga, F lingkaran.", { level: "Sedang" }),
  q(0, "Dua sudut sebuah segitiga besarnya 50° dan 70°. Berapa besar sudut ketiganya?", [{ kind: "number", label: "Sudut ketiga =", answer: 60, unit: "°" }],
    "180° − 50° − 70° = 60°.", { level: "Sedang", scene: { type: "fig", fig: F(triFromAngles(50, 70), { angleLabels: ["50°", "70°", "?"] }) } }),
  q(1, "Perhatikan trapesium berikut. Apa jenisnya, dan berapa banyak simetri lipatnya?", [{ kind: "choice", label: "Jenis trapesium", options: ["Trapesium siku-siku", "Trapesium sembarang", "Trapesium sama kaki"], answer: "Trapesium sama kaki" }, { kind: "number", label: "Banyak simetri lipat =", answer: 1 }],
    "Kedua kakinya sama panjang dan sudut-sudut alasnya sama besar. Trapesium sama kaki punya 1 simetri lipat.", { level: "Sedang", scene: { type: "fig", fig: F(S.trapIso) } }),
  q(0, "Tentukan jenis setiap segitiga berikut menurut besar sudutnya.", [{ kind: "classify", options: ["Lancip", "Siku-siku", "Tumpul"], rows: [{ text: "Segitiga 1", fig: F(S.obtuseIso) }, { text: "Segitiga 2", fig: F(S.equi) }, { text: "Segitiga 3", fig: F(S.rightIso) }, { text: "Segitiga 4", fig: F(S.scal) }], answers: ["Tumpul", "Lancip", "Siku-siku", "Lancip"] }],
    "Segitiga 1 punya sudut puncak tumpul. Segitiga 2 semua sudutnya 60°. Segitiga 3 punya sudut siku-siku. Segitiga 4 semua sudutnya lancip.", { level: "Sedang" }),
  q(1, "Periksa ciri-ciri jajargenjang berikut. Jawab Ya atau Tidak.", [{ kind: "tf", labels: ["Ya", "Tidak"], statements: [
    { text: "Sisi-sisi yang berhadapan sejajar.", answer: true },
    { text: "Sisi-sisi yang berhadapan sama panjang.", answer: true },
    { text: "Semua sudutnya siku-siku.", answer: false },
    { text: "Mempunyai sumbu simetri.", answer: false },
  ] }], "Jajargenjang punya dua pasang sisi sejajar dan sama panjang, tetapi sudutnya tidak siku-siku dan tidak punya sumbu simetri.", { level: "Sedang", scene: { type: "fig", fig: F(S.par) } }),
  q(0, "Tentukan jenis setiap segitiga berikut menurut panjang sisinya.", [{ kind: "classify", options: ["Sama sisi", "Sama kaki", "Sembarang"], rows: [{ text: "Segitiga 1", fig: F(S.rightIso) }, { text: "Segitiga 2", fig: F(S.obtuse) }, { text: "Segitiga 3", fig: F(S.obtuseIso) }], answers: ["Sama kaki", "Sembarang", "Sama kaki"] }],
    "Segitiga 1 dan 3 punya dua sisi sama panjang. Segitiga 2 ketiga sisinya berbeda.", { level: "Sedang" }),
  q(1, "Apa nama yang paling tepat untuk setiap bangun berikut?", [{ kind: "classify", options: ["Trapesium", "Jajargenjang", "Persegi panjang", "Layang-layang", "Persegi"], rows: [{ text: "Bangun 1", fig: F(S.par) }, { text: "Bangun 2", fig: F(S.kite) }, { text: "Bangun 3", fig: F(S.square) }, { text: "Bangun 4", fig: F(S.trapGen) }], answers: ["Jajargenjang", "Layang-layang", "Persegi", "Trapesium"] }],
    "Bangun 1 sisi berhadapannya sejajar: jajargenjang. Bangun 2 dua pasang sisi berurutan sama panjang: layang-layang. Bangun 3 semua sisi sama dan siku-siku: persegi. Bangun 4 hanya sepasang sisi sejajar: trapesium.", { level: "Sedang" }),
  // Menantang (9-17)
  q(0, "Berapa besar sudut pada kaki-kaki segitiga siku-siku sama kaki?", [{ kind: "number", label: "Setiap sudut kaki =", answer: 45, unit: "°" }],
    "Satu sudut 90°, sisanya 180° − 90° = 90° dibagi dua sudut yang sama besar: 45°.", { level: "Menantang", scene: { type: "fig", fig: F(S.rightIso, { angleLabels: ["?", "90°", "?"] }) } }),
  q(1, "Berapa banyak simetri lipat dan simetri putar setiap bangun berikut?", [{ kind: "items", items: [{ label: "Persegi panjang, simetri lipat:", answer: 2 }, { label: "Persegi panjang, simetri putar:", answer: 2 }, { label: "Belah ketupat, simetri lipat:", answer: 2 }, { label: "Layang-layang, simetri lipat:", answer: 1 }] }],
    "Persegi panjang dapat dilipat menurut 2 garis tengahnya dan menempati bingkainya 2 kali dalam satu putaran. Belah ketupat sumbu simetrinya kedua diagonal. Layang-layang hanya satu diagonal.",
    { level: "Menantang", scene: { type: "figs", items: [{ fig: F(S.rect), label: "Persegi panjang" }, { fig: F(S.rhombus), label: "Belah ketupat" }, { fig: F(S.kite), label: "Layang-layang" }] } }),
  q(0, "Berapa besar setiap sudut segitiga sama sisi, dan berapa simetri lipat serta simetri putarnya?", [{ kind: "items", items: [{ label: "Besar setiap sudut (°):", answer: 60 }, { label: "Simetri lipat:", answer: 3 }, { label: "Simetri putar:", answer: 3 }] }],
    "Ketiga sudutnya sama besar: 180° : 3 = 60°. Segitiga sama sisi punya 3 simetri lipat dan 3 simetri putar.", { level: "Menantang", scene: { type: "fig", fig: F(S.equi) } }),
  q(1, "Ketuk semua bangun yang dapat digolongkan sebagai jajargenjang.", [{ kind: "select", label: "Jajargenjang", figs: [F(S.rect), F(S.kite), F(S.rhombus), F(S.trapIso), F(S.par), F(S.square)], answer: [0, 2, 4, 5] }],
    "Persegi panjang, belah ketupat, jajargenjang, dan persegi punya dua pasang sisi sejajar. Layang-layang dan trapesium sama kaki tidak.", { level: "Menantang" }),
  q(0, "Kira punya sedotan 5 cm dan 9 cm. Sedotan ketiga mana yang dapat dirangkai menjadi segitiga?", [{ kind: "choice", label: "Sedotan ketiga", options: ["3 cm", "4 cm", "10 cm", "14 cm"], answer: "10 cm" }],
    "Sisi ketiga harus lebih dari 9 − 5 = 4 cm dan kurang dari 9 + 5 = 14 cm. Hanya 10 cm. Dengan 4 cm, 5 + 4 = 9 tidak lebih dari 9.", { level: "Menantang" }),
  q(1, "Bandingkan belah ketupat dengan ciri-ciri jajargenjang. Jawab Ya atau Tidak.", [{ kind: "tf", labels: ["Ya", "Tidak"], statements: [
    { text: "Sisi-sisi belah ketupat yang berhadapan sejajar.", answer: true },
    { text: "Sudut-sudut belah ketupat yang berhadapan sama besar.", answer: true },
    { text: "Semua jajargenjang mempunyai empat sisi yang sama panjang.", answer: false },
    { text: "Belah ketupat dapat digolongkan sebagai jajargenjang.", answer: true },
  ] }], "Semua ciri jajargenjang ada pada belah ketupat, jadi belah ketupat termasuk jajargenjang. Sebaliknya tidak: jajargenjang belum tentu sisinya sama panjang.", { level: "Menantang", scene: { type: "fig", fig: F(S.rhombus) } }),
  q(0, "Apa nama yang paling tepat untuk segitiga berikut?", [{ kind: "choice", label: "Nama segitiga", options: ["Segitiga lancip sama kaki", "Segitiga siku-siku sama kaki", "Segitiga tumpul sama kaki", "Segitiga siku-siku sembarang"], answer: "Segitiga siku-siku sama kaki" }],
    "Satu sudutnya siku-siku dan dua sisinya (kaki) sama panjang.", { level: "Menantang", scene: { type: "fig", fig: F([[0, 0], [5, 5], [0, 5]]) } }),
  q(1, "Ciri apa yang harus ditambahkan pada layang-layang agar menjadi belah ketupat?", [{ kind: "choice", label: "Ciri tambahan", options: ["Salah satu sudutnya siku-siku", "Semua diagonalnya merupakan sumbu simetri", "Sepasang sisinya sejajar", "Diagonalnya berpotongan tegak lurus"], answer: "Semua diagonalnya merupakan sumbu simetri" }],
    "Belah ketupat adalah layang-layang yang semua diagonalnya sumbu simetri. Diagonal layang-layang sudah berpotongan tegak lurus.", { level: "Menantang", scene: { type: "figs", items: [{ fig: F(S.kite), label: "Layang-layang" }, { fig: F(S.rhombus), label: "Belah ketupat" }] } }),
  q(0, "Sudut puncak sebuah segitiga sama kaki besarnya 40°. Berapa besar setiap sudut alasnya?", [{ kind: "number", label: "Setiap sudut alas =", answer: 70, unit: "°" }],
    "Dua sudut alas sama besar. (180° − 40°) : 2 = 70°.", { level: "Menantang", scene: { type: "fig", fig: F(triFromAngles(70, 70), { angleLabels: ["?", "?", "40°"] }) } }),
  // Sangat menantang (18-24)
  q(1, "Tentukan benar atau salah pernyataan berikut.", [{ kind: "tf", statements: [
    { text: "Jajargenjang merupakan trapesium sama kaki.", answer: false },
    { text: "Belah ketupat dapat digolongkan sebagai jajargenjang dan juga layang-layang.", answer: true },
    { text: "Persegi tidak dapat disebut persegi panjang.", answer: false },
    { text: "Salah satu diagonal layang-layang merupakan sumbu simetri.", answer: true },
  ] }], "Jajargenjang tidak punya sumbu simetri, jadi bukan trapesium sama kaki. Persegi memiliki semua ciri persegi panjang, jadi boleh disebut persegi panjang.", { level: "Sangat menantang" }),
  q(0, "Tentukan benar atau salah pernyataan berikut.", [{ kind: "tf", statements: [
    { text: "Ruas garis 4 cm, 6 cm, dan 11 cm dapat membentuk segitiga.", answer: false },
    { text: "Semua sudut pada segitiga siku-siku adalah sudut siku-siku.", answer: false },
    { text: "Jumlah tiga sudut dalam segitiga adalah 180°.", answer: true },
    { text: "Segitiga sama sisi juga dapat digolongkan sebagai segitiga sama kaki.", answer: true },
  ] }], "4 + 6 = 10 kurang dari 11, jadi tidak bisa. Segitiga siku-siku hanya punya satu sudut siku-siku karena jumlahnya 180°.", { level: "Sangat menantang" }),
  q(1, "Ketuk semua bangun yang dapat digolongkan sebagai layang-layang.", [{ kind: "select", label: "Layang-layang", figs: [F(S.par), F(S.square), F(S.kite), F(S.rect), F(S.rhombus), F(S.trapIso)], answer: [1, 2, 4] }],
    "Layang-layang punya diagonal yang menjadi sumbu simetri. Itu dimiliki layang-layang, belah ketupat, dan persegi. Diagonal persegi panjang dan jajargenjang bukan sumbu simetri.", { level: "Sangat menantang" }),
  q(0, "Sudut tumpul sebuah segitiga sama kaki besarnya 110°. Berapa besar setiap sudut lainnya?", [{ kind: "number", label: "Setiap sudut lainnya =", answer: 35, unit: "°" }],
    "Sudut tumpul hanya bisa satu, yaitu sudut puncak. (180° − 110°) : 2 = 35°.", { level: "Sangat menantang", scene: { type: "fig", fig: F(triFromAngles(35, 35), { angleLabels: ["?", "?", "110°"] }) } }),
  q(1, "Ciri apa yang harus ditambahkan pada persegi panjang agar menjadi persegi?", [{ kind: "choice", label: "Ciri tambahan", options: ["Sisi-sisi berurutan sama panjang", "Sisi-sisi berhadapan sejajar", "Semua sudutnya siku-siku", "Diagonalnya saling membagi dua sama panjang"], answer: "Sisi-sisi berurutan sama panjang" }],
    "Persegi adalah persegi panjang yang sisi-sisi berurutannya sama panjang. Ciri lain sudah dimiliki persegi panjang.", { level: "Sangat menantang", scene: { type: "figs", items: [{ fig: F(S.rect), label: "Persegi panjang" }, { fig: F(S.square), label: "Persegi" }] } }),
  q(0, "Isi tabel percobaan sedotan berikut. Perhatikan baik-baik baris yang jumlahnya tepat sama.", [{ kind: "straws", rows: [[5, 5, 10], [9, 12, 15], [2, 7, 8]] }],
    "5, 5, 10 tidak bisa: 5 + 5 = 10 sama dengan sisi ketiga, tidak lebih. 9, 12, 15 bisa. 2, 7, 8 bisa karena 2 + 7 = 9 lebih dari 8.", { level: "Sangat menantang" }),
  q(1, "Apa nama yang paling tepat untuk setiap bangun berikut?", [{ kind: "classify", options: ["Trapesium siku-siku", "Trapesium sama kaki", "Persegi panjang", "Belah ketupat", "Segi empat sembarang"], rows: [{ text: "Bangun 1", fig: F(S.rhombus) }, { text: "Bangun 2", fig: F(S.trapRight) }, { text: "Bangun 3", fig: F(S.quadGen) }, { text: "Bangun 4", fig: F(S.rect) }, { text: "Bangun 5", fig: F(S.trapIso) }], answers: ["Belah ketupat", "Trapesium siku-siku", "Segi empat sembarang", "Persegi panjang", "Trapesium sama kaki"] }],
    "Bangun 1 jajargenjang dengan sisi sama panjang. Bangun 2 sepasang sisi sejajar dengan sudut siku-siku. Bangun 3 tidak punya sisi sejajar. Bangun 4 jajargenjang bersudut siku-siku. Bangun 5 trapesium dengan kaki sama panjang.", { level: "Sangat menantang" }),
];
