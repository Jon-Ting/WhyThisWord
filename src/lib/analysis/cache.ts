import type { WordAnalysis } from "../corpus/types";

// In-memory cache fallback (active across container lifecycle)
const memoryCache = new Map<string, WordAnalysis>();

async function getLocalCache(key: string): Promise<WordAnalysis | undefined> {
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const safeKey = key.replace(/[^a-zA-Z0-9-]/g, "_");
      const filepath = path.join(process.cwd(), ".cache", "analyses", `${safeKey}.json`);
      const raw = await fs.readFile(filepath, "utf-8");
      return JSON.parse(raw) as WordAnalysis;
    } catch {
      // Cache miss or local fs error
    }
  }
  return undefined;
}

async function setLocalCache(key: string, data: WordAnalysis): Promise<void> {
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const cacheDir = path.join(process.cwd(), ".cache", "analyses");
      await fs.mkdir(cacheDir, { recursive: true });
      const safeKey = key.replace(/[^a-zA-Z0-9-]/g, "_");
      const filepath = path.join(cacheDir, `${safeKey}.json`);
      await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("Failed to write to local cache file:", err);
    }
  }
}

export async function getCachedAnalysis(
  lemma: string,
  verseRef: string,
  env?: any
): Promise<WordAnalysis | undefined> {
  const cacheKey = `analysis:${lemma}:${verseRef}`;

  // 1. Check memory cache first
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // 2. Check Cloudflare KV if bound
  const kv = env?.WHY_THIS_WORD_CACHE || (globalThis as any).WHY_THIS_WORD_CACHE;
  if (kv) {
    try {
      const raw = await kv.get(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as WordAnalysis;
        memoryCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch (err) {
      console.error("Cloudflare KV retrieval failed:", err);
    }
  }

  // 3. Check local filesystem fallback (dev only)
  const localData = await getLocalCache(cacheKey);
  if (localData) {
    memoryCache.set(cacheKey, localData);
    return localData;
  }

  return undefined;
}

export async function setCachedAnalysis(
  lemma: string,
  verseRef: string,
  analysis: WordAnalysis,
  env?: any
): Promise<void> {
  const cacheKey = `analysis:${lemma}:${verseRef}`;

  // 1. Save to in-memory Map
  memoryCache.set(cacheKey, analysis);

  // 2. Save to Cloudflare KV if bound
  const kv = env?.WHY_THIS_WORD_CACHE || (globalThis as any).WHY_THIS_WORD_CACHE;
  if (kv) {
    try {
      await kv.put(cacheKey, JSON.stringify(analysis));
    } catch (err) {
      console.error("Cloudflare KV write failed:", err);
    }
  }

  // 3. Save to local filesystem fallback (dev only)
  await setLocalCache(cacheKey, analysis);
}
