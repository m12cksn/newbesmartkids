import type { Question } from "./grade-four-whole-numbers";

/* ====================================================================== */
/* Kelas 2 Bab 3: Bentuk di Sekitar Kita                                   */
/* ====================================================================== */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
type Pt = [number, number];

/* ---------- Bangun datar (koordinat 0–100) ---------- */
const reg = (n: number, r = 40, cx = 50, cy = 52, rot = -90): Pt[] =>
  Array.from({ length: n }, (_, i) => { const a = ((rot + (360 * i) / n) * Math.PI) / 180; return [Math.round((cx + r * Math.cos(a)) * 10) / 10, Math.round((cy + r * Math.sin(a)) * 10) / 10]; });

export const P = {
  tri: [[50, 12], [88, 84], [12, 84]],
  triRight: [[18, 14], [18, 86], [86, 86]],
  triObtuse: [[8, 72], [92, 72], [30, 32]],
  triThin: [[20, 10], [80, 50], [20, 90]],
  sq: [[20, 20], [80, 20], [80, 80], [20, 80]],
  rect: [[6, 32], [94, 32], [94, 68], [6, 68]],
  rhombus: [[50, 6], [86, 50], [50, 94], [14, 50]],
  para: [[28, 26], [94, 26], [72, 74], [6, 74]],
  trap: [[30, 26], [70, 26], [94, 76], [6, 76]],
  dart: [[50, 8], [90, 90], [50, 62], [10, 90]],
  pent: reg(5),
  pentIrr: [[18, 14], [82, 22], [92, 62], [48, 92], [10, 64]],
  house: [[50, 8], [90, 40], [90, 92], [10, 92], [10, 40]],
  hex: reg(6, 42, 50, 50, 0),
  hexIrr: [[30, 10], [76, 18], [92, 52], [70, 90], [24, 86], [8, 46]],
  hexL: [[12, 8], [44, 8], [44, 58], [90, 58], [90, 92], [12, 92]],
  star: Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 18 : 44, a = ((-90 + 36 * i) * Math.PI) / 180; return [Math.round((50 + r * Math.cos(a)) * 10) / 10, Math.round((54 + r * Math.sin(a)) * 10) / 10]; }),
} satisfies Record<string, Pt[]>;
export type PolyName = keyof typeof P;
export type CurveName = "circle" | "circleSmall" | "oval" | "ovalTall" | "semi" | "heart" | "drop" | "egg" | "quarter3";

export type Fig =
  | { t: "poly"; p: PolyName; c?: number; rot?: number }
  | { t: "curve"; k: CurveName; c?: number; rot?: number }
  | { t: "pieces"; list: { pts: Pt[]; c?: number }[] }
  /** Juring lingkaran sebesar deg derajat, dimulai dari arah jam 12 searah jarum jam sejauh rot derajat. */
  | { t: "sector"; deg: number; rot: number }
  /** Lingkaran yang kehilangan satu juring. */
  | { t: "missing"; deg: number; rot: number }
  | { t: "solid"; s: SolidName }
  | { t: "obj"; o: ObjName }
  | { t: "stack"; cubes: [number, number, number][] };

export type SolidName = "kubus" | "balok" | "tabung" | "kerucut" | "bola";
export const solidNames: Record<SolidName, string> = { kubus: "Kubus", balok: "Balok", tabung: "Tabung", kerucut: "Kerucut", bola: "Bola" };
export type ObjName = "dadu" | "rubik" | "kardus" | "kotakSusu" | "kotakTisu" | "kaleng" | "drum" | "topi" | "conEs" | "bola" | "jeruk" | "kelereng"
  | "mur" | "tehCelup" | "rambu" | "koin" | "rumahBurung" | "stikerBulat" | "kartuSegitiga" | "kertasPersegi" | "kotakPensil";
export const objNames: Record<ObjName, string> = {
  dadu: "Dadu", rubik: "Kubus rubik", kardus: "Kardus", kotakSusu: "Kotak susu", kotakTisu: "Kotak tisu", kaleng: "Kaleng susu", drum: "Drum mainan",
  topi: "Topi ulang tahun", conEs: "Kerucut es krim", bola: "Bola sepak", jeruk: "Jeruk", kelereng: "Kelereng", mur: "Mur baut", tehCelup: "Teh celup",
  rambu: "Rambu peringatan", koin: "Uang logam", rumahBurung: "Rumah burung", stikerBulat: "Stiker bulat", kartuSegitiga: "Kartu segitiga",
  kertasPersegi: "Kertas lipat", kotakPensil: "Kotak pensil",
};
/** Bentuk bangun ruang setiap benda (bangun datar = null). */
export const objSolid: Record<ObjName, SolidName | null> = {
  dadu: "kubus", rubik: "kubus", kardus: "balok", kotakSusu: "balok", kotakTisu: "balok", kaleng: "tabung", drum: "tabung", topi: "kerucut", conEs: "kerucut",
  bola: "bola", jeruk: "bola", kelereng: "bola", mur: null, tehCelup: null, rambu: null, koin: null, rumahBurung: null, stikerBulat: null, kartuSegitiga: null,
  kertasPersegi: null, kotakPensil: "balok",
};
export const curvedSolid = (s: SolidName) => s === "tabung" || s === "kerucut" || s === "bola";

