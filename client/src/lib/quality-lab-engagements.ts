import { calculateVariancePercent, createQualityLabEngagementPacket, qualityLabEngagementPacketSchema, type QualityLabEngagementPacket } from "@shared/quality-lab-engagement";
import type { QualityLabProject } from "@shared/quality-lab";

const STORAGE_KEY = "lsa:quality-lab-engagements:v1";

function read(): QualityLabEngagementPacket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((value) => {
      const parsed = qualityLabEngagementPacketSchema.safeParse(value);
      return parsed.success ? [parsed.data] : [];
    });
  } catch { return []; }
}

function write(packets: QualityLabEngagementPacket[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(packets));
}

export function getOrCreateEngagement(project: QualityLabProject): QualityLabEngagementPacket {
  return read().find((packet) => packet.project.id === project.id) ?? createQualityLabEngagementPacket(project);
}

export function saveEngagement(packet: QualityLabEngagementPacket): QualityLabEngagementPacket {
  const parsed = qualityLabEngagementPacketSchema.parse(packet);
  write([parsed, ...read().filter((item) => item.project.id !== parsed.project.id)]);
  return parsed;
}

export function setEngagementActual(packet: QualityLabEngagementPacket, key: keyof QualityLabEngagementPacket["baseline"], actual: number | null) {
  const item = packet.baseline[key];
  return saveEngagement({ ...packet, baseline: { ...packet.baseline, [key]: { ...item, actual, variancePercent: actual === null ? null : calculateVariancePercent(item.estimate, actual) } } });
}

export function downloadEngagement(packet: QualityLabEngagementPacket) {
  const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${packet.project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "quality-lab"}-engagement-packet.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
