import { TableSkeleton, ChartSkeleton } from "../_components/skeletons";

export default function AdminAuditLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-8 w-24 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted/50 rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-12 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton />
      </div>
      <TableSkeleton rows={8} cols={7} />
    </div>
  );
}
