"use client";

import { formatCurrency } from "./chartUtils";
import { Trophy, Medal } from "lucide-react";

interface TopExpense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod?: string;
}

interface TopCategory {
  category: string;
  total: number;
  count: number;
}

interface Props {
  expenses: TopExpense[];
  categories: TopCategory[];
  lang: string;
  copy: {
    titleExpenses: string;
    titleCategories: string;
    description: string;
    amount: string;
    category: string;
    date: string;
    total: string;
    count: string;
    noData: string;
    paymentMethod: string;
  };
}

export default function TopExpenses({
  expenses,
  categories,
  lang,
  copy,
}: Props) {
  const locale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 10 individual expenses */}
      <div
        className="rounded-xl border p-6 space-y-4"
        style={{
          borderColor: "hsl(var(--vp-border))",
          background: "hsl(var(--vp-bg-card))",
        }}
      >
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          <h3
            className="text-lg font-semibold"
            style={{ color: "hsl(var(--vp-text))" }}
          >
            {copy.titleExpenses}
          </h3>
        </div>

        {!expenses || expenses.length === 0 ? (
          <p className="text-sm opacity-60 text-center py-4">{copy.noData}</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp, idx) => (
              <div
                key={exp._id}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: "hsl(var(--vp-bg-card-soft))" }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background:
                      idx < 3
                        ? "hsl(var(--vp-primary))"
                        : "hsl(var(--vp-border))",
                    color: idx < 3 ? "#fff" : "hsl(var(--vp-text))",
                  }}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {exp.description}
                  </p>
                  <div className="flex gap-2 text-xs opacity-60">
                    <span>{exp.category}</span>
                    <span>·</span>
                    <span>{formatDate(exp.date)}</span>
                  </div>
                </div>
                <p
                  className="font-mono font-semibold shrink-0"
                  style={{ color: "hsl(var(--vp-primary))" }}
                >
                  {formatCurrency(exp.amount, locale)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top 5 categories */}
      <div
        className="rounded-xl border p-6 space-y-4"
        style={{
          borderColor: "hsl(var(--vp-border))",
          background: "hsl(var(--vp-bg-card))",
        }}
      >
        <div className="flex items-center gap-2">
          <Medal size={20} className="text-amber-500" />
          <h3
            className="text-lg font-semibold"
            style={{ color: "hsl(var(--vp-text))" }}
          >
            {copy.titleCategories}
          </h3>
        </div>

        {!categories || categories.length === 0 ? (
          <p className="text-sm opacity-60 text-center py-4">{copy.noData}</p>
        ) : (
          <div className="space-y-3">
            {categories.map((cat, idx) => {
              const maxTotal = categories[0]?.total || 1;
              const barWidth = (cat.total / maxTotal) * 100;

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {idx + 1}. {cat.category}
                    </span>
                    <span
                      className="font-mono"
                      style={{ color: "hsl(var(--vp-primary))" }}
                    >
                      {formatCurrency(cat.total, locale)}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "hsl(var(--vp-border))" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        background: "hsl(var(--vp-primary))",
                      }}
                    />
                  </div>
                  <p className="text-xs opacity-60">
                    {cat.count} {copy.count}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
