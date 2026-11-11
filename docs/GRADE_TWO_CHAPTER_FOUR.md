# Kelas 2 Bab 4: Posisi Benda dan Pola di Sekitar Kita

Source: user-supplied PDF `Matematika-BS-KLS-II_compressed_1-113-136.pdf` (book pages 101–124).
Route: `/kelas/bermain-angka-kelas-2/materi/posisi-benda-dan-pola` (linked from the Kelas 2 catalog and homepage latest materials).
Code: `src/data/grade-two-position-patterns.ts`, `src/components/learn/GradeTwoPositionPatterns.tsx`, `src/components/learn/PositionVisuals.tsx`.

## Subtopic map

| Subtopic | Objective | Learner-controlled lab | Book answer formats kept |
| --- | --- | --- | --- |
| A. Posisi Benda | Describe position with atas, bawah, depan, belakang, kanan, kiri; reciprocal sentences; kanan/kiri from the reader's view | Choose a reference (meja, kursi, kotak, sepeda) and a ball or cat, move it in six directions, read the sentence and its reverse | Circle the word, fill sentences from a word bank (each word once), find the object at a position by tapping the picture, "Apa aku?" riddles, follow moving instructions, Ani's key under a pot, write the ball's position for six pictures |
| B. Pola | Recognise and continue shape, colour, movement and sound patterns; make your own pattern | Build a 2–4 item repeating core for shape, colour, movement or clapping (with optional sound), see the strip continue | Tick rows that are patterns, circle the next picture, colour to continue, colour to create a pattern, fill boxes to form a pattern, continue a pattern grid |

Practice: 4 per subtopic. Evaluation: exactly 24, 12 per subtopic alternating, 8 Sedang / 9 Menantang / 7 Sangat menantang, 16 genuine-action items (tap in the scene, fill blanks from the word bank, sort pictures into position boxes, tick, colour/fill sequences, create a pattern, tap the item that breaks a pattern). Correct choice positions are spread.

Scenes are drawn from coordinates with depth planes, and the verify script recomputes every position word from the geometry. Interface icons come from Lucide (arrows for directions, hands for claps, speaker for sound); objects are purpose-built SVG. No emoji, tracked uppercase labels or text arrows.

## Validation

- `scripts/verify-grade-two-position-patterns.mjs`: counts, levels, alternation, unique prompts, keys and rejected wrong answers, every fill-in word is the only true relation in the scene, riddles have exactly one matching object while each clue alone is ambiguous, pot and child line counting, cat movement, pattern rows checked by period detection, sequence blanks have a unique completion from the palette, the odd-one-out is the only single fix, own-pattern validity.
- `scripts/smoke-grade-two-position-patterns.mjs` (CI `grade-two-position-patterns-qa.yml`): catalog click path, both labs, 8 practices with one deliberate wrong, gating, all 24 evaluations through the real interactions (first wrong gives 23/1 and 96/100), review, no horizontal overflow at 320/390/768/1280, screenshots at 390 and 1280.
- Video is a labeled placeholder. Ayo Mencoba (classroom observation), Ayo Bermain (group play), Ayo Berkarya (cut and paste) and Catatanku are covered by the labs or left out of the assessment.
