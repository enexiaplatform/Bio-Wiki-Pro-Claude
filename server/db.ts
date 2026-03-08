import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;
<<<<<<< HEAD
const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({ connectionString })
  : null;

export const db = pool
  ? drizzle(pool, { schema })
  : new Proxy(
      {},
      {
        get() {
          throw new Error(
            "DATABASE_URL is not configured. Database-backed APIs are disabled.",
          );
        },
      },
    ) as ReturnType<typeof drizzle<typeof schema>>;
=======

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
>>>>>>> 89c929b6a5e8182e473f67314c438ca8b03d597f
