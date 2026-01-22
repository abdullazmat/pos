import Link from "next/link";

export default function Hero() {
  return (
    <section className="max-w-2xl">
      <p className="text-yellow-400 text-sm font-medium mb-4 tracking-wider">
        ⭐ Sistema 100% en la nube - Sin instalaciones
      </p>

      <h1 className="text-6xl font-extrabold leading-tight">
        Tu Punto de Venta <br />
        <span className="text-yellow-400">en la Nube</span>
      </h1>

      <p className="text-gray-400 mt-8 text-lg leading-relaxed">
        Sistema de facturación completo para kioscos, almacenes y minimercados.
        Rápido, fácil y sin complicaciones.
      </p>

      <div className="flex flex-wrap gap-4 mt-10">
        <Link
          href="/auth/register"
          className="px-8 py-4 bg-blue-600 rounded-xl font-semibold text-white hover:bg-blue-700 transition-all transform hover:scale-105"
        >
          Empezar Gratis →
        </Link>
        <Link
          href="#features"
          className="px-8 py-4 border border-gray-600 rounded-xl font-medium hover:bg-gray-800/50 transition-all"
        >
          Ver Características
        </Link>
      </div>
    </section>
  );
}
