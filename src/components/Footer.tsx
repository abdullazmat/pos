// components/Footer.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  const { t } = useLanguage();

  const companyLinks = [
    { label: String(t("aboutUs", "common") || "About Us"), href: "/about" },
    { label: String(t("careers", "common") || "Careers"), href: "/careers" },
    { label: String(t("contactSales", "common") || "Contact Sales"), href: "/contact" },
    { label: String(t("press", "common") || "Press"), href: "/press" },
  ];

  const productLinks = [
    { label: String(t("features", "common") || "Features"), href: "/features" },
    { label: String(t("pricing", "common") || "Pricing"), href: "/pricing" },
    { label: String(t("integrations", "common") || "Integrations") + " (ARCA/AFIP)", href: "/integrations" },
    { label: String(t("security", "common") || "Security"), href: "/security" },
  ];

  const supportLinks = [
    { label: String(t("helpCenter", "common") || "Help Center"), href: "/help" },
    { label: String(t("tutorials", "common") || "Tutorials"), href: "/support/tutorials" },
    { label: String(t("technicalDocs", "common") || "Technical Documentation"), href: "/documentation" },
    { label: String(t("serviceStatus", "common") || "Service Status"), href: "/status" },
    { label: String(t("contactSupport", "common") || "Contact Support"), href: "/contact" },
  ];

  return (
    <footer className="bg-[hsl(var(--vp-bg-soft))] border-t border-[hsl(var(--vp-border))]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1 – Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-5">
              <Link href="/" aria-label="VentaPlus">
                <BrandLogo size="md" />
              </Link>
            </div>
            <p className="text-[hsl(var(--vp-muted))] text-sm leading-relaxed mb-4 max-w-xs">
              {String(
                t("footerDescription", "common") ||
                  "Sistema POS integral para comercios en Argentina. Gestión de ventas, inventario y facturación fiscal."
              )}
            </p>

            {/* Contact Email */}
            <a
              href="mailto:soporte@ventaplus.com.ar"
              className="inline-flex items-center gap-2 text-sm text-[hsl(var(--vp-muted))] hover:text-[hsl(var(--vp-primary))] transition-colors mb-3"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              soporte@ventaplus.com.ar
            </a>

            {/* Country */}
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--vp-muted))] mb-3">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              Argentina 🇦🇷
            </div>

            {/* AFIP Compliant Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--vp-success))]/10 border border-[hsl(var(--vp-success))]/20 text-xs font-semibold text-[hsl(var(--vp-success))] mb-5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              {String(t("afipCompliant", "common") || "Compliant with AFIP / ARCA")}
            </div>

            {/* Social + CTA */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href="https://instagram.com/ventaplus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-card))] text-[hsl(var(--vp-muted))] hover:text-[hsl(var(--vp-primary))] hover:border-[hsl(var(--vp-primary))]/30 transition-all hover:scale-105"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Small CTA */}
              <Link
                href="/auth/register"
                className="vp-button vp-button-primary vp-button-sm text-xs"
                id="footer-cta-start-now"
              >
                {String(t("startNow", "common") || t("startFree", "pricing") || "Start Now")}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Column 2 – Company */}
          <div>
            <h4 className="text-[hsl(var(--vp-text))] font-semibold mb-4 text-sm uppercase tracking-wider">
              {String(t("company", "common") || "Company")}
            </h4>
            <ul className="space-y-3 text-[hsl(var(--vp-muted))] text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[hsl(var(--vp-text))] transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Product */}
          <div>
            <h4 className="text-[hsl(var(--vp-text))] font-semibold mb-4 text-sm uppercase tracking-wider">
              {String(t("product", "common") || "Product")}
            </h4>
            <ul className="space-y-3 text-[hsl(var(--vp-muted))] text-sm">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[hsl(var(--vp-text))] transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 – Support */}
          <div>
            <h4 className="text-[hsl(var(--vp-text))] font-semibold mb-4 text-sm uppercase tracking-wider">
              {String(t("support", "common") || "Support")}
            </h4>
            <ul className="space-y-3 text-[hsl(var(--vp-muted))] text-sm">
              {supportLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[hsl(var(--vp-text))] transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-[hsl(var(--vp-border))]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[hsl(var(--vp-muted))] text-sm">
              © {new Date().getFullYear()} VentaPlus.{" "}
              {String(t("allRightsReserved", "common") || "All rights reserved.")}
            </p>
            <div className="flex items-center gap-6 text-sm text-[hsl(var(--vp-muted))]">
              <Link href="/terms" className="hover:text-[hsl(var(--vp-text))] transition-colors">
                {String(t("terms", "common") || "Terms")}
              </Link>
              <Link href="/privacy" className="hover:text-[hsl(var(--vp-text))] transition-colors">
                {String(t("privacy", "common") || "Privacy")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
