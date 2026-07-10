"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "veildrop:preferred-mode";

export type Mode = "admin" | "recipient";

function isMode(value: string | null): value is Mode {
  return value === "admin" || value === "recipient";
}

/**
 * Remembers which side of the app a wallet last chose, so a returning
 * visitor's "Launch app" CTA can go straight there instead of asking again.
 * hasHydrated starts false and flips true once localStorage has actually
 * been read, so callers can avoid rendering the "first visit" branch for
 * one paint before the real value is known.
 */
export function useModePreference(): { mode: Mode | null; setMode: (mode: Mode) => void; hasHydrated: boolean } {
  const [mode, setModeState] = useState<Mode | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isMode(stored)) setModeState(stored);
    } catch {
      // Private browsing or storage disabled, fall back to in-memory only.
    } finally {
      setHasHydrated(true);
    }
  }, []);

  function setMode(next: Mode) {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal, preference just won't persist across reloads.
    }
  }

  return { mode, setMode, hasHydrated };
}
