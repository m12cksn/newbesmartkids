/**
 * Kelas 1 Bab 5 - Ayo Membilang sampai dengan 20 (Buku Siswa Matematika SD/MI Kelas I, Kurikulum Merdeka 2022, hlm. 145-174).
 * A. Menghitung, Membaca, dan Menulis Bilangan  B. Menghitung Maju dan Mundur  C. Nilai Tempat  D. Membandingkan Bilangan.
 * Bentuk soal mengikuti buku: tarik garis gambar ke bilangan, hitung dan tulis banyak benda, lingkari setiap 10 benda,
 * warnai sejumlah benda, "10 ditambah … menjadi …" dengan pasangan bilangan, tebak lalu hitung, lengkapi urutan
 * (ulat dan es krim, maju/mundur), isi tabel puluhan-satuan, warnai lingkaran untuk puluhan dan satuan,
 * lingkari gambar yang lebih banyak, lengkapi "lebih banyak/sedikit", paling banyak/sedikit, dan urutkan bilangan.
 */
import type { Question } from "./grade-four-whole-numbers";
import type { Thing } from "./grade-one-sub10-v2";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type { Thing };
/** Benda puluhan: kelereng dalam kantong, pensil diikat, telur dalam wadah, balok disusun. */
export type Bundle = "kantong" | "pensil" | "telur" | "balok";
export const bundleName: Record<Bundle, [string, string]> = { kantong: ["10 kelereng dalam kantong", "kelereng"], pensil: ["10 pensil diikat", "pensil"], telur: ["10 telur dalam wadah", "telur"], balok: ["10 balok disusun", "balok"] };

export type Scene =
  /** Sekelompok benda. `frames`: tersusun dalam bingkai 10. */
  | { type: "objs"; thing: Thing; n: number; layout: "scatter" | "rows" | "frames"; alt?: boolean }
  /** Puluhan dan satuan dari benda nyata. */
  | { type: "pv"; bundle: Bundle; ones: number }
  /** Stoples berisi benda (tebak lalu hitung). */
  | { type: "jar"; thing: Thing; n: number }
  /** Beberapa gambar yang dibandingkan, berlabel. */
  | { type: "groups"; thing: Thing; labels: string[]; ns: number[]; layout: "scatter" | "rows" | "frames"; spread?: number[] };

export type Part =
  /** Kalimat dengan kotak isian □. */
  | { kind: "fill"; text: string; answers: number[] }
  /** Tabel puluhan dan satuan. */
  | { kind: "table"; tens: number; ones: number }
  /** Pasangan bilangan: gabungan dan dua bagian; null = harus diisi. */
  | { kind: "bond"; whole: number | null; parts: [number | null, number | null]; answers: number[] }
  /** Tarik garis gambar bingkai 10 ke bilangan (nilai: nomor kanan per kiri). */
  | { kind: "match"; left: number[]; right: number[]; thing: Thing }
  /** Lingkari 10 benda (nilai: nomor benda yang dilingkari). */
  | { kind: "ring"; thing: Thing; n: number }
  /** Warnai sejumlah benda (nilai: nomor benda yang diwarnai). */
  | { kind: "paint"; thing: Thing; n: number; target: number }
  /** Warnai lingkaran pada dua bingkai 10. */
  | { kind: "frames"; target: number }
  /** Lengkapi urutan (null = kotak isian). */
  | { kind: "seq"; items: (number | null)[]; look: "ulat" | "eskrim" | "tabel" }
  /** Pilih satu jawaban. */
  | { kind: "pick"; label: string; options: string[]; answer: string }
  /** Ketuk kartu bilangan sesuai urutan (nilai: nomor kartu). */
  | { kind: "order"; label: string; nums: number[]; dir: "naik" | "turun" }
  /** Tebakan (bebas) lalu hitungan. */
  | { kind: "guess"; answer: number };
