import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 5 Bab 8 - Data (Buku Matematika SD/MI Kelas V, hlm. 235-272).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Gambar data ---------- */
export type Sym = "apem" | "tomat" | "koin" | "buku" | "jeruk" | "wortel";
export type Picto = { title: string; head: string; rows: { label: string; value: number }[]; symbol: Sym; unit: number; unitText: string; drawn?: number[] };
export type Bars = { title: string; orient: "v" | "h"; cats: string[]; series: { name: string; color: string; values: (number | null)[] }[]; max: number; minor: number; major: number; valueLabel: string; catLabel: string };
export type Scene =
  | { type: "raw"; title: string; items: number[] }
  | { type: "cards"; items: { name: string; likes: string[] }[] }
  | { type: "table"; title: string; head: [string, string]; rows: [string, number][] }
  | { type: "picto"; picto: Picto; withTable?: boolean }
  | { type: "bars"; bars: Bars }
  | { type: "puzzle"; lines: { groups: { sym: Sym; n: number }[]; value?: number }[] };

export type Part =
  | { kind: "number"; label: string; answer: number; unit?: string }
  | { kind: "items"; items: { label: string; answer: number }[] }
  /** Tabel frekuensi: turus dibuat dengan tombol, lalu frekuensi ditulis. */
  | { kind: "freq"; head: string; rows: { label: string; count: number }[] }
  /** Membuat piktogram: banyak gambar per baris dalam seperempat. */
  | { kind: "picBuild"; picto: Picto }
  /** Melengkapi diagram batang: atur panjang batang yang kosong. */
  | { kind: "barBuild"; bars: Bars; fill: number[]; answers: number[] }
  | { kind: "order"; label: string; options: string[]; answer: string[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string; charts?: Bars[] };

export type DQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Hitungan ---------- */
export const countOf = <T,>(xs: T[], x: T) => xs.filter(y => y === x).length;
export const quarters = (p: Picto, v: number) => (v * 4) / p.unit;
export const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")},00`;

/* ---------- Isian ---------- */
export const fieldCount = (p: Part) => (p.kind === "items" ? p.items.length : p.kind === "freq" ? p.rows.length * 2 : p.kind === "picBuild" ? p.picto.rows.length : p.kind === "barBuild" ? p.fill.length : p.kind === "tf" ? p.statements.length : 1);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "number": return [String(p.answer)];
    case "items": return p.items.map(i => String(i.answer));
    case "freq": return p.rows.flatMap(r => [String(r.count), String(r.count)]);
    case "picBuild": return p.picto.rows.map(r => String(quarters(p.picto, r.value)));
    case "barBuild": return p.answers.map(String);
    case "order": return [p.answer.join(";")];
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);
const numericKinds = new Set(["number", "items", "freq", "picBuild", "barBuild"]);
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v), want = fields(p);
  return numericKinds.has(p.kind) ? want.every((w, i) => int(x[i]) === Number(w)) : x.join("|") === want.join("|");
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "order") return v.split(";").filter(Boolean).length === p.options.length;
  if (p.kind === "picBuild" || p.kind === "barBuild") return x.every(y => int(y) > 0);
  if (p.kind === "freq") return x.every((y, i) => (i % 2 ? !Number.isNaN(int(y)) : int(y) > 0));
  return numericKinds.has(p.kind) ? x.every(y => !Number.isNaN(int(y))) : x.every(Boolean);
}
export const correct = (q: DQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: DQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const qText = (n: number) => { const w = Math.floor(n / 4), r = n % 4; return `${w}${r ? ` ${["", "¼", "½", "¾"][r]}` : ""} gambar`; };
export function formatAnswer(q: DQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => s || "…";
    switch (p.kind) {
      case "number": return `${p.label} ${d(x[0])}${p.unit ? ` ${p.unit}` : ""}`;
      case "items": return p.items.map((it, k) => `${it.label} ${d(x[k])}`).join(", ");
      case "freq": return p.rows.map((r, k) => `${r.label}: turus ${d(x[2 * k])}, frekuensi ${d(x[2 * k + 1])}`).join("; ");
      case "picBuild": return p.picto.rows.map((r, k) => `${r.label} ${x[k] ? qText(Number(x[k])) : "…"}`).join(", ");
      case "barBuild": return p.fill.map((c, k) => `${p.bars.cats[c]} ${d(x[k])}`).join(", ");
      case "order": return v[i] ? v[i].split(";").join(", ") : "…";
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return d(v[i]);
    }
  }).join(" | ");
}

