"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { showToast } from "@/lib/utils/toastUtils";

export default function MercadoPagoPending() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending",
  );

  const copy = {
    es: {
      title: "Pago en Revisión",
      desc: "Su pago está siendo procesado. Le enviaremos un email cuando esté confirmado.",
      successTitle: "¡Pago Exitoso!",
      successDesc: "Su suscripción ha sido activada correctamente",
      errorTitle: "Error en el Pago",
      errorDesc: "No pudimos procesar su pago correctamente",
      toastPending: "Pago pendiente. Espera la confirmación.",
      toastSuccess: "Pago confirmado. Suscripción activada.",
      toastError: "No se pudo confirmar el pago.",
      back: "Volver",
      dashboard: "Dashboard",
      redirecting: "Redirigiendo al dashboard en 3 segundos...",
    },
    en: {
      title: "Payment Pending",
      desc: "Your payment is being processed. We'll email you when confirmed.",
      successTitle: "Payment Successful!",
      successDesc: "Your subscription has been activated successfully",
      errorTitle: "Payment Error",
      errorDesc: "We couldn't process your payment correctly",
      toastPending: "Payment pending. Await confirmation.",
      toastSuccess: "Payment confirmed. Subscription activated.",
      toastError: "Payment could not be confirmed.",
      back: "Back",
      dashboard: "Dashboard",
      redirecting: "Redirecting to dashboard in 3 seconds...",
    },
    pt: {
      title: "Pagamento em Análise",
      desc: "Seu pagamento está sendo processado. Avisaremos por email.",
      successTitle: "Pagamento Bem-sucedido!",
      successDesc: "Sua assinatura foi ativada com sucesso",
      errorTitle: "Erro no Pagamento",
      errorDesc: "Não foi possível processar seu pagamento",
      toastPending: "Pagamento pendente. Aguarde confirmação.",
      toastSuccess: "Pagamento confirmado. Assinatura ativada.",
      toastError: "Não foi possível confirmar o pagamento.",
      back: "Voltar",
      dashboard: "Dashboard",
      redirecting: "Redirecionando ao dashboard em 3 segundos...",
    },
  } as const;

  const t = copy[currentLanguage] || copy.en;

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");
    const preferenceId = searchParams.get("preference_id");
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    const verifyPayment = async () => {
      if (!paymentId) {
        showToast(t.toastPending, "info");
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        showToast(t.toastPending, "info");
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

        if (data.status === "APPROVED") {
          setStatus("success");
          showToast(t.toastSuccess, "success");
          redirectTimer = setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
          return;
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
        setStatus("error");
        showToast(t.toastError, "error");
      }
    };

    void verifyPayment();
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [searchParams, router, t]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 text-center border border-slate-700">
        {status === "pending" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-b-4 border-yellow-500 rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-white mb-2">{t.title}</h1>
            <p className="text-gray-400 mb-6">{t.desc}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t.successTitle}
            </h1>
            <p className="text-gray-400 mb-6">{t.successDesc}</p>
            <p className="text-sm text-gray-500">{t.redirecting}</p>
          </>
        )}

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
            <h1 className="text-2xl font-bold text-white mb-2">
              {t.errorTitle}
            </h1>
            <p className="text-gray-400 mb-6">{t.errorDesc}</p>
          </>
        )}
        <div className="flex gap-4">
          <Link
            href="/subscribe"
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t.back}
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
