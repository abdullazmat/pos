"use client";

import { CheckIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useLanguage } from "@/lib/context/LanguageContext";

interface FeatureModuleProps {
  moduleKey: string;
  index: number;
}

export default function FeatureModule({ moduleKey, index }: FeatureModuleProps) {
  const { t } = useLanguage();
  const module = t("modules", "landing")?.[moduleKey] as {
    title: string;
    description: string;
    image?: string;
    features: string[];
  };

  if (!module) return null;

  const isEven = index % 2 === 0;

  const renderMockupContent = () => {
    switch(moduleKey) {
      case 'module1': // Sales/Supermarket
        return (
          <div className="flex flex-col h-full gap-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-[hsl(var(--vp-bg-soft))] rounded-lg"></div>
              <div className="h-6 w-16 bg-[hsl(var(--vp-primary))/0.1] rounded-lg"></div>
            </div>
            <div className="flex-1 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-center p-3 rounded-xl bg-[hsl(var(--vp-bg-soft))] border border-[hsl(var(--vp-border))/0.5]">
                  <div className="w-12 h-12 rounded-lg bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-border))]"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 bg-[hsl(var(--vp-muted))/0.1] rounded"></div>
                    <div className="h-2 w-1/3 bg-[hsl(var(--vp-muted))/0.05] rounded"></div>
                  </div>
                  <div className="h-4 w-12 bg-[hsl(var(--vp-muted))/0.1] rounded"></div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-[hsl(var(--vp-primary))] text-white flex justify-between items-center shadow-lg shadow-[hsl(var(--vp-primary))/0.2]">
              <span className="font-bold">TOTAL</span>
              <span className="text-xl font-mono">$ 14.250,00</span>
            </div>
          </div>
        );
      case 'module2': // Earnings/Real-time
        return (
          <div className="flex flex-col h-full gap-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[hsl(var(--vp-success))/0.05] border border-[hsl(var(--vp-success))/0.1]">
                   <div className="h-2 w-16 bg-[hsl(var(--vp-success))/0.2] rounded mb-2"></div>
                   <div className="h-5 w-20 bg-[hsl(var(--vp-success))/0.4] rounded"></div>
                </div>
                <div className="p-3 rounded-xl bg-[hsl(var(--vp-primary))/0.05] border border-[hsl(var(--vp-primary))/0.1]">
                   <div className="h-2 w-16 bg-[hsl(var(--vp-primary))/0.2] rounded mb-2"></div>
                   <div className="h-5 w-20 bg-[hsl(var(--vp-primary))/0.4] rounded"></div>
                </div>
             </div>
             <div className="flex-1 relative flex items-end gap-2 px-2">
                {[4, 7, 5, 8, 6, 9, 10, 8, 11].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-[hsl(var(--vp-primary))] to-[hsl(var(--vp-accent))] rounded-t-lg transition-all hover:opacity-80" style={{ height: `${h * 8}%` }}></div>
                ))}
             </div>
             <div className="h-10 w-full bg-[hsl(var(--vp-bg-soft))] rounded-xl flex items-center px-4 justify-between">
                <div className="h-2 w-24 bg-[hsl(var(--vp-muted))/0.1] rounded"></div>
                <div className="h-4 w-4 bg-[hsl(var(--vp-muted))/0.2] rounded-full"></div>
             </div>
          </div>
        );
      case 'module3': // Inventory/Suppliers
        return (
          <div className="flex flex-col h-full gap-4">
            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-[hsl(var(--vp-bg-soft))] rounded-lg"></div>
              <div className="h-8 w-8 bg-[hsl(var(--vp-primary))] rounded-lg"></div>
            </div>
            <div className="flex-1 border border-[hsl(var(--vp-border))/0.5] rounded-xl overflow-hidden">
               <div className="h-8 bg-[hsl(var(--vp-bg-soft))] border-b border-[hsl(var(--vp-border))/0.5] p-2 flex gap-2">
                  <div className="h-full w-1/4 bg-[hsl(var(--vp-muted))/0.1] rounded"></div>
                  <div className="h-full w-1/4 bg-[hsl(var(--vp-muted))/0.1] rounded"></div>
               </div>
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="h-10 border-b border-[hsl(var(--vp-border))/0.3] p-2 flex gap-4 items-center">
                    <div className="w-6 h-6 rounded bg-[hsl(var(--vp-bg-soft))]"></div>
                    <div className="h-2 flex-1 bg-[hsl(var(--vp-muted))/0.05] rounded"></div>
                    <div className="h-4 w-10 bg-[hsl(var(--vp-warning))/0.1] rounded-full"></div>
                 </div>
               ))}
            </div>
          </div>
        );
      case 'module4': // ARCA/Invoice
        return (
          <div className="flex flex-col h-full gap-4 p-2">
             <div className="flex justify-between items-start">
                <div className="space-y-2">
                   <div className="h-3 w-16 bg-[hsl(var(--vp-muted))/0.2] rounded"></div>
                   <div className="h-2 w-24 bg-[hsl(var(--vp-muted))/0.1] rounded"></div>
                </div>
                <div className="h-10 w-10 bg-[hsl(var(--vp-primary))/0.1] rounded-lg"></div>
             </div>
             <div className="mt-4 space-y-3">
                <div className="h-1 bg-[hsl(var(--vp-border))] w-full"></div>
                {[1, 2].map(i => (
                  <div key={i} className="flex justify-between">
                     <div className="h-2 w-32 bg-[hsl(var(--vp-bg-soft))] rounded"></div>
                     <div className="h-2 w-12 bg-[hsl(var(--vp-bg-soft))] rounded"></div>
                  </div>
                ))}
                <div className="h-1 bg-[hsl(var(--vp-border))] w-full mt-4"></div>
             </div>
             <div className="mt-auto flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-white border border-[hsl(var(--vp-border))] rounded-lg p-2 flex items-center justify-center">
                   {/* QR Code Sim */}
                   <div className="w-full h-full grid grid-cols-4 gap-1 opacity-20">
                      {[...Array(16)].map((_, i) => <div key={i} className="bg-black"></div>)}
                   </div>
                </div>
                <div className="h-2 w-32 bg-[hsl(var(--vp-success))/0.2] rounded"></div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="vp-reveal py-24 sm:py-40 overflow-hidden relative">
      {/* Background blobs for depth */}
      <div className={`absolute -z-10 top-1/2 -translate-y-1/2 ${isEven ? '-right-24' : '-left-24'} w-96 h-96 bg-[hsl(var(--vp-primary))/0.03] rounded-full blur-[120px]`} />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-center`}>
          <div className={`${!isEven ? 'lg:order-2' : ''} lg:col-span-2 space-y-10`}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--vp-primary))/0.1] border border-[hsl(var(--vp-primary))/0.2]">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--vp-primary))] animate-pulse" />
                <span className="text-[hsl(var(--vp-primary))] font-bold tracking-wider uppercase text-[10px]">
                  Modulo 0{index + 1}
                </span>
              </div>
              
              <h2 className="vp-section-title text-balance leading-tight">
                {module.title}
              </h2>
              
              <p className="vp-hero-subtitle text-lg leading-relaxed max-w-xl">
                {module.description}
              </p>
            </div>

            <ul className="grid sm:grid-cols-1 gap-5">
              {module.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-4 group p-1 -ml-1">
                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-border))] flex items-center justify-center shadow-sm group-hover:border-[hsl(var(--vp-primary))/0.5] transition-colors">
                    <CheckIcon className="w-3.5 h-3.5 text-[hsl(var(--vp-primary))]" />
                  </div>
                  <span className="text-[hsl(var(--vp-muted))] font-medium group-hover:text-[hsl(var(--vp-text))] transition-colors">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${!isEven ? 'lg:order-1' : ''} lg:col-span-3 relative w-full`}>
             <div className="vp-mockup-shell vp-float bg-white border border-[hsl(var(--vp-border))] rounded-[24px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
                {module.image ? (
                  <div className="p-3 sm:p-6 bg-white w-full h-full">
                    <img 
                      src={module.image} 
                      alt={module.title}
                      className="w-full h-auto block border border-[hsl(var(--vp-border))/0.3] rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video flex flex-col p-6 bg-[hsl(var(--vp-bg-card))]">
                    {renderMockupContent()}
                  </div>
                )}
             </div>
             
             {/* Glass Decorative Cards - Optimized for mobile */}
             <div className="absolute -top-4 -right-2 sm:-top-6 sm:-right-6 px-3 py-2 sm:px-4 sm:py-3 rounded-xl bg-[hsl(var(--vp-surface))/0.8] backdrop-blur-md border border-[hsl(var(--vp-border))] shadow-xl hidden xs:block vp-float-soft">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[hsl(var(--vp-success))/0.1] flex items-center justify-center">
                        <span className="text-[hsl(var(--vp-success))] text-[10px] sm:text-xs font-bold font-mono">100%</span>
                    </div>
                    <div className="h-1.5 w-12 sm:h-2 sm:w-16 bg-[hsl(var(--vp-bg-soft))] rounded-full"></div>
                </div>
             </div>
             
             <div className="absolute -bottom-6 -left-2 sm:-bottom-10 sm:-left-6 px-3 py-3 sm:px-4 sm:py-4 rounded-xl bg-[hsl(var(--vp-surface))/0.8] backdrop-blur-md border border-[hsl(var(--vp-border))] shadow-xl hidden xs:block vp-float-soft [animation-delay:2s]">
                <div className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="h-1.5 w-16 sm:h-2 sm:w-20 bg-[hsl(var(--vp-bg-soft))] rounded-full"></div>
                    <div className="h-2.5 w-10 sm:h-3 sm:w-12 bg-[hsl(var(--vp-primary))] rounded-full"></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
