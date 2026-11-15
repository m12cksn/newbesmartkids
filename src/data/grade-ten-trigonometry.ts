/**
 * Kelas 10 Bab 4 - Trigonometri
 * (sumber: Buku Siswa Matematika Kelas X, Bab 4, hlm. 117-203).
 * A. Ukuran sudut dan perbandingan trigonometri (4.1-4.3)  B. Relasi sudut dan identitas (4.4-4.5)
 * C. Aturan sinus, cosinus, dan grafik fungsi trigonometri (4.6-4.7).
 * Bentuk jawaban mengikuti buku: konversi derajat-radian-putaran, kuadran, nilai perbandingan dalam bentuk
 * pecahan dan akar (p√q / r), soal sudut elevasi, sudut istimewa, relasi sudut, identitas (benar/salah dan
 * penyederhanaan), aturan sinus/cosinus, luas segitiga, serta nilai maksimum, minimum, dan periode grafik.
 * Koreksi isi buku: Contoh 4.9b seharusnya A = 29° (bukan 26°); kotak hlm. 167 salah tanda untuk cos 150°,
 * tan 150°, dan tan 330°; Sifat 4.6c seharusnya tan²α − sec²α = −1; Contoh 4.16 seharusnya s ≈ 4,77.
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
const str = (n: number) => { for (const d of [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 17, 25]) { const k = n * d; if (Math.abs(k - Math.round(k)) < 1e-9) { if (d === 1) return String(Math.round(n)); const p = Math.round(k), c = gcd(p, d); return `${p / c}/${d / c}`; } } return String(Math.round(n * 1e6) / 1e6).replace(".", ","); };
export const fmt = (n: number) => { const s = str(n).replace("-", "−"); const f = /^(−?)(\d+)\/(\d+)$/.exec(s); return f ? `${f[1]}{${f[2]}/${f[3]}}` : /^−?\d+$/.test(s) ? idn(Number(s.replace("−", "-"))) : s; };
export const rad = (d: number) => (d * Math.PI) / 180;
/** Teks radian sebagai pecahan π: 150° → {5/6}π. */
export function piText(deg: number) {
  const c = gcd(Math.round(deg), 180), p = Math.round(deg) / c, q = 180 / c;
  if (p === 0) return "0"; const sign = p < 0 ? "−" : "", a = Math.abs(p);
  return q === 1 ? `${sign}${a === 1 ? "" : a}π` : `${sign}{${a === 1 ? "" : a}π/${q}}`;
}
/** Kuadran sudut baku (null jika tepat pada sumbu). */
export function quadrant(deg: number): 1 | 2 | 3 | 4 | null { const d = ((deg % 360) + 360) % 360; if (d % 90 === 0) return null; return (Math.floor(d / 90) + 1) as 1 | 2 | 3 | 4; }
/** Bentuk p√q/r yang paling sederhana untuk nilai istimewa, dipakai di tampilan peraga. */
export function exact(v: number): string {
  if (!Number.isFinite(v) || Math.abs(v) > 1e6) return "tak terdefinisi";
  for (const q of [1, 2, 3, 5, 6]) for (const r of [1, 2, 3, 4, 5, 6]) { const p = (v * r) / Math.sqrt(q); if (Math.abs(p - Math.round(p)) < 1e-9 && Math.round(p) !== 0 || (q === 1 && r === 1 && Math.abs(v) < 1e-12)) {
    const P = Math.round(p); if (P === 0) return "0"; const g = gcd(P, r), pp = P / g, rr = r / g, sign = pp < 0 ? "−" : "", a = Math.abs(pp);
    const body = q === 1 ? `${a}` : `${a === 1 ? "" : a}√{${q}}`; return rr === 1 ? `${sign}${body}` : `${sign}{${body}/${rr}}`; } }
  return idn(Math.round(v * 1000) / 1000);
}

/* ---------- Gambar ---------- */
export type Scene =
  | { type: "right"; names: [string, string, string]; sides: [string, string, string]; ratio?: number; angle?: string; caption?: string }
  | { type: "triangle"; names: [string, string, string]; angles: [number, number, number]; sides?: [string, string, string]; marks?: [string, string, string]; caption?: string }
  | { type: "clock"; h: number; m: number }
  | { type: "elevation"; kind: "tiang" | "pesawat" | "dua"; labels: Record<string, string> }
  | { type: "circle"; deg: number; label?: string; showCoords?: boolean }
  | { type: "plot"; fns: { f: (x: number) => number; label: string }[]; ymin: number; ymax: number }
  | { type: "table"; head: string[]; rows: (string | number)[][]; caption?: string };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "num"; label: string; value: number; unit?: string }
  | { kind: "surd"; label: string; p: number; q: number; r: number }
  | { kind: "pi"; label: string; p: number; q: number }
  | { kind: "choice"; label: string; options: string[]; answer: string; pics?: Scene[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] };

