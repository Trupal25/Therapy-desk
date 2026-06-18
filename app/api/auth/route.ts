import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { eq } from 'drizzle-orm';
import { users } from '../../../db/schema/users';
import { organizations } from '../../../db/schema/organizations';
import { encryptionKeys } from '../../../db/schema/encryption_keys';
import { clients } from '../../../db/schema/clients';
import { sessions } from '../../../db/schema/sessions';
import { sessionNotes } from '../../../db/schema/session_notes';
import { soapNotes } from '../../../db/schema/soap_notes';
import { encrypt, clientSearchHash, hmacHash } from '../../../lib/crypto';
import { hashPassword, setSession, clearSession, getSession } from '../../../lib/auth-helper';
import { logAuditEvent } from '../../../lib/audit-helper';
import { withRls } from '../../../lib/db-helper';

// GET /api/auth — Retrieve current session profile
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}

import { sanitizeError } from '../../../lib/error-helper';

// Helper to seed practice data for a new signup
async function seedPracticeData(tx: any, orgId: string, therapistId: string) {
  // 1. Seed Clients
  const clientData = [
    { firstName: 'Riya', lastName: 'Shah', dob: '1998-01-01', gender: 'Anxiety', notes: 'Referred by GP for panic attacks and social anxiety.' },
    { firstName: 'Arjun', lastName: 'Patel', dob: '1991-01-01', gender: 'CBT', notes: 'Struggles with chronic stress and negative self-talk.' },
    { firstName: 'Priya', lastName: 'Menon', dob: '1984-01-01', gender: 'Depression', notes: 'Struggling with post-partum depression, low mood, and lethargy.' }
  ];

  const seededClients = [];
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
        referralSource: c.notes,
        searchHash,
        keyVersion: 1,
        isActive: true,
      })
      .returning();
    seededClients.push({ ...c, id: inserted.id });
  }

  // 2. Seed Sessions & SOAP Notes
  const now = new Date();
  
  // Priya Menon - completed session 3 days ago, signed soap note
  const datePriya = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  datePriya.setHours(11, 0, 0, 0);
  const [sessPriya] = await tx
    .insert(sessions)
    .values({
      organizationId: orgId,
      clientId: seededClients[2].id,
      therapistId,
      sessionType: 'depression',
      modality: 'phone',
      status: 'completed',
      scheduledAt: datePriya,
      durationMinutes: 50,
      keyVersion: 1,
    })
    .returning();

  const priyaRawNotes = "Priya Menon reports feeling a slight lifting of mood compared to last week. Mentions behavioral activation homework helped structure her mornings. Affect is congruent. Continue behavioral activation schedule.";
  const priyaSubjective = "Priya reports feeling a slight lifting of mood compared to last week. Mentions behavioral activation homework helped structure her mornings.";
  const priyaObjective = "Cooperative, affect is congruent, speech is normal rate/tone. Mindfully engaged in session.";
  const priyaAssessment = "Showing positive response to behavioral activation. Depressive symptoms are currently moderate.";
  const priyaPlan = "1. Continue behavioral activation schedule. 2. Follow up next week.";

  const [notePriya] = await tx
    .insert(sessionNotes)
    .values({
      sessionId: sessPriya.id,
      organizationId: orgId,
      therapistId,
      contentEnc: encrypt(priyaRawNotes, orgId),
      contentHash: hmacHash(priyaRawNotes, orgId),
      wordCount: priyaRawNotes.split(/\s+/).length,
      keyVersion: 1,
      aiConsentVerified: true,
    })
    .returning();

  await tx
    .insert(soapNotes)
    .values({
      sessionId: sessPriya.id,
      sessionNoteId: notePriya.id,
      organizationId: orgId,
      therapistId,
      subjectiveEnc: encrypt(priyaSubjective, orgId),
      objectiveEnc: encrypt(priyaObjective, orgId),
      assessmentEnc: encrypt(priyaAssessment, orgId),
      planEnc: encrypt(priyaPlan, orgId),
      generationModel: 'Simulated AI (Clinical Template)',
      therapistEdited: false,
      status: 'signed',
      signedAt: datePriya,
      signedBy: therapistId,
      keyVersion: 1,
      contentHash: hmacHash(priyaRawNotes, orgId),
    });

  // Arjun Patel - completed session 1 day ago, draft soap note
  const dateArjun = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  dateArjun.setHours(14, 0, 0, 0);
  const [sessArjun] = await tx
    .insert(sessions)
    .values({
      organizationId: orgId,
      clientId: seededClients[1].id,
      therapistId,
      sessionType: 'cbt',
      modality: 'telehealth',
      status: 'completed',
      scheduledAt: dateArjun,
      durationMinutes: 50,
      keyVersion: 1,
    })
    .returning();

  const arjunRawNotes = "Arjun Patel reports heavy workload and trouble stopping anxious thought loops at night. Did not complete cognitive restructuring sheet. Somewhat tense, fidgeting. Needs guidance.";
  const arjunSubjective = "Arjun reports heavy workload and trouble stopping anxious thought loops at night. Did not complete cognitive restructuring sheet.";
  const arjunObjective = "Somewhat tense, fidgeting, speech fast but coherent.";
  const arjunAssessment = "High anxiety secondary to work stress. Needs guidance on identifying automatic thoughts.";
  const arjunPlan = "1. Practice cognitive restructuring in-session next week. 2. Homework: track anxious thoughts.";

  const [noteArjun] = await tx
    .insert(sessionNotes)
    .values({
      sessionId: sessArjun.id,
      organizationId: orgId,
      therapistId,
      contentEnc: encrypt(arjunRawNotes, orgId),
      contentHash: hmacHash(arjunRawNotes, orgId),
      wordCount: arjunRawNotes.split(/\s+/).length,
      keyVersion: 1,
      aiConsentVerified: true,
    })
    .returning();

  await tx
    .insert(soapNotes)
    .values({
      sessionId: sessArjun.id,
      sessionNoteId: noteArjun.id,
      organizationId: orgId,
      therapistId,
      subjectiveEnc: encrypt(arjunSubjective, orgId),
      objectiveEnc: encrypt(arjunObjective, orgId),
      assessmentEnc: encrypt(arjunAssessment, orgId),
      planEnc: encrypt(arjunPlan, orgId),
      generationModel: 'Simulated AI (Clinical Template)',
      therapistEdited: false,
      status: 'draft',
      keyVersion: 1,
      contentHash: hmacHash(arjunRawNotes, orgId),
    });

  // Riya Shah - scheduled session tomorrow
  const dateRiya = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  dateRiya.setHours(10, 0, 0, 0);
  await tx
    .insert(sessions)
    .values({
      organizationId: orgId,
      clientId: seededClients[0].id,
      therapistId,
      sessionType: 'anxiety',
      modality: 'in_person',
      status: 'scheduled',
      scheduledAt: dateRiya,
      durationMinutes: 50,
      keyVersion: 1,
    });
}


