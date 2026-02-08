"use client";

import { ChatBubbleIcon, PersonIcon, StarIcon } from "@radix-ui/react-icons";
import { useLanguage } from "@/lib/context/LanguageContext";

const SUPPORT_ICONS = [ChatBubbleIcon, PersonIcon, StarIcon];

export default function SupportSection() {
  const { t } = useLanguage();
  const content = t("supportSection", "landing") as {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Array<{ title: string; description: string }>;
  };

  return (
    <section className="vp-section vp-reveal bg-[hsl(var(--vp-bg-soft))]">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[hsl(var(--vp-muted))]">
              {content?.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold text-[hsl(var(--vp-text))] sm:text-4xl">
              {content?.title}
            </h2>
            <p className="text-base leading-relaxed text-[hsl(var(--vp-muted))]">
              {content?.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {content?.items?.map((item, index) => {
              const Icon = SUPPORT_ICONS[index] || ChatBubbleIcon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))]/80 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] text-[hsl(var(--vp-primary))]">
                    <Icon className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-[hsl(var(--vp-text))]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--vp-muted))]">
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
