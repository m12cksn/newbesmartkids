/**
 * Kelas 1 Bab 8 - Mengenal Diagram (Buku Siswa Matematika SD/MI Kelas I, Kurikulum Merdeka 2022, hlm. 219-242).
 * A. Mengelompokkan Data (daftar dan tabel)  B. Diagram Gambar.
 * Bentuk soal mengikuti buku: menghitung benda yang tercampur lalu mengisi daftar ("Ada □ kelereng merah."), mengisi tabel,
 * membaca tabel tegak/mendatar, membaca diagram gambar (bintang, wajah, karet gelang, gambar benda), "… paling banyak adalah …",
 * "… lebih banyak dari …", jumlah semua, dan mewarnai diagram sesuai banyak data.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Color = "merah" | "biru" | "kuning" | "hijau" | "hitam" | "oranye" | "ungu" | "merahmuda" | "toska";
export type Obj =
  | "kelereng" | "bola" | "pita" | "pensil" | "jeruk" | "apel" | "mangga" | "belimbing" | "jambu"
  | "boneka" | "gasing" | "mobil" | "pesawat" | "jagung" | "wortel" | "brokoli" | "kol"
  | "kausPanjang" | "kausPendek" | "celana" | "ayam" | "bebek" | "kelinci" | "penghapus" | "penggaris";
export type Sym = "bintang" | "senyum" | "karet";
export type Item = { obj: Obj; color?: Color };
export const objName: Record<Obj, string> = {
  kelereng: "kelereng", bola: "bola", pita: "pita", pensil: "pensil", jeruk: "jeruk", apel: "apel", mangga: "mangga", belimbing: "belimbing", jambu: "jambu air",
  boneka: "boneka", gasing: "gasing", mobil: "mobil-mobilan", pesawat: "pesawat", jagung: "jagung", wortel: "wortel", brokoli: "brokoli", kol: "kol",
  kausPanjang: "kaus panjang", kausPendek: "kaus pendek", celana: "celana", ayam: "ayam", bebek: "bebek", kelinci: "kelinci", penghapus: "penghapus", penggaris: "penggaris",
};
export const colorName: Record<Color, string> = { merah: "merah", biru: "biru", kuning: "kuning", hijau: "hijau", hitam: "hitam", oranye: "oranye", ungu: "ungu", merahmuda: "merah muda", toska: "toska" };
export const itemName = (it: Item) => `${objName[it.obj]}${it.color ? ` ${colorName[it.color]}` : ""}`;

export type Row = { label: string; obj?: Obj; color?: Color; n: number };
export type Scene =
  /** Benda bercampur yang harus dihitung. */
  | { type: "scatter"; items: Item[] }
  /** Daftar bergambar tanpa angka. */
  | { type: "list"; title: string; rows: Row[] }
  /** Tabel menurun (v) atau mendatar (h). */
  | { type: "table"; title: string; head: [string, string]; orient: "v" | "h"; rows: Row[] }
  /** Diagram gambar; n = null berarti barisnya ditanyakan. axis = memakai nomor 1, 2, 3 di tepi. */
  | { type: "picto"; title: string; orient: "v" | "h"; sym: Sym | "obj"; unit: string; rows: (Omit<Row, "n"> & { n: number | null })[]; axis?: boolean };

export type Part =
  | { kind: "fill"; text: string; answers: number[] }
  | { kind: "choose"; text: string; options: string[]; answers: string[]; anyOrder?: boolean }
  /** Tabel yang harus dilengkapi; given = angkanya sudah tertulis. */
  | { kind: "table"; title: string; head: [string, string]; orient: "v" | "h"; rows: (Row & { given?: boolean })[] }
  /** Warnai lingkaran sesuai banyak data. */
  | { kind: "paint"; rows: Row[]; slots: number; unit: string }
  /** Ketuk benda lalu masukkan ke kotak kelompoknya. */
  | { kind: "group"; items: Item[]; cats: { label: string; obj?: Obj; color?: Color }[] };
