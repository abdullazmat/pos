"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";

import Header from "@/components/layout/Header";
import { toast as notify } from "react-toastify";
import { Edit2, Lock, Plus, Tag, Trash2, X } from "lucide-react";
import { LimitReachedPrompt } from "@/components/common/UpgradePrompt";
import { PLAN_FEATURES, isLimitReached } from "@/lib/utils/planFeatures";

export default function CategoriesPage() {
  const router = useRouter();
  const { t, currentLanguage } = useGlobalLanguage();
  const copy = (CATEGORIES_COPY[currentLanguage] ||
    CATEGORIES_COPY.en) as typeof CATEGORIES_COPY.en;

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

  const planUsageLabel = (current: number, max: number) =>
    copy.planUsage(current, max);

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
        setLoading(false);
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

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header user={user} showBackButton />
        <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="space-y-4 animate-pulse">
            <div className="w-1/3 h-8 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-12 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 rounded bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      {showLimitPrompt && (
        <LimitReachedPrompt
          limitName="Categorías"
          current={categories.length}
          max={planConfig.maxCategories}
          onDismiss={() => setShowLimitPrompt(false)}
        />
      )}

      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header user={user} showBackButton />

        <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="mb-1 text-3xl font-bold text-slate-900 dark:text-white">
                {copy.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {copy.subtitle}
              </p>
            </div>
            <div className="inline-flex items-center gap-3 px-4 py-2 border rounded-lg shadow-sm bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {planUsageLabel(
                    categories.length,
                    planConfig?.maxCategories ?? 0,
                  )}
                </span>
                <span className="hidden sm:inline text-slate-500 dark:text-slate-500">
                  {copy.planTag}
                </span>
              </span>
              {currentPlan === "BASIC" && (
                <button
                  onClick={() => router.push("/upgrade")}
                  className="px-2 py-1 text-xs text-blue-600 transition border rounded bg-blue-100 border-blue-200 hover:bg-blue-200/80 dark:text-blue-300 dark:bg-blue-600/20 dark:border-blue-500/40 dark:hover:bg-blue-600/30"
                >
                  {copy.upgradeCta}
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
              {copy.newCategory}
              {!canCreateCategory && <Lock className="w-4 h-4" />}
            </button>
          </div>

          {/* Categories Grid */}
          {categories.length === 0 ? (
            <div className="p-12 text-center border shadow-sm bg-white rounded-xl border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <Tag className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-600" />
              <p className="mb-2 text-lg text-slate-800 dark:text-slate-300">
                {copy.emptyTitle}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-500">
                {copy.emptySubtitle}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-4 transition border bg-white rounded-xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100 dark:bg-blue-500/15 dark:border-blue-500/30">
                      <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-500/10"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteClick(category._id, category.name)
                      }
                      className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/10"
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
            <p className="text-sm text-slate-600 dark:text-slate-500">
              {copy.footer}
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
              className="w-full max-w-md border shadow-2xl bg-white rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingId
                    ? t("pages.categories.editCategory", "pos")
                    : t("pages.categories.addCategory", "pos")}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 transition-colors rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t("pages.categories.categoryName", "pos")}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 text-slate-900 transition-all border outline-none border-slate-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:text-white dark:border-slate-700 dark:bg-slate-800 dark:placeholder-slate-500"
                    placeholder={copy.namePlaceholder}
                    required
                    autoFocus
                  />
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t("pages.categories.description", "pos")}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 text-slate-900 transition-all border outline-none resize-none border-slate-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:text-white dark:border-slate-700 dark:bg-slate-800 dark:placeholder-slate-500"
                    placeholder={copy.descriptionPlaceholder}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                      setFormData({ name: "", description: "" });
                    }}
                    className="flex-1 px-6 py-3 font-semibold transition-colors border text-slate-700 border-slate-300 rounded-xl hover:bg-slate-100 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {t("labels.cancel", "pos")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? copy.saving
                      : editingId
                        ? copy.update
                        : copy.create}
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
              className="w-full max-w-md p-6 border shadow-2xl bg-white rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full dark:bg-red-900/40">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {copy.deleteTitle}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {copy.deleteSubtitle}
                  </p>
                </div>
              </div>

              <div className="p-4 mb-6 border rounded-lg bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700/50">
                <p className="text-slate-700 dark:text-slate-200">
                  {copy.deleteQuestion}{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {deleteTarget.name}
                  </span>
                  ?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 font-medium transition-colors border rounded-lg text-slate-700 bg-white border-slate-300 hover:bg-slate-100 dark:text-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {t("labels.cancel", "pos")}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                >
                  {t("labels.delete", "pos")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const CATEGORIES_COPY = {
  es: {
    title: "Gestión de Categorías",
    subtitle: "Organiza tus productos por categorías",
    planUsage: (current: number, max: number) =>
      `${current}/${max === -1 ? "∞" : max} categorías`,
    planTag: "· Gratuito",
    upgradeCta: "Upgrade Pro",
    newCategory: "Nueva Categoría",
    emptyTitle: "No hay categorías aún",
    emptySubtitle: "Crea tu primera categoría para organizar tus productos",
    footer: "Sistema POS © 2025 - Desarrollado para negocios pequeños",
    loading: "Cargando categorías...",
    namePlaceholder: "Ej: lacteos, fiambres, quesos",
    descriptionPlaceholder: "Añade una descripción opcional...",
    saving: "Guardando...",
    update: "Actualizar",
    create: "Crear",
    deleteTitle: "Eliminar Categoría",
    deleteSubtitle: "Esta acción no se puede deshacer",
    deleteQuestion: "¿Estás seguro de que deseas eliminar la categoría",
  },
  en: {
    title: "Category Management",
    subtitle: "Organize your products by category",
    planUsage: (current: number, max: number) =>
      `${current}/${max === -1 ? "∞" : max} categories`,
    planTag: "· Free",
    upgradeCta: "Upgrade Pro",
    newCategory: "New Category",
    emptyTitle: "No categories yet",
    emptySubtitle: "Create your first category to organize products",
    footer: "POS System © 2025 - Built for small businesses",
    loading: "Loading categories...",
    namePlaceholder: "e.g., dairy, cold cuts, cheese",
    descriptionPlaceholder: "Add an optional description...",
    saving: "Saving...",
    update: "Update",
    create: "Create",
    deleteTitle: "Delete Category",
    deleteSubtitle: "This action cannot be undone",
    deleteQuestion: "Are you sure you want to delete category",
  },
  pt: {
    title: "Gestão de Categorias",
    subtitle: "Organize seus produtos por categorias",
    planUsage: (current: number, max: number) =>
      `${current}/${max === -1 ? "∞" : max} categorias`,
    planTag: "· Gratuito",
    upgradeCta: "Upgrade Pro",
    newCategory: "Nova Categoria",
    emptyTitle: "Ainda não há categorias",
    emptySubtitle: "Crie sua primeira categoria para organizar os produtos",
    footer: "Sistema PDV © 2025 - Feito para pequenos negócios",
    loading: "Carregando categorias...",
    namePlaceholder: "Ex.: laticínios, frios, queijos",
    descriptionPlaceholder: "Adicione uma descrição opcional...",
    saving: "Salvando...",
    update: "Atualizar",
    create: "Criar",
    deleteTitle: "Excluir Categoria",
    deleteSubtitle: "Esta ação não pode ser desfeita",
    deleteQuestion: "Tem certeza de que deseja excluir a categoria",
  },
};
