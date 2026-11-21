# Daftar tunggu pekerjaan (2026-11-21)

Catatan ini berisi pekerjaan yang sudah dibahas dengan Mr Iwan tetapi belum dikerjakan atau belum digabung. Satu butir dikerjakan dalam satu PR terpisah setelah Mr Iwan memberi tanda mulai. Kalau sebuah butir selesai, coret di sini.

## 1. Soal muat satu layar: sisa luapan
Lanjutan PR #186, #187 dan #188. Pengukuran memakai tinggi layar asli dan mengukur kartu soal sebelum jawaban diperiksa.

- [ ] **HP 390×844.** Semua soal di 8 bab paling banyak lebih ±35 px. Yang masih lebih sedikit:
  - K7B6 evaluasi 17, 21, 23 dan 24
  - K5B8 evaluasi 24
  - K12B4 latihan A.5 no. 4
  - K2B3 evaluasi 20
  - K5B7 evaluasi 23
- [ ] **Laptop 1280×800:**
  - K9B3 evaluasi 2: lebih ±104 px
  - K10B2 evaluasi 1: lebih ±66 px
- [ ] **HP pendek 320×640.** Masih banyak soal yang perlu digulir. Jumlah soal yang meluap dan luapan terbesar per bab:

  | Bab | Soal meluap | Luapan terbesar |
  | --- | --- | --- |
  | K2B2 | 9 | 213 px |
  | K2B3 | 10 | 151 px |
  | K5B7 | 13 | 231 px |
  | K5B8 | 14 | 202 px |
  | K7B6 | 34 | 199 px |
  | K9B3 | 12 | 129 px |
  | K10B2 | 15 | 138 px |
  | K12B4 | 18 | 261 px |

  Kemungkinan cara memperbaikinya:
  - zoom layar pendek yang lebih kuat;
  - gambar soal yang bisa dilipat;
  - langkah per tab seperti soal cerita K2B2.
- [ ] **Bab lain.** Bab di luar 8 bab ini belum diaudit ulang dengan alat ukur yang sama.

## 2. Persiapan peluncuran (dari daftar periksa peluncuran)
- [ ] **Akun otomatis setelah pembayaran.** Akun dibuat manual atau otomatis lewat Scalev. Rencananya ada di draft PR #147.
- [ ] **Tombol "Lanjut →" di kuis bersama.** `GradeFourQuiz.tsx` masih memakai panah teks, padahal aturan desain meminta ikon lucide `ArrowRight`. Kuis ini dipakai banyak bab, jadi uji smoke yang mencari nama tombol "Lanjut →" ikut diperbarui.
- [ ] **Kelas 11.** Putuskan apakah Kelas 11 disembunyikan dari navigasi selama materinya belum lengkap.

## 3. Draft PR yang masih menunggu keputusan
- [ ] #152 Ujian Akhir Tahun (SAT) Kelas 1: tetap draft sampai Mr Iwan menyetujui.
- [ ] #151 Draft iklan Meta November 2026.
- [ ] #147 Rencana akun otomatis setelah pembayaran Scalev.
- [ ] #141 Halaman paket belajar untuk orang tua.
- [ ] #132 Kertas coret: garis lebih halus.
- [ ] #175 Kelas 4 Bab 3: peraga pola bilangan mengecil.
- [ ] Draft lama #4 sampai #32 (Kelas 1 versi awal). Kemungkinan sudah tergantikan oleh bab-bab baru, jadi tinggal diputuskan ditutup atau tidak.

## Cara memakai
- Buka PR draft "Daftar tunggu pekerjaan" di GitHub untuk melihat daftar ini.
- Untuk mulai mengerjakan satu butir, sebutkan nomor dan judulnya, misalnya "kerjakan 2. Tombol Lanjut".
