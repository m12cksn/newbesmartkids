import type { Question } from "./grade-four-whole-numbers";
import type { Bars } from "./grade-five-data";

/*
 * Kelas 7 Bab 6 - Data dan Diagram (Buku Matematika SMP/MTs Kelas VII, Kurikulum Merdeka 2022, hlm. 185-228).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 * Teks boleh memuat pecahan bersusun dengan penanda {3/4}.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type { Bars };

/* ---------- Angka ---------- */
export const num = (s: string) => { const t = s.trim().replace("−", "-").replace(/\./g, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };
export const idn = (n: number) => { const r = Math.round(n * 1e4) / 1e4; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
export const countOf = (xs: number[], v: number) => xs.filter(x => x === v).length;
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/* ---------- Gambar ---------- */
export type Pie = { title: string; parts: { name: string; value: number; color: string }[]; show: "value" | "percent" | "none" | "angle" };
export type Line = { title: string; cats: string[]; series: { name: string; color: string; values: number[] }[]; max: number; step: number; valueLabel: string };
export type Scene =
  | { type: "plot"; title: string; min: number; max: number; data: number[] }
  | { type: "bars"; bars: Bars }
  | { type: "axis"; title: string; cats: string[]; values: number[]; from: number; to: number; step: number }
  | { type: "pie"; pie: Pie }
  | { type: "line"; line: Line }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "minis" }
  | { type: "raw"; title: string; items: number[] }
  | { type: "text"; lines: string[] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; tol?: number }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "select"; label: string; options: string[]; answer: number[] }
  | { kind: "order"; label: string; options: string[]; answer: string[] }
  /** Tabel dengan sel kosong (null) yang diisi bilangan. */
  | { kind: "table"; head: string[]; rows: (string | null)[][]; answers: number[] }
  /** Membuat line plot: ketuk garis bilangan untuk menambah tanda X. */
  | { kind: "plot"; min: number; max: number; data: number[] }
  /** Membuat diagram batang: atur tinggi setiap batang. */
  | { kind: "bars"; title: string; cats: string[]; values: number[]; max: number; step: number }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type DQuestion = Question & { topic: 0 | 1 | 2 | 3 | 4 | 5; level?: Level; scene?: Scene; parts: Part[] };

