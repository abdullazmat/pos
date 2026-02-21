"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { 
  UsersIcon, 
  TargetIcon, 
  ShieldCheckIcon, 
  ZapIcon, 
  ArrowRightIcon,
  SparklesIcon,
  GlobeIcon,
  RocketIcon
} from "lucide-react";

export default function AboutPage() {
  const { t, currentLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hero    = useMemo(() => t("hero",    "aboutPage") as any, [t, currentLanguage]);
  const stats   = useMemo(() => t("stats",   "aboutPage") as any[], [t, currentLanguage]);
  const mission = useMemo(() => t("mission", "aboutPage") as any, [t, currentLanguage]);
  const values  = useMemo(() => t("values",  "aboutPage") as any, [t, currentLanguage]);
  const cta     = useMemo(() => t("cta",     "aboutPage") as any, [t, currentLanguage]);

  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted, currentLanguage]);

  if (!mounted) return null;

  const valueItems = [
    {
      icon: <SparklesIcon className="w-6 h-6" />,
      title: values?.simplicity?.title,
      description: values?.simplicity?.description,
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: values?.reliability?.title,
      description: values?.reliability?.description,
    },
    {
      icon: <TargetIcon className="w-6 h-6" />,
      title: values?.customerFirst?.title,
      description: values?.customerFirst?.description,
    },
    {
      icon: <GlobeIcon className="w-6 h-6" />,
      title: values?.localFocus?.title,
      description: values?.localFocus?.description,
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))]">
        
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full blur-[140px]"
              style={{ background: "hsl(var(--vp-primary) / 0.08)" }} />
            <div className="absolute bottom-[-10%] right-[-5%] w-[55%] h-[55%] rounded-full blur-[140px]"
              style={{ background: "hsl(var(--vp-accent) / 0.06)" }} />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center vp-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--vp-primary))/0.1] border border-[hsl(var(--vp-primary))/0.15] mb-8 shadow-sm">
              <UsersIcon className="w-4 h-4 text-[hsl(var(--vp-primary))]" />
              <span className="text-[hsl(var(--vp-primary))] font-black tracking-[0.2em] uppercase text-[10px]">
                {hero?.eyebrow}
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-balance mb-8 max-w-4xl mx-auto tracking-tight leading-[1.05] text-[hsl(var(--vp-text))]">
              {hero?.title}
            </h1>
            <p className="text-xl max-w-2xl mx-auto text-balance font-medium text-[hsl(var(--vp-muted))] leading-relaxed">
              {hero?.subtitle}
            </p>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────── */}
        <section className="border-y border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-section)/0.5)] backdrop-blur-md relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-8">
              {Array.isArray(stats) && stats.map((stat, i) => (
                <div key={i} className="text-center vp-reveal" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="text-4xl sm:text-5xl font-black text-[hsl(var(--vp-primary))] mb-2 tracking-tighter">{stat.value}</div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))] opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission ──────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="vp-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--vp-accent))/0.1] border border-[hsl(var(--vp-accent))/0.15] mb-8">
                <TargetIcon className="w-4 h-4 text-[hsl(var(--vp-accent))]" />
                <span className="text-[hsl(var(--vp-accent))] font-black tracking-[0.2em] uppercase text-[10px]">
                  {mission?.eyebrow}
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-[hsl(var(--vp-text))] mb-8 tracking-tight leading-tight">
                {mission?.title}
              </h2>
              <div className="space-y-6 text-lg text-[hsl(var(--vp-muted))] font-medium leading-relaxed">
                <p>{mission?.p1}</p>
                <p>{mission?.p2}</p>
              </div>
            </div>

            <div className="vp-reveal lg:pl-10" style={{ animationDelay: "200ms" }}>
              <div className="vp-card p-10 sm:p-12 space-y-10 bg-gradient-to-br from-[hsl(var(--vp-primary))/0.05] to-[hsl(var(--vp-accent))/0.03] border-[hsl(var(--vp-border))] shadow-2xl rounded-[3rem]">
                {valueItems.map((value, i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-[hsl(var(--vp-bg-card-soft))] border border-[hsl(var(--vp-border))] text-[hsl(var(--vp-primary))] shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[hsl(var(--vp-text))] mb-2 tracking-tight group-hover:text-[hsl(var(--vp-primary))] transition-colors">{value.title}</h3>
                      <p className="text-sm text-[hsl(var(--vp-muted))] leading-relaxed font-semibold">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 pb-32 vp-reveal">
          <div className="relative overflow-hidden rounded-[4rem] border-2 border-[hsl(var(--vp-border))] p-12 sm:p-24 text-center group bg-[hsl(var(--vp-bg-card))] shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--vp-primary))/0.08] via-transparent to-[hsl(var(--vp-accent))/0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute top-0 right-0 p-20 opacity-[0.03] rotate-12 transition-transform duration-1000 group-hover:rotate-0">
                <ZapIcon className="w-64 h-64" />
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="w-20 h-20 rounded-3xl mx-auto mb-10 flex items-center justify-center bg-[hsl(var(--vp-primary))] text-white shadow-[0_20px_40px_-5px_hsl(var(--vp-primary)/0.4)] rotate-3">
                <RocketIcon className="w-10 h-10" />
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-[hsl(var(--vp-text))] mb-8 tracking-tight leading-tight">
                {cta?.title}
              </h2>
              <p className="text-xl text-[hsl(var(--vp-muted))] mb-12 font-medium leading-relaxed">
                {cta?.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/auth/register" className="vp-button vp-button-primary h-16 px-12 text-xl font-black rounded-2xl shadow-2xl hover:shadow-[hsl(var(--vp-primary)/0.4)] hover:scale-105 transition-all">
                  {cta?.button}
                  <ArrowRightIcon className="w-6 h-6 ml-2" />
                </Link>
                <Link href="/contact" className="vp-button h-16 px-12 text-xl font-black rounded-2xl border-2 border-[hsl(var(--vp-border))] hover:bg-[hsl(var(--vp-bg-soft))] transition-all">
                  {cta?.secondary}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
