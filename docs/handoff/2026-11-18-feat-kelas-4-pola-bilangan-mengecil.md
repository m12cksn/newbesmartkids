# Handoff 2026-11-18: feat/kelas-4-pola-bilangan-mengecil

## Scope
Peraga B (pola bilangan) pada Kelas 4 Bab 3 sekarang punya dua tombol, "Pola membesar" (3, +2) dan "Pola mengecil" (30, −5), sehingga contoh pola mengecil langsung terlihat.

- File: `src/components/learn/GradeFourPatternsV2.tsx` (`NumberLab`, `Stepper` dapat prop `plus`), `scripts/smoke-grade-four-patterns-v2.mjs`.
- Batas baru: bilangan awal dan selisih saling menjaga sehingga bilangan berikutnya (awal + 5 × selisih) tidak pernah kurang dari 0. Pesan "kurang dari 0" dan kotak "–" dihapus karena kondisinya tidak bisa terjadi lagi.

## Validation
- Pemeriksaan batas dengan skrip node: tidak ada kombinasi yang menghasilkan bilangan negatif.
- Belum dijalankan: eslint, `npm run build`, smoke Playwright (node_modules tidak tersedia di sesi ini). Jalankan lewat CI.

## Remaining
- Periksa tampilan di 320/390/768/1280 dan persetujuan preview sebelum merge.
