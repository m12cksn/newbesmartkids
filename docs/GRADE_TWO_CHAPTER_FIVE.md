# Kelas 2 Bab 5: Pecahan

Source: user-supplied PDF `Matematika-BS-KLS-II_compressed_1-137-166.pdf` (book pages 125–154).
Route: `/kelas/bermain-angka-kelas-2/materi/pecahan-setengah-seperempat` (linked from the Kelas 2 catalog and homepage latest materials).
Code: `src/data/grade-two-fractions.ts`, `src/components/learn/GradeTwoFractions.tsx`, `src/components/learn/FractionVisuals.tsx`.

## Subtopic map

| Subtopic | Objective | Learner-controlled lab | Book answer formats kept |
| --- | --- | --- | --- |
| A. Setengah dari benda utuh | Two equal parts, one part is setengah; unequal parts are not | Choose a shape, draw fold lines (centre and off-centre), colour parts, see equal/unequal and the fraction name | Colour half, tick or cross pictures, draw a line to make two equal parts and colour one, group into setengah / bukan setengah, choose the picture |
| B. Setengah dari kumpulan benda | Split a collection into two equal groups; share one by one | Pick an object and amount, share one by one to Upe and Malosi; odd amounts leave one | Tick groupings, circle the group pair that shows half, colour or circle half of a collection, share pencils into two boxes and write half, story problems |
| C. Seperempat dari benda utuh | Four equal parts, one part is seperempat; half of a half | Cut martabak, kue bolu or roti into 2 then 4 (straight, cross or strips) and take a piece | Colour a quarter, tick or cross, group into seperempat / bukan seperempat, draw lines to make quarters and colour one, choose Kira's piece |

Practice: 4 per subtopic. Evaluation: exactly 24, 8 per subtopic, interleaved, 8 Sedang / 9 Menantang / 7 Sangat menantang, 20 genuine-action items. A convex-polygon splitting engine computes every part's area: colouring is accepted for any parts whose total is the target fraction, and every valid set of fold lines is accepted (verified by enumerating all combinations). Fold boards have two modes, Tarik garis and Warnai, with a tap handle on each line.

Icons from Lucide (pen, paint bucket, scissors, check/cross, plus/minus); objects from the shared ObjectArt SVG library. No emoji, tracked uppercase labels or text arrows.

## Validation

- `scripts/verify-grade-two-fractions.mjs`: counts, levels, interleave, unique prompts, keys and rejected wrong answers, every ticked/sorted/chosen picture recomputed from geometry (equal parts and shaded share), colour questions on equally divided shapes, each fold question has a wrong guide and all correct combinations accepted, group answers by equal counts, story answers.
- `scripts/smoke-grade-two-fractions.mjs` (CI `grade-two-fractions-qa.yml`): catalog click path, three labs, 12 practices with one deliberate wrong, gating, all 24 evaluations through the real interactions (first wrong gives 23/1 and 96/100), review, no horizontal overflow at 320/390/768/1280, screenshots at 390 and 1280.
- Video is a labeled placeholder. Ayo Mencoba (paper folding), Coba Pikirkan (diagram), Ayo Berkarya and Catatanku are covered by the labs or left out of the assessment.
