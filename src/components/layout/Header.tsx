"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Keyboard,
  LogOut,
  Package,
  Receipt,
  Shield,
  ShoppingCart,
  Store,
  Tag,
  Truck,
  User,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";

interface HeaderProps {
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    role?: string;
  } | null;
  showBackButton?: boolean;
}

export default function Header({ user, showBackButton = false }: HeaderProps) {
  const [showUserCard, setShowUserCard] = useState(false);
  const [cashRegister, setCashRegister] = useState<{
    isOpen: boolean;
    expected: number;
  } | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setShowUserCard(false);
    router.push("/");
  };

  const navItems = [
    { href: "/pos", label: "Punto de Venta", icon: ShoppingCart },
    { href: "/cash-register", label: "Control de Caja", icon: DollarSign },
    { href: "/products", label: "Productos", icon: Package },
    { href: "/categories", label: "Categorías", icon: Tag },
    { href: "/stock", label: "Stock", icon: Package },
    { href: "/clients", label: "Clientes", icon: Users },
    { href: "/suppliers", label: "Proveedores", icon: Truck },
    { href: "/expenses", label: "Gastos", icon: Receipt },
    { href: "/reports", label: "Reportes", icon: BarChart3 },
    { href: "/admin", label: "Usuarios", icon: UserCog },
    {
      href: "/keyboard-config",
      label: "Configuración de Teclas",
      icon: Keyboard,
    },
    {
      href: "/business-config",
      label: "Configuración de Negocio",
      icon: Store,
    },
    {
      href: "/plan-comparison",
      label: "Comparación de Planes",
      icon: CreditCard,
    },
  ];

  const isActive = (href: string) => pathname === href;

  const getPlanInfo = () => {
    try {
      const businessStr = localStorage.getItem("business");
      if (businessStr) {
        const business = JSON.parse(businessStr);
        return {
          plan: business.plan || "Free",
          status: business.subscriptionStatus || "Active",
        };
      }
    } catch {
      return { plan: "Free", status: "Active" };
    }
    return { plan: "Free", status: "Active" };
  };

  const planInfo = getPlanInfo();

  const roleLabel =
    (user?.role === "admin" && "Administrador") ||
    (user?.role === "supervisor" && "Supervisor") ||
    (user?.role === "cashier" && "Cajero") ||
    user?.role ||
    "Usuario";

  useEffect(() => {
    const fetchCashRegister = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch("/api/cash-register", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setCashRegister({
              isOpen: data.data.isOpen,
              expected: data.data.expected || 0,
            });
          }
        }
      } catch {
        // ignore errors
      }
    };

    fetchCashRegister();
    const interval = setInterval(fetchCashRegister, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-slate-950 shadow-md dark:shadow-lg dark:shadow-black/50">
      <div className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
        <div className="px-4 py-3 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Sistema POS
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      planInfo.plan === "Pro"
                        ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                        : "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                    }`}
                  >
                    {planInfo.plan === "Pro" ? "Pro" : "Gratuito"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Punto de Venta en la Nube
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {cashRegister?.isOpen && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-2 rounded-lg hidden md:flex items-center gap-2">
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Caja Abierta - ${cashRegister.expected.toFixed(2)}
                  </span>
                </div>
              )}

              {user && (
                <div
                  className="relative flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                  onMouseEnter={() => setShowUserCard(true)}
                  onMouseLeave={() => {
                    setShowUserCard(false);
                  }}
                  onFocus={() => setShowUserCard(true)}
                  onBlur={() => {
                    setShowUserCard(false);
                  }}
                  tabIndex={0}
                >
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user.fullName || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {roleLabel}
                    </p>
                  </div>

                  <div
                    className={`absolute right-0 top-full mt-2 w-72 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl dark:shadow-2xl dark:shadow-black/50 transition-all duration-200 ease-out ${
                      showUserCard
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user.fullName || "Usuario"}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                            {roleLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-full">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Rol
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {roleLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-full">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Plan de Suscripción
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {planInfo.plan}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            planInfo.status?.toLowerCase() === "active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {planInfo.status?.toLowerCase() === "active" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Estado de Suscripción
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {planInfo.status}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Link
                          href="/profile"
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          onClick={() => setShowUserCard(false)}
                        >
                          Editar perfil
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    active
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
