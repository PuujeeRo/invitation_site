import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { freeGuestLimitFor } from "@/lib/event-types";
import type { EventRow, NamedGuestRow, RsvpRow } from "@/lib/supabase/types";

const STATUS_LABEL: Record<RsvpRow["status"], string> = {
  yes: "Ирнэ",
  no: "Ирэхгүй",
  maybe: "Магадгүй",
};

export default async function GuestsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle<EventRow>();

  if (!event) notFound();

  const [{ data: namedGuestsData }, { data: rsvpsData }] = await Promise.all([
    supabase.from("named_guests").select("*").eq("event_id", eventId).order("created_at"),
    supabase.from("rsvps").select("*").eq("event_id", eventId).order("updated_at", { ascending: false }),
  ]);

  const namedGuests = (namedGuestsData ?? []) as NamedGuestRow[];
  const rsvps = (rsvpsData ?? []) as RsvpRow[];

  const rsvpByNamedGuestId = new Map(rsvps.filter((r) => r.named_guest_id).map((r) => [r.named_guest_id, r]));
  const anonymousRsvps = rsvps.filter((r) => !r.named_guest_id);

  const going = rsvps.filter((r) => r.status === "yes").length;
  const notGoing = rsvps.filter((r) => r.status === "no").length;
  const maybe = rsvps.filter((r) => r.status === "maybe").length;
  const noAnswer = namedGuests.filter((g) => !rsvpByNamedGuestId.has(g.id)).length;
  const totalPeopleAttending = rsvps
    .filter((r) => r.status === "yes")
    .reduce((sum, r) => sum + r.party_size, 0);

  const limit = event.is_paid ? null : freeGuestLimitFor(event.event_type);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{event.name} — Responses</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Ирнэ" value={going} />
        <StatTile label="Ирэхгүй" value={notGoing} />
        <StatTile label="Магадгүй" value={maybe} />
        <StatTile label="Хариугүй" value={namedGuests.length > 0 ? noAnswer : "—"} />
      </div>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Нийт ирэх хүний тоо: <strong>{totalPeopleAttending}</strong>
        {limit && (
          <>
            {" "}
            · {rsvps.length}/{limit} guest slots used (free plan)
          </>
        )}
      </p>

      {namedGuests.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Named guests</h2>
          <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
            {namedGuests.map((guest) => {
              const rsvp = rsvpByNamedGuestId.get(guest.id);
              return (
                <li key={guest.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {guest.first_name} {guest.last_name}
                  </span>
                  <span className="text-zinc-500">
                    {rsvp ? `${STATUS_LABEL[rsvp.status]}${rsvp.status === "yes" ? ` · ${rsvp.party_size}` : ""}` : "Хариугүй"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {namedGuests.length > 0 ? "Other responses" : "Responses"}
        </h2>
        {anonymousRsvps.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No responses yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
            {anonymousRsvps.map((rsvp) => (
              <li key={rsvp.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-zinc-800 dark:text-zinc-200">{rsvp.display_name || "Guest"}</span>
                <span className="text-zinc-500">
                  {STATUS_LABEL[rsvp.status]}
                  {rsvp.status === "yes" ? ` · ${rsvp.party_size}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
