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
 * @returns Preference data with init_point
 */
export async function createMercadoPagoPreference(
  items: Array<{
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
  }>,
  userEmail: string,
  userName: string,
  externalReference: string,
) {
  try {
    // For production, implement actual Mercado Pago API call
    // Example code structure:
    // const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     items,
    //     payer: { email: userEmail, name: userName },
    //     external_reference: externalReference,
    //   }),
    // });

    // Mock response for development
    const mockPreferenceId = `PREF_${Date.now()}`;
    return {
      id: mockPreferenceId,
      init_point: `https://www.mercadopago.com/checkout/v1/redirect?pref_id=${mockPreferenceId}`,
      sandbox_init_point: `https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=${mockPreferenceId}`,
    };
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error);
    throw error;
  }
}
