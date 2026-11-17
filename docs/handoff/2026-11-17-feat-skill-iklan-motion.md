# Skill iklan motion BeSmartKids (2026-11-17)

- Scope: skill proyek `.claude/skills/bsk-iklan-motion/` untuk membuat iklan motion graphic (tanpa manusia) dan gambar iklan dari referensi + pesan singkat Mr Iwan.
- Isi: `SKILL.md` (alur tafsir pesan, bedah referensi, storyboard, aturan anti-jenuh 3 dari 6 sumbu visual, render, QA, serah terima), `scripts/render.cjs` (render HTML ke MP4 deterministik dengan men-seek animasi CSS per frame), `scripts/ref.sh` (analisis video referensi: potongan adegan, lembar kontak, 3 detik pertama), `kit/kit.css` (animasi dan komponen brand), `contoh/pecahan-kertas-kotak.html` (contoh 12 detik), `references/` (fakta produk yang boleh diklaim, sudut A1–A8, riwayat kreatif, cara merekam aplikasi).
- Validasi: contoh dirender ke MP4 1080x1920 30 fps 12 detik dan diperiksa per frame; `ref.sh` diuji pada video batch 1.
- Tidak mengubah kode aplikasi.
