// components/Footer.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[hsl(var(--vp-bg-soft))] border-t border-[hsl(var(--vp-border))]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Logo + Description */}
          <div>
            <div className="mb-4">
              <Link href="/" aria-label="VentaPlus">
                <BrandLogo size="md" />
              </Link>
            </div>
            <Link
              href="/"
              className="text-[hsl(var(--vp-muted))] text-sm leading-relaxed inline-block hover:text-[hsl(var(--vp-text))] transition"
            >
              {String(t("subtitle", "pricing"))}
            </Link>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-[hsl(var(--vp-text))] font-semibold mb-4">
              {String(t("features", "common"))}
            </h4>
            <ul className="space-y-3 text-[hsl(var(--vp-muted))] text-sm">
              <li>
                <Link
                  href="/#features"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("features", "common"))}
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("pricing", "common"))}
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("documentation", "common"))}
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4 className="text-[hsl(var(--vp-text))] font-semibold mb-4">
              {String(t("support", "common"))}
            </h4>
            <ul className="space-y-3 text-[hsl(var(--vp-muted))] text-sm">
              <li>
                <Link
                  href="/help"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("help", "common"))}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("contact", "common"))}
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("serviceStatus", "common"))}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[hsl(var(--vp-text))] font-semibold mb-4">
              {String(t("legal", "common"))}
            </h4>
            <ul className="space-y-3 text-[hsl(var(--vp-muted))] text-sm">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("terms", "common"))}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("privacy", "common"))}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[hsl(var(--vp-border))] text-center text-[hsl(var(--vp-muted))] text-sm">
          © 2026 VentaPlus. {String(t("allRightsReserved", "common"))}
        </div>
      </div>
    </footer>
  );
}
