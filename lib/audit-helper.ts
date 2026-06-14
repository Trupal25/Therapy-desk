import { auditLogs } from '../db/schema/audit_logs';

export type AuditEventType = 'read' | 'create' | 'update' | 'delete' | 'export' | 'login' | 'logout' | 'key_rotation' | 'consent_change';
export type ResourceType = 'client' | 'session' | 'soap_note' | 'session_note' | 'session_file' | 'user' | 'organization';

export async function logAuditEvent(
  tx: any,
  params: {
    organizationId: string;
    actorId: string | null;
    eventType: AuditEventType;
    resourceType: ResourceType;
    resourceId: string | null;
    metadata?: Record<string, any>;
    req?: Request;
  }
) {
  let ip: string | null = null;
  let ua: string | null = null;

  if (params.req) {
    ip = params.req.headers.get('x-forwarded-for') || null;
    ua = params.req.headers.get('user-agent') || null;
  }

  await tx.insert(auditLogs).values({
    organizationId: params.organizationId,
    actorId: params.actorId,
    actorIp: ip,
    actorUserAgent: ua,
    eventType: params.eventType,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    metadata: params.metadata || {},
  });
}
