// components/CTASection.tsx
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function CTASection() {
  const { t } = useLanguage();
  return (
    <section id="cta" className="vp-section vp-reveal relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-20 right-[-10%] h-72 w-72 rounded-full bg-[hsl(var(--vp-primary))]/15 blur-3xl vp-orb" />
        <div className="absolute bottom-[-25%] left-[-5%] h-80 w-80 rounded-full bg-[hsl(var(--vp-primary))]/10 blur-[120px] vp-orb vp-orb-slow" />
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))]/85 px-8 py-16 text-center shadow-[0_30px_70px_-45px_rgba(15,23,42,0.7)] backdrop-blur">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))] vp-micro">
            {String(t("cta.startFreeNow", "landing"))}
          </span>

          <h2 className="vp-heading leading-tight mt-6">
            {String(t("cta.title", "landing"))}
          </h2>
          <p className="vp-subheading text-lg mt-6">
            {String(t("cta.subtitle", "landing"))}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="inline-flex vp-button vp-button-primary px-6 vp-micro"
            >
              {String(t("cta.startFreeNow", "landing"))}
            </Link>
            <span className="text-[hsl(var(--vp-muted))] text-sm">
              {String(t("cta.noCard", "landing"))}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
