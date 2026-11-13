/**
 * Kelas 8 Bab 6 - Statistika (Buku Siswa Matematika SMP/MTs Kelas VIII, Kurikulum Merdeka 2022, hlm. 256-288).
 * A. Pemusatan Data (modus, median, rata-rata)  B. Penyebaran Data (jangkauan, kuartil, jangkauan dan simpangan kuartil)
 * Bentuk jawaban mengikuti buku: mengurutkan data, melengkapi tabel frekuensi (frekuensi kumulatif, data × frekuensi),
 * isian nilai, pilihan, dan benar/salah atas pendapat siswa (Ayo Berpikir Kritis, Pengayaan).
 * Kuartil memakai cara buku: Q2 adalah median, Q1 dan Q3 adalah median dari separuh data di kiri dan kanan Q2.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };

/* ---------- Ukuran statistik ---------- */
export const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs: number[]) => sum(xs) / xs.length;
export function median(xs: number[]) { const s = sorted(xs), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
export function modes(xs: number[]) { const c = new Map<number, number>(); xs.forEach(x => c.set(x, (c.get(x) ?? 0) + 1)); const top = Math.max(...c.values()); return top === 1 && c.size > 1 ? [] : sorted([...c].filter(([, k]) => k === top).map(([v]) => v)); }
/** Kuartil cara buku: separuh kiri dan kanan tidak memuat median bila banyak data ganjil. */
export function quartiles(xs: number[]): [number, number, number] {
  const s = sorted(xs), n = s.length, h = Math.floor(n / 2);
  return [median(s.slice(0, h)), median(s), median(s.slice(n - h))];
}
export const expand = (vals: number[], freqs: number[]) => vals.flatMap((v, i) => Array.from({ length: freqs[i] }, () => v));

/* ---------- Gambar ---------- */
export type Scene =
  | { type: "bars"; title: string; labels: string[]; values: number[]; unit?: string }
  | { type: "lines"; title: string; labels: string[]; series: { name: string; values: number[] }[]; unit?: string }
  | { type: "table"; head: string[]; rows: (string | number)[][]; caption?: string }
  | { type: "card"; title: string; lines: string[] };

export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; pre?: string }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "sort"; label: string; values: number[] }
  | { kind: "table"; label: string; head: string[]; rows: (number | string | null)[][]; answers: number[] };

