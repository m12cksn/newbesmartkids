/**
 * Kelas 12 Bab 2 - Statistika
 * (sumber: Buku Siswa Matematika Kelas XII, Bab 2, hlm. 27-82).
 * A. Penyajian Data (Subbab 2.1): distribusi frekuensi, frekuensi kumulatif dan relatif, histogram dan poligon,
 *    ogive, serta membaca grafik dengan cermat.
 * B. Ukuran Pemusatan dan Penyebaran Data Berkelompok (Subbab 2.2): rata-rata, median, modus, simpangan rata-rata,
 *    ragam, dan simpangan baku.
 * Bentuk soal mengikuti buku: melengkapi batas kelas dan frekuensi dari data mentah, mencari kesalahan tabel
 * (Masalah 2.1 no. 1), frekuensi kumulatif "kurang dari" (Masalah 2.1 no. 2), frekuensi relatif (Uji Kompetensi 2),
 * membaca histogram, poligon, dan ogive, grafik yang menyesatkan (Grafik 2.10-2.12), rata-rata, median, dan modus
 * data berkelompok, memilih ukuran pemusatan (Masalah 2.2 no. 3, Uji Kompetensi 7), serta ukuran penyebaran
 * (Masalah 2.2 no. 4-5, Uji Kompetensi 8-10).
 * Ragam memakai pembagi n − 1, sesuai nilai di buku (Contoh 2.15: 212,3; Contoh 2.16: 25,7; Contoh 2.17: 5,09).
 * Catatan: label frekuensi kumulatif pada Grafik 2.9 di buku tertukar dengan Grafik 2.6; peraga ini memakai nilai
 * yang dihitung ulang dari Tabel 2.3.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "").replace(/%$/, "");
  const f = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t);
  if (f) { const a = num(f[1]), b = num(f[2]); return b === 0 ? NaN : a / b; }
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
export const r9 = (x: number) => Math.round(x * 1e9) / 1e9;
export const round = (x: number, dp: number) => Math.round(x * 10 ** dp + 1e-9) / 10 ** dp;

/* ---------- Data berkelompok ---------- */
/** lows: batas bawah kelas (ujung kiri), width: panjang kelas, f: frekuensi, unit: satuan terkecil data (1 atau 0,1). */
export type Dist = { lows: number[]; width: number; f: number[]; unit?: number };
export const unitOf = (d: Dist) => d.unit ?? 1;
export const classesOf = (d: Dist) => d.lows.map(a => [r9(a), r9(a + d.width - unitOf(d))] as [number, number]);
export const boundsOf = (d: Dist) => d.lows.map(a => [r9(a - unitOf(d) / 2), r9(a + d.width - unitOf(d) / 2)] as [number, number]);
export const midsOf = (d: Dist) => classesOf(d).map(([a, b]) => r9((a + b) / 2));
export const nOf = (d: Dist) => d.f.reduce((s, x) => s + x, 0);
export const cumOf = (d: Dist) => d.f.map((_, i) => d.f.slice(0, i + 1).reduce((s, x) => s + x, 0));
export const classText = (d: Dist, i: number) => { const [a, b] = classesOf(d)[i]; return `${idn(a)}–${idn(b)}`; };
export const boundText = (d: Dist, i: number) => { const [a, b] = boundsOf(d)[i]; return `${idn(a)}–${idn(b)}`; };
export const sumFX = (d: Dist) => r9(midsOf(d).reduce((s, x, i) => s + x * d.f[i], 0));
export const meanOf = (d: Dist) => r9(sumFX(d) / nOf(d));
/** Nilai pada letak data ke-k (dipakai untuk median dengan k = n/2). */
export function locate(d: Dist, k: number) {
  const cum = cumOf(d), i = cum.findIndex(c => c >= k), F = i > 0 ? cum[i - 1] : 0, L = boundsOf(d)[i][0];
  return { i, F, L, f: d.f[i], value: r9(L + (d.width * (k - F)) / d.f[i]) };
}
export const medianOf = (d: Dist) => locate(d, nOf(d) / 2).value;
export function modeInfo(d: Dist) {
  const top = Math.max(...d.f), i = d.f.indexOf(top), prev = d.f[i - 1] ?? 0, next = d.f[i + 1] ?? 0, d1 = top - prev, d2 = top - next, L = boundsOf(d)[i][0];
  return { i, L, prev, next, d1, d2, value: r9(L + (d.width * d1) / (d1 + d2)) };
}
export const modeOf = (d: Dist) => modeInfo(d).value;
export const srOf = (d: Dist) => { const m = meanOf(d); return r9(midsOf(d).reduce((s, x, i) => s + d.f[i] * Math.abs(x - m), 0) / nOf(d)); };
/** Ragam sampel (pembagi n − 1) atau populasi (pembagi n). */
export const varOf = (d: Dist, population = false) => { const m = meanOf(d), n = nOf(d); return midsOf(d).reduce((s, x, i) => s + d.f[i] * (x - m) ** 2, 0) / (population ? n : n - 1); };
export const sdOf = (d: Dist, population = false) => Math.sqrt(varOf(d, population));
const fx = (n: number) => idn(round(n, 2));

/* ---------- Gambar ---------- */
export type Col = "kelas" | "batas" | "tengah" | "f" | "fk";
export type Scene =
  | { type: "table"; dist: Dist; cols: Col[]; title?: string; fLabel?: string }
  | { type: "grid"; head: string[]; rows: string[][]; title?: string }
  | { type: "raw"; values: number[]; cols: number; title?: string }
  | { type: "hist"; dist: Dist; show: "bar" | "poly" | "both"; title?: string; xlabel?: string; mark?: number }
  | { type: "ogive"; dist: Dist; title?: string; xlabel?: string; mark?: number }
  | { type: "bars"; cats: string[]; vals: number[]; yMin: number; yMax: number; scale: boolean; title?: string }
  | { type: "multi"; items: Scene[] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; dp?: number }
  | { kind: "row"; label: string; cells: string[]; values: number[]; dp?: number }
  | { kind: "choice"; label: string; options: string[]; answer: string; pics?: Record<string, Scene> }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] };

