import type { Question } from "./grade-four-whole-numbers";

export type MeasurementQuestion = Question & {
  source: number;
  rows?: number[];
  action?: "tiles" | "decimal";
  unit?: string;
};
export const totalCells = (rows: number[]) => rows.reduce((sum, width) => sum + width, 0);

const choice = (source: number, prompt: string, options: string[], answer: string, explanation: string, multiple = false): MeasurementQuestion =>
  ({ source, prompt, options, answer, explanation, mode: multiple ? "multiple" : "choice" });

function area(rows: number[], unit = "petak satuan", action?: "tiles"): MeasurementQuestion {
  const total = totalCells(rows);
  return {
    source: 3, rows, unit, action, answer: String(total),
    prompt: action ? "Ketuk semua petak berwarna yang termasuk daerah tersebut." : "Berapa luas daerah berwarna pada kisi?",
    explanation: `Jumlah petak per baris: ${rows.join(" + ")} = ${total} ${unit}.`,
  };
}

function method(rows: number[], options: string[], answer: string, explanation: string): MeasurementQuestion {
  return { ...choice(3, "Pilih cara menghitung luas daerah berwarna.", options, answer, explanation), rows, unit: "petak satuan" };
}

const decimal = (source: number, prompt: string, ml: number, explanation: string): MeasurementQuestion =>
  ({ source, prompt, action: "decimal", unit: "L", answer: String(ml / 1000).replace(".", ","), explanation });

export const practice: MeasurementQuestion[][] = [
  [
    area([4, 4, 4], "petak satuan", "tiles"),
    area([6, 4, 4, 2]),
    choice(2, "Satuan apa yang lebih praktis untuk mengukur luas lantai aula?", ["cm²", "m²", "mL"], "m²", "Meter persegi cocok untuk permukaan yang luas."),
    method([7, 7, 3, 3], ["(7 × 2) + (3 × 2)", "7 × 4", "7 + 3"], "(7 × 2) + (3 × 2)", "Dua baris berisi 7 petak dan dua baris berisi 3 petak."),
    { source: 2, prompt: "Ubah luas 3 m² menjadi sentimeter persegi.", answer: "30000", unit: "cm²", explanation: "Satu meter persegi = 100 cm × 100 cm = 10.000 cm². Tiga meter persegi = 30.000 cm²." },
  ],
  [
    choice(4, "Satu botol besar terisi penuh oleh 5 cangkir yang sama. Jika digunakan 3 cangkir, berapa cangkir lagi agar penuh?", ["2 cangkir", "3 cangkir", "5 cangkir"], "2 cangkir", "Gunakan cangkir yang sama agar ukuran konsisten. 5 − 3 = 2."),
    decimal(4, "Ubah 1.750 mL menjadi liter.", 1750, "1.750 ÷ 1.000 = 1,75 L."),
    choice(6, "Alat ukur mana yang paling praktis untuk menakar 250 mL air?", ["Meteran", "Gelas ukur bertanda mL", "Timbangan"], "Gelas ukur bertanda mL", "Gelas ukur mengukur volume cairan. Baca skala mL pada permukaan air."),
    decimal(5, "Ada 3 L jus. Sebanyak 650 mL diminum. Berapa liter yang tersisa?", 2350, "3.000 − 650 = 2.350 mL = 2,35 L."),
    decimal(7, "Campur 1 L 250 mL air dengan 875 mL air. Berapa liter jumlahnya?", 2125, "1.250 + 875 = 2.125 mL = 2,125 L."),
  ],
];

