// Kelas 4 Bab 1: Bilangan Cacah sampai 10.000 (Matematika SD/MI Kelas IV, Kemendikbudristek).
// A membaca dan menulis, B nilai tempat, C membandingkan dan mengurutkan, D komposisi dan dekomposisi,
// E penjumlahan, F pengurangan, G perkalian, H pembagian, I faktor dan kelipatan.
import type { Question } from "./grade-four-whole-numbers";

/* ---------- Bilangan ---------- */
const ones = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
function small(n: number): string {
  if (n < 10) return ones[n];
  if (n === 10) return "sepuluh";
  if (n === 11) return "sebelas";
  if (n < 20) return `${ones[n - 10]} belas`;
  if (n < 100) { const t = Math.floor(n / 10), u = n % 10; return `${ones[t]} puluh${u ? ` ${ones[u]}` : ""}`; }
  const h = Math.floor(n / 100), r = n % 100; return `${h === 1 ? "seratus" : `${ones[h]} ratus`}${r ? ` ${small(r)}` : ""}`;
}
export function words(n: number): string {
  if (n < 1000) return small(n);
  const th = Math.floor(n / 1000), r = n % 1000;
  return `${th === 1 ? "seribu" : `${small(th)} ribu`}${r ? ` ${small(r)}` : ""}`;
}
export const reading = (n: number) => { const w = words(n); return w[0].toUpperCase() + w.slice(1); };
export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const places = ["Ribuan", "Ratusan", "Puluhan", "Satuan"] as const;
export const digits4 = (n: number) => String(n).padStart(4, "0").slice(-4).split("").map(Number);
export const placeValue = [1000, 100, 10, 1];

/* ---------- Gambar soal ---------- */
export type Note = 2000 | 1000 | 500 | 100;
export type Thing = "donat" | "pensil" | "botol" | "permen" | "gantungan";
export type Scene =
  | { type: "gauge"; value: number }
  | { type: "mountain"; name: string; height: number }
  | { type: "mountains"; peaks: { name: string; height: number }[] }
  | { type: "receipt"; lines: [string, number][]; total: number }
  | { type: "money"; notes: { value: Note; count: number }[]; caption?: string }
  | { type: "groups"; thing: Thing; groups: number; per: number; label: string }
  | { type: "share"; thing: Thing; total: number; to: number; label: string }
  | { type: "days"; name: string; per: number; days: number; show: number }
  | { type: "cards"; digits: number[] };

