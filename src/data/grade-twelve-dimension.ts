/**
 * Kelas 12 Bab 1 - Dimensi Tiga
 * (sumber: Buku Siswa Matematika Kelas XII, Bab 1, hlm. 1-26).
 * A. Jarak antartitik (Subbab 1.1)  B. Jarak titik ke garis (1.2)  C. Jarak titik ke bidang (1.3).
 * Bentuk jawaban mengikuti buku: memilih ruas garis yang merupakan jarak (Tabel 1.2-1.4), rute dan lintasan
 * terpendek (Masalah 1.1), jarak dua titik dengan rumus koordinat, panjang diagonal, jarak titik ke garis dan
 * ke bidang pada kubus, balok, dan limas dalam bentuk akar p√q/r, serta d = ab/c (Masalah 1.6).
 * Catatan: Uji Kompetensi no. 8 di buku tidak menuliskan panjang rusuk, dan no. 4 menulis "panjang setiap
 * bidang empat", jadi kedua soal itu tidak dipakai.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type V3 = [number, number, number];

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
const str = (n: number) => { for (const d of [1, 2, 3, 4, 5, 6, 8, 10, 13, 17, 25]) { const k = n * d; if (Math.abs(k - Math.round(k)) < 1e-9) { if (d === 1) return String(Math.round(n)); const p = Math.round(k), c = gcd(p, d); return `${p / c}/${d / c}`; } } return String(Math.round(n * 1e6) / 1e6).replace(".", ","); };

/** √d2 dalam bentuk p√q/r paling sederhana (d2 rasional dengan penyebut kecil). */
export function surdOf(d2: number): { p: number; q: number; r: number } {
  for (let den = 1; den <= 60; den++) {
    const N = d2 * den; if (Math.abs(N - Math.round(N)) > 1e-7) continue;
    let inside = Math.round(N) * den, out = 1; // √(N/den) = √(N·den)/den
    for (let k = 2; k * k <= inside; k++) while (inside % (k * k) === 0) { inside /= k * k; out *= k; }
    const g = gcd(out, den); return { p: out / g, q: inside, r: den / g };
  }
  return { p: Math.sqrt(d2), q: 1, r: 1 };
}
/** Teks akar untuk tampilan: 4√{2}, {2√{6}/3}, 7. */
export function surdText(d2: number) {
  const { p, q, r } = surdOf(d2); if (q === 0) return "0";
  const body = q === 1 ? String(p) : `${p === 1 ? "" : p}√{${q}}`;
  return r === 1 ? body : `{${body}/${r}}`;
}

/* ---------- Geometri ruang ---------- */
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const dist2 = (a: V3, b: V3) => dot(sub(a, b), sub(a, b));
/** Kuadrat jarak titik P ke garis AB dan titik kakinya. */
export function lineFoot(P: V3, A: V3, B: V3) { const d = sub(B, A), t = dot(sub(P, A), d) / dot(d, d), F: V3 = [A[0] + t * d[0], A[1] + t * d[1], A[2] + t * d[2]]; return { d2: dist2(P, F), F, t }; }
/** Kuadrat jarak titik P ke bidang ABC dan proyeksinya. */
export function planeFoot(P: V3, A: V3, B: V3, C: V3) { const n = cross(sub(B, A), sub(C, A)), k = dot(sub(P, A), n) / dot(n, n), F: V3 = [P[0] - k * n[0], P[1] - k * n[1], P[2] - k * n[2]]; return { d2: dist2(P, F), F }; }

export type Shape = "kubus" | "balok" | "limas4" | "limas3" | "limas6";
/** Koordinat titik sudut (x ke kanan, y ke belakang, z ke atas), sesuai penamaan buku. */
export function solidPoints(shape: Shape, d: number[]): Record<string, V3> {
  if (shape === "kubus" || shape === "balok") {
    const [p, l, t] = shape === "kubus" ? [d[0], d[0], d[0]] : d;
    return { A: [0, 0, 0], B: [p, 0, 0], C: [p, l, 0], D: [0, l, 0], E: [0, 0, t], F: [p, 0, t], G: [p, l, t], H: [0, l, t] };
  }
  if (shape === "limas4") { const [s, h] = d; return { A: [0, 0, 0], B: [s, 0, 0], C: [s, s, 0], D: [0, s, 0], T: [s / 2, s / 2, h], O: [s / 2, s / 2, 0] }; }
  if (shape === "limas3") { const [s, h] = d; return { A: [0, 0, 0], B: [s, 0, 0], C: [s / 2, (s * Math.sqrt(3)) / 2, 0], T: [s / 2, (s * Math.sqrt(3)) / 6, h], O: [s / 2, (s * Math.sqrt(3)) / 6, 0] }; }
  const [s, h] = d, pts: Record<string, V3> = {};
  "ABCDEF".split("").forEach((k, i) => { const a = (Math.PI / 3) * i - (2 * Math.PI) / 3; pts[k] = [s * Math.cos(a), s * Math.sin(a), 0]; });
  pts.T = [0, 0, h]; pts.O = [0, 0, 0]; return pts;
}
export const FACES: Record<Shape, string[]> = {
  kubus: ["ABCD", "EFGH", "ABFE", "DCGH", "ADHE", "BCGF"], balok: ["ABCD", "EFGH", "ABFE", "DCGH", "ADHE", "BCGF"],
  limas4: ["ABCD", "TAB", "TBC", "TCD", "TDA"], limas3: ["ABC", "TAB", "TBC", "TCA"], limas6: ["ABCDEF", "TAB", "TBC", "TCD", "TDE", "TEF", "TFA"],
};
/** Rusuk bangun dari daftar sisinya. */
export const edgesOf = (shape: Shape) => { const s = new Set<string>(); for (const f of FACES[shape]) for (let i = 0; i < f.length; i++) { const a = f[i], b = f[(i + 1) % f.length]; s.add([a, b].sort().join("")); } return [...s]; };

/* ---------- Gambar ---------- */
export type Scene =
  | { type: "solid"; shape: Shape; dims: number[]; extra?: Record<string, V3>; segs?: [string, string][]; plane?: string[]; caption?: string; names?: Record<string, string> }
  | { type: "graph"; nodes: Record<string, [number, number]>; edges: [string, string, string][]; caption?: string }
  | { type: "flat"; points: Record<string, [number, number]>; segs: [string, string, boolean?][]; right?: [string, string, string][]; caption?: string }
  | { type: "coords"; points: Record<string, [number, number]>; range: number; caption?: string };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "num"; label: string; value: number; unit?: string }
  | { kind: "surd"; label: string; p: number; q: number; r: number; unit?: string }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] };

