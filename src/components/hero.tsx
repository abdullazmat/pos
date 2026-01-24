import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section className="max-w-2xl">
      <p className="text-blue-600 dark:text-yellow-400 text-sm font-medium mb-4 tracking-wider">
        {String(t("hero.badge", "landing"))}
      </p>

      <h1 className="text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">
        {String(t("hero.titleMain", "landing"))} <br />
        <span className="text-blue-600 dark:text-yellow-400">
          {String(t("hero.titleHighlight", "landing"))}
        </span>
      </h1>

      <p className="text-gray-700 dark:text-gray-400 mt-8 text-lg leading-relaxed">
        {String(t("hero.description", "landing"))}
      </p>

      <div className="flex flex-wrap gap-4 mt-10">
        <Link
          href="/auth/register"
          className="px-8 py-4 bg-blue-600 rounded-xl font-semibold text-white hover:bg-blue-700 transition-all transform hover:scale-105"
        >
          {String(t("hero.startFree", "landing"))}
        </Link>
        <Link
          href="#features"
          className="px-8 py-4 border border-gray-400 dark:border-gray-600 rounded-xl font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
        >
          {String(t("hero.viewFeatures", "landing"))}
        </Link>
      </div>
    </section>
  );
}
