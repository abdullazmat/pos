"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import OpenRegisterModal from "@/components/cash-register/OpenRegisterModal";
import OpenTicketModal from "@/components/cash-register/OpenTicketModal";
import Toast from "@/components/common/Toast";
import Loading from "@/components/common/Loading";
import { isTokenExpiredSoon } from "@/lib/utils/token";
import { useBusinessDateTime } from "@/lib/hooks/useBusinessDateTime";

import WithdrawalModal from "@/components/cash-register/WithdrawalModal";
import WithdrawalTicket from "@/components/cash-register/WithdrawalTicket";
import CreditNoteModal from "@/components/cash-register/CreditNoteModal";
import CreditNoteTicket from "@/components/cash-register/CreditNoteTicket";
import AuthorizationModal from "@/components/cash-register/AuthorizationModal";
import CloseBoxModal from "@/components/cash-register/CloseBoxModal";
import CloseTicketModal, {
  CloseTicketData,
} from "@/components/cash-register/CloseTicketModal";

const CASH_COPY = {
  es: {
    loading: "Cargando Control de Caja...",
    businessFallback: "Mi Negocio",
    sessionFallback: "Sesión Actual",
    receiptPrint: "Imprimir",
    receiptClose: "Cerrar comprobante",
    toastAlreadyOpen: "Caja ya estaba abierta, sincronizando estado...",
    sessionExpired: "Sesión expirada. Por favor inicia sesión nuevamente.",
    openSuccess: "¡Caja abierta exitosamente!",
    openError: "No se pudo abrir la caja",
    closeSuccess: "¡Caja cerrada exitosamente!",
    closeError: "No se pudo cerrar la caja",
    authorizationSuccess: "Contraseña correcta.",
    cashInSuccess: (amount: string) => `Ingreso de ${amount} registrado.`,
    cashInError: "No se pudo registrar el ingreso",
    withdrawSuccess: (amount: string) => `¡Retiro de ${amount} registrado!`,
    withdrawError: "No se pudo registrar el retiro",
    creditSuccess: (amount: string) =>
      `¡Nota de crédito de ${amount} registrada!`,
    creditError: "No se pudo registrar la nota de crédito",
    errors: {
      invalidAmount: "Ingresa un monto válido.",
      approvalPasswordRequired: "Se requiere contraseña de autorización.",
      invalidApprovalPassword: "Contraseña incorrecta.",
      noOpenSession: "No hay una caja abierta.",
      invalidAction: "Acción inválida.",
      cashierActionNotAllowed:
        "Los cajeros solo pueden abrir o cerrar la caja.",
      unauthorized: "No autorizado.",
      generic: "Ocurrió un error. Intenta nuevamente.",
    },
    noOpenTitle: "No hay caja abierta",
    noOpenSubtitle:
      'Debes abrir una caja desde la sección "Control de Caja" para comenzar a vender',
    openButton: "Abrir Caja",
    stats: {
      initial: "Monto Inicial",
      sales: "Ventas",
      withdrawals: "Retiros",
      expected: "Esperado en Caja",
    },
    actions: {
      withdrawal: "Registrar Retiro",
      creditNote: "Nota de Crédito / Devolución",
      cashIn: "Ingresar Dinero",
      close: "Cerrar Caja",
    },
    movements: {
      title: "Movimientos de la Sesión",
      updating: "Actualizando...",
      datetime: "Fecha/Hora",
      type: "Tipo",
      description: "Descripción",
      amount: "Monto",
      operator: "Operador",
      noOperator: "Sin operador",
      noReason: "Sin motivo especificado",
      empty: "No hay movimientos registrados en esta sesión",
      types: {
        apertura: "Apertura",
        venta: "Venta",
        retiro: "Retiro",
        cierre: "Cierre",
        nota_credito: "Nota de crédito",
        ingreso: "Ingreso",
      },
    },
    sessions: {
      title: "Historial de Sesiones",
      openDate: "Fecha Apertura",
      initial: "Monto Inicial",
      sales: "Ventas",
      withdrawals: "Retiros",
      expected: "Esperado",
      real: "Real",
      diff: "Diferencia",
      status: "Estado",
      empty: "No hay historial de sesiones",
      statuses: {
        open: "Abierta",
        closed: "Cerrada",
      },
    },
  },
  en: {
    loading: "Loading Cash Register...",
    businessFallback: "My Business",
    sessionFallback: "Current Session",
    receiptPrint: "Print",
    receiptClose: "Close receipt",
    toastAlreadyOpen: "Register was already open, syncing state...",
    sessionExpired: "Session expired. Please sign in again.",
    openSuccess: "Cash register opened successfully!",
    openError: "Could not open the register",
    closeSuccess: "Cash register closed successfully!",
    closeError: "Could not close the register",
    authorizationSuccess: "Password confirmed.",
    cashInSuccess: (amount: string) => `Cash in of ${amount} recorded!`,
    cashInError: "Unable to record cash in",
    withdrawSuccess: (amount: string) => `Withdrawal of ${amount} recorded!`,
    withdrawError: "Unable to record withdrawal",
    creditSuccess: (amount: string) => `Credit note of ${amount} recorded!`,
    creditError: "Unable to record credit note",
    errors: {
      invalidAmount: "Enter a valid amount.",
      approvalPasswordRequired: "Authorization password is required.",
      invalidApprovalPassword: "Incorrect password.",
      noOpenSession: "No cash register is open.",
      invalidAction: "Invalid action.",
      cashierActionNotAllowed: "Cashiers can only open or close the register.",
      unauthorized: "Unauthorized.",
      generic: "Something went wrong. Please try again.",
    },
    noOpenTitle: "No register open",
    noOpenSubtitle:
      'Open a register from the "Cash Register" section to start selling',
    openButton: "Open Register",
    stats: {
      initial: "Opening Cash",
      sales: "Sales",
      withdrawals: "Withdrawals",
      expected: "Expected in Cash",
    },
    actions: {
      withdrawal: "Log Withdrawal",
      creditNote: "Credit Note / Refund",
      cashIn: "Cash In",
      close: "Close Register",
    },
    movements: {
      title: "Session Movements",
      updating: "Updating...",
      datetime: "Date/Time",
      type: "Type",
      description: "Description",
      amount: "Amount",
      operator: "Operator",
      noOperator: "No operator info",
      noReason: "No reason specified",
      empty: "No movements recorded in this session",
      types: {
        apertura: "Opening",
        venta: "Sale",
        retiro: "Withdrawal",
        cierre: "Close",
        nota_credito: "Credit note",
        ingreso: "Cash In",
      },
    },
    sessions: {
      title: "Session History",
      openDate: "Open Date",
      initial: "Opening Cash",
      sales: "Sales",
      withdrawals: "Withdrawals",
      expected: "Expected",
      real: "Actual",
      diff: "Difference",
      status: "Status",
      empty: "No session history",
      statuses: {
        open: "Open",
        closed: "Closed",
      },
    },
  },
  pt: {
    loading: "Carregando Controle de Caixa...",
    businessFallback: "Meu Negócio",
    sessionFallback: "Sessão Atual",
    receiptPrint: "Imprimir",
    receiptClose: "Fechar comprovante",
    toastAlreadyOpen: "Caixa já estava aberta, sincronizando estado...",
    sessionExpired: "Sessão expirada. Faça login novamente.",
    openSuccess: "Caixa aberta com sucesso!",
    openError: "Não foi possível abrir a caixa",
    closeSuccess: "Caixa fechada com sucesso!",
    closeError: "Não foi possível fechar a caixa",
    authorizationSuccess: "Senha correta.",
    cashInSuccess: (amount: string) => `Entrada de ${amount} registrada!`,
    cashInError: "Não foi possível registrar a entrada",
    withdrawSuccess: (amount: string) => `Retirada de ${amount} registrada!`,
    withdrawError: "Não foi possível registrar a retirada",
    creditSuccess: (amount: string) =>
      `Nota de crédito de ${amount} registrada!`,
    creditError: "Não foi possível registrar a nota de crédito",
    errors: {
      invalidAmount: "Digite um valor válido.",
      approvalPasswordRequired: "A senha de autorização é necessária.",
      invalidApprovalPassword: "Senha incorreta.",
      noOpenSession: "Não há caixa aberta.",
      invalidAction: "Ação inválida.",
      cashierActionNotAllowed: "Caixas só podem abrir ou fechar o caixa.",
      unauthorized: "Não autorizado.",
      generic: "Ocorreu um erro. Tente novamente.",
    },
    noOpenTitle: "Nenhuma caixa aberta",
    noOpenSubtitle:
      'Abra uma caixa em "Controle de Caixa" para começar a vender',
    openButton: "Abrir Caixa",
    stats: {
      initial: "Valor Inicial",
      sales: "Vendas",
      withdrawals: "Retiradas",
      expected: "Esperado em Caixa",
    },
    actions: {
      withdrawal: "Registrar Retirada",
      creditNote: "Nota de Crédito / Devolução",
      cashIn: "Entrada de Dinheiro",
      close: "Fechar Caixa",
    },
    movements: {
      title: "Movimentos da Sessão",
      updating: "Atualizando...",
      datetime: "Data/Hora",
      type: "Tipo",
      description: "Descrição",
      amount: "Valor",
      operator: "Operador",
      noOperator: "Sem operador",
      noReason: "Sem motivo especificado",
      empty: "Nenhum movimento registrado nesta sessão",
      types: {
        apertura: "Abertura",
        venta: "Venda",
        retiro: "Retirada",
        cierre: "Fechamento",
        nota_credito: "Nota de crédito",
        ingreso: "Entrada",
      },
    },
    sessions: {
      title: "Histórico de Sessões",
      openDate: "Data de Abertura",
      initial: "Valor Inicial",
      sales: "Vendas",
      withdrawals: "Retiradas",
      expected: "Esperado",
      real: "Real",
      diff: "Diferença",
      status: "Status",
      empty: "Nenhum histórico de sessões",
      statuses: {
        open: "Aberta",
        closed: "Fechada",
      },
    },
  },
};

