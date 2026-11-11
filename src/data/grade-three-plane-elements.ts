import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 3 Bab 4 - Unsur-Unsur Bangun Datar (Buku Matematika SD/MI Kelas III, hlm. 143-194).
 * Sumber: lampiran PDF pengguna (materi, Ayo Berlatih, dan Asesmen dalam satu berkas).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 * Evaluasi 24 soal = 3 soal bertipe Asesmen (tangram, membagi bangun, hiasan garis) + 21 soal bertipe Ayo Berlatih.
 */

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Seg = [number, number, number, number, string?];
export type Label = [number, number, string];

export type Fig =
  | { t: "line"; kind: "garis" | "ruas" | "sinar" | "kurva"; a: string; b: string }
  | { t: "ruler"; cm: number; a: string; b: string }
  | { t: "grid"; w: number; h: number; segs: Seg[]; labels?: Label[]; arrows?: number[]; right?: [number, number][] }
  | { t: "angle"; deg: number; base?: number; names: [string, string, string]; protractor?: boolean }
  | { t: "shape"; s: "triangle" | "square" | "rect" | "circle" | "pentagon" | "hexagon" | "trapezoid" }
  | { t: "geoboard" }
  | { t: "letter"; ch: string }
  | { t: "tangram" }
  | { t: "ornament" };

export type Card = { name: string; fig?: Fig };
export type Part =
  | { kind: "number"; label: string; unit?: string; answer: number }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "check"; label: string; cards: Card[]; answer: number[] }
  | { kind: "sort"; label: string; items: { name: string; fig?: Fig }[]; bins: string[]; answer: number[] }
  | { kind: "order"; label: string; cards: Card[]; answer: number[] }
  | { kind: "angle"; label: string; answer: number }
  | { kind: "segment"; label: string; answer: number }
  | { kind: "cut"; label: string; answer: number };

export type PQuestion = Question & { topic: 0 | 1 | 2; level?: Level; fig?: Fig; parts: Part[] };

