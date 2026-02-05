// components/Footer.tsx
"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[hsl(var(--vp-bg-soft))] border-t border-[hsl(var(--vp-border))]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Logo + Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-surface))]">
                <span className="text-[hsl(var(--vp-primary))] font-semibold text-lg">
                  V+
                </span>
              </div>
              <span className="text-[hsl(var(--vp-text))] font-semibold text-xl">
                VentaPlus
              </span>
            </div>
            <p className="text-[hsl(var(--vp-muted))] text-sm leading-relaxed">
              {String(t("subtitle", "pricing"))}
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-[hsl(var(--vp-text))] font-semibold mb-4">
              {String(t("features", "common"))}
            </h4>
            <ul className="space-y-3 text-[hsl(var(--vp-muted))] text-sm">
              <li>
                <a
                  href="#features"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("features", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("pricing", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="#cta"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("documentation", "common"))}
                </a>
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
                <a
                  href="mailto:soporte@poscloud.app?subject=Necesito%20ayuda"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("help", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="mailto:hola@poscloud.app"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("contact", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="https://status.poscloud.app"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                  target="_blank"
                  rel="noreferrer"
                >
                  {String(t("serviceStatus", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="#top"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("backToTop", "common"))}
                </a>
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
                <a
                  href="#"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("terms", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[hsl(var(--vp-text))] transition"
                >
                  {String(t("privacy", "common"))}
                </a>
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
