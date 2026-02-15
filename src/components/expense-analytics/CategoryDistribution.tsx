"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getColor, formatCurrency } from "./chartUtils";

interface CategoryItem {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

interface Props {
  data: CategoryItem[];
  grandTotal: number;
  lang: string;
  copy: {
    title: string;
    category: string;
    amount: string;
    percentage: string;
    count: string;
    noData: string;
  };
}

export default function CategoryDistribution({
  data,
  grandTotal,
  lang,
  copy,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-xl border p-6 text-center"
        style={{
          borderColor: "hsl(var(--vp-border))",
          background: "hsl(var(--vp-bg-card))",
        }}
      >
        <p className="text-sm opacity-60">{copy.noData}</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border p-6 space-y-6"
      style={{
        borderColor: "hsl(var(--vp-border))",
        background: "hsl(var(--vp-bg-card))",
      }}
    >
      <h3
        className="text-lg font-semibold"
        style={{ color: "hsl(var(--vp-text))" }}
      >
        {copy.title}
      </h3>

      {/* Pie chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ payload }: { payload?: CategoryItem }) =>
                payload ? `${payload.category} ${payload.percentage}%` : ""
              }
            >
              {data.map((_entry, idx) => (
                <Cell key={idx} fill={getColor(idx)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) =>
                formatCurrency(
                  value ?? 0,
                  lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR",
                )
              }
              contentStyle={{
                background: "hsl(var(--vp-bg-card))",
                border: "1px solid hsl(var(--vp-border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid hsl(var(--vp-border))" }}>
              <th className="text-left py-2 px-3 font-medium">
                {copy.category}
              </th>
              <th className="text-right py-2 px-3 font-medium">
                {copy.amount}
              </th>
              <th className="text-right py-2 px-3 font-medium">
                {copy.percentage}
              </th>
              <th className="text-right py-2 px-3 font-medium">{copy.count}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr
                key={item.category}
                style={{ borderBottom: "1px solid hsl(var(--vp-border))" }}
              >
                <td className="py-2 px-3 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: getColor(idx) }}
                  />
                  {item.category}
                </td>
                <td className="text-right py-2 px-3 font-mono">
                  {formatCurrency(
                    item.total,
                    lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR",
                  )}
                </td>
                <td className="text-right py-2 px-3">{item.percentage}%</td>
                <td className="text-right py-2 px-3">{item.count}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr
              className="font-semibold"
              style={{ borderTop: "2px solid hsl(var(--vp-border))" }}
            >
              <td className="py-2 px-3">Total</td>
              <td className="text-right py-2 px-3 font-mono">
                {formatCurrency(
                  grandTotal,
                  lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR",
                )}
              </td>
              <td className="text-right py-2 px-3">100%</td>
              <td className="text-right py-2 px-3">
                {data.reduce((s, d) => s + d.count, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
