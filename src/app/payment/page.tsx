"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
}

type PaymentStatus = "success" | "failure" | "pending";

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));

    // Get status from URL
    const currentPath = window.location.pathname;
    if (currentPath.includes("success")) {
      setStatus("success");
      setMessage(
        "¡Tu pago ha sido procesado exitosamente! Tu suscripción está activada.",
      );
    } else if (currentPath.includes("failure")) {
      setStatus("failure");
      setMessage(
        "El pago no pudo ser procesado. Por favor intenta nuevamente.",
      );
    } else {
      setStatus("pending");
      setMessage(
        "Tu pago está siendo procesado. Esto puede tomar unos minutos.",
      );
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header user={user} showBackButton={false} />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            {status === "success" ? (
              <CheckCircle className="w-16 h-16 text-green-600" />
            ) : status === "failure" ? (
              <AlertCircle className="w-16 h-16 text-red-600" />
            ) : (
              <Loader className="w-16 h-16 text-blue-600 animate-spin" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {status === "success"
              ? "¡Bienvenido!"
              : status === "failure"
                ? "Pago No Completado"
                : "Procesando..."}
          </h1>

          {/* Message */}
          <p className="text-gray-600 text-lg mb-8">{message}</p>

          {/* Details */}
          {status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-green-900 mb-4">
                Tu suscripción está activada
              </h2>
              <ul className="space-y-2 text-sm text-green-800">
                <li>✓ Acceso completo a todas las funciones</li>
                <li>✓ Soporte prioritario</li>
                <li>✓ Integración con ARCA habilitada</li>
                <li>✓ Reportes avanzados disponibles</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/pos")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Ir al POS
            </button>
            {status !== "success" && (
              <button
                onClick={() => router.push("/subscribe")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Volver a Intentar
              </button>
            )}
          </div>

          {/* Support */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              ¿Necesitas ayuda?{" "}
              <a
                href="mailto:soporte@ejemplo.com"
                className="text-blue-600 font-semibold hover:underline"
              >
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
