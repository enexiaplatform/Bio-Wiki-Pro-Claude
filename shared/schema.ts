import { pgTable, text, serial, boolean, timestamp, jsonb, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import type { QualityLabReviewedProjectSnapshot } from "./quality-lab-persistence";
import type { QualityLabGovernanceSnapshot } from "./quality-lab-governance";
import type { AtlasProMonthlyReviewRecord } from "./atlas-pro-monthly";

// === AUTH MODELS ===
// Auth/billing tables live in ./models/auth.ts. They are intentionally NOT
// re-exported here: drizzle-kit's loader can't resolve the required `.js`
// extension, so drizzle.config.ts lists both files directly, and app code
// imports auth tables/types straight from "@shared/models/auth".

// === TABLE DEFINITIONS ===

// Lead captures (email magnet)
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").default("lead_magnet"), // e.g. 'lead_magnet', 'footer', 'gmp_kit_page'
  downloadSent: boolean("download_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, downloadSent: true });
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

// Stripe webhook idempotency — one row per processed event so retries
// (Stripe re-sends the same event.id) never double-fulfill.
export const processedStripeEvents = pgTable("processed_stripe_events", {
  eventId: text("event_id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at").defaultNow(),
});
export type ProcessedStripeEvent = typeof processedStripeEvents.$inferSelect;

// Content metadata — operational state for MDX entries (publish/sort/analytics).
// The MDX file stays the source of truth for content; this is the source of
// truth for publish state. Keyed by (slug, lang). Seeded from frontmatter.
export const contentEntries = pgTable(
  "content_entries",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    lang: text("lang").notNull(),
    tier: text("tier").notNull().default("free"), // 'free' | 'pro' | 'paid'
    published: boolean("published").notNull().default(true),
    sort: integer("sort").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [uniqueIndex("content_entries_slug_lang_idx").on(t.slug, t.lang)],
);
export type ContentEntryRow = typeof contentEntries.$inferSelect;
export type InsertContentEntry = typeof contentEntries.$inferInsert;

// Per-user reading progress (which Academy lessons a user has opened).
// Cross-device sync for logged-in users; guests use localStorage only.
export const lessonReads = pgTable(
  "lesson_reads",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("lesson_reads_user_slug_idx").on(t.userId, t.slug)],
);
export type LessonRead = typeof lessonReads.$inferSelect;

// Pro members can deliberately sync monthly quality working records across
// devices. The snapshot remains a professional working aid, not a controlled
// quality-system record, approval, electronic signature, or project deliverable.
export const atlasProMonthlyReviews = pgTable(
  "atlas_pro_monthly_reviews",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    reviewId: text("review_id").notNull(),
    month: text("month").notNull(),
    snapshot: jsonb("snapshot").$type<AtlasProMonthlyReviewRecord>().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [uniqueIndex("atlas_pro_monthly_reviews_user_review_idx").on(t.userId, t.reviewId)],
);
export type AtlasProMonthlyReviewRow = typeof atlasProMonthlyReviews.$inferSelect;

// Free→Pro email nurture: one row per (user, step) so the daily cron never
// re-sends a step. Degrades gracefully if the table is absent (pre-migration).
export const nurtureSends = pgTable(
  "nurture_sends",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    step: integer("step").notNull(),
    sentAt: timestamp("sent_at").defaultNow(),
  },
  (t) => [uniqueIndex("nurture_sends_user_step_idx").on(t.userId, t.step)],
);
export type NurtureSend = typeof nurtureSends.$inferSelect;

// Lifecycle email guard — one row per (user, kind) so a given lifecycle email
// (e.g. "trial_end_3d", "trial_end_1d", "abandoned_checkout") is sent at most
// once per user. Degrades gracefully if the table is absent (pre-migration).
export const lifecycleSends = pgTable(
  "lifecycle_sends",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    kind: text("kind").notNull(),
    sentAt: timestamp("sent_at").defaultNow(),
  },
  (t) => [uniqueIndex("lifecycle_sends_user_kind_idx").on(t.userId, t.kind)],
);
export type LifecycleSend = typeof lifecycleSends.$inferSelect;

