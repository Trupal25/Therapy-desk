import { db } from "../db";
import { sql, eq, desc, and, isNull, isNotNull, count } from "drizzle-orm";
import { organizations } from "../db/schema/organizations";
import { users } from "../db/schema/users";
import { clients } from "../db/schema/clients";
import { sessions } from "../db/schema/sessions";
import { soapNotes } from "../db/schema/soap_notes";
import { subscriptions } from "../db/schema/subscriptions";
import { encryptionKeys } from "../db/schema/encryption_keys";
import { auditLogs } from "../db/schema/audit_logs";
import type {
  OverviewKPIs,
  PracticeRow,
  PracticeDetail,
  UserRow,
  AuditRow,
  KeyRow,
  SoapFunnelData,
  MonthlyGrowthPoint,
  SessionStats,
} from "./admin-types";

export async function getOverviewKPIs(): Promise<OverviewKPIs> {
  const [orgCount] = await db
    .select({ count: count() })
    .from(organizations)
    .where(isNull(organizations.deletedAt));

  const [suspendedCount] = await db
    .select({ count: count() })
    .from(organizations)
    .where(isNotNull(organizations.deletedAt));

  const [userCount] = await db.select({ count: count() }).from(users).where(isNull(users.deletedAt));

  const [clientCount] = await db.select({ count: count() }).from(clients).where(isNull(clients.deletedAt));

  const [soapCount] = await db.select({ count: count() }).from(soapNotes);

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const [soapMonthCount] = await db
    .select({ count: count() })
    .from(soapNotes)
    .where(sql`${soapNotes.createdAt} >= ${firstOfMonth}`);

  const planRows = await db
    .select({ plan: organizations.plan, count: count() })
    .from(organizations)
    .where(isNull(organizations.deletedAt))
    .groupBy(organizations.plan);

  return {
    totalOrgs: orgCount.count + suspendedCount.count,
    activeOrgs: orgCount.count,
    suspendedOrgs: suspendedCount.count,
    totalUsers: userCount.count,
    totalClients: clientCount.count,
    totalSoapNotes: soapCount.count,
    soapNotesThisMonth: soapMonthCount.count,
    planDistribution: planRows.map((r: any) => ({ plan: r.plan, count: r.count })),
  };
}

export async function getPractices(
  page = 1,
  pageSize = 20,
  search?: string,
  planFilter?: string
): Promise<{ data: PracticeRow[]; total: number }> {
  const conditions = [isNull(organizations.deletedAt)];

  if (search) {
    conditions.push(
      sql`(${organizations.name} ILIKE ${`%${search}%`} OR ${organizations.slug} ILIKE ${`%${search}%`})`
    );
  }

  if (planFilter && planFilter !== "all") {
    conditions.push(eq(organizations.plan, planFilter as any));
  }

  const where = and(...conditions);

  const [{ total }] = await db
    .select({ total: count() })
    .from(organizations)
    .where(where);

  const offset = (page - 1) * pageSize;

  const orgs = await db
    .select()
    .from(organizations)
    .where(where)
    .orderBy(desc(organizations.createdAt))
    .limit(pageSize)
    .offset(offset);

  const data = await Promise.all(
    orgs.map(async (org: any) => {
      const [owner] = await db
        .select({ fullName: users.fullName, email: users.email })
        .from(users)
        .where(and(eq(users.organizationId, org.id), eq(users.role, "owner"), isNull(users.deletedAt)))
        .limit(1);

      const [sub] = await db
        .select({ soapNotesUsed: subscriptions.soapNotesUsed, soapNotesLimit: subscriptions.soapNotesLimit })
        .from(subscriptions)
        .where(eq(subscriptions.organizationId, org.id))
        .limit(1);

      const [userC] = await db
        .select({ count: count() })
        .from(users)
        .where(and(eq(users.organizationId, org.id), isNull(users.deletedAt)));

      const [clientC] = await db
        .select({ count: count() })
        .from(clients)
        .where(and(eq(clients.organizationId, org.id), isNull(clients.deletedAt)));

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        ownerName: owner?.fullName ?? "Unknown",
        ownerEmail: owner?.email ?? "",
        soapNotesUsed: sub?.soapNotesUsed ?? 0,
        soapNotesLimit: sub?.soapNotesLimit ?? 10,
        isActive: !org.deletedAt,
        createdAt: org.createdAt,
        userCount: userC.count,
        clientCount: clientC.count,
      };
    })
  );

  return { data, total };
}

