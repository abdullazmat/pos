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
  MessageSquareIcon,
  SparklesIcon,
  ClockIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  Share2Icon,
  PrinterIcon
} from "lucide-react";

export default function ArticlePage() {
  const { category: catId, article: id } = useParams();
  const { currentLanguage } = useLanguage();

  const article = useMemo(() => {
    const data: Record<string, any> = {
      es: {
        /* Getting Started */
        "crear-cuenta": {
          title: "Crea tu cuenta de VentaPlus",
          category: "Primeros Pasos",
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
          updatedAt: "22 Feb 2026",
          time: "7 min",
          content: `
            <p>Sube tu catálogo de productos para empezar a vender de forma organizada.</p>
            <h3>Opciones de carga:</h3>
            <ul>
              <li><strong>Manual:</strong> Ideal para pocos artículos. Ve a Inventario > Productos > Nuevo.</li>
              <li><strong>Importación:</strong> Sube un archivo Excel con todos tus productos a la vez.</li>
            </ul>
            <p>No olvides configurar el costo y el precio de venta para que el sistema calcule tu rentabilidad automáticamente.</p>
          `
        },
        "invitar-equipo": {
          title: "Invita a los miembros de tu equipo",
          category: "Primeros Pasos",
          updatedAt: "22 Feb 2026",
          time: "4 min",
          content: `
            <p>VentaPlus es colaborativo. Puedes dar acceso a tus vendedores y encargados con permisos específicos.</p>
            <ol>
              <li>Ve a <strong>Configuración > Usuarios</strong>.</li>
              <li>Haz clic en "Invitar Usuario".</li>
              <li>Ingresa su correo y elige un rol (Vendedor, Administrador, etc.).</li>
              <li>Tu colaborador recibirá un email para activar su acceso.</li>
            </ol>
          `
        },

        /* ARCA Invoicing */
        "configurar-arca": {
          title: "Configurar integración con ARCA/AFIP",
          category: "Facturación ARCA",
          updatedAt: "21 Feb 2026",
          time: "10 min",
          content: `
            <p>Para emitir facturas electrónicas legales en Argentina, necesitas conectar VentaPlus con ARCA (ex AFIP).</p>
            <h3>Pasos para la integración:</h3>
            <ol>
              <li>Ingresa a <strong>Configuración > Fiscal</strong>.</li>
              <li>Genera el pedido de certificado (CSR).</li>
              <li>Accede con tu Clave Fiscal a la web de ARCA y asocia el certificado.</li>
              <li>Sube el archivo .CRT obtenido a VentaPlus.</li>
            </ol>
            <p>Una vez completado, podrás emitir facturas con validez legal de forma automática.</p>
          `
        },
        "emitir-factura-a": {
          title: "Emitir Factura A",
          category: "Facturación ARCA",
          updatedAt: "22 Feb 2026",
          time: "5 min",
          content: `
            <p>La Factura A se emite a clientes que son Responsables Inscriptos.</p>
            <ol>
              <li>Selecciona un cliente con CUIT válido en el POS.</li>
              <li>Carga los productos.</li>
              <li>Al cobrar, el sistema seleccionará automáticamente Factura A si el cliente es RI.</li>
              <li>El CAE se obtendrá automáticamente de ARCA.</li>
            </ol>
          `
        },
        "emitir-factura-b": {
          title: "Emitir Factura B",
          category: "Facturación ARCA",
          updatedAt: "22 Feb 2026",
          time: "5 min",
          content: `
            <p>La Factura B se emite a Consumidores Finales o Exentos.</p>
            <ol>
              <li>Si la venta supera el monto mínimo legal, identifica al cliente con DNI.</li>
              <li>Si es menor, puedes usar "Consumidor Final" genérico.</li>
              <li>Carga los productos en el POS.</li>
              <li>El sistema emitirá el ticket factura B con el CAE correspondiente.</li>
            </ol>
          `
        },
        "notas-credito": {
          title: "Emitir Notas de Crédito",
          category: "Facturación ARCA",
          updatedAt: "22 Feb 2026",
          time: "6 min",
          content: `
            <p>Las Notas de Crédito se utilizan para anular facturas emitidas anteriormente.</p>
            <ol>
              <li>Busca la factura original en el historial de ventas.</li>
              <li>Haz clic en "Devolución" o "Anular".</li>
              <li>El sistema generará la Nota de Crédito vinculada a la factura original ante ARCA.</li>
            </ol>
          `
        },

        /* Subscriptions */
        "planes-vista": {
          title: "Vista General de Planes",
          category: "Suscripciones",
          updatedAt: "21 Feb 2026",
          time: "4 min",
          content: `
            <p>VentaPlus ofrece planes flexibles para cada etapa de tu negocio.</p>
            <ul>
              <li><strong>Starter:</strong> Ideal para emprendedores. Incluye facturación básica y stock.</li>
              <li><strong>Professional:</strong> Para negocios en crecimiento. Multi-sucursal y reportes avanzados.</li>
              <li><strong>Enterprise:</strong> Soluciones a medida con soporte prioritario.</li>
            </ul>
          `
        },
        "mejorar-plan": {
          title: "Cómo mejorar tu Plan",
          category: "Suscripciones",
          updatedAt: "21 Feb 2026",
          time: "3 min",
          content: `
            <p>Puedes subir de nivel en cualquier momento para desbloquear más funciones.</p>
            <ol>
              <li>Dirígete a <strong>Configuración > Suscripción</strong>.</li>
              <li>Selecciona el plan al que deseas migrar.</li>
              <li>Confirma el nuevo monto y los beneficios se activarán al instante.</li>
            </ol>
          `
        },
        "historial-facturacion": {
          title: "Historial de Facturación",
          category: "Suscripciones",
          updatedAt: "20 Feb 2026",
          time: "3 min",
          content: `
            <p>Accede a tus facturas de servicio de VentaPlus.</p>
            <ol>
              <li>Ingresa a <strong>Mi Cuenta > Facturación</strong>.</li>
              <li>Verás la lista detallada de tus abonos mensuales.</li>
              <li>Haz clic en descargar para obtener el PDF legal.</li>
            </ol>
          `
        },
        "cancelar-suscripcion": {
          title: "Cancelar Suscripción",
          category: "Suscripciones",
          updatedAt: "21 Feb 2026",
          time: "4 min",
          content: `
            <p>Lamentamos que te vayas. El proceso de cancelación es transparente y directo.</p>
            <ol>
              <li>Ve a <strong>Configuración > Suscripción</strong>.</li>
              <li>Busca la opción "Cancelar Plan" al final de la página.</li>
              <li>Completa el breve formulario de feedback para ayudarnos a mejorar.</li>
            </ol>
            <p>Podrás seguir usando el sistema hasta el final del periodo ya abonado.</p>
          `
        }
      },
      en: {
        /* Getting Started */
        "create-account": {
          title: "Create your VentaPlus account",
          category: "Getting Started",
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
          updatedAt: "Feb 22, 2026",
          time: "5 min",
          content: `
            <p>Process your very first transaction through the VentaPlus POS.</p>
            <ol>
              <li>Open the <strong>Point of Sale</strong> module.</li>
              <li>Choose products by clicking or scanning.</li>
              <li>Click <strong>Checkout</strong>, choose payment method, and confirm.</li>
            </ol>
          `
        },
        "add-products": {
          title: "Add your first products",
          category: "Getting Started",
          updatedAt: "Feb 22, 2026",
          time: "7 min",
          content: `
            <p>Organize your inventory by uploading your products properly.</p>
            <ol>
              <li>Go to Inventory > Products.</li>
              <li>Use the "New" button for manual entries or "Import" for Excel files.</li>
              <li>Set costs and prices for profit calculation.</li>
            </ol>
          `
        },
        "invite-team": {
          title: "Invite your team members",
          category: "Getting Started",
          updatedAt: "Feb 22, 2026",
          time: "4 min",
          content: `
            <p>Give access to your staff with specific roles and permissions.</p>
            <ol>
              <li>Go to <strong>Settings > Users</strong>.</li>
              <li>Click Invite and enter their email.</li>
              <li>Select a role and send the invitation.</li>
            </ol>
          `
        },

        /* ARCA Invoicing */
        "setup-arca": {
          title: "Set up ARCA/AFIP integration",
          category: "ARCA Invoicing",
          updatedAt: "Feb 21, 2026",
          time: "10 min",
          content: `
            <p>Connect VentaPlus with the Argentine Tax Authority (ARCA) for legal electronic invoicing.</p>
            <h3>Integration Guide:</h3>
            <ol>
              <li>Navigate to <strong>Settings > Fiscal</strong>.</li>
              <li>Generate a Certificate Request (CSR).</li>
              <li>Upload back the .CRT file received from the ARCA website.</li>
            </ol>
          `
        },
        "issue-factura-a": {
          title: "Issue Factura A",
          category: "ARCA Invoicing",
          updatedAt: "Feb 22, 2026",
          time: "5 min",
          content: `
            <p>Step-by-step guide to issue Factura A for registered taxpayers.</p>
            <ol>
              <li>Choose a customer with a valid CUIT in the POS.</li>
              <li>The system detects RI status and selects Factura A automatically.</li>
            </ol>
          `
        },
        "issue-factura-b": {
          title: "Issue Factura B",
          category: "ARCA Invoicing",
          updatedAt: "Feb 22, 2026",
          time: "5 min",
          content: `
            <p>How to issue Factura B for final consumers.</p>
            <ol>
              <li>Process the sale in the POS.</li>
              <li>Identify the customer if the amount exceeds the legal limit.</li>
            </ol>
          `
        },
        "issue-credit-notes": {
          title: "Issue Credit Notes",
          category: "ARCA Invoicing",
          updatedAt: "Feb 22, 2026",
          time: "6 min",
          content: `
            <p>Cancel or return invoices legally by issuing credit notes.</p>
            <ol>
              <li>Find the original invoice in Sales History.</li>
              <li>Select Return/Cancel to generate the link with ARCA.</li>
            </ol>
          `
        },

        /* Subscriptions */
        "plans-overview": {
          title: "Plans Overview",
          category: "Subscriptions",
          updatedAt: "Feb 21, 2026",
          time: "4 min",
          content: `
            <p>Compare our different subscription tiers for your business.</p>
            <ul>
              <li><strong>Starter:</strong> Essential tools for small shops.</li>
              <li><strong>Professional:</strong> Advanced features for growing companies.</li>
              <li><strong>Enterprise:</strong> Scalable solutions with dedicated support.</li>
            </ul>
          `
        },
        "upgrade-plan": {
          title: "Upgrade Your Plan",
          category: "Subscriptions",
          updatedAt: "Feb 22, 2026",
          time: "3 min",
          content: `
            <p>Scale up your business features by upgrading your plan instantly.</p>
            <ol>
              <li>Visit <strong>Settings > Subscription</strong>.</li>
              <li>Choose your new plan and confirm.</li>
            </ol>
          `
        },
        "billing-history": {
          title: "Billing History",
          category: "Subscriptions",
          updatedAt: "Feb 20, 2026",
          time: "3 min",
          content: `
            <p>Download and manage your VentaPlus service invoices.</p>
          `
        },
        "cancel-subscription": {
          title: "Cancel Subscription",
          category: "Subscriptions",
          updatedAt: "Feb 21, 2026",
          time: "4 min",
          content: `
            <p>Transparent cancellation process at any time.</p>
          `
        }
      },
      pt: {
        /* Getting Started */
        "criar-conta": {
          title: "Crie sua conta de VentaPlus",
          category: "Primeiros Passos",
          updatedAt: "22 Fev 2026",
          time: "3 min",
          content: `
            <p>Criar sua conta profissional é o primeiro passo para o sucesso.</p>
            <ol>
              <li>Visite a página de cadastro.</li>
              <li>Verifique seu e-mail.</li>
              <li>Complete seu perfil de negócio.</li>
            </ol>
          `
        },
        "primeira-venda": {
          title: "Faça sua primeira venda",
          category: "Primeiros Passos",
          updatedAt: "22 Fev 2026",
          time: "5 min",
          content: `<p>Aprenda a processar transações no PDV.</p>`
        },
        "adicionar-produtos": {
          title: "Adicione seus primeiros produtos",
          category: "Primeiros Passos",
          updatedAt: "22 Fev 2026",
          time: "7 min",
          content: `<p>Configure seu estoque agora.</p>`
        },
        "convidar-equipe": {
          title: "Convide os membros da sua equipe",
          category: "Primeiros Passos",
          updatedAt: "22 Fev 2026",
          time: "4 min",
          content: `<p>Dê acesso aos seus colaboradores.</p>`
        }
      }
    };

    const langData = data[currentLanguage as keyof typeof data] || data.es;
    return langData[id as string] || {
      title: currentLanguage === "en" ? "Tutorial" : currentLanguage === "pt" ? "Tutorial" : "Tutorial",
      category: currentLanguage === "en" ? "General" : currentLanguage === "pt" ? "Geral" : "General",
      updatedAt: "2026",
      time: "5 min",
      content: currentLanguage === "en" 
        ? "<p>The content for this tutorial is being prepared. Please check back later.</p>" 
        : currentLanguage === "pt"
        ? "<p>O conteúdo deste tutorial está sendo preparado. Por favor, volte mais tarde.</p>"
        : "<p>El contenido de este tutorial se está preparando. Por favor, vuelve más tarde.</p>"
    };
  }, [id, currentLanguage]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))] pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-6">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-[hsl(var(--vp-muted))] mb-8 flex-wrap">
            <Link href="/" className="hover:text-[hsl(var(--vp-primary))] transition-colors">Home</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <Link href="/support/tutorials" className="hover:text-[hsl(var(--vp-primary))] transition-colors">Tutorials</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <Link href={`/support/tutorials/${catId}`} className="hover:text-[hsl(var(--vp-primary))] transition-colors capitalize">{String(catId).replace(/-/g, ' ')}</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-[hsl(var(--vp-text))] font-medium line-clamp-1">{article.title}</span>
          </nav>

          <Link 
            href={`/support/tutorials/${catId}`}
            className="inline-flex items-center gap-2 text-[hsl(var(--vp-primary))] font-bold text-sm mb-12 group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {currentLanguage === "pt" ? "Voltar à categoria" : currentLanguage === "en" ? "Back to category" : "Volver a la categoría"}
          </Link>

          <article className="vp-card p-8 sm:p-12 overflow-hidden shadow-2xl relative border border-[hsl(var(--vp-border))]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BookOpenIcon className="w-24 h-24 text-[hsl(var(--vp-primary))]" />
            </div>

            <header className="mb-12 relative z-10">
              <div className="flex flex-wrap items-center gap-4 mb-6">
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
              
              <div className="flex items-center gap-6 text-sm text-[hsl(var(--vp-muted))] py-6 border-y border-[hsl(var(--vp-border))/0.5] mb-10">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-[hsl(var(--vp-primary))]" />
                  <span>{currentLanguage === "pt" ? "Versão Verificada" : currentLanguage === "en" ? "Verified Version" : "Versión Verificada"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{currentLanguage === "pt" ? "Atualizado" : currentLanguage === "en" ? "Updated" : "Actualizado"} {article.updatedAt}</span>
                </div>
              </div>
            </header>

            <div 
              className="prose prose-invert max-w-none text-[hsl(var(--vp-muted-soft))] leading-relaxed text-lg
                prose-h3:text-[hsl(var(--vp-text))] prose-h3:font-bold prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-2xl
                prose-strong:text-[hsl(var(--vp-text))] prose-strong:font-bold
                prose-blockquote:border-l-4 prose-blockquote:border-[hsl(var(--vp-primary))] prose-blockquote:bg-[hsl(var(--vp-primary)/0.05)] prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:my-10
                prose-ul:list-disc prose-ol:list-decimal prose-li:mb-4
                prose-a:text-[hsl(var(--vp-primary))] prose-a:no-underline hover:prose-a:underline font-medium
              "
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <footer className="mt-20 pt-12 border-t border-[hsl(var(--vp-border))]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-12">
                <div>
                  <p className="font-bold text-lg text-[hsl(var(--vp-text))] mb-2 text-center sm:text-left">
                    {currentLanguage === "pt" ? "Este guia foi útil?" : currentLanguage === "en" ? "Was this guide helpful?" : "¿Fue útil este tutorial?"}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                    <button className="px-6 py-2.5 rounded-xl border border-[hsl(var(--vp-border))] hover:bg-[hsl(var(--vp-primary)/0.1)] hover:border-[hsl(var(--vp-primary))] hover:text-[hsl(var(--vp-primary))] transition-all text-sm font-bold">
                      {currentLanguage === "pt" ? "Sim" : currentLanguage === "en" ? "Yes" : "Sí"}
                    </button>
                    <button className="px-6 py-2.5 rounded-xl border border-[hsl(var(--vp-border))] hover:bg-[hsl(var(--vp-bg-soft))] transition-all text-sm font-bold">
                      {currentLanguage === "pt" ? "Não" : currentLanguage === "en" ? "No" : "No"}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="w-12 h-12 rounded-xl border border-[hsl(var(--vp-border))] flex items-center justify-center hover:bg-[hsl(var(--vp-bg-soft))] transition-colors">
                    <PrinterIcon className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 rounded-xl border border-[hsl(var(--vp-border))] flex items-center justify-center hover:bg-[hsl(var(--vp-bg-soft))] transition-colors">
                    <Share2Icon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[hsl(var(--vp-primary)/0.1)] to-transparent p-8 rounded-3xl border border-[hsl(var(--vp-primary)/0.1)] flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-xl font-bold mb-2">
                    {currentLanguage === "pt" ? "Ainda precisa de ajuda?" : currentLanguage === "en" ? "Still need help?" : "¿Aún necesitás ayuda?"}
                  </h4>
                  <p className="text-[hsl(var(--vp-muted))]">
                    {currentLanguage === "pt" ? "Entre em contato com nossa equipe técnica." : currentLanguage === "en" ? "Contact our technical support team." : "Contactá a nuestro equipo de soporte técnico."}
                  </p>
                </div>
                <Link 
                  href="/contact"
                  className="vp-button vp-button-primary h-12 px-8 rounded-xl shadow-lg whitespace-nowrap"
                >
                  <MessageSquareIcon className="w-5 h-5" />
                  {currentLanguage === "pt" ? "Falar com um agente" : currentLanguage === "en" ? "Talk to an agent" : "Hablar con un agente"}
                </Link>
              </div>
            </footer>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
