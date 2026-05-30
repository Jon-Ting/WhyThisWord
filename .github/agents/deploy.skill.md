# AGENT:deploy — Deployment helper skill

Purpose: automate and verify build and Cloudflare Pages deployment tasks.

Scope

- Build verification, simple wrangler checks, and deployment guidance for Cloudflare Pages.
- Do not perform destructive changes to `wrangler.jsonc` without confirmation.

Typical steps

1. Run the production build: `bun run build` or `npm run build`.
2. Verify the `dist/` (or configured output) contains app assets.
3. Use Wrangler or Cloudflare Pages to publish. Example:

```bash
# after a successful build
# publish to Cloudflare Pages (adjust command to your wrangler setup)
wrangler pages publish ./dist
```

Preflight checks

- Ensure `wrangler.jsonc` has a valid `main` and `compatibility_date`.
- Confirm `nodejs_compat` flags if server-side code runs on Workers.

Helpful commands

- Build: `bun run build` or `npm run build`
- Lint/format: `npm run lint` / `npm run format`

When to ask

- If `wrangler` credentials or project names are required, ask the human to provide them rather than attempting to use stored secrets.
