/**
 * Ujian Akhir Tahun (SAT) Matematika Kelas 1: 25 soal, 60 menit.
 * Sumber: pola soal evaluasi delapan bab Kelas 1 (Buku Siswa Matematika SD/MI Kelas I, Kurikulum Merdeka),
 * dengan bilangan, benda, dan gambar yang diganti serta tingkat kesulitan yang dinaikkan.
 *   Bab 1 Membilang sampai 10      Bab 2 Penjumlahan sampai 10   Bab 3 Pengurangan sampai 10   Bab 4 Mengenal Bentuk
 *   Bab 5 Membilang sampai 20      Bab 6 Penjumlahan dan Pengurangan sampai 20                  Bab 7 Mengukur Panjang Benda
 *   Bab 8 Mengenal Diagram
 * Tiga soal per bab (24) ditambah satu soal gabungan Bab 2 dan Bab 7. Urutan bab diselang-seling.
 * Semua kunci dihitung ulang oleh scripts/verify-sat-kelas-1.mjs dari data adegan.
 */
import type { ExamQuestion } from "../types";

export type Thing = "apel" | "jeruk" | "mangga" | "salak" | "balon" | "pensil" | "bola" | "kelereng" | "kue" | "donat" | "bintang";
export type ShapeArt = "book" | "window" | "door" | "frame" | "plate" | "clock" | "egg" | "set-square";

export type Scene =
  /** Bingkai 10 berisi benda; satu bingkai per bilangan. */
  | { type: "frames"; thing: Thing; ns: number[]; labels?: string[] }
  /** Beberapa kelompok benda berlabel. `big` memperbesar gambar (pengecoh ukuran). */
  | { type: "groups"; groups: { thing: Thing; n: number; label: string; big?: boolean }[] }
  /** Benda yang sebagian dicoret (berkurang). */
  | { type: "crossed"; thing: Thing; n: number; cross: number }
  /** Kelompok-kelompok sama besar (penjumlahan berulang). */
  | { type: "repeat"; thing: Thing; groups: number; each: number }
  /** Garis bilangan dengan lompatan maju dari `start` sebanyak `hops`. hops = 0 berarti hanya menandai `marks`. */
  | { type: "line"; from: number; to: number; start: number; hops: number; marks?: number[] }
  /** Pasangan bilangan: utuh dan dua bagian; null berarti kotak kosong. */
  | { type: "bond"; whole: number | null; a: number | null; b: number | null; thing?: Thing }
  /** Puluhan (batang 10) dan satuan (kubus). */
  | { type: "tens"; tens: number; ones: number }
  /** Benda nyata untuk mengenal bentuk. */
  | { type: "objects"; items: ShapeArt[] }
  /** Dua segitiga siku-siku yang belum disatukan. */
  | { type: "triangles" }
  /** Benda berjajar dari garis awal yang sama, panjang dalam satuan petak. */
  | { type: "lengths"; items: { name: string; length: number; color: string; start?: number }[]; grid: number; showGrid: boolean }
  /** Benda diukur dengan penjepit kertas. Benda yang `hidden` tidak digambar (panjangnya disebut di soal). */
  | { type: "clips"; items: { name: string; length: number; color: string }[] }
  /** Diagram gambar (piktogram): satu gambar mewakili satu anak. */
  | { type: "pictograph"; title: string; rows: { label: string; thing: Thing; n: number }[] };

export type Q = ExamQuestion<Scene>;

/** Data piktogram buah kesukaan yang dipakai di tiga soal Bab 8. */
export const fruitPoll: { label: string; thing: Thing; n: number }[] = [
  { label: "Apel", thing: "apel", n: 4 },
  { label: "Jeruk", thing: "jeruk", n: 7 },
  { label: "Mangga", thing: "mangga", n: 3 },
  { label: "Salak", thing: "salak", n: 5 },
];
const poll: Scene = { type: "pictograph", title: "Buah kesukaan siswa kelas 1", rows: fruitPoll };

