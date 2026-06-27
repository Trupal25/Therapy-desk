import { redirect } from "next/navigation";
import { verifyAdminAccess } from "@/lib/admin-auth";

export default async function AdminPage() {
  await verifyAdminAccess();
  redirect("/admin/overview");
}
