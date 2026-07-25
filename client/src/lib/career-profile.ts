import { CAREER_PROFILE_STORAGE_KEY, careerProfileSchema, type CareerProfile } from "@shared/career-blueprint";

export function cacheCareerProfile(profile: CareerProfile): CareerProfile {
  const parsed = careerProfileSchema.parse(profile);
  window.localStorage.setItem(CAREER_PROFILE_STORAGE_KEY, JSON.stringify(parsed));
  return parsed;
}

// Fire-and-forget account copy of the assessment profile. Failure (offline,
// pre-migration table, logged-out race) must never disturb the local flow.
export async function syncCareerProfileToServer(profile: CareerProfile): Promise<void> {
  try {
    await fetch("/api/career-blueprint/profile", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
  } catch {
    // Browser-local copy remains the source of truth.
  }
}

// Restore path for an entitled buyer on a new device. Returns null when the
// user is not entitled (403), sync is unavailable, or nothing is stored.
export async function fetchServerCareerProfile(): Promise<CareerProfile | null> {
  try {
    const response = await fetch("/api/career-blueprint/profile", { credentials: "include" });
    if (!response.ok) return null;
    const data = await response.json();
    const parsed = careerProfileSchema.safeParse(data.profile);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
