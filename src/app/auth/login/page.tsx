"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslatedError } from "@/lib/hooks/useTranslatedError";
import { useTranslatedToast } from "@/lib/hooks/useTranslatedToast";
import Header from "@/components/Header";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();
  const { handleError } = useTranslatedError();
  const toast = useTranslatedToast();

  // If already authenticated, redirect to POS
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        router.replace("/pos");
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
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        const message = handleError(
          data.errorKey || data.error || "invalidCredentials",
        );
        setError(message);
        toast.error("invalidCredentials");
        return;
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      router.push("/pos");
    } catch (err) {
      const message = handleError(err);
      setError(message);
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
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-[hsl(var(--vp-text))]">
              {String(t("login.title", "auth"))}
            </h1>
            <p className="text-sm text-[hsl(var(--vp-muted))]">
              {String(t("login.title", "auth"))}
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
            {/* Username and Password Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[hsl(var(--vp-text))]">
                  {String(t("login.email", "auth"))}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder={String(t("login.email", "auth"))}
                  className="w-full rounded-lg border border-[hsl(var(--vp-border-soft))] bg-[hsl(var(--vp-bg-card-soft))] px-4 py-3 text-[hsl(var(--vp-text))] placeholder:text-[hsl(var(--vp-muted-soft))] transition-all focus:outline-none focus:border-[hsl(var(--vp-primary))] focus:ring-2 focus:ring-[hsl(var(--vp-ring)/0.25)]"
                />
                <p className="text-xs text-[hsl(var(--vp-muted-soft))]">
                  {String(t("login.email", "auth"))}
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[hsl(var(--vp-text))]">
                  {String(t("login.password", "auth"))}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder={String(t("login.password", "auth"))}
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
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[hsl(var(--vp-primary))] transition-colors hover:text-[hsl(var(--vp-primary-strong))]"
              >
                {String(t("login.forgotPassword", "auth"))}
              </Link>
            </div>

            {/* Buttons Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full rounded-lg border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card-soft))] py-3 font-medium text-[hsl(var(--vp-text))] transition-all duration-200 hover:bg-[hsl(var(--vp-bg-hover))]"
              >
                {String(t("back", "common"))}
              </button>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
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
                  String(t("login.submit", "auth"))
                )}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-[hsl(var(--vp-muted))]">
            {String(t("login.noAccount", "auth"))}{" "}
            <Link
              href="/auth/register"
              className="font-medium text-[hsl(var(--vp-primary))] transition-colors hover:text-[hsl(var(--vp-primary-strong))]"
            >
              {String(t("login.registerLink", "auth"))}
            </Link>
          </p>
          </div>
        </div>
      </div>
    </>
  );
}