/* ---------- Geometri ---------- */
const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
/** Banyak sudut (sisi) sebuah segi banyak, titik segaris diabaikan. */
export function corners(pts: Pt[]) {
  return pts.filter((p, i) => Math.abs(cross(pts[(i - 1 + pts.length) % pts.length], p, pts[(i + 1) % pts.length])) > 1e-6).length;
}
export const polySides = (p: PolyName) => corners(P[p]);
export const sideName = (n: number) => ({ 3: "Segitiga", 4: "Segi empat", 5: "Segi lima", 6: "Segi enam" } as Record<number, string>)[n] ?? `Segi ${n}`;

function onSegment(p: Pt, a: Pt, b: Pt) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return Math.abs(cross(a, b, p)) / len < 0.5 && Math.min(a[0], b[0]) - 0.5 <= p[0] && p[0] <= Math.max(a[0], b[0]) + 0.5 && Math.min(a[1], b[1]) - 0.5 <= p[1] && p[1] <= Math.max(a[1], b[1]) + 0.5;
}
function strictlyInside(p: Pt, poly: Pt[]) {
  for (let i = 0; i < poly.length; i++) if (onSegment(p, poly[i], poly[(i + 1) % poly.length])) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* ---------- Mengurai: bangun dengan titik-titik pada tepinya ---------- */
const withMid = (pts: Pt[]): Pt[] => pts.flatMap((p, i) => { const q = pts[(i + 1) % pts.length]; return [p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] as Pt]; });
export const cutShapes = {
  persegiPanjang: { name: "Persegi panjang", nodes: withMid([[8, 26], [92, 26], [92, 74], [8, 74]]) },
  persegi: { name: "Persegi", nodes: withMid([[18, 18], [82, 18], [82, 82], [18, 82]]) },
  pitaPanjang: { name: "Persegi panjang", nodes: [[6, 30], [34, 30], [62, 30], [94, 30], [94, 70], [62, 70], [34, 70], [6, 70]] as Pt[] },
  segiLima: { name: "Segi lima", nodes: withMid(reg(5)) },
  segiEnam: { name: "Segi enam", nodes: withMid(reg(6, 42, 50, 50, 0)) },
  rumah: { name: "Bentuk rumah", nodes: withMid([[50, 8], [90, 40], [90, 92], [10, 92], [10, 40]]) },
} satisfies Record<string, { name: string; nodes: Pt[] }>;
export type CutShape = keyof typeof cutShapes;

/** Terapkan garis potong satu per satu. Mengembalikan potongan (indeks titik) atau null jika ada garis yang tidak sah. */
export function applyCuts(shape: CutShape, cuts: [number, number][]): number[][] | null {
  const nodes = cutShapes[shape].nodes;
  let pieces: number[][] = [nodes.map((_, i) => i)];
  for (const [a, b] of cuts) {
    const k = pieces.findIndex(pc => {
      const i = pc.indexOf(a), j = pc.indexOf(b);
      if (i < 0 || j < 0 || a === b) return false;
      const n = pc.length, d = Math.abs(i - j);
      if (d === 1 || d === n - 1) return false;
      const mid: Pt = [(nodes[a][0] + nodes[b][0]) / 2, (nodes[a][1] + nodes[b][1]) / 2];
      return strictlyInside(mid, pc.map(x => nodes[x]));
    });
    if (k < 0) return null;
    const pc = pieces[k], i = pc.indexOf(a), j = pc.indexOf(b), [lo, hi] = i < j ? [i, j] : [j, i];
    const one = pc.slice(lo, hi + 1), two = [...pc.slice(hi), ...pc.slice(0, lo + 1)];
    pieces = [...pieces.slice(0, k), one, two, ...pieces.slice(k + 1)];
  }
  return pieces;
}
export const pieceCorners = (shape: CutShape, pc: number[]) => corners(pc.map(i => cutShapes[shape].nodes[i]));
export const parseCuts = (v: string): [number, number][] => v ? v.split(",").filter(Boolean).map(s => s.split("-").map(Number) as [number, number]) : [];
export function describePieces(counts: number[]) {
  const tally = counts.reduce<Record<number, number>>((a, c) => ({ ...a, [c]: (a[c] ?? 0) + 1 }), {});
  return Object.keys(tally).map(Number).sort((a, b) => a - b).map(c => `${tally[c]} ${sideName(c).toLowerCase()}`).join(", ");
}

/* ---------- Cara menjawab ---------- */
export type Item = { name: string; fig: Fig };
export type Part =
  | { kind: "number"; label: string; answer: number }
  | { kind: "choice"; label: string; options: string[]; figs?: Fig[]; answer: string }
  | { kind: "check"; label: string; items: Item[]; answer: number[] }
  | { kind: "sort"; label: string; items: Item[]; bins: string[]; answer: number[] }
  | { kind: "match"; label: string; left: Item[]; right: { name: string; fig?: Fig }[]; answer: number[] }
  | { kind: "cut"; label: string; shape: CutShape; pieces: number; allow?: number[]; exact?: number[]; sample: [number, number][] };

export type SQuestion = Question & { topic: 0 | 1 | 2; level?: Level; fig?: Fig; parts: Part[] };
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };

