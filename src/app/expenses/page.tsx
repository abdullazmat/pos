"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Receipt, Plus, Trash2, Calendar } from "lucide-react";
import Link from "next/link";

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category?: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  user?: {
    fullName: string;
  };
}

const EXPENSE_COPY = {
  es: {
    premiumBadge: "Premium",
    title: "Gestión de Gastos - Premium",
    description:
      "Controla y registra todos los gastos operacionales de tu negocio",
    primaryCta: "✨ Plan Empresarial",
    secondaryCta: "Actualizar Plan",
  },
  en: {
    premiumBadge: "Premium",
    title: "Expenses Management - Premium",
    description: "Track and log all operational expenses for your business",
    primaryCta: "✨ Business Plan",
    secondaryCta: "Upgrade Plan",
  },
  pt: {
    premiumBadge: "Premium",
    title: "Gestão de Despesas - Premium",
    description:
      "Controle e registre todas as despesas operacionais do seu negócio",
    primaryCta: "✨ Plano Empresarial",
    secondaryCta: "Atualizar Plano",
  },
} as const;

export default function ExpensesPage() {
  const { t } = useGlobalLanguage();
  const { currentLanguage } = useGlobalLanguage();
  const router = useRouter();
  const copy = (EXPENSE_COPY[currentLanguage] ||
    EXPENSE_COPY.en) as typeof EXPENSE_COPY.en;
  const { subscription, loading: subLoading } = useSubscription();
  const [user, setUser] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    paymentMethod: "cash",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    fetchExpenses();
  }, [router]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        fetchExpenses();
        setShowForm(false);
        setFormData({
          description: "",
          amount: "",
          category: "",
          paymentMethod: "cash",
          notes: "",
          date: new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDeleteExpense", "errors"))) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <Header user={user} showBackButton />

      <main className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full bg-white dark:bg-slate-900/90 border border-amber-200 dark:border-amber-500/50 border-dashed rounded-2xl p-10 shadow-xl dark:shadow-2xl">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-400/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Receipt className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold uppercase tracking-wide">
                {copy.premiumBadge}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {copy.title}
              </h1>
              <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base">
                {copy.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
              <Link
                href="/plan-comparison"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
              >
                {copy.primaryCta}
              </Link>
              <Link
                href="/upgrade"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold bg-amber-600 text-white hover:bg-amber-500 transition-colors border border-amber-500/70"
              >
                {copy.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
