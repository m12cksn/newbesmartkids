import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 7 Bab 2 - Bilangan Rasional (Buku Matematika SMP/MTs Kelas VII, Kurikulum Merdeka 2022, hlm. 35-82).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 * Teks boleh memuat pecahan bersusun dengan penanda {3/4}, {-5/8}, atau {2 1/3}.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Pecahan ---------- */
export type F = [number, number];
const g = (a: number, b: number): number => (b ? g(b, a % b) : Math.abs(a));
export const red = ([n, d]: F): F => { if (d < 0) { n = -n; d = -d; } const k = g(n, d) || 1; return [n / k, d / k]; };
export const add = (a: F, b: F): F => red([a[0] * b[1] + b[0] * a[1], a[1] * b[1]]);
export const sub = (a: F, b: F): F => add(a, [-b[0], b[1]]);
export const mul = (a: F, b: F): F => red([a[0] * b[0], a[1] * b[1]]);
export const div = (a: F, b: F): F => red([a[0] * b[1], a[1] * b[0]]);
export const cmp = (a: F, b: F) => Math.sign(a[0] * b[1] - b[0] * a[1]);
export const eq = (a: F, b: F) => cmp(a, b) === 0;
export const val = (f: F) => f[0] / f[1];
/** Pecahan campuran: w n/d (tanda ikut seluruh bilangan). */
export const mixed = (w: number, n: number, d: number): F => red([Math.sign(w || 1) * (Math.abs(w) * d + n), d]);
/** "−0,35" menjadi [−7, 20]. */
export function parseDec(s: string): F | null {
  const t = s.trim().replace("−", "-").replace(".", ",");
  if (!/^-?\d+(,\d+)?$/.test(t)) return null;
  const neg = t.startsWith("-"), [a, b = ""] = t.replace("-", "").split(",");
  const r = red([Number(a + b), 10 ** b.length]);
  return neg ? [-r[0], r[1]] : r;
}
/** Desimal terbatas sebagai teks ("−0,35"), atau null jika berulang. */
export function decText(f: F): string | null {
  const [n, d] = red(f); let m = d; while (m % 2 === 0) m /= 2; while (m % 5 === 0) m /= 5;
  if (m !== 1) return null;
  let k = 0; while ((10 ** k) % d !== 0) k++;
  const s = String(Math.abs(n) * (10 ** k / d)).padStart(k + 1, "0"), whole = s.slice(0, s.length - k), frac = s.slice(s.length - k);
  return `${n < 0 ? "−" : ""}${whole}${k ? `,${frac}` : ""}`;
}
/** Pembagian bersusun: angka desimal dan sisa setiap langkah, serta letak awal pengulangan. */
export function longDivision(n: number, d: number, max = 12) {
  const whole = Math.floor(Math.abs(n) / d), digits: number[] = [], rems: number[] = [];
  let r = Math.abs(n) % d, start = -1;
  while (r && digits.length < max) { const seen = rems.indexOf(r); if (seen >= 0) { start = seen; break; } rems.push(r); digits.push(Math.floor((r * 10) / d)); r = (r * 10) % d; }
  return { neg: n < 0, whole, digits, repeatFrom: start, ends: r === 0 };
}
/** Teks pecahan biasa atau campuran untuk jawaban, misalnya "−2 1/3". */
export function fracText(f: F, asMixed = true) {
  const [n, d] = red(f), s = n < 0 ? "−" : "", a = Math.abs(n);
  if (d === 1) return `${s}${a}`;
  if (asMixed && a > d) return `${s}${Math.floor(a / d)} ${a % d}/${d}`;
  return `${s}${a}/${d}`;
}
export const fracToken = (f: F, asMixed = true) => `{${fracText(f, asMixed).replace("−", "-")}}`;

