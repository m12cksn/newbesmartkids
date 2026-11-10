# Kelas 6 Bab 1 - Pecahan dan Desimal

Rute: `/kelas/konsep-inti-matematika-kelas-6/materi/pecahan-dan-desimal`
Kode: `src/data/grade-six-fractions-decimals.ts`, `src/components/learn/GradeSixFractionsDecimals.tsx`, `src/components/learn/GradeSixVisuals.tsx`
Validasi: `scripts/verify-grade-six-fractions-decimals.mjs`, `scripts/smoke-grade-six-fractions-decimals.mjs`

## Sumber

Lampiran PDF dari Mr Iwan (Buku Matematika SD/MI Kelas VI, Bab 1):

| Berkas | Halaman buku | Isi yang tersedia |
|---|---|---|
| Perkalian pecahan | 7-10, 13-16 | Permasalahan, Eksplorasi 1.1 dan 1.2, Pembahasan, Ayo Berkomunikasi, Latihan 1.1 |
| Pembagian pecahan | 16-19, 21-22, 28 | Permasalahan, Eksplorasi 1.3, Pembahasan B.1, Permasalahan B.2 a-e, Latihan 1.2 |
| Bilangan desimal | 29-30, 35-38, 40-41 | Ayo Mengingat Kembali, Permasalahan C.1 dan C.2, Eksplorasi 1.6, Pembahasan nilai tempat, Latihan 1.3 |

Tidak ada halaman Uji Kompetensi. Atas persetujuan pengguna (10 Nov 2026), evaluasi diturunkan dari pola Latihan 1.1-1.3 dengan angka, gambar, dan tingkat kesulitan berbeda. Pembahasan B.2 (hlm. 23-27) dan pembahasan C.1 (hlm. 31-34) tidak dilampirkan; penjelasan memakai metode baku yang sesuai dengan permasalahan di buku (n ÷ a/b = n × b/a; pecahan senilai berpenyebut 10/100 atau pembagian).

## Pemetaan subtopik

Revisi 10 Nov 2026 atas permintaan Mr Iwan: materi tidak harus mengikuti cerita PDF. Peraga dibuat ulang sebagai versi BeSmartKids sendiri dengan pola Kelas 4: peraga umum (batang, kumpulan benda, persegi satuan, garis bilangan, 100 petak, papan nilai tempat), penjelasan singkat di samping, siswa menjalankan langkah sendiri, lalu "Coba sendiri" dengan umpan balik. Soal latihan dan evaluasi tidak berubah.

| Subtopik | Tujuan | Peraga interaktif (dikendalikan siswa) | Latihan (4 soal) |
|---|---|---|---|
| A.1 Bilangan asli × pecahan | n × a/b sebagai penjumlahan berulang; ubah ke pecahan campuran | Slider penyebut, pembilang, banyak kelompok. Langkah: buat kelompok → beri nomor potongan → susun ulang menjadi utuh. Coba sendiri isian pecahan/campuran | isian pecahan, arsir pita, pilihan bermodel, isian pecahan campuran |
| A.2 Pecahan × bilangan asli | a/b bagian dari n benda | Pilih pecahan dan banyak benda per kelompok, tekan "Bagi menjadi b kelompok", ketuk a kelompok; umpan balik bila terlalu banyak | tandai pohon, isian, soal cerita dua langkah, komutatif 8 × 3/4 |
| B.1 Pecahan ÷ bilangan asli | a/b ÷ n = a/(b × n) | Persegi satuan: arsir a/b → potong setiap kolom menjadi n → ambil satu bagian (merah). Coba sendiri | isian, arsir satu gelas, tanah Pak Rudi, pilihan |
| B.2 Bilangan asli ÷ pecahan | n ÷ a/b = n × b/a, termasuk sisa | Garis bilangan 0–n bertanda 1/b: tekan "Lompat a/b" sampai tidak cukup, sisa disorot. Coba sendiri | isian, arsir takaran 1/3 L, pilihan 3 ÷ 2/5, gula 6 ÷ 3/4 |
| C.1 Pecahan → desimal | pecahan senilai berpenyebut 10/100 | Pilih pecahan dan pengali (×2…×50) sampai penyebut 10 atau 100; batang, 100 petak, garis bilangan 0–1. Coba sendiri isian desimal | pilih gambar 0,5, arsir 0,25, timbangan, kain 3/4 m |
| C.2 Membandingkan dan mengurutkan | nilai tempat, samakan angka di belakang koma | Atur digit dua bilangan, tombol "Samakan angka di belakang koma", tabel nilai tempat dengan sorotan, garis bilangan titik A dan B | isi nilai tempat, tanda < > =, urutkan jarak, lompat jauh |

