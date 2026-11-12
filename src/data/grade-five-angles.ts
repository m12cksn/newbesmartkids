import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 5 Bab 6 - Sudut (Buku Matematika SD/MI Kelas V, hlm. 163-190).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Pt = [number, number];
export type Kind = "Nol" | "Lancip" | "Siku-siku" | "Tumpul" | "Lurus" | "Refleks" | "Penuh";

/* ---------- Hitungan sudut ---------- */
export const kindOf = (d: number): Kind => (d === 0 ? "Nol" : d < 90 ? "Lancip" : d === 90 ? "Siku-siku" : d < 180 ? "Tumpul" : d === 180 ? "Lurus" : d < 360 ? "Refleks" : "Penuh");
/** Sudut terkecil antara jarum jam pada pukul h:m. */
export const clockAngle = (h: number, m = 0) => { const a = Math.abs(30 * (h % 12) + 0.5 * m - 6 * m); return Math.min(a, 360 - a); };
/** Besar sudut dalam (derajat) di setiap titik sudut poligon, urutan titik searah atau berlawanan jarum jam. */
export function cornerAngles(pts: Pt[]): number[] {
  const n = pts.length, area = pts.reduce((a, p, i) => { const q = pts[(i + 1) % n]; return a + p[0] * q[1] - q[0] * p[1]; }, 0), s = Math.sign(area);
  return pts.map((p, i) => {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]];
    let ang = (Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]) * 180) / Math.PI;
    ang = s > 0 ? -ang : ang; if (ang < 0) ang += 360;
    return Math.round(ang * 10) / 10;
  });
}
export const rightCorners = (pts: Pt[]) => cornerAngles(pts).flatMap((a, i) => (Math.abs(a - 90) < 0.5 ? [i] : []));

/* ---------- Gambar ---------- */
/** Sudut: kaki pertama ke arah base (derajat, berlawanan jarum jam dari kanan), kaki kedua base ± deg. */
export type AngleSpec = { base: number; deg: number; side?: "ccw" | "cw"; reflex?: boolean; tags?: { at: "vertex" | "ray" | "region"; text: string }[] };
export type Shape = { pts: Pt[]; label?: string };
export type Road = { name: string; dir: number };
export type Scene =
  | { type: "angle"; angle: AngleSpec; tool?: boolean }
  | { type: "angles"; items: (AngleSpec & { label: string })[]; tool?: boolean }
  | { type: "clock"; h: number; m?: number }
  | { type: "shapes"; items: Shape[] }
  | { type: "fans"; items: { label: string; deg: number; base: number }[]; tool?: boolean }
  | { type: "roads"; roads: Road[]; shown: [number, number][] }
  | { type: "tiles" };

export type Part =
  | { kind: "number"; label: string; answer: number; unit?: string }
  | { kind: "items"; items: { label: string; answer: number }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string; figs?: AngleSpec[] }
  /** Setiap baris memilih satu jenis; baris dapat bergambar sudut atau jam. */
  | { kind: "classify"; rows: { text: string; angle?: AngleSpec; clock?: [number, number] }[]; options: string[]; answers: string[] }
  /** Ketuk titik sudut yang membentuk sudut siku-siku. */
  | { kind: "corners"; shape: Shape }
  /** Lukis sudut: putar kaki sudut kedua sampai besar sudutnya tepat. */
  | { kind: "draw"; base: number; side: "ccw" | "cw"; target: number }
  /** Atur jarum jam (jam bulat) sehingga sudut terkecilnya berjenis tertentu. */
  | { kind: "clockSet"; target: Kind; avoid: number[] }
  | { kind: "order"; label: string; options: string[]; answer: string[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] };

