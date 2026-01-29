"use client";

import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

const AUTH_COPY = {
  es: {
    supervisorTitle: "Autorización de Supervisor",
    adminTitle: "Autorización de Administrador",
    subtitle: "Ingresa la contraseña para continuar",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Contraseña del supervisor/administrador",
    cancel: "Cancelar",
    confirm: "Autorizar",
    processing: "Validando...",
  },
  en: {
    supervisorTitle: "Supervisor Authorization",
    adminTitle: "Administrator Authorization",
    subtitle: "Enter the password to continue",
    passwordLabel: "Password",
    passwordPlaceholder: "Supervisor/admin password",
    cancel: "Cancel",
    confirm: "Authorize",
    processing: "Validating...",
  },
  pt: {
    supervisorTitle: "Autorização do Supervisor",
    adminTitle: "Autorização do Administrador",
    subtitle: "Digite a senha para continuar",
    passwordLabel: "Senha",
    passwordPlaceholder: "Senha do supervisor/admin",
    cancel: "Cancelar",
    confirm: "Autorizar",
    processing: "Validando...",
  },
};

interface AuthorizationModalProps {
  isOpen: boolean;
  requiredRole: "supervisor" | "admin";
  onClose: () => void;
  onConfirm: (password: string) => Promise<boolean>;
}

export default function AuthorizationModal({
  isOpen,
  requiredRole,
  onClose,
  onConfirm,
}: AuthorizationModalProps) {
  const { currentLanguage } = useLanguage();
  const copy =
    AUTH_COPY[currentLanguage as keyof typeof AUTH_COPY] || AUTH_COPY.en;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const title =
    requiredRole === "admin" ? copy.adminTitle : copy.supervisorTitle;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    try {
      const ok = await onConfirm(password.trim());
      if (ok) {
        setPassword("");
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {copy.subtitle}
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-900 dark:text-gray-200">
              {copy.passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={copy.passwordPlaceholder}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
            >
              {copy.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {copy.processing}
                </>
              ) : (
                copy.confirm
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
