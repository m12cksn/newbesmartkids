# Berhitung bersusun harian (feat/berhitung-bersusun)

## Ruang lingkup
- Halaman baru `/mastering-berhitung-bersusun`: latihan hitung bersusun Tambah, Kurang, Kali, Bagi, dan Soal cerita, tiga tingkat (Mudah Kelas 2–3, Sedang Kelas 3–4, Sulit Kelas 4–6), tujuh soal per jenis dan tingkat.
- Soal berganti setiap pukul 00.00 WIB dan sama untuk semua anak pada hari yang sama (dihitung dari tanggal, jenis, dan tingkat di `src/lib/daily-column.ts`). Jawaban tersimpan di perangkat per jenis dan tingkat; paket hari sebelumnya tetap bisa diselesaikan.
- Kotak hasil diisi dari kanan ke kiri (bagi dari kiri ke kanan) dengan kursor pindah otomatis; kotak simpanan/sisa opsional; kali dua angka memakai baris hasil sebagian; soal cerita meminta memilih operasi dulu. Setiap soal diperiksa sendiri, kolom yang salah ditandai, dan pembahasan per kolom tersedia. Bintang di kepala halaman = jumlah jawaban benar hari ini. Hasil tersimpan ke akun lewat `SaveResult` setelah tujuh soal diperiksa.
- Akses sama dengan Mastering lain (akun berpaket; aturan `mastering-*`), ditambahkan ke matcher `src/proxy.ts`. Kartu ketiga di bagian Mastering Matematika Harian beranda, dan sitemap.
- Tampilan dan teks milik BeSmartKids; susunan terinspirasi contoh yang dikirim pengguna (tanpa koin, nyawa, atau suara).

## Berkas
- `src/lib/daily-column.ts`, `src/components/mastering/ColumnPractice.tsx`, `src/app/mastering-berhitung-bersusun/page.tsx`
- `src/components/home/DailyPracticeCard.tsx`, `src/proxy.ts`, `src/app/sitemap.ts`
- `scripts/verify-berhitung-bersusun.mjs`, `scripts/smoke-berhitung-bersusun.mjs`, `.github/workflows/berhitung-bersusun-qa.yml`

## Validasi
- Verify: 6.300 soal dalam 60 hari (5 jenis × 3 tingkat), kunci benar, tanpa soal kembar, ada simpanan/pinjaman, soal cerita memuat empat operasi, berganti setiap hari, tingkat makin sulit.
- Build lulus; smoke lulus di 320/390/768/1280 (tautan beranda, kursor kanan ke kiri, periksa, pembahasan, tersimpan setelah muat ulang, soal cerita, kali dua angka, bagi); smoke beranda dan SEO lulus.

## Status
- Draft PR, menunggu persetujuan preview dari pengguna.
