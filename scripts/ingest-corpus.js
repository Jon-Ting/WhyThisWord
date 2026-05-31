import fs from "fs";
import path from "path";

// Define the 27 New Testament books
const books = [
  { id: "matthew", num: "61", name: "Matthew", abbr: "Mt", file: "61-Mt-morphgnt.txt", webIdx: 39 },
  { id: "mark", num: "62", name: "Mark", abbr: "Mk", file: "62-Mk-morphgnt.txt", webIdx: 40 },
  { id: "luke", num: "63", name: "Luke", abbr: "Lk", file: "63-Lk-morphgnt.txt", webIdx: 41 },
  { id: "john", num: "64", name: "John", abbr: "Jn", file: "64-Jn-morphgnt.txt", webIdx: 42 },
  { id: "acts", num: "65", name: "Acts", abbr: "Ac", file: "65-Ac-morphgnt.txt", webIdx: 43 },
  { id: "romans", num: "66", name: "Romans", abbr: "Ro", file: "66-Ro-morphgnt.txt", webIdx: 44 },
  {
    id: "1-corinthians",
    num: "67",
    name: "1 Corinthians",
    abbr: "1Co",
    file: "67-1Co-morphgnt.txt",
    webIdx: 45,
  },
  {
    id: "2-corinthians",
    num: "68",
    name: "2 Corinthians",
    abbr: "2Co",
    file: "68-2Co-morphgnt.txt",
    webIdx: 46,
  },
  {
    id: "galatians",
    num: "69",
    name: "Galatians",
    abbr: "Ga",
    file: "69-Ga-morphgnt.txt",
    webIdx: 47,
  },
  {
    id: "ephesians",
    num: "70",
    name: "Ephesians",
    abbr: "Eph",
    file: "70-Eph-morphgnt.txt",
    webIdx: 48,
  },
  {
    id: "philippians",
    num: "71",
    name: "Philippians",
    abbr: "Php",
    file: "71-Php-morphgnt.txt",
    webIdx: 49,
  },
  {
    id: "colossians",
    num: "72",
    name: "Colossians",
    abbr: "Col",
    file: "72-Col-morphgnt.txt",
    webIdx: 50,
  },
  {
    id: "1-thessalonians",
    num: "73",
    name: "1 Thessalonians",
    abbr: "1Th",
    file: "73-1Th-morphgnt.txt",
    webIdx: 51,
  },
  {
    id: "2-thessalonians",
    num: "74",
    name: "2 Thessalonians",
    abbr: "2Th",
    file: "74-2Th-morphgnt.txt",
    webIdx: 52,
  },
  {
    id: "1-timothy",
    num: "75",
    name: "1 Timothy",
    abbr: "1Ti",
    file: "75-1Ti-morphgnt.txt",
    webIdx: 53,
  },
  {
    id: "2-timothy",
    num: "76",
    name: "2 Timothy",
    abbr: "2Ti",
    file: "76-2Ti-morphgnt.txt",
    webIdx: 54,
  },
  { id: "titus", num: "77", name: "Titus", abbr: "Ti", file: "77-Tit-morphgnt.txt", webIdx: 55 },
  {
    id: "philemon",
    num: "78",
    name: "Philemon",
    abbr: "Phm",
    file: "78-Phm-morphgnt.txt",
    webIdx: 56,
  },
  {
    id: "hebrews",
    num: "79",
    name: "Hebrews",
    abbr: "Heb",
    file: "79-Heb-morphgnt.txt",
    webIdx: 57,
  },
  { id: "james", num: "80", name: "James", abbr: "Jas", file: "80-Jas-morphgnt.txt", webIdx: 58 },
  {
    id: "1-peter",
    num: "81",
    name: "1 Peter",
    abbr: "1Pe",
    file: "81-1Pe-morphgnt.txt",
    webIdx: 59,
  },
  {
    id: "2-peter",
    num: "82",
    name: "2 Peter",
    abbr: "2Pe",
    file: "82-2Pe-morphgnt.txt",
    webIdx: 60,
  },
  { id: "1-john", num: "83", name: "1 John", abbr: "1Jn", file: "83-1Jn-morphgnt.txt", webIdx: 61 },
  { id: "2-john", num: "84", name: "2 John", abbr: "2Jn", file: "84-2Jn-morphgnt.txt", webIdx: 62 },
  { id: "3-john", num: "85", name: "3 John", abbr: "3Jn", file: "85-3Jn-morphgnt.txt", webIdx: 63 },
  { id: "jude", num: "86", name: "Jude", abbr: "Jud", file: "86-Jud-morphgnt.txt", webIdx: 64 },
  {
    id: "revelation",
    num: "87",
    name: "Revelation",
    abbr: "Re",
    file: "87-Re-morphgnt.txt",
    webIdx: 65,
  },
];

