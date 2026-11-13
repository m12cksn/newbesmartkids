/**
 * Kelas 9 Bab 3 - Transformasi Geometri (Buku Siswa Matematika SMP/MTs Kelas IX, Kurikulum Merdeka 2022, hlm. 135-200).
 * A. Translasi  B. Refleksi (1. sumbu x, sumbu y, titik asal; 2. y = x dan y = −x; 3. x = k dan y = h)  C. Rotasi
 * D. Kekongruenan (1. kekongruenan; 2. segi banyak; 3. segitiga)  E. Dilatasi.
 * Bentuk jawaban mengikuti buku: koordinat bayangan, translasi (a, b), benar/salah, pilihan ganda, isian singkat,
 * memasangkan jenis refleksi dengan hasilnya, persamaan garis bayangan, faktor skala, menggambar bayangan pada bidang
 * koordinat (mengetuk titik-titik sudut bayangan), dan soal penerapan (polisi dan pencuri, golf).
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Pt = [number, number];

/* ---------- Angka ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  const f = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t);
  if (f) { const a = num(f[1]), b = num(f[2]); return b === 0 ? NaN : a / b; }
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
export const ptText = ([x, y]: Pt) => `(${idn(x)}, ${idn(y)})`;

/* ---------- Transformasi ---------- */
export type Refl = "sumbu x" | "sumbu y" | "titik O" | "y = x" | "y = −x";
export const translate = ([x, y]: Pt, [a, b]: Pt): Pt => [x + a, y + b];
export function reflect([x, y]: Pt, m: Refl | { x: number } | { y: number }): Pt {
  if (typeof m === "object") return "x" in m ? [2 * m.x - x, y] : [x, 2 * m.y - y];
  return m === "sumbu x" ? [x, -y] : m === "sumbu y" ? [-x, y] : m === "titik O" ? [-x, -y] : m === "y = x" ? [y, x] : [-y, -x];
}
/** Rotasi terhadap O; sudut positif berlawanan arah jarum jam. */
export function rotate([x, y]: Pt, deg: number, c: Pt = [0, 0]): Pt {
  const t = (((deg % 360) + 360) % 360) / 90, dx = x - c[0], dy = y - c[1];
  const r: Pt = t === 0 ? [dx, dy] : t === 1 ? [-dy, dx] : t === 2 ? [-dx, -dy] : [dy, -dx];
  return [r[0] + c[0], r[1] + c[1]];
}
export const dilate = ([x, y]: Pt, k: number, c: Pt = [0, 0]): Pt => [k * (x - c[0]) + c[0], k * (y - c[1]) + c[1]];

/* ---------- Gambar ---------- */
export type Poly = { pts: Pt[]; names?: string; tone?: "awal" | "bayangan" | "lain"; caption?: string };
export type MLine = { x: number } | { y: number } | { m: number; c: number };
export type Scene =
  | { type: "plane"; polys?: Poly[]; points?: { p: Pt; label?: string }[]; lines?: { l: MLine; label?: string }[]; arrows?: [Pt, Pt][]; r?: number }
  | { type: "pairs"; items: { a: Pt[]; b: Pt[]; caption: string }[] }
  | { type: "figure"; w: number; h: number; polys: { pts: Pt[]; fill?: string }[]; labels: { x: number; y: number; t: string }[]; segs?: [Pt, Pt][] }
  | { type: "card"; title: string; lines: string[] };

