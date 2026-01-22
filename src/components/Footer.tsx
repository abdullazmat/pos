// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-[#0a0b0d] border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Logo + Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-white font-bold text-xl">POS Cloud</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sistema de punto de venta en la nube para negocios pequeños
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Producto</h4>
            <ul className="space-y-3 text-gray-500 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Características
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  Precios
                </a>
              </li>
              <li>
                <a href="#cta" className="hover:text-white transition">
                  Documentación
                </a>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4 className="text-white font-semibold mb-4">Soporte</h4>
            <ul className="space-y-3 text-gray-500 text-sm">
              <li>
                <a
                  href="mailto:soporte@poscloud.app?subject=Necesito%20ayuda"
                  className="hover:text-white transition"
                >
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a
                  href="mailto:hola@poscloud.app"
                  className="hover:text-white transition"
                >
                  Contacto
                </a>
              </li>
              <li>
                <a
                  href="https://status.poscloud.app"
                  className="hover:text-white transition"
                  target="_blank"
                  rel="noreferrer"
                >
                  Estado del Servicio
                </a>
              </li>
              <li>
                <a href="#top" className="hover:text-white transition">
                  Volver al inicio
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-gray-500 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Términos de Servicio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacidad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-900 text-center text-gray-600 text-sm">
          © 2025 POS Cloud. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
