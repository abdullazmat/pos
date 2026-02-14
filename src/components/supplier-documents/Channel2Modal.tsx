"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  Settings,
  X,
  KeyRound,
} from "lucide-react";
import { apiFetch } from "@/lib/utils/apiFetch";
import { toast } from "react-toastify";

/* ─── i18n ─── */
const COPY = {
  es: {
    activateTitle: "Activar Modo Interno",
    activateSubtitle: "Ingresa tu PIN personal para acceder al Canal 2",
    pinPlaceholder: "PIN (mín. 4 dígitos)",
    activate: "Activar",
    cancel: "Cancelar",
    setupTitle: "Configurar PIN Interno",
    setupSubtitle:
      "Necesitas un PIN para acceder al Canal 2. Configúralo ahora.",
    newPin: "Nuevo PIN (4-8 dígitos)",
    confirmPin: "Confirmar PIN",
    currentPassword: "Contraseña actual",
    savePin: "Guardar PIN",
    pinMismatch: "Los PIN no coinciden",
    pinTooShort: "El PIN debe tener entre 4 y 8 caracteres",
    passwordRequired: "La contraseña actual es obligatoria",
    pinSaved: "PIN configurado correctamente",
    pinError: "Error al guardar PIN",
    activateError: "PIN incorrecto o error de servidor",
    activated: "Modo Interno activado",
    sessionExpires: "La sesión expira en",
    minutes: "minutos",
    internalMode: "Modo Interno Activado",
    deactivate: "Desactivar",
    deactivated: "Modo Interno desactivado",
    timeoutWarning: "La sesión interna expirará pronto",
    expired: "La sesión interna ha expirado",
  },
  en: {
    activateTitle: "Activate Internal Mode",
    activateSubtitle: "Enter your personal PIN to access Channel 2",
    pinPlaceholder: "PIN (min. 4 digits)",
    activate: "Activate",
    cancel: "Cancel",
    setupTitle: "Set Up Internal PIN",
    setupSubtitle: "You need a PIN to access Channel 2. Set one up now.",
    newPin: "New PIN (4-8 digits)",
    confirmPin: "Confirm PIN",
    currentPassword: "Current password",
    savePin: "Save PIN",
    pinMismatch: "PINs do not match",
    pinTooShort: "PIN must be 4-8 characters",
    passwordRequired: "Current password is required",
    pinSaved: "PIN set successfully",
    pinError: "Error saving PIN",
    activateError: "Incorrect PIN or server error",
    activated: "Internal Mode activated",
    sessionExpires: "Session expires in",
    minutes: "minutes",
    internalMode: "Internal Mode Active",
    deactivate: "Deactivate",
    deactivated: "Internal Mode deactivated",
    timeoutWarning: "Internal session expiring soon",
    expired: "Internal session has expired",
  },
  pt: {
    activateTitle: "Ativar Modo Interno",
    activateSubtitle: "Digite seu PIN pessoal para acessar o Canal 2",
    pinPlaceholder: "PIN (mín. 4 dígitos)",
    activate: "Ativar",
    cancel: "Cancelar",
    setupTitle: "Configurar PIN Interno",
    setupSubtitle:
      "Você precisa de um PIN para acessar o Canal 2. Configure agora.",
    newPin: "Novo PIN (4-8 dígitos)",
    confirmPin: "Confirmar PIN",
    currentPassword: "Senha atual",
    savePin: "Salvar PIN",
    pinMismatch: "Os PINs não coincidem",
    pinTooShort: "O PIN deve ter entre 4 e 8 caracteres",
    passwordRequired: "A senha atual é obrigatória",
    pinSaved: "PIN configurado com sucesso",
    pinError: "Erro ao salvar PIN",
    activateError: "PIN incorreto ou erro do servidor",
    activated: "Modo Interno ativado",
    sessionExpires: "A sessão expira em",
    minutes: "minutos",
    internalMode: "Modo Interno Ativo",
    deactivate: "Desativar",
    deactivated: "Modo Interno desativado",
    timeoutWarning: "A sessão interna expirará em breve",
    expired: "A sessão interna expirou",
  },
} as const;

type Lang = keyof typeof COPY;

/* ─── Types ─── */
interface Channel2ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated: (expiresAt: string) => void;
  language?: string;
}

interface Channel2BarProps {
  expiresAt: string;
  onDeactivate: () => void;
  language?: string;
}

/* ────────────────────────────────────────
   Channel 2 Activation Modal
   ──────────────────────────────────────── */
