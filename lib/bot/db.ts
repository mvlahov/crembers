// Postgres access. Works with any Postgres URL — Neon, Supabase or local.
import { Pool, types } from "pg";

// Keep DATE columns as 'YYYY-MM-DD' strings instead of JS Dates (no timezone drift).
types.setTypeParser(1082, (v) => v);

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");
    pool = new Pool({ connectionString, max: 3 });
  }
  return pool;
}

export async function q<T = Record<string, any>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

export async function closeDb(): Promise<void> {
  await pool?.end();
  pool = undefined;
}
