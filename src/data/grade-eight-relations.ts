/**
 * Kelas 8 Bab 4 - Relasi dan Fungsi (Buku Siswa Matematika SMP/MTs Kelas VIII, Kurikulum Merdeka 2022, hlm. 138-206).
 * A. Memahami Relasi  B. Memahami Fungsi  C. Korespondensi Satu-satu (Pengayaan)
 * Bentuk jawaban mengikuti buku: menyebutkan anggota himpunan, diagram panah, diagram Cartesius, himpunan pasangan
 * berurutan, fungsi atau bukan fungsi, tabel fungsi, rumus fungsi linier, nilai fungsi, banyak fungsi/korespondensi,
 * benar/salah, dan pilihan ganda (Uji Kompetensi A).
 * Teks matematika memakai penanda: ^{…} pangkat, {a/b} pecahan bertumpuk.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
export const fact = (n: number) => { let p = 1; for (let k = 2; k <= n; k++) p *= k; return p; };
export const label = (v: string | number) => (typeof v === "number" ? idn(v) : v);

/* ---------- Relasi ---------- */
export type Item = string | number;
export type Pair = [number, number]; // indeks anggota A, indeks anggota B
export type Rel = { A: Item[]; B: Item[]; pairs: Pair[] };
/** Bentuk relasi dari aturan: pasangan (a, b) dengan rule(a, b) benar. */
export const relate = (A: Item[], B: Item[], rule: (a: number, b: number) => boolean): Rel =>
  ({ A, B, pairs: A.flatMap((a, i) => B.flatMap((b, j) => (rule(Number(a), Number(b)) ? [[i, j] as Pair] : []))) });
export const isFunction = (r: Rel) => r.A.every((_, i) => r.pairs.filter(p => p[0] === i).length === 1);
export const isBijection = (r: Rel) => isFunction(r) && r.B.every((_, j) => r.pairs.filter(p => p[1] === j).length === 1);
export const pairKey = (p: Pair) => `${p[0]}-${p[1]}`;
export const pairsText = (r: Rel) => `{${r.pairs.map(([i, j]) => `(${label(r.A[i])}, ${label(r.B[j])})`).join("; ")}}`;

/* ---------- Gambar ---------- */
export type Scene =
  | { type: "arrow"; rel: Rel; name?: string; caption?: string }
  | { type: "plot"; rel: Rel; xName?: string; yName?: string }
  | { type: "orchard"; ns: number[] }
  | { type: "tank"; t1: number; v1: number; t2: number; v2: number }
  | { type: "taxi"; start: string; perKm: string }
  | { type: "card"; title: string; lines: string[] };

