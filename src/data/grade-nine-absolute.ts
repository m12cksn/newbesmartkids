/**
 * Kelas 9 Bab 5 - Persamaan dan Pertidaksamaan Nilai Mutlak Linear Satu Variabel
 * (sumber: Buku Siswa Matematika Kelas X, Bab 1, hlm. 9-40; ditempatkan di Kelas 9 atas permintaan pemilik).
 * A. Konsep nilai mutlak (1.1)  B. Persamaan nilai mutlak linear satu variabel (1.2)  C. Pertidaksamaan (1.3).
 * Bentuk jawaban mengikuti buku: menentukan nilai mutlak, menulis bentuk tanpa tanda mutlak per daerah
 * (Latihan 1.1-1.2), himpunan penyelesaian persamaan (termasuk "tidak ada penyelesaian"), melengkapi tabel
 * titik grafik (Tabel 1.4), memilih sketsa grafik, benar/salah dengan alasan (Uji Kompetensi), dan interval
 * penyelesaian pertidaksamaan yang digambar pada garis bilangan.
 */
import type { Question } from "./grade-four-whole-numbers";

/** Angka dari isian siswa: −4, 2/3, 1,5. */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  const f = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t);
  if (f) { const a = num(f[1]), b = num(f[2]); return b === 0 ? NaN : a / b; }
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Gambar ---------- */
export type Fn = { a: number; b: number; s?: number; c?: number; label: string; color?: string }; // y = s|ax + b| + c
export type Shade = { shape: Shape; a?: number; b?: number; closed?: boolean };
export type Scene =
  | { type: "line"; min: number; max: number; arrows?: { from: number; to: number; label?: string }[]; marks?: { x: number; label?: string }[]; shade?: Shade; caption?: string }
  | { type: "graph"; fns: Fn[]; hline?: { y: number; label: string }; xmin: number; xmax: number; ymin: number; ymax: number; points?: [number, number][] }
  | { type: "table"; head: string[]; rows: (string | number)[][]; caption?: string }
  | { type: "card"; title: string; lines: string[] };

/* ---------- Bentuk jawaban ---------- */
export type Shape = "antara" | "luar" | "kiri" | "kanan" | "semua" | "kosong";
export const SHAPES: { id: Shape; label: string }[] = [
  { id: "antara", label: "Di antara dua bilangan" }, { id: "luar", label: "Di luar dua bilangan" },
  { id: "kiri", label: "Kurang dari satu bilangan" }, { id: "kanan", label: "Lebih dari satu bilangan" },
  { id: "semua", label: "Semua bilangan real" }, { id: "kosong", label: "Tidak ada penyelesaian" },
];
export const twoEnds = (s: string) => s === "antara" || s === "luar";
export const oneEnd = (s: string) => s === "kiri" || s === "kanan";

export type Part =
  | { kind: "num"; label: string; value: number; unit?: string }
  | { kind: "solset"; label: string; values: number[]; f: (x: number) => number }
  | { kind: "piece"; expr: string; a1: number; b1: number; t: number; a2: number; b2: number }
  | { kind: "interval"; label: string; shape: Shape; a?: number; b?: number; closed?: boolean; test: (x: number) => boolean }
  | { kind: "tbl"; label: string; xs: number[]; ys: number[] }
  | { kind: "choice"; label: string; options: string[]; answer: string; pics?: Scene[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] };

