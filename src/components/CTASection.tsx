// components/CTASection.tsx
import Link from "next/link";

export default function CTASection() {
  return (
    <section id="cta" className="py-24 bg-[#0b0c0e]">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          ¿Listo para modernizar tu negocio?
        </h2>
        <p className="text-gray-400 text-lg mt-6">
          Únete a cientos de negocios que ya usan POS Cloud para vender más
          rápido
        </p>

        <Link
          href="/auth/register"
          className="inline-block mt-10 text-blue-500 font-semibold text-lg hover:text-blue-400 transition"
        >
          Empezar Gratis Ahora →
        </Link>

        <p className="text-gray-500 text-sm mt-6">
          Sin tarjeta de crédito • Configuración en 2 minutos
        </p>
      </div>
    </section>
  );
}
