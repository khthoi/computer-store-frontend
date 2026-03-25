"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevenueByChannelDataPoint {
  date: string;
  online: number;
  instore: number;
}

interface RevenueByChannelChartProps {
  data: RevenueByChannelDataPoint[];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RevenueByChannelChart — stacked bar chart comparing Online vs In-store revenue.
 */
export function RevenueByChannelChart({ data }: RevenueByChannelChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-5">
      {/* Header */}
      <h3 className="text-sm font-semibold text-secondary-800 mb-4">
        Doanh thu theo kênh
      </h3>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) =>
              new Date(v).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              })
            }
          />

          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => (v / 1_000_000).toFixed(0) + "M"}
          />

          <Tooltip
            formatter={(v: number) => v.toLocaleString("vi-VN") + "₫"}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              fontSize: 12,
            }}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />

          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value: string) =>
              value === "online" ? "Online" : "Tại cửa hàng"
            }
          />

          <Bar
            dataKey="online"
            name="online"
            stackId="revenue"
            fill="#7c3aed"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="instore"
            name="instore"
            stackId="revenue"
            fill="#a78bfa"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
