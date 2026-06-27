/**
 * Usage: npx tsx scripts/create-admin.ts <email> [fullName]
 *
 * Creates an organization + admin user + encryption key in the database.
 * The user will be able to access /admin immediately.
 */
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql, eq } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";
import * as schema from "../db/schema";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npx tsx scripts/create-admin.ts <email> [fullName]");
    process.exit(1);
  }

  const fullName = process.argv[3] || email.split("@")[0];

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");

  const pool = new Pool({
    connectionString: url.toString(),
    max: 1,
    connectionTimeoutMillis: 30000,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle({ client: pool, schema });

  const [existing] = await db
    .select({ id: schema.users.id, role: schema.users.role })
    .from(schema.users)
    .where(sql`${schema.users.email} = ${email}`)
    .limit(1);

  if (existing) {
    if (existing.role === "admin") {
      console.log(`✓ ${email} already has admin role`);
    } else {
      await db
        .update(schema.users)
        .set({ role: "admin" })
        .where(eq(schema.users.id, existing.id));
      console.log(`✓ ${email} upgraded from ${existing.role} to admin`);
    }
    await pool.end();
    return;
  }

  const passwordHash = createHash("sha256")
    .update("clerk_auth_" + randomBytes(16).toString("hex"))
    .digest("hex");

  const slug = email.split("@")[0] + "-" + Math.random().toString(36).substring(2, 6);

  await db.transaction(async (tx: any) => {
    const [org] = await tx
      .insert(schema.organizations)
      .values({
        name: `${fullName}'s Practice`,
        slug,
        plan: "free",
      })
      .returning();

    await tx.insert(schema.encryptionKeys).values({
      organizationId: org.id,
      keyVersion: 1,
      algorithm: "AES-256-GCM",
    });

    const [user] = await tx
      .insert(schema.users)
      .values({
        organizationId: org.id,
        email,
        passwordHash,
        fullName,
        role: "admin",
        specializations: [],
      })
      .returning();

    console.log(`✓ Admin account created for ${email} (user: ${user.id}, org: ${org.id})`);
    console.log(`  Name: ${fullName}`);
    console.log(`  Role: admin`);
  });

  await pool.end();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
