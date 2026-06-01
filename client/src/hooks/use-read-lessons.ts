import { useCallback, useEffect, useState } from "react";

const KEY = "bwp_read_lessons";

function readStore(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/**
 * Tracks which Academy lessons the user has opened (by slug), in localStorage.
 * Drives the reading-progress indicator and "read" checkmarks.
 */
export function useReadLessons() {
  const [read, setRead] = useState<string[]>([]);

  useEffect(() => {
    setRead(readStore());
  }, []);

  const markRead = useCallback((slug: string) => {
    const cur = readStore();
    if (cur.includes(slug)) return;
    const next = [...cur, slug];
    localStorage.setItem(KEY, JSON.stringify(next));
    setRead(next);
  }, []);

  const isRead = useCallback((slug: string) => read.includes(slug), [read]);

  return { read, count: read.length, markRead, isRead };
}
