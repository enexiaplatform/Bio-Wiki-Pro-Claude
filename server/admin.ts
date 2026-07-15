import type { Express, RequestHandler } from "express";
import { access } from "fs/promises";
import path from "path";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { users, purchases } from "../shared/models/auth.js";
import { contentEntries, leads, qualityLabReviewedProjects, quoteRequests } from "../shared/schema.js";
import { db } from "./db.js";
import { DELIVERABLES } from "./deliverables.js";
import { storage } from "./storage.js";

function configuredAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && configuredAdminEmails().has(email.trim().toLowerCase());
}

const contentUpdateSchema = z.object({
  tier: z.enum(["free", "pro", "paid"]).optional(),
  published: z.boolean().optional(),
  sort: z.number().int().min(-10_000).max(10_000).optional(),
}).refine((value) => Object.keys(value).length > 0, "No changes supplied");

const userAccessSchema = z.object({ isPro: z.boolean() });

export function registerAdminRoutes(app: Express, isAuthenticated: RequestHandler) {
  const requireAdmin: RequestHandler = async (req: any, res, next) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || !isAdminEmail(user.email)) return res.status(403).json({ message: "Admin access required" });
      next();
    } catch (error) {
      console.error("[Admin] authorization error:", error);
      return res.status(503).json({ message: "Admin service unavailable" });
    }
  };

  const adminOnly = [isAuthenticated, requireAdmin] as const;

  app.get("/api/admin/overview", ...adminOnly, async (_req, res) => {
    try {
      const [userTotals, leadTotals, requestTotals, purchaseTotals, projectTotals, contentTotals] = await Promise.all([
        db.select({ total: sql<number>`count(*)::int`, pro: sql<number>`count(*) filter (where ${users.isPro} = true)::int`, verified: sql<number>`count(*) filter (where ${users.verifiedEmail} = true)::int` }).from(users),
        db.select({ total: sql<number>`count(*)::int` }).from(leads),
        db.select({ total: sql<number>`count(*)::int` }).from(quoteRequests),
        db.select({ total: sql<number>`count(*)::int`, completed: sql<number>`count(*) filter (where ${purchases.status} = 'completed')::int`, revenueCents: sql<number>`coalesce(sum(${purchases.amount}) filter (where ${purchases.status} = 'completed'), 0)::int` }).from(purchases),
        db.select({ total: sql<number>`count(*)::int` }).from(qualityLabReviewedProjects),
        db.select({ total: sql<number>`count(*)::int`, published: sql<number>`count(*) filter (where ${contentEntries.published} = true)::int`, paid: sql<number>`count(*) filter (where ${contentEntries.tier} in ('pro', 'paid'))::int` }).from(contentEntries),
      ]);
      const documentProducts = Object.values(DELIVERABLES);
      res.json({
        users: userTotals[0] ?? { total: 0, pro: 0, verified: 0 },
        leads: leadTotals[0]?.total ?? 0,
        commercialRequests: requestTotals[0]?.total ?? 0,
        purchases: purchaseTotals[0] ?? { total: 0, completed: 0, revenueCents: 0 },
        reviewedProjects: projectTotals[0]?.total ?? 0,
        content: contentTotals[0] ?? { total: 0, published: 0, paid: 0 },
        documents: { products: documentProducts.length, files: documentProducts.reduce((sum, product) => sum + product.files.length, 0) },
      });
    } catch (error) {
      console.error("[Admin] overview error:", error);
      res.status(500).json({ message: "Failed to load admin overview" });
    }
  });

  app.get("/api/admin/users", ...adminOnly, async (_req, res) => {
    try {
      const rows = await db.select({
        id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName,
        isPro: users.isPro, verifiedEmail: users.verifiedEmail, subscriptionStatus: users.subscriptionStatus,
        proExpiresAt: users.proExpiresAt, createdAt: users.createdAt, updatedAt: users.updatedAt,
      }).from(users).orderBy(desc(users.createdAt)).limit(250);
      res.json({ users: rows });
    } catch (error) {
      console.error("[Admin] users error:", error);
      res.status(500).json({ message: "Failed to load users" });
    }
  });

  app.patch("/api/admin/users/:userId/access", ...adminOnly, async (req, res) => {
    try {
      const body = userAccessSchema.parse(req.body);
      const [updated] = await db.update(users).set({
        isPro: body.isPro, subscriptionStatus: body.isPro ? "manual" : "free",
        proExpiresAt: null, proGraceUntil: null, updatedAt: new Date(),
      }).where(eq(users.id, String(req.params.userId))).returning({ id: users.id, isPro: users.isPro, subscriptionStatus: users.subscriptionStatus, updatedAt: users.updatedAt });
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.issues[0]?.message ?? "Invalid access update" });
      console.error("[Admin] user access error:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });

  app.get("/api/admin/content", ...adminOnly, async (_req, res) => {
    try {
      res.json({ content: await db.select().from(contentEntries).orderBy(desc(contentEntries.updatedAt)).limit(500) });
    } catch (error) {
      console.error("[Admin] content error:", error);
      res.status(500).json({ message: "Failed to load content controls" });
    }
  });

  app.patch("/api/admin/content/:contentId", ...adminOnly, async (req, res) => {
    try {
      const body = contentUpdateSchema.parse(req.body);
      const [updated] = await db.update(contentEntries).set({ ...body, updatedAt: new Date() }).where(eq(contentEntries.id, Number(req.params.contentId))).returning();
      if (!updated) return res.status(404).json({ message: "Content entry not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.issues[0]?.message ?? "Invalid content update" });
      console.error("[Admin] content update error:", error);
      res.status(500).json({ message: "Failed to update content" });
    }
  });

  app.get("/api/admin/documents", ...adminOnly, async (_req, res) => {
    try {
      const products = await Promise.all(Object.values(DELIVERABLES).map(async (product) => ({
        id: product.id, name: product.name,
        access: product.entitledBy.length ? "purchase-or-pro" : "pro-only",
        entitledBy: product.entitledBy,
        files: await Promise.all(product.files.map(async (file) => {
          const sourcePath = path.resolve(process.cwd(), "content", "deliverables", product.dir, file.source ?? file.filename);
          let available = true;
          try { await access(sourcePath); } catch { available = false; }
          return {
            filename: file.filename, label: file.label, description: file.description,
            contentType: file.contentType, generated: file.generate ?? null, available,
            previewUrl: `/api/downloads/${product.id}/${encodeURIComponent(file.filename)}`,
          };
        })),
      })));
      res.json({ products });
    } catch (error) {
      console.error("[Admin] documents error:", error);
      res.status(500).json({ message: "Failed to load paid documents" });
    }
  });

  app.get("/api/admin/pipeline", ...adminOnly, async (_req, res) => {
    try {
      const [leadRows, requestRows, purchaseRows, projectRows] = await Promise.all([
        db.select().from(leads).orderBy(desc(leads.createdAt)).limit(150),
        db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt)).limit(150),
        db.select({ id: purchases.id, userId: purchases.userId, productType: purchases.productType, amount: purchases.amount, status: purchases.status, createdAt: purchases.createdAt }).from(purchases).orderBy(desc(purchases.createdAt)).limit(150),
        db.select({ id: qualityLabReviewedProjects.id, userId: qualityLabReviewedProjects.userId, localProjectId: qualityLabReviewedProjects.localProjectId, projectName: qualityLabReviewedProjects.projectName, snapshot: qualityLabReviewedProjects.snapshot, createdAt: qualityLabReviewedProjects.createdAt, updatedAt: qualityLabReviewedProjects.updatedAt }).from(qualityLabReviewedProjects).orderBy(desc(qualityLabReviewedProjects.updatedAt)).limit(150),
      ]);
      res.json({
        leads: leadRows, requests: requestRows, purchases: purchaseRows,
        projects: projectRows.map(({ snapshot, ...project }) => ({ ...project, reviewRequestedAt: snapshot.reviewRequestedAt ?? null, readinessPercent: snapshot.blueprint?.dataQuality?.completenessPercent ?? null })),
      });
    } catch (error) {
      console.error("[Admin] pipeline error:", error);
      res.status(500).json({ message: "Failed to load operational pipeline" });
    }
  });
}
