import { useEffect, useState, useCallback } from "react";

export type RecentPassage = {
  id: string;
  ref: string;
  title?: string;
  visitedAt: number;
};

const STORAGE_KEY = "wtw:recent-passages";
const MAX_RECENT = 8;
const EVENT = "wtw:recent-passages:change";

function read(): RecentPassage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: RecentPassage[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // ignore
  }
}

export function useRecentPassages() {
  const [recent, setRecent] = useState<RecentPassage[]>([]);

  useEffect(() => {
    setRecent(read());
    const onChange = () => setRecent(read());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const clear = useCallback(() => write([]), []);

  return { recent, clear };
}

export function recordRecentPassage(entry: Omit<RecentPassage, "visitedAt">) {
  if (typeof window === "undefined") return;
  const current = read().filter((p) => p.id !== entry.id);
  const next = [{ ...entry, visitedAt: Date.now() }, ...current].slice(0, MAX_RECENT);
  write(next);
}
