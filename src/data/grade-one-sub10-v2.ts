/**
 * Kelas 1 Bab 3 - Pengurangan sampai dengan 10 (Buku Siswa Matematika SD/MI Kelas I, Kurikulum Merdeka 2022, hlm. 77-111).
 * A. Cerita Pengurangan  B. Berbagai Cara Melakukan Pengurangan (pasangan bilangan, menghitung mundur, pengurangan dari 10)
 * C. Hubungan Penjumlahan dan Pengurangan  D. Soal Cerita Pengurangan.
 * Bentuk soal mengikuti buku: lengkapi kalimat "Sekarang tersisa □", lengkapi/tulis operasi □ − □ = □ dari gambar,
 * pasangan bilangan, hitung mundur di garis bilangan, kotak kosong pada bingkai 10, keluarga bilangan,
 * lingkari operasi yang hasilnya sama, pilih tanda + atau −, susun operasi dari bilangan dan tanda,
 * tulis tiga pengurangan yang hasilnya tertentu, dan soal cerita (termasuk dua langkah).
 */
import type { Question } from "./grade-four-whole-numbers";
import type { Thing as AddThing } from "./grade-one-add10-v2";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Thing = AddThing | "telur" | "balon" | "wortel";
export const thingName: Record<Thing, string> = {
  kelereng: "kelereng", mobil: "mobil-mobilan", bolu: "bolu kukus", kuelapis: "kue lapis", bola: "bola", apel: "apel", boneka: "boneka kelinci",
  kupu: "kupu-kupu", pita: "pita", bebek: "bebek", permen: "permen lolipop", mawar: "bunga mawar", burung: "burung", pensil: "pensil",
  siswa: "siswa", kepik: "kepik", donat: "donat", ikan: "ikan", telur: "telur", balon: "balon", wortel: "wortel",
};

/** Kelompok yang pergi/diambil, misalnya 2 kupu-kupu "terbang" atau 4 telur "pecah". */
export type Away = { n: number; verb: string };
export type Scene =
  /** Benda yang tersisa dan benda yang pergi, dipisah seperti di buku. */
  | { type: "gone"; thing: Thing; stay: number; away: Away[] }
  /** Dua kelompok berwarna (untuk keluarga bilangan). */
  | { type: "boxes"; thing: Thing; a: number; b: number }
  /** Bingkai 10 berisi `n` benda; sisanya kotak kosong. */
  | { type: "frame"; thing: Thing; n: number }
  /** Garis bilangan dengan titik mulai dan titik mendarat (tanpa lompatan). */
  | { type: "line"; from: number; to: number };

export type Op = "+" | "−";
export type Part =
  /** Kalimat atau operasi dengan kotak isian □. */
  | { kind: "fill"; text: string; answers: number[] }
  /** Pasangan bilangan: lingkaran gabungan dan dua lingkaran sebagian; null = harus diisi. */
  | { kind: "bond"; whole: number | null; parts: [number | null, number | null]; answers: number[] }
  /** Menghitung mundur: ketuk bilangan tempat mendarat. */
  | { kind: "back"; start: number; steps: number }
  /** Coret benda yang diambil (nilai: daftar nomor benda yang dicoret). */
  | { kind: "cross"; thing: Thing; total: number; take: number }
  /** Pilih tanda + atau − agar kalimat benar. */
  | { kind: "sign"; a: number; b: number; c: number; answer: Op }
  /** Pilih satu jawaban. */
  | { kind: "pick"; label: string; options: string[]; answer: string }
  /** Pilih semua yang benar (nilai: nomor pilihan dipisah koma). */
  | { kind: "multi"; label: string; options: string[]; answers: number[] }
  /** Susun operasi dari kartu bilangan (nilai: nomor kartu sesuai urutan kotak). */
  | { kind: "build"; tiles: number[]; op: Op }
  /** Tulis beberapa operasi berbeda yang hasilnya `result`. */
  | { kind: "pairs"; result: number; count: number; op: Op };
