import { EVENT_TYPES } from "@/lib/event-types";
import type { EventType } from "@/lib/supabase/types";

// "Хүндэт Б. Пүрэвсүрэн, таныг [event_name] [event_type]-д урьж байна."
// Falls back to a generic greeting when no guest name was provided.
export function buildGreeting(params: {
  eventName: string;
  eventType: EventType;
  guestFirstName?: string | null;
  guestLastName?: string | null;
}): string {
  const { eventName, eventType, guestFirstName, guestLastName } = params;
  const typeLabel = EVENT_TYPES.find((t) => t.id === eventType)?.labelMn ?? "арга хэмжээ";

  if (guestFirstName) {
    const initial = guestLastName ? `${guestLastName.charAt(0).toUpperCase()}. ` : "";
    return `Хүндэт ${initial}${guestFirstName}, таныг ${eventName} ${typeLabel}-д урьж байна.`;
  }

  return `Таныг ${eventName} ${typeLabel}-д урьж байна.`;
}
