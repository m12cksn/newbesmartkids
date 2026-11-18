# Handoff 2026-11-18: feat/kelas-4-bab-6-v2

## Scope
Kelas 4 Bab 6 **Piktogram dan Diagram Batang** was rebuilt from the owner's PDF (Matematika SD/MI Kelas IV, book pages 178–194; A Piktogram p179, B Diagram Batang p187). It replaces the old `GradeFourDataDisplay` chapter; the URL stays `/kelas/…/materi/piktogram-dan-diagram-batang`.

- Data: `src/data/grade-four-charts-v2.ts`. Component: `src/components/learn/GradeFourChartsV2.tsx`. Chapter registry: `src/chapters/kelas-4-piktogram-diagram-batang`.
- Charts are data. Every numeric answer comes from `answerFor(chart, ask)`, and every category answer comes from `nameFor(chart, ask)`. Supported asks:
  - value, sum, total, difference, range;
  - scale, missing icons, max, min, "which", "twice".
- Two peraga:
  - **A**: build a piktogram of favourite juices with + and − per row. Learners can switch between 1 icon = 1 siswa and 1 icon = 2 siswa, and the readout checks every row.
  - **B**: tap the grid to set bar heights. It switches between upright and horizontal bars and reports the most, the least and the total.
- Practice: 4 questions per subtopic.
- Evaluation: 24 questions.
  - Levels 8/9/7, alternating A and B, 12 each.
  - Book-style types with new data:
    - read the most, the least, a value, the category with a given value, the sum of two, the total;
    - piktogram with a scale (4 siswa, 5 telur, 3 bunga, 2 buku);
    - read bars between grid lines (step 2) and with scales of 4 and 5;
    - build a piktogram from a table (scale 1 and 2);
    - build upright and horizontal bars from a table or a story;
    - find the scale from a known row;
    - missing piktogram row from a total;
    - missing bar from a total;
    - choose the bar chart that matches a table or a piktogram;
    - choose all categories above a value.
  - Purpose-built icons: siswa, buku, kelereng, bunga, kue, telur, apel, bola, and a plain square for mixed objects (as in the book's library piktogram).
- Removed:
  - the `kelas-4-piktogram-diagram-batang` entry in `materials.ts` and its `if` branch;
  - `GradeFourDataDisplay.tsx`, `src/data/grade-four-data-display.ts`, and the old verify and smoke scripts;
  - their lines and artifact step in `grade-one-addition-qa.yml`.

## Validation
- `scripts/verify-grade-four-charts-v2.mjs` passes. It recomputes 50 keys from the raw chart data, independently of the question builders, and checks that:
  - build questions match their source table or sentence;
  - bars to be built sit on grid lines and piktogram values are multiples of the scale;
  - exactly one option matches in each "pick the chart" question;
  - category answers are unique;
  - levels, interleaving and answer positions are correct;
  - partial answers do not count as complete.
- eslint and `npm run build` pass.
- `scripts/smoke-grade-four-charts-v2.mjs` passes at 320/390/768/1280 with the strict fit check and the CI fallback font (`FONT="DejaVu Sans"`). Every question fits on screen before checking. It covers both peraga, 8 practice questions (one wrong on purpose), all 24 evaluation questions, the score and the review.

## Remaining
- No video.
- No teacher review yet.
- The three small charts in "pick the chart" questions have small category labels on 320 px phones. Their order matches the source data.
