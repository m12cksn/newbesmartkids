# Berhitung bersusun: penuh warna per jenis soal (2026-11-21)

Branch: `feat/berhitung-bersusun-warna`. Lanjutan PR #190.

## Alasan
Mr Iwan ingin halaman tetap penuh warna, tetapi tidak persis seperti produk lain.

## Perubahan (hanya `src/components/mastering/ColumnPractice.tsx`)
- `THEME` memberi setiap jenis soal warna sendiri:
  - tambah: teal #0b7a75
  - kurang: merah muda #c2255c
  - kali: oranye #b53a0a
  - bagi: biru #3b5bdb
  - soal cerita: ungu #7048e8
- Warna dipasang sebagai variabel CSS (`--c`, `--s`, `--g`, `--p`) dan dipakai di:
  - latar halaman dan garis bawah header;
  - kata "bersusun" pada judul;
  - chip jenis soal, yang masing-masing tetap berwarna sendiri;
  - tingkat terpilih, sakelar, dan kotak cara menghitung;
  - kepala kartu soal, dengan nomor dalam lingkaran;
  - garis kertas berpetak dan sorotan kolom;
  - tombol Periksa, Bantu dan Coba lagi;
  - papan angka.
- Semua kontras teks putih di atas warna utama minimal 4,5:1.
- Benar tetap hijau. Salah memakai merah #e03131, berbeda dari merah muda tema Kurang.
- Gaya yang mirip produk lain tidak dipakai:
  - garis hitam tebal;
  - bayangan keras;
  - sorotan kuning;
  - ubin ikon kotak warna-warni.

## Bukti
- `tsc`, `eslint` dan build lulus.
- `smoke-berhitung-bersusun` lulus di 320, 390, 768 dan 1280.
