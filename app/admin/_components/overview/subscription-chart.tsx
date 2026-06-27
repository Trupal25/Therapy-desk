"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartCard } from "../chart-card";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
];

interface SubscriptionChartProps {
  data: { plan: string; count: number }[];
}

export function SubscriptionChart({ data }: SubscriptionChartProps) {
  const chartData = data.map((d) => ({
    name: d.plan.charAt(0).toUpperCase() + d.plan.slice(1),
    value: d.count,
  }));

  return (
    <ChartCard title="Subscription Distribution" description="Active plans across practices">
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}


