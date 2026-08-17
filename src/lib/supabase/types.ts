// Hand-written types for the MVP schema (supabase/migrations/0001_init.sql).
// Swap for generated types later via `supabase gen types typescript`.
//
// These are declared with `type` rather than `interface` on purpose: Supabase's
// generic client constraints check `Row extends Record<string, unknown>`, and
// plain `interface`s (unlike object-literal `type` aliases) don't structurally
// satisfy an index-signature constraint in TS, which silently collapses every
// `.from(...)` call's inferred type to `never`.

export type EventType = "birthday" | "wedding" | "kids_first_birthday" | "graduation" | "other";
export type RsvpStatus = "yes" | "no" | "maybe";
export type PaymentProvider = "qpay" | "socialpay" | "stripe" | "mock";
export type PaymentStatus = "pending" | "paid" | "failed";

export type Profile = {
  id: string;
  email: string | null;
  created_at: string;
};

export type EventRow = {
  id: string;
  organizer_id: string;
  event_type: EventType;
  name: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  photo_url: string | null;
  description: string | null;
  template_id: string;
  theme: Record<string, unknown>;
  custom_text: Record<string, unknown>;
  video_url: string | null;
  map_link: string | null;
  countdown_enabled: boolean;
  slug: string;
  is_paid: boolean;
  paid_at: string | null;
  created_at: string;
  expires_at: string;
};

export type NamedGuestRow = {
  id: string;
  event_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  guest_token: string;
  email_sent_at: string | null;
  created_at: string;
};

export type RsvpRow = {
  id: string;
  event_id: string;
  device_guest_id: string;
  named_guest_id: string | null;
  display_name: string | null;
  status: RsvpStatus;
  party_size: number;
  created_at: string;
  updated_at: string;
};

export type PaymentRow = {
  id: string;
  event_id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  provider_ref: string | null;
  created_at: string;
  paid_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      events: {
        Row: EventRow;
        Insert: Partial<EventRow> & Pick<EventRow, "organizer_id" | "event_type" | "name" | "event_date" | "slug">;
        Update: Partial<EventRow>;
        Relationships: [];
      };
      named_guests: {
        Row: NamedGuestRow;
        Insert: Partial<NamedGuestRow> & Pick<NamedGuestRow, "event_id">;
        Update: Partial<NamedGuestRow>;
        Relationships: [];
      };
      rsvps: {
        Row: RsvpRow;
        Insert: Partial<RsvpRow> & Pick<RsvpRow, "event_id" | "device_guest_id" | "status">;
        Update: Partial<RsvpRow>;
        Relationships: [];
      };
      payments: {
        Row: PaymentRow;
        Insert: Partial<PaymentRow> & Pick<PaymentRow, "event_id">;
        Update: Partial<PaymentRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
