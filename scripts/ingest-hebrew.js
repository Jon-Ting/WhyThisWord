import fs from "fs";
import path from "path";

// --- Configuration ---
const CONCURRENCY_LIMIT = 5; // Max simultaneous network requests
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// OT Books mapping for MorphHB
let booksMetadata = [];
try {
  booksMetadata = JSON.parse(fs.readFileSync("src/lib/corpus/data/books.json", "utf-8"));
} catch (e) {
  console.warn("Could not read books.json, using fallback metadata.");
}

const otBooks = booksMetadata.filter((b) => b.testament === "OT");

const morphHbFilenames = {
  genesis: "Gen.xml",
  exodus: "Exod.xml",
  leviticus: "Lev.xml",
  numbers: "Num.xml",
  deuteronomy: "Deut.xml",
  joshua: "Josh.xml",
  judges: "Judg.xml",
  ruth: "Ruth.xml",
  "1-samuel": "1Sam.xml",
  "2-samuel": "2Sam.xml",
  "1-kings": "1Kgs.xml",
  "2-kings": "2Kgs.xml",
  "1-chronicles": "1Chr.xml",
  "2-chronicles": "2Chr.xml",
  ezra: "Ezra.xml",
  nehemiah: "Neh.xml",
  esther: "Esth.xml",
  job: "Job.xml",
  psalms: "Ps.xml",
  proverbs: "Prov.xml",
  ecclesiastes: "Eccl.xml",
  "song-of-solomon": "Song.xml",
  isaiah: "Isa.xml",
  jeremiah: "Jer.xml",
  lamentations: "Lam.xml",
  ezekiel: "Ezek.xml",
  daniel: "Dan.xml",
  hosea: "Hos.xml",
  joel: "Joel.xml",
  amos: "Amos.xml",
  obadiah: "Obad.xml",
  jonah: "Jonah.xml",
  micah: "Mic.xml",
  nahum: "Nah.xml",
  habakkuk: "Hab.xml",
  zephaniah: "Zeph.xml",
  haggai: "Hag.xml",
  zechariah: "Zech.xml",
  malachi: "Mal.xml",
};

// --- Helpers ---

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (res.status === 429 && retries > 0) {
        const delay = RETRY_DELAY_MS * (MAX_RETRIES - retries + 1);
        console.warn(`      ⚠️ Rate limited (429). Retrying in ${delay}ms...`);
        await sleep(delay);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw new Error(`Status ${res.status}`);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      const delay = RETRY_DELAY_MS * (MAX_RETRIES - retries + 1);
      console.warn(`      ⚠️ Fetch failed: ${err.message}. Retrying in ${delay}ms...`);
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

async function processInBatches(tasks, limit) {
  const results = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    results.push(...(await Promise.all(batch.map((task) => task()))));
  }
  return results;
}

// Morphology Decoder Mappings (OSHM)
const posMap = {
  N: "Noun",
  V: "Verb",
  A: "Adjective",
  D: "Adverb",
  P: "Pronoun",
  R: "Preposition",
  C: "Conjunction",
  T: "Particle",
  S: "Suffix",
  M: "Number",
};

const hebrewStemMap = {
  q: "Qal",
  N: "Niphal",
  p: "Piel",
  P: "Pual",
  h: "Hiphil",
  H: "Hophal",
  t: "Hithpael",
  o: "Polel",
  O: "Polal",
  r: "Hithpolel",
  m: "Poel",
  M: "Poal",
  k: "Palel",
  K: "Pulal",
  u: "Qal passive",
  w: "Hishtaphel",
  y: "Hithpalpel",
};

const aramaicStemMap = {
  q: "Peal",
  u: "Peil",
  t: "Ithpeel",
  p: "Pael",
  T: "Ithpaal",
  h: "Haphel",
  i: "Ittaphal",
  a: "Aphel",
  s: "Shaphel",
  w: "Ishtaphel",
  o: "Polel",
  O: "Polal",
  r: "Hithpolel",
  y: "Palpel",
  Y: "Ithpalpel",
};

const tenseMap = {
  q: "Perfect",
  y: "Imperfect",
  w: "Wayyiqtol",
  v: "Weqatal",
  p: "Participle",
  r: "Passive Participle",
  a: "Infinitive Absolute",
  c: "Infinitive Construct",
  i: "Imperative",
  j: "Jussive",
  h: "Cohortative",
};

const personMap = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

const genderMap = {
  m: "masculine",
  f: "feminine",
  c: "common",
};

const numberMap = {
  s: "singular",
  p: "plural",
  d: "dual",
};

const stateMap = {
  a: "absolute",
  c: "construct",
  d: "determined",
};

