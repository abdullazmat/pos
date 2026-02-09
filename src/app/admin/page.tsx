"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { useSubscription } from "@/lib/hooks/useSubscription";
import Header from "@/components/layout/Header";
import { UserCog, Edit, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { useBusinessDateTime } from "@/lib/hooks/useBusinessDateTime";
import {
  clampDiscountLimit,
  MAX_DISCOUNT_PERCENT,
  normalizeDiscountLimit,
} from "@/lib/utils/discounts";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface SystemUser {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  role: "admin" | "supervisor" | "cashier";
  isActive: boolean;
  createdAt: string;
  discountLimit?: number | null;
}

const ADMIN_COPY = {
  es: {
    title: "Gestión de Usuarios",
    subtitle: "Administra cajeros y administradores del sistema",
    userCount: "usuarios",
    newUserButton: "Nuevo Usuario",
    tableHeaders: {
      name: "Nombre",
      username: "Usuario",
      role: "Rol",
      discountLimit: "Límite Desc. %",
      status: "Estado",
      createdDate: "Fecha Creación",
      actions: "Acciones",
    },
    loading: "Cargando usuarios...",
    noUsers: "No hay usuarios registrados",
    active: "Activo",
    inactive: "Inactivo",
    notDefined: "No definido",
    roles: {
      admin: "Administrador",
      supervisor: "Supervisor",
      cashier: "Cajero",
    },
    modal: {
      newUser: "Nuevo Usuario",
      editUser: "Editar Usuario",
      deleteConfirm: "¿Eliminar Usuario?",
      deleteMessage: "¿Estás seguro de eliminar al usuario",
      deleteWarning: "Esta acción no se puede deshacer.",
      fullName: "Nombre Completo",
      username: "Usuario",
      email: "Email",
      discountLimit: "Límite de Descuento (%)",
      password: "Contraseña",
      passwordOptional: "Contraseña (dejar en blanco para no cambiar)",
      phone: "Teléfono",
      role: "Rol",
      required: "*",
      placeholders: {
        fullName: "Juan Pérez",
        username: "juanperez (debe ser único)",
        usernameEdit: "juanperez",
        email: "juan@ejemplo.com (debe ser único)",
        emailEdit: "juan@ejemplo.com",
        discountLimit: `0 - ${MAX_DISCOUNT_PERCENT}`,
        password: "Mínimo 6 caracteres",
        phone: "+54 9 11 1234-5678",
      },
      hints: {
        usernameUnique: "El nombre de usuario debe ser único en el sistema",
        emailUnique: "El email debe ser único en el sistema",
      },
      buttons: {
        cancel: "Cancelar",
        create: "Crear Usuario",
        creating: "Creando...",
        update: "Actualizar Usuario",
        updating: "Actualizando...",
        delete: "Eliminar",
      },
    },
    toasts: {
      sessionExpired: "Sesión expirada. Por favor inicia sesión nuevamente.",
      loadingError: "Error al cargar usuarios",
      createSuccess: "Usuario creado exitosamente",
      createError: "Error al crear usuario",
      updateSuccess: "Usuario actualizado exitosamente",
      updateError: "Error al actualizar usuario",
      deleteSuccess: "Usuario eliminado exitosamente",
      deleteError: "Error al eliminar usuario",
      discountLimitClamped: "El limite maximo de descuento es 5%",
      mustHaveAdmin: "Debe existir al menos un administrador.",
      userLimitReached:
        "El límite de usuarios en el plan gratuito es 2/2. Actualiza tu plan para agregar más usuarios.",
      cannotDelete: "No puedes eliminar tu propio usuario.",
      emailInUse: "El email ya está en uso",
      usernameInUse: "El nombre de usuario ya está en uso",
    },
    footer: "Sistema POS © 2025 - Desarrollado para negocios pequeños",
    roleOptions: {
      cashier: "Cajero",
      supervisor: "Supervisor",
      admin: "Administrador",
    },
    planName: "Gratuito",
  },
  en: {
    title: "User Management",
    subtitle: "Manage cashiers and system administrators",
    userCount: "users",
    newUserButton: "New User",
    tableHeaders: {
      name: "Name",
      username: "Username",
      role: "Role",
      discountLimit: "Discount Limit %",
      status: "Status",
      createdDate: "Creation Date",
      actions: "Actions",
    },
    loading: "Loading users...",
    noUsers: "No users registered",
    active: "Active",
    inactive: "Inactive",
    notDefined: "Not defined",
    roles: {
      admin: "Administrator",
      supervisor: "Supervisor",
      cashier: "Cashier",
    },
    modal: {
      newUser: "New User",
      editUser: "Edit User",
      deleteConfirm: "Delete User?",
      deleteMessage: "Are you sure you want to delete the user",
      deleteWarning: "This action cannot be undone.",
      fullName: "Full Name",
      username: "Username",
      email: "Email",
      discountLimit: "Discount Limit (%)",
      password: "Password",
      passwordOptional: "Password (leave blank to keep current)",
      phone: "Phone",
      role: "Role",
      required: "*",
      placeholders: {
        fullName: "John Doe",
        username: "johndoe (must be unique)",
        usernameEdit: "johndoe",
        email: "john@example.com (must be unique)",
        emailEdit: "john@example.com",
        discountLimit: `0 - ${MAX_DISCOUNT_PERCENT}`,
        password: "Minimum 6 characters",
        phone: "+1 (555) 123-4567",
      },
      hints: {
        usernameUnique: "Username must be unique in the system",
        emailUnique: "Email must be unique in the system",
      },
      buttons: {
        cancel: "Cancel",
        create: "Create User",
        creating: "Creating...",
        update: "Update User",
        updating: "Updating...",
        delete: "Delete",
      },
    },
    toasts: {
      sessionExpired: "Session expired. Please log in again.",
      loadingError: "Error loading users",
      createSuccess: "User created successfully",
      createError: "Error creating user",
      updateSuccess: "User updated successfully",
      updateError: "Error updating user",
      deleteSuccess: "User deleted successfully",
      deleteError: "Error deleting user",
      discountLimitClamped: "The maximum discount limit is 5%",
      mustHaveAdmin: "At least one administrator is required.",
      userLimitReached:
        "The free plan user limit is 2/2. Upgrade your plan to add more users.",
      cannotDelete: "You cannot delete your own user.",
      emailInUse: "Email is already in use",
      usernameInUse: "Username is already in use",
    },
    footer: "POS System © 2025 - Developed for small businesses",
    roleOptions: {
      cashier: "Cashier",
      supervisor: "Supervisor",
      admin: "Administrator",
    },
    planName: "Free",
  },
  pt: {
    title: "Gestão de Usuários",
    subtitle: "Gerencie caixas e administradores do sistema",
    userCount: "usuários",
    newUserButton: "Novo Usuário",
    tableHeaders: {
      name: "Nome",
      username: "Usuário",
      role: "Função",
      mustHaveAdmin: "Deve existir pelo menos um administrador.",
      discountLimit: "Limite de Desconto %",
      status: "Status",
      createdDate: "Data de Criação",
      actions: "Ações",
    },
    loading: "Carregando usuários...",
    noUsers: "Nenhum usuário registrado",
    active: "Ativo",
    inactive: "Inativo",
    notDefined: "Não definido",
    roles: {
      admin: "Administrador",
      supervisor: "Supervisor",
      cashier: "Caixa",
    },
    modal: {
      newUser: "Novo Usuário",
      editUser: "Editar Usuário",
      deleteConfirm: "Deletar Usuário?",
      deleteMessage: "Tem certeza de que deseja deletar o usuário",
      deleteWarning: "Esta ação não pode ser desfeita.",
      fullName: "Nome Completo",
      username: "Usuário",
      email: "E-mail",
      discountLimit: "Limite de Desconto (%)",
      password: "Senha",
      passwordOptional: "Senha (deixar em branco para manter atual)",
      phone: "Telefone",
      role: "Função",
      required: "*",
      placeholders: {
        fullName: "João Silva",
        username: "joaosilva (deve ser único)",
        usernameEdit: "joaosilva",
        email: "joao@exemplo.com (deve ser único)",
        emailEdit: "joao@exemplo.com",
        discountLimit: `0 - ${MAX_DISCOUNT_PERCENT}`,
        password: "Mínimo 6 caracteres",
        phone: "+55 11 98765-4321",
      },
      hints: {
        usernameUnique: "O nome de usuário deve ser único no sistema",
        emailUnique: "O e-mail deve ser único no sistema",
      },
      buttons: {
        cancel: "Cancelar",
        create: "Criar Usuário",
        creating: "Criando...",
        update: "Atualizar Usuário",
        updating: "Atualizando...",
        delete: "Deletar",
      },
    },
    toasts: {
      sessionExpired: "Sessão expirada. Por favor, faça login novamente.",
      loadingError: "Erro ao carregar usuários",
      createSuccess: "Usuário criado com sucesso",
      createError: "Erro ao criar usuário",
      updateSuccess: "Usuário atualizado com sucesso",
      updateError: "Erro ao atualizar usuário",
      deleteSuccess: "Usuário deletado com sucesso",
      deleteError: "Erro ao deletar usuário",
      discountLimitClamped: "O limite maximo de desconto e 5%",
      userLimitReached:
        "O limite de usuários no plano gratuito é 2/2. Atualize seu plano para adicionar mais usuários.",
      cannotDelete: "Você não pode excluir seu próprio usuário.",
      emailInUse: "O e-mail já está em uso",
      usernameInUse: "O nome de usuário já está em uso",
    },
    footer: "Sistema POS © 2025 - Desenvolvido para pequenas empresas",
    roleOptions: {
      cashier: "Caixa",
      supervisor: "Supervisor",
      admin: "Administrador",
    },
    planName: "Gratuito",
  },
};

export default function AdminPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const { formatDate } = useBusinessDateTime();
  const copy = ADMIN_COPY[currentLanguage] || ADMIN_COPY["es"];
  const { subscription } = useSubscription();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userToEdit, setUserToEdit] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    discountLimit: "",
    role: "cashier" as "admin" | "supervisor" | "cashier",
  });
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    discountLimit: "",
    role: "cashier" as "admin" | "supervisor" | "cashier",
  });

  const planId = (subscription?.planId || "BASIC").toUpperCase();
  const isFreePlan = planId === "BASIC";
  const planUserLimit = subscription?.features?.maxUsers || 2;
  const userLimit = isFreePlan ? 2 : planUserLimit;
  const planNameMap: Record<string, Record<string, string>> = {
    es: { BASIC: "Gratuito", PROFESSIONAL: "Pro", ENTERPRISE: "Empresarial" },
    en: { BASIC: "Free", PROFESSIONAL: "Pro", ENTERPRISE: "Enterprise" },
    pt: { BASIC: "Gratuito", PROFESSIONAL: "Pro", ENTERPRISE: "Empresarial" },
  };
  const planName =
    planNameMap[currentLanguage]?.[planId] || planNameMap.en[planId] || "Free";
  const currentUsers = Math.min(users.length, userLimit);
  const displayUserLimit = userLimit >= 99999 ? "∞" : userLimit.toString();
  const currentPlan = {
    name: planName,
    userLimit,
    currentUsers,
    displayUserLimit,
  };

  const userLimitReachedMessage = isFreePlan
    ? copy.toasts.userLimitReached
    : currentLanguage === "es"
      ? `Has alcanzado el límite de usuarios (${userLimit}).`
      : currentLanguage === "pt"
        ? `Você atingiu o limite de usuários (${userLimit}).`
        : `You have reached the user limit (${userLimit}).`;

  const resolveUserErrorKey = (error: unknown) => {
    if (typeof error !== "string") return null;
    const normalized = error.toLowerCase();

    if (normalized.includes("cannot delete yourself")) return "cannotDelete";
    if (normalized.includes("at least one administrator"))
      return "mustHaveAdmin";
    if (normalized.includes("al menos un administrador"))
      return "mustHaveAdmin";
    if (normalized.includes("pelo menos um administrador"))
      return "mustHaveAdmin";
    if (normalized.includes("email") && normalized.includes("en uso"))
      return "emailInUse";
    if (
      normalized.includes("nombre de usuario") &&
      normalized.includes("en uso")
    )
      return "usernameInUse";
    if (normalized.includes("email") && normalized.includes("already"))
      return "emailInUse";
    if (normalized.includes("username") && normalized.includes("already"))
      return "usernameInUse";

    return null;
  };

  const normalizeUsername = (value: string) => value.trim().toLowerCase();

  const hasDuplicateUsername = (value: string, excludeId?: string) => {
    const normalized = normalizeUsername(value);
    if (!normalized) return false;
    return users.some(
      (existing) =>
        normalizeUsername(existing.username) === normalized &&
        existing._id !== excludeId,
    );
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);

    if (userData.role !== "admin") {
      router.push("/pos");
      return;
    }

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data?.users || []);
      } else if (response.status === 401) {
        toast.error(copy.toasts.sessionExpired);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.push("/auth/login");
      } else {
        toast.error(copy.toasts.loadingError);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(copy.toasts.loadingError);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (hasDuplicateUsername(formData.username)) {
      toast.error(copy.toasts.usernameInUse);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const rawDiscountLimit =
        formData.discountLimit === "" ? null : Number(formData.discountLimit);
      const normalizedLimit = normalizeDiscountLimit(rawDiscountLimit ?? null);
      if (
        typeof normalizedLimit === "number" &&
        normalizedLimit > MAX_DISCOUNT_PERCENT
      ) {
        toast.info(copy.toasts.discountLimitClamped);
      }
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          discountLimit:
            rawDiscountLimit === null
              ? null
              : clampDiscountLimit(rawDiscountLimit),
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        toast.success(copy.toasts.createSuccess);
        setShowModal(false);
        setFormData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          phone: "",
          discountLimit: "",
          role: "cashier",
        });
        fetchUsers();
      } else if (response.status === 401) {
        toast.error(copy.toasts.sessionExpired);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setShowModal(false);
        router.push("/auth/login");
      } else {
        const mappedKey = resolveUserErrorKey(data?.error);
        toast.error(
          copy.toasts[mappedKey as keyof typeof copy.toasts] ||
            data?.error ||
            copy.toasts.createError,
        );
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(copy.toasts.createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (systemUser: SystemUser) => {
    setUserToEdit(systemUser);
    setEditFormData({
      fullName: systemUser.fullName,
      username: systemUser.username,
      email: systemUser.email,
      password: "",
      phone: systemUser.phone || "",
      discountLimit:
        systemUser.discountLimit === null ||
        systemUser.discountLimit === undefined
          ? ""
          : String(systemUser.discountLimit),
      role: systemUser.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    setIsSubmitting(true);

    if (hasDuplicateUsername(editFormData.username, userToEdit._id)) {
      toast.error(copy.toasts.usernameInUse);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const rawDiscountLimit =
        editFormData.discountLimit === ""
          ? null
          : Number(editFormData.discountLimit);
      const normalizedLimit = normalizeDiscountLimit(rawDiscountLimit ?? null);
      if (
        typeof normalizedLimit === "number" &&
        normalizedLimit > MAX_DISCOUNT_PERCENT
      ) {
        toast.info(copy.toasts.discountLimitClamped);
      }
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userToEdit._id,
          ...editFormData,
          discountLimit:
            rawDiscountLimit === null
              ? null
              : clampDiscountLimit(rawDiscountLimit),
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        toast.success(copy.toasts.updateSuccess);
        setShowEditModal(false);
        setUserToEdit(null);
        setEditFormData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          phone: "",
          discountLimit: "",
          role: "cashier",
        });
        fetchUsers();
      } else if (response.status === 401) {
        toast.error(copy.toasts.sessionExpired);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setShowEditModal(false);
        router.push("/auth/login");
      } else {
        const mappedKey = resolveUserErrorKey(data?.error);
        toast.error(
          copy.toasts[mappedKey as keyof typeof copy.toasts] ||
            data?.error ||
            copy.toasts.updateError,
        );
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(copy.toasts.updateError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/users?id=${userToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success(copy.toasts.deleteSuccess);
        fetchUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
      } else if (response.status === 401) {
        toast.error(copy.toasts.sessionExpired);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setShowDeleteModal(false);
        router.push("/auth/login");
      } else {
        const data = await response.json();
        const mappedKey = resolveUserErrorKey(data.error);
        toast.error(
          copy.toasts[mappedKey as keyof typeof copy.toasts] ||
            data.error ||
            copy.toasts.deleteError,
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(copy.toasts.deleteError);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
      case "administrador":
        return "bg-purple-900/40 text-purple-200 border border-purple-700/50";
      case "supervisor":
        return "bg-green-900/40 text-green-200 border border-green-700/50";
      case "cashier":
      case "cajero":
        return "bg-blue-900/40 text-blue-200 border border-blue-700/50";
      default:
        return "bg-slate-800 text-slate-300 border border-slate-700";
    }
  };

  const getAvatarColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
      case "administrador":
        return "bg-purple-900/40 text-purple-200";
      case "supervisor":
        return "bg-green-900/40 text-green-200";
      case "cashier":
      case "cajero":
        return "bg-blue-900/40 text-blue-200";
      default:
        return "bg-slate-800 text-slate-300";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return copy.roles.admin;
      case "supervisor":
        return copy.roles.supervisor;
      case "cashier":
        return copy.roles.cashier;
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-slate-400">{copy.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 bg-white dark:bg-slate-950 dark:text-slate-100">
      <Header user={user} showBackButton={true} />

      <main className="p-6 mx-auto max-w-7xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-slate-200">
              <UserCog className="w-6 h-6 text-sky-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {copy.title}
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {copy.subtitle}
            </p>
            <div className="inline-flex items-center gap-3 px-3 py-2 mt-3 border rounded-lg bg-slate-100 border-slate-300 dark:bg-slate-900 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                {currentPlan.currentUsers}/{currentPlan.displayUserLimit}{" "}
                {copy.userCount} · {currentPlan.name}
              </span>
              <div className="w-32 h-1.5 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${Math.min((currentPlan.currentUsers / currentPlan.userLimit) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (users.length >= userLimit) {
                toast.error(userLimitReachedMessage);
                return;
              }
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
            disabled={users.length >= userLimit}
            style={
              users.length >= userLimit
                ? { opacity: 0.5, cursor: "not-allowed" }
                : {}
            }
          >
            <span className="text-lg leading-none">+</span>
            <span>{copy.newUserButton}</span>
          </button>
        </div>

        <div className="overflow-hidden bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-3 text-left">
                    {copy.tableHeaders.name}
                  </th>
                  <th className="px-6 py-3 text-left">
                    {copy.tableHeaders.username}
                  </th>
                  <th className="px-6 py-3 text-left">
                    {copy.tableHeaders.role}
                  </th>
                  <th className="px-6 py-3 text-left">
                    {copy.tableHeaders.discountLimit}
                  </th>
                  <th className="px-6 py-3 text-left">
                    {copy.tableHeaders.status}
                  </th>
                  <th className="px-6 py-3 text-left">
                    {copy.tableHeaders.createdDate}
                  </th>
                  <th className="px-6 py-3 text-left">
                    {copy.tableHeaders.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      {copy.loading}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-slate-400"
                    >
                      {copy.noUsers}
                    </td>
                  </tr>
                ) : (
                  users.map((systemUser) => (
                    <tr
                      key={systemUser._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarColor(
                              systemUser.role,
                            )}`}
                          >
                            {systemUser.role.toLowerCase() === "admin"
                              ? "A"
                              : "U"}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {systemUser.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 font-mono text-xs border rounded bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                          {systemUser.username}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                            systemUser.role,
                          )}`}
                        >
                          {getRoleLabel(systemUser.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {typeof systemUser.discountLimit === "number"
                          ? `${systemUser.discountLimit}%`
                          : copy.notDefined}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-300 rounded-full dark:text-green-200 dark:bg-green-900/40 dark:border-green-700/50">
                          {systemUser.isActive ? copy.active : copy.inactive}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {formatDate(systemUser.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(systemUser)}
                            className="p-2 text-blue-400 rounded-lg hover:text-blue-300 hover:bg-slate-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(
                                systemUser._id,
                                systemUser.fullName,
                              )
                            }
                            className="p-2 text-red-400 rounded-lg hover:text-red-300 hover:bg-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md mx-4 bg-white border rounded-lg shadow-xl border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {copy.modal.newUser}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {copy.modal.fullName}{" "}
                    <span className="text-red-600 dark:text-red-400">
                      {copy.modal.required}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.fullName}
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {copy.modal.username}{" "}
                    <span className="text-red-600 dark:text-red-400">
                      {copy.modal.required}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.username}
                    required
                    minLength={3}
                  />
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {copy.modal.hints.usernameUnique}
                  </p>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {copy.modal.email}{" "}
                    <span className="text-red-600 dark:text-red-400">
                      {copy.modal.required}
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.email}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {copy.modal.hints.emailUnique}
                  </p>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {copy.modal.password}{" "}
                    <span className="text-red-600 dark:text-red-400">
                      {copy.modal.required}
                    </span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.password}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {copy.modal.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.phone}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {copy.modal.discountLimit}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={MAX_DISCOUNT_PERCENT}
                    step={1}
                    value={formData.discountLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountLimit: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.discountLimit}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {copy.modal.role}{" "}
                    <span className="text-red-600 dark:text-red-400">
                      {copy.modal.required}
                    </span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    required
                  >
                    <option value="cashier">{copy.roleOptions.cashier}</option>
                    <option value="supervisor">
                      {copy.roleOptions.supervisor}
                    </option>
                    <option value="admin">{copy.roleOptions.admin}</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 font-medium rounded-lg text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
                    disabled={isSubmitting}
                  >
                    {copy.modal.buttons.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? copy.modal.buttons.creating
                      : copy.modal.buttons.create}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && userToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md mx-4 bg-white border rounded-lg shadow-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {copy.modal.editUser}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setUserToEdit(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-300">
                    {copy.modal.fullName}{" "}
                    <span className="text-red-600 dark:text-red-400">
                      {copy.modal.required}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.fullName}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-300">
                    {copy.modal.username}{" "}
                    <span className="text-red-600 dark:text-red-400">
                      {copy.modal.required}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.usernameEdit}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-300">
                    {copy.modal.email}{" "}
                    <span className="text-red-600 dark:text-red-400">
                      {copy.modal.required}
                    </span>
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.emailEdit}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-300">
                    {copy.modal.passwordOptional}
                  </label>
                  <input
                    type="password"
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.password}
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-300">
                    {copy.modal.phone}
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.phone}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-300">
                    {copy.modal.discountLimit}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={MAX_DISCOUNT_PERCENT}
                    step={1}
                    value={editFormData.discountLimit}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        discountLimit: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.discountLimit}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-300">
                    {copy.modal.role}{" "}
                    <span className="text-red-600 dark:text-red-400">
                      {copy.modal.required}
                    </span>
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        role: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    required
                  >
                    <option value="cashier">{copy.roleOptions.cashier}</option>
                    <option value="supervisor">
                      {copy.roleOptions.supervisor}
                    </option>
                    <option value="admin">{copy.roleOptions.admin}</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setUserToEdit(null);
                    }}
                    className="flex-1 px-4 py-2 font-medium rounded-lg text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
                    disabled={isSubmitting}
                  >
                    {copy.modal.buttons.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? copy.modal.buttons.updating
                      : copy.modal.buttons.update}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md mx-4 bg-white border rounded-lg shadow-xl border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-center text-slate-900 dark:text-white">
                  {copy.modal.deleteConfirm}
                </h2>
                <p className="mb-6 text-center text-slate-600 dark:text-slate-400">
                  {copy.modal.deleteMessage}{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    "{userToDelete.name}"
                  </span>
                  ? {copy.modal.deleteWarning}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setUserToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700"
                  >
                    {copy.modal.buttons.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-500"
                  >
                    {copy.modal.buttons.delete}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-500">
            {copy.footer}
          </p>
        </div>
      </main>
    </div>
  );
}
