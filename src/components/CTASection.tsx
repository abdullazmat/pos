"use client";

// components/CTASection.tsx
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function CTASection() {
  const { t } = useLanguage();
  const promo = t("promoCta", "landing") as {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
  };
  return (
    <section id="cta" className="vp-reveal py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-[28px] border border-[hsl(var(--vp-border))] bg-gradient-to-r from-[hsl(var(--vp-primary))]/35 via-[hsl(var(--vp-primary))]/25 to-[hsl(var(--vp-warning))]/20 px-6 py-10 text-center shadow-[0_30px_70px_-45px_rgba(15,23,42,0.7)]">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -left-24 -top-16 h-40 w-40 rounded-full bg-[hsl(var(--vp-primary))]/35" />
            <div className="absolute right-[-10%] bottom-[-40%] h-56 w-56 rounded-full bg-[hsl(var(--vp-warning))]/40" />
          </div>
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[hsl(var(--vp-text))]">
              {promo?.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[hsl(var(--vp-text))] sm:text-3xl">
              {promo?.title}
            </h2>
            <p className="mt-3 text-sm text-[hsl(var(--vp-muted))] sm:text-base">
              {promo?.subtitle}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                className="inline-flex vp-button vp-button-primary px-6"
              >
                {promo?.primaryCta}
              </Link>
              <span className="text-sm text-[hsl(var(--vp-muted))]">
                {String(t("cta.noCard", "landing"))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
