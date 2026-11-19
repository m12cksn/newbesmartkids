/**
 * Kelas 1 Bab 4 - Mengenal Bentuk (Buku Siswa Matematika SD/MI Kelas I, Kurikulum Merdeka 2022, hlm. 115-144).
 * A. Mendeskripsikan Benda Berdasarkan Bentuk  B. Mengelompokkan Benda  C. Menyusun dan Mengurai Bentuk Bangun.
 * Bentuk soal mengikuti buku: pasangkan benda dengan bentuknya (tarik garis), pasangkan bentuk dengan namanya,
 * hubungkan garis putus-putus lalu tulis namanya, lingkari bentuk yang benar, lingkari bangun yang satu kelompok/
 * warna/ukuran, warnai yang paling besar dan paling kecil, kelompokkan, lingkari pasangan potongan,
 * hitung bentuk bangun pada gambar, dan susun bentuk dari keping.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Cat = "lengkung" | "segitiga" | "segiempat";
export const catName: Record<Cat, string> = { lengkung: "Bentuk lengkung", segitiga: "Segitiga", segiempat: "Segi empat" };
export const NAMES = [catName.lengkung, catName.segitiga, catName.segiempat];

/** Bentuk bangun datar: elips/lingkaran, segitiga (beberapa arah), segi empat (tegak atau miring). */
export type Form = "circle" | "tri" | "triDown" | "right" | "rightR" | "rect" | "diamond";
export const formCat: Record<Form, Cat> = { circle: "lengkung", tri: "segitiga", triDown: "segitiga", right: "segitiga", rightR: "segitiga", rect: "segiempat", diamond: "segiempat" };
export type Color = "merah" | "kuning" | "hijau" | "biru" | "ungu" | "oranye" | "pink";
/** w dan h dalam satuan gambar; x dan y hanya dipakai di gambar susunan. */
export type Fig = { f: Form; w: number; h: number; c: Color; x?: number; y?: number };

/** Benda nyata yang digambar khusus (lihat GradeOneShapesArt). */
export type Obj =
  | "jam" | "piring" | "donat" | "lolipop" | "telur" | "kukis"
  | "semangka" | "risol" | "penggaris" | "gantungan" | "rambu"
  | "buku" | "pintu" | "jendela" | "bingkai" | "kuelapis" | "amplop";
export const objName: Record<Obj, string> = {
  jam: "jam dinding", piring: "piring", donat: "donat", lolipop: "permen lolipop", telur: "telur", kukis: "kue kering",
  semangka: "potongan semangka", risol: "kue risol", penggaris: "penggaris segitiga", gantungan: "gantungan baju", rambu: "rambu peringatan",
  buku: "buku", pintu: "pintu", jendela: "jendela", bingkai: "bingkai foto", kuelapis: "kue lapis", amplop: "amplop",
};
export const objCat: Record<Obj, Cat> = {
  jam: "lengkung", piring: "lengkung", donat: "lengkung", lolipop: "lengkung", telur: "lengkung", kukis: "lengkung",
  semangka: "segitiga", risol: "segitiga", penggaris: "segitiga", gantungan: "segitiga", rambu: "segitiga",
  buku: "segiempat", pintu: "segiempat", jendela: "segiempat", bingkai: "segiempat", kuelapis: "segiempat", amplop: "segiempat",
};
export type Item = Obj | Fig;
export const isObj = (it: Item): it is Obj => typeof it === "string";
/** Teks nama bentuk (bukan benda). */
export const isName = (x: Item | string): x is string => typeof x === "string" && !(x in objName);
export const itemCat = (it: Item): Cat => (isObj(it) ? objCat[it] : formCat[it.f]);
export const area = (f: Fig) => f.w * f.h * (f.f === "rect" ? 1 : f.f === "circle" ? 0.785 : 0.5);
const formWord: Record<Form, string> = { circle: "bentuk lengkung", tri: "segitiga", triDown: "segitiga terbalik", right: "segitiga siku-siku", rightR: "segitiga siku-siku", rect: "segi empat", diamond: "segi empat miring" };
export const itemName = (it: Item) => (isObj(it) ? objName[it] : `${formWord[it.f]} ${it.c}`);

