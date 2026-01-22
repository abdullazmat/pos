"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductSearch from "@/components/pos/ProductSearch";
import Cart from "@/components/pos/Cart";
import Header from "@/components/layout/Header";
import Loading from "@/components/common/Loading";
import { isTokenExpiredSoon } from "@/lib/utils/token";
import { toast } from "react-toastify";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export default function POSPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // safety timeout
    (async () => {
      try {
        let token = localStorage.getItem("accessToken");
        // Proactively refresh if token is missing or expiring
        if (!token || isTokenExpiredSoon(token)) {
          const rt = localStorage.getItem("refreshToken");
          if (rt) {
            const refreshRes = await fetch("/api/auth/refresh", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: rt }),
            });
            if (refreshRes.ok) {
              const { data } = await refreshRes.json();
              if (data?.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
                token = data.accessToken as string;
              }
              if (data?.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
              }
            }
          }
        }
        const res = await fetch("/api/cash-register", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (res.ok) {
          const payload = await res.json();
          const data = payload?.data ?? payload;
          setRegisterOpen(Boolean(data?.isOpen));
        }
      } catch (e) {
        if ((e as any).name !== "AbortError") {
          console.error("Failed to get cash register status", e);
        }
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    })();
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [router]);

  const handleAddToCart = (productId: string, name: string, price: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice - item.discount,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId,
          productName: name,
          quantity: 1,
          unitPrice: price,
          discount: 0,
          total: price,
        },
      ];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              total: quantity * item.unitPrice - item.discount,
            }
          : item
      )
    );
  };

  const handleApplyDiscount = (productId: string, discount: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              discount,
              total: item.quantity * item.unitPrice - discount,
            }
          : item
      )
    );
  };

  const handleCheckout = async (paymentMethod: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(`${error.error || "Error al completar la venta"}`);
        return;
      }

      toast.success("¡Venta completada exitosamente!");
      setCartItems([]);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Error al procesar la venta. Intenta nuevamente.");
    }
  };

  if (loading || registerOpen === null) {
    return <Loading label="Cargando POS..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          POS - {user?.role === "admin" ? "Administrador" : user?.fullName}
        </h1>
        {registerOpen === false && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-1">
              Caja Cerrada
            </p>
            <p className="text-gray-600">
              Debes abrir una caja desde la sección "Control de Caja" para
              comenzar a vender
            </p>
          </div>
        )}

        {registerOpen === true && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductSearch onAddToCart={handleAddToCart} />
            </div>
            <div>
              <Cart
                items={cartItems}
                onRemove={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateQuantity}
                onApplyDiscount={handleApplyDiscount}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
