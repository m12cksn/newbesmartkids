import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 7 Bab 4 - Bentuk Aljabar (Buku Matematika SMP/MTs Kelas VII, Kurikulum Merdeka 2022, hlm. 123-158).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 * Teks boleh memuat pecahan bersusun dengan penanda {1/2}.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka ---------- */
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** "−1.250,5" menjadi −1250.5. */
export const num = (s: string) => { const t = s.trim().replace("−", "-").replace(/\./g, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };
export const idn = (n: number) => { const r = Math.round(n * 1e4) / 1e4; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
/** Bentuk aljabar dari koefisien, misalnya [2, −3, 0] dengan ["x²","x",""] menjadi "2x² − 3x". */
export function polyText(coef: number[], terms: string[]) {
  const parts = coef.flatMap((c, k) => { if (!c) return []; const t = terms[k], a = Math.abs(c); return [{ neg: c < 0, s: `${t && a === 1 ? "" : idn(a)}${t}` }]; });
  if (!parts.length) return "0";
  return parts.map((p, k) => (k ? `${p.neg ? " − " : " + "}${p.s}` : `${p.neg ? "−" : ""}${p.s}`)).join("");
}

/* ---------- Gambar ---------- */
export type Scene =
  | { type: "bags"; groups: { label?: string; bags: number; cubes: number }[] }
  | { type: "matches"; counts: number[] }
  | { type: "frame"; sizes: number[] }
  | { type: "dots"; counts: number[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "text"; lines: string[] }
  | { type: "rect"; w: string; h: string; parts?: string[] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  /** Bentuk aljabar dengan koefisien di kotak: □x² + □x + □. `expr` dipakai pemeriksa untuk menjabarkan ulang. */
  | { kind: "poly"; label: string; terms: string[]; coef: number[]; expr?: string }
  /** Bentuk faktor k(px + q) dengan k faktor persekutuan terbesar. */
  | { kind: "factor"; label: string; a: number; b: number; v: string }
  /** Bentuk faktor (x + m)(x + n), urutan bebas. */
  | { kind: "binom"; label: string; m: number; n: number; v: string }
  | { kind: "num"; label: string; value: number; unit?: string }
  /** Isian tabel; null berarti sel yang harus diisi. */
  | { kind: "table"; head: string[]; rows: (string | null)[][]; answers: number[] }
  | { kind: "order"; label: string; options: string[]; answer: string[] }
  | { kind: "select"; label: string; options: string[]; answer: number[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type AQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

export const fieldCount = (p: Part) => (p.kind === "poly" ? p.terms.length : p.kind === "factor" ? 3 : p.kind === "binom" ? 2 : p.kind === "table" ? p.answers.length : p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : 1);
const n2s = (n: number) => idn(n).replace("−", "-").replace(/\./g, "");
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "poly": return p.coef.map(n2s);
    case "factor": { const g = gcd(p.a, p.b); return [String(g), n2s(p.a / g), n2s(p.b / g)]; }
    case "binom": return [n2s(p.m), n2s(p.n)];
    case "num": return [n2s(p.value)];
    case "table": return p.answers.map(n2s);
    case "order": return [p.answer.join(";")];
    case "select": return [p.answer.join(",")];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const same = (a: number, b: number) => Math.abs(a - b) < 1e-9;
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v), n = x.map(num);
  switch (p.kind) {
    case "poly": return p.coef.every((c, k) => same(n[k], c));
    case "factor": { const g = gcd(p.a, p.b); return same(n[0], g) && same(n[0] * n[1], p.a) && same(n[0] * n[2], p.b); }
    case "binom": return (same(n[0], p.m) && same(n[1], p.n)) || (same(n[0], p.n) && same(n[1], p.m));
    case "num": return same(num(v), p.value);
    case "table": return p.answers.every((a, k) => same(n[k], a));
    case "order": case "select": case "choice": return v === fields(p)[0];
    default: return x.join("|") === fields(p).join("|");
  }
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (["poly", "factor", "binom", "table"].includes(p.kind)) return x.every(c => !Number.isNaN(num(c)));
  if (p.kind === "num") return !Number.isNaN(num(v));
  if (p.kind === "order") return v.split(";").filter(Boolean).length === p.options.length;
  if (p.kind === "select" || p.kind === "choice") return v.length > 0;
  return x.every(Boolean);
}
export const correct = (q: AQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: AQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const plain = (s: string) => s.replace(/\{([^}]+)\}/g, "$1");
export function formatAnswer(q: AQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), n = x.map(num), ok = n.every(a => !Number.isNaN(a)), d = (s: string) => (Number.isNaN(num(s)) ? "…" : idn(num(s)));
    switch (p.kind) {
      case "poly": return `${plain(p.label)} ${ok ? polyText(n, p.terms) : "…"}`;
      case "factor": return `${plain(p.label)} ${ok ? `${idn(n[0])}(${polyText([n[1], n[2]], [p.v, ""])})` : "…"}`;
      case "binom": return `${plain(p.label)} ${ok ? `(${polyText([1, n[0]], [p.v, ""])})(${polyText([1, n[1]], [p.v, ""])})` : "…"}`;
      case "num": return `${plain(p.label)} ${d(v[i])}${p.unit ? ` ${p.unit}` : ""}`;
      case "table": return x.map(d).join(", ");
      case "order": return v[i] ? v[i].split(";").join(", ") : "…";
      case "select": return v[i] ? v[i].split(",").map(k => p.options[Number(k)]).join(", ") : "…";
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k] || "…"}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return v[i] || "…";
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: AQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): AQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const X2 = ["x²", "x", ""];
const lin = (label: string, coef: [number, number], expr?: string, v = "x"): Part => ({ kind: "poly", label, terms: [v, ""], coef, expr });
const EQ = ["Ekuivalen", "Tidak ekuivalen"], PROP = ["Komutatif", "Asosiatif", "Distributif"];
export const ojek = [{ name: "Gogo", admin: 4000, km: 1500 }, { name: "Gaga", admin: 0, km: 2000 }, { name: "Gugu", admin: 2500, km: 1800 }];
const ojekCost = (o: (typeof ojek)[number], k: number) => o.admin + o.km * k;
const cheapest = (k: number) => ojek.reduce((a, b) => (ojekCost(b, k) < ojekCost(a, k) ? b : a)).name;

/* ---------- Materi: setiap subtopik punya beberapa bagian ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  {
    code: "A", title: "Unsur-Unsur Bentuk Aljabar", short: "Unsur bentuk aljabar",
    sections: [
      {
        title: "Dari pola ke variabel", lab: "matches",
        steps: [
          "Nyoman menyusun persegi berjajar dari korek api. 1 persegi perlu 1 + (1 × 3) = 4 batang, 2 persegi perlu 1 + (2 × 3) = 7 batang, 3 persegi perlu 1 + (3 × 3) = 10 batang.",
          "Angka 1 dan 3 selalu tetap, sedangkan banyak persegi berubah-ubah. Bagian yang berubah kita ganti dengan huruf, misalnya n untuk banyak persegi.",
          "Banyak korek api = 1 + (n × 3) = 1 + 3n. Ekspresi yang memuat huruf seperti ini disebut bentuk aljabar, dan hurufnya disebut variabel.",
          "Tanda × antara bilangan dan variabel boleh dihilangkan dengan menulis bilangannya di depan: n × 3 ditulis 3n.",
          "Dengan bentuk aljabar kita tidak perlu menghitung satu per satu: 50 persegi perlu 1 + 3 × 50 = 151 batang.",
        ],
        example: "Al-Khawarizmi, ilmuwan abad ke-9, dijuluki Bapak Aljabar karena memakai cara ini untuk menyelesaikan persamaan.",
        demo: "Tambah atau kurangi banyak persegi. Perhatikan bagian yang tetap dan yang berubah pada perhitungan korek apinya.",
      },
      {
        title: "Suku, koefisien, variabel, konstanta", lab: "parts",
        steps: [
          "Variabel adalah huruf atau simbol untuk kuantitas yang berubah-ubah atau belum diketahui.",
          "Koefisien adalah bilangan pengali variabel. Pada −5x + 8, koefisien x adalah −5 (tandanya ikut).",
          "Konstanta adalah bilangan tanpa variabel; nilainya tetap. Pada −5x + 8, konstantanya 8.",
          "Suku adalah bagian yang dipisahkan oleh tanda + atau −. Bentuk 3x − y + 10 mempunyai tiga suku: 3x, −y, dan 10. Pada −y koefisiennya −1.",
          "Bentuk aljabar dapat memakai lebih dari satu variabel, misalnya g + l + p untuk banyak guru, siswa laki-laki, dan siswa perempuan.",
        ],
        demo: "Atur koefisien dan konstanta. Setiap unsur bentuk aljabar diberi warna dan namanya.",
      },
      {
        title: "Substitusi nilai", lab: "bags",
        steps: [
          "Substitusi berarti mengganti variabel dengan suatu bilangan, lalu menghitung nilainya.",
          "Untuk −2m + 7 dengan m = 3: −2 × 3 + 7 = −6 + 7 = 1. Kerjakan perkalian lebih dahulu.",
          "Pada gambar kantong dan kubus, x adalah banyak kubus dalam satu kantong. 3 kantong dan 1 kubus lepas ditulis 3x + 1.",
          "Nilai bentuk aljabar berubah jika nilai variabelnya berubah, sehingga hasilnya dapat disusun dalam tabel.",
        ],
        demo: "Atur banyak kantong, kubus lepas, dan isi setiap kantong. Bentuk aljabar dan nilainya dihitung langsung.",
      },
    ],
  },
  {
    code: "B", title: "Sifat-Sifat dan Operasi Aljabar", short: "Sifat dan operasi",
    sections: [
      {
        title: "Bentuk aljabar ekuivalen", lab: "pool",
        steps: [
          "Kolam renang persegi bersisi s dikelilingi ubin 1 m × 1 m. Rani menghitung 4 sisi panjang s dan 4 ubin sudut: n = 4s + 4.",
          "Rekannya menulis 4(s + 1), s + s + s + s + 4, dan 2(s + 2) + 2s. Semuanya memberi banyak ubin yang sama.",
          "Bentuk-bentuk yang selalu bernilai sama untuk setiap nilai variabel disebut ekuivalen.",
          "Substitusi beberapa nilai dapat menunjukkan bahwa dua bentuk mungkin ekuivalen, tetapi bukti yang pasti memakai sifat-sifat operasi aljabar.",
        ],
        demo: "Ubah ukuran sisi kolam. Hitung ubinnya dengan keempat cara, lalu bandingkan hasilnya.",
      },
      {
        title: "Sifat distributif: jabaran dan faktor", lab: "area",
        steps: [
          "Sifat distributif: a(b + c) = ab + ac dan a(b − c) = ab − ac.",
          "Model luas: persegi panjang selebar 30 dengan panjang x + 10 mempunyai luas 30(x + 10) = 30x + 300.",
          "a(b + c) disebut bentuk faktor, ab + ac disebut bentuk jabaran. Menjabarkan dan memfaktorkan adalah kebalikan satu sama lain.",
          "Untuk memfaktorkan, cari faktor persekutuan terbesar setiap suku: 12x + 6 = 6(2x + 1).",
          "Perkalian dua bentuk: (x + 2)(x + 3) = x² + 3x + 2x + 6 = x² + 5x + 6. Pada model luas terlihat empat bagian.",
        ],
        demo: "Atur ukuran persegi panjang. Setiap bagian dihitung luasnya, lalu dijumlahkan menjadi bentuk jabaran.",
      },
      {
        title: "Suku sejenis, komutatif, dan asosiatif", lab: "like",
        steps: [
          "Suku sejenis mempunyai variabel yang sama (dengan pangkat sama), atau sama-sama konstanta.",
          "Suku sejenis dijumlahkan dengan sifat distributif: 5x + 7x = (5 + 7)x = 12x. Suku tidak sejenis seperti 2x + 3y tidak dapat digabung.",
          "Sifat komutatif: a + b = b + a dan ab = ba. Sifat asosiatif: (a + b) + c = a + (b + c) dan (ab)c = a(bc).",
          "Untuk mengurangkan bentuk dalam kurung, kalikan setiap sukunya dengan −1: (5x − 1) − (2x + 3) = 5x − 1 − 2x − 3 = 3x − 4.",
        ],
        example: "2(y + 3) + y = 2y + 6 + y (distributif) = 2y + y + 6 (komutatif) = (2 + 1)y + 6 (distributif) = 3y + 6.",
        demo: "Atur dua bentuk aljabar dan pilih + atau −. Ubin x dan ubin satuan digabung menjadi suku-suku sejenis.",
      },
    ],
  },
  {
    code: "C", title: "Pemodelan dengan Bentuk Aljabar", short: "Pemodelan",
    sections: [
      {
        title: "Model dengan satu variabel", lab: "trip",
        steps: [
          "Jarak rumah Wisnu ke sekolah 5.000 m dan motor ayahnya melaju 15 m per detik. Jika t adalah waktu dalam detik, jarak yang ditempuh 15t meter.",
          "Jarak yang tersisa adalah 5.000 − 15t meter.",
          "Samakan satuan sebelum substitusi: 2 menit = 120 detik, jadi jarak tempuh 15 × 120 = 1.800 m dan sisanya 3.200 m.",
          "Perhatikan batas nilai variabel: setelah jarak tersisa 0, model tidak berlaku lagi.",
        ],
        demo: "Geser waktunya. Jarak tempuh dan jarak tersisa dihitung dari bentuk aljabar.",
      },
      {
        title: "Model dengan beberapa hubungan", lab: "fruits",
        steps: [
          "Jika berat jeruk t kg dan apel 3 kg lebih berat, berat apel t + 3. Belimbing 2 kg lebih ringan: t − 2.",
          "Hubungan bertingkat: anggur 5 kg lebih ringan dari belimbing, jadi (t − 2) − 5 = t − 7.",
          "Untuk mengurutkan, bandingkan konstantanya karena variabelnya sama: t − 7 < t − 2 < t < t + 3.",
          "Tidak semua nilai masuk akal: berat tidak boleh negatif, jadi t − 7 harus lebih dari 0.",
        ],
        demo: "Ubah berat jeruk. Lihat berat buah lain dan apakah semuanya masih masuk akal.",
      },
      {
        title: "Membandingkan model", lab: "ojek",
        steps: [
          "Bentuk aljabar membantu membandingkan pilihan, misalnya tarif ojek online dengan biaya administrasi tetap dan tarif per km.",
          "Gogo: 4.000 + 1.500k, Gaga: 2.000k, Gugu: 2.500 + 1.800k, dengan k jarak dalam km.",
          "Pilihan termurah dapat berubah sesuai jarak: untuk jarak dekat biaya administrasi berpengaruh besar, untuk jarak jauh tarif per km lebih menentukan.",
          "Teka-teki angka juga dapat dijelaskan dengan bentuk aljabar: pilih n, kali 2, tambah 6, bagi 2, kurangi n. Hasilnya (2n + 6) : 2 − n = 3 untuk setiap n.",
        ],
        demo: "Geser jaraknya. Biaya ketiga layanan dihitung dan yang termurah ditandai.",
      },
    ],
  },
];

/* ---------- Latihan ---------- */
export const practice: AQuestion[][] = [
  [
    q(0, "Tentukan unsur-unsur bentuk aljabar 2x − 9.", [{ kind: "num", label: "Koefisien x:", value: 2 }, { kind: "num", label: "Konstanta:", value: -9 }, { kind: "num", label: "Banyak suku:", value: 2 }],
      "Sukunya 2x dan −9. Koefisien x adalah 2, konstantanya −9 (tanda ikut)."),
    q(0, "Tentukan nilai setiap bentuk aljabar untuk m = 3.", [{ kind: "num", label: "−2m + 7 =", value: 1 }, { kind: "num", label: "10 − 5m =", value: -5 }],
      "−2 × 3 + 7 = 1. 10 − 5 × 3 = −5."),
    q(0, "Perhatikan pola persegi dari korek api. Tuliskan bentuk aljabar banyak korek api untuk n persegi, lalu hitung untuk 12 persegi.", [lin("Banyak korek api =", [3, 1], "3n+1", "n"), { kind: "num", label: "12 persegi:", value: 37, unit: "batang" }],
      "Setiap persegi menambah 3 batang dari 1 batang awal: 3n + 1. Untuk n = 12: 36 + 1 = 37.", { scene: { type: "matches", counts: [1, 2, 3] } }),
    q(0, "Total harga tiket keluarga Rahmat dinyatakan dengan 3a + 2b, dengan a harga tiket anak dan b harga tiket dewasa.", [{ kind: "num", label: "Banyak anak:", value: 3 }, { kind: "num", label: "Banyak orang dewasa:", value: 2 }, { kind: "num", label: "Total jika a = 20.000 dan b = 30.000 (Rp):", value: 120000 }],
      "Koefisien a adalah banyak anak (3), koefisien b banyak dewasa (2). 3 × 20.000 + 2 × 30.000 = 120.000."),
  ],
  [
    q(1, "Tulislah dalam bentuk jabaran.", [lin("3(x + 2) =", [3, 6], "3(x+2)"), { kind: "poly", label: "2x(x + 5) =", terms: X2, coef: [2, 10, 0], expr: "2x(x+5)" }],
      "3 × x + 3 × 2 = 3x + 6. 2x × x + 2x × 5 = 2x² + 10x; konstantanya 0."),
    q(1, "Tulislah dalam bentuk faktor.", [{ kind: "factor", label: "12x + 6 =", a: 12, b: 6, v: "x" }, { kind: "binom", label: "x² + 5x + 6 =", m: 2, n: 3, v: "x" }],
      "FPB 12 dan 6 adalah 6: 6(2x + 1). Cari dua bilangan yang jumlahnya 5 dan hasil kalinya 6: 2 dan 3, jadi (x + 2)(x + 3)."),
    q(1, "Tiga bentuk aljabar berikut ekuivalen. Mana yang tidak?", [{ kind: "choice", label: "Tidak ekuivalen", options: ["5x − 2x + 3", "3(x + 1)", "2x − 5x + 3", "3x + 3"], answer: "2x − 5x + 3" }],
      "5x − 2x + 3 = 3x + 3 dan 3(x + 1) = 3x + 3. Tetapi 2x − 5x + 3 = −3x + 3."),
    q(1, "Jabarkan, lalu jumlahkan atau kurangkan suku-suku sejenis.", [lin("(2x + 2) + (x + 5) =", [3, 7], "(2x+2)+(x+5)"), lin("7(2x + 6) − 3(3x + 8) =", [5, 18], "7(2x+6)-3(3x+8)")],
      "2x + x + 2 + 5 = 3x + 7. 14x + 42 − 9x − 24 = 5x + 18."),
  ],
  [
    q(2, "Jarak rumah Wisnu ke sekolah 5.000 m. Motor ayahnya melaju 15 m per detik. Tuliskan jarak yang tersisa setelah t detik, lalu hitung jarak yang sudah ditempuh setelah 2 menit.", [lin("Jarak tersisa =", [-15, 5000], undefined, "t"), { kind: "num", label: "Jarak ditempuh setelah 2 menit:", value: 1800, unit: "m" }],
      "Jarak ditempuh 15t, jadi sisa 5.000 − 15t = −15t + 5.000. 2 menit = 120 detik: 15 × 120 = 1.800 m."),
    q(2, "Arief membeli y buah apel. Nyoman mempunyai apel 5 kali lebih banyak dari Arief. Tuliskan bentuk aljabarnya.", [lin("Apel Nyoman =", [5, 0], undefined, "y"), lin("Apel Arief setelah memakan 2 buah =", [1, -2], undefined, "y"), lin("Total apel Arief (sebelum dimakan) dan Nyoman =", [6, 0], undefined, "y")],
      "Nyoman 5y. Arief y − 2. Total y + 5y = 6y."),
    q(2, "Berat badan Ayu p kg. Tanti 10 kg lebih ringan, Kevin 3 kg lebih ringan dari 2 kali berat Ayu, dan Winda 8 kg lebih berat dari setengah berat Ayu. Jika p = 40, berapa berat mereka?", [{ kind: "num", label: "Tanti:", value: 30, unit: "kg" }, { kind: "num", label: "Kevin:", value: 77, unit: "kg" }, { kind: "num", label: "Winda:", value: 28, unit: "kg" }],
      "Tanti p − 10 = 30. Kevin 2p − 3 = 77. Winda {1/2}p + 8 = 28."),
    q(2, "Bayu akan naik ojek online sejauh 5 km. Layanan mana yang termurah?", [{ kind: "choice", label: "Termurah", options: ojek.map(o => o.name), answer: cheapest(5) }],
      "Gogo 4.000 + 1.500 × 5 = 11.500, Gaga 2.000 × 5 = 10.000, Gugu 2.500 + 1.800 × 5 = 11.500. Gaga termurah.",
      { scene: { type: "table", head: ["Layanan", "Biaya admin (Rp)", "Tarif per km (Rp)"], rows: ojek.map(o => [o.name, idn(o.admin), idn(o.km)]) } }),
  ],
];

/* ---------- Evaluasi: 24 soal, A, B, C bergantian ---------- */
const bagSet: Scene = { type: "bags", groups: [{ label: "a", bags: 4, cubes: 3 }, { label: "b", bags: 3, cubes: 4 }, { label: "c", bags: 2, cubes: 3 }, { label: "d", bags: 3, cubes: 2 }] };
const fruits = [{ name: "Apel", c: 4 }, { name: "Belimbing", c: -1 }, { name: "Anggur", c: -4 }, { name: "Rambutan", c: -2 }, { name: "Jeruk", c: 0 }];
export const assessment: AQuestion[] = [
  // Sedang (1-8)
  q(0, "Tentukan unsur-unsur bentuk aljabar −5y + 8.", [{ kind: "num", label: "Koefisien y:", value: -5 }, { kind: "num", label: "Konstanta:", value: 8 }, { kind: "num", label: "Banyak suku:", value: 2 }, { kind: "choice", label: "Variabelnya", options: ["y", "−5", "8", "−5y"], answer: "y" }],
    "Sukunya −5y dan 8. Koefisien y adalah −5 karena tanda ikut, konstantanya 8, dan variabelnya y.", { level: "Sedang" }),
  q(1, "Tulislah dalam bentuk jabaran.", [lin("4(x + 3) =", [4, 12], "4(x+3)"), lin("6(2x − 5) =", [12, -30], "6(2x-5)")],
    "4 × x + 4 × 3 = 4x + 12. 6 × 2x − 6 × 5 = 12x − 30.", { level: "Sedang" }),
  q(2, "Total harga tiket keluarga Sinta ke taman bermain dinyatakan 4a + 3b, dengan a harga tiket anak dan b harga tiket dewasa.", [{ kind: "num", label: "Banyak anak:", value: 4 }, { kind: "num", label: "Banyak orang dewasa:", value: 3 }, { kind: "num", label: "Total jika a = 25.000 dan b = 40.000 (Rp):", value: 220000 }],
    "Koefisien a = 4 anak, koefisien b = 3 dewasa. 4 × 25.000 + 3 × 40.000 = 100.000 + 120.000 = 220.000.", { level: "Sedang" }),
  q(0, "Tentukan nilai setiap bentuk aljabar untuk m = 4.", [{ kind: "num", label: "m + 6 =", value: 10 }, { kind: "num", label: "−3m + 5 =", value: -7 }, { kind: "num", label: "12 − 2m =", value: 4 }],
    "4 + 6 = 10. −3 × 4 + 5 = −12 + 5 = −7. 12 − 8 = 4.", { level: "Sedang" }),
  q(1, "Gunakan sifat-sifat dan operasi aljabar untuk menentukan apakah setiap pasangan ekuivalen.", [{ kind: "classify", options: EQ, rows: [
    { text: "6x dan 11x − 5x", answer: "Ekuivalen" }, { text: "4(2 + 3x) − 5x dan 7x + 8", answer: "Ekuivalen" }, { text: "10x − 14x dan 4x", answer: "Tidak ekuivalen" }, { text: "7 − 2(4 − 3x) dan −1 + 6x", answer: "Ekuivalen" },
  ] }], "11x − 5x = 6x. 8 + 12x − 5x = 7x + 8. 10x − 14x = −4x, bukan 4x. 7 − 8 + 6x = −1 + 6x.", { level: "Sedang" }),
  q(2, "Jarak rumah Dita ke sekolah 6.000 m. Ia diantar dengan motor yang melaju 12 m per detik. Tuliskan jarak tersisa setelah t detik, lalu hitung jarak tersisa setelah 3 menit.", [lin("Jarak tersisa =", [-12, 6000], undefined, "t"), { kind: "num", label: "Setelah 3 menit:", value: 3840, unit: "m" }],
    "Jarak tempuh 12t, sisa 6.000 − 12t. 3 menit = 180 detik: 6.000 − 12 × 180 = 6.000 − 2.160 = 3.840 m.", { level: "Sedang" }),
  q(0, "Huruf x menyatakan banyak kubus dalam satu kantong kertas. Pasangkan setiap gambar dengan bentuk aljabarnya.", [{ kind: "classify", options: ["3x + 2", "2x + 3", "3x + 4", "4x + 3"], rows: [{ text: "Gambar a", answer: "4x + 3" }, { text: "Gambar b", answer: "3x + 4" }, { text: "Gambar c", answer: "2x + 3" }, { text: "Gambar d", answer: "3x + 2" }] }],
    "Banyak kantong menjadi koefisien x dan kubus lepas menjadi konstanta: a 4 kantong 3 kubus, b 3 kantong 4 kubus, c 2 kantong 3 kubus, d 3 kantong 2 kubus.", { level: "Sedang", scene: bagSet }),
  q(1, "Jabarkan, lalu jumlahkan atau kurangkan suku-suku sejenis.", [lin("(−7x − 4) + (2x + 9) =", [-5, 5], "(-7x-4)+(2x+9)"), lin("(15x − 8) − (6x + 5) =", [9, -13], "(15x-8)-(6x+5)")],
    "−7x + 2x − 4 + 9 = −5x + 5. 15x − 8 − 6x − 5 = 9x − 13.", { level: "Sedang" }),
  // Menantang (9-17)
  q(2, "Berat jeruk t kg. Apel 4 kg lebih berat dari jeruk, belimbing 1 kg lebih ringan dari jeruk, anggur 3 kg lebih ringan dari belimbing, dan rambutan 2 kg lebih berat dari anggur. Urutkan dari yang paling ringan, lalu hitung berat rambutan jika t = 6.", [
    { kind: "order", label: "Paling ringan ke paling berat", options: fruits.map(f => f.name), answer: [...fruits].sort((a, b) => a.c - b.c).map(f => f.name) },
    { kind: "num", label: "Berat rambutan:", value: 4, unit: "kg" }],
    "Apel t + 4, belimbing t − 1, anggur (t − 1) − 3 = t − 4, rambutan (t − 4) + 2 = t − 2. Urutan konstanta −4, −2, −1, 0, 4. Rambutan 6 − 2 = 4 kg.", { level: "Menantang" }),
  q(0, "Daerah persegi dikelilingi ubin seperti gambar. Tuliskan banyak ubin untuk ukuran n, lalu hitung untuk ukuran 15.", [lin("Banyak ubin =", [4, 0], "4n", "n"), { kind: "num", label: "Ukuran 15:", value: 60, unit: "ubin" }],
    "Ukuran 1: 4 ubin, ukuran 2: 8, ukuran 3: 12. Setiap sisi mempunyai n ubin, jadi 4n. Ukuran 15: 60 ubin.", { level: "Menantang", scene: { type: "frame", sizes: [1, 2, 3] } }),
  q(1, "Tulislah dalam bentuk faktor dengan faktor persekutuan terbesar.", [{ kind: "factor", label: "15x + 10 =", a: 15, b: 10, v: "x" }, { kind: "factor", label: "18x − 12 =", a: 18, b: -12, v: "x" }],
    "FPB 15 dan 10 adalah 5: 5(3x + 2). FPB 18 dan 12 adalah 6: 6(3x − 2).", { level: "Menantang" }),
  q(2, "Bandingkan biaya tiga layanan ojek online.", [{ kind: "choice", label: "Termurah untuk 6 km", options: ojek.map(o => o.name), answer: cheapest(6) }, { kind: "choice", label: "Termurah untuk 15 km", options: ojek.map(o => o.name), answer: cheapest(15) }, { kind: "num", label: "Biaya Gogo untuk 15 km: Rp", value: ojekCost(ojek[0], 15) }],
    "6 km: Gogo 13.000, Gaga 12.000, Gugu 13.300, Gaga termurah. 15 km: Gogo 26.500, Gaga 30.000, Gugu 29.500, Gogo termurah.",
    { level: "Menantang", scene: { type: "table", head: ["Layanan", "Biaya admin (Rp)", "Tarif per km (Rp)"], rows: ojek.map(o => [o.name, idn(o.admin), idn(o.km)]) } }),
  q(0, "Harga 1 liter minyak goreng Rp15.000,00, 1 kg beras Rp12.000,00, dan 1 kg tepung Rp14.000,00. Cakra membeli x liter minyak, y kg beras, dan z kg tepung.", [{ kind: "poly", label: "Jumlah uang =", terms: ["x", "y", "z", ""], coef: [15000, 12000, 14000, 0] }, { kind: "num", label: "Jika membeli 2 liter minyak, 3 kg beras, dan 1 kg tepung: Rp", value: 80000 }],
    "15.000x + 12.000y + 14.000z. Untuk x = 2, y = 3, z = 1: 30.000 + 36.000 + 14.000 = 80.000.", { level: "Menantang" }),
  q(1, "Lengkapi tabel nilai, lalu tentukan apakah kedua bentuk ekuivalen.", [
    { kind: "table", head: ["x", "−1", "0", "1", "2"], rows: [["(3x − 5) + (2x + 1)", null, null, null, null], ["5x − 4", null, null, null, null]], answers: [-9, -4, 1, 6, -9, -4, 1, 6] },
    { kind: "choice", label: "Kedua bentuk", options: EQ, answer: "Ekuivalen" }],
    "Nilainya sama untuk setiap x: −9, −4, 1, 6. Buktinya: 3x + 2x − 5 + 1 = 5x − 4.", { level: "Menantang" }),
  q(2, "Tinggi badan bayi Linda L cm. Endah 2 kali tinggi Linda, Rizki 13 cm lebih tinggi dari Endah, ibu 30 cm lebih pendek dari 4 kali tinggi Linda, dan ayah 30 cm lebih pendek dari 2 kali tinggi Rizki.", [lin("Tinggi ayah =", [4, -4], undefined, "L"), { kind: "num", label: "Tinggi ibu jika L = 50:", value: 170, unit: "cm" }],
    "Rizki 2L + 13. Ayah 2(2L + 13) − 30 = 4L + 26 − 30 = 4L − 4. Ibu 4 × 50 − 30 = 170 cm.", { level: "Menantang" }),
  q(0, "Informasi sekolah dinyatakan dengan variabel: g banyak guru, m banyak guru matematika, l banyak siswa laki-laki, p banyak siswa perempuan, j banyak jam pelajaran per hari. Sekolah berlangsung 5 hari seminggu. Pasangkan bentuk aljabar dengan artinya.", [{ kind: "classify", options: ["Banyak siswa", "Guru yang tidak mengajar matematika", "Jam pelajaran per minggu", "Banyak siswa untuk setiap guru"], rows: [
    { text: "g − m", answer: "Guru yang tidak mengajar matematika" }, { text: "5j", answer: "Jam pelajaran per minggu" }, { text: "l + p", answer: "Banyak siswa" }, { text: "(l + p) : g", answer: "Banyak siswa untuk setiap guru" },
  ] }], "g − m mengurangi guru matematika dari semua guru. 5j: j jam setiap hari selama 5 hari. l + p semua siswa, dan dibagi g menjadi siswa per guru.", { level: "Menantang" }),
  q(1, "Seorang siswa membuktikan bahwa 3(y + 4) + 2y ekuivalen dengan 5y + 12. Sifat apa yang dipakai pada setiap tahap?", [{ kind: "classify", options: PROP, rows: [
    { text: "(1) 3(y + 4) + 2y = 3y + 12 + 2y", answer: "Distributif" }, { text: "(2) = 3y + 2y + 12", answer: "Komutatif" }, { text: "(3) = (3 + 2)y + 12", answer: "Distributif" },
  ] }], "Tahap 1 menjabarkan 3(y + 4). Tahap 2 menukar urutan 12 dan 2y. Tahap 3 menggabungkan suku sejenis 3y + 2y = (3 + 2)y.", { level: "Menantang" }),
  // Sangat menantang (18-24)
  q(2, "Malik naik bus pulang-pergi ke sekolah setiap Senin sampai Jumat. Satu kali naik bus n rupiah, dan uang transportnya Rp60.000,00 per minggu.", [
    lin("Sisa uang di akhir minggu =", [-10, 60000], undefined, "n"), lin("Uang saat istirahat siang hari Rabu =", [-5, 60000], undefined, "n"),
    { kind: "choice", label: "Jika n = Rp7.000,00", options: ["Uang cukup dan bersisa Rp10.000,00", "Uang kurang Rp10.000,00", "Uang tepat habis"], answer: "Uang kurang Rp10.000,00" }],
    "Sehari 2 kali naik, seminggu 10 kali: sisa 60.000 − 10n. Saat istirahat Rabu sudah naik 5 kali (Senin 2, Selasa 2, Rabu pagi 1): 60.000 − 5n. Untuk n = 7.000: 60.000 − 70.000 = −10.000, jadi uangnya kurang.", { level: "Sangat menantang" }),
  q(0, "Rani menuliskan 3p + 1 untuk gambar kantong dan kubus. Lengkapi tabelnya, lalu tentukan arti angka 3.", [
    { kind: "table", head: ["p", "2", "5", "14", "40", "75"], rows: [["3p + 1", null, null, null, null, null]], answers: [7, 16, 43, 121, 226] },
    { kind: "choice", label: "Arti angka 3", options: ["Banyak kubus dalam satu kantong", "Banyak kantong", "Banyak kubus di luar kantong"], answer: "Banyak kantong" }],
    "3 × 2 + 1 = 7, 3 × 5 + 1 = 16, 3 × 14 + 1 = 43, 3 × 40 + 1 = 121, 3 × 75 + 1 = 226. Angka 3 adalah koefisien p: banyak kantong. p adalah isi satu kantong dan 1 adalah kubus lepas.",
    { level: "Sangat menantang", scene: { type: "bags", groups: [{ bags: 3, cubes: 1 }] } }),
  q(1, "Jabarkan dan faktorkan.", [{ kind: "poly", label: "(x − 3)(x + 6) =", terms: X2, coef: [1, 3, -18], expr: "(x-3)(x+6)" }, { kind: "binom", label: "x² + 7x + 12 =", m: 3, n: 4, v: "x" }],
    "x² + 6x − 3x − 18 = x² + 3x − 18. Dua bilangan yang jumlahnya 7 dan hasil kalinya 12 adalah 3 dan 4: (x + 3)(x + 4).", { level: "Sangat menantang" }),
  q(2, "Ikuti teka-teki ini: pilih bilangan n, kalikan 4, tambah 12, bagi 4, lalu kurangi dengan n.", [lin("Setelah dibagi 4 =", [1, 3], "(4n+12)/4", "n"), { kind: "num", label: "Hasil akhir selalu:", value: 3 }, { kind: "tf", statements: [{ text: "Hasil akhirnya bergantung pada bilangan yang dipilih.", answer: false }] }],
    "(4n + 12) : 4 = n + 3. Dikurangi n menjadi 3, berapa pun n.", { level: "Sangat menantang" }),
  q(0, "Perhatikan pola titik berikut. Tuliskan banyak titik pada pola ke-n, hitung pola ke-20, dan ketuk semua bentuk yang ekuivalen.", [
    lin("Banyak titik =", [4, 2], "4n+2", "n"), { kind: "num", label: "Pola ke-20:", value: 82, unit: "titik" },
    { kind: "select", label: "Bentuk yang ekuivalen dengan banyak titik", options: ["2(2n + 1)", "4(n + 2)", "n + n + n + n + 2", "6n"], answer: [0, 2] }],
    "Pola 1: 6, pola 2: 10, pola 3: 14. Setiap pola menambah 4 titik (satu di setiap lengan) dari 2 titik tengah: 4n + 2. Pola 20: 82. 2(2n + 1) = 4n + 2 dan n + n + n + n + 2 = 4n + 2; 4(n + 2) = 4n + 8 dan 6n tidak.",
    { level: "Sangat menantang", scene: { type: "dots", counts: [1, 2, 3] } }),
  q(1, "Jabarkan dan sederhanakan.", [lin("{1/2}(6x − 4) + {1/3}(3x + 9) =", [4, 1], "(1/2)(6x-4)+(1/3)(3x+9)"), lin("{1/6}(4x − 6) − {1/6}(10x + 12) =", [-1, -3], "(1/6)(4x-6)-(1/6)(10x+12)")],
    "3x − 2 + x + 3 = 4x + 1. (4x − 6 − 10x − 12) : 6 = (−6x − 18) : 6 = −x − 3.", { level: "Sangat menantang" }),
  q(2, "Panitia OSIS mendapat sponsor: 4 sponsor masing-masing Rp600.000,00; 6 sponsor masing-masing Rp800.000,00 ditambah Rp150.000,00 untuk setiap jenis lomba; 8 sponsor masing-masing Rp250.000,00 untuk setiap jenis lomba. x adalah banyak jenis lomba.", [
    lin("Total dana =", [2900000, 7200000], undefined, "x"), { kind: "num", label: "Total dana jika ada 4 jenis lomba: Rp", value: 18800000 }],
    "4 × 600.000 = 2.400.000. 6(800.000 + 150.000x) = 4.800.000 + 900.000x. 8 × 250.000x = 2.000.000x. Total 7.200.000 + 2.900.000x. Untuk x = 4: 7.200.000 + 11.600.000 = 18.800.000.", { level: "Sangat menantang" }),
];

/** Sumber data untuk pemeriksaan kunci jawaban. */
export const sources = { ojek, fruits, bagSet };
