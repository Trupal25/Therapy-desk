import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth-helper';
import { withRls } from '../../../../lib/db-helper';
import { logAuditEvent } from '../../../../lib/audit-helper';
import { clients } from '../../../../db/schema/clients';
import { sessions, type Session } from '../../../../db/schema/sessions';
import { soapNotes } from '../../../../db/schema/soap_notes';
import { sessionNotes } from '../../../../db/schema/session_notes';
import { decrypt, decryptNullable } from '../../../../lib/crypto';
import { eq, and, desc } from 'drizzle-orm';
import { sanitizeError } from '../../../../lib/error-helper';

// GET /api/clients/[id] — Retrieve full patient profile with sessions and notes history
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
  }

  const orgId = session.organizationId;

  try {
    const data = await withRls(orgId, async (tx) => {
      // Fetch client
      const clientList = await tx
        .select()
        .from(clients)
        .where(and(eq(clients.id, id), eq(clients.organizationId, orgId)))
        .limit(1);

      if (clientList.length === 0) {
        return null;
      }

      const client = clientList[0];

      // Decrypt client fields
      let emergencyContact = null;
      let insuranceInfo = null;

      try {
        if (client.emergencyContactEnc) {
          emergencyContact = JSON.parse(decrypt(client.emergencyContactEnc, orgId));
        }
      } catch (e) {
        console.error('Failed to decrypt emergency contact', e);
      }

      try {
        if (client.insuranceInfoEnc) {
          insuranceInfo = JSON.parse(decrypt(client.insuranceInfoEnc, orgId));
        }
      } catch (e) {
        console.error('Failed to decrypt insurance info', e);
      }

      const clientData = {
        id: client.id,
        assignedTherapistId: client.assignedTherapistId,
        mrn: decryptNullable(client.mrn, orgId),
        firstName: decrypt(client.firstNameEnc, orgId),
        lastName: decrypt(client.lastNameEnc, orgId),
        dateOfBirth: decrypt(client.dateOfBirthEnc, orgId),
        email: decryptNullable(client.emailEnc, orgId),
        phone: decryptNullable(client.phoneEnc, orgId),
        gender: client.gender,
        pronouns: client.pronouns,
        diagnosisCodes: client.diagnosisCodes,
        referralSource: client.referralSource,
        emergencyContact,
        insuranceInfo,
        isActive: client.isActive,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      };

      // Fetch sessions for this client
      const sessionList = await tx
        .select()
        .from(sessions)
        .where(and(eq(sessions.clientId, id), eq(sessions.organizationId, orgId)))
        .orderBy(desc(sessions.scheduledAt));

      // Fetch SOAP notes and raw notes for each session
      const sessionDetails = await Promise.all(
        sessionList.map(async (s: Session) => {
          const soapList = await tx
            .select()
            .from(soapNotes)
            .where(and(eq(soapNotes.sessionId, s.id), eq(soapNotes.organizationId, orgId)))
            .limit(1);

          const rawList = await tx
            .select()
            .from(sessionNotes)
            .where(and(eq(sessionNotes.sessionId, s.id), eq(sessionNotes.organizationId, orgId)))
            .limit(1);

          let soapNote = null;
          let rawNote = null;

          if (soapList.length > 0) {
            const sn = soapList[0];
            try {
              soapNote = {
                id: sn.id,
                subjective: decrypt(sn.subjectiveEnc, orgId),
                objective: decrypt(sn.objectiveEnc, orgId),
                assessment: decrypt(sn.assessmentEnc, orgId),
                plan: decrypt(sn.planEnc, orgId),
                status: sn.status,
                signedAt: sn.signedAt,
                signedBy: sn.signedBy,
                generationModel: sn.generationModel,
                createdAt: sn.createdAt,
              };
            } catch (e) {
              console.error('Failed to decrypt SOAP note:', e);
            }
          }

          if (rawList.length > 0) {
            const rn = rawList[0];
            try {
              rawNote = {
                id: rn.id,
                content: decrypt(rn.contentEnc, orgId),
                createdAt: rn.createdAt,
                finalizedAt: rn.finalizedAt,
              };
            } catch (e) {
              console.error('Failed to decrypt raw note:', e);
            }
          }

          return {
            ...s,
            soapNote,
            rawNote,
          };
        })
      );

      // Log Read Audit Event
      await logAuditEvent(tx, {
        organizationId: orgId,
        actorId: session.userId,
        eventType: 'read',
        resourceType: 'client',
        resourceId: id,
        metadata: { sessionsCount: sessionList.length },
        req: request,
      });

      return {
        client: clientData,
        sessions: sessionDetails,
      };
    });

    if (!data) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Fetch client detail error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Failed to fetch client details') }, { status: 500 });
  }
}
