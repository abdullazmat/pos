"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Trash2,
  Save,
  BarChart3,
} from "lucide-react";
import { toast } from "react-toastify";
import type { FilterState, SavedFilterPreset, SupplierOption } from "./types";
import { DEFAULT_FILTER_STATE } from "./types";
import type { ExpenseCopy } from "./i18n";

interface ExpenseFiltersProps {
  copy: ExpenseCopy;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  allCategories: string[];
  suppliers: SupplierOption[];
  hasActiveFilters: boolean;
  filteredCount: number;
  filteredTotal: number;
  categorySubtotals: [string, number][];
  formatAmount: (value: number) => string;
}

export default function ExpenseFilters({
  copy,
  filters,
  onFiltersChange,
  allCategories,
  suppliers,
  hasActiveFilters,
  filteredCount,
  filteredTotal,
  categorySubtotals,
  formatAmount,
}: ExpenseFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [presets, setPresets] = useState<SavedFilterPreset[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");

  // Fetch saved presets
  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/expenses/filter-presets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPresets(data.presets || []);
      }
    } catch {
      /* silent */
    }
  };

  const savePreset = async () => {
    if (!presetName.trim()) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/expenses/filter-presets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: presetName.trim(), filters }),
      });
      if (res.ok) {
        toast.success(copy.filters.presetSaved);
        setPresetName("");
        setShowSavePreset(false);
        fetchPresets();
      } else {
        toast.error(copy.filters.presetError);
      }
    } catch {
      toast.error(copy.filters.presetError);
    }
  };

  const deletePreset = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/expenses/filter-presets?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(copy.filters.presetDeleted);
        fetchPresets();
      }
    } catch {
      /* silent */
    }
  };

  const applyPreset = (preset: SavedFilterPreset) => {
    onFiltersChange(preset.filters);
    setShowPresets(false);
  };

  const clearFilters = () => {
    onFiltersChange({ ...DEFAULT_FILTER_STATE });
  };

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      const updated = { ...filters, [key]: value };
      // Clear custom dates when changing preset
      if (key === "datePreset" && value !== "custom") {
        updated.dateFrom = "";
        updated.dateTo = "";
      }
      onFiltersChange(updated);
    },
    [filters, onFiltersChange],
  );

  return (
    <div className="space-y-3">
      {/* Filter Toggle + Preset Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
            showFilters || hasActiveFilters
              ? "border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
              : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Filter className="w-4 h-4" />
          {showFilters ? copy.filters.hideFilters : copy.filters.showFilters}
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          )}
        </button>

        {/* Saved Presets Dropdown */}
        {presets.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              {copy.filters.savedPresets}
              {showPresets ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {showPresets && (
              <div className="absolute z-20 mt-1 left-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
                {presets.map((preset) => (
                  <div
                    key={preset._id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <button
                      onClick={() => applyPreset(preset)}
                      className="flex-1 text-left text-sm text-slate-900 dark:text-slate-200 truncate"
                    >
                      {preset.name}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePreset(preset._id);
                      }}
                      className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Current as Preset */}
        {hasActiveFilters && (
          <>
            {showSavePreset ? (
              <div className="flex items-center gap-1.5">
                <input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder={copy.filters.presetName}
                  className="px-2 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") savePreset();
                    if (e.key === "Escape") setShowSavePreset(false);
                  }}
                  autoFocus
                />
                <button
                  onClick={savePreset}
                  disabled={!presetName.trim()}
                  className="p-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowSavePreset(false)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSavePreset(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {copy.filters.savePreset}
              </button>
            )}
          </>
        )}

        {hasActiveFilters && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredCount} {copy.filters.results}
          </span>
        )}
      </div>

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
          {/* Row 1: Search + Date preset */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder={copy.filters.search}
                className="vp-input pl-9"
              />
            </div>
            <select
              value={filters.datePreset}
              onChange={(e) => updateFilter("datePreset", e.target.value)}
              className="vp-input"
            >
              <option value="all">
                {copy.filters.dateRange}: {copy.filters.all}
              </option>
              <option value="currentMonth">{copy.filters.currentMonth}</option>
              <option value="previousMonth">
                {copy.filters.previousMonth}
              </option>
              <option value="currentYear">{copy.filters.currentYear}</option>
              <option value="custom">{copy.filters.custom}</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {filters.datePreset === "custom" && (
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className="vp-input"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className="vp-input"
              />
            </div>
          )}

          {/* Row 2: Category, Source, Payment Method */}
          <div className="grid gap-3 md:grid-cols-4">
            <select
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="vp-input"
            >
              <option value="all">{copy.filters.allCategories}</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filters.source}
              onChange={(e) => updateFilter("source", e.target.value)}
              className="vp-input"
            >
              <option value="all">
                {copy.filters.source}: {copy.filters.all}
              </option>
              <option value="manual">{copy.filters.sources.manual}</option>
              <option value="vendor">{copy.filters.sources.vendor}</option>
              <option value="recurring">
                {copy.filters.sources.recurring}
              </option>
              <option value="import">{copy.filters.sources.import}</option>
            </select>
            <select
              value={filters.paymentMethod}
              onChange={(e) => updateFilter("paymentMethod", e.target.value)}
              className="vp-input"
            >
              <option value="all">{copy.filters.allPaymentMethods}</option>
              <option value="cash">{copy.filters.sources.manual}</option>
              <option value="card">{copy.filters.source}</option>
              <option value="transfer">{copy.filters.source}</option>
            </select>
            <select
              value={filters.supplier}
              onChange={(e) => updateFilter("supplier", e.target.value)}
              className="vp-input"
            >
              <option value="all">{copy.filters.allVendors}</option>
              <option value="none">{copy.filters.noVendor}</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Row 3: Amount range, Reviewed, Clear */}
          <div className="grid gap-3 md:grid-cols-4">
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder={copy.filters.min}
                value={filters.amountMin}
                onChange={(e) => updateFilter("amountMin", e.target.value)}
                className="vp-input"
                step="0.01"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder={copy.filters.max}
                value={filters.amountMax}
                onChange={(e) => updateFilter("amountMax", e.target.value)}
                className="vp-input"
                step="0.01"
              />
            </div>
            <select
              value={filters.reviewed}
              onChange={(e) => updateFilter("reviewed", e.target.value)}
              className="vp-input"
            >
              <option value="all">
                {copy.filters.reviewed}: {copy.filters.all}
              </option>
              <option value="yes">{copy.filters.reviewedYes}</option>
              <option value="no">{copy.filters.reviewedNo}</option>
            </select>
            <div /> {/* spacer */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                {copy.filters.clearFilters}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Subtotals Summary */}
      {hasActiveFilters && categorySubtotals.length > 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            {copy.filters.subtotalBy}
          </h4>
          <div className="space-y-1.5">
            {categorySubtotals.map(([cat, amt]) => {
              const pct = filteredTotal > 0 ? (amt / filteredTotal) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-2 text-sm">
                  <span className="w-24 truncate text-slate-700 dark:text-slate-300 text-xs">
                    {cat}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-24 text-right text-xs font-medium text-slate-900 dark:text-white">
                    {formatAmount(amt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
