// components/FeaturesSection.tsx
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

const features = [
  {
    icon: LightningBoltIcon,
    title: "Súper Rápido",
    description:
      "Interfaz optimizada como supermercado. Vende en segundos con código de barras.",
  },
  {
    icon: CloudIcon,
    title: "100% en la Nube",
    description:
      "Sin instalaciones. Accede desde cualquier navegador, en cualquier dispositivo.",
  },
  {
    icon: CubeIcon,
    title: "Control de Stock",
    description:
      "Gestiona inventario automáticamente con cada venta. Alertas de stock bajo.",
  },
  {
    icon: BarChartIcon,
    title: "Reportes en Vivo",
    description:
      "Ventas, caja, productos más vendidos. Todo actualizado en tiempo real.",
  },
  {
    icon: UsersIcon,
    title: "Multi-Usuario",
    description:
      "Gestiona cajeros y administradores. Control de permisos y descuentos.",
  },
  {
    icon: LockClosedIcon,
    title: "Seguro y Confiable",
    description:
      "Tus datos protegidos con Supabase. Backup automático en la nube.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#0b0c0e]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Todo lo que necesitas
          </h2>
          <p className="text-gray-400 mt-4 text-lg">
            Un sistema completo diseñado específicamente para negocios pequeños
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-[#121416] border border-gray-800 rounded-2xl p-8 hover:border-gray-700 hover:bg-[#16181c] transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
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
