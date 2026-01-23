"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Lock,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { toast } from "react-toastify";
import { UpgradePrompt } from "@/components/common/UpgradePrompt";
import { PLAN_FEATURES } from "@/lib/utils/planFeatures";

interface Client {
  _id: string;
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscription, setSubscription] = useState<any>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
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
    fetchClients();
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

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if free plan and trying to add client
    const currentPlan: "BASIC" | "PROFESSIONAL" | "ENTERPRISE" =
      subscription?.planId?.toUpperCase() === "PROFESSIONAL"
        ? "PROFESSIONAL"
        : subscription?.planId?.toUpperCase() === "ENTERPRISE"
          ? "ENTERPRISE"
          : "BASIC";
    if (currentPlan === "BASIC" && !editingId) {
      setShowUpgradePrompt(true);
      toast.info("Los clientes están disponibles solo en el plan Pro");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const method = editingId ? "PUT" : "POST";

      const response = await fetch("/api/clients", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          editingId ? { id: editingId, ...formData } : formData,
        ),
      });

      if (response.ok) {
        fetchClients();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: "",
          document: "",
          phone: "",
          email: "",
          address: "",
        });
      }
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingId(client._id);
    setFormData({
      name: client.name,
      document: client.document || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/clients?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchClients();
      }
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header user={user} showBackButton={true} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-800 rounded w-1/4"></div>
            <div className="h-12 bg-slate-800 rounded"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-800 rounded"></div>
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
  const canAddClients = currentPlan !== "BASIC";
  const addButtonText =
    currentPlan === "BASIC" ? "Nuevo Cliente (Plan Pro)" : "Nuevo Cliente";

  // Show premium upgrade prompt for BASIC plan
  if (currentPlan === "BASIC") {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header user={user} showBackButton />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="max-w-2xl w-full border-2 border-dashed border-amber-600 rounded-2xl p-12 text-center bg-gradient-to-br from-slate-900/50 to-slate-800/30">
              <div className="relative inline-block mb-6">
                <UserPlus className="w-20 h-20 text-amber-400 mx-auto" />
                <Sparkles className="w-8 h-8 text-amber-400 absolute -top-1 -right-1" />
              </div>

              <h2 className="text-3xl font-bold text-amber-400 mb-3">
                Gestión de Clientes - Premium
              </h2>
              <p className="text-amber-200 mb-8 text-lg">
                Administra tu cartera de clientes y ventas a crédito (fiado)
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/upgrade")}
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Plan Empresarial
                </button>
                <button
                  onClick={() => router.push("/upgrade")}
                  className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl transition-colors"
                >
                  Actualizar Plan
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      {showUpgradePrompt && (
        <UpgradePrompt
          onDismiss={() => setShowUpgradePrompt(false)}
          featureName="Gestión de Clientes"
          reason="Esta funcionalidad está disponible solo en el plan Pro"
        />
      )}
      <div className="min-h-screen bg-slate-950">
        <Header user={user} showBackButton />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestión de Clientes
            </h1>
            <p className="text-slate-400">Administra tu base de clientes</p>
          </div>

          {/* Actions Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
              />
            </div>
            <button
              onClick={() => {
                if (!canAddClients) {
                  setShowUpgradePrompt(true);
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
              disabled={!canAddClients}
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap ${
                !canAddClients ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Plus className="w-5 h-5" />
              {addButtonText}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingId ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Documento
                    </label>
                    <input
                      type="text"
                      value={formData.document}
                      onChange={(e) =>
                        setFormData({ ...formData, document: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    {editingId ? "Actualizar" : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="bg-slate-800 border border-slate-700 text-slate-300 px-6 py-2 rounded-lg font-medium hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Clients Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
              <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                {searchTerm
                  ? "No se encontraron clientes"
                  : "No hay clientes aún"}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredClients.map((client) => (
                    <tr key={client._id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-100">
                          {client.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {client.document || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        <div>{client.phone || "-"}</div>
                        <div className="text-xs text-slate-500">
                          {client.email || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-blue-400 hover:text-blue-300 p-2 hover:bg-slate-800 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-slate-800 rounded"
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
    </>
  );
}
