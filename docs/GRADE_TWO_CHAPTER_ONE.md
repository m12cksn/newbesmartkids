# Kelas 2 Bab 1 — Ayo Membilang sampai dengan 50

Source: the user-supplied 36-page PDF `Kelas_2_bab_1.pdf` (materi, latihan, asesmen in one file).
Route: `/kelas/bermain-angka-kelas-2/materi/ayo-membilang-sampai-50` (linked from the Kelas 2 catalog).
Code: `src/data/grade-two-counting-50.ts`, `src/components/learn/GradeTwoCounting.tsx`.

## Subtopic map

| Subtopic | Objective | Learner-controlled lab | Book answer formats kept |
| --- | --- | --- | --- |
| A. Menghitung, membaca, menulis bilangan sampai 50 | Count objects in tens, write numeral and words, count forward/backward | Pencil bundles (±1, ±10) with automatic 10-bundling, number bond, word reading, number strip | Count objects, number bond circles, write the reading, train/flag sequences, connect dots in order |
| B. Nilai tempat | Tens and ones, alternative decompositions | Base-ten rods/units, exchange 10 ones ↔ 1 ten, place-value table | Place-value table from blocks, `… puluhan + … satuan`, "Tika memikirkan bilangan", which decompositions are correct |
| C. Membandingkan dua bilangan atau lebih | Compare by tens then ones, order, estimate | Two adjustable numbers with tables, >/</= and number line | Circle the larger/smaller, order from smallest/largest, guess-then-count, name ordering, card numbers |

Practice: 4 per subtopic (12). Evaluation: exactly 24, 8 per subtopic, interleaved (no two consecutive from the same subtopic), 8 Sedang / 9 Menantang / 7 Sangat menantang, 12 answer kinds. Book asesmen types (count fruit, place table, bond + reading, sequences, compare, order, guess-and-count, "Tika memikirkan", Ali/Lili decompositions, Kira/Lili/Malosi, digit cards) reused with new numbers/images, plus own items at higher difficulty (e.g. 1 puluhan 14 satuan vs 2 puluhan 3 satuan).

Illustrations are purpose-built SVG (mango, ladybug, butterfly, candy, star, marble; red base-ten rods/units like the book). Scattered scenes use non-overlapping grid cells and let learners tap to mark counted objects.

## Validation

- `scripts/verify-grade-two-counting-50.mjs`: counts, distribution, interleave, unique prompts, answer keys, rejection of wrong answers per part, number-word spelling, bond/sequence/place/split arithmetic, decomposition options, ordering, scene–answer agreement.
- `scripts/smoke-grade-two-counting-50.mjs` (CI `grade-two-counting-50-qa.yml`): catalog click path, all three labs, 12 practices with one deliberate wrong, answer gating, all 24 evaluations (first wrong → 23/1, 96/100), incorrect-answer review, no horizontal overflow at 320/390/768/1280, screenshots at 390 and 1280.
- Video is a labeled placeholder ("Video pembelajaran segera hadir").
