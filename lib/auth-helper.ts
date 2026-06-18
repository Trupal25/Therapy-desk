import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema/users';
import { organizations } from '../db/schema/organizations';
import { encryptionKeys } from '../db/schema/encryption_keys';

export interface SessionData {
  userId: string;
  organizationId: string;
  role: string;
  fullName: string;
}

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const clerkAuth = await auth();
    if (clerkAuth && clerkAuth.userId) {
      // User is logged in via Clerk. Let's find or create them in our DB.
      const clerkUser = await currentUser();
      if (!clerkUser) return null;
      
      const email = clerkUser.emailAddresses[0]?.emailAddress?.trim().toLowerCase();
      if (!email) return null;
      
      // Look up user by email
      const foundUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
        
      if (foundUsers.length > 0) {
        const u = foundUsers[0];
        return {
          userId: u.id,
          organizationId: u.organizationId,
          role: u.role,
          fullName: u.fullName,
        };
      }
      
      // If user doesn't exist, create organization and user profiles (signup via Clerk)
      const fullName = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || 'Clerk User';
        
      const result = await db.transaction(async (tx: any) => {
        const slug = email.split('@')[0] + '-' + Math.random().toString(36).substring(2, 6);
        const [org] = await tx
          .insert(organizations)
          .values({
            name: `${fullName}'s Practice`,
            slug: slug,
            plan: 'free',
          })
          .returning();
          
        await tx.insert(encryptionKeys).values({
          organizationId: org.id,
          keyVersion: 1,
          algorithm: 'AES-256-GCM',
        });
        
        const [newUser] = await tx
          .insert(users)
          .values({
            organizationId: org.id,
            email: email,
            passwordHash: hashPassword('clerk_auth_' + clerkAuth.userId),
            fullName: fullName,
            role: 'owner',
            specializations: [],
          })
          .returning();
          
        return { newUser, org };
      });
      
      return {
        userId: result.newUser.id,
        organizationId: result.org.id,
        role: result.newUser.role,
        fullName: result.newUser.fullName,
      };
    }
  } catch (err) {
    console.error("Clerk session resolution failed, falling back to legacy cookie session:", err);
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie || !sessionCookie.value) return null;
  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf8'));
    return data;
  } catch {
    return null;
  }
}

export async function setSession(data: SessionData) {
  const cookieStore = await cookies();
  const value = Buffer.from(JSON.stringify(data)).toString('base64');
  cookieStore.set('session', value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
