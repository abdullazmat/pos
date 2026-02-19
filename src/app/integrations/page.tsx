"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function IntegrationsPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <main className="vp-page pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--vp-primary))]/6 via-transparent to-[hsl(var(--vp-accent))]/4" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--vp-primary))]/3 blur-[120px] opacity-20" />
          <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <div className="vp-pill mb-6 mx-auto w-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Integrations
              </div>
              <h1 className="vp-section-title mb-5">
                Connected with Argentina&apos;s fiscal ecosystem
              </h1>
              <p className="text-lg text-[hsl(var(--vp-muted))] leading-relaxed max-w-2xl mx-auto">
                VentaPlus integrates seamlessly with ARCA/AFIP to ensure your business stays 
                fully compliant with Argentine electronic invoicing and fiscal regulations.
              </p>
            </div>
          </div>
        </section>

        {/* ARCA/AFIP Integration - Main Feature */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="vp-card overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Left - Info */}
              <div className="p-8 sm:p-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--vp-success))]/10 border border-[hsl(var(--vp-success))]/20 text-xs font-bold text-[hsl(var(--vp-success))] mb-5 uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--vp-success))] animate-pulse" />
                  Active Integration
                </div>
                <h2 className="vp-heading mb-4">ARCA / AFIP</h2>
                <p className="text-[hsl(var(--vp-muted))] leading-relaxed mb-6">
                  Full integration with Argentina&apos;s tax authority for electronic invoice issuance,
                  CAE generation, and fiscal compliance. VentaPlus handles all the complexity
                  so you can focus on your business.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Automatic CAE request and assignment",
                    "Factura A, B, and C generation",
                    "Credit notes and debit notes",
                    "Digital certificate management",
                    "Real-time validation with AFIP web services",
                    "IVA Libro de Ventas & Compras",
                    "CITI reports generation",
                    "Multi-punto de venta support",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm">
                      <svg className="w-5 h-5 text-[hsl(var(--vp-success))] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75" />
                      </svg>
                      <span className="text-[hsl(var(--vp-text))]">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/support/tutorials/arca-invoicing" className="vp-button vp-button-primary">
                  View ARCA Tutorials
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Right - Visual */}
              <div className="relative bg-gradient-to-br from-[hsl(var(--vp-bg-soft))] to-[hsl(var(--vp-bg-section))] p-8 sm:p-12 flex items-center justify-center border-l border-[hsl(var(--vp-border))]">
                <div className="relative w-full max-w-sm">
                  {/* Invoice Card Mock */}
                  <div className="vp-card p-6 mb-4 relative">
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--vp-success))]/10 border border-[hsl(var(--vp-success))]/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--vp-success))]" />
                      <span className="text-[10px] font-bold text-[hsl(var(--vp-success))] uppercase">Authorized</span>
                    </div>
                    <div className="text-xs text-[hsl(var(--vp-muted))] mb-1">Factura B</div>
                    <div className="text-lg font-bold text-[hsl(var(--vp-text))] mb-3">0001-00000142</div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[hsl(var(--vp-muted))]">Amount</span>
                      <span className="font-semibold text-[hsl(var(--vp-text))]">$15,420.00</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[hsl(var(--vp-muted))]">IVA (21%)</span>
                      <span className="font-semibold text-[hsl(var(--vp-text))]">$3,238.20</span>
                    </div>
                    <div className="border-t border-[hsl(var(--vp-border))] pt-2 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--vp-muted))]">CAE</span>
                        <span className="font-mono text-xs text-[hsl(var(--vp-text))]">73421985410293</span>
                      </div>
                    </div>
                  </div>

                  {/* Connection lines visual */}
                  <div className="flex items-center justify-center gap-4 my-4">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--vp-primary))]/10 flex items-center justify-center border border-[hsl(var(--vp-primary))]/20">
                      <span className="text-xs font-bold text-[hsl(var(--vp-primary))]">VP</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--vp-primary))] to-[hsl(var(--vp-success))] relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[hsl(var(--vp-success))] vp-pulse" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--vp-success))]/10 flex items-center justify-center border border-[hsl(var(--vp-success))]/20">
                      <span className="text-[9px] font-bold text-[hsl(var(--vp-success))]">AFIP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More integrations coming */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="rounded-2xl border border-dashed border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] p-8 sm:p-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--vp-muted))] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="text-lg font-semibold text-[hsl(var(--vp-text))] mb-2">More integrations coming soon</h3>
            <p className="text-sm text-[hsl(var(--vp-muted))] max-w-md mx-auto">
              We&apos;re working on new integrations to help your business grow. 
              Stay tuned for updates or contact us with suggestions.
            </p>
            <Link href="/contact" className="vp-button mt-6 inline-flex">
              Suggest an Integration
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
