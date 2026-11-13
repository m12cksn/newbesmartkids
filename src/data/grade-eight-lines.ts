/**
 * Kelas 8 Bab 5 - Persamaan Garis Lurus (Buku Siswa Matematika SMP/MTs Kelas VIII, Kurikulum Merdeka 2022, hlm. 208-254).
 * A. Grafik Persamaan Garis Lurus  B. Pengertian Kemiringan
 * Bentuk jawaban mengikuti buku: melengkapi tabel x-y, titik potong sumbu, menggambar garis pada koordinat Cartesius,
 * garis lurus atau bukan, kemiringan dari dua titik/gambar/situasi, tabel kemiringan dan perpotongan sumbu-y,
 * persamaan garis y = mx + c, mencocokkan persamaan dengan grafik, dan pilihan ganda (Uji Kompetensi A).
 * Teks matematika memakai penanda: ^{…} pangkat, {a/b} pecahan bertumpuk.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka: 1.500 (ribuan), 0,15 (desimal), −3, dan pecahan -1/2 ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  const f = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t);
  if (f) { const a = num(f[1]), b = num(f[2]); return b === 0 ? NaN : a / b; }
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
/** Pecahan sederhana untuk ditampilkan: 0,5 → {1/2}, −1,5 → −{3/2}. */
export function frac(v: number): string {
  if (Number.isInteger(v)) return idn(v);
  for (let d = 2; d <= 12; d++) { const n = Math.round(v * d); if (Math.abs(n / d - v) < 1e-9) return `${n < 0 ? "−" : ""}{${Math.abs(n)}/${d}}`; }
  return idn(v);
}
/** "y = mx + c" dalam teks dengan penanda. */
export function lineText(m: number, c: number, y = "y", x = "x") {
  const mx = m === 0 ? "" : m === 1 ? x : m === -1 ? `−${x}` : `${frac(m)}${x}`;
  const cc = c === 0 ? (m === 0 ? "0" : "") : mx === "" ? frac(c) : c > 0 ? ` + ${frac(c)}` : ` − ${frac(-c)}`;
  return `${y} = ${mx}${cc}`;
}

/* ---------- Gambar ---------- */
export type GLine = { m: number; c: number; label?: string } | { vx: number; label?: string };
export type GPoint = { x: number; y: number; label?: string };
export type Scene =
  | { type: "graph"; lines: GLine[]; points?: GPoint[]; r?: number; caption?: string }
  | { type: "graphs"; items: { lines: GLine[]; points?: GPoint[]; r?: number; caption: string }[] }
  | { type: "ramp"; rise: string; run: string; label?: string }
  | { type: "stairs"; steps: number; height: string; depth: string }
  | { type: "bed"; rise: string; run: string }
  | { type: "chart"; title: string; xs: string[]; ys: number[]; unit: string }
  | { type: "card"; title: string; lines: string[] };

