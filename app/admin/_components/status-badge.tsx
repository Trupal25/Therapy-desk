import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  no_show: "bg-stone-50 text-stone-600 border-stone-200",
  draft: "bg-stone-50 text-stone-600 border-stone-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  signed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amended: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  past_due: "bg-red-50 text-red-700 border-red-200",
  trialing: "bg-blue-50 text-blue-700 border-blue-200",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", STATUS_STYLES[status] ?? "bg-muted")}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </Badge>
  );
}
