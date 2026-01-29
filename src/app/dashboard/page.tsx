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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header user={user} showBackButton={false} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {String(t("welcome", "dashboard"))}, {user?.fullName}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {String(t("currentPlan", "dashboard"))}:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {planName}
              </span>
            </p>
          </div>
          {!isPremium && (
            <Link
              href="/upgrade"
              className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              <span>{String(t("upgradeToPro", "dashboard"))}</span>
            </Link>
          )}
        </div>

        {/* Subscription Info Card */}
        {subscription && (
          <div
            className={`rounded-lg p-6 mb-8 border-l-4 ${
              isPremium
                ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-400"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400"
            }`}
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {String(t("currentPlan", "dashboard"))}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {planName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {String(t("status", "dashboard"))}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Check className="w-5 h-5 text-green-500 dark:text-green-400" />
                  <p className="font-bold capitalize text-gray-900 dark:text-white">
                    {subscription.status}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {String(t("nextRenewal", "dashboard"))}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <p className="font-bold text-gray-900 dark:text-white">
                    {nextRenewalLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link
            href="/pos"
            className="bg-blue-600 dark:bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-lg dark:shadow-blue-600/30"
          >
            <h3 className="text-2xl font-bold mb-2">⚡</h3>
            <h4 className="text-lg font-semibold">
              {String(t("posSale", "dashboard"))}
            </h4>
            <p className="text-sm opacity-90">
              {String(t("cashRegister", "dashboard"))}
            </p>
          </Link>

          <Link
            href="/products"
            className="bg-green-600 dark:bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 dark:hover:bg-green-700 transition-colors shadow-lg dark:shadow-green-600/30"
          >
            <h3 className="text-2xl font-bold mb-2">📦</h3>
            <h4 className="text-lg font-semibold">
              {String(t("products", "dashboard"))}
            </h4>
            <p className="text-sm opacity-90">
              {String(t("inventory", "dashboard"))}
            </p>
          </Link>

          <Link
            href="/reports"
            className="bg-purple-600 dark:bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-700 transition-colors shadow-lg dark:shadow-purple-600/30"
          >
            <h3 className="text-2xl font-bold mb-2">📊</h3>
            <h4 className="text-lg font-semibold">
              {String(t("reports", "dashboard"))}
            </h4>
            <p className="text-sm opacity-90">
              {String(t("analytics", "dashboard"))}
            </p>
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="bg-red-600 dark:bg-red-600 text-white p-6 rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition-colors shadow-lg dark:shadow-red-600/30"
            >
              <h3 className="text-2xl font-bold mb-2">⚙️</h3>
              <h4 className="text-lg font-semibold">
                {String(t("admin", "dashboard"))}
              </h4>
              <p className="text-sm opacity-90">
                {String(t("systemSettings", "dashboard"))}
              </p>
            </Link>
          )}
        </div>

        <div className="mt-12 bg-white dark:bg-slate-900 p-6 rounded-lg shadow dark:shadow-lg dark:shadow-black/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {String(t("quickStats", "dashboard"))}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                0
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {String(t("salesToday", "dashboard"))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                0
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {String(t("totalRevenue", "dashboard"))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                0
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {String(t("products", "dashboard"))}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
