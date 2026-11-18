# Handoff 2026-11-18: feat/kelas-3-unsur-penjelasan

## Scope
The owner asked for a clearer, more ordered explanation in Kelas 3 Bab 4 **Unsur-Unsur Bangun Datar**, going step by step (sinar garis, garis, ruas garis, and so on).

- New component `src/components/learn/PlaneStepGuide.tsx`. It replaces the bullet list beside each peraga in `GradeThreePlaneElements.tsx` with a step-by-step card. Each step has a large picture, short text, Kembali/Lanjut buttons and step dots.
- **A, 8 steps:**
  1. titik;
  2. garis (two arrows; "Perpanjang" grows it both ways);
  3. sinar garis (one arrow; grows one way);
  4. ruas garis (no arrows; "Perpanjang" shows the length stays);
  5. a side-by-side comparison;
  6. measuring a ruas garis with a ruler (0 at A);
  7. ruas garis as the sides of a triangle (sides highlighted one by one);
  8. number of sides equals number of angles.
- **B, 9 steps:**
  1. two rays from one point;
  2. titik sudut and kaki sudut;
  3. naming ∠AOB;
  4. the protractor;
  5. centre on the vertex;
  6. one leg on 0;
  7. read the other leg (50°);
  8. kinds of angle;
  9. reflex angle.
- **C, 7 steps:**
  1. intersecting lines;
  2. perpendicular ⊥;
  3. parallel //;
  4. checking parallels by counting grid squares;
  5. to 7. folding paper twice to make a right angle.
- Removed the small tracked uppercase "Kelas 3 · Bab 4" label above the heading, as the design rules require when touching that area.

## Validation
- eslint and `npm run build` pass.
- `scripts/smoke-grade-three-plane-elements.mjs` now also walks the guide. It checks the order titik → garis → sinar garis → ruas garis, the "Perpanjang" behaviour, Lanjut to the last step and Kembali, and the no-horizontal-overflow check. It passes at 320/390/768/1280 together with the existing lab, practice and evaluation checks.

## Remaining
- No video yet.
- Exercises and the evaluation are unchanged.
