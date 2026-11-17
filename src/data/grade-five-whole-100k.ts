// Kelas 5 Bab 1: Bilangan Cacah sampai 100.000 (Matematika SD/MI Kelas V, Kemendikbudristek 2022).
// A. Membaca, menulis, nilai tempat; B. membandingkan dan mengurutkan; C. komposisi dan dekomposisi; D. operasi hitung.
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
export const places = ["Puluh Ribuan", "Ribuan", "Ratusan", "Puluhan", "Satuan"] as const;
export const digits5 = (n: number) => String(n).padStart(5, "0").slice(-5).split("").map(Number);
export const placeValue = [10000, 1000, 100, 10, 1];

/* ---------- Gambar soal ---------- */
export type Item = "obat" | "buku" | "pensil" | "dakon" | "termos" | "tas";
export type Note = 20000 | 10000 | 5000 | 2000 | 1000 | 100;
export type Scene =
  | { type: "tags"; items: { item: Item; price: number; name: string }[] }
  | { type: "money"; notes: { value: Note; count: number }[]; caption?: string }
  | { type: "board"; title: string; rows: [string, number][] }
  | { type: "paket"; pakets: { name: string; lines: string[]; price: number }[] }
  | { type: "cards"; digits: number[] }
  | { type: "angpau"; count: number; value: number };