function partAnswer(p: Part): string {
  switch (p.kind) {
    case "number": return String(p.answer);
    case "choice": return p.answer;
    case "check": return [...p.answer].sort((a, b) => a - b).join(",");
    case "sort": case "match": return p.answer.join(",");
    case "cut": return p.sample.map(([a, b]) => `${a}-${b}`).join(",");
  }
}
export function cutResult(p: Extract<Part, { kind: "cut" }>, v: string) {
  const pieces = applyCuts(p.shape, parseCuts(v));
  return pieces ? pieces.map(pc => pieceCorners(p.shape, pc)) : null;
}
function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": return /^\d+$/.test(v.trim()) && Number(v) === p.answer;
    case "choice": return v === p.answer;
    case "check": return v.split(",").filter(Boolean).map(Number).sort((a, b) => a - b).join(",") === partAnswer(p);
    case "sort": case "match": return v === partAnswer(p);
    case "cut": {
      const c = cutResult(p, v);
      if (!c || c.length !== p.pieces) return false;
      if (p.exact) return [...c].sort().join() === [...p.exact].sort().join();
      return c.every(x => (p.allow ?? [3, 4]).includes(x));
    }
  }
}
function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": return /^\d+$/.test(v.trim());
    case "choice": return Boolean(v);
    case "check": return v.split(",").filter(Boolean).length > 0;
    case "sort": { const x = v.split(","); return x.length === p.items.length && x.every(y => y !== ""); }
    case "match": { const x = v.split(","); return x.length === p.left.length && x.every(y => y !== ""); }
    case "cut": return parseCuts(v).length > 0;
  }
}
export const correct = (q: SQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: SQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: SQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = v[i];
    switch (p.kind) {
      case "check": return x ? x.split(",").filter(Boolean).map(n => p.items[Number(n)].name).join(", ") : "tidak ada";
      case "sort": return x.split(",").map((b, k) => `${p.items[k].name}: ${b === "" ? "…" : p.bins[Number(b)]}`).join("; ");
      case "match": return x.split(",").map((b, k) => `${p.left[k].name} dengan ${b === "" ? "…" : p.right[Number(b)].name}`).join("; ");
      case "cut": { const c = cutResult(p, x); return c ? `${parseCuts(x).length} garis, hasilnya ${describePieces(c)}` : "garis belum tepat"; }
      default: return x || "…";
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: SQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; fig?: Fig } = {}): SQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(partAnswer).join(SEP), ...extra });
const poly = (p: PolyName, c?: number, rot?: number): Fig => ({ t: "poly", p, c, rot });
const curve = (k: CurveName, c?: number, rot?: number): Fig => ({ t: "curve", k, c, rot });
const obj = (o: ObjName): Item => ({ name: objNames[o], fig: { t: "obj", o } });
const box = (x: number, y: number, w: number, h: number, c?: number) => ({ pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] as Pt[], c });
const tri = (pts: Pt[], c?: number) => ({ pts, c });
const pieces = (...list: { pts: Pt[]; c?: number }[]): Fig => ({ t: "pieces", list });
const N3 = ["Segitiga", "Segi empat", "Bentuk lengkung"];
const NS = ["Segitiga", "Segi empat", "Segi lima", "Segi enam"];

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Bangun Datar", short: "Bangun datar",
    steps: [
      "Bangun datar yang dibatasi garis lurus disebut segi banyak. Garis lurusnya disebut sisi.",
      "Bangun datar yang dibatasi kurva atau garis lengkung disebut bentuk lengkung.",
      "Nama segi banyak mengikuti banyak sisinya: 3 sisi segitiga, 4 sisi segi empat, 5 sisi segi lima, 6 sisi segi enam.",
      "Lingkaran adalah bentuk lengkung yang bulat sempurna. Jika diputar, bentuknya tetap sama dengan cetakannya.",
    ],
    demo: "Pilih bangun, lalu ketuk setiap sisinya sambil menghitung. Coba bentuk yang miring atau tidak beraturan: namanya tetap mengikuti banyak sisi.",
  },
  {
    code: "B", title: "Mengurai dan Menyusun Bangun Datar", short: "Mengurai dan menyusun",
    steps: [
      "Mengurai berarti membagi satu bangun datar menjadi beberapa bangun baru dengan menarik garis.",
      "Cara menarik garis memengaruhi hasilnya. Persegi bisa menjadi 2 segitiga atau 2 segi empat.",
      "Menyusun berarti menggabungkan beberapa bangun datar menjadi satu bentuk baru.",
      "Dua segitiga yang sama dapat disusun menjadi bentuk yang berbeda, bergantung pada cara menempelkannya.",
    ],
    demo: "Ketuk dua titik di tepi bangun untuk menarik garis. Lihat berapa segitiga dan segi empat yang terbentuk, lalu coba cara lain.",
  },
  {
    code: "C", title: "Bangun Ruang", short: "Bangun ruang",
    steps: [
      "Bangun datar hanya mempunyai satu permukaan. Bangun ruang mempunyai lebih dari satu permukaan dan dapat diisi.",
      "Bangun ruang dengan permukaan lengkung mudah menggelinding: tabung, kerucut, dan bola.",
      "Kubus dan balok hanya mempunyai permukaan datar. Permukaan kubus berbentuk segi empat yang sama ukurannya, permukaan balok berbeda ukurannya.",
      "Cari benda di sekitarmu: dadu berbentuk kubus, kardus berbentuk balok, kaleng berbentuk tabung, topi ulang tahun berbentuk kerucut, jeruk berbentuk bola.",
    ],
    demo: "Pilih benda, lalu gelindingkan dan cap permukaan datarnya. Perhatikan benda mana yang menggelinding dan bentuk cap yang dihasilkan.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: SQuestion[][] = [
  [
    q(0, "Bagian depan teh celup ini berbentuk bangun datar. Hitung sisinya, lalu tulis namanya.", [{ kind: "number", label: "Banyak sisi", answer: 5 }, { kind: "choice", label: "Nama bangun", options: NS, answer: "Segi lima" }],
      "Ada 5 garis lurus di tepinya: 2 miring di atas, 2 tegak di samping, dan 1 di bawah. Segi banyak dengan 5 sisi disebut segi lima.", { fig: { t: "obj", o: "tehCelup" } }),
    q(0, "Kelompokkan bangun datar berikut ke dalam segi banyak dan bentuk lengkung.", [{ kind: "sort", label: "Bangun", items: [{ name: "A", fig: poly("rhombus", 0) }, { name: "B", fig: curve("heart", 1) }, { name: "C", fig: poly("pent", 2) }, { name: "D", fig: curve("oval", 3) }, { name: "E", fig: poly("triRight", 4) }, { name: "F", fig: curve("drop", 5) }], bins: ["Segi banyak", "Bentuk lengkung"], answer: [0, 1, 0, 1, 0, 1] }],
      "A, C, dan E dibatasi garis lurus, jadi segi banyak. B, D, dan F dibatasi garis lengkung, jadi bentuk lengkung."),
    q(0, "Tarik garis yang menghubungkan bangun datar dengan ciri-cirinya.", [{ kind: "match", label: "Ciri bangun", left: [{ name: "Bangun 1", fig: poly("hex", 0) }, { name: "Bangun 2", fig: curve("circle", 1) }, { name: "Bangun 3", fig: poly("triObtuse", 2) }, { name: "Bangun 4", fig: poly("trap", 3) }], right: [{ name: "Mempunyai 3 sisi" }, { name: "Mempunyai 4 sisi" }, { name: "Mempunyai 6 sisi" }, { name: "Mempunyai satu kurva" }], answer: [2, 3, 0, 1] }],
      "Hitung garis lurusnya: bangun 1 punya 6 sisi, bangun 3 punya 3 sisi, bangun 4 punya 4 sisi. Bangun 2 hanya dibatasi satu garis lengkung."),
    q(0, "Ketuk semua lingkaran.", [{ kind: "check", label: "Bentuk lengkung", items: [{ name: "A", fig: curve("oval", 0) }, { name: "B", fig: curve("circle", 1) }, { name: "C", fig: curve("semi", 2) }, { name: "D", fig: curve("circleSmall", 3) }, { name: "E", fig: curve("egg", 4) }, { name: "F", fig: curve("heart", 5) }], answer: [1, 3] }],
      "Lingkaran bulat sempurna dari segala arah. B dan D lingkaran meskipun ukurannya berbeda. A dan E lonjong, C setengah lingkaran, F berbentuk hati."),
  ],
  [
    q(1, "Bagian mana yang hilang dari lingkaran ini?", [{ kind: "choice", label: "Bagian yang hilang", options: ["P", "Q", "R"], figs: [{ t: "sector", deg: 90, rot: 90 }, { t: "sector", deg: 180, rot: 270 }, { t: "sector", deg: 270, rot: 0 }], answer: "Q" }],
      "Yang tersisa adalah setengah lingkaran bagian atas, jadi yang hilang juga setengah lingkaran. Q adalah setengah lingkaran; jika diputar, Q pas mengisi bagian bawah.", { fig: { t: "missing", deg: 180, rot: 90 } }),
    q(1, "Buat satu garis untuk mengurai persegi ini menjadi 2 segitiga.", [{ kind: "cut", label: "Persegi", shape: "persegi", pieces: 2, exact: [3, 3], sample: [[0, 4]] }],
      "Tarik garis dari satu sudut ke sudut yang berhadapan (garis diagonal). Persegi terbagi menjadi 2 segitiga."),
    q(1, "Susun bangun datar berikut. Tarik garis ke hasil susunannya.", [{ kind: "match", label: "Susunan", left: [{ name: "Susunan 1", fig: pieces(box(0, 0, 30, 30, 0), box(36, 0, 30, 30, 0)) }, { name: "Susunan 2", fig: pieces(box(0, 0, 40, 40, 1), tri([[46, 40], [86, 40], [66, 10]], 2)) }],
      right: [{ name: "Bentuk rumah", fig: { t: "pieces", list: [{ pts: [[0, 30], [20, 0], [40, 30], [40, 70], [0, 70]], c: 6 }] } }, { name: "Persegi panjang", fig: { t: "pieces", list: [box(0, 0, 60, 30, 6)] } }], answer: [1, 0] }],
      "Dua persegi yang ditempel berdampingan menjadi persegi panjang. Segitiga yang diletakkan di atas persegi menjadi bentuk rumah."),
    q(1, "Buat dua garis untuk mengurai persegi ini menjadi tiga bagian. Setiap bagian harus segitiga atau segi empat.", [{ kind: "cut", label: "Persegi", shape: "persegi", pieces: 3, allow: [3, 4], sample: [[1, 5], [1, 4]] }],
      "Banyak cara yang benar. Contohnya: tarik garis tegak di tengah, lalu tarik garis dari titik tengah atas ke sudut kanan bawah. Hasilnya 1 segi empat dan 2 segitiga."),
  ],
  [
    q(2, "Tulis nama bangun ruang berikut.", [{ kind: "choice", label: "Nama", options: ["Kubus", "Balok", "Tabung", "Kerucut"], answer: "Balok" }],
      "Semua permukaannya datar dan berbentuk segi empat, tetapi ukurannya berbeda: ada yang panjang dan ada yang pendek. Bangun ini balok.", { fig: { t: "solid", s: "balok" } }),
    q(2, "Benda mana yang permukaannya datar dan mana yang lengkung? Kelompokkan.", [{ kind: "sort", label: "Benda", items: [obj("kaleng"), obj("kotakTisu"), obj("jeruk"), obj("dadu"), obj("conEs")], bins: ["Permukaan datar", "Permukaan lengkung"], answer: [1, 0, 1, 0, 1] }],
      "Kaleng, jeruk, dan kerucut es krim mempunyai permukaan lengkung sehingga dapat menggelinding. Kotak tisu dan dadu hanya mempunyai permukaan datar."),
    q(2, "Ketuk semua benda yang berbentuk kubus.", [{ kind: "check", label: "Benda", items: [obj("dadu"), obj("kotakSusu"), obj("rubik"), obj("drum")], answer: [0, 2] }],
      "Dadu dan kubus rubik mempunyai 6 permukaan segi empat yang sama ukurannya. Kotak susu berbentuk balok dan drum berbentuk tabung."),
    q(2, "Berapa banyak balok satuan pada susunan ini?", [{ kind: "number", label: "Banyak balok satuan", answer: 5 }],
      "Ada 4 balok di bawah berjajar dan 1 balok di atasnya. 4 + 1 = 5.", { fig: { t: "stack", cubes: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [0, 0, 1]] } }),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
const kiteStack: [number, number, number][] = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1], [1, 0, 1], [0, 0, 2]];
const hiddenStack: [number, number, number][] = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [1, 1, 0], [2, 1, 0], [0, 0, 1], [1, 0, 1]];

