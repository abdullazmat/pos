export default function PosPreview() {
  return (
    <div className="bg-gray-100 dark:bg-slate-800 rounded-3xl border border-gray-300 dark:border-slate-700 shadow-2xl overflow-hidden">
      {/* Window bar (macOS style) */}
      <div className="bg-gray-200 dark:bg-slate-700 px-6 py-4 flex items-center gap-2 border-b border-gray-300 dark:border-slate-700">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>

      {/* Content */}
      <div className="p-8">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Producto Escaneado
        </p>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-300 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-cyan-600 dark:text-cyan-400 text-4xl font-bold">
                $12.500
              </p>
              <p className="text-gray-600 dark:text-gray-500 text-sm mt-1">
                Total Venta
              </p>
            </div>
            <div>
              <p className="text-green-600 dark:text-green-400 text-4xl font-bold">
                143
              </p>
              <p className="text-gray-600 dark:text-gray-500 text-sm mt-1">
                Productos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
