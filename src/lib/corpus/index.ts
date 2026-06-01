// Public GNT corpus data API. Components import only from here.
import booksIndex from "./data/books.json";
import { analyses } from "./mock/analyses";
import type { Passage, Verse, WordAnalysis } from "./types";
import { findNeighboursByLemma } from "./louw-nida";
import { findExamplesInCorpus } from "./concordance";

export { findNeighboursByLemma } from "./louw-nida";
export { findExamplesInCorpus } from "./concordance";

export type {
  Passage,
  Verse,
  WordAnalysis,
  CorpusToken,
  SemanticNeighbour,
  UsageExample,
} from "./types";

export interface BookMetadata {
  id: string;
  name: string;
  abbr: string;
  chaptersCount: number;
  versesCount: number;
  testament: "OT" | "NT";
  language: "greek" | "hebrew";
}

export interface PassageSearchResult {
  id: string;
  ref: string;
  title: string;
  description: string;
}

export interface ParsedReference {
  bookId: string;
  bookName: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
}

/** Parse user-typed scripture references like "John 3:16", "Genesis 1:1-20", "Romans 8" */
export function parseReference(input: string): ParsedReference | null {
  const normalized = input.trim();
  // Match: BookName chapter[:startVerse][-endVerse] or BookName chapter[:startVerse]-chapter:endVerse
  const match = normalized.match(/^(.+?)\s+(\d+)(?::(\d+))?(?:\s*-\s*(?:(\d+):)?(\d+))?$/);
  if (!match) return null;

  const [, bookStr, chapterStr, startVerseStr, endChapterStr, endVerseStr] = match;
  // Multi-chapter ranges (e.g. "John 3:16-4:5") are not supported yet
  if (endChapterStr) return null;
  const chapter = parseInt(chapterStr, 10);

  // Find matching book by full name or abbreviation
  const bookNameInput = bookStr.trim();
  const normalizedBook = bookNameInput.toLowerCase().replace(/\s+/g, "");
  const book = (booksIndex as BookMetadata[]).find((b) => {
    const nameNorm = b.name.toLowerCase().replace(/\s+/g, "");
    const abbrNorm = b.abbr.toLowerCase();
    return (
      nameNorm === normalizedBook ||
      abbrNorm === normalizedBook ||
      nameNorm.startsWith(normalizedBook)
    );
  });

  if (!book) return null;

  const result: ParsedReference = {
    bookId: book.id,
    bookName: book.name,
    chapter,
  };

  if (startVerseStr) {
    result.startVerse = parseInt(startVerseStr, 10);
    result.endVerse = endVerseStr ? parseInt(endVerseStr, 10) : result.startVerse;
  }

  return result;
}

