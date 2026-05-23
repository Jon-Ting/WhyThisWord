import { Link, useRouterState } from "@tanstack/react-router";
import { listPassages } from "@/lib/corpus";
import { cn } from "@/lib/utils";

export function PassagePicker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
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
  );
}
