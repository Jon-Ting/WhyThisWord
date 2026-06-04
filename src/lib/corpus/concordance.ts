import type { UsageExample, Verse } from "./types";
import { fetchCorpusJson } from "./fetch-data";

// [ref, testament, bookId, chapter]
type IndexEntry = [string, string, string, number];
type LemmaIndex = Record<string, IndexEntry[]>;

/**
 * Returns up to `limit` UsageExample objects for a given lemma using the
 * precomputed lemma -> verse index built at build time
 * (scripts/build-lemma-index.js -> public/corpus/index/lemma-refs.json).
 * Falls back to an empty list if the lemma is unknown.
 */
export async function findExamplesInCorpus(
  lemma: string,
  limit: number = 3,
  excludeRef?: string,
): Promise<UsageExample[]> {
  const normalizedLemma = lemma.normalize("NFC").trim();
  if (!normalizedLemma) return [];

  let index: LemmaIndex;
  try {
    index = await fetchCorpusJson<LemmaIndex>("index/lemma-refs.json");
  } catch (err) {
    console.warn("Concordance: failed to load lemma index", err);
    return [];
  }

  const entries = index[normalizedLemma];
  if (!entries || entries.length === 0) return [];

  const examples: UsageExample[] = [];
  // Cache chapter fetches within this call so multiple matches in the same
  // chapter only trigger one request.
  const chapterCache = new Map<string, Promise<{ verses: Verse[] }>>();

  for (const [ref, testament, bookId, chapter] of entries) {
    if (examples.length >= limit) break;
    if (excludeRef && ref === excludeRef) continue;

    const chapterKey = `${testament}/${bookId}/${chapter}.json`;
    let pending = chapterCache.get(chapterKey);
    if (!pending) {
      pending = fetchCorpusJson<{ verses: Verse[] }>(chapterKey);
      chapterCache.set(chapterKey, pending);
    }

    let chapterData: { verses: Verse[] };
    try {
      chapterData = await pending;
    } catch (err) {
      console.warn(`Concordance: failed to load ${chapterKey}`, err);
      continue;
    }

    const verse = chapterData.verses.find((v) => v.ref === ref);
    if (!verse) continue;
    const hasLemma = verse.tokens.some((t) => t.lemma.normalize("NFC") === normalizedLemma);
    if (!hasLemma) continue;

    const originalSnippet = verse.tokens
      .map((t) => t.surface + (t.punctuationAfter ?? ""))
      .join(" ");

    examples.push({
      ref: verse.ref,
      englishSnippet: verse.englishText,
      originalSnippet,
      highlightLemma: normalizedLemma,
      note: "Corpus example",
    });
  }

  return examples;
}
