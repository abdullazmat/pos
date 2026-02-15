"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import { toast } from "react-toastify";
import { useBusinessDateTime } from "@/lib/hooks/useBusinessDateTime";
import { Receipt, X, CheckCircle } from "lucide-react";

export default function PurchasesPage() {
  const { formatDate } = useBusinessDateTime();
  const router = useRouter();
  const { t } = useGlobalLanguage();
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

  // Expense-from-purchase modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<any>(null);
  const [expenseCategory, setExpenseCategory] = useState("Compras");
  const [expensePaymentMethod, setExpensePaymentMethod] = useState("cash");
  const [creatingExpense, setCreatingExpense] = useState(false);

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

      const result = await response.json();
      toast.success(t("purchaseRegisteredSuccess", "errors"));
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

      // Offer to create expense from this purchase
      if (result.data?.purchase) {
        setLastPurchase(result.data.purchase);
        setExpenseCategory("Compras");
        setExpensePaymentMethod("cash");
        setShowExpenseModal(true);
      }
    } catch (error) {
      console.error("Create purchase error:", error);
      toast.error(t("errorRegisteringPurchase", "errors"));
    }
  };

  const handleCreateExpenseFromPurchase = async () => {
    if (!lastPurchase) return;
    setCreatingExpense(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/expenses/from-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          purchaseId: lastPurchase._id,
          category: expenseCategory,
          paymentMethod: expensePaymentMethod,
        }),
      });
      if (response.ok) {
        toast.success("Gasto registrado desde la compra");
      } else {
        const err = await response.json();
        toast.error(err.error || "Error al crear gasto");
      }
    } catch (error) {
      console.error("Error creating expense from purchase:", error);
      toast.error("Error al crear gasto");
    } finally {
      setCreatingExpense(false);
      setShowExpenseModal(false);
      setLastPurchase(null);
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
    <div className="min-h-screen bg-white dark:bg-slate-950">
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

        {/* ─── Expense-from-Purchase Modal ─────────────────── */}
        {showExpenseModal && lastPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    ¿Registrar como gasto?
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowExpenseModal(false);
                    setLastPurchase(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Se detectó una salida de dinero por{" "}
                <strong className="text-slate-900 dark:text-white">
                  ${lastPurchase.totalCost?.toFixed(2)}
                </strong>
                .{" "}
                {lastPurchase.supplier
                  ? `Proveedor: ${lastPurchase.supplier}.`
                  : ""}
              </p>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Método de pago
                  </label>
                  <select
                    value={expensePaymentMethod}
                    onChange={(e) => setExpensePaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                    <option value="check">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowExpenseModal(false);
                    setLastPurchase(null);
                  }}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  No, gracias
                </button>
                <button
                  onClick={handleCreateExpenseFromPurchase}
                  disabled={creatingExpense}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {creatingExpense ? "Registrando..." : "Sí, registrar gasto"}
                </button>
              </div>
            </div>
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
                      <td className="p-3">{formatDate(purchase.createdAt)}</td>
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
