/**
 * Kelas 12 Bab 4 - Kekongruenan dan Kesebangunan (Pengayaan)
 * (sumber: Buku Siswa Matematika Kelas XII, Bab 4, hlm. 153-232).
 * A. Kekongruenan (Subbab 4.1, Kegiatan 4.1.1-4.1.5).  B. Kesebangunan (Subbab 4.2, Kegiatan 4.2.1-4.2.4).
 * Bentuk soal mengikuti buku: memasangkan titik sudut, sisi, dan sudut yang bersesuaian; menentukan kekongruenan
 * segibanyak dan segitiga (Sisi-Sisi-Sisi, Sisi-Sudut-Sisi, Sudut-Sisi-Sudut) dengan aturan sinus dan kosinus;
 * melengkapi alasan pada bukti formal (Masalah 4.1.3-4.1.5); kekongruenan dan kesebangunan hasil transformasi pada
 * bidang Kartesius (Masalah 4.1.6-4.1.7, 4.2.4); rasio sisi, keliling, dan luas; panjang sisi segitiga sebangun
 * (Masalah 4.2.1-4.2.2, Soal Latihan 1-5); garis tinggi, garis berat, dan garis bagi yang bersesuaian; serta Uji
 * Kompetensi (bayangan pohon, rasio keliling dan luas, tiga persegi bersinggungan).
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Pt = [number, number];

/* ---------- Angka ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "").replace(/°$/, "");
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export const r6 = (x: number) => Math.round(x * 1e6) / 1e6;

/* ---------- Geometri ---------- */
const rad = (d: number) => (d * Math.PI) / 180;
export const deg = (r: number) => (r * 180) / Math.PI;
export const dist = (p: Pt, q: Pt) => Math.hypot(p[0] - q[0], p[1] - q[1]);
/** Sudut di titik V (derajat) antara V→P dan V→Q. */
export const angleAt = (v: Pt, p: Pt, q: Pt) => { const a = [p[0] - v[0], p[1] - v[1]], b = [q[0] - v[0], q[1] - v[1]]; return deg(Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1])))))); };
/** Segitiga dari tiga sisi: titik pertama di (0, 0), titik kedua di sumbu x. */
export function triSSS(n: string, ab: number, bc: number, ca: number): Record<string, Pt> {
  const x = (ab * ab + ca * ca - bc * bc) / (2 * ab), y = Math.sqrt(Math.max(0, ca * ca - x * x));
  return { [n[0]]: [0, 0], [n[1]]: [ab, 0], [n[2]]: [x, y] };
}
/** Segitiga dari sisi-sudut-sisi di titik pertama. */
export const triSAS = (n: string, ab: number, angA: number, ac: number): Record<string, Pt> => ({ [n[0]]: [0, 0], [n[1]]: [ab, 0], [n[2]]: [ac * Math.cos(rad(angA)), ac * Math.sin(rad(angA))] });
/** Geser, cerminkan (terhadap sumbu tegak), dan putar sekumpulan titik. */
export function move(pts: Record<string, Pt>, dx: number, dy: number, opt: { flip?: boolean; rot?: number; rename?: Record<string, string> } = {}): Record<string, Pt> {
  const out: Record<string, Pt> = {}, t = rad(opt.rot ?? 0);
  for (const [k, [x0, y0]] of Object.entries(pts)) { const x = opt.flip ? -x0 : x0, y = y0; out[opt.rename?.[k] ?? k] = [r6(x * Math.cos(t) - y * Math.sin(t) + dx), r6(x * Math.sin(t) + y * Math.cos(t) + dy)]; }
  return out;
}
/** Aturan kosinus: sisi di depan sudut θ dengan dua sisi apitnya. */
export const cosRuleSide = (b: number, c: number, theta: number) => Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(rad(theta)));
export const cosRuleAngle = (a: number, b: number, c: number) => deg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));

