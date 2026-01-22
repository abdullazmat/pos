"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { toast } from "react-toastify";

export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    costPrice: "",
    supplier: "",
    invoiceNumber: "",
    notes: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    loadPurchases();
    loadProducts();
  }, [router]);

  const loadPurchases = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPurchases(data.data?.purchases || []);
    } catch (error) {
      console.error("Load purchases error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(data.data?.products || []);
    } catch (error) {
      console.error("Load products error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          costPrice: parseFloat(formData.costPrice),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(`${error.error || "Error al registrar la compra"}`);
        return;
      }

      toast.success("¡Compra registrada exitosamente!");
      setFormData({
        productId: "",
        quantity: "",
        costPrice: "",
        supplier: "",
        invoiceNumber: "",
        notes: "",
      });
      setShowForm(false);
      loadPurchases();
    } catch (error) {
      console.error("Create purchase error:", error);
      toast.error("Error al registrar la compra");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showBackButton={true} />

      <main className="max-w-7xl mx-auto p-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          {showForm ? "Cancelar" : "+ Registrar Compra"}
        </button>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">Registrar Compra</h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <select
                value={formData.productId}
                onChange={(e) =>
                  setFormData({ ...formData, productId: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
                required
              >
                <option value="">Seleccionar Producto</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Cantidad"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
                required
              />
              <input
                type="number"
                placeholder="Precio de Costo"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
                step="0.01"
                required
              />
              <input
                type="text"
                placeholder="Proveedor"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="text"
                placeholder="Número de Factura"
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceNumber: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="text"
                placeholder="Notas"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                className="col-span-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Registrar Compra
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Historial de Compras</h2>
          {purchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2">
                  <tr>
                    <th className="text-left p-3">Fecha</th>
                    <th className="text-left p-3">Producto</th>
                    <th className="text-right p-3">Cant.</th>
                    <th className="text-right p-3">Costo</th>
                    <th className="text-right p-3">Total</th>
                    <th className="text-left p-3">Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">Product</td>
                      <td className="text-right p-3">{purchase.quantity}</td>
                      <td className="text-right p-3">
                        ${purchase.costPrice.toFixed(2)}
                      </td>
                      <td className="text-right p-3">
                        ${purchase.totalCost.toFixed(2)}
                      </td>
                      <td className="p-3">{purchase.supplier || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aún no hay compras registradas
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
