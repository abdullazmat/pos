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
  HelpCircleIcon,
  MessageSquareIcon,
  SparklesIcon,
  ClockIcon,
  BookOpenIcon,
  ShieldCheckIcon,
} from "lucide-react";

export default function HelpArticlePage() {
  const { id } = useParams();
  const { currentLanguage } = useLanguage();

  const article = useMemo(() => {
    const data: Record<string, any> = {
      es: {
        /* Getting Started - ES */
        "crear-cuenta": {
          title: "Crea tu cuenta de VentaPlus",
          category: "Primeros Pasos",
          catId: "getting-started",
          updatedAt: "22 Feb 2026",
          time: "3 min",
          content: `
            <p>Empezar con VentaPlus es el primer paso para transformar tu negocio. Sigue estos pasos para crear tu cuenta profesional.</p>
            <h3>Proceso de Registro:</h3>
            <ol>
              <li>Visita nuestra página de registro y completa el formulario con tu email y contraseña.</li>
              <li>Verifica tu correo electrónico haciendo clic en el enlace que te enviamos.</li>
              <li>Completa el perfil de tu negocio: Nombre comercial, Rubro y Dirección.</li>
              <li>Selecciona el plan que mejor se adapte a tus necesidades (puedes empezar con la prueba gratuita).</li>
            </ol>
            <blockquote>Bienvenido a la comunidad de VentaPlus. Estamos aquí para ayudarte a crecer.</blockquote>
          `
        },
        "primera-venta": {
          title: "Realiza tu primera venta",
          category: "Primeros Pasos",
          catId: "getting-started",
          updatedAt: "22 Feb 2026",
          time: "5 min",
          content: `
            <p>El corazón de tu negocio es el Punto de Venta (POS). Aquí te mostramos cómo procesar tu primera transacción.</p>
            <ol>
              <li>Abre el módulo <strong>Punto de Venta</strong> en el menú lateral.</li>
              <li>Selecciona los productos haciendo clic en ellos o escaneando su código de barras.</li>
              <li>Haz clic en el botón <strong>Cobrar</strong>.</li>
              <li>Elige el método de pago (Efectivo, Tarjeta, QR) y confirma el monto.</li>
              <li>Entrega el comprobante al cliente.</li>
            </ol>
          `
        },
        "agregar-productos": {
          title: "Agrega tus primeros productos",
          category: "Primeros Pasos",
          catId: "getting-started",
          updatedAt: "22 Feb 2026",
          time: "7 min",
          content: `
            <p>Mantener un inventario organizado es fundamental. Sigue estos pasos para cargar tus productos.</p>
            <ol>
              <li>Ve a <strong>Inventario > Productos</strong>.</li>
              <li>Haz clic en <strong>Nuevo Producto</strong>.</li>
              <li>Carga el nombre, precio de costo, margen de utilidad y stock inicial.</li>
              <li>Asigna una categoría para encontrarlos más rápido en el POS.</li>
            </ol>
            <p>Si tienes muchos productos, puedes usar nuestra función de <strong>Importar desde Excel</strong>.</p>
          `
        },

        /* ARCA Invoicing - ES */
        "configurar-arca": {
          title: "Configurar integración con ARCA/AFIP",
          category: "Facturación ARCA",
          catId: "arca-invoicing",
          updatedAt: "21 Feb 2026",
          time: "10 min",
          content: `
            <p>Para emitir facturas electrónicas legales en Argentina, necesitas conectar VentaPlus con ARCA (ex AFIP).</p>
            <h3>Requisitos previos:</h3>
            <ul>
              <li>CUIT y Clave Fiscal nivel 3.</li>
              <li>Haber dado de alta el Punto de Venta en la web de AFIP (WebServices).</li>
            </ul>
            <h3>Pasos:</h3>
            <ol>
              <li>Genera el certificado digital desde VentaPlus.</li>
              <li>Sube el certificado a la web de AFIP y obtén el archivo de respuesta (.crt).</li>
              <li>Carga el archivo .crt en la configuración fiscal de VentaPlus.</li>
              <li>Realiza una factura de prueba para verificar la conexión.</li>
            </ol>
          `
        },
        "emitir-factura-a": {
          title: "Emitir Factura A",
          category: "Facturación ARCA",
          catId: "arca-invoicing",
          updatedAt: "21 Feb 2026",
          time: "5 min",
          content: `
            <p>La Factura A se emite a clientes que son Responsables Inscriptos.</p>
            <ol>
              <li>En el POS, selecciona al cliente (debe tener CUIT cargado).</li>
              <li>Carga los productos de la venta.</li>
              <li>Al momento de facturar, el sistema detectará automáticamente que corresponde Factura A.</li>
              <li>Confirma la operación y el sistema obtendrá el CAE de AFIP en tiempo real.</li>
            </ol>
          `
        },

        /* Subscriptions - ES */
        "planes-vista": {
          title: "Vista General de Planes",
          category: "Suscripciones",
          catId: "subscriptions",
          updatedAt: "21 Feb 2026",
          time: "4 min",
          content: `
            <p>Ofrecemos planes que crecen con tu negocio.</p>
            <ul>
              <li><strong>Starter:</strong> 1 Sucursal, 2 usuarios, facturación básica.</li>
              <li><strong>Pro:</strong> Sucursales ilimitadas, reportes avanzados, soporte 24/7.</li>
              <li><strong>Enterprise:</strong> Integraciones personalizadas y consultoría dedicada.</li>
            </ul>
          `
        }
      },
      en: {
        /* Getting Started - EN */
        "create-account": {
          title: "Create your VentaPlus account",
          category: "Getting Started",
          catId: "getting-started",
          updatedAt: "Feb 22, 2026",
          time: "3 min",
          content: `
            <p>Starting with VentaPlus is the first step to transform your business. Follow these steps to create your professional account.</p>
            <h3>Registration Process:</h3>
            <ol>
              <li>Visit our signup page and fill out the form with your email and password.</li>
              <li>Verify your email by clicking the link we sent you.</li>
              <li>Complete your business profile: Business name, Industry, and Address.</li>
              <li>Select the plan that best fits your needs (you can start with the free trial).</li>
            </ol>
            <blockquote>Welcome to the VentaPlus community. We are here to help you grow.</blockquote>
          `
        },
        "first-sale": {
          title: "Make your first sale",
          category: "Getting Started",
          catId: "getting-started",
          updatedAt: "Feb 22, 2026",
          time: "5 min",
          content: `
            <p>The heart of your business is the Point of Sale (POS). Here we show you how to process your first transaction.</p>
            <ol>
              <li>Open the <strong>Point of Sale</strong> module from the side menu.</li>
              <li>Select products by clicking them or scanning their barcode.</li>
              <li>Click the <strong>Pay</strong> button.</li>
              <li>Choose the payment method (Cash, Card, QR) and confirm the amount.</li>
              <li>Hand the receipt to the customer.</li>
            </ol>
          `
        },
        "add-products": {
          title: "Add your first products",
          category: "Getting Started",
          catId: "getting-started",
          updatedAt: "Feb 22, 2026",
          time: "7 min",
          content: `
            <p>Keeping an organized inventory is fundamental. Follow these steps to upload your products.</p>
            <ol>
              <li>Go to <strong>Inventory > Products</strong>.</li>
              <li>Click <strong>New Product</strong>.</li>
              <li>Upload name, cost price, profit margin, and initial stock.</li>
              <li>Assign a category to find them faster in the POS.</li>
            </ol>
            <p>If you have many products, you can use our <strong>Import from Excel</strong> feature.</p>
          `
        },
        "invite-team": {
          title: "Invite your team members",
          category: "Getting Started",
          catId: "getting-started",
          updatedAt: "Feb 22, 2026",
          time: "4 min",
          content: `
            <p>VentaPlus works better in a team. Invite your collaborators and assign them roles.</p>
            <ol>
              <li>Go to <strong>Settings > Users</strong>.</li>
              <li>Click <strong>Invite User</strong>.</li>
              <li>Enter their email and select a role (Admin, Cashier, Manager).</li>
              <li>The user will receive an invitation to join your workspace.</li>
            </ol>
          `
        },

        /* ARCA Invoicing - EN */
        "setup-arca": {
          title: "Set up ARCA/AFIP integration",
          category: "ARCA Invoicing",
          catId: "arca-invoicing",
          updatedAt: "Feb 21, 2026",
          time: "10 min",
          content: `
            <p>To issue legal electronic invoices in Argentina, you need to connect VentaPlus with ARCA (ex AFIP).</p>
            <h3>Prerequisites:</h3>
            <ul>
              <li>CUIT and Tax Key level 3.</li>
              <li>Punto de Venta registered on AFIP website (WebServices).</li>
            </ul>
            <ol>
              <li>Generate the digital certificate from VentaPlus.</li>
              <li>Upload the certificate to AFIP website and get the response file (.crt).</li>
              <li>Upload the .crt file in VentaPlus fiscal settings.</li>
            </ol>
          `
        },

        /* Subscriptions - EN */
        "plans-overview": {
          title: "Plans Overview",
          category: "Subscriptions",
          catId: "subscriptions",
          updatedAt: "Feb 21, 2026",
          time: "4 min",
          content: `
            <p>VentaPlus offers different subscription tiers to match your business size.</p>
            <ul>
              <li><strong>Starter:</strong> Perfect for small shops starting out.</li>
              <li><strong>Professional:</strong> For growing businesses with advanced reporting needs.</li>
              <li><strong>Enterprise:</strong> Custom solutions for large chains.</li>
            </ul>
          `
        },
        "upgrade-plan": {
          title: "Upgrade Your Plan",
          category: "Subscriptions",
          catId: "subscriptions",
          updatedAt: "Feb 22, 2026",
          time: "3 min",
          content: `
            <p>Grow your business features by upgrading your plan instantly.</p>
            <ol>
              <li>Visit <strong>Settings > Subscription</strong>.</li>
              <li>Compare and select your new plan.</li>
              <li>Payment will be prorated based on your current cycle.</li>
            </ol>
          `
        }
      },
      pt: {
        "criar-conta": {
          title: "Crie sua conta VentaPlus",
          category: "Primeiros Passos",
          catId: "getting-started",
          updatedAt: "22 Fev 2026",
          time: "3 min",
          content: `
            <p>Começar com VentaPlus é o primeiro passo para transformar seu negócio. Siga estes passos para criar sua conta profissional.</p>
            <ol>
              <li>Visite nossa página de registro.</li>
              <li>Verifique seu e-mail.</li>
              <li>Configure seu perfil de negócio.</li>
            </ol>
          `
        }
      }
    };

    const langData = data[currentLanguage as keyof typeof data] || data.es;
    const finalArticle = langData[id as string] || (currentLanguage === "pt" ? {
      title: "Tutorial de Ajuda",
      category: "Geral",
      catId: "getting-started",
      updatedAt: "2026",
      time: "5 min",
      content: "<p>O conteúdo deste tutorial está sendo atualizado. Por favor, tente novamente em alguns minutos.</p>"
    } : currentLanguage === "en" ? {
      title: "Help Tutorial",
      category: "General",
      catId: "getting-started",
      updatedAt: "2026",
      time: "5 min",
      content: "<p>The content of this tutorial is being updated. Please try again in a few minutes.</p>"
    } : {
      title: "Tutorial de Ayuda",
      category: "General",
      catId: "getting-started",
      updatedAt: "2026",
      time: "5 min",
      content: "<p>El contenido de este tutorial se está actualizando. Por favor, intenta de nuevo en unos minutos.</p>"
    });

    return finalArticle;
  }, [id, currentLanguage]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))] pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-6">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-[hsl(var(--vp-muted))] mb-8">
            <Link href="/help" className="hover:text-[hsl(var(--vp-primary))] transition-colors">
              {currentLanguage === "pt" ? "Central de Ajuda" : currentLanguage === "en" ? "Help Center" : "Centro de Ayuda"}
            </Link>
            <ChevronRightIcon className="w-3 h-3" />
            <Link href={`/help/category/${article.catId}`} className="hover:text-[hsl(var(--vp-primary))] transition-colors">{article.category}</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-[hsl(var(--vp-text))] font-medium line-clamp-1">{article.title}</span>
          </nav>

          <Link 
            href={`/help/category/${article.catId}`}
            className="inline-flex items-center gap-2 text-[hsl(var(--vp-primary))] font-bold text-sm mb-12 group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {currentLanguage === "pt" ? "Voltar à Categoria" : currentLanguage === "en" ? "Back to Category" : "Volver a la Categoría"}
          </Link>

          <article className="vp-card p-8 sm:p-12 overflow-hidden shadow-2xl relative border border-[hsl(var(--vp-border))]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BookOpenIcon className="w-24 h-24 text-[hsl(var(--vp-primary))]" />
            </div>

            <header className="mb-12 relative z-10 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-6">
                <div className="px-3 py-1 rounded-full bg-[hsl(var(--vp-primary)/0.1)] border border-[hsl(var(--vp-primary)/0.2)] text-[hsl(var(--vp-primary))] text-[10px] font-bold uppercase tracking-widest">
                  {article.category}
                </div>
                <div className="flex items-center gap-1.5 text-[hsl(var(--vp-muted))] text-xs font-medium">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {article.time}
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[hsl(var(--vp-text))] mb-6 leading-tight">
                {article.title}
              </h1>
              
              <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-[hsl(var(--vp-muted))]">
                <ShieldCheckIcon className="w-4 h-4 text-[hsl(var(--vp-primary))]" />
                <span>{currentLanguage === "pt" ? "Verificado" : currentLanguage === "en" ? "Verified" : "Verificado"}</span>
                <span className="mx-2">•</span>
                <span>{article.updatedAt}</span>
              </div>
            </header>

            <div 
              className="prose prose-invert max-w-none text-[hsl(var(--vp-muted-soft))] leading-relaxed text-lg
                prose-h3:text-[hsl(var(--vp-text))] prose-h3:font-bold prose-h3:mt-10 prose-h3:mb-6 prose-h3:text-2xl
                prose-strong:text-[hsl(var(--vp-text))] prose-strong:font-bold
                prose-blockquote:border-l-4 prose-blockquote:border-[hsl(var(--vp-primary))] prose-blockquote:bg-[hsl(var(--vp-primary)/0.05)] prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:my-10
                prose-ul:list-disc prose-ol:list-decimal prose-li:mb-4 prose-li:pl-2
                prose-a:text-[hsl(var(--vp-primary))] prose-a:no-underline hover:prose-a:underline font-medium
                prose-img:rounded-2xl prose-img:shadow-2xl
              "
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <footer className="mt-20 pt-12 border-t border-[hsl(var(--vp-border))] flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="text-center sm:text-left">
                <p className="font-bold text-lg text-[hsl(var(--vp-text))] mb-2">
                  {currentLanguage === "pt" ? "Isso foi útil?" : currentLanguage === "en" ? "Was this helpful?" : "¿Fue útil este tutorial?"}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                  <button className="px-6 py-2.5 rounded-xl border border-[hsl(var(--vp-border))] hover:bg-[hsl(var(--vp-primary)/0.1)] hover:border-[hsl(var(--vp-primary))] hover:text-[hsl(var(--vp-primary))] transition-all text-sm font-bold flex items-center gap-2">
                    {currentLanguage === "pt" ? "👍 Sim" : currentLanguage === "en" ? "👍 Yes" : "👍 Sí"}
                  </button>
                  <button className="px-6 py-2.5 rounded-xl border border-[hsl(var(--vp-border))] hover:bg-[hsl(var(--vp-bg-soft))] hover:border-[hsl(var(--vp-primary))] transition-all text-sm font-bold">
                    {currentLanguage === "pt" ? "👎 Não" : currentLanguage === "en" ? "👎 No" : "👎 No"}
                  </button>
                </div>
              </div>

              <Link 
                href="/contact"
                className="vp-button vp-button-primary h-14 px-8 rounded-2xl shadow-xl w-full sm:w-auto"
              >
                <MessageSquareIcon className="w-5 h-5" />
                {currentLanguage === "pt" ? "Falar com suporte" : currentLanguage === "en" ? "Contact Support" : "Contactar Soporte"}
              </Link>
            </footer>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
