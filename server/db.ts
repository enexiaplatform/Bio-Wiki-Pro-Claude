import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;
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
