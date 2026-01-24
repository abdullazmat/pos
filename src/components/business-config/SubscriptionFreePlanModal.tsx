"use client";

import { useState } from "react";
import { X, Crown } from "lucide-react";
import { toast } from "react-toastify";

interface SubscriptionFreePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  plan: {
    name: string;
    price: number;
    description: string;
    features: Record<string, any>;
  };
}

export default function SubscriptionFreePlanModal({
  isOpen,
  onClose,
  onConfirm,
  plan,
}: SubscriptionFreePlanModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error confirming subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Contactar Ventas
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
          <div className="bg-gradient-to-r from-blue-900/40 to-blue-700/40 border border-blue-600/50 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">FREE</span>
                <div>
                  <h3 className="text-xl font-bold text-white">Gratuito</h3>
                  <p className="text-sm text-gray-300">
                    Perfecto para empezar y probar el sistema sin costo
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-300">$0</div>
                <div className="text-xs text-gray-400">/mes</div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-600/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">100</div>
                <div className="text-xs text-gray-400">Productos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">2</div>
                <div className="text-xs text-gray-400">Usuarios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">0%</div>
                <div className="text-xs text-gray-400">Descuento</div>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-teal-900/30 border border-teal-600/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-teal-400" />
              <h3 className="text-lg font-bold text-white">Plan Gratuito</h3>
            </div>

            <p className="text-sm text-gray-300 mb-6">
              El plan gratuito está activo por defecto. Prueba todas las
              funciones básicas sin costo.
            </p>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-3">
              <div className="text-sm font-semibold text-gray-200">
                Incluye:
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-teal-400">✓</span> Hasta 100 productos
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-teal-400">✓</span> 2 usuarios
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-teal-400">✓</span> POS básico con
                  escaneo de código de barras
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-teal-400">✓</span> Control de caja y
                  reportes básicos
                </li>
              </ul>
            </div>
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
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg font-semibold hover:from-teal-500 hover:to-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : "Entendido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
