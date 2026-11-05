export type Datum = { label: string; count: number; icon?: string; color?: string };

export const balls: Datum[] = [
  { label: "Merah", count: 7, color: "#dc2626" },
  { label: "Kuning", count: 4, color: "#eab308" },
  { label: "Hijau", count: 6, color: "#15803d" },
];

const marbles: Datum[] = [
  { label: "Merah", count: 3, color: "#dc2626" },
  { label: "Biru", count: 5, color: "#2563eb" },
  { label: "Kuning", count: 4, color: "#eab308" },
  { label: "Hijau", count: 4, color: "#15803d" },
];
const cakes: Datum[] = [
  { label: "Kue talam", count: 5 }, { label: "Kue cucur", count: 3 },
  { label: "Kue lapis", count: 5 }, { label: "Kue bugis", count: 6 },
];
const vegetables: Datum[] = [
  { label: "Brokoli", icon: "brokoli", count: 4 },
  { label: "Wortel", icon: "wortel", count: 7 },
  { label: "Jagung", icon: "jagung", count: 5 },
];
const fruit: Datum[] = [
  { label: "Jeruk", icon: "jeruk", count: 6 },
  { label: "Apel", icon: "apel", count: 3 },
  { label: "Mangga", icon: "mangga", count: 4 },
  { label: "Belimbing", icon: "belimbing", count: 5 },
];
const favorites = [
  { ...fruit[0] }, { ...fruit[1], count: 4 }, { ...fruit[3], count: 7 },
  { label: "Jambu air", icon: "jambu", count: 5 },
];
const pencils: Datum[] = [
  { label: "Kuning", icon: "pensil", color: "#ca8a04", count: 4 },
  { label: "Biru", icon: "pensil", color: "#2563eb", count: 3 },
  { label: "Merah", icon: "pensil", color: "#dc2626", count: 5 },
  { label: "Hitam", icon: "pensil", color: "#1e293b", count: 6 },
];
const clothes: Datum[] = [
  { label: "Kaus pendek", count: 5 }, { label: "Kaus panjang", count: 4 },
  { label: "Celana", count: 3 },
];
const animals: Datum[] = [
  { label: "Ayam", count: 4 }, { label: "Bebek", count: 2 },
  { label: "Kelinci", count: 5 },
];

type Visual = "objects" | "table" | "diagram" | "build";
type Source = { title: string; rows: Datum[]; visual: Visual; unit: string; clue?: string };
export type DiagramQuestion = Source & {
  prompt: string;
  answer: string;
  explanation: string;
  options?: string[];
  target?: string;
  difficulty: "sedang" | "menantang" | "sangat menantang";
};
const sources = {
  marbles: { title: "Kelereng", rows: marbles, visual: "objects", unit: "kelereng" },
  cakes: { title: "Kue Kesukaan", rows: cakes, visual: "table", unit: "anak" },
  vegetables: { title: "Sayur Kesukaan", rows: vegetables, visual: "diagram", unit: "anak" },
  fruit: { title: "Buah dari Pasar", rows: fruit, visual: "build", unit: "buah" },
  favorites: { title: "Buah Kesukaan", rows: favorites, visual: "diagram", unit: "anak" },
  pencils: { title: "Pensil Warna", rows: pencils, visual: "objects", unit: "pensil" },
  clothes: { title: "Pakaian Kira", rows: clothes, visual: "build", unit: "pakaian" },
  fruitList: { title: "Daftar Buah-buahan", rows: [{ ...fruit[0], count: 5 }, { ...fruit[1], count: 4 }, { ...fruit[2], count: 6 }], visual: "objects", unit: "buah" },
  toys: { title: "Mainan Kesukaan", rows: [{ label: "Boneka", count: 3 }, { label: "Gasing", count: 5 }, { label: "Kelereng", count: 4 }, { label: "Bola", count: 6 }], visual: "table", unit: "anak" },
  animals: { title: "Hewan Pak Budi", rows: animals, visual: "build", unit: "hewan",
    clue: "Ada 4 ayam. Bebek 2 lebih sedikit dari ayam. Kelinci 1 lebih banyak dari ayam." },
} satisfies Record<string, Source>;

function question(source: keyof typeof sources, prompt: string, answer: string | number,
  explanation: string, difficulty: DiagramQuestion["difficulty"], options?: string[]): DiagramQuestion {
  const data = sources[source];
  return { ...data, visual: data.visual === "build" ? "table" : data.visual,
    prompt, answer: String(answer), explanation, difficulty, options };
}

function build(source: "fruit" | "animals" | "clothes", target: string, answer: number, explanation: string): DiagramQuestion {
  return { ...sources[source], prompt: `Isi baris ${target.toLowerCase()} pada diagram.`,
    target, answer: String(answer), explanation, difficulty: "sedang" };
}

export const diagramPractice = {
  daftar: [
    question("fruitList", "Berapa buah apel dalam daftar?", 4, "Hitung 4 gambar apel.", "sedang"),
    question("fruitList", "Buah apa yang paling banyak?", "Mangga", "Ada 6 mangga, lebih banyak dari jeruk dan apel.", "sedang", ["Jeruk", "Mangga", "Apel"]),
  ],
  tabel: [
    question("pencils", "Hitung pensil merah. Berapa jumlah yang ditulis pada baris Merah di tabel?", 5, "Ada 5 pensil merah.", "sedang"),
    question("toys", "Berapa anak yang memilih bola dan gasing jika digabung?", 11, "Pada tabel, bola 6 dan gasing 5. Jumlahnya 11 anak.", "menantang"),
  ],
  diagram: [
    question("favorites", "Berapa anak yang suka jambu air?", 5, "Ada 5 bintang pada baris jambu air.", "sedang"),
    question("favorites", "Buah apa yang dipilih 4 anak?", "Apel", "Baris apel memiliki 4 bintang.", "sedang", ["Jeruk", "Belimbing", "Apel"]),
    build("clothes", "Kaus pendek", 5, "Ada lima kaus pendek. Isi lima tanda."),
    build("animals", "Bebek", 2, "Bebek 2 lebih sedikit dari 4 ayam. Jadi, ada 2 bebek."),
  ],
};

