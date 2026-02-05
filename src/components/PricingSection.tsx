import Link from "next/link";
import { CheckIcon } from "@radix-ui/react-icons";
import { useLang, useLanguage } from "@/lib/hooks/useLang";

export default function PricingSection() {
  const t = useLang("pricing");
  const { t: tCommon } = useLanguage();

  return (
    <section
      id="pricing"
      className="vp-section vp-reveal relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[hsl(var(--vp-primary))]/10 blur-[140px]" />
        <div className="absolute bottom-[-25%] right-[-10%] h-80 w-80 rounded-full bg-[hsl(var(--vp-primary))]/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))]">
            {String(tCommon("pricing", "common"))}
          </span>
          <h2 className="vp-section-title mt-5">{t("title")}</h2>
          <p className="vp-section-subtitle text-lg">{t("subtitle")}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Plan Gratuito */}
          <div className="group relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[hsl(var(--vp-primary))]/10 via-transparent to-[hsl(var(--vp-primary))]/5 opacity-0 blur transition duration-300 group-hover:opacity-100" />
            <div className="relative h-full rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))]/85 p-8 sm:p-10 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.6)] backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <h3 className="text-2xl font-semibold text-[hsl(var(--vp-text))]">
                  {t("free")}
                </h3>
                <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))]">
                  {t("freeDescription")}
                </span>
              </div>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-4xl sm:text-5xl font-semibold text-[hsl(var(--vp-text))]">
                  {t("freePrice")}
                </span>
                <span className="text-[hsl(var(--vp-muted))] mb-1">
                  {t("freeSubtitle")}
                </span>
              </div>

              <ul className="mt-10 space-y-4">
                {t("freeFeatures", true).map((item: string) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))]">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                    <span className="text-[hsl(var(--vp-muted))] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register"
                className="w-full inline-flex justify-center mt-10 vp-button"
              >
                {t("startFree")}
              </Link>
            </div>
          </div>

          {/* Plan Pro – Featured */}
          <div className="group relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[hsl(var(--vp-primary))]/50 via-[hsl(var(--vp-primary))]/10 to-transparent opacity-80 blur" />
            <div className="relative h-full rounded-2xl border border-[hsl(var(--vp-primary))] bg-[hsl(var(--vp-bg))]/90 p-8 sm:p-10 shadow-[0_25px_60px_-30px_rgba(37,99,235,0.55)] backdrop-blur-sm">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                <span className="vp-pill shadow-[0_10px_25px_rgba(37,99,235,0.35)] border border-[hsl(var(--vp-primary))]/30 bg-[hsl(var(--vp-bg))]">
                  {t("mostPopular")}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <h3 className="text-2xl font-semibold text-[hsl(var(--vp-text))]">
                  {t("pro")}
                </h3>
                <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-primary))]">
                  {t("proDescription")}
                </span>
              </div>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-4xl sm:text-5xl font-semibold text-[hsl(var(--vp-text))]">
                  {t("proPrice")}
                </span>
                <span className="text-[hsl(var(--vp-muted))] mb-1">
                  {t("proSubtitle")}
                </span>
              </div>

              <p className="text-[hsl(var(--vp-muted))] mt-4 text-sm">
                {t("proDescription")}
              </p>

              <ul className="mt-8 space-y-4">
                {t("proFeatures", true).map((item: string) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--vp-primary))]/15 text-[hsl(var(--vp-primary))]">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                    <span className="text-[hsl(var(--vp-muted))] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register?plan=pro"
                className="w-full inline-flex justify-center mt-10 vp-button vp-button-primary"
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
