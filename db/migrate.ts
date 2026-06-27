/**
 * db/migrate.ts — applies pending migrations via pg (node-postgres)
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  console.log('🚀 Running migrations via pg...');
  const urlObj = new URL(url);
  urlObj.searchParams.delete('sslmode');
  const pool = new Pool({ connectionString: urlObj.toString(), max: 1, ssl: { rejectUnauthorized: false } });
  const db = drizzle({ client: pool });
  const dir = path.join(process.cwd(), 'drizzle');

  await migrate(db, { migrationsFolder: dir });
  await pool.end();

  console.log('✅ Migrations applied successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message ?? err);
  process.exit(1);
});
