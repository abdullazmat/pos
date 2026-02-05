"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
  es: {
    title: "Vistas reales del POS",
    subtitle: "Pantallas reales de venta, productos, checkout y reportes.",
    labels: {
      posSale: "Venta en POS",
      addProduct: "Agregar producto",
      checkout: "Checkout",
      reports: "Reportes",
      register: "Caja 01",
      cart: "Carrito",
      item: "Item",
      qty: "Cant.",
      total: "Total",
      itemOne: "Café molido",
      itemTwo: "Galletas",
      productForm: "Nuevo producto",
      name: "Nombre",
      sku: "SKU",
      price: "Precio",
      stock: "Stock",
      save: "Guardar producto",
      table: "Listado",
      productName: "Barra energética 40g",
      productSku: "BG-401",
      payment: "Pago",
      method: "Método",
      confirm: "Confirmar pago",
      success: "Venta aprobada",
      cash: "Efectivo",
      card: "Tarjeta",
      qr: "QR",
      cardBrand: "VISA",
      kpis: "KPIs",
      gross: "Ventas",
      net: "Neto",
      tickets: "Tickets",
      chart: "Ventas (últimas horas)",
    },
  },
  en: {
    title: "Real POS screens",
    subtitle: "Actual sale, product, checkout, and reports UI snapshots.",
    labels: {
      posSale: "POS Sale",
      addProduct: "Add product",
      checkout: "Checkout",
      reports: "Reports",
      register: "Register 01",
      cart: "Cart",
      item: "Item",
      qty: "Qty",
      total: "Total",
      itemOne: "Ground coffee",
      itemTwo: "Cookies",
      productForm: "New product",
      name: "Name",
      sku: "SKU",
      price: "Price",
      stock: "Stock",
      save: "Save product",
      table: "Table",
      productName: "Energy bar 40g",
      productSku: "BG-401",
      payment: "Payment",
      method: "Method",
      confirm: "Confirm payment",
      success: "Payment approved",
      cash: "Cash",
      card: "Card",
      qr: "QR",
      cardBrand: "VISA",
      kpis: "KPIs",
      gross: "Sales",
      net: "Net",
      tickets: "Tickets",
      chart: "Sales (last hours)",
    },
  },
  pt: {
    title: "Telas reais do PDV",
    subtitle: "Telas reais de venda, produto, checkout e relatórios.",
    labels: {
      posSale: "Venda no PDV",
      addProduct: "Adicionar produto",
      checkout: "Checkout",
      reports: "Relatórios",
      register: "Caixa 01",
      cart: "Carrinho",
      item: "Item",
      qty: "Qtd.",
      total: "Total",
      itemOne: "Café moído",
      itemTwo: "Biscoitos",
      productForm: "Novo produto",
      name: "Nome",
      sku: "SKU",
      price: "Preço",
      stock: "Estoque",
      save: "Salvar produto",
      table: "Tabela",
      productName: "Barra energética 40g",
      productSku: "BG-401",
      payment: "Pagamento",
      method: "Método",
      confirm: "Confirmar pagamento",
      success: "Pagamento aprovado",
      cash: "Dinheiro",
      card: "Cartão",
      qr: "QR",
      cardBrand: "VISA",
      kpis: "KPIs",
      gross: "Vendas",
      net: "Líquido",
      tickets: "Tickets",
      chart: "Vendas (últimas horas)",
    },
  },
} as const;