export type DQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
const list = (v: string) => (v ? v.split("|") : []);
/** Kelompok yang benar untuk setiap benda: cocok warna (bila kelompok berwarna) atau jenis benda. */
export const catOf = (p: Extract<Part, { kind: "group" }>, it: Item) => p.cats.findIndex(c => (c.color ? c.color === it.color && (!c.obj || c.obj === it.obj) : c.obj === it.obj));
export const fieldCount = (p: Part) => {
  switch (p.kind) {
    case "fill": case "choose": return p.answers.length;
    case "table": return p.rows.filter(r => !r.given).length;
    case "paint": return p.rows.length;
    case "group": return p.items.length;
  }
};
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = list(v); return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const num = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "choose": return p.answers.join("|");
    case "table": return p.rows.filter(r => !r.given).map(r => r.n).join("|");
    case "paint": return p.rows.map(r => r.n).join("|");
    case "group": return p.items.map(it => catOf(p, it)).join("|");
  }
}
export function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "choose") return p.anyOrder ? [...x].sort().join("|") === [...p.answers].sort().join("|") : x.join("|") === p.answers.join("|");
  if (p.kind === "group") return x.join("|") === partKey(p);
  // Lingkaran kosong dihitung 0.
  if (p.kind === "paint") return x.map(c => (c === "" ? 0 : num(c))).join("|") === partKey(p);
  return partKey(p).split("|").every((k, i) => num(x[i]) === Number(k));
}
export function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "paint") return x.some(c => c !== "" && c !== "0");
  return x.every(c => c.trim() !== "");
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: DQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: DQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: DQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": case "choose": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "table": { let k = 0; return `${p.title}: ${p.rows.map(r => `${r.label} ${r.given ? r.n : x[k++] || "…"}`).join(", ")}`; }
      case "paint": return `diwarnai ${p.rows.map((r, k) => `${r.label} ${x[k] || 0}`).join(", ")}`;
      case "group": { const c = p.cats.map(() => 0); x.forEach(s => { if (s !== "") c[Number(s)]++; }); return `kelompok ${p.cats.map((g, k) => `${g.label} ${c[k]}`).join(", ")}${x.some(s => s === "") ? ", ada yang belum dikelompokkan" : ""}`; }
    }
  }).join(" | ");
}

/* ====================================================================== */
/* Materi                                                                  */
/* ====================================================================== */
export type Topic = { code: string; title: string; short: string; lab: string; steps: string[]; demo: string };
export const topics: Topic[] = [
  { code: "A", title: "Mengelompokkan Data", short: "Daftar dan Tabel", lab: "kelompok", steps: [
    "Kira merapikan toko mainan Paman. Mainan sejenis dikumpulkan dalam satu rak.",
    "Pesawat, mobil-mobilan, boneka, dan bola adalah contoh data. Data yang dikelompokkan bisa ditulis dalam daftar: Ada 5 pesawat.",
    "Data juga bisa ditulis dalam tabel yang terdiri dari baris dan kolom. Tabel bisa menurun atau mendatar, isinya sama.",
    "Dari daftar atau tabel, kita mudah melihat data yang paling banyak dan paling sedikit.",
  ], demo: "Ketuk rak tujuan, lalu ketuk mainan untuk memasukkannya. Tabel ikut terisi." },
  { code: "B", title: "Diagram Gambar", short: "Diagram Gambar", lab: "diagram", steps: [
    "Upe menanyakan sayur kesukaan teman-temannya. Hasilnya bisa digambar dalam diagram gambar.",
    "Setiap gambar mewakili 1 anak. Hitung gambar pada satu baris atau kolom untuk tahu banyaknya.",
    "Diagram gambar bisa tegak atau mendatar. Gambarnya bisa sayur, bintang, atau wajah.",
    "Baris atau kolom yang paling panjang adalah yang paling banyak. Jumlahkan semuanya untuk tahu banyak anak.",
  ], demo: "Tambah atau kurangi banyak anak untuk setiap sayur, lalu ubah bentuk diagramnya." },
];

