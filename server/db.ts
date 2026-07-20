import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Supabase's connection pooler uses a certificate chain that Node
    // doesn't trust by default; this is standard for managed Postgres.
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });
