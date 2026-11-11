import type { Question } from "./grade-four-whole-numbers";

/* ====================================================================== */
/* Kelas 2 Bab 5: Pecahan (setengah dan seperempat)                        */
/* ====================================================================== */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
type Pt = [number, number];

/* ---------- Bangun dasar (koordinat 0–100) ---------- */
const ngon = (n: number, r: number, cx = 50, cy = 50, rot = 0): Pt[] =>
  Array.from({ length: n }, (_, i) => { const a = ((rot + (360 * i) / n) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
export const bases = {
  persegi: [[15, 15], [85, 15], [85, 85], [15, 85]] as Pt[],
  persegiPanjang: [[4, 26], [96, 26], [96, 74], [4, 74]] as Pt[],
  lingkaran: ngon(72, 40),
  segitiga: [[50, 8], [92, 86], [8, 86]] as Pt[],
  belahKetupat: [[50, 4], [86, 50], [50, 96], [14, 50]] as Pt[],
  segiEnam: ngon(6, 42),
};
export type Base = keyof typeof bases;
export const baseName: Record<Base, string> = { persegi: "Persegi", persegiPanjang: "Persegi panjang", lingkaran: "Lingkaran", segitiga: "Segitiga", belahKetupat: "Belah ketupat", segiEnam: "Segi enam" };

/** Garis lurus melalui dua titik (diperpanjang tak hingga). */
export type Line = [number, number, number, number];
export const V = (x: number): Line => [x, 0, x, 100];
export const H = (y: number): Line => [0, y, 100, y];
export const D1: Line = [0, 0, 100, 100];
export const D2: Line = [100, 0, 0, 100];
/** Diagonal persegi panjang dari sudut ke sudut. */
export const RD1: Line = [4, 26, 96, 74];
export const RD2: Line = [96, 26, 4, 74];
export const through = (deg: number): Line => { const a = (deg * Math.PI) / 180; return [50 - 60 * Math.cos(a), 50 - 60 * Math.sin(a), 50 + 60 * Math.cos(a), 50 + 60 * Math.sin(a)]; };

const side = (l: Line, p: Pt) => (l[2] - l[0]) * (p[1] - l[1]) - (l[3] - l[1]) * (p[0] - l[0]);
/** Potong bangun cembung dengan satu garis. */
function split(poly: Pt[], l: Line): Pt[][] {
  const a: Pt[] = [], b: Pt[] = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length], sp = side(l, p), sq = side(l, q);
    if (sp >= 0) a.push(p); if (sp <= 0) b.push(p);
    if ((sp > 0 && sq < 0) || (sp < 0 && sq > 0)) { const t = sp / (sp - sq); const m: Pt = [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]; a.push(m); b.push(m); }
  });
  return [a, b].filter(x => x.length >= 3 && area(x) > 0.5);
}
export const area = (pts: Pt[]) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const centroid = (pts: Pt[]): Pt => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
/** Bagian-bagian bangun setelah dipotong beberapa garis, diurutkan dari atas ke bawah lalu kiri ke kanan. */
export function pieces(base: Base, lines: Line[]): Pt[][] {
  let ps: Pt[][] = [bases[base]];
  for (const l of lines) ps = ps.flatMap(p => split(p, l));
  return ps.map(p => ({ p, c: centroid(p) })).sort((x, y) => Math.round(x.c[1] / 4) - Math.round(y.c[1] / 4) || x.c[0] - y.c[0]).map(x => x.p);
}
export const equalParts = (ps: Pt[][]) => { const a = ps.map(area); return Math.max(...a) - Math.min(...a) <= 0.012 * a.reduce((s, x) => s + x, 0); };
export const shadedShare = (ps: Pt[][], shaded: number[]) => shaded.reduce((s, i) => s + area(ps[i]), 0) / ps.reduce((s, p) => s + area(p), 0);
/** Gambar menunjukkan 1/d jika semua bagian sama besar dan bagian yang diwarnai tepat 1/d. */
export const showsFraction = (f: { base: Base; lines: Line[]; shaded: number[] }, d: number) => {
  const ps = pieces(f.base, f.lines);
  return equalParts(ps) && Math.abs(shadedShare(ps, f.shaded) - 1 / d) < 0.005;
};