function decodeMorph(morph) {
  if (!morph) return morph;
  const isAramaic = morph.startsWith("A");
  const isHebrew = morph.startsWith("H");
  if (!isAramaic && !isHebrew) return morph;

  const stemMap = isAramaic ? aramaicStemMap : hebrewStemMap;

  const components = morph.slice(1).split("/");
  const decodedComponents = components.map((comp) => {
    if (comp.length === 0) return "";

    const pos = posMap[comp[0]] || comp[0];
    const parts = [pos];

    if (comp[0] === "V") {
      const stem = stemMap[comp[1]] || comp[1];
      const tense = tenseMap[comp[2]] || comp[2];
      const person = personMap[comp[3]] || "";
      const gender = genderMap[comp[4]] || "";
      const number = numberMap[comp[5]] || "";

      if (stem) parts.push(stem);
      if (tense) parts.push(tense);
      if (person) parts.push(person);
      if (gender) parts.push(gender);
      if (number) parts.push(number);
    } else if (comp[0] === "N" || comp[0] === "A") {
      let offset = 1;
      if (comp[1] === "p" || comp[1] === "c" || comp[1] === "g") {
        parts.push(comp[1] === "p" ? "proper" : comp[1] === "c" ? "common" : "gentilic");
        offset = 2;
      }

      const gender = genderMap[comp[offset]] || "";
      const number = numberMap[comp[offset + 1]] || "";
      const state = stateMap[comp[offset + 2]] || "";

      if (gender) parts.push(gender);
      if (number) parts.push(number);
      if (state) parts.push(state);
    } else {
      for (let i = 1; i < comp.length; i++) {
        const char = comp[i];
        const decoded = genderMap[char] || numberMap[char] || personMap[char] || stateMap[char];
        if (decoded && !parts.includes(decoded)) parts.push(decoded);
      }
    }

    return parts.filter(Boolean).join(" ");
  });

  return decodedComponents.filter(Boolean).join(" + ");
}

function transliterateHebrew(word) {
  const consMap = {
    א: "'",
    ב: "b",
    ג: "g",
    ד: "d",
    ה: "h",
    ו: "v",
    ז: "z",
    ח: "ch",
    ט: "t",
    י: "y",
    כ: "k",
    ל: "l",
    מ: "m",
    נ: "n",
    ס: "s",
    ע: "`",
    פ: "p",
    צ: "ts",
    ק: "q",
    ר: "r",
    ש: "sh",
    ת: "t",
    ך: "k",
    ם: "m",
    ן: "n",
    ף: "p",
    ץ: "ts",
  };

  const vowelMap = {
    "\u05B8": "a", // qamets
    "\u05B7": "a", // patach
    "\u05B6": "e", // segol
    "\u05B5": "e", // tsere
    "\u05B4": "i", // hiriq
    "\u05BB": "u", // qubuts
    "\u05B9": "o", // holam
    "\u05B0": "e", // sheva
  };

  let result = "";
  for (const char of word) {
    if (consMap[char]) {
      result += consMap[char];
    } else if (vowelMap[char]) {
      result += vowelMap[char];
    }
  }

  return result || word;
}

// --- Main Ingestion Logic ---

