import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import type { Verse, GreekToken } from "@/lib/corpus";
import { getPassage } from "@/lib/corpus";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PassagePicker } from "@/components/passage-picker";
import { VerseReader } from "@/components/verse-reader";
import { WordAnalysisPanel } from "@/components/word-analysis-panel";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useNavigate } from "@tanstack/react-router";
import { recordRecentPassage } from "@/hooks/use-recent-passages";

function useIsCompact() {
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setIsCompact(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isCompact;
}

const searchSchema = z.object({
  w: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/reader/$ref")({
  validateSearch: zodValidator(searchSchema),
  loader: async ({ params }) => {
    const passage = await getPassage(params.ref);
    if (!passage) throw notFound();
    return { passage };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.passage.ref} — Why This Word` },
          {
            name: "description",
            content: `${loaderData.passage.ref}: ${loaderData.passage.description}`,
          },
          { property: "og:title", content: `${loaderData.passage.ref} — Why This Word` },
          {
            property: "og:description",
            content: loaderData.passage.description,
          },
        ]
      : [{ title: "Reader — Why This Word" }],
  }),
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
  component: ReaderPage,
});

function ReaderPage() {
  const { passage } = Route.useLoaderData();
  const { w } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const isCompact = useIsCompact();

  useEffect(() => {
    recordRecentPassage({
      id: passage.id,
      ref: passage.ref,
      title: passage.title,
    });
  }, [passage.id, passage.ref, passage.title]);

  const selectedTokenAndVerse = useMemo(() => {
    if (!w) return null;
    for (const v of passage.verses as Verse[]) {
      const found = v.tokens.find((t: GreekToken) => t.id === w);
      if (found) return { token: found, verse: v };
    }
    return null;
  }, [w, passage]);

  const selectToken = (tokenId: string) => navigate({ search: { w: tokenId }, replace: true, resetScroll: false });
  const closePanel = () => navigate({ search: { w: undefined }, replace: true, resetScroll: false });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px lg:grid-cols-[14rem_minmax(0,1fr)_24rem]">
        <aside className="hidden border-r border-border/70 px-6 py-8 lg:block">
          <PassagePicker />
        </aside>

        <main className="min-w-0 px-6 py-10 md:px-10">
          <div className="lg:hidden">
            <PassagePicker />
            <div className="my-6 h-px bg-border" />
          </div>

          <header className="mb-10">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {passage.title}
            </p>
            <h1 className="mt-2 font-serif text-3xl tracking-tight text-foreground md:text-4xl">
              {passage.ref}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {passage.description}
            </p>
          </header>

          <div className="space-y-14">
            {(passage.verses as Verse[]).map((verse) => (
              <VerseReader
                key={verse.ref}
                verse={verse}
                selectedTokenId={w ?? null}
                onSelectToken={selectToken}
              />
            ))}
          </div>
        </main>

        <aside className="hidden border-l border-border/70 lg:block">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
            <WordAnalysisPanel
              token={selectedTokenAndVerse?.token ?? null}
              verse={selectedTokenAndVerse?.verse ?? null}
              onClose={closePanel}
            />
          </div>
        </aside>
      </div>

      {/* Mobile/tablet sheet — only mount on compact viewports so the
          overlay doesn't cover the desktop right-column panel. */}
      {isCompact ? (
        <Sheet
          open={!!selectedTokenAndVerse}
          onOpenChange={(open) => {
            if (!open) closePanel();
          }}
        >
          <SheetContent side="right" className="w-full max-w-md p-0">
            <VisuallyHidden.Root>
              <SheetTitle>Word analysis</SheetTitle>
              <SheetDescription>
                Lexical and contrastive notes for the selected Greek word.
              </SheetDescription>
            </VisuallyHidden.Root>
            <WordAnalysisPanel
              token={selectedTokenAndVerse?.token ?? null}
              verse={selectedTokenAndVerse?.verse ?? null}
              onClose={closePanel}
            />
          </SheetContent>
        </Sheet>
      ) : null}


      <SiteFooter />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">Passage not found</h1>
        <p className="mt-3 text-muted-foreground">
          That reference isn't in the prototype dataset yet.
        </p>
        <Link
          to="/reader/john-1"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to John 1:1
        </Link>
      </div>
    </div>
  );
}

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-serif text-2xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          An unexpected error occurred while loading this passage. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
