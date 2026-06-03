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

export interface ParsedPassageRef {
  bookId: string;
  startChapter: number;
  startVerse?: number;
  endChapter?: number;
  endVerse?: number;
}

/**
 * Parse passage IDs like:
 *   john-3                    -> full chapter
 *   john-3:16               -> single verse
 *   john-3:16-20            -> same-chapter verse range
 *   john-3:16-4:5           -> cross-chapter range (same book)
 *   john-3:16-4:            -> cross-chapter range without end verse (to end of ch 4)
 *   john-3:16-john-4:5      -> cross-chapter range with explicit book
 *   john-3:16-john-4:       -> cross-chapter range with explicit book, no end verse
 */
export function parsePassageRef(id: string): ParsedPassageRef | null {
  // 1. Cross-chapter with explicit book name: john-3:16-john-4:5
  let m = id.match(/^([a-z0-9-]+)-(\d+):(\d+)-([a-z0-9-]+)-(\d+):(\d+)$/);
  if (m) {
    console.log(`[Passage] Matched cross-chapter explicit book: ${id}`);
    const [, bookId, sCh, sV, endBook, eCh, eV] = m;
    if (bookId !== endBook) return null;
    return {
      bookId,
      startChapter: parseInt(sCh, 10),
      startVerse: parseInt(sV, 10),
      endChapter: parseInt(eCh, 10),
      endVerse: parseInt(eV, 10),
    };
  }

  // 2. Cross-chapter without explicit book (colon on right): john-3:16-4:5
  m = id.match(/^([a-z0-9-]+)-(\d+):(\d+)-(\d+):(\d+)$/);
  if (m) {
    console.log(`[Passage] Matched cross-chapter range: ${id}`);
    const [, bookId, sCh, sV, eCh, eV] = m;
    return {
      bookId,
      startChapter: parseInt(sCh, 10),
      startVerse: parseInt(sV, 10),
      endChapter: parseInt(eCh, 10),
      endVerse: parseInt(eV, 10),
    };
  }

  // 2.5. Cross-chapter without explicit book and no end verse: john-3:16-4:
  m = id.match(/^([a-z0-9-]+)-(\d+):(\d+)-(\d+):$/);
  if (m) {
    console.log(`[Passage] Matched cross-chapter no-end-verse: ${id}`);
    const [, bookId, sCh, sV, eCh] = m;
    return {
      bookId,
      startChapter: parseInt(sCh, 10),
      startVerse: parseInt(sV, 10),
      endChapter: parseInt(eCh, 10),
    };
  }

  // 2.6. Cross-chapter with explicit book and no end verse: john-3:16-john-4:
  m = id.match(/^([a-z0-9-]+)-(\d+):(\d+)-([a-z0-9-]+)-(\d+):$/);
  if (m) {
    const [, bookId, sCh, sV, endBook, eCh] = m;
    if (bookId !== endBook) return null;
    return {
      bookId,
      startChapter: parseInt(sCh, 10),
      startVerse: parseInt(sV, 10),
      endChapter: parseInt(eCh, 10),
    };
  }

  // 3. Same-chapter verse range: john-3:16-20
  m = id.match(/^([a-z0-9-]+)-(\d+):(\d+)-(\d+)$/);
  if (m) {
    console.log(`[Passage] Matched same-chapter range: ${id}`);
    const [, bookId, ch, sV, eV] = m;
    return {
      bookId,
      startChapter: parseInt(ch, 10),
      startVerse: parseInt(sV, 10),
      endVerse: parseInt(eV, 10),
    };
  }

  // 4. Single verse: john-3:16
  m = id.match(/^([a-z0-9-]+)-(\d+):(\d+)$/);
  if (m) {
    console.log(`[Passage] Matched single verse: ${id}`);
    const [, bookId, ch, v] = m;
    return {
      bookId,
      startChapter: parseInt(ch, 10),
      startVerse: parseInt(v, 10),
    };
  }

  // 5. Full chapter: john-3
  m = id.match(/^([a-z0-9-]+)-(\d+)$/);
  if (m) {
    console.log(`[Passage] Matched full chapter: ${id}`);
    const [, bookId, ch] = m;
    return {
      bookId,
      startChapter: parseInt(ch, 10),
    };
  }

  console.warn(`[Passage] Unable to parse ref slug: ${id}`);
  return null;
}

