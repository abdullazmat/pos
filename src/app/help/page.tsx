"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import {
  SearchIcon,
  RocketIcon,
  MonitorIcon,
  PackageIcon,
  FileTextIcon,
  CreditCardIcon,
  MessageSquareIcon,
  ArrowRightIcon,
  SparklesIcon,
  XIcon,
  FileIcon,
  BanknoteIcon,
  TruckIcon,
  UsersIcon,
  PercentIcon,
  BarChart3Icon,
  SettingsIcon,
  ChevronRightIcon,
  BookOpenIcon,
  CommandIcon,
} from "lucide-react";

/* ─── Icon helper ─────────────────────────────────────────── */
function CategoryIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "rocket":      return <RocketIcon className={className} />;
    case "monitor":     return <MonitorIcon className={className} />;
    case "package":     return <PackageIcon className={className} />;
    case "file-text":   return <FileTextIcon className={className} />;
    case "credit-card": return <CreditCardIcon className={className} />;
    case "banknote":    return <BanknoteIcon className={className} />;
    case "truck":       return <TruckIcon className={className} />;
    case "users":       return <UsersIcon className={className} />;
    case "percent":     return <PercentIcon className={className} />;
    case "bar-chart":   return <BarChart3Icon className={className} />;
    case "settings":    return <SettingsIcon className={className} />;
    default:            return <BookOpenIcon className={className} />;
  }
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function HelpPage() {
  const { t, currentLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hero       = useMemo(() => t("hero", "helpPage") as any, [t, currentLanguage]);
  const categories = useMemo(() => t("categories", "helpPage") as any, [t, currentLanguage]);
  const popular    = useMemo(() => t("popular", "helpPage") as any, [t, currentLanguage]);
  const cta        = useMemo(() => t("cta", "helpPage") as any, [t, currentLanguage]);

  /* state */
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  /* Article Data for search */
  const allArticles = useMemo(() => {
    const langs = {
      es: [
        { title: "Cómo configurar mi primer producto", category: "Primeros Passos", id: "configurar-producto" },
        { title: "Atajos de teclado en el POS", category: "Punto de Venta / Caja", id: "atajos-pos" },
        { title: "Conexión con ARCA (Paso a paso)", category: "Facturación ARCA", id: "conexion-arca" },
        { title: "Realizar un arqueo de caja", category: "Punto de Venta / Caja", id: "arqueo-caja" },
        { title: "Importar stock desde Excel", category: "Gestión de Inventario", id: "importar-excel" },
        { title: "Configurar impresora térmica", category: "Punto de Venta / Caja", id: "impresora-termica" },
        { title: "Vista General de Planes", category: "Suscripciones", id: "planes-vista" },
        { title: "Cómo mejorar tu Plan", category: "Suscripciones", id: "mejorar-plan" },
      ],
      en: [
        { title: "How to set up my first product", category: "Getting Started", id: "setup-product" },
        { title: "Keyboard shortcuts in the POS", category: "POS / Cash Register", id: "pos-shortcuts" },
        { title: "ARCA connection (Step by step)", category: "ARCA Invoicing", id: "arca-connection" },
        { title: "Performing a cash out", category: "POS / Cash Register", id: "cash-out" },
        { title: "Importing stock from Excel", category: "Inventory Management", id: "import-excel" },
        { title: "Plans Overview", category: "Subscriptions", id: "plans-overview" },
        { title: "Upgrade Your Plan", category: "Subscriptions", id: "upgrade-plan" },
      ],
      pt: [
        { title: "Como configurar meu primeiro produto", category: "Primeiros Passos", id: "configurar-produto" },
        { title: "Atalhos de teclado no POS", category: "Ponto de Venda / Caixa", id: "atalhos-pos" },
        { title: "Conexão com ARCA (Passo a passo)", category: "Faturamento ARCA", id: "conexao-arca" },
        { title: "Realizar um fechamento de caixa", category: "Ponto de Venda / Caixa", id: "fechamento-caixa" },
        { title: "Importar estoque do Excel", category: "Gestão de Estoque", id: "importar-excel" },
        { title: "Visão Geral dos Planos", category: "Assinaturas", id: "visao-planos" },
        { title: "Como melhorar seu Plano", category: "Assinaturas", id: "melhorar-plano" },
      ]
    };
    return langs[currentLanguage as keyof typeof langs] || langs.es;
  }, [currentLanguage]);

  const filteredArticles = useMemo(() => {
    if (!search.trim()) return [];
    const query = search.toLowerCase();
    return allArticles.filter(art => 
      art.title.toLowerCase().includes(query) || 
      art.category.toLowerCase().includes(query)
    );
  }, [search, allArticles]);

  /* scroll-reveal */
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted, currentLanguage]);

  if (!mounted) return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))]">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden border-b border-[hsl(var(--vp-border))]">
          {/* background orbs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-15%] left-[-5%] w-[60%] h-[60%] rounded-full blur-[140px]"
              style={{ background: "hsl(var(--vp-primary) / 0.1)" }} />
            <div className="absolute bottom-[-20%] right-[-5%] w-[55%] h-[55%] rounded-full blur-[140px]"
              style={{ background: "hsl(var(--vp-accent) / 0.08)" }} />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center vp-reveal">
            <h1 className="text-5xl sm:text-7xl font-black text-balance mb-6 max-w-4xl mx-auto tracking-tight leading-[1.05] text-[hsl(var(--vp-text))]">
              {hero?.title}
            </h1>
            <p className="text-xl max-w-2xl mx-auto text-balance mb-12 font-medium text-[hsl(var(--vp-muted))] leading-relaxed">
              {hero?.subtitle}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group z-50 shadow-2xl rounded-3xl overflow-visible">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-[hsl(var(--vp-muted))] transition-colors group-focus-within:text-[hsl(var(--vp-primary))]">
                <SearchIcon className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={hero?.searchPlaceholder}
                className="w-full h-20 pl-16 pr-20 rounded-[1.25rem] bg-[hsl(var(--vp-surface))] border-2 border-[hsl(var(--vp-border))] focus:outline-none focus:ring-8 focus:ring-[hsl(var(--vp-primary)/0.08)] focus:border-[hsl(var(--vp-primary))] transition-all text-xl font-bold placeholder:font-medium shadow-inner"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-20 inset-y-0 flex items-center text-[hsl(var(--vp-muted))] hover:text-[hsl(var(--vp-text))] transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              )}
              <div className="absolute right-6 inset-y-0 flex items-center">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-[10px] font-black text-[hsl(var(--vp-muted))] uppercase tracking-widest shadow-sm">
                  <CommandIcon className="w-3 h-3" /> K
                </div>
              </div>

              {/* Search Results Dropdown */}
              {isSearchFocused && search.trim() !== "" && (
                <>
                  <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setIsSearchFocused(false)} 
                  />
                  <div className="absolute top-full left-0 right-0 mt-4 p-3 bg-[hsl(var(--vp-surface))] border-2 border-[hsl(var(--vp-border))] rounded-[2rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-3 mb-2 border-b border-[hsl(var(--vp-border))/0.5]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))] text-left ml-2">Resultados para &quot;{search}&quot;</p>
                    </div>
                    {filteredArticles.length > 0 ? (
                      <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-1">
                        {filteredArticles.map((art: any) => (
                          <Link 
                            key={art.id}
                            href={`/help/article/${art.id}`}
                            className="flex items-center gap-5 p-5 rounded-2xl hover:bg-[hsl(var(--vp-primary)/0.05)] hover:border-[hsl(var(--vp-primary)/0.1)] border border-transparent transition-all text-left group mb-1 last:mb-0"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--vp-primary)/0.1)] flex items-center justify-center text-[hsl(var(--vp-primary))] group-hover:bg-[hsl(var(--vp-primary))] group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                              <FileIcon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-lg text-[hsl(var(--vp-text))] line-clamp-1 leading-tight tracking-tight">{art.title}</p>
                              <p className="text-xs text-[hsl(var(--vp-muted))] font-bold uppercase tracking-widest mt-1">{art.category}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-[hsl(var(--vp-muted))]">
                        <RocketIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="font-bold text-lg">{currentLanguage === "pt" ? "Nenhum resultado encontrado" : currentLanguage === "en" ? "No results found" : "No se encontraron resultados"}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Categories ───────────────────────────────────── */}
        <section className="py-24 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="vp-reveal mb-16 flex flex-col items-center text-center">
            <h2 className="text-4xl sm:text-5xl font-black text-[hsl(var(--vp-text))] mb-6 tracking-tight leading-tight">{categories?.title}</h2>
            <p className="text-lg text-[hsl(var(--vp-muted))] font-medium max-w-2xl">
                {currentLanguage === "en" ? "Browse our comprehensive guides by topic to master every feature of VentaPlus." : currentLanguage === "pt" ? "Navegue pelos nossos guias abrangentes por tópico para dominar cada recurso do VentaPlus." : "Navegá por nuestras guías completas por tema para dominar cada funcionalidad de VentaPlus."}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(categories?.items) && categories.items.map((cat: any, i: number) => (
              <Link 
                key={cat.id} 
                href={`/help/category/${cat.id}`}
                className="vp-card p-10 group hover:border-[hsl(var(--vp-primary)/0.4)] hover:scale-[1.03] transition-all duration-500 vp-reveal flex flex-col items-start bg-[hsl(var(--vp-bg-card)/0.5)] shadow-sm hover:shadow-2xl border-[hsl(var(--vp-border))]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-full flex items-start justify-between mb-8">
                  <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-border))]"
                    style={{ 
                      color: "hsl(var(--vp-primary))" 
                    }}>
                    <CategoryIcon name={cat.icon} className="w-8 h-8" />
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-[hsl(var(--vp-primary))] group-hover:text-white transition-all bg-[hsl(var(--vp-bg-soft))] text-[hsl(var(--vp-muted))]">
                    <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-black mb-4 text-[hsl(var(--vp-text))] group-hover:text-[hsl(var(--vp-primary))] transition-colors tracking-tight">{cat.title}</h3>
                <p className="text-[hsl(var(--vp-muted))] leading-relaxed font-semibold text-base mb-10 flex-grow">
                  {cat.desc}
                </p>
                
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[hsl(var(--vp-bg-soft))] border border-[hsl(var(--vp-border))] text-[hsl(var(--vp-muted))] font-black text-[10px] uppercase tracking-widest shadow-inner group-hover:bg-[hsl(var(--vp-primary)/0.05)] group-hover:text-[hsl(var(--vp-primary))] transition-all">
                  <BookOpenIcon className="w-4 h-4" />
                  <span>{cat.count} {currentLanguage === "en" ? "articles" : "artículos"}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Popular Articles ──────────────────────────────── */}
        <section className="py-32 border-t border-[hsl(var(--vp-border))] bg-gradient-to-b from-[hsl(var(--vp-bg-soft)/0.2)] to-transparent relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-16 items-start">
              
              <div className="lg:col-span-3 space-y-10 vp-reveal">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-accent)/0.2)] flex items-center justify-center text-[hsl(var(--vp-accent))] shadow-xl rotate-3">
                    <SparklesIcon className="w-7 h-7" />
                  </div>
                  <h2 className="text-3xl font-black text-[hsl(var(--vp-text))] tracking-tight">{popular?.title}</h2>
                </div>

                <div className="space-y-4">
                  {Array.isArray(popular?.items) && popular.items.map((item: any, i: number) => {
                    const mapping: Record<string, string> = {
                      "Cómo configurar mi primer producto": "configurar-producto",
                      "How to set up my first product": "setup-product",
                      "Como configurar meu primeiro produto": "configurar-producto",
                      "Atajos de teclado en el POS": "atajos-pos",
                      "Keyboard shortcuts in the POS": "pos-shortcuts",
                      "Atalhos de teclado no POS": "atalhos-pos",
                      "Conexión con ARCA (Paso a paso)": "conexion-arca",
                      "ARCA connection (Step by step)": "arca-connection",
                      "Conexão com ARCA (Passo a passo)": "conexao-arca",
                      "Realizar un arqueo de caja": "arqueo-caja",
                      "Performing a cash out": "cash-out",
                      "Realizar um fechamento de caixa": "fechamento-caixa",
                      "Importar stock desde Excel": "importar-excel",
                      "Importing stock from Excel": "import-excel",
                    };
                    const articleId = mapping[item.title] || "configurar-producto";

                    return (
                      <Link 
                        key={i} 
                        href={`/help/article/${articleId}`}
                        className="flex items-center justify-between p-7 rounded-2xl border-2 border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] group hover:border-[hsl(var(--vp-primary))] hover:shadow-2xl hover:scale-[1.01] transition-all duration-400"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--vp-primary)/0.3)] group-hover:bg-[hsl(var(--vp-primary))] group-hover:scale-150 transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0)] group-hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                          <span className="font-black text-xl text-[hsl(var(--vp-text))] group-hover:text-[hsl(var(--vp-primary))] transition-colors tracking-tight leading-tight">{item.title}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[hsl(var(--vp-bg-soft))] group-hover:bg-[hsl(var(--vp-primary))] group-hover:text-white transition-all shadow-inner">
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* ── Contact CTA ───────────────────────────────── */}
              <div className="lg:col-span-2 vp-reveal" style={{ animationDelay: "200ms" }}>
                <div className="vp-card p-12 relative overflow-hidden shadow-[0_40px_100px_-30px_rgba(var(--vp-primary-rgb),0.15)] rounded-[3rem] border border-[hsl(var(--vp-border))]"
                  style={{ 
                    background: "linear-gradient(135deg, hsl(var(--vp-primary) / 0.12), hsl(var(--vp-surface)), hsl(var(--vp-accent) / 0.08))"
                  }}>
                  <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[hsl(var(--vp-primary))]/10 blur-[100px] pointer-events-none" />
                  
                  <div className="relative z-10 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl mx-auto mb-10 flex items-center justify-center bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-border))] shadow-2xl rotate-6 group-hover:rotate-0 transition-transform duration-500">
                      <MessageSquareIcon className="w-10 h-10" style={{ color: "hsl(var(--vp-primary))" }} />
                    </div>
                    <h3 className="text-3xl font-black mb-6 tracking-tight leading-tight text-[hsl(var(--vp-text))]">{cta?.title}</h3>
                    <p className="text-lg text-[hsl(var(--vp-muted))] mb-12 leading-relaxed font-medium">
                      {cta?.subtitle}
                    </p>
                    <Link 
                      href="/contact"
                      className="vp-button vp-button-primary w-full h-16 text-xl font-black rounded-2xl shadow-xl hover:shadow-[hsl(var(--vp-primary)/0.4)] hover:scale-105 transition-all"
                    >
                      {cta?.button}
                      <ArrowRightIcon className="w-6 h-6 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
