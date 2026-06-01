import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import type { Verse, CorpusToken } from "@/lib/corpus";
import {
  getPassage,
  getAdjacentChapters,
  parsePassageRef,
  PassageRangeTooLargeError,
} from "@/lib/corpus";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PassagePicker } from "@/components/passage-picker";
import { VerseReader } from "@/components/verse-reader";
import { WordAnalysisPanel } from "@/components/word-analysis-panel";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useNavigate } from "@tanstack/react-router";
import { recordRecentPassage } from "@/hooks/use-recent-passages";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  PanelLeftClose,
  PanelRightClose,
  PanelLeftOpen,
  PanelRightOpen,
} from "lucide-react";

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
  start: z.coerce.number().int().positive().optional().catch(undefined),
  end: z.coerce.number().int().positive().optional().catch(undefined),
});

function parseRangeFromSearch(
  search: { start?: number; end?: number } | undefined,
  searchStr: string,
): { start?: number; end?: number } {
  const start = search?.start;
  if (typeof start === "number") return { start, end: search?.end };
  if (!searchStr) return {};
  const sp = new URLSearchParams(searchStr);
  const rawStart = sp.get("start");
  const rawEnd = sp.get("end");
  return {
    start: rawStart ? parseInt(rawStart, 10) || undefined : undefined,
    end: rawEnd ? parseInt(rawEnd, 10) || undefined : undefined,
  };
}

