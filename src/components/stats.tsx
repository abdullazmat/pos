export default function Stats() {
  return (
    <section className="grid grid-cols-3 gap-8 text-center">
      <div>
        <h2 className="text-5xl font-extrabold text-white">100%</h2>
        <p className="text-gray-400 mt-2 text-lg">En la Nube</p>
      </div>
      <div>
        <h2 className="text-5xl font-extrabold text-white">$0</h2>
        <p className="text-gray-400 mt-2 text-lg">Plan Inicial</p>
      </div>
      <div>
        <h2 className="text-5xl font-extrabold text-white">24/7</h2>
        <p className="text-gray-400 mt-2 text-lg">Disponible</p>
      </div>
    </section>
  );
}
