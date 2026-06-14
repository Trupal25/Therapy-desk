import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth-helper';
import { withRls } from '../../../../lib/db-helper';
import { logAuditEvent } from '../../../../lib/audit-helper';
import { soapNotes } from '../../../../db/schema/soap_notes';
import { eq, and } from 'drizzle-orm';
import { sanitizeError } from '../../../../lib/error-helper';

// POST /api/notes/sign — Sign and lock a SOAP note
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { soapNoteId } = body;

    if (!soapNoteId) {
      return NextResponse.json({ error: 'SOAP Note ID is required' }, { status: 400 });
    }

    const orgId = session.organizationId;

    const updated = await withRls(orgId, async (tx) => {
      // 1. Fetch note to verify existence
      const existing = await tx
        .select()
        .from(soapNotes)
        .where(
          and(
            eq(soapNotes.id, soapNoteId),
            eq(soapNotes.organizationId, orgId)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new Error('SOAP note not found');
      }

      const note = existing[0];
      if (note.status === 'signed') {
        throw new Error('SOAP note is already signed and locked');
      }

      // 2. Sign and lock
      const [signed] = await tx
        .update(soapNotes)
        .set({
          status: 'signed',
          signedAt: new Date(),
          signedBy: session.userId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(soapNotes.id, soapNoteId),
            eq(soapNotes.organizationId, orgId)
          )
        )
        .returning();

      // 3. Log Audit Event
      await logAuditEvent(tx, {
        organizationId: orgId,
        actorId: session.userId,
        eventType: 'update',
        resourceType: 'soap_note',
        resourceId: soapNoteId,
        metadata: { status: 'signed', action: 'signature_lock' },
        req: request,
      });

      return signed;
    });

    return NextResponse.json({ success: true, soapNote: updated });
  } catch (err: any) {
    console.error('Sign note error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Failed to sign SOAP note') }, { status: 500 });
  }
}