export type SQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
const list = (v: string) => (v ? v.split("|") : []);
const idx = (v: string) => (v ? v.split(",").filter(Boolean) : []);
export const blanks = (p: Extract<Part, { kind: "seq" }>) => p.items.filter(x => x === null).length;
/** Isi urutan yang benar: deret dengan langkah tetap dari dua bilangan yang diketahui. */
export function seqFull(items: (number | null)[]) {
  const known = items.map((v, i) => [i, v] as const).filter((x): x is readonly [number, number] => x[1] !== null);
  const [[i0, v0], [i1, v1]] = known, step = (v1 - v0) / (i1 - i0);
  return items.map((_, i) => v0 + step * (i - i0));
}
export const fieldCount = (p: Part) => (p.kind === "fill" || p.kind === "bond" ? p.answers.length : p.kind === "table" ? 2 : p.kind === "match" ? p.left.length : p.kind === "seq" ? blanks(p) : p.kind === "guess" ? 2 : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = list(v); return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const num = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);
const sorted = (p: Extract<Part, { kind: "order" }>) => p.nums.map((n, i) => [n, i] as const).sort((a, b) => (p.dir === "naik" ? a[0] - b[0] : b[0] - a[0])).map(x => x[1]);
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": case "bond": return p.answers.join("|");
    case "table": return `${p.tens}|${p.ones}`;
    case "match": return p.left.map(l => p.right.indexOf(l)).join("|");
    case "ring": return Array.from({ length: 10 }, (_, i) => i).join(",");
    case "paint": return Array.from({ length: p.target }, (_, i) => i).join(",");
    case "frames": return Array.from({ length: p.target }, (_, i) => i).join(",");
    case "seq": { const f = seqFull(p.items); return p.items.map((v, i) => (v === null ? f[i] : null)).filter(v => v !== null).join("|"); }
    case "pick": return p.answer;
    case "order": return sorted(p).join(",");
    case "guess": return `${p.answer}|${p.answer}`;
  }
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "fill": case "bond": case "table": case "match": case "seq": { const got = cells(p, v), key = partKey(p).split("|"); return key.every((a, i) => num(got[i]) === Number(a)); }
    /* Yang dinilai banyaknya benda, bukan benda yang mana. */
    case "ring": { const x = idx(v); return new Set(x).size === 10 && x.length === 10 && x.every(k => Number(k) < p.n); }
    case "paint": { const x = idx(v); return new Set(x).size === p.target && x.length === p.target && x.every(k => Number(k) < p.n); }
    /* Satu puluhan = bingkai pertama penuh dulu; sisanya satuan di bingkai kedua. */
    case "frames": { const x = idx(v).map(Number); const first = x.filter(k => k < 10).length; return new Set(x).size === x.length && x.length === p.target && first === Math.min(10, p.target); }
    case "guess": { const [g, c] = cells(p, v); return !Number.isNaN(num(g)) && num(c) === p.answer; }
    default: return v === partKey(p);
  }
}
export function partReady(p: Part, v: string): boolean {
  if (["fill", "bond", "table", "match", "seq", "guess"].includes(p.kind)) return cells(p, v).every(x => x.trim() !== "");
  if (p.kind === "order") return idx(v).length === p.nums.length;
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
      case "bond": { let k = 0; const f = (n: number | null) => (n === null ? x[k++] || "…" : String(n)); const w = f(p.whole); return `${f(p.parts[0])} dan ${f(p.parts[1])} menjadi ${w}`; }
      case "table": return `puluhan ${x[0] || "…"}, satuan ${x[1] || "…"}`;
      case "match": return p.left.map((l, k) => `gambar ${"abcd"[k]} (${l}) → ${x[k] === "" ? "…" : p.right[Number(x[k])]}`).join(", ");
      case "ring": return `${idx(v[i]).length} benda dilingkari`;
      case "paint": return `${idx(v[i]).length} benda diwarnai`;
      case "frames": { const y = idx(v[i]).map(Number); return `${y.filter(k => k < 10).length} lingkaran di bingkai pertama, ${y.filter(k => k >= 10).length} di bingkai kedua`; }
      case "seq": { let k = 0; return p.items.map(n => (n === null ? x[k++] || "…" : String(n))).join(", "); }
      case "pick": return v[i] || "…";
      case "order": return idx(v[i]).map(k => p.nums[Number(k)]).join(", ") || "…";
      case "guess": return `tebakan ${x[0] || "…"}, hitungan ${x[1] || "…"}`;
    }
  }).join(" | ");
}

