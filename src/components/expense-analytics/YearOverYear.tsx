"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatPercent, MONTH_NAMES } from "./chartUtils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface YoYCategory {
  category: string;
  currentYear: number;
  lastYear: number;
  variation: number;
}

interface YoYData {
  categories: YoYCategory[];
  currentTotal: number;
  lastTotal: number;
  totalVariation: number;
  currentMonth: number;
  currentYear: number;
}

interface Props {
  data: YoYData;
  lang: string;
  copy: {
    title: string;
    currentYear: string;
    lastYear: string;
    variation: string;
    category: string;
    total: string;
    increase: string;
    decrease: string;
    noChange: string;
    noData: string;
  };
}

export default function YearOverYear({ data, lang, copy }: Props) {
  const monthNames = MONTH_NAMES[lang] || MONTH_NAMES.es;

  if (!data || !data.categories || data.categories.length === 0) {
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

  const locale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR";
  const monthLabel = monthNames[data.currentMonth - 1];

  const VariationBadge = ({ variation }: { variation: number }) => {
    if (variation > 0)
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          <TrendingUp size={12} /> {formatPercent(variation)}
        </span>
      );
    if (variation < 0)
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <TrendingDown size={12} /> {formatPercent(variation)}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        <Minus size={12} /> 0%
      </span>
    );
  };

  return (
    <div
      className="rounded-xl border p-6 space-y-6"
      style={{
        borderColor: "hsl(var(--vp-border))",
        background: "hsl(var(--vp-bg-card))",
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3
          className="text-lg font-semibold"
          style={{ color: "hsl(var(--vp-text))" }}
        >
          {copy.title}
        </h3>
        <VariationBadge variation={data.totalVariation} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-lg"
          style={{ background: "hsl(var(--vp-muted))" }}
        >
          <p className="text-xs opacity-60">
            {monthLabel} {data.currentYear}
          </p>
          <p
            className="text-xl font-bold mt-1"
            style={{ color: "hsl(var(--vp-primary))" }}
          >
            {formatCurrency(data.currentTotal, locale)}
          </p>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{ background: "hsl(var(--vp-muted))" }}
        >
          <p className="text-xs opacity-60">
            {monthLabel} {data.currentYear - 1}
          </p>
          <p className="text-xl font-bold mt-1">
            {formatCurrency(data.lastTotal, locale)}
          </p>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{ background: "hsl(var(--vp-muted))" }}
        >
          <p className="text-xs opacity-60">{copy.variation}</p>
          <p className="text-xl font-bold mt-1">
            {formatPercent(data.totalVariation)}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.categories}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--vp-border))"
            />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number | undefined, name?: string) => [
                formatCurrency(value ?? 0, locale),
                name ?? "",
              ]}
              contentStyle={{
                background: "hsl(var(--vp-bg-card))",
                border: "1px solid hsl(var(--vp-border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="currentYear"
              name={`${monthLabel} ${data.currentYear}`}
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="lastYear"
              name={`${monthLabel} ${data.currentYear - 1}`}
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Variation table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid hsl(var(--vp-border))" }}>
              <th className="text-left py-2 px-3 font-medium">
                {copy.category}
              </th>
              <th className="text-right py-2 px-3 font-medium">
                {data.currentYear}
              </th>
              <th className="text-right py-2 px-3 font-medium">
                {data.currentYear - 1}
              </th>
              <th className="text-right py-2 px-3 font-medium">
                {copy.variation}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((cat) => (
              <tr
                key={cat.category}
                style={{ borderBottom: "1px solid hsl(var(--vp-border))" }}
              >
                <td className="py-2 px-3">{cat.category}</td>
                <td className="text-right py-2 px-3 font-mono">
                  {formatCurrency(cat.currentYear, locale)}
                </td>
                <td className="text-right py-2 px-3 font-mono">
                  {formatCurrency(cat.lastYear, locale)}
                </td>
                <td className="text-right py-2 px-3">
                  <VariationBadge variation={cat.variation} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
