# Handoff 2026-11-18: feat/kelas-4-bab-5-v2

## Scope
Kelas 4 Bab 5 **Bangun Datar** was rebuilt from the owner's PDF (Matematika SD/MI Kelas IV, book pages 140–176; A Ciri-Ciri Bangun Datar p142, B Komposisi dan Dekomposisi p166). The owner's request called it "Bab 4", but the book and the site list it as chapter 5. It replaces the old `GradeFourGeometry` chapter; the URL stays `/kelas/…/materi/bangun-datar`.

- Data: `src/data/grade-four-shapes-v2.ts`. Component: `src/components/learn/GradeFourShapesV2.tsx`. Chapter registry: `src/chapters/kelas-4-bangun-datar`.
- Shapes are stored as coordinates. Helpers in the data file compute properties from them:
  - side lengths, interior angles and angle kinds, parallel pairs;
  - triangle kinds, all applicable quadrilateral names (following the book's relations: persegi is also persegi panjang, belah ketupat, jajargenjang and layang-layang);
  - congruence for tangram pieces.
- The same helpers drive the peraga readout, the equal-side tick marks and right-angle marks on figures, and the verify script.
- Two peraga:
  - **A** dot paper: choose a triangle, quadrilateral, pentagon or hexagon, tap a vertex, then tap a dot to move it. The readout names the shape and lists acute, right and obtuse angles and parallel pairs. It warns when sides cross.
  - **B** tangram: take apart the 7 pieces and rebuild the square by tapping a piece and then its place.
- Practice: 4 questions per subtopic.
- Evaluation: 24 questions.
  - Levels 8/9/7, alternating A and B, 12 each.
  - 14 action questions:
    - sort objects or shapes into boxes;
    - tick a property table like the book's;
    - match triangles to names with lines;
    - pick a figure;
    - choose all names or all component shapes;
    - place pieces into a target (perahu, trapesium, segitiga besar).
  - Book-style types with new shapes and numbers:
    - which figures are polygons or regular polygons;
    - acute and obtuse angle counts;
    - park perimeter (segilima, 60 m, two laps);
    - comparing belah ketupat and layang-layang;
    - right-isosceles triangle names;
    - why some quadrilaterals are jajargenjang;
    - decomposition counts for rumah, tangram and a cut rectangle;
    - paving and fish components;
    - missing tangram piece;
    - hexagon into trapezoids and triangles;
    - rectangle diagonals.
  - Real objects are purpose-built SVGs: papan tulis, mur, penggaris segitiga, ban, gelang, es krim cone.
- Removed:
  - the `kelas-4-bangun-datar` entry in `materials.ts` and its `if` branch;
  - `GradeFourGeometry.tsx`, `TriangleLesson.tsx` (used only there), `src/data/grade-four-geometry.ts`, and the old verify and smoke scripts;
  - their lines and artifact step in `grade-one-addition-qa.yml`.

## Validation
- `scripts/verify-grade-four-shapes-v2.mjs` passes. It recomputes 30 keys from coordinates:
  - sort bins, table cells, the unique matching, mosaic counts and components;
  - angle counts, regular polygons, triangle and quadrilateral names;
  - the missing piece, the diagonals of the rectangle, the perimeter.

  It also checks levels, interleaving, answer-position variety, and that partial answers are not counted as complete.
- eslint and `npm run build` pass.
- `scripts/smoke-grade-four-shapes-v2.mjs` passes at 320/390/768/1280 with the strict fit check and the CI fallback font (`FONT="DejaVu Sans"`). Every question fits on screen before checking. It covers both peraga, 8 practice questions (one wrong on purpose), all 24 evaluation questions, the score and the review.

## Remaining
- No video.
- No teacher review yet.
- After checking, the feedback text makes some practice cards taller than a 320 px screen; this is the same soft limit as earlier chapters.
