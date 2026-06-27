"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlanBadge } from "../plan-badge";
import { StatusBadge } from "../status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { toast } from "sonner";
import { Building2, KeyRound, Shield, Users } from "lucide-react";
import { updatePlan, toggleActive, rotateKey } from "@/app/admin/_actions/admin-actions";
import type { PracticeDetail } from "@/lib/admin-types";

interface PracticeDetailClientProps {
  practice: PracticeDetail;
}

export function PracticeDetailClient({ practice }: PracticeDetailClientProps) {
  const router = useRouter();
  const [planDialog, setPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(practice.plan);
  const [isSuspending, setIsSuspending] = useState(false);
  const [rotating, setRotating] = useState<string | null>(null);

  async function handleUpdatePlan() {
    try {
      await updatePlan(practice.id, selectedPlan as any);
      toast.success(`Plan updated to ${selectedPlan}`);
      setPlanDialog(false);
      router.refresh();
    } catch {
      toast.error("Failed to update plan");
    }
  }

  async function handleToggleActive() {
    try {
      setIsSuspending(true);
      await toggleActive(practice.id, practice.isActive);
      toast.success(practice.isActive ? "Practice suspended" : "Practice reactivated");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsSuspending(false);
    }
  }

  async function handleRotateKey() {
    try {
      setRotating(practice.id);
      await rotateKey(practice.id);
      toast.success("Encryption key rotated");
      router.refresh();
    } catch {
      toast.error("Failed to rotate key");
    } finally {
      setRotating(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{practice.name}</h1>
            <PlanBadge plan={practice.plan} />
            <StatusBadge status={practice.isActive ? "active" : "cancelled"} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {practice.slug} — Created {practice.createdAt ? format(new Date(practice.createdAt), "MMM d, yyyy") : "unknown date"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={planDialog} onOpenChange={setPlanDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shield className="size-4 mr-2" />
                Change Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Plan — {practice.name}</DialogTitle>
                <DialogDescription>
                  Update the subscription plan tier and SOAP note limits.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium mb-2 block">Plan Tier</label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (10 notes/mo)</SelectItem>
                    <SelectItem value="pro">Pro (100 notes/mo)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1000 notes/mo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setPlanDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePlan}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant={practice.isActive ? "destructive" : "default"}
            onClick={handleToggleActive}
            disabled={isSuspending}
          >
            {practice.isActive ? "Suspend" : "Reactivate"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{practice.userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{practice.clientCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{practice.sessionStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SOAP Notes</CardTitle>
            <Shield className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{practice.soapStats.total}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {practice.subscription ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={practice.subscription.status} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <PlanBadge plan={practice.subscription.plan} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SOAP Notes</span>
                  <span>{practice.soapNotesUsed} / {practice.soapNotesLimit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stripe Customer</span>
                  <span className="text-xs">{practice.subscription.stripeCustomerId ?? "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Period End</span>
                  <span>{practice.subscription.currentPeriodEnd ? format(new Date(practice.subscription.currentPeriodEnd), "MMM d, yyyy") : "—"}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min((practice.soapNotesUsed / practice.soapNotesLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No subscription record</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Encryption Key</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotateKey}
              disabled={rotating === practice.id}
            >
              <KeyRound className="size-3 mr-1" />
              {rotating === practice.id ? "Rotating..." : "Rotate"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {practice.encryptionKey ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Algorithm</span>
                  <span>{practice.encryptionKey.algorithm}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Key Version</span>
                  <span className="font-mono">{practice.encryptionKey.keyVersion}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">KMS Reference</span>
                  <span className="text-xs">{practice.encryptionKey.kmsKeyId ?? "HKDF (env var)"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{practice.encryptionKey.createdAt ? format(new Date(practice.encryptionKey.createdAt), "MMM d, yyyy") : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Rotated</span>
                  <span>{practice.encryptionKey.rotatedAt ? format(new Date(practice.encryptionKey.rotatedAt), "MMM d, yyyy") : "Never"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expires</span>
                  <span>{practice.encryptionKey.expiresAt ? format(new Date(practice.encryptionKey.expiresAt), "MMM d, yyyy") : "Never"}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No encryption key record</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Practitioners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {practice.practitioners.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.fullName}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {p.mfaEnabled && (
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      MFA
                    </Badge>
                  )}
                  <StatusBadge status={p.role} />
                  {p.lastLoginAt && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Last login: {format(new Date(p.lastLoginAt), "MMM d")}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {practice.practitioners.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No practitioners found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