/* ---------- Gambar susunan (dihitung dari data, bukan ditulis tangan) ---------- */
const F = (f: Form, x: number, y: number, w: number, h: number, c: Color): Fig => ({ f, x, y, w, h, c });
export type Picture = { name: string; vb: [number, number]; figs: Fig[] };
export const pictures: Record<string, Picture> = {
  kereta: { name: "kereta", vb: [120, 72], figs: [
    F("rightR", 8, 30, 14, 22, "merah"), F("rect", 22, 26, 20, 26, "biru"), F("rect", 25, 13, 8, 13, "biru"), F("rect", 42, 4, 26, 48, "merah"),
    F("rect", 47, 10, 16, 14, "biru"), F("rect", 68, 18, 46, 34, "biru"), F("circle", 20, 50, 14, 14, "merah"), F("circle", 46, 48, 18, 18, "biru"), F("circle", 88, 48, 18, 18, "merah")] },
  rumah: { name: "rumah", vb: [120, 96], figs: [
    F("tri", 8, 8, 74, 32, "ungu"), F("rect", 14, 40, 62, 50, "kuning"), F("rect", 38, 60, 14, 30, "biru"), F("rect", 19, 50, 13, 13, "biru"), F("rect", 58, 50, 13, 13, "biru"),
    F("circle", 92, 4, 20, 20, "oranye"), F("circle", 86, 38, 28, 28, "hijau"), F("rect", 97, 64, 6, 26, "oranye")] },
  robot: { name: "robot", vb: [100, 118], figs: [
    F("tri", 40, 2, 20, 14, "ungu"), F("rect", 34, 16, 32, 24, "kuning"), F("circle", 40, 22, 8, 8, "merah"), F("circle", 52, 22, 8, 8, "merah"),
    F("rect", 46, 40, 8, 5, "hijau"), F("rect", 31, 45, 38, 34, "kuning"), F("rect", 21, 47, 9, 28, "hijau"), F("rect", 70, 47, 9, 28, "hijau"),
    F("circle", 21, 75, 9, 9, "merah"), F("circle", 70, 75, 9, 9, "merah"), F("rect", 36, 79, 11, 26, "hijau"), F("rect", 53, 79, 11, 26, "hijau"),
    F("rightR", 26, 96, 10, 9, "ungu"), F("right", 64, 96, 10, 9, "ungu")] },
  roket: { name: "roket", vb: [80, 118], figs: [
    F("tri", 25, 2, 30, 26, "merah"), F("rect", 25, 28, 30, 56, "biru"), F("circle", 32, 36, 16, 16, "kuning"), F("circle", 32, 58, 16, 16, "kuning"),
    F("rightR", 11, 62, 14, 22, "merah"), F("right", 55, 62, 14, 22, "merah"), F("triDown", 31, 84, 18, 16, "oranye")] },
  rumahKecil: { name: "rumah", vb: [80, 84], figs: [
    F("tri", 6, 4, 68, 30, "merah"), F("rect", 12, 34, 56, 46, "kuning"), F("rect", 33, 52, 14, 28, "biru"), F("rect", 18, 42, 11, 11, "hijau")] },
  perahu: { name: "perahu", vb: [100, 88], figs: [
    F("right", 52, 6, 28, 46, "kuning"), F("rightR", 26, 16, 24, 36, "oranye"), F("rect", 49, 4, 3, 50, "ungu"), F("rect", 14, 54, 72, 14, "biru"), F("circle", 80, 4, 14, 14, "merah")] },
};
export const countOf = (pic: Picture, c: Cat | "semua") => pic.figs.filter(f => c === "semua" || formCat[f.f] === c).length;
/** Keping cocok dengan tempatnya bila bentuk dan ukurannya sama. */
export const fits = (a: Fig, b: Fig) => a.f === b.f && a.w === b.w && a.h === b.h;

/* ---------- Pasangan potongan (lingkari pasangannya) ---------- */
export type Piece = { d: string; w: number; h: number };
export type Puzzle = { color: string; base: string; hole: string; at: [number, number]; opts: Piece[] };
export const puzzles: Record<string, Puzzle> = {
  bolu: { color: "#f2d27a", base: "M50 10A40 40 0 1 1 49.99 10Z", hole: "M50 50L50 10A40 40 0 0 1 90 50Z", at: [50, 10], opts: [
    { d: "M0 40L0 0L40 40Z", w: 40, h: 40 }, { d: "M0 40L0 0A40 40 0 0 1 40 40Z", w: 40, h: 40 }, { d: "M0 28L0 0A28 28 0 0 1 28 28Z", w: 28, h: 28 }] },
  coklat: { color: "#9b5b34", base: "M10 10H90V90H10Z", hole: "M30 90L50 58L70 90Z", at: [30, 58], opts: [
    { d: "M0 32L20 0L40 32Z", w: 40, h: 32 }, { d: "M0 0H40V32H0Z", w: 40, h: 32 }, { d: "M0 18L20 0L40 18Z", w: 40, h: 18 }] },
  lapis: { color: "#e9c46a", base: "M10 25H90V75H10Z", hole: "M10 25H40L25 37.5L40 50L25 62.5L40 75H10Z", at: [10, 25], opts: [
    { d: "M0 0H30L15 25L30 50H0Z", w: 30, h: 50 }, { d: "M30 0H0L15 12.5L0 25L15 37.5L0 50H30Z", w: 30, h: 50 }, { d: "M0 0H30L15 12.5L30 25L15 37.5L30 50H0Z", w: 30, h: 50 }] },
  kunci: { color: "#f07b3f", base: "M18 12H82V92H18Z", hole: "M44 92L44 50.4A12 12 0 1 1 56 50.4L56 92Z", at: [38, 28], opts: [
    { d: "M6 64L6 22.4A12 12 0 1 1 18 22.4L18 64Z", w: 24, h: 64 }, { d: "M8 64L8 26A6 6 0 1 1 16 26L16 64Z", w: 24, h: 64 }, { d: "M6 64L6 12H18L18 64Z", w: 24, h: 64 }] },
};

