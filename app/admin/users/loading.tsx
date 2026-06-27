import { TableSkeleton, ChartSkeleton } from "../_components/skeletons";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-8 w-24 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted/50 rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-60 bg-muted rounded" />
        <div className="h-9 w-[160px] bg-muted rounded" />
      </div>
      <TableSkeleton rows={8} cols={7} />
    </div>
  );
}
