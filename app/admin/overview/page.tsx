import {
  getOverviewKPIs,
  getSoapFunnelData,
  getSessionDistribution,
  getMonthlyGrowth,
  getRecentOrgs,
  getRecentAuditEvents,
} from "@/lib/admin-queries";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { OverviewClient } from "../_components/overview-client";

export default async function OverviewPage() {
  await verifyAdminAccess();

  const [kpis, soapFunnel, sessionDist, monthlyGrowth, recentOrgs, recentAudit] = await Promise.all([
    getOverviewKPIs(),
    getSoapFunnelData(),
    getSessionDistribution(),
    getMonthlyGrowth(),
    getRecentOrgs(),
    getRecentAuditEvents(),
  ]);

  return (
    <OverviewClient
      kpis={kpis}
      soapFunnel={soapFunnel}
      sessionDist={sessionDist}
      monthlyGrowth={monthlyGrowth}
      recentOrgs={recentOrgs.map((o: { id: string; name: string; plan: string; createdAt: Date | null }) => ({
        ...o,
        createdAt: o.createdAt?.toISOString() ?? null,
      }))}
      recentAudit={recentAudit.map((e: { id: string; eventType: string; resourceType: string | null; organizationName: string; createdAt: Date | null }) => ({
        ...e,
        createdAt: e.createdAt?.toISOString() ?? null,
      }))}
    />
  );
}