/* ---------- Bentuk jawaban ---------- */
export type Part =
  /** Tarik garis dari kiri ke kanan (nilai: nomor kanan untuk setiap kiri). */
  | { kind: "match"; left: Item[]; right: (Item | string)[]; answer: number[] }
  /** Hubungkan garis putus-putus, lalu pilih namanya (nilai: "1|nama"). */
  | { kind: "trace"; fig: Fig; answer: string }
  /** Lingkari semua yang benar (nilai: nomor dipisah koma). */
  | { kind: "multi"; label: string; items: Item[]; answers: number[]; same?: boolean }
  /** Lingkari satu jawaban (nilai: nomor pilihan). */
  | { kind: "pick"; label: string; options: (Item | string)[]; answer: number; same?: boolean }
  /** Warnai: merah untuk paling besar, kuning untuk paling kecil (nilai: m/k/kosong per bentuk). */
  | { kind: "paint"; figs: Fig[] }
  /** Kelompokkan ke kotak (nilai: nomor kotak per benda). */
  | { kind: "sort"; items: Item[]; bins: string[]; answer: number[]; same?: boolean }
  /** Lingkari potongan yang melengkapi bentuk (nilai: nomor pilihan). */
  | { kind: "puzzle"; puzzle: string; answer: number }
  /** Hitung bentuk bangun pada gambar. */
  | { kind: "count"; picture: string; cats: (Cat | "semua")[] }
  /** Susun keping ke tempatnya (nilai: nomor keping per tempat). */
  | { kind: "slots"; picture: string; order: number[] };
export type SQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };
/** Gambar soal di atas pertanyaan. */
export type Scene =
  /** Kelompok rujukan "gambar di atas". */
  | { type: "group"; figs: Fig[] }
  /** Dua segitiga siku-siku yang sama digabung. */
  | { type: "join"; mode: "kotak" | "segitiga"; colors: [Color, Color] };

