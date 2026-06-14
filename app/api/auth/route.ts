import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { eq } from 'drizzle-orm';
import { users } from '../../../db/schema/users';
import { organizations } from '../../../db/schema/organizations';
import { encryptionKeys } from '../../../db/schema/encryption_keys';
import { hashPassword, setSession, clearSession, getSession } from '../../../lib/auth-helper';
import { logAuditEvent } from '../../../lib/audit-helper';
import { withRls } from '../../../lib/db-helper';

// GET /api/auth — Retrieve current session profile
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}

import { sanitizeError } from '../../../lib/error-helper';

// POST /api/auth — Sign In or Sign Up
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, fullName, plan } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();

    if (action === 'signup') {
      if (!fullName) {
        return NextResponse.json({ error: 'Full name is required for signup' }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, emailClean))
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }

      // Create new tenant organization and user inside a transaction
      const result = await db.transaction(async (tx) => {
        // 1. Create Organization
        const slug = emailClean.split('@')[0] + '-' + Math.random().toString(36).substring(2, 6);
        const [org] = await tx
          .insert(organizations)
          .values({
            name: `${fullName}'s Practice`,
            slug: slug,
            plan: plan || 'free',
          })
          .returning();

        // 2. Create Encryption Key Placeholder for the organization
        await tx.insert(encryptionKeys).values({
          organizationId: org.id,
          keyVersion: 1,
          algorithm: 'AES-256-GCM',
        });

        // 3. Create User
        const [newUser] = await tx
          .insert(users)
          .values({
            organizationId: org.id,
            email: emailClean,
            passwordHash: hashPassword(password),
            fullName: fullName,
            role: 'owner',
            specializations: [],
          })
          .returning();

        // 4. Log Audit Event (organization context set manually since it's the initial create)
        await logAuditEvent(tx, {
          organizationId: org.id,
          actorId: newUser.id,
          eventType: 'create',
          resourceType: 'user',
          resourceId: newUser.id,
          metadata: { action: 'signup', email: emailClean },
          req: request,
        });

        return { newUser, org };
      });

      const sessionData = {
        userId: result.newUser.id,
        organizationId: result.org.id,
        role: result.newUser.role,
        fullName: result.newUser.fullName,
      };

      await setSession(sessionData);
      return NextResponse.json({ success: true, user: sessionData });

    } else {
      // Default to Action: signin
      const foundUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, emailClean))
        .limit(1);

      if (foundUsers.length === 0) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const user = foundUsers[0];
      const match = hashPassword(password) === user.passwordHash;

      if (!match) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const sessionData = {
        userId: user.id,
        organizationId: user.organizationId,
        role: user.role,
        fullName: user.fullName,
      };

      await setSession(sessionData);

      // Log login event inside the organization context
      await withRls(user.organizationId, async (tx) => {
        await logAuditEvent(tx, {
          organizationId: user.organizationId,
          actorId: user.id,
          eventType: 'login',
          resourceType: 'user',
          resourceId: user.id,
          req: request,
        });
      });

      return NextResponse.json({ success: true, user: sessionData });
    }
  } catch (err: any) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Internal server error') }, { status: 500 });
  }
}

// DELETE /api/auth — Sign Out
export async function DELETE(request: Request) {
  const session = await getSession();
  if (session) {
    try {
      await withRls(session.organizationId, async (tx) => {
        await logAuditEvent(tx, {
          organizationId: session.organizationId,
          actorId: session.userId,
          eventType: 'logout',
          resourceType: 'user',
          resourceId: session.userId,
          req: request,
        });
      });
    } catch (err) {
      console.error('Audit signout logging failed:', err);
    }
  }
  await clearSession();
  return NextResponse.json({ success: true });
}
