import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RsvpStatus } from "@/lib/supabase/types";

const VALID_STATUSES: RsvpStatus[] = ["yes", "no", "maybe"];
const GUEST_LIMIT_ERRCODE = "P0001";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("event_id");
  const deviceGuestId = request.nextUrl.searchParams.get("device_guest_id");

  if (!eventId || !deviceGuestId) {
    return NextResponse.json({ error: "Missing event_id or device_guest_id" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rsvps")
    .select("*")
    .eq("event_id", eventId)
    .eq("device_guest_id", deviceGuestId)
    .maybeSingle();

  return NextResponse.json({ rsvp: data ?? null });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const eventId = body?.event_id as string | undefined;
  const deviceGuestId = body?.device_guest_id as string | undefined;
  const status = body?.status as RsvpStatus | undefined;
  const partySize = Number(body?.party_size ?? 1);
  const displayName = typeof body?.display_name === "string" ? body.display_name.trim().slice(0, 80) : null;
  const guestToken = typeof body?.guest_token === "string" ? body.guest_token : null;

  if (!eventId || !deviceGuestId || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!Number.isFinite(partySize) || partySize < 1 || partySize > 50) {
    return NextResponse.json({ error: "invalid_party_size" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, is_paid, expires_at")
    .eq("id", eventId)
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: "event_not_found" }, { status: 404 });
  }
  if (!event.is_paid && new Date(event.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "invitation_expired" }, { status: 410 });
  }

  let namedGuestId: string | null = null;
  if (guestToken) {
    const { data: namedGuest } = await supabase
      .from("named_guests")
      .select("id")
      .eq("event_id", eventId)
      .eq("guest_token", guestToken)
      .maybeSingle();
    namedGuestId = namedGuest?.id ?? null;
  }

  const payload = {
    status,
    party_size: partySize,
    display_name: displayName,
    ...(namedGuestId ? { named_guest_id: namedGuestId } : {}),
  };

  // Update-then-insert instead of a single upsert: an INSERT ... ON CONFLICT DO
  // UPDATE still runs the BEFORE INSERT trigger for the candidate row before
  // Postgres resolves the conflict, which would wrongly re-check the guest limit
  // for a device that's just changing its existing answer. Trying UPDATE first
  // keeps the limit trigger scoped to genuinely new devices only.
  const { data: updated, error: updateError } = await supabase
    .from("rsvps")
    .update(payload)
    .eq("event_id", eventId)
    .eq("device_guest_id", deviceGuestId)
    .select("*")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (updated) {
    return NextResponse.json({ rsvp: updated });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("rsvps")
    .insert({ event_id: eventId, device_guest_id: deviceGuestId, ...payload })
    .select("*")
    .single();

  if (insertError) {
    if ((insertError as { code?: string }).code === GUEST_LIMIT_ERRCODE) {
      return NextResponse.json({ error: "guest_limit_reached" }, { status: 409 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ rsvp: inserted });
}
