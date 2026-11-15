/**
 * Kelas 10 Bab 2 - Sistem Persamaan Linear Tiga Variabel (SPLTV)
 * (sumber: Buku Siswa Matematika Kelas X, Bab 2, hlm. 41-70).
 * A. Menyusun dan menemukan konsep SPLTV (2.1)  B. Penyelesaian SPLTV (2.2).
 * Bentuk jawaban mengikuti buku: menyusun model dari masalah, menentukan himpunan penyelesaian (x, y, z),
 * menghitung nilai turunan (x² + y² + z²), menentukan SPLTV atau bukan, sistem homogen dan trivial,
 * menghitung determinan (aturan Sarrus), menentukan parameter agar sistem tidak/satu/tak hingga
 * penyelesaian, serta teka-teki simbol bergambar (Uji Kompetensi 2.2 no. 6).
 * Catatan: Uji Kompetensi 2.1 no. 7 di buku memaksa z = 1 dari dua persamaan pertama, sehingga tidak
 * pernah tepat satu penyelesaian. Soal berparameter di sini memakai sistem yang benar-benar bergantung pada t.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka ---------- */
/** Angka dari isian siswa: −4, 2/3, 4,5, 2.000. */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  const f = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t);
  if (f) { const a = num(f[1]), b = num(f[2]); return b === 0 ? NaN : a / b; }
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** Teks angka untuk kunci: bilangan bulat atau pecahan biasa (2/3). */
const str = (n: number) => { for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15]) { const k = n * d; if (Math.abs(k - Math.round(k)) < 1e-9) { if (d === 1) return String(Math.round(n)); const p = Math.round(k), c = gcd(p, d); return `${p / c}/${d / c}`; } } return idn(n).replace(/\./g, ""); };
/** Angka untuk tampilan dengan markah pecahan {a/b} dan minus −. */
export const fmt = (n: number) => { const s = str(n).replace("-", "−"); const f = /^(−?)(\d+)\/(\d+)$/.exec(s); return f ? `${f[1]}{${f[2]}/${f[3]}}` : /^−?\d+$/.test(s) ? idn(Number(s.replace("−", "-"))) : s; };

/* ---------- Aljabar kecil ---------- */
export type Row = number[]; // [a, b, c, d] untuk ax + by + cz = d
export const det3 = (m: number[][]) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
/** Matriks untuk D, Dx, Dy, Dz (kolom k diganti konstanta). */
export const detMatrix = (rows: Row[], k: number | null) => rows.map(r => [0, 1, 2].map(j => (j === k ? r[3] : r[j])));
export const solve3 = (rows: Row[]): number[] | null => { const D = det3(detMatrix(rows, null)); if (Math.abs(D) < 1e-12) return null; return [0, 1, 2].map(k => det3(detMatrix(rows, k)) / D); };
/** Banyak penyelesaian: "satu", "tidak", atau "banyak" (eliminasi Gauss dengan pecahan desimal). */
export function kindOf(rows: Row[]): "satu" | "tidak" | "banyak" {
  const m = rows.map(r => [...r]); let rank = 0;
  for (let c = 0; c < 3 && rank < m.length; c++) {
    const p = m.findIndex((r, i) => i >= rank && Math.abs(r[c]) > 1e-9); if (p < 0) continue;
    [m[rank], m[p]] = [m[p], m[rank]];
    for (let i = 0; i < m.length; i++) if (i !== rank) { const f = m[i][c] / m[rank][c]; m[i] = m[i].map((v, j) => v - f * m[rank][j]); }
    rank++;
  }
  if (m.some(r => r.slice(0, 3).every(v => Math.abs(v) < 1e-9) && Math.abs(r[3]) > 1e-9)) return "tidak";
  return rank === 3 ? "satu" : "banyak";
}
/** Ruas kiri ax + by + cz yang rapi: 2x − z, x + y. */
export function side(row: number[], vars: string[] = ["x", "y", "z"]) {
  let out = "";
  row.slice(0, vars.length).forEach((c, i) => { if (!c) return; const a = Math.abs(c), t = `${a === 1 ? "" : idn(a)}${vars[i]}`; out += out ? ` ${c < 0 ? "−" : "+"} ${t}` : `${c < 0 ? "−" : ""}${t}`; });
  return out || "0";
}
export const eqText = (row: Row, vars: string[] = ["x", "y", "z"]) => `${side(row, vars)} = ${idn(row[3])}`;

/* ---------- Gambar ---------- */
export type Sym = "s" | "b" | "m"; // bintang empat sudut, bintang lima sudut, matahari
export type Scene =
  | { type: "system"; rows: string[]; caption?: string }
  | { type: "table"; head: string[]; rows: (string | number)[][]; caption?: string }
  | { type: "card"; title: string; lines: string[] }
  | { type: "triangle"; labels: [string, string, string]; caption?: string }
  | { type: "fish"; head: string; body: string; tail: string }
  | { type: "scales"; items: { names: string; value: number }[] }
  | { type: "symbols"; grid: Sym[][]; rowSums: (number | null)[]; colSums: (number | null)[] }
  | { type: "points"; pts: [number, number][] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "num"; label: string; value: number; unit?: string }
  | { kind: "triple"; label: string; names: string[]; values: number[]; unit?: string; sys?: Row[] }
  | { kind: "system"; label: string; vars: string[]; rows: Row[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] };

