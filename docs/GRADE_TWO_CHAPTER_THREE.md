# Kelas 2 Bab 3: Bentuk di Sekitar Kita

Source: user-supplied PDF `Matematika-BS-KLS-II_compressed_1-77-112.pdf` (book pages 65–100: materi, Ayo Mencoba, Ayo Berlatih, Coba Pikirkan, Evaluasi, Ayo Berkarya).
Route: `/kelas/bermain-angka-kelas-2/materi/bentuk-di-sekitar-kita` (linked from the Kelas 2 catalog and homepage latest materials).
Code: `src/data/grade-two-shapes.ts`, `src/components/learn/GradeTwoShapes.tsx`, `src/components/learn/ShapeVisuals.tsx`.

## Subtopic map

| Subtopic | Objective | Learner-controlled lab | Book answer formats kept |
| --- | --- | --- | --- |
| A. Bangun Datar | Segi banyak vs bentuk lengkung, count sides, name 3–6 sides, circle vs other curves | Tap every side to count it (regular, irregular and L-shaped polygons); rotate curved shapes over their stamp to find the circle | Write names, count sides, draw lines from shape to name or property, colour all segi empat, lingkaran or segi banyak, group into a table |
| B. Mengurai dan Menyusun | Decompose a shape with lines, compose shapes from pieces, different ways give different results | Tap two edge points to draw a cut; pieces recolour and report "2 segitiga, 1 segi empat"; compose two equal right triangles three ways | Find the missing circle piece, draw lines from shapes to decomposition or composition results, draw cut lines (two parts, three parts, 3 segitiga, 2 segi empat) |
| C. Bangun Ruang | Bangun datar vs ruang, flat vs curved surfaces (rolling), name kubus/balok/tabung/kerucut/bola, count unit cubes | Pick a solid, roll it, stamp its flat faces (6 equal squares, balok pairs, 2 or 1 circle, none for bola), real examples | Group objects by surface or solid, name solids, choose objects, count Toni's unit-cube toy (A–D) |

Practice: 4 per subtopic. Evaluation: exactly 24, 8 per subtopic, interleaved, 8 Sedang / 9 Menantang / 7 Sangat menantang. 14 evaluation items use genuine actions (draw matching lines, tap-to-sort into boxes, tap to colour, draw cut lines checked by a polygon-splitting engine that accepts every valid cut). Choice answer positions are spread over all four positions.

Illustrations are purpose-built SVG: flat shapes, schematic solids, and real objects (dadu, kubus rubik, kardus, kotak susu, kotak tisu, kotak pensil, kaleng, drum, topi ulang tahun, kerucut es krim, bola, jeruk, kelereng, mur baut, teh celup, rambu, uang logam, rumah burung, stiker, kartu, kertas lipat) and isometric unit-cube stacks. Interface icons come from Lucide; no emoji, tracked uppercase labels or text arrows (AGENTS natural-design rules).

## Validation

- `scripts/verify-grade-two-shapes.mjs`: counts, levels, interleave, unique prompts, keys and rejected wrong answers, side counts of every polygon, check/sort/match keys recomputed from the figures and object-to-solid table, equal areas for decomposition/composition pairs, cube stacks supported and counted, cut engine (edge cuts rejected, all valid two-part cuts accepted, pentagon cut rejected where required), answer-position spread.
- `scripts/smoke-grade-two-shapes.mjs` (CI `grade-two-shapes-qa.yml`): catalog click path, all three labs and their results, 12 practices with one deliberate wrong, answer gating, all 24 evaluations answered through the real interactions (first wrong gives 23/1 and 96/100), incorrect-answer review, no horizontal overflow at 320/390/768/1280, screenshots at 390 and 1280.
- Video is a labeled placeholder. Ayo Berkarya (tangram craft) and Catatanku are not part of the assessment.