/* ---------- Data bersama ---------- */
const q = (topic: DQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): DQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const freqRows = (items: number[], cats: number[]) => cats.map(c => ({ label: String(c), count: countOf(items, c) }));
export const veg = [
  { name: "Asep", likes: ["Kangkung", "Wortel", "Bayam"] }, { name: "Nisa", likes: ["Bayam", "Sawi"] }, { name: "Yohana", likes: ["Wortel", "Kol"] }, { name: "Lukas", likes: ["Buncis", "Wortel", "Tomat"] },
  { name: "Komang", likes: ["Tomat", "Bayam"] }, { name: "Ahmad", likes: ["Kol", "Wortel"] }, { name: "Meli", likes: ["Kangkung", "Buncis"] }, { name: "Tiara", likes: ["Bayam", "Sawi"] },
  { name: "Randi", likes: ["Sawi", "Tomat"] }, { name: "Kinanti", likes: ["Bayam", "Kol", "Wortel"] }, { name: "Anggi", likes: ["Buncis", "Bayam"] }, { name: "Tomi", likes: ["Wortel", "Tomat"] },
  { name: "Robert", likes: ["Sawi", "Kangkung", "Bayam"] }, { name: "Ucok", likes: ["Buncis", "Tomat"] }, { name: "Lina", likes: ["Wortel", "Kangkung"] }, { name: "Farah", likes: ["Bayam", "Tomat"] },
];
const vegNames = ["Bayam", "Kangkung", "Wortel", "Tomat", "Buncis", "Sawi", "Kol"];
const vegCount = (v: string) => veg.filter(k => k.likes.includes(v)).length;
const vegTable: Scene = { type: "table", title: "Sayuran Favorit Siswa Kelas V", head: ["Nama sayuran", "Frekuensi"], rows: vegNames.map(v => [v, vegCount(v)]) };
const shoes = [35, 36, 34, 36, 37, 35, 36, 38, 36, 35, 34, 36, 37, 36, 35];
const scoresP1 = [70, 80, 60, 70, 90, 80, 70, 60, 80, 70, 100, 80, 70, 90, 60];
const scoresP2 = [65, 80, 90, 75, 80, 100, 70, 85, 100, 60, 80, 75];
const scores = [75, 60, 85, 90, 65, 70, 80, 55, 90, 70, 85, 60, 95, 70, 80, 65, 90, 75, 60, 85, 70, 95, 80, 55, 70];
const scoreTable: Scene = { type: "table", title: "Nilai Ulangan Matematika", head: ["Nilai", "Frekuensi"], rows: [["50", 2], ["60", 4], ["70", 6], ["80", 5], ["90", 3]] };
const scoreTable2: Scene = { type: "table", title: "Nilai Ulangan IPAS", head: ["Nilai", "Frekuensi"], rows: [["60", 3], ["70", 7], ["80", 8], ["90", 4], ["100", 2]] };

const days6 = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const apem: Picto = { title: "Penjualan Kue Apem", head: "Hari", rows: days6.map((d, i) => ({ label: d, value: [36, 30, 33, 41, 26, 28][i] })), symbol: "apem", unit: 4, unitText: "4 kue apem" };
const tomat: Picto = { title: "Hasil Panen Tomat Pak Chandra", head: "Minggu ke-", rows: [12, 16, 22, 10, 6].map((v, i) => ({ label: String(i + 1), value: v })), symbol: "tomat", unit: 2, unitText: "2 kg tomat" };
const tabungan: Picto = { title: "Jumlah Tabungan Nisa", head: "Minggu ke-", rows: [15000, 22000, 19000, 26000, 21000].map((v, i) => ({ label: String(i + 1), value: v })), symbol: "koin", unit: 4000, unitText: "Rp4.000,00" };
const perpus: Picto = { title: "Pengunjung Perpustakaan", head: "Hari", rows: days6.map((d, i) => ({ label: d, value: [46, 60, 52, 38, 26, 44][i] })), symbol: "buku", unit: 4, unitText: "4 pengunjung" };
const perpusTable: Scene = { type: "table", title: "Pengunjung Perpustakaan SD Pancasila", head: ["Hari", "Banyak pengunjung"], rows: perpus.rows.map(r => [r.label, r.value]) };
const perpusBars: Bars = { title: "Pengunjung Perpustakaan SD Pancasila", orient: "v", cats: days6, series: [{ name: "Pengunjung", color: "#2f86d6", values: perpus.rows.map(r => r.value) }], max: 70, minor: 2, major: 10, valueLabel: "Banyak pengunjung", catLabel: "Hari" };
const apemWrong: Picto = { ...apem, drawn: [36, 30, 31, 41, 26, 28] };

