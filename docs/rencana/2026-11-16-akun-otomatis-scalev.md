# Rencana: akun otomatis setelah pembayaran Scalev (DRAFT, belum dikerjakan)

Status: ditunda oleh Mr Iwan pada 2026-11-16. Akun Scalev masih paket Lite; fitur webhook Scalev hanya tersedia di paket Basic ke atas. Lanjutkan setelah langganan Scalev naik ke Basic.

## Alur saat ini (manual)
1. Pembeli memesan di https://be-smart-kids.myscalev.com/paket-belajar-besmartkids (halaman HTML Scalev, page id 396427).
2. Notifikasi pesanan masuk ke Telegram Mr Iwan lewat bot milik Scalev (sudah aktif, terverifikasi 2026-11-16).
3. Setelah lunas, admin membuat akun di `/admin` BeSmartKids lalu mengirim username dan PIN ke WhatsApp pembeli.

## Alur yang direncanakan
1. Scalev mengirim webhook `order.created` dan `payment.received` ke `POST /api/webhooks/scalev` (route baru di Next.js).
2. Route memverifikasi header `X-Scalev-Hmac-Sha256` (HMAC-SHA256 Base64 atas raw body, `SCALEV_WEBHOOK_SECRET`), menolak yang tidak cocok.
3. Simpan `unique_id` event dan `order_id` dengan constraint unik agar idempoten (pembayaran bisa memicu `payment.received` saat `paid` dan `settled`).
4. `payment.received` tidak membawa `orderlines`, jadi paket diambil dari `order.created` yang disimpan (atau `final_variants`). Pemetaan paket:
   - BSK Paket SD (bpo 47041, varian 649667): Kelas 1 sampai 6, 1 akun
   - BSK Paket SMP (bpo 47042, varian 649668): Kelas 7 sampai 9, 1 akun
   - BSK Paket SMA (bpo 47043, varian 649669): Kelas 10 sampai 12, 1 akun
   - BSK Paket Keluarga (bpo 47044, varian 649670): semua kelas, 2 akun
   - Jumlah akun Paket Jenjang belum ditetapkan Mr Iwan; konfirmasi sebelum implementasi.
5. Buat akun lewat fungsi Supabase baru yang hanya bisa dipanggil server (kunci rahasia server), meniru `bsk_admin_create` / `bsk_admin_extend` di `src/app/api/admin/route.ts`.
6. Kirim username dan PIN ke Telegram Mr Iwan lewat bot milik BeSmartKids (bukan bot Scalev), format siap diteruskan ke pembeli.

## Yang perlu disiapkan Mr Iwan saat dilanjutkan
- Naik ke paket Scalev Basic (syarat webhook).
- Buat bot di @BotFather, tekan Start di bot itu, simpan token di Vercel sebagai `TELEGRAM_BOT_TOKEN` (jangan dikirim lewat chat).
- Di Scalev: Settings > Developers > Webhooks, pilih `order.created` dan `payment.received`, isi URL webhook, salin Signing Secret ke Vercel sebagai `SCALEV_WEBHOOK_SECRET`.

## Pengujian yang direncanakan
- Uji unit verifikasi tanda tangan dan idempotensi dengan payload contoh dari dokumentasi Scalev.
- Satu pesanan asli kecil dari halaman Scalev sampai akun terkirim ke Telegram.

## Catatan
- Pesanan percobaan 261116KNZOYGF (Paket SD, QRIS, belum dibayar) dibuat Mr Iwan saat menguji notifikasi Telegram.