const DATA_DIR = path.resolve("src/lib/corpus/data");

// Create the data folder if not exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Grammatical parsers decoding
function expandMorph(posCode, parseCode) {
  const posMap = {
    "N-": "Noun",
    "V-": "Verb",
    "A-": "Adjective",
    "C-": "Conjunction",
    "D-": "Adverb",
    "I-": "Interjection",
    "P-": "Preposition",
    RA: "Article",
    RD: "Demonstrative Pronoun",
    RI: "Interrogative/Indefinite Pronoun",
    RP: "Personal Pronoun",
    RR: "Relative Pronoun",
    "X-": "Particle",
  };

  const pos = posMap[posCode] || posCode;

  const personMap = { 1: "1st person", 2: "2nd person", 3: "3rd person" };
  const tenseMap = {
    P: "present",
    I: "imperfect",
    F: "future",
    A: "aorist",
    X: "perfect",
    Y: "pluperfect",
  };
  const voiceMap = { A: "active", M: "middle", P: "passive", E: "middle/passive", D: "deponent" };
  const moodMap = {
    I: "indicative",
    D: "imperative",
    S: "subjunctive",
    O: "optative",
    N: "infinitive",
    P: "participle",
  };
  const caseMap = { N: "nominative", G: "genitive", D: "dative", A: "accusative", V: "vocative" };
  const numberMap = { S: "singular", P: "plural" };
  const genderMap = { M: "masculine", F: "feminine", N: "neuter" };
  const degreeMap = { C: "comparative", S: "superlative" };

  const parts = [pos];

  if (posCode === "V-") {
    const pers = personMap[parseCode[0]];
    const tense = tenseMap[parseCode[1]];
    const voice = voiceMap[parseCode[2]];
    const mood = moodMap[parseCode[3]];

    if (pers) parts.push(pers);
    if (tense) parts.push(tense);
    if (voice) parts.push(voice);
    if (mood) parts.push(mood);

    if (mood === "participle") {
      const c = caseMap[parseCode[4]];
      const num = numberMap[parseCode[5]];
      const gen = genderMap[parseCode[6]];
      if (c) parts.push(c);
      if (num) parts.push(num);
      if (gen) parts.push(gen);
    }
  } else if (["N-", "A-", "RA", "RD", "RI", "RP", "RR"].includes(posCode)) {
    const c = caseMap[parseCode[0]];
    const num = numberMap[parseCode[1]];
    const gen = genderMap[parseCode[2]];
    const deg = degreeMap[parseCode[3]];

    if (c) parts.push(c);
    if (num) parts.push(num);
    if (gen) parts.push(gen);
    if (deg) parts.push(deg);
  } else {
    for (const char of parseCode) {
      if (char !== "-") {
        const decoded =
          caseMap[char] ||
          numberMap[char] ||
          genderMap[char] ||
          tenseMap[char] ||
          voiceMap[char] ||
          moodMap[char] ||
          personMap[char];
        if (decoded && !parts.includes(decoded)) {
          parts.push(decoded);
        }
      }
    }
  }

  return parts.join(", ");
}

// Dynamic Greek transliterator
function transliterateGreek(word) {
  const normalized = word.normalize("NFD");
  const hasRoughBreathing = normalized.includes("\u0314");

  const charMap = {
    α: "a",
    β: "b",
    γ: "g",
    δ: "d",
    ε: "e",
    ζ: "z",
    η: "e",
    θ: "th",
    ι: "i",
    κ: "k",
    λ: "l",
    μ: "m",
    ν: "n",
    ξ: "x",
    ο: "o",
    π: "p",
    ρ: "r",
    σ: "s",
    ς: "s",
    τ: "t",
    υ: "y",
    φ: "ph",
    χ: "ch",
    ψ: "ps",
    ω: "o",
    Α: "A",
    Β: "B",
    Γ: "G",
    Δ: "D",
    Ε: "E",
    Ζ: "Z",
    Η: "E",
    Θ: "Th",
    Ι: "I",
    Κ: "K",
    Λ: "L",
    Μ: "M",
    Ν: "N",
    Ξ: "X",
    Ο: "O",
    Π: "P",
    Ρ: "R",
    Σ: "S",
    Τ: "T",
    Υ: "Y",
    Φ: "Ph",
    Χ: "Ch",
    Ψ: "Ps",
    Ω: "O",
  };

  let cleanStr = "";
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (char >= "\u0300" && char <= "\u036f") continue;
    cleanStr += charMap[char] || char;
  }

  if (hasRoughBreathing) {
    const isUpper = word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase();
    if (isUpper) {
      return "H" + cleanStr.charAt(0).toLowerCase() + cleanStr.slice(1);
    } else {
      return "h" + cleanStr;
    }
  }

  return cleanStr;
}