const plotCounts = (p: { min: number; max: number; data: number[] }) => Array.from({ length: p.max - p.min + 1 }, (_, k) => countOf(p.data, p.min + k));
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "table" ? p.answers.length : p.kind === "plot" ? p.max - p.min + 1 : p.kind === "bars" ? p.values.length : 1);
const n2s = (n: number) => idn(n).replace("−", "-").replace(/\./g, "");
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [n2s(p.value)];
    case "classify": return p.rows.map(r => r.answer);
    case "select": return [p.answer.join(",")];
    case "order": return [p.answer.join(";")];
    case "table": return p.answers.map(n2s);
    case "plot": return plotCounts(p).map(String);
    case "bars": return p.values.map(String);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "num") { const a = num(v); return !Number.isNaN(a) && Math.abs(a - p.value) <= (p.tol ?? 1e-9); }
  if (p.kind === "table") return p.answers.every((a, k) => Math.abs(num(x[k]) - a) < 1e-9);
  if (p.kind === "plot" || p.kind === "bars") return fields(p).every((w, k) => Number(x[k] || 0) === Number(w));
  if (p.kind === "select" || p.kind === "order" || p.kind === "choice") return v === fields(p)[0];
  return x.join("|") === fields(p).join("|");
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "num") return !Number.isNaN(num(v));
  if (p.kind === "table") return x.every(c => !Number.isNaN(num(c)));
  if (p.kind === "plot" || p.kind === "bars") return x.some(c => Number(c) > 0);
  if (p.kind === "order") return v.split(";").filter(Boolean).length === p.options.length;
  if (p.kind === "select" || p.kind === "choice") return v.length > 0;
  return x.every(Boolean);
}
export const correct = (q: DQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: DQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const plain = (s: string) => s.replace(/\{([^}]+)\}/g, "$1");
export function formatAnswer(q: DQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => (Number.isNaN(num(s)) ? "…" : idn(num(s)));
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${d(v[i])}${p.unit ? ` ${p.unit}` : ""}`;
      case "classify": return p.rows.map((r, k) => `${r.text}: ${x[k] || "…"}`).join("; ");
      case "select": return `${p.label} ${v[i] ? v[i].split(",").map(k => p.options[Number(k)]).join(", ") : "…"}`;
      case "order": return v[i] ? v[i].split(";").join(" → ") : "…";
      case "table": return x.map(d).join(", ");
      case "plot": return x.map((c, k) => (Number(c) ? `${p.min + k}: ${c}` : "")).filter(Boolean).join(", ") || "…";
      case "bars": return p.cats.map((c, k) => `${c} ${x[k] || 0}`).join(", ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return `${p.label} ${v[i] || "…"}`;
    }
  }).join(" | ");
}

/* ---------- Data sumber ---------- */
const q = (topic: DQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): DQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string): Part => ({ kind: "num", label, value, unit });
const KN = ["Kategorik", "Numerik"];
const red = "#e5484d", blue = "#2f86d6", green = "#2b8a3e", orange = "#f08a24", purple = "#7048e8", yellow = "#f5b014";

export const names7A = [6, 8, 10, 10, 11, 12, 12, 13, 13, 13, 13, 13, 15, 16, 17, 17, 19, 20, 20, 22, 23, 23, 24, 26, 27];
export const names7B = [7, 9, 9, 11, 11, 11, 12, 14, 14, 14, 14, 15, 16, 18, 18, 21, 21, 22, 25, 28];
const plot7A: Scene = { type: "plot", title: "Panjang Nama Siswa Kelas 7A", min: 6, max: 28, data: names7A };
const plot7B: Scene = { type: "plot", title: "Panjang Nama Siswa Kelas 7B", min: 6, max: 28, data: names7B };
export const apps = [2, 4, 6, 9, 7, 3, 1];
const appTable: Scene = { type: "table", caption: "Banyak aplikasi permainan online dalam gawai siswa 7C", head: ["Banyak aplikasi", "Banyak siswa"], rows: apps.map((f, k) => [String(k), String(f)]) };
export const quota: Bars = { title: "Penggunaan Kuota Internet untuk PJJ", orient: "v", cats: ["7", "8", "9", "10", "11", "12"], series: [{ name: "Kuota (GB)", color: orange, values: [4, 6, 9, 11, 8, 7] }], max: 12, minor: 1, major: 2, valueLabel: "Kuota terpakai (GB)", catLabel: "Bulan ke-" };
export const medals: Bars = { title: "Perolehan Medali Emas Olimpiade", orient: "v", cats: ["AS", "Cina", "Jepang", "Inggris", "Rusia"], series: [{ name: "2016", color: red, values: [46, 26, 12, 27, 19] }, { name: "2020", color: blue, values: [39, 38, 27, 22, 20] }], max: 50, minor: 1, major: 10, valueLabel: "Jumlah medali", catLabel: "Negara" };
export const shoes: Bars = { title: "Jumlah Pasang Sepatu Terjual", orient: "v", cats: ["Toko A", "Toko B", "Toko C"], series: [{ name: "Sepatu pria", color: red, values: [95, 110, 80] }, { name: "Sepatu wanita", color: blue, values: [75, 85, 55] }], max: 120, minor: 5, major: 20, valueLabel: "Sepatu terjual (pasang)", catLabel: "Toko" };
export const visitors: Bars = { title: "Jumlah Pengunjung Taman Wisata", orient: "v", cats: ["2018", "2019", "2020", "2021"], series: [{ name: "Pengunjung", color: orange, values: [60000, 120000, 180000, 240000] }], max: 300000, minor: 10000, major: 50000, valueLabel: "Pengunjung", catLabel: "Tahun" };
export const cars: Bars = { title: "Jumlah Mobil Berdasarkan Warna di Tempat Parkir", orient: "v", cats: ["Merah", "Hitam", "Putih", "Hijau", "Kuning", "Lainnya"], series: [{ name: "Mobil", color: green, values: [14, 25, 21, 5, 4, 9] }], max: 26, minor: 1, major: 2, valueLabel: "Jumlah mobil", catLabel: "Warna mobil" };
export const sports: Bars = { title: "Pilihan Cabang Olahraga Nonton Bareng", orient: "v", cats: ["Bulu tangkis", "Basket", "Voli", "Atletik", "Renang"], series: [{ name: "Kelas 7C", color: red, values: [12, 9, 7, 4, 3] }, { name: "Kelas 7D", color: blue, values: [9, 11, 8, 6, 2] }], max: 14, minor: 1, major: 2, valueLabel: "Banyak siswa", catLabel: "Cabang olahraga" };
export const co2: Bars = { title: "Emisi CO₂ (juta ton)", orient: "v", cats: ["Amerika", "Rusia", "Jepang", "Kanada", "Jerman"], series: [{ name: "1990", color: "#c9d6df", values: [5000, 3000, 1200, 600, 1250] }, { name: "1998", color: "#33413b", values: [5600, 2100, 1260, 690, 1000] }], max: 6000, minor: 100, major: 1000, valueLabel: "Juta ton", catLabel: "Negara" };
export const sea: Bars = { title: "Perolehan Medali Indonesia di SEA Games", orient: "h", cats: ["2011", "2013", "2015", "2017", "2019"], series: [{ name: "Emas", color: orange, values: [180, 65, 48, 38, 74] }, { name: "Perak", color: green, values: [150, 85, 62, 64, 86] }, { name: "Perunggu", color: purple, values: [140, 110, 75, 90, 110] }], max: 200, minor: 5, major: 50, valueLabel: "Medali", catLabel: "Tahun" };
const exam: Scene = { type: "axis", title: "Nilai Ulangan Matematika", cats: ["Eko", "Bella", "Totok"], values: [50, 70, 60], from: 40, to: 100, step: 10 };
export const kaus = [{ name: "Merah", value: 10, color: red }, { name: "Putih", value: 15, color: "#e9ecef" }, { name: "Hitam", value: 8, color: "#33413b" }, { name: "Kuning", value: 7, color: yellow }];
export const osis = [{ name: "Danu", value: 21, color: green }, { name: "Rizki", value: 15, color: blue }, { name: "Karno", value: 6, color: orange }, { name: "Noer", value: 12, color: purple }, { name: "Indah", value: 6, color: red }];
export const password = [{ name: "6 angka", value: 15, color: blue }, { name: "7 angka", value: 5, color: orange }, { name: "8 angka", value: 30, color: green }, { name: "9 angka", value: 10, color: purple }];
export const food = [{ name: "Mi goreng", value: 30, color: orange }, { name: "Ayam goreng", value: 45, color: yellow }, { name: "Ikan bakar", value: 15, color: blue }, { name: "Gado-gado", value: 60, color: green }, { name: "Rendang", value: 30, color: red }];
export const nutrients = [{ name: "Karbohidrat", k: 9, color: yellow }, { name: "Protein", k: 6, color: red }, { name: "Lemak", k: 2, color: orange }, { name: "Vitamin dan mineral", k: 3, color: green }];
const pieOf = (title: string, parts: { name: string; value: number; color: string }[], show: Pie["show"] = "value"): Scene => ({ type: "pie", pie: { title, parts, show } });
export const steps = ["Formulasi pertanyaan", "Pengumpulan data", "Analisis data", "Interpretasi hasil"];
const charts = ["Diagram batang", "Diagram batang ganda", "Diagram garis", "Diagram lingkaran"];
const transport = [{ c: "Jalan kaki", f: 6 }, { c: "Angkutan umum", f: 10 }, { c: "Ojek online", f: 12 }, { c: "Kendaraan pribadi", f: 4 }];

/* ---------- Materi: dua bagian per subtopik ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  {
    code: "A", title: "Investigasi Statistika", short: "Investigasi statistika",
    sections: [
      {
        title: "Alur investigasi statistika", lab: "flow",
        steps: [
          "Statistika adalah cabang matematika tentang pengumpulan, pengorganisasian, penyajian, analisis, dan interpretasi data.",
          "Investigasi statistika mengikuti empat langkah: formulasi pertanyaan, pengumpulan data, analisis data, dan interpretasi hasil.",
          "Pertanyaan perlu dirumuskan agar bisa dijawab dengan data. “Siapa pemain sepak bola paling hebat?” diubah menjadi “Berapa rata-rata gol setiap pemain dalam satu musim?”.",
          "Pertanyaan statistika mengharapkan jawaban yang beragam. “Berapa umurku?” hanya punya satu jawaban, sedangkan “Berapa umur siswa kelas 7?” jawabannya bermacam-macam.",
        ],
        demo: "Ketuk langkah-langkah investigasi sesuai urutannya, lalu periksa contoh pertanyaan statistika.",
      },
      {
        title: "Line plot", lab: "lineplot",
        steps: [
          "Line plot memakai garis bilangan yang memuat semua nilai data. Setiap data digambar sebagai satu tanda X di atas nilainya.",
          "Banyak X di atas suatu nilai adalah frekuensinya. Jumlah semua X adalah banyak data.",
          "Dari line plot terlihat di mana kebanyakan data berkumpul, nilai yang paling sering muncul, nilai terkecil dan terbesar, serta data yang jauh dari kelompoknya.",
          "Data yang sama juga dapat digambar sebagai diagram batang: tinggi batang menunjukkan frekuensi, bukan nilai datanya.",
        ],
        example: "Pada data panjang nama, nama terpanjang mempunyai batang pendek jika hanya satu siswa yang mempunyai panjang nama itu.",
        demo: "Ketuk garis bilangan untuk menambah tanda X dari data panjang nama. Frekuensi dan nilai yang paling sering muncul langsung terlihat.",
      },
    ],
  },
  {
    code: "B", title: "Macam-Macam Data", short: "Macam-macam data",
    sections: [
      {
        title: "Data kategorik dan data numerik", lab: "sort",
        steps: [
          "Data kategorik berbentuk kualitatif, biasanya kata: nama provinsi, warna favorit, jenis olahraga.",
          "Data numerik selalu berupa angka hasil menghitung atau mengukur: tinggi badan, banyak medali, lama belajar.",
          "Ada data berupa bilangan yang tetap kategorik, misalnya nomor kelas 7-1, 7-2, nomor absen, atau peringkat. Bilangan itu hanya label; tidak masuk akal dijumlahkan atau dikurangkan.",
          "Jenis pertanyaan menentukan jenis data: “Media sosial apa yang paling sering kamu pakai?” menghasilkan data kategorik, “Berapa jam sehari?” menghasilkan data numerik.",
        ],
        demo: "Ketuk setiap kartu data, lalu masukkan ke kelompok kategorik atau numerik.",
      },
      {
        title: "Tabel frekuensi", lab: "tally",
        steps: [
          "Tabel frekuensi mengelompokkan data lalu menghitung berapa kali setiap nilai atau kategori muncul.",
          "Untuk data numerik, frekuensi menunjukkan banyak siswa dengan nilai itu. Nilai dengan frekuensi terbesar adalah yang dimiliki kebanyakan siswa.",
          "Jumlah seluruh frekuensi sama dengan banyak data, misalnya banyak siswa.",
          "Tidak semua pertanyaan bisa dijawab dari tabel: tanpa data jenis kelamin, kita tidak tahu aplikasi favorit siswa perempuan.",
        ],
        demo: "Ketuk setiap data untuk mencatatnya. Tabel frekuensi dan diagram batangnya terisi otomatis.",
      },
    ],
  },
  {
    code: "C", title: "Diagram dalam Statistika", short: "Membaca diagram",
    sections: [
      {
        title: "Membaca diagram dengan teliti", lab: "read",
        steps: [
          "Saat membaca diagram, lihat dulu judulnya, lalu keterangan pada setiap sumbu dan satuannya.",
          "Diagram yang baik memuat judul, label sumbu, skala yang konsisten dan berjarak sama dimulai dari 0, serta legenda jika ada lebih dari satu kelompok data.",
          "Diagram batang rangkap (ganda) membandingkan dua kelompok data pada kategori yang sama, misalnya medali tahun 2016 dan 2020.",
          "Untuk membaca nilai, ikuti ujung batang ke sumbu tegak. Selisih dua nilai adalah perbedaan tinggi batangnya.",
        ],
        demo: "Ketuk sebuah batang untuk membaca nilainya. Bandingkan dua tahun pada diagram batang ganda.",
      },
      {
        title: "Diagram yang menyesatkan", lab: "axis",
        steps: [
          "Sumbu tegak yang tidak dimulai dari 0 membuat perbedaan tampak jauh lebih besar dari sebenarnya.",
          "Jika sumbu dimulai dari 40, batang nilai 70 tampak tiga kali batang nilai 50, padahal 70 hanya 1,4 kali 50.",
          "Mengubah skala, misalnya dari kelipatan 50.000 menjadi 200.000, membuat batang tampak lebih rendah dan perubahan tampak kecil.",
          "Kategori “lainnya” dipakai untuk menggabungkan banyak kategori kecil agar diagram tidak terlalu ramai.",
        ],
        demo: "Pindahkan awal sumbu tegak. Bandingkan panjang batang dengan nilai sebenarnya.",
      },
    ],
  },
  {
    code: "D", title: "Diagram Batang", short: "Diagram batang",
    sections: [
      {
        title: "Menggambar diagram batang", lab: "build",
        steps: [
          "Diagram batang umumnya dipakai untuk data kategorik yang sudah dihitung frekuensinya dalam tabel.",
          "Langkahnya: tentukan judul dan label kedua sumbu, buat skala tegak yang tetap dan berjarak sama mulai dari 0, lalu gambar batang sesuai frekuensi.",
          "Lebar setiap batang sama dan ada jarak antarbatang.",
          "Untuk dua kelompok data, gambar batang yang menempel untuk setiap kategori, lalu beri legenda.",
        ],
        demo: "Atur tinggi setiap batang sampai sesuai tabel cara siswa berangkat ke sekolah.",
      },
      {
        title: "Kenaikan dan persentase perubahan", lab: "change",
        steps: [
          "Dari diagram batang ganda kita dapat melihat kategori mana yang naik dan yang turun.",
          "Perubahan = nilai baru − nilai lama. Persentase perubahan = perubahan : nilai lama × 100%.",
          "Contoh: emisi naik dari 5.000 menjadi 5.600 juta ton, perubahannya 600, yaitu {600/5000} × 100% = 12%.",
          "Hati-hati dengan data persen: dari 80% menjadi 90% berarti naik 10 poin persen, tetapi banyak orangnya bergantung pada jumlah keseluruhan.",
        ],
        demo: "Pilih sebuah negara. Bandingkan batang tahun 1990 dan 1998, lalu lihat perubahan dan persentase perubahannya.",
      },
    ],
  },
  {
    code: "E", title: "Diagram Lingkaran", short: "Diagram lingkaran",
    sections: [
      {
        title: "Sudut pusat dan persentase", lab: "pie",
        steps: [
          "Diagram lingkaran menunjukkan bagian-bagian dari satu keseluruhan. Setiap bagian digambar sebagai juring.",
          "Sudut pusat seluruh lingkaran 360°. Sudut pusat juring = {frekuensi/jumlah} × 360°.",
          "Persentase juring = {sudut/360} × 100%. Juring bersudut 216° berarti {216/360} × 100% = 60%.",
          "Jumlah semua persentase selalu 100%, dan jumlah semua sudut pusat selalu 360°.",
        ],
        demo: "Atur banyaknya setiap kategori. Pecahan, sudut pusat, dan persentasenya dihitung, dan diagram lingkarannya digambar ulang.",
      },
      {
        title: "Membaca diagram lingkaran", lab: "pieread",
        steps: [
          "Jika total data diketahui, banyaknya suatu bagian = persentase × total, atau {sudut/360} × total.",
          "Hard disk 500 TB yang 60% terpakai berarti 300 TB terpakai dan 200 TB kosong.",
          "Tanpa total, diagram lingkaran hanya memberi perbandingan, bukan banyaknya. Kita tahu bagian terbesar, tetapi tidak tahu jumlah rupiahnya.",
          "Jika sudut ditulis sebagai bentuk aljabar seperti 9x, 6x, 2x, dan 3x, jumlahkan semuanya sama dengan 360° untuk mencari x.",
        ],
        demo: "Ubah total data dan sudut juring. Banyaknya bagian itu dihitung dari diagram lingkaran.",
      },
    ],
  },
  {
    code: "F", title: "Memilih Diagram yang Tepat", short: "Memilih diagram",
    sections: [
      {
        title: "Batang, garis, atau lingkaran?", lab: "choose",
        steps: [
          "Diagram batang memudahkan membandingkan jumlah antar kategori, misalnya pengguna TikTok di 5 kelas.",
          "Diagram batang ganda membandingkan dua kelompok data pada kategori yang sama, misalnya pengguna TikTok dan Line di 5 kelas.",
          "Diagram garis menunjukkan perubahan dari waktu ke waktu, misalnya pemakaian listrik setiap bulan. Dua garis untuk membandingkan dua kelompok dari waktu ke waktu.",
          "Diagram lingkaran menunjukkan bagian dari keseluruhan, misalnya persentase waktu untuk setiap kegiatan. Diagram ini tidak cocok jika bagian-bagiannya tidak membentuk satu keseluruhan, seperti suku bunga beberapa bank.",
        ],
        demo: "Baca setiap situasi lalu pilih diagram yang paling tepat. Alasannya muncul setelah kamu memilih.",
      },
      {
        title: "Diagram garis", lab: "lineview",
        steps: [
          "Diagram garis dibuat dengan menandai setiap nilai seperti ujung batang, lalu menghubungkan titik-titik berurutan.",
          "Kemiringan garis menunjukkan naik atau turunnya data. Garis yang curam berarti perubahan besar.",
          "Diagram garis paling tepat jika sumbu mendatar menunjukkan urutan waktu: jam, hari, bulan, atau tahun.",
        ],
        demo: "Tukar tampilan batang dan garis untuk data yang sama. Perhatikan bagian yang naik dan turun.",
      },
    ],
  },
];

/* ---------- Latihan ---------- */
export const practice: DQuestion[][] = [
  [
    q(0, "Urutkan langkah investigasi statistika.", [{ kind: "order", label: "Urutan langkah", options: [steps[2], steps[0], steps[3], steps[1]], answer: steps }],
      "Pertanyaan dirumuskan dahulu, lalu data dikumpulkan, dianalisis, dan hasilnya diinterpretasikan."),
    q(0, "Perhatikan line plot panjang nama siswa kelas 7B.", [n("Banyak siswa dengan panjang nama 14 huruf:", 4), n("Banyak siswa dengan panjang nama lebih dari 20 huruf:", 5), n("Banyak siswa kelas 7B:", names7B.length)],
      "Ada 4 tanda X di atas 14. Lebih dari 20 huruf: 21, 21, 22, 25, dan 28, yaitu 5 siswa. Seluruhnya 20 tanda X.", { scene: plot7B }),
    q(0, "Ketuk semua pertanyaan statistika, yaitu pertanyaan yang jawabannya beragam dan dijawab dengan mengumpulkan data.", [{ kind: "select", label: "Pertanyaan statistika", options: ["Berapa tinggi badanku?", "Berapa tinggi badan siswa kelas 7?", "Makanan apa yang paling disukai siswa di sekolahku?", "Jam berapa sekarang?"], answer: [1, 2] }],
      "Pertanyaan statistika mengharapkan banyak jawaban yang berbeda dari banyak orang. Tinggi badanku dan jam sekarang hanya punya satu jawaban."),
    q(0, "Buatlah line plot dari data berikut dengan mengetuk garis bilangan.", [{ kind: "plot", min: 1, max: 8, data: [4, 2, 7, 3, 5, 5, 3, 4, 5] }],
      "Setiap data diberi satu tanda X: 2 satu kali, 3 dua kali, 4 dua kali, 5 tiga kali, 7 satu kali.", { scene: { type: "raw", title: "Data", items: [4, 2, 7, 3, 5, 5, 3, 4, 5] } }),
  ],
  [
    q(1, "Tentukan apakah jawaban setiap pertanyaan berupa data kategorik atau numerik.", [{ kind: "classify", options: KN, rows: [
      { text: "Di kota mana kamu dilahirkan?", answer: "Kategorik" }, { text: "Berapa lama kamu membaca buku setiap hari?", answer: "Numerik" }, { text: "Apa permainan online favoritmu?", answer: "Kategorik" }, { text: "Berapa skor tertinggimu dalam permainan itu?", answer: "Numerik" },
    ] }], "Nama kota dan nama permainan berupa kata, jadi kategorik. Lama membaca dan skor adalah hasil mengukur atau menghitung, jadi numerik."),
    q(1, "Data olahraga siswa kelas 7: tentukan jenis datanya.", [{ kind: "classify", options: KN, rows: [
      { text: "Jenis olahraga favorit", answer: "Kategorik" }, { text: "Banyak siswa yang berolahraga hari Sabtu", answer: "Numerik" }, { text: "Peringkat Indonesia di Asian Games", answer: "Kategorik" }, { text: "Lama berolahraga dalam sehari (jam)", answer: "Numerik" },
    ] }], "Peringkat berupa bilangan, tetapi hanya urutan, jadi kategorik."),
    q(1, "Perhatikan tabel banyak aplikasi permainan online siswa 7C.", [n("Banyak siswa kelas 7C:", sum(apps)), n("Banyak aplikasi yang dimiliki kebanyakan siswa:", 3), n("Banyak siswa yang mempunyai 6 aplikasi:", 1)],
      "Jumlah frekuensi 2 + 4 + 6 + 9 + 7 + 3 + 1 = 32. Frekuensi terbesar 9 pada 3 aplikasi. 6 aplikasi dimiliki 1 siswa.", { scene: appTable }),
    q(1, "Tentukan benar atau salah.", [{ kind: "tf", statements: [{ text: "Nomor absen siswa termasuk data numerik.", answer: false }, { text: "Berat badan siswa termasuk data numerik.", answer: true }, { text: "Bulan kelahiran siswa termasuk data kategorik.", answer: true }] }],
      "Nomor absen hanya label, tidak dioperasikan, jadi kategorik. Berat badan hasil mengukur. Bulan kelahiran berupa nama bulan."),
  ],
  [
    q(2, "Perhatikan diagram penggunaan kuota internet untuk PJJ.", [n("Kuota pada bulan ke-8:", 6, "GB"), { kind: "choice", label: "Bulan dengan kuota 7 GB", options: ["Oktober", "November", "Desember"], answer: "Desember" }],
      "Batang bulan ke-8 sampai 6. Bulan ke-12 (Desember) sampai 7.", { scene: { type: "bars", bars: quota } }),
    q(2, "Perhatikan diagram jumlah mobil berdasarkan warna.", [n("Mobil putih:", 21), n("Selisih mobil merah dan hijau:", 9), n("Jumlah seluruh mobil:", sum(cars.series[0].values as number[]))],
      "Putih 21. Merah 14, hijau 5, selisih 9. Jumlah 14 + 25 + 21 + 5 + 4 + 9 = 78.", { scene: { type: "bars", bars: cars } }),
    q(2, "Diagram nilai ulangan ini sumbunya dimulai dari 40. Bella berkata nilainya 3 kali nilai Eko karena batangnya 3 kali lebih panjang. Apa kesalahannya?", [{ kind: "choice", label: "Kesalahan", options: ["Sumbu tegak tidak dimulai dari 0", "Tidak ada judul", "Lebar batang berbeda"], answer: "Sumbu tegak tidak dimulai dari 0" }],
      "Batang dihitung dari 40: Bella 30, Eko 10. Nilai sebenarnya 70 dan 50; 70 : 50 = 1,4 kali.", { scene: exam }),
    q(2, "Perhatikan diagram medali emas Olimpiade.", [{ kind: "choice", label: "Runner-up tahun 2020", options: medals.cats, answer: "Cina" }, n("Medali emas Inggris 2016:", 27)],
      "Tahun 2020: AS 39, Cina 38, sehingga Cina di urutan kedua. Inggris 2016 mendapat 27.", { scene: { type: "bars", bars: medals } }),
  ],
  [
    q(3, "Perhatikan diagram cabang olahraga pilihan kelas 7C dan 7D. Ketuk semua cabang yang dipilih lebih banyak siswa 7D daripada 7C.", [{ kind: "select", label: "Lebih banyak dipilih 7D", options: sports.cats, answer: [1, 2, 3] }],
      "Basket 11 > 9, voli 8 > 7, atletik 6 > 4. Bulu tangkis dan renang lebih banyak dipilih 7C.", { scene: { type: "bars", bars: sports } }),
    q(3, "Gambarlah diagram batang dari tabel warna kaus yang terjual.", [{ kind: "bars", title: "Kaus Terjual", cats: kaus.map(k => k.name), values: kaus.map(k => k.value), max: 20, step: 1 }],
      "Merah 10, putih 15, hitam 8, kuning 7.", { scene: { type: "table", head: ["Warna", "Banyak kaus"], rows: kaus.map(k => [k.name, String(k.value)]) } }),
    q(3, "Emisi CO₂ Amerika naik dari 5.000 juta ton (1990) menjadi 5.600 juta ton (1998). Berapa persentase kenaikannya?", [n("Kenaikan:", 600, "juta ton"), n("Persentase kenaikan:", 12, "%")],
      "5.600 − 5.000 = 600. {600/5000} × 100% = 12%.", { scene: { type: "bars", bars: co2 } }),
    q(3, "Perhatikan diagram sepatu terjual. Berapa lebih banyak penjualan sepatu wanita di toko B daripada toko C?", [n("Selisih:", 30, "pasang")],
      "Toko B 85, toko C 55, selisih 30 pasang.", { scene: { type: "bars", bars: shoes } }),
  ],
  [
    q(4, "Sudut pusat bagian terpakai pada diagram kapasitas hard disk 216°. Kapasitasnya 500 TB.", [n("Persentase terpakai:", 60, "%"), n("Kapasitas terpakai:", 300, "TB")],
      "{216/360} × 100% = 60%. 60% × 500 = 300 TB.", { scene: pieOf("Kapasitas Hard Disk", [{ name: "Terpakai", value: 216, color: orange }, { name: "Tidak terpakai", value: 144, color: blue }], "none") }),
    q(4, "Lengkapi sudut pusat setiap makanan favorit.", [{ kind: "table", head: ["Makanan", "Banyak siswa", "Sudut pusat (°)"], rows: food.map(f => [f.name, String(f.value), null]), answers: food.map(f => (f.value / sum(food.map(x => x.value))) * 360) }],
      "Jumlah 180 siswa, jadi setiap siswa 360 : 180 = 2°. Mi goreng 60°, ayam goreng 90°, ikan bakar 30°, gado-gado 120°, rendang 60°."),
    q(4, "Perhatikan diagram lingkaran panjang password email siswa.", [n("Persentase siswa dengan password 8 angka:", 50, "%"), n("Sudut juring password 6 angka:", 90, "°")],
      "Jumlah 60 siswa. 8 angka 30 siswa = 50%, tepat setengah lingkaran. 6 angka: {15/60} × 360° = 90°.", { scene: pieOf("Panjang Password Email", password) }),
    q(4, "Diagram lingkaran menunjukkan pilihan 72 siswa. Sebuah juring bersudut 50°. Berapa siswa yang diwakilinya?", [n("Banyak siswa:", 10)], "{50/360} × 72 = 10 siswa."),
  ],
  [
    q(5, "Diagram apa yang paling tepat untuk menampilkan pengeluaran listrik keluarga setiap bulan selama setahun?", [{ kind: "choice", label: "Diagram", options: charts, answer: "Diagram garis" }], "Data berubah dari waktu ke waktu, jadi diagram garis."),
    q(5, "Diagram apa yang paling tepat untuk membandingkan banyak baju yang terjual di 3 toko pada bulan Januari dan Februari?", [{ kind: "choice", label: "Diagram", options: charts, answer: "Diagram batang ganda" }], "Ada dua kelompok data (Januari dan Februari) untuk setiap toko."),
    q(5, "Diagram apa yang paling tepat untuk membandingkan suhu tertinggi di 5 kota?", [{ kind: "choice", label: "Diagram", options: charts, answer: "Diagram batang" }], "Membandingkan satu nilai pada beberapa kategori (kota)."),
    q(5, "Diagram apa yang paling tepat untuk menunjukkan persentase waktu yang dipakai untuk setiap kegiatan di dunia maya?", [{ kind: "choice", label: "Diagram", options: charts, answer: "Diagram lingkaran" }], "Setiap kegiatan adalah bagian dari seluruh waktu."),
  ],
];

/* ---------- Evaluasi: 24 soal, A sampai F bergantian ---------- */
export const assessment: DQuestion[] = [
  // Sedang (1-8)
  q(0, "Perhatikan line plot panjang nama siswa kelas 7A.", [n("Banyak siswa dengan panjang nama 13 huruf:", countOf(names7A, 13)), n("Banyak siswa kelas 7A:", names7A.length), n("Panjang nama yang paling banyak dimiliki siswa:", 13, "huruf")],
    "Di atas 13 ada 5 tanda X, paling banyak. Seluruhnya 25 tanda X, jadi ada 25 siswa.", { level: "Sedang", scene: plot7A }),
  q(1, "Tentukan apakah setiap data termasuk data kategorik atau numerik.", [{ kind: "classify", options: KN, rows: [
    { text: "Banyaknya anggota keluarga di rumah", answer: "Numerik" }, { text: "Grup musik favorit di kelas", answer: "Kategorik" }, { text: "Peringkat Indonesia di Olimpiade", answer: "Kategorik" }, { text: "Lama belajar dalam seminggu", answer: "Numerik" }, { text: "Judul situs yang sering dikunjungi", answer: "Kategorik" }, { text: "Banyak lagu yang diunduh dalam sehari", answer: "Numerik" },
  ] }], "Hasil menghitung atau mengukur adalah numerik. Nama, judul, dan peringkat (urutan) adalah kategorik.", { level: "Sedang" }),
  q(2, "Perhatikan diagram penggunaan kuota internet untuk PJJ.", [n("Kuota pada bulan November:", 8, "GB"), { kind: "choice", label: "Bulan dengan pemakaian terbanyak", options: ["September", "Oktober", "November"], answer: "Oktober" }, n("Pemakaian terbanyak:", 11, "GB")],
    "November adalah bulan ke-11: 8 GB. Batang tertinggi bulan ke-10 (Oktober) dengan 11 GB.", { level: "Sedang", scene: { type: "bars", bars: quota } }),
  q(3, "Perhatikan diagram batang ganda sepatu terjual.", [{ kind: "choice", label: "Toko yang paling banyak menjual sepatu pria", options: shoes.cats, answer: "Toko B" }, n("Penjualan sepatu pria toko A lebih banyak dari toko C sebanyak", 15, "pasang")],
    "Batang merah tertinggi di toko B (110). Toko A 95, toko C 80, selisih 15.", { level: "Sedang", scene: { type: "bars", bars: shoes } }),
  q(4, "Diagram lingkaran peserta lomba matematika menunjukkan siswa perempuan 40%.", [n("Persentase siswa laki-laki:", 60, "%"), n("Sudut pusat juring siswa laki-laki:", 216, "°")],
    "100% − 40% = 60%. {60/100} × 360° = 216°.", { level: "Sedang", scene: pieOf("Peserta Lomba Matematika", [{ name: "Perempuan", value: 40, color: red }, { name: "Laki-laki", value: 60, color: blue }], "none") }),
  q(5, "Pilih diagram yang paling tepat untuk setiap situasi.", [{ kind: "classify", options: charts, rows: [
    { text: "Membandingkan banyak pengguna TikTok di 5 kelas", answer: "Diagram batang" }, { text: "Membandingkan pengguna TikTok dan Line di 5 kelas", answer: "Diagram batang ganda" },
    { text: "Rata-rata jam mengakses TikTok setiap hari selama seminggu", answer: "Diagram garis" }, { text: "Persentase siswa yang menyukai sepak bola dari seluruh kelas", answer: "Diagram lingkaran" },
  ] }], "Satu kelompok antar kategori: batang. Dua kelompok: batang ganda. Perubahan dari waktu ke waktu: garis. Bagian dari keseluruhan: lingkaran.", { level: "Sedang" }),
  q(0, "OSIS ingin tahu lomba yang paling diinginkan siswa untuk perayaan HUT RI. Urutkan langkah investigasinya.", [{ kind: "order", label: "Urutan", options: ["Membuat tabel frekuensi dan diagram batang", "Menentukan tiga lomba yang paling banyak dipilih", "Merumuskan pertanyaan: lomba apa yang paling diinginkan?", "Membagikan kuesioner kepada seluruh siswa"], answer: ["Merumuskan pertanyaan: lomba apa yang paling diinginkan?", "Membagikan kuesioner kepada seluruh siswa", "Membuat tabel frekuensi dan diagram batang", "Menentukan tiga lomba yang paling banyak dipilih"] }],
    "Formulasi pertanyaan, pengumpulan data (kuesioner), analisis data (tabel dan diagram), interpretasi hasil (memilih lomba).", { level: "Sedang" }),
  q(1, "Perhatikan tabel banyak aplikasi permainan online siswa 7C.", [{ kind: "choice", label: "Jenis data banyak aplikasi", options: KN, answer: "Numerik" }, n("Banyak siswa yang mempunyai paling sedikit 4 aplikasi:", 7 + 3 + 1)],
    "Banyak aplikasi adalah hasil menghitung, jadi numerik. 4 aplikasi 7 siswa, 5 aplikasi 3, 6 aplikasi 1: jumlah 11.", { level: "Sedang", scene: appTable }),
  // Menantang (9-17)
  q(2, "Perhatikan diagram perolehan medali emas Olimpiade 2016 dan 2020.", [{ kind: "select", label: "Negara yang medalinya naik dari 2016 ke 2020", options: medals.cats, answer: [1, 2, 4] }, { kind: "choice", label: "Runner-up tahun 2016", options: medals.cats, answer: "Inggris" }],
    "Naik: Cina 26 → 38, Jepang 12 → 27, Rusia 19 → 20. AS dan Inggris turun. Tahun 2016: AS 46, Inggris 27, Cina 26, jadi runner-up Inggris.", { level: "Menantang", scene: { type: "bars", bars: medals } }),
  q(3, "Gambarlah diagram batang dari tabel cara siswa kelas 7E berangkat ke sekolah.", [{ kind: "bars", title: "Cara Siswa ke Sekolah", cats: transport.map(t => t.c), values: transport.map(t => t.f), max: 14, step: 1 }],
    "Jalan kaki 6, angkutan umum 10, ojek online 12, kendaraan pribadi 4.", { level: "Menantang", scene: { type: "table", head: ["Cara ke sekolah", "Frekuensi"], rows: transport.map(t => [t.c, String(t.f)]) } }),
  q(4, "Lengkapi tabel penjualan kaus sebagai bahan diagram lingkaran.", [{ kind: "table", head: ["Warna", "Banyaknya", "Persen (%)", "Sudut pusat (°)"], rows: kaus.map(k => [k.name, String(k.value), null, null]), answers: kaus.flatMap(k => [(k.value / 40) * 100, (k.value / 40) * 360]) }],
    "Jumlah 40 kaus. Merah {10/40} = 25% = 90°, putih 37,5% = 135°, hitam 20% = 72°, kuning 17,5% = 63°. Jumlah sudut 360°.", { level: "Menantang" }),
  q(5, "Pasangkan setiap diagram dengan tujuannya.", [{ kind: "classify", options: ["Membandingkan jumlah", "Dua data yang berubah dari waktu ke waktu", "Bagian dari keseluruhan", "Perubahan dari waktu ke waktu"], rows: [
    { text: "Diagram 1", answer: "Perubahan dari waktu ke waktu" }, { text: "Diagram 2", answer: "Membandingkan jumlah" }, { text: "Diagram 3", answer: "Dua data yang berubah dari waktu ke waktu" }, { text: "Diagram 4", answer: "Bagian dari keseluruhan" },
  ] }], "Diagram 1 satu garis, diagram 2 batang, diagram 3 dua garis, diagram 4 lingkaran.", { level: "Menantang", scene: { type: "minis" } }),
  q(0, "Buatlah line plot dari data panjang nama berikut dengan mengetuk garis bilangan.", [{ kind: "plot", min: 8, max: 16, data: [12, 9, 14, 12, 10, 12, 15, 9, 13, 12] }],
    "9 dua kali, 10 sekali, 12 empat kali, 13 sekali, 14 sekali, 15 sekali.", { level: "Menantang", scene: { type: "raw", title: "Panjang nama 10 siswa", items: [12, 9, 14, 12, 10, 12, 15, 9, 13, 12] } }),
  q(1, "Data banyak aplikasi permainan dikumpulkan. Pertanyaan mana yang dapat dijawab dari tabel ini?", [{ kind: "tf", statements: [
    { text: "Berapa jumlah siswa kelas 7C? (dapat dijawab)", answer: true }, { text: "Berapa banyak aplikasi yang dimiliki Dillan? (dapat dijawab)", answer: false },
    { text: "Berapa aplikasi terbanyak yang dimiliki siswa? (dapat dijawab)", answer: true }, { text: "Aplikasi apa yang menjadi favorit siswa perempuan? (dapat dijawab)", answer: false },
  ] }], "Jumlah siswa dan nilai terbesar dapat dibaca dari tabel. Data setiap siswa dan jenis kelamin tidak ada di tabel.", { level: "Menantang", scene: appTable }),
  q(2, "Bella berkata, “Nilai ulanganku 3 kali lebih bagus dari nilai Eko, karena batangku 3 kali lebih panjang.”", [{ kind: "tf", statements: [{ text: "Bella benar.", answer: false }, { text: "Sumbu tegak diagram dimulai dari 40.", answer: true }] }, n("Nilai Bella sebenarnya … kali nilai Eko", 1.4)],
    "Batang dihitung dari 40 sehingga tampak 30 : 10. Nilai sebenarnya 70 : 50 = 1,4.", { level: "Menantang", scene: exam }),
  q(3, "Perhatikan diagram jumlah pengunjung taman wisata.", [n("Pengunjung tahun 2021:", 240000), n("Selisih pengunjung 2019 dan 2020:", 60000), n("Perkiraan 2022 jika pola berlanjut:", 300000)],
    "Setiap tahun bertambah 60.000: 60.000, 120.000, 180.000, 240.000, jadi 2022 sekitar 300.000.", { level: "Menantang", scene: { type: "bars", bars: visitors } }),
  q(4, "Perhatikan diagram lingkaran pemilihan ketua OSIS.", [n("Jumlah semua suara:", sum(osis.map(o => o.value))), { kind: "choice", label: "Pemenang", options: osis.map(o => o.name), answer: "Danu" }, n("Persentase suara Danu:", 35, "%"), n("Sudut pusat juring Noer:", 72, "°")],
    "21 + 15 + 6 + 12 + 6 = 60. Danu terbanyak: {21/60} = 35%. Noer: {12/60} × 360° = 72°.", { level: "Menantang", scene: pieOf("Suara Pemilihan Ketua OSIS", osis) }),
  // Sangat menantang (18-24)
  q(5, "Tabel suku bunga deposito 12 bulan: Bank P 2,50%, Bank Q 2,25%, Bank R 1,90%, Bank S 4,75%. Mengapa data ini tidak tepat ditampilkan dengan diagram lingkaran?", [
    { kind: "choice", label: "Alasan", options: ["Persennya bukan bagian dari satu keseluruhan", "Banknya terlalu sedikit", "Datanya berupa kata"], answer: "Persennya bukan bagian dari satu keseluruhan" },
    { kind: "choice", label: "Diagram yang tepat", options: charts, answer: "Diagram batang" }],
    "Jumlah persennya 11,4%, bukan 100%; setiap persen adalah nilai sendiri, bukan bagian dari keseluruhan. Untuk membandingkan antar bank, pakai diagram batang.", { level: "Sangat menantang" , scene: { type: "table", caption: "Suku bunga deposito 12 bulan", head: ["Bank", "Suku bunga"], rows: [["Bank P", "2,50%"], ["Bank Q", "2,25%"], ["Bank R", "1,90%"], ["Bank S", "4,75%"]] } }),
  q(0, "Data jumlah halaman yang dibaca 16 siswa dalam seminggu: 40, 43, 51, 46, 49, 51, 43, 57, 40, 44, 52, 48, 51, 53, 39, 42. Urutkan datanya, lalu jawab.", [n("Selisih nilai terbesar dan terkecil:", 57 - 39), n("Nilai yang paling sering muncul:", 51), n("Banyak siswa yang membaca lebih dari 50 halaman:", 6)],
    "Terbesar 57, terkecil 39, selisih 18. 51 muncul 3 kali, paling sering. Lebih dari 50: 51, 51, 51, 52, 53, dan 57, yaitu 6 siswa.", { level: "Sangat menantang", scene: { type: "raw", title: "Halaman yang dibaca", items: [40, 43, 51, 46, 49, 51, 43, 57, 40, 44, 52, 48, 51, 53, 39, 42] } }),
  q(1, "Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Kode pos termasuk data numerik karena berupa angka.", answer: false }, { text: "Suhu badan termasuk data numerik.", answer: true },
    { text: "Rata-rata nomor absen di kelas dapat dihitung dan bermakna.", answer: false }, { text: "Ukuran baju S, M, L, XL termasuk data kategorik.", answer: true },
  ] }], "Kode pos dan nomor absen hanya label, rata-ratanya tidak bermakna. Suhu badan hasil mengukur. Ukuran S–XL berupa kategori berurutan.", { level: "Sangat menantang" }),
  q(2, "Perhatikan diagram emisi CO₂ tahun 1990 dan 1998.", [n("Perubahan emisi Jerman:", -250, "juta ton"), n("Persentase penurunan emisi Jerman:", 20, "%"), { kind: "select", label: "Negara yang emisinya naik", options: co2.cats, answer: [0, 2, 3] }],
    "Jerman 1.250 → 1.000: berubah −250, yaitu {250/1250} = 20% turun. Naik: Amerika, Jepang, Kanada.", { level: "Sangat menantang", scene: { type: "bars", bars: co2 } }),
  q(3, "Pengguna internet di suatu negara 180 juta (2020) dan 200 juta (2021). Persentase yang mengakses YouTube 80% (2020) dan 90% (2021).", [n("Pengguna YouTube 2020:", 144, "juta"), n("Pengguna YouTube 2021:", 180, "juta"), n("Persentase kenaikan pengguna YouTube:", 25, "%")],
    "80% × 180 = 144 juta. 90% × 200 = 180 juta. Naik 36 juta: {36/144} × 100% = 25%, bukan 90% − 80% = 10%.", { level: "Sangat menantang" , scene: { type: "table", caption: "Pengguna internet dan YouTube", head: ["Tahun", "Pengguna internet", "Mengakses YouTube"], rows: [["2020", "180 juta", "80%"], ["2021", "200 juta", "90%"]] } }),
  q(4, "Sudut juring komponen sebuah makanan: karbohidrat 9x, protein 6x, lemak 2x, vitamin dan mineral 3x (dalam derajat).", [n("x =", 18, "°"), n("Persentase vitamin dan mineral:", 15, "%"), n("Jika karbohidratnya 135 gram, berat total makanan:", 300, "gram")],
    "9x + 6x + 2x + 3x = 20x = 360°, jadi x = 18°. Vitamin 54° = 15%. Karbohidrat 162° = 45%; 135 : 0,45 = 300 gram.",
    { level: "Sangat menantang", scene: pieOf("Komponen Makanan", nutrients.map(t => ({ name: `${t.name} (${t.k}x)`, value: t.k, color: t.color })), "none") }),
  q(5, "Perhatikan diagram perolehan medali Indonesia di SEA Games.", [{ kind: "choice", label: "Tahun dengan medali emas terbanyak", options: sea.cats, answer: "2011" }, { kind: "select", label: "Tahun ketika medali perak lebih banyak dari perunggu", options: sea.cats, answer: [0] }, { kind: "choice", label: "Tahun ketika medali emas hampir dua kali tahun sebelumnya", options: sea.cats.slice(1), answer: "2019" }],
    "Emas terbanyak 180 (2011). Perak > perunggu hanya 2011 (150 > 140). 2019: 74, hampir 2 × 38 (2017).", { level: "Sangat menantang", scene: { type: "bars", bars: sea } }),
];

/** Sumber data untuk pemeriksaan kunci jawaban. */
export const sources = { names7A, names7B, apps, quota, medals, shoes, visitors, cars, sports, co2, sea, kaus, osis, password, food, nutrients, transport };
