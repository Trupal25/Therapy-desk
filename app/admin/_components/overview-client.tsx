"use client";

import { KpiCard } from "./kpi-card";
import { SubscriptionChart } from "./overview/subscription-chart";
import { MonthlyGrowthChart } from "./overview/monthly-growth-chart";
import { SessionStatusChart } from "./overview/session-status-chart";
import { SoapFunnelChart } from "./overview/soap-funnel-chart";
import { RecentSignupsFeed } from "./overview/recent-signups-feed";
import { RecentAuditFeed } from "./overview/recent-audit-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  FileText,
  Activity,
} from "lucide-react";
import type { OverviewKPIs, SoapFunnelData, MonthlyGrowthPoint } from "@/lib/admin-types";
import type { SessionStats } from "@/lib/admin-types";

interface OverviewClientProps {
  kpis: OverviewKPIs;
  soapFunnel: SoapFunnelData;
  sessionDist: SessionStats;
  monthlyGrowth: MonthlyGrowthPoint[];
  recentOrgs: { id: string; name: string; plan: string; createdAt: string | null }[];
  recentAudit: {
    id: string;
    eventType: string;
    resourceType: string | null;
    organizationName: string;
    createdAt: string | null;
  }[];
}

export function OverviewClient({
  kpis,
  soapFunnel,
  sessionDist,
  monthlyGrowth,
  recentOrgs,
  recentAudit,
}: OverviewClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">Platform health at a glance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Practices"
          value={kpis.totalOrgs}
          subtitle={`${kpis.activeOrgs} active, ${kpis.suspendedOrgs} suspended`}
          icon={Building2}
        />
        <KpiCard
          label="Registered Practitioners"
          value={kpis.totalUsers}
          icon={Users}
        />
        <KpiCard
          label="Total Clients"
          value={kpis.totalClients}
          icon={Users}
        />
        <KpiCard
          label="SOAP Notes Generated"
          value={kpis.totalSoapNotes}
          subtitle={`${kpis.soapNotesThisMonth} this month`}
          icon={FileText}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SubscriptionChart data={kpis.planDistribution} />
        <SessionStatusChart data={sessionDist.byStatus} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SoapFunnelChart data={soapFunnel} />
        <MonthlyGrowthChart data={monthlyGrowth} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSignupsFeed orgs={recentOrgs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Audit Events</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentAuditFeed events={recentAudit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
