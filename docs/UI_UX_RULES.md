# BeSmartKids — UI/UX Rules (Project Standard)

Status: Proposed on feature branch; apply to every new page and learning experience after review.

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
