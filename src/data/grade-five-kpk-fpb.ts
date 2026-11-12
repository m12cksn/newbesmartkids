import type { Question } from "./grade-four-whole-numbers";

/*
 * Kelas 5 Bab 2 - KPK dan FPB (Buku Matematika SD/MI Kelas V, hlm. 29-62).
 * Jenis soal dan cara menjawab mengikuti buku; angka, gambar, dan tingkat kesulitan diganti.
 */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Hitungan dasar ---------- */
export const factorsOf = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter(d => n % d === 0);
export const isPrime = (n: number) => n > 1 && factorsOf(n).length === 2;
export const primeFactors = (n: number) => { const out: number[] = []; let m = n; for (let p = 2; m > 1; p++) while (m % p === 0) { out.push(p); m /= p; } return out; };
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
export const gcdAll = (xs: number[]) => xs.reduce(gcd);
export const lcmAll = (xs: number[]) => xs.reduce(lcm);
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
/** Pembagian berulang dengan pembagi prima terkecil lebih dulu. */
export function ladderRows(nums: number[]) {
  const rows: { d: number; q: number[] }[] = []; let cur = [...nums];
  while (cur.some(x => x > 1)) { let p = 2; while (!cur.some(x => x % p === 0)) p++; cur = cur.map(x => (x % p === 0 ? x / p : x)); rows.push({ d: p, q: cur }); }
  return rows;
}

export const things = {
  mawarMerah: "mawar merah", mawarPutih: "mawar putih", susu: "susu kotak", lolipop: "permen lolipop", biskuit: "bungkus biskuit",
  siswaPutri: "siswa perempuan", siswaPutra: "siswa laki-laki", lampu: "lampu lalu lintas",
} as const;
export type Thing = keyof typeof things;
export type Month = { name: string; days: number; first: number };
export const months = { juli: { name: "Juli", days: 31, first: 5 }, agustus: { name: "Agustus", days: 31, first: 1 }, september: { name: "September", days: 30, first: 4 } } satisfies Record<string, Month>;

export type Scene =
  | { type: "items"; rows: { thing: Thing; n: number }[] }
  | { type: "lights"; seconds: number[]; start: string }
  | { type: "strip"; n: number };

export type Part =
  | { kind: "number"; label: string; answer: number }
  /** Tabel bilangan 1..n; ketuk bilangan yang diminta. */
  | { kind: "grid"; label: string; n: number; answer: number[] }
  /** Tulis beberapa bilangan; urutan bebas. */
  | { kind: "list"; label: string; answer: number[] }
  /** Pelangi faktor: 1 dan n sudah ditulis. */
  | { kind: "rainbow"; n: number }
  /** Potong kertas berpetak n: isi banyak potongan untuk setiap panjang bagian. */
  | { kind: "cut"; n: number; lengths: number[] }
  /** Papan congklak lubang 1-28: biji pemain 1 di faktor a, pemain 2 di faktor b, lalu FPB. */
  | { kind: "congklak"; a: number; b: number }
  /** Baris kelipatan; tandai bilangan yang sama, lalu tulis KPK. */
  | { kind: "rows"; nums: number[]; len: number }
  /** Kalender: ketuk tanggal jawaban. */
  | { kind: "calendar"; month: keyof typeof months; start: number; who: [string, string]; every: [number, number] }
  /** Pohon faktor: pecah bilangan sampai semua daun prima. */
  | { kind: "tree"; n: number }
  /** Faktorisasi prima dua bilangan, lalu KPK dan FPB. */
  | { kind: "factorize"; nums: [number, number] }
  /** Pembagian berulang. */
  | { kind: "ladder"; nums: number[] }
  | { kind: "time"; label: string; answer: [number, number] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "choice"; label: string; options: string[]; answer: string };

