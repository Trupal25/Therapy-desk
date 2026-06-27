"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "../data-table";
import { SearchInput } from "../search-input";
import { FilterSelect } from "../filter-select";
import { PlanBadge } from "../plan-badge";
import { StatusBadge } from "../status-badge";
import { format } from "date-fns";
import type { PracticeRow } from "@/lib/admin-types";

interface PracticesClientProps {
  practices: (Omit<PracticeRow, "createdAt"> & { createdAt: string | null })[];
  total: number;
  page: number;
}

export function PracticesClient({ practices, total, page }: PracticesClientProps) {
  const router = useRouter();
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Practices</h1>
        <p className="text-sm text-muted-foreground">Manage all tenant organizations</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search by name, slug, or email..." />
        <FilterSelect
          label="Plans"
          paramName="plan"
          options={[
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro" },
            { value: "enterprise", label: "Enterprise" },
          ]}
        />
      </div>

      <DataTable
        columns={[
          { header: "Practice", accessor: (r: any) => r.name },
          { header: "Slug", accessor: (r: any) => r.slug },
          { header: "Plan", accessor: (r: any) => <PlanBadge plan={r.plan} /> },
          { header: "Owner", accessor: (r: any) => r.ownerName },
          { header: "Staff", accessor: (r: any) => r.userCount },
          { header: "Clients", accessor: (r: any) => r.clientCount },
          {
            header: "SOAP Usage",
            accessor: (r: any) => {
              const pct = r.soapNotesLimit > 0 ? Math.round((r.soapNotesUsed / r.soapNotesLimit) * 100) : 0;
              return (
                <div className="flex items-center gap-2 min-w-[100px]">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {r.soapNotesUsed}/{r.soapNotesLimit}
                  </span>
                </div>
              );
            },
          },
          { header: "Status", accessor: (r: any) => <StatusBadge status={r.isActive ? "active" : "cancelled"} /> },
          {
            header: "Created",
            accessor: (r: any) => (r.createdAt ? format(new Date(r.createdAt), "MMM d, yyyy") : "—"),
          },
        ]}
        data={practices.map((p) => ({ ...p, id: p.id }))}
        page={page}
        totalPages={totalPages}
        onPageChange={(pg) => {
          const params = new URLSearchParams(window.location.search);
          params.set("page", String(pg));
          router.push(`/admin/practices?${params.toString()}`);
        }}
        onRowClick={(row) => router.push(`/admin/practices/${row.id}`)}
      />
    </div>
  );
}