export default function MotionMockups() {
  const { currentLanguage } = useLanguage();
  const copy = COPY[currentLanguage as keyof typeof COPY] || COPY.es;

  return (
    <section className="vp-section vp-section-muted vp-reveal">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="vp-section-title">{copy.title}</h2>
          <p className="vp-section-subtitle text-base">{copy.subtitle}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="vp-card vp-card-hover p-6 relative overflow-hidden text-[hsl(var(--vp-text))] min-h-[340px]">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[hsl(var(--vp-primary))]/10 to-transparent" />
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                {copy.labels.posSale}
              </h3>
              <span className="text-xs text-[hsl(var(--vp-muted))]">
                {copy.labels.register}
              </span>
            </div>
            <div className="relative vp-card vp-card-soft border border-[hsl(var(--vp-border))] overflow-hidden shadow-[0_16px_32px_rgba(15,23,42,0.35)]">
              <div className="bg-[hsl(var(--vp-bg-soft))] px-3 py-2 text-xs border-b border-[hsl(var(--vp-border))]">
                POS · {copy.labels.cart}
              </div>
              <div className="p-3 space-y-2 text-sm">
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[0.7rem] text-[hsl(var(--vp-muted))]">
                  <span>{copy.labels.item}</span>
                  <span className="text-right">{copy.labels.qty}</span>
                  <span className="text-right">{copy.labels.total}</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <span className="text-[hsl(var(--vp-text))]">
                    {copy.labels.itemOne}
                  </span>
                  <span className="text-right text-[hsl(var(--vp-text))]">
                    1
                  </span>
                  <span className="text-right text-[hsl(var(--vp-text))]">
                    $4.80
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <span className="text-[hsl(var(--vp-text))]">
                    {copy.labels.itemTwo}
                  </span>
                  <span className="text-right text-[hsl(var(--vp-text))]">
                    2
                  </span>
                  <span className="text-right text-[hsl(var(--vp-text))]">
                    $3.20
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[hsl(var(--vp-border))] pt-2 text-sm font-semibold">
                  <span>{copy.labels.total}</span>
                  <span className="text-[hsl(var(--vp-primary))]">$8.00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="vp-card vp-card-hover p-6 relative overflow-hidden text-[hsl(var(--vp-text))] min-h-[340px]">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[hsl(var(--vp-primary))]/10 to-transparent" />
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                {copy.labels.addProduct}
              </h3>
              <span className="text-xs text-[hsl(var(--vp-muted))]">
                {copy.labels.productForm}
              </span>
            </div>
            <div className="relative space-y-3">
              <div className="vp-card vp-card-soft border border-[hsl(var(--vp-border))] p-3 shadow-[0_12px_26px_rgba(15,23,42,0.3)]">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[hsl(var(--vp-muted))]">
                      {copy.labels.name}
                    </p>
                    <div className="h-8 px-2 flex items-center rounded-md border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-[hsl(var(--vp-text))] truncate">
                      {copy.labels.productName}
                    </div>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[hsl(var(--vp-muted))]">
                      {copy.labels.sku}
                    </p>
                    <div className="h-8 px-2 flex items-center rounded-md border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-[hsl(var(--vp-text))]">
                      {copy.labels.productSku}
                    </div>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[hsl(var(--vp-muted))]">
                      {copy.labels.price}
                    </p>
                    <div className="h-8 px-2 flex items-center rounded-md border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-[hsl(var(--vp-text))]">
                      $1.25
                    </div>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[hsl(var(--vp-muted))]">
                      {copy.labels.stock}
                    </p>
                    <div className="h-8 px-2 flex items-center rounded-md border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-[hsl(var(--vp-text))]">
                      120
                    </div>
                  </div>
                </div>
                <button className="vp-button vp-button-primary w-full mt-3 text-xs">
                  {copy.labels.save}
                </button>
              </div>
              <div className="vp-card vp-card-soft border border-[hsl(var(--vp-border))] p-3 shadow-[0_12px_26px_rgba(15,23,42,0.3)]">
                <div className="text-[0.7rem] text-[hsl(var(--vp-muted))] mb-2">
                  {copy.labels.table}
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-sm">
                  <span className="text-[hsl(var(--vp-text))] truncate min-w-0">
                    {copy.labels.productName}
                  </span>
                  <span className="text-[hsl(var(--vp-muted))] text-right">
                    {copy.labels.productSku}
                  </span>
                  <span className="text-[hsl(var(--vp-text))] text-right">
                    $1.25
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="vp-card vp-card-hover p-6 relative overflow-hidden text-[hsl(var(--vp-text))] min-h-[340px]">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[hsl(var(--vp-primary))]/10 to-transparent" />
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                {copy.labels.checkout}
              </h3>
              <span className="text-xs text-[hsl(var(--vp-muted))]">
                {copy.labels.payment}
              </span>
            </div>
            <div className="relative min-h-[230px]">
              <div className="vp-card vp-card-soft border border-[hsl(var(--vp-border))] p-3 space-y-3 opacity-75 shadow-[0_12px_26px_rgba(15,23,42,0.3)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[hsl(var(--vp-muted))]">
                    {copy.labels.total}
                  </span>
                  <span className="font-semibold text-[hsl(var(--vp-text))]">
                    $18.90
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[0.65rem] text-[hsl(var(--vp-muted))]">
                  <div className="vp-card vp-card-soft px-2 py-1 text-center truncate">
                    {copy.labels.cash}
                  </div>
                  <div className="vp-card vp-card-soft px-2 py-1 text-center truncate">
                    {copy.labels.card}
                  </div>
                  <div className="vp-card vp-card-soft px-2 py-1 text-center truncate">
                    {copy.labels.qr}
                  </div>
                </div>
              </div>
              <div className="relative -mt-10 mx-auto w-[88%]">
                <div className="vp-card p-3">
                  <div className="text-[0.7rem] text-[hsl(var(--vp-muted))]">
                    {copy.labels.method}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-[hsl(var(--vp-text))]">
                      {copy.labels.card}
                    </span>
                    <span className="vp-pill">{copy.labels.cardBrand}</span>
                  </div>
                  <button className="vp-button vp-button-primary w-full mt-3 text-xs">
                    {copy.labels.confirm}
                  </button>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <div className="vp-card px-3 py-2 text-[0.7rem] text-emerald-400 border border-emerald-500/30">
                  {copy.labels.success}
                </div>
              </div>
            </div>
          </div>

          <div className="vp-card vp-card-hover p-6 relative overflow-hidden text-[hsl(var(--vp-text))] min-h-[340px]">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[hsl(var(--vp-primary))]/10 to-transparent" />
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                {copy.labels.reports}
              </h3>
              <span className="text-xs text-[hsl(var(--vp-muted))]">
                {copy.labels.kpis}
              </span>
            </div>
            <div className="relative space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="vp-card vp-card-soft border border-[hsl(var(--vp-border))] p-2">
                  <p className="text-[0.65rem] text-[hsl(var(--vp-muted))]">
                    {copy.labels.gross}
                  </p>
                  <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                    $8.00
                  </p>
                </div>
                <div className="vp-card vp-card-soft border border-[hsl(var(--vp-border))] p-2">
                  <p className="text-[0.65rem] text-[hsl(var(--vp-muted))]">
                    {copy.labels.net}
                  </p>
                  <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                    $7.20
                  </p>
                </div>
                <div className="vp-card vp-card-soft border border-[hsl(var(--vp-border))] p-2">
                  <p className="text-[0.65rem] text-[hsl(var(--vp-muted))]">
                    {copy.labels.tickets}
                  </p>
                  <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                    2
                  </p>
                </div>
              </div>
              <div className="vp-card vp-card-soft border border-[hsl(var(--vp-border))] p-3 shadow-[0_12px_26px_rgba(15,23,42,0.3)]">
                <p className="text-[0.7rem] text-[hsl(var(--vp-muted))] mb-2">
                  {copy.labels.chart}
                </p>
                <svg viewBox="0 0 120 40" className="w-full h-10" fill="none">
                  <path
                    d="M2 30 L22 24 L40 26 L58 18 L76 20 L96 12 L118 16"
                    stroke="hsl(var(--vp-primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 30 L22 24 L40 26 L58 18 L76 20 L96 12 L118 16 L118 38 L2 38 Z"
                    fill="hsl(var(--vp-primary) / 0.12)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
