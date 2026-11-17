// Kelas 3 Bab 5: Penyajian Data dalam Tabel (Matematika SD/MI Kelas III, Kemendikbudristek 2022).
// A. Mengurutkan dan Membandingkan Data, B. Menyajikan Data dalam Bentuk Tabel.
import type { Question } from "./grade-four-whole-numbers";

/* ---------- Benda dan gambar soal ---------- */
export type Thing = "kelereng" | "bola" | "buku" | "pensil" | "penghapus" | "manik";
export const thingName: Record<Thing, string> = { kelereng: "kelereng", bola: "bola", buku: "buku", pensil: "pensil", penghapus: "penghapus", manik: "manik-manik" };
export type Scene =
  | { type: "cards"; values: number[]; caption: string }
  | { type: "tallyTable"; head: [string, string, string]; rows: { label: string; n: number; showCount?: boolean }[] }
  | { type: "story"; items: { name: string; thing: Thing; n: number }[] }
  | { type: "objects"; items: { thing: Thing; n: number }[] }
  | { type: "letters"; text: string; columns?: number }
  | { type: "word"; word: string }
  | { type: "classes"; groups: { label: string; books: number }[]; kids: string[] };

/* ---------- Bagian jawaban ---------- */
export type RankItem = { label: string; value: number };
export type Part =
  | { kind: "fill"; text: string; answers: number[] } // "□" kotak isian
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "multi"; label: string; options: string[]; answer: string[] }
  /** Ketuk berurutan. Benar jika nilai yang dipilih urut (yang sama nilainya boleh bertukar). */
  | { kind: "rank"; label: string; items: RankItem[]; dir: "naik" | "turun" }
  /** Tabel turus: kolom turus dan banyak bisa diberikan atau diisi. */
  | { kind: "table"; head: [string, string, string]; rows: { label: string; n: number; tally: boolean; count: boolean }[]; noTally?: boolean }
  /** Buat turus untuk sebuah bilangan. */
  | { kind: "tally"; label: string; n: number };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type DQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const fieldCount = (p: Part) =>
  p.kind === "fill" ? p.answers.length : p.kind === "table" ? p.rows.filter(r => r.tally).length + p.rows.filter(r => r.count).length : 1;
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const list = (v: string) => (v ? v.split("|") : []);
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));
const sortedValues = (p: Extract<Part, { kind: "rank" }>) => p.items.map(i => i.value).sort((a, b) => (p.dir === "naik" ? a - b : b - a));

/** Kunci tabel: semua turus (kiri ke kanan, atas ke bawah) lalu semua banyak. */
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "choice": return p.answer;
    case "multi": return p.answer.join("|");
    case "rank": { const idx = p.items.map((_, i) => i).sort((a, b) => (p.dir === "naik" ? p.items[a].value - p.items[b].value : p.items[b].value - p.items[a].value) || a - b); return idx.join("|"); }
    case "table": return [...p.rows.filter(r => r.tally).map(r => r.n), ...p.rows.filter(r => r.count).map(r => r.n)].join("|");
    case "tally": return String(p.n);
  }
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "choice": return v === p.answer;
    case "multi": return list(v).sort().join("|") === [...p.answer].sort().join("|");
    case "rank": { const idx = list(v).map(Number); return idx.length === p.items.length && new Set(idx).size === idx.length && idx.map(i => p.items[i]?.value).join("|") === sortedValues(p).join("|"); }
    case "tally": return num(v) === p.n;
    default: { const want = partKey(p).split("|"), got = cells(p, v); return want.every((w, i) => num(got[i]) === Number(w)); }
  }
}
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "choice") return v !== "";
  if (p.kind === "multi") return list(v).length > 0;
  if (p.kind === "rank") return list(v).length === p.items.length;
  if (p.kind === "tally") return v !== "" && v !== "0";
  return cells(p, v).every(x => x.trim() !== "");
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
      case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "multi": return `${p.label} ${list(v[i]).join(", ") || "…"}`;
      case "rank": return `${p.label} ${list(v[i]).map(k => p.items[Number(k)]?.label).join(", ") || "…"}`;
      case "tally": return `${p.label} ${v[i] || "0"} turus`;
      case "table": { const t = p.rows.filter(r => r.tally), c = p.rows.filter(r => r.count);
        return p.rows.map(r => { const ti = t.indexOf(r), ci = c.indexOf(r); return `${r.label}: ${ti >= 0 ? `turus ${x[ti] || "…"}` : ""}${ti >= 0 && ci >= 0 ? ", " : ""}${ci >= 0 ? `banyak ${x[t.length + ci] || "…"}` : ""}`; }).filter(s => !s.endsWith(": ")).join("; "); }
    }
  }).join(" | ");
}

