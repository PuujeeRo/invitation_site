import { createAdminClient } from "@/lib/supabase/admin";

export async function markPaymentPaid(paymentId: string): Promise<{ ok: boolean; eventId?: string }> {
  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, event_id, status")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment) return { ok: false };
  if (payment.status === "paid") return { ok: true, eventId: payment.event_id }; // idempotent

  const now = new Date().toISOString();
  await supabase.from("payments").update({ status: "paid", paid_at: now }).eq("id", paymentId);
  await supabase.from("events").update({ is_paid: true, paid_at: now }).eq("id", payment.event_id);

  return { ok: true, eventId: payment.event_id };
}

// Used when a gateway tells us a checkout expired or the payment failed. Never
// downgrades an already-paid row: a late "expired" webhook must not revoke an
// upgrade the organizer has already paid for.
export async function markPaymentFailed(paymentId: string): Promise<{ ok: boolean }> {
  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment) return { ok: false };
  if (payment.status === "paid") return { ok: true };

  await supabase.from("payments").update({ status: "failed" }).eq("id", paymentId);
  return { ok: true };
}
