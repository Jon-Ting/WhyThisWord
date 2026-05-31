import { createServerFn } from "@tanstack/react-start";
import { getCachedAnalysis, setCachedAnalysis } from "./cache";
import { fetchSemanticAnalysis } from "./gemini";

// Helper to safely resolve Vinxi event and platform bindings
async function getVinxiEnv() {
  try {
    const { getEvent } = await import("vinxi/http");
    const event = getEvent();
    return event?.context?.cloudflare?.env;
  } catch {
    return undefined;
  }
}

export const getSemanticAnalysisServer = createServerFn({ method: "GET" })
  .inputValidator((data: { lemma: string; ref: string; englishText: string; sourceText: string }) => data)
  .handler(async ({ data }) => {
    console.log(`\x1b[36m[Analysis]\x1b[0m Starting request for: \x1b[35m${data.lemma}\x1b[0m at \x1b[35m${data.ref}\x1b[0m`);
    const env = await getVinxiEnv();

    // 1. Check cache first
    const cached = await getCachedAnalysis(data.lemma, data.ref, env);
    if (cached) {
      console.log(`\x1b[36m[Analysis]\x1b[0m \x1b[32mCache HIT\x1b[0m for: ${data.lemma}`);
      return cached;
    }
    console.log(`\x1b[36m[Analysis]\x1b[0m \x1b[33mCache MISS\x1b[0m for: ${data.lemma}. Querying Gemini...`);

    // 2. Query Gemini if cache missed
    const generated = await fetchSemanticAnalysis(
      data.lemma,
      data.ref,
      data.englishText,
      data.sourceText
    );
    console.log(`\x1b[36m[Analysis]\x1b[0m \x1b[32mGemini generation complete\x1b[0m for: ${data.lemma}`);

    // 3. Write generated results back to cache
    await setCachedAnalysis(data.lemma, data.ref, generated, env);
    console.log(`\x1b[36m[Analysis]\x1b[0m Cache updated for: ${data.lemma}`);

    return generated;
  });
