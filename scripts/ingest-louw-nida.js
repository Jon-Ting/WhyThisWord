import fs from "fs";
import path from "path";

const TSV_URL = "https://raw.githubusercontent.com/Clear-Bible/macula-greek/main/SBLGNT/tsv/macula-greek-SBLGNT.tsv";
const OUTPUT_DIR = "src/lib/corpus/data";
const OUTPUT_FILE = path.join(OUTPUT_DIR, "louw-nida.json");

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("📥 Downloading Louw-Nida mapping from Macula Greek...");
  const response = await fetch(TSV_URL);
  if (!response.ok) throw new Error(`Failed to fetch TSV: ${response.statusText}`);
  
  const text = await response.text();
  const lines = text.split("\n");
  const headers = lines[0].split("\t");
  
  const strongIdx = headers.indexOf("strong");
  const lnIdx = headers.indexOf("ln");
  const lemmaIdx = headers.indexOf("lemma");
  
  if (strongIdx === -1 || lnIdx === -1) {
    throw new Error("Could not find strong or ln columns in TSV");
  }
  
  const strongToLn = {};
  const lnToStrong = {};
  const strongToLemma = {}; // For debug/verification
  
  console.log("⚙️  Processing mappings...");
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    if (cols.length < headers.length) continue;
    
    let strong = cols[strongIdx]?.trim();
    const lnField = cols[lnIdx]?.trim();
    const lemma = cols[lemmaIdx]?.trim();
    
    if (!strong || !lnField) continue;
    
    // Normalize strong's (add G prefix)
    // Macula uses numbers like '976'. We want 'G976'.
    if (!strong.startsWith("G") && !strong.startsWith("H")) {
      strong = "G" + strong;
    }
    
    // Multiple domains can be space-separated
    const domains = lnField.split(" ").filter(Boolean);
    
    if (!strongToLn[strong]) strongToLn[strong] = new Set();
    
    // We want the primary lemma associated with this Strong's.
    // Macula lists lemmas for every word, so we just take the first one we find for a Strong's.
    if (lemma && !strongToLemma[strong]) {
      strongToLemma[strong] = lemma;
    }

    domains.forEach(d => {
      strongToLn[strong].add(d);
      if (!lnToStrong[d]) lnToStrong[d] = new Set();
      lnToStrong[d].add(strong);
    });
  }
  
  // Convert Sets to Arrays for JSON
  const result = {
    strongToLn: Object.fromEntries(
      Object.entries(strongToLn).map(([k, v]) => [k, Array.from(v)])
    ),
    lnToStrong: Object.fromEntries(
      Object.entries(lnToStrong).map(([k, v]) => [k, Array.from(v)])
    ),
    strongToLemma: strongToLemma
  };
  
  console.log(`✅ Processed ${Object.keys(result.strongToLn).length} Strong's numbers and ${Object.keys(result.lnToStrong).length} LN domains.`);
  
  // Also add some domain names for context if we can, but for now just the codes
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`💾 Saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
