# Kelas 8 Bab 5 Persamaan Garis Lurus (feat/grade-eight-lines)

- Scope: Buku Siswa Matematika SMP/MTs Kelas VIII (Kurikulum Merdeka 2022) hlm. 208–254. Subtopik A Grafik Persamaan Garis Lurus, B Pengertian Kemiringan.
- New chapter via the registry: `src/chapters/kelas-8-persamaan-garis-lurus/` (slug `persamaan-garis-lurus`), shown on `/kelas/hubungan-geometri-kelas-8`. No shared-file edits. Not a free sample chapter.
- SMP depth and everyday examples: 8 sections, each with 4 steps, a "Dalam kehidupan sehari-hari" box, a worked example, and its own lab.
  - A.1 Tabel nilai dan titik (parcel shipping cost; lab: y = mx + c table, points and line).
  - A.2 Titik potong sumbu (truck depreciation; lab: ax + by = c → both intercepts, line through them).
  - A.3 Pengaruh m dan c (salary + commission; lab: your line vs y = 2x + 2: parallel, coincident, perpendicular, same y-intercept).
  - B.1 Kemiringan naik/mendatar (wheelchair ramp with 0,15/0,25/0,325/0,875 limits; lab: ramp height and length vs chosen limit).
  - B.2 Kemiringan dari dua titik (uphill road sign; lab: two points → rise, run, m, sign or undefined).
  - B.3 Kemiringan dan satu titik (ride-hailing fare; lab: y − y₁ = m(x − x₁) → y = mx + c).
  - B.4 Dua titik (coffee harvest; lab: two points → m, c, line).
  - B.5 Sejajar dan tegak lurus (badminton court lines; lab: reference slope, parallel/perpendicular, point → new line).
- Files: `src/data/grade-eight-lines.ts`, `src/components/learn/GradeEightLines.tsx`, `src/components/learn/GradeEightLinesArt.tsx` (coordinate plane with clipped lines, labelled points, legend and tappable lattice points; ramp, stairs, bunk-bed ladder, data chart), `scripts/verify-grade-eight-lines.mjs`, `scripts/smoke-grade-eight-lines.mjs`, `.github/workflows/grade-eight-lines-qa.yml`.
- Answer types as in the book: complete the x–y table, intercept points (x, y), draw the line by tapping two lattice points (any two points on the line accepted), garis lurus/bukan, slopes from pictures/points/situations, the m-and-c table (Soal 5.2 no. 3), y = mx + c (fractions like 1/2 accepted), match equations to graphs (Uji Kompetensi B6), true/false, multiple choice with graph options (Uji Kompetensi A1).
- Practice 4 per subtopic (8). Evaluation 24 (A/B alternating, 12 each; 8 Sedang, 9 Menantang, 7 Sangat menantang): book items with new numbers (2x − y = 3 table, graph of 2x − y + 4 = 0, ramp 75 cm/6 m, P on y = 2x − 3, slope/intercept table, point-slope forms, p and h from slopes, motorbike depreciation, calories, perpendicular line, five collinear points, stairs 12 steps, match graphs, rectangle diagonal QS, coffee harvest, internet classrooms, three lines with common y-intercept, perpendicular through midpoint, collinear k, descending helicopter).
- Validation: verify recomputes every key from the equations, points, slopes and story data (74 checks), checks that any two lattice points on the line are accepted for drawing, that only one graph option fits, and rejects wrong values per answer type; choice positions 2,3,2. tsc, eslint, build; Playwright at 320/390/768/1280: class-page link, all 8 labs, 8 practice (1 intentional wrong), 24 evaluation (1 intentional wrong) including drawing a line by tapping points, score and review. Screenshots reviewed; moved overlapping line labels into a legend.
- Previous record: Kelas 8 Bab 4 PR #109 merged as a0275cfddf0c1208e236d3a273e9062f0bdfc2d4; Vercel production deployment success.
- Untested: real video (placeholder); production login gate for this chapter (covered by the shared login QA).
