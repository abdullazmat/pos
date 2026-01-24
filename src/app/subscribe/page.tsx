"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { CreditCard, Check, AlertCircle, Loader } from "lucide-react";
import { getAllPlans } from "@/lib/services/subscriptions/PlanConfig";

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface PlanConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: Record<string, any>;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("PROFESSIONAL");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);

    // Load available plans
    const availablePlans = getAllPlans();
    setPlans(availablePlans);
    setLoading(false);
  }, [router]);

  const handleSelectPlan = async (planId: string) => {
    if (!user) return;

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          email: user.email,
          businessName: "Mi Negocio", // Should get from business data
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error creating payment preference");
        return;
      }

      // Redirect to Mercado Pago checkout
      if (data.payment?.preferenceLink) {
        window.location.href = data.payment.preferenceLink;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing payment");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header user={user} showBackButton />

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Planes de Suscripción
          </h1>
          <p className="text-xl text-gray-600">
            Elige el plan que mejor se adapta a tu negocio
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                selectedPlan === plan.id
                  ? "ring-2 ring-blue-600 transform scale-105"
                  : "ring-1 ring-gray-200 hover:shadow-xl"
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-blue-100 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ${plan.price.toLocaleString()}
                  </span>
                  <span className="text-blue-100">/mes</span>
                </div>
              </div>

              {/* Features */}
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {Object.entries(plan.features).map(([key, value]) => {
                    if (typeof value === "boolean") {
                      return (
                        <li key={key} className="flex items-start gap-3">
                          {value ? (
                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0">
                              ✕
                            </div>
                          )}
                          <span className="text-gray-700 capitalize text-sm">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </span>
                        </li>
                      );
                    }
                    return (
                      <li key={key} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">
                          {typeof value === "number" && value > 1000
                            ? "Ilimitado"
                            : `${value} ${key
                                .replace(/([A-Z])/g, " $1")
                                .toLowerCase()}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={processing || selectedPlan === plan.id}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    selectedPlan === plan.id
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      {selectedPlan === plan.id
                        ? "Seleccionado"
                        : "Seleccionar"}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods Info */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Métodos de Pago
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">💳</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Tarjeta de Crédito
                </h3>
                <p className="text-gray-600 text-sm">
                  Visa, MasterCard y American Express
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">🏦</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Tarjeta de Débito
                </h3>
                <p className="text-gray-600 text-sm">
                  Débito directo de tu cuenta bancaria
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">QR Code</h3>
                <p className="text-gray-600 text-sm">
                  Escanea con tu billetera digital
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ¿Preguntas sobre los planes?{" "}
            <a
              href="mailto:ventas@ejemplo.com"
              className="text-blue-600 font-semibold hover:underline"
            >
              Contáctanos
            </a>
          </p>
          <p className="text-sm text-gray-500">
            Procesado por Mercado Pago • Pago seguro 100%
          </p>
        </div>
      </main>
    </div>
  );
}
