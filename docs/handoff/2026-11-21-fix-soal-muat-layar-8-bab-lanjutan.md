# Soal 8 bab muat layar, lanjutan (2026-11-21)

Branch: `fix/soal-muat-layar-8-bab-lanjutan`. Melanjutkan PR #186.

## Lingkup
- `QuizFitLayout`:
  - di HP, tinggi gambar SVG paling tinggi 24vh (sebelumnya 30vh);
  - jarak dan padding sedikit dirapatkan.
- K5B8 (data):
  - Soal "buat piktogram dari tabel" tidak lagi menampilkan tabel dua kali. Angka tabel ditulis langsung di tiap baris piktogram, dan judul tabel tetap tampil.
  - Tabel turus lebih rapat.
  - Kartu data ringkas.
  - Benar/Salah memakai teks 13px di HP.
  - Diagram batang isian dibatasi 24vh di HP.
- K7B6: 4 diagram kecil "pasangkan diagram" tampil sebaris di HP.
- K9B3: kotak vektor lebih kecil.
- K10B2:
  - Gambar segitiga dibatasi 17vh di HP.
  - Baris "Terbaca" disembunyikan di HP; tetap tampil di layar ≥640px.
  - Isian x, y, z sebaris.
- K12B4:
  - Isian rasio lebih sempit di HP.
  - Isian "tinggi garis" berlabel di samping, tidak di atas.
- K2B2: langkah Solusi soal cerita muat satu baris.

## Bukti
- Smoke 8 bab lulus di 320, 390, 768 dan 1280.
- Hasil hook pengukuran tinggi kartu soal sebelum diperiksa:

| Layar | Soal meluap: PR #186 | Soal meluap: sekarang |
| --- | --- | --- |
| 390×844 | 28 | 15 |
| 768×1024 | 0 | 0 |
| 1280×800 | — | 3 |

- Di 390×844, 13 dari 15 soal yang masih meluap hanya kurang dari 35 px.
- Di 1280×800, sisanya K9B3 evaluasi 2 (104 px), K10B2 evaluasi 1 (66 px) dan K7B6 latihan D no. 2 (10 px).

## Sisa
- 390×844: K5B8 evaluasi 1 (tabel turus dari 18 kartu, sekitar 126 px) dan K12B4 latihan A.5 no. 4 (sekitar 77 px).
- 320×640 (HP pendek) masih banyak yang perlu digulir.