/* ====================================================================== */
/* Pembuat soal                                                            */
/* ====================================================================== */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): DQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B] = [make(0), make(1)];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const choose = (text: string, options: string[], answers: string[], anyOrder = false): Part => ({ kind: "choose", text, options, answers, anyOrder });
/** Benda bercampur dengan urutan acak yang selalu sama (seed). */
export function mix(groups: [Item, number][], seed: number): Item[] {
  const out = groups.flatMap(([it, n]) => Array.from({ length: n }, () => ({ ...it })));
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) % 2147483648; const j = s % (i + 1); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
const scatter = (groups: [Item, number][], seed: number): Scene => ({ type: "scatter", items: mix(groups, seed) });
const rows = (spec: [string, Obj | undefined, number, Color?][]): Row[] => spec.map(([label, obj, n, color]) => ({ label, obj, n, color }));
const picto = (title: string, orient: "v" | "h", sym: Sym | "obj", unit: string, r: (Omit<Row, "n"> & { n: number | null })[], axis = false): Scene => ({ type: "picto", title, orient, sym, unit, rows: r, axis });
const C = (c: Color): Item => ({ obj: "kelereng", color: c });

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: DQuestion[][] = [
  [
    A({ prompt: "Amati gambar buah-buahan. Lengkapi daftarnya.", scene: scatter([[{ obj: "jeruk" }, 4], [{ obj: "apel" }, 3], [{ obj: "mangga" }, 6]], 7), parts: [fill("Ada □ buah jeruk.", 4), fill("Ada □ buah apel.", 3), fill("Ada □ buah mangga.", 6), choose("Buah yang paling banyak adalah □.", ["jeruk", "apel", "mangga"], ["mangga"])], explanation: "Hitung satu per satu: 4 jeruk, 3 apel, 6 mangga. Mangga paling banyak." }),
    A({ prompt: "Wei mempunyai pita warna-warni. Kelompokkan pita menurut warnanya.", parts: [{ kind: "group", items: mix([[{ obj: "pita", color: "merah" }, 3], [{ obj: "pita", color: "biru" }, 5], [{ obj: "pita", color: "kuning" }, 2]], 3), cats: [{ label: "Merah", color: "merah" }, { label: "Biru", color: "biru" }, { label: "Kuning", color: "kuning" }] }, choose("Pita yang paling banyak berwarna □.", ["merah", "biru", "kuning"], ["biru"])], explanation: "Setelah dikelompokkan: 3 pita merah, 5 pita biru, 2 pita kuning. Biru paling banyak." }),
    A({ prompt: "Hitung pensil, lalu isi tabelnya.", scene: scatter([[{ obj: "pensil", color: "kuning" }, 3], [{ obj: "pensil", color: "biru" }, 2], [{ obj: "pensil", color: "merah" }, 5], [{ obj: "pensil", color: "hitam" }, 4]], 11), parts: [{ kind: "table", title: "Tabel Pensil Warna", head: ["Warna Pensil", "Banyaknya"], orient: "h", rows: rows([["Kuning", "pensil", 3, "kuning"], ["Biru", "pensil", 2, "biru"], ["Merah", "pensil", 5, "merah"], ["Hitam", "pensil", 4, "hitam"]]) }, choose("Pensil warna yang paling sedikit adalah □.", ["kuning", "biru", "merah", "hitam"], ["biru"])], explanation: "Kuning 3, biru 2, merah 5, hitam 4. Biru paling sedikit." }),
    A({ prompt: "Bacalah tabel berikut.", scene: { type: "table", title: "Tabel Mainan Kesukaan", head: ["Mainan", "Banyak anak"], orient: "h", rows: rows([["Boneka", "boneka", 4], ["Gasing", "gasing", 6], ["Kelereng", "kelereng", 3, "biru"], ["Bola", "bola", 5]]) }, parts: [fill("Ada □ anak yang suka gasing.", 6), choose("Mainan yang paling disukai adalah □.", ["boneka", "gasing", "kelereng", "bola"], ["gasing"]), fill("Jumlah semua anak ada □.", 18)], explanation: "Baca baris Banyak anak di bawah gasing: 6. Gasing paling disukai. Semua anak: 4 + 6 + 3 + 5 = 18." }),
  ],
  [
    B({ prompt: "Amati diagram buah kesukaan.", scene: picto("Diagram Buah Kesukaan", "v", "bintang", "anak", rows([["Jeruk", "jeruk", 5], ["Apel", "apel", 3], ["Belimbing", "belimbing", 6], ["Jambu air", "jambu", 4]])), parts: [fill("□ anak suka buah apel.", 3), choose("Ada 4 anak yang suka buah □.", ["jeruk", "apel", "belimbing", "jambu air"], ["jambu air"])], explanation: "Setiap bintang mewakili 1 anak. Di atas apel ada 3 bintang. Di atas jambu air ada 4 bintang." }),
    B({ prompt: "Amati diagram mainan kesukaan.", scene: picto("Diagram Mainan Kesukaan", "h", "senyum", "anak", rows([["Kelereng", "kelereng", 4, "biru"], ["Mobil-mobilan", "mobil", 5], ["Boneka", "boneka", 2], ["Gasing", "gasing", 3]])), parts: [choose("Mainan yang paling sedikit disukai adalah □.", ["kelereng", "mobil-mobilan", "boneka", "gasing"], ["boneka"]), fill("Semua ada □ anak.", 14)], explanation: "Setiap wajah mewakili 1 anak: kelereng 4, mobil-mobilan 5, boneka 2, gasing 3. Boneka paling sedikit. Semua 4 + 5 + 2 + 3 = 14." }),
    B({ prompt: "Ibu membeli 4 jeruk, 2 apel, dan 5 mangga. Warnailah sesuai banyak buah.", parts: [{ kind: "paint", rows: rows([["Jeruk", "jeruk", 4], ["Apel", "apel", 2], ["Mangga", "mangga", 5]]), slots: 6, unit: "buah" }], explanation: "Satu lingkaran mewakili 1 buah. Warnai 4 lingkaran untuk jeruk, 2 untuk apel, dan 5 untuk mangga." }),
    B({ prompt: "Amati diagram karet gelang.", scene: picto("Diagram Banyak Karet Gelang", "v", "karet", "karet gelang", rows([["Malosi", undefined, 6, "merah"], ["Halim", undefined, 3, "kuning"], ["Upe", undefined, 4, "hijau"]])), parts: [fill("Karet gelang Malosi □ lebih banyak dari Halim.", 3), choose("Yang mempunyai karet gelang paling sedikit adalah □.", ["Malosi", "Halim", "Upe"], ["Halim"])], explanation: "Malosi 6, Halim 3, Upe 4. 6 − 3 = 3. Halim paling sedikit." }),
  ],
];