export type PQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "surd" ? 3 : p.kind === "pi" ? 2 : 1);
export const cells = (p: Part, v: string) => { if (fieldCount(p) === 1) return [v ?? ""]; const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
export const surdValue = (p: number, q: number, r: number) => (p * Math.sqrt(q)) / r;
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "surd": return [p.p, p.q, p.r].map(String);
    case "pi": return [p.p, p.q].map(String);
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
    case "surd": { const [P, Q, R] = x.map(num); return Q >= 0 && R !== 0 && Number.isInteger(Q) && near(surdValue(P, Q, R), surdValue(p.p, p.q, p.r)); }
    case "pi": { const [P, Q] = x.map(num); return Q !== 0 && near(P / Q, p.p / p.q); }
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
      case "surd": return `${plain(p.label)} ${x[0]}√${x[1]} / ${x[2]}`;
      case "pi": return `${plain(p.label)} ${x[0]}π / ${x[1]}`;
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
const sr = (label: string, p: number, qq: number, r = 1): Part => ({ kind: "surd", label, p, q: qq, r });
const pi = (label: string, p: number, qq: number): Part => ({ kind: "pi", label, p, q: qq });
const ch = (label: string, options: string[], answer: string, pics?: Scene[]): Part => ({ kind: "choice", label, options, answer, pics });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const QUAD = ["Kuadran I", "Kuadran II", "Kuadran III", "Kuadran IV"];
const sin = Math.sin, cos = Math.cos;
const plotOf = (fns: [(x: number) => number, string][], ymin = -3.5, ymax = 3.5): Scene => ({ type: "plot", fns: fns.map(([f, label]) => ({ f, label })), ymin, ymax });

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Ukuran Sudut dan Perbandingan Trigonometri", sections: [
    { title: "Ukuran sudut: derajat dan radian", lab: "sudut",
      steps: [
        "Ada dua satuan ukuran sudut: derajat (°) dan radian (rad). Satu putaran penuh = 360°, jadi 1° adalah {1/360} putaran.",
        "Satu radian adalah besar sudut pusat yang panjang busurnya sama dengan jari-jari lingkaran. Secara umum, sudut dalam radian = {panjang busur/jari-jari}.",
        "Satu putaran penuh = 2π rad, sehingga 360° = 2π rad, 180° = π rad, dan 1 rad = {180°/π} ≈ 57,3°.",
        "Mengubah derajat ke radian: kalikan dengan {π/180°}. Contoh 45° = 45 × {π/180} = {π/4} rad. Mengubah radian ke derajat: kalikan dengan {180°/π}. Contoh {3/2}π rad = 270°.",
        "Sudut bertanda positif jika diputar berlawanan arah jarum jam, dan negatif jika searah jarum jam.",
        "Sudut baku (standar) berawal di sumbu x positif. Kuadran I: 0°–90°, kuadran II: 90°–180°, kuadran III: 180°–270°, kuadran IV: 270°–360°. Sudut 0°, 90°, 180°, 270°, dan 360° adalah pembatas kuadran.",
        "Sudut lebih dari 360° berputar lebih dari satu kali. Contoh 600° = 360° + 240°, jadi sisi akhirnya sama dengan 240° dan berada di kuadran III.",
      ],
      life: "Jarum jam adalah alat ukur sudut yang kita lihat setiap hari. Di antara dua angka yang berdekatan pada jam terdapat sudut 360° : 12 = 30°, atau {π/6} rad. Pukul 04.00 berarti jarum panjang di angka 12 dan jarum pendek di angka 4, sehingga sudutnya 4 × 30° = 120° = {2/3}π rad. Roda sepeda yang berputar 3 kali menempuh sudut 3 × 360° = 1.080° = 6π rad. Radian juga dipakai dalam rumus kecepatan putar mesin dan kipas angin.",
      example: "Nyatakan 225° dalam putaran dan radian, lalu tentukan letak sudut 1.200°.",
      work: [
        "225° = 225 × {1/360} putaran = {5/8} putaran.",
        "225° = 225 × {π/180} rad = {5/4}π rad.",
        "1.200° = 3 × 360° + 120°, jadi 1.200° sama dengan 3{1/3} putaran.",
        "Sisi akhirnya sama dengan sudut 120°, sehingga terletak di kuadran II.",
      ],
      notes: [
        "Tanda ° untuk derajat, rad untuk radian. Jika tidak ada satuan dan memuat π, biasanya yang dimaksud radian.",
        "Kurangi atau tambah kelipatan 360° untuk menemukan kuadran sudut yang besar atau negatif.",
        "Sudut pada jam: setiap menit jarum panjang bergerak 6°, dan jarum pendek bergerak 0,5°.",
      ],
      demo: "Putar sisi akhir sudut dengan tombol. Peraga menunjukkan besar sudut dalam derajat, radian, dan putaran, serta kuadrannya.",
    },
    { title: "Perbandingan trigonometri pada segitiga siku-siku", lab: "segitiga",
      steps: [
        "Trigonometri berasal dari bahasa Yunani trigonon (tiga sudut) dan metro (mengukur). Idenya berasal dari kesebangunan: segitiga siku-siku yang sudutnya sama mempunyai perbandingan sisi yang sama.",
        "Untuk sudut lancip C pada segitiga siku-siku: sin C = {sisi di depan sudut/sisi miring}, cos C = {sisi di samping sudut/sisi miring}, tan C = {sisi di depan/sisi di samping}.",
        "Tiga perbandingan lainnya adalah kebalikannya: csc C = {1/sin C}, sec C = {1/cos C}, cot C = {1/tan C}.",
        "Sisi miring selalu sisi terpanjang dan berada di depan sudut siku-siku. Karena itu nilai sin dan cos sudut lancip selalu kurang dari 1.",
        "Jika hanya satu perbandingan diketahui, misalnya sin A = {1/3}, misalkan sisi depan = k dan sisi miring = 3k, lalu cari sisi ketiga dengan Teorema Pythagoras: √{(3k)^{2} − k^{2}} = 2√{2}k.",
        "Sudut elevasi adalah sudut antara garis mendatar dan garis pandang ke atas. Tinggi benda = jarak mendatar × tan(sudut elevasi).",
        "Untuk dua sudut lancip pada segitiga siku-siku yang sama berlaku sin A = cos C dan tan A = cot C, karena sisi depan A adalah sisi samping C.",
      ],
      life: "Pak Yahya ingin mengetahui tinggi tiang bendera tanpa memanjatnya. Bayangan tiang 15 m dan bayangannya sendiri 3 m, sedangkan tingginya 1,6 m. Karena sinar matahari membentuk sudut yang sama, segitiga tiang dan segitiga Pak Yahya sebangun: {tinggi tiang/15} = {1,6/3}, jadi tinggi tiang 8 m. Perbandingan {tinggi/bayangan} = {8/15} inilah nilai tan sudut matahari. Tukang bangunan memakai cara yang sama untuk mengatur kemiringan atap dan tangga.",
      example: "Pada segitiga PQR siku-siku di Q, tan P = {4/3}. Tentukan perbandingan trigonometri lain untuk sudut P.",
      work: [
        "tan P = {QR/PQ} = {4/3}, misalkan QR = 4k dan PQ = 3k.",
        "PR = √{(3k)^{2} + (4k)^{2}} = √{25k^{2}} = 5k.",
        "sin P = {4/5}, cos P = {3/5}.",
        "csc P = {5/4}, sec P = {5/3}, cot P = {3/4}.",
      ],
      notes: [
        "Tentukan dulu sisi di depan dan di samping sudut yang ditanyakan, karena keduanya berubah jika sudutnya berbeda.",
        "Panjang sisi tidak pernah negatif, jadi ambil akar yang positif.",
        "Rasionalkan penyebut jika diminta bentuk paling sederhana: {1/√{2}} = {√{2}/2}.",
      ],
      demo: "Ubah panjang sisi di depan dan di samping sudut A. Sisi miring dihitung dengan Pythagoras, dan keenam perbandingan langsung diperbarui.",
    },
    { title: "Nilai perbandingan untuk sudut istimewa", lab: "istimewa",
      steps: [
        "Sudut 30°, 45°, dan 60° sering dipakai dalam konstruksi, sehingga nilai perbandingannya perlu diingat dalam bentuk eksak.",
        "Sudut 45°: potong persegi bersisi a dengan diagonalnya. Diagonal = a√{2}, jadi sin 45° = cos 45° = {√{2}/2} dan tan 45° = 1.",
        "Sudut 30° dan 60°: belah segitiga sama sisi bersisi 2a dengan garis tinggi. Diperoleh sisi a, a√{3}, dan 2a.",
        "Dari segitiga itu: sin 30° = {1/2}, cos 30° = {√{3}/2}, tan 30° = {√{3}/3}; sin 60° = {√{3}/2}, cos 60° = {1/2}, tan 60° = √{3}.",
        "Sudut 0° dan 90° diperoleh dengan membayangkan segitiga yang makin pipih: sin 0° = 0, cos 0° = 1, sin 90° = 1, cos 90° = 0.",
        "tan 90°, csc 0°, sec 90°, dan cot 0° tidak terdefinisi karena penyebutnya nol.",
        "Pola mudah diingat: sin 0°, 30°, 45°, 60°, 90° berturut-turut {√{0}/2}, {√{1}/2}, {√{2}/2}, {√{3}/2}, {√{4}/2}. Nilai cos urutannya terbalik.",
      ],
      life: "Tangga lipat yang aman biasanya membentuk sudut sekitar 60° dengan lantai. Jika panjang tangga 2 m, ujung atasnya mencapai tinggi 2 × sin 60° = √{3} ≈ 1,73 m, dan kakinya berjarak 2 × cos 60° = 1 m dari dinding. Penyiku tukang kayu juga sering berbentuk segitiga 45°-45°-90° atau 30°-60°-90°. Dengan nilai sudut istimewa, ukuran semacam ini bisa dihitung tanpa kalkulator.",
      example: "Segitiga KLM siku-siku di L, LM = 5 cm, dan ∠M = 30°. Hitung MK, KL, dan cos ∠K.",
      work: [
        "cos 30° = {LM/MK}, jadi {√{3}/2} = {5/MK} dan MK = {10/√{3}} = {10√{3}/3} cm.",
        "tan 30° = {KL/LM}, jadi KL = 5 × {√{3}/3} = {5√{3}/3} cm.",
        "∠K = 180° − 90° − 30° = 60°, sehingga cos ∠K = cos 60° = {1/2}.",
        "Perhatikan sin 30° = cos 60°: sinus sebuah sudut sama dengan cosinus sudut pelengkapnya.",
      ],
      notes: [
        "Jangan memakai nilai desimal kalkulator jika soal meminta bentuk eksak.",
        "(sin 30°)^{2} artinya nilai sin 30° dikuadratkan, yaitu {1/4}.",
        "Gunakan tabel nilai untuk mengecek, tetapi pahami asal-usulnya dari persegi dan segitiga sama sisi.",
      ],
      demo: "Pilih sudut istimewa. Peraga menunjukkan segitiga asalnya (setengah persegi atau setengah segitiga sama sisi) dan nilai sin, cos, tan dalam bentuk eksak.",
    },
  ] },
  { code: "B", title: "Relasi Sudut dan Identitas", sections: [
    { title: "Relasi sudut dan tanda di setiap kuadran", lab: "relasi",
      steps: [
        "Pada lingkaran satuan (jari-jari 1), titik pada sisi akhir sudut θ mempunyai koordinat (cos θ, sin θ). Karena itu tanda sin dan cos mengikuti tanda koordinat titik.",
        "Kuadran I: semua positif. Kuadran II: hanya sin (dan csc) positif. Kuadran III: hanya tan (dan cot) positif. Kuadran IV: hanya cos (dan sec) positif. Singkatan yang mudah: Semua, Sindikat, Tangan, Kosong.",
        "Relasi sudut berelasi untuk 0° < a < 90°: sin(180° − a) = sin a, cos(180° − a) = −cos a, tan(180° − a) = −tan a.",
        "sin(180° + a) = −sin a, cos(180° + a) = −cos a, tan(180° + a) = tan a; serta sin(360° − a) = −sin a, cos(360° − a) = cos a, tan(360° − a) = −tan a.",
        "Relasi dengan 90° menukar fungsi: sin(90° − a) = cos a, cos(90° − a) = sin a, tan(90° − a) = cot a, dan sin(90° + a) = cos a, cos(90° + a) = −sin a.",
        "Sudut yang lebih dari 360° dikurangi kelipatan 360° dulu. Contoh sin 750° = sin(750° − 720°) = sin 30° = {1/2}.",
        "Jika satu nilai diketahui beserta kuadrannya, buat segitiga bantu, cari sisi ketiga, lalu beri tanda sesuai kuadran.",
      ],
      life: "Bola lampu di ujung kincir angin berputar mengelilingi porosnya. Jika jari-jari kincir 1 m, ketinggian lampu terhadap poros adalah sin θ meter, dan pergeserannya ke kanan adalah cos θ meter. Saat θ = 150°, lampu berada setengah meter di atas poros tetapi di sebelah kiri, sehingga sin 150° = {1/2} dan cos 150° = −{√{3}/2}. Saat θ = 210°, lampu turun ke bawah poros, sehingga sin 210° = −{1/2}. Tanda positif dan negatif hanya menunjukkan di sisi mana lampu berada.",
      example: "Diketahui cos α = −{4/5} dan α di kuadran II. Tentukan sin α, csc α, dan cot α.",
      work: [
        "Buat segitiga bantu dengan sisi samping 4 dan sisi miring 5, sehingga sisi depan = √{25 − 16} = 3.",
        "Di kuadran II sin positif, jadi sin α = {3/5} dan csc α = {5/3}.",
        "tan α = {sin α/cos α} = {3/5} : (−{4/5}) = −{3/4}, sehingga cot α = −{4/3}.",
        "Cek: ({3/5})^{2} + (−{4/5})^{2} = {9/25} + {16/25} = 1.",
      ],
      notes: [
        "Tanda ditentukan oleh kuadran sudut semula, bukan oleh sudut lancip pembantunya.",
        "Sudut negatif: −60° sama letaknya dengan 300° di kuadran IV.",
        "Hasil relasi selalu dicek dengan menggambar sudut pada lingkaran satuan.",
      ],
      demo: "Pilih sudut lancip dasar dan kuadran tujuan. Titik pada lingkaran satuan berpindah, dan tanda sin, cos, tan mengikuti letaknya.",
    },
    { title: "Identitas trigonometri", lab: "identitas",
      steps: [
        "Pada segitiga siku-siku dengan sisi a, b, dan miring c berlaku a² + b² = c². Jika dibagi c², diperoleh ({a/c})² + ({b/c})² = 1, yaitu sin² α + cos² α = 1.",
        "Membagi sin² α + cos² α = 1 dengan sin² α menghasilkan 1 + cot² α = csc² α.",
        "Membagi dengan cos² α menghasilkan tan² α + 1 = sec² α.",
        "Identitas ini berlaku untuk semua sudut yang terdefinisi, termasuk sudut tumpul seperti 240°: sin² 240° + cos² 240° = {3/4} + {1/4} = 1.",
        "Identitas hanya berlaku untuk sudut yang sama. sin² α + cos² β = 1 tidak selalu benar.",
        "Membuktikan identitas: ubah satu ruas (biasanya yang lebih rumit) memakai definisi dan identitas dasar sampai sama dengan ruas lainnya.",
        "Bentuk yang sering muncul: (sec α − tan α)(sec α + tan α) = sec² α − tan² α = 1, dan {1/(1 − sin θ)} − {1/(1 + sin θ)} = {2 sin θ/cos² θ}.",
      ],
      life: "Seorang pilot drone mengatur arah terbang dengan sudut θ dari utara. Jika drone terbang 1 km, ia bergeser cos θ km ke utara dan sin θ km ke timur. Seberapa pun sudutnya, kedua pergeseran itu selalu memenuhi sin² θ + cos² θ = 1, karena jarak yang ditempuh tetap 1 km. Identitas ini dipakai aplikasi peta untuk mengecek apakah data arah dan jarak dari sensor masuk akal.",
      example: "Diketahui 0° < β < 90° dan tan β = 3. Hitung sin β dan cos β tanpa menggambar segitiga.",
      work: [
        "sec² β = 1 + tan² β = 1 + 9 = 10, jadi sec β = √{10} (positif karena kuadran I).",
        "cos β = {1/sec β} = {1/√{10}} = {√{10}/10}.",
        "csc² β = 1 + cot² β = 1 + {1/9} = {10/9}, jadi csc β = {√{10}/3}.",
        "sin β = {3/√{10}} = {3√{10}/10}. Cek: {90/100} + {10/100} = 1.",
      ],
      notes: [
        "Tulis sin² α untuk (sin α)². Ini berbeda dengan sin(α²).",
        "Saat mengakarkan, tentukan tanda dari kuadran sudutnya.",
        "Identitas yang benar harus berlaku untuk setiap sudut, jadi satu contoh angka tidak cukup sebagai bukti, tetapi satu contoh yang gagal sudah cukup untuk membantah.",
      ],
      demo: "Ubah sudut θ. Dua batang menunjukkan sin² θ dan cos² θ yang panjangnya selalu berjumlah 1, dan nilai tan² θ + 1 dibandingkan dengan sec² θ.",
    },
  ] },
  { code: "C", title: "Aturan Sinus, Cosinus, dan Grafik", sections: [
    { title: "Aturan sinus, aturan cosinus, dan luas segitiga", lab: "aturan",
      steps: [
        "Garis tinggi adalah garis dari satu sudut yang tegak lurus sisi di hadapannya. Garis berat adalah garis dari satu sudut ke titik tengah sisi di hadapannya.",
        "Dengan garis tinggi, setiap segitiga dibagi menjadi dua segitiga siku-siku. Dari sana diperoleh aturan sinus: {a/sin A} = {b/sin B} = {c/sin C}.",
        "Aturan sinus dipakai jika diketahui dua sudut dan satu sisi, atau dua sisi dan sudut di depan salah satunya.",
        "Aturan cosinus: a² = b² + c² − 2bc cos A, b² = a² + c² − 2ac cos B, c² = a² + b² − 2ab cos C.",
        "Aturan cosinus dipakai jika diketahui dua sisi dan sudut apitnya, atau ketiga sisinya. Untuk mencari sudut: cos A = {(b^{2} + c^{2} − a^{2})/2bc}.",
        "Luas segitiga sembarang = {1/2}bc sin A = {1/2}ac sin B = {1/2}ab sin C.",
        "Jika cos sudut bernilai negatif, sudut itu tumpul. Contoh sisi 3, 5, 7: cos C = {(9 + 25 − 49)/30} = −{1/2}, jadi C = 120°.",
      ],
      life: "Dinas tata ruang ingin membangun jalan lurus dari kota B ke kota C yang memotong dua jalan lain. Jarak A ke C 5 km, sudut di C 70°, dan sudut di B 30°. Jarak A ke B tidak bisa diukur langsung karena terhalang bukit, tetapi aturan sinus memberikannya: AB = {5 sin 70°/sin 30°} ≈ 9,4 km. Petugas survei juga memakai aturan cosinus untuk menghitung lebar danau dari dua jarak dan sudut yang bisa diukur di darat.",
      example: "Pada segitiga ABC, b = 3, c = 5, dan ∠A = 120°. Hitung a dan luas segitiga.",
      work: [
        "a² = b² + c² − 2bc cos A = 9 + 25 − 2(3)(5)(−{1/2}) = 34 + 15 = 49.",
        "a = 7.",
        "Luas = {1/2}bc sin A = {1/2}(3)(5)(sin 120°) = {15/2} × {√{3}/2} = {15√{3}/4}.",
        "Cek dengan aturan sinus: {7/sin 120°} ≈ 8,08 dan {3/sin B} harus sama, sehingga sin B ≈ 0,371.",
      ],
      notes: [
        "Sisi a selalu berada di depan sudut A, sisi b di depan sudut B, dan seterusnya.",
        "Jumlah sudut segitiga 180°. Jika dua sudut diketahui, sudut ketiga langsung didapat.",
        "cos 120° = −{1/2}, bukan {1/2}. Tanda negatif membuat sisi di depan sudut tumpul menjadi yang terpanjang.",
      ],
      demo: "Atur dua sisi dan sudut apitnya. Segitiga digambar sesuai ukuran, dan sisi ketiga serta luasnya dihitung dengan aturan cosinus.",
    },
    { title: "Grafik fungsi trigonometri", lab: "grafik",
      steps: [
        "Grafik y = sin x untuk 0 ≤ x ≤ 2π digambar dari pasangan titik sudut istimewa: (0, 0), ({π/6}, {1/2}), ({π/2}, 1), (π, 0), ({3π/2}, −1), (2π, 0).",
        "y = sin x berbentuk gelombang dengan satu gunung dan satu lembah dalam satu periode 2π. Nilai maksimum 1, minimum −1, dan daerah hasilnya −1 ≤ y ≤ 1.",
        "y = cos x juga gelombang dengan bentuk yang sama, tetapi digeser: cos x = sin(x + {π/2}). Grafiknya dimulai dari (0, 1).",
        "y = tan x tidak mempunyai nilai maksimum dan minimum. Grafiknya terputus di x = {π/2} dan x = {3π/2} (asimtot) dan berulang setiap π.",
        "Pada y = a sin bx: |a| adalah amplitudo (nilai maksimum menjadi |a|), dan periodenya {2π/b}. Contoh y = sin 2x mempunyai dua gunung dan dua lembah pada 0 ≤ x ≤ 2π.",
        "Pada y = a sin x + d, grafik digeser d satuan ke atas, sehingga maksimum |a| + d dan minimum −|a| + d.",
        "Tanda negatif seperti y = −cos x mencerminkan grafik terhadap sumbu x.",
      ],
      life: "Ketinggian air laut di pelabuhan naik-turun seperti gelombang sinus. Jika rata-rata tinggi air 2 m dan pasang-surut berubah 1,5 m di atas dan di bawahnya, tinggi air dapat dimodelkan dengan y = 1,5 sin x + 2. Tinggi maksimum 3,5 m dan minimum 0,5 m. Nelayan memakai pola ini untuk menentukan kapan perahu aman keluar dari dermaga. Suara dan arus listrik bolak-balik di rumah juga berbentuk gelombang sinus.",
      example: "Tentukan nilai maksimum, minimum, dan periode y = 3 sin 2x + 1.",
      work: [
        "Nilai sin 2x berada antara −1 dan 1.",
        "3 sin 2x berada antara −3 dan 3, jadi y berada antara −3 + 1 = −2 dan 3 + 1 = 4.",
        "Maksimum 4, minimum −2.",
        "Periode = {2π/2} = π, sehingga ada dua gelombang penuh pada 0 ≤ x ≤ 2π.",
      ],
      notes: [
        "Amplitudo selalu positif, yaitu |a|.",
        "Konstanta b mengubah periode, bukan tinggi gelombang.",
        "Untuk tan x, periodenya π dan tidak ada nilai maksimum.",
      ],
      demo: "Pilih fungsi sin, cos, atau tan, lalu ubah a, b, dan d. Grafik, nilai maksimum, minimum, dan periodenya diperbarui.",
    },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: `${t.code}.${j + 1}`, topic: t })));