export type SQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
const list = (v: string) => (v ? v.split("|") : []);
const idx = (v: string) => (v ? v.split(",").filter(Boolean) : []);
export const fieldCount = (p: Part) => (p.kind === "fill" || p.kind === "bond" ? p.answers.length : p.kind === "pairs" ? p.count * 2 : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = list(v); return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const num = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);
export const apply = (a: number, op: Op, b: number) => (op === "+" ? a + b : a - b);
/** Urutan kartu pertama yang benar, untuk kunci jawaban. */
export function buildKey(p: Extract<Part, { kind: "build" }>) {
  const n = p.tiles.length;
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++)
    if (new Set([a, b, c]).size === 3 && apply(p.tiles[a], p.op, p.tiles[b]) === p.tiles[c]) return `${a},${b},${c}`;
  return "";
}
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": case "bond": return p.answers.join("|");
    case "back": return String(p.start - p.steps);
    case "cross": return Array.from({ length: p.take }, (_, i) => i).join(",");
    case "sign": return p.answer;
    case "pick": return p.answer;
    case "multi": return [...p.answers].sort((a, b) => a - b).join(",");
    case "build": return buildKey(p);
    case "pairs": return Array.from({ length: p.count }, (_, i) => (p.op === "−" ? `${p.result + i + 1}|${i + 1}` : `${i}|${p.result - i}`)).join("|");
  }
}
/** Operasi sah: hasilnya `result`, semua bilangan 0–10, dan tidak ada operasi yang sama. */
function pairsOk(p: Extract<Part, { kind: "pairs" }>, v: string) {
  const x = cells(p, v).map(num), seen = new Set<string>();
  for (let i = 0; i < p.count; i++) {
    const a = x[2 * i], b = x[2 * i + 1];
    if (!(a >= 0 && b >= 0 && a <= 10 && b <= 10) || apply(a, p.op, b) !== p.result || seen.has(`${a}${p.op}${b}`)) return false;
    seen.add(`${a}${p.op}${b}`);
  }
  return true;
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "fill": case "bond": { const got = cells(p, v); return p.answers.every((a, i) => num(got[i]) === a); }
    case "pairs": return pairsOk(p, v);
    /* Yang dinilai banyaknya benda yang dicoret, bukan benda yang mana. */
    case "cross": { const x = idx(v); return new Set(x).size === x.length && x.length === p.take && x.every(k => Number(k) >= 0 && Number(k) < p.total); }
    case "multi": return v === partKey(p);
    case "build": { const x = idx(v).map(Number); return x.length === 3 && new Set(x).size === 3 && x.every(k => k >= 0 && k < p.tiles.length) && apply(p.tiles[x[0]], p.op, p.tiles[x[1]]) === p.tiles[x[2]]; }
    default: return v === partKey(p);
  }
}
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "fill" || p.kind === "bond" || p.kind === "pairs") return cells(p, v).every(x => x.trim() !== "");
  if (p.kind === "build") return idx(v).length === 3;
  return v !== "";
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: SQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: SQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: SQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "bond": { let k = 0; const f = (n: number | null) => (n === null ? x[k++] || "…" : String(n)); const w = f(p.whole); return `${w} dipisah menjadi ${f(p.parts[0])} dan ${f(p.parts[1])}`; }
      case "back": return `${p.start} − ${p.steps} = ${v[i] || "…"}`;
      case "cross": return `${idx(v[i]).length} ${thingName[p.thing]} dicoret`;
      case "sign": return `${p.a} ${v[i] || "□"} ${p.b} = ${p.c}`;
      case "pick": return v[i] || "…";
      case "multi": return idx(v[i]).map(k => p.options[Number(k)]).join(", ") || "…";
      case "build": { const t = idx(v[i]).map(k => String(p.tiles[Number(k)])); return `${t[0] ?? "…"} ${p.op} ${t[1] ?? "…"} = ${t[2] ?? "…"}`; }
      case "pairs": return Array.from({ length: p.count }, (_, k) => `${x[2 * k] || "…"} ${p.op} ${x[2 * k + 1] || "…"} = ${p.result}`).join(", ");
    }
  }).join(" | ");
}

