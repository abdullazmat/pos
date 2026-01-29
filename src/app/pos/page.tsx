"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { useBusinessDateTime } from "@/lib/hooks/useBusinessDateTime";
import { apiFetch } from "@/lib/utils/apiFetch";
import ProductSearch from "@/components/pos/ProductSearch";
import KeyboardPOSInput from "@/components/pos/KeyboardPOSInput";
import Cart from "@/components/pos/Cart";
import ClientSelector from "@/components/pos/ClientSelector";
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
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const router = useRouter();
  const { t, currentLanguage } = useGlobalLanguage();
  const { formatDate, formatTime } = useBusinessDateTime();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState<boolean | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [businessConfig, setBusinessConfig] = useState<any>(null);
  const clientSelectRef = useRef<HTMLSelectElement>(null);
  const [isCartHydrated, setIsCartHydrated] = useState(false);

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

  const getReceiptLabel = (key: string, defaultText: string) => {
    const label = t(key, "pos");
    // If translation returns the key itself (not translated), use default
    return label === key ? defaultText : label;
  };

  const getPaymentMethodLabel = (method: string): string => {
    const methodMap: Record<string, string> = {
      cash: t("ui.paymentOptions.cash", "pos") || "Cash",
      card: t("ui.paymentOptions.card", "pos") || "Card",
      check: t("ui.paymentOptions.check", "pos") || "Check",
      online: t("ui.paymentOptions.online", "pos") || "Online",
      bankTransfer:
        t("ui.paymentOptions.bankTransfer", "pos") || "Bank Transfer",
      qr: t("ui.paymentOptions.qr", "pos") || "QR",
      mercadopago: t("ui.paymentOptions.mercadopago", "pos") || "Mercado Pago",
    };
    return methodMap[method] || method;
  };

  const handleCheckoutError = (errorPayload: any) => {
    const message =
      typeof errorPayload?.error === "string"
        ? errorPayload.error
        : typeof errorPayload?.message === "string"
          ? errorPayload.message
          : "";

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

        // Fetch business config
        try {
          const configRes = await fetch("/api/business-config", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (configRes.ok) {
            const configData = await configRes.json();
            setBusinessConfig(configData.data || configData);
          }
        } catch (e) {
          toast.error(
            t("ui.businessConfigError", "pos") !== "ui.businessConfigError"
              ? t("ui.businessConfigError", "pos")
              : "Error al cargar configuración del negocio",
          );
          console.error("Failed to get business config", e);
        }
      } catch (e) {
        if ((e as any).name !== "AbortError") {
          toast.error(
            t("ui.cashRegisterStatusError", "pos") !==
              "ui.cashRegisterStatusError"
              ? t("ui.cashRegisterStatusError", "pos")
              : "Error al cargar estado de caja",
          );
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

  useEffect(() => {
    const handleDeleteKey = (event: KeyboardEvent) => {
      if (event.key !== "Delete") return;

      const target = event.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (!isEditable) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleDeleteKey);
    return () => {
      document.removeEventListener("keydown", handleDeleteKey);
    };
  }, []);

  const handleAddToCart = (
    productId: string,
    name: string,
    price: number,
    quantity?: number,
    isSoldByWeight?: boolean,
  ) => {
    // Support both old (without quantity) and new (with quantity) signatures
    const actualQuantity =
      quantity !== undefined ? quantity : isSoldByWeight ? 0.1 : 1;

    console.log("handleAddToCart called", {
      productId,
      name,
      price,
      quantity: actualQuantity,
      isSoldByWeight,
    });

    setCartItems((prev) => {
      console.log("Previous cart items", prev);
      const existing = prev.find((item) => item.productId === productId);
      const normalizedPrice = price;
      console.log("normalizedPrice", normalizedPrice);

      if (existing) {
        // Add to existing item
        return prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + actualQuantity,
                total: Math.max(
                  0,
                  (item.quantity + actualQuantity) * normalizedPrice -
                    item.discount,
                ),
              }
            : item,
        );
      }

      // Add new item
      return [
        ...prev,
        {
          productId,
          productName: name,
          quantity: actualQuantity,
          unitPrice: normalizedPrice,
          discount: 0,
          total: Math.max(0, actualQuantity * normalizedPrice),
          isSoldByWeight: isSoldByWeight || false,
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
              discount,
              total: Math.max(0, item.quantity * item.unitPrice - discount),
            }
          : item,
      ),
    );
  };

  const handleCustomerAction = (
    action: "change" | "search" | "new" | "remove",
  ) => {
    try {
      switch (action) {
        case "change":
          clientSelectRef.current?.focus();
          clientSelectRef.current?.click();
          break;
        case "search":
          clientSelectRef.current?.focus();
          clientSelectRef.current?.click();
          break;
        case "new":
          router.push("/clients");
          break;
        case "remove":
          setSelectedClient(null);
          if (clientSelectRef.current) {
            clientSelectRef.current.value = "";
          }
          toast.success(
            t("ui.removeCustomer", "pos") !== "ui.removeCustomer"
              ? t("ui.removeCustomer", "pos")
              : "Customer removed",
            {
              autoClose: 2000,
              position: "top-center",
            },
          );
          break;
        default:
          console.warn("Unknown customer action:", action);
          toast.warning("Unknown customer action");
      }
    } catch (error) {
      console.error("Error handling customer action:", error);
      toast.error("Failed to process customer action");
    }
  };

  const handleCheckout = async (paymentMethod: string) => {
    try {
      const defaultCustomerName =
        currentLanguage === "en"
          ? "Final Consumer"
          : currentLanguage === "pt"
            ? "Consumidor Final"
            : "Consumidor Final";
      const response = await apiFetch("/api/sales/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems,
          paymentMethod,
          customerName: selectedClient?.name || defaultCustomerName,
          customerEmail: selectedClient?.email || undefined,
          customerCuit: selectedClient?.document || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Checkout API error:", error.error);
        const handled = handleCheckoutError(error);
        if (!handled) {
          toast.error(t("ui.checkoutError", "pos"));
        }
        return;
      }

      const data = await response.json();
      const sale = data.data?.sale || data.sale;

      console.log("Sale response data:", { data, sale });

      if (!sale) {
        console.error("No sale data in response:", data);
        toast.error(t("ui.checkoutError", "pos"));
        return;
      }

      toast.success(t("ui.checkoutSuccess", "pos"));
      setLastSale(sale);
      setShowReceiptModal(true);
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

      <main className="px-4 py-6 mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {registerOpen === false && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-orange-600 rounded-full dark:bg-orange-500">
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
            <p className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
              {t("ui.closedTitle", "pos")}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {t("ui.closedDescription", "pos")}
            </p>
          </div>
        )}

        {registerOpen === true && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                {/* Client Selector */}
                <div className="mb-2">
                  <ClientSelector
                    value={selectedClient}
                    onChange={setSelectedClient}
                    selectRef={clientSelectRef}
                  />
                </div>
                {/* New Keyboard-First Input */}
                <KeyboardPOSInput
                  onAddToCart={handleAddToCart}
                  onCustomerAction={handleCustomerAction}
                />

                {/* Legacy Product Search (collapsible) */}
                <details className="group">
                  <summary className="list-none cursor-pointer">
                    <div className="flex items-center justify-between p-4 transition rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-gray-600 transition-transform dark:text-gray-400 group-open:rotate-90"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {t("ui.advancedSearch", "pos") !== "ui.advancedSearch"
                            ? t("ui.advancedSearch", "pos")
                            : "Advanced Search"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t("ui.clickToExpand", "pos") !== "ui.clickToExpand"
                          ? t("ui.clickToExpand", "pos")
                          : "Click to expand"}
                      </span>
                    </div>
                  </summary>
                  <div className="mt-4">
                    <ProductSearch onAddToCart={handleAddToCart} />
                  </div>
                </details>
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

            {/* Receipt Modal */}
            {showReceiptModal && lastSale && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                <div className="w-full max-w-md overflow-y-auto bg-white dark:bg-slate-900 rounded-lg shadow-lg max-h-96 border border-slate-200 dark:border-slate-700">
                  <div className="p-6 text-slate-900 dark:text-slate-100">
                    {/* Business Header */}
                    <div className="pb-4 mb-4 text-center border-b border-slate-200 dark:border-slate-700">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {businessConfig?.businessName || "Recibo de Venta"}
                      </h2>
                      {businessConfig?.address && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {businessConfig.address}
                        </p>
                      )}
                      {businessConfig?.phone && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Tel: {businessConfig.phone}
                        </p>
                      )}
                      {businessConfig?.email && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {businessConfig.email}
                        </p>
                      )}
                    </div>

                    {/* Receipt Content */}
                    <div className="py-4 mb-4 space-y-2 text-sm border-t border-b border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          {getReceiptLabel("receipt.date", "Date:")}
                        </span>
                        <span className="font-semibold">
                          {lastSale?.createdAt
                            ? formatDate(lastSale.createdAt)
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          {getReceiptLabel("receipt.time", "Time:")}
                        </span>
                        <span className="font-semibold">
                          {lastSale?.createdAt
                            ? formatTime(lastSale.createdAt)
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-4 text-sm">
                      <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                        {getReceiptLabel("receipt.items", "Items")}
                      </h3>
                      <div className="space-y-1 text-slate-700 dark:text-slate-300">
                        {lastSale?.items && lastSale.items.length > 0 ? (
                          lastSale.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <div>
                                <div>{item.productName}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {item.quantity} x ${item.unitPrice.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-right">
                                $
                                {(
                                  item.quantity * item.unitPrice -
                                  (item.discount || 0)
                                ).toFixed(2)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="italic text-slate-400 dark:text-slate-500">
                            {getReceiptLabel("receipt.noItems", "No items")}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="pt-3 mb-4 space-y-1 text-sm border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          {getReceiptLabel("receipt.subtotal", "Subtotal:")}
                        </span>
                        <span>${lastSale?.subtotal?.toFixed(2) || "0.00"}</span>
                      </div>
                      {(lastSale?.discount || 0) > 0 && (
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                          <span>
                            {getReceiptLabel("receipt.discount", "Discount:")}
                          </span>
                          <span>-${(lastSale?.discount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span>
                          {getReceiptLabel("receipt.total", "Total:")}
                        </span>
                        <span>${lastSale?.total?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="p-2 mb-6 text-sm text-slate-700 dark:text-slate-300 rounded bg-slate-50 dark:bg-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">
                        {getReceiptLabel(
                          "receipt.paymentMethod",
                          "Payment Method:",
                        )}
                      </span>
                      <span className="ml-2 font-semibold">
                        {getPaymentMethodLabel(lastSale?.paymentMethod)}
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center flex-1 gap-2 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm-6-4h.01M7 11h.01"
                          />
                        </svg>
                        {getReceiptLabel("ui.print", "Print")}
                      </button>
                      <button
                        onClick={() => setShowReceiptModal(false)}
                        className="flex-1 py-2 font-semibold text-slate-800 dark:text-slate-100 transition bg-slate-300 dark:bg-slate-700 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-600"
                      >
                        {getReceiptLabel("ui.close", "Close")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