/* ---------- Bagian jawaban ---------- */
export type Part =
  | { kind: "fill"; text: string; answers: number[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "rank"; label: string; items: { label: string; value: number }[]; dir: "naik" | "turun" }
  | { kind: "match"; left: string[]; right: string[]; answer: number[] }
  | { kind: "pv"; n: number; hide: boolean[] }
  | { kind: "column"; a: number; b: number; op: "+" | "−" };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type NQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const columnResult = (p: Extract<Part, { kind: "column" }>) => (p.op === "+" ? p.a + p.b : p.a - p.b);
export const fieldCount = (p: Part) =>
  p.kind === "fill" ? p.answers.length : p.kind === "pv" ? p.hide.filter(Boolean).length : p.kind === "match" ? p.left.length : p.kind === "column" ? String(columnResult(p)).length : 1;
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
    case "pv": return digits5(p.n).filter((_, i) => p.hide[i]).join("|");
    case "column": return String(columnResult(p)).split("").join("|");
  }
}
export function partCorrect(p: Part, v: string): boolean {
  if (p.kind === "choice") return v === p.answer;
  if (p.kind === "match") return v === partKey(p);
  if (p.kind === "rank") { const idx = list(v).map(Number); return idx.length === p.items.length && new Set(idx).size === idx.length && idx.map(i => p.items[i]?.value).join("|") === rankSorted(p).join("|"); }
  const want = partKey(p).split("|"), got = cells(p, v);
  return want.every((w, i) => num(got[i]) === Number(w));
}
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "choice") return v !== "";
  if (p.kind === "rank") return list(v).length === p.items.length;
  return cells(p, v).every(x => x.trim() !== "");
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: NQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: NQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: NQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => { const c = x[k++]; return c ? fmt(num(c)) : "…"; }); }
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "rank": return `${p.label} ${list(v[i]).map(k => p.items[Number(k)]?.label).join(", ") || "…"}`;
      case "match": return p.left.map((l, k) => `${l} → ${x[k] === "" ? "…" : p.right[Number(x[k])]}`).join("; ");
      case "pv": { let k = 0; return digits5(p.n).map((d, j) => `${places[j].toLowerCase()} ${p.hide[j] ? x[k++] || "…" : d}`).join(", "); }
      case "column": return `${fmt(p.a)} ${p.op} ${fmt(p.b)} = ${x.join("") ? fmt(Number(x.join(""))) : "…"}`;
    }
  }).join(" | ");
}

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Membaca dan Menulis Bilangan Cacah sampai 100.000 dan Menentukan Nilai Tempatnya", short: "Membaca dan menulis", sections: [
    { title: "Nilai tempat lima angka", lab: "place", steps: ["Bilangan lima angka punya nilai tempat puluh ribuan, ribuan, ratusan, puluhan, dan satuan.", "Tulis angka sesuai nilai tempatnya dari kiri. Tempat yang kosong diisi 0.", "Titik dipasang setelah ribuan agar mudah dibaca: 14.500."], example: "Empat belas ribu lima ratus: puluh ribuan 1, ribuan 4, ratusan 5, puluhan 0, satuan 0. Ditulis 14.500.", demo: "Ubah angka di setiap kolom dan perhatikan nilai serta cara bacanya." },
    { title: "Membaca harga", lab: "price", steps: ["Bagi bilangan di tanda titik menjadi dua bagian.", "Baca bagian kiri lalu tambahkan kata ribu.", "Baca bagian kanan seperti bilangan ratusan biasa."], example: "66.500 dibagi menjadi 66 dan 500: enam puluh enam ribu lima ratus.", demo: "Ketuk label harga. Lihat bagaimana bilangan dibaca per bagian." },
  ] },
  { code: "B", title: "Membandingkan dan Mengurutkan Bilangan Cacah sampai 100.000", short: "Membandingkan", sections: [
    { title: "Membandingkan dua bilangan", lab: "compare", steps: ["Bandingkan angka puluh ribuan lebih dulu.", "Jika sama, lanjutkan ke ribuan, ratusan, puluhan, lalu satuan.", "Angka yang lebih besar pada tempat pertama yang berbeda menentukan bilangan yang lebih besar."], example: "86.567 dan 86.576: puluh ribuan, ribuan, ratusan sama. Puluhannya 6 dan 7, jadi 86.567 < 86.576.", demo: "Pilih tanda yang tepat. Kolom yang menentukan akan ditandai." },
    { title: "Mengurutkan harga", lab: "order", steps: ["Cari harga dengan puluh ribuan terkecil.", "Jika puluh ribuannya sama, bandingkan ribuannya, dan seterusnya.", "Urutan termurah bisa dibalik menjadi termahal."], example: "56.560, 57.000, 65.750, 75.360 diurutkan dari yang paling murah.", demo: "Bantu Lukas membeli papan dakon. Ketuk dari yang paling murah." },
  ] },
  { code: "C", title: "Komposisi dan Dekomposisi Bilangan sampai 100.000", short: "Komposisi", sections: [
    { title: "Menyusun dan mengurai uang", lab: "money", steps: ["Komposisi: menyusun bilangan dari bagian-bagiannya, misalnya dari lembaran uang.", "3 lembar sepuluh ribuan, 8 lembar seribuan, 6 keping seratusan = 30.000 + 8.000 + 600 = 38.600.", "Dekomposisi: mengurai bilangan menurut nilai tempat, misalnya 38.600 = 30.000 + 8.000 + 600 + 0 + 0."], example: "Rp45.600 bisa dibayar dengan 4 lembar sepuluh ribuan, 5 lembar seribuan, 6 keping seratusan, atau cara lain.", demo: "Atur lembar uang sampai pas Rp45.600, lalu catat caranya." },
  ] },
  { code: "D", title: "Operasi Hitung pada Bilangan Cacah sampai 100.000", short: "Operasi hitung", sections: [
    { title: "Penjumlahan dan pengurangan bersusun", lab: "column", steps: ["Susun bilangan lurus menurut nilai tempat.", "Hitung dari satuan ke kiri. Pada penjumlahan, simpan 1 jika hasilnya 10 atau lebih.", "Pada pengurangan, jika angka atas lebih kecil, pinjam 1 dari tempat di sebelah kiri."], example: "57.500 + 22.000 = 79.500. 47.900 − 45.750 = 2.150.", demo: "Tekan Langkah berikutnya untuk menghitung satu kolom demi satu kolom." },
    { title: "Perkalian dan pembagian", lab: "angpau", steps: ["Perkalian bisa dipisah: 12 × 5.000 = 10 × 5.000 + 2 × 5.000.", "Pembagian adalah membagi sama banyak: 64.000 : 4 = 16.000.", "Periksa pembagian dengan perkalian: 16.000 × 4 = 64.000."], example: "Yohana mendapat 12 angpau berisi Rp5.000: 50.000 + 10.000 = Rp60.000.", demo: "Atur banyak angpau dan isinya, atau bagikan uang ke beberapa anak." },
  ] },
];

