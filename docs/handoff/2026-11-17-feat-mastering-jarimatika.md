# Handoff 2026-11-17: feat/mastering-jarimatika

## Scope
Mastering Jarimatika: an interactive finger-math demonstrator for multiplication 1–10 (results up to 100), followed by seven daily questions per level that change every day at 00.00 WIB, like the other daily mastering features.

- Demonstrator (`src/components/mastering/JarimatikaLab.tsx`): learners pick both factors (1–10), then step through, autoplay or replay the finger method. Fingers are tappable to change the factor.
  - Tempel jari for 6–10 × 6–10.
  - Lipat jari for 9 × n.
  - Hitung loncat for the rest.
- Daily practice (`src/components/mastering/JarimatikaMastering.tsx`, `src/lib/daily-jarimatika.ts`): three levels.
  - Level 1, tempel jari.
  - Level 2, lipat & loncat.
  - Level 3, campuran, which includes missing factors.
  - Each level has 7 deterministic questions per WIB day and separate localStorage per level. Answers can be retried and are kept from older days.
  - A "Cara jari" hint per question, with "Peragakan a × b" to load the pair into the demonstrator.
  - Results show correct, wrong and score, plus SaveResult.
- Routes: `/mastering-jarimatika` redirects to `/mastering-jarimatika/level-1`. Levels 1–3 are statically generated. They are added to the sitemap and the proxy matcher.
- Entry: new "Mastering Jarimatika" card in the homepage daily practice section (`DailyPracticeCard.tsx`). The grid is now 2/4 columns.

## Validation
- `node --experimental-strip-types scripts/verify-daily-jarimatika.mjs`: all 100 products are correct per method; pool sizes, determinism, uniqueness and level membership hold; adjacent days differ, checked over 400 days.
- eslint on the new files, plus `npm run build`.
- `scripts/smoke-mastering-jarimatika.mjs` at 320/390/768/1280 covers:
  - the homepage link;
  - tempel, lipat and loncat steps, finger taps and autoplay;
  - the daily sheet with a wrong answer, the score, the hint and "Peragakan", persistence across reload, and the fix;
  - level 3 all correct.
- CI: `.github/workflows/mastering-jarimatika-qa.yml`.

## Remaining
- No video. Not reviewed by a human teacher yet.