export const assessment: MeasurementQuestion[] = [
  choice(1, "Pilih semua benda yang panjangnya kira-kira 5 cm.", ["Penghapus kecil", "Pintu rumah", "Klip kertas besar", "Meja makan"], "Penghapus kecil|Klip kertas besar", "Penghapus kecil dan klip besar dapat berukuran sekitar 5 cm.", true),
  area([5, 5, 5, 5], "cm²"),
  decimal(4, "Ubah 2.350 mL menjadi liter.", 2350, "2.350 ÷ 1.000 = 2,35 L."),
  choice(2, "Mana yang luas permukaannya paling dekat dengan 1 m²?", ["Permukaan perangko", "Ubin 10 cm × 10 cm", "Meja persegi 1 m × 1 m"], "Meja persegi 1 m × 1 m", "Sisi 1 m dan 1 m membentuk luas 1 m²."),
  area([7, 7, 4, 4, 2], "petak satuan", "tiles"),
  decimal(5, "Persediaan susu 8 L 250 mL. Digunakan 3 L 875 mL. Berapa liter susu yang tersisa?", 4375, "8.250 − 3.875 = 4.375 mL = 4,375 L."),
  choice(1, "Pilih semua benda yang panjang atau tingginya bisa mendekati 1 m.", ["Satu biji beras", "Gagang sapu", "Sehelai rambut alis", "Gitar akustik ukuran penuh"], "Gagang sapu|Gitar akustik ukuran penuh", "Gagang sapu dan gitar ukuran penuh dapat berukuran sekitar 1 m.", true),
  method([8, 8, 5, 5], ["(8 × 2) + (5 × 2)", "8 × 4", "8 + 5 + 4"], "(8 × 2) + (5 × 2)", "Hitung dua baris dengan 8 petak dan dua baris dengan 5 petak."),
  decimal(4, "Ubah 2 L 1.350 mL menjadi liter.", 3350, "1.350 mL = 1,35 L. Tambahkan 2 L sehingga menjadi 3,35 L."),
  choice(2, "Permukaan label kecil berukuran 2 cm × 3 cm. Satuan mana yang paling praktis untuk menyatakan luasnya?", ["m²", "cm²", "cm"], "cm²", "Perkalian dua ukuran dalam cm menghasilkan cm²."),
  area([6, 6, 6, 6, 6], "m²"),
  decimal(7, "Tiga hari berturut-turut Dita membeli 1 L 650 mL, 2 L 750 mL, dan 3 L 850 mL susu. Berapa liter jumlahnya?", 8250, "1.650 + 2.750 + 3.850 = 8.250 mL = 8,25 L."),
  choice(1, "Pilih semua benda yang kira-kira 5 cm jika diukur pada sisi terpanjangnya.", ["Kelereng kecil", "Baterai AA", "Pensil yang sudah pendek", "Tongkat pramuka"], "Baterai AA|Pensil yang sudah pendek", "Panjang baterai AA sekitar 5 cm. Pensil yang sudah pendek juga bisa mendekati 5 cm.", true),
  area([9, 9, 6, 4, 4, 1]),
  choice(6, "Wadah berisi 6.480 mL air. Bagaimana mengubahnya menjadi liter?", ["Kalikan 6.480 dengan 1.000", "Bagi 6.480 dengan 100", "Bagi 6.480 dengan 1.000"], "Bagi 6.480 dengan 1.000", "Setiap 1.000 mL adalah 1 L, sehingga hasilnya 6,48 L."),
  choice(2, "Lantai kamar berukuran 3 m × 4 m. Pilih satuan yang paling praktis untuk menyatakan luasnya.", ["m", "m²", "cm²"], "m²", "Panjang dan lebar dalam meter menghasilkan luas dalam meter persegi."),
  area([3, 3, 3, 3, 3, 3], "cm²"),
  decimal(5, "Teko berisi 5 L 100 mL teh. Sebanyak 1.760 mL dituang. Berapa liter teh yang masih ada?", 3340, "5.100 − 1.760 = 3.340 mL = 3,34 L."),
  choice(1, "Pilih semua benda yang bisa berukuran sekitar 1 m.", ["Panjang penggaris meter", "Tinggi botol minum kecil", "Lebar meja belajar", "Panjang sendok teh"], "Panjang penggaris meter|Lebar meja belajar", "Penggaris meter panjangnya 1 m. Meja belajar bisa memiliki lebar sekitar 1 m.", true),
  method([9, 9, 9, 5, 5, 2], ["9 × 6", "(9 × 3) + (5 × 2) + 2", "(9 × 2) + (5 × 3) + 2"], "(9 × 3) + (5 × 2) + 2", "Kelompokkan tiga baris berisi 9, dua baris berisi 5, dan satu baris berisi 2 petak."),
  decimal(6, "Ember berisi 9.045 mL. Berapa liter isinya?", 9045, "9.045 ÷ 1.000 = 9,045 L. Nol pada tempat persepuluhan tetap ditulis."),
  choice(2, "Benda mana yang luas permukaannya paling tepat dinyatakan dalam cm²?", ["Sampul buku tulis", "Lantai gedung olahraga", "Lapangan sepak bola"], "Sampul buku tulis", "Ukuran sampul dapat diukur dengan penggaris dalam cm, lalu luasnya dinyatakan dalam cm²."),
  area([8, 8, 6, 6, 3, 3, 1], "petak satuan", "tiles"),
  decimal(7, "Tiga kali pengiriman membawa 2 L 875 mL, 950 mL, dan 4 L 650 mL sirup. Berapa liter totalnya?", 8475, "2.875 + 950 + 4.650 = 8.475 mL = 8,475 L."),
];

export function ready(q: MeasurementQuestion, answer: string) {
  if (q.action === "tiles") return answer.length > 0;
  if (q.action === "decimal") return /^\d+(?:[,.]\d+)?$/.test(answer);
  return answer.trim().length > 0;
}

export function correct(q: MeasurementQuestion, answer = "") {
  if (!ready(q, answer)) return false;
  if (q.action === "tiles") {
    const selected = answer.split("|").map(Number);
    const cells = q.rows!.flatMap((width, row) => Array.from({ length: width }, (_, col) => row * (Math.max(...q.rows!) + 1) + col));
    return selected.length === cells.length && cells.every(cell => selected.includes(cell));
  }
  if (q.action === "decimal") return Number(answer.replace(",", ".")) === Number(q.answer.replace(",", "."));
  if (q.mode === "multiple") return answer.split("|").sort().join("|") === q.answer.split("|").sort().join("|");
  return answer === q.answer;
}
