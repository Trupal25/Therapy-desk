/**
 * db/reset.ts — dev-only. Wipes the database completely (including drizzle metadata) and rebuilds.
 * Run with: bun db/reset.ts
 */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import path from 'path';
import { applyRls } from './apply-rls';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const sql = neon(url);
  const db  = drizzle(sql);

  console.log('🗑️  Dropping all tables, schemas, and types...');

  // Drop drizzle schema if it exists (clears migration history)
  await sql`DROP SCHEMA IF EXISTS "drizzle" CASCADE`;

  // Drop all tables in public schema
  await sql`
    DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$
  `;

  // Drop all enums in public schema
  await sql`
    DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (
        SELECT t.typname FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typtype = 'e'
      ) LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
      END LOOP;
    END $$
  `;

  console.log('✅ Database cleared completely.');
  console.log('🚀 Applying migrations...');

  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), 'drizzle'),
  });

  await applyRls(url);

  // Verify
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  console.log(`✅ Schema applied cleanly. ${tables.length} tables created:`);
  tables.forEach((t) => console.log('   •', t.table_name));
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