export const SEP = "‖";
const list = (v: string) => (v ? v.split("|") : []);
const idx = (v: string) => (v ? v.split(",").filter(Boolean) : []);
export const fieldCount = (p: Part) => (p.kind === "match" ? p.left.length : p.kind === "paint" ? p.figs.length : p.kind === "sort" ? p.items.length : p.kind === "count" ? p.cats.length : p.kind === "slots" ? p.order.length : p.kind === "trace" ? 2 : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = list(v); return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const num = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);
/** Jawaban warnai: m untuk yang terluas, k untuk yang tersempit. */
export const paintKey = (figs: Fig[]) => { const a = figs.map(area), mx = Math.max(...a), mn = Math.min(...a); return a.map(x => (x === mx ? "m" : x === mn ? "k" : "")); };
export function partKey(p: Part): string {
  switch (p.kind) {
    case "match": case "sort": return p.answer.join("|");
    case "trace": return `1|${p.answer}`;
    case "multi": return [...p.answers].sort((a, b) => a - b).join(",");
    case "pick": case "puzzle": return String(p.answer);
    case "paint": return paintKey(p.figs).join("|");
    case "count": { const pic = pictures[p.picture]; return p.cats.map(c => countOf(pic, c)).join("|"); }
    case "slots": { const pic = pictures[p.picture], used = new Set<number>();
      return pic.figs.map(f => { const k = p.order.findIndex((o, j) => !used.has(j) && fits(pic.figs[o], f)); used.add(k); return k; }).join("|"); }
  }
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "count": { const got = cells(p, v), key = partKey(p).split("|"); return key.every((a, i) => num(got[i]) === Number(a)); }
    /* Tempat terisi keping yang bentuk dan ukurannya sama; keping kembar boleh tertukar. */
    case "slots": { const pic = pictures[p.picture], got = cells(p, v).map(Number); return got.length === pic.figs.length && new Set(got).size === got.length && got.every((k, i) => Number.isInteger(k) && k >= 0 && k < p.order.length && fits(pic.figs[p.order[k]], pic.figs[i])); }
    case "paint": return cells(p, v).join("|") === partKey(p);
    default: return v === partKey(p);
  }
}
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "multi") return idx(v).length > 0;
  if (p.kind === "paint") return cells(p, v).some(Boolean);
  if (p.kind === "trace") { const x = cells(p, v); return x[0] === "1" && x[1] !== ""; }
  if (p.kind === "match" || p.kind === "sort" || p.kind === "count" || p.kind === "slots") return cells(p, v).every(x => x !== "");
  return v !== "";
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: SQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: SQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const label = (it: Item | string) => (isName(it) ? it : itemName(it));
export function formatAnswer(q: SQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "match": return p.left.map((l, k) => `${itemName(l)} → ${x[k] === "" ? "…" : label(p.right[Number(x[k])])}`).join(", ");
      case "trace": return x[0] === "1" ? x[1] || "…" : "garis belum dihubungkan";
      case "multi": return idx(v[i]).map(k => itemName(p.items[Number(k)])).join(", ") || "…";
      case "pick": return v[i] === "" ? "…" : label(p.options[Number(v[i])]);
      case "paint": return p.figs.map((f, k) => `${itemName(f)}: ${x[k] === "m" ? "merah" : x[k] === "k" ? "kuning" : "tidak diwarnai"}`).join(", ");
      case "sort": return p.bins.map((b, bi) => `${b}: ${p.items.filter((_, k) => x[k] === String(bi)).map(itemName).join(", ") || "-"}`).join("; ");
      case "puzzle": return v[i] === "" ? "…" : `potongan ${"abc"[Number(v[i])]}`;
      case "count": return p.cats.map((c, k) => `${c === "semua" ? "Bangun datar" : catName[c]} ada ${x[k] || "…"}`).join(", ");
      case "slots": return `${x.filter(Boolean).length} keping dipasang`;
    }
  }).join(" | ");
}

/* ====================================================================== */
/* Materi                                                                  */
/* ====================================================================== */
export type Topic = { code: string; title: string; short: string; lab: string; steps: string[]; demo: string };
export const topics: Topic[] = [
  { code: "A", title: "Mendeskripsikan Benda Berdasarkan Bentuk", short: "Bentuk benda", lab: "cari", steps: [
    "Bentuk lengkung tidak punya sudut, seperti jam dinding, piring, dan donat. Telur juga lengkung, bentuknya lonjong.",
    "Segitiga punya 3 sisi lurus dan 3 sudut, seperti potongan semangka dan penggaris segitiga.",
    "Segi empat punya 4 sisi lurus dan 4 sudut, seperti buku, pintu, dan jendela.",
    "Segi empat yang diputar tetap segi empat. Hitung sisinya, jangan lihat arahnya.",
  ], demo: "Ketuk sebuah benda, lalu ketuk kotak bentuknya. Garis tepi bentuknya akan muncul di atas benda." },
  { code: "B", title: "Mengelompokkan Benda", short: "Mengelompokkan", lab: "kelompok", steps: [
    "Benda bisa dikelompokkan berdasarkan bentuk: lengkung, segitiga, atau segi empat.",
    "Benda bisa dikelompokkan berdasarkan warna: merah bersama merah, kuning bersama kuning.",
    "Benda bisa dikelompokkan berdasarkan ukuran: yang besar bersama yang besar, yang kecil bersama yang kecil.",
    "Satu benda bisa masuk kelompok berbeda, tergantung aturan yang kita pakai.",
  ], demo: "Pilih aturannya: bentuk, warna, atau ukuran. Lihat bangun berpindah ke kelompoknya." },
  { code: "C", title: "Menyusun dan Mengurai Bentuk Bangun", short: "Menyusun", lab: "susun", steps: [
    "Dua segitiga yang sama besar bisa digabung menjadi segitiga yang lebih besar.",
    "Dua segitiga yang sama itu juga bisa digabung menjadi segi empat.",
    "Bangun yang terpotong bisa dilengkapi dengan potongan yang bentuk dan ukurannya pas.",
    "Gambar kereta atau rumah tersusun dari beberapa bentuk. Kita bisa menghitung setiap bentuknya.",
  ], demo: "Putar segitiga kedua untuk membuat bentuk baru, atau susun keping menjadi rumah." },
];

