# Why This Word — MVP Plan

A contrastive-semantics reader for the Greek New Testament. The user picks a verse, clicks a Greek word, and a right-hand panel opens with lexical info, semantic neighbours, nuance comparison, a "what changes if replaced?" reflection, and cross-references.

## Scope for this build

In:

- Homepage (intro + CTA into the reader)
- Reader for John 1:1 (and 2–3 more sample verses) with clickable Greek tokens
- Word Analysis side panel with all five sub-sections (A–E)
- Mock dataset for ~6–10 Greek words (λόγος, θεός, ἀρχή, ἦν, πρός, ἐν…)
- Responsive layout (panel becomes a drawer on mobile)
- Modular data layer behind a typed interface so SBLGNT/MorphGNT/AI can slot in later

Out (explicitly deferred): auth, notes, social, Hebrew, real lexica, AI calls, full NT corpus.

## Stack note

The platform runs TanStack Start (React 19 + TS + Vite) on a serverless edge runtime, not FastAPI. The plan uses TanStack Start with server functions where needed. The data layer is isolated so a Python backend could replace it later by swapping one module.

## Design direction

- Calm, scholarly, typography-led. Generous whitespace, hairline borders, no decorative gradients.
- Serif for biblical text (e.g. EB Garamond / Cormorant for English, GFS Didot or Cardo for Greek), sans-serif for UI (Inter).
- Light theme as default with a refined dark mode. Subtle hover/selected states on Greek tokens (underline + tinted background).
- Tokens defined in `src/styles.css` via oklch; no hardcoded colors in components.

## Route architecture

```
src/routes/
  __root.tsx          shared shell, head metadata
  index.tsx           landing page
  reader.tsx          reader layout (verse list + reading pane + panel outlet)
  reader.$ref.tsx     specific passage, e.g. /reader/john-1
  about.tsx           short "what this app is / isn't" page
```

Each route gets its own `head()` with unique title/description/og tags.

## Data model (mock, typed)

`src/lib/corpus/types.ts`:

- `Verse { ref, englishText, tokens: GreekToken[] }`
- `GreekToken { id, surface, lemma, translit, morph, glosses[], strongs? }`
- `LexEntry { lemma, translit, pronunciation, morphSummary, glosses[], shortDef }`
- `SemanticNeighbour { lemma, translit, overlap, distinction, typicalUsage, implication }`
- `NuanceSwap { neighbourLemma, ifReplaced: string }` (the "what changes if replaced?" copy)
- `UsageExample { ref, englishSnippet, greekSnippet, highlightLemma }`

`src/lib/corpus/mock/john1.ts` etc. supply the data. A single `getVerse(ref)` / `getWordAnalysis(lemma)` API in `src/lib/corpus/index.ts` is the only thing components import — swap implementations later without touching UI.

## Components

- `VerseReader` — renders English line + Greek line; Greek words are buttons with hover affordance and a selected state.
- `WordAnalysisPanel` — right-side panel (Sheet on mobile, persistent column ≥lg). Sections:
  - `LexicalHeader` (A): lemma, translit, morph, glosses, pronunciation placeholder.
  - `SemanticNeighbours` (B): chips/list of neighbour lemmas; clicking one expands its card.
  - `NuanceComparison` (C): per-neighbour card with overlap / distinction / typical usage / implication, all phrased with hedging language baked into the copy.
  - `WhatChangesIfReplaced` (D): highlighted reflective block per neighbour.
  - `UsageExamples` (E): list of cross-refs with the lemma highlighted inline.
- `PassagePicker` — left rail with the small curated list of verses.
- `SiteHeader` / `SiteFooter` — minimal nav (Reader, About).
- Hedged-language helper: a `<Hedge>` span style + a lint-style constant list of forbidden phrases used only in dev to catch overconfident copy in the mock data.

State: selected word lives in URL search params (`?w=tokenId`) so the panel is shareable and SSR-friendly. TanStack Query is used for `getVerse` / `getWordAnalysis` via the loader + `useSuspenseQuery` pattern, even though data is local — keeps the swap to a real API trivial.

## Mock content quality bar

For John 1:1 specifically, write careful copy for:

- λόγος vs ῥῆμα, σοφία, φωνή, νόμος
- θεός vs κύριος, πατήρ
- ἀρχή vs γένεσις, πρῶτον
- πρός (relational "with") vs μετά, σύν, παρά

Tone modelled on a seminary tutor: hedged, comparative, never dogmatic. An "About the analysis" disclaimer is shown once per session in the panel footer.

## Accessibility & responsiveness

- Greek tokens are real `<button>`s with `aria-pressed`, focus rings, and keyboard navigation across the verse.
- Panel: persistent right column on `lg+`, slide-over Sheet on smaller screens.
- Respect `prefers-reduced-motion`.

## Technical details

- Routing: TanStack Router file routes; `reader.$ref.tsx` reads `ref` and loads verse via `queryClient.ensureQueryData` in the loader, component uses `useSuspenseQuery`.
- Styling: Tailwind v4 via `src/styles.css`; add semantic tokens for `--reader-bg`, `--reader-ink`, `--greek-ink`, `--accent-scholar`, plus serif/sans font stacks.
- shadcn primitives used: Sheet, ScrollArea, Tabs (for "Neighbours / Replace / Examples" inside the panel on narrow widths), Badge, Separator, Tooltip.
- No backend/DB needed for MVP. Lovable Cloud is NOT enabled in this step.
- File layout for future AI: `src/lib/analysis/ai.ts` stub with a typed `analyzeWord(lemma, context)` function returning the same `WordAnalysis` shape — currently throws "not wired"; later backed by a server function calling the Lovable AI Gateway.

## Future integration seams (left as TODOs in code)

- `src/lib/corpus/sources/sblgnt.ts` — parser stub
- `src/lib/corpus/sources/morphgnt.ts` — parser stub
- `src/lib/corpus/sources/strongs.ts` — lookup stub
- `src/lib/analysis/embeddings.ts` — neighbour retrieval stub
- `src/lib/analysis/ai.ts` — AI explanation stub (Lovable AI Gateway when ready)

## Deliverables checklist

- Homepage with positioning copy and a single primary CTA into the reader
- About page explaining what the app is and isn't
- Reader at `/reader/john-1` with clickable Greek tokens
- Word Analysis panel covering sections A–E with John 1:1 mock content
- Passage picker with 3–4 sample passages (others can show "coming soon" cards)
- Responsive layout + dark mode
- Typed data layer + mock implementation
- Stubs for SBLGNT / MorphGNT / Strong's / embeddings / AI

## Open questions before I build

1. Confirm the stack swap: TanStack Start instead of FastAPI for the MVP, with a clean seam to add a Python backend later — OK? OK
2. Do you want a dark mode toggle in the MVP, or light-only for now? I do want the dark mode.
3. Beyond John 1:1, any specific verses you want hand-curated in the mock (e.g. John 21:15–17 ἀγαπάω/φιλέω, Matt 16:18 πέτρος/πέτρα)? John 21:15-17, Romans 3:21-26, Ephesians 2:8-9, Matthew 5:3