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

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface Category {
  _id: string;
  name: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null);

  const showToast = (
    message: string | null | undefined,
    type: "success" | "error"
  ) => {
    const safeMessage = message || "Ocurrió un error inesperado";
    if (type === "success") notify.success(safeMessage);
    else notify.error(safeMessage);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    fetchCategories();
    loadSubscription();
  }, [router, mounted]);

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
    categories.length
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify.error("Por favor ingresa un nombre para la categoría");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        notify.error("Sesión expirada. Por favor inicia sesión nuevamente.");
        router.push("/auth/login");
        return;
      }

      const url = "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          editingId
            ? { id: editingId, name: formData.name }
            : { name: formData.name }
        ),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCategories();
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: "" });
        showToast(data.message || "Categoría guardada exitosamente", "success");
      } else {
        showToast(data.error || "Error al guardar la categoría", "error");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      showToast(
        "Error de conexión. Por favor verifica tu conexión a internet.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setFormData({ name: category.name });
    setShowModal(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        showToast("Sesión expirada", "error");
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`/api/categories?id=${categoryToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCategories();
        showToast(
          data.message || "Categoría eliminada exitosamente",
          "success"
        );
      } else {
        showToast(data.error || "Error al eliminar la categoría", "error");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast("Error al eliminar la categoría", "error");
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showBackButton />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Gestión de Categorías
            </h1>
            <p className="text-gray-600 text-sm">
              Organiza tus productos por categorías
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-700">
              Categorías: <span className="font-bold">{categories.length}</span>{" "}
              /{" "}
              {planConfig?.maxCategories === -1
                ? "∞"
                : planConfig?.maxCategories}
            </span>
            {currentPlan === "BASIC" && (
              <button
                onClick={() => router.push("/upgrade")}
                className="ml-2 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
              >
                Upgrade Pro
              </button>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              if (!canCreateCategory) {
                setShowLimitPrompt(true);
                return;
              }
              setShowModal(true);
              setEditingId(null);
              setFormData({ name: "" });
            }}
            disabled={!canCreateCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Nueva Categoría
            {!canCreateCategory && <Lock className="w-4 h-4" />}
          </button>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No hay categorías aún</p>
            <p className="text-gray-400 text-sm">
              Crea tu primera categoría para organizar tus productos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-lg">
                    <Tag className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">
                    {category.name}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category._id, category.name)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
          <p className="text-sm text-gray-500">
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Editar Categoría" : "Nueva Categoría"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ej: lacteos, fiambres, quesos"
                  required
                  autoFocus
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setFormData({ name: "" });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {/* Using global react-toastify container; local toast removed */}

      {/* Upgrade Prompts */}
      {showLimitPrompt && (
        <LimitReachedPrompt
          limitName="Categorías"
          current={categories.length}
          max={planConfig?.maxCategories || 10}
          onDismiss={() => setShowLimitPrompt(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Eliminar Categoría
                </h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar la categoría{" "}
                <span className="font-semibold text-gray-900">
                  {categoryToDelete?.name}
                </span>
                ?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
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
