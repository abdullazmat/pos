import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

const STATUS_COPY = {
  es: ["Sistema activo", "Sincronización OK", "Impresora lista"],
  en: ["System active", "Sync OK", "Printer ready"],
  pt: ["Sistema ativo", "Sincronização OK", "Impressora pronta"],
} as const;

export default function Hero() {
  const { t, currentLanguage } = useLanguage();
  const status =
    STATUS_COPY[currentLanguage as keyof typeof STATUS_COPY] || STATUS_COPY.es;
  return (
    <section className="max-w-2xl vp-reveal">
      <p className="text-[hsl(var(--vp-primary))] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-4 vp-micro">
        {String(t("hero.badge", "landing"))}
      </p>

      <h1 className="vp-hero-title">
        {String(t("hero.titleMain", "landing"))} <br />
        <span className="text-[hsl(var(--vp-primary))]">
          {String(t("hero.titleHighlight", "landing"))}
        </span>
      </h1>

      <p className="vp-hero-subtitle max-w-xl">
        {String(t("hero.description", "landing"))}
      </p>

      <div className="flex flex-wrap gap-4 mt-8 sm:mt-10">
        <Link
          href="/auth/register"
          className="vp-button vp-button-primary vp-micro"
        >
          {String(t("hero.startFree", "landing"))}
        </Link>
        <Link href="#features" className="vp-button vp-micro">
          {String(t("hero.viewFeatures", "landing"))}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        {status.map((label) => (
          <span key={label} className="vp-status-pill">
            <span className="vp-status-dot" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
