"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Shield,
  Upload,
  AlertCircle,
  Info,
  X,
  FileText,
  Key,
  CheckCircle,
} from "lucide-react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { toast } from "react-toastify";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCertificateUploaded?: () => void;
}

interface CertificateStatus {
  digital: {
    status: string;
    fileName?: string;
    uploadedAt?: string;
    expiryDate?: string;
    isExpired?: boolean;
  };
  privateKey: {
    status: string;
    fileName?: string;
    uploadedAt?: string;
  };
}

const MODAL_COPY = {
  es: {
    title: "Certificados Digitales",
    subtitle: "Para Facturación Electrónica (AFIP, SII, SUNAT, etc.)",
    pendingWarning: "Certificados Pendientes",
    pendingDescription:
      "Necesitas cargar ambos archivos (certificado y clave privada) para habilitar la facturación electrónica.",
    whatAreFiles: "¿Qué son estos archivos?",
    certificateLabel: "Certificado (.crt):",
    certificateDesc:
      "Es tu identidad digital pública emitida por la autoridad fiscal.",
    privateKeyLabel: "Clave Privada (.key):",
    privateKeyDesc:
      "Es la clave secreta que firma las facturas electrónicamente.",
    importantNote:
      "⚠️ Importante: Estos archivos los obtiene de la autoridad fiscal (AFIP en Argentina, SII en Chile, SUNAT en Perú, etc.)",
    certificateTitle: "Certificado Digital",
    privateKeyTitle: "Clave Privada",
    noCertificateLoaded: "No hay certificado cargado",
    noPrivateKeyLoaded: "No hay clave privada cargada",
    uploadCertificate: "Subir Certificado (.crt/.pem)",
    uploadPrivateKey: "Subir Clave Privada (.key)",
    supportedFormatsCrt: "Formatos soportados: .crt, .cer, .pem (máx. 1MB)",
    supportedFormatsKey: "Formatos soportados: .key, .pem (máx. 1MB)",
    securityWarning:
      "🔒 Seguridad: Tu clave privada se almacena de forma segura y nunca se muestra ni transmite.",
    whereToGetTitle: "¿Dónde consigo estos archivos?",
    argentina: "🇦🇷 Argentina (AFIP)",
    argentinaDesc: "Administrador de Relaciones → Certificado Digital",
    chile: "🇨🇱 Chile (SII)",
    chileDesc: "Portal SII → Certificado de Firma Electrónica",
    peru: "🇵🇪 Perú (SUNAT)",
    peruDesc: "Clave SOL → Certificado Digital",
    dragDropCrt: "Arrastra el certificado aquí o haz clic",
    dragDropKey: "Arrastra la clave privada aquí o haz clic",
    uploading: "Subiendo...",
    uploadSuccess: "Certificado subido exitosamente",
    uploadError: "Error al subir el certificado",
    privateKeyUploadSuccess: "Clave privada subida exitosamente",
    privateKeyUploadError: "Error al subir la clave privada",
    invalidCertFile: "Por favor suelta un archivo .crt, .cer o .pem",
    invalidKeyFile: "Por favor suelta un archivo .key o .pem",
    uploadedAt: "Subido el:",
    expiryDate: "Vence el:",
    fileTooLarge: "El tamaño del archivo excede el límite de 1MB",
    authTokenMissing: "Token de autenticación no encontrado",
    readyTitle: "Certificados Listos",
    readyDescription:
      "Tanto el certificado digital como la clave privada han sido cargados exitosamente",
  },
  en: {
    title: "Digital Certificates",
    subtitle: "For Electronic Invoicing (AFIP, SII, SUNAT, etc.)",
    pendingWarning: "Pending Certificates",
    pendingDescription:
      "You need to upload both files (certificate and private key) to enable electronic invoicing.",
    whatAreFiles: "What are these files?",
    certificateLabel: "Certificate (.crt/.pem):",
    certificateDesc:
      "It is your public digital identity issued by the tax authority.",
    privateKeyLabel: "Private Key (.key):",
    privateKeyDesc: "It is the secret key that signs invoices electronically.",
    importantNote:
      "⚠️ Important: These files are obtained from the tax authority (AFIP in Argentina, SII in Chile, SUNAT in Peru, etc.)",
    certificateTitle: "Digital Certificate",
    privateKeyTitle: "Private Key",
    noCertificateLoaded: "No certificate loaded",
    noPrivateKeyLoaded: "No private key loaded",
    uploadCertificate: "Upload Certificate (.crt/.pem)",
    uploadPrivateKey: "Upload Private Key (.key)",
    supportedFormatsCrt: "Supported formats: .crt, .cer, .pem (max. 1MB)",
    supportedFormatsKey: "Supported formats: .key, .pem (max. 1MB)",
    securityWarning:
      "🔒 Security: Your private key is stored securely and never displayed or transmitted.",
    whereToGetTitle: "Where do I get these files?",
    argentina: "🇦🇷 Argentina (AFIP)",
    argentinaDesc: "Relationship Manager → Digital Certificate",
    chile: "🇨🇱 Chile (SII)",
    chileDesc: "SII Portal → Electronic Signature Certificate",
    peru: "🇵🇪 Peru (SUNAT)",
    peruDesc: "SOL Key → Digital Certificate",
    dragDropCrt: "Drag certificate here or click",
    dragDropKey: "Drag private key here or click",
    uploading: "Uploading...",
    uploadSuccess: "Certificate uploaded successfully",
    uploadError: "Error uploading certificate",
    privateKeyUploadSuccess: "Private key uploaded successfully",
    privateKeyUploadError: "Error uploading private key",
    invalidCertFile: "Please drop a .crt, .cer or .pem file",
    invalidKeyFile: "Please drop a .key or .pem file",
    uploadedAt: "Uploaded on:",
    expiryDate: "Expires on:",
    fileTooLarge: "File size exceeds 1MB limit",
    authTokenMissing: "Authentication token not found",
    readyTitle: "Certificates Ready",
    readyDescription:
      "Both digital certificate and private key have been uploaded successfully",
  },
  pt: {
    title: "Certificados Digitais",
    subtitle: "Para Faturação Eletrônica (AFIP, SII, SUNAT, etc.)",
    pendingWarning: "Certificados Pendentes",
    pendingDescription:
      "Você precisa carregar ambos os arquivos (certificado e chave privada) para ativar a faturação eletrônica.",
    whatAreFiles: "O que são esses arquivos?",
    certificateLabel: "Certificado (.crt/.pem):",
    certificateDesc:
      "É sua identidade digital pública emitida pela autoridade tributária.",
    privateKeyLabel: "Chave Privada (.key):",
    privateKeyDesc: "É a chave secreta que assina faturas eletronicamente.",
    importantNote:
      "⚠️ Importante: Estes arquivos são obtidos da autoridade tributária (AFIP na Argentina, SII no Chile, SUNAT no Peru, etc.)",
    certificateTitle: "Certificado Digital",
    privateKeyTitle: "Chave Privada",
    noCertificateLoaded: "Nenhum certificado carregado",
    noPrivateKeyLoaded: "Nenhuma chave privada carregada",
    uploadCertificate: "Carregar Certificado (.crt/.pem)",
    uploadPrivateKey: "Carregar Chave Privada (.key)",
    supportedFormatsCrt: "Formatos suportados: .crt, .cer, .pem (máx. 1MB)",
    supportedFormatsKey: "Formatos suportados: .key, .pem (máx. 1MB)",
    securityWarning:
      "🔒 Segurança: Sua chave privada é armazenada com segurança e nunca é exibida ou transmitida.",
    whereToGetTitle: "Onde consigo esses arquivos?",
    argentina: "🇦🇷 Argentina (AFIP)",
    argentinaDesc: "Administrador de Relações → Certificado Digital",
    chile: "🇨🇱 Chile (SII)",
    chileDesc: "Portal SII → Certificado de Firma Electrónica",
    peru: "🇵🇪 Peru (SUNAT)",
    peruDesc: "Clave SOL → Certificado Digital",
    dragDropCrt: "Arraste o certificado aqui ou clique",
    dragDropKey: "Arraste a chave privada aqui ou clique",
    uploading: "Carregando...",
    uploadSuccess: "Certificado carregado com sucesso",
    uploadError: "Erro ao carregar certificado",
    privateKeyUploadSuccess: "Chave privada carregada com sucesso",
    privateKeyUploadError: "Erro ao carregar chave privada",
    invalidCertFile: "Por favor, solte um arquivo .crt, .cer ou .pem",
    invalidKeyFile: "Por favor, solte um arquivo .key ou .pem",
    uploadedAt: "Carregado em:",
    expiryDate: "Vence em:",
    fileTooLarge: "O tamanho do arquivo excede o limite de 1MB",
    authTokenMissing: "Token de autenticação não encontrado",
    readyTitle: "Certificados Prontos",
    readyDescription:
      "Tanto o certificado digital quanto a chave privada foram carregados com sucesso",
  },
};

