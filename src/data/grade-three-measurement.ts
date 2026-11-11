import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 3 Bab 3 - Pengukuran Panjang dan Berat (Buku Matematika SD/MI Kelas III).
 * Sumber lampiran pengguna: pengukuran panjang dengan satuan baku (11 hlm.), hubungan antarsatuan baku panjang
 * (5 hlm.), pengukuran berat dengan satuan baku (10 hlm.), hubungan antarsatuan baku berat (5 hlm.), dan Asesmen
 * (5 soal). Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 * Evaluasi 24 soal = 5 soal bertipe Asesmen + 19 soal bertipe Ayo Berlatih/materi.
 */

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Thing =
  | "pencil" | "pen" | "crayon" | "marker" | "eraser"
  | "cupboard" | "window" | "door" | "board" | "fence" | "table" | "book" | "fork" | "money" | "tv" | "carpet" | "chair"
  | "ruler" | "tape" | "sewing" | "stadiometer"
  | "digital" | "bathroom" | "platform" | "dial" | "balance"
  | "mango" | "corn" | "carrot" | "beans" | "strawberry" | "rice" | "chicken" | "orange" | "egg" | "sugar" | "flour" | "butter" | "apple" | "goat" | "cement";

export type Scene =
  | { type: "ruler"; max: number; objects: { thing: "pencil" | "pen" | "crayon" | "marker" | "eraser"; from: number; to: number; label?: string }[] }
  | { type: "digital"; display: string; thing: Thing; label?: string }
  | { type: "digitals"; items: { display: string; thing: Thing; label: string }[] }
  | { type: "dial"; grams: number; max: number; thing: Thing }
  | { type: "bags"; items: { grams: number; thing: Thing }[] }
  | { type: "plants"; heights: number[] }
  | { type: "scales" }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "fabric"; meters: string; note: string }
  | { type: "balance"; weights: number; thing: Thing };

export type Part =
  | { kind: "number"; label?: string; prefix?: string; unit: string; answer: number }
  | { kind: "compound"; label?: string; prefix?: string; units: [string, string]; answer: [number, number] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "check"; label: string; cards: Thing[]; names: string[]; answer: number[] }
  | { kind: "sort"; label: string; items: { thing?: Thing; name: string; scene?: Scene }[]; bins: string[]; binThings?: Thing[]; answer: number[] };

export type MQuestion = Question & { topic: 0 | 1 | 2 | 3; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Format jawaban: tiap bagian dipisah "‖" ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const idNumber = (n: number) => new Intl.NumberFormat("id-ID").format(n);

function partAnswer(p: Part): string {
  switch (p.kind) {
    case "number": return String(p.answer);
    case "compound": return p.answer.join("|");
    case "choice": return p.answer;
    case "check": return [...p.answer].sort((a, b) => a - b).join(",");
    case "sort": return p.answer.join(",");
  }
}
const digits = (v: string) => v.replace(/\./g, "").trim();
function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": return /^\d+$/.test(digits(v)) && Number(digits(v)) === p.answer;
    case "compound": { const [a, b] = v.split("|").map(digits); return /^\d+$/.test(a ?? "") && /^\d+$/.test(b ?? "") && Number(a) === p.answer[0] && Number(b) === p.answer[1]; }
    case "choice": return v === p.answer;
    case "check": return v.split(",").filter(Boolean).map(Number).sort((a, b) => a - b).join(",") === partAnswer(p);
    case "sort": return v === partAnswer(p);
  }
}
function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": return /^\d+$/.test(digits(v));
    case "compound": { const [a, b] = v.split("|"); return Boolean(a && b); }
    case "choice": return Boolean(v);
    case "check": return v.split(",").filter(Boolean).length > 0;
    case "sort": return v.split(",").length === p.items.length && v.split(",").every(x => x !== "");
  }
}
export const correct = (q: MQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: MQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: MQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = v[i];
    const head = q.parts.length > 1 ? `${p.label ?? String.fromCharCode(97 + i)}: ` : "";
    switch (p.kind) {
      case "number": return `${head}${x ? idNumber(Number(digits(x))) : "…"} ${p.unit}`;
      case "compound": { const [a, b] = x.split("|"); return `${head}${a || "…"} ${p.units[0]} ${b || "…"} ${p.units[1]}`; }
      case "choice": return `${head}${x || "…"}`;
      case "check": return `${head}${x ? x.split(",").filter(Boolean).map(n => p.names[Number(n)]).join(", ") : "tidak ada"}`;
      case "sort": return `${head}${p.items.map((it, k) => `${it.name} → ${x.split(",")[k] ? p.bins[Number(x.split(",")[k])] : "…"}`).join("; ")}`;
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: MQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): MQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(partAnswer).join(SEP), ...extra });
const num = (unit: string, answer: number, prefix?: string, label?: string): Part => ({ kind: "number", unit, answer, prefix, label });
const two = (units: [string, string], answer: [number, number], prefix?: string, label?: string): Part => ({ kind: "compound", units, answer, prefix, label });
const pick = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });

