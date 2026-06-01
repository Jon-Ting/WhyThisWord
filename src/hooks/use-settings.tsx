import { useEffect, useState, useCallback } from "react";

export type Settings = {
  aiSynthesisEnabled: boolean;
};

const STORAGE_KEY = "wtw:settings";
const EVENT = "wtw:settings:change";

const DEFAULT_SETTINGS: Settings = {
  aiSynthesisEnabled: true,
};

function read(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function write(settings: Settings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // ignore
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(read());
    const onChange = () => setSettings(read());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    const current = read();
    const next = { ...current, ...updates };
    console.log(`[Settings] Updating:`, updates, "→ new state:", next);
    write(next);
  }, []);

  return { ...settings, updateSettings };
}
