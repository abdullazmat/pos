"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Zap, Calendar, Check } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useBusinessDateTime } from "@/lib/hooks/useBusinessDateTime";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<{ dueSoon: number; overdue: number }>({
    dueSoon: 0,
    overdue: 0,
  });
  const router = useRouter();
  const { subscription } = useSubscription();
  const { t } = useLanguage();
  const { formatDate } = useBusinessDateTime();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setLoading(false);
      router.push("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;
      if (!parsedUser?.id || !parsedUser?.email) {
        localStorage.removeItem("user");
        setLoading(false);
        router.push("/auth/login");
        return;
      }
      setUser(parsedUser);
    } catch {
      localStorage.removeItem("user");
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const response = await fetch("/api/supplier-documents?alerts=true", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setAlerts({
          dueSoon: data?.alerts?.dueSoon || 0,
          overdue: data?.alerts?.overdue || 0,
        });
      } catch (error) {
        console.error("Failed to load due date alerts", error);
      }
    };

    void loadAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[hsl(var(--vp-muted))]">
        Cargando...
      </div>
    );
  }

  const isPremium = subscription?.isPremium || false;
  const planName =
    subscription?.planId === "PROFESSIONAL"
      ? String(t("planProfessional", "dashboard"))
      : subscription?.planId === "ENTERPRISE"
        ? String(t("planEnterprise", "dashboard"))
        : String(t("planBasic", "dashboard"));

  const nextRenewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;
  const nextRenewalLabel = nextRenewalDate
    ? Number.isNaN(nextRenewalDate.getTime())
      ? "N/A"
      : formatDate(nextRenewalDate)
    : "N/A";

  return (
    <div className="min-h-screen bg-[hsl(var(--vp-bg))] text-[hsl(var(--vp-text))]">
      <Header user={user} showBackButton={false} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[hsl(var(--vp-text))]">
              {String(t("welcome", "dashboard"))}, {user?.fullName}!
            </h2>
            <p className="text-[hsl(var(--vp-muted))] mt-1">
              {String(t("currentPlan", "dashboard"))}:{" "}
              <span className="font-semibold text-[hsl(var(--vp-primary))]">
                {planName}
              </span>
            </p>
          </div>
          {!isPremium && (
            <Link
              href="/upgrade"
              className="vp-button vp-button-primary px-6 shadow-[0_16px_32px_rgba(15,23,42,0.2)] flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              <span>{String(t("upgradeToPro", "dashboard"))}</span>
            </Link>
          )}
        </div>

        {/* Subscription Info Card */}
        {subscription && (
          <div
            className={`vp-panel mb-8 border-l-4 ${
              isPremium
                ? "border-[hsl(var(--vp-primary))]"
                : "border-[hsl(var(--vp-border))]"
            }`}
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-[hsl(var(--vp-muted))]">
                  {String(t("currentPlan", "dashboard"))}
                </p>
                <p className="text-xl font-bold text-[hsl(var(--vp-text))]">
                  {planName}
                </p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--vp-muted))]">
                  {String(t("status", "dashboard"))}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Check className="w-5 h-5 text-[hsl(var(--vp-primary))]" />
                  <p className="font-bold capitalize text-[hsl(var(--vp-text))]">
                    {subscription.status}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--vp-muted))]">
                  {String(t("nextRenewal", "dashboard"))}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-5 h-5 text-[hsl(var(--vp-muted))]" />
                  <p className="font-bold text-[hsl(var(--vp-text))]">
                    {nextRenewalLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link href="/pos" className="vp-card vp-card-hover p-6">
            <h3 className="text-2xl font-bold mb-2 text-[hsl(var(--vp-primary))]">
              ⚡
            </h3>
            <h4 className="text-lg font-semibold text-[hsl(var(--vp-text))]">
              {String(t("posSale", "dashboard"))}
            </h4>
            <p className="text-sm text-[hsl(var(--vp-muted))]">
              {String(t("cashRegister", "dashboard"))}
            </p>
          </Link>

          <Link href="/products" className="vp-card vp-card-hover p-6">
            <h3 className="text-2xl font-bold mb-2 text-[hsl(var(--vp-primary))]">
              📦
            </h3>
            <h4 className="text-lg font-semibold text-[hsl(var(--vp-text))]">
              {String(t("products", "dashboard"))}
            </h4>
            <p className="text-sm text-[hsl(var(--vp-muted))]">
              {String(t("inventory", "dashboard"))}
            </p>
          </Link>

          <Link href="/reports" className="vp-card vp-card-hover p-6">
            <h3 className="text-2xl font-bold mb-2 text-[hsl(var(--vp-primary))]">
              📊
            </h3>
            <h4 className="text-lg font-semibold text-[hsl(var(--vp-text))]">
              {String(t("reports", "dashboard"))}
            </h4>
            <p className="text-sm text-[hsl(var(--vp-muted))]">
              {String(t("analytics", "dashboard"))}
            </p>
          </Link>

          {user?.role === "admin" && (
            <Link href="/admin" className="vp-card vp-card-hover p-6">
              <h3 className="text-2xl font-bold mb-2 text-[hsl(var(--vp-primary))]">
                ⚙️
              </h3>
              <h4 className="text-lg font-semibold text-[hsl(var(--vp-text))]">
                {String(t("admin", "dashboard"))}
              </h4>
              <p className="text-sm text-[hsl(var(--vp-muted))]">
                {String(t("systemSettings", "dashboard"))}
              </p>
            </Link>
          )}
        </div>

        <div className="mt-10 vp-card p-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--vp-text))] mb-3">
            Supplier Due Date Alerts
          </h3>
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm">
              Due soon: {alerts.dueSoon}
            </div>
            <div className="px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm">
              Overdue: {alerts.overdue}
            </div>
          </div>
        </div>

        <div className="mt-12 vp-card p-6">
          <h3 className="text-xl font-bold text-[hsl(var(--vp-text))] mb-4">
            {String(t("quickStats", "dashboard"))}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[hsl(var(--vp-primary))]">
                0
              </p>
              <p className="text-[hsl(var(--vp-muted))]">
                {String(t("salesToday", "dashboard"))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[hsl(var(--vp-primary))]">
                0
              </p>
              <p className="text-[hsl(var(--vp-muted))]">
                {String(t("totalRevenue", "dashboard"))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[hsl(var(--vp-primary))]">
                0
              </p>
              <p className="text-[hsl(var(--vp-muted))]">
                {String(t("products", "dashboard"))}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