/** Build a human-readable ref label from a parsed passage ref. */
function buildRefLabel(
  bookName: string,
  startChapter: number,
  startVerse?: number,
  endChapter?: number,
  endVerse?: number,
): string {
  if (startVerse === undefined) {
    return `${bookName} ${startChapter}`;
  }
  if (endChapter === undefined) {
    if (endVerse === undefined || endVerse === startVerse) {
      return `${bookName} ${startChapter}:${startVerse}`;
    }
    return `${bookName} ${startChapter}:${startVerse}-${endVerse}`;
  }
  if (endVerse === undefined) {
    return `${bookName} ${startChapter}:${startVerse} - ${endChapter}`;
  }
  return `${bookName} ${startChapter}:${startVerse} - ${endChapter}:${endVerse}`;
}

/** Given a passage id like "john-3" or "john-3:16-4:5", return neighbouring chapter refs (if any). */
export function getAdjacentChapters(id: string): {
  prev?: { id: string; ref: string };
  next?: { id: string; ref: string };
} {
  const parsed = parsePassageRef(id);
  if (!parsed) return {};

  const { bookId, startChapter, endChapter = startChapter } = parsed;

  const bookIndex = (booksIndex as BookMetadata[]).findIndex((b) => b.id === bookId);
  if (bookIndex === -1) return {};

  const book = booksIndex[bookIndex] as BookMetadata;
  const result: { prev?: { id: string; ref: string }; next?: { id: string; ref: string } } = {};

  if (startChapter > 1) {
    result.prev = {
      id: `${bookId}-${startChapter - 1}`,
      ref: `${book.name} ${startChapter - 1}`,
    };
  } else if (bookIndex > 0) {
    const prevBook = booksIndex[bookIndex - 1] as BookMetadata;
    result.prev = {
      id: `${prevBook.id}-${prevBook.chaptersCount}`,
      ref: `${prevBook.name} ${prevBook.chaptersCount}`,
    };
  }

  if (endChapter < book.chaptersCount) {
    result.next = {
      id: `${bookId}-${endChapter + 1}`,
      ref: `${book.name} ${endChapter + 1}`,
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
/** Return the number of verses in a specific chapter by dynamically loading its data. */
export async function getChapterVerseCount(
  bookId: string,
  chapterNum: number,
): Promise<number | undefined> {
  const bookMetadata = (booksIndex as BookMetadata[]).find((b) => b.id === bookId);
  if (!bookMetadata) return undefined;

  const folder = bookMetadata.testament.toLowerCase();

  try {
    const chapterData = await import(`./data/${folder}/${bookId}/${chapterNum}.json`).then(
      (m) => m.default || m,
    );
    const count = (chapterData.verses as Verse[]).length;
    console.log(`[Passage] ${bookId} ${chapterNum} has ${count} verses`);
    return count;
  } catch (err) {
    console.error(`[Passage] Failed to load chapter data for ${bookId} ${chapterNum}:`, err);
    return undefined;
  }
}

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

async function loadSingleChapter(
  bookId: string,
  chapterNum: number,
  startVerse?: number,
  endVerse?: number,
  originalId?: string,
): Promise<Passage | undefined> {
  const bookMetadata = (booksIndex as BookMetadata[]).find((b) => b.id === bookId);
  if (!bookMetadata) return undefined;

  const folder = bookMetadata.testament.toLowerCase();

  try {
    const chapterData = await import(`./data/${folder}/${bookId}/${chapterNum}.json`).then(
      (m) => m.default || m,
    );

    let verses: Verse[] = chapterData.verses;
    let ref = `${chapterData.name} ${chapterNum}`;
    console.log(`[Passage] Loaded ${verses.length} verses for ${ref}`);

    if (startVerse !== undefined || endVerse !== undefined) {
      const verseNumbers = verses.map((v: Verse) => parseVerseNumber(v.ref));
      const minVerse = Math.min(...verseNumbers);
      const maxVerse = Math.max(...verseNumbers);

      let start = startVerse ?? minVerse;
      let end = endVerse ?? maxVerse;
      start = Math.max(minVerse, Math.min(start, maxVerse));
      end = Math.max(minVerse, Math.min(end, maxVerse));
      if (start > end) [start, end] = [end, start];

      const filtered = verses.filter((v: Verse) => {
        const num = parseVerseNumber(v.ref);
        return num >= start && num <= end;
      });
      console.log(
        `[Passage] Filtered verses ${start}-${end}: ${filtered.length} of ${verses.length}`,
      );
      verses = filtered.length > 0 ? filtered : verses;

      if (filtered.length > 0) {
        ref += `:${start}`;
        if (end !== maxVerse && end !== start) {
          ref += `-${end}`;
        }
      }
    }

    return {
      id: originalId ?? `${bookId}-${chapterNum}`,
      ref,
      title: chapterData.name,
      description: `Original language text of ${chapterData.name} Chapter ${chapterNum} with grammatical morphology analysis.`,
      verses,
      language: bookMetadata.language,
    };
  } catch (err) {
    console.error(
      `[Passage] Failed to load passage chunk for ${bookId} chapter ${chapterNum}:`,
      err,
    );
    return undefined;
  }
}

export const MAX_PASSAGE_SPAN = 10;

export class PassageRangeTooLargeError extends Error {
  constructor(
    public bookId: string,
    public startChapter: number,
    public endChapter: number,
    public maxSpan: number,
  ) {
    super(
      `This passage spans ${endChapter - startChapter + 1} chapters, but the maximum allowed is ${maxSpan}. Please select a smaller range.`,
    );
    this.name = "PassageRangeTooLargeError";
  }
}

async function loadMultiChapterRange(
  bookId: string,
  startChapter: number,
  startVerse: number | undefined,
  endChapter: number,
  endVerse: number | undefined,
): Promise<Passage | undefined> {
  const bookMetadata = (booksIndex as BookMetadata[]).find((b) => b.id === bookId);
  if (!bookMetadata) return undefined;

  if (endChapter - startChapter + 1 > MAX_PASSAGE_SPAN) {
    console.warn(
      `[Passage] Range too large: ${bookId} ${startChapter}-${endChapter} (${endChapter - startChapter + 1} chapters, max ${MAX_PASSAGE_SPAN})`,
    );
    throw new PassageRangeTooLargeError(bookId, startChapter, endChapter, MAX_PASSAGE_SPAN);
  }

  const folder = bookMetadata.testament.toLowerCase();

  console.log(
    `[Passage] Loading ${endChapter - startChapter + 1} chapters for ${bookMetadata.name}`,
  );
  const chapterPromises: Promise<unknown>[] = [];
  for (let ch = startChapter; ch <= endChapter; ch++) {
    chapterPromises.push(
      import(`./data/${folder}/${bookId}/${ch}.json`).then((m) => m.default || m).catch(() => null),
    );
  }

  const chapterDatas = await Promise.all(chapterPromises);
  if (chapterDatas.some((d) => d === null)) {
    console.error(
      `Failed to load one or more chapters in range ${bookId} ${startChapter}-${endChapter}`,
    );
    return undefined;
  }

  let allVerses: Verse[] = [];
  console.log(`[Passage] Concatenating verses from ${chapterDatas.length} chapters`);

  for (let i = 0; i < chapterDatas.length; i++) {
    const ch = startChapter + i;
    const data = chapterDatas[i] as { verses: Verse[] };
    let verses = data.verses;

    if (ch === startChapter && startVerse !== undefined) {
      verses = verses.filter((v) => parseVerseNumber(v.ref) >= startVerse);
    }

    if (ch === endChapter && endVerse !== undefined) {
      verses = verses.filter((v) => parseVerseNumber(v.ref) <= endVerse);
    }

    allVerses = allVerses.concat(verses);
  }

  const ref = buildRefLabel(bookMetadata.name, startChapter, startVerse, endChapter, endVerse);
  let id = `${bookId}-${startChapter}`;
  if (startVerse !== undefined) id += `:${startVerse}`;
  if (endChapter !== undefined && endChapter !== startChapter) {
    id += `-${endChapter}`;
    if (endVerse !== undefined) {
      id += `:${endVerse}`;
    } else {
      id += `:`;
    }
  } else if (endVerse !== undefined && endVerse !== startVerse) {
    id += `-${endVerse}`;
  }

  return {
    id,
    ref,
    title: bookMetadata.name,
    description: `Original language text of ${ref} with grammatical morphology analysis.`,
    verses: allVerses,
    language: bookMetadata.language,
  };
}

// Asynchronously load a complete chapter passage on demand (dynamic chunk loading)
export async function getPassage(id: string): Promise<Passage | undefined> {
  console.log(`[Passage] getPassage called with id: ${id}`);
  const parsed = parsePassageRef(id);
  if (!parsed) {
    console.warn(`[Passage] parsePassageRef returned null for: ${id}`);
    return undefined;
  }

  const { bookId, startChapter, startVerse, endChapter, endVerse } = parsed;

  if (!endChapter) {
    console.log(
      `[Passage] Loading single chapter: ${bookId} ${startChapter} (verses ${startVerse ?? "all"} - ${endVerse ?? "all"})`,
    );
    return loadSingleChapter(bookId, startChapter, startVerse, endVerse, id);
  }

  console.log(
    `[Passage] Loading multi-chapter range: ${bookId} ${startChapter}:${startVerse ?? "start"} - ${endChapter}:${endVerse ?? "end"}`,
  );
  return loadMultiChapterRange(bookId, startChapter, startVerse, endChapter, endVerse);
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
    console.log(`[Analysis] Curated HIT for lemma: ${normalizedLemma}`);
    return analyses[normalizedLemma];
  }

  // 2. If context is provided and AI is not disabled, try retrieving/generating via Gemini & cache
  if (context && !options?.disableAI) {
    console.log(`[Analysis] No curated entry for ${normalizedLemma}. Attempting AI synthesis...`);
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
          console.log(`[Analysis] Local cache HIT for ${normalizedLemma} @ ${context.ref}`);
          return cached;
        }
        console.log(`[Analysis] Local cache MISS for ${normalizedLemma} @ ${context.ref}`);

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
      console.log(`[Analysis] Calling server function for ${normalizedLemma} @ ${context.ref}`);
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
        console.log(`[Analysis] Server function returned result for ${normalizedLemma}`);
        return result;
      }
      console.warn(`[Analysis] Server function returned empty for ${normalizedLemma}`);
    } catch (err) {
      console.warn(
        `[Analysis] AI pipeline failed for ${normalizedLemma}, falling back to lexicon:`,
        err,
      );
    }
  }

  // 3. Fall back to standard dictionary definition (Abbott-Smith / Strong's)
  console.log(`[Analysis] Falling back to lexicon for ${normalizedLemma}`);
  try {
    const lexicon = (await import("./data/lexicon.json").then((m) => m.default || m)) as Record<
      string,
      unknown
    >;
    const cleanLemma = normalizedLemma.toLowerCase();
    const fallback = lexicon[cleanLemma] as (WordAnalysis & { strongs?: string }) | undefined;

    if (fallback) {
      console.log(`[Analysis] Lexicon HIT for ${normalizedLemma}`);
      const result = { ...fallback } as WordAnalysis & { strongs?: string };

      // Inject Louw-Nida domains
      if (result.strongs) {
        try {
          const lnData = (await import("./data/louw-nida.json").then((m) => m.default || m)) as {
            strongToLn: Record<string, string[]>;
          };
          const domainNames = (await import("./data/louw-nida-domains.json").then(
            (m) => m.default || m,
          )) as Record<string, string>;
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
          const entry = (lexicon[l] || lexicon[l.toLowerCase()]) as
            | { translit?: string; shortDef?: string }
            | undefined;
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
    console.error(`[Analysis] Failed to load lexicon fallback for ${normalizedLemma}:`, err);
  }

  console.warn(`[Analysis] No definition found for ${normalizedLemma}`);
  return undefined;
}

// Synchronously check if a Greek lemma has a curated, contrastive analysis
export function hasCuratedAnalysis(lemma: string): boolean {
  if (!lemma) return false;
  const normalizedLemma = lemma.normalize("NFC").trim();
  return !!analyses[normalizedLemma];
}
