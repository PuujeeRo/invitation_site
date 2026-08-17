"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import { markPaymentPaid } from "@/lib/payments/mark-paid";

export async function confirmMockPayment(paymentId: string) {
  // Guard so this page can never fake a real payment: it only works while the
  // mock provider is actually active (no QPAY_* env vars configured) AND the
  // payment record itself was created by the mock provider.
  if (getPaymentProvider().name !== "mock") {
    redirect("/dashboard");
  }

  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, event_id, provider_ref")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment || !payment.provider_ref?.startsWith("mock_")) {
    redirect("/dashboard");
  }

  const result = await markPaymentPaid(paymentId);
  if (!result.ok || !result.eventId) {
    redirect("/dashboard");
  }

  redirect(`/dashboard/${result.eventId}?paid=1`);
}
