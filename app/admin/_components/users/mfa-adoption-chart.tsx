"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartCard } from "../chart-card";

interface MfaAdoptionChartProps {
  enabled: number;
  disabled: number;
}

export function MfaAdoptionChart({ enabled, disabled }: MfaAdoptionChartProps) {
  const data = [
    { name: "MFA Enabled", value: enabled },
    { name: "MFA Disabled", value: disabled },
  ];

  return (
    <ChartCard title="MFA Adoption" description="Multi-factor authentication status">
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              <Cell fill="var(--chart-1)" />
              <Cell fill="var(--chart-4)" />
            </Pie>
            <Tooltip />
            <Legend iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
