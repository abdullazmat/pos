"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
  es: {
    register: "Caja 01",
    shift: "Turno mañana",
    cashier: "Cajero",
    cashierName: "Ana",
    cart: "Carrito",
    item: "Item",
    qty: "Cant.",
    price: "Precio",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impuestos",
    checkout: "Cobrar",
    itemOne: "Leche 1L",
    itemTwo: "Pan integral",
    itemThree: "Manzana (kg)",
  },
  en: {
    register: "Register 01",
    shift: "Morning shift",
    cashier: "Cashier",
    cashierName: "Ana",
    cart: "Cart",
    item: "Item",
    qty: "Qty",
    price: "Price",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    checkout: "Checkout",
    itemOne: "Milk 1L",
    itemTwo: "Whole wheat bread",
    itemThree: "Apples (kg)",
  },
  pt: {
    register: "Caixa 01",
    shift: "Turno manhã",
    cashier: "Caixa",
    cashierName: "Ana",
    cart: "Carrinho",
    item: "Item",
    qty: "Qtd.",
    price: "Preço",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impostos",
    checkout: "Finalizar",
    itemOne: "Leite 1L",
    itemTwo: "Pão integral",
    itemThree: "Maçã (kg)",
  },
};

export default function PosPreview() {
  const { currentLanguage } = useLanguage();
  const copy = COPY[currentLanguage as keyof typeof COPY] || COPY.es;

  return (
    <div className="vp-card overflow-hidden vp-reveal text-[hsl(var(--vp-text))]">
      <div className="bg-[hsl(var(--vp-bg-soft))] px-5 py-3 flex items-center gap-2 border-b border-[hsl(var(--vp-border))]">
        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--vp-border))]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--vp-border))]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--vp-border))]" />
      </div>

      <div className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-[hsl(var(--vp-bg))] via-[hsl(var(--vp-bg))] to-[hsl(var(--vp-bg-soft))]">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <p className="text-[hsl(var(--vp-muted))] text-xs uppercase tracking-[0.25em]">
              POS · {copy.register}
            </p>
            <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
              {copy.cashier}: {copy.cashierName} · {copy.shift}
            </p>
          </div>
          <div className="text-xs text-[hsl(var(--vp-muted))]">09:42 AM</div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="vp-card vp-card-soft p-5 border border-[hsl(var(--vp-border))] shadow-[0_14px_30px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-[hsl(var(--vp-muted))]">
                {copy.cart}
              </span>
              <span className="vp-kbd">F2</span>
            </div>

            <div className="grid grid-cols-[1fr_auto_auto] gap-3 text-[0.7rem] text-[hsl(var(--vp-muted))] mb-3">
              <span>{copy.item}</span>
              <span className="text-right">{copy.qty}</span>
              <span className="text-right">{copy.price}</span>
            </div>
            <div className="vp-flow-step mb-3" />
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[1fr_auto_auto] gap-3">
                <span className="text-[hsl(var(--vp-text))]">
                  {copy.itemOne}
                </span>
                <span className="text-right text-[hsl(var(--vp-text))]">2</span>
                <span className="text-right text-[hsl(var(--vp-text))]">
                  $3.60
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-3">
                <span className="text-[hsl(var(--vp-text))]">
                  {copy.itemTwo}
                </span>
                <span className="text-right text-[hsl(var(--vp-text))]">1</span>
                <span className="text-right text-[hsl(var(--vp-text))]">
                  $2.20
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-3">
                <span className="text-[hsl(var(--vp-text))]">
                  {copy.itemThree}
                </span>
                <span className="text-right text-[hsl(var(--vp-text))]">
                  0.75
                </span>
                <span className="text-right text-[hsl(var(--vp-text))]">
                  $2.55
                </span>
              </div>
            </div>
          </div>

          <div className="vp-card vp-card-soft p-5 border border-[hsl(var(--vp-border))] shadow-[0_14px_30px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between text-sm text-[hsl(var(--vp-muted))]">
              <span>{copy.subtotal}</span>
              <span className="text-[hsl(var(--vp-text))]">$8.35</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[hsl(var(--vp-muted))] mt-2">
              <span>{copy.tax}</span>
              <span className="text-[hsl(var(--vp-text))]">$0.00</span>
            </div>
            <div className="h-px bg-[hsl(var(--vp-border))] my-4" />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>{copy.total}</span>
              <span className="text-[hsl(var(--vp-primary))]">$8.35</span>
            </div>
            <button className="vp-button vp-button-primary w-full mt-5 text-sm vp-micro">
              {copy.checkout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
