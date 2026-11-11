export const number = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export type Question = {
  prompt: string;
  answer: string;
  explanation: string;
  mode?: "order" | "multiple" | "choice";
  options?: string[];
  diagram?: { value: number; missing: number };
  wholeFields?: string[];
  wholeVisual?: { kind: 'parts' | 'compare' | 'operation' | 'array' | 'groups' | 'factors' | 'timeline'; values: number[]; labels?: string[] };
  wholeTopic?: number;
  wholeLevel?: string;
};
const fill = (prompt: string, answer: number | string, explanation: string, diagram?: { value: number; missing: number }): Question =>
  ({ prompt, answer: String(answer), explanation, diagram });
const choice = (prompt: string, answer: string, options: string[], explanation: string, diagram?: Question["diagram"]): Question =>
  ({ prompt, answer, options, explanation, diagram, mode: "choice" });
const order = (prompt: string, answer: number[], options: number[], explanation: string): Question =>
  ({ prompt, answer: answer.map(number).join("|"), options: options.map(number), explanation, mode: "order" });
const multiple = (prompt: string, answer: number[], options: number[], explanation: string): Question =>
  ({ prompt, answer: answer.map(String).join("|"), options: options.map(String), explanation, mode: "multiple" });

export const topics = [
  { title: "Menentukan dan menggunakan nilai tempat", steps: ["Baca bilangan dari digit paling kiri.", "Bedakan angka, tempatnya, dan nilainya. Pada 4.286, angka 2 menempati ratusan dan bernilai 200.", "Nol menunjukkan bahwa suatu tempat kosong."], demo: "Ubah angka 2 pada 4.286 menjadi 0. Baca bilangan baru dan periksa posisi ratusannya." },
  { title: "Membandingkan dan mengurutkan", steps: ["Bandingkan digit dari posisi paling kiri.", "Jika sama, lanjutkan ke posisi berikutnya. Digit pertama yang berbeda menentukan bilangan terbesar.", "Untuk mengurutkan, pilih bilangan terkecil satu per satu atau lakukan sebaliknya."], demo: "Bandingkan 4.286 dengan 4.268, lalu ubah bilangan kedua menjadi 100. Amati perpindahan sorotan dari puluhan ke ribuan." },
  { title: "Komposisi dan dekomposisi", steps: ["Pisahkan bilangan berdasarkan nilai setiap digit.", "Tuliskan hasilnya sebagai penjumlahan.", "Gabungkan nilai-nilai itu untuk membentuk bilangan semula."], demo: "Uraikan 4.286 menjadi 4.000 + 200 + 80 + 6, lalu ubah angka puluhannya." },
  { title: "Penjumlahan", steps: ["Sejajarkan satuan dengan satuan, puluhan dengan puluhan, dan seterusnya.", "Jumlahkan dari kanan ke kiri. Tukarkan 10 satuan dengan 1 puluhan, dan lakukan hal serupa di posisi lain.", "Baca hasil dari kiri ke kanan."], demo: "Kerjakan langkah satuan dari 2.748 + 1.685. Perhatikan 13 satuan menjadi 1 puluhan dan 3 satuan." },
  { title: "Pengurangan", steps: ["Sejajarkan digit berdasarkan nilai tempat.", "Kurangi mulai dari satuan. Jika angka atas lebih kecil, tukar satu unit dari kolom di kirinya menjadi sepuluh unit di kolom tersebut.", "Periksa dengan menambahkan sisa dan bilangan pengurang."], demo: "Pada 4.002 − 1.786, kerjakan langkah satuan. Perhatikan bagaimana penukaran melewati dua kolom nol." },
  { title: "Perkalian", steps: ["Perkalian menghitung isi beberapa kelompok yang sama banyak.", "Pisahkan bilangan menjadi nilai tempat, lalu kalikan tiap bagian.", "Jumlahkan semua hasil kali bagian."], demo: "Mulai dari 12 × 4. Setelah itu pilih 128 × 6 dan buka hasil setiap bagian." },
  { title: "Pembagian", steps: ["Pembagian dapat berarti membagi sama rata atau mencari banyak kelompok.", "Kerjakan dari digit paling kiri. Bagi, kalikan, kurangkan, lalu turunkan digit berikutnya.", "Periksa dengan mengalikan hasil bagi dan pembagi, lalu menambahkan sisa bila ada."], demo: "Bagi 84 menjadi 4 kelompok. Coba juga 936 ÷ 4 dan ikuti langkah bersusunnya." },
  { title: "Faktor dan kelipatan", steps: ["Faktor membagi bilangan sampai habis.", "Cari pasangan perkalian yang hasilnya bilangan tersebut.", "Kelipatan diperoleh dengan mengalikan bilangan dengan 1, 2, 3, dan seterusnya."], demo: "Pilih 18. Bandingkan daftar pasangan faktor dengan kelipatan 18." },
];

