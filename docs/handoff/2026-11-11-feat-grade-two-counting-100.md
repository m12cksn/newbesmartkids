# Kelas 2 Bab 7 Ayo Membilang sampai dengan 100 (feat/grade-two-counting-100)

- Scope: Buku Siswa Matematika Kelas II pp. 191–224. Subtopik A (menghitung, membaca, menulis bilangan sampai 100) dan B (membandingkan bilangan).
- First chapter added through the parallel registry: `src/chapters/kelas-2-membilang-100/{meta.ts,Chapter.tsx}`. No shared registry, route page or materials.ts edits.
- Files: `src/data/grade-two-counting-100.ts`, `src/components/learn/GradeTwoCounting100.tsx`, `scripts/verify-grade-two-counting-100.mjs`, `scripts/smoke-grade-two-counting-100.mjs`, `.github/workflows/grade-two-counting-100-qa.yml`.
- Content: 2 labs (kelompok sepuluh dengan tabel nilai tempat; garis bilangan kupu-kupu dan pembanding dua bilangan), 4 latihan per subtopik, 24 soal evaluasi (8 Sedang, 9 Menantang, 7 Sangat menantang) mengikuti bentuk soal buku: isi titik-titik tabel nilai tempat, hubungkan nama/puluhan-satuan dengan bilangan, tebak lalu hitung (tandai benda), garis bilangan maju/mundur, urutkan di gerbong kereta, lingkari bilangan lebih besar, menyusun kata nama bilangan, teka-teki "aku".
- Video: placeholder (belum ada video).
- Validation: dataset verify OK; production build OK; Playwright smoke at 320/390/768/1280 covering both labs, all 8 practice questions, all 24 evaluation questions, wrong-answer review and score. Screenshots reviewed.
- Deployment: merge after CI passes per owner instruction; record PR/commit after merge.