## Evaluasi 24 soal

4 soal per subtopik, tidak ada dua soal berurutan dari subtopik yang sama. Tingkat kesulitan 8 Sedang, 9 Menantang, 7 Sangat menantang (label tampil di setiap soal; kode subtopik sengaja tidak ditampilkan agar tidak menjadi petunjuk).

| No | Subtopik | Pola Latihan asal | Respons | Tingkat |
|---|---|---|---|---|
| 1 | A.1 | 1.1 no.1 pita | arsir 3 pita | Sedang |
| 2 | C.1 | Ayo Mengingat b | pilih gambar 0,4 (100 petak, batang, gelas ukur) | Sedang |
| 3 | A.2 | Eksplorasi 1.2 | tandai 2/3 dari 18 pohon | Menantang |
| 4 | B.1 | 1.2 no.1 tanah | isian pecahan | Sedang |
| 5 | B.2 | 1.2 no.2 gula | isian | Menantang |
| 6 | C.2 | 1.3 no.2 suhu | urutkan 5 kota | Menantang |
| 7 | A.1 | Eksplorasi 1.1 ember | isian pecahan | Menantang |
| 8 | C.1 | 1.3 no.1b | pasangkan pecahan-desimal | Sangat menantang |
| 9 | A.2 | 1.1 no.2 pastel | isian dua langkah | Menantang |
| 10 | C.2 | 1.3 no.3 lompat jauh | pilihan (pengecoh 3,47 > 3,7) | Sedang |
| 11 | B.1 | Eksplorasi 1.3 | pilihan dengan pengecoh salah operasi | Menantang |
| 12 | A.1 | Ayo Berkomunikasi | pilih hasil > 4 | Sangat menantang |
| 13 | B.2 | 1.2 no.3 cokelat | isian sisa pecahan | Sangat menantang |
| 14 | C.1 | 1.3 no.1a | arsir 100 petak 7/20 | Menantang |
| 15 | A.2 | 1.1 no.3 ekstrakurikuler | isian dengan diagram batang | Sangat menantang |
| 16 | C.2 | Eksplorasi 1.6 nilai tempat | ketuk garis bilangan | Sedang |
| 17 | B.1 | Eksplorasi 1.3 | isian, dua kali membagi | Sangat menantang |
| 18 | B.2 | Permasalahan B.2 jus jambu | isian | Sedang |
| 19 | A.1 | 1.1 no.4 soal cerita | pilih cerita untuk 4 × 2/3 | Menantang |
| 20 | A.2 | Eksplorasi 1.2 | bandingkan dua kebun | Sangat menantang |
| 21 | C.1 | Permasalahan timbangan | isian desimal | Sedang |
| 22 | B.1 | 1.2 no.1b | arsir bagian satu anak | Sedang |
| 23 | B.2 | Permasalahan B.2 e | pilihan botol penuh dan sisa | Sangat menantang |
| 24 | C.2 | 1.3 no.4 label gizi | urutkan 5 zat | Menantang |

Posisi jawaban benar pada soal pilihan: 2, 3, 1, 0, 1, 0, 2 (indeks dari 0). Data suhu adalah data contoh, bukan data BPS.

## Checklist review sebelum merge

- [x] Matriks cakupan tujuan × subtopik × respons × tingkat (tabel di atas, diverifikasi skrip)
- [x] Kunci jawaban diperiksa dengan perhitungan independen di skrip verify
- [x] Pengecoh mewakili miskonsepsi (kalikan alih-alih bagi, abaikan pembilang, 47 > 7, sisa dalam botol vs liter)
- [x] Tes browser semua 24 soal evaluasi, 24 latihan, 6 lab, skor dan pembahasan di 320/390/768/1280
- [x] Review manusia oleh Mr Iwan pada preview (soal disetujui; materi direvisi; merge diminta 10 Nov 2026)
- [ ] Video: belum ada tautan; panel menampilkan placeholder jujur

Ilustrasi (ember, petak kebun, pohon mangga/jeruk/jambu, kue pastel, botol, gelas, botol jus, kantong gula, cokelat, gelas ukur, timbangan digital) adalah SVG buatan sendiri; tidak ada aset pihak ketiga dan tidak ada dependensi baru.
