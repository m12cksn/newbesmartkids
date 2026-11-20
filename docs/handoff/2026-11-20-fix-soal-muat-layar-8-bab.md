# Soal 8 bab muat layar (2026-11-20)

Branch: `fix/soal-muat-layar-8-bab`

## Lingkup
Soal latihan dan evaluasi di 8 bab ini terlalu tinggi, sehingga anak harus menggulir untuk menjawab:
K2B2 penjumlahan-pengurangan, K2B3 bentuk, K5B7 ciri bangun datar, K5B8 data, K7B6 data dan diagram, K9B3 transformasi, K10B2 SPLTV, K12B4 kekongruenan.

- `src/components/learn/QuizFitLayout.tsx` (baru):
  - `QuizFitLayout`: di layar ≥640 px gambar soal dan jawaban berdampingan. Tinggi SVG dibatasi 30vh di HP dan 42vh di layar lebar. Sel tabel dirapatkan. Layar pendek (tinggi ≤700 px) diperkecil sedikit.
  - `RowSelect`: daftar pilih satu baris untuk soal "pasangkan" yang punya lebih dari 3 pilihan panjang.
- Soal pasangkan dengan lebih dari 3 pilihan kini memakai daftar pilih (`combobox`):
  - K5B7: nama segi empat.
  - K7B6: diagram dan tujuannya.
  - K12B4: alasan dalam bukti.
- Soal cerita K2B2 dikerjakan per langkah lewat tab Diketahui, Ditanya, Solusi.
  - Ada tombol "Lanjut ke …".
  - Langkah yang sudah lengkap diberi tanda centang.
- Jawaban dipadatkan:
  - Benar/Salah sebaris dengan pernyataannya.
  - Pilihan teks berupa chip yang membungkus.
  - Garis pasangan K2B3 dan K12B4 lebih rapat.
  - K5B8: tabel turus lebih rapat, piktogram sebaris, kartu data ringkas, dan pilihan diagram 2 kolom.
  - K9B3: 3 pasangan bangun sebaris.
  - K10B2: persamaan muat satu baris.
  - K12B4: petunjuk rasio hanya muncul sekali per soal.
- Smoke yang ikut diperbarui:
  - `smoke-grade-two-add-sub` (tab langkah);
  - `smoke-grade-five-shape-traits`, `smoke-grade-seven-data`, `smoke-grade-twelve-congruence` (pilih dari daftar).

## Bukti
- Semua 8 smoke lulus di 390, 768, 1280 dan 320. Pemeriksaan jawaban, skor dan pembahasan tidak berubah.
- Tinggi kartu soal diukur sebelum jawaban diperiksa, dengan tinggi layar asli. Pengukuran memakai hook Playwright lokal di luar repo.

| Ukuran layar | Soal yang meluap sebelumnya | Soal yang meluap sekarang |
| --- | --- | --- |
| 390×844 | 74 | ±28 |
| 768×1024 | 10 | 0 |
| 1280×800 | 61 | ±5 |

- Luapan terbesar di 390 turun dari ±680 px menjadi ±200 px.

## Sisa
- Masih meluap 100–200 px di 390×844:
  - K5B8 evaluasi 1, 11 dan 24 (membangun tabel turus, piktogram, diagram batang);
  - K10B2 evaluasi 1;
  - K12B4 latihan A.5 no. 4 dan evaluasi 14.
- Bab lain hanya meluap di bawah 100 px.
- Layar 320×640 masih banyak yang perlu digulir.
- Belum dideploy sampai PR digabung.
