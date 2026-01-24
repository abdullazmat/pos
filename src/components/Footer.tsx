// components/Footer.tsx
"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-100 dark:bg-slate-900 border-t border-gray-300 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Logo + Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-gray-900 dark:text-white font-bold text-xl">
                POS Cloud
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed">
              {String(t("subtitle", "pricing"))}
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">
              {String(t("features", "common"))}
            </h4>
            <ul className="space-y-3 text-gray-700 dark:text-gray-400 text-sm">
              <li>
                <a
                  href="#features"
                  className="hover:text-gray-900 dark:hover:text-white transition"
                >
                  {String(t("features", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-gray-900 dark:hover:text-white transition"
                >
                  {String(t("pricing", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="#cta"
                  className="hover:text-gray-900 dark:hover:text-white transition"
                >
                  {String(t("documentation", "common"))}
                </a>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">
              {String(t("support", "common"))}
            </h4>
            <ul className="space-y-3 text-gray-700 dark:text-gray-400 text-sm">
              <li>
                <a
                  href="mailto:soporte@poscloud.app?subject=Necesito%20ayuda"
                  className="hover:text-gray-900 dark:hover:text-white transition"
                >
                  {String(t("help", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="mailto:hola@poscloud.app"
                  className="hover:text-gray-900 dark:hover:text-white transition"
                >
                  {String(t("contact", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="https://status.poscloud.app"
                  className="hover:text-gray-900 dark:hover:text-white transition"
                  target="_blank"
                  rel="noreferrer"
                >
                  {String(t("serviceStatus", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="#top"
                  className="hover:text-gray-900 dark:hover:text-white transition"
                >
                  {String(t("backToTop", "common"))}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">
              {String(t("legal", "common"))}
            </h4>
            <ul className="space-y-3 text-gray-700 dark:text-gray-400 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 dark:hover:text-white transition"
                >
                  {String(t("terms", "common"))}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 dark:hover:text-white transition"
                >
                  {String(t("privacy", "common"))}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-300 dark:border-slate-800 text-center text-gray-600 dark:text-gray-400 text-sm">
          © 2025 POS Cloud. {String(t("allRightsReserved", "common"))}
        </div>
      </div>
    </footer>
  );
}
