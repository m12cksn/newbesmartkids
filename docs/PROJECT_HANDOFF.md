# BeSmartKids project handoff

Last reviewed: 10 November 2026 (Asia/Jakarta).
Code baseline inspected: `72af2db0904c703ba6ab016633da36cf921d4837` on master.
This is a snapshot. Check master and open PRs before acting.

## Start here

1. Read root AGENTS.md and this file.
2. Inspect git status, current branch, latest master and GitHub PRs. Preserve unrelated local changes.
3. Identify the user's current task. Read the affected component, data, chapter documentation and tests.
4. Implement on a scoped branch; validate; report evidence; merge/deploy only within user authorization.
5. Update this handoff with completed work, validation and remaining work.

Repository: https://github.com/m12cksn/newbesmartkids
Main branch: master
Production: https://newbesmartkids.vercel.app/
Owner/product contact: Mr Iwan. Communicate in Indonesian unless source material requires English.

## Product and implementation

BeSmartKids teaches elementary mathematics through concise explanations, visual exploration, varied practice and scored evaluations. Materials should support Mr Iwan recording explanations for YouTube; supplied video links go into the standard video panel. Until supplied, show an honest video placeholder.

Actual package.json: Next.js 16.4.3 App Router, React 19.3, TypeScript, Tailwind 4, DaisyUI 5, Poppins and @dnd-kit/core. Preserve the current emerald BeSmartKids identity and existing layout. Other UI libraries discussed in older conversations are not evidence they are installed here. Likewise, do not assume Supabase/auth/payment/dashboard features from older projects exist in this repository without checking.

Use meaningful SVG or verified object illustrations; counts, dimensions, labels and answer keys must agree. Keep mobile controls readable and usable. Evaluate at 320/390/768/1280 px; avoid horizontal overflow. User favors compact question layouts that minimize scrolling.

## Content present in master

Presence below is verified against src/data/materials.ts and component paths; it is not a fresh audit of every chapter.

