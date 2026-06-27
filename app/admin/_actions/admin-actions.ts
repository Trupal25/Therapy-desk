"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { organizations } from "@/db/schema/organizations";
import { users } from "@/db/schema/users";
import { subscriptions } from "@/db/schema/subscriptions";
import { encryptionKeys } from "@/db/schema/encryption_keys";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { logAuditEvent } from "@/lib/audit-helper";
import { revalidateTag } from "next/cache";

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  pro: 100,
  enterprise: 1000,
};

export async function updatePlan(orgId: string, newPlan: "free" | "pro" | "enterprise") {
  const admin = await verifyAdminAccess();

  await db.transaction(async (tx: any) => {
    await tx
      .update(organizations)
      .set({ plan: newPlan, updatedAt: new Date() })
      .where(eq(organizations.id, orgId));

    const existing = await tx
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    if (existing.length > 0) {
      await tx
        .update(subscriptions)
        .set({ plan: newPlan, soapNotesLimit: PLAN_LIMITS[newPlan], updatedAt: new Date() })
        .where(eq(subscriptions.organizationId, orgId));
    } else {
      await tx.insert(subscriptions).values({
        organizationId: orgId,
        plan: newPlan,
        status: "active",
        soapNotesLimit: PLAN_LIMITS[newPlan],
      });
    }

    await logAuditEvent(tx, {
      organizationId: orgId,
      actorId: admin.dbUserId,
      eventType: "update",
      resourceType: "organization",
      resourceId: orgId,
      metadata: { action: "update_plan", newPlan, actor: admin.email },
    });
  });

  revalidateTag("admin-data", { expire: 0 });
}

export async function toggleActive(orgId: string, suspend: boolean) {
  const admin = await verifyAdminAccess();

  await db.transaction(async (tx: any) => {
    await tx
      .update(organizations)
      .set({ deletedAt: suspend ? new Date() : null, updatedAt: new Date() })
      .where(eq(organizations.id, orgId));

    await logAuditEvent(tx, {
      organizationId: orgId,
      actorId: admin.dbUserId,
      eventType: "update",
      resourceType: "organization",
      resourceId: orgId,
      metadata: { action: suspend ? "suspend_org" : "reactivate_org", actor: admin.email },
    });
  });

  revalidateTag("admin-data", { expire: 0 });
}

export async function grantAdminRole(targetUserId: string) {
  const admin = await verifyAdminAccess();

  await db.transaction(async (tx: any) => {
    const [target] = await tx
      .select({ id: users.id, role: users.role, fullName: users.fullName, email: users.email })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!target) {
      throw new Error("User not found");
    }

    if (target.role === "admin" || target.role === "owner") {
      throw new Error("User already has admin access");
    }

    await tx
      .update(users)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(users.id, targetUserId));

    await logAuditEvent(tx, {
      organizationId: admin.organizationId,
      actorId: admin.dbUserId,
      eventType: "update",
      resourceType: "user",
      resourceId: targetUserId,
      metadata: {
        action: "grant_admin",
        targetEmail: target.email,
        targetName: target.fullName,
        previousRole: target.role,
        actor: admin.email,
      },
    });
  });

  revalidateTag("admin-data", { expire: 0 });
}

export async function rotateKey(orgId: string) {
  const admin = await verifyAdminAccess();

  await db.transaction(async (tx: any) => {
    const [existing] = await tx
      .select()
      .from(encryptionKeys)
      .where(eq(encryptionKeys.organizationId, orgId))
      .limit(1);

    if (existing) {
      await tx
        .update(encryptionKeys)
        .set({
          keyVersion: existing.keyVersion + 1,
          rotatedAt: new Date(),
        })
        .where(eq(encryptionKeys.id, existing.id));
    } else {
      await tx.insert(encryptionKeys).values({
        organizationId: orgId,
        keyVersion: 1,
        algorithm: "AES-256-GCM",
      });
    }

    await logAuditEvent(tx, {
      organizationId: orgId,
      actorId: admin.dbUserId,
      eventType: "key_rotation",
      resourceType: "organization",
      resourceId: orgId,
      metadata: { action: "rotate_key", actor: admin.email },
    });
  });

  revalidateTag("admin-data", { expire: 0 });
}
