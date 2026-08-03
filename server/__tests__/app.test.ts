import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { installBodyParsers, installErrorHandler, installRequestDiagnostics, JSON_BODY_LIMIT_BYTES } from "../app.js";
import { setupSession } from "../routes.js";

function buildParserApp() {
  const app = express();
  installRequestDiagnostics(app, false);
  installBodyParsers(app);
  app.post("/api/echo", (req, res) => res.json({ length: String(req.body.data ?? "").length }));
  installErrorHandler(app);
  return app;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("shared Express runtime", () => {
  it("accepts a valid JSON payload larger than the former Vercel limit", async () => {
    const response = await request(buildParserApp())
      .post("/api/echo")
      .set("x-request-id", "request-over-100k")
      .send({ data: "a".repeat(128 * 1024) });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(128 * 1024);
    expect(response.headers["x-request-id"]).toBe("request-over-100k");
  });

  it("returns a stable 413 envelope above the two-megabyte limit", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await request(buildParserApp())
      .post("/api/echo")
      .set("x-request-id", "request-over-2mb")
      .send({ data: "a".repeat(JSON_BODY_LIMIT_BYTES + 1) });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      message: "Request body exceeds the 2mb limit.",
      code: "PAYLOAD_TOO_LARGE",
      requestId: "request-over-2mb",
    });
  });

  it("adds code and requestId to route-level API errors", async () => {
    const app = express();
    installRequestDiagnostics(app, false);
    app.get("/api/private", (_req, res) => res.status(401).json({ message: "Unauthorized" }));

    const response = await request(app).get("/api/private").set("x-request-id", "request-auth");
    expect(response.body).toEqual({ message: "Unauthorized", code: "UNAUTHORIZED", requestId: "request-auth" });
  });

  it("does not turn a degraded health document into an error envelope", async () => {
    const app = express();
    installRequestDiagnostics(app, false);
    app.get("/api/health", (_req, res) => res.status(503).json({ status: "degraded", readiness: { schema: false } }));

    const response = await request(app).get("/api/health");
    expect(response.body).toEqual({ status: "degraded", readiness: { schema: false } });
  });

  it("logs request metadata without logging response content", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const app = express();
    installRequestDiagnostics(app, true);
    app.get("/api/private", (_req, res) => res.json({ secret: "blueprint-private-content" }));

    await request(app).get("/api/private").expect(200);
    const output = JSON.stringify(log.mock.calls);
    expect(output).toContain("http_request");
    expect(output).toContain("/api/private");
    expect(output).not.toContain("blueprint-private-content");
  });

  it("fails closed in production when the session secret is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "");
    expect(() => setupSession(express())).toThrow(/SESSION_SECRET/);
  });

  it("marks the seven-day production cookie secure", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "a-production-session-secret-longer-than-32-chars");
    const app = express();
    setupSession(app);
    app.get("/touch-session", (req: any, res) => {
      req.session.userId = "user-1";
      res.json({ ok: true });
    });

    const response = await request(app).get("/touch-session").set("x-forwarded-proto", "https");
    const cookie = response.headers["set-cookie"]?.[0];
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
  });
});
