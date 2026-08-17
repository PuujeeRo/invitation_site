"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AddGuestState {
  error?: string;
}

export async function addNamedGuest(
  _prevState: AddGuestState,
  formData: FormData
): Promise<AddGuestState> {
  const eventId = String(formData.get("event_id") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!eventId) {
    return { error: "Missing event." };
  }
  if (!firstName) {
    return { error: "Please enter the guest's first name." };
  }

  const supabase = await createClient();
  // RLS (named_guests_owner_all) rejects this insert unless the caller's session
  // owns the parent event, so there's no separate ownership check needed here.
  const { error } = await supabase.from("named_guests").insert({
    event_id: eventId,
    first_name: firstName,
    last_name: lastName || null,
    email: email || null,
  });

  if (error) {
    return { error: "Could not add guest. Please try again." };
  }

  revalidatePath(`/dashboard/${eventId}`);
  return {};
}