export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; pre?: string }
  | { kind: "choice"; label: string; options: string[]; answer: string; pics?: Scene[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "pick"; label: string; options: Item[]; answer: Item[] }
  | { kind: "arrows"; label: string; rel: Rel; name?: string }
  | { kind: "plot"; label: string; rel: Rel }
  | { kind: "table"; label: string; head: string; xs: Item[]; ys: number[] }
  | { kind: "linear"; label: string; f: string; a: number; b: number };

export type RQuestion = Question & { topic: 0 | 1 | 2; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "table" ? p.xs.length : p.kind === "linear" ? 2 : 1);
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => idn(n).replace(/\./g, "");
/** Jawaban himpunan: indeks pilihan terurut, dipisah koma. Jawaban relasi: pasangan "i-j" terurut, dipisah koma. */
export const normList = (v: string) => (v ? [...new Set(v.split(","))].sort((a, b) => a.localeCompare(b, "en", { numeric: true })).join(",") : "");
export const pairsOf = (v: string): Pair[] => (v ? v.split(",").map(s => s.split("-").map(Number) as Pair) : []);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "pick": return [normList(p.answer.map(a => { const i = p.options.indexOf(a); if (i < 0) throw new Error(`pilihan ${a}`); return String(i); }).join(","))];
    case "arrows": case "plot": return [normList(p.rel.pairs.map(pairKey).join(","))];
    case "table": return p.ys.map(str);
    case "linear": return [str(p.a), str(p.b)];
  }
}
const near = (a: number, b: number) => !Number.isNaN(a) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return near(num(v), p.value);
    case "table": return p.ys.every((y, k) => near(num(x[k]), y));
    case "linear": return near(num(x[0]), p.a) && near(num(x[1]), p.b);
    case "pick": case "arrows": case "plot": return normList(v) === fields(p)[0];
    default: return x.join("|") === fields(p).join("|");
  }
}
function partReady(p: Part, v: string) {
  if (p.kind === "num" || p.kind === "choice" || p.kind === "pick" || p.kind === "arrows" || p.kind === "plot") return v.trim() !== "";
  return cells(p, v).every(c => c.trim() !== "");
}
export const correct = (q: RQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: RQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
/** Teks polos untuk label aksesibel dan pembahasan. Kurung kurawal adalah lambang himpunan, jadi dibiarkan. */
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1");
export function formatAnswer(q: RQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${p.pre ?? ""}${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "choice": return `${plain(p.label)} ${v[i] || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      case "pick": return `${plain(p.label)} {${(v[i] ? normList(v[i]).split(",") : []).map(k => label(p.options[Number(k)])).join(", ")}}`;
      case "arrows": case "plot": return `${plain(p.label)} ${pairsText({ ...p.rel, pairs: pairsOf(normList(v[i])) })}`;
      case "table": return `${plain(p.label)} ${p.xs.map((xx, k) => `${p.head}(${label(xx)}) = ${x[k]}`).join(", ")}`;
      case "linear": return `${plain(p.label)} ${p.f}(x) = ${x[0]}x + (${x[1]})`;
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: RQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): RQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (lbl: string, value: number, unit?: string, pre?: string): Part => ({ kind: "num", label: lbl, value, unit, pre });
const ch = (lbl: string, options: string[], answer: string, pics?: Scene[]): Part => ({ kind: "choice", label: lbl, options, answer, pics });
const pk = (lbl: string, options: Item[], answer: Item[]): Part => ({ kind: "pick", label: lbl, options, answer });
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, k) => a + k);
const FN = ["Fungsi", "Bukan fungsi"], KS = ["Korespondensi satu-satu", "Bukan"];
const rel = (A: Item[], B: Item[], pairs: [Item, Item][]): Rel => ({ A, B, pairs: pairs.map(([a, b]) => [A.indexOf(a), B.indexOf(b)] as Pair) });

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  { code: "A", title: "Memahami Relasi", short: "Relasi", sections: [
    { title: "Himpunan dan cara menyajikannya", lab: "sets", steps: [
      "Himpunan adalah kumpulan objek yang dapat ditentukan dengan jelas. Anggotanya ditulis di dalam kurung kurawal { }. Himpunan semesta S memuat semua anggota yang sedang dibicarakan.",
      "Cara deskripsi (kata-kata): D = {bilangan ganjil antara 1 dan 15}. Cara enumerasi (mendaftar anggota): D = {3, 5, 7, 9, 11, 13}.",
      "Cara notasi pembentuk himpunan: {x | P(x)}, dibaca \"himpunan x sedemikian sehingga x memenuhi P(x)\". Contoh: {x | 1 < x < 15, x bilangan ganjil}.",
      "Banyak anggota (kardinalitas) ditulis n(A). Himpunan yang anggotanya dapat dihitung habis disebut berhingga; jika tidak, tak berhingga, misalnya {…, −2, −1, 0, 1, 2, …}.",
    ], life: "Daftar piket kelas hari Senin adalah sebuah himpunan: anggotanya jelas siapa saja. \"Siswa yang pandai bernyanyi\" bukan himpunan, karena tidak jelas batasnya. Keluarga besar Bani Madhuri memiliki 4 anak, jadi n(A) = 4, dan 8 cucu, jadi n(B) = 8.",
      example: "A = {bilangan cacah kurang dari lima} = {0, 1, 2, 3, 4} = {x | x < 5, x bilangan cacah}, n(A) = 5.",
      demo: "Atur batas dan jenis bilangan pada notasi pembentuk himpunan. Daftar anggota dan banyak anggotanya langsung terlihat." },
    { title: "Pengertian relasi: domain, kodomain, range", lab: "menu", steps: [
      "Relasi dari himpunan A ke himpunan B adalah aturan yang memasangkan anggota A dengan anggota B, misalnya \"memesan\", \"menyukai\", \"kurang dari\".",
      "Himpunan A disebut daerah asal (domain). Himpunan B disebut daerah kawan (kodomain).",
      "Anggota B yang mendapat pasangan dari A membentuk daerah hasil (range). Range selalu bagian dari kodomain.",
      "Relasi adalah himpunan bagian dari A × B, yaitu kumpulan pasangan berurutan (a, b) dengan a anggota A dan b anggota B.",
    ], life: "Andino dan teman-temannya memesan makanan di restoran: Andino soto, Natalia bakso, Taufiq sate, Panggabean bakso. Domainnya nama anak, kodomainnya semua menu, dan range-nya hanya menu yang dipesan: {bakso, sate, soto}.",
      example: "Relasi \"memesan\": {(Andino, soto), (Natalia, bakso), (Taufiq, sate), (Panggabean, bakso)}. Rawon, nasi goreng, dan rujak cingur tidak dipesan sehingga tidak termasuk range.",
      demo: "Pilih menu yang dipesan setiap anak. Pasangan berurutan, domain, kodomain, dan range diperbarui." },
    { title: "Menyajikan relasi dengan tiga cara", lab: "repr", steps: [
      "Diagram panah: anggota A di kiri, anggota B di kanan, anak panah menunjukkan pasangan.",
      "Diagram Cartesius: anggota A pada sumbu mendatar, anggota B pada sumbu tegak, noktah menunjukkan pasangan.",
      "Himpunan pasangan berurutan: tulis semua pasangan (a, b). Urutannya penting: anggota domain selalu di depan.",
      "Ketiga cara itu menyajikan relasi yang sama. Pilih yang paling mudah dibaca untuk soalnya.",
    ], life: "Data mata pelajaran favorit lima siswa dapat ditulis sebagai tabel, digambar dengan diagram panah, atau ditandai pada diagram Cartesius. Aisyah menyukai Matematika dan IPA, jadi dari Aisyah keluar dua anak panah.",
      example: "A = {2, 3, 5}, B = {1, 4, 5, 6}, relasi \"kurang dari\": {(2, 4); (2, 5); (2, 6); (3, 4); (3, 5); (3, 6); (5, 6)}. Range = {4, 5, 6}.",
      demo: "Pilih aturan relasinya. Diagram panah, diagram Cartesius, dan pasangan berurutannya digambar bersamaan." },
  ] },
  { code: "B", title: "Memahami Fungsi", short: "Fungsi", sections: [
    { title: "Ciri-ciri fungsi", lab: "isfunc", steps: [
      "Fungsi (pemetaan) adalah relasi khusus: setiap anggota daerah asal dipasangkan dengan tepat satu anggota daerah kawan.",
      "Periksa dua hal: (1) setiap anggota domain punya pasangan, (2) tidak ada anggota domain yang punya dua pasangan atau lebih.",
      "Anggota kodomain boleh tidak mendapat pasangan, dan boleh mendapat lebih dari satu pasangan.",
      "Setiap fungsi pasti relasi, tetapi tidak setiap relasi adalah fungsi.",
    ], life: "Kata sandi rahasia: setiap huruf diganti tepat satu huruf lain (A → d, B → e, …). Karena itu pesan dapat dibaca kembali. Setiap siswa duduk di tepat satu kursi, tetapi satu kursi panjang boleh diduduki beberapa siswa: relasi siswa ke kursi adalah fungsi.",
      example: "P = {1, 2, 3}, Q = {a, b}. {(1, a); (2, a); (3, b)} adalah fungsi. {(1, a); (1, b); (3, b)} bukan fungsi karena 1 punya dua pasangan dan 2 tidak punya pasangan.",
      demo: "Hubungkan anggota kiri dengan anggota kanan. Peraga memeriksa apakah relasi yang kamu buat adalah fungsi." },
    { title: "Banyak fungsi yang mungkin", lab: "count", steps: [
      "Setiap anggota domain memilih tepat satu pasangan dari n(B) anggota kodomain.",
      "Jika n(A) = a dan n(B) = b, banyak fungsi dari A ke B adalah b^{a} (b dikalikan sebanyak a kali).",
      "Banyak fungsi dari B ke A adalah a^{b}. Hasilnya biasanya berbeda.",
      "Contoh tabel: A = {a}, B = {5, 7}, C = {x, y, z}. Fungsi A ke B ada 2^{1} = 2, B ke C ada 3^{2} = 9, C ke B ada 2^{3} = 8.",
    ], life: "Tiga siswa masing-masing memilih satu dari dua ekstrakurikuler (Pramuka atau PMR). Banyak cara mereka memilih adalah 2 × 2 × 2 = 2^{3} = 8, sama dengan banyak fungsi dari himpunan siswa ke himpunan ekstrakurikuler.",
      example: "E = {p, q} dan F = {2, 3, 4}: banyak fungsi dari E ke F = 3^{2} = 9, dari F ke E = 2^{3} = 8.",
      demo: "Atur banyak anggota kedua himpunan. Banyak fungsi dihitung dan contoh pilihannya ditampilkan." },
    { title: "Lima cara menyajikan fungsi", lab: "taxi", steps: [
      "Fungsi dapat disajikan dengan diagram panah, himpunan pasangan berurutan, rumus (persamaan) fungsi, tabel, dan grafik.",
      "Notasi fungsi ditulis f: x → f(x), misalnya f: x → 2x. Rumus fungsinya f(x) = 2x.",
      "Pada f(x), x adalah variabel bebas dan f(x) atau y adalah variabel terikat.",
      "Rumus ditemukan dari pola: tarif taksi 7.500 + 1 × 3.000, 7.500 + 2 × 3.000, …, sehingga B(x) = 3.000x + 7.500.",
    ], life: "Tarif taksi: biaya awal Rp7.500,00 dan Rp3.000,00 per kilometer. Perjalanan 20 km membayar Rp67.500,00. Paket data, ongkos kirim per kilogram, dan tarif parkir per jam juga mengikuti rumus seperti ini.",
      example: "Fungsi \"setengah kali dari\" dari P = {1, 2, 3, 4, 5}: pasangan {(1, 2); (2, 4); (3, 6); (4, 8); (5, 10)}, rumus f(x) = 2x, tabel x → f(x), dan grafiknya titik-titik pada garis lurus.",
      demo: "Atur tarif awal, tarif per kilometer, dan jarak. Tabel, rumus, dan grafik tarif taksi berubah bersama." },
    { title: "Nilai fungsi dan daerah hasil", lab: "value", steps: [
      "Nilai fungsi didapat dengan menyubstitusikan nilai x ke rumus. Untuk f(x) = 4x − 3, f(2) = 4(2) − 3 = 5.",
      "Daerah hasil (range) adalah kumpulan semua nilai fungsi dari anggota domain.",
      "Jika nilai fungsinya diketahui, cari x dengan persamaan: f(x) = 3x + 1 = −2, jadi x = −1.",
      "Fungsi f(x) = ax + b disebut fungsi linier; grafiknya titik-titik pada sebuah garis lurus.",
    ], life: "Penjual pulsa menjual pulsa dengan harga f(x) = x + 2.000 untuk nominal x. Pulsa Rp25.000,00 dijual f(25.000) = Rp27.000,00. Dari harga jual kita juga bisa mencari nominal pulsanya.",
      example: "f(x) = 4x − 3 dengan domain {−2, −1, 0, 1, 2, 3}: range {−11, −7, −3, 1, 5, 9}.",
      demo: "Atur a dan b pada f(x) = ax + b. Tabel nilai, daerah hasil, dan grafik pada domain {−2, …, 3} ditampilkan." },
    { title: "Menentukan rumus fungsi linier", lab: "two", steps: [
      "Fungsi linier f(x) = ax + b ditentukan oleh dua nilai yang diketahui.",
      "Tulis dua persamaan. Contoh: f(−1) = −4 memberi −a + b = −4, dan f(2) = 5 memberi 2a + b = 5.",
      "Kurangkan kedua persamaan untuk mencari a, lalu substitusikan untuk mencari b: a = 3, b = −1, jadi f(x) = 3x − 1.",
      "Periksa dengan memasukkan kedua nilai x ke rumus yang didapat.",
    ], life: "Bak mandi berisi 23 liter setelah 3 menit dan 47 liter setelah 7 menit. Dengan V(t) = V₀ + at: dalam 4 menit bertambah 24 liter, jadi a = 6 liter/menit dan V₀ = 23 − 18 = 5 liter.",
      example: "f(−3) = −15 dan f(3) = 9: 6a = 24, a = 4, b = −3. f(x) = 4x − 3, sehingga f(−2) + f(2) = −11 + 5 = −6.",
      demo: "Atur dua titik yang diketahui. Langkah eliminasi, nilai a dan b, dan garisnya ditampilkan." },
  ] },
  { code: "C", title: "Korespondensi Satu-satu (Pengayaan)", short: "Korespondensi satu-satu", sections: [
    { title: "Pengertian korespondensi satu-satu", lab: "one", steps: [
      "Korespondensi satu-satu adalah fungsi khusus: setiap anggota A berpasangan dengan tepat satu anggota B, dan setiap anggota B berpasangan dengan tepat satu anggota A.",
      "Syarat perlunya n(A) = n(B). Tetapi banyak anggota sama saja belum cukup; pasangannya juga harus tepat satu-satu.",
      "Korespondensi satu-satu dapat dibalik: relasi dari B ke A juga fungsi.",
      "Setiap korespondensi satu-satu pasti fungsi dan relasi, tetapi tidak setiap fungsi adalah korespondensi satu-satu.",
    ], life: "Setiap rumah di satu perumahan punya nomor rumah sendiri, dan tidak ada dua rumah dengan nomor yang sama. Nomor induk siswa (NISN), nomor kursi pesawat, dan pelat nomor kendaraan juga contoh korespondensi satu-satu.",
      example: "Ahmad 219, As'ari 279, Tohir 292, Taufiq 258, Wati 224. Relasi \"nomor induk\" dari siswa ke nomor dan \"pemilik nomor\" dari nomor ke siswa keduanya fungsi.",
      demo: "Hubungkan setiap siswa dengan nomor induknya. Peraga memeriksa apakah pasanganmu korespondensi satu-satu." },
    { title: "Banyak korespondensi satu-satu", lab: "fact", steps: [
      "Jika n(A) = n(B) = n, anggota pertama A punya n pilihan pasangan, anggota kedua n − 1 pilihan, dan seterusnya.",
      "Banyak korespondensi satu-satu adalah n! = n × (n − 1) × (n − 2) × … × 2 × 1 (dibaca n faktorial).",
      "Contoh: 3! = 6, 4! = 24, 5! = 120, 6! = 720.",
      "Jika n(A) ≠ n(B), tidak ada korespondensi satu-satu dari A ke B.",
    ], life: "Lima siswa akan duduk di lima kursi berderet. Banyak cara mereka duduk adalah 5! = 120 cara, sama dengan banyak korespondensi satu-satu dari siswa ke kursi.",
      example: "M = {x | −3 < x < 4, x bilangan bulat} = {−2, −1, 0, 1, 2, 3} dan N = {x | x < 7, x bilangan asli}: n = 6, banyak korespondensi 6! = 720.",
      demo: "Atur banyak anggota n. Nilai n! dihitung dan, untuk n kecil, semua susunan pasangannya ditampilkan." },
  ] },
];

/* ---------- Relasi bantu untuk soal ---------- */
const lessThan = relate([1, 3, 4], [2, 3, 5], (a, b) => a < b);
const lessThan2 = relate([2, 4], [3, 4, 5, 6], (a, b) => a < b);
const factorOf = relate([1, 2, 3, 4], [4, 6, 8], (a, b) => b % a === 0);
const family = rel(["Pak Hasan", "Pak Joko"], ["Dina", "Eko", "Fani", "Gita", "Hadi"], [["Pak Hasan", "Dina"], ["Pak Hasan", "Eko"], ["Pak Hasan", "Fani"], ["Pak Joko", "Gita"], ["Pak Joko", "Hadi"]]);
const nis = rel(["Rina", "Budi", "Sari", "Tono"], [305, 312, 327, 341], [["Rina", 327], ["Budi", 305], ["Sari", 341], ["Tono", 312]]);
const squares = rel([1, 4, 16, 25], [1, 2, 3, 4, 5], [[1, 1], [4, 2], [16, 4], [25, 5]]);
const half = relate([1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6], (a, b) => b === 2 * a);
const L = ["a", "b", "c", "d"], R = ["p", "q", "r", "s"];
const diag = (pairs: [string, string][], A = L, B = R): Scene => ({ type: "arrow", rel: rel(A, B, pairs) });

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: RQuestion[][] = [
  [
    q(0, "Diketahui A = {x | −2 < x < 4, x bilangan bulat}. Ketuk semua anggota A, lalu tentukan n(A).", [pk("A =", range(-3, 5), range(-1, 3)), n("n(A) =", 5)],
      "Bilangan bulat yang lebih dari −2 dan kurang dari 4: −1, 0, 1, 2, 3. Batas −2 dan 4 tidak termasuk. n(A) = 5."),
    q(0, "Rani suka menari dan melukis. Bima suka futsal dan melukis. Citra suka melukis dan renang. Dodi suka renang saja. Anak yang suka renang tetapi tidak suka melukis adalah …", [ch("Jawaban:", ["Rani", "Bima", "Citra", "Dodi"], "Dodi")],
      "Yang suka renang: Citra dan Dodi. Citra juga suka melukis, jadi jawabannya Dodi.", { scene: { type: "card", title: "Kesukaan", lines: ["Rani: menari, melukis", "Bima: futsal, melukis", "Citra: melukis, renang", "Dodi: renang"] } }),
    q(0, "Diketahui A = {1, 3, 4}, B = {2, 3, 5}, dan relasi dari A ke B adalah \"kurang dari\". Buat diagram panahnya dengan menghubungkan anggota A ke anggota B.", [{ kind: "arrows", label: "Diagram panah \"kurang dari\":", rel: lessThan, name: "kurang dari" }],
      "1 < 2, 1 < 3, 1 < 5; 3 < 5; 4 < 5. Jadi pasangannya {(1, 2); (1, 3); (1, 5); (3, 5); (4, 5)}."),
    q(0, "Perhatikan diagram panah berikut. Aturan relasi dari himpunan kiri ke himpunan kanan yang tepat adalah …", [ch("Aturan relasi:", ["akar dari", "kuadrat dari", "dua kali dari", "setengah dari"], "kuadrat dari")],
      "1 = 1^{2}, 4 = 2^{2}, 16 = 4^{2}, 25 = 5^{2}. Setiap anggota kiri adalah kuadrat dari pasangannya. 3 tidak mendapat pasangan.", { scene: { type: "arrow", rel: squares } }),
  ],
  [
    q(1, "P = {1, 2, 3} dan Q = {a, b}. Tentukan apakah setiap himpunan pasangan berurutan dari P ke Q adalah fungsi.", [{ kind: "classify", options: FN, rows: [
      { text: "{(1, a); (2, b); (3, b)}", answer: "Fungsi" }, { text: "{(1, a); (1, b); (3, b)}", answer: "Bukan fungsi" },
      { text: "{(1, b); (2, b); (3, b)}", answer: "Fungsi" }, { text: "{(2, a); (2, b); (3, a)}", answer: "Bukan fungsi" }] }],
      "Fungsi jika 1, 2, dan 3 masing-masing muncul tepat satu kali di depan. Baris kedua: 1 dua kali, 2 tidak ada. Baris keempat: 2 dua kali, 1 tidak ada."),
    q(1, "Diketahui E = {p, q} dan F = {2, 3, 4}.", [n("Banyak fungsi dari E ke F =", 9), n("Banyak fungsi dari F ke E =", 8)],
      "Dari E ke F: setiap anggota E punya 3 pilihan, 3^{2} = 9. Dari F ke E: 2^{3} = 8."),
    q(1, "Fungsi f(x) = 3x − 4 memiliki daerah asal {6, 8, 10, 12}. Lengkapi tabel nilai fungsinya.", [{ kind: "table", label: "Tabel f(x) = 3x − 4:", head: "f", xs: [6, 8, 10, 12], ys: [14, 20, 26, 32] }],
      "f(6) = 18 − 4 = 14, f(8) = 20, f(10) = 26, f(12) = 32. Daerah hasilnya {14, 20, 26, 32}."),
    q(1, "Fungsi h(x) = ax + 9 bernilai −6 untuk x = 3.", [n("a =", -5), n("h(6) =", -21)],
      "3a + 9 = −6, 3a = −15, a = −5. h(x) = −5x + 9, sehingga h(6) = −30 + 9 = −21."),
  ],
  [
    q(2, "Tentukan apakah setiap himpunan pasangan berurutan berikut korespondensi satu-satu.", [{ kind: "classify", options: KS, rows: [
      { text: "{(1, 1); (2, 2); (3, 3)}", answer: "Korespondensi satu-satu" }, { text: "{(2, 2); (2, 4); (2, 6)}", answer: "Bukan" },
      { text: "{(5, 6); (6, 7); (7, 5)}", answer: "Korespondensi satu-satu" }, { text: "{(1, p); (2, q); (3, p)}", answer: "Bukan" }] }],
      "Baris kedua: 2 punya tiga pasangan. Baris keempat: p dipasangkan dua kali. Baris pertama dan ketiga: setiap anggota kiri dan kanan muncul tepat sekali."),
    q(2, "Tentukan banyak korespondensi satu-satu yang mungkin dari A ke B.", [n("n(A) = n(B) = 5:", 120), n("n(A) = n(B) = 7:", 5040)],
      "5! = 5 × 4 × 3 × 2 × 1 = 120. 7! = 7 × 6 × 120 = 5.040."),
    q(2, "Hubungkan setiap siswa dengan nomor induknya. Nomor induk Rina 327, Budi 305, Sari 341, dan Tono 312.", [{ kind: "arrows", label: "Diagram panah \"nomor induk\":", rel: nis, name: "nomor induk" }],
      "Setiap siswa punya tepat satu nomor, dan setiap nomor dimiliki tepat satu siswa: korespondensi satu-satu."),
    q(2, "Pasangan himpunan manakah yang dapat dibuat korespondensi satu-satu?", [ch("Jawaban:", ["{nama hari dalam seminggu} dan {nama bulan dalam setahun}", "{huruf vokal} dan {bilangan cacah antara 1 dan 7}", "{bilangan genap kurang dari 10} dan {bilangan prima kurang dari 12}", "{faktor dari 8} dan {faktor dari 12}"], "{huruf vokal} dan {bilangan cacah antara 1 dan 7}")],
      "Huruf vokal {a, i, u, e, o} dan {2, 3, 4, 5, 6} sama-sama 5 anggota. Pilihan lain: 7 dan 12, 4 dan 5, 4 dan 6."),
  ],
];

/* ---------- Evaluasi: 24 soal, A B C bergantian ---------- */
const oneToOneOpts: Scene[] = [
  diag([["a", "p"], ["b", "p"], ["c", "q"], ["d", "r"]]),
  diag([["a", "q"], ["b", "s"], ["c", "p"], ["d", "r"]]),
  diag([["a", "p"], ["a", "q"], ["b", "r"], ["c", "s"], ["d", "s"]]),
  diag([["a", "p"], ["b", "q"], ["c", "r"]], L, ["p", "q", "r"]),
];
export const assessment: RQuestion[] = [
  // Sedang (1-8)
  q(0, "Diketahui B = {x | −3 < x < 3, x bilangan bulat}. Nyatakan B dengan cara enumerasi: ketuk semua anggotanya.", [pk("B =", range(-4, 4), range(-2, 2))],
    "Bilangan bulat yang lebih dari −3 dan kurang dari 3: −2, −1, 0, 1, 2.", { level: "Sedang" }),
  q(1, "Diketahui himpunan pasangan berurutan: (i) {(0, 0); (3, 1); (6, 2); (9, 3)}, (ii) {(1, 2); (2, 2); (1, 5); (2, 5)}, (iii) {(1, 7); (2, 7); (3, 7); (4, 7)}, (iv) {(6, 1); (6, 2); (5, 1); (5, 2)}. Yang merupakan pemetaan (fungsi) adalah …", [ch("Jawaban:", ["(i) dan (ii)", "(ii) dan (iv)", "(i) dan (iii)", "(iii) dan (iv)"], "(i) dan (iii)")],
    "(i) dan (iii): setiap anggota depan muncul sekali. (ii): 1 dan 2 masing-masing dua pasangan. (iv): 6 dan 5 masing-masing dua pasangan.", { level: "Sedang" }),
  q(2, "Diketahui K = {a, b, c, d, e, f} dan L = {1, 2, 3, 4, 5, 6}. Tentukan banyak korespondensi satu-satu dari K ke L.", [n("Banyak korespondensi =", 720)],
    "n(K) = n(L) = 6, jadi 6! = 6 × 5 × 4 × 3 × 2 × 1 = 720.", { level: "Sedang" }),
  q(0, "Lina suka membaca dan menyanyi. Rudi suka catur dan berenang. Maya suka menyanyi dan berenang. Fajar suka berenang saja. Anak yang suka menyanyi tetapi tidak suka membaca adalah …", [ch("Jawaban:", ["Lina", "Maya", "Rudi", "Fajar"], "Maya")],
    "Yang suka menyanyi: Lina dan Maya. Lina juga suka membaca, jadi jawabannya Maya.", { level: "Sedang", scene: { type: "card", title: "Kesukaan", lines: ["Lina: membaca, menyanyi", "Rudi: catur, berenang", "Maya: menyanyi, berenang", "Fajar: berenang"] } }),
  q(1, "Fungsi f(x) = 5 − 3x memiliki daerah asal {−2, −1, 0, 1, 2, 3}. Lengkapi tabelnya.", [{ kind: "table", label: "Tabel f(x) = 5 − 3x:", head: "f", xs: [-2, -1, 0, 1, 2, 3], ys: [11, 8, 5, 2, -1, -4] }],
    "f(−2) = 5 + 6 = 11, f(−1) = 8, f(0) = 5, f(1) = 2, f(2) = −1, f(3) = −4.", { level: "Sedang" }),
  q(2, "Tentukan apakah setiap himpunan pasangan berurutan berikut korespondensi satu-satu.", [{ kind: "classify", options: KS, rows: [
    { text: "{(1, x); (2, y); (3, z)}", answer: "Korespondensi satu-satu" }, { text: "{(a, x); (b, z); (a, y)}", answer: "Bukan" },
    { text: "{(4, 8); (5, 8); (6, 9)}", answer: "Bukan" }, { text: "{(p, 3); (q, 1); (r, 2)}", answer: "Korespondensi satu-satu" }] }],
    "Baris kedua: a punya dua pasangan. Baris ketiga: 8 dipasangkan dua kali. Baris pertama dan keempat: setiap anggota tepat satu pasangan.", { level: "Sedang" }),
  q(0, "Diketahui C = {2, 4}, D = {3, 4, 5, 6}, dan relasi dari C ke D adalah \"kurang dari\". Nyatakan relasi tersebut dengan diagram panah.", [{ kind: "arrows", label: "Diagram panah \"kurang dari\":", rel: lessThan2, name: "kurang dari" }],
    "2 kurang dari 3, 4, 5, 6; 4 kurang dari 5 dan 6. Pasangannya {(2, 3); (2, 4); (2, 5); (2, 6); (4, 5); (4, 6)}.", { level: "Sedang" }),
  q(1, "Diketahui fungsi f(x) = 2x^{2} − 5x + 1. Tentukan nilai fungsinya.", [n("f(3) =", 4), n("f(−2) =", 19)],
    "f(3) = 2(9) − 15 + 1 = 4. f(−2) = 2(4) + 10 + 1 = 19.", { level: "Sedang" }),
  // Menantang (9-17)
  q(2, "Diagram panah manakah yang menggambarkan korespondensi satu-satu?", [ch("Jawaban:", ["a", "b", "c", "d"], "b", oneToOneOpts)],
    "a: p mendapat dua pasangan. c: a punya dua pasangan dan s mendapat dua. d: d tidak punya pasangan. Hanya b yang setiap anggota kiri dan kanan tepat satu pasangan.", { level: "Menantang" }),
  q(0, "Diketahui T = {1, 2, 3, 4} dan U = {4, 6, 8}. Nyatakan relasi \"faktor dari\" dari T ke U dengan diagram Cartesius: ketuk setiap titik pasangan.", [{ kind: "plot", label: "Diagram Cartesius \"faktor dari\":", rel: factorOf }],
    "1 faktor dari 4, 6, 8; 2 faktor dari 4, 6, 8; 3 faktor dari 6; 4 faktor dari 4 dan 8. Ada 9 titik.", { level: "Menantang" }),
  q(1, "Fungsi f ditentukan oleh f(x) = ax + b. Nilai fungsi untuk x = −2 adalah −13 dan untuk x = 4 adalah 11.", [{ kind: "linear", label: "Rumus fungsi:", f: "f", a: 4, b: -5 }, n("f(−1) + f(1) =", -10)],
    "−2a + b = −13 dan 4a + b = 11. Dikurangkan: 6a = 24, a = 4, lalu b = 11 − 16 = −5. f(−1) + f(1) = −9 + (−1) = −10.", { level: "Menantang" }),
  q(2, "Diketahui M = {x | −2 < x < 3, x bilangan bulat} dan N = {x | 1 < x < 6, x bilangan asli}.", [n("n(M) =", 4), n("Banyak korespondensi satu-satu dari M ke N =", 24)],
    "M = {−1, 0, 1, 2} dan N = {2, 3, 4, 5}, keduanya 4 anggota. Banyak korespondensi 4! = 24.", { level: "Menantang" }),
  q(0, "Diketahui A = {2, 3, 4, 6, 8, 10}, B = {1, 2, 3, 5}, dan relasi dari A ke B adalah \"dua kali dari\".", [pk("Anggota A yang mempunyai pasangan:", [2, 3, 4, 6, 8, 10], [2, 4, 6, 10]), n("Banyak pasangan berurutan =", 4)],
    "2 = 2 × 1, 4 = 2 × 2, 6 = 2 × 3, 10 = 2 × 5. 3 dan 8 tidak punya pasangan karena 1,5 dan 4 bukan anggota B.", { level: "Menantang" }),
  q(1, "Tentukan apakah setiap relasi berikut merupakan fungsi.", [{ kind: "classify", options: FN, rows: [
    { text: "\"setengah dari\" dari A = {1, 2, 3, 4, 6} ke B = {2, 4, 6, 8, 10, 12}", answer: "Fungsi" },
    { text: "\"faktor dari\" dari P = {1, 2, 3, 4, 5} ke Q = {2, 3, 5, 7}", answer: "Bukan fungsi" },
    { text: "\"satu lebihnya dari\" dari P = {3, 4, 5, 6, 7} ke Q = {4, 5, 7, 9}", answer: "Bukan fungsi" },
    { text: "\"tiga kali dari\" dari R = {3, 6, 9, 12} ke S = {1, 2, 3, 4, 5, 6}", answer: "Fungsi" }] }],
    "Setengah dari: 1→2, 2→4, 3→6, 4→8, 6→12, semua tepat satu. Faktor dari: 1 punya empat pasangan. Satu lebihnya dari: 3, 4, 7 tidak punya pasangan. Tiga kali dari: 3→1, 6→2, 9→3, 12→4.", { level: "Menantang" }),
  q(2, "Diketahui A = {−2, −1, 0, 1, 2} dan fungsi f: A → A. Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "f: x → −x adalah korespondensi satu-satu.", answer: true }, { text: "f: x → x^{2} adalah korespondensi satu-satu.", answer: false },
    { text: "f(x) = x + 1 adalah korespondensi satu-satu dari A ke A.", answer: false }] }],
    "−x memasangkan −2↔2, −1↔1, 0↔0, tepat satu-satu. x^{2}: −1 dan 1 sama-sama ke 1, dan 4 bukan anggota A. x + 1: 2 dipasangkan ke 3 yang bukan anggota A.", { level: "Menantang" }),
  q(0, "Pak Hasan mempunyai tiga anak: Dina, Eko, dan Fani. Pak Joko mempunyai dua anak: Gita dan Hadi.", [{ kind: "arrows", label: "Relasi \"ayah dari\":", rel: family, name: "ayah dari" },
    ch("Apakah relasi \"ayah dari\" ini fungsi?", ["Fungsi, karena setiap ayah mempunyai anak", "Bukan fungsi, karena seorang ayah dipasangkan dengan lebih dari satu anak", "Fungsi, karena setiap anak mempunyai tepat satu ayah"], "Bukan fungsi, karena seorang ayah dipasangkan dengan lebih dari satu anak")],
    "Dari Pak Hasan keluar tiga panah dan dari Pak Joko dua panah, jadi \"ayah dari\" bukan fungsi. Kebalikannya, \"anak dari\", adalah fungsi karena setiap anak punya tepat satu ayah.", { level: "Menantang" }),
  q(1, "Tarif taksi: biaya awal Rp6.000,00 dan Rp3.500,00 per kilometer. B(x) adalah tarif untuk x kilometer.", [{ kind: "linear", label: "Rumus tarif:", f: "B", a: 3500, b: 6000 }, n("Tarif untuk 24 km =", 90000, undefined, "Rp"), n("Jarak untuk tarif Rp118.000,00 =", 32, "km")],
    "B(x) = 3.500x + 6.000. B(24) = 84.000 + 6.000 = 90.000. 3.500x + 6.000 = 118.000, 3.500x = 112.000, x = 32 km.", { level: "Menantang", scene: { type: "taxi", start: "Rp6.000,00", perKm: "Rp3.500,00" } }),
  // Sangat menantang (18-24)
  q(2, "Sebuah pabrik memakai kode tanggal dengan korespondensi satu-satu A↔0, B↔1, C↔2, D↔3, E↔4, F↔5, G↔6, H↔7, I↔8, J↔9. Tanggal 23-07-1986 dikodekan CDAHBJIG.", [ch("Kode untuk 17-08-1945:", ["BHAIBJEF", "BHAIBJFE", "AHBIBJEF", "BGAIBJEF"], "BHAIBJEF"), ch("Tanggal untuk kode BCABCACE:", ["12-01-2024", "21-10-2024", "12-01-2042", "12-10-2024"], "12-01-2024")],
    "1→B, 7→H, 0→A, 8→I, 1→B, 9→J, 4→E, 5→F: BHAIBJEF. B C A B C A C E → 1 2 0 1 2 0 2 4: 12-01-2024.", { level: "Sangat menantang" }),
  q(0, "Perhatikan diagram Cartesius relasi dari P ke Q berikut.", [ch("Aturan relasi dari P ke Q:", ["dua kali dari", "setengah dari", "satu kurangnya dari", "faktor dari"], "setengah dari"), pk("Anggota P yang mempunyai pasangan:", [1, 2, 3, 4, 5], [1, 2, 3])],
    "Titiknya (1, 2), (2, 4), (3, 6): setiap anggota P setengah dari pasangannya. \"Faktor dari\" juga akan memuat (1, 4), (1, 6), (2, 6). 4 dan 5 tidak punya pasangan karena 8 dan 10 tidak ada di Q.", { level: "Sangat menantang", scene: { type: "plot", rel: half, xName: "P", yName: "Q" } }),
  q(1, "Air mengalir ke bak mandi dengan debit tetap. Setelah 4 menit volume air 22 liter, dan setelah 10 menit 40 liter. V(t) = V₀ + at. Volume air sebelum dialirkan dan setelah 25 menit adalah …", [ch("Jawaban:", ["10 liter dan 75 liter", "12 liter dan 85 liter", "4 liter dan 79 liter", "10 liter dan 85 liter"], "10 liter dan 85 liter")],
    "Dalam 6 menit bertambah 18 liter, a = 3 liter/menit. V₀ = 22 − 4 × 3 = 10 liter. V(25) = 10 + 75 = 85 liter.", { level: "Sangat menantang", scene: { type: "tank", t1: 4, v1: 22, t2: 10, v2: 40 } }),
  q(2, "H = {nama hari dalam seminggu} dan K = {bilangan prima kurang dari 18}.", [n("n(K) =", 7), n("Banyak korespondensi satu-satu dari H ke K =", 5040)],
    "K = {2, 3, 5, 7, 11, 13, 17}, n(K) = 7 = n(H). Banyak korespondensi 7! = 5.040.", { level: "Sangat menantang" }),
  q(0, "A = {bilangan prima antara 2 dan 15}, B = {bilangan ganjil kurang dari 12}, dan relasi dari A ke B adalah \"dua lebihnya dari\".", [pk("Domain (anggota A) =", range(2, 15), [3, 5, 7, 11, 13]), pk("Range =", [1, 3, 5, 7, 9, 11], [1, 3, 5, 9, 11])],
    "A = {3, 5, 7, 11, 13}, B = {1, 3, 5, 7, 9, 11}. Pasangan: (3, 1), (5, 3), (7, 5), (11, 9), (13, 11). 7 di B tidak mendapat pasangan.", { level: "Sangat menantang" }),
  q(1, "Seorang petani menanam pohon apel dalam pola persegi n × n dan pohon pinus di sekelilingnya, seperti gambar.", [{ kind: "table", label: "Banyak pohon apel:", head: "apel", xs: [4, 5, 6], ys: [16, 25, 36] }, { kind: "table", label: "Banyak pohon pinus:", head: "pinus", xs: [4, 5, 6], ys: [32, 40, 48] }, n("Banyak apel sama dengan banyak pinus saat n =", 8)],
    "Apel n^{2}, pinus 8n (n = 1: 8, n = 2: 16, n = 3: 24). n^{2} = 8n untuk n = 8. Setelah itu apel tumbuh lebih cepat.", { level: "Sangat menantang", scene: { type: "orchard", ns: [1, 2, 3] } }),
  q(2, "A = {1, 2, 3} dan B = {a, b, c}.", [n("Banyak fungsi dari A ke B =", 27), n("Banyak korespondensi satu-satu dari A ke B =", 6),
    { kind: "tf", statements: [{ text: "Setiap korespondensi satu-satu pasti fungsi.", answer: true }, { text: "Setiap fungsi dari A ke B pasti korespondensi satu-satu.", answer: false }] }],
    "Banyak fungsi 3^{3} = 27, tetapi hanya 3! = 6 yang korespondensi satu-satu. Contoh fungsi yang bukan korespondensi: {(1, a); (2, a); (3, a)}.", { level: "Sangat menantang" }),
];

export const sources = { FN, KS };
