# AGENTS — Guidance for AI coding agents

Purpose: give succinct, actionable guidance so AI coding agents can be immediately productive in this repository. This file is minimal by design — link to deeper docs rather than duplicating them.

## Quick start (use these commands)
- Install: `bun install` (preferred) or `npm install`
- Dev server: `bun dev` or `npm run dev` (runs `vite dev`)
- Build: `bun run build` or `npm run build` (runs `vite build`)
- Lint: `npm run lint`
- Format: `npm run format`

See the top-level README for environment notes and rationale: [README.md](README.md).

## Key files and areas to inspect
- `src/` — application source (components, hooks, lib, routes)
- `src/components/` — UI components and `src/components/ui/` primitives
- `src/lib/` — utilities, analysis, and corpus mock data
- `vite.config.ts`, `wrangler.jsonc` — build and Cloudflare deployment settings
- `package.json` — scripts and developer-facing commands

## Conventions & preferences
- Language: TypeScript, ESM modules.
- Framework: React with TanStack Start (Router / Query). Follow existing routing patterns in `src/routes/`.
- Styling: Tailwind CSS v4 and shadcn/ui Radix primitives. Preserve class/utility structure rather than migrating to CSS-in-JS.
- Packaging: Bun is the recommended package manager/runner, but npm-compatible scripts exist.
- Tests: none in the repo — avoid creating heavy test infra without coordination.

## Recommended agent behavior
- Prefer small, focused edits. Change the minimal set of files necessary.
- Link to existing docs (README.md, ROADMAP.md) rather than copying content.
- Run `npm run lint` and `npm run format` locally before proposing large PRs.
- Avoid modifying brand assets or visual design without explicit approval.

## Suggested next customizations
- `AGENT:frontend` skill — provide quick codefixes, component patterns, and UI tests.
- `AGENT:deploy` skill — automate Cloudflare Pages/Wrangler deploy checks.
- Check [.github/copilot-instructions.md](.github/copilot-instructions.md) which points agents to this file and to `README.md` for env setup.

---
If anything here is surprising or missing, tell me what you want emphasized and I'll update this file.
