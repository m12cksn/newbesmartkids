# Pengingat perpanjangan paket (feat/renewal-reminder)

- Poin 2 dari daftar fitur bisnis. Tanpa perubahan database: memakai data paket dari `bsk_admin_list` dan `bsk_session`.
- `src/lib/renewal.ts`: satu pengingat per paket (per kelas atau semua kelas) memakai tanggal berakhir terakhir; masuk daftar jika berakhir dalam 14 hari atau sudah berakhir dalam 30 hari terakhir; paket yang sudah diperpanjang, akun nonaktif, admin, dan paket kelas yang tertutup paket semua kelas tidak diingatkan. Pesan WhatsApp untuk paket yang segera berakhir dan yang sudah berakhir.
- Admin (`/admin`): bagian "Pengingat perpanjangan" di atas daftar akun, dengan tombol "Kirim pengingat" (wa.me dengan pesan siap kirim ke nomor orang tua) dan "Tambah paket" (membuka form perpanjangan akun itu).
- Siswa (`/akun`): pemberitahuan jika paket berakhir dalam 14 hari atau tidak ada paket aktif, dengan tombol WhatsApp ke admin bila `NEXT_PUBLIC_ADMIN_WA` diisi.
- Pengiriman masih manual lewat tombol WhatsApp (tidak ada API WhatsApp otomatis).
- Mock: tiga akun contoh (hampirhabis 222222, sudahhabis 333333, masihlama 444444). Tes: `scripts/verify-renewal.mjs` (aturan pengingat) dan `scripts/smoke-renewal.mjs` (admin dan siswa, 320/1280), ditambahkan ke `.github/workflows/login-qa.yml`. Smoke login lama tetap lulus.
- Bergantung pada PR #121 (halaman kebijakan, `src/lib/contact.ts`); branch ini sudah menggabungkannya.
- Berikutnya: poin 1 (pembayaran Scalev). Dokumentasi Scalev tidak dapat diakses dari lingkungan ini; perlu data akun Scalev dari pengguna.
