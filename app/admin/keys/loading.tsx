import { TableSkeleton } from "../_components/skeletons";

export default function AdminKeysLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-8 w-40 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted/50 rounded" />
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-60 bg-muted rounded" />
      </div>
      <TableSkeleton rows={6} cols={8} />
    </div>
  );
}