/* ====================================================================== */
/* Materi                                                                  */
/* ====================================================================== */
export type Topic = { code: string; title: string; short: string; lab: string; steps: string[]; demo: string };
export const topics: Topic[] = [
  { code: "A", title: "Cerita Pengurangan", short: "Cerita", lab: "ambil", steps: [
    "Ada 6 anak bermain. Sebanyak 2 anak pulang. Sekarang tersisa 4 anak.",
    "Mengurangi artinya mengambil sebagian. Tanda kurang (−) dipakai untuk pengurangan.",
    "Kita menulis 6 − 2 = 4 dan membacanya: enam dikurangi dua hasilnya empat.",
    "Jika semua diambil, tidak ada yang tersisa: 3 − 3 = 0.",
  ], demo: "Pilih benda dan banyaknya, lalu ketuk benda yang diambil. Lihat berapa yang tersisa." },
  { code: "B", title: "Berbagai Cara Melakukan Pengurangan", short: "Berbagai cara", lab: "cara", steps: [
    "Pasangan bilangan: 6 dipisah menjadi 2 dan 4. Jadi 6 − 2 = 4 dan 6 − 4 = 2.",
    "Menghitung mundur: mulai dari 5, mundur 3 langkah: 4, 3, 2. Jadi 5 − 3 = 2.",
    "Pengurangan dari 10: ada 10 bola, 7 merah dan 3 biru. Jadi 10 − 7 = 3 dan 10 − 3 = 7.",
  ], demo: "Pilih caranya: pisahkan apel, mundur di garis bilangan, atau coret kelereng di bingkai 10." },
  { code: "C", title: "Hubungan Penjumlahan dan Pengurangan", short: "Hubungan", lab: "keluarga", steps: [
    "Ada 4 kelereng merah dan 3 kelereng hijau. Semuanya 7: 4 + 3 = 7 dan 3 + 4 = 7.",
    "Dari 7 kelereng, ambil yang hijau, tersisa yang merah: 7 − 3 = 4.",
    "Ambil yang merah, tersisa yang hijau: 7 − 4 = 3.",
    "Empat kalimat ini satu keluarga. Penjumlahan bisa dipakai untuk memeriksa pengurangan.",
  ], demo: "Atur banyak kelereng merah dan hijau, lalu ketuk setiap kalimat untuk melihat bendanya." },
  { code: "D", title: "Soal Cerita Pengurangan", short: "Soal cerita", lab: "cerita", steps: [
    "Baca ceritanya: Ada 8 burung di pohon. Sebanyak 2 burung terbang.",
    "Cari mula-mula ada berapa dan berapa yang pergi: 8 dan 2.",
    "Tulis penyelesaiannya: 8 − 2 = 6.",
    "Jawab dengan kalimat: Masih ada 6 burung di pohon.",
  ], demo: "Pilih cerita dan banyaknya, baca ceritanya, lalu tebak sisanya sebelum dibuka." },
];