/* ====================================================================== */
/* Pembuat soal                                                            */
/* ====================================================================== */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): SQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B, C] = [make(0), make(1), make(2)];
const fig = (f: Form, w: number, h: number, c: Color): Fig => ({ f, w, h, c });
const [LK, SG, SE] = NAMES;

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: SQuestion[][] = [
  [
    A({ prompt: "Pasangkan yang bentuknya sama.", parts: [{ kind: "match", left: ["donat", "semangka", "kuelapis", "jam"], right: [fig("tri", 40, 34, "ungu"), fig("circle", 38, 38, "merah"), fig("rect", 46, 28, "biru")], answer: [1, 0, 2, 1] }], explanation: "Donat dan jam dinding berbentuk lengkung. Potongan semangka berbentuk segitiga. Kue lapis berbentuk segi empat." }),
    A({ prompt: "Pasangkan bentuk dan namanya.", parts: [{ kind: "match", left: [fig("right", 30, 36, "biru"), fig("circle", 30, 40, "merah"), fig("rect", 34, 34, "biru"), fig("tri", 36, 30, "ungu")], right: [SG, SE, LK], answer: [0, 2, 1, 0] }], explanation: "Bangun dengan 3 sisi lurus adalah segitiga, walaupun arahnya berbeda. Bangun dengan 4 sisi lurus adalah segi empat. Lonjong termasuk bentuk lengkung." }),
    A({ prompt: "Hubungkan garis putus-putusnya. Lalu pilih namanya.", parts: [{ kind: "trace", fig: fig("tri", 70, 60, "oranye"), answer: SG }], explanation: "Setelah garisnya tersambung, terlihat 3 sisi lurus dan 3 sudut. Jadi bentuknya segitiga." }),
    A({ prompt: "Lingkari semua segi empat.", parts: [{ kind: "multi", label: "Segi empat:", items: [fig("rect", 44, 28, "ungu"), fig("right", 30, 36, "hijau"), fig("circle", 44, 30, "biru"), fig("rect", 26, 40, "oranye"), fig("diamond", 36, 36, "pink"), fig("circle", 30, 30, "kuning")], answers: [0, 3, 4] }], explanation: "Ada 3 segi empat: yang mendatar, yang tegak, dan yang miring. Segi empat miring tetap punya 4 sisi lurus." }),
  ],
  [
    B({ prompt: "Lingkari bangun yang satu kelompok dengan gambar di atas.", scene: { type: "group", figs: [fig("right", 30, 32, "ungu"), fig("tri", 32, 28, "oranye"), fig("tri", 24, 44, "pink")] }, parts: [{ kind: "pick", label: "Satu kelompok:", options: [fig("triDown", 36, 32, "ungu"), fig("rect", 32, 32, "ungu"), fig("circle", 40, 30, "ungu")], answer: 0 }], explanation: "Ketiga gambar di atas berbentuk segitiga. Segitiga terbalik juga segitiga karena punya 3 sisi." }),
    B({ prompt: "Lingkari bangun yang satu warna dengan gambar di atas.", scene: { type: "group", figs: [fig("rect", 40, 26, "pink"), fig("right", 30, 30, "pink"), fig("rect", 22, 40, "pink")] }, parts: [{ kind: "pick", label: "Satu warna:", options: [fig("tri", 36, 32, "hijau"), fig("circle", 34, 34, "pink"), fig("rect", 32, 32, "ungu")], answer: 1 }], explanation: "Semua gambar di atas berwarna pink. Lingkaran pink satu warna dengan mereka, walaupun bentuknya berbeda." }),
    B({ prompt: "Warnailah. Merah untuk bentuk yang paling besar. Kuning untuk bentuk yang paling kecil.", parts: [{ kind: "paint", figs: [fig("right", 34, 34, "ungu"), fig("right", 50, 50, "ungu"), fig("right", 22, 22, "ungu")] }], explanation: "Segitiga tengah paling besar, jadi merah. Segitiga kanan paling kecil, jadi kuning. Segitiga kiri tidak diwarnai." }),
    B({ prompt: "Kelompokkan berdasarkan ukuran.", parts: [{ kind: "sort", same: true, items: [fig("circle", 46, 46, "merah"), fig("rect", 18, 18, "kuning"), fig("tri", 48, 40, "hijau"), fig("circle", 18, 18, "biru"), fig("rect", 44, 40, "ungu"), fig("tri", 20, 18, "oranye")], bins: ["Besar", "Kecil"], answer: [0, 1, 0, 1, 0, 1] }], explanation: "Lingkaran merah, segitiga hijau, dan segi empat ungu besar. Tiga bangun lainnya kecil. Warna dan bentuk tidak dipakai." }),
  ],
  [
    C({ prompt: "Lingkari pasangannya agar bolu menjadi utuh.", parts: [{ kind: "puzzle", puzzle: "bolu", answer: 1 }], explanation: "Bagian yang hilang punya dua sisi lurus dan satu sisi lengkung. Potongan b pas. Potongan a tidak punya sisi lengkung, dan potongan c terlalu kecil." }),
    C({ prompt: "Dua segitiga yang sama digabungkan seperti ini. Bentuk apa yang terjadi?", scene: { type: "join", mode: "kotak", colors: ["merah", "biru"] }, parts: [{ kind: "pick", label: "Bentuknya:", options: [SG, SE, LK], answer: 1 }], explanation: "Sisi miring kedua segitiga ditempelkan. Hasilnya punya 4 sisi lurus, jadi segi empat." }),
    C({ prompt: "Hitunglah banyaknya bentuk bangun pada kereta.", parts: [{ kind: "count", picture: "kereta", cats: ["lengkung", "segiempat", "segitiga"] }], explanation: "Roda kereta ada 3 bentuk lengkung. Segi empat ada 5: cerobong, badan depan, kabin, jendela, dan gerbong. Segitiga ada 1 di depan." }),
    C({ prompt: "Susun keping menjadi rumah.", parts: [{ kind: "slots", picture: "rumahKecil", order: [2, 0, 3, 1] }], explanation: "Atap memakai segitiga, dinding memakai segi empat besar, pintu memakai segi empat tinggi, dan jendela memakai segi empat kecil." }),
  ],
];

