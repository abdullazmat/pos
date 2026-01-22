import Link from "next/link";
import { CheckIcon } from "@radix-ui/react-icons";

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-[#0b0c0e]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Planes simples y transparentes
          </h2>
          <p className="text-gray-400 mt-4 text-lg">
            Empieza gratis y crece cuando lo necesites
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Plan Gratuito */}
          <div className="bg-[#121416] border border-gray-800 rounded-3xl p-10 relative">
            <h3 className="text-2xl font-bold text-white">Plan Gratuito</h3>
            <div className="mt-6">
              <span className="text-5xl font-extrabold text-white">$0</span>
              <span className="text-gray-400 ml-2">para siempre</span>
            </div>
            <p className="text-gray-400 mt-3">Ideal para empezar</p>

            <ul className="mt-10 space-y-5">
              {[
                "Hasta 100 productos",
                "Hasta 2 usuarios",
                "Punto de venta completo",
                "Control de caja",
                "Reportes básicos",
                "Stock básico",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/register"
              className="w-full inline-flex justify-center mt-12 py-4 bg-[#1c1e21] text-white font-medium rounded-xl hover:bg-[#25272b] transition"
            >
              Empezar Gratis
            </Link>
          </div>

          {/* Plan Pro – Featured */}
          <div className="relative">
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-40"></div>

            <div className="relative bg-[#121416] border-2 border-blue-500 rounded-3xl p-10 shadow-2xl">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  Más Popular
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white">Plan Pro</h3>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-white">
                  $19.990
                </span>
                <span className="text-gray-400 ml-2">/mes</span>
              </div>
              <p className="text-gray-400 mt-3">Sin límites para crecer</p>

              <ul className="mt-10 space-y-5">
                {[
                  "Productos ilimitados",
                  "Usuarios ilimitados",
                  "Todo lo del plan gratuito",
                  "Gestión de clientes",
                  "Ventas a crédito (fiado)",
                  "Gestión de gastos",
                  "Reportes avanzados",
                  "Soporte prioritario",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register?plan=pro"
                className="w-full inline-flex justify-center mt-12 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg"
              >
                Probar 14 días gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
