import { useCallback, useEffect, useState } from "react";

const KEY = "bwp_free_reads";

function readStore(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
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
