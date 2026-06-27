"use client";

import { StatusBadge } from "../status-badge";
import { format } from "date-fns";

interface RecentAuditFeedProps {
  events: {
    id: string;
    eventType: string;
    resourceType: string | null;
    organizationName: string;
    createdAt: string | null;
  }[];
}

export function RecentAuditFeed({ events }: RecentAuditFeedProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No recent events</p>;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="flex items-center gap-3 rounded-lg p-2">
          <StatusBadge status={event.eventType} />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">
              <span className="font-medium">{event.organizationName}</span>
              {event.resourceType && (
                <span className="text-muted-foreground"> — {event.resourceType.replace(/_/g, " ")}</span>
              )}
            </p>
          </div>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {event.createdAt ? format(new Date(event.createdAt), "MMM d, HH:mm") : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
