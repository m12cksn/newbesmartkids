# 2026-11-17 fix/tema-terang-tombol-mengambang

## Masalah
Di tablet dan desktop yang memakai mode gelap, tombol mengambang "Mode menjelaskan" (admin) dan "Kertas coret" tampil berlatar hitam dengan tulisan gelap, sehingga tidak terbaca. Penyebabnya:
- Kedua tombol dirender oleh `src/app/kelas/[slug]/materi/[materiSlug]/layout.tsx` di luar `<main data-theme="besmartkids">`.
- Di luar `<main>`, DaisyUI memakai tema gelap bawaan (`prefersdark`) untuk `bg-base-100`.
- Warna teks tetap mengikuti warna gelap dari halaman.

## Perbaikan
`<html data-theme="besmartkids">` di `src/app/layout.tsx`, sehingga seluruh halaman, termasuk elemen mengambang, selalu memakai tema terang BeSmartKids.

## Validasi
- Build lulus.
- Playwright dengan `colorScheme: "dark"` dan `"light"` di halaman bab: tombol Kertas coret berlatar `rgb(255,255,255)` dengan teks `rgb(23,53,42)`.
