"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { Crown, Star } from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface Plan {
  id: string; // "FREE" | "PRO"
  name: string;
  price: number;
  billing: string;
  popular?: boolean;
}

interface Subscription {
  planId: string; // "FREE" | "PRO" | others
}

export default function PlanComparisonPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchPlans();
    fetchSubscription();
  }, [router]);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.data.plans || []);
      }
    } catch (e) {
      console.error("fetch plans", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.data.subscription);
      }
    } catch (e) {
      console.error("fetch subscription", e);
    }
  };

  const currentPlanName = (() => {
    const plan = plans.find((p) => p.id === subscription?.planId);
    return plan?.name || (subscription?.planId === "PRO" ? "Pro" : "Gratuito");
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-slate-400">Cargando...</div>
      </div>
    );
  }

  // Comparison data based on screenshot
  const limitsRows: { label: string; free: string; pro: string }[] = [
    { label: "Productos", free: "100", pro: "ilimitado" },
    { label: "Usuarios", free: "2", pro: "ilimitado" },
    { label: "Categorías", free: "20", pro: "ilimitado" },
    { label: "Clientes", free: "No disponible", pro: "ilimitado" },
    { label: "Proveedores", free: "5", pro: "ilimitado" },
    { label: "Métodos de Pago", free: "2", pro: "ilimitado" },
    { label: "Descuento Máximo", free: "No disponible", pro: "100%" },
  ];

  const checkRowsPOS: { label: string; free: boolean; pro: boolean }[] = [
    { label: "Sistema POS", free: true, pro: true },
    { label: "Escaneo de Códigos", free: true, pro: true },
    { label: "Productos por Peso", free: true, pro: true },
    { label: "Descuentos", free: false, pro: true },
    { label: "Múltiples Métodos de Pago", free: false, pro: true },
    { label: "Ventas a Crédito/Fiado", free: false, pro: true },
    { label: "Notas en Productos", free: false, pro: true },
  ];

  const checkRowsCaja: { label: string; free: boolean; pro: boolean }[] = [
    { label: "Control de Caja Básico", free: true, pro: true },
    { label: "Retiros de Caja", free: false, pro: true },
    { label: "Auditoría de Caja", free: false, pro: true },
    { label: "Devoluciones", free: true, pro: true },
  ];

  const checkRowsGestion: { label: string; free: boolean; pro: boolean }[] = [
    { label: "Gestión de Stock", free: true, pro: true },
    { label: "Gestión de Clientes", free: false, pro: true },
    { label: "Gestión de Proveedores", free: true, pro: true },
    { label: "Registro de Gastos", free: false, pro: true },
    { label: "Gestión de Usuarios", free: true, pro: true },
    { label: "Importación Excel/CSV", free: false, pro: true },
  ];

  const checkRowsReportes: { label: string; free: boolean; pro: boolean }[] = [
    { label: "Reportes Básicos", free: true, pro: true },
    { label: "Reportes Avanzados", free: false, pro: true },
    { label: "Gráficos y Charts", free: false, pro: true },
    { label: "Exportar Reportes", free: false, pro: true },
  ];

  const checkRowsConfig: { label: string; free: boolean; pro: boolean }[] = [
    { label: "Atajos de Teclado", free: true, pro: true },
    { label: "Configuración del Negocio", free: true, pro: true },
    { label: "Tickets Personalizados", free: false, pro: true },
    { label: "Marca Personalizada", free: false, pro: true },
  ];

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2">
        <h2 className="text-slate-200 font-semibold">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );

  const RowLimits = ({
    label,
    free,
    pro,
  }: {
    label: string;
    free: string;
    pro: string;
  }) => (
    <div className="grid grid-cols-3 px-4 py-3 text-sm border-t border-slate-800/60">
      <div className="text-slate-300">{label}</div>
      <div className="text-center text-slate-200">{free}</div>
      <div className="text-center text-slate-200">{pro}</div>
    </div>
  );

  const RowCheck = ({
    label,
    free,
    pro,
  }: {
    label: string;
    free: boolean;
    pro: boolean;
  }) => (
    <div className="grid grid-cols-3 px-4 py-3 text-sm border-t border-slate-800/60">
      <div className="text-slate-300">{label}</div>
      <div className="text-center">
        {free ? (
          <span className="text-green-400">✓</span>
        ) : (
          <span className="text-slate-500">✕</span>
        )}
      </div>
      <div className="text-center">
        {pro ? (
          <span className="text-green-400">✓</span>
        ) : (
          <span className="text-slate-500">✕</span>
        )}
      </div>
    </div>
  );

  const freePlan = plans.find((p) => p.id === "FREE") || {
    id: "FREE",
    name: "Gratuito",
    price: 0,
    billing: "/mes",
  };
  const proPlan = plans.find((p) => p.id === "PRO") || {
    id: "PRO",
    name: "Pro",
    price: 19990,
    billing: "/mes",
    popular: true,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header user={user} showBackButton />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white text-center">
            Comparación de Planes
          </h1>
          <p className="text-center text-slate-400 mt-1">
            Plan Actual:{" "}
            <span className="text-purple-300 font-semibold">
              {currentPlanName}
            </span>
          </p>
        </div>

        {/* Plans header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Free */}
          <div
            className={`rounded-xl border ${subscription?.planId === "FREE" ? "border-purple-600" : "border-slate-800"} bg-slate-900 p-5`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded">
                FREE
              </span>
            </div>
            <div className="text-white font-semibold">{freePlan.name}</div>
            <div className="mt-1 text-slate-300 text-sm">
              $ {freePlan.price}/mes
            </div>
            <div className="mt-4">
              <button
                className={`w-full py-2 rounded-lg text-sm font-semibold ${subscription?.planId === "FREE" ? "bg-purple-700 text-white" : "bg-slate-800 text-slate-300"}`}
              >
                {subscription?.planId === "FREE"
                  ? "Plan Actual"
                  : "Seleccionar"}
              </button>
            </div>
          </div>

          {/* Pro */}
          <div
            className={`rounded-xl border ${subscription?.planId === "PRO" ? "border-purple-600" : "border-slate-800"} bg-slate-900 p-5`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="px-2 py-0.5 text-xs font-semibold text-yellow-300 bg-yellow-900/40 border border-yellow-700/50 rounded">
                Popular
              </span>
            </div>
            <div className="text-white font-semibold">{proPlan.name}</div>
            <div className="mt-1 text-slate-300 text-sm">
              $ {proPlan.price.toLocaleString()}/mes
            </div>
            <div className="mt-4">
              <Link
                href="/business-config"
                className={`block w-full py-2 rounded-lg text-sm font-semibold ${subscription?.planId === "PRO" ? "bg-purple-700 text-white" : "bg-purple-600 hover:bg-purple-500 text-white"}`}
              >
                {subscription?.planId === "PRO"
                  ? "Plan Actual"
                  : "Click para suscribirse →"}
              </Link>
            </div>
          </div>
        </div>

        {/* Characteristics label */}
        <div className="text-slate-300 mb-2">Características</div>

        {/* Limits */}
        <Section title="Límites">
          <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-900/40">
            <div></div>
            <div className="text-center">Gratuito</div>
            <div className="text-center">Pro</div>
          </div>
          {limitsRows.map((r) => (
            <RowLimits key={r.label} {...r} />
          ))}
        </Section>

        {/* POS */}
        <div className="mt-6">
          <Section title="POS">
            <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-900/40">
              <div></div>
              <div className="text-center">Gratuito</div>
              <div className="text-center">Pro</div>
            </div>
            {checkRowsPOS.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Control de Caja */}
        <div className="mt-6">
          <Section title="Control de Caja">
            <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-900/40">
              <div></div>
              <div className="text-center">Gratuito</div>
              <div className="text-center">Pro</div>
            </div>
            {checkRowsCaja.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Gestión */}
        <div className="mt-6">
          <Section title="Gestión">
            <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-900/40">
              <div></div>
              <div className="text-center">Gratuito</div>
              <div className="text-center">Pro</div>
            </div>
            {checkRowsGestion.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Reportes */}
        <div className="mt-6">
          <Section title="Reportes">
            <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-900/40">
              <div></div>
              <div className="text-center">Gratuito</div>
              <div className="text-center">Pro</div>
            </div>
            {checkRowsReportes.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Configuración */}
        <div className="mt-6">
          <Section title="Configuración">
            <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-900/40">
              <div></div>
              <div className="text-center">Gratuito</div>
              <div className="text-center">Pro</div>
            </div>
            {checkRowsConfig.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-300 text-sm">
            💡 <span className="font-semibold">Leyenda:</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex gap-6">
            <span>✓ Característica disponible</span>
            <span>✕ Característica no disponible</span>
          </div>
        </div>

        {/* Callout */}
        <div className="mt-4 bg-purple-900/30 border border-purple-700/40 rounded-xl p-4 text-sm text-purple-200">
          📦 Cambiar de Plan: Ve a Configuración →{" "}
          <Link href="/business-config" className="underline">
            Configuración del Negocio
          </Link>{" "}
          para cambiar tu plan de suscripción.
        </div>
      </div>
    </div>
  );
}