export type PQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "surd" ? 3 : 1);
export const cells = (p: Part, v: string) => { if (fieldCount(p) === 1) return [v ?? ""]; const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
export const surdValue = (p: number, q: number, r: number) => (p * Math.sqrt(q)) / r;
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "surd": return [p.p, p.q, p.r].map(String);
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
      case "surd": return `${plain(p.label)} ${x[0]}√${x[1]} / ${x[2]}${p.unit ? ` ${p.unit}` : ""}`;
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
const sr = (label: string, p: number, qq: number, r = 1, unit?: string): Part => ({ kind: "surd", label, p, q: qq, r, unit });
const ch = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const solid = (shape: Shape, dims: number[], more: Partial<Extract<Scene, { type: "solid" }>> = {}): Scene => ({ type: "solid", shape, dims, ...more });

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Jarak Antartitik", sections: [
    { title: "Pengertian jarak dua titik dan rumus koordinat", lab: "rute",
      steps: [
        "Bayangkan dua rumah di peta. Ada banyak jalan yang bisa ditempuh dari rumah pertama ke rumah kedua, tetapi jarak kedua rumah adalah panjang lintasan yang paling pendek, yaitu ruas garis lurus yang menghubungkannya.",
        "Dalam geometri: jarak titik A ke titik B adalah panjang ruas garis AB. Jarak tidak pernah negatif, dan jarak titik ke dirinya sendiri adalah 0.",
        "Jarak dua bangun G₁ dan G₂ adalah panjang ruas garis terpendek di antara semua ruas garis yang menghubungkan titik-titik pada G₁ dengan titik-titik pada G₂.",
        "Jika kedua titik diketahui koordinatnya, A(x₁, y₁) dan B(x₂, y₂), buat segitiga siku-siku dengan sisi mendatar |x₂ − x₁| dan sisi tegak |y₂ − y₁|.",
        "Dengan Teorema Pythagoras: AB = √{(x₂ − x₁)^{2} + (y₂ − y₁)^{2}}.",
        "Di ruang tiga dimensi, tambahkan selisih ketiga: AB = √{(x₂ − x₁)^{2} + (y₂ − y₁)^{2} + (z₂ − z₁)^{2}}.",
        "Hasil berupa akar disederhanakan, misalnya √{45} = √{9 × 5} = 3√{5}.",
      ],
      life: "Radar di bandara menampilkan pesawat sebagai titik di layar. Jika pusat radar dianggap titik (0, 0) dan sebuah pesawat terlihat di titik (30, 40) dalam kilometer, petugas tidak perlu mengukur dengan penggaris. Selisih mendatar 30 dan selisih tegak 40 membentuk segitiga siku-siku, sehingga jarak pesawat = √{30^{2} + 40^{2}} = 50 km. Cara berpikir yang sama dipakai aplikasi ojek saat menghitung jarak lurus dari titikmu ke pengemudi terdekat.",
      example: "Jarak antarkota pada peta jalan: A–B 15 km, B–C 20 km, A–D 18 km, D–C 22 km, D–B 16 km, dan ada jalan lurus A–C 26 km. Rute mana yang terpendek dari A ke C, dan berapa jarak A ke C?",
      work: [
        "Daftar rute tanpa melewati kota yang sama dua kali: A–C (26), A–B–C (35), A–D–C (40), A–B–D–C (53), A–D–B–C (54).",
        "Rute terpendek adalah jalan lurus A–C sepanjang 26 km.",
        "Jadi jarak A ke C adalah 26 km. Rute lain lebih panjang karena berbelok.",
        "Ini sesuai pengertian jarak: panjang lintasan terpendek antara dua titik.",
      ],
      notes: [
        "Jarak adalah panjang terpendek, bukan sembarang lintasan.",
        "Urutan titik pada rumus koordinat boleh ditukar, karena selisihnya dikuadratkan.",
        "Selalu sederhanakan akar dan tuliskan satuannya.",
      ],
      demo: "Ketuk kota satu per satu untuk menyusun rute dari A ke C. Peraga menjumlahkan panjangnya, dan kamu bisa membandingkan semua rute yang mungkin.",
    },
    { title: "Jarak antartitik pada kubus, balok, dan limas", lab: "kubus",
      steps: [
        "Kubus ABCD.EFGH bernama urut: alas ABCD, tutup EFGH, dengan E tepat di atas A, F di atas B, dan seterusnya.",
        "Jarak dua titik yang dihubungkan rusuk sama dengan panjang rusuk, misalnya AB = a.",
        "Diagonal sisi menghubungkan dua titik sudut pada satu sisi yang tidak bersebelahan, misalnya AC. Dengan Pythagoras pada segitiga ABC: AC = √{a^{2} + a^{2}} = a√{2}.",
        "Diagonal ruang menghubungkan dua titik sudut yang berseberangan di dalam kubus, misalnya AG. Segitiga ACG siku-siku di C, jadi AG = √{(a√{2})^{2} + a^{2}} = a√{3}.",
        "Pada balok p × l × t: diagonal alas √{p^{2} + l^{2}} dan diagonal ruang √{p^{2} + l^{2} + t^{2}}.",
        "Untuk titik tengah atau titik di dalam bangun, carilah segitiga siku-siku yang memuat kedua titik itu, lalu pakai Pythagoras sekali atau dua kali.",
        "Pada limas beraturan T.ABCD, tinggi TO tegak lurus alas di titik potong diagonal O, sehingga TA² = TO² + OA².",
      ],
      life: "Sebuah kamar berbentuk kubus 4 m × 4 m × 4 m. Lampu dipasang tepat di tengah langit-langit. Seorang tukang ingin tahu panjang kabel lurus dari lampu ke salah satu sudut lantai. Dari titik lampu T ke sudut atas E jaraknya setengah diagonal langit-langit, yaitu 2√{2} m. Garis dari E turun ke sudut lantai A tegak lurus, sehingga segitiga AET siku-siku: AT = √{4^{2} + (2√{2})^{2}} = √{24} = 2√{6} ≈ 4,9 m. Dengan memecah ruang menjadi segitiga siku-siku, ukuran yang tidak bisa diukur langsung menjadi mudah dihitung.",
      example: "Kotak kardus berbentuk balok dengan panjang 8 cm, lebar 6 cm, dan tinggi 24 cm. Berapa panjang sedotan terpanjang yang bisa masuk lurus ke dalamnya?",
      work: [
        "Sedotan terpanjang membentang dari satu sudut ke sudut berseberangan: diagonal ruang AG.",
        "Diagonal alas AC = √{8^{2} + 6^{2}} = √{100} = 10 cm.",
        "Segitiga ACG siku-siku di C, jadi AG = √{10^{2} + 24^{2}} = √{676} = 26 cm.",
        "Sedotan sepanjang 26 cm masih bisa masuk lurus.",
      ],
      notes: [
        "Gambarlah segitiga bantunya terpisah supaya sisi siku-sikunya terlihat jelas.",
        "Rusuk tegak (AE, BF, CG, DH) tegak lurus semua garis pada alas, termasuk diagonal alas.",
        "Kubus: diagonal sisi a√{2}, diagonal ruang a√{3}. Hafalkan, tetapi pahami asalnya.",
      ],
      demo: "Pilih dua titik pada kubus. Peraga menunjukkan ruas garisnya, jenisnya (rusuk, diagonal sisi, atau diagonal ruang), dan langkah Pythagoras. Seret gambar untuk memutar kubus.",
    },
  ] },
  { code: "B", title: "Jarak Titik ke Garis", sections: [
    { title: "Pengertian jarak titik ke garis", lab: "tali",
      steps: [
        "Tiga paku ditancapkan di papan sebagai titik A, B, dan C. Seutas tali diikat dari paku A ke paku B. Berapa tali terpendek dari paku C sampai menyentuh tali AB?",
        "Dari C ke tali AB ada banyak kemungkinan, tetapi yang terpendek selalu yang tegak lurus terhadap AB. Titik sentuhnya disebut proyeksi C pada garis AB.",
        "Jarak titik ke garis adalah panjang ruas garis dari titik itu ke proyeksinya pada garis, yaitu ruas garis yang tegak lurus garis tersebut.",
        "Jika titik terletak pada garis, jaraknya 0.",
        "Pada segitiga siku-siku ABC (siku-siku di C) dengan sisi siku-siku a dan b serta sisi miring c, garis tinggi d dari C ke AB memenuhi {1/2}ab = {1/2}cd, sehingga d = {ab/c}.",
        "Cara lain: bagi segitiga menjadi dua segitiga siku-siku dengan kaki tegak lurus di titik proyeksi, lalu pakai Pythagoras pada keduanya.",
        "Panjang potongan AD dari A ke kaki garis tinggi juga bisa dicari: AD = {AC^{2}/AB}.",
      ],
      life: "Seorang petani ingin memasang pipa dari sumur C ke saluran air lurus AB di tepi sawah. Agar pipa sesingkat mungkin dan biayanya hemat, pipa dipasang tegak lurus saluran. Jika sumur berjarak 15 m dari ujung A dan 20 m dari ujung B, dan sudut di sumur siku-siku, saluran AB panjangnya 25 m. Pipa terpendeknya {15 × 20/25} = 12 m. Pipa yang miring ke titik lain pasti lebih panjang dari 12 m.",
      example: "Paku A, B, C membentuk segitiga siku-siku di C dengan AC = 6 cm, BC = 8 cm, dan AB = 10 cm. Tentukan panjang tali terpendek dari C ke tali AB.",
      work: [
        "Tali terpendek tegak lurus AB, misalnya di titik D. Panjangnya CD = d.",
        "Luas segitiga dari dua sisi siku-siku: {1/2} × 6 × 8 = 24 cm².",
        "Luas yang sama dengan alas AB: {1/2} × 10 × d = 5d.",
        "5d = 24, jadi d = 4,8 cm.",
      ],
      notes: [
        "Ciri jarak titik ke garis: ada sudut siku-siku di titik proyeksi.",
        "Dalam soal, proyeksi tidak selalu jatuh di tengah garis.",
        "Rumus d = {ab/c} hanya berlaku untuk garis tinggi pada segitiga siku-siku.",
      ],
      demo: "Geser titik P di sepanjang tali AB. Panjang CP berubah, dan nilainya paling kecil tepat saat CP tegak lurus AB.",
    },
    { title: "Jarak titik ke garis pada bangun ruang", lab: "garis",
      steps: [
        "Pada kubus ABCD.EFGH, jarak titik E ke garis AB adalah EA, karena EA tegak lurus AB. Jarak C ke garis AB adalah CB.",
        "Jika ruas tegak lurusnya tidak langsung terlihat, buat bidang segitiga yang memuat titik dan garis itu, lalu cari garis tinggi segitiga tersebut.",
        "Contoh: jarak A ke diagonal sisi EB pada kubus berusuk 2. Segitiga ABE siku-siku sama kaki, jadi garis tinggi dari A jatuh di tengah EB: AI = √{AB^{2} − BI^{2}} = √{4 − 2} = √{2}.",
        "Jarak titik ke diagonal ruang, misalnya H ke DF: segitiga DHF siku-siku di H dengan DH = a, HF = a√{2}, DF = a√{3}. Jadi jaraknya {a × a√{2}/(a√{3})} = {a√{6}/3}.",
        "Pada limas, jarak titik sudut alas ke rusuk tegak dicari dari segitiga sisi atau segitiga diagonal, sering dengan rumus luas: jarak = {2 × luas/alas}.",
        "Jarak titik ke garis yang sejajar alas sering bisa dihitung dari proyeksi titik itu ke alas lebih dulu, lalu Pythagoras dengan tingginya.",
        "Periksa selalu: ruas yang kamu hitung harus tegak lurus garisnya.",
      ],
      life: "Di sebuah aula berbentuk balok, panitia memasang tali lampu hias lurus dari satu sudut atap ke sudut atap seberangnya. Mereka ingin menggantung lampu sorot dari titik di lantai agar tepat menyinari tali itu dengan kabel terpendek. Kabel terpendek adalah kabel yang tegak lurus tali lampu. Panitia cukup membayangkan segitiga yang dibentuk titik lantai dan kedua ujung tali, lalu mencari garis tingginya.",
      example: "Kubus ABCD.EFGH berusuk 6 cm. Tentukan jarak titik A ke garis BE.",
      work: [
        "Segitiga ABE siku-siku di A dengan AB = AE = 6 dan BE = 6√{2}.",
        "Karena AB = AE, kaki garis tinggi I jatuh di tengah BE, jadi BI = 3√{2}.",
        "AI = √{AB^{2} − BI^{2}} = √{36 − 18} = √{18} = 3√{2} cm.",
        "Cek dengan rumus luas: {6 × 6/(6√{2})} = {6/√{2}} = 3√{2}.",
      ],
      notes: [
        "Rusuk tegak kubus tegak lurus semua garis di alas, termasuk diagonal alas.",
        "Jarak titik ke rusuk sejajar sering sama dengan panjang rusuk lain.",
        "Untuk segitiga sama kaki, garis tinggi dari puncak jatuh di tengah alas.",
      ],
      demo: "Pilih titik dan garis pada kubus. Peraga menggambar ruas tegak lurusnya, menunjukkan titik kakinya, dan menghitung panjangnya.",
    },
  ] },
  { code: "C", title: "Jarak Titik ke Bidang", sections: [
    { title: "Pengertian jarak titik ke bidang", lab: "proyeksi",
      steps: [
        "Bayangkan bola lampu tergantung di atas lantai. Tali yang paling pendek dari bola lampu ke lantai adalah tali yang jatuh tegak lurus, tepat di bawah lampu.",
        "Titik di lantai yang tepat di bawah lampu disebut proyeksi titik pada bidang. Jarak titik ke bidang adalah panjang ruas garis dari titik ke proyeksinya.",
        "Garis tegak lurus bidang berarti tegak lurus terhadap semua garis pada bidang yang melalui titik tembusnya. Cukup ditunjukkan tegak lurus pada dua garis berpotongan di bidang itu.",
        "Jarak ke titik lain di bidang selalu lebih panjang, karena membentuk sisi miring segitiga siku-siku.",
        "Pada kubus, jarak titik B ke bidang DCGH adalah BC, karena BC tegak lurus bidang itu. Jarak titik C ke bidang ADHE adalah CD.",
        "Tiang penyangga atap paling hemat jika dipasang tegak lurus bidang atap.",
        "Jika titik terletak pada bidang, jaraknya 0. Jika titik dan bidang sejajar sebuah garis, jarak semua titik pada garis itu ke bidang sama.",
      ],
      life: "Seorang tukang memasang kayu penyangga dari dinding rumah ke atap teras yang miring. Kayu bisa dipasang dengan berbagai sudut, tetapi yang paling pendek dan paling kokoh adalah kayu yang tegak lurus permukaan atap. Begitu juga drone yang melayang 12 m di atas lapangan: jaraknya ke lapangan 12 m, walaupun jaraknya ke gawang yang berjarak 5 m dari titik di bawahnya adalah √{12^{2} + 5^{2}} = 13 m.",
      example: "Lampu P digantung 3 m di atas lantai, tepat di atas titik Q. Titik R di lantai berjarak 4 m dari Q. Berapa jarak lampu ke lantai dan berapa jarak lampu ke R?",
      work: [
        "Jarak lampu ke lantai adalah panjang PQ yang tegak lurus lantai: 3 m.",
        "PQ tegak lurus semua garis di lantai melalui Q, termasuk QR, jadi segitiga PQR siku-siku di Q.",
        "PR = √{3^{2} + 4^{2}} = 5 m.",
        "PR lebih panjang dari PQ, sesuai bahwa jarak ke bidang adalah yang terpendek.",
      ],
      notes: [
        "Jarak titik ke bidang bukan jarak ke sembarang titik di bidang.",
        "Proyeksi puncak limas beraturan pada alasnya adalah titik pusat alas.",
        "Tinggi limas segitiga beraturan: pusat alas berjarak {s√{3}/3} dari setiap titik sudut alas.",
      ],
      demo: "Geser titik Q di lantai. Panjang PQ paling kecil saat Q tepat di bawah P, dan saat itu PQ tegak lurus lantai.",
    },
    { title: "Jarak titik ke bidang pada kubus dan limas", lab: "bidang",
      steps: [
        "Langkah umum: (1) tentukan bidangnya, (2) cari garis dari titik yang tegak lurus dua garis pada bidang itu, (3) hitung panjangnya dengan Pythagoras atau rumus luas.",
        "Kubus berusuk a, jarak titik B ke bidang diagonal AFGD: proyeksi B jatuh di tengah AF, jadi jaraknya setengah diagonal sisi, {a√{2}/2}.",
        "Jarak titik C ke bidang BDG: bidang BDG memotong diagonal ruang CE tegak lurus. Jaraknya {a√{3}/3}, sepertiga diagonal ruang.",
        "Pada limas T.ABCD dengan alas persegi bersisi s dan tinggi TO = t, jarak O ke bidang TBC dicari pada segitiga TOP siku-siku di O, dengan P titik tengah BC dan OP = {s/2}.",
        "Jarak O ke bidang TBC = jarak O ke garis TP = {OP × TO/TP}, rumus garis tinggi yang sama dengan d = {ab/c}.",
        "Tinggi limas beraturan adalah jarak puncak ke bidang alas: t = √{TA^{2} − OA^{2}}.",
        "Jika rusuk kubus tidak diketahui langsung, cari dulu dari luas permukaan (6a²) atau volumenya (a³).",
      ],
      life: "Seorang arsitek merancang atap limas untuk gazebo dengan alas persegi 6 m dan tinggi 4 m. Ia ingin memasang lampu di pusat lantai dan mengetahui jarak terpendek lampu ke salah satu sisi atap untuk menempatkan kabel. Bayangkan penampang melintang: lampu O, puncak T, dan titik tengah tepi atap P membentuk segitiga siku-siku dengan OP = 3 m dan TO = 4 m, sehingga TP = 5 m. Jarak lampu ke bidang atap = {3 × 4/5} = 2,4 m. Penampang yang tepat mengubah soal ruang menjadi soal segitiga.",
      example: "Kubus ABCD.EFGH berusuk 4 cm. Tentukan jarak titik B ke bidang AFGD.",
      work: [
        "Bidang AFGD memuat diagonal sisi AF dan rusuk FG. Garis BT dengan T titik tengah AF tegak lurus AF.",
        "BT juga tegak lurus FG, karena FG tegak lurus seluruh sisi ABFE. Jadi BT tegak lurus bidang AFGD.",
        "AF = 4√{2}, AT = 2√{2}. Segitiga ATB siku-siku di T: BT = √{4^{2} − (2√{2})^{2}} = √{8} = 2√{2} cm.",
        "Jadi jarak B ke bidang AFGD adalah 2√{2} cm.",
      ],
      notes: [
        "Buat penampang (irisan) yang memuat titik dan tegak lurus bidangnya.",
        "Bidang diagonal kubus: jarak titik sudut ke bidang itu sering setengah diagonal sisi.",
        "Hasil akhir sebaiknya dicek ulang dengan rumus luas segitiga.",
      ],
      demo: "Pilih pasangan titik dan bidang pada kubus. Peraga mewarnai bidangnya, menggambar ruas tegak lurus, dan menghitung jaraknya. Ubah rusuk untuk melihat polanya.",
    },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: `${t.code}.${j + 1}`, topic: t })));

