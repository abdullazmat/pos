"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import SubscriptionProModal from "@/components/business-config/SubscriptionProModal";
import SubscriptionFreePlanModal from "@/components/business-config/SubscriptionFreePlanModal";
import SubscriptionPremiumModal from "@/components/business-config/SubscriptionPremiumModal";
import { Eye, Star, Crown } from "lucide-react";
import { toast } from "react-toastify";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billing: string;
  description: string;
  limits: string[];
  icon: string;
  popular: boolean;
  features: Record<string, any>;
}

interface BusinessConfig {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  cuitRucDni: string;
  ticketMessage: string;
}

interface Subscription {
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

const CONFIG_COPY = {
  es: {
    title: "Configuración del Negocio",
    subtitle: "Administra tu información comercial y planes",
    sections: {
      logo: "Logo del Negocio",
      businessInfo: "Información de Negocio",
      plans: "Gestión de Planes",
    },
    businessForm: {
      businessName: "Nombre del Negocio",
      address: "Dirección",
      phone: "Teléfono",
      email: "Email",
      website: "Sitio Web",
      cuitRucDni: "CUIT/RUC/DNI",
      ticketMessage: "Mensaje en Ticket",
    },
    buttons: {
      save: "Guardar Cambios",
      saving: "Guardando...",
      subscribe: "Suscribirse",
      selectPlan: "Seleccionar Plan",
    },
    messages: {
      saved: "Configuración guardada exitosamente",
      savingError: "Error al guardar la configuración",
      alreadySubscribed: "Ya estás suscrito a este plan",
      subscriptionUpdated: (planName: string) =>
        `¡Suscripción actualizada a ${planName}!`,
      subscriptionError: "Error al actualizar suscripción",
      loading: "Cargando...",
    },
  },
  en: {
    title: "Business Configuration",
    subtitle: "Manage your business information and plans",
    sections: {
      logo: "Business Logo",
      businessInfo: "Business Information",
      plans: "Plan Management",
    },
    businessForm: {
      businessName: "Business Name",
      address: "Address",
      phone: "Phone",
      email: "Email",
      website: "Website",
      cuitRucDni: "CUIT/RUC/DNI",
      ticketMessage: "Ticket Message",
    },
    buttons: {
      save: "Save Changes",
      saving: "Saving...",
      subscribe: "Subscribe",
      selectPlan: "Select Plan",
    },
    messages: {
      saved: "Configuration saved successfully",
      savingError: "Error saving configuration",
      alreadySubscribed: "You are already subscribed to this plan",
      subscriptionUpdated: (planName: string) =>
        `Subscription updated to ${planName}!`,
      subscriptionError: "Error updating subscription",
      loading: "Loading...",
    },
  },
  pt: {
    title: "Configuração do Negócio",
    subtitle: "Gerencie suas informações comerciais e planos",
    sections: {
      logo: "Logo do Negócio",
      businessInfo: "Informações do Negócio",
      plans: "Gerenciamento de Planos",
    },
    businessForm: {
      businessName: "Nome do Negócio",
      address: "Endereço",
      phone: "Telefone",
      email: "Email",
      website: "Site",
      cuitRucDni: "CUIT/RUC/DNI",
      ticketMessage: "Mensagem do Recibo",
    },
    buttons: {
      save: "Salvar Alterações",
      saving: "Salvando...",
      subscribe: "Inscrever-se",
      selectPlan: "Selecionar Plano",
    },
    messages: {
      saved: "Configuração salva com sucesso",
      savingError: "Erro ao salvar configuração",
      alreadySubscribed: "Você já está inscrito neste plano",
      subscriptionUpdated: (planName: string) =>
        `Inscrição atualizada para ${planName}!`,
      subscriptionError: "Erro ao atualizar inscrição",
      loading: "Carregando...",
    },
  },
};

export default function BusinessConfigPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showFreePlanModal, setShowFreePlanModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<Plan | null>(
    null,
  );
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const copy =
    CONFIG_COPY[currentLanguage as keyof typeof CONFIG_COPY] || CONFIG_COPY.es;

