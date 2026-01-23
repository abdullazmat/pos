"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function ExpensesPage() {
  const router = useRouter();
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
    if (!confirm("¿Estás seguro de eliminar este gasto?")) return;

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header user={user} showBackButton />

      <main className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full bg-slate-900/90 border border-amber-500/50 border-dashed rounded-2xl p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-400/50 text-amber-400 flex items-center justify-center">
              <Receipt className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-wide">
                Premium
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Gestión de Gastos - Premium
              </h1>
              <p className="text-slate-300 text-sm md:text-base">
                Controla y registra todos los gastos operacionales de tu negocio
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
              <Link
                href="/plan-comparison"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
              >
                ✨ Plan Empresarial
              </Link>
              <Link
                href="/upgrade"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold bg-amber-600 text-white hover:bg-amber-500 transition-colors border border-amber-500/70"
              >
                Actualizar Plan
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
