import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth-helper';
import { withRls } from '../../../../lib/db-helper';
import { logAuditEvent } from '../../../../lib/audit-helper';
import { sessions } from '../../../../db/schema/sessions';
import { clients } from '../../../../db/schema/clients';
import { decrypt } from '../../../../lib/crypto';
import { eq, and, gte, lte } from 'drizzle-orm';
import { sanitizeError } from '../../../../lib/error-helper';
import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function generateReminderEmail(
  clientName: string,
  therapistName: string,
  sessionDate: string,
  sessionTime: string,
  modality: string,
  practiceName: string
): { subject: string; html: string } {
  const modalityLabel = modality === "in_person" ? "In-Person" : modality === "telehealth" ? "Telehealth/Video" : "Phone";

  return {
    subject: "Reminder: Upcoming Session on " + sessionDate,
    html: "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><style>" +
      "body { font-family: -apple-system, sans-serif; background: #fafaf8; color: #1a1a18; padding: 40px 20px; }" +
      ".container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2ded9; }" +
      ".header { background: #2d6a4f; color: white; padding: 24px; text-align: center; }" +
      ".header h1 { margin: 0; font-size: 20px; font-weight: 600; }" +
      ".content { padding: 24px; }" +
      ".detail { margin: 12px 0; padding: 12px; background: #fafaf8; border-radius: 8px; }" +
      ".detail-label { font-size: 11px; font-weight: 700; color: #6b6762; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }" +
      ".detail-value { font-size: 14px; font-weight: 500; }" +
      ".footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #6b6762; border-top: 1px solid #e2ded9; }" +
      "</style></head><body>" +
      "<div class=\"container\">" +
      "<div class=\"header\"><h1>" + practiceName + "</h1></div>" +
      "<div class=\"content\">" +
      "<p>Hi " + clientName + ",</p>" +
      "<p>This is a friendly reminder about your upcoming therapy session.</p>" +
      "<div class=\"detail\"><div class=\"detail-label\">Date</div><div class=\"detail-value\">" + sessionDate + "</div></div>" +
      "<div class=\"detail\"><div class=\"detail-label\">Time</div><div class=\"detail-value\">" + sessionTime + "</div></div>" +
      "<div class=\"detail\"><div class=\"detail-label\">Format</div><div class=\"detail-value\">" + modalityLabel + "</div></div>" +
      "<div class=\"detail\"><div class=\"detail-label\">Therapist</div><div class=\"detail-value\">" + therapistName + "</div></div>" +
      "<p style=\"margin-top: 20px; font-size: 13px; color: #6b6762;\">If you need to reschedule, please contact us as soon as possible.</p>" +
      "</div>" +
      "<div class=\"footer\">Sent by " + practiceName + " via TherapyDesk</div>" +
      "</div></body></html>",
  };
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, sessionIds, sendToAll } = body;

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({
        error: "Email service not configured. Set RESEND_API_KEY environment variable.",
      }, { status: 503 });
    }

    const orgId = session.organizationId;
    const fromEmail = process.env.FROM_EMAIL || "reminders@therapydesk.in";

    let targetSessionIds: string[] = [];
    if (sendToAll) {
      // Find all upcoming sessions within next 48 hours
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const upcoming = await withRls(orgId, async (tx) => {
        const results = await tx
          .select({ id: sessions.id })
          .from(sessions)
          .where(
            and(
              eq(sessions.organizationId, orgId),
              eq(sessions.status, "scheduled"),
              gte(sessions.scheduledAt, now),
              lte(sessions.scheduledAt, tomorrow)
            )
          );
        return results;
      });
      targetSessionIds = upcoming.map((s: any) => s.id);
    } else if (sessionIds) {
      targetSessionIds = sessionIds;
    } else if (sessionId) {
      targetSessionIds = [sessionId];
    }

    if (targetSessionIds.length === 0) {
      return NextResponse.json({ error: "No sessions found to send reminders for" }, { status: 404 });
    }

    const results = [];

    for (const sessId of targetSessionIds) {
      const sessData = await withRls(orgId, async (tx) => {
        const [sess] = await tx
          .select()
          .from(sessions)
          .where(
            and(
              eq(sessions.id, sessId),
              eq(sessions.organizationId, orgId)
            )
          )
          .limit(1);

        if (!sess) return null;

        const [client] = await tx
          .select()
          .from(clients)
          .where(eq(clients.id, sess.clientId))
          .limit(1);

        return { session: sess, client };
      });

      if (!sessData || !sessData.client) continue;

      const clientEmailEnc = sessData.client.emailEnc;
      if (!clientEmailEnc) continue;

      let clientEmail: string;
      try {
        clientEmail = decrypt(clientEmailEnc, orgId);
      } catch {
        continue;
      }

      if (!clientEmail || !clientEmail.includes("@")) continue;

      const clientName = decrypt(sessData.client.firstNameEnc, orgId) + " " + decrypt(sessData.client.lastNameEnc, orgId);
      const sessionDate = new Date(sessData.session.scheduledAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const sessionTime = new Date(sessData.session.scheduledAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      const email = generateReminderEmail(
        clientName.split(" ")[0],
        "Your Therapist",
        sessionDate,
        sessionTime,
        sessData.session.modality,
        "TherapyDesk Practice"
      );

      try {
        await resend.emails.send({
          from: fromEmail,
          to: clientEmail,
          subject: email.subject,
          html: email.html,
        });

        await withRls(orgId, async (tx) => {
          await logAuditEvent(tx, {
            organizationId: orgId,
            actorId: session.userId,
            eventType: "create",
            resourceType: "session",
            resourceId: sessId,
            metadata: { action: "reminder_sent", email: clientEmail },
            req: request,
          });
        });

        results.push({ sessionId: sessId, status: "sent" });
      } catch (emailErr) {
        console.error("Failed to send email to", clientEmail, emailErr);
        results.push({ sessionId: sessId, status: "failed" });
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    });
  } catch (err: any) {
    console.error("Reminder error:", err);
    return NextResponse.json({ error: sanitizeError(err, "Failed to send reminders") }, { status: 500 });
  }
}