export function Channel2Modal({
  isOpen,
  onClose,
  onActivated,
  language = "es",
}: Channel2ModalProps) {
  const copy = COPY[language as Lang] || COPY.es;
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Setup form
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const pinInputRef = useRef<HTMLInputElement>(null);

  // Check PIN status when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setPin("");
    setNewPin("");
    setConfirmPin("");
    setCurrentPassword("");
    setHasPin(null);

    const checkPin = async () => {
      try {
        const res = await apiFetch("/api/channel2-auth/pin");
        const data = await res.json();
        setHasPin(data.hasPin === true);
      } catch {
        setHasPin(false);
      }
    };
    checkPin();
  }, [isOpen]);

  // Auto-focus PIN input
  useEffect(() => {
    if (isOpen && hasPin && pinInputRef.current) {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [isOpen, hasPin]);

  const handleActivate = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/channel2-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(copy.activated);
      onActivated(data.expiresAt);
      onClose();
    } catch {
      toast.error(copy.activateError);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPin = async () => {
    if (newPin.length < 4 || newPin.length > 8) {
      toast.error(copy.pinTooShort);
      return;
    }
    if (newPin !== confirmPin) {
      toast.error(copy.pinMismatch);
      return;
    }
    if (!currentPassword) {
      toast.error(copy.passwordRequired);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/channel2-auth/pin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: newPin, currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(copy.pinSaved);
      setHasPin(true);
      setNewPin("");
      setConfirmPin("");
      setCurrentPassword("");
    } catch {
      toast.error(copy.pinError);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="vp-card w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[hsl(var(--vp-muted))] hover:text-[hsl(var(--vp-text))]"
        >
          <X size={18} />
        </button>

        {hasPin === null ? (
          /* Loading state */
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : hasPin ? (
          /* PIN Entry */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Lock className="text-amber-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--vp-text))]">
                  {copy.activateTitle}
                </h3>
                <p className="text-xs text-[hsl(var(--vp-muted))]">
                  {copy.activateSubtitle}
                </p>
              </div>
            </div>

            <div className="relative mb-4">
              <input
                ref={pinInputRef}
                type={showPin ? "text" : "password"}
                className="w-full text-sm pr-10"
                placeholder={copy.pinPlaceholder}
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                maxLength={8}
                inputMode="numeric"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--vp-muted))]"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 vp-button vp-button-primary bg-amber-600 hover:bg-amber-700"
                onClick={handleActivate}
                disabled={loading || pin.length < 4}
              >
                {loading ? "..." : copy.activate}
              </button>
              <button
                className="flex-1 vp-button vp-button-ghost"
                onClick={onClose}
              >
                {copy.cancel}
              </button>
            </div>
          </div>
        ) : (
          /* PIN Setup */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Settings className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--vp-text))]">
                  {copy.setupTitle}
                </h3>
                <p className="text-xs text-[hsl(var(--vp-muted))]">
                  {copy.setupSubtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                className="w-full text-sm"
                placeholder={copy.newPin}
                value={newPin}
                onChange={(e) =>
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                inputMode="numeric"
                maxLength={8}
              />
              <input
                type="password"
                className="w-full text-sm"
                placeholder={copy.confirmPin}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                inputMode="numeric"
                maxLength={8}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full text-sm pr-10"
                  placeholder={copy.currentPassword}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--vp-muted))]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 vp-button vp-button-primary"
                onClick={handleSetupPin}
                disabled={loading}
              >
                {loading ? "..." : copy.savePin}
              </button>
              <button
                className="flex-1 vp-button vp-button-ghost"
                onClick={onClose}
              >
                {copy.cancel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   Channel 2 Top Bar Indicator
   ──────────────────────────────────────── */
export function Channel2Bar({
  expiresAt,
  onDeactivate,
  language = "es",
}: Channel2BarProps) {
  const copy = COPY[language as Lang] || COPY.es;
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      const mins = Math.max(0, Math.ceil(diff / 60000));
      setRemainingMinutes(mins);

      if (diff <= 0) {
        toast.warning(copy.expired);
        onDeactivate();
      } else if (mins <= 2 && mins > 0) {
        // Warning at 2 minutes
      }
    };

    update();
    const interval = setInterval(update, 15000);
    return () => clearInterval(interval);
  }, [expiresAt, onDeactivate, copy.expired]);

  return (
    <div className="bg-amber-500 text-white px-4 py-1.5 flex items-center justify-between text-sm font-medium">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} />
        <span>{copy.internalMode}</span>
        <span className="text-amber-100 text-xs">
          ({copy.sessionExpires} {remainingMinutes} {copy.minutes})
        </span>
      </div>
      <button
        onClick={onDeactivate}
        className="text-xs bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded transition-colors"
      >
        {copy.deactivate}
      </button>
    </div>
  );
}
