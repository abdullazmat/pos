"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import { RocketIcon, ArrowRightIcon } from "lucide-react";

export default function CTASection() {
  const { t } = useLanguage();
  const cta = t("finalCta", "landing") as {
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };

  return (
    <section id="cta" className="vp-reveal py-32 sm:py-48">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-[4rem] border-2 border-[hsl(var(--vp-border))] px-8 py-20 sm:p-24 text-center shadow-[0_50px_100px_-20px_rgba(34,197,94,0.15)] bg-[hsl(var(--vp-bg))] group">
          {/* animated background ornaments */}
          <div className="absolute inset-0 -z-10 group-hover:scale-110 transition-transform duration-[3s]">
            <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[30rem] h-[30rem] bg-gradient-to-br from-[hsl(var(--vp-primary))/0.1] to-transparent rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[30rem] h-[30rem] bg-gradient-to-tr from-[hsl(var(--vp-accent))/0.08] to-transparent rounded-full blur-[120px]" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-10 flex items-center justify-center bg-[hsl(var(--vp-primary))] text-white shadow-2xl shadow-[hsl(var(--vp-primary)/0.4)] rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <RocketIcon className="w-10 h-10" />
            </div>

            <h2 className="text-4xl sm:text-6xl font-black text-[hsl(var(--vp-text))] mb-8 tracking-tight leading-[1.05] text-balance">
              {cta?.title}
            </h2>
            <p className="text-xl sm:text-2xl text-[hsl(var(--vp-muted))] mb-12 font-medium leading-relaxed max-w-2xl mx-auto text-balance">
              {cta?.description}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center h-16 vp-button vp-button-primary px-12 text-xl font-black rounded-2xl shadow-2xl hover:shadow-[hsl(var(--vp-primary)/0.4)] hover:scale-105 transition-all"
              >
                {cta?.primaryCta}
                <ArrowRightIcon className="w-6 h-6 ml-2" />
              </Link>
              <Link
                href="/features"
                className="w-full sm:w-auto inline-flex items-center justify-center h-16 vp-button px-12 text-xl font-black rounded-2xl border-2 border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] backdrop-blur-sm hover:bg-[hsl(var(--vp-bg))] hover:border-[hsl(var(--vp-primary)/0.3)] transition-all text-[hsl(var(--vp-text))]"
              >
                {cta?.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
