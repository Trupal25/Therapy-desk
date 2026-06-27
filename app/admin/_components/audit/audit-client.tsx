"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "../data-table";
import { FilterSelect } from "../filter-select";
import { StatusBadge } from "../status-badge";
import { AuditEventChart } from "./audit-event-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { AuditRow } from "@/lib/admin-types";

interface AuditClientProps {
  logs: (Omit<AuditRow, "createdAt"> & { createdAt: string | null })[];
  total: number;
  page: number;
  stats: { today: number; thisWeek: number; thisMonth: number };
  eventDistribution: { eventType: string; count: number }[];
}

export function AuditClient({ logs, total, page, stats, eventDistribution }: AuditClientProps) {
  const router = useRouter();
  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Append-only compliance trail</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Events Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Events This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.thisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Events This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.thisMonth}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AuditEventChart data={eventDistribution} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          label="Event Types"
          paramName="event"
          options={[
            { value: "create", label: "Create" },
            { value: "update", label: "Update" },
            { value: "delete", label: "Delete" },
            { value: "read", label: "Read" },
            { value: "login", label: "Login" },
            { value: "logout", label: "Logout" },
            { value: "key_rotation", label: "Key Rotation" },
          ]}
        />
        <FilterSelect
          label="Resources"
          paramName="resource"
          options={[
            { value: "organization", label: "Organization" },
            { value: "user", label: "User" },
            { value: "client", label: "Client" },
            { value: "session", label: "Session" },
            { value: "soap_note", label: "SOAP Note" },
          ]}
        />
      </div>

      <DataTable
        columns={[
          {
            header: "Time",
            accessor: (r: any) =>
              r.createdAt ? format(new Date(r.createdAt), "MMM d, yyyy HH:mm") : "—",
            className: "whitespace-nowrap",
          },
          { header: "Organization", accessor: (r: any) => r.organizationName },
          { header: "Actor", accessor: (r: any) => r.actorEmail ?? "System" },
          {
            header: "Event",
            accessor: (r: any) => <StatusBadge status={r.eventType} />,
          },
          {
            header: "Resource",
            accessor: (r: any) =>
              r.resourceType
                ? `${r.resourceType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}${r.resourceId ? ` (${r.resourceId.slice(0, 8)}...)` : ""}`
                : "—",
          },
          {
            header: "IP",
            accessor: (r: any) => r.actorIp ?? "—",
            className: "font-mono text-xs",
          },
        ]}
        data={logs.map((l) => ({ ...l, id: l.id }))}
        page={page}
        totalPages={totalPages}
        onPageChange={(pg) => {
          const params = new URLSearchParams(window.location.search);
          params.set("page", String(pg));
          router.push(`/admin/audit?${params.toString()}`);
        }}
      />
    </div>
  );
}