export type PQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "triple" ? p.names.length : p.kind === "system" ? 12 : 1);
export const cells = (p: Part, v: string) => { if (fieldCount(p) === 1) return [v ?? ""]; const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "triple": return p.values.map(str);
    case "system": return p.rows.flatMap(r => r.map(str));
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
  }
}
const near = (a: number, b: number) => !Number.isNaN(a) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
/** Baris isian setara dengan kunci jika kelipatan bukan nol (2x + 2y = 4 sama dengan x + y = 2). */
export function sameRow(got: number[], key: Row) {
  if (got.some(Number.isNaN) || got.every(v => v === 0)) return false;
  const k = key.findIndex(v => v !== 0), f = got[k] / key[k];
  return f !== 0 && Number.isFinite(f) && key.every((v, j) => near(got[j], v * f));
}
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return near(num(v), p.value);
    case "triple": return p.values.every((t, k) => near(num(x[k]), t));
    case "system": return p.rows.every((r, i) => sameRow(x.slice(i * 4, i * 4 + 4).map(num), r));
    default: return x.join("|") === fields(p).join("|");
  }
}
const partReady = (p: Part, v: string) => (fieldCount(p) > 1 ? cells(p, v).every(c => c.trim() !== "") : v.trim() !== "");
export const correct = (q: PQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: PQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2").replace(/[{}]/g, "");
export function formatAnswer(q: PQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "triple": return `${plain(p.label)} (${p.names.join(", ")}) = (${x.join("; ")})${p.unit ? ` ${p.unit}` : ""}`;
      case "system": return `${plain(p.label)} ${[0, 1, 2].map(r => `${x[r * 4]}${p.vars[0]} + ${x[r * 4 + 1]}${p.vars[1]} + ${x[r * 4 + 2]}${p.vars[2]} = ${x[r * 4 + 3]}`).join("; ")}`;
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
const tri = (label: string, names: string[], sys: Row[], unit?: string): Part => ({ kind: "triple", label, names, values: solve3(sys)!, unit, sys });
const model = (label: string, rows: Row[], vars = ["x", "y", "z"]): Part => ({ kind: "system", label, vars, rows });
const ch = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const sysScene = (rows: Row[], caption?: string, vars?: string[]): Scene => ({ type: "system", rows: rows.map(r => eqText(r, vars)), caption });
export const COUNT = ["Tepat satu", "Tidak ada", "Tak hingga banyak"];
const XYZ = ["x", "y", "z"];

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Menyusun dan Menemukan Konsep SPLTV", sections: [
    { title: "Menyusun model SPLTV dari masalah sehari-hari", lab: "model",
      steps: [
        "Sistem persamaan linear tiga variabel (SPLTV) adalah kumpulan persamaan linear yang memuat tiga variabel yang sama, misalnya x, y, dan z. SPLTV adalah lanjutan dari SPLDV yang sudah kamu pelajari di SMP.",
        "Mulailah dari masalahnya. Baca dengan teliti, lalu tandai tiga besaran yang belum diketahui. Misalkan masing-masing dengan variabel dan tulis satuannya, misalnya x = banyak karung pupuk Urea.",
        "Ubah setiap informasi menjadi satu persamaan. Kalimat \"pupuk Urea dua kali pupuk SS\" menjadi x = 2y, sedangkan \"seluruhnya 36 karung\" menjadi x + y + z = 36.",
        "Angka besar boleh disederhanakan. Persamaan 80.000x + 110.000y + 140.000z = 3.840.000 dapat dibagi 10.000 menjadi 8x + 11y + 14z = 384 tanpa mengubah penyelesaiannya.",
        "Tulis ketiga persamaan bersama-sama. Bentuk umumnya a₁x + b₁y + c₁z = d₁, a₂x + b₂y + c₂z = d₂, a₃x + b₃y + c₃z = d₃. Bilangan a, b, c disebut koefisien dan d disebut konstanta.",
        "Penyelesaian SPLTV adalah triple terurut (x, y, z) yang membuat ketiga persamaan benar sekaligus. Jika satu persamaan saja tidak terpenuhi, triple itu bukan penyelesaian.",
        "Setelah mendapat jawaban, kembalikan ke masalah awal: apakah nilainya masuk akal (tidak negatif, bilangan bulat untuk karung atau tiket) dan apakah total uangnya cocok.",
      ],
      life: "Pak Joko, petani padi, membeli tiga jenis pupuk: Urea Rp80.000, SS Rp110.000, dan TSP Rp140.000 per karung. Ia butuh 36 karung, pupuk Urea harus dua kali pupuk SS, dan uangnya Rp3.840.000. Dengan x, y, z sebagai banyak karung Urea, SS, dan TSP, ceritanya menjadi tiga persamaan: x + y + z = 36, x = 2y, dan 8x + 11y + 14z = 384. Di peraga, atur banyak karung sampai ketiga syarat terpenuhi. Kamu akan melihat bahwa hanya satu susunan karung yang cocok dengan semua informasi.",
      example: "Bu Sari berbelanja tiga kali di warung yang sama. Belanja pertama 2 kg gula, 1 kg beras, dan 1 liter minyak seharga Rp58.000. Belanja kedua 1 kg gula, 2 kg beras, dan 1 liter minyak seharga Rp56.000. Belanja ketiga 1 kg gula, 1 kg beras, dan 2 liter minyak seharga Rp62.000. Berapa harga masing-masing?",
      work: [
        "Misalkan g, b, m = harga (ribu rupiah) 1 kg gula, 1 kg beras, dan 1 liter minyak.",
        "Model: 2g + b + m = 58; g + 2b + m = 56; g + b + 2m = 62.",
        "Jumlahkan ketiga persamaan: 4g + 4b + 4m = 176, jadi g + b + m = 44.",
        "Kurangkan dari setiap persamaan: g = 58 − 44 = 14, b = 56 − 44 = 12, m = 62 − 44 = 18.",
        "Gula Rp14.000/kg, beras Rp12.000/kg, minyak Rp18.000/liter. Cek belanja pertama: 28 + 12 + 18 = 58, cocok.",
      ],
      notes: [
        "Satu variabel harus mewakili hal yang sama di semua persamaan.",
        "Persamaan linear: setiap variabel berpangkat satu dan tidak ada perkalian antarvariabel seperti xy.",
        "Kalimat \"A 10 lebih sedikit dari dua kali B\" ditulis A = 2B − 10. Bacalah pelan-pelan siapa yang dibandingkan dengan siapa.",
      ],
      demo: "Atur banyak karung Urea, SS, dan TSP. Setiap syarat yang terpenuhi akan diberi tanda centang. Temukan susunan yang memenuhi ketiganya.",
    },
    { title: "Masalah pekerjaan bersama dan pemisalan", lab: "kerja",
      steps: [
        "Pada masalah pekerjaan bersama, yang dijumlahkan bukan waktunya, tetapi bagian pekerjaan yang selesai dalam satu satuan waktu (kecepatan kerja).",
        "Jika Pak Wayan sendirian butuh x hari, dalam 1 hari ia menyelesaikan {1/x} bagian pesanan.",
        "Pak Wayan dan Putu bersama selesai dalam 12 hari berarti 12 × ({1/x} + {1/y}) = 1, atau {1/x} + {1/y} = {1/12}.",
        "Persamaan dengan {1/x} tidak linear. Misalkan p = {1/x}, q = {1/y}, r = {1/z}, sehingga persamaannya menjadi p + q = {1/12}, yang linear dalam p, q, dan r.",
        "Untuk tiga pasangan, jumlahkan ketiga persamaan: 2(p + q + r) = jumlah ruas kanan. Ini jalan pintas yang khas untuk soal berpasangan.",
        "Setelah p, q, r ditemukan, kembalikan ke variabel semula: x = {1/p}. Waktu jika bertiga bekerja bersama adalah {1/(p + q + r)}.",
        "Selalu periksa: waktu kerja sendiri harus lebih lama daripada waktu kerja berdua, dan semua kecepatan harus positif.",
      ],
      life: "Tiga keran mengisi bak penampungan air masjid. Keran A dan B bersama memenuhi bak dalam 6 jam, A dan C dalam 7,5 jam, serta B dan C dalam 10 jam. Pengurus ingin tahu berapa lama bak penuh jika ketiga keran dibuka, dan keran mana yang paling lambat sehingga perlu diperbaiki. Kecepatan keran dimisalkan p, q, r bagian bak per jam, lalu model linearnya diselesaikan seperti SPLTV biasa.",
      example: "Keran A dan B memenuhi bak dalam 6 jam, A dan C dalam 7,5 jam, B dan C dalam 10 jam. Berapa lama setiap keran sendirian, dan berapa lama jika ketiganya dibuka?",
      work: [
        "Misalkan p, q, r = bagian bak yang terisi per jam oleh keran A, B, C.",
        "Model: p + q = {1/6}; p + r = {1/7,5} = {2/15}; q + r = {1/10}.",
        "Jumlahkan: 2(p + q + r) = {5/30} + {4/30} + {3/30} = {12/30}, jadi p + q + r = {1/5}.",
        "p = {1/5} − {1/10} = {1/10}, q = {1/5} − {2/15} = {1/15}, r = {1/5} − {1/6} = {1/30}.",
        "Sendirian: A 10 jam, B 15 jam, C 30 jam (paling lambat). Ketiganya bersama: {1/(1/5)} = 5 jam.",
      ],
      notes: [
        "Waktu tidak boleh dijumlahkan langsung. A 6 jam dan B 3 jam bersama bukan 9 jam, melainkan 2 jam.",
        "Pemisalan p = {1/x} hanya mengubah bentuk. Jangan lupa mengembalikan jawaban ke x.",
        "Jika hasil p, q, atau r negatif, data soal tidak mungkin terjadi di dunia nyata.",
      ],
      demo: "Ubah lama kerja setiap pasangan. Batang menunjukkan bagian pesanan yang dikerjakan setiap orang dalam satu hari, dan waktu bertiga dihitung otomatis.",
    },
    { title: "Ciri SPLTV, sistem homogen, dan penyelesaian trivial", lab: "ciri",
      steps: [
        "Definisi: sistem persamaan linear tiga variabel adalah suatu sistem persamaan linear dengan tiga variabel.",
        "Ada dua syarat yang perlu dicek. Pertama, setiap persamaan linear. Kedua, variabelnya saling terkait: tiga variabel yang sama muncul dalam sistem dan nilainya harus sama untuk semua persamaan.",
        "Contoh bukan SPLTV: {1/x} + {1/y} + {1/z} = 2, 2p + 3q − r = 6, dan p + 3q = 3. Persamaan pertama tidak linear, dan variabel x, y, z tidak terkait dengan p, q, r.",
        "Contoh SPLTV: x = −2, y = 5, dan 2x − 3y − z = 8. Ketiganya dapat ditulis x + 0y + 0z = −2, 0x + y + 0z = 5, 2x − 3y − z = 8, sehingga memuat x, y, z yang sama.",
        "SPLTV disebut homogen jika semua konstantanya nol. Sistem homogen selalu dipenuhi oleh (0, 0, 0), yang disebut penyelesaian trivial.",
        "SPLTV homogen hanya punya dua kemungkinan: hanya penyelesaian trivial, atau mempunyai tak hingga banyak penyelesaian nontrivial selain (0, 0, 0).",
        "Contoh: 2x + 3y + 5z = 0, 4x + 6y + 10z = 0, x − y + z = 0 dipenuhi (0, 0, 0) dan juga (8, 3, −5), karena persamaan kedua hanya dua kali persamaan pertama.",
      ],
      life: "Petugas gudang mencatat selisih stok tiga barang, yaitu x, y, dan z, dibandingkan catatan komputer. Aturan pemeriksaannya 3x + 5y + z = 0, 2x + 7y + z = 0, dan x − 2y + z = 0. Karena semua konstanta nol, sistemnya homogen, dan x = y = z = 0 (tidak ada selisih) pasti memenuhi. Pertanyaan pentingnya: apakah ada kemungkinan lain? Untuk sistem ini tidak ada, jadi jika ketiga aturan terpenuhi, stok pasti cocok. Ciri sistem seperti inilah yang dipelajari di bagian ini.",
      example: "Apakah x = 3, y = 2, dan 2x − y + z = 9 membentuk SPLTV? Jika ya, tentukan penyelesaiannya.",
      work: [
        "Tulis dengan tiga variabel: x + 0y + 0z = 3, 0x + y + 0z = 2, 2x − y + z = 9.",
        "Semua persamaan linear dan memuat x, y, z yang sama, jadi sistem ini SPLTV.",
        "Substitusi x = 3 dan y = 2: 6 − 2 + z = 9, sehingga z = 5.",
        "Penyelesaiannya (x, y, z) = (3, 2, 5). Konstanta 3, 2, dan 9 tidak nol, jadi sistem ini tidak homogen.",
      ],
      notes: [
        "Persamaan yang memuat xy, x², atau {1/x} bukan persamaan linear.",
        "Variabel yang tidak muncul dalam suatu persamaan dianggap berkoefisien 0.",
        "Sistem homogen tidak pernah \"tidak mempunyai penyelesaian\", karena (0, 0, 0) selalu memenuhi.",
      ],
      demo: "Pilih sebuah sistem untuk melihat cirinya, lalu uji sebuah triple. Setiap persamaan yang terpenuhi diberi tanda centang.",
    },
  ] },
  { code: "B", title: "Penyelesaian SPLTV", sections: [
    { title: "Metode eliminasi dan substitusi", lab: "eliminasi",
      steps: [
        "SPLTV diselesaikan dengan cara yang sama seperti SPLDV, kecuali metode grafik, karena grafik persamaan tiga variabel berupa bidang di ruang.",
        "Strategi umumnya: ubah tiga persamaan dengan tiga variabel menjadi dua persamaan dengan dua variabel, lalu menjadi satu persamaan dengan satu variabel.",
        "Pilih satu variabel yang akan dihilangkan. Pasangkan persamaan (1) dengan (2), lalu (1) dengan (3). Samakan koefisien variabel itu dengan perkalian, lalu kurangkan atau jumlahkan.",
        "Dua persamaan baru membentuk SPLDV. Eliminasi satu variabel lagi untuk mendapat nilai variabel ketiga.",
        "Substitusikan nilai yang sudah diketahui ke persamaan dua variabel, lalu ke salah satu persamaan semula untuk mendapat nilai terakhir.",
        "Jika ada persamaan yang sudah sederhana seperti y = x + 4, substitusi langsung biasanya lebih cepat daripada eliminasi.",
        "Tuliskan himpunan penyelesaian sebagai {(x, y, z)} dan cek ke ketiga persamaan semula.",
      ],
      life: "Di kantin sekolah, Rina membayar Rp23.000 untuk 2 porsi nasi, 1 es teh, dan 1 gorengan. Dodi membayar Rp25.000 untuk 1 nasi, 2 es teh, dan 3 gorengan. Sinta membayar Rp34.000 untuk 3 nasi, 1 es teh, dan 2 gorengan. Setiap struk adalah satu persamaan. Dengan eliminasi, harga satu porsi nasi, satu es teh, dan satu gorengan bisa dipisahkan: Rp8.000, Rp4.000, dan Rp3.000.",
      example: "Jumlah tiga bilangan sama dengan 60. Bilangan pertama ditambah 4 sama dengan bilangan kedua, dan bilangan ketiga dikurangi 14 sama dengan bilangan pertama. Tentukan ketiga bilangan itu.",
      work: [
        "Misalkan x, y, z = bilangan pertama, kedua, ketiga. Model: x + y + z = 60; x − y = −4; −x + z = 14.",
        "Jumlahkan (1) dan (2): 2x + z = 56. Kurangkan (3) dari hasil itu: 3x = 42, jadi x = 14.",
        "Substitusi ke (2): y = x + 4 = 18. Substitusi ke (3): z = x + 14 = 28.",
        "Penyelesaian: (14, 18, 28). Cek: 14 + 18 + 28 = 60.",
      ],
      notes: [
        "Saat mengurangkan persamaan, kurangkan juga ruas kanannya dengan tanda yang benar.",
        "Variabel mana pun boleh dihilangkan lebih dulu. Hasil akhirnya tetap sama.",
        "Nilai turunan seperti x² + y² + z² dihitung setelah x, y, z ditemukan.",
      ],
      demo: "Pilih variabel yang ingin dihilangkan lebih dulu, lalu tekan Langkah berikutnya untuk membuka penyelesaian satu langkah demi satu langkah.",
    },
    { title: "Metode determinan (aturan Sarrus)", lab: "sarrus",
      steps: [
        "Jika langkah eliminasi dilakukan pada bentuk umum a₁x + b₁y + c₁z = d₁ dan seterusnya, nilai x, y, z dapat ditulis sebagai pecahan yang hanya memuat koefisien dan konstanta.",
        "Susun koefisien dalam tabel 3 × 3, lalu salin dua kolom pertama di sebelah kanannya.",
        "Kalikan tiga bilangan pada setiap garis penuh (miring ke kanan bawah) lalu jumlahkan. Lakukan hal yang sama untuk garis putus-putus (miring ke kiri bawah). Determinan = jumlah garis penuh − jumlah garis putus-putus.",
        "D memakai kolom koefisien x, y, z. Untuk Dx, kolom x diganti kolom konstanta d. Untuk Dy, kolom y yang diganti, dan untuk Dz, kolom z.",
        "Penyelesaiannya x = {Dx/D}, y = {Dy/D}, z = {Dz/D}, asalkan D ≠ 0.",
        "Variabel yang tidak muncul ditulis dengan koefisien 0, dan urutan x, y, z harus sama di setiap baris.",
        "Hasilnya harus sama dengan cara eliminasi dan substitusi. Jika berbeda, periksa tanda negatif pada tabel.",
      ],
      life: "Model pupuk Pak Joko adalah x + y + z = 36, x − 2y = 0, dan 8x + 11y + 14z = 384. Dengan aturan Sarrus diperoleh D = −15 dan Dx = −240, sehingga x = 16 karung Urea, lalu y = 8 dan z = 12. Cara ini terasa panjang untuk dihitung dengan tangan, tetapi polanya tetap. Pola tetap inilah yang dipakai kalkulator dan aplikasi lembar kerja untuk menyelesaikan sistem persamaan secara otomatis.",
      example: "Tentukan penyelesaian x + 2y + z = 7, 2x − y + z = 6, x + y − z = 0 dengan metode determinan.",
      work: [
        "D: garis penuh 1·(−1)·(−1) + 2·1·1 + 1·2·1 = 5; garis putus-putus 1·(−1)·1 + 1·1·1 + (−1)·2·2 = −4. D = 5 − (−4) = 9.",
        "Dx (kolom x diganti 7, 6, 0) = 18, jadi x = {18/9} = 2.",
        "Dy (kolom y diganti) = 9, jadi y = 1.",
        "Dz (kolom z diganti) = 27, jadi z = 3. Penyelesaian (2, 1, 3).",
      ],
      notes: [
        "Jangan lupa menyalin dua kolom pertama sebelum menarik garis.",
        "Jika D = 0, rumus {Dx/D} tidak dapat dipakai. Sistemnya tidak mempunyai penyelesaian tunggal.",
        "Menukar urutan dua persamaan mengubah tanda D dan Dx bersamaan, jadi penyelesaiannya tetap.",
      ],
      demo: "Pilih D, Dx, Dy, atau Dz. Kolom yang diganti konstanta diberi warna, dan hasil kali setiap garis ditampilkan.",
    },
    { title: "Banyak penyelesaian SPLTV", lab: "jenis",
      steps: [
        "Sebuah sistem persamaan linear mempunyai tiga kemungkinan: tidak mempunyai penyelesaian, tepat satu penyelesaian, atau tak hingga banyak penyelesaian.",
        "Jika eliminasi menghasilkan pernyataan salah seperti 0 = 3, sistem tidak mempunyai penyelesaian.",
        "Jika eliminasi menghasilkan 0 = 0, satu persamaan sebenarnya gabungan dari persamaan lain. Sistem mempunyai tak hingga banyak penyelesaian.",
        "Jika eliminasi berakhir pada satu nilai seperti 3z = 6, penyelesaiannya tunggal.",
        "Dengan determinan: D ≠ 0 berarti tepat satu penyelesaian. Jika D = 0, penyelesaiannya tidak tunggal, dan eliminasi menentukan apakah muncul 0 = 0 atau pernyataan salah.",
        "Pada soal berparameter, misalnya (t² − 9)z = t − 3, periksa kapan koefisien z menjadi nol dan kapan ruas kanannya nol.",
        "SPLTV homogen tidak pernah masuk kemungkinan pertama, karena (0, 0, 0) selalu menjadi penyelesaian.",
      ],
      life: "Tiga teman ingin menghitung harga satuan buku, pensil, dan penghapus dari tiga struk belanja. Ternyata struk ketiga hanya gabungan dua struk pertama: belanja ketiga sama dengan belanja pertama ditambah belanja kedua, dan harganya juga sama. Struk ketiga tidak memberi informasi baru, sehingga harga satuan tidak bisa dipastikan dan ada tak hingga banyak kemungkinan. Jika harga di struk ketiga salah ketik, tidak ada harga yang cocok untuk ketiganya.",
      example: "Diketahui x + y + z = 6, x − y + z = 2, dan (t² − 9)z = t − 3. Tentukan nilai t agar sistem tidak mempunyai penyelesaian, tepat satu, atau tak hingga banyak.",
      work: [
        "Kurangkan dua persamaan pertama: 2y = 4, jadi y = 2 dan x + z = 4.",
        "Jika t² − 9 ≠ 0 (t ≠ 3 dan t ≠ −3), z = {(t − 3)/(t² − 9)} = {1/(t + 3)}, sehingga ada tepat satu penyelesaian.",
        "Jika t = 3: 0 · z = 0, benar untuk semua z. Tak hingga banyak penyelesaian.",
        "Jika t = −3: 0 · z = −6, pernyataan salah. Sistem tidak mempunyai penyelesaian.",
      ],
      notes: [
        "Periksa nilai parameter yang membuat koefisien nol satu per satu.",
        "Persamaan yang merupakan kelipatan persamaan lain tidak menambah informasi.",
        "D = 0 tidak langsung berarti tak hingga banyak penyelesaian. Cek dulu konsistensinya.",
      ],
      demo: "Ubah nilai t dan perhatikan persamaan ketiga. Peraga menunjukkan jenis penyelesaian dan penyelesaiannya bila tunggal.",
    },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: `${t.code}.${j + 1}`, topic: t })));