/* ---------- Gambar ---------- */
export type Scene =
  | { type: "text"; lines: string[] }
  | { type: "line"; min: number; max: number; den: number; marks: { v: F; label: string }[] }
  | { type: "storage"; parts: { name: string; gb: string; color: string }[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "tools" }
  | { type: "recipes"; items: { name: string; lines: string[] }[] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  /** Pecahan biasa atau campuran; nilai yang setara diterima. */
  | { kind: "frac"; label: string; value: F }
  /** Bilangan desimal atau bulat, boleh negatif. */
  | { kind: "dec"; label: string; value: string; unit?: string }
  | { kind: "signs"; pairs: [string, F, string, F][] }
  | { kind: "order"; label: string; options: { text: string; v: F }[]; desc?: boolean }
  /** Meletakkan titik pada garis bilangan yang dibagi `den` bagian per satuan. */
  | { kind: "place"; min: number; max: number; den: number; items: { label: string; v: F }[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "select"; label: string; options: string[]; answer: number[] }
  /** Mengarsir persegi satuan yang dibagi rows × cols. */
  | { kind: "shade"; rows: number; cols: number; r: number; c: number }
  /** Pecahan apa saja di antara dua bilangan. */
  | { kind: "between"; label: string; lo: F; hi: F; sample: F }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type RQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

export const fieldCount = (p: Part) => (p.kind === "frac" || p.kind === "between" ? 4 : p.kind === "signs" ? p.pairs.length : p.kind === "place" ? p.items.length : p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : 1);
const fracFields = (f: F) => { const [n, d] = red(f), a = Math.abs(n); return [n < 0 ? "-" : "", a > d ? String(Math.floor(a / d)) : "", String(a > d ? a % d : a), String(d)].map((x, i) => (i === 2 && a > d && a % d === 0 ? "0" : x)); };
export const orderAnswer = (p: Extract<Part, { kind: "order" }>) => [...p.options].sort((a, b) => (p.desc ? -1 : 1) * cmp(a.v, b.v)).map(o => o.text);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "frac": return fracFields(p.value);
    case "between": return fracFields(p.sample);
    case "dec": return [p.value];
    case "signs": return p.pairs.map(([, a, , b]) => [">", "=", "<"][1 - cmp(a, b)]);
    case "order": return [orderAnswer(p).join(";")];
    case "place": return p.items.map(it => String(val(it.v) * p.den));
    case "classify": return p.rows.map(r => r.answer);
    case "select": return [p.answer.join(",")];
    case "shade": return [Array.from({ length: p.rows * p.cols }, (_, k) => k).filter(k => Math.floor(k / p.cols) < p.r && k % p.cols < p.c).join(",")];
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const nat = (s: string) => (/^\d+$/.test(s) ? Number(s) : NaN);
/** Isian pecahan [tanda, bulat, pembilang, penyebut] menjadi nilai. */
export function readFrac(x: string[]): F | null {
  const w = x[1] === "" ? 0 : nat(x[1]), n = nat(x[2]), d = nat(x[3]);
  if ([w, n, d].some(Number.isNaN) || d === 0) return null;
  const f = red([w * d + n, d]);
  return x[0] === "-" ? [-f[0], f[1]] : f;
}
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "frac") { const f = readFrac(x); return !!f && eq(f, p.value); }
  if (p.kind === "between") { const f = readFrac(x); return !!f && cmp(f, p.lo) > 0 && cmp(f, p.hi) < 0; }
  if (p.kind === "dec") { const f = parseDec(v), w = parseDec(p.value)!; return !!f && eq(f, w); }
  if (p.kind === "shade") return v.split(",").filter(Boolean).length === p.r * p.c;
  if (p.kind === "order" || p.kind === "select" || p.kind === "choice") return v === fields(p)[0];
  if (p.kind === "place") return x.every((c, k) => c !== "" && Number(c) === Number(fields(p)[k]));
  return x.join("|") === fields(p).join("|");
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "frac" || p.kind === "between") return readFrac(x) !== null;
  if (p.kind === "dec") return parseDec(v) !== null;
  if (p.kind === "order") return v.split(";").filter(Boolean).length === p.options.length;
  if (p.kind === "shade" || p.kind === "select" || p.kind === "choice") return v.length > 0;
  return x.every(c => c !== "");
}
export const correct = (q: RQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: RQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const plain = (s: string) => s.replace(/\{([^}]+)\}/g, "$1").replace(/-/g, "−");
export function formatAnswer(q: RQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "frac": case "between": { const f = readFrac(x); return `${plain(p.label)} ${f ? fracText(f) : "…"}`; }
      case "dec": return `${plain(p.label)} ${v[i] ? v[i].replace("-", "−") : "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "signs": return p.pairs.map(([a, , b], k) => `${plain(a)} ${x[k] || "…"} ${plain(b)}`).join(", ");
      case "order": return v[i] ? v[i].split(";").map(plain).join("; ") : "…";
      case "place": return p.items.map((it, k) => `${plain(it.label)} di ${x[k] === "" ? "…" : fracText([Number(x[k]), p.den])}`).join(", ");
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k] || "…"}`).join(", ");
      case "select": return v[i] ? v[i].split(",").map(k => plain(p.options[Number(k)])).join(", ") : "…";
      case "shade": return `${v[i] ? v[i].split(",").filter(Boolean).length : 0} kotak diarsir`;
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return v[i] || "…";
    }
  }).join(" | ");
}

/* ---------- Data bersama ---------- */
const q = (topic: RQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): RQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const RI = ["Rasional", "Irasional"], PN = ["Positif", "Negatif"];
export const sets = ["Asli", "Cacah", "Bulat", "Rasional", "Irasional"];
export const tools = ["1/4 cangkir", "1/3 cangkir", "1/2 cangkir", "1 cangkir", "1/2 sdm", "1 sdm", "1/2 sdt", "1 sdt"];
export const storage = [
  { name: "Sistem", gb: "11,26", color: "#f08a24" }, { name: "Lainnya", gb: "9,85", color: "#2f86d6" }, { name: "Aplikasi dan data", gb: "8,47", color: "#7048e8" },
  { name: "Dokumen", gb: "1,92", color: "#e5484d" }, { name: "Gambar", gb: "1,38", color: "#f5b014" }, { name: "Sisa", gb: "0,62", color: "#2b8a3e" },
];
export const chicken = { head: ["Pakan", "Saat menetas", "Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"], rows: [["A", "44,6", "151,3", "372,8", "741,5", "1.061,2"], ["B", "40,9", "128,4", "349,6", "752,1", "1.128,7"], ["C", "47,2", "150,8", "398,4", "818,9", "1.236,0"]] };
const recipes = [{ name: "Kue Nagasari", lines: ["{1 2/3} cangkir tepung beras", "{7 1/2} sdm gula pasir"] }, { name: "Kue Talam", lines: ["{2 1/4} cangkir tepung beras", "{5 1/2} sdm gula pasir"] }, { name: "Kue Surabi", lines: ["{3/4} cangkir tepung beras", "2 sdm gula pasir"] }];

