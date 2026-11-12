import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 7 Bab 5 - Kesebangunan (Buku Matematika SMP/MTs Kelas VII, Kurikulum Merdeka 2022, hlm. 159-184).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Pt = [number, number];

/* ---------- Angka ---------- */
export const num = (s: string) => { const t = s.trim().replace("−", "-").replace(/\./g, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };
export const idn = (n: number) => { const r = Math.round(n * 1e4) / 1e4; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };

/* ---------- Garis sejajar dipotong garis lain ---------- */
export const greek = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ"];
/**
 * Sudut 0-3 di perpotongan atas, 4-7 di perpotongan bawah, urutan: kiri atas, kanan atas, kanan bawah, kiri bawah.
 * Garis potong naik ke kanan dengan sudut `t` terhadap garis sejajar, jadi sudut 1, 3, 5, 7 = t dan 0, 2, 4, 6 = 180 − t.
 */
export const transValue = (t: number, k: number) => (k % 2 ? t : 180 - t);
export const relations: { name: string; pairs: [number, number][]; equal: boolean }[] = [
  { name: "Bertolak belakang", pairs: [[0, 2], [1, 3], [4, 6], [5, 7]], equal: true },
  { name: "Sehadap", pairs: [[0, 4], [1, 5], [2, 6], [3, 7]], equal: true },
  { name: "Dalam berseberangan", pairs: [[3, 5], [2, 4]], equal: true },
  { name: "Luar berseberangan", pairs: [[0, 6], [1, 7]], equal: true },
  { name: "Dalam sepihak", pairs: [[3, 4], [2, 5]], equal: false },
  { name: "Luar sepihak", pairs: [[0, 7], [1, 6]], equal: false },
];
export const relationOf = (a: number, b: number) => relations.find(r => r.pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a)))?.name;

