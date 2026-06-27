"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "../data-table";
import { SearchInput } from "../search-input";
import { FilterSelect } from "../filter-select";
import { StatusBadge } from "../status-badge";
import { RoleDistributionChart } from "./role-distribution-chart";
import { MfaAdoptionChart } from "./mfa-adoption-chart";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { grantAdminRole } from "@/app/admin/_actions/admin-actions";
import type { UserRow } from "@/lib/admin-types";

interface UsersClientProps {
  users: (Omit<UserRow, "lastLoginAt"> & { lastLoginAt: string | null })[];
  total: number;
  page: number;
  roleDistribution: { role: string; count: number }[];
  mfaEnabled: number;
  mfaDisabled: number;
}

export function UsersClient({
  users,
  total,
  page,
  roleDistribution,
  mfaEnabled,
  mfaDisabled,
}: UsersClientProps) {
  const router = useRouter();
  const totalPages = Math.ceil(total / 20);
  const [grantingId, setGrantingId] = useState<string | null>(null);

  async function handleGrantAdmin(targetId: string) {
    setGrantingId(targetId);
    try {
      await grantAdminRole(targetId);
      toast.success("User promoted to admin");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to grant admin");
    } finally {
      setGrantingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Cross-tenant practitioner management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RoleDistributionChart data={roleDistribution} />
        <MfaAdoptionChart enabled={mfaEnabled} disabled={mfaDisabled} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search by name or email..." />
        <FilterSelect
          label="Roles"
          paramName="role"
          options={[
            { value: "owner", label: "Owner" },
            { value: "admin", label: "Admin" },
            { value: "therapist", label: "Therapist" },
            { value: "readonly", label: "Read-Only" },
          ]}
        />
      </div>

      <DataTable
        columns={[
          { header: "Name", accessor: (r: any) => r.fullName },
          { header: "Email", accessor: (r: any) => r.email },
          { header: "Organization", accessor: (r: any) => r.organizationName },
          { header: "Role", accessor: (r: any) => <StatusBadge status={r.role} /> },
          {
            header: "MFA",
            accessor: (r: any) =>
              r.mfaEnabled ? (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  Enabled
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">Off</span>
              ),
          },
          {
            header: "Last Login",
            accessor: (r: any) =>
              r.lastLoginAt ? format(new Date(r.lastLoginAt), "MMM d, yyyy") : "—",
          },
          { header: "Status", accessor: (r: any) => <StatusBadge status={r.isActive ? "active" : "cancelled"} /> },
          {
            header: "",
            accessor: (r: any) =>
              r.role !== "admin" && r.role !== "owner" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGrantAdmin(r.id);
                  }}
                  disabled={grantingId === r.id}
                  className="text-primary hover:text-primary-foreground hover:bg-primary"
                >
                  <ShieldCheck className="size-3 mr-1" />
                  {grantingId === r.id ? "..." : "Grant Admin"}
                </Button>
              ) : null,
          },
        ]}
        data={users.map((u) => ({ ...u, id: u.id }))}
        page={page}
        totalPages={totalPages}
        onPageChange={(pg) => {
          const params = new URLSearchParams(window.location.search);
          params.set("page", String(pg));
          router.push(`/admin/users?${params.toString()}`);
        }}
      />
    </div>
  );
}
