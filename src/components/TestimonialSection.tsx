"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useLanguage } from "@/lib/context/LanguageContext";

const TESTIMONIAL_IMAGES: Record<string, string> = {
  darjeeling: "/test-1.jpg",
  "panaderia-central": "/test-2.jpg",
  "almacen-norte": "/test-3.png",
};

export default function TestimonialSection() {
  const { t } = useLanguage();
  const content = t("testimonialsSection", "landing") as {
    eyebrow: string;
    title: string;
    subtitle: string;
    metricCaption: string;
    highlightLabel: string;
    highlightCaption: string;
    controls: {
      previous: string;
      next: string;
      dotPrefix: string;
    };
    items: Array<{
      id: string;
      quote: string;
      name: string;
      role: string;
      location: string;
      metricLabel: string;
      metricValue: string;
      highlight: string;
    }>;
  };

  const testimonials = (content?.items ?? []).map((item) => ({
    ...item,
    image: TESTIMONIAL_IMAGES[item.id] ?? "/test-1.jpg",
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = testimonials.length;
  const active = testimonials[activeIndex];

  useEffect(() => {
    if (paused || total === 0) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 8000);

    return () => window.clearInterval(timer);
  }, [paused, total]);

  const handlePrev = () => {
    if (!total) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    if (!total) return;
    setActiveIndex((prev) => (prev + 1) % total);
  };

  return (
    <section className="vp-section vp-reveal">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[hsl(var(--vp-muted))]">
            {content?.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-[hsl(var(--vp-text))] sm:text-4xl">
            {content?.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[hsl(var(--vp-muted))]">
            {content?.subtitle}
          </p>
        </div>

        <div
          className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="space-y-6">
            {active ? (
              <div
                key={active.id}
                className="rounded-3xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] p-8 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.45)] vp-slide-up"
              >
                <p className="text-lg leading-relaxed text-[hsl(var(--vp-text))] italic">
                  “{active.quote}”
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--vp-primary))]/10 text-sm font-semibold text-[hsl(var(--vp-primary))]">
                    {active.name
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[hsl(var(--vp-text))]">
                      {active.name}
                    </p>
                    <p className="text-sm text-[hsl(var(--vp-muted))]">
                      {active.role} · {active.location}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {active ? (
                <>
                  <div className="rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))]">
                      {active.metricLabel}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[hsl(var(--vp-primary))]">
                      {active.metricValue}
                    </p>
                    <p className="mt-2 text-sm text-[hsl(var(--vp-muted))]">
                      {content?.metricCaption}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))]">
                      {content?.highlightLabel}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-[hsl(var(--vp-text))]">
                      {active.highlight}
                    </p>
                    <p className="mt-2 text-sm text-[hsl(var(--vp-muted))]">
                      {content?.highlightCaption}
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="vp-micro flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))] text-[hsl(var(--vp-text))]"
                  aria-label={content?.controls?.previous}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="vp-micro flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))] text-[hsl(var(--vp-text))]"
                  aria-label={content?.controls?.next}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {testimonials.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      index === activeIndex
                        ? "bg-[hsl(var(--vp-primary))]"
                        : "bg-[hsl(var(--vp-border))]"
                    }`}
                    aria-label={`${content?.controls?.dotPrefix} ${item.name}`}
                  />
                ))}
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-[hsl(var(--vp-muted))]">
                {activeIndex + 1} / {total}
              </p>
            </div>
          </div>

          {active ? (
            <div key={`${active.id}-image`} className="vp-slide-up">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))]">
                <Image
                  src={active.image}
                  alt={`${active.name}, ${active.role}`}
                  fill
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="h-full w-full object-contain object-center p-4"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--vp-primary))]/10 via-transparent to-transparent" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
