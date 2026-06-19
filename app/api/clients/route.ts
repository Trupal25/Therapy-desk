import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth-helper';
import { withRls } from '../../../lib/db-helper';
import { logAuditEvent } from '../../../lib/audit-helper';
import { clients } from '../../../db/schema/clients';
import {
  encrypt,
  decrypt,
  encryptNullable,
  decryptNullable,
  clientSearchHash,
} from '../../../lib/crypto';
import { eq, and, isNull } from 'drizzle-orm';
import { sanitizeError } from '../../../lib/error-helper';

// GET /api/clients — Retrieve all active clients (decrypted)
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await withRls(session.organizationId, async (tx) => {
      // Fetch active clients (deletedAt is null)
      const list = await tx
        .select()
        .from(clients)
        .where(
          and(
            isNull(clients.deletedAt),
            eq(clients.organizationId, session.organizationId)
          )
        );

      // Decrypt client records
      const decryptedList = list.map((c: any) => {
        let emergencyContact = null;
        let insuranceInfo = null;

        try {
          if (c.emergencyContactEnc) {
            emergencyContact = JSON.parse(decrypt(c.emergencyContactEnc, session.organizationId));
          }
        } catch (e) {
          console.error('Failed to decrypt emergency contact', e);
        }

        try {
          if (c.insuranceInfoEnc) {
            insuranceInfo = JSON.parse(decrypt(c.insuranceInfoEnc, session.organizationId));
          }
        } catch (e) {
          console.error('Failed to decrypt insurance info', e);
        }

        return {
          id: c.id,
          assignedTherapistId: c.assignedTherapistId,
          mrn: decryptNullable(c.mrn, session.organizationId),
          firstName: decrypt(c.firstNameEnc, session.organizationId),
          lastName: decrypt(c.lastNameEnc, session.organizationId),
          dateOfBirth: decrypt(c.dateOfBirthEnc, session.organizationId),
          email: decryptNullable(c.emailEnc, session.organizationId),
          phone: decryptNullable(c.phoneEnc, session.organizationId),
          gender: c.gender,
          pronouns: c.pronouns,
          diagnosisCodes: c.diagnosisCodes,
          referralSource: c.referralSource,
          emergencyContact,
          insuranceInfo,
          isActive: c.isActive,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        };
      });

      // Write Read Audit Event
      await logAuditEvent(tx, {
        organizationId: session.organizationId,
        actorId: session.userId,
        eventType: 'read',
        resourceType: 'client',
        resourceId: null, // read list
        metadata: { count: list.length },
        req: request,
      });

      return decryptedList;
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Fetch clients error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Failed to fetch clients') }, { status: 500 });
  }
}

// POST /api/clients — Create a new client (encrypt data and index search hash)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      gender,
      pronouns,
      diagnosisCodes,
      referralSource,
      emergencyContact,
      insuranceInfo,
      assignedTherapistId,
      mrn,
    } = body;

    if (!firstName || !lastName || !dateOfBirth) {
      return NextResponse.json(
        { error: 'First name, last name, and date of birth are required' },
        { status: 400 }
      );
    }

    const orgId = session.organizationId;

    // Encrypt fields
    const firstNameEnc = encrypt(firstName.trim(), orgId);
    const lastNameEnc = encrypt(lastName.trim(), orgId);
    const dateOfBirthEnc = encrypt(dateOfBirth.trim(), orgId);
    const emailEnc = encryptNullable(email?.trim() || null, orgId);
    const phoneEnc = encryptNullable(phone?.trim() || null, orgId);
    const mrnEnc = encryptNullable(mrn?.trim() || null, orgId);

    const emergencyContactEnc = emergencyContact
      ? encrypt(JSON.stringify(emergencyContact), orgId)
      : null;
    const insuranceInfoEnc = insuranceInfo ? encrypt(JSON.stringify(insuranceInfo), orgId) : null;

    // Generate searchable deterministic index hash
    const searchHash = clientSearchHash(firstName.trim(), lastName.trim(), dateOfBirth.trim(), orgId);

    const newClientData = await withRls(orgId, async (tx) => {
      const [inserted] = await tx
        .insert(clients)
        .values({
          organizationId: orgId,
          assignedTherapistId: assignedTherapistId || session.userId,
          firstNameEnc,
          lastNameEnc,
          dateOfBirthEnc,
          emailEnc,
          phoneEnc,
          mrn: mrnEnc,
          gender: gender || null,
          pronouns: pronouns || null,
          diagnosisCodes: diagnosisCodes || [],
          referralSource: referralSource || null,
          emergencyContactEnc,
          insuranceInfoEnc,
          searchHash,
          keyVersion: 1,
          isActive: true,
        })
        .returning();

      // Log Create Audit Event
      await logAuditEvent(tx, {
        organizationId: orgId,
        actorId: session.userId,
        eventType: 'create',
        resourceType: 'client',
        resourceId: inserted.id,
        req: request,
      });

      return {
        id: inserted.id,
        firstName,
        lastName,
        dateOfBirth,
        isActive: inserted.isActive,
      };
    });

    return NextResponse.json(newClientData);
  } catch (err: any) {
    console.error('Create client error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Failed to create client') }, { status: 500 });
  }
}

// PUT /api/clients — Update an existing client (encrypt data and index search hash)
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      referralSource,
    } = body;

    if (!id || !firstName || !lastName || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Client ID, first name, last name, and date of birth are required' },
        { status: 400 }
      );
    }

    const orgId = session.organizationId;

    // Encrypt fields
    const firstNameEnc = encrypt(firstName.trim(), orgId);
    const lastNameEnc = encrypt(lastName.trim(), orgId);
    const dateOfBirthEnc = encrypt(dateOfBirth.trim(), orgId);
    const referralSourceEnc = referralSource?.trim() || null;

    // Generate searchable deterministic index hash
    const searchHash = clientSearchHash(firstName.trim(), lastName.trim(), dateOfBirth.trim(), orgId);

    const updatedClientData = await withRls(orgId, async (tx) => {
      const [updated] = await tx
        .update(clients)
        .set({
          firstNameEnc,
          lastNameEnc,
          dateOfBirthEnc,
          gender: gender || null,
          referralSource: referralSourceEnc,
          searchHash,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(clients.id, id),
            eq(clients.organizationId, orgId)
          )
        )
        .returning();

      if (!updated) {
        throw new Error('Client not found or access denied');
      }

      // Log Update Audit Event
      await logAuditEvent(tx, {
        organizationId: orgId,
        actorId: session.userId,
        eventType: 'update',
        resourceType: 'client',
        resourceId: updated.id,
        req: request,
      });

      return {
        id: updated.id,
        firstName,
        lastName,
        dateOfBirth,
        isActive: updated.isActive,
      };
    });

    return NextResponse.json(updatedClientData);
  } catch (err: any) {
    console.error('Update client error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Failed to update client') }, { status: 500 });
  }
}

