# Handoff 2026-11-17: feat/peraga-latihan-harian

## Scope
Per the owner's request, in the daily practice of Mastering Pembagian Garis and Mastering Jarimatika, each question's "Cara garis"/"Cara jari" hint (which showed the solution steps) is replaced by a **Tampilkan peraga** button. It opens a working manipulative under the question. The learner does every action; the peraga never computes or fills in the answer. The answer input stays open and editable while the peraga is shown.

- **Pembagian garis** (`src/components/mastering/PembagianGarisPractice.tsx`)
  - The notebook table for the question.
  - Per column: + garis, − garis, Ikat (enabled only when at least q loose strokes remain), and Sisa → (moves the loose strokes to the next column as 10 each).
  - An input for the number of ties per column, typed by the learner.
  - Missing-number questions get a guess field instead: "Coba bilangan yang dibagi" or "Coba pembagi".
- **Jarimatika** (`JarimatikaPractice` in `src/components/mastering/JarimatikaLab.tsx`)
  - Tabs for Tempel jari, Lipat jari untuk 9 and Hitung loncat.
  - Tempel jari: tap one finger on each hand and the hands slide to meet; then tap fingers to fold or straighten them.
  - Lipat jari 9: tap a finger to fold it.
  - Hitung loncat: starts from a fist; tap fingers to raise them. For missing-factor questions, the hint names the value per finger from the known factor.
  - No counts or results are shown.
- The demonstration lab at the top of each page is unchanged.

## Validation
- eslint on the changed files; `npm run build`.
- `scripts/smoke-mastering-pembagian-garis.mjs` and `scripts/smoke-mastering-jarimatika.mjs` pass at 320, 390, 768 and 1280. They check that:
  - tapping strokes, ties and fingers changes the peraga;
  - the answer input and the column inputs stay as the learner left them, with no automatic result;
  - the peraga stays open while the learner types the answer.

## Remaining
- Not reviewed by a teacher.
- The Supabase score-history migrations are still waiting for owner approval.