/* ---------- Evaluasi (24 soal: A, B, C bergantian) ---------- */
export const assessment: SQuestion[] = [
  A({ level: "Sedang", prompt: "Pasangkan yang bentuknya sama.", parts: [{ kind: "match", left: ["jam", "gantungan", "bingkai", "jendela"], right: [fig("tri", 40, 34, "ungu"), fig("rect", 46, 28, "biru"), fig("circle", 38, 38, "merah")], answer: [2, 0, 1, 1] }], explanation: "Jam dinding lengkung. Gantungan baju segitiga. Bingkai foto dan jendela segi empat." }),
  B({ level: "Sedang", prompt: "Perhatikan ketiga gambar di atas. Lingkari bangun yang satu kelompok dengan gambar.", scene: { type: "group", figs: [fig("rect", 34, 34, "biru"), fig("rect", 44, 26, "hijau"), fig("diamond", 34, 34, "kuning")] }, parts: [{ kind: "pick", label: "Satu kelompok:", options: [fig("circle", 40, 30, "biru"), fig("rect", 24, 40, "kuning"), fig("right", 34, 34, "hijau")], answer: 1 }], explanation: "Ketiga gambar di atas segi empat. Pilihan yang juga segi empat adalah segi empat kuning yang tegak." }),
  C({ level: "Sedang", prompt: "Lingkari pasangannya agar cokelat menjadi utuh.", parts: [{ kind: "puzzle", puzzle: "coklat", answer: 0 }], explanation: "Lubangnya berbentuk segitiga. Potongan a pas. Potongan b segi empat, potongan c segitiga yang terlalu pendek." }),
  A({ level: "Sedang", prompt: "Pasangkan bentuk dengan namanya.", parts: [{ kind: "match", left: [fig("rect", 34, 34, "biru"), fig("tri", 38, 32, "ungu"), fig("rect", 46, 24, "biru"), fig("circle", 36, 36, "merah")], right: [LK, SE, SG], answer: [1, 2, 1, 0] }], explanation: "Persegi dan persegi panjang sama-sama segi empat. Bangun 3 sisi adalah segitiga. Lingkaran adalah bentuk lengkung." }),
  B({ level: "Sedang", prompt: "Warnailah. Merah untuk bentuk yang paling besar. Kuning untuk bentuk yang paling kecil.", parts: [{ kind: "paint", figs: [fig("circle", 50, 50, "biru"), fig("circle", 22, 22, "biru"), fig("circle", 38, 38, "biru")] }], explanation: "Lingkaran kiri paling besar, jadi merah. Lingkaran tengah paling kecil, jadi kuning." }),
  C({ level: "Sedang", prompt: "Hitunglah banyaknya bentuk bangun pada rumah.", parts: [{ kind: "count", picture: "rumah", cats: ["lengkung", "segiempat", "segitiga"] }], explanation: "Matahari dan daun pohon ada 2 bentuk lengkung. Dinding, pintu, 2 jendela, dan batang pohon ada 5 segi empat. Atap 1 segitiga." }),
  A({ level: "Sedang", prompt: "Hubungkan garis putus-putusnya. Lalu pilih namanya.", parts: [{ kind: "trace", fig: fig("circle", 64, 64, "hijau"), answer: LK }], explanation: "Garisnya melengkung terus tanpa sudut. Jadi bentuknya bentuk lengkung." }),
  B({ level: "Sedang", prompt: "Lingkari bangun yang satu warna dengan gambar di atas.", scene: { type: "group", figs: [fig("circle", 34, 34, "hijau"), fig("tri", 36, 30, "hijau"), fig("rect", 40, 26, "hijau")] }, parts: [{ kind: "pick", label: "Satu warna:", options: [fig("right", 32, 34, "hijau"), fig("rect", 34, 34, "ungu"), fig("tri", 34, 30, "kuning")], answer: 0 }], explanation: "Semua gambar di atas hijau. Segitiga hijau satu warna dengan mereka." }),

  C({ level: "Menantang", prompt: "Dua segitiga yang sama digabungkan seperti ini. Bentuk apa yang terjadi?", scene: { type: "join", mode: "segitiga", colors: ["merah", "biru"] }, parts: [{ kind: "pick", label: "Bentuknya:", options: [LK, SG, SE], answer: 1 }], explanation: "Sisi tegak kedua segitiga ditempelkan. Hasilnya segitiga besar dengan 3 sisi." }),
  A({ level: "Menantang", prompt: "Lingkari semua bentuk lengkung.", parts: [{ kind: "multi", label: "Bentuk lengkung:", items: [fig("rect", 40, 30, "pink"), fig("circle", 34, 34, "ungu"), fig("rect", 30, 30, "hijau"), fig("circle", 26, 42, "biru"), fig("right", 30, 36, "oranye"), fig("circle", 20, 20, "kuning")], answers: [1, 3, 5] }], explanation: "Lingkaran ungu, lonjong biru, dan lingkaran kuning kecil tidak punya sudut. Ketiganya bentuk lengkung." }),
  B({ level: "Menantang", prompt: "Kelompokkan berdasarkan warna.", parts: [{ kind: "sort", items: [fig("tri", 34, 30, "merah"), fig("circle", 30, 30, "kuning"), fig("rect", 34, 26, "kuning"), fig("circle", 40, 40, "merah"), fig("diamond", 28, 28, "kuning"), fig("rect", 22, 22, "merah")], bins: ["Merah", "Kuning"], answer: [0, 1, 1, 0, 1, 0] }], explanation: "Segitiga, lingkaran besar, dan segi empat kecil berwarna merah. Lingkaran kecil, segi empat, dan segi empat miring berwarna kuning." }),
  C({ level: "Menantang", prompt: "Lingkari pasangannya agar kue lapis menjadi utuh.", parts: [{ kind: "puzzle", puzzle: "lapis", answer: 2 }], explanation: "Tepi lubang punya 2 lekukan. Potongan c punya 2 lekukan yang menghadap ke arah yang sama. Potongan a hanya 1 lekukan, potongan b menghadap ke arah sebaliknya." }),
  A({ level: "Menantang", prompt: "Kelompokkan benda berdasarkan bentuknya.", parts: [{ kind: "sort", items: ["piring", "buku", "risol", "pintu", "lolipop", "penggaris"], bins: [LK, SG, SE], answer: [0, 2, 1, 2, 0, 1] }], explanation: "Piring dan lolipop lengkung. Kue risol dan penggaris segitiga. Buku dan pintu segi empat." }),
  B({ level: "Menantang", prompt: "Lingkari bangun yang satu ukuran dengan gambar di atas.", scene: { type: "group", figs: [fig("rect", 40, 40, "ungu"), fig("circle", 34, 44, "hijau"), fig("right", 40, 40, "pink")] }, parts: [{ kind: "pick", label: "Satu ukuran:", same: true, options: [fig("rect", 18, 18, "ungu"), fig("triDown", 42, 38, "pink"), fig("circle", 20, 20, "hijau")], answer: 1 }], explanation: "Gambar di atas semuanya besar. Segitiga terbalik juga besar. Dua pilihan lain kecil walaupun warnanya sama." }),
  C({ level: "Menantang", prompt: "Hitunglah banyaknya bentuk bangun pada robot.", parts: [{ kind: "count", picture: "robot", cats: ["lengkung", "segiempat", "segitiga"] }], explanation: "Lengkung: 2 mata dan 2 tangan, ada 4. Segi empat: kepala, leher, badan, 2 lengan, 2 kaki, ada 7. Segitiga: topi dan 2 sepatu, ada 3." }),
  A({ level: "Menantang", prompt: "Benda mana yang bentuknya berbeda?", parts: [{ kind: "pick", label: "Berbeda:", options: ["buku", "amplop", "rambu", "pintu"], answer: 2 }], explanation: "Buku, amplop, dan pintu segi empat. Rambu peringatan segitiga, jadi bentuknya berbeda." }),
  B({ level: "Menantang", prompt: "Warnailah. Merah untuk bentuk yang paling besar. Kuning untuk bentuk yang paling kecil.", parts: [{ kind: "paint", figs: [fig("rect", 30, 30, "hijau"), fig("rect", 46, 22, "hijau"), fig("rect", 40, 40, "hijau")] }], explanation: "Segi empat kanan paling besar, jadi merah. Segi empat kiri sedikit lebih kecil dari yang tengah, jadi kuning." }),

  C({ level: "Sangat menantang", prompt: "Susun keping menjadi roket.", parts: [{ kind: "slots", picture: "roket", order: [5, 1, 6, 0, 3, 2, 4] }], explanation: "Ujung roket segitiga, badan segi empat, 2 jendela lengkung, 2 sayap segitiga siku-siku yang arahnya berlawanan, dan api segitiga terbalik." }),
  A({ level: "Sangat menantang", prompt: "Pasangkan yang bentuknya sama.", parts: [{ kind: "match", left: ["lolipop", "amplop", "penggaris", "telur", "rambu"], right: [fig("rect", 46, 28, "biru"), fig("circle", 38, 38, "merah"), fig("tri", 40, 34, "ungu")], answer: [1, 0, 2, 1, 2] }], explanation: "Lolipop dan telur lengkung. Amplop segi empat. Penggaris segitiga dan rambu peringatan segitiga." }),
  B({ level: "Sangat menantang", prompt: "Lingkari semua bangun yang bentuk dan warnanya sama dengan gambar ini.", scene: { type: "group", figs: [fig("tri", 40, 34, "merah")] }, parts: [{ kind: "multi", label: "Bentuk dan warna sama:", items: [fig("tri", 24, 20, "merah"), fig("tri", 36, 30, "kuning"), fig("circle", 32, 32, "merah"), fig("right", 32, 36, "merah"), fig("rect", 30, 30, "merah"), fig("triDown", 34, 30, "hijau")], answers: [0, 3] }], explanation: "Harus segitiga dan merah. Segitiga merah kecil dan segitiga siku-siku merah memenuhi keduanya. Ukuran tidak dipakai." }),
  C({ level: "Sangat menantang", prompt: "Hitunglah banyaknya bangun datar pada perahu.", parts: [{ kind: "count", picture: "perahu", cats: ["semua"] }], explanation: "Ada 2 layar segitiga, 1 tiang, 1 badan perahu, dan 1 matahari. Semuanya 5 bangun datar." }),
  A({ level: "Sangat menantang", prompt: "Hubungkan garis putus-putusnya. Lalu pilih namanya.", parts: [{ kind: "trace", fig: fig("diamond", 64, 64, "pink"), answer: SE }], explanation: "Bangun ini diputar, tetapi sisinya tetap 4 dan semuanya lurus. Jadi segi empat." }),
  B({ level: "Sangat menantang", prompt: "Kelompokkan berdasarkan ukuran.", parts: [{ kind: "sort", same: true, items: [fig("tri", 20, 18, "merah"), fig("rect", 42, 40, "kuning"), fig("circle", 18, 18, "kuning"), fig("right", 44, 44, "merah"), fig("diamond", 20, 20, "hijau"), fig("circle", 44, 44, "hijau")], bins: ["Besar", "Kecil"], answer: [1, 0, 1, 0, 1, 0] }], explanation: "Segi empat kuning, segitiga siku-siku merah, dan lingkaran hijau besar. Tiga lainnya kecil. Warnanya tercampur, jadi lihat ukurannya saja." }),
  C({ level: "Sangat menantang", prompt: "Lingkari pasangannya agar mainan menjadi utuh.", parts: [{ kind: "puzzle", puzzle: "kunci", answer: 0 }], explanation: "Lubangnya punya kepala bulat dan kaki lurus. Potongan a pas. Potongan b kepalanya terlalu kecil, potongan c tidak punya kepala bulat." }),
];
