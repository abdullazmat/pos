"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import { useSubscription } from "@/lib/hooks/useSubscription";
import {
  Receipt,
  Plus,
  Trash2,
  RefreshCw,
  Pause,
  Play,
  Edit2,
  Bell,
  CheckCircle,
  Clock,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Search,
  Sparkles,
  Zap,
  Settings2,
  Filter,
  ChevronDown,
  ChevronUp,
  Paperclip,
  BarChart3,
  CalendarDays,
  CheckSquare,
  Square,
  MinusSquare,
  Tag,
  ShieldCheck,
  Wallet,
  TrendingUp,
  AlertCircle,
  Building2,
  Keyboard,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  ExpenseFilters,
  QuickEntryModal,
  VendorExpenseSummary,
  ExpenseTable,
  EXPENSE_COPY as SHARED_EXPENSE_COPY,
} from "@/components/expenses";
import type { FilterState, ExpenseFormData } from "@/components/expenses";

// ─── Types ───────────────────────────────────────────────────────────
interface Expense {
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

interface SupplierOption {
  _id: string;
  name: string;
  document?: string;
}

interface BudgetCard {
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

interface RecurringExpense {
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

interface PendingExpense {
  _id: string;
  description: string;
  category?: string;
  baseAmount: number;
  frequency: string;
  paymentMethod: string;
  notes?: string;
}

interface ImportPreviewRow {
  date: string;
  description: string;
  category: string;
  amount: string;
  notes: string;
}

interface ImportValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportLog {
  _id: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  status: string;
  createdAt: string;
  user?: { fullName: string };
}

interface CategorySuggestion {
  category: string;
  confidence: "high" | "medium" | "low";
  source: "rule" | "history";
}

// ─── Default rule translations per language ──────────────────────────
const DEFAULT_CATEGORY_NAMES: Record<string, Record<string, string>> = {
  es: {
    Utilities: "Servicios",
    Payroll: "Nómina",
    Rent: "Alquiler",
    Materials: "Materiales",
    Infrastructure: "Infraestructura",
  },
  en: {
    Utilities: "Utilities",
    Payroll: "Payroll",
    Rent: "Rent",
    Materials: "Materials",
    Infrastructure: "Infrastructure",
  },
  pt: {
    Utilities: "Serviços",
    Payroll: "Folha de Pagamento",
    Rent: "Aluguel",
    Materials: "Materiais",
    Infrastructure: "Infraestrutura",
  },
};

const DEFAULT_KEYWORDS_BY_LANG: Record<string, Record<string, string[]>> = {
  es: {
    Utilities: [
      "electricidad",
      "energía",
      "luz",
      "agua",
      "plomería",
      "internet",
      "teléfono",
      "cable",
      "gas",
    ],
    Payroll: [
      "salario",
      "sueldo",
      "nómina",
      "nomina",
      "empleado",
      "pago empleado",
      "honorarios",
    ],
    Rent: ["alquiler", "arrendamiento", "local"],
    Materials: [
      "materiales",
      "materia prima",
      "insumo",
      "insumos",
      "suministro",
    ],
    Infrastructure: ["mantenimiento", "reparación", "reparacion", "arreglo"],
  },
  en: {
    Utilities: [
      "electricity",
      "energy",
      "electric",
      "power",
      "water",
      "plumbing",
      "internet",
      "wifi",
      "phone",
      "telephone",
      "cable",
      "gas",
    ],
    Payroll: ["salary", "wage", "employee payment", "payroll"],
    Rent: ["rent", "lease"],
    Materials: ["supply", "material", "raw material", "supplies"],
    Infrastructure: ["maintenance", "repair", "fix"],
  },
  pt: {
    Utilities: [
      "energia",
      "luz",
      "água",
      "encanamento",
      "internet",
      "telefone",
      "cabo",
      "gás",
    ],
    Payroll: ["salário", "folha", "pagamento funcionário", "honorário"],
    Rent: ["aluguel", "locação", "local"],
    Materials: ["materiais", "matéria prima", "insumos"],
    Infrastructure: ["manutenção", "reparo", "conserto"],
  },
};

// ─── i18n Copy ───────────────────────────────────────────────────────
const EXPENSE_COPY = {
  es: {
    premiumBadge: "Premium",
    title: "Gestión de Gastos - Premium",
    description:
      "Controla y registra todos los gastos operacionales de tu negocio",
    primaryCta: "✨ Plan Empresarial",
    secondaryCta: "Actualizar Plan",
    labels: {
      newExpense: "Nuevo Gasto",
      expenses: "Gastos",
      total: "Total",
      description: "Descripción",
      category: "Categoría",
      amount: "Monto",
      paymentMethod: "Método de pago",
      date: "Fecha",
      notes: "Notas",
      actions: "Acciones",
      noData: "No hay gastos aún",
      loading: "Cargando...",
      confirmDelete: "¿Eliminar este gasto?",
    },
    paymentMethods: {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
    },
    toasts: {
      loadError: "Error al cargar gastos",
      saveError: "Error al guardar gasto",
      deleteError: "Error al eliminar gasto",
      saved: "Gasto guardado",
      deleted: "Gasto eliminado",
    },
    buttons: {
      cancel: "Cancelar",
      save: "Guardar",
    },
    recurring: {
      title: "Gastos Recurrentes",
      subtitle: "Configura gastos que se repiten automáticamente",
      newRecurring: "Nuevo Gasto Recurrente",
      frequency: "Frecuencia",
      executionDay: "Día de ejecución",
      startDate: "Fecha de inicio",
      endDate: "Fecha de fin (opcional)",
      requiresConfirmation: "Requiere confirmación",
      baseAmount: "Monto base",
      active: "Activo",
      paused: "Pausado",
      noRecurring: "No hay gastos recurrentes configurados",
      confirmDeleteRecurring: "¿Eliminar este gasto recurrente?",
      frequencies: {
        monthly: "Mensual",
        weekly: "Semanal",
        biweekly: "Quincenal",
        annual: "Anual",
      },
      dayHelp: {
        monthly: "Día del mes (1-31)",
        weekly: "Día de la semana (1=Lun, 7=Dom)",
        biweekly: "Día de la semana (1=Lun, 7=Dom)",
        annual: "Día del mes (1-31)",
      },
      lastGenerated: "Última generación",
      never: "Nunca",
      generateNow: "Verificar Pendientes",
      pendingTitle: "Gastos Pendientes de Confirmación",
      pendingSubtitle:
        "Estos gastos recurrentes requieren tu aprobación antes de ser registrados",
      confirmExpense: "Confirmar",
      adjustAmount: "Ajustar monto",
      noPending: "No hay gastos pendientes",
      toasts: {
        saved: "Gasto recurrente guardado",
        deleted: "Gasto recurrente eliminado",
        updated: "Gasto recurrente actualizado",
        confirmed: "Gasto confirmado y registrado",
        generated: "Verificación completada",
        error: "Error al procesar gastos recurrentes",
      },
      togglePause: "Pausar/Reanudar",
      indefinite: "Indefinido",
    },
    import: {
      title: "Importar Gastos",
      subtitle: "Carga múltiples gastos desde un archivo Excel o CSV",
      uploadButton: "Seleccionar Archivo",
      downloadTemplate: "Descargar Plantilla Excel",
      validating: "Validando...",
      importing: "Importando...",
      importButton: "Importar Gastos",
      preview: "Vista Previa",
      validRows: "Filas válidas",
      errorRows: "Filas con errores",
      totalRows: "Total de filas",
      noFile: "Selecciona un archivo Excel (.xlsx) o CSV para importar",
      maxRows: "Máximo 500 registros por importación",
      importSuccess: "Importación exitosa",
      importError: "Error en la importación",
      validationErrors: "Errores de validación encontrados",
      row: "Fila",
      field: "Campo",
      error: "Error",
      importHistory: "Historial de Importaciones",
      noHistory: "Sin importaciones previas",
      status: {
        success: "Exitosa",
        partial: "Parcial",
        failed: "Fallida",
      },
      dragDrop: "Arrastra un archivo aquí o haz clic para seleccionar",
      supportedFormats: "Formatos soportados: .xlsx, .csv",
    },
    categorize: {
      suggestion: "Sugerencia",
      confidence: "Confianza",
      high: "Alta",
      medium: "Media",
      low: "Baja",
      accept: "Aceptar",
      source: {
        rule: "Regla",
        history: "Historial",
      },
      basedOn: "basado en",
      rules: "reglas",
      historicalData: "datos históricos",
      mlReady: "ML disponible",
      rulesConfig: "Reglas de categorización",
      addRule: "Agregar Regla",
      category: "Categoría",
      keywords: "Palabras clave (separadas por coma)",
      customRules: "Reglas personalizadas",
      defaultRules: "Reglas predeterminadas",
      noRules: "Sin reglas personalizadas",
      ruleSaved: "Regla guardada",
      ruleDeleted: "Regla eliminada",
      ruleError: "Error al guardar regla",
    },
    filters: {
      search: "Buscar en descripción y notas",
      dateRange: "Rango de fechas",
      currentMonth: "Mes actual",
      previousMonth: "Mes anterior",
      currentYear: "Año actual",
      custom: "Personalizado",
      all: "Todos",
      allCategories: "Todas las categorías",
      source: "Origen",
      sources: {
        manual: "Manual",
        vendor: "Proveedor",
        recurring: "Recurrente",
        import: "Importación",
      },
      amountRange: "Rango de monto",
      min: "Mín",
      max: "Máx",
      showFilters: "Mostrar filtros",
      hideFilters: "Ocultar filtros",
      clearFilters: "Limpiar filtros",
      results: "resultados",
      subtotalBy: "Subtotal por categoría",
      exportFiltered: "Exportar Filtrados",
      paymentMethod: "Método de pago",
      allPaymentMethods: "Todos los métodos",
      reviewed: "Revisado",
      reviewedStatus: "Estado de revisión",
      reviewedYes: "Revisados",
      reviewedNo: "Sin revisar",
      vendor: "Proveedor",
      allVendors: "Todos los proveedores",
      noVendor: "Sin proveedor",
    },
    quickEntry: {
      title: "Nuevo Gasto Rápido",
      saveAndNew: "Guardar y Crear Otro",
      attach: "Adjuntar",
      attachFile: "Adjuntar archivo",
      uploading: "Subiendo...",
      notesCollapse: "Agregar notas (opcional)",
      enterToSave: "Enter para guardar",
      escToCancel: "Esc para cancelar",
      ocrProcessing: "Procesando OCR...",
      ocrComplete: "Datos extraídos del comprobante",
      ocrFailed: "No se pudo extraer datos del archivo",
      ocrConfidence: "Confianza",
      ocrDate: "Fecha detectada",
      ocrAmount: "Monto detectado",
      ocrTaxId: "CUIT detectado",
      ocrIssuer: "Emisor detectado",
      ocrAccept: "Aplicar datos",
      ocrReject: "Ignorar OCR",
      ocrApplied: "Datos del comprobante aplicados",
      vendor: "Proveedor",
      selectVendor: "Seleccionar proveedor",
      noVendor: "Sin proveedor",
      saveAsRecurring: "Guardar también como recurrente",
      nextExecution: "Próxima ejecución",
    },
    batch: {
      selected: "seleccionados",
      deleteSelected: "Eliminar seleccionados",
      changeCategory: "Cambiar categoría",
      exportSelected: "Exportar selección",
      markReviewed: "Marcar revisados",
      unmarkReviewed: "Desmarcar revisados",
      confirmDelete:
        "¿Eliminar los gastos seleccionados? Esta acción no se puede deshacer.",
      batchSuccess: "Acción masiva completada",
      batchError: "Error en acción masiva",
      selectAll: "Seleccionar todos",
      newCategory: "Nueva categoría",
      reviewed: "Revisado",
      limit100: "Máximo 100 gastos por operación masiva",
    },
    budgets: {
      title: "Presupuestos",
      subtitle: "Define límites de gasto por categoría y recibe alertas",
      newBudget: "Nuevo Presupuesto",
      category: "Categoría",
      period: "Período",
      limit: "Límite",
      spent: "Gastado",
      remaining: "Restante",
      percentage: "% Consumido",
      monthly: "Mensual",
      quarterly: "Trimestral",
      annual: "Anual",
      noBudgets: "Sin presupuestos configurados",
      budgetSaved: "Presupuesto guardado",
      budgetDeleted: "Presupuesto eliminado",
      budgetError: "Error al guardar presupuesto",
      budgetExists: "Ya existe un presupuesto para esta categoría/período",
      emailAlerts: "Alertas por email",
      alert80: "Alerta al 80%",
      alert100: "Alerta al 100%",
      alertTriggered80: "¡Alerta! Se alcanzó el 80% del presupuesto en",
      alertTriggered100: "¡Alerta! Se superó el 100% del presupuesto en",
      budgetedVsActual: "Presupuestado vs Real",
      overBudget: "Sobre presupuesto",
      underBudget: "Dentro del presupuesto",
      monthLabel: "Mes",
      yearLabel: "Año",
    },
    vendorSummary: {
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
    },
  },
  en: {
    premiumBadge: "Premium",
    title: "Expenses Management - Premium",
    description: "Track and log all operational expenses for your business",
    primaryCta: "✨ Business Plan",
    secondaryCta: "Upgrade Plan",
    labels: {
      newExpense: "New Expense",
      expenses: "Expenses",
      total: "Total",
      description: "Description",
      category: "Category",
      amount: "Amount",
      paymentMethod: "Payment Method",
      date: "Date",
      notes: "Notes",
      actions: "Actions",
      noData: "No expenses yet",
      loading: "Loading...",
      confirmDelete: "Delete this expense?",
    },
    paymentMethods: {
      cash: "Cash",
      card: "Card",
      transfer: "Transfer",
    },
    toasts: {
      loadError: "Failed to load expenses",
      saveError: "Failed to save expense",
      deleteError: "Failed to delete expense",
      saved: "Expense saved",
      deleted: "Expense deleted",
    },
    buttons: {
      cancel: "Cancel",
      save: "Save",
    },
    recurring: {
      title: "Recurring Expenses",
      subtitle: "Configure expenses that repeat automatically",
      newRecurring: "New Recurring Expense",
      frequency: "Frequency",
      executionDay: "Execution Day",
      startDate: "Start Date",
      endDate: "End Date (optional)",
      requiresConfirmation: "Requires Confirmation",
      baseAmount: "Base Amount",
      active: "Active",
      paused: "Paused",
      noRecurring: "No recurring expenses configured",
      confirmDeleteRecurring: "Delete this recurring expense?",
      frequencies: {
        monthly: "Monthly",
        weekly: "Weekly",
        biweekly: "Biweekly",
        annual: "Annual",
      },
      dayHelp: {
        monthly: "Day of month (1-31)",
        weekly: "Day of week (1=Mon, 7=Sun)",
        biweekly: "Day of week (1=Mon, 7=Sun)",
        annual: "Day of month (1-31)",
      },
      lastGenerated: "Last Generated",
      never: "Never",
      generateNow: "Check Pending",
      pendingTitle: "Pending Expense Confirmations",
      pendingSubtitle:
        "These recurring expenses require your approval before being recorded",
      confirmExpense: "Confirm",
      adjustAmount: "Adjust amount",
      noPending: "No pending expenses",
      toasts: {
        saved: "Recurring expense saved",
        deleted: "Recurring expense deleted",
        updated: "Recurring expense updated",
        confirmed: "Expense confirmed and recorded",
        generated: "Check completed",
        error: "Error processing recurring expenses",
      },
      togglePause: "Pause/Resume",
      indefinite: "Indefinite",
    },
    import: {
      title: "Import Expenses",
      subtitle: "Load multiple expenses from an Excel or CSV file",
      uploadButton: "Select File",
      downloadTemplate: "Download Excel Template",
      validating: "Validating...",
      importing: "Importing...",
      importButton: "Import Expenses",
      preview: "Preview",
      validRows: "Valid rows",
      errorRows: "Rows with errors",
      totalRows: "Total rows",
      noFile: "Select an Excel (.xlsx) or CSV file to import",
      maxRows: "Maximum 500 records per import",
      importSuccess: "Import successful",
      importError: "Import failed",
      validationErrors: "Validation errors found",
      row: "Row",
      field: "Field",
      error: "Error",
      importHistory: "Import History",
      noHistory: "No previous imports",
      status: {
        success: "Success",
        partial: "Partial",
        failed: "Failed",
      },
      dragDrop: "Drag a file here or click to select",
      supportedFormats: "Supported formats: .xlsx, .csv",
    },
    categorize: {
      suggestion: "Suggestion",
      confidence: "Confidence",
      high: "High",
      medium: "Medium",
      low: "Low",
      accept: "Accept",
      source: {
        rule: "Rule",
        history: "History",
      },
      basedOn: "based on",
      rules: "rules",
      historicalData: "historical data",
      mlReady: "ML ready",
      rulesConfig: "Categorization Rules",
      addRule: "Add Rule",
      category: "Category",
      keywords: "Keywords (comma-separated)",
      customRules: "Custom Rules",
      defaultRules: "Default Rules",
      noRules: "No custom rules",
      ruleSaved: "Rule saved",
      ruleDeleted: "Rule deleted",
      ruleError: "Error saving rule",
    },
    filters: {
      search: "Search in description and notes",
      dateRange: "Date range",
      currentMonth: "Current month",
      previousMonth: "Previous month",
      currentYear: "Current year",
      custom: "Custom",
      all: "All",
      allCategories: "All categories",
      source: "Source",
      sources: {
        manual: "Manual",
        vendor: "Vendor",
        recurring: "Recurring",
        import: "Import",
      },
      amountRange: "Amount range",
      min: "Min",
      max: "Max",
      showFilters: "Show filters",
      hideFilters: "Hide filters",
      clearFilters: "Clear filters",
      results: "results",
      subtotalBy: "Subtotal by category",
      exportFiltered: "Export Filtered",
      paymentMethod: "Payment method",
      allPaymentMethods: "All methods",
      reviewed: "Reviewed",
      reviewedStatus: "Review status",
      reviewedYes: "Reviewed",
      reviewedNo: "Not reviewed",
      vendor: "Vendor",
      allVendors: "All vendors",
      noVendor: "No vendor",
    },
    quickEntry: {
      title: "Quick New Expense",
      saveAndNew: "Save & Create Another",
      attach: "Attach",
      attachFile: "Attach file",
      uploading: "Uploading...",
      notesCollapse: "Add notes (optional)",
      enterToSave: "Enter to save",
      escToCancel: "Esc to cancel",
      ocrProcessing: "Processing OCR...",
      ocrComplete: "Data extracted from receipt",
      ocrFailed: "Could not extract data from file",
      ocrConfidence: "Confidence",
      ocrDate: "Detected date",
      ocrAmount: "Detected amount",
      ocrTaxId: "Detected tax ID",
      ocrIssuer: "Detected issuer",
      ocrAccept: "Apply data",
      ocrReject: "Ignore OCR",
      ocrApplied: "Receipt data applied",
      vendor: "Vendor",
      selectVendor: "Select vendor",
      noVendor: "No vendor",
      saveAsRecurring: "Also save as recurring",
      nextExecution: "Next execution",
    },
    batch: {
      selected: "selected",
      deleteSelected: "Delete selected",
      changeCategory: "Change category",
      exportSelected: "Export selection",
      markReviewed: "Mark as reviewed",
      unmarkReviewed: "Unmark reviewed",
      confirmDelete:
        "Delete the selected expenses? This action cannot be undone.",
      batchSuccess: "Batch action completed",
      batchError: "Batch action failed",
      selectAll: "Select all",
      newCategory: "New category",
      reviewed: "Reviewed",
      limit100: "Maximum 100 expenses per batch operation",
    },
    budgets: {
      title: "Budgets",
      subtitle: "Define spending limits per category and receive alerts",
      newBudget: "New Budget",
      category: "Category",
      period: "Period",
      limit: "Limit",
      spent: "Spent",
      remaining: "Remaining",
      percentage: "% Used",
      monthly: "Monthly",
      quarterly: "Quarterly",
      annual: "Annual",
      noBudgets: "No budgets configured",
      budgetSaved: "Budget saved",
      budgetDeleted: "Budget deleted",
      budgetError: "Error saving budget",
      budgetExists: "A budget already exists for this category/period",
      emailAlerts: "Email alerts",
      alert80: "Alert at 80%",
      alert100: "Alert at 100%",
      alertTriggered80: "Alert! 80% of budget reached in",
      alertTriggered100: "Alert! 100% of budget exceeded in",
      budgetedVsActual: "Budgeted vs Actual",
      overBudget: "Over budget",
      underBudget: "Within budget",
      monthLabel: "Month",
      yearLabel: "Year",
    },
    vendorSummary: {
      title: "Vendors",
      totalSuppliers: "Total Suppliers",
      totalSpent: "Total Spent",
      avgPerVendor: "Avg per Vendor",
      topVendor: "Top Vendor",
      monthlyTrend: "Monthly Trend",
      noData: "No vendor data",
      expenses: "expenses",
      expenseCount: "expenses",
      lastExpense: "Last expense",
      categories: "Categories",
    },
  },
  pt: {
    premiumBadge: "Premium",
    title: "Gestão de Despesas - Premium",
    description:
      "Controle e registre todas as despesas operacionais do seu negócio",
    primaryCta: "✨ Plano Empresarial",
    secondaryCta: "Atualizar Plano",
    labels: {
      newExpense: "Nova Despesa",
      expenses: "Despesas",
      total: "Total",
      description: "Descrição",
      category: "Categoria",
      amount: "Valor",
      paymentMethod: "Método de pagamento",
      date: "Data",
      notes: "Notas",
      actions: "Ações",
      noData: "Sem despesas ainda",
      loading: "Carregando...",
      confirmDelete: "Excluir esta despesa?",
    },
    paymentMethods: {
      cash: "Dinheiro",
      card: "Cartão",
      transfer: "Transferência",
    },
    toasts: {
      loadError: "Erro ao carregar despesas",
      saveError: "Erro ao salvar despesa",
      deleteError: "Erro ao excluir despesa",
      saved: "Despesa salva",
      deleted: "Despesa excluída",
    },
    buttons: {
      cancel: "Cancelar",
      save: "Salvar",
    },
    recurring: {
      title: "Despesas Recorrentes",
      subtitle: "Configure despesas que se repetem automaticamente",
      newRecurring: "Nova Despesa Recorrente",
      frequency: "Frequência",
      executionDay: "Dia de execução",
      startDate: "Data de início",
      endDate: "Data de fim (opcional)",
      requiresConfirmation: "Requer confirmação",
      baseAmount: "Valor base",
      active: "Ativo",
      paused: "Pausado",
      noRecurring: "Nenhuma despesa recorrente configurada",
      confirmDeleteRecurring: "Excluir esta despesa recorrente?",
      frequencies: {
        monthly: "Mensal",
        weekly: "Semanal",
        biweekly: "Quinzenal",
        annual: "Anual",
      },
      dayHelp: {
        monthly: "Dia do mês (1-31)",
        weekly: "Dia da semana (1=Seg, 7=Dom)",
        biweekly: "Dia da semana (1=Seg, 7=Dom)",
        annual: "Dia do mês (1-31)",
      },
      lastGenerated: "Última geração",
      never: "Nunca",
      generateNow: "Verificar Pendentes",
      pendingTitle: "Despesas Pendentes de Confirmação",
      pendingSubtitle:
        "Estas despesas recorrentes requerem sua aprovação antes de serem registradas",
      confirmExpense: "Confirmar",
      adjustAmount: "Ajustar valor",
      noPending: "Sem despesas pendentes",
      toasts: {
        saved: "Despesa recorrente salva",
        deleted: "Despesa recorrente excluída",
        updated: "Despesa recorrente atualizada",
        confirmed: "Despesa confirmada e registrada",
        generated: "Verificação concluída",
        error: "Erro ao processar despesas recorrentes",
      },
      togglePause: "Pausar/Retomar",
      indefinite: "Indefinido",
    },
    import: {
      title: "Importar Despesas",
      subtitle: "Carregue múltiplas despesas de um arquivo Excel ou CSV",
      uploadButton: "Selecionar Arquivo",
      downloadTemplate: "Baixar Modelo Excel",
      validating: "Validando...",
      importing: "Importando...",
      importButton: "Importar Despesas",
      preview: "Pré-visualização",
      validRows: "Linhas válidas",
      errorRows: "Linhas com erros",
      totalRows: "Total de linhas",
      noFile: "Selecione um arquivo Excel (.xlsx) ou CSV para importar",
      maxRows: "Máximo de 500 registros por importação",
      importSuccess: "Importação bem-sucedida",
      importError: "Erro na importação",
      validationErrors: "Erros de validação encontrados",
      row: "Linha",
      field: "Campo",
      error: "Erro",
      importHistory: "Histórico de Importações",
      noHistory: "Sem importações anteriores",
      status: {
        success: "Sucesso",
        partial: "Parcial",
        failed: "Falha",
      },
      dragDrop: "Arraste um arquivo aqui ou clique para selecionar",
      supportedFormats: "Formatos suportados: .xlsx, .csv",
    },
    categorize: {
      suggestion: "Sugestão",
      confidence: "Confiança",
      high: "Alta",
      medium: "Média",
      low: "Baixa",
      accept: "Aceitar",
      source: {
        rule: "Regra",
        history: "Histórico",
      },
      basedOn: "baseado em",
      rules: "regras",
      historicalData: "dados históricos",
      mlReady: "ML disponível",
      rulesConfig: "Regras de Categorização",
      addRule: "Adicionar Regra",
      category: "Categoria",
      keywords: "Palavras-chave (separadas por vírgula)",
      customRules: "Regras personalizadas",
      defaultRules: "Regras padrão",
      noRules: "Sem regras personalizadas",
      ruleSaved: "Regra salva",
      ruleDeleted: "Regra excluída",
      ruleError: "Erro ao salvar regra",
    },
    filters: {
      search: "Buscar em descrição e notas",
      dateRange: "Período",
      currentMonth: "Mês atual",
      previousMonth: "Mês anterior",
      currentYear: "Ano atual",
      custom: "Personalizado",
      all: "Todos",
      allCategories: "Todas as categorias",
      source: "Origem",
      sources: {
        manual: "Manual",
        vendor: "Fornecedor",
        recurring: "Recorrente",
        import: "Importação",
      },
      amountRange: "Faixa de valor",
      min: "Mín",
      max: "Máx",
      showFilters: "Mostrar filtros",
      hideFilters: "Ocultar filtros",
      clearFilters: "Limpar filtros",
      results: "resultados",
      subtotalBy: "Subtotal por categoria",
      exportFiltered: "Exportar Filtrados",
      paymentMethod: "Método de pagamento",
      allPaymentMethods: "Todos os métodos",
      reviewed: "Revisado",
      reviewedStatus: "Status de revisão",
      reviewedYes: "Revisados",
      reviewedNo: "Não revisados",
      vendor: "Fornecedor",
      allVendors: "Todos os fornecedores",
      noVendor: "Sem fornecedor",
    },
    quickEntry: {
      title: "Nova Despesa Rápida",
      saveAndNew: "Salvar e Criar Outra",
      attach: "Anexar",
      attachFile: "Anexar arquivo",
      uploading: "Enviando...",
      notesCollapse: "Adicionar notas (opcional)",
      enterToSave: "Enter para salvar",
      escToCancel: "Esc para cancelar",
      ocrProcessing: "Processando OCR...",
      ocrComplete: "Dados extraídos do comprovante",
      ocrFailed: "Não foi possível extrair dados do arquivo",
      ocrConfidence: "Confiança",
      ocrDate: "Data detectada",
      ocrAmount: "Valor detectado",
      ocrTaxId: "CNPJ/CPF detectado",
      ocrIssuer: "Emissor detectado",
      ocrAccept: "Aplicar dados",
      ocrReject: "Ignorar OCR",
      ocrApplied: "Dados do comprovante aplicados",
      vendor: "Fornecedor",
      selectVendor: "Selecionar fornecedor",
      noVendor: "Sem fornecedor",
      saveAsRecurring: "Salvar também como recorrente",
      nextExecution: "Próxima execução",
    },
    batch: {
      selected: "selecionados",
      deleteSelected: "Excluir selecionados",
      changeCategory: "Alterar categoria",
      exportSelected: "Exportar seleção",
      markReviewed: "Marcar revisados",
      unmarkReviewed: "Desmarcar revisados",
      confirmDelete:
        "Excluir as despesas selecionadas? Esta ação não pode ser desfeita.",
      batchSuccess: "Ação em lote concluída",
      batchError: "Erro na ação em lote",
      selectAll: "Selecionar todos",
      newCategory: "Nova categoria",
      reviewed: "Revisado",
      limit100: "Máximo de 100 despesas por operação em lote",
    },
    budgets: {
      title: "Orçamentos",
      subtitle: "Defina limites de gasto por categoria e receba alertas",
      newBudget: "Novo Orçamento",
      category: "Categoria",
      period: "Período",
      limit: "Limite",
      spent: "Gasto",
      remaining: "Restante",
      percentage: "% Consumido",
      monthly: "Mensal",
      quarterly: "Trimestral",
      annual: "Anual",
      noBudgets: "Sem orçamentos configurados",
      budgetSaved: "Orçamento salvo",
      budgetDeleted: "Orçamento excluído",
      budgetError: "Erro ao salvar orçamento",
      budgetExists: "Já existe um orçamento para esta categoria/período",
      emailAlerts: "Alertas por email",
      alert80: "Alerta em 80%",
      alert100: "Alerta em 100%",
      alertTriggered80: "Alerta! 80% do orçamento atingido em",
      alertTriggered100: "Alerta! 100% do orçamento ultrapassado em",
      budgetedVsActual: "Orçado vs Real",
      overBudget: "Acima do orçamento",
      underBudget: "Dentro do orçamento",
      monthLabel: "Mês",
      yearLabel: "Ano",
    },
    vendorSummary: {
      title: "Fornecedores",
      totalSuppliers: "Total Fornecedores",
      totalSpent: "Total Gasto",
      avgPerVendor: "Média por Fornecedor",
      topVendor: "Maior Fornecedor",
      monthlyTrend: "Tendência Mensal",
      noData: "Sem dados de fornecedores",
      expenses: "despesas",
      expenseCount: "despesas",
      lastExpense: "Última despesa",
      categories: "Categorias",
    },
  },
} as const;

// ─── Page Component ──────────────────────────────────────────────────
export default function ExpensesPage() {
  const { currentLanguage } = useGlobalLanguage();
  const router = useRouter();
  const copy = (EXPENSE_COPY[currentLanguage] ||
    EXPENSE_COPY.en) as typeof EXPENSE_COPY.en;
  const { subscription, loading: subLoading } = useSubscription();

  const [user, setUser] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    paymentMethod: "cash",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Recurring expense state
  const [activeTab, setActiveTab] = useState<
    "expenses" | "recurring" | "import" | "rules" | "budgets" | "vendors"
  >("expenses");
  const [recurringExpenses, setRecurringExpenses] = useState<
    RecurringExpense[]
  >([]);
  const [recurringLoading, setRecurringLoading] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editingRecurring, setEditingRecurring] =
    useState<RecurringExpense | null>(null);
  const [recurringFormData, setRecurringFormData] = useState({
    description: "",
    category: "",
    baseAmount: "",
    frequency: "monthly" as "monthly" | "weekly" | "biweekly" | "annual",
    executionDay: "1",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    requiresConfirmation: true,
    paymentMethod: "cash",
    notes: "",
  });

