/**
 * Kelas 1 Bab 6 - Penjumlahan dan Pengurangan sampai dengan 20 (Buku Siswa Matematika SD/MI Kelas I, Kurikulum Merdeka 2022, hlm. 175-196).
 * A. Mengenal Konsep Lebih dari, Kurang dari, dan Selisih  B. Penjumlahan yang Hasilnya Kurang dari 20
 * C. Pengurangan yang Hasilnya Kurang dari 20.
 * Bentuk soal mengikuti buku: "Ada □ …", "… □ lebihnya/kurangnya dari …", selisih dari cerita, gambar dua kelompok
 * (A n kurangnya dari B), menghitung maju/mundur pada pita bilangan, penjumlahan 10 dan penjumlahan berulang
 * (memisah bilangan), pasangan bilangan (memisah puluhan dan satuan), tabel nilai tempat bersusun,
 * dan soal cerita "… [tanda] … = …".
 */
import type { Question } from "./grade-four-whole-numbers";
import type { Thing } from "./grade-one-sub10-v2";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type { Thing };
export type Op = "+" | "−";
export const apply = (a: number, op: Op, b: number) => (op === "+" ? a + b : a - b);

export type Scene =
  /** Dua (atau tiga) kelompok berlabel; null = banyaknya ditanyakan, digambar "?". */
  | { type: "groups"; items: { thing: Thing; n: number | null; label: string; alt?: boolean }[] }
  /** Sekelompok benda. */
  | { type: "objs"; thing: Thing; n: number };

/** Kolom bersusun: a, b, dan hasil. Kotak yang dikosongkan: at/ao (puluhan/satuan a), b, rt/ro (puluhan/satuan hasil). */
export type Slot = "at" | "ao" | "b" | "rt" | "ro";
export type Part =
  /** Kalimat dengan kotak isian □. */
  | { kind: "fill"; text: string; answers: number[] }
  /** Pita bilangan dengan kotak kosong (menghitung maju/mundur). */
  | { kind: "strip"; items: (number | null)[] }
  /** Garis bilangan: ketuk tempat mendarat. */
  | { kind: "hop"; start: number; steps: number; op: Op }
  /** Memisah satu bilangan menjadi dua bagian (penjumlahan 10, berulang, pasangan bilangan). */
  | { kind: "split"; a: number; op: Op; b: number; which: 0 | 1; parts: [number | null, number | null]; answers: number[] }
  /** Tabel nilai tempat bersusun. */
  | { kind: "column"; a: number; op: Op; b: number; blanks: Slot[] }
  /** Tulis operasi lengkap: … [tanda] … = … */
  | { kind: "eq"; a: number; op: Op; b: number }
  /** Gambar dua kelompok: A `diff` kurangnya (less = "A") atau lebihnya (less = "B") dari B. */
  | { kind: "draw"; diff: number; less: "A" | "B"; thing: Thing };
