"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { CheckCircle } from "lucide-react";

export default function UpgradeSuccessPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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
  }, [router, mounted]);

  if (!mounted) {
    return null;
  }

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header user={user} showBackButton={false} />

      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-600 mx-auto" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ¡Upgrade Exitoso!
        </h1>

        <p className="text-xl text-gray-600 mb-6">
          Felicidades, tu cuenta ha sido actualizada al plan Pro.
        </p>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Ya tienes acceso a:
          </h2>
          <ul className="space-y-3 text-left mb-8">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Productos ilimitados</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Categorías ilimitadas</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Pagos con Mercado Pago</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Facturación ARCA</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Reportes avanzados</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Múltiples usuarios</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleContinue}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-md hover:shadow-lg"
        >
          Continuar al Dashboard
        </button>

        <p className="text-sm text-gray-600 mt-8">
          Tu suscripción se renovará automáticamente cada mes.
          <br />
          Puedes cambiar o cancelar tu suscripción en cualquier momento.
        </p>
      </main>
    </div>
  );
}
