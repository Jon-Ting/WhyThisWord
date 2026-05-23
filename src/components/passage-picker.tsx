import { Link, useRouterState } from "@tanstack/react-router";
import { listPassages } from "@/lib/corpus";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function PassagePicker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div>
      <div className="mb-4">
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
      <nav aria-label="Passages" className="space-y-1">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Passages
        </p>
        {listPassages().map((p) => {
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
              <span className="font-serif text-[15px]">{p.ref}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground/80">
                {p.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
