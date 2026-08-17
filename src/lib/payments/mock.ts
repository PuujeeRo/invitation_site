import { getSiteUrl } from "@/lib/site-url";
import type { CreateInvoiceParams, CreateInvoiceResult, PaymentProvider } from "./types";

// Dev/testing stand-in for QPay, used automatically when QPAY_* env vars are
// absent. Exercises the same downstream flow as a real gateway would (create
// invoice -> redirect organizer to pay -> gateway confirms -> mark paid) via a
// local "checkout" page instead of an external one, so the rest of the payment
// code path (see api/payments/mock/confirm) gets real coverage in dev.
export class MockPaymentProvider implements PaymentProvider {
  name = "mock" as const;

  async createInvoice({ paymentId }: CreateInvoiceParams): Promise<CreateInvoiceResult> {
    return {
      providerRef: `mock_${paymentId}`,
      checkoutUrl: `${getSiteUrl()}/pay/mock/${paymentId}`,
    };
  }
}
