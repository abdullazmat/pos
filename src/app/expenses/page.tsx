"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Receipt, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "react-toastify";
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
    labels: {
      newExpense: "Nuevo Gasto",
      expenses: "Gastos",
      total: "Total",
      description: "Descripción",
      category: "Categoría",
      amount: "Monto",
      paymentMethod: "Método de pago",
      date: "Fecha",
      notes: "Notas",
      actions: "Acciones",
      noData: "No hay gastos aún",
      loading: "Cargando...",
      confirmDelete: "¿Eliminar este gasto?",
    },
    toasts: {
      loadError: "Error al cargar gastos",
      saveError: "Error al guardar gasto",
      deleteError: "Error al eliminar gasto",
      saved: "Gasto guardado",
      deleted: "Gasto eliminado",
    },
    buttons: {
      cancel: "Cancelar",
      save: "Guardar",
    },
  },
  en: {
    premiumBadge: "Premium",
    title: "Expenses Management - Premium",
    description: "Track and log all operational expenses for your business",
    primaryCta: "✨ Business Plan",
    secondaryCta: "Upgrade Plan",
    labels: {
      newExpense: "New Expense",
      expenses: "Expenses",
      total: "Total",
      description: "Description",
      category: "Category",
      amount: "Amount",
      paymentMethod: "Payment Method",
      date: "Date",
      notes: "Notes",
      actions: "Actions",
      noData: "No expenses yet",
      loading: "Loading...",
      confirmDelete: "Delete this expense?",
    },
    toasts: {
      loadError: "Failed to load expenses",
      saveError: "Failed to save expense",
      deleteError: "Failed to delete expense",
      saved: "Expense saved",
      deleted: "Expense deleted",
    },
    buttons: {
      cancel: "Cancel",
      save: "Save",
    },
  },
  pt: {
    premiumBadge: "Premium",
    title: "Gestão de Despesas - Premium",
    description:
      "Controle e registre todas as despesas operacionais do seu negócio",
    primaryCta: "✨ Plano Empresarial",
    secondaryCta: "Atualizar Plano",
    labels: {
      newExpense: "Nova Despesa",
      expenses: "Despesas",
      total: "Total",
      description: "Descrição",
      category: "Categoria",
      amount: "Valor",
      paymentMethod: "Método de pagamento",
      date: "Data",
      notes: "Notas",
      actions: "Ações",
      noData: "Sem despesas ainda",
      loading: "Carregando...",
      confirmDelete: "Excluir esta despesa?",
    },
    toasts: {
      loadError: "Erro ao carregar despesas",
      saveError: "Erro ao salvar despesa",
      deleteError: "Erro ao excluir despesa",
      saved: "Despesa salva",
      deleted: "Despesa excluída",
    },
    buttons: {
      cancel: "Cancelar",
      save: "Salvar",
    },
  },
} as const;

export default function ExpensesPage() {
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

  const planId = (subscription?.planId || "BASIC").toUpperCase();
  const isPremiumPlan = planId !== "BASIC";
  const localeMap: Record<string, string> = {
    es: "es-AR",
    en: "en-US",
    pt: "pt-BR",
  };
  const formatAmount = (value: number) =>
    new Intl.NumberFormat(localeMap[currentLanguage] || "en-US", {
      style: "currency",
      currency: "ARS",
    }).format(value || 0);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);
    if (parsedUser?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchExpenses();
  }, [router]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
      } else {
        toast.error(copy.toasts.loadError);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error(copy.toasts.loadError);
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
        toast.success(copy.toasts.saved);
      } else {
        toast.error(copy.toasts.saveError);
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error(copy.toasts.saveError);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(copy.labels.confirmDelete)) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchExpenses();
        toast.success(copy.toasts.deleted);
      } else {
        toast.error(copy.toasts.deleteError);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(copy.toasts.deleteError);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (subLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
        <Header user={user} showBackButton />
        <main className="max-w-5xl mx-auto px-4 py-10">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-56 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </main>
      </div>
    );
  }

  if (!isPremiumPlan) {
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <Header user={user} showBackButton />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {copy.title.replace(" - Premium", "")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {copy.description}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {copy.labels.newExpense}
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  {copy.labels.description}
                </label>
                <input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {copy.labels.amount}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {copy.labels.category}
                </label>
                <input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {copy.labels.paymentMethod}
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {copy.labels.date}
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  {copy.labels.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  {copy.buttons.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
                >
                  {copy.buttons.save}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {copy.labels.expenses}
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {copy.labels.total}: {formatAmount(totalExpenses)}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-2 px-3">{copy.labels.date}</th>
                  <th className="text-left py-2 px-3">
                    {copy.labels.description}
                  </th>
                  <th className="text-left py-2 px-3">
                    {copy.labels.category}
                  </th>
                  <th className="text-left py-2 px-3">{copy.labels.amount}</th>
                  <th className="text-left py-2 px-3">{copy.labels.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading &&
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={`loading-${idx}`} className="animate-pulse">
                      <td className="py-3 px-3">
                        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-800" />
                      </td>
                    </tr>
                  ))}
                {expenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="text-slate-900 dark:text-slate-200"
                  >
                    <td className="py-2 px-3">{expense.date?.slice(0, 10)}</td>
                    <td className="py-2 px-3">{expense.description}</td>
                    <td className="py-2 px-3">{expense.category || "-"}</td>
                    <td className="py-2 px-3">
                      {formatAmount(expense.amount)}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="text-red-600 hover:text-red-500"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!expenses.length && !loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-slate-500 dark:text-slate-400"
                    >
                      {copy.labels.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
