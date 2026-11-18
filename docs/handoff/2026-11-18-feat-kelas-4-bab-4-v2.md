# Handoff 2026-11-18: feat/kelas-4-bab-4-v2

## Scope
Kelas 4 Bab 4 **Pengukuran Luas dan Volume** was rebuilt from the owner's PDF (Matematika SD/MI Kelas IV, book pages 104–140; A Pengukuran Luas p105, B Pengukuran Volume p122). It replaces the old `GradeFourMeasurement` chapter; the URL stays `/kelas/…/materi/pengukuran-luas-dan-volume`.

- Data: `src/data/grade-four-measure-v2.ts`. Component: `src/components/learn/GradeFourMeasureV2.tsx`. Chapter registry: `src/chapters/kelas-4-pengukuran`.
- Two peraga:
  - **A**: grid paper. Tap cells to shade them, see the area, and see whether the shape is a rectangle (p × l). Switch between 1 cm and 1 m cells; for m² it also shows the area in cm².
  - **B**: two tabs.
    - Tuang botol: pour small bottles into a pump soap bottle until it is exactly full, with an overflow warning.
    - Susun kubus: set p, l and t to build an isometric cuboid of unit cubes and read p × l × t.
- Practice: 4 questions per subtopic.
- Evaluation: 24 questions.
  - Levels 8/9/7, alternating A and B, 12 each.
  - 10 action questions:
    - sort real objects into cm²/m² or ml/l boxes;
    - shade a shape of a given area;
    - pour bottles;
    - build a cuboid of a given volume;
    - order shapes or bottles;
    - match equal volumes;
    - choose all shapes with a given area.
  - Book-style types with new numbers and pictures:
    - shapes on grid paper, including half squares;
    - shape comparisons;
    - rectangle and frame-with-hole area;
    - cm²/m² and l/ml conversions;
    - milk cartons;
    - unit-cube solids;
    - milk and water-tank stories with borrowing.
  - Faithful SVGs for every object: lapangan sepak bola and basket, kolam renang, bingkai foto, sampul buku, perangko, halaman sekolah, sapu tangan, sendok obat, ember, botol parfum, tong air, tetes mata, pump bottles, cartons, and isometric cubes.
- Every shape in one picture is drawn at the same cell size, so the areas can be compared by eye. On phones, scenes with four or more shapes split into two rows.
- Removed:
  - the `kelas-4-pengukuran` entry in `materials.ts` and its `if` branch;
  - `GradeFourMeasurement.tsx`, `src/data/grade-four-measurement.ts`, and the old verify and smoke scripts;
  - their lines and artifact step in `grade-one-addition-qa.yml`.

## Validation
- `scripts/verify-grade-four-measure-v2.mjs` passes. It recomputes 36 keys from the pictures and text:
  - polygon areas, including half squares, through `polyArea`;
  - cube counts;
  - carton sums;
  - unit conversions;
  - match pairs;
  - stories;
  - which bin each object belongs in.

  It also checks that rank values are distinct, that partial answers are not counted as complete, and that wrong shade, pour and cuboid answers fail.
- eslint and `npm run build` pass.
- `scripts/smoke-grade-four-measure-v2.mjs` passes at 320/390/768/1280 with the CI fallback font (`FONT="DejaVu Sans"`). Every question fits on screen before checking. It covers both peraga, 8 practice questions (one wrong on purpose), all 24 evaluation questions, the score and the review.

## Remaining
- No video.
- No teacher review yet.
- At 320 and 390 px, the feedback text after checking makes a few practice cards taller than the screen; this is the same soft limit as earlier chapters.
- `materials.ts`, `page.tsx` and `grade-one-addition-qa.yml` are also touched by the Kelas 4 Bab 2 and Bab 3 PRs. On a conflict, keep all removals.
