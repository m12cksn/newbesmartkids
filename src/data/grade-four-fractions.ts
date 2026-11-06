import type { Question } from "./grade-four-whole-numbers";

export type Fraction = readonly [number, number];
export type FractionShape = "circle" | "bar" | "grid" | "line";
export type FractionQuestion = Question & {
  models?: readonly Fraction[];
  shape?: FractionShape;
  shade?: number;
  notation?: "decimal" | "fraction" | "percent";
};
export const fractionLabel = ([n, d]: Fraction) => `${n}/${d}`;
export const decimalLabel = (n: number, d: number) => (n / d).toFixed(d === 10 ? 1 : 2).replace(".", ",");
export const topics = [
  { title: "Pecahan dengan pembilang 1", steps: ["Bagi dua benda yang sama besar menjadi bagian yang sama besar.", "Arsir satu bagian pada setiap benda.", "Semakin besar penyebutnya, semakin kecil satu bagiannya."], demo: "Bandingkan 1/2 dan 1/4. Ganti lingkaran menjadi batang, lalu periksa apakah urutannya berubah." },
  { title: "Pecahan dengan penyebut sama", steps: ["Gunakan benda utuh yang sama besar.", "Penyebut yang sama berarti ukuran setiap bagian sama.", "Bandingkan jumlah bagian yang diarsir, yaitu pembilangnya."], demo: "Pada penyebut 6, bandingkan 2/6 dan 4/6. Lihat juga posisi keduanya pada garis bilangan." },
  { title: "Pecahan senilai", steps: ["Perhatikan bagian yang diarsir pada batang pertama.", "Bagi setiap bagian menjadi beberapa potongan yang sama.", "Pembilang dan penyebut dikalikan dengan bilangan yang sama. Panjang arsirannya tetap."], demo: "Mulai dari 2/3. Bagi setiap bagian menjadi dua, lalu bandingkan 2/3 dengan 4/6." },
  { title: "Desimal persepuluhan dan perseratusan", steps: ["Satu kolom dari sepuluh adalah 1/10 atau 0,1.", "Satu sel dari seratus adalah 1/100 atau 0,01.", "Sepuluh sel kecil membentuk satu persepuluhan. Jadi 0,4 dan 0,40 sama nilainya."], demo: "Arsir 4 persepuluhan. Ganti menjadi kisi perseratusan dan lihat bahwa 40 sel terisi." },
  { title: "Perseratusan dan persen", steps: ["Persen berarti per seratus.", "Baca jumlah bagian dari 100 untuk menentukan persen.", "Jika melebihi satu utuh, setiap kisi penuh menambah 100%."], demo: "Bandingkan 35/100, 0,35, dan 35%. Geser ke 125% untuk melihat satu kisi penuh dan 25 sel pada kisi kedua." },
];

const compare = (a: Fraction, b: Fraction, shape: FractionShape): FractionQuestion => {
  const difference = a[0] * b[1] - b[0] * a[1];
  const answer = difference < 0 ? "<" : difference > 0 ? ">" : "=";
  return { prompt: `Lengkapi ${fractionLabel(a)} … ${fractionLabel(b)}.`, answer, options: ["<", "=", ">"], mode: "choice",
    explanation: `${fractionLabel(a)} ${answer} ${fractionLabel(b)}. ${a[1] === b[1] ? "Ukuran bagian sama, jadi bandingkan pembilang." : "Pada pecahan berpembilang 1, lebih banyak bagian berarti satu bagiannya lebih kecil."}`,
    models: [a,b], shape };
};
const order = (values: Fraction[], shape: FractionShape): FractionQuestion => {
  const answer = [...values].sort((a,b) => a[0] * b[1] - b[0] * a[1]).map(fractionLabel);
  return { prompt: "Urutkan pecahan dari yang terkecil.", answer: answer.join("|"), mode: "order", options: values.map(fractionLabel),
    explanation: `Urutannya ${answer.join(" < ")}.`, models: values, shape };
};
const decimal = (n: number, d: 10 | 100, showModel = false): FractionQuestion =>
  ({ prompt: `Ubah ${n}/${d} menjadi desimal.`, answer: decimalLabel(n,d), notation: "decimal",
    explanation: `${n}/${d} = ${decimalLabel(n,d)}. Penyebut ${d} memberi ${d === 10 ? "satu" : "dua"} tempat desimal.`,
    models: showModel ? [[n,d]] : undefined, shape: d === 10 ? "bar" : "grid" });
const percent = (n: number): FractionQuestion => ({ prompt: `Ubah ${decimalLabel(n,100)} menjadi persen.`, answer: `${n}%`, notation: "percent",
  explanation: `${decimalLabel(n,100)} = ${n}/100 = ${n}%.` });
