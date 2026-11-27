# 2026-11-27 feat/affiliate-deteksi-ganda: security review and shared e-wallet warning

## Security review (code and configuration)
Checked: SQL injection, XSS, RLS, session cookies, login lockout, admin and sync guards, dependencies, parent-report codes, and Supabase advisors.

No problems:
- No dynamic SQL; all database access goes through parameterised functions.
- No raw HTML rendering.
- RLS is on for all `bsk.*` tables and anon cannot read them directly.
- Cookies are httpOnly, secure and sameSite=lax.
- Login: 5 wrong PINs lock the account for 15 minutes; PINs are bcrypt-hashed.
- Parent-report codes are 24 hex characters (96 bits), stored as a hash, and expire.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Supabase edge logs (24h): all `bsk_*` calls come from the Vercel server; no direct calls from browsers.

## Legacy objects (decision by the owner)
- `public.student_grades` (RLS off, anon can read, insert and update) and `public.increment_zoom_quota` belong to an older app ("bimbel online") that shares this Supabase project.
- Evidence of non-use:
  - not referenced by this repo;
  - no triggers, policies or views depend on them;
  - table stats show 0 writes;
  - no calls in the last 24h of API logs.
- Owner's instruction: **leave them untouched when unused; fix them if they turn out to be used.** Left unchanged.
- The older app itself IS active (reads and writes on `diagnostic_*`, `profiles`, Supabase Auth login); do not change those tables.
- If `student_grades` is ever put into use again: `alter table public.student_grades enable row level security;` (a policy already exists) and revoke anon write.

## Change in this PR
- `bsk_admin_affiliates` now returns `sharedWith` (codes of other affiliates with the same e-wallet number), for both the affiliate list and payout requests.
- `/admin/affiliate` shows a warning ("E-wallet ini juga dipakai affiliate ...") next to the payout request and in the e-wallet column. It is a warning only; the payout decision stays with the admin.
- Migration `20261127190000_bsk_affiliate_wallet_ganda.sql`: **applied to production**.

## Not done (needs the owner)
- Vercel Firewall rate-limit rules: the connector used in this session got 403 on `PATCH /v1/security/firewall/config`. The firewall is still the default. Suggested rules (path, method, limit per IP per minute):
  - `/api/masuk` POST, 60;
  - `/api/affiliate` POST, 20;
  - `/api/pin` POST, 20;
  - paths starting with `/r/`, 120.
- Accepted risks: the global limit of 40 affiliate sign-ups per hour could be used to block real sign-ups; a wrong-PIN lock can be triggered on someone else's account for 15 minutes; CSP still allows inline scripts (required by Next.js).

## Validation
verify-affiliate OK, eslint and tsc clean, build OK, smoke-affiliate OK (adds a second affiliate with the same e-wallet and checks both warnings).
