import { useEffect, useState } from "react";

// Lightweight learning streak (consecutive days with at least one lesson read).
// Local-only — a gentle retention nudge, no server needed.
const KEY = "lsa_streak";
const LEGACY_KEY = "bwp_streak";

interface Streak {
  last: string; // YYYY-MM-DD of the last active day
  current: number;
  longest: number;
}

function todayStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function read(): Streak {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY) ?? "{}";
    const v = JSON.parse(raw);
    if (!localStorage.getItem(KEY) && localStorage.getItem(LEGACY_KEY)) {
      localStorage.setItem(KEY, raw);
      localStorage.removeItem(LEGACY_KEY);
    }
    if (v && typeof v.current === "number") return v as Streak;
  } catch {
    /* ignore */
  }
  return { last: "", current: 0, longest: 0 };
}

/** Call when the user does a learning action (e.g. reads a lesson). Idempotent per day. */
export function recordStreakActivity(): void {
  try {
    const s = read();
    const today = todayStr();
    if (s.last === today) return; // already counted today
    const yesterday = todayStr(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const current = s.last === yesterday ? s.current + 1 : 1;
    const next: Streak = { last: today, current, longest: Math.max(current, s.longest || 0) };
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore privacy-mode errors */
  }
}

/** Current streak, accounting for a possible gap since the last active day. */
export function useStreak(): { current: number; longest: number } {
  const [streak, setStreak] = useState<{ current: number; longest: number }>({ current: 0, longest: 0 });
  useEffect(() => {
    const s = read();
    const today = todayStr();
    const yesterday = todayStr(new Date(Date.now() - 24 * 60 * 60 * 1000));
    // The stored `current` is only "live" if the last active day was today or
    // yesterday; otherwise the streak has lapsed back to 0.
    const live = s.last === today || s.last === yesterday ? s.current : 0;
    setStreak({ current: live, longest: s.longest || 0 });
  }, []);
  return streak;
}
