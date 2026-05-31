import type { WordAnalysis } from "../corpus/types";

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
  greekText: string
): Promise<WordAnalysis> {
  const apiKey = getEnvVar("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const model = getEnvVar("GEMINI_MODEL") || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `You are a cautious Koine Greek seminary tutor. Analyze the word "${lemma}" in the context of the verse "${ref}" which reads:
Greek: "${greekText}"
English: "${englishText}"

Provide:
1. Pronunciation (IPA) and short morphological summary.
2. Glosses.
3. A brief definition of the word's primary meaning.
4. 2-4 semantic neighbours (synonyms in Koine Greek). For each neighbour:
   - Overlap: how they are similar.
   - Distinction: how they differ.
   - Typical usage: where they are normally found.
   - Implication: why the author preferred the target lemma in this specific context.
   - If Replaced: a translation/nuance diff if the author had chosen the neighbour.
5. 2-3 usage examples from other biblical or classical literature.

CRITICAL: Keep your tone academic, hedged, and non-dogmatic. Use words like "may suggest", "often associated with", "could imply". Avoid declaring absolute authorial intent.

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
      "greekSnippet": "greek snippet",
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
            greekSnippet: { type: "STRING" },
            highlightLemma: { type: "STRING" },
            note: { type: "STRING" }
          },
          required: ["ref", "englishSnippet", "greekSnippet", "highlightLemma"]
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

  console.log(`[Gemini] Sending request for model: ${model}`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`[Gemini] API error ${response.status}:`, errorText);
    throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.warn(`[Gemini] Unexpected response structure:`, json);
    throw new Error("Empty candidate response from Gemini API");
  }

  console.log(`[Gemini] Response received successfully`);
  return JSON.parse(text) as WordAnalysis;
}