export type KQuestion = Question & { topic: 0 | 1 | 2 | 3 | 4 | 5; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Isian ---------- */
export const fieldCount = (p: Part) => {
  switch (p.kind) {
    case "list": return p.answer.length;
    case "rainbow": return factorsOf(p.n).length - 2;
    case "cut": return p.lengths.length;
    case "congklak": return 3;
    case "rows": return 2;
    case "factorize": return 4;
    case "ladder": return ladderRows(p.nums).length + 2;
    case "time": return 2;
    case "tf": return p.statements.length;
    default: return 1;
  }
};
const sortJoin = (xs: number[]) => [...xs].sort((a, b) => a - b).join(",");
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "number": return [String(p.answer)];
    case "grid": return [sortJoin(p.answer)];
    case "list": return p.answer.map(String);
    case "rainbow": return factorsOf(p.n).slice(1, -1).map(String);
    case "cut": return p.lengths.map(l => String(p.n / l));
    case "congklak": return [sortJoin(factorsOf(p.a)), sortJoin(factorsOf(p.b)), String(gcd(p.a, p.b))];
    case "rows": { const common = commonInRows(p); return [sortJoin(common), String(lcmAll(p.nums))]; }
    case "calendar": return [String(p.start + lcm(...p.every))];
    case "tree": return [primeFactors(p.n).join(",")];
    case "factorize": return [primeFactors(p.nums[0]).join(","), primeFactors(p.nums[1]).join(","), String(lcm(...p.nums)), String(gcd(...p.nums))];
    case "ladder": return [...ladderRows(p.nums).map(r => [r.d, ...r.q].join(",")), String(lcmAll(p.nums)), String(gcdAll(p.nums))];
    case "time": return p.answer.map(String);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "choice": return [p.answer];
  }
}
export const rowValues = (p: Extract<Part, { kind: "rows" }>) => p.nums.map(n => range(1, p.len).map(k => k * n));
export function commonInRows(p: Extract<Part, { kind: "rows" }>) { const rs = rowValues(p); return rs[0].filter(x => rs.every(r => r.includes(x))); }

