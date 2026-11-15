# feat/kertas-coret (kertas coret digital)

## Lingkup
- `src/components/learn/ScratchPad.tsx`: tombol "Kertas coret" di pojok kanan bawah; kertas petak 24px. Di HP muncul dari bawah (55% tinggi layar, pegangan bisa ditarik 30–88%, halaman diberi padding bawah agar soal tetap bisa digulir); di layar ≥900px muncul sebagai panel kanan 440px dengan padding kanan pada halaman.
- Alat: Pensil, Pulpen merah, Penghapus (menghapus coretan yang disentuh), Urungkan (juga Ctrl/Cmd+Z), Kertas baru (maks. 10), pindah kertas, Hapus coretan (konfirmasi), Tutup (juga Esc).
- `touch-action: none` di kanvas agar halaman tidak bergeser saat menulis; sentuhan jari diabaikan 1,5 detik setelah stylus dipakai (telapak tangan); ketebalan stylus mengikuti tekanan.
- Coretan disimpan di localStorage per alamat halaman (`bsk-coret:<path>`), tidak dikirim ke server, tidak dinilai.
- Dipasang lewat layout baru: `src/app/kelas/[slug]/materi/[materiSlug]/layout.tsx`, `src/app/mastering-penjumlahan-pengurangan/[level]/layout.tsx`, `src/app/mastering-perkalian-pembagian/[level]/layout.tsx` (dibungkus Suspense karena memakai `usePathname`).

## Validasi
- eslint, build.
- `scripts/smoke-scratchpad.mjs` lulus lokal di 320/390/768/1280: buka, coretan mouse, coretan sentuh (CDP) tanpa menggulir halaman, urungkan, pulpen, penghapus, kertas baru, pindah kertas, tersimpan setelah muat ulang, Esc, hapus kertas, latihan harian.
- `smoke-grade-three-math-sentences` tetap lulus.
- Workflow `.github/workflows/scratchpad-qa.yml`.
