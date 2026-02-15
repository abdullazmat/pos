// ─── Shared expense types for all expense components ─────────────────

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  category?: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  source?: string;
  reviewed?: boolean;
  reviewedAt?: string;
  supplier?: { _id: string; name: string; document?: string } | null;
  attachment?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  };
  user?: { fullName: string };
}

export interface SupplierOption {
  _id: string;
  name: string;
  document?: string;
}

export interface RecurringExpense {
  _id: string;
  description: string;
  category?: string;
  baseAmount: number;
  frequency: "monthly" | "weekly" | "biweekly" | "annual";
  executionDay: number;
  startDate: string;
  endDate?: string | null;
  active: boolean;
  requiresConfirmation: boolean;
  paymentMethod: string;
  notes?: string;
  lastGeneratedDate?: string | null;
  supplier?: { _id: string; name: string; document?: string } | null;
  user?: { fullName: string };
}

export interface PendingExpense {
  _id: string;
  description: string;
  category?: string;
  baseAmount: number;
  frequency: string;
  paymentMethod: string;
  notes?: string;
}

export interface CategorySuggestion {
  category: string;
  confidence: "high" | "medium" | "low";
  source: "rule" | "history";
}

export interface BudgetCard {
  _id: string;
  category: string;
  period: "monthly" | "quarterly" | "annual";
  limitAmount: number;
  month?: number;
  year: number;
  alert80Sent: boolean;
  alert100Sent: boolean;
  emailAlerts: boolean;
  spent: number;
  percentage: number;
  remaining: number;
}

export interface ImportPreviewRow {
  date: string;
  description: string;
  category: string;
  amount: string;
  notes: string;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportLog {
  _id: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  status: string;
  createdAt: string;
  user?: { fullName: string };
}

export interface SavedFilterPreset {
  _id: string;
  name: string;
  filters: FilterState;
  isDefault?: boolean;
  createdAt: string;
}

export interface FilterState {
  search: string;
  datePreset: string;
  dateFrom: string;
  dateTo: string;
  category: string;
  source: string;
  amountMin: string;
  amountMax: string;
  paymentMethod: string;
  reviewed: string;
  supplier: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  search: "",
  datePreset: "all",
  dateFrom: "",
  dateTo: "",
  category: "all",
  source: "all",
  amountMin: "",
  amountMax: "",
  paymentMethod: "all",
  reviewed: "all",
  supplier: "all",
};

export interface VendorExpenseSummary {
  supplierId: string;
  supplierName: string;
  supplierDocument?: string;
  totalAmount: number;
  expenseCount: number;
  lastExpenseDate: string;
  categories: string[];
  monthlyTrend: { month: string; amount: number }[];
}

export type ExpenseCopyType = typeof import("./i18n").EXPENSE_COPY.en;