function parseVerseNumber(ref: string): number {
  const match = ref.match(/:(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Given a passage id like "john-3", return neighbouring chapter refs (if any). */
export function getAdjacentChapters(id: string): {
  prev?: { id: string; ref: string };
  next?: { id: string; ref: string };
} {
  const match = id.match(/^([a-z0-9-]+)-(\d+)$/);
  if (!match) return {};

  const [, bookId, chapterStr] = match;
  const chapterNum = parseInt(chapterStr, 10);

  const bookIndex = (booksIndex as BookMetadata[]).findIndex((b) => b.id === bookId);
  if (bookIndex === -1) return {};

  const book = booksIndex[bookIndex] as BookMetadata;
  const result: { prev?: { id: string; ref: string }; next?: { id: string; ref: string } } = {};

  if (chapterNum > 1) {
    result.prev = {
      id: `${bookId}-${chapterNum - 1}`,
      ref: `${book.name} ${chapterNum - 1}`,
    };
  } else if (bookIndex > 0) {
    const prevBook = booksIndex[bookIndex - 1] as BookMetadata;
    result.prev = {
      id: `${prevBook.id}-${prevBook.chaptersCount}`,
      ref: `${prevBook.name} ${prevBook.chaptersCount}`,
    };
  }

  if (chapterNum < book.chaptersCount) {
    result.next = {
      id: `${bookId}-${chapterNum + 1}`,
      ref: `${book.name} ${chapterNum + 1}`,
    };
  } else if (bookIndex < booksIndex.length - 1) {
    const nextBook = booksIndex[bookIndex + 1] as BookMetadata;
    result.next = {
      id: `${nextBook.id}-1`,
      ref: `${nextBook.name} 1`,
    };
  }

  return result;
}

// Synchronously export the list of all chapters in the Bible for search indexing
export function listPassages(): PassageSearchResult[] {
  const list: PassageSearchResult[] = [];
  for (const book of booksIndex) {
    for (let c = 1; c <= book.chaptersCount; c++) {
      list.push({
        id: `${book.id}-${c}`,
        ref: `${book.name} ${c}`,
        title: book.name,
        description: `Chapter ${c}`,
      });
    }
  }
  return list;
}

// Asynchronously load a complete chapter passage on demand (dynamic chunk loading)
export async function getPassage(
  id: string,
  options?: { startVerse?: number; endVerse?: number },
): Promise<Passage | undefined> {
  // Support standard book-chapter URL format, e.g. "john-1" or "1-corinthians-13"
  const match = id.match(/^([a-z0-9-]+)-(\d+)$/);
  if (!match) {
    return undefined;
  }

  const [_, bookId, chapterStr] = match;
  const chapterNum = parseInt(chapterStr, 10);

  // Look up book metadata to find testament (folder)
  const bookMetadata = (booksIndex as BookMetadata[]).find((b) => b.id === bookId);
  if (!bookMetadata) return undefined;

  const folder = bookMetadata.testament.toLowerCase();

  try {
    // Dynamically load the specific chapter chunk
    const chapterData = await import(`./data/${folder}/${bookId}/${chapterNum}.json`).then(
      (m) => m.default || m,
    );

    let verses: Verse[] = chapterData.verses;
    let ref = `${chapterData.name} ${chapterNum}`;

    // Filter to a verse range if requested
    if (options?.startVerse || options?.endVerse) {
      let start = options.startVerse ?? 1;
      let end = options.endVerse ?? Infinity;
      // Swap if the user typed the range backwards
      if (start > end) [start, end] = [end, start];
      const filtered = verses.filter((v: Verse) => {
        const num = parseVerseNumber(v.ref);
        return num >= start && num <= end;
      });
      // If filtering yields nothing, fall back to the full chapter
      verses = filtered.length > 0 ? filtered : verses;

      if (filtered.length > 0) {
        ref += `:${start}`;
        if (end !== Infinity && end !== start) {
          ref += `-${end}`;
        }
      }
    }

    return {
      id,
      ref,
      title: chapterData.name,
      description: `Original language text of ${chapterData.name} Chapter ${chapterNum} with grammatical morphology analysis.`,
      verses,
      language: bookMetadata.language,
    };
  } catch (err) {
    console.error(`Failed to load passage chunk for ${bookId} chapter ${chapterNum}:`, err);
    return undefined;
  }
}

// Asynchronously resolve a Greek word's contrastive semantics or lexicon definitions
export async function getWordAnalysis(
  lemma: string,
  context?: { ref: string; englishText: string; sourceText: string; language?: string },
  options?: { disableAI?: boolean },
): Promise<WordAnalysis | undefined> {
  const normalizedLemma = lemma.normalize("NFC").trim();

  // 1. Check if a curated, contrastive analysis exists in the mock database
  if (analyses[normalizedLemma]) {
    return analyses[normalizedLemma];
  }

  // 2. If context is provided and AI is not disabled, try retrieving/generating via Gemini & cache
  if (context && !options?.disableAI) {
    try {
      // If running inside CLI test script (direct execution)
      if (
        typeof window === "undefined" &&
        typeof process !== "undefined" &&
        !process.env.VINXI_ENV
      ) {
        const { getCachedAnalysis, setCachedAnalysis } = await import("../analysis/cache");
        const { fetchSemanticAnalysis } = await import("../analysis/gemini");

        const cached = await getCachedAnalysis(normalizedLemma, context.ref);
        if (cached) {
          return cached;
        }

        const generated = await fetchSemanticAnalysis(
          normalizedLemma,
          context.ref,
          context.englishText,
          context.sourceText,
          context.language || "greek",
        );
        await setCachedAnalysis(normalizedLemma, context.ref, generated);
        return generated;
      }

      // If running in browser or SSR runtime, execute standard Server Function RPC
      const { getSemanticAnalysisServer } = await import("../analysis/server-functions");
      const result = await getSemanticAnalysisServer({
        data: {
          lemma: normalizedLemma,
          ref: context.ref,
          englishText: context.englishText,
          sourceText: context.sourceText,
          language: context.language || "greek",
        },
      });
      if (result) {
        return result;
      }
    } catch (err) {
      console.warn("Dynamic AI analysis failed, falling back to lexicon definition:", err);
    }
  }

  // 3. Fall back to standard dictionary definition (Abbott-Smith / Strong's)
  try {
    const lexicon = (await import("./data/lexicon.json").then((m) => m.default || m)) as Record<
      string,
      unknown
    >;
    const cleanLemma = normalizedLemma.toLowerCase();
    const fallback = lexicon[cleanLemma] as WordAnalysis;

    if (fallback) {
      const result = { ...fallback } as WordAnalysis;

      // Inject Louw-Nida domains
      if (result.strongs) {
        try {
          const lnData = await import("./data/louw-nida.json").then((m) => m.default || m);
          const domainNames = await import("./data/louw-nida-domains.json").then(
            (m) => m.default || m,
          );
          const lnCodes = lnData.strongToLn[result.strongs] || [];

          const uniqueDomains = new Set<string>();
          lnCodes.forEach((code: string) => {
            const domainId = code.split(".")[0];
            const name = domainNames[domainId];
            if (name) uniqueDomains.add(name);
          });

          result.domains = Array.from(uniqueDomains);
        } catch (err) {
          console.error("Failed to load Louw-Nida domain data:", err);
        }
      }

      // Inject Louw-Nida neighbours if empty
      if (!result.neighbours || result.neighbours.length === 0) {
        const lnLemmas = await findNeighboursByLemma(normalizedLemma);
        result.neighbours = lnLemmas.slice(0, 5).map((l) => {
          const entry = lexicon[l] || lexicon[l.toLowerCase()];
          return {
            lemma: l,
            translit: entry?.translit || l,
            shortDef: entry?.shortDef,
          };
        });
      }

      // Inject real usage examples if empty
      if (!result.examples || result.examples.length === 0) {
        result.examples = await findExamplesInCorpus(normalizedLemma, 3, context?.ref);
      }

      return result;
    }
  } catch (err) {
    console.error("Failed to load lexicon fallback definition:", err);
  }

  return undefined;
}

// Synchronously check if a Greek lemma has a curated, contrastive analysis
export function hasCuratedAnalysis(lemma: string): boolean {
  if (!lemma) return false;
  const normalizedLemma = lemma.normalize("NFC").trim();
  return !!analyses[normalizedLemma];
}
