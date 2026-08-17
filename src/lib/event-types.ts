import type { EventType } from "@/lib/supabase/types";

// Keep this in sync with the `event_type` enum and the enforce_rsvp_limit()
// trigger in supabase/migrations/0001_init.sql.
export const EVENT_TYPES: {
  id: EventType;
  label: string;
  labelMn: string;
  freeGuestLimit: 10 | 100;
}[] = [
  { id: "birthday", label: "Birthday", labelMn: "Төрсөн өдөр", freeGuestLimit: 10 },
  { id: "wedding", label: "Wedding", labelMn: "Хурим", freeGuestLimit: 100 },
  { id: "kids_first_birthday", label: "Kid's 1st Birthday", labelMn: "Хүүхдийн 1 нас", freeGuestLimit: 100 },
  { id: "graduation", label: "Graduation", labelMn: "Төгсөлт", freeGuestLimit: 100 },
  { id: "other", label: "Other", labelMn: "Бусад", freeGuestLimit: 10 },
];

export function freeGuestLimitFor(eventType: EventType): 10 | 100 {
  return EVENT_TYPES.find((t) => t.id === eventType)?.freeGuestLimit ?? 10;
}

export const FREE_PLAN_ACTIVE_DAYS = 7;
export const PAID_PRICE_MNT = 999;
export const FREE_EMAIL_SEND_LIMIT = 10;