/* ---------- Data peraga ---------- */
export const fertilizer = { prices: [80, 110, 140], total: 36, budget: 3840, rows: [[1, 1, 1, 36], [1, -2, 0, 0], [8, 11, 14, 384]] as Row[] };
export const elimPresets: { name: string; rows: Row[] }[] = [
  { name: "Tiga bilangan", rows: [[1, 1, 1, 60], [1, -1, 0, -4], [-1, 0, 1, 14]] },
  { name: "Latihan", rows: [[1, 2, 1, 3], [3, -1, 2, 13], [2, 3, -1, -2]] },
];
export const sarrusPresets: { name: string; rows: Row[] }[] = [
  { name: "Contoh", rows: [[1, 2, 1, 7], [2, -1, 1, 6], [1, 1, -1, 0]] },
  { name: "Pupuk Pak Joko", rows: fertilizer.rows },
];
export type Ciri = { name: string; text: string[]; rows?: Row[]; linear: boolean; linked: boolean };
export const ciriSystems: Ciri[] = [
  { name: "P", text: ["{1/x} + {1/y} + {1/z} = 2", "2p + 3q − r = 6", "p + 3q = 3"], linear: false, linked: false },
  { name: "Q", rows: [[1, 0, 0, -2], [0, 1, 0, 5], [2, -3, -1, 8]], text: [], linear: true, linked: true },
  { name: "R", rows: [[3, 5, 1, 0], [2, 7, 1, 0], [1, -2, 1, 0]], text: [], linear: true, linked: true },
  { name: "S", rows: [[2, 3, 5, 0], [4, 6, 10, 0], [1, -1, 1, 0]], text: [], linear: true, linked: true },
];
export const ciriTriples: number[][] = [[0, 0, 0], [8, 3, -5], [-2, 5, -27]];
/** Teka-teki simbol (Uji Kompetensi 2.2 no. 6, angka diganti). */
export const symbolValues: Record<Sym, number> = { s: 30, b: 38, m: 45 };
const symbolGrid: Sym[][] = [["s", "s", "s", "b"], ["m", "b", "m", "s"], ["s", "b", "b", "m"], ["b", "m", "m", "b"]];
const rowSum = (r: Sym[]) => r.reduce((a, k) => a + symbolValues[k], 0);
const colSum = (c: number) => symbolGrid.reduce((a, r) => a + symbolValues[r[c]], 0);

