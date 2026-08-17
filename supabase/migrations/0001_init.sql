-- Naashir MVP schema
-- Design note on access model:
--   * The browser/anon Supabase client is only ever used for organizer auth + the
--     organizer dashboard (authenticated role, RLS-scoped to organizer_id = auth.uid()).
--   * All guest-facing reads/writes (public invite page, RSVP submit, named-guest
--     lookup by token, email send, payment webhook) go through Next.js server route
--     handlers using the SERVICE ROLE key, which bypasses RLS by design. Those routes
--     enforce their own checks (slug match, expiry, etc).
--   * The one rule that must hold no matter which key is used to insert is the guest
--     limit, so it is enforced with a BEFORE INSERT trigger on rsvps (triggers fire for
--     every role, service_role included) rather than relying on RLS alone.

create extension if not exists pgcrypto;

-- ---------- enums ----------
create type event_type as enum ('birthday', 'wedding', 'kids_first_birthday', 'graduation', 'other');
create type rsvp_status as enum ('yes', 'no', 'maybe');
create type payment_provider as enum ('qpay', 'socialpay');
create type payment_status as enum ('pending', 'paid', 'failed');

-- ---------- profiles (mirrors auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- events ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles (id) on delete cascade,
  event_type event_type not null,
  name text not null,
  event_date date not null,
  event_time time,
  location text,
  photo_url text,
  description text,
  template_id text not null default 'classic',
  theme jsonb not null default '{}'::jsonb,
  custom_text jsonb not null default '{}'::jsonb,
  video_url text,
  map_link text,
  countdown_enabled boolean not null default false,
  slug text not null unique,
  is_paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index events_organizer_id_idx on public.events (organizer_id);
create index events_slug_idx on public.events (slug);

-- ---------- named_guests (personalization + optional email invites) ----------
create table public.named_guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  guest_token text not null unique default encode(gen_random_bytes(9), 'hex'),
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index named_guests_event_id_idx on public.named_guests (event_id);

-- ---------- rsvps (anonymous, device-tracked) ----------
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  device_guest_id text not null,
  display_name text,
  status rsvp_status not null,
  party_size int not null default 1 check (party_size >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, device_guest_id)
);

create index rsvps_event_id_idx on public.rsvps (event_id);

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rsvps_touch_updated_at
  before update on public.rsvps
  for each row execute procedure public.touch_updated_at();

-- Enforce the free-plan guest limit at insert time (10 for small events, 100 for
-- big events; unlimited once the event is paid). Only blocks a *new* device_guest_id
-- row -- existing devices updating their own answer go through UPDATE, not INSERT,
-- so they are never blocked by this trigger. Fires for every role (RLS-independent).
create function public.enforce_rsvp_limit()
returns trigger
language plpgsql
as $$
declare
  v_event public.events%rowtype;
  v_limit int;
  v_count int;
begin
  select * into v_event from public.events where id = new.event_id;

  if v_event.is_paid then
    return new;
  end if;

  if v_event.event_type in ('wedding', 'graduation') then
    v_limit := 100;
  else
    v_limit := 10;
  end if;

  select count(*) into v_count from public.rsvps where event_id = new.event_id;

  if v_count >= v_limit then
    raise exception 'guest_limit_reached' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger rsvps_enforce_limit
  before insert on public.rsvps
  for each row execute procedure public.enforce_rsvp_limit();

-- ---------- payments ----------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  amount integer not null default 999,
  provider payment_provider not null default 'qpay',
  status payment_status not null default 'pending',
  provider_ref text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index payments_event_id_idx on public.payments (event_id);

-- ---------- row level security ----------
-- Everything defaults to owner-only for the authenticated (dashboard) role.
-- No anon policies are defined: guest-facing access goes through server routes
-- using the service role key, which bypasses RLS entirely.
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.named_guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.payments enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "events_owner_all" on public.events
  for all using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);

create policy "named_guests_owner_all" on public.named_guests
  for all using (
    exists (select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid())
  )
  with check (
    exists (select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid())
  );

create policy "rsvps_owner_select" on public.rsvps
  for select using (
    exists (select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid())
  );

create policy "payments_owner_select" on public.payments
  for select using (
    exists (select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid())
  );
