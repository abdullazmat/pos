"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { apiFetch } from "@/lib/utils/apiFetch";
import {
  BarChart3,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  Keyboard,
  LogOut,
  Moon,
  Package,
  Receipt,
  Shield,
  ShoppingCart,
  Store,
  Sun,
  Tag,
  Truck,
  User,
  UserCog,
  Users,
  XCircle,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/lib/hooks/useLang";

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
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [cashRegister, setCashRegister] = useState<{
    isOpen: boolean;
    expected: number;
  } | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const languageButtonRef = useRef<HTMLButtonElement | null>(null);
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
    { href: "/pos", label: t("nav.posSale", "pos"), icon: ShoppingCart },
    {
      href: "/cash-register",
      label: t("nav.cashRegister", "pos"),
      icon: DollarSign,
    },
    { href: "/products", label: t("nav.products", "pos"), icon: Package },
    { href: "/categories", label: t("nav.categories", "pos"), icon: Tag },
    { href: "/stock", label: t("nav.stock", "pos"), icon: Package },
    { href: "/clients", label: t("nav.clients", "pos"), icon: Users },
    { href: "/suppliers", label: t("nav.suppliers", "pos"), icon: Truck },
    { href: "/expenses", label: t("nav.expenses", "pos"), icon: Receipt },
    { href: "/reports", label: t("nav.reports", "pos"), icon: BarChart3 },
    {
      href: "/reportes-fiscales",
      label: t("nav.fiscalReports", "pos"),
      icon: FileText,
    },
    { href: "/admin", label: t("nav.users", "pos"), icon: UserCog },
    {
      href: "/keyboard-config",
      label: t("nav.keyboardConfig", "pos"),
      icon: Keyboard,
    },
    {
      href: "/business-config",
      label: t("nav.businessConfig", "pos"),
      icon: Store,
    },
    {
      href: "/plan-comparison",
      label: t("nav.planComparison", "pos"),
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

  const getRoleLabel = () => {
    if (user?.role === "admin") return "Administrador";
    if (user?.role === "supervisor") return "Supervisor";
    if (user?.role === "cashier") return "Cajero";
    return user?.role || "Usuario";
  };

  const roleLabel = getRoleLabel();

  useEffect(() => {
    if (!showLanguageMenu) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const isInsideMenu = languageMenuRef.current?.contains(target);
      const isButton = languageButtonRef.current?.contains(target);
      if (!isInsideMenu && !isButton) {
        setShowLanguageMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLanguageMenu]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCashRegister = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await apiFetch("/api/cash-register");
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

              {/* Language Selector */}
              <div className="relative" ref={languageMenuRef}>
                <button
                  ref={languageButtonRef}
                  onClick={() => setShowLanguageMenu((prev) => !prev)}
                  className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                  title={t("language", "common")}
                >
                  <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">
                    {currentLanguage}
                  </span>
                </button>
                <div
                  className={`absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg dark:shadow-2xl dark:shadow-black/50 transition-all duration-200 ease-out z-50 ${
                    showLanguageMenu
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="p-2 space-y-1">
                    {["es", "en", "pt"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang as "es" | "en" | "pt");
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentLanguage === lang
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {lang === "es" && "🇪🇸 Español"}
                        {lang === "en" && "🇺🇸 English"}
                        {lang === "pt" && "🇵🇹 Português"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
                  title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
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
                            {t("status", "common")}
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
                            {t("pricing", "common")}
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
                            {t("status", "common")}
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
                          {t("settings", "common")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                title={t("logout", "common")}
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
