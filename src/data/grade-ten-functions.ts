/**
 * Kelas 10 Bab 3 - Fungsi
 * (sumber: Buku Siswa Matematika Kelas X, Bab 3, hlm. 71-116).
 * A. Fungsi dan operasinya (3.1-3.2)  B. Fungsi komposisi (3.3-3.4)  C. Fungsi invers (3.5-3.6).
 * Bentuk jawaban mengikuti buku: menentukan daerah asal/hasil dari rumus atau grafik, rumus hasil operasi
 * dan komposisi (koefisien), nilai fungsi, komposisi pasangan terurut, mencari f dari g∘f, menentukan apakah
 * invers berupa fungsi (diagram panah), rumus fungsi invers, dan soal fungsi khusus dari Uji Kompetensi.
 * Koreksi isi buku: Masalah 3.3 menulis −0,36x (seharusnya −0,036x) sehingga dua cara memberi hasil berbeda;
 * di sini dipakai hasil yang benar, 193,32 ton. Uji Kompetensi 3.2 no. 9 menghasilkan g yang tidak bijektif,
 * jadi tidak dipakai.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  const f = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t);
  if (f) { const a = num(f[1]), b = num(f[2]); return b === 0 ? NaN : a / b; }
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const str = (n: number) => { for (const d of [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 400]) { const k = n * d; if (Math.abs(k - Math.round(k)) < 1e-9) { if (d === 1) return String(Math.round(n)); const p = Math.round(k), c = gcd(p, d); return `${p / c}/${d / c}`; } } return String(Math.round(n * 1e6) / 1e6).replace(".", ","); };
export const fmt = (n: number) => { const s = str(n).replace("-", "−"); const f = /^(−?)(\d+)\/(\d+)$/.exec(s); return f ? `${f[1]}{${f[2]}/${f[3]}}` : /^−?\d+$/.test(s) ? idn(Number(s.replace("−", "-"))) : s; };
/** Polinom dari koefisien (pangkat tertinggi dulu): [2, 0, −3] → 2x^{2} − 3. */
export function polyText(coef: number[], v = "x") {
  const deg = coef.length - 1; let out = "";
  coef.forEach((c, i) => { if (!c) return; const p = deg - i, a = Math.abs(c), body = p === 0 ? idn(a) : `${a === 1 ? "" : idn(a)}${v}${p > 1 ? `^{${p}}` : ""}`; out += out ? ` ${c < 0 ? "−" : "+"} ${body}` : `${c < 0 ? "−" : ""}${body}`; });
  return out || "0";
}
export const polyAt = (coef: number[], x: number) => coef.reduce((s, c) => s * x + c, 0);

/* ---------- Gambar ---------- */
export type Piece = { f: (x: number) => number; from: number; to: number; fromDot?: "penuh" | "kosong"; toDot?: "penuh" | "kosong"; label?: string };
export type Scene =
  | { type: "plot"; pieces: Piece[]; view: [number, number, number, number]; asymX?: number[]; asymY?: number[]; pts?: [number, number, string][]; caption?: string }
  | { type: "arrows"; sets: { name: string; items: string[] }[]; stages: { label: string; links: [number, number][] }[]; caption?: string }
  | { type: "machine"; stages: { name: string; rule: string }[]; input: string; output: string }
  | { type: "table"; head: string[]; rows: (string | number)[][]; caption?: string }
  | { type: "card"; title: string; lines: string[] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "num"; label: string; value: number; unit?: string }
  | { kind: "vals"; label: string; values: number[] }
  | { kind: "poly"; label: string; coef: number[]; fn?: (x: number) => number }
  | { kind: "lin"; label: string; a: number; b: number; fn?: (x: number) => number }
  | { kind: "choice"; label: string; options: string[]; answer: string; pics?: Scene[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] };

