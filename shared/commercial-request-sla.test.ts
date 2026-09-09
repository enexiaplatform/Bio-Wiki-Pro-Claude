import { describe, expect, it } from "vitest";
import {
  assessCommercialRequestSla,
  buildCommercialRequestSlaQueue,
  commercialResponseDeadline,
} from "./commercial-request-sla.js";

describe("commercial request response control", () => {
  it("adds two UTC business days and skips the weekend", () => {
    expect(commercialResponseDeadline("2026-09-04T10:00:00.000Z")?.toISOString()).toBe("2026-09-08T10:00:00.000Z");
  });

  it("separates overdue, due-soon and progressed requests", () => {
    expect(assessCommercialRequestSla({ status: "new", createdAt: "2026-09-01T10:00:00.000Z" }, "2026-09-04T10:00:00.000Z").state).toBe("overdue");
    expect(assessCommercialRequestSla({ status: "new", createdAt: "2026-09-02T10:00:00.000Z" }, "2026-09-04T09:00:00.000Z").state).toBe("due-soon");
    expect(assessCommercialRequestSla({ status: "qualified", createdAt: "2026-09-01T10:00:00.000Z" }, "2026-09-10T10:00:00.000Z").state).toBe("progressed");
  });

  it("sorts urgent new requests first and reports missing controls", () => {
    const queue = buildCommercialRequestSlaQueue([
      { id: 3, status: "qualified", owner: "Founder", nextAction: "Send proposal", createdAt: "2026-09-01T10:00:00.000Z" },
      { id: 2, status: "new", owner: "Founder", nextAction: "Confirm fit", createdAt: "2026-09-03T10:00:00.000Z" },
      { id: 1, status: "new", owner: null, nextAction: null, createdAt: "2026-09-01T10:00:00.000Z" },
    ], "2026-09-04T10:00:00.000Z");

    expect(queue.items.map(({ request }) => request.id)).toEqual([1, 2, 3]);
    expect(queue.metrics).toEqual({ newRequests: 2, overdue: 1, dueSoon: 0, unowned: 1, missingNextAction: 1 });
  });

  it("fails visibly when the creation timestamp is unavailable", () => {
    expect(assessCommercialRequestSla({ status: "new", createdAt: null })).toMatchObject({ state: "unknown", deadline: null });
  });
});
