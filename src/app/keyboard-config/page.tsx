"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
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

const KEYBOARD_COPY = {
  es: {
    title: "Configuración del Teclado",
    subtitle: "Personaliza tus atajos de teclado",
    profiles: {
      classic: {
        name: "Clásico",
        description:
          "Teclas de función tradicionales (F1-F12). Ideal para teclados estándar.",
      },
      numeric: {
        name: "Numérico Plus",
        description:
          "Optimizado para teclado numérico. Perfecto si usas constantemente el numpad para ingresar cantidades.",
      },
      speedster: {
        name: "Velocista",
        description:
          "Mano izquierda en teclas QWER + Space. Ultra rápido para cajeros expertos con scanner en mano derecha.",
      },
    },
    shortcuts: {
      searchProduct: {
        label: "Buscar Producto",
        description: "Enfoca el campo de búsqueda de productos",
      },
      quantity: {
        label: "Cantidad",
        description: "Enfoca el campo de cantidad",
      },
      applyDiscount: {
        label: "Aplicar Descuento",
        description: "Abre el diálogo de descuento",
      },
      paymentMethod: {
        label: "Método de Pago",
        description: "Cambia el método de pago",
      },
      finalizeSale: {
        label: "Finalizar Venta",
        description: "Procesa y finaliza la venta actual",
      },
      cancelSale: {
        label: "Cancelar Venta",
        description: "Cancela la venta actual y limpia el carrito",
      },
      removeLastItem: {
        label: "Eliminar Último Item",
        description: "Elimina el último producto agregado",
      },
      openDrawer: {
        label: "Abrir Cajón",
        description: "Abre el cajón de dinero",
      },
      addProduct: {
        label: "Agregar Producto",
        description: "Agrega el producto al carrito (después de buscar)",
      },
      quickPayment: {
        label: "Pago Rápido",
        description: "Finaliza con pago exacto en efectivo",
      },
    },
    selectProfile:
      "Selecciona un perfil optimizado según tu estilo de trabajo o crea uno personalizado",
    predefinedProfiles: "Perfiles Predefinidos",
    custom: {
      title: "Configuración Manual",
      description: "Asigna tus propias teclas a cada acción",
    },
    buttons: {
      save: "Guardar Cambios",
      reset: "Revertir Cambios",
      customize: "Personalizar",
    },
    hints: {
      hint1:
        "Puedes usar teclas de función (F1-F12), letras, números o teclas especiales",
      hint2: "Los cambios se guardarán automáticamente",
      hint3: "Usa teclas cercanas para mayor rapidez",
      hint4:
        "Asigna teclas cercanas al teclado numérico si usas scanner de códigos",
    },
    messages: {
      saved: "Configuración guardada correctamente",
      error: "Error al guardar la configuración",
      reset: "Cambios revertidos",
      duplicateKeys:
        "No puedes tener teclas duplicadas. Por favor, verifica tu configuración.",
      resetting: "Configuración restablecida",
      resetError: "Error al restablecer configuración",
      keyReset: "Tecla restablecida al valor por defecto",
      instructions: "Instrucciones:",
      instructionLine1:
        "Selecciona un perfil predefinido o personaliza cada tecla individualmente",
      instructionLine2:
        'Haz clic en el botón "Editar" junto a la acción que quieres configurar',
      instructionLine3:
        "Presiona la tecla o combinación de teclas que deseas asignar",
      instructionLine4:
        "Puedes usar teclas de función (F1-F12), letras, números o combinaciones con Ctrl, Alt y Shift",
      instructionLine5: "Presiona ESC para cancelar la edición",
      instructionLine6:
        "Asegúrate de no tener teclas duplicadas antes de guardar",
      loading: "Cargando...",
      pressKey: "Presiona una tecla...",
      edit: "Editar",
      resetDefaults: "Restablecer Valores por Defecto",
      editing: "Editando tecla...",
      unsavedChanges: "Cambios sin guardar",
      configSaved: "Configuración guardada",
      tips: "💡 Consejos:",
      tip1: "Las teclas F1-F12 son ideales para acciones principales",
      tip2: "Usa Ctrl+Letra para acciones secundarias (ej: Ctrl+D para descuento)",
      tip3: "Mantén Enter para agregar productos, es el estándar",
      tip4: "Asigna teclas cercanas al teclado numérico si usas scanner de códigos",
    },
  },
  en: {
    title: "Keyboard Configuration",
    subtitle: "Customize your keyboard shortcuts",
    profiles: {
      classic: {
        name: "Classic",
        description:
          "Traditional function keys (F1-F12). Ideal for standard keyboards.",
      },
      numeric: {
        name: "Numeric Plus",
        description:
          "Optimized for numeric keypad. Perfect if you constantly use the numpad to enter quantities.",
      },
      speedster: {
        name: "Speedster",
        description:
          "Left hand on QWER + Space keys. Ultra-fast for expert cashiers with scanner in right hand.",
      },
    },
    shortcuts: {
      searchProduct: {
        label: "Search Product",
        description: "Focus the product search field",
      },
      quantity: {
        label: "Quantity",
        description: "Focus the quantity field",
      },
      applyDiscount: {
        label: "Apply Discount",
        description: "Opens the discount dialog",
      },
      paymentMethod: {
        label: "Payment Method",
        description: "Changes the payment method",
      },
      finalizeSale: {
        label: "Finalize Sale",
        description: "Processes and finalizes the current sale",
      },
      cancelSale: {
        label: "Cancel Sale",
        description: "Cancels the current sale and clears the cart",
      },
      removeLastItem: {
        label: "Remove Last Item",
        description: "Removes the last added product",
      },
      openDrawer: {
        label: "Open Drawer",
        description: "Opens the cash drawer",
      },
      addProduct: {
        label: "Add Product",
        description: "Adds the product to cart (after search)",
      },
      quickPayment: {
        label: "Quick Payment",
        description: "Finalize with exact cash payment",
      },
    },
    selectProfile:
      "Select an optimized profile based on your work style or create a custom one",
    predefinedProfiles: "Predefined Profiles",
    custom: {
      title: "Custom Configuration",
      description: "Assign your own keys to each action",
    },
    buttons: {
      save: "Save Changes",
      reset: "Revert Changes",
      customize: "Customize",
    },
    hints: {
      hint1:
        "You can use function keys (F1-F12), letters, numbers, or special keys",
      hint2: "Changes will be saved automatically",
      hint3: "Use adjacent keys for faster input",
      hint4:
        "Assign keys close to the numeric keypad if you use barcode scanner",
    },
    messages: {
      saved: "Configuration saved successfully",
      error: "Error saving configuration",
      reset: "Changes reverted",
      duplicateKeys:
        "You cannot have duplicate keys. Please check your configuration.",
      resetting: "Configuration reset",
      resetError: "Error resetting configuration",
      keyReset: "Key reset to default value",
      instructions: "Instructions:",
      instructionLine1:
        "Select a predefined profile or customize each key individually",
      instructionLine2:
        'Click the "Edit" button next to the action you want to configure',
      instructionLine3: "Press the key or key combination you want to assign",
      instructionLine4:
        "You can use function keys (F1-F12), letters, numbers or combinations with Ctrl, Alt and Shift",
      instructionLine5: "Press ESC to cancel editing",
      instructionLine6: "Make sure you don't have duplicate keys before saving",
      loading: "Loading...",
      pressKey: "Press a key...",
      edit: "Edit",
      resetDefaults: "Reset to Default Values",
      editing: "Editing key...",
      unsavedChanges: "Unsaved changes",
      configSaved: "Configuration saved",
      tips: "💡 Tips:",
      tip1: "F1-F12 keys are ideal for main actions",
      tip2: "Use Ctrl+Letter for secondary actions (e.g., Ctrl+D for discount)",
      tip3: "Keep Enter to add products, it's the standard",
      tip4: "Assign keys close to the numeric keypad if you use barcode scanner",
    },
  },
  pt: {
    title: "Configuração do Teclado",
    subtitle: "Personalize seus atalhos de teclado",
    profiles: {
      classic: {
        name: "Clássico",
        description:
          "Teclas de função tradicionais (F1-F12). Ideal para teclados padrão.",
      },
      numeric: {
        name: "Numérico Plus",
        description:
          "Otimizado para teclado numérico. Perfeito se você usar constantemente o numpad para inserir quantidades.",
      },
      speedster: {
        name: "Velocista",
        description:
          "Mão esquerda nas teclas QWER + Space. Ultra rápido para caixas experientes com scanner na mão direita.",
      },
    },
    shortcuts: {
      searchProduct: {
        label: "Pesquisar Produto",
        description: "Coloca o foco no campo de pesquisa de produtos",
      },
      quantity: {
        label: "Quantidade",
        description: "Coloca o foco no campo de quantidade",
      },
      applyDiscount: {
        label: "Aplicar Desconto",
        description: "Abre a caixa de diálogo de desconto",
      },
      paymentMethod: {
        label: "Método de Pagamento",
        description: "Muda o método de pagamento",
      },
      finalizeSale: {
        label: "Finalizar Venda",
        description: "Processa e finaliza a venda atual",
      },
      cancelSale: {
        label: "Cancelar Venda",
        description: "Cancela a venda atual e limpa o carrinho",
      },
      removeLastItem: {
        label: "Remover Último Item",
        description: "Remove o último produto adicionado",
      },
      openDrawer: {
        label: "Abrir Gaveta",
        description: "Abre a gaveta de dinheiro",
      },
      addProduct: {
        label: "Adicionar Produto",
        description: "Adiciona o produto ao carrinho (após pesquisa)",
      },
      quickPayment: {
        label: "Pagamento Rápido",
        description: "Finaliza com pagamento exato em dinheiro",
      },
    },
    selectProfile:
      "Selecione um perfil otimizado com base no seu estilo de trabalho ou crie um personalizado",
    predefinedProfiles: "Perfis Predefinidos",
    custom: {
      title: "Configuração Personalizada",
      description: "Atribua suas próprias teclas a cada ação",
    },
    buttons: {
      save: "Salvar Alterações",
      reset: "Reverter Alterações",
      customize: "Personalizar",
    },
    hints: {
      hint1:
        "Você pode usar teclas de função (F1-F12), letras, números ou teclas especiais",
      hint2: "As alterações serão salvas automaticamente",
      hint3: "Use teclas adjacentes para inserção mais rápida",
      hint4:
        "Atribua teclas próximas ao teclado numérico se usar leitor de código de barras",
    },
    messages: {
      saved: "Configuração salva com sucesso",
      error: "Erro ao salvar a configuração",
      reset: "Alterações revertidas",
      duplicateKeys:
        "Você não pode ter teclas duplicadas. Por favor, verifique sua configuração.",
      resetting: "Configuração resetada",
      resetError: "Erro ao resetar configuração",
      keyReset: "Tecla resetada ao valor padrão",
      instructions: "Instruções:",
      instructionLine1:
        "Selecione um perfil predefinido ou personalize cada tecla individualmente",
      instructionLine2:
        'Clique no botão "Editar" ao lado da ação que deseja configurar',
      instructionLine3:
        "Pressione a tecla ou combinação de teclas que deseja atribuir",
      instructionLine4:
        "Você pode usar teclas de função (F1-F12), letras, números ou combinações com Ctrl, Alt e Shift",
      instructionLine5: "Pressione ESC para cancelar a edição",
      instructionLine6:
        "Certifique-se de não ter teclas duplicadas antes de salvar",
      loading: "Carregando...",
      pressKey: "Pressione uma tecla...",
      edit: "Editar",
      resetDefaults: "Redefinir para Valores Padrão",
      editing: "Editando tecla...",
      unsavedChanges: "Alterações não salvas",
      configSaved: "Configuração salva",
      tips: "💡 Dicas:",
      tip1: "As teclas F1-F12 são ideais para ações principais",
      tip2: "Use Ctrl+Letra para ações secundárias (ex: Ctrl+D para desconto)",
      tip3: "Mantenha Enter para adicionar produtos, é o padrão",
      tip4: "Atribua teclas próximas ao teclado numérico se usar leitor de código de barras",
    },
  },
};

