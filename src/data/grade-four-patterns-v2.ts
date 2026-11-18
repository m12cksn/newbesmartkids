// Kelas 4 Bab 3: Pola Gambar dan Pola Bilangan (Matematika SD/MI Kelas IV, Kemendikbudristek).
// A pola gambar membesar dan mengecil, B pola bilangan membesar dan mengecil.
import type { Question } from "./grade-four-whole-numbers";

/* ---------- Gambar ---------- */
export type Thing = "jeruk" | "semangka" | "bola" | "lolipop" | "apel" | "bata" | "kue" | "kelereng";
/** Cara benda disusun dalam satu kumpulan. */
export type Layout = "rows" | "frame" | "x" | "lshape";
export type Group = { thing: Thing; layout: Layout; per?: number };
export type Scene =
  /** Kumpulan-kumpulan berurutan; `ask` menambahkan kotak tanya setelahnya. */
  | (Group & { type: "groups"; counts: number[]; ask?: boolean })
  | { type: "table"; head: [string, string]; rows: [string, string][] };

/* ---------- Bagian jawaban ---------- */
export type Part =
  | { kind: "fill"; text: string; answers: number[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "rank"; label: string; items: number[]; dir: "naik" | "turun" }
  | { kind: "match"; left: string[]; right: string[]; answer: number[] }
  | { kind: "multi"; label: string; options: number[]; answer: number[] }
  /** Bilangan di rak: null adalah kotak kosong. */
  | { kind: "seq"; items: (number | null)[] }
  /** Susun benda sebanyak jawaban dengan tombol tambah/kurang. */
  | { kind: "build"; label: string; group: Group; answer: number; max: number }
  /** Pilih gambar kumpulan yang tepat untuk kotak kosong. */
  | { kind: "pick"; label: string; group: Group; row: (number | null)[]; options: number[]; answer: number };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type PQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const fieldCount = (p: Part) => (p.kind === "fill" ? p.answers.length : p.kind === "seq" ? p.items.filter(x => x === null).length : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const list = (v: string) => (v ? v.split("|") : []);
const num = (s: string) => (/^\d{1,4}$/.test(s.trim()) ? Number(s.trim()) : NaN);
/** Isi kotak kosong di rak bilangan: lanjutkan selisih tetap dari dua bilangan yang diketahui. */
export function seqFill(items: (number | null)[]): number[] {
  const known = items.map((v, i) => [i, v] as const).filter(([, v]) => v !== null) as [number, number][];
  const [[i0, v0], [i1, v1]] = known, d = (v1 - v0) / (i1 - i0);
  return items.map((v, i) => (v === null ? v0 + (i - i0) * d : NaN)).filter(v => !Number.isNaN(v));
}
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "seq": return seqFill(p.items).join("|");
    case "choice": return p.answer;
    case "rank": return p.items.map((_, i) => i).sort((a, b) => (p.dir === "naik" ? p.items[a] - p.items[b] : p.items[b] - p.items[a])).join("|");
    case "match": return p.answer.join("|");
    case "multi": return [...p.answer].sort((a, b) => a - b).join("|");
    case "build": return String(p.answer);
    case "pick": return String(p.answer);
  }
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "fill": case "seq": { const want = partKey(p).split("|").map(Number), got = cells(p, v); return want.every((w, i) => num(got[i]) === w); }
    case "rank": { const idx = list(v).map(Number), want = [...p.items].sort((a, b) => (p.dir === "naik" ? a - b : b - a)); return idx.length === p.items.length && new Set(idx).size === idx.length && idx.map(i => p.items[i]).join("|") === want.join("|"); }
    case "multi": return list(v).map(Number).sort((a, b) => a - b).join("|") === partKey(p);
    default: return v === partKey(p);
  }
}
/** Lengkap (belum tentu benar): semua kotak terisi, semua kartu diurutkan, setiap kotak kiri punya pasangan. */
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "fill" || p.kind === "seq") return cells(p, v).every(x => x.trim() !== "");
  if (p.kind === "rank") return new Set(list(v)).size === p.items.length;
  if (p.kind === "match") { const x = list(v); return p.left.every((_, i) => (x[i] ?? "") !== ""); }
  if (p.kind === "build") return v !== "" && v !== "0";
  return v !== "";
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: PQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: PQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const thingName: Record<Thing, string> = { jeruk: "jeruk", semangka: "semangka", bola: "bola", lolipop: "lolipop", apel: "apel", bata: "batu bata", kue: "kue", kelereng: "kelereng" };
export function formatAnswer(q: PQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "seq": { let k = 0; return p.items.map(n => (n === null ? x[k++] || "…" : n)).join(", "); }
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "rank": return `${p.label} ${list(v[i]).map(k => p.items[Number(k)]).join(", ") || "…"}`;
      case "match": { const m = list(v[i]); return p.left.map((l, k) => `${l} → ${m[k] ? p.right[Number(m[k])] : "…"}`).join("; "); }
      case "multi": return `${p.label} ${list(v[i]).map(Number).sort((a, b) => a - b).join(", ") || "…"}`;
      case "build": return `${p.label} ${v[i] || 0} ${thingName[p.group.thing]}`;
      case "pick": return `${p.label} ${v[i] ? `${v[i]} ${thingName[p.group.thing]}` : "…"}`;
    }
  }).join(" | ");
}

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Pola Gambar", short: "Pola gambar", sections: [
    { title: "Pola gambar membesar dan mengecil", lab: "picture", steps: ["Pola gambar adalah susunan gambar yang berubah dengan aturan tetap dari satu kumpulan ke kumpulan berikutnya.", "Hitung benda di setiap kumpulan, lalu cari selisihnya. Jika selisihnya selalu sama, itulah aturannya.", "Pola membesar: bendanya semakin banyak (ditambah). Pola mengecil: bendanya semakin sedikit (dikurangi)."], example: "Jeruk 2, 4, 6: setiap kumpulan bertambah 2, jadi kumpulan ke-7 berisi 14 jeruk. Permen 9, 7, 5: berkurang 2, jadi kumpulan ke-5 berisi 1 permen.", demo: "Atur banyak benda awal dan perubahannya, lalu ketuk Kumpulan berikutnya." },
  ] },
  { code: "B", title: "Pola Bilangan", short: "Pola bilangan", sections: [
    { title: "Pola bilangan membesar dan mengecil", lab: "number", steps: ["Pola bilangan adalah susunan bilangan dengan aturan tertentu.", "Cari selisih dua bilangan yang berdekatan. Pada 1, 4, 7, 10 selisihnya +3, jadi bilangan berikutnya 10 + 3 = 13.", "Jika bilangannya semakin besar, polanya membesar. Jika semakin kecil, polanya mengecil: 23, 18, 13, 8 selisihnya −5, berikutnya 3."], example: "Panen telur 20, 28, 36, … bertambah 8 setiap hari. Hari ke-5: 20 + 8 + 8 + 8 + 8 = 52 butir.", demo: "Atur bilangan awal dan selisihnya, lalu tebak bilangan pada kotak kosong." },
  ] },
];

