import type { WordAnalysis } from "../corpus/types";
import { findNeighboursByLemma } from "../corpus/louw-nida";

function getEnvVar(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof globalThis !== "undefined" && (globalThis as any)[key]) {
    return (globalThis as any)[key];
  }
  return undefined;
}

export async function fetchSemanticAnalysis(
  lemma: string,
  ref: string,
  englishText: string,
  sourceText: string,
  language: string = "greek"
): Promise<WordAnalysis> {
  const isHebrew = language === "hebrew" || language === "aramaic";
  
  // 0. Pre-identify semantic neighbours
  let lnNeighbours: string[] = [];
  if (language === "greek") {
    lnNeighbours = await findNeighboursByLemma(lemma);
  }
  
  const suggestedNeighbours = lnNeighbours.slice(0, 5);

  const neighbourInstructions = suggestedNeighbours.length > 0
    ? `The following semantic neighbours have been pre-identified for "${lemma}" using Louw-Nida domains: ${suggestedNeighbours.join(", ")}. 
   Please analyze 2-4 of these specifically (or other highly relevant synonyms if these are not suitable in this context).`
    : `Identify 2-4 semantic neighbours (synonyms in the original language, ${language}).`;

  const apiKey = getEnvVar("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const model = getEnvVar("GEMINI_MODEL") || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `You are a cautious Biblical Languages scholar and seminary tutor. Analyze the ${language} word "${lemma}" in the context of the verse "${ref}" which reads:
Original: "${sourceText}"
English: "${englishText}"

Provide:
1. Transliteration and Pronunciation (IPA).
2. Short morphological summary (e.g., Verb, Qal, Perfect, 3ms for Hebrew; or Verb, Aorist, Active, Indicative, 3s for Greek).
3. Glosses.
4. A brief definition of the word's primary meaning in this specific context.
5. ${neighbourInstructions} For each neighbour:
   - Overlap: how they are similar.
   - Distinction: how they differ.
   - Typical usage: where they are normally found in the ${language === "greek" ? "NT / LXX" : "HB / Tanakh"}.
   - Implication: why the author likely preferred the target lemma "${lemma}" over this specific neighbour in this specific context.
   - If Replaced: a translation/nuance diff if the author had chosen the neighbour.
6. 2-3 usage examples from other biblical or relevant ancient literature (e.g., DSS, Josephus, Philo if Greek; same/other OT books if Hebrew).

CRITICAL: Keep your tone academic, hedged, and non-dogmatic. Use words like "may suggest", "often associated with", "could imply". Avoid declaring absolute authorial intent.
`;


Return a JSON object matching the following structure:
{
  "lemma": "${lemma}",
  "translit": "transliterated representation",
  "pronunciation": "/IPA pronunciation/",
  "morphSummary": "e.g., Noun, Nominative, Singular",
  "glosses": ["gloss1", "gloss2"],
  "shortDef": "definition",
  "neighbours": [
    {
      "lemma": "neighbour lemma",
      "translit": "neighbour translit",
      "overlap": "overlap explanation",
      "distinction": "distinction explanation",
      "typicalUsage": "typical usage",
      "implication": "implication of original choice over this neighbour in this context",
      "ifReplaced": "how the translation/nuance shifts if this neighbour replaced the original lemma"
    }
  ],
  "examples": [
    {
      "ref": "verse ref",
      "englishSnippet": "english snippet",
      "originalSnippet": "original language snippet",
      "highlightLemma": "matching lemma",
      "note": "optional explanatory note"
    }
  ]
}`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      lemma: { type: "STRING" },
      translit: { type: typeSchema("STRING") },
      pronunciation: { type: "STRING" },
      morphSummary: { type: "STRING" },
      glosses: { type: "ARRAY", items: { type: "STRING" } },
      shortDef: { type: "STRING" },
      neighbours: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            lemma: { type: "STRING" },
            translit: { type: "STRING" },
            overlap: { type: "STRING" },
            distinction: { type: "STRING" },
            typicalUsage: { type: "STRING" },
            implication: { type: "STRING" },
            ifReplaced: { type: "STRING" }
          },
          required: ["lemma", "translit", "overlap", "distinction", "typicalUsage", "implication", "ifReplaced"]
        }
      },
      examples: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            ref: { type: "STRING" },
            englishSnippet: { type: "STRING" },
            originalSnippet: { type: "STRING" },
            highlightLemma: { type: "STRING" },
            note: { type: "STRING" }
          },
          required: ["ref", "englishSnippet", "originalSnippet", "highlightLemma"]
        }
      }
    },
    required: ["lemma", "translit", "pronunciation", "morphSummary", "glosses", "shortDef", "neighbours", "examples"]
  };

  function typeSchema(val: string) { return val; } // Helper for lint bypass

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1
    }
  };

  console.log(`\x1b[36m[Gemini]\x1b[0m Sending request for model: \x1b[33m${model}\x1b[0m`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`\x1b[33m[Gemini] API error ${response.status}:\x1b[0m`, errorText);
    throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.warn(`\x1b[33m[Gemini] Unexpected response structure:\x1b[0m`, json);
    throw new Error("Empty candidate response from Gemini API");
  }

  console.log(`\x1b[32m[Gemini] Response received successfully\x1b[0m`);
  return JSON.parse(text) as WordAnalysis;
}
