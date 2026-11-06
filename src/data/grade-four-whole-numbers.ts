export const number = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export type Question = {
  prompt: string;
  answer: string;
  explanation: string;
  mode?: "order" | "multiple" | "choice";
  options?: string[];
  diagram?: { value: number; missing: number };
};
const fill = (prompt: string, answer: number | string, explanation: string, diagram?: { value: number; missing: number }): Question =>
  ({ prompt, answer: String(answer), explanation, diagram });
const choice = (prompt: string, answer: string, options: string[], explanation: string): Question =>
  ({ prompt, answer, options, explanation, mode: "choice" });
const order = (prompt: string, answer: number[], options: number[], explanation: string): Question =>
  ({ prompt, answer: answer.map(number).join("|"), options: options.map(number), explanation, mode: "order" });
const multiple = (prompt: string, answer: number[], options: number[], explanation: string): Question =>
  ({ prompt, answer: answer.map(String).join("|"), options: options.map(String), explanation, mode: "multiple" });

export const topics = [
  { title: "Menentukan dan menggunakan nilai tempat", steps: ["Baca bilangan dari digit paling kiri.", "Bedakan angka, tempatnya, dan nilainya. Pada 4.286, angka 2 menempati ratusan dan bernilai 200.", "Nol menunjukkan bahwa suatu tempat kosong."], demo: "Ubah angka 2 pada 4.286 menjadi 0. Baca bilangan baru dan periksa posisi ratusannya." },
  { title: "Membandingkan dan mengurutkan", steps: ["Bandingkan digit dari posisi paling kiri.", "Jika sama, lanjutkan ke posisi berikutnya. Digit pertama yang berbeda menentukan bilangan terbesar.", "Untuk mengurutkan, pilih bilangan terkecil satu per satu atau lakukan sebaliknya."], demo: "Bandingkan 4.286 dengan 4.268. Ketuk posisi puluhan untuk melihat digit yang menentukan." },
  { title: "Komposisi dan dekomposisi", steps: ["Pisahkan bilangan berdasarkan nilai setiap digit.", "Tuliskan hasilnya sebagai penjumlahan.", "Gabungkan nilai-nilai itu untuk membentuk bilangan semula."], demo: "Uraikan 4.286 menjadi 4.000 + 200 + 80 + 6, lalu ubah angka puluhannya." },
  { title: "Penjumlahan", steps: ["Sejajarkan satuan dengan satuan, puluhan dengan puluhan, dan seterusnya.", "Jumlahkan dari kanan ke kiri. Tukarkan 10 satuan dengan 1 puluhan, dan lakukan hal serupa di posisi lain.", "Baca hasil dari kiri ke kanan."], demo: "Buka langkah satuan dari 2.748 + 1.685. Perhatikan 13 satuan menjadi 1 puluhan dan 3 satuan." },
  { title: "Pengurangan", steps: ["Sejajarkan digit berdasarkan nilai tempat.", "Kurangi mulai dari satuan. Jika angka atas lebih kecil, tukar satu unit dari kolom di kirinya menjadi sepuluh unit di kolom tersebut.", "Periksa dengan menambahkan sisa dan bilangan pengurang."], demo: "Pada 4.002 − 1.786, buka langkah satuan. Perhatikan bagaimana penukaran melewati dua kolom nol." },
  { title: "Perkalian", steps: ["Perkalian menghitung isi beberapa kelompok yang sama banyak.", "Pisahkan bilangan menjadi nilai tempat, lalu kalikan tiap bagian.", "Jumlahkan semua hasil kali bagian."], demo: "Mulai dari 12 × 4. Setelah itu pilih 128 × 6 dan buka hasil setiap bagian." },
  { title: "Pembagian", steps: ["Pembagian dapat berarti membagi sama rata atau mencari banyak kelompok.", "Kerjakan dari digit paling kiri. Bagi, kalikan, kurangkan, lalu turunkan digit berikutnya.", "Periksa dengan mengalikan hasil bagi dan pembagi, lalu menambahkan sisa bila ada."], demo: "Bagi 84 menjadi 4 kelompok. Coba juga 936 ÷ 4 dan ikuti langkah bersusunnya." },
  { title: "Faktor dan kelipatan", steps: ["Faktor membagi bilangan sampai habis.", "Cari pasangan perkalian yang hasilnya bilangan tersebut.", "Kelipatan diperoleh dengan mengalikan bilangan dengan 1, 2, 3, dan seterusnya."], demo: "Pilih 18. Bandingkan daftar pasangan faktor dengan kelipatan 18." },
];

