// Kelas 6 Bab 4: Peluang (Matematika SD/MI Kelas VI, Kemendikbudristek 2022).
// A. Skala Peluang, B. Membandingkan Peluang Kejadian (dalam permainan dan sehari-hari).
import type { Question } from "./grade-four-whole-numbers";

/* ---------- Skala peluang ---------- */
export const CATS = ["Tidak mungkin", "Kurang mungkin", "Mungkin", "Sangat mungkin", "Pasti"] as const;
export type Cat = 0 | 1 | 2 | 3 | 4;
/** Patokan bab ini: 0 bagian = tidak mungkin, kurang dari setengah = kurang mungkin, tepat setengah = mungkin, lebih dari setengah = sangat mungkin, semua = pasti. */
export const catOf = (k: number, n: number): Cat => (k <= 0 ? 0 : k >= n ? 4 : 2 * k < n ? 1 : 2 * k === n ? 2 : 3);
/** a/b dibanding c/d: 1 jika a/b lebih besar, -1 jika lebih kecil, 0 jika sama. */
export const cmp = (a: number, b: number, c: number, d: number) => Math.sign(a * d - c * b);

/* ---------- Benda ---------- */
export type Ball = "merah" | "biru" | "kuning" | "hijau" | "oranye" | "ungu" | "putih" | "hitam";
export const BALL: Record<Ball, string> = { merah: "#e5484d", biru: "#3a86d4", kuning: "#f5c518", hijau: "#4caf50", oranye: "#f08a24", ungu: "#8e5bc4", putih: "#f4f1ea", hitam: "#2b2b2b" };
export type Item = "kotak pensil" | "buku bacaan" | "pensil" | "piring" | "boneka";
export type DieKind = "kubus" | "oktahedron" | "piramida";
export type Die = { kind: DieKind; faces: number[]; label?: string };
export const sides: Record<DieKind, number> = { kubus: 6, oktahedron: 8, piramida: 4 };
export type Sector = { color: Ball; label?: string };

/* ---------- Gambar soal ---------- */
export type Scene =
  | { type: "bags"; bags: { label?: string; balls: [Ball, number][] }[] }
  | { type: "dice"; dice: Die[] }
  | { type: "spinners"; spinners: { label?: string; sectors: Sector[] }[] }
  | { type: "boxes"; boxes: { label: string; items: [Item, number][] }[] }
  | { type: "candies"; candies: [Ball, number][] }
  | { type: "coin" }
  | { type: "table"; title: string; head: string[]; row: (string | number)[] }
  | { type: "players"; players: { name: string; tool: "koin" | "dadu" | "2 dadu"; win: string }[] }
  /** Skala peluang yang sudah terisi (untuk soal menebak isi). */
  | { type: "scale"; marks: { label: string; color?: Ball; cat: Cat }[]; note?: string }
  | { type: "shirts"; colors: Ball[]; total: number }
  | { type: "books"; books: [Ball, number][] }
  | { type: "spinbag"; sectors: Sector[]; bag: [Ball, number][] };

