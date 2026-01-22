"use client";

import { useState, useCallback } from "react";

interface ProductSearchProps {
  onAddToCart: (productId: string, name: string, price: number) => void;
  onSearch?: (query: string) => void;
}

export default function ProductSearch({
  onAddToCart,
  onSearch,
}: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`/api/products?search=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setResults(data.data?.products || []);
        onSearch?.(query);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [onSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Barcode Scanner Input */}
      <div>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          <input
            type="text"
            placeholder="Escanear o ingresar código de barras... (F6)"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Product Search Input */}
      <div>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar producto por nombre o código... (F5)"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {isSearching && (
          <p className="text-sm text-gray-500 mt-2">Buscando...</p>
        )}
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tips rápidos:</p>
            <p>
              Usa el lector de barras o busca por nombre. Navega con{" "}
              <kbd className="px-2 py-0.5 text-xs font-semibold bg-white border border-blue-300 rounded">
                ↑
              </kbd>{" "}
              <kbd className="px-2 py-0.5 text-xs font-semibold bg-white border border-blue-300 rounded">
                ↓
              </kbd>{" "}
              y presiona{" "}
              <kbd className="px-2 py-0.5 text-xs font-semibold bg-white border border-blue-300 rounded">
                Enter
              </kbd>{" "}
              para agregar.
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="min-h-[300px]">
        {results.length === 0 && !searchQuery ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Empezá a escribir para buscar</p>
          </div>
        ) : results.length === 0 && searchQuery ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {results.map((product) => (
              <div
                key={product._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition cursor-pointer"
                onClick={() =>
                  onAddToCart(product._id, product.name, product.price)
                }
              >
                <h3 className="font-semibold text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Código: {product.code}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Stock: {product.stock}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product._id, product.name, product.price);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
