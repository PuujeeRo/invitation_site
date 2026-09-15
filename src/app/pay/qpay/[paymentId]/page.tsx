import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionaries";
import { PageContainer } from "@/components/layout/PageContainer";
import type { CheckoutPayload } from "@/lib/payments/types";
import type { PaymentRow } from "@/lib/supabase/types";
import { QPayCheckout } from "./QPayCheckout";

// QPay hands back a QR payload and a list of bank deeplinks rather than a
// hosted checkout page, so this is that page. Read through the RLS-scoped
// client on purpose: only the organizer who created the payment can open it,
// even though the payment id itself is an unguessable uuid.
export default async function QPayCheckoutPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, event_id, amount, currency, status, provider, checkout")
    .eq("id", paymentId)
    .maybeSingle<Pick<PaymentRow, "id" | "event_id" | "amount" | "currency" | "status" | "provider" | "checkout">>();

  if (!payment || payment.provider !== "qpay") notFound();
  if (payment.status === "paid") redirect(`/dashboard/${payment.event_id}`);

  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("id", payment.event_id)
    .maybeSingle();

  const locale = await getLocale();
  const t = getDictionary(locale);
  const checkout = (payment.checkout ?? {}) as CheckoutPayload;

  // A pending QPay payment with no stored checkout material means the invoice
  // call succeeded but the follow-up write did not. Nothing is payable from
  // here, so send the organizer back to start a fresh invoice rather than
  // showing an empty page.
  const hasCheckout =
    Boolean(checkout.qrImage) || Boolean(checkout.shortUrl) || (checkout.deeplinks?.length ?? 0) > 0;
  if (!hasCheckout) {
    redirect(`/dashboard/${payment.event_id}/upgrade?error=1`);
  }

  return (
    <PageContainer maxWidth="md">
      <header className="text-center">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {event?.name ?? t.qpay.title}
        </h1>
        <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          {payment.amount.toLocaleString("en-US")}₮
        </p>
      </header>

      <div className="mt-8">
        <QPayCheckout
          paymentId={payment.id}
          eventId={payment.event_id}
          qrImage={checkout.qrImage ?? null}
          shortUrl={checkout.shortUrl ?? null}
          deeplinks={checkout.deeplinks ?? []}
          labels={t.qpay}
        />
      </div>
    </PageContainer>
  );
}

// The checkout surface is per-payment and changes the moment QPay confirms, so
// it must never be served from a static render.
export const dynamic = "force-dynamic";
