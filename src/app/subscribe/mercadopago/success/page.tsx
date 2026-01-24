"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function MercadoPagoSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");
    const preferenceId = searchParams.get("preference_id");

    if (paymentId && preferenceId) {
      setStatus("success");
      // Redirect to dashboard after 3 seconds
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setStatus("error");
      return undefined;
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 text-center border border-slate-700">
        {status === "processing" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Procesando Pago...
            </h1>
            <p className="text-gray-400">
              Por favor espere mientras confirmamos su transacción
            </p>
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
              ¡Pago Exitoso!
            </h1>
            <p className="text-gray-400 mb-6">
              Su suscripción ha sido activada correctamente
            </p>
            <p className="text-sm text-gray-500">
              Redirigiendo al dashboard en 3 segundos...
            </p>
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
              Error en el Pago
            </h1>
            <p className="text-gray-400 mb-6">
              No pudimos procesar su pago correctamente
            </p>
            <Link
              href="/subscribe"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Volver a intentar
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
