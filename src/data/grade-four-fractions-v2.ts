// Kelas 4 Bab 2: Pecahan (Matematika SD/MI Kelas IV, Kemendikbudristek).
// A pecahan dengan pembilang satu, B pecahan dengan penyebut sama, C pecahan senilai,
// D pecahan desimal persepuluhan dan perseratusan, E desimal perseratusan dan persen.
// Teks boleh memuat pecahan bersusun dengan pola {pembilang/penyebut}; □ adalah kotak isian.
import type { Question } from "./grade-four-whole-numbers";

/* ---------- Gambar ---------- */
export type Shape = "bar" | "grid" | "circle" | "triangle" | "hexagon" | "choc" | "stick" | "melon" | "bread";
/** Satu bangun yang dibagi sama besar. `rows` hanya untuk grid. */
export type Fig = { shape: Shape; parts: number; shaded: number; rows?: number; caption?: string };
export type Thing = "telur" | "jeruk" | "jam" | "biskuit";
export type Scene =
  | { type: "figs"; figs: Fig[] }
  /** Kumpulan benda; `marked` benda pertama berada di dalam kotak. */
  | { type: "items"; thing: Thing; count: number; marked: number }
  /** Siswa; `marked` siswa diberi warna. */
  | { type: "people"; total: number; marked: number; caption: string }
  /** Lembar jawaban dengan tanda benar dan salah. */
  | { type: "sheet"; total: number; right: number; name: string }
  /** Karung belanja dengan label berat. */
  | { type: "sacks"; items: { name: string; label: string }[] };

