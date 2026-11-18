# Handoff 2026-11-18: feat/kelas-1-bab-2-v2

## Scope
Kelas 1 Bab 2 **Penjumlahan sampai dengan 10** was rebuilt from the owner's PDF (Matematika SD/MI Kelas I, book pages 41–74). It replaces the old `GradeOneAddition` chapter; the URL stays `/kelas/…/materi/penjumlahan-sampai-dengan-10`. The subtopics are A Cerita Penjumlahan, B Berbagai Cara Melakukan Penjumlahan, and C Soal Cerita Penjumlahan.

- Data: `src/data/grade-one-add10-v2.ts`. Component: `src/components/learn/GradeOneAdd10V2.tsx`. Art: `src/components/learn/GradeOneAdd10Art.tsx`.
  - The art file reuses the Bab 1 object drawings.
  - It adds kue lapis, kupu-kupu, pita, bebek, permen, mawar, siswa, kepik, ikan, and vehicles (sepeda, becak, motor, mobil).
- Chapter registry: `src/chapters/kelas-1-penjumlahan-10`.
- Large Kelas 1 visuals: 56 px answer boxes, large digits, objects in two tidy rows, and touch targets of at least 44 px.
- Three peraga:
  - **A**: two boxes and a "Gabungkan" button that merges the groups and shows the sentence and the equation.
  - **B**: four tabs.
    - pasangan bilangan: tap apples to split a whole;
    - lompat maju: number line hops;
    - berulang: ladybug with equal wings;
    - hasilnya 10: fill a ten frame.
  - **C**: build a word problem, guess, then reveal the solution.
- Practice: 4 questions per subtopic (12).
- Evaluation: 24 questions.
  - Levels 8/9/7; A, B and C rotate with 8 each.
  - Book-style types with new numbers and pictures:
    - complete the sentence;
    - write □ + □ = □;
    - number bond with a missing part;
    - count on along the number line (tap the landing number);
    - complete the ladybug wing;
    - fill the ten frame;
    - three different pairs that make 9;
    - pick the matching equation;
    - word problems;
    - vehicle and wheel counts (all sums within 10);
    - an unknown-addend story.
- Removed:
  - the materials entry and `if` branch;
  - `GradeOneAddition.tsx`, `AdditionInteractions.tsx` (used only there), `src/data/grade-one-addition.ts`, `src/data/grade-one-addition-practice.ts`, and the old verify and smoke scripts;
  - their workflow lines.
- In the shared `scripts/smoke-grade-one-chapters-one-to-three.mjs`, only the Bab 2 block was replaced by a comment. The Bab 3 checks are unchanged.

## Validation
- `scripts/verify-grade-one-add10-v2.mjs` passes. It recomputes 57 keys from the scene groups, the story numbers, the vehicles and wheels, the number bonds, the hops, the wings, the ten frame and the pick options. It also checks that:
  - every number is at most 10;
  - repeated or wrong-sum pairs are rejected;
  - levels and topic interleaving are correct;
  - partial answers do not count as complete.
- eslint and `npm run build` pass.
- `scripts/smoke-grade-one-add10-v2.mjs` passes at 320/390/768/1280 with the strict fit check and the CI fallback font. It covers the three peraga, 12 practice questions (one wrong on purpose), all 24 evaluation questions, the score and the review.
- `scripts/smoke-grade-one-chapters-one-to-three.mjs` (Bab 3) still passes.

## Remaining
- No video.
- No teacher review yet.
