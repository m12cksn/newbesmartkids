# feat/paket-jenjang (paket baru dan pesanan Scalev)

## Lingkup
- `src/lib/packages.ts`: daftar paket. Paket Jenjang SD (kelas 1–6) / SMP (7–9) / SMA (10–12) Rp79.000, 2 akun, 12 bulan; Paket Semua Kelas Rp129.000, 3 akun, 24 bulan. SMA `onSale: false` karena bab kelas 10–12 belum ada. Tautan Scalev dari `NEXT_PUBLIC_SCALEV_JENJANG_URL` dan `NEXT_PUBLIC_SCALEV_SEMUA_URL`; jika kosong, tombol beli membuka WhatsApp admin.
- `src/app/api/admin/route.ts` aksi `bundle`: membuat semua akun satu pesanan. Jenjang memakai paket `kelas` untuk setiap kelas (via `bsk_admin_create` + `bsk_admin_extend`), semua kelas memakai `semua`. Tanpa migrasi database.
- `src/components/auth/OrderForm.tsx`: form "Buat akun dari pesanan Scalev" di /admin, hasilnya satu pesan WhatsApp berisi semua username/PIN. Form akun satuan lama dipindah ke bagian yang bisa dibuka.
- Daftar akun dan pengingat perpanjangan menggabungkan kelas yang berakhir pada tanggal sama ("Kelas 1–6").
- Halaman depan (#paket): dua kartu harga dan tombol beli; FAQ, langkah, dan Syarat Layanan disesuaikan.

## Validasi
- `verify-renewal`, eslint file yang diubah, build.
- Lokal lulus: `smoke-login`, `smoke-renewal`, `smoke-paket-jenjang` (320/1280: pesanan SD 2 akun, semua kelas 3 akun, akun SD membuka kelas 3 dan ditolak di kelas 7, akun semua kelas membuka kelas 9, harga di beranda), `smoke-parent-landing-seo`.

## Yang harus dilakukan pemilik
- Isi `NEXT_PUBLIC_SCALEV_JENJANG_URL` dan `NEXT_PUBLIC_SCALEV_SEMUA_URL` di Vercel dengan tautan produk Scalev, lalu redeploy.
- Pembuatan akun masih manual dari panel admin setelah pembayaran masuk (belum webhook Scalev).
