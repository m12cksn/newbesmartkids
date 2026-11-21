# Pixel Meta di halaman orang tua (2026-11-21)

Branch: `feat/meta-pixel-orang-tua`. Disetujui Mr Iwan sebagai langkah 1 rencana pemasaran (draft PR #193).

## Perubahan
- `src/lib/meta-pixel.ts`:
  - ID pixel `916155404185090`, sama dengan pixel Scalev.
  - Pixel hanya aktif di domain produksi `besmartkids.id` dan `www.besmartkids.id`.
  - `pixelPage()` menentukan halaman yang boleh memakai pixel: beranda, halaman kelas, dan Bab 1 gratis.
- `src/components/analytics/MetaPixel.tsx`:
  - Skrip dimuat dengan `autoConfig` mati (tanpa pelacakan klik otomatis) dan `disablePushState` (tanpa PageView otomatis saat pindah halaman).
  - Mengirim `PageView` di halaman yang diizinkan.
  - Mengirim `StartTrial {content_name: slug}` saat Bab 1 gratis dibuka.
  - Tidak pernah berjalan bila pengguna sudah masuk (siswa atau admin).
- `src/app/layout.tsx`: `<MetaPixel />` dipasang di dalam `Suspense`, karena memakai `usePathname`.
- `next.config.ts`: CSP mengizinkan `connect.facebook.net` (skrip dan koneksi) serta `www.facebook.com` (gambar dan koneksi).
- `src/app/kebijakan-privasi`:
  - Bagian baru "Pengukuran iklan (Pixel Meta)" menjelaskan apa yang dikirim dan tidak dikirim, serta cara menolak.
  - Kalimat "tidak memasang iklan" dan "tidak memakai kuki iklan" diperbaiki.
  - Tanggal berlaku diubah menjadi 21 November 2026.
- `scripts/smoke-meta-pixel.mjs` dan `.github/workflows/meta-pixel-qa.yml`:
  - Uji unit untuk aturan halaman.
  - Uji browser: `www.besmartkids.id` diarahkan ke server lokal, dan skrip Meta diganti stub.
  - Hal yang dicek:
    - pixel muncul di beranda dan Bab 1 gratis;
    - `StartTrial` hanya membawa nama bab;
    - tidak ada pixel di latihan harian, halaman masuk/bab berbayar, maupun domain lain.

## Bukti
- `tsc`, `eslint` dan build lulus.
- `smoke-meta-pixel` lulus.
- `smoke-berhitung-bersusun` lulus di 4 lebar layar (cek regresi CSP).

## Belum diuji / perlu tindakan
- Status "sudah masuk" tidak bisa diuji lokal tanpa Supabase. Logikanya sederhana: bila `session` ada, pixel tidak dimuat. Uji di produksi dengan akun admin.
- Setelah digabung, cek di Meta Events Manager bahwa `PageView` dan `StartTrial` masuk dari `besmartkids.id`.
- Di Scalev: kosongkan Test Event Code pada pengaturan pixel bila uji sudah selesai.
- Di Scalev: pastikan event Purchase masuk lewat satu pembelian uji.
