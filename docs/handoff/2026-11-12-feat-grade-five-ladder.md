# Kelas 5 Bab 2: subtopik F Pembagian Berulang (feat/grade-five-ladder)

- Owner asked for an extra subtopic on finding KPK and FPB with repeated division (pembagian berulang), with a shorter flow, practice, and evaluation coverage.
- Added subtopik F "Menentukan KPK dan FPB dengan Pembagian Berulang": a three-step flow card (Tulis, Bagi, Ulangi), a step-by-step lab (tap a prime; rows that divide every number are marked "semua"; KPK = all divisors, FPB = marked divisors; feedback when no number is divisible), and 4 practice ladders (12 & 18, 24 & 36, 8 & 12 & 20, 45 & 60).
- Evaluation still 24: the existing 42 & 60 ladder moved from E to F, and the Asep/Lukas calendar item (one of two calendar items) was replaced by a Sedang ladder for 20 & 30. Evaluation ladders now show the flow card and a live "semua" marker per row. Subtopic E keeps factor trees and factorization; its practice ladder was replaced by a factorization item (18 & 45).
- Files: `src/data/grade-five-kpk-fpb.ts`, `src/components/learn/GradeFiveKpkFpb.tsx`, `src/chapters/kelas-5-kpk-fpb/meta.ts`, `scripts/verify-grade-five-kpk-fpb.mjs`, `scripts/smoke-grade-five-kpk-fpb.mjs`.
- Validation: dataset verify (all ladder items are in F, F has evaluation items); tsc, eslint, build; Playwright at 320/390/768/1280 including the new lab (wrong prime feedback, 36|6 and 120|4 results), 24 practice items and 24 evaluation items. Screenshots reviewed.
- Kelas 5 Bab 2 record: delivered via PR #86, merged as f8decb4e1276f0256f265acf453df922d44354fc; Vercel production deployment success.
