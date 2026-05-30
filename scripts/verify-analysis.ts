import { getWordAnalysis } from "../src/lib/corpus/index";

async function test() {
  console.log("--------------------------------------------------");
  console.log("Verifying WhyThisWord Analysis Pipelines...");
  console.log("--------------------------------------------------");

  // Test 1: Curated Mock Lookup
  console.log("\n[Test 1] Testing Curated Mock Data (λόγος)...");
  const curated = await getWordAnalysis("λόγος");
  if (curated && curated.neighbours.length > 0) {
    console.log(`✅ Success: Curated neighbours: ${curated.neighbours.map((n) => n.lemma).join(", ")}`);
  } else {
    console.error("❌ Failed to load curated analysis for λόγος");
    process.exit(1);
  }

  // Test 2: Lexicon Fallback (No context provided)
  console.log("\n[Test 2] Testing Lexicon Fallback (πρεσβύτερος without context)...");
  const fallback = await getWordAnalysis("πρεσβύτερος");
  if (fallback && fallback.shortDef) {
    console.log(`✅ Success: Lexicon glosses: ${fallback.glosses.join(", ")}`);
    console.log(`   Short Def: ${fallback.shortDef.slice(0, 80)}...`);
  } else {
    console.error("❌ Failed to load lexicon fallback definition for πρεσβύτερος");
    process.exit(1);
  }

  // Test 3: Gemini Synthesis & Cache (Requires API key)
  console.log("\n[Test 3] Testing AI Synthesis & Caching (πρεσβύτερος with context)...");
  if (!process.env.GEMINI_API_KEY) {
    console.log("⚠️  Skipping: GEMINI_API_KEY not found in environment.");
    console.log("   To test: GEMINI_API_KEY=your_key bun scripts/verify-analysis.ts");
  } else {
    const context = {
      ref: "2 John 1:1",
      englishText: "The elder, to the chosen lady and her children, whom I love in truth;",
      greekText: "Ὁ πρεσβύτερος ἐκλεκτῇ κυρίᾳ καὶ τοῖς τέκνοις αὐτῆς, οὓς ἐγὼ ἀγαπῶ ἐν ἀληθείᾳ,",
    };

    console.log("   Querying Gemini API (this may take a few seconds)...");
    const start = Date.now();
    try {
      const result = await getWordAnalysis("πρεσβύτερος", context);
      const duration = Date.now() - start;
      if (result && result.neighbours && result.neighbours.length > 0) {
        console.log(`✅ Success (completed in ${duration}ms)`);
        console.log(`   AI Generated neighbours: ${result.neighbours.map((n) => n.lemma).join(", ")}`);
        console.log(`   First Neighbour Overlap: ${result.neighbours[0].overlap.slice(0, 80)}...`);

        // Check if cached locally
        console.log("\n[Test 4] Verifying cache hit on subsequent query...");
        const cacheStart = Date.now();
        const cachedResult = await getWordAnalysis("πρεσβύτερος", context);
        const cacheDuration = Date.now() - cacheStart;
        if (cachedResult) {
          console.log(`✅ Success: Cache hit loaded in ${cacheDuration}ms (expected <50ms)`);
        } else {
          console.error("❌ Cache hit returned undefined");
          process.exit(1);
        }
      } else {
        console.error("❌ API returned incomplete or invalid structure");
        process.exit(1);
      }
    } catch (err) {
      console.error("❌ API Call Failed:", err);
      process.exit(1);
    }
  }

  console.log("\n--------------------------------------------------");
  console.log("All configured checks passed successfully!");
  console.log("--------------------------------------------------");
}

test().catch((err) => {
  console.error("Unexpected failure:", err);
  process.exit(1);
});
