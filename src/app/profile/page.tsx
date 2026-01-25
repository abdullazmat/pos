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
        throw new Error(String(t("profile.updateErrorGeneric", "ui")));
      }

      const updatedUser = { ...form };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setPassword("");
      setMessage(String(t("profile.updateSuccess", "ui")));
    } catch (err) {
      console.error("Error updating profile", err);
      setMessage(String(t("profile.updateError", "ui")));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading label={String(t("profile.loading", "ui"))} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label={String(t("profile.back", "ui"))}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-gray-500">
              {String(t("profile.account", "ui"))}
            </p>
            <h1 className="text-xl font-semibold text-gray-900">
              {String(t("profile.title", "ui"))}
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

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {String(t("profile.personalInfo", "ui"))}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {String(t("profile.userData", "ui"))}
              </h2>
              <p className="text-sm text-gray-500">
                {String(t("profile.updateDescription", "ui"))}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {String(t("profile.goToDashboard", "ui"))}
            </Link>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("profile.fullName", "ui"))}
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("profile.email", "ui"))}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("profile.phone", "ui"))}
                </label>
                <input
                  type="tel"
                  value={form.phoneNumber || ""}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder={String(t("profile.phonePlaceholder", "ui"))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("profile.role", "ui"))}
                </label>
                <input
                  type="text"
                  value={form.role || ""}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("profile.businessName", "ui"))}
                </label>
                <input
                  type="text"
                  value={form.businessName || ""}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder={String(t("profile.businessPlaceholder", "ui"))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String(t("profile.password", "ui"))}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={String(t("profile.passwordPlaceholder", "ui"))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                {String(t("profile.reset", "ui"))}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {String(t("profile.save", "ui"))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
