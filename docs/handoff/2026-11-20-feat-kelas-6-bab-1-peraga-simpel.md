# Kelas 6 Bab 1: peraga perkalian dan pembagian pecahan disederhanakan — feat/kelas-6-bab-1-peraga-simpel

## Permintaan
Mr Iwan meminta peraga A.1, A.2, B.1, dan B.2 dibuat lebih sederhana dan mudah dimengerti, sejalan dengan penjelasan "Caranya + contoh" (PR #184).

## Perubahan (`src/components/learn/GradeSixLabs.tsx`)
- Tombol "Langkah berikutnya" bertahap, penggeser (range), dan tombol lompat satu per satu dihapus.
- Setiap peraga kini hanya punya:
  - pilihan pecahan dan satu pengatur angka (− / +);
  - gambar yang langsung berubah;
  - satu baris cara besar dengan pecahan bertumpuk;
  - kalimat singkat;
  - "Coba sendiri".
- A.1 n × pecahan: n batang pecahan, potongan berwarna diberi nomor berurutan. Cara: n × a/b = (n × a)/b = hasil.
- A.2 pecahan × n: benda langsung tersusun dalam kelompok sebanyak penyebut. Kelompok sebanyak pembilang berwarna merah.
- B.1 pecahan ÷ n: kotak 1 utuh dengan arsiran biru dipotong n baris. Satu bagian berwarna merah. Cara: a/(b × n).
- B.2 n ÷ pecahan: garis bilangan dengan semua lompatan langsung tergambar, sisanya berwarna kuning. Cara: balik pecahan, ÷ menjadi ×.
- Teks "Coba bersama" A.1–B.2 disesuaikan (`src/data/grade-six-fractions-decimals.ts`).
- `scripts/smoke-grade-six-fractions-decimals.mjs` disesuaikan dengan peraga baru.

## Validasi (lokal)
- verify PASS.
- eslint dan `npm run build`.
- smoke Kelas 6 Bab 1 lulus di 320/390/768/1280.
- Tangkapan layar keempat peraga di 390 diperiksa.
