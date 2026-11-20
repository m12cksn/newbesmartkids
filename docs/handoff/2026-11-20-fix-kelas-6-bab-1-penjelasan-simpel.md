# Kelas 6 Bab 1: penjelasan perkalian dan pembagian pecahan disederhanakan

Tanggal: 20 November 2026. Branch: `fix/kelas-6-bab-1-penjelasan-simpel`.

## Permintaan
Mr Iwan menilai penjelasan A.1, A.2, B.1, B.2 terlalu berputar-putar. Aturannya sederhana dan berlaku untuk kedua subbab.

## Perubahan
- `src/data/grade-six-fractions-decimals.ts`: `steps` dan `demo` A.1 sampai B.2 ditulis ulang menjadi aturan, contoh, catatan.
  - Perkalian: n × a/b = (n × a)/b dan a/b × n = (a × n)/b (pembilang dikali bilangan asli, penyebut tetap).
  - Pembagian: a/b ÷ n = a/(b × n); n ÷ a/b = n × b/a (balik pecahan, lalu kalikan).
- `src/components/learn/GradeSixLabs.tsx`: teks hasil peraga A.1, A.2, B.1, B.2 dipersingkat. Tombol, peraga, soal, dan evaluasi tidak berubah.

## Validasi
- `node --experimental-strip-types scripts/verify-grade-six-fractions-decimals.mjs`: PASS.
- Frasa yang dicek `scripts/smoke-grade-six-fractions-decimals.mjs` dipertahankan ("9 potongan", "disusun menjadi 2 utuh", "Terlalu banyak", "Bandingkan:", "12 potongan kecil", "lebih kecil dari", "7 lompatan penuh").
- Belum dijalankan lokal: build, smoke Playwright, dan tangkapan layar (tidak ada node_modules dan jaringan nonaktif). Mengandalkan CI.

## Lanjutan (permintaan Mr Iwan: pecahan tanpa garis miring, cara paling sederhana)
- `steps` A.1 sampai B.2 kini memakai kata-kata, bukan rumus huruf (n, a, b):
  - "Caranya" + satu contoh angka;
  - A.1 dan A.2: kalikan pembilang dengan bilangan asli, penyebut tetap;
  - B.1: pembilang tetap, kalikan penyebut dengan bilangan asli;
  - B.2: balik pecahannya, lalu ubah ÷ menjadi ×.
- `MathText` (`src/components/learn/GradeSixVisuals.tsx`) kini menampilkan `(3 × 3)/4` dan `2/(3 × 4)` sebagai pecahan bertumpuk, selain `3/4`. Hasilnya, penjelasan materi, teks peraga, dan pembahasan soal di bab ini tidak lagi menampilkan garis miring.
- Validasi lokal:
  - verify PASS;
  - `npm run build` lulus;
  - smoke Kelas 6 Bab 1 lulus di 320/390/768/1280;
  - tangkapan layar penjelasan A.1 dan B.2 diperiksa.

## Status
Siap merge setelah CI lulus.
