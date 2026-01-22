"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function AdminPage() {
  const router = useRouter();
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
  const [userToEdit, setUserToEdit] = useState<SystemUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "cashier" as "admin" | "supervisor" | "cashier",
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "cashier" as "admin" | "supervisor" | "cashier",
  });

  const currentPlan = {
    name: "Básico",
    userLimit: 10,
    currentUsers: users.length,
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    setUser(userData);
    fetchUsers();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true);
      }
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        toast.error("Sesión expirada, vuelve a iniciar sesión");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        router.push("/auth/login");
        return;
      }

      if (response.status === 403) {
        toast.error("No tienes permisos para ver usuarios");
        router.push("/dashboard");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data?.users || []);
      } else {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.error || "Error al cargar usuarios";
        toast.error(message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.username ||
      !formData.email ||
      !formData.password
    ) {
      toast.warning("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.password.length < 6) {
      toast.warning("La contraseña debe tener al menos 6 caracteres");
      return;
    }

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
        toast.success("Usuario creado exitosamente");
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
      } else {
        toast.error(data.error || "Error al crear usuario");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Error al crear usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const handleEditClick = (user: SystemUser) => {
    setUserToEdit(user);
    setEditFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      password: "",
      phone: user.phone || "",
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userToEdit) return;

    if (
      !editFormData.fullName ||
      !editFormData.username ||
      !editFormData.email
    ) {
      toast.warning("Por favor completa todos los campos obligatorios");
      return;
    }

    if (editFormData.password && editFormData.password.length < 6) {
      toast.warning("La contraseña debe tener al menos 6 caracteres");
      return;
    }

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
        toast.success("Usuario actualizado exitosamente");
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
      } else {
        toast.error(data.error || "Error al actualizar usuario");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error al actualizar usuario");
    } finally {
      setIsSubmitting(false);
    }
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
        toast.success("Usuario eliminado exitosamente");
        fetchUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar usuario");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
      case "administrador":
        return "bg-purple-100 text-purple-700";
      case "supervisor":
        return "bg-green-100 text-green-700";
      case "cashier":
      case "cajero":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getAvatarColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
      case "administrador":
        return "bg-purple-100 text-purple-600";
      case "supervisor":
        return "bg-green-100 text-green-600";
      case "cashier":
      case "cajero":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "Administrador";
      case "supervisor":
        return "Supervisor";
      case "cashier":
        return "Cajero";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showBackButton={true} />

      <main className="p-6 mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <UserCog className="w-6 h-6 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
          </div>
          <p className="text-gray-600">
            Administra cajeros y administradores del sistema
          </p>
        </div>

        {/* Plan Limit Warning */}
        <div className="p-4 mb-6 border border-red-200 bg-red-50 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠</span>
              <span className="font-semibold text-red-900">
                {currentPlan.currentUsers}/{currentPlan.userLimit} usuarios -{" "}
                {currentPlan.name}
              </span>
            </div>
          </div>
          <div className="w-full h-2 mb-3 bg-red-200 rounded-full">
            <div
              className="h-2 bg-red-600 rounded-full"
              style={{
                width: `${
                  (currentPlan.currentUsers / currentPlan.userLimit) * 100
                }%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-red-800">
            Has alcanzado el límite de {currentPlan.userLimit} usuarios del Plan{" "}
            {currentPlan.name}. Actualiza al Plan Profesional para tener 5
            usuarios.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <span>+</span>
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                    Límite Desc. %
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  users.map((systemUser) => (
                    <tr key={systemUser._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(
                              systemUser.role
                            )}`}
                          >
                            {systemUser.role.toLowerCase() === "admin" ? (
                              <span className="text-lg">👑</span>
                            ) : (
                              <span className="text-lg">👤</span>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">
                            {systemUser.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 font-mono text-sm text-gray-700 bg-gray-100 rounded">
                          {systemUser.username}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                            systemUser.role
                          )}`}
                        >
                          {getRoleLabel(systemUser.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">No definido</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                          {systemUser.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">
                          {new Date(systemUser.createdAt).toLocaleDateString(
                            "es-AR"
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(systemUser)}
                            className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(
                                systemUser._id,
                                systemUser.fullName
                              )
                            }
                            className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Nuevo Usuario
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="juanperez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="juan@ejemplo.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="cashier">Cajero</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creando..." : "Crear Usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && userToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Editar Usuario
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setUserToEdit(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario <span className="text-red-500">*</span>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="juanperez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="juan@ejemplo.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña (dejar en blanco para no cambiar)
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        role: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="cashier">Cajero</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setUserToEdit(null);
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Actualizando..." : "Actualizar Usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                  ¿Eliminar Usuario?
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  ¿Estás seguro de eliminar al usuario{" "}
                  <span className="font-semibold">"{userToDelete.name}"</span>?
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setUserToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Sistema POS © 2025 - Desarrollado para negocios pequeños
          </p>
        </div>
      </main>
    </div>
  );
}