export const Route = createFileRoute("/reader/$ref")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ start: search?.start, end: search?.end }),
  loader: async ({ params, deps }) => {
    const passage = await getPassage(params.ref, {
      startVerse: deps.start,
      endVerse: deps.end,
    });
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
  const search = Route.useSearch();
  const { w } = search;
  const { start, end } = Route.useLoaderDeps();
  const navigate = useNavigate({ from: Route.fullPath });
  const isCompact = useIsCompact();

  const [leftOpen, setLeftOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return JSON.parse(localStorage.getItem("reader.leftOpen") ?? "true");
    } catch {
      return true;
    }
  });
  const [rightOpen, setRightOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return JSON.parse(localStorage.getItem("reader.rightOpen") ?? "false");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("reader.rightOpen", JSON.stringify(rightOpen));
    } catch {
      /* ignore */
    }
  }, [rightOpen]);

  useEffect(() => {
    try {
      localStorage.setItem("reader.leftOpen", JSON.stringify(leftOpen));
    } catch {
      /* ignore */
    }
  }, [leftOpen]);

  // Auto-open the analysis panel when a word is selected
  useEffect(() => {
    if (w) setRightOpen(true);
  }, [w]);

  useEffect(() => {
    recordRecentPassage({
      id: passage.id,
      ref: passage.ref,
      title: passage.title,
      start,
      end,
    });
  }, [passage.id, passage.ref, passage.title, start, end]);

  // Auto-scroll to the first verse of a range when the page loads
  useEffect(() => {
    if (!start) return;
    const target = passage.verses.find((v) => {
      const numMatch = v.ref.match(/:(\d+)$/);
      return numMatch && parseInt(numMatch[1], 10) === start;
    });
    if (target) {
      const el = document.getElementById(target.ref);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, passage.id]);

  const [selectedWordId, setSelectedWordId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("reader.selectedWordId");
  });

  useEffect(() => {
    if (w) {
      setSelectedWordId(w);
      localStorage.setItem("reader.selectedWordId", w);
    }
    // Removed the 'else' block that did nothing,
    // ensuring we don't clear it on navigation.
  }, [w]);

  const selectedTokenAndVerse = useMemo(() => {
    const tokenId = w ?? selectedWordId;
    if (!tokenId) return null;
    for (const v of passage.verses as Verse[]) {
      const found = v.tokens.find((t: CorpusToken) => t.id === tokenId);
      if (found) return { token: found, verse: v };
    }
    return null;
  }, [w, selectedWordId, passage]);

  const adjacent = useMemo(() => getAdjacentChapters(passage.id), [passage.id]);
  const parsedRef = useMemo(() => parsePassageRef(passage.id), [passage.id]);
  const isPartial = parsedRef
    ? parsedRef.startVerse !== undefined || parsedRef.endChapter !== undefined
    : start !== undefined || end !== undefined;
  const fullChapterId =
    parsedRef?.startVerse !== undefined
      ? `${parsedRef.bookId}-${parsedRef.startChapter}`
      : passage.id;

  const selectToken = (tokenId: string) =>
    navigate({ search: { ...search, w: tokenId }, replace: true, resetScroll: false });
  const closePanel = () => {
    setSelectedWordId(null);
    localStorage.removeItem("reader.selectedWordId");
    navigate({ search: { ...search, w: undefined }, replace: true, resetScroll: false });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div
        className={cn(
          "mx-auto grid max-w-7xl grid-cols-1 gap-px",
          leftOpen && rightOpen && "lg:grid-cols-[18rem_minmax(0,1fr)_24rem]",
          leftOpen && !rightOpen && "lg:grid-cols-[18rem_minmax(0,1fr)]",
          !leftOpen && rightOpen && "lg:grid-cols-[minmax(0,1fr)_24rem]",
          !leftOpen && !rightOpen && "lg:grid-cols-[1fr]",
        )}
      >
        {leftOpen && (
          <aside className="hidden border-r border-border/70 lg:block">
            <div className="relative sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-6 py-8">
              <button
                type="button"
                onClick={() => setLeftOpen(false)}
                aria-label="Collapse passage picker"
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
              <PassagePicker />
            </div>
          </aside>
        )}

        <main className="min-w-0 px-6 py-10 md:px-10">
          <div className="lg:hidden">
            <PassagePicker />
            <div className="my-6 h-px bg-border" />
          </div>

          {(!leftOpen || !rightOpen) && (
            <div className="mb-4 hidden items-center gap-2 lg:flex">
              {!leftOpen && (
                <button
                  type="button"
                  onClick={() => setLeftOpen(true)}
                  aria-label="Show passage picker"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <PanelLeftOpen className="h-3.5 w-3.5" />
                  Passages
                </button>
              )}
              {!rightOpen && (
                <button
                  type="button"
                  onClick={() => setRightOpen(true)}
                  aria-label="Show word analysis"
                  className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Analysis
                  <PanelRightOpen className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <header className="mb-6">
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

          {/* Chapter navigation */}
          <div className="mb-10 flex flex-wrap items-center gap-2">
            {adjacent.prev ? (
              <Link
                to={`/reader/${adjacent.prev.id}`}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <ChevronLeft className="h-4 w-4" />
                {adjacent.prev.ref}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </span>
            )}

            {isPartial ? (
              <Link
                to={`/reader/${fullChapterId}`}
                search={w ? { w } : undefined}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <BookOpen className="h-4 w-4" />
                Read full chapter
              </Link>
            ) : null}

            {adjacent.next ? (
              <Link
                to={`/reader/${adjacent.next.id}`}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                {adjacent.next.ref}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-muted-foreground"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>

          <div className="space-y-14">
            {(passage.verses as Verse[]).map((verse) => (
              <div key={verse.ref} id={verse.ref} className="scroll-mt-20">
                <VerseReader
                  verse={verse}
                  selectedTokenId={w ?? null}
                  onSelectToken={selectToken}
                />
              </div>
            ))}
          </div>

          {/* Bottom chapter navigation */}
          <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-border pt-8">
            {adjacent.prev ? (
              <Link
                to={`/reader/${adjacent.prev.id}`}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <ChevronLeft className="h-4 w-4" />
                {adjacent.prev.ref}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </span>
            )}

            {isPartial ? (
              <Link
                to={`/reader/${fullChapterId}`}
                search={w ? { w } : undefined}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <BookOpen className="h-4 w-4" />
                Read full chapter
              </Link>
            ) : null}

            {adjacent.next ? (
              <Link
                to={`/reader/${adjacent.next.id}`}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                {adjacent.next.ref}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-muted-foreground"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </main>

        {rightOpen && (
          <aside className="hidden border-l border-border/70 lg:block">
            <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
              <WordAnalysisPanel
                token={selectedTokenAndVerse?.token ?? null}
                verse={selectedTokenAndVerse?.verse ?? null}
                onClose={closePanel}
                onCollapse={() => setRightOpen(false)}
              />
            </div>
          </aside>
        )}
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
          That reference isn't in the prototype dataset yet, or the URL format is unrecognised.
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
  const isRangeTooLarge = error.name === "PassageRangeTooLargeError";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-serif text-2xl">
          {isRangeTooLarge ? "Passage range too large" : "Something went wrong"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {isRangeTooLarge
            ? error.message
            : "An unexpected error occurred while loading this passage. Please try again."}
        </p>
        {isRangeTooLarge ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex h-10 items-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Go home
            </Link>
            <Link
              to={`/reader/${(error as unknown as PassageRangeTooLargeError).bookId}-${(error as unknown as PassageRangeTooLargeError).startChapter}`}
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Read start chapter
            </Link>
          </div>
        ) : (
          <button
            onClick={() => reset()}
            className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
