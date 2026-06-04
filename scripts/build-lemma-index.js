#!/usr/bin/env node
// Walks public/corpus/{ot,nt}/<book>/<chapter>.json and emits
// public/corpus/index/lemma-refs.json mapping NFC-normalized lemma -> [ref, ...]
// Used by findExamplesInCorpus to avoid scanning the entire Bible at runtime.

import fs from "node:fs";
import path from "node:path";

const root = path.resolve("public/corpus");
const outDir = path.join(root, "index");
fs.mkdirSync(outDir, { recursive: true });

const lemmaToRefs = new Map();
let chaptersScanned = 0;
let versesScanned = 0;

for (const testament of ["ot", "nt"]) {
  const tDir = path.join(root, testament);
  if (!fs.existsSync(tDir)) continue;
  for (const bookId of fs.readdirSync(tDir)) {
    const bDir = path.join(tDir, bookId);
    if (!fs.statSync(bDir).isDirectory()) continue;
    for (const file of fs.readdirSync(bDir)) {
      if (!file.endsWith(".json")) continue;
      const json = JSON.parse(fs.readFileSync(path.join(bDir, file), "utf-8"));
      chaptersScanned++;
      for (const verse of json.verses || []) {
        versesScanned++;
        const seen = new Set();
        for (const tok of verse.tokens || []) {
          if (!tok.lemma) continue;
          const lem = tok.lemma.normalize("NFC").trim();
          if (!lem || seen.has(lem)) continue;
          seen.add(lem);
          let arr = lemmaToRefs.get(lem);
          if (!arr) {
            arr = [];
            lemmaToRefs.set(lem, arr);
          }
          arr.push({ ref: verse.ref, t: testament, b: bookId, c: json.chapter });
        }
      }
    }
  }
}

// Compact shape: { lemma: [[ref, testament, bookId, chapter], ...] }
const out = {};
for (const [lemma, entries] of lemmaToRefs) {
  out[lemma] = entries.map((e) => [e.ref, e.t, e.b, e.c]);
}

const outPath = path.join(outDir, "lemma-refs.json");
fs.writeFileSync(outPath, JSON.stringify(out));
const stat = fs.statSync(outPath);
console.log(
  `Indexed ${lemmaToRefs.size} lemmas across ${versesScanned} verses in ${chaptersScanned} chapters -> ${outPath} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`,
);
