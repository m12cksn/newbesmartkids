# Handoff 2026-11-17: feat/jarimatika-realistis

## Scope
The Mastering Jarimatika demonstrator (`src/components/mastering/JarimatikaLab.tsx`) is redrawn with more realistic hands and a bigger, simpler explanation.

**Hands and fingers**
- Each finger has segments, creases, a nail or pad, and skin shading.
- Fingers bend at the knuckle with a smooth animation. When reduced motion is requested, the animation is skipped.

**Tempel jari**
1. The two hands slide toward each other until the chosen fingers meet. The other fingers relax slightly so they do not cross the other hand.
2. The touching fingers and those below them fold one by one, each with a "10" tag.
3. The standing fingers are counted 1, 2, 3 and multiplied.
4. A three-part board fills in step by step: puluhan, satuan, hasil. Values stay "?" until their step.

**Lipat jari 9**: the n-th finger folds. The fingers to its left are marked green as tens and the fingers to its right orange as units.

**Hitung loncat**: the hands start as fists. One finger rises per step, showing the running total.

**Explanation and controls**
- Each step has a large title and short text, both in `lesson()` in `src/lib/daily-jarimatika.ts`. `steps()` now derives from it.
- Step dots can be tapped to jump to a step.
- The buttons are bigger: Kembali, Lanjut, Putar otomatis and Ulangi.

## Validation
- `scripts/verify-daily-jarimatika.mjs` passes.
- eslint and `npm run build` pass.
- `scripts/smoke-mastering-jarimatika.mjs` passes at 320, 390, 768 and 1280. It now also checks that the hands move when the fingers meet, and that the tens board appears.

## Remaining
- Not yet reviewed by a teacher.
- The Supabase migration `20261117130000_bsk_results_jarimatika.sql` is still not applied. It is waiting for the owner's approval.
