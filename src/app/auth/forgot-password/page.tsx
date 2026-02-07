"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslatedToast } from "@/lib/hooks/useTranslatedToast";
import Header from "@/components/Header";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useTranslatedToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailSent(true);
        toast.success("forgotPassword.emailSent", "auth");
      } else {
        // Still show success message for security (don't reveal if email exists)
        setEmailSent(true);
      }
    } catch (err) {
      // Still show success message for security
      setEmailSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--vp-bg-page))] p-4 pt-28 text-[hsl(var(--vp-text))]">
          <div className="relative w-full max-w-xl">
            <div className="rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] p-8 shadow-[var(--vp-shadow-soft)]">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600">
                <svg
                  className="text-white w-9 h-9"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold text-[hsl(var(--vp-text))]">
                {String(t("forgotPassword.emailSent", "auth"))}
              </h1>
              <p className="text-sm text-[hsl(var(--vp-muted))]">
                {String(t("forgotPassword.emailSentMessage", "auth"))}
              </p>
            </div>

            {/* Back to Login */}
            <Link
              href="/auth/login"
              className="block w-full rounded-lg bg-[hsl(var(--vp-primary))] py-3 text-center font-medium text-white transition-all duration-200 hover:bg-[hsl(var(--vp-primary-strong))]"
            >
              {String(t("forgotPassword.backToLogin", "auth"))}
            </Link>
            </div>
          </div>
        </div>
      </>
    );
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
                className="text-white w-9 h-9"
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
              {String(t("forgotPassword.title", "auth"))}
            </h1>
            <p className="text-sm text-[hsl(var(--vp-muted))]">
              {String(t("forgotPassword.subtitle", "auth"))}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[hsl(var(--vp-text))]">
                {String(t("forgotPassword.email", "auth"))}{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder={String(t("forgotPassword.email", "auth"))}
                className="w-full rounded-lg border border-[hsl(var(--vp-border-soft))] bg-[hsl(var(--vp-bg-card-soft))] px-4 py-3 text-[hsl(var(--vp-text))] placeholder:text-[hsl(var(--vp-muted-soft))] transition-all focus:outline-none focus:border-[hsl(var(--vp-primary))] focus:ring-2 focus:ring-[hsl(var(--vp-ring)/0.25)]"
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {/* Submit Button */}
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
                  String(t("forgotPassword.submit", "auth"))
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
