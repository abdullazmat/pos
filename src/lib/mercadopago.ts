/**
 * Mercado Pago Integration Configuration
 * Handles payment processing for POS SaaS system
 */

// Mercado Pago configuration
export const MERCADO_PAGO_CONFIG = {
  currency: "ARS",
  country: "AR",
  language: "es-AR",
};

// Ensure token is configured
if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  console.warn("MERCADO_PAGO_ACCESS_TOKEN is not set in environment variables");
}

/**
 * Create a payment preference for Mercado Pago
 * @param items - Array of items to include in the preference
 * @param userEmail - Payer email
 * @param userName - Payer name
 * @param externalReference - External reference ID
 * @param backUrls - Back URLs for after payment
 * @param notificationUrl - Webhook URL for notifications
 * @returns Preference data with init_point
 */
export async function createMercadoPagoPreference(
  items: Array<{
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>,
  userEmail: string,
  userName: string,
  externalReference: string,
  backUrls?: {
    success: string;
    failure: string;
    pending: string;
  },
  notificationUrl?: string,
) {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN is not configured");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not configured");
    }

    const payload = {
      items: items.map((item) => ({
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id || "ARS",
      })),
      payer: {
        email: userEmail,
        name: userName,
      },
      back_urls: backUrls || {
        success: `${appUrl}/subscribe/mercadopago/success`,
        failure: `${appUrl}/subscribe/mercadopago/failure`,
        pending: `${appUrl}/subscribe/mercadopago/pending`,
      },
      notification_url:
        notificationUrl || `${appUrl}/api/payment/mercadopago/webhook`,
      external_reference: externalReference,
      auto_return: "approved",
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Mercado Pago API error:", errorData);
      throw new Error(
        `Mercado Pago API error: ${response.status} - ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();
    console.log("✅ Mercado Pago preference created successfully:", data.id);

    return {
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    };
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error);
    throw error;
  }
}
