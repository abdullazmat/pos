"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { getColor, formatCurrency, MONTH_NAMES } from "./chartUtils";

interface MonthlyEntry {
  year: number;
  month: number;
  label: string;
  total: number;
  count: number;
  isSpike: boolean;
}

interface Props {
  data: MonthlyEntry[];
  categoryBreakdown: Record<string, string | number>[];
  categories: string[];
  lang: string;
  copy: {
    title: string;
    totalSpending: string;
    byCategory: string;
    showCategories: string;
    hideCategories: string;
    spikeDetected: string;
    month: string;
    amount: string;
    noData: string;
  };
}

export default function MonthlyTrends({
  data,
  categoryBreakdown,
  categories,
  lang,
  copy,
}: Props) {
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(categories),
  );

  const monthNames = MONTH_NAMES[lang] || MONTH_NAMES.es;

  const formatLabel = (label: string) => {
    const [y, m] = label.split("-");
    return `${monthNames[parseInt(m) - 1]} ${y.slice(2)}`;
  };

  const spikes = data.filter((d) => d.isSpike);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

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
      className="rounded-xl border p-6 space-y-4"
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
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="text-sm px-3 py-1 rounded-lg border transition-colors hover:opacity-80"
          style={{
            borderColor: "hsl(var(--vp-border))",
            color: "hsl(var(--vp-primary))",
          }}
        >
          {showCategories ? copy.hideCategories : copy.showCategories}
        </button>
      </div>

      {/* Spike alerts */}
      {spikes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {spikes.map((s) => (
            <span
              key={s.label}
              className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            >
              ⚠ {copy.spikeDetected}: {formatLabel(s.label)} (
              {formatCurrency(
                s.total,
                lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR",
              )}
              )
            </span>
          ))}
        </div>
      )}

      {/* Total spending line chart */}
      {!showCategories && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--vp-border))"
              />
              <XAxis
                dataKey="label"
                tickFormatter={formatLabel}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                labelFormatter={(label: unknown) => formatLabel(String(label))}
                formatter={(value: number | undefined) => [
                  formatCurrency(
                    value ?? 0,
                    lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR",
                  ),
                  copy.totalSpending,
                ]}
                contentStyle={{
                  background: "hsl(var(--vp-bg-card))",
                  border: "1px solid hsl(var(--vp-border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={copy.totalSpending}
              />
              {/* Highlight spikes */}
              {spikes.map((s) => (
                <ReferenceDot
                  key={s.label}
                  x={s.label}
                  y={s.total}
                  r={8}
                  fill="#f59e0b"
                  stroke="#f59e0b"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category breakdown */}
      {showCategories && (
        <>
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="text-xs px-2 py-1 rounded-full border transition-all"
                style={{
                  borderColor: getColor(idx),
                  backgroundColor: selectedCategories.has(cat)
                    ? getColor(idx)
                    : "transparent",
                  color: selectedCategories.has(cat) ? "#fff" : getColor(idx),
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryBreakdown}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--vp-border))"
                />
                <XAxis
                  dataKey="label"
                  tickFormatter={formatLabel}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  labelFormatter={(label: unknown) =>
                    formatLabel(String(label))
                  }
                  formatter={(value: number | undefined, name?: string) => [
                    formatCurrency(
                      value ?? 0,
                      lang === "en"
                        ? "en-US"
                        : lang === "pt"
                          ? "pt-BR"
                          : "es-AR",
                    ),
                    name ?? "",
                  ]}
                  contentStyle={{
                    background: "hsl(var(--vp-bg-card))",
                    border: "1px solid hsl(var(--vp-border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                {categories
                  .filter((cat) => selectedCategories.has(cat))
                  .map((cat, idx) => (
                    <Line
                      key={cat}
                      type="monotone"
                      dataKey={cat}
                      stroke={getColor(idx)}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name={cat}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