/* ---------- Bantuan data ---------- */
export const countOf = (values: number[], v: number) => values.filter(x => x === v).length;
export const frequency = (values: (number | string)[]) => { const m = new Map<string, number>(); for (const x of values) m.set(String(x), (m.get(String(x)) ?? 0) + 1); return m; };
export const lettersOf = (s: string) => s.replace(/[^A-Za-z]/g, "").split("");

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Mengurutkan dan Membandingkan Data", short: "Urutkan data", sections: [
    { title: "Mengurutkan data", lab: "sort", steps: ["Cari data terkecil lebih dulu, lalu yang sedikit lebih besar, begitu seterusnya.", "Data yang sama nilainya ditulis berdampingan.", "Data pertama adalah data terkecil, data terakhir adalah data terbesar."], example: "Banyak anggota keluarga 5, 3, 6, 4, 3 diurutkan menjadi 3, 3, 4, 5, 6.", demo: "Ketuk kartu dari banyak anggota keluarga yang paling sedikit." },
    { title: "Membandingkan data dan jangkauan", lab: "range", steps: ["Jangkauan adalah selisih data terbesar dan data terkecil.", "Jangkauan = nilai data terbesar − nilai data terkecil.", "Untuk mengetahui banyak siswa dengan nilai tertentu, hitung kartu yang nilainya sama."], example: "Nilai terbesar 10 dan nilai terkecil 5, jadi jangkauannya 10 − 5 = 5.", demo: "Urutkan kartu nilai, lalu ketuk sebuah nilai untuk melihat berapa siswa yang mendapatkannya." },
  ] },
  { code: "B", title: "Menyajikan Data dalam Bentuk Tabel", short: "Tabel turus", sections: [
    { title: "Menulis turus", lab: "tally", steps: ["Satu turus berupa satu garis tegak untuk satu data.", "Turus kelima ditulis miring melintasi empat turus sebelumnya.", "Hitung turus per kelompok lima: 5, 10, 15, lalu tambahkan sisanya."], example: "Dua kelompok lima dan tiga turus berarti 5 + 5 + 3 = 13.", demo: "Tambahkan lidi satu per satu. Perhatikan lidi kelima yang dipasang miring." },
    { title: "Menyajikan data dalam tabel", lab: "table", steps: ["Urutkan nilai data dari yang terkecil.", "Buat tabel dengan kolom data, turus, dan banyak data.", "Dari tabel kita bisa melihat data paling banyak, paling sedikit, dan yang sama banyak."], example: "Pada kata SELAMAT PAGI, huruf A muncul 3 kali dan huruf lain masing-masing sekali. Tabelnya berisi kolom huruf, turus, dan banyak huruf.", demo: "Ketuk setiap huruf atau setiap anak. Turusnya bertambah di tabel." },
  ] },
];

