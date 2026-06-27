import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLAN_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-sage-light text-sage",
  enterprise: "bg-amber-light text-amber",
};

export function PlanBadge({ plan }: { plan: string }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border-0", PLAN_COLORS[plan] ?? "bg-muted")}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </Badge>
  );
}
