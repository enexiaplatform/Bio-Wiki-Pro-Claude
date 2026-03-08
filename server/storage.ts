import { db } from "./db";
import {
  users,
  quoteRequests,
  type User,
  type UpsertUser,
  type QuoteRequest,
<<<<<<< HEAD
  type InsertQuoteRequest,
=======
  type InsertQuoteRequest
>>>>>>> 89c929b6a5e8182e473f67314c438ca8b03d597f
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  updateUserPro(id: string, isPro: boolean): Promise<User>;
  createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest> {
    const [quote] = await db.insert(quoteRequests).values(request).returning();
    return quote;
  }
}

export const storage = new DatabaseStorage();
