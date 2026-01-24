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
    <section id="features" className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            {String(t("title", "pricing"))}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
            {String(t("subtitle", "pricing"))}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features?.map((feature, index) => {
            const Icon = iconMap[index] || LightningBoltIcon;
            return (
              <div
                key={index}
                className="group bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-white dark:text-white">
                  <Icon />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
