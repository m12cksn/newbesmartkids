# Kelas 8 Bab 6 Statistika (feat/grade-eight-statistics)

- Scope: Buku Siswa Matematika SMP/MTs Kelas VIII (Kurikulum Merdeka 2022) hlm. 256–288. Subtopik A Pemusatan Data (modus, median, rata-rata), B Penyebaran Data (jangkauan, kuartil, jangkauan dan simpangan kuartil).
- New chapter via the registry: `src/chapters/kelas-8-statistika/` (slug `statistika`), shown on `/kelas/hubungan-geometri-kelas-8`. No shared-file edits. Not a free sample chapter.
- SMP depth and everyday examples: 7 sections, each with 4 steps, a "Dalam kehidupan sehari-hari" box, a worked example, and its own lab.
  - A.1 Modus (shoe shop stock, cooperative sales; lab: frequency steppers per shoe size, tallest bar(s) marked as mode).
  - A.2 Median (house prices; lab: sorted data, cross out outer pairs until the middle remains, odd and even sets).
  - A.3 Rata-rata (motorbike dealer target; lab: daily sales with a moving mean line and deviations summing to 0).
  - A.4 Tabel frekuensi dan rata-rata gabungan (class tally, combining classes; lab: frequency table with value × frequency, cumulative frequency, mean and median).
  - B.1 Jangkauan (rice production, daily temperature; lab: include/exclude students, highest/lowest marked).
  - B.2 Kuartil (report-card quarters, baby weight charts; lab: 10/16/11-value sets with Q1, Q2, Q3 marked).
  - B.3 Jangkauan dan simpangan kuartil (blood pressure readings; lab: make the largest value extreme, box plot shows only the range changing).
- Quartiles follow the book: Q2 is the median, Q1/Q3 are medians of the left/right halves (the middle value is excluded for odd n).
- Files: `src/data/grade-eight-statistics.ts`, `src/components/learn/GradeEightStatistics.tsx`, `src/components/learn/GradeEightStatisticsArt.tsx` (bar chart with highlights and mean line, line chart, tables), `scripts/verify-grade-eight-statistics.mjs`, `scripts/smoke-grade-eight-statistics.mjs`, `.github/workflows/grade-eight-statistics-qa.yml`.
- Answer types as in the book: sort the data by tapping cards (Langkah ke-1), complete value × frequency and cumulative-frequency columns, numeric measures, multiple choice (mode of a bar chart, order of mode/median/mean), true/false on students' opinions (Pengayaan 3).
- Practice 4 per subtopic (8). Evaluation 24 (A/B alternating, 12 each; 8 Sedang, 9 Menantang, 7 Sangat menantang): book items with new numbers (two-mode bar chart, rice range, UTS median, 16-value quartiles, heights range with growth, frequency-table mean, shoe sizes cumulative quartiles, combined mean, blood pressure, removing a student, data A vs B spread, a + b from the mean, 12-month motorbike sales, adding 5 children, baby weights, students' opinions, vaccine range after % growth, unknown salary, farmland quartiles, data 15/16, unknown x from the median, adjusted scores, percentage table).
- Validation: verify recomputes every key with its own mean/median/mode/quartile functions from the stored data (78 checks), checks sorting answers accept equal values in either order and reject wrong orders, rejects wrong values per answer type. tsc, eslint, build; Playwright at 320/390/768/1280: class-page link, all 7 labs, 8 practice (1 intentional wrong), 24 evaluation (1 intentional wrong) including sorting and table filling, score and review. Screenshots reviewed; fixed steppers overlapping at 320 px and the crowded frequency table on phones.
- Previous record: Kelas 8 Bab 5 PR #110 merged as 7255c83104d7c67c05b9986207ecbb2624ed7ae7; Vercel production deployment success.
- Untested: real video (placeholder); production login gate for this chapter (covered by the shared login QA).
