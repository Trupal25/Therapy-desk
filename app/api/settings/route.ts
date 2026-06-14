import { NextResponse } from 'next/server';
import { getSession, setSession, hashPassword } from '../../../lib/auth-helper';
import { withRls } from '../../../lib/db-helper';
import { logAuditEvent } from '../../../lib/audit-helper';
import { users } from '../../../db/schema/users';
import { eq, and } from 'drizzle-orm';
import { sanitizeError } from '../../../lib/error-helper';

// POST /api/settings — Update profile details or change password
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, fullName, specialization, currentPassword, newPassword } = body;

    const orgId = session.organizationId;
    const userId = session.userId;

    if (action === 'profile') {
      if (!fullName) {
        return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
      }

      const updatedUser = await withRls(orgId, async (tx) => {
        const specs = specialization ? [specialization] : [];
        const [updated] = await tx
          .update(users)
          .set({
            fullName,
            specializations: specs,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(users.id, userId),
              eq(users.organizationId, orgId)
            )
          )
          .returning();

        await logAuditEvent(tx, {
          organizationId: orgId,
          actorId: userId,
          eventType: 'update',
          resourceType: 'user',
          resourceId: userId,
          metadata: { field: 'profile' },
          req: request,
        });

        return updated;
      });

      // Update session data
      await setSession({
        ...session,
        fullName: updatedUser.fullName,
      });

      return NextResponse.json({ success: true, user: updatedUser });

    } else if (action === 'password') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      const result = await withRls(orgId, async (tx) => {
        const found = await tx
          .select()
          .from(users)
          .where(
            and(
              eq(users.id, userId),
              eq(users.organizationId, orgId)
            )
          )
          .limit(1);

        if (found.length === 0) {
          throw new Error('User not found');
        }

        const user = found[0];
        if (hashPassword(currentPassword) !== user.passwordHash) {
          throw new Error('Current password is incorrect');
        }

        await tx
          .update(users)
          .set({
            passwordHash: hashPassword(newPassword),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(users.id, userId),
              eq(users.organizationId, orgId)
            )
          );

        await logAuditEvent(tx, {
          organizationId: orgId,
          actorId: userId,
          eventType: 'update',
          resourceType: 'user',
          resourceId: userId,
          metadata: { field: 'password' },
          req: request,
        });

        return { success: true };
      });

      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Settings update error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Failed to update settings') }, { status: 500 });
  }
}