/* ---------- Pembuat soal ---------- */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): DQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const A = make(0), B = make(1);
const items = (o: Record<string, number>): RankItem[] => Object.entries(o).map(([label, value]) => ({ label, value }));
const cardItems = (vals: number[]): RankItem[] => vals.map(v => ({ label: String(v), value: v }));
/** Baris tabel untuk huruf sebuah kata, urut kemunculan. */
const wordRows = (word: string, tally: (i: number) => boolean, count: (i: number) => boolean) => [...frequency(lettersOf(word))].map(([label, n], i) => ({ label, n, tally: tally(i), count: count(i) }));

/* ---------- Latihan (4 soal per subtopik) ---------- */
const familyA = [5, 3, 7, 4, 3, 6];
const nilaiLatihan = [8, 9, 6, 10, 7, 9, 5, 8, 9, 7, 6, 9];
export const practice: DQuestion[][] = [
  [
    A({ prompt: "Urutkan banyak anggota keluarga dari yang terkecil.", scene: { type: "cards", values: familyA, caption: "Banyak anggota keluarga" }, parts: [{ kind: "rank", label: "Ketuk dari yang terkecil:", items: cardItems(familyA), dir: "naik" }], explanation: "Urutan dari yang terkecil: 3, 3, 4, 5, 6, 7. Dua angka 3 ditulis berdampingan." }),
    A({ prompt: "Perhatikan nilai ulangan harian berikut.", scene: { type: "cards", values: nilaiLatihan, caption: "Nilai ulangan Matematika" }, parts: [{ kind: "fill", text: "Nilai terkecil □, nilai terbesar □, jangkauan □", answers: [5, 10, 5] }], explanation: "Nilai terkecil 5 dan terbesar 10. Jangkauan = 10 − 5 = 5." }),
    A({ prompt: "Rina punya 6 kelereng, Dodi 3, Sari 8, Tono 6, dan Beni 4.", scene: { type: "story", items: [{ name: "Rina", thing: "kelereng", n: 6 }, { name: "Dodi", thing: "kelereng", n: 3 }, { name: "Sari", thing: "kelereng", n: 8 }, { name: "Tono", thing: "kelereng", n: 6 }, { name: "Beni", thing: "kelereng", n: 4 }] }, parts: [{ kind: "multi", label: "Kelereng sama banyak:", options: ["Rina", "Dodi", "Sari", "Tono", "Beni"], answer: ["Rina", "Tono"] }, { kind: "choice", label: "Paling sedikit:", options: ["Beni", "Dodi", "Tono"], answer: "Dodi" }], explanation: "Rina dan Tono sama-sama punya 6 kelereng. Dodi punya 3, paling sedikit." }),
    A({ prompt: "Dari nilai ulangan berikut, berapa siswa yang mendapat nilai 9 dan berapa yang mendapat nilai lebih dari 7?", scene: { type: "cards", values: nilaiLatihan, caption: "Nilai ulangan Matematika" }, parts: [{ kind: "fill", text: "Nilai 9: □ siswa", answers: [4] }, { kind: "fill", text: "Lebih dari 7: □ siswa", answers: [7] }], explanation: "Nilai 9 ada 4 kartu. Lebih dari 7 artinya 8, 9, dan 10: 2 + 4 + 1 = 7 siswa." }),
  ],
  [
    B({ prompt: "Tuliskan banyaknya sesuai turus.", scene: { type: "tallyTable", head: ["Warna", "Turus", "Banyak"], rows: [{ label: "Merah", n: 7 }, { label: "Hijau", n: 12 }, { label: "Kuning", n: 4 }] }, parts: [{ kind: "fill", text: "Merah □, Hijau □, Kuning □", answers: [7, 12, 4] }], explanation: "Hitung per kelompok lima. Merah 5 + 2 = 7, Hijau 5 + 5 + 2 = 12, Kuning 4." }),
    B({ prompt: "Perhatikan huruf-huruf pada kata B E L A J A R, lalu lengkapi tabelnya.", scene: { type: "word", word: "BELAJAR" }, parts: [{ kind: "table", head: ["Huruf", "Turus", "Banyak Huruf"], rows: wordRows("BELAJAR", i => i % 2 === 1, i => i % 2 === 0) }], explanation: "B 1, E 1, L 1, A 2, J 1, R 1. Huruf A muncul dua kali." }),
    B({ prompt: "Buatlah turus untuk banyak siswa yang membawa bekal, yaitu 9 siswa.", parts: [{ kind: "tally", label: "Turus:", n: 9 }], explanation: "9 = 5 + 4: satu kelompok lima (empat garis tegak dan satu garis miring) lalu empat garis tegak." }),
    B({ prompt: "Perhatikan tabel buah kesukaan berikut.", scene: { type: "tallyTable", head: ["Buah", "Turus", "Banyak Anak"], rows: [{ label: "Apel", n: 6, showCount: true }, { label: "Jeruk", n: 9, showCount: true }, { label: "Mangga", n: 4, showCount: true }, { label: "Pisang", n: 6, showCount: true }] }, parts: [{ kind: "choice", label: "Paling banyak disukai:", options: ["Apel", "Jeruk", "Pisang"], answer: "Jeruk" }, { kind: "multi", label: "Sama banyak:", options: ["Apel", "Jeruk", "Mangga", "Pisang"], answer: ["Apel", "Pisang"] }], explanation: "Jeruk 9 paling banyak. Apel dan Pisang sama-sama 6." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
const marbles = { Lia: 5, Danu: 9, Putri: 2, Raka: 7, Wati: 5 };
const marbleScene: Scene = { type: "story", items: Object.entries(marbles).map(([name, n]) => ({ name, thing: "kelereng" as const, n })) };
const word = "PERPUSTAKAAN";
const nilai16 = [7, 9, 6, 8, 10, 7, 4, 9, 8, 7, 6, 9, 8, 7, 10, 9];
const nilai20 = [8, 7, 9, 6, 8, 10, 7, 8, 9, 5, 8, 7, 9, 8, 6, 9, 8, 10, 7, 8];
const freq20 = [5, 6, 7, 8, 9, 10].map(v => ({ label: String(v), n: countOf(nilai20, v) }));
const things: Scene = { type: "objects", items: [{ thing: "bola", n: 3 }, { thing: "buku", n: 5 }, { thing: "pensil", n: 6 }, { thing: "penghapus", n: 5 }] };
const grid = "a b c x y b c x a b y c x b c y x b a c x b y c b x c";
const gridCount = (ch: string) => grid.split(" ").filter(c => c === ch).length;
const beads = [3, 5, 2, 4, 3, 5, 3, 4, 2, 3];
export const assessment: DQuestion[] = [
  A({ level: "Sedang", prompt: "Urutkan nilai ulangan berikut dari yang terkecil.", scene: { type: "cards", values: [8, 6, 9, 7, 10, 6, 8, 9], caption: "Nilai ulangan" }, parts: [{ kind: "rank", label: "Ketuk dari yang terkecil:", items: cardItems([8, 6, 9, 7, 10, 6, 8, 9]), dir: "naik" }], explanation: "Urutan: 6, 6, 7, 8, 8, 9, 9, 10. Nilai yang sama ditulis berdampingan." }),
  B({ level: "Sedang", prompt: "Tuliskan banyak huruf sesuai turusnya.", scene: { type: "tallyTable", head: ["Huruf", "Turus", "Banyak"], rows: [{ label: "S", n: 3 }, { label: "A", n: 8 }, { label: "K", n: 5 }] }, parts: [{ kind: "fill", text: "S □, A □, K □", answers: [3, 8, 5] }], explanation: "S tiga turus. A satu kelompok lima dan tiga: 8. K tepat satu kelompok lima: 5." }),
  A({ level: "Sedang", prompt: "Urutkan anak dari yang kelerengnya paling sedikit.", scene: marbleScene, parts: [{ kind: "rank", label: "Ketuk dari yang paling sedikit:", items: items(marbles), dir: "naik" }], explanation: "Putri 2, Lia 5, Wati 5, Raka 7, Danu 9. Lia dan Wati sama banyak, boleh bertukar tempat." }),
  B({ level: "Sedang", prompt: `Perhatikan huruf pada kata ${word.split("").join(" ")}, lalu lengkapi turus dan banyak hurufnya.`, scene: { type: "word", word }, parts: [{ kind: "table", head: ["Huruf", "Turus", "Banyak Huruf"], rows: wordRows(word, i => i === 0 || i === 2, i => i !== 2).slice(0, 4) }], explanation: "P muncul 2 kali, E 1, R 1, U 1. Hitung sambil mencoret huruf yang sudah dihitung." }),
  A({ level: "Sedang", prompt: "Tentukan nilai terkecil dan nilai terbesar.", scene: { type: "cards", values: nilai16, caption: "Nilai ulangan kelas 3" }, parts: [{ kind: "fill", text: "Terkecil □, terbesar □", answers: [4, 10] }], explanation: "Data terkecil 4 dan data terbesar 10." }),
  B({ level: "Sedang", prompt: "Hitung benda pada gambar.", scene: things, parts: [{ kind: "fill", text: "Bola □, pensil □", answers: [3, 6] }], explanation: "Ada 3 bola dan 6 pensil pada gambar." }),
  A({ level: "Sedang", prompt: "Siapa saja yang memiliki kelereng sama banyak?", scene: marbleScene, parts: [{ kind: "multi", label: "Pilih semua:", options: Object.keys(marbles), answer: ["Lia", "Wati"] }], explanation: "Lia dan Wati masing-masing punya 5 kelereng." }),
  B({ level: "Sedang", prompt: "Berapa banyak huruf a dan huruf b pada kotak?", scene: { type: "letters", text: grid }, parts: [{ kind: "fill", text: "a = □, b = □", answers: [gridCount("a"), gridCount("b")] }], explanation: `Huruf a ada ${gridCount("a")} dan huruf b ada ${gridCount("b")}. Coret setiap huruf yang sudah dihitung agar tidak terhitung dua kali.` }),

  A({ level: "Menantang", prompt: "Berapakah jangkauan nilai ulangan berikut?", scene: { type: "cards", values: nilai16, caption: "Nilai ulangan kelas 3" }, parts: [{ kind: "fill", text: "Jangkauan = □ − □ = □", answers: [10, 4, 6] }], explanation: "Jangkauan = nilai terbesar − nilai terkecil = 10 − 4 = 6." }),
  B({ level: "Menantang", prompt: "Sajikan nilai ulangan dalam tabel: berapa siswa untuk setiap nilai?", scene: { type: "cards", values: nilai20, caption: "Nilai 20 siswa" }, parts: [{ kind: "table", head: ["Nilai", "Turus", "Banyak Siswa"], noTally: true, rows: freq20.map(r => ({ ...r, tally: false, count: true })) }], explanation: `Nilai 5: ${freq20[0].n}, 6: ${freq20[1].n}, 7: ${freq20[2].n}, 8: ${freq20[3].n}, 9: ${freq20[4].n}, 10: ${freq20[5].n}. Jumlahnya 20, sama dengan banyak siswa.` }),
  A({ level: "Menantang", prompt: "Berapa siswa yang nilainya lebih dari 7?", scene: { type: "cards", values: nilai16, caption: "Nilai ulangan kelas 3" }, parts: [{ kind: "fill", text: "Lebih dari 7: □ siswa", answers: [nilai16.filter(v => v > 7).length] }], explanation: `Lebih dari 7 artinya 8, 9, dan 10: ${countOf(nilai16, 8)} + ${countOf(nilai16, 9)} + ${countOf(nilai16, 10)} = ${nilai16.filter(v => v > 7).length} siswa.` }),
  B({ level: "Menantang", prompt: `Kata ${word}: huruf apa yang paling banyak, dan huruf apa yang muncul tepat dua kali?`, scene: { type: "word", word }, parts: [{ kind: "choice", label: "Paling banyak:", options: ["P", "A", "K"], answer: "A" }, { kind: "multi", label: "Muncul dua kali:", options: ["P", "E", "R", "U", "A", "K"], answer: ["P"] }], explanation: `A muncul ${frequency(lettersOf(word)).get("A")} kali, paling banyak. P muncul 2 kali. Huruf lain hanya sekali.` }),
  A({ level: "Menantang", prompt: "Kelas 4 butuh 9 buku tulis, kelas 2 butuh 7. Rafi kelas 4, Nina kelas 2. Lala sekelas Rafi, Dimas sekelas Nina.", scene: { type: "classes", groups: [{ label: "Kelas 4", books: 9 }, { label: "Kelas 2", books: 7 }], kids: ["Rafi", "Nina", "Lala", "Dimas"] }, parts: [{ kind: "multi", label: "Bukunya paling banyak:", options: ["Rafi", "Nina", "Lala", "Dimas"], answer: ["Rafi", "Lala"] }, { kind: "choice", label: "Sama banyak dengan Nina:", options: ["Rafi", "Lala", "Dimas"], answer: "Dimas" }], explanation: "Rafi dan Lala kelas 4, masing-masing 9 buku. Nina dan Dimas kelas 2, masing-masing 7 buku." }),
  B({ level: "Menantang", prompt: "Urutkan benda pada gambar dari yang jumlahnya paling sedikit.", scene: things, parts: [{ kind: "rank", label: "Ketuk dari yang paling sedikit:", items: [{ label: "Bola", value: 3 }, { label: "Buku", value: 5 }, { label: "Pensil", value: 6 }, { label: "Penghapus", value: 5 }], dir: "naik" }], explanation: "Bola 3, buku 5, penghapus 5, pensil 6. Buku dan penghapus sama banyak, boleh bertukar." }),
  A({ level: "Menantang", prompt: "Berapa siswa yang nilainya kurang dari 7?", scene: { type: "tallyTable", head: ["Nilai", "Turus", "Banyak"], rows: freq20.map(r => ({ ...r, showCount: true })) }, parts: [{ kind: "fill", text: "Kurang dari 7: □ siswa", answers: [freq20[0].n + freq20[1].n] }], explanation: `Kurang dari 7 artinya nilai 5 dan 6: ${freq20[0].n} + ${freq20[1].n} = ${freq20[0].n + freq20[1].n} siswa.` }),
  B({ level: "Menantang", prompt: "Ada 13 siswa yang memilih Dika sebagai ketua kelas. Buatlah turusnya.", parts: [{ kind: "tally", label: "Turus:", n: 13 }], explanation: "13 = 5 + 5 + 3: dua kelompok lima lalu tiga garis tegak." }),
  A({ level: "Menantang", prompt: "Urutkan anak dari yang kelerengnya paling banyak.", scene: marbleScene, parts: [{ kind: "rank", label: "Ketuk dari yang paling banyak:", items: items(marbles), dir: "turun" }], explanation: "Danu 9, Raka 7, Lia 5, Wati 5, Putri 2." }),

  B({ level: "Sangat menantang", prompt: "Pada kotak huruf, x adalah pensil dan y adalah buku. Berapa banyak pensil dan buku seluruhnya?", scene: { type: "letters", text: grid }, parts: [{ kind: "fill", text: "x = □, y = □, jumlah = □", answers: [gridCount("x"), gridCount("y"), gridCount("x") + gridCount("y")] }], explanation: `Ada ${gridCount("x")} huruf x dan ${gridCount("y")} huruf y, jadi ${gridCount("x")} + ${gridCount("y")} = ${gridCount("x") + gridCount("y")}.` }),
  A({ level: "Sangat menantang", prompt: "Nilai berapa yang paling banyak diperoleh siswa, dan berapa siswa yang mendapatkannya?", scene: { type: "cards", values: nilai20, caption: "Nilai 20 siswa" }, parts: [{ kind: "fill", text: "Nilai □ diperoleh □ siswa", answers: [8, countOf(nilai20, 8)] }], explanation: `Setelah diurutkan, nilai 8 muncul ${countOf(nilai20, 8)} kali, lebih banyak dari nilai lain.` }),
  B({ level: "Sangat menantang", prompt: "Tabel pilihan ketua kelas di bawah diisi oleh 24 siswa. Lengkapi turus dan banyak suara yang kosong.", scene: { type: "tallyTable", head: ["Calon", "Turus", "Suara"], rows: [{ label: "Dika", n: 9, showCount: true }, { label: "Putri", n: 7, showCount: true }] }, parts: [{ kind: "table", head: ["Calon", "Turus", "Suara"], rows: [{ label: "Roni", n: 8, tally: true, count: true }] }], explanation: "Jumlah suara 24. Dika 9 dan Putri 7, jadi Roni 24 − 9 − 7 = 8 suara: satu kelompok lima dan tiga turus." }),
  A({ level: "Sangat menantang", prompt: "Danu memberi Putri 4 kelereng. Siapa saja yang sekarang paling sedikit, dan berapa kelereng Putri?", scene: marbleScene, parts: [{ kind: "multi", label: "Paling sedikit sekarang:", options: Object.keys(marbles), answer: ["Lia", "Danu", "Wati"] }, { kind: "fill", text: "Kelereng Putri sekarang □", answers: [6] }], explanation: "Danu 9 − 4 = 5 dan Putri 2 + 4 = 6. Sekarang Lia 5, Danu 5, Wati 5, Putri 6, Raka 7. Yang paling sedikit Lia, Danu, dan Wati." }),
  B({ level: "Sangat menantang", prompt: `Berapa banyak huruf seluruhnya pada kata ${word.split("").join(" ")}, dan berapa macam huruf yang berbeda?`, scene: { type: "word", word }, parts: [{ kind: "fill", text: "Banyak huruf □, macam huruf □", answers: [word.length, frequency(lettersOf(word)).size] }], explanation: `Kata itu terdiri atas ${word.length} huruf. Huruf yang berbeda: ${[...frequency(lettersOf(word)).keys()].join(", ")}, ada ${frequency(lettersOf(word)).size} macam.` }),
  A({ level: "Sangat menantang", prompt: "Nilai terkecil sebuah ulangan adalah 4 dan jangkauannya 5. Berapa nilai terbesarnya?", parts: [{ kind: "fill", text: "Nilai terbesar = □", answers: [9] }], explanation: "Jangkauan = terbesar − terkecil, jadi terbesar = 4 + 5 = 9." }),
  B({ level: "Sangat menantang", prompt: "Kartu menunjukkan manik merah yang didapat 10 anak. Lengkapi tabel, lalu hitung anak yang mendapat lebih dari 3.", scene: { type: "cards", values: beads, caption: "Banyak manik merah" }, parts: [{ kind: "table", head: ["Manik merah", "Turus", "Banyak Anak"], noTally: true, rows: [2, 3, 4, 5].map(v => ({ label: String(v), n: countOf(beads, v), tally: false, count: true })) }, { kind: "fill", text: "Lebih dari 3: □ anak", answers: [countOf(beads, 4) + countOf(beads, 5)] }], explanation: `2 manik: ${countOf(beads, 2)} anak, 3: ${countOf(beads, 3)}, 4: ${countOf(beads, 4)}, 5: ${countOf(beads, 5)}. Lebih dari 3 artinya 4 dan 5: ${countOf(beads, 4) + countOf(beads, 5)} anak.` }),
];
