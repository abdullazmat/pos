"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import { toast } from "react-toastify";
import { Calendar, Download, FileText, Filter, Loader } from "lucide-react";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ResumenData {
  totalSales: number;
  totalTaxableAmount: number;
  totalTaxAmount: number;
  invoiceCount: number;
  taxBreakdown: {
    rate: number;
    baseAmount: number;
    taxAmount: number;
  }[];
}

interface LibroVentasRow {
  date: string;
  invoiceType: string;
  invoiceNumber: string;
  customerName: string;
  customerCuit: string;
  neto: number;
  iva: number;
  total: number;
  cae: string;
  status: string;
}

interface LibroIVARow {
  aliquot: string;
  baseAmount: number;
  taxAmount: number;
}

const TRANSLATIONS = {
  es: {
    title: "Reportes Fiscales - IVA",
    subtitle:
      "Gestiona tus reportes fiscales, libro de ventas y detalles de IVA",
    dateRangeSection: "Período de Consulta",
    startDate: "Fecha Inicio",
    endDate: "Fecha Fin",
    thisMonth: "Mes Actual",
    tabs: {
      resumen: "Resumen",
      libroVentas: "Libro de Ventas",
      libroIVA: "Libro de IVA",
      configuracion: "Configuración",
    },
    resumen: {
      title: "Resumen de Período",
      totalSales: "Total Ventas",
      totalTaxable: "Neto Gravado",
      totalIVA: "Total IVA",
      taxBreakdown: "Desglose por Alícuota",
      invoiceCount: "Comprobantes",
    },
    libroVentas: {
      title: "Libro de Ventas",
      subtitle: "Registro detallado de todas las ventas del período",
      generateReport: "Generar Reporte",
      columns: {
        date: "Fecha",
        type: "Tipo Comprobante",
        number: "Número",
        customer: "Cliente",
        cuit: "CUIT",
        neto: "Neto",
        iva: "IVA",
        total: "Total",
        cae: "CAE",
        status: "Estado",
      },
      filters: {
        pointOfSale: "Punto de Venta",
        invoiceType: "Tipo de Comprobante",
        status: "Estado",
      },
      noData: "No hay comprobantes para el período seleccionado",
    },
    libroIVA: {
      title: "Libro de IVA",
      description: "Desglose detallado de IVA por producto vendido",
      columns: {
        aliquot: "Alícuota",
        baseAmount: "Base Imponible",
        taxAmount: "Monto IVA",
      },
      noData: "No hay movimientos de IVA para el período",
    },
    export: {
      csv: "Exportar a CSV",
      xlsx: "Exportar a Excel",
      libroIVADigital: "Generar Libro IVA Digital",
      generating: "Generando...",
      success: "Reporte generado exitosamente",
      error: "Error al generar reporte",
      noData: "No hay datos para exportar",
    },
    errors: {
      failedToGenerate: "Error al generar el reporte",
      failedToExport: "Error al exportar el reporte",
      countryRequired: "El país es requerido",
      taxRateRequired: "La tasa de IVA es requerida",
      taxRateInvalid: "La tasa de IVA debe ser un número válido",
      fiscalRegimeRequired: "El régimen fiscal es requerido",
      fiscalIdRequired: "El ID Fiscal (CUIT/RUT/RFC/RUC) es requerido",
    },
    buttons: {
      generate: "Generar Reporte",
      generating: "Generando...",
    },
    configuracion: {
      title: "Configuración Fiscal",
      country: "País",
      taxRate: "Tasa de IVA (%)",
      fiscalRegime: "Régimen Fiscal",
      fiscalId: "ID Fiscal (CUIT/RUT/RFC/RUC)",
      fiscalIdPlaceholder: "Ej: 20-12345678-9",
      saveConfig: "Guardar Configuración",
      saveSuccess: "Configuración guardada exitosamente",
      argentina: "Argentina",
      regimenGeneral: "Régimen General",
      regimenSimplificado: "Régimen Simplificado",
      monotributo: "Monotributo",
      info: {
        title: "Acerca de los Reportes de IVA",
        libroVentas:
          "Libro de Ventas: Registro cronológico de todas las operaciones de venta",
        libroIVA:
          "Libro de IVA: Desglose detallado del IVA por producto vendido",
        resumen:
          "Resumen: Totalizadores y estadísticas del período seleccionado",
        calculation:
          "Los cálculos se basan en la tasa de IVA configurada (21%)",
        export: "Puedes exportar los reportes a CSV para su análisis en Excel",
      },
    },
  },
  en: {
    title: "Fiscal Reports - VAT",
    subtitle: "Manage your fiscal reports, sales book and VAT details",
    dateRangeSection: "Query Period",
    startDate: "Start Date",
    endDate: "End Date",
    thisMonth: "This Month",
    tabs: {
      resumen: "Summary",
      libroVentas: "Sales Book",
      libroIVA: "VAT Book",
      configuracion: "Settings",
    },
    resumen: {
      title: "Period Summary",
      totalSales: "Total Sales",
      totalTaxable: "Taxable Amount",
      totalIVA: "Total VAT",
      taxBreakdown: "Breakdown by Rate",
      invoiceCount: "Invoices",
    },
    libroVentas: {
      title: "Sales Book",
      subtitle: "Detailed record of all sales for the period",
      generateReport: "Generate Report",
      columns: {
        date: "Date",
        type: "Invoice Type",
        number: "Number",
        customer: "Customer",
        cuit: "CUIT",
        neto: "Net",
        iva: "VAT",
        total: "Total",
        cae: "CAE",
        status: "Status",
      },
      filters: {
        pointOfSale: "Point of Sale",
        invoiceType: "Invoice Type",
        status: "Status",
      },
      noData: "No invoices for the selected period",
    },
    libroIVA: {
      title: "VAT Book",
      description: "Detailed breakdown of VAT by product sold",
      columns: {
        aliquot: "Rate",
        baseAmount: "Taxable Base",
        taxAmount: "VAT Amount",
      },
      noData: "No VAT movements for the period",
    },
    export: {
      csv: "Export to CSV",
      xlsx: "Export to Excel",
      libroIVADigital: "Generate Digital VAT Book",
      generating: "Generating...",
      success: "Report generated successfully",
      error: "Error generating report",
      noData: "No data to export",
    },
    errors: {
      failedToGenerate: "Failed to generate report",
      failedToExport: "Failed to export report",
      countryRequired: "Country is required",
      taxRateRequired: "VAT rate is required",
      taxRateInvalid: "VAT rate must be a valid number",
      fiscalRegimeRequired: "Fiscal regime is required",
      fiscalIdRequired: "Fiscal ID (CUIT/RUT/RFC/RUC) is required",
    },
    buttons: {
      generate: "Generate Report",
      generating: "Generating...",
    },
    configuracion: {
      title: "Fiscal Configuration",
      country: "Country",
      taxRate: "VAT Rate (%)",
      fiscalRegime: "Fiscal Regime",
      fiscalId: "Fiscal ID (CUIT/RUT/RFC/RUC)",
      fiscalIdPlaceholder: "E.g: 20-12345678-9",
      saveConfig: "Save Configuration",
      saveSuccess: "Configuration saved successfully",
      argentina: "Argentina",
      regimenGeneral: "General Regime",
      regimenSimplificado: "Simplified Regime",
      monotributo: "Monotributo",
      info: {
        title: "About VAT Reports",
        libroVentas: "Sales Book: Chronological record of all sales operations",
        libroIVA: "VAT Book: Detailed breakdown of VAT by product sold",
        resumen: "Summary: Totals and statistics for the selected period",
        calculation: "Calculations are based on the configured VAT rate (21%)",
        export: "You can export reports to CSV for analysis in Excel",
      },
    },
  },
  pt: {
    title: "Relatórios Fiscais - IVA",
    subtitle:
      "Gerencie seus relatórios fiscais, livro de vendas e detalhes de IVA",
    dateRangeSection: "Período de Consulta",
    startDate: "Data Inicial",
    endDate: "Data Final",
    thisMonth: "Este Mês",
    tabs: {
      resumen: "Resumo",
      libroVentas: "Livro de Vendas",
      libroIVA: "Livro de IVA",
      configuracion: "Configurações",
    },
    resumen: {
      title: "Resumo do Período",
      totalSales: "Total de Vendas",
      totalTaxable: "Valor Tributável",
      totalIVA: "Total de IVA",
      taxBreakdown: "Detalhamento por Alíquota",
      invoiceCount: "Comprovantes",
    },
    libroVentas: {
      title: "Livro de Vendas",
      subtitle: "Registro detalhado de todas as vendas do período",
      generateReport: "Gerar Relatório",
      columns: {
        date: "Data",
        type: "Tipo de Comprovante",
        number: "Número",
        customer: "Cliente",
        cuit: "CUIT",
        neto: "Líquido",
        iva: "IVA",
        total: "Total",
        cae: "CAE",
        status: "Status",
      },
      filters: {
        pointOfSale: "Ponto de Venda",
        invoiceType: "Tipo de Comprovante",
        status: "Status",
      },
      noData: "Nenhum comprovante para o período selecionado",
    },
    libroIVA: {
      title: "Livro de IVA",
      description: "Detalhamento de IVA por produto vendido",
      columns: {
        aliquot: "Alíquota",
        baseAmount: "Base Tributável",
        taxAmount: "Valor IVA",
      },
      noData: "Nenhum movimento de IVA para o período",
    },
    export: {
      csv: "Exportar para CSV",
      xlsx: "Exportar para Excel",
      libroIVADigital: "Gerar Livro IVA Digital",
      generating: "Gerando...",
      success: "Relatório gerado com sucesso",
      error: "Erro ao gerar relatório",
      noData: "Nenhum dado para exportar",
    },
    errors: {
      failedToGenerate: "Falha ao gerar relatório",
      failedToExport: "Falha ao exportar relatório",
      countryRequired: "O país é obrigatório",
      taxRateRequired: "A alíquota de IVA é obrigatória",
      taxRateInvalid: "A alíquota de IVA deve ser um número válido",
      fiscalRegimeRequired: "O regime fiscal é obrigatório",
      fiscalIdRequired: "O ID Fiscal (CUIT/RUT/RFC/RUC) é obrigatório",
    },
    buttons: {
      generate: "Gerar Relatório",
      generating: "Gerando...",
    },
    configuracion: {
      title: "Configuração Fiscal",
      country: "País",
      taxRate: "Alíquota de IVA (%)",
      fiscalRegime: "Regime Fiscal",
      fiscalId: "ID Fiscal (CUIT/RUT/RFC/RUC)",
      fiscalIdPlaceholder: "Ex: 20-12345678-9",
      saveConfig: "Salvar Configuração",
      saveSuccess: "Configuração salva com sucesso",
      argentina: "Argentina",
      regimenGeneral: "Regime Geral",
      regimenSimplificado: "Regime Simplificado",
      monotributo: "Monotributo",
      info: {
        title: "Sobre Relatórios de IVA",
        libroVentas:
          "Livro de Vendas: Registro cronológico de todas as operações de venda",
        libroIVA: "Livro de IVA: Detalhamento de IVA por produto vendido",
        resumen: "Resumo: Totalizadores e estatísticas do período selecionado",
        calculation:
          "Os cálculos são baseados na alíquota de IVA configurada (21%)",
        export:
          "Você pode exportar os relatórios para CSV para análise no Excel",
      },
    },
  },
};

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

