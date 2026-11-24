# Paket Keluarga 2 akun, username dari nama anak (fix/paket-keluarga-username-anak)

- Permintaan pemilik: Paket Keluarga hanya 2 akun; username setiap akun memakai nama anak, bukan nama pembeli (pembeli biasanya ibunya).
- `src/lib/packages.ts`: paket `semua` bernama "Paket Keluarga", 2 akun (sebelumnya "Paket Semua Kelas", 3 akun). Harga Rp129.000 dan masa aktif 24 bulan tidak diubah.
- `src/app/api/admin/route.ts` (`createBundle`): nama anak wajib untuk setiap akun (`bad_name` bila kosong). Username = nama anak (huruf kecil, tanpa spasi/tanda, maks. 10 huruf) + 3 angka acak, misalnya Nisa menjadi `nisa482`; bila sudah dipakai dicoba hingga 5 kali dengan angka lain. Nama pembeli tetap dipakai untuk sapaan pesan WhatsApp.
- `src/components/auth/OrderForm.tsx`: kolom nama anak wajib, tombol "Buat N akun" aktif setelah semua nama terisi, keterangan bahwa username dibuat dari nama anak.
- `src/app/syarat-layanan/page.tsx`: teks paket diperbarui menjadi Paket Keluarga 2 akun.
- Akun yang sudah ada tidak diubah.
- Validasi: tsc, eslint (berkas yang diubah), build produksi; `scripts/smoke-paket-jenjang.mjs` (SD Dika/Nara, Keluarga Rafi/Alya; pola username dicek) dan `scripts/smoke-login.mjs` lulus di 320 dan 1280 px dengan `scripts/mock-supabase-auth.mjs`.
- Catatan terbuka: halaman Scalev menulis akses 1 tahun untuk Paket Keluarga, sedangkan aplikasi memberi 24 bulan; belum diselaraskan, menunggu keputusan pemilik.
