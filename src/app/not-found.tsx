"use client";

import Link from "next/link";

export default function NotFound() {
  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("language") || "es"
      : "es";

  const labels: Record<string, { title: string; desc: string; home: string }> =
    {
      es: {
        title: "Página no encontrada",
        desc: "La página que buscas no existe o fue movida.",
        home: "Ir al inicio",
      },
      en: {
        title: "Page not found",
        desc: "The page you are looking for does not exist or has been moved.",
        home: "Go to home",
      },
      pt: {
        title: "Página não encontrada",
        desc: "A página que você procura não existe ou foi movida.",
        home: "Ir para o início",
      },
    };

  const l = labels[lang] || labels.es;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--vp-bg))] p-6">
      <div className="vp-card max-w-md w-full p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            404
          </span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[hsl(var(--vp-text))] mb-2">
            {l.title}
          </h2>
          <p className="text-sm text-[hsl(var(--vp-muted))]">{l.desc}</p>
        </div>

        <Link
          href="/dashboard"
          className="vp-btn vp-btn-primary px-6 py-2 text-sm inline-block"
        >
          {l.home}
        </Link>
      </div>
    </div>
  );
}