export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; pre?: string }
  | { kind: "choice"; label: string; options: string[]; answer: string; pics?: Scene[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "table"; label: string; xs: number[]; ys: number[] }
  | { kind: "point"; label: string; x: number; y: number }
  | { kind: "line"; label: string; m: number; c: number; y?: string; x?: string }
  | { kind: "mc"; rows: { eq: string; m: number; c: number }[] }
  | { kind: "draw"; label: string; a: number; b: number; c: number; r: number };

export type LQuestion = Question & { topic: 0 | 1; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "table" ? p.xs.length : p.kind === "point" || p.kind === "line" ? 2 : p.kind === "mc" ? p.rows.length * 2 : 1);
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => idn(n).replace(/\./g, "");
/** Titik bilangan bulat pada garis ax + by = c di dalam kotak −r…r. */
export const latticeOn = (p: { a: number; b: number; c: number; r: number }) => {
  const out: [number, number][] = [];
  for (let x = -p.r; x <= p.r; x++) for (let y = -p.r; y <= p.r; y++) if (p.a * x + p.b * y === p.c) out.push([x, y]);
  return out;
};
export const drawPoints = (v: string): [number, number][] => (v ? v.split(";").map(s => s.split(",").map(Number) as [number, number]) : []);
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "table": return p.ys.map(str);
    case "point": return [str(p.x), str(p.y)];
    case "line": return [str(p.m), str(p.c)];
    case "mc": return p.rows.flatMap(r => [str(r.m), str(r.c)]);
    case "draw": { const pts = latticeOn(p); if (pts.length < 2) throw new Error("garis tanpa dua titik bulat"); return [`${pts[0].join(",")};${pts.at(-1)!.join(",")}`]; }
  }
}
const near = (a: number, b: number) => !Number.isNaN(a) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return near(num(v), p.value);
    case "table": return p.ys.every((y, k) => near(num(x[k]), y));
    case "point": return near(num(x[0]), p.x) && near(num(x[1]), p.y);
    case "line": return near(num(x[0]), p.m) && near(num(x[1]), p.c);
    case "mc": return p.rows.every((r, k) => near(num(x[2 * k]), r.m) && near(num(x[2 * k + 1]), r.c));
    case "draw": { const pts = drawPoints(v); return pts.length === 2 && (pts[0][0] !== pts[1][0] || pts[0][1] !== pts[1][1]) && pts.every(([px, py]) => p.a * px + p.b * py === p.c); }
    default: return x.join("|") === fields(p).join("|");
  }
}
function partReady(p: Part, v: string) {
  if (p.kind === "num" || p.kind === "choice") return v.trim() !== "";
  if (p.kind === "draw") return drawPoints(v).length === 2;
  return cells(p, v).every(c => c.trim() !== "");
}
export const correct = (q: LQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: LQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2").replace(/[{}]/g, "");
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
      case "table": return `${plain(p.label)} ${p.xs.map((xx, k) => `x = ${idn(xx)}: y = ${x[k]}`).join(", ")}`;
      case "point": return `${plain(p.label)} (${x[0]}, ${x[1]})`;
      case "line": return `${plain(p.label)} ${p.y ?? "y"} = ${x[0]}${p.x ?? "x"} + (${x[1]})`;
      case "mc": return p.rows.map((r, k) => `${plain(r.eq)}: m = ${x[2 * k]}, c = ${x[2 * k + 1]}`).join("; ");
      case "draw": { const pts = drawPoints(v[i]); return `${plain(p.label)} ${pts.length ? pts.map(([a, b]) => `(${a}, ${b})`).join(" dan ") : "…"}`; }
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: LQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): LQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (lbl: string, value: number, unit?: string, pre?: string): Part => ({ kind: "num", label: lbl, value, unit, pre });
const ch = (lbl: string, options: string[], answer: string, pics?: Scene[]): Part => ({ kind: "choice", label: lbl, options, answer, pics });
const pt = (lbl: string, x: number, y: number): Part => ({ kind: "point", label: lbl, x, y });
const ln = (lbl: string, m: number, c: number, y?: string, x?: string): Part => ({ kind: "line", label: lbl, m, c, y, x });
const g = (lines: GLine[], points?: GPoint[], r = 6): Scene => ({ type: "graph", lines, points, r });
const GL = ["Garis lurus", "Bukan garis lurus"];

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  { code: "A", title: "Grafik Persamaan Garis Lurus", short: "Grafik garis lurus", sections: [
    { title: "Tabel nilai dan titik pada garis", lab: "table", steps: [
      "Persamaan garis lurus memuat dua variabel x dan y yang masing-masing berpangkat satu, misalnya y = 2x − 1 atau 4x − y = 5.",
      "Pilih beberapa nilai x, hitung y, lalu tulis pasangan berurutan (x, y) dalam tabel.",
      "Gambar setiap pasangan sebagai titik pada koordinat Cartesius. Titik-titik itu selalu segaris.",
      "Setiap titik pada garis adalah penyelesaian persamaannya, dan setiap penyelesaian terletak pada garis. Persamaan x^{2} + 3y = 7 atau x^{2} + y^{2} = 25 tidak membentuk garis lurus.",
    ], life: "Ongkos kirim paket Rp10.000,00 ditambah Rp4.000,00 per kilogram dapat ditulis y = 4.000x + 10.000. Tabel berat dan ongkosnya, jika digambar, menjadi titik-titik pada satu garis lurus.",
      example: "4x − y = 5: x = 2 → y = 3; x = 0 → y = −5; x = −1 → y = −9; y = 0 → x = {5/4}. Titik (2, 3), (0, −5), (−1, −9), dan ({5/4}, 0) segaris.",
      demo: "Atur m dan c pada y = mx + c. Tabel nilai, titik-titiknya, dan garisnya ditampilkan bersama." },
    { title: "Titik potong dengan sumbu-x dan sumbu-y", lab: "intercept", steps: [
      "Dua titik sudah cukup untuk menggambar sebuah garis lurus. Dua titik yang paling mudah adalah titik potong dengan sumbu.",
      "Titik potong sumbu-x: substitusikan y = 0. Titik potong sumbu-y: substitusikan x = 0.",
      "Pada y = mx + c, titik potong sumbu-y selalu (0, c).",
      "Garis y = k (mendatar) hanya memotong sumbu-y, dan garis x = k (tegak) hanya memotong sumbu-x.",
    ], life: "Truk seharga Rp360.000.000,00 nilainya turun Rp12.000.000,00 per tahun: y = 360.000.000 − 12.000.000x. Titik potong sumbu-y (0, 360.000.000) adalah harga saat baru, dan titik potong sumbu-x (30, 0) berarti nilainya habis setelah 30 tahun.",
      example: "y = −{1/2}x − 1: untuk y = 0, x = −2, jadi (−2, 0). Untuk x = 0, y = −1, jadi (0, −1). Hubungkan kedua titik.",
      demo: "Atur a, b, dan c pada ax + by = c. Kedua titik potong dihitung dan garisnya digambar melalui keduanya." },
    { title: "Pengaruh m dan c pada grafik", lab: "family", steps: [
      "Bentuk umum persamaan garis lurus adalah y = mx + c, dengan m kemiringan (koefisien arah) dan c konstanta.",
      "Garis y = mx (tanpa c) selalu melalui titik pusat (0, 0).",
      "Mengubah m mengubah kecuraman: y = x + 2, y = 2x + 2, dan y = 4x + 2 makin curam, tetapi semuanya melalui (0, 2).",
      "Mengubah c menggeser garis ke atas atau ke bawah: y = 2x + 5, y = 2x + 2, dan y = 2x − 3 sejajar.",
    ], life: "Gaji manajer Rp100.000.000,00 per tahun ditambah komisi 5% dari penjualan: y = 0,05x + 100.000.000. Gaji pokok adalah c (titik potong sumbu-y), dan persentase komisi adalah m yang menentukan seberapa cepat gaji naik.",
      example: "y = 2x dan y = −3x melalui (0, 0). y = 2x miring ke kanan atas, y = −3x miring ke kanan bawah dan lebih curam.",
      demo: "Atur m dan c untuk garismu, lalu bandingkan dengan garis y = 2x + 2: sejajar, berimpit, tegak lurus, atau sekadar berpotongan." },
  ] },
  { code: "B", title: "Pengertian Kemiringan", short: "Kemiringan", sections: [
    { title: "Kemiringan sebagai naik dibagi mendatar", lab: "ramp", steps: [
      "Kemiringan (gradien) adalah perbandingan perubahan tegak terhadap perubahan mendatar: m = {perubahan tegak/perubahan mendatar}.",
      "Makin besar kemiringannya, makin curam lintasannya.",
      "Kemiringan tidak bergantung pada titik mana yang dipakai: di mana pun diukur pada garis yang sama, hasilnya sama.",
      "Kemiringan dapat ditulis sebagai pecahan atau desimal, misalnya {90/700} ≈ 0,13.",
    ], life: "Beranda sekolah setinggi 90 cm akan diberi jalur kursi roda sepanjang 7 m: kemiringan {90/700} ≈ 0,13, di bawah batas aman 0,15. Jalur terpendek yang aman: 0,15x = 90, x = 600 cm. Batas lain: parkir 0,25, trotoar 0,325, tangga 0,875.",
      example: "Tangga tempat tidur tingkat naik 150 cm dengan jarak mendatar 50 cm: kemiringan {150/50} = 3.",
      demo: "Atur tinggi dan panjang jalur. Kemiringannya dihitung dan dibandingkan dengan batas aman yang kamu pilih." },
    { title: "Kemiringan dari dua titik", lab: "slope", steps: [
      "Untuk garis melalui (x₁, y₁) dan (x₂, y₂): m = {y₂ − y₁/x₂ − x₁}.",
      "m positif: garis naik ke kanan. m negatif: garis turun ke kanan.",
      "Garis sejajar sumbu-x mempunyai m = 0. Garis sejajar sumbu-y kemiringannya tidak terdefinisi (penyebutnya 0).",
      "Jika kemiringan diketahui, titik yang belum lengkap dapat dicari: melalui (−4, p) dan (1, 2) dengan m = −{3/4} memberi p = {23/4}.",
    ], life: "Jalan menanjak naik 6 m untuk setiap 100 m mendatar mempunyai kemiringan 0,06 (sering ditulis 6%). Rambu tanjakan di jalan raya memakai cara hitung yang sama.",
      example: "A(2, 1) dan B(4, 5): m = {5 − 1/4 − 2} = 2. Melalui (1, 2) dan (−2, 5): m = {5 − 2/−2 − 1} = −1.",
      demo: "Geser kedua titik. Perubahan tegak, perubahan mendatar, kemiringan, dan arahnya ditampilkan." },
    { title: "Persamaan garis dari kemiringan dan satu titik", lab: "pointslope", steps: [
      "Garis yang melalui titik (x₁, y₁) dengan kemiringan m: y − y₁ = m(x − x₁).",
      "Buka kurung dan pindahkan y₁ untuk mendapat bentuk y = mx + c.",
      "Garis y = mx + c memotong sumbu-y di (0, c). Garis melalui (0, 0) dengan kemiringan m adalah y = mx.",
      "Bentuk lain: ax + by + c = 0, misalnya y = 3x − 2 menjadi 3x − y − 2 = 0.",
    ], life: "Taksi online: tarif naik Rp3.000,00 per km dan perjalanan 4 km membayar Rp19.000,00. Dengan y − 19.000 = 3.000(x − 4) didapat y = 3.000x + 7.000, jadi biaya awalnya Rp7.000,00.",
      example: "Kemiringan 3 melalui A(2, 5): y − 5 = 3(x − 2), y = 3x − 2.",
      demo: "Atur kemiringan dan titik yang dilalui. Persamaan bentuk titik-gradien dan bentuk y = mx + c ditulis berdampingan." },
    { title: "Persamaan garis dari dua titik", lab: "two", steps: [
      "Hitung dulu kemiringannya: m = {y₂ − y₁/x₂ − x₁}.",
      "Substitusikan salah satu titik ke y = mx + c untuk mencari c.",
      "Cara lain: {y − y₁/y₂ − y₁} = {x − x₁/x₂ − x₁}.",
      "Periksa dengan titik kedua. Hasilnya sama, titik mana pun yang dipakai.",
    ], life: "Kebun kopi menghasilkan 1.500 kg pada 2020 dan 2.500 kg pada 2025. Dengan t tahun setelah 2020: kemiringan {1.000/5} = 200 kg per tahun, jadi y = 200t + 1.500.",
      example: "Melalui (1, −5) dan (−2, 4): m = {9/−3} = −3. 4 = −3(−2) + c, c = −2. Jadi y = −3x − 2.",
      demo: "Geser dua titik. Langkah mencari m dan c ditulis, lalu garisnya digambar melalui kedua titik." },
    { title: "Garis sejajar dan tegak lurus", lab: "perp", steps: [
      "Dua garis sejajar mempunyai kemiringan sama: m₁ = m₂.",
      "Dua garis tegak lurus: m₁ × m₂ = −1, jadi m₂ = −{1/m₁}.",
      "Contoh: garis yang tegak lurus y = {1/3}x − 6 mempunyai kemiringan −3.",
      "Untuk mencari persamaannya, pakai kemiringan baru dan titik yang dilalui pada y − y₁ = m(x − x₁).",
    ], life: "Garis-garis lapangan bulu tangkis: garis samping saling sejajar (kemiringan sama), sedangkan garis samping dan garis belakang saling tegak lurus. Petak sawah dan jalan di kompleks perumahan juga dirancang dengan garis sejajar dan tegak lurus.",
      example: "A(0, 8), B(4, 0), C titik tengah AB = (2, 4). m_AB = −2, jadi garis DCE yang tegak lurus mempunyai m = {1/2}: y = {1/2}x + 3.",
      demo: "Atur kemiringan garis acuan, pilih sejajar atau tegak lurus, lalu atur titik yang dilalui." },
  ] },
];

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: LQuestion[][] = [
  [
    q(0, "Lengkapi tabel nilai persamaan y = 2x − 1.", [{ kind: "table", label: "Nilai y:", xs: [-2, -1, 0, 1, 2], ys: [-5, -3, -1, 1, 3] }],
      "y = 2(−2) − 1 = −5, lalu −3, −1, 1, 3. Setiap kali x naik 1, y naik 2.", { scene: g([{ m: 2, c: -1, label: "y = 2x − 1" }]) }),
    q(0, "Manakah persamaan berikut yang merupakan persamaan garis lurus?", [{ kind: "classify", options: GL, rows: [
      { text: "x + 2y = 0", answer: "Garis lurus" }, { text: "x^{2} + 3y = 7", answer: "Bukan garis lurus" },
      { text: "{y/3} + 3x = 9", answer: "Garis lurus" }, { text: "y^{2} + x^{2} = 25", answer: "Bukan garis lurus" }] }],
      "Garis lurus: x dan y berpangkat satu. x^{2} dan y^{2} membuat grafiknya melengkung."),
    q(0, "Tentukan titik potong garis 3x + 2y = 12 dengan kedua sumbu.", [pt("Titik potong sumbu-x:", 4, 0), pt("Titik potong sumbu-y:", 0, 6)],
      "y = 0: 3x = 12, x = 4. x = 0: 2y = 12, y = 6."),
    q(0, "Gambarlah grafik y = −x + 2: ketuk dua titik yang terletak pada garis tersebut.", [{ kind: "draw", label: "Garis y = −x + 2:", a: 1, b: 1, c: 2, r: 5 }],
      "Contoh titik: (0, 2) dan (2, 0). Semua titik dengan x + y = 2 terletak pada garis."),
  ],
  [
    q(1, "Tentukan kemiringan tangga tempat tidur tingkat berikut.", [n("Kemiringan =", 4)],
      "Kemiringan = {140/35} = 4.", { scene: { type: "bed", rise: "140 cm", run: "35 cm" } }),
    q(1, "Tentukan kemiringan garis yang melalui dua titik berikut.", [n("Melalui (2, 1) dan (4, 7): m =", 3), n("Melalui (1, 2) dan (−2, 8): m =", -2)],
      "{7 − 1/4 − 2} = 3. {8 − 2/−2 − 1} = {6/−3} = −2."),
    q(1, "Tentukan persamaan garis yang melalui titik (−1, 4) dengan kemiringan −3.", [ln("Persamaan garis:", -3, 1)],
      "y − 4 = −3(x + 1), y = −3x − 3 + 4 = −3x + 1."),
    q(1, "Garis l mempunyai persamaan y = −{1/2}x + 3.", [n("Kemiringan garis yang sejajar l =", -0.5), n("Kemiringan garis yang tegak lurus l =", 2)],
      "Sejajar: kemiringan sama, −{1/2}. Tegak lurus: −{1/2} × m = −1, m = 2. Pecahan boleh ditulis −1/2 atau −0,5."),
  ],
];