/* ---------- Pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const int = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v.trim()) ? Number(v) : NaN);
const nums = (v: string) => (v ? v.split(",").map(Number) : []);
const sameMultiset = (a: number[], b: number[]) => sortJoin(a) === sortJoin(b);

/** Pembagian berulang benar jika setiap baris membagi dengan bilangan prima dan berakhir di 1. */
export function ladderOk(start: number[], rows: string[]) {
  let cur = [...start];
  for (const r of rows) {
    const [d, ...q] = r.split(",").map(x => int(x));
    if (!isPrime(d) || q.length !== cur.length || !cur.some(x => x % d === 0)) return false;
    const next = cur.map(x => (x % d === 0 ? x / d : x));
    if (next.some((x, i) => x !== q[i])) return false;
    cur = next;
  }
  return cur.every(x => x === 1);
}
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v), want = fields(p);
  switch (p.kind) {
    case "grid": return sortJoin(nums(v)) === want[0];
    case "list": return sameMultiset(x.map(Number), p.answer) && x.every(y => !Number.isNaN(int(y)));
    case "congklak": return sortJoin(nums(x[0])) === want[0] && sortJoin(nums(x[1])) === want[1] && int(x[2]) === Number(want[2]);
    case "rows": return sortJoin(nums(x[0])) === want[0] && int(x[1]) === Number(want[1]);
    case "tree": return sameMultiset(nums(v), primeFactors(p.n));
    case "factorize": return sameMultiset(nums(x[0]), primeFactors(p.nums[0])) && sameMultiset(nums(x[1]), primeFactors(p.nums[1])) && int(x[2]) === Number(want[2]) && int(x[3]) === Number(want[3]);
    case "ladder": { const k = x.length - 2; return ladderOk(p.nums, x.slice(0, k)) && int(x[k]) === Number(want[k]) && int(x[k + 1]) === Number(want[k + 1]); }
    case "tf": case "choice": return x.join("|") === want.join("|");
    default: return want.every((w, i) => int(x[i]) === Number(w));
  }
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "grid": case "tree": return Boolean(v);
    case "congklak": return Boolean(x[0]) && Boolean(x[1]) && !Number.isNaN(int(x[2]));
    case "rows": return Boolean(x[0]) && !Number.isNaN(int(x[1]));
    case "factorize": return Boolean(x[0]) && Boolean(x[1]) && !Number.isNaN(int(x[2])) && !Number.isNaN(int(x[3]));
    case "ladder": { const k = x.length - 2; return x.slice(0, k).every(r => r.split(",").every(y => !Number.isNaN(int(y))) && r.split(",").length === p.nums.length + 1) && !Number.isNaN(int(x[k])) && !Number.isNaN(int(x[k + 1])); }
    case "tf": return x.every(Boolean);
    case "choice": case "calendar": return Boolean(v);
    default: return x.every(y => !Number.isNaN(int(y)));
  }
}
export const correct = (q: KQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: KQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const times = (v: string) => (v ? v.split(",").join(" × ") : "…");
export function formatAnswer(q: KQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]), d = (s: string) => s || "…";
    switch (p.kind) {
      case "number": return `${p.label} ${d(x[0])}`;
      case "grid": return `${p.label}: ${v[i] ? v[i].split(",").join(", ") : "…"}`;
      case "list": return x.map(d).join(", ");
      case "rainbow": return `faktor ${p.n}: 1, ${x.map(d).join(", ")}, ${p.n}`;
      case "cut": return p.lengths.map((l, k) => `panjang ${l} → ${d(x[k])} potong`).join("; ");
      case "congklak": return `faktor ${p.a}: ${d(x[0])}; faktor ${p.b}: ${d(x[1])}; FPB ${d(x[2])}`;
      case "rows": return `kelipatan persekutuan ${d(x[0])}; KPK ${d(x[1])}`;
      case "calendar": return `tanggal ${d(v[i])} ${months[p.month].name}`;
      case "tree": return `${p.n} = ${times(v[i])}`;
      case "factorize": return `${p.nums[0]} = ${times(x[0])}; ${p.nums[1]} = ${times(x[1])}; KPK ${d(x[2])}; FPB ${d(x[3])}`;
      case "ladder": { const k = x.length - 2; return `${x.slice(0, k).map(r => r || "…").join(" / ")}; KPK ${d(x[k])}; FPB ${d(x[k + 1])}`; }
      case "time": return `pukul ${d(x[0])}.${x[1] ? x[1].padStart(2, "0") : "…"}`;
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      default: return d(v[i]);
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: KQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): KQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const multiples = (k: number, n: number) => range(1, Math.floor(n / k)).map(i => i * k);
const grid = (label: string, n: number, answer: number[]): Part => ({ kind: "grid", label, n, answer });
const primesTo = (n: number) => range(2, n).filter(isPrime);

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Kelipatan", short: "Kelipatan",
    steps: [
      "Kelipatan suatu bilangan adalah hasil kali bilangan itu dengan 1, 2, 3, 4, dan seterusnya. Kelipatan 3: 3, 6, 9, 12, …",
      "0 yang diperoleh dari 0 × 3 tidak dihitung sebagai kelipatan 3.",
      "Pada tabel 1–100, kelipatan 3 muncul setiap 3 kotak. Hitung lompat 3-3 untuk menemukannya.",
      "Permainan tepuk kelipatan: bertepuk tangan setiap kali giliranmu jatuh pada bilangan kelipatan.",
    ],
    demo: "Pilih bilangan, lalu ketuk semua kelipatannya pada tabel. Kotak yang benar berwarna hijau.",
  },
  {
    code: "B", title: "Kelipatan Persekutuan", short: "Kelipatan persekutuan",
    steps: [
      "Kelipatan persekutuan adalah bilangan yang menjadi kelipatan dua bilangan atau lebih sekaligus. 6, 12, 18 adalah kelipatan 2 dan juga kelipatan 3.",
      "Kelipatan persekutuan yang paling kecil disebut KPK.",
      "Cara mencari KPK 4 dan 5: tulis kelipatan 4 dan kelipatan 5, tandai bilangan yang sama, lalu ambil yang terkecil, yaitu 20.",
      "KPK dipakai untuk jadwal yang berulang. Latihan setiap 3 hari dan setiap 4 hari akan bersamaan lagi 12 hari kemudian.",
    ],
    demo: "Atur dua bilangan. Bilangan yang muncul di kedua baris ditandai, dan jadwal keduanya terlihat di kalender.",
  },
  {
    code: "C", title: "Faktor", short: "Faktor",
    steps: [
      "Faktor suatu bilangan adalah bilangan cacah yang membaginya tanpa sisa.",
      "Kertas 12 petak dapat dipotong sama panjang tanpa sisa dengan panjang 1, 2, 3, 4, 6, atau 12. Jadi faktor 12 adalah 1, 2, 3, 4, 6, 12.",
      "Faktor selalu berpasangan: 1 × 18, 2 × 9, 3 × 6. Tulis dari yang terkecil seperti pelangi.",
      "Berhenti mencari ketika pasangan mulai berulang.",
    ],
    demo: "Pilih panjang kertas dan panjang tiap bagian. Lihat apakah kertas habis terpotong tanpa sisa.",
  },
  {
    code: "D", title: "Faktor Persekutuan", short: "Faktor persekutuan",
    steps: [
      "Faktor persekutuan adalah faktor yang dimiliki dua bilangan atau lebih sekaligus.",
      "Faktor 12: 1, 2, 3, 4, 6, 12. Faktor 18: 1, 2, 3, 6, 9, 18. Faktor persekutuannya 1, 2, 3, 6.",
      "Faktor persekutuan yang paling besar disebut FPB. FPB dari 12 dan 18 adalah 6.",
      "FPB dipakai untuk membagi benda sama banyak ke wadah sebanyak-banyaknya, misalnya bunga ke dalam vas.",
    ],
    demo: "Main congklak faktor: letakkan biji pemain 1 di lubang faktor bilangan pertama dan biji pemain 2 di lubang faktor bilangan kedua. Lubang berisi dua biji adalah faktor persekutuan.",
  },
  {
    code: "E", title: "Menentukan KPK dan FPB dengan Menggunakan Faktor Prima", short: "Faktor prima",
    steps: [
      "Bilangan prima hanya dapat dibagi oleh 1 dan bilangan itu sendiri. 1 bukan bilangan prima. Saringan Eratosthenes membantu menemukannya.",
      "Pohon faktor: pecah bilangan menjadi dua faktor sampai semua ujungnya bilangan prima. 300 = 2 × 2 × 3 × 5 × 5.",
      "KPK: kalikan semua faktor prima, yang berpasangan cukup ditulis sekali. FPB: kalikan faktor prima yang berpasangan saja.",
      "Jika tidak ada faktor prima yang berpasangan, FPB-nya 1. Contoh: 15 = 3 × 5 dan 28 = 2 × 2 × 7, jadi FPB dari 15 dan 28 adalah 1.",
    ],
    demo: "Pilih bilangan, lalu ketuk bilangan prima untuk memecahnya pada pohon faktor sampai semua ujungnya prima.",
  },
  {
    code: "F", title: "Menentukan KPK dan FPB dengan Pembagian Berulang", short: "Pembagian berulang",
    steps: [
      "Tulis bilangan-bilangannya berdampingan dalam satu baris.",
      "Bagi dengan bilangan prima terkecil yang dapat membagi, mulai dari 2. Bilangan yang tidak habis dibagi ditulis lagi apa adanya.",
      "Ulangi di baris berikutnya sampai semua bilangan menjadi 1.",
      "KPK = kalikan semua pembagi. FPB = kalikan pembagi yang membagi semua bilangan sekaligus. Kalau tidak ada, FPB-nya 1.",
    ],
    demo: "Ketuk bilangan prima untuk membagi. Baris yang membagi semua bilangan diberi tanda FPB. KPK dan FPB terbentuk dari pembagi yang kamu pilih.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: KQuestion[][] = [
  [
    q(0, "Ketuklah semua bilangan kelipatan 6 pada tabel berikut.", [grid("Kelipatan 6", 60, multiples(6, 60))], "Kelipatan 6: 6, 12, 18, 24, 30, 36, 42, 48, 54, 60. Lompat 6 kotak setiap kali."),
    q(0, "Tuliskan 5 bilangan kelipatan 7 yang pertama.", [{ kind: "list", label: "Kelipatan 7", answer: [7, 14, 21, 28, 35] }], "1 × 7 = 7, 2 × 7 = 14, 3 × 7 = 21, 4 × 7 = 28, 5 × 7 = 35."),
    q(0, "Bilangan manakah yang merupakan kelipatan 7?", [{ kind: "choice", label: "Kelipatan 7", options: ["35", "27", "45", "57"], answer: "35" }], "35 = 5 × 7. 27, 45, dan 57 tidak habis dibagi 7."),
    q(0, "Kelipatan 8 yang ke-9 adalah ….", [{ kind: "number", label: "Kelipatan 8 ke-9 =", answer: 72 }], "Kelipatan ke-9 dari 8 adalah 9 × 8 = 72."),
  ],
  [
    q(1, "Ketuklah bilangan yang merupakan kelipatan 2 dan juga kelipatan 3, lalu tentukan KPK-nya.", [grid("Kelipatan 2 dan 3", 50, multiples(6, 50)), { kind: "number", label: "KPK dari 2 dan 3 =", answer: 6 }], "Bilangan yang habis dibagi 2 dan 3: 6, 12, 18, 24, 30, 36, 42, 48. Yang terkecil 6."),
    q(1, "Tandai bilangan yang sama pada kelipatan 4 dan kelipatan 5, lalu tentukan KPK-nya.", [{ kind: "rows", nums: [4, 5], len: 10 }], "Kelipatan 4 dan 5 yang sama: 20 dan 40. KPK-nya 20."),
    q(1, "Nisa berlatih renang setiap 3 hari dan Yohana setiap 4 hari. Tanggal 3 Agustus mereka berlatih bersama. Ketuk tanggal mereka berlatih bersama lagi.", [{ kind: "calendar", month: "agustus", start: 3, who: ["Nisa", "Yohana"], every: [3, 4] }], "KPK dari 3 dan 4 adalah 12. 3 Agustus + 12 hari = 15 Agustus."),
    q(1, "Tentukan KPK dari 3, 4, dan 5.", [{ kind: "number", label: "KPK dari 3, 4, dan 5 =", answer: 60 }], "Kelipatan 5 yang juga kelipatan 3 dan 4: 60 adalah yang terkecil. 3, 4, 5 tidak punya faktor persekutuan selain 1, jadi KPK = 3 × 4 × 5 = 60."),
  ],
  [
    q(2, "Kertas berpetak sepanjang 12 petak dipotong sama panjang tanpa sisa. Lengkapi tabel hasil pemotongan.", [{ kind: "cut", n: 12, lengths: [1, 2, 3, 4, 6, 12] }], "12 : 1 = 12, 12 : 2 = 6, 12 : 3 = 4, 12 : 4 = 3, 12 : 6 = 2, 12 : 12 = 1."),
    q(2, "Lengkapi lingkaran berikut dengan faktor dari 18. Urutkan dari yang paling kecil.", [{ kind: "rainbow", n: 18 }], "Pasangan faktor 18: 1 × 18, 2 × 9, 3 × 6. Urutannya 1, 2, 3, 6, 9, 18."),
    q(2, "Tentukan faktor-faktor dari 24.", [{ kind: "rainbow", n: 24 }], "Pasangan faktor 24: 1 × 24, 2 × 12, 3 × 8, 4 × 6. Urutannya 1, 2, 3, 4, 6, 8, 12, 24."),
    q(2, "Bilangan manakah yang bukan faktor dari 30?", [{ kind: "choice", label: "Bukan faktor 30", options: ["5", "12", "6", "15"], answer: "12" }], "30 : 12 = 2 sisa 6, jadi 12 bukan faktor 30. 5, 6, dan 15 membagi 30 tanpa sisa."),
  ],
  [
    q(3, "Main congklak faktor 6 dan 12. Ketuk lubang faktor 6 dengan biji pemain 1 dan lubang faktor 12 dengan biji pemain 2. Lalu tentukan FPB-nya.", [{ kind: "congklak", a: 6, b: 12 }], "Faktor 6: 1, 2, 3, 6. Faktor 12: 1, 2, 3, 4, 6, 12. Lubang berisi dua biji: 1, 2, 3, 6. FPB-nya 6."),
    q(3, "Main congklak faktor 12 dan 28, lalu tentukan FPB-nya.", [{ kind: "congklak", a: 12, b: 28 }], "Faktor 12: 1, 2, 3, 4, 6, 12. Faktor 28: 1, 2, 4, 7, 14, 28. Faktor persekutuan 1, 2, 4. FPB-nya 4."),
    q(3, "Ibu membeli 24 tangkai mawar merah dan 18 tangkai mawar putih. Setiap vas berisi mawar merah sama banyak dan mawar putih sama banyak. Bunga dibagi ke vas sebanyak-banyaknya.", [
      { kind: "number", label: "Banyak vas paling banyak:", answer: 6 }, { kind: "number", label: "Mawar merah di setiap vas:", answer: 4 }, { kind: "number", label: "Mawar putih di setiap vas:", answer: 3 }],
      "FPB dari 24 dan 18 adalah 6, jadi ada 6 vas. 24 : 6 = 4 mawar merah dan 18 : 6 = 3 mawar putih.", { scene: { type: "items", rows: [{ thing: "mawarMerah", n: 24 }, { thing: "mawarPutih", n: 18 }] } }),
    q(3, "Temukan FPB dari 15 dan 35. Tuliskan faktor-faktornya lebih dulu.", [{ kind: "rainbow", n: 15 }, { kind: "rainbow", n: 35 }, { kind: "list", label: "Faktor persekutuan 15 dan 35", answer: [1, 5] }, { kind: "number", label: "FPB dari 15 dan 35 =", answer: 5 }],
      "Faktor 15: 1, 3, 5, 15. Faktor 35: 1, 5, 7, 35. Faktor persekutuannya 1 dan 5. FPB-nya 5."),
  ],
  [
    q(4, "Gunakan saringan Eratosthenes. Ketuk semua bilangan prima dari 1 sampai 30.", [grid("Bilangan prima", 30, primesTo(30))], "Hapus 1, lalu hapus kelipatan 2, 3, dan 5 setelah bilangan itu. Tersisa 2, 3, 5, 7, 11, 13, 17, 19, 23, 29."),
    q(4, "Tentukan faktorisasi prima dari 60 dengan menggunakan pohon faktor.", [{ kind: "tree", n: 60 }], "60 = 2 × 30 = 2 × 2 × 15 = 2 × 2 × 3 × 5."),
    q(4, "Tentukan KPK dan FPB dari 18 dan 45 dengan faktorisasi prima.", [{ kind: "factorize", nums: [18, 45] }], "18 = 2 × 3 × 3 dan 45 = 3 × 3 × 5. KPK = 2 × 3 × 3 × 5 = 90. Berpasangan: 3 dan 3, jadi FPB = 9."),
    q(4, "Tentukan KPK dan FPB dari 27 dan 81 dengan faktorisasi prima.", [{ kind: "factorize", nums: [27, 81] }], "27 = 3 × 3 × 3 dan 81 = 3 × 3 × 3 × 3. KPK = 3 × 3 × 3 × 3 = 81. FPB = 3 × 3 × 3 = 27."),
  ],
  [
    q(5, "Tentukan KPK dan FPB dari 12 dan 18 dengan pembagian berulang.", [{ kind: "ladder", nums: [12, 18] }], "Bagi 2: 6, 9. Bagi 2: 3, 9. Bagi 3: 1, 3. Bagi 3: 1, 1. KPK = 2 × 2 × 3 × 3 = 36. Pembagi yang membagi keduanya: 2 (baris 1) dan 3 (baris 3), jadi FPB = 6."),
    q(5, "Tentukan KPK dan FPB dari 24 dan 36 dengan pembagian berulang.", [{ kind: "ladder", nums: [24, 36] }], "Pembaginya 2, 2, 2, 3, 3. KPK = 2 × 2 × 2 × 3 × 3 = 72. Pembagi yang membagi keduanya: 2, 2, 3, jadi FPB = 12."),
    q(5, "Tentukan KPK dan FPB dari 8, 12, dan 20 dengan pembagian berulang.", [{ kind: "ladder", nums: [8, 12, 20] }], "Bagi 2: 4, 6, 10. Bagi 2: 2, 3, 5. Bagi 2: 1, 3, 5. Bagi 3: 1, 1, 5. Bagi 5: 1, 1, 1. KPK = 2 × 2 × 2 × 3 × 5 = 120. Dua baris pertama membagi ketiganya, jadi FPB = 2 × 2 = 4."),
    q(5, "Tentukan KPK dan FPB dari 45 dan 60 dengan pembagian berulang.", [{ kind: "ladder", nums: [45, 60] }], "Bagi 2: 45, 30. Bagi 2: 45, 15. Bagi 3: 15, 5. Bagi 3: 5, 5. Bagi 5: 1, 1. KPK = 2 × 2 × 3 × 3 × 5 = 180. Pembagi yang membagi keduanya: 3 dan 5, jadi FPB = 15."),
  ]
];

