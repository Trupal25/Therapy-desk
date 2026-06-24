import { NextResponse } from 'next/server';
import { getSession } from '../../../../../lib/auth-helper';
import { withRls } from '../../../../../lib/db-helper';
import { sessionFiles } from '../../../../../db/schema/session_files';
import { eq, and } from 'drizzle-orm';
import { sanitizeError } from '../../../../../lib/error-helper';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: sessionId } = await params;
    const orgId = session.organizationId;

    const files = await withRls(orgId, async (tx) => {
      const result = await tx
        .select()
        .from(sessionFiles)
        .where(
          and(
            eq(sessionFiles.sessionId, sessionId),
            eq(sessionFiles.organizationId, orgId)
          )
        );
      return result;
    });

    return NextResponse.json({
      files: files.map((f: any) => ({
        id: f.id,
        fileType: f.fileType,
        storageKey: f.storageKey,
        fileSizeBytes: f.fileSizeBytes,
        mimeType: f.mimeType,
        transcriptionStatus: f.transcriptionStatus,
        createdAt: f.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("Files list error:", err);
    return NextResponse.json({ error: sanitizeError(err, "Failed to list files") }, { status: 500 });
  }
}
