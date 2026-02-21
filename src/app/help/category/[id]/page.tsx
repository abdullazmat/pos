"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { 
  ArrowLeftIcon, 
  ChevronRightIcon,
  SearchIcon,
  FileTextIcon,
  SparklesIcon,
  RocketIcon,
  MonitorIcon,
  PackageIcon,
  FileTextIcon as FileIcon,
  CreditCardIcon,
  BanknoteIcon,
  TruckIcon,
  UsersIcon,
  PercentIcon,
  BarChart3Icon,
  SettingsIcon,
  ClockIcon,
} from "lucide-react";

/* ─── Icon helper ─────────────────────────────────────────── */
function CategoryIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "getting-started": return <RocketIcon className={className} />;
    case "pos":             return <MonitorIcon className={className} />;
    case "inventory":       return <PackageIcon className={className} />;
    case "arca-invoicing": return <FileIcon className={className} />;
    case "subscriptions":   return <CreditCardIcon className={className} />;
    case "payment-orders": return <BanknoteIcon className={className} />;
    case "suppliers":      return <TruckIcon className={className} />;
    case "customers":      return <UsersIcon className={className} />;
    case "expenses":       return <PercentIcon className={className} />;
    case "fiscal-reports": return <BarChart3Icon className={className} />;
    case "initial-config": return <SettingsIcon className={className} />;
    default:                return <SparklesIcon className={className} />;
  }
}

