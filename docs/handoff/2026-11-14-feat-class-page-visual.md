# feat/class-page-visual (tampilan halaman kelas)

## Lingkup
- `src/components/class/ClassHero.tsx`: bagian atas halaman kelas memakai warna pastel, pola, dan gambar kelas yang sama dengan kartu kelas di beranda (`ClassCardArt`), di atas kertas berpetak bertempel selotip, dengan simbol matematika melayang dan garis bawah judul yang tergambar. Berisi jumlah bab, topik, tombol "Mulai dari Bab N" (bab gratis) dan "Lihat semua bab". `ChapterPath`: urutan bab bernomor yang bisa diklik.
- `src/components/class/TopicArt.tsx`: gambar per topik (blok nilai tempat, ikatan bilangan, pita pecahan, bangun datar, transformasi, bangun ruang, penggaris, diagram batang, pola, ubin aljabar, pita perbandingan, dadu dan roda putar), warna pastel per topik.
- `src/components/class/MaterialCard.tsx`: kartu bab dengan panel gambar, nomor bab besar bergaris, tanda "Gratis dicoba" di bab gratis, judul, ringkasan, status video.
- `src/app/kelas/[slug]/page.tsx`: susunan baru, bab diurutkan naik, kelas tanpa bab menampilkan pesan dan tautan alternatif.
- `ClassCardArt.tsx`: hanya menambah `export` pada `Pattern`, `Drawing`, `motifs`.
- Semua gerak memakai kelas `bsk-*` yang berhenti saat pengguna memilih kurangi gerakan.

## Validasi
- eslint dan `npm run build` lulus.
- `scripts/smoke-class-page.mjs` lulus lokal di 320/390/768/1280: jalur dari beranda, gambar, urutan bab naik, kartu dan tautannya, satu bab gratis, tombol mulai, lompat dari nomor bab, Kelas 12 tanpa bab, Kelas 9, tanpa scroll horizontal.
- Workflow `.github/workflows/class-page-qa.yml`.

## Catatan
- Paket sekolah (`feat/teacher-package`) masih menunggu migrasi Supabase, belum di-merge.