/* ---------- Evaluasi (24 soal: A dan B bergantian) ---------- */
const marbles = scatter([[C("merah"), 4], [C("biru"), 6], [C("kuning"), 3], [C("hijau"), 4]], 5);
export const assessment: DQuestion[] = [
  A({ level: "Sedang", prompt: "Hitung kelereng, lalu isi daftarnya.", scene: marbles, parts: [{ kind: "table", title: "Daftar Kelereng", head: ["Warna", "Banyaknya"], orient: "h", rows: rows([["Merah", "kelereng", 4, "merah"], ["Biru", "kelereng", 6, "biru"], ["Kuning", "kelereng", 3, "kuning"], ["Hijau", "kelereng", 4, "hijau"]]) }, choose("Kelereng yang paling banyak adalah kelereng □.", ["merah", "biru", "kuning", "hijau"], ["biru"])], explanation: "Kelompokkan menurut warna: merah 4, biru 6, kuning 3, hijau 4. Biru paling banyak." }),
  B({ level: "Sedang", prompt: "Amati diagram sayur kesukaan.", scene: picto("Diagram Sayur Kesukaan", "v", "bintang", "anak", rows([["Brokoli", "brokoli", 5], ["Wortel", "wortel", 8], ["Jagung", "jagung", 6]])), parts: [fill("□ anak suka wortel.", 8), choose("Sayur □ disukai 6 anak.", ["brokoli", "wortel", "jagung"], ["jagung"])], explanation: "Hitung bintang di atas setiap sayur: brokoli 5, wortel 8, jagung 6." }),
  A({ level: "Sedang", prompt: "Bacalah tabel berikut.", scene: { type: "table", title: "Tabel Kue Kesukaan", head: ["Nama Kue", "Banyak anak"], orient: "h", rows: rows([["Kue Talam", undefined, 6], ["Kue Cucur", undefined, 4], ["Kue Lapis", undefined, 5], ["Kue Bugis", undefined, 7]]) }, parts: [fill("Ada □ anak yang suka kue cucur.", 4), choose("Kue yang paling disukai adalah □.", ["kue talam", "kue cucur", "kue lapis", "kue bugis"], ["kue bugis"])], explanation: "Di bawah Kue Cucur tertulis 4. Angka terbesar 7 ada di bawah Kue Bugis." }),
  B({ level: "Sedang", prompt: "Ibu membeli 5 jeruk, 3 apel, dan 6 mangga. Warnailah sesuai banyak buah.", parts: [{ kind: "paint", rows: rows([["Jeruk", "jeruk", 5], ["Apel", "apel", 3], ["Mangga", "mangga", 6]]), slots: 7, unit: "buah" }], explanation: "Satu lingkaran mewakili 1 buah: warnai 5 untuk jeruk, 3 untuk apel, 6 untuk mangga." }),
  A({ level: "Sedang", prompt: "Kelompokkan bola menurut warnanya.", parts: [{ kind: "group", items: mix([[{ obj: "bola", color: "merah" }, 5], [{ obj: "bola", color: "kuning" }, 3], [{ obj: "bola", color: "hijau" }, 4]], 9), cats: [{ label: "Merah", color: "merah" }, { label: "Kuning", color: "kuning" }, { label: "Hijau", color: "hijau" }] }, choose("Bola yang paling sedikit berwarna □.", ["merah", "kuning", "hijau"], ["kuning"])], explanation: "Setelah dikelompokkan: merah 5, kuning 3, hijau 4. Kuning paling sedikit." }),
  B({ level: "Sedang", prompt: "Amati diagram mainan kesukaan.", scene: picto("Diagram Mainan Kesukaan", "h", "senyum", "anak", rows([["Kelereng", "kelereng", 3, "biru"], ["Mobil-mobilan", "mobil", 6], ["Boneka", "boneka", 4], ["Gasing", "gasing", 2]])), parts: [fill("Ada □ anak yang suka boneka.", 4), choose("Mainan yang paling sedikit adalah □.", ["kelereng", "mobil-mobilan", "boneka", "gasing"], ["gasing"])], explanation: "Setiap wajah mewakili 1 anak. Boneka 4 wajah. Gasing hanya 2 wajah, paling sedikit." }),
  A({ level: "Sedang", prompt: "Kira merapikan mainan di toko Paman.", scene: { type: "list", title: "Daftar Mainan di Toko", rows: rows([["Pesawat", "pesawat", 7], ["Mobil-mobilan", "mobil", 5], ["Boneka", "boneka", 8], ["Bola", "bola", 4]]) }, parts: [choose("Mainan yang paling sedikit adalah □.", ["pesawat", "mobil-mobilan", "boneka", "bola"], ["bola"]), fill("Ada □ boneka.", 8)], explanation: "Hitung gambar pada setiap baris: pesawat 7, mobil-mobilan 5, boneka 8, bola 4. Bola paling sedikit." }),
  B({ level: "Sedang", prompt: "Amati diagram karet gelang.", scene: picto("Diagram Banyak Karet Gelang", "v", "karet", "karet gelang", rows([["Malosi", undefined, 4, "merah"], ["Halim", undefined, 6, "kuning"], ["Upe", undefined, 5, "hijau"]])), parts: [fill("Upe mempunyai □ karet gelang.", 5), choose("Karet gelang paling banyak milik □.", ["Malosi", "Halim", "Upe"], ["Halim"])], explanation: "Setiap gambar mewakili 1 karet gelang: Malosi 4, Halim 6, Upe 5. Halim paling banyak." }),

  A({ level: "Menantang", prompt: "Hitung pensil, lalu isi tabelnya.", scene: scatter([[{ obj: "pensil", color: "kuning" }, 4], [{ obj: "pensil", color: "biru" }, 5], [{ obj: "pensil", color: "merah" }, 3], [{ obj: "pensil", color: "hitam" }, 5]], 13), parts: [{ kind: "table", title: "Tabel Pensil Warna", head: ["Warna Pensil", "Banyaknya"], orient: "v", rows: rows([["Kuning", "pensil", 4, "kuning"], ["Biru", "pensil", 5, "biru"], ["Merah", "pensil", 3, "merah"], ["Hitam", "pensil", 5, "hitam"]]) }, choose("Pensil yang sama banyak adalah □ dan □.", ["kuning", "biru", "merah", "hitam"], ["biru", "hitam"], true)], explanation: "Kuning 4, biru 5, merah 3, hitam 5. Biru dan hitam sama banyak, yaitu 5." }),
  B({ level: "Menantang", prompt: "Amati diagram buah kesukaan.", scene: picto("Diagram Buah Kesukaan", "v", "bintang", "anak", rows([["Jeruk", "jeruk", 6], ["Apel", "apel", 4], ["Belimbing", "belimbing", 7], ["Jambu air", "jambu", 5]])), parts: [fill("Yang suka belimbing □ lebih banyak dari yang suka apel.", 3), choose("Buah yang paling disukai adalah □.", ["jeruk", "apel", "belimbing", "jambu air"], ["belimbing"])], explanation: "Belimbing 7 bintang, apel 4 bintang. 7 − 4 = 3. Belimbing paling banyak bintangnya." }),
  A({ level: "Menantang", prompt: "Tabel A menurun. Salin datanya ke Tabel B yang mendatar.", scene: { type: "table", title: "Tabel A: Banyak Bola", head: ["Warna Bola", "Banyaknya"], orient: "v", rows: rows([["Merah", "bola", 6, "merah"], ["Kuning", "bola", 3, "kuning"], ["Hijau", "bola", 8, "hijau"]]) }, parts: [{ kind: "table", title: "Tabel B: Banyak Bola", head: ["Warna Bola", "Banyaknya"], orient: "h", rows: rows([["Merah", "bola", 6, "merah"], ["Kuning", "bola", 3, "kuning"], ["Hijau", "bola", 8, "hijau"]]) }], explanation: "Isinya sama, hanya bentuknya mendatar: merah 6, kuning 3, hijau 8." }),
  B({ level: "Menantang", prompt: "Pak Budi punya 5 ayam. Bebek 2 kurangnya dari ayam. Kelinci 1 lebihnya dari ayam. Warnailah diagramnya.", parts: [{ kind: "paint", rows: rows([["Ayam", "ayam", 5], ["Bebek", "bebek", 3], ["Kelinci", "kelinci", 6]]), slots: 7, unit: "hewan" }], explanation: "Ayam 5. Bebek 2 kurangnya: 5 − 2 = 3. Kelinci 1 lebihnya: 5 + 1 = 6." }),
  A({ level: "Menantang", prompt: "Bacalah tabel berikut.", scene: { type: "table", title: "Tabel Mainan Kesukaan", head: ["Mainan", "Banyak anak"], orient: "v", rows: rows([["Boneka", "boneka", 5], ["Gasing", "gasing", 7], ["Kelereng", "kelereng", 4, "biru"], ["Bola", "bola", 6]]) }, parts: [choose("Mana yang lebih banyak disukai, boneka atau bola? □", ["boneka", "bola"], ["bola"]), fill("Jumlah semua anak ada □.", 22)], explanation: "Boneka 5, bola 6, jadi bola lebih banyak. Jumlah semua: 5 + 7 + 4 + 6 = 22." }),
  B({ level: "Menantang", prompt: "Pakaian Kira. Warnai sesuai banyaknya.", scene: scatter([[{ obj: "kausPanjang", color: "toska" }, 4], [{ obj: "kausPendek", color: "oranye" }, 5], [{ obj: "celana", color: "merahmuda" }, 3]], 4), parts: [{ kind: "paint", rows: rows([["Kaus panjang", "kausPanjang", 4], ["Kaus pendek", "kausPendek", 5], ["Celana", "celana", 3]]), slots: 6, unit: "pakaian" }, fill("Jumlah semua pakaian adalah □.", 12)], explanation: "Kaus panjang 4, kaus pendek 5, celana 3. Jumlahnya 4 + 5 + 3 = 12." }),
  A({ level: "Menantang", prompt: "Perhatikan kelereng berikut.", scene: scatter([[C("merah"), 5], [C("biru"), 3], [C("kuning"), 5], [C("hijau"), 2]], 21), parts: [choose("Kelereng yang sama banyak adalah kelereng □ dan □.", ["merah", "biru", "kuning", "hijau"], ["merah", "kuning"], true), choose("Kelereng yang paling sedikit adalah kelereng □.", ["merah", "biru", "kuning", "hijau"], ["hijau"])], explanation: "Merah 5, biru 3, kuning 5, hijau 2. Merah dan kuning sama banyak. Hijau paling sedikit." }),
  B({ level: "Menantang", prompt: "Amati diagram sayur kesukaan.", scene: picto("Diagram Sayur Kesukaan", "h", "obj", "anak", rows([["Jagung", "jagung", 3], ["Wortel", "wortel", 5], ["Brokoli", "brokoli", 4], ["Kol", "kol", 2]]), true), parts: [fill("Semua ada □ anak.", 14), choose("Sayur yang paling disukai adalah □.", ["jagung", "wortel", "brokoli", "kol"], ["wortel"])], explanation: "Jagung 3, wortel 5, brokoli 4, kol 2. Semua 3 + 5 + 4 + 2 = 14. Wortel paling disukai." }),
  A({ level: "Menantang", prompt: "Kelompokkan alat tulis Kira menurut jenisnya.", parts: [{ kind: "group", items: mix([[{ obj: "pensil", color: "biru" }, 4], [{ obj: "penghapus" }, 2], [{ obj: "penggaris" }, 3]], 17), cats: [{ label: "Pensil", obj: "pensil" }, { label: "Penghapus", obj: "penghapus" }, { label: "Penggaris", obj: "penggaris" }] }, fill("Semua ada □ alat tulis.", 9)], explanation: "Pensil 4, penghapus 2, penggaris 3. Semua ada 4 + 2 + 3 = 9." }),

  B({ level: "Sangat menantang", prompt: "Lengkapi diagram dari tabel buah Ibu.", scene: { type: "table", title: "Tabel Buah Ibu", head: ["Buah", "Banyaknya"], orient: "h", rows: rows([["Jeruk", "jeruk", 6], ["Apel", "apel", 3], ["Mangga", "mangga", 4], ["Belimbing", "belimbing", 5]]) }, parts: [{ kind: "paint", rows: rows([["Jeruk", "jeruk", 6], ["Apel", "apel", 3], ["Mangga", "mangga", 4], ["Belimbing", "belimbing", 5]]), slots: 6, unit: "buah" }], explanation: "Satu lingkaran mewakili 1 buah: jeruk 6, apel 3, mangga 4, belimbing 5." }),
  A({ level: "Sangat menantang", prompt: "Ada 20 anak. Lengkapi tabelnya.", scene: { type: "table", title: "Tabel Kue Kesukaan", head: ["Nama Kue", "Banyak anak"], orient: "h", rows: rows([["Kue Talam", undefined, 6], ["Kue Cucur", undefined, 5], ["Kue Lapis", undefined, 4]]) }, parts: [{ kind: "table", title: "Tabel Kue Kesukaan", head: ["Nama Kue", "Banyak anak"], orient: "h", rows: [{ label: "Kue Talam", n: 6, given: true }, { label: "Kue Cucur", n: 5, given: true }, { label: "Kue Lapis", n: 4, given: true }, { label: "Kue Bugis", n: 5 }] }, choose("Kue yang sama banyak disukai adalah □ dan □.", ["kue talam", "kue cucur", "kue lapis", "kue bugis"], ["kue cucur", "kue bugis"], true)], explanation: "6 + 5 + 4 = 15. Agar semuanya 20, kue bugis disukai 20 − 15 = 5 anak. Kue cucur dan kue bugis sama-sama 5." }),
  B({ level: "Sangat menantang", prompt: "Amati diagram sayur kesukaan anak.", scene: picto("Diagram Sayur Kesukaan", "v", "obj", "anak", rows([["Jagung", "jagung", 4], ["Wortel", "wortel", 6], ["Brokoli", "brokoli", 4], ["Kol", "kol", 3]]), true), parts: [fill("Jumlah anak yang suka jagung dan kol adalah □.", 7), choose("Sayur yang disukai sama banyak adalah □ dan □.", ["jagung", "wortel", "brokoli", "kol"], ["jagung", "brokoli"], true)], explanation: "Jagung 4 dan kol 3, jumlahnya 7. Jagung dan brokoli sama-sama 4." }),
  A({ level: "Sangat menantang", prompt: "Hitung buah, lalu isi tabelnya.", scene: scatter([[{ obj: "jeruk" }, 5], [{ obj: "apel" }, 6], [{ obj: "mangga" }, 4], [{ obj: "belimbing" }, 6]], 29), parts: [{ kind: "table", title: "Tabel Buah", head: ["Buah", "Banyaknya"], orient: "h", rows: rows([["Jeruk", "jeruk", 5], ["Apel", "apel", 6], ["Mangga", "mangga", 4], ["Belimbing", "belimbing", 6]]) }, fill("Apel □ lebih banyak dari mangga.", 2)], explanation: "Jeruk 5, apel 6, mangga 4, belimbing 6. Apel 6 − 4 = 2 lebih banyak dari mangga." }),
  B({ level: "Sangat menantang", prompt: "Semua ada 16 anak. Gasing belum digambar.", scene: picto("Diagram Mainan Kesukaan", "h", "senyum", "anak", [{ label: "Kelereng", obj: "kelereng", color: "biru", n: 5 }, { label: "Mobil-mobilan", obj: "mobil", n: 4 }, { label: "Boneka", obj: "boneka", n: 3 }, { label: "Gasing", obj: "gasing", n: null }]), parts: [fill("Ada □ anak yang suka gasing.", 4), choose("Mainan yang disukai sama banyak adalah □ dan □.", ["kelereng", "mobil-mobilan", "boneka", "gasing"], ["mobil-mobilan", "gasing"], true)], explanation: "5 + 4 + 3 = 12. Gasing 16 − 12 = 4 anak, sama dengan mobil-mobilan." }),
  A({ level: "Sangat menantang", prompt: "Bacalah tabel berikut.", scene: { type: "table", title: "Tabel Buah Kesukaan", head: ["Buah", "Banyak anak"], orient: "v", rows: rows([["Jeruk", "jeruk", 7], ["Apel", "apel", 4], ["Mangga", "mangga", 6], ["Jambu air", "jambu", 3]]) }, parts: [fill("Yang suka jeruk □ lebih banyak dari yang suka jambu air.", 4), fill("Jumlah anak yang suka apel dan mangga adalah □.", 10)], explanation: "Jeruk 7 dan jambu air 3, selisihnya 7 − 3 = 4. Apel 4 dan mangga 6, jumlahnya 4 + 6 = 10." }),
  B({ level: "Sangat menantang", prompt: "Amati karet gelang Malosi, Halim, dan Upe.", scene: picto("Diagram Banyak Karet Gelang", "v", "karet", "karet gelang", rows([["Malosi", undefined, 5, "merah"], ["Halim", undefined, 2, "kuning"], ["Upe", undefined, 7, "hijau"]])), parts: [fill("Halim butuh □ lagi agar sama banyak dengan Malosi.", 3), fill("Semuanya ada □ karet gelang.", 14)], explanation: "Malosi 5, Halim 2: 5 − 2 = 3 lagi. Semuanya 5 + 2 + 7 = 14." }),
];