export type PQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "poly" ? p.coef.length : p.kind === "lin" ? 3 : 1);
export const cells = (p: Part, v: string) => { if (fieldCount(p) === 1) return [v ?? ""]; const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
/** Bentuk (px + q)/r dengan bilangan bulat terkecil untuk ax + b. */
export function linParts(a: number, b: number): [number, number, number] {
  for (let r = 1; r <= 1000; r++) { const p = a * r, q = b * r; if (Math.abs(p - Math.round(p)) < 1e-9 && Math.abs(q - Math.round(q)) < 1e-9) return [Math.round(p), Math.round(q), r]; }
  return [a, b, 1];
}
export const solList = (v: string) => v.split(";").map(s => s.trim()).filter(Boolean);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "vals": return [p.values.map(str).join("; ")];
    case "poly": return p.coef.map(str);
    case "lin": return linParts(p.a, p.b).map(String);
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
  }
}
const near = (a: number, b: number) => !Number.isNaN(a) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return near(num(v), p.value);
    case "vals": { const got = [...new Set(solList(v).map(num))]; return got.length === p.values.length && !got.some(Number.isNaN) && p.values.every(t => got.some(g => near(g, t))); }
    case "poly": return p.coef.every((c, k) => near(num(x[k]), c));
    case "lin": { const [P, Q, R] = x.map(num); return !Number.isNaN(R) && R !== 0 && near(P / R, p.a) && near(Q / R, p.b); }
    default: return x.join("|") === fields(p).join("|");
  }
}
const partReady = (p: Part, v: string) => (fieldCount(p) > 1 ? cells(p, v).every(c => c.trim() !== "") : v.trim() !== "");
export const correct = (q: PQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: PQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/√\{([^}]*)\}/g, "√$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2").replace(/[{}]/g, "");
export function formatAnswer(q: PQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "vals": return `${plain(p.label)} ${v[i] || "…"}`;
      case "poly": return `${plain(p.label)} ${x.map((c, k) => { const d = x.length - 1 - k; return `(${c})${d ? `x${d > 1 ? `^${d}` : ""}` : ""}`; }).join(" + ")}`;
      case "lin": return `${plain(p.label)} ((${x[0]})x + (${x[1]})) / (${x[2]})`;
      case "choice": return `${plain(p.label)} ${plain(v[i]) || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: number, prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): PQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string): Part => ({ kind: "num", label, value, unit });
const vals = (label: string, values: number[]): Part => ({ kind: "vals", label, values });
const poly = (label: string, coef: number[], fn?: (x: number) => number): Part => ({ kind: "poly", label, coef, fn });
const lin = (label: string, a: number, b: number, fn?: (x: number) => number): Part => ({ kind: "lin", label, a, b, fn });
const ch = (label: string, options: string[], answer: string, pics?: Scene[]): Part => ({ kind: "choice", label, options, answer, pics });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const sq = (x: number) => x * x;
/** Diagram panah dua himpunan. */
const arrows2 = (label: string, A: string[], B: string[], links: [number, number][], names = ["A", "B"]): Scene => ({ type: "arrows", sets: [{ name: names[0], items: A }, { name: names[1], items: B }], stages: [{ label, links }] });

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Fungsi dan Operasinya", sections: [
    { title: "Notasi, daerah asal, daerah hasil, dan grafik fungsi", lab: "mesin",
      steps: [
        "Fungsi bekerja seperti mesin: masukan x diproses dengan aturan tertentu dan keluar tepat satu luaran. Mesin \"kalikan 2 lalu tambah 5\" mengubah 5 menjadi 2(5) + 5 = 15.",
        "Notasinya f: x → 2x + 5, dibaca \"f memetakan x ke 2x + 5\". Bentuk lain yang sama artinya adalah f(x) = 2x + 5 atau y = 2x + 5. Jadi f(x) adalah nilai y untuk x tertentu.",
        "Daerah asal (domain), ditulis D_f, adalah semua nilai x yang boleh dimasukkan. Daerah hasil (range), ditulis R_f, adalah semua nilai f(x) yang dapat keluar.",
        "Jika daerah asal tidak disebutkan, daerah asalnya adalah semua bilangan real x yang membuat f terdefinisi: penyebut tidak boleh nol, dan bilangan di bawah tanda akar kuadrat tidak boleh negatif.",
        "Contoh: f(x) = {1/(x − 2)} tidak terdefinisi di x = 2, jadi D_f = ｛x | x ≠ 2, x ∈ ℝ｝. Fungsi g(x) = √{2x} membutuhkan 2x ≥ 0, jadi D_g = ｛x | x ≥ 0｝.",
        "Dari grafik: daerah asal adalah bayangan grafik pada sumbu x, daerah hasil adalah bayangannya pada sumbu y. Titik penuh berarti ujungnya termasuk, titik kosong berarti tidak termasuk, dan garis putus-putus (asimtot) adalah nilai yang didekati tetapi tidak pernah dicapai.",
        "Daerah asal juga dapat ditetapkan langsung, misalnya f(x) = 2x² untuk 0 ≤ x ≤ 3. Penulisan interval: [2, ∞) berarti x ≥ 2 (kurung siku: batas termasuk), sedangkan (2, ∞) berarti x > 2.",
      ],
      life: "Aplikasi ojek daring menghitung tarif f(x) = 2.500x + 4.000 rupiah untuk perjalanan x kilometer. Jarak tidak mungkin negatif atau nol, dan aplikasi membatasi satu perjalanan paling jauh 25 km, jadi daerah asalnya 0 < x ≤ 25. Tarif yang mungkin muncul, lebih dari Rp4.000 sampai Rp66.500, adalah daerah hasilnya. Saat kamu memasukkan alamat tujuan, aplikasi sebenarnya sedang menghitung nilai sebuah fungsi.",
      example: "Tentukan daerah asal dan daerah hasil f(x) = x² − 4 untuk 1 ≤ x ≤ 5.",
      work: [
        "Daerah asal sudah ditetapkan: D_f = ｛x | 1 ≤ x ≤ 5｝.",
        "Untuk x ≥ 0, nilai x² makin besar jika x makin besar, jadi nilai terkecil di x = 1 dan terbesar di x = 5.",
        "f(1) = 1 − 4 = −3 dan f(5) = 25 − 4 = 21.",
        "Daerah hasil: R_f = ｛y | −3 ≤ y ≤ 21｝, atau y ∈ [−3, 21].",
      ],
      notes: [
        "Setiap x di daerah asal hanya boleh punya satu pasangan y. Itulah yang membedakan fungsi dari relasi biasa.",
        "Cari dulu nilai x yang membuat penyebut nol atau isi akar negatif, lalu keluarkan dari daerah asal.",
        "Pada grafik, perhatikan apakah ujung grafik berupa titik penuh atau titik kosong.",
      ],
      demo: "Pilih aturan mesin dan ubah masukan x. Mesin menolak masukan di luar daerah asal, dan luaran yang keluar membentuk daerah hasil.",
    },
    { title: "Operasi aljabar pada fungsi", lab: "operasi",
      steps: [
        "Dua fungsi dapat dijumlahkan, dikurangkan, dikalikan, dan dibagi seperti bilangan, asalkan untuk nilai x yang sama.",
        "(f + g)(x) = f(x) + g(x) dan (f − g)(x) = f(x) − g(x), dengan daerah asal D_f ∩ D_g, yaitu nilai x yang boleh masuk ke kedua fungsi.",
        "(f × g)(x) = f(x) × g(x), juga dengan daerah asal D_f ∩ D_g.",
        "({f/g})(x) = {f(x)/g(x)} dengan daerah asal D_f ∩ D_g dikurangi semua x yang membuat g(x) = 0.",
        "Contoh: f(x) = x + 2 dan g(x) = x² − 4. Maka (f + g)(x) = x² + x − 2 dan (f − g)(x) = −x² + x + 6.",
        "({f/g})(x) = {(x + 2)/((x + 2)(x − 2))} = {1/(x − 2)}. Walaupun bentuk sederhananya hanya bermasalah di x = 2, daerah asalnya tetap ｛x | x ≠ −2, x ≠ 2｝ karena g(−2) = 0.",
        "Untuk soal cerita, tentukan dulu fungsi gabungannya, lalu substitusikan nilai yang diminta.",
      ],
      life: "Seorang penjual kopi mencatat biaya bahan B(x) = 4.000x + 50.000 rupiah dan pendapatan P(x) = 10.000x rupiah untuk x gelas per hari. Keuntungannya adalah fungsi selisih (P − B)(x) = 6.000x − 50.000. Dengan satu rumus ini ia bisa langsung melihat bahwa menjual 8 gelas masih rugi Rp2.000, sedangkan 9 gelas sudah untung Rp4.000. Operasi pada fungsi membantu menggabungkan dua catatan menjadi satu keputusan.",
      example: "Fotografer mengeluarkan biaya pemotretan B₁(g) = 500g + 2.500 dan biaya editing B₂(g) = 100g + 500 rupiah untuk g gambar. Berapa biaya total 10 gambar, dan berapa selisih kedua biaya untuk 5 gambar?",
      work: [
        "(B₁ + B₂)(g) = (500g + 2.500) + (100g + 500) = 600g + 3.000.",
        "Untuk g = 10: 600(10) + 3.000 = 9.000, jadi biaya total Rp9.000.",
        "(B₁ − B₂)(g) = 400g + 2.000.",
        "Untuk g = 5: 400(5) + 2.000 = 4.000, jadi selisihnya Rp4.000.",
      ],
      notes: [
        "Daerah asal hasil operasi adalah irisan daerah asal kedua fungsi.",
        "Pada pembagian, nilai x yang membuat penyebut g(x) = 0 harus dikeluarkan sebelum menyederhanakan.",
        "Perhatikan tanda negatif saat mengurangkan: −(x² − 4) = −x² + 4.",
      ],
      demo: "Pilih operasinya dan ubah x. Tabel menunjukkan f(x), g(x), dan hasil operasinya. Coba x = 2 pada pembagian.",
    },
  ] },
  { code: "B", title: "Fungsi Komposisi", sections: [
    { title: "Menemukan konsep fungsi komposisi", lab: "komposisi",
      steps: [
        "Banyak proses terjadi dalam dua tahap: hasil tahap pertama menjadi bahan tahap kedua. Gabungan dua fungsi seperti ini disebut fungsi komposisi.",
        "Jika f dikerjakan lebih dulu lalu g, hasilnya ditulis (g∘f)(x) = g(f(x)), dibaca \"g bundaran f\". Fungsi yang ditulis paling kanan dikerjakan paling awal.",
        "Cara menghitung: substitusikan seluruh rumus f(x) ke tempat x pada rumus g. Contoh: f(x) = 2x + 1 dan g(x) = x² − 1 menghasilkan (g∘f)(x) = (2x + 1)² − 1 = 4x² + 4x.",
        "Sebaliknya (f∘g)(x) = f(g(x)) = 2(x² − 1) + 1 = 2x² − 1. Jadi urutan sangat berpengaruh.",
        "Komposisi g∘f terdefinisi jika R_f ∩ D_g ≠ ∅, yaitu sebagian hasil f dapat masuk ke g.",
        "Daerah asal komposisi: D_{g∘f} = ｛x ∈ D_f | f(x) ∈ D_g｝. Nilai x harus boleh masuk ke f, dan hasilnya harus boleh masuk ke g.",
        "Nilai seperti (g∘f)(3) dapat dihitung dua cara: hitung f(3) dulu lalu masukkan ke g, atau cari rumus g∘f lalu substitusi x = 3. Keduanya harus sama.",
      ],
      life: "Seorang turis membawa 1.000 dolar AS. Di bank pertama ia menukar ke ringgit dengan kurs 3 ringgit per dolar dan biaya 2 dolar, jadi x(t) = 3(t − 2). Di bank kedua ringgit ditukar ke rupiah dengan kurs Rp3.500 dan biaya 3 ringgit, jadi y(x) = 3.500(x − 3). Rupiah yang diterima adalah (y∘x)(t) = 10.500t − 31.500, sehingga untuk t = 1.000 ia menerima Rp10.468.500. Satu rumus komposisi menggantikan dua kali hitung di loket.",
      example: "Pabrik kertas: mesin I mengubah x ton kayu menjadi f(x) = 0,9x − 1 ton bahan setengah jadi, mesin II mengubah bahan itu menjadi g(x) = 0,02x² − 2,5x ton kertas. Berapa kertas dari 200 ton kayu?",
      work: [
        "Cara bertahap: f(200) = 0,9(200) − 1 = 179, lalu g(179) = 0,02(179)² − 2,5(179) = 640,82 − 447,5 = 193,32.",
        "Cara komposisi: (g∘f)(x) = 0,02(0,9x − 1)² − 2,5(0,9x − 1).",
        "= 0,02(0,81x² − 1,8x + 1) − 2,25x + 2,5 = 0,0162x² − 0,036x + 0,02 − 2,25x + 2,5.",
        "= 0,0162x² − 2,286x + 2,52. Untuk x = 200: 648 − 457,2 + 2,52 = 193,32.",
        "Kedua cara memberi 193,32 ton kertas. Perhatikan koefisien −0,036x; kesalahan kecil di sini membuat hasil kedua cara berbeda.",
      ],
      notes: [
        "g∘f berarti f dulu, baru g. Bacalah dari kanan ke kiri.",
        "Gunakan tanda kurung saat menyubstitusi: g(2x + 1) = (2x + 1)² − 1, bukan 2x + 1² − 1.",
        "Pada pasangan terurut, g∘f di x tidak terdefinisi jika f(x) tidak ada di daerah asal g.",
      ],
      demo: "Atur banyak kayu dan lihat hasil setiap mesin. Tukar urutan mesin untuk membandingkan g∘f dengan f∘g.",
    },
    { title: "Sifat-sifat operasi fungsi komposisi", lab: "sifat",
      steps: [
        "Tidak komutatif: pada umumnya g∘f ≠ f∘g. Contoh f(x) = 4x + 3 dan g(x) = x − 1 memberi (g∘f)(x) = 4x + 2 tetapi (f∘g)(x) = 4x − 1.",
        "Asosiatif: f∘(g∘h) = (f∘g)∘h. Kurung boleh dipindah selama urutan fungsinya tetap.",
        "Fungsi identitas I(x) = x tidak mengubah apa pun, sehingga f∘I = I∘f = f.",
        "Jika diketahui g∘f dan g, rumus f dicari dengan menyelesaikan g(f(x)) = rumus yang diberikan, seperti menyelesaikan persamaan dengan f(x) sebagai \"variabelnya\".",
        "Contoh: g(x) = 2x² − 6 dan (g∘f)(x) = 18x² + 24x + 2. Maka 2(f(x))² − 6 = 18x² + 24x + 2, jadi (f(x))² = 9x² + 12x + 4 = (3x + 2)².",
        "Akibatnya ada dua kemungkinan: f(x) = 3x + 2 atau f(x) = −3x − 2. Keduanya perlu dicek atau dipilih sesuai syarat soal.",
        "Jika diketahui g∘f dan f, cari g dengan memisalkan u = f(x), lalu nyatakan x dalam u.",
      ],
      life: "Toko daring memberi potongan Rp20.000, lalu menambahkan pajak 10%. Jika harga awal x, potongan adalah d(x) = x − 20.000 dan pajak adalah p(x) = 1,1x. Bila potongan dulu lalu pajak, harga akhirnya (p∘d)(x) = 1,1x − 22.000. Bila pajak dulu lalu potongan, harganya (d∘p)(x) = 1,1x − 20.000. Untuk barang Rp200.000, urutan pertama memberi Rp198.000 dan urutan kedua Rp200.000. Karena g∘f ≠ f∘g, pembeli sebaiknya memeriksa urutan perhitungannya.",
      example: "Diketahui g(x) = x² − 2 dan (g∘f)(x) = 4x² − 12x + 7. Tentukan f(x) dan (f∘g)(x).",
      work: [
        "g(f(x)) = (f(x))² − 2 = 4x² − 12x + 7, jadi (f(x))² = 4x² − 12x + 9.",
        "4x² − 12x + 9 = (2x − 3)², sehingga f(x) = 2x − 3 atau f(x) = −2x + 3.",
        "Untuk f(x) = 2x − 3: (f∘g)(x) = 2(x² − 2) − 3 = 2x² − 7.",
        "Untuk f(x) = −2x + 3: (f∘g)(x) = −2(x² − 2) + 3 = −2x² + 7.",
      ],
      notes: [
        "Saat mengakarkan (f(x))², ingat ada tanda ±.",
        "Untuk membuktikan sifat, cukup hitung kedua ruas dan bandingkan rumusnya, lalu uji di satu nilai x.",
        "Sifat asosiatif tidak berarti urutan boleh ditukar.",
      ],
      demo: "Pilih dua komposisi untuk dibandingkan. Tabel menunjukkan nilainya di beberapa x, sehingga terlihat mana yang selalu sama.",
    },
  ] },
  { code: "C", title: "Fungsi Invers", sections: [
    { title: "Fungsi invers dan syarat keberadaannya", lab: "invers",
      steps: [
        "Fungsi f memetakan A ke B. Invers f, ditulis f⁻¹, membalik arah semua panahnya sehingga memetakan B kembali ke A.",
        "Dalam pasangan terurut: jika f = ｛(x, y) | x ∈ A, y ∈ B｝, maka f⁻¹ = ｛(y, x) | y ∈ B, x ∈ A｝. Setiap pasangan cukup ditukar urutannya.",
        "Invers suatu fungsi belum tentu fungsi. Setelah panah dibalik, bisa ada anggota yang punya dua pasangan atau tidak punya pasangan sama sekali.",
        "Fungsi injektif (satu-satu): dua anggota A yang berbeda selalu punya peta yang berbeda. Fungsi surjektif (onto): setiap anggota B mendapat pasangan.",
        "Fungsi bijektif adalah fungsi yang injektif dan surjektif sekaligus, yaitu korespondensi satu-satu.",
        "Sifat: f: A → B memiliki fungsi invers f⁻¹: B → A jika dan hanya jika f bijektif. Daerah asal f⁻¹ adalah daerah hasil f, dan sebaliknya.",
        "Hubungan dasarnya y = f(x) ⇔ x = f⁻¹(y). Untuk mencari x dari hasil yang diketahui, kita memakai invers.",
      ],
      life: "Setiap siswa di sebuah sekolah mendapat satu loker dengan nomor berbeda, dan semua loker terpakai. Fungsi \"siswa → nomor loker\" bersifat bijektif, sehingga dari nomor loker penjaga sekolah selalu tahu pemiliknya: itulah inversnya. Jika dua siswa berbagi satu loker, nomor loker itu menunjuk ke dua orang, dan kebalikannya tidak lagi berupa fungsi. Jika ada loker kosong, nomor itu tidak menunjuk siapa pun.",
      example: "Keuntungan pedagang kain f(x) = 300x + 2.000 rupiah untuk x potong. Berapa keuntungan jika terjual 40 potong, dan berapa potong harus terjual agar untung Rp62.000?",
      work: [
        "f(40) = 300(40) + 2.000 = 14.000, jadi untung Rp14.000. Ini arah f: dari A (banyak kain) ke B (keuntungan).",
        "Untuk keuntungan 62.000, arah dibalik: 300x + 2.000 = 62.000.",
        "300x = 60.000, jadi x = 200 potong. Ini arah f⁻¹: dari B kembali ke A.",
        "Karena setiap banyak kain memberi keuntungan berbeda, f injektif pada daerah asalnya dan inversnya berupa fungsi.",
      ],
      notes: [
        "Untuk mengecek invers dari diagram panah: balik panahnya, lalu periksa apakah setiap anggota himpunan asal baru punya tepat satu panah.",
        "f⁻¹ bukan {1/f}. Tanda −1 di sini berarti \"kebalikan proses\", bukan pangkat.",
        "Fungsi kuadrat seperti f(x) = x² pada semua bilangan real tidak injektif, karena f(2) = f(−2).",
      ],
      demo: "Pilih sebuah fungsi dan balik panahnya. Peraga memeriksa apakah hasilnya masih berupa fungsi.",
    },
    { title: "Menentukan rumus fungsi invers", lab: "rumus",
      steps: [
        "Langkah mencari rumus invers: tulis y = f(x), nyatakan x dalam y, lalu karena x = f⁻¹(y), ganti nama variabel menjadi f⁻¹(x).",
        "Contoh: f(x) = 5x + 7. Dari y = 5x + 7 diperoleh x = {(y − 7)/5}, jadi f⁻¹(x) = {(x − 7)/5}.",
        "Sifat: (f∘f⁻¹)(x) = (f⁻¹∘f)(x) = x = I(x). Sifat ini dipakai untuk mengecek apakah dua fungsi saling invers.",
        "Invers dari invers adalah fungsi semula: (f⁻¹)⁻¹ = f.",
        "Invers komposisi: (g∘f)⁻¹ = f⁻¹∘g⁻¹. Urutannya terbalik, seperti melepas sepatu lalu kaus kaki setelah memakai kaus kaki lalu sepatu.",
        "Grafik y = f⁻¹(x) adalah cerminan grafik y = f(x) terhadap garis y = x, karena setiap titik (a, b) menjadi (b, a).",
        "Jika f tidak injektif, batasi daerah asalnya. Contoh f(x) = x² − 4 dengan x ≥ 0 mempunyai invers f⁻¹(x) = √{x + 4}.",
      ],
      life: "Aplikasi cuaca menampilkan suhu dalam Fahrenheit dengan rumus F = {9/5}C + 32. Seorang siswa yang membaca 104°F ingin tahu suhunya dalam Celsius, jadi ia memakai fungsi invers C = {5/9}(F − 32). Hasilnya {5/9}(72) = 40°C. Fungsi invers menjawab pertanyaan \"masukannya berapa?\" ketika yang diketahui adalah hasilnya.",
      example: "Tentukan invers f(x) = 4x − 9, lalu buktikan (f∘f⁻¹)(x) = x.",
      work: [
        "y = 4x − 9, sehingga 4x = y + 9 dan x = {(y + 9)/4}.",
        "Jadi f⁻¹(x) = {(x + 9)/4}.",
        "(f∘f⁻¹)(x) = 4 · {(x + 9)/4} − 9 = x + 9 − 9 = x.",
        "Cek angka: f(3) = 3 dan f⁻¹(3) = {12/4} = 3. Titik (3, 3) berada di garis y = x, tempat grafik f dan f⁻¹ berpotongan.",
      ],
      notes: [
        "Selalu cek jawabanmu dengan menghitung f(f⁻¹(x)).",
        "(g∘f)⁻¹ sama dengan f⁻¹∘g⁻¹, bukan g⁻¹∘f⁻¹.",
        "Daerah asal f⁻¹ sama dengan daerah hasil f.",
      ],
      demo: "Ubah a dan b pada f(x) = ax + b. Grafik f⁻¹ selalu menjadi cerminan f terhadap garis y = x, dan titik uji kembali ke tempat semula.",
    },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: `${t.code}.${j + 1}`, topic: t })));

/* ---------- Data peraga ---------- */
export const machineRules: { name: string; f: (x: number) => number; domain: string; ok: (x: number) => boolean }[] = [
  { name: "2x + 5", f: x => 2 * x + 5, domain: "semua bilangan real", ok: () => true },
  { name: "x^{2} − 1", f: x => x * x - 1, domain: "semua bilangan real", ok: () => true },
  { name: "{1/(x − 2)}", f: x => 1 / (x - 2), domain: "｛x | x ≠ 2｝", ok: x => x !== 2 },
  { name: "√{x + 3}", f: x => Math.sqrt(x + 3), domain: "｛x | x ≥ −3｝", ok: x => x >= -3 },
];
export const opF = (x: number) => x + 2, opG = (x: number) => x * x - 4;
export const factory = { f: (x: number) => 0.9 * x - 1, g: (x: number) => 0.8 * x + 2 };
export const sifatFns = { f: (x: number) => 2 * x + 1, g: (x: number) => x - 3, h: (x: number) => 3 * x };
export const sifatOptions: { name: string; text: string; fn: (x: number) => number }[] = [
  { name: "g∘f", text: "2x − 2", fn: x => sifatFns.g(sifatFns.f(x)) },
  { name: "f∘g", text: "2x − 5", fn: x => sifatFns.f(sifatFns.g(x)) },
  { name: "f∘(g∘h)", text: "6x − 5", fn: x => sifatFns.f(sifatFns.g(sifatFns.h(x))) },
  { name: "(f∘g)∘h", text: "6x − 5", fn: x => sifatFns.f(sifatFns.g(sifatFns.h(x))) },
  { name: "f∘I", text: "2x + 1", fn: x => sifatFns.f(x) },
  { name: "I∘f", text: "2x + 1", fn: x => sifatFns.f(x) },
];
export const inverseDiagrams: { name: string; kind: string; A: string[]; B: string[]; links: [number, number][] }[] = [
  { name: "f", kind: "bijektif", A: ["1", "2", "3", "4"], B: ["a", "b", "c", "d"], links: [[0, 1], [1, 0], [2, 2], [3, 3]] },
  { name: "g", kind: "injektif, tidak surjektif", A: ["1", "2", "3"], B: ["a", "b", "c", "d", "e"], links: [[0, 0], [1, 2], [2, 3]] },
  { name: "h", kind: "surjektif, tidak injektif", A: ["1", "2", "3", "4"], B: ["a", "b"], links: [[0, 0], [1, 0], [2, 1], [3, 1]] },
];

/* ---------- Latihan (4 per bagian) ---------- */
const D = (s: string) => `｛${s}｝`;
const mach = (stages: [string, string][], input: string, output: string): Scene => ({ type: "machine", stages: stages.map(([name, rule]) => ({ name, rule })), input, output });
export const practice: PQuestion[][] = [
  [
    q(0, "Sebuah mesin bekerja dengan aturan \"kalikan 3 lalu kurangi 4\", yaitu f(x) = 3x − 4. Tentukan luarannya.",
      [n("f(5) =", 11), n("f(−2) =", -10)],
      "f(5) = 15 − 4 = 11 dan f(−2) = −6 − 4 = −10.", { scene: mach([["f", "kalikan 3 lalu kurangi 4"]], "x", "3x − 4") }),
    q(0, "Tentukan daerah asal f(x) = {1/(x − 3)}.",
      [ch("Daerah asal:", [D("x | x ≠ 3, x ∈ ℝ"), D("x | x > 3"), D("x | x ≠ −3, x ∈ ℝ")], D("x | x ≠ 3, x ∈ ℝ"))],
      "Penyebut x − 3 tidak boleh nol, jadi hanya x = 3 yang dikeluarkan."),
    q(0, "Grafik fungsi dimulai dari titik penuh (−1, −3) lalu naik terus ke kanan. Tentukan daerah asal dan daerah hasilnya.",
      [ch("Daerah asal:", [D("x | x > −1"), D("x | x ≥ −1"), D("x | x ≥ −3")], D("x | x ≥ −1")), ch("Daerah hasil:", [D("y | y ≥ −1"), D("y | y > −3"), D("y | y ≥ −3")], D("y | y ≥ −3"))],
      "Titik penuh berarti ujungnya termasuk. Grafik membentang dari x = −1 ke kanan dan dari y = −3 ke atas.",
      { scene: { type: "plot", pieces: [{ f: x => x - 2, from: -1, to: 6, fromDot: "penuh" }], view: [-3, 6, -4, 5], pts: [[-1, -3, "(−1, −3)"]] } }),
    q(0, "Perhatikan h(x) = {2/(x(x − 4))} dan k(x) = √{x − 5}.",
      [vals("Nilai x yang dikeluarkan dari daerah asal h:", [0, 4]), ch("Daerah asal k:", [D("x | x ≥ 5"), D("x | x > 5"), D("x | x ≥ −5")], D("x | x ≥ 5"))],
      "Penyebut x(x − 4) bernilai nol di x = 0 dan x = 4. Isi akar x − 5 harus ≥ 0, jadi x ≥ 5 (x = 5 boleh, karena √0 = 0)."),
  ],
  [
    q(1, "Biaya pemotretan B₁(g) = 600g + 3.000 dan biaya editing B₂(g) = 150g + 1.000 rupiah untuk g gambar.",
      [n("Biaya total 8 gambar = Rp", 10000), n("Selisih biaya pemotretan dan editing untuk 4 gambar = Rp", 3800)],
      "(B₁ + B₂)(g) = 750g + 4.000, untuk g = 8: 10.000. (B₁ − B₂)(g) = 450g + 2.000, untuk g = 4: 3.800."),
    q(1, "Diketahui f(x) = x + 2 dan g(x) = x² − 4. Tentukan koefisien hasil operasinya.",
      [poly("(f + g)(x) =", [1, 1, -2], x => opF(x) + opG(x)), poly("(f − g)(x) =", [-1, 1, 6], x => opF(x) - opG(x))],
      "(x + 2) + (x² − 4) = x² + x − 2 dan (x + 2) − (x² − 4) = −x² + x + 6."),
    q(1, "Masih dengan f(x) = x + 2 dan g(x) = x² − 4, tentukan (f × g)(x).",
      [poly("(f × g)(x) =", [1, 2, -4, -8], x => opF(x) * opG(x))],
      "(x + 2)(x² − 4) = x³ − 4x + 2x² − 8 = x³ + 2x² − 4x − 8."),
    q(1, "Tentukan ({f/g})(x) untuk f(x) = x + 2 dan g(x) = x² − 4.",
      [ch("Bentuk sederhana:", ["{1/(x + 2)}", "x − 2", "{1/(x − 2)}"], "{1/(x − 2)}"), vals("Nilai x yang dikeluarkan dari daerah asal:", [-2, 2])],
      "({f/g})(x) = {(x + 2)/((x + 2)(x − 2))} = {1/(x − 2)}, tetapi g(−2) = g(2) = 0, jadi x = −2 dan x = 2 dikeluarkan."),
  ],
  [
    q(2, "Diketahui f(x) = 3x − 1 dan g(x) = x² + 2. Hitung nilainya.",
      [n("(g∘f)(2) =", 27), n("(f∘g)(2) =", 17)],
      "(g∘f)(2) = g(f(2)) = g(5) = 27. (f∘g)(2) = f(g(2)) = f(6) = 17."),
    q(2, "Masih dengan f(x) = 3x − 1 dan g(x) = x² + 2, tentukan rumus komposisinya.",
      [poly("(g∘f)(x) =", [9, -6, 3], x => sq(3 * x - 1) + 2), poly("(f∘g)(x) =", [3, 0, 5], x => 3 * (x * x + 2) - 1)],
      "(g∘f)(x) = (3x − 1)² + 2 = 9x² − 6x + 3. (f∘g)(x) = 3(x² + 2) − 1 = 3x² + 5."),
    q(2, "Turis menukar t dolar ke ringgit: x(t) = 3(t − 2). Ringgit lalu ditukar ke rupiah: y(x) = 3.500(x − 3). Tentukan (y∘x)(t) dan rupiah yang diterima untuk 500 dolar.",
      [poly("(y∘x)(t) =", [10500, -31500], t => 3500 * (3 * (t - 2) - 3)), n("Rupiah untuk t = 500: Rp", 5218500)],
      "(y∘x)(t) = 3.500(3t − 6 − 3) = 10.500t − 31.500. Untuk t = 500: 5.250.000 − 31.500 = 5.218.500."),
    q(2, "Manakah arti (g∘f)(x)?",
      [ch("(g∘f)(x) =", ["f(g(x))", "g(f(x))", "f(x) × g(x)"], "g(f(x))")],
      "g∘f berarti f dikerjakan dulu, lalu hasilnya dimasukkan ke g: g(f(x))."),
  ],
  [
    q(3, "Diketahui f(x) = 4x + 1 dan g(x) = x − 3. Bandingkan kedua komposisi.",
      [poly("(g∘f)(x) =", [4, -2], x => 4 * x + 1 - 3), poly("(f∘g)(x) =", [4, -11], x => 4 * (x - 3) + 1), ch("Apakah g∘f = f∘g?", ["Ya", "Tidak"], "Tidak")],
      "(g∘f)(x) = (4x + 1) − 3 = 4x − 2, sedangkan (f∘g)(x) = 4(x − 3) + 1 = 4x − 11. Komposisi tidak komutatif."),
    q(3, "Diketahui f(x) = x + 2, g(x) = 3x, dan h(x) = 2x − 1. Tentukan ((f∘g)∘h)(x), lalu bandingkan dengan (f∘(g∘h))(x).",
      [poly("((f∘g)∘h)(x) =", [6, -1], x => 3 * (2 * x - 1) + 2), tf(["(f∘(g∘h))(x) memberi rumus yang sama.", true])],
      "(f∘g)(x) = 3x + 2, lalu ((f∘g)∘h)(x) = 3(2x − 1) + 2 = 6x − 1. (g∘h)(x) = 6x − 3, lalu f(6x − 3) = 6x − 1. Sifat asosiatif berlaku."),
    q(3, "Diketahui f(x) = 7x − 2 dan fungsi identitas I(x) = x.",
      [poly("(f∘I)(x) =", [7, -2], x => 7 * x - 2), n("(I∘f)(3) =", 19)],
      "f∘I = I∘f = f, jadi (f∘I)(x) = 7x − 2 dan (I∘f)(3) = f(3) = 19."),
    q(3, "Tentukan benar atau salah setiap pernyataan tentang sifat komposisi.",
      [tf(["Untuk semua fungsi f dan g berlaku g∘f = f∘g.", false],
        ["f∘(g∘h) = (f∘g)∘h jika komposisinya terdefinisi.", true],
        ["Jika (f(x))² = (x + 5)², maka f(x) pasti x + 5.", false],
        ["Fungsi identitas I(x) = x tidak mengubah fungsi lain dalam komposisi.", true])],
      "Komposisi tidak komutatif tetapi asosiatif. Dari (f(x))² = (x + 5)² ada dua kemungkinan: f(x) = x + 5 atau f(x) = −x − 5."),
  ],
  [
    q(4, "Keuntungan pedagang kain f(x) = 400x + 2.000 rupiah untuk x potong kain.",
      [n("Keuntungan menjual 30 potong = Rp", 14000), n("Banyak potong agar untung Rp50.000 =", 120, "potong")],
      "f(30) = 12.000 + 2.000 = 14.000. Untuk 50.000: 400x = 48.000, jadi x = 120.",
      { scene: arrows2("f", ["30", "…?"], ["…?", "50.000"], [[0, 0], [1, 1]]) }),
    q(4, "Fungsi manakah yang mempunyai fungsi invers?",
      [ch("Diagram:", ["P", "Q", "R"], "P", [arrows2("P", ["1", "2", "3"], ["a", "b", "c"], [[0, 2], [1, 0], [2, 1]]), arrows2("Q", ["1", "2", "3"], ["a", "b"], [[0, 0], [1, 0], [2, 1]]), arrows2("R", ["1", "2"], ["a", "b", "c"], [[0, 0], [1, 2]])])],
      "Hanya P bijektif: setiap anggota B mendapat tepat satu panah. Q tidak injektif (1 dan 2 ke a), R tidak surjektif (b tidak punya pasangan)."),
    q(4, "Inverskan setiap fungsi berikut (tukar urutan pasangan). Apakah hasilnya fungsi?",
      [{ kind: "classify", options: ["Fungsi", "Bukan fungsi"], rows: [
        { text: D("(1, 4), (2, 5), (3, 6)"), answer: "Fungsi" },
        { text: D("(1, 4), (2, 4), (3, 6)"), answer: "Bukan fungsi" },
        { text: D("(0, 1), (1, 3), (2, 5)"), answer: "Fungsi" },
        { text: D("(−1, 1), (1, 1), (2, 4)"), answer: "Bukan fungsi" },
      ] }],
      "Jika dua pasangan punya anggota kedua yang sama, setelah ditukar anggota itu punya dua pasangan, jadi inversnya bukan fungsi."),
    q(4, "Diketahui f = ｛(1, 5), (2, 7), (3, 9)｝.",
      [n("f⁻¹(7) =", 2), tf(["f⁻¹ = ｛(5, 1), (7, 2), (9, 3)｝", true], ["f⁻¹(5) = 9", false])],
      "Tukar setiap pasangan: f⁻¹ = ｛(5, 1), (7, 2), (9, 3)｝, jadi f⁻¹(7) = 2 dan f⁻¹(5) = 1."),
  ],
  [
    q(5, "Tentukan invers f(x) = 4x + 3 dalam bentuk {(px + q)/r}.",
      [lin("f⁻¹(x) =", 1 / 4, -3 / 4, x => (x - 3) / 4)],
      "y = 4x + 3, jadi x = {(y − 3)/4}. Maka f⁻¹(x) = {(x − 3)/4}."),
    q(5, "Pendapatan klub dari tiket penonton f(x) = 400x + 30.000 rupiah untuk x penonton.",
      [lin("f⁻¹(x) =", 1 / 400, -75, x => (x - 30000) / 400), n("Penonton jika pendapatan Rp4.030.000 =", 10000, "orang")],
      "f⁻¹(x) = {(x − 30.000)/400}. f⁻¹(4.030.000) = {4.000.000/400} = 10.000 penonton."),
    q(5, "Suhu Fahrenheit F = {9/5}C + 32. Tentukan rumus Celsius dari Fahrenheit, lalu ubah 104°F.",
      [lin("C =", 5 / 9, -160 / 9, F => (5 / 9) * (F - 32)), n("104°F =", 40, "°C")],
      "C = {5/9}(F − 32) = {(5F − 160)/9}. Untuk F = 104: {5/9}(72) = 40."),
    q(5, "Diketahui f(x) = x + 4 dan g(x) = 2x. Tentukan (g∘f)⁻¹(x) dan periksa sifatnya.",
      [lin("(g∘f)⁻¹(x) =", 1 / 2, -4, x => (x - 8) / 2), tf(["(g∘f)⁻¹ = f⁻¹∘g⁻¹", true], ["(g∘f)⁻¹ = g⁻¹∘f⁻¹", false])],
      "(g∘f)(x) = 2x + 8, jadi (g∘f)⁻¹(x) = {(x − 8)/2}. f⁻¹(g⁻¹(x)) = {x/2} − 4 = {(x − 8)/2}, sedangkan g⁻¹(f⁻¹(x)) = {(x − 4)/2}."),
  ],
];

/* ---------- Evaluasi 24 soal ---------- */
const S = "Sedang", Mn = "Menantang", SM = "Sangat menantang";
const lvl = (level: Level, x: PQuestion): PQuestion => ({ ...x, level });
const pairF = new Map([[1, 4], [2, 6], [3, -1], [4, 8]]), pairG = new Map([[4, 2], [6, 5], [8, 3], [0, 9]]);
const pairOut = (x: number) => { const y = pairF.get(x)!; return pairG.has(y) ? String(pairG.get(y)) : "tidak terdefinisi"; };
export const assessment: PQuestion[] = [
  lvl(S, q(0, "Perhatikan grafik fungsi kuadrat dengan titik puncak (1, −2) yang terbuka ke atas. Tentukan daerah asal dan daerah hasilnya.",
    [ch("Daerah asal:", ["semua bilangan real", D("x | x ≥ 1"), D("x | x ≥ −2")], "semua bilangan real"), ch("Daerah hasil:", [D("y | y > −2"), D("y | y ≤ −2"), D("y | y ≥ −2")], D("y | y ≥ −2"))],
    "Parabola menyebar ke kiri dan ke kanan tanpa batas, jadi x boleh berapa saja. Nilai y terendah −2 dicapai di puncak, sehingga y ≥ −2.",
    { scene: { type: "plot", pieces: [{ f: x => sq(x - 1) - 2, from: -3, to: 5 }], view: [-3, 5, -3, 7], pts: [[1, -2, "(1, −2)"]] } })),
  lvl(S, q(2, "Diketahui f(x) = x² − 3x + 1 dan g(x) = 2x − 5.",
    [n("(g∘f)(4) =", 5), n("(f∘g)(4) =", 1)],
    "f(4) = 16 − 12 + 1 = 5, g(5) = 5. g(4) = 3, f(3) = 9 − 9 + 1 = 1.",
    { scene: mach([["f", "x^{2} − 3x + 1"], ["g", "2x − 5"]], "4", "(g∘f)(4)") })),
  lvl(S, q(4, "Keuntungan pedagang kain f(x) = 200x + 1.500 rupiah untuk x potong. Lengkapi diagramnya.",
    [n("Keuntungan menjual 80 potong = Rp", 17500), n("Banyak potong agar untung Rp41.500 =", 200, "potong")],
    "f(80) = 16.000 + 1.500 = 17.500. Untuk 41.500: 200x = 40.000, jadi x = 200.",
    { scene: arrows2("f", ["80", "…?"], ["…?", "41.500"], [[0, 0], [1, 1]]) })),
  lvl(S, q(1, "Diketahui f(x) = x + 5 dan g(x) = x² − 25.",
    [poly("(f + g)(x) =", [1, 1, -20], x => x + 5 + x * x - 25), vals("Nilai x yang dikeluarkan dari daerah asal ({f/g})(x):", [-5, 5])],
    "(f + g)(x) = x² + x − 20. ({f/g})(x) = {1/(x − 5)}, tetapi g(−5) = g(5) = 0, jadi kedua nilai itu dikeluarkan.")),
  lvl(S, q(3, "Diketahui f(x) = 5x + 2 dan g(x) = x − 4. Tunjukkan bahwa komposisinya tidak komutatif.",
    [poly("(g∘f)(x) =", [5, -2], x => 5 * x + 2 - 4), poly("(f∘g)(x) =", [5, -18], x => 5 * (x - 4) + 2), n("(g∘f)(3) − (f∘g)(3) =", 16)],
    "(g∘f)(x) = 5x − 2 dan (f∘g)(x) = 5x − 18. Di x = 3: 13 − (−3) = 16.",
    { scene: mach([["f", "5x + 2"], ["g", "x − 4"]], "x", "(g∘f)(x)") })),
  lvl(S, q(5, "Tentukan invers f(x) = 6x − 5.",
    [lin("f⁻¹(x) =", 1 / 6, 5 / 6, x => (x + 5) / 6), n("f⁻¹(19) =", 4)],
    "y = 6x − 5, jadi x = {(y + 5)/6}. f⁻¹(19) = {24/6} = 4.")),
  lvl(S, q(0, "Pasangkan setiap fungsi dengan daerah asalnya.",
    [{ kind: "classify", options: ["x ≥ 6", "x ≠ −1", "semua bilangan real", "x ≥ −2 dan x ≠ 3"], rows: [
      { text: "f(x) = √{x − 6}", answer: "x ≥ 6" },
      { text: "f(x) = {3/(x + 1)}", answer: "x ≠ −1" },
      { text: "f(x) = x^{2} − 2x", answer: "semua bilangan real" },
      { text: "f(x) = {√{x + 2}/(3 − x)}", answer: "x ≥ −2 dan x ≠ 3" },
    ] }],
    "Akar butuh isi ≥ 0, penyebut tidak boleh 0, dan polinom terdefinisi untuk semua x. Fungsi terakhir memerlukan kedua syarat.")),
  lvl(S, q(2, "Fungsi f dan g dinyatakan dengan pasangan terurut seperti pada diagram. Tentukan (g∘f)(x) untuk setiap x.",
    [{ kind: "classify", options: ["2", "5", "3", "9", "tidak terdefinisi"], rows: [1, 2, 3, 4].map(x => ({ text: `(g∘f)(${x})`, answer: pairOut(x) })) }],
    "f(1) = 4 → g(4) = 2; f(2) = 6 → g(6) = 5; f(3) = −1 tidak ada di daerah asal g, jadi tidak terdefinisi; f(4) = 8 → g(8) = 3.",
    { scene: { type: "arrows", sets: [{ name: "x", items: ["1", "2", "3", "4"] }, { name: "f(x)", items: ["4", "6", "−1", "8", "0"] }, { name: "g(f(x))", items: ["2", "5", "3", "9"] }],
      stages: [{ label: "f", links: [[0, 0], [1, 1], [2, 2], [3, 3]] }, { label: "g", links: [[0, 0], [1, 1], [3, 2], [4, 3]] }] } })),
  lvl(Mn, q(4, "Diagram mana yang inversnya merupakan fungsi?",
    [ch("Diagram:", ["P", "Q", "R"], "Q", [arrows2("P", ["1", "2", "3", "4"], ["a", "b", "c"], [[0, 0], [1, 1], [2, 2], [3, 2]]), arrows2("Q", ["1", "2", "3", "4"], ["a", "b", "c", "d"], [[0, 2], [1, 3], [2, 0], [3, 1]]), arrows2("R", ["1", "2", "3"], ["a", "b", "c", "d"], [[0, 1], [1, 2], [2, 3]])])],
    "P tidak injektif (3 dan 4 sama-sama ke c), R tidak surjektif (a tidak punya pasangan). Hanya Q yang bijektif.")),
  lvl(Mn, q(1, "Biaya pemotretan B₁(g) = 450g + 2.000 dan biaya editing B₂(g) = 120g + 800 rupiah untuk g gambar.",
    [n("Biaya total 12 gambar = Rp", 9640), n("Banyak gambar jika selisih kedua biaya Rp8.130 =", 21, "gambar")],
    "(B₁ + B₂)(12) = 570(12) + 2.800 = 9.640. (B₁ − B₂)(g) = 330g + 1.200 = 8.130, jadi 330g = 6.930 dan g = 21.")),
  lvl(Mn, q(3, "Diketahui f(x) = 2x + 3, g(x) = x², dan h(x) = x − 1.",
    [poly("(f∘(g∘h))(x) =", [2, -4, 5], x => 2 * sq(x - 1) + 3), n("((f∘g)∘h)(2) =", 5)],
    "(g∘h)(x) = (x − 1)², lalu f((x − 1)²) = 2x² − 4x + 5. Karena asosiatif, ((f∘g)∘h)(2) = 2(1)² + 3 = 5.",
    { scene: mach([["h", "x − 1"], ["g", "x^{2}"], ["f", "2x + 3"]], "x", "(f∘g∘h)(x)") })),
  lvl(Mn, q(5, "Diketahui f(x) = 3x − 6 dan g(x) = x + 4.",
    [poly("(g∘f)(x) =", [3, -2], x => 3 * x - 6 + 4), lin("(g∘f)⁻¹(x) =", 1 / 3, 2 / 3, x => (x + 2) / 3), n("(f⁻¹∘g⁻¹)(7) =", 3)],
    "(g∘f)(x) = 3x − 2, jadi (g∘f)⁻¹(x) = {(x + 2)/3}. g⁻¹(7) = 3, f⁻¹(3) = {(3 + 6)/3} = 3, sama dengan (g∘f)⁻¹(7).")),
  lvl(Mn, q(0, "Grafik f(x) = {1/(x − 3)} − 1 mempunyai dua asimtot. Tentukan daerah asal dan daerah hasilnya.",
    [ch("Daerah asal:", [D("x | x ≠ −1"), D("x | x ≠ 3"), D("x | x > 3")], D("x | x ≠ 3")), ch("Daerah hasil:", [D("y | y ≠ −1"), D("y | y ≠ 3"), D("y | y > −1")], D("y | y ≠ −1"))],
    "Penyebut nol di x = 3 (asimtot tegak). Nilai {1/(x − 3)} tidak pernah nol, jadi y tidak pernah −1 (asimtot datar).",
    { scene: { type: "plot", pieces: [{ f: x => 1 / (x - 3) - 1, from: -3, to: 2.8 }, { f: x => 1 / (x - 3) - 1, from: 3.2, to: 8 }], view: [-3, 8, -5, 4], asymX: [3], asymY: [-1] } })),
  lvl(Mn, q(2, "Pabrik kertas: mesin I menghasilkan f(x) = 5x − 10 ton bahan setengah jadi dari x ton kayu, mesin II menghasilkan g(x) = x² + 20 ton kertas dari bahan itu.",
    [n("Kertas dari 30 ton kayu =", 19620, "ton"), n("Kayu yang terpakai jika bahan setengah jadi 90 ton =", 20, "ton"), n("Kertas dari 90 ton bahan setengah jadi =", 8120, "ton")],
    "f(30) = 140, g(140) = 19.600 + 20 = 19.620. 5x − 10 = 90 memberi x = 20. g(90) = 8.100 + 20 = 8.120.",
    { scene: mach([["Mesin I", "5x − 10"], ["Mesin II", "x^{2} + 20"]], "kayu x ton", "kertas (ton)") })),
  lvl(Mn, q(4, "Diketahui f = ｛(2, 7), (3, 10), (5, 16), (6, 19)｝ dan aturannya berbentuk ax + b.",
    [n("f⁻¹(16) =", 5), lin("f⁻¹(x) =", 1 / 3, -1 / 3, x => (x - 1) / 3)],
    "Dari pasangan (5, 16), f⁻¹(16) = 5. Aturannya f(x) = 3x + 1, jadi f⁻¹(x) = {(x − 1)/3}.")),
  lvl(Mn, q(1, "Diketahui f(x) = √{x − 2} dan g(x) = √{11 − x}.",
    [ch("Daerah asal ({f/g})(x):", [D("x | 2 ≤ x < 11"), D("x | 2 ≤ x ≤ 11"), D("x | x ≥ 2")], D("x | 2 ≤ x < 11")), n("(f + g)(2) =", 3)],
    "D_f: x ≥ 2, D_g: x ≤ 11, irisannya 2 ≤ x ≤ 11. Untuk pembagian, x = 11 dikeluarkan karena g(11) = 0. (f + g)(2) = 0 + 3 = 3.")),
  lvl(Mn, q(3, "Diketahui g(x) = 2x² − 3 dan (g∘f)(x) = 8x² + 24x + 15, dengan f fungsi linear yang koefisien x-nya positif.",
    [poly("f(x) =", [2, 3], x => 2 * x + 3), poly("(f∘g)(x) =", [4, 0, -3], x => 2 * (2 * x * x - 3) + 3)],
    "2(f(x))² − 3 = 8x² + 24x + 15, jadi (f(x))² = 4x² + 12x + 9 = (2x + 3)². Dengan koefisien positif, f(x) = 2x + 3. (f∘g)(x) = 2(2x² − 3) + 3 = 4x² − 3.")),
  lvl(SM, q(5, "Diketahui f⁻¹(x) = {(x − 2)/4} dan g⁻¹(x) = {(5 − x)/3}. Gunakan (f∘g)⁻¹ = g⁻¹∘f⁻¹.",
    [lin("(f∘g)⁻¹(x) =", -1 / 12, 22 / 12, x => (5 - (x - 2) / 4) / 3), n("(f∘g)⁻¹(10) =", 1)],
    "(f∘g)⁻¹(x) = g⁻¹(f⁻¹(x)) = {(5 − (x − 2)/4)/3} = {(22 − x)/12}. Untuk x = 10: {12/12} = 1.")),
  lvl(SM, q(0, "Diketahui h(x) = √{x^{2} − 8x + 16}.",
    [ch("Daerah asal:", [D("x | x ≥ 4"), "semua bilangan real", D("x | x ≥ 0")], "semua bilangan real"), ch("Daerah hasil:", [D("y | y ≥ 4"), D("y | y > 0"), D("y | y ≥ 0")], D("y | y ≥ 0")), n("h(1) =", 3)],
    "x² − 8x + 16 = (x − 4)² ≥ 0 untuk semua x, jadi daerah asalnya semua bilangan real. h(x) = |x − 4| ≥ 0, dan nilai 0 dicapai di x = 4. h(1) = 3.")),
  lvl(SM, q(2, "Fungsi f memenuhi f(1) = 3 dan f(x + 1) = 2f(x). Fungsi k memenuhi k(xy) = k(x + y) untuk semua x, y, dengan k(9) = 4.",
    [n("f(10) =", 1536), n("k(81) =", 4)],
    "f(2) = 6, f(3) = 12, dan seterusnya: f(n) = 3 · 2^{n − 1}, jadi f(10) = 3 · 512 = 1.536. Untuk k, pilih y = 1: k(x) = k(x + 1), jadi k bernilai tetap dan k(81) = k(9) = 4.")),
  lvl(SM, q(4, "Diketahui f(x) = 2^{x + 1}.",
    [ch("f⁻¹(x) =", ["log₂ x − 1", "log₂ x + 1", "2^{x − 1}"], "log₂ x − 1"), n("f⁻¹(64) =", 5)],
    "y = 2^{x + 1}, jadi x + 1 = log₂ y dan x = log₂ y − 1. f⁻¹(64) = 6 − 1 = 5.",
    { scene: { type: "plot", pieces: [{ f: x => 2 ** (x + 1), from: -4, to: 2.3, label: "y = 2^{x + 1}" }], view: [-4, 4, -1, 9], pts: [[0, 2, "(0, 2)"], [2, 8, "(2, 8)"]] } })),
  lvl(SM, q(1, "Diketahui f(x) = {(x − 4)/x} dengan x ≠ 0, dan g(x) = √{x^{2} − 16}.",
    [ch("Daerah asal (f × g)(x):", [D("x | x ≥ 4"), D("x | x ≤ −4 atau x ≥ 4"), D("x | −4 ≤ x ≤ 4, x ≠ 0")], D("x | x ≤ −4 atau x ≥ 4")), n("(f × g)(5) =", 3 / 5)],
    "g memerlukan x² ≥ 16, yaitu x ≤ −4 atau x ≥ 4 (nilai 0 sudah tidak termasuk). (f × g)(5) = {1/5} × 3 = {3/5}.")),
  lvl(SM, q(3, "Fungsi f memenuhi f({1/x}) + {1/x} f(−x) = 4x untuk setiap x ≠ 0. Tentukan f(2).",
    [n("f(2) =", 9)],
    "x = {1/2}: f(2) + 2f(−{1/2}) = 2. x = −2: f(−{1/2}) − {1/2}f(2) = −8. Dari persamaan kedua, f(−{1/2}) = {1/2}f(2) − 8. Substitusi: 2f(2) − 16 = 2, jadi f(2) = 9.")),
  lvl(SM, q(5, "Diketahui f(x) = {(x + 2)/x}, x ≠ 0. Misalkan k adalah banyaknya faktor prima dari 330.",
    [n("k =", 4), n("f⁻¹(k) =", 2 / 3)],
    "330 = 2 × 3 × 5 × 11, jadi k = 4. Dari y = {(x + 2)/x}: xy = x + 2, x(y − 1) = 2, f⁻¹(x) = {2/(x − 1)}. f⁻¹(4) = {2/3}.")),
];
