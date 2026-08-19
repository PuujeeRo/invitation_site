import { createAdminClient } from "@/lib/supabase/admin";
import { InvitationCard } from "@/components/templates/InvitationCard";
import { RsvpWidget } from "@/components/rsvp/RsvpWidget";
import { isPastIso } from "@/lib/time";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionaries";
import { TopControls } from "@/components/theme/TopControls";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { readTheme, readCustomText } from "@/lib/theme";
import { FreeInviteAdSlot } from "@/components/ads/FreeInviteAdSlot";
import { countdownLabelsFrom } from "@/lib/countdown-labels";
import type { EventRow, NamedGuestRow } from "@/lib/supabase/types";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<EventRow>();

  if (!event) {
    return <CenteredMessage>{t.invite.notFound}</CenteredMessage>;
  }

  const isExpired = !event.is_paid && isPastIso(event.expires_at);
  if (isExpired) {
    return <CenteredMessage>{t.invite.expired}</CenteredMessage>;
  }

  let guest: NamedGuestRow | null = null;
  if (to) {
    const { data } = await supabase
      .from("named_guests")
      .select("*")
      .eq("event_id", event.id)
      .eq("guest_token", to)
      .maybeSingle<NamedGuestRow>();
    guest = data ?? null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 py-3">
        <HeaderRow maxWidth="md" justify="end">
          <TopControls />
        </HeaderRow>
      </header>
      <div className="flex flex-1 flex-col items-center gap-4 px-3 pb-10 sm:gap-6 sm:px-4">
        <InvitationCard
          eventName={event.name}
          eventType={event.event_type}
          eventDate={event.event_date}
          eventTime={event.event_time}
          location={event.location}
          description={event.description}
          photoUrl={event.photo_url}
          templateId={event.template_id}
          isPaid={event.is_paid}
          guestFirstName={guest?.first_name}
          guestLastName={guest?.last_name}
          countdownEnabled={event.countdown_enabled}
          mapLink={event.map_link}
          mapLinkLabel={t.invite.viewMap}
          watermarkText={t.invite.watermark}
          videoUrl={event.video_url}
          theme={readTheme(event.theme)}
          customText={readCustomText(event.custom_text)}
          countdownLabels={countdownLabelsFrom(t)}
        />
        <RsvpWidget
          eventId={event.id}
          guestFirstName={guest?.first_name}
          guestLastName={guest?.last_name}
          guestToken={guest?.guest_token}
        />
        {!event.is_paid && <FreeInviteAdSlot />}
      </div>
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24 text-center">
      <p className="max-w-sm text-zinc-600 dark:text-zinc-400">{children}</p>
    </div>
  );
}
