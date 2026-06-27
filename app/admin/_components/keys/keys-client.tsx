"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "../search-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertTriangle, KeyRound, RotateCw } from "lucide-react";
import { rotateKey } from "@/app/admin/_actions/admin-actions";
import type { KeyRow } from "@/lib/admin-types";

interface KeysClientProps {
  keys: (Omit<KeyRow, "createdAt" | "rotatedAt" | "expiresAt"> & { createdAt: string | null; rotatedAt: string | null; expiresAt: string | null })[];
}

export function KeysClient({ keys }: KeysClientProps) {
  const router = useRouter();
  const [rotating, setRotating] = useState<string | null>(null);

  async function handleRotate(keyId: string, orgId: string) {
    try {
      setRotating(keyId);
      await rotateKey(orgId);
      toast.success("Key rotated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to rotate key");
    } finally {
      setRotating(null);
    }
  }

  const expired = keys.filter((k) => k.expiresAt && new Date(k.expiresAt) < new Date());
  const neverRotated = keys.filter((k) => !k.rotatedAt);
  const stale = keys.filter((k) => k.rotatedAt && k.createdAt && new Date(k.createdAt) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Encryption Keys</h1>
        <p className="text-sm text-muted-foreground">
          AES-256-GCM key management across all organizations
        </p>
      </div>

      {expired.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="size-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-700">
              {expired.length} key{expired.length > 1 ? "s have" : " has"} expired. Rotation recommended.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search by organization name or ID..." />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Organization</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Algorithm</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Version</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">KMS Ref</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Created</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Rotated</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Expires</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                  No encryption keys found
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="hover:bg-muted/30">
                  <td className="p-3">
                    <p className="text-sm font-medium">{key.organizationName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{key.organizationId.slice(0, 8)}...</p>
                  </td>
                  <td className="p-3 text-sm">{key.algorithm}</td>
                  <td className="p-3">
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded text-xs">
                      v{key.keyVersion}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground font-mono">
                    {key.kmsKeyId ?? "HKDF"}
                  </td>
                  <td className="p-3 text-sm">
                    {key.createdAt ? format(new Date(key.createdAt), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="p-3 text-sm">
                    {key.rotatedAt ? format(new Date(key.rotatedAt), "MMM d, yyyy") : (
                      <span className="text-amber-600 font-medium text-xs">Not rotated</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    {key.expiresAt ? (
                      new Date(key.expiresAt) < new Date() ? (
                        <span className="text-red-600 font-medium">Expired</span>
                      ) : (
                        format(new Date(key.expiresAt), "MMM d, yyyy")
                      )
                    ) : "—"}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRotate(key.id, key.organizationId)}
                      disabled={rotating === key.id}
                    >
                      <RotateCw className={`size-3 mr-1 ${rotating === key.id ? "animate-spin" : ""}`} />
                      {rotating === key.id ? "Rotating..." : "Rotate"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
