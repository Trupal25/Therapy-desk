export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-hidden">
        <div className="border-b bg-muted/50 p-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 bg-muted-foreground/10 rounded animate-pulse" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="border-b last:border-b-0 p-3 grid gap-4"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-3">
      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
      <div className="h-8 w-16 bg-muted rounded animate-pulse" />
      <div className="h-3 w-32 bg-muted/50 rounded animate-pulse" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      <div className="h-[220px] bg-muted/30 rounded animate-pulse flex items-center justify-center">
        <div className="h-3 w-24 text-muted-foreground/40 text-xs">Loading chart...</div>
      </div>
    </div>
  );
}