export type GQuestion = Question & { topic: 0 | 1 | 2 | 3; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Isian ---------- */
export const fieldCount = (p: Part) => (p.kind === "items" ? p.items.length : p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : 1);
export const clockOk = (p: Extract<Part, { kind: "clockSet" }>, h: number) => h >= 1 && h <= 12 && kindOf(clockAngle(h)) === p.target && !p.avoid.includes(h);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "number": return [String(p.answer)];
    case "items": return p.items.map(it => String(it.answer));
    case "choice": return [p.answer];
    case "classify": return p.answers;
    case "corners": return [rightCorners(p.shape.pts).join(",")];
    case "draw": return [String(p.target)];
    case "clockSet": return [String(Array.from({ length: 12 }, (_, i) => i + 1).find(h => clockOk(p, h)))];
    case "order": return [p.answer.join(";")];
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);
function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "clockSet": return clockOk(p, int(v));
    case "corners": return [...(v ? v.split(",").map(Number) : [])].sort((a, b) => a - b).join(",") === fields(p)[0];
    case "number": case "draw": return int(v) === Number(fields(p)[0]);
    case "items": return cells(p, v).every((x, i) => int(x) === p.items[i].answer);
    default: return cells(p, v).join("|") === fields(p).join("|");
  }
}
function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "items": return cells(p, v).every(x => !Number.isNaN(int(x)));
    case "classify": case "tf": return cells(p, v).every(Boolean);
    case "order": return v.split(";").filter(Boolean).length === p.options.length;
    case "corners": return Boolean(v);
    case "number": case "draw": case "clockSet": return !Number.isNaN(int(v));
    default: return Boolean(v);
  }
}
export const correct = (q: GQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: GQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: GQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => s || "…";
    switch (p.kind) {
      case "number": return `${p.label} ${d(v[i])}${p.unit ?? "°"}`;
      case "items": return p.items.map((it, k) => `${it.label} ${d(x[k])}`).join(", ");
      case "classify": return p.rows.map((r, k) => `${r.text}: ${d(x[k])}`).join("; ");
      case "corners": return v[i] ? `sudut siku-siku di titik ${v[i].split(",").map(k => String.fromCharCode(65 + Number(k))).join(", ")}` : "tidak ada titik dipilih";
      case "draw": return `kaki sudut diputar ${d(v[i])}°`;
      case "clockSet": return v[i] ? `pukul ${String(v[i]).padStart(2, "0")}.00 (${clockAngle(Number(v[i]))}°)` : "…";
      case "order": return v[i] ? v[i].split(";").map((s, k) => `${k + 1}. ${s}`).join(" ") : "…";
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return d(v[i]);
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: GQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): GQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const A = (base: number, deg: number, side: "ccw" | "cw" = "ccw", extra: Partial<AngleSpec> = {}): AngleSpec => ({ base, deg, side, ...extra });
const types3 = ["Lancip", "Siku-siku", "Tumpul"];
const shapes = {
  rect: [[0, 0], [6, 0], [6, 4], [0, 4]] as Pt[],
  rightTrap: [[0, 0], [4, 0], [6, 4], [0, 4]] as Pt[],
  house: [[0, 2], [2, 0], [4, 2], [4, 5], [0, 5]] as Pt[],
  octTop: [[1, 0], [5, 0], [6, 1], [6, 4], [0, 4], [0, 1]] as Pt[],
  kite: [[3, 0], [5, 3], [3, 7], [1, 3]] as Pt[],
  lShape: [[0, 0], [3, 0], [3, 3], [6, 3], [6, 6], [0, 6]] as Pt[],
  diamond: [[3, 0], [6, 3], [3, 6], [0, 3]] as Pt[],
  slant: [[0, 0], [5, 1], [4, 5], [1, 4]] as Pt[],
  para: [[1, 0], [6, 0], [5, 4], [0, 4]] as Pt[],
  pent: [[3, 0], [6, 2], [5, 5], [1, 5], [0, 2]] as Pt[],
  trapIso: [[1, 0], [5, 0], [6, 4], [0, 4]] as Pt[],
  tri: [[0, 4], [5, 0], [6, 5]] as Pt[],
};
const steps = [
  "Buat titik sudut dan satu kaki sudut.",
  "Letakkan pusat busur pada titik sudut, garis dasar berimpit dengan kaki sudut.",
  "Beri titik pada angka besar sudut, dihitung dari 0 pada kaki sudut.",
  "Angkat busur, hubungkan titik sudut dengan titik tadi.",
  "Periksa lagi besar sudut dengan busur derajat.",
];
const roads: Road[] = [{ name: "Jalan Nuri", dir: 30 }, { name: "Jalan Jalak", dir: 130 }, { name: "Jalan Ketilang", dir: 265 }, { name: "Jalan Bangau", dir: 300 }];

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Sudut Siku-Siku", short: "Sudut siku-siku",
    steps: [
      "Pojok bingkai foto, pojok buku, dan pojok papan tulis membentuk sudut siku-siku.",
      "Lipat selembar kertas mendatar lalu tegak. Pojok lipatannya adalah sudut siku-siku yang bisa dipakai sebagai alat periksa.",
      "Tempelkan pojok lipatan ke sudut benda. Jika kedua sisinya berimpit tepat, sudut itu siku-siku.",
      "Sudut siku-siku sering ditandai dengan kotak kecil di pojoknya.",
    ],
    demo: "Pilih bangun, lalu ketuk setiap pojok untuk menempelkan lipatan kertas. Lihat apakah pojok itu siku-siku, lebih kecil, atau lebih besar.",
  },
  {
    code: "B", title: "Pengertian Sudut", short: "Jenis sudut",
    steps: [
      "Sudut adalah daerah yang dibentuk oleh dua garis yang bertemu di satu titik. Titik pertemuannya disebut titik sudut, garisnya disebut kaki sudut.",
      "Sudut lancip lebih kecil dari sudut siku-siku. Sudut tumpul lebih besar dari sudut siku-siku tetapi lebih kecil dari sudut lurus.",
      "Sudut nol 0°, siku-siku 90°, lurus 180°, penuh 360°. Sudut refleks lebih dari 180° dan kurang dari 360°.",
      "Jarum pendek dan panjang jam membentuk sudut. Pukul 03.00 siku-siku, pukul 02.00 lancip, pukul 08.00 tumpul.",
    ],
    demo: "Putar kaki sudut dan lihat jenis sudutnya berubah. Lalu atur jarum jam dan lihat sudut yang terbentuk.",
  },
  {
    code: "C", title: "Mengukur dan Membandingkan Sudut", short: "Mengukur sudut",
    steps: [
      "Besar sudut dinyatakan dalam derajat (°) dan diukur dengan busur derajat.",
      "Letakkan pusat busur pada titik sudut. Geser busur sehingga garis dasarnya berimpit dengan salah satu kaki sudut.",
      "Kaki sudut yang berimpit dengan garis dasar menunjukkan 0°. Baca angka yang dilewati kaki sudut lainnya, dari skala yang dimulai dari 0 itu.",
      "Untuk membandingkan, ukur setiap sudut. Sudut dengan derajat lebih besar terbuka lebih lebar, seperti kipas pada tari pakarena.",
    ],
    demo: "Ketuk Pasang busur derajat, lalu baca angka yang dilewati kaki sudut kedua. Ganti sudut dan bandingkan.",
  },
  {
    code: "D", title: "Melukis Sudut", short: "Melukis sudut",
    steps: [
      "Buat titik sudut dan satu kaki sudut.",
      "Letakkan pusat busur derajat pada titik sudut, garis dasarnya berimpit dengan kaki sudut.",
      "Beri titik pada angka besar sudut yang diminta, dihitung dari 0 pada kaki sudut. Jangan salah membaca skala dalam dan luar.",
      "Angkat busur, hubungkan titik sudut dengan titik tadi, lalu periksa lagi ukurannya.",
    ],
    demo: "Pilih besar sudut, lalu putar kaki sudut kedua sampai jarumnya tepat di angka itu pada busur.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: GQuestion[][] = [
  [
    q(0, "Ketuklah semua titik sudut yang membentuk sudut siku-siku pada bangun berikut.", [{ kind: "corners", shape: { pts: shapes.rect } }], "Keempat pojok persegi panjang adalah sudut siku-siku."),
    q(0, "Berapa banyak sudut siku-siku pada bangun berikut?", [{ kind: "number", label: "Banyak sudut siku-siku =", answer: 2, unit: "" }], "Dua pojok bawah siku-siku. Dua pojok atas yang terpotong miring tidak siku-siku.", { scene: { type: "shapes", items: [{ pts: shapes.octTop }] } }),
    q(0, "Lengkapi banyaknya sudut pada setiap bangun berikut.", [{ kind: "items", items: [{ label: "Bangun 1 (jajargenjang):", answer: 4 }, { label: "Bangun 2 (segi lima):", answer: 5 }, { label: "Bangun 3 (segitiga):", answer: 3 }] }],
      "Banyak sudut sama dengan banyak titik sudut: jajargenjang 4, segi lima 5, segitiga 3.", { scene: { type: "shapes", items: [{ pts: shapes.para, label: "1" }, { pts: shapes.pent, label: "2" }, { pts: shapes.tri, label: "3" }] } }),
    q(0, "Tentukan benar atau salah pernyataan berikut.", [{ kind: "tf", statements: [
      { text: "Pojok bingkai foto persegi panjang membentuk sudut siku-siku.", answer: true },
      { text: "Semua pojok bangun segi empat pasti sudut siku-siku.", answer: false },
      { text: "Lipatan kertas dua kali (mendatar lalu tegak) menghasilkan sudut siku-siku.", answer: true },
    ] }], "Bingkai persegi panjang punya 4 sudut siku-siku. Jajargenjang dan layang-layang adalah segi empat tanpa sudut siku-siku."),
  ],
  [
    q(1, "Tentukan jenis setiap sudut berikut.", [{ kind: "classify", options: types3, rows: [{ text: "Sudut 1", angle: A(0, 45) }, { text: "Sudut 2", angle: A(0, 90) }, { text: "Sudut 3", angle: A(0, 130) }, { text: "Sudut 4", angle: A(30, 70) }], answers: ["Lancip", "Siku-siku", "Tumpul", "Lancip"] }],
      "45° dan 70° lebih kecil dari siku-siku (lancip). 130° lebih besar dari siku-siku (tumpul)."),
    q(1, "Perhatikan gambar sudut berikut. Bagian yang ditunjuk huruf P disebut …", [{ kind: "choice", label: "P adalah", options: ["titik sudut", "kaki sudut", "daerah sudut"], answer: "titik sudut" }],
      "P adalah titik pertemuan dua kaki sudut, disebut titik sudut. Q adalah kaki sudut.", { scene: { type: "angle", angle: A(0, 40, "ccw", { tags: [{ at: "vertex", text: "P" }, { at: "ray", text: "Q" }] }) } }),
    q(1, "Tentukan jenis sudut yang dibentuk jarum pendek dan jarum panjang pada setiap jam berikut.", [{ kind: "classify", options: types3, rows: [{ text: "Pukul 08.00", clock: [8, 0] }, { text: "Pukul 03.00", clock: [3, 0] }, { text: "Pukul 01.00", clock: [1, 0] }, { text: "Pukul 05.00", clock: [5, 0] }], answers: ["Tumpul", "Siku-siku", "Lancip", "Tumpul"] }],
      "Pukul 08.00: 120° (tumpul). Pukul 03.00: 90° (siku-siku). Pukul 01.00: 30° (lancip). Pukul 05.00: 150° (tumpul)."),
    q(1, "Atur jarum jam sehingga jarum pendek dan jarum panjang membentuk sudut lancip. Jangan gunakan pukul 02.00 seperti contoh.", [{ kind: "clockSet", target: "Lancip", avoid: [2] }],
      "Sudut lancip terbentuk pada pukul 01.00 (30°), 10.00 (60°), atau 11.00 (30°)."),
  ],
  [
    q(2, "Ukurlah besar sudut berikut dengan busur derajat.", [{ kind: "number", label: "Besar sudut =", answer: 50 }], "Pusat busur di titik sudut, garis dasar berimpit dengan kaki bawah. Kaki lainnya melewati angka 50.", { scene: { type: "angle", angle: A(0, 50), tool: true } }),
    q(2, "Ukurlah besar sudut berikut dengan busur derajat.", [{ kind: "number", label: "Besar sudut =", answer: 125 }], "Kaki sudut yang berimpit dengan garis dasar menunjukkan 0. Baca skala yang dimulai dari 0 itu: 125°.", { scene: { type: "angle", angle: A(180, 125, "cw"), tool: true } }),
    q(2, "Berapa besar sudut terkecil yang dibentuk jarum pendek dan jarum panjang pada pukul 02.00?", [{ kind: "number", label: "Besar sudut =", answer: 60 }], "Jarak antarangka pada jam 360° : 12 = 30°. Dari 12 ke 2 ada 2 jarak: 2 × 30° = 60°.", { scene: { type: "clock", h: 2 } }),
    q(2, "Ukurlah sudut setiap kipas. Kipas manakah yang terbuka paling lebar?", [{ kind: "choice", label: "Kipas terlebar", options: ["Kipas 1", "Kipas 2", "Kipas 3", "Kipas 4"], answer: "Kipas 2" }],
      "Kipas 1: 100°, kipas 2: 140°, kipas 3: 120°, kipas 4: 80°. Kipas 2 terbuka paling lebar.", { scene: { type: "fans", tool: true, items: [{ label: "Kipas 1", deg: 100, base: 40 }, { label: "Kipas 2", deg: 140, base: 20 }, { label: "Kipas 3", deg: 120, base: 30 }, { label: "Kipas 4", deg: 80, base: 50 }] } }),
  ],
  [
    q(3, "Lukislah sudut 30°. Putar kaki sudut kedua sampai tepat di angka 30 pada busur.", [{ kind: "draw", base: 0, side: "ccw", target: 30 }], "Kaki pertama menunjukkan 0. Putar kaki kedua sampai angka 30 pada skala yang dimulai dari 0."),
    q(3, "Lukislah sudut 75°. Kaki sudut pertama mengarah ke kiri.", [{ kind: "draw", base: 180, side: "cw", target: 75 }], "Kaki pertama mengarah ke kiri, jadi baca skala yang angka 0-nya di kiri. Berhenti di 75."),
    q(3, "Urutkan langkah-langkah melukis sudut dengan busur derajat.", [{ kind: "order", label: "Urutan langkah", options: [steps[2], steps[0], steps[3], steps[1]], answer: steps.slice(0, 4) }],
      "Buat titik sudut dan kaki sudut, letakkan busur, beri titik pada angka sudut, lalu hubungkan."),
    q(3, "Gambar manakah yang menunjukkan sudut 110°?", [{ kind: "choice", label: "Sudut 110°", options: ["A", "B", "C", "D"], answer: "C", figs: [A(0, 70), A(0, 90), A(0, 110), A(0, 150)] }],
      "110° sedikit lebih besar dari siku-siku. Gambar A 70°, B 90°, D 150°."),
  ],
];

