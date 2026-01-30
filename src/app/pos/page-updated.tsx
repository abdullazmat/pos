"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductSearch from "@/components/pos/ProductSearch";
import CartWithInvoice, {
  CheckoutData,
} from "@/components/pos/CartWithInvoice";
import Header from "@/components/layout/Header";
import Loading from "@/components/common/Loading";
import { isTokenExpiredSoon } from "@/lib/utils/token";
import { toast } from "react-toastify";
import { UpgradePrompt } from "@/components/common/UpgradePrompt";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";

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
  const [mounted, setMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [isCartHydrated, setIsCartHydrated] = useState(false);

  const handleCheckoutError = (errorPayload: any) => {
    const message =
      typeof errorPayload?.error === "string"
        ? errorPayload.error
        : typeof errorPayload?.message === "string"
          ? errorPayload.message
          : "";

    if (/discount exceeds user limit/i.test(message)) {
      toast.error(t("ui.discountExceedsUserLimit", "pos") as string);
      return true;
    }

    if (/discount cannot exceed line subtotal/i.test(message)) {
      toast.error(t("ui.discountExceedsSubtotal", "pos") as string);
      return true;
    }

    if (/discount cannot exceed subtotal/i.test(message)) {
      toast.error(t("ui.discountExceedsSubtotal", "pos") as string);
      return true;
    }

    if (/discount must be 0 or higher/i.test(message)) {
      toast.error(t("ui.discountNegative", "pos") as string);
      return true;
    }

    if (/invalid discount/i.test(message)) {
      toast.error(t("ui.discountInvalid", "pos") as string);
      return true;
    }

    const match =
      /Insufficient stock for (.+)\. Available: ([\d.]+), Requested: ([\d.]+)/i.exec(
        message,
      );
    if (match) {
      const [, name, available, requested] = match;
      const localized = (t("ui.insufficientStock", "pos") as string)
        .replace("{name}", name)
        .replace("{available}", available)
        .replace("{requested}", requested);
      toast.error(localized);
      return true;
    }

    return false;
  };

  useEffect(() => {
    const saved = localStorage.getItem("pos.cartItems");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as CartItem[];
      if (Array.isArray(parsed)) {
        setCartItems(parsed);
      }
    } catch (error) {
      console.warn("Failed to restore cart from storage", error);
    } finally {
      setIsCartHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isCartHydrated) return;
    try {
      localStorage.setItem("pos.cartItems", JSON.stringify(cartItems));
    } catch (error) {
      console.warn("Failed to persist cart to storage", error);
    }
  }, [cartItems, isCartHydrated]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    loadSubscription();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    (async () => {
      try {
        let token = localStorage.getItem("accessToken");
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
  }, [router, mounted]);

  const loadSubscription = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription || { planId: "BASIC" });
      }
    } catch (error) {
      console.error("Load subscription error:", error);
      setSubscription({ planId: "BASIC" });
    }
  };

  const currentPlan: "BASIC" | "PROFESSIONAL" | "ENTERPRISE" =
    subscription?.planId?.toUpperCase() === "PROFESSIONAL"
      ? "PROFESSIONAL"
      : subscription?.planId?.toUpperCase() === "ENTERPRISE"
        ? "ENTERPRISE"
        : "BASIC";
  const canUseMercadoPago = currentPlan === "PROFESSIONAL";
  const canUseArcaInvoicing = currentPlan === "PROFESSIONAL";

  const handleAddToCart = (productId: string, name: string, price: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: Math.max(
                  0,
                  (item.quantity + 1) * item.unitPrice - item.discount,
                ),
              }
            : item,
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
          total: Math.max(0, price),
        },
      ];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              total: Math.max(0, quantity * item.unitPrice - item.discount),
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
              discount: (() => {
                const rawDiscount = Math.max(0, discount || 0);
                const lineSubtotal = item.quantity * item.unitPrice;
                const absoluteMax = Math.max(0, lineSubtotal);
                const userLimit =
                  typeof user?.discountLimit === "number"
                    ? user.discountLimit
                    : null;
                const limitMax =
                  userLimit === null
                    ? absoluteMax
                    : Math.max(0, (userLimit / 100) * lineSubtotal);
                const capped = Math.min(rawDiscount, absoluteMax, limitMax);
                if (rawDiscount > capped) {
                  toast.warning(
                    t("ui.discountLimitExceeded", "pos") !==
                      "ui.discountLimitExceeded"
                      ? (t("ui.discountLimitExceeded", "pos") as string)
                      : "Discount exceeds your limit",
                  );
                }
                return capped;
              })(),
              total: (() => {
                const rawDiscount = Math.max(0, discount || 0);
                const lineSubtotal = item.quantity * item.unitPrice;
                const absoluteMax = Math.max(0, lineSubtotal);
                const userLimit =
                  typeof user?.discountLimit === "number"
                    ? user.discountLimit
                    : null;
                const limitMax =
                  userLimit === null
                    ? absoluteMax
                    : Math.max(0, (userLimit / 100) * lineSubtotal);
                const capped = Math.min(rawDiscount, absoluteMax, limitMax);
                return Math.max(0, lineSubtotal - capped);
              })(),
            }
          : item,
      ),
    );
  };

  const handleCheckout = async (checkoutData: CheckoutData) => {
    try {
      // Check for restricted features on free plan
      if (checkoutData.paymentMethod === "mercadopago" && !canUseMercadoPago) {
        setUpgradeFeature("Pagos con Mercado Pago");
        setShowUpgradePrompt(true);
        return;
      }

      if (checkoutData.invoiceChannel === "ARCA" && !canUseArcaInvoicing) {
        setUpgradeFeature("Facturación ARCA");
        setShowUpgradePrompt(true);
        return;
      }

      const token = localStorage.getItem("accessToken");

      if (checkoutData.paymentMethod === "mercadopago") {
        // Create sale with MP pending status
        const response = await fetch("/api/sales/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cartItems,
            paymentMethod: checkoutData.paymentMethod,
            invoiceChannel: checkoutData.invoiceChannel,
            customerName: checkoutData.customerName,
            customerEmail: checkoutData.customerEmail,
            customerCuit: checkoutData.customerCuit,
            ivaType: checkoutData.ivaType,
            discount: checkoutData.discount,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          const handled = handleCheckoutError(error);
          if (!handled) {
            toast.error(
              `${error.error || error.details || "Error en el pago"}`,
            );
          }
          return;
        }

        const result = await response.json();

        if (result.sale.paymentLink) {
          window.open(result.sale.paymentLink, "_blank");

          setTimeout(() => {
            window.open(
              `/api/sales/receipt?saleId=${result.sale.id}&format=html`,
              "_blank",
              "width=400,height=600",
            );
          }, 500);

          toast.info(
            "Se abrió Mercado Pago. Completa el pago para confirmar la venta.",
          );
          setCartItems([]);
        }
        return;
      }

      // For cash/card/check/online
      const response = await fetch("/api/sales/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          paymentMethod: checkoutData.paymentMethod,
          invoiceChannel: checkoutData.invoiceChannel,
          customerName: checkoutData.customerName,
          customerEmail: checkoutData.customerEmail,
          customerCuit: checkoutData.customerCuit,
          ivaType: checkoutData.ivaType,
          discount: checkoutData.discount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const handled = handleCheckoutError(error);
        if (!handled) {
          toast.error(`${error.error || "Error al completar la venta"}`);
        }
        return;
      }

      const result = await response.json();

      // Open receipt for printing
      const receiptWindow = window.open(
        `/api/sales/receipt?saleId=${result.sale.id}&format=html`,
        "_blank",
        "width=400,height=600",
      );

      toast.success(
        "¡Venta completada! Se abrió el comprobante para imprimir.",
      );
      setCartItems([]);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(t("errorProcessingSale", "errors"));
    }
  };

  if (!mounted || loading || registerOpen === null) {
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
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
              <CartWithInvoice
                items={cartItems}
                onRemove={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateQuantity}
                onApplyDiscount={handleApplyDiscount}
                onCheckout={handleCheckout}
                canUseMercadoPago={canUseMercadoPago}
                canUseArcaInvoicing={canUseArcaInvoicing}
              />
            </div>
          </div>
        )}

        {/* Upgrade Prompts */}
        {showUpgradePrompt && (
          <UpgradePrompt
            featureName={upgradeFeature}
            reason={`${upgradeFeature} está disponible solo en el plan Pro`}
            onDismiss={() => setShowUpgradePrompt(false)}
          />
        )}
      </main>
    </div>
  );
}
