"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Lock,
  Upload,
  Download,
  FileText,
  X,
} from "lucide-react";
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

const SUPPLIER_COPY = {
  es: {
    title: "Gestión de Proveedores",
    subtitle: "Administra tu red de proveedores",
    bulkUpload: "Carga Masiva",
    newSupplier: "Nuevo Proveedor",
    planStatus: (count: number, max: string | number) => `${count}/${max} proveedores · Gratuito`,
    limitReached: "Límite alcanzado",
    stats: {
      totalTitle: "Total Proveedores",
      totalDesc: "Proveedores registrados",
      activeTitle: "Proveedores Activos",
      activeDesc: "Proveedores operativos",
    },
    searchPlaceholder: "Buscar por nombre, documento, teléfono o email...",
    formTitleNew: "Nuevo Proveedor",
    formTitleEdit: "Editar Proveedor",
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
      none: "No hay proveedores aún",
      search: "No se encontraron proveedores",
    },
    table: {
      supplier: "Proveedor",
      contact: "Contacto",
      status: "Estado",
      actions: "Acciones",
    },
    statusActive: "Activo",
    delete: {
      title: "Eliminar Proveedor",
      subtitle: "Esta acción no se puede deshacer",
      confirm: (name?: string) =>
        `¿Estás seguro de que deseas eliminar a ${name || "este proveedor"}?`,
      cancel: "Cancelar",
      accept: "Eliminar",
    },
    bulk: {
      title: "Importación Masiva de Proveedores",
      subtitle: "Importa múltiples proveedores desde un archivo CSV",
      instructions: [
        "Descarga la plantilla CSV haciendo clic en el botón de abajo",
        "Completa el archivo con los datos de tus proveedores",
        "Sube el archivo completado usando el área de carga",
      ],
      fieldsLabel: "Campos del CSV:",
      downloadTemplate: "Descargar Plantilla CSV",
      uploadPrompt: "Arrastra tu archivo CSV aquí",
      orClick: "o haz clic para seleccionar",
      processing: "Procesando...",
      importAction: "Importar Proveedores",
      close: "Cancelar",
    },
  },
  en: {
    title: "Supplier Management",
    subtitle: "Manage your supplier network",
    bulkUpload: "Bulk Upload",
    newSupplier: "New Supplier",
    planStatus: (count: number, max: string | number) => `${count}/${max} suppliers · Free`,
    limitReached: "Limit reached",
    stats: {
      totalTitle: "Total Suppliers",
      totalDesc: "Registered suppliers",
      activeTitle: "Active Suppliers",
      activeDesc: "Operational suppliers",
    },
    searchPlaceholder: "Search by name, document, phone or email...",
    formTitleNew: "New Supplier",
    formTitleEdit: "Edit Supplier",
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
      none: "No suppliers yet",
      search: "No suppliers found",
    },
    table: {
      supplier: "Supplier",
      contact: "Contact",
      status: "Status",
      actions: "Actions",
    },
    statusActive: "Active",
    delete: {
      title: "Delete Supplier",
      subtitle: "This action cannot be undone",
      confirm: (name?: string) =>
        `Are you sure you want to delete ${name || "this supplier"}?`,
      cancel: "Cancel",
      accept: "Delete",
    },
    bulk: {
      title: "Bulk Supplier Import",
      subtitle: "Import multiple suppliers from a CSV file",
      instructions: [
        "Download the CSV template using the button below",
        "Fill the file with your suppliers' data",
        "Upload the completed file using the drop area",
      ],
      fieldsLabel: "CSV fields:",
      downloadTemplate: "Download CSV Template",
      uploadPrompt: "Drag your CSV file here",
      orClick: "or click to select",
      processing: "Processing...",
      importAction: "Import Suppliers",
      close: "Cancel",
    },
  },
  pt: {
    title: "Gestão de Fornecedores",
    subtitle: "Administre sua rede de fornecedores",
    bulkUpload: "Carga Massiva",
    newSupplier: "Novo Fornecedor",
    planStatus: (count: number, max: string | number) => `${count}/${max} fornecedores · Gratuito`,
    limitReached: "Limite atingido",
    stats: {
      totalTitle: "Total de Fornecedores",
      totalDesc: "Fornecedores registrados",
      activeTitle: "Fornecedores Ativos",
      activeDesc: "Fornecedores operacionais",
    },
    searchPlaceholder: "Buscar por nome, documento, telefone ou email...",
    formTitleNew: "Novo Fornecedor",
    formTitleEdit: "Editar Fornecedor",
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
      none: "Ainda não há fornecedores",
      search: "Nenhum fornecedor encontrado",
    },
    table: {
      supplier: "Fornecedor",
      contact: "Contato",
      status: "Status",
      actions: "Ações",
    },
    statusActive: "Ativo",
    delete: {
      title: "Excluir Fornecedor",
      subtitle: "Esta ação não pode ser desfeita",
      confirm: (name?: string) =>
        `Tem certeza de que deseja excluir ${name || "este fornecedor"}?`,
      cancel: "Cancelar",
      accept: "Excluir",
    },
    bulk: {
      title: "Importação Massiva de Fornecedores",
      subtitle: "Importe múltiplos fornecedores a partir de um arquivo CSV",
      instructions: [
        "Baixe o modelo CSV usando o botão abaixo",
        "Preencha o arquivo com os dados dos fornecedores",
        "Envie o arquivo usando a área de upload",
      ],
      fieldsLabel: "Campos do CSV:",
      downloadTemplate: "Baixar Modelo CSV",
      uploadPrompt: "Arraste seu arquivo CSV aqui",
      orClick: "ou clique para selecionar",
      processing: "Processando...",
      importAction: "Importar Fornecedores",
      close: "Cancelar",
    },
  },
} as const;

