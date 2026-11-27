# 2026-11-27 feat/affiliate-komisi-tetap: fixed commission and new /affiliate page

## Scope
- The affiliate commission is now a fixed amount instead of 16%:
  - Rp19.900 per single-level package;
  - Rp34.900 per Paket Keluarga.
- The package is identified from the Scalev `product_price` (price before discount). The sync now requests the `product_price` column.
  - Reason: a real order showed a Paket Keluarga paid at Rp99.000 (discount) with `product_price` 129.000.
  - Rule: `product_price` >= Rp129.000 counts as Keluarga; anything above 0 counts as one level; 0 gives no commission.
  - Known gap: an order of 2 single-level packages (Rp158.000) is counted as Keluarga (Rp34.900).
- The `/affiliate` page is redesigned:
  - hero with a CSS-animated scene (link shared, 3 sales paid, balance passes the payout limit);
  - two commission cards;
  - commission calculator with +/- buttons and an animated total;
  - 4 steps with a flowing line;
  - signup form with the terms in a `<details>` block.
  - The animation uses only transform/opacity, has a reduced-motion fallback, and starts mid-cycle so it is not empty on first load.
- Commission text updated in the dashboard, admin page and welcome message. The dashboard table now shows the package type ("Satu jenjang" / "Keluarga").

## Paths
- `supabase/migrations/20261127150000_bsk_affiliate_komisi_tetap.sql`: **applied to production** (migration `bsk_affiliate_komisi_tetap`). There were 0 commissions at the time.
- `src/lib/affiliate.ts`, `src/lib/affiliate-sync.ts`
- `src/app/affiliate/page.tsx`, `src/app/affiliate/affiliate-page.css`
- `src/components/affiliate/AffiliateFlowScene.tsx`, `AffiliateEarningsCalculator.tsx`, `AffiliateDashboard.tsx`, `AdminAffiliatePanel.tsx`
- `src/lib/welcome-message.ts`
- `scripts/mock-supabase-auth.mjs`, `scripts/verify-affiliate.mjs`, `scripts/smoke-affiliate.mjs`

## Validation
- verify-affiliate: OK.
- eslint on the affiliate files: clean.
- `tsc --noEmit`: clean.
- Build: OK.
- smoke-affiliate: OK. It covers:
  - commission cards;
  - calculator (Rp94.600, then Rp39.800 "Kurang Rp10.200", then can be paid out);
  - no overflow at 320/390/768/1280;
  - dashboard available Rp104.700 (3 Keluarga, one of them discounted) and held Rp19.900;
  - payout Rp104.700.

## Production env
Already set: `SCALEV_API_KEY` (added by the owner), `AFFILIATE_SYNC_KEY`, `CRON_SECRET`.
