"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import { UserCog, Edit, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";

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
  const copy = ADMIN_COPY[currentLanguage] || ADMIN_COPY["es"];

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
    role: "cashier" as "admin" | "supervisor" | "cashier",
  });
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "cashier" as "admin" | "supervisor" | "cashier",
  });

  const currentPlan = {
    name: copy.planName,
    userLimit: 2,
    currentUsers: users.length,
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

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(copy.toasts.createSuccess);
        setShowModal(false);
        setFormData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          phone: "",
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
        toast.error(data.error || copy.toasts.createError);
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
      role: systemUser.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userToEdit._id,
          ...editFormData,
        }),
      });

      const data = await response.json();

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
        toast.error(data.error || copy.toasts.updateError);
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
        toast.error(data.error || copy.toasts.deleteError);
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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
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
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {copy.subtitle}
            </p>
            <div className="mt-3 inline-flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 dark:bg-slate-900 dark:border-slate-800">
              <span className="text-sm text-slate-900 font-semibold dark:text-slate-200">
                {currentPlan.currentUsers}/{currentPlan.userLimit}{" "}
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
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            <span>{copy.newUserButton}</span>
          </button>
        </div>

        <div className="overflow-hidden bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300">
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
                      className="hover:bg-slate-50 dark:hover:bg-slate-850"
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
                        <span className="px-2 py-1 font-mono text-xs bg-slate-100 border border-slate-300 rounded text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
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
                        {copy.notDefined}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full border border-green-300 dark:text-green-200 dark:bg-green-900/40 dark:border-green-700/50">
                          {systemUser.isActive ? copy.active : copy.inactive}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {new Date(systemUser.createdAt).toLocaleDateString(
                          currentLanguage === "es"
                            ? "es-AR"
                            : currentLanguage === "pt"
                              ? "pt-BR"
                              : "en-US",
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(systemUser)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg"
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
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg"
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
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md mx-4 dark:bg-slate-900 dark:border-slate-800">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.fullName}
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.username}
                    required
                    minLength={3}
                  />
                  <p className="text-xs text-slate-600 mt-1 dark:text-slate-400">
                    {copy.modal.hints.usernameUnique}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.email}
                    required
                  />
                  <p className="text-xs text-slate-600 mt-1 dark:text-slate-400">
                    {copy.modal.hints.emailUnique}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.password}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                    {copy.modal.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.phone}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
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
                    className="flex-1 px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 font-medium dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
                    disabled={isSubmitting}
                  >
                    {copy.modal.buttons.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4">
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
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.fullName}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.usernameEdit}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.emailEdit}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.password}
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder={copy.modal.placeholders.phone}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1">
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
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
                    className="flex-1 px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 font-medium dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
                    disabled={isSubmitting}
                  >
                    {copy.modal.buttons.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md mx-4 dark:bg-slate-900 dark:border-slate-800">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-center text-slate-900 mb-2 dark:text-white">
                  {copy.modal.deleteConfirm}
                </h2>
                <p className="text-center text-slate-600 mb-6 dark:text-slate-400">
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
                    className="flex-1 px-4 py-2 text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 font-medium"
                  >
                    {copy.modal.buttons.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-500 font-medium"
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
