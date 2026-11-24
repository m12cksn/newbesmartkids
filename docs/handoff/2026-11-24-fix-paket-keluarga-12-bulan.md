# Paket Keluarga aktif 12 bulan (fix/paket-keluarga-12-bulan)

- Keputusan pemilik (24 Nov 2026): masa aktif Paket Keluarga disamakan dengan halaman Scalev, 12 bulan (sebelumnya 24 bulan di aplikasi).
- `src/lib/packages.ts`: `months: 12` untuk paket `semua` (dipakai panel admin dan pesan WhatsApp).
- `supabase/migrations/20261124100000_bsk_paket_keluarga_12_bulan.sql`: `bsk.grant_package` memberi 12 bulan untuk semua paket. Diterapkan ke project Supabase "bimbel online" setelah PR digabung. Hak akses yang sudah ada (3 baris paket `semua` per 24 Nov) tidak diubah.
- `src/app/syarat-layanan/page.tsx`: teks 12 bulan. `scripts/mock-supabase-auth.mjs`: tiruan memakai 12 bulan.
- Validasi: build produksi, eslint, `smoke-paket-jenjang` dan `smoke-login` lulus di 320 dan 1280 px.
- Melengkapi PR #199 (merge b09c0ed): Paket Keluarga 2 akun, username dari nama anak.
