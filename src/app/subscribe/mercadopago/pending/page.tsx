"use client";

import Link from "next/link";

export default function MercadoPagoPending() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 text-center border border-slate-700">
        <div className="w-16 h-16 mx-auto mb-4 border-b-4 border-yellow-500 rounded-full animate-spin"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Pago en Revisión</h1>
        <p className="text-gray-400 mb-6">
          Su pago está siendo procesado. Le enviaremos un email cuando esté
          confirmado.
        </p>
        <div className="flex gap-4">
          <Link
            href="/subscribe"
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Volver
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-2 border border-gray-600 text-white rounded-lg hover:border-gray-500 transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