/* ---------- Bagian jawaban ---------- */
export type Part =
  /** Isian: □ menjadi kotak; boleh di dalam pecahan {□/□}. Jawaban berupa bilangan (desimal memakai koma). */
  | { kind: "fill"; text: string; answers: string[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "rank"; label: string; items: { label: string; value: number }[]; dir: "naik" | "turun" }
  | { kind: "match"; left: string[]; right: string[]; answer: number[] }
  | { kind: "multi"; label: string; options: string[]; answer: string[] }
  /** Arsir bagian bangun sampai banyaknya `need`. */
  | { kind: "shade"; label: string; fig: Fig; need: number };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type FQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
/** Ubah {a/b} menjadi a/b untuk teks biasa dan label aksesibel. */
export const plain = (s: string) => s.replace(/\{([^/}]*)\/([^}]*)\}/g, "$1/$2");
export const boxes = (text: string) => (text.match(/□/g) ?? []).length;
export const fieldCount = (p: Part) => (p.kind === "fill" ? p.answers.length : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const list = (v: string) => (v ? v.split("|") : []);
/** Bilangan dari isian anak: koma desimal, tanpa spasi atau tanda persen. */
export const toNum = (s: string) => { const t = s.trim().replace(/\s|%/g, "").replace(",", "."); return t === "" || !/^\d*\.?\d+$/.test(t) ? NaN : Number(t); };
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "choice": return p.answer;
    case "rank": return p.items.map((_, i) => i).sort((a, b) => (p.dir === "naik" ? p.items[a].value - p.items[b].value : p.items[b].value - p.items[a].value) || a - b).join("|");
    case "match": return p.answer.join("|");
    case "multi": return [...p.answer].sort().join("|");
    case "shade": return Array.from({ length: p.need }, (_, i) => i).join("|");
  }
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "choice": return v === p.answer;
    case "match": return v === partKey(p);
    case "multi": return [...list(v)].sort().join("|") === partKey(p);
    case "rank": { const idx = list(v).map(Number), want = p.items.map(i => i.value).sort((a, b) => (p.dir === "naik" ? a - b : b - a)); return idx.length === p.items.length && new Set(idx).size === idx.length && idx.map(i => p.items[i]?.value).join("|") === want.join("|"); }
    case "shade": return new Set(list(v)).size === p.need;
    case "fill": { const got = cells(p, v); return p.answers.every((a, i) => toNum(got[i]) === toNum(a)); }
  }
}
/** Lengkap (belum tentu benar): semua kotak terisi, semua item diurutkan, dan setiap kotak kiri punya pasangan. */
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "fill") return cells(p, v).every(x => x.trim() !== "");
  if (p.kind === "rank") return new Set(list(v)).size === p.items.length;
  if (p.kind === "match") { const x = list(v); return p.left.every((_, i) => (x[i] ?? "") !== ""); }
  return v !== "";
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: FQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: FQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: FQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    switch (p.kind) {
      case "fill": { const x = cells(p, v[i]); let k = 0; return plain(p.text.replace(/□/g, () => x[k++] || "…")); }
      case "choice": return `${plain(p.label)} ${plain(v[i]) || "…"}`;
      case "rank": return `${plain(p.label)} ${list(v[i]).map(k => plain(p.items[Number(k)]?.label ?? "")).join(", ") || "…"}`;
      case "match": { const x = list(v[i]); return p.left.map((l, k) => `${plain(l)} → ${x[k] === undefined || x[k] === "" ? "…" : plain(p.right[Number(x[k])])}`).join("; "); }
      case "multi": return `${plain(p.label)} ${list(v[i]).map(plain).join(", ") || "…"}`;
      case "shade": return `${list(v[i]).length} bagian diarsir dari ${p.fig.parts}`;
    }
  }).join(" | ");
}

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Pecahan dengan Pembilang Satu", short: "Pembilang satu", sections: [
    { title: "Membandingkan pecahan berpembilang satu", lab: "unit", steps: ["Pecahan menyatakan bagian dari satu benda utuh yang dibagi sama besar. Angka atas disebut pembilang, angka bawah disebut penyebut.", "Pizza dipotong 4 sama besar, satu potong = {1/4} pizza.", "Jika pembilangnya sama-sama 1, semakin besar penyebutnya, semakin kecil bagiannya. Jadi {1/2} > {1/4}."], example: "{1/10} < {1/5} karena pita yang dibagi 10 potongannya lebih kecil daripada pita yang dibagi 5.", demo: "Ubah penyebut kedua pita, lalu pilih tanda > atau <." },
  ] },
  { code: "B", title: "Pecahan dengan Penyebut Sama", short: "Penyebut sama", sections: [
    { title: "Membandingkan pecahan berpenyebut sama", lab: "same", steps: ["Jika penyebutnya sama, potongannya sama besar.", "Bandingkan pembilangnya saja: semakin banyak potongan yang diarsir, semakin besar pecahannya.", "{1/3} < {2/3} karena 1 potong lebih sedikit daripada 2 potong."], example: "{2/10} > {1/10}: dua potong dari sepuluh lebih banyak daripada satu potong dari sepuluh.", demo: "Ketuk kotak untuk mengarsir kedua pita, lalu pilih tandanya." },
  ] },
  { code: "C", title: "Pecahan Senilai", short: "Pecahan senilai", sections: [
    { title: "Mencari pecahan senilai", lab: "equiv", steps: ["Pecahan senilai menunjukkan bagian yang sama besar walaupun angkanya berbeda.", "Kalikan pembilang dan penyebut dengan bilangan yang sama: {1/3} = {2/6} (dikali 2).", "Atau bagi pembilang dan penyebut dengan bilangan yang sama: {2/6} = {1/3} (dibagi 2)."], example: "Cokelat dibagi 6, Putu mendapat 2 potong ({2/6}). Cokelat dibagi 3, Putu mendapat 1 potong ({1/3}). Bagiannya sama besar.", demo: "Pilih pecahan dan pengali. Pita bawah dipotong lebih kecil, tetapi daerah arsirnya tetap sama." },
  ] },
  { code: "D", title: "Pecahan Desimal Persepuluhan dan Perseratusan", short: "Desimal", sections: [
    { title: "Persepuluhan dan perseratusan", lab: "decimal", steps: ["Pecahan berpenyebut 10 ditulis dengan 1 angka di belakang koma: {1/10} = 0,1 dan {3/10} = 0,3.", "Pecahan berpenyebut 100 ditulis dengan 2 angka di belakang koma: {1/100} = 0,01 dan {25/100} = 0,25.", "Hati-hati: {7/100} = 0,07, bukan 0,7."], example: "1 dari 10 roti dilapisi selai cokelat: {1/10} = 0,1. 25 dari 100 biskuit: {25/100} = 0,25.", demo: "Pilih persepuluhan atau perseratusan, lalu ketuk kotak untuk mengarsir." },
  ] },
  { code: "E", title: "Menghubungkan Pecahan Desimal Perseratusan dengan Konsep Persen", short: "Persen", sections: [
    { title: "Desimal perseratusan menjadi persen", lab: "percent", steps: ["Persen (%) artinya per seratus: 5% = {5/100}.", "Cara biasa: ubah desimal menjadi pecahan perseratus, lalu tulis persen. 0,75 = {75/100} = 75%.", "Cara langsung: kalikan dengan 100%, yaitu geser koma dua kali ke kanan. 2,36 × 100% = 236%."], example: "20 dari 50 siswa berolahraga: {20/50} = {40/100} = 40%.", demo: "Ubah banyak kotak yang diarsir dari 100, lalu lihat desimal dan persennya." },
  ] },
];