export const practice: Question[][] = [
  [
    fill("Tulis lambang bilangan untuk tiga ribu enam puluh dua.", 3062, "3.000 + 60 + 2 = 3.062."),
    choice("Angka 7 pada 5.704 menempati posisi apa?", "Ratusan", ["Puluhan", "Ratusan", "Ribuan"], "Angka 7 berarti 700."),
    fill("Berapa nilai angka 8 dalam 8.506?", 8000, "Angka 8 menempati ribuan.", { value: 8506, missing: 1 }),
    choice("Bagaimana membaca 9.018?", "Sembilan ribu delapan belas", ["Sembilan ribu seratus delapan", "Sembilan ribu delapan belas", "Sembilan ribu delapan puluh"], "9.018 terdiri atas 9.000 dan 18."),
  ],
  [
    choice("Lengkapi 6.089 … 6.098.", "<", [">", "=", "<"], "Pada posisi puluhan, 8 lebih kecil dari 9."),
    order("Urutkan dari yang terkecil.", [2817, 2871, 2917, 2971], [2971, 2871, 2817, 2917], "Bandingkan ratusan, lalu puluhan."),
    order("Urutkan dari yang terbesar.", [10000, 9988, 9898, 9889], [9889, 10000, 9898, 9988], "10.000 mempunyai lima digit. Bandingkan digit berikutnya untuk tiga bilangan lain."),
    choice("Jumlah buku rak A 3.078. Rak B berisi 3.087. Rak mana yang lebih banyak?", "Rak B", ["Rak A", "Rak B", "Sama banyak"], "Puluhan pada 3.087 lebih besar."),
  ],
  [
    fill("Susun bilangan dari 5.000 + 800 + 4.", 5804, "Tempat puluhan kosong, jadi tulis 0."),
    choice("Pilih bentuk panjang untuk 7.302.", "7.000 + 300 + 2", ["7.000 + 30 + 2", "7.000 + 300 + 2", "7.000 + 300 + 20"], "Uraikan menurut ribuan, ratusan, dan satuan."),
    fill("Lengkapi 6.951 = 6.000 + 900 + … + 1.", 50, "Angka 5 pada puluhan bernilai 50."),
    fill("Susun bilangan dari 6 ribuan, 12 ratusan, dan 3 satuan.", 7203, "12 ratusan bernilai 1.200. Jadi 6.000 + 1.200 + 3 = 7.203."),
  ],
  [
    fill("Hitung 2.376 + 1.459.", 3835, "Simpan dari satuan, puluhan, dan ratusan. Hasilnya 3.835."),
    fill("Lengkapi 4.588 + … = 7.002.", 2414, "Cari suku yang hilang dengan 7.002 − 4.588."),
    fill("Hitung 2.164 + 387 + 1.928.", 4479, "2.164 + 387 = 2.551, lalu tambahkan 1.928."),
    fill("Perpustakaan punya 3.486 buku dan menerima 2.758 buku. Berapa totalnya?", 6244, "Jumlahkan 3.486 dan 2.758."),
  ],
  [
    fill("Hitung 6.204 − 2.876.", 3328, "Tukar nilai tempat jika digit atas terlalu kecil."),
    fill("Lengkapi … − 2.415 = 4.387.", 6802, "Jumlah awal sama dengan sisa ditambah pengurang."),
    fill("Hitung 9.000 − 5.746.", 3254, "Penukaran dari ribuan melewati ratusan dan puluhan."),
    fill("Gudang punya 7.530 buku. Sebanyak 2.896 dikirim. Berapa sisanya?", 4634, "Kurangkan 2.896 dari 7.530."),
  ],
  [
    fill("Hitung 16 × 5.", 80, "10 × 5 + 6 × 5 = 80."),
    fill("Hitung 234 × 7.", 1638, "1.400 + 210 + 28 = 1.638."),
    choice("Mana yang sama dengan 36 × 8?", "240 + 48", ["24 + 48", "240 + 48", "240 + 6"], "30 × 8 = 240 dan 6 × 8 = 48."),
    fill("Ada 36 baki, masing-masing berisi 24 botol. Berapa botol seluruhnya?", 864, "36 × 20 + 36 × 4 = 864."),
  ],
  [
    fill("Bagikan 96 manik-manik merata ke 8 kelompok. Berapa isi tiap kelompok?", 12, "8 × 12 = 96."),
    fill("Hitung 1.248 ÷ 6.", 208, "Periksa dengan 208 × 6 = 1.248."),
    choice("Perkalian mana yang memeriksa 864 ÷ 8?", "108 × 8 = 864", ["18 × 8 = 864", "108 × 8 = 864", "108 × 6 = 864"], "Hasil bagi dikali pembagi sama dengan bilangan yang dibagi."),
    fill("2.520 bibit dimasukkan ke baki berisi 12 bibit. Berapa baki yang diperlukan?", 210, "12 × 210 = 2.520."),
  ],
  [
    multiple("Pilih semua faktor dari 24.", [1,2,3,4,6,8,12,24], [1,2,3,4,5,6,8,10,12,24], "Pasangannya 1 × 24, 2 × 12, 3 × 8, dan 4 × 6."),
    multiple("Pilih semua kelipatan 7 yang lebih dari 10 dan kurang dari 40.", [14,21,28,35], [7,14,18,21,27,28,35,42], "Hitung 7 × 2, 7 × 3, 7 × 4, dan 7 × 5."),
    fill("Lampu berkedip setiap 6 menit. Setelah 14.05, berapa menit sampai kedipan ketiga?", 18, "6 × 3 = 18 menit."),
    fill("Ada 42 siswa. Jika semua kelompok sama besar, berapa kelompok yang terbentuk dengan 7 siswa per kelompok?", 6, "42 ÷ 7 = 6, jadi 7 dan 6 adalah pasangan faktor dari 42."),
  ],
];

