# Kelas 5 Bab 2 KPK dan FPB: peraga E memakai dua bilangan — fix/kpk-fpb-peraga-dua-bilangan

## Masalah
Peraga subtopik E (Menentukan KPK dan FPB dengan Menggunakan Faktor Prima) hanya membuat pohon faktor untuk satu bilangan. KPK dan FPB tidak pernah dihitung, padahal buku membandingkan dua bilangan (72 dan 150).

## Perubahan
- `TreeLab` (`src/components/learn/GradeFiveKpkFpb.tsx`):
  - Ada dua pohon faktor berdampingan.
  - Pilihan pasangannya: 72 dan 150 seperti di buku, lalu 12 dan 18, 24 dan 36, 60 dan 84, 96 dan 120, serta 15 dan 28 (tanpa faktor bersama).
  - Setelah kedua pohon selesai, faktor prima yang berpasangan diberi warna sama.
  - KPK = yang berpasangan ditulis sekali, lalu semua yang tidak berpasangan (72 dan 150: 1.800).
  - FPB = hasil kali yang berpasangan (72 dan 150: 6). Bila tidak ada pasangan, FPB = 1.
- `FactorTree` mendapat nama tombol per pohon (`Pohon 72 bagi dengan 2`). Pohon di soal tetap memakai `Bagi dengan 2`.
- Teks "Coba bersama" subtopik E disesuaikan.
- `scripts/smoke-grade-five-kpk-fpb.mjs` menguji:
  - salah bagi;
  - 72 dan 150 → KPK 1800, FPB 6;
  - 15 dan 28 → KPK 420, FPB 1.

## Validasi (lokal)
- verify, eslint, `npm run build`.
- smoke Kelas 5 Bab 2 lulus di 320/390/768/1280.
- Screenshot 390 dan 1280 diperiksa.
