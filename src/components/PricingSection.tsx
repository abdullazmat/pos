"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon } from "@radix-ui/react-icons";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function PricingSection() {
  const { t } = useLanguage();
  const content = t("pricingSection", "landing") as {
    title: string;
    subtitle: string;
    billingTitle: string;
    billingMonthly: string;
    billingAnnual: string;
    billingSavings: string;
    mostPopular: string;
    cta: string;
    plans: Array<{
      name: string;
      monthly: string;
      annual: string;
      caption: string;
      usage: string;
      features: string[];
      featured?: boolean;
    }>;
  };
  const plans = content?.plans ?? [];
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

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
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-[0.24em] uppercase text-[hsl(var(--vp-muted))]">
            {String(t("pricing", "common"))}
          </p>
          <h2 className="vp-section-title mt-4">{content?.title}</h2>
          <p className="vp-section-subtitle text-lg max-w-2xl mx-auto">
            {content?.subtitle}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-12">
          <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
            {content?.billingTitle}
          </p>
          <div className="inline-flex items-center gap-3 rounded-full border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))] px-4 py-2">
            <span className="text-sm font-medium text-[hsl(var(--vp-text))]">
              {content?.billingMonthly}
            </span>
            <button
              type="button"
              onClick={() =>
                setBilling((prev) =>
                  prev === "monthly" ? "annual" : "monthly",
                )
              }
              className={`relative h-7 w-14 rounded-full transition ${
                billing === "annual"
                  ? "bg-[hsl(var(--vp-primary))]"
                  : "bg-[hsl(var(--vp-border))]"
              }`}
              aria-pressed={billing === "annual"}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
                  billing === "annual" ? "right-1" : "left-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-[hsl(var(--vp-text))]">
              {content?.billingAnnual}
            </span>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))]">
            {content?.billingSavings}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan, index) => (
            <div
              key={`${plan.name}-${index}`}
              className={`relative rounded-3xl border bg-[hsl(var(--vp-bg))] p-6 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)] ${
                plan.featured
                  ? "border-[hsl(var(--vp-primary))]"
                  : "border-[hsl(var(--vp-border))]"
              }`}
            >
              {plan.featured ? (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 vp-pill border border-[hsl(var(--vp-primary))]/30 bg-[hsl(var(--vp-bg))]">
                  {content?.mostPopular}
                </span>
              ) : null}
              <div className="rounded-2xl bg-[hsl(var(--vp-bg-soft))] px-4 py-2 text-center text-sm font-semibold text-[hsl(var(--vp-text))]">
                {plan.name}
              </div>
              <div className="mt-5 text-center">
                <p className="text-3xl font-semibold text-[hsl(var(--vp-text))]">
                  {billing === "monthly" ? plan.monthly : plan.annual}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))]">
                  {plan.caption}
                </p>
                <p className="mt-3 text-sm text-[hsl(var(--vp-muted))]">
                  {plan.usage}
                </p>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))]">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[hsl(var(--vp-muted))]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={
                  plan.featured
                    ? "/auth/register?plan=pro"
                    : "/auth/register?plan=free"
                }
                className={`mt-6 inline-flex w-full justify-center vp-button ${
                  plan.featured ? "vp-button-primary" : ""
                }`}
              >
                {content?.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
