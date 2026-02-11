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
import { formatARS } from "@/lib/utils/currency";
import {
  clampDiscountLimit,
  getMaxDiscountByLimit,
} from "@/lib/utils/discounts";

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
  const [storedClientId, setStoredClientId] = useState<string | null>(null);
  const router = useRouter();
  const { t, currentLanguage } = useGlobalLanguage();
  const { formatDate, formatTime } = useBusinessDateTime();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState<boolean | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [receiptDetails, setReceiptDetails] = useState<any>(null);
  const [businessConfig, setBusinessConfig] = useState<any>(null);
  const clientSelectRef = useRef<HTMLSelectElement>(null);
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSummary, setAccountSummary] = useState<{
    balance: number;
    transactions: Array<{
      _id: string;
      type: "charge" | "payment" | "adjustment";
      amount: number;
      description?: string;
      createdAt?: string;
    }>;
  } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

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
    const savedClientId = localStorage.getItem("pos.selectedClientId");
    if (savedClientId) {
      setStoredClientId(savedClientId);
    }
  }, []);

  useEffect(() => {
    const id = selectedClient?._id ? String(selectedClient._id) : "";
    if (id) {
      localStorage.setItem("pos.selectedClientId", id);
      setStoredClientId(id);
    } else {
      localStorage.removeItem("pos.selectedClientId");
      setStoredClientId(null);
    }
  }, [selectedClient]);

  useEffect(() => {
    setAccountSummary(null);
  }, [selectedClient?._id]);

  useEffect(() => {
    if (!selectedClient && showAccountModal) {
      setShowAccountModal(false);
    }
  }, [selectedClient, showAccountModal]);

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

  const getPosLabel = (key: string, defaultText: string) => {
    const label = t(key, "pos");
    return label === key ? defaultText : label;
  };

  const accountPaymentLabel = getPosLabel(
    "ui.paymentOptions.account",
    currentLanguage === "en"
      ? "Account"
      : currentLanguage === "pt"
        ? "Conta corrente"
        : "Cuenta corriente",
  );

  const getAccountTypeLabel = (type: "charge" | "payment" | "adjustment") => {
    if (type === "charge") {
      return getPosLabel("ui.accountCharge", "Cargo");
    }
    if (type === "payment") {
      return getPosLabel("ui.accountPayment", "Pago");
    }
    return getPosLabel("ui.accountAdjustment", "Ajuste");
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
      account: accountPaymentLabel,
    };
    return methodMap[method] || method;
  };

  const formatCurrency = (value: number) => formatARS(value || 0);

  const accountBalanceValue = accountSummary?.balance ?? 0;
  const accountBalanceLabel =
    accountBalanceValue < 0
      ? getPosLabel("ui.balanceCreditLabel", "Saldo a favor")
      : getPosLabel("ui.balanceDueLabel", "Saldo pendiente");
  const accountBalanceDisplay = formatCurrency(Math.abs(accountBalanceValue));

  const fetchClientAccount = async () => {
    if (!selectedClient?._id) return;
    setAccountLoading(true);
    try {
      const response = await apiFetch(
        `/api/clients/account?clientId=${selectedClient._id}`,
      );
      if (response.ok) {
        const data = await response.json();
        const payload = data.data || data;
        setAccountSummary({
          balance: payload.balance || 0,
          transactions: payload.transactions || [],
        });
      } else {
        toast.error(
          getPosLabel("ui.accountLoadError", "Error al cargar cuenta"),
        );
      }
    } catch (error) {
      console.error("Failed to load client account", error);
      toast.error(getPosLabel("ui.accountLoadError", "Error al cargar cuenta"));
    } finally {
      setAccountLoading(false);
    }
  };

  const handleOpenAccount = async () => {
    setShowAccountModal(true);
    await fetchClientAccount();
  };

  const handleRegisterPayment = async () => {
    if (!selectedClient?._id) return;
    const normalized = Number(paymentAmount.replace(",", "."));
    if (!Number.isFinite(normalized) || normalized <= 0) {
      toast.error(getPosLabel("ui.accountInvalidAmount", "Monto inválido"));
      return;
    }

    if (accountBalanceValue > 0 && normalized > accountBalanceValue) {
      toast.error(
        getPosLabel(
          "ui.accountOverpayError",
          "El pago supera el saldo pendiente",
        ),
      );
      return;
    }

    try {
      const response = await apiFetch("/api/clients/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient._id,
          amount: normalized,
          description: paymentNote,
        }),
      });

      if (response.ok) {
        setPaymentAmount("");
        setPaymentNote("");
        await fetchClientAccount();
        toast.success(getPosLabel("ui.accountPaymentSaved", "Pago registrado"));
      } else {
        toast.error(
          getPosLabel("ui.accountPaymentError", "Error al registrar pago"),
        );
      }
    } catch (error) {
      console.error("Failed to register payment", error);
      toast.error(
        getPosLabel("ui.accountPaymentError", "Error al registrar pago"),
      );
    }
  };

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

  const resolveEffectiveDiscountLimit = () => {
    const userLimit = clampDiscountLimit(user?.discountLimit);
    const clientLimit = clampDiscountLimit(selectedClient?.discountLimit);
    if (typeof userLimit === "number" && typeof clientLimit === "number") {
      return Math.min(userLimit, clientLimit);
    }
    return typeof userLimit === "number"
      ? userLimit
      : typeof clientLimit === "number"
        ? clientLimit
        : null;
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
        } else {
          setRegisterOpen(false);
        }

        // Fetch business config
        try {
          const configRes = await apiFetch("/api/business-config", {
            method: "GET",
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
          setRegisterOpen(false);
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
    const effectiveLimit = resolveEffectiveDiscountLimit();
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              discount: (() => {
                const raw = Number.isFinite(discount) ? discount : 0;
                const normalized = Math.max(0, Math.round(raw));
                const lineSubtotal = Math.round(item.quantity * item.unitPrice);
                const maxAllowed = Math.min(
                  lineSubtotal,
                  getMaxDiscountByLimit(lineSubtotal, effectiveLimit),
                );
                if (normalized > maxAllowed) {
                  toast.error(
                    t("ui.discountLimitExceeded", "pos") !==
                      "ui.discountLimitExceeded"
                      ? (t("ui.discountLimitExceeded", "pos") as string)
                      : "Discount exceeds your limit",
                  );
                }
                return Math.min(normalized, maxAllowed);
              })(),
              total: (() => {
                const rawDiscount = Number.isFinite(discount) ? discount : 0;
                const normalized = Math.max(0, Math.round(rawDiscount));
                const lineSubtotal = Math.round(item.quantity * item.unitPrice);
                const maxAllowed = Math.min(
                  lineSubtotal,
                  getMaxDiscountByLimit(lineSubtotal, effectiveLimit),
                );
                return Math.max(
                  0,
                  lineSubtotal - Math.min(normalized, maxAllowed),
                );
              })(),
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
          localStorage.removeItem("pos.selectedClientId");
          setStoredClientId(null);
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
      if (paymentMethod === "account" && !selectedClient?._id) {
        toast.error(
          getPosLabel(
            "ui.accountRequiresClient",
            "Selecciona un cliente para cobrar a cuenta",
          ),
        );
        return;
      }

      const grossSubtotal = cartItems.reduce((sum, item) => {
        const lineSubtotal = Math.round(item.quantity * item.unitPrice);
        return sum + Math.max(0, lineSubtotal);
      }, 0);
      const totalDiscount = cartItems.reduce((sum, item) => {
        const lineSubtotal = Math.round(item.quantity * item.unitPrice);
        const rawDiscount = Math.max(0, Math.round(item.discount || 0));
        return sum + Math.min(lineSubtotal, rawDiscount);
      }, 0);

      if (totalDiscount > grossSubtotal) {
        toast.error(t("ui.discountExceedsSubtotal", "pos") as string);
        return;
      }

      const resolvedLimit = resolveEffectiveDiscountLimit();
      if (typeof resolvedLimit === "number") {
        const maxAllowedTotal = Math.max(
          0,
          Math.round((resolvedLimit / 100) * grossSubtotal),
        );
        if (totalDiscount > maxAllowedTotal) {
          toast.error(t("ui.discountExceedsUserLimit", "pos") as string);
          return;
        }
      }

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
          clientId: selectedClient?._id || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Checkout API error:", error.error);
        const handled = handleCheckoutError(error);
        if (!handled) {
          const message =
            typeof error?.error === "string"
              ? error.error
              : typeof error?.message === "string"
                ? error.message
                : null;
          toast.error(message || t("ui.checkoutError", "pos"));
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
      setReceiptDetails(null);
      setShowReceiptModal(true);
      const saleId = sale?.id || sale?._id;
      if (saleId) {
        void (async () => {
          try {
            const receiptResponse = await apiFetch(
              `/api/sales/receipt?saleId=${saleId}&format=json&lang=${currentLanguage}`,
            );
            if (receiptResponse.ok) {
              const receiptPayload = await receiptResponse.json();
              const receipt = receiptPayload.receipt || receiptPayload.data;
              if (receipt) {
                setReceiptDetails(receipt);
              }
            }
          } catch (error) {
            console.error("Failed to load receipt details", error);
          }
        })();
      }
      setCartItems([]);

      if (paymentMethod === "account" && selectedClient?._id) {
        fetchClientAccount();
      }
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
  const receiptIsFiscal = Boolean(
    receiptDetails?.documentType?.startsWith("INVOICE") ||
    lastSale?.receiptType === "FISCAL",
  );
  const receiptIsProvisional = Boolean(
    receiptDetails?.documentType === "BUDGET" ||
    receiptDetails?.isProvisional ||
    lastSale?.receiptType === "PROVISIONAL",
  );
  const receiptDocumentType = receiptDetails?.documentType
    ? receiptDetails.documentType
    : lastSale?.receiptType === "FISCAL"
      ? "INVOICE"
      : "BUDGET";
  const receiptNumbering = receiptIsFiscal
    ? receiptDetails?.documentNumber
    : receiptDetails?.receiptNumber || lastSale?.invoiceNumber;
  const receiptPrintingBehavior = receiptIsFiscal
    ? "ARCA responds OK"
    : "ARCA does not respond";

  return (
    <div className="vp-page">
      <Header user={user} showBackButton={true} />

      <main className="vp-page-inner">
        <div className="vp-card vp-card-soft p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="vp-status-pill">
              <span className="vp-status-dot" />
              {getPosLabel("ui.statusOnline", "Online")}
            </span>
            <span className="vp-status-pill">
              {getPosLabel("ui.statusSync", "Sync 0s")}
            </span>
            <span className="vp-status-pill">
              {getPosLabel("ui.statusPrinter", "Printer OK")}
            </span>
          </div>
          <div className="text-sm text-[hsl(var(--vp-muted))]">
            {formatDate(new Date())} · {formatTime(new Date())}
          </div>
        </div>
        <div className="vp-card p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[hsl(var(--vp-text))]">
                {getPosLabel("ui.fiscalComparison.title", "Provisional Receipt vs Fiscal Invoice")}
              </h2>
              <p className="text-sm text-[hsl(var(--vp-muted))]">
                {getPosLabel("ui.fiscalComparison.subtitle", "Receipt type is automatic. Cashiers cannot choose it manually.")}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="vp-table">
              <thead>
                <tr>
                  <th>{getPosLabel("ui.fiscalComparison.feature", "Feature")}</th>
                  <th>{getPosLabel("ui.fiscalComparison.provisionalReceipt", "Provisional Receipt (Budget)")}</th>
                  <th>{getPosLabel("ui.fiscalComparison.fiscalInvoice", "Fiscal Invoice (A / B)")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{getPosLabel("ui.fiscalComparison.documentType", "Document Type")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.documentTypeBudget", "BUDGET")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.documentTypeFiscal", "INVOICE A / INVOICE B")}</td>
                </tr>
                <tr>
                  <td>{getPosLabel("ui.fiscalComparison.numbering", "Numbering")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.numberingInternal", "Internal (e.g., 01-003)")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.numberingFiscal", "ARCA / fiscal (e.g., 0001-00001234)")}</td>
                </tr>
                <tr>
                  <td>{getPosLabel("ui.fiscalComparison.caeExpiration", "CAE & Expiration")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.no", "No")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.yes", "Yes")}</td>
                </tr>
                <tr>
                  <td>{getPosLabel("ui.fiscalComparison.fiscalQR", "Fiscal QR")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.no", "No")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.yes", "Yes")}</td>
                </tr>
                <tr>
                  <td>{getPosLabel("ui.fiscalComparison.fiscalValidity", "Fiscal Validity")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.notValid", "Not valid")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.validBeforeArca", "Valid before ARCA")}</td>
                </tr>
                <tr>
                  <td>{getPosLabel("ui.fiscalComparison.usage", "Usage")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.contingencyBackup", "Contingency / Backup")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.finalLegalDocument", "Final legal document")}</td>
                </tr>
                <tr>
                  <td>{getPosLabel("ui.fiscalComparison.whenPrinted", "When it is printed")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.arcaNoResponse", "ARCA does not respond")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.arcaRespondsOK", "ARCA responds OK")}</td>
                </tr>
                <tr>
                  <td>{getPosLabel("ui.fiscalComparison.editing", "Editing")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.notEditable", "Not editable")}</td>
                  <td>{getPosLabel("ui.fiscalComparison.editableCreditNotes", "Editable only for credit notes")}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-[hsl(var(--vp-text))] mb-2">
              {getPosLabel("ui.fiscalComparison.quickSummaryTitle", "Quick Visual Summary")}
            </h3>
            <ul className="text-sm text-[hsl(var(--vp-muted))] space-y-1">
              <li>{getPosLabel("ui.fiscalComparison.summaryProvisional", "Provisional = temporary backup, no fiscal validity")}</li>
              <li>{getPosLabel("ui.fiscalComparison.summaryFiscal", "Fiscal = final legal document")}</li>
              <li>{getPosLabel("ui.fiscalComparison.summaryNeverPrints", "Fiscal invoice never prints without CAE")}</li>
              <li>{getPosLabel("ui.fiscalComparison.summaryCorrections", "Corrections via Credit Note only")}</li>
            </ul>
          </div>
        </div>
        <h1 className="vp-section-title mb-10">{title}</h1>
        {registerOpen === false && (
          <div className="vp-card vp-card-hover p-12 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-orange-500 rounded-full">
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
            <p className="mb-1 text-lg font-semibold text-[hsl(var(--vp-text))]">
              {t("ui.closedTitle", "pos")}
            </p>
            <p className="text-[hsl(var(--vp-muted))]">
              {t("ui.closedDescription", "pos")}
            </p>
          </div>
        )}

        {registerOpen === true && (
          <>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                {/* Client Selector */}
                <div className="mb-2">
                  <ClientSelector
                    value={selectedClient}
                    onChange={setSelectedClient}
                    selectRef={clientSelectRef}
                    selectedClientId={storedClientId}
                  />
                  {selectedClient ? (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 vp-panel-sm bg-[hsl(var(--vp-primary))]/8">
                      <div className="text-sm text-[hsl(var(--vp-text))]">
                        <span className="font-semibold">
                          {getPosLabel("ui.accountLabel", "Cuenta")}
                        </span>
                        <span className="mx-2 text-[hsl(var(--vp-muted))]">
                          •
                        </span>
                        <span className="text-[hsl(var(--vp-muted))]">
                          {accountBalanceLabel}:{" "}
                          {accountSummary ? accountBalanceDisplay : "--"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOpenAccount}
                          className="vp-button vp-button-primary text-xs"
                        >
                          {getPosLabel("ui.viewAccount", "Ver cuenta")}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
                {/* New Keyboard-First Input */}
                <KeyboardPOSInput
                  onAddToCart={handleAddToCart}
                  onCustomerAction={handleCustomerAction}
                />

                {/* Legacy Product Search (collapsible) */}
                <details className="group">
                  <summary className="list-none cursor-pointer">
                    <div className="flex items-center justify-between vp-panel-sm vp-hover-surface">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-[hsl(var(--vp-muted))] transition-transform group-open:rotate-90"
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
                        <span className="font-medium text-[hsl(var(--vp-text))]">
                          {t("ui.advancedSearch", "pos") !== "ui.advancedSearch"
                            ? t("ui.advancedSearch", "pos")
                            : "Advanced Search"}
                        </span>
                      </div>
                      <span className="text-xs text-[hsl(var(--vp-muted))]">
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
                  additionalPaymentMethods={
                    selectedClient
                      ? [
                          {
                            id: "account",
                            name: accountPaymentLabel,
                            enabled: true,
                          },
                        ]
                      : []
                  }
                />
              </div>
            </div>

            {/* Receipt Modal */}
            {showReceiptModal && lastSale && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 receipt-overlay">
                <div className="w-full max-w-md overflow-y-auto vp-card max-h-96 border border-[hsl(var(--vp-border))] vp-modal receipt-modal">
                  <div className="p-6 text-slate-900 dark:text-slate-100 receipt-container">
                    {/* Business Header */}
                    <div className="pb-4 mb-4 text-center border-b border-slate-200 dark:border-slate-700">
                      {businessConfig?.ticketLogo && (
                        <img
                          src={businessConfig.ticketLogo}
                          alt={businessConfig?.businessName || "Logo"}
                          className="mx-auto mb-2 h-12 w-12 rounded-full object-contain"
                        />
                      )}
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
                      {receiptIsProvisional && (
                        <div className="mb-2 rounded border-2 border-red-600 bg-red-50 px-3 py-2 text-center text-xs font-bold uppercase text-red-700">
                          BUDGET - NOT VALID
                        </div>
                      )}
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

                    <div className="mb-4 text-xs rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Document Type</span>
                        <span className="font-semibold">
                          {receiptDocumentType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Numbering</span>
                        <span className="font-semibold">
                          {receiptNumbering || "-"}
                        </span>
                      </div>
                      {receiptIsFiscal && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-500">CAE</span>
                            <span className="font-semibold">
                              {receiptDetails?.cae || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">
                              CAE Expiration
                            </span>
                            <span className="font-semibold">
                              {receiptDetails?.caeVto || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Fiscal QR</span>
                            <span className="font-semibold">
                              {receiptDetails?.fiscalQrAvailable ? "Yes" : "No"}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fiscal Validity</span>
                        <span className="font-semibold">
                          {receiptDetails?.fiscalValidityLabel || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Usage</span>
                        <span className="font-semibold">
                          {receiptDetails?.fiscalUsageLabel || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Printing Behavior
                        </span>
                        <span className="font-semibold">
                          {receiptPrintingBehavior}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Editing</span>
                        <span className="font-semibold">
                          {receiptDetails?.fiscalEditLabel || "-"}
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
                                  {item.quantity} x{" "}
                                  {formatCurrency(item.unitPrice)}
                                </div>
                              </div>
                              <div className="text-right">
                                {formatCurrency(
                                  item.quantity * item.unitPrice -
                                    (item.discount || 0),
                                )}
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
                        <span>{formatCurrency(lastSale?.subtotal || 0)}</span>
                      </div>
                      <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>
                          {getReceiptLabel("receipt.discount", "Discount:")}
                        </span>
                        <span>-{formatCurrency(lastSale?.discount || 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span>
                          {getReceiptLabel("receipt.total", "Total:")}
                        </span>
                        <span>{formatCurrency(lastSale?.total || 0)}</span>
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
                    <div className="flex gap-3 no-print">
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

            {/* Account Modal */}
            {showAccountModal && selectedClient && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                <div className="w-full max-w-2xl overflow-y-auto bg-white dark:bg-slate-900 rounded-lg shadow-lg max-h-[80vh] border border-slate-200 dark:border-slate-700">
                  <div className="p-6 text-slate-900 dark:text-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">
                          {getPosLabel("ui.accountTitle", "Cuenta del cliente")}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedClient?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAccountModal(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
                      >
                        {getPosLabel("ui.close", "Cerrar")}
                      </button>
                    </div>

                    <div className="mb-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {accountBalanceLabel}
                        </span>
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">
                          {accountBalanceDisplay}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {getPosLabel("ui.registerPayment", "Registrar pago")}
                      </h4>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                            {getPosLabel("ui.paymentAmount", "Monto")}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                            {getPosLabel("ui.paymentNote", "Detalle")}
                          </label>
                          <input
                            value={paymentNote}
                            onChange={(e) => setPaymentNote(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={handleRegisterPayment}
                          className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500"
                        >
                          {getPosLabel("ui.savePayment", "Guardar pago")}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {getPosLabel("ui.accountMovements", "Movimientos")}
                      </h4>
                      {accountLoading ? (
                        <div className="py-6 text-center text-sm text-slate-500">
                          {getPosLabel("ui.loading", "Cargando...")}
                        </div>
                      ) : accountSummary?.transactions?.length ? (
                        <div className="space-y-2">
                          {accountSummary.transactions.map((txn) => (
                            <div
                              key={txn._id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2"
                            >
                              <div>
                                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {getAccountTypeLabel(txn.type)}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {txn.description || "-"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-sm font-semibold ${
                                    txn.type === "payment"
                                      ? "text-emerald-600"
                                      : txn.type === "charge"
                                        ? "text-rose-600"
                                        : "text-slate-700 dark:text-slate-200"
                                  }`}
                                >
                                  {formatCurrency(Math.abs(txn.amount))}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {txn.createdAt
                                    ? new Date(
                                        txn.createdAt,
                                      ).toLocaleDateString(undefined)
                                    : ""}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-sm text-slate-500">
                          {getPosLabel(
                            "ui.noAccountMovements",
                            "Sin movimientos",
                          )}
                        </div>
                      )}
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