const CURRENCY_LOCALE = {
  es: "es-AR",
  en: "en-US",
  pt: "pt-BR",
} as const;

// Withdrawal reasons in all supported languages, kept in the same order to allow cross-language mapping
const WITHDRAWAL_REASONS = {
  es: [
    "Pago a proveedores",
    "Gastos operacionales",
    "Depósito bancario",
    "Otro",
  ],
  en: ["Supplier payment", "Operational expenses", "Bank deposit", "Other"],
  pt: [
    "Pagamento a fornecedores",
    "Despesas operacionais",
    "Depósito bancário",
    "Outro",
  ],
} as const;

export default function CashRegisterPage() {
  // Withdrawal ticket state
  const [showWithdrawalTicket, setShowWithdrawalTicket] = useState(false);
  const [withdrawalTicketData, setWithdrawalTicketData] = useState<{
    amount: number;
    reason: string;
    cashierName?: string;
    supervisorName?: string;
  } | null>(null);
  const [showCreditNoteTicket, setShowCreditNoteTicket] = useState(false);
  const [creditNoteTicketData, setCreditNoteTicketData] = useState<{
    amount: number;
    reason: string;
    notes?: string;
    createdAt?: string;
    cashierName?: string;
    adminName?: string;
  } | null>(null);
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const copy = (CASH_COPY[currentLanguage] ||
    CASH_COPY.en) as typeof CASH_COPY.en;
  const { formatDateTime } = useBusinessDateTime();
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(CURRENCY_LOCALE[currentLanguage], {
      style: "currency",
      currency: "ARS",
    }).format(value);

  const resolveMovementError = (errorKey: unknown): string => {
    if (typeof errorKey === "string") {
      const key = errorKey as keyof typeof copy.errors;
      if (copy.errors?.[key]) return copy.errors[key];
    }
    return copy.errors?.generic || copy.withdrawError;
  };

  // Translate movement descriptions stored as "movementType:reason" format
  const translateMovementDescription = (raw: string): string => {
    if (!raw) return "";

    const normalize = (value: string) => value.trim().toLowerCase();
    const typeMap: Record<string, keyof typeof copy.movements.types> = {
      apertura: "apertura",
      opening: "apertura",
      sale: "venta",
      venta: "venta",
      withdrawal: "retiro",
      retiro: "retiro",
      closing: "cierre",
      cierre: "cierre",
      ingreso: "ingreso",
      deposit: "ingreso",
      creditnote: "nota_credito",
      credit_note: "nota_credito",
      nota_credito: "nota_credito",
    };

    const resolveTypeLabel = (typePart: string) => {
      const key = typeMap[normalize(typePart)] as
        | keyof typeof copy.movements.types
        | undefined;
      return key ? copy.movements.types[key] : typePart;
    };

    const resolveReasonLabel = (reasonPart: string) => {
      const normalized = normalize(reasonPart);
      if (normalized === "noreason" || normalized === "no reason") {
        return copy.movements.noReason;
      }

      const languages = ["es", "en", "pt"] as const;
      for (const lang of languages) {
        const idx = WITHDRAWAL_REASONS[lang].findIndex(
          (r) => normalize(r) === normalized,
        );
        if (idx >= 0) {
          return WITHDRAWAL_REASONS[currentLanguage][idx];
        }
      }

      return reasonPart;
    };

    if (raw.includes(":")) {
      const [typePart, ...rest] = raw.split(":");
      const reasonPart = rest.join(":").trim();
      const typeLabel = resolveTypeLabel(typePart);
      const reasonLabel = reasonPart ? resolveReasonLabel(reasonPart) : "";
      if (typeLabel && reasonLabel) return `${typeLabel} - ${reasonLabel}`;
      return reasonLabel || typeLabel || raw;
    }

    if (raw.includes(" - ")) {
      const [typePart, ...rest] = raw.split(" - ");
      const reasonPart = rest.join(" - ").trim();
      const typeLabel = resolveTypeLabel(typePart);
      const reasonLabel = reasonPart ? resolveReasonLabel(reasonPart) : "";
      if (typeLabel && reasonLabel) return `${typeLabel} - ${reasonLabel}`;
      return reasonLabel || typeLabel || raw;
    }

    const normalizedRaw = normalize(raw);
    const typeLabel = resolveTypeLabel(normalizedRaw);
    return typeLabel || raw;
  };
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [opening, setOpening] = useState("");
  const [movements, setMovements] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [toastOpen, setToastOpen] = useState(false);
  const [sessionData, setSessionData] = useState<any>({
    initialAmount: 0,
    salesTotal: 0,
    withdrawalsTotal: 0,
    depositsTotal: 0,
    expected: 0,
  });
  // Derived shorthand values for templates
  const {
    initialAmount,
    salesTotal: sales,
    withdrawalsTotal: withdrawals,
    depositsTotal,
    expected: expectedInCash,
  } = sessionData;
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [showCashInModal, setShowCashInModal] = useState(false);
  const [withdrawalModalKey, setWithdrawalModalKey] = useState(0);
  const [creditNoteModalKey, setCreditNoteModalKey] = useState(0);
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [pendingAuthorization, setPendingAuthorization] = useState<{
    action: "withdrawal" | "credit_note" | "close" | "deposit";
    amount?: number;
    reason?: string;
    notes?: string;
    countedAmount?: number;
  } | null>(null);
  const [showCloseBoxModal, setShowCloseBoxModal] = useState(false);
  const [showCloseTicket, setShowCloseTicket] = useState(false);
  const [closeTicketData, setCloseTicketData] =
    useState<CloseTicketData | null>(null);
  const [creditNotesTotal, setCreditNotesTotal] = useState<number>(0);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (showWithdrawalTicket) {
      setShowWithdrawalModal(false);
      setWithdrawalModalKey((prev) => prev + 1);
    }
  }, [showWithdrawalTicket]);

  const isWithdrawalModalOpen =
    showWithdrawalModal && !showAuthorizationModal && !showWithdrawalTicket;

  // Operator filter state and filteredMovements logic
  const [operatorFilter, setOperatorFilter] = useState("");
  const filteredMovements =
    operatorFilter.trim().length === 0
      ? movements
      : movements.filter((m: any) => {
          if (!m.operator) return false;
          const name = (m.operator.visible_name || "").toLowerCase();
          const role = (m.operator.role || "").toLowerCase();
          const filter = operatorFilter.toLowerCase();
          return name.includes(filter) || role.includes(filter);
        });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    // Fetch current cash register status with timeout to avoid hanging loaders
    (async () => {
      try {
        let token = localStorage.getItem("accessToken");
        // Proactive refresh
        if (!token || isTokenExpiredSoon(token)) {
          const rt = localStorage.getItem("refreshToken");
          if (rt) {
            const refreshRes = await fetch("/api/auth/refresh", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: rt }),
            });
            if (refreshRes.ok) {
              const { data } = await refreshRes.json();
              if (data?.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
                token = data.accessToken as string;
              }
              if (data?.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
              }
            }
          }
        }
        let res = await fetch("/api/cash-register", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (res.status === 401) {
          // Try refresh once and retry
          const rt = localStorage.getItem("refreshToken");
          if (rt) {
            const refreshRes = await fetch("/api/auth/refresh", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: rt }),
            });
            if (refreshRes.ok) {
              const { data } = await refreshRes.json();
              if (data?.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
                token = data.accessToken as string;
              }
              if (data?.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
              }
              res = await fetch("/api/cash-register", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
              });
            } else {
              router.push("/auth/login");
              return;
            }
          } else {
            router.push("/auth/login");
            return;
          }
        }
        if (res.ok) {
          const payload = await res.json();
          const data = payload?.data ?? payload;
          setIsOpen(Boolean(data?.isOpen));
          setMovements(Array.isArray(data?.movements) ? data.movements : []);
          setSessions(Array.isArray(data?.sessions) ? data.sessions : []);
          setSessionData({
            initialAmount: data?.initialAmount || 0,
            salesTotal: data?.salesTotal || 0,
            withdrawalsTotal: data?.withdrawalsTotal || 0,
            depositsTotal: data?.depositsTotal || 0,
            expected: data?.expected || 0,
          });
          setCreditNotesTotal(data?.creditNotesTotal || 0);
        }
      } catch (e) {
        console.error("Failed to get cash register status", e);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    })();
    return () => {
      setToastMsg(copy.openSuccess);
      controller.abort();
    };
  }, [router]);

  // Faster polling + fetch lock + visual loading indicator
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      setLoadingMovements(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/cash-register", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const payload = await res.json();
          const data = payload?.data ?? payload;
          setMovements(Array.isArray(data?.movements) ? data.movements : []);
          setSessions(Array.isArray(data?.sessions) ? data.sessions : []);
          setSessionData({
            initialAmount: data?.initialAmount || 0,
            salesTotal: data?.salesTotal || 0,
            withdrawalsTotal: data?.withdrawalsTotal || 0,
            depositsTotal: data?.depositsTotal || 0,
            expected: data?.expected || 0,
          });
          setCreditNotesTotal(data?.creditNotesTotal || 0);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingMovements(false);
        isPollingRef.current = false;
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleCounted = (amount: number) => {
    setPendingAmount(amount);
    setShowOpenModal(false);
    setShowTicket(true);
  };

  const handleConfirmTicket = async () => {
    try {
      let token = localStorage.getItem("accessToken");
      // Proactively refresh if token is missing or expiring soon
      if (!token || isTokenExpiredSoon(token)) {
        const rt = localStorage.getItem("refreshToken");
        if (rt) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: rt }),
          });
          if (refreshRes.ok) {
            const { data } = await refreshRes.json();
            if (data?.accessToken) {
              localStorage.setItem("accessToken", data.accessToken);
              token = data.accessToken as string;
            }
            if (data?.refreshToken) {
              localStorage.setItem("refreshToken", data.refreshToken);
            }
          }
        }
      }
      const response = await fetch("/api/cash-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "open",
          amount: pendingAmount,
        }),
      });
      if (!response.ok) {
        // If unauthorized, attempt token refresh once
        if (response.status === 401) {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            const refreshRes = await fetch("/api/auth/refresh", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // Authorization header not required; send in body per API contract
              },
              body: JSON.stringify({ refreshToken }),
            });
            if (refreshRes.ok) {
              const { data } = await refreshRes.json();
              const newToken = data?.accessToken;
              if (newToken) {
                localStorage.setItem("accessToken", newToken);
              }
              if (data?.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
              }
              const retry = await fetch("/api/cash-register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
                body: JSON.stringify({ action: "open", amount: pendingAmount }),
              });
              if (!retry.ok) {
                if (retry.status === 409) {
                  setIsOpen(true);
                  setShowTicket(false);
                  setToastType("info");
                  setToastMsg(copy.toastAlreadyOpen);
                  setToastOpen(true);
                  router.push("/cash-register");
                  return;
                }
                const err = await retry.json();
                setToastType("error");
                setToastMsg(resolveMovementError(err?.error));
                setToastOpen(true);
                return;
              }
            } else {
              setToastType("error");
              setToastMsg(copy.sessionExpired);
              setToastOpen(true);
              router.push("/auth/login");
              return;
            }
          } else {
            setToastType("error");
            setToastMsg(copy.sessionExpired);
            setToastOpen(true);
            router.push("/auth/login");
            return;
          }
        } else if (response.status === 409) {
          // Already open - sync state and proceed
          setIsOpen(true);
          setShowTicket(false);
          setToastType("info");
          setToastMsg(copy.toastAlreadyOpen);
          setToastOpen(true);
          router.push("/cash-register");
          return;
        } else {
          const error = await response.json();
          setToastType("error");
          setToastMsg(resolveMovementError(error?.error));
          setToastOpen(true);
          return;
        }
      }
      setIsOpen(true);
      setShowTicket(false);
      // Refresh status after open to ensure UI reflects backend
      try {
        const token3 = localStorage.getItem("accessToken");
        const res3 = await fetch("/api/cash-register", {
          method: "GET",
          headers: { Authorization: `Bearer ${token3}` },
        });
        if (res3.ok) {
          const payload3 = await res3.json();
          const data3 = payload3?.data ?? payload3;
          setMovements(Array.isArray(data3?.movements) ? data3.movements : []);
          setSessions(Array.isArray(data3?.sessions) ? data3.sessions : []);
          setSessionData({
            initialAmount: data3?.initialAmount || 0,
            salesTotal: data3?.salesTotal || 0,
            withdrawalsTotal: data3?.withdrawalsTotal || 0,
            depositsTotal: data3?.depositsTotal || 0,
            expected: data3?.expected || 0,
          });
        }
      } catch {}
      setToastType("success");
      setToastMsg(copy.openSuccess);
      setToastOpen(true);
      // Navigate to Control de Caja showing open state
      router.push("/cash-register");
    } catch (error) {
      console.error("Open register error:", error);
      setToastType("error");
      setToastMsg(copy.openError);
      setToastOpen(true);
    }
  };

  const handleClose = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/cash-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "close",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setToastType("error");
        setToastMsg(resolveMovementError(error?.error));
        setToastOpen(true);
        return;
      }

      setIsOpen(false);
      setToastType("success");
      setToastMsg(copy.closeSuccess);
      setToastOpen(true);
    } catch (error) {
      console.error("Close register error:", error);
      setToastType("error");
      setToastMsg(copy.closeError);
      setToastOpen(true);
    }
  };

  const handleWithdrawal = async (
    amount: number,
    reason: string,
    notes: string,
    approvalPassword?: string,
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/cash-register/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "withdrawal",
          amount,
          reason,
          notes,
          approvalPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "generic" }));
        const errorKey = error?.error || error?.message || "generic";
        setToastType("error");
        setToastMsg(resolveMovementError(errorKey));
        setToastOpen(true);
        return false;
      }

      setToastType("success");
      setToastMsg(copy.authorizationSuccess);
      setToastOpen(true);

      const payload = await response.json();
      const data = payload?.data ?? payload;
      setMovements(data?.movements || []);
      setSessionData({
        initialAmount: data?.initialAmount || 0,
        salesTotal: data?.salesTotal || 0,
        withdrawalsTotal: data?.withdrawalsTotal || 0,
        depositsTotal: data?.depositsTotal || 0,
        expected: data?.expected || 0,
      });

      setToastType("success");
      setToastMsg(copy.withdrawSuccess(formatCurrency(amount)));
      setToastOpen(true);

      setShowWithdrawalModal(false);
      setWithdrawalModalKey((prev) => prev + 1);

      // Show withdrawal ticket
      setWithdrawalTicketData({
        amount,
        reason,
        cashierName: user?.fullName || "",
        supervisorName: data?.movement?.approvedBy?.visible_name || "",
      });
      setShowWithdrawalTicket(true);
      return true;
    } catch (error) {
      console.error("Withdrawal error:", error);
      setToastType("error");
      setToastMsg(copy.withdrawError);
      setToastOpen(true);
      return false;
    }
  };

  const handleCreditNote = async (
    amount: number,
    reason: string,
    notes: string,
    approvalPassword?: string,
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/cash-register/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "credit_note",
          amount,
          reason,
          notes,
          approvalPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setToastType("error");
        setToastMsg(resolveMovementError(error?.error));
        setToastOpen(true);
        return false;
      }

      const payload = await response.json();
      const data = payload?.data ?? payload;
      setMovements(data?.movements || []);
      setCreditNotesTotal(data?.creditNotesTotal || 0);
      setSessionData({
        initialAmount: data?.initialAmount || 0,
        salesTotal: data?.salesTotal || 0,
        withdrawalsTotal: data?.withdrawalsTotal || 0,
        depositsTotal: data?.depositsTotal || 0,
        expected: data?.expected || 0,
      });

      setToastType("success");
      setToastMsg(copy.creditSuccess(formatCurrency(amount)));
      setToastOpen(true);

      setCreditNoteTicketData({
        amount,
        reason,
        notes,
        createdAt: formatDateTime(new Date()),
        cashierName: user?.fullName || "",
        adminName:
          data?.movement?.approvedBy?.visible_name ||
          (user?.role === "admin" ? user?.fullName || "" : ""),
      });
      setShowCreditNoteTicket(true);
      return true;
    } catch (error) {
      console.error("Credit note error:", error);
      setToastType("error");
      setToastMsg(copy.creditError);
      setToastOpen(true);
      return false;
    }
  };

  const handleCashIn = async (amount: number, approvalPassword?: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/cash-register/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "deposit",
          amount,
          approvalPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setToastType("error");
        setToastMsg(resolveMovementError(error?.error));
        setToastOpen(true);
        return;
      }

      const payload = await response.json();
      const data = payload?.data ?? payload;
      setMovements(data?.movements || []);
      setCreditNotesTotal(data?.creditNotesTotal || 0);
      setSessionData({
        initialAmount: data?.initialAmount || 0,
        salesTotal: data?.salesTotal || 0,
        withdrawalsTotal: data?.withdrawalsTotal || 0,
        depositsTotal: data?.depositsTotal || 0,
        expected: data?.expected || 0,
      });

      setToastType("success");
      setToastMsg(copy.cashInSuccess(formatCurrency(amount)));
      setToastOpen(true);
      setShowCashInModal(false);
    } catch (error) {
      console.error("Cash in error:", error);
      setToastType("error");
      setToastMsg(copy.cashInError);
      setToastOpen(true);
    }
  };

  const requestWithdrawal = async (
    amount: number,
    reason: string,
    notes: string,
  ): Promise<boolean> => {
    setPendingAuthorization({ action: "withdrawal", amount, reason, notes });
    setShowAuthorizationModal(true);
    return false;
  };

  const requestCreditNote = async (
    amount: number,
    reason: string,
    notes: string,
  ): Promise<boolean> => {
    setPendingAuthorization({ action: "credit_note", amount, reason, notes });
    setShowAuthorizationModal(true);
    return false;
  };

  const requestCashIn = async (amount: number): Promise<boolean> => {
    setPendingAuthorization({ action: "deposit", amount });
    setShowAuthorizationModal(true);
    return false;
  };

  const requestCloseBox = async (countedAmount: number) => {
    setPendingAuthorization({ action: "close", countedAmount });
    setShowAuthorizationModal(true);
    setShowCloseBoxModal(false);
  };

  const handleAuthorizationConfirm = async (
    password: string,
  ): Promise<boolean> => {
    if (!pendingAuthorization) return false;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/cash-register/authorization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          approvalPassword: password,
          action: pendingAuthorization.action,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "generic" }));
        const errorKey = error?.error || error?.message || "generic";
        setToastType("error");
        setToastMsg(resolveMovementError(errorKey));
        setToastOpen(true);
        return false;
      }

      if (pendingAuthorization.action === "withdrawal") {
        const ok = await handleWithdrawal(
          pendingAuthorization.amount || 0,
          pendingAuthorization.reason || "",
          pendingAuthorization.notes || "",
          password,
        );
        if (ok) {
          setShowWithdrawalModal(false);
          setWithdrawalModalKey((prev) => prev + 1);
        }
        if (!ok) return false;
      } else if (pendingAuthorization.action === "credit_note") {
        const ok = await handleCreditNote(
          pendingAuthorization.amount || 0,
          pendingAuthorization.reason || "",
          pendingAuthorization.notes || "",
          password,
        );
        if (ok) {
          setShowCreditNoteModal(false);
          setCreditNoteModalKey((prev) => prev + 1);
        }
        if (!ok) return false;
      } else if (pendingAuthorization.action === "deposit") {
        await handleCashIn(pendingAuthorization.amount || 0, password);
      } else {
        const ok = await handleCloseBox(
          pendingAuthorization.countedAmount || 0,
          password,
        );
        if (!ok) return false;
      }

      setPendingAuthorization(null);
      return true;
    } catch (error) {
      console.error("Authorization error:", error);
      setToastType("error");
      setToastMsg(copy.errors.generic);
      setToastOpen(true);
      return false;
    }
  };

  const handleCloseBox = async (
    countedAmount: number,
    approvalPassword: string,
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/cash-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "close",
          countedAmount,
          approvalPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "generic" }));
        const errorKey = error?.error || error?.message || "generic";
        setToastType("error");
        setToastMsg(resolveMovementError(errorKey));
        setToastOpen(true);
        return false;
      }

      const payload = await response.json();
      const data = payload?.data ?? payload;
      const summary = data?.summary;
      const fallbackExpected =
        typeof summary?.expected === "number"
          ? summary.expected
          : sessionData.expected;

      // Ensure movements is always a valid array with proper formatting
      let formattedMovements = [];
      if (Array.isArray(summary?.movements) && summary.movements.length > 0) {
        formattedMovements = summary.movements.map((m: any) => ({
          _id: m._id || "",
          type: m.type || "",
          description: m.description || "",
          amount: typeof m.amount === "number" ? m.amount : 0,
          createdAt:
            m.createdAtISO || m.createdAt || formatDateTime(new Date()),
          createdAtISO: m.createdAtISO || undefined,
          operator: m.operator || null,
        }));
      } else if (Array.isArray(movements) && movements.length > 0) {
        formattedMovements = movements.map((m: any) => ({
          _id: m._id || "",
          type: m.type || "",
          description: m.description || "",
          amount: typeof m.amount === "number" ? m.amount : 0,
          createdAt:
            m.createdAtISO || m.createdAt || formatDateTime(new Date()),
          createdAtISO: m.createdAtISO || undefined,
          operator: m.operator || null,
        }));
      }

      const ticket: CloseTicketData = {
        businessName:
          summary?.businessName || user?.businessName || copy.businessFallback,
        cashierName:
          summary?.cashierName || user?.fullName || user?.username || "",
        sessionId:
          summary?.sessionId || data?.cashRegister?._id || copy.sessionFallback,
        openedAt: formatDateTime(summary?.openedAtISO || summary?.openedAt),
        closedAt: formatDateTime(summary?.closedAtISO || summary?.closedAt),
        openingBalance:
          typeof summary?.openingBalance === "number"
            ? summary.openingBalance
            : sessionData.initialAmount,
        salesTotal:
          typeof summary?.salesTotal === "number"
            ? summary.salesTotal
            : sessionData.salesTotal,
        withdrawalsTotal:
          typeof summary?.withdrawalsTotal === "number"
            ? summary.withdrawalsTotal
            : sessionData.withdrawalsTotal,
        creditNotesTotal:
          typeof summary?.creditNotesTotal === "number"
            ? summary.creditNotesTotal
            : creditNotesTotal,
        depositsTotal:
          typeof summary?.depositsTotal === "number"
            ? summary.depositsTotal
            : depositsTotal,
        expected:
          typeof summary?.expected === "number"
            ? summary.expected
            : sessionData.expected,
        countedAmount:
          typeof summary?.countedAmount === "number"
            ? summary.countedAmount
            : countedAmount,
        difference:
          typeof summary?.difference === "number"
            ? summary.difference
            : countedAmount - (fallbackExpected || 0),
        movements: formattedMovements,
      };

      setCloseTicketData(ticket);
      setShowCloseTicket(true);
      setIsOpen(false);
      setShowCloseBoxModal(false);
      setToastType("success");
      setToastMsg(copy.closeSuccess);
      setToastOpen(true);
      return true;
    } catch (error) {
      console.error("Close box error:", error);
      setToastType("error");
      setToastMsg(copy.closeError);

      setToastOpen(true);
      return false;
    }
  };

  const isLoading = loading || isOpen === null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header user={user} showBackButton={true} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loading label={copy.loading} />
          </div>
        ) : (
          <>
            {isOpen === false && (
              <div className="flex flex-col items-center justify-center py-16">
                <svg
                  className="w-10 h-10 text-slate-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
                <p className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {copy.noOpenTitle}
                </p>
                <p className="max-w-md mb-8 text-center text-slate-600 dark:text-slate-400">
                  {copy.noOpenSubtitle}
                </p>
                <button
                  onClick={() => setShowOpenModal(true)}
                  className="flex items-center gap-2 px-8 py-3 font-bold text-white transition bg-green-600 rounded-lg shadow-lg hover:bg-green-700 hover:shadow-xl"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {copy.openButton}
                </button>
              </div>
            )}

            {isOpen === true && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                  {/* Monto Inicial */}
                  <div className="p-6 bg-white border rounded-lg shadow-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {copy.stats.initial}
                      </p>
                      <svg
                        className="w-8 h-8 text-blue-500 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(initialAmount)}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                      {movements.find((m: any) => m.type === "apertura")
                        ?.createdAt || "-"}
                    </p>
                  </div>

                  {/* Ventas */}
                  <div className="p-6 bg-white border rounded-lg shadow-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {copy.stats.sales}
                      </p>
                      <svg
                        className="w-8 h-8 text-green-500 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(sales)}
                    </p>
                  </div>

                  {/* Retiros */}
                  <div className="p-6 bg-white border rounded-lg shadow-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {copy.stats.withdrawals}
                      </p>
                      <svg
                        className="w-8 h-8 text-red-500 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                        />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(withdrawals)}
                    </p>
                  </div>

                  {/* Esperado en Caja */}
                  <div className="p-6 bg-white border rounded-lg shadow-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {copy.stats.expected}
                      </p>
                      <svg
                        className="w-8 h-8 text-purple-500 dark:text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(expectedInCash)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
                  <button
                    onClick={() => setShowWithdrawalModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition bg-orange-600 rounded-lg shadow-lg hover:bg-orange-700 hover:shadow-xl"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {copy.actions.withdrawal}
                  </button>

                  <button
                    onClick={() => setShowCreditNoteModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700 hover:shadow-xl"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {copy.actions.creditNote}
                  </button>

                  <button
                    onClick={() => setShowCashInModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition bg-emerald-600 rounded-lg shadow-lg hover:bg-emerald-700 hover:shadow-xl"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {copy.actions.cashIn}
                  </button>

                  <button
                    onClick={() => setShowCloseBoxModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition bg-red-600 rounded-lg shadow-lg hover:bg-red-700 hover:shadow-xl"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {copy.actions.close}
                  </button>
                </div>
                {/* Movements Table with Operator Filter */}
                <div className="p-6 mb-8 bg-white border rounded-lg shadow-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {copy.movements.title}
                    </h2>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <input
                        type="text"
                        placeholder="Filtrar por operador o rol..."
                        className="px-3 py-2 text-sm border rounded border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        value={operatorFilter}
                        onChange={(e) => setOperatorFilter(e.target.value)}
                      />
                      {loadingMovements && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span className="inline-block w-4 h-4 border-2 rounded-full border-slate-300 border-b-transparent animate-spin dark:border-slate-600" />
                          {copy.movements.updating}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                            {copy.movements.datetime}
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                            {copy.movements.type}
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                            {copy.movements.description}
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                            {copy.movements.amount}
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                            {copy.movements.operator}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-700">
                        {loadingMovements && filteredMovements.length === 0 ? (
                          [...Array(3)].map((_, i) => (
                            <tr key={`skeleton-${i}`}>
                              <td className="px-6 py-4">
                                <div className="w-32 h-4 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                              </td>
                              <td className="px-6 py-4">
                                <div className="w-24 h-5 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                              </td>
                              <td className="px-6 py-4">
                                <div className="w-64 h-4 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                              </td>
                              <td className="px-6 py-4">
                                <div className="w-20 h-4 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                              </td>
                            </tr>
                          ))
                        ) : filteredMovements.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-8 text-sm text-center text-slate-600 dark:text-slate-500"
                            >
                              {copy.movements.empty}
                            </td>
                          </tr>
                        ) : (
                          filteredMovements.map(
                            (movement: any, idx: number) => (
                              <tr
                                key={movement._id || idx}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              >
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-700 dark:text-slate-300">
                                  {formatDateTime(
                                    movement.createdAtISO || movement.createdAt,
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      movement.type === "apertura"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                        : movement.type === "venta"
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                          : movement.type === "retiro"
                                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                            : movement.type === "ingreso"
                                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                              : movement.type === "cierre"
                                                ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                                : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                                    }`}
                                  >
                                    {copy.movements.types[
                                      movement.type as keyof typeof copy.movements.types
                                    ] || movement.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                                  {translateMovementDescription(
                                    movement.description,
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-green-600 whitespace-nowrap dark:text-green-400">
                                  {formatCurrency(movement.amount)}
                                </td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-700 dark:text-slate-300">
                                  {movement.operator
                                    ? `${movement.operator.visible_name || "-"} (${movement.operator.role || "-"})`
                                    : copy.movements.noOperator}
                                </td>
                              </tr>
                            ),
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
            {/* Historial de Sesiones */}
            <div className="p-6 mt-8 bg-white border rounded-lg shadow-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <h2 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
                {copy.sessions.title}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                        {copy.sessions.openDate}
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                        {copy.sessions.initial}
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                        {copy.sessions.sales}
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                        {copy.sessions.withdrawals}
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                        {copy.sessions.expected}
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                        {copy.sessions.real}
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                        {copy.sessions.diff}
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                        {copy.sessions.status}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {sessions && sessions.length > 0 ? (
                      sessions.map((s, idx) => (
                        <tr
                          key={idx}
                          className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                            {formatDateTime(s.openedAtISO || s.openedAt)}
                          </td>
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                            {formatCurrency(s.initial ?? 0)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(s.sales ?? 0)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(s.withdrawals ?? 0)}
                          </td>
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                            {formatCurrency(s.expected ?? 0)}
                          </td>
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                            {s.real == null
                              ? "-"
                              : formatCurrency(Number(s.real))}
                          </td>
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                            {s.diff == null
                              ? "-"
                              : formatCurrency(Number(s.diff))}
                          </td>
                          <td className="px-6 py-4">
                            {(() => {
                              const statusRaw = (s.status || "").toLowerCase();
                              const isOpenStatus = [
                                "abierta",
                                "open",
                                "aberta",
                              ].includes(statusRaw);
                              const statusKey = isOpenStatus
                                ? "open"
                                : "closed";
                              return (
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                    isOpenStatus
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                      : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  }`}
                                >
                                  {copy.sessions.statuses[statusKey] ||
                                    s.status}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-8 text-sm text-center text-slate-600 dark:text-slate-500"
                        >
                          {copy.sessions.empty}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
      <OpenRegisterModal
        open={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        onConfirm={handleCounted}
      />
      <OpenTicketModal
        open={showTicket}
        onClose={() => setShowTicket(false)}
        onConfirm={handleConfirmTicket}
        data={{
          businessName: user?.businessName || "MI NEGOCIO",
          cashierName: user?.fullName || user?.username || "",
          sessionId:
            sessions?.[0]?.id || sessions?.[0]?._id || "" || "d213ba32-418",
          amount: pendingAmount,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
        }}
      />
      <Toast
        open={toastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      <WithdrawalModal
        key={withdrawalModalKey}
        isOpen={isWithdrawalModalOpen}
        onClose={() => {
          setShowWithdrawalModal(false);
          setPendingAuthorization(null);
        }}
        onConfirm={requestWithdrawal}
        currentBalance={sessionData.expected}
      />

      {/* Withdrawal Ticket Print Modal */}
      {showWithdrawalTicket && withdrawalTicketData && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowWithdrawalTicket(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <WithdrawalTicket
              amount={withdrawalTicketData.amount}
              reason={withdrawalTicketData.reason}
              cashierName={withdrawalTicketData.cashierName}
              supervisorName={withdrawalTicketData.supervisorName}
            />
            <div className="flex items-center justify-center gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition"
              >
                {copy.receiptPrint}
              </button>
              <button
                onClick={() => setShowWithdrawalTicket(false)}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg transition"
              >
                {copy.receiptClose}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Note Ticket Print Modal */}
      {showCreditNoteTicket && creditNoteTicketData && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowCreditNoteTicket(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <CreditNoteTicket
              amount={creditNoteTicketData.amount}
              reason={creditNoteTicketData.reason}
              notes={creditNoteTicketData.notes}
              createdAt={creditNoteTicketData.createdAt}
              cashierName={creditNoteTicketData.cashierName}
              adminName={creditNoteTicketData.adminName}
            />
            <div className="flex items-center justify-center gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition"
              >
                {copy.receiptPrint}
              </button>
              <button
                onClick={() => setShowCreditNoteTicket(false)}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg transition"
              >
                {copy.receiptClose}
              </button>
            </div>
          </div>
        </div>
      )}

      <CreditNoteModal
        key={creditNoteModalKey}
        isOpen={showCreditNoteModal}
        onClose={() => {
          setShowCreditNoteModal(false);
          setPendingAuthorization(null);
        }}
        onConfirm={requestCreditNote}
        currentBalance={sessionData.expected}
      />

      <OpenRegisterModal
        open={showCashInModal}
        onClose={() => setShowCashInModal(false)}
        onConfirm={requestCashIn}
        mode="deposit"
      />

      <AuthorizationModal
        isOpen={showAuthorizationModal}
        requiredRole="admin"
        onClose={() => {
          setShowAuthorizationModal(false);
          setPendingAuthorization(null);
        }}
        onConfirm={handleAuthorizationConfirm}
      />

      <CloseBoxModal
        isOpen={showCloseBoxModal}
        onClose={() => {
          setShowCloseBoxModal(false);
        }}
        onConfirm={requestCloseBox}
        expectedAmount={sessionData.expected}
        salesTotal={sessionData.salesTotal}
        withdrawalsTotal={sessionData.withdrawalsTotal}
        creditNotesTotal={creditNotesTotal}
        depositsTotal={depositsTotal}
      />
      <CloseTicketModal
        open={showCloseTicket}
        onClose={() => setShowCloseTicket(false)}
        data={closeTicketData}
      />
    </div>
  );
}
