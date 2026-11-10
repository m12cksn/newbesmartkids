# Kelas 6 Bab 3 — Kubus dan Balok

## Sumber dan cakupan

Empat PDF scan: bab3 - mengonstruksi dan mengurai.pdf (6 hlm), bab3 - Visualisasi Spasial.pdf (6), Bab3 - Lokasi.pdf (6), evaluasi kelas 6 bab 3.pdf (2). Sumber ditelaah melalui render, OCR dan pemeriksaan gambar. Materi menggunakan penjelasan orisinal BeSmartKids, dengan struktur belajar kelas 4/6 yang sudah disetujui.

| Materi | Tujuan dan peraga | Latihan |
| --- | --- | --- |
| A Mengonstruksi dan Mengurai | Bangun kolom kubus pada alas; urai lapisan; putar; buat balok dengan panjang/lebar/tinggi dalam kubus satuan | Hitung kubus tersembunyi, bangun ulang, isi banyak kubus per lapisan, hitung balok penyusun, pilih orientasi tumpukan |
| B Visualisasi Spasial | Tampak depan/kanan/atas dengan acuan eksplisit; gambar proyeksi; kubus bertanda | Kanvas petak tiga arah, hubungkan arah dengan siluet dan lambang sisi |
| C Lokasi | Titik perpotongan huruf–angka; jalur tetangga; jarak minimum; guling kubus bertanda P | Ketuk titik, denah kursi, bangun jalur, isi jarak, jumlah guling minimum |

Lima latihan per materi (15 total). Video berupa placeholder jujur sampai tautan guru tersedia. Evaluasi wajib diisi sebelum lanjut; hasil menampilkan benar, salah, skor, serta pembahasan kesalahan.

## Matriks evaluasi

Evaluasi sumber memuat 1) jumlah kubus susunan, 2) gambar kubus bertanda dari tiga arah, 3) lokasi kursi relatif, dan pengayaan jalur/jarak. Versi web memperluas variasi soal sejenis dengan angka, susunan, lambang dan titik berbeda. Soal dari latihan materi digunakan untuk mendukung bentuk interaksi setara menggambar/menyusun pada website.

| Cakupan | Nomor evaluasi | Aktivitas |
| --- | --- | --- |
| Konstruksi/dekomposisi | 1,4,7,10,13,16,19,22 | Hitung, isi lapisan, bangun ulang, lengkapi balok, lepas lapisan |
| Spasial dan kubus bertanda | 2,5,8,11,14,17,20,23 | Hubungkan arah–gambar/lambang, gambar tampak depan/kanan/atas |
| Lokasi dan jalur | 3,6,9,12,15,18,21,24 | Pilih titik, telusuri jalur yang sah, jarak, hitung jalur pengayaan |

Kesulitan: 8 sedang, 9 menantang, 7 sangat menantang. Kenaikan dari jumlah kubus kecil/lokasi langsung ke rekonstruksi bertingkat, kombinasi perpindahan, dan beberapa jalur minimum. Mayoritas evaluasi memerlukan tindakan geometris (membangun, menggambar, memasangkan, memilih titik, menelusuri jalur), bukan pilihan ganda berulang.

## Konvensi geometri yang harus dipertahankan

- Matriks tinggi: indeks baris y=0 adalah depan, x bertambah ke kanan. Semua kolom terisi dari lantai. Tidak ada rongga/kubus melayang; kubus penyangga wajib dihitung.
- Proyeksi depan: tinggi maksimum per kolom x. Proyeksi kanan: tinggi maksimum per baris y (depan di kiri kanvas). Proyeksi atas: jejak petak, belakang di atas kanvas. Semua peraga memberi tanda DEPAN dan KANAN.
- SVG kubus dibuat dari koordinat voxel yang sama dengan data/proyeksi; permukaan internal disembunyikan. Warna membedakan lapisan, bukan banyak kubus.
- Kubus bertanda: depan adalah bidang kiri pada gambar miring, kanan bidang kanan. Simbol diproyeksikan ke bidangnya. Tidak menebak sisi yang tidak tampak.
- Huruf A–F ke kanan, nomor 1–6 ke atas; titik di perpotongan garis. Denah kelas menandai papan di bawah baris 1 sehingga belakang = nomor bertambah. Jangan mengandalkan pengertian depan/belakang tanpa penanda.
- Jarak adalah banyak langkah horizontal + vertikal. Beberapa urutan jalur terpendek diterima; jalan diagonal tidak ada. P bergerak bersama orientasi kubus saat digulingkan.
- Soal penataan membandingkan seluruh luas alas tumpukan untuk tiga orientasi seragam: 15 kardus 20 × 30 × 40 cm, batas tinggi 120 cm. Sisa kardus memerlukan tumpukan baru; orientasi tinggi 40 cm mencapai luas 3.000 cm² (volume total dibagi batas tinggi). Gambar balok berukuran cm diberi label tidak berskala.

## Berkas dan QA

Data/matematika: src/data/grade-six-cubes.ts. Peraga: CubesVisuals.tsx. Pengalaman bab: GradeSixCubes.tsx. Katalog: src/data/materials.ts dan route kelas dinamis.

Pemeriksaan: scripts/verify-grade-six-cubes.mjs (kunci numerik, proyeksi voxel independen, rotasi, lapisan, pasangan unik, lokasi, jalur alternatif dan guling); scripts/smoke-grade-six-cubes.mjs (semua latihan/evaluasi dan aksi peraga pada 320/390/768/1280). Screenshot mobile/desktop setiap evaluasi diperiksa sebelum merge. Hasil aktual dicatat di PROJECT_HANDOFF.md dan PR.
