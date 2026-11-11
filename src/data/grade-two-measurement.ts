import type { Question } from "./grade-four-whole-numbers";

/* ====================================================================== */
/* Kelas 2 Bab 6: Pengukuran (berat dan waktu)                             */
/* ====================================================================== */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Benda dan perkiraan beratnya (gram) untuk memeriksa kunci ---------- */
export const things = {
  semangka: { name: "Semangka", g: 3000 }, mangga: { name: "Mangga", g: 250 }, manggis: { name: "Manggis", g: 80 }, apel: { name: "Apel", g: 180 },
  belimbing: { name: "Belimbing", g: 150 }, jeruk: { name: "Jeruk", g: 150 }, stroberi: { name: "Stroberi", g: 20 }, pisang: { name: "Pisang", g: 120 },
  kelapa: { name: "Kelapa", g: 1000 }, labu: { name: "Labu", g: 1500 }, pepaya: { name: "Pepaya", g: 800 }, kol: { name: "Kol", g: 700 }, wortel: { name: "Wortel", g: 80 },
  kucing: { name: "Kucing", g: 4000 }, tikus: { name: "Tikus", g: 300 }, tupai: { name: "Tupai", g: 300 }, anjing: { name: "Anjing", g: 15000 },
  gajah: { name: "Gajah", g: 4000000 }, kambing: { name: "Kambing", g: 40000 }, kelinci: { name: "Kelinci", g: 2000 }, kupu: { name: "Kupu-kupu", g: 1 }, monyet: { name: "Monyet", g: 8000 },
  burung: { name: "Burung", g: 60 },
  bulu: { name: "Bulu ayam", g: 1 }, buku: { name: "Buku", g: 300 }, pensil: { name: "Pensil", g: 10 }, tas: { name: "Tas sekolah", g: 2000 }, penggaris: { name: "Penggaris", g: 30 },
  gunting: { name: "Gunting", g: 50 }, bolaSepak: { name: "Bola sepak", g: 430 }, kelereng: { name: "Kelereng", g: 5 }, bolaTenis: { name: "Bola tenis", g: 60 }, balok: { name: "Balok mainan", g: 20 },
  sepeda: { name: "Sepeda", g: 12000 }, motor: { name: "Sepeda motor", g: 100000 }, mobil: { name: "Mobil", g: 1200000 }, truk: { name: "Truk", g: 8000000 },
  bukuMerah: { name: "Buku merah", g: 0 }, bukuBiru: { name: "Buku biru", g: 0 },
} as const;
export type Thing = keyof typeof things;

/* ---------- Kegiatan dan bagian hari ---------- */
export const acts = {
  bangun: "Bangun tidur", sarapan: "Sarapan", sekolah: "Berangkat ke sekolah", belajar: "Belajar di sekolah", makanSiang: "Makan siang di kantin",
  bola: "Bermain bola", mandiSore: "Mandi sore", sikatGigi: "Menyikat gigi", menyisir: "Menyisir rambut", mandi: "Mandi", cuciTangan: "Mencuci tangan",
  tidur: "Tidur malam", makanMalam: "Makan malam", olahraga: "Berolahraga", membaca: "Membaca buku", istirahat: "Istirahat sekolah",
} as const;
export type Act = keyof typeof acts;
export type Tod = "pagi" | "siang" | "sore" | "malam";
/** Bagian hari dari jam 24-an. */
export const todOf = (h24: number): Tod => (h24 >= 4 && h24 < 11 ? "pagi" : h24 >= 11 && h24 < 15 ? "siang" : h24 >= 15 && h24 < 18 ? "sore" : "malam");
export const to12 = (h24: number) => ((h24 + 11) % 12) + 1;
/** Lama kegiatan (menit) untuk soal lebih lama/lebih sebentar. */
export const minutes: Record<Act, number> = { bangun: 5, sarapan: 20, sekolah: 20, belajar: 300, makanSiang: 20, bola: 60, mandiSore: 10, sikatGigi: 3, menyisir: 2, mandi: 10, cuciTangan: 1, tidur: 540, makanMalam: 20, olahraga: 60, membaca: 30, istirahat: 20 };

