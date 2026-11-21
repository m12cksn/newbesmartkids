# Berhitung bersusun: desain baru (2026-11-21)

Branch: `feat/berhitung-bersusun-desain-baru`

## Alasan
Mr Iwan meminta layout dan warna `/mastering-berhitung-bersusun` dibuat berbeda karena terlalu mirip produk lain. Gaya lamanya: garis hitam tebal, bayangan keras, sorotan kuning dan ubin warna-warni. Cara belajar dan cara mengerjakan tetap sama.

## Perubahan (hanya `src/components/mastering/ColumnPractice.tsx`)
- **Layout:**
  - Di laptop: panel pengaturan menempel di kiri (jenis soal, tingkat, sakelar kotak bantu/papan angka, cara menghitung, progres). Lembar soal di kanan.
  - Di HP: pengaturan dalam satu kartu di atas, dengan jenis soal berupa chip.
- **Warna:** hijau BeSmartKids #208f6d. Garis tipis #dbe7e1, latar #f3f7f5 dan kartu putih tanpa bayangan keras.
- **Area hitung:** kertas berpetak.
  - Kolom aktif disorot hijau muda.
  - Petunjuk dan pembahasan memakai garis kuning di kiri.
  - Salah ditandai merah magenta.
- **Kartu soal:** kepala berisi "Soal n" dan status Benar/Belum tepat. Kotak nomor berwarna-warni dihapus.
- **Ikon:** lucide sesuai nama (Plus, Minus, X, Divide, BookOpen), tanpa ubin warna.
- **Tombol:** Periksa memakai `btn-primary`, Coba lagi `btn-outline`, Bantu `btn-ghost`. Papan angka dibuat lembut.
- **Tidak berubah:** semua label aksesibilitas, urutan kursor, logika soal, penyimpanan dan penilaian.

## Bukti
- `tsc`, `eslint` dan build lulus.
- `smoke-berhitung-bersusun` lulus di 320, 390, 768 dan 1280. Smoke ini menguji ketik kanan ke kiri, pinjaman, simpanan per baris, soal cerita, porogapit dengan papan angka dan penyimpanan.
