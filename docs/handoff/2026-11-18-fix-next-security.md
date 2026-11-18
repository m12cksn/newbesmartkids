# Handoff 2026-11-18: fix/next-security

## Scope
- Upgrade `next` and `eslint-config-next` from 16.4.3 to 16.4.6, pinned exactly. This fixes the moderate advisories reported by `npm audit` for next 16.2.0–16.4.4:
  - GHSA-mfr8-8qww-v76h;
  - GHSA-vc7v-qv4w-wrv8.

  Both concern `'use cache'` root-param cache leaks.
- The owner approved, and on 2026-11-18 Supabase project "bimbel online" got migration `bsk_results_pembagian_garis` (the same SQL as `supabase/migrations/20261117150000_bsk_results_pembagian_garis.sql`). Score history now accepts `/mastering-jarimatika/level-1..3` and `/mastering-pembagian-garis/level-1..3`.
  - Verified the constraint and function bodies after applying.
  - The `anon` execute grant is unchanged.
  - The earlier file `20261117130000_bsk_results_jarimatika.sql` is superseded by the 150000 file and was not applied separately.

## Validation
- `npm audit --omit=dev`: 0 vulnerabilities.
- `npm run build` succeeds on Next.js 16.4.6.
- Smoke tests on the upgraded build pass for the homepage, mastering pembagian garis and mastering jarimatika, at all widths those scripts cover.

## Remaining
- No other chapter smoke suites were run locally; CI covers them.