const thingName: Partial<Record<Thing, string>> = {
  cupboard: "Lemari", window: "Jendela", door: "Pintu", board: "Papan tulis", fence: "Pagar", table: "Meja", book: "Buku tulis", fork: "Sendok garpu",
  pencil: "Pensil", money: "Uang kertas", tv: "Televisi", carpet: "Karpet", chair: "Kursi", pen: "Bolpoin", eraser: "Penghapus",
};
const check = (label: string, cards: Thing[], answer: number[]): Part => ({ kind: "check", label, cards, names: cards.map(c => thingName[c] ?? c), answer });

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Pengukuran Panjang dengan Satuan Baku", short: "Mengukur panjang",
    steps: [
      "Satuan baku adalah satuan yang sama di mana pun, misalnya sentimeter (cm) dan meter (m). Jengkal dan pensil bukan satuan baku karena ukurannya berbeda-beda.",
      "Alat ukur panjang: penggaris untuk benda kecil, meteran gulung untuk benda besar seperti pintu dan lemari, meteran jahit untuk lingkar badan, dan pengukur tinggi badan.",
      "Letakkan ujung benda tepat di angka 0, lalu baca angka di ujung lainnya.",
      "Jika ujung benda tidak di angka 0, kurangi angka ujung kanan dengan angka ujung kiri. Benda dari 2 sampai 13 panjangnya 13 − 2 = 11 cm.",
    ],
    demo: "Pilih benda dan geser letaknya di atas penggaris. Perhatikan: panjang benda tetap sama walaupun angka ujungnya berubah.",
  },
  {
    code: "B", title: "Hubungan Antarsatuan Baku Panjang", short: "cm dan m",
    steps: [
      "Pada meteran, angka 100 cm sama dengan 1 meter: 100 cm = 1 m.",
      "Untuk mengubah cm ke m, pisahkan ratusannya: 215 cm = 200 cm + 15 cm = 2 m 15 cm.",
      "Untuk mengubah m ke cm, kalikan dengan 100: 4 m = 400 cm, dan 1 m 17 cm = 100 cm + 17 cm = 117 cm.",
      "Saat menjumlah atau mengurangi, hitung meter dengan meter dan cm dengan cm. Jika cm mencapai 100 atau lebih, tukar 100 cm menjadi 1 m.",
    ],
    demo: "Tarik meteran dengan penggeser. Lihat panjangnya ditulis dalam cm dan dalam m cm, seperti di papan tulis pada buku.",
  },
  {
    code: "C", title: "Pengukuran Berat dengan Satuan Baku", short: "Mengukur berat",
    steps: [
      "Satuan baku berat adalah gram dan kilogram (kg).",
      "Timbangan digital dan timbangan duduk cocok untuk bahan makanan di dapur atau di pasar. Timbangan badan untuk berat tubuh. Timbangan besar (sentisimal) untuk barang berat seperti karung beras.",
      "Timbangan digital langsung menunjukkan angka, biasanya dalam gram.",
      "Pada timbangan duduk, baca angka yang ditunjuk jarum. Satu garis kecil antara dua angka = 100 gram. Jarum di 4 kurang 3 garis berarti 3 kg 700 gram.",
    ],
    demo: "Ketuk benda untuk menaruh atau mengambilnya dari timbangan. Bandingkan angka timbangan digital dengan jarum timbangan duduk.",
  },
  {
    code: "D", title: "Hubungan Antarsatuan Baku Berat", short: "kg, ons, gram",
    steps: [
      "1 kilogram = 1.000 gram, 1 kilogram = 10 ons, dan 1 ons = 100 gram.",
      "Untuk mengubah gram ke kg, pisahkan ribuannya: 1.753 gram = 1.000 gram + 753 gram = 1 kg 753 gram.",
      "Untuk mengubah kg ke gram, kalikan dengan 1.000: 4 kg 150 gram = 4.000 gram + 150 gram = 4.150 gram.",
      "Timbangan kodok memakai anak timbangan (bandul). Timbangan seimbang jika berat bandul sama dengan berat benda.",
    ],
    demo: "Taruh bandul 1 kg, ½ kg, 2 ons, dan 1 ons sampai timbangan kodok seimbang. Lihat beratnya dalam kg, ons, dan gram.",
  },
] as const;

