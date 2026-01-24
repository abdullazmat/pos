import { useLanguage } from "@/lib/context/LanguageContext";

export default function Stats() {
  const { t } = useLanguage();
  return (
    <section className="grid grid-cols-3 gap-8 text-center">
      <div>
        <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white">
          100%
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          {String(t("stats.cloud", "landing"))}
        </p>
      </div>
      <div>
        <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white">
          $0
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          {String(t("stats.initialPlan", "landing"))}
        </p>
      </div>
      <div>
        <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white">
          24/7
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          {String(t("stats.available", "landing"))}
        </p>
      </div>
    </section>
  );
}
