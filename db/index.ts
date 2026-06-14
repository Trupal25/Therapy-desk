import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

declare global {
  // eslint-disable-next-line no-var
  var pool: Pool | undefined;
  // eslint-disable-next-line no-var
  var connectionString: string | undefined;
  // eslint-disable-next-line no-var
  var db: any | undefined;
}

if (process.env.NODE_ENV !== 'production') {
  if (globalThis.pool && globalThis.connectionString !== connectionString) {
    console.log('🔄 Database URL changed or reloaded. Recreating pool...');
    globalThis.pool.end().catch(() => {});
    globalThis.pool = undefined;
    globalThis.db = undefined;
  }
}

const pool =
  globalThis.pool ||
  new Pool({
    connectionString: connectionString,
    max: 10,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 15000,
  });

const db =
  globalThis.db ||
  drizzle({ client: pool, schema });

if (process.env.NODE_ENV !== 'production') {
  globalThis.pool = pool;
  globalThis.connectionString = connectionString;
  globalThis.db = db;
}

export { db };