/* ---------- Pemeriksaan jawaban (bagian dipisah "‖") ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
const dec = (v: string) => { const x = v.trim().replace(",", "."); return /^\d+(\.\d+)?$/.test(x) ? Number(x) : NaN; };
export const fmtDec = (n: number) => String(n).replace(".", ",");

function partAnswer(p: Part): string {
  switch (p.kind) {
    case "number": case "angle": case "segment": case "cut": return fmtDec(p.answer);
    case "choice": return p.answer;
    case "check": return [...p.answer].sort((a, b) => a - b).join(",");
    case "sort": case "order": return p.answer.join(",");
  }
}
function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": case "angle": case "segment": return Math.abs(dec(v) - p.answer) < 1e-9;
    case "cut": return Math.abs(dec(v.split("|")[0]) - p.answer) < 1e-9;
    case "choice": return v === p.answer;
    case "check": return v.split(",").filter(Boolean).map(Number).sort((a, b) => a - b).join(",") === partAnswer(p);
    case "sort": case "order": return v === partAnswer(p);
  }
}
function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": case "angle": case "segment": return !Number.isNaN(dec(v));
    case "cut": return dec(v.split("|")[0]) > 1;
    case "choice": return Boolean(v);
    case "check": return v.split(",").filter(Boolean).length > 0;
    case "sort": return v.split(",").length === p.items.length && v.split(",").every(x => x !== "");
    case "order": return v.split(",").filter(Boolean).length === p.cards.length;
  }
}
export const correct = (q: PQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: PQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: PQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = v[i], head = q.parts.length > 1 ? `${p.label}: ` : "";
    switch (p.kind) {
      case "number": return `${head}${x || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "angle": return `${head}${x || "…"}°`;
      case "segment": return `${head}${x || "…"} cm`;
      case "cut": return `${head}${x.split("|")[0] || "…"} bagian`;
      case "choice": return `${head}${x || "…"}`;
      case "check": return `${head}${x ? x.split(",").filter(Boolean).map(n => p.cards[Number(n)].name).join(", ") : "tidak ada"}`;
      case "sort": return `${head}${p.items.map((it, k) => `${it.name} → ${x.split(",")[k] ? p.bins[Number(x.split(",")[k])] : "…"}`).join("; ")}`;
      case "order": return `${head}${x ? x.split(",").filter(Boolean).map(n => p.cards[Number(n)].name).join(" → ") : "…"}`;
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: PQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; fig?: Fig } = {}): PQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(partAnswer).join(SEP), ...extra });
const num = (label: string, answer: number, unit?: string): Part => ({ kind: "number", label, answer, unit });
const pick = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });
const lineKinds = ["Garis", "Ruas garis", "Sinar garis", "Kurva/garis lengkung"];
const angleTypes = ["Sudut lancip", "Sudut siku-siku", "Sudut tumpul", "Sudut lurus", "Sudut refleks"];
const ang = (deg: number, names: [string, string, string], base = 0, protractor = false): Fig => ({ t: "angle", deg, names, base, protractor });
const grid = (segs: Seg[], extra: Partial<Extract<Fig, { t: "grid" }>> = {}): Fig => ({ t: "grid", w: 5, h: 5, segs, ...extra });

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Sisi pada Bangun Datar", short: "Sisi",
    steps: [
      "Garis dapat diperpanjang ke dua arah. Sinar garis hanya dapat diperpanjang ke satu arah. Ruas garis punya dua titik ujung sehingga panjangnya tertentu.",
      "Ukur ruas garis dengan penggaris: letakkan angka 0 tepat di titik awal, lalu baca angka di titik akhir. 1 cm = 10 mm, jadi 5 cm 5 mm = 5,5 cm.",
      "Ruas garis yang membatasi bangun datar disebut sisi. Segitiga punya 3 sisi, segi empat punya 4 sisi.",
      "Banyak sisi bangun datar bersisi lurus sama dengan banyak sudutnya. Lingkaran dibatasi garis lengkung dan tidak punya sudut.",
    ],
    demo: "Tarik titik ujung ruas garis di atas penggaris, lalu ubah banyak sisi bangun dan hitung sisi serta sudutnya.",
  },
  {
    code: "B", title: "Sudut pada Bidang Datar", short: "Sudut",
    steps: [
      "Sudut terbentuk ketika dua garis bertemu di satu titik. Titik itu disebut titik sudut, dan kedua garisnya disebut kaki sudut. Sudut AOB ditulis ∠AOB.",
      "Ukur sudut dengan busur derajat: letakkan pusat busur di titik sudut, satu kaki di garis 0, lalu baca angka yang dilewati kaki lainnya.",
      "Jenis sudut: lancip (kurang dari 90°), siku-siku (tepat 90°), tumpul (antara 90° dan 180°), lurus (180°), dan refleks (lebih dari 180°).",
      "Sudut refleks = 360° − sudut lancip atau tumpul pasangannya. Contoh: 360° − 130° = 230°.",
    ],
    demo: "Putar kaki sudut di atas busur derajat. Perhatikan jenis sudutnya berubah dari lancip, siku-siku, tumpul, sampai lurus.",
  },
  {
    code: "C", title: "Garis-Garis Tegak Lurus dan Garis-Garis Sejajar", short: "Tegak lurus & sejajar",
    steps: [
      "Dua garis yang berpotongan dan membentuk sudut siku-siku disebut garis tegak lurus. AB tegak lurus BC ditulis AB ⊥ BC.",
      "Dua garis yang jaraknya selalu sama dan tidak pernah berpotongan disebut garis sejajar. AB sejajar CD ditulis AB // CD.",
      "Di kertas berpetak, periksa garis sejajar dengan menghitung petak di kedua ujung: jika jaraknya sama, garisnya sejajar.",
      "Kertas yang dilipat dua kali membentuk sudut siku-siku yang dapat dipakai untuk memeriksa garis tegak lurus.",
    ],
    demo: "Putar garis kedua di kertas berpetak. Lihat kapan kedua garis menjadi tegak lurus, sejajar, atau hanya berpotongan biasa.",
  },
] as const;

/* ---------- Gambar-gambar bersama ---------- */
const parallelYes1 = grid([[0.5, 1, 4.5, 1], [0.5, 3, 4.5, 3]], { arrows: [0, 1] });
const parallelYes2 = grid([[1, 4.5, 3, 0.5], [2.5, 4.5, 4.5, 0.5]]);
const parallelNo1 = grid([[0.5, 4, 4, 0.5], [1, 4.5, 4.5, 2]]);
const parallelNo2 = grid([[1, 0.5, 1, 4.5], [2, 0.5, 4, 4.5]]);
const perpYes1 = grid([[1, 1, 4, 1], [4, 1, 4, 4]], { right: [[4, 1]] });
const perpYes2 = grid([[1, 4, 4, 1], [2, 1, 4.5, 3.5]], { right: [[3, 2]] });
const perpNo1 = grid([[0.5, 4, 2.5, 1], [2.5, 1, 4.5, 4]]);
const perpNo2 = grid([[1, 3, 4, 3.5], [3.5, 0.5, 4, 3.4]]);

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: PQuestion[][] = [
  [
    q(0, "Perhatikan gambar. PQ adalah ….", [pick("PQ adalah", lineKinds, "Sinar garis")], "Gambar PQ punya titik awal P dan anak panah di satu arah, jadi PQ adalah sinar garis.", { fig: { t: "line", kind: "sinar", a: "P", b: "Q" } }),
    q(0, "Berapakah panjang ruas garis MN?", [num("MN", 4.5, "cm")], "Titik M di angka 0 dan titik N di 4 cm lebih 5 garis kecil. 4 cm 5 mm = 4,5 cm.", { fig: { t: "ruler", cm: 4.5, a: "M", b: "N" } }),
    q(0, "Berapa banyak sisi dan sudut yang dimiliki bangun berikut?", [num("Segi lima: banyak sisi", 5), num("Segi lima: banyak sudut", 5), num("Trapesium: banyak sisi", 4), num("Trapesium: banyak sudut", 4)],
      "Segi lima punya 5 sisi dan 5 sudut. Trapesium punya 4 sisi dan 4 sudut. Banyak sisi bangun bersisi lurus sama dengan banyak sudutnya.", { fig: { t: "grid", w: 9, h: 4, segs: [[0.5, 2.2, 1.6, 0.6, "#16a34a"], [1.6, 0.6, 2.9, 1.4, "#16a34a"], [2.9, 1.4, 2.6, 3.5, "#16a34a"], [2.6, 3.5, 0.9, 3.5, "#16a34a"], [0.9, 3.5, 0.5, 2.2, "#16a34a"], [5, 3.5, 6, 1, "#7c3aed"], [6, 1, 7.5, 1, "#7c3aed"], [7.5, 1, 8.5, 3.5, "#7c3aed"], [8.5, 3.5, 5, 3.5, "#7c3aed"]], labels: [[1.6, 2.6, "Segi lima"], [6.8, 2.6, "Trapesium"]] } }),
    q(0, "Gambarlah ruas garis AB sepanjang 6 cm. Tarik titik B sampai panjangnya tepat.", [{ kind: "segment", label: "AB", answer: 6 }], "Mulai dari titik A di angka 0, lalu hentikan titik B tepat di angka 6."),
  ],
  [
    q(1, "Nyatakan besar sudut yang ditunjukkan busur derajat.", [num("∠AOB", 40, "°")], "Kaki OA di garis 0. Kaki OB melewati angka 40 pada skala dalam, jadi ∠AOB = 40°.", { fig: ang(40, ["A", "O", "B"], 0, true) }),
    q(1, "Kelompokkan sudut-sudut berikut menurut jenisnya.", [{ kind: "sort", label: "Sudut", items: [{ name: "120°" }, { name: "90°" }, { name: "70°" }, { name: "180°" }, { name: "200°" }], bins: angleTypes, answer: [2, 1, 0, 3, 4] }],
      "70° kurang dari 90° (lancip), 90° siku-siku, 120° di antara 90° dan 180° (tumpul), 180° lurus, 200° lebih dari 180° (refleks)."),
    q(1, "Gambarlah sudut 60° dengan memutar kaki sudut di atas busur derajat.", [{ kind: "angle", label: "∠AOB", answer: 60 }], "Letakkan OA di garis 0, lalu putar OB sampai angka 60."),
    q(1, "Perhatikan gambar. Tuliskan titik sudut dan kakinya.", [pick("Titik sudut", ["X", "Y", "Z"], "Y"), pick("Kaki sudut", ["YX dan YZ", "XY dan XZ", "ZX dan ZY"], "YX dan YZ")],
      "Kedua garis bertemu di Y, jadi titik sudutnya Y dan kakinya YX dan YZ. Nama sudutnya ∠XYZ.", { fig: ang(35, ["X", "Y", "Z"], 0) }),
  ],
  [
    q(2, "Manakah pasangan garis berikut yang tegak lurus? Pilih semua yang benar.", [{ kind: "check", label: "Pasangan", cards: [{ name: "a", fig: perpYes1 }, { name: "b", fig: perpNo1 }, { name: "c", fig: perpYes2 }, { name: "d", fig: perpNo2 }], answer: [0, 2] }],
      "Pasangan a dan c bertemu membentuk sudut siku-siku. Pasangan b dan d bertemu, tetapi sudutnya tidak siku-siku."),
    q(2, "Manakah pasangan garis berikut yang sejajar? Pilih semua yang benar.", [{ kind: "check", label: "Pasangan", cards: [{ name: "a", fig: parallelNo1 }, { name: "b", fig: parallelYes1 }, { name: "c", fig: parallelNo2 }, { name: "d", fig: parallelYes2 }], answer: [1, 3] }],
      "Pada b dan d, jarak kedua garis di ujung atas dan ujung bawah sama banyak petaknya. Pada a dan c jaraknya berbeda, jadi suatu saat garisnya berpotongan."),
    q(2, "Beri nama pasangan garis sejajar pada bangun ABCD.", [pick("Pasangan sejajar", ["AB // DC", "AB // BC", "AD // BC", "AD // DC"], "AB // DC")],
      "Sisi AB dan DC sama-sama mendatar dan jaraknya selalu 3 petak, jadi AB // DC. AD dan BC miring berbeda arah sehingga tidak sejajar.",
      { fig: grid([[1, 1, 4, 1], [4, 1, 4.5, 4], [4.5, 4, 0.5, 4], [0.5, 4, 1, 1]], { labels: [[0.7, 0.8, "A"], [4.2, 0.8, "B"], [4.6, 4.5, "C"], [0.2, 4.5, "D"]] }) }),
    q(2, "Huruf manakah yang memiliki ruas garis tegak lurus? Pilih semua yang benar.", [{ kind: "check", label: "Huruf", cards: ["L", "V", "H", "A"].map(ch => ({ name: ch, fig: { t: "letter", ch } as Fig })), answer: [0, 2] }],
      "L dan H memiliki ruas garis mendatar dan tegak yang bertemu membentuk sudut siku-siku. V dan A hanya memiliki garis miring."),
  ],
];

