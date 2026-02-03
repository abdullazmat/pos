import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/utils/apiFetch";

export interface SubscriptionData {
  planId: string;
  status: string;
  features: {
    maxProducts: number;
    maxUsers: number;
    maxCategories: number;
    maxClients: number;
    maxSuppliers: number;
    arcaIntegration: boolean;
    advancedReporting: boolean;
    customBranding: boolean;
    invoiceChannels: number;
  };
  isPremium: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await apiFetch("/api/subscriptions/status", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch subscription");
        }

        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        console.error("Subscription fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        // Set default BASIC plan on error
        setSubscription({
          planId: "BASIC",
          status: "active",
          isPremium: false,
          features: {
            maxProducts: 100,
            maxUsers: 2,
            maxCategories: 20,
            maxClients: 0,
            maxSuppliers: 5,
            arcaIntegration: false,
            advancedReporting: false,
            customBranding: false,
            invoiceChannels: 1,
          },
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return { subscription, loading, error };
}
