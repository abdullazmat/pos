"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  Fragment,
} from "react";

const SUPPORTED_LANGUAGES = ["es", "en", "pt"] as const;
type Language = (typeof SUPPORTED_LANGUAGES)[number];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, namespace?: string, options?: Record<string, any>) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Event emitter for language changes (ensures all components re-render)
type LanguageChangeListener = (language: Language) => void;
let listeners: Set<LanguageChangeListener> = new Set();

const notifyLanguageChange = (language: Language) => {
  listeners.forEach((listener) => listener(language));
};

export const subscribeToLanguageChange = (listener: LanguageChangeListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Comprehensive translations
const translationsEs = {
  common: {
    __locale__: "es-AR",
    language: "Idioma",
    spanish: "Español",
    english: "English",
    portuguese: "Português",
    darkMode: "Modo Oscuro",
    lightMode: "Modo Claro",
    theme: "Tema",
    palette: "Paleta",
    minimal: "Minimal",
    balanced: "Balanceado",
    vibrant: "Vibrante",
    apply: "Aplicar",
    settings: "Configuración",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    warning: "Advertencia",
    info: "Información",
    login: "Ingresar",
    logout: "Cerrar Sesión",
    register: "Registrarse",
    email: "Correo Electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    required: "Requerido",
    optional: "Opcional",
    features: "Características",
    pricing: "Precios",
    documentation: "Documentación",
    support: "Soporte",
    help: "Centro de Ayuda",
    contact: "Contacto",
    serviceStatus: "Estado del Servicio",
    back: "Volver",
    backToTop: "Volver al Inicio",
    legal: "Legal",
    terms: "Términos de Servicio",
    privacy: "Privacidad",
    allRightsReserved: "Todos los derechos reservados",
    // Global error handling
    somethingWentWrong: "Algo salió mal",
    unexpectedError:
      "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
    tryAgain: "Intentar de nuevo",
    goHome: "Ir al inicio",
    pageNotFound: "Página no encontrada",
    pageNotFoundDesc: "La página que buscas no existe o fue movida.",
    errorLoadingData: "Error al cargar los datos. Intenta nuevamente.",
    errorLoadingReports: "Error al cargar los reportes.",
    errorLoadingProducts: "Error al cargar los productos.",
    errorLoadingStock: "Error al cargar el inventario.",
    errorLoadingProfile: "Error al cargar el perfil.",
    errorLoadingCategories: "Error al cargar las categorías.",
    errorUnexpected: "Ocurrió un error inesperado en la aplicación.",
    // Navigation & Structure
    product: "Producto",
    company: "Empresa",
    aboutUs: "Sobre Nosotros",
    careers: "Carreras",
    contactSales: "Contactar Ventas",
    press: "Prensa",
    integrations: "Integraciones",
    security: "Seguridad",
    helpCenter: "Centro de Ayuda",
    tutorials: "Tutoriales",
    technicalDocs: "Documentación Técnica",
    contactSupport: "Contactar Soporte",
    startNow: "Empezar Ahora",
    home: "Inicio",
    // Descriptions
    featuresDesc: "Explorá todas las funcionalidades del POS",
    pricingDesc: "Planes que escalan con tu negocio",
    securityDesc: "Protección de nivel empresarial",
    // Footer
    footerDescription: "Sistema POS integral para comercios en Argentina. Gestión de ventas, inventario y facturación fiscal.",
    afipCompliant: "Compatible con AFIP / ARCA",
    // Tutorials
    tutorialsTitle: "Aprendé VentaPlus",
    tutorialsSubtitle: "Guías paso a paso para dominar cada funcionalidad. Desde la configuración inicial hasta reportes fiscales avanzados.",
    searchTutorials: "Buscar tutoriales...",
    needMoreHelp: "¿Necesitás más ayuda?",
    contactSupportDescription: "Nuestro equipo de soporte está listo para ayudarte con cualquier consulta sobre VentaPlus.",
    noResults: "Sin resultados",
    tryDifferentSearch: "Probá con otro término de búsqueda",
  },
  landing: {
    hero: {
      badge: "⭐ El sistema que tu negocio necesita",
      titleMain: "La base tecnológica para hacer",
      titleHighlight: "crecer tu negocio",
      titleLines: [
        "La base tecnológica",
        "para hacer crecer",
        "tu negocio",
      ],
      titleHighlightIndex: 2,
      description:
        "Ventas rápidas, control diario y facturación electrónica ARCA integrada en un sistema simple y moderno.",
      primaryCta: "Empezar",
      secondaryCta: "Ver cómo funciona",
    },
    modules: {
      module1: {
        title: "Velocidad de nivel supermercado",
        description: "Ventas rápidas, flujo ágil, diseñado para trabajar con teclado y escáner de códigos de barras.",
        image: "/images/new-features/new images/spanish/spanish POS page.png",
        features: [
          "Optimizado para teclado",
          "Escaneo de códigos de barra",
          "Ideal para momentos de alta demanda",
          "Sin demoras en caja"
        ]
      },
      module2: {
        title: "Control diario de ventas y caja",
        description: "Visualizá ingresos, gastos y ganancias en tiempo real con reportes automáticos.",
        image: "/images/new-features/new images/spanish/spanish Reports Page.png",
        features: [
          "Resumen diario automático",
          "Control de caja integral",
          "Márgenes de ganancia claros",
          "Cierre de caja en segundos"
        ]
      },
      module3: {
        title: "Organización total de tu negocio",
        description: "Gestión completa de stock, proveedores y gastos en una sola plataforma.",
        image: "/images/new-features/new images/spanish/spanish Product Management.png",
        features: [
          "Inventario automatizado",
          "Gestión de proveedores",
          "Control de gastos",
          "Alertas de stock bajo"
        ]
      },
      module4: {
        title: "Facturación electrónica ARCA",
        description: "Emití comprobantes fiscales (Factura A, B, C) integrados directamente con AFIP/ARCA.",
        image: "/images/new-features/new images/spanish/spanish Fiscal Reports - VAT.png",
        features: [
          "Integración nativa ARCA",
          "Notas de crédito automáticas",
          "Reportes impositivos listos",
          "Cumplimiento legal garantizado"
        ]
      }
    },
    finalCta: {
      title: "Prepará tu negocio para crecer",
      description: "Un sistema simple y listo para facturación fiscal, diseñado para el ritmo real del comercio.",
      primaryCta: "Crear cuenta gratis",
      secondaryCta: "Ver demostración"
    },
    cta: {
      title: "Listo para operar en mostrador",
      subtitle:
        "Pensado para kioscos, minimercados y atención en caja donde la velocidad importa.",
      startFreeNow: "Empezar Gratis Ahora →",
      noCard: "Sin tarjeta de crédito • Configuración en 2 minutos",
    },
    promoCta: {
      eyebrow: "Precios transparentes",
      title: "Planes diseñados para cada etapa de tu negocio",
      subtitle:
        "Empezá hoy mismo y profesionalizá tu gestión con VentaPlus.",
      primaryCta: "Ver planes",
    },
    pricingSection: {
      title: "Planes simples y escalables",
      subtitle:
        "Elegí el plan que mejor se adapte al tamaño de tu negocio. Todos los precios en Pesos Argentinos (ARS).",
      billingTitle: "Ciclo de facturación",
      billingMonthly: "Mensual",
      billingAnnual: "Anual",
      billingSavings: "Ahorrá con el pago anual",
      mostPopular: "Recomendado",
      cta: "Empezar ahora",
      plans: [
        {
          name: "Esencial",
          monthly: "$14.999",
          annual: "$12.999",
          caption: "ARS por mes",
          usage: "1 usuario • Hasta 500 productos",
          features: [
            "Punto de Venta (POS)",
            "Control de stock básico",
            "Gestión de gastos",
            "Sin facturación ARCA",
          ],
        },
        {
          name: "Profesional",
          monthly: "$29.999",
          annual: "$25.999",
          caption: "ARS por mes",
          usage: "Hasta 3 usuarios • Hasta 3.000 productos",
          features: [
            "Facturación ARCA incluida",
            "Notas de Crédito",
            "Gestión de Proveedores",
            "Cuentas Corrientes (Fiado)",
          ],
          featured: true,
        },
        {
          name: "Crecimiento",
          monthly: "$54.999",
          annual: "$46.999",
          caption: "ARS por mes",
          usage: "Hasta 10 usuarios • Hasta 10.000 productos",
          features: [
            "Reportes avanzados",
            "Soporte Prioritario",
            "Multi-depósito",
            "Capacitación inicial",
          ],
        },
      ],
    },
    supportSection: {
      eyebrow: "Soporte",
      title: "Estamos para ayudarte a crecer",
      subtitle:
        "VentaPlus ofrece múltiples canales de soporte para que tu negocio nunca se detenga.",
      items: [
        {
          title: "Centro de Ayuda con buscador",
          description:
            "Guías detalladas y tutoriales paso a paso para dominar cada función del sistema.",
        },
        {
          title: "WhatsApp Business Dedicado",
          description:
            "Soporte rápido y directo a través de nuestra línea oficial de WhatsApp.",
        },
        {
          title: "Email y Formulario de Contacto",
          description:
            "Atención personalizada para consultas administrativas y técnicas las 24 horas.",
        },
        {
          title: "Estado del Servicio",
          description:
            "Monitoreo en tiempo real de la conexión con ARCA y estabilidad de la plataforma.",
        },
      ],
    },
    testimonialsSection: {
      eyebrow: "Testimonios",
      title: "Lo que dicen nuestros clientes",
      subtitle:
        "Historias reales de comercios que crecen con VentaPlus en Argentina.",
      metricCaption: "Verificado en los últimos 90 días.",
      highlightLabel: "Destacado",
      highlightCaption:
        "Flujos integrados, listo para fiscal y permisos por equipo.",
      controls: {
        previous: "Testimonio anterior",
        next: "Siguiente testimonio",
        dotPrefix: "Ver testimonio de",
      },
      items: [
        {
          id: "darjeeling",
          quote:
            "En plena pandemia empezamos con planillas. Dos años después, VentaPlus nos ayudó a operar tres locales con la misma claridad del primer día.",
          name: "Lali Hernández",
          role: "Fundadora, Darjeeling Goods",
          location: "Rosario, AR",
          metricLabel: "Precisión de stock",
          metricValue: "98%",
          highlight: "Listo para multi-sucursal",
        },
        {
          id: "panaderia-central",
          quote:
            "Los cajeros aprendieron el flujo en una tarde. El cierre diario ahora es una rutina de 4 minutos y los márgenes por fin se ven claros.",
          name: "Matías Gutiérrez",
          role: "Operaciones, Panadería Central",
          location: "Córdoba, AR",
          metricLabel: "Cierre diario más rápido",
          metricValue: "4 min",
          highlight: "Márgenes claros",
        },
        {
          id: "almacen-norte",
          quote:
            "Desde comprobantes fiscales hasta alertas de stock, todo se siente conectado. Por fin confiamos en los números y podemos planificar compras con seguridad.",
          name: "Carmen Ibáñez",
          role: "Dueña, Almacén Norte",
          location: "Mendoza, AR",
          metricLabel: "Quiebres de stock",
          metricValue: "-42%",
          highlight: "Listo para fiscal",
        },
      ],
    },
    trustedDemo: {
      title: "Estas empresas ya confían en VentaPlus",
      demoTitle: "¿Te gustaría ver una demostración en vivo?",
      demoSubtitle: "Registrate con el formulario y reservá la fecha.",
      demoCta: "Quiero una demo",
      demoImageAlt: "Demo de VentaPlus",
    },
    businessInsights: {
      heroEyebrow: "Tu negocio está a un clic",
      heroTitle: "Entendé cómo está tu negocio en todo momento",
      heroSubtitle:
        "¿Querés ahorrar horas con un solo clic? VentaPlus simplifica la gestión, automatiza tareas y ordena procesos.",
      blocks: [
        {
          title: "Control de caja",
          subtitle: "Seguimiento de efectivo y bancos.",
          description:
            "Monitoreá aperturas/cierres, ventas diarias y saldos en tiempo real.",
          alt: "Panel de control de caja de VentaPlus",
        },
        {
          title: "Ventas y POS",
          subtitle: "Vendé rápido desde el punto de venta.",
          description:
            "Creá ventas en segundos, gestioná descuentos y aceptá efectivo, tarjeta o transferencia.",
          alt: "Pantalla de punto de venta de VentaPlus",
        },
        {
          title: "Gastos",
          subtitle: "Registrá compras y pagos.",
          description:
            "Seguí proveedores, vencimientos y categorías para ordenar el flujo de caja.",
          alt: "Pantalla de gastos de VentaPlus",
        },
        {
          title: "Stock",
          subtitle: "Controlá productos y depósitos.",
          description:
            "Gestioná productos, categorías, códigos y movimientos con trazabilidad total.",
          alt: "Pantalla de inventario de VentaPlus",
        },
        {
          title: "Información",
          subtitle: "Reportes fiscales y de gestión.",
          description:
            "Generá reportes de ventas, compras e IVA con resúmenes listos para contabilidad y AFIP/ARCA.",
          cta: "Ver más",
          alt: "Pantalla de reportes fiscales de VentaPlus",
        },
        {
          title: "Integraciones",
          subtitle: "Pagos y servicios fiscales conectados.",
          description:
            "Integrá facturación electrónica AFIP/ARCA y servicios fiscales para automatizar validaciones.",
          cta: "Ver más",
          alt: "Pantalla de integraciones de VentaPlus",
        },
      ],
      bottomEyebrow: "Confiado por equipos en crecimiento",
      bottomTitle: "Más de 2.500 negocios usan VentaPlus todos los días",
      bottomSubtitle:
        "Centralizá ventas, compras, stock y fiscal en una plataforma pensada para retail real.",
      bottomCta: "Empezar prueba gratis",
      bottomNote: "Sin tarjeta de crédito",
      bottomImageAlt: "Vista general de la plataforma VentaPlus",
    },
    posPreview: {
      alt: "Personal de minimercado usando POS",
      image: "/images/hero-es.png",
    },
    designSystem: {
      badge: "Sistema de diseño",
      title: "Paletas y motion de VentaPlus",
      subtitle:
        "Compará variaciones de color y micro-animaciones para una interfaz confiable y moderna.",
      paletteTitle: "Variaciones de color",
      paletteSubtitle:
        "Seleccioná la paleta que mejor exprese el tono de tu negocio.",
      motionTitle: "Micro-animaciones",
      motionDescription:
        "Interacciones sutiles para reforzar calidad sin distraer el flujo de venta.",
      cta: "Aplicar paleta",
      activeLabel: "Activa",
      tokens: {
        primary: "Primario",
        accent: "Acento",
        surface: "Superficie",
        text: "Texto",
      },
      variants: [
        {
          key: "minimal",
          label: "Minimalista",
          description:
            "Serena y discreta para ambientes de alta concentración.",
          traits: ["Bajo contraste", "Superficies limpias", "Foco en datos"],
        },
        {
          key: "balanced",
          label: "Balanceada",
          description: "Equilibrio entre modernidad y claridad operacional.",
          traits: ["Contraste medio", "Botones legibles", "Jerarquía clara"],
        },
        {
          key: "vibrant",
          label: "Vibrante",
          description: "Mayor energía para equipos dinámicos y retail rápido.",
          traits: ["Acentos vivos", "Feedback visible", "Marca protagonista"],
        },
      ],
      motionSamples: {
        primaryAction: "Acción principal",
        liveSync: "Sincronización",
        notification: "Notificación",
        notificationText: "Nueva venta aprobada",
        auto: "Auto",
        menu: "Menú",
        hover: "Hover",
        sales: "Ventas",
        reports: "Reportes",
        products: "Productos",
        cash: "Caja",
        note: "VentaPlus usa tech-blue como ancla de confianza y neutros suaves para mantener el foco.",
      },
    },
  },
  dashboard: {
    welcome: "Bienvenido",
    currentPlan: "Tu plan actual",
    planBasic: "Plan Básico (Prueba)",
    planEsencial: "Plan Esencial",
    planProfesional: "Plan Profesional",
    planCrecimiento: "Plan Crecimiento",
    upgradeToPro: "Mejorar Plan",
    status: "Estado",
    nextRenewal: "Próxima Renovación",
    posSale: "Venta POS",
    cashRegister: "Caja rápida",
    products: "Productos",
    inventory: "Gestionar inventario",
    reports: "Reportes",
    analytics: "Ver análisis",
    admin: "Admin",
    systemSettings: "Configuración del sistema",
    quickStats: "Estadísticas Rápidas",
    salesToday: "Ventas Hoy",
    totalRevenue: "Ingresos Totales",
  },
  errors: {
    generic: "Algo salió mal. Por favor intente de nuevo",
    unauthorized: "No autorizado",
    invalidOrExpiredToken: "Token inválido o expirado",
    missingAuthHeader: "Falta encabezado de autorización",
    forbidden: "Acceso denegado",
    notFound: "No encontrado",
    serverError: "Error del servidor",
    networkError: "Error de conexión",
    validationError: "Error de validación",
    productCodeRequired: "El código del producto es requerido",
    productNameRequired: "El nombre del producto es requerido",
    productPriceRequired: "El precio del producto es requerido",
    invalidPrice: "El precio debe ser un número válido",
    productCreated: "Producto creado correctamente",
    productUpdated: "Producto actualizado correctamente",
    productDeleted: "Producto eliminado correctamente",
    errorCreatingProduct: "Error al crear el producto",
    errorUpdatingProduct: "Error al actualizar el producto",
    errorDeletingProduct: "Error al eliminar el producto",
    errorFetchingProducts: "Error al obtener los productos",
    invalidEmail: "Correo electrónico inválido",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    userAlreadyExists: "El usuario ya existe",
    invalidCredentials: "Credenciales inválidas",
    orderNotFound: "Orden de compra no encontrada",
    onlyDraftSent: "Solo se pueden enviar órdenes en estado borrador",
    onlyDraftEdited: "Solo se pueden editar órdenes en estado borrador",
    orderStatusInvalid: "Esta orden no puede recibir ítems en su estado actual",
    orderAlreadyCancelled: "Esta orden ya ha sido recibida o cancelada",
    itemsRequired: "Se requiere al menos un ítem",
    sessionExpired: "Tu sesión ha expirado. Por favor inicia sesión nuevamente",
    errorSaving: "Error al guardar",
    errorLoading: "Error al cargar",
    errorDeleting: "Error al eliminar",
    noOpenCashRegister: "No hay caja abierta",
    invalidAction: "Acción inválida",
    invalidAmount: "Monto inválido",
    internalServerError: "Error interno del servidor",
    missingRequiredFields: "Faltan campos requeridos",
    errorLoadingConfig: "Error al cargar configuración",
    clientNameRequired: "Debes ingresar el nombre del cliente",
    cuitRequired: "CUIT es requerido para facturas ARCA",
    ivaTypeRequired: "Selecciona el tipo de IVA para facturas ARCA",
    companyNameRequired: "Nombre de la empresa es requerido",
    cuitRucDniRequired: "CUIT/RUC/DNI es requerido",
    billingEmailRequired: "Email de facturación es requerido",
    errorSavingSupplier: "Error al guardar proveedor",
    supplierDeletedSuccess: "Proveedor eliminado exitosamente",
    errorDeletingSupplier: "Error al eliminar proveedor",
    selectValidCSV: "Por favor selecciona un archivo CSV válido",
    emptyCSVFile: "El archivo CSV está vacío o no tiene datos",
    csvMustContainName: 'El CSV debe contener al menos la columna "nombre"',
    noValidSuppliersFound:
      "No se encontraron proveedores válidos en el archivo",
    errorProcessingCSV: "Error al procesar el archivo CSV",
    suppliersImportedSuccess: (count: number) =>
      `${count} proveedores importados exitosamente`,
    errorLoadingSales: "Error al cargar las ventas",
    errorRegisteringPurchase: "Error al registrar la compra",
    purchaseRegisteredSuccess: "¡Compra registrada exitosamente!",
    paymentError: "Error en el pago",
    errorCompletingSale: "Error al completar la venta",
    errorProcessingSale: "Error al procesar la venta. Intenta nuevamente",
    noDataToExport: "No hay datos para exportar",
    confirmDeleteExpense: "¿Estás seguro de eliminar este gasto?",
    productCodeExists: "El código del producto ya existe",
    emailInUse: "El correo electrónico ya está en uso",
    cannotDeleteSelf: "No puedes eliminarte a ti mismo",
    invalidPlanId: "Plan inválido",
    noFileReceived: "No se recibió ningún archivo",
    invalidFile: "Archivo inválido",
    errorImportingProducts: "Error al importar productos",
  },
  messages: {
    welcome: "Bienvenido",
    goodbye: "Hasta luego",
    confirmDelete: "¿Estás seguro de que deseas eliminar esto?",
    confirmAction: "¿Estás seguro?",
    processing: "Procesando...",
    loading: "Cargando...",
    noResults: "Sin resultados",
    noData: "Sin datos disponibles",
  },
  auth: {
    login: {
      title: "Ingresar",
      email: "Correo Electrónico",
      password: "Contraseña",
      submit: "Ingresar",
      forgotPassword: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tienes cuenta?",
      registerLink: "Registrarse",
    },
    forgotPassword: {
      title: "Recuperar Contraseña",
      subtitle:
        "Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña",
      email: "Correo Electrónico",
      submit: "Enviar Enlace de Recuperación",
      backToLogin: "Volver al inicio de sesión",
      emailSent: "Email enviado",
      emailSentMessage:
        "Si existe una cuenta con ese email, recibirás un enlace de recuperación",
    },
    resetPassword: {
      title: "Restablecer Contraseña",
      subtitle: "Ingresa tu nueva contraseña",
      password: "Nueva Contraseña",
      confirmPassword: "Confirmar Nueva Contraseña",
      submit: "Restablecer Contraseña",
      success: "Contraseña restablecida exitosamente",
      invalidToken: "El enlace de recuperación es inválido o ha expirado",
    },
    register: {
      title: "Registrarse",
      fullName: "Nombre Completo",
      email: "Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      submit: "Crear Cuenta",
      haveAccount: "¿Ya tienes una cuenta?",
      loginLink: "Ingresar",
    },
  },
  pricing: {
    title: "Planes en ARS",
    subtitle: "Elegí el nivel de potencia que tu comercio necesita",
    essential: "Plan Esencial",
    essentialPrice: "$14.999",
    pro: "Plan Profesional",
    proPrice: "$29.999",
    growth: "Plan Crecimiento",
    growthPrice: "$54.999",
    mostPopular: "Recomendado",
    startFree: "Empezar Gratis",
    tryFree: "Pruebalo Gratis",
  },
  subscriptionProModal: {
    titlePrefix: "Suscripción -",
    billingInfo: "Información de facturación",
    fields: {
      businessNameLabel: "Nombre de la Empresa",
      businessNamePlaceholder: "Nombre de tu empresa",
      cuitRucDniLabel: "CUIT/RUC/DNI",
      cuitRucDniPlaceholder: "20-12345678-9",
      billingEmailLabel: "Email de Facturación",
      billingEmailPlaceholder: "facturacion@tuempresa.com",
      phoneLabel: "Teléfono",
      phonePlaceholder: "011 1234-5678",
    },
    buttons: {
      continuePayment: "Continuar al Pago",
      processing: "Procesando...",
    },
  },
  navigation: {
    home: "Inicio",
    dashboard: "Panel de Control",
    products: "Productos",
    sales: "Ventas",
    customers: "Clientes",
    reports: "Reportes",
    settings: "Configuración",
    profile: "Perfil",
  },
  profile: {
    title: "Perfil",
    account: "Cuenta",
    loading: "Cargando perfil",
    personalInfo: "Información personal",
    userData: "Datos del usuario",
    updateDescription:
      "Actualiza tu nombre y correo. La contraseña es opcional.",
    goToDashboard: "Ir al panel",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono",
    phonePlaceholder: "Ej: +54 9 11 1234 5678",
    role: "Rol",
    businessName: "Nombre del negocio",
    businessPlaceholder: "Tu comercio",
    password: "Contraseña (opcional)",
    passwordPlaceholder: "Dejar en blanco para mantener",
    reset: "Restablecer",
    save: "Guardar cambios",
    updateSuccess: "Perfil actualizado correctamente",
    updateError: "No se pudo guardar. Intenta nuevamente.",
    updateErrorGeneric: "No se pudo actualizar el perfil",
    back: "Volver",
  },
  pos: {
    header: {
      tagline: "Punto de Venta en la Nube",
      cashRegisterOpen: "Caja Abierta",
    },
    nav: {
      posSale: "Punto de Venta",
      cashRegister: "Control de Caja",
      products: "Productos",
      categories: "Categorías",
      stock: "Stock",
      clients: "Clientes",
      suppliers: "Proveedores",
      goodsReceipts: "Recepción de Mercadería",
      supplierReturns: "Devoluciones a Proveedor",
      supplierDocuments: "Documentos de Proveedor",
      paymentOrders: "Órdenes de Pago",
      expenses: "Gastos",
      expenseAnalytics: "Inteligencia de Gastos",
      reports: "Reportes",
      fiscalReports: "Reportes Fiscales",
      users: "Usuarios",
      businessConfig: "Configuración de Negocio",
      planComparison: "Comparación de Planes",
      sales: "Ventas",
      purchaseOrders: "Órdenes de Compra",
    },
    salesPage: {
      title: "Historial de Ventas",
      subtitle: "Gestiona y visualiza todas tus ventas y comprobantes",
      tabList: "Lista de Ventas",
      tabAnalytics: "Analítica",
      dateFrom: "Fecha Desde",
      dateTo: "Fecha Hasta",
      paymentState: "Estado Pago",
      all: "Todos",
      completed: "Completadas",
      pending: "Pendientes",
      failed: "Fallidas",
      partial: "Parciales",
      search: "Buscar",
      loading: "Cargando...",
      noSalesFound: "No hay ventas para el período seleccionado",
      date: "Fecha",
      receipt: "Comprobante",
      seller: "Vendedor",
      amount: "Monto",
      method: "Método",
      status: "Estado",
      arca: "ARCA",
      actions: "Acciones",
      view: "Ver",
      retry: "Reintentar",
      retrying: "Reintentando...",
      noInvoice: "S/N",
      unknownUser: "Usuario",
      arcaApproved: "Aprobado",
      arcaPending: "Pendiente CAE",
      arcaRejected: "Rechazado",
      arcaCancelled: "Cancelado",
      totalSales: "Total de Ventas",
      totalRevenue: "Ingresos Totales",
      averageTicket: "Ticket Promedio",
      totalTax: "IVA Total 21%",
      byPaymentMethod: "Por Método de Pago",
      cash: "Efectivo",
      card: "Tarjeta",
      online: "Online",
      mercadopago: "Mercado Pago",
      checkPayment: "Cheque",
      qr: "QR",
      bankTransfer: "Transferencia",
      multiple: "Múltiple",
      byPaymentStatus: "Por Estado de Pago",
      retryCaeSuccess: "CAE obtenido exitosamente",
      retrySent: "Reintento enviado",
      retryError: "Error al reintentar factura",
      connectionError: "Error de conexión al reintentar",
      loadingPage: "Cargando ventas...",
      saleDetail: "Detalle de Venta",
      invoiceNumber: "Nº Comprobante",
      paymentMethod: "Método de Pago",
      paymentStatus: "Estado de Pago",
      arcaStatus: "Estado ARCA",
      arcaError: "Error ARCA",
      ivaType: "Tipo IVA",
      cae: "CAE",
      caeExpiry: "Vencimiento CAE",
      items: "Artículos",
      product: "Producto",
      qty: "Cant.",
      unitPrice: "Precio Unit.",
      itemDiscount: "Desc.",
      itemTotal: "Total",
      subtotal: "Subtotal",
      tax: "IVA",
      discount: "Descuento",
      total: "Total",
      close: "Cerrar",
      retryInvoice: "Reintentar Factura",
      noItems: "Sin artículos",
      channel: "Canal",
      createdAt: "Fecha Creación",
      notes: "Notas",
      arcaErrFacturaAConsumidorFinal:
        "Factura A no es válida para Consumidor Final. Solo se puede emitir entre Responsables Inscriptos.",
      arcaErrDocTipoInvalido:
        "El tipo de documento del receptor no es válido para este comprobante.",
      arcaErrCuitInvalido:
        "El CUIT del receptor es inválido o no se encuentra registrado.",
      arcaErrCbteDesde: "Error en la numeración del comprobante (CbteDesde).",
      arcaErrCbteHasta: "Error en la numeración del comprobante (CbteHasta).",
      arcaErrDuplicado:
        "Este comprobante ya fue autorizado previamente (duplicado).",
      arcaErrCertificado:
        "Error con el certificado digital. Verifique que esté vigente y correctamente configurado.",
      arcaErrTimeout:
        "La conexión con ARCA/AFIP agotó el tiempo de espera. Intente nuevamente.",
      arcaErrConexion:
        "No se pudo conectar con los servidores de ARCA/AFIP. Verifique su conexión.",
      arcaErrCancelada: "Esta factura fue cancelada manualmente.",
      arcaErrIvaObligatorio:
        "Si el importe neto es mayor a 0, el detalle de IVA es obligatorio. Verifique la configuración de impuestos.",
      arcaErrMontoTotal:
        "El monto total no coincide con la suma de los componentes. Verifique subtotal, IVA y descuentos.",
      arcaErrPtoVta:
        "El punto de venta no corresponde o no está habilitado para esta operación.",
      arcaErrFechaFueraRango:
        "La fecha del comprobante está fuera del rango permitido por AFIP.",
      arcaErrDocTipoMustBeCuit:
        "Factura A requiere CUIT del receptor (DocTipo 80). Se corrigió automáticamente a Factura B. Reintente.",
      arcaErrDocNroInvalido:
        "El número de documento del receptor es inválido. Verifique el CUIT ingresado.",
      arcaErrCondicionIvaReceptor:
        "La condición de IVA del receptor no es válida para este tipo de comprobante. Se corregirá automáticamente. Reintente.",
      arcaOriginalError: "Mensaje original",
      api_INVOICE_NOT_FOUND: "Factura no encontrada.",
      api_NOT_ARCA: "No es una factura ARCA.",
      api_ALREADY_AUTHORIZED: "Esta factura ya está autorizada.",
      api_CANCELLED_CANNOT_RETRY:
        "No se puede reintentar una factura cancelada. Cree una nueva venta.",
      api_NO_FISCAL_CONFIG: "Configuración fiscal no encontrada.",
      api_INCOMPLETE_FISCAL_CONFIG:
        "Configuración fiscal incompleta (certificado/clave/CUIT).",
      api_RETRY_FAILED: "Error al reintentar la factura. Intente nuevamente.",
      api_CAE_SUCCESS: "CAE obtenido exitosamente.",
      receiptUnavailable: "No se puede mostrar el comprobante para esta venta.",
      receiptBlocked_REJECTED:
        "El comprobante fue rechazado por ARCA/AFIP. No se puede imprimir hasta que se resuelva el problema.",
      receiptBlocked_CANCELED_BY_NC:
        "Esta venta fue cancelada mediante una nota de crédito. No se puede reimprimir.",
      receiptBlocked_CAE_REQUIRED:
        "Se requiere autorización CAE de AFIP para imprimir este comprobante. Reintente la factura primero.",
    },
    labels: {
      add: "Agregar",
      edit: "Editar",
      delete: "Eliminar",
      save: "Guardar",
      cancel: "Cancelar",
      search: "Buscar",
      filter: "Filtrar",
      sort: "Ordenar",
      import: "Importar",
      export: "Exportar",
      print: "Imprimir",
      actions: "Acciones",
      name: "Nombre",
      description: "Descripción",
      price: "Precio",
      code: "Código",
      quantity: "Cantidad",
      total: "Total",
      subtotal: "Subtotal",
      tax: "Impuesto",
      discount: "Descuento",
      payment: "Pago",
      customer: "Cliente",
      date: "Fecha",
      time: "Hora",
      status: "Estado",
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
      completed: "Completado",
      cancelled: "Cancelado",
    },
    messages: {
      confirmDelete: "¿Estás seguro de que deseas eliminar esto?",
      noData: "No hay datos disponibles",
      loading: "Cargando...",
      errorLoading: "Error al cargar datos",
      clientFetchError: "Error al cargar clientes",
      selectClient: "Seleccionar cliente...",
      noClients: "No hay clientes",
      clientsUpgradeRequired:
        "Búsqueda de clientes disponible solo en el plan Pro",
      errorCreating: "Error al crear elemento",
      errorUpdating: "Error al actualizar elemento",
      errorDeleting: "Error al eliminar elemento",
      successCreate: "Elemento creado exitosamente",
      successUpdate: "Elemento actualizado exitosamente",
      successDelete: "Elemento eliminado exitosamente",
      required: "Este campo es requerido",
      selectOne: "Por favor selecciona un elemento",
    },
    pages: {
      pos: {
        title: "Punto de Venta",
        noProducts: "No hay productos para vender",
        selectProduct: "Selecciona un producto",
        quantity: "Cantidad",
        addToCart: "Agregar al Carrito",
        cart: "Carrito",
        total: "Total",
        clearCart: "Limpiar Carrito",
        checkout: "Pagar",
        cash: "Efectivo",
        card: "Tarjeta",
        transfer: "Transferencia",
      },
      products: {
        title: "Productos",
        addProduct: "Agregar Producto",
        editProduct: "Editar Producto",
        deleteProduct: "Eliminar Producto",
        productCode: "Código del Producto",
        productName: "Nombre del Producto",
        description: "Descripción",
        price: "Precio",
        cost: "Costo",
        quantity: "Cantidad",
        category: "Categoría",
        supplier: "Proveedor",
        barcode: "Código de Barras",
      },
      categories: {
        title: "Categorías",
        addCategory: "Agregar Categoría",
        editCategory: "Editar Categoría",
        deleteCategory: "Eliminar Categoría",
        categoryName: "Nombre de Categoría",
        description: "Descripción",
      },
      stock: {
        title: "Stock",
        inventory: "Inventario",
        quantity: "Cantidad",
        alertLevel: "Nivel de Alerta",
        lastUpdate: "Última Actualización",
        adjustStock: "Ajustar Stock",
        stockHistory: "Historial de Stock",
      },
      clients: {
        title: "Clientes",
        addClient: "Agregar Cliente",
        editClient: "Editar Cliente",
        deleteClient: "Eliminar Cliente",
        name: "Nombre",
        email: "Email",
        phone: "Teléfono",
        address: "Dirección",
        city: "Ciudad",
        state: "Provincia",
        zipCode: "Código Postal",
        creditLimit: "Límite de Crédito",
        creditUsed: "Crédito Usado",
      },
      suppliers: {
        title: "Proveedores",
        addSupplier: "Agregar Proveedor",
        editSupplier: "Editar Proveedor",
        deleteSupplier: "Eliminar Proveedor",
        name: "Nombre",
        email: "Email",
        phone: "Teléfono",
        address: "Dirección",
        city: "Ciudad",
        state: "Provincia",
        contact: "Contacto",
      },
      expenses: {
        title: "Gastos",
        addExpense: "Agregar Gasto",
        editExpense: "Editar Gasto",
        deleteExpense: "Eliminar Gasto",
        description: "Descripción",
        amount: "Monto",
        category: "Categoría",
        date: "Fecha",
        paymentMethod: "Método de Pago",
      },
      reports: {
        title: "Reportes",
        salesReport: "Reporte de Ventas",
        stockReport: "Reporte de Stock",
        expensesReport: "Reporte de Gastos",
        clientsReport: "Reporte de Clientes",
        profitReport: "Reporte de Ganancias",
        dateRange: "Rango de Fechas",
        exportPDF: "Exportar a PDF",
        exportExcel: "Exportar a Excel",
        totalSales: "Total de Ventas",
        totalExpenses: "Total de Gastos",
        totalProfit: "Total de Ganancias",
      },
      cashRegister: {
        title: "Control de Caja",
        openCash: "Abrir Caja",
        closeCash: "Cerrar Caja",
        balance: "Balance",
        initialAmount: "Monto Inicial",
        finalAmount: "Monto Final",
        expected: "Esperado",
        actual: "Actual",
        difference: "Diferencia",
        cashRegisterId: "ID de Caja",
        openedBy: "Abierto por",
        closedBy: "Cerrado por",
        openTime: "Hora de Apertura",
        closeTime: "Hora de Cierre",
        status: "Estado",
        open: "Abierto",
        closed: "Cerrado",
        movements: {
          opening: "Apertura de caja",
          withdrawal: "Retiro de caja",
          creditNote: "Nota de crédito",
          noReason: "Sin motivo especificado",
        },
      },
    },
    ui: {
      loading: "Cargando POS...",
      title: "POS - {role}",
      closedTitle: "Caja Cerrada",
      closedDescription:
        'Debes abrir una caja desde la sección "Control de Caja" para comenzar a vender',
      scanPlaceholder: "Escanear o ingresar código de barras... (F6)",
      searchPlaceholder: "Buscar producto por nombre o código... (F5)",
      searching: "Buscando...",
      statusOnline: "En línea",
      statusSync: "Sync 0s",
      statusPrinter: "Impresora OK",
      tipsTitle: "Tips rápidos:",
      tipsBodyStart: "Usa el lector de barras o busca por nombre. Navega con",
      tipsBodyEnd: "y presiona",
      tipsBodyAdd: "para agregar.",
      startTyping: "Empezá a escribir para buscar",
      noProductsFound: "No se encontraron productos",
      codeLabel: "Código:",
      stockLabel: "Stock:",
      addButton: "Agregar",
      cartTitle: "Carrito",
      clearCart: "Limpiar Carrito",
      cartEmpty: "Carrito vacío",
      cartEmptySubtitle: "Escanea o busca productos para comenzar",
      remove: "Eliminar",
      quantity: "Cant.",
      discount: "Descuento",
      total: "Total",
      subtotal: "Subtotal",
      totalDiscount: "Descuento",
      tax21: "IVA 21%",
      discountLimitExceeded: "El descuento supera tu límite",
      discountInvalid: "Descuento inválido",
      discountNegative: "El descuento debe ser 0 o mayor",
      discountExceedsSubtotal:
        "El descuento no puede superar el subtotal de la línea",
      discountExceedsUserLimit: "El descuento supera tu límite",
      weightQuantityHint:
        "Use . para decimales y , para miles (ej.: 1.560 o 1,560)",
      paymentMethod: "Método de Pago",
      paymentOptions: {
        cash: "Efectivo",
        card: "Tarjeta",
        check: "Cheque",
        online: "Online",
        bankTransfer: "Transferencia Bancaria",
        qr: "Código QR",
        account: "Cuenta corriente",
      },
      accountLabel: "Cuenta",
      balanceLabel: "Saldo",
      balanceDueLabel: "Saldo pendiente",
      balanceCreditLabel: "Saldo a favor",
      viewAccount: "Ver cuenta",
      accountTitle: "Cuenta del cliente",
      registerPayment: "Registrar pago",
      paymentAmount: "Monto",
      paymentNote: "Detalle",
      savePayment: "Guardar pago",
      accountMovements: "Movimientos",
      noAccountMovements: "Sin movimientos",
      accountCharge: "Cargo",
      accountPayment: "Pago",
      accountAdjustment: "Ajuste",
      accountLoadError: "Error al cargar cuenta",
      accountPaymentSaved: "Pago registrado",
      accountPaymentError: "Error al registrar pago",
      accountRequiresClient: "Selecciona un cliente para cobrar a cuenta",
      accountInvalidAmount: "Monto inválido",
      accountOverpayError: "El pago supera el saldo pendiente",
      processing: "Procesando...",
      checkout: "Finalizar Venta",
      checkoutSuccess: "¡Venta completada exitosamente!",
      checkoutError: "Error al completar la venta",
      checkoutProcessError: "Error al procesar la venta. Intenta nuevamente.",
      insufficientStock:
        "Stock insuficiente para {name}. Disponible: {available}, solicitado: {requested}",
      // Sale error codes (from API errorCode)
      cuitRequiredRI: "CUIT es obligatorio para Responsable Inscripto",
      cuitInvalidFormat: "El CUIT debe tener 11 dígitos",
      saleErr_NO_ITEMS: "Agrega productos al carrito antes de vender",
      saleErr_CUSTOMER_NAME_REQUIRED: "El nombre del cliente es obligatorio",
      saleErr_IVA_TYPE_REQUIRED: "Selecciona el tipo de IVA para facturas ARCA",
      saleErr_CUIT_REQUIRED_RI:
        "CUIT es obligatorio para Responsable Inscripto",
      saleErr_CUIT_INVALID_FORMAT: "El CUIT debe tener 11 dígitos",
      saleErr_REGISTER_NOT_OPEN: "La caja registradora no está abierta",
      saleErr_INVALID_QUANTITY: "Cantidad inválida",
      saleErr_QUANTITY_ZERO: "La cantidad debe ser mayor a 0",
      saleErr_PRODUCT_NOT_FOUND: "Producto no encontrado",
      saleErr_INSUFFICIENT_STOCK: "Stock insuficiente",
      saleErr_INVALID_DISCOUNT: "Descuento inválido",
      saleErr_DISCOUNT_NEGATIVE: "El descuento debe ser 0 o mayor",
      saleErr_DISCOUNT_EXCEEDS_LINE:
        "El descuento no puede superar el subtotal de la línea",
      saleErr_DISCOUNT_EXCEEDS_LIMIT: "El descuento supera tu límite",
      saleErr_DISCOUNT_EXCEEDS_SUBTOTAL:
        "El descuento no puede superar el subtotal",
      saleErr_PRICE_MISMATCH: "El precio del producto no coincide",
      saleErr_USER_NOT_FOUND: "Usuario no encontrado",
      saleErr_MERCADOPAGO_FAILED: "Error al procesar pago con Mercado Pago",
      saleErr_SERVER_ERROR: "Error interno del servidor. Intenta nuevamente.",
      // POS receipt modal labels
      paymentAccount: "Cuenta corriente",
      finalConsumer: "Consumidor Final",
      arcaRespondedOk: "ARCA respondió OK",
      pendingCaeRetry: "Pendiente de CAE — se reintentará automáticamente",
      arcaNotResponding: "ARCA no responde",
      invoiceTypeLabel: "Tipo Factura:",
      internalNonFiscal: "Interna (No Fiscal)",
      arcaFiscalInvoice: "ARCA (Factura Fiscal)",
      optional: "Opcional",
      vatTypeLabel: "Tipo IVA",
      registeredTaxpayer: "Responsable Inscripto",
      monotributista: "Monotributista",
      vatExempt: "Exento de IVA",
      uncategorizedIva: "No Categorizado",
      salesReceipt: "Recibo de Venta",
      cashRegisterStatusError: "Error al cargar estado de caja",
      businessConfigError: "Error al cargar configuración del negocio",
      provisionalDocType: "COMPROBANTE PROVISIONAL",
      provisionalPendingCae: "COMPROBANTE PROVISIONAL — PENDIENTE DE CAE",
      budgetNotValidAsInvoice: "PRESUPUESTO — NO VÁLIDO COMO FACTURA",
      documentTypeLabel: "Tipo de documento:",
      numberingLabel: "Numeración:",
      pendingStatus: "Pendiente...",
      caeExpirationLabel: "Vto. CAE:",
      fiscalQrLabel: "QR Fiscal:",
      yes: "Sí",
      pendingSingle: "Pendiente",
      fiscalValidityLabel: "Validez fiscal:",
      validOnceApproved: "Válido una vez aprobado",
      usageLabel: "Uso:",
      printBehaviorLabel: "Impresión:",
      editingLabel: "Edición:",
      taxLabel: "Impuesto (21%):",
      print: "Imprimir",
      close: "Cerrar",
      roles: {
        admin: "Administrador",
        supervisor: "Supervisor",
        cashier: "Cajero",
        user: "Usuario",
      },
      // Keyboard POS translations
      keyboardPOS: "POS con Teclado",
      quantityFirst: "Ingrese cantidad primero, luego código del producto",
      productCodeBarcode: "Código de Producto / Código de Barras",
      scanOrEnterCode: "Escanear o ingresar código...",
      pressEnterToAdd: "Presione Enter para agregar • Esc para cancelar",
      keyboardShortcuts: "Atajos de Teclado",
      confirmAdd: "Confirmar / Agregar",
      cancel: "Cancelar / Limpiar",
      multiplier: "Multiplicador (50*código)",
      changeCustomer: "Cambiar cliente",
      findCustomer: "Buscar cliente",
      newCustomer: "Nuevo cliente",
      removeCustomer: "Quitar cliente",
      examples: "Ejemplos",
      example1:
        "Escriba '5' → Enter → Escanee/Ingrese código → Enter = 5 unidades",
      example2: "Escriba '0.325' → Enter → Escanear = 0.325 kg",
      example3:
        "Escriba '50*697202601252361' → Enter = 50 unidades instantáneamente",
      quantityHint: "Ingrese cantidad o use multiplicador: 50*código",
      enterProductCode: "Por favor ingrese un código de producto",
      invalidQuantity: "Cantidad inválida",
      productNotFound: "Producto no encontrado",
      outOfStock: "Producto sin stock",
      addedToCart: "agregado al carrito",
      errorAddingProduct: "Error al agregar producto",
      changeCustomerType: "Cambiar tipo de cliente",
      searchCustomer: "Buscar cliente",
      advancedSearch: "Búsqueda Avanzada",
      clickToExpand: "Haga clic para expandir",
      fiscalComparison: {
        title: "Recibo Provisorio vs Factura Fiscal",
        subtitle:
          "El tipo de comprobante es automático. Los cajeros no pueden elegirlo manualmente.",
        feature: "Característica",
        provisionalReceipt: "Recibo Provisorio (Presupuesto)",
        fiscalInvoice: "Factura Fiscal (A / B)",
        documentType: "Tipo de Documento",
        documentTypeBudget: "PRESUPUESTO",
        documentTypeFiscal: "FACTURA A / FACTURA B",
        numbering: "Numeración",
        numberingInternal: "Interna (ej., 01-003)",
        numberingFiscal: "ARCA / fiscal (ej., 0001-00001234)",
        caeExpiration: "CAE y Vencimiento",
        no: "No",
        yes: "Sí",
        fiscalQR: "QR Fiscal",
        fiscalValidity: "Validez fiscal",
        notValid: "No válido",
        validOnceApproved: "Válido una vez aprobado",
        usage: "Uso",
        contingencyBackup: "Contingencia / Respaldo",
        finalLegalDocument: "Documento legal definitivo",
        whenPrinted: "Cuándo se imprime",
        arcaNoResponse: "ARCA no responde",
        arcaRespondsOK: "ARCA responde OK",
        editing: "Edición",
        notEditable: "No editable",
        editableCreditNotes: "Editable solo para notas de crédito",
        quickSummaryTitle: "Resumen Visual Rápido",
        summaryProvisional:
          "Provisorio = respaldo temporal, sin validez fiscal",
        summaryFiscal: "Fiscal = documento legal definitivo",
        summaryNeverPrints: "La factura fiscal nunca se imprime sin CAE",
        summaryCorrections: "Correcciones solo vía Nota de Crédito",
      },
    },
    ai: {
      common: {
        lockedTitle: "Análisis Inteligente Bloqueado",
        upgradeNow: "Actualizar Ahora",
      },
      rankings: {
        title: "Ranking Inteligente y Análisis de Stock",
        lockedDesc: "El ranking avanzado de productos y el análisis de estancamiento están disponibles en el Plan PRO.",
        bestSellers: "Más Vendidos (30d)",
        mostProfitable: "Mayor Ingreso (30d)",
        stagnantProducts: "Productos Estancados",
        noStagnant: "No se detectaron productos estancados.",
        inStock: "{count} en stock",
        noSalesThirty: "0 ventas en 30 días",
        strategyTitle: "Estrategia Recomendada",
        strategyDesc: "Basado en tus productos estancados, tienes aproximadamente {amount} en capital inmovilizado. Te sugerimos realizar una promoción o descuento especial para estos artículos y liberar flujo de caja.",
        units: "uts",
      },
      forecast: {
        lockedDesc: "Las proyecciones basadas en IA están disponibles exclusivamente para usuarios PRO.",
        title: "Proyección de Ventas (IA Ligera)",
        sevenDays: "Pronóstico 7 Días",
        thirtyDays: "Pronóstico 30 Días",
        trend: "Tendencia",
        trendUp: "Alcista",
        trendDown: "Bajista",
        trendStable: "Estable",
        disclaimer: "* Basado en el comportamiento de ventas de las últimas 4 semanas.",
        howItWorksTitle: "¿Cómo funciona?",
        howItWorksDesc: "Nuestra IA ligera analiza tus patrones de venta históricos, otorgando mayor peso a los días más recientes. Este pronóstico te ayuda a planificar tus compras y flujos de caja con mayor precisión.",
        chartTitle: "Gráfico de Proyección y Tendencia",
      },
      insights: {
        title: "IA Business Insights",
        subtitle: "Explora oportunidades de crecimiento y alertas de stock.",
        empty: "No se encontraron insights en este momento. Sigue vendiendo para que la IA detecte patrones.",
        stockOutTitle: "Stock Crítico: {name}",
        stockOutDesc: "Tu producto estrella se está agotando. Repón stock para no perder ventas.",
        createOrder: "Crear Orden",
        marginTitle: "Oportunidad de Margen: {name}",
        marginDesc: "Este producto tiene un margen del {margin}%. Considera promocionarlo para aumentar ganancias.",
        viewProduct: "Ver Producto",
        crossSellTitle: "Sugerencia: {p1} + {p2}",
        crossSellDesc: "Los clientes suelen comprar estos productos juntos. Crea un combo para incentivar la venta.",
        seePromos: "Ver Promociones",
        lockedCardTitle: "IA Business Insights",
        lockedCardDesc: "Tus datos comerciales analizados con IA.",
        lockedCardBadge: "PRO",
        lockedCardTeaser: "Desbloquea análisis predictivos, alertas de stock inteligente y recomendaciones de venta para maximizar tus ganancias.",
        lockedCardButton: "Actualizar a PRO",
        growthTitle: "Crecimiento en Ventas",
        growthDesc: "Tus ingresos subieron un {growth}% esta semana comparado con la anterior. ¡Buen trabajo!",
      },
      crossSell: {
        title: "Sugerencias de Venta",
        desc: "Clientes que compraron esto también llevaron...",
        add: "Agregar",
        loading: "Buscando sugerencias...",
      }
    },
    receipt: {
      date: "Fecha:",
      time: "Hora:",
      items: "Artículos",
      noItems: "Sin artículos",
      subtotal: "Subtotal:",
      discount: "Descuento:",
      total: "Total:",
      paymentMethod: "Método de Pago:",
      print: "Imprimir",
      close: "Cerrar",
    },
  },
  purchaseOrders: {
    title: "Órdenes de Compra",
    subtitle: "Gestiona tus compras con inteligencia artificial",
    newOrder: "Nueva Orden",
    stats: { total: "Total", draft: "Borrador", sent: "Enviada", partial: "Parcial", received: "Recibida", cancelled: "Cancelada" },
    filters: { searchPlaceholder: "Buscar por número o proveedor...", allStatuses: "Todos los estados" },
    table: { number: "Número", supplier: "Proveedor", date: "Fecha", status: "Estado", items: "Items", totalEst: "Total Est.", actions: "Acciones", send: "Enviar", receive: "Recibir", noOrders: "Sin órdenes de compra", noOrdersSubtitle: "Crea tu primera orden con sugerencias inteligentes", code: "Código" },
    create: { title: "Nueva Orden de Compra", subtitle: "Usa sugerencias IA o agrega productos manualmente", generalInfo: "Información General", supplier: "Proveedor *", selectSupplier: "Seleccionar proveedor", deliveryDate: "Entrega Estimada", warehouse: "Almacén / Sucursal", warehousePlaceholder: "Sucursal Principal", notes: "Notas", notesPlaceholder: "Notas opcionales", aiSuggestions: "Sugerencias Inteligentes", coverage: "Cobertura:", days: "{count} días", generate: "Generar", analyzing: "Analizando...", suggestedProducts: "{count} productos sugeridos", addAll: "+ Agregar todos", manualAdd: "Agregar Manual", selectProduct: "Seleccionar producto", quantity: "Cantidad", cost: "Costo", add: "Agregar", summary: "Resumen", totalUnits: "Unidades", totalEstimated: "Total Estimado", createButton: "Crear Orden", unitAbr: "uds", aiPill: "IA", noSuggestions: "No se encontraron sugerencias para este proveedor.", noSuggestionsSubtitle: "Vincular productos a este proveedor o registrar más ventas ayudará a la IA.", unlinkedWarning: "Este producto no está vinculado a este proveedor.", autoLinkCheckbox: "Vincular producto al proveedor (guardar costo y lead time)" },
    detail: { back: "Volver", orderNumber: "Orden #", receivedAt: "Recibida el", cancelledAt: "Cancelada el", finalTotal: "Total Final", requested: "Solicitado", received: "Recibido", costEst: "Costo Est.", costFinal: "Costo Final", subtotal: "Subtotal", receiveAction: "Registrar Recepción" },
    reception: { title: "Recepción", subtitle: "Registre cantidades recibidas y costos finales", alreadyReceived: "Ya Recibido", receiveNow: "Recibir Ahora", confirm: "Confirmar Recepción" },
    priorities: { critical: "Crítico", high: "Alto", medium: "Medio", low: "Bajo" },
    toasts: { alreadyAdded: "Producto ya agregado", added: "{name} agregado", addedMany: "{count} productos agregados", created: "Orden de compra creada exitosamente", sent: "Orden enviada", received: "Recepción registrada exitosamente", cancelled: "Orden cancelada", error: "Error al procesar la solicitud" },
    reasons: {
      noStock: "⚠️ Sin stock - Reposición urgente",
      criticalStock: "⚠️ Stock crítico ({days} días restantes)",
      lowStock: "🔶 Stock bajo - cubrirá {days} días",
      recommended: "📊 Reposición recomendada",
      preventive: "✅ Reposición preventiva",
      growingTrend: "📈 Tendencia creciente (+{percent}%)",
      decliningTrend: "📉 Tendencia decreciente ({percent}%)",
      dailySales: "Venta diaria: {amount} {unit}",
      noRotation: "📦 Reposición inicial (sin ventas registradas)"
    },
  },
  featuresPage: {
    hero: {
      eyebrow: "Producto",
      title: "Toda la potencia de VentaPlus en una sola plataforma",
      subtitle: "Gestioná cada aspecto de tu retail con módulos integrados y diseñados para la velocidad.",
      primaryCta: "Empezar ahora",
      secondaryCta: "Ver planes"
    },
    sections: [
      {
        id: "pos",
        title: "Punto de Venta (POS)",
        description: "Optimizado para la velocidad en mostrador. Compatible con teclado numérico y escáner de códigos de barras.",
        image: "/images/new-features/new images/spanish/spanish POS page.png",
        items: [
          "Atajos de teclado para máxima velocidad",
          "Búsqueda instantánea de productos",
          "Soporte para múltiples medios de pago",
          "Tickets y facturas en segundos"
        ]
      },
      {
        id: "reports",
        title: "Control de Ventas y Ganancias",
        description: "Visualizá tus márgenes de ganancia y ventas diarias de forma clara y automática.",
        image: "/images/new-features/new images/spanish/spanish Reports Page.png",
        items: [
          "Cálculo de rentabilidad automática",
          "Reportes de ventas por período",
          "Control de arqueos de caja",
          "Estadísticas de productos más vendidos"
        ]
      },
      {
        id: "inventory",
        title: "Gestión Automática de Inventario",
        description: "Cada venta descuenta stock automáticamente. Olvida las planillas manuales.",
        image: "/images/new-features/new images/spanish/spanish Category Management.png",
        items: [
          "Alertas de stock crítico",
          "Actualización masiva vía CSV",
          "Categorización inteligente",
          "Historial de movimientos"
        ]
      },
      {
        id: "suppliers",
        title: "Gestión de Proveedores",
        description: "Centralizá tus compras y mantené un registro de cuentas corrientes con tus proveedores.",
        image: "/images/new-features/new images/spanish/spanish Supplier Management.png",
        items: [
          "Directorio de proveedores completo",
          "Registro de facturas de compra",
          "Aviso de vencimientos de facturas",
          "Historial de precios de compra"
        ]
      },
      {
        id: "expenses",
        title: "Control de Gastos",
        description: "Registrá tus costos operativos y gastos fijos para un balance neto real.",
        image: "/images/new-features/new images/spanish/spanish expenses.png",
        items: [
          "Categorización de gastos",
          "Impacto directo en ganancias",
          "Adjunto de comprobantes",
          "Reporte de gastos mensuales"
        ]
      },
      {
        id: "fiscal",
        title: "Facturación Electrónica ARCA",
        description: "Emisión de comprobantes fiscales A, B y C directamente conectados con AFIP.",
        image: "/images/new-features/new images/spanish/spanish Fiscal Reports - VAT.png",
        items: [
          "Obtención de CAE instantánea",
          "Notas de Crédito y Débito",
          "Configuración simple de certificados",
          "Exportación para Libro IVA Digital"
        ]
      },
      {
        id: "security",
        title: "Roles y Seguridad",
        description: "Asigná permisos específicos para cajeros, administradores y dueños.",
        image: "/images/new-features/new images/spanish/spanish User Management.png",
        items: [
          "Roles personalizables",
          "Historial de acciones por usuario",
          "Restricción de funciones críticas",
          "Acceso seguro desde cualquier lugar"
        ]
      }
    ],
    otherFeatures: {
      title: "Diseñado para el comercio real",
      items: [
        { 
          title: "Soporte WhatsApp", 
          description: "Atención dedicada para resolver tus dudas rápidamente.", 
          icon: "phone" 
        },
        { 
          title: "Sin Instalaciones", 
          description: "Accedé desde cualquier navegador sin configuraciones complejas.", 
          icon: "cloud" 
        },
        { 
          title: "Estado del Servicio", 
          description: "Seguimiento en tiempo real de la conectividad con ARCA.", 
          icon: "activity" 
        }
      ]
    }
  },
  integrationsPage: {
    hero: {
      eyebrow: "Integraciones",
      title: "Conectado con el ecosistema de tu negocio",
      subtitle: "VentaPlus se integra con las herramientas que ya usas para automatizar procesos fiscales, pagos y gestión.",
    },
    arcaSection: {
      title: "ARCA / AFIP",
      badge: "Integración Activa",
      description: "Conexión directa con el fisco argentino para emisión de facturas electrónicas y cumplimiento legal automático.",
      features: [
        "Solicitud y asignación de CAE automática",
        "Facturas A, B y C integradas",
        "Notas de Crédito y Débito fiscales",
        "Gestión de certificados digitales",
        "Sincronización en tiempo real con ARCA",
        "Libro de IVA Digital integrado",
      ],
      cta: "Ver Tutoriales ARCA",
      visual: {
        authorized: "Autorizado",
        amount: "Importe",
        iva: "IVA (21%)",
        cae: "CAE",
      }
    },
    otherIntegrations: {
      title: "Más integraciones para potenciarte",
      comingSoon: "Próximamente",
      suggestTitle: "¿Necesitas otra integración?",
      suggestDesc: "Estamos trabajando para agregar nuevas herramientas. Si usas algo específico, cuéntanos.",
      suggestCta: "Sugerir Integración",
      categories: {
        payments: "Pagos",
        logistics: "Logística",
        marketing: "Marketing",
      },
      items: [
        {
          name: "Mercado Pago",
          category: "payments",
          description: "Cobros con QR y link de pago sincronizados automáticamente con tu caja.",
          status: "active"
        },
        {
          name: "MODO",
          category: "payments",
          description: "Acepta pagos de todas las billeteras bancarias con una sola integración.",
          status: "coming_soon"
        },
        {
          name: "Andreani",
          category: "logistics",
          description: "Generación de etiquetas y seguimiento de envíos directo desde el pedido.",
          status: "coming_soon"
        },
        {
          name: "WhatsApp",
          category: "marketing",
          description: "Envío automático de comprobantes y notificaciones de stock por chat.",
          status: "active"
        }
      ]
    }
  },
  helpPage: {
    hero: {
      title: "¿Cómo podemos ayudarte?",
      subtitle: "Buscá guías, tutoriales y respuestas a tus preguntas sobre VentaPlus.",
      searchPlaceholder: "Buscar ayuda...",
    },
    categories: {
      title: "Explorar por categoría",
      items: [
        { id: "getting-started", title: "Primeros Pasos", desc: "Primeros pasos para configurar tu cuenta y empezar a vender.", icon: "rocket", count: 5 },
        { id: "arca-invoicing", title: "Facturación ARCA", desc: "Facturación electrónica con cumplimiento ARCA/AFIP.", icon: "file-text", count: 8 },
        { id: "pos", title: "Punto de Venta / Caja", desc: "Domina la interfaz de venta y la gestión de caja.", icon: "monitor", count: 12 },
        { id: "inventory", title: "Gestión de Inventario", desc: "Control de stock, categorías y gestión de productos.", icon: "package", count: 10 },
        { id: "subscriptions", title: "Suscripciones", desc: "Gestiona tu suscripción a VentaPlus y facturación.", icon: "credit-card", count: 4 },
        { id: "payment-orders", title: "Órdenes de Pago", desc: "Crea y gestiona órdenes de pago para proveedores.", icon: "banknote", count: 6 },
        { id: "suppliers", title: "Proveedores", desc: "Gestión de proveedores, compras y devoluciones.", icon: "truck", count: 7 },
        { id: "customers", title: "Clientes", desc: "Base de datos de clientes, ventas a cuenta corriente.", icon: "users", count: 5 },
        { id: "expenses", title: "Gastos", desc: "Seguimiento y gestión de gastos del negocio.", icon: "percent", count: 4 },
        { id: "fiscal-reports", title: "Reportes Fiscales", desc: "Genera y comprende reportes fiscales e impositivos.", icon: "bar-chart", count: 9 },
        { id: "initial-config", title: "Configuración Inicial", desc: "Configuración del negocio, impuestos y preferencias.", icon: "settings", count: 6 }
      ]
    },
    popular: {
      title: "Artículos populares",
      items: [
        { title: "Cómo configurar mi primer producto", link: "#" },
        { title: "Atajos de teclado en el POS", link: "#" },
        { title: "Conexión con ARCA (Paso a paso)", link: "#" },
        { title: "Realizar un arqueo de caja", link: "#" },
        { title: "Importar stock desde Excel", link: "#" },
      ]
    },
    cta: {
      title: "¿No encontrás lo que buscás?",
      subtitle: "Nuestro equipo de soporte está listo para darte una mano.",
      button: "Contactar Soporte",
    }
  },
  documentationPage: {
    sidebar: {
      basics: "Conceptos Básicos",
      intro: "Introducción",
      auth: "Autenticación",
      architecture: "Arquitectura",
      api: "Referencia de API",
      products: "Productos",
      sales: "Ventas",
      inventory: "Inventario",
      webhooks: "Webhooks",
      security: "Seguridad y Privacidad",
    },
    hero: {
      badge: "Documentación Técnica",
      title: "Construí con la API de VentaPlus",
      subtitle: "Nuestra plataforma está diseñada para ser extendida. Integrá tu negocio con bibliotecas modernas y una API REST robusta.",
    }
  },
  statusPage: {
    title: "Estado del Sistema",
    subtitle: "Monitoreo en tiempo real de nuestros servicios principales y conectividad fiscal.",
    summary: {
      operational: "Todos los sistemas operativos",
      maintenance: "Mantenimiento programado",
      partial: "Interrupción parcial",
      outage: "Interrupción mayor"
    },
    components: {
      api: "API de Producción",
      dashboard: "Panel Web",
      pos: "Terminal Punto de Venta",
      arca: "Integración ARCA/AFIP",
      database: "Base de Datos Principal"
    },
    uptime: "Uptime (últimos 90 días)",
    history: "Historial de Incidentes",
    noIncidents: "No se registraron incidentes en este periodo.",
    lastUpdate: "Última actualización",
    live: "Estado en Vivo",
    ninetyDaysAgo: "Hace 90 días",
    today: "Hoy",
    cta: {
      title: "¿Sigues teniendo problemas?",
      description: "Nuestro equipo de ingeniería de emergencia está disponible 24/7 para suscriptores del plan Pro.",
      button: "Contactar Soporte"
    }
  },
  securityPage: {
    hero: {
      badge: "Seguridad",
      title: "Tus datos son nuestra máxima prioridad",
      description: "VentaPlus está construido con seguridad de nivel empresarial desde cero. Protegemos tus datos comerciales con prácticas de cifrado, autenticación e infraestructura líderes en la industria."
    },
    features: {
      encryption: {
        title: "Cifrado de Datos",
        description: "Todos los datos se cifran en tránsito (TLS 1.3) y en reposo (AES-256). Tu información comercial siempre está protegida."
      },
      auth: {
        title: "Autenticación Segura",
        description: "Autenticación estándar de la industria con hashing de contraseñas seguro (bcrypt) y gestión de sesiones avanzada."
      },
      infrastructure: {
        title: "Infraestructura Cloud",
        description: "Alojado en infraestructura de nube de nivel empresarial con escalado automático, redundancia y SLA de tiempo de actividad del 99.9%."
      },
      backups: {
        title: "Copias de Seguridad",
        description: "Tus datos se respaldan automáticamente de forma continua. La recuperación en un punto en el tiempo garantiza que nada se pierda."
      },
      access: {
        title: "Control de Acceso",
        description: "Controles de permisos detallados para garantizar que el equipo solo acceda a lo necesario. Roles de dueño, admin y cajero."
      },
      audit: {
        title: "Registros de Auditoría",
        description: "Rastro de auditoría completo de todas las operaciones del sistema. Rastrea quién hizo qué y cuándo para una total transparencia."
      }
    },
    compliance: {
      title: "Cumplimiento Normativo",
      description: "VentaPlus cumple plenamente con las regulaciones fiscales argentinas y los estándares de protección de datos.",
      arcaTitle: "ARCA / AFIP",
      arcaDesc: "Cumplimiento total con las regulaciones de facturación electrónica argentina y requisitos fiscales.",
      pdTitle: "Protección de Datos",
      pdDesc: "Los datos de clientes y del negocio se manejan según las leyes de protección de datos personales de Argentina (Ley 25.326)."
    },
  },
  tutorialsPage: {
    hero: {
      breadcrumbHome: "Inicio",
      breadcrumbTutorials: "Tutoriales",
      badge: "Aprendé VentaPlus",
      title: "Tutoriales y Guías",
      subtitle: "Todo lo que necesitás para dominar las operaciones de tu negocio. Buscá respuestas y tutoriales paso a paso.",
      searchPlaceholder: "Buscar tutoriales..."
    },
    noResults: {
      title: "No se encontraron tutoriales",
      subtitle: "Intentá con otro término de búsqueda"
    },
    cta: {
      title: "¿No encontrás lo que buscás?",
      subtitle: "Nuestro equipo de soporte está disponible por chat y email para ayudarte con cualquier duda específica.",
      button: "Contactar Soporte"
    }
  },
  contactPage: {
      hero: {
        eyebrow: "Contacto",
        title: "Estamos acá para impulsarte",
        subtitle: "Hablá con nuestro equipo de expertos sobre cómo VentaPlus puede transformar la gestión de tu comercio.",
        badges: {
          response: "Respuesta en 24h",
          secure: "Datos seguros",
          argentina: "Equipo argentino"
        }
      },
      form: {
        title: "Envianos un mensaje",
        subtitle: "Te responderemos a la brevedad",
        name: "Nombre completo",
        namePlaceholder: "Ingresá tu nombre",
        email: "Correo electrónico",
        emailPlaceholder: "tu@ejemplo.com",
        phone: "Teléfono (opcional)",
        phonePlaceholder: "+54 9 11 ...",
        subject: "Asunto",
        subjectPlaceholder: "Seleccioná un tema",
        message: "Mensaje",
        messagePlaceholder: "¿En qué podemos ayudarte?",
        submit: "Enviar mensaje",
        sending: "Enviando...",
        successTitle: "¡Mensaje enviado!",
        successMessage: "Gracias por contactarnos. Un miembro de nuestro equipo te responderá pronto.",
        sendAnother: "Enviar otro mensaje",
        errors: {
          required: "Requerido",
          invalidEmail: "Email inválido"
        },
        subjectOptions: [
          "Ventas / Nuevos Planes",
          "Soporte Técnico",
          "Facturación / Pagos",
          "Prensa / Partners",
          "Otro"
        ]
      },
      info: {
        title: "Información de contacto",
        items: [
          { icon: "mail", title: "Email", description: "Soporte general", value: "soporte@ventaplus.com" },
          { icon: "phone", title: "Teléfono", description: "Lunes a Viernes 9-18h", value: "+54 11 5555-0123" },
          { icon: "location", title: "Oficinas", description: "Nuestro centro técnico", value: "Palermo, CABA, Argentina" }
        ]
      },
      demo: {
        title: "¿Preferís una demo en vivo?",
        subtitle: "Agendá una sesión de 20 minutos con nuestro equipo.",
        button: "Agendar demo"
      },
      ready: {
        title: "¿Listo para empezar?",
        subtitle: "Creá tu cuenta gratis y empezá a vender en minutos.",
        primaryCta: "Crear cuenta gratis",
        secondaryCta: "Ver funcionalidades"
      },
      faq: {
        title: "Preguntas Frecuentes",
        subtitle: "Respuestas rápidas a las consultas más comunes.",
        items: [
          { question: "¿Tienen costo por mantenimiento?", answer: "No, nuestros planes tienen un precio fijo mensual sin cargos ocultos." },
          { question: "¿Es compatible con cualquier impresora?", answer: "VentaPlus es compatible con la mayoría de las impresoras térmicas EPSON y compatibles vía USB o Red." },
          { question: "¿Cómo se integra con ARCA/AFIP?", answer: "La integración es nativa. Solo necesitás cargar tu certificado digital y punto de venta fiscal en la configuración." }
        ]
      }
    },
  pricingPage: {
    hero: {
      title: "Planes que crecen con vos",
      subtitle: "Elegí la base tecnológica perfecta para profesionalizar tu kiosco o comercio. Sin contratos, cancelá cuando quieras."
    },
    billing: {
      monthly: "mes",
      yearly: "año"
    },
    faq: {
      title: "Preguntas Frecuentes",
      items: [
        { question: "¿Puedo cambiar de plan?", answer: "Sí, podés subir de plan en cualquier momento. La diferencia se prorrateará en tu próximo ciclo de facturación." },
        { question: "¿Qué métodos de pago aceptan?", answer: "Aceptamos todas las tarjetas de crédito y débito a través de Stripe y Mercado Pago." },
        { question: "¿Cómo funciona el período de prueba?", answer: "Ofrecemos un plan gratuito forever para que pruebes las funciones básicas sin límite de tiempo." }
      ]
    }
  },
  aboutPage: {
    hero: {
      eyebrow: "Sobre Nosotros",
      title: "Impulsando el comercio argentino",
      subtitle: "VentaPlus es un sistema de punto de venta moderno en la nube, diseñado específicamente para kioscos, almacenes y comercios de cercanía en toda Argentina."
    },
    stats: [
      { value: "1.000+", label: "Comercios Activos" },
      { value: "50K+", label: "Transacciones Mensuales" },
      { value: "99,9%", label: "Uptime" },
      { value: "24/7", label: "Soporte Disponible" }
    ],
    mission: {
      eyebrow: "Nuestra Misión",
      title: "Hacer el comercio accesible para cada negocio",
      p1: "Creemos que cada comercio, kiosco y puesto merece acceso a herramientas profesionales que lo ayuden a crecer. VentaPlus nació de la frustración de ver a dueños de pequeños negocios luchar con sistemas POS obsoletos, caros y complicados.",
      p2: "Nuestra plataforma ofrece funciones de nivel empresarial como seguimiento de stock en tiempo real, cumplimiento fiscal con ARCA/AFIP y analíticas de ventas potentes — todo en un paquete simple de usar desde el primer día."
    },
    values: {
      simplicity: {
        title: "Simplicidad",
        description: "Creamos herramientas intuitivas y fáciles de usar. Sin complejidad, sin confusiones."
      },
      reliability: {
        title: "Confiabilidad",
        description: "Tu negocio depende de nosotros. Priorizamos la seguridad de los datos y el rendimiento constante."
      },
      customerFirst: {
        title: "El Cliente es lo Primero",
        description: "Cada función que creamos nace de una necesidad real. Tu opinión define nuestro camino."
      },
      localFocus: {
        title: "Enfoque Local",
        description: "Hecho en Argentina, para argentinos. Entendemos las normativas y desafíos locales."
      }
    },
    cta: {
      title: "¿Listo para empezar?",
      subtitle: "Sumate a los miles de comercios argentinos que ya usan VentaPlus para optimizar sus ventas.",
      button: "Empezar Ahora",
      secondary: "Hablar con Ventas"
    }
  },
  careersPage: {
    hero: {
      badge: "Carreras",
      title: "Construí el futuro del comercio en Argentina",
      subtitle: "Sumate a nosotros para hacer que las herramientas POS profesionales sean accesibles para cada negocio. Somos un equipo pequeño y apasionado construyendo algo que importa."
    },
    whyJoin: {
      title: "¿Por qué unirse a VentaPlus?",
      perks: [
        { icon: "🏠", title: "Remote-First", description: "Trabajá desde cualquier lugar de Argentina o más allá." },
        { icon: "📈", title: "Crecimiento", description: "Unite a una startup en etapa temprana con impacto real." },
        { icon: "💻", title: "Stack Moderno", description: "Next.js, TypeScript, Supabase y más." },
        { icon: "🗓️", title: "Flexibilidad", description: "Horarios flexibles que se adaptan a tu vida." },
        { icon: "🎯", title: "Propiedad", description: "Tomá la propiedad de las funcionalidades de punta a punta." },
        { icon: "🤝", title: "Equipo", description: "Equipo pequeño y colaborativo que valora la calidad." }
      ]
    },
    openPositions: {
      title: "Posiciones Abiertas",
      subtitle: "No tenemos posiciones abiertas en este momento, pero siempre buscamos personas con talento.",
      spontaneous: {
        title: "Candidaturas Espontáneas",
        description: "¿Crees que serías compatible? Envianos tu CV y contanos por qué te gustaría unirte a VentaPlus.",
        button: "Enviar tu CV"
      }
    }
  },
  pressPage: {
    hero: {
      badge: "Prensa",
      title: "Prensa y Medios",
      subtitle: "Recursos e información para periodistas y profesionales de medios que cubren VentaPlus."
    },
    assets: {
      title: "Recursos de Marca",
      description: "Descargá nuestros logos oficiales, colores de marca y kit de medios para usar en publicaciones de prensa.",
      logoLabel: "Logo Oficial",
      primaryBlue: "Azul Principal",
      darkBackground: "Fondo Oscuro"
    },
    inquiries: {
      title: "Consultas de Prensa",
      description: "Para consultas de medios, entrevistas o discusiones sobre alianzas, por favor contactate con nuestro equipo.",
      location: "Buenos Aires, Argentina"
    },
    about: {
      title: "Sobre VentaPlus",
      content: "VentaPlus es un sistema POS en la nube diseñado para comercios argentinos. Fundado con la misión de hacer que las herramientas comerciales profesionales sean accesibles para cada kiosco, tienda y comercio minorista, VentaPlus ofrece ventas integradas, inventario, cumplimiento fiscal (ARCA/AFIP) y analíticas de negocio — todo en una plataforma moderna."
    }
  }
};

const translationsEn = {
  common: {
    __locale__: "en-US",
    language: "Language",
    spanish: "Español",
    english: "English",
    portuguese: "Português",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    theme: "Theme",
    palette: "Palette",
    minimal: "Minimal",
    balanced: "Balanced",
    vibrant: "Vibrant",
    apply: "Apply",
    settings: "Settings",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    login: "Login",
    logout: "Logout",
    register: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    required: "Required",
    optional: "Optional",
    features: "Features",
    pricing: "Pricing",
    documentation: "Documentation",
    support: "Support",
    help: "Help Center",
    contact: "Contact",
    serviceStatus: "Service Status",
    back: "Back",
    backToTop: "Back to Top",
    legal: "Legal",
    terms: "Terms of Service",
    privacy: "Privacy",
    allRightsReserved: "All rights reserved",
    // Global error handling
    somethingWentWrong: "Something went wrong",
    unexpectedError: "An unexpected error occurred. Please try again.",
    tryAgain: "Try again",
    goHome: "Go to home",
    pageNotFound: "Page not found",
    pageNotFoundDesc:
      "The page you are looking for does not exist or has been moved.",
    errorLoadingData: "Error loading data. Please try again.",
    errorLoadingReports: "Error loading reports.",
    errorLoadingProducts: "Error loading products.",
    errorLoadingStock: "Error loading inventory.",
    errorLoadingProfile: "Error loading profile.",
    errorLoadingCategories: "Error loading categories.",
    errorUnexpected: "An unexpected error occurred in the application.",
    // Navigation & Structure
    product: "Product",
    company: "Company",
    aboutUs: "About Us",
    careers: "Careers",
    contactSales: "Contact Sales",
    press: "Press",
    integrations: "Integrations",
    security: "Security",
    helpCenter: "Help Center",
    tutorials: "Tutorials",
    technicalDocs: "Technical Documentation",
    contactSupport: "Contact Support",
    startNow: "Start Now",
    home: "Home",
    // Descriptions
    featuresDesc: "Explore all POS features",
    pricingDesc: "Plans that scale with you",
    securityDesc: "Enterprise-grade protection",
    // Footer
    footerDescription: "Comprehensive POS system for businesses in Argentina. Sales, inventory, and fiscal invoice management.",
    afipCompliant: "Compliant with AFIP / ARCA",
    // Tutorials
    tutorialsTitle: "Learn VentaPlus",
    tutorialsSubtitle: "Step-by-step guides to help you master every feature. From initial setup to advanced fiscal reports.",
    searchTutorials: "Search tutorials...",
    needMoreHelp: "Need more help?",
    contactSupportDescription: "Our support team is ready to help you with any questions about VentaPlus.",
    noResults: "No results found",
    tryDifferentSearch: "Try a different search term",
  },
  landing: {
    hero: {
      badge: "⭐ The system your business needs",
      titleMain: "The technological foundation to",
      titleHighlight: "grow your business",
      titleLines: [
        "The technological",
        "foundation to grow",
        "your business",
      ],
      titleHighlightIndex: 2,
      description:
        "Fast sales, daily control, and integrated electronic invoicing in one simple and modern system.",
      primaryCta: "Get Started",
      secondaryCta: "See How It Works",
    },
    modules: {
      module1: {
        title: "Supermarket-level speed",
        description: "Fast sales, agile workflow, designed to work with keyboard and barcode scanner.",
        image: "/images/new-features/new images/eng/eng POS page.png",
        features: [
          "Keyboard optimized",
          "Barcode scanning integration",
          "Ideal for peak hours",
          "Organized interface"
        ]
      },
      module2: {
        title: "Daily sales and cash control",
        description: "View revenue, expenses, and profits in real-time with automated summaries.",
        image: "/images/new-features/new images/eng/eng Reports Page.png",
        features: [
          "Automatic daily summary",
          "Complete cash control",
          "Clear profit margins",
          "Fast daily close"
        ]
      },
      module3: {
        title: "Full business organization",
        description: "Complete management of stock, suppliers, and expenses in one single platform.",
        image: "/images/new-features/new images/eng/eng Product Management.png",
        features: [
          "Automated inventory",
          "Supplier management",
          "Expense tracking",
          "Low stock alerts"
        ]
      },
      module4: {
        title: "ARCA electronic invoicing",
        description: "Issue fiscal documents (Invoice A, B, C) integrated directly with AFIP/ARCA.",
        image: "/images/new-features/new images/eng/eng Fiscal Reports - VAT.png",
        features: [
          "Native ARCA integration",
          "Automatic credit notes",
          "Tax records ready",
          "Guaranteed legal compliance"
        ]
      }
    },
    finalCta: {
      title: "Prepare Your Business to Grow",
      description: "A simple, fiscal-ready system designed for the real pace of retail.",
      primaryCta: "Create free account",
      secondaryCta: "See it in action"
    },
    cta: {
      title: "Ready to operate at the counter",
      subtitle:
        "Designed for kiosks, convenience stores and counter service where speed matters.",
      startFreeNow: "Start Free Now →",
      noCard: "No credit card required • 2-minute setup",
    },
    promoCta: {
      eyebrow: "Transparent pricing",
      title: "Plans designed for every stage of your business",
      subtitle: "Professionalize your management with VentaPlus starting today.",
      primaryCta: "View plans",
    },
    pricingSection: {
      title: "Simple and scalable plans",
      subtitle:
        "Choose the plan that best fits your business size. All prices in Argentine Pesos (ARS).",
      billingTitle: "Billing cycle",
      billingMonthly: "Monthly",
      billingAnnual: "Annual",
      billingSavings: "Save with annual payment",
      mostPopular: "Recommended",
      cta: "Get Started Now",
      plans: [
        {
          name: "Essential",
          monthly: "$14,999",
          annual: "$12,999",
          caption: "ARS per month",
          usage: "1 user • Up to 500 products",
          features: [
            "Point of Sale (POS)",
            "Basic stock control",
            "Expense management",
            "No ARCA invoicing",
          ],
        },
        {
          name: "Professional",
          monthly: "$29,999",
          annual: "$25,999",
          caption: "ARS per month",
          usage: "Up to 3 users • Up to 3,000 products",
          features: [
            "ARCA invoicing included",
            "Credit notes",
            "Supplier management",
            "Customer accounts (Credit)",
          ],
          featured: true,
        },
        {
          name: "Growth",
          monthly: "$54,999",
          annual: "$46,999",
          caption: "ARS per month",
          usage: "Up to 10 users • Up to 10,000 products",
          features: [
            "Advanced reports",
            "Priority support",
            "Multi-warehouse",
            "Initial training",
          ],
        },
      ],
    },
    supportSection: {
      eyebrow: "Support",
      title: "We're here to help you grow",
      subtitle:
        "VentaPlus offers multiple support channels so your business never stops.",
      items: [
        {
          title: "Help Center with Search",
          description:
            "Detailed guides and step-by-step tutorials to master every system feature.",
        },
        {
          title: "Dedicated WhatsApp Business",
          description:
            "Fast and direct support through our official WhatsApp line.",
        },
        {
          title: "Email and Contact Form",
          description:
            "Personalized attention for administrative and technical inquiries 24/7.",
        },
        {
          title: "System Status",
          description:
            "Real-time monitoring of ARCA connectivity and platform stability.",
        },
      ],
    },
    testimonialsSection: {
      eyebrow: "Testimonials",
      title: "What our customers say",
      subtitle:
        "Real stories from retailers growing with VentaPlus across Argentina.",
      metricCaption: "Verified over the last 90 days.",
      highlightLabel: "Highlight",
      highlightCaption:
        "Built-in workflows, fiscal ready, and team permissions.",
      controls: {
        previous: "Previous testimonial",
        next: "Next testimonial",
        dotPrefix: "Show testimonial from",
      },
      items: [
        {
          id: "darjeeling",
          quote:
            "In the middle of the pandemic we started with spreadsheets. Two years later, VentaPlus helped us run three stores with the same clarity we had on day one.",
          name: "Lali Hernández",
          role: "Founder, Darjeeling Goods",
          location: "Rosario, AR",
          metricLabel: "Inventory accuracy",
          metricValue: "98%",
          highlight: "Multi-store ready",
        },
        {
          id: "panaderia-central",
          quote:
            "Cashiers learned the flow in one afternoon. The daily close is now a 4-minute routine and our margins are finally visible.",
          name: "Matías Gutiérrez",
          role: "Operations, Panadería Central",
          location: "Córdoba, AR",
          metricLabel: "Faster daily close",
          metricValue: "4 min",
          highlight: "Clear margins",
        },
        {
          id: "almacen-norte",
          quote:
            "From fiscal receipts to stock alerts, everything feels connected. We finally trust the numbers and can plan purchases with confidence.",
          name: "Carmen Ibáñez",
          role: "Owner, Almacén Norte",
          location: "Mendoza, AR",
          metricLabel: "Stockouts reduced",
          metricValue: "-42%",
          highlight: "Fiscal ready",
        },
      ],
    },
    trustedDemo: {
      title: "These companies already trust VentaPlus",
      demoTitle: "Would you like to see a live demonstration?",
      demoSubtitle: "Sign up using the form below and save the date!",
      demoCta: "I want a demo",
      demoImageAlt: "VentaPlus demo",
    },
    businessInsights: {
      heroEyebrow: "Your business is just a click away",
      heroTitle: "Understand where your business is at all times",
      heroSubtitle:
        "Would you like to save hours of work with a simple click? VentaPlus simplifies the management of your business, automating tasks and streamlining all your processes.",
      blocks: [
        {
          title: "Cash Control",
          subtitle: "Track cash, banks, and daily totals.",
          description:
            "Monitor cash register openings/closures, daily sales totals, and balances across cash and bank accounts in real time.",
          alt: "VentaPlus cash control dashboard",
        },
        {
          title: "Sales & POS",
          subtitle: "Sell fast with the point of sale.",
          description:
            "Create sales in seconds, manage discounts, and accept cash, card, or transfer payments from the same screen.",
          alt: "VentaPlus point of sale screen",
        },
        {
          title: "Expenses",
          subtitle: "Register purchases and payments.",
          description:
            "Track suppliers, due dates, and expense categories to keep your cash flow clear and your payments on time.",
          alt: "VentaPlus expenses screen",
        },
        {
          title: "Stock",
          subtitle: "Control products and warehouses.",
          description:
            "Manage products, categories, barcode scanning, and stock movements across warehouses with full traceability.",
          alt: "VentaPlus inventory management screen",
        },
        {
          title: "Information",
          subtitle: "Fiscal and management reports.",
          description:
            "Generate sales, purchases, and IVA reports with export-ready summaries for accounting and AFIP/ARCA workflows.",
          cta: "Learn more",
          alt: "VentaPlus fiscal reports screen",
        },
        {
          title: "Integrations",
          subtitle: "Payments and fiscal services connected.",
          description:
            "Integrate AFIP/ARCA electronic invoicing and fiscal services to automate validation flows.",
          cta: "Learn more",
          alt: "VentaPlus integrations screen",
        },
      ],
      bottomEyebrow: "Trusted by growing teams",
      bottomTitle: "More than 2,500 businesses run VentaPlus every day",
      bottomSubtitle:
        "Centralize sales, purchases, stock, and fiscal operations in one platform designed for real-world retail.",
      bottomCta: "Start free trial",
      bottomNote: "No credit card required",
      bottomImageAlt: "VentaPlus platform overview",
    },
    posPreview: {
      alt: "Minimart counter staff using POS",
      image: "/images/hero-en.png",
    },
    designSystem: {
      badge: "Design system",
      title: "VentaPlus palettes and motion",
      subtitle:
        "Compare color variations and micro-animations for a reliable, modern interface.",
      paletteTitle: "Color variations",
      paletteSubtitle: "Pick the palette that best matches your brand tone.",
      motionTitle: "Micro-animations",
      motionDescription:
        "Subtle interactions reinforce quality without distracting the sales flow.",
      cta: "Apply palette",
      activeLabel: "Active",
      tokens: {
        primary: "Primary",
        accent: "Accent",
        surface: "Surface",
        text: "Text",
      },
      variants: [
        {
          key: "minimal",
          label: "Minimal",
          description: "Calm and understated for high-focus environments.",
          traits: ["Low contrast", "Clean surfaces", "Data-first"],
        },
        {
          key: "balanced",
          label: "Balanced",
          description: "Modern clarity with operational readability.",
          traits: ["Medium contrast", "Readable buttons", "Clear hierarchy"],
        },
        {
          key: "vibrant",
          label: "Vibrant",
          description: "Higher energy for fast-paced retail teams.",
          traits: ["Bold accents", "Visible feedback", "Brand-forward"],
        },
      ],
      motionSamples: {
        primaryAction: "Primary action",
        liveSync: "Live sync",
        notification: "Notification",
        notificationText: "New sale approved",
        auto: "Auto",
        menu: "Menu",
        hover: "Hover",
        sales: "Sales",
        reports: "Reports",
        products: "Products",
        cash: "Cash",
        note: "VentaPlus uses tech-blue for trust and soft neutrals to keep focus on the workflow.",
      },
    },
  },
  dashboard: {
    welcome: "Welcome",
    currentPlan: "Your current plan",
    planBasic: "Basic Plan (Trial)",
    planEsencial: "Essential Plan",
    planProfesional: "Professional Plan",
    planCrecimiento: "Growth Plan",
    upgradeToPro: "Upgrade Plan",
    status: "Status",
    nextRenewal: "Next Renewal",
    posSale: "POS Sale",
    cashRegister: "Quick cash register",
    products: "Products",
    inventory: "Manage inventory",
    reports: "Reports",
    analytics: "View analytics",
    admin: "Admin",
    systemSettings: "System settings",
    quickStats: "Quick Stats",
    salesToday: "Sales Today",
    totalRevenue: "Total Revenue",
    supplierAlerts: "Supplier Due Date Alerts",
    dueSoon: "Due soon",
    overdue: "Overdue",
  },
  ai: {
    common: {
      lockedTitle: "AI Analysis Locked",
      upgradeNow: "Upgrade Now",
    },
    rankings: {
      title: "Smart Rankings and Stock Analysis",
      lockedDesc: "Advanced product rankings and stagnation analysis are available in the PRO Plan.",
      bestSellers: "Best Sellers (30d)",
      mostProfitable: "Highest Revenue (30d)",
      stagnantProducts: "Stagnant Products",
      noStagnant: "No stagnant products detected.",
      inStock: "{count} in stock",
      noSalesThirty: "0 sales in 30 days",
      strategyTitle: "Recommended Strategy",
      strategyDesc: "Based on your stagnant products, you have approximately {amount} in tied-up capital. We suggest a special promotion or discount to clear these items and free up cash flow.",
      units: "units",
    },
    forecast: {
      lockedDesc: "AI-based projections are exclusively available for PRO users.",
      title: "Sales Forecast (Lightweight AI)",
      sevenDays: "7 Day Forecast",
      thirtyDays: "30 Day Forecast",
      trend: "Trend",
      trendUp: "Upward",
      trendDown: "Downward",
      trendStable: "Stable",
      disclaimer: "* Based on sales behavior from the last 4 weeks.",
      howItWorksTitle: "How it works?",
      howItWorksDesc: "Our lightweight AI analyzes your historical sales patterns, giving more weight to recent days. This forecast helps you plan purchases and cash flows with greater accuracy.",
      chartTitle: "Projection & Trend Chart",
    },
    insights: {
      title: "AI Business Insights",
      subtitle: "Explore growth opportunities and stock alerts.",
      empty: "No insights found at this time. Keep selling so the AI can detect patterns.",
      stockOutTitle: "Critical Stock: {name}",
      stockOutDesc: "Your star product is running out. Restock now to avoid lost sales.",
      createOrder: "Create Order",
      marginTitle: "Margin Opportunity: {name}",
      marginDesc: "This product has a {margin}% margin. Consider a promotion to increase profits.",
      viewProduct: "View Product",
      crossSellTitle: "Suggestion: {p1} + {p2}",
      crossSellDesc: "Customers often buy these products together. Create a bundle to boost sales.",
      seePromos: "View Promos",
      lockedCardTitle: "AI Business Insights",
      lockedCardDesc: "Your business data analyzed with AI.",
      lockedCardBadge: "PRO",
      lockedCardTeaser: "Unlock predictive analysis, smart stock alerts and sales recommendations to maximize profits.",
      lockedCardButton: "Upgrade to PRO",
      growthTitle: "Sales Growth",
      growthDesc: "Your revenue increased by {growth}% this week compared to the previous one. Great job!",
    },
    crossSell: {
      title: "Sales Suggestions",
      desc: "Customers who bought this also took...",
      add: "Add",
      loading: "Finding suggestions...",
    }
  },
  purchaseOrders: {
    title: "Purchase Orders",
    subtitle: "Manage your purchases with artificial intelligence",
    newOrder: "New Order",
    stats: { total: "Total", draft: "Draft", sent: "Sent", partial: "Partial", received: "Received", cancelled: "Cancelled" },
    filters: { searchPlaceholder: "Search by number or supplier...", allStatuses: "All statuses" },
    table: { number: "Number", supplier: "Supplier", date: "Date", status: "Status", items: "Items", totalEst: "Est. Total", actions: "Actions", send: "Send", receive: "Receive", noOrders: "No purchase orders", noOrdersSubtitle: "Create your first order with smart suggestions", code: "Code" },
    create: { title: "New Purchase Order", subtitle: "Use AI suggestions or add products manually", generalInfo: "General Information", supplier: "Supplier *", selectSupplier: "Select supplier", deliveryDate: "Estimated Delivery", warehouse: "Warehouse / Branch", warehousePlaceholder: "Main Branch", notes: "Notes", notesPlaceholder: "Optional notes", aiSuggestions: "Smart Suggestions", coverage: "Coverage:", days: "{count} days", generate: "Generate", analyzing: "Analyzing...", suggestedProducts: "{count} suggested products", addAll: "+ Add all", manualAdd: "Manual Add", selectProduct: "Select product", quantity: "Quantity", cost: "Cost", add: "Add", summary: "Summary", totalUnits: "Units", totalEstimated: "Estimated Total", createButton: "Create Order", unitAbr: "units", aiPill: "AI", noSuggestions: "No suggestions found for this supplier.", noSuggestionsSubtitle: "Linking products to this supplier or recording more sales will help the AI.", unlinkedWarning: "This product is not linked to this supplier.", autoLinkCheckbox: "Link product to supplier (save cost and lead time)" },
    detail: { back: "Back", orderNumber: "Order #", receivedAt: "Received on", cancelledAt: "Cancelled on", finalTotal: "Final Total", requested: "Requested", received: "Received", costEst: "Est. Cost", costFinal: "Final Cost", subtotal: "Subtotal", receiveAction: "Register Reception" },
    reception: { title: "Reception", subtitle: "Record received quantities and final costs", alreadyReceived: "Already Received", receiveNow: "Receive Now", confirm: "Confirm Reception" },
    priorities: { critical: "Critical", high: "High", medium: "Medium", low: "Low" },
    toasts: { alreadyAdded: "Product already added", added: "{name} added", addedMany: "{count} products added", created: "Purchase order created successfully", sent: "Order sent", received: "Reception recorded successfully", cancelled: "Order cancelled", error: "Error processing request", linked: "Product linked to supplier successfully" },
    reasons: {
      noStock: "⚠️ Out of stock - Urgent replenishment",
      criticalStock: "⚠️ Critical stock ({days} days remaining)",
      lowStock: "🔶 Low stock - will cover {days} days",
      recommended: "📊 Recommended replenishment",
      preventive: "✅ Preventive replenishment",
      growingTrend: "📈 Growing trend (+{percent}%)",
      decliningTrend: "📉 Declining trend ({percent}%)",
      dailySales: "Daily sales: {amount} {unit}"
    },
  },
  errors: {
    generic: "Something went wrong. Please try again",
    unauthorized: "Unauthorized",
    invalidOrExpiredToken: "Invalid or expired token",
    missingAuthHeader: "Missing authorization header",
    forbidden: "Access denied",
    notFound: "Not found",
    serverError: "Server error",
    networkError: "Network error",
    validationError: "Validation error",
    productCodeRequired: "Product code is required",
    productNameRequired: "Product name is required",
    productPriceRequired: "Product price is required",
    invalidPrice: "Price must be a valid number",
    productCreated: "Product created successfully",
    productUpdated: "Product updated successfully",
    productDeleted: "Product deleted successfully",
    errorCreatingProduct: "Error creating product",
    errorUpdatingProduct: "Error updating product",
    errorDeletingProduct: "Error deleting product",
    errorFetchingProducts: "Error fetching products",
    invalidEmail: "Invalid email",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsDoNotMatch: "Passwords do not match",
    userAlreadyExists: "User already exists",
    invalidCredentials: "Invalid credentials",
    orderNotFound: "Purchase order not found",
    onlyDraftSent: "Only draft orders can be sent",
    onlyDraftEdited: "Only draft orders can be edited",
    orderStatusInvalid: "This order cannot receive items in its current state",
    orderAlreadyCancelled: "This order is already received or cancelled",
    itemsRequired: "At least one item is required",
    sessionExpired: "Your session has expired. Please sign in again",
    errorSaving: "Error saving",
    errorLoading: "Error loading",
    errorDeleting: "Error deleting",
    noOpenCashRegister: "No open cash register",
    invalidAction: "Invalid action",
    invalidAmount: "Invalid amount",
    internalServerError: "Internal server error",
    missingRequiredFields: "Missing required fields",
    errorLoadingConfig: "Error loading configuration",
    clientNameRequired: "You must enter the customer name",
    cuitRequired: "CUIT is required for ARCA invoices",
    ivaTypeRequired: "Select the VAT type for ARCA invoices",
    companyNameRequired: "Company name is required",
    cuitRucDniRequired: "CUIT/RUC/ID is required",
    billingEmailRequired: "Billing email is required",
    errorSavingSupplier: "Error saving supplier",
    supplierDeletedSuccess: "Supplier deleted successfully",
    errorDeletingSupplier: "Error deleting supplier",
    selectValidCSV: "Please select a valid CSV file",
    emptyCSVFile: "The CSV file is empty or has no data",
    csvMustContainName: 'CSV must contain at least the "nombre" column',
    noValidSuppliersFound: "No valid suppliers found in the file",
    errorProcessingCSV: "Error processing CSV file",
    suppliersImportedSuccess: (count: number) =>
      `${count} suppliers imported successfully`,
    errorLoadingSales: "Error loading sales",
    errorRegisteringPurchase: "Error registering purchase",
    purchaseRegisteredSuccess: "Purchase registered successfully!",
    paymentError: "Payment error",
    errorCompletingSale: "Error completing sale",
    errorProcessingSale: "Error processing sale. Please try again",
    noDataToExport: "No data to export",
    confirmDeleteExpense: "Are you sure you want to delete this expense?",
    productCodeExists: "Product code already exists",
    emailInUse: "Email is already in use",
    cannotDeleteSelf: "You cannot delete yourself",
    invalidPlanId: "Invalid plan",
    noFileReceived: "No file received",
    invalidFile: "Invalid file",
    errorImportingProducts: "Error importing products",
  },
  messages: {
    welcome: "Welcome",
    goodbye: "Goodbye",
    confirmDelete: "Are you sure you want to delete this?",
    confirmAction: "Are you sure?",
    processing: "Processing...",
    loading: "Loading...",
    noResults: "No results",
    noData: "No data available",
  },
  auth: {
    login: {
      title: "Login",
      email: "Email",
      password: "Password",
      submit: "Login",
      forgotPassword: "Forgot your password?",
      noAccount: "Don't have an account?",
      registerLink: "Sign Up",
    },
    forgotPassword: {
      title: "Recover Password",
      subtitle:
        "Enter your email and we'll send you a link to reset your password",
      email: "Email",
      submit: "Send Recovery Link",
      backToLogin: "Back to login",
      emailSent: "Email sent",
      emailSentMessage:
        "If an account exists with that email, you will receive a recovery link",
    },
    resetPassword: {
      title: "Reset Password",
      subtitle: "Enter your new password",
      password: "New Password",
      confirmPassword: "Confirm New Password",
      submit: "Reset Password",
      success: "Password reset successfully",
      invalidToken: "The recovery link is invalid or has expired",
    },
    register: {
      title: "Sign Up",
      fullName: "Full Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      submit: "Create Account",
      haveAccount: "Already have an account?",
      loginLink: "Login",
    },
  },
  pricing: {
    title: "Pricing in ARS",
    subtitle: "Choose the level of power your business needs",
    essential: "Essential Plan",
    essentialPrice: "$14,999",
    pro: "Professional Plan",
    proPrice: "$29,999",
    growth: "Growth Plan",
    growthPrice: "$54,999",
    mostPopular: "Recommended",
    startFree: "Start Free",
    tryFree: "Try for Free",
  },
  subscriptionProModal: {
    titlePrefix: "Subscription -",
    billingInfo: "Billing information",
    fields: {
      businessNameLabel: "Company Name",
      businessNamePlaceholder: "Your company name",
      cuitRucDniLabel: "Tax ID",
      cuitRucDniPlaceholder: "20-12345678-9",
      billingEmailLabel: "Billing Email",
      billingEmailPlaceholder: "billing@yourcompany.com",
      phoneLabel: "Phone",
      phonePlaceholder: "+1 (555) 123-4567",
    },
    buttons: {
      continuePayment: "Continue to Payment",
      processing: "Processing...",
    },
  },
  navigation: {
    home: "Home",
    dashboard: "Dashboard",
    products: "Products",
    sales: "Sales",
    customers: "Customers",
    reports: "Reports",
    settings: "Settings",
    profile: "Profile",
  },
  profile: {
    title: "Profile",
    account: "Account",
    loading: "Loading profile",
    personalInfo: "Personal information",
    userData: "User data",
    updateDescription: "Update your name and email. Password is optional.",
    goToDashboard: "Go to dashboard",
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    phonePlaceholder: "E.g: +1 555 123 4567",
    role: "Role",
    businessName: "Business name",
    businessPlaceholder: "Your business",
    password: "Password (optional)",
    passwordPlaceholder: "Leave blank to keep current",
    reset: "Reset",
    save: "Save changes",
    updateSuccess: "Profile updated successfully",
    updateError: "Could not save. Please try again.",
    updateErrorGeneric: "Could not update profile",
    back: "Back",
  },
  pos: {
    header: {
      tagline: "Cloud Point of Sale",
      cashRegisterOpen: "Register Open",
    },
    nav: {
      posSale: "Point of Sale",
      cashRegister: "Cash Register",
      products: "Products",
      categories: "Categories",
      stock: "Stock",
      clients: "Customers",
      suppliers: "Suppliers",
      goodsReceipts: "Goods Receipts",
      supplierReturns: "Supplier Returns",
      supplierDocuments: "Supplier Documents",
      paymentOrders: "Payment Orders",
      expenses: "Expenses",
      expenseAnalytics: "Expense Intelligence",
      reports: "Reports",
      fiscalReports: "Fiscal Reports",
      users: "Users",
      businessConfig: "Business Settings",
      planComparison: "Plan Comparison",
      sales: "Sales",
      purchaseOrders: "Purchase Orders",
    },
    salesPage: {
      title: "Sales History",
      subtitle: "Manage and view all your sales and invoices",
      tabList: "Sales List",
      tabAnalytics: "Analytics",
      dateFrom: "Date From",
      dateTo: "Date To",
      paymentState: "Payment Status",
      all: "All",
      completed: "Completed",
      pending: "Pending",
      failed: "Failed",
      partial: "Partial",
      search: "Search",
      loading: "Loading...",
      noSalesFound: "No sales found for the selected period",
      date: "Date",
      receipt: "Receipt",
      seller: "Seller",
      amount: "Amount",
      method: "Method",
      status: "Status",
      arca: "ARCA",
      actions: "Actions",
      view: "View",
      retry: "Retry",
      retrying: "Retrying...",
      noInvoice: "N/A",
      unknownUser: "User",
      arcaApproved: "Approved",
      arcaPending: "Pending CAE",
      arcaRejected: "Rejected",
      arcaCancelled: "Cancelled",
      totalSales: "Total Sales",
      totalRevenue: "Total Revenue",
      averageTicket: "Average Ticket",
      totalTax: "VAT Total 21%",
      byPaymentMethod: "By Payment Method",
      cash: "Cash",
      card: "Card",
      online: "Online",
      mercadopago: "Mercado Pago",
      checkPayment: "Check",
      qr: "QR",
      bankTransfer: "Bank Transfer",
      multiple: "Multiple",
      byPaymentStatus: "By Payment Status",
      retryCaeSuccess: "CAE obtained successfully",
      retrySent: "Retry sent",
      retryError: "Error retrying invoice",
      connectionError: "Connection error while retrying",
      loadingPage: "Loading sales...",
      saleDetail: "Sale Detail",
      invoiceNumber: "Receipt No.",
      paymentMethod: "Payment Method",
      paymentStatus: "Payment Status",
      arcaStatus: "ARCA Status",
      arcaError: "ARCA Error",
      ivaType: "VAT Type",
      cae: "CAE",
      caeExpiry: "CAE Expiry",
      items: "Items",
      product: "Product",
      qty: "Qty",
      unitPrice: "Unit Price",
      itemDiscount: "Disc.",
      itemTotal: "Total",
      subtotal: "Subtotal",
      tax: "VAT",
      discount: "Discount",
      total: "Total",
      close: "Close",
      retryInvoice: "Retry Invoice",
      noItems: "No items",
      channel: "Channel",
      createdAt: "Created At",
      notes: "Notes",
      arcaErrFacturaAConsumidorFinal:
        "Invoice A is not valid for Final Consumer. It can only be issued between Registered Taxpayers.",
      arcaErrDocTipoInvalido:
        "The recipient's document type is not valid for this voucher.",
      arcaErrCuitInvalido: "The recipient's CUIT is invalid or not registered.",
      arcaErrCbteDesde: "Error in voucher numbering (CbteDesde).",
      arcaErrCbteHasta: "Error in voucher numbering (CbteHasta).",
      arcaErrDuplicado:
        "This voucher was already authorized previously (duplicate).",
      arcaErrCertificado:
        "Digital certificate error. Verify it is valid and properly configured.",
      arcaErrTimeout: "Connection to ARCA/AFIP timed out. Please try again.",
      arcaErrConexion:
        "Could not connect to ARCA/AFIP servers. Check your connection.",
      arcaErrCancelada: "This invoice was manually cancelled.",
      arcaErrIvaObligatorio:
        "When net amount is greater than 0, IVA tax detail is required. Check your tax configuration.",
      arcaErrMontoTotal:
        "The total amount does not match the sum of its components. Check subtotal, IVA and discounts.",
      arcaErrPtoVta:
        "The point of sale does not match or is not authorized for this operation.",
      arcaErrFechaFueraRango:
        "The voucher date is outside the range allowed by AFIP.",
      arcaErrDocTipoMustBeCuit:
        "Invoice type A requires recipient CUIT (DocTipo 80). Automatically corrected to Invoice B. Please retry.",
      arcaErrDocNroInvalido:
        "The recipient document number is invalid. Please check the CUIT entered.",
      arcaErrCondicionIvaReceptor:
        "The recipient IVA condition is not valid for this invoice type. It will be corrected automatically. Please retry.",
      arcaOriginalError: "Original message",
      api_INVOICE_NOT_FOUND: "Invoice not found.",
      api_NOT_ARCA: "Not an ARCA invoice.",
      api_ALREADY_AUTHORIZED: "This invoice is already authorized.",
      api_CANCELLED_CANNOT_RETRY:
        "Cannot retry a cancelled invoice. Create a new sale instead.",
      api_NO_FISCAL_CONFIG: "Fiscal configuration not found.",
      api_INCOMPLETE_FISCAL_CONFIG:
        "Incomplete fiscal configuration (certificate/key/CUIT).",
      api_RETRY_FAILED: "Failed to retry invoice. Please try again.",
      api_CAE_SUCCESS: "CAE obtained successfully.",
      receiptUnavailable: "Cannot display receipt for this sale.",
      receiptBlocked_REJECTED:
        "Receipt was rejected by ARCA/AFIP. Cannot print until the issue is resolved.",
      receiptBlocked_CANCELED_BY_NC:
        "This sale was cancelled via credit note. Cannot reprint.",
      receiptBlocked_CAE_REQUIRED:
        "AFIP CAE authorization is required to print this receipt. Retry the invoice first.",
    },
    labels: {
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      import: "Import",
      export: "Export",
      print: "Print",
      actions: "Actions",
      name: "Name",
      description: "Description",
      price: "Price",
      code: "Code",
      quantity: "Quantity",
      total: "Total",
      subtotal: "Subtotal",
      tax: "Tax",
      discount: "Discount",
      payment: "Payment",
      customer: "Customer",
      date: "Date",
      time: "Time",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      completed: "Completed",
      cancelled: "Cancelled",
    },
    messages: {
      confirmDelete: "Are you sure you want to delete this?",
      noData: "No data available",
      loading: "Loading...",
      errorLoading: "Error loading data",
      clientFetchError: "Error loading clients",
      selectClient: "Select client...",
      noClients: "No clients",
      clientsUpgradeRequired:
        "Customer search is available only on the Pro plan",
      errorCreating: "Error creating item",
      errorUpdating: "Error updating item",
      errorDeleting: "Error deleting item",
      successCreate: "Item created successfully",
      successUpdate: "Item updated successfully",
      successDelete: "Item deleted successfully",
      required: "This field is required",
      selectOne: "Please select an item",
    },
    pages: {
      pos: {
        title: "Point of Sale",
        noProducts: "No products to sell",
        selectProduct: "Select a product",
        quantity: "Quantity",
        addToCart: "Add to Cart",
        cart: "Cart",
        total: "Total",
        clearCart: "Clear Cart",
        checkout: "Checkout",
        cash: "Cash",
        card: "Card",
        transfer: "Transfer",
      },
      products: {
        title: "Products",
        addProduct: "Add Product",
        editProduct: "Edit Product",
        deleteProduct: "Delete Product",
        productCode: "Product Code",
        productName: "Product Name",
        description: "Description",
        price: "Price",
        cost: "Cost",
        quantity: "Quantity",
        category: "Category",
        supplier: "Supplier",
        barcode: "Barcode",
      },
      categories: {
        title: "Categories",
        addCategory: "Add Category",
        editCategory: "Edit Category",
        deleteCategory: "Delete Category",
        categoryName: "Category Name",
        description: "Description",
      },
      stock: {
        title: "Stock",
        inventory: "Inventory",
        quantity: "Quantity",
        alertLevel: "Alert Level",
        lastUpdate: "Last Update",
        adjustStock: "Adjust Stock",
        stockHistory: "Stock History",
      },
      clients: {
        title: "Customers",
        addClient: "Add Customer",
        editClient: "Edit Customer",
        deleteClient: "Delete Customer",
        name: "Name",
        email: "Email",
        phone: "Phone",
        address: "Address",
        city: "City",
        state: "State",
        zipCode: "Zip Code",
        creditLimit: "Credit Limit",
        creditUsed: "Credit Used",
      },
      suppliers: {
        title: "Suppliers",
        addSupplier: "Add Supplier",
        editSupplier: "Edit Supplier",
        deleteSupplier: "Delete Supplier",
        name: "Name",
        email: "Email",
        phone: "Phone",
        address: "Address",
        city: "City",
        state: "State",
        contact: "Contact",
      },
      expenses: {
        title: "Expenses",
        addExpense: "Add Expense",
        editExpense: "Edit Expense",
        deleteExpense: "Delete Expense",
        description: "Description",
        amount: "Amount",
        category: "Category",
        date: "Date",
        paymentMethod: "Payment Method",
      },
      reports: {
        title: "Reports",
        salesReport: "Sales Report",
        stockReport: "Stock Report",
        expensesReport: "Expenses Report",
        clientsReport: "Customers Report",
        profitReport: "Profit Report",
        dateRange: "Date Range",
        exportPDF: "Export to PDF",
        exportExcel: "Export to Excel",
        totalSales: "Total Sales",
        totalExpenses: "Total Expenses",
        totalProfit: "Total Profit",
      },
      cashRegister: {
        title: "Cash Register",
        openCash: "Open Cash Register",
        closeCash: "Close Cash Register",
        balance: "Balance",
        initialAmount: "Initial Amount",
        finalAmount: "Final Amount",
        expected: "Expected",
        actual: "Actual",
        difference: "Difference",
        cashRegisterId: "Register ID",
        openedBy: "Opened By",
        closedBy: "Closed By",
        openTime: "Open Time",
        closeTime: "Close Time",
        status: "Status",
        open: "Open",
        closed: "Closed",
        movements: {
          opening: "Opening cash",
          withdrawal: "Cash withdrawal",
          creditNote: "Credit note",
          noReason: "No reason specified",
        },
      },
    },
    ui: {
      loading: "Loading POS...",
      title: "POS - {role}",
      closedTitle: "Cash Register Closed",
      closedDescription:
        'You need to open a register from the "Cash Register" section to start selling',
      scanPlaceholder: "Scan or enter barcode... (F6)",
      searchPlaceholder: "Search product by name or code... (F5)",
      searching: "Searching...",
      statusOnline: "Online",
      statusSync: "Sync 0s",
      statusPrinter: "Printer OK",
      tipsTitle: "Quick tips:",
      tipsBodyStart: "Use the barcode scanner or search by name. Navigate with",
      tipsBodyEnd: "and press",
      tipsBodyAdd: "to add.",
      startTyping: "Start typing to search",
      noProductsFound: "No products found",
      codeLabel: "Code:",
      stockLabel: "Stock:",
      addButton: "Add",
      cartTitle: "Cart",
      clearCart: "Clear Cart",
      cartEmpty: "Cart is empty",
      cartEmptySubtitle: "Scan or search products to start",
      remove: "Remove",
      quantity: "Qty.",
      discount: "Discount",
      total: "Total",
      subtotal: "Subtotal",
      totalDiscount: "Discount",
      tax21: "VAT 21%",
      discountLimitExceeded: "Discount exceeds your limit",
      discountInvalid: "Invalid discount",
      discountNegative: "Discount must be 0 or higher",
      discountExceedsSubtotal: "Discount cannot exceed line subtotal",
      discountExceedsUserLimit: "Discount exceeds your limit",
      weightQuantityHint:
        "Use . for decimals, , for thousands (e.g., 1.560 or 1,560)",
      paymentMethod: "Payment Method",
      paymentOptions: {
        cash: "Cash",
        card: "Card",
        check: "Check",
        online: "Online",
        bankTransfer: "Bank Transfer",
        qr: "QR Code",
        account: "Account",
      },
      accountLabel: "Account",
      balanceLabel: "Balance",
      balanceDueLabel: "Amount due",
      balanceCreditLabel: "Credit balance",
      viewAccount: "View account",
      accountTitle: "Customer account",
      registerPayment: "Register payment",
      paymentAmount: "Amount",
      paymentNote: "Details",
      savePayment: "Save payment",
      accountMovements: "Movements",
      noAccountMovements: "No movements",
      accountCharge: "Charge",
      accountPayment: "Payment",
      accountAdjustment: "Adjustment",
      accountLoadError: "Failed to load account",
      accountPaymentSaved: "Payment recorded",
      accountPaymentError: "Failed to record payment",
      accountRequiresClient: "Select a customer to charge on account",
      accountInvalidAmount: "Invalid amount",
      accountOverpayError: "Payment exceeds amount due",
      processing: "Processing...",
      checkout: "Complete Sale",
      checkoutSuccess: "Sale completed successfully!",
      checkoutError: "Error completing the sale",
      checkoutProcessError: "Error processing the sale. Please try again.",
      insufficientStock:
        "Insufficient stock for {name}. Available: {available}, requested: {requested}",
      // Sale error codes (from API errorCode)
      cuitRequiredRI: "CUIT is required for Registered Taxpayer",
      cuitInvalidFormat: "CUIT must be 11 digits",
      saleErr_NO_ITEMS: "Add products to the cart before selling",
      saleErr_CUSTOMER_NAME_REQUIRED: "Customer name is required",
      saleErr_IVA_TYPE_REQUIRED: "Select the VAT type for ARCA invoices",
      saleErr_CUIT_REQUIRED_RI: "CUIT is required for Registered Taxpayer",
      saleErr_CUIT_INVALID_FORMAT: "CUIT must be 11 digits",
      saleErr_REGISTER_NOT_OPEN: "Cash register is not open",
      saleErr_INVALID_QUANTITY: "Invalid quantity",
      saleErr_QUANTITY_ZERO: "Quantity must be greater than 0",
      saleErr_PRODUCT_NOT_FOUND: "Product not found",
      saleErr_INSUFFICIENT_STOCK: "Insufficient stock",
      saleErr_INVALID_DISCOUNT: "Invalid discount",
      saleErr_DISCOUNT_NEGATIVE: "Discount must be 0 or higher",
      saleErr_DISCOUNT_EXCEEDS_LINE: "Discount cannot exceed line subtotal",
      saleErr_DISCOUNT_EXCEEDS_LIMIT: "Discount exceeds your limit",
      saleErr_DISCOUNT_EXCEEDS_SUBTOTAL: "Discount cannot exceed subtotal",
      saleErr_PRICE_MISMATCH: "Product price mismatch",
      saleErr_USER_NOT_FOUND: "User not found",
      saleErr_MERCADOPAGO_FAILED: "Mercado Pago payment processing failed",
      saleErr_SERVER_ERROR: "Internal server error. Please try again.",
      // POS receipt modal labels
      paymentAccount: "Account",
      finalConsumer: "Final Consumer",
      arcaRespondedOk: "ARCA responds OK",
      pendingCaeRetry: "Pending CAE — will retry automatically",
      arcaNotResponding: "ARCA does not respond",
      invoiceTypeLabel: "Invoice Type:",
      internalNonFiscal: "Internal (Non-Fiscal)",
      arcaFiscalInvoice: "ARCA (Fiscal Invoice)",
      optional: "Optional",
      vatTypeLabel: "VAT Type",
      registeredTaxpayer: "Registered Taxpayer",
      monotributista: "Monotributista",
      vatExempt: "VAT Exempt",
      uncategorizedIva: "Uncategorized",
      salesReceipt: "Sales Receipt",
      cashRegisterStatusError: "Error loading cash register status",
      businessConfigError: "Error loading business settings",
      provisionalDocType: "PROVISIONAL RECEIPT",
      provisionalPendingCae: "PROVISIONAL RECEIPT — PENDING CAE",
      budgetNotValidAsInvoice: "BUDGET — NOT VALID AS INVOICE",
      documentTypeLabel: "Document Type:",
      numberingLabel: "Numbering:",
      pendingStatus: "Pending...",
      caeExpirationLabel: "CAE Exp.:",
      fiscalQrLabel: "Fiscal QR:",
      yes: "Yes",
      pendingSingle: "Pending",
      fiscalValidityLabel: "Fiscal Validity:",
      validOnceApproved: "Valid once approved",
      usageLabel: "Usage:",
      printBehaviorLabel: "Print Behavior:",
      editingLabel: "Editing:",
      taxLabel: "Tax (21%):",
      roles: {
        admin: "Administrator",
        supervisor: "Supervisor",
        cashier: "Cashier",
        user: "User",
      },
      // Keyboard POS translations
      keyboardPOS: "Keyboard POS",
      quantityFirst: "Enter quantity first, then product code",
      productCodeBarcode: "Product Code / Barcode",
      scanOrEnterCode: "Scan or enter code...",
      pressEnterToAdd: "Press Enter to add • Esc to cancel",
      keyboardShortcuts: "Keyboard Shortcuts",
      confirmAdd: "Confirm / Add",
      cancel: "Cancel / Clear",
      multiplier: "Multiplier (50*code)",
      changeCustomer: "Change customer",
      findCustomer: "Find customer",
      newCustomer: "New customer",
      removeCustomer: "Remove customer",
      examples: "Examples",
      example1: "Type '5' → Enter → Scan/Enter code → Enter = 5 units",
      example2: "Type '0.325' → Enter → Scan = 0.325 kg",
      example3: "Type '50*697202601252361' → Enter = 50 units instantly",
      quantityHint: "Enter quantity or use multiplier: 50*code",
      enterProductCode: "Please enter a product code",
      invalidQuantity: "Invalid quantity",
      productNotFound: "Product not found",
      outOfStock: "Product out of stock",
      addedToCart: "added to cart",
      errorAddingProduct: "Error adding product",
      changeCustomerType: "Change customer type",
      searchCustomer: "Search customer",
      advancedSearch: "Advanced Search",
      clickToExpand: "Click to expand",
      fiscalComparison: {
        title: "Provisional Receipt vs Fiscal Invoice",
        subtitle:
          "Receipt type is automatic. Cashiers cannot choose it manually.",
        feature: "Feature",
        provisionalReceipt: "Provisional Receipt (Budget)",
        fiscalInvoice: "Fiscal Invoice (A / B)",
        documentType: "Document Type",
        documentTypeBudget: "BUDGET",
        documentTypeFiscal: "INVOICE A / INVOICE B",
        numbering: "Numbering",
        numberingInternal: "Internal (e.g., 01-003)",
        numberingFiscal: "ARCA / fiscal (e.g., 0001-00001234)",
        caeExpiration: "CAE & Expiration",
        no: "No",
        yes: "Yes",
        fiscalQR: "Fiscal QR",
        fiscalValidity: "Fiscal Validity",
        notValid: "Not valid",
        validBeforeArca: "Valid before ARCA",
        usage: "Usage",
        contingencyBackup: "Contingency / Backup",
        finalLegalDocument: "Final legal document",
        whenPrinted: "When it is printed",
        arcaNoResponse: "ARCA does not respond",
        arcaRespondsOK: "ARCA responds OK",
        editing: "Editing",
        notEditable: "Not editable",
        editableCreditNotes: "Editable only for credit notes",
        quickSummaryTitle: "Quick Visual Summary",
        summaryProvisional:
          "Provisional = temporary backup, no fiscal validity",
        summaryFiscal: "Fiscal = final legal document",
        summaryNeverPrints: "Fiscal invoice never prints without CAE",
        summaryCorrections: "Corrections via Credit Note only",
      },
    },
    receipt: {
      date: "Date:",
      time: "Time:",
      items: "Items",
      noItems: "No items",
      subtotal: "Subtotal:",
      discount: "Discount:",
      total: "Total:",
      paymentMethod: "Payment Method:",
      print: "Print",
      close: "Close",
    },
  },
  featuresPage: {
    hero: {
      eyebrow: "Product",
      title: "The full power of VentaPlus in one platform",
      subtitle: "Manage every aspect of your retail business with modules built for speed and growth.",
      primaryCta: "Start Now",
      secondaryCta: "View Plans"
    },
    sections: [
      {
        id: "pos",
        title: "Point of Sale (POS)",
        description: "Optimized for counter speed. Compatible with numeric keypad and barcode scanners.",
        image: "/images/new-features/new images/eng/eng POS page.png",
        items: [
          "Keyboard shortcuts for maximum speed",
          "Instant product search",
          "Multiple payment method support",
          "Tickets and invoices in seconds"
        ]
      },
      {
        id: "reports",
        title: "Sales & Profit Control",
        description: "Visualize profit margins and daily sales clearly and automatically.",
        image: "/images/new-features/new images/eng/eng Reports Page.png",
        items: [
          "Automatic profitability calculation",
          "Sales reports by period",
          "Cash audit controls",
          "Best-selling product statistics"
        ]
      },
      {
        id: "inventory",
        title: "Automatic Inventory Management",
        description: "Every sale automatically deducts stock. Forget about manual spreadsheets.",
        image: "/images/new-features/new images/eng/eng Stock report.png",
        items: [
          "Critical stock alerts",
          "Bulk update via CSV",
          "Smart categorization",
          "Movement history"
        ]
      },
      {
        id: "suppliers",
        title: "Supplier Management",
        description: "Centralize your purchases and keep a record of debts with your suppliers.",
        image: "/images/new-features/new images/eng/eng Supplier Management.png",
        items: [
          "Complete supplier directory",
          "Purchase invoice records",
          "Invoice due date alerts",
          "Purchase price history"
        ]
      },
      {
        id: "expenses",
        title: "Expense Tracking",
        description: "Register your operating costs and fixed expenses for a real net balance.",
        image: "/images/new-features/new images/eng/eng expenses.png",
        items: [
          "Expense categorization",
          "Direct impact on profits",
          "Receipt attachments",
          "Monthly expense reports"
        ]
      },
      {
        id: "fiscal",
        title: "ARCA Electronic Invoicing",
        description: "Issue fiscal invoices (A, B, C) directly connected with AFIP.",
        image: "/images/new-features/new images/eng/eng Fiscal Reports - VAT.png",
        items: [
          "Instant CAE acquisition",
          "Credit and Debit Notes",
          "Simple certificate setup",
          "Exporter for Digital IVA Book"
        ]
      },
      {
        id: "security",
        title: "Roles & Security",
        description: "Assign specific permissions for cashiers, admins, and owners.",
        image: "/images/new-features/new images/eng/eng User Management.png",
        items: [
          "Customizable roles",
          "Action history per user",
          "Critical function restriction",
          "Secure access from anywhere"
        ]
      }
    ],
    otherFeatures: {
      title: "Built for real-world retail",
      items: [
        { 
          title: "WhatsApp Support", 
          description: "Dedicated attention to resolve your doubts quickly.", 
          icon: "phone" 
        },
        { 
          title: "Zero Installation", 
          description: "Access from any browser with no complex setup.", 
          icon: "cloud" 
        },
        { 
          title: "Service Status", 
          description: "Real-time tracking of ARCA connectivity.", 
          icon: "activity" 
        }
      ]
    }
  },
  integrationsPage: {
    hero: {
      eyebrow: "Integrations",
      title: "Connected to your business ecosystem",
      subtitle: "VentaPlus integrates with the tools you already use to automate fiscal processes, payments, and management.",
    },
    arcaSection: {
      title: "ARCA / AFIP",
      badge: "Active Integration",
      description: "Direct connection with the Argentine tax authority for electronic invoice issuance and automatic legal compliance.",
      features: [
        "Automatic CAE request and assignment",
        "Factura A, B, and C integrated",
        "Fiscal credit and debit notes",
        "Digital certificates management",
        "Real-time sync with ARCA",
        "Integrated Digital VAT Book",
      ],
      cta: "View ARCA Tutorials",
      visual: {
        authorized: "Authorized",
        amount: "Amount",
        iva: "VAT (21%)",
        cae: "CAE",
      }
    },
    otherIntegrations: {
      title: "More integrations to empower you",
      comingSoon: "Coming Soon",
      suggestTitle: "Need another integration?",
      suggestDesc: "We're working to add new tools. If you use something specific, let us know.",
      suggestCta: "Suggest Integration",
      categories: {
        payments: "Payments",
        logistics: "Logistics",
        marketing: "Marketing",
      },
      items: [
        {
          name: "Mercado Pago",
          category: "payments",
          description: "QR and payment link charges synchronized automatically with your cash register.",
          status: "active"
        },
        {
          name: "MODO",
          category: "payments",
          description: "Accept payments from all bank wallets with a single integration.",
          status: "coming_soon"
        },
        {
          name: "Andreani",
          category: "logistics",
          description: "Label generation and shipment tracking directly from the order.",
          status: "coming_soon"
        },
        {
          name: "WhatsApp",
          category: "marketing",
          description: "Automatic sending of receipts and stock notifications via chat.",
          status: "active"
        }
      ]
    }
  },
  helpPage: {
    hero: {
      title: "How can we help you?",
      subtitle: "Search for guides, tutorials, and answers to your questions about VentaPlus.",
      searchPlaceholder: "Search for help...",
    },
    categories: {
      title: "Explore by category",
      items: [
        { id: "getting-started", title: "Getting Started", desc: "First steps to set up your VentaPlus account and start selling.", icon: "rocket", count: 5 },
        { id: "arca-invoicing", title: "ARCA Invoicing", desc: "Electronic invoicing with ARCA/AFIP compliance.", icon: "file-text", count: 8 },
        { id: "pos", title: "POS / Cash Register", desc: "Master the point of sale interface and cash management.", icon: "monitor", count: 12 },
        { id: "inventory", title: "Inventory Management", desc: "Stock control, categories, and product management.", icon: "package", count: 10 },
        { id: "subscriptions", title: "Subscriptions", desc: "Manage your VentaPlus subscription and billing.", icon: "credit-card", count: 4 },
        { id: "payment-orders", title: "Payment Orders", desc: "Create and manage payment orders for suppliers.", icon: "banknote", count: 6 },
        { id: "suppliers", title: "Suppliers", desc: "Supplier management, purchases, and returns.", icon: "truck", count: 7 },
        { id: "customers", title: "Customers", desc: "Customer database, credit sales, and accounts.", icon: "users", count: 5 },
        { id: "expenses", title: "Expenses", desc: "Track and manage business expenses.", icon: "percent", count: 4 },
        { id: "fiscal-reports", title: "Fiscal Reports", desc: "Generate and understand fiscal and tax reports.", icon: "bar-chart", count: 9 },
        { id: "initial-config", title: "Initial Configuration", desc: "Business setup, tax settings, and system preferences.", icon: "settings", count: 6 }
      ]
    },
    popular: {
      title: "Popular articles",
      items: [
        { title: "How to set up my first product", link: "#" },
        { title: "Keyboard shortcuts in the POS", link: "#" },
        { title: "ARCA connection (Step by step)", link: "#" },
        { title: "Performing a cash out", link: "#" },
        { title: "Importing stock from Excel", link: "#" },
      ]
    },
    cta: {
      title: "Can't find what you're looking for?",
      subtitle: "Our support team is ready to lend a hand.",
      button: "Contact Support",
    }
  },
  documentationPage: {
    sidebar: {
      basics: "Basics",
      intro: "Introduction",
      auth: "Authentication",
      architecture: "Architecture",
      api: "API Reference",
      products: "Products",
      sales: "Sales",
      inventory: "Inventory",
      webhooks: "Webhooks",
      security: "Security & Privacy",
    },
    hero: {
      badge: "Technical Documentation",
      title: "Build with VentaPlus API",
      subtitle: "Our platform is designed to be extended. Integrate your business with modern libraries and a robust REST API.",
    }
  },
  statusPage: {
    title: "System Status",
    subtitle: "Real-time monitoring of our core services and fiscal connectivity.",
    summary: {
      operational: "All Systems Operational",
      maintenance: "Scheduled Maintenance",
      partial: "Partial Interruption",
      outage: "Major Outage"
    },
    components: {
      api: "Production API",
      dashboard: "Web Dashboard",
      pos: "POS Terminal",
      arca: "ARCA/AFIP Integration",
      database: "Primary Database"
    },
    uptime: "Uptime (last 90 days)",
    history: "Incident History",
    noIncidents: "No incidents reported in this period.",
    lastUpdate: "Last updated",
    live: "Live Status",
    ninetyDaysAgo: "90 days ago",
    today: "Today",
    cta: {
      title: "Still experiencing issues?",
      description: "Our emergency engineering team is available 24/7 for Pro plan subscribers.",
      button: "Contact Support"
    }
  },
  securityPage: {
    hero: {
      badge: "Security",
      title: "Your data is our top priority",
      description: "VentaPlus is built with enterprise-grade security from the ground up. We protect your business data with industry-leading encryption, authentication, and infrastructure practices."
    },
    features: {
      encryption: {
        title: "Data Encryption",
        description: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your business data is always protected."
      },
      auth: {
        title: "Secure Authentication",
        description: "Industry-standard authentication with secure password hashing (bcrypt) and session management."
      },
      infrastructure: {
        title: "Cloud Infrastructure",
        description: "Hosted on enterprise-grade cloud infrastructure with automatic scaling, redundancy, and 99.9% uptime SLA."
      },
      backups: {
        title: "Automated Backups",
        description: "Your data is automatically backed up continuously. Point-in-time recovery ensures nothing is ever lost."
      },
      access: {
        title: "Role-Based Access",
        description: "Fine-grained permission controls ensure team members only access what they need. Owner, admin, and cashier roles."
      },
      audit: {
        title: "Audit Logging",
        description: "Complete audit trail of all system operations. Track who did what and when for full accountability."
      }
    },
    compliance: {
      title: "Regulatory Compliance",
      description: "VentaPlus is fully compliant with Argentine fiscal regulations and data protection standards.",
      arcaTitle: "ARCA / AFIP",
      arcaDesc: "Full compliance with Argentine electronic invoicing regulations and fiscal requirements.",
      pdTitle: "Data Protection",
      pdDesc: "Customer and business data handled according to Argentine data protection laws (Law 25.326)."
    },
  },
  tutorialsPage: {
    hero: {
        breadcrumbHome: "Home",
        breadcrumbTutorials: "Tutorials",
        badge: "Learn VentaPlus",
        title: "Tutorials & Guides",
        subtitle: "Everything you need to master your business operations. Find answers and step-by-step tutorials.",
        searchPlaceholder: "Search tutorials..."
      },
      noResults: {
        title: "No tutorials found",
        subtitle: "Try a different search term"
      },
      cta: {
        title: "Can't find what you're looking for?",
        subtitle: "Our support team is available via chat and email to help you with any specific question.",
        button: "Contact Support"
      }
    },
    contactPage: {
      hero: {
        eyebrow: "Contact",
        title: "We're here to power your growth",
        subtitle: "Talk to our team of experts about how VentaPlus can transform your business management.",
        badges: {
          response: "24h response",
          secure: "Data secure",
          argentina: "Argentina-based team"
        }
      },
      form: {
        title: "Send us a message",
        subtitle: "We'll get back to you as soon as possible",
        name: "Full Name",
        namePlaceholder: "Enter your name",
        email: "Email address",
        emailPlaceholder: "you@example.com",
        phone: "Phone (optional)",
        phonePlaceholder: "+54 9 11 ...",
        subject: "Subject",
        subjectPlaceholder: "Select a topic",
        message: "Message",
        messagePlaceholder: "How can we help you?",
        submit: "Send message",
        sending: "Sending...",
        successTitle: "Message sent!",
        successMessage: "Thank you for reaching out. A member of our team will respond shortly.",
        sendAnother: "Send another message",
        errors: {
          required: "Required",
          invalidEmail: "Invalid email"
        },
        subjectOptions: [
          "Sales / New Plans",
          "Technical Support",
          "Billing / Payments",
          "Press / Partners",
          "Other"
        ]
      },
      info: {
        title: "Contact Information",
        items: [
          { icon: "mail", title: "Email", description: "General support", value: "support@ventaplus.com" },
          { icon: "phone", title: "Phone", description: "Mon-Fri 9am-6pm", value: "+54 11 5555-0123" },
          { icon: "location", title: "Offices", description: "Technical center", value: "Palermo, CABA, Argentina" }
        ]
      },
      demo: {
        title: "Prefer a live demo?",
        subtitle: "Schedule a 20-minute session with our team.",
        button: "Schedule demo"
      },
      ready: {
        title: "Ready to get started?",
        subtitle: "Create your free account and start selling in minutes.",
        primaryCta: "Create free account",
        secondaryCta: "View features"
      },
      faq: {
        title: "Frequently Asked Questions",
        subtitle: "Quick answers to common inquiries.",
        items: [
          { question: "Is there a maintenance fee?", answer: "No, our plans have a fixed monthly price with no hidden charges." },
          { question: "Is it compatible with any printer?", answer: "VentaPlus is compatible with most USB or Network EPSON and generic thermal printers." },
          { question: "How does it integrate with AFIP?", answer: "Integration is native. You just need to upload your digital certificate and fiscal POS in settings." }
        ]
      }
    },
  pricingPage: {
    hero: {
      title: "Plans that grow with you",
      subtitle: "Choose the perfect technological foundation to professionalize your business. No contracts, cancel anytime."
    },
    billing: {
      monthly: "month",
      yearly: "year"
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        { question: "Can I change my plan?", answer: "Yes, you can upgrade your plan at any time. The difference will be prorated in your next billing cycle." },
        { question: "What payment methods do you accept?", answer: "We accept all credit and debit cards through Stripe and Mercado Pago." },
        { question: "How does the trial period work?", answer: "We offer a forever free plan so you can test basic functions without time limits." }
      ]
    }
  },
  aboutPage: {
    hero: {
      eyebrow: "About Us",
      title: "Powering Argentine commerce",
      subtitle: "VentaPlus is a modern cloud-based point of sale system, designed specifically for kiosks, retail shops, and local businesses across Argentina."
    },
    stats: [
      { value: "1,000+", label: "Active Businesses" },
      { value: "50K+", label: "Monthly Transactions" },
      { value: "99.9%", label: "Uptime" },
      { value: "24/7", label: "Support Available" }
    ],
    mission: {
      eyebrow: "Our Mission",
      title: "Making commerce accessible to every business",
      p1: "We believe every store, kiosk, and market stand deserves access to professional tools that help them grow. VentaPlus was born from the frustration of seeing small business owners struggle with outdated, expensive, and complicated POS systems.",
      p2: "Our platform brings enterprise-level features like real-time inventory tracking, fiscal compliance with ARCA/AFIP, and powerful sales analytics — all in a package that's simple enough for anyone to use from day one."
    },
    values: {
      simplicity: {
        title: "Simplicity",
        description: "We build tools that are intuitive and easy to use. No complexity, no confusion."
      },
      reliability: {
        title: "Reliability",
        description: "Your business depends on us. We prioritize uptime, data safety, and consistent performance."
      },
      customerFirst: {
        title: "Customer-First",
        description: "Every feature we build starts with a real need from our users. Your feedback shapes our roadmap."
      },
      localFocus: {
        title: "Local Focus",
        description: "Built in Argentina, for Argentine businesses. We understand local regulations and challenges."
      }
    },
    cta: {
      title: "Ready to get started?",
      subtitle: "Join thousands of Argentine businesses already using VentaPlus to streamline their operations.",
      button: "Start Now",
      secondary: "Contact Sales"
    }
  },
  careersPage: {
    hero: {
      badge: "Careers",
      title: "Build the future of commerce in Argentina",
      subtitle: "Join us in making professional POS tools accessible to every business. We're a small, passionate team building something that matters."
    },
    whyJoin: {
      title: "Why join VentaPlus?",
      perks: [
        { icon: "🏠", title: "Remote-First", description: "Work from anywhere in Argentina or beyond." },
        { icon: "📈", title: "Growth", description: "Join an early-stage startup with real impact." },
        { icon: "💻", title: "Modern Stack", description: "Next.js, TypeScript, Supabase, and more." },
        { icon: "🗓️", title: "Flexibility", description: "Flexible hours that fit your life." },
        { icon: "🎯", title: "Ownership", description: "Take ownership of features end to end." },
        { icon: "🤝", title: "Team", description: "Small, collaborative team that values quality." }
      ]
    },
    openPositions: {
      title: "Open Positions",
      subtitle: "We don't have open positions right now, but we're always looking for talented people.",
      spontaneous: {
        title: "Spontaneous Applications",
        description: "Think you'd be a great fit? Send us your CV and tell us why you'd like to join VentaPlus.",
        button: "Send Your CV"
      }
    }
  },
  pressPage: {
    hero: {
      badge: "Press",
      title: "Press & Media",
      subtitle: "Resources and information for journalists and media professionals covering VentaPlus."
    },
    assets: {
      title: "Brand Assets",
      description: "Download our official logos, brand colors, and media kit for use in press publications.",
      logoLabel: "Official Logo",
      primaryBlue: "Primary Blue",
      darkBackground: "Dark Background"
    },
    inquiries: {
      title: "Press Inquiries",
      description: "For media inquiries, interviews, or partnership discussions, please reach out to our team.",
      location: "Buenos Aires, Argentina"
    },
    about: {
      title: "About VentaPlus",
      content: "VentaPlus is a cloud-based POS system built for Argentine businesses. Founded with the mission of making professional commerce tools accessible to every kiosk, shop, and retail business, VentaPlus offers integrated sales, inventory, fiscal compliance (ARCA/AFIP), and business analytics — all in one modern platform."
    }
  }
};