export const assessment: Question[] = [
  fill("Pada tabel nilai tempat, isi angka ratusan untuk 7.064.", 0, "7.064 memiliki 7 ribuan, 0 ratusan, 6 puluhan, dan 4 satuan.", { value: 7064, missing: 2 }),
  fill("Hitung 2.347 + 1.586.", 3933, "Jumlahkan per kolom mulai dari satuan."),
  fill("Hitung 3.142 − 768.", 2374, "Tukar nilai tempat jika diperlukan, lalu periksa 2.374 + 768 = 3.142."),
  fill("Hitung 27 × 4.", 108, "20 × 4 + 7 × 4 = 108."),
  fill("Hitung 84 ÷ 7.", 12, "7 × 12 = 84."),
  multiple("Pilih semua faktor 28.", [1,2,4,7,14,28], [1,2,3,4,6,7,14,28], "Pasangan faktor: 1 × 28, 2 × 14, dan 4 × 7."),
  fill("Tulis lambang bilangan delapan ribu sembilan puluh satu.", 8091, "8.000 + 90 + 1 = 8.091."),
  fill("Peserta lomba ada 468 orang. Sebanyak 257 peserta laki-laki. Berapa peserta perempuan?", 211, "468 − 257 = 211 peserta."),
  fill("Hitung 5.604 − 2.786.", 2818, "Kurangi per kolom. Cek dengan 2.818 + 2.786."),
  fill("Isi angka puluhan pada tabel untuk 6.804.", 0, "Angka puluhan pada 6.804 adalah 0.", { value: 6804, missing: 3 }),
  fill("Hitung 3.086 + 1.279 + 648.", 5013, "3.086 + 1.279 = 4.365. Tambahkan 648."),
  fill("Hitung 136 × 8.", 1088, "800 + 240 + 48 = 1.088."),
  multiple("Pilih kelipatan positif 6 yang kurang dari 32.", [6,12,18,24,30], [0,6,12,16,18,24,30,36], "Kelipatan yang memenuhi batas adalah 6 × 1 sampai 6 × 5."),
  fill("Hitung 936 ÷ 9.", 104, "9 × 104 = 936."),
  choice("Di bilangan 4.724, angka 7 menempati posisi apa?", "Ratusan", ["Ribuan", "Puluhan", "Ratusan", "Satuan"], "Nilai angka 7 adalah 700."),
  fill("Rani punya 218 kelereng. Ia mendapat 67 lagi, lalu memberikan 89. Berapa sisanya?", 196, "218 + 67 − 89 = 196."),
  fill("Ada 28 botol per kardus. Berapa botol dalam 36 kardus?", 1008, "28 × 30 + 28 × 6 = 1.008."),
  fill("Bayu mendapat 156 dan 114 gantungan kunci. Ia membaginya sama rata kepada lima teman dan dirinya. Berapa bagian tiap orang?", 45, "(156 + 114) ÷ 6 = 45."),
  fill("Susun bilangan dari 8 ribuan, 13 ratusan, 4 puluhan, dan 2 satuan.", 9342, "8.000 + 1.300 + 40 + 2 = 9.342."),
  multiple("Pilih semua faktor dari 72.", [1,2,3,4,6,8,9,12,18,24,36,72], [1,2,3,4,5,6,8,9,12,16,18,24,36,72], "Pasangkan 1 dengan 72, 2 dengan 36, 3 dengan 24, 4 dengan 18, 6 dengan 12, dan 8 dengan 9."),
  fill("Ada 8 kotak dengan 135 permen per kotak. Semua permen dibagi merata kepada 12 anak. Berapa permen per anak?", 90, "(8 × 135) ÷ 12 = 90."),
  multiple("Pilih semua kelipatan 5 yang lebih dari 12 dan kurang dari 37.", [15,20,25,30,35], [10,15,20,25,30,35,40], "Mulai dari 5 × 3 sampai 5 × 7."),
  fill("Lampu berkedip setiap 7 menit dan baru berkedip pukul 18.10. Berapa angka menit pada jam ketika lampu berkedip kelima kali setelah itu?", 45, "5 × 7 = 35 menit. Pukul 18.10 ditambah 35 menit menjadi 18.45."),
  fill("Hitung 10.000 − 4.586 − 1.274.", 4140, "4.586 + 1.274 = 5.860, lalu kurangi dari 10.000."),
];
