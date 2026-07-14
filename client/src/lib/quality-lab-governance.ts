import { qualityLabGovernanceSnapshotSchema, type QualityLabGovernanceKey, type QualityLabGovernanceSnapshot } from "@shared/quality-lab-governance";

export async function saveAccountGovernanceRecord(recordKey: QualityLabGovernanceKey, snapshot: QualityLabGovernanceSnapshot) {
  const response = await fetch(`/api/quality-lab/governance/${recordKey}`, { method: "PUT", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(snapshot) });
  if (!response.ok) throw new Error("Unable to save this governance working record to the account");
  return response.json() as Promise<{ recordKey: string; updatedAt: string }>;
}

export async function fetchAccountGovernanceRecord(recordKey: QualityLabGovernanceKey) {
  const response = await fetch(`/api/quality-lab/governance/${recordKey}`, { credentials: "include" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Unable to load this governance working record from the account");
  const parsed = qualityLabGovernanceSnapshotSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("The account governance record is invalid");
  return parsed.data;
}