export const assessment: SQuestion[] = [
  q(0, "Hubungkan setiap bangun datar dengan namanya.", [{ kind: "match", label: "Nama bangun", left: [{ name: "Bangun 1", fig: curve("oval", 0) }, { name: "Bangun 2", fig: poly("rhombus", 1) }, { name: "Bangun 3", fig: poly("triRight", 2) }, { name: "Bangun 4", fig: curve("semi", 3) }, { name: "Bangun 5", fig: poly("trap", 4) }, { name: "Bangun 6", fig: poly("triThin", 5) }], right: N3.map(name => ({ name })), answer: [2, 1, 0, 2, 1, 0] }],
    "Hitung garis lurusnya. Bangun 3 dan 6 punya 3 sisi (segitiga), bangun 2 dan 5 punya 4 sisi (segi empat). Bangun 1 dan 4 mempunyai garis lengkung. Setengah lingkaran tetap bentuk lengkung karena ada kurvanya.", { level: "Sedang" }),
  q(1, "Urai bangun datar berikut. Tarik garis dari bangun datar ke hasil uraiannya.", [{ kind: "match", label: "Hasil uraian", left: [{ name: "Bentuk I", fig: { t: "pieces", list: [{ pts: [[0, 0], [60, 0], [60, 14], [40, 14], [40, 50], [60, 50], [60, 64], [0, 64], [0, 50], [20, 50], [20, 14], [0, 14]], c: 6 }] } }, { name: "Bentuk rumah", fig: { t: "pieces", list: [{ pts: [[0, 24], [24, 0], [48, 24], [48, 64], [0, 64]], c: 6 }] } }, { name: "Trapesium", fig: { t: "pieces", list: [{ pts: [[20, 0], [60, 0], [80, 40], [0, 40]], c: 6 }] } }],
    right: [{ name: "2 segitiga dan 1 segi empat", fig: pieces(tri([[0, 40], [20, 0], [20, 40]], 2), box(26, 0, 40, 40, 1), tri([[72, 0], [92, 40], [72, 40]], 2)) }, { name: "3 segi empat", fig: pieces(box(0, 0, 60, 14, 0), box(66, 0, 20, 36, 1), box(92, 0, 60, 14, 0)) }, { name: "1 segitiga dan 1 segi empat", fig: pieces(tri([[0, 24], [24, 0], [48, 24]], 2), box(54, 0, 48, 40, 1)) }], answer: [1, 2, 0] }],
    "Bentuk I terurai menjadi 2 batang mendatar dan 1 batang tegak (3 segi empat). Bentuk rumah menjadi atap segitiga dan dinding segi empat. Trapesium menjadi 2 segitiga di kiri-kanan dan 1 segi empat di tengah.", { level: "Sedang" }),
  q(2, "Kaleng susu ini berbentuk bangun ruang apa?", [{ kind: "choice", label: "Nama bangun ruang", options: ["Balok", "Kerucut", "Bola", "Tabung"], answer: "Tabung" }],
    "Kaleng mempunyai alas dan tutup berbentuk lingkaran serta selimut yang lengkung. Bentuk seperti ini adalah tabung.", { level: "Sedang", fig: { t: "obj", o: "kaleng" } }),
  q(0, "Bagian depan rumah burung ini berbentuk segi banyak. Berapa banyak sisinya?", [{ kind: "number", label: "Banyak sisi", answer: 5 }],
    "Hitung garis lurus di tepinya: 2 sisi atap, 2 sisi dinding, dan 1 sisi bawah. Jumlahnya 5 sisi. Lubang pintu tidak dihitung karena berada di dalam.", { level: "Sedang", fig: { t: "obj", o: "rumahBurung" } }),
  q(1, "Buat satu garis untuk mengurai persegi panjang ini menjadi dua bagian. Setiap bagian harus segitiga atau segi empat.", [{ kind: "cut", label: "Persegi panjang", shape: "persegiPanjang", pieces: 2, allow: [3, 4], sample: [[1, 5]] }],
    "Banyak cara yang benar: dari sudut ke sudut (2 segitiga), dari tengah atas ke tengah bawah (2 segi empat), atau dari sudut ke titik tengah sisi seberang (1 segitiga dan 1 segi empat). Garis dari tengah atas ke tengah kanan menghasilkan segi lima, jadi tidak tepat.", { level: "Sedang" }),
  q(2, "Kelompokkan benda menurut permukaannya.", [{ kind: "sort", label: "Benda", items: [obj("rubik"), obj("bola"), obj("kardus"), obj("drum"), obj("topi"), obj("kotakPensil")], bins: ["Permukaan datar", "Permukaan lengkung"], answer: [0, 1, 0, 1, 1, 0] }],
    "Bola, drum, dan topi ulang tahun mempunyai permukaan lengkung. Kubus rubik, kardus, dan kotak pensil hanya mempunyai permukaan datar.", { level: "Sedang" }),
  q(0, "Warnai semua segi empat dengan mengetuknya.", [{ kind: "check", label: "Bangun", items: [{ name: "A", fig: poly("rhombus", 0) }, { name: "B", fig: poly("tri", 1) }, { name: "C", fig: poly("trap", 2) }, { name: "D", fig: poly("pent", 3) }, { name: "E", fig: poly("rect", 4, 20) }, { name: "F", fig: curve("circle", 5) }, { name: "G", fig: poly("para", 6) }, { name: "H", fig: poly("hex", 7) }], answer: [0, 2, 4, 6] }],
    "Segi empat dibatasi tepat 4 sisi. A, C, E, dan G masing-masing punya 4 sisi walaupun posisinya miring. B punya 3 sisi, D punya 5, H punya 6, dan F tidak punya sisi lurus.", { level: "Sedang" }),
  q(1, "Susun beberapa bangun datar berikut. Tarik garis ke hasil susunannya.", [{ kind: "match", label: "Hasil susunan", left: [{ name: "Susunan 1", fig: pieces(tri([[0, 0], [40, 40], [0, 40]], 0), tri([[46, 0], [86, 0], [86, 40]], 0)) }, { name: "Susunan 2", fig: pieces(tri([[0, 30], [30, 0], [30, 30]], 1), box(36, 0, 60, 30, 2), tri([[102, 0], [132, 30], [102, 30]], 1)) }, { name: "Susunan 3", fig: pieces(box(0, 0, 30, 30, 3), box(36, 0, 30, 30, 3)) }],
    right: [{ name: "Trapesium", fig: { t: "pieces", list: [{ pts: [[30, 0], [90, 0], [120, 30], [0, 30]], c: 6 }] } }, { name: "Persegi", fig: { t: "pieces", list: [box(0, 0, 40, 40, 6)] } }, { name: "Bentuk rumah", fig: { t: "pieces", list: [{ pts: [[0, 24], [24, 0], [48, 24], [48, 64], [0, 64]], c: 6 }] } }, { name: "Persegi panjang", fig: { t: "pieces", list: [box(0, 0, 60, 30, 6)] } }], answer: [1, 0, 3] }],
    "Dua segitiga siku-siku yang sama dirapatkan pada sisi miringnya menjadi persegi. Segi empat dengan segitiga di kiri dan kanan menjadi trapesium. Dua persegi berdampingan menjadi persegi panjang. Bentuk rumah tidak dapat dibuat dari susunan mana pun karena tidak ada segitiga yang diletakkan di atas persegi.", { level: "Menantang" }),
  q(0, "Benda manakah yang permukaannya berbentuk segi enam?", [{ kind: "choice", label: "Benda", options: ["Mur baut", "Teh celup", "Rambu peringatan", "Uang logam"], figs: [{ t: "obj", o: "mur" }, { t: "obj", o: "tehCelup" }, { t: "obj", o: "rambu" }, { t: "obj", o: "koin" }], answer: "Mur baut" }],
    "Hitung sisi tiap benda: mur baut 6 sisi, teh celup 5 sisi, rambu peringatan 3 sisi. Uang logam berbentuk lingkaran, tidak mempunyai sisi lurus.", { level: "Menantang" }),
  q(2, "Toni sedang menyusun mainan balok. Ada berapa banyak balok satuan pada mainan yang Toni susun?", [{ kind: "choice", label: "Banyak balok", options: ["5", "6", "7", "8"], answer: "6" }],
    "Hitung per lapis: lapis bawah 3 balok, lapis tengah 2 balok, lapis atas 1 balok. 3 + 2 + 1 = 6.", { level: "Menantang", fig: { t: "stack", cubes: kiteStack } }),
  q(1, "Lingkaran ini kehilangan satu bagian. Potongan mana yang pas untuk melengkapinya?", [{ kind: "choice", label: "Potongan yang pas", options: ["P", "Q", "R", "S"], figs: [{ t: "sector", deg: 60, rot: 200 }, { t: "sector", deg: 180, rot: 0 }, { t: "sector", deg: 90, rot: 180 }, { t: "sector", deg: 120, rot: 300 }], answer: "R" }],
    "Bagian yang hilang adalah seperempat lingkaran: sudutnya siku-siku seperti sudut kertas. R seperempat lingkaran; jika diputar, R pas di kanan atas. P lebih sempit, S lebih lebar, dan Q setengah lingkaran.", { level: "Menantang", fig: { t: "missing", deg: 90, rot: 0 } }),
  q(0, "Kelompokkan bangun datar berikut menurut nama segi banyaknya.", [{ kind: "sort", label: "Bangun", items: [{ name: "A", fig: poly("dart", 0) }, { name: "B", fig: poly("hexL", 1) }, { name: "C", fig: poly("pentIrr", 2) }, { name: "D", fig: poly("triObtuse", 3) }, { name: "E", fig: poly("hexIrr", 4) }, { name: "F", fig: poly("house", 5, 180) }], bins: NS, answer: [1, 3, 2, 0, 3, 2] }],
    "Hitung sisinya satu per satu, jangan tertipu bentuk yang tidak biasa. A punya 4 sisi walaupun cekung ke dalam. B berbentuk huruf L dengan 6 sisi. C dan F punya 5 sisi, D punya 3 sisi, E punya 6 sisi.", { level: "Sangat menantang" }),
  q(2, "Benda manakah yang berbentuk kerucut?", [{ kind: "choice", label: "Benda", options: ["Kaleng susu", "Kotak tisu", "Kelereng", "Topi ulang tahun"], figs: [{ t: "obj", o: "kaleng" }, { t: "obj", o: "kotakTisu" }, { t: "obj", o: "kelereng" }, { t: "obj", o: "topi" }], answer: "Topi ulang tahun" }],
    "Kerucut mempunyai alas lingkaran dan ujung yang runcing. Topi ulang tahun berbentuk kerucut. Kaleng berbentuk tabung, kotak tisu balok, kelereng bola.", { level: "Sedang" }),
  q(1, "Buat garis agar segi lima ini menjadi 3 segitiga.", [{ kind: "cut", label: "Segi lima", shape: "segiLima", pieces: 3, exact: [3, 3, 3], sample: [[0, 4], [0, 6]] }],
    "Tarik dua garis dari satu sudut ke dua sudut yang tidak bersebelahan. Segi lima terbagi menjadi 3 segitiga.", { level: "Sangat menantang" }),
  q(0, "Warnai semua lingkaran dengan mengetuknya.", [{ kind: "check", label: "Bentuk lengkung", items: [{ name: "A", fig: curve("ovalTall", 0) }, { name: "B", fig: curve("circleSmall", 1) }, { name: "C", fig: curve("drop", 2) }, { name: "D", fig: curve("circle", 3) }, { name: "E", fig: curve("egg", 4, 90) }, { name: "F", fig: curve("semi", 5, 90) }, { name: "G", fig: curve("oval", 6) }], answer: [1, 3] }],
    "Lingkaran bulat sempurna: jika diputar tetap sama dengan cetakannya. Hanya B dan D yang lingkaran. A dan G lonjong, E berbentuk telur, C seperti tetesan, F setengah lingkaran.", { level: "Menantang" }),
  q(2, "Rani mengecap semua permukaan datar dua benda. Benda P menghasilkan 2 lingkaran yang sama besar. Benda Q menghasilkan 1 lingkaran saja. Apa bentuk benda P dan Q?", [{ kind: "choice", label: "Benda P", options: ["Kerucut", "Kubus", "Bola", "Tabung"], answer: "Tabung" }, { kind: "choice", label: "Benda Q", options: ["Kerucut", "Kubus", "Bola", "Tabung"], answer: "Kerucut" }],
    "Tabung mempunyai 2 permukaan datar berbentuk lingkaran (alas dan tutup). Kerucut hanya mempunyai 1 permukaan datar, yaitu alasnya. Bola tidak mempunyai permukaan datar, kubus menghasilkan segi empat.", { level: "Sangat menantang" }),
  q(1, "Buat satu garis agar segi enam ini menjadi 2 segi empat.", [{ kind: "cut", label: "Segi enam", shape: "segiEnam", pieces: 2, exact: [4, 4], sample: [[0, 6]] }],
    "Tarik garis dari satu sudut ke sudut yang tepat berseberangan. Kedua bagian masing-masing mempunyai 4 sisi. Garis dari titik tengah sisi ke titik tengah sisi seberang menghasilkan 2 segi lima.", { level: "Menantang" }),
  q(0, "Perhatikan bangun berbentuk huruf L ini. Berapa banyak sisinya dan apa namanya?", [{ kind: "number", label: "Banyak sisi", answer: 6 }, { kind: "choice", label: "Nama bangun", options: ["Segi empat", "Segi lima", "Segi enam"], answer: "Segi enam" }],
    "Telusuri tepinya: atas, kanan bagian atas, lekukan mendatar, kanan bagian bawah, bawah, dan kiri. Ada 6 sisi, jadi bangun ini segi enam walaupun tidak tampak seperti sarang lebah.", { level: "Sangat menantang", fig: poly("hexL", 1) }),
  q(1, "Urai bangun datar berikut. Tarik garis dari bangun datar ke hasil uraiannya. Ada satu hasil uraian yang tidak dipakai.", [{ kind: "match", label: "Hasil uraian", left: [{ name: "Panah", fig: { t: "pieces", list: [{ pts: [[0, 16], [56, 16], [56, 0], [86, 30], [56, 60], [56, 44], [0, 44]], c: 6 }] } }, { name: "Segi enam", fig: { t: "pieces", list: [{ pts: [[20, 0], [60, 0], [80, 34], [60, 68], [20, 68], [0, 34]], c: 6 }] } }, { name: "Tangga", fig: { t: "pieces", list: [{ pts: [[0, 0], [24, 0], [24, 24], [48, 24], [48, 48], [72, 48], [72, 72], [0, 72]], c: 6 }] } }],
    right: [{ name: "2 segitiga dan 1 segi empat", fig: pieces(tri([[0, 34], [20, 0], [20, 68]], 2), box(26, 0, 40, 68, 1), tri([[72, 0], [92, 34], [72, 68]], 2)) }, { name: "1 segitiga dan 1 segi empat", fig: pieces(box(0, 0, 56, 28, 1), tri([[62, 0], [92, 30], [62, 60]], 2)) }, { name: "2 segitiga dan 2 segi empat", fig: pieces(tri([[0, 0], [24, 24], [0, 24]], 2), tri([[30, 0], [54, 24], [30, 24]], 2), box(60, 0, 24, 24, 1), box(90, 0, 24, 24, 1)) }, { name: "3 segi empat", fig: pieces(box(0, 0, 24, 72, 1), box(30, 24, 24, 48, 1), box(60, 48, 24, 24, 1)) }], answer: [1, 0, 3] }],
    "Panah terurai menjadi batang segi empat dan kepala segitiga. Segi enam dipotong dua garis tegak menjadi segitiga, segi empat, segitiga. Tangga terurai menjadi 3 segi empat dengan tinggi berbeda. Hasil 2 segitiga dan 2 segi empat tidak cocok dengan bangun mana pun.", { level: "Sangat menantang" }),
  q(2, "Kelompokkan benda menurut nama bangun ruangnya.", [{ kind: "sort", label: "Benda", items: [obj("kotakSusu"), obj("jeruk"), obj("drum"), obj("dadu"), obj("conEs"), obj("kotakPensil")], bins: ["Kubus", "Balok", "Tabung", "Kerucut", "Bola"], answer: [1, 4, 2, 0, 3, 1] }],
    "Kotak susu dan kotak pensil berbentuk balok, jeruk bola, drum tabung, dadu kubus, kerucut es krim kerucut.", { level: "Menantang" }),
  q(0, "Warnai semua segi banyak dengan mengetuknya.", [{ kind: "check", label: "Bangun", items: [{ name: "A", fig: poly("star", 0) }, { name: "B", fig: curve("heart", 1) }, { name: "C", fig: poly("rhombus", 2) }, { name: "D", fig: curve("circle", 3) }, { name: "E", fig: poly("tri", 4) }, { name: "F", fig: curve("semi", 5) }, { name: "G", fig: poly("pent", 6) }, { name: "H", fig: curve("oval", 7) }], answer: [0, 2, 4, 6] }],
    "Segi banyak hanya dibatasi garis lurus. Bintang (A) juga segi banyak karena semua tepinya lurus. Setengah lingkaran (F) punya satu garis lurus tetapi juga punya kurva, jadi termasuk bentuk lengkung.", { level: "Menantang" }),
  q(2, "Kelompokkan benda berikut ke dalam bangun datar dan bangun ruang.", [{ kind: "sort", label: "Benda", items: [obj("stikerBulat"), obj("kaleng"), obj("kartuSegitiga"), obj("kotakPensil"), obj("kertasPersegi"), obj("drum")], bins: ["Bangun datar", "Bangun ruang"], answer: [0, 1, 0, 1, 0, 1] }],
    "Stiker, kartu, dan kertas lipat tipis sekali, hanya punya satu permukaan, jadi bangun datar. Kaleng, kotak pensil, dan drum punya lebih dari satu permukaan dan dapat diisi, jadi bangun ruang.", { level: "Menantang" }),
  q(1, "Dua segitiga siku-siku yang sama besar disusun tanpa celah. Bentuk mana yang tidak mungkin dihasilkan?", [{ kind: "choice", label: "Tidak mungkin", options: ["Segi lima", "Persegi", "Segitiga besar", "Jajargenjang"], figs: [{ t: "pieces", list: [{ pts: [[0, 24], [24, 0], [48, 24], [48, 64], [0, 64]], c: 6 }] }, { t: "pieces", list: [box(0, 0, 40, 40, 6)] }, { t: "pieces", list: [{ pts: [[0, 40], [40, 0], [80, 40]], c: 6 }] }, { t: "pieces", list: [{ pts: [[0, 40], [40, 0], [80, 0], [40, 40]], c: 6 }] }], answer: "Segi lima" }],
    "Dua segitiga hanya mempunyai 6 sudut. Jika dirapatkan, bisa menjadi persegi, segitiga besar, atau jajargenjang. Bentuk rumah segi lima membutuhkan atap segitiga di atas persegi, sehingga tidak dapat dibuat dari dua segitiga siku-siku yang sama.", { level: "Sangat menantang", fig: pieces(tri([[0, 0], [40, 40], [0, 40]], 0), tri([[46, 0], [86, 40], [46, 40]], 0)) }),
  q(2, "Ada berapa balok satuan pada susunan ini? Ingat, ada balok yang tertutup balok lain.", [{ kind: "choice", label: "Banyak balok", options: ["6", "7", "8", "10"], answer: "8" }],
    "Lapis bawah ada 2 baris berisi 3 balok, jadi 6 balok (baris belakang tertutup sebagian). Lapis atas ada 2 balok. 6 + 2 = 8.", { level: "Sangat menantang", fig: { t: "stack", cubes: hiddenStack } }),
];
