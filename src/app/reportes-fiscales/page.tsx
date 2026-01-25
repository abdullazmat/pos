"use client";

import React, { useState, useEffect } from "react";
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
  invoiceCount: number;
  totalSales: number;
  totalTaxableAmount: number;
  totalTaxAmount: number;
  taxBreakdown: Array<{
    rate: number;
    baseAmount: number;
    taxAmount: number;
  }>;
}

interface LibroVentasRow {
  date: string;
  invoiceType: string;
  invoiceNumber: number;
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
      success: "Reporte exportado exitosamente",
      error: "Error al exportar reporte",
    },
    buttons: {
      generate: "Generar Reporte",
      generating: "Generando...",
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
      success: "Report exported successfully",
      error: "Error exporting report",
    },
    buttons: {
      generate: "Generate Report",
      generating: "Generating...",
    },
  },
};

export default function FiscalReportsPage() {
  const { currentLanguage } = useGlobalLanguage();
  const t =
    TRANSLATIONS[currentLanguage as keyof typeof TRANSLATIONS] ||
    TRANSLATIONS.es;
  const router = useRouter();

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

  // Fetch report data
  const generateReport = async (reportType: string) => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/fiscal-reports?reportType=${reportType}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const data = await response.json();

      if (reportType === "resumen") {
        setResumenData(data.data);
      } else if (reportType === "libro-ventas") {
        setLibroVentasData(data.data.data || []);
      } else if (reportType === "libro-iva") {
        setLibroIVAData(data.data.data || []);
      }

      toast.success(t.export.success);
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error(error.message || t.export.error);
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
      generateReport(reportTypeMap[activeTab]);
    }
  }, [activeTab, dateRange]);

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

      const response = await fetch("/api/fiscal-reports/export", {
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

      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_${dateRange.startDate}_${dateRange.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(t.export.success);
    } catch (error: any) {
      console.error("Error exporting:", error);
      toast.error(t.export.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t.title}</h1>
            <p className="text-gray-400">{t.subtitle}</p>
          </div>

          {/* Date Range Selector */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t.dateRangeSection}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.startDate}
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.endDate}
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  &nbsp;
                </label>
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
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition"
                >
                  {t.thisMonth}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6 border-b border-gray-800">
            {Object.entries(t.tabs).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-3 font-medium transition border-b-2 ${
                  activeTab === key
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">
                  {t.buttons.generating}
                </span>
              </div>
            )}

            {!loading && activeTab === "resumen" && resumenData && (
              <div>
                <h2 className="text-2xl font-bold mb-6">{t.resumen.title}</h2>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-800 p-4 rounded">
                    <p className="text-gray-400 text-sm">
                      {t.resumen.invoiceCount}
                    </p>
                    <p className="text-3xl font-bold text-blue-400">
                      {resumenData.invoiceCount}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded">
                    <p className="text-gray-400 text-sm">
                      {t.resumen.totalSales}
                    </p>
                    <p className="text-3xl font-bold text-green-400">
                      ${resumenData.totalSales.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded">
                    <p className="text-gray-400 text-sm">
                      {t.resumen.totalTaxable}
                    </p>
                    <p className="text-3xl font-bold text-yellow-400">
                      ${resumenData.totalTaxableAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded">
                    <p className="text-gray-400 text-sm">
                      {t.resumen.totalIVA}
                    </p>
                    <p className="text-3xl font-bold text-purple-400">
                      ${resumenData.totalTaxAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Tax Breakdown Table */}
                <h3 className="text-lg font-semibold mb-4">
                  {t.resumen.taxBreakdown}
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 text-gray-400">Alícuota</th>
                      <th className="text-right py-3 text-gray-400">
                        {t.libroIVA.columns.baseAmount}
                      </th>
                      <th className="text-right py-3 text-gray-400">
                        {t.libroIVA.columns.taxAmount}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenData.taxBreakdown.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-800 hover:bg-gray-800"
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{t.libroVentas.title}</h2>
                  <button
                    onClick={() => exportToCSV("LIBRO_VENTAS")}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition"
                  >
                    <Download className="w-4 h-4" />
                    {t.export.csv}
                  </button>
                </div>

                {libroVentasData.length === 0 ? (
                  <p className="text-gray-400">{t.libroVentas.noData}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 text-gray-400 text-sm">
                            {t.libroVentas.columns.date}
                          </th>
                          <th className="text-left py-3 text-gray-400 text-sm">
                            {t.libroVentas.columns.type}
                          </th>
                          <th className="text-left py-3 text-gray-400 text-sm">
                            {t.libroVentas.columns.number}
                          </th>
                          <th className="text-left py-3 text-gray-400 text-sm">
                            {t.libroVentas.columns.customer}
                          </th>
                          <th className="text-right py-3 text-gray-400 text-sm">
                            {t.libroVentas.columns.neto}
                          </th>
                          <th className="text-right py-3 text-gray-400 text-sm">
                            {t.libroVentas.columns.iva}
                          </th>
                          <th className="text-right py-3 text-gray-400 text-sm">
                            {t.libroVentas.columns.total}
                          </th>
                          <th className="text-left py-3 text-gray-400 text-sm">
                            {t.libroVentas.columns.cae}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {libroVentasData.map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-800 hover:bg-gray-800"
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
                            <td className="py-3 text-sm text-right font-semibold">
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
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{t.libroIVA.title}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {t.libroIVA.description}
                    </p>
                  </div>
                  <button
                    onClick={() => exportToCSV("LIBRO_IVA")}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition"
                  >
                    <Download className="w-4 h-4" />
                    {t.export.csv}
                  </button>
                </div>

                {libroIVAData.length === 0 ? (
                  <p className="text-gray-400">{t.libroIVA.noData}</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 text-gray-400">
                          {t.libroIVA.columns.aliquot}
                        </th>
                        <th className="text-right py-3 text-gray-400">
                          {t.libroIVA.columns.baseAmount}
                        </th>
                        <th className="text-right py-3 text-gray-400">
                          {t.libroIVA.columns.taxAmount}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {libroIVAData.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-800 hover:bg-gray-800"
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
                <h2 className="text-2xl font-bold mb-6">
                  Configuración Fiscal
                </h2>
                <button
                  onClick={() => router.push("/business-config")}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition"
                >
                  Ir a Configuración del Negocio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