/* ---------- Data peraga ---------- */
export const routeNet = { nodes: { A: [20, 150], B: [150, 170], C: [210, 30], D: [30, 30] } as Record<string, [number, number]>, edges: [["A", "B", 15], ["B", "C", 20], ["A", "D", 18], ["D", "C", 22], ["D", "B", 16], ["A", "C", 26]] as [string, string, number][] };
export const lineChoices = ["BE", "AC", "BD", "EG", "DF", "CG", "BG"];
export const planePresets: { name: string; point: string; plane: string }[] = [
  { name: "B ke bidang AFGD", point: "B", plane: "AFGD" },
  { name: "C ke bidang BDG", point: "C", plane: "BDG" },
  { name: "E ke bidang BDG", point: "E", plane: "BDG" },
  { name: "B ke bidang ACH", point: "B", plane: "ACH" },
];

/* ---------- Latihan (4 per bagian) ---------- */
const net = (edges: [string, string, number][]): Scene => ({ type: "graph", nodes: { A: [20, 150], B: [150, 170], C: [210, 30], D: [30, 30] }, edges: edges.map(([a, b, l]) => [a, b, `${l} km`]) });
export const practice: PQuestion[][] = [
  [
    q(0, "Jarak antarkota: A–B 12 km, B–C 14 km, A–D 15 km, D–C 17 km, D–B 13 km, dan jalan lurus A–C 21 km. Nasyitha berangkat dari A ke C.",
      [ch("Rute terpendek:", ["A–B–C", "A–C", "A–D–C"], "A–C"), n("Jarak A ke C =", 21, "km"), n("Panjang rute A–D–B–C =", 42, "km")],
      "Rute A–C 21 km, A–B–C 26 km, A–D–C 32 km. Jarak A ke C adalah lintasan terpendek, 21 km. A–D–B–C = 15 + 13 + 14 = 42 km.",
      { scene: net([["A", "B", 12], ["B", "C", 14], ["A", "D", 15], ["D", "C", 17], ["D", "B", 13], ["A", "C", 21]]) }),
    q(0, "Hitung jarak titik A(1, 2) ke titik B(7, 10).",
      [n("AB =", 10)],
      "AB = √{(7 − 1)^{2} + (10 − 2)^{2}} = √{36 + 64} = √{100} = 10.", { scene: { type: "coords", points: { A: [1, 2], B: [7, 10] }, range: 11 } }),
    q(0, "Hitung jarak titik P(−3, 1) ke titik Q(2, 13).",
      [n("PQ =", 13)],
      "PQ = √{5^{2} + 12^{2}} = √{169} = 13."),
    q(0, "Pusat radar di titik (0, 0). Sebuah kapal terdeteksi di titik (6, −3) dalam kilometer. Tulis jaraknya dalam bentuk {p√{q}/r}.",
      [sr("Jarak =", 3, 5, 1, "km")],
      "√{6^{2} + (−3)^{2}} = √{45} = √{9 × 5} = 3√{5} km.", { scene: { type: "coords", points: { O: [0, 0], K: [6, -3] }, range: 7 } }),
  ],
  [
    q(1, "Kubus ABCD.EFGH berusuk 5 cm.",
      [ch("Ruas garis yang merupakan jarak titik B dan D:", ["BH", "BC", "BD"], "BD"), sr("Panjangnya =", 5, 2, 1, "cm")],
      "Jarak B dan D adalah panjang ruas BD, diagonal sisi alas: √{5^{2} + 5^{2}} = 5√{2} cm.", { scene: solid("kubus", [5]) }),
    q(1, "Kubus ABCD.EFGH berusuk 6 cm. Hitung panjang diagonal ruang AG.",
      [sr("AG =", 6, 3, 1, "cm")],
      "AC = 6√{2}, lalu AG = √{(6√{2})^{2} + 6^{2}} = √{108} = 6√{3} cm.", { scene: solid("kubus", [6], { segs: [["A", "G"]] }) }),
    q(1, "Sebuah kamar berbentuk kubus 6 m × 6 m × 6 m. Lampu T dipasang di tengah langit-langit. Hitung jarak lampu ke sudut lantai A.",
      [sr("ET =", 3, 2, 1, "m"), sr("AT =", 3, 6, 1, "m")],
      "ET = {1/2}EG = {1/2} × 6√{2} = 3√{2}. Segitiga AET siku-siku di E: AT = √{36 + 18} = √{54} = 3√{6} m.",
      { scene: solid("kubus", [6], { extra: { T: [3, 3, 6] }, segs: [["A", "T"], ["E", "T"]] }) }),
    q(1, "Kotak berbentuk balok ABCD.EFGH dengan AB = 8 cm, BC = 6 cm, dan AE = 24 cm.",
      [n("AC =", 10, "cm"), n("AG =", 26, "cm")],
      "AC = √{64 + 36} = 10 cm. AG = √{10^{2} + 24^{2}} = 26 cm.", { scene: solid("balok", [8, 6, 24], { segs: [["A", "C"], ["A", "G"]] }) }),
  ],
  [
    q(2, "Paku A, B, C membentuk segitiga siku-siku di C dengan AC = 6 cm, BC = 8 cm, dan AB = 10 cm. Tentukan panjang tali terpendek dari C ke tali AB.",
      [n("Panjang tali terpendek =", 4.8, "cm")],
      "d = {AC × BC/AB} = {6 × 8/10} = 4,8 cm.", { scene: { type: "flat", points: { A: [0, 6], B: [8, 0], C: [0, 0], D: [2.88, 3.84] }, segs: [["A", "B"], ["B", "C"], ["C", "A"], ["C", "D", true]], right: [["C", "A", "B"], ["D", "C", "B"]] } }),
    q(2, "Tentukan benar atau salah setiap pernyataan tentang jarak titik ke garis.",
      [tf(["Jarak titik ke garis diukur sepanjang ruas yang tegak lurus garis itu.", true], ["Jarak titik ke garis adalah ruas terpendek dari titik itu ke garis.", true], ["Jika titik terletak pada garis, jaraknya 0.", true], ["Pada segitiga siku-siku di C, jarak C ke AB sama dengan panjang CA.", false])],
      "CA hanya salah satu ruas dari C ke garis AB, dan tidak tegak lurus AB. Jarak C ke AB adalah garis tinggi {ab/c}, yang lebih pendek dari CA."),
    q(2, "Segitiga PQR siku-siku di R dengan PR = 5 cm, QR = 12 cm. Hitung jarak titik R ke garis PQ.",
      [n("Jarak =", 60 / 13, "cm")],
      "PQ = √{25 + 144} = 13. Jarak = {5 × 12/13} = {60/13} ≈ 4,6 cm."),
    q(2, "Pada kubus ABCD.EFGH, ruas garis manakah yang merupakan jarak titik C ke garis AB?",
      [ch("Ruas garis:", ["BC", "AC", "CG"], "BC")],
      "BC tegak lurus AB dan memotongnya di B, jadi jarak C ke garis AB adalah BC.", { scene: solid("kubus", [4], { segs: [["A", "B"]] }) }),
  ],
  [
    q(3, "Kubus ABCD.EFGH berusuk 6 cm. Tentukan jarak titik A ke diagonal sisi BE.",
      [sr("Jarak =", 3, 2, 1, "cm")],
      "Segitiga ABE siku-siku sama kaki, kaki garis tinggi di tengah BE: √{36 − 18} = 3√{2} cm.", { scene: solid("kubus", [6], { segs: [["B", "E"]] }) }),
    q(3, "Kubus ABCD.EFGH berusuk 10 cm. Tentukan jarak titik H ke garis DF.",
      [sr("Jarak =", 10, 6, 3, "cm")],
      "Segitiga DHF siku-siku di H: DH = 10, HF = 10√{2}, DF = 10√{3}. Jarak = {10 × 10√{2}/(10√{3})} = {10√{6}/3} cm.", { scene: solid("kubus", [10], { segs: [["D", "F"]] }) }),
    q(3, "Kubus ABCD.EFGH berusuk 8 cm. Titik M adalah titik tengah BC. Tentukan jarak M ke garis EG.",
      [sr("Jarak =", 6, 2, 1, "cm")],
      "Proyeksi M ke bidang atas adalah titik tengah FG, berjarak {1/2} × 4√{2} = 2√{2} dari EG. Dengan tinggi 8: √{8^{2} + (2√{2})^{2}} = √{72} = 6√{2} cm.",
      { scene: solid("kubus", [8], { extra: { M: [8, 4, 0] }, segs: [["E", "G"]] }) }),
    q(3, "Limas beraturan T.ABCD mempunyai AB = 4 cm dan TA = 6 cm. Tentukan jarak titik B ke rusuk TD.",
      [sr("Jarak =", 4, 14, 3, "cm")],
      "Segitiga TBD: TB = TD = 6, BD = 4√{2}, tinggi dari T = √{36 − 8} = 2√{7}, luas = {1/2} × 4√{2} × 2√{7} = 4√{14}. Jarak B ke TD = {2 × 4√{14}/6} = {4√{14}/3} cm.",
      { scene: solid("limas4", [4, Math.sqrt(28)], { segs: [["T", "D"]] }) }),
  ],
  [
    q(4, "Tentukan benar atau salah setiap pernyataan tentang jarak titik ke bidang.",
      [tf(["Jarak titik ke bidang adalah panjang ruas garis dari titik ke proyeksinya pada bidang.", true], ["Garis yang tegak lurus bidang tegak lurus semua garis pada bidang yang melalui titik tembusnya.", true], ["Jarak titik ke bidang sama dengan jarak titik itu ke sembarang titik pada bidang.", false], ["Jika titik terletak pada bidang, jaraknya 0.", true])],
      "Jarak ke titik lain pada bidang adalah sisi miring segitiga siku-siku, jadi selalu lebih panjang dari jarak ke proyeksinya."),
    q(4, "Pada balok KLMN.OPQR, ruas garis manakah yang merupakan jarak titik L ke bidang KNRO?",
      [ch("Ruas garis:", ["LM", "LP", "KL"], "KL")],
      "KL tegak lurus bidang KNRO (tegak lurus KN dan KO), jadi jaraknya KL.",
      { scene: solid("balok", [7, 4, 3], { names: { A: "K", B: "L", C: "M", D: "N", E: "O", F: "P", G: "Q", H: "R" }, plane: ["A", "D", "H", "E"] }) }),
    q(4, "Lampu P berada 3 m di atas titik Q di lantai. Titik S di lantai berjarak √{5} m dari Q.",
      [n("Jarak lampu ke lantai =", 3, "m"), sr("Jarak lampu ke S =", 1, 14, 1, "m")],
      "Jarak ke lantai adalah PQ = 3 m. PQ ⊥ QS, jadi PS = √{9 + 5} = √{14} m."),
    q(4, "Limas segitiga beraturan T.ABC mempunyai AB = 6 cm dan TA = 5 cm. Tentukan jarak titik T ke bidang ABC.",
      [sr("Jarak =", 1, 13, 1, "cm")],
      "Proyeksi T adalah pusat alas O dengan OA = {6√{3}/3} = 2√{3}. TO = √{25 − 12} = √{13} cm.", { scene: solid("limas3", [6, Math.sqrt(13)], { segs: [["T", "O"]] }) }),
  ],
  [
    q(5, "Kubus ABCD.EFGH berusuk 6 cm. Tentukan jarak titik B ke bidang AFGD.",
      [sr("Jarak =", 3, 2, 1, "cm")],
      "Proyeksi B di tengah AF, jadi jaraknya setengah diagonal sisi: {1/2} × 6√{2} = 3√{2} cm.", { scene: solid("kubus", [6], { plane: ["A", "F", "G", "D"] }) }),
    q(5, "Luas permukaan kubus ABCD.EFGH adalah 216 cm².",
      [n("Jarak titik F ke bidang ADHE =", 6, "cm"), sr("Jarak titik B ke bidang ACH =", 2, 3, 1, "cm")],
      "6a² = 216, jadi a = 6. F ke ADHE adalah rusuk FE = 6. Bidang ACH tegak lurus diagonal ruang DF, dan titik B sama jauhnya dengan titik D dari bidang itu, yaitu sepertiga DF: {a√{3}/3} = 2√{3} cm.", { scene: solid("kubus", [6], { plane: ["A", "C", "H"] }) }),
    q(5, "Limas T.ABCD beralas persegi dengan AB = 10 cm dan tinggi TO = 12 cm. Tentukan jarak titik O ke bidang TBC.",
      [n("Jarak =", 60 / 13, "cm")],
      "OP = 5 (P tengah BC), TP = √{25 + 144} = 13. Jarak = {OP × TO/TP} = {5 × 12/13} = {60/13} cm.", { scene: solid("limas4", [10, 12], { plane: ["T", "B", "C"] }) }),
    q(5, "Kubus ABCD.EFGH berusuk 12 cm. Tentukan jarak titik C ke bidang BDG.",
      [sr("Jarak =", 4, 3, 1, "cm")],
      "Jarak C ke bidang BDG = {a√{3}/3} = {12√{3}/3} = 4√{3} cm.", { scene: solid("kubus", [12], { plane: ["B", "D", "G"] }) }),
  ],
];

