// components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b0c0e]/80 backdrop-blur-xl border-b border-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo + Tagline */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">POS Cloud</h1>
              <p className="text-gray-500 text-xs -mt-1">
                Sistema de Ventas Profesional
              </p>
            </div>
          </Link>

          {/* Right Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-5 py-2.5 border border-gray-700 rounded-lg text-white font-medium hover:bg-gray-800/50 transition"
            >
              Ingresar
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
            >
              Empezar Gratis
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
