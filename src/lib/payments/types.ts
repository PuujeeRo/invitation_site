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
  name: "qpay" | "mock";
  createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult>;
}