/* ====================================================================== */
/* Materi                                                                  */
/* ====================================================================== */
export type Topic = { code: string; title: string; short: string; lab: string; steps: string[]; demo: string };
export const topics: Topic[] = [
  { code: "A", title: "Menghitung, Membaca, dan Menulis Bilangan", short: "Membilang", lab: "bilang", steps: [
    "Hitung 10 benda dulu dan kumpulkan. Lalu hitung sisanya: 11, 12, 13, …",
    "10 ditambah 1 menjadi 11, dibaca sebelas. 10 ditambah 5 menjadi 15, dibaca lima belas.",
    "Bilangan 11 sampai 19 dibaca dengan kata belas. 20 dibaca dua puluh.",
    "Kita bisa menebak banyak benda dulu, lalu menghitung untuk membuktikannya.",
  ], demo: "Tambah atau kurangi kelereng. Bingkai pertama terisi 10 dulu, lalu lihat nama bilangannya." },
  { code: "B", title: "Menghitung Maju dan Mundur", short: "Maju mundur", lab: "maju", steps: [
    "Menghitung maju: mulai dari bilangan kecil ke besar, langkahnya sama. 10, 11, 12, 13, …",
    "Menghitung mundur: mulai dari bilangan besar ke kecil, langkahnya sama. 15, 14, 13, …",
    "Langkahnya bisa 2: 12, 14, 16, 18. Setiap langkah bertambah 2.",
  ], demo: "Pilih langkah maju atau mundur, lalu ketuk Langkah. Ulat akan menyala pada bilangan berikutnya." },
  { code: "C", title: "Nilai Tempat", short: "Nilai tempat", lab: "tempat", steps: [
    "1 benda disebut 1 satuan. 10 benda yang dikumpulkan disebut 1 puluhan.",
    "15 kelereng = 10 kelereng dalam kantong dan 5 kelereng. Jadi 1 puluhan dan 5 satuan.",
    "Tabel nilai tempat punya dua kolom: Puluhan dan Satuan. Untuk 15 ditulis 1 dan 5.",
    "20 = 2 puluhan dan 0 satuan.",
  ], demo: "Tambah kelereng satu per satu. Setelah 10, kelereng masuk kantong menjadi 1 puluhan." },
  { code: "D", title: "Membandingkan Bilangan", short: "Membandingkan", lab: "banding", steps: [
    "Halim punya 15 kelereng, Upe punya 11. 15 lebih banyak dari 11. 11 lebih sedikit dari 15.",
    "Susun benda dalam bingkai 10 agar mudah dibandingkan. Bingkai yang lebih penuh, lebih banyak.",
    "Urutan dari terkecil: 10, 12, 14. Urutan dari terbesar: 14, 12, 10.",
  ], demo: "Atur banyak jeruk Kira dan Tika, lalu lihat siapa yang lebih banyak." },
];