/* ---------- Evaluasi: 24 soal ---------- */
export const assessment: KQuestion[] = [
  // Sedang
  q(0, "Ketuklah semua bilangan kelipatan 7 pada tabel berikut.", [grid("Kelipatan 7", 70, multiples(7, 70))], "Kelipatan 7 sampai 70: 7, 14, 21, 28, 35, 42, 49, 56, 63, 70.", { level: "Sedang" }),
  q(2, "Kertas berpetak sepanjang 16 petak dipotong sama panjang tanpa sisa. Lengkapi tabel hasil pemotongan.", [{ kind: "cut", n: 16, lengths: [1, 2, 4, 8, 16] }], "16 : 1 = 16, 16 : 2 = 8, 16 : 4 = 4, 16 : 8 = 2, 16 : 16 = 1.", { level: "Sedang" }),
  q(1, "Ketuklah bilangan yang merupakan kelipatan 4 dan juga kelipatan 6, lalu tentukan KPK-nya.", [grid("Kelipatan 4 dan 6", 50, multiples(12, 50)), { kind: "number", label: "KPK dari 4 dan 6 =", answer: 12 }], "Kelipatan 4 yang juga kelipatan 6: 12, 24, 36, 48. KPK-nya 12.", { level: "Sedang" }),
  q(3, "Main congklak faktor 8 dan 20, lalu tentukan FPB-nya.", [{ kind: "congklak", a: 8, b: 20 }], "Faktor 8: 1, 2, 4, 8. Faktor 20: 1, 2, 4, 5, 10, 20. Faktor persekutuan 1, 2, 4. FPB-nya 4.", { level: "Sedang" }),
  q(4, "Gunakan saringan Eratosthenes. Ketuk semua bilangan prima dari 1 sampai 50.", [grid("Bilangan prima", 50, primesTo(50))], "Hapus 1 dan kelipatan 2, 3, 5, 7 setelah bilangan itu. Bilangan prima sampai 50 ada 15: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47.", { level: "Sedang" }),
  q(0, "Tuliskan semua bilangan kelipatan 9 yang kurang dari 50.", [{ kind: "list", label: "Kelipatan 9", answer: [9, 18, 27, 36, 45] }], "9, 18, 27, 36, 45. Kelipatan berikutnya 54 sudah lebih dari 50.", { level: "Sedang" }),
  q(2, "Lengkapi lingkaran berikut dengan faktor dari 20. Urutkan dari yang paling kecil.", [{ kind: "rainbow", n: 20 }], "Pasangan faktor 20: 1 × 20, 2 × 10, 4 × 5. Urutannya 1, 2, 4, 5, 10, 20.", { level: "Sedang" }),
  q(5, "Tentukan KPK dan FPB dari 20 dan 30 dengan pembagian berulang.", [{ kind: "ladder", nums: [20, 30] }],
    "Bagi 2: 10, 15. Bagi 2: 5, 15. Bagi 3: 5, 5. Bagi 5: 1, 1. KPK = 2 × 2 × 3 × 5 = 60. Pembagi yang membagi keduanya: 2 dan 5, jadi FPB = 10.", { level: "Sedang" }),
  // Menantang
  q(4, "Tentukan faktorisasi prima dari 84 dengan menggunakan pohon faktor.", [{ kind: "tree", n: 84 }], "84 = 2 × 42 = 2 × 2 × 21 = 2 × 2 × 3 × 7.", { level: "Menantang" }),
  q(3, "Ibu membeli 30 tangkai mawar merah dan 20 tangkai mawar putih. Setiap vas berisi mawar merah sama banyak dan mawar putih sama banyak. Bunga dibagi ke vas sebanyak-banyaknya.", [
    { kind: "number", label: "Banyak vas paling banyak:", answer: 10 }, { kind: "number", label: "Mawar merah di setiap vas:", answer: 3 }, { kind: "number", label: "Mawar putih di setiap vas:", answer: 2 }],
    "FPB dari 30 dan 20 adalah 10. 30 : 10 = 3 mawar merah dan 20 : 10 = 2 mawar putih di setiap vas.", { level: "Menantang", scene: { type: "items", rows: [{ thing: "mawarMerah", n: 30 }, { thing: "mawarPutih", n: 20 }] } }),
  q(0, "Bilangan manakah yang bukan kelipatan 6?", [{ kind: "choice", label: "Bukan kelipatan 6", options: ["42", "54", "64", "72"], answer: "64" }], "42 = 7 × 6, 54 = 9 × 6, 72 = 12 × 6. 64 : 6 = 10 sisa 4, jadi 64 bukan kelipatan 6.", { level: "Menantang" }),
  q(1, "Tandai bilangan yang sama pada kelipatan 6 dan kelipatan 8, lalu tentukan KPK-nya.", [{ kind: "rows", nums: [6, 8], len: 10 }], "Kelipatan 6: 6, 12, 18, 24, 30, 36, 42, 48, 54, 60. Kelipatan 8: 8, 16, 24, 32, 40, 48, 56, 64, 72, 80. Yang sama 24 dan 48. KPK-nya 24.", { level: "Menantang" }),
  q(2, "Tentukan faktor-faktor dari 36. Urutkan dari yang paling kecil.", [{ kind: "rainbow", n: 36 }], "Pasangan faktor 36: 1 × 36, 2 × 18, 3 × 12, 4 × 9, 6 × 6. 6 ditulis sekali. Faktornya 1, 2, 3, 4, 6, 9, 12, 18, 36.", { level: "Menantang" }),
  q(3, "Temukan FPB dari 12 dan 42. Tuliskan faktor-faktornya lebih dulu.", [{ kind: "rainbow", n: 12 }, { kind: "rainbow", n: 42 }, { kind: "list", label: "Faktor persekutuan 12 dan 42", answer: [1, 2, 3, 6] }, { kind: "number", label: "FPB dari 12 dan 42 =", answer: 6 }],
    "Faktor 12: 1, 2, 3, 4, 6, 12. Faktor 42: 1, 2, 3, 6, 7, 14, 21, 42. Faktor persekutuan 1, 2, 3, 6. FPB-nya 6.", { level: "Menantang" }),
  q(5, "Tentukan KPK dan FPB dari 42 dan 60 dengan pembagian berulang.", [{ kind: "ladder", nums: [42, 60] }], "Pembagi prima: 2, 2, 3, 5, 7. KPK = 2 × 2 × 3 × 5 × 7 = 420. Pembagi yang membagi keduanya: 2 dan 3, jadi FPB = 6.", { level: "Menantang" }),
  q(1, "Dinda les piano setiap 4 hari dan Amelia setiap 6 hari. Tanggal 5 Juli mereka les bersama. Ketuk tanggal paling dekat mereka les bersama lagi.", [{ kind: "calendar", month: "juli", start: 5, who: ["Dinda", "Amelia"], every: [4, 6] }],
    "KPK dari 4 dan 6 adalah 12. 5 Juli + 12 hari = 17 Juli.", { level: "Menantang" }),
  q(0, "Ketuklah semua bilangan kelipatan 12 pada tabel berikut.", [grid("Kelipatan 12", 100, multiples(12, 100))], "12, 24, 36, 48, 60, 72, 84, 96. Kelipatan berikutnya 108 sudah lebih dari 100.", { level: "Menantang" }),
  // Sangat menantang
  q(3, "Dania membuat bingkisan berisi susu kotak, permen lolipop, dan biskuit. Banyak setiap jenis barang pada setiap paket sama. Ia memiliki 30 susu kotak, 45 permen lolipop, dan 60 bungkus biskuit. Paket dibuat sebanyak-banyaknya.", [
    { kind: "number", label: "Banyak paket paling banyak:", answer: 15 }, { kind: "number", label: "Susu kotak di setiap paket:", answer: 2 }, { kind: "number", label: "Permen lolipop di setiap paket:", answer: 3 }, { kind: "number", label: "Biskuit di setiap paket:", answer: 4 }],
    "FPB dari 30, 45, dan 60 adalah 15. Setiap paket: 30 : 15 = 2 susu, 45 : 15 = 3 permen, 60 : 15 = 4 biskuit.",
    { level: "Sangat menantang", scene: { type: "items", rows: [{ thing: "susu", n: 30 }, { thing: "lolipop", n: 45 }, { thing: "biskuit", n: 60 }] } }),
  q(4, "Tentukan KPK dan FPB dari 96 dan 120 dengan faktorisasi prima.", [{ kind: "factorize", nums: [96, 120] }],
    "96 = 2 × 2 × 2 × 2 × 2 × 3 dan 120 = 2 × 2 × 2 × 3 × 5. KPK = 2 × 2 × 2 × 2 × 2 × 3 × 5 = 480. Berpasangan: 2, 2, 2, 3, jadi FPB = 24.", { level: "Sangat menantang" }),
  q(1, "Lampu lalu lintas di tiga persimpangan menyala merah setiap 12 detik, 18 detik, dan 30 detik sekali. Ketiganya menyala merah bersamaan pada pukul 09.15. Pada pukul berapa ketiga lampu menyala merah bersamaan lagi?", [{ kind: "time", label: "Pukul", answer: [9, 18] }],
    "KPK dari 12, 18, dan 30 adalah 180 detik = 3 menit. 09.15 + 3 menit = 09.18.", { level: "Sangat menantang", scene: { type: "lights", seconds: [12, 18, 30], start: "09.15" } }),
  q(2, "Pita sepanjang 30 petak akan dipotong sama panjang tanpa sisa. Ada berapa pilihan panjang tiap bagian?", [{ kind: "number", label: "Banyak pilihan panjang:", answer: 8 }],
    "Panjang tiap bagian harus faktor 30: 1, 2, 3, 5, 6, 10, 15, 30. Ada 8 pilihan.", { level: "Sangat menantang", scene: { type: "strip", n: 30 } }),
  q(3, "Kelas V terdiri atas 16 siswa perempuan dan 24 siswa laki-laki. Semua siswa dibagi ke beberapa kelompok. Banyak siswa perempuan dan laki-laki di setiap kelompok sama.", [
    { kind: "number", label: "Banyak kelompok paling banyak:", answer: 8 }, { kind: "number", label: "Siswa perempuan di setiap kelompok:", answer: 2 }, { kind: "number", label: "Siswa laki-laki di setiap kelompok:", answer: 3 }],
    "FPB dari 16 dan 24 adalah 8 kelompok. Setiap kelompok: 16 : 8 = 2 perempuan dan 24 : 8 = 3 laki-laki.",
    { level: "Sangat menantang", scene: { type: "items", rows: [{ thing: "siswaPutri", n: 16 }, { thing: "siswaPutra", n: 24 }] } }),
  q(0, "Aku adalah bilangan kelipatan 7 yang terletak antara 40 dan 70. Angka satuanku 6. Aku bilangan berapa?", [{ kind: "number", label: "Aku adalah", answer: 56 }],
    "Kelipatan 7 antara 40 dan 70: 42, 49, 56, 63. Yang angka satuannya 6 adalah 56.", { level: "Sangat menantang" }),
  q(1, "Pasaran Jawa dan Bali berulang setiap 5 hari (Pahing, Pon, Wage, Kliwon, Legi), sedangkan nama hari berulang setiap 7 hari. Tentukan benar atau salah, lalu jawab pertanyaannya.", [
    { kind: "tf", statements: [
      { text: "Jika Pon bertepatan dengan hari Senin, maka Pon berikutnya bertepatan dengan hari Sabtu.", answer: true },
      { text: "Jika Wage bertepatan dengan hari Kamis, maka Wage berikutnya bertepatan dengan hari Rabu.", answer: false },
      { text: "Hari dan pasaran yang sama, misalnya Rabu Pahing, berulang setiap 35 hari.", answer: true },
    ] },
    { kind: "number", label: "3 Agustus adalah Rabu Legi. Rabu Legi berikutnya tanggal … September.", answer: 7 }],
    "Pasaran berulang setiap 5 hari: Senin + 5 hari = Sabtu, Kamis + 5 hari = Selasa. Hari dan pasaran sama berulang setiap KPK(5, 7) = 35 hari. 3 Agustus + 35 hari = 38 Agustus, dikurangi 31 hari menjadi 7 September.",
    { level: "Sangat menantang" }),
];
