import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useRecentPassages } from "@/hooks/use-recent-passages";
import { BcvSelector } from "./bcv-selector";
import { parsePassageRef } from "@/lib/corpus";
import booksIndex from "@/lib/corpus/data/books.json";

interface BookMetadata {
  id: string;
  name: string;
}

function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function PassagePicker() {
  const location = useRouterState({ select: (s) => s.location });
  const navigate = useNavigate();
  const { recent } = useRecentPassages();

  const handleGo = (targetUrl: string) => {
    const currentRef = location.pathname.replace("/reader/", "");
    const targetRef = targetUrl.replace("/reader/", "");

    const currentParsed = parsePassageRef(currentRef);
    const targetParsed = parsePassageRef(targetRef);

    if (
      currentParsed &&
      targetParsed &&
      currentParsed.bookId === targetParsed.bookId &&
      currentParsed.startChapter === targetParsed.startChapter &&
      !targetParsed.endChapter
    ) {
      // Same chapter target — scroll instead of navigating
      const book = (booksIndex as BookMetadata[]).find((b) => b.id === targetParsed.bookId);
      if (book && targetParsed.startVerse) {
        const verseRef = `${book.name} ${targetParsed.startChapter}:${targetParsed.startVerse}`;
        const el = document.getElementById(verseRef);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      // No specific verse or element not found — scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Different chapter or cross-chapter — navigate normally
    navigate({ to: targetUrl as never });
  };

  return (
    <div>
      <div className="my-6">
        <BcvSelector onGo={handleGo} />
      </div>

      <nav aria-label="Recent passages" className="space-y-1">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <Clock className="h-3 w-3" />
          Recent
        </p>

        {recent.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            No recent passages yet. Use the selector above to open one.
          </p>
        ) : (
          recent.map((r) => {
            const to = `/reader/${r.id}`;
            const locSearch = location.search as { start?: number; end?: number };
            const active =
              location.pathname === to &&
              ((r.start === undefined && locSearch.start === undefined) ||
                (r.start !== undefined && locSearch.start === r.start && locSearch.end === r.end));
            const search = r.start !== undefined ? { start: r.start, end: r.end } : undefined;
            return (
              <Link
                key={`${r.id}-${r.start ?? "full"}-${r.end ?? "full"}-${r.visitedAt}`}
                to={to}
                search={search}
                className={cn(
                  "block rounded-md border border-transparent px-3 py-2 text-sm transition-colors",
                  active
                    ? "border-border bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-serif text-[15px]">{r.ref}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    {formatRelative(r.visitedAt)}
                  </span>
                </span>
                {r.title ? (
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground/80">
                    {r.title}
                  </span>
                ) : null}
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );
}
