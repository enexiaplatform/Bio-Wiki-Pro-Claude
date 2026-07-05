import { useCallback, useEffect, useRef, useState } from "react";
import { analytics } from "@/hooks/use-analytics";
import { recordStreakActivity } from "@/hooks/use-streak";

const KEY = "lsa_read_lessons";
const LEGACY_KEY = "bwp_read_lessons";
const ACTIVATED_KEY = "lsa_activated";
const LEGACY_ACTIVATED_KEY = "bwp_activated";

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

function writeStore(slugs: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

/**
 * Tracks which Academy lessons the user has opened (by slug).
 *
 * - Guests: localStorage only (unchanged behavior).
 * - Logged-in users: synced with the server (`/api/progress/reads`) so progress
 *   follows them across devices. On mount we merge local + server, push any
 *   local-only reads up, and use the union. Everything degrades gracefully —
 *   a 401 (guest) or a missing table (pre-migration) just falls back to local.
 */
export function useReadLessons() {
  const [read, setRead] = useState<string[]>([]);
  const authedRef = useRef(false);

  useEffect(() => {
    const local = readStore();
    setRead(local);

    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/progress/reads", { credentials: "include" });
        if (!res.ok) return; // guest (401) or error → local only
        const data = await res.json().catch(() => ({}));
        const serverReads: string[] = Array.isArray(data.reads) ? data.reads : [];
        authedRef.current = true;

        const localNow = readStore();
        const union = Array.from(new Set([...localNow, ...serverReads]));
        if (active) {
          writeStore(union);
          setRead(union);
        }

        // Push any local-only reads up so the server catches up (e.g. lessons
        // read as a guest before signing in).
        const serverSet = new Set(serverReads);
        for (const slug of localNow) {
          if (!serverSet.has(slug)) {
            fetch("/api/progress/reads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ slug }),
            }).catch(() => {});
          }
        }
      } catch {
        /* offline / not logged in → local only */
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const markRead = useCallback((slug: string) => {
    recordStreakActivity(); // any lesson view counts toward today's streak
    const cur = readStore();
    if (!cur.includes(slug)) {
      const next = [...cur, slug];
      writeStore(next);
      setRead(next);
      // Activation: first lesson ever opened. Fire once (guarded across reloads).
      try {
        const legacyActivated = localStorage.getItem(LEGACY_ACTIVATED_KEY);
        if (legacyActivated && !localStorage.getItem(ACTIVATED_KEY)) {
          localStorage.setItem(ACTIVATED_KEY, legacyActivated);
          localStorage.removeItem(LEGACY_ACTIVATED_KEY);
        }
        if (!localStorage.getItem(ACTIVATED_KEY)) {
          localStorage.setItem(ACTIVATED_KEY, "1");
          analytics.activated(slug);
        }
      } catch {
        /* ignore privacy-mode errors */
      }
    }
    // Persist to the server for logged-in users (skipped for guests).
    if (authedRef.current) {
      fetch("/api/progress/reads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug }),
      }).catch(() => {});
    }
  }, []);

  const isRead = useCallback((slug: string) => read.includes(slug), [read]);

  return { read, count: read.length, markRead, isRead };
}
