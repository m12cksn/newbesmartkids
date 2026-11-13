/**
 * Kelas 9 Bab 4 - Peluang dan Pemilihan Sampel (Buku Siswa Matematika SMP/MTs Kelas IX, Kurikulum Merdeka 2022, hlm. 215-278).
 * A. Peluang (1. dasar-dasar peluang; 2. nilai peluang)  B. Peluang empiris  C. Frekuensi harapan  D. Pemilihan sampel.
 * Bentuk jawaban mengikuti buku: benar/salah, isian singkat, mendaftar anggota ruang sampel dan kejadian (mengetuk
 * hasil pada daftar, diagram pohon, atau tabel dua dadu), nilai peluang sebagai pecahan/desimal/persen, kejadian
 * mustahil atau pasti, frekuensi relatif dari data dan diagram, menduga isi kantong, frekuensi harapan, populasi dan
 * sampel, sampel representatif dari diagram titik, dan soal penerapan (tabel penerbangan, gim, kuis tiga tirai).
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka: 3/8, 0,375, 37,5% ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  if (t.endsWith("%")) { const v = num(t.slice(0, -1)); return v / 100; }
  const f = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t);
  if (f) { const a = num(f[1]), b = num(f[2]); return b === 0 ? NaN : a / b; }
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export const fracText = (a: number, b: number) => { const g = gcd(a, b) || 1; return `{${a / g}/${b / g}}`; };
/** Pembangkit acak tetap (mulberry32) agar simulasi dapat diulang. */
export function rng(seed: number) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/** Frekuensi relatif kumulatif dari n percobaan dengan peluang p. */
export function relSeries(p: number, n: number, seed: number) { const r = rng(seed); let k = 0; return Array.from({ length: n }, (_, i) => { if (r() < p) k++; return k / (i + 1); }); }

/* ---------- Gambar ---------- */
export type Scene =
  | { type: "bag"; balls: { color: string; name: string; count: number }[] }
  | { type: "bars"; labels: string[]; values: number[]; xlabel: string; title?: string }
  | { type: "rel"; p: number; n: number; seed: number; title: string }
  | { type: "spinner"; sectors: { color: string; label: string }[] }
  | { type: "dots"; min: number; max: number; step: number; population: number[]; sample?: number[]; label: string }
  | { type: "table"; head: string[]; rows: (string | number)[][]; caption?: string }
  | { type: "card"; title: string; lines: string[] };

