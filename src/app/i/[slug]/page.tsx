import { createAdminClient } from "@/lib/supabase/admin";
import { InvitationCard } from "@/components/templates/InvitationCard";
import { RsvpWidget } from "@/components/rsvp/RsvpWidget";
import { isPastIso } from "@/lib/time";
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

  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<EventRow>();

  if (!event) {
    return <CenteredMessage>This invitation link doesn&apos;t exist.</CenteredMessage>;
  }

  const isExpired = !event.is_paid && isPastIso(event.expires_at);
  if (isExpired) {
    return (
      <CenteredMessage>
        This invitation reached its 7-day free period and is no longer active. Ask the organizer to
        upgrade for unlimited access.
      </CenteredMessage>
    );
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
    <div className="flex flex-1 flex-col items-center gap-6 px-4 py-10">
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
      />
      <RsvpWidget
        eventId={event.id}
        guestFirstName={guest?.first_name}
        guestLastName={guest?.last_name}
        guestToken={guest?.guest_token}
      />
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
