"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import type { VendorExpenseSummary as VendorData } from "./types";

interface VendorCopy {
  vendorSummary?: {
    title: string;
    totalSuppliers: string;
    totalSpent: string;
    avgPerVendor: string;
    topVendor: string;
    monthlyTrend: string;
    noData: string;
    expenses: string;
    expenseCount: string;
    lastExpense: string;
    categories: string;
  };
}

interface VendorExpenseSummaryProps {
  copy: VendorCopy;
  formatAmount: (value: number) => string;
}

interface VendorStats {
  totalSuppliers: number;
  totalSpent: number;
  avgPerVendor: number;
  topVendor: string | null;
}

export default function VendorExpenseSummary({
  copy,
  formatAmount,
}: VendorExpenseSummaryProps) {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [stats, setStats] = useState<VendorStats>({
    totalSuppliers: 0,
    totalSpent: 0,
    avgPerVendor: 0,
    topVendor: null,
  });
  const [loading, setLoading] = useState(true);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  useEffect(() => {
    fetchVendorSummary();
  }, []);

  const fetchVendorSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/expenses/vendor-summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Error fetching vendor summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxAmount = useMemo(
    () => Math.max(...vendors.map((v) => v.totalAmount), 1),
    [vendors],
  );

  const vsCopy = copy.vendorSummary ?? {
    title: "Proveedores",
    totalSuppliers: "Total Proveedores",
    totalSpent: "Total Gastado",
    avgPerVendor: "Promedio por Proveedor",
    topVendor: "Mayor Proveedor",
    monthlyTrend: "Tendencia Mensual",
    noData: "Sin datos de proveedores",
    expenses: "gastos",
    expenseCount: "gastos",
    lastExpense: "Último gasto",
    categories: "Categorías",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
        <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-slate-500 dark:text-slate-400">{vsCopy.noData}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {vsCopy.totalSuppliers}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalSuppliers}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {vsCopy.totalSpent}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatAmount(stats.totalSpent)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {vsCopy.avgPerVendor}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatAmount(stats.avgPerVendor)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {vsCopy.topVendor}
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {stats.topVendor || "-"}
          </p>
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="space-y-2">
        {vendors.map((vendor) => {
          const isExpanded = expandedVendor === vendor.supplierId;
          const barWidth =
            maxAmount > 0 ? (vendor.totalAmount / maxAmount) * 100 : 0;

          return (
            <div
              key={vendor.supplierId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
            >
              {/* Vendor Header */}
              <button
                onClick={() =>
                  setExpandedVendor(isExpanded ? null : vendor.supplierId)
                }
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900 dark:text-white truncate">
                      {vendor.supplierName}
                    </h4>
                    <span className="font-bold text-slate-900 dark:text-white ml-2 flex-shrink-0">
                      {formatAmount(vendor.totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {vendor.expenseCount} {vsCopy.expenseCount}
                    </span>
                    {vendor.supplierDocument && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {vendor.supplierDocument}
                      </span>
                    )}
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-4 pt-3">
                    {/* Categories */}
                    <div>
                      <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        {vsCopy.categories}
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {vendor.categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            {cat}
                          </span>
                        ))}
                        {vendor.categories.length === 0 && (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </div>

                    {/* Last Expense */}
                    <div>
                      <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        {vsCopy.lastExpense}
                      </h5>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {vendor.lastExpenseDate
                          ? new Date(
                              vendor.lastExpenseDate,
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    {/* Monthly Trend (mini bar chart) */}
                    {vendor.monthlyTrend.length > 0 && (
                      <div className="col-span-2">
                        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          {vsCopy.monthlyTrend}
                        </h5>
                        <div className="flex items-end gap-1 h-16">
                          {vendor.monthlyTrend.map((m, i) => {
                            const trendMax = Math.max(
                              ...vendor.monthlyTrend.map((t) => t.amount),
                              1,
                            );
                            const height = (m.amount / trendMax) * 100;
                            return (
                              <div
                                key={i}
                                className="flex-1 flex flex-col items-center gap-0.5"
                              >
                                <div
                                  className="w-full rounded-t bg-indigo-400 dark:bg-indigo-500 transition-all duration-300 min-h-[2px]"
                                  style={{ height: `${height}%` }}
                                  title={`${m.month}: ${formatAmount(m.amount)}`}
                                />
                                <span className="text-[9px] text-slate-400 truncate w-full text-center">
                                  {m.month.slice(5)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
