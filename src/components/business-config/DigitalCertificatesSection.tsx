"use client";

import { useState } from "react";
import { Shield, CheckCircle } from "lucide-react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import DigitalCertificatesModal from "./DigitalCertificatesModal";

const DIGITAL_CERTIFICATES_COPY = {
  es: {
    title: "Certificados Digitales",
    subtitle: "Para facturación electrónica (AFIP, SII, SUNAT)",
    uploadButton: "Gestionar Certificados",
    uploadHint: "Carga tus archivos .crt y .key de forma segura",
  },
  en: {
    title: "Digital Certificates",
    subtitle: "For electronic invoicing (AFIP, SII, SUNAT)",
    uploadButton: "Manage Certificates",
    uploadHint: "Load your .crt and .key files securely",
  },
  pt: {
    title: "Certificados Digitais",
    subtitle: "Para faturação eletrônica (AFIP, SII, SUNAT)",
    uploadButton: "Gerenciar Certificados",
    uploadHint: "Carregue seus arquivos .crt e .key com segurança",
  },
};

export default function DigitalCertificatesSection() {
  const { currentLanguage } = useGlobalLanguage();
  const copy =
    DIGITAL_CERTIFICATES_COPY[
      currentLanguage as keyof typeof DIGITAL_CERTIFICATES_COPY
    ] || DIGITAL_CERTIFICATES_COPY["es"];

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="overflow-hidden transition-colors bg-white border rounded-xl dark:bg-slate-900 border-green-300 dark:border-green-700/30 hover:border-green-400 dark:hover:border-green-600/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-300 dark:border-green-700/20">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-500" />
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                {copy.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {copy.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors bg-green-600 hover:bg-green-500 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {copy.uploadButton}
          </button>

          {/* Help Text */}
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {copy.uploadHint}
          </p>
        </div>
      </section>

      {/* Modal */}
      <DigitalCertificatesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
