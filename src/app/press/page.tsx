"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function PressPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <main className="vp-page pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--vp-primary))]/5 via-transparent to-[hsl(var(--vp-accent))]/4" />
          <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <div className="vp-pill mb-6 mx-auto w-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                </svg>
                Press
              </div>
              <h1 className="vp-section-title mb-5">Press & Media</h1>
              <p className="text-lg text-[hsl(var(--vp-muted))] leading-relaxed max-w-2xl mx-auto">
                Resources and information for journalists and media professionals covering VentaPlus.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Brand Assets */}
            <div className="vp-card p-8">
              <h2 className="text-xl font-semibold text-[hsl(var(--vp-text))] mb-4">Brand Assets</h2>
              <p className="text-[hsl(var(--vp-muted))] text-sm leading-relaxed mb-6">
                Download our official logos, brand colors, and media kit for use in press publications.
              </p>
              <div className="vp-card-soft rounded-xl p-6 mb-6 flex items-center justify-center bg-[hsl(var(--vp-bg-soft))]">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0 rounded-xl overflow-hidden border border-[hsl(var(--vp-border))] bg-[#171B26] w-16 h-16">
                    <svg viewBox="0 0 64 64" role="img" aria-label="VentaPlus logo" className="w-full h-full">
                      <defs>
                        <linearGradient id="vpGradientPress" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#4F7DF7" />
                          <stop offset="100%" stopColor="#7CCBFF" />
                        </linearGradient>
                      </defs>
                      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#vpGradientPress)" />
                      <circle cx="26" cy="12" r="2.2" fill="#0B1E36" />
                      <circle cx="32" cy="12" r="2.2" fill="#0B1E36" />
                      <circle cx="38" cy="12" r="2.2" fill="#0B1E36" />
                      <rect x="10" y="18" width="44" height="26" rx="6" fill="#0B1E36" />
                      <rect x="14" y="22" width="20" height="3" rx="1.5" fill="#3C74F1" />
                      <rect x="14" y="28" width="10" height="3" rx="1.5" fill="#3C74F1" />
                      <path d="M18 40 L28 50 L47 28" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xl font-semibold text-[hsl(var(--vp-text))]">
                      Venta<span className="text-[hsl(var(--vp-primary))]">Plus</span>
                    </span>
                    <p className="text-xs text-[hsl(var(--vp-muted))]">Official Logo</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg" style={{ background: "linear-gradient(135deg, #4F7DF7, #7CCBFF)" }} />
                  <div>
                    <div className="text-sm font-semibold text-[hsl(var(--vp-text))]">Primary Blue</div>
                    <div className="text-xs text-[hsl(var(--vp-muted))]">#4F7DF7 → #7CCBFF</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#171B26]" />
                  <div>
                    <div className="text-sm font-semibold text-[hsl(var(--vp-text))]">Dark Background</div>
                    <div className="text-xs text-[hsl(var(--vp-muted))]">#171B26</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Company Info */}
            <div className="vp-card p-8">
              <h2 className="text-xl font-semibold text-[hsl(var(--vp-text))] mb-4">Press Inquiries</h2>
              <p className="text-[hsl(var(--vp-muted))] text-sm leading-relaxed mb-6">
                For media inquiries, interviews, or partnership discussions, please reach out to our team.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[hsl(var(--vp-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <a href="mailto:press@ventaplus.com.ar" className="text-sm text-[hsl(var(--vp-primary))] hover:underline">
                    press@ventaplus.com.ar
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[hsl(var(--vp-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-sm text-[hsl(var(--vp-text))]">Buenos Aires, Argentina</span>
                </div>
              </div>

              <div className="border-t border-[hsl(var(--vp-border))] pt-6">
                <h3 className="text-sm font-semibold text-[hsl(var(--vp-text))] mb-3">About VentaPlus</h3>
                <p className="text-sm text-[hsl(var(--vp-muted))] leading-relaxed">
                  VentaPlus is a cloud-based POS system built for Argentine businesses. Founded with 
                  the mission of making professional commerce tools accessible to every kiosk, shop, 
                  and retail business, VentaPlus offers integrated sales, inventory, fiscal compliance 
                  (ARCA/AFIP), and business analytics — all in one modern platform.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
