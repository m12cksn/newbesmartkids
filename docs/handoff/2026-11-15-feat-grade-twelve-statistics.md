# Kelas 12 Bab 2 Statistika (feat/grade-twelve-statistics)

## Ruang lingkup
- Sumber: Buku Siswa Matematika Kelas XII, Bab 2 Statistika (hlm. 27-82), PDF dari pengguna.
- Bab baru `kelas-12-statistika` (slug `statistika-kelas-12`, classId 12, chapter 2) lewat registri `src/chapters/`.
- 10 bagian materi: A.1 distribusi frekuensi, A.2 frekuensi kumulatif dan relatif, A.3 histogram dan poligon, A.4 ogive, A.5 membaca grafik dengan cermat; B.1 rata-rata, B.2 median, B.3 modus dan memilih ukuran pemusatan, B.4 simpangan rata-rata, B.5 ragam dan simpangan baku.
- 10 peraga interaktif (data buku: usia 80 pengusaha, bensin 72 mobil, nilai 44 siswa, kosmetik A/B/C, usia 50 orang terkaya, Contoh 2.15/2.16).
- 40 latihan (4 per bagian) dan 24 soal evaluasi (8 Sedang, 9 Menantang, 7 Sangat menantang; A/B berselang-seling).
- Ragam memakai pembagi n − 1 sesuai angka buku (212,3; 25,7; 5,09). Jawaban statistik boleh dibulatkan dua desimal.

## Berkas
- `src/data/grade-twelve-statistics.ts`
- `src/components/learn/GradeTwelveStatistics.tsx`, `GradeTwelveStatisticsArt.tsx`
- `src/chapters/kelas-12-statistika/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-twelve-statistics.mjs`, `scripts/smoke-grade-twelve-statistics.mjs`
- `.github/workflows/grade-twelve-statistics-qa.yml`

## Validasi
- Verify: 64 soal, 132 kunci dihitung ulang mandiri; Tabel 2.1 dicocokkan dengan data mentah Contoh 2.1; ukuran di buku (43,6; 45,25; 47,1; 12,4; 14,6; 212,3; 3,5; 5,1; 25,7; 1,85; 2,26) dicek.
- Build produksi lulus; smoke browser lulus di 320/390/768/1280 (10 peraga, 40 latihan, 24 evaluasi, skor 96/100, pembahasan); smoke halaman kelas lulus.

## Catatan buku
- Label frekuensi kumulatif pada Grafik 2.9 tertukar dengan Grafik 2.6; materi memakai nilai hasil hitung ulang.
- Isi bab tidak memuat kuartil, jadi kuartil tidak dimasukkan.

## Status
- PR dibuka dan di-merge otomatis setelah CI hijau (izin tetap pengguna).
