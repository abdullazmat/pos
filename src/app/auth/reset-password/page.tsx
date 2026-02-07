"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslatedToast } from "@/lib/hooks/useTranslatedToast";
import Header from "@/components/Header";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const toast = useTranslatedToast();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError(String(t("resetPassword.invalidToken", "auth")));
    }
  }, [searchParams, t]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || String(t("resetPassword.invalidToken", "auth")));
        return;
      }

      toast.success("resetPassword.success", "auth");
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setError(String(t("resetPassword.invalidToken", "auth")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--vp-bg-page))] p-4 pt-28 text-[hsl(var(--vp-text))]">
        <div className="relative w-full max-w-xl">
          {/* Card */}
          <div className="rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] p-8 shadow-[var(--vp-shadow-soft)]">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
              <svg
                className="w-9 h-9 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-[hsl(var(--vp-text))]">
              {String(t("resetPassword.title", "auth"))}
            </h1>
            <p className="text-sm text-[hsl(var(--vp-muted))]">
              {String(t("resetPassword.subtitle", "auth"))}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-white">!</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[hsl(var(--vp-text))]">
                {String(t("resetPassword.password", "auth"))}{" "}
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder={String(t("resetPassword.password", "auth"))}
                  minLength={6}
                  className="w-full rounded-lg border border-[hsl(var(--vp-border-soft))] bg-[hsl(var(--vp-bg-card-soft))] px-4 py-3 pr-10 text-[hsl(var(--vp-text))] placeholder:text-[hsl(var(--vp-muted-soft))] transition-all focus:outline-none focus:border-[hsl(var(--vp-primary))] focus:ring-2 focus:ring-[hsl(var(--vp-ring)/0.25)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[hsl(var(--vp-muted-soft))] transition-colors hover:text-[hsl(var(--vp-muted))]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[hsl(var(--vp-text))]">
                {String(t("resetPassword.confirmPassword", "auth"))}{" "}
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder={String(
                    t("resetPassword.confirmPassword", "auth"),
                  )}
                  minLength={6}
                  className="w-full rounded-lg border border-[hsl(var(--vp-border-soft))] bg-[hsl(var(--vp-bg-card-soft))] px-4 py-3 pr-10 text-[hsl(var(--vp-text))] placeholder:text-[hsl(var(--vp-muted-soft))] transition-all focus:outline-none focus:border-[hsl(var(--vp-primary))] focus:ring-2 focus:ring-[hsl(var(--vp-ring)/0.25)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-[hsl(var(--vp-muted-soft))] transition-colors hover:text-[hsl(var(--vp-muted))]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !token}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--vp-primary))] py-3 font-semibold text-white transition-all duration-200 hover:bg-[hsl(var(--vp-primary-strong))] disabled:bg-[hsl(var(--vp-border))] disabled:text-[hsl(var(--vp-muted))]"
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
                    <span>{String(t("loading", "common"))}</span>
                  </>
                ) : (
                  String(t("resetPassword.submit", "auth"))
                )}
              </button>

              {/* Back to Login */}
              <Link
                href="/auth/login"
                className="block w-full rounded-lg border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card-soft))] py-3 text-center font-medium text-[hsl(var(--vp-text))] transition-all duration-200 hover:bg-[hsl(var(--vp-bg-hover))]"
              >
                {String(t("forgotPassword.backToLogin", "auth"))}
              </Link>
            </div>
          </form>
          </div>
        </div>
      </div>
    </>
  );
}
