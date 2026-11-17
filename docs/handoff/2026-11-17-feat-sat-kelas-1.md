# 2026-11-17 feat/sat-kelas-1: Ujian Akhir Tahun (SAT) Kelas 1

## Lingkup
- Pilot SAT per kelas, mulai Kelas 1. Kelas lain menyusul satu per satu setelah pilot disetujui.
- 25 soal dari soal evaluasi Bab 1 sampai Bab 8 Kelas 1, dengan angka, gambar, dan tingkat kesulitan diubah. Tiga soal per bab, satu soal gabungan (Bab 2 dan Bab 7).
- Sebaran tingkat: Sedang 8, Menantang 10, Sangat menantang 7. Bab tidak berurutan, posisi jawaban pilihan 2/3/3.
- Waktu 60 menit. Jawaban otomatis dikumpulkan saat waktu habis.
- Boleh diulang dengan soal yang sama. Nilai terbaik disimpan.
- Ujian yang belum selesai bisa dilanjutkan; percobaan disimpan di localStorage `bsk-ujian:kelas-1-sat` dan nilai terbaik di `bsk-ujian-terbaik:kelas-1-sat`.
- Hanya untuk akun berbayar Kelas 1. Jalur `/kelas/<slug>/ujian-akhir-tahun` sudah dijaga oleh `requirementFor` sebagai akses kelas.
- Nama "SAT" (Sumatif Akhir Tahun) dipakai untuk ujian kenaikan kelas di Kurikulum Merdeka.

## Berkas
- `src/exams/types.ts`: tipe soal dan pemeriksa jawaban yang dipakai bersama.
- `src/exams/registry.tsx`: daftar SAT per kelas.
- `src/exams/kelas-1-sat/`: `data.ts`, `Art.tsx`, `Exam.tsx`.
- `src/components/exam/ExamRunner.tsx`: tampilan ujian, timer, hasil, dan pembahasan.
- `src/app/kelas/[slug]/ujian-akhir-tahun/page.tsx`: halaman ujian.
- `src/app/kelas/[slug]/page.tsx`: kartu "Buka ujian" di bawah daftar bab.
- `src/components/auth/SaveResult.tsx` dan `src/app/api/hasil/route.ts`: jalur SAT diizinkan.
- `supabase/migrations/20261117120000_bsk_results_sat.sql`: memperbarui constraint jalur dan fungsi `bsk_save_result`. **Belum diterapkan ke Supabase**; tanpa migrasi ini nilai SAT tidak tersimpan di akun.
- `scripts/verify-sat-kelas-1.mjs`, `scripts/smoke-sat-kelas-1.mjs`, `.github/workflows/sat-kelas-1-qa.yml`.

## Validasi
- verify: `SAT Kelas 1 OK: 25 soal, tingkat 8/10/7, posisi pilihan 2/3/3` (kunci dihitung ulang dari data gambar).
- eslint dan build produksi lulus.
- smoke pada lebar 320/390/768/1280:
  - jalur klik dari halaman kelas;
  - tombol lanjut terkunci sampai dijawab;
  - 25 soal dijawab dengan satu salah, hasil 24/25 dengan skor 96, dan satu pembahasan;
  - ulangi ujian, nilai terbaik, lanjutkan ujian;
  - waktu habis.
- Setiap soal ditinjau dari tangkapan layar 390px.

## Belum
- Menerapkan migrasi Supabase (menunggu persetujuan).
- Persetujuan pratinjau dan merge.
- SAT Kelas 2 sampai 12.
