# Pesan sambutan pembeli dan ubah data akun (feat/admin-pesan-ubah-akun)

- Permintaan pemilik (24 Nov 2026):
  1. Pesan yang muncul setelah admin membuat akun memakai template pemilik (sapaan Ayah/Bunda, detail paket, blok username/PIN per akun, tautan masuk https://www.besmartkids.id/masuk, video tutorial, info video pembelajaran 1–10 Des 2026, ajakan affiliate hingga 16%, catatan simpan PIN).
  2. Admin dapat mengubah nama dan username siswa bila salah ketik.
- `src/lib/welcome-message.ts`: `welcomeMessage()` (format WhatsApp: *tebal*, `kode`, _miring_; nama panggilan = kata pertama nama anak; Paket Keluarga menampilkan 2 blok akun) dan `resetPinMessage()`. Paragraf info video otomatis tidak dikirim lagi mulai 11 Des 2026. `PUBLIC_URL` = https://www.besmartkids.id.
- `src/lib/packages.ts`: teks `access` per paket untuk pesan.
- Panel admin: formulir pesanan Scalev dan formulir satu akun (kini berisi "Nama anak" dan "Nama orang tua" untuk sapaan) memakai template baru; Reset PIN memakai pesan PIN baru. Tombol "Ubah data" per akun untuk nama anak, username, nomor WhatsApp, catatan (PIN, paket, sesi tidak berubah). Label "Semua kelas, 2 tahun" diperbaiki menjadi 1 tahun.
- Database: `supabase/migrations/20261124120000_bsk_admin_update_account.sql` → `public.bsk_admin_update_account` (cek admin, format username, username unik). Diterapkan ke project "bimbel online".
- API `/api/admin` aksi `update`; server tiruan `scripts/mock-supabase-auth.mjs` ikut diperbarui.
- Uji lokal: tsc, eslint, build; smoke-login, smoke-paket-jenjang (termasuk ubah nama/username, username bentrok, template pesan) dan smoke-renewal lulus di 320 dan 1280 px.
