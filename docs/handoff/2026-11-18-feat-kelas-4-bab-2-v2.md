# Handoff 2026-11-18: feat/kelas-4-bab-2-v2

## Scope
Kelas 4 Bab 2 **Pecahan** was rebuilt from the owner's PDF (Matematika SD/MI Kelas IV, book pages 56–84) and replaces the old `GradeFourFractions` chapter. The URL stays the same: `/kelas/…/materi/pecahan`.

Subtopics:
- A. pembilang satu
- B. penyebut sama
- C. pecahan senilai
- D. desimal persepuluhan/perseratusan
- E. persen

Files:
- Data: `src/data/grade-four-fractions-v2.ts`. Text uses `{a/b}` for stacked fractions and `□` for input boxes; a box can also sit inside a fraction (`{□/100}`).
- Component: `src/components/learn/GradeFourFractionsV2.tsx`.
- Chapter registry: `src/chapters/kelas-4-pecahan`.
- Five peraga:
  - **A**: two pita or circles with denominator steppers and a sign choice.
  - **B**: tap to shade two pita with the same denominator, then choose the sign.
  - **C**: chocolate bars, pecahan × pengali.
  - **D**: tap-to-shade 10-strip and 10×10 grid.
  - **E**: 100-grid with whole squares, showing decimal, fraction and percent.
- Practice: 4 questions per subtopic.
- Evaluation: 24 questions.
  - Levels 8/9/7, interleaved subtopics, at least 4 per subtopic.
  - 10 action questions: shade, rank, match, multi.
  - Question types follow the book (write the fraction from a picture, compare with < = >, order, equivalent fractions, convert to decimal and percent, percent stories) with new numbers and pictures:
    - shapes: hexagon, triangle, circle, pita, stick, watermelon, bread loaf;
    - boxed eggs and oranges, student icons, answer sheet, sacks.
- Removed:
  - the `kelas-4-pecahan` entry in `materials.ts` and its `if` branch in the materi page;
  - `GradeFourFractions.tsx`, `src/data/grade-four-fractions.ts` and `scripts/smoke-grade-four-fractions.mjs`;
  - the stale smoke line in `grade-one-addition-qa.yml`.

## Validation
- `scripts/verify-grade-four-fractions-v2.mjs` passes. Answer keys are recomputed: 69 checks covering picture fractions, signs, equations, matches, ranks, multi, shade targets, items, people and the answer sheet.
- eslint and `npm run build` pass.
- `scripts/smoke-grade-four-fractions-v2.mjs` passes at 320/390/768/1280 with the strict fit-on-screen check:
  - all 5 peraga;
  - 20 practice questions, one wrong on purpose;
  - all 24 evaluation questions;
  - score and wrong-answer review.
- After checking an answer, the explanation makes some practice cards taller than a 320 px screen. That is the same soft note as earlier chapters.

## Remaining
- No video.
- Not reviewed by a teacher.
