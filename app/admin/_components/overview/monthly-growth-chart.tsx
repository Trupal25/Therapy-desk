"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "../chart-card";

interface MonthlyGrowthChartProps {
  data: { month: string; orgs: number; users: number; sessions: number }[];
}

export function MonthlyGrowthChart({ data }: MonthlyGrowthChartProps) {
  return (
    <ChartCard title="Monthly Growth" description="New signups and activity over the last 12 months">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="sessions" stackId="1" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="users" stackId="2" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="orgs" stackId="3" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
