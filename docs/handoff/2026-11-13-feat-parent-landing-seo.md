# feat/parent-landing-seo (poin 7: halaman orang tua dan SEO)

## Lingkup
- `src/lib/site.ts`: `SITE_URL` (env `NEXT_PUBLIC_SITE_URL`, bawaan https://newbesmartkids.vercel.app) dan `SITE_NAME`.
- `src/app/robots.ts`, `src/app/sitemap.ts`: robots.txt (menutup /admin, /akun, /api/, /laporan/, /masuk) dan sitemap.xml (beranda, 12 kelas, semua bab, latihan harian level 1–3, halaman legal).
- `src/app/layout.tsx`: metadataBase, deskripsi, Open Graph, canonical.
- `generateMetadata` di halaman kelas dan halaman bab (judul, deskripsi, canonical, Open Graph).
- `src/components/home/ParentInfo.tsx`: bagian "Untuk orang tua" (`/#paket`) di beranda: isi paket dari fitur yang sudah ada, tabel paket (1 kelas 12 bulan, semua kelas 24 bulan), tombol "Tanya harga lewat WhatsApp", langkah mendapatkan akun, FAQ. Tidak ada harga yang ditulis; harga ditanyakan ke admin.
- Tautan "Paket" di navigasi header.

## Validasi
- `npx tsc --noEmit`, eslint, `npm run build` lulus.
- `scripts/smoke-parent-landing-seo.mjs` lulus lokal: robots, 79 URL sitemap (sampel merespons 200, tanpa halaman privat), metadata bab dan kelas, bagian paket di 320/390/768/1280 tanpa scroll horizontal, FAQ bisa dibuka, tautan header Paket menggulir ke bagian.
- Workflow `.github/workflows/parent-landing-seo-qa.yml`.

## Catatan
- Cabang ini memuat isi PR #123 (`feat/admin-wa`, nomor WA admin bawaan) karena tombol WhatsApp memerlukannya.
- Jika domain sendiri dipakai, isi `NEXT_PUBLIC_SITE_URL` di Vercel agar canonical dan sitemap memakai domain itu.
- Belum didaftarkan ke Google Search Console (perlu akun pemilik).
