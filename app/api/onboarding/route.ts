import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth-helper';
import { withRls } from '../../../lib/db-helper';
import { logAuditEvent } from '../../../lib/audit-helper';
import { organizations } from '../../../db/schema/organizations';
import { users } from '../../../db/schema/users';
import { clients } from '../../../db/schema/clients';
import { sessions } from '../../../db/schema/sessions';
import { sessionNotes } from '../../../db/schema/session_notes';
import { soapNotes } from '../../../db/schema/soap_notes';
import { encrypt, clientSearchHash, hmacHash } from '../../../lib/crypto';
import { eq, and } from 'drizzle-orm';
import { sanitizeError } from '../../../lib/error-helper';

const SPECIALIZATIONS = [
  "General", "CBT", "DBT", "Psychodynamic", "Trauma",
  "Anxiety", "Depression", "Child & Adolescent", "Couples",
  "Family", "ACT", "EMDR", "Somatic", "Gestalt",
] as const;

async function seedPracticeData(tx: any, orgId: string, therapistId: string) {
  const clientData = [
    { firstName: "Riya", lastName: "Shah", dob: "1998-01-01", gender: "female", referralSource: "GP referral for panic attacks and social anxiety", diagnoses: ["Anxiety", "Panic Disorder"] },
    { firstName: "Arjun", lastName: "Patel", dob: "1991-01-01", gender: "male", referralSource: "Self-referred for chronic stress and negative self-talk", diagnoses: ["Generalized Anxiety"] },
    { firstName: "Priya", lastName: "Menon", dob: "1984-01-01", gender: "female", referralSource: "OB-GYN referral for post-partum mood concerns", diagnoses: ["Post-Partum Depression"] },
    { firstName: "Aisha", lastName: "Kapoor", dob: "1995-06-15", gender: "female", referralSource: "Online search", diagnoses: ["C-PTSD", "Anxiety"] },
    { firstName: "Vikram", lastName: "Reddy", dob: "1988-11-30", gender: "male", referralSource: "Previous client referral", diagnoses: ["Major Depressive Disorder"] },
  ];

  const seededClients: Array<{ id: string; firstName: string }> = [];
  for (const c of clientData) {
    const firstNameEnc = encrypt(c.firstName, orgId);
    const lastNameEnc = encrypt(c.lastName, orgId);
    const dateOfBirthEnc = encrypt(c.dob, orgId);
    const searchHash = clientSearchHash(c.firstName, c.lastName, c.dob, orgId);

    const [inserted] = await tx
      .insert(clients)
      .values({
        organizationId: orgId,
        assignedTherapistId: therapistId,
        firstNameEnc,
        lastNameEnc,
        dateOfBirthEnc,
        gender: c.gender,
        referralSource: c.referralSource,
        diagnosisCodes: c.diagnoses,
        searchHash,
        keyVersion: 1,
        isActive: true,
      })
      .returning();
    seededClients.push({ id: inserted.id, firstName: c.firstName });
  }

  const now = new Date();

  const sessionsData = [
    { clientIdx: 2, dayOffset: -3, hour: 11, type: "depression", modality: "phone", status: "completed", duration: 50 },
    { clientIdx: 1, dayOffset: -1, hour: 14, type: "cbt", modality: "telehealth", status: "completed", duration: 50 },
    { clientIdx: 0, dayOffset: 1, hour: 10, type: "anxiety", modality: "in_person", status: "scheduled", duration: 50 },
    { clientIdx: 3, dayOffset: -5, hour: 9, type: "trauma", modality: "in_person", status: "completed", duration: 80 },
    { clientIdx: 4, dayOffset: -7, hour: 15, type: "general", modality: "telehealth", status: "no_show", duration: 50 },
    { clientIdx: 0, dayOffset: 14, hour: 11, type: "anxiety", modality: "in_person", status: "scheduled", duration: 50 },
    { clientIdx: 1, dayOffset: 3, hour: 16, type: "cbt", modality: "telehealth", status: "scheduled", duration: 50 },
    { clientIdx: 2, dayOffset: 10, hour: 10, type: "depression", modality: "in_person", status: "scheduled", duration: 50 },
    { clientIdx: 3, dayOffset: 7, hour: 14, type: "trauma", modality: "in_person", status: "scheduled", duration: 80 },
  ];

  const noteTemplates: Record<string, { raw: string; subjective: string; objective: string; assessment: string; plan: string }> = {
    depression: {
      raw: "Priya Menon reports a slight lifting of mood compared to last week. Mentions behavioral activation homework helped structure her mornings. Affect is congruent. Continue behavioral activation schedule.",
      subjective: "Priya reports feeling a slight lifting of mood compared to last week. Mentions behavioral activation homework helped structure her mornings.",
      objective: "Cooperative, affect is congruent, speech is normal rate and tone. Mindfully engaged in session.",
      assessment: "Showing positive response to behavioral activation. Depressive symptoms are currently moderate.",
      plan: "1. Continue behavioral activation schedule. 2. Follow up next week.",
    },
    cbt: {
      raw: "Arjun Patel reports heavy workload and trouble stopping anxious thought loops at night. Did not complete cognitive restructuring sheet. Somewhat tense, fidgeting. Needs guidance on identifying automatic thoughts.",
      subjective: "Arjun reports heavy workload and trouble stopping anxious thought loops at night. Did not complete cognitive restructuring sheet.",
      objective: "Somewhat tense, fidgeting, speech fast but coherent.",
      assessment: "High anxiety secondary to work stress. Needs guidance on identifying automatic thoughts.",
      plan: "1. Practice cognitive restructuring in-session next week. 2. Homework: track anxious thoughts daily.",
    },
    trauma: {
      raw: "Aisha Kapoor reported increased hypervigilance following a recent triggering event. Grounding techniques helped in session. Discussed window of tolerance and titration.",
      subjective: "Client reports increased hypervigilance and intrusive thoughts after recent trigger. Grounding exercises provided some relief.",
      objective: "Alert, somewhat guarded initially. Gradual improvement in eye contact and engagement. Able to use 5-4-3-2-1 grounding technique.",
      assessment: "Chronic hypervigilance with acute exacerbation. Responding well to grounding and psychoeducation about window of tolerance.",
      plan: "1. Continue grounding practice daily. 2. Introduce titration techniques next session. 3. Monitor for safety.",
    },
    general: {
      raw: "Vikram Reddy did not attend scheduled telehealth session. No prior communication about cancellation.",
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
    },
  };

  for (const sd of sessionsData) {
    const client = seededClients[sd.clientIdx];
    const sessionDate = new Date(now.getTime() + (sd.dayOffset || 0) * 24 * 60 * 60 * 1000);
    sessionDate.setHours(sd.hour, 0, 0, 0);

    const [sess] = await tx
      .insert(sessions)
      .values({
        organizationId: orgId,
        clientId: client.id,
        therapistId,
        sessionType: sd.type,
        modality: sd.modality,
        status: sd.status,
        scheduledAt: sessionDate,
        durationMinutes: sd.duration,
        keyVersion: 1,
      })
      .returning();

    const template = noteTemplates[sd.type];
    if (template && sd.status === "completed") {
      const [note] = await tx
        .insert(sessionNotes)
        .values({
          sessionId: sess.id,
          organizationId: orgId,
          therapistId,
          contentEnc: encrypt(template.raw, orgId),
          contentHash: hmacHash(template.raw, orgId),
          wordCount: template.raw.split(/\s+/).length,
          keyVersion: 1,
          aiConsentVerified: true,
        })
        .returning();

      const isSigned = sd.type === "depression";
      await tx
        .insert(soapNotes)
        .values({
          sessionId: sess.id,
          sessionNoteId: note.id,
          organizationId: orgId,
          therapistId,
          subjectiveEnc: encrypt(template.subjective, orgId),
          objectiveEnc: encrypt(template.objective, orgId),
          assessmentEnc: encrypt(template.assessment, orgId),
          planEnc: encrypt(template.plan, orgId),
          generationModel: "Simulated AI (Clinical Template)",
          therapistEdited: false,
          status: isSigned ? "signed" : "draft",
          signedAt: isSigned ? sessionDate : null,
          signedBy: isSigned ? therapistId : null,
          keyVersion: 1,
          contentHash: hmacHash(template.raw, orgId),
        });
    }
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const result = await withRls(session.organizationId, async (tx) => {
      const [org] = await tx
        .select()
        .from(organizations)
        .where(eq(organizations.id, session.organizationId))
        .limit(1);
      return org;
    });

    const settings = (result?.settings || {}) as Record<string, unknown>;
    const needsOnboarding = !settings.onboardingCompleted;

    return NextResponse.json({
      needsOnboarding,
      org: {
        name: result?.name || "",
        settings,
      },
    });
  } catch (err: any) {
    console.error("Onboarding check error:", err);
    return NextResponse.json({ needsOnboarding: true, org: null });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { practiceName, specialization, seedDemoData } = body;

    if (!practiceName || !practiceName.trim()) {
      return NextResponse.json({ error: "Practice name is required" }, { status: 400 });
    }

    const orgId = session.organizationId;
    const userId = session.userId;

    await withRls(orgId, async (tx) => {
      await tx
        .update(organizations)
        .set({
          name: practiceName.trim(),
          settings: {
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString(),
            practiceName: practiceName.trim(),
          },
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));

      if (specialization) {
        await tx
          .update(users)
          .set({
            specializations: [specialization],
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(users.id, userId),
              eq(users.organizationId, orgId)
            )
          );
      }

      if (seedDemoData) {
        await seedPracticeData(tx, orgId, userId);
      }

      await logAuditEvent(tx, {
        organizationId: orgId,
        actorId: userId,
        eventType: "update",
        resourceType: "organization",
        resourceId: orgId,
        metadata: { action: "onboarding_completed" },
        req: request,
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: sanitizeError(err, "Failed to complete onboarding") }, { status: 500 });
  }
}

export { SPECIALIZATIONS };