// Main execution function
async function main() {
  console.log("🚀 Phase 1 Ingestion: Starting Real GNT Corpus Ingestion...");

  // 1. Fetch Strong's Lexicon
  console.log("📖 Sourcing Strong's Lexicon from Mormon Documentation Project...");
  let strongsDb = [];
  try {
    const strongsRes = await fetch(
      "https://raw.githubusercontent.com/mormon-documentation-project/strongs/master/strongs.json",
    );
    if (!strongsRes.ok) throw new Error("Strong's download failed");
    strongsDb = await strongsRes.json();
    console.log(`✅ Loaded ${strongsDb.length} Strong's entries.`);
  } catch (err) {
    console.error(
      "⚠️ Could not download Strong's Lexicon, falling back to local fallback generation. Error:",
      err.message,
    );
  }

  // Create mappings for Strong's entries (filtering for Greek "G" entries)
  const strongsMap = new Map();
  const lemmaToStrongs = new Map();
  const lemmaFrequency = new Map();

  for (const entry of strongsDb) {
    if (entry.number && entry.number.startsWith("G")) {
      const gNum = parseInt(entry.number.slice(1), 10);
      const cleanStrong = `G${gNum}`;
      strongsMap.set(cleanStrong, entry);

      // Clean lemma to match GNT (standard Greek normalized)
      if (entry.lemma) {
        const cleanLemma = entry.lemma.normalize("NFC").trim().toLowerCase();
        lemmaToStrongs.set(cleanLemma, cleanStrong);
      }
    }
  }

  // 2. Ingest Book by Book
  console.log("📚 Fetching and parsing SBLGNT & MorphGNT...");
  const booksMetadata = [];

  for (const book of books) {
    console.log(`   └─ Ingesting ${book.name} (${book.abbr})...`);

    // Fetch MorphGNT text file
    let gntText = "";
    try {
      const url = `https://raw.githubusercontent.com/morphgnt/sblgnt/master/${book.file}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed for ${book.name}`);
      gntText = await res.text();
    } catch (err) {
      console.error(`❌ Failed to load GNT for ${book.name}:`, err.message);
      continue;
    }

    const lines = gntText.split("\n");

    // Extract unique chapters
    const chaptersSet = new Set();
    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.trim().split(/\s+/);
      if (parts.length < 7) continue;
      const refCode = parts[0];
      const chapterNum = parseInt(refCode.slice(2, 4), 10);
      chaptersSet.add(chapterNum);
    }
    const uniqueChapters = Array.from(chaptersSet).sort((a, b) => a - b);

    // Fetch WEB chapters from getBible API in parallel
    const bookNr = book.webIdx + 1;
    const chaptersMap = new Map(); // chapterNum -> array of verse texts
    console.log(`      └─ Fetching WEB English chapters for ${book.name} from getBible API...`);
    await Promise.all(
      uniqueChapters.map(async (chapterNum) => {
        try {
          const url = `https://api.getbible.net/v2/web/${bookNr}/${chapterNum}.json`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data = await res.json();
          const verses = [];
          if (data && data.verses) {
            for (const v of data.verses) {
              verses[v.verse - 1] = v.text.trim();
            }
          }
          chaptersMap.set(chapterNum, verses);
        } catch (err) {
          console.error(
            `      ⚠️ Failed to fetch English for ${book.name} ${chapterNum}:`,
            err.message,
          );
          chaptersMap.set(chapterNum, []);
        }
      }),
    );

    const versesMap = new Map(); // verseRef -> Verse object
    let tokenCount = 0;

    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.trim().split(/\s+/);
      if (parts.length < 7) continue;

      const [refCode, posCode, parseCode, surface, word, normalized, lemma] = parts;

      const chapterNum = parseInt(refCode.slice(2, 4), 10);
      const verseNum = parseInt(refCode.slice(4, 6), 10);
      const refLabel = `${book.name} ${chapterNum}:${verseNum}`;

      // Extract trailing punctuation
      let punctuationAfter = "";
      const idx = surface.indexOf(word);
      if (idx !== -1) {
        punctuationAfter = surface.slice(idx + word.length);
      }

      // Check for Strong's and Gloss mapping
      const cleanLemma = lemma.normalize("NFC").toLowerCase();
      const mappedStrong = lemmaToStrongs.get(cleanLemma) || undefined;
      let glosses = [cleanLemma];

      if (mappedStrong) {
        const strongEntry = strongsMap.get(mappedStrong);
        if (strongEntry && strongEntry.description) {
          // Parse a short gloss from Strong's definition
          const shortDef = strongEntry.description
            .split(";")[0]
            .split(",")[0]
            .replace(/[()]/g, "")
            .trim()
            .toLowerCase();
          if (shortDef && shortDef.length > 1) {
            glosses = [shortDef];
          }
        }
      }

      const token = {
        id: `${book.id}-${chapterNum}-${verseNum}-${tokenCount++}`,
        surface,
        lemma,
        translit: transliterateGreek(word),
        morph: expandMorph(posCode, parseCode),
        pos: expandMorph(posCode, "").split(",")[0],
        glosses,
        strongs: mappedStrong,
      };

      // Count frequency
      lemmaFrequency.set(cleanLemma, (lemmaFrequency.get(cleanLemma) || 0) + 1);

      if (punctuationAfter) {
        token.punctuationAfter = punctuationAfter;
      }

      if (!versesMap.has(refLabel)) {
        // Fetch English text from pre-fetched chapters
        let englishText = "[English translation missing]";
        const chArray = chaptersMap.get(chapterNum);
        if (chArray) {
          const vText = chArray[verseNum - 1];
          if (vText) englishText = vText;
        }

        versesMap.set(refLabel, {
          ref: refLabel,
          englishText,
          tokens: [],
        });
      }

      versesMap.get(refLabel).tokens.push(token);
    }

    const verses = Array.from(versesMap.values());

    // Save book JSON
    const bookData = {
      id: book.id,
      name: book.name,
      verses,
    };

    const outPath = path.join(DATA_DIR, `${book.id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(bookData, null, 2));

    // Compile books.json metadata
    const chaptersCount = verses.reduce((max, v) => {
      const match = v.ref.match(/:(\d+)/);
      const chMatch = v.ref.match(/(\d+):/);
      if (chMatch) {
        const ch = parseInt(chMatch[1], 10);
        return ch > max ? ch : max;
      }
      return max;
    }, 0);

    booksMetadata.push({
      id: book.id,
      name: book.name,
      abbr: book.abbr,
      chaptersCount,
      versesCount: verses.length,
      testament: "NT",
      language: "greek",
    });
  }

  // 4. Save Metadata index (preserving OT if present)
  let finalMetadata = booksMetadata;
  const booksPath = path.join(DATA_DIR, "books.json");
  if (fs.existsSync(booksPath)) {
    const existing = JSON.parse(fs.readFileSync(booksPath, "utf-8"));
    const otBooks = existing.filter((b) => b.testament === "OT");
    // Place OT before NT for canonical order
    finalMetadata = [...otBooks, ...booksMetadata];
  }

  fs.writeFileSync(booksPath, JSON.stringify(finalMetadata, null, 2));
  console.log(`✅ Saved metadata for ${finalMetadata.length} books in books.json.`);

  // 5. Generate lexicon.json falling back to Strong's
  console.log("✍️ Generating fallback lexicon database in lexicon.json...");
  const lexicon = {};

  for (const [cleanLemma, strongKey] of lemmaToStrongs.entries()) {
    const entry = strongsMap.get(strongKey);
    if (entry) {
      lexicon[cleanLemma] = {
        lemma: entry.lemma,
        translit: entry.xlit || transliterateGreek(entry.lemma),
        pronunciation: entry.pronounce || "",
        morphSummary: "Strong's Lexicon Fallback",
        glosses: [entry.description.split(";")[0].split(",")[0].trim()],
        shortDef: entry.description,
        strongs: entry.number,
        frequency: lemmaFrequency.get(cleanLemma) || 0,
        neighbours: [],
        examples: [],
      };
    }
  }

  fs.writeFileSync(path.join(DATA_DIR, "lexicon.json"), JSON.stringify(lexicon, null, 2));
  console.log("✅ Generated lexicon.json successfully.");
  console.log(
    " 🎉 Phase 1 Ingestion Complete! Full GNT database files exported to src/lib/corpus/data/",
  );
}

main().catch((err) => {
  console.error("❌ Catastrophic error in ingestion pipeline:", err);
  process.exit(1);
});
