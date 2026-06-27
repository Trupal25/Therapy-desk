"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { ChartCard } from "../chart-card";

interface SoapFunnelChartProps {
  data: { draft: number; reviewed: number; signed: number; amended: number };
}

const STAGES = [
  { key: "draft", label: "Draft", color: "var(--chart-3)" },
  { key: "reviewed", label: "Reviewed", color: "var(--chart-2)" },
  { key: "signed", label: "Signed", color: "var(--chart-1)" },
  { key: "amended", label: "Amended", color: "var(--chart-4)" },
];

export function SoapFunnelChart({ data }: SoapFunnelChartProps) {
  const chartData = STAGES.map((stage) => ({
    name: stage.label,
    count: data[stage.key as keyof typeof data],
  }));

  return (
    <ChartCard title="SOAP Note Funnel" description="Notes by review status">
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 4, bottom: 4, left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {STAGES.map((stage, i) => (
                <Cell key={i} fill={stage.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
