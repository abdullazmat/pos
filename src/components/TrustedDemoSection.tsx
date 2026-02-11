"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

const LOGOS = [
  { src: "/father.png", alt: "Father Truck" },
  { src: "/CasaFika.png", alt: "Casa Fika" },
  { src: "/Logo-Dar-Jee-Ling.webp", alt: "Dar Jee Ling" },
  { src: "/Logo-Elemento.webp", alt: "Elemento" },
  { src: "/Logo-Fondado.webp", alt: "Fondado" },
  { src: "/Logo-Wonderplay.webp", alt: "Wonderplay" },
  { src: "/uma-beau.png", alt: "Uma Beau" },
  { src: "/mantrafit.png", alt: "Mantra Fit" },
];

const DEMO_IMAGE_URL =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80";

export default function TrustedDemoSection() {
  const { t } = useLanguage();
  const content = t("trustedDemo", "landing") as {
    title: string;
    demoTitle: string;
    demoSubtitle: string;
    demoCta: string;
    demoImageAlt: string;
  };

  return (
    <section className="bg-[hsl(var(--vp-surface))]">
      <div className="px-6 py-20 mx-auto max-w-7xl sm:py-24 lg:py-28">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[hsl(var(--vp-text))]">
            {content?.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 mt-10 sm:gap-12">
          {LOGOS.map((logo, index) => (
            <div
              key={logo.src}
              className="vp-float-soft flex items-center justify-center rounded-2xl border border-[hsl(var(--vp-border))] bg-white px-6 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="object-contain w-auto h-9 sm:h-10 md:h-11"
              />
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="space-y-5">
            <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-[hsl(var(--vp-text))]">
              {content?.demoTitle}
            </h3>
            <p className="text-[hsl(var(--vp-muted))] text-base sm:text-lg leading-relaxed max-w-xl">
              {content?.demoSubtitle}
            </p>
            <Link href="/contact" className="px-6 py-3 vp-button vp-button-primary vp-micro inline-block">
              {content?.demoCta}
            </Link>
          </div>

          <div className="rounded-3xl overflow-hidden bg-[hsl(var(--vp-bg-card))] shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
            <img
              src={DEMO_IMAGE_URL}
              alt={content?.demoImageAlt}
              className="object-cover w-full h-full grayscale"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
