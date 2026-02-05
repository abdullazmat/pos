import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section className="max-w-2xl vp-reveal">
      <p className="text-[hsl(var(--vp-primary))] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-4 vp-micro">
        {String(t("hero.badge", "landing"))}
      </p>

      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-[hsl(var(--vp-text))]">
        {String(t("hero.titleMain", "landing"))} <br />
        <span className="text-[hsl(var(--vp-primary))]">
          {String(t("hero.titleHighlight", "landing"))}
        </span>
      </h1>

      <p className="text-[hsl(var(--vp-muted))] mt-6 text-lg md:text-xl leading-relaxed max-w-xl">
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
    </section>
  );
}