/* ---------- Bagian jawaban ---------- */
export type Part =
  | { kind: "fill"; text: string; answers: number[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "rank"; label: string; items: { label: string; value: number }[]; dir: "naik" | "turun" }
  | { kind: "match"; left: string[]; right: string[]; answer: number[] }
  | { kind: "pv"; n: number; hide: boolean[] }
  /** Cara bersusun pendek: penjumlahan (boleh 3 bilangan), pengurangan, atau perkalian. */
  | { kind: "column"; nums: number[]; op: "+" | "−" | "×" }
  /** Pembagian bersusun: isi hasil bagi. */
  | { kind: "div"; a: number; b: number }
  /** Pilih semua bilangan yang memenuhi (faktor, kelipatan). */
  | { kind: "multi"; label: string; options: number[]; answer: number[] };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type WQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const columnResult = (p: Extract<Part, { kind: "column" }>) => (p.op === "+" ? p.nums.reduce((a, b) => a + b, 0) : p.op === "−" ? p.nums[0] - p.nums[1] : p.nums[0] * p.nums[1]);
export const fieldCount = (p: Part) =>
  p.kind === "fill" ? p.answers.length : p.kind === "pv" ? p.hide.filter(Boolean).length : p.kind === "match" ? p.left.length : p.kind === "column" ? String(columnResult(p)).length : p.kind === "div" ? String(p.a / p.b).length : 1;
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const list = (v: string) => (v ? v.split("|") : []);
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replaceAll(".", "")));
const rankSorted = (p: Extract<Part, { kind: "rank" }>) => p.items.map(i => i.value).sort((a, b) => (p.dir === "naik" ? a - b : b - a));
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "choice": return p.answer;
    case "rank": return p.items.map((_, i) => i).sort((a, b) => (p.dir === "naik" ? p.items[a].value - p.items[b].value : p.items[b].value - p.items[a].value) || a - b).join("|");
    case "match": return p.answer.join("|");
    case "pv": return digits4(p.n).filter((_, i) => p.hide[i]).join("|");
    case "column": return String(columnResult(p)).split("").join("|");
    case "div": return String(p.a / p.b).split("").join("|");
    case "multi": return [...p.answer].sort((a, b) => a - b).join("|");
  }
}
export function partCorrect(p: Part, v: string): boolean {
  if (p.kind === "choice") return v === p.answer;
  if (p.kind === "match") return v === partKey(p);
  if (p.kind === "multi") return list(v).map(Number).sort((a, b) => a - b).join("|") === partKey(p);
  if (p.kind === "rank") { const idx = list(v).map(Number); return idx.length === p.items.length && new Set(idx).size === idx.length && idx.map(i => p.items[i]?.value).join("|") === rankSorted(p).join("|"); }
  const want = partKey(p).split("|"), got = cells(p, v);
  return want.every((w, i) => num(got[i]) === Number(w));
}
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "choice") return v !== "";
  if (p.kind === "rank") return list(v).length === p.items.length;
  if (p.kind === "multi") return list(v).length > 0;
  return cells(p, v).every(x => x.trim() !== "");
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: WQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: WQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: WQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => { const c = x[k++]; return c ? fmt(num(c)) : "…"; }); }
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "rank": return `${p.label} ${list(v[i]).map(k => p.items[Number(k)]?.label).join(", ") || "…"}`;
      case "match": return p.left.map((l, k) => `${l} → ${x[k] === "" ? "…" : p.right[Number(x[k])]}`).join("; ");
      case "pv": { let k = 0; return digits4(p.n).map((d, j) => `${places[j].toLowerCase()} ${p.hide[j] ? x[k++] || "…" : d}`).join(", "); }
      case "column": return `${p.nums.map(fmt).join(` ${p.op} `)} = ${x.join("") ? fmt(Number(x.join(""))) : "…"}`;
      case "div": return `${p.a} : ${p.b} = ${x.join("") || "…"}`;
      case "multi": return `${p.label} ${list(v[i]).map(Number).sort((a, b) => a - b).join(", ") || "…"}`;
    }
  }).join(" | ");
}

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Membaca dan Menulis Bilangan Cacah sampai 10.000", short: "Membaca dan menulis", sections: [
    { title: "Membaca dan menulis bilangan empat angka", lab: "read", steps: ["Bilangan empat angka punya tempat ribuan, ratusan, puluhan, dan satuan.", "Baca dari kiri: angka ribuan + ribu, angka ratusan + ratus, angka puluhan + puluh, lalu satuan.", "Angka 0 tidak dibaca. Angka 1 di ribuan dibaca seribu, di ratusan dibaca seratus."], example: "3.286 dibaca tiga ribu dua ratus delapan puluh enam. 7.003 dibaca tujuh ribu tiga.", demo: "Ubah angka di setiap kartu dan dengarkan cara membacanya." },
  ] },
  { code: "B", title: "Menentukan dan Menggunakan Nilai Tempat Bilangan Cacah sampai 10.000", short: "Nilai tempat", sections: [
    { title: "Nilai tempat dengan balok bilangan", lab: "blocks", steps: ["Setiap angka menempati satu nilai tempat: ribuan, ratusan, puluhan, atau satuan.", "Nilai angka = angka × nilai tempatnya. Angka 6 di ratusan bernilai 600.", "Satu kubus besar = 1.000, satu lempeng = 100, satu batang = 10, satu kotak kecil = 1."], example: "Pada 2.150, angka 2 di ribuan (2.000), angka 1 di ratusan (100), angka 5 di puluhan (50), angka 0 di satuan.", demo: "Tambah atau kurangi balok di setiap tempat, lalu ketuk angka untuk melihat nilainya." },
  ] },
  { code: "C", title: "Membandingkan dan Mengurutkan Bilangan Cacah sampai 10.000", short: "Membandingkan", sections: [
    { title: "Membandingkan dan mengurutkan", lab: "compare", steps: ["Bandingkan angka ribuan lebih dulu.", "Jika ribuannya sama, bandingkan ratusan, lalu puluhan, lalu satuan.", "Tanda > dibaca lebih dari, < dibaca kurang dari, = dibaca sama dengan."], example: "4.352 dan 4.365: ribuan dan ratusannya sama, puluhannya 5 dan 6. Jadi 4.352 < 4.365.", demo: "Pilih tanda yang tepat. Kolom yang menentukan akan ditandai." },
  ] },
  { code: "D", title: "Komposisi dan Dekomposisi Bilangan Cacah sampai 10.000", short: "Komposisi", sections: [
    { title: "Menyusun dan mengurai bilangan", lab: "money", steps: ["Komposisi: menyusun bilangan dari bagian-bagiannya. 6 ribuan + 3 ratusan + 4 puluhan + 8 satuan = 6.348.", "Dekomposisi: mengurai bilangan menurut nilai tempat. 6.849 = 6.000 + 800 + 40 + 9.", "Uang juga bisa disusun dan diurai: Rp7.300 = 3 × Rp2.000 + Rp1.000 + 3 × Rp100."], example: "6.035 = 6 ribuan + 0 ratusan + 3 puluhan + 5 satuan = 6.000 + 0 + 30 + 5.", demo: "Atur lembar dan keping uang sampai jumlahnya pas Rp7.300." },
  ] },
  { code: "E", title: "Penjumlahan Bilangan Cacah sampai 1.000", short: "Penjumlahan", sections: [
    { title: "Penjumlahan susun panjang dan pendek", lab: "add", steps: ["Susun panjang: uraikan setiap bilangan, jumlahkan ratusan, puluhan, dan satuan masing-masing.", "Susun pendek: tulis bersusun lurus, jumlahkan dari satuan ke kiri.", "Jika hasil satu kolom 10 atau lebih, tulis satuannya dan simpan 1 ke kolom kiri."], example: "189 + 245: 9 + 5 = 14, tulis 4 simpan 1. 1 + 8 + 4 = 13, tulis 3 simpan 1. 1 + 1 + 2 = 4. Hasilnya 434.", demo: "Tekan Langkah berikutnya untuk menghitung satu kolom demi satu kolom." },
  ] },
  { code: "F", title: "Pengurangan Bilangan Cacah sampai 1.000", short: "Pengurangan", sections: [
    { title: "Pengurangan susun panjang dan pendek", lab: "sub", steps: ["Susun bilangan lurus menurut nilai tempat dan kurangkan dari satuan.", "Jika angka atas lebih kecil, ambil 1 dari tempat di sebelah kirinya: 1 puluhan = 10 satuan.", "Periksa hasil dengan penjumlahan: hasil + pengurang = bilangan yang dikurangi."], example: "241 − 175: 1 < 5, ambil 1 puluhan jadi 11 − 5 = 6. Puluhan tinggal 3 < 7, ambil 1 ratusan jadi 13 − 7 = 6. Hasilnya 66.", demo: "Tekan Langkah berikutnya. Kolom yang mengambil akan ditandai merah." },
  ] },
  { code: "G", title: "Perkalian Bilangan Cacah sampai 100", short: "Perkalian", sections: [
    { title: "Perkalian cara panjang dan bersusun", lab: "mult", steps: ["Perkalian adalah penjumlahan berulang: 12 kotak berisi 4 donat = 12 × 4.", "Cara panjang: pisah bilangan menjadi puluhan dan satuan. 12 × 4 = (10 × 4) + (2 × 4) = 40 + 8.", "Cara bersusun: kalikan satuan dulu. Jika hasilnya 10 atau lebih, simpan puluhannya."], example: "14 × 5: 4 × 5 = 20, tulis 0 simpan 2. 1 × 5 = 5, ditambah 2 = 7. Hasilnya 70.", demo: "Atur banyak kotak dan isi setiap kotak, lalu lihat perkaliannya dipisah." },
  ] },
  { code: "H", title: "Pembagian Bilangan Cacah sampai 100", short: "Pembagian", sections: [
    { title: "Membagi sama banyak dan pembagian bersusun", lab: "share", steps: ["Pembagian adalah membagi sama banyak. 48 permen untuk 4 anak = 48 : 4.", "Pembagian bersusun dimulai dari puluhan: 4 : 4 = 1, lalu satuan: 8 : 4 = 2. Hasilnya 12.", "Jika tidak habis dibagi, ada sisa. Periksa: hasil × pembagi + sisa = bilangan yang dibagi."], example: "48 : 3 = 16 karena 16 × 3 = 48. 48 : 5 = 9 sisa 3.", demo: "Atur banyak permen dan wadah, lalu bagikan satu per satu." },
  ] },
  { code: "I", title: "Faktor dan Kelipatan", short: "Faktor dan kelipatan", sections: [
    { title: "Faktor dan kelipatan", lab: "factor", steps: ["Faktor suatu bilangan adalah bilangan yang membaginya habis (sisa 0). Faktor 12: 1, 2, 3, 4, 6, 12.", "Faktor selalu berpasangan: 2 × 6 = 12 dan 3 × 4 = 12.", "Kelipatan suatu bilangan adalah hasil kali bilangan itu dengan 1, 2, 3, dan seterusnya. Kelipatan 2: 2, 4, 6, 8, …"], example: "5 bukan faktor 12 karena 12 : 5 = 2 sisa 2. Kelipatan 3 kurang dari 20: 3, 6, 9, 12, 15, 18.", demo: "Pilih bilangan, lihat susunan persegi panjang untuk faktornya, atau tandai kelipatannya." },
  ] },
];

