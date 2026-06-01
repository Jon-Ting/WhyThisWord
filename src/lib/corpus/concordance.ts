import type { UsageExample, Verse } from "./types";
import booksIndex from "./data/books.json";

/**
 * Searches the entire Bible corpus for verses containing a specific lemma.
 * Returns a set of UsageExample objects.
 */
export async function findExamplesInCorpus(
  lemma: string,
  limit: number = 3,
  excludeRef?: string,
): Promise<UsageExample[]> {
  const normalizedLemma = lemma.normalize("NFC").trim();
  const examples: UsageExample[] = [];

  // Iterate through books and their chapters
  for (const book of booksIndex) {
    if (examples.length >= limit) break;

    const folder = book.testament.toLowerCase();

    for (let c = 1; c <= book.chaptersCount; c++) {
      if (examples.length >= limit) break;

      try {
        const chapterData = await import(`./data/${folder}/${book.id}/${c}.json`).then(
          (m) => m.default || m,
        );

        for (const verse of chapterData.verses as Verse[]) {
          if (examples.length >= limit) break;
          if (excludeRef && verse.ref === excludeRef) continue;

          const hasLemma = verse.tokens.some((t) => t.lemma.normalize("NFC") === normalizedLemma);

          if (hasLemma) {
            const originalSnippet = verse.tokens
              .map((t) => t.surface + (t.punctuationAfter ?? ""))
              .join(" ");

            examples.push({
              ref: verse.ref,
              englishSnippet: verse.englishText,
              originalSnippet: originalSnippet,
              highlightLemma: normalizedLemma,
              note: "Corpus example",
            });
          }
        }
      } catch (err) {
        console.warn(`Concordance: Failed to search in ${book.name} ${c}`, err);
      }
    }
  }

  return examples;
}
