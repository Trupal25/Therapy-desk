import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth-helper';
import { withRls } from '../../../../lib/db-helper';
import { logAuditEvent } from '../../../../lib/audit-helper';
import { soapNotes } from '../../../../db/schema/soap_notes';
import { sessionNotes } from '../../../../db/schema/session_notes';
import { encrypt, hmacHash } from '../../../../lib/crypto';
import { and, eq } from 'drizzle-orm';
import { sanitizeError } from '../../../../lib/error-helper';
import { generateSoapWithGemini } from '../../../../lib/gemini';

// Fallback: generate a template-based clinical SOAP note when Gemini is unavailable
function generateSimulatedSoap(rawNotes: string) {
  const notesLower = rawNotes.toLowerCase();
  
  let subjective = `Patient reports: "${rawNotes}". `;
  if (notesLower.includes('anxi') || notesLower.includes('worr')) {
    subjective += `Expresses ongoing concern about anxiety triggers and states difficulties in managing racing thoughts.`;
  } else if (notesLower.includes('depress') || notesLower.includes('sad') || notesLower.includes('low')) {
    subjective += `Reports low mood, fatigue, and decreased motivation over the past week.`;
  } else {
    subjective += `Discussed current emotional baseline and recent stressors.`;
  }

  let objective = `Patient is alert, oriented x3. `;
  if (notesLower.includes('anxi') || notesLower.includes('nervous')) {
    objective += `Appears mildly anxious, fidgety at times, but maintains good eye contact and speech is regular in rate and volume.`;
  } else if (notesLower.includes('depress') || notesLower.includes('tired')) {
    objective += `Affect appears somewhat flat or restricted. Speech is soft but coherent.`;
  } else {
    objective += `Affect is congruent with mood. Cognition appears intact and cooperative throughout the session.`;
  }

  let assessment = `Progress is steady. `;
  if (notesLower.includes('anxi')) {
    assessment += `Symptoms are consistent with Generalized Anxiety. Patient is demonstrating insight into cognitive distortions and responds well to cognitive restructuring techniques.`;
  } else if (notesLower.includes('depress')) {
    assessment += `Symptoms are consistent with Moderate Depression. Discussed behavioral activation strategies. Patient requires structured accountability.`;
  } else {
    assessment += `Patient exhibits coping strategies that are developing but require continuous reinforcement. Therapeutic alliance remains strong.`;
  }

  let plan = `1. Schedule next session in 1 week. `;
  if (notesLower.includes('homework') || notesLower.includes('diary')) {
    plan += `\n2. Homework: complete thought record/diary for anxious episodes.\n3. Continue CBT interventions.`;
  } else {
    plan += `\n2. Practice mindfulness breathing exercises daily.\n3. Monitor mood baseline and follow up on discussed coping mechanisms.`;
  }

  return { subjective, objective, assessment, plan };
}

