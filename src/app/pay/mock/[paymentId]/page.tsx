import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import { PageContainer } from "@/components/layout/PageContainer";
import { confirmMockPayment } from "./actions";

// Stand-in checkout page used only when the mock payment provider is active
// (no QPAY_* env vars set). Lets the real invoice -> pay -> confirm code path
// be exercised end-to-end in dev without a live QPay merchant account.
export default async function MockCheckoutPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  if (getPaymentProvider().name !== "mock") {
    notFound();
  }

  const { paymentId } = await params;
  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, event_id, amount, status")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment) notFound();

  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("id", payment.event_id)
    .maybeSingle();

  const confirm = confirmMockPayment.bind(null, paymentId);
  const eventName = event?.name ?? "";

  return (
    <PageContainer maxWidth="sm" className="flex flex-col items-center justify-center text-center">
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Mock checkout (dev only)</p>
      <h1 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{eventName}</h1>
      <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{payment.amount}₮</p>

      {payment.status === "paid" ? (
        <p className="mt-6 text-sm text-emerald-600 dark:text-emerald-400">Already paid ✅</p>
      ) : (
        <form action={confirm} className="mt-6 w-full">
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
          >
            Pay now (simulate)
          </button>
        </form>
      )}
    </PageContainer>
  );
}
