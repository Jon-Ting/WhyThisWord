# Unified Implementation Plan: Phases 2, 3, 4, 5 & OT Expansion

This document outlines the detailed architectural designs, code structures, and user experience enhancements for the remaining development stages of **Why This Word**, now including support for the Old Testament.

---

## User Review Required

> [!IMPORTANT]
> **API Key & Database Setup (Phase 2)**:
> - Set a `GEMINI_API_KEY` secret in your environment (for both local `.env` and Cloudflare Pages settings).
> - Enable a Cloudflare KV Namespace named `WHY_THIS_WORD_CACHE` in your wrangler config. In development, the application will automatically write cache files locally under a `.cache/` folder to avoid cloud dependencies.
> 
> **Build-time Concordance Index (Phase 4)**:
> - Running search queries across the entire 50MB parsed Greek New Testament on the client is inefficient. We propose generating a pre-compiled search index (`lemma-search-index.json`, ~1.5MB) during the application build phase. This allows instantaneous client-side searching of lemmas and concordance lookups without database overhead.
> 
> **Old Testament Expansion (Cross-Phase)**:
> - We are expanding the scope to include the 39 books of the Old Testament. This requires Right-to-Left (RTL) rendering support, Hebrew/Aramaic morphology decoding, and generalized data schemas to handle both Greek and Hebrew tokens.
> 
> **Authentication Provider Choice (Phase 5)**:
> - We propose establishing a modular auth interface (`src/lib/auth/index.ts`) that defaults to Firebase Auth but can easily switch to Supabase. Google Sign-In and Email Link logins will be enabled as defaults.

---

## Phase 2: LLM-Augmented Semantic Synthesis & Schema Generalization

**Goal**: Dynamically generate contrastive semantics for words on-the-fly and cache the results, while generalizing types for multi-language support.

### Proposed Changes

#### [MODIFY] [types.ts](file:///home/DART/jonathant/Documents/WhyThisWord/src/lib/corpus/types.ts)
- Generalize `GreekToken` to `CorpusToken`.
- Add a `language` field to `Verse` and `Passage` (enum: `'greek' | 'hebrew'`).
- Ensure `WordAnalysis` and `SemanticNeighbour` interfaces are flexible enough for Hebrew/Aramaic grammar and semantic domains.

#### [MODIFY] [gemini.ts](file:///home/DART/jonathant/Documents/WhyThisWord/src/lib/analysis/gemini.ts)
- Update the AI prompt to dynamically adapt based on language (e.g., "Analyze this Hebrew word...").
- Adjust the "Koine Greek tutor" persona to a broader "Biblical Languages Scholar."
- Leverage the LLM to identify semantic neighbours for Hebrew words when curated domain mapping (like Louw-Nida) is unavailable.

#### [NEW] [cache.ts](file:///home/DART/jonathant/Documents/WhyThisWord/src/lib/analysis/cache.ts)
- Implement a key-value caching layer. Cache keys will be structured as `analysis:{lemma}:{verseRef}` to ensure context specificity.
- **Production Mode**: Check and utilize the bound Cloudflare KV (`WHY_THIS_WORD_CACHE`).
- **Development Mode**: Write to local JSON files (`.cache/analyses/*.json`) under the project root, falling back to an in-memory `Map`.

#### [NEW] [server-functions.ts](file:///home/DART/jonathant/Documents/WhyThisWord/src/lib/analysis/server-functions.ts)
- Expose a TanStack Start server function `getSemanticAnalysisServer` that handles cache checks, calls the Gemini API when a cache miss occurs, stores the result, and returns it.

#### [MODIFY] [index.ts](file:///home/DART/jonathant/Documents/WhyThisWord/src/lib/corpus/index.ts)
- Update `getWordAnalysis` to support passing verse context parameters:
  ```typescript
  export async function getWordAnalysis(
    lemma: string,
    context?: { ref: string; englishText: string; greekText: string }
  ): Promise<WordAnalysis | undefined>
  ```

#### [MODIFY] [word-analysis-panel.tsx](file:///home/DART/jonathant/Documents/WhyThisWord/src/components/word-analysis-panel.tsx)
- Add `verse: Verse | null` to the panel props.
- Pass verse context to the updated `getWordAnalysis` function when loading data.
- Display a dynamic visual loading indicator when an AI synthesis is being generated on-the-fly.

---

## Phase 3: UI & UX Enhancements (RTL & Typography)

**Goal**: Improve typography, visual markers, and customization for readers, with full support for Hebrew RTL rendering.

### Proposed Changes

#### [MODIFY] [verse-reader.tsx](file:///home/DART/jonathant/Documents/WhyThisWord/src/components/verse-reader.tsx)
- Integrate a caching status utility that checks if a word has a cached/curated entry.
- Apply a subtle dotted underline using `--color-accent-scholar` for tokens with detailed comparisons.
- **RTL Support**: Apply `dir="rtl"` and language-specific text alignment when rendering Old Testament passages.
- **Dynamic Fonts**: Switch between `font-greek` and `font-hebrew` (e.g., SBL Hebrew) based on the book metadata.

