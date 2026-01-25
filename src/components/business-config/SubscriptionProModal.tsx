"use client";

import { useState } from "react";
import { X, Crown } from "lucide-react";
import { toast } from "react-toastify";
import { useLanguage } from "@/lib/context/LanguageContext";

interface SubscriptionProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (billingData: BillingData) => Promise<void>;
  plan: {
    name: string;
    price: number;
    description: string;
    features: Record<string, any>;
  };
}

interface BillingData {
  businessName: string;
  cuitRucDni: string;
  email: string;
  phone: string;
}

export default function SubscriptionProModal({
  isOpen,
  onClose,
  onConfirm,
  plan,
}: SubscriptionProModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BillingData>({
    businessName: "",
    cuitRucDni: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName) {
      toast.error(t("companyNameRequired", "errors"));
      return;
    }
    if (!formData.cuitRucDni) {
      toast.error(t("cuitRucDniRequired", "errors"));
      return;
    }
    if (!formData.email) {
      toast.error(t("billingEmailRequired", "errors"));
      return;
    }

    setLoading(true);
    try {
      await onConfirm(formData);
    } catch (error) {
      console.error("Error in subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const productCount = Object.values(plan.features).some((v) => v === true)
    ? "∞"
    : plan.features.products || "∞";
  const userCount = Object.values(plan.features).some((v) => v === true)
    ? "∞"
    : plan.features.users || "∞";
  const clientCount = Object.values(plan.features).some((v) => v === true)
    ? "∞"
    : plan.features.clients || "∞";
  const discount = plan.features.discount
    ? `${Math.round(plan.features.discount * 100)}%`
    : "0%";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Suscripción - {plan.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                Información de facturación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Plan Summary */}
          <div className="bg-gradient-to-r from-purple-900/40 to-purple-700/40 border border-purple-600/50 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>⭐</span> {plan.name}
                </h3>
                <p className="text-sm text-gray-300 mt-1">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-300">
                  ${plan.price.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">/mes</div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-purple-600/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">
                  {productCount}
                </div>
                <div className="text-xs text-gray-400">Productos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">
                  {userCount}
                </div>
                <div className="text-xs text-gray-400">Usuarios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">
                  {clientCount}
                </div>
                <div className="text-xs text-gray-400">Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">
                  {discount}
                </div>
                <div className="text-xs text-gray-400">Descuento</div>
              </div>
            </div>
          </div>

          {/* Billing Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Nombre de tu empresa"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                CUIT/RUC/DNI *
              </label>
              <input
                type="text"
                name="cuitRucDni"
                value={formData.cuitRucDni}
                onChange={handleChange}
                placeholder="20-12345678-9"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Email de Facturación *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="facturacion@tuempresa.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="011 1234-5678"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 dark:border-slate-600 dark:text-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Procesando..." : "Continuar al Pago"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
