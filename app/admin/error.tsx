"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (error.message === "FORBIDDEN" || error.message === "USER_NOT_FOUND") {
      router.replace("/app");
    }
  }, [error.message, router]);

  if (error.message === "UNAUTHENTICATED") {
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-sm text-muted-foreground">Redirecting...</p>
    </div>
  );
}
