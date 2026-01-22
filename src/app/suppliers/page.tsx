"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { Truck, Plus, Edit2, Trash2, Search, Lock } from "lucide-react";
import { toast } from "react-toastify";
import {
  UpgradePrompt,
  LimitReachedPrompt,
} from "@/components/common/UpgradePrompt";
import { PLAN_FEATURES, isLimitReached } from "@/lib/utils/planFeatures";

interface Supplier {
  _id: string;
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function SuppliersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscription, setSubscription] = useState<any>(null);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<{id: string, name: string} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    phone: "",
    email: "",
    address: "",
  });

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
    fetchSuppliers();
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

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentPlan: "BASIC" | "PROFESSIONAL" | "ENTERPRISE" =
      subscription?.planId?.toUpperCase() === "PROFESSIONAL"
        ? "PROFESSIONAL"
        : subscription?.planId?.toUpperCase() === "ENTERPRISE"
        ? "ENTERPRISE"
        : "BASIC";
    const planConfig = PLAN_FEATURES[currentPlan];

    if (
      !editingId &&
      isLimitReached(currentPlan, "maxSuppliers", suppliers.length)
    ) {
      setShowLimitPrompt(true);
      toast.info(
        `Límite de proveedores alcanzado (${planConfig.maxSuppliers})`
      );
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const method = editingId ? "PUT" : "POST";

      const response = await fetch("/api/suppliers", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          editingId ? { id: editingId, ...formData } : formData
        ),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(editingId ? "Proveedor actualizado" : "Proveedor creado");
        await fetchSuppliers();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: "",
          document: "",
          phone: "",
          email: "",
          address: "",
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al guardar proveedor");
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error("Error al guardar proveedor");
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier._id);
    setFormData({
      name: supplier.name,
      document: supplier.document || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setSupplierToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/suppliers?id=${supplierToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Proveedor eliminado exitosamente");
        await fetchSuppliers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al eliminar proveedor");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Error al eliminar proveedor");
    } finally {
      setShowDeleteModal(false);
      setSupplierToDelete(null);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} showBackButton={true} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentPlan: "BASIC" | "PROFESSIONAL" | "ENTERPRISE" =
    subscription?.planId?.toUpperCase() === "PROFESSIONAL"
      ? "PROFESSIONAL"
      : subscription?.planId?.toUpperCase() === "ENTERPRISE"
      ? "ENTERPRISE"
      : "BASIC";
  const planConfig = PLAN_FEATURES[currentPlan];
  const canAddSupplier = !isLimitReached(
    currentPlan,
    "maxSuppliers",
    suppliers.length
  );
  const supplierCount = suppliers.length;
  const maxSuppliers =
    planConfig.maxSuppliers === -1 ? "∞" : planConfig.maxSuppliers;

  return (
    <>
      {showLimitPrompt && (
        <LimitReachedPrompt
          limitName="Proveedores"
          current={supplierCount}
          max={planConfig.maxSuppliers}
          onDismiss={() => setShowLimitPrompt(false)}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        <Header user={user} showBackButton />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Proveedores
            </h1>
            <p className="text-gray-600">Administra tu red de proveedores</p>
          </div>

          {/* Plan Status */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            <span className="text-purple-800 font-medium">
              {supplierCount}/{maxSuppliers} proveedores · Básico
            </span>
            {planConfig.maxSuppliers > 0 && supplierCount >= planConfig.maxSuppliers && (
              <span className="text-red-600 ml-auto">Límite alcanzado</span>
            )}
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                if (!canAddSupplier) {
                  setShowLimitPrompt(true);
                  return;
                }
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  name: "",
                  document: "",
                  phone: "",
                  email: "",
                  address: "",
                });
              }}
              disabled={!canAddSupplier}
              className={`bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2 whitespace-nowrap ${
                !canAddSupplier ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Plus className="w-5 h-5" />
              Nuevo Proveedor ({supplierCount}/{maxSuppliers})
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Editar Proveedor" : "Nuevo Proveedor"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documento
                    </label>
                    <input
                      type="text"
                      value={formData.document}
                      onChange={(e) =>
                        setFormData({ ...formData, document: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700"
                  >
                    {editingId ? "Actualizar" : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Suppliers Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? "No se encontraron proveedores"
                  : "No hay proveedores aún"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {supplier.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{supplier.phone || "-"}</div>
                        <div className="text-xs">{supplier.email || ""}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="text-blue-600 hover:text-blue-700 mr-3"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(supplier._id, supplier.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

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
                  Eliminar Proveedor
                </h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar a{" "}
                <span className="font-semibold text-gray-900">
                  {supplierToDelete?.name}
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
    </>
  );
}
