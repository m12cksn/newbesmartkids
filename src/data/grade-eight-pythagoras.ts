/**
 * Kelas 8 Bab 2 - Teorema Pythagoras (Buku Siswa Matematika SMP/MTs Kelas VIII, Kurikulum Merdeka 2022, hlm. 45-96).
 * A. Menemukan Konsep Pythagoras  B. Tripel Pythagoras  C. Segitiga Istimewa
 * D. Penerapan Teorema Pythagoras  E. Rumus Jarak (Pengayaan)
 * Bentuk jawaban mengikuti buku: isian panjang sisi (bilangan atau bentuk akar), pilihan ganda (Uji Kompetensi A),
 * pasangkan jenis segitiga (Soal Latihan 2.2), benar/salah, dan soal cerita bergambar.
 * Teks matematika memakai penanda: ^{…} pangkat, √{…} akar, {a/b} pecahan bertumpuk.
 */
import type { Question } from "./grade-four-whole-numbers";
import type { Fig, Pt } from "./grade-seven-similarity";

/* ---------- Angka (sama dengan Bab 1; disalin agar berkas data berdiri sendiri) ---------- */
export const num = (s: string) => { const t = s.trim().replace(/[−–]/g, "-").replace(/\./g, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };
export const idn = (n: number) => { const r = Math.round(n * 1e10) / 1e10; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Gambar ---------- */
export type Scene =
  | { type: "fig"; fig: Fig; caption?: string }
  | { type: "figs"; items: { fig: Fig; caption: string }[] }
  | { type: "grid"; points: { name: string; x: number; y: number }[]; segments?: [number, number][]; legs?: boolean }
  | { type: "ladder"; wall: string; base: string; ladder: string }
  | { type: "river"; ab: string; ac: string }
  | { type: "boats"; shore: string; gap: string }
  | { type: "radar"; ab: string; ac: string; ad: string }
  | { type: "antenna"; pole: string; ground: string }
  | { type: "card"; title: string; lines: string[] };

export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; tol?: number }
  | { kind: "root"; label: string; coef: number; rad: number; unit?: string }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] };