const blue = "#2f86d6", pink = "#ec6fa6", orange = "#f08a24";
const medali: Bars = { title: "Perolehan Medali Emas Indonesia di Sea Games", orient: "v", cats: ["2013", "2015", "2017", "2019", "2021"], series: [{ name: "Medali emas", color: blue, values: [62, 48, 36, 74, 68] }], max: 80, minor: 2, major: 20, valueLabel: "Perolehan medali emas", catLabel: "Tahun" };
const lele: Bars = { title: "Hasil Panen Lele Pak Bajuri", orient: "h", cats: ["Kolam 1", "Kolam 2", "Kolam 3", "Kolam 4", "Kolam 5"], series: [{ name: "Panen (kg)", color: blue, values: [30, 26, 18, 14, 24] }], max: 40, minor: 2, major: 10, valueLabel: "Hasil panen (kg)", catLabel: "Kolam" };
const kalori: Bars = { title: "Kandungan Kalori per 100 Gram Makanan", orient: "h", cats: ["Nasi putih", "Nasi jagung", "Daging sapi", "Daging ayam", "Tahu goreng", "Tempe goreng", "Sayuran hijau"], series: [{ name: "Kalori (kkal)", color: blue, values: [130, 150, 290, 260, 270, 240, 60] }], max: 300, minor: 10, major: 100, valueLabel: "Kalori (kkal)", catLabel: "Jenis makanan" };
const siswa: Bars = { title: "Sebaran Siswa Kelas V SD Pancasila", orient: "v", cats: ["2017", "2018", "2019", "2020", "2021"], series: [{ name: "Laki-laki", color: blue, values: [14, 11, 16, 12, 15] }, { name: "Perempuan", color: orange, values: [10, 13, 12, 16, 14] }], max: 20, minor: 1, major: 5, valueLabel: "Banyak siswa", catLabel: "Tahun" };
const nilai: Bars = { title: "Nilai Ulangan Matematika", orient: "v", cats: ["Lukas", "Nisa", "Komang", "Asep", "Yohana", "Robert"], series: [{ name: "Ulangan ke-1", color: blue, values: [60, 75, 55, 90, 85, 95] }, { name: "Ulangan ke-2", color: pink, values: [80, 85, 90, 70, 80, 65] }], max: 100, minor: 5, major: 20, valueLabel: "Nilai", catLabel: "Nama" };
const internet: Bars = { title: "Pengguna Internet menurut Usia (%)", orient: "h", cats: ["13–17", "18–24", "25–34", "35–44", "45–54", "55–64"], series: [{ name: "Laki-laki", color: blue, values: [6, 16, 19, 7, 3, 1] }, { name: "Perempuan", color: pink, values: [7, 15, 14, 6, 2, 1] }], max: 20, minor: 1, major: 5, valueLabel: "Persentase pengguna", catLabel: "Kelompok usia (tahun)" };
const tabBars = (v: number[]): Bars => ({ title: "Jumlah Tabungan Nisa (ribu rupiah)", orient: "v", cats: ["1", "2", "3", "4", "5"], series: [{ name: "Tabungan", color: blue, values: v }], max: 30, minor: 1, major: 5, valueLabel: "Ribu rupiah", catLabel: "Minggu ke-" });
const blank = (b: Bars, idx: number[], s = 0): Bars => ({ ...b, series: b.series.map((x, j) => (j === s ? { ...x, values: x.values.map((v, i) => (idx.includes(i) ? null : v)) } : x)) });

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Mengumpulkan Data", short: "Mengumpulkan data",
    steps: [
      "Data adalah sekumpulan informasi atau fakta yang ditulis dengan kata, kalimat, angka, gambar, atau simbol. Data membantu kita mengambil keputusan.",
      "Data yang masih tersebar sulit dihitung. Tulis dulu semua jenisnya, lalu catat satu per satu agar tidak ada yang terlewat atau terhitung dua kali.",
      "Turus: satu garis untuk satu data. Setiap kelompok berisi 5 garis, yaitu 4 garis tegak dan 1 garis miring, sehingga mudah dihitung.",
      "Frekuensi adalah banyaknya suatu data muncul. Tabel yang berisi data, turus, dan frekuensi disebut tabel frekuensi.",
    ],
    demo: "Ketuk setiap nilai ulangan satu kali. Turus dan frekuensinya langsung bertambah pada tabel.",
  },
  {
    code: "B", title: "Piktogram", short: "Piktogram",
    steps: [
      "Piktogram adalah penyajian data dengan gambar atau simbol. Setiap gambar mewakili nilai tertentu yang ditulis pada keterangan.",
      "Jika satu gambar mewakili 4 kue, maka 10 gambar mewakili 40 kue.",
      "Bagian gambar mewakili bagian nilainya: setengah gambar mewakili 2 kue, seperempat gambar mewakili 1 kue.",
      "Untuk membaca piktogram, hitung gambar utuh dan bagian gambar, lalu kalikan dengan nilai satu gambar.",
    ],
    demo: "Ubah nilai satu gambar. Lihat berapa gambar utuh dan bagian gambar yang diperlukan untuk setiap hari.",
  },
  {
    code: "C", title: "Diagram Batang", short: "Diagram batang",
    steps: [
      "Diagram batang menyajikan data dengan persegi panjang. Panjang atau tinggi batang harus tepat sesuai nilainya.",
      "Diagram batang vertikal memiliki batang tegak. Diagram batang horizontal memiliki batang mendatar.",
      "Dari diagram batang kita cepat melihat data tertinggi, terendah, kenaikan, dan penurunan.",
      "Diagram batang ganda menggabungkan dua data dalam satu diagram, misalnya siswa laki-laki dan perempuan setiap tahun, agar mudah dibandingkan.",
    ],
    demo: "Lengkapi diagram batang dengan mengatur panjang setiap batang sesuai tabel. Coba juga bentuk horizontalnya.",
  },
] as const;