/* ---------- Evaluasi: 24 soal, A dan B bergantian ---------- */
const optGraphs = (ls: [number, number][]) => ls.map(([m, c]) => g([{ m, c }], [{ x: -c / m, y: 0 }, { x: 0, y: c }], 6));
export const assessment: LQuestion[] = [
  // Sedang (1-8)
  q(0, "Lengkapi tabel persamaan 2x − y = 3, lalu tentukan nilai x saat y = 0.", [{ kind: "table", label: "Nilai y:", xs: [-1, 0, 2, 3], ys: [-5, -3, 1, 3] }, n("Untuk y = 0, x =", 1.5)],
    "y = 2x − 3: x = −1 → −5, x = 0 → −3, x = 2 → 1, x = 3 → 3. Untuk y = 0: 2x = 3, x = {3/2} = 1,5.", { level: "Sedang" }),
  q(1, "Tentukan kemiringan garis yang melalui titik A(1, −2) dan B(3, 6).", [n("m =", 4)],
    "m = {6 − (−2)/3 − 1} = {8/2} = 4.", { level: "Sedang", scene: g([{ m: 4, c: -6 }], [{ x: 1, y: -2, label: "A" }, { x: 3, y: 6, label: "B" }], 7) }),
  q(0, "Grafik yang sesuai dengan persamaan 2x − y + 4 = 0 adalah …", [ch("Jawaban:", ["a", "b", "c", "d"], "c", optGraphs([[-2, 4], [2, -4], [2, 4], [4, 2]]))],
    "2x − y + 4 = 0 sama dengan y = 2x + 4: memotong sumbu-y di (0, 4) dan sumbu-x di (−2, 0), naik ke kanan.", { level: "Sedang" }),
  q(1, "Beranda sekolah setinggi 75 cm akan dibuatkan jalur kursi roda sepanjang 6 m (mendatar). Batas kemiringan aman untuk kursi roda 0,15.", [n("Kemiringan jalur =", 0.125), ch("Apakah jalur ini aman?", ["Aman", "Tidak aman"], "Aman")],
    "Kemiringan = {75/600} = 0,125. Karena 0,125 < 0,15, jalur ini aman.", { level: "Sedang", scene: { type: "ramp", rise: "75 cm", run: "6 m", label: "Beranda" } }),
  q(0, "Titik P terletak pada garis y = 2x − 3 dan koordinat y dari P adalah 5.", [pt("P =", 4, 5)],
    "5 = 2x − 3, 2x = 8, x = 4. Jadi P(4, 5).", { level: "Sedang" }),
  q(1, "Tentukan kemiringan (m) dan perpotongan sumbu-y (c) setiap garis.", [{ kind: "mc", rows: [{ eq: "y = −2x + 4", m: -2, c: 4 }, { eq: "x + y + 1 = 0", m: -1, c: -1 }, { eq: "2y − 10x = 8", m: 5, c: 4 }] }],
    "x + y + 1 = 0 → y = −x − 1. 2y − 10x = 8 → y = 5x + 4.", { level: "Sedang" }),
  q(0, "Garis y = x + 2, y = 2x + 2, dan y = 4x + 2 digambar pada bidang yang sama. Tentukan benar atau salah.", [{ kind: "tf", statements: [
    { text: "Ketiga garis melalui titik (0, 2).", answer: true }, { text: "Garis y = 4x + 2 paling curam.", answer: true }, { text: "Ketiga garis saling sejajar.", answer: false }] }],
    "c sama (2) sehingga ketiganya melalui (0, 2). m berbeda sehingga tidak sejajar; m terbesar (4) paling curam.", { level: "Sedang", scene: g([{ m: 1, c: 2, label: "y = x + 2" }, { m: 2, c: 2, label: "y = 2x + 2" }, { m: 4, c: 2, label: "y = 4x + 2" }], undefined, 5) }),
  q(1, "Garis A mempunyai kemiringan 2 dan melalui (3, 1). Garis B mempunyai kemiringan −3 dan melalui (−1, 2). Bentuk y = mx + c garis A dan B berturut-turut adalah …", [ch("Jawaban:", ["y = 2x + 5 dan y = −3x + 1", "y = 2x − 5 dan y = −3x + 5", "y = 2x − 1 dan y = −3x − 1", "y = 2x − 5 dan y = −3x − 1"], "y = 2x − 5 dan y = −3x − 1")],
    "A: y − 1 = 2(x − 3), y = 2x − 5. B: y − 2 = −3(x + 1), y = −3x − 1.", { level: "Sedang", scene: { type: "card", title: "Bentuk titik-gradien", lines: ["Garis A: y − 1 = 2(x − 3)", "Garis B: y − 2 = −3(x + 1)"] } }),
  // Menantang (9-17)
  q(0, "Gambarlah grafik 2x + 3y = 6: ketuk dua titik yang terletak pada garis tersebut.", [{ kind: "draw", label: "Garis 2x + 3y = 6:", a: 2, b: 3, c: 6, r: 5 }],
    "Titik potong sumbu: (3, 0) dan (0, 2). Titik bulat lain pada garis: (−3, 4).", { level: "Menantang" }),
  q(1, "Tentukan nilai yang belum diketahui.", [n("Garis melalui (−2, 3) dan (2, p) dengan kemiringan {1/2}: p =", 5), n("Garis melalui (1, h) dan (h + 2, 8) dengan kemiringan 2: h =", 2)],
    "{p − 3/4} = {1/2}, p − 3 = 2, p = 5. {8 − h/h + 1} = 2, 8 − h = 2h + 2, h = 2.", { level: "Menantang" }),
  q(0, "Sepeda motor seharga Rp24.000.000,00 nilainya turun Rp2.000.000,00 setiap tahun: y = 24.000.000 − 2.000.000x, dengan x usia motor (tahun).", [pt("Titik potong sumbu-x:", 12, 0), n("Nilai motor setelah 5 tahun =", 14000000, undefined, "Rp")],
    "y = 0: 2.000.000x = 24.000.000, x = 12. Motor tidak bernilai lagi setelah 12 tahun. Setelah 5 tahun: 24 − 10 = 14 juta.", { level: "Menantang" }),
  q(1, "Tentukan persamaan garis yang melalui titik (2, −1) dan (−1, 8).", [ln("Persamaan garis:", -3, 5)],
    "m = {8 − (−1)/−1 − 2} = {9/−3} = −3. −1 = −3(2) + c, c = 5. Jadi y = −3x + 5.", { level: "Menantang", scene: g([{ m: -3, c: 5 }], [{ x: 2, y: -1 }, { x: -1, y: 8 }], 9) }),
  q(0, "Hubungan banyak kalori c dan banyak lemak f (gram) pada makanan ringan dinyatakan c = 9f + 120.", [n("Perpotongan sumbu-c =", 120), n("Kalori makanan yang mengandung 25 gram lemak =", 345)],
    "Untuk f = 0, c = 120. Untuk f = 25: 9 × 25 + 120 = 345 kalori.", { level: "Menantang" }),
  q(1, "Tentukan persamaan garis yang tegak lurus dengan garis y = {1/2}x + 1 dan melalui titik (3, 1).", [ln("Persamaan garis:", -2, 7)],
    "Kemiringan tegak lurus: {1/2} × m = −1, m = −2. 1 = −2(3) + c, c = 7. Jadi y = −2x + 7.", { level: "Menantang" }),
  q(0, "Titik P(−4, 3), Q(a, 1), R(1, −2), S(b, 2), dan T(4, c) terletak pada satu garis lurus.", [n("a =", -2), n("b =", -3), n("c =", -5)],
    "Garis melalui P dan R: m = {−2 − 3/1 + 4} = −1, y = −x − 1. 1 = −a − 1 → a = −2. 2 = −b − 1 → b = −3. c = −4 − 1 = −5.", { level: "Menantang" }),
  q(1, "Sebuah tangga rumah terdiri atas 12 anak tangga dengan tinggi total 216 cm dan kedalaman total 300 cm.", [n("Tinggi setiap pijakan =", 18, "cm"), n("Kemiringan tangga =", 0.72)],
    "216 : 12 = 18 cm. Kemiringan = {216/300} = 0,72, masih di bawah batas 0,875 untuk tangga bangunan.", { level: "Menantang", scene: { type: "stairs", steps: 12, height: "216 cm", depth: "300 cm" } }),
  q(0, "Cocokkan setiap persamaan dengan grafiknya.", [{ kind: "classify", options: ["(i)", "(ii)", "(iii)", "(iv)"], rows: [
    { text: "y = x − 3", answer: "(iii)" }, { text: "y = 3x − 2", answer: "(iv)" }, { text: "2y − x = 4", answer: "(i)" }, { text: "2x + y − 3 = 0", answer: "(ii)" }] }],
    "2y − x = 4 → y = {1/2}x + 2 (landai, memotong (0, 2)). 2x + y − 3 = 0 → y = −2x + 3 (turun). y = x − 3 memotong (0, −3). y = 3x − 2 curam, memotong (0, −2).",
    { level: "Menantang", scene: { type: "graphs", items: [
      { lines: [{ m: 0.5, c: 2 }], r: 4, caption: "(i)" }, { lines: [{ m: -2, c: 3 }], r: 4, caption: "(ii)" },
      { lines: [{ m: 1, c: -3 }], r: 4, caption: "(iii)" }, { lines: [{ m: 3, c: -2 }], r: 4, caption: "(iv)" }] } }),
  // Sangat menantang (18-24)
  q(1, "Titik P(1, −2) dan R(5, 4) adalah titik sudut yang berhadapan pada persegi panjang PQRS yang sisi-sisinya sejajar sumbu koordinat. Persamaan garis yang melalui Q dan S adalah …", [ch("Jawaban:", ["3x − 2y − 11 = 0", "2x + 3y − 11 = 0", "3x + 2y − 11 = 0", "3x + 2y + 11 = 0"], "3x + 2y − 11 = 0")],
    "Q(5, −2) dan S(1, 4). m = {4 − (−2)/1 − 5} = −{3/2}. y + 2 = −{3/2}(x − 5) → 2y + 4 = −3x + 15 → 3x + 2y − 11 = 0.", { level: "Sangat menantang", scene: g([], [{ x: 1, y: -2, label: "P" }, { x: 5, y: 4, label: "R" }], 6) }),
  q(0, "Kebun kopi Pak Alex menghasilkan 1.800 kg pada tahun 2020 dan 2.800 kg pada tahun 2025. Kenaikannya tetap setiap tahun.", [n("Kenaikan produksi per tahun =", 200, "kg"), n("Perkiraan produksi tahun 2028 =", 3400, "kg")],
    "{2.800 − 1.800/2025 − 2020} = {1.000/5} = 200 kg per tahun. 2028: 1.800 + 8 × 200 = 3.400 kg.", { level: "Sangat menantang", scene: { type: "chart", title: "Produksi kopi", xs: ["2020", "2025"], ys: [1800, 2800], unit: "kg" } }),
  q(1, "Persentase kelas yang belajar dengan akses internet naik secara linier: 50% (2021), 62% (2022), dan 74% (2023).", [n("Laju kenaikan per tahun =", 12, "%"), n("Tahun saat persentasenya mencapai 98% =", 2025)],
    "Kemiringan {74 − 50/2023 − 2021} = 12% per tahun. 74 + 12k = 98, k = 2, jadi tahun 2025. Grafik ini tidak bisa naik terus karena paling tinggi 100%.", { level: "Sangat menantang", scene: { type: "chart", title: "Pembelajaran dengan akses internet", xs: ["2021", "2022", "2023"], ys: [50, 62, 74], unit: "%" } }),
  q(0, "Garis l₁, l₂, dan l₃ mempunyai kemiringan 2, 3, dan 6, dan memotong sumbu-y di titik yang sama (0, c). Jumlah absis titik potong ketiganya dengan sumbu-x adalah −4.", [n("c =", 4), ln("Persamaan l₁:", 2, 4)],
    "Titik potong sumbu-x: −{c/2}, −{c/3}, −{c/6}. Jumlahnya −c({1/2} + {1/3} + {1/6}) = −c = −4, jadi c = 4 dan l₁: y = 2x + 4.", { level: "Sangat menantang" }),
  q(1, "A(0, 4) dan B(8, 0) terletak pada garis ACB, dengan C titik tengah AB. Garis DCE tegak lurus garis ACB.", [pt("C =", 4, 2), ln("Persamaan garis DCE:", 2, -6)],
    "C = ({0 + 8/2}, {4 + 0/2}) = (4, 2). m_AB = {0 − 4/8 − 0} = −{1/2}, jadi m_DCE = 2. y − 2 = 2(x − 4), y = 2x − 6.", { level: "Sangat menantang", scene: g([{ m: -0.5, c: 4 }], [{ x: 0, y: 4, label: "A" }, { x: 8, y: 0, label: "B" }], 9) }),
  q(0, "Titik A(4, −1), B(1, −7), dan C(k, −13) terletak pada satu garis lurus.", [n("k =", -2), ln("Persamaan garis ABC:", 2, -9)],
    "m_AB = {−7 − (−1)/1 − 4} = 2. y + 1 = 2(x − 4), y = 2x − 9. −13 = 2k − 9, k = −2.", { level: "Sangat menantang" }),
  q(1, "Helikopter turun lurus dengan laju tetap. Ketinggiannya 570 m pada detik ke-2 dan 480 m pada detik ke-8 setelah mulai turun.", [ln("Persamaan ketinggian:", -15, 600, "h", "t"), n("Waktu sampai mendarat =", 40, "detik")],
    "Kemiringan {480 − 570/8 − 2} = −15 m per detik. 570 = −15(2) + c, c = 600, jadi h = −15t + 600. Mendarat saat h = 0: t = 40 detik.", { level: "Sangat menantang" }),
];

export const sources = { GL };
