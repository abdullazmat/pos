"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  CalendarDays,
  Sparkles,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import type { Expense, SupplierOption, CategorySuggestion } from "./types";
import type { ExpenseCopy } from "./i18n";

interface QuickEntryModalProps {
  copy: ExpenseCopy;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExpenseFormData, saveAndNew: boolean) => Promise<void>;
  suppliers: SupplierOption[];
  recentExpenses: Expense[];
  formatAmount: (value: number) => string;
}

export interface ExpenseFormData {
  description: string;
  amount: string;
  category: string;
  paymentMethod: string;
  notes: string;
  date: string;
  supplier: string;
  saveAsRecurring: boolean;
  attachment?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  } | null;
}

const INITIAL_FORM: ExpenseFormData = {
  description: "",
  amount: "",
  category: "",
  paymentMethod: "cash",
  notes: "",
  date: new Date().toISOString().split("T")[0],
  supplier: "",
  saveAsRecurring: false,
  attachment: null,
};

export default function QuickEntryModal({
  copy,
  isOpen,
  onClose,
  onSave,
  suppliers,
  recentExpenses,
  formatAmount,
}: QuickEntryModalProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    ...INITIAL_FORM,
  });
  const [saveAndNew, setSaveAndNew] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Auto-suggestion states
  const [categorySuggestion, setCategorySuggestion] =
    useState<CategorySuggestion | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionDebounce, setSuggestionDebounce] =
    useState<NodeJS.Timeout | null>(null);

  // Description autocomplete
  const [descSuggestions, setDescSuggestions] = useState<string[]>([]);
  const [showDescSuggestions, setShowDescSuggestions] = useState(false);
  const [descDebounce, setDescDebounce] = useState<NodeJS.Timeout | null>(null);

  // Attachment states
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentData, setAttachmentData] = useState<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    confidence: number;
    extracted: {
      date: string | null;
      amount: number | null;
      taxId: string | null;
      issuer: string | null;
    };
    attachmentId: string | null;
  } | null>(null);

  const descInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute quick templates from recent expenses (top 5 most used descriptions)
  const templates = useCallback(() => {
    const descMap: Record<
      string,
      { count: number; category: string; amount: number; paymentMethod: string }
    > = {};
    recentExpenses.forEach((e) => {
      const key = e.description.toLowerCase();
      if (!descMap[key]) {
        descMap[key] = {
          count: 0,
          category: e.category || "",
          amount: e.amount,
          paymentMethod: e.paymentMethod,
        };
      }
      descMap[key].count++;
    });
    return Object.entries(descMap)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([desc, data]) => ({
        description: recentExpenses.find(
          (e) => e.description.toLowerCase() === desc,
        )!.description,
        ...data,
      }));
  }, [recentExpenses]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...INITIAL_FORM,
        date: new Date().toISOString().split("T")[0],
      });
      setCategorySuggestion(null);
      setAttachmentFile(null);
      setAttachmentData(null);
      setOcrResult(null);
      setOcrProcessing(false);
      setShowNotes(false);
      setShowTemplates(false);
      setSaveAndNew(false);
      setTimeout(() => descInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Ctrl+Shift+E to open
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+E to open quick entry
      if (e.ctrlKey && e.shiftKey && e.key === "E") {
        e.preventDefault();
        if (!isOpen) {
          // Trigger open from parent - this is handled in the parent component
          // We just prevent default here
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen]);

  // Modal keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Category suggestion
  const fetchCategorySuggestion = async (description: string) => {
    if (description.trim().length < 3) {
      setCategorySuggestion(null);
      return;
    }
    try {
      setSuggestionLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `/api/expenses/categorize?description=${encodeURIComponent(description)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setCategorySuggestion(data.suggestion);
      }
    } catch {
      /* silent */
    } finally {
      setSuggestionLoading(false);
    }
  };

  const debouncedSuggestion = (description: string) => {
    if (suggestionDebounce) clearTimeout(suggestionDebounce);
    const timeout = setTimeout(() => fetchCategorySuggestion(description), 400);
    setSuggestionDebounce(timeout);
  };

  const acceptSuggestion = () => {
    if (categorySuggestion) {
      setFormData({ ...formData, category: categorySuggestion.category });
      setCategorySuggestion(null);
    }
  };

  // Description autocomplete
  const fetchDescSuggestions = async (q: string) => {
    if (q.length < 2) {
      setDescSuggestions([]);
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `/api/expenses/autocomplete?q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setDescSuggestions(data.suggestions || []);
        if (data.suggestions?.length > 0) setShowDescSuggestions(true);
      }
    } catch {
      /* silent */
    }
  };

  const onDescriptionChange = (val: string) => {
    setFormData({ ...formData, description: val });
    debouncedSuggestion(val);
    if (descDebounce) clearTimeout(descDebounce);
    const t = setTimeout(() => fetchDescSuggestions(val), 300);
    setDescDebounce(t);
  };

  const selectDescSuggestion = (val: string) => {
    setFormData({ ...formData, description: val });
    setShowDescSuggestions(false);
    setDescSuggestions([]);
    debouncedSuggestion(val);
    amountInputRef.current?.focus();
  };

  // Attachment upload
  const handleAttachmentUpload = async (file: File) => {
    setAttachmentFile(file);
    setUploading(true);
    setOcrResult(null);
    try {
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/expenses/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setAttachmentData(data);
        setUploading(false);

        // Trigger OCR
        setOcrProcessing(true);
        try {
          const ocrRes = await fetch("/api/expenses/ocr", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileUrl: data.fileUrl,
              fileName: data.fileName,
              mimeType: data.mimeType,
              fileSize: data.fileSize,
            }),
          });
          if (ocrRes.ok) {
            const ocrData = await ocrRes.json();
            if (ocrData.ocrApplied && ocrData.confidence > 0) {
              setOcrResult({
                confidence: ocrData.confidence,
                extracted: ocrData.extracted,
                attachmentId: ocrData.attachmentId,
              });
            }
          }
        } catch {
          console.warn("OCR processing failed, continuing without");
        } finally {
          setOcrProcessing(false);
        }
      } else {
        toast.error("Upload failed");
        setAttachmentFile(null);
      }
    } catch {
      toast.error("Upload failed");
      setAttachmentFile(null);
    } finally {
      setUploading(false);
    }
  };

  const applyOcrResults = () => {
    if (!ocrResult?.extracted) return;
    const { date, amount, issuer } = ocrResult.extracted;
    const updates: ExpenseFormData = { ...formData };
    if (date) updates.date = date;
    if (amount) updates.amount = String(amount);
    if (issuer && !formData.description) updates.description = issuer;
    setFormData(updates);
    toast.success(copy.quickEntry.ocrApplied);
  };

  // Apply template
  const applyTemplate = (tpl: {
    description: string;
    category: string;
    amount: number;
    paymentMethod: string;
  }) => {
    setFormData({
      ...formData,
      description: tpl.description,
      category: tpl.category,
      amount: String(tpl.amount),
      paymentMethod: tpl.paymentMethod,
    });
    setShowTemplates(false);
    amountInputRef.current?.focus();
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    setSaving(true);
    try {
      const dataToSave: ExpenseFormData = {
        ...formData,
        attachment: attachmentData,
      };
      await onSave(dataToSave, saveAndNew);

      if (saveAndNew) {
        // Reset for next entry
        setFormData({
          ...INITIAL_FORM,
          date: new Date().toISOString().split("T")[0],
        });
        setCategorySuggestion(null);
        setAttachmentFile(null);
        setAttachmentData(null);
        setOcrResult(null);
        setShowNotes(false);
        setTimeout(() => descInputRef.current?.focus(), 100);
      } else {
        onClose();
      }
    } catch {
      /* error handled in parent */
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const tplList = templates();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {copy.quickEntry.title}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {copy.quickEntry.keyboardShortcut}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Templates Bar */}
        {tplList.length > 0 && (
          <div className="px-5 pt-3">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              {copy.quickEntry.templates}
              {showTemplates ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {showTemplates && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tplList.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                  >
                    <Clock className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">
                      {tpl.description}
                    </span>
                    <span className="font-medium">
                      {formatAmount(tpl.amount)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Date */}
          <div>
            <label className="vp-label flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {copy.labels.date}
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="vp-input"
              required
            />
          </div>

          {/* Description with autocomplete */}
          <div className="relative">
            <label className="vp-label">{copy.labels.description}</label>
            <input
              ref={descInputRef}
              value={formData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              onFocus={() => {
                if (descSuggestions.length > 0) setShowDescSuggestions(true);
              }}
              onBlur={() =>
                setTimeout(() => setShowDescSuggestions(false), 200)
              }
              className="vp-input"
              required
              autoComplete="off"
              placeholder={copy.labels.description}
            />
            {showDescSuggestions && descSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {descSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => selectDescSuggestion(s)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category with AI suggestion */}
          <div>
            <label className="vp-label">{copy.labels.category}</label>
            <input
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="vp-input"
              placeholder={copy.labels.category}
            />
            {categorySuggestion && !formData.category && (
              <div className="mt-1.5 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                <span className="text-indigo-700 dark:text-indigo-300 font-medium truncate">
                  {categorySuggestion.category}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                    categorySuggestion.confidence === "high"
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : categorySuggestion.confidence === "medium"
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {copy.categorize[categorySuggestion.confidence]}
                </span>
                <button
                  type="button"
                  onClick={acceptSuggestion}
                  className="ml-auto px-2 py-0.5 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex-shrink-0"
                >
                  {copy.categorize.accept}
                </button>
              </div>
            )}
            {suggestionLoading && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                {copy.categorize.suggestion}...
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="vp-label">{copy.labels.amount}</label>
            <input
              ref={amountInputRef}
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="vp-input"
              required
              min="0"
              placeholder="0.00"
            />
          </div>

          {/* Payment Method + Vendor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="vp-label">{copy.labels.paymentMethod}</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="vp-input"
              >
                <option value="cash">{copy.paymentMethods.cash}</option>
                <option value="card">{copy.paymentMethods.card}</option>
                <option value="transfer">{copy.paymentMethods.transfer}</option>
              </select>
            </div>
            <div>
              <label className="vp-label">{copy.quickEntry.vendor}</label>
              <select
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                className="vp-input"
              >
                <option value="">{copy.quickEntry.noVendor}</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Collapsible Notes */}
          <div>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              {showNotes ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {copy.quickEntry.notesCollapse}
            </button>
            {showNotes && (
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="vp-input mt-2 h-20 resize-none"
                placeholder={copy.labels.notes}
              />
            )}
          </div>

          {/* Attachment */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAttachmentUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-3.5 h-3.5" />
                {uploading
                  ? copy.quickEntry.uploading
                  : copy.quickEntry.attachFile}
              </button>
              {attachmentFile && !uploading && (
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {attachmentFile.name}
                </span>
              )}
            </div>

            {/* OCR Results Card */}
            {ocrProcessing && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-sm text-blue-700 dark:text-blue-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                {copy.quickEntry.ocrProcessing}
              </div>
            )}
            {ocrResult && (
              <div className="px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-1.5">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {copy.quickEntry.ocrComplete}
                </p>
                <div className="space-y-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                  {ocrResult.extracted.date && (
                    <p>
                      {copy.quickEntry.ocrDate}: {ocrResult.extracted.date}
                    </p>
                  )}
                  {ocrResult.extracted.amount && (
                    <p>
                      {copy.quickEntry.ocrAmount}:{" "}
                      {formatAmount(ocrResult.extracted.amount)}
                    </p>
                  )}
                  {ocrResult.extracted.taxId && (
                    <p>
                      {copy.quickEntry.ocrTaxId}: {ocrResult.extracted.taxId}
                    </p>
                  )}
                  {ocrResult.extracted.issuer && (
                    <p>
                      {copy.quickEntry.ocrIssuer}: {ocrResult.extracted.issuer}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={applyOcrResults}
                    className="px-2.5 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                  >
                    {copy.quickEntry.ocrAccept}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOcrResult(null)}
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {copy.quickEntry.ocrReject}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save as Recurring Toggle */}
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.saveAsRecurring}
              onChange={(e) =>
                setFormData({ ...formData, saveAsRecurring: e.target.checked })
              }
              className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
            />
            {copy.quickEntry.saveAsRecurring}
          </label>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>{copy.quickEntry.enterToSave}</span>
              <span>&middot;</span>
              <span>{copy.quickEntry.escToCancel}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSaveAndNew(true);
                  // Trigger form submit programmatically
                  const form = modalRef.current?.querySelector("form");
                  form?.requestSubmit();
                }}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                disabled={saving}
              >
                {copy.quickEntry.saveAndNew}
              </button>
              <button
                type="submit"
                disabled={saving || !formData.description || !formData.amount}
                className="vp-button vp-button-primary disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  copy.buttons.save
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