// Checkout attempts — recorded when a Stripe Checkout session is created, so the
// daily cron can email an abandoned-checkout reminder to users who started but
// never converted. Best-effort: failures never block the checkout flow.
export const checkoutAttempts = pgTable("checkout_attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  productType: text("product_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export type CheckoutAttempt = typeof checkoutAttempts.$inferSelect;

// Quote Requests from the Solutions tab
export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  need: text("need").notNull(),
  productOfInterest: text("product_of_interest"),
  status: text("status").notNull().default("new"),
  owner: text("owner"),
  nextAction: text("next_action"),
  nextActionAt: timestamp("next_action_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Server-side copies are reserved for authenticated projects entering expert
// review. Concept projects remain browser-local by default.
export const qualityLabReviewedProjects = pgTable(
  "quality_lab_reviewed_projects",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    localProjectId: text("local_project_id").notNull(),
    projectName: text("project_name").notNull(),
    snapshot: jsonb("snapshot").$type<QualityLabReviewedProjectSnapshot>().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [uniqueIndex("quality_lab_reviewed_projects_user_local_idx").on(t.userId, t.localProjectId)],
);
export type QualityLabReviewedProjectRow = typeof qualityLabReviewedProjects.$inferSelect;

// Append-only working snapshots for reviewed projects. These are not QA
// approvals; they make the Atlas handoff and expert-review trail inspectable.
export const qualityLabReviewedProjectRevisions = pgTable(
  "quality_lab_reviewed_project_revisions",
  {
    id: serial("id").primaryKey(),
    reviewedProjectId: integer("reviewed_project_id").notNull(),
    revisionNumber: integer("revision_number").notNull(),
    reason: text("reason").notNull().default("reviewed-project-sync"),
    snapshot: jsonb("snapshot").$type<QualityLabReviewedProjectSnapshot>().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("quality_lab_reviewed_project_revisions_project_number_idx").on(t.reviewedProjectId, t.revisionNumber)],
);
export type QualityLabReviewedProjectRevisionRow = typeof qualityLabReviewedProjectRevisions.$inferSelect;

// Account-held governance working records. They are versioned evidence registers,
// never electronic signatures, appointments, or QA approvals.
export const qualityLabGovernanceRecords = pgTable("quality_lab_governance_records", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  recordKey: text("record_key").notNull(),
  snapshot: jsonb("snapshot").$type<QualityLabGovernanceSnapshot>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [uniqueIndex("quality_lab_governance_records_user_key_idx").on(t.userId, t.recordKey)]);
export type QualityLabGovernanceRecordRow = typeof qualityLabGovernanceRecords.$inferSelect;

export const qualityLabGovernanceRevisions = pgTable("quality_lab_governance_revisions", {
  id: serial("id").primaryKey(),
  governanceRecordId: integer("governance_record_id").notNull(),
  revisionNumber: integer("revision_number").notNull(),
  snapshot: jsonb("snapshot").$type<QualityLabGovernanceSnapshot>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [uniqueIndex("quality_lab_governance_revisions_record_number_idx").on(t.governanceRecordId, t.revisionNumber)]);
export type QualityLabGovernanceRevisionRow = typeof qualityLabGovernanceRevisions.$inferSelect;

// === SCHEMAS ===

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  status: true,
  owner: true,
  nextAction: true,
  nextActionAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
});

// === TYPES ===

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;

// Mock Data Types (used in frontend for the static data files)
export type TermMode = "STUDENT" | "QC" | "SALES";
export type ContentStatus = "READY" | "COMING_SOON";

export interface Term {
  id: string;
  slug: string;
  title: string;
  mode: TermMode;
  category: string;
  tags: string[];
  summary: string;
  whyItMatters: string;
  commonMistakes: string[];
  videoUrl?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTimeMin: number;
  status: ContentStatus;
  diagramLabel?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  level: "Entry" | "Mid" | "Senior";
  salaryRange: string;
  requiredSkills: string[];
  postedAt: string;
  domain: "QC" | "QA" | "RA" | "Manufacturing";
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  features: string[];
  targetUsers?: string[];
  painPoint?: string;
  salesTalkingPoints?: string[];
}

export type ToolStatus = "FREE" | "COMING_SOON" | "PRO";
export type ToolDifficulty = "Basic" | "Intermediate";
export type ToolSection = "Solution Prep" | "Cell & Microbiology" | "Analytical & Quantification";

export interface LabTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolSection;
  tags: string[];
  difficulty: ToolDifficulty;
  timeLabel: string;
  audience: ("Student" | "QC")[];
  isMostUsed: boolean;
  status: ToolStatus;
  available: boolean;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  audience: TermMode;
}

export interface SOP {
  id: string;
  title: string;
  summary: string;
  content: string;
  isLocked: boolean;
}
