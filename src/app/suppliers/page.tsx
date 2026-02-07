"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import { toast } from "react-toastify";
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
    planStatus: (count: number, max: string | number, planName: string) =>
      `${count}/${max === 99999 || max === -1 ? "∞" : max} proveedores · ${planName}`,
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
    toasts: {
      limitReached: (max: string | number) =>
        `Límite de proveedores alcanzado (${max})`,
      duplicateSupplierName: "Ya existe un proveedor con ese nombre",
      createSuccess: "Proveedor creado",
      updateSuccess: "Proveedor actualizado",
      saveError: "Error al guardar proveedor",
      deleteSuccess: "Proveedor eliminado",
      deleteError: "Error al eliminar proveedor",
      importError: "Error al importar proveedores",
    },
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
    planStatus: (count: number, max: string | number, planName: string) =>
      `${count}/${max === 99999 || max === -1 ? "∞" : max} suppliers · ${planName}`,
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
    toasts: {
      limitReached: (max: string | number) => `Supplier limit reached (${max})`,
      duplicateSupplierName: "A supplier with that name already exists",
      createSuccess: "Supplier created",
      updateSuccess: "Supplier updated",
      saveError: "Error saving supplier",
      deleteSuccess: "Supplier deleted",
      deleteError: "Error deleting supplier",
      importError: "Error importing suppliers",
    },
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
    planStatus: (count: number, max: string | number, planName: string) =>
      `${count}/${max === 99999 || max === -1 ? "∞" : max} fornecedores · ${planName}`,
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
    toasts: {
      limitReached: (max: string | number) =>
        `Limite de fornecedores atingido (${max})`,
      duplicateSupplierName: "Já existe um fornecedor com esse nome",
      createSuccess: "Fornecedor criado",
      updateSuccess: "Fornecedor atualizado",
      saveError: "Erro ao salvar fornecedor",
      deleteSuccess: "Fornecedor excluído",
      deleteError: "Erro ao excluir fornecedor",
      importError: "Erro ao importar fornecedores",
    },
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
  const { currentLanguage, t } = useGlobalLanguage();
  const copy = (SUPPLIER_COPY[currentLanguage] ||
    SUPPLIER_COPY.en) as typeof SUPPLIER_COPY.en;
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
        const resolved = data?.data?.subscription ||
          data?.subscription || { planId: "BASIC" };
        setSubscription(resolved);
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
      toast.info(copy.toasts.limitReached(planConfig.maxSuppliers));
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
        toast.success(
          editingId ? copy.toasts.updateSuccess : copy.toasts.createSuccess,
        );
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
        if (
          errorData?.error &&
          typeof errorData.error === "object" &&
          errorData.error.key
        ) {
          const errorKey =
            typeof errorData.error.key === "string"
              ? errorData.error.key
              : null;
          const toastValue = errorKey
            ? copy.toasts[errorKey as keyof typeof copy.toasts]
            : null;
          const message =
            typeof toastValue === "string" ? toastValue : copy.toasts.saveError;
          toast.error(message);
        } else {
          toast.error(errorData?.error || copy.toasts.saveError);
        }
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error(copy.toasts.saveError);
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
        toast.success(copy.toasts.deleteSuccess);
        await fetchSuppliers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || copy.toasts.deleteError);
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error(copy.toasts.deleteError);
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
        toast.error(t("selectValidCSV", "errors"));
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
        toast.error(t("selectValidCSV", "errors"));
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
        toast.error(t("emptyCSVFile", "errors"));
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
        toast.error(t("csvMustContainName", "errors"));
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
        toast.error(t("noValidSuppliersFound", "errors"));
        setUploadProgress(false);
        return;
      }

      // Send to API
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error(String(t("sessionExpired", "errors")));
        setUploadProgress(false);
        router.push("/auth/login");
        return;
      }
      const response = await fetch("/api/suppliers/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ suppliers }),
      });

      if (response.status === 401) {
        toast.error(String(t("sessionExpired", "errors")));
        setUploadProgress(false);
        router.push("/auth/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const successMsg = t("suppliersImportedSuccess", "errors");
        toast.success(
          typeof successMsg === "function"
            ? successMsg(data.count)
            : `${data.count} proveedores importados exitosamente`,
        );
        await fetchSuppliers();
        setShowBulkUpload(false);
        setUploadFile(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || copy.toasts.importError);
      }
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error(copy.toasts.importError);
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
      <div className="vp-page">
        <Header user={user} showBackButton={true} />
        <main className="px-4 py-8 mx-auto max-w-7xl">
          <div className="space-y-4 animate-pulse">
            <div className="w-1/4 h-8 vp-skeleton"></div>
            <div className="h-12 vp-skeleton"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 vp-skeleton"></div>
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
  const planNameMap: Record<string, Record<string, string>> = {
    es: { BASIC: "Gratuito", PROFESSIONAL: "Pro", ENTERPRISE: "Empresarial" },
    en: { BASIC: "Free", PROFESSIONAL: "Pro", ENTERPRISE: "Enterprise" },
    pt: { BASIC: "Gratuito", PROFESSIONAL: "Pro", ENTERPRISE: "Empresarial" },
  };
  const planName =
    planNameMap[currentLanguage]?.[currentPlan] || planNameMap.en[currentPlan];
  const canAddSupplier = !isLimitReached(
    currentPlan,
    "maxSuppliers",
    suppliers.length,
  );
  const supplierCount = suppliers.length;
  const maxSuppliers =
    planConfig.maxSuppliers === -1 || planConfig.maxSuppliers === 99999
      ? "∞"
      : planConfig.maxSuppliers;

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
      <div className="vp-page">
        <Header user={user} showBackButton />

        <main className="vp-page-inner">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="flex items-center gap-3 mb-2 vp-section-title">
                <Truck className="w-8 h-8 text-purple-400" />
                {copy.title}
              </h1>
              <p className="vp-section-subtitle">{copy.subtitle}</p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkUpload(true)}
                className="vp-button"
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
                className={`vp-button vp-button-primary ${
                  !canAddSupplier ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus className="w-5 h-5" />
                {copy.newSupplier}
              </button>
            </div>
          </div>

          {/* Plan Status */}
          <div className="flex items-center gap-2 p-4 mb-6 border rounded-lg bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700">
            <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-emerald-700 dark:text-emerald-300">
              {copy.planStatus(supplierCount, maxSuppliers, planName)}
            </span>
            {planConfig.maxSuppliers > 0 &&
              supplierCount >= planConfig.maxSuppliers && (
                <span className="ml-auto text-red-600 dark:text-red-400">
                  {copy.limitReached}
                </span>
              )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
            <div className="p-6 bg-white border rounded-lg dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {copy.stats.totalTitle}
                </p>
                <Truck className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {supplierCount}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {copy.stats.totalDesc}
              </p>
            </div>

            <div className="p-6 bg-white border rounded-lg dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {copy.stats.activeTitle}
                </p>
                <Truck className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {supplierCount}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {copy.stats.activeDesc}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 mb-6 bg-white border rounded-lg dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder={copy.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 bg-white border rounded-lg text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-500 dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {editingId ? copy.formTitleEdit : copy.formTitleNew}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
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
                        className="w-full px-4 py-2 bg-white border rounded-lg text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 bg-white border rounded-lg text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 bg-white border rounded-lg text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 bg-white border rounded-lg text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 bg-white border rounded-lg text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-300 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-b-2 border-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center bg-white border rounded-lg dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <Truck className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {searchTerm ? copy.empty.search : copy.empty.none}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden bg-white border rounded-lg dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                      {copy.table.supplier}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                      {copy.table.contact}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                      {copy.table.status}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-700 dark:text-slate-300">
                      {copy.table.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier._id}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {supplier.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-400">
                        <div>{supplier.phone || "-"}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {supplier.email || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 text-xs font-semibold leading-5 border rounded-full bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                          {copy.statusActive}
                        </span>
                      </td>
                      <td className="flex gap-2 px-6 py-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-2 rounded text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(supplier._id, supplier.name)
                          }
                          className="p-2 rounded text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
            className="w-full max-w-md p-6 bg-white border shadow-2xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 border border-red-300 rounded-full dark:border-red-800 dark:bg-red-900/30">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {copy.delete.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {copy.delete.subtitle}
                </p>
              </div>
            </div>

            <div className="p-4 mb-6 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <p className="text-slate-700 dark:text-slate-300">
                {copy.delete.confirm(supplierToDelete?.name)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-8 bg-white border shadow-2xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {copy.bulk.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {copy.bulk.subtitle}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBulkUpload(false);
                  setUploadFile(null);
                }}
                className="transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Instructions */}
            <div className="p-6 mb-6 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                Instrucciones
              </h3>
              <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {copy.bulk.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="font-semibold text-purple-500 dark:text-purple-400">
                      {index + 1}.
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">
                    {copy.bulk.fieldsLabel}
                  </strong>
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-600 dark:text-slate-400">
                    •{" "}
                    <span className="font-semibold text-purple-500 dark:text-purple-400">
                      nombre
                    </span>{" "}
                    (requerido)
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    •{" "}
                    <span className="text-slate-700 dark:text-slate-300">
                      documento
                    </span>{" "}
                    (opcional)
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    •{" "}
                    <span className="text-slate-700 dark:text-slate-300">
                      telefono
                    </span>{" "}
                    (opcional)
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    •{" "}
                    <span className="text-slate-700 dark:text-slate-300">
                      direccion
                    </span>{" "}
                    (opcional)
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    •{" "}
                    <span className="text-slate-700 dark:text-slate-300">
                      email
                    </span>{" "}
                    (opcional)
                  </div>
                </div>
              </div>
            </div>

            {/* Download Template Button */}
            <button
              onClick={downloadTemplate}
              className="flex items-center justify-center w-full gap-2 px-4 py-3 mb-6 font-medium text-white transition-colors bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:border-blue-600 dark:hover:bg-blue-700"
            >
              <Download className="w-5 h-5" />
              {copy.bulk.downloadTemplate}
            </button>

            {/* Upload Area */}
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              className="p-8 text-center transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 bg-slate-50 dark:bg-slate-800"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
              {uploadFile ? (
                <div>
                  <p className="mb-1 font-medium text-slate-900 dark:text-white">
                    {uploadFile.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {(uploadFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-1 font-medium text-slate-900 dark:text-white">
                    {copy.bulk.uploadPrompt}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {copy.bulk.orClick}
                  </p>
                </div>
              )}
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                .csv • UTF-8
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {copy.bulk.orClick}
              </p>
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
                className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {copy.bulk.close}
              </button>
              <button
                onClick={processCSV}
                disabled={!uploadFile || uploadProgress}
                className="flex-1 px-4 py-2.5 bg-purple-600 border border-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
