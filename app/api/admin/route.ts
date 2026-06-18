import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '../../../db';
import { eq, desc, and, isNull, count } from 'drizzle-orm';
import { organizations } from '../../../db/schema/organizations';
import { users } from '../../../db/schema/users';
import { subscriptions } from '../../../db/schema/subscriptions';
import { auditLogs } from '../../../db/schema/audit_logs';
import { encryptionKeys } from '../../../db/schema/encryption_keys';
import { soapNotes } from '../../../db/schema/soap_notes';

// Helper to verify admin session
async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin_session');
  if (!adminCookie || !adminCookie.value) return false;
  try {
    const data = JSON.parse(Buffer.from(adminCookie.value, 'base64').toString('utf8'));
    return data.isAdmin === true;
  } catch {
    return false;
  }
}

// GET /api/admin — Fetch statistics or admin list data
export async function GET(request: Request) {
  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'overview';

  try {
    if (tab === 'overview') {
      // 1. Practices (Organizations) Count
      const orgsCountRes = await db.select({ val: count() }).from(organizations);
      const totalOrgs = orgsCountRes[0]?.val || 0;

      // 2. Users Count
      const usersCountRes = await db.select({ val: count() }).from(users);
      const totalUsers = usersCountRes[0]?.val || 0;

      // 3. SOAP Notes Count
      const notesCountRes = await db.select({ val: count() }).from(soapNotes);
      const totalNotes = notesCountRes[0]?.val || 0;

      // 4. Subscriptions Plan distribution
      const subs = await db.select().from(subscriptions);
      const plans = { free: 0, pro: 0, enterprise: 0 };
      subs.forEach((s: any) => {
        if (s.plan in plans) {
          plans[s.plan as keyof typeof plans]++;
        } else {
          plans.free++;
        }
      });

      // 5. Recent Platform Activity (Organizations created recently)
      const recentPractices = await db
        .select()
        .from(organizations)
        .orderBy(desc(organizations.createdAt))
        .limit(5);

      // 6. Recent Audit logs across all orgs
      const recentAudit = await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(5);

      return NextResponse.json({
        totalOrgs,
        totalUsers,
        totalNotes,
        plans,
        recentPractices,
        recentAudit,
      });

    } else if (tab === 'practices') {
      // Fetch all organizations joined with their subscriptions and owner details
      // Get all orgs first
      const orgs = await db.select().from(organizations);

      const practicesData = await Promise.all(
        orgs.map(async (org: any) => {
          // Find first user (usually the owner/creator)
          const firstUser = await db
            .select()
            .from(users)
            .where(eq(users.organizationId, org.id))
            .limit(1);

          // Find subscription details
          const sub = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.organizationId, org.id))
            .limit(1);

          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            createdAt: org.createdAt,
            deletedAt: org.deletedAt,
            ownerName: firstUser[0]?.fullName || 'N/A',
            ownerEmail: firstUser[0]?.email || 'N/A',
            plan: sub[0]?.plan || org.plan || 'free',
            status: sub[0]?.status || 'active',
            usage: sub[0]?.soapNotesUsed || 0,
            limit: sub[0]?.soapNotesLimit || 10,
          };
        })
      );

      return NextResponse.json(practicesData);

    } else if (tab === 'audit') {
      // Get last 100 audit logs across the whole system
      const logs = await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(100);

      // Enrich with organization names
      const enrichedLogs = await Promise.all(
        logs.map(async (log: any) => {
          const org = await db
            .select({ name: organizations.name })
            .from(organizations)
            .where(eq(organizations.id, log.organizationId))
            .limit(1);

          return {
            ...log,
            orgName: org[0]?.name || 'Unknown',
          };
        })
      );

      return NextResponse.json(enrichedLogs);

    } else if (tab === 'keys') {
      // Get encryption keys
      const keys = await db.select().from(encryptionKeys);
      
      // Enrich with org names
      const enrichedKeys = await Promise.all(
        keys.map(async (k: any) => {
          const org = await db
            .select({ name: organizations.name })
            .from(organizations)
            .where(eq(organizations.id, k.organizationId))
            .limit(1);

          return {
            ...k,
            orgName: org[0]?.name || 'Unknown',
          };
        })
      );

      return NextResponse.json(enrichedKeys);
    }

    return NextResponse.json({ error: 'Invalid tab parameter' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin — Login, Logout, Update Plan, Rotate Keys
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
      const { passcode } = body;
      const adminPasscode = process.env.ADMIN_PASSCODE;

      if (!adminPasscode) {
        console.error('ADMIN_PASSCODE environment variable is not set');
        return NextResponse.json({ error: 'Admin authentication is not configured' }, { status: 500 });
      }

      if (passcode !== adminPasscode) {
        return NextResponse.json({ error: 'Invalid admin passcode' }, { status: 401 });
      }

      const sessionData = { isAdmin: true, timestamp: Date.now() };
      const value = Buffer.from(JSON.stringify(sessionData)).toString('base64');

      const cookieStore = await cookies();
      cookieStore.set('admin_session', value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return NextResponse.json({ success: true });
    }

    // All other actions require admin auth
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'logout') {
      const cookieStore = await cookies();
      cookieStore.delete('admin_session');
      return NextResponse.json({ success: true });

    } else if (action === 'update_plan') {
      const { practiceId, plan } = body;
      if (!practiceId || !plan) {
        return NextResponse.json({ error: 'practiceId and plan are required' }, { status: 400 });
      }

      // Update org level plan
      await db
        .update(organizations)
        .set({ plan, updatedAt: new Date() })
        .where(eq(organizations.id, practiceId));

      // Update subscription plan (or insert if not exists)
      const sub = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.organizationId, practiceId))
        .limit(1);

      if (sub.length > 0) {
        await db
          .update(subscriptions)
          .set({
            plan,
            soapNotesLimit: plan === 'pro' ? 100 : plan === 'enterprise' ? 1000 : 10,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.organizationId, practiceId));
      } else {
        await db.insert(subscriptions).values({
          organizationId: practiceId,
          plan,
          status: 'active',
          soapNotesUsed: 0,
          soapNotesLimit: plan === 'pro' ? 100 : plan === 'enterprise' ? 1000 : 10,
        });
      }

      return NextResponse.json({ success: true });

    } else if (action === 'rotate_key') {
      const { practiceId } = body;
      if (!practiceId) {
        return NextResponse.json({ error: 'practiceId is required' }, { status: 400 });
      }

      // Rotate key logic
      const keyObj = await db
        .select()
        .from(encryptionKeys)
        .where(eq(encryptionKeys.organizationId, practiceId))
        .limit(1);

      if (keyObj.length > 0) {
        const nextVersion = (keyObj[0].keyVersion || 1) + 1;
        await db
          .update(encryptionKeys)
          .set({
            keyVersion: nextVersion,
            rotatedAt: new Date(),
          })
          .where(eq(encryptionKeys.organizationId, practiceId));
      } else {
        await db.insert(encryptionKeys).values({
          organizationId: practiceId,
          keyVersion: 1,
          algorithm: 'AES-256-GCM',
        });
      }

      return NextResponse.json({ success: true });

    } else if (action === 'toggle_active') {
      const { practiceId, active } = body;
      if (!practiceId) {
        return NextResponse.json({ error: 'practiceId is required' }, { status: 400 });
      }

      await db
        .update(organizations)
        .set({
          deletedAt: active ? null : new Date(),
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, practiceId));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin POST action error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
