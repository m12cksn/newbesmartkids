# Handoff 2026-11-17: feat/pembagian-garis

## Scope
New feature: **Mastering Pembagian Garis**. Learners divide by striking lines and tying them in groups of the divisor, one column at a time. A remainder moves to the next column worth 10× its value. The method follows the reference image the owner sent ("Trik Pembagian": 756 : 3, columns 7 | 15 | 6, result 252).

**Peraga** (`src/components/mastering/PembagianGarisLab.tsx`)
- Learners type a dividend (10–999), pick a divisor 2–9, or tap "Soal acak".
- Steps: split into digits, then per column strike lines and tie them per divisor, then read the result.
- The board looks like a notebook grid: digit or carried total on top, strokes in the middle, result digit at the bottom.
  - Carried strokes are orange; the column's own strokes are blue.
  - The red tie line is animated.
- Each step has a large title and text. Steps can be chosen with dots, Kembali/Lanjut, Putar otomatis or Ulangi.
- Invalid input is explained and the board keeps the last valid problem. A problem is invalid if it is not divisible or a column would need more than 30 lines.

**Latihan harian** (`src/lib/daily-pembagian-garis.ts`, `src/components/mastering/PembagianGarisMastering.tsx`)
- Three levels:
  - Level 1: no carry, divisor 2–5.
  - Level 2: carry between columns, divisor 2–5.
  - Level 3: mixed, divisor 2–9, 3-digit dividends, with missing dividend or divisor.
- 7 deterministic questions per WIB day, with mixed divisors and separate localStorage per level.
- Each question has a "Cara garis" hint and "Peragakan n : q".

**Routes and links**
- `/mastering-pembagian-garis` redirects to level 1. Levels 1–3 are statically generated.
- The pages are in the sitemap and the proxy matcher.
- A new homepage card was added to "Mastering Matematika Harian" (now a 3-column grid on xl).

**Score history**
- `SaveResult` and `/api/hasil` accept the new path.
- New migration `supabase/migrations/20261117150000_bsk_results_pembagian_garis.sql` covers both jarimatika and pembagian garis.

## Validation
- `node --experimental-strip-types scripts/verify-daily-pembagian-garis.mjs`. It checks:
  - all 1,230 valid problems;
  - the source example columns;
  - the level pools;
  - 400 days of packets.
- eslint and `npm run build`.
- `scripts/smoke-mastering-pembagian-garis.mjs` passes at 320, 390, 768 and 1280. It covers:
  - the homepage link and the 756 : 3 steps (carry label, 15 on top, result 2-5-2);
  - invalid input, Soal acak and autoplay;
  - the daily sheet: wrong answer, score, hint and Peragakan, persistence after reload;
  - level 3.
- CI: `.github/workflows/mastering-pembagian-garis-qa.yml`.

## Remaining
- Not yet reviewed by a teacher.
- The Supabase migrations for score history (jarimatika and pembagian garis) are not applied yet. They are waiting for the owner's approval.
