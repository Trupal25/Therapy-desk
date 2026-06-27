import { verifyAdminAccess } from "@/lib/admin-auth";
import { getKeys } from "@/lib/admin-queries";
import { KeysClient } from "../_components/keys/keys-client";

interface KeysPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function KeysPage({ searchParams }: KeysPageProps) {
  await verifyAdminAccess();
  const params = await searchParams;

  const search = params.q;
  const keys = await getKeys(search);

  return <KeysClient keys={keys.map((k) => ({ ...k, createdAt: k.createdAt?.toISOString() ?? null, rotatedAt: k.rotatedAt?.toISOString() ?? null, expiresAt: k.expiresAt?.toISOString() ?? null }))} />;
}
