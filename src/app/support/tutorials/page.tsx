"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { 
  RocketIcon, 
  MonitorIcon, 
  PackageIcon, 
  FileTextIcon, 
  CreditCardIcon, 
  BanknoteIcon, 
  TruckIcon, 
  UsersIcon, 
  PercentIcon, 
  BarChart3Icon, 
  SettingsIcon,
  SearchIcon,
  BookOpenIcon,
  ChevronRightIcon
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

export default function TutorialsPage() {
  const { t, currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tutorialsStrings = useMemo(() => ({
    hero: {
      breadcrumbHome: t("hero.breadcrumbHome", "tutorialsPage"),
      breadcrumbTutorials: t("hero.breadcrumbTutorials", "tutorialsPage"),
      badge: t("hero.badge", "tutorialsPage"),
      title: t("hero.title", "tutorialsPage"),
      subtitle: t("hero.subtitle", "tutorialsPage"),
      searchPlaceholder: t("hero.searchPlaceholder", "tutorialsPage"),
    },
    noResults: {
      title: t("noResults.title", "tutorialsPage"),
      subtitle: t("noResults.subtitle", "tutorialsPage"),
    },
    cta: {
      title: t("cta.title", "tutorialsPage"),
      subtitle: t("cta.subtitle", "tutorialsPage"),
      button: t("cta.button", "tutorialsPage"),
    }
  }), [t, currentLanguage]);

  const categories = t("categories", "helpPage") as any;
  const items = categories?.items || [];

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (cat: any) =>
        cat.title.toLowerCase().includes(query) ||
        cat.desc.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  if (!mounted) return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))] pt-32 pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden mb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--vp-primary))]/5 via-transparent to-[hsl(var(--vp-accent))]/5" />
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[hsl(var(--vp-primary))]/5 blur-3xl -z-10" />
          
          <div className="relative max-w-7xl mx-auto px-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-[hsl(var(--vp-muted))] mb-8 font-medium">
              <Link href="/" className="hover:text-[hsl(var(--vp-primary))] transition-colors">{tutorialsStrings.hero.breadcrumbHome}</Link>
              <ChevronRightIcon className="w-3.5 h-3.5" />
              <span className="text-[hsl(var(--vp-text))]">{tutorialsStrings.hero.breadcrumbTutorials}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--vp-primary))]/10 border border-[hsl(var(--vp-primary))]/20 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--vp-primary))] mb-6 shadow-sm">
                <RocketIcon className="w-3.5 h-3.5" />
                {tutorialsStrings.hero.badge}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[hsl(var(--vp-text))] mb-6 tracking-tight leading-[1.1]">
                {tutorialsStrings.hero.title}
              </h1>
              <p className="text-xl text-[hsl(var(--vp-muted))] leading-relaxed mb-10 max-w-2xl font-medium">
                {tutorialsStrings.hero.subtitle}
              </p>

              {/* Search */}
              <div className="relative max-w-xl group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-[hsl(var(--vp-muted))] group-focus-within:text-[hsl(var(--vp-primary))] transition-colors">
                  <SearchIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={tutorialsStrings.hero.searchPlaceholder}
                  className="w-full h-16 pl-14 pr-6 bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-border))] rounded-2xl focus:border-[hsl(var(--vp-primary))] focus:ring-4 focus:ring-[hsl(var(--vp-primary)/0.1)] outline-none transition-all text-lg shadow-xl font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category: any, index: number) => (
              <Link
                key={category.id}
                href={`/support/tutorials/${category.id}`}
                className="group vp-card p-8 hover:border-[hsl(var(--vp-primary)/0.4)] hover:scale-[1.02] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 shadow-sm hover:shadow-xl"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[hsl(var(--vp-primary)/0.08)] border border-[hsl(var(--vp-primary)/0.15)] text-[hsl(var(--vp-primary))] transition-all group-hover:scale-110 group-hover:rotate-3 group-hover:bg-[hsl(var(--vp-primary))] group-hover:text-white">
                      <CategoryIcon name={category.icon} className="w-7 h-7" />
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-[hsl(var(--vp-border))] group-hover:text-[hsl(var(--vp-primary))] group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-xl font-black text-[hsl(var(--vp-text))] mb-3 group-hover:text-[hsl(var(--vp-primary))] transition-colors tracking-tight">
                    {category.title}
                  </h3>
                  <p className="text-[hsl(var(--vp-muted))] mb-8 leading-relaxed flex-grow font-medium">
                    {category.desc}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--vp-muted))] bg-[hsl(var(--vp-bg-soft))] w-fit px-3 py-1.5 rounded-lg border border-[hsl(var(--vp-border))]">
                    <BookOpenIcon className="w-4 h-4" />
                    <span className="uppercase tracking-widest text-[10px]">{category.count} {currentLanguage === "en" ? "articles" : "artículos"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-20 bg-[hsl(var(--vp-bg-soft))] rounded-[2.5rem] border border-dashed border-[hsl(var(--vp-border))]">
              <BookOpenIcon className="w-16 h-16 mx-auto mb-6 text-[hsl(var(--vp-muted))] opacity-20" />
              <h3 className="text-2xl font-black text-[hsl(var(--vp-text))] mb-3 tracking-tight">
                {tutorialsStrings.noResults.title}
              </h3>
              <p className="text-[hsl(var(--vp-muted))] font-medium text-lg">
                {tutorialsStrings.noResults.subtitle}
              </p>
            </div>
          )}

          {/* Support CTA */}
          <div className="mt-24 p-12 rounded-[3.5rem] bg-gradient-to-br from-[hsl(var(--vp-primary)/0.1)] via-[hsl(var(--vp-surface))] to-[hsl(var(--vp-accent)/0.05)] border border-[hsl(var(--vp-border))] relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--vp-primary))]/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--vp-accent))]/10 blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-white border border-[hsl(var(--vp-border))] shadow-xl flex items-center justify-center mb-8 rotate-3">
                <SettingsIcon className="w-10 h-10 text-[hsl(var(--vp-primary))]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[hsl(var(--vp-text))] mb-6 tracking-tight leading-tight">
                {tutorialsStrings.cta.title}
              </h2>
              <p className="text-[hsl(var(--vp-muted))] mb-10 max-w-2xl text-lg font-medium leading-relaxed">
                {tutorialsStrings.cta.subtitle}
              </p>
              <Link href="/contact" className="vp-button vp-button-primary h-16 px-12 text-xl font-black rounded-2xl shadow-xl hover:shadow-[hsl(var(--vp-primary)/0.4)] transition-all hover:scale-105">
                {tutorialsStrings.cta.button}
                <ChevronRightIcon className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
