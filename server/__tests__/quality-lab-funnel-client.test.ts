import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Use the real contract while resolving the client's Vite alias in the Node test runner.
vi.mock("@shared/quality-lab-funnel", () => import("../../shared/quality-lab-funnel"));

import { recordQualityLabFunnelEvent } from "../../client/src/lib/quality-lab-funnel";

const fetchMock = vi.fn<typeof fetch>();
const getItem = vi.fn(() => null);
const setItem = vi.fn();
const event = { stage: "planner_started", source: "quality_lab" } as const;

function response(status: number, body: unknown = { accepted: true, recorded: true }): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("Quality Lab funnel delivery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    getItem.mockClear();
    setItem.mockClear();
    vi.stubGlobal("window", { localStorage: { getItem, setItem } });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("retries transient failures with one immutable event and no stored delivery queue", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Network unavailable"))
      .mockResolvedValueOnce(response(503, { accepted: false, recorded: false }))
      .mockResolvedValueOnce(response(202));

    expect(recordQualityLabFunnelEvent(event)).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(2_999);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const bodies = fetchMock.mock.calls.map(([, options]) => options?.body);
    expect(new Set(bodies).size).toBe(1);
    expect(Object.keys(JSON.parse(bodies[0] as string)).sort()).toEqual(["eventId", "journeyId", "occurredAt", "source", "stage"]);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/quality-lab/funnel-events");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "include", keepalive: true });
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(setItem.mock.calls[0][1])).toEqual({ id: expect.any(String), lastSeenAt: expect.any(Number) });
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([429, 500, 503])("caps repeated HTTP %s failures at three attempts", async (status) => {
    fetchMock.mockImplementation(async () => response(status));
    recordQualityLabFunnelEvent(event);
    await vi.runAllTimersAsync();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([400, 401, 403, 404, 422])("does not retry permanent HTTP %s rejection", async (status) => {
    fetchMock.mockResolvedValue(response(status, { accepted: false, recorded: false }));
    recordQualityLabFunnelEvent(event);
    await vi.runAllTimersAsync();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([{ accepted: true, recorded: true }, { accepted: true, recorded: false }, { recorded: true }])(
    "stops on a successful acknowledgement %j",
    async (body) => {
      fetchMock.mockResolvedValue(response(202, body));
      recordQualityLabFunnelEvent(event);
      await vi.runAllTimersAsync();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it("retries a legacy unrecorded acknowledgement then accepts a duplicate", async () => {
    fetchMock.mockResolvedValueOnce(response(202, { recorded: false }))
      .mockResolvedValueOnce(response(202, { accepted: true, recorded: false }));
    recordQualityLabFunnelEvent(event);
    await vi.runAllTimersAsync();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("aborts stalled requests and exhausts its bounded retries", async () => {
    fetchMock.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    recordQualityLabFunnelEvent(event);
    await vi.advanceTimersByTimeAsync(4_999);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    await vi.runAllTimersAsync();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.every(([, options]) => options?.signal?.aborted)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not retry an unexpected successful response body", async () => {
    fetchMock.mockResolvedValue(new Response("invalid JSON", { status: 202 }));
    recordQualityLabFunnelEvent(event);
    await vi.runAllTimersAsync();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects fields outside the metadata contract before transmitting", async () => {
    recordQualityLabFunnelEvent({ ...event, project: { name: "synthetic private project" } } as typeof event);
    await vi.runAllTimersAsync();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("remains a no-op without a browser", () => {
    vi.stubGlobal("window", undefined);
    recordQualityLabFunnelEvent(event);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });
});
