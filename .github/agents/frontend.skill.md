# AGENT:frontend — Frontend helper skill

Purpose: assist with small, focused frontend tasks: UI bugs, component refactors, accessibility fixes, and code-style consistency.

Scope
- Edit React + TypeScript components under `src/components/` and `src/routes/`.
- Prefer small diffs that preserve existing UI and class-based Tailwind usage.
- Do not re-architect layout or swap styling systems without explicit approval.

Conventions
- Follow TypeScript ESM patterns used in the repo.
- Keep styling with Tailwind CSS v4 utility classes and shadcn/ui Radix primitives.
- Use TanStack Router idioms present in `src/routes/`.

Helpful commands
- Dev server: `bun dev` or `npm run dev`
- Lint: `npm run lint`
- Format: `npm run format`

Checks before proposing PRs
- Run `npm run lint` and `npm run format`.
- Verify the dev server starts and the affected view loads.

Example prompts for this skill
- "Fix the layout bug in the verse reader column when viewport < 640px."
- "Refactor `src/components/passage-picker.tsx` to extract a small `SearchInput` component."

When unsure
- Ask for a screenshot or reproducible steps before making visual changes.
