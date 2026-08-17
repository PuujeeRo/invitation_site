import { getSiteUrl } from "@/lib/site-url";
import type { CreateInvoiceParams, CreateInvoiceResult, PaymentProvider } from "./types";

// QPay Simple/v2 merchant API integration.
//
// NOT tested against a live merchant account -- this follows QPay's publicly
// documented v2 REST shape (POST /auth/token, POST /invoice, POST /payment/check)
// as of writing. Before going live: verify field names and the callback/webhook
// payload against the current QPay developer docs and a real sandbox invoice,
// since QPay does not publish a versioned OpenAPI spec and has changed field
// names between merchant integrations before.
const QPAY_BASE_URL = "https://merchant.qpay.mn/v2";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

// In-memory token cache. Fine for a single long-lived server process; on
// serverless it just re-authenticates on a cold start, which is harmless.
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }

  const clientId = requireEnv("QPAY_CLIENT_ID");
  const clientSecret = requireEnv("QPAY_CLIENT_SECRET");
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${QPAY_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basicAuth}` },
  });
  if (!res.ok) {
    throw new Error(`QPay auth failed: ${res.status} ${await res.text().catch(() => "")}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = {
    accessToken: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return cachedToken.accessToken;
}

export class QPayProvider implements PaymentProvider {
  name = "qpay" as const;

  async createInvoice({ paymentId, amount, description }: CreateInvoiceParams): Promise<CreateInvoiceResult> {
    const token = await getAccessToken();
    const invoiceCode = requireEnv("QPAY_INVOICE_CODE");

    const res = await fetch(`${QPAY_BASE_URL}/invoice`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoice_code: invoiceCode,
        sender_invoice_no: paymentId,
        invoice_receiver_code: "terminal",
        invoice_description: description,
        amount,
        callback_url: `${getSiteUrl()}/api/payments/qpay/webhook?payment_id=${paymentId}`,
      }),
    });

    if (!res.ok) {
      throw new Error(`QPay invoice creation failed: ${res.status} ${await res.text().catch(() => "")}`);
    }

    const json = (await res.json()) as {
      invoice_id: string;
      qPay_shortUrl?: string;
      urls?: { link: string }[];
    };

    const checkoutUrl = json.qPay_shortUrl ?? json.urls?.[0]?.link;
    if (!checkoutUrl) {
      throw new Error("QPay invoice response did not include a checkout URL");
    }

    return { providerRef: json.invoice_id, checkoutUrl };
  }

  // Called from the webhook handler to confirm a payment actually happened --
  // QPay's callback ping isn't authenticated, so it's only a signal to re-check,
  // never trusted on its own.
  async isInvoicePaid(invoiceId: string): Promise<boolean> {
    const token = await getAccessToken();
    const res = await fetch(`${QPAY_BASE_URL}/payment/check`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        object_type: "INVOICE",
        object_id: invoiceId,
        offset: { page_number: 1, page_limit: 100 },
      }),
    });

    if (!res.ok) return false;

    const json = (await res.json()) as { rows?: { payment_status?: string }[] };
    return (json.rows ?? []).some((row) => row.payment_status === "PAID");
  }
}