export default function SuppliersPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const copy = (SUPPLIER_COPY[currentLanguage] || SUPPLIER_COPY.en) as
    typeof SUPPLIER_COPY.en;
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [supplierToDelete, setSupplierToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
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
        `Límite de proveedores alcanzado (${planConfig.maxSuppliers})`,
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
          editingId ? { id: editingId, ...formData } : formData,
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

  const downloadTemplate = () => {
    const csvContent =
      "nombre,documento,telefono,direccion,email\nEjemplo S.A.,12345678,555-1234,Calle Principal 123,ejemplo@email.com";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_proveedores.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast.error("Por favor selecciona un archivo CSV válido");
        return;
      }
      setUploadFile(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast.error("Por favor selecciona un archivo CSV válido");
        return;
      }
      setUploadFile(file);
    }
  };

  const processCSV = async () => {
    if (!uploadFile) return;

    setUploadProgress(true);
    try {
      const text = await uploadFile.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        toast.error("El archivo CSV está vacío o no tiene datos");
        setUploadProgress(false);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      // Validate headers
      const requiredHeaders = ["nombre"];
      const hasRequiredHeaders = requiredHeaders.every((h) =>
        headers.includes(h),
      );

      if (!hasRequiredHeaders) {
        toast.error('El CSV debe contener al menos la columna "nombre"');
        setUploadProgress(false);
        return;
      }

      const suppliers = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const supplier: any = {};

        headers.forEach((header, index) => {
          const value = values[index] || "";
          if (header === "nombre") supplier.name = value;
          else if (header === "documento") supplier.document = value;
          else if (header === "telefono") supplier.phone = value;
          else if (header === "direccion") supplier.address = value;
          else if (header === "email") supplier.email = value;
        });

        if (supplier.name) {
          suppliers.push(supplier);
        }
      }

      if (suppliers.length === 0) {
        toast.error("No se encontraron proveedores válidos en el archivo");
        setUploadProgress(false);
        return;
      }

      // Send to API
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/suppliers/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ suppliers }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.count} proveedores importados exitosamente`);
        await fetchSuppliers();
        setShowBulkUpload(false);
        setUploadFile(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al importar proveedores");
      }
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error("Error al procesar el archivo CSV");
    } finally {
      setUploadProgress(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
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
  const planConfig = PLAN_FEATURES[currentPlan];
  const canAddSupplier = !isLimitReached(
    currentPlan,
    "maxSuppliers",
    suppliers.length,
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
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header user={user} showBackButton />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Truck className="w-8 h-8 text-purple-400" />
                {copy.title}
              </h1>
              <p className="text-slate-400">{copy.subtitle}</p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkUpload(true)}
                className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                {copy.bulkUpload}
              </button>
              <button
                onClick={() => {
                  if (!canAddSupplier) {
                    setShowLimitPrompt(true);
                    return;
                  }
                  setEditingId(null);
                  setFormData({
                    name: "",
                    document: "",
                    phone: "",
                    email: "",
                    address: "",
                  });
                  setShowForm(true);
                }}
                disabled={!canAddSupplier}
                className={`bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2 ${
                  !canAddSupplier ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus className="w-5 h-5" />
                {copy.newSupplier}
              </button>
            </div>
          </div>

          {/* Plan Status */}
          <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-medium">
              {copy.planStatus(supplierCount, maxSuppliers)}
            </span>
            {planConfig.maxSuppliers > 0 &&
              supplierCount >= planConfig.maxSuppliers && (
                <span className="text-red-400 ml-auto">{copy.limitReached}</span>
              )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400">{copy.stats.totalTitle}</p>
                <Truck className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{supplierCount}</p>
              <p className="text-sm text-slate-500 mt-1">
                {copy.stats.totalDesc}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400">{copy.stats.activeTitle}</p>
                <Truck className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-white">{supplierCount}</p>
              <p className="text-sm text-slate-500 mt-1">
                {copy.stats.activeDesc}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder={copy.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-500"
              />
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingId ? copy.formTitleEdit : copy.formTitleNew}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {copy.labels.name}
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {copy.labels.document}
                      </label>
                      <input
                        type="text"
                        value={formData.document}
                        onChange={(e) =>
                          setFormData({ ...formData, document: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {copy.labels.phone}
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {copy.labels.email}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {copy.labels.address}
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      {editingId ? copy.actions.update : copy.actions.create}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                      className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                    >
                      {copy.actions.cancel}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Suppliers Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
              <Truck className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                {searchTerm ? copy.empty.search : copy.empty.none}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      {copy.table.supplier}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      {copy.table.contact}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      {copy.table.status}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      {copy.table.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier._id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-100">
                          {supplier.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        <div>{supplier.phone || "-"}</div>
                        <div className="text-xs text-slate-500">
                          {supplier.email || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800">
                          {copy.statusActive}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="text-slate-400 hover:text-blue-400 p-2 hover:bg-slate-800 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(supplier._id, supplier.name)
                          }
                          className="text-slate-400 hover:text-red-400 p-2 hover:bg-slate-800 rounded"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-900/30 p-3 rounded-full border border-red-800">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {copy.delete.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {copy.delete.subtitle}
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
              <p className="text-slate-300">
                {copy.delete.confirm(supplierToDelete?.name)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
              >
                {copy.delete.cancel}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                {copy.delete.accept}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {copy.bulk.title}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {copy.bulk.subtitle}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBulkUpload(false);
                  setUploadFile(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Instrucciones
              </h3>
              <ol className="space-y-2 text-slate-300 text-sm">
                {copy.bulk.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-purple-400 font-semibold">{index + 1}.</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 mb-2">
                  <strong className="text-slate-300">{copy.bulk.fieldsLabel}</strong>
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-400">
                    •{" "}
                    <span className="text-purple-400 font-semibold">
                      nombre
                    </span>{" "}
                    (requerido)
                  </div>
                  <div className="text-slate-400">
                    • <span className="text-slate-300">documento</span>{" "}
                    (opcional)
                  </div>
                  <div className="text-slate-400">
                    • <span className="text-slate-300">telefono</span>{" "}
                    (opcional)
                  </div>
                  <div className="text-slate-400">
                    • <span className="text-slate-300">direccion</span>{" "}
                    (opcional)
                  </div>
                  <div className="text-slate-400">
                    • <span className="text-slate-300">email</span> (opcional)
                  </div>
                </div>
              </div>
            </div>

            {/* Download Template Button */}
            <button
              onClick={downloadTemplate}
              className="w-full mb-6 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {copy.bulk.downloadTemplate}
            </button>

            {/* Upload Area */}
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              {uploadFile ? (
                <div>
                  <p className="text-white font-medium mb-1">
                    {uploadFile.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {(uploadFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium mb-1">
                    {copy.bulk.uploadPrompt}
                  </p>
                  <p className="text-sm text-slate-400">
                    {copy.bulk.orClick}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkUpload(false);
                  setUploadFile(null);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
              >
                {copy.bulk.close}
              </button>
              <button
                onClick={processCSV}
                disabled={!uploadFile || uploadProgress}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadProgress ? copy.bulk.processing : copy.bulk.importAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