/* ---------- Bagian jawaban ---------- */
/** Aturan isi: setiap kunci harus jatuh di kategori tertentu, hanya kunci yang disebut boleh dipakai, dan urutan banyak tertentu. */
export type Rules = { cats: [string, Cat][]; only?: string[]; more?: [string, string][]; min?: [string, number][]; need?: string[]; most?: string; least?: string };
export type Visual = { bag: [Ball, number][] } | { die: Die } | { spinner: Sector[] };
export type Part =
  | { kind: "fill"; text: string; answers: number[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "pick"; label: string; options: Visual[]; answer: number }
  /** Letakkan setiap kejadian pada skala peluang. */
  | { kind: "scale"; items: { label: string; color?: Ball }[]; answer: Cat[] }
  /** Isi angka pada sisi-sisi dadu. */
  | { kind: "die"; dieKind: DieKind; values: number[]; rules: Rules; key: number[] }
  /** Atur banyak bola atau benda tiap warna. */
  | { kind: "bag"; total: number; colors: Ball[]; noun: string; rules: Rules; key: number[] }
  /** Warnai bagian roda putar. */
  | { kind: "spin"; n: number; colors: Ball[]; rules: Rules; key: Ball[] };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type PQuestion = Question & { topic: number; section: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const fieldCount = (p: Part) => (p.kind === "fill" ? p.answers.length : p.kind === "scale" ? p.items.length : p.kind === "die" ? sides[p.dieKind] : p.kind === "bag" ? p.colors.length : p.kind === "spin" ? p.n : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replaceAll(".", "").replace(",", ".")));
export const tally = (xs: string[]) => xs.reduce<Record<string, number>>((m, k) => { if (k) m[k] = (m[k] ?? 0) + 1; return m; }, {});
/** Periksa banyak tiap kunci terhadap aturan. */
export function meets(count: Record<string, number>, total: number, r: Rules) {
  const got = (k: string) => count[k] ?? 0;
  if (Object.values(count).reduce((a, b) => a + b, 0) !== total) return false;
  if (r.only && Object.keys(count).some(k => got(k) > 0 && !r.only!.includes(k))) return false;
  if (!r.cats.every(([k, c]) => catOf(got(k), total) === c)) return false;
  if (r.more && !r.more.every(([a, b]) => got(a) > got(b))) return false;
  if (r.min && !r.min.every(([k, m]) => got(k) >= m)) return false;
  if (r.need && !r.need.every(k => got(k) > 0)) return false;
  const used = Object.keys(count).filter(k => got(k) > 0);
  if (r.most && !used.every(k => k === r.most || got(r.most!) > got(k))) return false;
  if (r.least && (got(r.least) === 0 || !used.every(k => k === r.least || got(r.least!) < got(k)))) return false;
  return true;
}
const countsOf = (p: Extract<Part, { kind: "bag" }>, x: string[]) => Object.fromEntries(p.colors.map((c, i) => [c, Number(x[i]) || 0]));
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "choice": return p.answer;
    case "pick": return String(p.answer);
    case "scale": return p.answer.join("|");
    case "die": case "bag": case "spin": return p.key.join("|");
  }
}
export function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "fill": return p.answers.every((w, i) => num(x[i]) === w);
    case "choice": return v === p.answer;
    case "pick": return v === String(p.answer);
    case "scale": return p.answer.every((c, i) => x[i] === String(c));
    case "die": return x.every(f => f !== "") && meets(tally(x), x.length, p.rules);
    case "bag": return meets(countsOf(p, x), p.total, p.rules);
    case "spin": return x.every(f => f !== "") && meets(tally(x), p.n, p.rules);
  }
}
export function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "fill": case "scale": case "die": case "spin": return x.every(s => s.trim() !== "");
    case "bag": return x.some(s => Number(s) > 0);
    default: return v !== "";
  }
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: PQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: PQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: PQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "pick": return `${p.label} ${v[i] ? `gambar ${"ABCD"[Number(v[i])]}` : "…"}`;
      case "scale": return p.items.map((it, k) => `${it.label}: ${x[k] ? CATS[Number(x[k])].toLowerCase() : "…"}`).join(", ");
      case "die": return `sisi dadu ${x.map(f => f || "…").join(", ")}`;
      case "bag": return p.colors.map((c, k) => `${c} ${x[k] || 0}`).join(", ");
      case "spin": return `roda: ${Object.entries(tally(x)).map(([c, n]) => `${c} ${n}`).join(", ") || "…"} bagian`;
    }
  }).join(" | ");
}

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Skala Peluang", short: "Skala peluang", sections: [
    { title: "Menyusun skala peluang", lab: "bag", steps: ["Peluang adalah ukuran seberapa mungkin suatu kejadian terjadi.", "Skala peluang punya lima kategori: tidak mungkin, kurang mungkin, mungkin, sangat mungkin, dan pasti.", "Patokan di sini: tidak ada sama sekali = tidak mungkin, kurang dari setengah = kurang mungkin, tepat setengah = mungkin, lebih dari setengah = sangat mungkin, semuanya = pasti."], example: "Rak berisi 6 buku merah, 3 putih, dan 1 kuning (10 buku). Mengambil buku merah: 6 dari 10, lebih dari setengah, jadi sangat mungkin. Buku hitam: tidak mungkin.", demo: "Atur banyak bola tiap warna di dalam tas, lalu lihat letak setiap warna pada skala peluang." },
    { title: "Membaca skala peluang", lab: "die", steps: ["Skala peluang juga bisa dibaca terbalik: dari letak kejadian, kita menebak isinya.", "Jika suatu angka pasti muncul, semua sisi dadu berisi angka itu. Jika tidak mungkin, angka itu tidak ada di dadu.", "Jika tepat di mungkin, angka itu ada di setengah dari semua sisi. Sering ada lebih dari satu jawaban benar."], example: "Dadu 6 sisi: 2, 2, 3, 3, 3, 4. Angka 3 ada di 3 sisi dari 6, tepat setengah, jadi mungkin. Angka 5 tidak mungkin.", demo: "Ketuk sisi dadu untuk mengganti angkanya, lalu pilih angka yang ingin dilihat letaknya pada skala." },
  ] },
  { code: "B", title: "Membandingkan Peluang Kejadian", short: "Membandingkan peluang", sections: [
    { title: "Peluang dalam permainan", lab: "game", steps: ["Peluang menang = banyak hasil yang membuat menang dari semua hasil yang mungkin.", "Koin punya 2 sisi: peluang sisi garuda 1 dari 2. Dadu punya 6 sisi: peluang angka 6 hanya 1 dari 6.", "Permainan adil jika peluang menang setiap pemain sama. Jika tidak sama, permainan kurang adil."], example: "Pemain 1 menang jika dadunya 3, pemain 2 menang jika dadunya 6. Peluang keduanya 1 dari 6, jadi adil.", demo: "Pilih alat dan syarat menang setiap pemain, bandingkan peluangnya, lalu coba lempar 12 kali." },
    { title: "Peluang dalam kejadian sehari-hari", lab: "boxes", steps: ["Untuk memilih, bandingkan peluang setiap pilihan, bukan hanya banyak bendanya.", "Jika jumlah semua benda sama, pilih yang bendanya lebih banyak. Jika jumlahnya berbeda, bandingkan sebagai pecahan.", "Peluang lebih besar tidak berarti pasti. Kita hanya lebih mungkin mendapatkannya."], example: "Kotak A: 4 bola biru dari 7. Kotak B: 3 bola biru dari 7. Kotak A lebih mungkin memberi bola biru.", demo: "Atur isi dua kotak hadiah, lalu lihat kotak mana yang peluang mendapatkan piringnya lebih besar." },
  ] },
];

