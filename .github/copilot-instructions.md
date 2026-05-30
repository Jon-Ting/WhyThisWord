# .github/copilot-instructions.md

Short guidance for AI coding agents working in this repository.

Overview

- Primary entry: See [AGENTS.md](../AGENTS.md) for concise commands, key files, and conventions.
- For environment/setup details and rationale see [README.md](../README.md).

Quick commands

- Install: `bun install` (preferred) or `npm install`
- Dev: `bun dev` or `npm run dev`
- Build: `bun run build` or `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`

Agent behavior

- Make small, focused edits. Prefer minimal, surgical changes.
- Run `npm run lint` and `npm run format` before proposing larger PRs.
- Link to existing docs rather than copying them.
- Avoid changing brand assets or visual design without explicit approval.

If you need more context or a larger plan, refer to [AGENTS.md](../AGENTS.md) and [ROADMAP.md](../ROADMAP.md).
