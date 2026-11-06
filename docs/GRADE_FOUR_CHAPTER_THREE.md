# Kelas 4 Bab 3 — Pola Gambar dan Pola Bilangan

## Sources and scope
Read all 6 pages of Pola gambar.pdf, all 6 pages of Pola bilangan.pdf, and the 2 evaluation pages. Scanned pages were rendered and inspected; text was OCR-assisted. The lesson is limited to growing/shrinking counts with a constant additive difference. It does not introduce multiplication patterns or quadratic sequences.

Both sections retain the chapter video panel, navigation, interactive lesson beside the explanation, five exercises, feedback, and the shared GradeFourQuiz assessment/results flow. The video panel remains honestly marked as coming soon until a YouTube URL is supplied.

## Coverage before implementation
| Source | Learning objective | Interaction / representation | Practice | Evaluation |
|---|---|---|---|---|
| Picture activities 1–2 | Count groups and compare constant increases/decreases | Editable count/step/direction, object builder, incremental table | p1,p4 | e1,e3,e10,e17 |
| Picture exercises 1–4; evaluation 1–4 | Continue growing/shrinking groups | Illustrated marbles, hexagonal tiles, flowers, cans and bricks | p1,p2,p4 | e1,e3,e8,e10 |
| Picture exercise 5 | Fill missing groups, including middle/first | Choose actual picture alternatives; count builder | p3,p5 | e6,e12,e15,e17,e19,e22 |
| Number exercises 1–5; evaluation 5–8 | Find one or several missing terms | Direct input in numbered sequence boxes | p6,p7,p8 | e2,e4,e7,e11,e14,e18,e21,e24 |
| Number exercises 6–8; evaluation 9–10 | Extend a contextual table to a distant position | Tables; paired answers for two positions | p9,p10 | e5,e9,e13,e16,e20,e23 |

All 10 evaluation source groups are represented, interleaved across 24 questions. Numbers, illustrations and contexts differ. Challenge progresses from predicting the next term to recovering inner/first terms, filling nonadjacent blanks, and extrapolating two distant rows. All terms remain nonnegative integers. Difficulty comes from the number/location of gaps and distance of extrapolation, rather than vocabulary.

## Answer and illustration review
- 34 independent literal answer keys are checked against the generated questions.
- Countable SVGs depict the named objects; no unrelated emoji stand-ins. Each visible item corresponds to one object. Picture choices also display actual counts.
- Wrong picture alternatives represent an adjacent term or an incorrect step; each has exactly one correct choice. Evaluation correct choice positions: B, C, A, B.
- Shared quiz adds an optional readiness predicate for multi-field questions. Existing chapters preserve their default behavior.
- Evaluation cannot advance with unanswered/partially answered fields; final results include correct, incorrect, rounded score, and wrong-answer explanation.
- Every final item and all exercises are included in the browser test at 320, 390, 768 and 1280 px. Tests verify object counts, control actions, backward navigation, partial-answer gating, final score and wrong-answer review.

## Validation commands
- `node --experimental-strip-types scripts/verify-grade-four-patterns.mjs`
- `npm run build`
- `node --experimental-strip-types scripts/smoke-grade-four-patterns.mjs`
- Existing chapter browser regression suite in GitHub Actions.

Local managed preview currently passes Vite flags (`--host`, `--strictPort`) to Next.js and fails before startup. Application code is not changed to accommodate this infrastructure mismatch. Browser QA is run in GitHub Actions, with all-question screenshots retained as an artifact; deployed Vercel preview is used for visual inspection.
