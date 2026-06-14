import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth-helper';
import { withRls } from '../../../lib/db-helper';
import { logAuditEvent } from '../../../lib/audit-helper';
import { sessions } from '../../../db/schema/sessions';
import { clients } from '../../../db/schema/clients';
import { soapNotes } from '../../../db/schema/soap_notes';
import { decrypt } from '../../../lib/crypto';
import { eq, and, isNull } from 'drizzle-orm';
import { sanitizeError } from '../../../lib/error-helper';

// GET /api/sessions — Retrieve scheduled/completed sessions (joined with patient names)
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await withRls(session.organizationId, async (tx) => {
      const list = await tx
        .select({
          session: sessions,
          client: {
            id: clients.id,
            firstNameEnc: clients.firstNameEnc,
            lastNameEnc: clients.lastNameEnc,
          },
          soapNote: {
            id: soapNotes.id,
            status: soapNotes.status,
          },
        })
        .from(sessions)
        .innerJoin(clients, eq(sessions.clientId, clients.id))
        .leftJoin(soapNotes, eq(sessions.id, soapNotes.sessionId))
        .where(eq(sessions.organizationId, session.organizationId));

      const decryptedList = list.map((item: any) => {
        let clientName = 'Unknown';
        try {
          const first = decrypt(item.client.firstNameEnc, session.organizationId);
          const last = decrypt(item.client.lastNameEnc, session.organizationId);
          clientName = `${first} ${last}`;
        } catch (e) {
          console.error('Failed to decrypt client name for session:', e);
        }

        return {
          ...item.session,
          clientName,
          soapNote: item.soapNote?.id ? {
            id: item.soapNote.id,
            status: item.soapNote.status,
          } : null,
        };
      });

      // Log Read Audit Event
      await logAuditEvent(tx, {
        organizationId: session.organizationId,
        actorId: session.userId,
        eventType: 'read',
        resourceType: 'session',
        resourceId: null,
        metadata: { count: list.length },
        req: request,
      });

      return decryptedList;
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Fetch sessions error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Failed to fetch sessions') }, { status: 500 });
  }
}

// POST /api/sessions — Book a new appointment
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      clientId,
      sessionType,
      modality,
      scheduledAt,
      durationMinutes,
      cptCode,
    } = body;

    if (!clientId || !scheduledAt) {
      return NextResponse.json(
        { error: 'Client ID and scheduled time are required' },
        { status: 400 }
      );
    }

    const orgId = session.organizationId;

    const newSession = await withRls(orgId, async (tx) => {
      const [inserted] = await tx
        .insert(sessions)
        .values({
          organizationId: orgId,
          clientId: clientId,
          therapistId: session.userId,
          sessionType: sessionType || 'individual',
          modality: modality || 'in_person',
          status: 'scheduled',
          scheduledAt: new Date(scheduledAt),
          durationMinutes: durationMinutes ? parseInt(durationMinutes) : 50,
          cptCode: cptCode || null,
          keyVersion: 1,
        })
        .returning();

      // Log Create Audit Event
      await logAuditEvent(tx, {
        organizationId: orgId,
        actorId: session.userId,
        eventType: 'create',
        resourceType: 'session',
        resourceId: inserted.id,
        req: request,
      });

      return inserted;
    });

    return NextResponse.json(newSession);
  } catch (err: any) {
    console.error('Create session error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Failed to create session') }, { status: 500 });
  }
}