/* ---------- Pembuat soal ---------- */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): PQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B] = [make(0), make(1)];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const seq = (...items: (number | null)[]): Part => ({ kind: "seq", items });
const g = (thing: Thing, layout: Layout, per?: number): Group => ({ thing, layout, per });
const groups = (gr: Group, counts: number[], ask = true): Scene => ({ type: "groups", ...gr, counts, ask });
const trend: Part = { kind: "choice", label: "Polanya:", options: ["Membesar", "Mengecil"], answer: "" };
const trendIs = (answer: "Membesar" | "Mengecil"): Part => ({ ...trend, answer } as Part);
const build = (label: string, gr: Group, answer: number, max = 20): Part => ({ kind: "build", label, group: gr, answer, max });

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: PQuestion[][] = [
  [
    A({ prompt: "Tentukan banyak jeruk pada kumpulan berikutnya.", scene: groups(g("jeruk", "rows", 2), [2, 4, 6]), parts: [fill("Kumpulan ke-4: □ jeruk", 8)], explanation: "Jeruk 2, 4, 6: setiap kumpulan bertambah 2. Kumpulan ke-4: 6 + 2 = 8 jeruk." }),
    A({ prompt: "Susun lolipop untuk kumpulan berikutnya.", scene: groups(g("lolipop", "rows", 3), [9, 7, 5]), parts: [build("Kumpulan ke-4:", g("lolipop", "rows", 3), 3, 10)], explanation: "Lolipop 9, 7, 5: setiap kumpulan berkurang 2. Kumpulan ke-4: 5 − 2 = 3 lolipop." }),
    A({ prompt: "Pilih gambar yang tepat untuk kotak kosong.", parts: [{ kind: "pick", label: "Kotak kosong:", group: g("apel", "rows", 4), row: [1, 3, 5, null], options: [6, 7, 9], answer: 7 }], explanation: "Apel 1, 3, 5: bertambah 2. Kotak kosong berisi 5 + 2 = 7 apel." }),
    A({ prompt: "Tentukan banyak bola pada kumpulan ke-4, lalu tentukan jenis polanya.", scene: groups(g("bola", "x"), [1, 5, 9]), parts: [fill("Kumpulan ke-4: □ bola", 13), trendIs("Membesar")], explanation: "Bola 1, 5, 9: setiap kumpulan bertambah 4 (satu bola di setiap ujung). Kumpulan ke-4: 9 + 4 = 13. Polanya membesar." }),
  ],
  [
    B({ prompt: "Tentukan bilangan yang tepat sesuai pola.", parts: [seq(7, 19, 31, 43, null)], explanation: "Selisihnya +12: 19 − 7 = 12. Bilangan berikutnya 43 + 12 = 55." }),
    B({ prompt: "Tentukan bilangan yang tepat sesuai pola.", parts: [seq(96, 85, 74, 63, null)], explanation: "Selisihnya −11: 96 − 85 = 11. Bilangan berikutnya 63 − 11 = 52." }),
    B({ prompt: "Tentukan bilangan yang tepat sesuai pola.", parts: [seq(13, 22, 31, null, 49, null)], explanation: "Selisihnya +9. 31 + 9 = 40, lalu 49 + 9 = 58." }),
    B({ prompt: "Ali menata buku di rak perpustakaan. Rak pertama 5 buku, rak kedua 9 buku, rak ketiga 13 buku. Berapa buku di rak kelima?", scene: { type: "table", head: ["Rak", "Banyak buku"], rows: [["Rak 1", "5"], ["Rak 2", "9"], ["Rak 3", "13"]] }, parts: [fill("Rak kelima: □ buku", 21)], explanation: "Setiap rak bertambah 4 buku: 13 + 4 = 17 (rak 4), 17 + 4 = 21 (rak 5)." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
export const assessment: PQuestion[] = [
  A({ level: "Sedang", prompt: "Susun semangka untuk kumpulan berikutnya sesuai pola.", scene: groups(g("semangka", "frame"), [4, 8, 12]), parts: [build("Kumpulan ke-4:", g("semangka", "rows", 4), 16, 20)], explanation: "Semangka 4, 8, 12: setiap kumpulan bertambah 4. Kumpulan ke-4: 12 + 4 = 16 semangka." }),
  B({ level: "Sedang", prompt: "Tentukan bilangan yang tepat sesuai pola.", parts: [seq(5, 11, 17, 23, null)], explanation: "Selisihnya +6. Bilangan berikutnya 23 + 6 = 29." }),
  A({ level: "Sedang", prompt: "Tentukan banyak kelereng pada kumpulan berikutnya.", scene: groups(g("kelereng", "lshape"), [3, 5, 7]), parts: [fill("Kumpulan ke-4: □ kelereng", 9)], explanation: "Kelereng 3, 5, 7: bentuk L bertambah 1 di atas dan 1 di kanan, jadi +2. Kumpulan ke-4: 7 + 2 = 9." }),
  B({ level: "Sedang", prompt: "Tentukan bilangan yang tepat sesuai pola.", parts: [seq(52, 45, 38, null, null)], explanation: "Selisihnya −7. 38 − 7 = 31, lalu 31 − 7 = 24." }),
  A({ level: "Sedang", prompt: "Susun lolipop untuk kumpulan berikutnya, lalu tentukan jenis polanya.", scene: groups(g("lolipop", "rows", 4), [11, 9, 7]), parts: [build("Kumpulan ke-4:", g("lolipop", "rows", 4), 5, 12), trendIs("Mengecil")], explanation: "Lolipop 11, 9, 7: setiap kumpulan berkurang 2. Kumpulan ke-4: 7 − 2 = 5. Polanya mengecil." }),
  B({ level: "Sedang", prompt: "Tentukan bilangan yang tepat sesuai pola.", parts: [seq(8, null, 20, 26, null)], explanation: "Dari 20 ke 26 bertambah 6. Kotak kedua: 8 + 6 = 14. Kotak terakhir: 26 + 6 = 32." }),
  A({ level: "Sedang", prompt: "Pilih gambar yang tepat untuk kotak kosong.", parts: [{ kind: "pick", label: "Kotak kosong:", group: g("apel", "rows", 4), row: [3, 6, null, 12], options: [8, 9, 10], answer: 9 }], explanation: "Apel 3, 6, …, 12: bertambah 3. Kotak kosong: 6 + 3 = 9 apel (lalu 9 + 3 = 12)." }),
  B({ level: "Sedang", prompt: "Rina menyusun kursi di aula. Baris pertama 6 kursi, baris kedua 11 kursi, baris ketiga 16 kursi. Berapa kursi pada baris kelima?", parts: [fill("Baris kelima: □ kursi", 26)], explanation: "Setiap baris bertambah 5 kursi: 16 + 5 = 21 (baris 4), 21 + 5 = 26 (baris 5)." }),

  A({ level: "Menantang", prompt: "Susun batu bata untuk kumpulan berikutnya sesuai pola.", scene: groups(g("bata", "rows", 3), [18, 15, 12]), parts: [build("Kumpulan ke-4:", g("bata", "rows", 3), 9, 18)], explanation: "Batu bata 18, 15, 12: setiap kumpulan berkurang 3. Kumpulan ke-4: 12 − 3 = 9 batu bata." }),
  B({ level: "Menantang", prompt: "Susun kartu bilangan ini menjadi pola bilangan mengecil.", parts: [{ kind: "rank", label: "Ketuk dari kartu pertama:", items: [26, 40, 12, 33, 19], dir: "turun" }], explanation: "Pola mengecil dimulai dari bilangan terbesar: 40, 33, 26, 19, 12. Selisihnya selalu −7." }),
  A({ level: "Menantang", prompt: "Kelereng disusun membentuk huruf L. Berapa kelereng pada kumpulan ke-6?", scene: groups(g("kelereng", "lshape"), [1, 3, 5, 7], false), parts: [fill("Kumpulan ke-6: □ kelereng", 11)], explanation: "Kelereng 1, 3, 5, 7 bertambah 2. Kumpulan ke-5: 9, kumpulan ke-6: 11." }),
  B({ level: "Menantang", prompt: "Tarik garis dari setiap pola bilangan ke aturannya.", parts: [{ kind: "match", left: ["7, 11, 15, …", "30, 24, 18, …", "9, 15, 21, …", "50, 46, 42, …"], right: ["−4", "+6", "+4", "−6"], answer: [2, 3, 1, 0] }], explanation: "7 → 11 bertambah 4. 30 → 24 berkurang 6. 9 → 15 bertambah 6. 50 → 46 berkurang 4." }),
  A({ level: "Menantang", prompt: "Jeruk disusun 2 baris. Susun kumpulan ke-4, lalu tentukan kumpulan ke-7.", scene: groups(g("jeruk", "rows", 2), [2, 4, 6]), parts: [build("Kumpulan ke-4:", g("jeruk", "rows", 2), 8, 16), fill("Kumpulan ke-7: □ jeruk", 14)], explanation: "Jeruk bertambah 2: 2, 4, 6, 8, 10, 12, 14. Kumpulan ke-4 berisi 8, kumpulan ke-7 berisi 14." }),
  B({ level: "Menantang", prompt: "Pabrik mencatat banyak televisi yang dibuat setiap bulan dengan pola tetap.", scene: { type: "table", head: ["Bulan", "Banyak televisi"], rows: [["Januari", "82"], ["Februari", "76"], ["Maret", "70"], ["April", "64"]] }, parts: [fill("Juni: □ televisi", 52), fill("Agustus: □ televisi", 40)], explanation: "Setiap bulan berkurang 6: Mei 58, Juni 52, Juli 46, Agustus 40." }),
  A({ level: "Menantang", prompt: "Pilih gambar yang tepat untuk kotak kosong.", parts: [{ kind: "pick", label: "Kotak kosong:", group: g("kue", "rows", 4), row: [14, 11, null, 5], options: [6, 8, 9], answer: 8 }], explanation: "Kue 14, 11, …, 5: berkurang 3. Kotak kosong: 11 − 3 = 8 (lalu 8 − 3 = 5)." }),
  B({ level: "Menantang", prompt: "Tentukan bilangan yang tepat sesuai pola.", parts: [seq(14, 23, 32, null, 50, null)], explanation: "Selisihnya +9. 32 + 9 = 41, lalu 50 + 9 = 59." }),
  A({ level: "Menantang", prompt: "Kue disusun 3 baris di nampan. Susun kumpulan ke-5.", scene: groups(g("kue", "rows", 3), [3, 6, 9]), parts: [build("Kumpulan ke-5:", g("kue", "rows", 3), 15, 18)], explanation: "Kue 3, 6, 9 bertambah 3: kumpulan ke-4 berisi 12, kumpulan ke-5 berisi 15." }),

  B({ level: "Sangat menantang", prompt: "Gedung bioskop punya 12 baris kursi. Baris pertama 12 kursi, baris kedua 15 kursi, baris ketiga 18 kursi, dan seterusnya. Berapa kursi pada baris terakhir?", parts: [fill("Baris ke-12: □ kursi", 45)], explanation: "Setiap baris bertambah 3. Dari baris 1 ke baris 12 ada 11 kali penambahan: 12 + 11 × 3 = 12 + 33 = 45 kursi." }),
  A({ level: "Sangat menantang", prompt: "Lolipop dibagikan sehingga setiap kumpulan berkurang dengan pola tetap.", scene: groups(g("lolipop", "rows", 5), [20, 16, 12]), parts: [fill("Kumpulan ke-5: □ lolipop", 4), fill("Lolipop habis pada kumpulan ke-□", 6)], explanation: "Berkurang 4: 20, 16, 12, 8, 4, 0. Kumpulan ke-5 berisi 4 dan pada kumpulan ke-6 lolipop habis." }),
  B({ level: "Sangat menantang", prompt: "Petani mencatat penjualan kelapa yang turun dengan pola tetap.", scene: { type: "table", head: ["Hari", "Banyak kelapa"], rows: [["Hari 1", "45"], ["Hari 2", "39"], ["Hari 3", "33"], ["Hari 4", "27"]] }, parts: [fill("Hari ke-7: □ kelapa", 9), trendIs("Mengecil")], explanation: "Setiap hari berkurang 6: hari 5 = 21, hari 6 = 15, hari 7 = 9. Polanya mengecil." }),
  A({ level: "Sangat menantang", prompt: "Satu kumpulan apel tidak sesuai pola. Kumpulan keberapa?", scene: groups(g("apel", "rows", 5), [2, 5, 8, 10, 14], false), parts: [{ kind: "choice", label: "Tidak sesuai:", options: ["Kumpulan 2", "Kumpulan 3", "Kumpulan 4", "Kumpulan 5"], answer: "Kumpulan 4" }, fill("Seharusnya □ apel", 11)], explanation: "Apel 2, 5, 8 bertambah 3, jadi kumpulan ke-4 seharusnya 8 + 3 = 11, bukan 10. Kumpulan ke-5: 11 + 3 = 14 sudah sesuai." }),
  B({ level: "Sangat menantang", prompt: "Pola bilangan 4, 9, 14, 19, … Tentukan bilangan ke-10.", parts: [fill("Bilangan ke-10: □", 49)], explanation: "Selisihnya +5. Dari bilangan ke-1 ke ke-10 ada 9 kali penambahan: 4 + 9 × 5 = 4 + 45 = 49." }),
  A({ level: "Sangat menantang", prompt: "Semangka disusun membentuk bingkai persegi. Berapa semangka pada kumpulan ke-6?", scene: groups(g("semangka", "frame"), [4, 8, 12], false), parts: [fill("Kumpulan ke-6: □ semangka", 24), trendIs("Membesar")], explanation: "Semangka 4, 8, 12 bertambah 4: 16, 20, 24. Kumpulan ke-6 berisi 24 semangka. Polanya membesar." }),
  B({ level: "Sangat menantang", prompt: "Pilih semua bilangan yang termasuk pola 3, 7, 11, 15, …", parts: [{ kind: "multi", label: "Termasuk pola:", options: [19, 21, 23, 26, 27, 30, 31], answer: [19, 23, 27, 31] }], explanation: "Polanya bertambah 4: 15, 19, 23, 27, 31. Bilangan 21, 26, dan 30 tidak muncul pada pola." }),
];