export type PQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "row" ? p.cells.length : 1);
export const cells = (p: Part, v: string) => { if (fieldCount(p) === 1) return [v ?? ""]; const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const shown = (v: number, dp?: number) => idn(dp === undefined ? v : round(v, dp));
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [shown(p.value, p.dp)];
    case "row": return p.values.map(v => shown(v, p.dp));
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
  }
}
/** Tanpa dp harus tepat; dengan dp boleh menulis nilai yang dibulatkan sampai dp angka di belakang koma. */
export const close = (raw: string, value: number, dp?: number) => {
  const a = num(raw); if (Number.isNaN(a)) return false;
  return dp === undefined ? Math.abs(a - value) <= 1e-9 * Math.max(1, Math.abs(value)) : Math.abs(a - value) <= 0.5 * 10 ** -dp + 1e-9;
};
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return close(v, p.value, p.dp);
    case "row": return p.values.every((val, k) => close(x[k], val, p.dp));
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
      case "row": return `${plain(p.label)} ${p.cells.map((c, k) => `${plain(c)}: ${x[k]}`).join(", ")}`;
      case "choice": return `${plain(p.label)} ${plain(v[i]) || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: number, prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): PQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string, dp?: number): Part => ({ kind: "num", label, value, unit, dp });
/** Ukuran statistik: boleh dibulatkan dua angka di belakang koma. */
const st = (label: string, value: number, unit?: string): Part => ({ kind: "num", label, value, unit, dp: 2 });
const row = (label: string, c: string[], values: number[], dp?: number): Part => ({ kind: "row", label, cells: c, values, dp });
const ch = (label: string, options: string[], answer: string, pics?: Record<string, Scene>): Part => ({ kind: "choice", label, options, answer, pics });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const cls = (options: string[], ...r: [string, string][]): Part => ({ kind: "classify", options, rows: r.map(([text, answer]) => ({ text, answer })) });
const D = (lows: number[], width: number, f: number[], unit?: number): Dist => ({ lows, width, f, unit });
const tab = (dist: Dist, title?: string, cols: Col[] = ["kelas", "f"], fLabel?: string): Scene => ({ type: "table", dist, cols, title, fLabel });
const hist = (dist: Dist, title?: string, xlabel?: string, show: "bar" | "poly" | "both" = "bar"): Scene => ({ type: "hist", dist, show, title, xlabel });

/* ---------- Penjelasan otomatis ---------- */
export const explainMean = (d: Dist) => `Titik tengah kelas: ${midsOf(d).map(idn).join("; ")}. Σfᵢxᵢ = ${midsOf(d).map((x, i) => `${d.f[i]}(${idn(x)})`).join(" + ")} = ${idn(sumFX(d))} dan Σfᵢ = ${nOf(d)}. Rata-rata = {${idn(sumFX(d))}/${nOf(d)}} = ${fx(meanOf(d))}.`;
export function explainMedian(d: Dist) {
  const h = nOf(d) / 2, o = locate(d, h);
  return `{n/2} = {${nOf(d)}/2} = ${idn(h)}. Frekuensi kumulatif: ${cumOf(d).join(", ")}, jadi data ke-${idn(h)} ada di kelas ${classText(d, o.i)}. L = ${idn(o.L)}, F = ${o.F}, f = ${o.f}, p = ${idn(d.width)}. Median = ${idn(o.L)} + ${idn(d.width)} × {(${idn(h)} − ${o.F})/${o.f}} = ${fx(o.value)}.`;
}
export function explainMode(d: Dist) {
  const m = modeInfo(d);
  return `Kelas modus ${classText(d, m.i)} (frekuensi terbesar ${d.f[m.i]}), L = ${idn(m.L)}. d₁ = ${d.f[m.i]} − ${m.prev} = ${m.d1}, d₂ = ${d.f[m.i]} − ${m.next} = ${m.d2}. Modus = ${idn(m.L)} + ${idn(d.width)} × {${m.d1}/(${m.d1} + ${m.d2})} = ${fx(m.value)}.`;
}
export function explainSR(d: Dist) {
  const m = meanOf(d), mids = midsOf(d);
  return `Rata-rata ${fx(m)}. |xᵢ − x̄|: ${mids.map(x => idn(r9(Math.abs(x - m)))).join("; ")}. Σfᵢ|xᵢ − x̄| = ${idn(r9(mids.reduce((s, x, i) => s + d.f[i] * Math.abs(x - m), 0)))}. SR = {${idn(r9(mids.reduce((s, x, i) => s + d.f[i] * Math.abs(x - m), 0)))}/${nOf(d)}} = ${fx(srOf(d))}.`;
}
export function explainVar(d: Dist) {
  const n0 = nOf(d), a = sumFX(d), b = r9(midsOf(d).reduce((s, x, i) => s + d.f[i] * x * x, 0));
  return `Σfᵢ = ${n0}, Σfᵢxᵢ = ${idn(a)}, Σfᵢxᵢ^{2} = ${idn(b)}. Ragam s^{2} = {(${n0} × ${idn(b)} − ${idn(a)}^{2})/(${n0} × ${n0 - 1})} = ${fx(varOf(d))}. Simpangan baku s = √{${fx(varOf(d))}} ≈ ${fx(sdOf(d))}.`;
}

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Penyajian Data", sections: [
    { title: "Distribusi frekuensi", lab: "kelas",
      steps: [
        "Data mentah adalah data yang baru dikumpulkan dan belum diolah, misalnya 80 angka usia yang ditulis berderet. Jika datanya banyak (30 data atau lebih), sulit melihat polanya hanya dengan membaca deretan angka.",
        "Distribusi frekuensi mengelompokkan data ke dalam beberapa kelas. Frekuensi sebuah kelas adalah banyak data yang masuk ke kelas itu. Data yang sudah dikelompokkan disebut data berkelompok.",
        "Langkah 1: cari nilai terkecil dan nilai terbesar, lalu hitung jangkauan R = nilai terbesar − nilai terkecil.",
        "Langkah 2: tentukan banyak kelas k sesuai kebutuhan, umumnya 5 sampai 8 kelas.",
        "Langkah 3: hitung panjang kelas p = {R/k} lalu bulatkan ke atas. Jika hasil baginya tepat bulat, tambahkan 1 supaya nilai terbesar tetap masuk ke kelas terakhir. Semua kelas harus sama panjang.",
        "Langkah 4: mulai kelas pertama dari nilai terkecil. Kelas berikutnya dimulai satu satuan setelah ujung kelas sebelumnya, misalnya 16–19 lalu 20–23. Kelas tidak boleh tumpang tindih dan tidak boleh ada nilai yang terlewat.",
        "Langkah 5: tentukan batas kelas (tepi kelas). Untuk data bilangan bulat, batas bawah = ujung kiri − 0,5 dan batas atas = ujung kanan + 0,5, misalnya kelas 16–19 berbatas 15,5–19,5. Untuk data satu desimal, kurangi atau tambah 0,05.",
        "Langkah 6: hitung frekuensi setiap kelas dengan turus. Jumlah semua frekuensi harus sama dengan banyak data n.",
      ],
      life: "Seorang ibu yang berjualan nasi kuning mencatat berapa menit setiap pembeli menunggu pesanannya selama sebulan. Ada lebih dari 200 angka di bukunya, dan ia hanya merasa \"kadang cepat, kadang lama\". Setelah angka itu dikelompokkan menjadi 0–4 menit, 5–9 menit, 10–14 menit, dan seterusnya, terlihat bahwa kebanyakan pembeli menunggu 5–9 menit, tetapi ada 30 pembeli yang menunggu 15 menit lebih, semuanya pada jam makan siang. Dari tabel sederhana itu ia memutuskan menyiapkan bungkus nasi lebih awal sebelum jam 12. Inilah gunanya distribusi frekuensi: deretan angka yang membingungkan berubah menjadi gambaran yang bisa dipakai untuk mengambil keputusan.",
      example: "Usia 80 pengusaha saat memulai usaha (Contoh 2.1) berkisar dari 16 sampai 40 tahun. Buat distribusi frekuensi dengan 7 kelas.",
      work: [
        "Jangkauan R = 40 − 16 = 24 tahun.",
        "Panjang kelas = {24/7} ≈ 3,4, dibulatkan ke atas menjadi 4.",
        "Kelasnya: 16–19, 20–23, 24–27, 28–31, 32–35, 36–39, 40–43, dengan batas kelas 15,5–19,5, 19,5–23,5, dan seterusnya.",
        "Hitung turus setiap kelas. Frekuensinya 14, 13, 15, 19, 10, 5, 4 dan jumlahnya 80, sama dengan banyak data.",
        "Dari tabel terlihat kelas 28–31 paling banyak, sedangkan kelas 40–43 paling sedikit.",
      ],
      notes: [
        "Panjang kelas = batas atas − batas bawah, misalnya 19,5 − 15,5 = 4, bukan 19 − 16.",
        "Kelas seperti 16–19 lalu 19–22 tumpang tindih: data 19 bisa masuk dua kelas. Ini kesalahan.",
        "Banyak kelas yang berbeda menghasilkan tabel yang berbeda dari data yang sama, jadi sebutkan banyak kelas yang dipakai.",
      ],
      demo: "Ubah banyak kelas untuk data usia 80 pengusaha. Peraga menghitung jangkauan, panjang kelas, batas kelas, dan frekuensi setiap kelas, lalu memeriksa jumlahnya.",
    },
    { title: "Frekuensi kumulatif dan frekuensi relatif", lab: "kumulatif",
      steps: [
        "Frekuensi kumulatif \"kurang dari\" sebuah batas adalah banyak data yang nilainya di bawah batas itu. Caranya: jumlahkan frekuensi semua kelas sebelum batas tersebut.",
        "Batas yang dipakai adalah batas bawah kelas, misalnya \"kurang dari 8,5\" untuk kelas 9–12. Frekuensi kumulatif kurang dari batas bawah kelas pertama selalu 0.",
        "Frekuensi kumulatif kurang dari batas atas kelas terakhir sama dengan banyak data n.",
        "Tabel yang memuat frekuensi kumulatif disebut distribusi frekuensi kumulatif.",
        "Sebaliknya, frekuensi satu kelas bisa diperoleh dari selisih dua frekuensi kumulatif yang berurutan.",
        "Frekuensi relatif sebuah kelas = {frekuensi kelas/n} × 100%. Jumlah semua frekuensi relatif adalah 100%. Tabel ini disebut distribusi frekuensi relatif.",
        "Frekuensi relatif berguna untuk membandingkan dua kelompok yang banyak datanya berbeda.",
      ],
      life: "Sebuah sekolah menerima laporan bahwa 18 siswa kelas A dan 18 siswa kelas B mendapat nilai di bawah KKM. Sekilas keduanya sama buruknya. Ternyata kelas A berisi 24 siswa, sedangkan kelas B berisi 36 siswa. Dengan frekuensi relatif, kelas A punya {18/24} × 100% = 75% siswa di bawah KKM, sedangkan kelas B hanya 50%. Guru pun tahu kelas mana yang perlu bimbingan tambahan lebih dulu. Frekuensi kumulatif bekerja dengan cara serupa: petugas pom bensin bisa langsung menjawab \"berapa mobil yang menghabiskan kurang dari 12,5 liter seminggu\" hanya dengan membaca satu angka di tabel kumulatif.",
      example: "Bensin yang dihabiskan 72 mobil dalam seminggu (Masalah 2.1): kelas 5–8, 9–12, 13–16, 17–20, 21–24, 25–28 dengan frekuensi 5, 8, 7, 15, 21, 16. Berapa mobil yang menghabiskan kurang dari 16,5 liter?",
      work: [
        "Batas 16,5 adalah batas bawah kelas 17–20, jadi jumlahkan tiga kelas pertama.",
        "Kurang dari 4,5: 0. Kurang dari 8,5: 5. Kurang dari 12,5: 5 + 8 = 13. Kurang dari 16,5: 13 + 7 = 20.",
        "Jadi 20 mobil menghabiskan kurang dari 16,5 liter.",
        "Frekuensi relatifnya {20/72} × 100% ≈ 27,78% dari semua mobil.",
      ],
      notes: [
        "Frekuensi kumulatif selalu naik atau tetap, tidak pernah turun.",
        "Pastikan batas yang dipakai adalah batas kelas (… ,5), bukan ujung kelas.",
        "Jumlahkan frekuensi relatif untuk memeriksa hasilnya: harus 100% (bisa 99,99% karena pembulatan).",
      ],
      demo: "Pilih sebuah batas. Peraga menandai kelas-kelas di bawah batas itu, menjumlahkan frekuensinya, dan menuliskan persentasenya dari 72 mobil.",
    },
    { title: "Histogram dan poligon frekuensi", lab: "histogram",
      steps: [
        "Histogram adalah diagram batang untuk data berkelompok. Sumbu mendatar memuat batas kelas, sumbu tegak memuat frekuensi.",
        "Setiap kelas digambar sebagai satu batang yang lebarnya dari batas bawah sampai batas atas kelas, dan tingginya sama dengan frekuensi.",
        "Batang-batang histogram saling menempel karena batas atas satu kelas sama dengan batas bawah kelas berikutnya, misalnya 20,5.",
        "Titik tengah kelas = {(batas bawah + batas atas)/2}, misalnya {(15,5 + 20,5)/2} = 18. Titik tengah mewakili semua data di kelas itu.",
        "Selisih dua titik tengah berurutan sama dengan panjang kelas, jadi jika satu titik tengah diketahui, titik tengah lain mudah dicari.",
        "Poligon frekuensi dibuat dengan menandai titik (titik tengah, frekuensi) setiap kelas lalu menghubungkannya dengan garis lurus. Titik-titik ini tepat di tengah atas setiap batang histogram.",
        "Histogram memudahkan melihat kelas terbanyak dan tersedikit. Poligon memudahkan melihat tren naik atau turun dari kelas ke kelas.",
      ],
      life: "Di posyandu, kader biasanya punya daftar berat badan 30 balita. Daftar angka itu sulit dibaca orang tua. Ketika kader menggambar histogram, orang tua langsung melihat batang paling tinggi ada di 5,35–7,25 kg, dan hanya sedikit balita di batang paling kiri. Jika berat anaknya jatuh di batang paling kiri, mereka tahu anaknya termasuk sedikit balita yang lebih ringan dari kebanyakan teman sebayanya, sehingga perlu bertanya ke petugas kesehatan. Poligon frekuensi dari bulan ke bulan juga bisa ditumpuk dalam satu gambar untuk melihat apakah garisnya bergeser ke kanan, tanda berat badan balita di posyandu itu membaik.",
      example: "Usia 80 pengusaha (Contoh 2.8): kelas 16–20, 21–25, 26–30, 31–35, 36–40 dengan frekuensi 19, 15, 21, 16, 9. Tentukan batang dan titik poligonnya.",
      work: [
        "Batas kelas: 15,5–20,5, 20,5–25,5, 25,5–30,5, 30,5–35,5, 35,5–40,5. Lebar setiap batang 5.",
        "Tinggi batang sama dengan frekuensi: 19, 15, 21, 16, 9.",
        "Titik tengah: 18, 23, 28, 33, 38 (selisihnya 5, sama dengan panjang kelas).",
        "Titik poligon: (18, 19), (23, 15), (28, 21), (33, 16), (38, 9).",
        "Kelas 26–30 tertinggi: pengusaha paling banyak memulai usaha pada usia 26–30 tahun.",
      ],
      notes: [
        "Tinggi batang adalah frekuensi, bukan titik tengah.",
        "Gunakan batas kelas pada sumbu mendatar supaya batang tidak bercelah.",
        "Satu titik tengah cukup untuk mencari yang lain: tambah atau kurangi panjang kelas.",
      ],
      demo: "Ubah frekuensi setiap kelas dan pilih tampilan histogram, poligon, atau keduanya. Perhatikan titik poligon selalu berada di tengah atas batang.",
    },
    { title: "Ogive (grafik frekuensi kumulatif)", lab: "ogive",
      steps: [
        "Ogive adalah grafik frekuensi kumulatif \"kurang dari\". Sumbu mendatar memuat batas kelas, sumbu tegak memuat frekuensi kumulatif.",
        "Titik pertama ogive adalah (batas bawah kelas pertama, 0), karena belum ada data di bawah batas itu.",
        "Titik berikutnya adalah (batas atas setiap kelas, frekuensi kumulatif sampai kelas itu). Titik terakhir tingginya n.",
        "Titik-titik dihubungkan dengan garis lurus, sehingga ogive selalu naik dari kiri ke kanan atau mendatar jika ada kelas berfrekuensi 0.",
        "Frekuensi sebuah kelas = selisih tinggi ogive di batas atas dan batas bawah kelas itu.",
        "Untuk nilai di tengah sebuah kelas, ogive dibaca dengan anggapan data tersebar merata di dalam kelas: di tengah kelas, tambahkan setengah frekuensi kelas itu.",
        "Bagian ogive yang paling curam menunjukkan kelas dengan frekuensi terbesar.",
      ],
      life: "Panitia lomba lari 5 km ingin memberi medali kepada separuh peserta tercepat, tetapi belum tahu batas waktunya. Daripada mengurutkan ratusan catatan waktu satu per satu, panitia menggambar ogive dari tabel waktu tempuh. Mereka menarik garis mendatar dari setengah jumlah peserta di sumbu tegak sampai menyentuh ogive, lalu turun ke sumbu mendatar. Angka di sana, misalnya 34 menit, menjadi batas waktu medali. Cara yang sama dipakai bank untuk menjawab pertanyaan seperti \"berapa nasabah yang saldonya di bawah satu juta rupiah\": cukup baca tinggi ogive di titik satu juta.",
      example: "Nilai ujian 44 siswa (Contoh 2.9): kelas 41–50, 51–60, 61–70, 71–80, 81–90, 91–100 dengan frekuensi 1, 6, 9, 11, 11, 6. Tentukan titik-titik ogivenya.",
      work: [
        "Titik pertama: (40,5; 0).",
        "Frekuensi kumulatif: 1, 7, 16, 27, 38, 44.",
        "Titik ogive: (50,5; 1), (60,5; 7), (70,5; 16), (80,5; 27), (90,5; 38), (100,5; 44).",
        "Banyak siswa bernilai 71–80 = 27 − 16 = 11, sesuai tabel.",
        "Siswa dengan nilai di bawah 75,5 kira-kira 16 + {11/2} = 21,5, atau sekitar 21 sampai 22 siswa.",
      ],
      notes: [
        "Titik ogive diletakkan di batas atas kelas, bukan di titik tengah.",
        "Jangan lupa titik awal dengan frekuensi kumulatif 0.",
        "Hasil membaca ogive di tengah kelas adalah perkiraan.",
      ],
      demo: "Geser garis baca sepanjang sumbu nilai. Peraga menunjukkan tinggi ogive di titik itu, yaitu perkiraan banyak siswa yang nilainya kurang dari angka tersebut.",
    },
    { title: "Membaca grafik dengan cermat", lab: "skala",
      steps: [
        "Grafik dibuat untuk memudahkan pembaca, tetapi grafik yang dibaca sekilas bisa menipu mata. Kesalahpahaman ini disebut statistical misconception.",
        "Perhatikan angka awal sumbu tegak. Jika sumbu tidak dimulai dari 0, perbedaan kecil terlihat sangat besar.",
        "Contoh di buku: kosmetik A, B, C dipilih ulang oleh 83%, 85%, dan 84% pembeli. Dengan sumbu mulai dari 82, batang B tampak tiga kali batang A, padahal selisihnya hanya 2%.",
        "Perbandingan tinggi batang pada gambar = {(nilai B − awal sumbu)/(nilai A − awal sumbu)}. Jika awal sumbu 0, perbandingan tinggi sama dengan perbandingan nilai sebenarnya.",
        "Memotong sumbu tegak bukan hal yang dilarang, tetapi pembaca wajib membaca skalanya sebelum menyimpulkan.",
        "Jika grafik tidak mencantumkan skala sama sekali, yang bisa disimpulkan hanya urutan (siapa lebih tinggi), bukan besar selisihnya.",
        "Biasakan bertanya: apa satuan sumbunya, mulai dari berapa, dan berapa selisih sebenarnya?",
      ],
      life: "Iklan sebuah merek sabun menampilkan grafik batang: batang mereknya menjulang tinggi, sedangkan batang merek pesaing pendek sekali. Penonton yang melihat sekilas mengira sabun itu jauh lebih disukai. Kalau diperhatikan, angka kecil di sumbu tegak dimulai dari 90%, dan nilainya 94% lawan 91%. Selisih sebenarnya hanya 3 poin persen, tetapi gambar membuat batangnya tampak empat kali lebih tinggi. Grafik tidak berbohong soal angka, tetapi cara menggambarnya mengarahkan kesan. Orang yang terbiasa membaca skala tidak mudah terkecoh saat memilih produk, membaca berita pemilu, atau melihat laporan keuangan.",
      example: "Persentase pembeli yang membeli ulang kosmetik A, B, C adalah 83%, 85%, dan 84% (Grafik 2.10). Sumbu tegak dimulai dari 82. Berapa kali tinggi batang B dibandingkan batang A pada gambar?",
      work: [
        "Tinggi batang A pada gambar: 83 − 82 = 1 satuan.",
        "Tinggi batang B pada gambar: 85 − 82 = 3 satuan.",
        "Pada gambar, batang B tampak {3/1} = 3 kali batang A.",
        "Perbandingan sebenarnya {85/83} ≈ 1,02. Selisih sebenarnya hanya 2%.",
      ],
      notes: [
        "Selalu baca angka pada sumbu tegak sebelum membandingkan tinggi batang.",
        "Grafik tanpa skala hanya menunjukkan urutan.",
        "Grafik yang jujur tidak dilarang memotong sumbu, asalkan skalanya terlihat jelas.",
      ],
      demo: "Ubah angka awal sumbu tegak pada grafik penjualan kosmetik, lalu sembunyikan skalanya. Perhatikan perbandingan tinggi batang di gambar berubah, padahal datanya tetap.",
    },
  ] },
  { code: "B", title: "Ukuran Pemusatan dan Penyebaran", sections: [
    { title: "Rata-rata data berkelompok", lab: "rerata",
      steps: [
        "Ukuran pemusatan adalah satu angka yang mewakili pusat data: rata-rata (mean), median, dan modus.",
        "Pada data tunggal, rata-rata = jumlah semua data dibagi banyak data. Pada data berkelompok, nilai asli setiap data tidak diketahui lagi.",
        "Karena itu, setiap data dalam satu kelas dianggap sama dengan titik tengah kelasnya, xᵢ.",
        "Jumlah data di kelas ke-i didekati dengan fᵢ × xᵢ. Contoh: kelas 16–20 dengan 19 data dan titik tengah 18 menyumbang 19 × 18 = 342.",
        "Rata-rata data berkelompok: x̄ = {Σfᵢxᵢ/Σfᵢ}.",
        "Hasilnya adalah perkiraan. Rata-rata data aslinya bisa sedikit berbeda (pada Contoh 2.14, perkiraannya 26,8 tahun).",
        "Rata-rata dari sampel ditulis x̄ (statistik), sedangkan rata-rata seluruh populasi disebut parameter.",
      ],
      life: "Seorang ketua RT ingin tahu rata-rata tagihan listrik warganya untuk mengusulkan program hemat energi. Warga hanya mau menjawab kelompok tagihannya, misalnya \"antara 100 dan 199 ribu\", bukan angka pastinya. Ketua RT menganggap setiap rumah di kelompok itu membayar sekitar titik tengahnya, 149,5 ribu, lalu mengalikan dengan banyak rumah di kelompok itu. Setelah semua kelompok dijumlahkan dan dibagi banyak rumah, ia mendapat rata-rata sekitar 210 ribu. Angkanya mungkin meleset sedikit dari rata-rata sebenarnya, tetapi cukup tepat untuk merencanakan program, dan warga tidak perlu membuka tagihan pribadinya.",
      example: "Usia 50 orang terkaya (Contoh 2.11): kelas 30–34, 35–39, 40–44, 45–49, 50–54 dengan frekuensi 5, 10, 7, 20, 8. Tentukan rata-ratanya.",
      work: [
        "Titik tengah: 32, 37, 42, 47, 52.",
        "fᵢxᵢ: 5 × 32 = 160, 10 × 37 = 370, 7 × 42 = 294, 20 × 47 = 940, 8 × 52 = 416.",
        "Σfᵢxᵢ = 2.180 dan Σfᵢ = 50.",
        "x̄ = {2.180/50} = 43,6 tahun.",
      ],
      notes: [
        "Kalikan frekuensi dengan titik tengah, bukan dengan batas kelas.",
        "Periksa Σfᵢ sama dengan banyak data.",
        "Rata-rata mudah tertarik oleh data yang sangat besar atau sangat kecil.",
      ],
      demo: "Ubah frekuensi setiap kelas usia. Tabel fᵢxᵢ dan rata-ratanya dihitung ulang, dan segitiga di bawah histogram menunjukkan titik seimbang data.",
    },
    { title: "Median data berkelompok", lab: "median",
      steps: [
        "Median adalah nilai tengah data yang sudah urut: separuh data di bawahnya dan separuh di atasnya.",
        "Pada data berkelompok, letak median adalah data ke-{n/2}.",
        "Cari kelas median: kelas pertama yang frekuensi kumulatifnya mencapai {n/2}.",
        "Catat L = batas bawah kelas median, F = jumlah frekuensi kelas-kelas sebelum kelas median, f = frekuensi kelas median, p = panjang kelas.",
        "Median = L + p × {({n/2} − F)/f}.",
        "Artinya: mulai dari batas bawah kelas median, lalu maju sebagian dari panjang kelas, sebanding dengan berapa data lagi yang dibutuhkan ({n/2} − F) dari f data di kelas itu.",
        "Median tidak terpengaruh oleh beberapa data yang sangat besar atau sangat kecil, sehingga cocok untuk data gaji atau harga rumah.",
      ],
      life: "Berita sering menulis \"rata-rata harga rumah di kota ini 2 miliar rupiah\". Padahal di kota itu ada beberapa rumah mewah seharga puluhan miliar yang menarik rata-rata ke atas. Keluarga biasa yang mencari rumah lebih terbantu oleh median: jika median harga rumah 800 juta, berarti separuh rumah yang dijual harganya di bawah 800 juta. Satu rumah mewah tambahan tidak akan menggeser median sejauh itu menggeser rata-rata. Itulah sebabnya laporan gaji dan harga properti yang jujur biasanya menyebut median.",
      example: "Dengan data usia 50 orang terkaya (frekuensi 5, 10, 7, 20, 8), tentukan median.",
      work: [
        "{n/2} = 25. Frekuensi kumulatif: 5, 15, 22, 42, 50.",
        "Frekuensi kumulatif pertama yang mencapai 25 adalah 42, jadi kelas median 45–49.",
        "L = 44,5, F = 22, f = 20, p = 5.",
        "Median = 44,5 + 5 × {(25 − 22)/20} = 44,5 + 0,75 = 45,25 tahun.",
      ],
      notes: [
        "F adalah jumlah frekuensi sebelum kelas median, bukan termasuk kelas median.",
        "L adalah batas bawah (… ,5), bukan ujung kiri kelas.",
        "Cara yang sama bisa menghitung nilai pada letak lain, misalnya data ke-10.",
      ],
      demo: "Ubah letak data yang dicari. Peraga menandai kelas tempat data itu berada, menuliskan L, F, f, dan p, lalu menghitung nilainya. Pada data ke-25 hasilnya adalah median.",
    },
    { title: "Modus dan memilih ukuran pemusatan", lab: "modus",
      steps: [
        "Modus adalah nilai yang paling sering muncul. Pada data berkelompok, modus berada di kelas dengan frekuensi terbesar, yaitu kelas modus.",
        "d₁ = frekuensi kelas modus − frekuensi kelas sebelumnya; d₂ = frekuensi kelas modus − frekuensi kelas sesudahnya.",
        "Modus = L + p × {d₁/(d₁ + d₂)}, dengan L batas bawah kelas modus dan p panjang kelas.",
        "Jika kelas sebelum lebih padat daripada kelas sesudah (d₁ kecil), modus bergeser ke kiri. Jika kelas sesudah lebih padat, modus bergeser ke kanan.",
        "Rata-rata cocok jika data tidak memuat nilai yang sangat ekstrem, misalnya rata-rata banyak anak per keluarga.",
        "Median cocok jika ada nilai ekstrem atau jika ingin membagi data menjadi dua bagian sama banyak.",
        "Modus cocok untuk mengetahui yang paling banyak atau paling umum, termasuk data bukan angka seperti warna atau merek.",
      ],
      life: "Seorang manajer restoran cepat saji berkata \"rata-rata gaji karyawan kami Rp18.000 per jam\", sementara seorang karyawan berkata \"kebanyakan dari kami hanya menerima gaji minimal\". Keduanya bisa jujur (Uji Kompetensi no. 7). Jika ada beberapa manajer dan koki senior bergaji sangat tinggi, rata-rata terangkat ke Rp18.000, padahal modus, yaitu gaji yang paling banyak diterima, tetap gaji minimal. Pemilik toko sepatu juga tidak peduli rata-rata ukuran kaki pembeli 40,3; ia perlu modus, ukuran yang paling sering dibeli, supaya stoknya tidak menumpuk.",
      example: "Dengan data usia 50 orang terkaya (frekuensi 5, 10, 7, 20, 8), tentukan modus.",
      work: [
        "Kelas modus 45–49 dengan frekuensi 20, L = 44,5, p = 5.",
        "d₁ = 20 − 7 = 13 dan d₂ = 20 − 8 = 12.",
        "Modus = 44,5 + 5 × {13/(13 + 12)} = 44,5 + 2,6 = 47,1 tahun.",
        "Bandingkan: rata-rata 43,6, median 45,25, modus 47,1. Banyak orang di kelas tinggi, tetapi beberapa yang lebih muda menarik rata-rata ke bawah.",
      ],
      notes: [
        "Kelas pertama tidak punya kelas sebelumnya: anggap frekuensinya 0. Begitu juga sesudah kelas terakhir.",
        "Modus bisa lebih dari satu jika ada dua kelas sama-sama terbesar.",
        "Pilih ukuran pemusatan sesuai pertanyaan, bukan sesuai yang paling mudah dihitung.",
      ],
      demo: "Ubah frekuensi kelas sebelum dan sesudah kelas modus. Garis silang pada batang tertinggi menunjukkan letak modus bergeser ke arah kelas tetangga yang lebih padat.",
    },
    { title: "Simpangan rata-rata", lab: "simpangan",
      steps: [
        "Ukuran pemusatan saja belum cukup. Dua kelompok bisa punya rata-rata sama, tetapi yang satu datanya rapat di sekitar rata-rata dan yang lain menyebar jauh.",
        "Ukuran penyebaran menjelaskan seberapa jauh data dari rata-ratanya: simpangan rata-rata, ragam, dan simpangan baku.",
        "Simpangan satu kelas terhadap rata-rata adalah |xᵢ − x̄|, jarak titik tengah kelas ke rata-rata. Tanda mutlak dipakai supaya jarak di kiri dan kanan tidak saling menghapus.",
        "Setiap data dalam kelas itu dianggap menyimpang sejauh |xᵢ − x̄|, jadi seluruh kelas menyumbang fᵢ × |xᵢ − x̄|.",
        "Simpangan rata-rata SR = {Σfᵢ|xᵢ − x̄|/Σfᵢ}.",
        "SR kecil berarti data mengumpul dekat rata-rata (seragam, konsisten). SR besar berarti data menyebar.",
        "Langkah kerja: hitung x̄, buat kolom |xᵢ − x̄|, kalikan dengan fᵢ, jumlahkan, lalu bagi dengan n.",
      ],
      life: "Seorang penjual sepatu olahraga tahu rata-rata ukuran sepatu yang laku adalah 40. Kalau ia hanya menyetok ukuran 40, tokonya tidak akan bertahan, karena banyak pembeli berukuran 38, 39, 41, atau 42. Ia perlu tahu seberapa jauh ukuran pembeli menyebar dari 40. Di kota A, simpangan rata-ratanya 0,8, jadi hampir semua pembeli berukuran 39–41. Di kota B, simpangan rata-ratanya 2,1, sehingga ia harus menyiapkan ukuran yang jauh lebih beragam. Rata-rata yang sama, tetapi keputusan stoknya berbeda.",
      example: "Pendapatan netto 45 perusahaan (Contoh 2.15, miliar rupiah): kelas 10–20, 21–31, 32–42, 43–53, 54–64, 65–75 dengan frekuensi 2, 8, 15, 7, 10, 3. Tentukan simpangan rata-ratanya.",
      work: [
        "Titik tengah: 15, 26, 37, 48, 59, 70. Σfᵢxᵢ = 1.929, jadi x̄ = {1.929/45} ≈ 42,87.",
        "|xᵢ − x̄|: 27,87; 16,87; 5,87; 5,13; 16,13; 27,13.",
        "Σfᵢ|xᵢ − x̄| ≈ 55,73 + 134,93 + 88 + 35,93 + 161,33 + 81,4 ≈ 557,33.",
        "SR = {557,33/45} ≈ 12,4 miliar rupiah, sesuai buku.",
      ],
      notes: [
        "Gunakan nilai mutlak; tanpa itu jumlah simpangan selalu mendekati 0.",
        "Satuan SR sama dengan satuan data.",
        "Bandingkan SR hanya untuk data dengan satuan yang sama.",
      ],
      demo: "Pindahkan data dari kelas tengah ke kelas tepi. Rata-rata waktu antar tetap 30 menit, tetapi simpangan rata-ratanya naik karena data makin menyebar.",
    },
    { title: "Ragam dan simpangan baku", lab: "ragam",
      steps: [
        "Ragam (varians) juga mengukur penyebaran, tetapi simpangannya dikuadratkan, bukan dimutlakkan: (xᵢ − x̄)^{2}.",
        "Untuk data sampel, buku memakai pembagi n − 1: s^{2} = {Σfᵢ(xᵢ − x̄)^{2}/(n − 1)}. Nilai ini cocok dengan Contoh 2.15 (212,3), 2.16 (25,7), dan 2.17 (5,09).",
        "Rumus lain yang hasilnya sama dan lebih cepat: s^{2} = {(nΣfᵢxᵢ^{2} − (Σfᵢxᵢ)^{2})/(n(n − 1))}.",
        "Simpangan baku adalah akar kuadrat ragam: s = √{s^{2}}. Sebaliknya, ragam = (simpangan baku)^{2}.",
        "Simpangan baku kembali ke satuan data asli, sehingga lebih mudah dimaknai daripada ragam.",
        "Untuk seluruh populasi, pembaginya n, dan hasilnya sedikit lebih kecil.",
        "Makin kecil simpangan baku, makin konsisten data. Ini dipakai untuk menilai mutu produk, misalnya daya tahan baterai.",
      ],
      life: "Dua pabrik roti sama-sama mengklaim berat rotinya rata-rata 102 gram. Seorang pemilik kafe menimbang 20 roti dari masing-masing pabrik. Roti pabrik P hampir semuanya 100 sampai 104 gram, sedangkan roti pabrik Q banyak yang 95–99 gram dan banyak pula yang 105–109 gram. Simpangan baku pabrik P sekitar 2,8 gram, pabrik Q sekitar 4,3 gram. Pemilik kafe memilih pabrik P karena pelanggannya akan menerima roti yang ukurannya hampir sama setiap hari. Rata-rata memberi tahu \"di mana pusatnya\", simpangan baku memberi tahu \"seberapa bisa diandalkan\".",
      example: "Dengan data pendapatan 45 perusahaan (Contoh 2.15), tentukan ragam dan simpangan baku.",
      work: [
        "Σfᵢ = 45, Σfᵢxᵢ = 1.929, Σfᵢxᵢ^{2} = 92.031.",
        "s^{2} = {(45 × 92.031 − 1.929^{2})/(45 × 44)} = {(4.141.395 − 3.721.041)/1.980} = {420.354/1.980} ≈ 212,3.",
        "s = √{212,3} ≈ 14,57, dibulatkan 14,6 seperti di buku.",
        "Dengan pembagi n (populasi), ragamnya {420.354/2.025} ≈ 207,58, sedikit lebih kecil.",
      ],
      notes: [
        "Ragam bersatuan kuadrat (misalnya jam^{2}), jadi untuk dimaknai gunakan simpangan baku.",
        "Jangan lupa mengkuadratkan Σfᵢxᵢ secara keseluruhan, bukan menjumlahkan kuadratnya.",
        "Tuliskan pembagi yang dipakai (n − 1 atau n) agar hasil bisa diperiksa orang lain.",
      ],
      demo: "Pilih data dari buku dan pilih pembaginya. Tabel xᵢ, fᵢxᵢ, dan fᵢxᵢ^{2} dihitung otomatis, lalu ragam dan simpangan bakunya dibandingkan dengan nilai di buku.",
    },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: `${t.code}.${j + 1}`, topic: t })));

/* ---------- Data dari buku untuk peraga ---------- */
/** Contoh 2.1: usia 80 pengusaha saat memulai usaha. */
export const ages80 = [
  18, 24, 19, 28, 30, 19, 35, 40, 23, 21, 26, 34, 27, 40, 38, 30, 21, 24, 22, 18, 32, 17, 18, 21, 26, 33, 35, 20, 28, 27,
  26, 34, 31, 37, 40, 17, 18, 18, 20, 33, 16, 20, 18, 36, 35, 24, 39, 19, 31, 31, 26, 28, 19, 35, 31, 31, 28, 21, 23, 26,
  20, 24, 24, 29, 30, 30, 26, 29, 28, 20, 19, 28, 30, 32, 38, 40, 25, 25, 31, 21,
];
/** Panjang kelas: R/k dibulatkan ke atas; jika tepat bulat ditambah 1 agar nilai terbesar ikut masuk. */
export const classWidth = (R: number, k: number) => Math.floor(R / k) + 1;
export const groupRaw = (values: number[], start: number, width: number, k: number) => Array.from({ length: k }, (_, i) => values.filter(v => v >= start + i * width && v <= start + (i + 1) * width - 1).length);
export const bookDists = {
  usia: D([16, 21, 26, 31, 36], 5, [19, 15, 21, 16, 9]), // Tabel 2.1
  bensin: D([5, 9, 13, 17, 21, 25], 4, [5, 8, 7, 15, 21, 16]), // Masalah 2.1 no. 2
  nilai: D([41, 51, 61, 71, 81, 91], 10, [1, 6, 9, 11, 11, 6]), // Tabel 2.2
  kaya: D([30, 35, 40, 45, 50], 5, [5, 10, 7, 20, 8]), // Tabel 2.6
  pendapatan: D([10, 21, 32, 43, 54, 65], 11, [2, 8, 15, 7, 10, 3]), // Contoh 2.15
  motor: D([8, 13, 18, 23, 28], 5, [3, 5, 15, 5, 2]), // Contoh 2.16 (batas 7,5-12,5 dst.)
  balita: D([3.5, 5.4, 7.3, 9.2, 11.1], 1.9, [3, 9, 7, 8, 3], 0.1), // Tabel 2.3 / Contoh 2.17
};
export const cosmetics = { cats: ["A", "B", "C"], vals: [83, 85, 84] };

/* ---------- Data soal ---------- */
export const readMinutes = [42, 55, 61, 38, 47, 70, 52, 66, 44, 59, 73, 49, 58, 63, 41, 50, 67, 54, 46, 62, 57, 35, 69, 53, 48, 60, 45, 56, 64, 51];
export const queueMinutes = [12, 25, 31, 18, 22, 40, 27, 15, 33, 29, 21, 36, 24, 19, 28, 45, 26, 14, 30, 23, 38, 17, 26, 32, 20, 43, 27, 24, 35, 22, 29, 31];
const rangeOf = (v: number[]) => Math.max(...v) - Math.min(...v);
const cumGrid = (bounds: number[], cum: number[], title?: string): Scene => ({ type: "grid", head: ["Batas", "Frekuensi kumulatif"], rows: bounds.map((b, i) => [`Kurang dari ${idn(b)}`, String(cum[i])]), title });
const rowsOf = (d: Dist) => d.f.map((_, i) => classText(d, i));

const dA2 = D([6, 11, 16, 21, 26], 5, [4, 9, 15, 8, 4]);
const dA2b = D([50, 60, 70, 80, 90], 10, [7, 15, 28, 19, 11]);
const dA3 = D([11, 16, 21, 26, 31], 5, [3, 8, 12, 10, 5]);
const dA3b = D([41, 46, 51, 56], 5, [6, 10, 7, 3]);
const dA4 = D([20, 30, 40, 50, 60], 10, [2, 7, 13, 10, 4]);
const dA4b = D([1, 4, 7, 10, 13], 3, [6, 10, 14, 7, 3]);
const dA4c = D([5, 10, 15, 20, 25], 5, [3, 9, 14, 8, 6]);
const dB1 = D([5, 10, 15, 20, 25], 5, [6, 10, 14, 7, 3]);
const dB1b = D([61, 66, 71, 76, 81], 5, [2, 7, 11, 6, 4]);
const dB1c = D([60, 70, 80, 90], 10, [4, 10, 10, 6]);
const dB2 = D([45, 51, 57, 63, 69], 6, [6, 12, 15, 11, 6]);
const dB2b = D([31, 36, 41, 46, 51], 5, [3, 8, 13, 10, 6]);
const dB2c = D([20, 30, 40, 50, 60], 10, [5, 9, 12, 7, 3]);
const dB2d = D([2, 5, 8, 11, 14], 3, [5, 8, 10, 4, 3]);
const dB3 = D([40, 50, 60, 70, 80], 10, [5, 11, 17, 9, 3]);
const dB3b = D([151, 156, 161, 166, 171], 5, [4, 10, 13, 12, 6]);
const dB4 = D([10, 15, 20, 25, 30], 5, [2, 5, 6, 5, 2]);
const dB4b = D([1, 6, 11, 16], 5, [3, 7, 7, 3]);
const dB4A = D([3, 8, 13, 18, 23], 5, [1, 4, 10, 4, 1]), dB4B = D([3, 8, 13, 18, 23], 5, [5, 3, 4, 3, 5]);
const dB4c = D([0, 4, 8, 12, 16], 4, [2, 6, 8, 3, 1]);
const dB5 = D([0, 5, 10, 15], 5, [2, 3, 3, 2]);
const dB5P = D([95, 100, 105], 5, [3, 14, 3]), dB5Q = D([95, 100, 105], 5, [7, 6, 7]);

export const practice: PQuestion[][] = [
  [
    q(0, "Lama membaca buku (menit) 30 siswa dalam sehari tercatat seperti di tabel. Data akan dibuat menjadi 5 kelas.",
      [n("Nilai terkecil =", Math.min(...readMinutes)), n("Nilai terbesar =", Math.max(...readMinutes)), n("Jangkauan =", rangeOf(readMinutes)), n("Panjang kelas =", classWidth(rangeOf(readMinutes), 5))],
      `R = ${Math.max(...readMinutes)} − ${Math.min(...readMinutes)} = ${rangeOf(readMinutes)}. Panjang kelas = {${rangeOf(readMinutes)}/5} = ${idn(rangeOf(readMinutes) / 5)}, dibulatkan ke atas menjadi ${classWidth(rangeOf(readMinutes), 5)}.`,
      { scene: { type: "raw", values: readMinutes, cols: 10, title: "Lama membaca (menit)" } }),
    q(0, "Data lama membaca 30 siswa tadi dikelompokkan ke kelas 35–42, 43–50, 51–58, 59–66, dan 67–74. Tentukan frekuensi setiap kelas.",
      [row("Frekuensi", ["35–42", "43–50", "51–58", "59–66", "67–74"], groupRaw(readMinutes, 35, 8, 5))],
      `Hitung turus setiap kelas: ${groupRaw(readMinutes, 35, 8, 5).join(", ")}. Jumlahnya 30, sama dengan banyak data.`,
      { scene: { type: "raw", values: readMinutes, cols: 10, title: "Lama membaca (menit)" } }),
    q(0, "Berat bayi baru lahir (kg) di sebuah rumah sakit dikelompokkan seperti tabel. Lengkapi keterangan kelas 3,0–3,4.",
      [row("Kelas 3,0–3,4", ["Batas bawah", "Batas atas", "Titik tengah", "Panjang kelas"], [2.95, 3.45, 3.2, 0.5])],
      "Data dicatat sampai satu desimal, jadi batas kelas diperoleh dengan mengurangi dan menambah 0,05: 2,95 dan 3,45. Titik tengah {(3,0 + 3,4)/2} = 3,2. Panjang kelas 3,45 − 2,95 = 0,5.",
      { scene: tab(D([2.5, 3.0, 3.5, 4.0], 0.5, [6, 14, 9, 3], 0.1), "Berat bayi (kg)") }),
    q(0, "Tabel distribusi frekuensi berikut disusun oleh seorang siswa. Apa kesalahannya?",
      [ch("Kesalahan:", ["Panjang kelas tidak sama", "Kelas 25–29 dan 29–33 tumpang tindih", "Ada kelas berfrekuensi 0"], "Kelas 25–29 dan 29–33 tumpang tindih")],
      "Data 29 bisa masuk ke kelas 25–29 dan 29–33 sekaligus. Kelas berikutnya seharusnya 30–34. Semua kelas panjangnya 5, dan frekuensi 0 bukan kesalahan.",
      { scene: { type: "grid", head: ["Kelas", "Frekuensi"], rows: [["20–24", "3"], ["25–29", "7"], ["29–33", "9"], ["34–38", "0"], ["39–43", "2"]] } }),
  ],
  [
    q(1, "Pemakaian kuota internet (GB) 40 pelanggan dalam sebulan disajikan pada tabel. Lengkapi frekuensi kumulatif \"kurang dari\".",
      [row("Frekuensi kumulatif", ["Kurang dari 10,5", "Kurang dari 15,5", "Kurang dari 20,5", "Kurang dari 25,5"], cumOf(dA2).slice(0, 4))],
      `Jumlahkan frekuensi dari kelas pertama: ${cumOf(dA2).slice(0, 4).join(", ")}.`, { scene: tab(dA2, "Kuota internet (GB)") }),
    q(1, "Dengan data kuota internet 40 pelanggan yang sama, tentukan frekuensi relatif kelas 16–20 dan kelas 6–10.",
      [n("Kelas 16–20 =", 37.5, "%"), n("Kelas 6–10 =", 10, "%")],
      "Kelas 16–20: {15/40} × 100% = 37,5%. Kelas 6–10: {4/40} × 100% = 10%.", { scene: tab(dA2, "Kuota internet (GB)") }),
    q(1, "Nilai tes 80 pendaftar beasiswa disajikan pada tabel. Pendaftar dengan nilai di atas 79 lolos ke tahap wawancara.",
      [n("Banyak yang lolos =", 30, "orang"), n("Persentasenya =", 37.5, "%")],
      "Nilai di atas 79 berarti kelas 80–89 dan 90–99: 19 + 11 = 30 orang, yaitu {30/80} × 100% = 37,5%.", { scene: tab(dA2b, "Nilai tes beasiswa") }),
    q(1, "Tabel frekuensi kumulatif \"kurang dari\" berikut menyajikan lama perjalanan (menit) 50 karyawan. Tentukan frekuensi setiap kelas 10–19, 20–29, 30–39, 40–49, 50–59.",
      [row("Frekuensi", ["10–19", "20–29", "30–39", "40–49", "50–59"], [5, 12, 18, 9, 6])],
      "Frekuensi kelas = selisih dua frekuensi kumulatif berurutan: 5 − 0, 17 − 5, 35 − 17, 44 − 35, 50 − 44, yaitu 5, 12, 18, 9, 6.",
      { scene: cumGrid([9.5, 19.5, 29.5, 39.5, 49.5, 59.5], [0, 5, 17, 35, 44, 50], "Lama perjalanan (menit)") }),
  ],
  [
    q(2, "Histogram berikut menyajikan tinggi 38 tanaman cabai (cm) setelah satu bulan.",
      [n("Titik tengah kelas ketiga =", 23, "cm"), ch("Batang tertinggi berada pada batas", ["15,5–20,5", "25,5–30,5", "20,5–25,5"], "20,5–25,5")],
      "Kelas ketiga 20,5–25,5 bertitik tengah {(20,5 + 25,5)/2} = 23 dan frekuensinya 12, paling tinggi.", { scene: hist(dA3, "Tinggi tanaman cabai", "Tinggi (cm)") }),
    q(2, "Histogram mana yang sesuai dengan tabel distribusi frekuensi berikut?",
      [ch("Pilih histogram:", ["Histogram P", "Histogram Q", "Histogram R"], "Histogram P", { "Histogram P": hist(dA3b), "Histogram Q": hist(D([41, 46, 51, 56], 5, [10, 6, 7, 3])), "Histogram R": hist(D([41, 46, 51, 56], 5, [6, 7, 10, 3])) })],
      "Tinggi batang berurutan harus 6, 10, 7, 3. Histogram Q menukar dua kelas pertama, histogram R menukar kelas kedua dan ketiga.", { scene: tab(dA3b, "Berat koper (kg)") }),
    q(2, "Data nilai dikelompokkan ke kelas 40–49, 50–59, 60–69, 70–79. Poligon frekuensinya digambar di atas titik tengah kelas. Tentukan titik tengah setiap kelas.",
      [row("Titik tengah", ["40–49", "50–59", "60–69", "70–79"], [44.5, 54.5, 64.5, 74.5])],
      "Titik tengah = {(ujung kiri + ujung kanan)/2}: {(40 + 49)/2} = 44,5, lalu tambah panjang kelas 10 setiap kali: 54,5; 64,5; 74,5."),
    q(2, "Tentukan benar atau salah pernyataan tentang histogram dan poligon frekuensi berikut.",
      [tf(["Batang histogram saling menempel karena batas atas satu kelas sama dengan batas bawah kelas berikutnya.", true], ["Titik-titik poligon frekuensi digambar di atas titik tengah kelas.", true], ["Tinggi batang histogram menunjukkan titik tengah kelas.", false])],
      "Tinggi batang menunjukkan frekuensi. Batang menempel karena memakai batas kelas, dan titik poligon berada di atas titik tengah.", { scene: hist(dA3, "Tinggi tanaman cabai", "Tinggi (cm)", "both") }),
  ],
  [
    q(3, "Ogive berikut menyajikan lama servis 36 sepeda motor (menit). Baca frekuensi kumulatifnya.",
      [n("Kurang dari 39,5 menit =", 9, "motor"), n("Kurang dari 59,5 menit =", 32, "motor")],
      "Tinggi ogive di 39,5 adalah 2 + 7 = 9, dan di 59,5 adalah 2 + 7 + 13 + 10 = 32.", { scene: { type: "ogive", dist: dA4, title: "Lama servis motor", xlabel: "Menit" } }),
    q(3, "Tentukan tinggi titik-titik ogive dari tabel berikut, yaitu frekuensi kumulatif kurang dari setiap batas.",
      [row("Kurang dari", ["0,5", "3,5", "6,5", "9,5", "12,5", "15,5"], [0, ...cumOf(dA4b)])],
      `Titik pertama di batas bawah kelas pertama bernilai 0, lalu ${cumOf(dA4b).join(", ")}.`, { scene: tab(dA4b, "Lama belajar (jam per minggu)") }),
    q(3, "Ogive berikut menyajikan uang jajan 40 siswa (ribu rupiah). Tentukan banyak siswa pada kelas 15–19 dan banyak siswa yang uang jajannya 20 ribu atau lebih.",
      [n("Kelas 15–19 =", 14, "siswa"), n("20 ribu atau lebih =", 14, "siswa")],
      "Kelas 15–19: tinggi ogive di 19,5 dikurangi tinggi di 14,5, yaitu 26 − 12 = 14. Uang jajan 20 ribu atau lebih: 40 − 26 = 14.", { scene: { type: "ogive", dist: dA4c, title: "Uang jajan", xlabel: "Ribu rupiah" } }),
    q(3, "Dari ogive lama servis motor, perkirakan banyak motor yang diservis kurang dari 44,5 menit. Anggap data tersebar merata dalam kelas.",
      [n("Perkiraan =", 15.5, "motor")],
      "44,5 tepat di tengah kelas 39,5–49,5 yang frekuensinya 13. Perkiraan = 9 + {13/2} = 15,5 motor.", { scene: { type: "ogive", dist: dA4, title: "Lama servis motor", xlabel: "Menit", mark: 44.5 } }),
  ],
  [
    q(4, "Grafik iklan berikut menyajikan persentase pembeli yang puas dengan tiga merek kipas angin. Perhatikan sumbu tegaknya.",
      [n("Pada gambar, batang B tampak … kali tinggi batang A:", 3), n("Selisih sebenarnya B dan A =", 4, "%")],
      "Sumbu dimulai dari 60. Tinggi pada gambar: A = 62 − 60 = 2, B = 66 − 60 = 6, jadi B tampak 3 kali A. Selisih sebenarnya hanya 66 − 62 = 4%.",
      { scene: { type: "bars", cats: ["A", "B", "C"], vals: [62, 66, 64], yMin: 60, yMax: 67, scale: true, title: "Pembeli puas (%)" } }),
    q(4, "Tentukan benar atau salah pernyataan tentang membaca grafik berikut.",
      [tf(["Memotong sumbu tegak (tidak dimulai dari 0) adalah hal yang dilarang.", false], ["Pembaca harus memperhatikan angka awal sumbu tegak sebelum membandingkan batang.", true], ["Grafik tanpa skala tetap bisa dipakai untuk mengetahui selisih persentase.", false])],
      "Buku menyebut memotong skala bukan hal yang dilarang, tetapi pembaca harus teliti. Grafik tanpa skala hanya menunjukkan urutan."),
    q(4, "Grafik penjualan berikut tidak mencantumkan skala pada sumbu tegak. Informasi apa yang masih bisa diperoleh?",
      [ch("Yang bisa diketahui:", ["Selisih persentase antarproduk", "Urutan produk dari yang tertinggi", "Persentase setiap produk"], "Urutan produk dari yang tertinggi")],
      "Tanpa skala, kita hanya bisa membandingkan tinggi batang, yaitu urutannya. Besar persentase dan selisihnya tidak bisa diketahui.",
      { scene: { type: "bars", cats: ["A", "B", "C"], vals: [83, 85, 84], yMin: 82, yMax: 85, scale: false, title: "Penjualan" } }),
    q(4, "Dua nilai 81% dan 84% digambar dengan sumbu tegak yang dimulai dari 80.",
      [n("Batang 84% tampak … kali batang 81%:", 4), ch("Agar tinggi batang sebanding dengan nilainya, sumbu tegak harus dimulai dari", ["0", "80", "81"], "0")],
      "Pada gambar: (84 − 80) : (81 − 80) = 4 : 1. Tinggi batang sebanding dengan nilai sebenarnya hanya jika sumbu dimulai dari 0."),
  ],
  [
    q(5, "Uang saku harian (ribu rupiah) 40 siswa disajikan pada tabel.",
      [row("Jumlah", ["Σfᵢ", "Σfᵢxᵢ"], [nOf(dB1), sumFX(dB1)]), st("Rata-rata =", meanOf(dB1), "ribu")], explainMean(dB1), { scene: tab(dB1, "Uang saku (ribu rupiah)", ["kelas", "tengah", "f"]) }),
    q(5, "Histogram berikut menyajikan nilai tes 30 siswa. Tentukan rata-ratanya.",
      [st("Rata-rata =", meanOf(dB1b))], explainMean(dB1b), { scene: hist(dB1b, "Nilai tes", "Nilai") }),
    q(5, "Nilai ujian dikelompokkan ke kelas 60–69, 70–79, 80–89, 90–99 dengan frekuensi 4, x, 10, 6. Rata-ratanya 80,5. Tentukan x.",
      [n("x =", 10)],
      `Titik tengah 64,5; 74,5; 84,5; 94,5. {(258 + 74,5x + 845 + 567)/(20 + x)} = 80,5, sehingga 1.670 + 74,5x = 1.610 + 80,5x, jadi 6x = 60 dan x = 10. Periksa: rata-rata = ${fx(meanOf(dB1c))}.`),
    q(5, "Tentukan benar atau salah pernyataan tentang rata-rata data berkelompok berikut.",
      [tf(["Setiap data dalam satu kelas dianggap sama dengan titik tengah kelasnya.", true], ["Rata-rata data berkelompok selalu persis sama dengan rata-rata data aslinya.", false], ["Rata-rata data berkelompok adalah Σfᵢxᵢ dibagi Σfᵢ.", true])],
      "Rata-rata data berkelompok adalah perkiraan karena memakai titik tengah. Pada Contoh 2.14, hasilnya 26,8 tahun dan bisa berbeda sedikit dari rata-rata data asli."),
  ],
  [
    q(6, "Berat badan (kg) 50 pekerja disajikan pada tabel.",
      [ch("Kelas median:", ["51–56", "57–62", "63–68"], "57–62"), st("Median =", medianOf(dB2), "kg")], explainMedian(dB2), { scene: tab(dB2, "Berat badan (kg)") }),
    q(6, "Histogram berikut menyajikan waktu tempuh (menit) 40 peserta lomba sepeda. Tentukan mediannya.",
      [st("Median =", medianOf(dB2b), "menit")], explainMedian(dB2b), { scene: hist(dB2b, "Waktu tempuh", "Menit") }),
    q(6, "Tabel frekuensi kumulatif berikut menyajikan usia 36 pengunjung museum. Tentukan median usia mereka.",
      [st("Median =", medianOf(dB2c), "tahun")], `Frekuensi setiap kelas: ${dB2c.f.join(", ")}. ${explainMedian(dB2c)}`,
      { scene: cumGrid([19.5, 29.5, 39.5, 49.5, 59.5, 69.5], [0, ...cumOf(dB2c)], "Usia pengunjung") }),
    q(6, "Lama (jam) 30 baterai senter bertahan disajikan pada tabel. Lengkapi unsur rumus median, lalu hitung median.",
      [row("Unsur", ["L", "F", "f"], [locate(dB2d, 15).L, locate(dB2d, 15).F, locate(dB2d, 15).f]), st("Median =", medianOf(dB2d), "jam")], explainMedian(dB2d), { scene: tab(dB2d, "Daya tahan baterai (jam)") }),
  ],
  [
    q(7, "Skor kuis 45 peserta disajikan pada tabel.",
      [ch("Kelas modus:", ["50–59", "70–79", "60–69"], "60–69"), st("Modus =", modeOf(dB3))], explainMode(dB3), { scene: tab(dB3, "Skor kuis") }),
    q(7, "Histogram berikut menyajikan tinggi badan (cm) 45 siswa.",
      [n("d₁ =", modeInfo(dB3b).d1), n("d₂ =", modeInfo(dB3b).d2), st("Modus =", modeOf(dB3b), "cm")], explainMode(dB3b), { scene: hist(dB3b, "Tinggi badan", "cm") }),
    q(7, "Ukuran pemusatan mana yang dipakai pada setiap pernyataan berikut?",
      [cls(["Rata-rata", "Median", "Modus"], ["Rata-rata banyak anak per keluarga di kompleks itu 1,8.", "Rata-rata"], ["Merek motor yang paling banyak dipakai warga desa adalah merek X.", "Modus"], ["Separuh karyawan bergaji di atas Rp4 juta dan separuhnya di bawah Rp4 juta.", "Median"])],
      "Pembagian total menjadi rata-rata. Yang paling banyak adalah modus. Membagi data menjadi dua bagian sama banyak adalah median."),
    q(7, "Pemilik usaha berkata, \"Rata-rata gaji karyawan kami tinggi.\" Seorang karyawan berkata, \"Kebanyakan dari kami menerima gaji minimal.\" Tentukan benar atau salah.",
      [tf(["Rata-rata bisa tinggi karena ada sedikit orang yang bergaji sangat besar.", true], ["Jika kebanyakan karyawan bergaji minimal, modus gajinya adalah gaji minimal.", true], ["Rata-rata gaji selalu sama dengan gaji yang paling banyak diterima.", false])],
      "Keduanya bisa jujur. Rata-rata terangkat oleh gaji yang sangat besar, sedangkan modus menunjukkan gaji yang paling banyak diterima."),
  ],
  [
    q(8, "Lama (menit) 20 siswa mengerjakan kuis disajikan pada tabel.",
      [st("Rata-rata =", meanOf(dB4), "menit"), st("Simpangan rata-rata =", srOf(dB4), "menit")], explainSR(dB4), { scene: tab(dB4, "Lama mengerjakan kuis", ["kelas", "tengah", "f"]) }),
    q(8, "Banyak pesan (per hari) yang dikirim 20 orang disajikan pada tabel. Rata-ratanya 10,5. Lengkapi kolom |xᵢ − x̄| lalu tentukan simpangan rata-rata.",
      [row("|xᵢ − x̄|", ["1–5", "6–10", "11–15", "16–20"], midsOf(dB4b).map(x => Math.abs(x - meanOf(dB4b)))), st("SR =", srOf(dB4b))], explainSR(dB4b), { scene: tab(dB4b, "Pesan per hari", ["kelas", "tengah", "f"]) }),
    q(8, "Waktu penyajian (menit) pesanan di kafe A dan kafe B, masing-masing 20 pesanan, disajikan pada tabel. Kedua kafe rata-ratanya 15 menit.",
      [st("SR kafe A =", srOf(dB4A), "menit"), st("SR kafe B =", srOf(dB4B), "menit"), ch("Waktu penyajian lebih konsisten:", ["Kafe A", "Kafe B", "Sama saja"], "Kafe A")],
      `Kafe A: ${explainSR(dB4A)} Kafe B: ${explainSR(dB4B)} SR kafe A lebih kecil, jadi lebih konsisten.`,
      { scene: { type: "grid", head: ["Kelas", "Kafe A", "Kafe B"], rows: rowsOf(dB4A).map((c, i) => [c, String(dB4A.f[i]), String(dB4B.f[i])]), title: "Waktu penyajian (menit)" } }),
    q(8, "Histogram berikut menyajikan lama (jam) 20 anak bermain gawai per hari.",
      [st("Rata-rata =", meanOf(dB4c), "jam"), st("SR =", srOf(dB4c), "jam")], explainSR(dB4c), { scene: hist(dB4c, "Lama bermain gawai", "Jam") }),
  ],
  [
    q(9, "Banyak buku yang dibaca 10 anggota klub dalam setahun disajikan pada tabel. Tentukan ragam (pembagi n − 1) dan simpangan bakunya.",
      [st("Ragam =", varOf(dB5)), st("Simpangan baku =", sdOf(dB5))], explainVar(dB5), { scene: tab(dB5, "Buku per tahun", ["kelas", "tengah", "f"]) }),
    q(9, "Dari sebuah sampel data berkelompok diperoleh n = 20, Σfᵢxᵢ = 300, dan Σfᵢxᵢ^{2} = 4.880.",
      [st("Ragam =", 20), st("Simpangan baku =", Math.sqrt(20))],
      "s^{2} = {(20 × 4.880 − 300^{2})/(20 × 19)} = {(97.600 − 90.000)/380} = {7.600/380} = 20. s = √{20} ≈ 4,47."),
    q(9, "Hubungan ragam dan simpangan baku.",
      [n("Simpangan baku jika ragamnya 6,25 =", 2.5), n("Ragam jika simpangan bakunya 1,2 =", 1.44)],
      "Simpangan baku = √{ragam} = √{6,25} = 2,5. Ragam = (simpangan baku)^{2} = 1,2^{2} = 1,44."),
    q(9, "Berat roti (gram) dari mesin P dan mesin Q, masing-masing 20 sampel, disajikan pada tabel. Rata-rata keduanya 102 gram.",
      [st("Simpangan baku P =", sdOf(dB5P), "gram"), st("Simpangan baku Q =", sdOf(dB5Q), "gram"), ch("Berat roti lebih seragam:", ["Keduanya sama", "Mesin Q", "Mesin P"], "Mesin P")],
      `Mesin P: ${explainVar(dB5P)} Mesin Q: ${explainVar(dB5Q)} Simpangan baku P lebih kecil, jadi beratnya lebih seragam.`,
      { scene: { type: "grid", head: ["Kelas", "Mesin P", "Mesin Q"], rows: rowsOf(dB5P).map((c, i) => [c, String(dB5P.f[i]), String(dB5Q.f[i])]), title: "Berat roti (gram)" } }),
  ],
];

/* ---------- Evaluasi ---------- */
const S = "Sedang", Mn = "Menantang", SM = "Sangat menantang";
const lvl = (level: Level, x: PQuestion): PQuestion => ({ ...x, level });
const e2 = D([10, 20, 30, 40, 50], 10, [8, 12, 16, 9, 5]);
const e3 = D([41, 51, 61, 71, 81, 91], 10, [3, 8, 17, 20, 9, 3]);
const e4 = D([145, 150, 155, 160, 165, 170], 5, [3, 7, 12, 9, 6, 3]);
const e5 = D([2, 5, 8, 11, 14], 3, [4, 9, 6, 11, 2]);
const e8 = D([20, 25, 30, 35, 40], 5, [3, 4, 6, 4, 3]);
const e10 = D([1, 6, 11, 16, 21], 5, [2, 5, 8, 3, 2]);
const e11 = D([20, 25, 30, 35, 40, 45], 5, [2, 6, 14, 10, 6, 2]);
const e13 = D([55, 65, 75, 85, 95], 10, [12, 30, 42, 24, 12]);
const e14 = D([10, 15, 20, 25, 30], 5, [4, 9, 15, 11, 5]);
const e15 = D([50, 60, 70, 80, 90], 10, [5, 12, 18, 10, 3]);
const e16 = D([21, 26, 31, 36, 41, 46], 5, [4, 7, 10, 11, 5, 3]);
const e18A = D([60, 70, 80, 90, 100], 10, [2, 8, 20, 8, 2]), e18B = D([60, 70, 80, 90, 100], 10, [6, 9, 10, 9, 6]);
const e19 = D([40, 50, 60, 70, 80, 90], 10, [4, 10, 16, 22, 18, 10]);
const e20 = D([100, 105, 110, 115, 120, 125], 5, [3, 6, 12, 12, 5, 2]);
const e21 = D([5, 10, 15, 20, 25], 5, [7, 12, 21, 12, 8]);
const e22A = D([50, 60, 70, 80, 90], 10, [2, 6, 8, 3, 1]), e22B = D([50, 60, 70, 80, 90], 10, [1, 3, 12, 3, 1]);
const e24 = D([10, 15, 20, 25, 30, 35], 5, [18, 12, 5, 3, 1, 1]);
const queueTitle = "Lama antre di loket (menit)";
const twoTables = (a: string[][], b: string[][], c: string[][]): Scene => ({ type: "multi", items: [
  { type: "grid", head: ["Kelas", "f"], rows: a, title: "Tabel P" }, { type: "grid", head: ["Kelas", "f"], rows: b, title: "Tabel Q" }, { type: "grid", head: ["Kelas", "f"], rows: c, title: "Tabel R" }] });

export const assessment: PQuestion[] = [
  lvl(S, q(0, "Lama antre (menit) 32 orang di sebuah loket tercatat seperti di tabel. Data akan dibuat menjadi 6 kelas.",
    [n("Jangkauan =", rangeOf(queueMinutes), "menit"), n("Panjang kelas =", classWidth(rangeOf(queueMinutes), 6), "menit")],
    `Nilai terkecil ${Math.min(...queueMinutes)}, terbesar ${Math.max(...queueMinutes)}, R = ${rangeOf(queueMinutes)}. Panjang kelas {${rangeOf(queueMinutes)}/6} = 5,5, dibulatkan ke atas menjadi 6.`,
    { scene: { type: "raw", values: queueMinutes, cols: 8, title: queueTitle } })),
  lvl(S, q(5, "Pengeluaran pulsa (ribu rupiah) 50 orang dalam sebulan disajikan pada tabel. Tentukan rata-ratanya.",
    [st("Rata-rata =", meanOf(e2), "ribu")], explainMean(e2), { scene: tab(e2, "Pengeluaran pulsa (ribu rupiah)") })),
  lvl(S, q(1, "Skor tes kebugaran 60 siswa disajikan pada tabel. Tentukan frekuensi kumulatifnya.",
    [row("Frekuensi kumulatif", ["Kurang dari 60,5", "Kurang dari 70,5", "Kurang dari 80,5"], cumOf(e3).slice(1, 4))],
    `Kurang dari 60,5: 3 + 8 = 11. Kurang dari 70,5: 11 + 17 = 28. Kurang dari 80,5: 28 + 20 = 48.`, { scene: tab(e3, "Skor kebugaran") })),
  lvl(S, q(6, "Tinggi badan (cm) 40 siswa disajikan pada tabel.",
    [ch("Kelas median:", ["160–164", "155–159", "150–154"], "155–159"), st("Median =", medianOf(e4), "cm")], explainMedian(e4), { scene: tab(e4, "Tinggi badan (cm)") })),
  lvl(S, q(2, "Lama (jam) 32 anak tidur siang dalam seminggu disajikan pada tabel. Histogram mana yang sesuai?",
    [ch("Pilih histogram:", ["Histogram P", "Histogram Q", "Histogram R"], "Histogram R", { "Histogram P": hist(D([2, 5, 8, 11, 14], 3, [4, 11, 6, 9, 2])), "Histogram Q": hist(D([2, 5, 8, 11, 14], 3, [2, 11, 6, 9, 4])), "Histogram R": hist(e5) })],
    "Batang harus berurutan setinggi 4, 9, 6, 11, 2. Histogram P menukar 9 dan 11, histogram Q urutannya terbalik.", { scene: tab(e5, "Tidur siang (jam per minggu)") })),
  lvl(S, q(7, "Ukuran pemusatan mana yang paling tepat untuk setiap keperluan berikut?",
    [cls(["Rata-rata", "Median", "Modus"],
      ["Toko sepatu ingin tahu ukuran yang paling banyak dibeli untuk menambah stok.", "Modus"],
      ["Panitia ingin batas waktu yang membagi peserta lomba lari menjadi separuh tercepat dan separuh terlambat.", "Median"],
      ["Petani ingin tahu hasil panen per petak jika total panen dibagi rata ke semua petak.", "Rata-rata"],
      ["Sekolah ingin tahu warna seragam olahraga yang paling disukai siswa.", "Modus"])],
    "Paling banyak atau paling disukai: modus. Membagi dua bagian sama banyak: median. Total dibagi rata: rata-rata.")),
  lvl(S, q(4, "Grafik berikut menyajikan persentase pelanggan yang memperpanjang langganan di toko P, Q, dan R.",
    [n("Pada gambar, batang Q tampak … kali batang P:", 3), n("Selisih sebenarnya Q dan P =", 2, "%")],
    "Sumbu dimulai dari 90. Tinggi pada gambar: P = 91 − 90 = 1, Q = 93 − 90 = 3, jadi Q tampak 3 kali P. Selisih sebenarnya 93 − 91 = 2%.",
    { scene: { type: "bars", cats: ["P", "Q", "R"], vals: [91, 93, 92], yMin: 90, yMax: 94, scale: true, title: "Memperpanjang langganan (%)" } })),
  lvl(S, q(8, "Lama perjalanan (menit) 20 karyawan ke kantor disajikan pada tabel.",
    [st("Rata-rata =", meanOf(e8), "menit"), st("Simpangan rata-rata =", srOf(e8), "menit")], explainSR(e8), { scene: tab(e8, "Lama perjalanan (menit)") })),
  lvl(Mn, q(0, "Data lama antre 32 orang tadi dikelompokkan ke kelas 12–17, 18–23, 24–29, 30–35, 36–41, 42–47. Tentukan frekuensi setiap kelas.",
    [row("Frekuensi", ["12–17", "18–23", "24–29", "30–35", "36–41", "42–47"], groupRaw(queueMinutes, 12, 6, 6))],
    `Hitung turus: ${groupRaw(queueMinutes, 12, 6, 6).join(", ")}. Jumlahnya 32, sama dengan banyak data.`, { scene: { type: "raw", values: queueMinutes, cols: 8, title: queueTitle } })),
  lvl(Mn, q(9, "Banyak gol yang dicetak 20 klub futsal dalam satu musim disajikan pada tabel. Tentukan ragam (pembagi n − 1) dan simpangan bakunya.",
    [st("Ragam =", varOf(e10)), st("Simpangan baku =", sdOf(e10))], explainVar(e10), { scene: tab(e10, "Gol per musim", ["kelas", "tengah", "f"]) })),
  lvl(Mn, q(3, "Ogive berikut menyajikan waktu tempuh (menit) 40 pelari pada lomba 5 km.",
    [n("Pelari dengan waktu kurang dari 34,5 menit =", cumOf(e11)[2], "orang"), n("Pelari dengan waktu 35–39 menit =", e11.f[3], "orang")],
    `Tinggi ogive di 34,5 adalah ${cumOf(e11)[2]}. Kelas 35–39: tinggi di 39,5 dikurangi tinggi di 34,5, yaitu ${cumOf(e11)[3]} − ${cumOf(e11)[2]} = ${e11.f[3]}.`,
    { scene: { type: "ogive", dist: e11, title: "Waktu tempuh lari 5 km", xlabel: "Menit" } })),
  lvl(Mn, q(5, "Skor 30–39, 40–49, 50–59, 60–69, 70–79 mempunyai frekuensi 5, 9, x, 8, 3. Rata-ratanya 53,25.",
    [n("x =", 15), n("Banyak data =", 40)],
    `Titik tengah 34,5; 44,5; 54,5; 64,5; 74,5. Σfᵢxᵢ = 1.312,5 + 54,5x dan Σfᵢ = 25 + x. Dari {(1.312,5 + 54,5x)/(25 + x)} = 53,25: 1.312,5 + 54,5x = 1.331,25 + 53,25x, jadi 1,25x = 18,75 dan x = 15. Banyak data 40. Periksa: rata-rata = ${fx(meanOf(D([30, 40, 50, 60, 70], 10, [5, 9, 15, 8, 3])))}.`)),
  lvl(Mn, q(1, "Nilai tes masuk 120 pendaftar disajikan pada tabel. Pendaftar dengan nilai di atas 84 diterima langsung.",
    [n("Diterima langsung =", 36, "orang"), n("Persentase diterima langsung =", 30, "%"), n("Frekuensi relatif kelas 75–84 =", 35, "%")],
    "Di atas 84: kelas 85–94 dan 95–104, yaitu 24 + 12 = 36 orang = {36/120} × 100% = 30%. Kelas 75–84: {42/120} × 100% = 35%.", { scene: tab(e13, "Nilai tes masuk") })),
  lvl(Mn, q(7, "Histogram berikut menyajikan lama (menit) 44 pelanggan menunggu ojek daring. Tentukan modusnya.",
    [n("d₁ =", modeInfo(e14).d1), n("d₂ =", modeInfo(e14).d2), st("Modus =", modeOf(e14), "menit")], explainMode(e14), { scene: hist(e14, "Lama menunggu ojek", "Menit") })),
  lvl(Mn, q(2, "Poligon frekuensi berikut menyajikan nilai ulangan sebuah angkatan. Tentukan benar atau salah setiap pernyataan.",
    [tf(["Titik-titik poligon berada di atas titik tengah kelas, misalnya 74,5.", true], ["Banyak data seluruhnya 48.", true], ["Kelas 80–89 mempunyai frekuensi lebih besar daripada kelas 60–69.", false], ["Jarak dua titik tengah berurutan sama dengan panjang kelas, yaitu 10.", true])],
    "Titik tengah 54,5; 64,5; 74,5; 84,5; 94,5 berjarak 10. Jumlah frekuensi 5 + 12 + 18 + 10 + 3 = 48. Kelas 80–89 berfrekuensi 10, lebih kecil dari 12.",
    { scene: { type: "hist", dist: e15, show: "poly", title: "Nilai ulangan", xlabel: "Nilai" } })),
  lvl(Mn, q(6, "Histogram berikut menyajikan usia (tahun) 40 peserta pelatihan. Tentukan median usianya.",
    [st("Median =", medianOf(e16), "tahun")], explainMedian(e16), { scene: hist(e16, "Usia peserta pelatihan", "Tahun") })),
  lvl(Mn, q(0, "Tiga siswa menyusun tabel distribusi frekuensi dari data yang sama. Setiap tabel memuat satu kesalahan. Tentukan kesalahannya.",
    [cls(["Kelas tumpang tindih", "Panjang kelas tidak sama", "Ada nilai yang terlewat"], ["Tabel P", "Kelas tumpang tindih"], ["Tabel Q", "Panjang kelas tidak sama"], ["Tabel R", "Ada nilai yang terlewat"])],
    "Tabel P: data 19 masuk kelas 15–19 dan 19–23. Tabel Q: kelas 20–26 panjangnya 7, kelas lain 5. Tabel R: nilai 20–24 tidak masuk kelas mana pun.",
    { scene: twoTables([["10–14", "4"], ["15–19", "6"], ["19–23", "9"], ["24–28", "5"]], [["10–14", "4"], ["15–19", "6"], ["20–26", "11"], ["27–31", "3"]], [["10–14", "4"], ["15–19", "6"], ["25–29", "8"], ["30–34", "6"]]) })),
  lvl(SM, q(9, "Daya tahan (jam) 40 baterai merek A dan 40 baterai merek B disajikan pada tabel. Rata-rata keduanya 84,5 jam.",
    [st("Simpangan baku A =", sdOf(e18A), "jam"), st("Simpangan baku B =", sdOf(e18B), "jam"), ch("Daya tahan lebih konsisten:", ["Merek B", "Merek A", "Tidak bisa ditentukan"], "Merek A")],
    `Merek A: ${explainVar(e18A)} Merek B: ${explainVar(e18B)} Simpangan baku A lebih kecil, jadi daya tahannya lebih konsisten.`,
    { scene: { type: "grid", head: ["Kelas", "Merek A", "Merek B"], rows: rowsOf(e18A).map((c, i) => [c, String(e18A.f[i]), String(e18B.f[i])]), title: "Daya tahan baterai (jam)" } })),
  lvl(SM, q(3, "Ogive berikut menyajikan nilai 80 siswa. KKM-nya 74,5. Anggap data tersebar merata dalam kelas.",
    [n("Perkiraan siswa dengan nilai di bawah 74,5 =", 41, "siswa"), st("Persentase siswa belum tuntas =", 51.25, "%")],
    "74,5 berada di tengah kelas 69,5–79,5 yang frekuensinya 22. Tinggi ogive di 69,5 adalah 30, jadi perkiraannya 30 + {22/2} = 41 siswa, yaitu {41/80} × 100% = 51,25%.",
    { scene: { type: "ogive", dist: e19, title: "Nilai ujian", xlabel: "Nilai", mark: 74.5 } })),
  lvl(SM, q(6, "Tabel frekuensi kumulatif berikut menyajikan suhu udara tertinggi (°F) di 40 kota. Tentukan rata-rata dan mediannya.",
    [st("Rata-rata =", meanOf(e20), "°F"), st("Median =", medianOf(e20), "°F")],
    `Frekuensi setiap kelas: ${e20.f.join(", ")}. ${explainMean(e20)} ${explainMedian(e20)}`,
    { scene: cumGrid([99.5, 104.5, 109.5, 114.5, 119.5, 124.5, 129.5], [0, ...cumOf(e20)], "Suhu tertinggi (°F)") })),
  lvl(SM, q(1, "Tabel frekuensi kumulatif berikut menyajikan banyak pesanan harian sebuah warung selama 60 hari. Tentukan frekuensi setiap kelas dan kelas yang paling sering terjadi.",
    [row("Frekuensi", ["5–9", "10–14", "15–19", "20–24", "25–29"], e21.f), ch("Kelas paling sering:", ["15–19", "10–14", "20–24"], "15–19")],
    "Selisih frekuensi kumulatif berurutan: 7 − 0, 19 − 7, 40 − 19, 52 − 40, 60 − 52, yaitu 7, 12, 21, 12, 8. Frekuensi terbesar 21 di kelas 15–19.",
    { scene: cumGrid([4.5, 9.5, 14.5, 19.5, 24.5, 29.5], [0, ...cumOf(e21)], "Pesanan harian") })),
  lvl(SM, q(8, "Nilai ujian 20 siswa kelas A dan 20 siswa kelas B disajikan pada tabel.",
    [st("Rata-rata kelas A =", meanOf(e22A)), st("SR kelas A =", srOf(e22A)), st("SR kelas B =", srOf(e22B)), ch("Nilai yang lebih mengumpul di dekat rata-ratanya:", ["Kelas A", "Kelas B", "Tidak bisa ditentukan"], "Kelas B")],
    `Kelas A: ${explainSR(e22A)} Kelas B: ${explainSR(e22B)} SR kelas B lebih kecil.`,
    { scene: { type: "grid", head: ["Kelas", "Kelas A", "Kelas B"], rows: rowsOf(e22A).map((c, i) => [c, String(e22A.f[i]), String(e22B.f[i])]), title: "Nilai ujian" } })),
  lvl(SM, q(4, "Iklan berikut menampilkan persentase pelanggan puas pada tiga penyedia internet. Tentukan benar atau salah setiap pernyataan.",
    [tf(["Pada gambar, batang C tampak 5 kali tinggi batang A.", true], ["Kepuasan pelanggan C sebenarnya 5 kali kepuasan pelanggan A.", false], ["Selisih sebenarnya antara C dan A adalah 8 poin persen.", true], ["Jika sumbu tegak dimulai dari 0, batang C kurang dari 1,1 kali tinggi batang A.", true])],
    "Sumbu dimulai dari 86: tinggi A = 2 dan C = 10 pada gambar, jadi 5 kali. Nilai sebenarnya 96 dan 88, selisih 8 poin, perbandingan {96/88} ≈ 1,09.",
    { scene: { type: "bars", cats: ["A", "B", "C"], vals: [88, 90, 96], yMin: 86, yMax: 97, scale: true, title: "Pelanggan puas (%)" } })),
  lvl(SM, q(7, "Upah harian (puluh ribu rupiah) 40 pekerja sebuah usaha disajikan pada tabel. Hitung modusnya, lalu tentukan benar atau salah setiap pernyataan.",
    [st("Modus =", modeOf(e24)), tf(["Rata-rata upahnya 17 puluh ribu rupiah.", true], ["Modus upah lebih besar daripada rata-ratanya.", false], ["Lebih dari separuh pekerja menerima upah di bawah 19,5 puluh ribu rupiah.", true])],
    `${explainMode(e24)} ${explainMean(e24)} Banyak pekerja di bawah 19,5 adalah 18 + 12 = 30 dari 40. Modus lebih kecil dari rata-rata karena beberapa pekerja bergaji besar menarik rata-rata ke atas.`,
    { scene: tab(e24, "Upah harian (puluh ribu rupiah)") })),
];
