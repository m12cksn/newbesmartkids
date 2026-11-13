# Laporan orang tua (feat/parent-report)

Sebelumnya: PR #115 (simpan nilai semua bab) di-merge sebagai 24fcd57 dan sudah tayang.

## Isi
- `supabase/migrations/20261113170000_bsk_reports.sql`: tabel `bsk.report_links` (hanya hash kode, 30 hari) dan RPC `bsk_report_link`, `bsk_report_status`, `bsk_report_revoke`, `bsk_report_public`, `bsk_admin_report`, `bsk_my_report`.
- `src/lib/report.ts`: ringkasan (30 hari, 8 minggu, status per bab, latihan harian, saran).
- `src/components/report/*`: tampilan laporan, panel bagikan, laporan admin.
- Rute: `/akun/laporan`, `/laporan/[kode]` (tanpa login, noindex, no-referrer), `/admin/laporan/[id]`, `/api/laporan`, aksi `report` di `/api/admin`.
- Tautan: "Laporan belajar" di Akun saya, "Laporan" per akun di kelola akun.

## Validasi
- tsc, eslint (berkas baru), `npm run build`.
- `scripts/smoke-login.mjs` dengan mock (320 dan 1280): laporan tampil, tautan dibuat dan dibuka tanpa login, robots noindex, tautan dicabut lalu tidak ditemukan, kode salah, admin membuka laporan siswa.

## Status
- Migrasi sudah diterapkan ke Supabase (bsk_reports); kode palsu, kode salah format dan token palsu diperiksa mengembalikan null atau error session.
