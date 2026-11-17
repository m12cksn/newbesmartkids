// Kelas 6 Bab 2: Rasio (Matematika SD/MI Kelas VI, Kemendikbudristek 2022).
// A. Konsep rasio, B. Kesamaan rasio dan rasio satuan, C. Penerapan rasio.
import type { Question } from "./grade-four-whole-numbers";

export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export const simplify = (a: number, b: number) => { const g = gcd(a, b); return [a / g, b / g] as const; };
export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/* ---------- Gambar soal ---------- */
export type Goods = "bibit" | "susu" | "pensil" | "buku" | "pena";
export type Scene =
  | { type: "packs"; goods: Goods; items: { name: string; count: number; price: number }[] }
  | { type: "garden"; pucuk: number; cemara: number }
  | { type: "table"; title: string; head: [string, string]; rows: [string, string][] }
  | { type: "recipe"; title: string; lines: string[] }
  | { type: "bars"; rows: { label: string; units: number }[]; diff: string };

/* ---------- Bagian jawaban ---------- */
export type Op = { op: "×" | ":"; k: number; hide?: boolean };
export type Part =
  | { kind: "fill"; text: string; answers: number[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "multi"; label: string; options: string[]; answer: string[] }
  /** Tabel rasio seperti di buku: baris angka, kotak kosong, dan operasi di antara baris. */
  | { kind: "rtable"; head: string[]; rows: number[][]; hide: [number, number][]; ops: Op[]; rowLabels?: string[] };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type RQuestion = Question & { topic: number; section: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
const isHidden = (p: Extract<Part, { kind: "rtable" }>, r: number, c: number) => p.hide.some(([a, b]) => a === r && b === c);
export const fieldCount = (p: Part) => (p.kind === "fill" ? p.answers.length : p.kind === "rtable" ? p.hide.length + p.ops.filter(o => o.hide).length : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const list = (v: string) => (v ? v.split("|") : []);
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replaceAll(".", "").replace(",", ".")));
/** Kunci tabel: sel kosong (baris demi baris), lalu pengali/pembagi yang kosong. */
export function rtableKey(p: Extract<Part, { kind: "rtable" }>) {
  const out: number[] = [];
  p.rows.forEach((row, r) => row.forEach((v, c) => { if (isHidden(p, r, c)) out.push(v); }));
  p.ops.forEach(o => { if (o.hide) out.push(o.k); });
  return out;
}
export { isHidden };
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "choice": return p.answer;
    case "multi": return p.answer.join("|");
    case "rtable": return rtableKey(p).join("|");
  }
}
export function partCorrect(p: Part, v: string): boolean {
  if (p.kind === "choice") return v === p.answer;
  if (p.kind === "multi") return list(v).sort().join("|") === [...p.answer].sort().join("|");
  const want = partKey(p).split("|"), got = cells(p, v);
  return want.every((w, i) => num(got[i]) === Number(w));
}
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "choice") return v !== "";
  if (p.kind === "multi") return list(v).length > 0;
  return cells(p, v).every(x => x.trim() !== "");
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: RQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: RQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: RQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "multi": return `${p.label} ${list(v[i]).join(", ") || "…"}`;
      case "rtable": { let k = 0; const rows = p.rows.map(row => row.map((c, j) => (isHidden(p, p.rows.indexOf(row), j) ? x[k++] || "…" : fmt(c))).join(" : "));
        const ops = p.ops.map(o => `${o.op} ${o.hide ? x[k++] || "…" : o.k}`); return rows.map((r, j) => (j < ops.length ? `${r} (${ops[j]})` : r)).join(" → "); }
    }
  }).join(" | ");
}

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Konsep Rasio", short: "Konsep rasio", sections: [
    { title: "Membandingkan benda", lab: "compare", steps: ["Membandingkan banyak bibit atau harga total saja belum cukup untuk memilih paket.", "Bagi harga paket dengan banyak bibitnya untuk mendapat harga satu bibit.", "Paket yang harga satu bibitnya lebih kecil adalah pilihan yang lebih hemat."], example: "Paket 6 bibit Rp54.000 berarti Rp9.000 per bibit. Paket 4 bibit Rp40.000 berarti Rp10.000 per bibit.", demo: "Ubah banyak bibit dan harga tiap paket, lalu bandingkan harga satu bibitnya." },
    { title: "Pengertian rasio", lab: "ratio", steps: ["Rasio adalah perbandingan dua besaran, ditulis a : b atau a/b, dibaca a terhadap b.", "Rasio disederhanakan dengan membagi kedua bilangan dengan FPB-nya.", "Urutan penting: a : b berbeda artinya dengan b : a."], example: "4 pucuk merah dan 6 cemara: rasionya 4 : 6 = 2 : 3, artinya setiap 2 pucuk merah ada 3 cemara.", demo: "Atur banyak pohon di kebun dan lihat rasio paling sederhananya." },
  ] },
  { code: "B", title: "Konsep Kesamaan Rasio", short: "Kesamaan rasio", sections: [
    { title: "Kesamaan rasio dengan tabel rasio", lab: "table", steps: ["Rasio yang senilai diperoleh dengan mengalikan atau membagi kedua bilangan dengan bilangan yang sama.", "Tabel rasio membantu: tulis rasio di baris pertama, lalu kalikan atau bagi setiap kolom.", "Prinsipnya sama dengan pecahan senilai."], example: "Lahan 10 m² untuk 12 bibit. Dibagi 2: 5 : 6. Dikali 5: 25 : 30. Jadi 10 : 12 = 5 : 6 = 25 : 30.", demo: "Tekan tombol pengali dan pembagi untuk menambah baris tabel rasio." },
    { title: "Rasio satuan", lab: "unit", steps: ["Rasio satuan adalah rasio yang salah satu besarannya 1.", "Untuk mencari harga satu barang, bagi kedua kolom tabel rasio dengan banyak barang.", "Setelah harga satuan diketahui, kalikan untuk mencari harga berapa pun."], example: "3 bibit Rp37.500 → dibagi 3 → 1 bibit Rp12.500. Rasionya 1 : 12.500.", demo: "Bandingkan harga satu bibit dari dua paket jahe merah, lalu hitung harga untuk banyak bibit yang kamu pilih." },
  ] },
  { code: "C", title: "Penerapan Rasio", short: "Penerapan rasio", sections: [
    { title: "Bagian terhadap bagian dan keseluruhan", lab: "parts", steps: ["Rasio bagian terhadap bagian membandingkan dua kelompok, misalnya tanaman hias : tanaman obat.", "Rasio bagian terhadap keseluruhan membandingkan satu kelompok dengan jumlah semuanya.", "Jika total diketahui, jumlahkan bilangan rasio, lalu cari pengalinya."], example: "Hias : obat = 4 : 5, total 72. 4 + 5 = 9, dan 72 : 9 = 8. Jadi hias 32, obat 40.", demo: "Atur rasio dan total, lalu lihat model batang dan tabel rasionya." },
    { title: "Rasio pada durasi waktu", lab: "time", steps: ["Samakan satuan waktu sebelum menulis rasio.", "1 tahun = 12 bulan, 1 bulan = 4 minggu, 1 minggu = 7 hari, 1 jam = 60 menit.", "Setelah satuannya sama, sederhanakan rasionya."], example: "Jahe merah 3 bulan dan lengkuas 1,5 tahun = 18 bulan. Rasionya 3 : 18 = 1 : 6.", demo: "Pilih dua tanaman obat dan satuan waktu. Rasionya dihitung setelah satuannya disamakan." },
  ] },
];

