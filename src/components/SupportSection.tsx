"use client";

import { useLanguage } from "@/lib/context/LanguageContext";
import { MessageSquareIcon, HeadsetIcon, StarIcon, CheckCircle2Icon } from "lucide-react";

const SUPPORT_ICONS = [MessageSquareIcon, HeadsetIcon, StarIcon];

export default function SupportSection() {
  const { t } = useLanguage();
  const content = t("supportSection", "landing") as {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Array<{ title: string; description: string }>;
  };

  return (
    <section className="py-24 sm:py-32 vp-reveal bg-gradient-to-b from-[hsl(var(--vp-bg-soft))] to-[hsl(var(--vp-bg-page))] border-y border-[hsl(var(--vp-border))] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
          <HeadsetIcon className="w-80 h-80" />
      </div>

      <div className="px-6 mx-auto max-w-7xl relative z-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--vp-primary))/0.1] border border-[hsl(var(--vp-primary))/0.2] shadow-sm">
                <CheckCircle2Icon className="w-3.5 h-3.5 text-[hsl(var(--vp-primary))]" />
                <span className="text-[hsl(var(--vp-primary))] font-black tracking-[0.2em] uppercase text-[10px]">
                {content?.eyebrow}
                </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-[hsl(var(--vp-text))] tracking-tight leading-tight">
              {content?.title}
            </h2>
            <p className="text-xl leading-relaxed text-[hsl(var(--vp-muted))] font-medium">
              {content?.subtitle}
            </p>
          </div>

          <div className="grid gap-6">
            {content?.items?.map((item, index) => {
              const Icon = SUPPORT_ICONS[index] || MessageSquareIcon;
              return (
                <div
                  key={index}
                  className="flex gap-6 rounded-[2rem] border-2 border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))] p-8 shadow-xl hover:shadow-2xl hover:border-[hsl(var(--vp-primary)/0.3)] transition-all duration-300 group hover:scale-[1.02]"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--vp-primary))/0.1] text-[hsl(var(--vp-primary))] border border-[hsl(var(--vp-primary))/0.15] group-hover:bg-[hsl(var(--vp-primary))] group-hover:text-white group-hover:rotate-6 transition-all duration-300 shadow-sm">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[hsl(var(--vp-text))] mb-2 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-base leading-relaxed text-[hsl(var(--vp-muted))] font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
