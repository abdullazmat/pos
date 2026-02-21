"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useLanguage } from "@/lib/context/LanguageContext";
import { 
  CheckCircle2Icon, 
  SparklesIcon, 
  ZapIcon, 
  RocketIcon, 
  HelpCircleIcon 
} from "lucide-react";

export default function PricingPage() {
  const { t, currentLanguage } = useLanguage();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hero = useMemo(() => t("hero", "pricingPage") as any, [t, currentLanguage]);
  const faqData = useMemo(() => t("faq", "pricingPage") as any, [t, currentLanguage]);
  const billingLabels = useMemo(() => t("billing", "pricingPage") as any, [t, currentLanguage]);
  const pricingData = useMemo(() => t("pricingSection", "landing") as any, [t, currentLanguage]);
  const plans = useMemo(() => pricingData?.plans || [], [pricingData]);

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

  return (
    <main className="min-h-screen bg-[hsl(var(--vp-bg-page))]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 sm:pt-48 sm:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[55%] bg-[hsl(var(--vp-primary))/0.05] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[55%] h-[55%] bg-[hsl(var(--vp-accent))/0.05] rounded-full blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center vp-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--vp-primary))/0.1] border border-[hsl(var(--vp-primary))/0.15] mb-8 vp-fade-in shadow-sm">
            <ZapIcon className="w-3.5 h-3.5 text-[hsl(var(--vp-primary))]" />
            <span className="text-[hsl(var(--vp-primary))] font-black tracking-[0.2em] uppercase text-[10px]">
              {String(t("pricing", "common"))}
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-balance mb-8 max-w-4xl mx-auto tracking-tight leading-[1.05] text-[hsl(var(--vp-text))]">
            {hero?.title}
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-balance font-medium text-[hsl(var(--vp-muted))] leading-relaxed mb-4">
            {hero?.subtitle}
          </p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="pb-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Billing Toggle */}
          <div className="flex flex-col items-center gap-4 mb-20 vp-reveal">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))]">
              {pricingData?.billingTitle}
            </p>
            <div className="inline-flex items-center gap-4 rounded-3xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] p-2 shadow-xl">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${
                  billing === "monthly" 
                    ? "bg-[hsl(var(--vp-primary))] text-white shadow-lg" 
                    : "text-[hsl(var(--vp-muted))] hover:text-[hsl(var(--vp-text))]"
                }`}
              >
                {pricingData?.billingMonthly}
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${
                  billing === "annual" 
                    ? "bg-[hsl(var(--vp-primary))] text-white shadow-lg" 
                    : "text-[hsl(var(--vp-muted))] hover:text-[hsl(var(--vp-text))]"
                }`}
              >
                {pricingData?.billingAnnual}
                <span className="bg-white/20 px-2 py-0.5 rounded-md text-[8px] uppercase tracking-tighter">
                    -20%
                </span>
              </button>
            </div>
            {billing === "annual" && (
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--vp-primary))] animate-in fade-in slide-in-from-top-2">
                {pricingData?.billingSavings}
              </span>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {plans.map((plan: any, index: number) => (
              <div
                key={index}
                className={`relative vp-card p-10 sm:p-12 flex flex-col vp-reveal transition-all duration-500 hover:scale-[1.02] ${
                  plan.featured 
                    ? "border-2 border-[hsl(var(--vp-primary))] shadow-[0_40px_80px_-20px_rgba(34,197,94,0.15)] bg-gradient-to-br from-[hsl(var(--vp-surface))] to-[hsl(var(--vp-primary)/0.03)]" 
                    : "border-[hsl(var(--vp-border))] hover:border-[hsl(var(--vp-primary)/0.3)] shadow-sm bg-[hsl(var(--vp-bg))]"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-[hsl(var(--vp-primary))] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    {pricingData?.mostPopular}
                  </div>
                )}

                <div className="mb-10">
                  <h3 className="text-2xl font-black mb-4 tracking-tight">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl sm:text-6xl font-black tracking-tighter text-[hsl(var(--vp-text))]">
                      {billing === 'monthly' ? plan.monthly : plan.annual}
                    </span>
                    <span className="text-xl text-[hsl(var(--vp-muted))] font-bold">
                      / {billing === 'monthly' ? billingLabels?.monthly : billingLabels?.yearly}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--vp-muted))] font-black uppercase tracking-[0.2em] opacity-70">
                    {plan.caption}
                  </p>
                </div>

                <div className="mb-10 p-5 rounded-2xl bg-[hsl(var(--vp-primary))/0.05] border border-[hsl(var(--vp-primary))/0.1] shadow-inner">
                  <p className="text-sm font-black text-[hsl(var(--vp-primary))] flex items-center gap-2">
                    <RocketIcon className="w-4 h-4" />
                    {plan.usage}
                  </p>
                </div>

                <ul className="space-y-5 mb-12 flex-grow">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-4 group">
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-[hsl(var(--vp-primary))/0.1] flex items-center justify-center text-[hsl(var(--vp-primary))] group-hover:bg-[hsl(var(--vp-primary))] group-hover:text-white transition-all duration-300 shadow-sm">
                        <CheckIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[hsl(var(--vp-muted))] group-hover:text-[hsl(var(--vp-text))] transition-colors duration-300 font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.featured ? "/auth/register?plan=pro" : "/auth/register?plan=free"}
                  className={`vp-button w-full h-16 text-lg font-black tracking-wide transition-all duration-300 rounded-2xl ${
                    plan.featured 
                      ? "vp-button-primary shadow-2xl shadow-[hsl(var(--vp-primary))/0.3] hover:scale-105" 
                      : "border-2 border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] hover:border-[hsl(var(--vp-primary))] hover:shadow-lg text-[hsl(var(--vp-text))]"
                  }`}
                >
                  {pricingData?.cta}
                  <ArrowRightIcon className="w-5 h-5 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 sm:py-32 bg-[hsl(var(--vp-bg-section))] border-y border-[hsl(var(--vp-border))] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
            <HelpCircleIcon className="w-96 h-96" />
        </div>
        
        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <div className="text-center mb-20 vp-reveal">
            <h2 className="text-4xl sm:text-5xl font-black text-[hsl(var(--vp-text))] mb-6 tracking-tight">{faqData?.title}</h2>
          </div>

          <div className="space-y-4">
            {faqData?.items.map((item: any, index: number) => (
              <div 
                key={index} 
                className="vp-card overflow-hidden border-[hsl(var(--vp-border))] hover:border-[hsl(var(--vp-primary)/0.3)] transition-all duration-300 vp-reveal shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-8 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-black text-xl tracking-tight leading-tight">{item.question}</span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border border-[hsl(var(--vp-border))] ${openFaq === index ? 'bg-[hsl(var(--vp-primary))] text-white border-[hsl(var(--vp-primary))] rotate-180 shadow-lg' : 'bg-[hsl(var(--vp-bg-soft))] text-[hsl(var(--vp-muted))]'}`}>
                    <ChevronDownIcon className="w-6 h-6" />
                  </div>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <div className="px-8 pb-8 pt-2 text-[hsl(var(--vp-muted))] leading-relaxed font-medium text-lg">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}

function ArrowRightIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    )
  }
