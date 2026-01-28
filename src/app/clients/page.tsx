"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
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

const CLIENT_COPY = {
  es: {
    title: "Gestión de Clientes",
    subtitle: "Administra tu base de clientes",
    searchPlaceholder: "Buscar por nombre, documento, teléfono o email...",
    addPrimary: "Nuevo Cliente",
    addBasic: "Nuevo Cliente (Plan Pro)",
    premiumTitle: "Gestión de Clientes - Premium",
    premiumDescription:
      "Administra tu cartera de clientes y ventas a crédito (fiado)",
    upgradeButtons: {
      enterprise: "Plan Empresarial",
      upgrade: "Actualizar Plan",
    },
    toastBasic: "Los clientes están disponibles solo en el plan Pro",
    formTitleNew: "Nuevo Cliente",
    formTitleEdit: "Editar Cliente",
    labels: {
      name: "Nombre *",
      document: "Documento",
      phone: "Teléfono",
      email: "Email",
      address: "Dirección",
    },
    actions: {
      create: "Crear",
      update: "Actualizar",
      cancel: "Cancelar",
    },
    empty: {
      none: "No hay clientes aún",
      search: "No se encontraron clientes",
    },
    table: {
      name: "Nombre",
      document: "Documento",
      contact: "Contacto",
      actions: "Acciones",
    },
    deleteConfirm: "¿Estás seguro de eliminar este cliente?",
  },
  en: {
    title: "Customer Management",
    subtitle: "Manage your customer base",
    searchPlaceholder: "Search by name, document, phone or email...",
    addPrimary: "New Customer",
    addBasic: "New Customer (Pro Plan)",
    premiumTitle: "Customer Management - Premium",
    premiumDescription: "Manage your customer portfolio and store credit sales",
    upgradeButtons: {
      enterprise: "Enterprise Plan",
      upgrade: "Upgrade Plan",
    },
    toastBasic: "Customers are available only on the Pro plan",
    formTitleNew: "New Customer",
    formTitleEdit: "Edit Customer",
    labels: {
      name: "Name *",
      document: "Document",
      phone: "Phone",
      email: "Email",
      address: "Address",
    },
    actions: {
      create: "Create",
      update: "Update",
      cancel: "Cancel",
    },
    empty: {
      none: "No customers yet",
      search: "No customers found",
    },
    table: {
      name: "Name",
      document: "Document",
      contact: "Contact",
      actions: "Actions",
    },
    deleteConfirm: "Are you sure you want to delete this customer?",
  },
  pt: {
    title: "Gestão de Clientes",
    subtitle: "Gerencie sua base de clientes",
    searchPlaceholder: "Buscar por nome, documento, telefone ou email...",
    addPrimary: "Novo Cliente",
    addBasic: "Novo Cliente (Plano Pro)",
    premiumTitle: "Gestão de Clientes - Premium",
    premiumDescription: "Gerencie sua carteira de clientes e vendas a prazo",
    upgradeButtons: {
      enterprise: "Plano Empresarial",
      upgrade: "Atualizar Plano",
    },
    toastBasic: "Clientes estão disponíveis apenas no plano Pro",
    formTitleNew: "Novo Cliente",
    formTitleEdit: "Editar Cliente",
    labels: {
      name: "Nome *",
      document: "Documento",
      phone: "Telefone",
      email: "Email",
      address: "Endereço",
    },
    actions: {
      create: "Criar",
      update: "Atualizar",
      cancel: "Cancelar",
    },
    empty: {
      none: "Ainda não há clientes",
      search: "Nenhum cliente encontrado",
    },
    table: {
      name: "Nome",
      document: "Documento",
      contact: "Contato",
      actions: "Ações",
    },
    deleteConfirm: "Tem certeza que deseja excluir este cliente?",
  },
} as const;

export default function ClientsPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const copy = (CLIENT_COPY[currentLanguage] ||
    CLIENT_COPY.en) as typeof CLIENT_COPY.en;
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
    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);
    if (parsedUser?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
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
      toast.info(copy.toastBasic);
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
    if (!confirm(copy.deleteConfirm)) return;

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
        <main className="px-4 py-8 mx-auto max-w-7xl">
          <div className="space-y-4 animate-pulse">
            <div className="w-1/4 h-8 rounded bg-slate-800"></div>
            <div className="h-12 rounded bg-slate-800"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-slate-800"></div>
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
    currentPlan === "BASIC" ? copy.addBasic : copy.addPrimary;

  // Show premium upgrade prompt for BASIC plan
  if (currentPlan === "BASIC") {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header user={user} showBackButton />

        <main className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-2xl p-12 text-center border-2 border-dashed border-amber-500 dark:border-amber-600 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900/50 dark:to-slate-800/30">
              <div className="relative inline-block mb-6">
                <UserPlus className="w-20 h-20 mx-auto text-amber-600 dark:text-amber-400" />
                <Sparkles className="absolute w-8 h-8 text-amber-600 dark:text-amber-400 -top-1 -right-1" />
              </div>

              <h2 className="mb-3 text-3xl font-bold text-amber-700 dark:text-amber-400">
                {copy.premiumTitle}
              </h2>
              <p className="mb-8 text-lg text-amber-800 dark:text-amber-200">
                {copy.premiumDescription}
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => router.push("/business-config")}
                  className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-colors bg-amber-600 hover:bg-amber-700 rounded-xl"
                >
                  <Sparkles className="w-5 h-5" />
                  {copy.upgradeButtons.enterprise}
                </button>
                <button
                  onClick={() => router.push("/upgrade")}
                  className="px-8 py-3 font-semibold text-white transition-colors bg-amber-700 hover:bg-amber-800 rounded-xl"
                >
                  {copy.upgradeButtons.upgrade}
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
          featureName={copy.title}
          reason={copy.toastBasic}
        />
      )}
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header user={user} showBackButton />

        <main className="px-4 py-8 mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
              {copy.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {copy.subtitle}
            </p>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col items-center justify-between gap-4 p-4 mb-6 bg-white border rounded-lg border-slate-200 sm:flex-row dark:bg-slate-900 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder={copy.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
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
            <div className="p-6 mb-6 bg-white border rounded-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? copy.formTitleEdit : copy.formTitleNew}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.labels.name}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.labels.document}
                    </label>
                    <input
                      type="text"
                      value={formData.document}
                      onChange={(e) =>
                        setFormData({ ...formData, document: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.labels.phone}
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.labels.email}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.labels.address}
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    {editingId ? copy.actions.update : copy.actions.create}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="px-6 py-2 font-medium bg-white border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {copy.actions.cancel}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Clients Table */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center bg-white border rounded-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <p className="text-lg text-slate-500 dark:text-slate-400">
                {searchTerm ? copy.empty.search : copy.empty.none}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden bg-white border rounded-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600 dark:text-slate-300">
                      {copy.table.name}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600 dark:text-slate-300">
                      {copy.table.document}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600 dark:text-slate-300">
                      {copy.table.contact}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600 dark:text-slate-300">
                      {copy.table.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredClients.map((client) => (
                    <tr
                      key={client._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {client.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {client.document || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-400">
                        <div>{client.phone || "-"}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {client.email || ""}
                        </div>
                      </td>
                      <td className="flex gap-2 px-6 py-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-blue-600 rounded dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="p-2 text-red-600 rounded dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