export default function HelpCategoryPage() {
  const { id } = useParams();
  const { currentLanguage, t } = useLanguage();

  const categories = t("categories", "helpPage") as any;

  /* Find current category info */
  const categoryInfo = useMemo(() => {
    return categories?.items?.find((cat: any) => cat.id === id) || {
      title: id,
      desc: "Articles for " + id
    };
  }, [id, categories]);

  /* Articles for this category */
  const categoryArticles = useMemo(() => {
    const data: Record<string, any[]> = {
      es: [
        /* Getting Started */
        { id: "crear-cuenta", cat: "getting-started", title: "Crea tu cuenta de VentaPlus", time: "3 min", level: "Principiante" },
        { id: "primera-venta", cat: "getting-started", title: "Realiza tu primera venta", time: "5 min", level: "Principiante" },
        { id: "agregar-productos", cat: "getting-started", title: "Agrega tus primeros productos", time: "7 min", level: "Principiante" },
        { id: "invitar-equipo", cat: "getting-started", title: "Invita a los miembros de tu equipo", time: "4 min", level: "Principiante" },
        
        /* ARCA Invoicing */
        { id: "configurar-arca", cat: "arca-invoicing", title: "Configurar integración con ARCA/AFIP", time: "10 min", level: "Intermedio" },
        { id: "emitir-factura-a", cat: "arca-invoicing", title: "Emitir Factura A", time: "5 min", level: "Principiante" },
        { id: "emitir-factura-b", cat: "arca-invoicing", title: "Emitir Factura B", time: "5 min", level: "Principiante" },
        { id: "notas-credito", cat: "arca-invoicing", title: "Emitir Notas de Crédito", time: "6 min", level: "Intermedio" },

        /* Subscriptions */
        { id: "planes-vista", cat: "subscriptions", title: "Vista General de Planes", time: "4 min", level: "Principiante" },
        { id: "mejorar-plan", cat: "subscriptions", title: "Cómo mejorar tu Plan", time: "3 min", level: "Principiante" },
        { id: "historial-facturacion", cat: "subscriptions", title: "Historial de Facturación", time: "3 min", level: "Principiante" },
        { id: "cancelar-suscripcion", cat: "subscriptions", title: "Cancelar Suscripción", time: "4 min", level: "Principiante" },

        /* Customers */
        { id: "crear-cliente", cat: "customers", title: "Cómo crear un nuevo cliente", time: "2 min", level: "Principiante" },
        { id: "cuenta-corriente", cat: "customers", title: "Gestión de cuenta corriente", time: "8 min", level: "Intermedio" },
      ],
      en: [
        /* Getting Started */
        { id: "create-account", cat: "getting-started", title: "Create your VentaPlus account", time: "3 min", level: "Beginner" },
        { id: "first-sale", cat: "getting-started", title: "Make your first sale", time: "5 min", level: "Beginner" },
        { id: "add-products", cat: "getting-started", title: "Add your first products", time: "7 min", level: "Beginner" },
        { id: "invite-team", cat: "getting-started", title: "Invite your team members", time: "4 min", level: "Beginner" },

        /* ARCA Invoicing */
        { id: "setup-arca", cat: "arca-invoicing", title: "Set up ARCA/AFIP integration", time: "10 min", level: "Intermediate" },
        { id: "issue-factura-a", cat: "arca-invoicing", title: "Issue Factura A", time: "5 min", level: "Beginner" },
        { id: "issue-factura-b", cat: "arca-invoicing", title: "Issue Factura B", time: "5 min", level: "Beginner" },
        { id: "issue-credit-notes", cat: "arca-invoicing", title: "Issue Credit Notes", time: "6 min", level: "Intermediate" },

        /* Subscriptions */
        { id: "plans-overview", cat: "subscriptions", title: "Plans Overview", time: "4 min", level: "Beginner" },
        { id: "upgrade-plan", cat: "subscriptions", title: "Upgrade Your Plan", time: "3 min", level: "Beginner" },
        { id: "billing-history", cat: "subscriptions", title: "Billing History", time: "3 min", level: "Beginner" },
        { id: "cancel-subscription", cat: "subscriptions", title: "Cancel Subscription", time: "4 min", level: "Beginner" },
      ],
      pt: [
        /* Getting Started */
        { id: "criar-conta", cat: "getting-started", title: "Crie sua conta VentaPlus", time: "3 min", level: "Iniciante" },
        { id: "primeira-venda", cat: "getting-started", title: "Faça sua primeira venda", time: "5 min", level: "Iniciante" },
        { id: "adicionar-produtos", cat: "getting-started", title: "Adicione seus primeiros produtos", time: "7 min", level: "Iniciante" },
        { id: "convidar-equipe", cat: "getting-started", title: "Convide os membros da sua equipe", time: "4 min", level: "Iniciante" },

        /* ARCA Invoicing */
        { id: "config-arca", cat: "arca-invoicing", title: "Configurar integração ARCA/AFIP", time: "10 min", level: "Intermediário" },
        { id: "emitir-fatura-a", cat: "arca-invoicing", title: "Emitir Fatura A", time: "5 min", level: "Iniciante" },
        { id: "emitir-fatura-b", cat: "arca-invoicing", title: "Emitir Fatura B", time: "5 min", level: "Iniciante" },
      ]
    };
    const langData = data[currentLanguage as keyof typeof data] || data.es;
    return langData.filter(art => art.cat === id);
  }, [id, currentLanguage]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))] pt-32 pb-24">
        
        {/* Background Ambient Orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px]"
            style={{ background: "hsl(var(--vp-primary) / 0.05)" }} />
        </div>

        <div className="mx-auto max-w-5xl px-6">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-[hsl(var(--vp-muted))] mb-12">
            <Link href="/help" className="hover:text-[hsl(var(--vp-primary))] transition-colors">
              {currentLanguage === "pt" ? "Central de Ajuda" : currentLanguage === "en" ? "Help Center" : "Centro de Ayuda"}
            </Link>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-[hsl(var(--vp-text))] font-bold">{categoryInfo.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl border border-[hsl(var(--vp-primary)/0.2)] bg-[hsl(var(--vp-surface))]"
                style={{ color: "hsl(var(--vp-primary))" }}>
                <CategoryIcon name={id as string} className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-[hsl(var(--vp-text))] mb-2 leading-tight">
                  {categoryInfo.title}
                </h1>
                <p className="text-lg text-[hsl(var(--vp-muted))] max-w-2xl">
                  {categoryInfo.desc}
                </p>
                <p className="text-sm font-medium text-[hsl(var(--vp-primary))] mt-4">
                  {categoryArticles.length} {currentLanguage === "en" ? "articles" : "artículos"}
                </p>
              </div>
            </div>
            
            {/* Search within category */}
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--vp-muted))]" />
              <input 
                type="text" 
                placeholder={currentLanguage === "pt" ? "Buscar nesta categoria..." : currentLanguage === "en" ? "Search in this category..." : "Buscar en esta categoría..."}
                className="w-full h-12 pl-12 pr-4 bg-[hsl(var(--vp-bg-soft))] border border-[hsl(var(--vp-border))] rounded-xl focus:border-[hsl(var(--vp-primary))] focus:ring-4 focus:ring-[hsl(var(--vp-primary)/0.1)] outline-none transition-all" 
              />
            </div>
          </header>

          {/* Articles List */}
          <div className="space-y-4">
            {categoryArticles.length > 0 ? (
              categoryArticles.map((art, i) => (
                <Link 
                  key={art.id} 
                  href={`/help/article/${art.id}`}
                  className="vp-card p-6 flex flex-col sm:flex-row sm:items-center justify-between group hover:border-[hsl(var(--vp-primary)/0.5)] transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 gap-4"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-[hsl(var(--vp-bg-soft))] items-center justify-center text-[hsl(var(--vp-muted))] group-hover:text-[hsl(var(--vp-primary))] group-hover:bg-[hsl(var(--vp-primary)/0.1)] transition-all">
                      <FileTextIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-[hsl(var(--vp-text))] group-hover:translate-x-1 transition-transform">{art.title}</h3>
                        <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[hsl(var(--vp-accent)/0.1)] text-[hsl(var(--vp-accent))]">
                          {art.level}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(var(--vp-muted))]">
                        {currentLanguage === "en" ? "Detailed tutorial for " : "Tutorial detallado para "} {art.title.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="flex items-center gap-1.5 text-[hsl(var(--vp-muted))] text-sm">
                      <ClockIcon className="w-3.5 h-3.5" />
                      <span>{art.time}</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-[hsl(var(--vp-border))] group-hover:text-[hsl(var(--vp-primary))] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="vp-card p-20 text-center">
                <SparklesIcon className="w-12 h-12 mx-auto mb-6 text-[hsl(var(--vp-muted))]" />
                <h3 className="text-2xl font-bold text-[hsl(var(--vp-text))] mb-2">
                  {currentLanguage === "en" ? "Coming soon" : "Próximamente"}
                </h3>
                <p className="text-[hsl(var(--vp-muted))]">
                  {currentLanguage === "en" ? "We are working on articles for this category." : "Estamos trabajando en artículos para esta categoría."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <Link 
              href="/help"
              className="inline-flex items-center gap-2 text-[hsl(var(--vp-primary))] font-bold text-sm hover:underline"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {currentLanguage === "pt" ? "Ver todas as categorias" : currentLanguage === "en" ? "View all categories" : "Ver todas las categorías"}
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