/* ====================================================================== */
/* Pembuat soal                                                            */
/* ====================================================================== */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): SQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B, C, D] = [make(0), make(1), make(2), make(3)];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const gone = (thing: Thing, stay: number, ...away: Away[]): Scene => ({ type: "gone", thing, stay, away });
const bond = (whole: number | null, a: number | null, b: number | null, ...answers: number[]): Part => ({ kind: "bond", whole, parts: [a, b], answers });

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: SQuestion[][] = [
  [
    A({ prompt: "Mula-mula ada 6 kupu-kupu. Sebanyak 2 kupu-kupu terbang.", scene: gone("kupu", 4, { n: 2, verb: "terbang" }), parts: [fill("Sekarang tersisa □ kupu-kupu.", 4)], explanation: "Ada 6 kupu-kupu, 2 terbang. 6 − 2 = 4. Tersisa 4 kupu-kupu." }),
    A({ prompt: "Amati gambar. Lengkapi operasi pengurangannya.", scene: gone("telur", 5, { n: 4, verb: "pecah" }), parts: [fill("9 − 4 = □", 5)], explanation: "Semua ada 9 telur, 4 pecah. 9 − 4 = 5 telur yang utuh." }),
    A({ prompt: "Ada 7 apel. Adik makan 3 apel. Coret 3 apel, lalu tulis sisanya.", parts: [{ kind: "cross", thing: "apel", total: 7, take: 3 }, fill("7 − 3 = □", 4)], explanation: "Coret 3 dari 7 apel. Yang tidak dicoret ada 4. 7 − 3 = 4." }),
    A({ prompt: "Amati gambar. Tulislah operasi pengurangannya.", scene: gone("bebek", 6, { n: 2, verb: "pergi" }), parts: [fill("□ − □ = □", 8, 2, 6)], explanation: "Semua ada 8 bebek, 2 pergi, tersisa 6. 8 − 2 = 6." }),
  ],
  [
    B({ prompt: "Isilah pasangan bilangannya, lalu tulis hasil pengurangannya.", parts: [bond(7, 2, null, 5), fill("7 − 2 = □", 5)], explanation: "7 dipisah menjadi 2 dan 5. Jadi 7 − 2 = 5." }),
    B({ prompt: "Hitung mundur. Mulai dari 5, mundur 3 langkah. Ketuk tempat mendarat.", parts: [{ kind: "back", start: 5, steps: 3 }], explanation: "Dari 5 mundur 3 langkah: 4, 3, 2. Jadi 5 − 3 = 2." }),
    B({ prompt: "Ada 10 kelereng. Coret 7 kelereng, lalu hitung sisanya.", parts: [{ kind: "cross", thing: "kelereng", total: 10, take: 7 }, fill("10 − 7 = □", 3)], explanation: "Dari 10 kelereng dicoret 7. Tersisa 3. 10 − 7 = 3." }),
    B({ prompt: "Semua ada 10 kotak, terisi 6.", scene: { type: "frame", thing: "kelereng", n: 6 }, parts: [fill("Kotak kosong: 10 − 6 = □", 4)], explanation: "Bingkai 10 terisi 6. Kotak kosong ada 10 − 6 = 4." }),
  ],
  [
    C({ prompt: "Amati gambar. Lengkapi keluarga bilangannya.", scene: { type: "boxes", thing: "kelereng", a: 4, b: 3 }, parts: [fill("4 + 3 = □", 7), fill("7 − 3 = □", 4), fill("7 − 4 = □", 3)], explanation: "4 merah dan 3 hijau menjadi 7. Jika 3 hijau diambil, tersisa 4. Jika 4 merah diambil, tersisa 3." }),
    C({ prompt: "Pilih semua operasi yang hasilnya 5.", parts: [{ kind: "multi", label: "Hasilnya 5:", options: ["6 − 1", "2 + 4", "3 + 2", "9 − 3", "8 − 3", "1 + 3"], answers: [0, 2, 4] }], explanation: "6 − 1 = 5, 3 + 2 = 5, dan 8 − 3 = 5. Yang lain: 2 + 4 = 6, 9 − 3 = 6, 1 + 3 = 4." }),
    C({ prompt: "Pilih tanda + atau − agar kalimatnya benar.", parts: [{ kind: "sign", a: 5, b: 3, c: 8, answer: "+" }, { kind: "sign", a: 9, b: 3, c: 6, answer: "−" }], explanation: "5 + 3 = 8 karena hasilnya lebih besar. 9 − 3 = 6 karena hasilnya lebih kecil." }),
    C({ prompt: "Isilah bilangan yang hilang.", parts: [fill("□ + 3 = 10", 7), fill("8 − □ = 6", 2)], explanation: "7 + 3 = 10. 8 − 2 = 6, periksa: 6 + 2 = 8." }),
  ],
  [
    D({ prompt: "Ada 8 burung di pohon. Sebanyak 2 burung terbang. Berapa burung yang masih di pohon?", scene: gone("burung", 6, { n: 2, verb: "terbang" }), parts: [fill("□ − □ = □", 8, 2, 6), fill("Masih ada □ burung.", 6)], explanation: "8 burung, 2 terbang. 8 − 2 = 6. Masih ada 6 burung." }),
    D({ prompt: "Ada 7 siswa bermain. Beberapa siswa pulang. Sekarang tersisa 5 siswa. Berapa siswa yang pulang?", parts: [fill("7 − □ = 5", 2), fill("Yang pulang □ siswa.", 2)], explanation: "7 dikurangi berapa hasilnya 5? Mundur dari 7 ke 5 ada 2 langkah. Yang pulang 2 siswa." }),
    D({ prompt: "Ada 10 bola. Sebanyak 3 bola ada di luar kotak. Berapa bola di dalam kotak?", parts: [fill("□ − □ = □", 10, 3, 7), fill("Di dalam kotak ada □ bola.", 7)], explanation: "10 bola, 3 di luar. 10 − 3 = 7 bola di dalam kotak." }),
    D({ prompt: "Dina punya 9 kelereng. Ia memberi Kira 3 kelereng dan memberi Upe 4 kelereng. Berapa sisa kelereng Dina?", parts: [fill("□ − □ − □ = □", 9, 3, 4, 2), fill("Sisa kelereng Dina □.", 2)], explanation: "9 − 3 = 6, lalu 6 − 4 = 2. Sisa kelereng Dina 2." }),
  ],
];

