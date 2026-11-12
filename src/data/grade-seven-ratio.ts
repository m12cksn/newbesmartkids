import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 7 Bab 3 - Rasio (Buku Matematika SMP/MTs Kelas VII, Kurikulum Merdeka 2022, hlm. 83-122).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 * Teks boleh memuat pecahan bersusun dengan penanda {3/4}.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Hitungan ---------- */
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** Rasio paling sederhana untuk bilangan desimal: 2,8 : 4,2 menjadi 2 : 3. */
export function simplest(a: number, b: number): [number, number] {
  let k = 1; while ((Math.abs(a * k - Math.round(a * k)) > 1e-9 || Math.abs(b * k - Math.round(b * k)) > 1e-9) && k < 1e6) k *= 10;
  const A = Math.round(a * k), B = Math.round(b * k), g = gcd(A, B) || 1;
  return [A / g, B / g];
}
/** "1.234,5" atau "−0,25" menjadi angka. */
export const num = (s: string) => { const t = s.trim().replace("−", "-").replace(/\./g, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };
export const idn = (n: number, digits = 2) => { const r = Math.round(n * 10 ** digits) / 10 ** digits; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };

/* ---------- Gambar ---------- */
export type Scene =
  | { type: "glasses"; groups: { label?: string; milk: number; choc: number }[] }
  | { type: "bar"; parts: { name: string; pct: number; color: string }[]; caption: string }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "pictures"; items: { label: string; w: number; h: number }[] }
  | { type: "mapScale"; km: number; cm: number }
  | { type: "plan"; w: number; h: number; drawW: number; drawH: number }
  | { type: "boxes"; items: { label: string; p: number; l: number; t: number; mass: number }[] }
  | { type: "text"; lines: string[] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  /** Rasio a : b. Jika `simplest`, harus bentuk paling sederhana; selain itu rasio setara diterima. */
  | { kind: "ratio"; label: string; a: number; b: number; simplest?: boolean; names?: [string, string] }
  /** Pecahan bagian dari keseluruhan; bentuk setara diterima. */
  | { kind: "frac"; label: string; n: number; d: number }
  /** Bilangan (boleh desimal dengan koma). `tol` untuk jawaban hasil pembulatan. */
  | { kind: "num"; label: string; value: number; unit?: string; tol?: number }
  | { kind: "order"; label: string; options: string[]; answer: string[] }
  | { kind: "select"; label: string; options: string[]; answer: number[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  /** Mengarsir juring lingkaran. */
  | { kind: "pie"; sectors: number; target: number }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type RaQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

export const fieldCount = (p: Part) => (p.kind === "ratio" || p.kind === "frac" ? 2 : p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : 1);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "ratio": { const [a, b] = p.simplest === false ? [p.a, p.b] : simplest(p.a, p.b); return [String(a), String(b)]; }
    case "frac": { const g = gcd(p.n, p.d); return [String(p.n / g), String(p.d / g)]; }
    case "num": return [String(Math.round(p.value * 1e4) / 1e4).replace(".", ",")];
    case "order": return [p.answer.join(";")];
    case "select": return [p.answer.join(",")];
    case "classify": return p.rows.map(r => r.answer);
    case "pie": return [Array.from({ length: p.target }, (_, k) => k).join(",")];
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
  if (p.kind === "ratio") { const a = num(x[0]), b = num(x[1]); if (!(a > 0 && b > 0)) return false; const [A, B] = simplest(a, b), [W, Z] = simplest(p.a, p.b); return A === W && B === Z && (!p.simplest || (a === W && b === Z)); }
  if (p.kind === "frac") { const a = num(x[0]), b = num(x[1]); return b > 0 && Number.isInteger(a) && Number.isInteger(b) && a * p.d === b * p.n; }
  if (p.kind === "num") { const a = num(v); return !Number.isNaN(a) && Math.abs(a - p.value) <= (p.tol ?? 1e-9); }
  if (p.kind === "pie") return v.split(",").filter(Boolean).length === p.target;
  if (p.kind === "order" || p.kind === "select" || p.kind === "choice") return v === fields(p)[0];
  return x.join("|") === fields(p).join("|");
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "ratio" || p.kind === "frac") return x.every(c => !Number.isNaN(num(c)));
  if (p.kind === "num") return !Number.isNaN(num(v));
  if (p.kind === "order") return v.split(";").filter(Boolean).length === p.options.length;
  if (p.kind === "pie" || p.kind === "select" || p.kind === "choice") return v.length > 0;
  return x.every(Boolean);
}
export const correct = (q: RaQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: RaQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const plain = (s: string) => s.replace(/\{([^}]+)\}/g, "$1");
export function formatAnswer(q: RaQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => s || "…";
    switch (p.kind) {
      case "ratio": return `${plain(p.label)} ${d(x[0])} : ${d(x[1])}`;
      case "frac": return `${plain(p.label)} ${d(x[0])}/${d(x[1])}`;
      case "num": return `${plain(p.label)} ${d(v[i]).replace("-", "−")}${p.unit ? ` ${p.unit}` : ""}`;
      case "order": return v[i] ? v[i].split(";").join(", ") : "…";
      case "select": return v[i] ? v[i].split(",").map(k => p.options[Number(k)]).join(", ") : "…";
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${d(x[k])}`).join(", ");
      case "pie": return `${v[i] ? v[i].split(",").filter(Boolean).length : 0} juring diarsir`;
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return d(v[i]);
    }
  }).join(" | ");
}

/* ---------- Data bersama ---------- */
const q = (topic: RaQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): RaQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const PT = ["Proporsional", "Tidak proporsional"];
export const bottles = [{ name: "Botol A", milk: 150, spoon: 6 }, { name: "Botol B", milk: 160, spoon: 8 }, { name: "Botol C", milk: 210, spoon: 7 }, { name: "Botol D", milk: 240, spoon: 8 }];
export const chocolates = [{ name: "Lezatos", g: 50, rp: 15000 }, { name: "Choko", g: 80, rp: 22000 }, { name: "Bola Kecil", g: 100, rp: 31000 }, { name: "Kakao", g: 120, rp: 30000 }];
export const cars = [{ name: "Mobil A", km: 150, l: 12 }, { name: "Mobil B", km: 176, l: 16 }, { name: "Mobil C", km: 210, l: 15 }, { name: "Mobil D", km: 260, l: 20 }];
export const islands = [{ name: "Pulau A", pop: 1620, km2: 300 }, { name: "Pulau B", pop: 1050, km2: 210 }, { name: "Pulau C", pop: 64, km2: 8 }, { name: "Pulau D", pop: 45, km2: 9 }, { name: "Pulau E", pop: 7, km2: 14 }];
export const pictures = [{ label: "Gambar A (asal)", w: 12, h: 9 }, { label: "Gambar B", w: 12, h: 15 }, { label: "Gambar C", w: 16, h: 12 }, { label: "Gambar D", w: 12, h: 6 }, { label: "Gambar E", w: 24, h: 18 }];
const tbl = (head: string[], rows: (string | number)[][], caption?: string): Scene => ({ type: "table", head, rows: rows.map(r => r.map(c => (typeof c === "number" ? idn(c) : c))), caption });

/* ---------- Materi: setiap subtopik punya beberapa bagian ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  {
    code: "A", title: "Konsep Rasio", short: "Konsep rasio",
    sections: [
      {
        title: "Rasio, pecahan, dan selisih", lab: "glasses",
        steps: [
          "Rasio adalah perbandingan dua besaran dengan satuan yang sama, ditulis a : b. Pada 4 gelas susu dan 6 gelas cokelat, rasio susu terhadap cokelat 4 : 6.",
          "Rasio ditulis dalam bentuk paling sederhana dengan membagi kedua bilangan dengan FPB-nya: 4 : 6 = 2 : 3. Artinya untuk setiap 2 gelas susu ada 3 gelas cokelat.",
          "Pecahan membandingkan bagian dengan keseluruhan: gelas susu adalah {4/10} = {2/5} dari semua gelas. Rasio membandingkan bagian dengan bagian lainnya. Tanda : pada rasio tidak dibaca sebagai pembagian.",
          "Selisih adalah perbandingan secara penjumlahan (6 − 4 = 2 gelas lebih banyak), sedangkan rasio adalah perbandingan secara perkalian (cokelat 1,5 kali susu). Selisih yang sama tidak berarti rasionya sama.",
          "Diagram kotak membantu: gambar 2 kotak untuk susu dan 3 kotak untuk cokelat yang sama besar. Jika jumlah semuanya 10 gelas, setiap kotak bernilai 2 gelas.",
        ],
        example: "Contoh: rasio berat mangga 2,8 kg terhadap jeruk 4,2 kg adalah 28 : 42 = 2 : 3.",
        demo: "Tambah atau kurangi gelas susu dan gelas cokelat. Lihat pecahan, rasio paling sederhana, selisih, dan diagram kotaknya.",
      },
      {
        title: "Rasio dalam persen", lab: "percent",
        steps: [
          "Persen adalah pecahan per seratus: 80% = {80/100}. Cokelat batang 80% cokelat murni berarti setiap 100 gram berisi 80 gram cokelat dan 20 gram bahan lain.",
          "Rasio cokelat murni terhadap bahan lain adalah 80 : 20 = 4 : 1, berapa pun berat batangnya.",
          "Untuk berat lain, kalikan persennya: pada batang 150 gram, cokelat murni = {80/100} × 150 = 120 gram.",
          "Larutan alkohol 70% berarti 70 ml alkohol dalam setiap 100 ml larutan; rasio alkohol terhadap air 70 : 30 = 7 : 3.",
        ],
        demo: "Atur persen cokelat murni dan berat batang. Lihat berat masing-masing bahan, rasio, dan diagram lingkarannya.",
      },
      {
        title: "Membandingkan kepekatan", lab: "compare",
        steps: [
          "Untuk menentukan minuman yang lebih terasa cokelatnya, bandingkan rasio cokelat terhadap susu, bukan banyaknya cokelat saja.",
          "Ubah kedua rasio ke bentuk yang mudah dibandingkan, misalnya banyak cokelat untuk setiap 1 gelas susu, atau samakan salah satu besarannya.",
          "Contoh: 2 cokelat : 1 susu berarti 2 cokelat per gelas susu, sedangkan 5 cokelat : 4 susu berarti 1,25 cokelat per gelas susu. Yang pertama lebih pekat walaupun cokelatnya lebih sedikit.",
          "Menambah jumlah yang sama pada kedua bagian umumnya mengubah rasio: 2 : 1 menjadi 3 : 2 jika masing-masing ditambah 1.",
        ],
        demo: "Atur isi dua gelas. Bandingkan banyak cokelat untuk setiap satu bagian susu, lalu lihat gelas mana yang lebih pekat.",
      },
    ],
  },
  {
    code: "B", title: "Skala", short: "Skala",
    sections: [
      {
        title: "Rasio ekuivalen dan gambar proporsional", lab: "resize",
        steps: [
          "Dua rasio ekuivalen jika nilainya sama: a : b = c : d, atau {a/b} = {c/d}. Contoh 12 : 9 = 16 : 12 karena keduanya sama dengan 4 : 3.",
          "Gambar yang diperbesar atau diperkecil tetap proporsional jika rasio panjang terhadap lebarnya tetap sama.",
          "Faktor skala adalah bilangan pengali ukuran. Gambar 12 cm × 9 cm diperbesar dengan faktor skala 1,5 menjadi 18 cm × 13,5 cm.",
          "Jika hanya panjang atau hanya lebar yang diubah, bentuknya menjadi lebih ramping atau lebih gemuk: tidak proporsional.",
        ],
        demo: "Ubah panjang dan lebar gambar. Gambar akan tampak sebanding hanya jika rasionya sama dengan gambar asal.",
      },
      {
        title: "Menyelesaikan proporsi", lab: "proportion",
        steps: [
          "Proporsi adalah persamaan dua rasio ekuivalen dengan satu nilai belum diketahui, misalnya 12 : 16 = lebar : 32.",
          "Cara pertama (di antara): bandingkan besaran yang sejenis. 16 menjadi 32 berarti dikali 2, jadi lebar juga dikali 2: 12 × 2 = 24.",
          "Cara kedua (di dalam): sederhanakan rasio dahulu. 12 : 16 = 3 : 4, artinya lebar = {3/4} × panjang = {3/4} × 32 = 24.",
          "Contoh lain: 1 kelinci makan 60 gram, maka 5 kelinci makan 5 × 60 = 300 gram.",
        ],
        demo: "Atur tiga bilangan pada proporsi. Kedua cara penyelesaian ditampilkan dan hasilnya dibandingkan.",
      },
      {
        title: "Skala peta dan denah", lab: "map",
        steps: [
          "Skala adalah rasio jarak pada gambar terhadap jarak sebenarnya dengan satuan yang sama. Skala 1 : 100 berarti 1 cm pada denah mewakili 100 cm = 1 m.",
          "Jarak sebenarnya = jarak pada peta × penyebut skala. Jarak pada peta = jarak sebenarnya : penyebut skala.",
          "Samakan satuan sebelum menghitung: 1 km = 1.000 m = 100.000 cm.",
          "Denah rumah memakai skala kecil seperti 1 : 50 atau 1 : 100. Peta pulau atau negara memakai skala sangat besar seperti 1 : 5.000.000 agar muat di kertas.",
        ],
        demo: "Pilih skala, lalu geser panjang garis pada peta. Jarak sebenarnya dihitung dalam cm, m, dan km.",
      },
    ],
  },
  {
    code: "C", title: "Laju Perubahan Satuan", short: "Laju perubahan satuan",
    sections: [
      {
        title: "Laju satuan", lab: "unitrate",
        steps: [
          "Rasio dua besaran dengan satuan berbeda disebut laju perubahan satuan, misalnya 200 ml susu untuk 4 sendok cokelat.",
          "Laju satuan adalah laju untuk 1 satuan: 200 ml : 4 sendok = 50 ml per sendok. Semakin sedikit susu per sendok cokelat, semakin pekat minumannya.",
          "Dengan membuat salah satu besaran bernilai 1, beberapa campuran mudah dibandingkan.",
          "Contoh: jus 2 gelas air dan 3 perasan jeruk memerlukan {2/3} gelas air per perasan; jus 3 gelas air dan 5 perasan memerlukan {3/5} gelas. Jus kedua lebih terasa jeruknya karena {3/5} < {2/3}.",
        ],
        demo: "Atur susu dan sendok cokelat pada setiap botol. Laju ml per sendok dihitung, dan botol paling pekat ditandai.",
      },
      {
        title: "Harga satuan", lab: "price",
        steps: [
          "Untuk membandingkan harga barang dengan ukuran berbeda, hitung harga per satu satuan: harga per gram, per kg, atau per liter.",
          "Harga satuan = harga : banyak barang. Cokelat 50 gram seharga Rp15.000,00 berharga Rp300,00 per gram.",
          "Harga yang lebih murah per satuan lebih hemat, walaupun harga totalnya lebih mahal.",
        ],
        demo: "Ubah harga atau berat salah satu cokelat. Urutan dari yang termurah per gram langsung berubah.",
      },
      {
        title: "Kepadatan, efisiensi, dan kecepatan", lab: "rates",
        steps: [
          "Kepadatan penduduk = banyak penduduk : luas wilayah (orang per km²).",
          "Efisiensi bahan bakar = jarak tempuh : bahan bakar (km per liter). Semakin besar, semakin hemat.",
          "Massa jenis = massa : volume (gram per cm³). Volume balok = panjang × lebar × tinggi.",
          "Kecepatan kerja = hasil : waktu, misalnya kg per jam pada mesin penggiling cokelat.",
        ],
        demo: "Pilih jenis laju, lalu atur kedua besarannya. Lajunya dihitung beserta artinya.",
      },
    ],
  },
];

/* ---------- Latihan ---------- */
export const practice: RaQuestion[][] = [
  [
    q(0, "Dalam satu piring ada 3 donat meses, 2 donat gula, dan 4 donat cokelat. Nyatakan rasionya dalam bentuk paling sederhana.", [{ kind: "ratio", label: "Meses : cokelat =", a: 3, b: 4, simplest: true }, { kind: "ratio", label: "Gula : cokelat =", a: 2, b: 4, simplest: true }],
      "Meses : cokelat = 3 : 4. Gula : cokelat = 2 : 4 = 1 : 2."),
    q(0, "Sebuah bingkai berukuran 90 cm × 60 cm. Berapa rasio panjang terhadap lebarnya?", [{ kind: "ratio", label: "Panjang : lebar =", a: 90, b: 60, simplest: true }],
      "90 : 60, dibagi FPB 30, menjadi 3 : 2. Untuk setiap 3 cm panjang ada 2 cm lebar."),
    q(0, "Cokelat batang berisi 65% cokelat murni dan 35% gula dan susu. Jika berat cokelat murninya 130 gram, berapa berat gula dan susunya, dan berapa rasionya?", [{ kind: "num", label: "Gula dan susu:", value: 70, unit: "gram" }, { kind: "ratio", label: "Gula dan susu : cokelat murni =", a: 35, b: 65, simplest: true }],
      "130 gram = 65%, jadi 1% = 2 gram dan 35% = 70 gram. Rasio 35 : 65 = 7 : 13."),
    q(0, "Gelas kiri berisi 2 bagian cokelat dan 1 bagian susu. Gelas kanan berisi 5 bagian cokelat dan 4 bagian susu. Gelas mana yang lebih terasa cokelatnya?", [{ kind: "choice", label: "Lebih terasa cokelat", options: ["Gelas kiri", "Gelas kanan", "Sama saja"], answer: "Gelas kiri" }],
      "Kiri: 2 cokelat per 1 susu. Kanan: {5/4} = 1,25 cokelat per 1 susu. Selisihnya sama-sama 1, tetapi rasionya berbeda; gelas kiri lebih pekat.",
      { scene: { type: "glasses", groups: [{ label: "Kiri", milk: 1, choc: 2 }, { label: "Kanan", milk: 4, choc: 5 }] } }),
  ],
  [
    q(1, "Apakah rasio 12 : 18 ekuivalen dengan 10 : 15?", [{ kind: "choice", label: "Jawaban", options: ["Ekuivalen", "Tidak ekuivalen"], answer: "Ekuivalen" }],
      "12 : 18 = 2 : 3 dan 10 : 15 = 2 : 3, jadi keduanya ekuivalen."),
    q(1, "Gambar berukuran 20 cm × 15 cm diperbesar secara proporsional sehingga panjangnya menjadi 28 cm. Berapa lebarnya?", [{ kind: "num", label: "Lebar baru:", value: 21, unit: "cm" }],
      "20 : 15 = 4 : 3. Lebar = {3/4} × 28 = 21 cm. Atau faktor skala 28 : 20 = 1,4 dan 15 × 1,4 = 21."),
    q(1, "Denah rumah berskala 1 : 100. Panjang kamar pada denah 4,5 cm. Berapa panjang kamar sebenarnya?", [{ kind: "num", label: "Panjang sebenarnya:", value: 4.5, unit: "m" }],
      "4,5 × 100 = 450 cm = 4,5 m."),
    q(1, "Tentukan apakah setiap gambar proporsional dengan gambar A berukuran 10 cm × 8 cm.", [{ kind: "classify", options: PT, rows: [{ text: "Gambar B: 10 cm × 12 cm", answer: "Tidak proporsional" }, { text: "Gambar C: 15 cm × 12 cm", answer: "Proporsional" }, { text: "Gambar D: 10 cm × 6 cm", answer: "Tidak proporsional" }] }],
      "Rasio A = 10 : 8 = 5 : 4. C = 15 : 12 = 5 : 4. B = 5 : 6 dan D = 5 : 3 berbeda."),
  ],
  [
    q(2, "Mira membuat dua jus. Jus pertama: 2 gelas air dan 3 perasan jeruk. Jus kedua: 3 gelas air dan 5 perasan jeruk. Berapa gelas air untuk setiap perasan jeruk pada masing-masing jus?", [{ kind: "frac", label: "Jus pertama:", n: 2, d: 3 }, { kind: "frac", label: "Jus kedua:", n: 3, d: 5 }, { kind: "choice", label: "Lebih terasa jeruknya", options: ["Jus pertama", "Jus kedua"], answer: "Jus kedua" }],
      "Jus pertama {2/3} gelas, jus kedua {3/5} gelas air per perasan. {3/5} < {2/3}, jadi jus kedua lebih sedikit airnya dan lebih terasa jeruknya."),
    q(2, "Toko A menjual mangga Rp30.000,00 untuk 1,2 kg. Toko B menjual Rp15.000,00 untuk 0,75 kg. Berapa harga per kg di setiap toko?", [{ kind: "num", label: "Toko A per kg: Rp", value: 25000 }, { kind: "num", label: "Toko B per kg: Rp", value: 20000 }, { kind: "choice", label: "Lebih murah", options: ["Toko A", "Toko B"], answer: "Toko B" }],
      "30.000 : 1,2 = 25.000. 15.000 : 0,75 = 20.000. Toko B lebih murah per kg."),
    q(2, "Sebuah mobil menempuh 165 km dengan 15 liter bensin. Berapa km per liter?", [{ kind: "num", label: "Efisiensi:", value: 11, unit: "km per liter" }],
      "165 : 15 = 11 km per liter."),
    q(2, "Mesin penggiling cokelat menggiling 10 kg biji cokelat dalam 8 jam. Berapa kg per jam?", [{ kind: "num", label: "Kecepatan:", value: 1.25, unit: "kg per jam" }],
      "10 : 8 = 1,25 kg per jam."),
  ],
];

/* ---------- Evaluasi: 24 soal, A, B, C bergantian ---------- */
const mlPer = (b: { milk: number; spoon: number }) => b.milk / b.spoon;
export const assessment: RaQuestion[] = [
  // Sedang (1-8)
  q(0, "Perhatikan gelas-gelas berisi susu dan cokelat berikut.", [{ kind: "frac", label: "Gelas cokelat dari seluruh gelas:", n: 9, d: 15 }, { kind: "ratio", label: "Susu : cokelat =", a: 6, b: 9, simplest: true }],
    "Ada 6 gelas susu dan 9 gelas cokelat, seluruhnya 15. Pecahan gelas cokelat {9/15} = {3/5}. Rasio susu : cokelat = 6 : 9 = 2 : 3.", { level: "Sedang", scene: { type: "glasses", groups: [{ milk: 6, choc: 9 }] } }),
  q(1, "Gambar A berukuran 12 cm × 9 cm. Tentukan apakah gambar lain proporsional dengan gambar A.", [{ kind: "classify", options: PT, rows: pictures.slice(1).map(p => ({ text: `${p.label}: ${p.w} cm × ${p.h} cm`, answer: simplest(p.w, p.h).join() === simplest(12, 9).join() ? "Proporsional" : "Tidak proporsional" })) }],
    "Rasio A = 12 : 9 = 4 : 3. C = 16 : 12 = 4 : 3 dan E = 24 : 18 = 4 : 3 proporsional. B = 4 : 5 dan D = 2 : 1 tidak.", { level: "Sedang", scene: { type: "pictures", items: pictures } }),
  q(2, "Empat botol susu cokelat dibuat dari susu cair dan bubuk cokelat. Hitung banyak susu untuk setiap sendok cokelat, lalu tentukan yang paling pekat.", [
    ...bottles.map(b => ({ kind: "num" as const, label: `${b.name}:`, value: mlPer(b), unit: "ml per sendok" })),
    { kind: "choice", label: "Paling pekat", options: bottles.map(b => b.name), answer: bottles.reduce((a, b) => (mlPer(b) < mlPer(a) ? b : a)).name }],
    "A 150 : 6 = 25, B 160 : 8 = 20, C 210 : 7 = 30, D 240 : 8 = 30 ml per sendok. Susu paling sedikit per sendok cokelat ada di botol B, jadi B paling pekat.",
    { level: "Sedang", scene: tbl(["Botol", "Susu (ml)", "Bubuk cokelat (sendok)"], bottles.map(b => [b.name, b.milk, b.spoon])) }),
  q(0, "Cokelat batang berisi 72% cokelat murni dan 28% gula. Beratnya 150 gram.", [{ kind: "num", label: "Cokelat murni:", value: 108, unit: "gram" }, { kind: "num", label: "Gula:", value: 42, unit: "gram" }, { kind: "ratio", label: "Cokelat murni : gula =", a: 72, b: 28, simplest: true }],
    "{72/100} × 150 = 108 gram; 150 − 108 = 42 gram. Rasio 72 : 28 = 18 : 7.", { level: "Sedang", scene: { type: "bar", parts: [{ name: "Cokelat murni", pct: 72, color: "#6b3a1f" }, { name: "Gula", pct: 28, color: "#f2e6c9" }], caption: "Kandungan cokelat batang" } }),
  q(1, "Sebuah gambar berukuran 18 cm × 12 cm diperbesar secara proporsional sehingga panjangnya menjadi 27 cm. Berapa lebarnya?", [{ kind: "num", label: "Lebar baru:", value: 18, unit: "cm" }],
    "Faktor skala 27 : 18 = 1,5. Lebar 12 × 1,5 = 18 cm. Atau 18 : 12 = 3 : 2, lebar = {2/3} × 27 = 18.", { level: "Sedang" }),
  q(2, "Susunlah cokelat berikut dari harga per gram yang termurah hingga termahal.", [{ kind: "order", label: "Termurah ke termahal", options: chocolates.map(c => c.name), answer: [...chocolates].sort((a, b) => a.rp / a.g - b.rp / b.g).map(c => c.name) }],
    "Per gram: Lezatos 300, Choko 275, Bola Kecil 310, Kakao 250 rupiah. Urutannya Kakao, Choko, Lezatos, Bola Kecil.",
    { level: "Sedang", scene: tbl(["Cokelat", "Berat (gram)", "Harga (Rp)"], chocolates.map(c => [c.name, c.g, c.rp])) }),
  q(0, "Ibu membeli 3,6 kg mangga dan 5,4 kg jeruk.", [{ kind: "ratio", label: "Berat mangga : jeruk =", a: 3.6, b: 5.4, simplest: true }, { kind: "tf", statements: [{ text: "Artinya, untuk setiap 2 kg mangga ada 3 kg jeruk.", answer: true }, { text: "Artinya, jeruk 2 kg lebih berat daripada mangga.", answer: false }] }],
    "3,6 : 5,4 = 36 : 54 = 2 : 3. Selisihnya 1,8 kg, bukan 2 kg; rasio tidak menyatakan selisih.", { level: "Sedang" }),
  q(1, "Satu kelinci memerlukan 75 gram makanan setiap hari.", [{ kind: "num", label: "Makanan untuk 6 kelinci:", value: 450, unit: "gram" }, { kind: "num", label: "Banyak kelinci yang dapat diberi 900 gram:", value: 12, unit: "ekor" }],
    "1 : 75 = 6 : 450. 900 : 75 = 12 kelinci.", { level: "Sedang" }),
  // Menantang (9-17)
  q(2, "Toko A menjual mangga Rp36.000,00 untuk 1,5 kg. Toko B menjual Rp17.000,00 untuk 0,8 kg.", [{ kind: "num", label: "Harga per kg toko A: Rp", value: 24000 }, { kind: "num", label: "Harga per kg toko B: Rp", value: 21250 }, { kind: "choice", label: "Lebih hemat membeli di", options: ["Toko A", "Toko B"], answer: "Toko B" }],
    "36.000 : 1,5 = 24.000. 17.000 : 0,8 = 21.250. Toko B lebih murah per kg.", { level: "Menantang" }),
  q(0, "Lengkapi rasio alkohol terhadap air untuk setiap larutan 100 ml, lalu jawab pertanyaannya.", [
    { kind: "ratio", label: "Larutan 90%: alkohol : air =", a: 90, b: 10, simplest: true }, { kind: "ratio", label: "Larutan 75%: alkohol : air =", a: 75, b: 25, simplest: true }, { kind: "ratio", label: "Larutan 60%: alkohol : air =", a: 60, b: 40, simplest: true },
    { kind: "num", label: "Volume alkohol dalam 250 ml larutan 60%:", value: 150, unit: "ml" }],
    "90 : 10 = 9 : 1, 75 : 25 = 3 : 1, 60 : 40 = 3 : 2. {60/100} × 250 = 150 ml.", { level: "Menantang" }),
  q(1, "Pada peta, garis hitam sepanjang 3 cm mewakili 150 km.", [{ kind: "num", label: "Skala peta 1 :", value: 5000000 }, { kind: "num", label: "Jarak dua kota yang di peta 27 cm:", value: 1350, unit: "km" }, { kind: "num", label: "Jarak 1.800 km pada peta:", value: 36, unit: "cm" }],
    "150 km = 15.000.000 cm, dibagi 3 = 5.000.000. 27 × 50 km = 1.350 km. 1.800 : 50 = 36 cm.", { level: "Menantang", scene: { type: "mapScale", km: 150, cm: 3 } }),
  q(2, "Perhatikan jarak tempuh dan bahan bakar empat mobil. Mobil mana yang paling hemat bahan bakar, dan berapa km per liternya?", [
    { kind: "choice", label: "Paling hemat", options: cars.map(c => c.name), answer: cars.reduce((a, b) => (b.km / b.l > a.km / a.l ? b : a)).name },
    { kind: "num", label: "Efisiensinya:", value: 14, unit: "km per liter" }],
    "A 150 : 12 = 12,5; B 176 : 16 = 11; C 210 : 15 = 14; D 260 : 20 = 13 km per liter. Mobil C paling hemat.",
    { level: "Menantang", scene: tbl(["Mobil", "Jarak tempuh (km)", "Bahan bakar (liter)"], cars.map(c => [c.name, c.km, c.l])) }),
  q(0, "Dua gelas dibuat dengan takaran berbeda: gelas kiri 3 cokelat dan 2 susu, gelas kanan 6 cokelat dan 5 susu. Tentukan benar atau salah setiap pendapat.", [{ kind: "tf", statements: [
    { text: "Rasanya sama karena selisih cokelat dan susu sama-sama 1.", answer: false },
    { text: "Gelas kanan lebih terasa cokelat karena cokelatnya lebih banyak.", answer: false },
    { text: "Gelas kiri lebih terasa cokelat karena 3 : 2 lebih besar daripada 6 : 5.", answer: true },
  ] }], "Kiri {3/2} = 1,5 cokelat per susu, kanan {6/5} = 1,2. Selisih dan banyaknya cokelat saja tidak menentukan kepekatan.",
    { level: "Menantang", scene: { type: "glasses", groups: [{ label: "Kiri", milk: 2, choc: 3 }, { label: "Kanan", milk: 5, choc: 6 }] } }),
  q(1, "Kamar berukuran 6 m × 8 m digambar pada denah berukuran 12 cm × 16 cm. Tentukan skalanya, lalu pasangkan setiap skala dengan penggunaan yang paling tepat.", [
    { kind: "num", label: "Skala denah 1 :", value: 50 },
    { kind: "classify", options: ["Denah rumah", "Peta pulau", "Peta Indonesia"], rows: [{ text: "1 : 100", answer: "Denah rumah" }, { text: "1 : 500.000", answer: "Peta pulau" }, { text: "1 : 15.000.000", answer: "Peta Indonesia" }] }],
    "6 m = 600 cm, 600 : 12 = 50, jadi 1 : 50. Skala kecil untuk benda kecil seperti rumah; skala sangat besar untuk wilayah luas.", { level: "Menantang", scene: { type: "plan", w: 6, h: 8, drawW: 12, drawH: 16 } }),
  q(2, "Tentukan pulau yang paling padat populasi komodonya dan kepadatannya.", [
    { kind: "choice", label: "Paling padat", options: islands.map(i => i.name), answer: islands.reduce((a, b) => (b.pop / b.km2 > a.pop / a.km2 ? b : a)).name },
    { kind: "num", label: "Kepadatannya:", value: 8, unit: "ekor per km²" }],
    "A 1.620 : 300 = 5,4; B 1.050 : 210 = 5; C 64 : 8 = 8; D 45 : 9 = 5; E 7 : 14 = 0,5. Pulau C paling padat.",
    { level: "Menantang", scene: tbl(["Pulau", "Populasi komodo", "Luas (km²)"], islands.map(i => [i.name, i.pop, i.km2])) }),
  q(0, "Larutan alkohol 60% berarti 60 bagian dari 100 adalah alkohol. Arsirlah lingkaran untuk menunjukkan 60%, lalu tuliskan sebagai pecahan paling sederhana.", [{ kind: "pie", sectors: 10, target: 6 }, { kind: "frac", label: "60% =", n: 60, d: 100 }],
    "Lingkaran dibagi 10 juring, setiap juring 10%. 60% = 6 juring = {60/100} = {3/5}.", { level: "Menantang" }),
  q(1, "Resep sirup lemon: 5 jeruk dan 2 sendok teh gula.", [{ kind: "num", label: "Jeruk untuk dua kali resep:", value: 10 }, { kind: "num", label: "Jeruk jika ada 8 sendok teh gula:", value: 20 }, { kind: "num", label: "Ada 7 sendok teh gula dan 15 jeruk. Sisa gula (sendok teh):", value: 1 }],
    "2 kali resep: 10 jeruk dan 4 sdt gula. 8 sdt = 4 kali resep, jadi 20 jeruk. 15 jeruk = 3 kali resep yang memerlukan 6 sdt gula, sisa 1 sdt.", { level: "Menantang" }),
  // Sangat menantang (18-24)
  q(2, "Hitung massa jenis kedua sampel, lalu tentukan yang terbesar.", [{ kind: "num", label: "Sampel A:", value: 8, unit: "gram per cm³" }, { kind: "num", label: "Sampel B:", value: 8.4, unit: "gram per cm³" }, { kind: "choice", label: "Massa jenis terbesar", options: ["Sampel A", "Sampel B"], answer: "Sampel B" }],
    "Volume A 5 × 4 × 3 = 60 cm³, 480 : 60 = 8. Volume B 5 × 5 × 2 = 50 cm³, 420 : 50 = 8,4. Sampel B lebih besar.",
    { level: "Sangat menantang", scene: { type: "boxes", items: [{ label: "Sampel A", p: 5, l: 4, t: 3, mass: 480 }, { label: "Sampel B", p: 5, l: 5, t: 2, mass: 420 }] } }),
  q(0, "Rasio siswa laki-laki terhadap perempuan di kelas 7A adalah 3 : 4 dan di kelas 7B adalah 4 : 5. Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Kedua rasio sama karena selisih laki-laki dan perempuan sama-sama 1.", answer: false },
    { text: "Bagian siswa laki-laki di kelas 7B lebih besar daripada di kelas 7A.", answer: true },
    { text: "Jika kelas 7A berisi 28 siswa, banyak siswa laki-lakinya 12.", answer: true },
  ] }], "3 : 4 ≠ 4 : 5. Laki-laki 7A {3/7} ≈ 0,43 dan 7B {4/9} ≈ 0,44. {3/7} × 28 = 12.", { level: "Sangat menantang" }),
  q(1, "Eko-enzim dibuat dari 1 takaran gula merah, 3 takaran sampah organik, dan 10 takaran air. Tersedia 4 takaran gula merah, 10 takaran sampah, dan 35 takaran air.", [{ kind: "num", label: "Banyak wadah yang dapat dibuat:", value: 3 }, { kind: "num", label: "Sisa gula merah (takaran):", value: 1 }, { kind: "num", label: "Sisa sampah (takaran):", value: 1 }, { kind: "num", label: "Sisa air (takaran):", value: 5 }],
    "Gula cukup untuk 4 wadah, sampah 10 : 3 = 3 wadah (sisa 1), air 35 : 10 = 3 wadah (sisa 5). Yang paling sedikit membatasi: 3 wadah. Gula terpakai 3, sisa 1.", { level: "Sangat menantang" }),
  q(2, "Mesin A menggiling 12 kg biji cokelat dalam 8 jam. Mesin B menggiling 90 kg dalam 6 jam.", [{ kind: "num", label: "Mesin A:", value: 1.5, unit: "kg per jam" }, { kind: "num", label: "Mesin B:", value: 15, unit: "kg per jam" }, { kind: "num", label: "Mesin B lebih cepat … kali", value: 10 }],
    "12 : 8 = 1,5 dan 90 : 6 = 15 kg per jam. 15 : 1,5 = 10 kali.", { level: "Sangat menantang" }),
  q(0, "Tali sepanjang 2,4 m dipakai tepat untuk memagari persegi panjang. Panjang dan lebarnya bilangan bulat dalam desimeter. Ketuk semua rasio panjang : lebar yang mungkin.", [{ kind: "select", label: "Rasio yang mungkin", options: ["5 : 1", "2 : 1", "3 : 1", "3 : 2", "7 : 5", "4 : 3"], answer: [0, 1, 2, 4] }],
    "2,4 m = 24 dm, jadi panjang + lebar = 12 dm. 5 : 1 → 10 dan 2; 2 : 1 → 8 dan 4; 3 : 1 → 9 dan 3; 7 : 5 → 7 dan 5. 3 : 2 dan 4 : 3 tidak menghasilkan bilangan bulat karena 12 tidak habis dibagi 5 atau 7.", { level: "Sangat menantang" }),
  q(1, "Ukuran kertas seri A bersambung: setiap ukuran adalah setengah luas ukuran sebelumnya (A0 841 × 1189 mm, A1 594 × 841, A2 420 × 594, A3 297 × 420, A4 210 × 297).", [
    { kind: "choice", label: "A4 diperbesar menjadi dua kali luasnya", options: ["A2", "A3", "A5"], answer: "A3" },
    { kind: "choice", label: "A0 diperkecil menjadi setengah luasnya", options: ["A1", "A2", "A4"], answer: "A1" },
    { kind: "tf", statements: [{ text: "Rasio panjang : lebar A4 dan A3 hampir sama, yaitu sekitar 1,41.", answer: true }] }],
    "Dua kali luas A4 adalah A3 (297 × 420). Setengah luas A0 adalah A1. 297 : 210 ≈ 1,414 dan 420 : 297 ≈ 1,414, jadi bentuknya proporsional.", { level: "Sangat menantang" }),
  q(2, "Perhatikan tiga campuran sirup merah. Campuran mana yang paling manis (paling banyak sirup untuk setiap liter air)?", [{ kind: "num", label: "Campuran 2: liter sirup per liter air", value: 4 / 3, tol: 0.01 }, { kind: "choice", label: "Paling manis", options: ["Campuran 1", "Campuran 2", "Campuran 3"], answer: "Campuran 2" }],
    "Campuran 1: {3/4} liter sirup per liter air. Campuran 2: air : sirup = 3 : 4, jadi {4/3} ≈ 1,33. Campuran 3: {3/5} campuran adalah air, sirup : air = 2 : 3 ≈ 0,67. Campuran 2 paling manis.",
    { level: "Sangat menantang", scene: { type: "text", lines: ["Campuran 1: untuk 1 liter air dicampurkan {3/4} liter sirup.", "Campuran 2: air dan sirup dicampur dengan rasio 3 : 4.", "Campuran 3: {3/5} dari campuran adalah air."] } }),
];

/** Sumber data untuk pemeriksaan kunci jawaban. */
export const sources = { bottles, chocolates, cars, islands, pictures };