/* ---------- Materi: setiap subtopik punya beberapa bagian ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  {
    code: "A", title: "Di Antara Dua Bilangan Bulat", short: "Bilangan rasional",
    sections: [
      {
        title: "Pengertian bilangan rasional", lab: "venn",
        steps: [
          "Di antara dua bilangan bulat berurutan, misalnya 0 dan 1, masih ada bilangan lain seperti {1/2}, 0,25, atau {3/4}. Garis kecil pada termometer badan di antara 37° dan 38° menunjukkan bilangan-bilangan itu.",
          "Bilangan rasional adalah bilangan yang dapat ditulis sebagai {a/b} dengan a dan b bilangan bulat dan b ≠ 0. Contohnya {-5/12}, 7 = {7/1}, dan 0,4 = {2/5}.",
          "b tidak boleh 0 karena pembagian dengan 0 tidak menghasilkan bilangan apa pun: tidak ada bilangan yang jika dikali 0 menghasilkan 5.",
          "Bilangan asli ⊂ bilangan cacah ⊂ bilangan bulat ⊂ bilangan rasional. Bilangan yang tidak dapat ditulis sebagai {a/b}, seperti √2, π, dan e, disebut bilangan irasional. Rasional dan irasional bersama-sama membentuk bilangan real.",
          "Satu bilangan rasional dapat ditulis dengan banyak cara: −0,5 = {-1/2} = {2/-4} = {-3/6}. Semuanya bernilai sama.",
        ],
        example: "Contoh: √9 = 3, jadi √9 rasional. √10 = 3,1622776… tidak berulang, jadi irasional.",
        demo: "Pilih sebuah bilangan, lalu ketuk himpunan terkecil yang memuatnya pada diagram Venn.",
      },
      {
        title: "Pecahan dan desimal", lab: "division",
        steps: [
          "Untuk mengubah pecahan {a/b} menjadi desimal, bagi a dengan b menggunakan pembagian bersusun. Tambahkan angka 0 di belakang koma setiap kali sisa belum habis.",
          "Jika suatu saat sisanya 0, desimalnya terbatas, misalnya {3/8} = 0,375. Ini terjadi jika penyebut (setelah disederhanakan) hanya memiliki faktor prima 2 dan 5.",
          "Jika sisanya terus berulang, angka desimalnya juga berulang tanpa batas, misalnya {1/3} = 0,333… dan {5/6} = 0,8333…. Angka yang berulang diberi garis di atasnya.",
          "Untuk mengubah desimal terbatas menjadi pecahan, tulis angkanya per 10, 100, atau 1.000 sesuai banyak angka di belakang koma, lalu sederhanakan: 0,45 = {45/100} = {9/20}.",
        ],
        example: "Contoh: −1,25 = −{125/100} = {-5/4} = {-1 1/4}.",
        demo: "Atur pembilang dan penyebut. Lihat setiap langkah pembagian bersusun dan apakah desimalnya berhenti atau berulang.",
      },
    ],
  },
  {
    code: "B", title: "Membandingkan Bilangan Rasional", short: "Membandingkan",
    sections: [
      {
        title: "Bilangan rasional pada garis bilangan", lab: "line",
        steps: [
          "Untuk meletakkan {a/b} pada garis bilangan, bagi setiap jarak satu satuan menjadi b bagian sama panjang, lalu hitung a bagian dari 0 (ke kanan jika positif, ke kiri jika negatif).",
          "Pecahan campuran {1 3/4} terletak di antara 1 dan 2, tepat tiga perempat jalan dari 1 menuju 2.",
          "Desimal dapat diletakkan dengan cara yang sama: 0,6 = {6/10}, jadi bagi jarak 0 ke 1 menjadi 10 bagian.",
          "Seperti pada bilangan bulat, bilangan yang lebih ke kanan selalu lebih besar.",
        ],
        demo: "Atur pembilang dan penyebut. Garis bilangan dibagi sesuai penyebut, dan titiknya bergerak ke tempat yang tepat.",
      },
      {
        title: "Membandingkan dan mengurutkan", lab: "compare",
        steps: [
          "Pecahan berpenyebut sama dibandingkan dari pembilangnya: {4/6} > {1/6}.",
          "Untuk penyebut berbeda, samakan dulu penyebutnya dengan KPK kedua penyebut, lalu bandingkan pembilangnya. Contoh {3/5} dan {4/7}: {21/35} > {20/35}.",
          "Cara lain: ubah keduanya ke desimal. {3/5} = 0,6 dan {4/7} ≈ 0,571.",
          "Untuk bilangan negatif, yang lebih dekat ke 0 lebih besar: −0,125 < −0,05.",
          "Estimasi membantu: bandingkan dulu dengan 0, {1/2}, dan 1 sebelum menghitung.",
        ],
        demo: "Atur dua pecahan. Lihat bagaimana penyebutnya disamakan dan tanda yang tepat.",
      },
    ],
  },
  {
    code: "C", title: "Operasi Hitung Bilangan Rasional", short: "Operasi hitung",
    sections: [
      {
        title: "Estimasi dengan takaran", lab: "measure",
        steps: [
          "Estimasi adalah perkiraan yang cukup dekat. Pecahan sering dibandingkan dengan pecahan acuan seperti 0, {1/4}, {1/3}, {1/2}, dan 1.",
          "Contoh: {9/10} cangkir hampir 1 cangkir, {1/5} cangkir paling dekat dengan {1/4} cangkir.",
          "Estimasi juga dipakai sebelum menghitung untuk memeriksa apakah hasil hitungan masuk akal.",
        ],
        demo: "Pilih takaran resep, lalu ketuk cangkir atau sendok ukur yang paling mendekati.",
      },
      {
        title: "Penjumlahan dan pengurangan", lab: "addsub",
        steps: [
          "Samakan penyebut dengan KPK, lalu jumlahkan atau kurangkan pembilangnya: {5/8} + {1/4} = {5/8} + {2/8} = {7/8}.",
          "Pecahan campuran dapat dijumlahkan bagian bulat dan bagian pecahannya, atau diubah dulu menjadi pecahan biasa.",
          "Desimal dijumlahkan bersusun dengan koma sejajar. Tambahkan 0 agar banyak angka di belakang koma sama: 4,50 − 4,15 = 0,35.",
          "Jika ada pecahan dan desimal sekaligus, ubah ke satu bentuk lebih dulu: {2/5} + 0,3 = 0,4 + 0,3 = 0,7.",
        ],
        demo: "Pilih + atau −, lalu atur kedua pecahan. Langkah menyamakan penyebut ditampilkan sampai hasil paling sederhana.",
      },
      {
        title: "Perkalian", lab: "area",
        steps: [
          "Hasil kali dua pecahan = hasil kali pembilang dibagi hasil kali penyebut: {3/4} × {2/4} = {6/16} = {3/8}.",
          "Model luas: persegi 1 × 1 dibagi menurut kedua penyebut. Arsiran pertama mengambil {3/4} panjang, arsiran kedua {2/4} lebar. Daerah yang terkena keduanya adalah hasil kalinya.",
          "Aturan tanda sama dengan bilangan bulat: tanda berbeda hasilnya negatif.",
          "Pada perkalian desimal, kalikan seperti bilangan bulat, lalu banyak angka di belakang koma hasil = jumlah angka di belakang koma kedua bilangan: 2,4 × 0,2 = 0,48.",
        ],
        demo: "Atur kedua pecahan. Kotak yang terkena kedua arsiran menunjukkan hasil kali.",
      },
      {
        title: "Pembagian", lab: "divide",
        steps: [
          "Dua bilangan saling berkebalikan (resiprokal) jika hasil kalinya 1: {3/4} dan {4/3}, {-1/3} dan −3.",
          "Membagi dengan suatu pecahan sama dengan mengalikan dengan kebalikannya: {3/8} : {1/2} = {3/8} × {2/1} = {3/4}.",
          "Pembagian desimal dapat diubah ke pecahan atau ke pembagi bilangan bulat: 2,4 : 0,2 = 24 : 2 = 12.",
          "Pada operasi campuran, kerjakan dalam kurung, lalu perkalian dan pembagian, baru penjumlahan dan pengurangan.",
        ],
        demo: "Atur pembagian dua pecahan. Pembagi dibalik, lalu dikalikan.",
      },
    ],
  },
];

/* ---------- Latihan ---------- */
export const practice: RQuestion[][] = [
  [
    q(0, "Nyatakan setiap pecahan ke dalam bentuk desimal.", [{ kind: "dec", label: "{1/4} =", value: "0,25" }, { kind: "dec", label: "{-7/8} =", value: "-0,875" }, { kind: "dec", label: "{50/-4} =", value: "-12,5" }],
      "1 : 4 = 0,25. 7 : 8 = 0,875, bertanda negatif. 50 : 4 = 12,5, dan pembagian positif dengan negatif hasilnya negatif."),
    q(0, "Tentukan apakah setiap bilangan rasional atau irasional.", [{ kind: "classify", options: RI, rows: [{ text: "{18/2}", answer: "Rasional" }, { text: "{π/3}", answer: "Irasional" }, { text: "3,14", answer: "Rasional" }, { text: "√7", answer: "Irasional" }] }],
      "{18/2} = 9 dan 3,14 = {314/100} dapat ditulis sebagai {a/b}. π dan √7 tidak dapat, jadi irasional."),
    q(0, "Nyatakan bilangan berikut dalam bentuk {a/b} paling sederhana.", [{ kind: "frac", label: "0,4 =", value: [2, 5] }, { kind: "frac", label: "−1,25 =", value: [-5, 4] }],
      "0,4 = {4/10} = {2/5}. −1,25 = {-125/100} = {-5/4}."),
    q(0, "Ketuk semua pecahan yang bentuk desimalnya terbatas.", [{ kind: "select", label: "Desimal terbatas", options: ["{1/3}", "{1/8}", "{5/4}", "{1/6}", "{-1/10}", "{1/7}"], answer: [1, 2, 4] }],
      "Penyebut 8, 4, dan 10 hanya berfaktor prima 2 dan 5, jadi desimalnya terbatas. {1/3}, {1/6}, dan {1/7} berulang."),
  ],
  [
    q(1, "Gunakan tanda <, =, atau >.", [{ kind: "signs", pairs: [["{1/6}", [1, 6], "{4/6}", [4, 6]], ["{3/5}", [3, 5], "{3/8}", [3, 8]], ["−0,55", [-11, 20], "0,17", [17, 100]]] }],
      "Penyebut sama: 1 < 4. Pembilang sama: penyebut lebih kecil berarti bagian lebih besar, {3/5} > {3/8}. Negatif selalu kurang dari positif."),
    q(1, "Urutkan dari yang terkecil ke yang terbesar.", [{ kind: "order", label: "Terkecil ke terbesar", options: [{ text: "{1/2}", v: [1, 2] }, { text: "{1/5}", v: [1, 5] }, { text: "−0,45", v: [-9, 20] }, { text: "0,8", v: [4, 5] }] }],
      "−0,45 < {1/5} = 0,2 < {1/2} = 0,5 < 0,8."),
    q(1, "Letakkan bilangan-bilangan berikut pada garis bilangan.", [{ kind: "place", min: -2, max: 2, den: 4, items: [{ label: "{-1/2}", v: [-1, 2] }, { label: "{3/4}", v: [3, 4] }, { label: "{1 1/4}", v: [5, 4] }] }],
      "Setiap satuan dibagi 4. {-1/2} = {-2/4}, dua bagian ke kiri dari 0. {3/4} tiga bagian ke kanan. {1 1/4} satu bagian setelah 1."),
    q(1, "Suhu kota A −2,5°C dan kota B −8,5°C pada waktu yang sama. Kota mana yang lebih hangat?", [{ kind: "choice", label: "Lebih hangat", options: ["Kota A", "Kota B"], answer: "Kota A" }],
      "−2,5 > −8,5 karena lebih dekat ke 0, jadi kota A lebih hangat."),
  ],
  [
    q(2, "Nyatakan hasilnya dalam bentuk pecahan paling sederhana.", [{ kind: "frac", label: "{1/4} + {1/6} + {1/8} =", value: add(add([1, 4], [1, 6]), [1, 8]) }],
      "KPK 4, 6, 8 adalah 24: {6/24} + {4/24} + {3/24} = {13/24}."),
    q(2, "Tentukan hasil operasi desimal berikut.", [{ kind: "dec", label: "0,54 + 0,32 =", value: "0,86" }, { kind: "dec", label: "2,17 − 3,5 =", value: "-1,33" }],
      "0,54 + 0,32 = 0,86. 2,17 − 3,50 = −(3,50 − 2,17) = −1,33."),
    q(2, "Tentukan hasil perkalian dan pembagian berikut.", [{ kind: "frac", label: "{1 1/2} × {2/3} =", value: mul([3, 2], [2, 3]) }, { kind: "frac", label: "{1/2} : {2/3} =", value: div([1, 2], [2, 3]) }],
      "{3/2} × {2/3} = {6/6} = 1. {1/2} : {2/3} = {1/2} × {3/2} = {3/4}."),
    q(2, "Sepatu seharga Rp150.000,00 diberi diskon 70% di toko A dan 75% di toko B. Berapa potongan harga di setiap toko?", [{ kind: "dec", label: "Potongan toko A (Rp):", value: "105000" }, { kind: "dec", label: "Potongan toko B (Rp):", value: "112500" }],
      "70% = {70/100}: {70/100} × 150.000 = 105.000. 75% × 150.000 = 112.500. Toko B memberi potongan lebih besar."),
  ],
];

