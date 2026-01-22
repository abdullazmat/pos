"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Check, ArrowRight } from "lucide-react";

type SubscriptionPlan = "free" | "paid";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("free");
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        router.replace("/dashboard");
      }
    } catch {
      // ignore client storage errors
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const businessName = formData.get("businessName") as string;
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      // Free plan signup with new fields
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          fullName,
          email,
          phone,
          username,
          password,
          plan: "free",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  const freePlanFeatures = [
    "Up to 100 products",
    "Basic inventory tracking",
    "Daily sales reports",
    "1 user account",
    "Community support",
  ];

  const paidPlanFeatures = [
    "Unlimited products",
    "Advanced inventory management",
    "Real-time analytics",
    "Multiple user accounts",
    "Priority support",
    "Custom integrations",
    "Advanced reporting",
  ];

  return (
    <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center p-4 py-8">
      <div className="relative w-full max-w-2xl">
        {/* Card */}
        <div className="bg-[#0b0c0e] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
              <svg
                className="w-9 h-9 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Registra tu Negocio
            </h1>
            <p className="text-gray-400 text-sm">
              Completa los datos para empezar a usar el sistema gratis
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business Name and Owner Name Row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Business Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre del Negocio <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  placeholder="Ej: Minimarket El Sol"
                  className="w-full py-3 px-4 text-white placeholder-gray-500 bg-[#1a1d21] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Owner Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre del Dueño <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Tu nombre completo"
                  className="w-full py-3 px-4 text-white placeholder-gray-500 bg-[#1a1d21] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Email and Phone Row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="email@ejemplo.com"
                  className="w-full py-3 px-4 text-white placeholder-gray-500 bg-[#1a1d21] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+56 9 1234 5678"
                  className="w-full py-3 px-4 text-white placeholder-gray-500 bg-[#1a1d21] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Username and Password Row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Usuario Admin <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="admin"
                  className="w-full py-3 px-4 text-white placeholder-gray-500 bg-[#1a1d21] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <p className="text-xs text-gray-500">
                  Este será tu usuario para iniciar sesión
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Contraseña <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full py-3 px-4 pr-10 text-white placeholder-gray-500 bg-[#1a1d21] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Gratuito Badge */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3 mt-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-blue-400 font-semibold text-sm mb-1">
                  Plan Gratuito Incluido
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Empieza gratis con 100 productos y 2 usuarios. Puedes
                  actualizar a Pro cuando quieras.
                </p>
              </div>
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full py-3 mt-6 font-medium text-gray-300 transition-all duration-200 bg-[#1a1d21] border border-gray-700 rounded-lg hover:bg-[#1f2226] hover:border-gray-600"
            >
              Volver
            </button>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold text-white transition-all duration-200 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                  <span>Creando negocio...</span>
                </>
              ) : (
                "Crear Negocio"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/50 text-gray-400">
                Have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-300">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Your data is secure and encrypted • Privacy Policy & Terms of Service
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
