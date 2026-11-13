# feat/teacher-package (poin 8: paket sekolah dan guru)

## Lingkup
- Migrasi `supabase/migrations/20261114090000_bsk_teacher.sql`: peran `teacher`, tabel `bsk.groups` (kelas sekolah) dan `bsk.group_members`, fungsi admin (`bsk_admin_set_role`, `bsk_admin_groups`, `bsk_admin_group_save/delete/add/remove`, `bsk_admin_bulk_create`) dan guru (`bsk_teacher_overview`, `bsk_teacher_report`).
- Admin (`/admin`): tombol Jadikan guru/Jadikan siswa, bagian "Kelas sekolah" (buat, ganti guru/kelas, masukkan siswa lewat username, buat sampai 60 akun siswa sekaligus dengan daftar username/PIN yang bisa disalin dan dicetak, keluarkan siswa, hapus kelas sekolah).
- Guru (`/guru`): rekap nilai evaluasi terbaik per siswa per bab, rata-rata kelas, bab yang perlu diulang, siswa yang belum belajar 7 hari, unduh CSV, cetak, laporan siswa di `/guru/laporan/[id]`. Proxy menolak siswa (`alasan=guru`). Tautan "Rekap kelas" di Akun saya.
- PR #124 (poin 7) ter-merge setelah hanya 1 check terdaftar karena bug skrip pemantau; CI lengkap master dicek terpisah. Skrip pemantau sekarang menunggu minimal 40 check.

## Validasi
- `scripts/sql/verify-teacher.sql` lulus di Postgres 16 lokal setelah semua migrasi.
- `scripts/verify-teacher.mjs`, `scripts/smoke-teacher.mjs` (alur admin, siswa, guru; 320/390/768/1280), plus `smoke-login` dan `smoke-renewal` lulus lokal.
- Workflow `.github/workflows/teacher-package-qa.yml` (job SQL dengan service postgres:16 dan job browser).

## Status
- Migrasi BELUM diterapkan ke Supabase produksi: pemanggilan apply_migration menunggu konfirmasi pengguna dan habis waktu. Jangan merge sebelum migrasi diterapkan.
