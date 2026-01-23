"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import OpenRegisterModal from "@/components/cash-register/OpenRegisterModal";
import OpenTicketModal from "@/components/cash-register/OpenTicketModal";
import Toast from "@/components/common/Toast";
import Loading from "@/components/common/Loading";
import { isTokenExpiredSoon } from "@/lib/utils/token";

import WithdrawalModal from "@/components/cash-register/WithdrawalModal";
import CreditNoteModal from "@/components/cash-register/CreditNoteModal";
import CloseBoxModal from "@/components/cash-register/CloseBoxModal";

export default function CashRegisterPage() {
  const router = useRouter();
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
    expected: 0,
  });
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [showCloseBoxModal, setShowCloseBoxModal] = useState(false);
  const [creditNotesTotal, setCreditNotesTotal] = useState<number>(0);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const isPollingRef = useRef(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    // Fetch current cash register status with timeout to avoid hanging loaders
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
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
      clearTimeout(timeout);
      controller.abort();
    };
  }, [router]);

  // Faster polling + fetch lock + visual loading indicator
  useEffect(() => {
    if (!isOpen) return;
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
                  setToastMsg(
                    "Caja ya estaba abierta, sincronizando estado...",
                  );
                  setToastOpen(true);
                  router.push("/cash-register");
                  return;
                }
                const err = await retry.json();
                setToastType("error");
                setToastMsg(`Error: ${err.error}`);
                setToastOpen(true);
                return;
              }
            } else {
              setToastType("error");
              setToastMsg(
                "Sesión expirada. Por favor inicia sesión nuevamente.",
              );
              setToastOpen(true);
              router.push("/auth/login");
              return;
            }
          } else {
            setToastType("error");
            setToastMsg("Sesión expirada. Por favor inicia sesión nuevamente.");
            setToastOpen(true);
            router.push("/auth/login");
            return;
          }
        } else if (response.status === 409) {
          // Already open - sync state and proceed
          setIsOpen(true);
          setShowTicket(false);
          setToastType("info");
          setToastMsg("Caja ya estaba abierta, sincronizando estado...");
          setToastOpen(true);
          router.push("/cash-register");
          return;
        } else {
          const error = await response.json();
          setToastType("error");
          setToastMsg(`Error: ${error.error}`);
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
            expected: data3?.expected || 0,
          });
        }
      } catch {}
      setToastType("success");
      setToastMsg("¡Caja abierta exitosamente!");
      setToastOpen(true);
      // Navigate to Control de Caja showing open state
      router.push("/cash-register");
    } catch (error) {
      console.error("Open register error:", error);
      setToastType("error");
      setToastMsg("No se pudo abrir la caja");
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
        setToastMsg(`Error: ${error.error}`);
        setToastOpen(true);
        return;
      }

      setIsOpen(false);
      setToastType("success");
      setToastMsg("¡Caja cerrada exitosamente!");
      setToastOpen(true);
    } catch (error) {
      console.error("Close register error:", error);
      setToastType("error");
      setToastMsg("No se pudo cerrar la caja");
      setToastOpen(true);
    }
  };

  const handleWithdrawal = async (
    amount: number,
    reason: string,
    notes: string,
  ) => {
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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setToastType("error");
        setToastMsg(`Error: ${error.error}`);
        setToastOpen(true);
        return;
      }

      const data = await response.json();
      setMovements(data?.movements || []);
      setSessionData({
        initialAmount: data?.initialAmount || 0,
        salesTotal: data?.salesTotal || 0,
        withdrawalsTotal: data?.withdrawalsTotal || 0,
        expected: data?.expected || 0,
      });

      setToastType("success");
      setToastMsg(`¡Retiro de $${amount.toFixed(2)} registrado!`);
      setToastOpen(true);
    } catch (error) {
      console.error("Withdrawal error:", error);
      setToastType("error");
      setToastMsg("No se pudo registrar el retiro");
      setToastOpen(true);
    }
  };

  const handleCreditNote = async (
    amount: number,
    reason: string,
    notes: string,
  ) => {
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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setToastType("error");
        setToastMsg(`Error: ${error.error}`);
        setToastOpen(true);
        return;
      }

      const data = await response.json();
      setMovements(data?.movements || []);
      setCreditNotesTotal(data?.creditNotesTotal || 0);
      setSessionData({
        initialAmount: data?.initialAmount || 0,
        salesTotal: data?.salesTotal || 0,
        withdrawalsTotal: data?.withdrawalsTotal || 0,
        expected: data?.expected || 0,
      });

      setToastType("success");
      setToastMsg(`¡Nota de crédito de $${amount.toFixed(2)} registrada!`);
      setToastOpen(true);
    } catch (error) {
      console.error("Credit note error:", error);
      setToastType("error");
      setToastMsg("No se pudo registrar la nota de crédito");
      setToastOpen(true);
    }
  };

  const handleCloseBox = async (countedAmount: number) => {
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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setToastType("error");
        setToastMsg(`Error: ${error.error}`);
        setToastOpen(true);
        return;
      }

      setIsOpen(false);
      setShowCloseBoxModal(false);
      setToastType("success");
      setToastMsg("¡Caja cerrada exitosamente!");
      setToastOpen(true);
    } catch (error) {
      console.error("Close box error:", error);
      setToastType("error");
      setToastMsg("No se pudo cerrar la caja");
      setToastOpen(true);
    }
  };

  if (loading || isOpen === null) {
    return <Loading label="Cargando Control de Caja..." />;
  }

  // Real data from backend
  const initialAmount = sessionData.initialAmount;
  const sales = sessionData.salesTotal;
  const withdrawals = sessionData.withdrawalsTotal;
  const expectedInCash = sessionData.expected;

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950">
      <Header user={user} showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isOpen === false && (
          <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-xl py-20 mb-8 border border-slate-800">
            <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              No hay caja abierta
            </p>
            <p className="text-slate-400 mb-8 text-center max-w-md">
              Debes abrir una caja desde la sección "Control de Caja" para
              comenzar a vender
            </p>
            <button
              onClick={() => setShowOpenModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition"
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
              Abrir Caja
            </button>
          </div>
        )}

        {isOpen === true && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Monto Inicial */}
              <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-400">Monto Inicial</p>
                  <svg
                    className="w-8 h-8 text-blue-400"
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
                <p className="text-3xl font-bold text-white">
                  ${initialAmount.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {movements.find((m: any) => m.type === "apertura")
                    ?.createdAt || "-"}
                </p>
              </div>

              {/* Ventas */}
              <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-400">Ventas</p>
                  <svg
                    className="w-8 h-8 text-green-400"
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
                <p className="text-3xl font-bold text-green-400">
                  ${sales.toFixed(2)}
                </p>
              </div>

              {/* Retiros */}
              <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-400">Retiros</p>
                  <svg
                    className="w-8 h-8 text-red-400"
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
                <p className="text-3xl font-bold text-red-400">
                  ${withdrawals.toFixed(2)}
                </p>
              </div>

              {/* Esperado en Caja */}
              <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-400">Esperado en Caja</p>
                  <svg
                    className="w-8 h-8 text-purple-400"
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
                <p className="text-3xl font-bold text-purple-400">
                  ${expectedInCash.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
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
                Registrar Retiro
              </button>

              <button
                onClick={() => setShowCreditNoteModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
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
                Nota de Crédito / Devolución
              </button>

              <button
                onClick={handleClose}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
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
                Cerrar Caja
              </button>
            </div>
            {/* Movements Table */}
            <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Movimientos de la Sesión
                </h2>
                {loadingMovements && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-4 h-4 border-2 border-slate-600 border-b-transparent rounded-full animate-spin inline-block" />
                    Actualizando...
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Fecha/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-700">
                    {loadingMovements && movements.length === 0 ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={`skeleton-${i}`}>
                          <td className="px-6 py-4">
                            <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-5 w-24 bg-slate-800 rounded animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-64 bg-slate-800 rounded animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
                          </td>
                        </tr>
                      ))
                    ) : movements.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-8 text-center text-sm text-slate-500"
                        >
                          No hay movimientos registrados en esta sesión
                        </td>
                      </tr>
                    ) : (
                      movements.map((movement: any, idx: number) => (
                        <tr
                          key={movement._id || idx}
                          className="hover:bg-slate-800/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {movement.createdAt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                movement.type === "apertura"
                                  ? "bg-blue-900/40 text-blue-300"
                                  : movement.type === "venta"
                                    ? "bg-green-900/40 text-green-300"
                                    : movement.type === "retiro"
                                      ? "bg-orange-900/40 text-orange-300"
                                      : movement.type === "cierre"
                                        ? "bg-slate-700 text-slate-300"
                                        : "bg-purple-900/40 text-purple-300"
                              }`}
                            >
                              {movement.type.charAt(0).toUpperCase() +
                                movement.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {movement.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                            ${movement.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Historial de Sesiones */}
        <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-6 mt-8">
          <h2 className="text-lg font-bold text-white mb-6">
            Historial de Sesiones
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Fecha Apertura
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Monto Inicial
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Ventas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Retiros
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Esperado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Real
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Diferencia
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sessions && sessions.length > 0 ? (
                  sessions.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 text-slate-300">{s.openedAt}</td>
                      <td className="px-6 py-4 text-slate-300">
                        ${(s.initial ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-400">
                        ${(s.sales ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-red-400">
                        ${(s.withdrawals ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        ${(s.expected ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {s.real == null ? "-" : `$${Number(s.real).toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {s.diff == null ? "-" : `$${Number(s.diff).toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            s.status === "Abierta"
                              ? "bg-green-900/40 text-green-400"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      No hay historial de sesiones
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onConfirm={handleWithdrawal}
        currentBalance={sessionData.expected}
      />

      <CreditNoteModal
        isOpen={showCreditNoteModal}
        onClose={() => setShowCreditNoteModal(false)}
        onConfirm={handleCreditNote}
        currentBalance={sessionData.expected}
      />

      <CloseBoxModal
        isOpen={showCloseBoxModal}
        onClose={() => setShowCloseBoxModal(false)}
        onConfirm={handleCloseBox}
        expectedAmount={sessionData.expected}
        salesTotal={sessionData.salesTotal}
        withdrawalsTotal={sessionData.withdrawalsTotal}
        creditNotesTotal={creditNotesTotal}
      />
    </div>
  );
}