/* ---------- Pembuat soal ---------- */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number, section: number) => (s: Spec): PQuestion => ({ ...s, topic, section, answer: answerKey(s.parts) });
const A1 = make(0, 0), A2 = make(0, 1), B1 = make(1, 0), B2 = make(1, 1);
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const choice = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });
const pick = (label: string, options: Visual[], answer: number): Part => ({ kind: "pick", label, options, answer });
const scale = (items: { label: string; color?: Ball }[], answer: Cat[]): Part => ({ kind: "scale", items, answer });
const cube = (...faces: number[]): Die => ({ kind: "kubus", faces });
const wheel = (...xs: [Ball, number, string?][]) => xs.flatMap(([c, n, l]) => Array.from({ length: n }, () => ({ color: c, label: l })));

/* ---------- Latihan (4 soal per bagian, 8 per subtopik) ---------- */
const sets: PQuestion[][] = [
  [
    A1({ prompt: "Satu bola diambil acak dari tas. Letakkan setiap kejadian pada skala peluang.", scene: { type: "bags", bags: [{ balls: [["hijau", 5], ["oranye", 3], ["biru", 2]] }] }, parts: [scale([{ label: "Bola hijau", color: "hijau" }, { label: "Bola oranye", color: "oranye" }, { label: "Bola merah", color: "merah" }], [2, 1, 0])], explanation: "Ada 10 bola. Hijau 5 dari 10, tepat setengah: mungkin. Oranye 3 dari 10: kurang mungkin. Tidak ada bola merah: tidak mungkin." }),
    A1({ prompt: "Dadu 6 sisi ini dilempar sekali. Letakkan setiap kejadian pada skala peluang.", scene: { type: "dice", dice: [cube(2, 2, 3, 3, 3, 4)] }, parts: [scale([{ label: "Angka 3" }, { label: "Angka 2" }, { label: "Angka 5" }, { label: "Angka kurang dari 5" }], [2, 1, 0, 4])], explanation: "Angka 3 ada di 3 dari 6 sisi: mungkin. Angka 2 di 2 sisi: kurang mungkin. Tidak ada angka 5: tidak mungkin. Semua angkanya kurang dari 5: pasti." }),
    A1({ prompt: "Dadu 8 sisi ini dilempar sekali. Letakkan setiap kejadian pada skala peluang.", scene: { type: "dice", dice: [{ kind: "oktahedron", faces: [5, 5, 5, 5, 5, 5, 5, 5] }] }, parts: [scale([{ label: "Angka 5" }, { label: "Angka 1" }, { label: "Angka ganjil" }], [4, 0, 4])], explanation: "Semua sisi berangka 5, jadi angka 5 pasti dan angka 1 tidak mungkin. 5 adalah bilangan ganjil, jadi angka ganjil juga pasti." }),
    A1({ prompt: "Satu desa dipilih acak dari data bencana ini.", scene: { type: "table", title: "Banyak desa yang mengalami bencana", head: ["Tanah longsor", "Banjir", "Gempa bumi", "Tsunami"], row: [133, 567, 556, 0] }, parts: [choice("Paling mungkin:", ["Tanah longsor", "Banjir", "Gempa bumi", "Tsunami"], "Banjir"), choice("Tidak mungkin menurut data:", ["Tanah longsor", "Banjir", "Gempa bumi", "Tsunami"], "Tsunami")], explanation: "Banjir tercatat paling banyak (567 desa), sedikit di atas gempa bumi (556). Tsunami tercatat 0, jadi menurut data ini tidak mungkin." }),
  ],
  [
    A2({ prompt: "Skala peluang mengambil 1 bola dari tas berisi 8 bola. Tas mana yang cocok?", scene: { type: "scale", marks: [{ label: "Merah", color: "merah", cat: 3 }, { label: "Biru", color: "biru", cat: 1 }, { label: "Kuning", color: "kuning", cat: 0 }] }, parts: [pick("Tasnya:", [{ bag: [["merah", 4], ["biru", 4]] }, { bag: [["merah", 6], ["biru", 2]] }, { bag: [["merah", 5], ["biru", 2], ["kuning", 1]] }, { bag: [["merah", 2], ["biru", 6]] }], 1)], explanation: "Merah sangat mungkin: lebih dari 4 dari 8. Biru kurang mungkin: kurang dari 4. Kuning tidak mungkin: tidak ada kuning. Hanya tas B (6 merah, 2 biru)." }),
    A2({ prompt: "Isi sisi dadu agar sesuai skala. Dadu hanya berisi angka 2 dan 6.", scene: { type: "scale", marks: [{ label: "Angka 2", cat: 3 }, { label: "Angka 6", cat: 1 }] }, parts: [{ kind: "die", dieKind: "kubus", values: [2, 6], rules: { cats: [["2", 3], ["6", 1]], only: ["2", "6"] }, key: [2, 2, 2, 2, 6, 6] }], explanation: "Angka 2 harus lebih dari 3 sisi (4 atau 5 sisi), angka 6 sisanya (2 atau 1 sisi). Misalnya 2, 2, 2, 2, 6, 6." }),
    A2({ prompt: "Tas berisi 10 bola. Bola merah mungkin (tepat setengah), bola biru dan hijau kurang mungkin, dan bola kuning tidak mungkin. Atur banyak bolanya.", scene: { type: "scale", marks: [{ label: "Merah", color: "merah", cat: 2 }, { label: "Biru", color: "biru", cat: 1 }, { label: "Hijau", color: "hijau", cat: 1 }, { label: "Kuning", color: "kuning", cat: 0 }] }, parts: [{ kind: "bag", total: 10, colors: ["merah", "biru", "hijau", "kuning"], noun: "bola", rules: { cats: [["merah", 2], ["biru", 1], ["hijau", 1], ["kuning", 0]] }, key: [5, 3, 2, 0] }], explanation: "Merah tepat setengah dari 10, yaitu 5. Sisa 5 bola dibagi untuk biru dan hijau, masing-masing paling sedikit 1, misalnya 3 dan 2. Kuning 0." }),
    A2({ prompt: "Roda putar dibagi 8 bagian sama besar. Menurut skala, mendapatkan warna biru adalah pasti.", scene: { type: "scale", marks: [{ label: "Biru", color: "biru", cat: 4 }] }, parts: [fill("Bagian biru □ dari 8, bagian warna lain □", 8, 0)], explanation: "Pasti berarti semua bagian roda berwarna biru: 8 dari 8. Tidak ada warna lain." }),
  ],
  [
    B1({ prompt: "Koin Rp500 dilempar sekali.", scene: { type: "coin" }, parts: [fill("Sisi garuda □ dari □, sisi angka □ dari □", 1, 2, 1, 2), choice("Peluang kedua sisi:", ["Sama", "Berbeda"], "Sama")], explanation: "Koin hanya punya 2 sisi. Peluang sisi garuda 1 dari 2 dan sisi angka 1 dari 2, jadi sama." }),
    B1({ prompt: "Kelas memilih ketua dengan roda putar ini.", scene: { type: "spinners", spinners: [{ sectors: wheel(["merah", 3, "Reimon"], ["biru", 2, "Abdillah"], ["kuning", 2, "Maryam"], ["hijau", 1, "Tuti"]) }] }, parts: [choice("Peluang terbesar:", ["Reimon", "Abdillah", "Maryam", "Tuti"], "Reimon"), choice("Roda ini:", ["Adil", "Kurang adil"], "Kurang adil")], explanation: "Reimon punya 3 dari 8 bagian, Abdillah dan Maryam 2, Tuti 1. Bagiannya tidak sama, jadi kurang adil." }),
    B1({ prompt: "Dua pemain masing-masing melempar 1 dadu. Apakah permainan ini adil?", scene: { type: "players", players: [{ name: "Pemain 1", tool: "dadu", win: "angka 3" }, { name: "Pemain 2", tool: "dadu", win: "angka 6" }] }, parts: [choice("Permainan ini:", ["Adil", "Kurang adil, pemain 1 lebih besar", "Kurang adil, pemain 2 lebih besar"], "Adil")], explanation: "Angka 3 dan angka 6 masing-masing ada di 1 dari 6 sisi. Peluang keduanya sama, jadi adil." }),
    B1({ prompt: "Tiga pemain bergiliran melempar 1 dadu.", scene: { type: "players", players: [{ name: "Pemain 1", tool: "dadu", win: "angka 4" }, { name: "Pemain 2", tool: "dadu", win: "angka 1 atau 5" }, { name: "Pemain 3", tool: "dadu", win: "angka 2, 3, atau 6" }] }, parts: [choice("Peluang terbesar:", ["Pemain 1", "Pemain 2", "Pemain 3"], "Pemain 3"), fill("Pemain 3 menang □ dari 6", 3)], explanation: "Pemain 1: 1 dari 6. Pemain 2: 2 dari 6. Pemain 3: 3 dari 6. Pemain 3 paling besar, jadi permainan kurang adil." }),
  ],
  [
    B2({ prompt: "Satu permen diambil acak dari kantong. Warna apa yang paling mungkin dan paling kecil peluangnya?", scene: { type: "candies", candies: [["merah", 3], ["kuning", 1], ["oranye", 1], ["ungu", 2]] }, parts: [choice("Paling mungkin:", ["Merah", "Kuning", "Oranye", "Ungu"], "Merah"), fill("Peluang merah □ dari □", 3, 7)], explanation: "Ada 7 permen: 3 merah, 2 ungu, 1 kuning, 1 oranye. Merah paling banyak, peluangnya 3 dari 7." }),
    B2({ prompt: "Ibu ingin mendapatkan piring (bola biru). Kotak mana yang sebaiknya dipilih?", scene: { type: "bags", bags: [{ label: "Kotak Mantap", balls: [["biru", 4], ["putih", 3]] }, { label: "Kotak Spektakuler", balls: [["biru", 3], ["putih", 4]] }] }, parts: [choice("Pilih:", ["Kotak Mantap", "Kotak Spektakuler"], "Kotak Mantap")], explanation: "Jumlah bola sama-sama 7. Kotak Mantap punya 4 bola biru, lebih banyak daripada 3, jadi peluangnya lebih besar." }),
    B2({ prompt: "Setiap anak mengambil satu barang acak dari salah satu kotak.", scene: { type: "boxes", boxes: [{ label: "Kotak 1", items: [["kotak pensil", 2], ["pensil", 4], ["buku bacaan", 6]] }, { label: "Kotak 2", items: [["kotak pensil", 4], ["pensil", 4], ["buku bacaan", 2]] }] }, parts: [choice("Ingin buku bacaan:", ["Kotak 1", "Kotak 2"], "Kotak 1"), choice("Ingin kotak pensil:", ["Kotak 1", "Kotak 2"], "Kotak 2")], explanation: "Kotak 1 berisi 12 barang: buku 6 dari 12 (setengah), kotak pensil 2 dari 12. Kotak 2 berisi 10 barang: buku 2 dari 10, kotak pensil 4 dari 10." }),
    B2({ prompt: "Ibu memilih Kotak Mantap (4 bola biru dari 7) agar mendapat piring. Apakah Ibu pasti mendapatkan piring?", scene: { type: "bags", bags: [{ label: "Kotak Mantap", balls: [["biru", 4], ["putih", 3]] }] }, parts: [choice("Jawaban:", ["Ya, pasti mendapat piring", "Tidak pasti, hanya lebih mungkin", "Tidak mungkin mendapat piring"], "Tidak pasti, hanya lebih mungkin")], explanation: "Masih ada 3 bola putih. Peluang biru 4 dari 7, lebih dari setengah (sangat mungkin), tetapi belum pasti." }),
  ],
];

