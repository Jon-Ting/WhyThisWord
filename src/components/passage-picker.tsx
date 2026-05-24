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

  const all = listPassages();
  const recentIds = new Set(recent.map((r) => r.id));

  type Entry = {
    id: string;
    ref: string;
    title?: string;
    visitedAt?: number;
  };

  const entries: Entry[] = [
    ...recent.map((r) => ({
      id: r.id,
      ref: r.ref,
      title: r.title,
      visitedAt: r.visitedAt,
    })),
    ...all
      .filter((p) => !recentIds.has(p.id))
      .map((p) => ({ id: p.id, ref: p.ref, title: p.title })),
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="e.g. Romans 8:28"
            className="pl-9 text-sm"
            disabled
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground/70">
          Search coming soon
        </p>
      </div>

      <nav aria-label="Recent passages" className="space-y-1">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <Clock className="h-3 w-3" />
          Recent
        </p>

        {entries.map((p) => {
          const to = `/reader/${p.id}`;
          const active = pathname === to;
          return (
            <Link
              key={p.id}
              to={to}
              className={cn(
                "block rounded-md border border-transparent px-3 py-2 text-sm transition-colors",
                active
                  ? "border-border bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-serif text-[15px]">{p.ref}</span>
                {p.visitedAt ? (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    {formatRelative(p.visitedAt)}
                  </span>
                ) : null}
              </span>
              {p.title ? (
                <span className="mt-0.5 block truncate text-xs text-muted-foreground/80">
                  {p.title}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