export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; tol?: number }
  | { kind: "pts"; names: string[]; points: Pt[] }
  | { kind: "vec"; label: string; a: number; b: number }
  | { kind: "choice"; label: string; options: string[]; answer: string; pics?: Scene[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "eq"; label: string; a: number; b: number; c: number }
  | { kind: "match"; left: string[]; right: string[]; answer: string[] }
  | { kind: "plot"; label: string; points: Pt[]; r: number; given?: Poly; mirror?: MLine };

export type TQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[]; id?: string };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "pts" ? p.points.length * 2 : p.kind === "vec" ? 2 : p.kind === "eq" ? 3 : p.kind === "match" ? p.left.length : 1);
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => idn(n).replace(/\./g, "");
export const pickPoints = (v: string): Pt[] => (v ? v.split(";").map(s => s.split(",").map(Number) as Pt) : []);
const setKey = (pts: Pt[]) => pts.map(p => p.join(",")).sort().join(";");
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "pts": return p.points.flatMap(([x, y]) => [str(x), str(y)]);
    case "vec": return [str(p.a), str(p.b)];
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "eq": return [str(p.a), str(p.b), str(p.c)];
    case "match": return p.answer;
    case "plot": return [p.points.map(q => q.join(",")).join(";")];
  }
}
const near = (a: number, b: number, tol = 0) => !Number.isNaN(a) && Math.abs(a - b) <= Math.max(tol, 1e-9 * Math.max(1, Math.abs(b)));
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return near(num(v), p.value, p.tol);
    case "pts": return p.points.every(([a, b], k) => near(num(x[2 * k]), a) && near(num(x[2 * k + 1]), b));
    case "vec": return near(num(x[0]), p.a) && near(num(x[1]), p.b);
    case "eq": { const [a, b, c] = x.map(num); if ([a, b, c].some(Number.isNaN) || (a === 0 && b === 0)) return false;
      const z = (u: number) => Math.abs(u) < 1e-9; return z(a * p.b - b * p.a) && z(a * p.c - c * p.a) && z(b * p.c - c * p.b); }
    case "plot": return setKey(pickPoints(v)) === setKey(p.points);
    default: return x.join("|") === fields(p).join("|");
  }
}
const partReady = (p: Part, v: string) => (p.kind === "num" || p.kind === "choice" || p.kind === "plot" ? v.trim() !== "" : cells(p, v).every(c => c.trim() !== ""));
export const correct = (q: TQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: TQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/√\{([^}]*)\}/g, "√$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2").replace(/[{}]/g, "");
export function formatAnswer(q: TQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "pts": return p.names.map((n, k) => `${n}(${x[2 * k]}, ${x[2 * k + 1]})`).join(", ");
      case "vec": return `${plain(p.label)} (${x[0]}, ${x[1]})`;
      case "choice": return `${plain(p.label)} ${plain(v[i]) || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      case "eq": return `${plain(p.label)} (${x[0]})x + (${x[1]})y = ${x[2]}`;
      case "match": return p.left.map((l, k) => `${l} → ${x[k]}`).join("; ");
      case "plot": { const pts = pickPoints(v[i]); return `${plain(p.label)} ${pts.length ? pts.map(ptText).join(", ") : "…"}`; }
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: number, prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene; id?: string } = {}): TQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string, tol?: number): Part => ({ kind: "num", label, value, unit, tol });
const pts = (names: string[], points: Pt[]): Part => ({ kind: "pts", names, points });
const vec = (label: string, [a, b]: Pt): Part => ({ kind: "vec", label, a, b });
const ch = (label: string, options: string[], answer: string, pics?: Scene[]): Part => ({ kind: "choice", label, options, answer, pics });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const eq = (label: string, a: number, b: number, c: number): Part => ({ kind: "eq", label, a, b, c });
const plot = (label: string, points: Pt[], r: number, given?: Poly, mirror?: MLine): Part => ({ kind: "plot", label, points, r, given, mirror });
const map = (ps: Pt[], f: (p: Pt) => Pt) => ps.map(f);
const plane = (polys: Poly[], extra: Omit<Extract<Scene, { type: "plane" }>, "type" | "polys"> = {}): Scene => ({ type: "plane", polys, ...extra });

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Translasi (Pergeseran)", sections: [
    { title: "Translasi titik, bangun, dan garis", lab: "translate", steps: [
      "Translasi (pergeseran) adalah perubahan posisi suatu objek (titik, garis, atau bangun) dengan jarak dan arah tertentu. Semua titik pada objek bergeser sama jauh dan searah.",
      "Translasi ditulis sebagai pasangan bilangan (a, b) yang disusun tegak: a komponen mendatar, b komponen tegak. a > 0 berarti ke kanan, a < 0 ke kiri; b > 0 ke atas, b < 0 ke bawah.",
      "Bayangan titik A(x, y) oleh translasi (a, b) adalah A'(x + a, y + b).",
      "Untuk mentranslasikan bangun, translasikan setiap titik sudutnya, lalu hubungkan bayangan titik-titik itu. Bentuk, ukuran, dan arah hadap bangun tidak berubah.",
      "Jika diketahui titik awal A dan bayangannya A', translasinya adalah A' − A: (x' − x, y' − y). Translasi dari B kembali ke A adalah lawannya, (−a, −b).",
      "Untuk mentranslasikan garis, ambil dua titik pada garis (misalnya titik potong sumbu), translasikan keduanya, lalu tentukan persamaan garis melalui kedua bayangan. Cara cepat: ganti x dengan x − a dan y dengan y − b.",
    ], life: "Saat memindahkan meja di kelas, semua kaki meja bergeser sama jauh ke arah yang sama: itu translasi. Di permainan catur, benteng bergerak lurus beberapa petak tanpa berputar. Di peta digital, petunjuk \"jalan 300 m ke timur lalu 200 m ke utara\" dapat ditulis sebagai translasi (300, 200).",
      example: "Persegi ABCD dengan A(1, 1), B(3, 1), C(3, 3), D(1, 3) digeser 4 satuan ke kiri dan 2 satuan ke atas. Tentukan bayangannya.",
      work: ["Translasinya (−4, 2).", "A'(1 − 4, 1 + 2) = A'(−3, 3), B'(−1, 3).", "C'(−1, 5), D'(−3, 5).", "Garis 2x + 3y = 6 ditranslasi (−4, 3): ganti x dengan x + 4 dan y dengan y − 3, didapat 2x + 3y = 0."],
      notes: ["Urutan komponen penting: (4, −3) berarti 4 ke kanan dan 3 ke bawah, bukan sebaliknya.", "Dua translasi berturut-turut sama dengan satu translasi yang komponennya dijumlahkan: (4, 5) lalu (−6, −8) sama dengan (−2, −3).", "Bangun hasil translasi selalu kongruen dan menghadap arah yang sama dengan bangun asal."],
      demo: "Atur komponen translasi a dan b. Segitiga dan bayangannya ditampilkan bersama panah pergeserannya." },
  ] },
  { code: "B", title: "Refleksi (Pencerminan)", sections: [
    { title: "Refleksi terhadap sumbu x, sumbu y, dan titik asal", lab: "reflAxis", steps: [
      "Refleksi memindahkan setiap titik dengan sifat cermin datar. Garis cermin disebut garis refleksi.",
      "Sifat refleksi: jarak titik asal ke garis refleksi sama dengan jarak bayangannya ke garis itu, dan ruas garis AA' tegak lurus garis refleksi.",
      "Terhadap sumbu x: P(x, y) → P'(x, −y). Terhadap sumbu y: P(x, y) → P'(−x, y).",
      "Terhadap titik asal O(0, 0): P(x, y) → P'(−x, −y). Titik O membagi ruas PP' sama panjang, seperti lubang pada kamera lubang jarum.",
      "Refleksi terhadap sumbu x lalu sumbu y sama dengan refleksi terhadap titik O.",
      "Bayangan hasil refleksi mempunyai orientasi berlawanan: tangan kanan di cermin tampak sebagai tangan kiri.",
    ], life: "Saat bercermin sambil mengangkat tangan kanan, bayanganmu mengangkat tangan kiri. Permukaan danau yang tenang memantulkan gunung secara terbalik: garis tepi danau adalah sumbu refleksinya. Tulisan AMBULANS di depan mobil ambulans dicetak terbalik agar terbaca benar di kaca spion.",
      example: "Segitiga ABC dengan A(−1, 1), B(−5, 3), C(−3, −2) direfleksikan terhadap sumbu y.",
      work: ["Sumbu y: (x, y) → (−x, y).", "A'(1, 1), B'(5, 3), C'(3, −2).", "Garis y = 2x + 5 direfleksikan terhadap sumbu x: ganti y dengan −y, −y = 2x + 5.", "Jadi bayangannya 2x + y = −5 (setara dengan 4x + 2y = −10)."],
      notes: ["Refleksi sumbu x mengubah tanda y, refleksi sumbu y mengubah tanda x. Mudah tertukar: ingat yang tidak berubah adalah koordinat pada sumbunya.", "Titik yang terletak pada garis refleksi tidak berpindah.", "Bayangan refleksi kongruen dengan bangun asal."],
      demo: "Geser titik P dan pilih cerminnya. Titik P, bayangannya, dan garis tegak lurus ke cermin ditampilkan." },
    { title: "Refleksi terhadap garis y = x dan y = −x", lab: "reflDiag", steps: [
      "Garis y = x membagi kuadran I dan III menjadi dua sama besar. Garis y = −x membagi kuadran II dan IV.",
      "Terhadap garis y = x: P(x, y) → P'(y, x). Koordinatnya bertukar tempat.",
      "Terhadap garis y = −x: P(x, y) → P'(−y, −x). Koordinat bertukar tempat dan keduanya berganti tanda.",
      "Periksa dengan sifat cermin: titik tengah PP' terletak pada garis cermin, dan PP' tegak lurus garis itu.",
      "Refleksi terhadap y = x lalu y = −x sama dengan rotasi 180° terhadap O.",
    ], life: "Tabel jadwal pelajaran yang dibalik baris dan kolomnya (hari menjadi kolom, jam menjadi baris) mirip refleksi terhadap garis y = x: posisi (baris, kolom) bertukar menjadi (kolom, baris). Pola ubin lantai bermotif diagonal juga memakai cermin miring seperti ini.",
      example: "Tentukan bayangan T(3, −4) terhadap y = x dan U(−4, −3) terhadap y = −x.",
      work: ["y = x: tukar koordinat, T'(−4, 3).", "y = −x: tukar dan ganti tanda, U'(3, 4).", "Periksa T: titik tengah TT' = (−{1/2}, −{1/2}) terletak pada y = x.", "Kemiringan TT' = −1, tegak lurus y = x yang kemiringannya 1."],
      notes: ["Jangan lupa mengganti kedua tanda pada refleksi y = −x.", "Titik pada garis y = x, misalnya (2, 2), tidak berpindah jika dicerminkan terhadap y = x.", "Refleksi ini juga berlaku untuk bangun: cerminkan setiap titik sudutnya."],
      demo: "Geser titik P dan pilih garis y = x atau y = −x. Bayangannya dan titik tengahnya pada garis cermin ditampilkan." },
    { title: "Refleksi terhadap garis x = k dan y = h", lab: "reflLine", steps: [
      "Garis x = k tegak, sejajar sumbu y. Garis y = h mendatar, sejajar sumbu x.",
      "Terhadap x = k: P(x, y) → P'(2k − x, y). Hanya koordinat x yang berubah; jarak ke garis tetap sama.",
      "Terhadap y = h: P(x, y) → P'(x, 2h − y). Hanya koordinat y yang berubah.",
      "Cara memahami: jarak P ke garis x = k adalah x − k, jadi bayangannya berada k − (x − k) = 2k − x.",
      "Refleksi terhadap x = k lalu y = h sama dengan refleksi terhadap titik (k, h).",
    ], life: "Jalan di kompleks perumahan sering dirancang simetris terhadap jalan utama. Jika jalan utama adalah garis x = 3 dan rumah Rina berada di (−1, 2), rumah yang posisinya sama di seberang jalan berada di (7, 2). Kupu-kupu dan rumah adat Minangkabau juga simetris terhadap garis tegak di tengahnya.",
      example: "Ruas garis PQ dengan P(−3, 2) dan Q(4, −1) direfleksikan terhadap x = 3 dan terhadap y = 3.",
      work: ["x = 3: P'(6 + 3, 2) = (9, 2), Q'(6 − 4, −1) = (2, −1).", "y = 3: P'(−3, 6 − 2) = (−3, 4), Q'(4, 6 + 1) = (4, 7).", "Periksa: jarak P ke x = 3 adalah 6, jarak P' ke x = 3 juga 6.", "Untuk W(u, v) dicerminkan terhadap y = 3 menjadi W'(−3, 2): u = −3 dan 6 − v = 2, jadi v = 4."],
      notes: ["x = 0 adalah sumbu y, dan y = 0 adalah sumbu x: rumus 2k − x memberi −x, sesuai.", "Jangan memakai rumus refleksi x = k untuk garis y = h.", "Refleksi dua kali terhadap garis yang sejajar sama dengan sebuah translasi."],
      demo: "Pilih garis tegak x = k atau mendatar y = h, atur k atau h, lalu geser titik P." },
  ] },
  { code: "C", title: "Rotasi (Perputaran)", sections: [
    { title: "Rotasi terhadap titik pusat O(0, 0)", lab: "rotate", steps: [
      "Rotasi memutar objek terhadap titik tetap (pusat rotasi) sejauh sudut tertentu. Rotasi ditentukan oleh pusat, besar sudut, dan arahnya.",
      "Berlawanan arah jarum jam disebut arah positif (+), searah jarum jam disebut arah negatif (−).",
      "Terhadap O(0, 0): rotasi 90° (berlawanan arah jarum jam) P(x, y) → P'(−y, x). Rotasi −90° (searah jarum jam) P(x, y) → P'(y, −x).",
      "Rotasi 180° (ke arah mana pun) P(x, y) → P'(−x, −y), sama dengan refleksi terhadap titik O. Rotasi 270° sama dengan rotasi −90°.",
      "Jarak setiap titik ke pusat rotasi tidak berubah, dan sudut antara OP dan OP' sama dengan sudut rotasi.",
      "Dua rotasi berturut-turut dengan pusat sama dapat digabung: 140° lalu 260° sama dengan 400°, yaitu 40°.",
    ], life: "Bianglala berputar terhadap porosnya: setiap kabin bergerak pada lingkaran, jaraknya ke poros tetap. Jarum jam berputar searah jarum jam (arah negatif) 6° setiap menit. Saat memutar layar ponsel dari posisi tegak ke mendatar, gambar dirotasi 90°.",
      example: "Segitiga PQR dengan P(5, −3), Q(4, 4), R(−3, 1) dirotasikan 90° berlawanan arah jarum jam terhadap O.",
      work: ["Rumus 90°: (x, y) → (−y, x).", "P'(3, 5), Q'(−4, 4), R'(−1, −3).", "Periksa jarak: OP = √{25 + 9} = √{34}, OP' = √{9 + 25} = √{34}.", "Dengan −90°: P' akan menjadi (−3, −5)."],
      notes: ["Hafalkan sambil membayangkan: titik (1, 0) diputar 90° berlawanan arah jarum jam menjadi (0, 1).", "Refleksi terhadap dua garis yang berpotongan sama dengan sebuah rotasi; misalnya sumbu x lalu sumbu y = rotasi 180°.", "Rotasi tidak mengubah orientasi bangun (beda dengan refleksi)."],
      demo: "Geser titik P dan pilih sudut rotasi. Segitiga dan bayangannya ditampilkan, lengkap dengan busur sudut terhadap O." },
  ] },
  { code: "D", title: "Kekongruenan", sections: [
    { title: "Kekongruenan dan transformasi kaku", lab: "rigid", steps: [
      "Translasi, refleksi, dan rotasi tidak mengubah bentuk dan ukuran objek, sehingga disebut transformasi kaku. Dilatasi bukan transformasi kaku karena mengubah ukuran.",
      "Dua bangun datar kongruen jika ada satu transformasi kaku atau rangkaiannya yang membuat bangun pertama tepat berimpit dengan bangun kedua.",
      "Untuk membuktikan kongruen, tunjukkan rangkaian transformasinya, misalnya translasi lalu rotasi 90°.",
      "Untuk membuktikan tidak kongruen, cukup tunjukkan satu perbedaan bentuk atau ukuran, misalnya sudutnya berbeda.",
      "Dua bangun yang kongruen mempunyai keliling dan luas yang sama, tetapi bangun dengan luas sama belum tentu kongruen.",
    ], life: "Jendela-jendela pada rumah adat Minangkabau bentuk dan ukurannya sama: satu jendela dapat digeser atau dicerminkan menjadi jendela lain. Ubin lantai, kartu remi, dan potongan tangram yang sama juga kongruen. Pabrik memakai cetakan agar setiap produk kongruen dengan yang lain.",
      example: "Bangun I digeser lalu diputar 90° sehingga tepat menutupi bangun II. Apakah keduanya kongruen?",
      work: ["Translasi dan rotasi adalah transformasi kaku.", "Rangkaian keduanya juga tidak mengubah bentuk dan ukuran.", "Bangun I tepat berimpit dengan bangun II.", "Jadi bangun I dan II kongruen."],
      notes: ["Jajar genjang dengan sisi sama tetapi sudut berbeda tidak kongruen dengan persegi panjang.", "Persegi yang diperbesar (dilatasi) sebangun, tetapi tidak kongruen.", "Tangram: setiap bentuk yang dibuat memakai potongan-potongan yang kongruen dengan potongan aslinya."],
      demo: "Gerakkan bangun merah dengan tombol geser, putar, dan cerminkan sampai tepat menutupi bangun biru." },
    { title: "Kekongruenan pada segi banyak", lab: "polygon", steps: [
      "Saat dua segi banyak berimpit, titik-titik yang bertemu disebut titik yang bersesuaian; demikian juga sisi dan sudutnya.",
      "Dua segi banyak kongruen jika sisi-sisi yang bersesuaian sama panjang dan sudut-sudut yang bersesuaian sama besar.",
      "Kedua syarat harus dipenuhi. Persegi panjang 6 × 12 dan jajar genjang bersisi 6 dan 12 sisinya sama, tetapi sudutnya berbeda, jadi tidak kongruen.",
      "Persegi panjang 6 × 12 dan 9 × 18 sudutnya sama (semuanya 90°), tetapi sisinya berbeda, jadi tidak kongruen.",
      "Urutan nama menunjukkan pasangan yang bersesuaian: jika ABCD ≅ KLMN, maka AB = KL, ∠C = ∠M, dan seterusnya.",
    ], life: "Dua kaca jendela yang dipesan dengan ukuran sisi sama belum tentu bisa saling ditukar: jika sudutnya berbeda (satu persegi panjang, satu jajar genjang), kacanya tidak pas. Tukang kaca selalu mengukur panjang sisi dan memastikan sudutnya siku-siku.",
      example: "Segi empat ABCD ≅ PQRS dengan AB = 8 cm, BC = 5 cm, ∠B = 110°, dan ∠C = 70°. Tentukan PQ dan ∠R.",
      work: ["Pasangan bersesuaian mengikuti urutan huruf: A–P, B–Q, C–R, D–S.", "AB bersesuaian dengan PQ, jadi PQ = 8 cm.", "∠C bersesuaian dengan ∠R, jadi ∠R = 70°.", "QR = BC = 5 cm dan ∠Q = ∠B = 110°."],
      notes: ["Periksa sisi dan sudut, bukan hanya salah satunya.", "Segi enam beraturan dengan panjang sisi sama selalu kongruen, karena sudutnya pasti sama (120°).", "Keliling dua segi banyak kongruen selalu sama."],
      demo: "Bandingkan persegi panjang I dengan bangun lain. Sisi dan sudut yang bersesuaian dicocokkan satu per satu." },
    { title: "Kekongruenan segitiga", lab: "triangle", steps: [
      "Untuk segitiga ada cara lebih singkat daripada memeriksa enam ukuran. Cukup tiga ukuran yang tepat.",
      "S.S.S: ketiga sisi yang bersesuaian sama panjang.",
      "S.Sd.S: dua sisi sama panjang dan sudut yang diapit kedua sisi itu sama besar.",
      "Sd.S.Sd: dua sudut sama besar dan sisi di antara kedua sudut itu sama panjang. Karena jumlah sudut segitiga 180°, dua sudut sama berarti sudut ketiga juga sama.",
      "S.S.Sd (dua sisi dan sudut yang tidak diapit) tidak menjamin kongruen, karena dapat terbentuk dua segitiga yang berbeda. Notasi kongruen ditulis ≅, misalnya ΔTDR ≅ ΔSBW.",
    ], life: "Rangka atap rumah dan jembatan memakai banyak segitiga kongruen. Tukang las cukup mengukur tiga batang besi (S.S.S) agar semua rangka segitiga sama persis. Rangka segitiga juga kuat: bentuknya tidak bisa berubah tanpa mengubah panjang batangnya.",
      example: "Pada ΔABC, AD membagi ∠BAC sama besar dan tegak lurus BC. Buktikan ΔABC sama kaki.",
      work: ["∠BAD = ∠CAD (AD garis bagi).", "∠ADB = ∠ADC = 90° (AD tegak lurus BC).", "AD = AD (sisi bersama, di antara kedua sudut itu).", "Sd.S.Sd: ΔADB ≅ ΔADC, jadi AB = AC dan ΔABC sama kaki."],
      notes: ["Jika ΔMDN ≅ ΔKPG, maka MN = KG (huruf pertama dan ketiga berpasangan).", "Sd.Sd.Sd (tiga sudut sama) hanya menjamin sebangun, bukan kongruen.", "Tulis alasan setiap langkah pembuktian."],
      demo: "Pilih kriteria. Dua segitiga dibangun dari ukuran yang sama; untuk S.S.Sd ada dua segitiga berbeda yang memenuhi." },
  ] },
  { code: "E", title: "Dilatasi", sections: [
    { title: "Dilatasi terhadap O dan terhadap titik P", lab: "dilate", steps: [
      "Dilatasi memperbesar atau memperkecil bangun dengan pusat dan faktor skala k. Dinotasikan [O, k] atau [P(a, b), k].",
      "Faktor skala k = {jarak pusat ke A'/jarak pusat ke A}. Jika k negatif, bayangan berada di seberang pusat.",
      "Terhadap O(0, 0): A(x, y) → A'(kx, ky).",
      "Terhadap P(a, b): A(x, y) → A'(k(x − a) + a, k(y − b) + b).",
      "|k| > 1 memperbesar, 0 < |k| < 1 memperkecil, k = −1 sama dengan rotasi 180° terhadap pusat.",
      "Bayangan dilatasi sebangun dengan bangun asal: sudutnya sama, panjang sisi dikali |k|, dan luas dikali k^{2}.",
    ], life: "Pas foto 3 × 4 dan 4 × 6 dari satu file adalah hasil dilatasi: bentuknya sama, ukurannya berbeda. Proyektor di kelas memperbesar gambar dari lensanya (pusat dilatasi) ke layar. Fitur zoom pada peta digital juga dilatasi dengan pusat di titik yang kamu sentuh.",
      example: "Persegi panjang EFGH dengan E(1, 0), F(3, 0), G(3, 1), H(1, 1) didilatasi [P(2, 3), 2].",
      work: ["E': (2(1 − 2) + 2, 2(0 − 3) + 3) = (0, −3).", "F': (2(3 − 2) + 2, −3) = (4, −3).", "G'(4, −1), H'(0, −1).", "Sisi 2 × 1 menjadi 4 × 2, luasnya 2 menjadi 8 = 2^{2} × 2."],
      notes: ["Dilatasi tidak termasuk transformasi kaku, karena ukurannya berubah.", "Luas bayangan = k^{2} × luas awal, bukan k × luas awal.", "Untuk mencari k dari gambar, bandingkan jarak titik bayangan dan titik asal ke pusat."],
      demo: "Atur faktor skala dan pilih pusat O atau P(2, 3). Garis dari pusat melalui setiap titik sudut ditampilkan." },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: t.sections.length > 1 ? `${t.code}.${j + 1}` : t.code, topic: t })));

/* ---------- Bangun yang dipakai ---------- */
const triPQR: Pt[] = [[-3, 1], [-1, 1], [-2, 3]];
const triY: Pt[] = [[-1, 1], [-5, 3], [-3, -2]];
const triH: Pt[] = [[-2, 4], [1, 5], [0, 7]];
const triK: Pt[] = [[2, 3], [4, 2], [3, 5]];
const quadE: Pt[] = [[-4, 1], [-2, 1], [-1, 3], [-3, 3]];
const triD: Pt[] = [[3, 2], [5, 1], [5, 4]];
const rect = (x: number, y: number, w: number, h: number): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const REF = ["Sumbu x", "Sumbu y", "Titik O", "y = x", "y = −x", "x = 2", "y = 1"];
const REFM: (Refl | { x: number } | { y: number })[] = ["sumbu x", "sumbu y", "titik O", "y = x", "y = −x", { x: 2 }, { y: 1 }];

/* ---------- Latihan: 4 soal per bagian ---------- */
export const practice: TQuestion[][] = [
  // A Translasi
  [
    q(0, "Apakah bangun biru merupakan hasil translasi bangun merah?", [{ kind: "classify", options: ["Translasi", "Bukan translasi"], rows: [
      { text: "Pasangan a", answer: "Translasi" }, { text: "Pasangan b", answer: "Bukan translasi" }, { text: "Pasangan c", answer: "Translasi" }] }],
      "a dan c hanya bergeser. Pada b bangunnya juga berputar, jadi bukan translasi.",
      { scene: { type: "pairs", items: [
        { a: [[0, 0], [2, 0], [0, 3]], b: [[3, 1], [5, 1], [3, 4]], caption: "a" },
        { a: [[0, 0], [2, 0], [0, 3]], b: [[5, 2], [5, 4], [2, 2]], caption: "b" },
        { a: [[0, 0], [3, 0], [4, 2], [1, 2]], b: [[1, 2], [4, 2], [5, 4], [2, 4]], caption: "c" }] } }),
    q(0, "Benar atau salah?", [tf(["Translasi 4 satuan ke kanan dan 3 satuan ke bawah ditulis (4, 3).", false], ["Bayangan A(3, 2) oleh translasi (−3, 5) adalah A'(0, 7).", true])],
      "3 ke bawah adalah −3, jadi (4, −3). A'(3 − 3, 2 + 5) = (0, 7)."),
    q(0, "Bayangan titik A(−3, 4) oleh translasi (5, −2) adalah …", [ch("Jawaban:", ["A'(2, 2)", "A'(−8, 6)", "A'(2, −6)", "A'(8, 2)"], "A'(2, 2)")],
      "A'(−3 + 5, 4 − 2) = A'(2, 2)."),
    q(0, "Segitiga PQR ditranslasikan oleh (4, −2). Gambar bayangannya: ketuk ketiga titik sudut bayangan pada bidang koordinat.", [plot("Bayangan P'Q'R':", map(triPQR, p => translate(p, [4, -2])), 5, { pts: triPQR, names: "PQR" })],
      "P(−3, 1) → (1, −1), Q(−1, 1) → (3, −1), R(−2, 3) → (2, 1)."),
  ],
  // B.1
  [
    q(1, "Segitiga ABC dengan A(2, 1), B(5, 2), C(3, 4) direfleksikan terhadap sumbu x. Tentukan bayangannya.", [pts(["A'", "B'", "C'"], map([[2, 1], [5, 2], [3, 4]], p => reflect(p, "sumbu x")))],
      "Sumbu x: (x, y) → (x, −y). A'(2, −1), B'(5, −2), C'(3, −4)."),
    q(1, "Refleksikan segitiga ABC terhadap sumbu y: ketuk ketiga titik sudut bayangannya.", [plot("Bayangan A'B'C':", map(triY, p => reflect(p, "sumbu y")), 6, { pts: triY, names: "ABC" }, { x: 0 })],
      "Sumbu y: (x, y) → (−x, y). A'(1, 1), B'(5, 3), C'(3, −2)."),
    q(1, "Tentukan bayangan garis y = 2x + 3 jika direfleksikan terhadap sumbu x. Tulis dalam bentuk ax + by = c.", [eq("Bayangan:", 2, 1, -3)],
      "Ganti y dengan −y: −y = 2x + 3, jadi 2x + y = −3. Bentuk setara juga benar."),
    q(1, "Ruas garis PQ dengan P(−3, 1) dan Q(3, 3) direfleksikan terhadap titik pusat O(0, 0).", [pts(["P'", "Q'"], map([[-3, 1], [3, 3]], p => reflect(p, "titik O")))],
      "Titik O: (x, y) → (−x, −y). P'(3, −1), Q'(−3, −3)."),
  ],
  // B.2
  [
    q(2, "Tentukan bayangan T(5, −2) terhadap garis y = x dan U(−1, −6) terhadap garis y = −x.", [pts(["T'", "U'"], [reflect([5, -2], "y = x"), reflect([-1, -6], "y = −x")])],
      "y = x: tukar, T'(−2, 5). y = −x: tukar dan ganti tanda, U'(6, 1)."),
    q(2, "Lengkapi tabel bayangan refleksi titik A(4, 1) dan B(−2, 5).", [pts(["A' (y = x)", "A' (y = −x)", "B' (y = x)", "B' (y = −x)"], [reflect([4, 1], "y = x"), reflect([4, 1], "y = −x"), reflect([-2, 5], "y = x"), reflect([-2, 5], "y = −x")])],
      "A: (1, 4) dan (−1, −4). B: (5, −2) dan (−5, 2)."),
    q(2, "Refleksikan segitiga HIJ terhadap garis y = x: ketuk ketiga titik sudut bayangannya.", [plot("Bayangan H'I'J':", map(triH, p => reflect(p, "y = x")), 7, { pts: triH, names: "HIJ" }, { m: 1, c: 0 })],
      "Tukar koordinat: H'(4, −2), I'(5, 1), J'(7, 0)."),
    q(2, "Bayangan titik P(x, y) yang direfleksikan terhadap garis y = −x adalah …", [ch("Jawaban:", ["P'(y, x)", "P'(−y, −x)", "P'(−x, −y)", "P'(x, −y)"], "P'(−y, −x)")],
      "Tukar koordinat lalu ganti kedua tanda."),
  ],
  // B.3
  [
    q(3, "Ruas garis PQ dengan P(−3, 2) dan Q(4, −1) direfleksikan terhadap garis x = 3.", [pts(["P'", "Q'"], map([[-3, 2], [4, -1]], p => reflect(p, { x: 3 })))],
      "x = 3: (x, y) → (6 − x, y). P'(9, 2), Q'(2, −1)."),
    q(3, "Ruas garis AB dengan A(−2, 3) dan B(3, 5) direfleksikan terhadap garis y = 4.", [pts(["A'", "B'"], map([[-2, 3], [3, 5]], p => reflect(p, { y: 4 })))],
      "y = 4: (x, y) → (x, 8 − y). A'(−2, 5), B'(3, 3)."),
    q(3, "Refleksikan segitiga ABC terhadap garis y = 2: ketuk ketiga titik sudut bayangannya.", [plot("Bayangan A'B'C':", map([[-2, 4], [1, 5], [2, 3]], p => reflect(p, { y: 2 })), 6, { pts: [[-2, 4], [1, 5], [2, 3]], names: "ABC" }, { y: 2 })],
      "y = 2: (x, y) → (x, 4 − y). A'(−2, 0), B'(1, −1), C'(2, 1)."),
    q(3, "Titik W(u, v) dicerminkan terhadap garis y = 3 menghasilkan W'(−3, 2). Tentukan u + v.", [n("u =", -3), n("v =", 4), n("u + v =", 1)],
      "Refleksi y = 3: (u, v) → (u, 6 − v). u = −3 dan 6 − v = 2, v = 4. u + v = 1."),
  ],
  // C Rotasi
  [
    q(4, "Segitiga PQR dengan P(4, −2), Q(3, 5), R(−2, 1) dirotasikan 90° berlawanan arah jarum jam terhadap O.", [pts(["P'", "Q'", "R'"], map([[4, -2], [3, 5], [-2, 1]], p => rotate(p, 90)))],
      "(x, y) → (−y, x). P'(2, 4), Q'(−5, 3), R'(−1, −2)."),
    q(4, "Lengkapi hasil rotasi titik (2, 3) terhadap O.", [pts(["−90°", "180°", "90°"], [rotate([2, 3], -90), rotate([2, 3], 180), rotate([2, 3], 90)])],
      "−90°: (y, −x) = (3, −2). 180°: (−2, −3). 90°: (−y, x) = (−3, 2)."),
    q(4, "Rotasikan segitiga KLM sebesar −90° (searah jarum jam) terhadap O: ketuk ketiga titik sudut bayangannya.", [plot("Bayangan K'L'M':", map(triK, p => rotate(p, -90)), 6, { pts: triK, names: "KLM" })],
      "(x, y) → (y, −x). K'(3, −2), L'(2, −4), M'(5, −3)."),
    q(4, "Refleksi terhadap sumbu x dilanjutkan refleksi terhadap sumbu y menghasilkan bayangan yang sama dengan rotasi terhadap O sebesar …", [ch("Jawaban:", ["90°", "180°", "270°", "360°"], "180°")],
      "(x, y) → (x, −y) → (−x, −y), sama dengan rotasi 180°."),
  ],
  // D.1
  [
    q(5, "Benar atau salah?", [tf(["Bangun datar dan bayangannya akibat rotasi selalu kongruen.", true], ["Dua bangun datar yang kongruen mempunyai luas dan keliling yang sama.", true], ["Untuk menentukan kekongruenan dua bangun datar, kita selalu harus menguji semua sisi dan sudutnya.", false])],
      "Rotasi adalah transformasi kaku. Kongruen berarti bentuk dan ukuran sama. Cukup juga menunjukkan transformasi kaku yang membuat keduanya berimpit."),
    q(5, "Manakah yang termasuk transformasi kaku?", [{ kind: "classify", options: ["Kaku", "Bukan kaku"], rows: [{ text: "Translasi", answer: "Kaku" }, { text: "Refleksi", answer: "Kaku" }, { text: "Rotasi", answer: "Kaku" }, { text: "Dilatasi", answer: "Bukan kaku" }] }],
      "Dilatasi mengubah ukuran, jadi bukan transformasi kaku."),
    q(5, "Bangun I dibawa tepat ke bangun II. Transformasi kaku manakah yang dipakai?", [ch("Jawaban:", ["Refleksi terhadap sumbu y", "Translasi (4, 0)", "Rotasi 90° terhadap O", "Dilatasi [O, −1]"], "Refleksi terhadap sumbu y")],
      "Setiap titik (x, y) pada I menjadi (−x, y) pada II, dan arah hadapnya terbalik.",
      { scene: plane([{ pts: [[-4, 1], [-1, 1], [-1, 2], [-3, 2], [-3, 4], [-4, 4]], names: "I", tone: "awal" }, { pts: [[4, 1], [1, 1], [1, 2], [3, 2], [3, 4], [4, 4]], names: "II", tone: "bayangan" }], { r: 5 }) }),
    q(5, "Manakah bangun yang kongruen dengan bangun I?", [ch("Jawaban:", ["II", "III", "IV"], "III")],
      "III adalah I yang diputar 180°, jadi bentuk dan ukurannya sama. II lebih besar, IV bentuknya berbeda.",
      { scene: plane([{ pts: [[1, 1], [4, 1], [1, 3]], names: "I", tone: "awal" }, { pts: [[-5, 1], [-1, 1], [-5, 4]], names: "II", tone: "lain" }, { pts: [[-1, -1], [-4, -1], [-1, -3]], names: "III", tone: "lain" }, { pts: [[1, -1], [4, -1], [2, -3]], names: "IV", tone: "lain" }], { r: 5 }) }),
  ],
  // D.2
  [
    q(6, "Dari segi empat II, III, dan IV, manakah yang kongruen dengan persegi panjang I (6 × 12)?", [ch("Jawaban:", ["II (persegi panjang 9 × 18)", "III (jajar genjang bersisi 6 dan 12)", "IV (persegi panjang 12 × 6)"], "IV (persegi panjang 12 × 6)")],
      "II sisinya berbeda. III sisinya sama tetapi sudutnya bukan 90°. IV sisi dan sudutnya sama (hanya diputar)."),
    q(6, "Segi empat ABCD ≅ PQRS dengan AB = 8 cm, BC = 5 cm, ∠B = 110°, ∠C = 70°.", [n("PQ =", 8, "cm"), n("QR =", 5, "cm"), n("∠R =", 70, "°")],
      "A–P, B–Q, C–R: PQ = AB = 8, QR = BC = 5, ∠R = ∠C = 70°."),
    q(6, "Benar atau salah?", [tf(["Dua segi banyak kongruen jika sisi-sisi yang bersesuaian sama panjang dan sudut-sudut yang bersesuaian sama besar.", true], ["Persegi panjang 6 × 12 kongruen dengan jajar genjang yang sisinya 6 dan 12.", false], ["Dua segi enam beraturan dengan panjang sisi sama selalu kongruen.", true])],
      "Jajar genjang itu sudutnya tidak 90°. Segi enam beraturan semua sudutnya 120°."),
    q(6, "Segi lima ABCDE ≅ KLMNO. Keliling ABCDE 42 cm, KL = 7 cm, LM = 9 cm, MN = 8 cm, dan NO = 10 cm.", [n("AB =", 7, "cm"), n("EA = OK =", 42 - 7 - 9 - 8 - 10, "cm")],
      "AB = KL = 7. Keliling sama, jadi OK = 42 − (7 + 9 + 8 + 10) = 8 cm."),
  ],
  // D.3
  [
    q(7, "Tentukan kriteria yang menjamin kedua segitiga kongruen.", [{ kind: "classify", options: ["S.S.S", "S.Sd.S", "Sd.S.Sd", "Belum pasti"], rows: [
      { text: "Ketiga pasang sisi sama panjang", answer: "S.S.S" }, { text: "Dua pasang sisi dan sudut yang diapitnya sama", answer: "S.Sd.S" },
      { text: "Dua pasang sudut dan sisi di antara keduanya sama", answer: "Sd.S.Sd" }, { text: "Dua pasang sisi dan sudut yang tidak diapitnya sama", answer: "Belum pasti" }] }],
      "S.S.Sd dapat menghasilkan dua segitiga yang berbeda, jadi belum pasti kongruen."),
    q(7, "Jika ΔMDN ≅ ΔKPG, maka MN = …", [ch("Jawaban:", ["KP", "KG", "PG"], "KG")], "M–K, D–P, N–G. MN bersesuaian dengan KG."),
    q(7, "ΔKLM ≅ ΔXYZ dengan KL = 6 cm, LM = 8 cm, ∠K = 65°, dan ∠M = 40°.", [n("YZ =", 8, "cm"), n("∠Y =", 75, "°")],
      "YZ = LM = 8 cm. ∠L = 180° − 65° − 40° = 75°, jadi ∠Y = 75°."),
    q(7, "Pada ΔABC, AD membagi ∠BAC sama besar dan AD tegak lurus BC. Kriteria apa yang membuktikan ΔADB ≅ ΔADC?", [ch("Jawaban:", ["S.S.S", "S.Sd.S", "Sd.S.Sd"], "Sd.S.Sd")],
      "∠BAD = ∠CAD, AD = AD, ∠ADB = ∠ADC = 90°: dua sudut dan sisi di antaranya.",
      { scene: { type: "figure", w: 220, h: 170, polys: [{ pts: [[110, 15], [20, 150], [200, 150]], fill: "#dbe8f5" }], segs: [[[110, 15], [110, 150]]], labels: [{ x: 110, y: 11, t: "A" }, { x: 12, y: 160, t: "B" }, { x: 206, y: 160, t: "C" }, { x: 114, y: 164, t: "D" }] } }),
  ],
  // E Dilatasi
  [
    q(8, "Segitiga ABC dengan A(−3, 2), B(1, 3), C(2, −1) didilatasi [O, 3]. Tentukan bayangannya.", [pts(["A'", "B'", "C'"], map([[-3, 2], [1, 3], [2, -1]], p => dilate(p, 3)))],
      "(x, y) → (3x, 3y). A'(−9, 6), B'(3, 9), C'(6, −3)."),
    q(8, "Ruas OA dengan A(2, 1) didilatasi terhadap O menjadi OA' dengan A'(6, 3). Ruas OB dengan B(−4, 2) didilatasi menjadi OB' dengan B'(2, −1).", [n("Faktor skala OA ke OA' =", 3), n("Faktor skala OB ke OB' =", -0.5)],
      "A' = 3A, k = 3. B' = −{1/2}B, berlawanan arah, k = −{1/2} (boleh ditulis −0,5)."),
    q(8, "Persegi panjang EFGH dengan E(1, 0), F(3, 0), G(3, 1), H(1, 1) didilatasi [P(2, 3), 2].", [pts(["E'", "F'", "G'", "H'"], map(rect(1, 0, 2, 1), p => dilate(p, 2, [2, 3])))],
      "(k(x − 2) + 2, k(y − 3) + 3): E'(0, −3), F'(4, −3), G'(4, −1), H'(0, −1)."),
    q(8, "Segitiga ABC siku-siku di B dengan AB = 8 cm, BC = 15 cm, AC = 17 cm didilatasi dengan faktor skala 3.", [n("Luas ΔABC =", 60, "cm²"), n("Luas ΔA'B'C' =", 540, "cm²")],
      "Luas awal {1/2} × 8 × 15 = 60 cm². Luas bayangan 3^{2} × 60 = 540 cm²."),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
const polRob = { P: [-3, 2] as Pt, R: [4, -1] as Pt, Q: [-1, -2] as Pt };
export const assessment: TQuestion[] = [
  // Sedang (1-8)
  q(0, "Diketahui titik A(−2, 4) dan B(5, −3). Translasi yang memindahkan A ke B adalah …", [ch("Jawaban:", ["(7, −7)", "(−7, 7)", "(3, 1)", "(7, 7)"], "(7, −7)")],
    "B − A = (5 − (−2), −3 − 4) = (7, −7): 7 ke kanan dan 7 ke bawah.", { level: "Sedang" }),
  q(1, "Hubungkan setiap jenis refleksi titik (4, −1) dengan bayangannya: ketuk jenis refleksi, lalu ketuk hasilnya.", [{ kind: "match", left: REF, right: ["(−1, 4)", "(4, 3)", "(−4, 1)", "(4, 1)", "(1, −4)", "(−4, −1)", "(0, −1)"], answer: REFM.map(m => ptText(reflect([4, -1], m))) }],
    "Sumbu x (4, 1); sumbu y (−4, −1); titik O (−4, 1); y = x (−1, 4); y = −x (1, −4); x = 2 (0, −1); y = 1 (4, 3).", { level: "Sedang" }),
  q(4, "Segitiga ABC dengan A(4, 1), B(6, 3), C(1, 2) dirotasikan 90° berlawanan arah jarum jam terhadap O.", [pts(["A'", "B'", "C'"], map([[4, 1], [6, 3], [1, 2]], p => rotate(p, 90)))],
    "(x, y) → (−y, x). A'(−1, 4), B'(−3, 6), C'(−2, 1).", { level: "Sedang" }),
  q(5, "Benar atau salah?", [tf(["Translasi dan dilatasi tidak mengubah ukuran bangun datar.", false], ["Bayangan hasil refleksi mempunyai orientasi berlawanan dengan bangun awalnya.", true], ["Jika persegi didilatasi dengan faktor skala 2, luas bayangannya 2 kali luas persegi awal.", false], ["Bangun datar dan bayangannya hasil translasi lalu rotasi selalu kongruen.", true])],
    "Dilatasi mengubah ukuran. Luas bayangan dilatasi 2^{2} = 4 kali. Translasi dan rotasi transformasi kaku.", { level: "Sedang" }),
  q(8, "Segitiga ABC dengan A(−4, 6), B(8, 2), C(−2, −4) didilatasi [O, {1/2}].", [pts(["A'", "B'", "C'"], map([[-4, 6], [8, 2], [-2, -4]], p => dilate(p, 0.5)))],
    "(x, y) → ({1/2}x, {1/2}y). A'(−2, 3), B'(4, 1), C'(−1, −2).", { level: "Sedang" }),
  q(0, "Translasikan segi empat EFGH sejauh 3 satuan ke kanan dan 2 satuan ke bawah: ketuk keempat titik sudut bayangannya.", [plot("Bayangan E'F'G'H':", map(quadE, p => translate(p, [3, -2])), 5, { pts: quadE, names: "EFGH" })],
    "Translasi (3, −2): E'(−1, −1), F'(1, −1), G'(2, 1), H'(0, 1).", { level: "Sedang" }),
  q(1, "Isian singkat.", [pts(["Bayangan A(3, −4) terhadap sumbu x: A'", "Bayangan P(−3, 2) terhadap sumbu y: P'"], [reflect([3, -4], "sumbu x"), reflect([-3, 2], "sumbu y")])],
    "Sumbu x: (3, 4). Sumbu y: (3, 2).", { level: "Sedang" }),
  q(4, "Pencerminan terhadap titik pusat (0, 0) menghasilkan bayangan yang sama dengan rotasi terhadap (0, 0) sebesar …", [ch("Jawaban:", ["90°", "180°", "270°", "−90°"], "180°")],
    "Keduanya memetakan (x, y) ke (−x, −y).", { level: "Sedang" }),
  // Menantang (9-17)
  q(6, "Manakah segi empat yang kongruen dengan persegi panjang I?", [ch("Jawaban:", ["II", "III", "IV"], "II")],
    "I berukuran 4 × 2. II juga 4 × 2 tetapi berdiri (diputar 90°). III jajar genjang, sudutnya bukan 90°. IV berukuran 4 × 3.",
    { level: "Menantang", scene: plane([{ pts: rect(1, 1, 4, 2), names: "I", tone: "awal" }, { pts: rect(-3, 0, 2, 4), names: "II", tone: "lain" }, { pts: [[-5, -4], [-1, -4], [0, -2], [-4, -2]], names: "III", tone: "lain" }, { pts: rect(1, -4, 4, 3), names: "IV", tone: "lain" }], { r: 5 }) }),
  q(8, "Tentukan faktor skala setiap dilatasi terhadap O berikut.", [n("A(1, 2) menjadi A'(4, 8): k =", 4), n("B(−6, 4) menjadi B'(3, −2): k =", -0.5)],
    "A' = 4A, k = 4. B' = −{1/2}B, k = −{1/2}.", { level: "Menantang", scene: plane([], { points: [{ p: [1, 2], label: "A" }, { p: [4, 8], label: "A'" }, { p: [-6, 4], label: "B" }, { p: [3, -2], label: "B'" }], arrows: [[[0, 0], [4, 8]], [[-6, 4], [3, -2]]], r: 8 }) }),
  q(0, "Segitiga PQR ditranslasikan menjadi STU. Diketahui P(−2, 1), Q(2, −1), S(1, −2), dan U(4, 3).", [vec("Translasi =", [3, -3]), pts(["T", "R"], [translate([2, -1], [3, -3]), translate([4, 3], [-3, 3])])],
    "Translasi = S − P = (3, −3). T = Q + (3, −3) = (5, −4). R = U − (3, −3) = (1, 6).", { level: "Menantang" }),
  q(1, "Tentukan bayangan garis y = 3x − 4 jika direfleksikan terhadap sumbu x, dalam bentuk ax + by = c.", [eq("Bayangan:", 3, 1, 4)],
    "Ganti y dengan −y: −y = 3x − 4, jadi 3x + y = 4.", { level: "Menantang" }),
  q(4, "Rotasikan segitiga DEF sebesar 180° terhadap O: ketuk ketiga titik sudut bayangannya.", [plot("Bayangan D'E'F':", map(triD, p => rotate(p, 180)), 6, { pts: triD, names: "DEF" })],
    "(x, y) → (−x, −y): D'(−3, −2), E'(−5, −1), F'(−5, −4).", { level: "Menantang" }),
  q(7, "ΔABC ≅ ΔPQR dengan AB = 7 cm, BC = 9 cm, ∠A = 50°, dan ∠B = 75°.", [n("PQ =", 7, "cm"), n("QR =", 9, "cm"), n("∠R =", 55, "°")],
    "A–P, B–Q, C–R. PQ = 7, QR = 9, ∠R = ∠C = 180° − 50° − 75° = 55°.", { level: "Menantang" }),
  q(8, "Segitiga KLM dengan K(3, 1), L(4, 3), M(2, 4) didilatasi [P(2, 2), −2].", [pts(["K'", "L'", "M'"], map([[3, 1], [4, 3], [2, 4]], p => dilate(p, -2, [2, 2])))],
    "(−2(x − 2) + 2, −2(y − 2) + 2): K'(0, 4), L'(−2, 0), M'(2, −2).", { level: "Menantang" }),
  q(0, "Garis 3x + y = 3 ditranslasikan oleh (3, −4). Tentukan persamaan bayangannya dalam bentuk ax + by = c.", [eq("Bayangan:", 3, 1, 8)],
    "Ganti x dengan x − 3 dan y dengan y + 4: 3(x − 3) + (y + 4) = 3, jadi 3x + y = 8. Periksa: (1, 0) bergeser ke (4, −4), 12 − 4 = 8.", { level: "Menantang" }),
  q(3, "ΔPQR dengan P(5, 6) dan Q(10, 6) direfleksikan terhadap x = 3, lalu hasilnya direfleksikan terhadap y = 4.", [pts(["P''", "Q''"], [reflect(reflect([5, 6], { x: 3 }), { y: 4 }), reflect(reflect([10, 6], { x: 3 }), { y: 4 })]), ch("Apakah hasilnya sama dengan refleksi terhadap titik (3, 4)?", ["Ya", "Tidak"], "Ya")],
    "x = 3: P'(1, 6), Q'(−4, 6). y = 4: P''(1, 2), Q''(−4, 2). Refleksi titik (3, 4): (6 − x, 8 − y), juga (1, 2) dan (−4, 2).", { level: "Menantang" }),
  // Sangat menantang (18-24)
  q(4, "Segitiga DEF dengan D(3, 2) dan E(5, 1) dirotasikan 180° terhadap O, lalu ditranslasikan oleh (3, −2). Tentukan bayangan akhir D dan E.", [pts(["D''", "E''"], [translate(rotate([3, 2], 180), [3, -2]), translate(rotate([5, 1], 180), [3, -2])])],
    "Rotasi 180°: D'(−3, −2), E'(−5, −1). Translasi (3, −2): D''(0, −4), E''(−2, −3).", { level: "Sangat menantang" }),
  q(8, "Segitiga OVW dengan O(0, 0), V(−4, 0), W(0, 6) didilatasi [O, −{1/2}] menjadi OV'W' dan [O, {1/2}] menjadi OV''W''.", [pts(["V'", "W'", "V''", "W''"], [dilate([-4, 0], -0.5), dilate([0, 6], -0.5), dilate([-4, 0], 0.5), dilate([0, 6], 0.5)]), n("Faktor skala dari OV'W' ke OV''W'' =", -1)],
    "V'(2, 0), W'(0, −3), V''(−2, 0), W''(0, 3). V'' = −1 × V', jadi k = −1.", { level: "Sangat menantang" }),
  q(7, "ΔABC siku-siku di B dengan AB = BC = 12 cm. CD garis bagi ∠BCA memotong AB di D, dan DE ⊥ AC di E. Karena ΔCBD ≅ ΔCED, CE = CB.", [ch("Kriteria kekongruenannya:", ["S.S.S", "S.Sd.S", "Sd.S.Sd"], "Sd.S.Sd"), n("CE =", 12, "cm"), n("DE ≈", Math.round((12 * Math.SQRT2 - 12) * 100) / 100, "cm", 0.01)],
    "∠BCD = ∠ECD, ∠B = ∠E = 90° sehingga ∠CDB = ∠CDE, dan CD sisi bersama di antaranya: Sd.S.Sd. CE = 12. AC = 12√{2} ≈ 16,97, AE = 4,97. ΔAED siku-siku sama kaki (∠A = 45°), jadi DE = AE ≈ 4,97 cm.",
    { level: "Sangat menantang", id: "garisbagi", scene: { type: "figure", w: 220, h: 180, polys: [{ pts: [[30, 20], [30, 160], [170, 160]], fill: "#dbe8f5" }], segs: [[[170, 160], [30, 102]], [[30, 102], [71, 61]]], labels: [{ x: 22, y: 18, t: "A" }, { x: 22, y: 172, t: "B" }, { x: 178, y: 172, t: "C" }, { x: 18, y: 106, t: "D" }, { x: 76, y: 58, t: "E" }] } }),
  q(1, "Bola golf dipukul dari V(1, 3), memantul sekali di dinding sepanjang sumbu x, lalu masuk ke lubang W(7, 1). Di titik mana bola harus mengenai dinding?", [pts(["Titik pantul"], [[5.5, 0]])],
    "Cerminkan W terhadap dinding: W'(7, −1). Titik pantul adalah perpotongan VW' dengan sumbu x: dari (1, 3) ke (7, −1), y = 0 saat x = 1 + 3 × {6/4} = 5,5. Jadi (5,5; 0).",
    { level: "Sangat menantang", id: "golf", scene: plane([], { points: [{ p: [1, 3], label: "V" }, { p: [7, 1], label: "W" }], lines: [{ l: { y: 0 }, label: "dinding" }], r: 8 }) }),
  q(4, "Segitiga ABC dirotasikan 90° berlawanan arah jarum jam terhadap O, lalu hasilnya dicerminkan terhadap sumbu x. Bayangan akhirnya sama dengan satu refleksi terhadap …", [ch("Jawaban:", ["Garis y = x", "Garis y = −x", "Sumbu y", "Titik O"], "Garis y = −x"), pts(["C(1, 3) menjadi C''"], [reflect(rotate([1, 3], 90), "sumbu x")])],
    "(x, y) → (−y, x) → (−y, −x), yaitu refleksi terhadap y = −x. C''(−3, −1).", { level: "Sangat menantang" }),
  q(6, "Dua segi enam beraturan masing-masing bersisi 5 cm. Segi empat KLMN ≅ ABCD dengan keliling ABCD 30 cm, AB = 9 cm, BC = 6 cm, dan ∠A + ∠B = 170°.", [ch("Apakah kedua segi enam kongruen?", ["Ya", "Tidak", "Belum pasti"], "Ya"), n("KL + LM =", 15, "cm"), n("∠M + ∠N =", 190, "°")],
    "Segi enam beraturan bersisi sama sudutnya juga sama (120°), jadi kongruen. KL + LM = AB + BC = 15. Jumlah sudut segi empat 360°, jadi ∠C + ∠D = 190° = ∠M + ∠N.", { level: "Sangat menantang" }),
  q(0, "Pencuri bersembunyi di P(−3, 2) dan kabur ke R(4, −1). Polisi berada di Q(−1, −2).", [vec("Translasi pencuri dari P ke R =", [polRob.R[0] - polRob.P[0], polRob.R[1] - polRob.P[1]]), ch("Jika polisi memakai translasi yang sama, apakah pencuri tertangkap?", ["Ya", "Tidak"], "Tidak"), vec("Translasi yang harus dipakai polisi =", [polRob.R[0] - polRob.Q[0], polRob.R[1] - polRob.Q[1]])],
    "P ke R: (7, −3). Polisi dengan (7, −3) tiba di (6, −5), bukan R. Polisi perlu R − Q = (5, 1).",
    { level: "Sangat menantang", id: "polisi", scene: plane([], { points: [{ p: polRob.P, label: "P" }, { p: polRob.R, label: "R" }, { p: polRob.Q, label: "Q" }], r: 5 }) }),
];

export const sources = { REF };
