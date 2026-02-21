"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { 
  CheckIcon, 
  ArrowRightIcon, 
  PlusIcon,
  CreditCardIcon,
  TruckIcon,
  MessageCircleIcon,
  ZapIcon
} from "lucide-react";

export default function IntegrationsPage() {
  const { t, currentLanguage } = useLanguage();

  const hero = t("hero", "integrationsPage");
  const arca = t("arcaSection", "integrationsPage");
  const other = t("otherIntegrations", "integrationsPage");

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".vp-reveal");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [currentLanguage]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "payments": return <CreditCardIcon className="w-5 h-5" />;
      case "logistics": return <TruckIcon className="w-5 h-5" />;
      case "marketing": return <MessageCircleIcon className="w-5 h-5" />;
      default: return <PlusIcon className="w-5 h-5" />;
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))] pb-24">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 sm:pt-48 sm:pb-24 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[hsl(var(--vp-primary))/0.05] rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[hsl(var(--vp-accent))/0.05] rounded-full blur-[120px]" />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center vp-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--vp-primary))/0.1] border border-[hsl(var(--vp-primary))/0.2] mb-6 vp-fade-in">
              <ZapIcon className="w-3.5 h-3.5 text-[hsl(var(--vp-primary))]" />
              <span className="text-[hsl(var(--vp-primary))] font-bold tracking-wider uppercase text-[10px]">
                {hero?.eyebrow}
              </span>
            </div>
            <h1 className="vp-hero-title text-balance mb-8 max-w-4xl mx-auto">
              {hero?.title}
            </h1>
            <p className="vp-hero-subtitle text-xl max-w-2xl mx-auto text-balance">
              {hero?.subtitle}
            </p>
          </div>
        </section>

        {/* Main ARCA Integration Card */}
        <section className="max-w-7xl mx-auto px-6 mb-24 vp-reveal">
          <div className="vp-card overflow-hidden border-[hsl(var(--vp-primary))/0.2] shadow-[0_20px_50px_-12px_rgba(var(--vp-primary-rgb),0.1)]">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12 lg:p-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--vp-success))/0.1] border border-[hsl(var(--vp-success))/0.2] mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--vp-success))] animate-pulse" />
                  <span className="text-[hsl(var(--vp-success))] text-[10px] font-bold uppercase tracking-wider">
                    {arca?.badge}
                  </span>
                </div>
                <h2 className="vp-section-title mb-6">{arca?.title}</h2>
                <p className="vp-hero-subtitle text-lg mb-8">{arca?.description}</p>
                
                <ul className="grid sm:grid-cols-2 gap-4 mb-10">
                  {arca?.features?.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--vp-success))/0.1] flex items-center justify-center text-[hsl(var(--vp-success))] group-hover:bg-[hsl(var(--vp-success))] group-hover:text-white transition-all">
                        <CheckIcon className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium text-[hsl(var(--vp-muted))] group-hover:text-[hsl(var(--vp-text))] transition-colors">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/support/tutorials/arca-invoicing" className="vp-button vp-button-primary h-12 px-8">
                  {arca?.cta}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-gradient-to-br from-[hsl(var(--vp-bg-soft))] to-[hsl(var(--vp-bg-section))] border-l border-[hsl(var(--vp-border))] p-8 sm:p-12 lg:p-16 flex items-center justify-center">
                <div className="w-full max-w-sm">
                  {/* Visual Representation */}
                  <div className="vp-card p-6 mb-8 relative bg-white dark:bg-[hsl(var(--vp-bg-card))] rotate-[-2deg] shadow-xl">
                    <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[hsl(var(--vp-success))/0.1] border border-[hsl(var(--vp-success))/0.2] text-[9px] font-bold text-[hsl(var(--vp-success))] uppercase">
                      {arca?.visual?.authorized}
                    </div>
                    <div className="space-y-4">
                      <div className="w-12 h-2 rounded bg-[hsl(var(--vp-muted))/0.2]" />
                      <div className="w-24 h-4 rounded bg-[hsl(var(--vp-text))/0.1]" />
                      <div className="space-y-2 pt-2 border-t border-[hsl(var(--vp-border))/0.5]">
                        <div className="flex justify-between">
                          <span className="text-[10px] text-[hsl(var(--vp-muted))] uppercase font-bold tracking-tight">{arca?.visual?.amount}</span>
                          <span className="text-xs font-bold">$15,420.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-[hsl(var(--vp-muted))] uppercase font-bold tracking-tight">{arca?.visual?.iva}</span>
                          <span className="text-xs font-bold">$3,238.20</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[hsl(var(--vp-border))/0.5]">
                         <div className="flex justify-between items-center">
                          <span className="text-[9px] text-[hsl(var(--vp-muted))] font-mono">CAE: 734219854...</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[hsl(var(--vp-bg-card))] border border-[hsl(var(--vp-border))] flex items-center justify-center shadow-lg">
                      <span className="font-bold text-[hsl(var(--vp-primary))] text-lg">VP</span>
                    </div>
                    <div className="flex-1 h-1 bg-gradient-to-r from-[hsl(var(--vp-primary))]/20 to-[hsl(var(--vp-success))] relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[hsl(var(--vp-success))] animate-ping" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[hsl(var(--vp-success))]" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[hsl(var(--vp-bg-card))] border border-[hsl(var(--vp-border))] flex items-center justify-center shadow-lg">
                      <span className="font-bold text-[hsl(var(--vp-success))] text-xs">AFIP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Integrations Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <h2 className="vp-section-title text-center mb-16 vp-reveal">{other?.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {other?.items?.map((item: any, i: number) => (
              <div key={i} className="vp-card p-8 group hover:border-[hsl(var(--vp-primary))/0.4] transition-all duration-300 vp-reveal">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--vp-primary))/0.05] border border-[hsl(var(--vp-primary))/0.1] flex items-center justify-center text-[hsl(var(--vp-primary))] group-hover:scale-110 group-hover:bg-[hsl(var(--vp-primary))] group-hover:text-white transition-all duration-300">
                    {getCategoryIcon(item.category)}
                  </div>
                  {item.status === "coming_soon" ? (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[hsl(var(--vp-muted))/0.1] text-[hsl(var(--vp-muted))]">
                      {other?.comingSoon}
                    </span>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--vp-success))]" />
                  )}
                </div>
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-[hsl(var(--vp-primary))] uppercase tracking-widest">
                    {other?.categories?.[item.category]}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.name}</h3>
                <p className="text-sm text-[hsl(var(--vp-muted))] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Suggest CTA Section */}
        <section className="max-w-7xl mx-auto px-6 vp-reveal">
          <div className="rounded-3xl border border-dashed border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-section))] p-10 sm:p-20 text-center relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[hsl(var(--vp-primary))/0.03] rounded-full blur-[80px] -z-10" />
            <div className="max-w-2xl mx-auto">
              <PlusIcon className="w-12 h-12 mx-auto mb-6 text-[hsl(var(--vp-primary))] opacity-50" />
              <h2 className="vp-section-title mb-4">{other?.suggestTitle}</h2>
              <p className="vp-hero-subtitle mb-10 max-w-lg mx-auto">
                {other?.suggestDesc}
              </p>
              <Link href="/contact" className="vp-button vp-button-primary h-12 px-10">
                {other?.suggestCta}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
