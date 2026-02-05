import { useLanguage } from "@/lib/context/LanguageContext";

export default function HowItWorksSection() {
  const { t } = useLanguage();
  const content = t("howItWorks", "landing") as {
    badge: string;
    title: string;
    subtitle: string;
    steps: Array<{ title: string; description: string }>;
  };

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden vp-section vp-reveal"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[hsl(var(--vp-bg))]" />
        <div className="absolute inset-y-0 left-0 w-full bg-[hsl(var(--vp-bg-soft))]/40" />
        <div className="absolute -top-24 left-[-5%] h-72 w-72 rounded-full bg-[hsl(var(--vp-primary))]/12 blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-10%] h-96 w-96 rounded-full bg-[hsl(var(--vp-primary))]/8 blur-[140px]" />
      </div>

      <div className="px-4 mx-auto max-w-7xl sm:px-6">
        <div className="rounded-3xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))]/70 px-5 sm:px-6 py-12 sm:py-14 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.8)] backdrop-blur">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))]">
              {content?.badge}
            </span>
            <h2 className="mt-5 vp-section-title">{content?.title}</h2>
            <p className="text-lg vp-section-subtitle">{content?.subtitle}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 sm:gap-6">
            {content?.steps?.map((step, index) => (
              <div key={step.title} className="relative group">
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[hsl(var(--vp-primary))]/25 via-transparent to-[hsl(var(--vp-primary))]/10 opacity-0 blur transition duration-300 group-hover:opacity-100" />
                <div className="relative h-full rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))]/85 p-6 sm:p-7 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.6)] backdrop-blur-sm transition duration-300 group-hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--vp-primary))]/15 text-[hsl(var(--vp-primary))] text-base font-semibold">
                      0{index + 1}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-[hsl(var(--vp-primary))]/40 to-transparent" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[hsl(var(--vp-text))]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[hsl(var(--vp-muted))] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
