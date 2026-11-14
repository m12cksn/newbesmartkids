# feat/learning-only (website khusus belajar, penjualan lewat Scalev)

## Lingkup
- Bagian harga "Untuk orang tua" (`ParentInfo`) dan menu "Paket" dihapus dari beranda. Beranda hanya berisi kelas, materi, latihan harian.
- `accessUrl()` di `src/lib/packages.ts`: tautan halaman penjualan Scalev dari `NEXT_PUBLIC_SCALEV_URL`; jika kosong, membuka WhatsApp admin.
- Tombol/tautan "Dapatkan akses" hanya di halaman Masuk (belum punya akun, atau kelas belum dibeli), kotak evaluasi terkunci, dan pemberitahuan perpanjangan di Akun saya ("Perpanjang paket", dengan pengingat menulis username saat membayar).
- Form pesanan Scalev multi-akun di /admin dan rincian paket di Syarat Layanan tetap.

## Validasi
- eslint file yang diubah, build.
- Lokal lulus: smoke-login, smoke-renewal, smoke-paket-jenjang (memeriksa tombol Dapatkan akses), smoke-parent-landing-seo (beranda tanpa harga/menu Paket), smoke-homepage.

## Yang harus dilakukan pemilik
- Isi `NEXT_PUBLIC_SCALEV_URL` di Vercel dengan tautan halaman penjualan Scalev, lalu redeploy. Variabel lama `NEXT_PUBLIC_SCALEV_JENJANG_URL`/`_SEMUA_URL` tidak dipakai lagi.
