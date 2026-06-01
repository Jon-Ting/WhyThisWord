import { cn } from "@/lib/utils";
import type { Verse } from "@/lib/corpus";
import { hasCuratedAnalysis } from "@/lib/corpus";

interface VerseReaderProps {
  verse: Verse;
  selectedTokenId: string | null;
  onSelectToken: (tokenId: string) => void;
}

export function VerseReader({ verse, selectedTokenId, onSelectToken }: VerseReaderProps) {
  const isHebrew = verse.language === "hebrew" || verse.language === "aramaic";
  const direction = isHebrew ? "rtl" : "ltr";

  return (
    <article className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h2 className="font-serif text-sm uppercase tracking-[0.18em] text-muted-foreground">
          {verse.ref}
        </h2>
        <span className="text-xs text-muted-foreground">{isHebrew ? "WLC (BHS)" : "SBLGNT"}</span>
      </header>

      <p className="font-serif text-2xl leading-relaxed text-reader-ink md:text-[1.7rem]">
        {verse.englishText}
      </p>

      <div className={cn("border-t border-border/60 pt-6", isHebrew && "text-right")}>
        <p
          dir={direction}
          className={cn(
            "text-2xl leading-loose md:text-[1.9rem]",
            isHebrew ? "font-hebrew text-hebrew-ink" : "font-greek text-greek-ink",
          )}
        >
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
                          ? "hover:bg-accent hover:text-foreground hover:underline hover:decoration-accent-scholar/30 hover:underline-offset-[6px]"
                          : "opacity-60",
                    isHebrew ? "text-hebrew-ink/90" : "text-greek-ink/90",
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
