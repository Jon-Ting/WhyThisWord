export interface GreekToken {
  id: string;
  surface: string; // surface form as it appears in text
  lemma: string;
  translit: string;
  morph: string;
  glosses: string[];
  strongs?: string;
  pos?: string;
  punctuationAfter?: string;
}

export interface Verse {
  ref: string; // e.g. "John 1:1"
  englishText: string;
  tokens: GreekToken[];
}

export interface Passage {
  id: string; // url slug, e.g. "john-1"
  ref: string; // human label "John 1:1"
  title: string;
  description: string;
  verses: Verse[];
}

export interface SemanticNeighbour {
  lemma: string;
  translit: string;
  shortDef?: string;
  overlap?: string;
  distinction?: string;
  typicalUsage?: string;
  implication?: string;
  ifReplaced?: string; // section D, per-neighbour
}

export interface UsageExample {
  ref: string;
  englishSnippet: string;
  greekSnippet: string;
  highlightLemma: string;
  note?: string;
}

export interface WordAnalysis {
  lemma: string;
  translit: string;
  pronunciation: string; // placeholder ok
  morphSummary: string;
  glosses: string[];
  shortDef: string;
  neighbours: SemanticNeighbour[];
  examples: UsageExample[];
}
