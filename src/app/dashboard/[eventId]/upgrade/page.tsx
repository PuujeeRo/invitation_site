import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionaries";
import { PAID_PRICE_MNT } from "@/lib/event-types";
import { PageContainer } from "@/components/layout/PageContainer";
import type { EventRow } from "@/lib/supabase/types";
import { startCheckout } from "./actions";

export default async function UpgradePage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { eventId } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle<EventRow>();

  if (!event) notFound();
  if (event.is_paid) redirect(`/dashboard/${eventId}`);

  const locale = await getLocale();
  const t = getDictionary(locale);
  const checkout = startCheckout.bind(null, eventId);

  return (
    <PageContainer maxWidth="sm" className="text-center">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{event.name}</h1>
      <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{PAID_PRICE_MNT}₮</p>

      <ul className="mt-6 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
        <li>✓ {t.upgrade.featureNoWatermark}</li>
        <li>✓ {t.upgrade.featureUnlimitedGuests}</li>
        <li>✓ {t.upgrade.featureCustomDesign}</li>
        <li>✓ {t.upgrade.featureCustomText}</li>
        <li>✓ {t.upgrade.featureMedia}</li>
      </ul>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {t.newEvent.errorGeneric}
        </p>
      )}

      <form action={checkout} className="mt-8">
        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {t.upgrade.payButton.replace("{price}", String(PAID_PRICE_MNT))}
        </button>
      </form>
    </PageContainer>
  );
}