export const satKelas1: Q[] = [
  // ---------- Sedang (1–8) ----------
  { id: "s01", chapters: [1], level: "Sedang", prompt: "Hitung bola pada setiap bingkai. Tulis lambang bilangannya.",
    scene: { type: "frames", thing: "bola", ns: [8, 6], labels: ["Bingkai A", "Bingkai B"] },
    parts: [{ kind: "num", label: "Bingkai A:", value: 8 }, { kind: "num", label: "Bingkai B:", value: 6 }],
    explanation: "Bingkai A: baris atas penuh 5, baris bawah 3, jadi 8. Bingkai B: 5 dan 1, jadi 6." },
  { id: "s02", chapters: [2], level: "Sedang", prompt: "Di keranjang ada 4 apel. Ibu menambahkan 5 apel. Berapa apel sekarang?",
    scene: { type: "groups", groups: [{ thing: "apel", n: 4, label: "Apel di keranjang" }, { thing: "apel", n: 5, label: "Apel dari Ibu" }] },
    parts: [{ kind: "num", label: "Banyak apel sekarang:", value: 9 }],
    explanation: "Menambahkan berarti menggabungkan: 4 + 5 = 9." },
  { id: "s03", chapters: [4], level: "Sedang", prompt: "Benda mana yang tepinya melengkung?",
    parts: [{ kind: "choice", label: "Pilih benda:", options: [{ text: "Buku", art: "book" }, { text: "Jendela", art: "window" }, { text: "Jam dinding", art: "clock" }], answer: "Jam dinding" }],
    explanation: "Jam dinding berbentuk bundar sehingga tepinya melengkung. Buku dan jendela mempunyai sisi lurus." },
  { id: "s04", chapters: [5], level: "Sedang", prompt: "Ada berapa kelereng pada kedua bingkai?",
    scene: { type: "frames", thing: "kelereng", ns: [10, 6] },
    parts: [{ kind: "num", label: "Banyak kelereng:", value: 16 }],
    explanation: "Satu bingkai penuh berisi 10, ditambah 6, jadi 10 + 6 = 16 (enam belas)." },
  { id: "s05", chapters: [3], level: "Sedang", prompt: "Ada 9 balon. 4 balon meletus (dicoret). Berapa balon yang tersisa?",
    scene: { type: "crossed", thing: "balon", n: 9, cross: 4 },
    parts: [{ kind: "num", label: "Balon yang tersisa:", value: 5 }],
    explanation: "9 − 4 = 5. Hitung balon yang tidak dicoret." },
  { id: "s06", chapters: [7], level: "Sedang", prompt: "Tiga pensil diletakkan dari garis awal yang sama. Pensil mana yang paling panjang?",
    scene: { type: "lengths", grid: 10, showGrid: false, items: [{ name: "Pensil A", length: 6, color: "#e5484d" }, { name: "Pensil B", length: 9, color: "#2f86d6" }, { name: "Pensil C", length: 4, color: "#2b8a3e" }] },
    parts: [{ kind: "choice", label: "Paling panjang:", options: ["Pensil A", "Pensil B", "Pensil C"], answer: "Pensil B" }],
    explanation: "Karena garis awalnya sama, pensil yang ujungnya paling jauh adalah yang paling panjang, yaitu Pensil B." },
  { id: "s07", chapters: [8], level: "Sedang", prompt: "Perhatikan diagram gambar. Berapa siswa yang menyukai jeruk?",
    scene: poll, parts: [{ kind: "num", label: "Penyuka jeruk:", value: 7 }],
    explanation: "Satu gambar mewakili satu siswa. Baris jeruk berisi 7 gambar." },
  { id: "s08", chapters: [6], level: "Sedang", prompt: "Lompat maju dari 13 sebanyak 4 langkah. Berapa hasil 13 + 4?",
    scene: { type: "line", from: 10, to: 20, start: 13, hops: 4 },
    parts: [{ kind: "num", label: "13 + 4 =", value: 17 }],
    explanation: "Dari 13 maju 4 langkah: 14, 15, 16, 17. Jadi 13 + 4 = 17." },

  // ---------- Menantang (9–18) ----------
  { id: "s09", chapters: [1], level: "Menantang", prompt: "Lengkapi pasangan bilangan berikut.",
    scene: { type: "bond", whole: 9, a: 3, b: null, thing: "kelereng" },
    parts: [{ kind: "num", label: "9 adalah 3 dan", value: 6 }],
    explanation: "Dari 9, hitung mundur 3 atau cari 3 + ? = 9. Pasangannya 6, karena 3 dan 6 menjadi 9." },
  { id: "s10", chapters: [2], level: "Menantang", prompt: "Bingkai sudah terisi 7. Berapa lagi agar penuh menjadi 10?",
    scene: { type: "frames", thing: "bintang", ns: [7] },
    parts: [{ kind: "num", label: "7 + … = 10", value: 3 }],
    explanation: "Ada 3 kotak kosong. 7 + 3 = 10." },
  { id: "s11", chapters: [3], level: "Menantang", prompt: "Jika 6 + 3 = 9, berapakah 9 − 6?",
    scene: { type: "bond", whole: 9, a: 6, b: 3 },
    parts: [{ kind: "num", label: "9 − 6 =", value: 3 }],
    explanation: "Pengurangan adalah kebalikan penjumlahan. 6 dan 3 menjadi 9, jadi 9 − 6 = 3." },
  { id: "s12", chapters: [4], level: "Menantang", prompt: "Dua segitiga ini disatukan tepat pada sisi miringnya. Bangun apa yang terbentuk?",
    scene: { type: "triangles" },
    parts: [{ kind: "choice", label: "Bangun yang terbentuk:", options: ["Segi empat", "Lingkaran", "Segitiga besar"], answer: "Segi empat" }],
    explanation: "Dua segitiga siku-siku yang sama besar disatukan pada sisi miringnya membentuk segi empat dengan empat sisi lurus." },
  { id: "s13", chapters: [5], level: "Menantang", prompt: "Urutkan bilangan 16, 11, dan 19 dari yang terkecil.",
    parts: [{ kind: "choice", label: "Urutan yang benar:", options: ["16, 11, 19", "19, 16, 11", "11, 16, 19"], answer: "11, 16, 19" }],
    explanation: "Ketiganya terdiri atas 1 puluhan. Bandingkan satuannya: 1 < 6 < 9, jadi urutannya 11, 16, 19." },
  { id: "s14", chapters: [6], level: "Menantang", prompt: "Ada 15 kue dan 9 donat. Berapa selisih banyak kue dan donat?",
    scene: { type: "groups", groups: [{ thing: "kue", n: 15, label: "Kue" }, { thing: "donat", n: 9, label: "Donat" }] },
    parts: [{ kind: "num", label: "Selisihnya:", value: 6 }],
    explanation: "Pasangkan satu kue dengan satu donat. Ada 6 kue yang tidak berpasangan, jadi 15 − 9 = 6." },
  { id: "s15", chapters: [7], level: "Menantang", prompt: "Pita dan pensil diukur dengan penjepit kertas. Berapa panjang masing-masing?",
    scene: { type: "clips", items: [{ name: "Pita", length: 8, color: "#e8590c" }, { name: "Pensil", length: 5, color: "#2f86d6" }] },
    parts: [{ kind: "num", label: "Panjang pita:", value: 8, unit: "penjepit kertas" }, { kind: "num", label: "Panjang pensil:", value: 5, unit: "penjepit kertas" }],
    explanation: "Hitung penjepit kertas di bawah setiap benda dari ujung kiri sampai ujung kanan: pita 8, pensil 5." },
  { id: "s16", chapters: [8], level: "Menantang", prompt: "Berapa siswa lebih banyak yang menyukai jeruk daripada mangga?",
    scene: poll, parts: [{ kind: "num", label: "Lebih banyak:", value: 4 }],
    explanation: "Jeruk 7 siswa, mangga 3 siswa. 7 − 3 = 4." },
  { id: "s17", chapters: [1], level: "Menantang", prompt: "Kotak mana yang bendanya lebih banyak?",
    scene: { type: "groups", groups: [{ thing: "kelereng", n: 8, label: "Kotak A" }, { thing: "bola", n: 7, label: "Kotak B", big: true }] },
    parts: [{ kind: "choice", label: "Lebih banyak:", options: ["Kotak A", "Kotak B", "Sama banyak"], answer: "Kotak A" }],
    explanation: "Kotak A berisi 8 kelereng, Kotak B berisi 7 bola. Bola lebih besar, tetapi 8 lebih banyak dari 7." },
  { id: "s18", chapters: [2], level: "Menantang", prompt: "Kalimat matematika mana yang sesuai dengan gambar?",
    scene: { type: "repeat", thing: "pensil", groups: 3, each: 3 },
    parts: [{ kind: "choice", label: "Kalimat yang sesuai:", options: ["3 + 3 = 6", "3 + 3 + 3 = 9", "3 + 9 = 12"], answer: "3 + 3 + 3 = 9" }],
    explanation: "Ada 3 kelompok, setiap kelompok 3 pensil: 3 + 3 + 3 = 9." },

  // ---------- Sangat menantang (19–25) ----------
  { id: "s19", chapters: [3], level: "Sangat menantang", prompt: "Dayu mempunyai 10 kelereng. Ia memberikan 3 kelereng kepada Kira dan 2 kelereng kepada Upe. Berapa kelereng Dayu sekarang?",
    scene: { type: "groups", groups: [{ thing: "kelereng", n: 10, label: "Kelereng Dayu" }] },
    parts: [{ kind: "num", label: "Kelereng Dayu sekarang:", value: 5 }],
    explanation: "Dikurangi dua kali: 10 − 3 = 7, lalu 7 − 2 = 5." },
  { id: "s20", chapters: [4], level: "Sangat menantang", prompt: "Berapa benda yang mempunyai empat sisi lurus?",
    scene: { type: "objects", items: ["book", "plate", "window", "door", "clock", "frame"] },
    parts: [{ kind: "num", label: "Banyak benda:", value: 4 }],
    explanation: "Buku, jendela, pintu, dan bingkai foto mempunyai empat sisi lurus. Piring dan jam bertepi melengkung. Jadi ada 4 benda." },
  { id: "s21", chapters: [6], level: "Sangat menantang", prompt: "Hitung 8 + 5 dengan membuat 10. Pecah 5 menjadi 2 dan sebuah bilangan.",
    scene: { type: "bond", whole: 5, a: 2, b: null },
    parts: [{ kind: "num", label: "5 adalah 2 dan", value: 3 }, { kind: "num", label: "8 + 5 =", value: 13 }],
    explanation: "5 dipecah menjadi 2 dan 3. 8 + 2 = 10, lalu 10 + 3 = 13." },
  { id: "s22", chapters: [7], level: "Sangat menantang", prompt: "Dua pita diletakkan di atas petak. Ujung kirinya tidak sejajar. Pita mana yang lebih panjang?",
    scene: { type: "lengths", grid: 11, showGrid: true, items: [{ name: "Pita A", length: 7, color: "#c026d3", start: 4 }, { name: "Pita B", length: 8, color: "#e8590c", start: 0 }] },
    parts: [{ kind: "choice", label: "Lebih panjang:", options: ["Pita A", "Pita B", "Sama panjang"], answer: "Pita B" }],
    explanation: "Ujung kanan Pita A lebih jauh, tetapi garis awalnya berbeda. Hitung petaknya: Pita A 7 petak, Pita B 8 petak. Pita B lebih panjang." },
  { id: "s23", chapters: [8], level: "Sangat menantang", prompt: "Jika 2 siswa yang menyukai apel pindah memilih mangga, buah apa yang jumlah penyukanya sama dengan salak?",
    scene: poll,
    parts: [{ kind: "choice", label: "Sama dengan salak:", options: ["Apel", "Jeruk", "Mangga"], answer: "Mangga" }],
    explanation: "Mangga menjadi 3 + 2 = 5, sama dengan salak (5). Apel menjadi 4 − 2 = 2." },
  { id: "s24", chapters: [5], level: "Sangat menantang", prompt: "Bilangan di antara 15 dan 19 yang lebih besar dari 17 adalah …",
    scene: { type: "line", from: 10, to: 20, start: 15, hops: 0, marks: [15, 19] },
    parts: [{ kind: "num", label: "Bilangannya:", value: 18 }],
    explanation: "Bilangan di antara 15 dan 19 adalah 16, 17, dan 18. Yang lebih besar dari 17 hanya 18." },
  { id: "s25", chapters: [2, 7], level: "Sangat menantang", prompt: "Pensil Rani panjangnya 6 penjepit kertas. Pensil Bimo 3 penjepit kertas lebih panjang dari pensil Rani. Berapa panjang pensil Bimo?",
    scene: { type: "clips", items: [{ name: "Pensil Rani", length: 6, color: "#e5484d" }] },
    parts: [{ kind: "num", label: "Panjang pensil Bimo:", value: 9, unit: "penjepit kertas" }],
    explanation: "Lebih panjang 3 berarti ditambah: 6 + 3 = 9 penjepit kertas." },
];