export const practice: Question[][] = [
  [
    fill("Tulis lambang bilangan untuk tiga ribu enam puluh dua.", 3062, "3.000 + 60 + 2 = 3.062."),
    choice("Angka 7 pada 5.704 menempati posisi apa?", "Ratusan", ["Puluhan", "Ratusan", "Ribuan"], "Angka 7 berarti 700."),
    choice("Angka 8 dalam 8.506 menempati posisi apa?", "Ribuan", ["Ratusan", "Ribuan", "Puluhan", "Satuan"], "Angka 8 menempati ribuan dan bernilai 8.000.", { value: 8506, missing: 1 }),
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
    fill("Hitung 2.376 + 1.459.", 3835, "Simpan dari satuan dan puluhan. Pada ratusan, 3 + 4 + 1 = 8 sehingga tidak menyimpan lagi. Hasilnya 3.835."),
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

const visual=(question:Question,kind:NonNullable<Question['wholeVisual']>['kind'],values:number[],labels?:string[]):Question=>({...question,wholeVisual:{kind,values,labels}});
const fields=(prompt:string,answer:string,names:string[],explanation:string,values:number[]):Question=>({...fill(prompt,answer,explanation),wholeFields:names,wholeVisual:{kind:'parts',values}});
// Keep four practices per topic, with decomposition, partial products and quotient/remainder as multi-field tasks.
practice[2][2]=fields('Lengkapi bentuk panjang 6.951. Isi nilai puluhan dan satuan.','50|1',['Nilai puluhan','Nilai satuan'],'6.951 = 6.000 + 900 + 50 + 1.',[6951]);
practice[5][1]=fields('Uraikan 234 × 7. Isi hasil 200 × 7, 30 × 7, lalu 4 × 7.','1400|210|28',['200 × 7','30 × 7','4 × 7'],'1.400 + 210 + 28 = 1.638.',[200,30,4]);
practice[6][0]=fields('96 manik-manik dibagi kepada 8 kelompok. Isi hasil bagi dan sisa.','12|0',['Isi tiap kelompok','Sisa'],'96 = 8 × 12 + 0.',[96,8]);
practice[0][1].diagram={value:5704,missing:2};
const practiceVisuals:Question['wholeVisual'][][]=[
 [{kind:'parts',values:[3062]},undefined,undefined,{kind:'parts',values:[9018]}],
 [{kind:'compare',values:[6089,6098]},{kind:'compare',values:[2971,2871,2817,2917]},{kind:'compare',values:[9889,10000,9898,9988]},{kind:'compare',values:[3078,3087],labels:['Rak A','Rak B']}],
 [{kind:'parts',values:[5000,800,4]},{kind:'parts',values:[7302]},undefined,{kind:'parts',values:[6000,1200,3]}],
 [{kind:'operation',values:[2376,1459],labels:['+']},{kind:'operation',values:[4588,0,7002],labels:['+','?']},{kind:'operation',values:[2164,387,1928],labels:['+']},{kind:'operation',values:[3486,2758],labels:['+']}],
 [{kind:'operation',values:[6204,2876],labels:['−']},{kind:'operation',values:[0,2415,4387],labels:['−','?']},{kind:'operation',values:[9000,5746],labels:['−']},{kind:'operation',values:[7530,2896],labels:['−']}],
 [{kind:'array',values:[16,5]},undefined,{kind:'array',values:[36,8]},{kind:'array',values:[36,24]}],
 [undefined,{kind:'groups',values:[1248,6]},{kind:'groups',values:[864,8]},{kind:'groups',values:[2520,12]}],
 [{kind:'factors',values:[24]},{kind:'timeline',values:[7,10,40]},{kind:'timeline',values:[6,3]},{kind:'groups',values:[42,7]}]
];
practice.forEach((qs,t)=>qs.forEach((q,i)=>{q.wholeTopic=t;const v=practiceVisuals[t][i];if(v)q.wholeVisual=v;}));
export const assessment:Question[]=[
 visual(fill('Pada 7.064, lengkapi digit ratusan pada tabel nilai tempat.',0,'7.064 = 7.000 + 0 + 60 + 4.',{value:7064,missing:2}),'parts',[7064]),
 visual(choice('Dua rak berisi 6.089 dan 6.098 buku. Pilih perbandingan yang benar.','6.089 < 6.098',['6.089 > 6.098','6.089 < 6.098','6.089 = 6.098'],'Ribuan dan ratusan sama; puluhan 8 lebih kecil dari 9.'),'compare',[6089,6098],['Rak A','Rak B']),
 fields('Susun bilangan dari 4 ribuan, 12 ratusan, dan 6 satuan. Isi jumlahnya lalu nilai angka pada ratusan.','5206|200',['Bilangan','Nilai ratusan'],'4.000 + 1.200 + 6 = 5.206. Ratusannya 2, bernilai 200.',[4000,1200,6]),
 visual(fill('Hitung 2.347 + 1.586.',3933,'7 + 6 = 13; 4 + 8 + 1 = 13; 3 + 5 + 1 = 9; 2 + 1 = 3.'),'operation',[2347,1586],['+']),
 visual(choice('Pada 5.604 − 2.786, penukaran mana yang mempertahankan nilai 5.604?','5 ribuan + 5 ratusan + 9 puluhan + 14 satuan',['5 ribuan + 6 ratusan + 9 puluhan + 14 satuan','4 ribuan + 5 ratusan + 9 puluhan + 14 satuan','5 ribuan + 5 ratusan + 9 puluhan + 14 satuan'],'5.000 + 500 + 90 + 14 tetap 5.604. Selanjutnya hitung pengurangannya.'),'operation',[5604,2786],['−']),
 visual(fill('Hitung 27 × 4 dengan memisahkan 20 dan 7.',108,'20 × 4 + 7 × 4 = 80 + 28 = 108.'),'array',[27,4]),
 visual(choice('864 ÷ 8 diperiksa dengan perkalian mana?','108 × 8 = 864',['108 × 8 = 864','18 × 8 = 864','108 × 6 = 864'],'Nol pada hasil bagi 108 tidak boleh dihilangkan.'),'groups',[864,8]),
 visual(multiple('Pilih semua faktor 28.',[1,2,4,7,14,28],[1,2,3,4,6,7,14,28],'Pasangan faktor 1×28, 2×14, dan 4×7.'),'factors',[28]),
 visual(choice('Bandingkan nilai angka 7 di posisi ribuan pada 7.407 dan di posisi ratusan pada 4.770. Pilih pasangan nilainya.','7.000 dan 700',['700 dan 7.000','7.000 dan 700','7.000 dan 70'],'Posisi berbeda membuat nilai digit yang sama berbeda.'),'compare',[7407,4770],['Digit ribuan','Digit ratusan']),
 visual(order('Urutkan dari yang terbesar. Bandingkan posisi digit yang pertama berbeda.',[10000,9988,9898,9889],[9889,10000,9898,9988],'10.000 terbesar; sisanya dibandingkan dari ratusan lalu puluhan.'),'compare',[9889,10000,9898,9988]),
 visual(multiple('Pilih semua bentuk yang bernilai 7.203.',[1,2],[1,2,3,4],'Pilihan 1 = 6.000+1.200+3; pilihan 2 =7.000+200+3. Pilihan3=7.023, pilihan4=7.230.'),'parts',[6000,1200,3],['1: 6 ribuan + 12 ratusan + 3 satuan','2: 7 ribuan + 2 ratusan + 3 satuan','3: 7 ribuan + 2 puluhan + 3 satuan','4: 7 ribuan + 2 ratusan + 3 puluhan']),
 visual(fill('Lengkapi 4.588 + … = 7.002.',2414,'Suku hilang =7.002−4.588=2.414. Cek 4.588+2.414=7.002.'),'operation',[4588,0,7002],['+','?']),
 visual(fill('Hitung 9.000 − 5.746.',3254,'9.000 dapat ditukar menjadi 8 ribuan,9 ratusan,9 puluhan,10 satuan sebelum mengurangi.'),'operation',[9000,5746],['−']),
 fields('Isi dua hasil kali bagian untuk 136 × 8: (100 × 8) dan (36 × 8).','800|288',['100 × 8','36 × 8'],'800 + 288 =1.088.',[100,36]),
 fields('1.248 dibagi ke 6 kelompok. Isi hasil bagi dan sisa.','208|0',['Hasil bagi','Sisa'],'1.248=6×208+0. Nol pada puluhan hasil bagi wajib ditulis.',[1248,6]),
 visual(multiple('Pilih kelipatan positif 6 yang lebih dari 10 dan kurang dari 32.',[12,18,24,30],[0,6,12,16,18,24,30,36],'6×2 sampai6×5 memenuhi kedua batas.'),'timeline',[6,10,32]),
 fields('Sebuah bilangan terdiri dari 8 ribuan, 13 ratusan, 4 puluhan, 2 satuan. Isi bilangan dan nilai angka ratusannya.','9342|300',['Bilangan','Nilai ratusan'],'8.000+1.300+40+2=9.342. Nilai ratusannya300.',[8000,1300,40,2]),
 visual(multiple('Pilih semua bilangan yang lebih dari 6.809 tetapi kurang dari 6.890.',[6819,6889],[6809,6819,6889,6890,6908],'Batas tidak termasuk; 6.819 dan6.889 berada di antaranya.'),'compare',[6809,6890]),
 fields('Jumlahnya 8.005. Salah satu bagian 3.780. Isi bagian yang hilang dan hasil cek penjumlahannya.','4225|8005',['Bagian hilang','Hasil cek'],'8.005−3.780=4.225; cek3.780+4.225=8.005.',[8005,3780]),
 visual(fill('Rani punya 218 kelereng, mendapat 67, lalu memberikan 89. Berapa sisanya?',196,'218+67−89=196.'),'operation',[218,67,89],['+','−']),
 visual(fill('Gudang berisi 10.000 buku. Dikirim 4.586 buku, lalu 1.274 buku. Berapa sisanya?',4140,'10.000−4.586−1.274=4.140. Periksa:4.140+4.586+1.274=10.000.'),'operation',[10000,4586,1274],['−']),
 visual(fill('Ada 28 botol per kardus dan 36 kardus. Berapa seluruh botol?',1008,'28×30+28×6=840+168=1.008.'),'array',[28,36]),
 visual(fill('Bayu mendapat 156 dan 114 gantungan kunci. Dibagikan sama rata kepada lima teman dan dirinya. Berapa tiap orang?',45,'(156+114)÷6=270÷6=45.'),'groups',[270,6],['156 + 114','5 teman + Bayu']),
 visual(fill('Lampu baru berkedip pukul 18.10, lalu setiap 7 menit. Berapa angka menit pada kedipan kelima SETELAH 18.10?',45,'Lima jeda ×7 menit=35 menit.18.10+35 menit=18.45.'),'timeline',[7,5])
].map((q,i)=>({...q,wholeTopic:i%8,wholeLevel:i<8?'Sedang':i<17?'Menantang':'Sangat menantang'}));
