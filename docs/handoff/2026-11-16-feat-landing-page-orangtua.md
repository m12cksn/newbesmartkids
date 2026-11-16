# Landing page paket belajar (feat/landing-page-orangtua)

## Ruang lingkup
- Halaman baru `/paket-belajar` untuk orang tua (iklan dan penjualan). Susunan halaman mengikuti referensi yang dikirim pengguna (pembuka dengan demo di bingkai ponsel, masalah di rumah, cara belajar bertahap, isi per jenjang, perbandingan dengan les, paket, FAQ, bar beli di bawah layar HP), tetapi semua teks, gambar, warna, dan ikon milik BeSmartKids. Tidak ada teks, gambar, atau testimoni yang disalin dari referensi.
- Angka di halaman dihitung dari data (jumlah bab, kelas yang punya bab). Kelas tanpa bab (Kelas 11) tidak ditampilkan.
- Demo tiga soal (benda, gambar, angka) dengan jeruk dan batang yang digambar SVG.
- Paket diambil dari `src/lib/packages.ts`; paket SMA diaktifkan (`onSale: true`) atas permintaan pengguna.
- Tombol beli memakai `accessUrl()` (Scalev jika `NEXT_PUBLIC_SCALEV_URL` diisi, selain itu WhatsApp admin).
- Tautan masuk: menu "Paket" di header (desktop) dan tombol "Lihat paket belajar" di bagian penutup beranda (semua layar). Ditambahkan ke sitemap.

## Berkas
- `src/app/paket-belajar/page.tsx`, `src/components/landing/{ParentLanding,LandingDemo,JenjangTabs}.tsx`
- `src/lib/packages.ts`, `src/components/home/SiteHeader.tsx`, `src/components/home/CallToAction.tsx`, `src/app/sitemap.ts`
- `scripts/smoke-landing-paket.mjs`, `.github/workflows/landing-paket-qa.yml`

## Validasi
- Lint, typecheck, build produksi lulus; `smoke-landing-paket.mjs` lulus di 320/390/768/1280 (tautan dari beranda, demo, tab jenjang, 4 paket, FAQ, tanpa scroll horizontal); smoke halaman kelas lulus.

## Status
- Draft PR untuk dilihat pengguna di preview sebelum di-merge. Belum ada foto dan URL Scalev dari pengguna.
