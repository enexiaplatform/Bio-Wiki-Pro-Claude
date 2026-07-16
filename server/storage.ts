import { db } from "./db.js";
import { users, purchases, type User, type UpsertUser } from "../shared/models/auth.js";
import {
  quoteRequests,
  leads,
  processedStripeEvents,
  contentEntries,
  lessonReads,
  nurtureSends,
  lifecycleSends,
  checkoutAttempts,
  qualityLabReviewedProjects,
  qualityLabReviewedProjectRevisions,
  qualityLabGovernanceRecords,
  qualityLabGovernanceRevisions,
  type QuoteRequest,
  type InsertQuoteRequest,
  type Lead,
  type ContentEntryRow,
  type InsertContentEntry,
  type QualityLabReviewedProjectRow,
  type QualityLabReviewedProjectRevisionRow,
  type QualityLabGovernanceRecordRow,
  type QualityLabGovernanceRevisionRow,
} from "../shared/schema.js";
import type { QualityLabReviewedProjectSnapshot } from "../shared/quality-lab-persistence.js";
import type { QualityLabGovernanceKey, QualityLabGovernanceSnapshot } from "../shared/quality-lab-governance.js";
import { and, desc, eq, gt, lt, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  setResetToken(userId: string, token: string, expiry: Date): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  setVerificationToken(userId: string, token: string, expiry: Date): Promise<void>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  markEmailVerified(userId: string): Promise<void>;
  updateUserPro(id: string, isPro: boolean): Promise<User>;
  updateUserStripe(id: string, data: Partial<Pick<User, "isPro" | "stripeCustomerId" | "stripeSubscriptionId" | "subscriptionStatus" | "proExpiresAt" | "proGraceUntil">>): Promise<User>;
  createPurchase(data: { userId: string; productType: string; stripeSessionId?: string; amount?: number; status?: string }): Promise<void>;
  createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest>;
  captureLead(email: string, source?: string): Promise<{ isNew: boolean; lead: Lead }>;
  isStripeEventProcessed(eventId: string): Promise<boolean>;
  markStripeEventProcessed(eventId: string, type: string): Promise<void>;
  getContentEntry(slug: string, lang: string): Promise<ContentEntryRow | undefined>;
  upsertContentEntry(entry: InsertContentEntry): Promise<void>;
  hasCompletedPurchase(userId: string, productType?: string): Promise<boolean>;
  getReadLessons(userId: string): Promise<string[]>;
  markLessonRead(userId: string, slug: string): Promise<void>;
  getNurtureCandidates(maxAgeDays: number): Promise<{ id: string; email: string | null; firstName: string | null; createdAt: Date | null }[]>;
  getSentNurtureSteps(userId: string): Promise<number[]>;
  recordNurtureSend(userId: string, step: number): Promise<void>;
  // Lifecycle emails (trial-ending, abandoned-checkout)
  getTrialEndingCandidates(withinDays: number): Promise<{ id: string; email: string | null; firstName: string | null; proExpiresAt: Date | null }[]>;
  wasLifecycleSent(userId: string, kind: string): Promise<boolean>;
  recordLifecycleSend(userId: string, kind: string): Promise<void>;
  recordCheckoutAttempt(userId: string, productType: string): Promise<void>;
  getRecentCheckoutAttempts(minAgeHours: number, maxAgeHours: number): Promise<{ userId: string; productType: string }[]>;
  // Re-engagement: users whose most recent lesson read falls in [maxDays, minDays] ago.
  getReEngagementCandidates(minDays: number, maxDays: number): Promise<string[]>;
  upsertQualityLabReviewedProject(userId: string, snapshot: QualityLabReviewedProjectSnapshot): Promise<QualityLabReviewedProjectRow>;
  getQualityLabReviewedProject(userId: string, localProjectId: string): Promise<QualityLabReviewedProjectRow | undefined>;
  listQualityLabReviewedProjects(userId: string): Promise<QualityLabReviewedProjectRow[]>;
  listQualityLabReviewedProjectRevisions(userId: string, localProjectId: string): Promise<QualityLabReviewedProjectRevisionRow[]>;
  deleteQualityLabReviewedProject(userId: string, localProjectId: string): Promise<boolean>;
  upsertQualityLabGovernanceRecord(userId: string, recordKey: QualityLabGovernanceKey, snapshot: QualityLabGovernanceSnapshot): Promise<QualityLabGovernanceRecordRow>;
  getQualityLabGovernanceRecord(userId: string, recordKey: QualityLabGovernanceKey): Promise<QualityLabGovernanceRecordRow | undefined>;
  listQualityLabGovernanceRevisions(userId: string, recordKey: QualityLabGovernanceKey): Promise<QualityLabGovernanceRevisionRow[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async setResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await db
      .update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ passwordHash, resetToken: null, resetTokenExpiry: null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async setVerificationToken(userId: string, token: string, expiry: Date): Promise<void> {
    await db
      .update(users)
      .set({ verificationToken: token, verificationTokenExpiry: expiry, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }

  async markEmailVerified(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ verifiedEmail: true, verificationToken: null, verificationTokenExpiry: null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserPro(id: string, isPro: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isPro, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripe(
    id: string,
    data: Partial<Pick<User, "isPro" | "stripeCustomerId" | "stripeSubscriptionId" | "subscriptionStatus" | "proExpiresAt" | "proGraceUntil">>
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createPurchase(data: {
    userId: string;
    productType: string;
    stripeSessionId?: string;
    amount?: number;
    status?: string;
  }): Promise<void> {
    await db.insert(purchases).values({
      userId: data.userId,
      productType: data.productType,
      stripeSessionId: data.stripeSessionId,
      amount: data.amount,
      status: data.status ?? "completed",
    });
  }

  async createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest> {
    const [quote] = await db.insert(quoteRequests).values(request).returning();
    return quote;
  }

  async captureLead(email: string, source = "lead_magnet"): Promise<{ isNew: boolean; lead: Lead }> {
    // Upsert — if email already exists, return existing record
    const existing = await db.select().from(leads).where(eq(leads.email, email));
    if (existing.length > 0) {
      return { isNew: false, lead: existing[0] };
    }
    const [lead] = await db.insert(leads).values({ email, source }).returning();
    return { isNew: true, lead };
  }

  async isStripeEventProcessed(eventId: string): Promise<boolean> {
    const existing = await db
      .select({ eventId: processedStripeEvents.eventId })
      .from(processedStripeEvents)
      .where(eq(processedStripeEvents.eventId, eventId));
    return existing.length > 0;
  }

  async markStripeEventProcessed(eventId: string, type: string): Promise<void> {
    // onConflictDoNothing makes concurrent retries a safe no-op rather than a throw
    await db
      .insert(processedStripeEvents)
      .values({ eventId, type })
      .onConflictDoNothing();
  }

  async getContentEntry(slug: string, lang: string): Promise<ContentEntryRow | undefined> {
    const [row] = await db
      .select()
      .from(contentEntries)
      .where(and(eq(contentEntries.slug, slug), eq(contentEntries.lang, lang)));
    return row;
  }

  async upsertContentEntry(entry: InsertContentEntry): Promise<void> {
    await db
      .insert(contentEntries)
      .values(entry)
      .onConflictDoUpdate({
        target: [contentEntries.slug, contentEntries.lang],
        set: {
          tier: entry.tier,
          published: entry.published,
          sort: entry.sort,
          updatedAt: new Date(),
        },
      });
  }

  async hasCompletedPurchase(userId: string, productType?: string): Promise<boolean> {
    const conditions = productType
      ? and(eq(purchases.userId, userId), eq(purchases.productType, productType), eq(purchases.status, "completed"))
      : and(eq(purchases.userId, userId), eq(purchases.status, "completed"));
    const rows = await db.select({ id: purchases.id }).from(purchases).where(conditions);
    return rows.length > 0;
  }

  async getReadLessons(userId: string): Promise<string[]> {
    const rows = await db
      .select({ slug: lessonReads.slug })
      .from(lessonReads)
      .where(eq(lessonReads.userId, userId));
    return rows.map((r) => r.slug);
  }

  async markLessonRead(userId: string, slug: string): Promise<void> {
    await db.insert(lessonReads).values({ userId, slug }).onConflictDoNothing();
  }

  async getNurtureCandidates(maxAgeDays: number) {
    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    return db
      .select({ id: users.id, email: users.email, firstName: users.firstName, createdAt: users.createdAt })
      .from(users)
      .where(and(eq(users.isPro, false), gt(users.createdAt, cutoff)));
  }

  async getSentNurtureSteps(userId: string): Promise<number[]> {
    const rows = await db
      .select({ step: nurtureSends.step })
      .from(nurtureSends)
      .where(eq(nurtureSends.userId, userId));
    return rows.map((r) => r.step);
  }

  async recordNurtureSend(userId: string, step: number): Promise<void> {
    await db.insert(nurtureSends).values({ userId, step }).onConflictDoNothing();
  }

  async getTrialEndingCandidates(withinDays: number) {
    const now = new Date();
    const horizon = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000);
    return db
      .select({ id: users.id, email: users.email, firstName: users.firstName, proExpiresAt: users.proExpiresAt })
      .from(users)
      .where(
        and(
          eq(users.subscriptionStatus, "trialing"),
          gt(users.proExpiresAt, now),
          lt(users.proExpiresAt, horizon),
        ),
      );
  }

  async wasLifecycleSent(userId: string, kind: string): Promise<boolean> {
    const [row] = await db
      .select({ id: lifecycleSends.id })
      .from(lifecycleSends)
      .where(and(eq(lifecycleSends.userId, userId), eq(lifecycleSends.kind, kind)));
    return !!row;
  }

  async recordLifecycleSend(userId: string, kind: string): Promise<void> {
    await db.insert(lifecycleSends).values({ userId, kind }).onConflictDoNothing();
  }

  async recordCheckoutAttempt(userId: string, productType: string): Promise<void> {
    await db.insert(checkoutAttempts).values({ userId, productType });
  }

  async getRecentCheckoutAttempts(minAgeHours: number, maxAgeHours: number) {
    const newest = new Date(Date.now() - minAgeHours * 60 * 60 * 1000);
    const oldest = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    return db
      .select({ userId: checkoutAttempts.userId, productType: checkoutAttempts.productType })
      .from(checkoutAttempts)
      .where(and(lt(checkoutAttempts.createdAt, newest), gt(checkoutAttempts.createdAt, oldest)));
  }

  async getReEngagementCandidates(minDays: number, maxDays: number): Promise<string[]> {
    const DAY = 24 * 60 * 60 * 1000;
    const newest = new Date(Date.now() - minDays * DAY); // last read older than minDays ago
    const oldest = new Date(Date.now() - maxDays * DAY); // but newer than maxDays ago
    const rows = await db
      .select({ userId: lessonReads.userId })
      .from(lessonReads)
      .groupBy(lessonReads.userId)
      .having(
        sql`max(${lessonReads.createdAt}) > ${oldest} and max(${lessonReads.createdAt}) < ${newest}`,
      );
    return rows.map((r) => r.userId);
  }

  async upsertQualityLabReviewedProject(userId: string, snapshot: QualityLabReviewedProjectSnapshot): Promise<QualityLabReviewedProjectRow> {
    const existing = await this.getQualityLabReviewedProject(userId, snapshot.localProjectId);
    if (existing && JSON.stringify(existing.snapshot) === JSON.stringify(snapshot)) return existing;
    const [row] = existing
      ? await db.update(qualityLabReviewedProjects).set({ projectName: snapshot.projectName, snapshot, updatedAt: new Date() }).where(eq(qualityLabReviewedProjects.id, existing.id)).returning()
      : await db.insert(qualityLabReviewedProjects).values({ userId, localProjectId: snapshot.localProjectId, projectName: snapshot.projectName, snapshot }).returning();
    const revisions = await db.select({ revisionNumber: qualityLabReviewedProjectRevisions.revisionNumber }).from(qualityLabReviewedProjectRevisions).where(eq(qualityLabReviewedProjectRevisions.reviewedProjectId, row.id));
    const revisionNumber = revisions.reduce((highest, revision) => Math.max(highest, revision.revisionNumber), 0) + 1;
    await db.insert(qualityLabReviewedProjectRevisions).values({ reviewedProjectId: row.id, revisionNumber, snapshot });
    return row;
  }

  async getQualityLabReviewedProject(userId: string, localProjectId: string): Promise<QualityLabReviewedProjectRow | undefined> {
    const [row] = await db.select().from(qualityLabReviewedProjects).where(and(eq(qualityLabReviewedProjects.userId, userId), eq(qualityLabReviewedProjects.localProjectId, localProjectId)));
    return row;
  }

  async listQualityLabReviewedProjects(userId: string): Promise<QualityLabReviewedProjectRow[]> {
    return db.select().from(qualityLabReviewedProjects).where(eq(qualityLabReviewedProjects.userId, userId)).orderBy(desc(qualityLabReviewedProjects.updatedAt));
  }

  async listQualityLabReviewedProjectRevisions(userId: string, localProjectId: string): Promise<QualityLabReviewedProjectRevisionRow[]> {
    const project = await this.getQualityLabReviewedProject(userId, localProjectId);
    if (!project) return [];
    return db.select().from(qualityLabReviewedProjectRevisions).where(eq(qualityLabReviewedProjectRevisions.reviewedProjectId, project.id)).orderBy(qualityLabReviewedProjectRevisions.revisionNumber);
  }

  async deleteQualityLabReviewedProject(userId: string, localProjectId: string): Promise<boolean> {
    const project = await this.getQualityLabReviewedProject(userId, localProjectId);
    if (!project) return false;
    await db.delete(qualityLabReviewedProjectRevisions).where(eq(qualityLabReviewedProjectRevisions.reviewedProjectId, project.id));
    await db.delete(qualityLabReviewedProjects).where(eq(qualityLabReviewedProjects.id, project.id));
    return true;
  }

  async upsertQualityLabGovernanceRecord(userId: string, recordKey: QualityLabGovernanceKey, snapshot: QualityLabGovernanceSnapshot): Promise<QualityLabGovernanceRecordRow> {
    const existing = await this.getQualityLabGovernanceRecord(userId, recordKey);
    if (existing && JSON.stringify(existing.snapshot) === JSON.stringify(snapshot)) return existing;
    const [row] = existing
      ? await db.update(qualityLabGovernanceRecords).set({ snapshot, updatedAt: new Date() }).where(eq(qualityLabGovernanceRecords.id, existing.id)).returning()
      : await db.insert(qualityLabGovernanceRecords).values({ userId, recordKey, snapshot }).returning();
    const revisions = await db.select({ revisionNumber: qualityLabGovernanceRevisions.revisionNumber }).from(qualityLabGovernanceRevisions).where(eq(qualityLabGovernanceRevisions.governanceRecordId, row.id));
    const revisionNumber = revisions.reduce((highest, revision) => Math.max(highest, revision.revisionNumber), 0) + 1;
    await db.insert(qualityLabGovernanceRevisions).values({ governanceRecordId: row.id, revisionNumber, snapshot });
    return row;
  }

  async getQualityLabGovernanceRecord(userId: string, recordKey: QualityLabGovernanceKey): Promise<QualityLabGovernanceRecordRow | undefined> {
    const [row] = await db.select().from(qualityLabGovernanceRecords).where(and(eq(qualityLabGovernanceRecords.userId, userId), eq(qualityLabGovernanceRecords.recordKey, recordKey)));
    return row;
  }

  async listQualityLabGovernanceRevisions(userId: string, recordKey: QualityLabGovernanceKey): Promise<QualityLabGovernanceRevisionRow[]> {
    const record = await this.getQualityLabGovernanceRecord(userId, recordKey);
    if (!record) return [];
    return db.select().from(qualityLabGovernanceRevisions).where(eq(qualityLabGovernanceRevisions.governanceRecordId, record.id)).orderBy(qualityLabGovernanceRevisions.revisionNumber);
  }
}

export const storage = new DatabaseStorage();