// POST /api/auth — Sign In or Sign Up
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, fullName, plan } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();

    if (action === 'signup') {
      if (!fullName) {
        return NextResponse.json({ error: 'Full name is required for signup' }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, emailClean))
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }

      // Create new tenant organization and user inside a transaction
      const result = await db.transaction(async (tx: any) => {
        // 1. Create Organization
        const slug = emailClean.split('@')[0] + '-' + Math.random().toString(36).substring(2, 6);
        const [org] = await tx
          .insert(organizations)
          .values({
            name: `${fullName}'s Practice`,
            slug: slug,
            plan: plan || 'free',
          })
          .returning();

        // 2. Create Encryption Key Placeholder for the organization
        await tx.insert(encryptionKeys).values({
          organizationId: org.id,
          keyVersion: 1,
          algorithm: 'AES-256-GCM',
        });

        // 3. Create User
        const [newUser] = await tx
          .insert(users)
          .values({
            organizationId: org.id,
            email: emailClean,
            passwordHash: hashPassword(password),
            fullName: fullName,
            role: 'owner',
            specializations: [],
          })
          .returning();

        // 4. Log Audit Event (organization context set manually since it's the initial create)
        await logAuditEvent(tx, {
          organizationId: org.id,
          actorId: newUser.id,
          eventType: 'create',
          resourceType: 'user',
          resourceId: newUser.id,
          metadata: { action: 'signup', email: emailClean },
          req: request,
        });

        // 5. Seed Practice Data (mock clients, sessions, and SOAP notes)
        await seedPracticeData(tx, org.id, newUser.id);

        return { newUser, org };
      });

      const sessionData = {
        userId: result.newUser.id,
        organizationId: result.org.id,
        role: result.newUser.role,
        fullName: result.newUser.fullName,
      };

      await setSession(sessionData);
      return NextResponse.json({ success: true, user: sessionData });

    } else {
      // Default to Action: signin
      const foundUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, emailClean))
        .limit(1);

      if (foundUsers.length === 0) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const user = foundUsers[0];
      const match = hashPassword(password) === user.passwordHash;

      if (!match) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const sessionData = {
        userId: user.id,
        organizationId: user.organizationId,
        role: user.role,
        fullName: user.fullName,
      };

      await setSession(sessionData);

      // Log login event inside the organization context
      await withRls(user.organizationId, async (tx) => {
        await logAuditEvent(tx, {
          organizationId: user.organizationId,
          actorId: user.id,
          eventType: 'login',
          resourceType: 'user',
          resourceId: user.id,
          req: request,
        });
      });

      return NextResponse.json({ success: true, user: sessionData });
    }
  } catch (err: any) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Internal server error') }, { status: 500 });
  }
}

// DELETE /api/auth — Sign Out
export async function DELETE(request: Request) {
  const session = await getSession();
  if (session) {
    try {
      await withRls(session.organizationId, async (tx) => {
        await logAuditEvent(tx, {
          organizationId: session.organizationId,
          actorId: session.userId,
          eventType: 'logout',
          resourceType: 'user',
          resourceId: session.userId,
          req: request,
        });
      });
    } catch (err) {
      console.error('Audit signout logging failed:', err);
    }
  }
  await clearSession();
  return NextResponse.json({ success: true });
}
