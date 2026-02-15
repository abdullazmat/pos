"use client";

import { formatCurrency } from "./chartUtils";
import { AlertTriangle } from "lucide-react";

interface UnusualExpense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod?: string;
  categoryMean: number;
  categoryStdev: number;
  deviations: number;
}

interface Props {
  data: UnusualExpense[];
  lang: string;
  copy: {
    title: string;
    subtitle: string;
    description: string;
    amount: string;
    category: string;
    date: string;
    deviation: string;
    categoryAvg: string;
    noAnomalies: string;
    paymentMethod: string;
    deviationsAbove: string;
  };
}

export default function UnusualExpenses({ data, lang, copy }: Props) {
  const locale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="rounded-xl border p-6 space-y-4"
      style={{
        borderColor: "hsl(var(--vp-border))",
        background: "hsl(var(--vp-bg-card))",
      }}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle size={20} className="text-amber-500" />
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "hsl(var(--vp-text))" }}
          >
            {copy.title}
          </h3>
          <p className="text-xs opacity-60">{copy.subtitle}</p>
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm opacity-60">{copy.noAnomalies}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((exp) => (
            <div
              key={exp._id}
              className="p-4 rounded-lg border-l-4 border-amber-500"
              style={{ background: "hsl(var(--vp-muted))" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p
                    className="font-medium truncate"
                    style={{ color: "hsl(var(--vp-text))" }}
                  >
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs opacity-70">
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ background: "hsl(var(--vp-border))" }}
                    >
                      {exp.category}
                    </span>
                    <span>{formatDate(exp.date)}</span>
                    {exp.paymentMethod && (
                      <span className="capitalize">{exp.paymentMethod}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-rose-500">
                    {formatCurrency(exp.amount, locale)}
                  </p>
                  <p className="text-xs opacity-60">
                    {copy.categoryAvg}:{" "}
                    {formatCurrency(exp.categoryMean, locale)}
                  </p>
                </div>
              </div>
              <div
                className="mt-2 pt-2 border-t flex items-center gap-2"
                style={{ borderColor: "hsl(var(--vp-border))" }}
              >
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  {exp.deviations.toFixed(1)}σ {copy.deviationsAbove}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