/* ---------- Evaluasi: 24 soal, A, B, C bergantian ---------- */
const box = (a: F, b: F, r: F) => ({ text: `${fracToken(a)} □ ${fracToken(b)} = ${fracToken(r)}`, answer: eq(add(a, b), r) ? "+" : eq(sub(a, b), r) ? "−" : eq(mul(a, b), r) ? "×" : ":" });
export const assessment: RQuestion[] = [
  // Sedang (1-8)
  q(0, "Identifikasi setiap bilangan: rasional atau irasional?", [{ kind: "classify", options: RI, rows: [
    { text: "{π/4}", answer: "Irasional" }, { text: "−√5", answer: "Irasional" }, { text: "{21/3}", answer: "Rasional" }, { text: "−√9", answer: "Rasional" }, { text: "0,4142135…", answer: "Irasional" }, { text: "{22/7}", answer: "Rasional" },
  ] }], "{21/3} = 7, −√9 = −3, dan {22/7} dapat ditulis sebagai {a/b}. π, √5, dan desimal tak berulang 0,4142135… tidak dapat ditulis sebagai {a/b}.", { level: "Sedang" }),
  q(1, "Gunakan tanda <, =, atau > agar pernyataan benar.", [{ kind: "signs", pairs: [["{2/5}", [2, 5], "{5/13}", [5, 13]], ["0,45", [9, 20], "{7/16}", [7, 16]], ["{3 1/4}", [13, 4], "3,25", [13, 4]], ["−0,15", [-3, 20], "{-1/8}", [-1, 8]]] }],
    "{2/5} = {26/65} > {25/65}. 0,45 > 0,4375. {3 1/4} = 3,25. −0,15 < −0,125 karena lebih jauh dari 0.", { level: "Sedang" }),
  q(2, "Karina menakar bahan kue. Lakukan estimasi: takaran mana yang paling mendekati setiap kebutuhan?", [{ kind: "classify", options: tools, rows: [{ text: "{3/8} sdm saus tiram", answer: "1/2 sdm" }, { text: "{7/8} cangkir kaldu", answer: "1 cangkir" }, { text: "{1/5} cangkir kecap", answer: "1/4 cangkir" }, { text: "{4/5} sdt garam", answer: "1 sdt" }] }],
    "{3/8} = 0,375 lebih dekat ke {1/2} daripada ke 0. {7/8} hampir 1. {1/5} = 0,2 paling dekat ke {1/4}. {4/5} = 0,8 lebih dekat ke 1 daripada ke {1/2}.", { level: "Sedang", scene: { type: "tools" } }),
  q(0, "Lengkapi bentuk pecahan dan desimal berikut.", [{ kind: "dec", label: "{3/8} =", value: "0,375" }, { kind: "dec", label: "{-7/20} =", value: "-0,35" }, { kind: "frac", label: "0,45 =", value: [9, 20] }, { kind: "frac", label: "−5,12 =", value: [-128, 25] }],
    "3 : 8 = 0,375. 7 : 20 = 0,35. 0,45 = {45/100} = {9/20}. −5,12 = {-512/100} = {-128/25} = {-5 3/25}.", { level: "Sedang" }),
  q(1, "Letakkan bilangan-bilangan berikut pada garis bilangan.", [{ kind: "place", min: -3, max: 2, den: 4, items: [{ label: "{-11/4}", v: [-11, 4] }, { label: "−1,5", v: [-3, 2] }, { label: "0,25", v: [1, 4] }, { label: "{1 3/4}", v: [7, 4] }] }],
    "Setiap satuan dibagi 4. {-11/4} = {-2 3/4}. −1,5 = {-6/4}. 0,25 = {1/4}. {1 3/4} tiga bagian setelah 1.", { level: "Sedang" }),
  q(2, "Tentukan hasil penjumlahan dan pengurangan berikut.", [{ kind: "frac", label: "{5/6} − {1/4} =", value: sub([5, 6], [1, 4]) }, { kind: "frac", label: "{2 1/3} + {1 3/4} =", value: add([7, 3], [7, 4]) }],
    "{10/12} − {3/12} = {7/12}. {2 4/12} + {1 9/12} = {3 13/12} = {4 1/12}.", { level: "Sedang" }),
  q(0, "Ketuk himpunan bilangan terkecil yang memuat setiap bilangan.", [{ kind: "classify", options: sets, rows: [{ text: "12", answer: "Asli" }, { text: "0", answer: "Cacah" }, { text: "−8", answer: "Bulat" }, { text: "{-3/4}", answer: "Rasional" }, { text: "√2", answer: "Irasional" }] }],
    "12 bilangan asli. 0 cacah tetapi bukan asli. −8 bulat tetapi bukan cacah. {-3/4} rasional tetapi bukan bulat. √2 irasional.", { level: "Sedang" }),
  q(1, "Adik dan kakak menerima kuota belajar yang sama. Seminggu ini adik menghabiskan 1,35 GB dan kakak {1 3/8} GB. Lalu ayah memberi adik tambahan 0,75 GB.", [
    { kind: "classify", options: PN, rows: [{ text: "Kuota kakak berkurang {1 3/8} GB", answer: "Negatif" }, { text: "Ayah memberi adik 0,75 GB", answer: "Positif" }] },
    { kind: "choice", label: "Yang menghabiskan kuota lebih banyak", options: ["Adik", "Kakak"], answer: "Kakak" }],
    "Berkurang bernilai negatif, bertambah bernilai positif. {1 3/8} = 1,375 > 1,35, jadi kakak menghabiskan lebih banyak.", { level: "Sedang" }),
  // Menantang (9-17)
  q(2, "Tentukan hasil operasi desimal berikut.", [{ kind: "dec", label: "9,5 − 4,37 =", value: "5,13" }, { kind: "dec", label: "6,2 − (2,14 + 3,48) =", value: "0,58" }, { kind: "dec", label: "(3,77 − 0,31) + (1,34 − 2,91) =", value: "1,89" }],
    "9,50 − 4,37 = 5,13. 2,14 + 3,48 = 5,62, lalu 6,20 − 5,62 = 0,58. 3,46 + (−1,57) = 1,89.", { level: "Menantang" }),
  q(0, "Ketuk semua pecahan yang bentuk desimalnya terbatas.", [{ kind: "select", label: "Desimal terbatas", options: ["{1/8}", "{2/3}", "{7/20}", "{5/6}", "{3/11}", "{9/25}", "{4/7}", "{13/40}"], answer: [0, 2, 5, 7] }],
    "Penyebut 8 = 2³, 20 = 2² × 5, 25 = 5², 40 = 2³ × 5 hanya berfaktor 2 dan 5, jadi terbatas. Penyebut 3, 6, 11, dan 7 memuat faktor lain, jadi berulang.", { level: "Menantang" }),
  q(1, "Urutkan dari yang terkecil ke yang terbesar.", [{ kind: "order", label: "Terkecil ke terbesar", options: [{ text: "0,62", v: [31, 50] }, { text: "{-3/4}", v: [-3, 4] }, { text: "{5/8}", v: [5, 8] }, { text: "−0,7", v: [-7, 10] }, { text: "0,6", v: [3, 5] }] }],
    "{-3/4} = −0,75 < −0,7 < 0,6 < 0,62 < {5/8} = 0,625.", { level: "Menantang" }),
  q(2, "Karina akan membuat ketiga kue. Hitung kebutuhan tepung beras dan sisanya jika ia membeli tepung beras setara 6 cangkir.", [{ kind: "frac", label: "Kebutuhan tepung beras (cangkir):", value: add(add([5, 3], [9, 4]), [3, 4]) }, { kind: "frac", label: "Sisa tepung beras (cangkir):", value: sub([6, 1], add(add([5, 3], [9, 4]), [3, 4])) }],
    "{1 2/3} + {2 1/4} + {3/4} = {1 8/12} + {2 3/12} + {9/12} = {3 20/12} = {4 2/3} cangkir. Sisa 6 − {4 2/3} = {1 1/3} cangkir.",
    { level: "Menantang", scene: { type: "recipes", items: recipes } }),
  q(0, "Nyatakan bilangan berikut dalam bentuk {a/b} dengan a dan b bilangan bulat dan b ≠ 0.", [{ kind: "frac", label: "−0,6 =", value: [-3, 5] }, { kind: "frac", label: "{3 1/4} =", value: [13, 4] }, { kind: "frac", label: "−2,5 =", value: [-5, 2] }],
    "−0,6 = {-6/10} = {-3/5}. {3 1/4} = {13/4}. −2,5 = {-25/10} = {-5/2}. Bentuk setara lain juga benar.", { level: "Menantang" }),
  q(1, "Ananta dan Budi memindahkan batu bata dengan jumlah yang sama. Setelah satu jam, Ananta sudah memindahkan {4/7} bagian dan Budi {5/9} bagian. Samakan penyebutnya untuk menentukan siapa yang lebih dekat selesai.", [
    { kind: "dec", label: "Penyebut yang sama (KPK):", value: "63" }, { kind: "dec", label: "Pembilang Ananta:", value: "36" }, { kind: "dec", label: "Pembilang Budi:", value: "35" },
    { kind: "choice", label: "Lebih dekat selesai", options: ["Ananta", "Budi"], answer: "Ananta" }],
    "KPK(7, 9) = 63. {4/7} = {36/63} dan {5/9} = {35/63}. 36 > 35, jadi Ananta lebih dekat selesai.", { level: "Menantang" }),
  q(2, "Lengkapi □ dengan operasi +, −, ×, atau : agar pernyataan benar.", [{ kind: "classify", options: ["+", "−", "×", ":"], rows: [box([3, 4], [1, 4], [3, 1]), box([3, 4], [1, 4], [1, 1]), box([3, 4], [1, 4], [3, 16]), box([3, 4], [1, 4], [1, 2])] }],
    "{3/4} : {1/4} = 3, {3/4} + {1/4} = 1, {3/4} × {1/4} = {3/16}, {3/4} − {1/4} = {1/2}.", { level: "Menantang" }),
  q(0, "Bilangan berapa yang ditunjukkan oleh ▲ dan ■ pada garis bilangan?", [{ kind: "frac", label: "▲ =", value: [-1, 4] }, { kind: "frac", label: "■ =", value: [7, 4] }],
    "Setiap satuan dibagi 4. ▲ satu bagian ke kiri dari 0: {-1/4}. ■ tiga bagian setelah 1: {1 3/4}.",
    { level: "Menantang", scene: { type: "line", min: -1, max: 2, den: 4, marks: [{ v: [-1, 4], label: "▲" }, { v: [7, 4], label: "■" }] } }),
  q(1, "Paman menguji tiga jenis pakan ayam. Perhatikan berat ayam (gram) setiap minggu.", [
    { kind: "choice", label: "Penambahan berat tertinggi pada minggu pertama", options: ["Pakan A", "Pakan B", "Pakan C"], answer: "Pakan A" },
    { kind: "choice", label: "Penambahan berat tertinggi selama empat minggu", options: ["Pakan A", "Pakan B", "Pakan C"], answer: "Pakan C" }],
    "Minggu pertama: A 151,3 − 44,6 = 106,7; B 128,4 − 40,9 = 87,5; C 150,8 − 47,2 = 103,6. Empat minggu: A 1.016,6; B 1.087,8; C 1.188,8.",
    { level: "Menantang", scene: { type: "table", ...chicken } }),
  // Sangat menantang (18-24)
  q(2, "Arsirlah persegi satuan untuk menunjukkan {2/3} × {3/5}, lalu tuliskan hasilnya.", [{ kind: "shade", rows: 3, cols: 5, r: 2, c: 3 }, { kind: "frac", label: "{2/3} × {3/5} =", value: mul([2, 3], [3, 5]) }],
    "Persegi dibagi 3 × 5 = 15 kotak. Daerah {2/3} kali {3/5} memuat 2 × 3 = 6 kotak, jadi hasilnya {6/15} = {2/5}.", { level: "Sangat menantang" }),
  q(0, "Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "√16 merupakan bilangan rasional.", answer: true }, { text: "√12 merupakan bilangan rasional.", answer: false }, { text: "{π/5} merupakan bilangan rasional.", answer: false },
    { text: "−0,375 merupakan bilangan rasional.", answer: true }, { text: "0,1010010001… (polanya tidak berulang) merupakan bilangan rasional.", answer: false }, { text: "Semua bilangan cacah merupakan bilangan rasional.", answer: true },
  ] }], "√16 = 4 = {4/1}. √12 tidak dapat ditulis {a/b}. π irasional, begitu pula {π/5}. −0,375 = {-3/8}. Desimal tak berulang irasional. Setiap bilangan cacah n = {n/1}.", { level: "Sangat menantang" }),
  q(1, "Perhatikan ruang penyimpanan telepon Adi (1 GB = 1.000 MB).", [
    { kind: "choice", label: "Bagian terbesar digunakan untuk", options: storage.slice(0, 5).map(s => s.name), answer: "Sistem" },
    { kind: "select", label: "Aplikasi yang masing-masing masih muat: X 250 MB, Y 600 MB, Z 700 MB", options: ["Aplikasi X", "Aplikasi Y", "Aplikasi Z"], answer: [0, 1] },
    { kind: "tf", statements: [{ text: "Aplikasi X dan Y dapat dipasang bersamaan.", answer: false }] }],
    "11,26 GB paling besar. Sisa 0,62 GB = 620 MB, jadi X (250) dan Y (600) masing-masing muat, Z (700) tidak. X + Y = 850 MB > 620 MB.", { level: "Sangat menantang", scene: { type: "storage", parts: storage } }),
  q(2, "Tentukan hasil operasi campuran berikut dalam bentuk desimal.", [{ kind: "dec", label: "1,6 : (−0,8) + {2/5} =", value: "-1,6" }, { kind: "dec", label: "{-3/4} + 0,6 × 0,5 =", value: "-0,45" }],
    "1,6 : (−0,8) = −2, lalu −2 + 0,4 = −1,6. 0,6 × 0,5 = 0,3, lalu −0,75 + 0,3 = −0,45.", { level: "Sangat menantang" }),
  q(0, "Ubah {2/7} menjadi desimal dengan pembagian bersusun. Tuliskan enam angka pertama di belakang koma.", [{ kind: "dec", label: "{2/7} ≈", value: "0,285714" }, { kind: "choice", label: "Jenis desimalnya", options: ["Terbatas", "Berulang"], answer: "Berulang" }],
    "Sisa pembagian 2, 6, 4, 5, 1, 3, lalu kembali ke 2, sehingga angka 285714 berulang terus: {2/7} = 0,285714285714….", { level: "Sangat menantang" }),
  q(1, "Tuliskan satu pecahan yang terletak di antara kedua bilangan berikut.", [{ kind: "between", label: "Di antara {2/5} dan {3/7}:", lo: [2, 5], hi: [3, 7], sample: [29, 70] }],
    "{2/5} = {28/70} dan {3/7} = {30/70}, jadi {29/70} terletak di antaranya. Pecahan lain di antara keduanya juga benar, misalnya {41/100}.", { level: "Sangat menantang" }),
  q(2, "Jawablah soal cerita berikut.", [{ kind: "dec", label: "a. Kain 22,5 m dipotong-potong 1,25 m. Banyak potongan:", value: "18" }, { kind: "dec", label: "b. Umur ayah 42 tahun dan umur Tono {2/7} umur ayah. Umur Tono (tahun):", value: "12" }, { kind: "dec", label: "c. Umur kakek 1,5 kali umur ayah. Umur kakek (tahun):", value: "63" }, { kind: "dec", label: "d. Umur ayah saat Tono lahir (tahun):", value: "30" }],
    "a. 22,5 : 1,25 = 2.250 : 125 = 18. b. {2/7} × 42 = 12. c. 1,5 × 42 = 63. d. 42 − 12 = 30.", { level: "Sangat menantang" }),
];

/** Sumber data untuk pemeriksaan kunci jawaban. */
export const sources = { storage, chicken, recipes, tools };
