import fs from "fs";
import path from "path";

// OT Books mapping for MorphHB
const booksMetadata = JSON.parse(fs.readFileSync("src/lib/corpus/data/books.json", "utf-8"));
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

const pilotBookIds = ["genesis", "psalms"];

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

const stemMap = {
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

function decodeHebrewMorph(morph) {
  if (!morph || !morph.startsWith("H")) return morph;

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
      // Type (common, proper, etc. - usually second char but sometimes skipped)
      // For simplicity, we'll just check standard positions
      let offset = 1;
      if (comp[1] === "p" || comp[1] === "c") {
        parts.push(comp[1] === "p" ? "proper" : "common");
        offset = 2;
      }

      const gender = genderMap[comp[offset]] || "";
      const number = numberMap[comp[offset + 1]] || "";
      const state = stateMap[comp[offset + 2]] || "";

      if (gender) parts.push(gender);
      if (number) parts.push(number);
      if (state) parts.push(state);
    } else {
      // General decoding for other parts
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

// Simple rule-based transliterator for Hebrew (consonants + some vowels)
function transliterateHebrew(word) {
  // Mapping for consonants
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

  // Mapping for vowels (simplified)
  const vowelMap = {
    "\u05B8": "a", // qamets
    "\u05B7": "a", // patach
    "\u05B6": "e", // segol
    "\u05B5": "e", // tsere
    "\u05B4": "i", // hiriq
    "\u05B8": "o", // qamets hatuf (simplified)
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

  // Clean up: handle double vowels, dagesh (simplified), etc.
  return result || word;
}

async function main() {
  console.log("🚀 Starting Hebrew Ingestion...");

  // 1. Fetch Strong's Lexicon (Hebrew)
  console.log("📖 Fetching Strong's Lexicon...");
  const strongsRes = await fetch(
    "https://raw.githubusercontent.com/mormon-documentation-project/strongs/master/strongs.json",
  );
  const strongsDb = await strongsRes.json();
  const strongsMap = new Map();
  for (const entry of strongsDb) {
    if (entry.number && entry.number.startsWith("H")) {
      strongsMap.set(entry.number, entry);
    }
  }
  console.log(`✅ Loaded ${strongsMap.size} Hebrew Strong's entries.`);

  // Load existing lexicon to append
  const lexiconPath = "src/lib/corpus/data/lexicon.json";
  let fullLexicon = {};
  if (fs.existsSync(lexiconPath)) {
    fullLexicon = JSON.parse(fs.readFileSync(lexiconPath, "utf-8"));
  }

  // 2. Ingest Books
  for (const bookId of pilotBookIds) {
    const bookMeta = otBooks.find((b) => b.id === bookId);
    if (!bookMeta) continue;

    const xmlFile = morphHbFilenames[bookId];
    if (!xmlFile) continue;

    console.log(`📚 Ingesting ${bookMeta.name}...`);

    // Fetch MorphHB XML
    const xmlUrl = `https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc/${xmlFile}`;
    const xmlRes = await fetch(xmlUrl);
    const xmlText = await xmlRes.text();

    // Fetch WEB English chapters
    console.log(`   └─ Fetching WEB English (${bookMeta.chaptersCount} chapters)...`);
    const chaptersMap = new Map();

    // Determine webIdx (Genesis is 0, Exodus 1, etc. in getBible)
    // Actually OT books start from 0 to 38 in getBible
    const webIdx = otBooks.indexOf(bookMeta);

    const chapterTasks = [];
    for (let ch = 1; ch <= bookMeta.chaptersCount; ch++) {
      chapterTasks.push(
        (async () => {
          const webUrl = `https://api.getbible.net/v2/web/${webIdx + 1}/${ch}.json`;
          try {
            const webRes = await fetch(webUrl);
            if (webRes.ok) {
              const webData = await webRes.json();
              chaptersMap.set(ch, webData.verses);
            }
          } catch (err) {
            console.warn(`      ⚠️ Failed to fetch chapter ${ch}:`, err.message);
          }
        })(),
      );
    }
    await Promise.all(chapterTasks);

    // Parse XML (Regex approach)
    const verses = [];
    const chapterRegex = /<chapter osisID="[^"]+\.(\d+)">([\s\S]*?)<\/chapter>/g;
    let chMatch;
    while ((chMatch = chapterRegex.exec(xmlText)) !== null) {
      const chNum = parseInt(chMatch[1], 10);
      const chContent = chMatch[2];
      const verseRegex = /<verse osisID="[^"]+\.\d+\.(\d+)">([\s\S]*?)<\/verse>/g;
      let vMatch;
      while ((vMatch = verseRegex.exec(chContent)) !== null) {
        const vNum = parseInt(vMatch[1], 10);
        const vContent = vMatch[2];

        const tokens = [];
        const wordRegex = /<w\s+([^>]*?)>(.*?)<\/w>/g;
        let wMatch;
        let tokenId = 0;
        while ((wMatch = wordRegex.exec(vContent)) !== null) {
          const attrStr = wMatch[1];
          const surface = wMatch[2].replace(/\//g, ""); // Remove separators

          const lemmaMatch = attrStr.match(/lemma="([^"]+)"/);
          const morphMatch = attrStr.match(/morph="([^"]+)"/);

          const lemmaRaw = lemmaMatch ? lemmaMatch[1] : "";
          const morph = morphMatch ? morphMatch[1] : "";

          // Extract Strong's number from lemma (e.g., "b/7225" -> "H7225")
          const strongMatch = lemmaRaw.match(/(\d+)/);
          const strong = strongMatch ? "H" + strongMatch[1] : undefined;

          const strongEntry = strong ? strongsMap.get(strong) : null;
          const lemma = strongEntry ? strongEntry.lemma : surface;

          const token = {
            id: `${bookId}-${chNum}-${vNum}-${tokenId++}`,
            surface,
            lemma: lemma || surface,
            translit: transliterateHebrew(surface),
            morph: decodeHebrewMorph(morph),
            glosses: strongEntry ? [strongEntry.kjv_def].filter(Boolean) : [],
            strongs: strong,
          };
          tokens.push(token);

          // Update lexicon
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
          englishText: englishVerse ? englishVerse.text : "",
          tokens,
          language: "hebrew",
        });
      }
    }

    // Save Book Data
    const bookOutput = {
      id: bookId,
      name: bookMeta.name,
      verses,
    };
    const outputPath = `src/lib/corpus/data/ot/${bookId}.json`;
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(bookOutput, null, 2));
    console.log(`✅ Saved ${bookMeta.name} to ${outputPath}`);
  }

  // Save Lexicon
  fs.writeFileSync(lexiconPath, JSON.stringify(fullLexicon, null, 2));
  console.log(`✅ Updated lexicon at ${lexiconPath}`);
}

main().catch(console.error);
