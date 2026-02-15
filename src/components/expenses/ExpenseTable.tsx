"use client";

import {
  Trash2,
  FileSpreadsheet,
  Paperclip,
  ShieldCheck,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import type { Expense } from "./types";
import type { ExpenseCopy } from "./i18n";

type SelectionState = "none" | "some" | "all";

interface ExpenseTableProps {
  copy: ExpenseCopy;
  expenses: Expense[];
  loading: boolean;
  selectedIds: Set<string>;
  formatAmount: (value: number) => string;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDelete: (id: string) => void;
  selectionState: SelectionState;
}

export default function ExpenseTable({
  copy,
  expenses,
  loading,
  selectedIds,
  formatAmount,
  onToggleSelect,
  onToggleSelectAll,
  onDelete,
  selectionState,
}: ExpenseTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 px-2 w-8">
                <button
                  onClick={onToggleSelectAll}
                  className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title={copy.batch.selectAll}
                >
                  {selectionState === "all" ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : selectionState === "some" ? (
                    <MinusSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="text-left py-2 px-3">{copy.labels.date}</th>
              <th className="text-left py-2 px-3">{copy.labels.description}</th>
              <th className="text-left py-2 px-3">{copy.labels.category}</th>
              <th className="text-right py-2 px-3">{copy.labels.amount}</th>
              <th className="text-left py-2 px-3">{copy.filters.source}</th>
              <th className="text-center py-2 px-2">
                <ShieldCheck className="w-3.5 h-3.5 mx-auto" />
              </th>
              <th className="text-left py-2 px-3">{copy.labels.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {/* Loading skeleton */}
            {loading &&
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={`loading-${idx}`} className="animate-pulse">
                  <td className="py-3 px-2">
                    <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                </tr>
              ))}

            {/* Expense rows */}
            {expenses.map((expense) => (
              <tr
                key={expense._id}
                className={`text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  selectedIds.has(expense._id)
                    ? "bg-indigo-50/50 dark:bg-indigo-500/5"
                    : ""
                }`}
              >
                <td className="py-2 px-2">
                  <button
                    onClick={() => onToggleSelect(expense._id)}
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {selectedIds.has(expense._id) ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </td>
                <td className="py-2 px-3 whitespace-nowrap">
                  {expense.date?.slice(0, 10)}
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-1.5">
                    {expense.description}
                    {expense.supplier && (
                      <span className="text-xs text-blue-500 dark:text-blue-400">
                        ({expense.supplier.name})
                      </span>
                    )}
                    {expense.attachment?.fileUrl && (
                      <a
                        href={expense.attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-indigo-500 hover:text-indigo-400 transition-colors"
                        title={expense.attachment.fileName}
                      >
                        {expense.attachment.mimeType === "application/pdf" ? (
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        ) : (
                          <Paperclip className="w-3.5 h-3.5" />
                        )}
                      </a>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3">{expense.category || "-"}</td>
                <td className="py-2 px-3 text-right font-medium">
                  {formatAmount(expense.amount)}
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${
                      expense.source === "vendor"
                        ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                        : expense.source === "recurring"
                          ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                          : expense.source === "import"
                            ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {
                      copy.filters.sources[
                        (expense.source ||
                          "manual") as keyof typeof copy.filters.sources
                      ]
                    }
                  </span>
                </td>
                <td className="py-2 px-2 text-center">
                  {expense.reviewed && (
                    <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mx-auto" />
                  )}
                </td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => onDelete(expense._id)}
                    className="text-red-600 hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {!expenses.length && !loading && (
              <tr>
                <td
                  colSpan={8}
                  className="py-4 text-center text-slate-500 dark:text-slate-400"
                >
                  {copy.labels.noData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
