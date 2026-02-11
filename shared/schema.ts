import { pgTable, text, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// User table - primarily for future sync, currently state is local
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  role: text("role").default("Student"),
  isPro: boolean("is_pro").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({ id: true, createdAt: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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

export interface LabTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: ContentStatus;
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
  content: string; // HTML or Markdown
  isLocked: boolean;
}