/* ---------- Gambar ---------- */
export type Fig = { pts: Pt[]; labels?: string[]; sides?: (string | null)[]; angles?: (string | null)[]; right?: number[]; extra?: { pts: Pt[]; labels?: (string | null)[] }[]; ticks?: number[] };
export type Scene =
  | { type: "fig"; fig: Fig }
  | { type: "figs"; items: { label: string; fig: Fig }[] }
  | { type: "pairs"; items: { label: string; a: Fig; b: Fig }[] }
  | { type: "trans"; t: number; labels: (string | null)[] }
  | { type: "pictures"; items: { label: string; w: number; h: number }[] }
  | { type: "fractal"; n: number[] }
  | { type: "text"; lines: string[] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; tol?: number }
  /** Mengetuk sudut pada gambar garis sejajar. */
  | { kind: "pickAngle"; label: string; t: number; given: number; answer: number[] }
  | { kind: "select"; label: string; options: string[]; answer: number[]; pictures?: { w: number; h: number }[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type SQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : 1);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [idn(p.value).replace("−", "-").replace(/\./g, "")];
    case "pickAngle": case "select": return [p.answer.join(",")];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
function partCorrect(p: Part, v: string): boolean {
  if (p.kind === "num") { const a = num(v); return !Number.isNaN(a) && Math.abs(a - p.value) <= (p.tol ?? 1e-9); }
  if (p.kind === "pickAngle" || p.kind === "select" || p.kind === "choice") return v === fields(p)[0];
  return cells(p, v).join("|") === fields(p).join("|");
}
function partReady(p: Part, v: string): boolean {
  if (p.kind === "num") return !Number.isNaN(num(v));
  if (p.kind === "pickAngle" || p.kind === "select" || p.kind === "choice") return v.length > 0;
  return cells(p, v).every(Boolean);
}
export const correct = (q: SQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: SQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: SQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "num": return `${p.label} ${Number.isNaN(num(v[i])) ? "…" : idn(num(v[i]))}${p.unit ? ` ${p.unit}` : ""}`;
      case "pickAngle": return `${p.label} ${v[i] ? v[i].split(",").map(k => greek[Number(k)]).join(", ") : "…"}`;
      case "select": return `${p.label} ${v[i] ? v[i].split(",").map(k => p.options[Number(k)]).join(", ") : "…"}`;
      case "classify": return p.rows.map((r, k) => `${r.text}: ${x[k] || "…"}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return `${p.label} ${v[i] || "…"}`;
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: SQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): SQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string): Part => ({ kind: "num", label, value, unit });
const SB = ["Sebangun", "Tidak sebangun"];
/** Segitiga dari panjang sisi a = BC, b = CA, c = AB, diletakkan dengan AB mendatar. */
export function triFromSides(c: number, a: number, b: number): Pt[] {
  const x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(0, b * b - x * x));
  return [[0, 0], [c, 0], [x, -y]];
}
/** Segitiga dari dua sudut (derajat) di ujung alas sepanjang `base`. */
export function triFromAngles(A: number, B: number, base = 6): Pt[] {
  const r = Math.PI / 180, C = 180 - A - B, b = (base * Math.sin(B * r)) / Math.sin(C * r);
  return [[0, 0], [base, 0], [b * Math.cos(A * r), -b * Math.sin(A * r)]];
}
const scaleFig = (pts: Pt[], k: number, dx = 0, rot = 0): Pt[] => pts.map(([x, y]) => { const c = Math.cos(rot), s = Math.sin(rot); return [(x * c - y * s) * k + dx, (x * s + y * c) * k]; });
const square: Pt[] = [[0, 0], [4, 0], [4, 4], [0, 4]];
const arrow: Pt[] = [[0, 1], [5, 1], [5, 0], [7, 2], [5, 4], [5, 3], [0, 3]];
const ell: Pt[] = [[0, 0], [3, 0], [3, 1], [1, 1], [1, 4], [0, 4]];
const cross: Pt[] = [[1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [2, 2], [2, 3], [1, 3], [1, 2], [0, 2], [0, 1], [1, 1]];
export const shapePairs = [
  { label: "a", a: { pts: square }, b: { pts: scaleFig(square, 0.55, 0, 0.35) }, answer: "Sebangun" },
  { label: "b", a: { pts: arrow }, b: { pts: arrow.map(([x, y]): Pt => [x * 1.4, y * 0.6]) }, answer: "Tidak sebangun" },
  { label: "c", a: { pts: ell }, b: { pts: scaleFig(ell, 1.5, 0, Math.PI / 2) }, answer: "Sebangun" },
  { label: "d", a: { pts: cross }, b: { pts: cross.map(([x, y]): Pt => [x * 1.6, y]) }, answer: "Tidak sebangun" },
];
const pairScene: Scene = { type: "pairs", items: shapePairs.map(({ label, a, b }) => ({ label, a, b })) };
const transScene = (t: number, labels: (string | null)[]): Scene => ({ type: "trans", t, labels });
const G = (k: number) => greek[k];
/** Jajargenjang ABCD dengan ∠A tertentu, AB mendatar. */
const para = (A: number, ab = 6, ad = 4): Pt[] => { const r = (A * Math.PI) / 180, d: Pt = [Math.cos(r) * ad, -Math.sin(r) * ad]; return [[0, 0], [ab, 0], [ab + d[0], d[1]], d]; };

/* ---------- Materi: setiap subtopik punya beberapa bagian ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  {
    code: "A", title: "Hubungan Antar Sudut", short: "Hubungan antar sudut",
    sections: [
      {
        title: "Sudut berpenyiku dan berpelurus", lab: "pair",
        steps: [
          "Sudut-sudut berpenyiku jika dijumlahkan membentuk sudut siku-siku (90°). Contoh 40° dan 50°.",
          "Sudut-sudut berpelurus jika dijumlahkan membentuk garis lurus (180°). Contoh 65° dan 115°.",
          "Penyiku sudut x adalah 90° − x, pelurus sudut x adalah 180° − x. Hanya sudut lancip yang mempunyai penyiku.",
          "Dua garis yang berpotongan membentuk empat sudut. Sudut yang berhadapan disebut bertolak belakang dan selalu sama besar, karena keduanya pelurus dari sudut yang sama.",
        ],
        demo: "Putar sinarnya. Lihat besar sudut, penyikunya, dan pelurusnya.",
      },
      {
        title: "Dua garis sejajar dipotong garis lain", lab: "trans",
        steps: [
          "Jika dua garis sejajar dipotong garis ketiga, terbentuk 8 sudut: 4 di setiap perpotongan.",
          "Sehadap: sudut pada posisi yang sama di kedua perpotongan, misalnya sama-sama di kiri atas. Sudut sehadap sama besar.",
          "Dalam berseberangan: di antara dua garis sejajar dan di sisi berlawanan garis potong. Luar berseberangan: di luar kedua garis sejajar dan di sisi berlawanan. Keduanya sama besar.",
          "Dalam sepihak dan luar sepihak: di sisi yang sama garis potong. Pasangan ini tidak sama besar, tetapi berpelurus (jumlahnya 180°).",
          "Jika kedua garis tidak sejajar, hanya sudut bertolak belakang yang tetap sama besar.",
        ],
        example: "Jika satu sudut 65°, setiap sudut lainnya 65° atau 180° − 65° = 115°.",
        demo: "Ubah kemiringan garis potong dan pilih nama hubungan. Pasangan sudutnya diberi warna beserta besarnya.",
      },
      {
        title: "Jumlah sudut segitiga dan segi empat", lab: "triangle",
        steps: [
          "Tarik garis melalui satu titik sudut segitiga yang sejajar dengan sisi di depannya. Dua sudut yang terbentuk sama dengan dua sudut alas (dalam berseberangan).",
          "Ketiga sudut itu membentuk garis lurus, jadi jumlah sudut segitiga selalu 180°.",
          "Segi empat dapat dibagi menjadi dua segitiga oleh diagonalnya, jadi jumlah sudutnya 360°.",
          "Pada jajargenjang yang dibentuk dua pasang garis sejajar, sudut yang berhadapan sama besar dan sudut yang berdekatan berpelurus.",
        ],
        demo: "Atur dua sudut segitiga. Sudut ketiga dihitung dan segitiganya digambar ulang.",
      },
    ],
  },
  {
    code: "B", title: "Arti Kesebangunan", short: "Arti kesebangunan",
    sections: [
      {
        title: "Memperbesar dan memperkecil", lab: "scale",
        steps: [
          "Pas foto 2 × 3 dan 4 × 6 menampilkan gambar yang sama dengan ukuran berbeda. Benda seperti ini disebut sebangun.",
          "Saat diperbesar dengan faktor skala k, setiap panjang sisi dikali k, sedangkan besar sudut tetap.",
          "Keliling juga dikali k, tetapi luas dikali k × k = k². Persegi panjang 6 × 4 diperbesar 3 kali menjadi 18 × 12: keliling 20 menjadi 60, luas 24 menjadi 216.",
          "Faktor skala kurang dari 1 berarti memperkecil, misalnya peta dan maket.",
        ],
        demo: "Atur faktor skala rumah sederhana. Bandingkan sisi, keliling, luas, dan sudutnya dengan gambar awal.",
      },
      {
        title: "Syarat dua bangun sebangun", lab: "resize",
        steps: [
          "Dua bangun sebangun jika sudut-sudut yang bersesuaian sama besar dan sisi-sisi yang bersesuaian sebanding.",
          "Persegi panjang 16 × 12 dan 8 × 6 sebangun karena 16 : 8 = 12 : 6 = 2. Persegi panjang 16 × 12 dan 20 × 12 tidak, karena 20 : 16 ≠ 12 : 12.",
          "Sudut sama saja belum cukup untuk segi empat: semua persegi panjang sudutnya 90°, tetapi tidak semua sebangun.",
          "Sisi sebanding saja juga belum cukup: belah ketupat dan persegi bersisi sama tetapi sudutnya berbeda.",
        ],
        demo: "Ubah panjang dan lebar gambar. Lihat perbandingan sisinya dan apakah gambarnya tetap sebangun.",
      },
      {
        title: "Mengenali bangun yang sebangun", lab: "transform",
        steps: [
          "Bangun yang diputar, dicerminkan, atau digeser tetap sebangun dengan aslinya; hanya posisinya yang berubah.",
          "Bangun yang direntang ke satu arah saja tidak sebangun, karena perbandingan sisinya berubah.",
          "Semua persegi sebangun, semua segitiga sama sisi sebangun, dan semua lingkaran sebangun. Persegi panjang, belah ketupat, dan segitiga sembarang belum tentu.",
          "Fraktal tersusun dari bagian-bagian kecil yang sebangun dengan keseluruhannya.",
        ],
        demo: "Terapkan putar, cermin, perbesar, atau rentang pada bangun. Periksa apakah hasilnya masih sebangun.",
      },
    ],
  },
  {
    code: "C", title: "Kesebangunan pada Segitiga", short: "Segitiga sebangun",
    sections: [
      {
        title: "Penamaan dan pasangan yang bersesuaian", lab: "match",
        steps: [
          "Ruas garis dari titik A ke B ditulis AB, dan panjangnya juga ditulis AB. Sudut di titik A ditulis ∠A atau ∠BAC (huruf titik sudut di tengah).",
          "△ABC sebangun dengan △DEF ditulis △ABC ~ △DEF. Urutan huruf menunjukkan pasangan: ∠A = ∠D, ∠B = ∠E, ∠C = ∠F.",
          "Sisi yang bersesuaian juga mengikuti urutan huruf: AB dengan DE, BC dengan EF, AC dengan DF, sehingga AB/DE = BC/EF = AC/DF.",
          "Sisi terpendek bersesuaian dengan sisi terpendek, sisi terpanjang dengan sisi terpanjang.",
        ],
        demo: "Ketuk sebuah titik atau sisi pada △ABC. Pasangannya pada △DEF ditandai.",
      },
      {
        title: "Syarat dua segitiga sebangun", lab: "angles",
        steps: [
          "Dua segitiga sebangun jika dua pasang sudutnya sama besar. Pasangan ketiga otomatis sama karena jumlah sudut segitiga 180°.",
          "Dua segitiga juga sebangun jika ketiga pasang sisinya sebanding.",
          "Garis yang sejajar dengan salah satu sisi segitiga memotong segitiga kecil yang sebangun: jika DE ∥ BC maka △ADE ~ △ABC, karena ∠A berimpit dan ∠D = ∠B sehadap.",
          "Pada segitiga siku-siku, garis tinggi ke sisi miring membagi segitiga menjadi dua segitiga yang sebangun dengan segitiga semula.",
        ],
        demo: "Atur dua sudut pada segitiga kedua. Segitiganya sebangun jika ketiga sudutnya sama dengan segitiga pertama.",
      },
      {
        title: "Menghitung panjang sisi", lab: "parallel",
        steps: [
          "Tulis pasangan yang bersesuaian, lalu susun perbandingan sisinya.",
          "Pada △ABC dengan DE ∥ BC: AD/AB = DE/BC. Jika AB = 12, AD = 8, dan BC = 15, maka DE = {8/12} × 15 = 10.",
          "Bayangan: tinggi benda dan panjang bayangannya sebanding pada waktu yang sama. Siswa 150 cm berbayangan 100 cm, gedung berbayangan 300 cm, jadi tinggi gedung 450 cm.",
          "Garis bagi sudut A pada △ABC membagi BC dengan perbandingan BD : DC = AB : AC.",
        ],
        demo: "Geser titik D pada AB. Panjang DE dihitung dari perbandingan dan digambar sejajar BC.",
      },
    ],
  },
];

/* ---------- Gambar segitiga untuk soal ---------- */
const tri = (labels: string[], pts: Pt[], extra: Partial<Fig> = {}): Fig => ({ pts, labels, ...extra });
const ABC = (c: number, a: number, b: number, l = ["A", "B", "C"], sides?: (string | null)[]) => tri(l, triFromSides(c, a, b), { sides });
const deParallel = (AB: number, AD: number, BC: number, AC: number): Fig => {
  const pts = triFromSides(AB, BC, AC), k = AD / AB, D: Pt = [pts[0][0] + (pts[1][0] - pts[0][0]) * k, pts[0][1] + (pts[1][1] - pts[0][1]) * k], E: Pt = [pts[0][0] + (pts[2][0] - pts[0][0]) * k, pts[0][1] + (pts[2][1] - pts[0][1]) * k];
  return { pts, labels: ["A", "B", "C"], sides: [null, `${idn(BC)}`, null], extra: [{ pts: [D, E], labels: ["D", "E"] }] };
};
/** Segitiga siku-siku di B dengan garis tinggi BD ke AC. */
const altitude = (AB: number, BC: number): Fig => {
  const B: Pt = [0, 0], A: Pt = [0, -AB], C: Pt = [BC, 0], AC = Math.hypot(AB, BC), t = (AB * AB) / AC, D: Pt = [A[0] + ((C[0] - A[0]) * t) / AC, A[1] + ((C[1] - A[1]) * t) / AC];
  return { pts: [A, B, C], labels: ["A", "B", "C"], sides: [`${AB}`, `${BC}`, null], right: [1], extra: [{ pts: [B, D], labels: [null, "D"] }] };
};
const bisector = (AB: number, AC: number, BC: number): Fig => {
  const [B, C, A] = triFromSides(BC, AC, AB);
  const k = AB / (AB + AC), D: Pt = [B[0] + (C[0] - B[0]) * k, B[1] + (C[1] - B[1]) * k];
  return { pts: [A, B, C], labels: ["A", "B", "C"], sides: [`${AB}`, `${BC}`, `${AC}`], extra: [{ pts: [A, D], labels: [null, "D"] }] };
};

/* ---------- Latihan ---------- */
export const practice: SQuestion[][] = [
  [
    q(0, "Tentukan penyiku dan pelurus sudut-sudut berikut.", [n("Penyiku 25° =", 65, "°"), n("Pelurus 110° =", 70, "°")], "90° − 25° = 65°. 180° − 110° = 70°."),
    q(0, "Pada △DEF diketahui ∠D = 55° dan ∠E = 50°. Tentukan besar sudut ketiga.", [n("∠F =", 75, "°")], "180° − 55° − 50° = 75°.",
      { scene: { type: "fig", fig: tri(["D", "E", "F"], triFromAngles(55, 50), { angles: ["55°", "50°", "?"] }) } }),
    q(0, `Dua garis sejajar dipotong garis lain. Diketahui ${G(1)} = 70°. Tentukan besar sudut lainnya.`, [n(`${G(3)} =`, 70, "°"), n(`${G(4)} =`, 110, "°"), n(`${G(6)} =`, 110, "°")],
      `${G(3)} bertolak belakang dengan ${G(1)}: 70°. ${G(4)} sehadap dengan ${G(0)} = 180° − 70° = 110°. ${G(6)} bertolak belakang dengan ${G(4)}: 110°.`,
      { scene: transScene(70, greek.map((g, k) => (k === 1 ? `${g} = 70°` : g))) }),
    q(0, "Dua pasang garis sejajar membentuk segi empat ABCD dengan ∠A = 130°. Tentukan sudut-sudut lainnya.", [n("∠B =", 50, "°"), n("∠C =", 130, "°"), n("∠D =", 50, "°")],
      "Sudut yang berdekatan pada dua garis sejajar adalah dalam sepihak, jumlahnya 180°: ∠B = ∠D = 50°. ∠C berhadapan dengan ∠A: 130°. ABCD adalah jajargenjang.",
      { scene: { type: "fig", fig: { pts: para(130), labels: ["A", "B", "C", "D"], angles: ["130°", "?", "?", "?"] } } }),
  ],
  [
    q(1, "Tentukan apakah setiap pasangan bangun sebangun.", [{ kind: "classify", options: SB, rows: [{ text: "Persegi 3 cm dan persegi 7 cm", answer: "Sebangun" }, { text: "Persegi panjang 2 × 3 dan 3 × 4", answer: "Tidak sebangun" }, { text: "Persegi panjang 4 × 6 dan 6 × 9", answer: "Sebangun" }] }],
      "Semua persegi sebangun. 2 : 3 ≠ 3 : 4. 4 : 6 = 6 : 9 = 2 : 3."),
    q(1, "Gambar asli berukuran 12 cm × 9 cm. Ketuk semua gambar hasil perubahan ukuran yang sebangun dengan gambar asli.", [{ kind: "select", label: "Sebangun dengan asli", options: ["8 cm × 6 cm", "6 cm × 8 cm", "16 cm × 12 cm", "15 cm × 9 cm"], answer: [0, 2], pictures: [{ w: 8, h: 6 }, { w: 6, h: 8 }, { w: 16, h: 12 }, { w: 15, h: 9 }] }],
      "Lebar : tinggi asli 12 : 9 = 4 : 3. 8 : 6 dan 16 : 12 juga 4 : 3. Pada 6 × 8 pemandangannya ditekan menjadi lebih ramping (3 : 4), dan 15 : 9 = 5 : 3 lebih melebar, jadi isi gambarnya berubah bentuk.",
      { scene: { type: "pictures", items: [{ label: "Gambar asli", w: 12, h: 9 }] } }),
    q(1, "Persegi panjang 5 cm × 2 cm diperbesar dengan faktor skala 3.", [n("Panjang baru:", 15, "cm"), n("Keliling baru:", 42, "cm"), n("Luas baru:", 90, "cm²")],
      "15 × 6. Keliling 2(15 + 6) = 42, yaitu 3 × 14. Luas 90, yaitu 9 × 10."),
    q(1, "Tentukan benar atau salah.", [{ kind: "tf", statements: [{ text: "Semua segitiga sama sisi sebangun.", answer: true }, { text: "Semua belah ketupat sebangun.", answer: false }, { text: "Bangun yang diputar tetap sebangun dengan aslinya.", answer: true }] }],
      "Sudut segitiga sama sisi selalu 60°. Belah ketupat dapat berbeda sudutnya. Memutar tidak mengubah ukuran sisi dan sudut."),
  ],
  [
    q(2, "△ABC ~ △DEF dengan AB = 4 cm, BC = 6 cm, dan DE = 6 cm. Tentukan EF.", [n("EF =", 9, "cm")], "DE/AB = 6/4 = 1,5. EF = 1,5 × 6 = 9 cm.",
      { scene: { type: "figs", items: [{ label: "△ABC", fig: ABC(4, 6, 5, ["A", "B", "C"], ["4", "6", null]) }, { label: "△DEF", fig: ABC(6, 9, 7.5, ["D", "E", "F"], ["6", "?", null]) }] } }),
    q(2, "Pada △ABC, DE sejajar BC dengan AB = 10 cm, AD = 4 cm, dan BC = 15 cm. Tentukan DE.", [n("DE =", 6, "cm")], "△ADE ~ △ABC. DE = {4/10} × 15 = 6 cm.",
      { scene: { type: "fig", fig: deParallel(10, 4, 15, 13) } }),
    q(2, "Seorang siswa setinggi 150 cm berbayangan 100 cm. Pada saat yang sama bayangan sebuah tiang 300 cm. Berapa tinggi tiang?", [n("Tinggi tiang:", 450, "cm")], "150 : 100 = tinggi : 300, jadi tinggi = 1,5 × 300 = 450 cm."),
    q(2, "Pada △ABC, titik D pada AB dan E pada AC dengan DE sejajar BC, sehingga △ABC ~ △ADE.", [{ kind: "choice", label: "∠B = ∠…", options: ["D", "E", "A"], answer: "D" }, { kind: "choice", label: "∠A pada kedua segitiga adalah sudut", options: ["Berimpit", "Sehadap", "Berpelurus"], answer: "Berimpit" }],
      "Urutan △ABC ~ △ADE: B dengan D. ∠A dimiliki kedua segitiga (berimpit), dan ∠B = ∠D karena sehadap.", { scene: { type: "fig", fig: deParallel(9, 5, 8, 7) } }),
  ],
];

/* ---------- Evaluasi: 24 soal, A, B, C bergantian ---------- */
const photos = [{ w: 16, h: 12 }, { w: 12, h: 9 }, { w: 9, h: 16 }, { w: 20, h: 12 }, { w: 8, h: 6 }];
export const assessment: SQuestion[] = [
  // Sedang (1-8)
  q(0, "Sebuah sudut besarnya 38°. Tentukan penyiku dan pelurusnya.", [n("Penyiku:", 52, "°"), n("Pelurus:", 142, "°")], "90° − 38° = 52°. 180° − 38° = 142°.", { level: "Sedang" }),
  q(1, "Untuk setiap pasangan gambar, tentukan apakah sebangun atau tidak.", [{ kind: "classify", options: SB, rows: shapePairs.map(p => ({ text: `Pasangan ${p.label}`, answer: p.answer })) }],
    "a: persegi diperkecil dan diputar, sebangun. b: panah direntang mendatar dan dipendekkan tegak, tidak sebangun. c: huruf L diperbesar 1,5 kali dan diputar, sebangun. d: tanda tambah hanya diperlebar, tidak sebangun.", { level: "Sedang", scene: pairScene }),
  q(2, "△ABC ~ △DEF dengan AB = 6 cm, BC = 8 cm, AC = 7 cm, dan DE = 9 cm. Tentukan EF dan DF.", [n("EF =", 12, "cm"), n("DF =", 10.5, "cm")],
    "Faktor skala DE/AB = 9/6 = 1,5. EF = 1,5 × 8 = 12 cm, DF = 1,5 × 7 = 10,5 cm.",
    { level: "Sedang", scene: { type: "figs", items: [{ label: "△ABC", fig: ABC(6, 8, 7, ["A", "B", "C"], ["6", "8", "7"]) }, { label: "△DEF", fig: ABC(9, 12, 10.5, ["D", "E", "F"], ["9", "?", "?"]) }] } }),
  q(0, `Dua garis sejajar dipotong garis lain dan ${G(1)} = 65°. Tentukan besar sudut berikut.`, [n(`${G(0)} =`, 115, "°"), n(`${G(2)} =`, 115, "°"), n(`${G(5)} =`, 65, "°"), n(`${G(7)} =`, 65, "°")],
    `${G(0)} berpelurus dengan ${G(1)}: 115°. ${G(2)} bertolak belakang dengan ${G(0)}: 115°. ${G(5)} sehadap dengan ${G(1)}: 65°. ${G(7)} luar berseberangan dengan ${G(1)}: 65°.`,
    { level: "Sedang", scene: transScene(65, greek.map((g, k) => (k === 1 ? `${g} = 65°` : g))) }),
  q(1, "Kinan mengubah ukuran gambar berukuran 16 cm × 12 cm. Ketuk semua hasil yang sebangun dengan gambar asli.", [{ kind: "select", label: "Sebangun dengan asli", options: photos.slice(1).map(p => `${p.w} cm × ${p.h} cm`), answer: [0, 3], pictures: photos.slice(1) }],
    "Lebar : tinggi asli 16 : 12 = 4 : 3. 12 : 9 dan 8 : 6 juga 4 : 3. Pada 9 × 16 pemandangannya ditekan menjadi ramping, dan pada 20 : 12 = 5 : 3 melebar, jadi isi gambarnya berubah bentuk.",
    { level: "Sedang", scene: { type: "pictures", items: [{ label: "Gambar asli", w: 16, h: 12 }] } }),
  q(2, "Seorang siswa setinggi 160 cm berbayangan 120 cm. Pada saat yang sama, bayangan sebuah gedung 450 cm. Tentukan tinggi gedung.", [n("Tinggi gedung:", 600, "cm")],
    "Tinggi dan bayangan sebanding: 160 : 120 = tinggi : 450. Tinggi = {160/120} × 450 = 600 cm.", { level: "Sedang" }),
  q(0, "Pada △PQR diketahui ∠P = 55° dan ∠Q = 48°. Tentukan ∠R.", [n("∠R =", 77, "°")], "Jumlah sudut segitiga 180°: 180° − 55° − 48° = 77°.",
    { level: "Sedang", scene: { type: "fig", fig: tri(["P", "Q", "R"], triFromAngles(55, 48), { angles: ["55°", "48°", "?"] }) } }),
  q(1, "Gambar rumah selebar 4 cm dan setinggi 3 cm diperbesar sehingga lebarnya 10 cm.", [n("Faktor skala:", 2.5), n("Tinggi baru:", 7.5, "cm")], "10 : 4 = 2,5. Tinggi 3 × 2,5 = 7,5 cm.", { level: "Sedang" }),
  // Menantang (9-17)
  q(2, "Diketahui △PQR ~ △KLM.", [{ kind: "choice", label: "∠Q = ∠…", options: ["K", "L", "M"], answer: "L" }, { kind: "choice", label: "PR/KM = QR/…", options: ["KL", "LM", "KM"], answer: "LM" }, { kind: "tf", statements: [{ text: "PQ/KL = QR/LM", answer: true }, { text: "∠R = ∠K", answer: false }] }],
    "Urutan huruf menunjukkan pasangan: P–K, Q–L, R–M. Jadi ∠Q = ∠L, PR bersesuaian dengan KM, QR dengan LM, dan ∠R = ∠M.", { level: "Menantang" }),
  q(0, `Dua garis sejajar dipotong garis lain. Ketuk semua sudut lain yang sama besar dengan ${G(0)}.`, [{ kind: "pickAngle", label: `Sama besar dengan ${G(0)}:`, t: 58, given: 0, answer: [2, 4, 6] }],
    `${G(2)} bertolak belakang, ${G(4)} sehadap, dan ${G(6)} luar berseberangan dengan ${G(0)}. Sudut lainnya pelurus ${G(0)}.`, { level: "Menantang" }),
  q(1, "Persegi panjang 6 cm × 4 cm diperbesar dengan faktor skala 3.", [n("Keliling baru:", 60, "cm"), n("Luas baru:", 216, "cm²"), { kind: "tf", statements: [{ text: "Luasnya menjadi 3 kali luas semula.", answer: false }, { text: "Besar setiap sudutnya tetap 90°.", answer: true }] }],
    "Sisi baru 18 × 12. Keliling 60 = 3 × 20. Luas 216 = 9 × 24, bukan 3 kali. Sudut tidak berubah.", { level: "Menantang" }),
  q(2, "Pada △ABC, DE sejajar BC dengan AB = 12 cm, AD = 8 cm, BC = 15 cm, dan AC = 9 cm.", [n("DE =", 10, "cm"), n("AE =", 6, "cm")],
    "△ADE ~ △ABC dengan perbandingan AD/AB = {8/12} = {2/3}. DE = {2/3} × 15 = 10 cm, AE = {2/3} × 9 = 6 cm.", { level: "Menantang", scene: { type: "fig", fig: deParallel(12, 8, 15, 9) } }),
  q(0, "Tentukan nama hubungan setiap pasangan sudut.", [{ kind: "classify", options: relations.map(r => r.name), rows: [[0, 4], [3, 5], [1, 7], [2, 5]].map(([a, b]) => ({ text: `${G(a)} dan ${G(b)}`, answer: relationOf(a, b)! })) }],
    `${G(0)} dan ${G(4)} sehadap. ${G(3)} dan ${G(5)} dalam berseberangan. ${G(1)} dan ${G(7)} luar berseberangan. ${G(2)} dan ${G(5)} dalam sepihak.`,
    { level: "Menantang", scene: transScene(60, greek) }),
  q(1, "Tentukan apakah setiap pasangan ukuran pas foto sebangun.", [{ kind: "classify", options: SB, rows: [{ text: "2 × 3 dan 4 × 6", answer: "Sebangun" }, { text: "3 × 4 dan 4 × 6", answer: "Tidak sebangun" }, { text: "3 × 4 dan 6 × 8", answer: "Sebangun" }, { text: "4 × 6 dan 6 × 8", answer: "Tidak sebangun" }] }],
    "2 : 3 = 4 : 6. 3 : 4 ≠ 4 : 6. 3 : 4 = 6 : 8. 4 : 6 ≠ 6 : 8.", { level: "Menantang" }),
  q(2, "Dua sudut setiap segitiga diketahui. Tentukan apakah pasangan segitiga sebangun.", [{ kind: "classify", options: SB, rows: [
    { text: "50°, 60° dan 70°, 50°", answer: "Sebangun" }, { text: "40°, 75° dan 40°, 70°", answer: "Tidak sebangun" }, { text: "90°, 35° dan 55°, 90°", answer: "Sebangun" }, { text: "30°, 30° dan 30°, 120°", answer: "Sebangun" },
  ] }], "Lengkapi sudut ketiga: 50, 60, 70 dan 70, 50, 60 sama. 40, 75, 65 dan 40, 70, 70 berbeda. 90, 35, 55 dan 55, 90, 35 sama. 30, 30, 120 dan 30, 120, 30 sama.", { level: "Menantang" }),
  q(0, "Dua pasang garis sejajar membentuk segi empat ABCD dengan ∠A = 125°.", [n("∠B =", 55, "°"), n("∠C =", 125, "°"), n("∠D =", 55, "°"), { kind: "choice", label: "ABCD adalah", options: ["Trapesium", "Jajargenjang", "Layang-layang"], answer: "Jajargenjang" }],
    "∠A dan ∠B dalam sepihak: 180° − 125° = 55°. Sudut berhadapan sama: ∠C = 125°, ∠D = 55°. Dua pasang sisi sejajar berarti jajargenjang.",
    { level: "Menantang", scene: { type: "fig", fig: { pts: para(125), labels: ["A", "B", "C", "D"], angles: ["125°", "?", "?", "?"] } } }),
  q(1, "Tentukan benar atau salah.", [{ kind: "tf", statements: [{ text: "Semua persegi sebangun.", answer: true }, { text: "Semua persegi panjang sebangun.", answer: false }, { text: "Dua bangun yang sebangun selalu sama ukurannya.", answer: false }, { text: "Semua lingkaran sebangun.", answer: true }] }],
    "Persegi dan lingkaran hanya berbeda ukuran. Persegi panjang dapat berbeda perbandingan sisinya. Bangun sebangun boleh berbeda ukuran.", { level: "Menantang" }),
  // Sangat menantang (18-24)
  q(2, "Pada △ABC siku-siku di B, AB = 8 cm dan BC = 6 cm. BD adalah garis tinggi ke AC.", [n("AC =", 10, "cm"), n("Luas △ABC:", 24, "cm²"), n("BD =", 4.8, "cm"), n("DC =", 3.6, "cm")],
    "AC = √(8² + 6²) = 10. Luas {1/2} × 8 × 6 = 24. Luas juga {1/2} × AC × BD, jadi BD = 48 : 10 = 4,8. △BDC ~ △ABC sehingga DC/BC = BC/AC: DC = 36 : 10 = 3,6.",
    { level: "Sangat menantang", scene: { type: "fig", fig: altitude(8, 6) } }),
  q(0, "Dua garis sejajar dipotong garis lain. Dua sudut dalam sepihak besarnya (2x + 10)° dan (3x − 5)°.", [n("x =", 35), n("Sudut pertama:", 80, "°"), n("Sudut kedua:", 100, "°")],
    "Dalam sepihak berpelurus: 2x + 10 + 3x − 5 = 180, jadi 5x + 5 = 180 dan x = 35. Sudutnya 80° dan 100°.", { level: "Sangat menantang" }),
  q(1, "Maket rumah adat dibuat dengan skala 1 : 50.", [n("Tinggi maket 24 cm, tinggi sebenarnya:", 12, "m"), n("Pintu setinggi 2 m, pada maket:", 4, "cm"), n("Lantai maket 30 cm × 20 cm, luas lantai sebenarnya:", 150, "m²")],
    "24 × 50 = 1.200 cm = 12 m. 200 : 50 = 4 cm. Lantai sebenarnya 15 m × 10 m = 150 m² (luas dikali 50² = 2.500).", { level: "Sangat menantang" }),
  q(2, "Pada △ABC, AD membagi ∠A menjadi dua sama besar dengan D pada BC. AB = 12 cm, AC = 8 cm, dan BC = 15 cm.", [n("BD =", 9, "cm"), n("DC =", 6, "cm")],
    "Garis bagi membagi BC dengan perbandingan BD : DC = AB : AC = 12 : 8 = 3 : 2. BD = {3/5} × 15 = 9 cm, DC = 6 cm.", { level: "Sangat menantang", scene: { type: "fig", fig: bisector(12, 8, 15) } }),
  q(0, "Sudut-sudut sebuah segitiga berbanding ∠A : ∠B : ∠C = 1 : 2 : 3.", [n("∠A =", 30, "°"), n("∠B =", 60, "°"), n("∠C =", 90, "°"), { kind: "choice", label: "Jenis segitiga", options: ["Lancip", "Siku-siku", "Tumpul"], answer: "Siku-siku" }],
    "x + 2x + 3x = 180, jadi x = 30. Sudutnya 30°, 60°, 90°: segitiga siku-siku.", { level: "Sangat menantang" }),
  q(1, "Fraktal segitiga: pada setiap langkah, setiap segitiga diganti tiga segitiga sebangun yang sisinya setengah.", [n("Banyak segitiga pada n = 3:", 27), n("Faktor skala sisi segitiga terkecil pada n = 3 terhadap segitiga awal:", 0.125)],
    "Banyak segitiga 3, 9, 27 untuk n = 1, 2, 3. Sisinya {1/2}, {1/4}, {1/8} = 0,125 dari sisi awal.", { level: "Sangat menantang", scene: { type: "fractal", n: [0, 1, 2, 3] } }),
  q(2, "Diketahui △DEF ~ △ABC dengan DE = 4 cm, EF = 5 cm, dan BC = 12,5 cm.", [n("Faktor skala:", 2.5), n("AB =", 10, "cm"), { kind: "choice", label: "Sudut yang sama dengan ∠F", options: ["∠A", "∠B", "∠C"], answer: "∠C" }],
    "EF bersesuaian dengan BC: 12,5 : 5 = 2,5. AB bersesuaian dengan DE: 2,5 × 4 = 10 cm. F bersesuaian dengan C.",
    { level: "Sangat menantang", scene: { type: "figs", items: [{ label: "△DEF", fig: ABC(4, 5, 6, ["D", "E", "F"], ["4", "5", null]) }, { label: "△ABC", fig: ABC(10, 12.5, 15, ["A", "B", "C"], ["?", "12,5", null]) }] } }),
];

/** Sumber data untuk pemeriksaan kunci jawaban. */
export const sources = { shapePairs, photos };
