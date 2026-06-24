import { NextResponse } from 'next/server';
import { getSession } from '../../../../../lib/auth-helper';
import { withRls } from '../../../../../lib/db-helper';
import { logAuditEvent } from '../../../../../lib/audit-helper';
import { sessionFiles } from '../../../../../db/schema/session_files';
import { sessions } from '../../../../../db/schema/sessions';
import { eq, and } from 'drizzle-orm';
import { sanitizeError } from '../../../../../lib/error-helper';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const orgId = session.organizationId;
    const userId = session.userId;

    // Get the file record
    const fileRecord = await withRls(orgId, async (tx) => {
      const [file] = await tx
        .select()
        .from(sessionFiles)
        .where(
          and(
            eq(sessionFiles.id, fileId),
            eq(sessionFiles.organizationId, orgId)
          )
        )
        .limit(1);
      return file;
    });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Update status to processing
    await withRls(orgId, async (tx) => {
      await tx
        .update(sessionFiles)
        .set({ transcriptionStatus: "processing" })
        .where(eq(sessionFiles.id, fileId));
    });

    // Read file from disk
    const uploadDir = join(process.cwd(), "uploads");
    const filePath = join(uploadDir, fileRecord.storageKey);

    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(filePath);
    } catch {
      await withRls(orgId, async (tx) => {
        await tx
          .update(sessionFiles)
          .set({ transcriptionStatus: "failed" })
          .where(eq(sessionFiles.id, fileId));
      });
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    // Check for OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      // Mock transcription for demo purposes
      const mockTranscription = "Session recording transcription would appear here. To enable real transcription, set the OPENAI_API_KEY environment variable with your OpenAI API key. The Whisper API will then transcribe your audio recordings automatically.";

      await withRls(orgId, async (tx) => {
        await tx
          .update(sessionFiles)
          .set({ transcriptionStatus: "complete" })
          .where(eq(sessionFiles.id, fileId));

        await logAuditEvent(tx, {
          organizationId: orgId,
          actorId: userId,
          eventType: "update",
          resourceType: "session_file",
          resourceId: fileId,
          metadata: { action: "transcription_mock" },
          req: request,
        });
      });

      return NextResponse.json({
        success: true,
        transcription: mockTranscription,
        status: "complete",
        mock: true,
      });
    }

    // Real transcription via OpenAI Whisper API
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: fileRecord.mimeType || "audio/mpeg" });
      formData.append("file", blob, "recording." + (fileRecord.mimeType?.split("/")[1] || "mp3"));
      formData.append("model", "whisper-1");
      formData.append("response_format", "text");

      const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + openaiKey,
        },
        body: formData,
      });

      if (!whisperRes.ok) {
        const errText = await whisperRes.text();
        console.error("Whisper API error:", errText);
        throw new Error("Transcription failed: " + whisperRes.status);
      }

      const transcription = await whisperRes.text();

      await withRls(orgId, async (tx) => {
        await tx
          .update(sessionFiles)
          .set({ transcriptionStatus: "complete" })
          .where(eq(sessionFiles.id, fileId));

        await logAuditEvent(tx, {
          organizationId: orgId,
          actorId: userId,
          eventType: "update",
          resourceType: "session_file",
          resourceId: fileId,
          metadata: { action: "transcription_complete", wordCount: transcription.split(/\s+/).length },
          req: request,
        });
      });

      return NextResponse.json({
        success: true,
        transcription,
        status: "complete",
        mock: false,
      });
    } catch (transcriptionErr) {
      await withRls(orgId, async (tx) => {
        await tx
          .update(sessionFiles)
          .set({ transcriptionStatus: "failed" })
          .where(eq(sessionFiles.id, fileId));
      });
      throw transcriptionErr;
    }
  } catch (err: any) {
    console.error("Transcription error:", err);
    return NextResponse.json({ error: sanitizeError(err, "Failed to transcribe file") }, { status: 500 });
  }
}
