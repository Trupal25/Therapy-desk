import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { withRls } from '../../../lib/db-helper';
import { sessions } from '../../../db/schema/sessions';
import { clients } from '../../../db/schema/clients';
import { organizations } from '../../../db/schema/organizations';
import { decrypt } from '../../../lib/crypto';
import { eq, and, gte, lte } from 'drizzle-orm';
import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== "Bearer " + (process.env.CRON_SECRET || "therapydesk-cron")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find all organizations
    const orgs = await db.select().from(organizations).where(eq(organizations.plan, "pro"));

    let totalSent = 0;
    let totalFailed = 0;

    for (const org of orgs) {
      const upcomingSessions = await withRls(org.id, async (tx) => {
        const results = await tx
          .select()
          .from(sessions)
          .where(
            and(
              eq(sessions.organizationId, org.id),
              eq(sessions.status, "scheduled"),
              gte(sessions.scheduledAt, now),
              lte(sessions.scheduledAt, tomorrow)
            )
          );
        return results;
      });

      for (const sess of upcomingSessions) {
        const clientData = await withRls(org.id, async (tx) => {
          const [client] = await tx
            .select()
            .from(clients)
            .where(eq(clients.id, sess.clientId))
            .limit(1);
          return client;
        });

        if (!clientData || !clientData.emailEnc) continue;

        let email: string;
        try {
          email = decrypt(clientData.emailEnc, org.id);
        } catch {
          continue;
        }
        if (!email || !email.includes("@")) continue;

        const firstName = decrypt(clientData.firstNameEnc, org.id);
        const sessionDate = new Date(sess.scheduledAt).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });
        const sessionTime = new Date(sess.scheduledAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        const modality = sess.modality === "in_person" ? "In-Person" : sess.modality === "telehealth" ? "Video/Telehealth" : "Phone";

        const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><style>" +
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
          "<div class=\"header\"><h1>" + org.name + "</h1></div>" +
          "<div class=\"content\">" +
          "<p>Hi " + firstName + ",</p>" +
          "<p>This is a friendly reminder about your upcoming therapy session.</p>" +
          "<div class=\"detail\"><div class=\"detail-label\">Date</div><div class=\"detail-value\">" + sessionDate + "</div></div>" +
          "<div class=\"detail\"><div class=\"detail-label\">Time</div><div class=\"detail-value\">" + sessionTime + "</div></div>" +
          "<div class=\"detail\"><div class=\"detail-label\">Format</div><div class=\"detail-value\">" + modality + "</div></div>" +
          "<p style=\"margin-top: 20px; font-size: 13px; color: #6b6762;\">If you need to reschedule, please contact us as soon as possible.</p>" +
          "</div>" +
          "<div class=\"footer\">Sent by " + org.name + " via TherapyDesk</div>" +
          "</div></body></html>";

        try {
          await resend.emails.send({
            from: process.env.FROM_EMAIL || "reminders@therapydesk.in",
            to: email,
            subject: "Reminder: Your session on " + sessionDate,
            html,
          });
          totalSent++;
        } catch {
          totalFailed++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: totalSent + totalFailed,
      sent: totalSent,
      failed: totalFailed,
    });
  } catch (err: any) {
    console.error("Cron reminder error:", err);
    return NextResponse.json({ error: "Failed to process reminders" }, { status: 500 });
  }
}
