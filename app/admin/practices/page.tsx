import { verifyAdminAccess } from "@/lib/admin-auth";
import { getPractices } from "@/lib/admin-queries";
import { PracticesClient } from "../_components/practices/practices-client";

interface PracticesPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function PracticesPage({ searchParams }: PracticesPageProps) {
  await verifyAdminAccess();
  const params = await searchParams;

  const page = Number(params.page ?? "1");
  const search = params.q;
  const plan = params.plan;

  const { data, total } = await getPractices(page, 20, search, plan);

  return (
    <PracticesClient
      practices={data.map((d) => ({ ...d, createdAt: d.createdAt?.toISOString() ?? null }))}
      total={total}
      page={page}
    />
  );
}
