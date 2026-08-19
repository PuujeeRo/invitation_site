-- TEST-ONLY Supabase shim. NOT part of the production schema.
--
-- The real migrations reference objects that Supabase provides but a plain
-- PostgreSQL install does not: auth.users, auth.uid(), and the storage schema.
-- This creates just enough of them that supabase/migrations/*.sql can be applied
-- UNMODIFIED against local Postgres -- which is the point: the migrations get
-- validated exactly as they will run in production, rather than a doctored copy.
--
-- Never apply this to a real Supabase project; Supabase already owns these.

create extension if not exists pgcrypto;

create schema if not exists auth;
create schema if not exists storage;

-- Minimal stand-in for Supabase's auth.users (only the columns we depend on).
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

-- Supabase derives auth.uid() from the request JWT. Tests impersonate a user
-- with:  set local request.jwt.claim.sub = '<uuid>';
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text
);

alter table storage.objects enable row level security;

-- Mirrors Supabase's helper: the folder segments of an object path, i.e. every
-- segment except the filename. 'uid/event/file.png' -> {uid, event}.
create or replace function storage.foldername(name text) returns text[]
language sql immutable
as $$
  select (string_to_array(name, '/'))[
    1 : greatest(array_length(string_to_array(name, '/'), 1) - 1, 0)
  ];
$$;