/* ---------- Evaluasi 24 soal ---------- */
const S = "Sedang", Mn = "Menantang", SM = "Sangat menantang";
const lvl = (level: Level, x: PQuestion): PQuestion => ({ ...x, level });
export const cityNet = { A: [20, 30], B: [190, 30], C: [90, 75], D: [220, 140], E: [40, 175] } as Record<string, [number, number]>;
export const cityEdges: [string, string, number][] = [["A", "B", 30], ["A", "C", 15], ["C", "B", 18], ["B", "D", 21], ["C", "D", 27], ["A", "E", 35], ["C", "E", 24], ["E", "D", 26]];
const balokNames = { A: "K", B: "L", C: "M", D: "N", E: "O", F: "P", G: "Q", H: "R" };
export const assessment: PQuestion[] = [
  lvl(S, q(0, "Gambar menunjukkan titik-titik yang dihubungkan jalan beserta panjangnya. Tentukan jarak dari titik A ke titik D, yaitu lintasan terpendeknya.",
    [ch("Lintasan terpendek:", ["A–C–D", "A–B–D", "A–E–D"], "A–C–D"), n("Jarak A ke D =", 42, "m")],
    "A–C–D = 15 + 27 = 42, A–B–D = 51, A–E–D = 61, A–C–B–D = 54. Lintasan terpendek A–C–D, jadi jaraknya 42 m.",
    { scene: { type: "graph", nodes: cityNet, edges: cityEdges.map(([a, b, l]) => [a, b, `${l} m`]) } })),
  lvl(S, q(2, "Segitiga ABC siku-siku di C dengan AC = 8 cm dan BC = 15 cm. Hitung jarak titik C ke garis AB.",
    [n("Jarak =", 120 / 17, "cm")],
    "AB = √{64 + 225} = 17. Jarak = {8 × 15/17} = {120/17} ≈ 7,06 cm.")),
  lvl(S, q(4, "Pada kubus ABCD.EFGH, tentukan ruas garis yang merupakan jarak setiap titik ke bidang.",
    [{ kind: "classify", options: ["BC", "CD", "HE", "CG"], rows: [{ text: "Titik B ke bidang DCGH", answer: "BC" }, { text: "Titik C ke bidang ADHE", answer: "CD" }, { text: "Titik H ke bidang ABFE", answer: "HE" }, { text: "Titik C ke bidang EFGH", answer: "CG" }] }],
    "Setiap ruas yang dipilih tegak lurus bidangnya: BC ⊥ DCGH, CD ⊥ ADHE, HE ⊥ ABFE, CG ⊥ EFGH.",
    { scene: solid("kubus", [4]) })),
  lvl(S, q(1, "Kubus ABCD.EFGH berusuk 7 cm.",
    [sr("Diagonal sisi AC =", 7, 2, 1, "cm"), sr("Diagonal ruang AG =", 7, 3, 1, "cm")],
    "AC = √{49 + 49} = 7√{2}. AG = √{98 + 49} = 7√{3}.", { scene: solid("kubus", [7], { segs: [["A", "C"], ["A", "G"]] }) })),
  lvl(S, q(3, "Kubus ABCD.EFGH berusuk 4 cm. Tentukan jarak titik A ke garis CG.",
    [sr("Jarak =", 4, 2, 1, "cm")],
    "CG tegak lurus alas, jadi tegak lurus AC. Jarak A ke CG adalah AC = 4√{2} cm.", { scene: solid("kubus", [4], { segs: [["C", "G"]] }) })),
  lvl(S, q(5, "Kubus ABCD.EFGH berusuk 8 cm.",
    [n("Jarak titik F ke bidang ADHE =", 8, "cm"), sr("Jarak titik B ke bidang AFGD =", 4, 2, 1, "cm")],
    "F ke ADHE sama dengan rusuk FE = 8. B ke AFGD = setengah diagonal sisi = {1/2} × 8√{2} = 4√{2} cm.", { scene: solid("kubus", [8], { plane: ["A", "F", "G", "D"] }) })),
  lvl(S, q(0, "Hitung jarak titik A(−4, 7) ke titik B(4, −8).",
    [n("AB =", 17)],
    "AB = √{8^{2} + 15^{2}} = √{289} = 17.", { scene: { type: "coords", points: { A: [-4, 7], B: [4, -8] }, range: 9 } })),
  lvl(S, q(2, "Pada gambar, titik P dihubungkan ke tiga titik pada garis g. Ruas manakah yang merupakan jarak titik P ke garis g?",
    [ch("Ruas garis:", ["PP₂", "PP₁", "PP₃"], "PP₁")],
    "PP₁ tegak lurus garis g (ada tanda siku-siku), jadi PP₁ adalah jarak P ke g. Ruas lainnya miring dan lebih panjang.",
    { scene: { type: "flat", points: { P: [0, 5], "P₁": [0, 0], "P₂": [-4, 0], "P₃": [2.5, 0], g: [5, 0] }, segs: [["P₂", "g"], ["P", "P₁"], ["P", "P₂"], ["P", "P₃"]], right: [["P₁", "P", "g"]] } })),
  lvl(Mn, q(4, "Limas segitiga beraturan T.ABC mempunyai AB = 12 cm dan TA = 10 cm. Tentukan jarak titik T ke bidang ABC.",
    [sr("Jarak =", 2, 13, 1, "cm")],
    "OA = {12√{3}/3} = 4√{3}, jadi TO = √{100 − 48} = √{52} = 2√{13} cm.", { scene: solid("limas3", [12, Math.sqrt(52)], { segs: [["T", "O"]] }) })),
  lvl(Mn, q(1, "Kamar berbentuk balok dengan panjang 6 m, lebar 4 m, dan tinggi 3 m. Lampu T dipasang di tengah langit-langit. Hitung jarak lampu ke salah satu sudut lantai.",
    [sr("Jarak =", 1, 22, 1, "m")],
    "Dari tengah langit-langit ke sudut atas: √{3^{2} + 2^{2}} = √{13}. Turun ke lantai 3 m: √{13 + 9} = √{22} ≈ 4,7 m.",
    { scene: solid("balok", [6, 4, 3], { extra: { T: [3, 2, 3] }, segs: [["A", "T"]] }) })),
  lvl(Mn, q(3, "Limas beraturan T.ABCD mempunyai AB = TA = 8 cm. Titik P dan Q adalah titik tengah AB dan AD. Tentukan jarak titik T ke garis PQ.",
    [sr("Jarak =", 2, 10, 1, "cm")],
    "Tinggi TO = √{64 − 32} = 4√{2}. Jarak O ke garis PQ = 2√{2}. Jarak T ke PQ = √{32 + 8} = √{40} = 2√{10} cm.",
    { scene: solid("limas4", [8, Math.sqrt(32)], { extra: { P: [4, 0, 0], Q: [0, 4, 0] }, segs: [["P", "Q"]] }) })),
  lvl(Mn, q(5, "Limas T.ABCD beralas persegi dengan AB = 6 cm dan tinggi TO = 4 cm. Tentukan jarak titik O ke bidang TBC.",
    [n("Jarak =", 12 / 5, "cm")],
    "OP = 3, TP = √{9 + 16} = 5. Jarak = {3 × 4/5} = {12/5} = 2,4 cm.", { scene: solid("limas4", [6, 4], { plane: ["T", "B", "C"] }) })),
  lvl(Mn, q(0, "Peta menunjukkan jalan antarkota dengan panjangnya: A–B 9 km, B–C 12 km, A–D 10 km, D–C 11 km, D–B 7 km, dan A–C 15 km.",
    [n("Banyak rute A ke C tanpa melewati kota yang sama dua kali =", 5), n("Jarak A ke C =", 15, "km")],
    "Rutenya A–C, A–B–C, A–D–C, A–B–D–C, A–D–B–C (5 rute). Panjangnya 15, 21, 21, 27, 29 km. Jarak A ke C adalah yang terpendek, 15 km.",
    { scene: net([["A", "B", 9], ["B", "C", 12], ["A", "D", 10], ["D", "C", 11], ["D", "B", 7], ["A", "C", 15]]) })),
  lvl(Mn, q(3, "Kubus ABCD.EFGH berusuk 6 cm. Titik P adalah titik tengah EH. Tentukan jarak titik P ke garis CF.",
    [sr("Jarak =", 9, 2, 2, "cm")],
    "PC = √{36 + 9 + 36} = 9. Panjang proyeksi PC pada arah CF = {9/√{2}}. Jarak = √{81 − 81/2} = {9/√{2}} = {9√{2}/2} cm.",
    { scene: solid("kubus", [6], { extra: { P: [0, 3, 6] }, segs: [["C", "F"]] }) })),
  lvl(Mn, q(4, "Sebuah drone melayang 12 m di atas titik Q di lapangan datar. Titik R di lapangan berjarak 5 m dari Q.",
    [n("Jarak drone ke lapangan =", 12, "m"), n("Jarak drone ke titik R =", 13, "m")],
    "Jarak ke lapangan diukur tegak lurus: 12 m. Segitiga drone–Q–R siku-siku di Q: √{144 + 25} = 13 m.")),
  lvl(Mn, q(1, "Limas segi enam beraturan T.ABCDEF mempunyai AB = 6 cm dan TA = 10 cm. Titik O adalah pusat alas (titik tengah BE). Tentukan jarak T ke O.",
    [n("TO =", 8, "cm")],
    "Pada segi enam beraturan, jarak pusat ke titik sudut sama dengan panjang sisi, jadi OA = 6. TO = √{100 − 36} = 8 cm.", { scene: solid("limas6", [6, 8], { segs: [["T", "O"]] }) })),
  lvl(Mn, q(2, "Pada balok KLMN.OPQR, tentukan ruas garis yang merupakan jarak titik ke garis.",
    [{ kind: "classify", options: ["RO", "ML", "NK", "RQ"], rows: [{ text: "Titik R ke garis OP", answer: "RO" }, { text: "Titik M ke garis KL", answer: "ML" }, { text: "Titik N ke garis KO", answer: "NK" }] }],
    "RO ⊥ OP, ML ⊥ KL, dan NK ⊥ KO, karena setiap pasangan adalah rusuk balok yang saling tegak lurus.",
    { scene: solid("balok", [7, 4, 3], { names: balokNames }) })),
  lvl(SM, q(5, "Kubus ABCD.EFGH berusuk 9 cm. Tentukan jarak titik F ke bidang BEG.",
    [sr("Jarak =", 3, 3, 1, "cm")],
    "Bidang BEG memotong diagonal ruang FD tegak lurus. Jarak F ke BEG = {a√{3}/3} = {9√{3}/3} = 3√{3} cm.", { scene: solid("kubus", [9], { plane: ["B", "E", "G"] }) })),
  lvl(SM, q(1, "Kubus ABCD.EFGH berusuk 4 cm. Titik P terletak pada perpanjangan AB sehingga PB = 2 × rusuk, dan titik Q pada perpanjangan FG sehingga QG = rusuk. Tentukan PQ.",
    [n("PQ =", 12, "cm")],
    "Ambil A sebagai (0, 0, 0): P = (12, 0, 0) dan Q = (4, 8, 4). PQ = √{8^{2} + 8^{2} + 4^{2}} = √{144} = 12 cm.",
    { scene: solid("kubus", [4], { extra: { P: [12, 0, 0], Q: [4, 8, 4] }, segs: [["B", "P"], ["G", "Q"], ["P", "Q"]] }) })),
  lvl(SM, q(3, "Kubus ABCD.EFGH berusuk 6 cm. Tentukan jarak titik H ke diagonal ruang DF.",
    [sr("Jarak =", 2, 6, 1, "cm")],
    "Segitiga DHF siku-siku di H: jarak = {DH × HF/DF} = {6 × 6√{2}/(6√{3})} = {6√{2}/√{3}} = 2√{6} cm.", { scene: solid("kubus", [6], { segs: [["D", "F"]] }) })),
  lvl(SM, q(5, "Balok ABCD.EFGH mempunyai AB = 8 cm, BC = 6 cm, dan EC = 5√{5} cm. Tentukan jarak titik B ke bidang ACE.",
    [n("Jarak =", 24 / 5, "cm")],
    "AC = 10, AE = √{125 − 100} = 5. Bidang ACE tegak lurus alas, jadi jarak B ke bidang ACE = jarak B ke garis AC = {8 × 6/10} = 4,8 cm.",
    { scene: solid("balok", [8, 6, 5], { plane: ["A", "C", "G", "E"] }) })),
  lvl(SM, q(0, "Di ruang, titik A(1, −2, 3) dan titik B(7, 1, −3). Hitung jarak A ke B.",
    [n("AB =", 9)],
    "AB = √{6^{2} + 3^{2} + (−6)^{2}} = √{36 + 9 + 36} = √{81} = 9.")),
  lvl(SM, q(2, "Paku A, B, C membentuk segitiga siku-siku di C dengan AC = 9 cm, BC = 12 cm, dan AB = 15 cm. Tali terpendek dari C menyentuh AB di titik D.",
    [n("CD =", 7.2, "cm"), n("AD =", 5.4, "cm")],
    "CD = {9 × 12/15} = 7,2 cm. Segitiga ACD siku-siku di D: AD = √{81 − 51,84} = √{29,16} = 5,4 cm, sama dengan {AC^{2}/AB} = {81/15}.",
    { scene: { type: "flat", points: { A: [0, 9], B: [12, 0], C: [0, 0], D: [4.32, 5.76] }, segs: [["A", "B"], ["B", "C"], ["C", "A"], ["C", "D", true]], right: [["C", "A", "B"], ["D", "C", "B"]] } })),
  lvl(SM, q(4, "Kubus ABCD.EFGH berusuk 9 cm. Titik S adalah proyeksi titik C pada bidang AFH. Tentukan jarak titik A ke titik S.",
    [sr("AS =", 3, 6, 1, "cm")],
    "Proyeksi C pada bidang AFH terletak pada diagonal ruang CE, di S = ({a/3}, {a/3}, {2a/3}) jika A titik asal. AS = √{9 + 9 + 36} = √{54} = 3√{6} cm.",
    { scene: solid("kubus", [9], { plane: ["A", "F", "H"], extra: { S: [3, 3, 6] }, segs: [["C", "S"], ["A", "S"]] }) })),
];
