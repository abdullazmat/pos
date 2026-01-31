import {
  IPaymentProvider,
  PaymentPreference,
  PaymentStatus,
} from "./PaymentProvider";

/**
 * Mercado Pago Payment Service
 * Handles payment processing via Mercado Pago
 */
class MercadoPagoService implements IPaymentProvider {
  private accessToken: string;
  private baseUrl = "https://api.mercadopago.com";

  constructor() {
    this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
    if (!this.accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
    }
  }

  private mapStatus(status: string): PaymentStatus["status"] {
    const statusMap: Record<string, PaymentStatus["status"]> = {
      approved: "APPROVED",
      pending: "PENDING",
      authorized: "PENDING",
      in_process: "PENDING",
      in_mediation: "PENDING",
      rejected: "REJECTED",
      cancelled: "CANCELLED",
      refunded: "CANCELLED",
      charged_back: "REJECTED",
    };

    return statusMap[status] || "PENDING";
  }

  async createPaymentPreference(options: {
    businessName: string;
    planName: string;
    amount: number;
    currency: string;
    email: string;
    metadata: Record<string, any>;
  }): Promise<PaymentPreference> {
    try {
      const rawBaseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000";
      const baseUrl = rawBaseUrl.replace(/\/+$/, "");

      const payload = {
        items: [
          {
            title: `${options.businessName} - Plan ${options.planName}`,
            description: `Subscription to ${options.planName} plan`,
            category_id: "services",
            quantity: 1,
            unit_price: options.amount,
            currency_id: options.currency,
          },
        ],
        payer: {
          email: options.email,
        },
        // Allow QR, debit, and credit card while keeping installments to a single cycle
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1,
        },
        metadata: options.metadata,
        back_urls: {
          success: `${baseUrl}/subscribe/mercadopago/success`,
          failure: `${baseUrl}/subscribe/mercadopago/failure`,
          pending: `${baseUrl}/subscribe/mercadopago/pending`,
        },
        external_reference: options.metadata.businessId,
        notification_url: `${baseUrl}/api/webhooks/mercado-pago`,
        auto_return: "approved",
        statement_descriptor: "POS Facturador",
        expires: false,
      };

      const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Mercado Pago API error: ${error.message || response.statusText}`,
        );
      }

      const data = await response.json();

      return {
        id: data.id,
        preferenceLink: data.init_point,
        qrCode: data.qr_code, // Mercado Pago QR code if available
      };
    } catch (error) {
      console.error("Mercado Pago preference creation error:", error);
      throw error;
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v1/payments/search?external_reference=${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch payment status: ${response.statusText}`,
        );
      }

      const data = await response.json();
      const payment = data.results?.[0];

      if (!payment) {
        throw new Error("Payment not found");
      }

      return {
        status: this.mapStatus(payment.status),
        transactionId: payment.id.toString(),
        amount: payment.transaction_amount,
        timestamp: new Date(payment.date_created),
      };
    } catch (error) {
      console.error("Mercado Pago payment status error:", error);
      throw error;
    }
  }

  async getPaymentById(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch payment by id: ${response.statusText}`,
        );
      }

      const payment = await response.json();

      return {
        status: this.mapStatus(payment.status),
        transactionId: payment.id.toString(),
        amount: payment.transaction_amount,
        timestamp: new Date(payment.date_created),
      };
    } catch (error) {
      console.error("Mercado Pago payment lookup error:", error);
      throw error;
    }
  }

  validateWebhook(payload: any, signature: string): boolean {
    // Mercado Pago sends a simple webhook - in production, verify the signature
    // For now, validate required fields
    return (
      payload &&
      payload.data &&
      payload.data.id &&
      payload.action === "payment.created"
    );
  }

  /**
   * Extract payment info from webhook payload
   */
  extractPaymentInfo(payload: any): {
    externalReference: string;
    status: string;
    amount: number;
    transactionId: string;
  } | null {
    try {
      if (payload.type === "payment") {
        return {
          externalReference: payload.data.external_reference || "",
          status: payload.data.status || "pending",
          amount: payload.data.transaction_amount || 0,
          transactionId: payload.data.id.toString(),
        };
      }
      return null;
    } catch (error) {
      console.error("Error extracting payment info from webhook:", error);
      return null;
    }
  }
}

export default new MercadoPagoService();