/* ---------- Evaluasi 24 soal ---------- */
export const assessment: PQuestion[] = [
  q(0, "Perhatikan gambar. RS adalah ….", [pick("RS adalah", lineKinds, "Garis")], "Gambar RS punya anak panah di kedua ujung, artinya dapat diperpanjang ke dua arah. Jadi RS adalah garis.", { level: "Sedang", fig: { t: "line", kind: "garis", a: "R", b: "S" } }),
  q(1, "Nyatakan besar sudut yang ditunjukkan busur derajat.", [num("∠POQ", 50, "°")], "Kaki OP di garis 0, kaki OQ melewati angka 50. ∠POQ = 50°.", { level: "Sedang", fig: ang(50, ["P", "O", "Q"], 0, true) }),
  q(2, "Manakah pasangan garis berikut yang tegak lurus? Pilih semua yang benar.", [{ kind: "check", label: "Pasangan", cards: [{ name: "a", fig: perpNo2 }, { name: "b", fig: grid([[1, 4, 1, 0.5], [1, 4, 4.5, 4]], { right: [[1, 4]] }) }, { name: "c", fig: perpNo1 }, { name: "d", fig: grid([[0.5, 2.5, 4.5, 2.5], [2.5, 0.5, 2.5, 4.5]], { right: [[2.5, 2.5]] }) }], answer: [1, 3] }],
    "Pada b dan d kedua garis membentuk sudut siku-siku. Pada a dan c sudutnya bukan siku-siku.", { level: "Sedang" }),
  q(0, "Berapakah panjang ruas garis KL?", [num("KL", 7.3, "cm")], "Titik K di angka 0, titik L di 7 cm lebih 3 garis kecil (3 mm). 7 cm 3 mm = 7,3 cm.", { level: "Menantang", fig: { t: "ruler", cm: 7.3, a: "K", b: "L" } }),
  q(2, "Tarik garis yang menghubungkan bangun datar dan ciri-cirinya.", [{ kind: "sort", label: "Bangun", items: [{ name: "Segitiga", fig: { t: "shape", s: "triangle" } }, { name: "Persegi", fig: { t: "shape", s: "square" } }, { name: "Lingkaran", fig: { t: "shape", s: "circle" } }, { name: "Persegi panjang", fig: { t: "shape", s: "rect" } }, { name: "Segi lima", fig: { t: "shape", s: "pentagon" } }],
    bins: ["Tidak memiliki sudut", "3 sudut, 3 sisi", "4 sudut, 4 sisi sama panjang", "4 sudut, 4 sisi", "5 sudut, 5 sisi"], answer: [1, 2, 0, 3, 4] }],
    "Lingkaran dibatasi garis lengkung sehingga tidak memiliki sudut. Persegi memiliki 4 sisi sama panjang, sedangkan persegi panjang memiliki 4 sisi dengan sisi berhadapan sama panjang.", { level: "Sedang" }),
  q(1, "Sebutkan nama sudut berikut beserta titik sudut dan kakinya.", [pick("Nama, titik sudut, dan kaki", ["∠MNO, titik sudut N, kaki NM dan NO", "∠MON, titik sudut O, kaki OM dan ON", "∠OMN, titik sudut M, kaki MO dan MN"], "∠MON, titik sudut O, kaki OM dan ON")],
    "Kedua kaki bertemu di titik O, jadi titik sudut O ditulis di tengah: ∠MON atau ∠NOM, dengan kaki OM dan ON.", { level: "Menantang", fig: ang(115, ["N", "O", "M"], 0) }),
  q(0, "Gambarlah ruas garis CD sepanjang 8 cm.", [{ kind: "segment", label: "CD", answer: 8 }], "Mulai dari titik C di angka 0 dan hentikan titik D tepat di angka 8.", { level: "Sedang" }),
  q(2, "Manakah pasangan garis berikut yang sejajar? Pilih semua yang benar.", [{ kind: "check", label: "Pasangan", cards: [{ name: "a", fig: grid([[0.5, 1, 4.5, 2], [0.5, 3, 4.5, 4]]) }, { name: "b", fig: parallelNo1 }, { name: "c", fig: grid([[1, 0.5, 1, 4.5], [3.5, 0.5, 3.5, 4.5]], { arrows: [0, 1] }) }, { name: "d", fig: grid([[0.5, 1, 4.5, 1.5], [0.5, 3.5, 4.5, 2.5]]) }], answer: [0, 2] }],
    "Pada a, kedua garis naik 1 petak setiap 4 petak dan jaraknya selalu 2 petak, jadi sejajar. Pada c jaraknya selalu 2,5 petak. Pada b dan d jaraknya berubah.", { level: "Menantang" }),
  q(1, "Termasuk jenis sudut apakah sudut ini?", [pick("Jenis sudut", angleTypes, "Sudut tumpul")], "Sudutnya lebih besar dari sudut siku-siku tetapi kurang dari sudut lurus, jadi sudut tumpul.", { level: "Sedang", fig: ang(140, ["A", "O", "B"], 0) }),
  q(0, "Persegi panjang GHIJ digambar di kertas berpetak. Setiap petak 1 cm. Tentukan panjang setiap sisi.", [num("GH", 2, "cm"), num("HI", 5, "cm"), num("IJ", 2, "cm"), num("GJ", 5, "cm")],
    "GH dan IJ masing-masing 2 petak = 2 cm. HI dan GJ masing-masing 5 petak = 5 cm. Sisi yang berhadapan sama panjang.",
    { level: "Menantang", fig: { t: "grid", w: 7, h: 4, segs: [[1, 3, 1, 1], [1, 1, 6, 1], [6, 1, 6, 3], [6, 3, 1, 3]], labels: [[0.6, 3.4, "G"], [0.6, 0.8, "H"], [6.2, 0.8, "I"], [6.2, 3.4, "J"]] } }),
  q(2, "Kertas dilipat dua kali seperti pada kegiatan melipat. Sudut apa yang terbentuk oleh kedua garis lipatan?", [pick("Sudut", ["Sudut lancip", "Sudut siku-siku", "Sudut tumpul"], "Sudut siku-siku")],
    "Lipatan kedua menumpuk lipatan pertama tepat di atasnya, sehingga kedua garis lipatan bertemu membentuk sudut siku-siku dan saling tegak lurus.", { level: "Sedang", fig: grid([[2.5, 0.5, 2.5, 4.5, "#dc2626"], [0.5, 2.5, 4.5, 2.5, "#2563eb"]], { right: [[2.5, 2.5]] }) }),
  q(1, "Gambarlah sudut 135° dengan memutar kaki sudut di atas busur derajat.", [{ kind: "angle", label: "∠AOB", answer: 135 }], "OA di garis 0, lalu putar OB melewati 90° sampai angka 135. Sudut 135° adalah sudut tumpul.", { level: "Menantang" }),
  q(0, "Berapakah panjang ruas garis AB?", [num("AB", 6, "cm")], "Titik A tepat di angka 0 dan titik B di angka 6, jadi AB = 6 cm.", { level: "Sedang", fig: { t: "ruler", cm: 6, a: "A", b: "B" } }),
  q(1, "Kelompokkan sudut-sudut berikut menurut jenisnya.", [{ kind: "sort", label: "Sudut", items: [{ name: "89°" }, { name: "150°" }, { name: "90°" }, { name: "270°" }, { name: "100°" }, { name: "180°" }, { name: "45°" }, { name: "225°" }], bins: angleTypes, answer: [0, 2, 1, 4, 2, 3, 0, 4] }],
    "89° dan 45° lancip (kurang dari 90°). 90° siku-siku. 100° dan 150° tumpul. 180° lurus. 225° dan 270° refleks (lebih dari 180°). Hati-hati: 89° belum siku-siku.", { level: "Menantang" }),
  q(2, "Huruf manakah yang memiliki ruas garis tegak lurus? Pilih semua yang benar.", [{ kind: "check", label: "Huruf", cards: ["M", "T", "E", "K", "A", "I"].map(ch => ({ name: ch, fig: { t: "letter", ch } as Fig })), answer: [1, 2] }],
    "T dan E memiliki garis tegak dan garis mendatar yang bertemu membentuk sudut siku-siku. M, K, dan A memiliki garis miring; I hanya satu ruas garis.", { level: "Menantang" }),
  q(0, "Berapa banyak sisi dan sudut yang dimiliki setiap bangun?", [num("Bangun A: sisi", 3), num("Bangun A: sudut", 3), num("Bangun B: sisi", 6), num("Bangun B: sudut", 6)],
    "Bangun A segitiga: 3 sisi, 3 sudut. Bangun B segi enam: 6 sisi, 6 sudut.", { level: "Menantang", fig: { t: "grid", w: 9, h: 4, segs: [[0.5, 3.5, 2, 0.6, "#dc2626"], [2, 0.6, 3.5, 3.5, "#dc2626"], [3.5, 3.5, 0.5, 3.5, "#dc2626"], [5, 2, 5.8, 0.6, "#2563eb"], [5.8, 0.6, 7.6, 0.6, "#2563eb"], [7.6, 0.6, 8.5, 2, "#2563eb"], [8.5, 2, 7.6, 3.4, "#2563eb"], [7.6, 3.4, 5.8, 3.4, "#2563eb"], [5.8, 3.4, 5, 2, "#2563eb"]], labels: [[1.7, 2.8, "A"], [6.7, 2.2, "B"]] } }),
  q(2, "Perhatikan segitiga ABC. Beri nama pasangan garis yang tegak lurus.", [pick("Pasangan tegak lurus", ["AB ⊥ BC", "AC ⊥ BC", "AB ⊥ AC"], "AC ⊥ BC")],
    "Sudut siku-siku ada di titik C. Jadi sisi AC dan BC yang bertemu di C saling tegak lurus: AC ⊥ BC.",
    { level: "Menantang", fig: grid([[1, 0.5, 1, 4], [1, 4, 4.5, 4], [4.5, 4, 1, 0.5]], { labels: [[0.6, 0.6, "A"], [4.6, 4.5, "B"], [0.6, 4.5, "C"]], right: [[1, 4]] }) }),
  q(1, "Urutkan sudut-sudut berikut dari yang terkecil.", [{ kind: "order", label: "Urutan", cards: [{ name: "a", fig: ang(100, ["A", "O", "B"]) }, { name: "b", fig: ang(25, ["A", "O", "B"]) }, { name: "c", fig: ang(80, ["A", "O", "B"]) }, { name: "d", fig: ang(165, ["A", "O", "B"]) }], answer: [1, 2, 0, 3] }],
    "Bandingkan bukaan kaki sudut: b (25°) paling kecil, lalu c (80°, sedikit kurang dari siku-siku), a (100°, sedikit lebih dari siku-siku), dan d (165°).", { level: "Sangat menantang" }),
  q(0, "Alfa membentuk bangun pada papan paku. Berapa banyak sisi dan sudut setiap bangun?", [num("Bangun hijau: sisi", 5), num("Bangun hijau: sudut", 5), num("Bangun biru: sudut siku-siku", 2)],
    "Bangun hijau dibatasi 5 ruas garis, jadi 5 sisi dan 5 sudut. Bangun biru (trapesium siku-siku) memiliki 2 sudut siku-siku di sisi tegaknya.", { level: "Sangat menantang", fig: { t: "geoboard" } }),
  q(2, "Berapa pasang garis sejajar pada segi enam PQRSTU berikut?", [num("Banyak pasangan sejajar", 3, "pasang")],
    "Segi enam beraturan memiliki 3 pasang sisi berhadapan yang sejajar: PQ // ST, QR // TU, dan RS // UP.",
    { level: "Sangat menantang", fig: grid([[1.5, 0.6, 3.5, 0.6], [3.5, 0.6, 4.5, 2.5], [4.5, 2.5, 3.5, 4.4], [3.5, 4.4, 1.5, 4.4], [1.5, 4.4, 0.5, 2.5], [0.5, 2.5, 1.5, 0.6]], { labels: [[1.3, 0.4, "P"], [3.6, 0.4, "Q"], [4.7, 2.6, "R"], [3.6, 4.9, "S"], [1.2, 4.9, "T"], [0.1, 2.6, "U"]] }) }),
  q(1, "Sudut tumpul ∠AOB besarnya 140°. Berapakah besar sudut refleks pasangannya?", [num("Sudut refleks", 220, "°")], "Sudut refleks = 360° − 140° = 220°.", { level: "Sangat menantang", fig: ang(140, ["A", "O", "B"]) }),
  q(0, "Perhatikan tangram yang dibentuk dari 7 bagian berikut.", [num("Banyak potongan segitiga", 5), num("Banyak potongan bersisi empat", 2), num("Banyak sudut siku-siku pada potongan nomor 5 (persegi)", 4)],
    "Potongan 1, 2, 3, 4, dan 6 berbentuk segitiga (5 potongan). Potongan 5 (persegi) dan 7 (jajargenjang) bersisi empat (2 potongan). Persegi memiliki 4 sudut siku-siku.", { level: "Sangat menantang", fig: { t: "tangram" } }),
  q(2, "Perhatikan hiasan berikut.", [{ kind: "check", label: "Pasangan garis yang sejajar", cards: [{ name: "a dan b" }, { name: "a dan c" }, { name: "d dan e" }, { name: "b dan d" }], answer: [0, 2] },
    pick("Ukuran setiap sudut segi empat putih", ["45°", "90°", "180°"], "90°")],
    "Garis a dan b sama-sama mendatar dan tidak bertemu, begitu juga d dan e yang sama-sama tegak, jadi keduanya sejajar. Segi empat putih adalah persegi, setiap sudutnya siku-siku (90°).", { level: "Sangat menantang", fig: { t: "ornament" } }),
  q(1, "Bangun datar berikut memiliki 2 sudut siku-siku, 1 sudut lancip, dan 1 sudut tumpul.", [pick("Banyak sudut siku-siku", ["1", "2", "3"], "2"), { kind: "cut", label: "Bagi bangun menjadi 4 bagian", answer: 4 }],
    "Bangun trapesium siku-siku ini memiliki 2 sudut siku-siku. Setiap garis potong yang tidak bersilangan menambah 1 bagian, jadi perlu 3 garis potong untuk 4 bagian.", { level: "Sangat menantang" }),
];

/* Papan paku soal 19: dua bangun pada papan 6×6. */
export const geoShapes: { pts: [number, number][]; color: string }[] = [
  { pts: [[0, 1], [2, 0], [4, 1], [3, 4], [1, 4]], color: "#16a34a" },
  { pts: [[0, 0], [3, 0], [5, 4], [0, 4]], color: "#2563eb" },
];
