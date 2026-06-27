import 'dotenv/config';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

/**
 * Splits a SQL file into individual statements to be executed one-by-one.
 * Correctly ignores semicolons that are within comments, single-quoted strings,
 * double-quoted identifiers, or dollar-quoted ($$) function blocks.
 */
export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    if (inComment) {
      if (char === '\n') {
        inComment = false;
      }
      continue;
    }

    if (!inDollarQuote && !inSingleQuote && !inDoubleQuote) {
      if (char === '-' && nextChar === '-') {
        inComment = true;
        i++; // skip next dash
        continue;
      }
    }

    if (char === '$' && nextChar === '$') {
      inDollarQuote = !inDollarQuote;
      currentStatement += '$$';
      i++; // skip next dollar sign
      continue;
    }

    if (char === "'" && !inDoubleQuote && !inDollarQuote) {
      inSingleQuote = !inSingleQuote;
    }

    if (char === '"' && !inSingleQuote && !inDollarQuote) {
      inDoubleQuote = !inDoubleQuote;
    }

    if (char === ';' && !inDollarQuote && !inSingleQuote && !inDoubleQuote) {
      const trimmed = currentStatement.trim();
      if (trimmed) {
        statements.push(trimmed);
      }
      currentStatement = '';
    } else {
      currentStatement += char;
    }
  }

  const trimmed = currentStatement.trim();
  if (trimmed) {
    statements.push(trimmed);
  }

  return statements;
}

export async function applyRls(url: string) {
  console.log('🔒 Applying Row-Level Security (RLS) policies and triggers from rls.sql...');

  const urlObj = new URL(url);
  urlObj.searchParams.delete('sslmode');
  const client = new Client({ connectionString: urlObj.toString(), ssl: { rejectUnauthorized: false } });
  await client.connect();

  const sqlPath = path.join(process.cwd(), 'db/rls.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  const statements = splitSqlStatements(sqlContent);

  for (const statement of statements) {
    try {
      await client.query(statement);
    } catch (err: any) {
      console.error(`❌ Failed executing statement:\n${statement}\n`);
      await client.end();
      throw err;
    }
  }

  await client.end();
  console.log('✅ RLS policies and triggers applied successfully.');
}

if (require.main === module || (import.meta as any).main) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }
  applyRls(url).catch((err) => {
    console.error('❌ Failed to apply RLS:', err.message ?? err);
    process.exit(1);
  });
}
