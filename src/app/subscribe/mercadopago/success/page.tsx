"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { showToast } from "@/lib/utils/toastUtils";

export default function MercadoPagoSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentLanguage } = useGlobalLanguage();
  const [status, setStatus] = useState<
    "processing" | "success" | "error" | "pending"
  >("processing");

  const copy = {
    es: {
      processing: "Procesando Pago...",
      processingDesc: "Por favor espere mientras confirmamos su transacción",
      successTitle: "¡Pago Exitoso!",
      successDesc: "Su suscripción ha sido activada correctamente",
      pendingTitle: "Pago en Revisión",
      pendingDesc:
        "Tu pago está en proceso. Te avisaremos cuando esté confirmado.",
      errorTitle: "Error en el Pago",
      errorDesc: "No pudimos procesar su pago correctamente",
      successToast: "Pago confirmado. Suscripción activada.",
      pendingToast: "Pago pendiente. Espera la confirmación.",
      errorToast: "No se pudo confirmar el pago.",
      authRequired: "Inicia sesión nuevamente para confirmar el pago.",
      retry: "Volver a intentar",
      redirecting: "Redirigiendo al dashboard en 3 segundos...",
    },
    en: {
      processing: "Processing Payment...",
      processingDesc: "Please wait while we confirm your transaction",
      successTitle: "Payment Successful!",
      successDesc: "Your subscription has been activated successfully",
      pendingTitle: "Payment Pending",
      pendingDesc: "Your payment is in process. We will notify you soon.",
      errorTitle: "Payment Error",
      errorDesc: "We couldn't process your payment correctly",
      successToast: "Payment confirmed. Subscription activated.",
      pendingToast: "Payment pending. Await confirmation.",
      errorToast: "Payment could not be confirmed.",
      authRequired: "Please sign in again to confirm the payment.",
      retry: "Try again",
      redirecting: "Redirecting to dashboard in 3 seconds...",
    },
    pt: {
      processing: "Processando Pagamento...",
      processingDesc: "Aguarde enquanto confirmamos sua transação",
      successTitle: "Pagamento Bem-sucedido!",
      successDesc: "Sua assinatura foi ativada com sucesso",
      pendingTitle: "Pagamento em Análise",
      pendingDesc: "Seu pagamento está em processo. Avisaremos em breve.",
      errorTitle: "Erro no Pagamento",
      errorDesc: "Não foi possível processar seu pagamento",
      successToast: "Pagamento confirmado. Assinatura ativada.",
      pendingToast: "Pagamento pendente. Aguarde confirmação.",
      errorToast: "Não foi possível confirmar o pagamento.",
      authRequired: "Entre novamente para confirmar o pagamento.",
      retry: "Tentar novamente",
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
        setStatus("error");
        showToast(t.errorToast, "error");
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setStatus("error");
        showToast(t.authRequired, "error");
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
          showToast(t.successToast, "success");
          redirectTimer = setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
          return;
        }

        if (data.status === "PENDING") {
          setStatus("pending");
          showToast(t.pendingToast, "info");
          return;
        }

        setStatus("error");
        showToast(t.errorToast, "error");
      } catch (error) {
        console.error("Mercado Pago verify error:", error);
        setStatus("error");
        showToast(t.errorToast, "error");
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
        {status === "processing" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t.processing}
            </h1>
            <p className="text-gray-400">{t.processingDesc}</p>
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

        {status === "pending" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-b-4 border-yellow-500 rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t.pendingTitle}
            </h1>
            <p className="text-gray-400 mb-6">{t.pendingDesc}</p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Dashboard
            </Link>
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
            <Link
              href="/subscribe"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {t.retry}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
