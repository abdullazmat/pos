"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import SubscriptionProModal from "@/components/business-config/SubscriptionProModal";
import SubscriptionFreePlanModal from "@/components/business-config/SubscriptionFreePlanModal";
import SubscriptionPremiumModal from "@/components/business-config/SubscriptionPremiumModal";
import DigitalCertificatesSection from "@/components/business-config/DigitalCertificatesSection";
import { Eye, Star, Crown } from "lucide-react";
import { toast } from "react-toastify";

interface User {
  id: string;
  email: string;
  fullName: string;
  businessName?: string;
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
  country?: string;
  paymentMethods?: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
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
      ticketPreview: "Vista Previa del Ticket",
      paymentMethods: "Métodos de Pago",
    },
    ticket: {
      address: "Dirección del negocio",
      ticketLabel: "TICKET:",
      dateLabel: "FECHA:",
      timeLabel: "HORA:",
      totalLabel: "TOTAL :",
      defaultMessage: "¡GRACIAS POR SU COMPRA!\nVuelva pronto",
    },
    premiumFunction: {
      title: "Función Premium",
      description: "Personaliza tu ticket con el logo de tu negocio",
      availability: "Disponible en Plan Profesional y superior",
    },
    businessForm: {
      businessName: "Nombre del Negocio",
      address: "Dirección",
      phone: "Teléfono",
      email: "Email",
      website: "Sitio Web",
      cuitRucDni: "CUIT/RUC/DNI",
      ticketMessage: "Mensaje en Ticket",
      country: "País",
    },
    paymentMethods: {
      title: "Métodos de Pago Disponibles",
      subtitle:
        "Configura qué métodos de pago estarán disponibles en el punto de venta",
      cash: "Efectivo",
      bankTransfer: "Transferencia Bancaria",
      qr: "Código QR",
      card: "Tarjeta",
      check: "Cheque",
    },
    buttons: {
      save: "Guardar Cambios",
      saving: "Guardando...",
      subscribe: "Suscribirse",
      selectPlan: "Seleccionar Plan",
      processing: "Procesando...",
      subscribeClick: "Click para suscribirse →",
      subscribed: "Suscrito",
    },
    messages: {
      saved: "Configuración guardada exitosamente",
      savingError: "Error al guardar la configuración",
      alreadySubscribed: "Ya estás suscrito a este plan",
      subscriptionUpdated: (planName: string) =>
        `¡Suscripción actualizada a ${planName}!`,
      subscriptionError: "Error al actualizar suscripción",
      loading: "Cargando...",
      previewInfo: "Vista previa se actualiza en tiempo real",
    },
  },
  en: {
    title: "Business Configuration",
    subtitle: "Manage your business information and plans",
    sections: {
      logo: "Business Logo",
      businessInfo: "Business Information",
      plans: "Plan Management",
      ticketPreview: "Ticket Preview",
      paymentMethods: "Payment Methods",
    },
    ticket: {
      address: "Business address",
      ticketLabel: "TICKET:",
      dateLabel: "DATE:",
      timeLabel: "TIME:",
      totalLabel: "TOTAL:",
      defaultMessage: "THANK YOU FOR YOUR PURCHASE!\nCome back soon",
    },
    premiumFunction: {
      title: "Premium Feature",
      description: "Customize your ticket with your business logo",
      availability: "Available in Professional Plan and above",
    },
    businessForm: {
      businessName: "Business Name",
      address: "Address",
      phone: "Phone",
      email: "Email",
      website: "Website",
      cuitRucDni: "CUIT/RUC/DNI",
      ticketMessage: "Ticket Message",
      country: "Country",
    },
    paymentMethods: {
      title: "Available Payment Methods",
      subtitle:
        "Configure which payment methods will be available at the point of sale",
      cash: "Cash",
      bankTransfer: "Bank Transfer",
      qr: "QR Code",
      card: "Card",
      check: "Check",
    },
    buttons: {
      save: "Save Changes",
      saving: "Saving...",
      subscribe: "Subscribe",
      selectPlan: "Select Plan",
      processing: "Processing...",
      subscribeClick: "Click to subscribe →",
      subscribed: "Subscribed",
    },
    messages: {
      saved: "Configuration saved successfully",
      savingError: "Error saving configuration",
      alreadySubscribed: "You are already subscribed to this plan",
      subscriptionUpdated: (planName: string) =>
        `Subscription updated to ${planName}!`,
      subscriptionError: "Error updating subscription",
      loading: "Loading...",
      previewInfo: "Preview updates in real time",
    },
  },
  pt: {
    title: "Configuração do Negócio",
    subtitle: "Gerencie suas informações comerciais e planos",
    sections: {
      logo: "Logo do Negócio",
      businessInfo: "Informações do Negócio",
      plans: "Gerenciamento de Planos",
      ticketPreview: "Pré-visualização do Recibo",
      paymentMethods: "Métodos de Pagamento",
    },
    ticket: {
      address: "Endereço do negócio",
      ticketLabel: "TICKET:",
      dateLabel: "DATA:",
      timeLabel: "HORA:",
      totalLabel: "TOTAL:",
      defaultMessage: "OBRIGADO PELA SUA COMPRA!\nVolte em breve",
    },
    premiumFunction: {
      title: "Função Premium",
      description: "Personalize seu recibo com o logotipo do seu negócio",
      availability: "Disponível no Plano Profissional e superior",
    },
    businessForm: {
      businessName: "Nome do Negócio",
      address: "Endereço",
      phone: "Telefone",
      email: "Email",
      website: "Site",
      cuitRucDni: "CUIT/RUC/DNI",
      ticketMessage: "Mensagem do Recibo",
      country: "País",
    },
    paymentMethods: {
      title: "Métodos de Pagamento Disponíveis",
      subtitle:
        "Configure quais métodos de pagamento estarão disponíveis no ponto de venda",
      cash: "Dinheiro",
      bankTransfer: "Transferência Bancária",
      qr: "Código QR",
      card: "Cartão",
      check: "Cheque",
    },
    buttons: {
      save: "Salvar Alterações",
      saving: "Salvando...",
      subscribe: "Inscrever-se",
      selectPlan: "Selecionar Plano",
      processing: "Processando...",
      subscribeClick: "Clique para se inscrever →",
      subscribed: "Inscrito",
    },
    messages: {
      saved: "Configuração salva com sucesso",
      savingError: "Erro ao salvar configuração",
      alreadySubscribed: "Você já está inscrito neste plano",
      subscriptionUpdated: (planName: string) =>
        `Inscrição atualizada para ${planName}!`,
      subscriptionError: "Erro ao atualizar inscrição",
      loading: "Carregando...",
      previewInfo: "Visualização é atualizada em tempo real",
    },
  },
};