export async function getPracticeDetail(orgId: string): Promise<PracticeDetail | null> {
  const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
  if (!org) return null;

  const [owner] = await db
    .select({ fullName: users.fullName, email: users.email })
    .from(users)
    .where(and(eq(users.organizationId, org.id), eq(users.role, "owner"), isNull(users.deletedAt)))
    .limit(1);

  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, org.id)).limit(1);

  const [encKey] = await db.select().from(encryptionKeys).where(eq(encryptionKeys.organizationId, org.id)).limit(1);

  const [soapSub] = await db
    .select({ soapNotesUsed: subscriptions.soapNotesUsed, soapNotesLimit: subscriptions.soapNotesLimit })
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, org.id))
    .limit(1);

  const [userC] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.organizationId, org.id), isNull(users.deletedAt)));

  const [clientC] = await db
    .select({ count: count() })
    .from(clients)
    .where(and(eq(clients.organizationId, org.id), isNull(clients.deletedAt)));

  const practitioners = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      specializations: users.specializations,
      mfaEnabled: users.mfaEnabled,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(and(eq(users.organizationId, org.id), isNull(users.deletedAt)));

  const sessionStatusRows = await db
    .select({ status: sessions.status, count: count() })
    .from(sessions)
    .where(eq(sessions.organizationId, org.id))
    .groupBy(sessions.status);

  const sessionModalityRows = await db
    .select({ modality: sessions.modality, count: count() })
    .from(sessions)
    .where(eq(sessions.organizationId, org.id))
    .groupBy(sessions.modality);

  const [sessionTotal] = await db
    .select({ count: count() })
    .from(sessions)
    .where(eq(sessions.organizationId, org.id));

  const soapStatusRows = await db
    .select({ status: soapNotes.status, count: count() })
    .from(soapNotes)
    .where(eq(soapNotes.organizationId, org.id))
    .groupBy(soapNotes.status);

  const [editedCount] = await db
    .select({ count: count() })
    .from(soapNotes)
    .where(and(eq(soapNotes.organizationId, org.id), eq(soapNotes.therapistEdited, true)));

  const [soapTotal] = await db
    .select({ count: count() })
    .from(soapNotes)
    .where(eq(soapNotes.organizationId, org.id));

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: org.plan,
    ownerName: owner?.fullName ?? "Unknown",
    ownerEmail: owner?.email ?? "",
    soapNotesUsed: soapSub?.soapNotesUsed ?? 0,
    soapNotesLimit: soapSub?.soapNotesLimit ?? 10,
    isActive: !org.deletedAt,
    createdAt: org.createdAt,
    userCount: userC.count,
    clientCount: clientC.count,
    settings: org.settings ?? {},
    subscription: sub
      ? {
          id: sub.id,
          plan: sub.plan,
          status: sub.status,
          stripeCustomerId: sub.stripeCustomerId,
          stripeSubscriptionId: sub.stripeSubscriptionId,
          currentPeriodEnd: sub.currentPeriodEnd,
        }
      : null,
    encryptionKey: encKey
      ? {
          id: encKey.id,
          algorithm: encKey.algorithm,
          keyVersion: encKey.keyVersion,
          kmsKeyId: encKey.kmsKeyId,
          createdAt: encKey.createdAt,
          rotatedAt: encKey.rotatedAt,
          expiresAt: encKey.expiresAt,
        }
      : null,
    practitioners,
    sessionStats: {
      total: sessionTotal.count,
      byStatus: Object.fromEntries(sessionStatusRows.map((r: any) => [r.status, r.count])),
      byModality: Object.fromEntries(sessionModalityRows.map((r: any) => [r.modality, r.count])),
    },
    soapStats: {
      total: soapTotal.count,
      byStatus: Object.fromEntries(soapStatusRows.map((r: any) => [r.status, r.count])),
      therapistEditedCount: editedCount.count,
    },
  };
}

