import type { Express } from "express";
<<<<<<< HEAD
=======
import type { Server } from "http";
>>>>>>> 89c929b6a5e8182e473f67314c438ca8b03d597f
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";

<<<<<<< HEAD
export async function registerRoutes(app: Express): Promise<void> {
  const hasReplitAuthConfig = Boolean(
    process.env.REPL_ID && process.env.SESSION_SECRET,
  );

  if (hasReplitAuthConfig) {
    await setupAuth(app);
    registerAuthRoutes(app);
  } else {
    app.get(api.users.me.path, (_req, res) => {
      res.status(401).json({ message: "Unauthorized" });
    });
  }
=======
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  await setupAuth(app);
  registerAuthRoutes(app);
>>>>>>> 89c929b6a5e8182e473f67314c438ca8b03d597f

  app.post(api.quoteRequests.create.path, async (req, res) => {
    try {
      const input = api.quoteRequests.create.input.parse(req.body);
      const quote = await storage.createQuoteRequest(input);
      res.status(201).json(quote);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
<<<<<<< HEAD
          field: err.errors[0].path.join("."),
=======
          field: err.errors[0].path.join('.'),
>>>>>>> 89c929b6a5e8182e473f67314c438ca8b03d597f
        });
      }
      throw err;
    }
  });

<<<<<<< HEAD
  if (hasReplitAuthConfig) {
    app.post(api.users.togglePro.path, isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const currentUser = await storage.getUser(userId);
        if (!currentUser) {
          return res.status(404).json({ message: "User not found" });
        }
        const updatedUser = await storage.updateUserPro(userId, !currentUser.isPro);
        res.json(updatedUser);
      } catch (_err) {
        res.status(500).json({ message: "Failed to update user" });
      }
    });
  } else {
    app.post(api.users.togglePro.path, (_req, res) => {
      res.status(401).json({ message: "Unauthorized" });
    });
  }
=======
  app.post(api.users.togglePro.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUserPro(userId, !currentUser.isPro);
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  return httpServer;
>>>>>>> 89c929b6a5e8182e473f67314c438ca8b03d597f
}
