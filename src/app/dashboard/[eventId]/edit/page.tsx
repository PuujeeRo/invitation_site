import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionaries";
import { readTheme, readCustomText } from "@/lib/theme";
import type { EventRow } from "@/lib/supabase/types";
import { EditEventForm } from "./EditEventForm";

export default async function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle<EventRow>();

  if (!event) notFound();

  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{t.edit.title}</h1>
      <div className="mt-8">
        <EditEventForm event={event} theme={readTheme(event.theme)} customText={readCustomText(event.custom_text)} />
      </div>
    </div>
  );
}