const lengthTools = ["Penggaris", "Meteran gulung", "Meteran jahit", "Pengukur tinggi badan"];
const units = ["cm", "gram", "kg"];

/* ---------- Latihan (4 soal per subtopik, mengikuti Ayo Berlatih) ---------- */
export const practice: MQuestion[][] = [
  [
    q(0, "Berapa panjang pensil pada gambar?", [num("cm", 14, "Panjang pensil")], "Ujung pensil berada di angka 0 dan ujung lainnya di angka 14, jadi panjangnya 14 cm.",
      { scene: { type: "ruler", max: 20, objects: [{ thing: "pencil", from: 0, to: 14 }] } }),
    q(0, "Lengkapi tabel: pilih alat ukur dan satuan baku untuk setiap bagian yang diukur.", [
      pick("Tinggi badan: alat ukur", lengthTools, "Pengukur tinggi badan"), pick("Tinggi badan: satuan", units, "cm"),
      pick("Lingkar perut: alat ukur", lengthTools, "Meteran jahit"), pick("Panjang pulpen: alat ukur", lengthTools, "Penggaris"),
    ], "Tinggi badan diukur dengan pengukur tinggi badan (cm), lingkar perut dengan meteran jahit karena bisa melingkar, dan pulpen dengan penggaris."),
    q(0, "Berilah tanda centang (✓) untuk benda yang tepat diukur dengan meteran gulung!", [check("Benda", ["cupboard", "pencil", "door", "fork", "fence", "book"], [0, 2, 4])],
      "Lemari, pintu, dan pagar panjangnya lebih dari penggaris, jadi tepat diukur dengan meteran gulung. Pensil, sendok garpu, dan buku cukup dengan penggaris."),
    q(0, "Ujung spidol tidak berada di angka 0. Berapa panjang spidol?", [num("cm", 10, "Panjang spidol")], "Spidol dari angka 2 sampai 12. Panjangnya 12 − 2 = 10 cm.",
      { scene: { type: "ruler", max: 20, objects: [{ thing: "marker", from: 2, to: 12 }] } }),
  ],
  [
    q(1, "Lengkapi ukuran panjang berikut.", [num("m", 9, "900 cm ="), num("cm", 600, "6 m ="), num("cm", 300, "… cm = 3 m →")], "100 cm = 1 m. 900 cm = 9 m, 6 m = 600 cm, dan 3 m = 300 cm."),
    q(1, "Lengkapi tinggi badan dalam cm, lalu tentukan yang paling pendek.", [num("cm", 117, "Azizah 1 m 17 cm ="), num("cm", 105, "Lilik 1 m 5 cm ="), two(["m", "cm"], [1, 15], "Eri 115 cm ="), pick("Paling pendek", ["Azizah", "Lilik", "Eri"], "Lilik")],
      "1 m 17 cm = 117 cm, 1 m 5 cm = 105 cm, 115 cm = 1 m 15 cm. Yang paling pendek Lilik (105 cm)."),
    q(1, "Meutia menyambung dua pita: 4 m 37 cm dan 2 m 41 cm. Berapa panjang pita setelah disambung?", [two(["m", "cm"], [6, 78], "Panjang pita")], "Meter dengan meter: 4 + 2 = 6 m. Sentimeter dengan sentimeter: 37 + 41 = 78 cm. Jadi 6 m 78 cm."),
    q(1, "Kebun jagung Paman sepanjang 6.000 cm. Berapa meter panjang kebun itu?", [num("m", 60, "Panjang kebun")], "Setiap 100 cm = 1 m. 6.000 cm = 60 × 100 cm = 60 m."),
  ],
  [
    q(2, "Ibu menimbang gula dengan timbangan digital. Berapa berat gula?", [num("gram", 1000, "Berat gula")], "Layar menunjukkan 1000, satuannya gram. Jadi berat gula 1.000 gram (= 1 kg).",
      { scene: { type: "digital", display: "1000", thing: "sugar" } }),
    q(2, "Mula-mula timbangan menunjukkan 100 gram. Setelah ditambah stroberi, timbangan menunjukkan 500 gram. \"Berat buah tambahan adalah 500 gram.\" Benar atau salah?", [
      pick("Pernyataan", ["B (benar)", "S (salah)"], "S (salah)"), pick("Alasannya", ["500 − 100 = 400 gram, jadi tambahannya 400 gram", "Timbangan menunjukkan 500 gram", "500 + 100 = 600 gram"], "500 − 100 = 400 gram, jadi tambahannya 400 gram"),
    ], "Berat tambahan = berat akhir − berat awal = 500 − 100 = 400 gram, bukan 500 gram.", { scene: { type: "digitals", items: [{ display: "100", thing: "strawberry", label: "Sebelum" }, { display: "500", thing: "strawberry", label: "Sesudah" }] } }),
    q(2, "Pilihlah timbangan yang tepat untuk menimbang benda berikut dengan mengisi nomor timbangan.", [{ kind: "sort", label: "Benda", items: [{ thing: "mango", name: "Mangga" }, { thing: "rice", name: "Karung beras" }, { thing: "carrot", name: "Wortel" }, { thing: "goat", name: "Kambing" }], bins: ["1", "2", "3"], answer: [0, 2, 0, 2] }],
      "Mangga dan wortel ringan, ditimbang dengan timbangan digital (1). Karung beras dan kambing berat, ditimbang dengan timbangan besar (3). Timbangan 2 adalah timbangan badan.", { scene: { type: "scales" } }),
    q(2, "Jarum timbangan duduk menunjuk angka 4 kurang 1 garis. Berapa berat tepung?", [two(["kg", "gram"], [3, 900], "Berat tepung")], "Angka 4 berarti 4 kg. Satu garis kecil = 100 gram. 4 kg − 100 gram = 3 kg 900 gram.",
      { scene: { type: "dial", grams: 3900, max: 5, thing: "flour" } }),
  ],
  [
    q(3, "Lengkapi ukuran berat berikut.", [num("gram", 20000, "20 kg ="), two(["kg", "gram"], [1, 200], "1.200 gram ="), num("gram", 3000, "… gram = 3 kg →")], "1 kg = 1.000 gram. 20 kg = 20.000 gram, 1.200 gram = 1 kg 200 gram, 3 kg = 3.000 gram."),
    q(3, "Meutia memanen 8.000 gram mangga, lalu menjual 4 kg. Berapa kg sisa mangga?", [num("kg", 4, "Sisa mangga")], "8.000 gram = 8 kg. 8 kg − 4 kg = 4 kg."),
    q(3, "Berapa berat kedua kantong jeruk berikut?", [num("gram", 1000, "Berat semua")], "500 gram + 500 gram = 1.000 gram.", { scene: { type: "bags", items: [{ grams: 500, thing: "orange" }, { grams: 500, thing: "orange" }] } }),
    q(3, "Tentukan berat jeruk pada setiap timbangan kodok dengan menghubungkan ke beratnya.", [{ kind: "sort", label: "Timbangan", items: [
      { name: "Timbangan A", scene: { type: "balance", weights: 3, thing: "orange" } }, { name: "Timbangan B", scene: { type: "balance", weights: 5, thing: "orange" } }, { name: "Timbangan C", scene: { type: "balance", weights: 1, thing: "orange" } }],
      bins: ["1.000 gram", "3.000 gram", "5.000 gram"], answer: [1, 2, 0] }],
      "Setiap bandul 1 kg = 1.000 gram. A: 3 bandul = 3.000 gram. B: 5 bandul = 5.000 gram. C: 1 bandul = 1.000 gram."),
  ],
];

