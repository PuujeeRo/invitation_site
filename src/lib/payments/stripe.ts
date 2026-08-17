import Stripe from "stripe";
import { getSiteUrl } from "@/lib/site-url";
import type { CreateInvoiceParams, CreateInvoiceResult, PaymentProvider } from "./types";

// Stripe expects amounts in the currency's smallest unit, but a handful of
// currencies have no minor unit at all -- for those, the amount is passed
// through unscaled. Getting this wrong silently charges 100x too much or too
// little, so the list is explicit rather than assumed.
// https://docs.stripe.com/currencies#zero-decimal
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA",
  "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

export function toStripeMinorUnits(amount: number, currency: string): number {
  const code = currency.toUpperCase();
  return ZERO_DECIMAL_CURRENCIES.has(code) ? Math.round(amount) : Math.round(amount * 100);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export class StripeProvider implements PaymentProvider {
  name = "stripe" as const;
  readonly currency: string;
  private client: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY");
    this.client = new Stripe(secretKey);
    this.currency = (process.env.STRIPE_CURRENCY ?? "MNT").toUpperCase();
  }

  async createInvoice({
    eventId,
    paymentId,
    amount,
    description,
  }: CreateInvoiceParams): Promise<CreateInvoiceResult> {
    const session = await this.client.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: this.currency.toLowerCase(),
              unit_amount: toStripeMinorUnits(amount, this.currency),
              product_data: { name: description },
            },
          },
        ],
        // The event is only actually unlocked by the webhook, never by this
        // redirect -- the success page shows its confirmation banner only once
        // events.is_paid is true, so a user landing here early just sees the
        // normal page rather than a false "paid" state.
        success_url: `${getSiteUrl()}/dashboard/${eventId}?paid=1`,
        cancel_url: `${getSiteUrl()}/dashboard/${eventId}/upgrade`,
        client_reference_id: paymentId,
        metadata: { payment_id: paymentId, event_id: eventId },
      },
      // Keyed on our own payment row id, so a double-submit or a retry reuses
      // the same Checkout Session instead of creating a second charge.
      { idempotencyKey: `naashir_checkout_${paymentId}` }
    );

    if (!session.url) {
      throw new Error("Stripe Checkout Session was created without a URL");
    }

    return { providerRef: session.id, checkoutUrl: session.url };
  }

  // Verifies the webhook signature and returns the parsed event. This is the
  // security boundary for the webhook: the request body is attacker-controlled
  // until this succeeds, so the caller must never trust the payload before it.
  // Throws if the signature, secret, or timestamp tolerance fails.
  constructWebhookEvent(rawBody: string, signatureHeader: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    return this.client.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
  }
}