const fromPercent = (n: number): FractionQuestion => ({ prompt: `Tulis ${n}% sebagai desimal.`, answer: decimalLabel(n,100), notation: "decimal",
  explanation: `${n}% = ${n}/100 = ${decimalLabel(n,100)}.` });
const shade = (n: number, d: number, shape: FractionShape): FractionQuestion =>
  ({ prompt: `Arsir ${n}/${d} pada gambar.`, answer: String(n), shade: d, shape, explanation: `Arsir ${n} dari ${d} bagian sama besar.` });
const story = (prompt: string, answer: string, explanation: string, models?: Fraction[], shape?: FractionShape): FractionQuestion =>
  ({ prompt, answer, explanation, notation: answer.endsWith("%") ? "percent" : "fraction", models, shape });
const choose = (prompt: string, answer: string, options: string[], explanation: string, models?: Fraction[], shape?: FractionShape): FractionQuestion =>
  ({ prompt, answer, options, explanation, mode: "choice", models, shape });

export const practice: FractionQuestion[][] = [
  [compare([1,3],[1,6],"circle"), shade(1,5,"bar"), order([[1,4],[1,2],[1,8]],"bar"),
    choose("Lina punya 1/5 meter pita dan Raka punya 1/3 meter. Pita siapa lebih panjang?", "Raka", ["Lina","Raka","Sama panjang"], "1/3 lebih besar dari 1/5.", [[1,5],[1,3]],"bar")],
  [compare([3,8],[5,8],"bar"), shade(5,8,"circle"), order([[4,7],[1,7],[6,7]],"line"), compare([4,9],[4,9],"grid")],
  [choose("Manakah yang senilai dengan 2/3?", "8/12", ["6/12","8/12","8/9"], "Kalikan pembilang dan penyebut dengan 4.", [[2,3]],"bar"),
    shade(4,8,"circle"),
    { prompt:"Lengkapi 3/5 = …/15.", answer:"9", explanation:"Kalikan pembilang dan penyebut dengan 3.", models:[[3,5]], shape:"bar" },
    story("Sederhanakan 8/12 sampai bentuk paling sederhana.", "2/3", "Bagilah 8 dan 12 dengan 4.", [[8,12]],"bar")],
  [decimal(7,10,true), decimal(36,100,true), shade(28,100,"grid"),
    story("Tulis 0,09 sebagai pecahan berpenyebut 100.", "9/100", "Angka 9 berada pada tempat perseratusan.")],
  [percent(42), fromPercent(135), shade(64,100,"grid"),
    story("Dari 10 lampu, 7 menyala. Berapa persen lampu yang menyala?", "70%", "7/10 = 70/100 = 70%.", [[7,10]],"bar")],
];

export const assessment: FractionQuestion[] = [
  compare([1,4],[1,9],"circle"),
  decimal(8,10),
  order([[5,9],[2,9],[7,9]],"line"),
  percent(18),
  story("Nina mendapat 1/5 bagian dari satu semangka utuh. Sisanya untuk Danu. Berapa bagian semangka yang diterima Danu? Tulis sebagai pecahan.", "4/5", "Satu semangka terdiri dari 5/5. Setelah 1/5 diambil, tersisa 4/5.", [[1,5]],"circle"),
  decimal(73,100),
  fromPercent(46),
  compare([7,12],[5,12],"bar"),
  order([[1,12],[1,6],[1,9]],"bar"),
  decimal(17,10),
  choose("Satu roti dibagi menjadi delapan bagian sama besar. Dini mendapat 5/8 dan Ari mendapat sisanya. Siapa yang mendapat lebih banyak?", "Dini", ["Ari","Dini","Sama banyak"], "Ari mendapat 3/8, sedangkan Dini mendapat 5/8.", [[5,8]],"bar"),
  percent(137),
  compare([6,17],[6,17],"grid"),
  decimal(107,100),
  fromPercent(284),
  choose("Fira mendapat 4/11 bagian roti. Bima mendapat 3/11 dari roti berukuran sama. Siapa yang mendapat bagian lebih sedikit?", "Bima", ["Fira","Sama banyak","Bima"], "Penyebut sama, dan 3 lebih kecil dari 4.", [[4,11],[3,11]],"bar"),
  order([[12,16],[9,16],[14,16]],"line"),
  story("Dari 100 siswa, 46 terpilih untuk lomba sains. Berapa persen yang terpilih?", "46%", "46 dari 100 berarti 46%."),
  decimal(29,10),
  compare([1,15],[1,11],"bar"),
  percent(1208),
  fromPercent(509),
  decimal(304,100),
  story("Dari 10 soal kuis, Nadia menjawab 8 dengan benar. Berapa persen jawaban yang benar?", "80%", "8/10 = 80/100 = 80%."),
];
