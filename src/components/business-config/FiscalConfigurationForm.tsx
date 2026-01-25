"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Upload, CheckCircle, AlertCircle, Loader } from "lucide-react";

interface FiscalConfig {
  country: string;
  fiscalRegime: string;
  cuit: string;
  defaultIvaRate: number;
  pointOfSale: number;
}

interface CertificateStatus {
  digital: {
    status: string;
    expiryDate?: string;
    fileName?: string;
    isExpired?: boolean;
  };
  privateKey: {
    status: string;
    fileName?: string;
  };
}

const FISCAL_REGIMES = [
  { value: "RESPONSABLE_INSCRIPTO", label: "Responsable Inscripto" },
  { value: "MONOTRIBUTO", label: "Monotributo" },
  { value: "EXENTO", label: "Exento" },
];

const COUNTRIES = [
  { value: "Argentina", label: "Argentina" },
  { value: "Chile", label: "Chile" },
  { value: "Perú", label: "Perú" },
];

const VAT_RATES = [0, 10.5, 21, 27];

export default function FiscalConfigurationForm() {
  const [config, setConfig] = useState<FiscalConfig>({
    country: "Argentina",
    fiscalRegime: "RESPONSABLE_INSCRIPTO",
    cuit: "",
    defaultIvaRate: 21,
    pointOfSale: 1,
  });

  const [certificateStatus, setCertificateStatus] =
    useState<CertificateStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [certLoading, setCertLoading] = useState(false);

  // Load fiscal configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/fiscal-config");
        const data = await response.json();
        if (data.data) {
          setConfig({
            country: data.data.country || "Argentina",
            fiscalRegime: data.data.fiscalRegime || "RESPONSABLE_INSCRIPTO",
            cuit: data.data.cuit || "",
            defaultIvaRate: data.data.defaultIvaRate || 21,
            pointOfSale: data.data.pointOfSale || 1,
          });
        }
      } catch (error) {
        console.error("Failed to load config:", error);
      }
    };

    const loadCertificateStatus = async () => {
      try {
        setCertLoading(true);
        const response = await fetch("/api/fiscal-config/certificates");
        const data = await response.json();
        if (data.data) {
          setCertificateStatus(data.data);
        }
      } catch (error) {
        console.error("Failed to load certificate status:", error);
      } finally {
        setCertLoading(false);
      }
    };

    loadConfig();
    loadCertificateStatus();
  }, []);

  // Save fiscal configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!config.cuit) {
      toast.error("CUIT is required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/fiscal-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save configuration");
      }

      toast.success("Configuración guardada exitosamente");
    } catch (error: any) {
      console.error("Error saving config:", error);
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  // Handle certificate upload
  const handleCertificateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "certificateDigital" | "privateKey",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append(type, file);
      formData.append("certificateType", type);

      const response = await fetch("/api/fiscal-config/certificates", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload certificate");
      }

      toast.success(
        type === "certificateDigital"
          ? "Certificado cargado exitosamente"
          : "Clave privada cargada exitosamente",
      );

      // Reload certificate status
      const statusResponse = await fetch("/api/fiscal-config/certificates");
      const statusData = await statusResponse.json();
      if (statusData.data) {
        setCertificateStatus(statusData.data);
      }
    } catch (error: any) {
      console.error("Error uploading certificate:", error);
      toast.error(error.message || "Error al cargar certificado");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Fiscal Configuration Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-6">Configuración Fiscal</h2>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              País
            </label>
            <select
              value={config.country}
              onChange={(e) =>
                setConfig({ ...config, country: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
            >
              {COUNTRIES.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fiscal Regime */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Régimen Fiscal
            </label>
            <select
              value={config.fiscalRegime}
              onChange={(e) =>
                setConfig({ ...config, fiscalRegime: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
            >
              {FISCAL_REGIMES.map((regime) => (
                <option key={regime.value} value={regime.value}>
                  {regime.label}
                </option>
              ))}
            </select>
          </div>

          {/* CUIT */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CUIT / CUIL / CDI <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={config.cuit}
              onChange={(e) => setConfig({ ...config, cuit: e.target.value })}
              placeholder="Ej: 20-12345678-9"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Campo obligatorio para facturación electrónica
            </p>
          </div>

          {/* VAT Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tasa de IVA por Defecto (%)
            </label>
            <select
              value={config.defaultIvaRate}
              onChange={(e) =>
                setConfig({
                  ...config,
                  defaultIvaRate: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
            >
              {VAT_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
          </div>

          {/* Point of Sale */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Punto de Venta
            </label>
            <input
              type="number"
              value={config.pointOfSale}
              onChange={(e) =>
                setConfig({ ...config, pointOfSale: parseInt(e.target.value) })
              }
              min="1"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? "Guardando..." : "Guardar Configuración"}
          </button>
        </form>
      </div>

      {/* Digital Certificates Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold">Certificados Digitales</h2>
          <span className="text-xs bg-yellow-900 text-yellow-200 px-2 py-1 rounded">
            AFIP / SII / SUNAT
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Para la facturación electrónica (WSFEv1), necesitas cargar tu
          certificado digital y clave privada. Estos se almacenan de forma
          segura y encriptada.
        </p>

        {certLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Certificate Digital */}
            <div className="bg-gray-800 rounded p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  Certificado Digital (.crt / .cer)
                </h3>
                {certificateStatus?.digital.status === "VALID" && (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Válido
                  </div>
                )}
                {certificateStatus?.digital.status === "EXPIRED" && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Expirado
                  </div>
                )}
              </div>

              {certificateStatus?.digital.fileName && (
                <p className="text-sm text-gray-400 mb-2">
                  Archivo: {certificateStatus.digital.fileName}
                </p>
              )}

              {certificateStatus?.digital.expiryDate && (
                <p className="text-sm text-gray-400 mb-2">
                  Vencimiento:{" "}
                  {new Date(
                    certificateStatus.digital.expiryDate,
                  ).toLocaleDateString("es-AR")}
                </p>
              )}

              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer font-medium transition disabled:bg-gray-600">
                <Upload className="w-4 h-4" />
                {uploading ? "Cargando..." : "Cargar Certificado"}
                <input
                  type="file"
                  accept=".crt,.cer"
                  onChange={(e) =>
                    handleCertificateUpload(e, "certificateDigital")
                  }
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Private Key */}
            <div className="bg-gray-800 rounded p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Clave Privada (.key / .pem)</h3>
                {certificateStatus?.privateKey.status === "VALID" && (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Válida
                  </div>
                )}
              </div>

              {certificateStatus?.privateKey.fileName && (
                <p className="text-sm text-gray-400 mb-2">
                  Archivo: {certificateStatus.privateKey.fileName}
                </p>
              )}

              <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded p-3 mb-4 text-sm text-red-300">
                ⚠️ Seguridad: Tu clave privada se almacena encriptada. Nunca se
                expone ni transmite sin cifrar.
              </div>

              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer font-medium transition disabled:bg-gray-600">
                <Upload className="w-4 h-4" />
                {uploading ? "Cargando..." : "Cargar Clave Privada"}
                <input
                  type="file"
                  accept=".key,.pem"
                  onChange={(e) => handleCertificateUpload(e, "privateKey")}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Status Summary */}
            {certificateStatus?.digital.status === "VALID" &&
              certificateStatus?.privateKey.status === "VALID" && (
                <div className="bg-green-900 bg-opacity-20 border border-green-800 rounded p-4 flex items-center gap-3 text-green-300">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>
                    ✓ Certificados completamente configurados. Puedes emitir
                    facturas electrónicas.
                  </span>
                </div>
              )}

            {(certificateStatus?.digital.status === "PENDING" ||
              certificateStatus?.privateKey.status === "PENDING") && (
              <div className="bg-yellow-900 bg-opacity-20 border border-yellow-800 rounded p-4 flex items-center gap-3 text-yellow-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>
                  ⚠️ Certificados pendientes. Por favor carga ambos archivos
                  para habilitar facturación electrónica.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-300 mb-3">
          ¿Cómo obtener tus certificados?
        </h3>
        <ul className="text-sm text-blue-200 space-y-2">
          <li>
            <strong>Argentina (AFIP):</strong> Administrador de Relaciones →
            Certificado Digital
          </li>
          <li>
            <strong>Chile (SII):</strong> Portal SII → Certificado de Firma
            Electrónica
          </li>
          <li>
            <strong>Perú (SUNAT):</strong> Portal SUNAT → Certificado Digital /
            Clave SOL
          </li>
        </ul>
      </div>
    </div>
  );
}
