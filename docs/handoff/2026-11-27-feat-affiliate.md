# 2026-11-27 feat/affiliate — Program affiliate BeSmartKids

## Scope
Built-in affiliate program (no Scalev affiliate subscription needed). Anyone can sign up, the commission is 16% per paid order, commission is held for 3 days after payment, and payouts go to an e-wallet with a minimum of Rp50.000.

## How it works
1. An affiliate signs up at `/affiliate` (no account needed) or turns it on from `/akun/affiliate`. They get the code and the link `/r/KODE`.
2. `/r/KODE` records a click and redirects to the Scalev landing page with `utm_source=affiliate&utm_medium=referral&utm_campaign=KODE` (`AFFILIATE_TARGET_URL`, default paket-belajar-besmartkids).
3. Scalev stores the UTM in the order metadata. Sync (`src/lib/affiliate-sync.ts`) reads `GET /v3/orders?utm_source=affiliate` and calls RPC `bsk_affiliate_record`. Sync runs:
   - from the Vercel cron `/api/affiliate/sync` daily at 18:07 UTC;
   - automatically when the dashboard opens, if the last sync is more than 30 minutes old;
   - from the "Sinkronkan pesanan Scalev" button in `/admin/affiliate`.
4. Paid orders become commissions. Canceled or RTS orders void any commission not yet paid out. A purchase by the affiliate's own WhatsApp number is ignored.
5. The affiliate presses "Cairkan" and the admin pays manually, then marks it "Sudah dibayar" or "Tolak" (a rejected request returns the commission).

## Paths
- Migration: `supabase/migrations/20261127120000_bsk_affiliate.sql`. **Applied to production** (Supabase migration `bsk_affiliate`).
- Library code: `src/lib/affiliate.ts`, `src/lib/affiliate-sync.ts`.
- Routes:
  - `src/app/r/[kode]/route.ts`
  - `src/app/api/affiliate/route.ts`
  - `src/app/api/affiliate/sync/route.ts`
  - new actions in `src/app/api/admin/route.ts`
- Pages:
  - `src/app/affiliate/page.tsx`
  - `src/app/akun/affiliate/page.tsx`
  - `src/app/admin/affiliate/page.tsx`
  - `src/components/affiliate/*`
- Entry links:
  - footer "Program affiliate";
  - "Affiliate" button in AccountPanel;
  - "Affiliate" button in the AdminPanel header;
  - sitemap;
  - welcome WhatsApp message.
- `vercel.json`: cron.

## Production env (Vercel)
| Variable | Purpose |
|---|---|
| `SCALEV_API_KEY` | Restricted Scalev API key with scope `order:list`. Created by the owner. |
| `AFFILIATE_SYNC_KEY` | Random secret. Its sha256 hash is stored in `bsk.settings.affiliate_sync_key_hash`. |
| `CRON_SECRET` | Vercel cron authentication. |
| `AFFILIATE_TARGET_URL` | Optional; defaults to the Scalev landing page. |

If `SCALEV_API_KEY` is not set, links and clicks still work; only sync is disabled.

## Validation
- `node --experimental-strip-types scripts/verify-affiliate.mjs`: OK.
- `npx eslint` on the affiliate files: clean.
- `npm run build` with the mock env: OK.
- `scripts/smoke-affiliate.mjs` against `scripts/mock-supabase-auth.mjs`: OK. It covers:
  - the footer link and widths 320/390/768/1280 with no overflow;
  - registration and duplicate-number rejection;
  - the `/r` redirect with UTM, and an invalid code giving no UTM;
  - auto-sync on the dashboard: available Rp57.120, held Rp12.640, 4 rows, with own purchase, unpaid, and canceled orders excluded;
  - payout requests;
  - admin sync and "Sudah dibayar";
  - an existing account turning on affiliate.
- SQL tested in a rolled-back transaction in production: commission available/held, own purchase skipped, withdraw works.
- CI: `.github/workflows/affiliate-qa.yml`.

## Remaining
- `smoke-login.mjs` already fails on master (stale "Jawabanmu benar." selector after the SavedEvaluationReport change). It is not part of this PR.
- No real order has been through the full flow yet. After the env vars are set, check one test order that comes in through `/r/KODE`.
