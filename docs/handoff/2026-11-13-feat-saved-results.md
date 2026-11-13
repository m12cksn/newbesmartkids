# Riwayat nilai tersimpan di akun (feat/saved-results)

- Owner priority list item 4 (order agreed: 4 → 5 → 3 → 1 → 2; payments will use Scalev; legal pages under the name BeSmartKids with the admin's WhatsApp).
- Database (applied to Supabase project "bimbel online" as migration `bsk_results`, file `supabase/migrations/20261113150000_bsk_results.sql`):
  - `bsk.results` (closed schema, RLS on, no grants): account, chapter path, chapter title, kind latihan/evaluasi, part (quiz title), correct, total, generated score, time.
  - `public.bsk_save_result(token, path, title, kind, part, correct, total)`: checks the session, validates values and path, max 300 results per account per day.
  - `public.bsk_my_results(token)`: last 300 results of the signed-in account. Verified in production that an unknown token gets `session`/`null` and nothing is written.
- App:
  - `src/app/api/hasil/route.ts`: GET own results, POST one result (cookie session, input validation).
  - `src/components/auth/SaveResult.tsx`: shown on the results screen of `GradeFourQuiz` (used by 48 chapters). When signed in, it saves once and shows "Nilai tersimpan di riwayat akunmu"; visitors without an account see nothing.
  - `src/components/auth/ResultHistory.tsx` on `/akun`: per chapter best evaluation score, practice average, counts and last date; the 10 latest activities.
- Not covered yet: older chapters that use other quiz components (Kelas 1 Bab 2–8 lessons, `PracticeExperience`, daily mastering) do not save results yet.
- Validation: tsc, eslint, build; `scripts/smoke-login.mjs` with the mock (now including the two new functions) passes at 320/1280: empty history, saving two results via the API, rejecting an invalid path, chapter summary and activity list on /akun. The "Nilai tersimpan" status on a real quiz results screen is not covered by an automated test.
- Previous record: faster login PR #113 merged as 6a3a353bbe28b61c4d321723fca2c0ecd61b3a30; Vercel production deployment success.
