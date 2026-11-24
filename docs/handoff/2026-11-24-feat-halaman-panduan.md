# Halaman panduan pemakaian (feat/halaman-panduan)

- Permintaan pemilik: satu halaman cara pemakaian berisi video YouTube, rapi di semua perangkat, supaya pembeli tidak perlu dijelaskan satu per satu.
- Rute `/panduan` (publik, tanpa login): video panduan, 12 langkah tertulis dalam 4 bagian (Masuk ke akun, Belajar per bab, Latihan harian, Lihat hasil belajar), pertanyaan yang sering muncul, dan tombol Hubungi admin.
- Video: `src/lib/tutorial.ts` → `TUTORIAL_VIDEO_URL` (alamat YouTube watch/youtu.be/shorts/embed) dan `TUTORIAL_VIDEO_VERTICAL` (true untuk video 9:16). Selama alamat kosong, tampil panel "Video panduan sedang disiapkan". Embed memakai youtube-nocookie (sudah diizinkan CSP `frame-src`).
- Tata letak: HP/tablet video di atas lalu langkah; layar lebar video menempel di kiri (sticky, tinggi menyesuaikan layar) dan langkah di kanan.
- Jalur ke halaman: menu utama (layar lebar), footer semua halaman, halaman Masuk ("Lihat panduan"), halaman Akun saya, sitemap, serta pesan akun untuk pembeli di panel admin (baris "Cara memakai: …/panduan").
- Uji: `scripts/verify-panduan.mjs` (pengurai alamat YouTube), `scripts/smoke-panduan.mjs` di 320/390/768/1280 (tanpa geser samping, video/panel muat, 12 langkah, pertanyaan, tautan dari footer/masuk/menu); workflow `.github/workflows/panduan-qa.yml`. Lokal: tsc, eslint, build, verify dan smoke lulus.
- Video: https://youtube.com/shorts/Kfl2a4fu568 (diunggah pemilik 24 Nov 2026).
