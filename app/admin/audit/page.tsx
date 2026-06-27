import { verifyAdminAccess } from "@/lib/admin-auth";
import { getAuditLogs, getAuditStats, getAuditEventDistribution } from "@/lib/admin-queries";
import { AuditClient } from "../_components/audit/audit-client";

interface AuditPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  await verifyAdminAccess();
  const params = await searchParams;

  const page = Number(params.page ?? "1");
  const eventType = params.event;
  const resourceType = params.resource;

  const [{ data, total }, stats, eventDist] = await Promise.all([
    getAuditLogs(page, 25, eventType, resourceType),
    getAuditStats(),
    getAuditEventDistribution(),
  ]);

  return (
    <AuditClient
      logs={data.map((d) => ({ ...d, createdAt: d.createdAt?.toISOString() ?? null }))}
      total={total}
      page={page}
      stats={stats}
      eventDistribution={eventDist}
    />
  );
}
