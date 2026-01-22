/**
 * Payment Provider Interface
 * Abstract interface for multiple payment providers
 */
export interface PaymentPreference {
  id: string;
  preferenceLink: string;
  qrCode?: string;
}

export interface PaymentStatus {
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  transactionId: string;
  amount: number;
  timestamp: Date;
}

export interface IPaymentProvider {
  createPaymentPreference(options: {
    businessName: string;
    planName: string;
    amount: number;
    currency: string;
    email: string;
    metadata: Record<string, any>;
  }): Promise<PaymentPreference>;

  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;

  validateWebhook(payload: any, signature: string): boolean;
}
