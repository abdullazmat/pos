"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function BusinessConfigPage() {
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
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="p-6 mb-6 text-white shadow rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
              🏢
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                Configuración del Negocio
              </h1>
              <p className="text-sm text-white/80">
                Personaliza la información que aparece en tus tickets
              </p>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {/* Logo del Negocio */}
            <section className="bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Logo del Negocio</h2>
                <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                  Premium
                </span>
              </div>
              <div className="p-5">
                <div className="p-6 text-center border-2 border-purple-200 rounded-xl bg-purple-50">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-purple-700 bg-purple-100 rounded-xl">
                    👑
                  </div>
                  <h3 className="font-semibold text-purple-800">
                    Función Premium
                  </h3>
                  <p className="mt-1 text-sm text-purple-700">
                    Personaliza tu ticket con el logo de tu negocio
                  </p>
                  <p className="mt-2 text-xs text-purple-600">
                    Disponible en Plan Profesional y superior
                  </p>
                </div>
              </div>
            </section>

            {/* Plan de Suscripción */}
            <section className="bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Plan de Suscripción</h2>
              </div>

              <div className="p-5">
                <div className="p-5 border-2 border-purple-200 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Básico</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          Plan Actual
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Ideal para kioscos y negocios pequeños que están
                        empezando
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full">
                          500 productos
                        </span>
                        <span className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full">
                          2 usuarios
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">$9.990</div>
                      <div className="text-xs text-gray-500">/mes</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div>
            <section className="bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center gap-2 p-4 border-b">
                <span className="font-semibold">Vista Previa del Ticket</span>
              </div>
              <div className="flex items-start justify-center p-6">
                {/* Ticket */}
                <div className="w-[320px] bg-white border rounded-xl shadow-sm">
                  <div className="p-6 text-center">
                    {/* Logo placeholder */}
                    <div className="flex items-center justify-center w-12 h-12 mx-auto text-yellow-700 bg-yellow-100 rounded-full">
                      🍔
                    </div>
                    <h3 className="mt-3 font-bold">LO DE JUAN</h3>
                    <p className="text-xs text-gray-600">ca</p>
                    <p className="text-xs text-gray-600">Tel: 534353</p>
                    <p className="text-xs text-gray-600">t.l33n@gm@il.com</p>
                    <p className="text-xs text-gray-600">www.tinegocio.com</p>
                    <p className="text-xs text-gray-600">CUIT: 230945388</p>

                    <div className="my-3 border-t" />

                    <div className="space-y-1 text-xs text-left text-gray-700">
                      <div className="flex justify-between">
                        <span>TICKET:</span>
                        <span>#001-00123</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FECHA:</span>
                        <span>7/12/2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HORA:</span>
                        <span>08:15 p.m.</span>
                      </div>
                    </div>

                    <div className="my-3 border-t" />

                    <div className="space-y-2 text-xs text-left text-gray-800">
                      <div>
                        <div className="flex justify-between">
                          <span>Coca Cola 1.5L</span>
                          <span>$3000.00</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>2 x $1500.00</span>
                          <span>$3000.00</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <span>Pan Lactal</span>
                          <span>$850.00</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>1 x $850.00</span>
                          <span>$850.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="my-4 border-t border-dashed" />

                    <div className="flex justify-between text-sm font-bold">
                      <span>TOTAL:</span>
                      <span>$3850.00</span>
                    </div>

                    <div className="mt-4 text-[11px] text-gray-700">
                      ¡GRACIAS POR SU COMPRA! Vuelva pronto
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
