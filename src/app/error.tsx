"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  // Read language from localStorage (can't use context in error boundary)
  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("language") || "es"
      : "es";

  const labels: Record<
    string,
    { title: string; desc: string; retry: string; home: string }
  > = {
    es: {
      title: "Algo salió mal",
      desc: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
      retry: "Intentar de nuevo",
      home: "Ir al inicio",
    },
    en: {
      title: "Something went wrong",
      desc: "An unexpected error occurred. Please try again.",
      retry: "Try again",
      home: "Go to home",
    },
    pt: {
      title: "Algo deu errado",
      desc: "Ocorreu um erro inesperado. Por favor, tente novamente.",
      retry: "Tentar novamente",
      home: "Ir para o início",
    },
  };

  const l = labels[lang] || labels.es;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--vp-bg))] p-6">
      <div className="vp-card max-w-md w-full p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[hsl(var(--vp-text))] mb-2">
            {l.title}
          </h2>
          <p className="text-sm text-[hsl(var(--vp-muted))]">{l.desc}</p>
        </div>

        {error?.message && process.env.NODE_ENV === "development" && (
          <div className="rounded bg-red-50 dark:bg-red-900/20 p-3 text-left">
            <p className="text-xs font-mono text-red-700 dark:text-red-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="vp-btn vp-btn-primary px-6 py-2 text-sm"
          >
            {l.retry}
          </button>
          <a
            href="/dashboard"
            className="vp-btn vp-btn-secondary px-6 py-2 text-sm"
          >
            {l.home}
          </a>
        </div>
      </div>
    </div>
  );
}
