import { cn } from "@/lib/utils";
import type { Verse } from "@/lib/corpus";
import { hasCuratedAnalysis } from "@/lib/corpus";

interface VerseReaderProps {
  verse: Verse;
  selectedTokenId: string | null;
  onSelectToken: (tokenId: string) => void;
}

export function VerseReader({ verse, selectedTokenId, onSelectToken }: VerseReaderProps) {
  return (
    <article className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h2 className="font-serif text-sm uppercase tracking-[0.18em] text-muted-foreground">
          {verse.ref}
        </h2>
        <span className="text-xs text-muted-foreground">SBLGNT</span>
      </header>

      <p className="font-serif text-2xl leading-relaxed text-reader-ink md:text-[1.7rem]">
        {verse.englishText}
      </p>

      <div className="border-t border-border/60 pt-6">
        <p className="font-greek text-2xl leading-loose text-greek-ink md:text-[1.9rem]">
          {verse.tokens.map((t, i) => {
            const isSelected = selectedTokenId === t.id;
            const isClickable = !!(t.lemma && t.lemma.length > 0);
            const isCurated = isClickable && hasCuratedAnalysis(t.lemma);

            return (
              <span key={t.id}>
                <button
                  type="button"
                  onClick={() => onSelectToken(t.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-sm px-0.5 transition-colors cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isSelected
                      ? "bg-accent-scholar/15 text-accent-scholar underline decoration-accent-scholar/70 decoration-1 underline-offset-[6px]"
                      : isCurated
                        ? "border-b border-dotted border-accent-scholar/70 text-foreground hover:bg-accent hover:border-solid hover:border-accent-scholar"
                        : isClickable
                          ? "text-greek-ink/90 hover:bg-accent hover:text-foreground hover:underline hover:decoration-accent-scholar/30 hover:underline-offset-[6px]"
                          : "text-greek-ink/60",
                  )}
                >
                  {t.surface}
                </button>
                {t.punctuationAfter ?? ""}
                {i < verse.tokens.length - 1 ? " " : ""}
              </span>
            );
          })}
        </p>
      </div>
    </article>
  );
}
