import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import type { Verse, GreekToken } from "@/lib/corpus";
import { getPassage } from "@/lib/corpus";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PassagePicker } from "@/components/passage-picker";
import { VerseReader } from "@/components/verse-reader";
import { WordAnalysisPanel } from "@/components/word-analysis-panel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavigate } from "@tanstack/react-router";

const searchSchema = z.object({
  w: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/reader/$ref")({
  validateSearch: zodValidator(searchSchema),
  loader: ({ params }) => {
    const passage = getPassage(params.ref);
    if (!passage) throw notFound();
    return { passage };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.passage.ref} — Logos Nuance` },
          {
            name: "description",
            content: `${loaderData.passage.ref}: ${loaderData.passage.description}`,
          },
          { property: "og:title", content: `${loaderData.passage.ref} — Logos Nuance` },
          {
            property: "og:description",
            content: loaderData.passage.description,
          },
        ]
      : [{ title: "Reader — Logos Nuance" }],
  }),
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
  component: ReaderPage,
});

function ReaderPage() {
  const { passage } = Route.useLoaderData();
  const { w } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const selectedToken: GreekToken | null = useMemo(() => {
    if (!w) return null;
    for (const v of passage.verses as Verse[]) {
      const found = v.tokens.find((t: GreekToken) => t.id === w);
      if (found) return found;
    }
    return null;
  }, [w, passage]);

  const selectToken = (tokenId: string) =>
    navigate({ search: { w: tokenId }, replace: true });
  const closePanel = () => navigate({ search: { w: undefined }, replace: true });

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
            <WordAnalysisPanel token={selectedToken} onClose={closePanel} />
          </div>
        </aside>
      </div>

      {/* Mobile/tablet sheet */}
      <Sheet
        open={!!selectedToken}
        onOpenChange={(open) => {
          if (!open) closePanel();
        }}
      >
        <SheetContent
          side="right"
          className="w-full max-w-md p-0 lg:hidden"
        >
          <WordAnalysisPanel token={selectedToken} onClose={closePanel} />
        </SheetContent>
      </Sheet>

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
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-serif text-2xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
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