async function main() {
  console.log("🚀 Starting Hebrew/Aramaic Ingestion (Phase 8: Optimized & Per-Chapter)...");

  // 1. Fetch Strong's Lexicon
  console.log("📖 Fetching Strong's Lexicon...");
  const strongsRes = await fetchWithRetry(
    "https://raw.githubusercontent.com/mormon-documentation-project/strongs/master/strongs.json",
  );
  const strongsDb = await strongsRes.json();
  const strongsMap = new Map();
  for (const entry of strongsDb) {
    if (entry.number && entry.number.startsWith("H")) {
      strongsMap.set(entry.number, entry);
    }
  }
  console.log(`✅ Loaded ${strongsMap.size} Hebrew/Aramaic Strong's entries.`);

  const lexiconPath = "src/lib/corpus/data/lexicon.json";
  let fullLexicon = {};
  if (fs.existsSync(lexiconPath)) {
    fullLexicon = JSON.parse(fs.readFileSync(lexiconPath, "utf-8"));
  }

  // 2. Ingest Books
  const booksToIngest = otBooks;

  for (const bookMeta of booksToIngest) {
    const bookId = bookMeta.id;
    const xmlFile = morphHbFilenames[bookId];
    if (!xmlFile) {
      console.warn(`      ⚠️ No MorphHB XML mapping for ${bookId}. Skipping.`);
      continue;
    }

    console.log(`📚 Ingesting ${bookMeta.name} (${bookId})...`);

    // Fetch MorphHB XML
    const xmlUrl = `https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc/${xmlFile}`;
    const xmlRes = await fetchWithRetry(xmlUrl);
    const xmlText = await xmlRes.text();

    // Fetch WEB English chapters in batches
    console.log(`   └─ Fetching WEB English (${bookMeta.chaptersCount} chapters)...`);
    const chaptersMap = new Map();
    const webIdx = booksMetadata.indexOf(bookMeta);

    const chapterTasks = [];
    for (let ch = 1; ch <= bookMeta.chaptersCount; ch++) {
      chapterTasks.push(async () => {
        const webUrl = `https://api.getbible.net/v2/web/${webIdx + 1}/${ch}.json`;
        try {
          const webRes = await fetchWithRetry(webUrl);
          const webData = await webRes.json();
          chaptersMap.set(ch, webData.verses);
        } catch (err) {
          console.warn(`      ⚠️ Failed to fetch ${bookMeta.name} ch ${ch}: ${err.message}`);
        }
      });
    }

    await processInBatches(chapterTasks, CONCURRENCY_LIMIT);

    // Parse XML
    const chapterRegex = /<chapter osisID="[^"]+\.(\d+)">([\s\S]*?)<\/chapter>/g;
    let chMatch;
    while ((chMatch = chapterRegex.exec(xmlText)) !== null) {
      const chNum = parseInt(chMatch[1], 10);
      const chContent = chMatch[2];
      const verses = [];

      const verseRegex = /<verse osisID="[^"]+\.\d+\.(\d+)">([\s\S]*?)<\/verse>/g;
      let vMatch;
      while ((vMatch = verseRegex.exec(chContent)) !== null) {
        const vNum = parseInt(vMatch[1], 10);
        const vContent = vMatch[2];

        const tokens = [];
        const wordRegex = /<w\s+([^>]*?)>(.*?)<\/w>/g;
        let wMatch;
        let tokenId = 0;
        let aramaicWordCount = 0;

        while ((wMatch = wordRegex.exec(vContent)) !== null) {
          const attrStr = wMatch[1];
          const surface = wMatch[2].replace(/\//g, "");

          const lemmaMatch = attrStr.match(/lemma="([^"]+)"/);
          const morphMatch = attrStr.match(/morph="([^"]+)"/);

          const lemmaRaw = lemmaMatch ? lemmaMatch[1] : "";
          const morph = morphMatch ? morphMatch[1] : "";

          if (morph.startsWith("A")) aramaicWordCount++;

          const strongMatch = lemmaRaw.match(/(\d+)/);
          const strong = strongMatch ? "H" + strongMatch[1] : undefined;

          const strongEntry = strong ? strongsMap.get(strong) : null;
          const lemma = strongEntry ? strongEntry.lemma : surface;

          const token = {
            id: `${bookId}-${chNum}-${vNum}-${tokenId++}`,
            surface,
            lemma: lemma || surface,
            translit: transliterateHebrew(surface),
            morph: decodeMorph(morph),
            glosses: strongEntry ? [strongEntry.kjv_def].filter(Boolean) : [],
            strongs: strong,
          };
          tokens.push(token);

          if (lemma && !fullLexicon[lemma]) {
            fullLexicon[lemma] = {
              lemma,
              translit: transliterateHebrew(lemma),
              pronunciation: strongEntry ? strongEntry.pronun : "",
              morphSummary: "Strong's Lexicon Fallback",
              glosses: token.glosses,
              shortDef: strongEntry ? strongEntry.strongs_def : "",
              strongs: strong,
              frequency: 0,
              neighbours: [],
              examples: [],
            };
          }
        }

        const englishVerse = (chaptersMap.get(chNum) || []).find((v) => v.verse === vNum);
        verses.push({
          ref: `${bookMeta.name} ${chNum}:${vNum}`,
          englishText: englishVerse ? englishVerse.text : "[English translation missing]",
          tokens,
          language: aramaicWordCount > tokens.length / 2 ? "aramaic" : "hebrew",
        });
      }

      // Save Chapter Data
      const chapterOutput = {
        id: `${bookId}-${chNum}`,
        name: bookMeta.name,
        chapter: chNum,
        verses,
        language: bookMeta.language,
      };
      const outputPath = `src/lib/corpus/data/ot/${bookId}/${chNum}.json`;
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(chapterOutput)); // Minified
    }
    console.log(`✅ Saved ${bookMeta.name} chapters to src/lib/corpus/data/ot/${bookId}/`);
  }

  // Save Lexicon
  fs.writeFileSync(lexiconPath, JSON.stringify(fullLexicon)); // Minified
  console.log(`✅ Updated lexicon at ${lexiconPath}`);
}

main().catch((err) => {
  console.error("❌ Fatal error during ingestion:", err);
  process.exit(1);
});
