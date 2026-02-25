"use client";

import { useLanguage } from "@/lib/context/LanguageContext";
import { 
  CubeIcon, 
  LayersIcon, 
  SwitchIcon, 
  CheckCircledIcon,
  ExclamationTriangleIcon,
  RocketIcon
} from "@radix-ui/react-icons";

export default function ScenariosSection() {
  const { t } = useLanguage();
  const content = t("scenariosSection", "landing") as {
    title: string;
    subtitle: string;
    items: Array<{
      id: string;
      title: string;
      problemTitle: string;
      problemText: string;
      solutionTitle: string;
      solutionItems: string[];
      impactTitle: string;
      impactText: string;
    }>;
  };

  const getIcon = (id: string) => {
    switch (id) {
      case "scenario-1":
        return <CubeIcon className="w-8 h-8 text-[hsl(var(--vp-primary))]" />;
      case "scenario-2":
        return <LayersIcon className="w-8 h-8 text-[hsl(var(--vp-primary))]" />;
      case "scenario-3":
        return <SwitchIcon className="w-8 h-8 text-[hsl(var(--vp-primary))]" />;
      default:
        return <RocketIcon className="w-8 h-8 text-[hsl(var(--vp-primary))]" />;
    }
  };

  return (
    <section className="vp-section vp-reveal bg-[hsl(var(--vp-bg-section))] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(var(--vp-primary))]/5 rounded-full blur-[128px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(var(--vp-accent))]/5 rounded-full blur-[128px] translate-y-1/2" />

      <div className="relative px-6 mx-auto max-w-7xl">
        <div className="text-center mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--vp-primary))]/10 border border-[hsl(var(--vp-primary))]/20 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[hsl(var(--vp-primary))] mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--vp-primary))] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--vp-primary))]"></span>
            </span>
            Casos de Éxito
          </div>
          <h2 className="text-4xl font-bold text-[hsl(var(--vp-text))] sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
            {content?.title}
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-[hsl(var(--vp-muted))] max-w-2xl mx-auto leading-relaxed">
            {content?.subtitle}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {content?.items?.map((scenario, index) => (
            <div 
              key={scenario.id}
              className="group relative rounded-[2.5rem] border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] p-8 lg:p-10 shadow-sm transition-all duration-500 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden flex flex-col h-full"
              style={{ '--vp-reveal-delay': `${index * 150}ms` } as any}
            >
              {/* Background Glow */}
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-[hsl(var(--vp-primary))]/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative mb-8 flex items-center justify-between">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[hsl(var(--vp-primary))]/20 to-[hsl(var(--vp-primary))]/5 border border-[hsl(var(--vp-primary))]/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {getIcon(scenario.id)}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-[hsl(var(--vp-border))] to-transparent mx-4" />
                <span className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-[hsl(var(--vp-muted))] opacity-50">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 className="relative text-2xl lg:text-3xl font-bold text-[hsl(var(--vp-text))] mb-8 leading-tight tracking-tight">
                {scenario.title}
              </h3>

              <div className="space-y-8 flex-1">
                {/* Problem */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[hsl(var(--vp-error))] font-bold text-[0.7rem] uppercase tracking-[0.15em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--vp-error))]" />
                    {scenario.problemTitle}
                  </div>
                  <p className="text-[hsl(var(--vp-muted))] text-sm leading-relaxed font-medium">
                    {scenario.problemText}
                  </p>
                </div>

                {/* Solution */}
                <div className="space-y-5 pt-8 border-t border-[hsl(var(--vp-border-soft))]">
                  <div className="flex items-center gap-2 text-[hsl(var(--vp-primary))] font-bold text-[0.7rem] uppercase tracking-[0.15em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--vp-primary))]" />
                    {scenario.solutionTitle}
                  </div>
                  <ul className="space-y-4">
                    {scenario.solutionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3.5 text-sm text-[hsl(var(--vp-text))] group/item">
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))] group-hover/item:bg-[hsl(var(--vp-primary))] group-hover/item:text-white transition-colors duration-300">
                          <CheckCircledIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact */}
                <div className="pt-8 mt-auto">
                  <div className="rounded-2xl bg-[hsl(var(--vp-bg-section))] p-5 border border-[hsl(var(--vp-border-soft))] group-hover:bg-[hsl(var(--vp-primary))]/5 group-hover:border-[hsl(var(--vp-primary))]/10 transition-colors duration-500">
                    <div className="text-[hsl(var(--vp-primary))] font-bold text-[0.65rem] uppercase tracking-[0.2em] mb-2 opacity-80">
                      {scenario.impactTitle}
                    </div>
                    <p className="text-sm font-bold text-[hsl(var(--vp-text))] leading-relaxed">
                      {scenario.impactText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
