"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { 
  BookIcon, 
  LockIcon, 
  DatabaseIcon, 
  TerminalIcon, 
  GlobeIcon, 
  Code2Icon,
  ChevronRightIcon,
  CpuIcon,
  SearchIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  ActivityIcon,
  ZapIcon,
  ShieldCheckIcon,
  LayersIcon
} from "lucide-react";

type DocSection = "intro" | "auth" | "architecture" | "products" | "sales" | "webhooks" | "security";

export default function DocumentationPage() {
  const { currentLanguage, t } = useLanguage();
  const [activeSection, setActiveSection] = useState<DocSection>("intro");
  const [copied, setCopied] = useState(false);

  // FIXED: Accessing translations through the correct namespace
  const sidebar = useMemo(() => t("sidebar", "documentationPage") || {}, [t, currentLanguage]);
  const hero = useMemo(() => t("hero", "documentationPage") || {}, [t, currentLanguage]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sectionsContent = useMemo(() => {
    const data: Record<string, Record<DocSection, any>> = {
      es: {
        intro: {
          title: "Bienvenido a la Documentación de VentaPlus",
          content: `
            <p className="text-xl">Nuestra API REST permite a los desarrolladores acceder a los datos de sus negocios de forma segura y eficiente. VentaPlus está diseñado para ser la base tecnológica de tu comercio, permitiendo integraciones fluidas con cualquier plataforma de terceros.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
              <div className="vp-card p-6 bg-[hsl(var(--vp-primary)/0.03)] border-[hsl(var(--vp-primary)/0.1)]">
                <h4 className="flex items-center gap-2 font-bold mb-3 text-[hsl(var(--vp-primary))]"><ZapIcon className="w-4 h-4"/> Rápido y Moderno</h4>
                <p className="text-sm">API basada en REST con respuestas JSON ultra-rápidas optimizadas para el mercado argentino.</p>
              </div>
              <div className="vp-card p-6 bg-[hsl(var(--vp-success)/0.03)] border-[hsl(var(--vp-success)/0.1)]">
                <h4 className="flex items-center gap-2 font-bold mb-3 text-[hsl(var(--vp-success))]"><ShieldCheckIcon className="w-4 h-4"/> Seguro por Diseño</h4>
                <p className="text-sm">Autenticación robusta y cifrado de grado bancario para proteger la información de tus clientes.</p>
              </div>
            </div>

            <h3>Capacidades Principales</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--vp-primary)/0.1)] flex items-center justify-center shrink-0 mt-1"><ChevronRightIcon className="w-3 h-3 text-[hsl(var(--vp-primary))]"/></div>
                <span><strong>Sincronización de Stock:</strong> Mantén tu inventario coordinado entre tu tienda física y plataformas como Shopify, WooCommerce o TiendaNube.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--vp-primary)/0.1)] flex items-center justify-center shrink-0 mt-1"><ChevronRightIcon className="w-3 h-3 text-[hsl(var(--vp-primary))]"/></div>
                <span><strong>Reportes a Medida:</strong> Extrae datos brutos de ventas para alimentar tus propios tableros de Business Intelligence.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--vp-primary)/0.1)] flex items-center justify-center shrink-0 mt-1"><ChevronRightIcon className="w-3 h-3 text-[hsl(var(--vp-primary))]"/></div>
                <span><strong>Automatización Fiscal:</strong> Integra la emisión de facturas electrónicas directamente en tus flujos de trabajo personalizados.</span>
              </li>
            </ul>
          `
        },
        auth: {
          title: "Autenticación y Seguridad",
          content: `
            <p>Todas las peticiones a la API de VentaPlus deben estar autenticadas mediante una <strong>API Key</strong> única por comercio. Estas llaves otorgan acceso completo a los datos del negocio, por lo que deben mantenerse en secreto.</p>
            
            <div className="bg-[hsl(var(--vp-accent)/0.05)] border-l-4 border-[hsl(var(--vp-accent))] p-6 my-8 rounded-r-2xl">
              <p className="font-bold text-[hsl(var(--vp-accent))] mb-2 flex items-center gap-2"><LockIcon className="w-4 h-4"/> ¡Importante!</p>
              <p className="text-sm m-0">Nunca expongas tu API Key en código cliente (frontend). Úsala siempre desde tu servidor backend para evitar filtraciones de seguridad.</p>
            </div>

            <h3>Headers Requeridos</h3>
            <p>Debes incluir el token en el header de autorización siguiendo el esquema Bearer:</p>
          `,
          code: `# Ejemplo de petición autenticada
curl -X GET "https://api.ventaplus.com/v1/business/status" \\
  -H "Authorization: Bearer vp_live_51M8jW3l2S9X..." \\
  -H "Content-Type: application/json"`
        },
        architecture: {
          title: "Arquitectura Multi-Sucursal",
          content: `
            <p>VentaPlus utiliza una arquitectura de nube distribuida diseñada para la alta disponibilidad. El sistema se basa en una estructura multi-inquilino (multi-tenant) balanceada.</p>
            
            <div className="my-10 p-8 vp-card bg-gradient-to-br from-[hsl(var(--vp-bg-soft))] to-transparent">
              <h4 className="font-extrabold mb-6 flex items-center gap-2"><LayersIcon className="w-5 h-5 text-[hsl(var(--vp-primary))]"/> Capas del Sistema</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--vp-primary))] text-white flex items-center justify-center font-bold">L1</div>
                  <div>
                    <p className="font-bold mb-0 text-[hsl(var(--vp-text))]">Capa de Edge (Cloudflare)</p>
                    <p className="text-sm text-[hsl(var(--vp-muted))]">Cacheo global y protección anti-DDoS.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--vp-accent))] text-white flex items-center justify-center font-bold">L2</div>
                  <div>
                    <p className="font-bold mb-0 text-[hsl(var(--vp-text))]">API Gateway (Node.js/Express)</p>
                    <p className="text-sm text-[hsl(var(--vp-muted))]">Validación de esquemas y ruteo de peticiones.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--vp-text))] text-[hsl(var(--vp-bg))] flex items-center justify-center font-bold">L3</div>
                  <div>
                    <p className="font-bold mb-0 text-[hsl(var(--vp-text))]">Base de Datos Distribuida</p>
                    <p className="text-sm text-[hsl(var(--vp-muted))]">PostgreSQL con replicación en tiempo real.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <blockquote>Cada sucursal opera como un nodo independiente para las transacciones offline, pero se sincroniza inmediatamente al detectar conexión.</blockquote>
          `
        },
        products: {
          title: "Endpoint: Gestión de Productos",
          content: `
            <p>Permite consultar, crear y actualizar el catálogo de productos. Soporta filtrado por categoría, marca y estado de stock.</p>
            
            <h4 className="mt-8 text-[hsl(var(--vp-primary))]">GET /v1/products</h4>
            <p>Retorna una lista paginada de todos los productos activos.</p>
            
            <div className="bg-[hsl(var(--vp-bg-soft))] p-4 rounded-xl border border-[hsl(var(--vp-border))] font-mono text-xs my-4">
              QUERY PARAMS:<br/>
              - limit: (default 20)<br/>
              - offset: (default 0)<br/>
              - category_id: (UUID)
            </div>
          `,
          code: `{
  "id": "prod_8321",
  "name": "Coca-Cola 1.5L",
  "sku": "7791234567890",
  "price": 2500.00,
  "stock": {
    "total": 45,
    "min_alert": 10
  }
}`
        },
        webhooks: {
          title: "Webhooks en Tiempo Real",
          content: `
            <p>Los webhooks permiten que VentaPlus notifique a tu aplicación cuando ocurre un evento. En lugar de hacer pooling, nosotros te avisamos.</p>
            <h3>Eventos Soportados</h3>
            <ul>
              <li><code>sale.created</code>: Se dispara al completar una venta con éxito.</li>
              <li><code>stock.low</code>: Notificación cuando un producto baja de su nivel mínimo.</li>
              <li><code>invoice.error</code>: Error en la comunicación con ARCA/AFIP.</li>
            </ul>
          `,
          code: `# Ejemplo de Payload Webhook
{
  "event": "sale.created",
  "timestamp": "2026-02-21T14:30:00Z",
  "data": {
    "order_id": "ORD-9921",
    "total": 12500.50,
    "payment_method": "cash"
  }
}`
        },
        sales: { 
          title: "Endpoint: Reportes de Ventas", 
          content: `
            <p>Accede al historial detallado de transacciones. Crucial para conciliaciones bancarias y auditorías internas.</p>
            <p><strong>Ruta:</strong> <code>GET /v1/sales/history</code></p>
          ` 
        },
        security: { 
          title: "Cumplimiento y Privacidad", 
          content: `
            <p>La seguridad de los datos es nuestra prioridad absoluta. Cumplimos con los estándares internacionales de protección de datos personales.</p>
            <ul>
              <li><strong>Cifrado:</strong> AES-256 para datos en reposo.</li>
              <li><strong>Conexión:</strong> TLS 1.3 forzado en todas las comunicaciones.</li>
              <li><strong>Backups:</strong> Copias de seguridad automáticas cada 6 horas en múltiples regiones.</li>
            </ul>
          ` 
        }
      },
      en: {
        intro: {
          title: "Welcome to VentaPlus Documentation",
          content: `
            <p className="text-xl">Our REST API allows developers to access business data securely and efficiently. VentaPlus is designed to be the technological foundation for your trade, allowing smooth integrations with any third-party platform.</p>
            <h3>Main Capabilities</h3>
            <ul className="space-y-4">
              <li><strong>Stock Sync:</strong> Keep your inventory coordinated between your physical store and platforms like Shopify or WooCommerce.</li>
              <li><strong>Custom Reports:</strong> Extract raw sales data to feed your own BI dashboards.</li>
              <li><strong>Fiscal Automation:</strong> Integrate electronic invoice issuance directly into your custom workflows.</li>
            </ul>
          `
        },
        auth: {
          title: "Authentication & Security",
          content: `
            <p>All requests to the VentaPlus API must be authenticated using a unique **API Key** per merchant.</p>
            <h3>Required Headers</h3>
            <p>Include the token in the authorization header using the Bearer scheme.</p>
          `,
          code: `curl -X GET "https://api.ventaplus.com/v1/business/status" \\
  -H "Authorization: Bearer vp_live_51M8jW3l2S9X..."`
        },
        architecture: {
          title: "Multi-Branch Architecture",
          content: `
            <p>VentaPlus uses a distributed cloud architecture designed for high availability. The system is based on a balanced multi-tenant structure.</p>
          `
        },
        products: { title: "Endpoint: Product Management", content: "<p>Manage your product catalog through a simple REST interface.</p>" },
        webhooks: { title: "Real-time Webhooks", content: "<p>Don't call us, we'll call you. Subscribe to events like sale.created.</p>" },
        sales: { title: "Endpoint: Sales Reports", content: "<p>Access detailed transaction history for audits and BI.</p>" },
        security: { title: "Compliance & Privacy", content: "<p>Enterprise-grade security with AES-256 encryption and TLS 1.3.</p>" }
      },
      pt: {
        intro: {
          title: "Bem-vindo à Documentação VentaPlus",
          content: `
            <p className="text-xl">Nossa API REST permite que desenvolvedores acessem dados de negócios com segurança.</p>
            <h3>Principais Recursos</h3>
            <ul>
              <li>Sincronização de estoque.</li>
              <li>Relatórios personalizados.</li>
              <li>Automação fiscal.</li>
            </ul>
          `
        },
        auth: { title: "Autenticação", content: "<p>Utilize chaves de API exclusivas para autenticar suas requisições.</p>" },
        architecture: { title: "Arquitetura Multi-Filial", content: "<p>Sistema distribuído projetado para alta disponibilidade.</p>" },
        products: { title: "Referência: Produtos", content: "<p>Gerencie seu catálogo de produtos.</p>" },
        webhooks: { title: "Webhooks em Tempo Real", content: "<p>Receba notificações automáticas de eventos importantes.</p>" },
        sales: { title: "Referência: Vendas", content: "<p>Acesse o histórico de transações.</p>" },
        security: { title: "Segurança e Privacidade", content: "<p>Criptografia de nível bancário e conformidade total.</p>" }
      }
    };
    return data[currentLanguage as keyof typeof data] || data.en;
  }, [currentLanguage]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))] pt-32 pb-24">
        
        {/* Background Ambient Orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-20"
            style={{ background: "radial-gradient(circle, hsl(var(--vp-primary)) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-10"
            style={{ background: "radial-gradient(circle, hsl(var(--vp-accent)) 0%, transparent 70%)" }} />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-32 space-y-10">
                
                {/* Search */}
                <div className="relative group">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--vp-muted))] group-focus-within:text-[hsl(var(--vp-primary))] transition-colors" />
                  <input 
                    type="text" 
                    placeholder={currentLanguage === "pt" ? "Buscar documentação..." : currentLanguage === "en" ? "Search docs..." : "Buscar documentación..."}
                    className="w-full h-12 pl-12 pr-4 bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-border))] rounded-2xl text-sm focus:border-[hsl(var(--vp-primary))] focus:ring-4 focus:ring-[hsl(var(--vp-primary)/0.1)] outline-none transition-all shadow-sm"
                  />
                </div>

                <nav className="space-y-8">
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-[2px] text-[hsl(var(--vp-muted))] mb-4 pl-4 opacity-70">
                       {sidebar.basics}
                    </h5>
                    <ul className="space-y-1">
                      <SidebarItem 
                        active={activeSection === "intro"} 
                        onClick={() => setActiveSection("intro")}
                        icon={<BookIcon className="w-4 h-4" />}
                        label={sidebar.intro}
                      />
                      <SidebarItem 
                        active={activeSection === "auth"} 
                        onClick={() => setActiveSection("auth")}
                        icon={<LockIcon className="w-4 h-4" />}
                        label={sidebar.auth}
                      />
                      <SidebarItem 
                        active={activeSection === "architecture"} 
                        onClick={() => setActiveSection("architecture")}
                        icon={<CpuIcon className="w-4 h-4" />}
                        label={sidebar.architecture}
                      />
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-[2px] text-[hsl(var(--vp-muted))] mb-4 pl-4 opacity-70">
                      {sidebar.api}
                    </h5>
                    <ul className="space-y-1">
                      <SidebarItem 
                        active={activeSection === "products"} 
                        onClick={() => setActiveSection("products")}
                        icon={<DatabaseIcon className="w-4 h-4" />}
                        label={sidebar.products}
                      />
                      <SidebarItem 
                        active={activeSection === "sales"} 
                        onClick={() => setActiveSection("sales")}
                        icon={<ActivityIcon className="w-4 h-4" />}
                        label={sidebar.sales}
                      />
                      <SidebarItem 
                        active={activeSection === "webhooks"} 
                        onClick={() => setActiveSection("webhooks")}
                        icon={<GlobeIcon className="w-4 h-4" />}
                        label={sidebar.webhooks}
                      />
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-[2px] text-[hsl(var(--vp-muted))] mb-4 pl-4 opacity-70">
                       {sidebar.security}
                    </h5>
                    <ul className="space-y-1">
                      <SidebarItem 
                        active={activeSection === "security"} 
                        onClick={() => setActiveSection("security")}
                        icon={<ShieldCheckIcon className="w-4 h-4" />}
                        label={sidebar.security}
                      />
                    </ul>
                  </div>
                </nav>

                <div className="pt-8 border-t border-[hsl(var(--vp-border))]">
                  <Link 
                    href="/contact"
                    className="group flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--vp-primary)/0.05)] border border-[hsl(var(--vp-primary)/0.1)] hover:bg-[hsl(var(--vp-primary)/0.1)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <TerminalIcon className="w-5 h-5 text-[hsl(var(--vp-primary))]" />
                      <span className="text-sm font-bold text-[hsl(var(--vp-primary))]">API Support</span>
                    </div>
                    <ExternalLinkIcon className="w-4 h-4 text-[hsl(var(--vp-primary))] opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 max-w-4xl">
              
              {/* Hero Banner */}
              <div className="vp-card overflow-hidden mb-12 border border-[hsl(var(--vp-border))] bg-gradient-to-br from-[hsl(var(--vp-bg-soft))] via-[hsl(var(--vp-bg-soft))] to-transparent shadow-2xl">
                <div className="p-8 sm:p-14 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Code2Icon className="w-64 h-64 rotate-12" />
                  </div>
                  
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[hsl(var(--vp-primary)/0.1)] text-[hsl(var(--vp-primary))] text-[10px] font-extrabold uppercase tracking-widest mb-8 border border-[hsl(var(--vp-primary)/0.1)]">
                      <ZapIcon className="w-3 h-3" />
                      {hero.badge}
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[hsl(var(--vp-text))] mb-8 leading-[1.1] tracking-tight">
                      {hero.title}
                    </h1>
                    <p className="text-xl text-[hsl(var(--vp-muted))] max-w-2xl leading-relaxed font-medium">
                      {hero.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--vp-primary))] font-black uppercase tracking-widest mb-6">
                  <span>Docs</span>
                  <ChevronRightIcon className="w-3 h-3" />
                  <span className="bg-[hsl(var(--vp-primary)/0.1)] px-2 py-0.5 rounded">{activeSection.replace(/-/g, ' ')}</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-black text-[hsl(var(--vp-text))] mb-10 tracking-tight">
                  {sectionsContent[activeSection].title}
                </h2>

                <div 
                  className="prose prose-invert max-w-none text-lg leading-relaxed text-[hsl(var(--vp-muted-soft))] mb-12
                    prose-h3:text-[hsl(var(--vp-text))] prose-h3:text-3xl prose-h3:mt-16 prose-h3:mb-8 prose-h3:font-black prose-h3:tracking-tight
                    prose-h4:text-[hsl(var(--vp-primary))] prose-h4:text-xl prose-h4:font-bold prose-h4:mt-8
                    prose-p:mb-6
                    prose-ul:my-8 prose-ul:list-disc prose-li:mb-4
                    prose-code:bg-[hsl(var(--vp-primary)/0.1)] prose-code:text-[hsl(var(--vp-primary))] prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-code:font-bold
                    prose-blockquote:border-l-4 prose-blockquote:border-[hsl(var(--vp-primary))] prose-blockquote:bg-[hsl(var(--vp-primary)/0.03)] prose-blockquote:py-6 prose-blockquote:px-10 prose-blockquote:rounded-r-3xl prose-blockquote:italic prose-blockquote:text-[hsl(var(--vp-text))] prose-blockquote:my-12
                    prose-strong:text-[hsl(var(--vp-text))] prose-strong:font-black
                  "
                  dangerouslySetInnerHTML={{ __html: sectionsContent[activeSection].content }}
                />

                {sectionsContent[activeSection].code && (
                  <div className="relative group/code my-12">
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                       <span className="text-[10px] font-bold text-[hsl(var(--vp-muted))] opacity-0 group-hover/code:opacity-100 transition-opacity">
                        {copied ? "Copied!" : "Click to copy"}
                      </span>
                      <button 
                        onClick={() => handleCopy(sectionsContent[activeSection].code)}
                        className="p-2.5 rounded-xl bg-[hsl(var(--vp-surface))] border border-[hsl(var(--vp-border))] hover:bg-[hsl(var(--vp-primary))] hover:border-[hsl(var(--vp-primary))] transition-all text-[hsl(var(--vp-muted))] hover:text-white shadow-lg"
                      >
                        {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-[#1e293b] border border-[hsl(var(--vp-border))] rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest z-10">
                      Code snippet
                    </div>
                    <pre className="p-10 rounded-[2rem] bg-[#0d1117] border border-[hsl(var(--vp-border))] overflow-x-auto font-mono text-[13px] leading-relaxed text-gray-300 shadow-2xl">
                      <code>{sectionsContent[activeSection].code}</code>
                    </pre>
                  </div>
                )}
                
                {/* CTA / Quick Info */}
                <div className="mt-28 p-10 rounded-[2.5rem] border border-[hsl(var(--vp-primary)/0.1)] bg-gradient-to-br from-[hsl(var(--vp-primary)/0.05)] to-transparent flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                  <div className="relative z-10">
                    <h4 className="text-2xl font-black mb-2 tracking-tight group-hover:text-[hsl(var(--vp-primary))] transition-colors">Explore our playground</h4>
                    <p className="text-[hsl(var(--vp-muted))] font-medium">Test your endpoints in our interactive real-time sandbox environment.</p>
                  </div>
                  <button className="relative z-10 vp-button vp-button-primary h-14 px-10 rounded-2xl shadow-[0_10px_30px_-10px_hsl(var(--vp-primary))] ring-offset-4 ring-offset-[hsl(var(--vp-bg-page))] hover:ring-2 ring-[hsl(var(--vp-primary))] transition-all font-bold whitespace-nowrap">
                    Open Sandbox
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SidebarItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <li>
      <button 
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 group relative
          ${active 
            ? "bg-[hsl(var(--vp-primary)/0.1)] text-[hsl(var(--vp-primary))] shadow-sm" 
            : "text-[hsl(var(--vp-muted))] hover:bg-[hsl(var(--vp-bg-soft))] hover:text-[hsl(var(--vp-text))]"
          }
        `}
      >
        <span className={`transition-all duration-500 ${active ? "scale-125 rotate-6 text-[hsl(var(--vp-primary))]" : "group-hover:scale-110 group-hover:text-[hsl(var(--vp-primary))]"}`}>
          {icon}
        </span>
        <span className="flex-1 text-left tracking-tight">{label}</span>
        {active && (
          <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[hsl(var(--vp-primary))] shadow-[0_0_15px_hsl(var(--vp-primary))]" />
        )}
      </button>
    </li>
  );
}
