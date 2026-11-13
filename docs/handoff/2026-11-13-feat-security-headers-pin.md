# Header keamanan dan ganti PIN sendiri (feat/security-headers-pin)

- Security headers for every route via `next.config.ts` `headers()`:
  - Content-Security-Policy (self only; inline scripts/styles still allowed because Next.js needs them; frames limited to YouTube/Vimeo/Drive for future lesson videos; `vercel.live` allowed for the preview toolbar; `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`, `base-uri 'self'`).
  - X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera, mic, geolocation, payment, usb off), Cross-Origin-Opener-Policy same-origin.
  - `poweredByHeader: false`.
- Self-service PIN change so the owner can replace the admin PIN that was shared in chat without anyone else seeing the new PIN:
  - New DB function `public.bsk_change_pin(token, old, new)`: requires the old PIN (wrong attempts count toward the 5-try lock), checks the 6-digit format, rejects reusing the same PIN, and signs out every other device. Migration `supabase/migrations/20261113090000_bsk_change_pin.sql` (applied to project `tdpjqgvhmzsgcrpklmxq`; tested in SQL with a temporary account).
  - `POST /api/pin` route; "Ganti PIN" form on `/akun` (PIN lama, PIN baru, ulangi PIN baru).
  - Mock server and `scripts/smoke-login.mjs` extended: wrong old PIN rejected, change succeeds, old PIN stops working, new PIN logs in.
- Validation: tsc, eslint, build; headers checked with curl; login smoke at 320/1280; Kelas 1 Bab 1 chapter smoke (fails on any console error, so CSP violations would show) and homepage smoke pass with the new CSP.
- Kelas 1 Bab 1 v2 record: PR #104 merged as e534634e004e3f23c1d97ad557e74462325f182d; Vercel production deployment success.
- Owner action: sign in as `admin`, open `/akun`, Ganti PIN.
