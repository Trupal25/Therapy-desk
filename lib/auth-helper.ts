import { cookies } from 'next/headers';
import { createHash } from 'crypto';

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