export default function KeyboardConfigPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
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

  const copy =
    KEYBOARD_COPY[currentLanguage as keyof typeof KEYBOARD_COPY] ||
    KEYBOARD_COPY.es;

  const profiles = [
    {
      id: "classic",
      icon: Type,
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
      icon: Calculator,
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
      icon: Zap,
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

  const getProfileName = (profileId: string) => {
    return (
      copy.profiles[profileId as keyof typeof copy.profiles]?.name || profileId
    );
  };

  const getProfileDescription = (profileId: string) => {
    return (
      copy.profiles[profileId as keyof typeof copy.profiles]?.description || ""
    );
  };

  const shortcutActions = [
    "searchProduct",
    "quantity",
    "applyDiscount",
    "paymentMethod",
    "finalizeSale",
    "cancelSale",
    "removeLastItem",
    "openDrawer",
    "addProduct",
    "quickPayment",
  ].map((key) => ({
    key,
    label: copy.shortcuts[key as keyof typeof copy.shortcuts]?.label || key,
    description:
      copy.shortcuts[key as keyof typeof copy.shortcuts]?.description || "",
  }));

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
      toast.error(copy.messages.duplicateKeys);
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
        toast.success(copy.messages.saved);
        setHasChanges(false);
        fetchConfig();
      } else if (response.status === 401) {
        toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
        router.push("/auth/login");
      } else {
        const data = await response.json();
        toast.error(data.error || copy.messages.error);
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error(copy.messages.error);
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
        toast.success(copy.messages.resetting);
        setHasChanges(false);
        fetchConfig();
      } else {
        toast.error(copy.messages.resetError);
      }
    } catch (error) {
      console.error("Error resetting config:", error);
      toast.error(copy.messages.resetError);
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
    toast.info(copy.messages.keyReset);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-slate-400">
          {copy.messages.loading || "Cargando..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <Header user={user} showBackButton={true} />

      <main className="p-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Keyboard className="w-7 h-7 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">{copy.title}</h1>
          </div>
          <p className="text-slate-400">{copy.subtitle}</p>
        </div>

        {/* Instructions */}
        <div className="p-5 mb-8 bg-blue-900/20 border border-blue-800/50 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">
            {copy.messages.instructions}
          </h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li>• {copy.messages.instructionLine1}</li>
            <li>• {copy.messages.instructionLine2}</li>
            <li>• {copy.messages.instructionLine3}</li>
            <li>• {copy.messages.instructionLine4}</li>
            <li>• {copy.messages.instructionLine5}</li>
            <li>• {copy.messages.instructionLine6}</li>
          </ul>
        </div>

        {/* Predefined Profiles */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            {copy.predefinedProfiles}
          </h2>
          <p className="text-slate-400 text-sm mb-4">{copy.selectProfile}</p>

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
                      {getProfileName(profile.id)}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400">
                    {getProfileDescription(profile.id)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Individual Customization */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            {copy.custom.title}
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            {copy.custom.description}
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
                      {copy.messages.pressKey}
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
                    {copy.messages.edit}
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
            {copy.messages.resetDefaults}
          </button>

          <div className="flex items-center gap-2">
            {editingKey && (
              <div className="flex items-center gap-2 text-sm text-yellow-400 mr-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                {copy.messages.editing}
              </div>
            )}
            {hasChanges && !editingKey && (
              <div className="flex items-center gap-2 text-sm text-amber-400 mr-4">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                {copy.messages.unsavedChanges}
              </div>
            )}
            {!hasChanges && !editingKey && config && (
              <div className="flex items-center gap-2 text-sm text-green-400 mr-4">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {copy.messages.configSaved}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving || editingKey !== null || !hasChanges}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? copy.messages.saving : copy.buttons.save}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-5 bg-amber-900/20 border border-amber-800/50 rounded-xl">
          <h3 className="text-lg font-semibold text-amber-300 mb-3">
            {copy.messages.tips}
          </h3>
          <ul className="space-y-2 text-sm text-amber-200">
            <li>• {copy.messages.tip1}</li>
            <li>• {copy.messages.tip2}</li>
            <li>• {copy.messages.tip3}</li>
            <li>• {copy.messages.tip4}</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