export type SQuestion = Question & { topic: 0 | 1; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const blanks = (p: Extract<Part, { kind: "table" }>) => p.rows.flatMap((r, i) => r.flatMap((c, j) => (c === null ? [[i, j] as [number, number]] : [])));
export const fieldCount = (p: Part) => (p.kind === "tf" ? p.statements.length : p.kind === "table" ? p.answers.length : 1);
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => idn(n).replace(/\./g, "");
/** Jawaban mengurutkan: nomor kartu yang diketuk berurutan, dipisah koma. */
export const sortedPick = (p: Extract<Part, { kind: "sort" }>, v: string) => (v ? v.split(",").map(i => p.values[Number(i)]) : []);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "choice": return [p.answer];
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "sort": return [p.values.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([, i]) => i).join(",")];
    case "table": return p.answers.map(str);
  }
}
const near = (a: number, b: number) => !Number.isNaN(a) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return near(num(v), p.value);
    case "table": return p.answers.every((a, k) => near(num(x[k]), a));
    case "sort": { const s = sortedPick(p, v); return s.length === p.values.length && new Set(v.split(",")).size === s.length && s.every((t, k) => t === sorted(p.values)[k]); }
    default: return x.join("|") === fields(p).join("|");
  }
}
function partReady(p: Part, v: string) {
  if (p.kind === "num" || p.kind === "choice") return v.trim() !== "";
  if (p.kind === "sort") return (v ? v.split(",").length : 0) === p.values.length;
  return cells(p, v).every(c => c.trim() !== "");
}
export const correct = (q: SQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: SQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2").replace(/[{}]/g, "");
export function formatAnswer(q: SQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${p.pre ?? ""}${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "choice": return `${plain(p.label)} ${v[i] || "…"}`;
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      case "sort": return `${plain(p.label)} ${sortedPick(p, v[i]).map(idn).join(", ") || "…"}`;
      case "table": return `${plain(p.label)} ${blanks(p).map(([r, c], k) => `${p.head[c]} ${p.rows[r][0]}: ${x[k]}`).join(", ")}`;
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: SQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): SQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (lbl: string, value: number, unit?: string, pre?: string): Part => ({ kind: "num", label: lbl, value, unit, pre });
const ch = (lbl: string, options: string[], answer: string): Part => ({ kind: "choice", label: lbl, options, answer });
const list = (title: string, xs: number[]): Scene => ({ type: "card", title, lines: [xs.map(idn).join("; ")] });
const cumTable = (lbl: string, vals: number[], freqs: number[]): Part => {
  let c = 0; const cum = freqs.map(f => (c += f));
  return { kind: "table", label: lbl, head: ["Data", "Frekuensi", "Frekuensi kumulatif"], rows: vals.map((v, i) => [v, freqs[i], null]), answers: cum };
};
const fxTable = (lbl: string, vals: number[], freqs: number[]): Part =>
  ({ kind: "table", label: lbl, head: ["Data", "Frekuensi", "Data × frekuensi"], rows: vals.map((v, i) => [v, freqs[i], null]), answers: vals.map((v, i) => v * freqs[i]) });

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  { code: "A", title: "Pemusatan Data", short: "Pemusatan data", sections: [
    { title: "Modus", lab: "mode", steps: [
      "Modus adalah data yang paling sering muncul, yaitu data dengan frekuensi terbesar.",
      "Satu kumpulan data dapat mempunyai satu modus, dua modus atau lebih, atau tidak mempunyai modus jika semua data muncul sama sering.",
      "Pada diagram batang, modus adalah kategori dengan batang paling tinggi. Jika dua batang sama tinggi, keduanya adalah modus.",
      "Modus mudah dicari dan dapat dipakai untuk data bukan bilangan (warna, ukuran, nama hari), tetapi tidak memperhitungkan semua data.",
    ], life: "Toko sepatu mencatat ukuran yang paling banyak terjual. Jika ukuran 39 paling laris, pemilik toko menyetok ukuran 39 paling banyak. Koperasi sekolah juga melihat hari penjualan buku tulis paling ramai untuk menambah penjaga.",
      example: "Nilai ulangan 74, 58, 69, 74, 86, 82, 90, 74, 86, 97, 90, 86: 74 dan 86 masing-masing muncul 3 kali, jadi modusnya 74 dan 86.",
      demo: "Atur frekuensi setiap ukuran sepatu. Batang tertinggi ditandai sebagai modus." },
    { title: "Median", lab: "median", steps: [
      "Median adalah nilai tengah data yang sudah diurutkan. Separuh data tidak lebih dari median dan separuh lainnya tidak kurang dari median.",
      "Langkahnya: urutkan data, lalu pasangkan dari sisi terluar ke dalam.",
      "Jika banyak data ganjil, median adalah data yang tersisa di tengah. Jika genap, median adalah rata-rata dua data tengah, sehingga bisa bernilai di luar kumpulan data.",
      "Untuk data dalam tabel frekuensi, gunakan frekuensi kumulatif untuk menemukan data ke-{n + 1/2}.",
    ], life: "Harga rumah di satu kompleks: kebanyakan Rp400 juta, tetapi ada satu rumah mewah Rp3 miliar. Agen properti memakai median karena tidak terseret oleh satu harga yang sangat tinggi.",
      example: "Nilai UTS 67, 89, 78, 96, 80, 77, 68, 90, 72, 88 diurutkan: 67, 68, 72, 77, 78, 80, 88, 89, 90, 96. Median = {78 + 80/2} = 79.",
      demo: "Pilih data, lalu tekan tombol pasangkan. Setiap kali, satu pasang data terluar dicoret sampai tersisa data tengah." },
    { title: "Rata-rata", lab: "mean", steps: [
      "Rata-rata (mean) adalah jumlah semua data dibagi banyak data: x̄ = {x₁ + x₂ + … + xₙ/n}.",
      "Rata-rata adalah titik keseimbangan: kelebihan data di atas rata-rata sama dengan kekurangan data di bawahnya.",
      "Rata-rata memakai semua data, tetapi mudah terpengaruh data yang sangat besar atau sangat kecil.",
      "Jika banyak data dan rata-rata diketahui, jumlah data = rata-rata × banyak data. Cara ini dipakai untuk mencari data yang hilang.",
    ], life: "Dealer menjual 12, 15, 9, 18, 16, dan 20 motor dalam sepekan. Rata-ratanya {90/6} = 15 motor per hari, dipakai untuk menentukan target penjualan pekan depan.",
      example: "Rata-rata berat 9 anak 56 kg. Setelah Doni masuk, rata-rata 10 anak 56,7 kg. Berat Doni = 567 − 504 = 63 kg.",
      demo: "Atur banyak motor yang terjual setiap hari. Garis rata-rata ikut bergeser dan selisih setiap hari terhadap rata-rata ditampilkan." },
    { title: "Rata-rata dan median dari tabel frekuensi", lab: "freq", steps: [
      "Jika banyak data sama, kelompokkan dengan turus lalu tulis frekuensinya.",
      "Rata-rata = {f₁x₁ + f₂x₂ + … /f₁ + f₂ + …}: kalikan setiap data dengan frekuensinya, jumlahkan, lalu bagi dengan jumlah frekuensi.",
      "Frekuensi kumulatif adalah jumlah frekuensi dari baris pertama sampai baris itu. Gunakan untuk mencari letak median.",
      "Rata-rata gabungan beberapa kelompok: {n₁x̄₁ + n₂x̄₂ + …/n₁ + n₂ + …}, bukan rata-rata dari rata-ratanya.",
    ], life: "Wali kelas mencatat nilai ulangan 30 siswa dengan turus, lalu menghitung rata-rata dari tabel frekuensi. Sekolah menggabungkan rata-rata kelas 8A, 8B, dan 8C dengan memperhatikan banyak siswa setiap kelas.",
      example: "Nilai 75 (2), 80 (5), 85 (8), 90 (10), 95 (4), 100 (1): jumlah f × x = 2.610, rata-rata {2.610/30} = 87.",
      demo: "Atur frekuensi setiap nilai. Kolom data × frekuensi, frekuensi kumulatif, rata-rata, dan median dihitung." },
  ] },
  { code: "B", title: "Penyebaran Data", short: "Penyebaran data", sections: [
    { title: "Jangkauan", lab: "range", steps: [
      "Ukuran penyebaran menyatakan seberapa jauh data menyebar dari pusatnya.",
      "Jangkauan = data terbesar − data terkecil.",
      "Jangkauan mudah dihitung, tetapi hanya memakai dua data, sehingga satu data yang sangat ekstrem dapat mengubahnya banyak.",
      "Jika semua data bertambah sama besar, jangkauan tetap. Jika data terbesar atau terkecil berubah, jangkauan ikut berubah.",
    ], life: "Produksi beras Indonesia 2020 tertinggi 5.626 ribu ton (April) dan terendah 934 ribu ton (Januari), jangkauannya 4.692 ribu ton. Jangkauan suhu harian membantu kita memilih pakaian.",
      example: "Tinggi badan 156, 162, 158, 154, 160, 168, 167, 166 cm: jangkauan 168 − 154 = 14 cm. Tanpa Nadiva (154 cm): 168 − 156 = 12 cm.",
      demo: "Pilih siswa yang ikut dihitung. Data terbesar, terkecil, dan jangkauannya diperbarui." },
    { title: "Kuartil", lab: "quartile", steps: [
      "Kuartil membagi data terurut menjadi empat bagian sama banyak: Q1 (kuartil bawah), Q2 (median), dan Q3 (kuartil atas).",
      "Urutkan data dan tentukan Q2 lebih dulu.",
      "Q1 adalah median dari data di sebelah kiri Q2, dan Q3 adalah median dari data di sebelah kanan Q2.",
      "Jika banyak data ganjil, data Q2 tidak ikut ke bagian kiri maupun kanan.",
    ], life: "Rapor kelas sering melaporkan nilai seperempat terbawah dan seperempat teratas. Dokter anak membandingkan berat badan bayi dengan kuartil berat bayi seusianya.",
      example: "66, 68, 72, 76, 78, 80, 82, 86, 90, 94: Q2 = {78 + 80/2} = 79, Q1 = 72 (tengah dari 66, 68, 72, 76, 78), Q3 = 86.",
      demo: "Pilih kumpulan data. Data diurutkan dan posisi Q1, Q2, dan Q3 ditandai." },
    { title: "Jangkauan kuartil dan simpangan kuartil", lab: "spread", steps: [
      "Jangkauan kuartil (jangkauan antarkuartil) = Q3 − Q1. Isinya separuh data bagian tengah.",
      "Simpangan kuartil = {1/2}(Q3 − Q1).",
      "Keduanya tidak terpengaruh data paling ekstrem, berbeda dengan jangkauan.",
      "Dua kumpulan data dengan jangkauan berbeda bisa mempunyai simpangan kuartil yang sama jika bagian tengahnya mirip.",
    ], life: "Tekanan darah pasien dicatat berkali-kali. Satu hasil yang sangat tinggi karena pasien cemas tidak mengubah simpangan kuartil, sehingga dokter lebih percaya ukuran ini untuk melihat kestabilan tekanan darah.",
      example: "Q1 = 66 dan Q3 = 85: jangkauan kuartil 19, simpangan kuartil 9,5.",
      demo: "Ubah data terbesar menjadi makin ekstrem. Jangkauan membesar, tetapi jangkauan kuartil dan simpangan kuartil tetap." },
  ] },
];

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: SQuestion[][] = [
  [
    q(0, "Tinggi badan 12 siswa kelas 8 (cm): 158, 150, 161, 157, 158, 156, 150, 152, 149, 168, 147, 158. Tentukan modusnya.", [n("Modus =", 158, "cm")],
      "158 muncul 3 kali, 150 muncul 2 kali, yang lain sekali. Modusnya 158 cm."),
    q(0, "Ukuran sepatu 11 siswa: 40, 38, 37, 36, 41, 38, 39, 42, 37, 39, 38. Urutkan datanya, lalu tentukan median.", [{ kind: "sort", label: "Urutan data:", values: [40, 38, 37, 36, 41, 38, 39, 42, 37, 39, 38] }, n("Median =", 38)],
      "Terurut: 36, 37, 37, 38, 38, 38, 39, 39, 40, 41, 42. Data ke-6 (tengah) adalah 38."),
    q(0, "Lengkapi tabel, lalu tentukan rata-ratanya.", [fxTable("Tabel data × frekuensi:", [4, 5, 6, 7, 8, 9], [2, 5, 6, 4, 2, 1]), n("Rata-rata =", 6.1)],
      "Jumlah f × x = 8 + 25 + 36 + 28 + 16 + 9 = 122, banyak data 20. Rata-rata {122/20} = 6,1."),
    q(0, "Rata-rata berat badan 11 anak adalah 42 kg. Setelah berat badan Doni dimasukkan, rata-rata 12 anak menjadi 42,5 kg. Tentukan berat badan Doni.", [n("Berat Doni =", 48, "kg")],
      "Jumlah 12 anak 12 × 42,5 = 510. Jumlah 11 anak 11 × 42 = 462. Berat Doni 510 − 462 = 48 kg."),
  ],
  [
    q(1, "Suhu siang hari (°C) selama sepekan: 24, 31, 27, 29, 22, 30, 26.", [n("Jangkauan =", 9, "°C"), n("Jangkauan tanpa data 22 =", 7, "°C")],
      "31 − 22 = 9. Tanpa 22, data terkecil 24: 31 − 24 = 7.", { scene: { type: "bars", title: "Suhu siang hari", labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"], values: [24, 31, 27, 29, 22, 30, 26], unit: "°C" } }),
    q(1, "Nilai ulangan 10 siswa: 84, 70, 78, 82, 74, 96, 80, 88, 92, 68. Tentukan ketiga kuartilnya.", [n("Q1 =", 74), n("Q2 =", 81), n("Q3 =", 88)],
      "Terurut: 68, 70, 74, 78, 80, 82, 84, 88, 92, 96. Q2 = {80 + 82/2} = 81. Q1 tengah dari 68, 70, 74, 78, 80 = 74. Q3 tengah dari 82, 84, 88, 92, 96 = 88."),
    q(1, "Tentukan kuartil bawah, kuartil atas, jangkauan kuartil, dan simpangan kuartil data 5, 8, 6, 6, 10, 9, 10, 11, 6, 7, 8, 8.", [n("Q1 =", 6), n("Q3 =", 9.5), n("Jangkauan kuartil =", 3.5), n("Simpangan kuartil =", 1.75)],
      "Terurut: 5, 6, 6, 6, 7, 8, 8, 8, 9, 10, 10, 11. Q1 = {6 + 6/2} = 6, Q3 = {9 + 10/2} = 9,5. Jangkauan kuartil 3,5, simpangan kuartil 1,75."),
    q(1, "Data 60, 64, 66, 70, 74, 78, 80, 84. Data terbesar 84 diganti menjadi 120. Tentukan benar atau salah.", [{ kind: "tf", statements: [
      { text: "Jangkauan data berubah.", answer: true }, { text: "Simpangan kuartil data berubah.", answer: false }, { text: "Jangkauan kuartil adalah Q3 − Q1.", answer: true }] }],
      "Jangkauan 24 menjadi 60. Q1 = 65 dan Q3 = 79 tidak berubah, sehingga simpangan kuartil tetap 7."),
  ],
];

/* ---------- Evaluasi: 24 soal, A dan B bergantian ---------- */
const motor = [12, 15, 10, 18, 15, 20, 22, 15, 14, 17, 19, 27];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const rice = [1150, 2240, 5320, 4610, 2380, 2210, 3050, 2520, 2390, 2250, 1740, 1090];
const land = [520, 540, 690, 1040, 1210, 1050, 1130, 1460, 1690, 1840, 1310, 830];
const baby = [3.0, 3.2, 3.6, 4.1, 4.9, 5.2, 5.7, 6.0, 6.7, 7.2, 7.6, 7.9, 8.3, 8.5, 8.7, 8.7, 8.9, 9.0, 9.3, 9.3, 9.5, 9.5, 9.9, 10.0];
const shoeV = [35, 36, 37, 38, 39, 40, 41, 42], shoeF = [1, 3, 4, 6, 6, 5, 3, 2];
export const assessment: SQuestion[] = [
  // Sedang (1-8)
  q(0, "Diagram batang menunjukkan penjualan buku tulis di koperasi sekolah dalam sepekan. Modus dari data tersebut adalah …", [ch("Jawaban:", ["Senin", "Rabu", "Selasa dan Kamis", "Kamis saja"], "Selasa dan Kamis")],
    "Batang tertinggi (25 buku) ada dua: Selasa dan Kamis. Data ini mempunyai dua modus.", { level: "Sedang", scene: { type: "bars", title: "Penjualan buku tulis", labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"], values: [18, 25, 20, 25, 12, 15], unit: "buku" } }),
  q(1, "Diagram garis menunjukkan produksi beras (ribu ton) setiap bulan dalam satu tahun. Tentukan jangkauannya.", [n("Jangkauan =", 4230, "ribu ton")],
    "Tertinggi 5.320 (Maret), terendah 1.090 (Desember). Jangkauan 5.320 − 1.090 = 4.230 ribu ton.", { level: "Sedang", scene: { type: "lines", title: "Produksi beras (ribu ton)", labels: MONTHS, series: [{ name: "Produksi", values: rice }] } }),
  q(0, "Tentukan rata-rata data berikut: 7, 8, 8, 9, 10, 10, 11, 9.", [n("Rata-rata =", 9)],
    "Jumlah = 72, banyak data 8. Rata-rata {72/8} = 9.", { level: "Sedang" }),
  q(1, "Urutkan 16 data berikut, lalu tentukan Q1, Q2, dan Q3: 62, 88, 74, 74, 80, 66, 68, 80, 66, 88, 74, 80, 88, 68, 74, 90.", [{ kind: "sort", label: "Urutan data:", values: [62, 88, 74, 74, 80, 66, 68, 80, 66, 88, 74, 80, 88, 68, 74, 90] }, n("Q1 =", 68), n("Q2 =", 74), n("Q3 =", 84)],
    "Terurut: 62, 66, 66, 68, 68, 74, 74, 74, 74, 80, 80, 80, 88, 88, 88, 90. Q2 = {74 + 74/2} = 74. Q1 = {68 + 68/2} = 68. Q3 = {80 + 88/2} = 84.", { level: "Sedang" }),
  q(0, "Nilai UTS 10 siswa: 69, 91, 78, 95, 82, 77, 70, 88, 73, 86. Urutkan datanya, lalu tentukan median.", [{ kind: "sort", label: "Urutan data:", values: [69, 91, 78, 95, 82, 77, 70, 88, 73, 86] }, n("Median =", 80)],
    "Terurut: 69, 70, 73, 77, 78, 82, 86, 88, 91, 95. Dua data tengah 78 dan 82, median {78 + 82/2} = 80.", { level: "Sedang" }),
  q(1, "Tinggi badan 8 siswa: Anton 155, Joko 163, Made 158, Nadiva 152, Cut Mutia 160, Dewa 169, Robert 168, Andika 165 (cm).", [n("Jangkauan =", 17, "cm"), n("Jangkauan jika Nadiva tidak ikut =", 14, "cm"), n("Jangkauan enam bulan lagi jika semua naik 2 cm kecuali Robert naik 4 cm =", 18, "cm")],
    "169 − 152 = 17. Tanpa Nadiva: 169 − 155 = 14. Enam bulan lagi: terbesar Robert 172, terkecil Nadiva 154, jangkauan 18.", { level: "Sedang", scene: { type: "table", head: ["Nama", "Tinggi (cm)"], rows: [["Anton", 155], ["Joko", 163], ["Made", 158], ["Nadiva", 152], ["Cut Mutia", 160], ["Dewa", 169], ["Robert", 168], ["Andika", 165]] } }),
  q(0, "Nilai ulangan 30 siswa: nilai 5 ada 4 orang, nilai 6 ada 7 orang, nilai 7 ada 9 orang, nilai 8 ada 6 orang, nilai 9 ada 3 orang, dan nilai 10 ada 1 orang. Lengkapi kolom nilai × frekuensi, lalu tentukan nilai rata-ratanya.", [fxTable("Tabel nilai × frekuensi:", [5, 6, 7, 8, 9, 10], [4, 7, 9, 6, 3, 1]), n("Rata-rata =", 7)],
    "Jumlah f × x = 20 + 42 + 63 + 48 + 27 + 10 = 210. Rata-rata {210/30} = 7.", { level: "Sedang", scene: { type: "table", head: ["Nilai", "Frekuensi"], rows: [[5, 4], [6, 7], [7, 9], [8, 6], [9, 3], [10, 1]] } }),
  q(1, "Ukuran sepatu 30 siswa ditunjukkan tabel berikut. Lengkapi frekuensi kumulatifnya, lalu tentukan kuartil bawah dan kuartil atas.", [cumTable("Tabel frekuensi kumulatif:", shoeV, shoeF), n("Q1 =", 37), n("Q3 =", 40)],
    "Kumulatif: 1, 4, 8, 14, 20, 25, 28, 30. Q1 adalah data ke-8 dari 15 data pertama: 37. Q3 adalah data ke-23: 40.", { level: "Sedang" }),
  // Menantang (9-17)
  q(0, "Rata-rata nilai 25 siswa kelas 8A adalah 80, 20 siswa kelas 8B adalah 74, dan 15 siswa kelas 8C adalah 86. Tentukan rata-rata nilai semua siswa kelas 8.", [n("Rata-rata gabungan =", 79.5)],
    "Jumlah nilai: 25 × 80 + 20 × 74 + 15 × 86 = 2.000 + 1.480 + 1.290 = 4.770. Banyak siswa 60. Rata-rata {4.770/60} = 79,5.", { level: "Menantang" }),
  q(1, "Tekanan darah seorang pasien dicatat 16 kali: 172, 150, 176, 138, 170, 168, 184, 162, 162, 126, 180, 160, 128, 122, 130, 178.", [n("Q1 =", 134), n("Q3 =", 174), n("Jangkauan kuartil =", 40), n("Simpangan kuartil =", 20)],
    "Terurut: 122, 126, 128, 130, 138, 150, 160, 162, 162, 168, 170, 172, 176, 178, 180, 184. Q1 = {130 + 138/2} = 134, Q3 = {172 + 176/2} = 174. Jangkauan kuartil 40, simpangan kuartil 20.", { level: "Menantang" }),
  q(0, "Rata-rata nilai 25 siswa kelas 8A adalah 78. Jika nilai seorang siswa yang mendapat 54 tidak dimasukkan, tentukan rata-rata yang baru.", [n("Rata-rata baru =", 79)],
    "Jumlah 25 × 78 = 1.950. Tanpa 54: 1.896 untuk 24 siswa. Rata-rata {1.896/24} = 79.", { level: "Menantang" }),
  q(1, "Data A: 4, 6, 6, 7, 7, 7, 8, 8, 9, 10, 11, 12. Data B: 5, 6, 6, 6, 7, 7, 8, 8, 9, 9, 11, 17.", [n("Jangkauan data A =", 8), n("Jangkauan data B =", 12), n("Simpangan kuartil data A =", 1.5), n("Simpangan kuartil data B =", 1.5),
    ch("Ukuran yang lebih tepat menggambarkan bahwa sebaran bagian tengah kedua data mirip adalah …", ["Jangkauan", "Simpangan kuartil"], "Simpangan kuartil")],
    "A: Q1 = 6,5, Q3 = 9,5. B: Q1 = 6, Q3 = 9. Simpangan kuartil keduanya 1,5, padahal jangkauan B lebih besar karena data 17.", { level: "Menantang" }),
  q(0, "Diketahui data 8, 6, 5, 9, 7, 4, a, 8, 10, b dengan rata-rata 7,2. Tentukan a + b.", [n("a + b =", 15)],
    "Jumlah 10 data = 10 × 7,2 = 72. Data yang diketahui berjumlah 57, jadi a + b = 15.", { level: "Menantang" }),
  q(1, "Diagram garis menunjukkan penjualan motor di sebuah dealer selama 12 bulan. Tentukan ukuran-ukuran berikut.", [n("Rata-rata =", 17), n("Median =", 16), n("Modus =", 15), n("Q1 =", 14.5), n("Q3 =", 19.5)],
    "Jumlah 204, rata-rata 17. Terurut: 10, 12, 14, 15, 15, 15, 17, 18, 19, 20, 22, 27. Median {15 + 17/2} = 16, modus 15, Q1 = {14 + 15/2} = 14,5, Q3 = {19 + 20/2} = 19,5.", { level: "Menantang", scene: { type: "lines", title: "Penjualan motor", labels: MONTHS, series: [{ name: "Motor", values: motor }], unit: "motor" } }),
  q(0, "Rata-rata tinggi 15 anak adalah 150 cm. Setelah ditambah 5 anak, rata-rata tinggi 20 anak menjadi 152 cm. Berapa rata-rata tinggi 5 anak tersebut?", [n("Rata-rata 5 anak =", 158, "cm")],
    "Jumlah 20 anak 3.040, jumlah 15 anak 2.250. Jumlah 5 anak 790, rata-rata {790/5} = 158 cm.", { level: "Menantang" }),
  q(1, "Seorang ibu mencatat berat badan anaknya setiap bulan selama dua tahun (kg). Tentukan kuartil bawah, kuartil atas, dan simpangan kuartilnya.", [n("Q1 =", 5.45, "kg"), n("Q3 =", 9.15, "kg"), n("Simpangan kuartil =", 1.85, "kg")],
    "24 data terurut. Q1 = {5,2 + 5,7/2} = 5,45. Q3 = {9,0 + 9,3/2} = 9,15. Simpangan kuartil {9,15 − 5,45/2} = 1,85.", { level: "Menantang", scene: list("Berat badan (kg), sudah terurut", baby) }),
  q(0, "Diketahui data 2, 3, 7, 7, 8, 8, 8, 9, 11. Empat siswa berpendapat. Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Siti: modus lebih dari rata-rata.", answer: true }, { text: "Astuti: median kurang dari rata-rata.", answer: false },
    { text: "Nabila: modus sama dengan rata-rata.", answer: false }, { text: "Nadiva: modus sama dengan median.", answer: true }] }],
    "Rata-rata {63/9} = 7, median 8, modus 8. Jadi modus (8) > rata-rata (7), median (8) > rata-rata, dan modus = median.", { level: "Menantang" }),
  // Sangat menantang (18-24)
  q(1, "Data penerima vaksin (juta orang) di lima provinsi: 4,2; 7,9; 3,5; 1,1; 0,4. Tiga bulan lagi semua provinsi naik 10%, kecuali provinsi dengan data terkecil naik 40%.", [n("Jangkauan sekarang =", 7.5, "juta"), n("Jangkauan tiga bulan lagi =", 8.13, "juta")],
    "Sekarang 7,9 − 0,4 = 7,5. Nanti terbesar 7,9 × 1,1 = 8,69 dan terkecil 0,4 × 1,4 = 0,56, jangkauan 8,13.", { level: "Sangat menantang", scene: { type: "bars", title: "Penerima vaksin (juta orang)", labels: ["P", "Q", "R", "S", "T"], values: [4.2, 7.9, 3.5, 1.1, 0.4] } }),
  q(0, "Dua belas pegawai memiliki gaji bulanan: enam orang Rp3.000.000,00, tiga orang Rp2.500.000,00, dua orang Rp4.000.000,00, dan satu orang belum diketahui. Rata-rata gaji 12 orang itu Rp3.000.000,00.", [ch("Gaji orang yang belum diketahui … Rp3.000.000,00", ["kurang dari", "sama dengan", "lebih dari"], "kurang dari"), n("Gaji orang tersebut =", 2500000, undefined, "Rp")],
    "Jumlah semua 12 × 3 juta = 36 juta. Yang diketahui 18 + 7,5 + 8 = 33,5 juta. Gaji orang itu 2,5 juta, kurang dari rata-rata.", { level: "Sangat menantang" }),
  q(1, "Diagram garis menunjukkan luas lahan pertanian (ribu hektare) setiap bulan dalam satu tahun. Tentukan ketiga kuartilnya.", [n("Q1 =", 760), n("Q2 =", 1090), n("Q3 =", 1385)],
    "Terurut: 520, 540, 690, 830, 1.040, 1.050, 1.130, 1.210, 1.310, 1.460, 1.690, 1.840. Q2 = {1.050 + 1.130/2} = 1.090, Q1 = {690 + 830/2} = 760, Q3 = {1.310 + 1.460/2} = 1.385.", { level: "Sangat menantang", scene: { type: "lines", title: "Luas lahan pertanian (ribu hektare)", labels: MONTHS, series: [{ name: "Lahan", values: land }] } }),
  q(0, "Rata-rata 16 data adalah 20. Rata-rata 10 data pertama adalah 19 dan rata-rata 4 data berikutnya adalah 23,5. Data ke-15 sama dengan dua kali data ke-16. Tentukan data ke-16.", [n("Data ke-16 =", 12)],
    "Jumlah semua 320. 10 data pertama 190, 4 berikutnya 94. Sisa 36 = data ke-15 + data ke-16 = 3 × data ke-16, jadi data ke-16 = 12.", { level: "Sangat menantang" }),
  q(1, "Delapan data terurut: 4, 6, 7, x, 10, 11, 13, 15. Median data tersebut 9.", [n("x =", 8), n("Simpangan kuartil =", 2.75)],
    "{x + 10/2} = 9, x = 8. Q1 = {6 + 7/2} = 6,5, Q3 = {11 + 13/2} = 12. Simpangan kuartil {12 − 6,5/2} = 2,75.", { level: "Sangat menantang" }),
  q(0, "Nilai ujian 24 siswa mempunyai rata-rata 78. Nilai 12 siswa pertama masing-masing ditambah 2, 4, 6, …, 24, sedangkan nilai 12 siswa berikutnya masing-masing dikurangi 10. Tentukan rata-rata yang baru.", [n("Rata-rata baru =", 79.5)],
    "Tambahan 2 + 4 + … + 24 = 156. Pengurangan 12 × 10 = 120. Jumlah naik 36, rata-rata naik {36/24} = 1,5 menjadi 79,5.", { level: "Sangat menantang" }),
  q(1, "Dari 20 siswa, 40% mendapat nilai 65, 20% mendapat 75, 30% mendapat 85, dan sisanya 95.", [n("Q1 =", 65), n("Q3 =", 85), n("Simpangan kuartil =", 10),
    ch("Urutan yang benar adalah …", ["Median < Rata-rata < Modus", "Modus < Median < Rata-rata", "Rata-rata < Median < Modus", "Modus < Rata-rata < Median"], "Modus < Median < Rata-rata")],
    "8 siswa 65, 4 siswa 75, 6 siswa 85, 2 siswa 95. Q1 = 65, Q3 = 85, simpangan kuartil 10. Modus 65, median {75 + 75/2} = 75, rata-rata {1.520/20} = 76.", { level: "Sangat menantang" }),
];

export const sources = { motor, rice, land, baby, shoeV, shoeF, expand };
