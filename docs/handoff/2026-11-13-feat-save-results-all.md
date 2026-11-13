# Semua bab dan latihan harian menyimpan nilai (feat/save-results-all)

- Follow-up to PR #114 (merged as 303bad2281c942e99913e20b4105f5a1d35393ed): the owner asked that every chapter saves scores before moving on to the parent report.
- Kelas 1 chapters with their own quiz components now render `SaveResult` on their results screen:
  - Bab 2 `GradeOneAddition`, Bab 3 `GradeOneSubtraction`, Bab 4 `GradeOneShapes`: final evaluation ("Evaluasi akhir").
  - Bab 5 `GradeOneChapterFive`, Bab 6 `GradeOneChapterSix`, Bab 7 `GradeOneChapterSeven`, Bab 8 `GradeOneChapterEight`: practice and evaluation. The old note "Skor belum disimpan ke akun siswa" was removed.
- Daily mastering (`DailyMastering`, both modes, 3 levels): saves kind `harian` once per package per day and device (`once` flag in localStorage), titled "Mastering Penjumlahan & Pengurangan" / "Mastering Perkalian & Pembagian", part "Level n, date".
- Database migration `bsk_results_daily` (applied to Supabase; file `supabase/migrations/20261113160000_bsk_results_daily.sql`): allows the two mastering paths and kind `harian` in `bsk.results` and `bsk_save_result`.
- `/api/hasil` accepts the same paths/kinds; `/akun` history groups each mastering level as "Latihan harian" with its average.
- With this, all 55 chapters plus daily mastering save results. The unused `/kelas/…/latihan` page (`PracticeExperience`, no links, empty question banks) is left unchanged.
- Validation: tsc; eslint shows only pre-existing errors in the touched Kelas 1 and mastering files (same count before and after); build; `scripts/smoke-login.mjs` with the mock passes at 320/1280 including filling a real daily package and seeing "Nilai tersimpan di riwayat akunmu", and the history showing practice, evaluation and daily results; Kelas 1 smokes (addition, subtraction, shapes, chapters 5–6, measurement, diagrams) and both daily mastering smokes pass without auth.
