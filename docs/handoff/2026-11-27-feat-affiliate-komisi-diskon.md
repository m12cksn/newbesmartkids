# 2026-11-27 feat/affiliate-komisi-diskon: commission proportional to promo price, per-package counting, more colourful page

## Commission rule (owner's request)
- At normal price: Rp19.900 per single-level package (Rp79.000) and Rp34.900 per Paket Keluarga (Rp129.000).
- At a promo price, commission drops by the same ratio:
  - commission = full commission × paid ÷ normal price, rounded to the rupiah;
  - examples: Rp59.000 gives Rp14.862, and a Rp99.000 Keluarga gives Rp26.784;
  - paying more than the normal price never raises the commission.
- An order with several packages is counted per package from the Scalev `final_variants` field (scope `order:list`, no new key needed). A name containing "Keluarga" counts as Keluarga; others count as single-level.
  - Without variant data, the package is estimated from the product price.
- The calculation runs on the server (`src/lib/affiliate.ts` `commissionFor`/`packagesOf`) and is sent as `commission`. SQL caps it at the amount paid.
  - If an older payload has no `commission`, SQL falls back to the previous fixed rule.

## Page
- `/affiliate` now uses soft brand-matched colours:
  - mint hero, yellow and coral commission cards, sky-blue promo strip and calculator, cream steps section, mint signup section.
- SVG ornaments (coin, chain link, paper plane, chat bubble, wallet, sparkle) in `AffiliateOrnaments.tsx` drift slowly and are aria-hidden.
- Line spacing on headings and bold text is looser.
- The calculator has a "Harga normal / Harga promo" toggle.
- The dashboard commission table now shows the "Dibayar" (amount paid) column.

## Paths
- `supabase/migrations/20261127170000_bsk_affiliate_komisi_proporsional.sql`: **applied to production**.
- `src/lib/affiliate.ts`, `src/lib/affiliate-sync.ts`
- `src/app/affiliate/page.tsx`
- `src/components/affiliate/AffiliateOrnaments.tsx`, `AffiliateEarningsCalculator.tsx`, `AffiliateFlowScene.tsx`, `AffiliateDashboard.tsx`, `AdminAffiliatePanel.tsx`
- `src/lib/welcome-message.ts`
- `scripts/mock-supabase-auth.mjs`, `scripts/verify-affiliate.mjs`, `scripts/smoke-affiliate.mjs`

## Validation
- verify-affiliate: OK. Covers normal and promo prices, 2 packages in one order, overpayment, and variant parsing.
- eslint and tsc: clean.
- Build: OK.
- smoke-affiliate: OK. It covers:
  - promo examples;
  - promo calculator showing Rp71.370;
  - widths 320/390/768/1280;
  - dashboard available Rp76.546 (34.900 + 14.862 + 26.784) and held Rp39.800 (SD + SMP in one order);
  - payout and admin.
