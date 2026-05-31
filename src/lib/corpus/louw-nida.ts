import { analyses } from "./mock/analyses";

// Find semantic neighbors for a lemma using Louw-Nida domain mapping
export async function findNeighboursByLemma(lemma: string): Promise<string[]> {
  if (!lemma) return [];
  const normalizedLemma = lemma.normalize("NFC").trim();

  try {
    // Dynamically load lexicon and Louw-Nida mapping
    const lexicon = (await import("./data/lexicon.json").then((m) => m.default || m)) as Record<string, any>;
    const lnData = await import("./data/louw-nida.json").then((m) => m.default || m);

    // 1. Get Strong's number for the lemma
    // Lexicon keys are lowercased
    const word = lexicon[normalizedLemma] || lexicon[normalizedLemma.toLowerCase()];
    if (!word || !word.strongs) {
      console.warn(`No Strong's number found for lemma: ${normalizedLemma}`);
      return [];
    }

    const strongs = word.strongs;
    const domains = lnData.strongToLn[strongs] || [];

    // 2. Find all Strong's numbers sharing these domains
    const neighbourStrongs = new Set<string>();
    domains.forEach((domain: string) => {
      const sList = lnData.lnToStrong[domain] || [];
      sList.forEach((s: string) => {
        if (s !== strongs) {
          neighbourStrongs.add(s);
        }
      });
    });

    // 3. Map Strong's numbers back to lemmas
    const neighbourLemmas = Array.from(neighbourStrongs)
      .map((s) => lnData.strongToLemma[s])
      .filter((l) => l && l !== normalizedLemma);

    // Return unique lemmas
    return Array.from(new Set(neighbourLemmas));
  } catch (err) {
    console.error(`Failed to find Louw-Nida neighbours for ${lemma}:`, err);
    return [];
  }
}
