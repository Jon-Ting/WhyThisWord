# Implementation Plan: Old Testament Expansion

This plan outlines the steps required to expand the **WhyThisWord** application to support the Hebrew Bible (Old Testament). The goal is to maintain the current user experience—verse-by-verse reading with deep, contrastive word analysis—while adapting for the specific challenges of Hebrew and Aramaic.

---

## Phase 1: Data Infrastructure & Schema Generalization
**Goal:** Transition the codebase from Greek-specific types to language-agnostic structures.

1.  **Generalize Types (`src/lib/corpus/types.ts`):**
    *   Rename `GreekToken` to `CorpusToken`.
    *   Add a `language` field to `Verse` or `Passage` (enum: `'greek' | 'hebrew'`).
    *   Ensure `WordAnalysis` fields (like `morphSummary`) are flexible enough for Hebrew grammar.
2.  **Update Metadata (`src/lib/corpus/data/books.json`):**
    *   Append the 39 Old Testament books.
    *   Add a `testament` or `language` property to each book entry to drive UI logic.
3.  **Refactor Directory Structure:**
    *   Organize `src/lib/corpus/data/` if necessary (e.g., subfolders for `nt/` and `ot/`), or maintain flat files with naming conventions.

---

## Phase 2: Hebrew Ingestion Pipeline
**Goal:** Build a robust script to ingest tagged Hebrew text and Strong's Lexicon.

1.  **Source Hebrew Corpus:**
    *   Integrate the [Open Scriptures Hebrew Bible (morphhb)](https://github.com/openscriptures/morphhb) (BHS text).
    *   Maintain compatibility with the existing `getBible API` for English WEB text.
2.  **Implement Hebrew Morphology Decoder:**
    *   Create a new utility (similar to `expandMorph` in `ingest-corpus.js`) to decode Hebrew tags (e.g., `Hvpsma` -> Verb, Piel, Singular, Masculine, Absolute).
    *   Support Hebrew-specific concepts: Stems (Qal, Piel, etc.), States (Construct/Absolute), and Suffixes.
3.  **Develop Hebrew Transliteration:**
    *   Implement a rule-based transliterator for Hebrew (handling niqqud, dagesh, and special consonants like Ayin/Aleph).
4.  **Ingest Hebrew Lexicon:**
    *   Source and parse a Hebrew Strong's Lexicon (e.g., BDB-based) into `lexicon.json`.

---

## Phase 3: RTL & UI Adaptations
**Goal:** Ensure the reader renders Hebrew correctly and intuitively.

1.  **RTL Support in `VerseReader`:**
    *   Detect book language from metadata.
    *   Apply `dir="rtl"` to the verse container for Hebrew text.
    *   Adjust typography: use `font-hebrew` (e.g., SBL Hebrew or Noto Sans Hebrew) with appropriate line-heights for vowel points.
2.  **Component Refinement:**
    *   Ensure punctuation and token spacing are correctly handled for RTL text.
    *   Adjust the "Word Analysis" drawer to display Hebrew lemmas with proper alignment.

---

## Phase 4: Semantic Analysis & AI Integration
**Goal:** Adapt the AI analysis engine for Hebrew/Aramaic scholarship.

1.  **Update AI Prompts (`src/lib/analysis/gemini.ts`):**
    *   Generalize the "Koine Greek seminary tutor" persona to a "Biblical Languages scholar."
    *   Dynamically switch instructions based on the language (e.g., "Analyze this Hebrew word...").
2.  **Hebrew Semantic Domains:**
    *   Since Louw-Nida is NT-only, implement a fallback for the OT.
    *   Option A: Integrate a Hebrew semantic dictionary.
    *   Option B (Recommended): Leverage Gemini to identify "semantic neighbours" for Hebrew words directly if no curated domain mapping is available.

---

## Phase 5: Verification & Launch
**Goal:** Test the pipeline with sample books and verify accuracy.

1.  **Pilot Ingestion:** Ingest **Genesis** and **Psalms** to test both narrative and poetic structures.
2.  **Manual Verification:** Check morphology decoding and RTL rendering against standard tools (e.g., Blue Letter Bible).
3.  **Full Ingestion:** Run the pipeline for all 39 OT books.

---

## Technical Constraints & Considerations
*   **Aramaic Support:** Small portions of Daniel and Ezra are in Aramaic; the ingestion script must detect these sections (often tagged differently in `morphhb`).
*   **Bundle Size:** OT data is significantly larger than NT. Ensure dynamic imports in `src/lib/corpus/index.ts` are robust to handle the increased number of JSON chunks.
*   **Font Licensing:** Ensure SBL Hebrew or similar high-quality biblical fonts are properly bundled or linked.