export type SQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
const list = (v: string) => (v ? v.split("|") : []);
export function stripFull(items: (number | null)[]) {
  const k = items.map((v, i) => [i, v] as const).filter((x): x is readonly [number, number] => x[1] !== null);
  const [[i0, v0], [i1, v1]] = k, step = (v1 - v0) / (i1 - i0);
  return items.map((_, i) => v0 + step * (i - i0));
}
export const columnValue = (p: Extract<Part, { kind: "column" }>, s: Slot) => { const r = apply(p.a, p.op, p.b); return { at: Math.floor(p.a / 10), ao: p.a % 10, b: p.b, rt: Math.floor(r / 10), ro: r % 10 }[s]; };
export const fieldCount = (p: Part) => {
  switch (p.kind) {
    case "fill": case "split": return p.answers.length;
    case "strip": return p.items.filter(x => x === null).length;
    case "column": return p.blanks.length;
    case "eq": return 4;
    case "draw": return 2;
    default: return 1;
  }
};
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = list(v); return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const num = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": case "split": return p.answers.join("|");
    case "strip": { const f = stripFull(p.items); return p.items.map((v, i) => (v === null ? f[i] : null)).filter(v => v !== null).join("|"); }
    case "hop": return String(apply(p.start, p.op, p.steps));
    case "column": return p.blanks.map(s => columnValue(p, s)).join("|");
    case "eq": return `${p.a}|${p.op}|${p.b}|${apply(p.a, p.op, p.b)}`;
    /* Contoh jawaban: kelompok yang lebih sedikit berisi 2 benda. */
    case "draw": return p.less === "A" ? `2|${2 + p.diff}` : `${2 + p.diff}|2`;
  }
}
export function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "eq": { const [a, op, b, c] = [num(x[0]), x[1], num(x[2]), num(x[3])];
      if (op !== p.op || c !== apply(p.a, p.op, p.b)) return false;
      /* Penjumlahan boleh ditukar urutannya (11 + 6 sama dengan 6 + 11). */
      return p.op === "+" ? (a === p.a && b === p.b) || (a === p.b && b === p.a) : a === p.a && b === p.b; }
    /* Banyak benda bebas, asalkan selisihnya tepat dan arahnya benar. */
    case "draw": { const [a, b] = x.map(num); return a >= 1 && b >= 1 && a <= 12 && b <= 12 && (p.less === "A" ? b - a : a - b) === p.diff; }
    case "hop": return v === partKey(p);
    default: { const key = partKey(p).split("|"); return key.every((k, i) => num(x[i]) === Number(k)); }
  }
}
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "hop") return v !== "";
  if (p.kind === "draw") return cells(p, v).every(c => c !== "" && c !== "0");
  return cells(p, v).every(c => c.trim() !== "");
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
      case "strip": { let k = 0; return p.items.map(n => (n === null ? x[k++] || "…" : String(n))).join(", "); }
      case "hop": return `${p.start} ${p.op} ${p.steps} = ${v[i] || "…"}`;
      case "split": { let k = 0; const f = (n: number | null) => (n === null ? x[k++] || "…" : String(n)); return `${p.which ? p.b : p.a} dipisah menjadi ${f(p.parts[0])} dan ${f(p.parts[1])}`; }
      case "column": return p.blanks.map((s, k) => `${{ at: "puluhan bilangan pertama", ao: "satuan bilangan pertama", b: "bilangan kedua", rt: "puluhan hasil", ro: "satuan hasil" }[s]} ${x[k] || "…"}`).join(", ");
      case "eq": return `${x[0] || "…"} ${x[1] || "□"} ${x[2] || "…"} = ${x[3] || "…"}`;
      case "draw": return `A ada ${x[0] || 0}, B ada ${x[1] || 0}`;
    }
  }).join(" | ");
}

/* ====================================================================== */
/* Materi                                                                  */
/* ====================================================================== */
export type Topic = { code: string; title: string; short: string; lab: string; steps: string[]; demo: string };
export const topics: Topic[] = [
  { code: "A", title: "Mengenal Konsep Lebih dari, Kurang dari, dan Selisih", short: "Selisih", lab: "selisih", steps: [
    "Ibu menghias 7 donat, Tika menghias 6 donat. Donat Ibu 1 lebihnya dari donat Tika.",
    "Donat Tika 1 kurangnya dari donat Ibu. Beda atau selisih banyaknya adalah 1.",
    "Selisih dicari dengan mengurangkan: bilangan yang lebih besar dikurangi yang lebih kecil. 7 − 6 = 1.",
    "Pasangkan benda satu-satu. Benda yang tidak punya pasangan adalah selisihnya.",
  ], demo: "Atur banyak donat Ibu dan Tika. Donat dipasangkan satu-satu, sisanya adalah selisih." },
  { code: "B", title: "Penjumlahan yang Hasilnya Kurang dari 20", short: "Penjumlahan", lab: "tambah", steps: [
    "Menghitung maju: 7 + 6, mulai dari 7 lalu maju 6 langkah: 8, 9, 10, 11, 12, 13.",
    "Dengan 10: 6 dipisah menjadi 3 dan 3. 7 + 3 = 10, lalu 10 + 3 = 13.",
    "Penjumlahan berulang: 7 dipisah menjadi 1 dan 6. 6 + 6 = 12, lalu 12 + 1 = 13.",
    "Puluhan dengan satuan: 12 + 3. 12 dipisah menjadi 10 dan 2. 2 + 3 = 5, lalu 10 + 5 = 15.",
    "Nilai tempat: jumlahkan satuannya dulu (2 + 3 = 5), puluhannya tetap 1. Jadi 15.",
  ], demo: "Pilih caranya: maju di pita bilangan, penuhi bingkai 10, atau jumlahkan dengan tabel nilai tempat." },
  { code: "C", title: "Pengurangan yang Hasilnya Kurang dari 20", short: "Pengurangan", lab: "kurang", steps: [
    "Tika membeli 15 apel, 3 dimakan ulat. Sisanya 15 − 3.",
    "Menghitung mundur: dari 15 mundur 3 langkah: 14, 13, 12. Jadi 15 − 3 = 12.",
    "Pasangan bilangan: 15 dipisah menjadi 10 dan 5. 5 − 3 = 2, lalu 10 + 2 = 12.",
    "Nilai tempat: kurangkan satuannya (5 − 3 = 2), puluhannya tetap 1. Jadi 12.",
  ], demo: "Pilih caranya: mundur di pita bilangan, coret satuan dari pasangan 10, atau kurangkan dengan tabel." },
];

