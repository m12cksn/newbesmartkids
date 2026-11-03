# BeSmartKids — UI/UX Rules (Project Standard)

Status: Project rules. Proposed additions must be reviewed before merge; once merged, apply to every change.

## Source of truth
- Existing repository design is the source of truth. Inspect `src/app/globals.css`, homepage components, and existing learning/practice components before changing UI.
- Preserve DaisyUI v5 + Tailwind CSS v4, the `besmartkids` theme, Poppins, and existing brand palette (primary #208f6d).
- Reuse existing layout, navigation, typography, spacing, buttons, focus treatment, and component conventions. Do not install shadcn or another UI kit merely to redesign pages.
- When a missing pattern is needed, extend the existing system with a small reusable component.

## Avoid generic AI-template design
- No arbitrary gradients, glow, glassmorphism, excessive shadows, random emoji, decorative statistics, repetitive identical cards, or generic marketing-style hero sections in learning flows.
- Do not replace the current visual identity with an invented design system.
- Prefer clear editorial hierarchy, purposeful whitespace, and contextual educational illustrations over ornamental UI.
- Keep consistent radius, border, elevation, type scale, and color use across lessons, practice, review, and landing pages.

## Learning experience
- One primary learning objective per activity; clear instruction, manipulable visual, immediate feedback, concise explanation, next step.
- Build original React/SVG math manipulatives (number line, factor tree, grouping objects) and style their surrounding controls with DaisyUI.
- Show *why* an answer works; don't rely on a green/red state alone.
- Question view should aim to fit a single mobile viewport without clipping. Allow accessible scrolling when necessary rather than shrinking content to illegibility.
- Touch-friendly targets, keyboard operability, visible focus, meaningful labels, reduced-motion support, and adequate contrast.
- Motion must explain a mathematical transition or provide useful feedback, not merely decorate.

## Content and integration rules
- Preserve the educational correctness of KPK/FPB, including distinction between meeting schedules (KPK) and equal grouping without remainder (FPB).
- Use data-driven lesson sections and question objects with answers and explanations; avoid duplicating bespoke pages for every topic.
- Confirm source PDF/page mapping before claiming textbook fidelity.
- Do not add auth, paid services, or new dependencies without a demonstrated MVP need.

## Workflow / acceptance checklist
1. Inspect relevant existing repo components and Next.js 16 local documentation before implementing.
2. Build in a feature branch; never merge or deploy to production without owner approval.
3. Check visual consistency against current homepage and existing lesson screens at mobile, tablet, desktop sizes.
4. Verify each interactive component, correct/incorrect answer feedback, score, keyboard/touch behavior, and accessibility.
5. Run lint/build and browser checks when an execution environment is available; report exactly what was and was not tested.
6. Provide a reviewable PR and preview URL only when genuinely available.

## First application: KPK & FPB Grade 5
- Lesson path: multiples → factors → KPK → FPB → prime factor trees → word problems → 20-question assessment.
- Rebuild prior standalone HTML concept as native Next.js/React components in the existing DaisyUI design, not an embedded iframe or a parallel theme.
- Use a feature branch and request review before merging.


## Visual animation technology standard (mandatory)
- **React + SVG** is the default for original, crisp, responsive, accessible mathematical visuals and direct manipulation.
- **Motion for React** is the default animation library for meaningful transitions: number-line jumps, grouping, highlighting factors, answer feedback, and guided demonstrations. Honor `prefers-reduced-motion`.
- **DaisyUI + Tailwind** style the surrounding learning interface; they are not a substitute for mathematical SVG visuals.
- **React Konva** may be introduced only when complex canvas manipulation is justified; prefer lightweight SVG first.
- **Manim** is reserved for optional pre-rendered explanatory videos, not live in-browser interactions.
- Avoid heavy animation libraries or unnecessary dependencies; verify compatibility and bundle cost before installing Motion.
- Every animation must correspond to a learning event, and the lesson must remain understandable without animation.


## Additional assets and dependencies (authorized when justified)
- Developers may install additional illustration, icon, visualization, interaction, or animation libraries when they materially improve clarity, accessibility, or the learning experience.
- First prefer existing dependencies, React/SVG/Motion, and reusable components. Add only what a specific learning interaction needs; avoid package proliferation.
- Evaluate license, security, Next.js compatibility, bundle size, performance on low-end mobile, maintenance status, and accessibility before installing.
- Use original or properly licensed illustrations; record attribution where required. Do not copy third-party visual source code or proprietary assets without permission.
- Keep the DaisyUI visual identity and established design tokens even when a third-party library is introduced.
- Record new dependencies and rationale in the PR. Branch, preview, and owner-review rules remain in force; no automatic merge to master.

## CoreSpeed Labs UX reference — mandatory for all future changes
- Use https://corespeedlabs.com/ as a **reference for UI/UX quality and interaction patterns**, not as a source to copy proprietary code, illustrations, text, logos, or exact layouts. The result must be an original BeSmartKids implementation.
- Preserve BeSmartKids branding throughout: name, logo, green theme (#208f6d), Poppins, and DaisyUI/Tailwind design tokens. Do not introduce CoreSpeed branding.
- Aim for CoreSpeed-like polish: restrained editorial composition, elegant typography, clear visual hierarchy, spacious but efficient layout, compact consistent radius, responsive components, focused actions, and smooth purposeful transitions.
- Prioritize a learning-focused interface: one clear question per view, obvious answer controls, minimal distraction, concise feedback, and progress/next actions visible without unnecessary scrolling. Do not force fit-to-viewport at the cost of accessibility or legibility.
- Before any UI change, compare the affected page with the current BeSmartKids design and the CoreSpeed reference across mobile, tablet, and desktop. Record differences and intentional adaptations in the PR.
- Do not claim exact visual parity without browser comparison; if the reference is unavailable, note that and preserve the documented design system.

## Performance and 10,000-user capacity — mandatory change gate
- Capacity planning assumption: **10,000 registered learners, up to 5,000 concurrently active learners (50%)**. This is a target to validate, **not a proven capacity claim**.
- Every PR must explain potential impacts on bundle size, route loading, network requests, caching, database/auth traffic, video delivery, mobile responsiveness, and operational cost. A documentation-only change can mark nonapplicable items N/A.
- Split lesson/question data by topic or route; never ship the entire question bank to every visitor. Prefer server components and static/cached public content where safe; use client components only for interactive portions. Apply dynamic imports/lazy loading to costly math widgets and media.
- Use optimized SVG and properly sized/compressed image assets; defer offscreen media. Use YouTube embeds or lazy-loaded players rather than serving video files from the Next.js deployment. Do not autoplay videos.
- Run calculations, answer checking, feedback, and session scores in the browser when possible per MVP blueprint. Do not add per-answer database writes or background polling. Supabase remains for authentication and access grants only.
- Enforce premium access server-side before protected data is returned; do not expose paid question data through public static assets or public cache. Public pages may use CDN caching; authenticated/private responses require appropriate nonpublic cache policies.
- Avoid global imports of lesson modules, large animation packages, unnecessary dependencies, blocking scripts, and continuously running animations. Support low-end mobile and prefers-reduced-motion.
- Performance targets on representative real-user measurements: p75 LCP <= 2.5 s, p75 INP <= 200 ms, p75 CLS <= 0.1. Record actual results and testing conditions; do not present targets as measurements.
- Validate concurrency incrementally using authorized staging tests at 100, 500, 1,000, 2,500, then 5,000 virtual users with realistic mix of cached page visits, login/access checks, and lessons. Monitor p95 latency, error rate, cache hit rate, bandwidth, Vercel/Supabase quotas and costs; stop on unsafe failure thresholds. Never run uncontrolled load tests against production.
- No PR is considered performance-approved merely because lint/build passes; record route-level bundle impact and any available browser/performance test results, or explicitly state what remains untested.
- If a change increases payload, requests, or server-side processing, justify it and document a mitigation before merging.

## Required lesson/video workflow
- Every material must have a video section at the top, using the teacher's own recorded lesson when available and a clear "video coming soon" state otherwise.
- Derive the student-facing summary, video recording script/storyboard, interactive manipulatives, questions, and explanations from the same verified source material and subtopics.
- Keep video playback optional for reading/solving; lazy-load third-party players and preserve an accessible fallback.
- Each lesson follows: video -> concise summary and visual explanation -> interactive practice -> result and review.

## Mandatory early-grade math content and assessment rules
- Teach each number using **concrete quantity + numeral + Indonesian number word** (example: 10 (sepuluh) benda); ensure reading and writing are explicitly covered, not only counting.
- Build original question interactions based on the teacher-provided end-of-chapter assessment: ten-frames, counting objects, comparing groups, fill-in number sequences, number-bond diagrams, and nested decompositions. Do not reduce every reference format to a generic multiple-choice template.
- Match interaction type to learning objective: numeric fill-in for missing digits, tap/count for quantities, select/compare for groups, and editable number-bond nodes for decompositions. Provide accessible keyboard/touch alternatives.
- When a question is multiple choice, **exactly four meaningful, distinct options (A–D)** are mandatory. Correct answers must vary across A/B/C/D with approximately balanced distribution across the assessment; never systematically use one letter. Do not use irrelevant distractors just to fill four choices.
- Verify all displayed objects, question wording, correct answers, distractors, feedback, and number words against the source concept. Avoid visual/answer mismatches and repeated near-identical questions.
- Review variety by subtopic, interaction type, difficulty, and visual representation before approval. Record the mix in PR; verify it in browser.

## Visual diversity requirement
- Do not default every elementary math problem to identical dots or circles. Rotate meaningful original representations: fruit, pencils, toy cars, stars, flowers, building blocks, ten-frames, number bonds, and number lines, according to the concept.
- Use accessible SVG/React primitives and consistent visual counting semantics; check every illustrated object count against the answer key.
- Prefer original lightweight assets and reusable components over copying external GitHub source or adding a heavy canvas library. Document any third-party license and performance impact.

## Grade 1 interactive QA checklist
- Text must name the actual illustrated objects (e.g. 8 pensil, 9 bintang); do not show generic or mismatched nouns. Handle zero with an explicit empty state rather than implying invisible objects are present.
- Place missing-number inputs inside number-bond and number-sequence diagrams, not only in a disconnected answer field. Support click/touch and keyboard.
- Offer direct group selection and object counting/marking where appropriate, plus controls to split a whole into parts.
- Difficulty must reflect cognitive demand, not only the question's position: easy identification, medium comparison/number bonds, challenging multi-step reasoning. Vary wording, representation, and task within each subtopic; textbook pages are references, not scripts to duplicate.
- Before merging: check TypeScript/build, browser interaction, mobile viewport, all 24 answer keys, and accessible controls. Do not claim production readiness without those checks.


## Mandatory pre-merge and pre-deploy QA gate (all future changes)
- **Never merge to `master` or approve a production deployment while any required test is failing, pending, skipped without justification, or unverified.** A successful build alone is insufficient.
- For every code PR: run `npm ci`, relevant content/data unit tests, `npm run build`, and Playwright Chromium end-to-end tests against the production build. Run lint/typecheck when scripts are available. Fix failures and rerun against the **latest commit SHA**; older successful runs do not count.
- Browser QA must cover the affected student journey end to end: navigation, correct and incorrect answers, feedback, progression, retry/result, interactive math visuals, and keyboard input. Check at least mobile 390 px, a narrow mobile 320 px, tablet 768 px, and desktop 1280 px; inspect touch interactions and horizontal overflow. A scrollable internal carousel/number line is allowed, but document-level horizontal overflow is not.
- Confirm responsive screenshots or visual inspection, accessibility/focus, and console/runtime errors. Distinguish automated assertions from manual visual testing; never claim coverage that was not executed.
- Report test command, commit SHA, outcome, browser/viewport, and known limitations in the PR. If any check is unavailable, mark it **NOT VERIFIED** and block merge/deployment until resolved or the owner explicitly accepts a documented exception.
- Require owner approval before merge or production deploy. After merge, verify the deployment status and run a smoke test on the actual deployed URL; a green preview does not prove production works.
- On failure: diagnose, fix on the feature branch, rerun all gates, and only then request merge. Do not bypass failing CI merely because the owner asks to proceed; explain the remaining risk and ask for explicit exception if necessary.
- Repository branch protection should require the CI status check before merging to `master`; this document alone does not technically enforce GitHub settings.

## Mandatory design parity gate — approved chapter is the visual contract
- **Grade 1 Chapter 2 (Penjumlahan sampai dengan 10) is the approved baseline for Chapter 3 and subsequent Grade 1 lessons.** New chapters must reuse its page shell, return-to-grade link, hero heading scale, video/CTA two-column panel, section tabs, white lesson card, controls, spacing, typography, colors, and bottom navigation. Adapt only the mathematical visuals and chapter-specific copy.
- Before implementing a new chapter, read the complete existing chapter component, the shared layout and `src/app/globals.css`. Prefer extracting reusable shared components from the approved chapter rather than recreating the layout with different DaisyUI utility classes.
- Never mix `bg-base-100`, `bg-success/5`, `text-success` or other theme-dependent tokens into a new screen without checking computed appearance in the actual active theme. A dark panel with low-contrast dark text is a **release blocker**.
- Create side-by-side screenshots of the approved chapter and the new chapter at 390 px and 1280 px, in the same browser and theme. Compare header, back navigation, video panel, section tabs, learning card, CTA, contrast, and spacing. Save review evidence in the PR.
- Automated build and overflow tests alone **do not prove visual consistency**. A new chapter cannot be declared ready until screenshot comparison and contrast/readability review have been performed, recorded, and approved.
- For each new lesson, add browser assertions for visible back link, video panel, heading, section navigation, lesson card, and primary CTA, plus checks for text readability. Keep tests for math content and interactions separate.
- When a design discrepancy is found, fix it on the feature branch before merge or deploy. Do not treat a functional page as finished if it violates the approved visual baseline.
