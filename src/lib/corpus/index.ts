// Public data API. Components import only from here.
// Swap mock implementations for SBLGNT/MorphGNT/AI without touching UI.
import { passages } from "./mock/passages";
import { analyses } from "./mock/analyses";
import type { Passage, Verse, WordAnalysis } from "./types";

export type { Passage, Verse, WordAnalysis } from "./types";

export function listPassages(): Passage[] {
  return passages;
}

export function getPassage(id: string): Passage | undefined {
  return passages.find((p) => p.id === id);
}

export function getWordAnalysis(lemma: string): WordAnalysis | undefined {
  return analyses[lemma];
}

// Future seams — replace with real implementations.
// src/lib/corpus/sources/sblgnt.ts   — TODO: parse SBLGNT
// src/lib/corpus/sources/morphgnt.ts — TODO: parse MorphGNT
// src/lib/corpus/sources/strongs.ts  — TODO: Strong's lookup
