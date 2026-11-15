# Kelas 12 Bab 3 Peluang (feat/grade-twelve-probability)

## Ruang lingkup
- Sumber: Buku Siswa Matematika Kelas XII, Bab 3 Peluang (hlm. 83-152), PDF dari pengguna. Pengguna menyebut "bab 3 Statistika"; judul di PDF adalah Peluang dan daftar subtopiknya cocok, jadi bab dinamai Peluang.
- Bab baru `kelas-12-peluang` (slug `peluang-kelas-12`, classId 12, chapter 3) lewat registri `src/chapters/`.
- 10 bagian sesuai Kegiatan 3.1.1-3.1.6 dan 3.2.1-3.2.4, masing-masing dengan peraga: kartu remi 52 kartu (atau / lalu), menyusun vs mengambil, kotak permutasi, memilih kartu untuk kombinasi, susunan huruf, meja bundar yang bisa diputar, diagram Venn, tabel 36 hasil dua dadu (saling lepas dan saling bebas), dan diagram pohon spidol tanpa pengembalian.
- 40 latihan (4 per bagian) dan 24 soal evaluasi (8 Sedang, 9 Menantang, 7 Sangat menantang; A/B berselang-seling; A 2 soal per bagian, B 3 soal per bagian). Jawaban peluang berupa pecahan; pecahan senilai diterima.

## Berkas
- `src/data/grade-twelve-probability.ts`
- `src/components/learn/GradeTwelveProbability.tsx`, `GradeTwelveProbabilityArt.tsx`
- `src/chapters/kelas-12-peluang/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-twelve-probability.mjs`, `scripts/smoke-grade-twelve-probability.mjs`
- `.github/workflows/grade-twelve-probability-qa.yml`

## Validasi
- Verify: 64 soal, 98 kunci dihitung ulang dengan enumerasi (permutasi, himpunan bagian, susunan melingkar dengan syarat, ABRACADABRA, dua dadu, pengambilan tanpa pengembalian).
- Build produksi lulus; smoke browser lulus di 320/390/768/1280; smoke halaman kelas lulus.

## Catatan buku
- Contoh 3.2.9 no. 3 menulis hasil 15/10 (lebih dari 1); seharusnya (78/200)(77/199).
- Contoh 3.2.9 no. 2 mengalikan P(P)P(W) seperti dipilih dengan pengembalian; soal sejenis tidak dipakai tanpa keterangan.

## Status
- PR dibuka dan di-merge otomatis setelah CI hijau (izin tetap pengguna).
