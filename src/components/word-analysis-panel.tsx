import {
  X,
  BookOpen,
  GitCompare,
  Sparkles,
  History,
  Info,
  Loader2,
  PanelRightClose,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CorpusToken, WordAnalysis, Verse } from "@/lib/corpus";
import { getWordAnalysis } from "@/lib/corpus";
import { useSettings } from "@/hooks/use-settings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import logoIcon from "../../assets/logos/icon-rounded-light.png";

interface WordAnalysisPanelProps {
  token: CorpusToken | null;
  verse?: Verse | null;
  onClose: () => void;
  onCollapse?: () => void;
}

export function WordAnalysisPanel({ token, verse, onClose, onCollapse }: WordAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<WordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const { aiSynthesisEnabled } = useSettings();

  const language = verse?.language || "greek";
  const isHebrew = language === "hebrew" || language === "aramaic";
  const langFont = isHebrew ? "font-hebrew" : "font-greek";

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);

    const sourceText = verse
      ? verse.tokens.map((t) => t.surface + (t.punctuationAfter ?? "")).join(" ")
      : "";

    const context = verse
      ? {
          ref: verse.ref,
          englishText: verse.englishText,
          sourceText,
          language: verse.language,
        }
      : undefined;

    console.log(`[Panel] Fetching analysis for lemma: ${token.lemma}`);
    getWordAnalysis(token.lemma, context, { disableAI: !aiSynthesisEnabled })
      .then((res) => {
        if (active) {
          console.log(`[Panel] Analysis received for: ${token.lemma}`, res);
          setAnalysis(res || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn(`[Panel] Error fetching analysis for: ${token.lemma}`, err);
        if (active) {
          setAnalysis(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [token, verse, aiSynthesisEnabled]);

  if (!token) {
    return <EmptyState onCollapse={onCollapse} />;
  }

  return (
    <aside className="flex h-full flex-col bg-card">
      <header className="flex items-start justify-between gap-3 border-b border-border/70 px-6 py-5">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Word analysis</p>
          <h3 className={cn("mt-1 text-3xl leading-tight text-foreground", langFont)}>
            {token.lemma}
          </h3>
          <p className="mt-1 font-serif text-sm italic text-muted-foreground">
            {token.translit} · {token.morph}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              aria-label="Collapse panel"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close analysis"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="space-y-10 px-6 py-6">
          {loading ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-accent-scholar/80" />
              <p className="text-xs font-serif italic text-muted-foreground/80">
                Loading definition...
              </p>
            </div>
          ) : analysis ? (
            <>
              <LexicalSection analysis={analysis} token={token} language={language} />
              {analysis.neighbours && analysis.neighbours.length > 0 && (
                <>
                  <NuanceSection analysis={analysis} language={language} />
                  <ReplaceSection analysis={analysis} language={language} />
                </>
              )}
              {analysis.examples && analysis.examples.length > 0 && (
                <ExamplesSection analysis={analysis} language={language} />
              )}
              <Disclaimer />
            </>
          ) : (
            <NoAnalysisFallback token={token} language={language} />
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function SectionLabel({
  icon: Icon,
  letter,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  letter: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px] font-medium text-muted-foreground">
        {letter}
      </span>
      <Icon className="h-3.5 w-3.5 text-accent-scholar" />
      <h4 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {children}
      </h4>
    </div>
  );
}

function LexicalSection({
  analysis,
  token,
  language,
}: {
  analysis: WordAnalysis;
  token: CorpusToken;
  language: string;
}) {
  const isHebrew = language === "hebrew" || language === "aramaic";
  const langFont = isHebrew ? "font-hebrew" : "font-greek";

  return (
    <section>
      <SectionLabel icon={BookOpen} letter="A">
        Lexical
      </SectionLabel>
      <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Surface</dt>
        <dd className={cn("text-base", langFont)}>{token.surface}</dd>
        <dt className="text-muted-foreground">Lemma</dt>
        <dd className={cn("text-base", langFont)}>{analysis.lemma}</dd>
        <dt className="text-muted-foreground">Translit.</dt>
        <dd className="font-serif italic">{analysis.translit}</dd>
        <dt className="text-muted-foreground">Pronunciation</dt>
        <dd className="font-mono text-xs text-muted-foreground">{analysis.pronunciation}</dd>
        <dt className="text-muted-foreground">Morphology</dt>
        <dd>{analysis.morphSummary}</dd>
        <dt className="text-muted-foreground">Glosses</dt>
        <dd className="text-foreground">{analysis.glosses.join(" · ")}</dd>
        {analysis.domains && analysis.domains.length > 0 && (
          <>
            <dt className="text-muted-foreground">Themes</dt>
            <dd className="text-xs italic text-accent-scholar/90">
              {analysis.domains.join(" · ")}
            </dd>
          </>
        )}
        {analysis.frequency !== undefined && (
          <>
            <dt className="text-muted-foreground">Frequency</dt>
            <dd className="text-xs">
              Appears <span className="font-semibold text-foreground">{analysis.frequency}</span>{" "}
              times in the {language === "greek" ? "NT" : "Bible"}
            </dd>
          </>
        )}
      </dl>
      <p className="mt-4 font-serif text-[15px] leading-relaxed text-reader-ink">
        {analysis.shortDef}
      </p>
    </section>
  );
}

function NuanceSection({ analysis, language }: { analysis: WordAnalysis; language: string }) {
  const hasNuance = analysis.neighbours.some((n) => n.overlap || n.distinction);
  const isHebrew = language === "hebrew" || language === "aramaic";
  const langFont = isHebrew ? "font-hebrew" : "font-greek";

  if (!hasNuance) {
    return (
      <section>
        <SectionLabel icon={GitCompare} letter="B/C">
          Semantic neighbours
        </SectionLabel>
        <div className="flex flex-col gap-3">
          {analysis.neighbours.map((n) => (
            <div key={n.lemma} className="rounded-lg border border-border/70 bg-background/40 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h5 className={cn("text-xl text-foreground", langFont)}>{n.lemma}</h5>
                <span className="font-serif text-xs italic text-muted-foreground">
                  {n.translit}
                </span>
              </div>
              {n.shortDef && (
                <p className="mt-2 font-serif text-sm leading-relaxed text-reader-ink line-clamp-2 italic">
                  {n.shortDef}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs italic text-muted-foreground">
          Activate AI synthesis to see a detailed contrastive analysis between these terms in this
          specific context.
        </p>
      </section>
    );
  }

  return (
    <section>
      <SectionLabel icon={GitCompare} letter="B/C">
        Semantic neighbours & nuance
      </SectionLabel>
      <ul className="space-y-5">
        {analysis.neighbours.map((n) => (
          <li key={n.lemma} className="rounded-lg border border-border/70 bg-background/40 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h5 className={cn("text-xl text-foreground", langFont)}>{n.lemma}</h5>
              <span className="font-serif text-xs italic text-muted-foreground">{n.translit}</span>
            </div>
            <NuanceRow label="Overlap">{n.overlap}</NuanceRow>
            <NuanceRow label="Distinction">{n.distinction}</NuanceRow>
            <NuanceRow label="Typical usage">{n.typicalUsage}</NuanceRow>
            <NuanceRow label="Possible implication">{n.implication}</NuanceRow>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NuanceRow({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-[15px] leading-relaxed text-reader-ink">{children}</p>
    </div>
  );
}

function ReplaceSection({ analysis, language }: { analysis: WordAnalysis; language: string }) {
  const hasReplaceData = analysis.neighbours.some((n) => n.ifReplaced);
  if (!hasReplaceData) return null;

  const isHebrew = language === "hebrew" || language === "aramaic";
  const langFont = isHebrew ? "font-hebrew" : "font-greek";

  return (
    <section>
      <SectionLabel icon={Sparkles} letter="D">
        What changes if replaced?
      </SectionLabel>
      <ul className="space-y-4">
        {analysis.neighbours.map((n) => {
          if (!n.ifReplaced) return null;
          return (
            <li
              key={n.lemma}
              className="border-l-2 border-accent-scholar/60 bg-accent-scholar/5 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-accent-scholar/90">
                If <span className={cn("normal-case", langFont)}>{analysis.lemma}</span> →{" "}
                <span className={cn("normal-case", langFont)}>{n.lemma}</span>
              </p>
              <p className="mt-1.5 font-serif text-[15px] leading-relaxed italic text-reader-ink">
                {n.ifReplaced}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ExamplesSection({ analysis, language }: { analysis: WordAnalysis; language: string }) {
  const isHebrew = language === "hebrew" || language === "aramaic";
  const langFont = isHebrew ? "font-hebrew" : "font-greek";

  return (
    <section>
      <SectionLabel icon={History} letter="E">
        Usage examples
      </SectionLabel>
      <ul className="space-y-4">
        {analysis.examples.map((ex) => (
          <li key={ex.ref + ex.originalSnippet}>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{ex.ref}</p>
            <p
              className={cn(
                "mt-1 text-lg leading-snug",
                langFont,
                isHebrew ? "text-hebrew-ink" : "text-greek-ink",
              )}
            >
              {ex.originalSnippet}
            </p>
            <p className="mt-1 font-serif text-[15px] italic leading-snug text-reader-ink">
              {ex.englishSnippet}
            </p>
            {ex.note ? <p className="mt-1 text-xs text-muted-foreground">{ex.note}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Disclaimer() {
  return (
    <>
      <Separator />
      <p className="flex items-start gap-2 text-xs italic leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Comparative notes are interpretive aids, not verdicts. Original language synonyms overlap
          substantially; nuance suggestions are offered as starting points for careful reading, not
          as the author's certain intent.
        </span>
      </p>
    </>
  );
}

function NoAnalysisFallback({ token, language }: { token: CorpusToken; language: string }) {
  const isHebrew = language === "hebrew" || language === "aramaic";
  const langFont = isHebrew ? "font-hebrew" : "font-greek";

  return (
    <section className="space-y-4">
      <SectionLabel icon={BookOpen} letter="A">
        Lexical
      </SectionLabel>
      <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Surface</dt>
        <dd className={cn("text-base", langFont)}>{token.surface}</dd>
        <dt className="text-muted-foreground">Lemma</dt>
        <dd className={cn("text-base", langFont)}>{token.lemma}</dd>
        <dt className="text-muted-foreground">Morphology</dt>
        <dd>{token.morph}</dd>
        <dt className="text-muted-foreground">Glosses</dt>
        <dd>{token.glosses.join(" · ")}</dd>
      </dl>
      <p className="font-serif text-sm italic text-muted-foreground">
        No standard definition or curated comparative-semantics analysis could be found for this
        term. Standard dictionary entries are available for the vast majority of vocabulary in the
        Bible. Try selecting a word with curated comparative notes (indicated by a dotted
        underline).
      </p>
    </section>
  );
}

function EmptyState({ onCollapse }: { onCollapse?: () => void }) {
  return (
    <aside className="relative flex h-full flex-col items-center justify-center bg-card px-8 text-center">
      {onCollapse && (
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Collapse panel"
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      )}
      <img
        src={logoIcon}
        alt="Why This Word"
        className="h-12 w-12 object-contain opacity-25 dark:opacity-40 mb-4"
      />
      <h3 className="mt-2 font-serif text-lg text-foreground">Click a word</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Select a word in the verse to open its lexical entry, semantic neighbours, and a reflection
        on what shifts if it were swapped for a near-synonym.
      </p>
    </aside>
  );
}
