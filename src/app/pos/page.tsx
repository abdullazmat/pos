"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
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
  isSoldByWeight?: boolean;
}

export default function POSPage() {
  const router = useRouter();
  const { t } = useGlobalLanguage();
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

  const handleAddToCart = (
    productId: string,
    name: string,
    price: number,
    isSoldByWeight?: boolean,
  ) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.isSoldByWeight
                  ? item.quantity + 0.1
                  : item.quantity + 1,
                total:
                  (item.isSoldByWeight
                    ? item.quantity + 0.1
                    : item.quantity + 1) *
                    item.unitPrice -
                  item.discount,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId,
          productName: name,
          quantity: isSoldByWeight ? 0.1 : 1,
          unitPrice: price,
          discount: 0,
          total: isSoldByWeight ? price * 0.1 : price,
          isSoldByWeight: isSoldByWeight || false,
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
          : item,
      ),
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
          : item,
      ),
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
        // Show translated error message instead of API error
        console.error("Checkout API error:", error.error);
        toast.error(t("ui.checkoutError", "pos"));
        return;
      }

      toast.success(t("ui.checkoutSuccess", "pos"));
      setCartItems([]);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(t("ui.checkoutProcessError", "pos"));
    }
  };

  if (loading || registerOpen === null) {
    return <Loading label={t("ui.loading", "pos") || ""} />;
  }

  const roleLabel = user?.role
    ? t(`ui.roles.${user.role}`, "pos")
    : t("ui.roles.user", "pos");
  const displayName =
    user?.role === "admin" ? roleLabel : user?.fullName || roleLabel;
  const title = (t("ui.title", "pos") as string).replace("{role}", displayName);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header user={user} showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h1>
        {registerOpen === false && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-orange-600 dark:bg-orange-500 flex items-center justify-center mb-4">
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
            <p className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              {t("ui.closedTitle", "pos")}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {t("ui.closedDescription", "pos")}
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