// Helper function for authenticated fetch
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

export default function FiscalReportsPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const t =
    TRANSLATIONS[currentLanguage as keyof typeof TRANSLATIONS] ||
    TRANSLATIONS.es;

  const [user, setUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState("resumen");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [resumenData, setResumenData] = useState<ResumenData | null>(null);
  const [libroVentasData, setLibroVentasData] = useState<LibroVentasRow[]>([]);
  const [libroIVAData, setLibroIVAData] = useState<LibroIVARow[]>([]);
  const [configCountry, setConfigCountry] = useState("argentina");
  const [configTaxRate, setConfigTaxRate] = useState("21");
  const [configFiscalRegime, setConfigFiscalRegime] = useState("general");
  const [configFiscalId, setConfigFiscalId] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    country?: string;
    taxRate?: string;
    fiscalRegime?: string;
    fiscalId?: string;
  }>({});

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      if (parsedUser?.role !== "admin") {
        router.push("/dashboard");
      }
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  // Fetch report data
  const generateReport = async (
    reportType: string,
    silent: boolean = false,
  ) => {
    try {
      setLoading(true);

      const response = await authenticatedFetch(
        `/api/fiscal-reports?reportType=${reportType}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        let errorMessage = t.errors.failedToGenerate;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        console.error(`[REPORT ERROR] ${reportType}:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || t.errors.failedToGenerate);
      }

      if (reportType === "resumen") {
        setResumenData(data.data);
      } else if (reportType === "libro-ventas") {
        const rows = data.data?.data || data.data || [];
        setLibroVentasData(Array.isArray(rows) ? rows : []);
      } else if (reportType === "libro-iva") {
        const rows = data.data?.data || data.data || [];
        setLibroIVAData(Array.isArray(rows) ? rows : []);
      }

      if (!silent) {
        toast.success(t.export.success);
      }
    } catch (error: any) {
      console.error("Error generating report:", error);
      if (!silent) {
        toast.error(error.message || t.errors.failedToGenerate);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate report when tab or dates change
  useEffect(() => {
    const reportTypeMap: Record<string, string> = {
      resumen: "resumen",
      libroVentas: "libro-ventas",
      libroIVA: "libro-iva",
    };

    if (reportTypeMap[activeTab]) {
      generateReport(reportTypeMap[activeTab], true); // Silent mode - no toasts
    }
  }, [activeTab, dateRange]);

  // Load existing fiscal configuration
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        const response = await authenticatedFetch("/api/fiscal-configuration");
        if (!response.ok) return;
        const cfg = await response.json();
        if (cfg?.data) {
          if (cfg.data.country) setConfigCountry(cfg.data.country);
          if (cfg.data.taxRate !== undefined)
            setConfigTaxRate(String(cfg.data.taxRate));
          if (cfg.data.fiscalRegime)
            setConfigFiscalRegime(cfg.data.fiscalRegime);
          if (cfg.data.fiscalId) setConfigFiscalId(cfg.data.fiscalId);
        }
      } catch (error) {
        console.error("Error loading configuration", error);
      }
    };
    loadConfiguration();
  }, []);

  // Save fiscal configuration
  const saveConfiguration = async () => {
    const country = (configCountry || "").trim();
    const taxRateValue = parseFloat(configTaxRate || "");
    const fiscalRegime = (configFiscalRegime || "").trim();
    const fiscalId = (configFiscalId || "").trim();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate all fields
    const errors: typeof validationErrors = {};

    if (!country) {
      errors.country = t.errors?.countryRequired || "Country is required";
    }

    if (!configTaxRate || configTaxRate.trim() === "") {
      errors.taxRate = t.errors?.taxRateRequired || "VAT rate is required";
    } else if (Number.isNaN(taxRateValue) || taxRateValue <= 0) {
      errors.taxRate =
        t.errors?.taxRateInvalid || "VAT rate must be a valid number";
    }

    if (!fiscalRegime) {
      errors.fiscalRegime =
        t.errors?.fiscalRegimeRequired || "Fiscal regime is required";
    }

    if (!fiscalId) {
      errors.fiscalId = t.errors?.fiscalIdRequired || "Fiscal ID is required";
    }

    // If there are validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Show a summary toast with the first error
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      setLoading(true);
      const response = await authenticatedFetch("/api/fiscal-configuration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          taxRate: taxRateValue,
          fiscalRegime,
          fiscalId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error saving configuration");
      }

      toast.success(
        t.configuracion?.saveSuccess || "Configuration saved successfully",
      );
    } catch (error: any) {
      console.error("Error saving configuration:", error);
      toast.error(
        error.message ||
          t.errors?.failedToGenerate ||
          "Error saving configuration",
      );
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = async (reportType: string) => {
    try {
      setLoading(true);

      let data: any[] = [];
      if (reportType === "LIBRO_VENTAS") {
        data = libroVentasData;
      } else if (reportType === "LIBRO_IVA") {
        data = libroIVAData;
      }

      if (!data || data.length === 0) {
        console.warn("[EXPORT] No data available for export", {
          reportType,
          libroVentasLength: libroVentasData.length,
          libroIVALength: libroIVAData.length,
        });
        toast.error(t.export?.noData || "No data to export");
        setLoading(false);
        return;
      }

      console.log("[EXPORT] Preparing request", {
        reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        dataLength: data.length,
        sampleRow: data[0],
      });

      const response = await authenticatedFetch("/api/fiscal-reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          format: "csv",
          data,
        }),
      });

      console.log(
        `[EXPORT] Response received: status=${response.status}, ok=${response.ok}, headers=`,
        {
          contentType: response.headers.get("Content-Type"),
          contentDisposition: response.headers.get("Content-Disposition"),
        },
      );

      if (!response.ok) {
        let errorMsg = t.errors?.failedToExport || "Failed to export report";
        try {
          const errorText = await response.text();
          console.error(
            "[EXPORT ERROR]",
            `Status ${response.status}:`,
            errorText.substring(0, 500),
          );
          try {
            const errorData = JSON.parse(errorText);
            errorMsg = errorData.error || errorMsg;
            console.error("[EXPORT ERROR] Parsed error object:", errorData);
          } catch (jsonErr) {
            // Not JSON, use text as error
            errorMsg = errorText || errorMsg;
          }
        } catch (e) {
          console.error("[EXPORT ERROR] Failed to read response:", e);
        }
        throw new Error(errorMsg);
      }

      console.log("[EXPORT] Success response received, generating blob...");
      const blob = await response.blob();
      console.log(
        `[EXPORT] Blob created: size=${blob.size} bytes, type=${blob.type}`,
      );

      if (blob.size === 0) {
        console.error("[EXPORT] Blob is empty!");
        throw new Error("Generated file is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_${dateRange.startDate}_${dateRange.endDate}.csv`;
      console.log(
        `[EXPORT] Triggering download: ${a.download}, url length=${url.length}`,
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("[EXPORT] Download completed successfully");
      toast.success(t.export?.success || "Report exported successfully");
    } catch (error: any) {
      console.error("Error exporting:", error);
      toast.error(
        error.message || t.errors?.failedToExport || "Failed to export report",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header user={user} />
      <div className="min-h-screen p-6 text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-white">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">{t.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
          </div>

          {/* Date Range Selector */}
          <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg dark:bg-black dark:border-gray-800">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.startDate}
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.endDate}
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    const now = new Date();
                    setDateRange({
                      startDate: new Date(now.getFullYear(), now.getMonth(), 1)
                        .toISOString()
                        .split("T")[0],
                      endDate: now.toISOString().split("T")[0],
                    });
                  }}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium transition bg-gray-200 border border-gray-300 rounded-lg dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 dark:border-gray-700"
                >
                  <Calendar className="w-4 h-4" />
                  {t.thisMonth}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            {Object.entries(t.tabs).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 font-medium transition rounded-lg flex items-center gap-2 ${
                  activeTab === key
                    ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700"
                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                }`}
              >
                {key === "resumen" && <FileText className="w-4 h-4" />}
                {key === "libroVentas" && <FileText className="w-4 h-4" />}
                {key === "libroIVA" && <FileText className="w-4 h-4" />}
                {key === "configuracion" && <Filter className="w-4 h-4" />}
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-800">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {t.buttons.generating}
                </span>
              </div>
            )}

            {!loading && activeTab === "resumen" && resumenData && (
              <div>
                <h2 className="mb-6 text-2xl font-bold">{t.resumen.title}</h2>

                {/* KPIs */}
                <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
                  <div className="p-4 bg-gray-100 border border-gray-200 rounded dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.resumen.invoiceCount}
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {resumenData.invoiceCount}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 border border-gray-200 rounded dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.resumen.totalSales}
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${resumenData.totalSales.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 border border-gray-200 rounded dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.resumen.totalTaxable}
                    </p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      ${resumenData.totalTaxableAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 border border-gray-200 rounded dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.resumen.totalIVA}
                    </p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      ${resumenData.totalTaxAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Tax Breakdown Table */}
                <h3 className="mb-4 text-lg font-semibold">
                  {t.resumen.taxBreakdown}
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-700">
                      <th className="py-3 text-left text-gray-600 dark:text-gray-400">
                        {t.libroIVA.columns.aliquot}
                      </th>
                      <th className="py-3 text-right text-gray-600 dark:text-gray-400">
                        {t.libroIVA.columns.baseAmount}
                      </th>
                      <th className="py-3 text-right text-gray-600 dark:text-gray-400">
                        {t.libroIVA.columns.taxAmount}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenData.taxBreakdown.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <td className="py-3">{row.rate}%</td>
                        <td className="text-right">
                          ${row.baseAmount.toFixed(2)}
                        </td>
                        <td className="text-right">
                          ${row.taxAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && activeTab === "libroVentas" && (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="mb-1 text-2xl font-semibold">
                      {t.libroVentas.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.libroVentas.subtitle}
                    </p>
                  </div>
                  <button
                    onClick={() => exportToCSV("LIBRO_VENTAS")}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  >
                    {t.libroVentas.generateReport}
                  </button>
                </div>

                {libroVentasData.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.libroVentas.noData}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-700">
                          <th className="py-3 text-sm text-left text-gray-600 dark:text-gray-400">
                            {t.libroVentas.columns.date}
                          </th>
                          <th className="py-3 text-sm text-left text-gray-600 dark:text-gray-400">
                            {t.libroVentas.columns.type}
                          </th>
                          <th className="py-3 text-sm text-left text-gray-600 dark:text-gray-400">
                            {t.libroVentas.columns.number}
                          </th>
                          <th className="py-3 text-sm text-left text-gray-600 dark:text-gray-400">
                            {t.libroVentas.columns.customer}
                          </th>
                          <th className="py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                            {t.libroVentas.columns.neto}
                          </th>
                          <th className="py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                            {t.libroVentas.columns.iva}
                          </th>
                          <th className="py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                            {t.libroVentas.columns.total}
                          </th>
                          <th className="py-3 text-sm text-left text-gray-600 dark:text-gray-400">
                            {t.libroVentas.columns.cae}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {libroVentasData.map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <td className="py-3 text-sm">{row.date}</td>
                            <td className="py-3 text-sm">{row.invoiceType}</td>
                            <td className="py-3 text-sm">
                              {row.invoiceNumber}
                            </td>
                            <td className="py-3 text-sm">{row.customerName}</td>
                            <td className="py-3 text-sm text-right">
                              ${row.neto.toFixed(2)}
                            </td>
                            <td className="py-3 text-sm text-right">
                              ${row.iva.toFixed(2)}
                            </td>
                            <td className="py-3 text-sm font-semibold text-right">
                              ${row.total.toFixed(2)}
                            </td>
                            <td className="py-3 text-sm">{row.cae || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!loading && activeTab === "libroIVA" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{t.libroIVA.title}</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {t.libroIVA.description}
                    </p>
                  </div>
                  <button
                    onClick={() => exportToCSV("LIBRO_IVA")}
                    className="flex items-center gap-2 px-4 py-2 font-medium text-white transition bg-green-600 rounded hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    {t.export.csv}
                  </button>
                </div>

                {libroIVAData.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.libroIVA.noData}
                  </p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-700">
                        <th className="py-3 text-left text-gray-600 dark:text-gray-400">
                          {t.libroIVA.columns.aliquot}
                        </th>
                        <th className="py-3 text-right text-gray-600 dark:text-gray-400">
                          {t.libroIVA.columns.baseAmount}
                        </th>
                        <th className="py-3 text-right text-gray-600 dark:text-gray-400">
                          {t.libroIVA.columns.taxAmount}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {libroIVAData.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <td className="py-3">{row.aliquot}</td>
                          <td className="text-right">
                            ${row.baseAmount.toFixed(2)}
                          </td>
                          <td className="text-right">
                            ${row.taxAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {!loading && activeTab === "configuracion" && (
              <div>
                <h2 className="mb-6 text-xl font-semibold">
                  {t.configuracion.title}
                </h2>

                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
                  {/* País */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t.configuracion.country}
                    </label>
                    <select
                      value={configCountry}
                      onChange={(e) => {
                        setConfigCountry(e.target.value);
                        setValidationErrors((prev) => ({
                          ...prev,
                          country: undefined,
                        }));
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                        validationErrors.country
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                      }`}
                    >
                      <option value="argentina">Argentina</option>
                      <option value="chile">Chile</option>
                      <option value="mexico">México</option>
                      <option value="uruguay">Uruguay</option>
                    </select>
                    {validationErrors.country && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.country}
                      </p>
                    )}
                  </div>

                  {/* Tasa de IVA */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t.configuracion.taxRate}
                    </label>
                    <input
                      type="number"
                      value={configTaxRate}
                      onChange={(e) => {
                        setConfigTaxRate(e.target.value);
                        setValidationErrors((prev) => ({
                          ...prev,
                          taxRate: undefined,
                        }));
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                        validationErrors.taxRate
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                      }`}
                    />
                    {validationErrors.taxRate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.taxRate}
                      </p>
                    )}
                  </div>

                  {/* Régimen Fiscal */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t.configuracion.fiscalRegime}
                    </label>
                    <select
                      value={configFiscalRegime}
                      onChange={(e) => {
                        setConfigFiscalRegime(e.target.value);
                        setValidationErrors((prev) => ({
                          ...prev,
                          fiscalRegime: undefined,
                        }));
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                        validationErrors.fiscalRegime
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                      }`}
                    >
                      <option value="general">
                        {t.configuracion.regimenGeneral}
                      </option>
                      <option value="simplificado">
                        {t.configuracion.regimenSimplificado}
                      </option>
                      <option value="monotributo">
                        {t.configuracion.monotributo}
                      </option>
                    </select>
                    {validationErrors.fiscalRegime && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.fiscalRegime}
                      </p>
                    )}
                  </div>

                  {/* ID Fiscal */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t.configuracion.fiscalId}
                    </label>
                    <input
                      type="text"
                      value={configFiscalId}
                      onChange={(e) => {
                        setConfigFiscalId(e.target.value);
                        setValidationErrors((prev) => ({
                          ...prev,
                          fiscalId: undefined,
                        }));
                      }}
                      placeholder={t.configuracion.fiscalIdPlaceholder}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                        validationErrors.fiscalId
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                      }`}
                    />
                    {validationErrors.fiscalId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.fiscalId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={saveConfiguration}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 font-medium transition bg-gray-200 border border-gray-300 rounded-lg dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Filter className="w-4 h-4" />
                    {loading
                      ? t.buttons.generating
                      : t.configuracion.saveConfig}
                  </button>
                </div>
              </div>
            )}

            {/* Info Section */}
            {activeTab === "configuracion" && (
              <div className="p-6 mt-6 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
                <h3 className="flex items-center gap-2 mb-3 font-semibold text-blue-700 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                  {t.configuracion.info.title}
                </h3>
                <ul className="space-y-2 text-blue-600 dark:text-blue-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-700 dark:text-blue-400">•</span>
                    <span>{t.configuracion.info.libroVentas}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-700 dark:text-blue-400">•</span>
                    <span>{t.configuracion.info.libroIVA}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-700 dark:text-blue-400">•</span>
                    <span>{t.configuracion.info.resumen}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-700 dark:text-blue-400">•</span>
                    <span>{t.configuracion.info.calculation}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-700 dark:text-blue-400">•</span>
                    <span>{t.configuracion.info.export}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
