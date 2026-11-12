import { chapterMetas } from "@/chapters/registry/metas.generated";
export type MaterialItem = {
  id: string;
  classId: number;
  chapter: number;
  slug: string;
  title: string;
  topic: string;
  description: string;
  videoUrl?: string;
  videoStatus: "available" | "coming_soon";
  summary: string;
  questionIds: string[];
  /** Tanggal bab ditambahkan (YYYY-MM-DD), untuk urutan "Materi terbaru". Wajib untuk bab di src/chapters. */
  addedAt?: string;
};

export const materials: MaterialItem[] = [
  { id: "kelas-2-pengukuran", classId: 2, chapter: 6, slug: "pengukuran-berat-dan-waktu", title: "Pengukuran", topic: "Pengukuran", description: "Bandingkan berat benda dengan timbangan, ukur berat dengan satuan tidak baku, lalu baca jam dan kenali waktu kegiatan sehari-hari.", videoStatus: "coming_soon", summary: "Dua peraga interaktif, 8 latihan dan 24 soal evaluasi dengan timbangan, isian kata, atur jarum jam, dan urutkan kegiatan seperti di buku.", questionIds: [] },
  { id: "kelas-5-bilangan-cacah-100000", classId: 5, chapter: 1, slug: "bilangan-cacah-sampai-100000", title: "Bilangan Cacah sampai 100.000", topic: "Bilangan", description: "Baca, bandingkan, susun dan hitung bilangan sampai 100.000 dengan nilai tempat, komposisi uang dan operasi bertahap.", videoStatus: "coming_soon", summary: "Empat materi interaktif, 20 latihan dan 24 evaluasi dengan bentuk jawaban seperti di buku.", questionIds: [] },
  { id: "kelas-2-pecahan", classId: 2, chapter: 5, slug: "pecahan-setengah-seperempat", title: "Pecahan", topic: "Pecahan", description: "Bagi benda utuh menjadi dua atau empat bagian sama besar, bagi kumpulan benda sama banyak, lalu kenali setengah dan seperempat.", videoStatus: "coming_soon", summary: "Tiga peraga interaktif, 12 latihan dan 24 soal evaluasi dengan warnai bagian, tarik garis lipat, beri tanda, dan bagikan benda seperti di buku.", questionIds: [] },
  { id: "kelas-2-posisi-pola", classId: 2, chapter: 4, slug: "posisi-benda-dan-pola", title: "Posisi Benda dan Pola di Sekitar Kita", topic: "Pola", description: "Tunjukkan posisi benda dengan atas, bawah, depan, belakang, kanan, dan kiri, lalu temukan dan lanjutkan pola bentuk, warna, gerakan, dan suara.", videoStatus: "coming_soon", summary: "Dua peraga interaktif, 8 latihan dan 24 soal evaluasi dengan ketuk benda, isian kata, warnai, dan lanjutkan pola seperti di buku.", questionIds: [] },
  { id: "kelas-2-bentuk-sekitar", classId: 2, chapter: 3, slug: "bentuk-di-sekitar-kita", title: "Bentuk di Sekitar Kita", topic: "Geometri", description: "Hitung sisi segi banyak, bedakan bentuk lengkung, urai dan susun bangun datar, lalu kenali kubus, balok, tabung, kerucut, dan bola.", videoStatus: "coming_soon", summary: "Tiga peraga interaktif, 12 latihan dan 24 soal evaluasi dengan tarik garis, kelompokkan, dan potong bangun seperti di buku.", questionIds: [] },
  { id: "kelas-2-membilang-50", classId: 2, chapter: 1, slug: "ayo-membilang-sampai-50", title: "Ayo Membilang sampai 50", topic: "Bilangan", description: "Hitung benda dengan ikatan sepuluh, baca dan tulis bilangan, kenali puluhan dan satuan, lalu bandingkan dan urutkan bilangan sampai 50.", videoStatus: "coming_soon", summary: "Tiga peraga interaktif, 12 latihan dan 24 soal evaluasi membilang, nilai tempat, dan membandingkan bilangan sampai 50.", questionIds: [] },
  { id: "kelas-3-penyajian-data", classId: 3, chapter: 5, slug: "penyajian-data-dalam-tabel", title: "Penyajian Data dalam Tabel", topic: "Data", description: "Urutkan dan bandingkan data, catat turus, lalu lengkapi tabel frekuensi melalui huruf, gambar benda, dan percobaan manik-manik.", videoStatus: "coming_soon", summary: "Dua studio interaktif, 10 latihan dan 24 soal evaluasi dengan isian, urutan, turus dan tabel seperti di buku.", questionIds: [] },
  { id: "kelas-3-unsur-bangun-datar", classId: 3, chapter: 4, slug: "unsur-unsur-bangun-datar", title: "Unsur-Unsur Bangun Datar", topic: "Geometri", description: "Kenali garis, ruas garis, dan sisi, ukur serta gambar sudut dengan busur derajat, lalu temukan garis tegak lurus dan sejajar.", videoStatus: "coming_soon", summary: "Sisi pada bangun datar, sudut dan jenis-jenisnya, serta garis tegak lurus dan garis sejajar melalui peraga interaktif.", questionIds: [] },
  { id: "kelas-3-pengukuran-panjang-berat", classId: 3, chapter: 3, slug: "pengukuran-panjang-dan-berat", title: "Pengukuran Panjang dan Berat", topic: "Pengukuran", description: "Ukur panjang dengan penggaris dan meteran, timbang berat dengan berbagai timbangan, lalu ubah cm ke m dan gram ke kg.", videoStatus: "coming_soon", summary: "Satuan baku panjang (cm, m) dan berat (gram, ons, kg) melalui penggaris, meteran, timbangan digital, timbangan duduk, dan timbangan kodok.", questionIds: [] },
  { id: "kelas-3-bilangan-cacah-1000", classId: 3, chapter: 1, slug: "bilangan-cacah-sampai-1000", title: "Bilangan Cacah sampai 1.000", topic: "Bilangan", description: "Nilai tempat, banding dan urut, komposisi, serta empat operasi hitung melalui peraga dan bentuk soal seperti di buku.", videoStatus: "coming_soon", summary: "Tujuh materi interaktif, 28 latihan dan 24 soal evaluasi bilangan cacah sampai 1.000.", questionIds: [] },
  { id: "kelas-3-kalimat-matematika", classId: 3, chapter: 2, slug: "kalimat-matematika", title: "Kalimat Matematika", topic: "Bilangan", description: "Temukan bilangan yang belum diketahui pada kalimat matematika penjumlahan dan pengurangan bilangan cacah.", videoStatus: "coming_soon", summary: "Isi titik-titik dengan kelereng, permen, dan diagram batang, lalu buat banyak kemungkinan kalimat matematika.", questionIds: [] },
  { id: "kelas-6-peluang", classId: 6, chapter: 4, slug: "peluang", title: "Peluang", topic: "Peluang", description: "Jelajahi skala peluang, permainan yang adil, dan perbandingan peluang dalam kehidupan sehari-hari.", videoStatus: "coming_soon", summary: "Prediksi, coba percobaan acak, susun dadu, dan warnai roda untuk memahami peluang.", questionIds: [] },
  { id: "kelas-6-kubus-balok", classId: 6, chapter: 3, slug: "kubus-dan-balok", title: "Kubus dan Balok", topic: "Geometri dan Lokasi", description: "Bangun dan urai susunan kubus, gambar tampak dari berbagai arah, serta telusuri koordinat dan jalur.", videoStatus: "coming_soon", summary: "Mengonstruksi dan mengurai, visualisasi spasial, serta lokasi melalui peraga dan latihan interaktif.", questionIds: [] },
  { id: "kelas-6-rasio", classId: 6, chapter: 2, slug: "rasio", title: "Rasio", topic: "Perbandingan", description: "Jelajahi konsep rasio, rasio senilai, rasio satuan, bagian terhadap keseluruhan, dan durasi waktu.", videoStatus: "coming_soon", summary: "Bandingkan besaran melalui enam studio interaktif, latihan bervariasi, dan evaluasi rasio.", questionIds: [] },
  {
    id: "kelas-6-pecahan-desimal", classId: 6, chapter: 1, slug: "pecahan-dan-desimal",
    title: "Pecahan dan Desimal", topic: "Bilangan",
    description: "Kalikan dan bagi pecahan dengan bilangan asli, ubah pecahan menjadi desimal, lalu bandingkan dan urutkan desimal.",
    videoStatus: "coming_soon", summary: "Perkalian dan pembagian pecahan dengan bilangan asli, pecahan desimal, serta membandingkan dan mengurutkan bilangan desimal.", questionIds: [],
  },
  {
    id: "kelas-4-piktogram-diagram-batang", classId: 4, chapter: 6, slug: "piktogram-dan-diagram-batang",
    title: "Piktogram dan Diagram Batang", topic: "Penyajian Data",
    description: "Susun piktogram, buat diagram batang tegak dan mendatar, lalu baca informasi datanya.",
    videoStatus: "coming_soon", summary: "Penyajian dan pembacaan data melalui gambar, kunci simbol, tabel, dan diagram batang.", questionIds: [],
  },
  {
    id: "kelas-4-bangun-datar", classId: 4, chapter: 5, slug: "bangun-datar",
    title: "Bangun Datar", topic: "Geometri",
    description: "Jelajahi ciri segibanyak, segitiga, segiempat, lalu susun dan uraikan bangun.",
    videoStatus: "coming_soon", summary: "Ciri bangun datar, komposisi dan dekomposisi melalui eksplorasi interaktif.", questionIds: [],
  },
  {
    id: "cambridge-grade-6-ratio", classId: 6, chapter: 11, slug: "cambridge-ratio-and-proportion",
    title: "Ratio and Proportion", topic: "Cambridge Curriculum · Grade 6",
    description: "Group counters, scale recipes and compare unit prices.",
    videoStatus: "coming_soon", summary: "Understand equivalent ratios and direct proportions.", questionIds: [],
  },
  {
    id: "cambridge-grade-6-fractions", classId: 6, chapter: 10, slug: "cambridge-calculation-with-fractions",
    title: "Calculation with Fractions", topic: "Cambridge Curriculum · Grade 6",
    description: "Estimate and calculate with fractions using interactive fraction strips.",
    videoStatus: "coming_soon", summary: "Add, subtract, multiply and divide fractions, and use fractions as operators.", questionIds: [],
  },
  {
    id: "kelas-4-pengukuran", classId: 4, chapter: 4, slug: "pengukuran-luas-dan-volume",
    title: "Pengukuran Luas & Volume", topic: "Pengukuran",
    description: "Ukur luas dengan petak, takar isi wadah, dan hubungkan liter dengan mililiter.",
    videoStatus: "coming_soon", summary: "Satuan luas, petak satuan, kapasitas dan konversi volume.", questionIds: [],
  },
  {
    id: "kelas-4-pola", classId: 4, chapter: 3, slug: "pola-gambar-dan-pola-bilangan",
    title: "Pola Gambar dan Pola Bilangan", topic: "Pola",
    description: "Susun pola gambar, lengkapi pola bilangan, dan pecahkan cerita dengan peraga interaktif.",
    videoStatus: "coming_soon", summary: "Pola membesar dan mengecil, selisih tetap, tabel, dan soal cerita.", questionIds: [],
  },
  {
    id: "kelas-4-pecahan",
    classId: 4,
    chapter: 2,
    slug: "pecahan",
    title: "Pecahan",
    topic: "Bilangan",
    description: "Bandingkan pecahan, cari pecahan senilai, dan hubungkan desimal dengan persen melalui peraga.",
    videoStatus: "coming_soon",
    summary: "Pelajari pecahan, desimal persepuluhan dan perseratusan, serta persen.",
    questionIds: [],
  },
  {
    id: "kelas-4-bilangan-cacah-10000",
    classId: 4,
    chapter: 1,
    slug: "bilangan-cacah-sampai-10000",
    title: "Bilangan Cacah sampai 10.000",
    topic: "Bilangan",
    description: "Jelajahi nilai tempat, operasi hitung, faktor, dan kelipatan dengan peraga interaktif.",
    videoStatus: "coming_soon",
    summary: "Baca, bandingkan, susun, dan hitung bilangan cacah sampai 10.000.",
    questionIds: [],
  },


  {
    id: "kelas-1-membilang-10",
    classId: 1,
    chapter: 1,
    slug: "membilang-sampai-dengan-10",
    title: "Ayo Membilang sampai dengan 10",
    topic: "Bilangan",
    description: "Belajar menghitung, membaca, menulis, membandingkan, dan mengurutkan bilangan sampai 10.",
    videoStatus: "coming_soon",
    summary: "Bilangan dapat digunakan untuk menyatakan banyak benda. Kita dapat menghitung benda satu per satu, membaca lambang bilangan, menulisnya, lalu membandingkan mana yang lebih banyak atau lebih sedikit.",
    questionIds: ["kelas1-bilangan-01", "kelas1-bilangan-02", "kelas1-bilangan-03", "kelas1-bilangan-04", "kelas1-bilangan-05"],
  },
  {
    id: "kelas-1-penjumlahan-10",
    classId: 1,
    chapter: 2,
    slug: "penjumlahan-sampai-dengan-10",
    title: "Penjumlahan sampai dengan 10",
    topic: "Penjumlahan",
    description: "Memahami penjumlahan melalui cerita, benda konkret, dan berbagai cara menghitung.",
    videoStatus: "coming_soon",
    summary: "Penjumlahan berarti menggabungkan dua kelompok atau lebih. Hasil penjumlahan dapat ditemukan dengan menghitung semua benda atau melanjutkan hitungan dari bilangan pertama.",
    questionIds: [],
  },
  {
    id: "kelas-1-pengurangan-10",
    classId: 1,
    chapter: 3,
    slug: "pengurangan-sampai-dengan-10",
    title: "Pengurangan sampai dengan 10",
    topic: "Pengurangan",
    description: "Belajar mengurangi benda, menghitung mundur, dan memahami hubungan pengurangan dengan penjumlahan.",
    videoStatus: "coming_soon",
    summary: "Pengurangan berarti mengambil sebagian dari suatu kelompok. Kita dapat menghitung sisa benda, menghitung mundur, dan menggunakan penjumlahan untuk memeriksa jawaban.",
    questionIds: [],
  },
  {
    id: "kelas-1-mengenal-bentuk",
    classId: 1,
    chapter: 4,
    slug: "mengenal-bentuk",
    title: "Mengenal Bentuk",
    topic: "Geometri",
    description: "Mendeskripsikan benda berdasarkan bentuk, mengelompokkan benda, serta menyusun dan mengurai bentuk bangun.",
    videoStatus: "coming_soon",
    summary: "Benda di sekitar memiliki bentuk yang berbeda. Kita dapat mengenali ciri bentuk, mengelompokkan benda yang bentuknya sama, dan menyusun beberapa bentuk menjadi bangun baru.",
    questionIds: [],
  },
  {
    id: "kelas-1-membilang-20",
    classId: 1,
    chapter: 5,
    slug: "membilang-sampai-dengan-20",
    title: "Ayo Membilang sampai dengan 20",
    topic: "Bilangan",
    description: "Menghitung, membaca, menulis, mengurutkan, dan membandingkan bilangan sampai 20.",
    videoStatus: "coming_soon",
    summary: "Setelah memahami bilangan sampai 10, kita melanjutkan membilang sampai 20. Perhatikan urutan bilangan dan gunakan benda untuk membantu menghitung dengan tepat.",
    questionIds: [],
  },
  {
    id: "kelas-1-operasi-20",
    classId: 1,
    chapter: 6,
    slug: "penjumlahan-dan-pengurangan-sampai-dengan-20",
    title: "Penjumlahan dan Pengurangan sampai dengan 20",
    topic: "Operasi hitung",
    description: "Mengenal konsep lebih dari, kurang dari, dan selisih melalui penjumlahan serta pengurangan sampai 20.",
    videoStatus: "coming_soon",
    summary: "Gunakan penjumlahan dan pengurangan untuk membandingkan dua bilangan dan menemukan selisih. Hasil operasi tetap harus diperiksa agar tidak lebih dari 20.",
    questionIds: [],
  },
  {
    id: "kelas-1-panjang-benda",
    classId: 1,
    chapter: 7,
    slug: "mengukur-panjang-benda",
    title: "Mengukur Panjang Benda",
    topic: "Pengukuran",
    description: "Membandingkan, mengurutkan, dan mengukur panjang benda menggunakan satuan yang sesuai.",
    videoStatus: "coming_soon",
    summary: "Panjang benda dapat dibandingkan dengan melihat langsung atau menggunakan alat ukur. Saat mengukur, mulai dari angka nol dan gunakan satuan yang sama.",
    questionIds: [],
  },
  {
    id: "kelas-1-mengenal-diagram",
    classId: 1,
    chapter: 8,
    slug: "mengenal-diagram",
    title: "Mengenal Diagram",
    topic: "Data",
    description: "Mengelompokkan data sederhana dan membaca informasi dari diagram gambar.",
    videoStatus: "coming_soon",
    summary: "Data dapat dikumpulkan dan dikelompokkan. Diagram gambar membantu kita melihat jumlah setiap kelompok dengan lebih mudah.",
    questionIds: [],
  },
];

export function getMaterialsByClass(classId: number) {
  return materials.filter((material) => material.classId === classId);
}

export function getMaterialBySlug(slug: string) {
  return materials.find((material) => material.slug === slug);
}

/* Bab baru ditambahkan lewat folder src/chapters/<id>/ (lihat src/chapters/README.md), bukan dengan mengedit daftar di atas.
   Bab dari registri ditaruh paling depan, yang terbaru lebih dulu. */
materials.unshift(...[...chapterMetas].sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? "")));
{
  const seen = new Map<string, string>();
  for (const m of materials) for (const key of [`id:${m.id}`, `slug:${m.slug}`]) {
    if (seen.has(key)) throw new Error(`Materi ganda (${key}) di ${m.title} dan ${seen.get(key)}`);
    seen.set(key, m.title);
  }
}