// POST /api/notes/generate — Generates a SOAP note from raw therapist notes via Gemini AI
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, rawText, userApiKey, subjective, objective, assessment, plan, sessionType, modality } = body;

    if (!sessionId || !rawText) {
      return NextResponse.json({ error: 'Session ID and raw notes are required' }, { status: 400 });
    }

    const orgId = session.organizationId;
    let soapResult = { subjective: '', objective: '', assessment: '', plan: '' };
    let usedModel = 'Simulated AI (Clinical Template)';
    let generationDurationMs: number | null = null;

    if (userApiKey === 'skip_ai_and_use_values') {
      // Manual edit passthrough — no AI involved
      soapResult = {
        subjective: subjective || '',
        objective: objective || '',
        assessment: assessment || '',
        plan: plan || '',
      };
      usedModel = 'Manual Edit';
    } else {
      // Try Gemini AI generation
      const geminiKey = process.env.GEMINI_API_KEY;

      if (geminiKey) {
        try {
          const startTime = Date.now();
          const result = await generateSoapWithGemini(rawText, sessionType, modality);
          generationDurationMs = Date.now() - startTime;

          soapResult = result.soap;
          usedModel = result.model;
        } catch (geminiErr) {
          console.error('⚠️ Gemini AI generation failed, falling back to template:', geminiErr);
        }
      } else {
        console.warn('⚠️ GEMINI_API_KEY not set. Using simulated clinical template.');
      }

      // Fallback to template if Gemini was unsuccessful
      if (!soapResult.subjective) {
        soapResult = generateSimulatedSoap(rawText);
      }
    }

    // Encrypt raw notes and SOAP notes fields for DB storage
    const rawNotesEnc = encrypt(rawText, orgId);
    const subjectiveEnc = encrypt(soapResult.subjective, orgId);
    const objectiveEnc = encrypt(soapResult.objective, orgId);
    const assessmentEnc = encrypt(soapResult.assessment, orgId);
    const planEnc = encrypt(soapResult.plan, orgId);

    // Hashes for integrity check
    const contentHash = hmacHash(rawText, orgId);

    const savedData = await withRls(orgId, async (tx) => {
      // 1. Save raw session notes transcript
      const [note] = await tx
        .insert(sessionNotes)
        .values({
          sessionId: sessionId,
          organizationId: orgId,
          therapistId: session.userId,
          contentEnc: rawNotesEnc,
          contentHash: contentHash,
          wordCount: rawText.split(/\s+/).length,
          keyVersion: 1,
          aiConsentVerified: true,
        })
        .onConflictDoUpdate({
          target: sessionNotes.sessionId,
          set: {
            contentEnc: rawNotesEnc,
            contentHash: contentHash,
            wordCount: rawText.split(/\s+/).length,
            updatedAt: new Date(),
          },
        })
        .returning();

      const existingSoapList = await tx
        .select()
        .from(soapNotes)
        .where(
          and(
            eq(soapNotes.sessionId, sessionId),
            eq(soapNotes.organizationId, orgId)
          )
        )
        .limit(1);

      let soap;
      if (existingSoapList.length > 0) {
        const [updatedSoap] = await tx
          .update(soapNotes)
          .set({
            subjectiveEnc,
            objectiveEnc,
            assessmentEnc,
            planEnc,
            generationModel: usedModel === 'Manual Edit' ? existingSoapList[0].generationModel : usedModel,
            generationDurationMs: generationDurationMs ?? existingSoapList[0].generationDurationMs,
            therapistEdited: userApiKey === 'skip_ai_and_use_values' ? true : existingSoapList[0].therapistEdited,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(soapNotes.sessionId, sessionId),
              eq(soapNotes.organizationId, orgId)
            )
          )
          .returning();
        soap = updatedSoap;
      } else {
        const [insertedSoap] = await tx
          .insert(soapNotes)
          .values({
            sessionId: sessionId,
            sessionNoteId: note.id,
            organizationId: orgId,
            therapistId: session.userId,
            subjectiveEnc,
            objectiveEnc,
            assessmentEnc,
            planEnc,
            generationModel: usedModel,
            generationDurationMs: generationDurationMs,
            therapistEdited: userApiKey === 'skip_ai_and_use_values',
            status: 'draft',
            keyVersion: 1,
            contentHash: contentHash,
          })
          .returning();
        soap = insertedSoap;
      }

      // Log Create/Update Audit Event
      await logAuditEvent(tx, {
        organizationId: orgId,
        actorId: session.userId,
        eventType: 'create',
        resourceType: 'soap_note',
        resourceId: soap.id,
        metadata: { model: usedModel, durationMs: generationDurationMs },
        req: request,
      });

      return { note, soap };
    });

    return NextResponse.json({
      success: true,
      soapNoteId: savedData.soap.id,
      soap: soapResult,
      model: usedModel,
    });

  } catch (err: any) {
    console.error('Note generation error:', err);
    return NextResponse.json({ error: sanitizeError(err, 'Failed to generate notes') }, { status: 500 });
  }
}