/* ====================================================================== */
/* Pembuat soal                                                            */
/* ====================================================================== */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): SQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B, C, D] = [make(0), make(1), make(2), make(3)];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const objs = (thing: Thing, n: number, layout: "scatter" | "rows" | "frames" = "scatter"): Scene => ({ type: "objs", thing, n, layout });
const AB = ["Gambar A", "Gambar B"];
const more = (label: string, answer: "banyak" | "sedikit"): Part => ({ kind: "pick", label, options: ["banyak", "sedikit"], answer });

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: SQuestion[][] = [
  [
    A({ prompt: "Tariklah garis. Temukan pasangannya.", parts: [{ kind: "match", thing: "kelereng", left: [17, 13, 19, 15], right: [15, 17, 13, 19] }], explanation: "Setiap gambar punya 10 kelereng di bingkai pertama. Tambahkan sisanya: 10 dan 7 menjadi 17, 10 dan 3 menjadi 13, 10 dan 9 menjadi 19, 10 dan 5 menjadi 15." }),
    A({ prompt: "Hitunglah banyak mobil. Tulis hasilnya.", scene: objs("mobil", 16), parts: [fill("Ada □ mobil.", 16)], explanation: "Hitung satu per satu dan tandai yang sudah dihitung. Ada 16 mobil." }),
    A({ prompt: "Lingkari 10 kepik, lalu tulis banyak semua kepik.", parts: [{ kind: "ring", thing: "kepik", n: 14 }, fill("Ada □ kepik.", 14)], explanation: "Setelah 10 kepik dilingkari, sisanya 4. 10 dan 4 menjadi 14." }),
    A({ prompt: "Warnailah 12 bola dengan warna merah.", parts: [{ kind: "paint", thing: "bola", n: 17, target: 12 }], explanation: "Warnai sambil menghitung: 1, 2, 3, sampai 12. Lima bola tidak diwarnai." }),
  ],
  [
    B({ prompt: "Isilah titik-titik pada ulat.", parts: [{ kind: "seq", look: "ulat", items: [12, 13, null, 15, null] }], explanation: "Hitung maju satu-satu: 12, 13, 14, 15, 16." }),
    B({ prompt: "Isilah titik-titik pada ulat. Ulat ini menghitung mundur.", parts: [{ kind: "seq", look: "ulat", items: [18, 17, null, null] }], explanation: "Hitung mundur satu-satu: 18, 17, 16, 15." }),
    B({ prompt: "Lengkapi urutan bilangan pada es krim.", parts: [{ kind: "seq", look: "eskrim", items: [14, null, 16] }, { kind: "seq", look: "eskrim", items: [19, null, 17] }], explanation: "14, 15, 16 adalah hitung maju. 19, 18, 17 adalah hitung mundur." }),
    B({ prompt: "Lengkapilah urutan bilangan 1 sampai 20.", parts: [{ kind: "seq", look: "tabel", items: [1, 2, null, 4, 5, 6, null, 8, 9, 10, 11, null, 13, null, 15, 16, 17, null, 19, null] }], explanation: "Baca dari kiri ke kanan, baris demi baris. Bilangan yang hilang adalah 3, 7, 12, 14, 18, dan 20." }),
  ],
  [
    C({ prompt: "Isilah tabel. Lengkapi juga nilai tempatnya.", scene: { type: "pv", bundle: "kantong", ones: 4 }, parts: [{ kind: "table", tens: 1, ones: 4 }, fill("Nilai tempat 14 = □ puluhan dan □ satuan", 1, 4)], explanation: "10 kelereng dalam kantong adalah 1 puluhan. 4 kelereng lepas adalah 4 satuan. Jadi 14." }),
    C({ prompt: "Hitunglah dan isi tabelnya.", scene: { type: "pv", bundle: "pensil", ones: 6 }, parts: [{ kind: "table", tens: 1, ones: 6 }, fill("□ puluhan dan □ satuan = □", 1, 6, 16)], explanation: "10 pensil diikat adalah 1 puluhan, 6 pensil adalah 6 satuan. 1 puluhan dan 6 satuan = 16." }),
    C({ prompt: "Tunjukkan 1 puluhan dan 7 satuan. Warnailah lingkaran.", parts: [{ kind: "frames", target: 17 }, { kind: "table", tens: 1, ones: 7 }], explanation: "Warnai semua 10 lingkaran di bingkai pertama (1 puluhan), lalu 7 lingkaran di bingkai kedua (7 satuan). Semuanya 17." }),
    C({ prompt: "Hitunglah dan isi tabelnya.", scene: { type: "pv", bundle: "telur", ones: 2 }, parts: [{ kind: "table", tens: 1, ones: 2 }, fill("□ puluhan dan □ satuan = □", 1, 2, 12)], explanation: "Satu wadah berisi 10 telur adalah 1 puluhan. 2 telur adalah 2 satuan. Jadi 12." }),
  ],
  [
    D({ prompt: "Lingkarilah gambar yang bendanya lebih banyak.", scene: { type: "groups", thing: "kupu", labels: AB, ns: [13, 15], layout: "scatter" }, parts: [{ kind: "pick", label: "Lebih banyak:", options: AB, answer: "Gambar B" }], explanation: "Gambar A ada 13 kupu-kupu, gambar B ada 15. 15 lebih banyak dari 13." }),
    D({ prompt: "Perhatikan gambar berikut.", scene: { type: "groups", thing: "kepik", labels: AB, ns: [12, 16], layout: "rows" }, parts: [more("Kepik di gambar A lebih … dari gambar B.", "sedikit"), more("Kepik di gambar B lebih … dari gambar A.", "banyak")], explanation: "A ada 12 dan B ada 16. 12 lebih sedikit dari 16, dan 16 lebih banyak dari 12." }),
    D({ prompt: "Perhatikan gambar berikut.", scene: { type: "groups", thing: "kelereng", labels: ["Gambar A", "Gambar B", "Gambar C"], ns: [17, 11, 14], layout: "frames" }, parts: [{ kind: "pick", label: "Paling banyak:", options: ["Gambar A", "Gambar B", "Gambar C"], answer: "Gambar A" }, { kind: "pick", label: "Paling sedikit:", options: ["Gambar A", "Gambar B", "Gambar C"], answer: "Gambar B" }], explanation: "Ketiganya punya 1 bingkai penuh. Lihat bingkai kedua: A ada 7, B ada 1, C ada 4. Jadi A paling banyak dan B paling sedikit." }),
    D({ prompt: "Perhatikan bilangan 15, 12, dan 19.", parts: [{ kind: "order", label: "Urutan dari bilangan terkecil", nums: [15, 12, 19], dir: "naik" }, { kind: "order", label: "Urutan dari bilangan terbesar", nums: [15, 12, 19], dir: "turun" }], explanation: "Terkecil 12, lalu 15, lalu 19. Dari terbesar urutannya dibalik: 19, 15, 12." }),
  ],
];

