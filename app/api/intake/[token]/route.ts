import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { clients } from '../../../../db/schema/clients';
import { clientConsents } from '../../../../db/schema/client_consents';
import { organizations } from '../../../../db/schema/organizations';
import { decrypt } from '../../../../lib/crypto';
import { eq, and } from 'drizzle-orm';
import { createHmac } from 'crypto';

const INTAKE_SECRET = process.env.INTAKE_TOKEN_SECRET || process.env.ENCRYPTION_KEY || 'default-intake-secret';

function generateIntakeToken(clientId: string, orgId: string): string {
  return createHmac('sha256', INTAKE_SECRET)
    .update(clientId + ':' + orgId)
    .digest('hex')
    .substring(0, 32);
}

function verifyIntakeToken(token: string, clientId: string, orgId: string): boolean {
  const expected = generateIntakeToken(clientId, orgId);
  return token === expected;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find client by matching token
    const allClients = await db
      .select({
        id: clients.id,
        organizationId: clients.organizationId,
        firstNameEnc: clients.firstNameEnc,
        lastNameEnc: clients.lastNameEnc,
        emailEnc: clients.emailEnc,
        phoneEnc: clients.phoneEnc,
        gender: clients.gender,
        pronouns: clients.pronouns,
        diagnosisCodes: clients.diagnosisCodes,
        referralSource: clients.referralSource,
      })
      .from(clients)
      .where(eq(clients.isActive, true));

    let matchedClient: typeof allClients[0] | null = null;
    for (const c of allClients) {
      if (verifyIntakeToken(token, c.id, c.organizationId)) {
        matchedClient = c;
        break;
      }
    }

    if (!matchedClient) {
      return NextResponse.json({ error: "Invalid or expired intake link" }, { status: 404 });
    }

    // Get org name
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, matchedClient.organizationId))
      .limit(1);

    // Decrypt client info
    const firstName = decrypt(matchedClient.firstNameEnc, matchedClient.organizationId);
    const lastName = decrypt(matchedClient.lastNameEnc, matchedClient.organizationId);

    return NextResponse.json({
      valid: true,
      client: {
        firstName,
        lastName,
        gender: matchedClient.gender,
        pronouns: matchedClient.pronouns,
        diagnosisCodes: matchedClient.diagnosisCodes,
      },
      practice: {
        name: org?.name || "Therapy Practice",
      },
    });
  } catch (err: any) {
    console.error("Intake form error:", err);
    return NextResponse.json({ error: "Failed to load intake form" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const {
      email,
      phone,
      dateOfBirth,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      insuranceProvider,
      insurancePolicyNumber,
      presentingConcerns,
      treatmentHistory,
      currentMedications,
      consentTreatment,
      consentHipaa,
      consentTelehealth,
    } = body;

    // Find client by matching token
    const allClients = await db
      .select()
      .from(clients)
      .where(eq(clients.isActive, true));

    let matchedClient: typeof allClients[0] | null = null;
    for (const c of allClients) {
      if (verifyIntakeToken(token, c.id, c.organizationId)) {
        matchedClient = c;
        break;
      }
    }

    if (!matchedClient) {
      return NextResponse.json({ error: "Invalid or expired intake link" }, { status: 404 });
    }

    const orgId = matchedClient.organizationId;
    const clientId = matchedClient.id;

    // Update client record with submitted info
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (email) {
      const { encrypt: enc } = await import("../../../../lib/crypto");
      updateData.emailEnc = enc(email, orgId);
    }
    if (phone) {
      const { encrypt: enc } = await import("../../../../lib/crypto");
      updateData.phoneEnc = enc(phone, orgId);
    }
    if (emergencyContactName || emergencyContactPhone) {
      const { encrypt: enc } = await import("../../../../lib/crypto");
      updateData.emergencyContactEnc = enc(JSON.stringify({
        name: emergencyContactName,
        phone: emergencyContactPhone,
        relation: emergencyContactRelation,
      }), orgId);
    }
    if (insuranceProvider || insurancePolicyNumber) {
      const { encrypt: enc } = await import("../../../../lib/crypto");
      updateData.insuranceInfoEnc = enc(JSON.stringify({
        provider: insuranceProvider,
        policyNumber: insurancePolicyNumber,
      }), orgId);
    }

    await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, clientId));

    // Record consents
    const consentTypes = [];
    if (consentTreatment) consentTypes.push("treatment");
    if (consentHipaa) consentTypes.push("hipaa_notice");
    if (consentTelehealth) consentTypes.push("telehealth");

    for (const consentType of consentTypes) {
      await db
        .insert(clientConsents)
        .values({
          clientId,
          organizationId: orgId,
          consentType: consentType as any,
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        })
        .onConflictDoNothing();
    }

    return NextResponse.json({
      success: true,
      message: "Intake form submitted successfully",
    });
  } catch (err: any) {
    console.error("Intake submission error:", err);
    return NextResponse.json({ error: "Failed to submit intake form" }, { status: 500 });
  }
}
