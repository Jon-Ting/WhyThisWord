// Future AI-backed analysis. Currently unwired.
// When ready, back this with a TanStack Start server function that calls
// the Lovable AI Gateway and returns the same WordAnalysis shape.
import type { WordAnalysis } from "@/lib/corpus/types";

export async function analyzeWord(
  _lemma: string,
  _context: { verseRef: string; surface: string },
): Promise<WordAnalysis> {
  throw new Error(
    "AI analysis not wired yet. Falling back to the curated mock dataset.",
  );
}