const translationsPt = {
  common: {
    __locale__: "pt-BR",
    language: "Idioma",
    spanish: "Español",
    english: "English",
    portuguese: "Português",
    darkMode: "Modo Escuro",
    lightMode: "Modo Claro",
    theme: "Tema",
    palette: "Paleta",
    minimal: "Minimal",
    balanced: "Equilibrado",
    vibrant: "Vibrante",
    apply: "Aplicar",
    settings: "Configurações",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    close: "Fechar",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    warning: "Aviso",
    info: "Informação",
    login: "Entrar",
    logout: "Sair",
    register: "Registrar",
    email: "Email",
    password: "Senha",
    confirmPassword: "Confirmar Senha",
    required: "Obrigatório",
    optional: "Opcional",
    features: "Recursos",
    pricing: "Preços",
    documentation: "Documentação",
    support: "Suporte",
    help: "Central de Ajuda",
    contact: "Contato",
    serviceStatus: "Status do Serviço",
    back: "Voltar",
    backToTop: "Voltar ao Topo",
    legal: "Legal",
    terms: "Termos de Serviço",
    privacy: "Privacidade",
    allRightsReserved: "Todos os direitos reservados",
    // Global error handling
    somethingWentWrong: "Algo deu errado",
    unexpectedError: "Ocorreu um erro inesperado. Por favor, tente novamente.",
    tryAgain: "Tentar novamente",
    goHome: "Ir para o início",
    pageNotFound: "Página não encontrada",
    pageNotFoundDesc: "A página que você procura não existe ou foi movida.",
    errorLoadingData: "Erro ao carregar os dados. Tente novamente.",
    errorLoadingReports: "Erro ao carregar os relatórios.",
    errorLoadingProducts: "Erro ao carregar os produtos.",
    errorLoadingStock: "Erro ao carregar o estoque.",
    errorLoadingProfile: "Erro ao carregar o perfil.",
    errorLoadingCategories: "Erro ao carregar as categorias.",
    errorUnexpected: "Ocorreu um erro inesperado na aplicação.",
    // Navigation & Structure
    product: "Produto",
    company: "Empresa",
    aboutUs: "Sobre Nós",
    careers: "Carreiras",
    contactSales: "Contatar Vendas",
    press: "Imprensa",
    integrations: "Integrações",
    security: "Segurança",
    helpCenter: "Central de Ajuda",
    tutorials: "Tutoriais",
    technicalDocs: "Documentação Técnica",
    contactSupport: "Contatar Suporte",
    startNow: "Começar Agora",
    home: "Início",
    // Descriptions
    featuresDesc: "Explore todos os recursos do POS",
    pricingDesc: "Planos que crescem com você",
    securityDesc: "Proteção de nível empresarial",
    // Footer
    footerDescription: "Sistema POS completo para negócios na Argentina. Gestão de vendas, estoque e faturamento fiscal.",
    afipCompliant: "Compatível com AFIP / ARCA",
    // Tutorials
    tutorialsTitle: "Aprenda VentaPlus",
    tutorialsSubtitle: "Guias passo a passo para dominar cada funcionalidade. Da configuração inicial aos relatórios fiscais avançados.",
    searchTutorials: "Buscar tutoriais...",
    needMoreHelp: "Precisa de mais ajuda?",
    contactSupportDescription: "Nossa equipe de suporte está pronta para ajudá-lo com qualquer dúvida sobre o VentaPlus.",
    noResults: "Sem resultados",
    tryDifferentSearch: "Tente um termo de busca diferente",
  },
  landing: {
    hero: {
      badge: "⭐ O sistema que seu negócio precisa",
      titleMain: "A base tecnológica para profissionalizar",
      titleHighlight: "seu negócio retail",
      titleLines: [
        "A base tecnológica",
        "para profissionalizar",
        "seu negócio retail",
      ],
      titleHighlightIndex: 2,
      description:
        "Vendas rápidas no balcão, controle de lucros diários e faturamento eletrônico ARCA integrado. Projetado para preparar sua empresa para crescer.",
      primaryCta: "Veja o sistema em ação",
      secondaryCta: "Começar grátis",
    },
    modules: {
      module1: {
        title: "Ponto de Venda Otimizado para Vendas de Balcão",
        description: "Vendas rápidas, fluxo ágil, projetado para trabalhar com teclado e leitor de código de barras.",
        image: "/images/new-features/new images/portugese/portguese POS page.png",
        features: [
          "Compatível com teclado numérico",
          "Integração com leitor de código de barras",
          "Ideal para horários de pico",
          "Interface clara e organizada"
        ]
      },
      module2: {
        title: "Controle Diário de Vendas e Margens",
        description: "Visualize receitas, despesas e lucros em tempo real com resumos automatizados.",
        image: "/images/new-features/new images/portugese/portguese Reports Page.png",
        features: [
          "Resumo diário automático",
          "Controle de caixa integral",
          "Relatórios simples para contabilidade",
          "Informações claras para tomada de decisão"
        ]
      },
      module3: {
        title: "Inventário Atualizado Automaticamente",
        description: "Cada venda impacta o estoque sem processos manuais ou etapas extras.",
        image: "/images/new-features/new images/portugese/portguese Product Management.png",
        features: [
          "Alertas de estoque baixo em tempo real",
          "Movimentos de estoque registrados",
          "Controle de precisão no nível do produto",
          "Histórico completo de inventário"
        ]
      },
      module4: {
        title: "Faturamento Eletrônico ARCA Integrado",
        description: "Emita documentos fiscais e cumpra as regulamentações diretamente do PDV.",
        image: "/images/new-features/new images/portugese/portugal Fiscal Reports - VAT.png",
        features: [
          "Suporte para Faturas A, B e C",
          "Notas de Crédito integradas",
          "Relatórios fiscais para seu contador",
          "Pronto para faturamento profissional"
        ]
      }
    },
    finalCta: {
      title: "Prepare Seu Negócio para Crescer",
      description: "Um sistema simples, pronto para faturamento fiscal e projetado para o ritmo real do varejo.",
      primaryCta: "Criar conta grátis",
      secondaryCta: "Veja o sistema em ação"
    },
    cta: {
      title: "Pronto para operar no balcão",
      subtitle:
        "Feito para quiosques, varejo pequeno e atendimento onde a velocidade importa.",
      startFreeNow: "Começar Grátis Agora →",
      noCard: "Sem cartão de crédito • Configuração em 2 minutos",
    },
    promoCta: {
      eyebrow: "Preços congelados",
      title: "Todos os planos congelados pelos seus primeiros 3 meses",
      subtitle: "Comece com todos os módulos ativos e escale pelo mesmo preço.",
      primaryCta: "Começar teste grátis",
    },
    pricingSection: {
      title: "Planos simples e escaláveis",
      subtitle:
        "Escolha o plano que melhor se adapta ao tamanho do seu negócio. Todos os preços em Pesos Argentinos (ARS).",
      billingTitle: "Ciclo de faturamento",
      billingMonthly: "Mensal",
      billingAnnual: "Anual",
      billingSavings: "Economize com o pagamento anual",
      mostPopular: "Recomendado",
      cta: "Começar agora",
      plans: [
        {
          name: "Essencial",
          monthly: "$14.999",
          annual: "$12.999",
          caption: "ARS por mês",
          usage: "1 usuário • Até 500 produtos",
          features: [
            "Ponto de Venda (PDV)",
            "Controle de estoque básico",
            "Gestão de despesas",
            "Sem faturamento ARCA",
          ],
        },
        {
          name: "Profissional",
          monthly: "$29.999",
          annual: "$25.999",
          caption: "ARS por mês",
          usage: "Até 3 usuários • Até 3.000 produtos",
          features: [
            "Faturamento ARCA incluído",
            "Notas de Crédito",
            "Gestão de Fornecedores",
            "Contas Correntes (Fiado)",
          ],
          featured: true,
        },
        {
          name: "Crescimento",
          monthly: "$54.999",
          annual: "$46.999",
          caption: "ARS por mês",
          usage: "Até 10 usuários • Até 10.000 produtos",
          features: [
            "Relatórios avançados",
            "Suporte Prioritário",
            "Multi-depósito",
            "Treinamento inicial",
          ],
        },
      ],
    },
    supportSection: {
      eyebrow: "Suporte",
      title: "Toda a nossa equipe ao seu serviço",
      subtitle:
        "A VentaPlus combina onboarding especializado, suporte ágil e orientação proativa para sua equipe nunca ficar sozinha.",
      items: [
        {
          title: "Pessoas reais quando você precisa",
          description:
            "Do onboarding à operação diária, nossos especialistas estão disponíveis por chat e email.",
        },
        {
          title: "Respostas rápidas, orientação clara",
          description:
            "Ajuda imediata com fluxos, integrações e configuração fiscal.",
        },
        {
          title: "Suporte que cresce com você",
          description:
            "Atendimento prioritário e acompanhamento de sucesso ajudam você a crescer com confiança.",
        },
      ],
    },
    testimonialsSection: {
      eyebrow: "Depoimentos",
      title: "O que nossos clientes dizem",
      subtitle:
        "Histórias reais de varejistas crescendo com a VentaPlus na Argentina.",
      metricCaption: "Verificado nos últimos 90 dias.",
      highlightLabel: "Destaque",
      highlightCaption:
        "Fluxos integrados, pronto para fiscal e permissões por equipe.",
      controls: {
        previous: "Depoimento anterior",
        next: "Próximo depoimento",
        dotPrefix: "Ver depoimento de",
      },
      items: [
        {
          id: "darjeeling",
          quote:
            "No meio da pandemia começamos com planilhas. Dois anos depois, a VentaPlus nos ajudou a operar três lojas com a mesma clareza do primeiro dia.",
          name: "Lali Hernández",
          role: "Fundadora, Darjeeling Goods",
          location: "Rosario, AR",
          metricLabel: "Precisão do estoque",
          metricValue: "98%",
          highlight: "Pronto para múltiplas lojas",
        },
        {
          id: "panaderia-central",
          quote:
            "Os caixas aprenderam o fluxo em uma tarde. O fechamento diário agora é uma rotina de 4 minutos e nossas margens finalmente estão visíveis.",
          name: "Matías Gutiérrez",
          role: "Operações, Panadería Central",
          location: "Córdoba, AR",
          metricLabel: "Fechamento diário mais rápido",
          metricValue: "4 min",
          highlight: "Margens claras",
        },
        {
          id: "almacen-norte",
          quote:
            "De comprovantes fiscais a alertas de estoque, tudo parece conectado. Finalmente confiamos nos números e podemos planejar compras com confiança.",
          name: "Carmen Ibáñez",
          role: "Proprietária, Almacén Norte",
          location: "Mendoza, AR",
          metricLabel: "Rupturas de estoque",
          metricValue: "-42%",
          highlight: "Pronto para fiscal",
        },
      ],
    },
    trustedDemo: {
      title: "Estas empresas já confiam na VentaPlus",
      demoTitle: "Gostaria de ver uma demonstração ao vivo?",
      demoSubtitle: "Cadastre-se no formulário abaixo e reserve a data!",
      demoCta: "Quero uma demo",
      demoImageAlt: "Demonstração da VentaPlus",
    },
    businessInsights: {
      heroEyebrow: "Seu negócio está a um clique",
      heroTitle: "Entenda como está o seu negócio o tempo todo",
      heroSubtitle:
        "Quer economizar horas com um clique? A VentaPlus simplifica a gestão, automatiza tarefas e organiza processos.",
      blocks: [
        {
          title: "Controle de caixa",
          subtitle: "Acompanhe caixa, bancos e totais diários.",
          description:
            "Monitore aberturas/fechamentos, totais diários e saldos em tempo real.",
          alt: "Painel de controle de caixa da VentaPlus",
        },
        {
          title: "Vendas e PDV",
          subtitle: "Venda rápido com o ponto de venda.",
          description:
            "Crie vendas em segundos, gerencie descontos e aceite dinheiro, cartão ou transferência.",
          alt: "Tela do ponto de venda da VentaPlus",
        },
        {
          title: "Despesas",
          subtitle: "Registre compras e pagamentos.",
          description:
            "Acompanhe fornecedores, vencimentos e categorias para manter o fluxo de caixa claro.",
          alt: "Tela de despesas da VentaPlus",
        },
        {
          title: "Estoque",
          subtitle: "Controle produtos e depósitos.",
          description:
            "Gerencie produtos, categorias, leitura de códigos e movimentos com rastreabilidade total.",
          alt: "Tela de estoque da VentaPlus",
        },
        {
          title: "Informações",
          subtitle: "Relatórios fiscais e de gestão.",
          description:
            "Gere relatórios de vendas, compras e IVA com resumos prontos para contabilidade e AFIP/ARCA.",
          cta: "Saiba mais",
          alt: "Tela de relatórios fiscais da VentaPlus",
        },
        {
          title: "Integrações",
          subtitle: "Pagamentos e serviços fiscais conectados.",
          description:
            "Integre faturamento eletrônico AFIP/ARCA e serviços fiscais para automatizar validações.",
          cta: "Saiba mais",
          alt: "Tela de integrações da VentaPlus",
        },
      ],
      bottomEyebrow: "Confiado por equipes em crescimento",
      bottomTitle: "Mais de 2.500 negócios usam a VentaPlus todos os dias",
      bottomSubtitle:
        "Centralize vendas, compras, estoque e fiscal em uma plataforma feita para o varejo real.",
      bottomCta: "Começar teste grátis",
      bottomNote: "Sem cartão de crédito",
      bottomImageAlt: "Visão geral da plataforma VentaPlus",
    },
    posPreview: {
      alt: "Equipe do minimercado usando POS",
      image: "/images/hero-pt.png",
    },
    designSystem: {
      badge: "Sistema de design",
      title: "Paletas e motion do VentaPlus",
      subtitle:
        "Compare variações de cor e micro-animações para uma interface confiável e moderna.",
      paletteTitle: "Variações de cor",
      paletteSubtitle:
        "Escolha a paleta que melhor expressa o tom da sua marca.",
      motionTitle: "Micro-animações",
      motionDescription:
        "Interações sutis reforçam qualidade sem distrair o fluxo de vendas.",
      cta: "Aplicar paleta",
      activeLabel: "Ativa",
      tokens: {
        primary: "Primário",
        accent: "Acento",
        surface: "Superfície",
        text: "Texto",
      },
      variants: [
        {
          key: "minimal",
          label: "Minimal",
          description: "Serena e discreta para ambientes de alta concentração.",
          traits: ["Baixo contraste", "Superfícies limpas", "Foco em dados"],
        },
        {
          key: "balanced",
          label: "Equilibrada",
          description: "Clareza moderna com legibilidade operacional.",
          traits: ["Contraste médio", "Botões legíveis", "Hierarquia clara"],
        },
        {
          key: "vibrant",
          label: "Vibrante",
          description: "Mais energia para equipes de varejo rápidas.",
          traits: ["Acentos vivos", "Feedback visível", "Marca em destaque"],
        },
      ],
      motionSamples: {
        primaryAction: "Ação principal",
        liveSync: "Sincronização",
        notification: "Notificação",
        notificationText: "Nova venda aprovada",
        auto: "Auto",
        menu: "Menu",
        hover: "Hover",
        sales: "Vendas",
        reports: "Relatórios",
        products: "Produtos",
        cash: "Caixa",
        note: "VentaPlus usa tech-blue como âncora de confiança e neutros suaves para manter o foco.",
      },
    },
  },
  dashboard: {
    welcome: "Bem-vindo",
    currentPlan: "Seu plano atual",
    planBasic: "Plano Básico (Teste)",
    planEsencial: "Plano Essencial",
    planProfesional: "Plano Profissional",
    planCrecimiento: "Plano Crescimento",
    upgradeToPro: "Melhorar Plano",
    status: "Status",
    nextRenewal: "Próxima Renovação",
    posSale: "Venda POS",
    cashRegister: "Caixa rápido",
    products: "Produtos",
    inventory: "Gerenciar inventário",
    reports: "Relatórios",
    analytics: "Ver análises",
    admin: "Admin",
    systemSettings: "Configurações do sistema",
    quickStats: "Estatísticas Rápidas",
    salesToday: "Vendas Hoje",
    totalRevenue: "Receita Total",
    supplierAlerts: "Alertas de Vencimento de Fornecedores",
    dueSoon: "Vencendo logo",
    overdue: "Atrasado",
  },
  ai: {
    common: {
      lockedTitle: "Análise Inteligente Bloqueada",
      upgradeNow: "Atualizar Agora",
    },
    rankings: {
      title: "Ranking Inteligente e Análise de Estoque",
      lockedDesc: "O ranking avançado de produtos e a análise de estagnação estão disponíveis no Plano PRO.",
      bestSellers: "Mais Vendidos (30d)",
      mostProfitable: "Maior Receita (30d)",
      stagnantProducts: "Produtos Estagnados",
      noStagnant: "Nenhum produto estagnado detectado.",
      inStock: "{count} em estoque",
      noSalesThirty: "0 vendas em 30 dias",
      strategyTitle: "Estratégia Recomendada",
      strategyDesc: "Com base em seus produtos estagnados, você tem aproximadamente {amount} em capital imobilizado. Sugerimos uma promoção ou desconto especial para liberar esses itens e o fluxo de caixa.",
      units: "unid",
    },
    forecast: {
      lockedDesc: "As projeções baseadas em IA estão disponíveis exclusivamente para usuários PRO.",
      title: "Projeção de Vendas (IA Leve)",
      sevenDays: "Previsão de 7 Dias",
      thirtyDays: "Previsão de 30 Dias",
      trend: "Tendência",
      trendUp: "Alta",
      trendDown: "Baixa",
      trendStable: "Estável",
      disclaimer: "* Baseado no comportamento de vendas das últimas 4 semanas.",
      howItWorksTitle: "Como funciona?",
      howItWorksDesc: "Nossa IA leve analisa seus padrões históricos de vendas, dando mais peso aos dias recentes. Esta previsão ajuda você a planejar compras e fluxos de caixa com maior precisão.",
      chartTitle: "Gráfico de Projeção e Tendência",
    },
    insights: {
      title: "IA Business Insights",
      subtitle: "Explore oportunidades de crescimento e alertas de estoque.",
      empty: "Nenhum insight encontrado no momento. Continue vendendo para que a IA detecte padrões.",
      stockOutTitle: "Estoque Crítico: {name}",
      stockOutDesc: "Seu produto estrela está acabando. Reponha o estoque para não perder vendas.",
      createOrder: "Criar Pedido",
      marginTitle: "Oportunidade de Margem: {name}",
      marginDesc: "Este produto tem uma margem de {margin}%. Considere uma promoção para aumentar os lucros.",
      viewProduct: "Ver Produto",
      crossSellTitle: "Sugestão: {p1} + {p2}",
      crossSellDesc: "Os clientes costumam comprar esses produtos juntos. Crie um combo para incentivar a venda.",
      seePromos: "Ver Promoções",
      lockedCardTitle: "IA Business Insights",
      lockedCardDesc: "Seus dados comerciais analisados com IA.",
      lockedCardBadge: "PRO",
      lockedCardTeaser: "Desbloqueie análises preditivas, alertas de estoque inteligentes e recomendações de vendas para maximizar seus lucros.",
      lockedCardButton: "Atualizar para PRO",
      growthTitle: "Crescimento de Vendas",
      growthDesc: "Sua receita aumentou {growth}% esta semana em comparação com a anterior. Bom trabalho!",
    },
    crossSell: {
      title: "Sugestões de Venda",
      desc: "Clientes que compraram isso também levaram...",
      add: "Adicionar",
      loading: "Buscando sugestões...",
    }
  },
  purchaseOrders: {
    title: "Ordens de Compra",
    subtitle: "Gerencie suas compras com inteligência artificial",
    newOrder: "Nova Ordem",
    stats: { total: "Total", draft: "Rascunho", sent: "Enviada", partial: "Parcial", received: "Recebida", cancelled: "Cancelada" },
    filters: { searchPlaceholder: "Buscar por número ou fornecedor...", allStatuses: "Todos os estados" },
    table: { number: "Número", supplier: "Fornecedor", date: "Data", status: "Status", items: "Itens", totalEst: "Total Est.", actions: "Ações", send: "Enviar", receive: "Receber", noOrders: "Sem ordens de compra", noOrdersSubtitle: "Crie sua primeira ordem com sugestões inteligentes", code: "Código" },
    create: { title: "Nova Ordem de Compra", subtitle: "Use sugestões de IA ou adicione produtos manualmente", generalInfo: "Informação Geral", supplier: "Fornecedor *", selectSupplier: "Selecionar fornecedor", deliveryDate: "Entrega Estimada", warehouse: "Almoxarifado / Filial", warehousePlaceholder: "Filial Principal", notes: "Notas", notesPlaceholder: "Notas opcionais", aiSuggestions: "Sugestões Inteligentes", coverage: "Cobertura:", days: "{count} dias", generate: "Gerar", analyzing: "Analisando...", suggestedProducts: "{count} produtos sugeridos", addAll: "+ Adicionar todos", manualAdd: "Adicionar Manual", selectProduct: "Selecionar produto", quantity: "Quantidade", cost: "Costo", add: "Adicionar", summary: "Resumo", totalUnits: "Unidades", totalEstimated: "Total Estimado", createButton: "Criar Ordem", unitAbr: "unid", aiPill: "IA", noSuggestions: "Nenhuma sugestão encontrada para este fornecedor.", noSuggestionsSubtitle: "Vincular produtos a este fornecedor ou registrar mais vendas ajudará a IA.", unlinkedWarning: "Este produto não está vinculado a este fornecedor.", autoLinkCheckbox: "Vincular produto ao fornecedor (salvar custo e lead time)" },
    detail: { back: "Voltar", orderNumber: "Ordem #", receivedAt: "Recebida em", cancelledAt: "Cancelada em", finalTotal: "Total Final", requested: "Solicitado", received: "Recebido", costEst: "Custo Est.", costFinal: "Custo Final", subtotal: "Subtotal", receiveAction: "Registrar Recebimento" },
    reception: { title: "Recebimento", subtitle: "Registre quantidades recebidas e custos finais", alreadyReceived: "Já Recebido", receiveNow: "Receber Agora", confirm: "Confirmar Recebimento" },
    priorities: { critical: "Crítico", high: "Alto", medium: "Médio", low: "Baixo" },
    toasts: { alreadyAdded: "Produto já adicionado", added: "{name} adicionado", addedMany: "{count} produtos adicionados", created: "Ordem de compra criada com sucesso", sent: "Ordem enviada", received: "Recebimento registrado com sucesso", cancelled: "Ordem cancelada", error: "Erro ao processar a solicitação", linked: "Produto vinculado ao fornecedor com sucesso" },
    reasons: {
      noStock: "⚠️ Sem estoque - Reposição urgente",
      criticalStock: "⚠️ Estoque crítico ({days} dias restantes)",
      lowStock: "🔶 Estoque baixo - cobrirá {days} dias",
      recommended: "📊 Reposição recomendada",
      preventive: "✅ Reposição preventiva",
      growingTrend: "📈 Tendência crescente (+{percent}%)",
      decliningTrend: "📉 Tendência de queda ({percent}%)",
      dailySales: "Venda diária: {amount} {unit}",
      noRotation: "📦 Reposição inicial (sem vendas registradas)"
    },
  },
  errors: {
    generic: "Algo deu errado. Por favor, tente novamente",
    unauthorized: "Não autorizado",
    invalidOrExpiredToken: "Token inválido ou expirado",
    missingAuthHeader: "Cabeçalho de autorização ausente",
    forbidden: "Acesso negado",
    notFound: "Não encontrado",
    serverError: "Erro do servidor",
    networkError: "Erro de conexão",
    validationError: "Erro de validação",
    productCodeRequired: "O código do produto é obrigatório",
    productNameRequired: "O nome do produto é obrigatório",
    productPriceRequired: "O preço do produto é obrigatório",
    invalidPrice: "O preço deve ser um número válido",
    productCreated: "Produto criado com sucesso",
    productUpdated: "Produto atualizado com sucesso",
    productDeleted: "Produto excluído com sucesso",
    errorCreatingProduct: "Erro ao criar o produto",
    errorUpdatingProduct: "Erro ao atualizar o produto",
    errorDeletingProduct: "Erro ao excluir o produto",
    errorFetchingProducts: "Erro ao buscar os produtos",
    invalidEmail: "Endereço de email inválido",
    passwordTooShort: "A senha deve ter pelo menos 6 caracteres",
    passwordsDoNotMatch: "As senhas não correspondem",
    userAlreadyExists: "O usuário já existe",
    invalidCredentials: "Credenciais inválidas",
    orderNotFound: "Ordem de compra não encontrada",
    onlyDraftSent: "Apenas ordens em rascunho podem ser enviadas",
    onlyDraftEdited: "Apenas ordens em rascunho podem ser editadas",
    orderStatusInvalid: "Esta ordem não pode receber itens em seu estado atual",
    orderAlreadyCancelled: "Esta ordem já foi recebida ou cancelada",
    itemsRequired: "Pelo menos um item é obrigatório",
    sessionExpired: "Sua sessão expirou. Faça login novamente",
    errorSaving: "Erro ao salvar",
    errorLoading: "Erro ao carregar",
    errorDeleting: "Erro ao excluir",
    noOpenCashRegister: "Nenhum caixa aberto",
    invalidAction: "Ação inválida",
    invalidAmount: "Valor inválido",
    internalServerError: "Erro interno do servidor",
    missingRequiredFields: "Campos obrigatórios ausentes",
    errorLoadingConfig: "Erro ao carregar configuração",
    clientNameRequired: "Você deve inserir o nome do cliente",
    cuitRequired: "CUIT é obrigatório para faturas ARCA",
    ivaTypeRequired: "Selecione o tipo de IVA para faturas ARCA",
    companyNameRequired: "Nome da empresa é obrigatório",
    cuitRucDniRequired: "CUIT/RUC/CPF é obrigatório",
    billingEmailRequired: "Email de faturamento é obrigatório",
    errorSavingSupplier: "Erro ao salvar fornecedor",
    supplierDeletedSuccess: "Fornecedor excluído com sucesso",
    errorDeletingSupplier: "Erro ao excluir fornecedor",
    selectValidCSV: "Por favor, selecione um arquivo CSV válido",
    emptyCSVFile: "O arquivo CSV está vazio ou não tem dados",
    csvMustContainName: 'O CSV deve conter pelo menos a coluna "nome"',
    noValidSuppliersFound: "Nenhum fornecedor válido encontrado no arquivo",
    errorProcessingCSV: "Erro ao processar arquivo CSV",
    suppliersImportedSuccess: (count: number) =>
      `${count} fornecedores importados com sucesso`,
    errorLoadingSales: "Erro ao carregar vendas",
    errorRegisteringPurchase: "Erro ao registrar compra",
    purchaseRegisteredSuccess: "Compra registrada com sucesso!",
    paymentError: "Erro no pagamento",
    errorCompletingSale: "Erro ao completar venda",
    errorProcessingSale: "Erro ao processar venda. Tente novamente",
    noDataToExport: "Nenhum dado para exportar",
    confirmDeleteExpense: "Tem certeza de que deseja excluir esta despesa?",
    productCodeExists: "O código do produto já existe",
    emailInUse: "O email já está em uso",
    cannotDeleteSelf: "Você não pode se excluir",
    invalidPlanId: "Plano inválido",
    noFileReceived: "Nenhum arquivo recebido",
    invalidFile: "Arquivo inválido",
    errorImportingProducts: "Erro ao importar produtos",
  },
  messages: {
    welcome: "Bem-vindo",
    goodbye: "Adeus",
    confirmDelete: "Tem certeza de que deseja excluir isso?",
    confirmAction: "Tem certeza?",
    processing: "Processando...",
    loading: "Carregando...",
    noResults: "Sem resultados",
    noData: "Nenhum dado disponível",
  },
  auth: {
    login: {
      title: "Entrar",
      email: "Email",
      password: "Senha",
      submit: "Entrar",
      forgotPassword: "Esqueceu sua senha?",
      noAccount: "Não tem uma conta?",
      registerLink: "Registrar",
    },
    forgotPassword: {
      title: "Recuperar Senha",
      subtitle:
        "Digite seu email e enviaremos um link para redefinir sua senha",
      email: "Email",
      submit: "Enviar Link de Recuperação",
      backToLogin: "Voltar ao login",
      emailSent: "Email enviado",
      emailSentMessage:
        "Se existir uma conta com esse email, você receberá um link de recuperação",
    },
    resetPassword: {
      title: "Redefinir Senha",
      subtitle: "Digite sua nova senha",
      password: "Nova Senha",
      confirmPassword: "Confirmar Nova Senha",
      submit: "Redefinir Senha",
      success: "Senha redefinida com sucesso",
      invalidToken: "O link de recuperação é inválido ou expirou",
    },
    register: {
      title: "Registrar",
      fullName: "Nome Completo",
      email: "Email",
      password: "Senha",
      confirmPassword: "Confirmar Senha",
      submit: "Criar Conta",
      haveAccount: "Já tem uma conta?",
      loginLink: "Entrar",
    },
  },
  pricing: {
    title: "Planos simples e transparentes",
    subtitle: "Feito para quiosques, mercearias e minimercados",
    free: "Plano Gratuito",
    freePrice: "$0",
    freeSubtitle: "para sempre",
    freeDescription: "Ideal para começar",
    pro: "Plano Pro",
    proPrice: "$24.990",
    proSubtitle: "ARS/mês",
    proDescription: "Sem limites para crescer",
    mostPopular: "Mais Popular",
    freeFeatures: [
      "Até 100 produtos",
      "Até 2 usuários",
      "Ponto de venda completo",
      "Controle de caixa",
      "Relatórios básicos",
      "Estoque básico",
    ],
    proFeatures: [
      "Produtos ilimitados",
      "Usuários ilimitados",
      "Tudo do plano gratuito",
      "Gerenciamento de clientes",
      "Vendas a crédito",
      "Gerenciamento de despesas",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
    startFree: "Começar Gratuitamente",
    tryFree: "Tente 14 dias grátis",
  },
  subscriptionProModal: {
    titlePrefix: "Assinatura -",
    billingInfo: "Informações de faturamento",
    fields: {
      businessNameLabel: "Nome da Empresa",
      businessNamePlaceholder: "Nome da sua empresa",
      cuitRucDniLabel: "CUIT/RUC/CPF",
      cuitRucDniPlaceholder: "20-12345678-9",
      billingEmailLabel: "Email de Faturamento",
      billingEmailPlaceholder: "faturamento@suaempresa.com",
      phoneLabel: "Telefone",
      phonePlaceholder: "+55 11 91234-5678",
    },
    buttons: {
      continuePayment: "Continuar para o Pagamento",
      processing: "Processando...",
    },
  },
  navigation: {
    home: "Início",
    dashboard: "Painel de Controle",
    products: "Produtos",
    sales: "Vendas",
    customers: "Clientes",
    reports: "Relatórios",
    settings: "Configurações",
    profile: "Perfil",
  },
  profile: {
    title: "Perfil",
    account: "Conta",
    loading: "Carregando perfil",
    personalInfo: "Informação pessoal",
    userData: "Dados do usuário",
    updateDescription: "Atualize seu nome e email. A senha é opcional.",
    goToDashboard: "Ir ao painel",
    fullName: "Nome completo",
    email: "Email",
    phone: "Telefone",
    phonePlaceholder: "Ex: +55 11 91234 5678",
    role: "Função",
    businessName: "Nome do negócio",
    businessPlaceholder: "Seu comércio",
    password: "Senha (opcional)",
    passwordPlaceholder: "Deixe em branco para manter",
    reset: "Redefinir",
    save: "Salvar alterações",
    updateSuccess: "Perfil atualizado com sucesso",
    updateError: "Não foi possível salvar. Tente novamente.",
    updateErrorGeneric: "Não foi possível atualizar o perfil",
    back: "Voltar",
  },
  pos: {
    header: {
      tagline: "Ponto de Venda na Nuvem",
      cashRegisterOpen: "Caixa Aberta",
    },
    nav: {
      posSale: "Ponto de Venda",
      cashRegister: "Caixa",
      products: "Produtos",
      categories: "Categorias",
      stock: "Estoque",
      clients: "Clientes",
      suppliers: "Fornecedores",
      goodsReceipts: "Recebimento de Mercadoria",
      supplierReturns: "Devoluções ao Fornecedor",
      supplierDocuments: "Documentos de Fornecedor",
      paymentOrders: "Ordens de Pagamento",
      expenses: "Despesas",
      expenseAnalytics: "Inteligência de Despesas",
      reports: "Relatórios",
      fiscalReports: "Relatórios Fiscais",
      users: "Usuários",
      businessConfig: "Configurações de Negócio",
      planComparison: "Comparação de Planos",
      sales: "Vendas",
      purchaseOrders: "Ordens de Compra",
    },
    salesPage: {
      title: "Histórico de Vendas",
      subtitle: "Gerencie e visualize todas as suas vendas e notas fiscais",
      tabList: "Lista de Vendas",
      tabAnalytics: "Análise",
      dateFrom: "Data Início",
      dateTo: "Data Fim",
      paymentState: "Estado Pagamento",
      all: "Todos",
      completed: "Concluídas",
      pending: "Pendentes",
      failed: "Falhadas",
      partial: "Parciais",
      search: "Pesquisar",
      loading: "Carregando...",
      noSalesFound: "Sem vendas para o período selecionado",
      date: "Data",
      receipt: "Comprovante",
      seller: "Vendedor",
      amount: "Valor",
      method: "Método",
      status: "Status",
      arca: "ARCA",
      actions: "Ações",
      view: "Ver",
      retry: "Retentar",
      retrying: "Retentando...",
      noInvoice: "S/N",
      unknownUser: "Usuário",
      arcaApproved: "Aprovado",
      arcaPending: "CAE Pendente",
      arcaRejected: "Rejeitado",
      arcaCancelled: "Cancelado",
      totalSales: "Total de Vendas",
      totalRevenue: "Receita Total",
      averageTicket: "Ticket Médio",
      totalTax: "IVA Total 21%",
      byPaymentMethod: "Por Método de Pagamento",
      cash: "Dinheiro",
      card: "Cartão",
      online: "Online",
      mercadopago: "Mercado Pago",
      checkPayment: "Cheque",
      qr: "QR",
      bankTransfer: "Transferência",
      multiple: "Múltiplo",
      byPaymentStatus: "Por Status de Pagamento",
      retryCaeSuccess: "CAE obtido com sucesso",
      retrySent: "Retentativa enviada",
      retryError: "Erro ao retentar nota fiscal",
      connectionError: "Erro de conexão ao retentar",
      loadingPage: "Carregando vendas...",
      saleDetail: "Detalhe da Venda",
      invoiceNumber: "Nº Comprovante",
      paymentMethod: "Método de Pagamento",
      paymentStatus: "Status de Pagamento",
      arcaStatus: "Status ARCA",
      arcaError: "Erro ARCA",
      ivaType: "Tipo IVA",
      cae: "CAE",
      caeExpiry: "Vencimento CAE",
      items: "Itens",
      product: "Produto",
      qty: "Qtd.",
      unitPrice: "Preço Unit.",
      itemDiscount: "Desc.",
      itemTotal: "Total",
      subtotal: "Subtotal",
      tax: "IVA",
      discount: "Desconto",
      total: "Total",
      close: "Fechar",
      retryInvoice: "Retentar Nota Fiscal",
      noItems: "Sem itens",
      channel: "Canal",
      createdAt: "Data Criação",
      notes: "Notas",
      arcaErrFacturaAConsumidorFinal:
        "Fatura A não é válida para Consumidor Final. Só pode ser emitida entre Contribuintes Registrados.",
      arcaErrDocTipoInvalido:
        "O tipo de documento do destinatário não é válido para este comprovante.",
      arcaErrCuitInvalido:
        "O CUIT do destinatário é inválido ou não está registrado.",
      arcaErrCbteDesde: "Erro na numeração do comprovante (CbteDesde).",
      arcaErrCbteHasta: "Erro na numeração do comprovante (CbteHasta).",
      arcaErrDuplicado:
        "Este comprovante já foi autorizado anteriormente (duplicado).",
      arcaErrCertificado:
        "Erro no certificado digital. Verifique se está vigente e configurado corretamente.",
      arcaErrTimeout: "A conexão com ARCA/AFIP expirou. Tente novamente.",
      arcaErrConexion:
        "Não foi possível conectar aos servidores ARCA/AFIP. Verifique sua conexão.",
      arcaErrCancelada: "Esta fatura foi cancelada manualmente.",
      arcaErrIvaObligatorio:
        "Quando o valor líquido é maior que 0, o detalhe do IVA é obrigatório. Verifique a configuração de impostos.",
      arcaErrMontoTotal:
        "O valor total não coincide com a soma dos componentes. Verifique subtotal, IVA e descontos.",
      arcaErrPtoVta:
        "O ponto de venda não corresponde ou não está habilitado para esta operação.",
      arcaErrFechaFueraRango:
        "A data do comprovante está fora do intervalo permitido pela AFIP.",
      arcaErrDocTipoMustBeCuit:
        "Fatura A requer CUIT do destinatário (DocTipo 80). Corrigido automaticamente para Fatura B. Tente novamente.",
      arcaErrDocNroInvalido:
        "O número de documento do destinatário é inválido. Verifique o CUIT informado.",
      arcaErrCondicionIvaReceptor:
        "A condição de IVA do destinatário não é válida para este tipo de comprovante. Será corrigida automaticamente. Tente novamente.",
      arcaOriginalError: "Mensagem original",
      api_INVOICE_NOT_FOUND: "Nota fiscal não encontrada.",
      api_NOT_ARCA: "Não é uma nota fiscal ARCA.",
      api_ALREADY_AUTHORIZED: "Esta nota fiscal já está autorizada.",
      api_CANCELLED_CANNOT_RETRY:
        "Não é possível retentar uma nota cancelada. Crie uma nova venda.",
      api_NO_FISCAL_CONFIG: "Configuração fiscal não encontrada.",
      api_INCOMPLETE_FISCAL_CONFIG:
        "Configuração fiscal incompleta (certificado/chave/CUIT).",
      api_RETRY_FAILED: "Erro ao retentar a nota fiscal. Tente novamente.",
      api_CAE_SUCCESS: "CAE obtido com sucesso.",
      receiptUnavailable:
        "Não é possível exibir o comprovante para esta venda.",
      receiptBlocked_REJECTED:
        "O comprovante foi rejeitado pela ARCA/AFIP. Não é possível imprimir até resolver o problema.",
      receiptBlocked_CANCELED_BY_NC:
        "Esta venda foi cancelada por nota de crédito. Não é possível reimprimir.",
      receiptBlocked_CAE_REQUIRED:
        "Autorização CAE da AFIP é necessária para imprimir este comprovante. Retente a nota fiscal primeiro.",
    },
    labels: {
      add: "Adicionar",
      edit: "Editar",
      delete: "Excluir",
      save: "Salvar",
      cancel: "Cancelar",
      search: "Pesquisar",
      filter: "Filtrar",
      sort: "Classificar",
      import: "Importar",
      export: "Exportar",
      print: "Imprimir",
      actions: "Ações",
      name: "Nome",
      description: "Descrição",
      price: "Preço",
      code: "Código",
      quantity: "Quantidade",
      total: "Total",
      subtotal: "Subtotal",
      tax: "Imposto",
      discount: "Desconto",
      payment: "Pagamento",
      customer: "Cliente",
      date: "Data",
      time: "Hora",
      status: "Status",
      active: "Ativo",
      inactive: "Inativo",
      pending: "Pendente",
      completed: "Concluído",
      cancelled: "Cancelado",
    },
    messages: {
      confirmDelete: "Tem certeza de que deseja excluir isso?",
      noData: "Sem dados disponíveis",
      loading: "Carregando...",
      errorLoading: "Erro ao carregar dados",
      clientFetchError: "Erro ao carregar clientes",
      selectClient: "Selecionar cliente...",
      noClients: "Nenhum cliente",
      clientsUpgradeRequired:
        "Pesquisa de clientes disponível apenas no plano Pro",
      errorCreating: "Erro ao criar item",
      errorUpdating: "Erro ao atualizar item",
      errorDeleting: "Erro ao excluir item",
      successCreate: "Item criado com sucesso",
      successUpdate: "Item atualizado com sucesso",
      successDelete: "Item excluído com sucesso",
      required: "Este campo é obrigatório",
      selectOne: "Por favor selecione um item",
    },
    pages: {
      pos: {
        title: "Ponto de Venda",
        noProducts: "Sem produtos para vender",
        selectProduct: "Selecione um produto",
        quantity: "Quantidade",
        addToCart: "Adicionar ao Carrinho",
        cart: "Carrinho",
        total: "Total",
        clearCart: "Limpar Carrinho",
        checkout: "Checkout",
        cash: "Dinheiro",
        card: "Cartão",
        transfer: "Transferência",
      },
      products: {
        title: "Produtos",
        addProduct: "Adicionar Produto",
        editProduct: "Editar Produto",
        deleteProduct: "Excluir Produto",
        productCode: "Código do Produto",
        productName: "Nome do Produto",
        description: "Descrição",
        price: "Preço",
        cost: "Custo",
        quantity: "Quantidade",
        category: "Categoria",
        supplier: "Fornecedor",
        barcode: "Código de Barras",
      },
      categories: {
        title: "Categorias",
        addCategory: "Adicionar Categoria",
        editCategory: "Editar Categoria",
        deleteCategory: "Excluir Categoria",
        categoryName: "Nome da Categoria",
        description: "Descrição",
      },
      stock: {
        title: "Estoque",
        inventory: "Inventário",
        quantity: "Quantidade",
        alertLevel: "Nível de Alerta",
        lastUpdate: "Última Atualização",
        adjustStock: "Ajustar Estoque",
        stockHistory: "Histórico de Estoque",
      },
      clients: {
        title: "Clientes",
        addClient: "Adicionar Cliente",
        editClient: "Editar Cliente",
        deleteClient: "Excluir Cliente",
        name: "Nome",
        email: "Email",
        phone: "Telefone",
        address: "Endereço",
        city: "Cidade",
        state: "Estado",
        zipCode: "CEP",
        creditLimit: "Limite de Crédito",
        creditUsed: "Crédito Usado",
      },
      suppliers: {
        title: "Fornecedores",
        addSupplier: "Adicionar Fornecedor",
        editSupplier: "Editar Fornecedor",
        deleteSupplier: "Excluir Fornecedor",
        name: "Nome",
        email: "Email",
        phone: "Telefone",
        address: "Endereço",
        city: "Cidade",
        state: "Estado",
        contact: "Contato",
      },
      expenses: {
        title: "Despesas",
        addExpense: "Adicionar Despesa",
        editExpense: "Editar Despesa",
        deleteExpense: "Excluir Despesa",
        description: "Descrição",
        amount: "Valor",
        category: "Categoria",
        date: "Data",
        paymentMethod: "Método de Pagamento",
      },
      reports: {
        title: "Relatórios",
        salesReport: "Relatório de Vendas",
        stockReport: "Relatório de Estoque",
        expensesReport: "Relatório de Despesas",
        clientsReport: "Relatório de Clientes",
        profitReport: "Relatório de Lucro",
        dateRange: "Intervalo de Datas",
        exportPDF: "Exportar para PDF",
        exportExcel: "Exportar para Excel",
        totalSales: "Total de Vendas",
        totalExpenses: "Total de Despesas",
        totalProfit: "Total de Lucro",
      },
      cashRegister: {
        title: "Caixa",
        openCash: "Abrir Caixa",
        closeCash: "Fechar Caixa",
        balance: "Saldo",
        initialAmount: "Valor Inicial",
        finalAmount: "Valor Final",
        expected: "Esperado",
        actual: "Real",
        difference: "Diferença",
        cashRegisterId: "ID do Caixa",
        openedBy: "Aberto por",
        closedBy: "Fechado por",
        openTime: "Hora de Abertura",
        closeTime: "Hora de Fechamento",
        status: "Status",
        open: "Aberto",
        closed: "Fechado",
        movements: {
          opening: "Abertura de caixa",
          withdrawal: "Retirada de caixa",
          creditNote: "Nota de crédito",
          noReason: "Sem motivo especificado",
        },
      },
    },
    ui: {
      loading: "Carregando POS...",
      title: "PDV - {role}",
      closedTitle: "Caixa Fechada",
      closedDescription:
        'Você deve abrir uma caixa na seção "Controle de Caixa" para começar a vender',
      scanPlaceholder: "Escanear ou digitar código de barras... (F6)",
      searchPlaceholder: "Buscar produto por nome ou código... (F5)",
      searching: "Pesquisando...",
      statusOnline: "Online",
      statusSync: "Sync 0s",
      statusPrinter: "Impressora OK",
      tipsTitle: "Dicas rápidas:",
      tipsBodyStart: "Use o leitor de código ou busque pelo nome. Navegue com",
      tipsBodyEnd: "e pressione",
      tipsBodyAdd: "para adicionar.",
      startTyping: "Comece a digitar para buscar",
      noProductsFound: "Nenhum produto encontrado",
      codeLabel: "Código:",
      stockLabel: "Estoque:",
      addButton: "Adicionar",
      cartTitle: "Carrinho",
      clearCart: "Limpar Carrinho",
      cartEmpty: "Carrinho vazio",
      cartEmptySubtitle: "Escaneie ou busque produtos para começar",
      remove: "Remover",
      quantity: "Qtd.",
      discount: "Desconto",
      total: "Total",
      subtotal: "Subtotal",
      totalDiscount: "Desconto",
      tax21: "IVA 21%",
      discountLimitExceeded: "O desconto excede seu limite",
      discountInvalid: "Desconto inválido",
      discountNegative: "O desconto deve ser 0 ou maior",
      discountExceedsSubtotal:
        "O desconto não pode exceder o subtotal da linha",
      discountExceedsUserLimit: "O desconto excede seu limite",
      weightQuantityHint:
        "Use . para decimais e , para milhares (ex.: 1.560 ou 1,560)",
      paymentMethod: "Forma de Pagamento",
      paymentOptions: {
        cash: "Dinheiro",
        card: "Cartão",
        check: "Cheque",
        online: "Online",
        bankTransfer: "Transferência Bancária",
        qr: "Código QR",
        account: "Conta corrente",
      },
      accountLabel: "Conta",
      balanceLabel: "Saldo",
      balanceDueLabel: "Saldo em aberto",
      balanceCreditLabel: "Saldo a favor",
      viewAccount: "Ver conta",
      accountTitle: "Conta do cliente",
      registerPayment: "Registrar pagamento",
      paymentAmount: "Valor",
      paymentNote: "Detalhe",
      savePayment: "Salvar pagamento",
      accountMovements: "Movimentos",
      noAccountMovements: "Sem movimentos",
      accountCharge: "Cobrança",
      accountPayment: "Pagamento",
      accountAdjustment: "Ajuste",
      accountLoadError: "Erro ao carregar conta",
      accountPaymentSaved: "Pagamento registrado",
      accountPaymentError: "Erro ao registrar pagamento",
      accountRequiresClient: "Selecione um cliente para cobrar na conta",
      accountInvalidAmount: "Valor inválido",
      accountOverpayError: "O pagamento excede o saldo em aberto",
      processing: "Processando...",
      checkout: "Finalizar Venda",
      checkoutSuccess: "Venda concluída com sucesso!",
      checkoutError: "Erro ao finalizar a venda",
      checkoutProcessError: "Erro ao processar a venda. Tente novamente.",
      insufficientStock:
        "Estoque insuficiente para {name}. Disponível: {available}, solicitado: {requested}",
      // Sale error codes (from API errorCode)
      cuitRequiredRI: "CUIT é obrigatório para Contribuinte Registrado",
      cuitInvalidFormat: "O CUIT deve ter 11 dígitos",
      saleErr_NO_ITEMS: "Adicione produtos ao carrinho antes de vender",
      saleErr_CUSTOMER_NAME_REQUIRED: "O nome do cliente é obrigatório",
      saleErr_IVA_TYPE_REQUIRED: "Selecione o tipo de IVA para faturas ARCA",
      saleErr_CUIT_REQUIRED_RI:
        "CUIT é obrigatório para Contribuinte Registrado",
      saleErr_CUIT_INVALID_FORMAT: "O CUIT deve ter 11 dígitos",
      saleErr_REGISTER_NOT_OPEN: "O caixa não está aberto",
      saleErr_INVALID_QUANTITY: "Quantidade inválida",
      saleErr_QUANTITY_ZERO: "A quantidade deve ser maior que 0",
      saleErr_PRODUCT_NOT_FOUND: "Produto não encontrado",
      saleErr_INSUFFICIENT_STOCK: "Estoque insuficiente",
      saleErr_INVALID_DISCOUNT: "Desconto inválido",
      saleErr_DISCOUNT_NEGATIVE: "O desconto deve ser 0 ou maior",
      saleErr_DISCOUNT_EXCEEDS_LINE:
        "O desconto não pode exceder o subtotal da linha",
      saleErr_DISCOUNT_EXCEEDS_LIMIT: "O desconto excede seu limite",
      saleErr_DISCOUNT_EXCEEDS_SUBTOTAL:
        "O desconto não pode exceder o subtotal",
      saleErr_PRICE_MISMATCH: "Preço do produto não corresponde",
      saleErr_USER_NOT_FOUND: "Usuário não encontrado",
      saleErr_MERCADOPAGO_FAILED:
        "Falha ao processar pagamento com Mercado Pago",
      saleErr_SERVER_ERROR: "Erro interno do servidor. Tente novamente.",
      // POS receipt modal labels
      paymentAccount: "Conta corrente",
      finalConsumer: "Consumidor Final",
      arcaRespondedOk: "ARCA respondeu OK",
      pendingCaeRetry: "Pendente de CAE — será retentado automaticamente",
      arcaNotResponding: "ARCA não responde",
      invoiceTypeLabel: "Tipo de Fatura:",
      internalNonFiscal: "Interna (Não Fiscal)",
      arcaFiscalInvoice: "ARCA (Fatura Fiscal)",
      optional: "Opcional",
      vatTypeLabel: "Tipo IVA",
      registeredTaxpayer: "Responsável Inscrito",
      monotributista: "Monotributista",
      vatExempt: "Isento de IVA",
      uncategorizedIva: "Não Categorizado",
      salesReceipt: "Recibo de Venda",
      cashRegisterStatusError: "Erro ao carregar status do caixa",
      businessConfigError: "Erro ao carregar configurações do negócio",
      provisionalDocType: "COMPROVANTE PROVISÓRIO",
      provisionalPendingCae: "COMPROVANTE PROVISÓRIO — PENDENTE DE CAE",
      budgetNotValidAsInvoice: "ORÇAMENTO — NÃO VÁLIDO COMO FATURA",
      documentTypeLabel: "Tipo de documento:",
      numberingLabel: "Numeração:",
      pendingStatus: "Pendente...",
      caeExpirationLabel: "Vto. CAE:",
      fiscalQrLabel: "QR Fiscal:",
      yes: "Sim",
      pendingSingle: "Pendente",
      fiscalValidityLabel: "Validade fiscal:",
      validOnceApproved: "Válido quando aprovado",
      usageLabel: "Uso:",
      printBehaviorLabel: "Impressão:",
      editingLabel: "Edição:",
      taxLabel: "Imposto (21%):",
      roles: {
        admin: "Administrador",
        supervisor: "Supervisor",
        cashier: "Caixa",
        user: "Usuário",
      },
      // Keyboard POS translations
      keyboardPOS: "PDV por Teclado",
      quantityFirst: "Digite a quantidade primeiro, depois o código do produto",
      productCodeBarcode: "Código do Produto / Código de Barras",
      scanOrEnterCode: "Escaneie ou digite o código...",
      pressEnterToAdd: "Pressione Enter para adicionar • Esc para cancelar",
      keyboardShortcuts: "Atalhos de Teclado",
      confirmAdd: "Confirmar / Adicionar",
      cancel: "Cancelar / Limpar",
      multiplier: "Multiplicador (50*código)",
      changeCustomer: "Mudar cliente",
      findCustomer: "Buscar cliente",
      newCustomer: "Novo cliente",
      removeCustomer: "Remover cliente",
      examples: "Exemplos",
      example1:
        "Digite '5' → Enter → Escaneie/Digite código → Enter = 5 unidades",
      example2: "Digite '0.325' → Enter → Escaneie = 0.325 kg",
      example3:
        "Digite '50*697202601252361' → Enter = 50 unidades instantaneamente",
      quantityHint: "Digite a quantidade ou use multiplicador: 50*código",
      enterProductCode: "Por favor, digite um código de produto",
      invalidQuantity: "Quantidade inválida",
      productNotFound: "Produto não encontrado",
      outOfStock: "Produto sem estoque",
      addedToCart: "adicionado ao carrinho",
      errorAddingProduct: "Erro ao adicionar produto",
      changeCustomerType: "Mudar tipo de cliente",
      searchCustomer: "Buscar cliente",
      advancedSearch: "Busca Avançada",
      clickToExpand: "Clique para expandir",
      fiscalComparison: {
        title: "Recibo Provisório vs Fatura Fiscal",
        subtitle:
          "O tipo de comprovante é automático. Os caixas não podem escolhê-lo manualmente.",
        feature: "Característica",
        provisionalReceipt: "Recibo Provisório (Orçamento)",
        fiscalInvoice: "Fatura Fiscal (A / B)",
        documentType: "Tipo de Documento",
        documentTypeBudget: "ORÇAMENTO",
        documentTypeFiscal: "FATURA A / FATURA B",
        numbering: "Numeração",
        numberingInternal: "Interna (ex., 01-003)",
        numberingFiscal: "ARCA / fiscal (ex., 0001-00001234)",
        caeExpiration: "CAE e Vencimento",
        no: "Não",
        yes: "Sim",
        fiscalQR: "QR Fiscal",
        fiscalValidity: "Validade Fiscal",
        notValid: "Não válido",
        validBeforeArca: "Válido perante ARCA",
        usage: "Uso",
        contingencyBackup: "Contingência / Backup",
        finalLegalDocument: "Documento legal definitivo",
        whenPrinted: "Quando é impresso",
        arcaNoResponse: "ARCA não responde",
        arcaRespondsOK: "ARCA responde OK",
        editing: "Edição",
        notEditable: "Não editável",
        editableCreditNotes: "Editável apenas para notas de crédito",
        quickSummaryTitle: "Resumo Visual Rápido",
        summaryProvisional:
          "Provisório = backup temporário, sem validade fiscal",
        summaryFiscal: "Fiscal = documento legal definitivo",
        summaryNeverPrints: "Fatura fiscal nunca é impressa sem CAE",
        summaryCorrections: "Correções somente via Nota de Crédito",
      },
    },
    receipt: {
      date: "Data:",
      time: "Hora:",
      items: "Itens",
      noItems: "Sem itens",
      subtotal: "Subtotal:",
      discount: "Desconto:",
      total: "Total:",
      paymentMethod: "Método de Pagamento:",
      print: "Imprimir",
      close: "Fechar",
    },
  },
  featuresPage: {
    hero: {
      eyebrow: "Funcionalidades",
      title: "Tudo o que você precisa para profissionalizar seu varejo",
      subtitle: "Uma plataforma simples, pronta para faturamento fiscal e projetada para crescer com sua empresa.",
      primaryCta: "Começar agora",
      secondaryCta: "Ver preços"
    },
    sections: [
      {
        id: "pos",
        title: "Punto de Venta Otimizado para Vendas de Balcão",
        description: "Vendas rápidas, fluxo ágil, projetado para trabalhar com teclado e leitor de código de barras.",
        image: "/images/new-features/new images/portugese/portguese POS page.png",
        items: [
          "Compatível com teclado numérico",
          "Integração com leitor de código de barras",
          "Ideal para horários de pico",
          "Interface clara e organizada"
        ]
      },
      {
        id: "reports",
        title: "Controle Diário de Vendas e Margens",
        description: "Visualize receitas, despesas e lucros em tempo real com resumos automatizados.",
        image: "/images/new-features/new images/portugese/portguese Reports Page.png",
        items: [
          "Resumo diário automático",
          "Controle de caixa integral",
          "Relatórios simples para contabilidade",
          "Informações claras para tomada de decisão"
        ]
      },
      {
        id: "inventory",
        title: "Inventário Atualizado Automaticamente",
        description: "Cada venda impacta o estoque sem processos manuais ou etapas extras.",
        image: "/images/new-features/new images/portugese/portguese Product Management.png",
        items: [
          "Alertas de estoque baixo em tempo real",
          "Movimentos de estoque registrados",
          "Controle de precisão no nível do produto",
          "Histórico completo de inventário"
        ]
      },
      {
        id: "fiscal",
        title: "Faturamento Eletrônico ARCA Integrado",
        description: "Emita documentos fiscais e cumpra as regulamentações diretamente do PDV.",
        image: "/images/new-features/new images/portugese/portugal Fiscal Reports - VAT.png",
        items: [
          "Suporte para Faturas A, B e C",
          "Notas de Crédito integradas",
          "Relatórios fiscais para seu contador",
          "Pronto para faturamento profissional"
        ]
      }
    ],
    otherFeatures: {
      title: "Mais ferramentas para o seu crescimento",
      items: [
        { 
          title: "Organização de Fornecedores", 
          description: "Registros de compras, acompanhamento de pagamentos e histórico detalhado.", 
          icon: "truck" 
        },
        { 
          title: "Controle de Despesas Integrado", 
          description: "Registro simples, categorização clara e impacto direto nos relatórios de lucro.", 
          icon: "trending-down" 
        },
        { 
          title: "Controle de Usuários e Acesso", 
          description: "Funções e permissões, proteção de dados e atualizações automáticas do sistema.", 
          icon: "lock" 
        }
      ]
    }
  },
  integrationsPage: {
    hero: {
      eyebrow: "Integrações",
      title: "Conectado ao ecossistema do seu negócio",
      subtitle: "O VentaPlus se integra às ferramentas que você já usa para automatizar processos fiscais, pagamentos e gestão.",
    },
    arcaSection: {
      title: "ARCA / AFIP",
      badge: "Integração Activa",
      description: "Conexão directa com o fisco argentino para emissão de faturas eletrônicas e conformidade legal automática.",
      features: [
        "Solicitação e atribuição de CAE automática",
        "Faturas A, B e C integradas",
        "Notas de crédito e débito fiscais",
        "Gestão de certificados digitais",
        "Sincronização em tempo real com a ARCA",
        "Livro de IVA Digital integrado",
      ],
      cta: "Ver Tutoriais ARCA",
      visual: {
        authorized: "Autorizado",
        amount: "Valor",
        iva: "IVA (21%)",
        cae: "CAE",
      }
    },
    otherIntegrations: {
      title: "Mais integrações para te potenciar",
      comingSoon: "Em breve",
      suggestTitle: "Precisa de outra integração?",
      suggestDesc: "Estamos trabalhando para adicionar novas ferramentas. Se você usa algo específico, conte-nos.",
      suggestCta: "Sugerir Integração",
      categories: {
        payments: "Pagamentos",
        logistics: "Logística",
        marketing: "Marketing",
      },
      items: [
        {
          name: "Mercado Pago",
          category: "payments",
          description: "Pagamentos com QR e link de pagamento sincronizados automaticamente com seu caixa.",
          status: "active"
        },
        {
          name: "MODO",
          category: "payments",
          description: "Aceite pagamentos de todas as carteiras bancárias com uma única integração.",
          status: "coming_soon"
        },
        {
          name: "Andreani",
          category: "logistics",
          description: "Geração de etiquetas e rastreamento de envios direto do pedido.",
          status: "coming_soon"
        },
        {
          name: "WhatsApp",
          category: "marketing",
          description: "Envio automático de comprovantes e notificações de estoque via chat.",
          status: "active"
        }
      ]
    }
  },
  documentationPage: {
    sidebar: {
      basics: "Conceitos Básicos",
      intro: "Introdução",
      auth: "Autenticação",
      architecture: "Arquitetura",
      api: "Referência de API",
      products: "Produtos",
      sales: "Vendas",
      inventory: "Inventário",
      webhooks: "Webhooks",
      security: "Segurança e Privacidade",
    },
    hero: {
      badge: "Documentação Técnica",
      title: "Construa com a API VentaPlus",
      subtitle: "Nossa plataforma foi projetada para ser estendida. Integre seu negócio com bibliotecas modernas e uma robusta API REST.",
    }
  },
  statusPage: {
    title: "Status do Sistema",
    subtitle: "Monitoramento em tempo real de nossos serviços principais e conectividade fiscal.",
    summary: {
      operational: "Todos os sistemas operacionais",
      maintenance: "Manutenção programada",
      partial: "Interrupção parcial",
      outage: "Interrupção maior"
    },
    components: {
      api: "API de Produção",
      dashboard: "Painel Web",
      pos: "Terminal Ponto de Venda",
      arca: "Integração ARCA/AFIP",
      database: "Base de Dados Principal"
    },
    uptime: "Uptime (últimos 90 dias)",
    history: "Histórico de Incidentes",
    noIncidents: "Nenhum incidente registrado neste período.",
    lastUpdate: "Última atualização",
    live: "Status ao Vivo",
    ninetyDaysAgo: "90 dias atrás",
    today: "Hoje",
    cta: {
      title: "Ainda está com problemas?",
      description: "Nossa equipe de engenharia de emergência está disponível 24 horas por dia, 7 dias por semana para assinantes do plano Pro.",
      button: "Contatar Suporte"
    }
  },
  securityPage: {
    hero: {
      badge: "Segurança",
      title: "Seus dados são nossa prioridade máxima",
      description: "O VentaPlus é construído com segurança de nível empresarial desde o início. Protegemos seus dados comerciais com práticas de criptografia, autenticação e infraestrutura líderes do setor."
    },
    features: {
      encryption: {
        title: "Criptografia de Dados",
        description: "Todos os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Seus dados comerciais estão sempre protegidos."
      },
      auth: {
        title: "Autenticação Segura",
        description: "Autenticação padrão do setor com hashing de senha seguro (bcrypt) e gerenciamento de sessão."
      },
      infrastructure: {
        title: "Infraestrutura Cloud",
        description: "Hospedado em infraestrutura de nuvem de nível empresarial com escalonamento automático, redundância e SLA de 99,9% de disponibilidade."
      },
      backups: {
        title: "Backups Automáticos",
        description: "Seus dados são copiados automaticamente de forma contínua. A recuperação pontual garante que nada seja perdido."
      },
      access: {
        title: "Acesso por Funções",
        description: "Controles de permissão detalhados garantem que os membros da equipe acessem apenas o necessário. Funções de dono, admin e caixa."
      },
      audit: {
        title: "Logs de Auditoria",
        description: "Trilha de auditoria completa de todas as operações do sistema. Rastreie quem fez o quê e quando para total responsabilidade."
      }
    },
    compliance: {
      title: "Conformidade Regulatória",
      description: "O VentaPlus está em total conformidade com as regulamentações fiscais argentinas e os padrões de proteção de dados.",
      arcaTitle: "ARCA / AFIP",
      arcaDesc: "Total conformidade com as regulamentações argentinas de faturamento eletrônico e requisitos fiscais.",
      pdTitle: "Proteção de Dados",
      pdDesc: "Dados de clientes e negócios manipulados de acordo com as leis argentinas de proteção de dados (Lei 25.326)."
    },
  },
  tutorialsPage: {
    hero: {
        breadcrumbHome: "Início",
        breadcrumbTutorials: "Tutoriais",
        badge: "Aprenda VentaPlus",
        title: "Tutoriais e Guias",
        subtitle: "Tudo o que você precisa para dominar as operações do seu negócio. Encontre respostas e tutoriais passo a passo.",
        searchPlaceholder: "Buscar tutoriais..."
      },
      noResults: {
        title: "Nenhum tutorial encontrado",
        subtitle: "Tente um termo de busca diferente"
      },
      cta: {
        title: "Não encontra o que procura?",
        subtitle: "Nossa equipe de suporte está disponível por chat e e-mail para ajudá-lo com qualquer dúvida específica.",
        button: "Contatar Suporte"
      }
    },
    contactPage: {
      hero: {
        eyebrow: "Contato",
        title: "Estamos aqui para impulsionar seu crescimento",
        subtitle: "Fale com nossa equipe de especialistas sobre como o VentaPlus pode transformar a gestão do seu comércio.",
        badges: {
          response: "Resposta em 24h",
          secure: "Dados seguros",
          argentina: "Equipe argentina"
        }
      },
      form: {
        title: "Envie-nos uma mensagem",
        subtitle: "Responderemos o mais breve possível",
        name: "Nome completo",
        namePlaceholder: "Insira seu nome",
        email: "E-mail",
        emailPlaceholder: "voce@exemplo.com",
        phone: "Telefone (opcional)",
        phonePlaceholder: "+54 9 11 ...",
        subject: "Assunto",
        subjectPlaceholder: "Selecione um tema",
        message: "Mensagem",
        messagePlaceholder: "Como podemos ajudar você?",
        submit: "Enviar mensagem",
        sending: "Enviando...",
        successTitle: "Mensagem enviada!",
        successMessage: "Obrigado por entrar em contato. Um membro da nossa equipe responderá em breve.",
        sendAnother: "Enviar outra mensagem",
        errors: {
          required: "Obrigatório",
          invalidEmail: "E-mail inválido"
        },
        subjectOptions: [
          "Vendas / Novos Planos",
          "Suporte Técnico",
          "Faturamento / Pagamentos",
          "Imprensa / Parceiros",
          "Outro"
        ]
      },
      info: {
        title: "Informações de contato",
        items: [
          { icon: "mail", title: "E-mail", description: "Suporte geral", value: "suporte@ventaplus.com" },
          { icon: "phone", title: "Telefone", description: "Seg-Sex 9h-18h", value: "+54 11 5555-0123" },
          { icon: "location", title: "Escritórios", description: "Centro técnico", value: "Palermo, CABA, Argentina" }
        ]
      },
      demo: {
        title: "Prefere uma demo ao vivo?",
        subtitle: "Agende uma sessão de 20 minutos com nossa equipe.",
        button: "Agendar demo"
      },
      ready: {
        title: "Pronto para começar?",
        subtitle: "Crie sua conta grátis e comece a vender em minutos.",
        primaryCta: "Criar conta grátis",
        secondaryCta: "Ver funcionalidades"
      },
      faq: {
        title: "Perguntas Frequentes",
        subtitle: "Respostas rápidas às consultas mais comunes.",
        items: [
          { question: "Existe taxa de manutenção?", answer: "Não, nossos planos têm um preço mensal fixo, sem taxas ocultas." },
          { question: "É compatível com qualquer impressora?", answer: "O VentaPlus é compatível com a maioria das impressoras térmicas USB ou de rede (EPSON e compatíveis)." },
          { question: "Como se integra ao AFIP?", answer: "A integração é nativa. Você só precisa carregar seu certificado digital e o PDV fiscal nas configurações." }
        ]
      }
    },
  pricingPage: {
    hero: {
      title: "Planos que crescem com você",
      subtitle: "Escolha a base tecnológica perfeita para profissionalizar seu negócio. Sem contratos, cancele quando quiser."
    },
    billing: {
      monthly: "mês",
      yearly: "ano"
    },
    faq: {
      title: "Perguntas Frequentes",
      items: [
        { question: "Posso mudar de plano?", answer: "Sim, você pode fazer o upgrade de seu plano a qualquer momento. A diferença será rateada em seu próximo ciclo de faturamento." },
        { question: "Quais métodos de pagamento vocês aceitam?", answer: "Aceitamos todos os cartões de crédito e débito através do Stripe e Mercado Pago." },
        { question: "Como funciona o período de teste?", answer: "Oferecemos um plano gratuito forever para que você possa testar as funções básicas sem limites de tempo." }
      ]
    }
  },
  aboutPage: {
    hero: {
      eyebrow: "Sobre Nós",
      title: "Impulsionando o comércio argentino",
      subtitle: "VentaPlus é um sistema de ponto de venda moderno na nuvem, projetado especificamente para quiosques, lojas e comércios locais em toda a Argentina."
    },
    stats: [
      { value: "1.000+", label: "Negócios Ativos" },
      { value: "50K+", label: "Transações Mensais" },
      { value: "99,9%", label: "Uptime" },
      { value: "24/7", label: "Suporte Disponível" }
    ],
    mission: {
      eyebrow: "Nossa Missão",
      title: "Tornar o comércio acessível para todos os negócios",
      p1: "Acreditamos que cada loja, quiosque e banca merece acesso a ferramentas profissionais que os ajudem a crescer. O VentaPlus nasceu da frustração de ver pequenos empresários lutarem com sistemas de PDV obsoletos, caros e complicados.",
      p2: "Nossa plataforma oferece recursos de nível empresarial, como rastreamento de estoque em tempo real, conformidade fiscal com ARCA/AFIP e análises de vendas poderosas — tudo em um pacote simples de usar desde o primeiro dia."
    },
    values: {
      simplicity: {
        title: "Simplicidade",
        description: "Criamos ferramentas intuitivas e fáceis de usar. Sem complexidade, sem confusão."
      },
      reliability: {
        title: "Confiabilidade",
        description: "Seu negócio depende de nós. Priorizamos a segurança dos dados e o desempenho consistente."
      },
      customerFirst: {
        title: "O Cliente em Primeiro Lugar",
        description: "Cada recurso que criamos nasce de uma necessidade real. Sua opinião define nosso caminho."
      },
      localFocus: {
        title: "Foco Local",
        description: "Feito na Argentina, para argentinos. Entendemos as regulamentações e desafios locais."
      }
    },
    cta: {
      title: "Pronto para começar?",
      subtitle: "Junte-se aos milhares de negócios argentinos que já usam o VentaPlus para otimizar suas vendas.",
      button: "Começar Agora",
      secondary: "Falar com Vendas"
    }
  },
  careersPage: {
    hero: {
      badge: "Carreiras",
      title: "Construa o futuro do comércio na Argentina",
      subtitle: "Junte-se a nós para tornar as ferramentas POS profissionais acessíveis a todos os negócios. Somos uma equipe pequena e apaixonada construindo algo que importa."
    },
    whyJoin: {
      title: "Por que se juntar à VentaPlus?",
      perks: [
        { icon: "🏠", title: "Remote-First", description: "Trabalhe de qualquer lugar na Argentina ou além." },
        { icon: "📈", title: "Crescimento", description: "Junte-se a uma startup em estágio inicial com impacto real." },
        { icon: "💻", title: "Stack Moderno", description: "Next.js, TypeScript, Supabase e muito mais." },
        { icon: "🗓️", title: "Flexibilidade", description: "Horários flexíveis que se adaptam à sua vida." },
        { icon: "🎯", title: "Propriedade", description: "Assuma a propriedade das funcionalidades de ponta a ponta." },
        { icon: "🤝", title: "Equipe", description: "Equipe pequena e colaborativa que valoriza a qualidade." }
      ]
    },
    openPositions: {
      title: "Vagas Abertas",
      subtitle: "Não temos vagas abertas no momento, mas estamos sempre em busca de pessoas talentosas.",
      spontaneous: {
        title: "Candidaturas Espontâneas",
        description: "Acha que seria um bom ajuste? Envie-nos seu currículo e conte-nos por que você gostaria de se juntar à VentaPlus.",
        button: "Enviar seu currículo"
      }
    }
  },
  pressPage: {
    hero: {
      badge: "Imprensa",
      title: "Imprensa e Mídia",
      subtitle: "Recursos e informações para jornalistas e profissionais de mídia cobrindo a VentaPlus."
    },
    assets: {
      title: "Recursos de Marca",
      description: "Baixe nossos logotipos oficiais, cores de marca e kit de mídia para uso em publicações de imprensa.",
      logoLabel: "Logotipo Oficial",
      primaryBlue: "Azul Principal",
      darkBackground: "Fundo Escuro"
    },
    inquiries: {
      title: "Consultas de Imprensa",
      description: "Para consultas de mídia, entrevistas ou discussões sobre parcerias, entre em contato com nossa equipe.",
      location: "Buenos Aires, Argentina"
    },
    about: {
      title: "Sobre a VentaPlus",
      content: "VentaPlus é um sistema POS em nuvem projetado para empresas argentinas. Fundada com a missão de tornar as ferramentas comerciais profissionais acessíveis a todos os quiosques, lojas e varejistas, a VentaPlus oferece vendas integradas, estoque, conformidade fiscal (ARCA/AFIP) e análises de negócios — tudo em uma plataforma moderna."
    }
  }
};

const translations: Record<Language, Record<string, any>> = {
  es: translationsEs,
  en: translationsEn,
  pt: translationsPt,
};

const normalizeLanguage = (value?: string): Language => {
  const normalized = String(value || "")
    .toLowerCase()
    .split("-")[0];

  return (SUPPORTED_LANGUAGES as readonly string[]).includes(normalized)
    ? (normalized as Language)
    : "en";
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as string | null;
      return normalizeLanguage(saved || undefined);
    }
    return "en";
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedLanguage = localStorage.getItem("language") || "en";
    const initialLanguage = normalizeLanguage(savedLanguage);

    setCurrentLanguage(initialLanguage);
    localStorage.setItem("language", initialLanguage);
    document.documentElement.lang = initialLanguage;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncLanguage = () => {
      const stored = localStorage.getItem("language") || "en";
      const normalized = normalizeLanguage(stored);
      if (normalized !== currentLanguage) {
        setCurrentLanguage(normalized);
      }
      document.documentElement.lang = normalized;
    };

    syncLanguage();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "language") {
        syncLanguage();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("languagechange", syncLanguage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("languagechange", syncLanguage);
    };
  }, [currentLanguage]);

  const handleSetLanguage = (lang: Language) => {
    const normalized = normalizeLanguage(lang);
    setCurrentLanguage(normalized);
    localStorage.setItem("language", normalized);
    document.documentElement.lang = normalized;
    // Notify all subscribers about language change
    notifyLanguageChange(normalized);
  };

  const t = (
    key: string,
    namespace: string = "common",
    options?: Record<string, any>,
  ): any => {
    const namespaces = namespace.split(".");
    let value: any = translations[currentLanguage];

    for (const ns of namespaces) {
      value = value?.[ns];
    }

    const keys = key.split(".");
    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value === "string" && options) {
      Object.keys(options).forEach((k) => {
        value = (value as string).replace(`{${k}}`, String(options[k]));
      });
    }

    return value ?? key;
  };

  return (
    <LanguageContext.Provider
      value={{ currentLanguage, setLanguage: handleSetLanguage, t }}
    >
      {isClient && <Fragment key={currentLanguage}>{children}</Fragment>}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