/* ---------- Latihan (4 per bagian) ---------- */
export const practice: PQuestion[][] = [
  [
    q(0, "Susun model dari tiga kalimat berikut. (1) Jumlah tiga bilangan adalah 30. (2) Bilangan pertama dua kali bilangan kedua. (3) Bilangan ketiga 6 lebih dari bilangan kedua. Misalkan x, y, z = bilangan pertama, kedua, ketiga, lalu tentukan bilangannya.",
      [model("Model:", [[1, 1, 1, 30], [1, -2, 0, 0], [0, -1, 1, 6]]), tri("Penyelesaian", XYZ, [[1, 1, 1, 30], [1, -2, 0, 0], [0, -1, 1, 6]])],
      "x + y + z = 30; x − 2y = 0 (dari x = 2y); −y + z = 6 (dari z = y + 6). Substitusi: 2y + y + y + 6 = 30, jadi y = 6, x = 12, z = 12."),
    q(0, "Pupuk Urea Rp75.000, SS Rp120.000, dan TSP Rp150.000 per karung. Dana pembelian Rp3.225.000. Dengan x, y, z = banyak karung Urea, SS, TSP, pilih persamaan dana yang benar (dalam ribuan rupiah).",
      [ch("Persamaan:", ["x + y + z = 3.225", "75x + 120y + 150z = 3.225", "75x + 120y + 150z = 30"], "75x + 120y + 150z = 3.225")],
      "Setiap karung dikalikan harganya, lalu dijumlahkan dan disamakan dengan dana: 75x + 120y + 150z = 3.225 (ribu rupiah)."),
    q(0, "Pak Anton membeli 30 karung pupuk Urea, SS, dan TSP dengan harga seperti soal sebelumnya, dan dananya Rp3.225.000. Banyak pupuk Urea tiga kali pupuk SS. Berapa karung setiap jenis?",
      [tri("Banyak karung", ["Urea", "SS", "TSP"], [[1, 1, 1, 30], [1, -3, 0, 0], [75, 120, 150, 3225]], "karung")],
      "Model x + y + z = 30, x = 3y, 75x + 120y + 150z = 3.225. Substitusi x = 3y: 4y + z = 30 dan 345y + 150z = 3.225. Dari z = 30 − 4y: 345y + 4.500 − 600y = 3.225, jadi y = 5, x = 15, z = 10.",
      { scene: { type: "table", head: ["Pupuk", "Harga per karung"], rows: [["Urea", "Rp75.000"], ["SS", "Rp120.000"], ["TSP", "Rp150.000"]] } }),
    q(0, "Di warung: 2 kg gula, 1 kg beras, 1 L minyak seharga Rp50.000; 1 kg gula, 2 kg beras, 1 L minyak Rp47.000; 1 kg gula, 1 kg beras, 2 L minyak Rp55.000. Gunakan cara menjumlahkan ketiga persamaan.",
      [n("Harga 1 kg gula + 1 kg beras + 1 L minyak =", 38, "ribu rupiah"), n("Harga 1 L minyak =", 17, "ribu rupiah")],
      "Jumlah ketiga persamaan: 4(g + b + m) = 152, jadi g + b + m = 38. Minyak: m = 55 − 38 = 17 (ribu rupiah)."),
  ],
  [
    q(1, "Ani dan Budi menyelesaikan suatu pekerjaan dalam 4 hari, Ani dan Citra dalam 4 hari, serta Budi dan Citra dalam 6 hari. Misalkan p, q, r = bagian pekerjaan per hari Ani, Budi, Citra.",
      [n("p + q + r =", 1 / 3), tri("Waktu sendirian", ["Ani", "Budi", "Citra"], [[1, 0, 0, 6], [0, 1, 0, 12], [0, 0, 1, 12]], "hari")],
      "p + q = {1/4}, p + r = {1/4}, q + r = {1/6}. Dijumlahkan: 2(p + q + r) = {2/3}, jadi p + q + r = {1/3}. p = {1/3} − {1/6} = {1/6}, q = r = {1/3} − {1/4} = {1/12}. Ani 6 hari, Budi 12 hari, Citra 12 hari."),
    q(1, "Persamaan {1/x} + {1/y} = {1/6} dibuat linear dengan pemisalan p = {1/x} dan q = {1/y}. Hasilnya:",
      [ch("Persamaan baru:", ["{1/p} + {1/q} = {1/6}", "p + q = 6", "p + q = {1/6}"], "p + q = {1/6}")],
      "Ganti {1/x} dengan p dan {1/y} dengan q; ruas kanan tidak berubah: p + q = {1/6}."),
    q(1, "Jika bekerja sendirian, Pak Wayan menyelesaikan pesanan dalam 10 hari, Putu dalam 15 hari, dan I Gede dalam 30 hari. Mereka bekerja bertiga.",
      [n("Bagian pesanan selesai per hari =", 1 / 5), n("Waktu bertiga =", 5, "hari")],
      "{1/10} + {1/15} + {1/30} = {3/30} + {2/30} + {1/30} = {6/30} = {1/5}. Pesanan selesai dalam 5 hari."),
    q(1, "Tentukan benar atau salah setiap pernyataan tentang pekerjaan bersama.",
      [tf(["Jika seseorang menyelesaikan pekerjaan sendirian dalam 8 hari, dalam 1 hari ia menyelesaikan {1/8} bagian.", true],
        ["Jika A sendirian 6 hari dan B sendirian 3 hari, bersama-sama mereka butuh 9 hari.", false],
        ["{1/x} + {1/y} = {1/12} adalah persamaan linear dalam x dan y.", false],
        ["Dengan p = {1/x} dan q = {1/y}, persamaan itu menjadi linear dalam p dan q.", true])],
      "A dan B bersama: {1/6} + {1/3} = {1/2}, jadi 2 hari, bukan 9. Persamaan dengan {1/x} tidak linear dalam x, tetapi linear setelah dimisalkan."),
  ],
  [
    q(2, "Tentukan apakah setiap sistem membentuk SPLTV.",
      [{ kind: "classify", options: ["SPLTV", "Bukan SPLTV"], rows: [
        { text: "x + y + z = 5; 2x − y = 3; y + 4z = 1", answer: "SPLTV" },
        { text: "xy + z = 4; x − y = 1; z = 2", answer: "Bukan SPLTV" },
        { text: "a + b = 3; p − q = 1; m + n = 2", answer: "Bukan SPLTV" },
        { text: "x = 3; y = −1; x + y + z = 6", answer: "SPLTV" },
      ] }],
      "xy tidak linear. Sistem a, b, p, q, m, n tidak memuat tiga variabel yang saling terkait. Sistem keempat dapat ditulis x + 0y + 0z = 3, dan seterusnya."),
    q(2, "Manakah SPLTV homogen?",
      [ch("Sistem:", ["x + y + z = 0; 2x − y = 0; y + 3z = 0", "x + y + z = 1; 2x − y = 0; y + 3z = 0", "x + y = 0; y + z = 0; xz = 0"], "x + y + z = 0; 2x − y = 0; y + 3z = 0")],
      "Homogen berarti semua konstanta nol dan setiap persamaan linear. Pilihan kedua memiliki konstanta 1, pilihan ketiga memuat xz yang tidak linear."),
    q(2, "Tentukan benar atau salah setiap pernyataan tentang ciri SPLTV.",
      [tf(["SPLTV homogen selalu dipenuhi oleh (0, 0, 0).", true],
        ["Penyelesaian (0, 0, 0) disebut penyelesaian trivial.", true],
        ["{1/x} + {1/y} + {1/z} = 2 adalah persamaan linear.", false],
        ["SPLTV dapat diselesaikan dengan menggambar grafik seperti SPLDV.", false])],
      "Persamaan dengan {1/x} tidak linear. Buku menyebutkan SPLTV diselesaikan dengan cara SPLDV kecuali metode grafik."),
    q(2, "Sistem x = 3, y = −2, dan 2x − 3y − z = 4 adalah SPLTV. Tentukan penyelesaiannya.",
      [tri("Penyelesaian", XYZ, [[1, 0, 0, 3], [0, 1, 0, -2], [2, -3, -1, 4]])],
      "2(3) − 3(−2) − z = 4, jadi 12 − z = 4 dan z = 8. Penyelesaian (3, −2, 8)."),
  ],
  [
    q(3, "Persamaan x + y + z = 10 dan x − y + z = 4 dijumlahkan untuk menghilangkan y. Hasilnya berbentuk ax + bz = c.",
      [n("a =", 2), n("b =", 2), n("c =", 14)],
      "(x + y + z) + (x − y + z) = 10 + 4, jadi 2x + 2z = 14.", { scene: sysScene([[1, 1, 1, 10], [1, -1, 1, 4]]) }),
    q(3, "Selesaikan sistem berikut dengan eliminasi dan substitusi.",
      [tri("Penyelesaian", XYZ, [[1, 1, 1, 10], [1, -1, 1, 4], [2, 1, -1, 5]])],
      "(1) − (2): 2y = 6, y = 3. (1) + (2): x + z = 7. Persamaan (3): 2x − z = 2. Dijumlahkan: 3x = 9, x = 3, z = 4.",
      { scene: sysScene([[1, 1, 1, 10], [1, -1, 1, 4], [2, 1, -1, 5]]) }),
    q(3, "Jumlah tiga bilangan sama dengan 51. Bilangan pertama ditambah 6 sama dengan bilangan kedua, dan bilangan ketiga dikurangi 9 sama dengan bilangan pertama. Tentukan ketiga bilangan.",
      [tri("Bilangan", ["pertama", "kedua", "ketiga"], [[1, 1, 1, 51], [1, -1, 0, -6], [-1, 0, 1, 9]])],
      "y = x + 6 dan z = x + 9. Substitusi: 3x + 15 = 51, x = 12, y = 18, z = 21."),
    q(3, "x, y, z adalah penyelesaian sistem berikut. Tentukan nilai x² + y² + z².",
      [n("x^{2} + y^{2} + z^{2} =", 14)],
      "Eliminasi menghasilkan x = 2, y = 3, z = 1, sehingga 4 + 9 + 1 = 14.",
      { scene: sysScene([[3, 4, -5, 13], [2, 5, -1, 18], [6, 2, -3, 15]]) }),
  ],
  [
    q(4, "Gunakan metode determinan untuk sistem berikut.",
      [n("D =", 7), n("Dy =", 14), tri("Penyelesaian", XYZ, [[1, 1, 1, 6], [2, -1, 1, 3], [1, 2, -1, 2]])],
      "D = (1 + 1 + 4) − (−1 + 2 − 2) = 7. Dy = 14, sehingga y = 2. Dengan Dx = 7 dan Dz = 21 diperoleh (1, 2, 3).",
      { scene: sysScene([[1, 1, 1, 6], [2, -1, 1, 3], [1, 2, -1, 2]]) }),
    q(4, "Tentukan D, Dz, dan z dari sistem berikut.",
      [n("D =", -3), n("Dz =", -18), n("z =", 6)],
      "D = (−4 + 0 + 2) − (−3 + 0 + 4) = −3. Dz (kolom z diganti 20, 2, 60) = −18, jadi z = {−18/−3} = 6.",
      { scene: sysScene([[1, 1, 1, 20], [1, -1, 0, 2], [3, 2, 4, 60]]) }),
    q(4, "Pada aturan Sarrus untuk D, hasil kali manakah yang berada pada garis penuh (dijumlahkan dengan tanda +)?",
      [ch("Hasil kali:", ["a₁b₂c₃", "a₃b₂c₁", "a₁b₁c₁"], "a₁b₂c₃")],
      "Garis penuh berjalan miring ke kanan bawah: a₁b₂c₃, b₁c₂a₃, c₁a₂b₃. a₃b₂c₁ ada pada garis putus-putus, dan a₁b₁c₁ bukan diagonal."),
    q(4, "Tentukan benar atau salah setiap pernyataan tentang metode determinan.",
      [tf(["Jika D = 0, rumus x = {Dx/D} tidak dapat dipakai.", true],
        ["Untuk Dy, kolom koefisien y diganti kolom konstanta.", true],
        ["Menukar urutan dua persamaan mengubah penyelesaian (x, y, z).", false],
        ["Variabel yang tidak muncul dalam suatu persamaan diberi koefisien 0 di tabel.", true])],
      "Menukar dua baris mengubah tanda D dan Dx bersamaan, sehingga hasil baginya tetap."),
  ],
  [
    q(5, "Berapa banyak penyelesaian sistem berikut?",
      [ch("Banyak penyelesaian:", COUNT, "Tak hingga banyak")],
      "Persamaan (1) + (2) memberi 2x + 2y = 6, sama dengan persamaan (3). Eliminasi berakhir pada 0 = 0, jadi tak hingga banyak penyelesaian.",
      { scene: sysScene([[1, 1, 1, 4], [1, 1, -1, 2], [2, 2, 0, 6]]) }),
    q(5, "Periksa apakah sistem berikut mempunyai penyelesaian, dan berapa banyak.",
      [ch("Banyak penyelesaian:", COUNT, "Tidak ada")],
      "(1) + (2) memberi 2x + 2y = 6, padahal persamaan (3) menyatakan 2x + 2y = 5. Hasilnya 0 = 1, jadi tidak ada penyelesaian.",
      { scene: sysScene([[1, 1, 1, 4], [1, 1, -1, 2], [2, 2, 0, 5]]) }),
    q(5, "Diketahui x + y + z = 5, x − y + z = 1, dan (t² − 16)z = t − 4.",
      [n("t agar tidak ada penyelesaian =", -4), n("t agar tak hingga banyak penyelesaian =", 4)],
      "Dua persamaan pertama memberi y = 2 dan x + z = 3. t = −4: 0 · z = −8 (salah). t = 4: 0 · z = 0 (selalu benar)."),
    q(5, "Tentukan benar atau salah setiap pernyataan tentang banyak penyelesaian.",
      [tf(["Jika D ≠ 0, SPLTV mempunyai tepat satu penyelesaian.", true],
        ["SPLTV homogen bisa tidak mempunyai penyelesaian.", false],
        ["Jika eliminasi menghasilkan 0 = 5, sistem tidak mempunyai penyelesaian.", true],
        ["Jika eliminasi menghasilkan 0 = 0, sistem pasti mempunyai tepat satu penyelesaian.", false])],
      "Sistem homogen selalu dipenuhi (0, 0, 0). Hasil 0 = 0 menandakan tak hingga banyak penyelesaian."),
  ],
];