/* ---------- Benda untuk kumpulan ---------- */
export type Obj = "apple" | "orange" | "egg" | "balloon" | "cupcake" | "chick" | "ladybug" | "pencil" | "star" | "butterfly" | "donut" | "marble-blue" | "bird";
export const objName: Record<Obj, string> = { apple: "apel", orange: "jeruk", egg: "telur", balloon: "balon", cupcake: "kue", chick: "anak ayam", ladybug: "kepik", pencil: "pensil", star: "bintang", butterfly: "kupu-kupu", donut: "donat", "marble-blue": "kelereng", bird: "burung" };

/* ---------- Gambar soal ---------- */
export type Frac = { base: Base; lines: Line[]; shaded: number[] };
export type Fig =
  | ({ t: "frac" } & Frac)
  | { t: "groups"; obj: Obj; a: number; b: number; obj2?: Obj }
  | { t: "set"; obj: Obj; n: number };
export type Item = { name: string; fig: Fig };
export type Part =
  | { kind: "number"; label: string; answer: number }
  | { kind: "choice"; label: string; options: string[]; figs?: Fig[]; answer: string }
  | { kind: "shade"; label: string; base: Base; lines: Line[]; d: 2 | 4; sample: number[] }
  | { kind: "fold"; label: string; base: Base; guides: Line[]; d: 2 | 4; sample: { lines: number[]; shaded: number } }
  | { kind: "mark"; label: string; items: Item[]; answer: boolean[] }
  | { kind: "sort"; label: string; items: Item[]; bins: string[]; answer: number[] }
  | { kind: "check"; label: string; items: Item[]; answer: number[] }
  | { kind: "pick"; label: string; obj: Obj; n: number; mode: "warnai" | "lingkari"; sample: number[] }
  | { kind: "share"; label: string; obj: Obj; n: number; boxes: [string, string] };

export type FQuestion = Question & { topic: 0 | 1 | 2; level?: Level; fig?: Fig; parts: Part[] };
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
const ints = (v: string) => v.split(",").filter(x => x !== "").map(Number);

