// components/CTASection.tsx
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function CTASection() {
  const { t } = useLanguage();
  return (
    <section id="cta" className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
          {String(t("cta.title", "landing"))}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg mt-6">
          {String(t("cta.subtitle", "landing"))}
        </p>

        <Link
          href="/auth/register"
          className="inline-block mt-10 text-blue-600 dark:text-blue-500 font-semibold text-lg hover:text-blue-700 dark:hover:text-blue-400 transition"
        >
          {String(t("cta.startFreeNow", "landing"))}
        </Link>

        <p className="text-gray-500 dark:text-gray-500 text-sm mt-6">
          {String(t("cta.noCard", "landing"))}
        </p>
      </div>
    </section>
  );
}
