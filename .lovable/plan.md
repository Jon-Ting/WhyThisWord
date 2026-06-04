## Why the published page errors with Cloudflare 1102

`src/lib/corpus/` contains **1,193 chapter JSON files totaling ~141 MB**. Both `getPassage` (`loadSingleChapter` / `loadMultiChapterRange`) and `findExamplesInCorpus` use Vite dynamic `import("./data/${folder}/${bookId}/${ch}.json")`. Vite/Wrangler resolves that glob at build time and bundles **every** chapter into the Worker.

When the published Worker boots and the route loader runs in SSR, it has to evaluate that huge module graph and hold it in memory. Cloudflare Workers cap each request at ~128 MB memory and ~50 ms CPU on the free plan (higher but still bounded on paid). The Worker blows past the limit and Cloudflare returns **Error 1102 — Worker exceeded resource limits**. (Local `vite dev` and `vite build` work because Node has no such cap.)

`findExamplesInCorpus` makes it worse: it loops every book and every chapter, awaiting an import for each one, so a single call can touch the entire corpus.

## Plan: ship the corpus as static assets, not Worker code

### 1. Move corpus JSON out of the Worker bundle
- Relocate `src/lib/corpus/data/**/*.json` to `public/corpus/**/*.json` (or another folder served as static assets). Static assets in `public/` are served directly by Cloudflare's static-asset layer and are **not** bundled into the Worker.
- Keep `books.json`, `louw-nida-domains.json`, and any small index files that need to stay importable inside `src/lib/corpus/data/` (they're tiny and used synchronously).

### 2. Replace dynamic `import()` with `fetch()`
Rewrite the chapter loaders in `src/lib/corpus/index.ts`:
- `loadSingleChapter`, `loadMultiChapterRange`, and `getChapterVerseCount` should call `fetch(\`/corpus/${folder}/${bookId}/${ch}.json\`)` instead of `import(...)`.
- During SSR the loader runs inside the Worker; use an absolute URL built from the incoming request's origin (passed via the route loader's `context`/`request`) so `fetch` resolves to the static asset binding. On the client, a relative `/corpus/...` URL is fine.
- Add a small in-memory `Map` cache so repeated reads in the same request don't refetch.

### 3. Fix the concordance hot path
`findExamplesInCorpus` cannot scan 1,193 files per request. Two options, pick one:
- **Preferred:** generate a small inverted index at build time — `scripts/build-concordance.js` walks the JSON corpus once and writes `public/corpus/index/by-lemma/<strongs>.json` (or a single `lemma-index.json` shard-per-letter). At runtime `findExamplesInCorpus` fetches only the matching shard and then fetches at most `limit` chapter files for snippets.
- **Fallback:** move concordance work to the client only (call it from a `useQuery` inside the component, never in the route loader), so SSR never touches it. Combine with shard #1 above for acceptable client performance.

### 4. Verify
- `bun run build` succeeds and the Worker bundle size drops from >100 MB to a few MB (`wrangler deploy --dry-run --outdir=dist-worker` to inspect).
- Visit `/reader/john-3` on the published URL — page renders, no 1102.
- Visit `/reader/john-3:16-4:5` (multi-chapter) and a word-analysis flow (exercises `findExamplesInCorpus`) — both succeed.

### Files touched
- `src/lib/corpus/index.ts` — replace `import()` chapter loads with `fetch()` + cache; accept request origin for SSR.
- `src/lib/corpus/concordance.ts` — use precomputed lemma index; fetch chapters on demand.
- `src/lib/corpus/louw-nida.ts` — keep as-is if `lexicon.json` / `louw-nida.json` are small (<1 MB total); otherwise also move under `public/corpus/` and `fetch`.
- `src/routes/reader.$ref.tsx` — pass `request` (or origin) into `getPassage` so SSR fetch works.
- New: `scripts/build-concordance.js` and generated `public/corpus/index/...`.
- Move: `src/lib/corpus/data/{ot,nt}/**` → `public/corpus/{ot,nt}/**`.

### Non-goals
- No change to UI, routing, styling, or feature behavior.
- No database/Lovable Cloud introduction — corpus stays as static JSON, just served as assets instead of bundled code.