/* ---------- Gambar ---------- */
export type Pan = { o: Thing; n: number };
export type Fig =
  /** Timbangan: sisi yang lebih berat turun. w: berat satu benda pada soal ini (satuan bebas). */
  | { t: "balance"; style: "jungkat" | "piring"; left: Pan[]; right: Pan[]; w: Partial<Record<Thing, number>> }
  | { t: "balances"; list: { left: Pan[]; right: Pan[] }[]; w: Partial<Record<Thing, number>> }
  | { t: "clock"; h: number; act?: Act; tod?: Tod }
  | { t: "clocks"; list: { h: number; label: string }[] }
  | { t: "digital"; h: number }
  | { t: "act"; a: Act; tod?: Tod }
  | { t: "thing"; o: Thing };
export type Item = { name: string; fig: Fig };
export type Part =
  | { kind: "number"; label: string; answer: number; suffix?: string }
  | { kind: "choice"; label: string; options: string[]; figs?: Fig[]; answer: string }
  | { kind: "blanks"; sentences: { text: string; options: string[]; answer: string }[] }
  | { kind: "pairs"; label: string; pairs: [Item, Item][]; answer: number[] }
  | { kind: "extreme"; label: string; items: Item[]; heavy: number; light: number }
  | { kind: "order"; label: string; items: Item[]; answer: number[] }
  | { kind: "sort"; label: string; items: Item[]; bins: string[]; answer: number[] }
  | { kind: "setClock"; label: string; answer: number };

export type MQuestion = Question & { topic: 0 | 1; level?: Level; fig?: Fig; parts: Part[] };
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };

export const panWeight = (pans: Pan[], w: Partial<Record<Thing, number>>) => pans.reduce((s, p) => s + (w[p.o] ?? 0) * p.n, 0);
export const tilt = (b: { left: Pan[]; right: Pan[] }, w: Partial<Record<Thing, number>>) => Math.sign(panWeight(b.left, w) - panWeight(b.right, w));

