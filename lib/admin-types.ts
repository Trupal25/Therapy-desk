export interface OverviewKPIs {
  totalOrgs: number;
  activeOrgs: number;
  suspendedOrgs: number;
  totalUsers: number;
  totalClients: number;
  totalSoapNotes: number;
  soapNotesThisMonth: number;
  planDistribution: { plan: string; count: number }[];
}

export interface PracticeRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  ownerName: string;
  ownerEmail: string;
  soapNotesUsed: number;
  soapNotesLimit: number;
  isActive: boolean;
  createdAt: Date | null;
  userCount: number;
  clientCount: number;
}

export interface PracticeDetail extends PracticeRow {
  settings: Record<string, unknown>;
  subscription: {
    id: string;
    plan: string;
    status: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: Date | null;
  } | null;
  encryptionKey: {
    id: string;
    algorithm: string;
    keyVersion: number;
    kmsKeyId: string | null;
    createdAt: Date | null;
    rotatedAt: Date | null;
    expiresAt: Date | null;
  } | null;
  practitioners: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    specializations: string[];
    mfaEnabled: boolean;
    lastLoginAt: Date | null;
  }[];
  sessionStats: {
    total: number;
    byStatus: Record<string, number>;
    byModality: Record<string, number>;
  };
  soapStats: {
    total: number;
    byStatus: Record<string, number>;
    therapistEditedCount: number;
  };
}

export interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
  specializations: string[];
  mfaEnabled: boolean;
  lastLoginAt: Date | null;
  isActive: boolean;
}

export interface AuditRow {
  id: string;
  organizationId: string;
  organizationName: string;
  actorId: string | null;
  actorEmail: string | null;
  eventType: string;
  resourceType: string | null;
  resourceId: string | null;
  actorIp: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date | null;
}

export interface KeyRow {
  id: string;
  organizationId: string;
  organizationName: string;
  algorithm: string;
  keyVersion: number;
  kmsKeyId: string | null;
  createdAt: Date | null;
  rotatedAt: Date | null;
  expiresAt: Date | null;
}

export interface SessionStats {
  byStatus: Record<string, number>;
  byModality: Record<string, number>;
}

export interface SoapFunnelData {
  draft: number;
  reviewed: number;
  signed: number;
  amended: number;
}

export interface MonthlyGrowthPoint {
  month: string;
  orgs: number;
  users: number;
  sessions: number;
}
