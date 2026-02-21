"use client";

import { useMemo, useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { 
  ShieldCheckIcon, 
  LockIcon, 
  CloudIcon, 
  DatabaseIcon, 
  KeyIcon, 
  ClockIcon,
  FileTextIcon,
  ShieldIcon,
  CheckCircle2Icon,
  CheckIcon
} from "lucide-react";

export default function SecurityPage() {
  const { currentLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Using a more direct approach to translations to avoid any memoization issues
  const badgeText = t("hero.badge", "securityPage");
  const titleText = t("hero.title", "securityPage");
  const descText = t("hero.description", "securityPage");

  const encryptionTitle = t("features.encryption.title", "securityPage");
  const encryptionDesc = t("features.encryption.description", "securityPage");
  
  const authTitle = t("features.auth.title", "securityPage");
  const authDesc = t("features.auth.description", "securityPage");
  
  const infraTitle = t("features.infrastructure.title", "securityPage");
  const infraDesc = t("features.infrastructure.description", "securityPage");
  
  const backupsTitle = t("features.backups.title", "securityPage");
  const backupsDesc = t("features.backups.description", "securityPage");
  
  const accessTitle = t("features.access.title", "securityPage");
  const accessDesc = t("features.access.description", "securityPage");
  
  const auditTitle = t("features.audit.title", "securityPage");
  const auditDesc = t("features.audit.description", "securityPage");

  const complianceTitle = t("compliance.title", "securityPage");
  const complianceDesc = t("compliance.description", "securityPage");
  const arcaTitle = t("compliance.arcaTitle", "securityPage");
  const arcaDesc = t("compliance.arcaDesc", "securityPage");
  const pdTitle = t("compliance.pdTitle", "securityPage");
  const pdDesc = t("compliance.pdDesc", "securityPage");

  const securityFeatures = [
    {
      icon: <LockIcon className="w-7 h-7" />,
      title: encryptionTitle,
      description: encryptionDesc,
    },
    {
      icon: <ShieldCheckIcon className="w-7 h-7" />,
      title: authTitle,
      description: authDesc,
    },
    {
      icon: <CloudIcon className="w-7 h-7" />,
      title: infraTitle,
      description: infraDesc,
    },
    {
      icon: <DatabaseIcon className="w-7 h-7" />,
      title: backupsTitle,
      description: backupsDesc,
    },
    {
      icon: <KeyIcon className="w-7 h-7" />,
      title: accessTitle,
      description: accessDesc,
    },
    {
      icon: <ClockIcon className="w-7 h-7" />,
      title: auditTitle,
      description: auditDesc,
    },
  ];

  if (!mounted) return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))] pt-32 pb-24">
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[180px] opacity-10"
            style={{ background: "radial-gradient(circle, hsl(var(--vp-success)) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[180px] opacity-5"
            style={{ background: "radial-gradient(circle, hsl(var(--vp-primary)) 0%, transparent 70%)" }} />
        </div>

        {/* Hero Section */}
        <section className="relative px-6 mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--vp-success)/0.1)] text-[hsl(var(--vp-success))] text-[10px] font-black uppercase tracking-widest mb-8 border border-[hsl(var(--vp-success)/0.15)] shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              {badgeText}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[hsl(var(--vp-text))] mb-8 leading-[1.1] tracking-tight">
              {titleText}
            </h1>
            <p className="text-xl text-[hsl(var(--vp-muted))] max-w-2xl mx-auto leading-relaxed font-medium">
              {descText}
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="vp-card p-8 group hover:scale-[1.02] transition-all duration-300 border-[hsl(var(--vp-border))] hover:border-[hsl(var(--vp-success)/0.3)] bg-gradient-to-br from-transparent to-[hsl(var(--vp-bg-soft)/0.2)]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[hsl(var(--vp-success))]/10 text-[hsl(var(--vp-success))] mb-6 group-hover:bg-[hsl(var(--vp-success))] group-hover:text-white group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-[hsl(var(--vp-text))] mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-[hsl(var(--vp-muted))] leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Section */}
        <section className="px-6 animate-in fade-in duration-1000 delay-300">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-black text-[hsl(var(--vp-text))] mb-4 tracking-tight">
              {complianceTitle}
            </h2>
            <p className="text-lg text-[hsl(var(--vp-muted))] font-medium">
              {complianceDesc}
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8">
            <div className="vp-card p-10 bg-gradient-to-br from-[hsl(var(--vp-primary)/0.03)] to-transparent border-[hsl(var(--vp-primary)/0.15)] hover:border-[hsl(var(--vp-primary)/0.3)] transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))] mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <FileTextIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-[hsl(var(--vp-text))] mb-3 tracking-tight">
                {arcaTitle}
              </h3>
              <p className="text-[hsl(var(--vp-muted))] font-medium leading-relaxed">
                {arcaDesc}
              </p>
              <div className="mt-8 flex items-center gap-2 text-[hsl(var(--vp-success))] font-bold text-xs uppercase tracking-widest">
                <CheckCircle2Icon className="w-4 h-4" />
                Verified Compliance
              </div>
            </div>

            <div className="vp-card p-10 bg-gradient-to-br from-[hsl(var(--vp-primary)/0.03)] to-transparent border-[hsl(var(--vp-primary)/0.15)] hover:border-[hsl(var(--vp-primary)/0.3)] transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))] mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <ShieldIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-[hsl(var(--vp-text))] mb-3 tracking-tight">
                {pdTitle}
              </h3>
              <p className="text-[hsl(var(--vp-muted))] font-medium leading-relaxed">
                {pdDesc}
              </p>
              <div className="mt-8 flex items-center gap-2 text-[hsl(var(--vp-success))] font-bold text-xs uppercase tracking-widest">
                <CheckCircle2Icon className="w-4 h-4" />
                DNPDP Compliant
              </div>
            </div>
          </div>
        </section>

        {/* Security Certificate / Badge Footer */}
        <section className="mt-32 max-w-5xl mx-auto px-6 text-center">
          <div className="p-12 rounded-[3rem] bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-border))] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--vp-success)/0.03)] to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[hsl(var(--vp-success)/0.1)] flex items-center justify-center mb-8 border border-[hsl(var(--vp-success)/0.2)]">
                <CheckIcon className="w-10 h-10 text-[hsl(var(--vp-success))]" />
              </div>
              <h4 className="text-2xl font-black text-[hsl(var(--vp-text))] mb-4">Certificado de Seguridad VentaPlus</h4>
              <p className="text-[hsl(var(--vp-muted))] max-w-2xl mx-auto font-medium leading-relaxed mb-0">
                Auditamos continuamente nuestros procesos para garantizar el cumplimiento de los estándares de seguridad más exigentes. Tu tranquilidad es nuestra responsabilidad técnica.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