/* ---------- Evaluasi: 24 soal, A, B, C, D bergantian ---------- */
export const assessment: GQuestion[] = [
  // Sedang (1-8)
  q(0, "Berapa banyak sudut siku-siku pada bangun berikut?", [{ kind: "number", label: "Banyak sudut siku-siku =", answer: 2, unit: "" }], "Pojok kiri atas dan kiri bawah siku-siku. Pojok kanan bawah tumpul dan kanan atas lancip.", { level: "Sedang", scene: { type: "shapes", items: [{ pts: shapes.rightTrap }] } }),
  q(1, "Tentukan jenis setiap sudut berikut.", [{ kind: "classify", options: ["Lancip", "Siku-siku", "Tumpul", "Lurus"], rows: [{ text: "Sudut 1", angle: A(0, 35) }, { text: "Sudut 2", angle: A(90, 90) }, { text: "Sudut 3", angle: A(0, 150) }, { text: "Sudut 4", angle: A(0, 180) }], answers: ["Lancip", "Siku-siku", "Tumpul", "Lurus"] }],
    "35° lancip, 90° siku-siku walaupun posisinya diputar, 150° tumpul, 180° lurus.", { level: "Sedang" }),
  q(2, "Ukurlah besar sudut berikut dengan busur derajat.", [{ kind: "number", label: "Besar sudut =", answer: 70 }], "Kaki bawah berimpit dengan garis dasar (0). Kaki lainnya melewati angka 70.", { level: "Sedang", scene: { type: "angle", angle: A(0, 70), tool: true } }),
  q(3, "Lukislah sudut 45°.", [{ kind: "draw", base: 0, side: "ccw", target: 45 }], "Mulai dari 0 pada kaki pertama, putar sampai angka 45.", { level: "Sedang" }),
  q(0, "Ketuklah semua titik sudut yang membentuk sudut siku-siku pada bangun berikut.", [{ kind: "corners", shape: { pts: shapes.house } }],
    "Dua pojok bawah siku-siku. Pojok atap juga siku-siku karena kedua sisinya miring 45°. Dua pojok di tepi atap tumpul.", { level: "Sedang" }),
  q(1, "Atur jarum jam sehingga jarum pendek dan jarum panjang membentuk sudut tumpul. Jangan gunakan pukul 08.00 seperti contoh.", [{ kind: "clockSet", target: "Tumpul", avoid: [8] }],
    "Sudut tumpul terbentuk pada pukul 04.00 (120°), 05.00 (150°), atau 07.00 (150°).", { level: "Sedang" }),
  q(2, "Berapa besar sudut terkecil yang dibentuk jarum pendek dan jarum panjang pada pukul 04.00?", [{ kind: "number", label: "Besar sudut =", answer: 120 }], "Dari 12 ke 4 ada 4 jarak, 4 × 30° = 120°.", { level: "Sedang", scene: { type: "clock", h: 4 } }),
  q(3, "Urutkan langkah-langkah melukis sudut dengan busur derajat.", [{ kind: "order", label: "Urutan langkah", options: [steps[3], steps[1], steps[4], steps[0], steps[2]], answer: steps }],
    "Titik sudut dan kaki sudut dulu, lalu busur, titik pada angka sudut, hubungkan, dan terakhir periksa.", { level: "Sedang" }),
  // Menantang (9-17)
  q(0, "Berapa banyak sudut siku-siku pada setiap bangun berikut?", [{ kind: "items", items: [{ label: "Bangun 1:", answer: 4 }, { label: "Bangun 2:", answer: 0 }, { label: "Bangun 3:", answer: 2 }] }],
    "Bangun 1 persegi panjang: 4. Bangun 2 layang-layang: tidak ada. Bangun 3 trapesium siku-siku: 2.", { level: "Menantang", scene: { type: "shapes", items: [{ pts: shapes.rect, label: "1" }, { pts: shapes.kite, label: "2" }, { pts: shapes.rightTrap, label: "3" }] } }),
  q(1, "Jodohkan setiap pernyataan dengan jenis sudut yang sesuai.", [{ kind: "classify", options: ["Lancip", "Siku-siku", "Tumpul", "Lurus", "Refleks"], rows: [
    { text: "Sudut yang besarnya 90°" }, { text: "Sudut yang besarnya lebih dari 90° dan kurang dari 180°" }, { text: "Sudut yang besarnya lebih dari 0° dan kurang dari 90°" }, { text: "Sudut yang besarnya 180°" }, { text: "Sudut yang besarnya lebih dari 180° dan kurang dari 360°" },
  ], answers: ["Siku-siku", "Tumpul", "Lancip", "Lurus", "Refleks"] }], "Siku-siku 90°, tumpul antara 90° dan 180°, lancip di bawah 90°, lurus 180°, refleks antara 180° dan 360°.", { level: "Menantang" }),
  q(2, "Ukurlah besar sudut berikut. Posisi sudutnya miring, jadi putar busur mengikuti salah satu kaki sudut.", [{ kind: "number", label: "Besar sudut =", answer: 145 }], "Pusat busur di titik sudut, garis dasar berimpit dengan kaki yang miring. Kaki lainnya melewati angka 145.", { level: "Menantang", scene: { type: "angle", angle: A(25, 145), tool: true } }),
  q(3, "Lukislah sudut 112°. Kaki sudut pertama mengarah ke kiri.", [{ kind: "draw", base: 180, side: "cw", target: 112 }], "Baca skala yang angka 0-nya berimpit dengan kaki pertama di kiri. 112° lebih besar dari siku-siku.", { level: "Menantang" }),
  q(0, "Ketuklah semua titik sudut yang membentuk sudut siku-siku pada bangun berbentuk huruf L berikut.", [{ kind: "corners", shape: { pts: shapes.lShape } }],
    "Lima pojok siku-siku. Pojok bagian dalam huruf L besarnya 270°, jadi bukan siku-siku.", { level: "Menantang" }),
  q(1, "Tentukan jenis sudut yang dibentuk jarum pendek dan jarum panjang pada setiap jam berikut.", [{ kind: "classify", options: ["Lancip", "Siku-siku", "Tumpul", "Lurus"], rows: [{ text: "Pukul 10.00", clock: [10, 0] }, { text: "Pukul 04.00", clock: [4, 0] }, { text: "Pukul 09.00", clock: [9, 0] }, { text: "Pukul 06.00", clock: [6, 0] }], answers: ["Lancip", "Tumpul", "Siku-siku", "Lurus"] }],
    "Pukul 10.00: 60° lancip. 04.00: 120° tumpul. 09.00: 90° siku-siku. 06.00: 180° lurus.", { level: "Menantang" }),
  q(2, "Ukurlah sudut setiap kipas pada tari pakarena. Kipas manakah yang terbuka paling lebar, dan berapa besar sudutnya?", [{ kind: "choice", label: "Kipas terlebar", options: ["Kipas 1", "Kipas 2", "Kipas 3", "Kipas 4"], answer: "Kipas 3" }, { kind: "number", label: "Besar sudutnya =", answer: 150 }],
    "Kipas 1: 110°, kipas 2: 95°, kipas 3: 150°, kipas 4: 130°. Kipas 3 paling lebar, 150°.", { level: "Menantang", scene: { type: "fans", tool: true, items: [{ label: "Kipas 1", deg: 110, base: 35 }, { label: "Kipas 2", deg: 95, base: 45 }, { label: "Kipas 3", deg: 150, base: 15 }, { label: "Kipas 4", deg: 130, base: 25 }] } }),
  q(3, "Gambar manakah yang menunjukkan sudut 140°?", [{ kind: "choice", label: "Sudut 140°", options: ["A", "B", "C", "D"], answer: "B", figs: [A(0, 40), A(0, 140), A(0, 120), A(0, 160)] }],
    "Sudut 140° tumpul, 40° lebih kecil dari lurus. Gambar A hanya 40° (salah membaca skala), C 120°, D 160°.", { level: "Menantang" }),
  q(0, "Berapa banyak sudut siku-siku pada bangun berikut? Perhatikan, bangunnya diletakkan miring.", [{ kind: "number", label: "Banyak sudut siku-siku =", answer: 4, unit: "" }],
    "Ini persegi yang diputar. Posisinya miring, tetapi keempat sudutnya tetap siku-siku.", { level: "Menantang", scene: { type: "shapes", items: [{ pts: shapes.diamond }] } }),
  // Sangat menantang (18-24)
  q(1, "Pada pukul 04.00, sudut terkecil antara jarum jam besarnya 120°. Berapa besar sudut bagian luarnya (sudut refleks)?", [{ kind: "number", label: "Sudut refleks =", answer: 240 }],
    "Satu putaran penuh 360°. Sudut bagian luar = 360° − 120° = 240°, lebih dari 180° jadi sudut refleks.", { level: "Sangat menantang", scene: { type: "clock", h: 4 } }),
  q(2, "Perhatikan sudut terkecil jarum jam pada pukul 11.00, 08.00, dan 06.00. Sudut manakah yang paling besar dan berapa ukurannya?", [{ kind: "choice", label: "Paling besar", options: ["Pukul 11.00", "Pukul 08.00", "Pukul 06.00"], answer: "Pukul 06.00" }, { kind: "number", label: "Besarnya =", answer: 180 }],
    "Pukul 11.00: 30°. Pukul 08.00: 120°. Pukul 06.00: 180°. Paling besar pukul 06.00, yaitu sudut lurus 180°.", { level: "Sangat menantang" }),
  q(3, "Lukislah sudut 165°. Kaki sudut pertama sudah diletakkan miring.", [{ kind: "draw", base: 20, side: "ccw", target: 165 }], "Busur diputar mengikuti kaki pertama. Putar kaki kedua sampai angka 165, hampir sudut lurus.", { level: "Sangat menantang" }),
  q(0, "Bangun manakah yang memiliki tepat 3 sudut siku-siku?", [{ kind: "choice", label: "Bangun", options: ["Bangun 1", "Bangun 2", "Bangun 3", "Bangun 4"], answer: "Bangun 3" }],
    "Bangun 1 punya 4, bangun 2 punya 0, bangun 3 (bentuk rumah) punya 3, bangun 4 punya 2.", { level: "Sangat menantang", scene: { type: "shapes", items: [{ pts: shapes.rect, label: "1" }, { pts: shapes.para, label: "2" }, { pts: shapes.house, label: "3" }, { pts: shapes.rightTrap, label: "4" }] } }),
  q(1, "Atur jarum jam sehingga jarum pendek dan jarum panjang membentuk sudut siku-siku. Pukul 03.00 sudah dipakai sebagai contoh.", [{ kind: "clockSet", target: "Siku-siku", avoid: [3] }],
    "Selain pukul 03.00, jarum jam membentuk sudut siku-siku pada pukul 09.00.", { level: "Sangat menantang" }),
  q(2, "Gambar menunjukkan persimpangan jalan dilihat dari atas. Tiga sudut sudah diukur. Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Sudut antara Jalan Jalak dan Jalan Nuri adalah yang paling besar.", answer: false },
    { text: "Tidak ada sudut siku-siku di persimpangan itu.", answer: false },
    { text: "Besar sudut antara Jalan Jalak dan Jalan Ketilang adalah 135°.", answer: true },
  ] }], "Sudut-sudut di persimpangan berjumlah 360°. Sudut yang belum diukur = 360° − 100° − 135° − 35° = 90°, jadi ada sudut siku-siku. Sudut terbesar 135° antara Jalak dan Ketilang.",
    { level: "Sangat menantang", scene: { type: "roads", roads, shown: [[0, 1], [1, 2], [2, 3]] } }),
  q(3, "Pak Tukang memotong keramik untuk mengisi celah pada pola berikut. Setiap sudut keramik segi lima besarnya 108° dan sudut keramik persegi 90°. Berapa besar sudut potongan untuk setiap pola?", [{ kind: "items", items: [{ label: "Pola 1 (°):", answer: 54 }, { label: "Pola 2 (°):", answer: 36 }] }],
    "Sudut di sekeliling satu titik berjumlah 360°. Pola 1: 360° − 90° − 108° − 108° = 54°. Pola 2: 360° − 3 × 108° = 36°.", { level: "Sangat menantang", scene: { type: "tiles" } }),
];