export function foldResult(p: Extract<Part, { kind: "fold" }>, v: string) {
  const [g, s] = v.split("/");
  const lines = g ? g.split("+").filter(Boolean).map(Number) : [];
  const ps = pieces(p.base, lines.map(i => p.guides[i]));
  return { lines, ps, shaded: s === undefined || s === "" ? null : Number(s) };
}
function partAnswer(p: Part): string {
  switch (p.kind) {
    case "number": return String(p.answer);
    case "choice": return p.answer;
    case "shade": case "pick": return [...p.sample].sort((a, b) => a - b).join(",");
    case "fold": return `${p.sample.lines.join("+")}/${p.sample.shaded}`;
    case "mark": return p.answer.map(x => (x ? "y" : "n")).join(",");
    case "sort": return p.answer.join(",");
    case "check": return [...p.answer].sort((a, b) => a - b).join(",");
    case "share": return `${p.n / 2},${p.n / 2}`;
  }
}
function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": return /^\d+$/.test(v.trim()) && Number(v) === p.answer;
    case "shade": { const ps = pieces(p.base, p.lines), s = ints(v); return s.length > 0 && new Set(s).size === s.length && s.every(i => i < ps.length) && Math.abs(shadedShare(ps, s) - 1 / p.d) < 0.005; }
    case "fold": { const r = foldResult(p, v); return r.shaded !== null && r.ps.length === p.d && equalParts(r.ps) && r.shaded < r.ps.length; }
    case "pick": { const s = ints(v); return new Set(s).size === s.length && s.length * 2 === p.n && s.every(i => i < p.n); }
    case "check": return ints(v).sort((a, b) => a - b).join(",") === partAnswer(p);
    case "share": { const [a, b] = ints(v); return a === p.n / 2 && b === p.n / 2; }
    default: return v === partAnswer(p);
  }
}
function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": return /^\d+$/.test(v.trim());
    case "choice": return Boolean(v);
    case "shade": case "pick": case "check": return ints(v).length > 0;
    case "fold": return foldResult(p, v).shaded !== null;
    case "mark": { const x = v.split(","); return x.length === p.items.length && x.every(y => y === "y" || y === "n"); }
    case "sort": { const x = v.split(","); return x.length === p.items.length && x.every(y => y !== ""); }
    case "share": { const [a, b] = ints(v); return (a ?? 0) + (b ?? 0) === p.n; }
  }
}
export const correct = (q: FQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: FQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: FQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = v[i];
    switch (p.kind) {
      case "shade": { const ps = pieces(p.base, p.lines); return `${ints(x).length} dari ${ps.length} bagian diwarnai`; }
      case "fold": { const r = foldResult(p, x); return `${r.lines.length} garis, ${r.ps.length} bagian${equalParts(r.ps) ? " sama besar" : " tidak sama besar"}, ${r.shaded === null ? "belum diwarnai" : "1 bagian diwarnai"}`; }
      case "mark": return x.split(",").map((m, k) => `${p.items[k].name} ${m === "y" ? "benar" : m === "n" ? "salah" : "…"}`).join(", ");
      case "sort": return x.split(",").map((b, k) => `${p.items[k].name}: ${b === "" ? "…" : p.bins[Number(b)]}`).join("; ");
      case "check": return x ? ints(x).map(n => p.items[n].name).join(", ") : "tidak ada";
      case "pick": return `${ints(x).length} dari ${p.n} ${objName[p.obj]} di${p.mode}`;
      case "share": { const [a, b] = ints(x); return `${p.boxes[0]} ${a ?? 0}, ${p.boxes[1]} ${b ?? 0}`; }
      default: return x || "…";
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: FQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; fig?: Fig } = {}): FQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(partAnswer).join(SEP), ...extra });
const fr = (base: Base, lines: Line[], shaded: number[]): Fig => ({ t: "frac", base, lines, shaded });
const grp = (obj: Obj, a: number, b: number, obj2?: Obj): Fig => ({ t: "groups", obj, a, b, obj2 });
const it = (name: string, fig: Fig): Item => ({ name, fig });
const L = (x1: number, y1: number, x2: number, y2: number): Line => [x1, y1, x2, y2];

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Setengah dari Benda Utuh", short: "Setengah benda utuh",
    steps: [
      "Potong satu benda utuh menjadi dua bagian sama besar. Setiap bagian bernilai setengah.",
      "Kedua bagian harus sama besar. Jika satu bagian lebih besar, itu bukan setengah.",
      "Ada banyak cara memotong menjadi setengah: tegak, mendatar, atau miring dari sudut ke sudut.",
      "Contoh setengah di sekitar kita: setengah semangka, setengah gelas air, setengah lipatan kertas.",
    ],
    demo: "Pilih bangun, ketuk garis lipat untuk memotongnya, lalu ketuk satu bagian untuk mewarnainya. Coba juga garis yang tidak di tengah dan lihat bedanya.",
  },
  {
    code: "B", title: "Setengah dari Kumpulan Benda", short: "Setengah kumpulan",
    steps: [
      "Setengah dari kumpulan benda didapat dengan membagi benda menjadi dua kelompok sama banyak.",
      "Bagikan satu-satu bergantian: satu untuk anak pertama, satu untuk anak kedua, sampai habis.",
      "Setengah dari 4 kelereng adalah 2 kelereng. Setengah dari 6 ikan adalah 3 ikan.",
      "Jika satu kelompok berisi 4 dan kelompok lain 2, itu bukan setengah karena tidak sama banyak.",
    ],
    demo: "Pilih benda dan banyaknya, lalu bagikan satu-satu kepada Upe dan Malosi. Coba juga banyak benda yang ganjil.",
  },
  {
    code: "C", title: "Seperempat dari Benda Utuh", short: "Seperempat",
    steps: [
      "Potong satu benda utuh menjadi empat bagian sama besar. Setiap bagian bernilai seperempat.",
      "Caranya: potong dulu menjadi setengah, lalu potong setiap setengah menjadi dua sama besar.",
      "Persegi dapat dipotong menjadi seperempat dengan garis tegak dan mendatar, dengan dua garis silang, atau menjadi empat lajur.",
      "Mewarnai dua dari empat bagian bukan seperempat, melainkan setengah.",
    ],
    demo: "Pilih makanan, potong menjadi dua, lalu potong lagi menjadi empat. Ambil satu potong dan lihat namanya.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: FQuestion[][] = [
  [
    q(0, "Warnai setengah dari lingkaran ini.", [{ kind: "shade", label: "Lingkaran", base: "lingkaran", lines: [V(50)], d: 2, sample: [0] }],
      "Lingkaran sudah dibagi menjadi dua bagian sama besar. Warnai satu bagian."),
    q(0, "Beri tanda benar pada gambar yang menunjukkan setengah dan tanda salah pada yang bukan setengah.", [{ kind: "mark", label: "Gambar", items: [it("a", fr("lingkaran", [H(50)], [0])), it("b", fr("lingkaran", [L(0, 30, 100, 30)], [0])), it("c", fr("persegiPanjang", [V(68)], [0])), it("d", fr("persegiPanjang", [V(50)], [1]))], answer: [true, false, false, true] }],
      "Gambar a dan d dibagi menjadi dua bagian sama besar. Pada b dan c, garisnya tidak di tengah sehingga bagiannya tidak sama besar."),
    q(0, "Tarik garis sehingga persegi menjadi dua bagian sama besar. Lalu warnai setengahnya.", [{ kind: "fold", label: "Persegi", base: "persegi", guides: [V(50), V(38), D1, H(64)], d: 2, sample: { lines: [0], shaded: 0 } }],
      "Garis tegak di tengah atau garis miring dari sudut ke sudut membagi persegi menjadi dua bagian sama besar."),
    q(0, "Kelompokkan gambar ke dalam setengah dan bukan setengah.", [{ kind: "sort", label: "Gambar", items: [it("A", fr("persegi", [D2], [1])), it("B", fr("segitiga", [V(50)], [0])), it("C", fr("persegi", [H(36)], [0])), it("D", fr("segiEnam", [V(64)], [1])), it("E", fr("belahKetupat", [H(50)], [0]))], bins: ["Setengah", "Bukan setengah"], answer: [0, 0, 1, 1, 0] }],
      "A, B, dan E dibagi tepat di tengah sehingga kedua bagian sama besar. C dan D dipotong tidak di tengah."),
  ],
  [
    q(1, "Beri tanda benar pada kelompok yang menunjukkan setengah dan tanda salah pada yang bukan.", [{ kind: "mark", label: "Kelompok", items: [it("a", grp("chick", 3, 3)), it("b", grp("chick", 2, 4))], answer: [true, false] }],
      "Kelompok a: 3 dan 3 sama banyak, jadi setengah. Kelompok b: 2 dan 4 tidak sama banyak.", { fig: { t: "set", obj: "chick", n: 6 } }),
    q(1, "Warnai setengah dari banyak bintang berikut.", [{ kind: "pick", label: "Bintang", obj: "star", n: 8, mode: "warnai", sample: [0, 1, 2, 3] }],
      "Ada 8 bintang. Bagi menjadi dua kelompok sama banyak: 4 dan 4. Warnai 4 bintang."),
    q(1, "Lingkari kelompok benda yang menunjukkan setengah.", [{ kind: "check", label: "Pasangan kelompok", items: [it("a", grp("bird", 4, 4)), it("b", grp("apple", 3, 4)), it("c", grp("egg", 5, 5)), it("d", grp("balloon", 2, 3))], answer: [0, 2] }],
      "Pada a (4 dan 4) dan c (5 dan 5) kedua kelompok sama banyak. Pada b dan d tidak sama banyak."),
    q(1, "Tika mempunyai 8 pensil. Bagi semua pensilnya ke dalam dua kotak sama banyak. Berapa setengah dari 8 pensil?", [{ kind: "share", label: "Pensil", obj: "pencil", n: 8, boxes: ["Kotak 1", "Kotak 2"] }, { kind: "number", label: "Setengah dari 8 pensil", answer: 4 }],
      "Masukkan pensil satu-satu ke kotak 1 dan kotak 2 bergantian. Setiap kotak berisi 4 pensil, jadi setengah dari 8 adalah 4."),
  ],
  [
    q(2, "Warnai seperempat dari persegi ini.", [{ kind: "shade", label: "Persegi", base: "persegi", lines: [V(50), H(50)], d: 4, sample: [0] }],
      "Persegi sudah dibagi menjadi empat bagian sama besar. Warnai satu bagian."),
    q(2, "Beri tanda benar pada gambar yang menunjukkan seperempat dan tanda salah pada yang bukan.", [{ kind: "mark", label: "Gambar", items: [it("a", fr("lingkaran", [V(50), H(50)], [1])), it("b", fr("persegi", [V(50), H(50)], [0, 1])), it("c", fr("persegiPanjang", [V(27), V(50), V(73)], [2])), it("d", fr("persegi", [V(50), H(30)], [0]))], answer: [true, false, true, false] }],
      "a dan c: 1 dari 4 bagian sama besar diwarnai. b: 2 dari 4 bagian diwarnai, itu setengah. d: bagiannya tidak sama besar."),
    q(2, "Kelompokkan gambar ke dalam seperempat dan bukan seperempat.", [{ kind: "sort", label: "Gambar", items: [it("A", fr("belahKetupat", [V(50), H(50)], [2])), it("B", fr("lingkaran", [V(50)], [0])), it("C", fr("persegi", [D1, D2], [3])), it("D", fr("segitiga", [V(50), H(60)], [0])), it("E", fr("persegiPanjang", [H(38), H(50), H(62)], [0]))], bins: ["Seperempat", "Bukan seperempat"], answer: [0, 1, 0, 1, 0] }],
      "A, C, dan E dibagi menjadi 4 bagian sama besar dan 1 bagian diwarnai. B adalah setengah. D dibagi menjadi bagian yang tidak sama besar."),
    q(2, "Tarik garis pada persegi panjang sehingga menghasilkan seperempat. Lalu warnai seperempatnya.", [{ kind: "fold", label: "Persegi panjang", base: "persegiPanjang", guides: [V(50), H(50), V(30), RD1], d: 4, sample: { lines: [0, 1], shaded: 0 } }],
      "Tarik garis tegak dan garis mendatar tepat di tengah. Persegi panjang terbagi menjadi 4 bagian sama besar."),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
export const assessment: FQuestion[] = [
  q(0, "Warnai setengah dari persegi ini.", [{ kind: "shade", label: "Persegi", base: "persegi", lines: [D1], d: 2, sample: [1] }],
    "Garis miring dari sudut ke sudut membagi persegi menjadi dua segitiga sama besar. Warnai satu segitiga.", { level: "Sedang" }),
  q(1, "Delapan apel dibagi menjadi dua kelompok. Beri tanda benar jika pembagiannya setengah dan tanda salah jika bukan.", [{ kind: "mark", label: "Kelompok", items: [it("a", grp("apple", 4, 4)), it("b", grp("apple", 3, 5))], answer: [true, false] }],
    "Ada 8 apel. Kelompok a: 4 dan 4 sama banyak. Kelompok b: 3 dan 5 tidak sama banyak.", { level: "Sedang", fig: { t: "set", obj: "apple", n: 8 } }),
  q(2, "Warnai seperempat dari lingkaran ini.", [{ kind: "shade", label: "Lingkaran", base: "lingkaran", lines: [V(50), H(50)], d: 4, sample: [3] }],
    "Lingkaran dibagi menjadi 4 bagian sama besar. Warnai satu bagian.", { level: "Sedang" }),
  q(0, "Beri tanda benar pada gambar yang menunjukkan setengah dan tanda salah pada yang bukan setengah.", [{ kind: "mark", label: "Gambar", items: [it("a", fr("persegiPanjang", [H(50)], [1])), it("b", fr("persegi", [L(15, 70, 85, 15)], [1])), it("c", fr("segitiga", [V(50)], [1])), it("d", fr("lingkaran", [V(32)], [1]))], answer: [true, false, true, false] }],
    "a dan c dibagi tepat di tengah sehingga kedua bagian sama besar. Pada b dan d bagiannya tidak sama besar.", { level: "Sedang" }),
  q(1, "Warnai setengah dari banyak balon berikut.", [{ kind: "pick", label: "Balon", obj: "balloon", n: 10, mode: "warnai", sample: [0, 2, 4, 6, 8] }],
    "Ada 10 balon. Bagi menjadi dua kelompok sama banyak: 5 dan 5. Warnai 5 balon.", { level: "Sedang" }),
  q(2, "Perhatikan bagian yang diwarnai. Beri tanda benar pada gambar yang menunjukkan seperempat dan tanda salah pada yang bukan.", [{ kind: "mark", label: "Gambar", items: [it("a", fr("persegiPanjang", [V(50), H(50)], [3])), it("b", fr("lingkaran", [V(50), H(50)], [0, 3])), it("c", fr("belahKetupat", [V(50), H(50)], [0])), it("d", fr("segitiga", [V(38), V(62), H(60)], [0]))], answer: [true, false, true, false] }],
    "a dan c: 1 dari 4 bagian sama besar diwarnai. b: 2 dari 4 bagian diwarnai, itu setengah. d: bagian-bagiannya tidak sama besar.", { level: "Sedang" }),
  q(0, "Gambar manakah yang menunjukkan setengah?", [{ kind: "choice", label: "Gambar", options: ["P", "Q", "R"], figs: [fr("persegi", [L(15, 35, 50, 15)], [0]), fr("persegi", [L(15, 40, 85, 80)], [1]), fr("persegi", [H(50)], [0])], answer: "R" }],
    "Pada R persegi dipotong mendatar tepat di tengah sehingga kedua bagian sama besar. Pada P dan Q bagian yang diwarnai lebih kecil atau lebih besar dari bagian lain.", { level: "Sedang" }),
  q(2, "Kira memotong satu martabak menjadi 4 bagian sama besar dan mengambil satu potong. Gambar manakah yang menunjukkan bagian Kira?", [{ kind: "choice", label: "Bagian Kira", options: ["P", "Q", "R", "S"], figs: [fr("lingkaran", [V(50), H(50)], [2]), fr("lingkaran", [V(50)], [0]), fr("lingkaran", [through(0), through(60)], [0]), fr("lingkaran", [V(50), H(50)], [0, 1, 2])], answer: "P" }],
    "Bagian Kira adalah 1 dari 4 bagian sama besar, yaitu P. Q setengah, R dipotong menjadi bagian yang tidak sama besar, S tiga bagian.", { level: "Sedang" }),
  q(1, "Beri tanda benar pada kelompok yang menunjukkan setengah dan tanda salah pada yang bukan.", [{ kind: "mark", label: "Kelompok", items: [it("a", grp("cupcake", 6, 4)), it("b", grp("cupcake", 5, 5)), it("c", grp("ladybug", 5, 3)), it("d", grp("ladybug", 4, 4))], answer: [false, true, false, true] }],
    "Hitung tiap kelompok. b (5 dan 5) dan d (4 dan 4) sama banyak. a (6 dan 4) dan c (5 dan 3) tidak sama banyak.", { level: "Menantang" }),
  q(0, "Kelompokkan gambar ke dalam setengah dan bukan setengah.", [{ kind: "sort", label: "Gambar", items: [it("A", fr("persegiPanjang", [V(50)], [0])), it("B", fr("segitiga", [H(50)], [0])), it("C", fr("lingkaran", [through(45)], [1])), it("D", fr("persegi", [V(50), H(50)], [2])), it("E", fr("segiEnam", [H(50)], [0])), it("F", fr("persegiPanjang", [RD2], [0]))], bins: ["Setengah", "Bukan setengah"], answer: [0, 1, 0, 1, 0, 0] }],
    "A, C, E, dan F dibagi menjadi dua bagian sama besar. B dipotong mendatar di tengah tinggi, tetapi bagian atas segitiga jauh lebih kecil. D hanya 1 dari 4 bagian, itu seperempat.", { level: "Menantang" }),
  q(2, "Kelompokkan gambar ke dalam seperempat dan bukan seperempat.", [{ kind: "sort", label: "Gambar", items: [it("A", fr("persegi", [V(50), H(50)], [1])), it("B", fr("segitiga", [V(50), H(47)], [0])), it("C", fr("persegiPanjang", [V(27), V(50), V(73)], [0, 1])), it("D", fr("lingkaran", [through(45), through(135)], [2])), it("E", fr("persegi", [D1, D2], [0])), it("F", fr("persegiPanjang", [V(20), V(45), V(70)], [0]))], bins: ["Seperempat", "Bukan seperempat"], answer: [0, 1, 1, 0, 0, 1] }],
    "A, D, dan E: 1 dari 4 bagian sama besar diwarnai. B: segitiga dipotong menjadi bagian yang tidak sama besar. C: 2 dari 4 bagian diwarnai, itu setengah. F: lajurnya tidak sama lebar.", { level: "Sangat menantang" }),
  q(1, "Lingkari kelompok benda yang menunjukkan setengah.", [{ kind: "check", label: "Pasangan kelompok", items: [it("a", grp("orange", 4, 5)), it("b", grp("chick", 6, 6)), it("c", grp("donut", 3, 3)), it("d", grp("bird", 7, 6))], answer: [1, 2] }],
    "Pada b (6 dan 6) dan c (3 dan 3) kedua kelompok sama banyak. Pada a (4 dan 5) dan d (7 dan 6) tidak sama banyak.", { level: "Menantang" }),
  q(0, "Tarik garis sehingga persegi panjang menjadi dua bagian sama besar. Lalu warnai setengahnya.", [{ kind: "fold", label: "Persegi panjang", base: "persegiPanjang", guides: [V(36), H(50), RD2, H(62)], d: 2, sample: { lines: [1], shaded: 1 } }],
    "Garis mendatar di tengah atau garis miring dari sudut ke sudut membagi persegi panjang menjadi dua bagian sama besar. Garis lain membuat bagian yang tidak sama besar.", { level: "Menantang" }),
  q(2, "Tarik garis pada persegi sehingga menghasilkan seperempat. Lalu warnai seperempatnya.", [{ kind: "fold", label: "Persegi", base: "persegi", guides: [D1, V(32), D2, H(50), V(50)], d: 4, sample: { lines: [0, 2], shaded: 0 } }],
    "Ada dua cara: dua garis silang dari sudut ke sudut, atau garis tegak dan mendatar tepat di tengah. Keduanya menghasilkan 4 bagian sama besar.", { level: "Menantang" }),
  q(1, "Malosi mempunyai 12 pensil warna. Bagi semua pensilnya sama banyak untuk Upe dan Malosi. Berapa setengah dari 12 pensil?", [{ kind: "share", label: "Pensil", obj: "pencil", n: 12, boxes: ["Upe", "Malosi"] }, { kind: "number", label: "Setengah dari 12 pensil", answer: 6 }],
    "Bagikan satu-satu bergantian. Upe mendapat 6 dan Malosi mendapat 6, jadi setengah dari 12 adalah 6.", { level: "Menantang" }),
  q(0, "Warnai setengah dari lingkaran ini.", [{ kind: "shade", label: "Lingkaran", base: "lingkaran", lines: [V(50), H(50)], d: 2, sample: [0, 2] }],
    "Lingkaran dibagi menjadi 4 bagian sama besar. Setengah lingkaran sama dengan 2 dari 4 bagian, jadi warnai 2 bagian.", { level: "Menantang" }),
  q(2, "Warnai seperempat dari belah ketupat ini.", [{ kind: "shade", label: "Belah ketupat", base: "belahKetupat", lines: [V(50), H(50)], d: 4, sample: [1] }],
    "Kedua garis melalui tengah belah ketupat sehingga terbentuk 4 segitiga sama besar. Warnai satu segitiga.", { level: "Menantang" }),
  q(1, "Upe mempunyai 14 kelereng. Upe memberikan setengah kelerengnya kepada Halim. Berapa kelereng yang diterima Halim?", [{ kind: "number", label: "Kelereng Halim", answer: 7 }],
    "Bagi 14 kelereng menjadi dua kelompok sama banyak: 7 dan 7. Halim menerima 7 kelereng.", { level: "Menantang", fig: { t: "set", obj: "marble-blue", n: 14 } }),
  q(0, "Warnai setengah dari persegi ini.", [{ kind: "shade", label: "Persegi", base: "persegi", lines: [V(50), H(50), D1, D2], d: 2, sample: [0, 1, 2, 3] }],
    "Persegi dibagi menjadi 8 segitiga sama besar. Setengahnya adalah 4 dari 8 bagian. Banyak cara mewarnai yang benar.", { level: "Sangat menantang" }),
  q(2, "Tarik garis pada lingkaran sehingga menghasilkan seperempat. Lalu warnai seperempatnya.", [{ kind: "fold", label: "Lingkaran", base: "lingkaran", guides: [through(90), through(45), through(0), H(30), through(135)], d: 4, sample: { lines: [0, 2], shaded: 1 } }],
    "Tarik dua garis lurus melalui tengah yang saling tegak lurus: tegak dan mendatar, atau dua garis miring yang menyilang. Garis tegak dengan garis miring menghasilkan bagian yang tidak sama besar.", { level: "Sangat menantang" }),
  q(1, "Ibu membuat 16 kue. Setengahnya diberikan kepada nenek. Setengah dari sisanya diberikan kepada Tika. Berapa kue yang diterima Tika?", [{ kind: "number", label: "Kue Tika", answer: 4 }],
    "Setengah dari 16 adalah 8, jadi sisa 8 kue. Setengah dari 8 adalah 4. Tika menerima 4 kue.", { level: "Sangat menantang", fig: { t: "set", obj: "cupcake", n: 16 } }),
  q(0, "Beri tanda benar pada gambar yang menunjukkan setengah dan tanda salah pada yang bukan setengah.", [{ kind: "mark", label: "Gambar", items: [it("a", fr("persegiPanjang", [RD1], [0])), it("b", fr("belahKetupat", [V(36)], [0])), it("c", fr("segiEnam", [through(30)], [0])), it("d", fr("persegi", [V(50), H(50)], [0, 3]))], answer: [true, false, true, true] }],
    "a: garis dari sudut ke sudut persegi panjang membuat dua segitiga sama besar. c: garis melalui titik tengah segi enam membaginya menjadi dua bagian sama besar. d: 2 dari 4 bagian sama besar diwarnai, itu setengah. b: garisnya tidak di tengah belah ketupat.", { level: "Sangat menantang" }),
  q(2, "Warnai seperempat dari persegi panjang ini.", [{ kind: "shade", label: "Persegi panjang", base: "persegiPanjang", lines: [V(27), V(50), V(73), H(50)], d: 4, sample: [0, 1] }],
    "Persegi panjang dibagi menjadi 8 bagian sama besar. Seperempatnya adalah 2 dari 8 bagian.", { level: "Sangat menantang" }),
  q(1, "Beri tanda benar pada kelompok yang menunjukkan setengah dan tanda salah pada yang bukan.", [{ kind: "mark", label: "Kelompok", items: [it("a", grp("egg", 3, 3, "apple")), it("b", grp("apple", 4, 5)), it("c", grp("orange", 5, 5, "marble-blue"))], answer: [true, false, true] }],
    "Setengah dilihat dari banyaknya, bukan dari besar bendanya. a: 3 telur dan 3 apel sama banyak. c: 5 jeruk dan 5 kelereng sama banyak. b: 4 dan 5 tidak sama banyak.", { level: "Sangat menantang" }),
];