/* ---------- Latihan (4 per bagian) ---------- */
/** Segitiga dari panjang sisi a, b, c (a di depan nama pertama). */
const tri = (names: [string, string, string], sidesLen: [number, number, number], sides: [string, string, string], marks: [string, string, string]): Scene => {
  const [a, b, c] = sidesLen, A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180 / Math.PI, B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / Math.PI;
  return { type: "triangle", names, angles: [A, B, 180 - A - B], sides, marks };
};
const clock = (h: number, m: number): Scene => ({ type: "clock", h, m });
export const practice: PQuestion[][] = [
  [
    q(0, "Ubah satuan sudut berikut.",
      [pi("150° = … rad:", 5, 6), n("{4/9}π rad =", 80, "°")],
      "150° × {π/180} = {5/6}π rad. {4/9}π × {180°/π} = 80°."),
    q(0, "Tentukan kuadran setiap sudut baku berikut.",
      [{ kind: "classify", options: QUAD, rows: [{ text: "135°", answer: QUAD[1] }, { text: "300°", answer: QUAD[3] }, { text: "−60°", answer: QUAD[3] }, { text: "480°", answer: QUAD[1] }] }],
      "−60° sama letaknya dengan 300° (kuadran IV), dan 480° = 360° + 120° (kuadran II)."),
    q(0, "Nyatakan dalam satuan yang diminta.",
      [n("{3/8} putaran =", 135, "°"), n("1.080° =", 3, "putaran")],
      "{3/8} × 360° = 135°. 1.080° : 360° = 3 putaran."),
    q(0, "Jam menunjukkan pukul 04.00. Tentukan sudut terkecil antara kedua jarum.",
      [n("Sudut =", 120, "°"), pi("Dalam radian:", 2, 3)],
      "Dari angka 12 ke angka 4 ada 4 × 30° = 120° = {2/3}π rad.", { scene: clock(4, 0) }),
  ],
  [
    q(1, "Segitiga PQR siku-siku di Q dengan PQ = 12 dan QR = 5. Tentukan nilainya.",
      [n("PR =", 13), n("sin R =", 12 / 13), n("tan R =", 12 / 5)],
      "PR = √{144 + 25} = 13. Sisi di depan R adalah PQ = 12 dan sisi di sampingnya QR = 5, jadi sin R = {12/13}, tan R = {12/5}.",
      { scene: { type: "right", names: ["R", "Q", "P"], sides: ["5", "12", ""], ratio: 2.4, angle: "R" } }),
    q(1, "Pada segitiga ABC siku-siku di B, sin A = {2/5}. Tentukan cos A dan tan A dalam bentuk {p√{q}/r}.",
      [sr("cos A =", 1, 21, 5), sr("tan A =", 2, 21, 21)],
      "Sisi depan 2k, miring 5k, samping √{25k^{2} − 4k^{2}} = k√{21}. cos A = {√{21}/5}, tan A = {2/√{21}} = {2√{21}/21}."),
    q(1, "Pada segitiga siku-siku, tan P = {5/12} dengan P sudut lancip.",
      [n("sin P =", 5 / 13), n("sec P =", 13 / 12)],
      "Sisi depan 5k, samping 12k, miring 13k. sin P = {5/13}, sec P = {13/12}."),
    q(1, "Tiang setinggi 6 m mempunyai bayangan 9 m. Pada saat yang sama, seorang anak setinggi 1,2 m berdiri di dekatnya.",
      [n("Panjang bayangan anak =", 1.8, "m"), n("tan sudut matahari =", 2 / 3)],
      "Segitiganya sebangun: {6/9} = {1,2/x}, jadi x = 1,8 m. tan sudut = {tinggi/bayangan} = {6/9} = {2/3}.",
      { scene: { type: "elevation", kind: "tiang", labels: { tinggi: "6 m", jarak: "9 m", sudut: "θ" } } }),
  ],
  [
    q(2, "Hitung nilai bentuk berikut.",
      [n("sin 60° × cos 30° − cos 60° × sin 30° =", 1 / 2)],
      "{√{3}/2} × {√{3}/2} − {1/2} × {1/2} = {3/4} − {1/4} = {1/2}."),
    q(2, "Tulis nilai eksaknya dalam bentuk {p√{q}/r}.",
      [sr("cos 45° =", 1, 2, 2), sr("tan 60° =", 1, 3, 1)],
      "Dari setengah persegi: cos 45° = {√{2}/2}. Dari setengah segitiga sama sisi: tan 60° = √{3}."),
    q(2, "Segitiga KLM siku-siku di L, LM = 6 cm, dan ∠M = 30°.",
      [sr("MK =", 4, 3, 1), sr("KL =", 2, 3, 1)],
      "cos 30° = {6/MK}, jadi MK = {12/√{3}} = 4√{3}. KL = 6 tan 30° = 6 × {√{3}/3} = 2√{3}.",
      { scene: { type: "right", names: ["M", "L", "K"], sides: ["6", "", ""], ratio: 1 / Math.sqrt(3), angle: "30°" } }),
    q(2, "Tentukan nilai setiap perbandingan.",
      [{ kind: "classify", options: ["0", "1", "tak terdefinisi"], rows: [{ text: "tan 90°", answer: "tak terdefinisi" }, { text: "cot 90°", answer: "0" }, { text: "csc 0°", answer: "tak terdefinisi" }, { text: "sec 0°", answer: "1" }] }],
      "tan 90° = {1/0} dan csc 0° = {1/sin 0°} = {1/0} tidak terdefinisi. cot 90° = {0/1} = 0, sec 0° = {1/1} = 1."),
  ],
  [
    q(3, "Tentukan kuadran α dari tanda perbandingannya.",
      [{ kind: "classify", options: QUAD, rows: [{ text: "sin α > 0, cos α < 0", answer: QUAD[1] }, { text: "sin α < 0, cos α > 0", answer: QUAD[3] }, { text: "tan α > 0, sin α < 0", answer: QUAD[2] }, { text: "csc α > 0, tan α > 0", answer: QUAD[0] }] }],
      "Kuadran I semua positif, II hanya sin, III hanya tan, IV hanya cos."),
    q(3, "Tentukan nilai eksak berikut dalam bentuk {p√{q}/r}.",
      [sr("sin 150° =", 1, 1, 2), sr("cos 225° =", -1, 2, 2), sr("tan 300° =", -1, 3, 1)],
      "sin 150° = sin 30° = {1/2}; cos 225° = −cos 45° = −{√{2}/2}; tan 300° = −tan 60° = −√{3}."),
    q(3, "Diketahui cos α = −{3/5} dan α di kuadran II.",
      [n("sin α =", 4 / 5), n("tan α =", -4 / 3), n("csc α =", 5 / 4)],
      "Sisi depan √{25 − 9} = 4. Di kuadran II sin positif: sin α = {4/5}, tan α = −{4/3}, csc α = {5/4}."),
    q(3, "Hitung nilai sudut yang lebih dari 360°.",
      [n("sin 750° =", 1 / 2), n("cos 1.200° =", -1 / 2)],
      "750° − 720° = 30°, jadi sin 750° = {1/2}. 1.200° − 1.080° = 120°, jadi cos 1.200° = −{1/2}."),
  ],
  [
    q(4, "Diketahui 0° < β < 90° dan tan β = 2. Gunakan identitas untuk menentukan nilainya.",
      [sr("sin β =", 2, 5, 5), sr("cos β =", 1, 5, 5)],
      "sec² β = 1 + 4 = 5, cos β = {1/√{5}} = {√{5}/5}. sin β = tan β × cos β = {2√{5}/5}."),
    q(4, "Tentukan benar atau salah setiap identitas.",
      [tf(["sin² α + cos² α = 1 untuk setiap α.", true], ["1 + tan² α = sec² α", true], ["sin² α + cos² β = 1 untuk setiap α dan β.", false], ["csc² α − cot² α = 1", true])],
      "Identitas hanya berlaku untuk sudut yang sama. csc² α − cot² α = 1 berasal dari 1 + cot² α = csc² α."),
    q(4, "Sederhanakan bentuk berikut.",
      [ch("(sec x − tan x)(sec x + tan x) =", ["1", "sec^{2} x", "0"], "1"), ch("cos x · tan x =", ["cos x", "1", "sin x"], "sin x")],
      "(sec x − tan x)(sec x + tan x) = sec² x − tan² x = 1. cos x · {sin x/cos x} = sin x."),
    q(4, "Diketahui sin θ = {3/5} dengan θ lancip.",
      [n("(sin θ + cos θ)^{2} =", 49 / 25), n("sin^{2} θ − cos^{2} θ =", -7 / 25)],
      "cos θ = {4/5}. ({3/5} + {4/5})² = {49/25}. {9/25} − {16/25} = −{7/25}."),
  ],
  [
    q(5, "Pada segitiga ABC, b = 10, ∠A = 30°, dan ∠B = 45°. Tentukan panjang a dengan aturan sinus.",
      [sr("a =", 5, 2, 1)],
      "{a/sin 30°} = {10/sin 45°}, jadi a = {10 × 1/2/(√{2}/2)} = {10/√{2}} = 5√{2}.",
      { scene: { type: "triangle", names: ["A", "B", "C"], angles: [30, 45, 105], sides: ["a = ?", "b = 10", ""], marks: ["30°", "45°", ""] } }),
    q(5, "Pada segitiga ABC, a = 5, b = 8, dan ∠C = 60°. Tentukan c.",
      [n("c =", 7)],
      "c² = 25 + 64 − 2(5)(8)({1/2}) = 89 − 40 = 49, jadi c = 7.",
      { scene: tri(["A", "B", "C"], [5, 8, 7], ["5", "8", "c = ?"], ["", "", "60°"]) }),
    q(5, "Hitung luas segitiga dengan a = 6, b = 8, dan ∠C = 30°.",
      [n("Luas =", 12, "satuan luas")],
      "Luas = {1/2}ab sin C = {1/2}(6)(8)({1/2}) = 12."),
    q(5, "Sisi-sisi segitiga adalah 4, 5, dan 6. Tentukan cosinus sudut terbesar.",
      [n("cos sudut terbesar =", 1 / 8)],
      "Sudut terbesar berada di depan sisi 6: cos = {(16 + 25 − 36)/(2 × 4 × 5)} = {5/40} = {1/8}."),
  ],
  [
    q(6, "Perhatikan fungsi y = 3 sin x dan y = sin 2x.",
      [n("Nilai maksimum y = 3 sin x:", 3), n("Nilai minimum y = 3 sin x:", -3), pi("Periode y = sin 2x:", 1, 1)],
      "Amplitudo 3 memberi maksimum 3 dan minimum −3. Periode sin 2x = {2π/2} = π."),
    q(6, "Manakah grafik y = cos x untuk 0 ≤ x ≤ 2π?",
      [ch("Grafik:", ["P", "Q", "R"], "Q", [plotOf([[x => sin(x), ""]], -1.5, 1.5), plotOf([[x => cos(x), ""]], -1.5, 1.5), plotOf([[x => -cos(x), ""]], -1.5, 1.5)])],
      "y = cos x dimulai dari (0, 1), turun ke −1 di x = π, lalu naik lagi ke 1 di 2π."),
    q(6, "Untuk 0° ≤ x ≤ 360°, apakah fungsi berikut terdefinisi di semua x?",
      [{ kind: "classify", options: ["Semua x", "Ada yang tidak"], rows: [{ text: "y = sin x", answer: "Semua x" }, { text: "y = tan x", answer: "Ada yang tidak" }, { text: "y = cos x", answer: "Semua x" }, { text: "y = sec x", answer: "Ada yang tidak" }] }],
      "tan x dan sec x = {1/cos x} tidak terdefinisi di x = 90° dan 270°."),
    q(6, "Tentukan nilai maksimum dan minimum y = 2 + sin x.",
      [n("Maksimum =", 3), n("Minimum =", 1)],
      "sin x antara −1 dan 1, jadi y antara 1 dan 3."),
  ],
];