/* ---------- Evaluasi 24 soal ---------- */
const S = "Sedang", Mn = "Menantang", SM = "Sangat menantang";
const lvl = (level: Level, x: PQuestion): PQuestion => ({ ...x, level });
export const assessment: PQuestion[] = [
  lvl(S, q(0, "Keliling sebuah segitiga 24 cm. Sisi terpanjang dua kali sisi terpendek dan 4 cm kurang dari jumlah dua sisi lainnya. Misalkan x = sisi terpendek, y = sisi tengah, z = sisi terpanjang. Susun modelnya, lalu tentukan panjang sisi-sisinya.",
    [model("Model:", [[1, 1, 1, 24], [2, 0, -1, 0], [1, 1, -1, 4]]), tri("Panjang sisi", XYZ, [[1, 1, 1, 24], [2, 0, -1, 0], [1, 1, -1, 4]], "cm")],
    "x + y + z = 24; z = 2x ditulis 2x − z = 0; z = x + y − 4 ditulis x + y − z = 4. Dari (1) − (3): 2z = 20, z = 10, x = 5, y = 9.",
    { scene: { type: "triangle", labels: ["x", "y", "z"], caption: "x terpendek, z terpanjang" } })),
  lvl(S, q(3, "Selesaikan sistem berikut.",
    [tri("Penyelesaian", XYZ, [[1, 2, 0, -3], [2, 0, 1, 5], [0, 1, -3, -11]])],
    "Dari (1): x = −3 − 2y. Ke (2): z = 5 − 2x = 11 + 4y. Ke (3): y − 33 − 12y = −11, jadi y = −2, x = 1, z = 3.",
    { scene: sysScene([[1, 2, 0, -3], [2, 0, 1, 5], [0, 1, -3, -11]]) })),
  lvl(S, q(2, "Periksa keempat sistem berikut. Mana yang merupakan SPLTV dan mana yang bukan?",
    [{ kind: "classify", options: ["SPLTV", "Bukan SPLTV"], rows: [
      { text: "x − 2y + 3z = 1; y = 4; x + 5z = 6", answer: "SPLTV" },
      { text: "{1/x} + {1/y} + {3/z} = 9; {1/x} + {3/y} + {1/z} = 5; {3/x} + {1/y} + {1/z} = 7", answer: "Bukan SPLTV" },
      { text: "3x + y = 2; 4y − z = 1; x^{2} + z = 3", answer: "Bukan SPLTV" },
      { text: "2x + y − z = 0; x − y + 2z = 0; x + y + z = 0", answer: "SPLTV" },
    ] }],
    "Sistem kedua memuat {1/x} dan sistem ketiga memuat x², jadi tidak linear. Sistem kedua baru menjadi SPLTV setelah dimisalkan p = {1/x}, q = {1/y}, r = {1/z}.")),
  lvl(S, q(4, "Tentukan D, Dx, dan x dengan metode determinan.",
    [n("D =", -16), n("Dx =", -48), n("x =", 3)],
    "D = (−4 + 9 − 2) − (6 + 12 + 1) = −16. Dx = (−10 + 39 − 14) − (26 + 30 + 7) = −48. x = {−48/−16} = 3.",
    { scene: sysScene([[2, 1, -1, 5], [1, -2, 3, 7], [3, 2, 1, 13]]) })),
  lvl(S, q(1, "Trisna, ayahnya, dan kakeknya memanen tomat bersama dalam 2 jam. Trisna dan kakeknya bersama butuh 3 jam, sedangkan ayah dan kakek bersama butuh 4 jam. Berapa jam masing-masing jika bekerja sendirian?",
    [tri("Waktu sendirian", ["Trisna", "Ayah", "Kakek"], [[1, 0, 0, 4], [0, 1, 0, 6], [0, 0, 1, 12]], "jam")],
    "Misalkan t, a, k = bagian per jam. t + a + k = {1/2}, t + k = {1/3}, a + k = {1/4}. a = {1/2} − {1/3} = {1/6}, t = {1/2} − {1/4} = {1/4}, k = {1/2} − {1/4} − {1/6} = {1/12}. Trisna 4 jam, ayah 6 jam, kakek 12 jam.")),
  lvl(S, q(5, "Selidiki banyak penyelesaian sistem berikut dengan eliminasi.",
    [ch("Banyak penyelesaian:", COUNT, "Tak hingga banyak")],
    "(1) + (2): 3x + 2z = 8, sama persis dengan persamaan (3). Eliminasi berakhir pada 0 = 0, jadi tak hingga banyak penyelesaian.",
    { scene: sysScene([[1, 1, 1, 5], [2, -1, 1, 3], [3, 0, 2, 8]]) })),
  lvl(S, q(0, "Tiket pertunjukan seni: dewasa Rp50.000, pelajar Rp30.000, anak Rp20.000. Terjual 200 tiket dengan penerimaan Rp7.200.000. Banyak tiket dewasa 10 lebih sedikit dari dua kali tiket pelajar. Hitung banyak tiket setiap jenis.",
    [tri("Banyak tiket", ["dewasa", "pelajar", "anak"], [[1, 1, 1, 200], [5, 3, 2, 720], [1, -2, 0, -10]], "tiket")],
    "Model x + y + z = 200, 5x + 3y + 2z = 720 (dibagi 10.000), x = 2y − 10. Substitusi: 3y + z = 210 dan 13y + 2z = 770, sehingga 7y = 350, y = 50, x = 90, z = 60.",
    { scene: { type: "table", head: ["Tiket", "Harga"], rows: [["Dewasa", "Rp50.000"], ["Pelajar", "Rp30.000"], ["Anak", "Rp20.000"]] } })),
  lvl(S, q(3, "Jumlah tiga bilangan sama dengan 64. Bilangan pertama ditambah 5 sama dengan bilangan kedua, dan bilangan ketiga dikurangi 20 sama dengan bilangan pertama. Tentukan ketiga bilangan.",
    [tri("Bilangan", ["pertama", "kedua", "ketiga"], [[1, 1, 1, 64], [1, -1, 0, -5], [-1, 0, 1, 20]])],
    "y = x + 5 dan z = x + 20. Substitusi: 3x + 25 = 64, x = 13, y = 18, z = 33.")),
  lvl(Mn, q(2, "Perhatikan sistem homogen berikut. Tentukan benar atau salah setiap pernyataan.",
    [tf(["Sistem ini dipenuhi oleh (0, 0, 0).", true],
      ["(1, 1, 3) adalah penyelesaian sistem ini.", false],
      ["Sistem ini hanya mempunyai penyelesaian trivial.", true],
      ["Setiap SPLTV homogen hanya mempunyai penyelesaian trivial.", false])],
    "(1, 1, 3) tidak memenuhi persamaan kedua: 1 − 1 + 6 = 6 ≠ 0. D = −7 ≠ 0, jadi sistem ini hanya punya (0, 0, 0). Namun ada sistem homogen lain yang punya penyelesaian nontrivial, misalnya jika satu persamaan kelipatan persamaan lain.",
    { scene: sysScene([[2, 1, -1, 0], [1, -1, 2, 0], [1, 1, 1, 0]]) })),
  lvl(Mn, q(3, "Pabrik lensa mempunyai mesin A, B, dan C. Jika ketiganya bekerja, dihasilkan 6.300 lensa seminggu. Jika hanya A dan B, 3.800 lensa. Jika hanya A dan C, 4.500 lensa. Berapa lensa yang dihasilkan setiap mesin dalam seminggu?",
    [tri("Banyak lensa", ["A", "B", "C"], [[1, 1, 1, 6300], [1, 1, 0, 3800], [1, 0, 1, 4500]], "lensa")],
    "C = 6.300 − 3.800 = 2.500, B = 6.300 − 4.500 = 1.800, A = 3.800 − 1.800 = 2.000.",
    { scene: { type: "table", head: ["Mesin yang bekerja", "Lensa per minggu"], rows: [["A, B, dan C", "6.300"], ["A dan B", "3.800"], ["A dan C", "4.500"]] } })),
  lvl(Mn, q(0, "Dimas, Eka, dan Fajar menimbang badan berpasangan. Hasilnya terlihat pada gambar. Hitung berat badan masing-masing.",
    [tri("Berat badan", ["Dimas", "Eka", "Fajar"], [[1, 1, 0, 104], [0, 1, 1, 98], [1, 0, 1, 96]], "kg")],
    "Jumlahkan ketiga timbangan: 2(D + E + F) = 298, jadi D + E + F = 149. Dimas = 149 − 98 = 51, Eka = 149 − 96 = 53, Fajar = 149 − 104 = 45.",
    { scene: { type: "scales", items: [{ names: "Dimas + Eka", value: 104 }, { names: "Eka + Fajar", value: 98 }, { names: "Dimas + Fajar", value: 96 }] } })),
  lvl(Mn, q(4, "Pupuk Urea Rp80.000, SS Rp100.000, TSP Rp120.000 per karung. Seorang petani membeli 45 karung dengan dana Rp4.500.000, dan Urea dua kali SS. Modelnya ada pada gambar (dana dibagi 10.000). Tentukan D, Dy, dan banyak karung SS.",
    [n("D =", -10), n("Dy =", -90), n("Banyak karung SS =", 9, "karung")],
    "D = (−24 + 0 + 10) − (−16 + 0 + 12) = −10. Dy = (0 + 0 + 450) − (0 + 0 + 540) = −90. y = {−90/−10} = 9.",
    { scene: sysScene([[1, 1, 1, 45], [1, -2, 0, 0], [8, 10, 12, 450]]) })),
  lvl(Mn, q(1, "Pesanan ukiran harus selesai dalam 5 hari. Pak Wayan dan Putu dapat menyelesaikannya dalam 6 hari, Pak Wayan dan I Gede dalam 6 hari, serta Putu dan I Gede dalam 9 hari.",
    [tri("Waktu sendirian", ["Wayan", "Putu", "I Gede"], [[1, 0, 0, 9], [0, 1, 0, 18], [0, 0, 1, 18]], "hari"), n("Waktu bertiga =", 4.5, "hari"), ch("Dapatkah pesanan selesai tepat waktu?", ["Ya, kurang dari 5 hari", "Tidak, lebih dari 5 hari"], "Ya, kurang dari 5 hari")],
    "p + q = {1/6}, p + r = {1/6}, q + r = {1/9}. 2(p + q + r) = {4/9}, jadi p + q + r = {2/9}. p = {2/9} − {1/9} = {1/9}, q = r = {2/9} − {1/6} = {1/18}. Bertiga: {9/2} = 4,5 hari < 5 hari.")),
  lvl(Mn, q(5, "Diketahui x + y + z = 7, x − y + z = 3, dan (t² − 25)z = t − 5.",
    [n("t agar tidak ada penyelesaian =", -5), n("t agar tak hingga banyak penyelesaian =", 5), n("Nilai z jika t = 0 adalah", 1 / 5)],
    "Dua persamaan pertama memberi y = 2 dan x + z = 5. t = −5: 0 · z = −10 (salah). t = 5: 0 · z = 0. t = 0: −25z = −5, jadi z = {1/5}.")),
  lvl(Mn, q(2, "Manakah yang membentuk SPLTV? Tentukan juga penyelesaiannya.",
    [ch("SPLTV:", ["x = 4; y = −1; x + 2y − z = 3", "{1/x} + {1/y} + {1/z} = 3; x − y = 1; z = 2", "x^{2} + y = 5; y − z = 1; x + z = 4"], "x = 4; y = −1; x + 2y − z = 3"),
      tri("Penyelesaian", XYZ, [[1, 0, 0, 4], [0, 1, 0, -1], [1, 2, -1, 3]])],
    "Pilihan kedua dan ketiga memuat bentuk tidak linear. Pilihan pertama: 4 − 2 − z = 3, jadi z = −1.")),
  lvl(Mn, q(3, "Diketahui (x, y, z) memenuhi sistem berikut. Hitung x² + y² + z².",
    [n("x^{2} + y^{2} + z^{2} =", 21)],
    "(1) + (3): 4x + 3y = 13. (2) + 3·(3): 11x + 5y = 39. Diperoleh x = 4, y = −1, lalu z = 2. Nilainya 16 + 1 + 4 = 21.",
    { scene: sysScene([[1, 1, 1, 5], [2, -1, 3, 15], [3, 2, -1, 8]]) })),
  lvl(Mn, q(0, "Seekor ikan mas mempunyai kepala 6 cm. Panjang ekornya sama dengan panjang kepala ditambah sepertiga panjang tubuh. Panjang tubuhnya setengah dari panjang seluruh ikan.",
    [n("Panjang ekor =", 12, "cm"), n("Panjang tubuh =", 18, "cm"), n("Panjang seluruh ikan =", 36, "cm")],
    "Misalkan K = 6, T = tubuh, E = ekor, L = seluruh. E = 6 + {T/3} dan T = {L/2}, sehingga K + E = T. 6 + 6 + {T/3} = T, jadi T = 18, E = 12, L = 36.",
    { scene: { type: "fish", head: "6 cm", body: "tubuh ?", tail: "ekor ?" } })),
  lvl(SM, q(4, "Modal Rp300 juta dibagi untuk tabungan (bunga 5%), deposito (7%), dan obligasi (9%). Pendapatan tahunan seluruhnya Rp19 juta, dan pendapatan tabungan Rp4 juta kurang dari jumlah pendapatan dua investasi lainnya. Model (dalam juta, dikali 100) ada pada gambar.",
    [n("D =", 20), tri("Modal (juta rupiah)", ["tabungan", "deposito", "obligasi"], [[1, 1, 1, 300], [5, 7, 9, 1900], [5, -7, -9, -400]])],
    "D = (−63 + 45 − 35) − (35 − 63 − 45) = 20. Dx = 3.000, jadi tabungan 150 juta. (2) + (3): 10x = 1.500, sama hasilnya. Lalu y + z = 150 dan 7y + 9z = 1.150, sehingga deposito 100 juta dan obligasi 50 juta.",
    { scene: sysScene([[1, 1, 1, 300], [5, 7, 9, 1900], [5, -7, -9, -400]]) })),
  lvl(SM, q(1, "Joni, Deni, dan Ari bersama mengecat sebuah rumah dalam 12 jam. Deni dan Ari bersama butuh 20 jam. Suatu hari mereka bertiga mengecat rumah serupa selama 4 jam, lalu Ari pergi, dan Joni serta Deni butuh 10 jam lagi untuk menyelesaikannya. Berapa jam masing-masing jika bekerja sendirian?",
    [tri("Waktu sendirian", ["Joni", "Deni", "Ari"], [[1, 0, 0, 30], [0, 1, 0, 30], [0, 0, 1, 60]], "jam")],
    "j + d + a = {1/12}, d + a = {1/20}, jadi j = {1/30}. Empat jam bertiga menyelesaikan {4/12} = {1/3} rumah, sisanya {2/3} dikerjakan 10 jam: j + d = {1/15}. d = {1/15} − {1/30} = {1/30}, a = {1/20} − {1/30} = {1/60}. Joni 30 jam, Deni 30 jam, Ari 60 jam.")),
  lvl(SM, q(5, "Tentukan banyak penyelesaian setiap sistem.",
    [{ kind: "classify", options: COUNT, rows: [
      { text: "x + y + z = 3; x − y + z = 1; 2x + 2z = 5", answer: "Tidak ada" },
      { text: "x + y + z = 3; x − y + z = 1; 2x + 2z = 4", answer: "Tak hingga banyak" },
      { text: "x + y + z = 3; x − y + z = 1; x − z = 0", answer: "Tepat satu" },
    ] }],
    "Dua persamaan pertama memberi y = 1 dan x + z = 2, atau 2x + 2z = 4. Sistem pertama bertentangan (4 ≠ 5), sistem kedua tidak memberi informasi baru, sistem ketiga memberi x = z = 1.")),
  lvl(SM, q(0, "Celengan berisi 10 koin Rp100, Rp500, dan Rp1.000 dengan jumlah uang Rp5.800. Setiap jenis koin ada paling sedikit satu. Berapa banyak setiap koin?",
    [tri("Banyak koin", ["Rp100", "Rp500", "Rp1.000"], [[1, 1, 1, 10], [1, 5, 10, 58], [0, 0, 1, 4]], "koin")],
    "x + y + z = 10 dan x + 5y + 10z = 58 (dalam ratusan). Kurangkan: 4y + 9z = 48. Bilangan bulat positif yang mungkin hanya z = 4 dan y = 3 (z = 0 tidak boleh), lalu x = 3.")),
  lvl(SM, q(4, "Fungsi f(x) = ax² + bx + c melalui titik (−1, 6), (1, 2), dan (2, 3). Susun SPLTV dalam a, b, c, lalu gunakan determinan.",
    [n("D =", -6), tri("Nilai", ["a", "b", "c"], [[1, -1, 1, 6], [1, 1, 1, 2], [4, 2, 1, 3]])],
    "Sistemnya a − b + c = 6, a + b + c = 2, 4a + 2b + c = 3. D = (1 − 4 + 2) − (4 + 2 − 1) = −6. Penyelesaian a = 1, b = −2, c = 3, jadi f(x) = x² − 2x + 3.",
    { scene: { type: "points", pts: [[-1, 6], [1, 2], [2, 3]] } })),
  lvl(SM, q(0, "Penjual beras mencampur tiga jenis beras. Campuran 1: 1 kg A, 2 kg B, 3 kg C seharga Rp76.000. Campuran 2: 2 kg A dan 3 kg B seharga Rp63.000. Campuran 3: 1 kg B dan 1 kg C seharga Rp24.000.",
    [ch("Beras yang paling mahal:", ["Beras C", "Beras A", "Beras B"], "Beras A"), n("Harga 1 kg beras termahal =", 15000, "rupiah")],
    "Model a + 2b + 3c = 76, 2a + 3b = 63, b + c = 24 (ribu). Dari c = 24 − b: a − b = 4, lalu 2(b + 4) + 3b = 63, b = 11, a = 15, c = 13. Beras A paling mahal, Rp15.000/kg.",
    { scene: { type: "table", head: ["Campuran", "A", "B", "C", "Harga"], rows: [["1", "1 kg", "2 kg", "3 kg", "Rp76.000"], ["2", "2 kg", "3 kg", "—", "Rp63.000"], ["3", "—", "1 kg", "1 kg", "Rp24.000"]] } })),
  lvl(SM, q(3, "Setiap simbol mewakili sebuah bilangan. Jumlah setiap baris ada di kanan, dan jumlah setiap kolom ada di bawah. Tentukan bilangan pengganti tanda tanya.",
    [n("? =", colSum(2))],
    `Misalkan bintang empat = s, bintang lima = b, matahari = m. Dari tiga baris pertama: 3s + b = ${rowSum(symbolGrid[0])}, s + b + 2m = ${rowSum(symbolGrid[1])}, s + 2b + m = ${rowSum(symbolGrid[2])}. Diperoleh s = 30, b = 38, m = 45. Kolom ketiga berisi s, m, b, m: 30 + 45 + 38 + 45 = ${colSum(2)}.`,
    { scene: { type: "symbols", grid: symbolGrid, rowSums: symbolGrid.map(rowSum), colSums: [0, 1, 2, 3].map(c => (c === 2 ? null : colSum(c))) } })),
];