/* ---------- Pembuat soal ---------- */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): FQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B, C, D, E] = Array.from({ length: 5 }, (_, k) => make(k));
const fill = (text: string, ...answers: (string | number)[]): Part => ({ kind: "fill", text, answers: answers.map(String) });
const sign = (label: string, answer: "<" | ">" | "="): Part => ({ kind: "choice", label, options: ["<", "=", ">"], answer });
const pick = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });
const fig = (shape: Shape, parts: number, shaded: number, caption?: string, rows?: number): Fig => ({ shape, parts, shaded, caption, rows });
const figs = (...f: Fig[]): Scene => ({ type: "figs", figs: f });
const frac = "{□/□}";
const rank = (label: string, items: [string, number][], dir: "naik" | "turun" = "naik"): Part => ({ kind: "rank", label, items: items.map(([l, v]) => ({ label: l, value: v })), dir });

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: FQuestion[][] = [
  [
    A({ prompt: "Tuliskan pecahan dari daerah yang diarsir.", scene: figs(fig("circle", 5, 1)), parts: [fill(frac, 1, 5)], explanation: "Lingkaran dibagi 5 bagian sama besar dan 1 bagian diarsir, jadi {1/5}." }),
    A({ prompt: "Tuliskan pecahan setiap gambar, lalu pilih tandanya.", scene: figs(fig("bar", 3, 1), fig("bar", 6, 1)), parts: [fill(frac, 1, 3), sign("Tanda", ">"), fill(frac, 1, 6)], explanation: "Pita kiri {1/3}, pita kanan {1/6}. Potongan pertiga lebih besar dari potongan perenam, jadi {1/3} > {1/6}." }),
    A({ prompt: "Isilah dengan tanda > atau <.", parts: [sign("{1/7} … {1/4}", "<"), sign("{1/9} … {1/12}", ">")], explanation: "Pembilangnya sama-sama 1. Penyebut lebih besar berarti potongan lebih kecil: {1/7} < {1/4} dan {1/9} > {1/12}." }),
    A({ prompt: "Dina punya pita sepanjang {1/3} meter dan tali sepanjang {1/5} meter. Mana yang lebih panjang?", scene: figs(fig("stick", 3, 1, "Pita {1/3} m"), fig("stick", 5, 1, "Tali {1/5} m")), parts: [pick("Lebih panjang:", ["Pita", "Tali"], "Pita")], explanation: "{1/3} > {1/5} karena penyebut 3 lebih kecil dari 5. Pita lebih panjang." }),
  ],
  [
    B({ prompt: "Tuliskan pecahan setiap gambar, lalu pilih tandanya.", scene: figs(fig("bar", 5, 2), fig("bar", 5, 4)), parts: [fill(frac, 2, 5), sign("Tanda", "<"), fill(frac, 4, 5)], explanation: "Penyebutnya sama (5). 2 potong lebih sedikit dari 4 potong, jadi {2/5} < {4/5}." }),
    B({ prompt: "Tuliskan pecahan setiap gambar, lalu pilih tandanya.", scene: figs(fig("circle", 8, 5), fig("circle", 8, 3)), parts: [fill(frac, 5, 8), sign("Tanda", ">"), fill(frac, 3, 8)], explanation: "Kedua lingkaran dibagi 8. 5 bagian lebih banyak dari 3 bagian, jadi {5/8} > {3/8}." }),
    B({ prompt: "Isilah dengan tanda > atau <.", parts: [sign("{4/7} … {2/7}", ">"), sign("{5/12} … {9/12}", "<")], explanation: "Penyebutnya sama, jadi bandingkan pembilang: 4 > 2 dan 5 < 9." }),
    B({ prompt: "Asep minum {3/8} liter susu. Azizah minum {5/8} liter susu. Siapa yang minum lebih banyak?", scene: figs(fig("bar", 8, 3, "Asep"), fig("bar", 8, 5, "Azizah")), parts: [pick("Lebih banyak:", ["Asep", "Azizah"], "Azizah")], explanation: "Penyebutnya sama (8). Pembilang 5 > 3, jadi Azizah minum lebih banyak." }),
  ],
  [
    C({ prompt: "Tuliskan pecahan kedua gambar yang senilai ini.", scene: figs(fig("bar", 4, 1), fig("bar", 8, 2)), parts: [fill(`${frac} = ${frac}`, 1, 4, 2, 8)], explanation: "Pita kiri {1/4}, pita kanan {2/8}. Daerah arsirnya sama panjang, jadi {1/4} = {2/8}." }),
    C({ prompt: "Arsirlah pita ini agar senilai dengan {2/3}.", parts: [{ kind: "shade", label: "Arsir pita", fig: fig("bar", 6, 0), need: 4 }], explanation: "{2/3} = {4/6} (pembilang dan penyebut dikali 2). Pita dibagi 6, jadi arsir 4 bagian." }),
    C({ prompt: "Lengkapi pecahan senilai.", parts: [fill("{2/5} = {□/10}", 4), fill("{6/9} = {□/3}", 2)], explanation: "{2/5}: penyebut dikali 2, pembilang juga dikali 2 = 4. {6/9}: penyebut dibagi 3, pembilang juga dibagi 3 = 2." }),
    C({ prompt: "Pecahan manakah yang senilai dengan {3/4}?", parts: [pick("Pilih:", ["{3/8}", "{4/6}", "{6/8}", "{6/4}"], "{6/8}")], explanation: "{3/4} dikali {2/2} = {6/8}. {3/8} hanya penyebutnya yang dikali, jadi tidak senilai." }),
  ],
  [
    D({ prompt: "Nyatakan telur di dalam kotak sebagai pecahan, lalu ubah menjadi desimal.", scene: { type: "items", thing: "telur", count: 10, marked: 3 }, parts: [fill(`${frac} = □`, 3, 10, "0,3")], explanation: "Ada 10 telur, 3 di dalam kotak: {3/10} = 0,3." }),
    D({ prompt: "Ubahlah menjadi pecahan desimal persepuluhan.", parts: [fill("{7/10} = □", "0,7"), fill("{4/10} = □", "0,4")], explanation: "Penyebut 10 berarti satu angka di belakang koma: 0,7 dan 0,4." }),
    D({ prompt: "Ubahlah menjadi pecahan desimal perseratusan.", parts: [fill("{23/100} = □", "0,23"), fill("{8/100} = □", "0,08")], explanation: "Penyebut 100 berarti dua angka di belakang koma: 0,23 dan 0,08 (bukan 0,8)." }),
    D({ prompt: "Nyatakan daerah yang diarsir sebagai pecahan, lalu ubah menjadi desimal.", scene: figs(fig("grid", 100, 45, undefined, 10)), parts: [fill(`${frac} = □`, 45, 100, "0,45")], explanation: "Ada 100 kotak, 45 diarsir: {45/100} = 0,45." }),
  ],
  [
    E({ prompt: "Ubahlah menjadi bentuk persen.", parts: [fill("0,35 = □%", 35), fill("0,07 = □%", 7)], explanation: "Geser koma dua kali ke kanan: 0,35 = 35% dan 0,07 = 7%." }),
    E({ prompt: "Ubahlah menjadi bentuk persen.", parts: [fill("1,24 = □%", 124), fill("{48/100} = □%", 48)], explanation: "1,24 × 100% = 124%. {48/100} artinya 48 per seratus = 48%." }),
    E({ prompt: "Ubahlah persen menjadi pecahan desimal perseratusan.", parts: [fill("36% = □", "0,36"), fill("105% = □", "1,05")], explanation: "36% = {36/100} = 0,36. 105% = {105/100} = 1,05." }),
    E({ prompt: "Ada 50 siswa kelas 4. Sebanyak 15 siswa ikut pramuka. Berapa persen siswa yang ikut pramuka?", scene: { type: "people", total: 50, marked: 15, caption: "15 dari 50 siswa ikut pramuka" }, parts: [fill("{15/50} = {□/100} = □%", 30, 30)], explanation: "Ubah ke pecahan senilai berpenyebut 100: penyebut 50 dikali 2, pembilang 15 juga dikali 2 = 30. Jadi {30/100} = 30%." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
export const assessment: FQuestion[] = [
  A({ level: "Sedang", prompt: "Dua kue sama besar. Kue cokelat dibagi rata untuk 6 anak, kue keju untuk 8 anak. Berapa bagian setiap anak?", scene: figs(fig("circle", 6, 0, "Kue cokelat"), fig("circle", 8, 0, "Kue keju")), parts: [fill(`Cokelat ${frac}, keju ${frac}`, 1, 6, 1, 8), pick("Lebih besar:", ["Cokelat", "Keju"], "Cokelat")], explanation: "Setiap anak mendapat {1/6} kue cokelat atau {1/8} kue keju. Pembilangnya sama, penyebut 6 lebih kecil, jadi {1/6} > {1/8}: potongan kue cokelat lebih besar." }),
  B({ level: "Sedang", prompt: "Isilah dengan tanda <, =, atau >.", parts: [sign("{3/9} … {7/9}", "<"), sign("{11/15} … {8/15}", ">")], explanation: "Penyebutnya sama, bandingkan pembilangnya: 3 < 7 dan 11 > 8." }),
  C({ level: "Sedang", prompt: "Tuliskan pecahan kedua gambar yang senilai ini.", scene: figs(fig("bar", 3, 1), fig("bar", 9, 3)), parts: [fill(`${frac} = ${frac}`, 1, 3, 3, 9)], explanation: "Pita kiri {1/3}, pita kanan {3/9}. Daerah arsirnya sama panjang: {1/3} = {3/9}." }),
  D({ level: "Sedang", prompt: "Arsirlah pita sesuai pecahan desimal 0,6, lalu tuliskan pecahannya.", parts: [{ kind: "shade", label: "Arsir pita", fig: fig("bar", 10, 0), need: 6 }, fill("0,6 = {□/10}", 6)], explanation: "0,6 artinya 6 per sepuluh. Pita dibagi 10, arsir 6 bagian: 0,6 = {6/10}." }),
  E({ level: "Sedang", prompt: "Ubahlah menjadi bentuk persen.", parts: [fill("0,45 = □%", 45), fill("0,09 = □%", 9)], explanation: "Geser koma dua kali ke kanan: 0,45 = 45% dan 0,09 = 9%." }),
  A({ level: "Sedang", prompt: "Isilah dengan tanda <, =, atau >.", parts: [sign("{1/6} … {1/9}", ">"), sign("{1/12} … {1/4}", "<")], explanation: "Pembilangnya 1. Penyebut lebih kecil berarti potongan lebih besar: {1/6} > {1/9} dan {1/12} < {1/4}." }),
  D({ level: "Sedang", prompt: "Ubahlah menjadi pecahan desimal perseratusan.", parts: [fill("{57/100} = □", "0,57"), fill("{4/100} = □", "0,04")], explanation: "Penyebut 100: dua angka di belakang koma. {57/100} = 0,57 dan {4/100} = 0,04." }),
  E({ level: "Sedang", prompt: "Ubahlah persen menjadi pecahan desimal perseratusan.", parts: [fill("62% = □", "0,62"), fill("8% = □", "0,08")], explanation: "62% = {62/100} = 0,62. 8% = {8/100} = 0,08." }),

  C({ level: "Menantang", prompt: "Arsirlah pita kedua agar senilai dengan pita pertama.", scene: figs(fig("bar", 4, 3, "Pita pertama")), parts: [{ kind: "shade", label: "Arsir pita kedua", fig: fig("bar", 12, 0), need: 9 }], explanation: "Pita pertama {3/4}. Pita kedua dibagi 12 = 4 × 3, jadi {3/4} = {9/12}: arsir 9 bagian." }),
  A({ level: "Menantang", prompt: "Urutkan pecahan dari yang terkecil.", parts: [rank("Ketuk dari yang terkecil:", [["{1/5}", 1 / 5], ["{1/2}", 1 / 2], ["{1/9}", 1 / 9], ["{1/3}", 1 / 3]])], explanation: "Pembilangnya 1, jadi yang penyebutnya paling besar paling kecil: {1/9}, {1/5}, {1/3}, {1/2}." }),
  B({ level: "Menantang", prompt: "Urutkan pecahan dari yang terkecil.", parts: [rank("Ketuk dari yang terkecil:", [["{7/11}", 7 / 11], ["{2/11}", 2 / 11], ["{10/11}", 10 / 11], ["{5/11}", 5 / 11]])], explanation: "Penyebutnya sama (11), urutkan pembilangnya: 2, 5, 7, 10." }),
  D({ level: "Menantang", prompt: "Nyatakan jeruk di dalam kotak sebagai pecahan, lalu ubah menjadi desimal.", scene: { type: "items", thing: "jeruk", count: 10, marked: 6 }, parts: [fill(`${frac} = □`, 6, 10, "0,6")], explanation: "Ada 10 jeruk, 6 di dalam kotak: {6/10} = 0,6." }),
  E({ level: "Menantang", prompt: "Tarik garis dari setiap desimal ke bentuk persennya.", parts: [{ kind: "match", left: ["0,05", "0,5", "1,5", "0,15"], right: ["15%", "150%", "5%", "50%"], answer: [2, 3, 1, 0] }], explanation: "Kalikan 100%: 0,05 = 5%, 0,5 = 0,50 = 50%, 1,5 = 1,50 = 150%, 0,15 = 15%." }),
  C({ level: "Menantang", prompt: "Pilih semua pecahan yang senilai dengan {2/3}.", parts: [{ kind: "multi", label: "Senilai dengan {2/3}:", options: ["{4/6}", "{3/4}", "{6/9}", "{2/6}", "{8/12}"], answer: ["{4/6}", "{6/9}", "{8/12}"] }], explanation: "{2/3} dikali 2, 3, dan 4 menjadi {4/6}, {6/9}, {8/12}. {2/6} = {1/3} dan {3/4} tidak senilai." }),
  B({ level: "Menantang", prompt: "Tongkat Asep panjangnya {5/8} meter. Tongkat Azizah {3/8} meter. Tongkat siapa yang lebih panjang?", scene: figs(fig("stick", 8, 5, "Asep"), fig("stick", 8, 3, "Azizah")), parts: [pick("Lebih panjang:", ["Asep", "Azizah", "Sama panjang"], "Asep"), sign("{5/8} … {3/8}", ">")], explanation: "Penyebutnya sama (8). Pembilang 5 > 3, jadi tongkat Asep lebih panjang: {5/8} > {3/8}." }),
  A({ level: "Menantang", prompt: "Tiara membeli bawang {1/3} kg, gula {1/8} kg, dan garam {1/5} kg. Urutkan dari yang paling berat.", scene: { type: "sacks", items: [{ name: "Bawang", label: "{1/3} kg" }, { name: "Gula", label: "{1/8} kg" }, { name: "Garam", label: "{1/5} kg" }] }, parts: [rank("Ketuk dari yang paling berat:", [["Bawang", 1 / 3], ["Gula", 1 / 8], ["Garam", 1 / 5]], "turun")], explanation: "Pembilangnya 1. Penyebut paling kecil paling berat: {1/3} > {1/5} > {1/8}. Bawang, garam, lalu gula." }),
  E({ level: "Menantang", prompt: "Dari 25 siswa, 15 siswa membawa bekal. Berapa persen siswa yang membawa bekal?", scene: { type: "people", total: 25, marked: 15, caption: "15 dari 25 siswa membawa bekal" }, parts: [fill("{15/25} = {□/100} = □%", 60, 60)], explanation: "Penyebut 25 dikali 4 menjadi 100. Pembilang 15 dikali 4 menjadi 60. {60/100} = 60%." }),

  D({ level: "Sangat menantang", prompt: "Ubahlah menjadi pecahan desimal.", parts: [fill("{25/10} = □", "2,5"), fill("{130/100} = □", "1,3")], explanation: "{25/10} = 2 utuh dan {5/10} = 2,5. {130/100} = 1 utuh dan {30/100} = 1,30 = 1,3." }),
  C({ level: "Sangat menantang", prompt: "Lengkapi pecahan senilai dengan membagi pembilang dan penyebut.", parts: [fill("{12/18} = {□/9} = {□/6} = {□/3}", 6, 4, 2)], explanation: "Dibagi 2: {6/9}. Dibagi 3: {4/6}. Dibagi 6: {2/3}. Semuanya senilai dengan {12/18}." }),
  E({ level: "Sangat menantang", prompt: "Urutkan dari yang terkecil.", parts: [rank("Ketuk dari yang terkecil:", [["0,4", 0.4], ["35%", 0.35], ["{3/10}", 0.3], ["0,05", 0.05]])], explanation: "Ubah semua ke perseratus: 0,4 = 40%, 35%, {3/10} = 30%, 0,05 = 5%. Urutannya 0,05; {3/10}; 35%; 0,4." }),
  A({ level: "Sangat menantang", prompt: "Ibu memotong semangka menjadi 6 bagian sama besar. Satu bagian diberikan kepada Helen, sisanya kepada Putu.", scene: figs(fig("melon", 6, 1)), parts: [fill(`Helen ${frac}, Putu ${frac}`, 1, 6, 5, 6), pick("Bagian terbesar diterima:", ["Helen", "Putu"], "Putu")], explanation: "Helen mendapat {1/6}. Sisanya 6 − 1 = 5 bagian, jadi Putu {5/6}. {5/6} > {1/6}, Putu menerima bagian terbesar." }),
  B({ level: "Sangat menantang", prompt: "Bibi memotong roti menjadi 9 bagian sama besar. Wiwin mendapat {2/9}, Tomas {4/9}, dan sisanya untuk Dodi.", scene: figs(fig("bread", 9, 0)), parts: [fill("Dodi mendapat {□/9}", 3), rank("Urutkan dari yang paling sedikit:", [["Wiwin", 2], ["Tomas", 4], ["Dodi", 3]])], explanation: "Sisa untuk Dodi: 9 − 2 − 4 = 3 bagian = {3/9}. Penyebutnya sama, jadi urutannya Wiwin (2), Dodi (3), Tomas (4)." }),
  D({ level: "Sangat menantang", prompt: "Tarik garis dari setiap pecahan ke pecahan desimalnya.", parts: [{ kind: "match", left: ["{3/10}", "{3/100}", "{33/100}", "{13/10}"], right: ["1,3", "0,3", "0,33", "0,03"], answer: [1, 3, 2, 0] }], explanation: "{3/10} = 0,3. {3/100} = 0,03. {33/100} = 0,33. {13/10} = 1 utuh {3/10} = 1,3." }),
  E({ level: "Sangat menantang", prompt: "Nazilla menjawab benar 17 soal dari 20 soal. Berapa persen soal yang dijawab benar?", scene: { type: "sheet", total: 20, right: 17, name: "Nazilla" }, parts: [fill("{17/20} = {□/100} = □%", 85, 85)], explanation: "Penyebut 20 dikali 5 menjadi 100. Pembilang 17 dikali 5 menjadi 85. Jadi 85% soal dijawab benar." }),
];