/* ---------- Latihan ---------- */
export const practice: DQuestion[][] = [
  [
    q(0, "Data berikut adalah nilai ulangan 15 siswa. Lengkapi tabel frekuensinya: buat turus, lalu tulis frekuensinya.", [{ kind: "freq", head: "Nilai", rows: freqRows(scoresP1, [60, 70, 80, 90, 100]) }],
      "Nilai 60 ada 3, nilai 70 ada 5, nilai 80 ada 4, nilai 90 ada 2, nilai 100 ada 1. Jumlahnya 15.", { scene: { type: "raw", title: "Nilai ulangan 15 siswa", items: scoresP1 } }),
    q(0, "Perhatikan data nilai berikut. Berapa nilai tertinggi, dan ada berapa siswa yang mendapatkannya?", [{ kind: "items", items: [{ label: "Nilai tertinggi:", answer: 100 }, { label: "Banyak siswa:", answer: 2 }] }],
      "Nilai tertinggi 100, muncul 2 kali.", { scene: { type: "raw", title: "Nilai ulangan 12 siswa", items: scoresP2 } }),
    q(0, "Siswa dengan nilai kurang dari 70 harus mengikuti remedi. Ada berapa siswa yang mengikuti remedi?", [{ kind: "number", label: "Banyak siswa remedi:", answer: 6 }],
      "Nilai kurang dari 70 adalah 50 dan 60. Frekuensinya 2 + 4 = 6 siswa. Nilai 70 tidak termasuk.", { scene: scoreTable }),
    q(0, "Perhatikan tabel frekuensi nilai berikut. Pernyataan manakah yang tepat?", [{ kind: "choice", label: "Pernyataan yang tepat", options: ["Nilai 80 paling banyak diperoleh siswa", "Nilai 70 paling banyak diperoleh siswa", "Nilai 90 paling sedikit diperoleh siswa", "Ada 5 siswa yang mendapat nilai 60"], answer: "Nilai 70 paling banyak diperoleh siswa" }],
      "Frekuensi terbesar 6 untuk nilai 70. Paling sedikit nilai 50 (2 siswa). Nilai 60 ada 4 siswa.", { scene: scoreTable }),
  ],
  [
    q(1, "Bermain teka-teki. Dua jeruk mewakili 100. Tiga jeruk mewakili berapa?", [{ kind: "number", label: "Tiga jeruk mewakili", answer: 150 }],
      "Satu jeruk mewakili 100 : 2 = 50. Tiga jeruk = 3 × 50 = 150.", { scene: { type: "puzzle", lines: [{ groups: [{ sym: "jeruk", n: 2 }], value: 100 }, { groups: [{ sym: "jeruk", n: 3 }] }] } }),
    q(1, "Perhatikan piktogram penjualan kue apem. Berapa kue apem yang terjual pada hari Selasa dan Kamis?", [{ kind: "items", items: [{ label: "Selasa:", answer: 30 }, { label: "Kamis:", answer: 41 }] }],
      "Selasa 7 gambar utuh dan setengah gambar: 7 × 4 + 2 = 30. Kamis 10 gambar dan seperempat gambar: 10 × 4 + 1 = 41.", { scene: { type: "picto", picto: apem } }),
    q(1, "Buatlah piktogram hasil panen tomat Pak Chandra dari tabel berikut. Satu gambar mewakili 2 kg tomat.", [{ kind: "picBuild", picto: tomat }],
      "Bagi setiap hasil panen dengan 2: 6, 8, 11, 5, dan 3 gambar.", { scene: { type: "table", title: "Hasil Panen Tomat (kg)", head: ["Minggu ke-", "Hasil panen (kg)"], rows: tomat.rows.map(r => [r.label, r.value]) } }),
    q(1, "Berapa banyak kue apem yang terjual selama seminggu?", [{ kind: "number", label: "Jumlah kue apem:", answer: 194 }],
      "36 + 30 + 33 + 41 + 26 + 28 = 194 kue apem.", { scene: { type: "picto", picto: apem } }),
  ],
  [
    q(2, "Berapa medali emas yang diperoleh Indonesia pada tahun 2015?", [{ kind: "number", label: "Tahun 2015:", answer: 48, unit: "medali" }],
      "Ujung batang 2015 berada di garis 48 (dua garis kecil di bawah 50).", { scene: { type: "bars", bars: medali } }),
    q(2, "Indonesia meraih 36 medali emas pada tahun 2017. Diagram manakah yang tepat untuk tahun 2017?", [{ kind: "choice", label: "Diagram yang tepat", options: ["Diagram A", "Diagram B"], answer: "Diagram B", charts: [{ ...medali, cats: ["2017"], series: [{ ...medali.series[0], values: [38] }] }, { ...medali, cats: ["2017"], series: [{ ...medali.series[0], values: [36] }] }] }],
      "Tinggi batang harus tepat 36. Diagram A setinggi 38."),
    q(2, "Lengkapi diagram batang perolehan medali emas untuk tahun 2019 (74) dan 2021 (68).", [{ kind: "barBuild", bars: blank(medali, [3, 4]), fill: [3, 4], answers: [74, 68] }],
      "Atur tinggi batang 2019 sampai garis 74 dan 2021 sampai garis 68."),
    q(2, "Perhatikan diagram batang ganda berikut. Berapa selisih siswa laki-laki dan perempuan tahun 2019, dan berapa jumlah semua siswa tahun 2021?", [{ kind: "items", items: [{ label: "Selisih tahun 2019:", answer: 4 }, { label: "Jumlah tahun 2021:", answer: 29 }] }],
      "2019: laki-laki 16, perempuan 12, selisih 4. 2021: 15 + 14 = 29.", { scene: { type: "bars", bars: siswa } }),
  ],
];

