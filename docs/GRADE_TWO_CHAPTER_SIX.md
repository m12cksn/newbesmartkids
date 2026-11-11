# Kelas 2 Bab 6: Pengukuran

Source: user-supplied PDF `Matematika-BS-KLS-II_compressed_1-167-202.pdf` (book pages 155–190).
Route: `/kelas/bermain-angka-kelas-2/materi/pengukuran-berat-dan-waktu` (linked from the Kelas 2 catalog and homepage latest materials).
Code: `src/data/grade-two-measurement.ts`, `src/components/learn/GradeTwoMeasurement.tsx`, `src/components/learn/MeasureVisuals.tsx`.

## Subtopic map

| Subtopic | Objective | Learner-controlled lab | Book answer formats kept |
| --- | --- | --- | --- |
| A. Berat | Compare weight with a seesaw, balance or hands (heavier side goes down); lebih/paling berat and ringan; measure with non-standard units; results differ by unit | Weigh buku, kelapa, labu or tas by adding kelereng, balok, bola tenis or apel until the balance is level; compare any two objects on a seesaw | Complete sentences from balances, tick the heavier object, colour heaviest red and lightest yellow, circle heaviest/lightest, Berat 1 X = … Y, chains (1 jeruk = 2 stroberi, then 2 and 3 jeruk), substitution (pepaya = mangga = manggis), order from lightest |
| B. Waktu | Read exact hours (jarum pendek = jam, jarum panjang = menit), digital clocks, pagi/siang/sore/malam, compare durations | Tap a number to move the short hand, step hours, pick the part of day, see a matching activity and digital time | Write the time for an activity, set the clock hands, group activities by part of day, tick the longer activity, order activities by their clocks |

Practice: 4 per subtopic. Evaluation: exactly 24, 12 per subtopic alternating, 8 Sedang / 9 Menantang / 7 Sangat menantang, 13 genuine-action items. Balances tilt from per-question weights, and the verify script recomputes every balance, unit count and comparison word.

Icons from Lucide (activities such as bed, school, book, ball, shower, plus sunrise/sun/sunset/moon, plus/minus); custom SVG toothbrush and comb; fruit, animals, vehicles and school objects are purpose-built SVG. No emoji, tracked uppercase labels or text arrows.

## Validation

- `scripts/verify-grade-two-measurement.mjs`: counts, levels, alternation, unique prompts, keys and rejected wrong answers, balance tilt and unit equations, sentence words from balances, heavier/lighter objects and longer activities from reference weights/durations, part-of-day grouping, clock order, digital-to-analog match.
- `scripts/smoke-grade-two-measurement.mjs` (CI `grade-two-measurement-qa.yml`): catalog click path, both labs, 8 practices with one deliberate wrong, gating, all 24 evaluations through the real interactions (first wrong gives 23/1 and 96/100), review, no horizontal overflow at 320/390/768/1280, screenshots at 390 and 1280.
- Video is a labeled placeholder. Ayo Mencoba (real weighing), Ayo Berkarya and Catatanku are covered by the labs or left out of the assessment.