export type TQuestion = Question & { topic: 0 | 1 | 2 | 3 | 4; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "root" ? 2 : p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : 1);
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => idn(n).replace(/\./g, "").replace("−", "-");
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "root": return [String(p.coef), String(p.rad)];
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
  }
}
const isInt = (s: string) => /^\d+$/.test(s.trim());
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "num") { const a = num(v); return !Number.isNaN(a) && Math.abs(a - p.value) <= (p.tol ?? 1e-9); }
  if (p.kind === "root") { const c = x[0].trim() === "" ? "1" : x[0]; return isInt(c) && isInt(x[1]) && Number(c) === p.coef && Number(x[1]) === p.rad; }
  return x.join("|") === fields(p).join("|");
}
function partReady(p: Part, v: string) { if (p.kind === "choice") return v !== ""; const x = cells(p, v); return p.kind === "root" ? x[1].trim() !== "" : x.every(c => c.trim() !== ""); }
export const correct = (q: TQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: TQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/√\{([^}]*)\}/g, "√$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2").replace(/[{}]/g, "");
export function formatAnswer(q: TQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "root": return `${plain(p.label)} ${x[0] === "1" || x[0] === "…" ? "" : x[0]}√${x[1]}${p.unit ? ` ${p.unit}` : ""}`;
      case "choice": return `${plain(p.label)} ${v[i] || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: TQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): TQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string): Part => ({ kind: "num", label, value, unit });
const rt = (label: string, coef: number, rad: number, unit?: string): Part => ({ kind: "root", label, coef, rad, unit });
const ch = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });
/** Segitiga siku-siku di B: A di atas, C di kanan. sides = [AB, BC, CA]. */
export const rightTri = (w: number, h: number, sides: (string | null)[], labels = ["A", "B", "C"], angles?: (string | null)[]): Fig =>
  ({ pts: [[0, 0], [0, h], [w, h]] as Pt[], labels, sides, right: [1], angles });
const JENIS = ["Siku-siku", "Lancip", "Tumpul"];
export const triangleType = (s: number[]) => { const [a, b, c] = [...s].sort((x, y) => x - y), d = c * c - (a * a + b * b); return Math.abs(d) < 1e-9 ? "Siku-siku" : d < 0 ? "Lancip" : "Tumpul"; };

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  { code: "A", title: "Menemukan Konsep Pythagoras", short: "Konsep Pythagoras", sections: [
    { title: "Kuadrat dan akar kuadrat", lab: "squares", steps: [
      "Kuadrat suatu bilangan adalah hasil kali bilangan itu dengan dirinya sendiri: a^{2} = a × a. Contoh 13^{2} = 169.",
      "Bilangan kuadrat adalah hasil pengkuadratan bilangan bulat: 1, 4, 9, 16, 25, 36, …",
      "Akar kuadrat adalah kebalikannya: √{a} adalah bilangan positif yang jika dikuadratkan hasilnya a. √{169} = 13.",
      "Sifat akar yang sering dipakai: √{A × B} = √{A} × √{B} dan √{A} × √{A} = A. Contoh √{50} = √{25 × 2} = 5√{2}.",
    ], life: "Luas lantai kamar persegi 16 m^{2} berarti panjang sisinya √{16} = 4 m. Ubin persegi dengan luas 900 cm^{2} panjang sisinya √{900} = 30 cm.",
      example: "24^{2} = 576, (82,5)^{2} = 6.806,25, √{484} = 22, √{625} = 25.",
      demo: "Atur bilangan. Lihat kuadratnya sebagai persegi berpetak dan akar kuadrat dari bilangan kuadrat." },
    { title: "Luas persegi pada sisi segitiga siku-siku", lab: "proof", steps: [
      "Pada segitiga siku-siku, sisi di depan sudut siku-siku adalah sisi terpanjang, disebut sisi miring atau hipotenusa. Dua sisi lain disebut sisi siku-siku.",
      "Buat persegi pada setiap sisi. Luas persegi pada hipotenusa sama dengan jumlah luas dua persegi pada sisi siku-siku.",
      "Jika sisi siku-siku a dan b serta hipotenusa c, maka c^{2} = a^{2} + b^{2}. Inilah Teorema Pythagoras.",
      "Bukti dengan menata ulang: persegi bersisi a + b berisi empat segitiga dan persegi c^{2}, atau empat segitiga dan dua persegi a^{2} dan b^{2}. Karena luasnya sama, c^{2} = a^{2} + b^{2}.",
    ], life: "Tukang bangunan memasang benang bouwplank untuk membuat sudut pondasi tepat siku-siku. Mereka mengukur 60 cm, 80 cm, dan 100 cm, karena 60^{2} + 80^{2} = 3.600 + 6.400 = 10.000 = 100^{2}.",
      example: "Sisi siku-siku 3 dan 4 satuan: persegi 9 dan 16 kotak, jumlahnya 25 = 5^{2}. Hipotenusanya 5 satuan.",
      demo: "Atur kedua sisi siku-siku. Luas ketiga persegi dihitung, dan jumlah dua persegi kecil selalu sama dengan persegi besar." },
    { title: "Menghitung panjang sisi", lab: "solve", steps: [
      "Mencari hipotenusa: c = √{a^{2} + b^{2}}.",
      "Mencari sisi siku-siku: a = √{c^{2} − b^{2}}. Kurangkan, jangan jumlahkan.",
      "Periksa dulu mana hipotenusa: sisi di depan sudut siku-siku, selalu yang terpanjang.",
      "Pada bangun lain, tarik garis tegak lurus agar muncul segitiga siku-siku. Pada trapesium siku-siku, sisi miringnya dihitung dari tinggi dan selisih sisi sejajar.",
    ], life: "Tangga 5 m disandarkan ke tembok dengan kaki tangga 3 m dari tembok. Tinggi ujung tangga di tembok √{5^{2} − 3^{2}} = √{16} = 4 m.",
      example: "AB = 12 cm, BC = 5 cm, siku-siku di B: AC = √{144 + 25} = √{169} = 13 cm. PR = 2,9 cm, QR = 2,1 cm: PQ = √{8,41 − 4,41} = √{4} = 2 cm.",
      demo: "Pilih sisi yang dicari, lalu atur dua sisi yang diketahui. Langkah perhitungannya ditulis lengkap." },
  ] },
  { code: "B", title: "Tripel Pythagoras", short: "Tripel Pythagoras", sections: [
    { title: "Kebalikan teorema dan jenis segitiga", lab: "kind", steps: [
      "Kebalikan Teorema Pythagoras: jika pada segitiga berlaku c^{2} = a^{2} + b^{2} (c sisi terpanjang), segitiga itu siku-siku.",
      "Jika c^{2} < a^{2} + b^{2}, segitiganya lancip. Jika c^{2} > a^{2} + b^{2}, segitiganya tumpul.",
      "Tiga bilangan asli a < b < c disebut tripel Pythagoras jika c^{2} = a^{2} + b^{2}. Contoh 3, 4, 5 dan 5, 12, 13.",
      "Kelipatan tripel juga tripel: 6, 8, 10 dan 30, 40, 50 adalah kelipatan 3, 4, 5.",
    ], life: "Putri ingin membuat taman siku-siku seperti yang ia lihat. Taman itu bersisi 4 m, 5 m, dan 6 m: 6^{2} = 36 < 4^{2} + 5^{2} = 41, jadi taman itu lancip, bukan siku-siku.",
      example: "8, 12, 13: 13^{2} = 169 < 8^{2} + 12^{2} = 208, jadi lancip. 6, 8, 12: 12^{2} = 144 > 6^{2} + 8^{2} = 100, jadi tumpul.",
      demo: "Atur panjang ketiga sisi. Segitiga digambar sesuai ukurannya, lalu c^{2} dibandingkan dengan a^{2} + b^{2}." },
    { title: "Membuat tripel Pythagoras", lab: "triples", steps: [
      "Pilih dua bilangan asli p dan q dengan p > q.",
      "Hitung p^{2} − q^{2} dan 2pq sebagai sisi siku-siku, serta p^{2} + q^{2} sebagai hipotenusa.",
      "Hasilnya selalu tripel, karena (p^{2} − q^{2})^{2} + (2pq)^{2} = (p^{2} + q^{2})^{2}.",
      "Cara lain untuk sisi terpendek ganjil S: sisi lain M = {S^{2} − 1/2} dan hipotenusa M + 1. Contoh S = 7: 24 dan 25.",
    ], life: "Humam membuat potongan tangram segitiga siku-siku. Dengan p = 3 dan q = 2 ia mendapat sisi 5, 12, dan 13 cm, sehingga potongannya pasti siku-siku tanpa busur derajat.",
      example: "p = 2, q = 1: 3, 4, 5. p = 3, q = 1: 8, 6, 10. p = 4, q = 1: 15, 8, 17.",
      demo: "Atur p dan q. Ketiga sisi dihitung dan dicek dengan Teorema Pythagoras." },
  ] },
  { code: "C", title: "Segitiga Istimewa", short: "Segitiga istimewa", sections: [
    { title: "Segitiga siku-siku sama kaki (45°, 45°, 90°)", lab: "iso", steps: [
      "Segitiga siku-siku sama kaki adalah setengah persegi yang dipotong pada diagonalnya. Sudutnya 45°, 45°, dan 90°.",
      "Jika sisi siku-sikunya a, hipotenusanya √{a^{2} + a^{2}} = a√{2}.",
      "Perbandingan sisinya a : a : a√{2} = 1 : 1 : √{2}.",
      "Jika hipotenusa diketahui, bagi dengan √{2}. Hipotenusa 15√{2} cm berarti sisi siku-sikunya 15 cm.",
    ], life: "Ubin persegi 30 cm dipotong pada diagonalnya untuk tepi lantai. Panjang potongannya 30√{2} ≈ 42,4 cm. Bingkai kaca atap rumah segitiga juga sering berbentuk siku-siku sama kaki.",
      example: "Sisi siku-siku 5: hipotenusa 5√{2}. Sisi siku-siku 10: hipotenusa 10√{2}.",
      demo: "Atur panjang sisi siku-siku. Hipotenusa dihitung dan dibandingkan dengan pola 1 : 1 : √{2}." },
    { title: "Segitiga siku-siku 30°, 60°, 90°", lab: "half", steps: [
      "Segitiga sama sisi yang dibelah dua menghasilkan segitiga siku-siku dengan sudut 30°, 60°, dan 90°.",
      "Sisi terpendek (di depan sudut 30°) = a, hipotenusa = 2a, dan sisi di depan sudut 60° = a√{3}.",
      "Perbandingan sisinya 1 : 2 : √{3} (terpendek : hipotenusa : sisi tengah).",
      "Jika satu sisi diketahui, cari a dulu, lalu kalikan sesuai perbandingan.",
    ], life: "Pengrajin kayu membuat hiasan dinding segitiga siku-siku dengan sudut 30°. Jika sisi di depan sudut 30° panjangnya 40 cm, hipotenusanya 80 cm dan sisi lainnya 40√{3} cm.",
      example: "∠A = 30°, BC = 12 cm (sisi terpendek): AB = 24 cm dan AC = 12√{3} cm.",
      demo: "Atur sisi terpendek. Segitiga sama sisinya dibelah dua, dan ketiga sisi segitiga 30°-60°-90° dihitung." },
  ] },
  { code: "D", title: "Penerapan Teorema Pythagoras", short: "Penerapan", sections: [
    { title: "Masalah sehari-hari", lab: "ladder", steps: [
      "Gambar situasinya dan cari segitiga siku-siku: tembok dengan tanah, tiang dengan tanah, arah utara dengan arah timur.",
      "Tentukan mana hipotenusa (benda miring: tangga, kawat, tali, lintasan miring).",
      "Gunakan c^{2} = a^{2} + b^{2}, lalu tulis jawabannya dengan satuan yang diminta.",
      "Periksa apakah jawabannya masuk akal: hipotenusa harus lebih panjang dari kedua sisi lainnya.",
    ], life: "Dalam permainan bentengan, kamu berada 4 m ke utara dan 3 m ke timur dari benteng. Jarakmu ke benteng √{4^{2} + 3^{2}} = 5 m. Tukang listrik menghitung panjang kawat penyangga tiang dengan cara yang sama.",
      example: "Kawat antena dipasang pada ketinggian 6 m dan diikat 8 m dari kaki tiang: panjang kawat √{36 + 64} = 10 m.",
      demo: "Atur tinggi tembok dan jarak kaki tangga. Panjang tangga yang dibutuhkan dihitung." },
    { title: "Gabungan beberapa segitiga", lab: "radar", steps: [
      "Beberapa masalah memuat dua segitiga siku-siku yang berbagi satu sisi.",
      "Hitung sisi bersama dulu, lalu gunakan untuk segitiga kedua.",
      "Jarak antara dua titik pada garis yang sama adalah selisih dua panjang yang dihitung.",
      "Jika diminta waktu, gunakan waktu = jarak : kecepatan setelah jaraknya ditemukan.",
    ], life: "Radar 9 km dari kapal induk mendeteksi dua pesawat yang berjarak 10 km dan 12 km dari radar. Tinggi pesawat masing-masing √{19} ≈ 4,36 km dan √{63} ≈ 7,94 km, jadi jarak keduanya sekitar 3,58 km.",
      example: "Perahu nelayan 15 km dari Aldo, perahu wisata 20 km di depannya: jarak Aldo ke perahu wisata √{225 + 400} = 25 km.",
      demo: "Atur jarak radar dan jarak kedua pesawat. Kedua segitiga dihitung dan selisih ketinggiannya ditampilkan." },
  ] },
  { code: "E", title: "Rumus Jarak (Pengayaan)", short: "Rumus jarak", sections: [
    { title: "Jarak dua titik pada koordinat", lab: "grid", steps: [
      "Hubungkan titik A(x₁, y₁) dan B(x₂, y₂). Tarik garis mendatar dan tegak sehingga terbentuk segitiga siku-siku.",
      "Sisi mendatar = selisih x, sisi tegak = selisih y.",
      "Jarak AB = √{(x₂ − x₁)^{2} + (y₂ − y₁)^{2}}.",
      "Urutan titik tidak berpengaruh, karena selisih yang dikuadratkan selalu positif. Koordinat negatif juga boleh.",
    ], life: "Pada peta kota berpetak, rumahmu di (1, 2) dan sekolah di (7, 10) dengan satuan 100 m. Jarak lurusnya √{6^{2} + 8^{2}} = 10 petak = 1 km.",
      example: "A(−5, 3) dan B(3, −4): selisih x 8, selisih y 7, jarak √{64 + 49} = √{113}.",
      demo: "Geser kedua titik. Sisi mendatar, sisi tegak, dan jaraknya dihitung langsung." },
  ] },
];

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: TQuestion[][] = [
  [
    q(0, "Hitunglah kuadrat dan akar kuadrat berikut.", [n("15^{2} =", 225), n("√{196} =", 14)], "15 × 15 = 225. 14 × 14 = 196, jadi √{196} = 14."),
    q(0, "Tentukan panjang hipotenusa AC.", [n("AC =", 13, "cm")], "AC^{2} = 12^{2} + 5^{2} = 144 + 25 = 169, AC = 13 cm.", { scene: { type: "fig", fig: rightTri(5, 12, ["12 cm", "5 cm", "?"]) } }),
    q(0, "Tentukan panjang a.", [n("a =", 2, "cm")], "a^{2} = 2,5^{2} − 1,5^{2} = 6,25 − 2,25 = 4, a = 2 cm.", { scene: { type: "fig", fig: rightTri(1.5, 2, ["a", "1,5 cm", "2,5 cm"], ["P", "Q", "R"]) } }),
    q(0, "Sisi siku-siku segitiga 4 cm dan 6 cm. Tentukan hipotenusanya dalam bentuk akar paling sederhana.", [rt("Hipotenusa =", 2, 13, "cm")], "√{16 + 36} = √{52} = √{4 × 13} = 2√{13} cm.", { scene: { type: "fig", fig: rightTri(6, 4, ["4 cm", "6 cm", "?"]) } }),
  ],
  [
    q(1, "Taman Putri berbentuk segitiga dengan sisi 4 m, 5 m, dan 7 m. Termasuk segitiga apa taman itu?", [ch("Jenis segitiga:", JENIS, "Tumpul")], "7^{2} = 49 > 4^{2} + 5^{2} = 41, jadi tumpul."),
    q(1, "Tentukan benar atau salah.", [{ kind: "tf", statements: [{ text: "8, 15, 17 adalah tripel Pythagoras.", answer: true }, { text: "6, 9, 11 adalah tripel Pythagoras.", answer: false }, { text: "12, 35, 37 adalah tripel Pythagoras.", answer: true }] }],
      "64 + 225 = 289 = 17^{2}. 36 + 81 = 117 ≠ 121. 144 + 1.225 = 1.369 = 37^{2}."),
    q(1, "Buat tripel Pythagoras dengan p = 3 dan q = 2.", [n("p^{2} − q^{2} =", 5), n("2pq =", 12), n("p^{2} + q^{2} =", 13)], "9 − 4 = 5, 2 × 3 × 2 = 12, 9 + 4 = 13. 5^{2} + 12^{2} = 169 = 13^{2}."),
    q(1, "Pasangkan setiap kelompok tiga bilangan dengan jenis segitiganya.", [{ kind: "classify", options: JENIS, rows: [{ text: "9, 12, 15", answer: "Siku-siku" }, { text: "5, 6, 7", answer: "Lancip" }, { text: "4, 6, 9", answer: "Tumpul" }] }],
      "225 = 81 + 144. 49 < 25 + 36 = 61. 81 > 16 + 36 = 52."),
  ],
  [
    q(2, "Segitiga siku-siku sama kaki memiliki sisi siku-siku 6 cm. Tentukan hipotenusanya.", [rt("Hipotenusa =", 6, 2, "cm")], "Hipotenusa = a√{2} = 6√{2} cm.", { scene: { type: "fig", fig: rightTri(6, 6, ["6 cm", "6 cm", "?"], ["A", "B", "C"], ["45°", null, "45°"]) } }),
    q(2, "Pada segitiga 30°-60°-90°, sisi terpendek 7 cm.", [n("Hipotenusa =", 14, "cm"), rt("Sisi di depan sudut 60° =", 7, 3, "cm")], "Hipotenusa = 2 × 7 = 14 cm. Sisi lainnya 7√{3} cm.", { scene: { type: "fig", fig: rightTri(7 * Math.sqrt(3), 7, ["7 cm", "?", "?"], ["B", "C", "A"], ["60°", null, "30°"]) } }),
    q(2, "Hipotenusa segitiga siku-siku sama kaki 10√{2} cm. Tentukan panjang sisi siku-sikunya.", [n("Sisi siku-siku =", 10, "cm")], "10√{2} : √{2} = 10 cm.", { scene: { type: "fig", fig: rightTri(10, 10, ["?", "?", "10√2 cm"], ["A", "B", "C"], ["45°", null, "45°"]) } }),
    q(2, "Hiasan dinding berbentuk segitiga siku-siku dengan sudut 30°. Sisi di depan sudut 30° panjangnya 25 cm. Berapa hipotenusanya?", [n("Hipotenusa =", 50, "cm")], "Hipotenusa = 2 × sisi di depan 30° = 50 cm.", { scene: { type: "fig", fig: rightTri(25 * Math.sqrt(3), 25, ["25 cm", null, "?"], ["P", "Q", "R"], ["60°", null, "30°"]) } }),
  ],
  [
    q(3, "Tangga 5 m disandarkan ke tembok. Kaki tangga berjarak 3 m dari tembok. Berapa tinggi ujung tangga di tembok?", [n("Tinggi =", 4, "m")], "√{5^{2} − 3^{2}} = √{16} = 4 m.", { scene: { type: "ladder", wall: "?", base: "3 m", ladder: "5 m" } }),
    q(3, "Benang layang-layang yang terulur 50 m. Jarak mendatar dari Dimas ke titik tepat di bawah layang-layang 30 m. Berapa tinggi layang-layang dari tangan Dimas?", [n("Tinggi =", 40, "m")], "√{50^{2} − 30^{2}} = √{1.600} = 40 m.", { scene: { type: "fig", fig: rightTri(30, 40, ["?", "30 m", "50 m"], ["Layang", "", "Dimas"]) } }),
    q(3, "Lapangan berbentuk persegi panjang 60 m × 80 m. Andi berlari menyeberang lapangan lewat diagonal. Berapa jarak yang ditempuhnya?", [n("Diagonal =", 100, "m")], "√{60^{2} + 80^{2}} = √{10.000} = 100 m.", { scene: { type: "fig", fig: { pts: [[0, 0], [80, 0], [80, 60], [0, 60]], labels: ["A", "B", "C", "D"], sides: ["80 m", "60 m", null, null], right: [0, 1, 2, 3], extra: [{ pts: [[0, 60], [80, 0]] }] }, caption: "Lintasan Andi: diagonal DB" } }),
    q(3, "Dalam permainan bentengan, kamu berada 4 m ke utara dan 3 m ke timur dari benteng. Lawan berada 6 m ke utara dan 8 m ke timur dari benteng.", [n("Jarakmu ke benteng =", 5, "m"), n("Jarak lawan ke benteng =", 10, "m")], "√{16 + 9} = 5 m. √{36 + 64} = 10 m.", { scene: { type: "grid", points: [{ name: "Benteng", x: 0, y: 0 }, { name: "Kamu", x: 3, y: 4 }, { name: "Lawan", x: 8, y: 6 }], segments: [[0, 1], [0, 2]] } }),
  ],
  [
    q(4, "Tentukan jarak titik A(1, 1) dan B(4, 5).", [n("AB =", 5)], "Selisih x = 3, selisih y = 4: √{9 + 16} = 5.", { scene: { type: "grid", points: [{ name: "A", x: 1, y: 1 }, { name: "B", x: 4, y: 5 }], segments: [[0, 1]], legs: true } }),
    q(4, "Tentukan jarak titik A(−2, −1) dan B(3, 11).", [n("AB =", 13)], "Selisih x = 5, selisih y = 12: √{25 + 144} = 13.", { scene: { type: "grid", points: [{ name: "A", x: -2, y: -1 }, { name: "B", x: 3, y: 11 }], segments: [[0, 1]] } }),
    q(4, "Kamu memakai (4, 2) sebagai titik pertama, temanmu memakai (7, 6) sebagai titik pertama. Apakah jarak yang kalian temukan sama?", [ch("Jawaban:", ["Sama, keduanya 5", "Berbeda, 5 dan −5", "Berbeda, 5 dan 7"], "Sama, keduanya 5")], "(7 − 4)^{2} = (4 − 7)^{2} = 9 dan (6 − 2)^{2} = (2 − 6)^{2} = 16, jadi jaraknya sama-sama 5."),
    q(4, "Tentukan jarak titik A(−1, 2) dan B(3, −2) dalam bentuk akar paling sederhana.", [rt("AB =", 4, 2)], "Selisih x = 4, selisih y = 4: √{32} = 4√{2}.", { scene: { type: "grid", points: [{ name: "A", x: -1, y: 2 }, { name: "B", x: 3, y: -2 }], segments: [[0, 1]], legs: true } }),
  ],
];

/* ---------- Evaluasi: 24 soal, A B C D E bergantian ---------- */
export const assessment: TQuestion[] = [
  // Sedang (1-8)
  q(0, "Tentukan panjang hipotenusa segitiga berikut.", [n("PR =", 15, "cm")], "PR^{2} = 9^{2} + 12^{2} = 81 + 144 = 225, PR = 15 cm.", { level: "Sedang", scene: { type: "fig", fig: rightTri(12, 9, ["9 cm", "12 cm", "?"], ["P", "Q", "R"]) } }),
  q(1, "Pasangkan setiap kelompok tiga bilangan dengan jenis segitiganya.", [{ kind: "classify", options: JENIS, rows: [{ text: "9, 12, 15", answer: "Siku-siku" }, { text: "8, 10, 12", answer: "Lancip" }, { text: "7, 9, 13", answer: "Tumpul" }, { text: "20, 21, 29", answer: "Siku-siku" }] }],
    "225 = 81 + 144 (siku-siku). 144 < 164 (lancip). 169 > 130 (tumpul). 841 = 400 + 441 (siku-siku).", { level: "Sedang" }),
  q(2, "Segitiga siku-siku sama kaki memiliki sisi siku-siku 8 cm. Tentukan hipotenusanya.", [rt("Hipotenusa =", 8, 2, "cm")], "8√{2} cm, karena perbandingannya 1 : 1 : √{2}.", { level: "Sedang", scene: { type: "fig", fig: rightTri(8, 8, ["8 cm", "8 cm", "?"], ["A", "B", "C"], ["45°", null, "45°"]) } }),
  q(3, "Sebuah tangga panjangnya 250 cm disandarkan ke tembok. Kaki tangga berjarak 70 cm dari tembok. Tentukan tinggi ujung tangga dari tanah dalam meter.", [n("Tinggi =", 2.4, "m")], "√{250^{2} − 70^{2}} = √{62.500 − 4.900} = √{57.600} = 240 cm = 2,4 m.", { level: "Sedang", scene: { type: "ladder", wall: "?", base: "70 cm", ladder: "250 cm" } }),
  q(4, "Tentukan jarak titik A(1, 2) dan B(7, 10).", [n("AB =", 10)], "Selisih x = 6, selisih y = 8: √{36 + 64} = 10.", { level: "Sedang", scene: { type: "grid", points: [{ name: "A", x: 1, y: 2 }, { name: "B", x: 7, y: 10 }], segments: [[0, 1]], legs: true } }),
  q(0, "Hitunglah kuadrat dan akar kuadrat berikut.", [n("17^{2} =", 289), n("(12,5)^{2} =", 156.25), n("√{576} =", 24)], "17 × 17 = 289. 12,5 × 12,5 = 156,25. 24 × 24 = 576.", { level: "Sedang" }),
  q(1, "Suatu segitiga dikatakan segitiga siku-siku jika panjang ketiga sisinya berturut-turut adalah …", [ch("Jawaban:", ["4 cm, 6 cm, dan 8 cm", "6 cm, 8 cm, dan 11 cm", "7 cm, 24 cm, dan 25 cm", "9 cm, 12 cm, dan 16 cm"], "7 cm, 24 cm, dan 25 cm")],
    "49 + 576 = 625 = 25^{2}. Pilihan lain tidak memenuhi c^{2} = a^{2} + b^{2}.", { level: "Sedang" }),
  q(2, "Pengrajin kayu membuat hiasan dinding berbentuk segitiga siku-siku dengan salah satu sudut 30°. Panjang sisi di depan sudut 30° adalah 45 cm. Panjang hipotenusanya adalah …", [ch("Jawaban:", ["45√{3} cm", "90 cm", "60 cm", "90√{3} cm"], "90 cm")],
    "Hipotenusa = 2 × sisi di depan 30° = 90 cm.", { level: "Sedang", scene: { type: "fig", fig: rightTri(45 * Math.sqrt(3), 45, ["45 cm", null, "?"], ["K", "L", "M"], ["60°", null, "30°"]) } }),
  // Menantang (9-17)
  q(3, "Humam, Arjuna, dan Aldo mengukur lebar sungai. Jarak Humam ke Arjuna 8 m dan jarak Humam ke Aldo 17 m. Lebar sungai adalah …", [ch("Lebar sungai:", ["9 m", "13 m", "15 m", "25 m"], "15 m")],
    "Lebar = √{17^{2} − 8^{2}} = √{289 − 64} = √{225} = 15 m.", { level: "Menantang", scene: { type: "river", ab: "8 m", ac: "17 m" } }),
  q(4, "Tentukan jarak titik A(−3, 5) dan B(4, −1) dalam bentuk akar.", [rt("AB =", 1, 85)], "Selisih x = 7, selisih y = 6: √{49 + 36} = √{85}.", { level: "Menantang", scene: { type: "grid", points: [{ name: "A", x: -3, y: 5 }, { name: "B", x: 4, y: -1 }], segments: [[0, 1]], legs: true } }),
  q(0, "Tentukan nilai variabel pada setiap segitiga.", [rt("t =", 6, 2, "cm"), n("p =", 5, "m"), n("f =", 13, "m")],
    "t = √{11^{2} − 7^{2}} = √{72} = 6√{2}. p = √{13^{2} − 12^{2}} = 5. Segitiga gabungan: sisi bersama √{3^{2} + 4^{2}} = 5, lalu f = √{5^{2} + 12^{2}} = 13.",
    { level: "Menantang", scene: { type: "figs", items: [{ fig: rightTri(Math.sqrt(72), 7, ["7 cm", "t", "11 cm"]), caption: "a" }, { fig: rightTri(5, 12, ["12 m", "p", "13 m"]), caption: "b" }, { fig: { pts: [[0, 0], [0, 4], [3, 4], [3 + 12 * 0.8, 4 - 12 * 0.6]], labels: ["A", "B", "C", "D"], sides: ["4 m", "3 m", "12 m", "f"], right: [1], extra: [{ pts: [[0, 0], [3, 4]] }] }, caption: "c: ∠B dan ∠ACD siku-siku" }] } }),
  q(1, "Buat tripel Pythagoras dengan p = 5 dan q = 2.", [n("p^{2} − q^{2} =", 21), n("2pq =", 20), n("p^{2} + q^{2} =", 29)], "25 − 4 = 21, 2 × 5 × 2 = 20, 25 + 4 = 29. 441 + 400 = 841 = 29^{2}.", { level: "Menantang" }),
  q(2, "Pada △ABC, ∠A = 30°, ∠C = 90°, dan BC = 10 cm.", [rt("AC =", 10, 3, "cm"), n("AB =", 20, "cm")], "BC sisi terpendek. AC = BC√{3} = 10√{3} cm dan AB = 2 × BC = 20 cm.",
    { level: "Menantang", scene: { type: "fig", fig: rightTri(10 * Math.sqrt(3), 10, ["10 cm", "?", "?"], ["B", "C", "A"], ["60°", null, "30°"]) } }),
  q(3, "Aldo melihat perahu nelayan 24 km di depannya. Perahu wisata berada 18 km dari perahu nelayan, tegak lurus garis Aldo–perahu nelayan. Kedua perahu bergerak lurus menuju Aldo dengan kecepatan sama, 36 km/jam.", [n("Jarak Aldo ke perahu wisata =", 30, "km"), n("Selisih waktu tiba kedua perahu =", 10, "menit")],
    "√{24^{2} + 18^{2}} = √{900} = 30 km. Waktu: 30 : 36 jam = 50 menit dan 24 : 36 jam = 40 menit, selisih 10 menit.", { level: "Menantang", scene: { type: "boats", shore: "24 km", gap: "18 km" } }),
  q(4, "Diketahui △ABC dengan A(−2, 4), B(4, 1), dan C(1, −5). Apakah △ABC siku-siku?", [ch("Jawaban:", ["Siku-siku di A", "Siku-siku di B", "Siku-siku di C", "Bukan segitiga siku-siku"], "Siku-siku di B")],
    "AB^{2} = 36 + 9 = 45, BC^{2} = 9 + 36 = 45, AC^{2} = 9 + 81 = 90. 45 + 45 = 90, jadi siku-siku di B (di depan sisi AC).", { level: "Menantang", scene: { type: "grid", points: [{ name: "A", x: -2, y: 4 }, { name: "B", x: 4, y: 1 }, { name: "C", x: 1, y: -5 }], segments: [[0, 1], [1, 2], [2, 0]] } }),
  q(0, "Perhatikan trapesium siku-siku ABCD dengan AD = 12 cm, DC = 20 cm, dan AB = 29 cm. Tentukan panjang BC.", [n("BE =", 9, "cm"), n("BC =", 15, "cm")],
    "Tarik garis CE tegak lurus AB. BE = 29 − 20 = 9 cm, CE = AD = 12 cm. BC = √{12^{2} + 9^{2}} = √{225} = 15 cm.",
    { level: "Menantang", scene: { type: "fig", fig: { pts: [[0, 0], [0, 12], [29, 12], [20, 0]], labels: ["D", "A", "B", "C"], sides: ["12 cm", "29 cm", "?", "20 cm"], right: [0, 1], extra: [{ pts: [[20, 0], [20, 12]], labels: [null, "E"] }] } } }),
  q(1, "Kusen jendela berbentuk persegi panjang dengan tinggi 48 cm dan lebar 36 cm. Tukang mengukur salah satu diagonalnya 61 cm.", [n("Panjang diagonal seharusnya =", 60, "cm"), ch("Apakah kusen itu benar-benar persegi panjang?", ["Ya", "Tidak"], "Tidak")],
    "√{48^{2} + 36^{2}} = √{3.600} = 60 cm. Diagonalnya terukur 61 cm, jadi sudutnya tidak tepat siku-siku dan kusen itu bukan persegi panjang.", { level: "Menantang", scene: { type: "fig", fig: { pts: [[0, 0], [36, 0], [36, 48], [0, 48]], labels: ["A", "B", "C", "D"], sides: ["36 cm", "48 cm", null, null], extra: [{ pts: [[0, 0], [36, 48]] }] }, caption: "Diagonal AC terukur 61 cm" } }),
  // Sangat menantang (18-24)
  q(2, "Helikopter pengamat terbang 400 m di atas titik O. Sudut pandang ke tanah dari titik B adalah 45° dan dari titik C adalah 30° (O, B, C segaris). Gunakan √{3} = 1,73.", [n("OB =", 400, "m"), rt("OC (bentuk akar) =", 400, 3, "m"), n("BC =", 292, "m")],
    "Segitiga 45°: OB = 400 m. Segitiga 30°-60°-90° dengan tinggi 400 di depan sudut 30°: OC = 400√{3} ≈ 692 m. BC = 692 − 400 = 292 m.",
    { level: "Sangat menantang", scene: { type: "fig", fig: { pts: [[0, 0], [0, 400], [400 * Math.sqrt(3), 400]], labels: ["Heli", "O", "C"], sides: ["400 m", null, null], right: [1], angles: [null, null, "30°"], extra: [{ pts: [[0, 0], [400, 400]], labels: [null, "B"] }] } } }),
  q(3, "Radar berada 12 km dari kapal induk. Dua pesawat terbang tepat di atas kapal induk dan terdeteksi berjarak 13 km dan 20 km dari radar.", [n("Tinggi pesawat pertama BC =", 5, "km"), n("Tinggi pesawat kedua BD =", 16, "km"), n("Jarak kedua pesawat CD =", 11, "km")],
    "BC = √{13^{2} − 12^{2}} = 5 km. BD = √{20^{2} − 12^{2}} = 16 km. CD = 16 − 5 = 11 km.", { level: "Sangat menantang", scene: { type: "radar", ab: "12 km", ac: "13 km", ad: "20 km" } }),
  q(4, "Aldo dan Arjuna berdiri saling membelakangi. Aldo berjalan 20 langkah ke depan lalu 15 langkah ke kanan. Arjuna berjalan 12 langkah ke depan lalu 9 langkah ke kanan. Berapa langkah jarak mereka saat saling menembak?", [n("Jarak =", 40, "langkah")],
    "Gambar pada bidang kartesius: Aldo di (15, 20), Arjuna di (−9, −12). Selisih x = 24, selisih y = 32: √{576 + 1.024} = √{1.600} = 40 langkah.",
    { level: "Sangat menantang", scene: { type: "grid", points: [{ name: "Aldo", x: 15, y: 20 }, { name: "Arjuna", x: -9, y: -12 }, { name: "O", x: 0, y: 0 }], segments: [[0, 1]], legs: true } }),
  q(0, "Segitiga siku-siku memiliki sisi siku-siku √{42} dan 2x, serta hipotenusa 5x. Tentukan x.", [rt("x =", 1, 2)],
    "(5x)^{2} = 42 + (2x)^{2}, 25x^{2} − 4x^{2} = 42, 21x^{2} = 42, x^{2} = 2, x = √{2}.", { level: "Sangat menantang", scene: { type: "fig", fig: rightTri(2, Math.sqrt(42) / Math.sqrt(2), ["√42", "2x", "5x"]) } }),
  q(1, "Bilangan (p − q), p, dan (p + q) membentuk tripel Pythagoras dengan p = 20.", [n("q =", 5), n("Sisi terpendek =", 15), n("Sisi terpanjang =", 25)],
    "(p − q)^{2} + p^{2} = (p + q)^{2} → p^{2} = 4pq → p = 4q. Untuk p = 20, q = 5: tripelnya 15, 20, 25.", { level: "Sangat menantang" }),
  q(2, "Tiang antena setinggi 12 m dipasang di atas genting. Kawat penyangga dipasang pada {3/4} tinggi tiang dan diikat 12 m dari kaki tiang. Tembok pembatas berbentuk trapesium sama kaki dengan sisi miring 4 m dan sudut alas 60°.", [n("Panjang kawat =", 15, "m"), rt("Tinggi tembok =", 2, 3, "m")],
    "Kawat dipasang pada 9 m: √{9^{2} + 12^{2}} = √{225} = 15 m. Tembok: sisi miring 4 m dengan sudut 60° adalah hipotenusa segitiga 30°-60°-90°, tingginya {4/2}√{3} = 2√{3} m.", { level: "Sangat menantang", scene: { type: "antenna", pole: "12 m", ground: "12 m" } }),
  q(3, "Penyelam turun dari kapal sepanjang tali 25 m sampai dasar laut yang dalamnya 20 m. Tali yang sama dipakai ke segala arah, sehingga daerah yang dapat dicapai berbentuk lingkaran. Gunakan π = 3,14.", [n("Jari-jari daerah =", 15, "m"), n("Luas dasar laut yang dapat dicapai =", 706.5, "m^{2}")],
    "Jari-jari = √{25^{2} − 20^{2}} = √{225} = 15 m. Luas = 3,14 × 15^{2} = 706,5 m^{2}.", { level: "Sangat menantang", scene: { type: "fig", fig: rightTri(15, 20, ["20 m", "?", "25 m"], ["Kapal", "", "Penyelam"]) } }),
];

export const sources = { JENIS };