/* ---------- Evaluasi 24 soal ---------- */
const eRuler = (thing: "pencil" | "pen" | "crayon" | "marker" | "eraser", from: number, to: number): Scene => ({ type: "ruler", max: 20, objects: [{ thing, from, to }] });
export const assessment: MQuestion[] = [
  q(0, "Berapa panjang krayon pada gambar?", [num("cm", 9, "Panjang krayon")], "Krayon dimulai dari angka 0 dan berakhir di angka 9, jadi panjangnya 9 cm.", { level: "Sedang", scene: eRuler("crayon", 0, 9) }),
  q(2, "Ibu menimbang tepung dengan timbangan digital. Berapa berat tepung?", [num("gram", 1250, "Berat tepung")], "Layar menunjukkan 1250 dengan satuan gram, jadi beratnya 1.250 gram.", { level: "Sedang", scene: { type: "digital", display: "1250", thing: "flour" } }),
  q(1, "Lengkapi ukuran panjang berikut: 800 cm = … m", [num("m", 8, "800 cm =")], "100 cm = 1 m, jadi 800 cm = 8 m.", { level: "Sedang" }),
  q(3, "Tentukan berat apel pada setiap timbangan kodok dengan menghubungkan ke beratnya.", [{ kind: "sort", label: "Timbangan", items: [
    { name: "Timbangan A", scene: { type: "balance", weights: 2, thing: "apple" } }, { name: "Timbangan B", scene: { type: "balance", weights: 4, thing: "apple" } }, { name: "Timbangan C", scene: { type: "balance", weights: 1, thing: "apple" } }],
    bins: ["1.000 gram", "2.000 gram", "4.000 gram"], answer: [1, 2, 0] }],
    "Setiap bandul 1 kg = 1.000 gram. A: 2 bandul = 2.000 gram, B: 4 bandul = 4.000 gram, C: 1 bandul = 1.000 gram.", { level: "Sedang" }),
  q(0, "Hubungkan alat ukur yang tepat untuk mengukur benda berikut.", [{ kind: "sort", label: "Benda", items: [{ thing: "book", name: "Buku tulis" }, { thing: "door", name: "Pintu" }, { thing: "pen", name: "Bolpoin" }, { thing: "cupboard", name: "Lemari" }, { thing: "board", name: "Lebar papan tulis" }], bins: ["Meteran gulung", "Penggaris"], binThings: ["tape", "ruler"], answer: [1, 0, 1, 0, 0] }],
    "Benda pendek (buku tulis, bolpoin) diukur dengan penggaris. Benda panjang (pintu, lemari, papan tulis) diukur dengan meteran gulung.", { level: "Sedang" }),
  q(1, "Pada lomba balap karung, panjang lintasan 700 cm. Peserta harus berlari sampai ujung lalu kembali ke tempat semula.", [num("cm", 1400, "a. Total lintasan yang dilalui", "a"), num("m", 14, "b. Dalam meter", "b")],
    "Pergi dan kembali berarti 2 kali lintasan: 700 + 700 = 1.400 cm. 1.400 cm = 14 m.", { level: "Menantang" }),
  q(2, "Mula-mula timbangan menunjukkan 250 gram. Setelah ditambah tomat, timbangan menunjukkan 700 gram. \"Berat tomat tambahan adalah 700 gram.\" Benar atau salah?", [
    pick("Pernyataan", ["B (benar)", "S (salah)"], "S (salah)"), pick("Alasannya", ["700 + 250 = 950 gram", "700 − 250 = 450 gram, jadi tambahannya 450 gram", "Timbangan menunjukkan 700 gram"], "700 − 250 = 450 gram, jadi tambahannya 450 gram"),
  ], "Tambahan = 700 − 250 = 450 gram. Jadi pernyataannya salah.", { level: "Menantang", scene: { type: "digitals", items: [{ display: "250", thing: "strawberry", label: "Sebelum" }, { display: "700", thing: "strawberry", label: "Sesudah" }] } }),
  q(3, "Lengkapi: 2.400 gram = … kg … gram", [two(["kg", "gram"], [2, 400], "2.400 gram =")], "2.400 gram = 2.000 gram + 400 gram = 2 kg 400 gram.", { level: "Menantang" }),
  q(0, "Ujung bolpoin tidak berada di angka 0. Berapa panjang bolpoin?", [num("cm", 12, "Panjang bolpoin")], "Bolpoin dari angka 3 sampai 15. Panjangnya 15 − 3 = 12 cm.", { level: "Menantang", scene: eRuler("pen", 3, 15) }),
  q(2, "Berapa berat beras yang ditunjuk jarum timbangan duduk?", [num("kg", 2, "Berat beras")], "Jarum tepat menunjuk angka 2, jadi beratnya 2 kg.", { level: "Sedang", scene: { type: "dial", grams: 2000, max: 5, thing: "rice" } }),
  q(1, "Lengkapi: 2 m 45 cm = … cm", [num("cm", 245, "2 m 45 cm =")], "2 m = 200 cm. 200 cm + 45 cm = 245 cm.", { level: "Menantang" }),
  q(3, "Berapa berat ketiga kantong apel berikut?", [num("gram", 750, "Berat semua")], "250 + 250 + 250 = 750 gram.", { level: "Sedang", scene: { type: "bags", items: [{ grams: 250, thing: "apple" }, { grams: 250, thing: "apple" }, { grams: 250, thing: "apple" }] } }),
  q(0, "Berilah tanda centang (✓) untuk benda yang tepat diukur dengan penggaris!", [check("Benda", ["carpet", "window", "fork", "tv", "money", "door", "pencil", "book"], [2, 4, 6, 7])],
    "Sendok garpu, uang kertas, pensil, dan buku lebih pendek dari penggaris 30 cm. Karpet, jendela, televisi besar, dan pintu lebih tepat diukur dengan meteran.", { level: "Sedang" }),
  q(2, "Pilihlah timbangan yang tepat untuk menimbang benda berikut dengan mengisi nomor timbangan.", [{ kind: "sort", label: "Benda", items: [
    { thing: "strawberry", name: "Stroberi" }, { thing: "cement", name: "Sak semen" }, { thing: "beans", name: "Kacang panjang" }, { thing: "corn", name: "Jagung" }, { thing: "rice", name: "Karung beras" }], bins: ["1", "2", "3"], answer: [0, 2, 0, 0, 2] }],
    "Stroberi, kacang panjang, dan jagung ditimbang dengan timbangan digital (1). Sak semen dan karung beras berat, ditimbang dengan timbangan besar (3).", { level: "Menantang", scene: { type: "scales" } }),
  q(1, "Seorang penjaga toko memiliki kain 6 m 72 cm. Ia menjual 2 m 35 cm. Berapa sisa kain?", [two(["m", "cm"], [4, 37], "Sisa kain")], "Meter: 6 − 2 = 4 m. Sentimeter: 72 − 35 = 37 cm. Sisa 4 m 37 cm.", { level: "Menantang" }),
  q(3, "Lengkapi: 3 kg 75 gram = … gram", [num("gram", 3075, "3 kg 75 gram =")], "3 kg = 3.000 gram. 3.000 + 75 = 3.075 gram (bukan 375 atau 3.750).", { level: "Menantang" }),
  q(2, "Meutia menimbang tiga bahan kue dengan timbangan digital.", [pick("a. Bahan yang paling berat", ["Telur", "Gula", "Mentega"], "Gula"), num("gram", 700, "b. Selisih bahan terberat dan teringan", "b")],
    "Gula 1.000 gram paling berat, telur 300 gram paling ringan. Selisihnya 1.000 − 300 = 700 gram.", { level: "Menantang", scene: { type: "digitals", items: [{ display: "300", thing: "egg", label: "Telur" }, { display: "1000", thing: "sugar", label: "Gula" }, { display: "450", thing: "butter", label: "Mentega" }] } }),
  q(0, "Galih mengukur tinggi tanaman di pot 1, 2, dan 3.", [pick("a. Tanaman paling pendek", ["Pot 1", "Pot 2", "Pot 3"], "Pot 2"), pick("b. Tanaman paling tinggi", ["Pot 1", "Pot 2", "Pot 3"], "Pot 3"), num("cm", 14, "c. Selisih tanaman tertinggi dan terpendek", "c")],
    "Tingginya 25 cm, 18 cm, dan 32 cm. Terpendek pot 2, tertinggi pot 3. Selisihnya 32 − 18 = 14 cm.", { level: "Sangat menantang", scene: { type: "plants", heights: [25, 18, 32] } }),
  q(1, "Ibu Meutia membeli kain untuk seragam. Ada 4 pesanan seragam. Setiap seragam membutuhkan kain 150 cm. Ibu Meutia memiliki kain 750 cm.", [
    pick("a. Apakah kain Ibu Meutia kurang?", ["Ya", "Tidak"], "Tidak"), pick("b. Apakah ada sisa kain?", ["Ya", "Tidak"], "Ya"), num("cm", 150, "c. Panjang sisa kain", "c")],
    "Kain yang dibutuhkan 4 × 150 = 600 cm. 600 cm < 750 cm, jadi kain tidak kurang. Sisa kain 750 − 600 = 150 cm.", { level: "Sangat menantang", scene: { type: "fabric", meters: "750 cm", note: "4 seragam × 150 cm" } }),
  q(3, "Drio memiliki 12 kantong plastik berisi buah apel. Setiap kantong beratnya 2 kg. Apel yang terjual sebanyak 15 kg. Berapa sisa apel yang belum terjual?", [num("kg", 9, "Sisa apel")],
    "Berat semua apel 12 × 2 = 24 kg. Sisa 24 − 15 = 9 kg.", { level: "Sangat menantang" }),
  q(2, "Meutia menimbang gula dengan timbangan duduk bersatuan kg. Jarum menunjuk angka 3 kurang 2 garis. Berapa berat gula?", [two(["kg", "gram"], [2, 800], "Berat gula")],
    "Satu garis kecil = 100 gram. 3 kg − 200 gram = 2 kg 800 gram.", { level: "Sangat menantang", scene: { type: "dial", grams: 2800, max: 5, thing: "sugar" } }),
  q(0, "Bolpoin dan krayon diukur dengan penggaris. Berapa selisih panjang keduanya?", [num("cm", 5, "Selisih panjang")], "Bolpoin: 18 − 4 = 14 cm. Krayon: 11 − 2 = 9 cm. Selisihnya 14 − 9 = 5 cm.",
    { level: "Sangat menantang", scene: { type: "ruler", max: 20, objects: [{ thing: "pen", from: 4, to: 18, label: "Bolpoin" }, { thing: "crayon", from: 2, to: 11, label: "Krayon" }] } }),
  q(3, "Sebuah karung berisi 72 kg 640 gram beras dan karung lainnya berisi 18 kg 570 gram beras. Berapa berat beras dalam kedua karung?", [two(["kg", "gram"], [91, 210], "Berat semua")],
    "Gram: 640 + 570 = 1.210 gram = 1 kg 210 gram. Kg: 72 + 18 + 1 = 91 kg. Jadi 91 kg 210 gram.", { level: "Sangat menantang" }),
  q(1, "Meutia menyambung dua pita: 3 m 65 cm dan 4 m 58 cm. Berapa panjang pita setelah disambung?", [two(["m", "cm"], [8, 23], "Panjang pita")],
    "Sentimeter: 65 + 58 = 123 cm = 1 m 23 cm. Meter: 3 + 4 + 1 = 8 m. Jadi 8 m 23 cm.", { level: "Sangat menantang" }),
];
