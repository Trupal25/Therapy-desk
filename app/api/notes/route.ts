import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth-helper';
import { withRls } from '../../../lib/db-helper';
import { logAuditEvent } from '../../../lib/audit-helper';
import { soapNotes } from '../../../db/schema/soap_notes';
import { sessionNotes } from '../../../db/schema/session_notes';
import { sessions } from '../../../db/schema/sessions';
import { decrypt, decryptNullable } from '../../../lib/crypto';
import { eq, and, isNull } from 'drizzle-orm';
import { sanitizeError } from '../../../lib/error-helper';

// GET /api/notes — Fetch notes history for a client or single session details
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const clientId = searchParams.get('clientId');

  if (!sessionId && !clientId) {
    return NextResponse.json({ error: 'sessionId or clientId is required' }, { status: 400 });
  }

  const orgId = session.organizationId;

  try {
    const data = await withRls(orgId, async (tx) => {
      if (sessionId) {
        const rawList = await tx
          .select()
          .from(sessionNotes)
          .where(
            and(
              eq(sessionNotes.sessionId, sessionId),
              eq(sessionNotes.organizationId, orgId)
            )
          )
          .limit(1);

        const soapList = await tx
          .select()
          .from(soapNotes)
          .where(
            and(
              eq(soapNotes.sessionId, sessionId),
              eq(soapNotes.organizationId, orgId)
            )
          )
          .limit(1);

        const result: Record<string, any> = {
          rawNote: null,
          soapNote: null,
        };

        if (rawList.length > 0) {
          const r = rawList[0];
          result.rawNote = {
            id: r.id,
            content: decrypt(r.contentEnc, orgId),
            createdAt: r.createdAt,
            finalizedAt: r.finalizedAt,
          };
        }

        if (soapList.length > 0) {
          const s = soapList[0];
          result.soapNote = {
            id: s.id,
            subjective: decrypt(s.subjectiveEnc, orgId),
            objective: decrypt(s.objectiveEnc, orgId),
            assessment: decrypt(s.assessmentEnc, orgId),
            plan: decrypt(s.planEnc, orgId),
            status: s.status,
            generationModel: s.generationModel,
            signedAt: s.signedAt,
            signedBy: s.signedBy,
            createdAt: s.createdAt,
          };
        }

        // Log Read Audit Event
        await logAuditEvent(tx, {
          organizationId: orgId,
          actorId: session.userId,
          eventType: 'read',
          resourceType: 'soap_note',
          resourceId: soapList.length > 0 ? soapList[0].id : null,
          metadata: { sessionId },
          req: request,
        });

        return result;
      } else {
        // Fetch all notes history for a specific client
        const history = await tx
          .select({
            session: sessions,
            soap: soapNotes,
            raw: sessionNotes,
          })
          .from(sessions)
          .leftJoin(soapNotes, eq(sessions.id, soapNotes.sessionId))
          .leftJoin(sessionNotes, eq(sessions.id, sessionNotes.sessionId))
          .where(
            and(
              eq(sessions.clientId, clientId!),
              eq(sessions.organizationId, orgId)
            )
          );

        const decryptedHistory = history.map((item: any) => {
          let soapNote = null;
          let rawNote = null;

          if (item.soap) {
            try {
              soapNote = {
                id: item.soap.id,
                subjective: decrypt(item.soap.subjectiveEnc, orgId),
                objective: decrypt(item.soap.objectiveEnc, orgId),
                assessment: decrypt(item.soap.assessmentEnc, orgId),
                plan: decrypt(item.soap.planEnc, orgId),
                status: item.soap.status,
                signedAt: item.soap.signedAt,
                createdAt: item.soap.createdAt,
              };
            } catch (e) {
              console.error('Failed to decrypt soap note in history:', e);
            }
          }

          if (item.raw) {
            try {
              rawNote = {
                id: item.raw.id,
                content: decrypt(item.raw.contentEnc, orgId),
                createdAt: item.raw.createdAt,
              };
            } catch (e) {
              console.error('Failed to decrypt raw note in history:', e);
            }
          }

          return {
            sessionId: item.session.id,
            sessionType: item.session.sessionType,
            modality: item.session.modality,
            status: item.session.status,
            scheduledAt: item.session.scheduledAt,
            soapNote,
            rawNote,
          };
        });

        // Log Read Audit Event
        await logAuditEvent(tx, {
          organizationId: orgId,
          actorId: session.userId,
          eventType: 'read',
          resourceType: 'soap_note',
          resourceId: null,
          metadata: { clientId },
          req: request,
        });

        return decryptedHistory;
      }
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Fetch notes error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Failed to fetch notes') }, { status: 500 });
  }
}
