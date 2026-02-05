// components/FeaturesSection.tsx
import { useLanguage } from "@/lib/context/LanguageContext";
import {
  LightningBoltIcon,
  CubeIcon,
  BarChartIcon,
  LockClosedIcon,
  GlobeIcon, // ← this is the correct "cloud" icon
  PersonIcon, // ← this is the correct "users" icon (or use GroupIcon)
} from "@radix-ui/react-icons";

// Simple custom SVG icons for perfect match (optional but looks better)
const CloudIcon = () => (
  <svg
    className="w-7 h-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="w-7 h-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const iconMap = [
  LightningBoltIcon,
  CloudIcon,
  CubeIcon,
  BarChartIcon,
  UsersIcon,
  LockClosedIcon,
];

export default function FeaturesSection() {
  const { t } = useLanguage();
  const features = t("features", "landing") as Array<{
    title: string;
    description: string;
  }>;
  return (
    <section
      id="features"
      className="vp-section vp-section-muted vp-reveal relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-[hsl(var(--vp-primary))]/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-5%] h-80 w-80 rounded-full bg-[hsl(var(--vp-primary))]/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))]">
            {String(t("features", "common"))}
          </span>
          <h2 className="vp-section-title mt-5">
            {String(t("title", "pricing"))}
          </h2>
          <p className="vp-section-subtitle text-lg">
            {String(t("subtitle", "pricing"))}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features?.map((feature, index) => {
            const Icon = iconMap[index] || LightningBoltIcon;
            return (
              <div key={index} className="group relative">
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[hsl(var(--vp-primary))]/30 via-transparent to-[hsl(var(--vp-primary))]/10 opacity-0 blur transition duration-300 group-hover:opacity-100" />
                <div className="relative h-full rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))]/80 p-7 sm:p-8 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.6)] backdrop-blur-sm transition duration-300 group-hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-[hsl(var(--vp-border))] bg-gradient-to-br from-[hsl(var(--vp-bg-soft))] to-[hsl(var(--vp-bg))] text-[hsl(var(--vp-primary))]">
                    <Icon />
                  </div>

                  <h3 className="text-lg font-semibold text-[hsl(var(--vp-text))] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[hsl(var(--vp-muted))] text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
