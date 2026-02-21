"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function CareersPage() {
  const { t, currentLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hero = useMemo(() => t("hero", "careersPage") as any, [t, currentLanguage]);
  const whyJoin = useMemo(() => t("whyJoin", "careersPage") as any, [t, currentLanguage]);
  const openPositions = useMemo(() => t("openPositions", "careersPage") as any, [t, currentLanguage]);

  if (!mounted) return null;

  return (
    <>
      <Header />
      <main className="vp-page pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--vp-primary))]/6 via-transparent to-[hsl(var(--vp-warning))]/5" />
          <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <div className="vp-pill mb-6 mx-auto w-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                {hero?.badge}
              </div>
              <h1 className="vp-section-title mb-5">
                {hero?.title}
              </h1>
              <p className="text-lg text-[hsl(var(--vp-muted))] leading-relaxed max-w-2xl mx-auto">
                {hero?.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Perks */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <h2 className="vp-heading text-center mb-10">{whyJoin?.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyJoin?.perks?.map((perk: any) => (
              <div key={perk.title} className="vp-card p-6 text-center hover:shadow-[var(--vp-shadow)] transition-all duration-300">
                <div className="text-3xl mb-3">{perk.icon}</div>
                <h3 className="font-semibold text-[hsl(var(--vp-text))] mb-1">{perk.title}</h3>
                <p className="text-sm text-[hsl(var(--vp-muted))]">{perk.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="border-t border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))]">
          <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="vp-heading mb-4">{openPositions?.title}</h2>
              <p className="text-[hsl(var(--vp-muted))] mb-10">
                {openPositions?.subtitle}
              </p>
              <div className="vp-card p-8 text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--vp-muted))] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <h3 className="text-lg font-semibold text-[hsl(var(--vp-text))] mb-2">{openPositions?.spontaneous?.title}</h3>
                <p className="text-sm text-[hsl(var(--vp-muted))] mb-4 max-w-md mx-auto">
                  {openPositions?.spontaneous?.description}
                </p>
                <a href="mailto:careers@ventaplus.com.ar" className="vp-button vp-button-primary">
                  {openPositions?.spontaneous?.button}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
