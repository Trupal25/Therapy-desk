import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../db";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";

export interface AdminSession {
  userId: string;
  dbUserId: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string;
}

const ADMIN_ROLES = ["admin"];

export async function verifyAdminAccess(): Promise<AdminSession> {
  const clerkAuth = await auth();
  if (!clerkAuth?.userId) {
    throw new Error("UNAUTHENTICATED");
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("UNAUTHENTICATED");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress?.trim().toLowerCase();
  if (!email) {
    throw new Error("NO_EMAIL");
  }

  const foundUsers = await db
    .select({
      id: users.id,
      role: users.role,
      fullName: users.fullName,
      organizationId: users.organizationId,
      email: users.email,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (foundUsers.length === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  const user = foundUsers[0];
  if (!ADMIN_ROLES.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return {
    userId: clerkAuth.userId,
    dbUserId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    organizationId: user.organizationId,
  };
}

export function adminErrorToResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "UNKNOWN";
  switch (message) {
    case "UNAUTHENTICATED":
    case "NO_EMAIL":
      return { status: 401, message: "Sign in required" };
    case "USER_NOT_FOUND":
      return { status: 403, message: "User not found in system" };
    case "FORBIDDEN":
      return { status: 403, message: "Admin or owner role required" };
    default:
      return { status: 500, message: "Internal error" };
  }
}