export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; tol?: number }
  | { kind: "prob"; label: string; a: number; b: number }
  | { kind: "choice"; label: string; options: string[]; answer: string; pics?: Scene[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "pickset"; label: string; items: string[]; answer: string[]; tree?: number }
  | { kind: "grid"; label: string; answer: [number, number][] };

export type PQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[]; id?: string };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : 1);
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => idn(n).replace(/\./g, "");
export const listOf = (v: string) => (v ? v.split(";") : []);
const setKey = (xs: string[]) => [...xs].sort().join(";");
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "prob": { const g = gcd(p.a, p.b) || 1; return [`${p.a / g}/${p.b / g}`]; }
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "pickset": return [p.answer.join(";")];
    case "grid": return [p.answer.map(c => c.join(",")).join(";")];
  }
}
const near = (a: number, b: number, tol = 0) => !Number.isNaN(a) && Math.abs(a - b) <= Math.max(tol, 1e-9 * Math.max(1, Math.abs(b)));
function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "num": return near(num(v), p.value, p.tol);
    /** Pecahan dihitung tepat; desimal atau persen boleh dibulatkan sampai 0,005. */
    case "prob": { const x = num(v); return v.includes("/") ? near(x, p.a / p.b) : near(x, p.a / p.b, 0.005); }
    case "pickset": return setKey(listOf(v)) === setKey(p.answer);
    case "grid": return setKey(listOf(v)) === setKey(p.answer.map(c => c.join(",")));
    default: return cells(p, v).join("|") === fields(p).join("|");
  }
}
const partReady = (p: Part, v: string) => (p.kind === "classify" || p.kind === "tf" ? cells(p, v).every(c => c.trim() !== "") : v.trim() !== "");
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
      case "prob": return `${plain(p.label)} ${v[i] || "…"}`;
      case "choice": return `${plain(p.label)} ${plain(v[i]) || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      case "pickset": return `${plain(p.label)} {${listOf(v[i]).join(", ") || "…"}}`;
      case "grid": return `${plain(p.label)} {${listOf(v[i]).map(c => `(${c.replace(",", ", ")})`).join(", ") || "…"}}`;
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: number, prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene; id?: string } = {}): PQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string, tol?: number): Part => ({ kind: "num", label, value, unit, tol });
const pr = (label: string, a: number, b: number): Part => ({ kind: "prob", label, a, b });
const ch = (label: string, options: string[], answer: string, pics?: Scene[]): Part => ({ kind: "choice", label, options, answer, pics });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const coins = (k: number) => { let out = [""]; for (let i = 0; i < k; i++) out = out.flatMap(s => [`${s}A`, `${s}G`]); return out; };
const dice = (f: (a: number, b: number) => boolean) => { const out: [number, number][] = []; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (f(a, b)) out.push([a, b]); return out; };
const pairs = (k: number) => { const out: string[] = []; for (let a = 1; a <= k; a++) for (let b = a + 1; b <= k; b++) out.push(`${a}-${b}`); return out; };
const RED = "#e03131", YEL = "#f2b705", GRN = "#2f9e44", BLU = "#1c64b5";
const MPS = ["Mustahil", "Pasti", "Bukan keduanya"];

/* ---------- Data populasi untuk pemilihan sampel ---------- */
/** Tinggi badan 40 siswa (cm), diurutkan dari yang terpendek. */
export const heights = [142, 144, 145, 146, 147, 148, 148, 149, 150, 150, 151, 151, 152, 152, 153, 153, 153, 154, 154, 155, 155, 155, 156, 156, 157, 157, 158, 158, 159, 160, 160, 161, 162, 163, 164, 165, 166, 168, 170, 173];
const popScores = [62, 64, 65, 66, 67, 67, 68, 69, 69, 70, 70, 71, 71, 71, 72, 72, 72, 73, 73, 73, 73, 74, 74, 74, 75, 75, 75, 76, 76, 77, 77, 78, 79, 80, 81, 82, 84];

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Peluang", sections: [
    { title: "Dasar-dasar peluang", lab: "space", steps: [
      "Percobaan adalah kegiatan yang menghasilkan satu atau lebih hasil, misalnya melempar koin atau dadu. Hasil percobaan adalah luaran yang dapat terjadi.",
      "Ruang sampel (S) adalah himpunan semua kemungkinan hasil suatu percobaan. Anggotanya disebut titik sampel, dan banyaknya ditulis n(S).",
      "Kejadian adalah himpunan hasil dengan kriteria tertentu, jadi kejadian selalu merupakan himpunan bagian dari ruang sampel.",
      "Ruang sampel dapat ditentukan dengan mendaftar, dengan tabel (cocok untuk dua dadu), atau dengan diagram pohon (cocok untuk beberapa koin).",
      "Pelemparan n koin mempunyai n(S) = 2^{n}: 1 koin 2 hasil, 2 koin 4, 3 koin 8, 4 koin 16. Pelemparan dua dadu mempunyai 6 × 6 = 36 hasil.",
      "Pasangan berurutan membedakan dadu pertama dan kedua: (2, 5) dan (5, 2) adalah dua hasil yang berbeda.",
    ], life: "Saat memilih aturan permainan, pilihlah yang anggota kejadiannya paling banyak. Pada lempar dua dadu, menang jika jumlahnya 7 ada 6 cara, jumlah 11 hanya 2 cara, dan jumlah 1 tidak ada caranya sama sekali. Abel memakai tabel 6 × 6 untuk memastikan tidak ada hasil yang terlewat.",
      example: "Tentukan ruang sampel pelemparan dua koin dan kejadian muncul tepat satu sisi gambar.",
      work: ["Misalkan A = sisi angka dan G = sisi gambar.", "Diagram pohon: koin pertama A atau G, masing-masing bercabang A atau G.", "S = {(A, A), (A, G), (G, A), (G, G)}, n(S) = 4.", "Kejadian tepat satu gambar = {(A, G), (G, A)}, banyaknya 2."],
      notes: ["(A, G) dan (G, A) berbeda karena urutan koinnya berbeda.", "Kejadian boleh tidak mempunyai anggota, misalnya jumlah dua mata dadu 1.", "Pada pengambilan dua kartu sekaligus, urutan tidak diperhatikan: kartu {1, 5} sama dengan {5, 1}."],
      demo: "Pilih percobaan dan kejadiannya. Diagram pohon atau tabel ruang sampel ditampilkan dan anggota kejadian ditandai." },
    { title: "Nilai peluang", lab: "bag", steps: [
      "Peluang suatu kejadian adalah bilangan yang menunjukkan seberapa mungkin kejadian itu terjadi.",
      "Jika semua hasil mempunyai kemungkinan yang sama, P(A) = {n(A)/n(S)}. Peluang ini disebut peluang teoretis.",
      "Nilai peluang dapat ditulis sebagai pecahan biasa, pecahan desimal, atau persen: {3/8} = 0,375 = 37,5%.",
      "Nilai peluang selalu dari 0 sampai 1. Peluang 0 berarti kejadian mustahil, peluang 1 berarti kejadian pasti.",
      "Komplemen kejadian A (A^{c}) adalah semua hasil yang bukan anggota A. P(A^{c}) = 1 − P(A).",
      "Banyaknya anggota kejadian saja tidak cukup; bandingkan juga dengan banyaknya ruang sampel. Gim dadu \"1 atau 5\" (peluang {2/6}) lebih kecil peluangnya daripada gim koin \"sisi gambar\" ({1/2}).",
    ], life: "Kantong berisi 5 bola bergambar burung maleo dan 3 bola bergambar komodo. Peluang mengambil komodo adalah {3/8} = 37,5%, jadi lebih mungkin mendapat maleo. Prakiraan cuaca \"peluang hujan 70%\" berarti peluang tidak hujan 30%. Pemilihan ketua kelas bukan berarti 50% perempuan hanya karena ada dua jenis kelamin: banyak siswa setiap jenis kelamin juga menentukan.",
      example: "Kotak berisi 6 bola merah, 2 kuning, dan 4 hijau. Tentukan peluang terambil bola yang bukan merah.",
      work: ["n(S) = 6 + 2 + 4 = 12.", "P(merah) = {6/12} = {1/2}.", "P(bukan merah) = 1 − {1/2} = {1/2}.", "Periksa langsung: bola bukan merah ada 2 + 4 = 6, {6/12} = {1/2} = 50%."],
      notes: ["Peluang tidak pernah negatif atau lebih dari 1 (100%).", "Kartu remi: 52 kartu, 4 jenis (hati, wajik, keriting, sekop) masing-masing 13 kartu, dan 4 kartu untuk setiap nilai (As, King, Queen, ...).", "Peluang tidak dapat ditentukan dengan cara ini jika hasil-hasilnya tidak sama mungkin."],
      demo: "Atur banyak bola setiap warna dan pilih warna yang diambil. Peluangnya ditulis sebagai pecahan, desimal, dan persen, beserta komplemennya." },
  ] },
  { code: "B", title: "Peluang Empiris", sections: [
    { title: "Frekuensi relatif dan peluang empiris", lab: "empiris", steps: [
      "Jika ruang sampel belum diketahui, peluang dapat diperkirakan dari percobaan berulang (eksperimen).",
      "Frekuensi relatif suatu kejadian adalah banyak hasil yang memenuhi kejadian itu dibagi banyak percobaan. Frekuensi relatif disebut juga peluang empiris.",
      "Frekuensi relatif dapat berbeda dari peluang teoretis, terutama jika percobaannya sedikit. Lima lemparan koin bisa saja menghasilkan 4 angka.",
      "Makin banyak percobaan yang dilakukan secara acak, frekuensi relatif makin mendekati peluang teoretis.",
      "Dari frekuensi relatif kita dapat menduga isi kantong: n(A) ≈ frekuensi relatif × n(S), lalu dibulatkan.",
    ], life: "Penjaga gawang memperkirakan peluang lawan menendang penalti ke kiri dari catatan pertandingan sebelumnya. Petani memperkirakan peluang benih tumbuh dari 200 benih yang dicoba: jika 172 tumbuh, peluang empirisnya 0,86. Makin banyak data, makin dapat dipercaya perkiraannya.",
      example: "Kantong berisi 10 bola merah, kuning, dan hijau. Dari 200 pengambilan dengan pengembalian diperoleh merah 36, kuning 62, dan hijau 102. Dugalah isi kantong.",
      work: ["Frekuensi relatif: merah {36/200} = 18%, kuning 31%, hijau 51%.", "Merah ≈ 18% × 10 = 1,8, kuning ≈ 3,1, hijau ≈ 5,1.", "Dibulatkan: 2 merah, 3 kuning, 5 hijau (jumlahnya 10).", "Dugaan ini makin akurat jika percobaannya diperbanyak."],
      notes: ["Frekuensi relatif 0 tidak berarti kejadian itu mustahil; mungkin percobaannya masih sedikit.", "Grafik frekuensi relatif pada awalnya naik turun tajam, lalu makin stabil.", "Pengambilan dengan pengembalian: bola dikembalikan sebelum pengambilan berikutnya."],
      demo: "Lempar koin atau dadu berkali-kali. Grafik frekuensi relatif digambar dan dibandingkan dengan peluang teoretisnya." },
  ] },
  { code: "C", title: "Frekuensi Harapan", sections: [
    { title: "Frekuensi harapan suatu kejadian", lab: "harapan", steps: [
      "Frekuensi harapan adalah banyaknya kejadian yang diharapkan terjadi dalam sejumlah percobaan.",
      "Frekuensi harapan = P(A) × banyak percobaan.",
      "Frekuensi harapan adalah perkiraan, bukan kepastian. Melempar dadu 60 kali diharapkan menghasilkan mata 6 sebanyak 10 kali, tetapi hasil sebenarnya bisa 8 atau 13.",
      "Frekuensi harapan boleh berupa pecahan desimal, misalnya 37,5 kali, karena menyatakan rata-rata harapan.",
      "Frekuensi harapan tidak pernah lebih dari banyak percobaan, dan sama dengan banyak percobaan hanya jika kejadiannya pasti.",
    ], life: "Sebuah kota mempunyai 28% penduduk Generasi Z. Jika 75 penduduk dipilih acak, diharapkan sekitar 0,28 × 75 = 21 orang Generasi Z. Pabrik yang tahu 2% produknya cacat memperkirakan 20 produk cacat dari 1.000 produk, lalu menyiapkan pengganti sebanyak itu.",
      example: "Roda putar mempunyai 6 juring sama besar: 3 merah, 2 kuning, 1 hijau. Roda diputar 60 kali. Berapa frekuensi harapan muncul kuning?",
      work: ["P(kuning) = {2/6} = {1/3}.", "Frekuensi harapan = {1/3} × 60 = 20 kali.", "Merah diharapkan {3/6} × 60 = 30 kali, hijau 10 kali.", "Jumlah semua frekuensi harapan = 60, sama dengan banyak putaran."],
      notes: ["Hitung peluang dulu dengan ruang sampel yang benar, misalnya tiga koin mempunyai 8 hasil.", "Pada Gim Koin, peluang pion sampai ke A atau E adalah {2/16} = {1/8}, sehingga dari 8 pion diharapkan 1 pion.", "Laporan hasil percobaan yang terlalu teratur (misalnya selalu berselang AGAGAG) justru tidak biasa untuk percobaan acak."],
      demo: "Atur banyak juring setiap warna dan banyak putaran. Frekuensi harapan setiap warna dihitung dan dibandingkan dengan hasil simulasi." },
  ] },
  { code: "D", title: "Pemilihan Sampel", sections: [
    { title: "Populasi, sampel, dan sampel representatif", lab: "sampel", steps: [
      "Populasi adalah kumpulan semua orang atau objek yang diteliti. Sampel adalah sebagian dari populasi (himpunan bagian populasi).",
      "Ukuran populasi atau sampel adalah banyaknya anggota. Mengumpulkan data seluruh populasi sering mahal atau tidak mungkin, jadi kita memakai sampel.",
      "Sampel representatif adalah sampel yang distribusinya menyerupai populasi dalam bentuk, pusat (rata-rata), dan sebaran.",
      "Cara terbaik mendapatkan sampel representatif adalah memilih secara acak: setiap kemungkinan sampel yang ukurannya sama mempunyai peluang terpilih yang sama.",
      "Pemilihan acak tidak menjamin sampel pasti representatif, tetapi peluangnya besar. Sampel dari kelompok tertentu saja (misalnya pemain basket atau pengikut media sosial sekolah) cenderung bias.",
      "Diagram titik menampilkan setiap data sebagai titik di atas nilainya, sehingga bentuk, pusat, dan sebaran sampel mudah dibandingkan dengan populasinya.",
    ], life: "Untuk memperkirakan berat rata-rata 1.000 mangga hasil panen, petani tidak menimbang semuanya; ia memilih 30 mangga secara acak dari seluruh keranjang. Jika hanya memilih mangga paling atas yang besar-besar, perkiraannya terlalu tinggi. Survei pemilu juga memilih responden acak dari berbagai daerah agar hasilnya mewakili seluruh pemilih.",
      example: "Koran sekolah memuat dua survei: (1) 120 pengikut Twitter sekolah, 97 memilih pembelajaran daring; (2) 54 siswa dipilih acak oleh komputer, 39 setuju rapor diambil orang tua. Mana yang lebih dapat dipercaya?",
      work: ["Survei 1 hanya menjangkau pengikut Twitter sekolah, bukan semua siswa.", "Survei 2 memilih sampel acak dari seluruh siswa.", "Walaupun lebih kecil, sampel acak lebih mungkin mewakili populasi.", "Jadi berita kedua lebih dapat dipercaya."],
      notes: ["Menanyai lebih dari 50% teman sekelas belum tentu representatif jika yang ditanya hanya teman dekat.", "Sampel sistematis, misalnya urutan ke-3, 6, dan 9 di setiap barisan upacara, menyebar ke seluruh sekolah.", "Untuk memilih 3 dari 27 siswa secara acak, beri nomor 1–27 lalu undi nomor dari kotak tertutup."],
      demo: "Pilih cara pengambilan sampel 5 siswa dari 40 siswa yang berbaris menurut tinggi badan. Sampelnya ditandai pada diagram titik dan rata-ratanya dibandingkan dengan populasi." },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: t.sections.length > 1 ? `${t.code}.${j + 1}` : t.code, topic: t })));

/* ---------- Latihan ---------- */
const S3 = coins(3);
export const practice: PQuestion[][] = [
  // A.1
  [
    q(0, "Tiga koin dilempar bersamaan. Ketuk semua hasil yang termasuk kejadian muncul minimal dua sisi gambar.", [{ kind: "pickset", label: "Kejadian minimal dua G:", items: S3, answer: S3.filter(s => [...s].filter(c => c === "G").length >= 2), tree: 3 }],
      "Dari 8 hasil, yang memuat dua atau tiga G: AGG, GAG, GGA, GGG."),
    q(0, "Tentukan banyak anggota ruang sampel setiap percobaan.", [n("Mengambil satu kartu dari satu pak kartu remi: n(S) =", 52), n("Memilih satu tanggal dalam tahun 2025 (bukan kabisat): n(S) =", 365), n("Melempar 4 koin: n(S) =", 16)],
      "52 kartu remi; 365 hari; 2^{4} = 16."),
    q(0, "Dua dadu dilempar. Ketuk semua pasangan pada tabel yang jumlah mata dadunya 8.", [{ kind: "grid", label: "Jumlah 8:", answer: dice((a, b) => a + b === 8) }],
      "(2, 6), (3, 5), (4, 4), (5, 3), (6, 2): ada 5 pasangan."),
    q(0, "Benar atau salah?", [tf(["Kejadian adalah himpunan bagian dari ruang sampel.", true], ["Banyak anggota ruang sampel pelemparan n koin adalah 2n.", false], ["Ruang sampel dapat ditentukan dengan mendaftar, tabel, atau diagram pohon.", true])],
      "Pelemparan n koin mempunyai 2^{n} hasil, bukan 2n. Untuk 3 koin: 8, bukan 6."),
  ],
  // A.2
  [
    q(1, "Kantong berisi 5 bola bergambar burung maleo dan 3 bola bergambar komodo. Satu bola diambil acak. Tentukan peluang terambil bola komodo.", [pr("P(komodo) =", 3, 8)],
      "n(S) = 8, n(komodo) = 3. P = {3/8} = 0,375 = 37,5%. Boleh ditulis dalam ketiga bentuk itu.", { scene: { type: "bag", balls: [{ color: GRN, name: "maleo", count: 5 }, { color: YEL, name: "komodo", count: 3 }] } }),
    q(1, "Kartu bernomor 10 sampai 20 dikocok, lalu satu kartu diambil. Tentukan peluang mendapat kartu bernomor genap.", [pr("P(genap) =", 6, 11)],
      "Ada 11 kartu (10–20). Genap: 10, 12, 14, 16, 18, 20, ada 6. P = {6/11} ≈ 0,55."),
    q(1, "Tentukan apakah setiap kejadian mustahil, pasti, atau bukan keduanya.", [{ kind: "classify", options: MPS, rows: [
      { text: "Melempar satu dadu dan mendapat mata 7", answer: "Mustahil" }, { text: "Melempar satu dadu dan mendapat bilangan asli", answer: "Pasti" },
      { text: "Mengambil bola merah dari kotak berisi 17 bola putih", answer: "Mustahil" }, { text: "Mengambil kartu Queen dari satu pak kartu remi", answer: "Bukan keduanya" }] }],
      "Mata dadu 1–6 semuanya bilangan asli. Queen ada 4 dari 52 kartu, peluangnya {1/13}."),
    q(1, "Kotak berisi 6 bola merah, 2 kuning, dan 4 hijau. Satu bola diambil acak.", [pr("P(bukan merah) =", 6, 12), pr("Jika P(A) = 0,35, maka P(A^{c}) =", 13, 20)],
      "Bukan merah: 6 dari 12 = {1/2}. P(A^{c}) = 1 − 0,35 = 0,65 = {13/20}."),
  ],
  // B
  [
    q(2, "Komputer menampilkan 15 bilangan acak 0–3: 2, 0, 1, 3, 0, 2, 2, 1, 0, 3, 2, 2, 1, 0, 2. Tentukan frekuensi relatif munculnya bilangan 0.", [pr("Frekuensi relatif =", 4, 15)],
      "Bilangan 0 muncul 4 kali dari 15. Frekuensi relatif {4/15} ≈ 0,27."),
    q(2, "Roda bernomor 1–5 diputar berkali-kali, hasilnya pada diagram. Tentukan frekuensi relatif jarum menunjuk nomor 3.", [n("Banyak putaran =", 50), pr("Frekuensi relatif nomor 3 =", 12, 50)],
      "9 + 8 + 12 + 6 + 15 = 50. Nomor 3: {12/50} = 0,24 = 24%.", { scene: { type: "bars", labels: ["1", "2", "3", "4", "5"], values: [9, 8, 12, 6, 15], xlabel: "Nomor" } }),
    q(2, "Kantong berisi 10 bola merah, kuning, dan hijau. Dari 200 pengambilan dengan pengembalian, hasilnya pada diagram. Dugalah banyak bola setiap warna.", [n("Merah =", 2), n("Kuning =", 3), n("Hijau =", 5)],
      "Merah {38/200} × 10 = 1,9 ≈ 2; kuning {61/200} × 10 ≈ 3; hijau {101/200} × 10 ≈ 5.", { scene: { type: "bars", labels: ["Merah", "Kuning", "Hijau"], values: [38, 61, 101], xlabel: "Warna bola" } }),
    q(2, "Benar atau salah?", [tf(["Frekuensi relatif suatu kejadian selalu sama dengan peluang teoretisnya.", false], ["Jika frekuensi relatif suatu kejadian nol, kejadian itu pasti mustahil.", false], ["Makin banyak percobaan acak, frekuensi relatif makin mendekati peluang teoretis.", true])],
      "Frekuensi relatif hanya mendekati peluang teoretis jika percobaannya banyak. Kejadian yang belum muncul belum tentu mustahil."),
  ],
  // C
  [
    q(3, "Roda putar pada gambar diputar 60 kali. Berapa frekuensi harapan jarum menunjuk warna kuning?", [n("Frekuensi harapan =", 20, "kali")],
      "2 dari 6 juring kuning: {1/3} × 60 = 20 kali.", { scene: { type: "spinner", sectors: [{ color: RED, label: "merah" }, { color: YEL, label: "kuning" }, { color: RED, label: "merah" }, { color: GRN, label: "hijau" }, { color: YEL, label: "kuning" }, { color: RED, label: "merah" }] } }),
    q(3, "Sebuah dadu dilempar 300 kali. Tentukan frekuensi harapan muncul mata dadu lebih dari 3.", [n("Frekuensi harapan =", 150, "kali")], "Mata 4, 5, 6: {3/6} × 300 = 150 kali."),
    q(3, "Di sebuah kota, 28% penduduknya Generasi Z. Jika 75 penduduk dipilih acak, berapa frekuensi harapan terpilih penduduk Generasi Z?", [n("Frekuensi harapan =", 21, "orang")], "0,28 × 75 = 21 orang."),
    q(3, "Tiga koin dilempar bersamaan sebanyak 100 kali. Tentukan frekuensi harapan muncul tepat dua sisi angka.", [pr("Peluang tepat dua angka =", 3, 8), n("Frekuensi harapan =", 37.5, "kali")],
      "AAG, AGA, GAA: {3/8}. {3/8} × 100 = 37,5 kali."),
  ],
  // D
  [
    q(4, "Seorang peneliti ingin mengetahui rata-rata tinggi badan anak berusia 15 tahun di Indonesia.", [ch("Populasinya:", ["Semua anak usia 15 tahun di Indonesia", "Semua penduduk Indonesia", "500 anak usia 15 tahun yang dipilih acak"], "Semua anak usia 15 tahun di Indonesia"), ch("Contoh sampel yang tepat:", ["Semua anak usia 15 tahun di Indonesia", "500 anak usia 15 tahun yang dipilih acak dari berbagai provinsi", "Semua anggota tim basket usia 15 tahun"], "500 anak usia 15 tahun yang dipilih acak dari berbagai provinsi")],
      "Populasi adalah semua anak usia 15 tahun. Sampel adalah sebagiannya, dipilih acak agar mewakili. Tim basket cenderung lebih tinggi."),
    q(4, "Dhien, calon ketua OSIS, ingin tahu persentase siswa yang akan memilihnya. Cara pemilihan sampel mana yang sebaiknya dipakai?", [ch("Jawaban:", ["Bertanya kepada semua teman sekelasnya", "Bertanya kepada siswa urutan ke-3, 6, dan 9 di setiap barisan kelas saat upacara", "Survei melalui media sosial kepada teman-temannya"], "Bertanya kepada siswa urutan ke-3, 6, dan 9 di setiap barisan kelas saat upacara")],
      "Teman sekelas dan pengikut media sosial bukan gambaran seluruh sekolah. Siswa di setiap barisan upacara mewakili semua kelas."),
    q(4, "Diagram titik abu-abu menunjukkan nilai 37 siswa (populasi). Sampel manakah yang representatif?", [ch("Jawaban:", ["a", "b"], "b", [
      { type: "dots", min: 60, max: 86, step: 2, population: popScores, sample: [64, 66, 68, 70, 72], label: "Sampel a" },
      { type: "dots", min: 60, max: 86, step: 2, population: popScores, sample: [65, 70, 73, 75, 80], label: "Sampel b" }])],
      "Sampel a hanya berisi nilai rendah. Sampel b tersebar seperti populasinya dan rata-ratanya (72,6) dekat rata-rata populasi."),
    q(4, "Benar atau salah?", [tf(["Himpunan bagian dari populasi disebut sampel.", true], ["Jika sampel dipilih secara acak, sampel itu pasti representatif.", false], ["Sampel representatif mempunyai bentuk, pusat, dan sebaran yang menyerupai populasi.", true])],
      "Pemilihan acak membuat peluang mendapat sampel representatif besar, tetapi tidak pasti."),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
const flights = [[2, 8, 24], [4, 2, 20]];
export const assessment: PQuestion[] = [
  // Sedang (1-8)
  q(0, "Benar atau salah?", [tf(["Ada kejadian yang tidak mempunyai anggota.", true], ["Tidak ada kejadian yang pasti.", false], ["Jika dadu dilempar 60 kali, kita pasti mendapat mata 6 sebanyak 10 kali.", false])],
    "Jumlah dua mata dadu 1 tidak mempunyai anggota. Melempar dadu dan mendapat mata kurang dari 7 adalah kejadian pasti. 10 kali hanyalah frekuensi harapan.", { level: "Sedang" }),
  q(2, "Sebuah koin dilempar 14 kali dengan hasil: A, G, G, A, G, A, A, G, G, G, A, G, G, A. Tentukan frekuensi relatif muncul sisi gambar (G).", [pr("Frekuensi relatif G =", 8, 14)],
    "G muncul 8 kali dari 14 lemparan: {8/14} = {4/7} ≈ 0,57.", { level: "Sedang" }),
  q(3, "Sebuah dadu dilempar 60 kali. Tentukan frekuensi harapan muncul mata dadu kurang dari 5.", [n("Frekuensi harapan =", 40, "kali")], "Mata 1–4: {4/6} × 60 = 40 kali.", { level: "Sedang" }),
  q(4, "Pertanyaan: \"Berapa persen penduduk Indonesia yang tinggal di perkotaan?\"", [ch("Populasinya:", ["Seluruh penduduk Indonesia", "Penduduk kota-kota besar", "1.000 keluarga yang dipilih acak"], "Seluruh penduduk Indonesia"), ch("Sampel yang paling tepat:", ["Penduduk Jakarta", "Keluarga yang dipilih acak dari semua kabupaten dan kota", "Pengikut sebuah akun media sosial"], "Keluarga yang dipilih acak dari semua kabupaten dan kota")],
    "Pertanyaannya tentang seluruh penduduk Indonesia. Sampel harus mencakup desa dan kota secara acak; penduduk Jakarta saja pasti semuanya di perkotaan.", { level: "Sedang" }),
  q(0, "Dua dadu dilempar. Ketuk semua pasangan yang jumlah mata dadunya 9, lalu tentukan peluangnya.", [{ kind: "grid", label: "Jumlah 9:", answer: dice((a, b) => a + b === 9) }, pr("P(jumlah 9) =", 4, 36)],
    "(3, 6), (4, 5), (5, 4), (6, 3): 4 dari 36, peluangnya {1/9}.", { level: "Sedang" }),
  q(2, "Roda putar diputar berulang-ulang, hasilnya pada diagram. Tentukan frekuensi relatif diperoleh warna hijau.", [pr("Frekuensi relatif hijau =", 32, 50)],
    "18 + 32 = 50 putaran. Hijau {32/50} = 0,64 = 64%.", { level: "Sedang", scene: { type: "bars", labels: ["Merah", "Hijau"], values: [18, 32], xlabel: "Warna juring" } }),
  q(3, "Roda putar terbagi menjadi 8 juring sama besar bernomor 1–8 dan diputar 100 kali. Tentukan frekuensi harapan diperoleh bilangan prima.", [n("Frekuensi harapan =", 50, "kali")],
    "Bilangan prima 1–8: 2, 3, 5, 7. {4/8} × 100 = 50 kali.", { level: "Sedang", scene: { type: "spinner", sectors: Array.from({ length: 8 }, (_, i) => ({ color: [2, 3, 5, 7].includes(i + 1) ? BLU : "#ced4da", label: String(i + 1) })) } }),
  q(4, "Benar atau salah?", [tf(["Jika pemilihan sampel dilakukan secara acak, pasti diperoleh sampel yang representatif.", false], ["Sampel yang distribusinya menyerupai populasi dalam bentuk, pusat, dan sebaran disebut sampel representatif.", true], ["Survei lewat media sosial sekolah selalu mewakili seluruh siswa.", false])],
    "Pemilihan acak hanya membuat peluangnya besar. Media sosial hanya menjangkau pengguna tertentu.", { level: "Sedang" }),
  // Menantang (9-17)
  q(0, "Tiga koin dilempar. Ketuk semua hasil yang termasuk kejadian muncul maksimal satu sisi gambar, lalu tentukan peluangnya.", [{ kind: "pickset", label: "Kejadian maksimal satu G:", items: S3, answer: S3.filter(s => [...s].filter(c => c === "G").length <= 1), tree: 3 }, pr("Peluang =", 4, 8)],
    "AAA, AAG, AGA, GAA: 4 dari 8, peluangnya {1/2}.", { level: "Menantang" }),
  q(2, "Grafik menunjukkan frekuensi relatif suatu kejadian dalam 400 percobaan. Kejadian mana yang paling sesuai?", [ch("Jawaban:", ["Mendapat kartu hati dari satu pak kartu remi", "Mendapat mata dadu bilangan prima", "Memilih acak bilangan 1–4 dan mendapat bilangan lebih dari 1"], "Mendapat kartu hati dari satu pak kartu remi")],
    "Grafik mendekati 0,25. Kartu hati {13/52} = 0,25; dadu prima {3/6} = 0,5; bilangan > 1 dari 1–4 adalah {3/4}.", { level: "Menantang", scene: { type: "rel", p: 0.25, n: 400, seed: 7, title: "Frekuensi relatif kejadian" } }),
  q(3, "Pada Gim Koin, pion bergerak 4 langkah; setiap langkah ditentukan oleh lemparan koin. Pion sampai ke petak A atau E hanya jika keempat lemparan sama (GGGG atau AAAA). Pemain menjalankan 8 pion.", [pr("Peluang satu pion sampai ke A atau E =", 2, 16), n("Frekuensi harapan pion sampai ke A atau E =", 1, "pion")],
    "Ruang sampel 4 lemparan: 2^{4} = 16. Hanya GGGG dan AAAA: {2/16} = {1/8}. Dari 8 pion: {1/8} × 8 = 1 pion.", { level: "Menantang" }),
  q(4, "Diagram titik abu-abu menunjukkan tinggi badan 40 siswa (populasi). Sampel 5 siswa mana yang representatif?", [ch("Jawaban:", ["a", "b"], "b", [
    { type: "dots", min: 140, max: 175, step: 5, population: heights, sample: heights.slice(0, 5), label: "Sampel a: 5 siswa terdepan" },
    { type: "dots", min: 140, max: 175, step: 5, population: heights, sample: [146, 151, 155, 158, 164], label: "Sampel b: diundi" }])],
    "Sampel a hanya siswa terpendek (rata-rata 144,8 cm). Sampel b tersebar dan rata-ratanya 154,8 cm, dekat dengan rata-rata populasi 155,5 cm.", { level: "Menantang" }),
  q(0, "Kantong berisi lima kartu bernomor 1–5. Dua kartu diambil sekaligus. Ketuk semua pasangan yang jumlahnya 6, lalu tentukan peluangnya.", [{ kind: "pickset", label: "Kejadian jumlah 6:", items: pairs(5), answer: ["1-5", "2-4"] }, pr("Peluang =", 2, 10)],
    "Ada 10 pasangan tanpa urutan. Jumlah 6: {1, 5} dan {2, 4}. Peluangnya {2/10} = {1/5}.", { level: "Menantang" }),
  q(2, "Kotak berisi 20 bola. Setelah sangat banyak percobaan pengambilan dengan pengembalian, persentase kemunculan warna seperti pada tabel. Dugalah banyak bola setiap warna.", [n("Merah =", 2), n("Kuning =", 5), n("Hijau =", 13)],
    "9% × 20 = 1,8 ≈ 2; 26% × 20 = 5,2 ≈ 5; 65% × 20 = 13. Jumlahnya 20.", { level: "Menantang", scene: { type: "table", head: ["Warna", "Merah", "Kuning", "Hijau"], rows: [["Kemunculan", "9%", "26%", "65%"]] } }),
  q(3, "Tentukan frekuensi harapan setiap kejadian.", [n("Melempar 3 koin 200 kali, muncul tepat dua sisi angka:", 75, "kali"), n("Mengambil satu kartu remi 100 kali (dikembalikan), tidak mendapat kartu hati:", 75, "kali")],
    "{3/8} × 200 = 75. Bukan hati {39/52} = {3/4}, × 100 = 75.", { level: "Menantang" }),
  q(4, "Koran sekolah memuat dua berita. Berita I: dari 150 pengikut akun media sosial sekolah, 120 memilih kantin buka sampai sore. Berita II: dari 60 siswa yang diundi komputer, 42 setuju jadwal piket baru. Berita mana yang lebih dapat dipercaya?", [ch("Jawaban:", ["Berita I, karena sampelnya lebih besar", "Berita II, karena sampelnya dipilih acak", "Keduanya sama dapat dipercaya"], "Berita II, karena sampelnya dipilih acak")],
    "Pengikut media sosial bukan gambaran semua siswa. Sampel acak lebih mungkin representatif walaupun lebih kecil.", { level: "Menantang" }),
  q(1, "Di sebuah provinsi ada 360 desa di tepi laut dan 40 desa bukan tepi laut. Satu desa dipilih acak untuk dikunjungi. Tentukan peluang terpilih desa di tepi laut.", [pr("Peluang (boleh dalam persen) =", 360, 400)],
    "{360/400} = {9/10} = 90%.", { level: "Menantang" }),
  // Sangat menantang (18-24)
  q(2, "Tiga siswa mengaku melempar koin 20 kali dan melaporkan hasilnya. Laporan siapa yang paling tidak biasa untuk percobaan acak?", [ch("Jawaban:", ["Bentang: AAGAGGAGAAGGGAGAAGGA", "Uleng: AGAGAGAGAGAGAGAGAGAG", "Duma: GGAGAAAGGAGAGGAAGAGG"], "Uleng: AGAGAGAGAGAGAGAGAGAG")],
    "Hasil Uleng selalu berselang-seling tanpa pernah dua sisi sama berturutan. Dalam 20 lemparan acak, hal ini hampir tidak mungkin terjadi.", { level: "Sangat menantang" }),
  q(4, "Putu memutar roda yang terbagi lima juring sama besar bernomor 1–5 sebanyak tiga kali untuk memilih sampel tiga bilangan. Tentukan peluang rata-rata sampelnya kurang dari 2.", [n("Banyak hasil yang mungkin =", 125), pr("Peluang =", 10, 125)],
    "Ruang sampel 5^{3} = 125. Rata-rata < 2 berarti jumlah ≤ 5: jumlah 3 (1 cara), jumlah 4 (3 cara), jumlah 5 (6 cara). Total 10, peluang {10/125} = {2/25}.", { level: "Sangat menantang", id: "roda" }),
  q(1, "Tabel menunjukkan banyak penerbangan kelas ekonomi dari Medan ke Palembang pada suatu tanggal.", [pr("Peluang memilih acak penerbangan yang transit di Batam =", 10, 60), pr("Sondang ingin transit di Jakarta. Peluang penerbangan pilihannya perlu lapor masuk ulang =", 24, 44)],
    "Total 2 + 8 + 24 + 4 + 2 + 20 = 60. Transit Batam 8 + 2 = 10: {10/60} = {1/6}. Transit Jakarta 24 + 20 = 44, yang perlu lapor 24: {24/44} = {6/11}.",
    { level: "Sangat menantang", id: "terbang", scene: { type: "table", caption: "Penerbangan Medan–Palembang", head: ["Lapor masuk ulang", "Tidak transit", "Transit Batam", "Transit Jakarta"], rows: [["Perlu", ...flights[0]], ["Tidak perlu", ...flights[1]]] } }),
  q(3, "Di pasar malam ada 10 bebek karet; 3 di antaranya bertanda merah. Pemain membayar Rp10.000,00, memilih 3 bebek sekaligus, dan mendapat Rp10.000,00 untuk setiap bebek bertanda merah.", [n("Harapan banyak bebek merah per permainan =", 0.9), n("Harapan keuntungan penjual dari 50 pemain = Rp", 50000)],
    "Setiap bebek terpilih berpeluang {3/10} bertanda merah, jadi harapan 3 × {3/10} = 0,9 bebek, atau hadiah Rp9.000,00. Penjual untung Rp1.000,00 per pemain, 50 pemain: Rp50.000,00.", { level: "Sangat menantang", id: "bebek" }),
  q(2, "Karuna menguji ketapelnya 54 kali dan tepat sasaran 45 kali. Paulina menguji 20 kali dan tepat 15 kali. Ketapel dikatakan akurat jika peluang tepat sasarannya lebih dari 80%.", [pr("Frekuensi relatif Karuna =", 45, 54), pr("Frekuensi relatif Paulina =", 15, 20), ch("Ketapel yang akurat:", ["Karuna saja", "Paulina saja", "Keduanya", "Tidak ada"], "Karuna saja")],
    "Karuna {45/54} ≈ 0,83 > 0,8. Paulina {15/20} = 0,75 < 0,8. Data Karuna juga lebih banyak, jadi perkiraannya lebih dapat dipercaya.", { level: "Sangat menantang" }),
  q(4, "Empat anak tingginya 158 cm, 142 cm, 163 cm, dan 147 cm. Tiga anak dipilih sekaligus secara acak. Ketuk semua kelompok yang rata-rata tingginya lebih dari 152 cm, lalu tentukan peluangnya.", [{ kind: "pickset", label: "Kelompok rata-rata > 152 cm:", items: ["158, 142, 163", "158, 142, 147", "158, 163, 147", "142, 163, 147"], answer: ["158, 142, 163", "158, 163, 147"] }, pr("Peluang =", 2, 4)],
    "Rata-rata: (158 + 142 + 163) : 3 = 154,3; (158 + 142 + 147) : 3 = 149; (158 + 163 + 147) : 3 = 156; (142 + 163 + 147) : 3 = 150,7. Dua dari empat: {1/2}.", { level: "Sangat menantang", id: "tinggi" }),
  q(1, "Kuis tiga tirai: satu tirai berisi hadiah. Kamu memilih satu tirai, lalu pembawa acara membuka satu tirai kosong yang tidak kamu pilih dan menawarkan untuk berganti.", [ch("Keputusan terbaik:", ["Tetap pada pilihan awal", "Berganti tirai", "Sama saja"], "Berganti tirai"), pr("Peluang menang jika berganti =", 2, 3)],
    "Pilihan awal benar dengan peluang {1/3}, jadi hadiah ada di dua tirai lainnya dengan peluang {2/3}. Pembawa acara selalu membuka tirai kosong, sehingga berganti memberi peluang menang {2/3}.", { level: "Sangat menantang", id: "tirai" }),
];