const COUNTRY_OPTIONS = {
  es: [
    { value: "argentina", label: "Argentina" },
    { value: "chile", label: "Chile" },
    { value: "peru", label: "Perú" },
    { value: "uruguay", label: "Uruguay" },
    { value: "paraguay", label: "Paraguay" },
    { value: "bolivia", label: "Bolivia" },
    { value: "colombia", label: "Colombia" },
    { value: "mexico", label: "México" },
    { value: "spain", label: "España" },
    { value: "brazil", label: "Brasil" },
    { value: "portugal", label: "Portugal" },
    { value: "usa", label: "Estados Unidos" },
    { value: "pakistan", label: "Pakistán" },
  ],
  en: [
    { value: "argentina", label: "Argentina" },
    { value: "chile", label: "Chile" },
    { value: "peru", label: "Peru" },
    { value: "uruguay", label: "Uruguay" },
    { value: "paraguay", label: "Paraguay" },
    { value: "bolivia", label: "Bolivia" },
    { value: "colombia", label: "Colombia" },
    { value: "mexico", label: "Mexico" },
    { value: "spain", label: "Spain" },
    { value: "brazil", label: "Brazil" },
    { value: "portugal", label: "Portugal" },
    { value: "usa", label: "United States" },
    { value: "pakistan", label: "Pakistan" },
  ],
  pt: [
    { value: "argentina", label: "Argentina" },
    { value: "chile", label: "Chile" },
    { value: "peru", label: "Peru" },
    { value: "uruguay", label: "Uruguai" },
    { value: "paraguay", label: "Paraguai" },
    { value: "bolivia", label: "Bolívia" },
    { value: "colombia", label: "Colômbia" },
    { value: "mexico", label: "México" },
    { value: "spain", label: "Espanha" },
    { value: "brazil", label: "Brasil" },
    { value: "portugal", label: "Portugal" },
    { value: "usa", label: "Estados Unidos" },
    { value: "pakistan", label: "Paquistão" },
  ],
} as const;

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
    address: "",
    phone: "(sin teléfono)",
    email: "correo@ejemplo.com",
    website: "www.minegocio.com",
    cuitRucDni: "00-00000000-0",
    ticketMessage: "",
    country: "argentina",
    paymentMethods: [
      { id: "cash", name: "Efectivo", enabled: true },
      { id: "bankTransfer", name: "Transferencia Bancaria", enabled: true },
      { id: "qr", name: "Código QR", enabled: true },
      { id: "card", name: "Tarjeta", enabled: false },
      { id: "check", name: "Cheque", enabled: false },
    ],
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    if (parsedUser?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchPlans();
    fetchSubscription();
    fetchBusinessConfig();
  }, [router, currentLanguage]);

  // Update form data when language changes
  useEffect(() => {
    const defaultMessages = [
      CONFIG_COPY.es.ticket.defaultMessage,
      CONFIG_COPY.en.ticket.defaultMessage,
      CONFIG_COPY.pt.ticket.defaultMessage,
      "", // Empty string is also considered default
    ];

    setFormData((prevFormData) => {
      // If current message is empty or is one of the default messages, update to current language's default
      const isDefaultMessage = defaultMessages.includes(
        prevFormData.ticketMessage,
      );
      const shouldUpdate = !prevFormData.ticketMessage || isDefaultMessage;

      return {
        ...prevFormData,
        address: prevFormData.address || copy.ticket.address,
        ticketMessage: shouldUpdate
          ? copy.ticket.defaultMessage
          : prevFormData.ticketMessage,
      };
    });
  }, [currentLanguage, copy]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`/api/plans?lang=${currentLanguage}`);
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
        const configData = data.data || formData;

        // List of all default messages in all languages
        const allDefaultMessages = [
          CONFIG_COPY.es.ticket.defaultMessage,
          CONFIG_COPY.en.ticket.defaultMessage,
          CONFIG_COPY.pt.ticket.defaultMessage,
        ];

        // If ticketMessage is empty or is a default message in any language,
        // replace it with the current language's default
        const isDefaultOrEmpty =
          !configData.ticketMessage ||
          configData.ticketMessage.trim() === "" ||
          allDefaultMessages.includes(configData.ticketMessage);

        if (isDefaultOrEmpty) {
          configData.ticketMessage = copy.ticket.defaultMessage;
        }

        if (!configData.country) {
          configData.country = "argentina";
        }

        try {
          localStorage.setItem("businessCountry", configData.country);
          window.dispatchEvent(
            new CustomEvent("business-country-changed", {
              detail: { country: configData.country },
            }),
          );
        } catch (error) {
          console.warn("Failed to sync country from config", error);
        }

        setFormData(configData);
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
        if (data?.data?.country) {
          try {
            localStorage.setItem("businessCountry", data.data.country);
            window.dispatchEvent(
              new CustomEvent("business-country-changed", {
                detail: { country: data.data.country },
              }),
            );
          } catch (error) {
            console.warn("Failed to broadcast saved country", error);
          }
        }
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

  const togglePaymentMethod = (methodId: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods?.map((method) =>
        method.id === methodId
          ? { ...method, enabled: !method.enabled }
          : method,
      ),
    }));
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }));
    try {
      localStorage.setItem("businessCountry", value);
      window.dispatchEvent(
        new CustomEvent("business-country-changed", {
          detail: { country: value },
        }),
      );
    } catch (error) {
      console.warn("Failed to broadcast country change", error);
    }
  };

  const normalizePlanId = (planId?: string | null) => {
    const normalized = (planId || "").toUpperCase();

    if (normalized === "FREE") return "BASIC";
    if (normalized === "PRO") return "PROFESSIONAL";
    if (normalized === "PREMIUM") return "ENTERPRISE";

    return normalized;
  };

  const resolveSubscriptionPlanId = (plan?: Plan | null) => {
    if (!plan) return null;
    return normalizePlanId(plan.id);
  };

  const isCurrentPlanSelected = (plan: Plan) => {
    const normalizedCurrentPlanId = normalizePlanId(
      currentSubscription?.planId,
    );
    const normalizedPlanId = resolveSubscriptionPlanId(plan);

    return Boolean(
      normalizedCurrentPlanId &&
      normalizedPlanId &&
      normalizedCurrentPlanId === normalizedPlanId,
    );
  };

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const planNameLower = plan.name.toLowerCase();

    if (isCurrentPlanSelected(plan)) {
      toast.info(copy.messages.alreadySubscribed);
      return;
    }

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
      const resolvedPlanId = resolveSubscriptionPlanId(plan);
      if (!resolvedPlanId) {
        toast.error(copy.messages.subscriptionError);
        return;
      }

      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: resolvedPlanId }),
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
      const resolvedPlanId = resolveSubscriptionPlanId(selectedPlanForModal);
      if (!resolvedPlanId) {
        toast.error(copy.messages.subscriptionError);
        return;
      }

      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: resolvedPlanId,
          email: billingData?.email || user?.email,
          businessName:
            billingData?.businessName || user?.businessName || user?.fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || copy.messages.subscriptionError);
        return;
      }

      const preferenceLink = data.payment?.preferenceLink;
      if (preferenceLink) {
        window.location.href = preferenceLink;
        return;
      }

      toast.error(copy.messages.subscriptionError);
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
      const resolvedPlanId = resolveSubscriptionPlanId(selectedPlanForModal);
      if (!resolvedPlanId) {
        toast.error(copy.messages.subscriptionError);
        return;
      }

      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: resolvedPlanId,
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
      const resolvedPlanId = resolveSubscriptionPlanId(selectedPlanForModal);
      if (!resolvedPlanId) {
        toast.error(copy.messages.subscriptionError);
        return;
      }

      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: resolvedPlanId,
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
    <div className="min-h-screen text-gray-900 bg-white dark:bg-slate-950 dark:text-slate-100">
      <Header user={user} showBackButton={true} />
      <div className="px-4 py-6 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏪</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {copy.title}
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">{copy.subtitle}</p>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {/* Logo del Negocio */}
            <section className="overflow-hidden transition-colors bg-white border border-purple-200 dark:bg-slate-900 dark:border-purple-600/30 rounded-xl hover:border-purple-300 dark:hover:border-purple-600/50">
              <div className="flex items-center justify-between p-4 border-b border-purple-200 dark:border-purple-600/20">
                <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  🎨 {copy.sections.logo}
                </h2>
                <span className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-100 border border-purple-300 dark:text-purple-300 dark:bg-purple-900/60 dark:border-purple-700/50 rounded-full">
                  Premium
                </span>
              </div>
              <div className="p-6">
                <div className="p-6 text-center border-2 border-purple-300 dark:border-purple-700/40 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 text-purple-700 bg-purple-200 dark:text-purple-300 dark:bg-purple-900/60 rounded-xl">
                    👑
                  </div>
                  <h3 className="font-semibold text-purple-700 dark:text-purple-300">
                    {copy.premiumFunction.title}
                  </h3>
                  <p className="mt-1 text-sm text-purple-700 dark:text-purple-200">
                    {copy.premiumFunction.description}
                  </p>
                  <p className="mt-2 text-xs text-purple-600 dark:text-purple-300/70">
                    {copy.premiumFunction.availability}
                  </p>
                </div>
              </div>
            </section>

            {/* Plan de Suscripción */}
            <section className="overflow-hidden transition-colors bg-white border border-purple-200 dark:bg-slate-900 dark:border-purple-600/30 rounded-xl hover:border-purple-300 dark:hover:border-purple-600/50">
              <div className="p-4 border-b border-purple-200 dark:border-purple-600/20">
                <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />{" "}
                  {copy.sections.plans}
                </h2>
              </div>

              <div className="p-5 space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCurrentPlanSelected(plan)
                        ? "border-purple-400 bg-purple-50 dark:border-purple-600/60 dark:bg-purple-900/30"
                        : "border-slate-300 bg-slate-50 hover:border-slate-400 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:border-slate-600/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{plan.icon}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {plan.name}
                          </span>
                          {plan.popular && (
                            <span className="px-2 py-0.5 text-xs font-semibold text-yellow-700 bg-yellow-100 border border-yellow-300 dark:text-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-700/50 rounded-full">
                              Popular
                            </span>
                          )}
                          {isCurrentPlanSelected(plan) ? (
                            <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 border border-green-300 dark:text-green-300 dark:bg-green-900/50 dark:border-green-700/50 rounded-full">
                              {copy.buttons.subscribed}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {plan.description}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          ${plan.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          {plan.billing}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {plan.limits.map((limit, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded text-slate-700 bg-slate-200 dark:text-slate-300 dark:bg-slate-700/50"
                        >
                          {limit}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing || isCurrentPlanSelected(plan)}
                      className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                        isCurrentPlanSelected(plan)
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400"
                          : "bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      {subscribing
                        ? copy.buttons.processing
                        : isCurrentPlanSelected(plan)
                          ? copy.buttons.subscribed
                          : copy.buttons.subscribeClick}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Configuración del Negocio Form */}
            <section className="overflow-hidden transition-colors bg-white border border-purple-200 dark:bg-slate-900 dark:border-purple-600/30 rounded-xl hover:border-purple-300 dark:hover:border-purple-600/50">
              <div className="p-4 border-b border-purple-200 dark:border-purple-600/20">
                <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  ⚙️ {copy.sections.businessInfo}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Business Name */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-900 dark:text-white">
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
                    className="w-full px-4 py-2 transition-colors bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                    📍 {copy.businessForm.address}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Ej. Av. San Martin 1234, CABA"
                    className="w-full px-4 py-2 transition-colors bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                    🌍 {copy.businessForm.country}
                  </label>
                  <select
                    value={formData.country || "argentina"}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-4 py-2 transition-colors bg-white border rounded-lg border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:border-purple-500 focus:outline-none"
                  >
                    {(
                      COUNTRY_OPTIONS[
                        currentLanguage as keyof typeof COUNTRY_OPTIONS
                      ] || COUNTRY_OPTIONS.es
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone and Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                      ☎️ {copy.businessForm.phone}
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="011 1234-5678"
                      className="w-full px-4 py-2 transition-colors bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                      📧 {copy.businessForm.email}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="info@minegocio.com"
                      className="w-full px-4 py-2 transition-colors bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Website and CUIT/RUC/DNI */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                      🌐 {copy.businessForm.website}
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="www.minegocio.com"
                      className="w-full px-4 py-2 transition-colors bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-900 dark:text-white">
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
                      className="w-full px-4 py-2 transition-colors bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Ticket Message */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-900 dark:text-white">
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
                    placeholder={copy.ticket.defaultMessage.replace(
                      /\n/g,
                      "&#10;",
                    )}
                    rows={4}
                    className="w-full px-4 py-2 transition-colors bg-white border rounded-lg resize-none border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Usa \n para saltos de línea
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="pt-6 border-t border-slate-300 dark:border-slate-700">
                  <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                    💳 {copy.paymentMethods.title}
                  </label>
                  <p className="mb-4 text-xs text-slate-600 dark:text-slate-400">
                    {copy.paymentMethods.subtitle}
                  </p>
                  <div className="space-y-3">
                    {formData.paymentMethods?.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      >
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {copy.paymentMethods[
                            method.id as keyof typeof copy.paymentMethods
                          ] || method.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePaymentMethod(method.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            method.enabled
                              ? "bg-blue-600"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              method.enabled ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveConfig}
                    disabled={savingConfig}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-500"
                  >
                    💾 {savingConfig ? copy.buttons.saving : copy.buttons.save}
                  </button>
                  <button
                    onClick={() => {
                      toast.info(copy.messages.previewInfo);
                    }}
                    className="flex items-center gap-2 px-4 py-2 font-semibold transition-colors rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
                  >
                    👁️ Preview
                  </button>
                </div>
              </div>
            </section>

            {/* Digital Certificates Section */}
            <DigitalCertificatesSection />
          </div>

          {/* Right column - Ticket Preview */}
          <div>
            <section className="sticky overflow-hidden bg-white border border-slate-300 dark:bg-slate-900 dark:border-slate-800 rounded-xl top-20">
              <div className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-800">
                <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Eye className="w-4 h-4" /> {copy.sections.ticketPreview}
                </h2>
              </div>
              <div className="flex items-center justify-center p-6">
                {/* Ticket Preview - Paper Style for Light Mode, Terminal Style for Dark Mode */}
                <div className="p-4 overflow-hidden font-mono text-xs text-center bg-white border rounded-lg shadow-2xl w-80 text-slate-800 dark:bg-black dark:text-green-400 border-slate-300 dark:border-green-600/30">
                  {/* Header with line decorations */}
                  <div className="mb-2 text-slate-900 dark:text-green-500">
                    <p className="mb-1 text-sm font-bold">
                      {formData.businessName.toUpperCase()}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-green-600 space-y-0.5 mb-2">
                    {formData.address && <p>{formData.address}</p>}
                    {formData.phone && <p>Tel: {formData.phone}</p>}
                    {formData.email && <p>{formData.email}</p>}
                    {formData.website && <p>{formData.website}</p>}
                    {formData.cuitRucDni && <p>CUIT: {formData.cuitRucDni}</p>}
                  </div>

                  <div className="my-2 border-t border-slate-300 dark:border-green-600/30"></div>

                  <div className="space-y-0.5 text-xs text-left text-slate-700 dark:text-green-400 mb-2">
                    <div className="flex justify-between">
                      <span>{copy.ticket.ticketLabel}</span>
                      <span>#001-00123</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.ticket.dateLabel}</span>
                      <span>23/1/2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.ticket.timeLabel}</span>
                      <span>07:08 a. m.</span>
                    </div>
                  </div>

                  <div className="my-2 border-t border-slate-300 dark:border-green-600/30"></div>

                  <div className="mb-2 space-y-1 text-xs text-left text-slate-700 dark:text-green-400">
                    <div>
                      <div className="flex justify-between">
                        <span>Coca Cola 1.5L</span>
                        <span>$3000.00</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-green-600">
                        <span>2 x $1500.00</span>
                        <span>$3000.00</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>Pan Lactal</span>
                        <span>$850.00</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-green-600">
                        <span>1 x $850.00</span>
                        <span>$850.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="my-2 border-t border-dashed border-slate-300 dark:border-green-600/30"></div>

                  <div className="flex justify-between mb-3 font-bold text-slate-900 dark:text-green-500">
                    <span>{copy.ticket.totalLabel}</span>
                    <span>$3850.00</span>
                  </div>

                  <div className="text-xs whitespace-pre-wrap text-slate-600 dark:text-green-600">
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
