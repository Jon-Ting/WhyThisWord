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
  .inputValidator((data: { lemma: string; ref: string; englishText: string; greekText: string }) => data)
  .handler(async ({ data }) => {
    console.log(`[Analysis] Starting request for: ${data.lemma} at ${data.ref}`);
    const env = await getVinxiEnv();

    // 1. Check cache first
    const cached = await getCachedAnalysis(data.lemma, data.ref, env);
    if (cached) {
      console.log(`[Analysis] Cache HIT for: ${data.lemma} at ${data.ref}`);
      return cached;
    }
    console.log(`[Analysis] Cache MISS for: ${data.lemma} at ${data.ref}. Querying Gemini...`);

    // 2. Query Gemini if cache missed
    const generated = await fetchSemanticAnalysis(
      data.lemma,
      data.ref,
      data.englishText,
      data.greekText
    );
    console.log(`[Analysis] Gemini generation complete for: ${data.lemma}`);

    // 3. Write generated results back to cache
    await setCachedAnalysis(data.lemma, data.ref, generated, env);
    console.log(`[Analysis] Cache updated for: ${data.lemma}`);

    return generated;
  });