#### [NEW] [reader-customizer.tsx](file:///home/DART/jonathant/Documents/WhyThisWord/src/components/reader-customizer.tsx)
- Create a floating settings panel (or sidebar sheet) with premium glassmorphic styling.
- **Settings Options**:
  - **Font Size Adjuster**: Changes CSS custom properties for both Greek and Hebrew text.
  - **Show/Hide English Toggle**: Interacts with local state to hide the English verse translation.
  - **Interlinear Mode Toggle**: Renders English glosses directly below each token.
- Persist customizations locally via `localStorage`.

#### [MODIFY] [styles.css](file:///home/DART/jonathant/Documents/WhyThisWord/src/styles.css)
- Implement theme styles supporting the customizable font sizes and interlinear alignments.
- Define `font-hebrew` stack with proper line-heights to accommodate Hebrew vowel points (niqqud).

#### [NEW] [pronunciation-synth.ts](file:///home/DART/jonathant/Documents/WhyThisWord/src/lib/audio/pronunciation-synth.ts)
- Create an audio utility supporting pronunciation for both Greek and Hebrew.
- **Greek**: Erasmian (client-side synthesis) and Modern Greek (Web Speech API).
- **Hebrew**: Rule-based synthesis for biblical Hebrew pronunciation.

---

## Phase 4: Hebrew Ingestion, Comparative Workspace & Search

**Goal**: Provide workspaces for side-by-side analysis, complex queries, and a full OT corpus.

### Proposed Changes

#### [NEW] [ingest-ot.ts](file:///home/DART/jonathant/Documents/WhyThisWord/scripts/ingest-ot.ts)
- Implement a Hebrew/Aramaic ingestion pipeline using MorphHB (BHS) text.
- Create a morphology decoder for Hebrew stems, aspects, and states.
- Ingest a Hebrew Strong's Lexicon into the centralized `lexicon.json`.

#### [NEW] [compare-workspace.tsx](file:///home/DART/jonathant/Documents/WhyThisWord/src/components/compare-workspace.tsx)
- Implement a comparison view where two arbitrary lemmas (Greek or Hebrew) can be selected.
- Provide a detailed comparison matrix layout:
  - Meaning & Overlaps
  - Lexical distinctions
  - Biblical Frequency comparisons
  - Concordance snippet alignments

#### [NEW] [build-index.ts](file:///home/DART/jonathant/Documents/WhyThisWord/scripts/build-index.ts)
- Create a build script that processes all 66 biblical books (NT + OT).
- Build a precompiled static search index (`search-index.json`) mapping all lemmas to their counts and coordinates.

#### [MODIFY] [passage-picker.tsx](file:///home/DART/jonathant/Documents/WhyThisWord/src/components/passage-picker.tsx)
- Update the input search filter using a smart parser:
  - If searching for a scripture reference (e.g., "Genesis 1:1" or "John 3:16"), link directly to that passage.
  - If searching for a Greek/Hebrew word or English gloss, display a concordance result list for the entire Bible.

---

## Phase 5: Study Features & User Accounts

**Goal**: Drive user retention through persistence features across both testaments.

### Proposed Changes

#### [NEW] [auth.ts](file:///home/DART/jonathant/Documents/WhyThisWord/src/lib/auth/index.ts)
- Implement a client auth state provider using Firebase Web Auth.
- Expose hooks and utility methods: `useAuth()`, `signInWithGoogle()`, `signOutUser()`.

#### [NEW] [db-sync.ts](file:///home/DART/jonathant/Documents/WhyThisWord/src/lib/auth/db-sync.ts)
- Define DB collection schemas for user-associated study items (Bookmarks, Vocab Lists, Highlights, Notes).
- Ensure schemas are language-agnostic to support both Greek and Hebrew entries.

#### [MODIFY] [verse-reader.tsx](file:///home/DART/jonathant/Documents/WhyThisWord/src/components/verse-reader.tsx)
- Allow users to click and select a range of tokens (Greek or Hebrew).
- Render a highlighting context popover and sync custom annotations to the cloud.

---

## Verification Plan

### Automated Tests
- Run `scripts/verify-analysis.ts` to test the Gemini prompt schema validation for both Greek and Hebrew.
- Run the build script `scripts/build-index.ts` and verify that `search-index.json` covers all 66 books.
- Verify RTL rendering logic via component unit tests.
- Verify typescript builds: `bun run build`.

### Manual Verification
- Test customizer settings (font sizes, RTL alignment) across both Greek and Hebrew passages.
- Perform concordance searches across both testaments to verify comprehensive results.
- Verify that highlighting and note-taking work seamlessly for Hebrew tokens.
