"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslatedError } from "@/lib/hooks/useTranslatedError";
import { useTranslatedToast } from "@/lib/hooks/useTranslatedToast";

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
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#0b0c0e]">
      <div className="relative w-full max-w-xl">
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
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white">
              {String(t("login.title", "auth"))}
            </h1>
            <p className="text-sm text-gray-400">
              {String(t("login.title", "auth"))}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 border rounded-lg bg-red-500/10 border-red-500/30">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-white">!</span>
              </div>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username and Password Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {String(t("login.email", "auth"))}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder={String(t("login.email", "auth"))}
                  className="w-full py-3 px-4 text-white placeholder-gray-500 bg-[#1a1d21] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <p className="text-xs text-gray-500">
                  {String(t("login.email", "auth"))}
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
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

            {/* Buttons Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full py-3 font-medium text-gray-300 transition-all duration-200 bg-[#1a1d21] border border-gray-700 rounded-lg hover:bg-[#1f2226] hover:border-gray-600"
              >
                {String(t("backToTop", "common"))}
              </button>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all duration-200 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-70"
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
          <p className="mt-6 text-center text-gray-400 text-sm">
            {String(t("login.noAccount", "auth"))}{" "}
            <Link
              href="/auth/register"
              className="font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              {String(t("login.registerLink", "auth"))}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
