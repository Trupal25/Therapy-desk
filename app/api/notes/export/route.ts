import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth-helper';
import { withRls } from '../../../../lib/db-helper';
import { soapNotes } from '../../../../db/schema/soap_notes';
import { sessions } from '../../../../db/schema/sessions';
import { clients } from '../../../../db/schema/clients';
import { sessionNotes } from '../../../../db/schema/session_notes';
import { decrypt } from '../../../../lib/crypto';
import { eq, and, gte, lte } from 'drizzle-orm';
import { sanitizeError } from '../../../../lib/error-helper';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { startDate, endDate, status } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Date range is required" }, { status: 400 });
    }

    const orgId = session.organizationId;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const notes = await withRls(orgId, async (tx) => {
      const results = await tx
        .select({
          soapNoteId: soapNotes.id,
          sessionId: soapNotes.sessionId,
          subjectiveEnc: soapNotes.subjectiveEnc,
          objectiveEnc: soapNotes.objectiveEnc,
          assessmentEnc: soapNotes.assessmentEnc,
          planEnc: soapNotes.planEnc,
          status: soapNotes.status,
          signedAt: soapNotes.signedAt,
          createdAt: soapNotes.createdAt,
          sessionScheduledAt: sessions.scheduledAt,
          sessionType: sessions.sessionType,
          clientId: sessions.clientId,
          clientFirstNameEnc: clients.firstNameEnc,
          clientLastNameEnc: clients.lastNameEnc,
        })
        .from(soapNotes)
        .innerJoin(sessions, eq(soapNotes.sessionId, sessions.id))
        .innerJoin(clients, eq(sessions.clientId, clients.id))
        .where(
          and(
            eq(soapNotes.organizationId, orgId),
            gte(soapNotes.createdAt, start),
            lte(soapNotes.createdAt, end),
            status ? eq(soapNotes.status, status) : eq(soapNotes.status, "signed")
          )
        );

      return results;
    });

    // Decrypt and format notes
    const exportData = notes.map((n: any) => {
      const firstName = decrypt(n.clientFirstNameEnc, orgId);
      const lastName = decrypt(n.clientLastNameEnc, orgId);
      const subjective = decrypt(n.subjectiveEnc, orgId);
      const objective = decrypt(n.objectiveEnc, orgId);
      const assessment = decrypt(n.assessmentEnc, orgId);
      const plan = decrypt(n.planEnc, orgId);

      const sessionDate = n.sessionScheduledAt
        ? new Date(n.sessionScheduledAt).toISOString().split("T")[0]
        : "unknown-date";

      return {
        id: n.soapNoteId,
        clientName: firstName + " " + lastName,
        sessionDate,
        sessionType: n.sessionType,
        status: n.status,
        signedAt: n.signedAt ? new Date(n.signedAt).toISOString() : null,
        subjective,
        objective,
        assessment,
        plan,
        fileName: firstName + "_" + lastName + "_" + sessionDate + ".txt",
        htmlContent: generateSoapHtml(firstName + " " + lastName, sessionDate, n.sessionType, subjective, objective, assessment, plan, n.signedAt),
      };
    });

    return NextResponse.json({
      success: true,
      count: exportData.length,
      notes: exportData,
    });
  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json({ error: sanitizeError(err, "Failed to export notes") }, { status: 500 });
  }
}

function generateSoapHtml(
  clientName: string,
  sessionDate: string,
  sessionType: string,
  subjective: string,
  objective: string,
  assessment: string,
  plan: string,
  signedAt: Date | null
): string {
  const signedDate = signedAt ? new Date(signedAt).toLocaleDateString() : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SOAP Note - ${clientName} - ${sessionDate}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a18; }
    h1 { font-size: 24px; font-weight: normal; border-bottom: 2px solid #2d6a4f; padding-bottom: 8px; }
    h2 { font-size: 14px; font-weight: bold; color: #2d6a4f; margin-top: 24px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta { font-size: 12px; color: #6b6762; margin-bottom: 24px; }
    .section { margin-bottom: 16px; }
    .content { font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2ded9; font-size: 11px; color: #6b6762; }
  </style>
</head>
<body>
  <h1>Clinical SOAP Note</h1>
  <div class="meta">
    <strong>Patient:</strong> ${clientName} &nbsp;|&nbsp;
    <strong>Date:</strong> ${sessionDate} &nbsp;|&nbsp;
    <strong>Type:</strong> ${sessionType}
    ${signedDate ? " &nbsp;|&nbsp; <strong>Signed:</strong> " + signedDate : ""}
  </div>

  <div class="section">
    <h2>Subjective</h2>
    <div class="content">${escapeHtml(subjective)}</div>
  </div>

  <div class="section">
    <h2>Objective</h2>
    <div class="content">${escapeHtml(objective)}</div>
  </div>

  <div class="section">
    <h2>Assessment</h2>
    <div class="content">${escapeHtml(assessment)}</div>
  </div>

  <div class="section">
    <h2>Plan</h2>
    <div class="content">${escapeHtml(plan)}</div>
  </div>

  <div class="footer">
    Generated by TherapyDesk &nbsp;|&nbsp; This is a certified clinical record.
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}
