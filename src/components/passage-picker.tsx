import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, Clock } from "lucide-react";
import { useRecentPassages } from "@/hooks/use-recent-passages";
import { listPassages } from "@/lib/corpus";

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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { recent } = useRecentPassages();
  const [query, setQuery] = useState("");

  const all = useMemo(() => listPassages(), []);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return all
      .filter(
        (p) =>
          p.ref.toLowerCase().includes(q) ||
          (p.title?.toLowerCase().includes(q) ?? false) ||
          (p.description?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 8);
  }, [all, q]);

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find a passage, e.g. Romans 8"
            className="pl-9 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {q ? (
          <div className="mt-2 rounded-md border border-border bg-popover p-1 shadow-sm">
            {results.length === 0 ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                No matches in the current corpus.
              </p>
            ) : (
              results.map((p) => (
                <Link
                  key={p.id}
                  to={`/reader/${p.id}`}
                  onClick={() => setQuery("")}
                  className="block rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <span className="font-serif text-[14px] text-foreground">{p.ref}</span>
                  {p.title ? (
                    <span className="ml-2 text-xs text-muted-foreground/80">{p.title}</span>
                  ) : null}
                </Link>
              ))
            )}
          </div>
        ) : null}
      </div>

      <nav aria-label="Recent passages" className="space-y-1">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <Clock className="h-3 w-3" />
          Recent
        </p>

        {recent.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            No recent passages yet. Search above to open one.
          </p>
        ) : (
          recent.map((r) => {
            const to = `/reader/${r.id}`;
            const active = pathname === to;
            return (
              <Link
                key={r.id}
                to={to}
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
