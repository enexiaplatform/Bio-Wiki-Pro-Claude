import { db } from "./db.js";
import {
  users,
  quoteRequests,
  purchases,
  leads,
  type User,
  type UpsertUser,
  type QuoteRequest,
  type InsertQuoteRequest,
  type Lead,
} from "../shared/schema.js";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUserPro(id: string, isPro: boolean): Promise<User>;
  updateUserStripe(id: string, data: Partial<Pick<User, "isPro" | "stripeCustomerId" | "stripeSubscriptionId" | "subscriptionStatus">>): Promise<User>;
  createPurchase(data: { userId: string; productType: string; stripeSessionId?: string; amount?: number; status?: string }): Promise<void>;
  createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest>;
  captureLead(email: string, source?: string): Promise<{ isNew: boolean; lead: Lead }>;
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
    data: Partial<Pick<User, "isPro" | "stripeCustomerId" | "stripeSubscriptionId" | "subscriptionStatus">>
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
}

export const storage = new DatabaseStorage();
