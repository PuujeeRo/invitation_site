import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { StripeProvider, isStripeConfigured } from "@/lib/payments/stripe";
import { markPaymentPaid, markPaymentFailed } from "@/lib/payments/mark-paid";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe webhook endpoint. Point a Stripe webhook at:
//   POST {NEXT_PUBLIC_SITE_URL}/api/payments/stripe/webhook
// subscribed to checkout.session.completed (plus the async/expired events below).
//
// Unlike the QPay callback -- which is unauthenticated and therefore only ever
// treated as a hint to go re-check the real status -- Stripe signs its webhooks,
// so a verified signature is itself proof the payload is genuine.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  // Must be the raw, unparsed body: the signature is computed over the exact
  // bytes Stripe sent, so re-serializing parsed JSON would invalidate it.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = new StripeProvider().constructWebhookEvent(rawBody, signature);
  } catch {
    // Covers a forged/replayed request and a stale timestamp alike. Nothing in
    // the body has been trusted at this point.
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;

      // For delayed payment methods, `completed` fires before money actually
      // arrives; only payment_status === "paid" means settled.
      if (session.payment_status !== "paid") {
        return NextResponse.json({ received: true, paid: false });
      }

      const paymentId = resolvePaymentId(session);
      if (!paymentId) {
        return NextResponse.json({ error: "missing_payment_reference" }, { status: 400 });
      }
      if (!(await belongsToStripeSession(paymentId, session.id))) {
        return NextResponse.json({ error: "payment_session_mismatch" }, { status: 409 });
      }

      const result = await markPaymentPaid(paymentId);
      return NextResponse.json({ received: true, ok: result.ok, paid: true });
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const paymentId = resolvePaymentId(session);
      if (paymentId) await markPaymentFailed(paymentId);
      return NextResponse.json({ received: true, paid: false });
    }

    default:
      // Acknowledge anything else so Stripe stops retrying it.
      return NextResponse.json({ received: true, ignored: event.type });
  }
}

function resolvePaymentId(session: Stripe.Checkout.Session): string | null {
  return session.metadata?.payment_id ?? session.client_reference_id ?? null;
}

// Defence in depth on top of signature verification: confirm this payment row
// really is the Stripe checkout that just completed, so a genuine event for one
// payment can never be applied to a different (or non-Stripe) payment row.
async function belongsToStripeSession(paymentId: string, sessionId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, provider, provider_ref")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment) return false;
  if (payment.provider !== "stripe") return false;
  // provider_ref is written right after the session is created; tolerate the
  // narrow window where it hasn't been persisted yet.
  return payment.provider_ref === null || payment.provider_ref === sessionId;
}