  const [formData, setFormData] = useState<BusinessConfig>({
    businessName: "MI NEGOCIO",
    address: "Dirección del negocio",
    phone: "(sin teléfono)",
    email: "correo@ejemplo.com",
    website: "www.minegocio.com",
    cuitRucDni: "00-00000000-0",
    ticketMessage: "¡GRACIAS POR SU COMPRA!\nVuelva pronto",
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchPlans();
    fetchSubscription();
    fetchBusinessConfig();
  }, [router]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data.plans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const fetchBusinessConfig = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/business-config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(data.data || formData);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!formData.businessName || !formData.email) {
      toast.error(copy.messages.savingError);
      return;
    }

    setSavingConfig(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/business-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(data.data);
        setConfigSaved(true);
        toast.success(copy.messages.saved);
        setTimeout(() => setConfigSaved(false), 3000);
      } else {
        const error = await response.json();
        toast.error(error.error || copy.messages.savingError);
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error(copy.messages.savingError);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    if (currentSubscription?.planId === planId) {
      toast.info(copy.messages.alreadySubscribed);
      return;
    }

    const planNameLower = plan.name.toLowerCase();

    // Show modal for Free plan
    if (planNameLower === "free" || planNameLower === "gratuito") {
      setSelectedPlanForModal(plan);
      setShowFreePlanModal(true);
      return;
    }

    // Show modal for Pro plan
    if (planNameLower === "pro") {
      setSelectedPlanForModal(plan);
      setShowSubscriptionModal(true);
      return;
    }

    // Show modal for Premium plan
    if (planNameLower === "premium") {
      setSelectedPlanForModal(plan);
      setShowPremiumModal(true);
      return;
    }

    // For other plans, proceed directly
    setSubscribing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        toast.success(copy.messages.subscriptionUpdated(plan?.name || ""));
        fetchSubscription();
      } else {
        const data = await response.json();
        toast.error(data.error || copy.messages.subscriptionError);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error(copy.messages.subscriptionError);
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubscriptionConfirm = async (billingData: any) => {
    setSubscribing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlanForModal?.id,
          billingData,
        }),
      });

      if (response.ok) {
        toast.success(
          copy.messages.subscriptionUpdated(selectedPlanForModal?.name || ""),
        );
        setShowSubscriptionModal(false);
        setSelectedPlanForModal(null);
        fetchSubscription();
      } else {
        const data = await response.json();
        toast.error(data.error || copy.messages.subscriptionError);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error(copy.messages.subscriptionError);
    } finally {
      setSubscribing(false);
    }
  };

  const handleFreePlanConfirm = async () => {
    setSubscribing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlanForModal?.id,
        }),
      });

      if (response.ok) {
        toast.success(
          copy.messages.subscriptionUpdated(selectedPlanForModal?.name || ""),
        );
        setShowFreePlanModal(false);
        setSelectedPlanForModal(null);
        fetchSubscription();
      } else {
        const data = await response.json();
        toast.error(data.error || copy.messages.subscriptionError);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error(copy.messages.subscriptionError);
    } finally {
      setSubscribing(false);
    }
  };

  const handlePremiumConfirm = async (billingData: any) => {
    setSubscribing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlanForModal?.id,
          billingData,
        }),
      });

      if (response.ok) {
        toast.success(
          copy.messages.subscriptionUpdated(selectedPlanForModal?.name || ""),
        );
        setShowPremiumModal(false);
        setSelectedPlanForModal(null);
        fetchSubscription();
      } else {
        const data = await response.json();
        toast.error(data.error || copy.messages.subscriptionError);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error(copy.messages.subscriptionError);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="text-slate-400">{copy.messages.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <Header user={user} showBackButton={true} />
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏪</span>
            <h1 className="text-2xl font-bold text-white">{copy.title}</h1>
          </div>
          <p className="text-slate-400">{copy.subtitle}</p>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Logo del Negocio */}
            <section className="bg-slate-900 border border-purple-600/30 rounded-xl overflow-hidden hover:border-purple-600/50 transition-colors">
              <div className="flex items-center justify-between p-4 border-b border-purple-600/20">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  🎨 {copy.sections.logo}
                </h2>
                <span className="px-2.5 py-1 text-xs font-semibold text-purple-300 bg-purple-900/60 border border-purple-700/50 rounded-full">
                  Premium
                </span>
              </div>
              <div className="p-6">
                <div className="p-6 text-center border-2 border-purple-700/40 rounded-xl bg-purple-900/20">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 text-purple-300 bg-purple-900/60 rounded-xl">
                    👑
                  </div>
                  <h3 className="font-semibold text-purple-300">
                    Función Premium
                  </h3>
                  <p className="mt-1 text-sm text-purple-200">
                    Personaliza tu ticket con el logo de tu negocio
                  </p>
                  <p className="mt-2 text-xs text-purple-300/70">
                    Disponible en Plan Profesional y superior
                  </p>
                </div>
              </div>
            </section>

            {/* Plan de Suscripción */}
            <section className="bg-slate-900 border border-purple-600/30 rounded-xl overflow-hidden hover:border-purple-600/50 transition-colors">
              <div className="p-4 border-b border-purple-600/20">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-400" />{" "}
                  {copy.sections.plans}
                </h2>
              </div>

              <div className="p-5 space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentSubscription?.planId === plan.id
                        ? "border-purple-600/60 bg-purple-900/30"
                        : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{plan.icon}</span>
                          <span className="font-semibold text-white">
                            {plan.name}
                          </span>
                          {plan.popular && (
                            <span className="px-2 py-0.5 text-xs font-semibold text-yellow-300 bg-yellow-900/50 border border-yellow-700/50 rounded-full">
                              Popular
                            </span>
                          )}
                          {currentSubscription?.planId === plan.id && (
                            <span className="px-2 py-0.5 text-xs font-semibold text-green-300 bg-green-900/50 border border-green-700/50 rounded-full">
                              {copy.buttons.selectPlan}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {plan.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-white">
                          ${plan.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {plan.billing}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-3 flex-wrap">
                      {plan.limits.map((limit, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs text-slate-300 bg-slate-700/50 rounded"
                        >
                          {limit}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={
                        subscribing || currentSubscription?.planId === plan.id
                      }
                      className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                        currentSubscription?.planId === plan.id
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      {subscribing
                        ? "Procesando..."
                        : currentSubscription?.planId === plan.id
                          ? copy.buttons.selectPlan
                          : "Click para suscribirse →"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Configuración del Negocio Form */}
            <section className="bg-slate-900 border border-purple-600/30 rounded-xl overflow-hidden hover:border-purple-600/50 transition-colors">
              <div className="p-4 border-b border-purple-600/20">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  ⚙️ {copy.sections.businessInfo}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Business Name */}
                <div>
                  <label className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    📦 {copy.businessForm.businessName}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    placeholder="MI NEGOCIO"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    📍 {copy.businessForm.address}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Ej. Av. San Martin 1234, CABA"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Phone and Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      ☎️ {copy.businessForm.phone}
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="011 1234-5678"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      📧 {copy.businessForm.email}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="info@minegocio.com"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Website and CUIT/RUC/DNI */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      🌐 {copy.businessForm.website}
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="www.minegocio.com"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      📋 {copy.businessForm.cuitRucDni}
                    </label>
                    <input
                      type="text"
                      value={formData.cuitRucDni}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cuitRucDni: e.target.value,
                        })
                      }
                      placeholder="20-12345678-9"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Ticket Message */}
                <div>
                  <label className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    🎟️ {copy.businessForm.ticketMessage}
                  </label>
                  <textarea
                    value={formData.ticketMessage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ticketMessage: e.target.value,
                      })
                    }
                    placeholder="¡GRACIAS POR SU COMPRA!&#10;Vuelva pronto"
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Usa \n para saltos de línea
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveConfig}
                    disabled={savingConfig}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    💾 {savingConfig ? copy.buttons.saving : copy.buttons.save}
                  </button>
                  <button
                    onClick={() => {
                      toast.info("Vista previa se actualiza en tiempo real");
                    }}
                    className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    👁️ Preview
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right column - Ticket Preview */}
          <div>
            <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden sticky top-20">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Vista Previa del Ticket
                </h2>
              </div>
              <div className="flex items-center justify-center p-6">
                {/* Ticket Preview - Dark/Terminal Style */}
                <div className="w-80 bg-black text-green-400 rounded-lg shadow-2xl overflow-hidden p-4 text-center text-xs font-mono border border-green-600/30">
                  {/* Header with line decorations */}
                  <div className="mb-2 text-green-500">
                    <p className="font-bold text-sm mb-1">
                      {formData.businessName.toUpperCase()}
                    </p>
                  </div>

                  <div className="text-xs text-green-600 space-y-0.5 mb-2">
                    {formData.address && <p>Dirección del negocio</p>}
                    {formData.phone && <p>Tel: {formData.phone}</p>}
                    {formData.email && <p>{formData.email}</p>}
                    {formData.website && <p>{formData.website}</p>}
                    {formData.cuitRucDni && <p>CUIT: {formData.cuitRucDni}</p>}
                  </div>

                  <div className="my-2 border-t border-green-600/30"></div>

                  <div className="space-y-0.5 text-xs text-left text-green-400 mb-2">
                    <div className="flex justify-between">
                      <span>TICKET:</span>
                      <span>#001-00123</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FECHA:</span>
                      <span>23/1/2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HORA:</span>
                      <span>07:08 a. m.</span>
                    </div>
                  </div>

                  <div className="my-2 border-t border-green-600/30"></div>

                  <div className="space-y-1 text-xs text-left text-green-400 mb-2">
                    <div>
                      <div className="flex justify-between">
                        <span>Coca Cola 1.5L</span>
                        <span>$3000.00</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>2 x $1500.00</span>
                        <span>$3000.00</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>Pan Lactal</span>
                        <span>$850.00</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>1 x $850.00</span>
                        <span>$850.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="my-2 border-t border-dashed border-green-600/30"></div>

                  <div className="flex justify-between font-bold mb-3 text-green-500">
                    <span>TOTAL :</span>
                    <span>$3850.00</span>
                  </div>

                  <div className="text-xs text-green-600 whitespace-pre-wrap">
                    {formData.ticketMessage}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Subscription Pro Modal */}
      {selectedPlanForModal && (
        <SubscriptionProModal
          isOpen={showSubscriptionModal}
          onClose={() => {
            setShowSubscriptionModal(false);
            setSelectedPlanForModal(null);
          }}
          onConfirm={handleSubscriptionConfirm}
          plan={selectedPlanForModal}
        />
      )}

      {/* Subscription Free Plan Modal */}
      {selectedPlanForModal && (
        <SubscriptionFreePlanModal
          isOpen={showFreePlanModal}
          onClose={() => {
            setShowFreePlanModal(false);
            setSelectedPlanForModal(null);
          }}
          onConfirm={handleFreePlanConfirm}
          plan={selectedPlanForModal}
        />
      )}

      {/* Subscription Premium Modal */}
      {selectedPlanForModal && (
        <SubscriptionPremiumModal
          isOpen={showPremiumModal}
          onClose={() => {
            setShowPremiumModal(false);
            setSelectedPlanForModal(null);
          }}
          onConfirm={handlePremiumConfirm}
          plan={selectedPlanForModal}
        />
      )}
    </div>
  );
}
