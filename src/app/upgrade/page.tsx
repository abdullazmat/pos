"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { toast } from "react-toastify";
import { AlertCircle } from "lucide-react";
import {
  Check,
  CreditCard,
  Zap,
  TrendingUp,
  Shield,
  Users,
} from "lucide-react";

export default function UpgradePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [mpUpgrading, setMpUpgrading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    setLoading(false);
    if (canceled) {
      toast.info("Pago cancelado. Intenta de nuevo cuando estés listo.");
    }
  }, [router, mounted, canceled]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user?.email,
          fullName: user?.fullName,
          plan: "paid",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const data = await response.json();

      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al iniciar el proceso de upgrade",
      );
      setUpgrading(false);
    }
  };

  const handleUpgradeMercadoPago = async () => {
    setMpUpgrading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: "PROFESSIONAL",
          email: user?.email,
          businessName: user?.businessName || user?.fullName || "Mi Negocio",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear el pago");
      }

      if (data.payment?.preferenceLink) {
        window.open(data.payment.preferenceLink, "_blank");
        toast.success(
          "Mercado Pago listo. El plan se activa al confirmar el pago.",
        );
      } else {
        throw new Error("No se recibió el enlace de pago");
      }
    } catch (error) {
      console.error("Upgrade Mercado Pago error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al iniciar el pago con Mercado Pago",
      );
    } finally {
      setMpUpgrading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <Header user={user} showBackButton={true} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {canceled && (
          <div className="mb-8 p-4 bg-amber-900/40 border border-amber-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-300 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-100">Pago Cancelado</h3>
              <p className="text-amber-100/80 text-sm">
                Tu pago fue cancelado. Intenta de nuevo cuando estés listo para
                actualizar tu plan.
              </p>
            </div>
          </div>
        )}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Actualizar a Plan Pro
          </h1>
          <p className="text-xl text-slate-200">
            Desbloquea funciones ilimitadas y lleva tu negocio al siguiente
            nivel
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-slate-900/80 rounded-2xl shadow-2xl p-8 border-2 border-slate-700 backdrop-blur">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Plan Gratuito
              </h3>
              <p className="text-slate-300">Tu plan actual</p>
              <div className="mt-4">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-slate-300">/mes</span>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">Hasta 100 productos</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">
                  Seguimiento básico de inventario
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">
                  Reportes de ventas diarios
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">1 cuenta de usuario</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">Soporte comunitario</span>
              </li>
            </ul>

            <div className="mt-8">
              <button
                disabled
                className="w-full py-3 bg-slate-800 text-slate-500 rounded-lg font-semibold cursor-not-allowed"
              >
                Plan Actual
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 rounded-2xl shadow-2xl p-8 border-2 border-purple-400 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                RECOMENDADO
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Plan Pro</h3>
              <p className="text-blue-100">Todo lo que necesitas para crecer</p>
              <div className="mt-4">
                <span className="text-5xl font-bold text-white">AR$24.990</span>
                <span className="text-blue-100">/mes</span>
                <p className="text-blue-100 text-sm mt-1">
                  Paga en ARS con Mercado Pago o en USD con Stripe
                </p>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">
                  Productos ilimitados
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">
                  Gestión avanzada de inventario
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">
                  Análisis y reportes en tiempo real
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">
                  Cuentas de usuario ilimitadas
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">
                  Soporte prioritario
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">
                  Integraciones personalizadas
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">
                  Reportes avanzados
                </span>
              </li>
            </ul>

            <div className="space-y-3">
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {upgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Pagar con Stripe</span>
                  </>
                )}
              </button>

              <button
                onClick={handleUpgradeMercadoPago}
                disabled={mpUpgrading}
                className="w-full py-3 bg-[#00a650] text-white rounded-lg font-bold hover:bg-[#009444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {mpUpgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Abriendo Mercado Pago...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pagar con Mercado Pago</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-blue-100">
                El plan Pro se activa automáticamente cuando el pago se
                confirma.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-slate-900/80 rounded-xl p-6 shadow-xl border border-slate-800">
            <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-300" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Escala Tu Negocio
            </h3>
            <p className="text-slate-200">
              Sin límites en productos, ventas o usuarios. Crece sin
              restricciones.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 shadow-xl border border-slate-800">
            <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-300" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Soporte Prioritario
            </h3>
            <p className="text-slate-200">
              Obtén ayuda cuando la necesites con nuestro equipo de soporte
              dedicado.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 shadow-xl border border-slate-800">
            <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-300" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Gestión de Equipo
            </h3>
            <p className="text-slate-200">
              Añade miembros ilimitados con permisos basados en roles.
            </p>
          </div>
        </div>

        {/* Payment Security */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-slate-200 bg-slate-900/80 px-6 py-3 rounded-full shadow border border-slate-800">
            <CreditCard className="w-5 h-5" />
            <span className="text-sm font-medium">
              Pagos seguros con Stripe o Mercado Pago
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
