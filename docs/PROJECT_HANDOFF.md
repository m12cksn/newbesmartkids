# BeSmartKids project handoff

Last reviewed: 11 November 2026 (Asia/Jakarta).
Code baseline inspected: `6707176af7dd0764c0027c52fc46b8892a8e9df3` on master.
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
| Grade 2 | Bab 1 Ayo Membilang sampai 50 (PR #63); Bab 2 Penjumlahan dan Pengurangan (PR #65). Both entries confirmed in production catalog on 11 Nov 2026. |
| Grade 3 | Bab 1 Bilangan Cacah sampai 1.000 (PR #57); Bab 2 Kalimat Matematika (PR #56); Bab 3 Pengukuran Panjang dan Berat (PR #59); Bab 4 Unsur-Unsur Bangun Datar (PR #60); Bab 5 Penyajian Data dalam Tabel (PR #61). All five entries confirmed in production catalog on 11 Nov 2026. |
| Grade 4 | Bab 1 whole numbers to 10,000; Bab 2 fractions; Bab 3 picture/number patterns; Bab 4 area/volume; Bab 5 plane shapes; Bab 6 pictograms/bar charts |
| Grade 5 | KPK and FPB entry and dedicated experience |
| Grade 6 | Bab 1 Pecahan dan Desimal (PR #43, merged 60af854); Bab 2 Rasio (PR #44, live); Bab 3 Kubus dan Balok (PR #46, live) |
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

## Homepage redesign (11 Nov 2026, branch feat/homepage-math-redesign, draft PR)

Request: homepage felt too plain; add math effects and animation while keeping it light and keeping the brand.
- Hero: SVG/CSS floating math symbols and spinning shapes (replaces the 1.9 MB PNG overlay on the homepage), drawn underline, equation ticker, real stats from materials.ts, interactive fraction playground (src/components/home/HeroPlayground.tsx, small client island).
- New "Materi terbaru" section (first six entries of materials.ts, newest first; horizontal snap carousel on phones) with SVG topic icons (TopicIcon.tsx).
- "Tiga langkah belajar" with animated SVG icons; class cards show real "N materi tersedia"/"Segera hadir" counts and 2 columns on phones; daily practice cards with sample problems; CTA formula marquee.
- SiteHeader (shared by all pages): fixed broken desktop navbar layout, now sticky; removed the non-functional "Masuk" button; links to sections.
- Animations are CSS only (transform/opacity, scroll-driven reveal where supported) and disabled under prefers-reduced-motion. No new dependencies.
- Local measurement (Playwright, production build, not real-user data): homepage transfer 260 KB → 228 KB at 1280 px, JS 145 → 146 KB, mobile CLS 0.273 → 0.051.
- Tests: scripts/smoke-homepage.mjs (320/390/768/1280, with and without reduced motion, playground, tabs, click paths) added to CI; daily arithmetic/addition and Grade 6 Bab 1 smoke re-run locally and passed.
- Status: merged as PR #52 (merge commit dbb102e); Vercel production deployment reported success. Production page not opened from the agent sandbox (network blocked).
- Follow-up 11 Nov 2026 (branch feat/class-cards-contrast): class cards redesigned for higher contrast: coloured panel per phase from the brand palette (Fondasi green, Akselerasi dark green #17352a, Mahir yellow, Terapan deep green #14674f), large class number, drifting phase symbols, material-count pill, neutral offset shadow on hover; phase tabs restyled. Homepage smoke updated and passing at 320/390/768/1280.

## Open work and uncertainty

11 Nov 2026 — Kelas 2 Bab 2 Penjumlahan dan Pengurangan delivered via PR #65, merged as 6707176af7dd0764c0027c52fc46b8892a8e9df3. Source: supplied 28-page PDF, book 37–64; mapping docs/GRADE_TWO_ARITHMETIC.md. Three studios with forward/backward steps, guided vertical carry/borrow, number bonds and dynamic story relations. Five practices per topic (15) and 24 interleaved evaluations (8 per topic; difficulty 8/9/7). Source formats retained: numeric line answers, vertical columns, number-bond trees, Diketahui/Ditanya/Solusi/Jadi story sheets and three source-style MC items (plants, equal equation, abacus); weighted shapes use written answers. Story addition accepts reversed operands. Every field must be completed before progression; final results include correct/wrong/score and review. SVG object and visual-choice counts checked; unknown groups remain hidden. Code: GradeTwoArithmetic.tsx, GradeTwoArithmeticVisuals.tsx, grade-two-arithmetic.ts. Independent verification, ESLint and webpack production build passed locally; local Chromium blocked by host socket permissions. Final integrated head dcd88911f8899356fca6dd26b70e40f9a1b779b4 passed all 12 PR workflows, including Arithmetic QA 43009650015 and broad regression 43009650078. Browser CI covers all 39 questions and three studios at 320/390/768/1280, both guided examples per operation, actual carry/borrow changes, image counts, commutative answers, complete-field gating, 23 correct/1 wrong=96/100 and review. Final screenshot artifact 13848904825 reviewed, including all assessment scenes and intermediate guided steps; no text/image/key mismatch found. Tests: scripts/verify-grade-two-arithmetic.mjs, smoke-grade-two-arithmetic.mjs; workflow grade-two-arithmetic-qa.yml. Vercel production deployment succeeded. Chapter /kelas/bermain-angka-kelas-2/materi/penjumlahan-dan-pengurangan, class catalog and homepage returned HTTP 200; confirmed live title, interactive controls, video placeholder, 24-evaluation entry and chapter links in catalog/home. Bab 1 remains present. Concurrent master 3d1f70e (homepage/Lucide/design rules) preserved; only handoff conflict, both records retained. User explicitly authorized automatic merge/publication after checks. Video remains a labeled placeholder.

11 Nov 2026 — Natural-design rules and icon refresh delivered via PR #66, merged as 803c84e32485672d0e1bd2db77d43a2f150c156d after owner approved the preview; all 12 check runs passed and Vercel production deployment status success. AGENTS.md gains a "Natural design, not AI-looking" section. Interface icons switched to lucide-react 1.61.0 (pinned): TopicIcon (topic map), Tiga langkah belajar, ArrowRight replacing text arrows on header banner, hero, latest materials, class cards and closing CTA; decorative status dot on class cards and arrow suffix on mastering buttons removed; Kelas 2 Bab 1 train emoji replaced by TrainFront. Tests updated for the button label "Mulai latihan harian". Local build, smoke-homepage and smoke-grade-two-counting-50 passed at 320/390/768/1280. Remaining: lesson-content emoji in Grade 1 chapters (objects such as animals, tools, food) and ChapterSixExercises still need faithful SVG illustrations; homepage eyebrows ("BARU DITAMBAHKAN") left for owner decision.

11 Nov 2026 — Kelas 2 Bab 1 Ayo Membilang sampai 50 delivered via PR #63 (head db8292c), merged as 26edcba516b90d91187268936f0142061f0dfa89 (first Grade 2 chapter). All 11 PR check runs passed, including Grade 2 Counting 50 QA; Vercel production deployment status success. Production route not fetchable from the sandbox (proxy); owner asked to confirm /kelas/bermain-angka-kelas-2/materi/ayo-membilang-sampai-50. Source: supplied 36-page PDF; mapping docs/GRADE_TWO_CHAPTER_ONE.md. Three learner-controlled labs (pencil bundles, base-ten exchange, compare with tables and number line), 4 practices per subtopic and exactly 24 interleaved evaluations (8/9/7). Local dataset verification, ESLint, tsc, build and Playwright smoke at 320/390/768/1280 passed; screenshots reviewed (scatter overlap and dot-label collisions fixed). CI workflow grade-two-counting-50-qa.yml. Owner authorized merge after CI passes. Video placeholder.

11 Nov 2026 — Kelas 3 Bab 5 Penyajian Data dalam Tabel delivered through PR #61, merged as 09ddb6924440a99223dd458cb2668749d6a18722. Source: supplied 17-page PDF, book 195–211; mapping docs/GRADE_THREE_DATA.md. Two learner-controlled studios (editable family sorting/range; letter tally and ten replacement bead samples), five practices per topic and exactly 24 interleaved evaluations, difficulty 8 medium/9 challenging/7 very challenging. Preserves written names/numbers, full ordering including repeated values, tally and frequency-table responses; accepts all valid tied ordering and unordered name sets, rejects incomplete tables. Long numeric sequences use multiline writing with a completion count. SVG book, ball, pencil, eraser and sharpener match counted names. Code: GradeThreeData.tsx and grade-three-data.ts. Local independent dataset verification, ESLint and webpack build passed; local Chromium blocked by host socket permissions. Final head 38143330a427f5330defd1f872c9a50d777f49bf passed ALL ten PR workflows, including Data QA 42996822407, broad regression 42996822640, Grade 3 Whole/Math Sentences/Measurement/Plane Elements, Grade 4 Whole, Grade 6 Ratio/Cubes/Probability. Browser CI covers 320/390/768/1280, both studios, ten replacement samples, all 10 practices/24 evaluations, exact SVG counts, alternative tied ordering, complete-field gating, 23 correct/1 wrong=96/100 and review. Screenshot artifact 13845195035 reviewed against source and established lesson layout; no text/image/key mismatch found. Tests: scripts/verify-grade-three-data.mjs, smoke-grade-three-data.mjs; workflow grade-three-data-qa.yml. Vercel production deployment succeeded. Chapter /kelas/dasar-matematika-kelas-3/materi/penyajian-data-dalam-tabel, class catalog and homepage returned HTTP 200; verified actual title, editable family input, video placeholder, evaluation entry and new chapter links in both catalog/home HTML. All four earlier Grade 3 entries remain present. Concurrent Bab 4 merge 10d3a59 preserved. User explicitly authorized automatic merge/publication after checks. Video remains a labeled placeholder.

11 Nov 2026 — Grade 3 Bab 1 Bilangan Cacah sampai 1.000 delivered via PR #57, merged as ecfb6f3f9d61023e1134a4d8ab707634cb774c83. Owner explicitly chose existing Grade 4 PDFs as source (no separate Grade 3 PDF), first seven topics only, preserving written/table/algorithm/matching response formats while adapting numbers to 0–1,000. Seven studios, 28 practices and 24 interleaved evaluations; alternate money decompositions accepted within inventory. Code: GradeThreeWholeNumbers.tsx, GradeThreeBookAnswer.tsx, grade-three-whole.ts. Catalog/route /kelas/dasar-matematika-kelas-3/materi/bilangan-cacah-sampai-1000. Local independent key/range/algorithm verification, ESLint and webpack build passed. Final head 87e266a3910bf489b18b5cf21d5631806873e1d4 passed Grade 3 Whole QA 42976682974: all 52 questions, both guided examples per operation, dynamic place value, 1,000 boundary and exchanges, real pair connections, alternate money answer, required-field gating, 23 correct/1 wrong =96/100 with review at 320/390/768/1280. Screenshot artifact 13836450267 reviewed against supplied book scans; no count/text/answer mismatch found. Initial test navigation timeout occurred before entering the chapter; fixed URL/visible-link synchronization and final run passed. Grade 4 Whole QA 42976682821, Grade 3 Math Sentences QA 42976682838, Cubes QA 42976682851, Probability QA 42976682947 and Ratio QA 42976682994 passed on the same final head. Broad regression 42976682932 still running when release recorded; do not claim it passed without checking. Concurrent Grade 3 Bab 2 from PR #56 preserved by merging master d5eb2a9; both chapter entries confirmed in production catalog. Vercel deployment succeeded; direct chapter and class catalog returned HTTP 200; live HTML contains the new title and interactive place table. Automatic merge/publication explicitly authorized by owner after checks, without another confirmation. Video remains a labeled placeholder.

11 Nov 2026 — Grade 4 Bab 1 quality upgrade delivered in PR #53, merged as 865acf361295ab63b30b28ae64241b2fa6ba5c51; preserves homepage work from dbb102e4ba63c7e738776d360debfe08721ddaf9. Narration-ready explanations/misconception reminders, learner exchange/multiplication/sharing/factor studios, visible addition carry, corrected carry explanation;32 practices and24 revised evaluations, three per objective including compare/order, multi-field answers and visual scaffolds. Code: GradeFourWholeNumbers.tsx, WholeNumberStudio.tsx, WholeNumberQuestion.tsx, grade-four-whole-numbers.ts. Mapping/validation: docs/GRADE_FOUR_CHAPTER_ONE.md. Independent recomputation of24 keys, ESLint and production build passed. Final-code Whole Upgrade QA 42971087445 passed on e4e1420d1bb93d20ccdab68e2fed1247a12e89e3: both guided examples for four operations, new manipulative controls/self-check,32 practices/24 evaluations, empty-answer gating,23 correct/1 wrong=96/100 and review at320/390/768/1280. Artifact 13832708830 reviewed against earlier mobile/desktop full scene grids; final mixed-operation signs confirmed. Final-code Ratio QA 42971087425, Cubes QA 42971087518 and Probability QA 42971087437 passed. Broad regression 42970461368 passed on initial implementation ef2ee6320b04f121ccacfcdeb26c690c9af77609; later changes only refine new visual signs/alignment, add one practice diagram and remove superseded unused data. Final broad rerun 42971087532 still running at release recording; do not claim it passed without checking. Vercel production deployment succeeded; direct chapter and catalog checked after deployment. User requested quality improvement within the existing test/merge/publication workflow. Video remains a placeholder.

11 Nov 2026 — Grade 6 Bab 4 Peluang delivered via PR #50, merged as ccf7d484ec51669f774d338fac083fba4dfefc02. Three studios (scale with replacement experiments; equal-sector painting/fairness; two boxes with differing totals), 15 practices and 24 interleaved evaluations. Open spinner/dice/bag tasks accept alternate mathematically valid constructions. One-versus-two-dice fairness uses a complete 36-pair grid. Sources and conventions: docs/GRADE_SIX_CHAPTER_FOUR.md. Code: src/data/grade-six-probability.ts and src/components/learn/GradeSixProbability.tsx; catalog/route /kelas/konsep-inti-matematika-kelas-6/materi/peluang. Local dataset verification, changed-file ESLint and webpack production build passed. Local browser launch blocked by host socket permissions; CI Probability QA 42956407877 passed on final head 86b9c456a7594e9c28c17ebae3a12d98daa7e22a: build, all 15 practices and 24 evaluations, true painting, spinner pointer alignment, ordered-pair labels, gating, 23 correct/1 wrong = 96/100 and review at 320/390/768/1280. Final screenshot artifact 13827920224 reviewed; earlier artifacts reviewed all practice/evaluation scenes, final images confirmed corrected unknown-box and row/column labeling. Broad regression 42955604682 passed on initial chapter head a83a02f2986a11984461d1579056d467e1a13764; later changes only affected new probability visuals and assertions. Final-head Ratio QA 42956407900 and Cubes/Orbit QA 42956407972 passed. Broad rerun 42956408038 still running when release recorded; do not describe it as passed without checking. Vercel production deployment succeeded, chapter and Grade 6 catalog returned HTTP 200; actual chapter content and catalog entry link confirmed in production HTML. User explicitly authorized merge/publish after checks. Video remains a labeled placeholder.

11 Nov 2026 — Rotatable cube model enhancement is live through PR #48, merged as bd7ceaf20248d4fdf10cb590196cfa74324f8d10. “Mode 3D” on Grade 6 cube illustrations opens a pure SVG voxel renderer with mouse/touch orbit, wheel/pinch/button zoom, front/right/top camera presets, reset and keyboard arrows/+/-/Home. Static diagrams remain the initial reference and each new question resets to it. Camera-only changes preserve the model, physical axes, marks, student drawing and answer keys; unknown marked-cube faces remain blank. Decorative video thumbnail stays noninteractive. Code: src/components/learn/CubeOrbit.tsx, CubesVisuals.tsx and GradeSixCubes.tsx; no added dependency. Local lint, independent chapter geometry/key verification and webpack build passed. Final head b204fb61600e570fe5c7f9cfc0442b278034524a passed Cubes + Orbit QA 42932020185 (all 15 practices and 24 evaluations plus actual mouse drag/wheel, touch drag/pinch, presets/reset, keyboard, drawing retention and unchanged gating at 320/390/768/1280); broad regression 42932020144 and Ratio QA passed. Screenshot artifact 13816383575 reviewed at mobile/desktop. Vercel production deployment succeeded; chapter returned HTTP 200 and live HTML contains the Mode 3D entry. Tests: scripts/smoke-cube-orbit.mjs in .github/workflows/grade-six-cubes-qa.yml.

10 Nov 2026 — Kelas 6 Bab 3 Kubus dan Balok delivered through PR #46, merged as 1862ede48a07dbcb011e16921449eb90d2663177. Three studios: cube/cuboid building, layer decomposition/rotation; front/right/top projections, face symbols and unique reconstruction; coordinate/shortest-path and marked-cube rolling. Five practices per topic (15), 24 interleaved evaluations (8 per topic). Actual construction, painted grids, connected matching, point picking and route building are graded. Source mapping/conventions: docs/GRADE_SIX_CHAPTER_THREE.md. Code: src/data/grade-six-cubes.ts, src/components/learn/CubesVisuals.tsx and GradeSixCubes.tsx. New route /kelas/konsep-inti-matematika-kelas-6/materi/kubus-dan-balok is in the Grade 6 catalog. Local independent key/voxel/projection/rotation/path/rolling and reconstruction uniqueness checks, ESLint and webpack production build passed. Grade 6 Cubes QA 42851162640 passed for final head 50566bae818ac11f1fbf7ae6b98bc6b78bc6ce70: all labs, 15 practices, 24 evaluations, alternative shortest routes, answer gating and 23 correct/1 incorrect = 96/100 with review at 320/390/768/1280 px. Screenshot artifact 13779439757 reviewed at mobile/desktop, including all practice and evaluation questions. Earlier match-card overflow and decorative illustration overlap were fixed and retested. Broad regression 42851162123 and Ratio QA passed on the same head. A duplicate broad run 42851066055 timed out at the unchanged Grade 4 pictogram slider expectation at 1280 px; the identical-head repeat passed, so retain this as an intermittent test observation, not a verified Grade 4 regression. Vercel deployment succeeded; production chapter and Grade 6 catalog returned HTTP 200; verified live chapter content and catalog link. User explicitly authorized merge/publication after checks. Video remains a labeled placeholder. Tests: scripts/verify-grade-six-cubes.mjs, scripts/smoke-grade-six-cubes.mjs; workflow .github/workflows/grade-six-cubes-qa.yml.

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
