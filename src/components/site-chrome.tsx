import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import logoIcon from "../../assets/logos/icon-square-light.png";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // ignore
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navItem = (to: string, label: string) => (
    <Link
      to={to}
      className={
        "text-sm transition-colors " +
        (pathname === to || (to !== "/" && pathname.startsWith(to))
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoIcon} alt="Why This Word logo" className="h-6 w-6 object-contain" />
          <span className="font-serif text-lg leading-none tracking-tight">Why This Word</span>
        </Link>
        <nav className="flex items-center gap-6">
          {navItem("/", "Home")}
          {navItem("/reader/john-1", "Reader")}
          {navItem("/about", "About")}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-10 text-xs text-muted-foreground">
        <p className="font-serif italic">
          A study companion for contrastive semantics in the biblical text. Mock dataset; prototype.
        </p>
      </div>
    </footer>
  );
}
