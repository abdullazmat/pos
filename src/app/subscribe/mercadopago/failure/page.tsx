"use client";

import Link from "next/link";

export default function MercadoPagoFailure() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 text-center border border-slate-700">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Pago Cancelado</h1>
        <p className="text-gray-400 mb-6">
          Su transacción no fue completada. Por favor intente de nuevo.
        </p>
        <div className="flex gap-4">
          <Link
            href="/subscribe"
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Volver a Planes
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-2 border border-gray-600 text-white rounded-lg hover:border-gray-500 transition"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
