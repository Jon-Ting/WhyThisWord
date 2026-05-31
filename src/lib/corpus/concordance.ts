import type { UsageExample, Verse } from "./types";
import booksIndex from "./data/books.json";

/**
 * Searches the entire NT corpus for verses containing a specific lemma.
 * Returns a set of UsageExample objects.
 */
export async function findExamplesInCorpus(
  lemma: string,
  limit: number = 3,
  excludeRef?: string
): Promise<UsageExample[]> {
  const normalizedLemma = lemma.normalize("NFC").trim();
  const examples: UsageExample[] = [];

  // Iterate through books in order
  for (const book of booksIndex) {
    if (examples.length >= limit) break;

    try {
      // Dynamically import the book data
      const bookData = await import(`./data/${book.id}.json`).then((m) => m.default || m);
      
      for (const verse of (bookData.verses as Verse[])) {
        if (examples.length >= limit) break;
        if (excludeRef && verse.ref === excludeRef) continue;

        const hasLemma = verse.tokens.some(
          (t) => t.lemma.normalize("NFC") === normalizedLemma
        );

        if (hasLemma) {
          const greekSnippet = verse.tokens
            .map((t) => t.surface + (t.punctuationAfter ?? ""))
            .join(" ");

          examples.push({
            ref: verse.ref,
            englishSnippet: verse.englishText,
            greekSnippet: greekSnippet,
            highlightLemma: normalizedLemma,
            note: "Corpus example",
          });
        }
      }
    } catch (err) {
      console.warn(`Concordance: Failed to search in ${book.name}`, err);
    }
  }

  return examples;
}
