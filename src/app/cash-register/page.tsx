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
    "info"
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
                    "Caja ya estaba abierta, sincronizando estado..."
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
                "Sesión expirada. Por favor inicia sesión nuevamente."
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
    notes: string
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
    notes: string
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
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isOpen === false && (
          <div className="flex flex-col items-center justify-center bg-gray-900/5 rounded-xl py-12 mb-8">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-300"
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
            <p className="text-lg font-semibold text-gray-200 mb-1">
              No hay caja abierta
            </p>
            <p className="text-gray-400 mb-6">
              Debes abrir una caja para comenzar a vender
            </p>
            <button
              onClick={() => setShowOpenModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2"
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">Monto Inicial</p>
                  <svg
                    className="w-8 h-8 text-blue-500"
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
                <p className="text-3xl font-bold text-gray-900">
                  ${initialAmount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {movements.find((m: any) => m.type === "apertura")
                    ?.createdAt || "-"}
                </p>
              </div>

              {/* Ventas */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">Ventas</p>
                  <svg
                    className="w-8 h-8 text-green-500"
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
                <p className="text-3xl font-bold text-green-600">
                  ${sales.toFixed(2)}
                </p>
              </div>

              {/* Retiros */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">Retiros</p>
                  <svg
                    className="w-8 h-8 text-red-500"
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
                <p className="text-3xl font-bold text-red-600">
                  ${withdrawals.toFixed(2)}
                </p>
              </div>

              {/* Esperado en Caja */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">Esperado en Caja</p>
                  <svg
                    className="w-8 h-8 text-purple-500"
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
                <p className="text-3xl font-bold text-purple-600">
                  ${expectedInCash.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center gap-2"
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
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center gap-2"
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
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center gap-2"
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Movimientos de la Sesión
                </h2>
                {loadingMovements && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-4 h-4 border-2 border-gray-300 border-b-transparent rounded-full animate-spin inline-block" />
                    Actualizando...
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingMovements && movements.length === 0 ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={`skeleton-${i}`}>
                          <td className="px-6 py-4">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                          </td>
                        </tr>
                      ))
                    ) : movements.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                          No hay movimientos registrados en esta sesión
                        </td>
                      </tr>
                    ) : (
                      movements.map((movement: any, idx: number) => (
                        <tr key={movement._id || idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movement.createdAt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                movement.type === "apertura"
                                  ? "bg-blue-100 text-blue-800"
                                  : movement.type === "venta"
                                  ? "bg-green-100 text-green-800"
                                  : movement.type === "retiro"
                                  ? "bg-orange-100 text-orange-800"
                                  : movement.type === "cierre"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {movement.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
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
        <div className="bg-gray-900/10 rounded-xl p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Historial de Sesiones
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="px-4 py-3">Fecha Apertura</th>
                  <th className="px-4 py-3">Monto Inicial</th>
                  <th className="px-4 py-3">Ventas</th>
                  <th className="px-4 py-3">Retiros</th>
                  <th className="px-4 py-3">Esperado</th>
                  <th className="px-4 py-3">Real</th>
                  <th className="px-4 py-3">Diferencia</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900/5">
                {sessions && sessions.length > 0 ? (
                  sessions.map((s, idx) => (
                    <tr key={idx} className="border-t border-gray-800">
                      <td className="px-4 py-3 text-gray-200">{s.openedAt}</td>
                      <td className="px-4 py-3 text-gray-200">
                        ${(s.initial ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-500">
                        ${(s.sales ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-red-500">
                        ${(s.withdrawals ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-200">
                        ${(s.expected ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-200">
                        {s.real == null ? "-" : `$${Number(s.real).toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-gray-200">
                        {s.diff == null ? "-" : `$${Number(s.diff).toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            s.status === "Abierta"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-gray-800 text-gray-300"
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
                      className="px-4 py-8 text-center text-sm text-gray-400"
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
