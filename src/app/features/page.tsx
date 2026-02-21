"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { CheckIcon } from "@radix-ui/react-icons";
import { 
  TruckIcon, 
  UsersIcon, 
  TrendingDownIcon, 
  LockIcon,
  PackageIcon
} from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function FeaturesPage() {
  const { t, currentLanguage } = useLanguage();
  
  const hero = t("hero", "featuresPage");
  const rawSections = t("sections", "featuresPage");
  const sections = Array.isArray(rawSections) ? rawSections : [];
  const otherFeatures = t("otherFeatures", "featuresPage");

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
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [currentLanguage]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "truck": return <TruckIcon className="w-6 h-6" />;
      case "users": return <UsersIcon className="w-6 h-6" />;
      case "trending-down": return <TrendingDownIcon className="w-6 h-6" />;
      case "lock": return <LockIcon className="w-6 h-6" />;
      default: return <PackageIcon className="w-6 h-6" />;
    }
  };

  return (
    <main className="min-h-screen bg-[hsl(var(--vp-bg-page))]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 sm:pt-48 sm:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[hsl(var(--vp-primary))/0.05] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[hsl(var(--vp-accent))/0.05] rounded-full blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--vp-primary))/0.1] border border-[hsl(var(--vp-primary))/0.2] mb-6 vp-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--vp-primary))]" />
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

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 vp-fade-in">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center h-16 vp-button vp-button-primary px-12 text-xl font-black rounded-2xl shadow-2xl hover:shadow-[hsl(var(--vp-primary)/0.4)] hover:scale-105 transition-all"
            >
              {hero?.primaryCta}
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center h-16 vp-button px-12 text-xl font-black rounded-2xl border-2 border-[hsl(var(--vp-border))] bg-white/50 backdrop-blur-sm hover:bg-white hover:border-[hsl(var(--vp-primary)/0.3)] transition-all text-[hsl(var(--vp-text))]"
            >
              {hero?.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <div className="space-y-24 sm:space-y-32 pb-32">
        {sections.map((section: any, index: number) => (
          <section key={section.id} className="relative vp-reveal transition-all duration-1000">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className={`grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-center`}>
                <div className={`${index % 2 !== 0 ? 'lg:order-2' : ''} lg:col-span-2 space-y-8`}>
                  <div className="space-y-6">
                    <h2 className="vp-section-title text-balance leading-tight">
                      {section.title}
                    </h2>
                    <p className="vp-hero-subtitle text-lg leading-relaxed">
                      {section.description}
                    </p>
                  </div>

                  <ul className="space-y-4">
                    {section.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 group">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-border))] flex items-center justify-center shadow-sm group-hover:border-[hsl(var(--vp-primary))/0.5] transition-colors">
                          <CheckIcon className="w-3.5 h-3.5 text-[hsl(var(--vp-primary))]" />
                        </div>
                        <span className="text-[hsl(var(--vp-muted))] font-medium group-hover:text-[hsl(var(--vp-text))] transition-colors">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`${index % 2 !== 0 ? 'lg:order-1' : ''} lg:col-span-3`}>
                  <div className="vp-mockup-shell vp-float bg-white border border-[hsl(var(--vp-border))] rounded-[24px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-transform duration-500 hover:scale-[1.02]">
                    <div className="p-3 sm:p-6 bg-white w-full">
                      <div className="relative w-full aspect-[16/10] sm:aspect-video rounded-lg overflow-hidden border border-[hsl(var(--vp-border))/0.3]">
                        <Image 
                          src={section.image} 
                          alt={section.title}
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 1024px) 100vw, 800px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Other Features Grid */}
      <section className="py-24 sm:py-32 bg-[hsl(var(--vp-bg-section))] border-y border-[hsl(var(--vp-border))]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="vp-section-title">{otherFeatures?.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {otherFeatures?.items.map((item: any, i: number) => (
              <div key={i} className="vp-card p-10 group hover:border-[hsl(var(--vp-primary))/0.4] transition-all duration-300 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--vp-primary))/0.1] border border-[hsl(var(--vp-primary))/0.2] flex items-center justify-center text-[hsl(var(--vp-primary))] mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  {getIcon(item.icon)}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[hsl(var(--vp-text))]">{item.title}</h3>
                <p className="text-[hsl(var(--vp-muted))] leading-relaxed text-lg">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </main>
  );
}
