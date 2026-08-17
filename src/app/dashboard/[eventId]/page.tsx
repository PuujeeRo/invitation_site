import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { invitationUrl } from "@/lib/site-url";
import { daysRemaining } from "@/lib/time";
import { CopyLinkButton } from "@/components/share/CopyLinkButton";
import { MessengerShareButton } from "@/components/share/MessengerShareButton";
import { AddGuestForm } from "./AddGuestForm";
import type { EventRow, NamedGuestRow } from "@/lib/supabase/types";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle<EventRow>();

  if (!event) notFound();

  const { data: guests } = await supabase
    .from("named_guests")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  const namedGuests = (guests ?? []) as NamedGuestRow[];
  const link = invitationUrl(event.slug);
  const daysLeft = daysRemaining(event.expires_at);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{event.name}</h1>
        <Link
          href={`/dashboard/${event.id}/guests`}
          className="text-sm font-medium underline underline-offset-4"
        >
          View responses
        </Link>
      </div>

      {!event.is_paid && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <span>
            {daysLeft > 0 ? `Free plan · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : "Free plan expired"}
          </span>
          <Link
            href={`/dashboard/${event.id}/upgrade`}
            className="font-medium underline underline-offset-4"
          >
            Upgrade for 999₮
          </Link>
        </div>
      )}

      <section className="mt-8 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Invitation link</p>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-zinc-100 px-3 py-2 text-xs dark:bg-zinc-800">
            {link}
          </code>
          <CopyLinkButton url={link} />
        </div>
        <div className="mt-3">
          <MessengerShareButton url={link} title={event.name} />
        </div>
      </section>

      <section className="mt-8">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Personalize for a guest (optional)
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Add a guest to get their own link with a personal greeting.
        </p>
        <div className="mt-3">
          <AddGuestForm eventId={event.id} />
        </div>

        {namedGuests.length > 0 && (
          <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {namedGuests.map((guest) => {
              const guestLink = invitationUrl(event.slug, guest.guest_token);
              return (
                <li key={guest.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm text-zinc-800 dark:text-zinc-200">
                    {guest.first_name} {guest.last_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <CopyLinkButton url={guestLink} label="Link хуулах" />
                    <MessengerShareButton url={guestLink} title={event.name} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
