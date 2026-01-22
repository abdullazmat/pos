"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function PlanComparisonPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showBackButton />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Comparación de Planes
          </h1>
          <p className="text-sm text-gray-600">
            Plan Actual:{" "}
            <span className="font-semibold text-purple-600">Básico</span>
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Básico Plan */}
          <div className="bg-white border-2 border-purple-500 rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-3">👑</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Básico</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-purple-600">
                  $9.990
                </span>
                <span className="text-sm text-gray-500">/mes</span>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all">
                Plan Actual
              </button>
            </div>
          </div>

          {/* Profesional Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Profesional
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-purple-600">
                  $24.990
                </span>
                <span className="text-sm text-gray-500">/mes</span>
              </div>
              <Link
                href="/upgrade"
                className="w-full inline-block bg-white border-2 border-purple-600 text-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all text-center"
              >
                Actualizar
              </Link>
            </div>
          </div>

          {/* Empresarial Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Empresarial
              </h3>
              <div className="mb-4">
                <span className="text-lg font-semibold text-purple-600">
                  Contacta a Ventas
                </span>
              </div>
              <button className="w-full bg-white border-2 border-purple-600 text-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all mt-5">
                Contactar
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-purple-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-purple-600">🔒</span>
              <h2 className="text-lg font-bold text-gray-900">Límites</h2>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {/* Productos */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50">
              <div className="font-medium text-gray-900">Productos</div>
              <div className="text-center text-gray-700">500</div>
              <div className="text-center text-gray-700">5,000</div>
              <div className="text-center text-gray-700">ilimitado</div>
            </div>

            {/* Usuarios */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50">
              <div className="font-medium text-gray-900">Usuarios</div>
              <div className="text-center text-gray-700">2</div>
              <div className="text-center text-gray-700">5</div>
              <div className="text-center text-gray-700">ilimitado</div>
            </div>

            {/* Categorías */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50">
              <div className="font-medium text-gray-900">Categorías</div>
              <div className="text-center text-gray-700">50</div>
              <div className="text-center text-gray-700">200</div>
              <div className="text-center text-gray-700">ilimitado</div>
            </div>

            {/* Clientes */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50">
              <div className="font-medium text-gray-900">Clientes</div>
              <div className="text-center text-gray-400">No disponible</div>
              <div className="text-center text-gray-700">100</div>
              <div className="text-center text-gray-700">ilimitado</div>
            </div>

            {/* Proveedores */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50">
              <div className="font-medium text-gray-900">Proveedores</div>
              <div className="text-center text-gray-700">10</div>
              <div className="text-center text-gray-700">100</div>
              <div className="text-center text-gray-700">ilimitado</div>
            </div>

            {/* Métodos de Pago */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50">
              <div className="font-medium text-gray-900">Métodos de Pago</div>
              <div className="text-center text-gray-700">2</div>
              <div className="text-center text-gray-700">6</div>
              <div className="text-center text-gray-700">ilimitado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