/* ---------- Evaluasi: 24 soal, A, B, C bergantian ---------- */
export const assessment: DQuestion[] = [
  // Sedang (1-8)
  q(0, "Setiap anak menuliskan sayuran favoritnya. Lengkapi tabel frekuensi sayuran favorit: buat turus, lalu tulis frekuensinya.", [{ kind: "freq", head: "Nama sayuran", rows: vegNames.map(v => ({ label: v, count: vegCount(v) })) }],
    "Hitung satu per satu dan tandai kartu yang sudah dihitung: bayam 8, kangkung 4, wortel 7, tomat 6, buncis 4, sawi 4, kol 3.", { level: "Sedang", scene: { type: "cards", items: veg } }),
  q(1, "Perhatikan piktogram tabungan Nisa. Berapa tabungan Nisa pada minggu ke-3?", [{ kind: "number", label: "Minggu ke-3: Rp", answer: 19000 }],
    "Minggu ke-3 ada 4 gambar utuh dan ¾ gambar. 4 × 4.000 + 3.000 = 19.000.", { level: "Sedang", scene: { type: "picto", picto: tabungan } }),
  q(2, "Perhatikan diagram batang hasil panen lele. Berapa hasil panen kolam 2 dan kolam 4?", [{ kind: "items", items: [{ label: "Kolam 2 (kg):", answer: 26 }, { label: "Kolam 4 (kg):", answer: 14 }] }],
    "Batang kolam 2 berakhir di garis 26, kolam 4 di garis 14.", { level: "Sedang", scene: { type: "bars", bars: lele } }),
  q(0, "Data berikut adalah ukuran sepatu 15 siswa. Lengkapi tabel frekuensinya.", [{ kind: "freq", head: "Ukuran sepatu", rows: freqRows(shoes, [34, 35, 36, 37, 38]) }],
    "Ukuran 34 ada 2, 35 ada 4, 36 ada 6, 37 ada 2, 38 ada 1.", { level: "Sedang", scene: { type: "raw", title: "Ukuran sepatu 15 siswa", items: shoes } }),
  q(1, "Bermain teka-teki. Tiga tomat mewakili 60 dan lima wortel mewakili 40. Satu tomat dan tiga wortel mewakili berapa?", [{ kind: "number", label: "Mewakili", answer: 44 }],
    "Satu tomat = 60 : 3 = 20. Satu wortel = 40 : 5 = 8. 20 + 3 × 8 = 44.",
    { level: "Sedang", scene: { type: "puzzle", lines: [{ groups: [{ sym: "tomat", n: 3 }], value: 60 }, { groups: [{ sym: "wortel", n: 5 }], value: 40 }, { groups: [{ sym: "tomat", n: 1 }, { sym: "wortel", n: 3 }] }] } }),
  q(2, "Perhatikan diagram batang kalori. Makanan apa yang kalorinya paling tinggi?", [{ kind: "choice", label: "Kalori tertinggi", options: ["Tahu goreng", "Daging ayam", "Daging sapi", "Tempe goreng"], answer: "Daging sapi" }],
    "Batang daging sapi paling panjang, 290 kkal.", { level: "Sedang", scene: { type: "bars", bars: kalori } }),
  q(0, "Perhatikan tabel frekuensi sayuran favorit. Sayuran apa yang paling banyak disukai?", [{ kind: "choice", label: "Paling banyak disukai", options: ["Bayam", "Wortel", "Tomat", "Kangkung"], answer: "Bayam" }],
    "Frekuensi bayam 8, paling besar. Wortel 7, tomat 6.", { level: "Sedang", scene: vegTable }),
  q(1, "Pada minggu ke berapa Nisa menabung paling banyak?", [{ kind: "choice", label: "Minggu", options: ["Minggu ke-2", "Minggu ke-4", "Minggu ke-5", "Minggu ke-3"], answer: "Minggu ke-4" }],
    "Baris minggu ke-4 paling panjang: 6½ gambar = 26.000.", { level: "Sedang", scene: { type: "picto", picto: tabungan } }),
  // Menantang (9-17)
  q(2, "Lengkapi diagram batang hasil panen lele berdasarkan tabel: kolam 1 30 kg dan kolam 3 18 kg.", [{ kind: "barBuild", bars: blank(lele, [0, 2]), fill: [0, 2], answers: [30, 18] }],
    "Atur panjang batang kolam 1 sampai garis 30 dan kolam 3 sampai garis 18.", { level: "Menantang" }),
  q(0, "Siswa dengan nilai kurang dari 70 harus mengikuti remedi. Berapa siswa yang mengikuti remedi?", [{ kind: "number", label: "Banyak siswa remedi:", answer: 7 }],
    "Nilai di bawah 70: 55, 55, 60, 60, 60, 65, 65. Ada 7 siswa. Tandai setiap nilai yang sudah dihitung.", { level: "Menantang", scene: { type: "raw", title: "Nilai ulangan 25 siswa", items: scores } }),
  q(1, "Buatlah piktogram pengunjung perpustakaan dari tabel berikut. Satu gambar buku mewakili 4 pengunjung.", [{ kind: "picBuild", picto: perpus }],
    "46 : 4 = 11½, 60 : 4 = 15, 52 : 4 = 13, 38 : 4 = 9½, 26 : 4 = 6½, 44 : 4 = 11 gambar.", { level: "Menantang", scene: perpusTable }),
  q(2, "Seluruh hasil panen lele dijual seharga Rp22.000,00 per kg. Berapa pendapatan Pak Bajuri?", [{ kind: "items", items: [{ label: "Jumlah panen (kg):", answer: 112 }, { label: "Pendapatan (Rp):", answer: 2464000 }] }],
    "30 + 26 + 18 + 14 + 24 = 112 kg. 112 × 22.000 = 2.464.000 rupiah.", { level: "Menantang", scene: { type: "bars", bars: lele } }),
  q(0, "Perhatikan data nilai 25 siswa. Berapa nilai tertinggi, dan ada berapa siswa yang mendapatkannya?", [{ kind: "items", items: [{ label: "Nilai tertinggi:", answer: 95 }, { label: "Banyak siswa:", answer: 2 }] }],
    "Nilai tertinggi 95, muncul 2 kali.", { level: "Menantang", scene: { type: "raw", title: "Nilai ulangan 25 siswa", items: scores } }),
  q(1, "Berapa selisih tabungan Nisa minggu ke-2 dan ke-5, dan berapa jumlah tabungan selama 5 minggu?", [{ kind: "items", items: [{ label: "Selisih (Rp):", answer: 1000 }, { label: "Jumlah (Rp):", answer: 103000 }] }],
    "Minggu ke-2 22.000, minggu ke-5 21.000, selisih 1.000. Jumlah 15.000 + 22.000 + 19.000 + 26.000 + 21.000 = 103.000.", { level: "Menantang", scene: { type: "picto", picto: tabungan } }),
  q(2, "Data tabungan Nisa dibuat diagram batang. Diagram manakah yang benar?", [{ kind: "choice", label: "Diagram yang benar", options: ["Diagram A", "Diagram B"], answer: "Diagram A", charts: [tabBars([15, 22, 19, 26, 21]), tabBars([15, 26, 19, 22, 21])] }],
    "Diagram A sesuai: 15, 22, 19, 26, 21 ribu. Diagram B menukar minggu ke-2 dan ke-4.", { level: "Menantang", scene: { type: "picto", picto: tabungan } }),
  q(0, "Perhatikan tabel frekuensi sayuran favorit. Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Siswa yang menyukai tomat lebih banyak daripada yang menyukai bayam.", answer: false },
    { text: "Sayuran yang paling sedikit disukai adalah kol.", answer: true },
    { text: "Kangkung, buncis, dan sawi disukai oleh banyak siswa yang sama.", answer: true },
  ] }], "Tomat 6, bayam 8. Kol 3 paling sedikit. Kangkung, buncis, sawi sama-sama 4.", { level: "Menantang", scene: vegTable }),
  q(1, "Satu kue apem dibeli seharga Rp1.200,00 dan dijual Rp1.500,00. Berapa keuntungan dari penjualan seminggu?", [{ kind: "number", label: "Keuntungan: Rp", answer: 58200 }],
    "Kue terjual 36 + 30 + 33 + 41 + 26 + 28 = 194. Untung setiap kue 300 rupiah. 194 × 300 = 58.200.", { level: "Menantang", scene: { type: "picto", picto: apem } }),
  // Sangat menantang (18-24)
  q(2, "Urutkan hari berdasarkan banyaknya pengunjung perpustakaan, dari yang paling sedikit.", [{ kind: "order", label: "Urutan hari", options: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"], answer: ["Jumat", "Kamis", "Sabtu", "Senin", "Rabu", "Selasa"] }],
    "Jumat 26, Kamis 38, Sabtu 44, Senin 46, Rabu 52, Selasa 60. Perhatikan: Senin dan Sabtu hanya berselisih 2.", { level: "Sangat menantang", scene: { type: "bars", bars: perpusBars } }),
  q(0, "Siswa yang nilainya paling sedikit 80 mendapat bintang. Berapa siswa yang mendapat bintang?", [{ kind: "number", label: "Banyak siswa:", answer: 14 }],
    "Nilai 80, 90, dan 100: 8 + 4 + 2 = 14 siswa.", { level: "Sangat menantang", scene: scoreTable2 }),
  q(1, "Nisa ingin membeli satu set alat gambar seharga Rp100.000,00. Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Tabungan Nisa selama 5 minggu cukup untuk membeli alat gambar.", answer: true },
    { text: "Setelah membeli, uang Nisa masih tersisa Rp3.000,00.", answer: true },
    { text: "Tabungan minggu ke-1 adalah yang paling sedikit.", answer: true },
    { text: "Pada minggu ke-3 Nisa menabung Rp20.000,00.", answer: false },
  ] }], "Jumlah tabungan 103.000, lebih Rp3.000 dari harga. Minggu ke-1 15.000 paling sedikit. Minggu ke-3 19.000, bukan 20.000.", { level: "Sangat menantang", scene: { type: "picto", picto: tabungan } }),
  q(2, "Perhatikan diagram batang ganda nilai ulangan. Nilai siapa yang naik paling tinggi, dan nilai siapa yang turun paling banyak?", [
    { kind: "choice", label: "Kenaikan paling tinggi", options: ["Lukas", "Nisa", "Komang"], answer: "Komang" },
    { kind: "choice", label: "Penurunan paling banyak", options: ["Asep", "Robert", "Yohana"], answer: "Robert" }],
    "Kenaikan: Lukas 20, Nisa 10, Komang 35. Penurunan: Asep 20, Yohana 5, Robert 30.", { level: "Sangat menantang", scene: { type: "bars", bars: nilai } }),
  q(0, "Perhatikan data nilai 25 siswa. Siswa dengan nilai kurang dari 70 harus remedi. Berapa selisih banyak siswa yang tidak remedi dan yang remedi?", [{ kind: "number", label: "Selisihnya:", answer: 11 }],
    "Remedi 7 siswa, tidak remedi 25 − 7 = 18 siswa. Selisihnya 18 − 7 = 11.", { level: "Sangat menantang", scene: { type: "raw", title: "Nilai ulangan 25 siswa", items: scores } }),
  q(1, "Piktogram berikut dibuat dari tabel penjualan kue apem. Pada hari apa gambarnya salah?", [{ kind: "choice", label: "Hari yang salah", options: ["Selasa", "Jumat", "Sabtu", "Rabu"], answer: "Rabu" }],
    "Rabu terjual 33 kue, seharusnya 8¼ gambar. Pada piktogram hanya 7¾ gambar (31 kue).", { level: "Sangat menantang", scene: { type: "picto", picto: apemWrong, withTable: true } }),
  q(2, "Perhatikan diagram batang ganda pengguna internet. Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Pengguna internet tertinggi adalah perempuan berusia 25–34 tahun.", answer: false },
    { text: "Persentase total pengguna usia 18–24 tahun adalah 31%.", answer: true },
    { text: "Pada setiap kelompok usia, laki-laki selalu lebih banyak daripada perempuan.", answer: false },
    { text: "Persentase total pengguna usia 35–44 tahun adalah 13%.", answer: true },
  ] }], "Tertinggi laki-laki 25–34 (19%). 18–24: 16 + 15 = 31%. Usia 13–17 perempuan lebih banyak (7 dan 6), usia 55–64 sama. 35–44: 7 + 6 = 13%.", { level: "Sangat menantang", scene: { type: "bars", bars: internet } }),
];

/** Sumber data untuk pemeriksaan kunci jawaban. */
export const sources = { veg, vegNames, shoes, scoresP1, scoresP2, scores, apem, apemWrong, tomat, tabungan, perpus, medali, lele, kalori, siswa, nilai, internet };