/* ---------- Pembuat soal ---------- */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number, section: number) => (s: Spec): RQuestion => ({ ...s, topic, section, answer: answerKey(s.parts) });
const A1 = make(0, 0), A2 = make(0, 1), B1 = make(1, 0), B2 = make(1, 1), C1 = make(2, 0), C2 = make(2, 1);
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const choice = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });
const harvest: [string, string][] = [["Kumis kucing", "12 minggu"], ["Lengkuas", "1,5 tahun"], ["Jahe merah", "3 bulan"], ["Kencur", "6 bulan"], ["Buah merah", "3 tahun"]];
const harvestTable: Scene = { type: "table", title: "Masa panen tanaman obat", head: ["Tanaman", "Masa panen"], rows: harvest };

/* ---------- Latihan (4 soal per bagian, 8 per subtopik) ---------- */
export const practice: RQuestion[][] = [
  [
    A1({ prompt: "Bandingkan harga satu bibit pada kedua paket.", scene: { type: "packs", goods: "bibit", items: [{ name: "Paket A", count: 6, price: 54000 }, { name: "Paket B", count: 4, price: 40000 }] }, parts: [fill("Paket A Rp□, paket B Rp□ per bibit", 9000, 10000), choice("Lebih hemat:", ["Paket A", "Paket B"], "Paket A")], explanation: "54.000 : 6 = 9.000 dan 40.000 : 4 = 10.000. Paket A lebih hemat walaupun harga totalnya lebih mahal." }),
    A1({ prompt: "Perhatikan dua paket bibit berikut.", scene: { type: "packs", goods: "bibit", items: [{ name: "Paket A", count: 8, price: 72000 }, { name: "Paket B", count: 5, price: 50000 }] }, parts: [choice("Bibitnya lebih banyak:", ["Paket A", "Paket B"], "Paket A"), choice("Harga totalnya lebih murah:", ["Paket A", "Paket B"], "Paket B"), choice("Harga per bibitnya lebih murah:", ["Paket A", "Paket B"], "Paket A")], explanation: "Paket A 8 bibit, paket B 5 bibit. Total B lebih murah (50.000). Per bibit: A 9.000, B 10.000, jadi A lebih murah." }),
    A1({ prompt: "Toko 1 menjual 3 buku Rp21.000. Toko 2 menjual 5 buku Rp30.000. Berapa harga satu buku di setiap toko?", scene: { type: "packs", goods: "buku", items: [{ name: "Toko 1", count: 3, price: 21000 }, { name: "Toko 2", count: 5, price: 30000 }] }, parts: [fill("Toko 1 Rp□, toko 2 Rp□", 7000, 6000)], explanation: "21.000 : 3 = 7.000 dan 30.000 : 5 = 6.000. Buku di toko 2 lebih murah." }),
    A1({ prompt: "Mana yang lebih hemat?", scene: { type: "packs", goods: "susu", items: [{ name: "Kemasan 2 botol", count: 2, price: 9000 }, { name: "Kemasan 3 botol", count: 3, price: 12000 }] }, parts: [choice("Lebih hemat:", ["Kemasan 2 botol", "Kemasan 3 botol"], "Kemasan 3 botol")], explanation: "9.000 : 2 = 4.500 dan 12.000 : 3 = 4.000 per botol. Kemasan 3 botol lebih hemat." }),
    A2({ prompt: "Tuliskan rasio pucuk merah terhadap cemara di kebun, lalu sederhanakan.", scene: { type: "garden", pucuk: 6, cemara: 9 }, parts: [fill("Pucuk merah : cemara = □ : □ = □ : □", 6, 9, 2, 3)], explanation: "Ada 6 pucuk merah dan 9 cemara. FPB 6 dan 9 adalah 3, jadi 6 : 9 = 2 : 3." }),
    A2({ prompt: "Rasio cemara terhadap pucuk merah adalah 3 : 2. Apa artinya?", parts: [choice("Artinya:", ["Setiap 3 pucuk merah ada 2 cemara", "Setiap 3 cemara ada 2 pucuk merah", "Ada 3 pohon dan 2 kebun"], "Setiap 3 cemara ada 2 pucuk merah")], explanation: "Bilangan pertama milik besaran pertama (cemara). Jadi setiap 3 cemara terdapat 2 pucuk merah." }),
    A2({ prompt: "Pengunjung roller coaster 24 orang dan komidi putar 18 orang. Tuliskan rasionya dalam bentuk paling sederhana.", parts: [fill("Roller coaster : komidi putar = 24 : 18 = □ : □", 4, 3)], explanation: "FPB 24 dan 18 adalah 6. 24 : 6 = 4 dan 18 : 6 = 3, jadi 4 : 3." }),
    A2({ prompt: "Rasio pengunjung bianglala terhadap roller coaster 4 : 3. Roller coaster ada 24 orang. Lengkapi tabel rasionya.", parts: [{ kind: "rtable", head: ["Bianglala", "Roller coaster"], rowLabels: ["Rasio", "Jumlah sebenarnya"], rows: [[4, 3], [32, 24]], hide: [[1, 0]], ops: [{ op: "×", k: 8, hide: true }] }], explanation: "3 × 8 = 24, jadi bianglala juga dikali 8: 4 × 8 = 32 orang." }),
  ],
  [
    B1({ prompt: "Lahan 10 m² dapat ditanami 12 bibit. Lengkapi tabel rasio.", parts: [{ kind: "rtable", head: ["Luas lahan (m²)", "Banyak bibit"], rows: [[10, 12], [5, 6], [25, 30]], hide: [[1, 0], [2, 0]], ops: [{ op: ":", k: 2 }, { op: "×", k: 5, hide: true }] }], explanation: "10 : 2 = 5 dan 12 : 2 = 6. Lalu 6 × 5 = 30, jadi lahan 5 × 5 = 25 m²." }),
    B1({ prompt: "Pilih semua rasio yang senilai dengan 12 : 28.", parts: [{ kind: "multi", label: "Senilai:", options: ["3 : 7", "6 : 14", "4 : 7", "24 : 56", "12 : 21"], answer: ["3 : 7", "6 : 14", "24 : 56"] }], explanation: "12 : 28 dibagi 4 = 3 : 7, dibagi 2 = 6 : 14, dikali 2 = 24 : 56. 4 : 7 dan 12 : 21 tidak senilai." }),
    B1({ prompt: "Menanam 2 bibit memerlukan 5 gram pupuk. Berapa pupuk untuk 12 bibit?", parts: [{ kind: "rtable", head: ["Bibit", "Pupuk (gram)"], rows: [[2, 5], [12, 30]], hide: [[1, 1]], ops: [{ op: "×", k: 6, hide: true }] }], explanation: "2 × 6 = 12, maka pupuk 5 × 6 = 30 gram." }),
    B1({ prompt: "Resep wedang jahe: 4 liter air memerlukan 12 jahe merah. Berapa jahe untuk 8 liter air?", scene: { type: "recipe", title: "Wedang jahe untuk 4 liter air", lines: ["12 jahe merah", "8 batang serai", "4 lemon", "250 gram gula aren"] }, parts: [{ kind: "rtable", head: ["Air (liter)", "Jahe merah"], rows: [[4, 12], [8, 24]], hide: [[1, 1]], ops: [{ op: "×", k: 2, hide: true }] }], explanation: "Air dikali 2 (4 → 8), jahe juga dikali 2: 12 × 2 = 24 buah." }),
    B2({ prompt: "Paket 3 bibit jahe merah seharga Rp37.500. Tentukan harga satu bibit.", scene: { type: "packs", goods: "bibit", items: [{ name: "Paket 3", count: 3, price: 37500 }] }, parts: [{ kind: "rtable", head: ["Banyak bibit", "Harga (Rp)"], rows: [[3, 37500], [1, 12500]], hide: [[1, 1]], ops: [{ op: ":", k: 3 }] }], explanation: "37.500 : 3 = 12.500. Rasio satuannya 1 : 12.500." }),
    B2({ prompt: "Bandingkan harga satu bibit pada kedua paket jahe merah.", scene: { type: "packs", goods: "bibit", items: [{ name: "Paket 5", count: 5, price: 58000 }, { name: "Paket 3", count: 3, price: 37500 }] }, parts: [fill("Paket 5 Rp□, paket 3 Rp□ per bibit", 11600, 12500), choice("Lebih murah per bibit:", ["Paket 5", "Paket 3"], "Paket 5")], explanation: "58.000 : 5 = 11.600 dan 37.500 : 3 = 12.500. Paket 5 lebih murah per bibit." }),
    B2({ prompt: "Satu kotak berisi 15 pena seharga Rp36.000.", scene: { type: "packs", goods: "pena", items: [{ name: "1 kotak", count: 15, price: 36000 }] }, parts: [fill("Harga 1 pena Rp□", 2400), fill("Harga 5 pena Rp□", 12000)], explanation: "36.000 : 15 = 2.400. Lima pena: 5 × 2.400 = 12.000." }),
    B2({ prompt: "Penjaga toko mengemas 6 bibit dalam 1,5 jam (90 menit).", parts: [fill("Dalam 1 jam: □ bibit", 4), fill("Dalam 4 jam: □ bibit", 16)], explanation: "6 bibit dalam 1,5 jam berarti 2 bibit tiap 30 menit, jadi 4 bibit per jam. Dalam 4 jam: 4 × 4 = 16 bibit." }),
  ],
  [
    C1({ prompt: "Penjualan tanaman hias dan tanaman obat berasio 4 : 5. Total terjual 72 bibit. Lengkapi tabel rasio.", parts: [{ kind: "rtable", head: ["Tanaman hias", "Tanaman obat", "Total"], rowLabels: ["Rasio", "Jumlah sebenarnya"], rows: [[4, 5, 9], [32, 40, 72]], hide: [[0, 2], [1, 0], [1, 1]], ops: [{ op: "×", k: 8, hide: true }] }], explanation: "4 + 5 = 9. 72 : 9 = 8, jadi hias 4 × 8 = 32 dan obat 5 × 8 = 40." }),
    C1({ prompt: "Rasio tanaman hias terhadap tanaman obat 4 : 5. Berapa rasio tanaman hias terhadap seluruh tanaman?", parts: [choice("Rasio:", ["4 : 5", "4 : 9", "5 : 9"], "4 : 9")], explanation: "Seluruh tanaman = 4 + 5 = 9 bagian. Tanaman hias 4 bagian, jadi 4 : 9." }),
    C1({ prompt: "Pengunjung pasar malam 390 orang. Setiap 9 anak ada 4 orang dewasa. Berapa anak-anak?", parts: [{ kind: "rtable", head: ["Anak-anak", "Dewasa", "Total"], rowLabels: ["Rasio", "Jumlah sebenarnya"], rows: [[9, 4, 13], [270, 120, 390]], hide: [[0, 2], [1, 0], [1, 1]], ops: [{ op: "×", k: 30, hide: true }] }], explanation: "9 + 4 = 13. 390 : 13 = 30. Anak-anak 9 × 30 = 270, dewasa 4 × 30 = 120." }),
    C1({ prompt: "Rasio siswa perempuan terhadap seluruh siswa termasuk rasio apa?", parts: [choice("Jenis rasio:", ["Bagian terhadap bagian", "Bagian terhadap keseluruhan"], "Bagian terhadap keseluruhan")], explanation: "Siswa perempuan adalah bagian, seluruh siswa adalah keseluruhan." }),
    C2({ prompt: "Tuliskan rasio masa panen jahe merah terhadap lengkuas dalam bulan.", scene: harvestTable, parts: [fill("Jahe merah : lengkuas = 3 : □ = 1 : □", 18, 6)], explanation: "Lengkuas 1,5 tahun = 18 bulan. 3 : 18 = 1 : 6." }),
    C2({ prompt: "Tuliskan rasio masa panen jahe merah terhadap kumis kucing dalam minggu.", scene: harvestTable, parts: [fill("Jahe merah : kumis kucing = □ : 12 = □ : □", 12, 1, 1)], explanation: "Jahe merah 3 bulan = 3 × 4 = 12 minggu. 12 : 12 = 1 : 1, masa panennya sama." }),
    C2({ prompt: "Lengkapi tabel konversi jam dan minggu.", parts: [{ kind: "rtable", head: ["Jam", "Minggu"], rows: [[168, 1], [504, 3], [840, 5]], hide: [[0, 0], [2, 1]], ops: []}], explanation: "1 minggu = 7 × 24 = 168 jam. 504 jam = 3 minggu. 840 : 168 = 5 minggu." }),
    C2({ prompt: "Banyu menempuh 1 km dalam 30 menit dengan kecepatan tetap.", parts: [fill("Dalam 1 jam: □ km", 2), fill("Untuk 8 km: □ jam", 4)], explanation: "1 jam = 2 × 30 menit, jadi 2 km. 8 km = 4 × 2 km, jadi 4 jam." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
const klub: [string, string][] = [["Sains", "18"], ["Olahraga", "…"], ["Seni", "24"], ["Robotik", "…"]];
const klubTable: Scene = { type: "table", title: "Anggota klub sekolah", head: ["Klub", "Anggota"], rows: klub };
export const assessment: RQuestion[] = [
  A2({ level: "Sedang", prompt: "Tuliskan rasio paling sederhana anggota klub sains terhadap seni.", scene: klubTable, parts: [fill("Sains : seni = 18 : 24 = □ : □", 3, 4)], explanation: "FPB 18 dan 24 adalah 6, jadi 18 : 24 = 3 : 4." }),
  B1({ level: "Sedang", prompt: "Lengkapi tabel rasio yang senilai dengan 3 : 5.", parts: [{ kind: "rtable", head: ["Besaran 1", "Besaran 2"], rows: [[3, 5], [12, 20]], hide: [[1, 1]], ops: [{ op: "×", k: 4, hide: true }] }], explanation: "3 × 4 = 12, maka 5 × 4 = 20. Jadi 3 : 5 = 12 : 20." }),
  C1({ level: "Sedang", prompt: "Toko buku hanya menjual novel dan komik. Tuliskan rasio komik terhadap semua buku, lalu sederhanakan.", scene: { type: "table", title: "Buku di toko", head: ["Jenis", "Banyak"], rows: [["Novel", "45"], ["Komik", "30"]] }, parts: [fill("Komik : semua buku = 30 : □ = □ : □", 75, 2, 5)], explanation: "Semua buku 45 + 30 = 75. Komik : semua buku = 30 : 75. FPB 15, jadi 2 : 5." }),
  A2({ level: "Sedang", prompt: "Tuliskan rasio cemara terhadap pucuk merah di kebun ini, lalu sederhanakan.", scene: { type: "garden", pucuk: 12, cemara: 8 }, parts: [fill("Cemara : pucuk merah = □ : □ = □ : □", 8, 12, 2, 3)], explanation: "Ada 8 cemara dan 12 pucuk merah. FPB 4: 8 : 12 = 2 : 3. Urutannya cemara dulu." }),
  B2({ level: "Sedang", prompt: "Empat pensil seharga Rp10.000. Berapa harga satu pensil?", scene: { type: "packs", goods: "pensil", items: [{ name: "4 pensil", count: 4, price: 10000 }] }, parts: [fill("Harga 1 pensil Rp□", 2500)], explanation: "10.000 : 4 = 2.500. Rasio satuannya 1 : 2.500." }),
  C2({ level: "Sedang", prompt: "Tuliskan rasio 30 menit terhadap 2 jam dalam menit.", parts: [fill("30 : □ = 1 : □", 120, 4)], explanation: "2 jam = 120 menit. 30 : 120 = 1 : 4." }),
  A1({ level: "Sedang", prompt: "Ibu ingin membeli susu kotak yang lebih hemat. Pilih kemasannya.", scene: { type: "packs", goods: "susu", items: [{ name: "Susu Murni", count: 6, price: 30000 }, { name: "Susu Segar", count: 8, price: 36000 }] }, parts: [fill("Susu Murni Rp□, Susu Segar Rp□ per kotak", 5000, 4500), choice("Lebih hemat:", ["Susu Murni", "Susu Segar"], "Susu Segar")], explanation: "30.000 : 6 = 5.000 dan 36.000 : 8 = 4.500. Susu Segar lebih hemat walau harga totalnya lebih mahal." }),
  B1({ level: "Sedang", prompt: "Pilih semua rasio yang senilai dengan 6 : 9.", parts: [{ kind: "multi", label: "Senilai:", options: ["2 : 3", "3 : 2", "12 : 18", "18 : 27", "6 : 12"], answer: ["2 : 3", "12 : 18", "18 : 27"] }], explanation: "6 : 9 dibagi 3 = 2 : 3, dikali 2 = 12 : 18, dikali 3 = 18 : 27. 3 : 2 terbalik, 6 : 12 tidak senilai." }),

  C1({ level: "Menantang", prompt: "Rasio novel terhadap komik 11 : 4. Semua buku 120. Lengkapi tabel rasio.", parts: [{ kind: "rtable", head: ["Novel", "Komik", "Total"], rowLabels: ["Rasio", "Jumlah sebenarnya"], rows: [[11, 4, 15], [88, 32, 120]], hide: [[0, 2], [1, 0], [1, 1]], ops: [{ op: "×", k: 8, hide: true }] }], explanation: "11 + 4 = 15. 120 : 15 = 8. Novel 11 × 8 = 88, komik 4 × 8 = 32." }),
  A2({ level: "Menantang", prompt: "Rasio anggota klub olahraga terhadap seni 3 : 2. Berapa anggota klub olahraga?", scene: klubTable, parts: [{ kind: "rtable", head: ["Olahraga", "Seni"], rowLabels: ["Rasio", "Jumlah sebenarnya"], rows: [[3, 2], [36, 24]], hide: [[1, 0]], ops: [{ op: "×", k: 12, hide: true }] }], explanation: "Seni 24 = 2 × 12. Olahraga juga dikali 12: 3 × 12 = 36." }),
  B1({ level: "Menantang", prompt: "Resep memakai 8 batang serai untuk 4 lemon. Jika hanya ada 6 batang serai, berapa lemon yang diperlukan?", scene: { type: "recipe", title: "Wedang jahe untuk 4 liter air", lines: ["12 jahe merah", "8 batang serai", "4 lemon", "250 gram gula aren"] }, parts: [fill("Serai : lemon = 8 : 4 = □ : □", 2, 1), fill("Lemon untuk 6 serai = □", 3)], explanation: "8 : 4 = 2 : 1. Serai 6 = 2 × 3, jadi lemon 1 × 3 = 3 buah." }),
  C2({ level: "Menantang", prompt: "Seorang penulis mengetik 1.200 kata dalam 1 jam.", parts: [fill("Dalam 180 menit: □ kata", 3600), fill("Untuk 4.800 kata: □ jam", 4)], explanation: "180 menit = 3 jam, 3 × 1.200 = 3.600 kata. 4.800 : 1.200 = 4 jam." }),
  A2({ level: "Menantang", prompt: "Klub olahraga beranggota 36 siswa. Rasio olahraga terhadap robotik 4 : 3. Berapa anggota klub robotik?", scene: klubTable, parts: [fill("Robotik = □ siswa", 27)], explanation: "36 = 4 × 9, jadi robotik 3 × 9 = 27 siswa." }),
  B2({ level: "Menantang", prompt: "Ibu membuat kopi 250 ml dengan 1 sdt kopi dan 2 sdt gula. Dona membuat 1 liter dengan 4 sdt kopi dan 10 sdt gula. Bagaimana rasa kopi Dona dibanding kopi Ibu?", parts: [fill("Kopi : gula Dona = 4 : 10 = □ : □", 2, 5), choice("Rasanya:", ["Terlalu pahit", "Terlalu manis", "Pas"], "Terlalu manis")], explanation: "1 liter = 4 × 250 ml, jadi seharusnya 4 sdt kopi dan 8 sdt gula (1 : 2). Dona memakai 10 sdt gula (2 : 5), lebih banyak gula, jadi terlalu manis." }),
  C1({ level: "Menantang", prompt: "Rasio siswa laki-laki terhadap perempuan 5 : 7. Ada 28 siswa perempuan.", parts: [{ kind: "rtable", head: ["Laki-laki", "Perempuan", "Total"], rowLabels: ["Rasio", "Jumlah sebenarnya"], rows: [[5, 7, 12], [20, 28, 48]], hide: [[0, 2], [1, 0], [1, 2]], ops: [{ op: "×", k: 4, hide: true }] }], explanation: "Perempuan 28 = 7 × 4. Laki-laki 5 × 4 = 20, total 12 × 4 = 48." }),
  A1({ level: "Menantang", prompt: "Dony memakai 30 ml sirup cokelat untuk 2 sendok susu. Hana memakai 65 ml sirup untuk 5 sendok susu. Susu siapa yang lebih terasa cokelat?", parts: [fill("Sirup per sendok susu: Dony □ ml, Hana □ ml", 15, 13), choice("Lebih terasa cokelat:", ["Dony", "Hana"], "Dony")], explanation: "Dony 30 : 2 = 15 ml per sendok, Hana 65 : 5 = 13 ml per sendok. Susu Dony lebih terasa cokelat." }),
  B2({ level: "Menantang", prompt: "Penjaga toko mengemas 20 bibit dalam 5 jam. Lengkapi tabel rasio untuk 7 jam.", parts: [{ kind: "rtable", head: ["Bibit", "Waktu (jam)"], rows: [[20, 5], [4, 1], [28, 7]], hide: [[1, 0], [2, 0]], ops: [{ op: ":", k: 5 }, { op: "×", k: 7 }] }], explanation: "Dibagi 5: 4 bibit per jam (rasio satuan). Dikali 7: 28 bibit dalam 7 jam." }),

  C2({ level: "Sangat menantang", prompt: "Berapa kali kencur dan lengkuas dapat dipanen selama satu masa panen buah merah?", scene: harvestTable, parts: [fill("Kencur □ kali, lengkuas □ kali", 6, 2)], explanation: "Buah merah 3 tahun = 36 bulan. Kencur 36 : 6 = 6 kali. Lengkuas 18 bulan: 36 : 18 = 2 kali." }),
  A2({ level: "Sangat menantang", prompt: "Rasio pucuk merah terhadap cemara 2 : 3. Lahan diperluas dan ditanami 14 pucuk merah.", parts: [fill("Cemara □ pohon, seluruh pohon □", 21, 35)], explanation: "14 = 2 × 7, jadi cemara 3 × 7 = 21. Seluruhnya 14 + 21 = 35 pohon." }),
  B2({ level: "Sangat menantang", prompt: "Paket mana yang harga per bibitnya paling murah?", scene: { type: "packs", goods: "bibit", items: [{ name: "Paket 3", count: 3, price: 37500 }, { name: "Paket 5", count: 5, price: 58000 }, { name: "Paket 4", count: 4, price: 47200 }] }, parts: [choice("Paling murah:", ["Paket 3", "Paket 5", "Paket 4"], "Paket 5"), fill("Harga per bibitnya Rp□", 11600)], explanation: "Per bibit: 12.500, 11.600, 11.800. Paket 5 paling murah, Rp11.600 per bibit." }),
  C1({ level: "Sangat menantang", prompt: "Rasio anak-anak terhadap dewasa di pasar malam 9 : 4. Anak-anak 150 orang lebih banyak daripada dewasa. Berapa anak-anak dan dewasa?", scene: { type: "bars", rows: [{ label: "Anak-anak", units: 9 }, { label: "Dewasa", units: 4 }], diff: "150 orang" }, parts: [fill("Anak-anak □, dewasa □", 270, 120)], explanation: "Selisih rasio 9 − 4 = 5 bagian = 150 orang, jadi 1 bagian = 30. Anak 9 × 30 = 270, dewasa 4 × 30 = 120." }),
  A1({ level: "Sangat menantang", prompt: "Banyu menyiapkan 6 liter minuman untuk 15 teman. Siang hari datang 10 teman lagi. Berapa liter minuman tambahan untuk 10 teman yang baru datang itu, dengan rasio yang sama?", parts: [fill("Minuman tambahan = □ liter", 4)], explanation: "6 : 15 = 2 : 5. Untuk 10 teman baru (5 × 2), minuman tambahan 2 × 2 = 4 liter. Jadi semuanya 10 liter untuk 25 teman." }),
  B1({ level: "Sangat menantang", prompt: "Sederhanakan 12 : 28, lalu tuliskan rasio senilai yang bilangan pertamanya 9.", parts: [fill("12 : 28 = □ : □ = 9 : □", 3, 7, 21)], explanation: "FPB 12 dan 28 adalah 4: 3 : 7. Dikali 3: 9 : 21." }),
  C2({ level: "Sangat menantang", prompt: "Ayah menanam bibit dalam 10 menit, Tigor dalam 1 jam.", parts: [fill("Ayah : Tigor = 10 : □ = □ : □", 60, 1, 6), fill("Ayah □ kali lebih cepat", 6)], explanation: "1 jam = 60 menit. 10 : 60 = 1 : 6, jadi Ayah 6 kali lebih cepat." }),
];