function partAnswer(p: Part): string {
  switch (p.kind) {
    case "number": case "setClock": return String(p.answer);
    case "choice": return p.answer;
    case "blanks": return p.sentences.map(s => s.answer).join("|");
    case "pairs": case "order": case "sort": return p.answer.join(",");
    case "extreme": return `${p.heavy},${p.light}`;
  }
}
function partCorrect(p: Part, v: string): boolean {
  if (p.kind === "number" || p.kind === "setClock") return /^\d+$/.test(v.trim()) && Number(v) === p.answer;
  return v === partAnswer(p);
}
function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "number": case "setClock": return /^\d+$/.test(v.trim());
    case "choice": return Boolean(v);
    case "blanks": { const x = v.split("|"); return x.length === p.sentences.length && x.every(Boolean); }
    case "pairs": { const x = v.split(","); return x.length === p.pairs.length && x.every(y => y !== ""); }
    case "order": return v.split(",").filter(Boolean).length === p.items.length;
    case "sort": { const x = v.split(","); return x.length === p.items.length && x.every(y => y !== ""); }
    case "extreme": { const [h, l] = v.split(","); return h !== undefined && h !== "" && l !== undefined && l !== ""; }
  }
}
export const correct = (q: MQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: MQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: MQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = v[i];
    switch (p.kind) {
      case "blanks": return x.split("|").map((w, k) => p.sentences[k].text.replace("…", w || "…")).join(" ");
      case "pairs": return x.split(",").map((c, k) => (c === "" ? "…" : p.pairs[k][Number(c)].name)).join(", ");
      case "order": return x.split(",").filter(Boolean).map(k => p.items[Number(k)].name).join(", ") || "…";
      case "sort": return x.split(",").map((b, k) => `${p.items[k].name}: ${b === "" ? "…" : p.bins[Number(b)]}`).join("; ");
      case "extreme": { const [h, l] = x.split(","); return `paling berat ${h ? p.items[Number(h)].name : "…"}, paling ringan ${l ? p.items[Number(l)].name : "…"}`; }
      case "setClock": return x ? `jarum pendek di angka ${x}` : "…";
      case "number": return `${p.label} ${x || "…"}${p.suffix ? ` ${p.suffix}` : ""}`;
      default: return x || "…";
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: MQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; fig?: Fig } = {}): MQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(partAnswer).join(SEP), ...extra });
const th = (o: Thing): Item => ({ name: things[o].name, fig: { t: "thing", o } });
const ac = (a: Act, h: number): Item => ({ name: acts[a], fig: { t: "clock", h: to12(h), act: a, tod: todOf(h) } });
const acNoClock = (a: Act, h: number): Item => ({ name: acts[a], fig: { t: "act", a, tod: todOf(h) } });
const W3 = ["lebih berat", "lebih ringan", "sama berat"];
const W5 = ["lebih berat", "lebih ringan", "sama berat", "paling berat", "paling ringan"];
const T4: Tod[] = ["pagi", "siang", "sore", "malam"];
const pan = (o: Thing, n = 1): Pan => ({ o, n });

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Berat", short: "Berat",
    steps: [
      "Berat benda dapat dibandingkan dengan timbangan jungkat-jungkit, gantungan baju, atau kedua tangan.",
      "Sisi timbangan yang turun lebih berat. Sisi yang naik lebih ringan. Jika datar, kedua benda sama berat.",
      "Gunakan kata lebih berat, lebih ringan, sama berat, paling berat, dan paling ringan.",
      "Berat benda dapat diukur dengan benda kecil yang sama, misalnya kelereng atau balok mainan. Hasilnya berbeda jika pengukurnya berbeda.",
    ],
    demo: "Letakkan boneka di satu sisi, lalu tambahkan bola tenis atau kelereng satu per satu sampai timbangan datar. Hitung banyak pengukurnya.",
  },
  {
    code: "B", title: "Waktu", short: "Waktu",
    steps: [
      "Jarum pendek menunjukkan jam. Jarum panjang menunjukkan menit.",
      "Jika jarum panjang di angka 12 dan jarum pendek di angka 5, jam menunjukkan pukul 5 tepat.",
      "Satu hari dibagi menjadi pagi, siang, sore, dan malam. Pukul 7 pagi dan pukul 7 malam jarumnya sama, tetapi kegiatannya berbeda.",
      "Kegiatan dapat dibandingkan: tidur malam lebih lama dari menyikat gigi, mencuci tangan lebih sebentar dari bermain bola.",
    ],
    demo: "Putar jarum pendek ke angka yang kamu inginkan, lalu pilih pagi, siang, sore, atau malam. Lihat contoh kegiatan pada waktu itu.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: MQuestion[][] = [
  [
    q(0, "Amati jungkat-jungkit. Lengkapi kalimatnya.", [{ kind: "blanks", sentences: [{ text: "Kupu-kupu … dari burung.", options: W3, answer: "lebih ringan" }, { text: "Burung … dari kupu-kupu.", options: W3, answer: "lebih berat" }] }],
      "Sisi burung turun, jadi burung lebih berat. Sisi kupu-kupu naik, jadi kupu-kupu lebih ringan.", { fig: { t: "balance", style: "jungkat", left: [pan("kupu")], right: [pan("burung")], w: { kupu: 1, burung: 60 } } }),
    q(0, "Tebak benda yang lebih berat pada setiap pasangan. Beri tanda centang.", [{ kind: "pairs", label: "Pasangan", pairs: [[th("bulu"), th("buku")], [th("bolaSepak"), th("kelereng")], [th("sepeda"), th("mobil")]], answer: [1, 0, 1] }],
      "Buku lebih berat dari bulu ayam, bola sepak lebih berat dari kelereng, dan mobil lebih berat dari sepeda."),
    q(0, "Warnai kendaraan yang paling berat dengan merah dan yang paling ringan dengan kuning.", [{ kind: "extreme", label: "Kendaraan", items: [th("motor"), th("truk"), th("sepeda"), th("mobil")], heavy: 1, light: 2 }],
      "Truk paling berat karena paling besar dan dapat mengangkut banyak barang. Sepeda paling ringan karena dapat diangkat orang."),
    q(0, "Amati timbangan. Berat 1 labu = … apel.", [{ kind: "number", label: "Berat 1 labu =", answer: 6, suffix: "apel" }],
      "Timbangan datar ketika ada 6 apel, jadi berat 1 labu sama dengan berat 6 apel.", { fig: { t: "balance", style: "piring", left: [pan("labu")], right: [pan("apel", 6)], w: { labu: 6, apel: 1 } } }),
  ],
  [
    q(1, "Tika sarapan. Pukul berapa Tika sarapan?", [{ kind: "number", label: "Pukul", answer: 6 }, { kind: "choice", label: "Waktunya", options: T4, answer: "pagi" }],
      "Jarum pendek di angka 6 dan jarum panjang di angka 12, jadi pukul 6 tepat. Sarapan dilakukan pagi hari.", { fig: { t: "clock", h: 6, act: "sarapan", tod: "pagi" } }),
    q(1, "Kelompokkan kegiatan menurut waktunya.", [{ kind: "sort", label: "Kegiatan", items: [ac("makanSiang", 12), ac("tidur", 21), ac("bangun", 5), ac("bola", 16)], bins: T4.map(t => t[0].toUpperCase() + t.slice(1)), answer: [1, 3, 0, 2] }],
      "Bangun tidur pukul 5 pagi, makan siang pukul 12 siang, bermain bola pukul 4 sore, tidur pukul 9 malam."),
    q(1, "Beri tanda centang pada kegiatan yang lebih lama.", [{ kind: "pairs", label: "Pasangan", pairs: [[acNoClock("menyisir", 7), acNoClock("mandi", 7)], [acNoClock("tidur", 21), acNoClock("sikatGigi", 21)]], answer: [1, 0] }],
      "Mandi lebih lama dari menyisir rambut. Tidur malam lebih lama dari menyikat gigi."),
    q(1, "Tika tidur pukul 9 malam. Atur jarum pendeknya.", [{ kind: "setClock", label: "Jarum pendek", answer: 9 }],
      "Pukul 9 tepat: jarum pendek di angka 9 dan jarum panjang di angka 12."),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
const kolW = { kol: 7, wortel: 1, labu: 15 };
export const assessment: MQuestion[] = [
  q(0, "Lingkari buah yang paling berat.", [{ kind: "choice", label: "Buah", options: ["Mangga", "Manggis", "Apel", "Semangka", "Belimbing"], figs: (["mangga", "manggis", "apel", "semangka", "belimbing"] as Thing[]).map(o => ({ t: "thing", o })), answer: "Semangka" }],
    "Semangka paling besar dan paling berat. Buah lainnya dapat dipegang dengan satu tangan.", { level: "Sedang" }),
  q(1, "Lili belajar di sekolah. Pukul berapa Lili belajar?", [{ kind: "number", label: "Pukul", answer: 7 }, { kind: "choice", label: "Waktunya", options: T4, answer: "pagi" }],
    "Jarum pendek di angka 7 dan jarum panjang di angka 12, jadi pukul 7 tepat. Belajar di sekolah dimulai pagi hari.", { level: "Sedang", fig: { t: "clock", h: 7, act: "belajar", tod: "pagi" } }),
  q(0, "Lingkari benda yang paling ringan.", [{ kind: "choice", label: "Benda", options: ["Buku", "Pensil", "Bulu ayam", "Tas sekolah", "Penggaris"], figs: (["buku", "pensil", "bulu", "tas", "penggaris"] as Thing[]).map(o => ({ t: "thing", o })), answer: "Bulu ayam" }],
    "Bulu ayam sangat ringan, bahkan dapat terbang tertiup angin.", { level: "Sedang" }),
  q(1, "Amati jam pada setiap kegiatan. Kelompokkan waktu kegiatannya.", [{ kind: "sort", label: "Kegiatan", items: [ac("bangun", 5), ac("bola", 16), ac("sekolah", 7), ac("tidur", 21), ac("mandiSore", 17), ac("makanMalam", 19)], bins: ["Pagi", "Sore", "Malam"], answer: [0, 1, 0, 2, 1, 2] }],
    "Pagi: bangun tidur (5) dan berangkat sekolah (7). Sore: bermain bola (4) dan mandi sore (5). Malam: makan malam (7) dan tidur (9). Lihat kegiatannya, bukan hanya angka jamnya.", { level: "Sedang" }),
  q(0, "Amati timbangan. Berat 1 buku = … bola tenis.", [{ kind: "number", label: "Berat 1 buku =", answer: 3, suffix: "bola tenis" }],
    "Timbangan datar ketika ada 3 bola tenis, jadi berat 1 buku sama dengan 3 bola tenis.", { level: "Sedang", fig: { t: "balance", style: "piring", left: [pan("buku")], right: [pan("bolaTenis", 3)], w: { buku: 3, bolaTenis: 1 } } }),
  q(1, "Beri tanda centang pada kegiatan yang lebih lama.", [{ kind: "pairs", label: "Pasangan", pairs: [[acNoClock("belajar", 8), acNoClock("sarapan", 6)], [acNoClock("cuciTangan", 16), acNoClock("bola", 16)]], answer: [0, 1] }],
    "Belajar di sekolah berlangsung beberapa jam, sarapan hanya sebentar. Bermain bola lebih lama dari mencuci tangan.", { level: "Sedang" }),
  q(0, "Amati setiap pasangan benda. Beri tanda centang pada benda yang lebih berat.", [{ kind: "pairs", label: "Pasangan", pairs: [[th("gunting"), th("tas")], [th("kelapa"), th("jeruk")], [th("pensil"), th("penggaris")]], answer: [1, 0, 1] }],
    "Tas sekolah lebih berat dari gunting, kelapa lebih berat dari jeruk, dan penggaris lebih berat dari pensil.", { level: "Sedang" }),
  q(1, "Kira berangkat ke sekolah pukul 6 pagi. Atur jarum pendeknya.", [{ kind: "setClock", label: "Jarum pendek", answer: 6 }],
    "Pukul 6 tepat: jarum pendek di angka 6 dan jarum panjang di angka 12.", { level: "Sedang" }),
  q(0, "Amati ketiga timbangan. Lengkapi kalimatnya.", [{ kind: "blanks", sentences: [{ text: "Kucing … dari tikus.", options: W3, answer: "lebih berat" }, { text: "Tikus … dengan tupai.", options: W3, answer: "sama berat" }, { text: "Kucing … dari anjing.", options: W3, answer: "lebih ringan" }, { text: "Hewan yang paling berat adalah …", options: ["kucing", "tikus", "tupai", "anjing"], answer: "anjing" }] }],
    "Timbangan 1 turun di sisi kucing. Timbangan 2 datar. Timbangan 3 turun di sisi anjing. Anjing lebih berat dari kucing, dan kucing lebih berat dari tikus dan tupai, jadi anjing paling berat.", { level: "Menantang", fig: { t: "balances", list: [{ left: [pan("kucing")], right: [pan("tikus")] }, { left: [pan("tikus")], right: [pan("tupai")] }, { left: [pan("kucing")], right: [pan("anjing")] }], w: { kucing: 4, tikus: 1, tupai: 1, anjing: 9 } } }),
  q(1, "Urutkan kegiatan Halim dari yang paling awal di pagi hari.", [{ kind: "order", label: "Urutan", items: [ac("sarapan", 6), ac("istirahat", 10), ac("bangun", 5), ac("sekolah", 7)], answer: [2, 0, 3, 1] }],
    "Bangun tidur pukul 5, sarapan pukul 6, berangkat sekolah pukul 7, istirahat sekolah pukul 10.", { level: "Menantang" }),
  q(0, "Amati timbangan. Lengkapi setiap kalimat.", [{ kind: "number", label: "Berat 1 jeruk =", answer: 2, suffix: "stroberi" }, { kind: "number", label: "Berat 2 jeruk =", answer: 4, suffix: "stroberi" }, { kind: "number", label: "Berat 3 jeruk =", answer: 6, suffix: "stroberi" }],
    "1 jeruk sama berat dengan 2 stroberi. 2 jeruk sama dengan 2 + 2 = 4 stroberi. 3 jeruk sama dengan 2 + 2 + 2 = 6 stroberi.", { level: "Menantang", fig: { t: "balance", style: "piring", left: [pan("jeruk")], right: [pan("stroberi", 2)], w: { jeruk: 2, stroberi: 1 } } }),
  q(1, "Halim tidur. Pukul berapa Halim tidur?", [{ kind: "number", label: "Pukul", answer: 8 }, { kind: "choice", label: "Waktunya", options: T4, answer: "malam" }],
    "Jarum pendek di angka 8 dan jarum panjang di angka 12, jadi pukul 8. Langit gelap dan Halim tidur, jadi pukul 8 malam.", { level: "Menantang", fig: { t: "clock", h: 8, act: "tidur", tod: "malam" } }),
  q(0, "Warnai hewan yang paling berat dengan merah dan yang paling ringan dengan kuning.", [{ kind: "extreme", label: "Hewan", items: [th("kambing"), th("kupu"), th("gajah"), th("kelinci"), th("monyet")], heavy: 2, light: 1 }],
    "Gajah hewan darat paling berat. Kupu-kupu paling ringan karena sangat kecil dan dapat terbang.", { level: "Menantang" }),
  q(1, "Jam digital ini menunjukkan pukul berapa? Pilih jam dinding yang sama.", [{ kind: "choice", label: "Jam dinding", options: ["P", "Q", "R"], figs: [{ t: "clock", h: 12, act: undefined }, { t: "clock", h: 3 }, { t: "clock", h: 9 }], answer: "Q" }],
    "03.00 artinya pukul 3 tepat: jarum pendek di angka 3 dan jarum panjang di angka 12. Jam R menunjukkan pukul 9, jam P pukul 12.", { level: "Menantang", fig: { t: "digital", h: 3 } }),
  q(0, "Amati timbangan dengan balok mainan. Jawab pertanyaannya.", [{ kind: "number", label: "Berat 1 mangga =", answer: 5, suffix: "balok" }, { kind: "choice", label: "Buah yang paling ringan", options: ["Jeruk", "Mangga", "Pisang"], answer: "Pisang" }, { kind: "order", label: "Urutkan dari yang paling ringan", items: [th("jeruk"), th("mangga"), th("pisang")], answer: [2, 0, 1] }],
    "Jeruk = 3 balok, mangga = 5 balok, pisang = 2 balok. Pisang paling ringan dan mangga paling berat. Urutannya pisang, jeruk, mangga.", { level: "Menantang", fig: { t: "balances", list: [{ left: [pan("jeruk")], right: [pan("balok", 3)] }, { left: [pan("mangga")], right: [pan("balok", 5)] }, { left: [pan("pisang")], right: [pan("balok", 2)] }], w: { jeruk: 3, mangga: 5, pisang: 2, balok: 1 } } }),
  q(1, "Kelompokkan kegiatan menurut waktunya.", [{ kind: "sort", label: "Kegiatan", items: [ac("membaca", 20), ac("makanSiang", 12), ac("olahraga", 6), ac("bola", 15)], bins: T4.map(t => t[0].toUpperCase() + t.slice(1)), answer: [3, 1, 0, 2] }],
    "Berolahraga pukul 6 pagi, makan siang pukul 12 siang, bermain bola pukul 3 sore, membaca buku pukul 8 malam.", { level: "Menantang" }),
  q(0, "Amati timbangan. Lengkapi setiap kalimat.", [{ kind: "number", label: "Berat 1 pisang =", answer: 2, suffix: "apel" }, { kind: "number", label: "Berat 1 kelapa =", answer: 2, suffix: "pisang" }, { kind: "number", label: "Berat 1 kelapa =", answer: 4, suffix: "apel" }],
    "1 pisang = 2 apel. 1 kelapa = 2 pisang. Ganti setiap pisang dengan 2 apel: 2 + 2 = 4 apel. Jadi 1 kelapa = 4 apel.", { level: "Sangat menantang", fig: { t: "balances", list: [{ left: [pan("pisang")], right: [pan("apel", 2)] }, { left: [pan("kelapa")], right: [pan("pisang", 2)] }], w: { pisang: 2, apel: 1, kelapa: 4 } } }),
  q(1, "Lengkapi kalimat dengan lebih lama atau lebih sebentar.", [{ kind: "blanks", sentences: [{ text: "Tidur malam … dari menyikat gigi.", options: ["lebih lama", "lebih sebentar"], answer: "lebih lama" }, { text: "Mencuci tangan … dari bermain bola.", options: ["lebih lama", "lebih sebentar"], answer: "lebih sebentar" }, { text: "Belajar di sekolah … dari menyisir rambut.", options: ["lebih lama", "lebih sebentar"], answer: "lebih lama" }] }],
    "Tidur malam berlangsung berjam-jam, menyikat gigi beberapa menit. Mencuci tangan hanya sebentar. Belajar di sekolah beberapa jam, menyisir rambut sebentar.", { level: "Menantang" }),
  q(0, "Amati kedua timbangan. Lengkapi kalimatnya.", [{ kind: "blanks", sentences: [{ text: "Labu … dari kol dan wortel.", options: W5, answer: "lebih berat" }, { text: "Wortel … dari kol.", options: W5, answer: "lebih ringan" }, { text: "Benda yang paling ringan adalah …", options: ["kol", "wortel", "labu"], answer: "wortel" }] }, { kind: "order", label: "Urutkan dari yang paling ringan", items: [th("kol"), th("labu"), th("wortel")], answer: [2, 0, 1] }],
    "Timbangan 1: kol turun, jadi kol lebih berat dari wortel. Timbangan 2: labu turun, jadi labu lebih berat dari kol. Labu paling berat dan wortel paling ringan.", { level: "Sangat menantang", fig: { t: "balances", list: [{ left: [pan("kol")], right: [pan("wortel")] }, { left: [pan("labu")], right: [pan("kol")] }], w: kolW } }),
  q(1, "Lili belajar mulai pukul 2 sampai pukul 4 sore. Kira membaca mulai pukul 3 sampai pukul 4 sore. Siapa yang lebih lama?", [{ kind: "choice", label: "Lebih lama", options: ["Kira", "Lili", "Sama lama"], answer: "Lili" }],
    "Lili: dari pukul 2 ke pukul 4 ada 2 jam. Kira: dari pukul 3 ke pukul 4 ada 1 jam. Lili lebih lama.", { level: "Sangat menantang", fig: { t: "clocks", list: [{ h: 2, label: "Lili mulai" }, { h: 3, label: "Kira mulai" }, { h: 4, label: "Keduanya selesai" }] } }),
  q(0, "Amati timbangan. Berat 1 pepaya = … manggis.", [{ kind: "number", label: "Berat 1 pepaya =", answer: 4, suffix: "manggis" }],
    "2 mangga sama berat dengan 1 pepaya. 1 mangga sama berat dengan 2 manggis, jadi 2 mangga = 2 + 2 = 4 manggis. Berat 1 pepaya = 4 manggis.", { level: "Sangat menantang", fig: { t: "balances", list: [{ left: [pan("mangga", 2)], right: [pan("pepaya")] }, { left: [pan("mangga")], right: [pan("manggis", 2)] }], w: { mangga: 2, pepaya: 4, manggis: 1 } } }),
  q(1, "Halim bangun pukul 5 pagi. Dua jam kemudian ia berangkat ke sekolah. Atur jarum pendek saat Halim berangkat.", [{ kind: "setClock", label: "Jarum pendek", answer: 7 }],
    "Dari pukul 5, satu jam kemudian pukul 6, dua jam kemudian pukul 7. Jarum pendek di angka 7.", { level: "Sangat menantang" }),
  q(0, "Amati timbangan. Mana yang lebih berat, buku merah atau buku biru?", [{ kind: "choice", label: "Lebih berat", options: ["Buku biru", "Sama berat", "Buku merah"], answer: "Buku merah" }],
    "Timbangan datar: buku merah sama berat dengan buku biru ditambah 3 balok. Jadi buku merah lebih berat dari buku biru.", { level: "Sangat menantang", fig: { t: "balance", style: "piring", left: [pan("bukuMerah")], right: [pan("bukuBiru"), pan("balok", 3)], w: { bukuMerah: 8, bukuBiru: 5, balok: 1 } } }),
  q(1, "Urutkan kegiatan Tika dalam satu hari, dari yang paling awal.", [{ kind: "order", label: "Urutan", items: [ac("bola", 15), ac("makanMalam", 19), ac("sarapan", 6), ac("makanSiang", 12)], answer: [2, 3, 0, 1] }],
    "Jangan hanya melihat angka jamnya. Sarapan pukul 6 pagi, makan siang pukul 12 siang, bermain bola pukul 3 sore, makan malam pukul 7 malam.", { level: "Sangat menantang" }),
];
