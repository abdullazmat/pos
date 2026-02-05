"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
  es: {
    title: "Checkout en 3 pasos",
    subtitle: "Flujo real con componentes del POS.",
    steps: [
      {
        label: "Escanear",
        title: "Escaneo rápido",
        detail: "Código o búsqueda instantánea",
      },
      {
        label: "Confirmar",
        title: "Totales claros",
        detail: "Revisión antes de cobrar",
      },
      {
        label: "Cobrar",
        title: "Pago en un toque",
        detail: "Efectivo, QR o tarjeta",
      },
    ],
    labels: {
      code: "Código",
      confirm: "OK",
      cash: "Efectivo",
      qr: "QR",
      card: "Tarjeta",
      charge: "Cobrar",
    },
  },
  en: {
    title: "3-step checkout",
    subtitle: "Real flow with POS components.",
    steps: [
      {
        label: "Scan",
        title: "Fast scanning",
        detail: "Barcode or instant search",
      },
      {
        label: "Confirm",
        title: "Clear totals",
        detail: "Review before charge",
      },
      {
        label: "Charge",
        title: "One-tap payment",
        detail: "Cash, QR, or card",
      },
    ],
    labels: {
      code: "Code",
      confirm: "OK",
      cash: "Cash",
      qr: "QR",
      card: "Card",
      charge: "Charge",
    },
  },
  pt: {
    title: "Checkout em 3 passos",
    subtitle: "Fluxo real com componentes do PDV.",
    steps: [
      {
        label: "Escanear",
        title: "Leitura rápida",
        detail: "Código ou busca instantânea",
      },
      {
        label: "Confirmar",
        title: "Totais claros",
        detail: "Revisão antes de cobrar",
      },
      {
        label: "Cobrar",
        title: "Pagamento em um toque",
        detail: "Dinheiro, QR ou cartão",
      },
    ],
    labels: {
      code: "Código",
      confirm: "OK",
      cash: "Dinheiro",
      qr: "QR",
      card: "Cartão",
      charge: "Cobrar",
    },
  },
} as const;

export default function CheckoutWorkflowSection() {
  const { currentLanguage } = useLanguage();
  const copy = COPY[currentLanguage as keyof typeof COPY] || COPY.es;

  return (
    <section id="checkout-workflow" className="vp-section vp-reveal">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="vp-section-title">{copy.title}</h2>
          <p className="vp-section-subtitle text-lg">{copy.subtitle}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="vp-card p-6">
            <span className="vp-status-pill">01 · {copy.steps[0].label}</span>
            <h3 className="text-xl font-semibold mt-4">
              {copy.steps[0].title}
            </h3>
            <p className="text-[hsl(var(--vp-muted))] mt-2">
              {copy.steps[0].detail}
            </p>
            <div className="mt-5 vp-card vp-card-soft p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--vp-primary))]/10 flex items-center justify-center text-[hsl(var(--vp-primary))]">
                  #
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[hsl(var(--vp-muted))]">
                    {copy.labels.code}
                  </p>
                  <p className="text-sm font-semibold">77912300124</p>
                </div>
                <button className="vp-button vp-button-primary vp-button-sm">
                  {copy.labels.confirm}
                </button>
              </div>
              <div className="mt-4 h-10 rounded-lg border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))]" />
            </div>
          </div>

          <div className="vp-card p-6">
            <span className="vp-status-pill">02 · {copy.steps[1].label}</span>
            <h3 className="text-xl font-semibold mt-4">
              {copy.steps[1].title}
            </h3>
            <p className="text-[hsl(var(--vp-muted))] mt-2">
              {copy.steps[1].detail}
            </p>
            <div className="mt-5 vp-card vp-card-soft p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Leche 1L</span>
                  <span>$3.60</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pan integral</span>
                  <span>$2.20</span>
                </div>
              </div>
              <div className="h-px bg-[hsl(var(--vp-border))] my-3" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-[hsl(var(--vp-primary))]">$5.80</span>
              </div>
            </div>
          </div>

          <div className="vp-card p-6">
            <span className="vp-status-pill">03 · {copy.steps[2].label}</span>
            <h3 className="text-xl font-semibold mt-4">
              {copy.steps[2].title}
            </h3>
            <p className="text-[hsl(var(--vp-muted))] mt-2">
              {copy.steps[2].detail}
            </p>
            <div className="mt-5 vp-card vp-card-soft p-4">
              <div className="grid grid-cols-3 gap-2 text-xs text-[hsl(var(--vp-muted))]">
                <div className="vp-chip">{copy.labels.cash}</div>
                <div className="vp-chip">{copy.labels.qr}</div>
                <div className="vp-chip">{copy.labels.card}</div>
              </div>
              <button className="vp-button vp-button-primary vp-tap w-full mt-4">
                {copy.labels.charge}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
