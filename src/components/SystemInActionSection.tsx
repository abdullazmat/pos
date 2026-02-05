"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
  es: {
    title: "Sistema en acción",
    subtitle:
      "Kiosco, recibo y pantalla de mostrador con el mismo lenguaje visual.",
    kiosk: {
      title: "Pantalla de caja",
      status: "Online",
      sync: "Sync 0s",
      printer: "Impresora OK",
      total: "Total",
      charge: "Cobrar",
      item: "Item",
      qty: "Cant.",
      price: "Precio",
    },
    receipt: {
      title: "Recibo",
      store: "Almacén San Martín",
      thanks: "Gracias por tu compra",
    },
    counter: {
      title: "Pantalla mostrador",
      next: "Siguiente cliente",
      change: "Vuelto",
    },
  },
  en: {
    title: "System in action",
    subtitle:
      "Kiosk, receipt, and counter screen with one consistent UI language.",
    kiosk: {
      title: "Kiosk UI",
      status: "Online",
      sync: "Sync 0s",
      printer: "Printer OK",
      total: "Total",
      charge: "Charge",
      item: "Item",
      qty: "Qty",
      price: "Price",
    },
    receipt: {
      title: "Receipt",
      store: "San Martín Market",
      thanks: "Thanks for your purchase",
    },
    counter: {
      title: "Counter screen",
      next: "Next customer",
      change: "Change",
    },
  },
  pt: {
    title: "Sistema em ação",
    subtitle: "Quiosque, recibo e tela de balcão com o mesmo padrão visual.",
    kiosk: {
      title: "Tela do caixa",
      status: "Online",
      sync: "Sync 0s",
      printer: "Impressora OK",
      total: "Total",
      charge: "Cobrar",
      item: "Item",
      qty: "Qtd.",
      price: "Preço",
    },
    receipt: {
      title: "Recibo",
      store: "Mercado San Martín",
      thanks: "Obrigado pela compra",
    },
    counter: {
      title: "Tela de balcão",
      next: "Próximo cliente",
      change: "Troco",
    },
  },
} as const;

export default function SystemInActionSection() {
  const { currentLanguage } = useLanguage();
  const copy = COPY[currentLanguage as keyof typeof COPY] || COPY.es;

  return (
    <section
      id="system-in-action"
      className="vp-section vp-section-muted vp-reveal"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="vp-section-title">{copy.title}</h2>
          <p className="vp-section-subtitle text-lg">{copy.subtitle}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="vp-card p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                {copy.kiosk.title}
              </p>
              <div className="flex items-center gap-2">
                <span className="vp-status-pill">
                  <span className="vp-status-dot" />
                  {copy.kiosk.status}
                </span>
                <span className="vp-status-pill">{copy.kiosk.sync}</span>
              </div>
            </div>
            <div className="vp-card vp-card-soft p-4 border border-[hsl(var(--vp-border))]">
              <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))]">
                <span>{copy.kiosk.item}</span>
                <span>{copy.kiosk.qty}</span>
                <span>{copy.kiosk.price}</span>
              </div>
              <div className="vp-flow-step my-3" />
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-[1fr_auto_auto] gap-3">
                  <span>Leche 1L</span>
                  <span className="text-right">2</span>
                  <span className="text-right">$3.60</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-3">
                  <span>Pan integral</span>
                  <span className="text-right">1</span>
                  <span className="text-right">$2.20</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-3">
                  <span>Manzana (kg)</span>
                  <span className="text-right">0.75</span>
                  <span className="text-right">$2.55</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-base font-semibold mt-4">
                <span>{copy.kiosk.total}</span>
                <span className="text-[hsl(var(--vp-primary))] text-xl">
                  $8.35
                </span>
              </div>
              <button className="vp-button vp-button-primary vp-tap w-full mt-4">
                {copy.kiosk.charge}
              </button>
            </div>
          </div>

          <div className="vp-card p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                {copy.receipt.title}
              </p>
              <span className="vp-status-pill">{copy.kiosk.printer}</span>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] p-4 text-sm">
              <div className="text-center mb-3">
                <p className="text-base font-semibold">{copy.receipt.store}</p>
                <p className="text-[hsl(var(--vp-muted))] text-xs">
                  Av. Central 1204 · 09:42
                </p>
              </div>
              <div className="vp-flow-step mb-3" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Leche 1L</span>
                  <span>$3.60</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pan integral</span>
                  <span>$2.20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Manzana</span>
                  <span>$2.55</span>
                </div>
              </div>
              <div className="h-px bg-[hsl(var(--vp-border))] my-3" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-[hsl(var(--vp-primary))]">$8.35</span>
              </div>
              <div className="mt-4 text-center text-xs text-[hsl(var(--vp-muted))]">
                {copy.receipt.thanks}
              </div>
            </div>
          </div>

          <div className="vp-card p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                {copy.counter.title}
              </p>
              <span className="vp-status-pill">{copy.kiosk.status}</span>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--vp-border))] bg-gradient-to-br from-[hsl(var(--vp-bg-card))] to-[hsl(var(--vp-bg-soft))] p-6 text-center">
              <p className="text-[hsl(var(--vp-muted))] text-xs uppercase tracking-[0.24em]">
                {copy.counter.next}
              </p>
              <p className="text-4xl font-semibold mt-3 text-[hsl(var(--vp-text))]">
                $8.35
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="vp-status-pill">{copy.counter.change}</span>
                <span className="text-xl font-semibold text-[hsl(var(--vp-primary))]">
                  $1.65
                </span>
              </div>
              <div className="mt-5 vp-flow-step" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
