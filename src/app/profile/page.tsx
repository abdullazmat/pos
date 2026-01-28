"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Loading from "@/components/common/Loading";
import { useLanguage } from "@/lib/context/LanguageContext";

interface UserProfile {
  fullName: string;
  email: string;
  role?: string;
  phoneNumber?: string;
  businessName?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState<UserProfile>({
    fullName: "",
    email: "",
    role: "",
    phoneNumber: "",
    businessName: "",
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setForm({
          fullName: parsed.fullName || "",
          email: parsed.email || "",
          role: parsed.role || "",
          phoneNumber: parsed.phoneNumber || "",
          businessName: parsed.businessName || "",
        });
      }

      if (!token) return;

      const res = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          setForm({
            fullName: data.data.fullName || "",
            email: data.data.email || "",
            role: data.data.role || "",
            phoneNumber: data.data.phoneNumber || "",
            businessName:
              data.data.businessName || data.data.business?.name || "",
          });
        }
      }
    } catch (err) {
      console.error("Error loading profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber || undefined,
          businessName: form.businessName || undefined,
          password: password || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(String(t("updateErrorGeneric", "profile")));
      }

      const updatedUser = { ...form };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setPassword("");
      setMessage(String(t("updateSuccess", "profile")));
    } catch (err) {
      console.error("Error updating profile", err);
      setMessage(String(t("updateError", "profile")));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading label={String(t("loading", "profile"))} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label={String(t("back", "profile"))}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-gray-500">
              {String(t("account", "profile"))}
            </p>
            <h1 className="text-xl font-semibold text-gray-900">
              {String(t("title", "profile"))}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {message && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {String(t("personalInfo", "profile"))}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {String(t("userData", "profile"))}
              </h2>
              <p className="text-sm text-gray-500">
                {String(t("updateDescription", "profile"))}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {String(t("goToDashboard", "profile"))}
            </Link>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("fullName", "profile"))}
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("email", "profile"))}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("phone", "profile"))}
                </label>
                <input
                  type="tel"
                  value={form.phoneNumber || ""}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500"
                  placeholder={String(t("phonePlaceholder", "profile"))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("role", "profile"))}
                </label>
                <input
                  type="text"
                  value={form.role || ""}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-700 px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("businessName", "profile"))}
                </label>
                <input
                  type="text"
                  value={form.businessName || ""}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500"
                  placeholder={String(t("businessPlaceholder", "profile"))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("password", "profile"))}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={String(t("passwordPlaceholder", "profile"))}
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500"
                  minLength={6}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={loadProfile}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={saving}
              >
                {String(t("reset", "profile"))}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {String(t("save", "profile"))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
