"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { PlanBadge } from "../plan-badge";
import { format } from "date-fns";

interface RecentSignup {
  id: string;
  name: string;
  plan: string;
  createdAt: string | null;
}

interface RecentSignupsFeedProps {
  orgs: RecentSignup[];
}

export function RecentSignupsFeed({ orgs }: RecentSignupsFeedProps) {
  if (orgs.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No recent signups</p>;
  }

  return (
    <div className="space-y-3">
      {orgs.map((org) => (
        <Link
          key={org.id}
          href={`/admin/practices/${org.id}`}
          className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
        >
          <div className="rounded-lg bg-primary/10 p-2">
            <Building2 className="size-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{org.name}</p>
            <p className="text-xs text-muted-foreground">
              {org.createdAt ? format(new Date(org.createdAt), "MMM d, yyyy") : "Unknown date"}
            </p>
          </div>
          <PlanBadge plan={org.plan} />
        </Link>
      ))}
    </div>
  );
}
