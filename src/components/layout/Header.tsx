"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { apiFetch } from "@/lib/utils/apiFetch";
import BrandLogo from "@/components/BrandLogo";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileText,
  LogOut,
  Moon,
  Package,
  Receipt,
  Shield,
  ShoppingCart,
  Store,
  Sun,
  Tag,
  TrendingUp,
  Truck,
  User,
  UserCog,
  Users,
  XCircle,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/lib/hooks/useLang";
import { useSubscription } from "@/lib/hooks/useSubscription";

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [cashRegister, setCashRegister] = useState<{
    isOpen: boolean;
    expected: number;
  } | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const languageButtonRef = useRef<HTMLButtonElement | null>(null);
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { subscription } = useSubscription();
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

  // Only admin can access these sections
  const adminOnlyRoutes = [
    "/clients",
    "/expenses",
    "/expense-analytics",
    "/reports",
    "/reportes-fiscales",
    "/admin",
    "/business-config",
    "/plan-comparison",
  ];

  const cashierNavItems = [
    { href: "/pos", label: t("nav.posSale", "pos"), icon: ShoppingCart },
    {
      href: "/cash-register",
      label: t("nav.cashRegister", "pos"),
      icon: DollarSign,
    },
    { href: "/sales", label: t("nav.sales", "pos"), icon: Receipt },
  ];

  const supervisorNavItems = [
    { href: "/pos", label: t("nav.posSale", "pos"), icon: ShoppingCart },
    {
      href: "/cash-register",
      label: t("nav.cashRegister", "pos"),
      icon: DollarSign,
    },
    { href: "/sales", label: t("nav.sales", "pos"), icon: Receipt },
    { href: "/products", label: t("nav.products", "pos"), icon: Package },
    { href: "/categories", label: t("nav.categories", "pos"), icon: Tag },
    { href: "/stock", label: t("nav.stock", "pos"), icon: Package },
    { href: "/suppliers", label: t("nav.suppliers", "pos"), icon: Truck },
    {
      href: "/goods-receipts",
      label: t("nav.goodsReceipts", "pos"),
      icon: ClipboardList,
    },
    {
      href: "/supplier-returns",
      label: t("nav.supplierReturns", "pos"),
      icon: Truck,
    },
    {
      href: "/supplier-documents",
      label: t("nav.supplierDocuments", "pos"),
      icon: FileText,
    },
    {
      href: "/payment-orders",
      label: t("nav.paymentOrders", "pos"),
      icon: Receipt,
    },
    {
      href: "/purchase-orders",
      label: t("nav.purchaseOrders", "pos"),
      icon: ShoppingCart,
    },
  ];

  const adminNavItems = [
    ...supervisorNavItems,
    { href: "/clients", label: t("nav.clients", "pos"), icon: Users },
    { href: "/expenses", label: t("nav.expenses", "pos"), icon: Receipt },
    {
      href: "/expense-analytics",
      label: t("nav.expenseAnalytics", "pos"),
      icon: TrendingUp,
    },
    { href: "/reports", label: t("nav.reports", "pos"), icon: BarChart3 },
    {
      href: "/reportes-fiscales",
      label: t("nav.fiscalReports", "pos"),
      icon: FileText,
    },
    { href: "/admin", label: t("nav.users", "pos"), icon: UserCog },
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

  const navItems =
    user?.role === "admin"
      ? adminNavItems
      : user?.role === "supervisor"
        ? supervisorNavItems
        : cashierNavItems;

  const isActive = (href: string) => pathname === href;

  const planId = (subscription?.planId || "BASIC").toUpperCase();
  const planStatus = subscription?.status || "active";
  const planLabelMap: Record<string, Record<string, string>> = {
    es: {
      BASIC: "Gratuito",
      ESENCIAL: "Esencial",
      PROFESIONAL: "Pro",
      CRECIMIENTO: "Empresarial",
    },
    en: {
      BASIC: "Free",
      ESENCIAL: "Essential",
      PROFESIONAL: "Pro",
      CRECIMIENTO: "Enterprise",
    },
    pt: {
      BASIC: "Gratuito",
      ESENCIAL: "Essencial",
      PROFESIONAL: "Pro",
      CRECIMIENTO: "Empresarial",
    },
  };
  const planInfo = {
    plan:
      planLabelMap[currentLanguage]?.[planId] ||
      planLabelMap.en[planId] ||
      "Free",
    status: planStatus,
  };

  const languageLabelMap: Record<"es" | "en" | "pt", string> = {
    es: String(t("spanish", "common")),
    en: String(t("english", "common")),
    pt: String(t("portuguese", "common")),
  };
  const languageShortMap: Record<"es" | "en" | "pt", string> = {
    es: "ES",
    en: "EN",
    pt: "PT",
  };
  const resolvedLanguageShort = languageShortMap[currentLanguage] || "EN";

  const getRoleLabel = () => {
    const roleKey = String(user?.role || "user").toLowerCase();
    const roleMap: Record<string, string> = {
      admin: t("roles.admin", "pos"),
      supervisor: t("roles.supervisor", "pos"),
      cashier: t("roles.cashier", "pos"),
      user: t("roles.user", "pos"),
    };

    const resolved = roleMap[roleKey] || roleMap.user;
    if (resolved === `roles.${roleKey}` || resolved === "roles.user") {
      return roleKey.charAt(0).toUpperCase() + roleKey.slice(1);
    }

    return resolved;
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
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
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
    <nav
      className={`sticky top-0 z-40 border-b border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-surface))]/80 backdrop-blur-xl vp-navbar ${
        isScrolled ? "is-scrolled" : ""
      }`}
    >
      <div className="border-b border-[hsl(var(--vp-border))] bg-transparent">
        <div className="px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="group">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <BrandLogo
                    size="lg"
                    className="group-hover:scale-105 transition"
                  />
                  <span
                    className={`vp-pill ${
                      planInfo.plan === "Pro"
                        ? "bg-[hsl(var(--vp-primary)/0.12)] text-[hsl(var(--vp-primary))]"
                        : "bg-[hsl(var(--vp-muted)/0.18)] text-[hsl(var(--vp-muted))]"
                    }`}
                  >
                    {planInfo.plan}
                  </span>
                </div>
                <p className="text-xs text-[hsl(var(--vp-muted))]">
                  {String(t("header.tagline", "pos"))}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {cashRegister?.isOpen && (
                <div className="items-center hidden gap-2 px-4 py-2 border rounded-lg md:flex border-emerald-200/60 bg-emerald-50/70 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300">
                  <span className="text-sm font-medium">
                    {String(t("header.cashRegisterOpen", "pos"))} - $
                    {cashRegister.expected.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Language Selector */}
              <div className="relative" ref={languageMenuRef}>
                <button
                  ref={languageButtonRef}
                  onClick={() => setShowLanguageMenu((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-full border border-[hsl(var(--vp-border-soft))] text-[hsl(var(--vp-muted))] hover:text-[hsl(var(--vp-text))] hover:bg-[hsl(var(--vp-bg-hover))]"
                  title={t("language", "common")}
                >
                  <Globe className="w-4 h-4" />
                  <span className="uppercase">{resolvedLanguageShort}</span>
                </button>
                <div
                  className={`absolute right-0 top-full mt-2 w-48 rounded-xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-surface))] shadow-lg transition-all duration-200 ease-out z-50 ${
                    showLanguageMenu
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="p-2 space-y-1">
                    {(["es", "en", "pt"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang as "es" | "en" | "pt");
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentLanguage === lang
                            ? "bg-[hsl(var(--vp-primary)/0.12)] text-[hsl(var(--vp-primary))]"
                            : "text-[hsl(var(--vp-text))] hover:bg-[hsl(var(--vp-bg-hover))]"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-7 h-6 rounded-md bg-[hsl(var(--vp-bg-soft))] text-xs font-semibold text-[hsl(var(--vp-muted))]">
                            {languageShortMap[lang]}
                          </span>
                          <span>{languageLabelMap[lang]}</span>
                        </span>
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
                  className="vp-button vp-button-ghost"
                  title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="w-5 h-5 text-[hsl(var(--vp-muted))]" />
                  ) : (
                    <Moon className="w-5 h-5 text-[hsl(var(--vp-muted))]" />
                  )}
                </button>
              )}

              {user && (
                <div
                  className="relative flex items-center gap-2 p-2 transition-colors rounded-lg hover:bg-[hsl(var(--vp-bg-hover))]"
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
                  <div className="p-2 rounded-full bg-[hsl(var(--vp-primary)/0.12)] text-[hsl(var(--vp-primary))]">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                      {user.fullName || "Usuario"}
                    </p>
                    <p className="text-xs capitalize text-[hsl(var(--vp-muted))]">
                      {roleLabel}
                    </p>
                  </div>

                  <div
                    className={`absolute right-0 top-full mt-2 w-72 rounded-xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-surface))] shadow-xl transition-all duration-200 ease-out ${
                      showUserCard
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[hsl(var(--vp-primary)/0.12)] text-[hsl(var(--vp-primary))]">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                            {user.fullName || "Usuario"}
                          </p>
                          <p className="text-xs capitalize text-[hsl(var(--vp-muted))]">
                            {roleLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[hsl(var(--vp-primary)/0.12)] text-[hsl(var(--vp-primary))]">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[hsl(var(--vp-muted))]">
                            {t("status", "common")}
                          </p>
                          <p className="text-sm font-medium capitalize text-[hsl(var(--vp-text))]">
                            {roleLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[hsl(var(--vp-primary)/0.12)] text-[hsl(var(--vp-primary))]">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[hsl(var(--vp-muted))]">
                            {t("pricing", "common")}
                          </p>
                          <p className="text-sm font-medium text-[hsl(var(--vp-text))]">
                            {planInfo.plan}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            planInfo.status?.toLowerCase() === "active"
                              ? "bg-emerald-100/70 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-rose-100/70 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                          }`}
                        >
                          {planInfo.status?.toLowerCase() === "active" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[hsl(var(--vp-muted))]">
                            {t("status", "common")}
                          </p>
                          <p className="text-sm font-medium text-[hsl(var(--vp-text))]">
                            {planInfo.status}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Link
                          href="/profile"
                          className="text-xs font-semibold text-[hsl(var(--vp-primary))] hover:text-[hsl(var(--vp-primary-strong))]"
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
                className="p-2 transition-colors rounded-full text-[hsl(var(--vp-muted))] hover:text-red-600 hover:bg-red-50/70 dark:hover:bg-red-900/20"
                title={t("logout", "common")}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-b border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-surface))]">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
                    active
                      ? "vp-tab vp-tab-active bg-[hsl(var(--vp-primary)/0.08)]"
                      : "vp-tab hover:text-[hsl(var(--vp-text))] hover:bg-[hsl(var(--vp-bg-hover))]"
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
