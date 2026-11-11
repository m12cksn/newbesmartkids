<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## BeSmartKids chapter quality gate (mandatory)
- Before implementing a new chapter, inspect the approved Grade 1 Chapter 2 and Chapter 3 lesson components, question datasets, and browser tests. Preserve the existing DaisyUI/Tailwind visual system and chapter flow; do not invent a new layout or theme.
- Obtain the actual curriculum/source pages and map every subtopic to learning objectives, manipulable math visuals, practice, and final assessment before coding. Never guess a chapter's contents.
- Every subtopic needs a working learner-controlled visual interaction and at least two practice questions. Each completed chapter requires exactly 24 final assessment questions with checked answers, score and incorrect-answer review. Do not replace an interactive lesson with static decoration.
- Include the standard video panel (real playable video when a source is provided; otherwise clearly labeled placeholder), subtopic navigation, feedback, previous/next controls, and responsive layout.
- Run dataset validation, production build, and Playwright browser tests covering interaction, practice, assessment progression, scoring/review, and viewport widths 320/390/768/1280. Compare screenshots against the approved chapter reference.
- Do not merge, deploy, or claim QA success until all mandatory checks pass and the user approves the preview. Report untested items explicitly. Use a draft PR until ready.

## Assessment variety and visual fidelity (mandatory for every future chapter)
- Never use a generic geometric primitive or an unrelated emoji as a stand-in for a named real-world object. Illustrate the actual object faithfully (e.g. a clothes hanger must look like a hanger, not a shirt). Use verified images or purpose-built accessible SVG illustrations.
- Every question whose reasoning depends on an object, geometric arrangement, grouping, decomposition, size, color, or count must display a meaningful visual for the prompt AND visual answer choices when appropriate. A text-only version must not be the default for visually dependent questions.
- Before writing 24 final questions, build a coverage matrix across learning objectives, reasoning operations, visual types, and difficulty. Do not place blocks of near-identical prompts in subtopic order: interleave subtopics and vary tasks (identify, compare, select, group, find mismatch, compose, decompose, count, infer, complete a pattern).
- Final assessment difficulty must span medium, challenging, and very challenging, age-appropriate for the target grade. No trivial name-recall/fill-in-the-label questions in the final assessment. Complexity must come from mathematical reasoning, not obscure wording or material outside the textbook.
- Validate answer uniqueness, illustration correctness, visual/question alignment, difficulty distribution, and question-pattern diversity; include browser coverage of every final question and screenshots at mobile and desktop sizes.

## Assessment-design reference principles (all subsequent chapters)
- Use the assessment-design guidance of Carnegie Mellon University's Eberly Center and Education Scotland as reference frameworks, not as a claim of official endorsement. Ground every question in a specific learning objective and the source textbook; sample the breadth of skills rather than overtesting one narrow task.
- Vary cognitive operations, contexts, visual representations, and response formats while keeping directions clear and age-appropriate. Interleave question types and subtopics so repeated templates or repeated diagrams do not appear in predictable blocks.
- Write plausible distractors that reveal specific misunderstandings, with exactly one defensible correct answer. Avoid answer-position patterns, accidental clues, ambiguous wording, and repeated correct-option placements; verify the distribution of answer positions across the final assessment.
- Include a pre-merge review checklist: objective coverage matrix; nonrepetitive question stems and visual scenes; balanced challenge; distractor plausibility; answer-key accuracy; and automated plus human review of the entire assessment.

- For visual geometry chapters, include genuine learner actions in a substantial share of assessment items: match by drawing/connecting a line, tap objects to sort them into a destination box, and insert/select pieces to complete a shape. A decorative SVG next to a standard multiple-choice question does not count as a new interaction type. Test the interaction itself and its answer scoring.

## Natural design, not AI-looking (mandatory for every UI change)
- Icons: use `lucide-react` (pinned) for interface icons, stroke 1.5–2, in brand colours. No emoji as interface icons, no hand-drawn generic icon doodles, and no icon placed in a coloured rounded tile purely as decoration. Lesson objects that a question counts or names still need purpose-built, faithful SVG illustrations (see Assessment variety rules).
- Avoid the common generated-page tells: small tracked uppercase labels stacked above headings, middle-dot chains (`A · B · C`) as decoration, text arrows glued to every button (`->`, `→`; use the Lucide `ArrowRight`/`ArrowLeft` icon where an arrow helps), decorative status dots before labels, one coloured word inside a headline, purple-to-blue gradients, glow blobs, cards inside cards, and three identical icon-heading-text tiles.
- Copy: say what the page does in plain Indonesian for children and parents. No buzzwords or filler ("solusi terbaik", "tingkatkan potensimu", "seamless"), no invented numbers, testimonials or statistics.
- Layout: one main idea per screen, short text, headings that name their content, varied section spacing, 16px phone gutter, no horizontal scroll from 320px, visible keyboard focus, sufficient contrast, reduced-motion fallbacks.
- Keep the BeSmartKids brand (DaisyUI `besmartkids` theme, primary #208f6d, Poppins). Existing chapter pages keep their approved layout; apply these rules to new work and remove existing tells only when a change touches that area or the user asks.

## Project continuity (mandatory)
- At the start of a new session, read docs/PROJECT_HANDOFF.md, then verify current master, working-tree changes, open PRs and the user's latest request. The handoff is a dated snapshot, not a substitute for checking code.
- Repository: m12cksn/newbesmartkids. Main branch: master. Production: https://newbesmartkids.vercel.app/. Do not confuse this repository with older BeSmartKids repositories.
- After each material change, update docs/PROJECT_HANDOFF.md in the same PR: scope, relevant paths, validation evidence, remaining issues and deployment state. After merge, record the PR/commit when available; never invent a future merge SHA.
- Keep durable rules here and changing status in the handoff. Preserve the generated Next.js instruction block.
- Respect existing user authorization: an explicit instruction to merge/publish is approval for that scoped change once checks pass; do not ask again solely because it is a new turn. Otherwise use a draft PR and report the preview before merge.
- For Grade 4 and Cambridge subtopics, target 3–5 varied practice questions unless the user specifies otherwise. Exactly 24 questions applies to chapter evaluations, not the daily mastering feature (7 questions).
- Source PDFs may live in the user's ChatGPT files rather than this repo. Obtain the actual files; do not assume a previous session's scratch paths still exist. Match the PDF language, objectives and question/answer formats while changing numbers and imagery as requested.
- Lessons should be complete enough for teacher video narration, concise, and learner-controlled. Require an answer before evaluation progression; final results show correct, wrong, score and incorrect-answer review.
- Daily mastering: preserve 3 levels, 7 questions, missing-term variety, deterministic daily packets at 00:00 Asia/Jakarta, separate local storage per mode/level, retries and old-day progress handling.
- New routes must be discoverable from the relevant homepage/class navigation. Check the click path as well as the direct URL. A deployment success alone does not prove the production route and entry link work.
- Test proportionately: documentation-only changes need content/path/link review, not a full chapter browser suite. Functional changes require relevant dataset/build/browser checks. If local browser/build tooling fails, use CI and state which checks actually ran.