  // Pending confirmations
  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
  const [showPending, setShowPending] = useState(false);
  const [adjustAmounts, setAdjustAmounts] = useState<Record<string, string>>(
    {},
  );

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importParsedRows, setImportParsedRows] = useState<any[]>([]);
  const [importPreview, setImportPreview] = useState<ImportPreviewRow[]>([]);
  const [importErrors, setImportErrors] = useState<ImportValidationError[]>([]);
  const [importValidRows, setImportValidRows] = useState(0);
  const [importTotalRows, setImportTotalRows] = useState(0);
  const [importStep, setImportStep] = useState<"select" | "preview" | "done">(
    "select",
  );
  const [importLoading, setImportLoading] = useState(false);
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);

  // Category suggestion state
  const [categorySuggestion, setCategorySuggestion] =
    useState<CategorySuggestion | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionDebounce, setSuggestionDebounce] =
    useState<NodeJS.Timeout | null>(null);
  const [recurringSuggestion, setRecurringSuggestion] =
    useState<CategorySuggestion | null>(null);

  // Categorization rules state
  const [categoryRules, setCategoryRules] = useState<
    { _id: string; category: string; keywords: string[]; isDefault: boolean }[]
  >([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleFormData, setRuleFormData] = useState({
    category: "",
    keywords: "",
  });

  // ─── Filter State ──────────────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDatePreset, setFilterDatePreset] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [filterAmountMin, setFilterAmountMin] = useState("");
  const [filterAmountMax, setFilterAmountMax] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [filterReviewed, setFilterReviewed] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");

  // ─── Supplier State ────────────────────────────────────────────────
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [formSupplier, setFormSupplier] = useState("");
  const [recurringFormSupplier, setRecurringFormSupplier] = useState("");
  const [saveAsRecurring, setSaveAsRecurring] = useState(false);

  // ─── Quick Entry Modal State ───────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [saveAndNew, setSaveAndNew] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
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
  const [descSuggestions, setDescSuggestions] = useState<string[]>([]);
  const [showDescSuggestions, setShowDescSuggestions] = useState(false);
  const [descDebounce, setDescDebounce] = useState<NodeJS.Timeout | null>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ─── Batch Selection State ─────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchCategoryModal, setShowBatchCategoryModal] = useState(false);
  const [batchCategory, setBatchCategory] = useState("");
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  // ─── Budget State ──────────────────────────────────────────────────
  const [budgets, setBudgets] = useState<BudgetCard[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetFormData, setBudgetFormData] = useState({
    category: "",
    period: "monthly" as "monthly" | "quarterly" | "annual",
    limitAmount: "",
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    emailAlerts: false,
  });
  const [budgetAlerts, setBudgetAlerts] = useState<
    { category: string; level: number }[]
  >([]);
  const [budgetMonth, setBudgetMonth] = useState(new Date().getMonth() + 1);
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear());

  const planId = (subscription?.planId || "BASIC").toUpperCase();
  const isPremiumPlan = planId !== "BASIC";
  const localeMap: Record<string, string> = {
    es: "es-AR",
    en: "en-US",
    pt: "pt-BR",
  };
  const formatAmount = (value: number) =>
    new Intl.NumberFormat(localeMap[currentLanguage] || "en-US", {
      style: "currency",
      currency: "ARS",
    }).format(value || 0);

  // ─── Data Fetching ─────────────────────────────────────────────────
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);
    if (parsedUser?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchExpenses();
    fetchRecurringExpenses();
    fetchSuppliers();
  }, [router]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
      } else {
        toast.error(copy.toasts.loadError);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error(copy.toasts.loadError);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecurringExpenses = async () => {
    try {
      setRecurringLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/recurring-expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRecurringExpenses(data.recurringExpenses);
      }
    } catch (error) {
      console.error("Error fetching recurring expenses:", error);
    } finally {
      setRecurringLoading(false);
    }
  };

  // ─── Category Suggestion ───────────────────────────────────────────
  const fetchCategorySuggestion = async (
    description: string,
    target: "expense" | "recurring",
  ) => {
    if (description.trim().length < 3) {
      if (target === "expense") setCategorySuggestion(null);
      else setRecurringSuggestion(null);
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
        if (target === "expense") setCategorySuggestion(data.suggestion);
        else setRecurringSuggestion(data.suggestion);
      }
    } catch (error) {
      console.error("Category suggestion error:", error);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const debouncedSuggestion = (
    description: string,
    target: "expense" | "recurring",
  ) => {
    if (suggestionDebounce) clearTimeout(suggestionDebounce);
    const timeout = setTimeout(
      () => fetchCategorySuggestion(description, target),
      400,
    );
    setSuggestionDebounce(timeout);
  };

  const acceptSuggestion = (target: "expense" | "recurring") => {
    if (target === "expense" && categorySuggestion) {
      setFormData({ ...formData, category: categorySuggestion.category });
      setCategorySuggestion(null);
    } else if (target === "recurring" && recurringSuggestion) {
      setRecurringFormData({
        ...recurringFormData,
        category: recurringSuggestion.category,
      });
      setRecurringSuggestion(null);
    }
  };

  // ─── Category Rules CRUD ───────────────────────────────────────────
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/expenses/categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: ruleFormData.category,
          keywords: ruleFormData.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        toast.success(copy.categorize.ruleSaved);
        setShowRuleForm(false);
        setRuleFormData({ category: "", keywords: "" });
        fetchCategoryRulesData();
      } else {
        toast.error(copy.categorize.ruleError);
      }
    } catch {
      toast.error(copy.categorize.ruleError);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/expenses/categorize?id=${ruleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(copy.categorize.ruleDeleted);
        fetchCategoryRulesData();
      }
    } catch {
      toast.error(copy.categorize.ruleError);
    }
  };

  const fetchCategoryRulesData = async () => {
    try {
      setRulesLoading(true);
      const token = localStorage.getItem("accessToken");
      // Seed defaults
      await fetch("/api/expenses/categorize", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await fetch("/api/expenses/categorize/rules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategoryRules(data.rules || []);
      }
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setRulesLoading(false);
    }
  };

  // ─── Expense CRUD ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const payload: any = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      if (attachmentData) {
        payload.attachment = attachmentData;
      }
      if (formSupplier) {
        payload.supplier = formSupplier;
      }
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        fetchExpenses();
        toast.success(copy.toasts.saved);

        // Also save as recurring if checkbox is checked
        if (saveAsRecurring && formData.description && formData.amount) {
          try {
            await fetch("/api/recurring-expenses", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                description: formData.description,
                category: formData.category,
                baseAmount: formData.amount,
                frequency: "monthly",
                executionDay: new Date().getDate(),
                startDate: formData.date,
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
                supplier: formSupplier || null,
                requiresConfirmation: true,
              }),
            });
            fetchRecurringExpenses();
          } catch {
            // silently fail - main expense was saved
          }
        }

        if (saveAndNew) {
          // Keep modal open, reset form
          setFormData({
            description: "",
            amount: "",
            category: "",
            paymentMethod: formData.paymentMethod,
            notes: "",
            date: new Date().toISOString().split("T")[0],
          });
          setFormSupplier("");
          setSaveAsRecurring(false);
          setCategorySuggestion(null);
          setAttachmentFile(null);
          setAttachmentData(null);
          setOcrResult(null);
          setShowNotes(false);
          setTimeout(() => descInputRef.current?.focus(), 100);
        } else {
          closeModal();
          setShowForm(false);
        }
      } else {
        toast.error(copy.toasts.saveError);
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error(copy.toasts.saveError);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(copy.labels.confirmDelete)) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchExpenses();
        toast.success(copy.toasts.deleted);
      } else {
        toast.error(copy.toasts.deleteError);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(copy.toasts.deleteError);
    }
  };

  // ─── Recurring Expense CRUD ────────────────────────────────────────
  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const isEditing = !!editingRecurring;
      const url = "/api/recurring-expenses";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing
        ? {
            id: editingRecurring!._id,
            ...recurringFormData,
            supplier: recurringFormSupplier || null,
          }
        : { ...recurringFormData, supplier: recurringFormSupplier || null };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchRecurringExpenses();
        resetRecurringForm();
        toast.success(
          isEditing
            ? copy.recurring.toasts.updated
            : copy.recurring.toasts.saved,
        );
      } else {
        toast.error(copy.recurring.toasts.error);
      }
    } catch (error) {
      console.error("Error saving recurring expense:", error);
      toast.error(copy.recurring.toasts.error);
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    if (!confirm(copy.recurring.confirmDeleteRecurring)) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/recurring-expenses?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchRecurringExpenses();
        toast.success(copy.recurring.toasts.deleted);
      } else {
        toast.error(copy.recurring.toasts.error);
      }
    } catch (error) {
      console.error("Error deleting recurring expense:", error);
      toast.error(copy.recurring.toasts.error);
    }
  };

  const handleTogglePause = async (recurring: RecurringExpense) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/recurring-expenses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: recurring._id, active: !recurring.active }),
      });
      if (response.ok) {
        fetchRecurringExpenses();
        toast.success(copy.recurring.toasts.updated);
      }
    } catch (error) {
      console.error("Error toggling recurring expense:", error);
    }
  };

  const handleEditRecurring = (recurring: RecurringExpense) => {
    setEditingRecurring(recurring);
    setRecurringFormData({
      description: recurring.description,
      category: recurring.category || "",
      baseAmount: String(recurring.baseAmount),
      frequency: recurring.frequency,
      executionDay: String(recurring.executionDay),
      startDate: recurring.startDate?.slice(0, 10) || "",
      endDate: recurring.endDate?.slice(0, 10) || "",
      requiresConfirmation: recurring.requiresConfirmation,
      paymentMethod: recurring.paymentMethod || "cash",
      notes: recurring.notes || "",
    });
    setRecurringFormSupplier(recurring.supplier?._id || "");
    setShowRecurringForm(true);
  };

  const resetRecurringForm = () => {
    setShowRecurringForm(false);
    setEditingRecurring(null);
    setRecurringFormSupplier("");
    setRecurringFormData({
      description: "",
      category: "",
      baseAmount: "",
      frequency: "monthly",
      executionDay: "1",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      requiresConfirmation: true,
      paymentMethod: "cash",
      notes: "",
    });
  };

  // ─── Generate / Confirm ────────────────────────────────────────────
  const handleGenerate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/recurring-expenses/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.generated.length > 0) {
          fetchExpenses();
        }
        if (data.pending.length > 0) {
          setPendingExpenses(data.pending);
          setShowPending(true);
          const amounts: Record<string, string> = {};
          data.pending.forEach((p: PendingExpense) => {
            amounts[p._id] = String(p.baseAmount);
          });
          setAdjustAmounts(amounts);
        }
        fetchRecurringExpenses();
        const msg = `${copy.recurring.toasts.generated}: ${data.summary.autoGenerated} auto, ${data.summary.pendingConfirmation} pending`;
        toast.info(msg);
      } else {
        toast.error(copy.recurring.toasts.error);
      }
    } catch (error) {
      console.error("Error generating expenses:", error);
      toast.error(copy.recurring.toasts.error);
    }
  };

  const handleConfirmPending = async (recurringExpenseId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const adjustedAmount = adjustAmounts[recurringExpenseId];
      const response = await fetch("/api/recurring-expenses/generate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recurringExpenseId,
          adjustedAmount: adjustedAmount ? parseFloat(adjustedAmount) : null,
        }),
      });

      if (response.ok) {
        setPendingExpenses((prev) =>
          prev.filter((p) => p._id !== recurringExpenseId),
        );
        fetchExpenses();
        fetchRecurringExpenses();
        toast.success(copy.recurring.toasts.confirmed);
      } else {
        toast.error(copy.recurring.toasts.error);
      }
    } catch (error) {
      console.error("Error confirming expense:", error);
      toast.error(copy.recurring.toasts.error);
    }
  };

  // ─── Import Handlers ───────────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportLoading(true);
    setImportErrors([]);
    setImportPreview([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) {
        toast.error(copy.import.noFile);
        setImportStep("select");
        setImportLoading(false);
        return;
      }

      setImportParsedRows(rows);

      // Send to server for validation
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/expenses/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rows,
          fileName: file.name,
          action: "validate",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setImportPreview(result.preview || []);
        setImportErrors(result.errors || []);
        setImportValidRows(result.validRows || 0);
        setImportTotalRows(result.totalRows || 0);
        setImportStep("preview");
      } else {
        const err = await response.json();
        toast.error(err.error || copy.import.importError);
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error(copy.import.importError);
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportConfirm = async () => {
    if (importErrors.length > 0) {
      toast.error(copy.import.validationErrors);
      return;
    }

    setImportLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/expenses/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rows: importParsedRows,
          fileName: importFile?.name || "unknown",
          action: "import",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `${copy.import.importSuccess}: ${result.imported} ${copy.labels.expenses.toLowerCase()}`,
        );
        setImportStep("done");
        fetchExpenses();
        fetchImportLogs();
        resetImport();
      } else {
        const err = await response.json();
        if (err.errors) {
          setImportErrors(err.errors);
        }
        toast.error(err.error || copy.import.importError);
      }
    } catch (error) {
      console.error("Error importing:", error);
      toast.error(copy.import.importError);
    } finally {
      setImportLoading(false);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportParsedRows([]);
    setImportPreview([]);
    setImportErrors([]);
    setImportValidRows(0);
    setImportTotalRows(0);
    setImportStep("select");
  };

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/expenses/import/template", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "expense_import_template.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  const fetchImportLogs = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/expenses/import", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setImportLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching import logs:", error);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // ─── Filtering Logic ──────────────────────────────────────────────
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    expenses.forEach((e) => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats).sort();
  }, [expenses]);

  const getDateRange = useCallback((preset: string): [string, string] => {
    const now = new Date();
    if (preset === "currentMonth") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];
      return [start, end];
    }
    if (preset === "previousMonth") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split("T")[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split("T")[0];
      return [start, end];
    }
    if (preset === "currentYear") {
      const start = new Date(now.getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0];
      const end = new Date(now.getFullYear(), 11, 31)
        .toISOString()
        .split("T")[0];
      return [start, end];
    }
    return ["", ""];
  }, []);

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Text search
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q)) ||
          (e.supplier?.name && e.supplier.name.toLowerCase().includes(q)),
      );
    }

    // Date range
    if (filterDatePreset !== "all") {
      let from = filterDateFrom;
      let to = filterDateTo;
      if (filterDatePreset !== "custom") {
        [from, to] = getDateRange(filterDatePreset);
      }
      if (from) result = result.filter((e) => e.date?.slice(0, 10) >= from);
      if (to) result = result.filter((e) => e.date?.slice(0, 10) <= to);
    }

    // Category
    if (filterCategory !== "all") {
      result = result.filter((e) => e.category === filterCategory);
    }

    // Source
    if (filterSource !== "all") {
      result = result.filter((e) => (e.source || "manual") === filterSource);
    }

    // Payment method
    if (filterPaymentMethod !== "all") {
      result = result.filter((e) => e.paymentMethod === filterPaymentMethod);
    }

    // Reviewed status
    if (filterReviewed === "yes") {
      result = result.filter((e) => e.reviewed === true);
    } else if (filterReviewed === "no") {
      result = result.filter((e) => !e.reviewed);
    }

    // Supplier
    if (filterSupplier !== "all") {
      if (filterSupplier === "none") {
        result = result.filter((e) => !e.supplier);
      } else {
        result = result.filter((e) => e.supplier?._id === filterSupplier);
      }
    }

    // Amount range
    if (filterAmountMin) {
      const min = parseFloat(filterAmountMin);
      if (!isNaN(min)) result = result.filter((e) => e.amount >= min);
    }
    if (filterAmountMax) {
      const max = parseFloat(filterAmountMax);
      if (!isNaN(max)) result = result.filter((e) => e.amount <= max);
    }

    return result;
  }, [
    expenses,
    filterSearch,
    filterDatePreset,
    filterDateFrom,
    filterDateTo,
    filterCategory,
    filterSource,
    filterPaymentMethod,
    filterReviewed,
    filterSupplier,
    filterAmountMin,
    filterAmountMax,
    getDateRange,
  ]);

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses],
  );

  const categorySubtotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || "-";
      map[cat] = (map[cat] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  const hasActiveFilters =
    filterSearch ||
    filterDatePreset !== "all" ||
    filterCategory !== "all" ||
    filterSource !== "all" ||
    filterPaymentMethod !== "all" ||
    filterReviewed !== "all" ||
    filterSupplier !== "all" ||
    filterAmountMin ||
    filterAmountMax;

  const clearFilters = () => {
    setFilterSearch("");
    setFilterDatePreset("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterCategory("all");
    setFilterSource("all");
    setFilterPaymentMethod("all");
    setFilterReviewed("all");
    setFilterSupplier("all");
    setFilterAmountMin("");
    setFilterAmountMax("");
  };

  // ─── Export Filtered ──────────────────────────────────────────────
  const exportFilteredToExcel = () => {
    const rows = filteredExpenses.map((e) => ({
      [copy.labels.date]: e.date?.slice(0, 10) || "",
      [copy.labels.description]: e.description,
      [copy.labels.category]: e.category || "",
      [copy.labels.amount]: e.amount,
      [copy.labels.paymentMethod]: e.paymentMethod || "",
      [copy.labels.notes]: e.notes || "",
      [copy.filters.source]: e.source || "manual",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(
      wb,
      `expenses_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // ─── Description Autocomplete ─────────────────────────────────────
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
    debouncedSuggestion(val, "expense");
    if (descDebounce) clearTimeout(descDebounce);
    const t = setTimeout(() => fetchDescSuggestions(val), 300);
    setDescDebounce(t);
  };

  const selectDescSuggestion = (val: string) => {
    setFormData({ ...formData, description: val });
    setShowDescSuggestions(false);
    setDescSuggestions([]);
    debouncedSuggestion(val, "expense");
    amountInputRef.current?.focus();
  };

  // ─── Attachment Upload ───────────────────────────────────────────
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

        // Trigger OCR processing
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
          // OCR is optional — silently ignore failures
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

  // ─── Apply OCR Results to Form ─────────────────────────────────────
  const applyOcrResults = () => {
    if (!ocrResult?.extracted) return;
    const { date, amount, issuer } = ocrResult.extracted;
    const updates: typeof formData = { ...formData };
    if (date) updates.date = date;
    if (amount) updates.amount = String(amount);
    if (issuer && !formData.description) updates.description = issuer;
    setFormData(updates);
    toast.success(copy.quickEntry.ocrApplied);
  };

  // ─── Open / Close Modal ───────────────────────────────────────────
  const openModal = () => {
    setFormData({
      description: "",
      amount: "",
      category: "",
      paymentMethod: "cash",
      notes: "",
      date: new Date().toISOString().split("T")[0],
    });
    setCategorySuggestion(null);
    setAttachmentFile(null);
    setAttachmentData(null);
    setOcrResult(null);
    setOcrProcessing(false);
    setShowNotes(false);
    setShowModal(true);
    setTimeout(() => descInputRef.current?.focus(), 100);
  };

  const closeModal = () => {
    setShowModal(false);
    setSaveAndNew(false);
    setAttachmentFile(null);
    setAttachmentData(null);
    setOcrResult(null);
    setOcrProcessing(false);
    setShowDescSuggestions(false);
  };

  // ─── Modal Keyboard Shortcut ──────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showModal) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  // ─── Global Quick-Entry Shortcut (Ctrl+Shift+E) ──────────────────
  useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "E") {
        e.preventDefault();
        openModal();
      }
    };
    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, []);

  // ─── Batch Action Handlers ─────────────────────────────────────────
  const toggleSelectExpense = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExpenses.map((e) => e._id)));
    }
  };

  const selectionState: "none" | "some" | "all" =
    selectedIds.size === 0
      ? "none"
      : selectedIds.size === filteredExpenses.length
        ? "all"
        : "some";

  const executeBatchAction = async (
    action: string,
    extra?: Record<string, any>,
  ) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (ids.length > 100) {
      toast.error(copy.batch.limit100);
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/expenses/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ids, ...extra }),
      });
      if (res.ok) {
        const data = await res.json();
        if (action === "export") {
          // Export returned expenses → generate XLSX
          const rows = data.expenses.map((e: any) => ({
            [copy.labels.date]: e.date?.slice(0, 10) || "",
            [copy.labels.description]: e.description,
            [copy.labels.category]: e.category || "",
            [copy.labels.amount]: e.amount,
            [copy.labels.paymentMethod]: e.paymentMethod || "",
            [copy.labels.notes]: e.notes || "",
            [copy.filters.source]: e.source || "manual",
          }));
          const ws = XLSX.utils.json_to_sheet(rows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Expenses");
          XLSX.writeFile(
            wb,
            `expenses_selection_${new Date().toISOString().slice(0, 10)}.xlsx`,
          );
        }
        toast.success(
          `${copy.batch.batchSuccess} (${data.affected || data.count || ids.length})`,
        );
        setSelectedIds(new Set());
        setShowBatchDeleteConfirm(false);
        setShowBatchCategoryModal(false);
        fetchExpenses();
      } else {
        toast.error(copy.batch.batchError);
      }
    } catch {
      toast.error(copy.batch.batchError);
    }
  };

  // ─── Budget CRUD ──────────────────────────────────────────────────
  const fetchBudgets = async (y?: number, m?: number) => {
    try {
      setBudgetsLoading(true);
      const token = localStorage.getItem("accessToken");
      const year = y ?? budgetYear;
      const month = m ?? budgetMonth;
      const res = await fetch(`/api/budgets?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBudgets(data.budgets || []);
        // Show in-app alerts
        if (data.alerts && data.alerts.length > 0) {
          setBudgetAlerts(data.alerts);
          data.alerts.forEach((a: { category: string; level: number }) => {
            if (a.level === 100) {
              toast.error(`${copy.budgets.alertTriggered100} ${a.category}`);
            } else {
              toast.warn(`${copy.budgets.alertTriggered80} ${a.category}`);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setBudgetsLoading(false);
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: budgetFormData.category,
          period: budgetFormData.period,
          limitAmount: parseFloat(budgetFormData.limitAmount),
          month:
            budgetFormData.period === "monthly"
              ? parseInt(budgetFormData.month)
              : undefined,
          year: parseInt(budgetFormData.year),
          emailAlerts: budgetFormData.emailAlerts,
        }),
      });
      if (res.ok) {
        toast.success(copy.budgets.budgetSaved);
        setShowBudgetForm(false);
        setBudgetFormData({
          category: "",
          period: "monthly",
          limitAmount: "",
          month: String(budgetMonth),
          year: String(budgetYear),
          emailAlerts: false,
        });
        fetchBudgets();
      } else {
        const err = await res.json();
        toast.error(
          err.error?.includes("already exists")
            ? copy.budgets.budgetExists
            : copy.budgets.budgetError,
        );
      }
    } catch {
      toast.error(copy.budgets.budgetError);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/budgets?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(copy.budgets.budgetDeleted);
        fetchBudgets();
      } else {
        toast.error(copy.budgets.budgetError);
      }
    } catch {
      toast.error(copy.budgets.budgetError);
    }
  };

  const budgetProgressColor = (pct: number) => {
    if (pct >= 100) return "bg-red-500 dark:bg-red-400";
    if (pct >= 70) return "bg-amber-500 dark:bg-amber-400";
    return "bg-emerald-500 dark:bg-emerald-400";
  };

  const budgetTextColor = (pct: number) => {
    if (pct >= 100) return "text-red-600 dark:text-red-400";
    if (pct >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  // ─── Loading / Premium Gate ────────────────────────────────────────
  if (subLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
        <Header user={user} showBackButton />
        <main className="max-w-5xl mx-auto px-4 py-10">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-56 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </main>
      </div>
    );
  }

  if (!isPremiumPlan) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
        <Header user={user} showBackButton />
        <main className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center">
          <div className="w-full bg-white dark:bg-slate-900/90 border border-amber-200 dark:border-amber-500/50 border-dashed rounded-2xl p-10 shadow-xl dark:shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-400/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Receipt className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold uppercase tracking-wide">
                  {copy.premiumBadge}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {copy.title}
                </h1>
                <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base">
                  {copy.description}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
                <Link
                  href="/plan-comparison"
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                >
                  {copy.primaryCta}
                </Link>
                <Link
                  href="/upgrade"
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold bg-amber-600 text-white hover:bg-amber-500 transition-colors border border-amber-500/70"
                >
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────────────
  return (
    <div className="vp-page">
      <Header user={user} showBackButton />

      <main className="vp-page-inner max-w-5xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="vp-section-title">
              {copy.title.replace(" - Premium", "")}
            </h1>
            <p className="vp-section-subtitle text-sm">{copy.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "expenses"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Receipt className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            {copy.labels.expenses}
          </button>
          <button
            onClick={() => setActiveTab("recurring")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "recurring"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <RefreshCw className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            {copy.recurring.title}
            {recurringExpenses.filter((r) => r.active).length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                {recurringExpenses.filter((r) => r.active).length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("import");
              fetchImportLogs();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "import"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            {copy.import.title}
          </button>
          <button
            onClick={() => {
              setActiveTab("rules");
              fetchCategoryRulesData();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "rules"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Settings2 className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            {copy.categorize.rulesConfig}
          </button>
          <button
            onClick={() => {
              setActiveTab("budgets");
              fetchBudgets();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "budgets"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Wallet className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            {copy.budgets.title}
            {budgetAlerts.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                !
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("vendors")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "vendors"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            {copy.vendorSummary?.title ?? "Proveedores"}
          </button>
        </div>

        {/* ─── Pending Confirmations Banner ───────────────────────── */}
        {showPending && pendingExpenses.length > 0 && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  {copy.recurring.pendingTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowPending(false)}
                className="text-amber-600 hover:text-amber-800 dark:text-amber-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-400/80 mb-4">
              {copy.recurring.pendingSubtitle}
            </p>
            <div className="space-y-3">
              {pendingExpenses.map((pending) => (
                <div
                  key={pending._id}
                  className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-100 dark:border-slate-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {pending.description}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {pending.category || "-"} &middot;{" "}
                      {copy.recurring.frequencies[
                        pending.frequency as keyof typeof copy.recurring.frequencies
                      ] || pending.frequency}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={adjustAmounts[pending._id] || ""}
                      onChange={(e) =>
                        setAdjustAmounts((prev) => ({
                          ...prev,
                          [pending._id]: e.target.value,
                        }))
                      }
                      className="w-28 px-2 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      title={copy.recurring.adjustAmount}
                    />
                    <button
                      onClick={() => handleConfirmPending(pending._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {copy.recurring.confirmExpense}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ EXPENSES TAB ═══════════════════════════════════════════ */}
        {activeTab === "expenses" && (
          <>
            {/* Top Bar: Summary + Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    {copy.labels.total}
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatAmount(
                      hasActiveFilters ? filteredTotal : totalExpenses,
                    )}
                  </span>
                  {hasActiveFilters && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                      ({filteredExpenses.length} {copy.filters.results})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    showFilters || hasActiveFilters
                      ? "border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                      : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {showFilters
                    ? copy.filters.hideFilters
                    : copy.filters.showFilters}
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={exportFilteredToExcel}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {copy.filters.exportFiltered}
                  </button>
                )}
                <button
                  onClick={openModal}
                  className="vp-button vp-button-primary"
                  title="Ctrl+Shift+E"
                >
                  <Plus className="w-4 h-4" />
                  {copy.labels.newExpense}
                  <kbd className="hidden sm:inline-flex ml-1.5 items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white/20 rounded">
                    <Keyboard className="w-3 h-3" />E
                  </kbd>
                </button>
              </div>
            </div>

            {/* Collapsible Filter Bar */}
            {showFilters && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4 space-y-3">
                {/* Row 1: Search + Date preset */}
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder={copy.filters.search}
                      className="vp-input pl-9"
                    />
                  </div>
                  <select
                    value={filterDatePreset}
                    onChange={(e) => {
                      setFilterDatePreset(e.target.value);
                      if (e.target.value !== "custom") {
                        setFilterDateFrom("");
                        setFilterDateTo("");
                      }
                    }}
                    className="vp-input"
                  >
                    <option value="all">
                      {copy.filters.dateRange}: {copy.filters.all}
                    </option>
                    <option value="currentMonth">
                      {copy.filters.currentMonth}
                    </option>
                    <option value="previousMonth">
                      {copy.filters.previousMonth}
                    </option>
                    <option value="currentYear">
                      {copy.filters.currentYear}
                    </option>
                    <option value="custom">{copy.filters.custom}</option>
                  </select>
                </div>
                {/* Custom Date Range */}
                {filterDatePreset === "custom" && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="vp-input"
                    />
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="vp-input"
                    />
                  </div>
                )}
                {/* Row 2: Category, Source, Amount Range */}
                <div className="grid gap-3 md:grid-cols-4">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
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
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="vp-input"
                  >
                    <option value="all">
                      {copy.filters.source}: {copy.filters.all}
                    </option>
                    <option value="manual">
                      {copy.filters.sources.manual}
                    </option>
                    <option value="vendor">
                      {copy.filters.sources.vendor}
                    </option>
                    <option value="recurring">
                      {copy.filters.sources.recurring}
                    </option>
                    <option value="import">
                      {copy.filters.sources.import}
                    </option>
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder={copy.filters.min}
                      value={filterAmountMin}
                      onChange={(e) => setFilterAmountMin(e.target.value)}
                      className="vp-input"
                      step="0.01"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="number"
                      placeholder={copy.filters.max}
                      value={filterAmountMax}
                      onChange={(e) => setFilterAmountMax(e.target.value)}
                      className="vp-input"
                      step="0.01"
                    />
                  </div>
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  {copy.filters.subtotalBy}
                </h4>
                <div className="space-y-1.5">
                  {categorySubtotals.map(([cat, amt]) => {
                    const pct =
                      filteredTotal > 0 ? (amt / filteredTotal) * 100 : 0;
                    return (
                      <div
                        key={cat}
                        className="flex items-center gap-2 text-sm"
                      >
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

            {/* Batch Action Bar */}
            {selectedIds.size > 0 && (
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  {selectedIds.size} {copy.batch.selected}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowBatchDeleteConfirm(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {copy.batch.deleteSelected}
                  </button>
                  <button
                    onClick={() => setShowBatchCategoryModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {copy.batch.changeCategory}
                  </button>
                  <button
                    onClick={() => executeBatchAction("export")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {copy.batch.exportSelected}
                  </button>
                  <button
                    onClick={() => executeBatchAction("markReviewed")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {copy.batch.markReviewed}
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Expenses Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2 px-2 w-8">
                        <button
                          onClick={toggleSelectAll}
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
                      <th className="text-left py-2 px-3">
                        {copy.labels.date}
                      </th>
                      <th className="text-left py-2 px-3">
                        {copy.labels.description}
                      </th>
                      <th className="text-left py-2 px-3">
                        {copy.labels.category}
                      </th>
                      <th className="text-right py-2 px-3">
                        {copy.labels.amount}
                      </th>
                      <th className="text-left py-2 px-3">
                        {copy.filters.source}
                      </th>
                      <th className="text-center py-2 px-2">
                        <ShieldCheck className="w-3.5 h-3.5 mx-auto" />
                      </th>
                      <th className="text-left py-2 px-3">
                        {copy.labels.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
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
                    {filteredExpenses.map((expense) => (
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
                            onClick={() => toggleSelectExpense(expense._id)}
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
                            {expense.attachment?.fileUrl && (
                              <a
                                href={expense.attachment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-indigo-500 hover:text-indigo-400 transition-colors"
                                title={expense.attachment.fileName}
                              >
                                {expense.attachment.mimeType ===
                                "application/pdf" ? (
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
                            onClick={() => handleDelete(expense._id)}
                            className="text-red-600 hover:text-red-500"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!filteredExpenses.length && !loading && (
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

            {/* Batch Delete Confirmation Modal */}
            {showBatchDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {copy.batch.deleteSelected}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {selectedIds.size} {copy.batch.selected}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    {copy.batch.confirmDelete}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowBatchDeleteConfirm(false)}
                      className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {copy.buttons.cancel}
                    </button>
                    <button
                      onClick={() => executeBatchAction("delete")}
                      className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
                    >
                      {copy.batch.deleteSelected}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Change Category Modal */}
            {showBatchCategoryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {copy.batch.changeCategory}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {selectedIds.size} {copy.batch.selected}
                  </p>
                  <select
                    value={batchCategory}
                    onChange={(e) => setBatchCategory(e.target.value)}
                    className="vp-input mb-2"
                  >
                    <option value="">{copy.batch.newCategory}...</option>
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {!allCategories.includes(batchCategory) && (
                    <input
                      value={batchCategory}
                      onChange={(e) => setBatchCategory(e.target.value)}
                      placeholder={copy.batch.newCategory}
                      className="vp-input mb-4"
                    />
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setShowBatchCategoryModal(false);
                        setBatchCategory("");
                      }}
                      className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {copy.buttons.cancel}
                    </button>
                    <button
                      onClick={() =>
                        batchCategory &&
                        executeBatchAction("changeCategory", {
                          category: batchCategory,
                        })
                      }
                      disabled={!batchCategory}
                      className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                    >
                      {copy.batch.changeCategory}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Quick Entry Modal ────────────────────────────────── */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div
                  ref={modalRef}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {copy.quickEntry.title}
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
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
                      <label className="vp-label">
                        {copy.labels.description}
                      </label>
                      <input
                        ref={descInputRef}
                        value={formData.description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        onFocus={() => {
                          if (descSuggestions.length > 0)
                            setShowDescSuggestions(true);
                        }}
                        onBlur={() =>
                          setTimeout(() => setShowDescSuggestions(false), 200)
                        }
                        className="vp-input"
                        required
                        autoComplete="off"
                      />
                      {/* Autocomplete dropdown */}
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

                    {/* Category with auto-suggestion */}
                    <div>
                      <label className="vp-label">{copy.labels.category}</label>
                      <input
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="vp-input"
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
                            onClick={() => acceptSuggestion("expense")}
                            className="ml-auto px-2 py-0.5 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex-shrink-0"
                          >
                            {copy.categorize.accept}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Amount with auto-focus */}
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
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="vp-label">
                        {copy.labels.paymentMethod}
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value,
                          })
                        }
                        className="vp-input"
                      >
                        <option value="cash">{copy.paymentMethods.cash}</option>
                        <option value="card">{copy.paymentMethods.card}</option>
                        <option value="transfer">
                          {copy.paymentMethods.transfer}
                        </option>
                      </select>
                    </div>

                    {/* Collapsible Notes */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowNotes(!showNotes)}
                        className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
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
                          className="vp-input mt-2"
                          rows={2}
                        />
                      )}
                    </div>

                    {/* Attachment */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                          <Paperclip className="w-3.5 h-3.5" />
                          {uploading
                            ? copy.quickEntry.uploading
                            : ocrProcessing
                              ? copy.quickEntry.ocrProcessing
                              : copy.quickEntry.attach}
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.webp"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleAttachmentUpload(f);
                            }}
                            className="hidden"
                          />
                        </label>
                        {attachmentFile && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Paperclip className="w-3 h-3" />
                            <span className="truncate max-w-[180px]">
                              {attachmentFile.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setAttachmentFile(null);
                                setAttachmentData(null);
                                setOcrResult(null);
                              }}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* OCR Processing Indicator */}
                      {ocrProcessing && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {copy.quickEntry.ocrProcessing}
                          </span>
                        </div>
                      )}

                      {/* OCR Results Card */}
                      {ocrResult && !ocrProcessing && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              {copy.quickEntry.ocrComplete}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300">
                              {copy.quickEntry.ocrConfidence}:{" "}
                              {Math.round(ocrResult.confidence * 100)}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-xs">
                            {ocrResult.extracted.date && (
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <CalendarDays className="w-3 h-3" />
                                <span>
                                  {copy.quickEntry.ocrDate}:{" "}
                                  <strong>{ocrResult.extracted.date}</strong>
                                </span>
                              </div>
                            )}
                            {ocrResult.extracted.amount && (
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <Wallet className="w-3 h-3" />
                                <span>
                                  {copy.quickEntry.ocrAmount}:{" "}
                                  <strong>
                                    $
                                    {ocrResult.extracted.amount.toLocaleString()}
                                  </strong>
                                </span>
                              </div>
                            )}
                            {ocrResult.extracted.taxId && (
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <ShieldCheck className="w-3 h-3" />
                                <span>
                                  {copy.quickEntry.ocrTaxId}:{" "}
                                  <strong>{ocrResult.extracted.taxId}</strong>
                                </span>
                              </div>
                            )}
                            {ocrResult.extracted.issuer && (
                              <div className="col-span-2 flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <Receipt className="w-3 h-3" />
                                <span>
                                  {copy.quickEntry.ocrIssuer}:{" "}
                                  <strong className="truncate">
                                    {ocrResult.extracted.issuer}
                                  </strong>
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={applyOcrResults}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {copy.quickEntry.ocrAccept}
                            </button>
                            <button
                              type="button"
                              onClick={() => setOcrResult(null)}
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <X className="w-3 h-3" />
                              {copy.quickEntry.ocrReject}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {copy.quickEntry.enterToSave} &middot;{" "}
                        {copy.quickEntry.escToCancel}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSaveAndNew(true);
                            modalRef.current
                              ?.querySelector("form")
                              ?.requestSubmit();
                          }}
                          className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          {copy.quickEntry.saveAndNew}
                        </button>
                        <button
                          type="submit"
                          onClick={() => setSaveAndNew(false)}
                          className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                        >
                          {copy.buttons.save}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ RECURRING TAB ══════════════════════════════════════════ */}
        {activeTab === "recurring" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {copy.recurring.subtitle}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  {copy.recurring.generateNow}
                </button>
                <button
                  onClick={() => {
                    resetRecurringForm();
                    setShowRecurringForm(true);
                  }}
                  className="vp-button vp-button-primary"
                >
                  <Plus className="w-4 h-4" />
                  {copy.recurring.newRecurring}
                </button>
              </div>
            </div>

            {/* Recurring Form */}
            {showRecurringForm && (
              <div className="vp-card vp-panel mb-6">
                <form
                  onSubmit={handleRecurringSubmit}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <div className="md:col-span-2">
                    <label className="vp-label">
                      {copy.labels.description}
                    </label>
                    <input
                      value={recurringFormData.description}
                      onChange={(e) => {
                        setRecurringFormData({
                          ...recurringFormData,
                          description: e.target.value,
                        });
                        debouncedSuggestion(e.target.value, "recurring");
                      }}
                      className="vp-input"
                      required
                      placeholder={
                        currentLanguage === "es"
                          ? "Ej: Alquiler de oficina"
                          : currentLanguage === "pt"
                            ? "Ex: Aluguel do escritório"
                            : "E.g., Office rent"
                      }
                    />
                  </div>

                  <div>
                    <label className="vp-label">
                      {copy.recurring.baseAmount}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={recurringFormData.baseAmount}
                      onChange={(e) =>
                        setRecurringFormData({
                          ...recurringFormData,
                          baseAmount: e.target.value,
                        })
                      }
                      className="vp-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="vp-label">{copy.labels.category}</label>
                    <input
                      value={recurringFormData.category}
                      onChange={(e) =>
                        setRecurringFormData({
                          ...recurringFormData,
                          category: e.target.value,
                        })
                      }
                      className="vp-input"
                    />
                    {/* Category Suggestion for Recurring */}
                    {recurringSuggestion && !recurringFormData.category && (
                      <div className="mt-1.5 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-sm">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                        <span className="text-indigo-700 dark:text-indigo-300 font-medium truncate">
                          {recurringSuggestion.category}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                            recurringSuggestion.confidence === "high"
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : recurringSuggestion.confidence === "medium"
                                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {copy.categorize[recurringSuggestion.confidence]}
                        </span>
                        <button
                          type="button"
                          onClick={() => acceptSuggestion("recurring")}
                          className="ml-auto px-2 py-0.5 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex-shrink-0"
                        >
                          {copy.categorize.accept}
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="vp-label">
                      {copy.recurring.frequency}
                    </label>
                    <select
                      value={recurringFormData.frequency}
                      onChange={(e) =>
                        setRecurringFormData({
                          ...recurringFormData,
                          frequency: e.target.value as any,
                        })
                      }
                      className="vp-input"
                    >
                      <option value="monthly">
                        {copy.recurring.frequencies.monthly}
                      </option>
                      <option value="weekly">
                        {copy.recurring.frequencies.weekly}
                      </option>
                      <option value="biweekly">
                        {copy.recurring.frequencies.biweekly}
                      </option>
                      <option value="annual">
                        {copy.recurring.frequencies.annual}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="vp-label">
                      {copy.recurring.executionDay}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={
                        recurringFormData.frequency === "weekly" ||
                        recurringFormData.frequency === "biweekly"
                          ? 7
                          : 31
                      }
                      value={recurringFormData.executionDay}
                      onChange={(e) =>
                        setRecurringFormData({
                          ...recurringFormData,
                          executionDay: e.target.value,
                        })
                      }
                      className="vp-input"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {
                        copy.recurring.dayHelp[
                          recurringFormData.frequency as keyof typeof copy.recurring.dayHelp
                        ]
                      }
                    </p>
                  </div>

                  <div>
                    <label className="vp-label">
                      {copy.labels.paymentMethod}
                    </label>
                    <select
                      value={recurringFormData.paymentMethod}
                      onChange={(e) =>
                        setRecurringFormData({
                          ...recurringFormData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="vp-input"
                    >
                      <option value="cash">{copy.paymentMethods.cash}</option>
                      <option value="card">{copy.paymentMethods.card}</option>
                      <option value="transfer">
                        {copy.paymentMethods.transfer}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="vp-label">
                      {copy.recurring.startDate}
                    </label>
                    <input
                      type="date"
                      value={recurringFormData.startDate}
                      onChange={(e) =>
                        setRecurringFormData({
                          ...recurringFormData,
                          startDate: e.target.value,
                        })
                      }
                      className="vp-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="vp-label">{copy.recurring.endDate}</label>
                    <input
                      type="date"
                      value={recurringFormData.endDate}
                      onChange={(e) =>
                        setRecurringFormData({
                          ...recurringFormData,
                          endDate: e.target.value,
                        })
                      }
                      className="vp-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="vp-label">{copy.labels.notes}</label>
                    <textarea
                      value={recurringFormData.notes}
                      onChange={(e) =>
                        setRecurringFormData({
                          ...recurringFormData,
                          notes: e.target.value,
                        })
                      }
                      className="vp-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recurringFormData.requiresConfirmation}
                        onChange={(e) =>
                          setRecurringFormData({
                            ...recurringFormData,
                            requiresConfirmation: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {copy.recurring.requiresConfirmation}
                      </span>
                    </label>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetRecurringForm}
                      className="vp-button"
                    >
                      {copy.buttons.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                    >
                      {copy.buttons.save}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Recurring Expense Cards */}
            <div className="space-y-3">
              {recurringLoading &&
                Array.from({ length: 2 }).map((_, idx) => (
                  <div
                    key={`rload-${idx}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse"
                  >
                    <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
                    <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                ))}

              {!recurringLoading && recurringExpenses.length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
                  <RefreshCw className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    {copy.recurring.noRecurring}
                  </p>
                </div>
              )}

              {recurringExpenses.map((recurring) => (
                <div
                  key={recurring._id}
                  className={`bg-white dark:bg-slate-900 border rounded-xl p-5 transition-colors ${
                    recurring.active
                      ? "border-slate-200 dark:border-slate-800"
                      : "border-slate-200/50 dark:border-slate-800/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {recurring.description}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            recurring.active
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {recurring.active
                            ? copy.recurring.active
                            : copy.recurring.paused}
                        </span>
                        {recurring.requiresConfirmation && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-medium">
                            <Bell className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                            {copy.recurring.requiresConfirmation}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatAmount(recurring.baseAmount)}
                        </span>
                        <span>
                          {
                            copy.recurring.frequencies[
                              recurring.frequency as keyof typeof copy.recurring.frequencies
                            ]
                          }
                        </span>
                        <span>
                          {copy.recurring.executionDay}:{" "}
                          {recurring.executionDay}
                        </span>
                        {recurring.category && (
                          <span>{recurring.category}</span>
                        )}
                        <span>
                          {recurring.startDate?.slice(0, 10)} →{" "}
                          {recurring.endDate
                            ? recurring.endDate.slice(0, 10)
                            : copy.recurring.indefinite}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                        {copy.recurring.lastGenerated}:{" "}
                        {recurring.lastGeneratedDate
                          ? recurring.lastGeneratedDate.slice(0, 10)
                          : copy.recurring.never}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-3 shrink-0">
                      <button
                        onClick={() => handleTogglePause(recurring)}
                        className={`p-1.5 rounded-md transition-colors ${
                          recurring.active
                            ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                            : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        }`}
                        title={copy.recurring.togglePause}
                      >
                        {recurring.active ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditRecurring(recurring)}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecurring(recurring._id)}
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ IMPORT TAB ═════════════════════════════════════════════ */}
        {activeTab === "import" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {copy.import.subtitle}
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                {copy.import.downloadTemplate}
              </button>
            </div>

            {/* Upload Area */}
            {importStep === "select" && (
              <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center mb-6">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  {copy.import.dragDrop}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                  {copy.import.supportedFormats} &middot; {copy.import.maxRows}
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  {copy.import.uploadButton}
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Loading */}
            {importLoading && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center mb-6">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400">
                  {importStep === "select"
                    ? copy.import.validating
                    : copy.import.importing}
                </p>
              </div>
            )}

            {/* Preview */}
            {importStep === "preview" && !importLoading && (
              <div className="space-y-4 mb-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {importTotalRows}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {copy.import.totalRows}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {importValidRows}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {copy.import.validRows}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-500/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {importErrors.length}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {copy.import.errorRows}
                    </p>
                  </div>
                </div>

                {/* Validation Errors */}
                {importErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h4 className="font-semibold text-red-800 dark:text-red-300">
                        {copy.import.validationErrors}
                      </h4>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-red-700 dark:text-red-400 border-b border-red-200 dark:border-red-500/20">
                            <th className="text-left py-1 px-2">
                              {copy.import.row}
                            </th>
                            <th className="text-left py-1 px-2">
                              {copy.import.field}
                            </th>
                            <th className="text-left py-1 px-2">
                              {copy.import.error}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-red-700 dark:text-red-300">
                          {importErrors.map((err, idx) => (
                            <tr key={idx}>
                              <td className="py-1 px-2">{err.row}</td>
                              <td className="py-1 px-2">{err.field}</td>
                              <td className="py-1 px-2">{err.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Preview Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    {copy.import.preview} ({importPreview.length}{" "}
                    {copy.labels.expenses.toLowerCase()})
                  </h4>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <th className="text-left py-1.5 px-2">
                            {copy.labels.date}
                          </th>
                          <th className="text-left py-1.5 px-2">
                            {copy.labels.description}
                          </th>
                          <th className="text-left py-1.5 px-2">
                            {copy.labels.category}
                          </th>
                          <th className="text-right py-1.5 px-2">
                            {copy.labels.amount}
                          </th>
                          <th className="text-left py-1.5 px-2">
                            {copy.labels.notes}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {importPreview.map((row, idx) => (
                          <tr
                            key={idx}
                            className="text-slate-900 dark:text-slate-200"
                          >
                            <td className="py-1.5 px-2">{row.date}</td>
                            <td className="py-1.5 px-2">{row.description}</td>
                            <td className="py-1.5 px-2">
                              {row.category || "-"}
                            </td>
                            <td className="py-1.5 px-2 text-right">
                              {row.amount}
                            </td>
                            <td className="py-1.5 px-2">{row.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={resetImport}
                    className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {copy.buttons.cancel}
                  </button>
                  <button
                    onClick={handleImportConfirm}
                    disabled={importErrors.length > 0 || importLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {copy.import.importButton} ({importValidRows})
                  </button>
                </div>
              </div>
            )}

            {/* Import History */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                {copy.import.importHistory}
              </h3>
              {importLogs.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  {copy.import.noHistory}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <th className="text-left py-2 px-3">
                          {copy.labels.date}
                        </th>
                        <th className="text-left py-2 px-3">Archivo</th>
                        <th className="text-right py-2 px-3">
                          {copy.import.totalRows}
                        </th>
                        <th className="text-right py-2 px-3">
                          {copy.import.validRows}
                        </th>
                        <th className="text-left py-2 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {importLogs.map((log) => (
                        <tr
                          key={log._id}
                          className="text-slate-900 dark:text-slate-200"
                        >
                          <td className="py-2 px-3">
                            {log.createdAt?.slice(0, 10)}
                          </td>
                          <td className="py-2 px-3 truncate max-w-[200px]">
                            {log.fileName}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {log.totalRows}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {log.successCount}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                log.status === "success"
                                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                  : log.status === "partial"
                                    ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                    : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                              }`}
                            >
                              {
                                copy.import.status[
                                  log.status as keyof typeof copy.import.status
                                ]
                              }
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══ RULES TAB ══════════════════════════════════════════════ */}
        {activeTab === "rules" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {copy.categorize.basedOn} {copy.categorize.rules}
                </p>
              </div>
              <button
                onClick={() => setShowRuleForm(true)}
                className="vp-button vp-button-primary"
              >
                <Plus className="w-4 h-4" />
                {copy.categorize.addRule}
              </button>
            </div>

            {/* New Rule Form */}
            {showRuleForm && (
              <div className="vp-card vp-panel mb-6">
                <form
                  onSubmit={handleSaveRule}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <div>
                    <label className="vp-label">
                      {copy.categorize.category}
                    </label>
                    <input
                      value={ruleFormData.category}
                      onChange={(e) =>
                        setRuleFormData({
                          ...ruleFormData,
                          category: e.target.value,
                        })
                      }
                      className="vp-input"
                      required
                      placeholder={
                        currentLanguage === "es"
                          ? "Ej: Servicios"
                          : currentLanguage === "pt"
                            ? "Ex: Serviços"
                            : "E.g., Services"
                      }
                    />
                  </div>
                  <div>
                    <label className="vp-label">
                      {copy.categorize.keywords}
                    </label>
                    <input
                      value={ruleFormData.keywords}
                      onChange={(e) =>
                        setRuleFormData({
                          ...ruleFormData,
                          keywords: e.target.value,
                        })
                      }
                      className="vp-input"
                      required
                      placeholder={
                        currentLanguage === "es"
                          ? "limpieza, cleaning, higiene"
                          : currentLanguage === "pt"
                            ? "limpeza, cleaning, higiene"
                            : "cleaning, janitorial, hygiene"
                      }
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRuleForm(false);
                        setRuleFormData({ category: "", keywords: "" });
                      }}
                      className="vp-button"
                    >
                      {copy.buttons.cancel}
                    </button>
                    <button
                      type="submit"
                      className="vp-button vp-button-primary"
                    >
                      {copy.buttons.save}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Rules Loading */}
            {rulesLoading && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
                {copy.labels.loading}
              </div>
            )}

            {/* Custom Rules */}
            {!rulesLoading && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  {copy.categorize.customRules}
                </h3>
                {categoryRules.filter((r) => !r.isDefault).length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 py-3">
                    {copy.categorize.noRules}
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryRules
                      .filter((r) => !r.isDefault)
                      .map((rule) => (
                        <div
                          key={rule._id}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                              {rule.category}
                            </span>
                            <button
                              onClick={() => handleDeleteRule(rule._id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {rule.keywords.map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Default Rules */}
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-6">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  {copy.categorize.defaultRules}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryRules
                    .filter((r) => r.isDefault)
                    .map((rule) => {
                      const lang = currentLanguage || "es";
                      const catNames =
                        DEFAULT_CATEGORY_NAMES[lang] ||
                        DEFAULT_CATEGORY_NAMES.en;
                      const langKeywords = (DEFAULT_KEYWORDS_BY_LANG[lang] ||
                        DEFAULT_KEYWORDS_BY_LANG.en)[rule.category];
                      const displayName =
                        catNames[rule.category] || rule.category;
                      const displayKeywords = langKeywords || rule.keywords;
                      return (
                        <div
                          key={rule._id}
                          className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 opacity-80"
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm block mb-2">
                            {displayName}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {displayKeywords.slice(0, 8).map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              >
                                {kw}
                              </span>
                            ))}
                            {displayKeywords.length > 8 && (
                              <span className="px-2 py-0.5 text-xs text-slate-400 dark:text-slate-500">
                                +{displayKeywords.length - 8}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ BUDGETS TAB ═══════════════════════════════════════════ */}
        {activeTab === "budgets" && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {copy.budgets.subtitle}
              </p>
              <button
                onClick={() => setShowBudgetForm(true)}
                className="vp-button vp-button-primary"
              >
                <Plus className="w-4 h-4" />
                {copy.budgets.newBudget}
              </button>
            </div>

            {/* Month/Year Selector */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  {copy.budgets.monthLabel}
                </label>
                <select
                  value={budgetMonth}
                  onChange={(e) => {
                    const m = parseInt(e.target.value);
                    setBudgetMonth(m);
                    fetchBudgets(budgetYear, m);
                  }}
                  className="vp-input w-auto text-sm py-1.5"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString(
                        localeMap[currentLanguage] || "en-US",
                        { month: "long" },
                      )}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  {copy.budgets.yearLabel}
                </label>
                <select
                  value={budgetYear}
                  onChange={(e) => {
                    const y = parseInt(e.target.value);
                    setBudgetYear(y);
                    fetchBudgets(y, budgetMonth);
                  }}
                  className="vp-input w-auto text-sm py-1.5"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Budget Form */}
            {showBudgetForm && (
              <div className="vp-card vp-panel mb-6">
                <form
                  onSubmit={handleBudgetSubmit}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <div>
                    <label className="vp-label">{copy.budgets.category}</label>
                    <select
                      value={budgetFormData.category}
                      onChange={(e) =>
                        setBudgetFormData({
                          ...budgetFormData,
                          category: e.target.value,
                        })
                      }
                      className="vp-input"
                    >
                      <option value="">—</option>
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {!allCategories.includes(budgetFormData.category) && (
                      <input
                        value={budgetFormData.category}
                        onChange={(e) =>
                          setBudgetFormData({
                            ...budgetFormData,
                            category: e.target.value,
                          })
                        }
                        placeholder={copy.budgets.category}
                        className="vp-input mt-1"
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label className="vp-label">{copy.budgets.limit}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={budgetFormData.limitAmount}
                      onChange={(e) =>
                        setBudgetFormData({
                          ...budgetFormData,
                          limitAmount: e.target.value,
                        })
                      }
                      className="vp-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="vp-label">{copy.budgets.period}</label>
                    <select
                      value={budgetFormData.period}
                      onChange={(e) =>
                        setBudgetFormData({
                          ...budgetFormData,
                          period: e.target.value as any,
                        })
                      }
                      className="vp-input"
                    >
                      <option value="monthly">{copy.budgets.monthly}</option>
                      <option value="quarterly">
                        {copy.budgets.quarterly}
                      </option>
                      <option value="annual">{copy.budgets.annual}</option>
                    </select>
                  </div>
                  {budgetFormData.period === "monthly" && (
                    <div>
                      <label className="vp-label">
                        {copy.budgets.monthLabel}
                      </label>
                      <select
                        value={budgetFormData.month}
                        onChange={(e) =>
                          setBudgetFormData({
                            ...budgetFormData,
                            month: e.target.value,
                          })
                        }
                        className="vp-input"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1)}>
                            {new Date(2000, i).toLocaleString(
                              localeMap[currentLanguage] || "en-US",
                              { month: "long" },
                            )}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="vp-label">{copy.budgets.yearLabel}</label>
                    <input
                      type="number"
                      value={budgetFormData.year}
                      onChange={(e) =>
                        setBudgetFormData({
                          ...budgetFormData,
                          year: e.target.value,
                        })
                      }
                      className="vp-input"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="emailAlerts"
                      checked={budgetFormData.emailAlerts}
                      onChange={(e) =>
                        setBudgetFormData({
                          ...budgetFormData,
                          emailAlerts: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                    />
                    <label
                      htmlFor="emailAlerts"
                      className="text-sm text-slate-700 dark:text-slate-300"
                    >
                      {copy.budgets.emailAlerts}
                    </label>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBudgetForm(false)}
                      className="vp-button"
                    >
                      {copy.buttons.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                    >
                      {copy.buttons.save}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Budget Cards Dashboard */}
            {budgetsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse"
                  >
                    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 mb-3" />
                    <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
                    <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800 mb-2" />
                    <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : budgets.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
                <Wallet className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  {copy.budgets.noBudgets}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {budgets.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 relative group"
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteBudget(b._id)}
                      className="absolute top-3 right-3 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Category + Period */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">
                        {b.category}
                      </span>
                      <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {copy.budgets[b.period as keyof typeof copy.budgets] ||
                          b.period}
                      </span>
                    </div>

                    {/* Amounts */}
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span
                        className={`text-lg font-bold ${budgetTextColor(b.percentage)}`}
                      >
                        {formatAmount(b.spent)}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        / {formatAmount(b.limitAmount)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${budgetProgressColor(b.percentage)}`}
                        style={{
                          width: `${Math.min(b.percentage, 100)}%`,
                        }}
                      />
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-semibold ${budgetTextColor(b.percentage)}`}
                      >
                        {b.percentage}%
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {copy.budgets.remaining}:{" "}
                        <span
                          className={
                            b.remaining < 0
                              ? "text-red-500 font-medium"
                              : "text-slate-700 dark:text-slate-300"
                          }
                        >
                          {formatAmount(b.remaining)}
                        </span>
                      </span>
                    </div>

                    {/* Alert indicators */}
                    {(b.alert80Sent || b.alert100Sent) && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {b.alert100Sent && (
                          <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            {copy.budgets.alert100}
                          </span>
                        )}
                        {b.alert80Sent && !b.alert100Sent && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-3 h-3" />
                            {copy.budgets.alert80}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Budgeted vs Actual Summary */}
            {budgets.length > 0 && (
              <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  {copy.budgets.budgetedVsActual}
                </h3>
                <div className="space-y-3">
                  {budgets.map((b) => (
                    <div key={b._id} className="flex items-center gap-3">
                      <span className="w-28 text-xs text-slate-600 dark:text-slate-400 truncate">
                        {b.category}
                      </span>
                      <div className="flex-1 relative h-5 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {/* Budget limit line */}
                        <div
                          className={`absolute inset-y-0 left-0 ${budgetProgressColor(b.percentage)} opacity-80 rounded`}
                          style={{
                            width: `${Math.min(b.percentage, 100)}%`,
                          }}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center px-2 text-[10px] font-medium text-white mix-blend-difference">
                          {formatAmount(b.spent)}
                        </div>
                      </div>
                      <span className="w-24 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                        {formatAmount(b.limitAmount)}
                      </span>
                      <span
                        className={`w-12 text-right text-xs font-semibold ${budgetTextColor(b.percentage)}`}
                      >
                        {b.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════ VENDORS TAB ═══════════════════════ */}
        {activeTab === "vendors" && (
          <VendorExpenseSummary copy={copy} formatAmount={formatAmount} />
        )}
      </main>
    </div>
  );
}
