"use client";

import { useState } from "react";
import { Zap, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradePromptProps {
  featureName: string;
  reason?: string;
  onDismiss?: () => void;
}

/**
 * Modal shown when user tries to access a pro-only feature
 */
export function UpgradePrompt({
  featureName,
  reason = "Esta feature no está disponible en tu plan actual",
  onDismiss,
}: UpgradePromptProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 mx-auto">
          <Lock className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Característica Premium
        </h3>
        <p className="text-gray-600 text-center mb-6">{reason}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 text-sm">
                {featureName}
              </p>
              <p className="text-blue-700 text-xs mt-1">
                Disponible en plan Pro
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              router.push("/upgrade");
              handleClose();
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Upgrade
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface LimitReachedProps {
  limitName: string;
  current: number;
  max: number;
  onDismiss?: () => void;
}

/**
 * Modal shown when user hits a plan limit
 */
export function LimitReachedPrompt({
  limitName,
  current,
  max,
  onDismiss,
}: LimitReachedProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 mb-4 mx-auto">
          <Lock className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Límite de Plan Alcanzado
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Has llegado al límite de {limitName} en tu plan actual.
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-orange-900">
              {limitName}
            </span>
            <span className="text-sm text-orange-700">
              {current} / {max}
            </span>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full"
              style={{ width: `${(current / max) * 100}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-gray-600 text-center mb-6">
          Actualiza tu plan a Pro para disfrutar de límites ilimitados.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Más tarde
          </button>
          <button
            onClick={() => {
              router.push("/upgrade");
              handleClose();
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Upgrade
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
