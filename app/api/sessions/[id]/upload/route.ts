import { NextResponse } from 'next/server';
import { getSession } from '../../../../../lib/auth-helper';
import { withRls } from '../../../../../lib/db-helper';
import { logAuditEvent } from '../../../../../lib/audit-helper';
import { sessionFiles } from '../../../../../db/schema/session_files';
import { sessions } from '../../../../../db/schema/sessions';
import { encrypt, hmacHash } from '../../../../../lib/crypto';
import { eq, and } from 'drizzle-orm';
import { sanitizeError } from '../../../../../lib/error-helper';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

function getUploadDir(): string {
  const dir = join(process.cwd(), 'uploads');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

import { mkdirSync } from 'fs';

function getFileType(mimeType: string): "audio" | "video" | "document" | "image" {
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("image/")) return "image";
  return "document";
}

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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/m4a", "audio/x-m4a", "video/mp4", "video/webm"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not supported. Please upload an audio or video file." }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 50MB." }, { status: 400 });
    }

    const orgId = session.organizationId;
    const userId = session.userId;

    // Verify session belongs to this org
    const sessionCheck = await withRls(orgId, async (tx) => {
      const [sess] = await tx
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.id, sessionId),
            eq(sessions.organizationId, orgId)
          )
        )
        .limit(1);
      return sess;
    });

    if (!sessionCheck) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Save file to disk
    const uploadDir = getUploadDir();
    const fileExt = file.name.split(".").pop() || "bin";
    const storageKey = orgId + "/" + sessionId + "/" + Date.now() + "." + fileExt;
    const filePath = join(uploadDir, storageKey);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Record in database
    const fileType = getFileType(file.type);
    const [fileRecord] = await withRls(orgId, async (tx) => {
      const [inserted] = await tx
        .insert(sessionFiles)
        .values({
          sessionId,
          organizationId: orgId,
          uploaderId: userId,
          fileType,
          storageKey,
          fileSizeBytes: file.size,
          mimeType: file.type,
          transcriptionStatus: "pending",
        })
        .returning();

      await logAuditEvent(tx, {
        organizationId: orgId,
        actorId: userId,
        eventType: "create",
        resourceType: "session_file",
        resourceId: inserted.id,
        metadata: { fileName: file.name, fileSize: file.size, fileType },
        req: request,
      });

      return [inserted];
    });

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        fileName: file.name,
        fileType: fileRecord.fileType,
        fileSizeBytes: fileRecord.fileSizeBytes,
        mimeType: fileRecord.mimeType,
        transcriptionStatus: fileRecord.transcriptionStatus,
        createdAt: fileRecord.createdAt,
      },
    });
  } catch (err: any) {
    console.error("File upload error:", err);
    return NextResponse.json({ error: sanitizeError(err, "Failed to upload file") }, { status: 500 });
  }
}
