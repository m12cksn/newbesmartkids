# Paket Jenjang 1 akun (fix/paket-jenjang-1-akun)

- Keputusan pemilik (24 Nov 2026): Paket Jenjang SD, SMP dan SMA masing-masing hanya 1 akun (sebelumnya 2). Paket Keluarga tetap 2 akun, 12 bulan.
- `src/lib/packages.ts`: `accounts: 1` untuk `sd`, `smp`, `sma`. Formulir pesanan di panel admin otomatis menampilkan satu kolom nama anak dan tombol "Buat 1 akun".
- `src/app/syarat-layanan/page.tsx`: "Paket Jenjang berisi 1 akun" (SD, SMP, atau SMA).
- `scripts/smoke-paket-jenjang.mjs`: pesanan SD dengan 1 nama anak.
- Akun yang sudah ada tidak diubah.
- Validasi lokal: eslint, build, smoke-paket-jenjang, smoke-login, smoke-renewal lulus.
