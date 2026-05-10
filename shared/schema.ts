import { pgTable, text, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === AUTH MODELS (users + sessions) ===
export * from "./models/auth";

// === TABLE DEFINITIONS ===

// Quote Requests from the Solutions tab
export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  need: text("need").notNull(),
  productOfInterest: text("product_of_interest"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({ id: true, createdAt: true });

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

export interface AcademyEntry {
  entry_id: string;
  title: string;
  category: string;
  subcategory: string;
  entry_type: string;
  difficulty: string;
  target_role: string[];
  industry: string[];
  regulatory_refs: string[];
  read_time_min: number;
  tags: string[];
  related_entries: string[];
  equipment_category?: string[];
  is_premium: boolean;
  public_summary: string;
  content_full_outline: string[];
  workflow_steps?: string[];
  meta_description?: string;
  accuracy_flag?: string | null;
  last_reviewed?: string;
  accuracy_note?: string;
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