/* ---------- Evaluasi (24 soal: A, B, C, D bergantian) ---------- */
export const assessment: SQuestion[] = [
  A({ level: "Sedang", prompt: "Mula-mula ada 7 kupu-kupu di bunga. Sebanyak 4 kupu-kupu terbang.", scene: gone("kupu", 3, { n: 4, verb: "terbang" }), parts: [fill("Sekarang tersisa □ kupu-kupu.", 3)], explanation: "7 kupu-kupu, 4 terbang. 7 − 4 = 3." }),
  B({ level: "Sedang", prompt: "Hitung mundur. Mulai dari 6, mundur 2 langkah.", parts: [{ kind: "back", start: 6, steps: 2 }], explanation: "Dari 6 mundur 2 langkah: 5, 4. Jadi 6 − 2 = 4." }),
  C({ level: "Sedang", prompt: "Amati gambar. Lengkapi penjumlahan dan pengurangannya.", scene: { type: "boxes", thing: "pita", a: 5, b: 2 }, parts: [fill("5 + 2 = □", 7), fill("7 − 2 = □", 5)], explanation: "5 pita biru dan 2 pita merah menjadi 7. Jika 2 pita merah diambil, tersisa 5." }),
  D({ level: "Sedang", prompt: "Ada 9 ikan di kolam. Ayah menangkap 3 ikan. Berapa ikan yang tersisa?", scene: gone("ikan", 6, { n: 3, verb: "ditangkap" }), parts: [fill("□ − □ = □", 9, 3, 6), fill("Tersisa □ ikan.", 6)], explanation: "9 ikan, 3 ditangkap. 9 − 3 = 6 ikan." }),
  A({ level: "Sedang", prompt: "Amati gambar. Lengkapi operasi pengurangannya.", scene: gone("telur", 6, { n: 2, verb: "pecah" }), parts: [fill("8 − 2 = □", 6)], explanation: "Semua ada 8 telur, 2 pecah. 8 − 2 = 6." }),
  B({ level: "Sedang", prompt: "Isilah pasangan bilangannya, lalu tulis hasil pengurangannya.", parts: [bond(8, 3, null, 5), fill("8 − 3 = □", 5)], explanation: "8 dipisah menjadi 3 dan 5. Jadi 8 − 3 = 5." }),
  C({ level: "Sedang", prompt: "Pilih tanda + atau − agar kalimatnya benar.", parts: [{ kind: "sign", a: 6, b: 2, c: 8, answer: "+" }, { kind: "sign", a: 6, b: 2, c: 4, answer: "−" }], explanation: "6 + 2 = 8 dan 6 − 2 = 4. Bilangannya sama, tandanya berbeda." }),
  D({ level: "Sedang", prompt: "Ibu membeli 8 donat. Adik makan 3 donat. Coret donat yang dimakan, lalu tulis sisanya.", parts: [{ kind: "cross", thing: "donat", total: 8, take: 3 }, fill("Sisa donat ada □.", 5)], explanation: "Coret 3 dari 8 donat. 8 − 3 = 5 donat." }),

  A({ level: "Menantang", prompt: "Pilih operasi yang cocok dengan gambar.", scene: gone("kepik", 5, { n: 3, verb: "terbang" }), parts: [{ kind: "pick", label: "Operasinya:", options: ["8 − 5 = 3", "8 − 3 = 5", "5 − 3 = 2"], answer: "8 − 3 = 5" }], explanation: "Semua ada 8 kepik. Yang terbang 3, tersisa 5. Jadi 8 − 3 = 5." }),
  B({ level: "Menantang", prompt: "Hitung mundur. Mulai dari 10, mundur 3 langkah.", parts: [{ kind: "back", start: 10, steps: 3 }], explanation: "Dari 10 mundur 3 langkah: 9, 8, 7. Jadi 10 − 3 = 7." }),
  C({ level: "Menantang", prompt: "Pilih semua operasi yang hasilnya 4.", parts: [{ kind: "multi", label: "Hasilnya 4:", options: ["7 − 3", "2 + 3", "9 − 5", "1 + 3", "8 − 3", "6 − 2"], answers: [0, 2, 3, 5] }], explanation: "7 − 3 = 4, 9 − 5 = 4, 1 + 3 = 4, dan 6 − 2 = 4. Sedangkan 2 + 3 = 5 dan 8 − 3 = 5." }),
  D({ level: "Menantang", prompt: "Beni punya 10 bola. Beberapa bola diberikan kepada Tika. Sisa bola Beni 4. Berapa bola yang diberikan kepada Tika?", parts: [fill("10 − □ = 4", 6), fill("Bola yang diberikan □.", 6)], explanation: "10 dikurangi berapa hasilnya 4? Periksa dengan penjumlahan: 4 + 6 = 10. Jadi 6 bola." }),
  A({ level: "Menantang", prompt: "Amati gambar. Tulislah operasi pengurangannya.", scene: gone("apel", 6, { n: 3, verb: "dimakan ulat" }), parts: [fill("□ − □ = □", 9, 3, 6)], explanation: "Semua ada 9 apel, 3 dimakan ulat, tersisa 6. 9 − 3 = 6." }),
  B({ level: "Menantang", prompt: "Kelinci makan beberapa wortel dari 10 wortel. Sisanya ada di bingkai.", scene: { type: "frame", thing: "wortel", n: 3 }, parts: [fill("10 − □ = 3", 7)], explanation: "Tersisa 3 wortel. Kotak kosong ada 7, itu wortel yang dimakan. 10 − 7 = 3." }),
  C({ level: "Menantang", prompt: "Susun operasi pengurangan yang benar dari kartu 9, 5, dan 4.", parts: [{ kind: "build", tiles: [5, 9, 4], op: "−" }], explanation: "9 − 5 = 4 atau 9 − 4 = 5. Bilangan terbesar ditulis pertama." }),
  D({ level: "Menantang", prompt: "Di kelas ada 9 siswa. Sebanyak 4 siswa pulang. Hitung mundur, lalu jawab.", parts: [{ kind: "back", start: 9, steps: 4 }, fill("Masih ada □ siswa.", 5)], explanation: "Dari 9 mundur 4 langkah: 8, 7, 6, 5. Masih ada 5 siswa." }),
  A({ level: "Menantang", prompt: "Ada 10 kelereng. Kakak mengambil 4 kelereng. Coret kelereng yang diambil.", parts: [{ kind: "cross", thing: "kelereng", total: 10, take: 4 }, fill("10 − 4 = □", 6)], explanation: "Coret 4 dari 10 kelereng. Tersisa 6. 10 − 4 = 6." }),

  B({ level: "Sangat menantang", prompt: "Isilah pasangan bilangannya, lalu lengkapi pengurangannya.", parts: [bond(10, 4, null, 6), fill("10 − □ = 4", 6)], explanation: "10 dipisah menjadi 4 dan 6. Jadi 10 − 6 = 4." }),
  C({ level: "Sangat menantang", prompt: "Buatlah tiga operasi pengurangan yang hasilnya 5.", parts: [{ kind: "pairs", result: 5, count: 3, op: "−" }], explanation: "Banyak jawaban yang benar, misalnya 6 − 1, 7 − 2, 8 − 3, 9 − 4, 10 − 5, atau 5 − 0. Ketiganya harus berbeda." }),
  D({ level: "Sangat menantang", prompt: "Lina punya 8 balon. Sebanyak 2 balon meletus, lalu 3 balon terbang. Berapa balon Lina sekarang?", parts: [fill("□ − □ − □ = □", 8, 2, 3, 3), fill("Balon Lina tinggal □.", 3)], explanation: "8 − 2 = 6, lalu 6 − 3 = 3. Balon Lina tinggal 3." }),
  A({ level: "Sangat menantang", prompt: "Pilih cerita yang cocok dengan 6 − 2 = 4.", parts: [{ kind: "pick", label: "Ceritanya:", options: ["Ada 6 burung. Datang lagi 2 burung.", "Ada 4 burung. Sebanyak 2 burung terbang.", "Ada 6 burung. Sebanyak 2 burung terbang."], answer: "Ada 6 burung. Sebanyak 2 burung terbang." }], explanation: "Mula-mula 6 burung, lalu 2 pergi, tersisa 4. Cerita yang datang lagi adalah penjumlahan." }),
  B({ level: "Sangat menantang", prompt: "Katak mundur dari 9 dan mendarat di 4. Berapa langkah katak mundur?", scene: { type: "line", from: 9, to: 4 }, parts: [fill("9 − □ = 4", 5)], explanation: "Dari 9 ke 4: 8, 7, 6, 5, 4. Ada 5 langkah. Jadi 9 − 5 = 4." }),
  C({ level: "Sangat menantang", prompt: "Isilah bilangan yang hilang.", parts: [fill("6 + □ = 9", 3), fill("□ − 3 = 6", 9)], explanation: "6 + 3 = 9. Bilangan yang dikurangi 3 hasilnya 6 adalah 9, karena 6 + 3 = 9." }),
  D({ level: "Sangat menantang", prompt: "Ada 10 telur. Beberapa telur pecah, yang utuh tinggal 7. Ibu memakai 2 telur utuh untuk membuat kue.", parts: [fill("Telur pecah: 10 − □ = 7", 3), fill("Telur utuh sekarang: 7 − 2 = □", 5)], explanation: "10 − 3 = 7, jadi 3 telur pecah. Lalu 7 − 2 = 5 telur utuh." }),
];
