"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

import controlPanelImage from "../../dashbaord images/control de caja.jpeg";
import incomeImage from "../../dashbaord images/punto de venta.jpeg";
import expensesImage from "../../dashbaord images/Gastos.jpeg";
import stockImage from "../../dashbaord images/Categorias.jpeg";
import informationImage from "../../dashbaord images/Screenshot_7.png";
import integrationsImage from "../../dashbaord images/Screenshot_9.png";
import tourImage from "../../dashbaord images/WhatsApp Image 2025-12-09 at 11.25.13.jpeg";

const INSIGHT_BLOCKS = [
  {
    image: controlPanelImage,
  },
  {
    image: incomeImage,
  },
  {
    image: expensesImage,
  },
  {
    image: stockImage,
  },
  {
    image: informationImage,
    href: "/reports",
    imageFit: "object-cover",
  },
  {
    image: integrationsImage,
    href: "/payment",
  },
];

export default function BusinessInsightsSection() {
  const { t } = useLanguage();
  const content = t("businessInsights", "landing") as {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    blocks: Array<{
      title: string;
      subtitle: string;
      description: string;
      cta?: string;
      alt: string;
    }>;
    bottomEyebrow: string;
    bottomTitle: string;
    bottomSubtitle: string;
    bottomCta: string;
    bottomNote: string;
    bottomImageAlt: string;
  };

  return (
    <>
      <section className="relative overflow-hidden bg-[hsl(var(--vp-warning)/0.25)]">
        <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-[hsl(var(--vp-warning)/0.3)]" />
        <div className="absolute -left-16 bottom-8 h-48 w-48 rounded-full bg-[hsl(var(--vp-warning)/0.2)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-24">
          <p className="text-sm font-semibold tracking-[0.2em] text-[hsl(var(--vp-text))]">
            {content?.heroEyebrow}
          </p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-[hsl(var(--vp-text))] sm:text-4xl">
            {content?.heroTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[hsl(var(--vp-muted))] sm:text-lg">
            {content?.heroSubtitle}
          </p>
        </div>
      </section>
      <section className="bg-[hsl(var(--vp-bg))]">
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="space-y-16">
            {INSIGHT_BLOCKS.map((block, index) => {
              const copy = content?.blocks?.[index];
              const isReversed = index % 2 !== 0;

              return (
                <div
                  key={`${copy?.title ?? "insight"}-${index}`}
                  className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
                >
                  <div
                    className={`space-y-4 text-left ${
                      isReversed ? "lg:order-2" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[hsl(var(--vp-muted))]">
                      {copy?.title}
                    </p>
                    <h3 className="text-2xl font-semibold text-[hsl(var(--vp-text))] sm:text-3xl">
                      {copy?.subtitle}
                    </h3>
                    <p className="text-base leading-relaxed text-[hsl(var(--vp-muted))]">
                      {copy?.description}
                    </p>
                    {block.href && copy?.cta ? (
                      <Link
                        href={block.href}
                        className="vp-button vp-button-secondary vp-tap inline-flex"
                      >
                        {copy.cta}
                      </Link>
                    ) : null}
                  </div>
                  <div
                    className={`vp-card overflow-hidden bg-white shadow-[0_18px_45px_-35px_rgba(15,23,42,0.6)] ${
                      isReversed ? "lg:order-1" : ""
                    }`}
                  >
                    <div className="relative w-full aspect-[4/3] bg-[hsl(var(--vp-bg-soft))] p-4">
                      <Image
                        src={block.image}
                        alt={copy?.alt ?? ""}
                        fill
                        sizes="(max-width: 1024px) 100vw, 520px"
                        className={block.imageFit ?? "object-contain"}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="bg-[hsl(var(--vp-bg-soft))]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div className="text-center lg:text-left space-y-4">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[hsl(var(--vp-muted))]">
                {content?.bottomEyebrow}
              </p>
              <h3 className="text-3xl font-semibold text-[hsl(var(--vp-text))] sm:text-4xl">
                {content?.bottomTitle}
              </h3>
              <p className="text-base leading-relaxed text-[hsl(var(--vp-muted))]">
                {content?.bottomSubtitle}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <Link
                  href="/auth/register"
                  className="vp-button vp-button-primary vp-tap inline-flex"
                >
                  {content?.bottomCta}
                </Link>
                <span className="text-sm leading-none text-[hsl(var(--vp-muted))] sm:self-center">
                  {content?.bottomNote}
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[32px] bg-[hsl(var(--vp-primary))]/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))] shadow-[0_30px_70px_-45px_rgba(15,23,42,0.7)]">
                <div className="relative aspect-[16/9] w-full bg-[hsl(var(--vp-bg-soft))] p-2 sm:p-3">
                  <Image
                    src={tourImage}
                    alt={content?.bottomImageAlt ?? ""}
                    fill
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