export type PQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const NONE = "∅";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "piece" ? 5 : p.kind === "tbl" ? p.xs.length : p.kind === "interval" ? 4 : 1);
export const cells = (p: Part, v: string) => { if (fieldCount(p) === 1) return [v ?? ""]; const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => { const g = (a: number, b: number): number => (b ? g(b, a % b) : a); for (const d of [1, 2, 3, 4, 5, 6, 8]) { const k = n * d; if (Math.abs(k - Math.round(k)) < 1e-9) { if (d === 1) return idn(n).replace(/\./g, ""); const p = Math.round(k), c = g(Math.abs(p), d); return `${p / c}/${d / c}`; } } return idn(n).replace(/\./g, ""); };
export const fmt = (n: number) => { const s = str(n).replace("-", "−"); const f = /^(−?)(\d+)\/(\d+)$/.exec(s); return f ? `${f[1]}{${f[2]}/${f[3]}}` : s; };
export const solList = (v: string) => (v.trim() === NONE ? [] : v.split(/;|atau/).map(s => s.trim()).filter(Boolean));
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "solset": return [p.values.length ? p.values.map(str).join("; ") : NONE];
    case "piece": return [p.a1, p.b1, p.t, p.a2, p.b2].map(str);
    case "interval": return [p.shape, p.a !== undefined ? str(p.a) : "", p.b !== undefined ? str(p.b) : "", twoEnds(p.shape) || oneEnd(p.shape) ? (p.closed ? "tutup" : "buka") : ""];
    case "tbl": return p.ys.map(str);
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
  }
}
const near = (a: number, b: number) => !Number.isNaN(a) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return near(num(v), p.value);
    case "solset": {
      if (!p.values.length) return v.trim() === NONE;
      const got = [...new Set(solList(v).map(num))];
      return got.length === p.values.length && !got.some(Number.isNaN) && p.values.every(t => got.some(g => near(g, t)));
    }
    case "piece": return [p.a1, p.b1, p.t, p.a2, p.b2].every((t, k) => near(num(x[k]), t));
    case "interval": {
      if (x[0] !== p.shape) return false;
      if (twoEnds(p.shape)) return near(num(x[1]), p.a!) && near(num(x[2]), p.b!) && x[3] === (p.closed ? "tutup" : "buka");
      if (oneEnd(p.shape)) return near(num(x[1]), p.a!) && x[3] === (p.closed ? "tutup" : "buka");
      return true;
    }
    case "tbl": return p.ys.every((t, k) => near(num(x[k]), t));
    default: return x.join("|") === fields(p).join("|");
  }
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "interval") return x[0] !== "" && (!twoEnds(x[0]) || (x[1] !== "" && x[2] !== "" && x[3] !== "")) && (!oneEnd(x[0]) || (x[1] !== "" && x[3] !== ""));
  if (p.kind === "classify" || p.kind === "tf" || p.kind === "piece" || p.kind === "tbl") return x.every(c => c.trim() !== "");
  return v.trim() !== "";
}
export const correct = (q: PQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: PQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/√\{([^}]*)\}/g, "√$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2").replace(/[{}]/g, "");
const rel = (closed: boolean | undefined, left: boolean) => (closed ? (left ? "≤" : "≥") : left ? "<" : ">");
export function intervalText(shape: string, a: string, b: string, closed: boolean) {
  const L = closed ? "≤" : "<";
  switch (shape) {
    case "antara": return `${a} ${L} x ${L} ${b}`;
    case "luar": return `x ${rel(closed, true)} ${a} atau x ${rel(closed, false)} ${b}`;
    case "kiri": return `x ${rel(closed, true)} ${a}`;
    case "kanan": return `x ${rel(closed, false)} ${a}`;
    case "semua": return "semua bilangan real";
    case "kosong": return "tidak ada penyelesaian";
    default: return "…";
  }
}
export function formatAnswer(q: PQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "solset": return `${plain(p.label)} ${v[i] === NONE ? "tidak ada penyelesaian" : v[i] || "…"}`;
      case "piece": return `${plain(p.expr)} = ${x[0]}x + (${x[1]}) jika x ≥ ${x[2]}; ${x[3]}x + (${x[4]}) jika x < ${x[2]}`;
      case "interval": return `${plain(p.label)} ${intervalText(x[0], x[1], x[2], x[3] === "tutup")}`;
      case "tbl": return `${plain(p.label)} ${p.xs.map((t, k) => `x = ${idn(t)} → ${x[k]}`).join(", ")}`;
      case "choice": return `${plain(p.label)} ${plain(v[i]) || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: number, prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): PQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string): Part => ({ kind: "num", label, value, unit });
const abs = Math.abs;
/** Himpunan penyelesaian f(x) = 0. */
const sol = (label: string, values: number[], f: (x: number) => number): Part => ({ kind: "solset", label, values, f });
const piece = (expr: string, a: number, b: number): Part => { const t = -b / a; return a > 0 ? { kind: "piece", expr, a1: a, b1: b, t, a2: -a, b2: -b } : { kind: "piece", expr, a1: -a, b1: -b, t, a2: a, b2: b }; };
const iv = (label: string, shape: Shape, test: (x: number) => boolean, a?: number, b?: number, closed?: boolean): Part => ({ kind: "interval", label, shape, a, b, closed, test });
const tbl = (label: string, xs: number[], f: (x: number) => number): Part => ({ kind: "tbl", label, xs, ys: xs.map(f) });
const ch = (label: string, options: string[], answer: string, pics?: Scene[]): Part => ({ kind: "choice", label, options, answer, pics });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const COUNT = ["Tidak ada", "Tepat satu", "Dua"];
const V = (a: number, b: number, label: string, s = 1, c = 0, color?: string): Fn => ({ a, b, s, c, label, color });
const graph = (fns: Fn[], xmin = -6, xmax = 6, ymin = -1, ymax = 8, extra: Partial<Extract<Scene, { type: "graph" }>> = {}): Scene => ({ type: "graph", fns, xmin, xmax, ymin, ymax, ...extra });

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Konsep Nilai Mutlak", sections: [
    { title: "Nilai mutlak sebagai jarak", lab: "jarak", steps: [
      "Nilai mutlak suatu bilangan adalah jarak bilangan itu dari 0 pada garis bilangan. Nilai mutlak x ditulis |x| dan dibaca \"nilai mutlak x\".",
      "Jarak tidak pernah negatif. Karena itu |5| = 5 dan |−5| = 5: keduanya berjarak 5 satuan dari 0, hanya arahnya yang berbeda.",
      "Nilai mutlak hanya melihat besarnya, bukan arahnya. Aba-aba pramuka \"maju 4 langkah\" dan \"mundur 4 langkah\" sama-sama memindahkan barisan sejauh 4 langkah.",
      "Posisi akhir dihitung dengan menjumlahkan bilangan bertanda (maju positif, mundur negatif). Banyak langkah yang ditempuh dihitung dengan menjumlahkan nilai mutlaknya.",
      "Jarak antara dua bilangan a dan b pada garis bilangan adalah |a − b|. Misalnya jarak −3 ke 4 adalah |−3 − 4| = |−7| = 7.",
      "|0| = 0. Selain 0, nilai mutlak setiap bilangan real selalu positif, termasuk pecahan: |−{5/2}| = {5/2}.",
    ], life: "Lift sebuah gedung naik 6 lantai, lalu turun 9 lantai. Posisi akhirnya 3 lantai di bawah lantai awal, karena 6 + (−9) = −3. Namun lift sudah berpindah sejauh |6| + |−9| = 15 lantai, dan pemakaian listriknya dihitung dari jarak tempuh itu, bukan dari posisi akhir. Begitu pula ongkos ojek: dihitung dari jarak yang ditempuh, walaupun kamu kembali ke tempat semula.",
      example: "Rani bermain lompat-lompatan: maju 3 langkah, mundur 5 langkah, maju 4 langkah, lalu mundur 1 langkah. Tentukan posisi akhir Rani dan banyak langkah yang ia tempuh.",
      work: ["Maju ditulis positif, mundur ditulis negatif: 3, −5, 4, −1.", "Posisi akhir: 3 + (−5) + 4 + (−1) = 1, yaitu 1 langkah di depan posisi awal.", "Banyak langkah: |3| + |−5| + |4| + |−1| = 3 + 5 + 4 + 1 = 13 langkah.", "Posisi akhir menjawab \"di mana\", banyak langkah menjawab \"seberapa jauh\"."],
      notes: ["Jangan menukar posisi akhir dengan jarak tempuh; keduanya hanya sama jika semua langkah searah.", "|−a| = |a| untuk setiap bilangan a.", "Tanda panah ke kanan pada garis bilangan menunjukkan bilangan positif, ke kiri menunjukkan bilangan negatif; panjang panahnya adalah nilai mutlaknya."],
      demo: "Tambahkan langkah maju atau mundur. Garis bilangan menunjukkan posisi akhir dan banyak langkah yang ditempuh." },
    { title: "Definisi dan bentuk tanpa tanda mutlak", lab: "definisi", steps: [
      "Definisi 1.1: untuk x bilangan real, |x| = x jika x ≥ 0, dan |x| = −x jika x < 0.",
      "Pada bilangan negatif, −x justru positif. Contoh: |−3| = −(−3) = 3.",
      "Untuk bentuk linear ax + b, titik batasnya adalah nilai x yang membuat ax + b = 0, yaitu x = −{b/a}. Di satu sisi titik batas, isi tanda mutlak bernilai positif; di sisi lain bernilai negatif.",
      "Contoh: |x − 3| = x − 3 jika x ≥ 3, dan |x − 3| = −x + 3 jika x < 3.",
      "Jika koefisien x negatif, perhatikan sisinya: |−2x + 5| = 2x − 5 jika x ≥ {5/2}, dan −2x + 5 jika x < {5/2}.",
      "Nilai mutlak sama dengan akar kuadrat dari kuadratnya: |x| = √{x^{2}}. Misalnya √{(−6)^{2}} = √{36} = 6 = |−6|.",
      "Jumlah dua nilai mutlak, misalnya |2x − 6| + |x − 1|, mempunyai dua titik batas (x = 1 dan x = 3), sehingga garis bilangan dibagi menjadi tiga daerah.",
    ], life: "Penjahit memotong kain dengan target panjang 150 cm. Selisih potongan x dari target adalah |x − 150|. Jika potongannya 153 cm, selisihnya 153 − 150 = 3 cm (rumus x − 150). Jika potongannya 147 cm, selisihnya −(147 − 150) = 3 cm (rumus −x + 150). Rumus yang dipakai bergantung pada apakah x di atas atau di bawah 150, itulah dua bagian definisi nilai mutlak.",
      example: "Tuliskan |2x + 3| tanpa tanda nilai mutlak.",
      work: ["Titik batas: 2x + 3 = 0, jadi x = −{3/2}.", "Untuk x ≥ −{3/2}, isi tanda mutlak tidak negatif: |2x + 3| = 2x + 3.", "Untuk x < −{3/2}, isi tanda mutlak negatif: |2x + 3| = −(2x + 3) = −2x − 3.", "Periksa: x = 0 memberi |3| = 3 = 2(0) + 3; x = −4 memberi |−5| = 5 = −2(−4) − 3."],
      notes: ["−x tidak selalu negatif: jika x = −7, maka −x = 7.", "Titik batas dimasukkan ke bagian \"≥\" agar setiap x mendapat tepat satu rumus.", "Saat mengalikan dengan −1, ubah tanda semua suku: −(2x − 6) = −2x + 6, bukan −2x − 6."],
      demo: "Atur a dan b pada |ax + b|, lalu geser x. Lihat bagian definisi yang sedang berlaku dan nilainya." },
  ] },
  { code: "B", title: "Persamaan Nilai Mutlak", sections: [
    { title: "Persamaan |ax + b| = c", lab: "persamaan", steps: [
      "Persamaan nilai mutlak linear satu variabel adalah persamaan yang variabelnya berpangkat satu dan berada di dalam tanda nilai mutlak, misalnya |2x − 1| = 7.",
      "Sifat 1.1: jika c > 0, maka |ax + b| = c berarti ax + b = c atau ax + b = −c. Persamaan ini mempunyai dua penyelesaian.",
      "Jika c = 0, hanya ax + b = 0 yang mungkin, sehingga ada tepat satu penyelesaian.",
      "Jika c < 0, tidak ada penyelesaian, karena nilai mutlak tidak pernah negatif.",
      "Jika ada bilangan di luar tanda mutlak, pisahkan dulu nilai mutlaknya. Contoh: −5|3x − 7| + 4 = 14 menjadi −5|3x − 7| = 10, lalu |3x − 7| = −2, sehingga tidak ada penyelesaian.",
      "Selalu periksa setiap jawaban dengan mensubstitusikannya ke persamaan awal.",
    ], life: "Debit air sungai normal 40 liter/detik, dan pada cuaca tidak normal debitnya berubah sebesar 12 liter/detik. Debit x pada keadaan itu memenuhi |x − 40| = 12, sehingga x = 52 (peningkatan maksimum) atau x = 28 (penurunan minimum). Petugas bendungan memakai dua nilai ini untuk menyiapkan pintu air. Mesin pengisi botol 600 mL yang diuji pada batas toleransi 15 mL juga memakai |x − 600| = 15, yaitu 585 mL atau 615 mL.",
      example: "Tentukan nilai x yang memenuhi |2x − 5| = 9.",
      work: ["Karena 9 > 0, ada dua kemungkinan.", "2x − 5 = 9, jadi 2x = 14 dan x = 7.", "2x − 5 = −9, jadi 2x = −4 dan x = −2.", "Periksa: |2(7) − 5| = 9 dan |2(−2) − 5| = |−9| = 9. Himpunan penyelesaiannya {−2, 7}."],
      notes: ["|x| = −3 tidak berarti x = −3; persamaan itu tidak mempunyai penyelesaian.", "Pisahkan nilai mutlak sendirian di satu ruas sebelum memecah menjadi dua persamaan.", "Banyak penyelesaian: dua jika c > 0, tepat satu jika c = 0, tidak ada jika c < 0."],
      demo: "Atur a, b, dan c. Grafik y = |ax + b| dan garis y = c menunjukkan titik potong, yaitu penyelesaian persamaannya." },
    { title: "Grafik dan persamaan dengan dua nilai mutlak", lab: "grafik", steps: [
      "Grafik y = |x| berbentuk huruf V dengan titik puncak (0, 0). Untuk x ≥ 0 grafiknya mengikuti y = x, untuk x < 0 mengikuti y = −x.",
      "Grafik y = |x − h| adalah grafik y = |x| yang digeser h satuan ke kanan (puncaknya (h, 0)); y = |x + h| digeser ke kiri.",
      "Untuk menggambar y = |ax + b|, buat tabel beberapa nilai x di kiri dan kanan puncak x = −{b/a}, letakkan titiknya, lalu hubungkan dengan garis lurus.",
      "Persamaan dengan dua nilai mutlak, misalnya |2x − 1| = |x + 3|, diselesaikan dengan membagi garis bilangan menurut titik batas setiap nilai mutlak (di sini x = −3 dan x = {1/2}).",
      "Pada setiap daerah, tulis kedua nilai mutlak tanpa tanda mutlak, selesaikan persamaannya, lalu periksa apakah hasilnya memang berada di daerah itu.",
      "Cara lain untuk |A| = |B|: A = B atau A = −B, atau kuadratkan kedua ruas karena |x| = √{x^{2}}. Hasilnya dapat dicek sebagai titik potong kedua grafik.",
    ], life: "Rumah Dina berada di km 2 dan rumah Bayu di km 8 sepanjang jalan desa. Mereka ingin membangun pos ronda di titik x yang sama jauh dari kedua rumah: |x − 2| = |x − 8|. Penyelesaiannya x = 5, dan grafik y = |x − 2| serta y = |x − 8| memang berpotongan tepat di x = 5. Cara yang sama dipakai untuk memilih letak halte yang adil bagi dua kampung.",
      example: "Selesaikan |x − 2| + |2x − 6| = 4.",
      work: ["Titik batas: x = 2 dan x = 3, sehingga ada tiga daerah.", "x < 2: (−x + 2) + (−2x + 6) = 4, jadi −3x = −4 dan x = {4/3}. Karena {4/3} < 2, x = {4/3} memenuhi.", "2 ≤ x < 3: (x − 2) + (−2x + 6) = 4, jadi x = 0. Karena 0 tidak berada di daerah ini, tidak dipakai.", "x ≥ 3: (x − 2) + (2x − 6) = 4, jadi x = 4. Himpunan penyelesaiannya {{4/3}, 4}."],
      notes: ["Hasil yang tidak berada di daerahnya harus dibuang.", "Puncak grafik y = |ax + b| selalu berada pada sumbu x, di x = −{b/a}.", "Grafik y = |x| − 1 adalah grafik y = |x| yang digeser 1 satuan ke bawah, puncaknya (0, −1)."],
      demo: "Pilih dua bentuk nilai mutlak. Grafik keduanya digambar, dan titik potongnya adalah penyelesaian persamaan |…| = |…|." },
  ] },
  { code: "C", title: "Pertidaksamaan Nilai Mutlak", sections: [
    { title: "Bentuk |x − p| ≤ q dan |x − p| ≥ q", lab: "interval", steps: [
      "Pertidaksamaan nilai mutlak linear satu variabel memakai tanda <, ≤, >, atau ≥, misalnya |t − 34| ≤ 0,2.",
      "Sifat 1.2: untuk a ≥ 0, |x| ≤ a setara dengan −a ≤ x ≤ a. Penyelesaiannya satu interval di antara −a dan a.",
      "Untuk a > 0, |x| ≥ a setara dengan x ≤ −a atau x ≥ a. Penyelesaiannya dua bagian di luar −a dan a.",
      "|x − p| ≤ q berarti jarak x ke p paling jauh q, sehingga p − q ≤ x ≤ p + q. |x − p| ≥ q berarti x ≤ p − q atau x ≥ p + q.",
      "Jika a < 0, |x| ≤ a tidak mempunyai penyelesaian, sedangkan |x| ≥ a berlaku untuk semua bilangan real.",
      "Untuk |ax + b| ≤ c, tulis −c ≤ ax + b ≤ c, lalu selesaikan ketiga ruas sekaligus. Jika membagi dengan bilangan negatif, tanda pertidaksamaan berbalik.",
      "Pada garis bilangan, tanda ≤ atau ≥ digambar dengan titik penuh (batasnya termasuk), sedangkan < atau > dengan titik kosong.",
    ], life: "Suhu inkubator bayi prematur diatur 34°C dan hanya boleh menyimpang 0,2°C, ditulis |t − 34| ≤ 0,2. Jadi suhu yang aman adalah 33,8°C sampai 34,2°C. Kemasan beras berlabel 5 kg juga boleh berbeda paling banyak 0,05 kg dari labelnya: |b − 5| ≤ 0,05, sehingga berat yang lolos pemeriksaan 4,95 kg sampai 5,05 kg. Di luar interval itu, kemasan ditolak.",
      example: "Selesaikan |3 − 2x| < 7.",
      work: ["Tulis sebagai −7 < 3 − 2x < 7.", "Kurangi ketiga ruas dengan 3: −10 < −2x < 4.", "Bagi dengan −2, tanda berbalik: 5 > x > −2.", "Jadi penyelesaiannya −2 < x < 5, digambar dengan titik kosong di −2 dan 5."],
      notes: ["Tanda ≥ menghasilkan dua bagian yang dihubungkan dengan \"atau\"; jangan ditulis −a ≥ x ≥ a.", "Membagi atau mengalikan dengan bilangan negatif membalik tanda pertidaksamaan.", "Periksa satu nilai dari daerah penyelesaian dan satu nilai dari luar daerah."],
      demo: "Atur p, q, dan tanda pertidaksamaan. Garis bilangan mengarsir penyelesaian |x − p| dibandingkan dengan q." },
    { title: "Pertidaksamaan dengan dua nilai mutlak", lab: "tanda", steps: [
      "Pertidaksamaan seperti |2x + 1| ≥ |x − 3| membandingkan dua nilai mutlak.",
      "Karena kedua ruas tidak negatif, keduanya boleh dikuadratkan: (2x + 1)^{2} ≥ (x − 3)^{2}. Pindahkan ke satu ruas: 3x^{2} + 10x − 8 ≥ 0.",
      "Faktorkan dan cari pembuat nol: (3x − 2)(x + 4) = 0, jadi x = {2/3} atau x = −4.",
      "Letakkan pembuat nol pada garis bilangan dan uji tanda setiap daerah. Untuk (3x − 2)(x + 4) urutannya +, −, +.",
      "Pilih daerah sesuai tanda soal: ≥ 0 memilih daerah +, ≤ 0 memilih daerah −. Jadi |2x + 1| ≥ |x − 3| untuk x ≤ −4 atau x ≥ {2/3}.",
      "Periksa dengan grafik: penyelesaiannya adalah bagian ketika grafik y = |2x + 1| berada di atas atau menyentuh grafik y = |x − 3|.",
    ], life: "Sebuah warung akan dibangun di titik x pada jalan lurus. Pemiliknya ingin warung lebih dekat ke perumahan di km 1 daripada ke pabrik di km 7, ditulis |x − 1| < |x − 7|. Setelah dikuadratkan, kedua x^{2} saling menghapus dan diperoleh 12x < 48, sehingga x < 4: semua titik sebelum km 4 memenuhi. Perencana kota memakai perbandingan jarak seperti ini untuk membagi wilayah layanan dua puskesmas.",
      example: "Selesaikan |2x − 1| < |x + 4|.",
      work: ["Kuadratkan: (2x − 1)^{2} < (x + 4)^{2}, jadi 4x^{2} − 4x + 1 < x^{2} + 8x + 16.", "Satu ruas: 3x^{2} − 12x − 15 < 0, dibagi 3: x^{2} − 4x − 5 < 0.", "Faktor: (x − 5)(x + 1) < 0, pembuat nol −1 dan 5, tanda +, −, +.", "Pilih daerah −: −1 < x < 5. Periksa x = 0: |−1| = 1 < |4| = 4."],
      notes: ["Mengkuadratkan hanya aman jika kedua ruas pasti tidak negatif, seperti dua nilai mutlak.", "Tanda < atau > tidak memasukkan pembuat nol; tanda ≤ atau ≥ memasukkannya.", "Jika suku x^{2} saling menghapus, pertidaksamaannya menjadi linear dan penyelesaiannya satu sisi saja."],
      demo: "Pilih pertidaksamaan. Garis tanda menunjukkan pembuat nol dan tanda setiap daerah, dan daerah penyelesaiannya diarsir." },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: `${t.code}.${j + 1}`, topic: t })));

/* ---------- Pratinjau grafik untuk pilihan ---------- */
const g4 = (fns: Fn[]) => graph(fns, -6, 6, -2, 7);

/* ---------- Latihan (4 soal per bagian) ---------- */
export const practice: PQuestion[][] = [
  // A.1
  [
    q(0, "Tentukan nilai mutlak setiap bilangan.", [n("|−12| =", 12), n("|{3/4}| =", 3 / 4), n("|0| =", 0), n("|−{7/3}| =", 7 / 3)],
      "Nilai mutlak adalah jarak ke 0: 12, {3/4}, 0, dan {7/3}."),
    q(0, "Dari posisi diam, Bimo maju 4 langkah, mundur 6 langkah, maju 3 langkah, lalu mundur 2 langkah (lihat garis bilangan). Tentukan posisi akhir dan banyak langkahnya.", [n("Posisi akhir =", -1), n("Banyak langkah =", 15)],
      "Posisi: 4 − 6 + 3 − 2 = −1 (1 langkah di belakang posisi awal). Langkah: 4 + 6 + 3 + 2 = 15.", { scene: { type: "line", min: -4, max: 6, arrows: [{ from: 0, to: 4, label: "maju 4" }, { from: 4, to: -2, label: "mundur 6" }, { from: -2, to: 1, label: "maju 3" }, { from: 1, to: -1, label: "mundur 2" }] } }),
    q(0, "Tentukan jarak antara dua bilangan pada garis bilangan.", [n("Jarak −5 ke 3 =", 8), n("Jarak −2 ke −9 =", 7)],
      "|−5 − 3| = 8 dan |−2 − (−9)| = |7| = 7."),
    q(0, "Benar atau salah?", [tf(["|−a| = |a| untuk setiap bilangan real a.", true], ["Nilai mutlak suatu bilangan bisa negatif.", false], ["|x| = 0 hanya jika x = 0.", true])],
      "Nilai mutlak adalah jarak, jadi tidak pernah negatif. Hanya 0 yang berjarak 0 dari 0."),
  ],
  // A.2
  [
    q(1, "Gunakan Definisi 1.1 untuk menuliskan |x + 2| tanpa tanda nilai mutlak.", [piece("|x + 2|", 1, 2)], "Titik batas x = −2. |x + 2| = x + 2 jika x ≥ −2, dan −x − 2 jika x < −2."),
    q(1, "Tuliskan |2x + 3| tanpa tanda nilai mutlak.", [piece("|2x + 3|", 2, 3)], "Titik batas x = −{3/2}. 2x + 3 jika x ≥ −{3/2}, dan −2x − 3 jika x < −{3/2}."),
    q(1, "Tuliskan |−2x + 5| tanpa tanda nilai mutlak.", [piece("|−2x + 5|", -2, 5)], "Titik batas x = {5/2}. Untuk x ≥ {5/2}, −2x + 5 ≤ 0 sehingga |−2x + 5| = 2x − 5. Untuk x < {5/2}, |−2x + 5| = −2x + 5."),
    q(1, "Gunakan hubungan |x| = √{x^{2}}.", [n("√{(−6)^{2}} =", 6), n("√{(3 − 10)^{2}} =", 7), ch("Hubungan yang benar:", ["|x| = √{x^{2}}", "|x| = x^{2}", "|x| = −√{x^{2}}"], "|x| = √{x^{2}}")],
      "√{36} = 6 dan √{49} = 7. Akar kuadrat dari kuadrat suatu bilangan selalu sama dengan nilai mutlaknya."),
  ],
  // B.1
  [
    q(2, "Tentukan himpunan penyelesaian |2x − 3| = 7.", [sol("x =", [5, -2], x => abs(2 * x - 3) - 7)], "2x − 3 = 7 memberi x = 5; 2x − 3 = −7 memberi x = −2."),
    q(2, "Tentukan himpunan penyelesaian |x + 4| = −2. Jika tidak ada, pilih \"Tidak ada penyelesaian\".", [sol("x =", [], x => abs(x + 4) + 2)], "Nilai mutlak tidak pernah negatif, jadi tidak ada x yang memenuhi."),
    q(2, "Tentukan himpunan penyelesaian |4x − 12| = 0.", [sol("x =", [3], x => abs(4 * x - 12))], "Hanya 4x − 12 = 0, jadi x = 3 (tepat satu penyelesaian)."),
    q(2, "Tentukan himpunan penyelesaian 4|x − 2| − 3 = 9.", [n("|x − 2| =", 3), sol("x =", [5, -1], x => 4 * abs(x - 2) - 12)], "4|x − 2| = 12, jadi |x − 2| = 3. x − 2 = 3 atau x − 2 = −3, sehingga x = 5 atau x = −1."),
  ],
  // B.2
  [
    q(3, "Lengkapi tabel titik untuk grafik y = |x − 2|.", [tbl("y =", [-2, 0, 2, 3, 5], x => abs(x - 2))], "Puncak di (2, 0). |−4| = 4, |−2| = 2, 0, 1, 3."),
    q(3, "Manakah sketsa grafik y = |x + 2|?", [ch("Grafik:", ["P", "Q", "R"], "P", [g4([V(1, 2, "")]), g4([V(1, -2, "")]), g4([V(1, 2, "", -1, 5)])])],
      "y = |x + 2| adalah grafik y = |x| yang digeser 2 satuan ke kiri, puncaknya (−2, 0)."),
    q(3, "Tentukan himpunan penyelesaian |x − 1| = |x − 5|.", [sol("x =", [3], x => abs(x - 1) - abs(x - 5))], "x − 1 = x − 5 tidak mungkin; x − 1 = −(x − 5) memberi 2x = 6, x = 3. Titik 3 sama jauh dari 1 dan 5."),
    q(3, "Tentukan himpunan penyelesaian |x − 1| + |x − 5| = 6.", [sol("x =", [0, 6], x => abs(x - 1) + abs(x - 5) - 6)],
      "Titik batas 1 dan 5. x < 1: −2x + 6 = 6, x = 0. 1 ≤ x < 5: 4 = 6, tidak ada. x ≥ 5: 2x − 6 = 6, x = 6."),
  ],
  // C.1
  [
    q(4, "Tentukan penyelesaian |x| ≤ 4 dan gambarkan pada garis bilangan.", [iv("Penyelesaian:", "antara", x => abs(x) <= 4, -4, 4, true)], "|x| ≤ 4 setara dengan −4 ≤ x ≤ 4 (titik penuh)."),
    q(4, "Tentukan penyelesaian |x − 3| > 2.", [iv("Penyelesaian:", "luar", x => abs(x - 3) > 2, 1, 5, false)], "Jarak x ke 3 lebih dari 2: x < 1 atau x > 5 (titik kosong)."),
    q(4, "Tentukan penyelesaian |5 − 2x| ≤ 3.", [iv("Penyelesaian:", "antara", x => abs(5 - 2 * x) <= 3, 1, 4, true)], "−3 ≤ 5 − 2x ≤ 3, jadi −8 ≤ −2x ≤ −2. Dibagi −2 (tanda berbalik): 1 ≤ x ≤ 4."),
    q(4, "Kemasan beras berlabel 5 kg boleh berbeda paling banyak 0,05 kg dari labelnya. Tentukan berat b yang lolos pemeriksaan.", [iv("Berat yang lolos:", "antara", b => abs(b - 5) <= 0.05 + 1e-12, 4.95, 5.05, true)], "|b − 5| ≤ 0,05, jadi 4,95 ≤ b ≤ 5,05 kg."),
  ],
  // C.2
  [
    q(5, "Tentukan penyelesaian |x + 2| ≤ |x − 4|.", [iv("Penyelesaian:", "kiri", x => abs(x + 2) <= abs(x - 4), 1, undefined, true)], "Kuadratkan: x^{2} + 4x + 4 ≤ x^{2} − 8x + 16, jadi 12x ≤ 12 dan x ≤ 1."),
    q(5, "Selesaikan |x + 1| > |2x − 4|.", [n("Pembuat nol yang kecil =", 1), n("Pembuat nol yang besar =", 5), iv("Penyelesaian:", "antara", x => abs(x + 1) > abs(2 * x - 4), 1, 5, false)],
      "x^{2} + 2x + 1 > 4x^{2} − 16x + 16, jadi 3x^{2} − 18x + 15 < 0, x^{2} − 6x + 5 < 0, (x − 1)(x − 5) < 0. Daerah −: 1 < x < 5."),
    q(5, "Tentukan penyelesaian |2x − 3| < |x|.", [iv("Penyelesaian:", "antara", x => abs(2 * x - 3) < abs(x), 1, 3, false)], "4x^{2} − 12x + 9 < x^{2}, jadi 3x^{2} − 12x + 9 < 0, (x − 1)(x − 3) < 0, sehingga 1 < x < 3."),
    q(5, "Warung dibangun di titik x pada jalan lurus dan harus lebih dekat ke perumahan di km 1 daripada ke pabrik di km 7. Tentukan semua titik x yang memenuhi.", [iv("Letak warung:", "kiri", x => abs(x - 1) < abs(x - 7), 4, undefined, false)],
      "|x − 1| < |x − 7|. Kuadratkan: −2x + 1 < −14x + 49, jadi 12x < 48 dan x < 4.", { scene: { type: "line", min: -2, max: 9, marks: [{ x: 1, label: "perumahan" }, { x: 7, label: "pabrik" }] } }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
const lvl = (l: Level, x: PQuestion): PQuestion => ({ ...x, level: l });
const S = "Sedang", Mn = "Menantang", SM = "Sangat menantang";
export const assessment: PQuestion[] = [
  lvl(S, q(0, "Tentukan nilai mutlak setiap bentuk berikut.", [n("|12 × (−4) : (3 − 9)| =", 8), n("|2^{4} − 3^{3}| =", 11), n("|{2/5} − {3/4}| =", 7 / 20)],
    "12 × (−4) = −48, dibagi −6 menjadi 8. 16 − 27 = −11, nilai mutlaknya 11. {8/20} − {15/20} = −{7/20}, nilai mutlaknya {7/20}.")),
  lvl(S, q(2, "Tentukan himpunan penyelesaian |3x − 4| = 11.", [sol("x =", [5, -7 / 3], x => abs(3 * x - 4) - 11)], "3x − 4 = 11 memberi x = 5; 3x − 4 = −11 memberi x = −{7/3}.")),
  lvl(S, q(4, "Tentukan penyelesaian |x − 6| ≤ 4 dan gambarkan pada garis bilangan.", [iv("Penyelesaian:", "antara", x => abs(x - 6) <= 4, 2, 10, true)], "Jarak x ke 6 paling jauh 4: 2 ≤ x ≤ 10.")),
  lvl(S, q(1, "Tuliskan |x + 5| tanpa tanda nilai mutlak.", [piece("|x + 5|", 1, 5)], "Titik batas x = −5: x + 5 jika x ≥ −5, dan −x − 5 jika x < −5.")),
  lvl(S, q(2, "Tentukan banyak penyelesaian setiap persamaan.", [{ kind: "classify", options: COUNT, rows: [
    { text: "|2x − 6| = 0", answer: "Tepat satu" }, { text: "|x + 4| = −3", answer: "Tidak ada" }, { text: "|5 − x| = 2", answer: "Dua" }, { text: "3|x − 1| + 7 = 7", answer: "Tepat satu" }] }],
    "c = 0 memberi tepat satu, c < 0 tidak ada, c > 0 dua. 3|x − 1| + 7 = 7 menjadi |x − 1| = 0.")),
  lvl(S, q(4, "Suhu ruang server dijaga 20°C dan hanya boleh menyimpang paling banyak 1,5°C. Tentukan interval suhu t yang diperbolehkan.", [iv("Suhu yang diperbolehkan:", "antara", t => abs(t - 20) <= 1.5, 18.5, 21.5, true)],
    "|t − 20| ≤ 1,5, jadi 18,5 ≤ t ≤ 21,5.", { scene: { type: "line", min: 17, max: 23, marks: [{ x: 20, label: "20°C" }], arrows: [{ from: 20, to: 21.5, label: "1,5" }, { from: 20, to: 18.5, label: "1,5" }] } })),
  lvl(S, q(0, "Manakah pernyataan yang benar?", [tf(["|k| = k untuk setiap k bilangan asli.", true], ["|x| = x untuk setiap x bilangan bulat.", false], ["Jika |x| = −5, maka x = −5.", false], ["Jika 3t − 6 > 0, maka |3t − 6| = 3t − 6.", true])],
    "Bilangan bulat negatif membuat |x| = −x. Tidak ada x dengan |x| = −5. Isi tanda mutlak yang positif tidak berubah.")),
  lvl(S, q(3, "Lengkapi tabel titik untuk grafik y = |x + 3|.", [tbl("y =", [-6, -4, -3, -1, 1], x => abs(x + 3))], "Puncak di (−3, 0): |−3| = 3, |−1| = 1, 0, 2, 4.")),

  lvl(Mn, q(4, "Tentukan penyelesaian |2x + 3| > 7.", [iv("Penyelesaian:", "luar", x => abs(2 * x + 3) > 7, -5, 2, false)], "2x + 3 > 7 memberi x > 2; 2x + 3 < −7 memberi x < −5. Jadi x < −5 atau x > 2.")),
  lvl(Mn, q(1, "Tuliskan |−3x + 6| tanpa tanda nilai mutlak.", [piece("|−3x + 6|", -3, 6)], "Titik batas x = 2. Untuk x ≥ 2: 3x − 6. Untuk x < 2: −3x + 6.")),
  lvl(Mn, q(2, "Tentukan himpunan penyelesaian 3|2x − 5| − 4 = 11.", [n("|2x − 5| =", 5), sol("x =", [5, 0], x => 3 * abs(2 * x - 5) - 15)], "3|2x − 5| = 15, jadi |2x − 5| = 5. 2x − 5 = 5 memberi x = 5; 2x − 5 = −5 memberi x = 0.")),
  lvl(Mn, q(5, "Tentukan penyelesaian |x − 2| < |x − 10|.", [iv("Penyelesaian:", "kiri", x => abs(x - 2) < abs(x - 10), 6, undefined, false)], "Kuadratkan: −4x + 4 < −20x + 100, jadi 16x < 96 dan x < 6. Titik 6 sama jauh dari 2 dan 10.")),
  lvl(Mn, q(0, "Lift naik 7 lantai, turun 10 lantai, naik 4 lantai, lalu turun 6 lantai. Tentukan posisi akhir lift terhadap lantai awal dan banyak lantai yang dilalui.", [n("Posisi akhir =", -5), n("Banyak lantai yang dilalui =", 27)],
    "7 − 10 + 4 − 6 = −5 (5 lantai di bawah lantai awal). |7| + |−10| + |4| + |−6| = 27.")),
  lvl(Mn, q(3, "Tentukan himpunan penyelesaian |2x − 1| = |x + 5|.", [sol("x =", [6, -4 / 3], x => abs(2 * x - 1) - abs(x + 5))], "2x − 1 = x + 5 memberi x = 6; 2x − 1 = −(x + 5) memberi 3x = −4, x = −{4/3}.")),
  lvl(Mn, q(4, "Nilai ujian Rudi 72, 85, 78, dan 90. Ia ingin rata-rata lima ujiannya 80 dengan penyimpangan paling banyak 2 poin. Tentukan nilai ujian kelima x yang harus diraih.", [iv("Nilai ujian kelima:", "antara", x => abs((325 + x) / 5 - 80) <= 2 + 1e-12, 65, 85, true)],
    "Jumlah empat nilai 325. |{(325 + x)/5} − 80| ≤ 2, jadi 78 ≤ {(325 + x)/5} ≤ 82, 390 ≤ 325 + x ≤ 410, sehingga 65 ≤ x ≤ 85.", { scene: { type: "table", head: ["Ujian", "1", "2", "3", "4", "5"], rows: [["Nilai", 72, 85, 78, 90, "x"]] } })),
  lvl(Mn, q(1, "Selidiki kebenaran setiap pernyataan untuk x, y bilangan real.", [tf(["|xy| = |x| · |y|", true], ["|x − y| = |y − x|", true], ["|x + y| = |x| + |y|", false], ["√{x^{2}} = x", false])],
    "|x + y| hanya sama dengan |x| + |y| jika x dan y bertanda sama (contoh x = 3, y = −5: 2 ≠ 8). √{x^{2}} = |x|, bukan x (contoh x = −4).")),
  lvl(Mn, q(2, "Debit air sungai normal 45 liter/detik dan pada cuaca tidak normal berubah 18 liter/detik. Tentukan peningkatan maksimum dan penurunan minimum debitnya.", [n("Debit maksimum =", 63, "liter/detik"), n("Debit minimum =", 27, "liter/detik")],
    "|x − 45| = 18, jadi x = 45 + 18 = 63 atau x = 45 − 18 = 27.", { scene: { type: "line", min: 20, max: 70, marks: [{ x: 45, label: "p = 45" }], arrows: [{ from: 45, to: 63, label: "18" }, { from: 45, to: 27, label: "18" }] } })),

  lvl(SM, q(5, "Tentukan penyelesaian |2x − 3| ≥ |x + 3|.", [iv("Penyelesaian:", "luar", x => abs(2 * x - 3) >= abs(x + 3), 0, 6, true)], "4x^{2} − 12x + 9 ≥ x^{2} + 6x + 9, jadi 3x^{2} − 18x ≥ 0, 3x(x − 6) ≥ 0. Daerah +: x ≤ 0 atau x ≥ 6.")),
  lvl(SM, q(3, "Tentukan himpunan penyelesaian |x − 2| + |2x − 8| = 7.", [sol("x =", [1, 17 / 3], x => abs(x - 2) + abs(2 * x - 8) - 7)],
    "Titik batas 2 dan 4. x < 2: −3x + 10 = 7, x = 1 (memenuhi). 2 ≤ x < 4: −x + 6 = 7, x = −1 (tidak di daerah). x ≥ 4: 3x − 10 = 7, x = {17/3} (memenuhi).")),
  lvl(SM, q(1, "Ubah |2x − 6| + |x − 1| tanpa tanda nilai mutlak pada setiap daerah, dalam bentuk mx + n.", [n("Untuk x ≥ 3, m =", 3), n("Untuk x ≥ 3, n =", -7), n("Untuk 1 ≤ x < 3, m =", -1), n("Untuk 1 ≤ x < 3, n =", 5), n("Untuk x < 1, m =", -3), n("Untuk x < 1, n =", 7)],
    "x ≥ 3: (2x − 6) + (x − 1) = 3x − 7. 1 ≤ x < 3: (−2x + 6) + (x − 1) = −x + 5. x < 1: (−2x + 6) + (−x + 1) = −3x + 7.")),
  lvl(SM, q(4, "Kadar hemoglobin normal perempuan dewasa antara 12 dan 15,5 g/dL. Nyatakan dalam bentuk |h − p| ≤ q, lalu tentukan kadar yang tidak normal.", [n("p =", 13.75), n("q =", 1.75), iv("Tidak normal:", "luar", h => abs(h - 13.75) > 1.75 + 1e-12, 12, 15.5, false)],
    "Titik tengah {(12 + 15,5)/2} = 13,75 dan setengah lebarnya 1,75, jadi normal |h − 13,75| ≤ 1,75. Tidak normal: h < 12 atau h > 15,5.")),
  lvl(SM, q(3, "Penjualan album per minggu (ribuan keping) dimodelkan s(t) = −3|t − 20| + 60. Pilih grafiknya, lalu tentukan puncak penjualan dan minggu ketika album dinyatakan Album Emas (penjualan lebih dari 45 ribu keping).", [
    ch("Grafik s(t):", ["P", "Q", "R"], "R", [graph([V(1, -20, "", 3, 0)], 0, 40, 0, 70), graph([V(1, -60, "", -3, 20)], 0, 40, 0, 70), graph([V(1, -20, "", -3, 60)], 0, 40, 0, 70)]),
    n("Puncak penjualan (ribu keping) =", 60), iv("Album Emas pada minggu ke-t:", "antara", t => -3 * abs(t - 20) + 60 > 45, 15, 25, false)],
    "Grafiknya V terbalik dengan puncak (20, 60). −3|t − 20| + 60 > 45 berarti |t − 20| < 5, jadi 15 < t < 25.")),
  lvl(SM, q(5, "Tentukan penyelesaian |x + 2| + |x − 1| < 5 dan gambarkan pada garis bilangan.", [iv("Penyelesaian:", "antara", x => abs(x + 2) + abs(x - 1) < 5, -3, 2, false)],
    "x < −2: −2x − 1 < 5, x > −3. −2 ≤ x < 1: 3 < 5, semua memenuhi. x ≥ 1: 2x + 1 < 5, x < 2. Gabungannya −3 < x < 2.")),
  lvl(SM, q(0, "Tentukan nilai berikut. Untuk bentuk yang memuat akar, pilih hasilnya.", [
    n("√{(4 − 11)^{2}} =", 7), ch("|2√{3} − 4| =", ["2√{3} − 4", "4 − 2√{3}", "4 + 2√{3}"], "4 − 2√{3}"), ch("|2n − {1/(n + 1)}|, n bilangan asli =", ["−2n + {1/(n + 1)}", "2n + {1/(n + 1)}", "2n − {1/(n + 1)}"], "2n − {1/(n + 1)}")],
    "√{49} = 7. 2√{3} ≈ 3,46 < 4, jadi isinya negatif dan nilai mutlaknya 4 − 2√{3}. Untuk n ≥ 1, 2n ≥ 2 > {1/(n + 1)}, jadi isinya positif.")),
];