/* ---------- Evaluasi (24 soal: A, B, C, D bergantian) ---------- */
export const assessment: SQuestion[] = [
  A({ level: "Sedang", prompt: "Hitung banyak bola. Tulis hasilnya.", scene: objs("bola", 13, "rows"), parts: [fill("Ada □ bola.", 13)], explanation: "Ada 3 baris bola. Hitung semuanya: ada 13 bola." }),
  B({ level: "Sedang", prompt: "Lengkapi urutan bilangan pada es krim.", parts: [{ kind: "seq", look: "eskrim", items: [14, null, 16, null, null, 19] }], explanation: "Hitung maju satu-satu: 14, 15, 16, 17, 18, 19." }),
  C({ level: "Sedang", prompt: "Hitunglah dan isi tabelnya.", scene: { type: "pv", bundle: "pensil", ones: 5 }, parts: [{ kind: "table", tens: 1, ones: 5 }, fill("Nilai tempat 15 = □ puluhan dan □ satuan", 1, 5)], explanation: "10 pensil diikat adalah 1 puluhan dan 5 pensil adalah 5 satuan. Jadi 15." }),
  D({ level: "Sedang", prompt: "Perhatikan gambar berikut.", scene: { type: "groups", thing: "kepik", labels: AB, ns: [15, 13], layout: "rows" }, parts: [more("Kepik di gambar A lebih … dari gambar B.", "banyak"), more("Kepik di gambar B lebih … dari gambar A.", "sedikit")], explanation: "A ada 15 kepik dan B ada 13. 15 lebih banyak dari 13." }),
  A({ level: "Sedang", prompt: "Isilah titik-titik berikut.", parts: [{ kind: "bond", whole: null, parts: [10, 6], answers: [16] }, fill("10 ditambah 6 menjadi □", 16)], explanation: "10 dan 6 digabung menjadi 16. Sepuluh ditambah enam dibaca enam belas." }),
  B({ level: "Sedang", prompt: "Isilah titik-titik pada ulat.", parts: [{ kind: "seq", look: "ulat", items: [15, 16, null, 18, null] }], explanation: "Hitung maju: 15, 16, 17, 18, 19." }),
  C({ level: "Sedang", prompt: "Hitunglah dan isi tabelnya.", scene: { type: "pv", bundle: "telur", ones: 7 }, parts: [{ kind: "table", tens: 1, ones: 7 }, fill("□ puluhan dan □ satuan = □", 1, 7, 17)], explanation: "Satu wadah 10 telur adalah 1 puluhan dan 7 telur adalah 7 satuan. Jadi 17." }),
  D({ level: "Sedang", prompt: "Perhatikan bilangan 17, 11, dan 14.", parts: [{ kind: "order", label: "Urutan dari bilangan terkecil", nums: [17, 11, 14], dir: "naik" }, { kind: "order", label: "Urutan dari bilangan terbesar", nums: [17, 11, 14], dir: "turun" }], explanation: "Terkecil 11, lalu 14, lalu 17. Dari terbesar: 17, 14, 11." }),

  A({ level: "Menantang", prompt: "Tariklah garis. Temukan pasangannya.", parts: [{ kind: "match", thing: "kelereng", left: [18, 11, 16, 14], right: [11, 14, 16, 18] }], explanation: "Bingkai pertama selalu 10. Bingkai kedua berisi 8, 1, 6, dan 4. Jadi 18, 11, 16, dan 14." }),
  B({ level: "Menantang", prompt: "Lengkapi urutan bilangan pada es krim. Es krim ini menghitung mundur.", parts: [{ kind: "seq", look: "eskrim", items: [20, null, 18, 17, null, null] }], explanation: "Hitung mundur: 20, 19, 18, 17, 16, 15." }),
  C({ level: "Menantang", prompt: "Tunjukkan 1 puluhan dan 5 satuan. Warnailah lingkaran.", parts: [{ kind: "frames", target: 15 }, fill("□ puluhan dan □ satuan = □", 1, 5, 15)], explanation: "Bingkai pertama penuh 10 adalah 1 puluhan. 5 lingkaran di bingkai kedua adalah 5 satuan. Jadi 15." }),
  D({ level: "Menantang", prompt: "Lingkarilah gambar yang bendanya lebih banyak.", scene: { type: "groups", thing: "apel", labels: AB, ns: [14, 16], layout: "scatter", spread: [1.5, 0.75] }, parts: [{ kind: "pick", label: "Lebih banyak:", options: AB, answer: "Gambar B" }], explanation: "Gambar A terlihat luas karena apelnya berjauhan, tetapi hanya ada 14. Gambar B ada 16. Hitung, jangan menebak dari luasnya." }),
  A({ level: "Menantang", prompt: "Lingkari 10 pensil, lalu tulis banyak semua pensil.", parts: [{ kind: "ring", thing: "pensil", n: 17 }, fill("Ada □ pensil.", 17)], explanation: "10 pensil dilingkari, sisanya 7. 10 dan 7 menjadi 17." }),
  B({ level: "Menantang", prompt: "Lengkapilah urutan bilangan 1 sampai 20.", parts: [{ kind: "seq", look: "tabel", items: [null, 2, 3, null, 5, 6, 7, null, 9, null, 11, null, null, 14, 15, 16, null, 18, null, 20] }], explanation: "Bilangan yang hilang adalah 1, 4, 8, 10, 12, 13, 17, dan 19. Setiap kotak bertambah 1 dari kotak sebelumnya." }),
  C({ level: "Menantang", prompt: "Isilah titik-titik berikut.", parts: [{ kind: "bond", whole: null, parts: [8, null], answers: [18, 10] }, fill("8 ditambah 10 menjadi □", 18)], explanation: "8 ditambah 1 puluhan menjadi 18. Jadi pasangannya 8 dan 10, gabungannya 18." }),
  D({ level: "Menantang", prompt: "Dina punya 12 bola. Beni punya 15 bola. Sari punya 11 bola.", parts: [{ kind: "pick", label: "Paling banyak:", options: ["Dina", "Beni", "Sari"], answer: "Beni" }, { kind: "pick", label: "Paling sedikit:", options: ["Dina", "Beni", "Sari"], answer: "Sari" }, fill("Urutan dari yang terkecil: □, □, □", 11, 12, 15)], explanation: "15 paling besar, jadi Beni paling banyak. 11 paling kecil, jadi Sari paling sedikit. Urutan dari terkecil: 11, 12, 15." }),
  A({ level: "Menantang", prompt: "Tebak dulu banyak kelereng di stoples, lalu hitung.", scene: { type: "jar", thing: "kelereng", n: 15 }, parts: [{ kind: "guess", answer: 15 }], explanation: "Tebakan boleh berapa saja. Setelah dihitung, ada 15 kelereng. Tebakan yang dekat 15 sudah bagus." }),

  B({ level: "Sangat menantang", prompt: "Ulat ini melangkah 2-2. Isilah titik-titiknya.", parts: [{ kind: "seq", look: "ulat", items: [12, 14, null, 18, null] }], explanation: "Setiap langkah bertambah 2: 12, 14, 16, 18, 20." }),
  C({ level: "Sangat menantang", prompt: "Hitunglah kelereng pada bingkai, lalu isi tabelnya.", scene: objs("kelereng", 19, "frames"), parts: [{ kind: "table", tens: 1, ones: 9 }, fill("□ puluhan dan □ satuan = □", 1, 9, 19)], explanation: "Bingkai pertama penuh 10, jadi 1 puluhan. Bingkai kedua ada 9 kelereng, jadi 9 satuan. Semuanya 19." }),
  D({ level: "Sangat menantang", prompt: "Ani punya 16 kelereng. Budi punya 2 lebih banyak dari Ani. Cici punya 3 lebih sedikit dari Ani.", parts: [fill("Budi punya □ kelereng. Cici punya □ kelereng.", 18, 13), fill("Urutan dari yang terkecil: □, □, □", 13, 16, 18)], explanation: "Budi: maju 2 dari 16 menjadi 18. Cici: mundur 3 dari 16 menjadi 13. Urutan dari terkecil: 13, 16, 18." }),
  A({ level: "Sangat menantang", prompt: "Warnailah 18 bola dengan warna merah.", parts: [{ kind: "paint", thing: "bola", n: 20, target: 18 }], explanation: "Cara cepat: dari 20 bola, sisakan 2 yang tidak diwarnai. Jadi ada 18 bola merah." }),
  B({ level: "Sangat menantang", prompt: "Ulat ini menghitung mundur 2-2. Isilah titik-titiknya.", parts: [{ kind: "seq", look: "ulat", items: [20, 18, null, null, 12] }], explanation: "Setiap langkah berkurang 2: 20, 18, 16, 14, 12." }),
  C({ level: "Sangat menantang", prompt: "Tunjukkan 20 dengan mewarnai lingkaran. Lalu isi tabelnya.", parts: [{ kind: "frames", target: 20 }, { kind: "table", tens: 2, ones: 0 }], explanation: "Kedua bingkai penuh, masing-masing 10. Jadi 20 = 2 puluhan dan 0 satuan." }),
  D({ level: "Sangat menantang", prompt: "Perhatikan gambar berikut.", scene: { type: "groups", thing: "kelereng", labels: AB, ns: [18, 19], layout: "frames" }, parts: [more("Kelereng di gambar A lebih … dari gambar B.", "sedikit"), more("Kelereng di gambar B lebih … dari gambar A.", "banyak")], explanation: "Kedua bingkai pertama penuh. Bingkai kedua A ada 8, B ada 9. Jadi A 18 lebih sedikit dari B 19." }),
];
