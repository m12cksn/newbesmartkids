/**
 * Kelas 8 Bab 3 - Persamaan Linier dan Pertidaksamaan Linier Satu Variabel
 * (Buku Siswa Matematika SMP/MTs Kelas VIII, Kurikulum Merdeka 2022, hlm. 98-136).
 * A. Memahami Konsep PLSV  B. Menyelesaikan PLSV  C. Menemukan Konsep PtLSV  D. Menyelesaikan Masalah PtLSV
 * Bentuk jawaban mengikuti buku: kalimat terbuka/tertutup, benar/salah, himpunan penyelesaian, menulis model
 * matematika, nilai variabel, pertidaksamaan hasil penyelesaian, garis bilangan, timbangan, dan pilihan ganda.
 * Teks matematika memakai penanda: ^{…} pangkat, {a/b} pecahan bertumpuk.
 */
import type { Question } from "./grade-four-whole-numbers";
import type { Fig } from "./grade-seven-similarity";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka ---------- */
/** Angka gaya Indonesia: 1.440 (ribuan), 12,5 (desimal), −3, juga pecahan -7/2. */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  const f = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t);
  if (f) { const a = num(f[1]), b = num(f[2]); return b === 0 ? NaN : a / b; }
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };

/* ---------- Gambar ---------- */
/** Isi satu lengan timbangan: kotak x (isi belum diketahui), kelereng satuan, batang besi, anak timbangan bergram. */
export type Pan = { box?: number; unit?: number; bar?: number; weights?: number[] };
/** Garis bilangan: batas `at`, bulatan penuh (closed) atau kosong, arsiran ke kiri atau kanan. */
export type Ray = { at: number; closed: boolean; dir: "left" | "right"; from: number; to: number; step?: number; label?: string };
export type Scene =
  | { type: "balance"; left: Pan; right: Pan; tilt?: -1 | 0 | 1; caption?: string }
  | { type: "balances"; items: { left: Pan; right: Pan; tilt?: -1 | 0 | 1; caption: string }[] }
  | { type: "lines"; items: Ray[] }
  | { type: "fig"; fig: Fig; caption?: string }
  | { type: "tri"; angles?: [string, string, string]; sides?: [string, string, string]; tall?: boolean }
  | { type: "pool"; p: string; l: string; t: string }
  | { type: "truck"; cap: string; crew: string; box: string }
  | { type: "shop"; shoes: number; sandals: number; total: string }
  | { type: "card"; title: string; lines: string[] };