/* ---------- Evaluasi 24 soal ---------- */
const S = "Sedang", Mn = "Menantang", SM = "Sangat menantang";
const lvl = (level: Level, x: PQuestion): PQuestion => ({ ...x, level });
export const assessment: PQuestion[] = [
  lvl(S, q(0, "Tentukan benar atau salah setiap pernyataan.",
    [tf(["{1/6} putaran = 60° = {1/3}π rad", true], ["135° = {3/8} putaran = {3/4}π rad", true], ["{9/4}π rad = 405° = 1,25 putaran", false], ["1.440° = 8π rad = 4 putaran", true])],
    "{9/4}π rad = 405°, tetapi 405° : 360° = 1,125 putaran, bukan 1,25. Pernyataan lain benar.")),
  lvl(S, q(3, "Tentukan nilai berikut.",
    [sr("sin 240° = (bentuk {p√{q}/r})", -1, 3, 2), n("tan 135° =", -1)],
    "240° = 180° + 60° di kuadran III: sin 240° = −sin 60° = −{√{3}/2}. 135° di kuadran II: tan 135° = −tan 45° = −1.",
    { scene: { type: "circle", deg: 240, label: "240°" } })),
  lvl(S, q(5, "Pada segitiga ABC, b = 3, c = 5, dan ∠A = 120°. Hitung panjang a.",
    [n("a =", 7)],
    "a² = 9 + 25 − 2(3)(5) cos 120° = 34 + 15 = 49, jadi a = 7.",
    { scene: tri(["A", "B", "C"], [7, 3, 5], ["a = ?", "b = 3", "c = 5"], ["120°", "", ""]) })),
  lvl(S, q(1, "Segitiga ABC siku-siku di B, AB = 15 cm, dan BC = 8 cm.",
    [n("sin A =", 8 / 17), n("cos A =", 15 / 17), n("tan C =", 15 / 8)],
    "AC = √{225 + 64} = 17. Untuk sudut A: depan BC = 8, samping AB = 15. Untuk sudut C: depan AB = 15, samping BC = 8.",
    { scene: { type: "right", names: ["A", "B", "C"], sides: ["15", "8", ""], ratio: 8 / 15, angle: "A" } })),
  lvl(S, q(4, "Diketahui 0° < β < 90° dan tan β = 4. Tentukan sin β dan cos β.",
    [sr("sin β =", 4, 17, 17), sr("cos β =", 1, 17, 17)],
    "sec² β = 1 + 16 = 17, cos β = {1/√{17}} = {√{17}/17}, sin β = 4 cos β = {4√{17}/17}.")),
  lvl(S, q(6, "Manakah grafik y = 2 sin x untuk 0 ≤ x ≤ 2π?",
    [ch("Grafik:", ["P", "Q", "R"], "R", [plotOf([[x => sin(2 * x), ""]]), plotOf([[x => sin(x) + 2, ""]]), plotOf([[x => 2 * sin(x), ""]])])],
    "y = 2 sin x mempunyai satu gunung dan satu lembah dengan puncak 2 dan lembah −2. Grafik P adalah sin 2x (dua gelombang), Q adalah sin x + 2 (digeser ke atas).")),
  lvl(S, q(2, "Hitung nilai bentuk pecahan berikut dengan nilai sudut istimewa.",
    [n("{(4 cos^{2} 60° + 3 sec^{2} 30° − 2 tan^{2} 45°)/(sin^{2} 30° + cos^{2} 30°)} =", 3)],
    "4 × {1/4} + 3 × {4/3} − 2 × 1 = 1 + 4 − 2 = 3, dan penyebutnya sin² 30° + cos² 30° = 1.")),
  lvl(S, q(3, "Dari tanda perbandingannya, tentukan letak kuadran α.",
    [{ kind: "classify", options: QUAD, rows: [{ text: "cos α > 0, tan α < 0", answer: QUAD[3] }, { text: "sec α < 0, sin α > 0", answer: QUAD[1] }, { text: "cot α > 0, cos α < 0", answer: QUAD[2] }] }],
    "cos positif dan tan negatif: kuadran IV. sec negatif berarti cos negatif, dengan sin positif: kuadran II. cot positif berarti tan positif, dengan cos negatif: kuadran III.")),
  lvl(Mn, q(5, "Jalan dari kota A ke B dan dari A ke C membentuk segitiga dengan jalan B ke C. Jarak A ke C 6 km, ∠B = 45°, dan ∠C = 60°. Hitung jarak A ke B.",
    [sr("AB = (bentuk {p√{q}/r}) km", 3, 6, 1)],
    "{AB/sin C} = {AC/sin B}, jadi AB = {6 × (√{3}/2)/(√{2}/2)} = {6√{3}/√{2}} = 3√{6} ≈ 7,35 km.",
    { scene: { type: "triangle", names: ["A", "B", "C"], angles: [75, 45, 60], sides: ["", "6 km", "? km"], marks: ["", "45°", "60°"] } })),
  lvl(Mn, q(0, "Jam menunjukkan pukul 03.30. Tentukan sudut terkecil antara kedua jarum.",
    [n("Sudut =", 75, "°"), pi("Dalam radian:", 5, 12)],
    "Jarum panjang di angka 6 (180°). Jarum pendek di antara 3 dan 4: 3 × 30° + 30 × 0,5° = 105°. Selisihnya 75° = {5/12}π rad.",
    { scene: clock(3, 30) })),
  lvl(Mn, q(4, "Diketahui tan θ = −{5/12} dan sin θ > 0.",
    [n("cos θ =", -12 / 13), n("csc θ =", 13 / 5)],
    "tan negatif dan sin positif berarti kuadran II. Sisi miring √{25 + 144} = 13. cos θ = −{12/13}, csc θ = {13/5}.")),
  lvl(Mn, q(6, "Perhatikan fungsi y = 3 sin 2x.",
    [n("Nilai maksimum =", 3), pi("Periode =", 1, 1), n("Nilai y saat x = {π/4}:", 3)],
    "Amplitudo 3, periode {2π/2} = π. Saat x = {π/4}: 3 sin({π/2}) = 3.",
    { scene: plotOf([[x => 3 * sin(2 * x), "y = 3 sin 2x"]]) })),
  lvl(Mn, q(1, "Dua guru setinggi 1,5 m memandang puncak tiang bendera. Guru pertama berdiri 12 m di depan guru kedua. Sudut elevasi guru pertama 60° dan guru kedua 30°. Hitung tinggi tiang di atas mata guru (AB).",
    [sr("AB = (bentuk {p√{q}/r}) m", 6, 3, 1)],
    "BG = {AB/tan 60°} dan BF = BG + 12 = {AB/tan 30°}. Jadi AB({1/tan 30°} − {1/tan 60°}) = 12, yaitu AB(√{3} − {√{3}/3}) = 12, sehingga AB = {12/(2√{3}/3)} = 6√{3} ≈ 10,4 m. Tinggi tiang sekitar 10,4 + 1,5 = 11,9 m.",
    { scene: { type: "elevation", kind: "dua", labels: { a: "60°", b: "30°", jarak: "12 m", mata: "1,5 m" } } })),
  lvl(Mn, q(3, "Gunakan relasi sudut.",
    [n("sin 3A = cos(A − 22°), dengan 3A sudut lancip. A =", 28, "°"), n("{tan 65°/cot 25°} =", 1)],
    "sin 3A = cos(90° − 3A), jadi 90° − 3A = A − 22°, 4A = 112°, A = 28°. cot 25° = tan 65°, jadi hasil bagi 1.")),
  lvl(Mn, q(5, "Segitiga ABC mempunyai a = 8, b = 10, dan ∠C = 150°.",
    [n("Luas =", 20, "satuan luas")],
    "Luas = {1/2}ab sin C = {1/2}(8)(10) sin 150° = 40 × {1/2} = 20.",
    { scene: tri(["A", "B", "C"], [8, 10, Math.sqrt(164 + 80 * Math.sqrt(3))], ["8", "10", ""], ["", "", "150°"]) })),
  lvl(Mn, q(2, "Diketahui sin(A + B) = 1 dan cos(A − B) = {√{3}/2}, dengan A > B dan keduanya sudut lancip.",
    [n("A =", 60, "°"), n("B =", 30, "°")],
    "sin(A + B) = 1 berarti A + B = 90°. cos(A − B) = {√{3}/2} berarti A − B = 30°. Dijumlahkan: 2A = 120°, A = 60°, B = 30°.")),
  lvl(Mn, q(4, "Tentukan benar atau salah setiap kesamaan.",
    [tf(["(tan x + sec x)(tan x − sec x) = −1", true], ["{1/(1 + cos x)} + {1/(1 − cos x)} = 2 csc^{2} x", true], ["cos x · csc x · tan x = 0", false], ["{sin x/(1 + cos x)} + {sin x/(1 − cos x)} = 2 csc x", true])],
    "tan² x − sec² x = −1. Pecahan kedua: {2/(1 − cos^{2} x)} = {2/sin^{2} x}. cos x · {1/sin x} · {sin x/cos x} = 1, bukan 0. Pecahan keempat: {2 sin x/sin^{2} x} = 2 csc x.")),
  lvl(SM, q(6, "Perhatikan fungsi y = 2 sin x + 1 untuk 0 ≤ x ≤ 2π.",
    [n("Maksimum =", 3), n("Minimum =", -1), ch("Banyak titik potong dengan sumbu x:", ["0", "1", "2"], "2")],
    "Maksimum 2 + 1 = 3, minimum −2 + 1 = −1. y = 0 jika sin x = −{1/2}, yaitu x = {7π/6} dan x = {11π/6}: dua titik.",
    { scene: plotOf([[x => 2 * sin(x) + 1, "y = 2 sin x + 1"]]) })),
  lvl(SM, q(0, "Sudut α lancip (0° < α < 90°) dan sudut θ tumpul (90° < θ < 180°). Selidiki kebenaran setiap pernyataan.",
    [tf(["2α selalu lebih dari atau sama dengan 90°.", false], ["θ − α selalu positif.", true], ["α + θ selalu kurang dari 270°.", true], ["2θ selalu sudut tumpul.", false])],
    "α = 20° memberi 2α = 40°. θ > 90° > α, jadi θ − α > 0. α + θ < 90° + 180° = 270°. θ = 100° memberi 2θ = 200°, bukan sudut tumpul.")),
  lvl(SM, q(3, "Hitung nilai sudut yang besar berikut.",
    [n("sin 2.910° =", 1 / 2), sr("cos 1.665° = (bentuk {p√{q}/r})", -1, 2, 2)],
    "2.910° − 8 × 360° = 30°, jadi sin 2.910° = {1/2}. 1.665° − 4 × 360° = 225°, jadi cos 1.665° = cos 225° = −{√{2}/2}.")),
  lvl(SM, q(5, "Seorang petugas berjalan 8 km dari titik A ke titik B di tepi danau, lalu berbelok dan berjalan 5 km ke titik C, sehingga ∠ABC = 60°. Hitung lebar danau AC.",
    [n("AC =", 7, "km")],
    "AC² = 8² + 5² − 2(8)(5) cos 60° = 64 + 25 − 40 = 49, jadi AC = 7 km.",
    { scene: tri(["A", "B", "C"], [5, 7, 8], ["5 km", "AC = ?", "8 km"], ["", "60°", ""]) })),
  lvl(SM, q(1, "Segitiga PQR siku-siku di Q dengan PR + QR = 18 cm dan PQ = 6 cm.",
    [n("PR =", 10, "cm"), n("sin P =", 4 / 5), n("tan P =", 4 / 3)],
    "PR² − QR² = PQ² = 36, jadi (PR − QR)(PR + QR) = 36 dan PR − QR = 2. Diperoleh PR = 10, QR = 8. Untuk sudut P: depan QR = 8, samping PQ = 6.",
    { scene: { type: "right", names: ["P", "Q", "R"], sides: ["6", "", ""], ratio: 4 / 3, angle: "P" } })),
  lvl(SM, q(4, "Diketahui {tan^{2} β/(sec β − 1)} = 3 dengan 0° < β < 90°.",
    [n("sec β =", 2), n("β =", 60, "°")],
    "tan² β = sec² β − 1 = (sec β − 1)(sec β + 1), jadi bentuknya menjadi sec β + 1 = 3 dan sec β = 2. cos β = {1/2}, sehingga β = 60°.")),
  lvl(SM, q(6, "Perhatikan fungsi y = −2 cos x + 1 untuk 0 ≤ x ≤ 2π.",
    [n("Nilai maksimum =", 3), pi("Maksimum tercapai di x =", 1, 1), n("Nilai minimum =", -1)],
    "−2 cos x terbesar saat cos x = −1, yaitu x = π: y = 2 + 1 = 3. Terkecil saat cos x = 1: y = −2 + 1 = −1.",
    { scene: plotOf([[x => -2 * cos(x) + 1, "y = −2 cos x + 1"]]) })),
];
