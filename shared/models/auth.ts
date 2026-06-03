import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, timestamp, varchar, text, serial, integer } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isPro: boolean("is_pro").default(false).notNull(),
  
  // Auth columns
  passwordHash: text('password_hash'),
  verifiedEmail: boolean('verified_email').default(false).notNull(),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  verificationToken: text('verification_token'),
  verificationTokenExpiry: timestamp('verification_token_expiry'),
  
  // Stripe columns
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status').default('free'), // 'free' | 'active' | 'past_due' | 'canceled'
  proExpiresAt: timestamp('pro_expires_at'),       // current period end / when Pro access ends
  proGraceUntil: timestamp('pro_grace_until'),     // dunning grace deadline after a failed payment

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchases table
export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id),
  productType: text('product_type').notNull(), // 'pro_subscription' | 'starter_kit' | 'interview_prep' | 'bundle'
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeSessionId: text('stripe_session_id'),
  amount: integer('amount'), // in cents
  status: text('status').default('pending'), // 'pending' | 'completed' | 'refunded'
  createdAt: timestamp('created_at').defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
