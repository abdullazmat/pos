"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import {
  Keyboard,
  Save,
  RotateCcw,
  Zap,
  Calculator,
  Type,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface KeyboardShortcuts {
  searchProduct: string;
  quantity: string;
  applyDiscount: string;
  paymentMethod: string;
  finalizeSale: string;
  cancelSale: string;
  removeLastItem: string;
  openDrawer: string;
  addProduct: string;
  quickPayment: string;
}

interface KeyboardConfig {
  _id: string;
  profile: "classic" | "numeric" | "speedster" | "custom";
  shortcuts: KeyboardShortcuts;
}

export default function KeyboardConfigPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<KeyboardConfig | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>("classic");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [originalShortcuts, setOriginalShortcuts] =
    useState<KeyboardShortcuts | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [customShortcuts, setCustomShortcuts] = useState<KeyboardShortcuts>({
    searchProduct: "F2",
    quantity: "F3",
    applyDiscount: "F4",
    paymentMethod: "F5",
    finalizeSale: "F9",
    cancelSale: "F10",
    removeLastItem: "F8",
    openDrawer: "F11",
    addProduct: "Enter",
    quickPayment: "F12",
  });

  const profiles = [
    {
      id: "classic",
      name: "Clásico",
      icon: Type,
      description:
        "Teclas de función tradicionales (F1-F12). Ideal para teclados estándar.",
      shortcuts: {
        searchProduct: "F2",
        quantity: "F3",
        applyDiscount: "F4",
        paymentMethod: "F5",
        finalizeSale: "F9",
        cancelSale: "F10",
        removeLastItem: "F8",
        openDrawer: "F11",
        addProduct: "Enter",
        quickPayment: "F12",
      },
    },
    {
      id: "numeric",
      name: "Numérico Plus",
      icon: Calculator,
      description:
        "Optimizado para teclado numérico. Perfecto si usas constantemente el numpad para ingresar cantidades.",
      shortcuts: {
        searchProduct: "F2",
        quantity: "F3",
        applyDiscount: "F4",
        paymentMethod: "F5",
        finalizeSale: "F9",
        cancelSale: "F10",
        removeLastItem: "F8",
        openDrawer: "F11",
        addProduct: "Enter",
        quickPayment: "F12",
      },
    },
    {
      id: "speedster",
      name: "Velocista",
      icon: Zap,
      description:
        "Mano izquierda en teclas QWER + Space. Ultra rápido para cajeros expertos con scanner en mano derecha.",
      shortcuts: {
        searchProduct: "Q",
        quantity: "W",
        applyDiscount: "E",
        paymentMethod: "R",
        finalizeSale: "Space",
        cancelSale: "Escape",
        removeLastItem: "Backspace",
        openDrawer: "F11",
        addProduct: "Enter",
        quickPayment: "F12",
      },
    },
  ];

  const shortcutActions = [
    {
      key: "searchProduct",
      label: "Buscar Producto",
      description: "Enfoca el campo de búsqueda de productos",
    },
    {
      key: "quantity",
      label: "Cantidad",
      description: "Enfoca el campo de cantidad",
    },
    {
      key: "applyDiscount",
      label: "Aplicar Descuento",
      description: "Abre el diálogo de descuento",
    },
    {
      key: "paymentMethod",
      label: "Método de Pago",
      description: "Cambia el método de pago",
    },
    {
      key: "finalizeSale",
      label: "Finalizar Venta",
      description: "Procesa y finaliza la venta actual",
    },
    {
      key: "cancelSale",
      label: "Cancelar Venta",
      description: "Cancela la venta actual y limpia el carrito",
    },
    {
      key: "removeLastItem",
      label: "Eliminar Último Item",
      description: "Elimina el último producto agregado",
    },
    {
      key: "openDrawer",
      label: "Abrir Cajón",
      description: "Abre el cajón de dinero",
    },
    {
      key: "addProduct",
      label: "Agregar Producto",
      description: "Agrega el producto al carrito (después de buscar)",
    },
    {
      key: "quickPayment",
      label: "Pago Rápido",
      description: "Finaliza con pago exacto en efectivo",
    },
  ];

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    fetchConfig();
  }, [router]);

  useEffect(() => {
    // Listen for keydown events when editing a key
    if (editingKey) {
      const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Handle Escape to cancel editing
        if (e.key === "Escape") {
          setEditingKey(null);
          return;
        }

        // Build the key string
        let keyString = "";
        if (e.ctrlKey) keyString += "Ctrl+";
        if (e.altKey) keyString += "Alt+";
        if (e.shiftKey) keyString += "Shift+";

        // Get the actual key
        if (e.key === " ") {
          keyString += "Space";
        } else if (e.key === "Enter") {
          keyString += "Enter";
        } else if (e.key === "Backspace") {
          keyString += "Backspace";
        } else if (e.key.startsWith("F") && /^F\d+$/.test(e.key)) {
          keyString += e.key;
        } else if (e.key.length === 1) {
          keyString += e.key.toUpperCase();
        } else {
          keyString += e.key;
        }

        handleKeyChange(editingKey, keyString);
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }

    return undefined;
  }, [editingKey]);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/keyboard-config", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.data?.config || null);
        if (data.data?.config) {
          setSelectedProfile(data.data.config.profile);
          setCustomShortcuts(data.data.config.shortcuts);
          setOriginalShortcuts(data.data.config.shortcuts);
          setHasChanges(false);
        }
      } else if (response.status === 401) {
        toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId);
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setCustomShortcuts(profile.shortcuts);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    // Check for duplicate keys
    const values = Object.values(customShortcuts);
    const uniqueValues = new Set(values);
    if (values.length !== uniqueValues.size) {
      toast.error(
        "No puedes tener teclas duplicadas. Por favor, verifica tu configuración.",
      );
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/keyboard-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profile: selectedProfile,
          shortcuts: customShortcuts,
        }),
      });

      if (response.ok) {
        toast.success("Configuración guardada exitosamente");
        setHasChanges(false);
        fetchConfig();
      } else if (response.status === 401) {
        toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
        router.push("/auth/login");
      } else {
        const data = await response.json();
        toast.error(data.error || "Error al guardar configuración");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/keyboard-config", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Configuración restablecida");
        setHasChanges(false);
        fetchConfig();
      } else {
        toast.error("Error al restablecer configuración");
      }
    } catch (error) {
      console.error("Error resetting config:", error);
      toast.error("Error al restablecer configuración");
    }
  };

  const handleKeyEdit = (actionKey: string) => {
    setEditingKey(actionKey);
  };

  const handleKeyChange = (actionKey: string, newKey: string) => {
    setCustomShortcuts((prev) => ({
      ...prev,
      [actionKey]: newKey,
    }));
    setSelectedProfile("custom");
    setEditingKey(null);
    setHasChanges(true);
  };

  const handleDeleteKey = (actionKey: string) => {
    // Reset to default value for the action
    const defaultShortcuts = {
      searchProduct: "F2",
      quantity: "F3",
      applyDiscount: "F4",
      paymentMethod: "F5",
      finalizeSale: "F9",
      cancelSale: "F10",
      removeLastItem: "F8",
      openDrawer: "F11",
      addProduct: "Enter",
      quickPayment: "F12",
    };

    setCustomShortcuts((prev) => ({
      ...prev,
      [actionKey]: defaultShortcuts[actionKey as keyof KeyboardShortcuts],
    }));
    setSelectedProfile("custom");
    setHasChanges(true);
    toast.info("Tecla restablecida al valor por defecto");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-slate-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header user={user} showBackButton={true} />

      <main className="p-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Keyboard className="w-7 h-7 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">
              Configuración de Teclas
            </h1>
          </div>
          <p className="text-slate-400">
            Personaliza los atajos de teclado para agilizar tu trabajo en el
            punto de venta
          </p>
        </div>

        {/* Instructions */}
        <div className="p-5 mb-8 bg-blue-900/20 border border-blue-800/50 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">
            Instrucciones:
          </h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li>
              • Selecciona un perfil predefinido o personaliza cada tecla
              individualmente
            </li>
            <li>
              • Haz clic en el botón "Editar" junto a la acción que quieres
              configurar
            </li>
            <li>
              • Presiona la tecla o combinación de teclas que deseas asignar
            </li>
            <li>
              • Puedes usar teclas de función (F1-F12), letras, números o
              combinaciones con Ctrl, Alt y Shift
            </li>
            <li>• Presiona ESC para cancelar la edición</li>
            <li>• Asegúrate de no tener teclas duplicadas antes de guardar</li>
          </ul>
        </div>

        {/* Predefined Profiles */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Perfiles Predefinidos
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Selecciona un perfil optimizado según tu estilo de trabajo o
            personaliza las teclas manualmente
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profiles.map((profile) => {
              const Icon = profile.icon;
              const isSelected = selectedProfile === profile.id;
              return (
                <button
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile.id)}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-blue-500 bg-blue-900/30"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon
                      className={`w-6 h-6 ${isSelected ? "text-blue-400" : "text-slate-400"}`}
                    />
                    <h3 className="text-lg font-bold text-white">
                      {profile.name}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400">
                    {profile.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Individual Customization */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Personalización Individual
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Configura cada atajo de teclado según tus preferencias
          </p>

          <div className="space-y-3">
            {shortcutActions.map((action) => (
              <div
                key={action.key}
                className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {action.label}
                  </h3>
                  <p className="text-sm text-slate-400">{action.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {editingKey === action.key ? (
                    <div className="px-4 py-2 bg-yellow-900/30 border border-yellow-600 rounded-lg font-mono text-sm text-yellow-300 min-w-[120px] text-center animate-pulse">
                      Presiona una tecla...
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm text-blue-300 min-w-[120px] text-center">
                      {customShortcuts[action.key as keyof KeyboardShortcuts]}
                    </div>
                  )}
                  <button
                    onClick={() => handleKeyEdit(action.key)}
                    disabled={editingKey !== null && editingKey !== action.key}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-slate-200 rounded-lg font-medium transition-colors text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteKey(action.key)}
                    disabled={editingKey !== null}
                    className="px-3 py-2 bg-red-900/20 hover:bg-red-900/40 disabled:bg-slate-900 disabled:cursor-not-allowed text-red-300 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={handleReset}
            disabled={saving || editingKey !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-slate-200 rounded-lg font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer Valores por Defecto
          </button>

          <div className="flex items-center gap-2">
            {editingKey && (
              <div className="flex items-center gap-2 text-sm text-yellow-400 mr-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                Editando tecla...
              </div>
            )}
            {hasChanges && !editingKey && (
              <div className="flex items-center gap-2 text-sm text-amber-400 mr-4">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                Cambios sin guardar
              </div>
            )}
            {!hasChanges && !editingKey && config && (
              <div className="flex items-center gap-2 text-sm text-green-400 mr-4">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Configuración guardada
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving || editingKey !== null || !hasChanges}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-5 bg-amber-900/20 border border-amber-800/50 rounded-xl">
          <h3 className="text-lg font-semibold text-amber-300 mb-3">
            💡 Consejos:
          </h3>
          <ul className="space-y-2 text-sm text-amber-200">
            <li>• Las teclas F1-F12 son ideales para acciones principales</li>
            <li>
              • Usa Ctrl+Letra para acciones secundarias (ej: Ctrl+D para
              descuento)
            </li>
            <li>• Mantén Enter para agregar productos, es el estándar</li>
            <li>
              • Asigna teclas cercanas al teclado numérico si usas scanner de
              códigos
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
