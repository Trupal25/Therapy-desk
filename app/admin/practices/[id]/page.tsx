import { verifyAdminAccess } from "@/lib/admin-auth";
import { getPracticeDetail } from "@/lib/admin-queries";
import { notFound } from "next/navigation";
import { PracticeDetailClient } from "../../_components/practices/practice-detail-client";

interface PracticeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PracticeDetailPage({ params }: PracticeDetailPageProps) {
  await verifyAdminAccess();
  const { id } = await params;

  const practice = await getPracticeDetail(id);
  if (!practice) notFound();

  return <PracticeDetailClient practice={practice} />;
}
