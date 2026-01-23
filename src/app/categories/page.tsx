"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { toast as notify } from "react-toastify";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Lock,
} from "lucide-react";
import {
  UpgradePrompt,
  LimitReachedPrompt,
} from "@/components/common/UpgradePrompt";
import { PLAN_FEATURES, isLimitReached } from "@/lib/utils/planFeatures";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadSubscription = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription || { planId: "BASIC" });
      }
    } catch (error) {
      console.error("Load subscription error:", error);
      setSubscription({ planId: "BASIC" });
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else if (response.status === 401) {
        localStorage.clear();
        router.push("/auth/login");
      } else {
        const data = await response.json();
        console.error("Error fetching categories:", data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentPlan: "BASIC" | "PROFESSIONAL" | "ENTERPRISE" =
    subscription?.planId?.toUpperCase() === "PROFESSIONAL"
      ? "PROFESSIONAL"
      : subscription?.planId?.toUpperCase() === "ENTERPRISE"
        ? "ENTERPRISE"
        : "BASIC";
  const planConfig = PLAN_FEATURES[currentPlan];
  const canCreateCategory = !isLimitReached(
    currentPlan,
    "maxCategories",
    categories.length,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData.name.trim()) {
      notify.error("El nombre de la categoría es requerido");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const method = editingId ? "PUT" : "POST";
      const response = await fetch("/api/categories", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingId || undefined,
          name: formData.name,
          description: formData.description,
        }),
      });

      if (response.ok) {
        notify.success(
          editingId ? "Categoría actualizada" : "Categoría creada",
        );
        setShowModal(false);
        setFormData({ name: "", description: "" });
        setEditingId(null);
        await fetchCategories();
      } else {
        const data = await response.json();
        notify.error(data.message || "Error al guardar la categoría");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      notify.error("Error al guardar la categoría");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(category: any) {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowModal(true);
  }

  function handleDeleteClick(id: string, name: string) {
    setDeleteTarget({ id, name });
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/categories?id=${encodeURIComponent(deleteTarget.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        notify.success("Categoría eliminada");
        setShowDeleteModal(false);
        setDeleteTarget(null);
        await fetchCategories();
      } else {
        notify.error("Error al eliminar la categoría");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      notify.error("Error al eliminar la categoría");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    loadSubscription();
    fetchCategories();
  }, []);

  if (!mounted) {
    return null;
  }

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} showBackButton />

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-white">
              Gestión de Categorías
            </h1>
            <p className="text-sm text-slate-400">
              Organiza tus productos por categorías
            </p>
          </div>
          <div className="inline-flex items-center gap-3 px-4 py-2 border rounded-lg shadow-sm bg-slate-900 border-slate-800">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {categories.length}/
                {planConfig?.maxCategories === -1
                  ? "∞"
                  : planConfig?.maxCategories}{" "}
                categorías
              </span>
              <span className="hidden sm:inline text-slate-500">
                · Gratuito
              </span>
            </span>
            {currentPlan === "BASIC" && (
              <button
                onClick={() => router.push("/upgrade")}
                className="px-2 py-1 text-xs text-blue-300 transition border rounded bg-blue-600/20 border-blue-500/40 hover:bg-blue-600/30"
              >
                Upgrade Pro
              </button>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={() => {
              if (!canCreateCategory) {
                setShowLimitPrompt(true);
                return;
              }
              setShowModal(true);
              setEditingId(null);
              setFormData({ name: "", description: "" });
            }}
            disabled={!canCreateCategory}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nueva Categoría
            {!canCreateCategory && <Lock className="w-4 h-4" />}
          </button>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="p-12 text-center border shadow-sm bg-slate-900 rounded-xl border-slate-800">
            <Tag className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="mb-2 text-lg text-slate-300">No hay categorías aún</p>
            <p className="text-sm text-slate-500">
              Crea tu primera categoría para organizar tus productos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-4 transition border bg-slate-900 rounded-xl border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/15 p-2.5 rounded-lg border border-blue-500/30">
                    <Tag className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="font-medium text-slate-100">
                    {category.name}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteClick(category._id, category.name)
                    }
                    className="p-2 text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Sistema POS © 2025 - Desarrollado para negocios pequeños
          </p>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md border shadow-2xl bg-slate-900 rounded-2xl border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Editar Categoría" : "Nueva Categoría"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 transition-colors rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-slate-200">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 text-white transition-all border outline-none border-slate-700 bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                  placeholder="Ej: lacteos, fiambres, quesos"
                  required
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-slate-200">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 text-white transition-all border outline-none resize-none border-slate-700 bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                  placeholder="Añade una descripción opcional..."
                  rows={4}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setFormData({ name: "", description: "" });
                  }}
                  className="flex-1 px-6 py-3 font-semibold transition-colors border text-slate-200 border-slate-700 rounded-xl hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Guardando..."
                    : editingId
                      ? "Actualizar"
                      : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md p-6 border shadow-2xl bg-slate-800 rounded-2xl border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Eliminar Categoría
                </h3>
                <p className="text-sm text-gray-400">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <div className="p-4 mb-6 border rounded-lg bg-red-900/20 border-red-700/50">
              <p className="text-gray-200">
                ¿Estás seguro de que deseas eliminar la categoría{" "}
                <span className="font-semibold text-gray-100">
                  {deleteTarget.name}
                </span>
                ?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-gray-200 rounded-lg font-medium hover:bg-slate-600 transition-colors border border-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
