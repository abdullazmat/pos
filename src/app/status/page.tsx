"use client";

import { useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { 
  CheckCircle2Icon, 
  ClockIcon, 
  ActivityIcon,
  ShieldCheckIcon,
  DatabaseIcon,
  GlobeIcon,
  CreditCardIcon,
  ServerIcon,
  ChevronRightIcon
} from "lucide-react";

type ComponentStatus = "operational" | "maintenance" | "partial" | "outage";

interface SystemComponent {
  id: string;
  name: string;
  status: ComponentStatus;
  uptime: number;
  history: number[]; // 0 to 100 representing health per day
}

export default function StatusPage() {
  const { currentLanguage, t } = useLanguage();
  
  // FIXED: Accessing translations through the correct namespace
  const statusStrings = useMemo(() => ({
    title: t("title", "statusPage"),
    subtitle: t("subtitle", "statusPage"),
    lastUpdate: t("lastUpdate", "statusPage"),
    uptime: t("uptime", "statusPage"),
    history: t("history", "statusPage"),
    noIncidents: t("noIncidents", "statusPage"),
    live: t("live", "statusPage"),
    ninetyDaysAgo: t("ninetyDaysAgo", "statusPage"),
    today: t("today", "statusPage"),
    summary: {
      operational: t("summary.operational", "statusPage"),
      maintenance: t("summary.maintenance", "statusPage"),
      partial: t("summary.partial", "statusPage"),
      outage: t("summary.outage", "statusPage"),
    },
    components: {
      api: t("components.api", "statusPage"),
      dashboard: t("components.dashboard", "statusPage"),
      pos: t("components.pos", "statusPage"),
      arca: t("components.arca", "statusPage"),
      database: t("components.database", "statusPage"),
    },
    cta: {
      title: t("cta.title", "statusPage"),
      description: t("cta.description", "statusPage"),
      button: t("cta.button", "statusPage"),
    }
  }), [t, currentLanguage]);

  const componentsStrings = statusStrings.components;
  const summaryStrings = statusStrings.summary;

  // Mock data for the status page
  const components: SystemComponent[] = useMemo(() => [
    {
      id: "api",
      name: componentsStrings.api,
      status: "operational",
      uptime: 99.98,
      history: Array.from({ length: 90 }, (_, i) => i === 45 ? 95 : 100)
    },
    {
      id: "dashboard",
      name: componentsStrings.dashboard,
      status: "operational",
      uptime: 99.99,
      history: Array.from({ length: 90 }, () => 100)
    },
    {
      id: "pos",
      name: componentsStrings.pos,
      status: "operational",
      uptime: 100,
      history: Array.from({ length: 90 }, () => 100)
    },
    {
      id: "arca",
      name: componentsStrings.arca,
      status: "operational",
      uptime: 99.95,
      history: Array.from({ length: 90 }, (_, i) => i === 20 || i === 21 ? 90 : i === 60 ? 98 : 100)
    },
    {
      id: "database",
      name: componentsStrings.database,
      status: "operational",
      uptime: 99.99,
      history: Array.from({ length: 90 }, () => 100)
    }
  ], [componentsStrings]);

  const lastUpdateDate = new Date().toLocaleTimeString(currentLanguage === 'es' ? 'es-AR' : currentLanguage === 'pt' ? 'pt-BR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))] pt-32 pb-24">
        
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[180px] opacity-10"
            style={{ background: "radial-gradient(circle, hsl(var(--vp-success)) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[180px] opacity-10"
            style={{ background: "radial-gradient(circle, hsl(var(--vp-primary)) 0%, transparent 70%)" }} />
        </div>

        <div className="max-w-5xl mx-auto px-6">
          
          {/* Hero Section */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-5xl sm:text-6xl font-black text-[hsl(var(--vp-text))] mb-6 tracking-tight">
              {statusStrings.title}
            </h1>
            <p className="text-xl text-[hsl(var(--vp-muted))] max-w-2xl mx-auto font-medium">
              {statusStrings.subtitle}
            </p>
          </div>

          {/* Overall Status Banner */}
          <div className="vp-card overflow-hidden mb-12 border-none bg-gradient-to-r from-[hsl(var(--vp-success)/0.2)] to-[hsl(var(--vp-success)/0.05)] p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
            <div className="bg-[hsl(var(--vp-surface))] rounded-[23px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[hsl(var(--vp-success))] rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-[hsl(var(--vp-success)/0.1)] border-4 border-[hsl(var(--vp-success)/0.2)] flex items-center justify-center">
                    <CheckCircle2Icon className="w-10 h-10 text-[hsl(var(--vp-success))]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[hsl(var(--vp-text))] mb-1">
                    {summaryStrings.operational}
                  </h2>
                  <p className="text-[hsl(var(--vp-muted))] font-medium flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4 text-[hsl(var(--vp-success))]" />
                    {statusStrings.lastUpdate}: {lastUpdateDate}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="px-6 py-3 rounded-2xl bg-[hsl(var(--vp-success)/0.1)] text-[hsl(var(--vp-success))] text-sm font-bold uppercase tracking-widest border border-[hsl(var(--vp-success)/0.1)]">
                  {statusStrings.live}
                </div>
              </div>
            </div>
          </div>

          {/* Components Grid */}
          <div className="space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            {components.map((component) => (
              <div key={component.id} className="vp-card group hover:scale-[1.01] transition-all duration-300">
                <div className="p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--vp-bg-soft))] border border-[hsl(var(--vp-border))] flex items-center justify-center group-hover:border-[hsl(var(--vp-primary)/0.3)] group-hover:bg-[hsl(var(--vp-primary)/0.05)] transition-colors">
                        {component.id === 'api' && <ServerIcon className="w-6 h-6 text-[hsl(var(--vp-primary))]" />}
                        {component.id === 'dashboard' && <GlobeIcon className="w-6 h-6 text-[hsl(var(--vp-primary))]" />}
                        {component.id === 'pos' && <CreditCardIcon className="w-6 h-6 text-[hsl(var(--vp-primary))]" />}
                        {component.id === 'arca' && <ShieldCheckIcon className="w-6 h-6 text-[hsl(var(--vp-primary))]" />}
                        {component.id === 'database' && <DatabaseIcon className="w-6 h-6 text-[hsl(var(--vp-primary))]" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[hsl(var(--vp-text))]">{component.name}</h3>
                        <p className="text-xs text-[hsl(var(--vp-muted))] font-bold uppercase tracking-wider">{component.uptime}% Uptime</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--vp-success)/0.05)] border border-[hsl(var(--vp-success)/0.1)]">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--vp-success))] shadow-[0_0_8px_hsl(var(--vp-success))]" />
                      <span className="text-xs font-bold text-[hsl(var(--vp-success))] uppercase tracking-widest">{summaryStrings.operational}</span>
                    </div>
                  </div>

                  {/* Uptime Visualization */}
                  <div className="relative">
                    <div className="flex gap-1 h-10 items-end">
                      {component.history.map((health, idx) => (
                        <div 
                          key={idx}
                          className={`flex-1 rounded-sm transition-all duration-300 cursor-help relative group/cell
                            ${health === 100 ? 'bg-[hsl(var(--vp-success)/0.4)] hover:bg-[hsl(var(--vp-success))] h-8' : 
                              health > 95 ? 'bg-[hsl(var(--vp-warning)/0.4)] hover:bg-[hsl(var(--vp-warning))] h-8' : 
                              'bg-[hsl(var(--vp-error)/0.4)] hover:bg-[hsl(var(--vp-error))] h-8'}
                          `}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1.5 bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-border))] rounded-lg text-[10px] font-bold text-[hsl(var(--vp-text))] opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                            {idx === 89 ? statusStrings.today : `${90 - idx} ${currentLanguage === 'en' ? 'days ago' : currentLanguage === 'pt' ? 'dias atrás' : 'días atrás'}`}: {health}%
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-[hsl(var(--vp-muted))] uppercase tracking-[2px] opacity-60">
                      <span>{statusStrings.ninetyDaysAgo}</span>
                      <div className="h-[1px] flex-1 mx-4 bg-[hsl(var(--vp-border))] self-center" />
                      <span>{component.uptime}% uptime</span>
                      <div className="h-[1px] flex-1 mx-4 bg-[hsl(var(--vp-border))] self-center" />
                      <span>{statusStrings.today}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Incident History */}
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <div className="flex items-center gap-3 mb-10">
              <ClockIcon className="w-6 h-6 text-[hsl(var(--vp-muted))]" />
              <h2 className="text-3xl font-black text-[hsl(var(--vp-text))] tracking-tight">
                {statusStrings.history}
              </h2>
            </div>
            
            <div className="vp-card p-12 text-center border-dashed">
              <div className="w-20 h-20 rounded-full bg-[hsl(var(--vp-bg-soft))] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2Icon className="w-10 h-10 text-[hsl(var(--vp-muted))] opacity-30" />
              </div>
              <h3 className="text-xl font-bold text-[hsl(var(--vp-text))] mb-2">{statusStrings.noIncidents}</h3>
              <p className="text-[hsl(var(--vp-muted))] font-medium">We maintain a public record of all performance and availability events.</p>
            </div>
          </div>

          {/* Support CTA */}
          <div className="mt-20 p-10 rounded-[2.5rem] bg-gradient-to-br from-[hsl(var(--vp-primary))] to-[hsl(var(--vp-accent))] text-white flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <h4 className="text-2xl font-black mb-2 tracking-tight">{statusStrings.cta.title}</h4>
              <p className="text-white/80 font-medium max-w-xl">{statusStrings.cta.description}</p>
            </div>
            <Link 
              href="/contact"
              className="relative z-10 h-14 px-10 rounded-2xl bg-white text-[hsl(var(--vp-primary))] font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {statusStrings.cta.button}
              <ChevronRightIcon className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