export type Sign = "<" | ">" | "≤" | "≥";
export const SIGNS: Sign[] = ["<", ">", "≤", "≥"];
export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; pre?: string; check?: string }
  | { kind: "choice"; label: string; options: string[]; answer: string; pics?: Scene[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "set"; label: string; values: number[]; max: number }
  | { kind: "ineq"; label: string; v: string; sign: Sign; value: number; check?: string }
  | { kind: "build"; label: string; tiles: string[]; accept: string[] };

export type LQuestion = Question & { topic: 0 | 1 | 2 | 3; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "ineq" ? 2 : 1);
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => idn(n).replace(/\./g, "");
/** Jawaban susun: urutan nomor ubin dipisah koma; teksnya ubin-ubin itu dipisah spasi. */
export const builtText = (p: Extract<Part, { kind: "build" }>, v: string) => (v ? v.split(",").map(i => p.tiles[Number(i)] ?? "?").join(" ") : "");
export const sortedSet = (v: string) => (v ? v.split(",").map(Number).sort((a, b) => a - b) : []);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "set": return [[...p.values].sort((a, b) => a - b).join(",")];
    case "ineq": return [p.sign, str(p.value)];
    case "build": return [p.accept[0].split(" ").map(t => { const i = p.tiles.indexOf(t); if (i < 0) throw new Error(`ubin ${t} tidak ada`); return i; }).join(",")];
  }
}
const near = (a: number, b: number) => !Number.isNaN(a) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return near(num(v), p.value);
    case "set": return sortedSet(v).join(",") === [...p.values].sort((a, b) => a - b).join(",");
    case "ineq": return x[0] === p.sign && near(num(x[1]), p.value);
    case "build": return p.accept.includes(builtText(p, v));
    default: return x.join("|") === fields(p).join("|");
  }
}
function partReady(p: Part, v: string) {
  if (p.kind === "choice" || p.kind === "set" || p.kind === "build" || p.kind === "num") return v.trim() !== "";
  return cells(p, v).every(c => c.trim() !== "");
}
export const correct = (q: LQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: LQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "($1)/($2)").replace(/[{}]/g, "");
export function formatAnswer(q: LQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${p.pre ?? ""}${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "choice": return `${plain(p.label)} ${v[i] || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      case "set": return `${plain(p.label)} {${sortedSet(v[i]).join(", ")}}`;
      case "ineq": return `${plain(p.label)} ${p.v} ${x[0]} ${x[1]}`;
      case "build": return `${plain(p.label)} ${builtText(p, v[i]) || "…"}`;
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: LQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): LQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, check?: string, unit?: string, pre?: string): Part => ({ kind: "num", label, value, check, unit, pre });
const ch = (label: string, options: string[], answer: string, pics?: Scene[]): Part => ({ kind: "choice", label, options, answer, pics });
const iq = (label: string, v: string, sign: Sign, value: number, check: string): Part => ({ kind: "ineq", label, v, sign, value, check });
const bd = (label: string, tiles: string[], accept: string[]): Part => ({ kind: "build", label, tiles, accept });
const ray = (at: number, closed: boolean, dir: Ray["dir"], from = at - 6, to = at + 6, label?: string): Ray => ({ at, closed, dir, from, to, label });
const line = (r: Ray): Scene => ({ type: "lines", items: [r] });
const TB = ["Terbuka", "Tertutup"];

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  { code: "A", title: "Memahami Konsep Persamaan Linier Satu Variabel", short: "Konsep PLSV", sections: [
    { title: "Kalimat terbuka dan kalimat tertutup", lab: "open", steps: [
      "Kalimat tertutup (pernyataan) adalah kalimat yang hanya dapat dinilai benar atau salah, tidak keduanya. Contoh: 5 × 3 − 5 = 10 (benar), Empat merupakan bilangan ganjil (salah).",
      "Kalimat terbuka belum dapat dinilai benar atau salah karena masih memuat unsur yang belum diketahui nilainya, misalnya x + 4 = 20 atau Kota K adalah ibu kota provinsi di Pulau Sulawesi.",
      "Unsur yang belum diketahui itu disebut variabel. Jika variabel diganti dengan sebuah nilai, kalimat terbuka berubah menjadi kalimat tertutup.",
      "Pengganti yang membuat kalimatnya bernilai benar disebut penyelesaian. Pada x + 4 = 20, hanya x = 16 yang membuat 16 + 4 = 20 benar; pengganti lain menghasilkan kalimat yang salah.",
    ], life: "Pengumuman di kelas: \"Siswa yang nilainya di atas 85 mendapat bintang.\" Kalimat \"Nilai Dita di atas 85\" baru dapat dinilai benar atau salah setelah nilai Dita diketahui. Sebelum itu, kalimat tersebut masih terbuka.",
      example: "2 + a = 8 adalah kalimat terbuka. Untuk a = 6: 2 + 6 = 8, benar. Untuk a = 5: 2 + 5 = 7 ≠ 8, salah. Jadi penyelesaiannya a = 6.",
      demo: "Ganti nilai x pada kalimat terbuka. Lihat kapan kalimatnya menjadi tertutup yang benar dan kapan salah." },
    { title: "Himpunan penyelesaian", lab: "hp", steps: [
      "Himpunan adalah kumpulan benda atau bilangan yang memiliki ciri yang sama. Anggotanya ditulis di dalam kurung kurawal { }.",
      "Himpunan penyelesaian (HP) adalah himpunan semua pengganti variabel yang membuat kalimat terbuka bernilai benar.",
      "Perhatikan semesta pembicaraannya. Pada 3x + 5 = 9 dengan x bilangan asli, hasil hitungnya x = {4/3} yang bukan bilangan asli, sehingga HP = { } (himpunan kosong).",
      "Satu kalimat terbuka dapat memiliki lebih dari satu penyelesaian. Contoh: a bilangan genap kurang dari 10, HP = {2, 4, 6, 8}.",
    ], life: "Panitia lomba membagi 12 kue sama banyak ke dalam beberapa piring tanpa sisa. Banyak piring yang mungkin adalah anggota HP dari \"p membagi 12\", yaitu {1, 2, 3, 4, 6, 12}.",
      example: "x + 4 = 10 mempunyai HP = {6}. Kelipatan 7 yang kurang dari 24 mempunyai HP = {7, 14, 21}.",
      demo: "Pilih sebuah kalimat terbuka, lalu ketuk bilangan asli yang membuatnya benar. Periksa apakah pilihanmu sudah lengkap." },
    { title: "Bentuk umum dan model persamaan", lab: "form", steps: [
      "Pada bentuk aljabar 2x + 5, huruf x adalah variabel, 2 adalah koefisien (pengali variabel), dan 5 adalah konstanta.",
      "Persamaan linier satu variabel (PLSV) adalah kalimat terbuka yang dihubungkan tanda sama dengan (=), memuat satu variabel, dan pangkat tertinggi variabelnya 1. Bentuk umumnya ax + b = c dengan a ≠ 0.",
      "Bukan PLSV: x + 10y = 110 (dua variabel), x^{2} − 4 = 0 (pangkat 2), 2a − 4 < 32 (tanda pertidaksamaan).",
      "Membuat model: tentukan besaran yang belum diketahui sebagai variabel, lalu terjemahkan kata-katanya. \"Selisih z dan 5 adalah 4\" menjadi z − 5 = 4; \"hasil kali p dengan 3 sama dengan 45\" menjadi 3p = 45.",
    ], life: "Uang Ahmad Rp108.000,00 dan uang Ahmad ditambah uang Dhoni Rp220.000,00. Jika uang Dhoni d, modelnya 108.000 + d = 220.000. Di kantin, 3 roti dengan harga sama dan sebotol air Rp4.000,00 seharga Rp19.000,00 dimodelkan 3r + 4.000 = 19.000.",
      example: "Sebanyak 96 siswa tereliminasi dan 24 siswa lolos. Jika banyak siswa awal s, maka s − 96 = 24.",
      demo: "Pilih sebuah kalimat matematika. Variabel, koefisien, konstanta, pangkat tertinggi, dan jenis kalimatnya ditampilkan." },
  ] },
  { code: "B", title: "Menyelesaikan Persamaan Linier Satu Variabel", short: "Menyelesaikan PLSV", sections: [
    { title: "Timbangan seimbang: tambah dan kurang", lab: "balance", steps: [
      "Persamaan seperti timbangan yang seimbang: ruas kiri sama berat dengan ruas kanan.",
      "Menambah atau mengurangi beban yang sama pada kedua lengan tidak mengubah keseimbangan. Begitu pula, kedua ruas persamaan boleh ditambah atau dikurangi bilangan yang sama.",
      "Tujuannya menyisakan variabel sendirian di satu ruas. Pada x + 1 = 5, kurangi kedua ruas dengan 1: x = 4.",
      "Persamaan yang penyelesaiannya sama disebut persamaan ekuivalen, misalnya x + 2 = 8, 2x = 12, dan x = 6.",
    ], life: "Di pasar, pedagang menimbang gula dengan anak timbangan. Jika sekantong gula ditambah anak timbangan 1 kg seimbang dengan 3 kg, ambil 1 kg dari kedua lengan: sekantong gula beratnya 2 kg.",
      example: "2x + 4 = 8: ambil 4 kelereng dari kedua lengan sehingga 2x = 4, lalu bagi menjadi dua kelompok sama: x = 2.",
      demo: "Ambil kelereng dari kedua lengan sekaligus, lalu bagi kotak dan kelereng menjadi kelompok yang sama. Timbangan selalu seimbang." },
    { title: "Kali, bagi, pecahan, dan tanda kurung", lab: "steps", steps: [
      "Kedua ruas boleh dikalikan atau dibagi dengan bilangan yang sama, asalkan bukan nol.",
      "Urutan yang praktis: hilangkan penyebut (kalikan), buka tanda kurung, kumpulkan variabel di satu ruas dan konstanta di ruas lain, lalu bagi dengan koefisien.",
      "Hati-hati dengan koefisien negatif: −7p = 21 dibagi −7 menjadi p = −3.",
      "Selalu periksa dengan mensubstitusi jawaban: ruas kiri harus sama dengan ruas kanan.",
    ], life: "Suhu di Papua rata-rata 25,6°C. Dengan rumus C = {5/9}(F − 32), kalikan kedua ruas dengan {9/5} lalu tambah 32: F = 78,08. Begitulah pembawa berita cuaca mengubah satuan suhu.",
      example: "{4x + 3/5} = −2 → 4x + 3 = −10 → 4x = −13 → x = −{13/4}. Periksa: (−13 + 3) : 5 = −2.",
      demo: "Pilih persamaan, lalu tekan langkah berikutnya. Setiap langkah menyebutkan operasi yang dilakukan pada kedua ruas." },
    { title: "Soal cerita persamaan", lab: "story", steps: [
      "Baca soal dan tentukan apa yang dicari. Misalkan dengan sebuah variabel.",
      "Nyatakan besaran lain dengan variabel itu, misalnya harga sepatu dua kali harga sandal: sepatu = 2s.",
      "Susun persamaan dari hubungan yang diketahui, lalu selesaikan.",
      "Jawab pertanyaannya dengan satuan dan periksa apakah masuk akal.",
    ], life: "Anjani mengupas 10 jambu, Nyoman mengupas 7 jambu, dan masih tersisa 16 jambu. Jika jambu semula b, maka b − 10 − 7 = 16, sehingga b = 33. Dua sudut segitiga yang dinyatakan dengan m dapat dicari dengan cara yang sama karena jumlah sudutnya 180°.",
      example: "Sepatu = 2 × sandal. 7 pasang sepatu dan 8 pasang sandal Rp660.000,00: 14s + 8s = 22s = 660.000, s = 30.000. Sepatu Rp60.000,00.",
      demo: "Atur banyak sepatu, banyak sandal, dan harga sandal. Total belanja disusun menjadi persamaan dan diselesaikan." },
  ] },
  { code: "C", title: "Menemukan Konsep Pertidaksamaan Linier Satu Variabel", short: "Konsep PtLSV", sections: [
    { title: "Tanda pertidaksamaan dan garis bilangan", lab: "symbols", steps: [
      "Pertidaksamaan linier satu variabel (PtLSV) memakai tanda <, >, ≤, atau ≥ dengan satu variabel berpangkat 1.",
      "Kata yang sering dipakai: < kurang dari; > lebih dari; ≤ kurang dari atau sama dengan, paling banyak, tidak lebih dari; ≥ lebih dari atau sama dengan, paling sedikit, setidaknya, tidak kurang dari.",
      "Pada garis bilangan, bulatan penuh (•) berarti batasnya termasuk penyelesaian (≤, ≥). Bulatan kosong (○) berarti batasnya tidak termasuk (<, >).",
      "Himpunan penyelesaiannya dapat ditulis dengan garis bilangan, notasi interval seperti (−∞, 43], atau notasi pembentuk himpunan {x | x ≤ 43}.",
    ], life: "Perjalanan dari Aceh ke Lampung lewat darat tidak lebih dari 44 jam: t ≤ 44. Batas usia Pramuka Penggalang di bawah 16 tahun: u < 16. Tiket gratis untuk anak dengan tinggi kurang dari 100 cm: h < 100.",
      example: "x ≥ 4 digambar dengan bulatan penuh di 4 dan arsiran ke kanan. x < −3 digambar dengan bulatan kosong di −3 dan arsiran ke kiri.",
      demo: "Pilih tanda dan geser batasnya. Garis bilangan, notasi interval, notasi himpunan, dan kalimatnya berubah bersama." },
    { title: "Memodelkan situasi dengan pertidaksamaan", lab: "speed", steps: [
      "Cari kata kunci batasan: paling banyak, hanya, maksimal (≤); paling sedikit, setidaknya, minimal (≥); kurang dari (<); lebih dari (>).",
      "Tentukan variabelnya dan tuliskan pertidaksamaannya. \"Bilangan k dikurangi 4 hasilnya kurang dari atau sama dengan 9\" menjadi k − 4 ≤ 9.",
      "Satu situasi bisa memiliki dua batas sekaligus: rambu tol kecepatan minimal 60 dan maksimal 100 km/jam berarti 60 ≤ v ≤ 100.",
      "Uji sebuah nilai dengan substitusi. Apakah −5 penyelesaian x + 14 > 9? −5 + 14 = 9, dan 9 > 9 salah, jadi −5 bukan penyelesaian.",
    ], life: "Lift bertuliskan \"maksimal 8 orang\" berarti banyak penumpang p ≤ 8. Untuk mendapat nilai A, rata-rata lima ulangan harus 90 atau lebih: {jumlah nilai/5} ≥ 90.",
      example: "Lima bus hanya dapat mengangkut 290 penumpang: p ≤ 290. Penanaman pohon setidaknya 250 m: k ≥ 250.",
      demo: "Atur kecepatan mobil di jalan tol. Periksa apakah kecepatan itu memenuhi 60 ≤ v ≤ 100." },
  ] },
  { code: "D", title: "Menyelesaikan Masalah terkait Pertidaksamaan Linier Satu Variabel", short: "Menyelesaikan PtLSV", sections: [
    { title: "Sifat-sifat pertidaksamaan", lab: "flip", steps: [
      "Kedua ruas boleh ditambah atau dikurangi bilangan yang sama; tandanya tetap. Jika a < b maka a + c < b + c.",
      "Kedua ruas dikali atau dibagi bilangan positif: tandanya tetap. 4 > 2 menjadi 12 > 6 jika dikali 3.",
      "Kedua ruas dikali atau dibagi bilangan negatif: tandanya berbalik. 4 > 2 dikali −3 menjadi −12 < −6.",
      "Inilah perbedaan utama dengan persamaan. Pada persamaan, tanda = tidak pernah berubah.",
    ], life: "Ani berutang Rp4.000,00 dan Budi berutang Rp2.000,00. Besar utangnya 4.000 > 2.000, tetapi saldo mereka −4.000 < −2.000. Mengubah utang menjadi saldo sama dengan mengalikan dengan −1, dan tandanya berbalik.",
      example: "6 > −9 dibagi 3 menjadi 2 > −3, tetapi dibagi −3 menjadi −2 < 3.",
      demo: "Pilih pengali, positif atau negatif. Kedua bilangan dipindahkan pada garis bilangan dan tandanya diperiksa." },
    { title: "Menyelesaikan pertidaksamaan", lab: "solve", steps: [
      "Langkahnya sama seperti persamaan: buka kurung, kumpulkan variabel di satu ruas dan konstanta di ruas lain.",
      "Saat membagi dengan koefisien negatif, balik tandanya.",
      "Tulis himpunan penyelesaiannya dan gambar pada garis bilangan.",
      "Jika semestanya bilangan bulat atau bilangan asli, sebutkan anggota yang memenuhi.",
    ], life: "Di toko alat tulis kamu membawa Rp50.000,00 dan sudah membeli map Rp8.000,00. Pulpen Rp3.500,00 per buah: 8.000 + 3.500p ≤ 50.000, jadi p ≤ 12. Kamu bisa membeli paling banyak 12 pulpen.",
      example: "−2x − 5 < 2 → −2x < 7 → x > −{7/2} = −3,5. Tanda berbalik karena dibagi −2.",
      demo: "Atur koefisien, konstanta, dan tanda. Langkah penyelesaian, pembalikan tanda, dan garis bilangannya ditampilkan." },
    { title: "Masalah sehari-hari", lab: "truck", steps: [
      "Tentukan variabel (banyak kotak, banyak timba, banyak kilogram) dan batasannya.",
      "Susun pertidaksamaan, lalu selesaikan.",
      "Jika jawabannya harus bilangan bulat, bulatkan ke bawah untuk batas paling banyak dan ke atas untuk batas paling sedikit.",
      "Untuk menghitung berapa kali pengangkutan, bagi banyak barang dengan muatan sekali jalan dan bulatkan ke atas.",
    ], life: "Mobil pick up hanya dapat membawa 2.000 kg. Pengemudi dan kernet 150 kg, setiap kotak 50 kg: 150 + 50x ≤ 2.000, x ≤ 37. Untuk 350 kotak dibutuhkan 10 kali pengangkutan.",
      example: "Humam punya Rp180.000,00 untuk membeli jeruk Rp15.000,00 per kg: 15.000x ≤ 180.000, x ≤ 12. Paling banyak 12 kg.",
      demo: "Atur daya angkut, berat awak, berat kotak, dan banyak kotak. Pertidaksamaan dan banyak perjalanannya dihitung." },
  ] },
];

/* ---------- Gambar pilihan garis bilangan ---------- */
const lineOpts = (rays: Ray[]) => rays.map(r => line(r));

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: LQuestion[][] = [
  [
    q(0, "Tentukan apakah setiap kalimat termasuk kalimat terbuka atau kalimat tertutup.", [{ kind: "classify", options: TB, rows: [
      { text: "Tiga ditambah k sama dengan sebelas", answer: "Terbuka" }, { text: "7 × 4 − 5 = 23", answer: "Tertutup" },
      { text: "y + 9 = 15", answer: "Terbuka" }, { text: "Jakarta adalah ibu kota Provinsi Jawa Barat", answer: "Tertutup" }] }],
      "Kalimat yang memuat k dan y masih terbuka. 7 × 4 − 5 = 23 bernilai benar, dan kalimat tentang Jakarta bernilai salah; keduanya tertutup."),
    q(0, "Analisis nilai kebenaran setiap pernyataan.", [{ kind: "tf", statements: [
      { text: "Tiga perempat dari 32 adalah 24.", answer: true }, { text: "−30 merupakan hasil kali −6 dan −5.", answer: false },
      { text: "Terdapat 900 detik dalam {1/4} jam.", answer: true }, { text: "Persegi memiliki 2 simetri lipat.", answer: false }] }],
      "{3/4} × 32 = 24. (−6) × (−5) = 30, bukan −30. {1/4} × 3.600 = 900. Persegi memiliki 4 simetri lipat."),
    q(0, "m adalah kelipatan 6 yang kurang dari 30, dengan m bilangan asli. Ketuk semua anggota himpunan penyelesaiannya.", [{ kind: "set", label: "HP =", values: [6, 12, 18, 24], max: 30 }],
      "Kelipatan 6 yang kurang dari 30: 6, 12, 18, 24. Angka 30 tidak termasuk karena tidak kurang dari 30."),
    q(0, "Susun kalimat matematika dari pernyataan: \"40 sama dengan 7 lebihnya dari t.\"", [bd("Kalimat matematika:", ["t", "+", "7", "=", "40", "−", "<"], ["t + 7 = 40", "7 + t = 40", "40 = t + 7", "40 = 7 + t"])],
      "7 lebihnya dari t berarti t + 7. Jadi t + 7 = 40 (atau 40 = t + 7)."),
  ],
  [
    q(1, "Tentukan nilai x yang membuat setiap persamaan bernilai benar.", [n("x + 15 = 4, x =", -11, "x + 15 == 4"), n("6x − 5 = 31, x =", 6, "6*x - 5 == 31")],
      "x = 4 − 15 = −11. 6x = 36, x = 6."),
    q(1, "Timbangan berikut seimbang. Setiap kotak berisi x kelereng. Tentukan x.", [n("x =", 4, "3*x + 2 == 14")],
      "3x + 2 = 14. Ambil 2 kelereng dari kedua lengan: 3x = 12. Bagi tiga: x = 4.", { scene: { type: "balance", left: { box: 3, unit: 2 }, right: { unit: 14 } } }),
    q(1, "Rina mengupas 12 jeruk dan Dewi mengupas 8 jeruk dari sebuah keranjang. Di keranjang masih tersisa 15 jeruk. Misalkan jeruk semula b. Tentukan benar atau salah.", [{ kind: "tf", statements: [
      { text: "b − 12 − 8 = 15 adalah persamaannya.", answer: true }, { text: "Banyak jeruk yang dikupas 20 buah.", answer: true }, { text: "Jeruk di keranjang semula 30 buah.", answer: false }] }],
      "b − 12 − 8 = 15, jadi b − 20 = 15 dan b = 35, bukan 30."),
    q(1, "Gunakan persamaan untuk menentukan nilai m pada segitiga berikut.", [n("m =", 40, "m + 2*m + (m + 20) == 180", "°"), n("Sudut terbesar =", 80, undefined, "°")],
      "Jumlah sudut segitiga 180°: m + 2m + m + 20 = 180, 4m = 160, m = 40. Sudutnya 40°, 80°, dan 60°.", { scene: { type: "tri", angles: ["m°", "(m + 20)°", "2m°"] } }),
  ],
  [
    q(2, "Garis bilangan yang menunjukkan x > −2 adalah …", [ch("Jawaban:", ["a", "b", "c", "d"], "c", lineOpts([ray(-2, true, "right"), ray(-2, false, "left"), ray(-2, false, "right"), ray(2, false, "right")]))],
      "x > −2: bulatan kosong di −2 karena −2 tidak termasuk, arsiran ke kanan."),
    q(2, "Tuliskan pertidaksamaan yang ditunjukkan garis bilangan berikut.", [iq("Pertidaksamaan:", "x", "≤", 3, "x <= 3")],
      "Bulatan penuh di 3 (3 termasuk) dan arsiran ke kiri: x ≤ 3.", { scene: line(ray(3, true, "left")) }),
    q(2, "Sebuah bus hanya dapat mengangkut paling banyak 45 penumpang. Misalkan banyak penumpang p. Susun pertidaksamaannya.", [bd("Pertidaksamaan:", ["p", "≤", "<", "≥", "45", "="], ["p ≤ 45", "45 ≥ p"])],
      "Paling banyak 45 berarti 45 termasuk: p ≤ 45."),
    q(2, "Apakah −4 merupakan penyelesaian setiap pertidaksamaan berikut?", [{ kind: "tf", statements: [
      { text: "x + 10 > 5", answer: true }, { text: "3 − 2p ≤ 9", answer: false }, { text: "r + 1 ≥ −3", answer: true }] }],
      "−4 + 10 = 6 > 5 benar. 3 − 2(−4) = 11 ≤ 9 salah. −4 + 1 = −3 ≥ −3 benar."),
  ],
  [
    q(3, "Tentukan penyelesaian pertidaksamaan x − 7 < −3.", [iq("Penyelesaian:", "x", "<", 4, "x - 7 < -3")],
      "Tambahkan 7 pada kedua ruas: x < 4."),
    q(3, "Tentukan penyelesaian pertidaksamaan −3x + 4 ≥ 19.", [iq("Penyelesaian:", "x", "≤", -5, "-3*x + 4 >= 19")],
      "−3x ≥ 15. Dibagi −3, tandanya berbalik: x ≤ −5."),
    q(3, "Mobil pick up hanya dapat membawa muatan 1.500 kg. Pengemudi dan kernet beratnya 140 kg. Setiap kotak beratnya 40 kg.", [n("Banyak kotak paling banyak sekali jalan =", 34, "140 + 40*x <= 1500 && 140 + 40*(x+1) > 1500"), n("Banyak pengangkutan untuk 200 kotak =", 6)],
      "140 + 40x ≤ 1.500, 40x ≤ 1.360, x ≤ 34. 200 : 34 ≈ 5,9, jadi 6 kali pengangkutan.", { scene: { type: "truck", cap: "1.500 kg", crew: "140 kg", box: "40 kg" } }),
    q(3, "Humam memiliki uang Rp150.000,00 untuk membeli jeruk seharga Rp12.000,00 per kg. Misalkan x adalah banyak kilogram jeruk.", [iq("Penyelesaian:", "x", "≤", 12.5, "12000*x <= 150000"), n("Jeruk utuh paling banyak =", 12, undefined, "kg")],
      "12.000x ≤ 150.000, x ≤ 12,5. Jika dijual per kilogram utuh, paling banyak 12 kg."),
  ],
];

/* ---------- Evaluasi: 24 soal, A B C D bergantian ---------- */
export const assessment: LQuestion[] = [
  // Sedang (1-8)
  q(0, "Lengkapi tabel: tentukan apakah setiap pernyataan termasuk kalimat terbuka atau tertutup.", [{ kind: "classify", options: TB, rows: [
    { text: "Lima dikurangi p sama dengan dua", answer: "Terbuka" }, { text: "Negatif tiga ditambah delapan sama dengan lima", answer: "Tertutup" },
    { text: "2(4) − 3 = 6", answer: "Tertutup" }, { text: "3a − 5 < 40", answer: "Terbuka" }] }],
    "Kalimat dengan p dan a masih terbuka. −3 + 8 = 5 bernilai benar dan 2(4) − 3 = 5 ≠ 6 bernilai salah; keduanya tertutup.", { level: "Sedang" }),
  q(1, "Tentukan nilai x yang menjadikan persamaan berikut bernilai benar.", [n("5x + 3 = 38, x =", 7, "5*x + 3 == 38"), n("−4 = 3x + 11, x =", -5, "-4 == 3*x + 11")],
    "5x = 35, x = 7. 3x = −15, x = −5.", { level: "Sedang" }),
  q(2, "Garis bilangan yang menunjukkan x ≥ −3 adalah …", [ch("Jawaban:", ["a", "b", "c", "d"], "b", lineOpts([ray(-3, false, "right"), ray(-3, true, "right"), ray(-3, true, "left"), ray(3, true, "right")]))],
    "Lebih dari atau sama dengan −3: bulatan penuh di −3 dan arsiran ke kanan.", { level: "Sedang" }),
  q(3, "Tentukan penyelesaian setiap pertidaksamaan.", [iq("x + 6 > 2:", "x", ">", -4, "x + 6 > 2"), iq("13 ≤ x + 15:", "x", "≥", -2, "13 <= x + 15")],
    "x > 2 − 6 = −4. 13 − 15 ≤ x, jadi −2 ≤ x atau x ≥ −2.", { level: "Sedang" }),
  q(0, "(k − 1) membagi habis 10, dengan k bilangan asli. Ketuk semua anggota himpunan penyelesaiannya.", [{ kind: "set", label: "HP =", values: [2, 3, 6, 11], max: 12 }],
    "Pembagi 10 adalah 1, 2, 5, 10. Maka k − 1 ∈ {1, 2, 5, 10} dan k ∈ {2, 3, 6, 11}. k = 1 tidak termasuk karena 0 tidak membagi 10.", { level: "Sedang" }),
  q(1, "Timbangan manakah yang menggambarkan persamaan n + 3 = 7? Setiap kotak berisi n kelereng.", [ch("Jawaban:", ["a", "b", "c", "d"], "a", [
    { type: "balance", left: { box: 1, unit: 3 }, right: { unit: 7 } }, { type: "balance", left: { box: 1, unit: 3 }, right: { unit: 10 } },
    { type: "balance", left: { box: 1, unit: 4 }, right: { unit: 7 } }, { type: "balance", left: { box: 2, unit: 3 }, right: { unit: 7 } }])],
    "Lengan kiri: satu kotak (n) dan 3 kelereng; lengan kanan: 7 kelereng. Penyelesaiannya n = 4.", { level: "Sedang" }),
  q(2, "Susun pertidaksamaan dari kalimat: \"Bilangan k dikurangi 6 hasilnya kurang dari atau sama dengan 11.\"", [bd("Pertidaksamaan:", ["k", "−", "6", "≤", "<", "≥", "11", "+"], ["k − 6 ≤ 11", "11 ≥ k − 6"])],
    "k dikurangi 6 ditulis k − 6; kurang dari atau sama dengan ditulis ≤. Jadi k − 6 ≤ 11.", { level: "Sedang" }),
  q(3, "Peserta lomba cerdas cermat harus berusia di bawah 17 tahun pada hari lomba. Lomba diadakan 2 tahun lagi. Jika x adalah usiamu sekarang, pertidaksamaan yang tepat adalah …", [ch("Jawaban:", ["x + 2 > 17", "x + 2 ≥ 17", "x + 2 ≤ 17", "x + 2 < 17"], "x + 2 < 17")],
    "Usia saat lomba x + 2 harus di bawah 17, jadi x + 2 < 17 dan x < 15.", { level: "Sedang" }),
  // Menantang (9-17)
  q(0, "Uang Rina Rp95.000,00. Jumlah uang Rina dan Sinta Rp210.000,00. Susun persamaan untuk menentukan uang Sinta (s).", [bd("Persamaan:", ["95.000", "+", "s", "=", "210.000", "−", "<"], ["95.000 + s = 210.000", "s + 95.000 = 210.000", "210.000 = 95.000 + s", "210.000 = s + 95.000"])],
    "Uang Rina ditambah uang Sinta sama dengan jumlahnya: 95.000 + s = 210.000, sehingga s = 115.000.", { level: "Menantang" }),
  q(1, "Tentukan nilai x pada persamaan {2x + 5/3} = −1.", [n("x =", -4, "(2*x + 5)/3 == -1")],
    "Kalikan kedua ruas dengan 3: 2x + 5 = −3. Kurangi 5: 2x = −8. Bagi 2: x = −4. Periksa: (−8 + 5) : 3 = −1.", { level: "Menantang" }),
  q(2, "Tuliskan pertidaksamaan yang ditunjukkan setiap garis bilangan.", [iq("Garis a:", "x", ">", 8, "x > 8"), iq("Garis b:", "x", "≤", -5, "x <= -5")],
    "a: bulatan kosong di 8, arsiran ke kanan: x > 8. b: bulatan penuh di −5, arsiran ke kiri: x ≤ −5.", { level: "Menantang", scene: { type: "lines", items: [ray(8, false, "right", 0, 16, "a"), ray(-5, true, "left", -9, -1, "b")] } }),
  q(3, "Tentukan penyelesaian pertidaksamaan −2x − 7 < 3.", [iq("Penyelesaian:", "x", ">", -5, "-2*x - 7 < 3")],
    "−2x < 10. Dibagi −2, tandanya berbalik: x > −5.", { level: "Menantang" }),
  q(0, "Pasangkan setiap kalimat terbuka dengan jenisnya. PLSV: persamaan linier satu variabel. PLDV: persamaan linier dua variabel. PtLSV: pertidaksamaan linier satu variabel.", [{ kind: "classify", options: ["PLSV", "PLDV", "Kuadrat", "PtLSV"], rows: [
    { text: "4x − 3 = 6 − 8x", answer: "PLSV" }, { text: "x + 5y = 40", answer: "PLDV" }, { text: "x^{2} − 9 = 0", answer: "Kuadrat" },
    { text: "13 − 2m ≤ 9m", answer: "PtLSV" }, { text: "−3y − 3 = 4y + 8", answer: "PLSV" }] }],
    "PLSV: satu variabel berpangkat 1 dengan tanda =. x + 5y memuat dua variabel. x^{2} berpangkat 2. Tanda ≤ menunjukkan pertidaksamaan.", { level: "Menantang" }),
  q(1, "Harga sepasang sepatu dua kali lipat harga sepasang sandal. Arjuna membeli 5 pasang sepatu dan 6 pasang sandal dengan total Rp480.000,00.", [n("Harga sepasang sandal =", 30000, "5*2*x + 6*x == 480000", undefined, "Rp"), n("Harga sepasang sepatu =", 60000, undefined, undefined, "Rp")],
    "Misalkan sandal s, sepatu 2s. 5(2s) + 6s = 16s = 480.000, s = 30.000. Sepatu 2 × 30.000 = Rp60.000,00.", { level: "Menantang", scene: { type: "shop", shoes: 5, sandals: 6, total: "Rp480.000,00" } }),
  q(2, "Apakah −3 merupakan penyelesaian setiap pertidaksamaan berikut?", [{ kind: "tf", statements: [
    { text: "x + 9 > 5", answer: true }, { text: "1 − 3p ≤ −8", answer: false }, { text: "4r + 2 ≥ −10", answer: true }, { text: "−2y < 6", answer: false }] }],
    "−3 + 9 = 6 > 5 benar. 1 − 3(−3) = 10 ≤ −8 salah. 4(−3) + 2 = −10 ≥ −10 benar. −2(−3) = 6 < 6 salah.", { level: "Menantang" }),
  q(3, "Doni menimbang batang besi yang beratnya sama. Sebatang besi lebih ringan daripada 9 g (gambar a), dan tiga batang besi lebih berat daripada 22 g (gambar b). Jika berat besi bilangan bulat, kemungkinan berat sebatang besi adalah …", [ch("Jawaban:", ["6 g", "7 g", "8 g", "9 g"], "8 g")],
    "b < 9 dan 3b > 22 sehingga b > 7,33. Bilangan bulat yang memenuhi 7,33 < b < 9 hanya 8 g.", { level: "Menantang", scene: { type: "balances", items: [
      { left: { bar: 1 }, right: { weights: [5, 2, 2] }, tilt: 1, caption: "a" }, { left: { bar: 3 }, right: { weights: [10, 10, 2] }, tilt: -1, caption: "b" }] } }),
  q(0, "Orang dewasa bernapas sekitar 21.600 kali dalam sehari (1.440 menit). Misalkan n banyak napas setiap menit.", [bd("Persamaan:", ["1.440", "×", "n", "=", "21.600", "24", "+"], ["1.440 × n = 21.600", "n × 1.440 = 21.600", "21.600 = 1.440 × n", "21.600 = n × 1.440"]), n("n =", 15, "1440*n == 21600", "kali")],
    "Satu hari 24 × 60 = 1.440 menit. 1.440 × n = 21.600, n = 15 napas per menit.", { level: "Menantang" }),
  // Sangat menantang (18-24)
  q(1, "Sudut-sudut sebuah segitiga adalah (x + 15)°, 2x°, dan (3x − 15)°.", [n("x =", 30, "(x + 15) + 2*x + (3*x - 15) == 180"), n("Sudut terbesar =", 75, undefined, "°")],
    "(x + 15) + 2x + (3x − 15) = 180, 6x = 180, x = 30. Sudutnya 45°, 60°, dan 75°.", { level: "Sangat menantang", scene: { type: "tri", angles: ["(x + 15)°", "(3x − 15)°", "2x°"] } }),
  q(2, "Nadia mendapat nilai 88, 79, 94, dan 91 pada 4 tes. Untuk mendapat nilai A, rata-rata 5 tes harus 90 atau lebih. Misalkan n nilai tes ke-5.", [iq("Penyelesaian:", "n", "≥", 98, "(88 + 79 + 94 + 91 + n)/5 >= 90"), n("Nilai tes ke-5 paling sedikit =", 98)],
    "{88 + 79 + 94 + 91 + n/5} ≥ 90 → 352 + n ≥ 450 → n ≥ 98.", { level: "Sangat menantang", scene: { type: "card", title: "Nilai tes Nadia", lines: ["Tes 1: 88", "Tes 2: 79", "Tes 3: 94", "Tes 4: 91", "Tes 5: n"] } }),
  q(3, "Garis bilangan yang menunjukkan penyelesaian −5(x + 2) ≤ 15 adalah …", [ch("Jawaban:", ["a", "b", "c", "d"], "d", lineOpts([ray(-5, true, "left"), ray(5, true, "right"), ray(-5, false, "right"), ray(-5, true, "right")]))],
    "Bagi −5, tanda berbalik: x + 2 ≥ −3, sehingga x ≥ −5. Bulatan penuh di −5 dan arsiran ke kanan.", { level: "Sangat menantang" }),
  q(0, "a adalah kelipatan 2 dan juga kelipatan 3 yang kurang dari 40, dengan a bilangan asli. Ketuk semua anggota himpunan penyelesaiannya.", [{ kind: "set", label: "HP =", values: [6, 12, 18, 24, 30, 36], max: 40 }],
    "Kelipatan 2 dan 3 sekaligus adalah kelipatan 6: 6, 12, 18, 24, 30, 36.", { level: "Sangat menantang" }),
  q(1, "Selesaikan persamaan dan soal suhu berikut.", [n("4 − 3(x − 5) = 2(x − 4) + 7, x =", 4, "4 - 3*(x - 5) == 2*(x - 4) + 7"), n("Suhu 35°C dalam Fahrenheit, dengan C = {5/9}(F − 32): F =", 95, "35 == 5/9*(x - 32)", "°F")],
    "19 − 3x = 2x − 1, 20 = 5x, x = 4. 35 = {5/9}(F − 32) → F − 32 = 63 → F = 95.", { level: "Sangat menantang" }),
  q(2, "Pak Doni membuat kolam berbentuk balok dengan panjang 5 m, lebar 3 m, dan kedalaman (x + 2) m. Volume kolam tidak kurang dari 90 m^{3}.", [iq("Penyelesaian:", "x", "≥", 4, "5*3*(x + 2) >= 90"), n("Kedalaman kolam paling sedikit =", 6, undefined, "m")],
    "5 × 3 × (x + 2) ≥ 90 → 15x + 30 ≥ 90 → x ≥ 4. Kedalaman paling sedikit 4 + 2 = 6 m.", { level: "Sangat menantang", scene: { type: "pool", p: "5 m", l: "3 m", t: "(x + 2) m" } }),
  q(3, "Segitiga sama kaki memiliki satu sisi yang panjangnya lima kali panjang sisi lainnya. Keliling segitiga paling sedikit 66 cm.", [n("Panjang sisi alas paling sedikit =", 6, "11*x >= 66 && 11*(x - 1) < 66", "cm"), n("Panjang setiap kaki paling sedikit =", 30, undefined, "cm")],
    "Jika sisi pendeknya dua (x, x, 5x), maka x + x < 5x dan segitiga tidak terbentuk. Jadi sisinya x, 5x, 5x: 11x ≥ 66, x ≥ 6. Alas paling sedikit 6 cm dan kaki 30 cm.", { level: "Sangat menantang", scene: { type: "tri", sides: ["x", "5x", "5x"], tall: true } }),
];

export const sources = { TB };