/* ====================================================================== */
/* Pembuat soal                                                            */
/* ====================================================================== */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): SQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B, C] = [make(0), make(1), make(2)];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const two = (t1: Thing, n1: number | null, l1: string, t2: Thing, n2: number | null, l2: string, alt2 = false): Scene => ({ type: "groups", items: [{ thing: t1, n: n1, label: l1 }, { thing: t2, n: n2, label: l2, alt: alt2 }] });
const eq = (a: number, op: Op, b: number): Part => ({ kind: "eq", a, op, b });

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: SQuestion[][] = [
  [
    A({ prompt: "Perhatikan kelereng merah dan hijau.", scene: two("kelereng", 9, "merah", "kelereng", 6, "hijau", true), parts: [fill("Ada □ kelereng merah.", 9), fill("Ada □ kelereng hijau.", 6), fill("Kelereng merah □ lebihnya dari kelereng hijau.", 3)], explanation: "Ada 9 merah dan 6 hijau. Pasangkan satu-satu, sisa 3 merah tanpa pasangan. 9 − 6 = 3." }),
    A({ prompt: "Perhatikan donat dan bolu.", scene: two("donat", 6, "donat", "bolu", 9, "bolu"), parts: [fill("Ada □ donat.", 6), fill("Ada □ bolu.", 9), fill("Banyak donat □ kurangnya dari banyak bolu.", 3)], explanation: "Ada 6 donat dan 9 bolu. 9 − 6 = 3, jadi donat 3 kurangnya dari bolu." }),
    A({ prompt: "Wei mempunyai 7 boneka. Kira mempunyai 9 boneka. Berapa selisih banyak boneka mereka?", scene: two("boneka", 7, "Wei", "boneka", 9, "Kira"), parts: [eq(9, "−", 7), fill("Selisihnya □ boneka.", 2)], explanation: "Bilangan yang lebih besar dikurangi yang lebih kecil: 9 − 7 = 2." }),
    A({ prompt: "Gambarlah dua kelompok benda. Banyak benda A 2 kurangnya dari banyak benda B.", parts: [{ kind: "draw", diff: 2, less: "A", thing: "apel" }], explanation: "Banyak bendanya boleh berapa saja, asalkan B 2 lebih banyak dari A. Contohnya A ada 3 dan B ada 5." }),
  ],
  [
    B({ prompt: "Hitunglah dengan menghitung maju.", parts: [{ kind: "strip", items: [6, null, null, 9, null, null] }, fill("6 + 5 = □", 11)], explanation: "Mulai dari 6, maju 5 langkah: 7, 8, 9, 10, 11. Jadi 6 + 5 = 11." }),
    B({ prompt: "Hitunglah dengan penjumlahan 10. 5 dipisah menjadi 2 dan 3.", parts: [{ kind: "split", a: 8, op: "+", b: 5, which: 1, parts: [null, null], answers: [2, 3] }, fill("8 + 2 = □", 10), fill("10 + 3 = □", 13)], explanation: "8 butuh 2 agar menjadi 10. Sisa 3. 10 + 3 = 13." }),
    B({ prompt: "Hitunglah dengan tabel nilai tempat.", parts: [{ kind: "column", a: 13, op: "+", b: 4, blanks: ["rt", "ro"] }, fill("13 + 4 = □", 17)], explanation: "Satuan: 3 + 4 = 7. Puluhan tetap 1. Jadi 17." }),
    B({ prompt: "Halim mempunyai 11 kelereng. Malosi mempunyai 6 kelereng. Berapa jumlah kelereng mereka?", scene: two("kelereng", 11, "Halim", "kelereng", 6, "Malosi", true), parts: [eq(11, "+", 6)], explanation: "Jumlah artinya digabungkan: 11 + 6 = 17." }),
  ],
  [
    C({ prompt: "Hitunglah 16 − 4 dengan menghitung mundur. Ketuk tempat mendarat.", parts: [{ kind: "hop", start: 16, steps: 4, op: "−" }], explanation: "Dari 16 mundur 4 langkah: 15, 14, 13, 12. Jadi 16 − 4 = 12." }),
    C({ prompt: "Hitunglah 18 − 5 dengan pasangan bilangan.", parts: [{ kind: "split", a: 18, op: "−", b: 5, which: 0, parts: [10, null], answers: [8] }, fill("8 − 5 = □", 3), fill("18 − 5 = □", 13)], explanation: "18 dipisah menjadi 10 dan 8. 8 − 5 = 3, lalu 10 + 3 = 13." }),
    C({ prompt: "Hitunglah 16 − 4 dengan tabel nilai tempat.", parts: [{ kind: "column", a: 16, op: "−", b: 4, blanks: ["rt", "ro"] }], explanation: "Satuan: 6 − 4 = 2. Puluhan tetap 1. Jadi 12." }),
    C({ prompt: "Ibu membeli 14 bolu kukus. Malosi memakan 3 bolu kukus. Berapa sisa bolu kukus Ibu?", scene: { type: "objs", thing: "bolu", n: 14 }, parts: [eq(14, "−", 3)], explanation: "Sisa artinya dikurangi: 14 − 3 = 11." }),
  ],
];