/* ---------- Pembuat soal ---------- */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): NQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const A = make(0), B = make(1), C = make(2), D = make(3);
const signs = ["<", ">", "="];
const tf = ["Benar", "Salah"];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const readChoice = (n: number, wrong: string[], pos: number): Part => { const o = [...wrong]; o.splice(pos, 0, reading(n)); return { kind: "choice", label: "Dibaca:", options: o, answer: reading(n) }; };
const money = (...notes: [Note, number][]): Scene => ({ type: "money", notes: notes.map(([value, count]) => ({ value, count })) });

/* ---------- Latihan (4 soal per subtopik) ---------- */
const dakon = [{ label: "Dakon A", value: 56560 }, { label: "Dakon B", value: 65750 }, { label: "Dakon C", value: 57000 }, { label: "Dakon D", value: 75360 }];
export const practice: NQuestion[][] = [
  [
    A({ prompt: "Tuliskan dengan angka: empat puluh dua ribu enam ratus lima.", parts: [fill("Ditulis □", 42605)], explanation: "Puluh ribuan 4, ribuan 2, ratusan 6, puluhan 0, satuan 5: 42.605." }),
    A({ prompt: "Bagaimana membaca harga termos ini?", scene: { type: "tags", items: [{ item: "termos", price: 38750, name: "Termos" }] }, parts: [readChoice(38750, ["Tiga ratus delapan puluh tujuh ribu lima puluh", "Tiga puluh delapan ribu tujuh puluh lima"], 0)], explanation: "38.750 dibagi menjadi 38 dan 750: tiga puluh delapan ribu tujuh ratus lima puluh." }),
    A({ prompt: "Lengkapi tabel nilai tempat bilangan 60.418.", parts: [{ kind: "pv", n: 60418, hide: [true, true, true, true, true] }], explanation: "60.418 = 6 puluh ribuan, 0 ribuan, 4 ratusan, 1 puluhan, 8 satuan." }),
    A({ prompt: "Perhatikan angka 7 pada bilangan 27.509.", parts: [{ kind: "choice", label: "Nilai tempat:", options: ["Puluh ribuan", "Ribuan", "Ratusan"], answer: "Ribuan" }, fill("Nilai angka 7 = □", 7000)], explanation: "27.509: angka 7 berada di ribuan, nilainya 7.000." }),
  ],
  [
    B({ prompt: "Isilah dengan tanda >, <, atau =.", parts: [{ kind: "choice", label: "76.675 … 67.765", options: signs, answer: ">" }, { kind: "choice", label: "86.567 … 86.576", options: signs, answer: "<" }], explanation: "76.675 punya 7 puluh ribuan, 67.765 punya 6. Untuk 86.567 dan 86.576, puluhannya 6 < 7." }),
    B({ prompt: "Manakah bilangan yang nilainya lebih kecil?", parts: [{ kind: "choice", label: "78.897 dan 87.897:", options: ["78.897", "87.897"], answer: "78.897" }], explanation: "Puluh ribuannya 7 dan 8. Jadi 78.897 lebih kecil." }),
    B({ prompt: "Urutkan harga papan dakon dari yang paling murah.", scene: { type: "tags", items: dakon.map(d => ({ item: "dakon" as const, price: d.value, name: d.label })) }, parts: [{ kind: "rank", label: "Ketuk dari yang termurah:", items: dakon, dir: "naik" }], explanation: "56.560 < 57.000 < 65.750 < 75.360. Dakon A, C, B, lalu D." }),
    B({ prompt: "Isilah dengan bilangan yang sesuai.", parts: [fill("15.500, 16.500, □, □, 19.500", 17500, 18500)], explanation: "Setiap bilangan bertambah 1.000: 17.500 dan 18.500." }),
  ],
  [
    C({ prompt: "Uang Asep terdiri atas lembaran berikut. Berapa uangnya?", scene: money([10000, 3], [1000, 8], [100, 6]), parts: [fill("30.000 + □ + □ = □", 8000, 600, 38600)], explanation: "8 lembar seribuan = 8.000, 6 keping seratusan = 600. 30.000 + 8.000 + 600 = 38.600." }),
    C({ prompt: "Uraikan bilangan 64.305 menurut nilai tempatnya.", parts: [fill("64.305 = □ + □ + □ + □ + □", 60000, 4000, 300, 0, 5)], explanation: "64.305 = 60.000 + 4.000 + 300 + 0 + 5." }),
    C({ prompt: "Komang membayar Rp45.600 dengan 4 lembar sepuluh ribuan. Berapa lembar seribuan dan keping seratusan agar banyaknya uang paling sedikit?", scene: money([10000, 4]), parts: [fill("Seribuan □ lembar, seratusan □ keping", 5, 6)], explanation: "45.600 − 40.000 = 5.600 = 5 lembar seribuan dan 6 keping seratusan." }),
    C({ prompt: "Ibu membayar Rp59.000 dengan 2 lembar Rp20.000, 1 lembar Rp10.000, dan 1 lembar Rp5.000. Sisanya dibayar dengan lembar Rp2.000. Berapa lembar?", scene: money([20000, 2], [10000, 1], [5000, 1]), parts: [fill("Rp2.000 sebanyak □ lembar", 2)], explanation: "40.000 + 10.000 + 5.000 = 55.000. Kurang 4.000 = 2 lembar Rp2.000." }),
  ],
  [
    D({ prompt: "Hitung jumlah uang Nisa dengan cara bersusun.", parts: [{ kind: "column", a: 57500, b: 22000, op: "+" }], explanation: "Jumlahkan per nilai tempat: 7 puluh ribuan, 9 ribuan, 5 ratusan, 0, 0. Hasilnya 79.500." }),
    D({ prompt: "Uang Lukas Rp47.900. Ia membayar Rp45.750. Berapa sisa uangnya?", parts: [{ kind: "column", a: 47900, b: 45750, op: "−" }], explanation: "0 − 0 = 0, 0 − 5 pinjam: 10 − 5 = 5, 8 − 7 = 1, 7 − 5 = 2, 4 − 4 = 0. Sisa 2.150." }),
    D({ prompt: "Yohana mendapat 12 angpau, masing-masing berisi Rp5.000. Hitung dengan memisahkan pengalinya.", scene: { type: "angpau", count: 12, value: 5000 }, parts: [fill("12 × 5.000 = 10 × 5.000 + 2 × 5.000 = □ + □ = □", 50000, 10000, 60000)], explanation: "10 × 5.000 = 50.000 dan 2 × 5.000 = 10.000. Jumlahnya 60.000." }),
    D({ prompt: "Uang Rp64.000 dibagikan sama rata kepada 4 anak. Berapa uang setiap anak?", parts: [fill("64.000 : 4 = □", 16000)], explanation: "64.000 : 4 = 16.000 karena 16.000 × 4 = 64.000." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
const fruit: [string, number][] = [["Mangga", 24500], ["Jeruk", 16000], ["Kelengkeng", 36000], ["Buah naga", 14000], ["Alpukat", 31000]];
const fruitBoard: Scene = { type: "board", title: "Harga satu bungkus buah", rows: fruit };
const order5 = [56560, 56506, 56650, 55660, 56065];
export const assessment: NQuestion[] = [
  A({ level: "Sedang", prompt: "Nyatakan bilangan berikut dengan angka.", parts: [fill("Lima puluh ribu tiga ratus tiga = □", 50303), fill("Tiga puluh tiga ribu empat ratus tiga = □", 33403)], explanation: "50.303: tidak ada ribuan dan puluhan, ditulis 0. 33.403: puluhannya 0." }),
  B({ level: "Sedang", prompt: "Bandingkan pasangan bilangan berikut dengan tanda >, <, atau =.", parts: [{ kind: "choice", label: "45.867 … 55.876", options: signs, answer: "<" }, { kind: "choice", label: "13.234 … 13.234", options: signs, answer: "=" }], explanation: "45.867 punya 4 puluh ribuan, 55.876 punya 5, jadi <. Bilangan kedua sama persis, jadi =." }),
  C({ level: "Sedang", prompt: "Tuliskan jumlah uang berikut dengan angka, lalu pilih cara membacanya.", scene: money([10000, 9], [1000, 7], [100, 5]), parts: [fill("Jumlahnya □", 97500), readChoice(97500, ["Sembilan ribu tujuh ratus lima puluh", "Sembilan puluh tujuh ribu lima puluh"], 1)], explanation: "90.000 + 7.000 + 500 = 97.500, dibaca sembilan puluh tujuh ribu lima ratus." }),
  D({ level: "Sedang", prompt: "Hitung dengan cara bersusun pendek.", parts: [{ kind: "column", a: 76598, b: 12456, op: "+" }], explanation: "8 + 6 = 14 simpan 1, 1 + 9 + 5 = 15 simpan 1, 1 + 5 + 4 = 10 simpan 1, 1 + 6 + 2 = 9, 7 + 1 = 8. Hasilnya 89.054." }),
  A({ level: "Sedang", prompt: "Jumlah penduduk Kepulauan Sitaro 72.135 jiwa. Bagaimana membacanya?", parts: [readChoice(72135, ["Tujuh ribu dua ratus tiga puluh lima", "Tujuh puluh dua ribu seratus lima puluh tiga"], 2)], explanation: "72.135 dibagi 72 dan 135: tujuh puluh dua ribu seratus tiga puluh lima." }),
  B({ level: "Sedang", prompt: "Dari dua bilangan ini, mana yang lebih kecil?", parts: [{ kind: "choice", label: "97.768 dan 89.876:", options: ["97.768", "89.876"], answer: "89.876" }], explanation: "Puluh ribuannya 9 dan 8. Jadi 89.876 lebih kecil walaupun angka lainnya lebih besar." }),
  C({ level: "Sedang", prompt: "Uraikan bilangan 85.040 menurut nilai tempatnya.", parts: [fill("85.040 = □ + □ + □ + □ + □", 80000, 5000, 0, 40, 0)], explanation: "85.040 = 80.000 + 5.000 + 0 + 40 + 0." }),
  D({ level: "Sedang", prompt: "Hitunglah pengurangan berikut dengan cara bersusun pendek.", parts: [{ kind: "column", a: 67987, b: 13453, op: "−" }], explanation: "7 − 3 = 4, 8 − 5 = 3, 9 − 4 = 5, 7 − 3 = 4, 6 − 1 = 5. Hasilnya 54.534." }),

  A({ level: "Menantang", prompt: "Hubungkan bilangan dengan cara membacanya.", parts: [{ kind: "match", left: ["40.350", "40.035", "43.050", "34.050"], right: ["Empat puluh ribu tiga puluh lima", "Tiga puluh empat ribu lima puluh", "Empat puluh ribu tiga ratus lima puluh", "Empat puluh tiga ribu lima puluh"], answer: [2, 0, 3, 1] }], explanation: "40.350 empat puluh ribu tiga ratus lima puluh, 40.035 empat puluh ribu tiga puluh lima, 43.050 empat puluh tiga ribu lima puluh, 34.050 tiga puluh empat ribu lima puluh." }),
  B({ level: "Menantang", prompt: "Urutkan harga tas dari yang paling mahal.", scene: { type: "tags", items: [48250, 84520, 48520, 45820].map((v, i) => ({ item: "tas" as const, price: v, name: `Tas ${"ABCD"[i]}` })) }, parts: [{ kind: "rank", label: "Ketuk dari yang termahal:", items: [48250, 84520, 48520, 45820].map((v, i) => ({ label: `Tas ${"ABCD"[i]}`, value: v })), dir: "turun" }], explanation: "84.520 > 48.520 > 48.250 > 45.820. Tas B, C, A, lalu D." }),
  C({ level: "Menantang", prompt: "Bayar Rp45.600 dengan uang sepuluh ribuan, seribuan, dan seratusan. Berapa banyak masing-masing agar jumlah lembar dan kepingnya paling sedikit?", scene: money([10000, 5], [1000, 15], [100, 16]), parts: [fill("Sepuluh ribuan □, seribuan □, seratusan □", 4, 5, 6)], explanation: "Pakai uang besar sebanyak mungkin: 4 × 10.000 = 40.000, 5 × 1.000 = 5.000, 6 × 100 = 600. Jumlahnya 45.600." }),
  D({ level: "Menantang", prompt: "Ada 15 amplop berisi Rp4.000. Hitung dengan memisahkan pengalinya.", scene: { type: "angpau", count: 15, value: 4000 }, parts: [fill("15 × 4.000 = 10 × 4.000 + 5 × 4.000 = □ + □ = □", 40000, 20000, 60000)], explanation: "10 × 4.000 = 40.000 dan 5 × 4.000 = 20.000. Jumlahnya 60.000." }),
  A({ level: "Menantang", prompt: "Bilangan mana yang angka 7-nya berada di puluh ribuan dan di satuan?", parts: [{ kind: "choice", label: "Pilih:", options: ["70.475", "17.507", "74.017", "77.170"], answer: "74.017" }, fill("Nilai 7 di puluh ribuan = □", 70000)], explanation: "74.017: puluh ribuan 7 dan satuan 7. Pada 70.475 satuannya 5, pada 17.507 puluh ribuannya 1, pada 77.170 satuannya 0." }),
  B({ level: "Menantang", prompt: "Lengkapi kedua barisan bilangan berikut.", parts: [fill("□, 50.000, 70.000, □", 30000, 90000), fill("85.350, □, 85.450, □, 85.550", 85400, 85500)], explanation: "Barisan pertama bertambah 20.000: 30.000 dan 90.000. Barisan kedua bertambah 50: 85.400 dan 85.500." }),
  C({ level: "Menantang", prompt: "Uang Lukas 6 lembar sepuluh ribuan, 3 lembar seribuan, 5 keping seratusan. Uang Asep 3 lembar sepuluh ribuan, 8 lembar seribuan, 6 keping seratusan.", parts: [fill("Uang Lukas □, uang Asep □", 63500, 38600), { kind: "choice", label: "Uangnya lebih banyak:", options: ["Asep", "Lukas"], answer: "Lukas" }], explanation: "Lukas 60.000 + 3.000 + 500 = 63.500. Asep 30.000 + 8.000 + 600 = 38.600. Uang Lukas lebih banyak." }),
  D({ level: "Menantang", prompt: "Perhatikan harga buah. Tentukan benar atau salah.", scene: fruitBoard, parts: [{ kind: "choice", label: "Harga paling mahal kelengkeng.", options: tf, answer: "Benar" }, { kind: "choice", label: "Dua bungkus buah naga lebih mahal daripada satu bungkus alpukat.", options: tf, answer: "Salah" }, { kind: "choice", label: "Tiga bungkus jeruk lebih mahal daripada satu bungkus kelengkeng.", options: tf, answer: "Benar" }], explanation: "Kelengkeng 36.000 paling mahal. 2 × 14.000 = 28.000 < 31.000. 3 × 16.000 = 48.000 > 36.000." }),
  A({ level: "Menantang", prompt: "Penduduk Kecamatan Kayu Tanam berjumlah 26.932 jiwa. Lengkapi nilai tempatnya.", parts: [{ kind: "pv", n: 26932, hide: [true, true, true, true, true] }], explanation: "26.932 = 2 puluh ribuan, 6 ribuan, 9 ratusan, 3 puluhan, 2 satuan." }),

  D({ level: "Sangat menantang", prompt: "Uang Rp84.000 dibagi sama rata kepada 4 anak. Setiap anak membeli sebungkus jeruk seharga Rp16.000. Berapa sisa uang setiap anak?", scene: fruitBoard, parts: [fill("Setiap anak mendapat □", 21000), fill("Sisa uang setiap anak □", 5000)], explanation: "84.000 : 4 = 21.000. Lalu 21.000 − 16.000 = 5.000." }),
  B({ level: "Sangat menantang", prompt: "Urutkan bilangan dari yang terkecil.", parts: [{ kind: "rank", label: "Ketuk dari yang terkecil:", items: order5.map(v => ({ label: fmt(v), value: v })), dir: "naik" }], explanation: "55.660 punya 5 ribuan, paling kecil. Sisanya 56 ribu: ratusannya 0, 0, 5, 6. 56.065 < 56.506 < 56.560 < 56.650." }),
  C({ level: "Sangat menantang", prompt: "Ibu Saga berbelanja Rp59.000. Ia memakai 2 lembar Rp20.000 dan 1 lembar Rp5.000. Sisanya dibayar dengan Rp10.000 sebanyak mungkin, lalu Rp2.000.", scene: money([20000, 2], [10000, 3], [5000, 2], [2000, 5]), parts: [fill("Rp10.000 □ lembar, Rp2.000 □ lembar", 1, 2)], explanation: "59.000 − 40.000 − 5.000 = 14.000. Rp10.000 hanya bisa 1 lembar (2 lembar = 20.000 terlalu banyak), sisanya 4.000 = 2 lembar Rp2.000." }),
  D({ level: "Sangat menantang", prompt: "Pasangkan setiap hitungan harga buah dengan hasilnya.", scene: fruitBoard, parts: [{ kind: "match", left: ["2 mangga + 1 jeruk", "100.000 − 2 mangga − 2 naga", "Termurah + termahal", "Kelengkeng − 2 naga"], right: ["Rp50.000", "Rp8.000", "Rp65.000", "Rp23.000"], answer: [2, 3, 0, 1] }], explanation: "2 × 24.500 + 16.000 = 65.000. 100.000 − 49.000 − 28.000 = 23.000. 14.000 + 36.000 = 50.000. 36.000 − 28.000 = 8.000." }),
  A({ level: "Sangat menantang", prompt: "Dengan kartu 0, 3, 5, 8, dan 9 masing-masing sekali, susun bilangan lima angka terbesar dan terkecil. Angka pertama tidak boleh 0.", scene: { type: "cards", digits: [0, 3, 5, 8, 9] }, parts: [fill("Terbesar □", 98530), fill("Terkecil □", 30589)], explanation: "Terbesar: angka diurutkan dari yang besar, 98.530. Terkecil: 0 tidak boleh di depan, jadi 3 di depan lalu 0, 5, 8, 9: 30.589." }),
  C({ level: "Sangat menantang", prompt: "Komang membayar Rp45.600 dengan 3 lembar sepuluh ribuan dan 6 keping seratusan. Sisanya dibayar dengan seribuan. Berapa lembar seribuan?", scene: money([10000, 5], [1000, 15], [100, 16]), parts: [fill("Seribuan □ lembar", 15)], explanation: "45.600 − 30.000 − 600 = 15.000 = 15 lembar seribuan. Komang punya tepat 15 lembar." }),
  D({ level: "Sangat menantang", prompt: "Paket A Rp28.500 untuk 1 orang. Paket B Rp55.000 untuk 2 orang. Zafran dan Ula masing-masing punya Rp35.000.", scene: { type: "paket", pakets: [{ name: "Paket A", lines: ["1 ayam goreng", "1 nasi", "1 teh manis"], price: 28500 }, { name: "Paket B", lines: ["2 ayam goreng", "2 nasi", "2 teh manis"], price: 55000 }] }, parts: [fill("Dua paket A □", 57000), fill("Paket B lebih hemat □", 2000), fill("Beli paket B patungan, sisa masing-masing □", 7500)], explanation: "2 × 28.500 = 57.000. 57.000 − 55.000 = 2.000. Patungan 55.000 : 2 = 27.500, sisa 35.000 − 27.500 = 7.500." }),
];
