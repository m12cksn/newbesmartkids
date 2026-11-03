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
