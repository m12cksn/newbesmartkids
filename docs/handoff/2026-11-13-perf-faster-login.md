# Login lebih cepat (perf/faster-login)

- Problem (owner): browsing is fast once logged in, but pressing "Masuk" feels slow.
- Cause found:
  - Supabase project "bimbel online" runs in ap-south-1 (Mumbai), while the Vercel functions ran in the default US region. Every database call (login, session check) crossed the world, and so did the user's request from Indonesia.
  - The login click waited for three serial server trips: POST /api/masuk (bcrypt check ≈ 75–90 ms in the database), then GET /api/sesi, then the destination page whose proxy checks the session again. The login function is rarely used, so it often started cold.
- Changes:
  - New `vercel.json` with `"regions": ["bom1"]`: functions and the proxy now run in Mumbai, next to the database and much closer to Indonesia than the US.
  - `LoginForm` no longer waits for `/api/sesi` before navigating; the full page load fetches the session anyway.
  - `GET /api/masuk` warm-up, called when the login page opens: it starts the function and opens the connection to Supabase with a read-only `bsk_session` call for a dummy token, so the real login is ready by the time the PIN is typed.
- Not changed: bcrypt cost 10 for PINs (security), session cache (60 s) and access rules.
- Validation: tsc, eslint, build; `scripts/smoke-login.mjs` against the mock Supabase passes at 320/1280 (free chapter, redirect, wrong PIN, admin creates account, per-class access, mastering, account page). Production timing must be checked after deployment; this sandbox cannot reach the production site.
- Previous record: homepage class cards PR #112 merged as 65d42ad77044a6ef9babff04fcd9f6d6cd00d543; Vercel production deployment success.
