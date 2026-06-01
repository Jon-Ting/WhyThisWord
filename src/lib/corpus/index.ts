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
export async function getPassage(id: string): Promise<Passage | undefined> {
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
    // Dynamically load the book chunk from its testament folder
    const bookData = await import(`./data/${folder}/${bookId}.json`).then((m) => m.default || m);

    // Filter verses belonging to this specific chapter
    const verses = bookData.verses.filter((v: Verse) => {
      const parts = v.ref.split(" ");
      const refVerse = parts[parts.length - 1]; // "3:16"
      const chStr = refVerse.split(":")[0];
      return parseInt(chStr, 10) === chapterNum;
    });

    if (verses.length === 0) return undefined;

    return {
      id,
      ref: `${bookData.name} ${chapterNum}`,
      title: bookData.name,
      description: `Original language text of ${bookData.name} Chapter ${chapterNum} with grammatical morphology analysis.`,
      verses,
      language: bookMetadata.language,
    };
  } catch (err) {
    console.error(`Failed to load passage chunk for book ${bookId}:`, err);
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
