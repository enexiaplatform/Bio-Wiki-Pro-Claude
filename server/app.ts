import crypto from "crypto";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";

export const JSON_BODY_LIMIT = "2mb";
export const JSON_BODY_LIMIT_BYTES = 2 * 1024 * 1024;

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function requestId(req: Request): string {
  const forwarded = req.headers["x-vercel-id"] ?? req.headers["x-request-id"];
  const candidate = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim().slice(0, 160) : crypto.randomUUID();
}

function errorCode(error: any, status: number): string {
  if (status === 413 || error?.type === "entity.too.large") return "PAYLOAD_TOO_LARGE";
  if (status === 400 || error?.type === "entity.parse.failed") return "INVALID_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  return "INTERNAL_ERROR";
}

function withErrorEnvelope(body: unknown, status: number, requestId: string): unknown {
  if (status < 400 || !body || typeof body !== "object" || Array.isArray(body)) return body;
  const errorBody = body as Record<string, unknown>;
  if (typeof errorBody.message !== "string") return body;
  return {
    ...errorBody,
    code: typeof errorBody.code === "string" ? errorBody.code : errorCode(undefined, status),
    requestId: typeof errorBody.requestId === "string" ? errorBody.requestId : requestId,
  };
}

export function installRequestDiagnostics(app: Express, enabled = process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    const startedAt = Date.now();
    req.requestId = requestId(req);
    res.setHeader("X-Request-Id", req.requestId);
    const sendJson = res.json.bind(res);
    res.json = ((body: unknown) => sendJson(withErrorEnvelope(body, res.statusCode, req.requestId!))) as typeof res.json;
    res.on("finish", () => {
      if (!enabled || !req.path.startsWith("/api")) return;
      console.log(JSON.stringify({
        kind: "http_request",
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      }));
    });
    next();
  });
}

export function installBodyParsers(app: Express) {
  app.use(express.json({
    limit: JSON_BODY_LIMIT,
    verify: (req, _res, buffer) => {
      req.rawBody = buffer;
    },
  }));
  app.use(express.urlencoded({ extended: false, limit: JSON_BODY_LIMIT }));
}

export function installErrorHandler(app: Express) {
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    const status = error?.status || error?.statusCode || (error?.type === "entity.too.large" ? 413 : 500);
    const code = errorCode(error, status);
    const message = status === 413
      ? `Request body exceeds the ${JSON_BODY_LIMIT} limit.`
      : status >= 500
        ? "Internal Server Error"
        : error?.message || "Request failed";

    console.error("[server error]", {
      requestId: req.requestId ?? "unavailable",
      method: req.method,
      path: req.path,
      status,
      code,
      errorType: error instanceof Error ? error.name : "unknown-error",
    });

    if (res.headersSent) return next(error);
    return res.status(status).json({ message, code, requestId: req.requestId ?? "unavailable" });
  });
}

export type CreateAppOptions = {
  serveStaticFiles?: boolean;
  requestLogging?: boolean;
};

export async function createApiApp(options: CreateAppOptions = {}): Promise<Express> {
  const app = express();
  installRequestDiagnostics(app, options.requestLogging);
  installBodyParsers(app);
  await registerRoutes(app);
  if (options.serveStaticFiles) serveStatic(app);
  installErrorHandler(app);
  return app;
}
