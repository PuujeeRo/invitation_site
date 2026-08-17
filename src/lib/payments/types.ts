export type PaymentProviderName = "qpay" | "stripe" | "mock";

export interface CreateInvoiceParams {
  eventId: string;
  paymentId: string;
  amount: number;
  description: string;
}

export interface CreateInvoiceResult {
  providerRef: string;
  // Where to send the organizer to complete payment.
  checkoutUrl: string;
}

export interface PaymentProvider {
  name: PaymentProviderName;
  // ISO 4217 code the provider will actually bill in. Recorded on the payment
  // row so the amount is never ambiguous (QPay is always MNT; a Stripe account
  // may be set up to charge in something else).
  currency: string;
  createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult>;
}
