# Kelas 2 Bab 8 Berbagai Diagram (feat/grade-two-diagrams)

- Scope: Buku Siswa Matematika Kelas II hlm. 225–248. Subtopik A Diagram Turus, B Diagram Gambar.
- Added through the chapter registry: `src/chapters/kelas-2-berbagai-diagram/{meta.ts,Chapter.tsx}`. No shared registry, route page or materials.ts edits.
- Files: `src/data/grade-two-diagrams.ts`, `src/components/learn/GradeTwoDiagrams.tsx`, `src/components/learn/GradeTwoDiagramsArt.tsx` (faithful SVG for fruit, vegetables, toys, flowers, farm animals, pets, traditional cakes, transport, traditional games, coloured cans, and pictograph symbols), `scripts/verify-grade-two-diagrams.mjs`, `scripts/smoke-grade-two-diagrams.mjs`, `.github/workflows/grade-two-diagrams-qa.yml`.
- Labs: (A) tap each fruit to mark it and add a tally to its row, then compare two rows (lebihnya/kurangnya); (B) choose a symbol (bintang, lingkaran, hati, wajah senyum) and build a pictograph row by row from the data.
- Practice: 4 per subtopic. Evaluation: 24 questions (8 Sedang, 9 Menantang, 7 Sangat menantang), A/B alternating, following the book's formats: fill the Banyak column from tallies; build tallies from a picture or a list; build a pictograph from a picture, a list, or relational sentences; read tallies and pictographs ("Ada …", "__ dan __ sama banyak", "__ lebih banyak dari", "… lebihnya/kurangnya", sums, "lebih dari dua putaran"); and pick the right can type from pictures (A–D). 17 of 24 items need an action other than typing a number.
- Video: placeholder.
- Validation: dataset verify (answer keys recomputed from the diagram data, unique most/least/sama-banyak answers, distractors rejected, choice positions all different); production build; Playwright smoke at 320/390/768/1280 covering both labs, 8 practice items with one intentional wrong answer, all 24 evaluation items with one intentional wrong answer, score and review. Screenshots reviewed; fixed scattered-object overlap and name/tally collision at 390px.
- Kelas 2 Bab 7 record: delivered via PR #83, merged as c5cc689802a671ffb4f370b0c18183ce97805771; Vercel production deployment success.
- Deployment: owner authorized merging every PR once CI passes.
