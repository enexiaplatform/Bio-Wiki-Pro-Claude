import express, { type NextFunction, type Request, type Response } from "express";
import { registerRoutes } from "../server/routes.js";
import { serveStatic } from "../server/static.js";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

let appPromise: Promise<express.Express> | null = null;

async function createApp() {
  const app = express();

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: false }));

  await registerRoutes(app);
  serveStatic(app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Surface in Vercel runtime logs for monitoring.
    console.error("[server error]", status, err?.stack || message);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  return app;
}

async function getApp() {
  if (!appPromise) {
    appPromise = createApp().catch((error) => {
      // A rejected promise stays rejected forever. Reset it so a transient
      // cold-start failure does not poison every later request handled by the
      // same warm serverless instance.
      appPromise = null;
      throw error;
    });
  }
  return appPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    const requestId = req.headers["x-vercel-id"] || req.headers["x-request-id"] || "unavailable";
    const requestUrl = req.originalUrl || req.url || "/";
    const requestPath = (() => {
      try {
        return new URL(requestUrl, "https://life-science-atlas.local").pathname;
      } catch {
        return "/";
      }
    })();

    console.error("[server startup failed]", {
      requestId,
      path: requestUrl,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (res.headersSent) return;

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Retry-After", "5");

    if (requestPath.startsWith("/api/")) {
      return res.status(503).json({
        message: "Service temporarily unavailable. Please retry in a few seconds.",
      });
    }

    return res.status(503).type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Life Science Atlas is restarting</title>
  </head>
  <body style="margin:0;background:#07111f;color:#e5edf7;font-family:Inter,system-ui,sans-serif">
    <main style="min-height:100vh;display:grid;place-items:center;padding:24px">
      <section style="width:min(560px,100%);border:1px solid #28415c;border-radius:16px;background:#0d1a2b;padding:32px;box-sizing:border-box">
        <p style="margin:0 0 12px;color:#5eead4;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Temporary interruption</p>
        <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2">Life Science Atlas is restarting</h1>
        <p style="margin:0;color:#a9b8ca;line-height:1.65">The service could not finish starting. Please refresh in a few seconds. Your browser and connection are working normally.</p>
      </section>
    </main>
  </body>
</html>`);
  }
}