export async function getUsers(
  page = 1,
  pageSize = 20,
  search?: string,
  roleFilter?: string
): Promise<{ data: UserRow[]; total: number }> {
  const conditions = [isNull(users.deletedAt)];

  if (search) {
    conditions.push(sql`(${users.fullName} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`})`);
  }

  if (roleFilter && roleFilter !== "all") {
    conditions.push(eq(users.role, roleFilter as any));
  }

  const where = and(...conditions);

  const [{ total }] = await db.select({ total: count() }).from(users).where(where);

  const offset = (page - 1) * pageSize;

  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      organizationId: users.organizationId,
      specializations: users.specializations,
      mfaEnabled: users.mfaEnabled,
      lastLoginAt: users.lastLoginAt,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  const orgIds = [...new Set(rows.map((r: any) => r.organizationId))];
  const orgRows = orgIds.length > 0
    ? await db
        .select({ id: organizations.id, name: organizations.name })
        .from(organizations)
        .where(sql`${organizations.id} IN ${orgIds}`)
    : [];

  const orgMap = Object.fromEntries((orgRows as any[]).map((o: any) => [o.id, o.name]));

  const data: UserRow[] = rows.map((r: any) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    role: r.role,
    organizationId: r.organizationId,
    organizationName: orgMap[r.organizationId] ?? "Unknown",
    specializations: r.specializations,
    mfaEnabled: r.mfaEnabled,
    lastLoginAt: r.lastLoginAt,
    isActive: !r.deletedAt,
  }));

  return { data, total };
}

export async function getUserRoleDistribution(): Promise<{ role: string; count: number }[]> {
  const rows = await db
    .select({ role: users.role, count: count() })
    .from(users)
    .where(isNull(users.deletedAt))
    .groupBy(users.role);
  return rows;
}

export async function getMfaAdoption(): Promise<{ enabled: number; disabled: number }> {
  const [enabled] = await db
    .select({ count: count() })
    .from(users)
    .where(and(isNull(users.deletedAt), eq(users.mfaEnabled, true)));

  const [disabled] = await db
    .select({ count: count() })
    .from(users)
    .where(and(isNull(users.deletedAt), eq(users.mfaEnabled, false)));

  return { enabled: enabled.count, disabled: disabled.count };
}

export async function getAuditLogs(
  page = 1,
  pageSize = 25,
  eventTypeFilter?: string,
  resourceTypeFilter?: string
): Promise<{ data: AuditRow[]; total: number }> {
  const conditions = [];

  if (eventTypeFilter && eventTypeFilter !== "all") {
    conditions.push(eq(auditLogs.eventType, eventTypeFilter as any));
  }

  if (resourceTypeFilter && resourceTypeFilter !== "all") {
    conditions.push(eq(auditLogs.resourceType, resourceTypeFilter as any));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ total }] = await db.select({ total: count() }).from(auditLogs).where(where);

  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(pageSize)
    .offset(offset);

  const orgIds = [...new Set(rows.map((r: any) => r.organizationId))];
  const actorIds = [...new Set(rows.filter((r: any) => r.actorId).map((r: any) => r.actorId!))];

  const [orgRows, actorRows] = await Promise.all([
    orgIds.length > 0
      ? db.select({ id: organizations.id, name: organizations.name }).from(organizations).where(sql`${organizations.id} IN ${orgIds}`)
      : [],
    actorIds.length > 0
      ? db.select({ id: users.id, email: users.email }).from(users).where(sql`${users.id} IN ${actorIds}`)
      : [],
  ]);

  const orgMap = Object.fromEntries((orgRows as any[]).map((o: any) => [o.id, o.name]));
  const actorMap = Object.fromEntries((actorRows as any[]).map((a: any) => [a.id, a.email]));

  const data: AuditRow[] = rows.map((r: any) => ({
    id: r.id,
    organizationId: r.organizationId,
    organizationName: orgMap[r.organizationId] ?? "Unknown",
    actorId: r.actorId,
    actorEmail: r.actorId ? actorMap[r.actorId] ?? null : null,
    eventType: r.eventType,
    resourceType: r.resourceType,
    resourceId: r.resourceId,
    actorIp: r.actorIp,
    metadata: r.metadata,
    createdAt: r.createdAt,
  }));

  return { data, total };
}

export async function getAuditStats(): Promise<{ today: number; thisWeek: number; thisMonth: number }> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const [todayCount] = await db
    .select({ count: count() })
    .from(auditLogs)
    .where(sql`${auditLogs.createdAt} >= ${todayStart}`);

  const [weekCount] = await db
    .select({ count: count() })
    .from(auditLogs)
    .where(sql`${auditLogs.createdAt} >= ${weekStart}`);

  const [monthCount] = await db
    .select({ count: count() })
    .from(auditLogs)
    .where(sql`${auditLogs.createdAt} >= ${new Date(now.getFullYear(), now.getMonth(), 1)}`);

  return {
    today: todayCount.count,
    thisWeek: weekCount.count,
    thisMonth: monthCount.count,
  };
}

export async function getAuditEventDistribution(): Promise<{ eventType: string; count: number }[]> {
  const rows = await db
    .select({ eventType: auditLogs.eventType, count: count() })
    .from(auditLogs)
    .groupBy(auditLogs.eventType)
    .orderBy(sql`count DESC`);
  return rows;
}

export async function getKeys(search?: string): Promise<KeyRow[]> {
  const rows = await db
    .select({
      id: encryptionKeys.id,
      organizationId: encryptionKeys.organizationId,
      algorithm: encryptionKeys.algorithm,
      keyVersion: encryptionKeys.keyVersion,
      kmsKeyId: encryptionKeys.kmsKeyId,
      createdAt: encryptionKeys.createdAt,
      rotatedAt: encryptionKeys.rotatedAt,
      expiresAt: encryptionKeys.expiresAt,
    })
    .from(encryptionKeys)
    .orderBy(desc(encryptionKeys.createdAt));

  const orgIds = [...new Set(rows.map((r: any) => r.organizationId))];
  const orgRows = orgIds.length > 0
    ? await db.select({ id: organizations.id, name: organizations.name }).from(organizations).where(sql`${organizations.id} IN ${orgIds}`)
    : [];

  const orgMap = Object.fromEntries((orgRows as any[]).map((o: any) => [o.id, o.name]));

  let data: KeyRow[] = rows.map((r: any) => ({
    id: r.id,
    organizationId: r.organizationId,
    organizationName: orgMap[r.organizationId] ?? "Unknown",
    algorithm: r.algorithm,
    keyVersion: r.keyVersion,
    kmsKeyId: r.kmsKeyId,
    createdAt: r.createdAt,
    rotatedAt: r.rotatedAt,
    expiresAt: r.expiresAt,
  }));

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (d) => d.organizationName.toLowerCase().includes(q) || d.organizationId.toLowerCase().includes(q)
    );
  }

  return data;
}

export async function getSoapFunnelData(): Promise<SoapFunnelData> {
  const rows = await db
    .select({ status: soapNotes.status, count: count() })
    .from(soapNotes)
    .groupBy(soapNotes.status);

  return {
    draft: rows.find((r: any) => r.status === "draft")?.count ?? 0,
    reviewed: rows.find((r: any) => r.status === "reviewed")?.count ?? 0,
    signed: rows.find((r: any) => r.status === "signed")?.count ?? 0,
    amended: rows.find((r: any) => r.status === "amended")?.count ?? 0,
  };
}

export async function getSessionDistribution(): Promise<SessionStats> {
  const [statusRows, modalityRows] = await Promise.all([
    db.select({ status: sessions.status, count: count() }).from(sessions).groupBy(sessions.status),
    db.select({ modality: sessions.modality, count: count() }).from(sessions).groupBy(sessions.modality),
  ]);

  return {
    byStatus: Object.fromEntries(statusRows.map((r: any) => [r.status, r.count])),
    byModality: Object.fromEntries(modalityRows.map((r: any) => [r.modality, r.count])),
  };
}

export async function getMonthlyGrowth(): Promise<MonthlyGrowthPoint[]> {
  const months = 12;
  const result: MonthlyGrowthPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date();
    start.setMonth(start.getMonth() - i, 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const label = start.toLocaleString("en-US", { month: "short", year: "2-digit" });

    const [orgC] = await db
      .select({ count: count() })
      .from(organizations)
      .where(sql`${organizations.createdAt} >= ${start} AND ${organizations.createdAt} < ${end}`);

    const [userC] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${start} AND ${users.createdAt} < ${end}`);

    const [sessionC] = await db
      .select({ count: count() })
      .from(sessions)
      .where(sql`${sessions.createdAt} >= ${start} AND ${sessions.createdAt} < ${end}`);

    result.push({
      month: label,
      orgs: orgC.count,
      users: userC.count,
      sessions: sessionC.count,
    });
  }

  return result;
}

export async function getRecentOrgs(limit = 5): Promise<{ id: string; name: string; plan: string; createdAt: Date | null }[]> {
  return db
    .select({ id: organizations.id, name: organizations.name, plan: organizations.plan, createdAt: organizations.createdAt })
    .from(organizations)
    .where(isNull(organizations.deletedAt))
    .orderBy(desc(organizations.createdAt))
    .limit(limit);
}

export async function getRecentAuditEvents(limit = 10): Promise<(typeof auditLogs.$inferSelect & { organizationName: string })[]> {
  const rows = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  const orgIds = [...new Set(rows.map((r: any) => r.organizationId))];
  const orgRows = orgIds.length > 0
    ? await db.select({ id: organizations.id, name: organizations.name }).from(organizations).where(sql`${organizations.id} IN ${orgIds}`)
    : [];

  const orgMap = Object.fromEntries((orgRows as any[]).map((o: any) => [o.id, o.name]));

  return rows.map((r: any) => ({
    ...r,
    organizationName: orgMap[r.organizationId] ?? "Unknown",
  }));
}
