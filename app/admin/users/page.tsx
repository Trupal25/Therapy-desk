import { verifyAdminAccess } from "@/lib/admin-auth";
import { getUsers, getUserRoleDistribution, getMfaAdoption } from "@/lib/admin-queries";
import { UsersClient } from "../_components/users/users-client";

interface UsersPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  await verifyAdminAccess();
  const params = await searchParams;

  const page = Number(params.page ?? "1");
  const search = params.q;
  const role = params.role;

  const [{ data, total }, roleDist, mfa] = await Promise.all([
    getUsers(page, 20, search, role),
    getUserRoleDistribution(),
    getMfaAdoption(),
  ]);

  return (
    <UsersClient
      users={data.map((d) => ({ ...d, lastLoginAt: d.lastLoginAt?.toISOString() ?? null }))}
      total={total}
      page={page}
      roleDistribution={roleDist}
      mfaEnabled={mfa.enabled}
      mfaDisabled={mfa.disabled}
    />
  );
}