export const practice: PQuestion[][] = [[...sets[0], ...sets[1]], [...sets[2], ...sets[3]]];

/* ---------- Evaluasi (24 soal) ---------- */
const shirts: Ball[] = ["hijau", "hitam", "biru", "merah"];
export const assessment: PQuestion[] = [
  A1({ level: "Sedang", prompt: "Satu bola diambil acak dari tas. Letakkan setiap kejadian pada skala peluang.", scene: { type: "bags", bags: [{ balls: [["merah", 6], ["biru", 4], ["kuning", 2]] }] }, parts: [scale([{ label: "Bola merah", color: "merah" }, { label: "Bola biru", color: "biru" }, { label: "Bola hijau", color: "hijau" }], [2, 1, 0])], explanation: "Ada 12 bola. Merah 6 dari 12, tepat setengah: mungkin. Biru 4 dari 12: kurang mungkin. Tidak ada hijau: tidak mungkin." }),
  B1({ level: "Sedang", prompt: "Dika menang jika koinnya menunjukkan sisi garuda. Sari menang jika dadunya menunjukkan angka 6.", scene: { type: "players", players: [{ name: "Dika", tool: "koin", win: "sisi garuda" }, { name: "Sari", tool: "dadu", win: "angka 6" }] }, parts: [fill("Peluang Sari □ dari □", 1, 6), choice("Peluang lebih besar:", ["Sari", "Sama besar", "Dika"], "Dika")], explanation: "Dika: 1 dari 2 (setengah). Sari: 1 dari 6. Setengah lebih besar daripada seperenam, jadi Dika lebih besar peluangnya." }),
  A2({ level: "Sedang", prompt: "Skala peluang mengambil 1 bola dari tas berisi 10 bola. Tas mana yang cocok?", scene: { type: "scale", marks: [{ label: "Hijau", color: "hijau", cat: 2 }, { label: "Oranye", color: "oranye", cat: 1 }, { label: "Ungu", color: "ungu", cat: 1 }] }, parts: [pick("Tasnya:", [{ bag: [["hijau", 6], ["oranye", 2], ["ungu", 2]] }, { bag: [["hijau", 4], ["oranye", 3], ["ungu", 3]] }, { bag: [["hijau", 5], ["oranye", 5]] }, { bag: [["hijau", 5], ["oranye", 3], ["ungu", 2]] }], 3)], explanation: "Hijau mungkin: tepat 5 dari 10. Oranye dan ungu kurang mungkin: keduanya ada, tetapi kurang dari 5. Hanya tas D (5, 3, 2)." }),
  B2({ level: "Sedang", prompt: "Hadiah piring diwakili bola biru. Kotak mana yang peluang mendapatkan piringnya lebih besar?", scene: { type: "bags", bags: [{ label: "Kotak A", balls: [["biru", 5], ["putih", 4]] }, { label: "Kotak B", balls: [["biru", 4], ["putih", 5]] }] }, parts: [choice("Pilih:", ["Kotak B", "Kotak A", "Sama besar"], "Kotak A")], explanation: "Kedua kotak berisi 9 bola. Kotak A punya 5 bola biru dan kotak B 4, jadi kotak A lebih besar peluangnya." }),
  A1({ level: "Sedang", prompt: "Dadu 6 sisi ini dilempar sekali. Letakkan setiap kejadian pada skala peluang.", scene: { type: "dice", dice: [cube(1, 1, 1, 1, 4, 4)] }, parts: [scale([{ label: "Angka 1" }, { label: "Angka 4" }, { label: "Angka 6" }, { label: "Angka kurang dari 5" }], [3, 1, 0, 4])], explanation: "Angka 1 di 4 dari 6 sisi: sangat mungkin. Angka 4 di 2 sisi: kurang mungkin. Tidak ada angka 6. Semua angkanya kurang dari 5: pasti." }),
  B1({ level: "Sedang", prompt: "Roda putar ini dipakai untuk mengundi siapa yang bercerita lebih dulu.", scene: { type: "spinners", spinners: [{ sectors: wheel(["merah", 2, "Dika"], ["biru", 2, "Lia"], ["kuning", 2, "Andi"], ["hijau", 2, "Sari"]) }] }, parts: [fill("Peluang Dika □ bagian dari □ bagian", 2, 8), choice("Roda ini:", ["Adil", "Kurang adil"], "Adil")], explanation: "Setiap nama mendapat 2 dari 8 bagian. Peluangnya sama, jadi adil." }),
  A2({ level: "Sedang", prompt: "Tas berisi 10 bola merah dan kuning saja. Bola merah mungkin (tepat setengah), bola biru tidak mungkin.", scene: { type: "scale", marks: [{ label: "Merah", color: "merah", cat: 2 }, { label: "Biru", color: "biru", cat: 0 }] }, parts: [fill("Merah □ bola, kuning □ bola", 5, 5)], explanation: "Tepat setengah dari 10 adalah 5 bola merah. Sisanya 10 − 5 = 5 bola kuning. Biru tidak ada." }),
  B2({ level: "Sedang", prompt: "Satu permen diambil acak dari kantong.", scene: { type: "candies", candies: [["merah", 4], ["kuning", 2], ["hijau", 3], ["ungu", 1]] }, parts: [choice("Paling mungkin:", ["Kuning", "Hijau", "Merah", "Ungu"], "Merah"), choice("Paling kecil peluangnya:", ["Kuning", "Hijau", "Merah", "Ungu"], "Ungu")], explanation: "Ada 10 permen: merah 4, hijau 3, kuning 2, ungu 1. Merah paling mungkin dan ungu paling kecil peluangnya." }),

  A1({ level: "Menantang", prompt: "Roda putar ini diputar sekali. Letakkan setiap kejadian pada skala peluang.", scene: { type: "spinners", spinners: [{ sectors: wheel(["merah", 4], ["biru", 3], ["kuning", 1]) }] }, parts: [scale([{ label: "Merah", color: "merah" }, { label: "Biru", color: "biru" }, { label: "Hijau", color: "hijau" }, { label: "Bukan hijau" }], [2, 1, 0, 4])], explanation: "Ada 8 bagian. Merah 4 dari 8: mungkin. Biru 3 dari 8: kurang mungkin. Tidak ada hijau, jadi tidak mungkin, dan bukan hijau pasti." }),
  B1({ level: "Menantang", prompt: "Tiga pemain bergiliran melempar 1 dadu.", scene: { type: "players", players: [{ name: "Pemain 1", tool: "dadu", win: "angka 2 atau 5" }, { name: "Pemain 2", tool: "dadu", win: "angka 6" }, { name: "Pemain 3", tool: "dadu", win: "angka 1, 3, atau 4" }] }, parts: [choice("Peluang terbesar:", ["Pemain 1", "Pemain 2", "Pemain 3"], "Pemain 3"), choice("Permainan ini:", ["Adil", "Kurang adil"], "Kurang adil")], explanation: "Pemain 1: 2 dari 6. Pemain 2: 1 dari 6. Pemain 3: 3 dari 6. Peluangnya tidak sama, jadi kurang adil." }),
  A2({ level: "Menantang", prompt: "Isi sisi dadu agar sesuai skala. Dadu hanya berisi angka 3 dan 5.", scene: { type: "scale", marks: [{ label: "Angka 3", cat: 3 }, { label: "Angka 5", cat: 1 }] }, parts: [{ kind: "die", dieKind: "kubus", values: [3, 5], rules: { cats: [["3", 3], ["5", 1]], only: ["3", "5"] }, key: [3, 3, 3, 3, 3, 5] }], explanation: "Angka 3 harus di lebih dari 3 sisi (4 atau 5 sisi). Angka 5 ada, tetapi kurang dari 3 sisi (1 atau 2 sisi)." }),
  B2({ level: "Menantang", prompt: "Setiap anak mengambil satu barang acak dari salah satu kotak.", scene: { type: "boxes", boxes: [{ label: "Kotak X", items: [["kotak pensil", 5], ["buku bacaan", 10], ["pensil", 6]] }, { label: "Kotak Y", items: [["kotak pensil", 4], ["buku bacaan", 3], ["pensil", 4]] }] }, parts: [choice("Ingin kotak pensil:", ["Kotak X", "Kotak Y"], "Kotak Y"), choice("Ingin buku bacaan:", ["Kotak X", "Kotak Y"], "Kotak X")], explanation: "Kotak X berisi 21 barang: kotak pensil 5 dari 21, buku 10 dari 21 (hampir setengah). Kotak Y berisi 11 barang: kotak pensil 4 dari 11 (lebih dari sepertiga), buku 3 dari 11." }),
  A1({ level: "Menantang", prompt: "Satu desa dipilih acak dari data bencana di 1.200 desa ini.", scene: { type: "table", title: "Banyak desa yang mengalami bencana", head: ["Banjir", "Gempa bumi", "Tanah longsor", "Gunung meletus"], row: [540, 498, 162, 0] }, parts: [choice("Paling mungkin:", ["Gempa bumi", "Tanah longsor", "Banjir", "Gunung meletus"], "Banjir"), choice("Tanah longsor pada skala:", ["Tidak mungkin", "Kurang mungkin", "Mungkin"], "Kurang mungkin")], explanation: "Banjir 540 desa, paling banyak. Tanah longsor 162 dari 1.200, jauh kurang dari setengah, jadi kurang mungkin." }),
  B1({ level: "Menantang", prompt: "Syarat menang: mendapatkan angka 3. Dadu mana yang sebaiknya dipilih?", parts: [pick("Pilih dadu:", [{ die: cube(1, 2, 3, 4, 5, 6) }, { die: cube(1, 1, 3, 3, 6, 6) }], 1), fill("Dadu pilihanmu: angka 3 ada di □ dari 6 sisi", 2)], explanation: "Dadu biasa: angka 3 hanya 1 dari 6. Dadu B: angka 3 ada di 2 dari 6 sisi, jadi peluangnya lebih besar." }),
  A2({ level: "Menantang", prompt: "Tas berisi 12 bola merah dan biru saja. Merah sangat mungkin, biru kurang mungkin, dan biru lebih dari 3. Atur banyak bolanya.", scene: { type: "scale", marks: [{ label: "Merah", color: "merah", cat: 3 }, { label: "Biru", color: "biru", cat: 1 }] }, parts: [{ kind: "bag", total: 12, colors: ["merah", "biru"], noun: "bola", rules: { cats: [["merah", 3], ["biru", 1]], only: ["merah", "biru"], min: [["biru", 4]] }, key: [8, 4] }], explanation: "Biru lebih dari 3 tetapi kurang dari 6 (setengah dari 12): 4 atau 5 bola. Merah sisanya: 8 atau 7 bola, lebih dari setengah." }),
  B2({ level: "Menantang", prompt: "Hadiah piring diwakili bola biru. Kotak mana yang peluang mendapatkan piringnya lebih besar?", scene: { type: "bags", bags: [{ label: "Kotak Mantap", balls: [["biru", 5], ["putih", 3]] }, { label: "Kotak Spektakuler", balls: [["biru", 6], ["putih", 4]] }] }, parts: [choice("Pilih:", ["Kotak Spektakuler", "Sama besar", "Kotak Mantap"], "Kotak Mantap")], explanation: "Mantap: 5 dari 8. Spektakuler: 6 dari 10. Samakan penyebut 40: 25/40 dan 24/40. Kotak Mantap sedikit lebih besar walaupun bolanya lebih sedikit." }),
  A1({ level: "Menantang", prompt: "Dhien mengambil satu buku acak dari rak. Letakkan setiap kejadian pada skala peluang.", scene: { type: "books", books: [["merah", 6], ["putih", 3], ["kuning", 1]] }, parts: [scale([{ label: "Buku merah", color: "merah" }, { label: "Buku putih", color: "putih" }, { label: "Buku hitam", color: "hitam" }, { label: "Bukan buku hitam" }], [3, 1, 0, 4])], explanation: "Ada 10 buku. Merah 6 dari 10, lebih dari setengah: sangat mungkin. Putih 3 dari 10: kurang mungkin. Tidak ada hitam: tidak mungkin, jadi bukan hitam pasti." }),

  B1({ level: "Sangat menantang", prompt: "Syarat menang: mendapatkan angka 3. Dadu mana yang peluang menangnya paling besar?", parts: [pick("Pilih dadu:", [{ die: cube(1, 2, 3, 4, 5, 6) }, { die: { kind: "piramida", faces: [1, 2, 3, 4] } }, { die: cube(3, 3, 1, 2, 5, 6) }], 2)], explanation: "Dadu A: 1 dari 6. Dadu piramida B: 1 dari 4. Dadu C: 2 dari 6 = 1 dari 3. Sepertiga lebih besar daripada seperempat dan seperenam, jadi dadu C." }),
  A2({ level: "Sangat menantang", prompt: `Isi 8 sisi dadu agar sesuai skala: angka 4 mungkin (tepat setengah), angka 2 dan angka 7 kurang mungkin, dan angka 7 lebih banyak daripada angka 2. Dadu hanya berisi angka 2, 4, dan 7.`, scene: { type: "scale", marks: [{ label: "Angka 4", cat: 2 }, { label: "Angka 2", cat: 1 }, { label: "Angka 7", cat: 1 }] }, parts: [{ kind: "die", dieKind: "oktahedron", values: [2, 4, 7], rules: { cats: [["4", 2], ["2", 1], ["7", 1]], only: ["2", "4", "7"], more: [["7", "2"]] }, key: [4, 4, 4, 4, 7, 7, 7, 2] }], explanation: "Angka 4 tepat setengah dari 8 sisi: 4 sisi. Sisa 4 sisi untuk 7 dan 2, keduanya ada, dan 7 lebih banyak: 3 sisi angka 7 dan 1 sisi angka 2." }),
  B2({ level: "Sangat menantang", prompt: "Tiga kotak berisi bola. Bola biru berhadiah boneka. Kotak mana yang peluang mendapatkan boneka paling besar?", scene: { type: "bags", bags: [{ label: "P", balls: [["biru", 3], ["putih", 5]] }, { label: "Q", balls: [["biru", 4], ["putih", 7]] }, { label: "R", balls: [["biru", 5], ["putih", 9]] }] }, parts: [choice("Pilih:", ["Kotak Q", "Kotak P", "Kotak R"], "Kotak P")], explanation: "P: 3 dari 8. Q: 4 dari 11. R: 5 dari 14. Bandingkan P dan Q: 3 × 11 = 33 > 4 × 8 = 32. Bandingkan P dan R: 3 × 14 = 42 > 5 × 8 = 40. Kotak P paling besar walaupun bola birunya paling sedikit." }),
  A1({ level: "Sangat menantang", prompt: "Warnai roda putar 8 bagian dengan merah, biru, dan hijau sehingga: peluang terbesar adalah merah, peluang terkecil adalah hijau, dan semua warna dipakai.", parts: [{ kind: "spin", n: 8, colors: ["merah", "biru", "hijau"], rules: { cats: [], only: ["merah", "biru", "hijau"], need: ["merah", "biru", "hijau"], most: "merah", least: "hijau" }, key: ["merah", "merah", "merah", "merah", "biru", "biru", "biru", "hijau"] }], explanation: "Merah harus paling banyak dan hijau paling sedikit (tetapi ada). Misalnya merah 4, biru 3, hijau 1. Jawaban lain juga benar, misalnya merah 5, biru 2, hijau 1." }),
  B1({ level: "Sangat menantang", prompt: "Apakah permainan-permainan ini adil?", scene: { type: "players", players: [{ name: "Skenario 1: Pemain 1", tool: "dadu", win: "angka 3" }, { name: "Skenario 1: Pemain 2", tool: "2 dadu", win: "angka 6 di salah satu dadu" }, { name: "Skenario 2: Pemain 1", tool: "dadu", win: "angka 1 atau 3" }, { name: "Skenario 2: Pemain 2", tool: "dadu", win: "angka 5 atau 6" }] }, parts: [choice("Skenario 1:", ["Adil", "Kurang adil"], "Kurang adil"), choice("Skenario 2:", ["Adil", "Kurang adil"], "Adil")], explanation: "Skenario 1: pemain 2 punya dua kesempatan mendapatkan 6, jadi peluangnya lebih besar daripada 1 dari 6. Skenario 2: keduanya punya 2 dari 6 angka, jadi adil." }),
  A2({ level: "Sangat menantang", prompt: "Lemari Ayah berisi 16 kaus. Hijau mungkin (tepat setengah), hitam dan biru kurang mungkin, merah tidak mungkin, dan kaus hitam lebih banyak daripada biru. Atur banyak kausnya.", scene: { type: "shirts", colors: shirts, total: 16 }, parts: [{ kind: "bag", total: 16, colors: shirts, noun: "kaus", rules: { cats: [["hijau", 2], ["hitam", 1], ["biru", 1], ["merah", 0]], more: [["hitam", "biru"]] }, key: [8, 5, 3, 0] }], explanation: "Hijau tepat setengah dari 16: 8 kaus. Sisa 8 kaus untuk hitam dan biru, keduanya ada, dan hitam lebih banyak: misalnya 5 dan 3, 6 dan 2, atau 7 dan 1." }),
  B2({ level: "Sangat menantang", prompt: "Hadiah diberikan jika mendapat warna merah. Pilihan mana yang peluangnya lebih besar?", scene: { type: "spinbag", sectors: wheel(["merah", 3], ["kuning", 5]), bag: [["merah", 4], ["biru", 8]] }, parts: [choice("Pilih:", ["Sama besar", "Kantong (4 bola merah dari 12 bola)", "Roda putar (3 merah dari 8 bagian)"], "Roda putar (3 merah dari 8 bagian)")], explanation: "Roda: 3 dari 8. Kantong: 4 dari 12 = 1 dari 3. Bandingkan 3 × 12 = 36 dan 4 × 8 = 32. Roda putar lebih besar peluangnya." }),
];
