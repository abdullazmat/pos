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
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showBackButton />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Gastos - Premium
          </h1>
          <p className="text-gray-600">
            Controla y registra todos los gastos operacionales de tu negocio
          </p>
        </div>

        {/* Premium Notice */}
        <div className="bg-purple-50 border-2 border-purple-200 border-dashed rounded-lg p-8 mb-6 text-center">
          <Receipt className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-purple-900 mb-2">
            Gestión de Gastos - Premium
          </h3>
          <p className="text-purple-700 mb-4">
            Controla y registra todos los gastos operacionales de tu negocio
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/plan-comparison"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700"
            >
              ✨ Plan Profesional
            </Link>
            <Link
              href="/upgrade"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700"
            >
              Actualizar Plan
            </Link>
          </div>
        </div>

        {/* Stats (Hidden in basic plan) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 opacity-50 pointer-events-none">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Gastos</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              <Receipt className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">$0.00</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Registros</p>
                <p className="text-2xl font-bold text-gray-900">
                  {expenses.length}
                </p>
              </div>
              <Receipt className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