export default function DigitalCertificatesModal({
  isOpen,
  onClose,
  onCertificateUploaded,
}: ModalProps) {
  const { currentLanguage } = useGlobalLanguage();
  const copy =
    MODAL_COPY[currentLanguage as keyof typeof MODAL_COPY] || MODAL_COPY.es;

  const [selectedCertificate, setSelectedCertificate] = useState<File | null>(
    null,
  );
  const [selectedPrivateKey, setSelectedPrivateKey] = useState<File | null>(
    null,
  );
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(false);
  const [certificateStatus, setCertificateStatus] =
    useState<CertificateStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCertificateStatus();
    }
  }, [isOpen]);

  const fetchCertificateStatus = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/fiscal-config/certificates/status", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[Certificate Status Response]", data);
        if (data.success && data.data) {
          console.log("[Setting Certificate Status]", data.data);
          setCertificateStatus(data.data);
        } else if (data.data) {
          // Fallback for response without success flag
          console.log("[Setting Certificate Status - Fallback]", data.data);
          setCertificateStatus(data.data);
        } else {
          console.warn("[Certificate Status] No data in response:", data);
        }
      } else {
        console.error("Failed to fetch certificate status", response.status);
      }
    } catch (error) {
      console.error("Error fetching certificate status:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropCertificate = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.name.endsWith(".crt") ||
        file.name.endsWith(".cer") ||
        file.name.endsWith(".pem"))
    ) {
      setSelectedCertificate(file);
    } else {
      toast.error(copy.invalidCertFile);
    }
  };

  const handleDropPrivateKey = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".key") || file.name.endsWith(".pem"))) {
      setSelectedPrivateKey(file);
    } else {
      toast.error(copy.invalidKeyFile);
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCertificate(file);
    }
  };

  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPrivateKey(file);
    }
  };

  const handleUploadCertificate = async () => {
    if (!selectedCertificate) {
      toast.error(copy.invalidCertFile);
      return;
    }

    if (selectedCertificate.size > 1024 * 1024) {
      toast.error(copy.fileTooLarge);
      return;
    }

    setUploadingCert(true);
    try {
      const formData = new FormData();
      formData.append("certificateDigital", selectedCertificate);
      formData.append("certificateType", "certificateDigital");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error(copy.authTokenMissing);
        return;
      }

      const response = await fetch("/api/fiscal-config/certificates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const uploadResponse = await response.json();
        console.log("[Certificate Upload Success]", uploadResponse);
        toast.success(copy.uploadSuccess);
        setSelectedCertificate(null);
        console.log("[Fetching updated certificate status...]");
        await fetchCertificateStatus();
        onCertificateUploaded?.();
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || errorData.error || copy.uploadError;
        toast.error(errorMessage);
        console.error("Certificate upload error:", errorData);
      }
    } catch (error: any) {
      console.error("Error uploading certificate:", error);
      toast.error(error.message || copy.uploadError);
    } finally {
      setUploadingCert(false);
    }
  };

  const handleUploadPrivateKey = async () => {
    if (!selectedPrivateKey) {
      toast.error(copy.invalidKeyFile);
      return;
    }

    if (selectedPrivateKey.size > 1024 * 1024) {
      toast.error(copy.fileTooLarge);
      return;
    }

    setUploadingKey(true);
    try {
      const formData = new FormData();
      formData.append("privateKey", selectedPrivateKey);
      formData.append("certificateType", "privateKey");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error(copy.authTokenMissing);
        return;
      }

      const response = await fetch("/api/fiscal-config/certificates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const uploadResponse = await response.json();
        console.log("[Private Key Upload Success]", uploadResponse);
        toast.success(copy.privateKeyUploadSuccess);
        setSelectedPrivateKey(null);
        console.log("[Fetching updated certificate status...]");
        await fetchCertificateStatus();
        onCertificateUploaded?.();
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || errorData.error || copy.privateKeyUploadError;
        toast.error(errorMessage);
        console.error("Private key upload error:", errorData);
      }
    } catch (error: any) {
      console.error("Error uploading private key:", error);
      toast.error(error.message || copy.privateKeyUploadError);
    } finally {
      setUploadingKey(false);
    }
  };

  const certUploaded = !!(
    certificateStatus?.digital?.status === "VALID" ||
    certificateStatus?.digital?.fileName
  );
  const keyUploaded = !!(
    certificateStatus?.privateKey?.status === "VALID" ||
    certificateStatus?.privateKey?.fileName
  );
  const bothUploaded = certUploaded && keyUploaded;

  // Debug: Log only when state changes
  useEffect(() => {
    if (isOpen) {
      console.log("[Certificate Status State Changed]", {
        certificateStatus,
        certUploaded,
        keyUploaded,
        bothUploaded,
      });
    }
  }, [isOpen, certificateStatus, certUploaded, keyUploaded, bothUploaded]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl overflow-hidden bg-white border rounded-lg shadow-2xl dark:bg-slate-950 border-slate-300 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 bg-green-700">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-lg font-bold text-white">{copy.title}</h2>
              <p className="text-xs text-green-100">{copy.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 transition-colors rounded-lg hover:bg-green-600"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {bothUploaded && (
            <div className="p-4 border-l-4 border-green-500 rounded-lg bg-green-50 dark:bg-green-900/30">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-700 dark:text-green-300">
                    {copy.readyTitle}
                  </h3>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-200">
                    {copy.readyDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!bothUploaded && (
            <div className="p-4 border-l-4 border-orange-500 rounded-lg bg-orange-50 dark:bg-orange-900/30">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-700 dark:text-orange-300">
                    {copy.pendingWarning}
                  </h3>
                  <p className="mt-1 text-xs text-orange-600 dark:text-orange-200">
                    {copy.pendingDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border-l-4 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="mb-3 font-semibold text-blue-700 dark:text-blue-300">
                  {copy.whatAreFiles}
                </h3>
                <ul className="space-y-2 text-xs text-blue-600 dark:text-blue-200">
                  <li className="flex gap-2">
                    <span className="font-semibold text-blue-700 dark:text-blue-300 min-w-fit">
                      {copy.certificateLabel}
                    </span>
                    <span>{copy.certificateDesc}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-blue-700 dark:text-blue-300 min-w-fit">
                      {copy.privateKeyLabel}
                    </span>
                    <span>{copy.privateKeyDesc}</span>
                  </li>
                  <li className="pt-2 text-blue-700 dark:text-blue-300">
                    {copy.importantNote}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-200">
                  {copy.certificateTitle}
                </h3>
                {certUploaded && (
                  <CheckCircle className="w-4 h-4 ml-auto text-green-600" />
                )}
              </div>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDropCertificate}
                className="p-6 mb-4 text-center transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-100 dark:bg-slate-800/30"
              >
                <input
                  type="file"
                  id="cert-upload"
                  accept=".crt,.cer,.pem"
                  onChange={handleCertificateChange}
                  className="hidden"
                />
                <label htmlFor="cert-upload" className="cursor-pointer">
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {copy.dragDropCrt}
                  </p>
                </label>
              </div>

              {selectedCertificate ? (
                <div className="p-2 mb-3 text-xs text-green-200 border rounded bg-green-900/30 border-green-700/50">
                  ✓ {selectedCertificate.name}
                </div>
              ) : certUploaded && certificateStatus?.digital?.fileName ? (
                <div className="p-2 mb-3 text-xs text-green-200 border rounded bg-green-900/30 border-green-700/50">
                  ✓ {certificateStatus.digital.fileName}
                </div>
              ) : (
                <div className="p-3 mb-3 text-xs text-center rounded text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800">
                  {copy.noCertificateLoaded}
                </div>
              )}

              {certUploaded && certificateStatus?.digital?.uploadedAt && (
                <div className="p-2 mb-3 text-xs border rounded text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/50">
                  {copy.uploadedAt}{" "}
                  {new Date(
                    certificateStatus.digital.uploadedAt,
                  ).toLocaleDateString()}
                </div>
              )}

              <button
                onClick={handleUploadCertificate}
                disabled={!selectedCertificate || uploadingCert}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {uploadingCert ? copy.uploading : copy.uploadCertificate}
              </button>

              <p className="mt-2 text-xs text-center text-slate-500">
                {copy.supportedFormatsCrt}
              </p>
            </div>

            <div className="p-4 border rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-200">
                  {copy.privateKeyTitle}
                </h3>
                {keyUploaded && (
                  <CheckCircle className="w-4 h-4 ml-auto text-green-600" />
                )}
              </div>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDropPrivateKey}
                className="p-6 mb-4 text-center transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-100 dark:bg-slate-800/30"
              >
                <input
                  type="file"
                  id="key-upload"
                  accept=".key,.pem"
                  onChange={handlePrivateKeyChange}
                  className="hidden"
                />
                <label htmlFor="key-upload" className="cursor-pointer">
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {copy.dragDropKey}
                  </p>
                </label>
              </div>

              {selectedPrivateKey ? (
                <div className="p-2 mb-3 text-xs text-green-200 border rounded bg-green-900/30 border-green-700/50">
                  ✓ {selectedPrivateKey.name}
                </div>
              ) : keyUploaded && certificateStatus?.privateKey?.fileName ? (
                <div className="p-2 mb-3 text-xs text-green-200 border rounded bg-green-900/30 border-green-700/50">
                  ✓ {certificateStatus.privateKey.fileName}
                </div>
              ) : (
                <div className="p-3 mb-3 text-xs text-center rounded text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800">
                  {copy.noPrivateKeyLoaded}
                </div>
              )}

              {keyUploaded && certificateStatus?.privateKey?.uploadedAt && (
                <div className="p-2 mb-3 text-xs border rounded text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/50">
                  {copy.uploadedAt}{" "}
                  {new Date(
                    certificateStatus.privateKey.uploadedAt,
                  ).toLocaleDateString()}
                </div>
              )}

              <button
                onClick={handleUploadPrivateKey}
                disabled={!selectedPrivateKey || uploadingKey}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 font-semibold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {uploadingKey ? copy.uploading : copy.uploadPrivateKey}
              </button>

              <p className="mt-2 text-xs text-center text-slate-500">
                {copy.supportedFormatsKey}
              </p>
            </div>
          </div>

          <div className="p-3 border border-red-300 rounded-lg dark:border-red-700/50 bg-red-50 dark:bg-red-900/20">
            <p className="text-xs text-red-700 dark:text-red-300">
              {copy.securityWarning}
            </p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 mb-3 font-semibold text-slate-900 dark:text-slate-200">
              <Info className="w-4 h-4" />
              {copy.whereToGetTitle}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50">
                <p className="mb-1 font-semibold text-slate-900 dark:text-slate-200">
                  {copy.argentina}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {copy.argentinaDesc}
                </p>
              </div>
              <div className="p-3 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50">
                <p className="mb-1 font-semibold text-slate-900 dark:text-slate-200">
                  {copy.chile}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {copy.chileDesc}
                </p>
              </div>
              <div className="p-3 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50">
                <p className="mb-1 font-semibold text-slate-900 dark:text-slate-200">
                  {copy.peru}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {copy.peruDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
