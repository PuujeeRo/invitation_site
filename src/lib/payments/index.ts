import { MockPaymentProvider } from "./mock";
import { QPayProvider } from "./qpay";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.QPAY_CLIENT_ID && process.env.QPAY_CLIENT_SECRET && process.env.QPAY_INVOICE_CODE;
  return configured ? new QPayProvider() : new MockPaymentProvider();
}

export type { PaymentProvider, CreateInvoiceParams, CreateInvoiceResult } from "./types";