export const diagramAssessment = [
  question("marbles", "Berapa jumlah kelereng merah dan kuning?", 7, "Ada 3 merah dan 4 kuning. Jumlahnya 7.", "sedang"),
  question("cakes", "Berapa anak yang memilih kue talam dan kue cucur jika digabung?", 8, "5 ditambah 3 sama dengan 8.", "sedang"),
  question("vegetables", "Berapa anak yang suka wortel?", 7, "Hitung 7 bintang pada baris wortel.", "sedang"),
  build("fruit", "Jeruk", 6, "Enam jeruk diwakili oleh enam tanda."),
  question("marbles", "Dua warna mana yang jumlahnya sama?", "Kuning dan hijau", "Kuning dan hijau masing-masing 4.", "menantang", ["Biru dan kuning", "Merah dan hijau", "Kuning dan hijau"]),
  question("cakes", "Kue apa yang paling banyak dipilih?", "Kue bugis", "Kue bugis dipilih 6 anak. Itu jumlah terbesar.", "sedang", ["Kue lapis", "Kue bugis", "Kue talam", "Kue cucur"]),
  question("vegetables", "Sayur apa yang dipilih 5 anak?", "Jagung", "Baris jagung berisi 5 bintang.", "sedang", ["Jagung", "Wortel", "Brokoli"]),
  build("fruit", "Apel", 3, "Tiga apel diwakili oleh tiga tanda."),
  question("marbles", "Berapa kelereng hijau yang perlu ditambah agar sama banyak dengan biru?", 1, "Biru 5 dan hijau 4. Jadi perlu 1 lagi.", "menantang"),
  question("cakes", "Berapa anak yang ikut memilih kue?", 19, "5 + 3 + 5 + 6 = 19.", "sangat menantang"),
  question("vegetables", "Berapa lebihnya pemilih wortel daripada jagung?", 2, "7 dikurangi 5 sama dengan 2.", "menantang"),
  build("fruit", "Mangga", 4, "Empat mangga diwakili oleh empat tanda."),
  question("marbles", "Jika dua kelereng biru diambil, warna apa yang jumlahnya sama dengan biru?", "Merah", "5 dikurangi 2 sama dengan 3, sama dengan merah.", "sangat menantang", ["Hijau", "Kuning", "Merah"]),
  question("cakes", "Jika satu anak pindah pilihan dari kue bugis ke kue cucur, berapa pemilih kue cucur?", 4, "Kue cucur mendapat satu pilihan tambahan: 3 + 1 = 4.", "menantang"),
  question("vegetables", "Berapa jumlah anak yang memilih brokoli atau jagung?", 9, "4 ditambah 5 sama dengan 9.", "menantang"),
  { ...build("fruit", "Belimbing", 5, "Lima belimbing diwakili oleh lima tanda."), difficulty: "menantang" },
  question("marbles", "Berapa jumlah semua kelereng selain biru?", 11, "Hitung merah, kuning, dan hijau: 3 + 4 + 4 = 11.", "sangat menantang"),
  question("cakes", "Jika dua anak lagi memilih kue cucur, dengan kue apa jumlahnya akan sama?", "Kue talam dan kue lapis", "3 + 2 = 5. Kue talam dan lapis masing-masing dipilih 5 anak.", "sangat menantang", ["Kue bugis dan kue lapis", "Kue talam dan kue lapis", "Kue cucur dan kue bugis"]),
  question("vegetables", "Jika satu pemilih wortel beralih ke jagung, sayur apa yang sama banyak?", "Wortel dan jagung", "Wortel turun menjadi 6 dan jagung naik menjadi 6.", "sangat menantang", ["Brokoli dan jagung", "Wortel dan brokoli", "Wortel dan jagung"]),
  question("fruit", "Berapa jumlah semua buah yang dibeli Ibu?", 18, "6 + 3 + 4 + 5 = 18.", "sangat menantang"),
  question("marbles", "Jika setiap warna diambil satu, berapa kelereng yang tersisa?", 12, "Ada 16 kelereng. Satu dari tiap warna berarti 4 diambil, sehingga tersisa 12.", "sangat menantang"),
  question("cakes", "Berapa tambahan pemilih kue cucur agar jumlahnya sama dengan kue bugis?", 3, "Kue cucur memiliki 3 pemilih dan kue bugis 6. Selisihnya 3.", "menantang"),
  question("vegetables", "Berapa jumlah semua anak yang memilih sayur?", 16, "4 + 7 + 5 = 16.", "sangat menantang"),
  question("fruit", "Jika tiga jeruk dimakan, buah apa yang paling banyak tersisa?", "Belimbing", "Jeruk tinggal 3. Belimbing masih 5, lebih banyak dari mangga dan apel.", "menantang", ["Belimbing", "Mangga", "Jeruk", "Apel"]),
] satisfies DiagramQuestion[];
