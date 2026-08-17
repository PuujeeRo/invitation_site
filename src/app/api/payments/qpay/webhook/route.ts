import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { QPayProvider } from "@/lib/payments/qpay";
import { markPaymentPaid } from "@/lib/payments/mark-paid";

// QPay pings this URL when an invoice is paid. The ping itself isn't
// authenticated, so it's only ever treated as a hint to go re-check the real
// status via QPay's /payment/check endpoint -- never trusted on its own.
export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get("payment_id");
  if (!paymentId) {
    return NextResponse.json({ error: "missing_payment_id" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, provider_ref, status")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment || !payment.provider_ref) {
    return NextResponse.json({ error: "payment_not_found" }, { status: 404 });
  }
  if (payment.status === "paid") {
    return NextResponse.json({ ok: true }); // already processed, idempotent
  }

  const provider = new QPayProvider();
  const paid = await provider.isInvoicePaid(payment.provider_ref).catch(() => false);

  if (!paid) {
    return NextResponse.json({ ok: true, paid: false });
  }

  const result = await markPaymentPaid(paymentId);
  return NextResponse.json({ ok: result.ok, paid: true });
}
