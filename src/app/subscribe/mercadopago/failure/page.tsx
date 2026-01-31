"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { showToast } from "@/lib/utils/toastUtils";

export default function MercadoPagoFailure() {
  const searchParams = useSearchParams();
  const { currentLanguage } = useGlobalLanguage();
  const [status, setStatus] = useState<"error" | "pending">("error");

  const copy = {
    es: {
      title: "Pago Cancelado",
      desc: "Su transacción no fue completada. Por favor intente de nuevo.",
      pendingTitle: "Pago en Revisión",
      pendingDesc:
        "Tu pago está en proceso. Te avisaremos cuando esté confirmado.",
      toastError: "Pago cancelado o rechazado.",
      toastPending: "Pago pendiente. Espera la confirmación.",
      backPlans: "Volver a Planes",
      dashboard: "Ir al Dashboard",
    },
    en: {
      title: "Payment Cancelled",
      desc: "Your transaction was not completed. Please try again.",
      pendingTitle: "Payment Pending",
      pendingDesc: "Your payment is in process. We will notify you soon.",
      toastError: "Payment cancelled or rejected.",
      toastPending: "Payment pending. Await confirmation.",
      backPlans: "Back to Plans",
      dashboard: "Go to Dashboard",
    },
    pt: {
      title: "Pagamento Cancelado",
      desc: "Sua transação não foi concluída. Tente novamente.",
      pendingTitle: "Pagamento em Análise",
      pendingDesc: "Seu pagamento está em processo. Avisaremos em breve.",
      toastError: "Pagamento cancelado ou rejeitado.",
      toastPending: "Pagamento pendente. Aguarde confirmação.",
      backPlans: "Voltar aos Planos",
      dashboard: "Ir ao Dashboard",
    },
  } as const;

  const t = copy[currentLanguage] || copy.en;

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");
    const preferenceId = searchParams.get("preference_id");

    const verifyPayment = async () => {
      if (!paymentId) {
        showToast(t.toastError, "error");
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        showToast(t.toastError, "error");
        return;
      }

      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentId, preferenceId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify payment");
        }

        if (data.status === "PENDING") {
          setStatus("pending");
          showToast(t.toastPending, "info");
          return;
        }

        setStatus("error");
        showToast(t.toastError, "error");
      } catch (error) {
        console.error("Mercado Pago verify error:", error);
        showToast(t.toastError, "error");
      }
    };

    void verifyPayment();
  }, [searchParams, t]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 text-center border border-slate-700">
        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t.title}</h1>
            <p className="text-gray-400 mb-6">{t.desc}</p>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-b-4 border-yellow-500 rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t.pendingTitle}
            </h1>
            <p className="text-gray-400 mb-6">{t.pendingDesc}</p>
          </>
        )}
        <div className="flex gap-4">
          <Link
            href="/subscribe"
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t.backPlans}
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-2 border border-gray-600 text-white rounded-lg hover:border-gray-500 transition"
          >
            {t.dashboard}
          </Link>
        </div>
      </div>
    </div>
  );
}
