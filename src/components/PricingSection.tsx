import Link from "next/link";
import { CheckIcon } from "@radix-ui/react-icons";
import { useLang } from "@/lib/hooks/useLang";

export default function PricingSection() {
  const t = useLang("pricing");

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Plan Gratuito */}
          <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-3xl p-10 relative">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("free")}
            </h3>
            <div className="mt-6">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                {t("freePrice")}
              </span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">
                {t("freeSubtitle")}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-400 mt-3">
              {t("freeDescription")}
            </p>

            <ul className="mt-10 space-y-5">
              {t("freeFeatures", true).map((item: string) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/register"
              className="w-full inline-flex justify-center mt-12 py-4 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition"
            >
              {t("startFree")}
            </Link>
          </div>

          {/* Plan Pro – Featured */}
          <div className="relative">
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-40"></div>

            <div className="relative bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-3xl p-10 shadow-2xl">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  {t("mostPopular")}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("pro")}
              </h3>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                  {t("proPrice")}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  {t("proSubtitle")}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-400 mt-3">
                {t("proDescription")}
              </p>

              <ul className="mt-10 space-y-5">
                {t("proFeatures", true).map((item: string) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register?plan=pro"
                className="w-full inline-flex justify-center mt-12 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg"
              >
                {t("tryFree")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