/* ---------- Gambar ---------- */
export type Fig = {
  type: "fig"; pts: Record<string, Pt>; polys?: string[]; segs?: [string, string, ("dash" | "solid")?][];
  sides?: Record<string, string>; angles?: Record<string, string>; ticks?: Record<string, number>; arcs?: Record<string, number>; right?: string[]; hide?: string[]; shade?: string[]; caption?: string;
};
export type Plane = { type: "plane"; range: [number, number, number, number]; shapes: { pts: Pt[]; names: string[]; color: "green" | "blue" | "red" }[]; caption?: string };
export type Scene =
  | Fig | Plane
  | { type: "shadow"; stick: number; stickShadow: number; objShadow: number; height?: number; object: "pohon" | "gedung"; unit: string; caption?: string }
  | { type: "grid"; head: string[]; rows: string[][]; title?: string }
  | { type: "multi"; items: Scene[] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "num"; label: string; value: number; unit?: string }
  | { kind: "frac"; label: string; p: number; q: number; ratio?: boolean }
  | { kind: "row"; label: string; cells: string[]; values: number[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "match"; label: string; left: string[]; right: string[]; answer: string[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] };

export type PQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "row" ? p.cells.length : p.kind === "match" ? p.left.length : p.kind === "frac" ? 2 : 1);
export const cells = (p: Part, v: string) => { if (fieldCount(p) === 1) return [v ?? ""]; const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
export const simp = (p: number, q: number): [number, number] => { const g = gcd(p, q) || 1; return [p / g, q / g]; };
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [idn(p.value)];
    case "frac": return simp(p.p, p.q).map(String);
    case "row": return p.values.map(idn);
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "match": return p.answer;
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
  }
}
const same = (raw: string, v: number) => { const a = num(raw); return !Number.isNaN(a) && Math.abs(a - v) <= 1e-9 * Math.max(1, Math.abs(v)); };
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return same(v, p.value);
    case "frac": { const a = num(x[0]), b = num(x[1]); return Number.isInteger(a) && Number.isInteger(b) && b !== 0 && a * p.q === b * p.p; }
    case "row": return p.values.every((val, k) => same(x[k], val));
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
      case "frac": return `${plain(p.label)} ${x[0]}${p.ratio ? " : " : "/"}${x[1]}`;
      case "row": return `${plain(p.label)} ${p.cells.map((c, k) => `${plain(c)}: ${x[k]}`).join(", ")}`;
      case "choice": return `${plain(p.label)} ${plain(v[i]) || "…"}`;
      case "match": return `${plain(p.label)} ${p.left.map((l, k) => `${l} ↔ ${x[k]}`).join(", ")}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: number, prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): PQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string): Part => ({ kind: "num", label, value, unit });
const ratio = (label: string, p: number, qq: number): Part => ({ kind: "frac", label, p, q: qq, ratio: true });
const row = (label: string, c: string[], values: number[]): Part => ({ kind: "row", label, cells: c, values });
const ch = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const cls = (options: string[], ...r: [string, string][]): Part => ({ kind: "classify", options, rows: r.map(([text, answer]) => ({ text, answer })) });
const match = (label: string, left: string[], right: string[], answer: string[]): Part => ({ kind: "match", label, left, right, answer });
const fig = (pts: Record<string, Pt>, more: Partial<Fig> = {}): Fig => ({ type: "fig", pts, ...more });
export const CRIT = ["Sisi-Sisi-Sisi", "Sisi-Sudut-Sisi", "Sudut-Sisi-Sudut", "Tidak cukup"];

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Kekongruenan", sections: [
    { title: "Sisi dan sudut yang bersesuaian", lab: "pasang",
      steps: [
        "Dua segibanyak dapat dibuat berkorespondensi (dipasangkan satu-satu) jika banyak titik sudutnya sama. Segitiga hanya bisa dipasangkan dengan segitiga, segiempat dengan segiempat.",
        "Korespondensi ditulis dengan tanda ↔, misalnya ABCD ↔ PQRS dengan A ↔ P, B ↔ Q, C ↔ R, D ↔ S. Urutan huruf menunjukkan pasangan: huruf pertama dengan huruf pertama, dan seterusnya.",
        "Sudut yang bersesuaian adalah sudut pada titik-titik yang dipasangkan: ∠A ↔ ∠P, ∠B ↔ ∠Q, dan seterusnya.",
        "Sisi yang bersesuaian diperoleh dari dua titik yang dipasangkan: karena A ↔ P dan B ↔ Q, maka sisi AB ↔ sisi PQ.",
        "Jika ABCD ↔ EFGH, maka AD ↔ EH (huruf pertama dan keempat) dan BC ↔ FG (huruf kedua dan ketiga).",
        "Korespondensi tidak harus mengikuti urutan abjad. Pada ΔKLM ↔ ΔZXY, K ↔ Z, L ↔ X, M ↔ Y, sehingga KL ↔ ZX.",
        "Menentukan pasangan dengan benar adalah langkah pertama sebelum membandingkan ukuran sisi dan sudut.",
      ],
      life: "Bayangkan dua kursi plastik yang sama persis di ruang tamu, tetapi salah satunya diletakkan terbalik menghadap dinding. Untuk mengecek apakah ukurannya benar-benar sama, kamu harus membandingkan kaki kiri depan dengan kaki kiri depan, sandaran dengan sandaran, bukan kaki dengan sandaran. Itulah korespondensi: memasangkan bagian yang \"sejenis\" dulu, baru membandingkan ukurannya. Tukang kayu yang membuat dua daun pintu kembar juga menandai setiap sudut kayu dengan huruf yang sama, agar ketika dirakit, sudut yang bersesuaian tidak tertukar.",
      example: "Diketahui ABCD ↔ EFGH dengan A ↔ E, B ↔ F, C ↔ G, D ↔ H. Tentukan sisi dan sudut yang bersesuaian dengan AB, AD, dan ∠C.",
      work: [
        "A ↔ E dan B ↔ F, jadi AB ↔ EF.",
        "A ↔ E dan D ↔ H, jadi AD ↔ EH.",
        "C ↔ G, jadi ∠C ↔ ∠G.",
        "Pasangan lainnya: BC ↔ FG, CD ↔ GH, ∠A ↔ ∠E, ∠B ↔ ∠F, ∠D ↔ ∠H.",
      ],
      notes: [
        "Baca korespondensi dari urutan huruf, bukan dari letak gambar.",
        "Banyak titik sudut harus sama agar korespondensi satu-satu dapat dibuat.",
        "Tanda ↔ berarti \"dipasangkan dengan\", belum tentu sama ukurannya.",
      ],
      demo: "Ketuk satu titik sudut pada bangun pertama, lalu titik pasangannya pada bangun kedua. Garis penghubung muncul, dan sisi serta sudut yang bersesuaian dituliskan.",
    },
    { title: "Kekongruenan dua segibanyak", lab: "tumpuk",
      steps: [
        "Dua segibanyak kongruen (sama dan sebangun) jika ada korespondensi satu-satu sehingga semua sisi yang bersesuaian sama panjang dan semua sudut yang bersesuaian sama besar.",
        "Kekongruenan ditulis dengan ≅, misalnya ABCD ≅ EFGH. Urutan huruf menunjukkan pasangan titik sudutnya.",
        "Sisi yang sama panjang biasanya ditandai dengan garis kecil (tanda turus) yang sama, dan sudut yang sama besar ditandai dengan busur yang sama.",
        "Syarat sisi saja tidak cukup: persegi panjang 4 × 6 dan jajargenjang 4 × 6 bersudut 60° memiliki sisi yang sama, tetapi sudutnya berbeda, jadi tidak kongruen.",
        "Syarat sudut saja juga tidak cukup: dua persegi panjang dengan sudut sama (semua 90°) belum tentu sama ukurannya.",
        "Cara sederhana menguji: jika satu bangun dapat dipindahkan (digeser, diputar, atau dibalik) sehingga menutupi bangun lain dengan tepat, keduanya kongruen.",
        "Jika dua segibanyak kongruen, sisi dan sudut yang bersesuaian dapat dipakai untuk mencari ukuran yang belum diketahui.",
      ],
      life: "Pabrik ubin membuat ribuan keramik untuk lantai rumah. Agar bisa dipasang rapat tanpa celah, setiap keramik harus kongruen: panjang setiap sisinya sama dan setiap sudutnya tepat 90°. Petugas kendali mutu cukup menumpuk keramik baru di atas keramik contoh. Jika menutup dengan tepat, keramik itu lolos. Jika sisinya sama tetapi sudutnya miring sedikit, keramik itu ditolak karena nantinya akan membentuk celah di lantai. Pemeriksaan ini persis definisi kongruen: semua sisi dan semua sudut yang bersesuaian harus sama.",
      example: "Segiempat ABCD ≅ EFGH. Diketahui AB = 7 cm, BC = 9 cm, ∠B = 110°, dan ∠C = 75°. Tentukan EF, FG, dan ∠G.",
      work: [
        "Korespondensi dari urutan huruf: A ↔ E, B ↔ F, C ↔ G, D ↔ H.",
        "AB ↔ EF, jadi EF = 7 cm.",
        "BC ↔ FG, jadi FG = 9 cm.",
        "∠C ↔ ∠G, jadi ∠G = 75°.",
      ],
      notes: [
        "Kongruen: semua sisi dan semua sudut yang bersesuaian sama.",
        "Tulis urutan huruf sesuai pasangannya: ABCD ≅ EFGH berbeda dengan ABCD ≅ FGHE.",
        "Bangun hasil pencerminan tetap kongruen walaupun urutan titiknya terbalik.",
      ],
      demo: "Pilih salah satu bangun calon, lalu tumpukkan di atas bangun ABCD. Peraga membandingkan setiap sisi dan sudut yang bersesuaian dan menyatakan apakah keduanya kongruen.",
    },
    { title: "Kekongruenan dua segitiga", lab: "segitiga",
      steps: [
        "Untuk segitiga ada jalan pintas: tidak perlu membandingkan enam unsur. Tiga unsur tertentu sudah cukup.",
        "Sisi-Sudut-Sisi (S-Sd-S): dua sisi dan sudut yang diapit kedua sisi itu sama. Dengan aturan kosinus, sisi ketiga pasti sama: a^{2} = b^{2} + c^{2} − 2bc cos A.",
        "Sudut-Sisi-Sudut (Sd-S-Sd): dua sudut dan sisi di antara kedua sudut itu sama. Sudut ketiga pasti sama (jumlah sudut 180°), lalu aturan sinus {a/sin A} = {b/sin B} = {c/sin C} memastikan sisi lainnya sama.",
        "Sisi-Sisi-Sisi (S-S-S): ketiga sisi sama. Dengan aturan kosinus, setiap sudut dapat dihitung, cos A = {(b^{2} + c^{2} − a^{2})/2bc}, sehingga ketiga sudutnya pasti sama.",
        "Sudut-Sudut-Sudut tidak cukup untuk kongruen: segitiga kecil dan segitiga besar bisa bersudut sama.",
        "Dua sisi dan sudut yang tidak diapit (Sisi-Sisi-Sudut) juga tidak selalu cukup, karena bisa menghasilkan dua segitiga yang berbeda.",
        "Pada gambar, sudut bertolak belakang dan sisi yang dipakai bersama (berimpit) sering menjadi unsur ketiga yang sama.",
      ],
      life: "Kontraktor yang mengangkat dua rangka atap segitiga ke atap aula tidak perlu mengukur semua sisi dan sudut. Cukup tiga ukuran: jika panjang ketiga batang baja pada rangka pertama sama dengan rangka kedua, rangka itu pasti kongruen (S-S-S), sehingga atapnya akan simetris. Rangka segitiga juga sering dipakai pada jembatan dan menara listrik karena bentuknya \"terkunci\": tiga batang dengan panjang tertentu hanya bisa membentuk satu segitiga, tidak bisa miring seperti rangka segiempat.",
      example: "Segitiga ABC dengan AB = 5 cm, AC = 8 cm, ∠A = 60°, dan segitiga DEF dengan DE = 5 cm, DF = 8 cm, ∠D = 60°. Apakah keduanya kongruen? Tentukan BC.",
      work: [
        "Dua sisi dan sudut apitnya sama, jadi kriteria Sisi-Sudut-Sisi.",
        "Aturan kosinus: BC^{2} = 5^{2} + 8^{2} − 2(5)(8) cos 60° = 25 + 64 − 40 = 49, jadi BC = 7 cm.",
        "Dengan cara yang sama EF = 7 cm.",
        "Ketiga sisi sama, sehingga semua sudut juga sama: ΔABC ≅ ΔDEF.",
      ],
      notes: [
        "Pastikan sudut pada S-Sd-S diapit oleh kedua sisi yang diketahui.",
        "Pada Sd-S-Sd, sisi yang diketahui harus terletak di antara kedua sudut.",
        "Tuliskan pasangan titik sudut yang benar pada pernyataan ΔABC ≅ ΔDEF.",
      ],
      demo: "Pilih kriteria lalu atur ukurannya. Peraga menggambar segitiga dengan aturan sinus dan kosinus dan menunjukkan apakah hanya ada satu segitiga yang mungkin.",
    },
    { title: "Alur berpikir dalam pembuktian deduktif", lab: "bukti",
      steps: [
        "Pembuktian deduktif menyusun pernyataan secara berurutan, dan setiap pernyataan harus punya alasan: data yang diketahui, definisi, sifat, atau konjektur yang sudah diterima.",
        "Tuliskan dulu yang diketahui dan yang akan ditunjukkan.",
        "Buat alur (diagram) dari yang diketahui menuju kesimpulan, lalu ubah menjadi tabel bukti formal dengan kolom pernyataan dan alasan.",
        "Alasan yang sering dipakai: diketahui; sisi yang sama (berimpit, kesamaan garis); sudut bertolak belakang (dua garis berpotongan membentuk sudut yang berhadapan sama besar); definisi titik tengah.",
        "Setelah tiga unsur yang sesuai sama, simpulkan kekongruenan dengan S-S-S, S-Sd-S, atau Sd-S-Sd.",
        "Dari dua segitiga kongruen, sisi atau sudut lain yang bersesuaian pasti sama. Alasannya: definisi kekongruenan segibanyak.",
        "Istilah penting: titik tengah membagi ruas garis menjadi dua bagian sama panjang; garis tinggi tegak lurus sisi di depannya; garis bagi membagi sudut menjadi dua sama besar; garis berat menghubungkan titik sudut dengan titik tengah sisi di depannya.",
      ],
      life: "Seorang detektif tidak boleh menuduh tanpa bukti. Ia mengumpulkan fakta (sidik jari, rekaman, saksi), lalu menyusunnya berurutan sampai sampai pada kesimpulan, dan setiap langkah harus bisa dipertanggungjawabkan di pengadilan. Pembuktian matematika bekerja dengan cara yang sama. Misalnya, untuk menunjukkan dua sudut sama besar pada layang-layang, kita tidak cukup berkata \"kelihatannya sama\". Kita tunjukkan dua segitiganya kongruen dengan S-S-S, lalu dengan definisi kekongruenan, sudut yang bersesuaian pasti sama.",
      example: "Pada layang-layang ERAC, EC ≅ AC dan ER ≅ AR. Tunjukkan ∠E ≅ ∠A.",
      work: [
        "EC ≅ AC (diketahui) dan ER ≅ AR (diketahui).",
        "RC ≅ RC (sisi yang sama, kesamaan garis).",
        "ΔRCE ≅ ΔRCA (konjektur kekongruenan Sisi-Sisi-Sisi).",
        "∠E ≅ ∠A (definisi kekongruenan segibanyak).",
      ],
      notes: [
        "Setiap baris pernyataan harus disertai alasan.",
        "Jangan memakai kesimpulan sebagai alasan sebelum dibuktikan.",
        "Gambar ulang dan tandai unsur yang sama dengan turus atau busur agar alurnya terlihat.",
      ],
      demo: "Susun bukti dengan mengetuk pernyataan sesuai urutan yang benar. Peraga menolak langkah yang belum punya dasar dan menuliskan alasannya di tabel bukti formal.",
    },
    { title: "Kekongruenan bangun hasil transformasi", lab: "geser",
      steps: [
        "Transformasi memindahkan setiap titik bangun ke posisi baru menurut aturan tertentu.",
        "Pergeseran (translasi) (x, y) → (x + a, y + b) memindahkan bangun tanpa mengubah ukuran dan bentuk.",
        "Rotasi memutar bangun terhadap satu titik pusat dengan sudut tertentu. Rotasi 90° berlawanan arah jarum jam terhadap O: (x, y) → (−y, x).",
        "Pencerminan (refleksi) membalik bangun terhadap sebuah garis. Pencerminan terhadap sumbu y: (x, y) → (−x, y).",
        "Pergeseran, rotasi, dan pencerminan tidak mengubah panjang sisi dan besar sudut, sehingga bangun asal dan bayangannya kongruen.",
        "Dilatasi (perbesaran) dengan faktor skala k: (x, y) → (kx, ky). Jika k ≠ 1 atau k ≠ −1, panjang sisi berubah menjadi |k| kali, sehingga bayangannya tidak kongruen.",
        "Untuk memeriksa pada bidang Kartesius, hitung panjang sisi dengan rumus jarak √{(x₂ − x₁)^{2} + (y₂ − y₁)^{2}}.",
      ],
      life: "Saat kamu menggeser jendela aplikasi di layar laptop, memutar foto di galeri ponsel, atau melihat bayangan dirimu di cermin, bentuk dan ukurannya tidak berubah. Ketiganya adalah transformasi yang menghasilkan bangun kongruen. Berbeda ketika kamu mencubit layar untuk memperbesar foto: gambar menjadi lebih besar, bentuknya sama tetapi ukurannya berubah. Itu dilatasi, dan hasilnya tidak kongruen dengan foto awal, melainkan sebangun.",
      example: "Segitiga ABC dengan A(1, 1), B(4, 1), C(1, 5) digeser dengan aturan (x, y) → (x + 3, y − 2). Apakah ΔABC dan bayangannya kongruen?",
      work: [
        "A'(4, −1), B'(7, −1), C'(4, 3).",
        "AB = 3, BC = √{9 + 16} = 5, CA = 4.",
        "A'B' = 3, B'C' = 5, C'A' = 4.",
        "Ketiga sisi sama, jadi ΔABC ≅ ΔA'B'C' (S-S-S).",
      ],
      notes: [
        "Pergeseran, rotasi, dan pencerminan selalu menghasilkan bangun kongruen.",
        "Dilatasi dengan k ≠ ±1 tidak menghasilkan bangun kongruen.",
        "Hitung panjang sisi dengan rumus jarak jika bangun ada di bidang Kartesius.",
      ],
      demo: "Pilih jenis transformasi dan ubah besarnya. Bayangan segitiga digambar pada bidang Kartesius, dan panjang sisi kedua segitiga dibandingkan.",
    },
  ] },
  { code: "B", title: "Kesebangunan", sections: [
    { title: "Kesebangunan dua bangun datar", lab: "foto",
      steps: [
        "Rasio adalah perbandingan dua besaran, misalnya 6 : 9 = 2 : 3. Proporsi adalah kesamaan dua rasio, misalnya {6/9} = {8/12}.",
        "Dua segibanyak sebangun (ditulis ~) jika ada korespondensi satu-satu sehingga semua sudut yang bersesuaian sama besar dan semua rasio sisi yang bersesuaian sama.",
        "Rasio yang sama itu disebut faktor skala k. Pada trapesium ABCD (9, 6, 7,5, 6) dan EFGH (12, 8, 10, 8): {12/9} = {8/6} = {10/7,5} = {4/3}.",
        "Sudut saja tidak cukup: persegi panjang 4 × 6 dan 4 × 8 bersudut sama tetapi rasio sisinya berbeda ({4/4} ≠ {6/8}).",
        "Rasio sisi saja juga tidak cukup untuk segibanyak selain segitiga: belah ketupat bersisi 5 dengan sudut 60° dan persegi bersisi 10 memiliki rasio sisi yang sama tetapi sudutnya berbeda.",
        "Semua persegi sebangun, semua segitiga sama sisi sebangun, dan semua lingkaran sebangun. Tidak semua persegi panjang sebangun.",
        "Kekongruenan adalah kejadian khusus kesebangunan dengan faktor skala 1.",
      ],
      life: "Kamu mencetak foto ukuran 4 × 6 dan ingin memperbesarnya menjadi 10 × 15 untuk dibingkai. Rasio sisinya {10/4} = {15/6} = 2,5, jadi foto besar sebangun dengan foto kecil: wajah tidak akan terlihat gepeng. Tetapi jika dicetak di kertas 10 × 12, rasionya {10/4} = 2,5 dan {12/6} = 2 berbeda, sehingga gambar akan terpotong atau melar. Hal yang sama terjadi saat menonton video lebar di layar ponsel yang lebih tinggi: ada pita hitam di atas dan bawah karena rasio layar dan rasio video tidak sama.",
      example: "Trapesium ABCD dengan AB = 9 cm, BC = 6 cm, CD = 7,5 cm, DA = 6 cm, dan trapesium EFGH dengan EF = 12 cm, FG = 8 cm, GH = 10 cm, HE = 8 cm. Sudut yang bersesuaian sama besar. Apakah keduanya sebangun?",
      work: [
        "{EF/AB} = {12/9} = {4/3}.",
        "{FG/BC} = {8/6} = {4/3} dan {GH/CD} = {10/7,5} = {4/3}.",
        "{HE/DA} = {8/6} = {4/3}.",
        "Semua rasio sama dan sudut yang bersesuaian sama, jadi ABCD ~ EFGH dengan faktor skala {4/3}.",
      ],
      notes: [
        "Bandingkan sisi yang bersesuaian, bukan sisi yang kebetulan bersebelahan di gambar.",
        "Rasio boleh dihitung besar : kecil atau kecil : besar, asalkan konsisten.",
        "Kongruen pasti sebangun, tetapi sebangun belum tentu kongruen.",
      ],
      demo: "Ubah panjang dan lebar foto cetakan kedua. Peraga menghitung rasio panjang dan rasio lebar, lalu menunjukkan kapan foto itu sebangun dengan foto asli.",
    },
    { title: "Segitiga-segitiga yang sebangun", lab: "bayangan",
      steps: [
        "Untuk segitiga, ada jalan pintas memeriksa kesebangunan.",
        "Sudut-Sudut (Sd-Sd): dua sudut yang bersesuaian sama besar. Sudut ketiga pasti sama, karena jumlah sudut segitiga 180°.",
        "Sisi-Sudut-Sisi (S-Sd-S): satu sudut sama besar dan rasio dua sisi yang mengapit sudut itu sama.",
        "Sisi-Sisi-Sisi (S-S-S): rasio ketiga pasang sisi yang bersesuaian sama.",
        "Dua rasio sisi yang sama tanpa sudut apit yang sama belum cukup. Pada segitiga GWB dan JFK di buku, {54/108} = {48/96}, tetapi keduanya tidak sebangun.",
        "Jika sebuah garis sejajar salah satu sisi segitiga, segitiga kecil yang terbentuk sebangun dengan segitiga besar: {AD/AB} = {AE/AC} = {DE/BC}.",
        "Pada dua garis yang berpotongan dengan dua ruas sejajar, terbentuk dua segitiga sebangun berbentuk jam pasir karena sudut bertolak belakang dan sudut dalam berseberangan sama besar.",
      ],
      life: "Thales menghitung tinggi piramida tanpa memanjatnya. Ia menancapkan tongkat dan membandingkan bayangannya dengan bayangan piramida pada saat yang sama. Sinar matahari datang dengan sudut yang sama, sehingga segitiga tongkat dan segitiga piramida sebangun (Sd-Sd). Hari ini cara itu masih bisa kamu pakai: jika tubuhmu setinggi 1,6 m membentuk bayangan 2 m, dan bayangan tiang bendera sekolah 10 m, maka tinggi tiang itu {1,6 × 10/2} = 8 m. Kamu cukup membawa meteran gulung.",
      example: "ΔABC ~ ΔPQR dengan AB = 12 cm, BC = 8 cm, AC = 15 cm, dan PQ = 18 cm. Tentukan QR dan PR. (Masalah 4.2.1)",
      work: [
        "Faktor skala k = {PQ/AB} = {18/12} = {3/2}.",
        "QR = {3/2} × BC = {3/2} × 8 = 12 cm.",
        "PR = {3/2} × AC = {3/2} × 15 = 22,5 cm.",
        "Sudut-sudutnya: ∠P = ∠A, ∠Q = ∠B, ∠R = ∠C, dan semuanya dapat dihitung dengan aturan kosinus.",
      ],
      notes: [
        "Tuliskan pasangan sisi dari urutan huruf pada pernyataan ~.",
        "Pada garis sejajar sisi segitiga, bandingkan bagian dengan seluruh sisi, bukan bagian dengan bagian lain.",
        "Sudut-Sudut-Sudut cukup untuk sebangun, tetapi tidak cukup untuk kongruen.",
      ],
      demo: "Ubah tinggi tongkat, panjang bayangan tongkat, dan panjang bayangan pohon. Dua segitiga sebangun digambar dan tinggi pohon dihitung dari perbandingannya.",
    },
    { title: "Kesebangunan bangun hasil transformasi", lab: "dilatasi",
      steps: [
        "Pergeseran, rotasi, dan pencerminan menghasilkan bangun yang kongruen, sehingga juga sebangun dengan faktor skala 1.",
        "Dilatasi dengan pusat O dan faktor skala k: (x, y) → (kx, ky). Setiap sisi bayangan menjadi |k| kali sisi asal, dan sudutnya tetap.",
        "Karena semua rasio sisi sama (|k|) dan sudutnya sama, bangun hasil dilatasi sebangun dengan bangun asal.",
        "Rasio keliling bayangan terhadap bangun asal adalah |k|.",
        "Rasio luas bayangan terhadap bangun asal adalah k^{2}. Persegi bersisi 3 cm dilatasi dengan k = 2 menjadi bersisi 6 cm, luasnya dari 9 cm^{2} menjadi 36 cm^{2}.",
        "Jika k di antara 0 dan 1, bangun mengecil. Jika k negatif, bayangan berada di seberang pusat O dan terbalik, tetapi tetap sebangun.",
      ],
      life: "Peta wisata di brosur adalah hasil dilatasi kota sungguhan dengan faktor skala yang sangat kecil, misalnya 1 : 50.000. Semua sudut belokan jalan sama dengan aslinya, hanya ukurannya mengecil. Karena itu jarak di peta bisa diubah menjadi jarak sebenarnya. Tetapi hati-hati dengan luas: jika peta diperbesar dua kali di mesin fotokopi, setiap jarak menjadi dua kali, sedangkan luas taman di peta menjadi empat kali. Tinta yang dibutuhkan untuk mewarnainya pun menjadi empat kali lebih banyak.",
      example: "Persegi ABCD dengan luas 9 cm^{2} didilatasi dengan faktor skala 2, lalu hasilnya dirotasi 30° terhadap titik A. Tentukan panjang sisi dan luas bangun hasilnya. (Masalah 4.2.4)",
      work: [
        "Sisi persegi awal √{9} = 3 cm.",
        "Dilatasi k = 2: sisi menjadi 6 cm dan luas 6^{2} = 36 cm^{2} (= 2^{2} × 9).",
        "Rotasi 30° tidak mengubah ukuran: sisi tetap 6 cm dan luas tetap 36 cm^{2}.",
        "Bangun akhir sebangun dengan persegi awal, tetapi tidak kongruen.",
      ],
      notes: [
        "Rasio panjang k, rasio luas k^{2}.",
        "Urutan transformasi tidak mengubah faktor skala akhir jika hanya ada satu dilatasi.",
        "Semua bangun kongruen pasti sebangun.",
      ],
      demo: "Ubah faktor skala dilatasi. Bayangan segitiga digambar dari pusat O, lalu rasio sisi, rasio keliling, dan rasio luasnya dibandingkan.",
    },
    { title: "Unsur-unsur segitiga sebangun yang bersesuaian", lab: "unsur",
      steps: [
        "Jika ΔABC ~ ΔDEF dengan faktor skala k, maka bukan hanya sisi yang sebanding.",
        "Garis tinggi yang bersesuaian (misalnya CK dan FP, yang tegak lurus sisi AB dan DE) memiliki rasio k.",
        "Garis berat yang bersesuaian (misalnya AL dan DQ, menuju titik tengah sisi di depannya) memiliki rasio k.",
        "Garis bagi sudut yang bersesuaian (misalnya BM dan ER) memiliki rasio k.",
        "Keliling memiliki rasio k, sedangkan luas memiliki rasio k^{2}. Jika rasio sisi 2 : 3, rasio luasnya 4 : 9.",
        "Pada segitiga siku-siku, garis tinggi ke sisi miring membentuk dua segitiga kecil yang sebangun dengan segitiga besar, sehingga h^{2} = (bagian kiri) × (bagian kanan).",
        "Hubungan ini dapat dipakai untuk menghitung panjang yang tidak dapat diukur langsung.",
      ],
      life: "Seorang arsitek membuat maket gedung dengan skala 1 : 100. Ia mengukur tinggi ruang di maket 3,5 cm, jadi tinggi ruang sebenarnya 350 cm. Tetapi untuk memperkirakan luas lantai yang perlu dikeramik, ia tidak cukup mengalikan 100. Lantai 20 cm^{2} di maket berarti 20 × 100^{2} = 200.000 cm^{2} atau 20 m^{2} di gedung sebenarnya. Kesalahan memakai rasio panjang untuk luas bisa membuat kontraktor memesan keramik ratusan kali lebih sedikit dari yang dibutuhkan.",
      example: "Segitiga siku-siku TMR siku-siku di M dengan TM = 40, RM = 30, dan TR = 50. Garis tinggi MH tegak lurus TR. Tentukan h = MH, x = RH, dan y = TH.",
      work: [
        "ΔTMR ~ ΔTHM ~ ΔMHR, karena ketiganya siku-siku dan masing-masing berbagi satu sudut lancip.",
        "Luas: {1/2} × 40 × 30 = {1/2} × 50 × h, jadi h = 24.",
        "Dari ΔMHR ~ ΔTMR: {RH/RM} = {RM/RT}, sehingga x = {30^{2}/50} = 18.",
        "Dari ΔTHM ~ ΔTMR: y = {40^{2}/50} = 32. Periksa: x + y = 50.",
      ],
      notes: [
        "Garis tinggi, garis berat, garis bagi, dan keliling: rasio k.",
        "Luas: rasio k^{2}.",
        "Pada segitiga siku-siku dengan garis tinggi ke sisi miring, cari tiga segitiga sebangun.",
      ],
      demo: "Ubah faktor skala dan pilih garis tinggi, garis berat, atau garis bagi. Panjang garis pada kedua segitiga diukur dan rasionya dibandingkan dengan rasio sisi.",
    },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: `${t.code}.${j + 1}`, topic: t })));

/* ---------- Gambar soal ---------- */
const quadA: Record<string, Pt> = { A: [0, 3], B: [0.3, 0.2], C: [3.4, 0], D: [3, 2.3] };
const quadE = move(quadA, 7.2, -0.2, { flip: true, rename: { A: "E", B: "F", C: "G", D: "H" } });
const kite = { R: [0, 0] as Pt, E: [4, 2.6] as Pt, C: [7, 0] as Pt, A: [4, -2.6] as Pt };
const bow = { M: [0, 0] as Pt, O: [8, 0] as Pt, E: [2.3, 4.2] as Pt, U: [5.7, 4.2] as Pt, S: [4, 2.947368] as Pt };
const bowtie = { C: [0, 3] as Pt, L: [0.8, 0] as Pt, I: [2.6, 1.6] as Pt, B: [4.4, 3.2] as Pt, M: [5.2, 0.2] as Pt };
/** Masalah 4.1.1: dua segitiga dengan sudut bertolak belakang di A. */
function crossFig(ae: number, ad: number, ab: string, ac: string, bc: string): Fig {
  const D: Pt = [-ad, 0], E: Pt = [-ad * 0.42, ae * 0.62], B: Pt = [ad, 0], C: Pt = [ad * 0.42, -ae * 0.62];
  return fig({ A: [0, 0], D, E, B, C }, { polys: ["ADE", "ABC"], sides: { AE: `${ae}`, AD: `${ad}`, AB: ab, AC: ac, BC: bc } });
}
/** AB ∥ DE, AE dan BD berpotongan di C, faktor skala 2/3. */
const hgBase = triSSS("CAB", 24, 21, 30);
export const hourglass: Record<string, Pt> = { ...hgBase, E: [-(2 / 3) * hgBase.A[0], -(2 / 3) * hgBase.A[1]], D: [-(2 / 3) * hgBase.B[0], -(2 / 3) * hgBase.B[1]] };
/** Uji Kompetensi no. 3 dengan angka baru: BC = 12, CA = 15, AB = 18, D pada AB dengan BD = 8. */
const bdcBase = triSSS("BCA", 12, 15, 18);
export const bdcFig: Record<string, Pt> = { ...bdcBase, D: [bdcBase.A[0] * (8 / 18), bdcBase.A[1] * (8 / 18)] };
/** Segitiga dengan ∠P = 50°, ∠Q = 70°, PQ = 5. */
const pqr5070 = triSAS("PQR", 5, 50, (5 * Math.sin((70 * Math.PI) / 180)) / Math.sin((60 * Math.PI) / 180));
const isoAlt = { A: [3, 5] as Pt, B: [0, 0] as Pt, C: [6, 0] as Pt, D: [3, 0] as Pt };

/* ---------- Latihan ---------- */
export const practice: PQuestion[][] = [
  [
    q(0, "Diketahui ABCD ↔ EFGH dengan A ↔ E, B ↔ F, C ↔ G, D ↔ H.",
      [ch("Sisi yang bersesuaian dengan AD:", ["EF", "EH", "GH"], "EH"), ch("Sudut yang bersesuaian dengan ∠C:", ["∠G", "∠F", "∠H"], "∠G")],
      "A ↔ E dan D ↔ H, jadi AD ↔ EH. C ↔ G, jadi ∠C ↔ ∠G.", { scene: fig({ ...quadA, ...quadE }, { polys: ["ABCD", "EFGH"] }) }),
    q(0, "Segiempat KLMN ↔ WXYZ dengan K ↔ Y, L ↔ Z, M ↔ W, N ↔ X. Hubungkan setiap sisi KLMN dengan sisi pasangannya.",
      [match("Pasangan sisi:", ["KL", "LM", "MN", "NK"], ["YZ", "ZW", "WX", "XY"], ["YZ", "ZW", "WX", "XY"])],
      "K ↔ Y dan L ↔ Z memberi KL ↔ YZ. Lalu LM ↔ ZW, MN ↔ WX, dan NK ↔ XY."),
    q(0, "Tentukan benar atau salah pernyataan tentang korespondensi berikut.",
      [tf(["Segitiga dan segiempat dapat dibuat berkorespondensi satu-satu.", false], ["Jika ΔABC ↔ ΔPQR, maka sisi BC bersesuaian dengan sisi QR.", true], ["Tanda ↔ berarti kedua sisi pasti sama panjang.", false])],
      "Banyak titik sudut harus sama. BC ↔ QR karena B ↔ Q dan C ↔ R. Tanda ↔ hanya menyatakan pasangan, belum tentu sama ukurannya."),
    q(0, "Diketahui ΔABC ↔ ΔZXY.",
      [ch("Sisi yang bersesuaian dengan BC:", ["ZX", "ZY", "XY"], "XY"), ch("Sudut yang bersesuaian dengan ∠A:", ["∠X", "∠Z", "∠Y"], "∠Z")],
      "A ↔ Z, B ↔ X, C ↔ Y. Jadi BC ↔ XY dan ∠A ↔ ∠Z."),
  ],
  [
    q(1, "Segiempat ABCD ≅ EFGH. Diketahui AB = 7 cm, BC = 9 cm, ∠B = 110°, dan ∠C = 75°.",
      [row("Ukuran", ["EF (cm)", "FG (cm)", "∠G (°)"], [7, 9, 75])],
      "A ↔ E, B ↔ F, C ↔ G. EF = AB = 7 cm, FG = BC = 9 cm, ∠G = ∠C = 75°.",
      { scene: fig({ ...quadA, ...quadE }, { polys: ["ABCD", "EFGH"], sides: { AB: "7", BC: "9" }, angles: { B: "110°", C: "75°" } }) }),
    q(1, "Persegi panjang PQRS berukuran 4 cm × 6 cm. Tentukan apakah setiap bangun berikut kongruen dengan PQRS.",
      [cls(["Kongruen", "Tidak kongruen"], ["Persegi panjang 6 cm × 4 cm (diputar)", "Kongruen"], ["Jajargenjang bersisi 4 cm dan 6 cm dengan sudut 60°", "Tidak kongruen"], ["Persegi panjang 4 cm × 6,5 cm", "Tidak kongruen"], ["Bayangan PQRS di cermin", "Kongruen"])],
      "Kongruen jika semua sisi dan sudut yang bersesuaian sama. Jajargenjang bersudut 60°, bukan 90°. Persegi panjang 4 × 6,5 berbeda sisinya. Rotasi dan cermin tidak mengubah ukuran."),
    q(1, "Tentukan benar atau salah pernyataan tentang kekongruenan segibanyak.",
      [tf(["Dua segiempat yang semua sisinya bersesuaian sama panjang pasti kongruen.", false], ["Dua segibanyak yang kongruen memiliki keliling yang sama.", true], ["Dua persegi dengan panjang sisi sama pasti kongruen.", true])],
      "Segiempat dengan sisi sama bisa berbeda sudutnya, misalnya persegi dan belah ketupat. Kongruen berarti semua ukuran sama, termasuk keliling. Persegi bersisi sama memiliki sudut 90° semua, jadi kongruen."),
    q(1, "Segiempat ABCD ≅ PQRS. Diketahui AB = x + 3 dan PQ = 2x − 4 (dalam cm).",
      [n("x =", 7), n("AB =", 10, "cm")],
      "AB ↔ PQ dan keduanya sama panjang: x + 3 = 2x − 4, jadi x = 7 dan AB = 10 cm."),
  ],
  [
    q(2, "Tentukan kriteria yang membuat ΔABC ≅ ΔDEF pada setiap data berikut.",
      [cls(CRIT, ["AB = DE, BC = EF, CA = FD", "Sisi-Sisi-Sisi"], ["AB = DE, ∠B = ∠E, BC = EF", "Sisi-Sudut-Sisi"], ["∠A = ∠D, AB = DE, ∠B = ∠E", "Sudut-Sisi-Sudut"], ["∠A = ∠D, ∠B = ∠E, ∠C = ∠F", "Tidak cukup"])],
      "S-S-S: tiga sisi. S-Sd-S: sudut B diapit AB dan BC. Sd-S-Sd: sisi AB di antara ∠A dan ∠B. Tiga sudut sama hanya menjamin sebangun, bukan kongruen."),
    q(2, "Segitiga ABC dengan AB = 5 cm, AC = 8 cm, dan ∠A = 60°.",
      [n("BC =", 7, "cm")],
      "Aturan kosinus: BC^{2} = 25 + 64 − 2(5)(8) cos 60° = 89 − 40 = 49, jadi BC = 7 cm.",
      { scene: fig(triSAS("ABC", 5, 60, 8), { polys: ["ABC"], sides: { AB: "5", AC: "8" }, angles: { A: "60°" } }) }),
    q(2, "Pada gambar, ruas DB dan EC berpotongan di A. Keliling ΔABC adalah 135 m. Apakah ΔABC kongruen dengan ΔADE?",
      [n("x =", 45), ch("Kriteria:", ["Sisi-Sisi-Sisi", "Sisi-Sudut-Sisi", "Tidak kongruen"], "Sisi-Sudut-Sisi")],
      "(x + 7) + x + (x − 7) = 135, jadi 3x = 135 dan x = 45. AB = 52 = AD dan AC = 45 = AE. ∠BAC = ∠DAE (bertolak belakang). Jadi ΔABC ≅ ΔADE (Sisi-Sudut-Sisi).",
      { scene: crossFig(45, 52, "x + 7", "x", "x − 7") }),
    q(2, "Sebuah segitiga memiliki sisi 3 cm, 5 cm, dan 7 cm. Tentukan sudut terbesarnya dengan aturan kosinus.",
      [n("Sudut terbesar =", 120, "°")],
      "Sudut terbesar berada di depan sisi 7: cos θ = {(9 + 25 − 49)/(2 × 3 × 5)} = {−15/30} = −{1/2}, jadi θ = 120°.",
      { scene: fig(triSSS("PQR", 5, 7, 3), { polys: ["PQR"], sides: { PQ: "5", QR: "7", RP: "3" } }) }),
  ],
  [
    q(3, "Diketahui SE ≅ SU dan ∠E ≅ ∠U. Tunjukkan MS ≅ OS. Lengkapi alasan setiap pernyataan. (Masalah 4.1.3)",
      [cls(["Diketahui", "Sudut bertolak belakang", "Konjektur Sudut-Sisi-Sudut", "Definisi kekongruenan segibanyak"],
        ["1. SE ≅ SU", "Diketahui"], ["2. ∠E ≅ ∠U", "Diketahui"], ["3. ∠1 ≅ ∠2", "Sudut bertolak belakang"], ["4. ΔMSE ≅ ΔOSU", "Konjektur Sudut-Sisi-Sudut"], ["5. MS ≅ OS", "Definisi kekongruenan segibanyak"])],
      "Dua garis berpotongan di S membentuk ∠1 dan ∠2 bertolak belakang. Sudut E, sisi SE, dan sudut 1 bersesuaian dengan sudut U, sisi SU, dan sudut 2, jadi Sd-S-Sd. Sisi lain yang bersesuaian sama karena definisi kekongruenan.",
      { scene: fig(bow, { segs: [["M", "O"], ["M", "U"], ["O", "E"], ["M", "E"], ["O", "U"]], ticks: { SE: 1, SU: 1 } }) }),
    q(3, "Pada bukti Masalah 4.1.3, pernyataan langkah ke-4 adalah …",
      [ch("Pernyataan ke-4:", ["ΔMSO ≅ ΔESU", "ΔMSE ≅ ΔOSU", "ΔMEO ≅ ΔOUM"], "ΔMSE ≅ ΔOSU")],
      "Unsur yang dipakai: ∠E, SE, ∠1 pada ΔMSE dan ∠U, SU, ∠2 pada ΔOSU. Jadi ΔMSE ≅ ΔOSU dengan M ↔ O, S ↔ S, E ↔ U."),
    q(3, "I adalah titik tengah CM dan juga titik tengah BL. Tunjukkan CL ≅ MB. Lengkapi alasannya. (Masalah 4.1.4)",
      [cls(["Diketahui", "Definisi titik tengah", "Sudut bertolak belakang", "Konjektur Sisi-Sudut-Sisi"],
        ["I titik tengah BL", "Diketahui"], ["IL ≅ IB", "Definisi titik tengah"], ["∠1 ≅ ∠2", "Sudut bertolak belakang"], ["ΔCIL ≅ ΔMIB", "Konjektur Sisi-Sudut-Sisi"])],
      "Titik tengah membagi ruas menjadi dua bagian sama panjang: CI ≅ IM dan IL ≅ IB. Sudut di I bertolak belakang dan diapit kedua pasang sisi itu, jadi S-Sd-S.",
      { scene: fig(bowtie, { segs: [["C", "M"], ["L", "B"], ["C", "L"], ["B", "M"]] }) }),
    q(3, "Tentukan benar atau salah setiap definisi berikut.",
      [tf(["Garis berat menghubungkan titik sudut dengan titik tengah sisi di depannya.", true], ["Garis tinggi selalu membagi sudut menjadi dua sama besar.", false], ["Sudut-sudut bertolak belakang sama besar.", true], ["Titik tengah membagi ruas garis menjadi dua ruas yang kongruen.", true])],
      "Garis tinggi tegak lurus sisi di depannya; yang membagi sudut sama besar adalah garis bagi."),
  ],
  [
    q(4, "Tentukan apakah bayangan setiap transformasi berikut kongruen dengan bangun asalnya.",
      [cls(["Kongruen", "Tidak kongruen"], ["Pergeseran (x, y) → (x + 5, y − 1)", "Kongruen"], ["Rotasi 120° terhadap titik E", "Kongruen"], ["Dilatasi dengan faktor skala 2", "Tidak kongruen"], ["Pencerminan terhadap sumbu y", "Kongruen"])],
      "Pergeseran, rotasi, dan pencerminan tidak mengubah ukuran. Dilatasi faktor 2 menggandakan setiap sisi."),
    q(4, "Titik A(1, 4) dan B(5, 1) digeser dengan aturan (x, y) → (x + 3, y − 2).",
      [row("Bayangan A'", ["x", "y"], [4, 2]), row("Panjang", ["AB", "A'B'"], [5, 5])],
      "A'(1 + 3, 4 − 2) = (4, 2), B'(8, −1). AB = √{16 + 9} = 5 dan A'B' = √{16 + 9} = 5.",
      { scene: { type: "plane", range: [-1, 9, -2, 6], shapes: [{ pts: [[1, 4], [5, 1]], names: ["A", "B"], color: "green" }, { pts: [[4, 2], [8, -1]], names: ["A'", "B'"], color: "blue" }] } }),
    q(4, "Segitiga PQR dengan P(1, 1), Q(4, 1), dan R(1, 3) dicerminkan terhadap sumbu y.",
      [row("Bayangan Q'", ["x", "y"], [-4, 1]), row("Bayangan R'", ["x", "y"], [-1, 3])],
      "Pencerminan terhadap sumbu y: (x, y) → (−x, y). Q' = (−4, 1), R' = (−1, 3). Bayangannya kongruen dengan PQR.",
      { scene: { type: "plane", range: [-5, 5, -1, 4], shapes: [{ pts: [[1, 1], [4, 1], [1, 3]], names: ["P", "Q", "R"], color: "green" }] } }),
    q(4, "Jajargenjang ABCD dengan A(0, 0), B(4, 0), C(6, 6), D(2, 6) direlokasi dengan aturan (x, y) → ({1/2}x, {1/2}y). (Masalah 4.1.7)",
      [ch("Apakah A'B'C'D' kongruen dengan ABCD?", ["Ya", "Tidak"], "Tidak"), ratio("Keliling ABCD : keliling A'B'C'D' =", 2, 1), ratio("Luas ABCD : luas A'B'C'D' =", 4, 1)],
      "Setiap sisi menjadi setengahnya, jadi tidak kongruen. Rasio keliling 2 : 1. Luas ABCD = 4 × 6 = 24 dan luas bayangan = 2 × 3 = 6, jadi 4 : 1.",
      { scene: { type: "plane", range: [-1, 7, -1, 7], shapes: [{ pts: [[0, 0], [4, 0], [6, 6], [2, 6]], names: ["A", "B", "C", "D"], color: "green" }] } }),
  ],
  [
    q(5, "Trapesium ABCD dengan AB = 9 cm, BC = 6 cm, CD = 7,5 cm, DA = 6 cm, dan trapesium EFGH dengan EF = 12 cm, FG = 8 cm, GH = 10 cm, HE = 8 cm. Sudut yang bersesuaian sama besar.",
      [ratio("Rasio EF : AB =", 4, 3), ch("Kedua trapesium:", ["Sebangun", "Tidak sebangun", "Kongruen"], "Sebangun")],
      "{12/9} = {8/6} = {10/7,5} = {8/6} = {4/3}. Semua rasio sama dan sudut sama, jadi sebangun.",
      { scene: { type: "grid", head: ["Sisi", "ABCD", "EFGH"], rows: [["AB ↔ EF", "9", "12"], ["BC ↔ FG", "6", "8"], ["CD ↔ GH", "7,5", "10"], ["DA ↔ HE", "6", "8"]] } }),
    q(5, "Foto berukuran 4 cm × 6 cm diperbesar sehingga sebangun dengan foto asli. Lebar foto baru 10 cm.",
      [n("Panjang foto baru =", 15, "cm")],
      "Faktor skala {10/4} = 2,5. Panjang = 2,5 × 6 = 15 cm."),
    q(5, "Tentukan benar atau salah pernyataan berikut.",
      [tf(["Semua persegi sebangun.", true], ["Semua persegi panjang sebangun.", false], ["Semua segitiga sama sisi sebangun.", true], ["Dua belah ketupat dengan sisi sama panjang pasti sebangun.", false])],
      "Persegi dan segitiga sama sisi memiliki sudut tetap dan rasio sisi sama. Persegi panjang bisa berbeda rasio panjang dan lebar. Belah ketupat bisa berbeda sudut."),
    q(5, "Tentukan apakah setiap pasangan persegi panjang berikut sebangun.",
      [cls(["Sebangun", "Tidak sebangun"], ["3 cm × 5 cm dan 6 cm × 10 cm", "Sebangun"], ["3 cm × 5 cm dan 5 cm × 7 cm", "Tidak sebangun"], ["8 cm × 12 cm dan 2 cm × 3 cm", "Sebangun"], ["4 cm × 6 cm dan 6 cm × 8 cm", "Tidak sebangun"])],
      "Bandingkan rasio panjang dan lebar: {6/3} = {10/5}; {5/3} ≠ {7/5}; {2/8} = {3/12}; {6/4} ≠ {8/6}."),
  ],
  [
    q(6, "Tentukan apakah setiap pasangan segitiga berikut pasti sebangun, dan kriterianya.",
      [cls(["Sudut-Sudut", "Sisi-Sudut-Sisi", "Sisi-Sisi-Sisi", "Belum tentu"],
        ["∠A = ∠D = 48° dan ∠B = ∠E = 90°", "Sudut-Sudut"], ["AB : DE = AC : DF = 1 : 2 dan ∠A = ∠D", "Sisi-Sudut-Sisi"], ["AB : DE = BC : EF = CA : FD = 2 : 3", "Sisi-Sisi-Sisi"], ["AB : DE = BC : EF = 1 : 2 dan ∠A = ∠D", "Belum tentu"])],
      "Pada baris terakhir sudut A tidak diapit sisi AB dan BC, sehingga belum tentu sebangun (seperti segitiga GWB dan JFK di buku)."),
    q(6, "ΔABC ~ ΔPQR dengan AB = 10 cm, BC = 6 cm, AC = 12 cm, dan PQ = 15 cm.",
      [row("Panjang", ["QR (cm)", "PR (cm)"], [9, 18])],
      "Faktor skala {15/10} = {3/2}. QR = {3/2} × 6 = 9 cm, PR = {3/2} × 12 = 18 cm.",
      { scene: { type: "multi", items: [fig(triSSS("ABC", 10, 6, 12), { polys: ["ABC"], sides: { AB: "10", BC: "6", CA: "12" } }), fig(triSSS("PQR", 15, 9, 18), { polys: ["PQR"], sides: { PQ: "15" } })] } }),
    q(6, "Pada ΔABC, ruas DE sejajar BC dengan D pada AB dan E pada AC. AD = 8 cm, DB = 4 cm, AE = 2x + 4 cm, EC = 3x − 4 cm, dan ∠B = 90°. (Masalah 4.2.2)",
      [n("x =", 3), n("BC =", 9, "cm")],
      "{AD/AB} = {AE/AC}: {8/12} = {(2x + 4)/(5x)}, sehingga 40x = 24x + 48 dan x = 3. AE = 10, AC = 15. ∠ADE = ∠B = 90°, jadi DE = √{10^{2} − 8^{2}} = 6. BC = DE × {AB/AD} = 6 × {12/8} = 9 cm.",
      { scene: fig({ A: [0, 12], B: [0, 0], C: [9, 0], D: [0, 4], E: [6, 4] }, { polys: ["ABC"], segs: [["D", "E"]], sides: { AD: "8", DB: "4" }, right: ["ABC"] }) }),
    q(6, "Segitiga AUL dengan AU = 36, UL = 30, ∠U = 65°, dan segitiga MST dengan MS = 27, ST = 24, ∠S = 65°.",
      [ratio("AU : MS =", 4, 3), ratio("UL : ST =", 5, 4), ch("Kedua segitiga:", ["Sebangun", "Tidak sebangun"], "Tidak sebangun")],
      "{36/27} = {4/3} dan {30/24} = {5/4}. Rasio sisi apit tidak sama, jadi tidak sebangun walaupun sudutnya sama.",
      { scene: { type: "multi", items: [fig(triSAS("UAL", 36, 65, 30), { polys: ["UAL"], sides: { UA: "36", UL: "30" }, angles: { U: "65°" } }), fig(triSAS("SMT", 27, 65, 24), { polys: ["SMT"], sides: { SM: "27", ST: "24" }, angles: { S: "65°" } })] } }),
  ],
  [
    q(7, "Segitiga ABC dengan A(2, 1), B(4, 1), dan C(2, 5) didilatasi dengan pusat O(0, 0) dan faktor skala 3.",
      [row("Bayangan C'", ["x", "y"], [6, 15]), ratio("Luas ABC : luas A'B'C' =", 1, 9)],
      "Dilatasi k = 3: (x, y) → (3x, 3y), jadi C' = (6, 15). Rasio luas 1 : 3^{2} = 1 : 9.",
      { scene: { type: "plane", range: [-1, 13, -1, 16], shapes: [{ pts: [[2, 1], [4, 1], [2, 5]], names: ["A", "B", "C"], color: "green" }] } }),
    q(7, "Tentukan benar atau salah pernyataan tentang kekongruenan, kesebangunan, dan transformasi berikut.",
      [tf(["Setiap dua bangun yang kongruen pasti sebangun.", true], ["Setiap dua bangun yang sebangun pasti kongruen.", false], ["Dilatasi dengan faktor skala −2 menghasilkan bangun yang sebangun.", true], ["Rotasi mengubah besar sudut bangun.", false])],
      "Kongruen adalah sebangun dengan faktor skala 1. Dilatasi negatif membalik bangun tetapi tetap sebangun. Rotasi tidak mengubah sudut maupun sisi."),
    q(7, "Persegi ABCD memiliki luas 16 cm^{2}. Tentukan sisi dan luas bangun hasil transformasi berikut. (Masalah 4.2.4)",
      [row("Dilatasi skala 3", ["sisi (cm)", "luas (cm²)"], [12, 144]), row("Rotasi 30° di titik A", ["sisi (cm)", "luas (cm²)"], [4, 16])],
      "Sisi awal √{16} = 4 cm. Dilatasi k = 3: sisi 12 cm, luas 144 cm^{2}. Rotasi tidak mengubah ukuran: sisi 4 cm, luas 16 cm^{2}."),
    q(7, "Persegi panjang dengan keliling 36 cm dan luas 80 cm^{2} didilatasi dengan faktor skala {1/2}.",
      [row("Bayangan", ["keliling (cm)", "luas (cm²)"], [18, 20])],
      "Keliling × {1/2} = 18 cm. Luas × ({1/2})^{2} = 80 × {1/4} = 20 cm^{2}."),
  ],
  [
    q(8, "ΔABC ~ ΔDEF dengan AB = 8 cm dan DE = 12 cm. Garis tinggi CK pada ΔABC panjangnya 6 cm.",
      [n("Garis tinggi FP =", 9, "cm")],
      "Faktor skala {12/8} = {3/2}. Garis tinggi yang bersesuaian: FP = {3/2} × 6 = 9 cm."),
    q(8, "Dua segitiga sebangun dengan rasio sisi 2 : 5. Garis berat pada segitiga kecil panjangnya 10 cm.",
      [n("Garis berat yang bersesuaian pada segitiga besar =", 25, "cm")],
      "Garis berat yang bersesuaian memiliki rasio yang sama dengan sisi: 10 × {5/2} = 25 cm."),
    q(8, "Rasio panjang sisi-sisi yang bersesuaian dari dua segitiga sebangun adalah 3 : 4. (Masalah 4.2.5)",
      [ratio("Rasio luas =", 9, 16)],
      "Rasio luas adalah kuadrat rasio sisi: 3^{2} : 4^{2} = 9 : 16."),
    q(8, "Segitiga TMR siku-siku di M dengan TM = 40, RM = 30, dan TR = 50. Garis tinggi MH tegak lurus TR, RH = x, TH = y, dan MH = h.",
      [row("Nilai", ["x", "y", "h"], [18, 32, 24])],
      "ΔTMR ~ ΔTHM ~ ΔMHR. h = {40 × 30/50} = 24, x = {30^{2}/50} = 18, y = {40^{2}/50} = 32.",
      { scene: fig({ T: [0, 0], M: [40, 0], R: [40, 30], H: [25.6, 19.2] }, { polys: ["TMR"], segs: [["M", "H", "dash"]], sides: { TM: "40", MR: "30" }, right: ["TMR", "MHR"] }) }),
  ],
];

/* ---------- Evaluasi ---------- */
const S = "Sedang", Mn = "Menantang", SM = "Sangat menantang";
const lvl = (level: Level, x: PQuestion): PQuestion => ({ ...x, level });
export const assessment: PQuestion[] = [
  lvl(S, q(0, "Diketahui ΔDEF ↔ ΔNLM. Hubungkan setiap sisi ΔDEF dengan sisi pasangannya.",
    [match("Pasangan sisi:", ["DE", "EF", "FD"], ["LM", "MN", "NL"], ["NL", "LM", "MN"])],
    "D ↔ N, E ↔ L, F ↔ M. Jadi DE ↔ NL, EF ↔ LM, dan FD ↔ MN.",
    { scene: { type: "multi", items: [fig(triSSS("DEF", 6, 5, 4), { polys: ["DEF"] }), fig(move(triSSS("NLM", 6, 5, 4), 0, 0, { rot: 200 }), { polys: ["NLM"] })] } })),
  lvl(S, q(5, "Layar televisi berukuran 32 cm × 18 cm. Layar lain sebangun dengannya memiliki panjang 48 cm.",
    [n("Lebar layar kedua =", 27, "cm")],
    "Faktor skala {48/32} = {3/2}. Lebar = {3/2} × 18 = 27 cm.")),
  lvl(S, q(1, "Segiempat ABCD ≅ PQRS. Diketahui AB = 11 cm, CD = 8 cm, ∠A = 80°, dan ∠D = 95°.",
    [row("Ukuran", ["PQ (cm)", "RS (cm)", "∠S (°)"], [11, 8, 95])],
    "A ↔ P, B ↔ Q, C ↔ R, D ↔ S. PQ = AB = 11, RS = CD = 8, ∠S = ∠D = 95°.",
    { scene: fig({ ...quadA, ...move(quadA, 7.2, -0.2, { flip: true, rename: { A: "P", B: "Q", C: "R", D: "S" } }) }, { polys: ["ABCD", "PQRS"], sides: { AB: "11", CD: "8" }, caption: "Gambar tidak sesuai skala" }) })),
  lvl(S, q(6, "Sebuah tongkat setinggi 2 m membentuk bayangan 1,5 m. Pada saat yang sama, bayangan sebuah gedung 18 m.",
    [n("Tinggi gedung =", 24, "m")],
    "Sinar matahari membentuk sudut yang sama, jadi segitiga tongkat dan gedung sebangun (Sd-Sd). Tinggi = {2 × 18/1,5} = 24 m.",
    { scene: { type: "shadow", stick: 2, stickShadow: 1.5, objShadow: 18, object: "gedung", unit: "m", caption: "Tongkat dan gedung pada saat yang sama" } })),
  lvl(S, q(2, "Tentukan kriteria yang membuat ΔPQR ≅ ΔXYZ pada setiap data berikut.",
    [cls(CRIT, ["PQ = XY = 7, ∠Q = ∠Y = 50°, QR = YZ = 9", "Sisi-Sudut-Sisi"], ["∠P = ∠X = 40°, ∠R = ∠Z = 75°, PR = XZ = 6", "Sudut-Sisi-Sudut"], ["PQ = XY = 5, QR = YZ = 6, RP = ZX = 8", "Sisi-Sisi-Sisi"], ["PQ = XY = 5, QR = YZ = 6, ∠P = ∠X = 70°", "Tidak cukup"])],
    "Sudut Q diapit PQ dan QR (S-Sd-S). PR terletak di antara ∠P dan ∠R (Sd-S-Sd). Tiga sisi (S-S-S). ∠P tidak diapit PQ dan QR, jadi belum cukup.")),
  lvl(S, q(7, "Rasio keliling dua jajargenjang yang sebangun adalah 3 : 7.",
    [ratio("Rasio luasnya =", 9, 49)],
    "Rasio sisi sama dengan rasio keliling, 3 : 7. Rasio luas 3^{2} : 7^{2} = 9 : 49.")),
  lvl(S, q(4, "Tentukan apakah bayangan setiap transformasi berikut kongruen dengan segitiga asalnya.",
    [cls(["Kongruen", "Tidak kongruen"], ["Dilatasi dengan faktor skala {1/3}", "Tidak kongruen"], ["Rotasi 60° berlawanan arah jarum jam", "Kongruen"], ["Pergeseran (x, y) → (x − 4, y + 2)", "Kongruen"], ["Dilatasi dengan faktor skala −1", "Kongruen"])],
    "Dilatasi {1/3} mengecilkan sisi. Rotasi dan pergeseran tidak mengubah ukuran. Dilatasi −1 sama dengan rotasi 180° terhadap pusat, ukurannya tetap.")),
  lvl(S, q(8, "ΔABC ~ ΔDEF dengan AB = 6 cm dan DE = 15 cm. Garis tinggi CK pada ΔABC panjangnya 4 cm.",
    [n("Garis tinggi FP =", 10, "cm")],
    "Faktor skala {15/6} = {5/2}. FP = {5/2} × 4 = 10 cm.")),
  lvl(Mn, q(3, "Segitiga ABC sama kaki dengan AB = AC, dan D titik tengah BC. Tunjukkan bahwa AD juga garis tinggi. Lengkapi alasannya. (Masalah 4.1.5)",
    [cls(["Diketahui", "Definisi titik tengah", "Sisi yang sama", "Konjektur Sisi-Sisi-Sisi", "Definisi kekongruenan segibanyak"],
      ["AB ≅ AC", "Diketahui"], ["BD ≅ DC", "Definisi titik tengah"], ["AD ≅ AD", "Sisi yang sama"], ["ΔABD ≅ ΔACD", "Konjektur Sisi-Sisi-Sisi"], ["∠ADB ≅ ∠ADC", "Definisi kekongruenan segibanyak"])],
    "Ketiga pasang sisi sama sehingga ΔABD ≅ ΔACD (S-S-S). Akibatnya ∠ADB = ∠ADC, dan karena keduanya berpelurus (jumlahnya 180°), masing-masing 90°, sehingga AD tegak lurus BC.",
    { scene: fig(isoAlt, { polys: ["ABC"], segs: [["A", "D"]], ticks: { AB: 1, AC: 1, BD: 2, DC: 2 } }) })),
  lvl(Mn, q(5, "Segiempat KLMN dan PQRS sebangun dengan KL ↔ PQ. KL = 6 cm, LM = 9 cm, MN = 7,5 cm, NK = 4,5 cm, dan PQ = 8 cm.",
    [row("Panjang", ["QR (cm)", "RS (cm)", "SP (cm)"], [12, 10, 6])],
    "Faktor skala {8/6} = {4/3}. QR = {4/3} × 9 = 12, RS = {4/3} × 7,5 = 10, SP = {4/3} × 4,5 = 6.",
    { scene: { type: "grid", head: ["Sisi KLMN", "Panjang", "Sisi PQRS", "Panjang"], rows: [["KL", "6", "PQ", "8"], ["LM", "9", "QR", "?"], ["MN", "7,5", "RS", "?"], ["NK", "4,5", "SP", "?"]] } })),
  lvl(Mn, q(0, "ΔABC ≅ ΔRPQ dengan AB = 7 cm, BC = 9 cm, dan AC = 10 cm.",
    [row("Panjang", ["RP (cm)", "PQ (cm)", "RQ (cm)"], [7, 9, 10])],
    "Dari urutan huruf: A ↔ R, B ↔ P, C ↔ Q. RP = AB = 7, PQ = BC = 9, RQ = AC = 10.",
    { scene: fig(triSSS("ABC", 7, 9, 10), { polys: ["ABC"], sides: { AB: "7", BC: "9", CA: "10" } }) })),
  lvl(Mn, q(6, "Ruas AE dan BD berpotongan di C dengan AB sejajar DE. Diketahui AC = 24, BC = 30, AB = 21, dan CE = 16.",
    [row("Panjang", ["CD", "DE"], [20, 14])],
    "ΔABC ~ ΔEDC (sudut bertolak belakang di C dan sudut dalam berseberangan sama). Faktor skala {CE/CA} = {16/24} = {2/3}. CD = {2/3} × 30 = 20, DE = {2/3} × 21 = 14.",
    { scene: fig(hourglass, { segs: [["A", "B"], ["A", "E"], ["B", "D"], ["D", "E"]], sides: { AB: "21", AC: "24", BC: "30", CE: "16" } }) })),
  lvl(Mn, q(2, "Segitiga ABC dengan AB = 3 cm, AC = 8 cm, ∠A = 60°, dan segitiga DEF dengan DE = 3 cm, DF = 8 cm, ∠D = 60°.",
    [n("BC =", 7, "cm"), ch("Kedua segitiga:", ["Kongruen (Sisi-Sudut-Sisi)", "Kongruen (Sisi-Sisi-Sisi)", "Tidak kongruen"], "Kongruen (Sisi-Sudut-Sisi)")],
    "BC^{2} = 9 + 64 − 2(3)(8) cos 60° = 73 − 24 = 49, BC = 7. Dua sisi dan sudut apitnya sama: kongruen (S-Sd-S).",
    { scene: { type: "multi", items: [fig(triSAS("ABC", 3, 60, 8), { polys: ["ABC"], sides: { AB: "3", AC: "8" }, angles: { A: "60°" } }), fig(move(triSAS("DEF", 3, 60, 8), 0, 0, { flip: true }), { polys: ["DEF"], sides: { DE: "3", DF: "8" }, angles: { D: "60°" } })] } })),
  lvl(Mn, q(7, "Segitiga ABC dengan A(3, 0), B(6, 2), dan C(6, −4) didilatasi dengan pusat O(0, 0) dan faktor skala 3.",
    [row("Bayangan B'", ["x", "y"], [18, 6]), row("Bayangan C'", ["x", "y"], [18, -12]), ratio("Luas ABC : luas A'B'C' =", 1, 9)],
    "(x, y) → (3x, 3y): B' = (18, 6), C' = (18, −12). Rasio luas 1 : 9.",
    { scene: { type: "plane", range: [-1, 8, -5, 3], shapes: [{ pts: [[3, 0], [6, 2], [6, -4]], names: ["A", "B", "C"], color: "green" }] } })),
  lvl(Mn, q(4, "Titik A(4, 1) dan B(1, 5) dirotasi 90° berlawanan arah jarum jam terhadap O(0, 0).",
    [row("Bayangan A'", ["x", "y"], [-1, 4]), n("Panjang A'B' =", 5)],
    "Rotasi 90°: (x, y) → (−y, x). A' = (−1, 4), B' = (−5, 1). A'B' = √{16 + 9} = 5, sama dengan AB.",
    { scene: { type: "plane", range: [-6, 6, -1, 6], shapes: [{ pts: [[4, 1], [1, 5]], names: ["A", "B"], color: "green" }] } })),
  lvl(Mn, q(8, "Segitiga TMR siku-siku di M dengan TM = 20, RM = 15, dan TR = 25. Garis tinggi MH tegak lurus TR, RH = x, TH = y, dan MH = h.",
    [row("Nilai", ["x", "y", "h"], [9, 16, 12])],
    "h = {20 × 15/25} = 12, x = {15^{2}/25} = 9, y = {20^{2}/25} = 16. Periksa: 9 + 16 = 25.",
    { scene: fig({ T: [0, 0], M: [20, 0], R: [20, 15], H: [12.8, 9.6] }, { polys: ["TMR"], segs: [["M", "H", "dash"]], sides: { TM: "20", MR: "15", TR: "25" }, right: ["TMR", "MHR"] }) })),
  lvl(Mn, q(2, "Pada gambar, ruas DB dan EC berpotongan di A. Keliling ΔABC adalah 108 m.",
    [n("x =", 36), ch("ΔABC dan ΔADE:", ["Kongruen (Sisi-Sudut-Sisi)", "Kongruen (Sudut-Sisi-Sudut)", "Tidak kongruen"], "Kongruen (Sisi-Sudut-Sisi)")],
    "(x + 7) + x + (x − 7) = 108, jadi x = 36. AB = 43 = AD, AC = 36 = AE, dan sudut di A bertolak belakang: kongruen (S-Sd-S).",
    { scene: crossFig(36, 43, "x + 7", "x", "x − 7") })),
  lvl(SM, q(5, "Tentukan apakah setiap pasangan bangun berikut sebangun.",
    [cls(["Sebangun", "Tidak sebangun"], ["Persegi panjang 12 × 16 dan 9 × 12", "Sebangun"], ["Belah ketupat bersisi 5 bersudut 60° dan persegi bersisi 10", "Tidak sebangun"], ["Segitiga 5, 12, 13 dan segitiga 15, 36, 39", "Sebangun"], ["Persegi panjang 5 × 8 dan 8 × 11", "Tidak sebangun"])],
    "{9/12} = {12/16} = {3/4}. Belah ketupat bersudut 60° sedangkan persegi 90°. Segitiga dengan sisi tiga kali (S-S-S). {8/5} ≠ {11/8}.")),
  lvl(SM, q(1, "Segiempat ABCD ≅ PQRS. Diketahui AB = (2x + 1) cm, PQ = (x + 6) cm, ∠B = (3y)°, dan ∠Q = 105°.",
    [row("Nilai", ["x", "y"], [5, 35]), n("AB =", 11, "cm")],
    "AB ↔ PQ: 2x + 1 = x + 6, jadi x = 5 dan AB = 11. ∠B ↔ ∠Q: 3y = 105, jadi y = 35.",
    { scene: fig({ ...quadA, ...move(quadA, 7.2, -0.2, { flip: true, rename: { A: "P", B: "Q", C: "R", D: "S" } }) }, { polys: ["ABCD", "PQRS"], sides: { AB: "2x + 1", PQ: "x + 6" }, angles: { B: "(3y)°", Q: "105°" }, caption: "Gambar tidak sesuai skala" }) })),
  lvl(SM, q(6, "Pada ΔABC, titik D terletak pada AB sehingga ∠BCD = ∠BAC. Diketahui BC = 12 cm, BD = 8 cm, dan CD = 10 cm.",
    [row("Panjang", ["BA (cm)", "AC (cm)"], [18, 15]), ratio("Keliling ΔADC : keliling ΔBDC =", 35, 30)],
    "ΔBDC ~ ΔBCA (sudut B bersama dan ∠BCD = ∠BAC). {BD/BC} = {BC/BA}: BA = {144/8} = 18. {CD/AC} = {BD/BC}: AC = {10 × 12/8} = 15. AD = 18 − 8 = 10. Keliling ADC = 10 + 10 + 15 = 35, keliling BDC = 8 + 10 + 12 = 30, rasio 7 : 6.",
    { scene: fig(bdcFig, { polys: ["ABC"], segs: [["C", "D"]], sides: { BC: "12", BD: "8", DC: "10" } }) })),
  lvl(SM, q(3, "Pada layang-layang ERAC, EC ≅ AC dan ER ≅ AR. Lengkapi alasan untuk menunjukkan ∠E ≅ ∠A.",
    [cls(["Diketahui", "Sisi yang sama", "Konjektur Sisi-Sisi-Sisi", "Definisi kekongruenan segibanyak"],
      ["EC ≅ AC", "Diketahui"], ["RC ≅ RC", "Sisi yang sama"], ["ΔRCE ≅ ΔRCA", "Konjektur Sisi-Sisi-Sisi"], ["∠E ≅ ∠A", "Definisi kekongruenan segibanyak"])],
    "Dua pasang sisi diketahui sama dan RC dipakai bersama, jadi S-S-S. Sudut yang bersesuaian sama menurut definisi kekongruenan.",
    { scene: fig(kite, { polys: ["RECA"], segs: [["R", "C"]], ticks: { EC: 1, AC: 1, ER: 2, AR: 2 } }) })),
  lvl(SM, q(7, "Persegi dengan luas 25 cm^{2} didilatasi dengan faktor skala 3, lalu hasilnya dirotasi 45° terhadap salah satu titik sudutnya.",
    [row("Bangun akhir", ["sisi (cm)", "luas (cm²)"], [15, 225]), ratio("Keliling awal : keliling akhir =", 1, 3)],
    "Sisi awal 5 cm. Dilatasi k = 3: sisi 15 cm, luas 225 cm^{2}. Rotasi tidak mengubah ukuran. Rasio keliling 20 : 60 = 1 : 3.")),
  lvl(SM, q(0, "ΔPQR ≅ ΔXZY dengan ∠P = 50° dan ∠Q = 70°.",
    [row("Besar sudut", ["∠X (°)", "∠Z (°)", "∠Y (°)"], [50, 70, 60])],
    "P ↔ X, Q ↔ Z, R ↔ Y. ∠X = 50°, ∠Z = 70°, dan ∠Y = ∠R = 180° − 50° − 70° = 60°.",
    { scene: { type: "multi", items: [fig(pqr5070, { polys: ["PQR"], angles: { P: "50°", Q: "70°" } }), fig(move(pqr5070, 0, 0, { rot: 150, rename: { P: "X", Q: "Z", R: "Y" } }), { polys: ["XZY"] })] } })),
  lvl(SM, q(8, "Tiga persegi dengan panjang sisi 2, 4, dan 6 diletakkan berdampingan pada satu garis. Titik sudut kiri bawah persegi terkecil dihubungkan dengan titik sudut kanan atas persegi terbesar. Tentukan luas daerah di dalam persegi tengah yang berada di bawah garis itu.",
    [row("Tinggi garis", ["di sisi kiri persegi tengah", "di sisi kanan persegi tengah"], [1, 3]), n("Luas daerah =", 8)],
    "Garis naik 6 satuan sepanjang 12 satuan, jadi kemiringannya {1/2}. Dengan segitiga sebangun, tinggi garis di x = 2 adalah 1 dan di x = 6 adalah 3. Daerahnya trapesium: {(1 + 3)/2} × 4 = 8.",
    { scene: fig({ O: [0, 0], P: [2, 0], Q: [2, 2], R: [0, 2], S: [6, 0], T: [6, 4], U: [2, 4], V: [12, 0], W: [12, 6], X: [6, 6], K: [2, 1], L: [6, 3] }, { polys: ["OPQR", "PSTU", "SVWX"], segs: [["O", "W"]], shade: ["PSLK"], hide: ["K", "L"] }) })),
];
