import { useLanguage } from "@/lib/context/LanguageContext";

export default function Stats() {
  const { t } = useLanguage();
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 text-center vp-reveal">
      <div>
        <h2 className="text-4xl md:text-6xl font-semibold text-[hsl(var(--vp-text))]">
          100%
        </h2>
        <p className="text-[hsl(var(--vp-muted))] mt-3 text-base md:text-lg">
          {String(t("stats.cloud", "landing"))}
        </p>
      </div>
      <div>
        <h2 className="text-4xl md:text-6xl font-semibold text-[hsl(var(--vp-text))]">
          $0
        </h2>
        <p className="text-[hsl(var(--vp-muted))] mt-3 text-base md:text-lg">
          {String(t("stats.initialPlan", "landing"))}
        </p>
      </div>
      <div>
        <h2 className="text-4xl md:text-6xl font-semibold text-[hsl(var(--vp-text))]">
          24/7
        </h2>
        <p className="text-[hsl(var(--vp-muted))] mt-3 text-base md:text-lg">
          {String(t("stats.available", "landing"))}
        </p>
      </div>
    </section>
  );
}
