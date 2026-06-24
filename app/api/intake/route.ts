import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth-helper';
import { withRls } from '../../../lib/db-helper';
import { clients } from '../../../db/schema/clients';
import { eq, and } from 'drizzle-orm';
import { createHmac } from 'crypto';

const INTAKE_SECRET = process.env.INTAKE_TOKEN_SECRET || process.env.ENCRYPTION_KEY || 'default-intake-secret';

function generateIntakeToken(clientId: string, orgId: string): string {
  return createHmac('sha256', INTAKE_SECRET)
    .update(clientId + ':' + orgId)
    .digest('hex')
    .substring(0, 32);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    const orgId = session.organizationId;

    // Verify client belongs to this org
    const clientCheck = await withRls(orgId, async (tx) => {
      const [client] = await tx
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.id, clientId),
            eq(clients.organizationId, orgId)
          )
        )
        .limit(1);
      return client;
    });

    if (!clientCheck) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const token = generateIntakeToken(clientId, orgId);
    const intakeUrl = request.headers.get("origin") + "/intake/" + token;

    return NextResponse.json({
      success: true,
      token,
      url: intakeUrl,
    });
  } catch (err: any) {
    console.error("Intake token error:", err);
    return NextResponse.json({ error: "Failed to generate intake link" }, { status: 500 });
  }
}
