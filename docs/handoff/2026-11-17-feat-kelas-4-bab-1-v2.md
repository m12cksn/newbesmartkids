# Kelas 4 Bab 1 Bilangan Cacah sampai 10.000 (timpa versi lama)

Cabang: `feat/kelas-4-bab-1-v2`. Sumber: PDF Matematika SD/MI Kelas IV hal. 1–54, dikirim Mr Iwan.

## Ruang lingkup
- Sembilan subtopik dengan satu peraga masing-masing:
  - A membaca/menulis (kartu angka dan cara baca),
  - B nilai tempat (balok bilangan),
  - C membandingkan (tabel nilai tempat dan tanda),
  - D komposisi/dekomposisi (uang Rp2.000, Rp1.000, Rp500, Rp100),
  - E penjumlahan dan F pengurangan (susun pendek langkah demi langkah),
  - G perkalian (kotak donat dengan cara panjang),
  - H pembagian (bagi permen ke wadah, ada sisa),
  - I faktor (susunan persegi panjang) dan kelipatan (papan 1–50).
- Latihan 4 soal per subtopik (36). Evaluasi 24 soal, tingkat 8/9/7, subtopik bergantian, 12 soal beraksi (tabel nilai tempat, susun pendek, pembagian bersusun, tarik garis, urutkan, pilih faktor/kelipatan).
- Bentuk soal mengikuti buku: tulis dan baca bilangan (odometer, tinggi gunung), hubungkan bilangan dan nama, nilai tempat angka, tanda >, <, =, urutkan tinggi gunung, kartu angka, uraian ribuan-ratusan-puluhan-satuan, uang, susun panjang/pendek, tarik garis hasil, soal cerita, pembagian bersusun, faktor, kelipatan.

## Berkas
- `src/data/grade-four-whole-10k.ts`, `src/components/learn/GradeFourWhole10k.tsx`, `src/chapters/kelas-4-bilangan-cacah-10000/{meta.ts,Chapter.tsx}`.
- `scripts/verify-grade-four-whole-10k.mjs`, `scripts/smoke-grade-four-whole-10k.mjs`, `.github/workflows/grade-four-whole-10k-qa.yml`.
- Dihapus: `GradeFourWholeNumbers.tsx`, skrip `smoke-grade-four-whole-numbers.mjs` dan `verify-grade-four-whole-upgrade.mjs`, workflow `grade-four-whole-upgrade-qa.yml`, entri `materials.ts`, cabang `if` di halaman materi.
- `src/data/grade-four-whole-numbers.ts` TIDAK dihapus karena tipe `Question` di dalamnya dipakai banyak bab lain.

## Validasi
- Verify: kunci, susunan soal, isian dihitung ulang dari kalimatnya, cara baca, nilai tempat, tanda dan urutan, kartu angka (semua susunan), uang paling sedikit, kelompok dan pembagian, faktor dan kelipatan.
- Smoke lokal 320×640, 390×844, 768×1024, 1280×800 lulus dengan font lebar: jalur klik dari halaman kelas, 9 peraga, 36 latihan, 24 evaluasi, muat layar sebelum diperiksa, skor dan pembahasan.

## Sisa
- Video belum ada (panel placeholder).
