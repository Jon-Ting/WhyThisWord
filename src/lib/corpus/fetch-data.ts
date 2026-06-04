// Fetches corpus JSON files from /public/corpus at runtime.
// These were previously bundled into the Worker via dynamic import() of
// 1,193 chapter JSON files (~141 MB), which caused Cloudflare Worker
// error 1102 (resource limits exceeded) at boot.
//
// Routes that call these helpers must run on the client (ssr: false) or
// inside a context where fetch() can resolve "/corpus/..." against the
// current origin.

const cache = new Map<string, Promise<unknown>>();

function url(relative: string): string {
  // relative like "ot/psalms/110.json" or "lexicon.json"
  return `/corpus/${relative}`;
}

export async function fetchCorpusJson<T>(relative: string): Promise<T> {
  let pending = cache.get(relative) as Promise<T> | undefined;
  if (!pending) {
    pending = (async () => {
      const res = await fetch(url(relative));
      if (!res.ok) {
        throw new Error(`Failed to load corpus asset ${relative}: ${res.status}`);
      }
      return (await res.json()) as T;
    })();
    cache.set(relative, pending);
  }
  return pending;
}

export function corpusAssetExists(relative: string): boolean {
  return cache.has(relative);
}