| Course | Content |
| --- | --- |
| Grade 1 | Bab 1 counting to 10; Bab 2 addition to 10; Bab 3 subtraction to 10; Bab 4 shapes; Bab 5 counting to 20; Bab 6 addition/subtraction to 20; Bab 7 object length; Bab 8 diagrams |
| Grade 4 | Bab 1 whole numbers to 10,000; Bab 2 fractions; Bab 3 picture/number patterns; Bab 4 area/volume; Bab 5 plane shapes; Bab 6 pictograms/bar charts |
| Grade 5 | KPK and FPB entry and dedicated experience |
| Grade 6 | Bab 1 Pecahan dan Desimal (PR #43, merged 60af854); Bab 2 Rasio (PR #44, live) |
| Cambridge Grade 6 | Calculation with Fractions (chapter 10); Ratio and Proportion (chapter 11) |

Important corrections: Grade 1 Bab 1 in current code is counting to 10, not 20. Grade 4 Piktogram dan Diagram Batang is Bab 6, because Bab 5 is Bangun Datar and source PDFs label the data chapter Bab 6. Do not renumber from an old chat typo.

## Daily mastering, live

- /mastering-perkalian-pembagian/level-1 (also level-2 and level-3).
- /mastering-penjumlahan-pengurangan/level-1 (also level-2 and level-3).
- Both base routes redirect to level-1.
- Homepage section “Mastering Matematika Harian” exposes both activities.
- 7 questions per day/level; direct operations and missing operands/results; scores, hints, retries and local persistence.
- Addition/subtraction ranges: level 1 up to 20, level 2 up to 100, level 3 up to 1,000. Nonnegative whole-number answers.
- Multiplication/division: basic fact families, wider fact families, then two-digit × one-digit and inverse division.
- Packets use deterministic date generation at midnight WIB. Existing old-day answers are preserved with an explicit switch to today's packet; do not silently discard work.
- Storage is per mode/level and device, not a claim of account/cloud synchronization.

## Recent delivered work and evidence

| PR | Result |
| --- | --- |
| #39 | Grade 4 Bab 6: two interactive labs, 5 practices each, 24 evaluation questions, answer gating, results and incorrect-answer review. Merged as c7f3df711ed3713eb8a68899e2846421b03a97ef. CI run 42584166508 passed. |
| #40 | Addition/subtraction mastering using the existing mastering layout. Merged as 2cdd91ef567698706c2cdd94cf28825f23436625. CI run 42612717806 passed, including both mastering modes at 320/390/768/1280, scoring, retries, persistence and WIB rollover. |
| #41 | Added both mastering cards to homepage after user could not find addition. Merged as ba42c52f77cbecdbcbd913a0a346856f26a2bab3. Vercel deployment succeeded; production HTML confirmed section title and addition link. This small navigation fix was not a new full visual audit. |

Production deployment and direct routes were confirmed in the preceding session. Recheck after future deployment. Preview deployments may require Vercel login; do not change protection settings without scope/authorization.

## Where to work

- src/data/materials.ts: chapter catalog.
- src/app/kelas/[slug]/materi/[materiSlug]/page.tsx: chapter routing.
- src/components/learn/: chapter experiences; inspect GradeOneAddition.tsx, GradeOneSubtraction.tsx and GradeOneChapterEight.tsx for established flow.
- src/data/: chapter questions and datasets.
- src/components/mastering/DailyMastering.tsx and DailyMastering.css: shared mastering UI.
- src/lib/daily-arithmetic.ts: multiplication/division generator and shared persistence helpers.
- src/lib/daily-addition.ts: addition/subtraction generator and isolated storage keys.
- src/app/mastering-penjumlahan-pengurangan/ and src/app/mastering-perkalian-pembagian/: routes.
- src/components/home/DailyPracticeCard.tsx: homepage discovery.
- docs/GRADE_FOUR_DATA_DISPLAY.md, GRADE_FOUR_GEOMETRY.md, GRADE_FOUR_CHAPTER_ONE.md through FOUR.md, GRADE_ONE_CHAPTER_EIGHT.md, CAMBRIDGE_GRADE_SIX_FRACTIONS.md and CAMBRIDGE_GRADE_SIX_RATIO.md: feature-specific references.
- scripts/verify-*.mjs and scripts/smoke-*.mjs: dataset and browser checks.
- .github/workflows/grade-one-addition-qa.yml: broad build/regression workflow despite its historical name.
- .github/workflows/daily-arithmetic-qa.yml: daily arithmetic checks.

## Commands and validation

Read package.json and the relevant workflow for exact current commands.

```sh
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
node --experimental-strip-types scripts/verify-grade-four-data-display.mjs
node --experimental-strip-types scripts/smoke-daily-addition.mjs
node --experimental-strip-types scripts/smoke-daily-arithmetic.mjs
```

Browser scripts require Playwright/Chromium; CI installs them. Start the app before smoke tests. Test origin conventions differ by script: read the file rather than assuming.
Local Turbopack previously failed with a persistence database error; `npx next build --webpack` passed. A local Chromium download previously failed; CI browser checks passed. These were environment observations, not proof of current failures. Do not stop at the first tool failure when CI is available.

## Open work and uncertainty

10 Nov 2026 — Kelas 6 Bab 3 Kubus dan Balok: implementation on feat/grade-six-cubes from four supplied scanned PDFs. Three studios (construct/decompose cubes and balok, spatial projections and face symbols, grid location/paths and marked-cube rolling), five practices per topic (15), 24 interleaved evaluations (8 per topic). User explicitly authorized merge/publication after successful checks. Geometry/data: src/data/grade-six-cubes.ts; visuals CubesVisuals.tsx; chapter GradeSixCubes.tsx; catalog and route /kelas/konsep-inti-matematika-kelas-6/materi/kubus-dan-balok. Source mapping/conventions: docs/GRADE_SIX_CHAPTER_THREE.md. Dataset verification passed: independently checked keys, voxel projections, layer counts, unique matches, rotations, coordinates, alternate shortest routes, rolling inverses. Local production webpack build passed before final UI refinements; final build/browser/screenshot QA pending. Do not claim live until CI and production checks complete. Tests: scripts/verify-grade-six-cubes.mjs and scripts/smoke-grade-six-cubes.mjs; .github/workflows/grade-six-cubes-qa.yml.

10 Nov 2026 — Kelas 6 Bab 2 Rasio delivered via PR #44, merged as 72af2db0904c703ba6ab016633da36cf921d4837. User explicitly authorized merge/publish after successful checks. Six studios, four practices per subtopic (24 total) and 24 interleaved evaluations mapped to the four supplied scanned PDFs. Route: /kelas/konsep-inti-matematika-kelas-6/materi/rasio; discovered through Grade 6 catalog. Code: src/components/learn/GradeSixRatio.tsx and src/data/grade-six-ratio.ts. Source/coverage: docs/GRADE_SIX_CHAPTER_TWO.md. Local dataset checks, changed-file ESLint and webpack production build passed. CI Grade 6 Ratio QA run 42790290619 passed (build, six lab interactions, all practices/evaluations, answer gating, scoring/review at 320/390/768/1280). Broad regression run 42790290452 also passed. Screenshot artifact 13749973841 reviewed for six labs, practice representatives, all 24 evaluations and results at desktop/mobile; no clipping or count mismatch found. Vercel production deployment succeeded; both chapter route and Grade 6 catalog returned HTTP 200, production HTML contains the new lab and the catalog contains its entry link. Tests: scripts/verify-grade-six-ratio.mjs and scripts/smoke-grade-six-ratio.mjs; workflow .github/workflows/grade-six-ratio-qa.yml. Video remains a clearly labeled placeholder until a source is supplied.

10 Nov 2026: Mr Iwan requested Kelas 6 Bab 1 Pecahan dan Desimal (A.1, A.2, B.1, B.2, C.1, C.2). Implemented on branch feat/grade-six-fractions-decimals as a draft PR: 6 labs, 24 practice questions (4 per subtopic), 24 evaluation questions derived from Latihan 1.1-1.3 because no Uji Kompetensi pages were supplied. Local checks: dataset verify, lint on changed files, production build, browser smoke at 320/390/768/1280, plus regression smoke for Grade 4 data display/fractions/geometry and Cambridge fractions. Owner feedback (same day): questions approved; lessons should be BeSmartKids' own Grade-4-style version rather than following the PDF stories. Labs were rebuilt (src/components/learn/GradeSixLabs.tsx) with generic models, learner-driven steps and "Coba sendiri" checks; questions unchanged. Re-ran verify, lint, build and smoke at 320/390/768/1280. Owner then asked to merge and publish to the main website (10 Nov 2026). This line was written before the merge; verify the merge commit and production route on master rather than trusting it. Details: docs/GRADE_SIX_CHAPTER_ONE.md.
Several older PRs remain open; they may overlap delivered code. Inspect their diffs against master before deciding they are unfinished. Do not merge or close them automatically:
- #32: Pisahkan satuan baku dan tidak baku di Bab 4 (draft).
- #26: Lengkapi demonstrasi operasi hitung Bab 6 (draft).
- #25: Lengkapi demonstrasi membilang sampai 20 (draft).
- #24: Lengkapi demonstrasi Bab 4 Mengenal Bentuk (draft).
- #23: Lengkapi langkah mengajar dan peraga Bab 3 (draft).
- #22: Lengkapi langkah mengajar dan peraga Bab 2 (draft).
- #21: Lengkapi materi dan peraga interaktif Bab 1 (draft).
- #20: Perjelas ilustrasi benda pada Bab 8 (draft).
- #13: feat: Bab 7 Mengukur Panjang Benda — latihan dan evaluasi bertahap (draft).
- #12: Bab 6 Kelas 1 — Penjumlahan dan Pengurangan sampai dengan 20 (draft).
- #11: Integrasi Bab 5 Ayo Membilang sampai 20 ke newbesmartkids (draft).
- #10: Fix Grade 1 shapes mobile layout and matching clarity (draft).
- #4: Grade 1 Chapter 1: lesson mapping, teacher video outlines, and 24 question specs (open).

Particularly review #32 before claiming the requested standard/nonstandard area/volume split is in production. Chapter presence does not prove that older requested refinement is merged.
Source PDFs are not guaranteed to be checked into git. For new chapters obtain the actual uploaded material/practice/evaluation files and build a coverage map first.

## Maintenance checklist

At task end record: date; user request; changed behavior; affected paths; PR/commit if known; exact checks and results; production/preview status; remaining issues. Separate “implemented”, “tested”, “merged” and “live”. Never report all four from only a local build. Keep AGENTS.md for stable rules and this file for changing state.

## Prompt for a new conversation

> Lanjutkan BeSmartKids di m12cksn/newbesmartkids, branch master. Baca AGENTS.md dan docs/PROJECT_HANDOFF.md, lalu periksa kondisi repositori dan PR terbaru. Website utama https://newbesmartkids.vercel.app/. Tugas berikutnya: [isi tugas]. Ikuti pola fitur yang sudah disetujui dan laporkan hasil pengujian yang benar-benar dijalankan.
