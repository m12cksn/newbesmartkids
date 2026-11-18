# Handoff 2026-11-18: feat/kelas-4-bab-3-v2

## Scope
Kelas 4 Bab 3 **Pola Gambar dan Pola Bilangan** was rebuilt from the owner's PDF (Matematika SD/MI Kelas IV, book pages 86–102). It replaces the old `GradeFourPatterns` chapter; the URL stays `/kelas/…/materi/pola-gambar-dan-pola-bilangan`.

- Data: `src/data/grade-four-patterns-v2.ts`. Component: `src/components/learn/GradeFourPatternsV2.tsx`. Chapter registry: `src/chapters/kelas-4-pola`.
- Two peraga:
  - **A**: groups of jeruk, apel or kue with a starting amount and a change (−3…+4). Learners reveal the next group and read whether the pattern is membesar or mengecil.
  - **B**: blue number boxes on a shelf, as in the book. Learners set the starting number and the step, see the step labels, and type a guess for the next number with feedback.
- Practice: 4 questions per subtopic.
- Evaluation: 24 questions.
  - Levels 8/9/7, alternating A and B, 12 each.
  - 10 action questions: build the next group, pick the picture for the empty box, order number cards, match a pattern to its rule, choose all members of a pattern.
  - Book-style types with new numbers and pictures:
    - groups of objects: semangka square frame, kelereng L-shape, lolipop, batu bata, kue, jeruk;
    - shelf numbers with blanks;
    - story tables: televisi, kelapa;
    - stories: kursi bioskop, nth term, a group that breaks the pattern.
  - Faithful SVGs for every object.
- Removed:
  - the `kelas-4-pola` entry in `materials.ts` and its `if` branch;
  - `GradeFourPatterns.tsx`, `src/data/grade-four-patterns.ts`, and the old verify and smoke scripts;
  - their lines and artifact step in `grade-one-addition-qa.yml`.

## Validation
- `scripts/verify-grade-four-patterns-v2.mjs` passes. It recomputes 41 keys from the patterns: constant difference, layout counts, nth term, story tables, misfit group, match rules, multi membership. It also checks that partial ranks and matches are not counted as complete.
- eslint and `npm run build` pass.
- `scripts/smoke-grade-four-patterns-v2.mjs` passes at 320/390/768/1280 with the strict fit check, also with the CI fallback font (`FONT="DejaVu Sans"`). It covers both peraga, 8 practice questions (one wrong on purpose), all 24 evaluation questions, the score and the review.

## Remaining
- No video.
- No teacher review yet.
- `materials.ts`, `page.tsx` and `grade-one-addition-qa.yml` are also touched by the Kelas 4 Bab 2 PR. On a conflict, keep both removals.