/* ---------- Evaluasi (24 soal: A, B, C bergantian) ---------- */
export const assessment: SQuestion[] = [
  A({ level: "Sedang", prompt: "Perhatikan kue lapis dan donat.", scene: two("kuelapis", 9, "kue lapis", "donat", 6, "donat"), parts: [fill("Ada □ kue lapis.", 9), fill("Ada □ donat.", 6), fill("Kue lapis □ lebihnya dari donat.", 3)], explanation: "9 kue lapis dan 6 donat. 9 − 6 = 3." }),
  B({ level: "Sedang", prompt: "Hitunglah penjumlahan berikut. Gunakan cara yang paling mudah.", parts: [fill("14 + 3 = □", 17), fill("12 + 6 = □", 18)], explanation: "Jumlahkan satuannya, puluhannya tetap 1: 4 + 3 = 7, jadi 17. 2 + 6 = 8, jadi 18." }),
  C({ level: "Sedang", prompt: "Hitunglah pengurangan berikut. Gunakan cara yang paling mudah.", parts: [fill("18 − 5 = □", 13), fill("16 − 4 = □", 12)], explanation: "Kurangkan satuannya, puluhannya tetap 1: 8 − 5 = 3, jadi 13. 6 − 4 = 2, jadi 12." }),
  A({ level: "Sedang", prompt: "Tika mempunyai 9 pita. Kira mempunyai 6 pita.", scene: two("pita", 9, "Tika", "pita", 6, "Kira", true), parts: [fill("Selisih banyak pita Tika dan Kira adalah □.", 3)], explanation: "9 − 6 = 3. Pasangkan pita satu-satu, sisa 3 pita Tika." }),
  B({ level: "Sedang", prompt: "Hitunglah dengan menghitung maju.", parts: [{ kind: "strip", items: [8, null, 10, null, null, null, 14] }, fill("8 + 6 = □", 14)], explanation: "Mulai dari 8, maju 6 langkah: 9, 10, 11, 12, 13, 14." }),
  C({ level: "Sedang", prompt: "Hitunglah 17 − 3 dengan menghitung mundur. Ketuk tempat mendarat.", parts: [{ kind: "hop", start: 17, steps: 3, op: "−" }], explanation: "Dari 17 mundur 3 langkah: 16, 15, 14. Jadi 17 − 3 = 14." }),
  A({ level: "Sedang", prompt: "Gambarlah dua kelompok benda. Banyak benda A 3 kurangnya dari banyak benda B.", parts: [{ kind: "draw", diff: 3, less: "A", thing: "bola" }], explanation: "B harus 3 lebih banyak dari A. Contohnya A ada 2 dan B ada 5." }),
  B({ level: "Sedang", prompt: "Ada 12 bebek sedang mencari makan. Datang lagi 3 bebek. Berapa jumlah semua bebek?", scene: two("bebek", 12, "mencari makan", "bebek", 3, "datang lagi"), parts: [eq(12, "+", 3)], explanation: "Datang lagi artinya ditambah: 12 + 3 = 15." }),

  C({ level: "Menantang", prompt: "Hitunglah 19 − 6 dengan pasangan bilangan.", parts: [{ kind: "split", a: 19, op: "−", b: 6, which: 0, parts: [null, null], answers: [10, 9] }, fill("9 − 6 = □", 3), fill("19 − 6 = □", 13)], explanation: "19 dipisah menjadi 10 dan 9. 9 − 6 = 3, lalu 10 + 3 = 13." }),
  A({ level: "Menantang", prompt: "Perhatikan mobil-mobilan dan boneka.", scene: two("mobil", 7, "mobil-mobilan", "boneka", 12, "boneka"), parts: [fill("Mobil-mobilan □ kurangnya dari boneka.", 5), fill("Beda banyak boneka dan mobil-mobilan adalah □.", 5)], explanation: "7 mobil-mobilan dan 12 boneka. 12 − 7 = 5, jadi mobil-mobilan 5 kurangnya dan bedanya 5." }),
  B({ level: "Menantang", prompt: "Hitunglah dengan penjumlahan 10. 6 dipisah menjadi 3 dan 3.", parts: [{ kind: "split", a: 7, op: "+", b: 6, which: 1, parts: [null, 3], answers: [3] }, fill("7 + 3 = □", 10), fill("10 + 3 = □", 13)], explanation: "7 butuh 3 agar menjadi 10. Sisa 3 dari 6. 10 + 3 = 13." }),
  C({ level: "Menantang", prompt: "Hitunglah 17 − 5 dengan tabel nilai tempat.", parts: [{ kind: "column", a: 17, op: "−", b: 5, blanks: ["ao", "b", "rt", "ro"] }], explanation: "17 adalah 1 puluhan dan 7 satuan. Satuan: 7 − 5 = 2. Puluhan tetap 1. Jadi 12." }),
  A({ level: "Menantang", prompt: "Dina mempunyai 8 kelereng. Beni mempunyai 3 kelereng lebihnya dari Dina.", scene: two("kelereng", 8, "Dina", "kelereng", null, "Beni"), parts: [fill("Kelereng Beni ada □.", 11), fill("Selisih kelereng Beni dan Dina adalah □.", 3)], explanation: "3 lebihnya dari 8: 8 + 3 = 11. Selisihnya 11 − 8 = 3." }),
  B({ level: "Menantang", prompt: "Hitunglah 6 + 7 dengan penjumlahan berulang. 7 dipisah menjadi 1 dan 6.", parts: [{ kind: "split", a: 6, op: "+", b: 7, which: 1, parts: [null, null], answers: [1, 6] }, fill("6 + 6 = □", 12), fill("12 + 1 = □", 13)], explanation: "6 + 6 = 12 karena penjumlahan berulang. Ditambah sisa 1 menjadi 13." }),
  C({ level: "Menantang", prompt: "Ani membeli 15 apel. Ternyata 3 apel dimakan ulat. Berapa sisa apel yang masih bagus?", scene: { type: "objs", thing: "apel", n: 15 }, parts: [eq(15, "−", 3)], explanation: "15 − 3 = 12 apel yang masih bagus." }),
  A({ level: "Menantang", prompt: "Gambarlah dua kelompok benda. Banyak benda A 4 lebihnya dari banyak benda B.", parts: [{ kind: "draw", diff: 4, less: "B", thing: "kupu" }], explanation: "Kali ini A yang lebih banyak. Contohnya A ada 6 dan B ada 2, karena 6 − 2 = 4." }),
  B({ level: "Menantang", prompt: "Hitunglah 14 + 5 dengan tabel nilai tempat.", parts: [{ kind: "column", a: 14, op: "+", b: 5, blanks: ["rt", "ro"] }, fill("14 + 5 = □", 19)], explanation: "Satuan: 4 + 5 = 9. Puluhan tetap 1. Jadi 19." }),

  C({ level: "Sangat menantang", prompt: "Wei mempunyai 12 pensil. Pensil Kira 4 kurangnya dari pensil Wei.", scene: two("pensil", 12, "Wei", "pensil", null, "Kira"), parts: [eq(12, "−", 4), eq(12, "+", 8)], explanation: "Kira: 12 − 4 = 8. Jumlah pensil mereka: 12 + 8 = 20." }),
  A({ level: "Sangat menantang", prompt: "Ada 9 kepik di taman. Banyak kupu-kupu 3 kurangnya dari kepik.", scene: two("kepik", 9, "kepik", "kupu", null, "kupu-kupu"), parts: [fill("Kupu-kupu ada □.", 6), fill("Jumlah kepik dan kupu-kupu ada □.", 15)], explanation: "3 kurangnya dari 9: 9 − 3 = 6 kupu-kupu. Jumlahnya 9 + 6 = 15." }),
  B({ level: "Sangat menantang", prompt: "Upe memiliki 7 bola. Bola Kira 4 lebihnya dari bola Upe.", scene: two("bola", 7, "Upe", "bola", null, "Kira"), parts: [eq(7, "+", 4), eq(7, "+", 11)], explanation: "Kira: 7 + 4 = 11. Jika digabungkan: 7 + 11 = 18." }),
  C({ level: "Sangat menantang", prompt: "Hitunglah pengurangan berikut.", parts: [fill("18 − 6 = □", 12), fill("15 − 4 = □", 11), fill("19 − 5 = □", 14), fill("16 − 3 = □", 13)], explanation: "Kurangkan satuannya, puluhannya tetap 1: 8 − 6 = 2, 5 − 4 = 1, 9 − 5 = 4, 6 − 3 = 3." }),
  A({ level: "Sangat menantang", prompt: "Ada 12 balon merah. Balon kuning 3 kurangnya dari balon merah.", scene: two("balon", 12, "merah", "balon", null, "kuning", true), parts: [fill("12 − 3 = □", 9), fill("Balon kuning ada □.", 9)], explanation: "3 kurangnya dari 12: 12 − 3 = 9 balon kuning." }),
  B({ level: "Sangat menantang", prompt: "Hitunglah penjumlahan berikut.", parts: [fill("13 + 5 = □", 18), fill("11 + 6 = □", 17), fill("15 + 4 = □", 19), fill("12 + 3 = □", 15)], explanation: "Jumlahkan satuannya, puluhannya tetap 1: 3 + 5 = 8, 1 + 6 = 7, 5 + 4 = 9, 2 + 3 = 5." }),
  C({ level: "Sangat menantang", prompt: "Isilah tabel nilai tempat. Ada bilangan yang hilang.", parts: [{ kind: "column", a: 17, op: "−", b: 4, blanks: ["b"] }], explanation: "Hasilnya 13, satuannya 3. 7 − □ = 3, jadi yang dikurangkan 4. 17 − 4 = 13." }),
];