/* ---------- Pembuat soal ---------- */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): WQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B, C, D, E, F, G, H, I] = Array.from({ length: 9 }, (_, k) => make(k));
const signs = ["<", ">", "="];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const readChoice = (n: number, wrong: string[], pos: number): Part => { const o = [...wrong]; o.splice(pos, 0, reading(n)); return { kind: "choice", label: "Dibaca:", options: o, answer: reading(n) }; };
const placeChoice = (label: string, answer: string): Part => ({ kind: "choice", label, options: ["Ribuan", "Ratusan", "Puluhan", "Satuan"], answer });
const money = (...notes: [Note, number][]): Scene => ({ type: "money", notes: notes.map(([value, count]) => ({ value, count })) });
const col = (op: "+" | "−" | "×", ...nums: number[]): Part => ({ kind: "column", nums, op });
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/* ---------- Latihan (4 soal per subtopik) ---------- */
const peaks = [{ name: "Sinabung", height: 2460 }, { name: "Semeru", height: 3676 }, { name: "Rinjani", height: 3726 }];
export const practice: WQuestion[][] = [
  [
    A({ prompt: "Tuliskan bilangan pada odometer motor ini dan cara membacanya.", scene: { type: "gauge", value: 6208 }, parts: [fill("Bilangannya □", 6208), readChoice(6208, ["Enam ribu dua puluh delapan", "Enam ratus dua puluh delapan"], 1)], explanation: "6.208: ribuan 6, ratusan 2, puluhan 0 (tidak dibaca), satuan 8. Dibaca enam ribu dua ratus delapan." }),
    A({ prompt: "Bagaimana membaca tinggi gunung ini?", scene: { type: "mountain", name: "Gunung Slamet", height: 3428 }, parts: [readChoice(3428, ["Tiga ribu empat ratus delapan puluh dua", "Tiga ribu dua puluh delapan"], 0)], explanation: "3.428 dibaca tiga ribu empat ratus dua puluh delapan meter di atas permukaan laut." }),
    A({ prompt: "Hubungkan bilangan dengan cara membacanya.", parts: [{ kind: "match", left: ["3.904", "3.149", "7.003", "8.045"], right: ["Delapan ribu empat puluh lima", "Tiga ribu sembilan ratus empat", "Tujuh ribu tiga", "Tiga ribu seratus empat puluh sembilan"], answer: [1, 3, 2, 0] }], explanation: "3.904 tiga ribu sembilan ratus empat, 3.149 tiga ribu seratus empat puluh sembilan, 7.003 tujuh ribu tiga, 8.045 delapan ribu empat puluh lima." }),
    A({ prompt: "Tuliskan dengan angka.", parts: [fill("Tujuh ribu empat puluh = □", 7040), fill("Seribu dua puluh lima = □", 1025)], explanation: "Tujuh ribu empat puluh: ratusan 0, satuan 0, jadi 7.040. Seribu dua puluh lima: ratusan 0, jadi 1.025." }),
  ],
  [
    B({ prompt: "Lengkapi tabel nilai tempat bilangan 7.812.", parts: [{ kind: "pv", n: 7812, hide: [true, true, true, true] }], explanation: "7.812: ribuan 7, ratusan 8, puluhan 1, satuan 2." }),
    B({ prompt: "Perhatikan angka 6 pada bilangan 4.675.", parts: [placeChoice("Nilai tempat angka 6:", "Ratusan"), fill("Nilai angka 6 = □", 600)], explanation: "4.675: angka 6 berada di ratusan, nilainya 6 × 100 = 600." }),
    B({ prompt: "Lengkapi angka yang hilang pada tabel nilai tempat bilangan 9.217.", parts: [{ kind: "pv", n: 9217, hide: [true, false, true, true] }], explanation: "9.217: ribuan 9, ratusan 2, puluhan 1, satuan 7." }),
    B({ prompt: "Perhatikan total belanja pada struk ini.", scene: { type: "receipt", lines: [["Roti", 1500], ["Susu", 650]], total: 2150 }, parts: [placeChoice("Angka 5 pada 2.150 menempati:", "Puluhan"), fill("Nilai angka 5 = □", 50)], explanation: "2.150: ribuan 2, ratusan 1, puluhan 5, satuan 0. Angka 5 bernilai 50." }),
  ],
  [
    C({ prompt: "Isilah dengan tanda >, <, atau =.", parts: [{ kind: "choice", label: "5.734 … 4.312", options: signs, answer: ">" }, { kind: "choice", label: "7.124 … 7.197", options: signs, answer: "<" }], explanation: "5.734 punya 5 ribuan, 4.312 punya 4. Pada 7.124 dan 7.197, ratusannya sama, puluhannya 2 dan 9." }),
    C({ prompt: "Manakah bilangan yang lebih besar?", parts: [{ kind: "choice", label: "5.614 dan 5.368:", options: ["5.368", "5.614"], answer: "5.614" }], explanation: "Ribuannya sama (5). Ratusannya 6 dan 3, jadi 5.614 lebih besar." }),
    C({ prompt: "Urutkan gunung dari yang paling rendah.", scene: { type: "mountains", peaks }, parts: [{ kind: "rank", label: "Ketuk dari yang terendah:", items: peaks.map(p => ({ label: p.name, value: p.height })), dir: "naik" }], explanation: "2.460 < 3.676 < 3.726. Sinabung, Semeru, lalu Rinjani." }),
    C({ prompt: "Susun bilangan empat angka dari kartu ini. Setiap kartu dipakai sekali.", scene: { type: "cards", digits: [1, 5, 9, 2] }, parts: [fill("Terbesar □, terkecil □", 9521, 1259)], explanation: "Terbesar: angka diurutkan dari yang besar, 9.521. Terkecil: dari yang kecil, 1.259." }),
  ],
  [
    D({ prompt: "Susun bilangannya.", parts: [fill("6 ribuan + 4 ratusan + 8 puluhan + 2 satuan = □", 6482)], explanation: "6.000 + 400 + 80 + 2 = 6.482." }),
    D({ prompt: "Uraikan bilangan 7.020.", parts: [fill("7.020 = □ ribuan + □ ratusan + □ puluhan + □ satuan", 7, 0, 2, 0)], explanation: "7.020: ribuan 7, ratusan 0, puluhan 2, satuan 0." }),
    D({ prompt: "Uraikan bilangan 6.035 menurut nilainya.", parts: [fill("6.035 = □ + □ + □ + □", 6000, 0, 30, 5)], explanation: "6.035 = 6.000 + 0 + 30 + 5." }),
    D({ prompt: "Helen membayar Rp7.300 dengan 3 lembar Rp2.000 dan 1 lembar Rp1.000. Sisanya dibayar dengan keping Rp100. Berapa keping?", scene: money([2000, 3], [1000, 1]), parts: [fill("Keping Rp100 sebanyak □", 3)], explanation: "3 × 2.000 + 1.000 = 7.000. Kurang 300 = 3 keping Rp100." }),
  ],
  [
    E({ prompt: "Pak Toni punya 131 pohon jeruk di Jember dan 321 di Banyuwangi. Hitung dengan cara susun panjang.", parts: [fill("(100 + 300) + (30 + 20) + (1 + 1) = □ + □ + □ = □", 400, 50, 2, 452)], explanation: "Ratusan 400, puluhan 50, satuan 2. Jumlahnya 452 pohon." }),
    E({ prompt: "Hitung dengan cara susun pendek.", parts: [col("+", 373, 208)], explanation: "3 + 8 = 11, tulis 1 simpan 1. 1 + 7 + 0 = 8. 3 + 2 = 5. Hasilnya 581." }),
    E({ prompt: "Hitung dengan cara susun pendek.", parts: [col("+", 234, 279, 444)], explanation: "4 + 9 + 4 = 17, tulis 7 simpan 1. 1 + 3 + 7 + 4 = 15, tulis 5 simpan 1. 1 + 2 + 2 + 4 = 9. Hasilnya 957." }),
    E({ prompt: "Pak Rahmad punya 117 ikan lele, Pak Sudi 105, dan Pak Jaya 242. Berapa ikan lele seluruhnya?", parts: [fill("Seluruhnya □ ekor", 464)], explanation: "117 + 105 = 222, lalu 222 + 242 = 464 ekor." }),
  ],
  [
    F({ prompt: "Ada 265 buku di perpustakaan. Sebanyak 132 buku dipinjam. Hitung dengan cara susun panjang.", parts: [fill("(200 − 100) + (60 − 30) + (5 − 2) = □ + □ + □ = □", 100, 30, 3, 133)], explanation: "Ratusan 100, puluhan 30, satuan 3. Sisa 133 buku." }),
    F({ prompt: "Hitung dengan cara susun pendek.", parts: [col("−", 241, 175)], explanation: "1 < 5, ambil 1 puluhan: 11 − 5 = 6. 3 < 7, ambil 1 ratusan: 13 − 7 = 6. 1 − 1 = 0. Hasilnya 66." }),
    F({ prompt: "Hitung dengan cara susun pendek.", parts: [col("−", 422, 146)], explanation: "2 < 6: 12 − 6 = 6. 1 < 4: 11 − 4 = 7. 3 − 1 = 2. Hasilnya 276." }),
    F({ prompt: "Hasil panen mangga Pak Joyo 765 buah. Sebanyak 179 buah busuk. Berapa mangga yang tersisa?", parts: [col("−", 765, 179)], explanation: "5 < 9: 15 − 9 = 6. 5 < 7: 15 − 7 = 8. 6 − 1 = 5. Tersisa 586 buah." }),
  ],
  [
    G({ prompt: "Ada 12 kotak donat. Setiap kotak berisi 4 donat. Hitung dengan cara panjang.", scene: { type: "groups", thing: "donat", groups: 12, per: 4, label: "kotak" }, parts: [fill("12 × 4 = (10 × 4) + (2 × 4) = □ + □ = □", 40, 8, 48)], explanation: "10 × 4 = 40 dan 2 × 4 = 8. Jumlahnya 48 donat." }),
    G({ prompt: "Ada 14 tumpuk kelereng, setiap tumpuk 5 butir. Hitung dengan cara bersusun.", parts: [col("×", 14, 5)], explanation: "4 × 5 = 20, tulis 0 simpan 2. 1 × 5 = 5, ditambah 2 = 7. Hasilnya 70 butir." }),
    G({ prompt: "Koperasi membeli 8 pak pensil. Setiap pak berisi 12 pensil. Berapa pensil seluruhnya?", scene: { type: "groups", thing: "pensil", groups: 8, per: 12, label: "pak" }, parts: [col("×", 12, 8)], explanation: "2 × 8 = 16, tulis 6 simpan 1. 1 × 8 = 8, ditambah 1 = 9. Hasilnya 96 pensil." }),
    G({ prompt: "Azizah punya 21 kucing. Setiap kucing berkaki 4. Berapa kaki seluruhnya?", parts: [fill("21 × 4 = □", 84)], explanation: "21 × 4 = (20 × 4) + (1 × 4) = 80 + 4 = 84 kaki." }),
  ],
  [
    H({ prompt: "Hitung dengan pembagian bersusun.", parts: [{ kind: "div", a: 48, b: 4 }], explanation: "4 : 4 = 1, tulis 1. 8 : 4 = 2, tulis 2. Hasilnya 12." }),
    H({ prompt: "Sebanyak 48 permen dimasukkan satu per satu secara bergantian ke 3 wadah sampai habis.", scene: { type: "share", thing: "permen", total: 48, to: 3, label: "wadah" }, parts: [fill("Setiap wadah □ permen, sisa □", 16, 0)], explanation: "48 : 3 = 16 karena 16 × 3 = 48. Tidak ada sisa." }),
    H({ prompt: "Ibu punya 81 kue. Setiap kotak berisi 3 kue. Berapa kotak yang perlu disiapkan?", parts: [{ kind: "div", a: 81, b: 3 }], explanation: "8 : 3 = 2 sisa 2, turunkan 1 menjadi 21. 21 : 3 = 7. Hasilnya 27 kotak." }),
    H({ prompt: "Putu membagikan 55 gantungan kunci sama banyak kepada 5 teman. Berapa yang diterima setiap teman?", scene: { type: "share", thing: "gantungan", total: 55, to: 5, label: "teman" }, parts: [fill("Setiap teman □", 11)], explanation: "55 : 5 = 11 karena 11 × 5 = 55." }),
  ],
  [
    I({ prompt: "Pilih semua faktor dari 12.", parts: [{ kind: "multi", label: "Faktor 12:", options: range(1, 12), answer: [1, 2, 3, 4, 6, 12] }], explanation: "12 habis dibagi 1, 2, 3, 4, 6, dan 12. 5 bukan faktor karena 12 : 5 = 2 sisa 2." }),
    I({ prompt: "Lengkapi pasangan faktor dari 20.", parts: [fill("1 × □ = 20, 2 × □ = 20, 4 × □ = 20, 5 × □ = 20", 20, 10, 5, 4)], explanation: "Faktor 20 berpasangan: 1 dan 20, 2 dan 10, 4 dan 5. Jadi faktornya 1, 2, 4, 5, 10, 20." }),
    I({ prompt: "Pilih semua kelipatan 6 yang kurang dari 40.", parts: [{ kind: "multi", label: "Kelipatan 6:", options: [6, 9, 12, 16, 18, 24, 28, 30, 34, 36], answer: [6, 12, 18, 24, 30, 36] }], explanation: "6 × 1 = 6, 6 × 2 = 12, 18, 24, 30, 36. 6 × 7 = 42 sudah lebih dari 40." }),
    I({ prompt: "Slamet membeli 3 kelereng setiap hari.", scene: { type: "days", name: "Slamet", per: 3, days: 7, show: 2 }, parts: [fill("Hari ke-4 □ butir, hari ke-7 □ butir", 12, 21)], explanation: "Banyak kelereng adalah kelipatan 3: 3, 6, 9, 12, 15, 18, 21." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
export const assessment: WQuestion[] = [
  A({ level: "Sedang", prompt: "Bagaimana membaca tinggi gunung ini?", scene: { type: "mountain", name: "Gunung Kerinci", height: 3805 }, parts: [readChoice(3805, ["Tiga ribu delapan ratus lima puluh", "Tiga ribu delapan puluh lima"], 2)], explanation: "3.805: ribuan 3, ratusan 8, puluhan 0, satuan 5. Dibaca tiga ribu delapan ratus lima." }),
  B({ level: "Sedang", prompt: "Bilangan 7.034 ditambah 2 ratusan. Lengkapi tabel nilai tempat hasilnya.", parts: [{ kind: "pv", n: 7234, hide: [true, true, true, true] }, fill("Bilangannya □", 7234)], explanation: "7.034 punya 0 ratusan. Ditambah 2 ratusan menjadi 2 ratusan, angka lain tetap: 7.234." }),
  C({ level: "Sedang", prompt: "Isilah dengan tanda >, <, atau =.", parts: [{ kind: "choice", label: "9.999 … 9.998", options: signs, answer: ">" }, { kind: "choice", label: "1.001 … 1.002", options: signs, answer: "<" }], explanation: "9.999 dan 9.998 berbeda di satuan: 9 > 8. 1.001 dan 1.002 berbeda di satuan: 1 < 2." }),
  D({ level: "Sedang", prompt: "Uraikan bilangan 8.032.", parts: [fill("8.032 = □ ribuan + □ ratusan + □ puluhan + □ satuan", 8, 0, 3, 2)], explanation: "8.032: ribuan 8, ratusan 0, puluhan 3, satuan 2." }),
  E({ level: "Sedang", prompt: "Hitung dengan cara susun pendek.", parts: [col("+", 134, 764)], explanation: "4 + 4 = 8, 3 + 6 = 9, 1 + 7 = 8. Hasilnya 898." }),
  F({ level: "Sedang", prompt: "Hitung dengan cara susun pendek.", parts: [col("−", 712, 324)], explanation: "2 < 4: 12 − 4 = 8. 0 < 2: ambil ratusan, 10 − 2 = 8. 6 − 3 = 3. Hasilnya 388." }),
  G({ level: "Sedang", prompt: "Hitung dengan cara panjang.", parts: [fill("21 × 4 = (20 × 4) + (1 × 4) = □ + □ = □", 80, 4, 84)], explanation: "20 × 4 = 80 dan 1 × 4 = 4. Jumlahnya 84." }),
  H({ level: "Sedang", prompt: "Hitung dengan pembagian bersusun.", parts: [{ kind: "div", a: 96, b: 3 }], explanation: "9 : 3 = 3, tulis 3. 6 : 3 = 2, tulis 2. Hasilnya 32." }),

  I({ level: "Menantang", prompt: "Pilih semua faktor dari 27.", parts: [{ kind: "multi", label: "Faktor 27:", options: [1, 2, 3, 4, 6, 7, 9, 13, 27], answer: [1, 3, 9, 27] }], explanation: "27 = 1 × 27 = 3 × 9. Faktornya 1, 3, 9, 27. 27 bukan bilangan genap, jadi 2, 4, 6 bukan faktor." }),
  A({ level: "Menantang", prompt: "Hubungkan bilangan dengan cara membacanya.", parts: [{ kind: "match", left: ["4.050", "4.005", "4.500", "5.040"], right: ["Empat ribu lima", "Lima ribu empat puluh", "Empat ribu lima puluh", "Empat ribu lima ratus"], answer: [2, 0, 3, 1] }], explanation: "4.050 empat ribu lima puluh, 4.005 empat ribu lima, 4.500 empat ribu lima ratus, 5.040 lima ribu empat puluh. Perhatikan letak angka 0." }),
  B({ level: "Menantang", prompt: "Angka 5 pada 4.253 bernilai 50. Pada bilangan mana angka 5 bernilai 500?", parts: [{ kind: "choice", label: "Pilih:", options: ["2.345", "5.234", "4.523", "3.452"], answer: "4.523" }, fill("Selisih nilai angka 5 pada 5.234 dan 4.253 = □", 4950)], explanation: "Bernilai 500 berarti 5 di ratusan: 4.523. Pada 5.234 angka 5 bernilai 5.000, pada 4.253 bernilai 50. Selisihnya 5.000 − 50 = 4.950." }),
  C({ level: "Menantang", prompt: "Urutkan bilangan dari yang terbesar.", parts: [{ kind: "rank", label: "Ketuk dari yang terbesar:", items: [7570, 5240, 3041, 9941].map(v => ({ label: fmt(v), value: v })), dir: "turun" }], explanation: "Bandingkan ribuannya: 9 > 7 > 5 > 3. Jadi 9.941, 7.570, 5.240, 3.041." }),
  D({ level: "Menantang", prompt: "Bayar Rp7.300 dengan uang ini. Gunakan lembar dan keping sesedikit mungkin.", scene: money([2000, 4], [1000, 5], [500, 2], [100, 4]), parts: [fill("Rp2.000 □, Rp1.000 □, Rp500 □, Rp100 □", 3, 1, 0, 3)], explanation: "Pakai uang terbesar dulu: 3 × 2.000 = 6.000, 1 × 1.000 = 1.000, sisa 300. Rp500 terlalu besar, jadi 3 keping Rp100. Seluruhnya 7 lembar dan keping." }),
  E({ level: "Menantang", prompt: "Tarik garis dari setiap penjumlahan ke hasilnya.", parts: [{ kind: "match", left: ["629 + 123", "377 + 330 + 29", "423 + 390", "39 + 821"], right: ["813", "736", "860", "752"], answer: [3, 1, 0, 2] }], explanation: "629 + 123 = 752. 377 + 330 + 29 = 736. 423 + 390 = 813. 39 + 821 = 860." }),
  F({ level: "Menantang", prompt: "Sebanyak 256 siswa mengikuti lomba matematika. Sebanyak 179 siswa laki-laki. Berapa siswa perempuan?", parts: [col("−", 256, 179)], explanation: "6 < 9: 16 − 9 = 7. 4 < 7: 14 − 7 = 7. 1 − 1 = 0. Siswa perempuan 77." }),
  G({ level: "Menantang", prompt: "Satu karton berisi 24 botol air mineral. Berapa botol dalam 8 karton?", scene: { type: "groups", thing: "botol", groups: 8, per: 24, label: "karton" }, parts: [col("×", 24, 8)], explanation: "4 × 8 = 32, tulis 2 simpan 3. 2 × 8 = 16, ditambah 3 = 19. Hasilnya 192 botol." }),
  H({ level: "Menantang", prompt: "Pak guru membeli 3 pak permen. Setiap pak berisi 30 permen. Permen dibagikan sama rata kepada 5 siswa.", scene: { type: "groups", thing: "permen", groups: 3, per: 30, label: "pak" }, parts: [fill("Semua permen □", 90), fill("Setiap siswa □", 18)], explanation: "3 × 30 = 90 permen. 90 : 5 = 18 permen untuk setiap siswa." }),

  I({ level: "Sangat menantang", prompt: "Pilih semua kelipatan 4 yang lebih dari 7 dan kurang dari 25.", parts: [{ kind: "multi", label: "Pilih:", options: [4, 8, 10, 12, 14, 16, 18, 20, 24, 28], answer: [8, 12, 16, 20, 24] }], explanation: "Kelipatan 4: 4, 8, 12, 16, 20, 24, 28. Yang lebih dari 7 dan kurang dari 25: 8, 12, 16, 20, 24." }),
  A({ level: "Sangat menantang", prompt: "Susun bilangan terbesar dan terkecil dari kartu ini. Setiap kartu dipakai sekali, angka pertama bukan 0.", scene: { type: "cards", digits: [0, 3, 7, 8] }, parts: [fill("Terbesar □", 8730), fill("Terkecil □", 3078), readChoice(3078, ["Tiga ribu tujuh ratus delapan", "Tiga ratus tujuh puluh delapan"], 1)], explanation: "Terbesar 8.730. Terkecil: 0 tidak boleh di depan, jadi 3 di depan, lalu 0, 7, 8: 3.078, dibaca tiga ribu tujuh puluh delapan." }),
  B({ level: "Sangat menantang", prompt: "Sebuah bilangan empat angka: ribuannya 6, ratusannya 2 lebih dari ribuan, puluhannya setengah dari ratusan, dan satuannya 1 kurang dari ribuan. Lengkapi tabelnya.", parts: [{ kind: "pv", n: 6845, hide: [true, true, true, true] }, fill("Bilangannya □", 6845)], explanation: "Ribuan 6, ratusan 6 + 2 = 8, puluhan 8 : 2 = 4, satuan 6 − 1 = 5. Bilangannya 6.845." }),
  C({ level: "Sangat menantang", prompt: "Titik-titik pada 3.4…5 diisi satu angka. Agar bilangannya lebih dari 3.475, berapa angka terkecil yang dapat diisikan?", parts: [fill("Angka terkecil: □", 8)], explanation: "Ribuan dan ratusannya sama. Puluhannya harus lebih dari 7 (jika 7, satuannya sama-sama 5 sehingga hasilnya sama). Angka terkecil 8: 3.485 > 3.475." }),
  D({ level: "Sangat menantang", prompt: "Bilangan 6.035 dapat diuraikan dengan cara lain. Lengkapi uraian ini.", parts: [fill("6.035 = 5 ribuan + □ ratusan + 3 puluhan + 5 satuan", 10)], explanation: "Satu ribuan = 10 ratusan. 6 ribuan + 0 ratusan = 5 ribuan + 10 ratusan. Periksa: 5.000 + 1.000 + 30 + 5 = 6.035." }),
  F({ level: "Sangat menantang", prompt: "Slamet punya 111 kelereng. Ia mendapat 36 kelereng dari kakaknya, lalu memberikan 54 kelereng kepada Asep.", parts: [fill("Setelah mendapat hadiah □", 147), fill("Kelereng Slamet sekarang □", 93)], explanation: "111 + 36 = 147. Lalu 147 − 54 = 93 kelereng." }),
  H({ level: "Sangat menantang", prompt: "Azizah mendapat 128 gantungan kunci dari ayah dan 76 dari paman. Semua dibagi sama rata untuk 5 temannya dan Azizah sendiri.", parts: [fill("Semua gantungan kunci □", 204), fill("Setiap anak mendapat □", 34)], explanation: "128 + 76 = 204. Dibagi untuk 5 teman + Azizah = 6 anak: 204 : 6 = 34." }),
];
