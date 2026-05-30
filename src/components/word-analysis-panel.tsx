import { X, BookOpen, GitCompare, Sparkles, History, Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { GreekToken, WordAnalysis } from "@/lib/corpus";
import { getWordAnalysis } from "@/lib/corpus";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import logoIcon from "../../assets/logos/icon-rounded-light.png";

interface WordAnalysisPanelProps {
  token: GreekToken | null;
  onClose: () => void;
}

export function WordAnalysisPanel({ token, onClose }: WordAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<WordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    getWordAnalysis(token.lemma)
      .then((res) => {
        if (active) {
          setAnalysis(res || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setAnalysis(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  if (!token) {
    return <EmptyState />;
  }

  return (
    <aside className="flex h-full flex-col bg-card">
      <header className="flex items-start justify-between gap-3 border-b border-border/70 px-6 py-5">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Word analysis</p>
          <h3 className="mt-1 font-greek text-3xl leading-tight text-foreground">{token.lemma}</h3>
          <p className="mt-1 font-serif text-sm italic text-muted-foreground">
            {token.translit} · {token.morph}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close analysis"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
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
              <LexicalSection analysis={analysis} token={token} />
              {analysis.neighbours && analysis.neighbours.length > 0 && (
                <>
                  <NuanceSection analysis={analysis} />
                  <ReplaceSection analysis={analysis} />
                </>
              )}
              {analysis.examples && analysis.examples.length > 0 && (
                <ExamplesSection analysis={analysis} />
              )}
              <Disclaimer />
            </>
          ) : (
            <NoAnalysisFallback token={token} />
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

function LexicalSection({ analysis, token }: { analysis: WordAnalysis; token: GreekToken }) {
  return (
    <section>
      <SectionLabel icon={BookOpen} letter="A">
        Lexical
      </SectionLabel>
      <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Surface</dt>
        <dd className="font-greek text-base">{token.surface}</dd>
        <dt className="text-muted-foreground">Lemma</dt>
        <dd className="font-greek text-base">{analysis.lemma}</dd>
        <dt className="text-muted-foreground">Translit.</dt>
        <dd className="font-serif italic">{analysis.translit}</dd>
        <dt className="text-muted-foreground">Pronunciation</dt>
        <dd className="font-mono text-xs text-muted-foreground">{analysis.pronunciation}</dd>
        <dt className="text-muted-foreground">Morphology</dt>
        <dd>{analysis.morphSummary}</dd>
        <dt className="text-muted-foreground">Glosses</dt>
        <dd className="text-foreground">{analysis.glosses.join(" · ")}</dd>
      </dl>
      <p className="mt-4 font-serif text-[15px] leading-relaxed text-reader-ink">
        {analysis.shortDef}
      </p>
    </section>
  );
}

function NuanceSection({ analysis }: { analysis: WordAnalysis }) {
  return (
    <section>
      <SectionLabel icon={GitCompare} letter="B/C">
        Semantic neighbours & nuance
      </SectionLabel>
      <ul className="space-y-5">
        {analysis.neighbours.map((n) => (
          <li key={n.lemma} className="rounded-lg border border-border/70 bg-background/40 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h5 className="font-greek text-xl text-foreground">{n.lemma}</h5>
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
  return (
    <div className="mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-[15px] leading-relaxed text-reader-ink">{children}</p>
    </div>
  );
}

function ReplaceSection({ analysis }: { analysis: WordAnalysis }) {
  return (
    <section>
      <SectionLabel icon={Sparkles} letter="D">
        What changes if replaced?
      </SectionLabel>
      <ul className="space-y-4">
        {analysis.neighbours.map((n) => (
          <li
            key={n.lemma}
            className="border-l-2 border-accent-scholar/60 bg-accent-scholar/5 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-accent-scholar/90">
              If <span className="font-greek normal-case">{analysis.lemma}</span> →{" "}
              <span className="font-greek normal-case">{n.lemma}</span>
            </p>
            <p className="mt-1.5 font-serif text-[15px] leading-relaxed italic text-reader-ink">
              {n.ifReplaced}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ExamplesSection({ analysis }: { analysis: WordAnalysis }) {
  return (
    <section>
      <SectionLabel icon={History} letter="E">
        Usage examples
      </SectionLabel>
      <ul className="space-y-4">
        {analysis.examples.map((ex) => (
          <li key={ex.ref + ex.greekSnippet}>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{ex.ref}</p>
            <p className="mt-1 font-greek text-lg leading-snug text-greek-ink">{ex.greekSnippet}</p>
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
          Comparative notes are interpretive aids, not verdicts. Greek synonyms overlap
          substantially; nuance suggestions are offered as starting points for careful reading, not
          as the author's certain intent.
        </span>
      </p>
    </>
  );
}

function NoAnalysisFallback({ token }: { token: GreekToken }) {
  return (
    <section className="space-y-4">
      <SectionLabel icon={BookOpen} letter="A">
        Lexical
      </SectionLabel>
      <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Surface</dt>
        <dd className="font-greek text-base">{token.surface}</dd>
        <dt className="text-muted-foreground">Lemma</dt>
        <dd className="font-greek text-base">{token.lemma}</dd>
        <dt className="text-muted-foreground">Morphology</dt>
        <dd>{token.morph}</dd>
        <dt className="text-muted-foreground">Glosses</dt>
        <dd>{token.glosses.join(" · ")}</dd>
      </dl>
      <p className="font-serif text-sm italic text-muted-foreground">
        No standard definition or curated comparative-semantics analysis could be found for this
        term. Standard dictionary entries are available for the vast majority of vocabulary in the
        GNT. Try selecting a word with curated comparative notes (indicated by a dotted underline),
        such as <span className="font-greek not-italic">λόγος</span>,{" "}
        <span className="font-greek not-italic">θεός</span>, or{" "}
        <span className="font-greek not-italic">πρός</span>.
      </p>
    </section>
  );
}

function EmptyState() {
  return (
    <aside className="flex h-full flex-col items-center justify-center bg-card px-8 text-center">
      <img
        src={logoIcon}
        alt="Why This Word"
        className="h-12 w-12 object-contain opacity-25 dark:opacity-40 mb-4"
      />
      <h3 className="mt-2 font-serif text-lg text-foreground">Click a Greek word</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Select a word in the verse to open its lexical entry, semantic neighbours, and a reflection
        on what shifts if it were swapped for a near-synonym.
      </p>
    </aside>
  );
}
