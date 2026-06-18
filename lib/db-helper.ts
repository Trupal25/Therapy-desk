import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Runs a query block wrapped in a transaction with the current organization context set.
 * This ensures that PostgreSQL Row-Level Security (RLS) policies are properly evaluated
 * for multi-tenant isolation.
 */
export async function withRls<T>(orgId: string, callback: (tx: any) => Promise<T>): Promise<T> {
  return await db.transaction(async (tx: any) => {
    await tx.execute(sql`SELECT set_config('app.current_org_id', ${orgId}, true)`);
    return await callback(tx);
  });
}
