import { useCallback, useEffect, useState } from "react";

const KEY = "lsa_free_reads";
const LEGACY_KEY = "bwp_free_reads";

function readStore(): string[] {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY) ?? "[]";
    const v = JSON.parse(raw);
    if (!localStorage.getItem(KEY) && localStorage.getItem(LEGACY_KEY)) {
      localStorage.setItem(KEY, raw);
      localStorage.removeItem(LEGACY_KEY);
    }
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/**
 * Tracks distinct free articles read (by slug) in localStorage — used to drive
 * the "you've read X free articles" upgrade nudge.
 */
export function useFreeReads() {
  const [reads, setReads] = useState<string[]>([]);

  useEffect(() => {
    setReads(readStore());
  }, []);

  const record = useCallback((slug: string) => {
    const cur = readStore();
    if (cur.includes(slug)) return;
    const next = [...cur, slug];
    localStorage.setItem(KEY, JSON.stringify(next));
    setReads(next);
  }, []);

  return { count: reads.length, record };
}
