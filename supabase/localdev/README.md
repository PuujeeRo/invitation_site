# Local dev without a hosted Supabase project

Runs the real app against your own local PostgreSQL, using a natively-run
PostgREST instead of a real Supabase project. No Docker.

**Why PostgREST but not GoTrue (Supabase Auth):** Supabase's Auth service has
no Windows binary in its releases (Linux/macOS only), and there's no Go
compiler on this machine to build one. PostgREST *does* ship a native Windows
binary, so that half is real. The Auth gap is filled by a dev-only sign-in
shortcut (`/dev-login`) instead of magic-link email — see
`src/lib/supabase/local-dev.ts` for exactly what it does and does not
replicate. Storage (photo upload) is filled by writing to `public/uploads/`
directly rather than standing up `storage-api` and its own bucket-backend
config.

**What's real, not simulated:** RLS. PostgREST verifies an actual signed JWT
per request and does a real Postgres `SET ROLE` based on its claims, so every
policy in `supabase/migrations/*.sql` is genuinely enforced — an organizer
spoofing another organizer's `organizer_id` gets a real `403`, not a shortcut
that happens to look right. Verified directly against a running PostgREST
instance while building this (create as A, read as A/B/service_role, attempt
a spoofed insert as B) before ever touching the Next.js app.

## One-time setup

1. **A dedicated Postgres role**, with the exact privileges PostgREST's
   role-switching needs (not just `LOGIN`):
   ```sql
   CREATE ROLE naashir_local WITH LOGIN PASSWORD '...' CREATEDB CREATEROLE;
   ALTER ROLE naashir_local BYPASSRLS; -- as postgres; only a role that already
                                        -- has BYPASSRLS can grant it onward
   ```
2. **A persistent database** (kept a separate `naashir_dev`, not `postgres`
   itself, and never the throwaway `naashir_test` database
   `scripts/verify-db.ts` creates and drops on every run):
   ```sql
   CREATE DATABASE naashir_dev;
   ```
3. **Apply the shim, then the real migrations, in order, against `naashir_dev`**
   (the migrations are applied completely unmodified -- this shim is what
   makes that possible, same principle as `supabase/testing/shim.sql`):
   ```bash
   psql -U naashir_local -d naashir_dev -f supabase/localdev/shim.sql
   psql -U naashir_local -d naashir_dev -f supabase/migrations/0001_init.sql
   psql -U naashir_local -d naashir_dev -f supabase/migrations/0002_storage.sql
   psql -U naashir_local -d naashir_dev -f supabase/migrations/0003_payment_providers.sql
   ```
   If the role name in step 1 isn't `test_local_invite`, edit the `grant ...
   to test_local_invite` line in `shim.sql` first.
4. **Generate a JWT secret and PostgREST config** (`.localdev/` is
   git-ignored -- this holds a real secret and a DB password, never commit
   it):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   ```ini
   # .localdev/postgrest.conf
   db-uri = "postgresql://naashir_local:PASSWORD@127.0.0.1:5432/naashir_dev"
   db-schemas = "public"
   db-anon-role = "anon"
   jwt-secret = "PASTE_THE_GENERATED_SECRET"
   jwt-secret-is-base64 = true
   server-port = 3211
   ```
5. **Download PostgREST** (Windows binary, no install needed) into
   `.localdev/postgrest.exe`:
   <https://github.com/PostgREST/postgrest/releases> → the
   `postgrest-vX.Y.Z-windows-x86-64.zip` asset.
6. **Write `.env.local`** at the project root (see `.env.example` for every
   other var the app reads; these are the local-dev-specific ones):
   ```ini
   LOCAL_DEV_MODE=true
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_ANON_KEY=local-dev-anon-key
   SUPABASE_JWT_SECRET=<same secret as postgrest.conf>
   SUPABASE_SERVICE_ROLE_KEY=<a JWT signed with that secret, claims {"role":"service_role"}>
   LOCAL_DEV_POSTGREST_URL=http://127.0.0.1:3211
   LOCAL_DEV_PG_URL=postgresql://naashir_local:PASSWORD@127.0.0.1:5432/naashir_dev
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   `SUPABASE_SERVICE_ROLE_KEY` needs to be minted by hand once (no UI for
   this) -- any HS256 JWT library works, signed with `SUPABASE_JWT_SECRET`,
   claims `{"role": "service_role"}`, a far-future `exp`.

## Running it

Two processes, both from the project root:

```bash
npm run dev:postgrest   # terminal 1 -- native PostgREST, port 3211
npm run dev             # terminal 2 -- Next.js as normal
```

Go to `/login` -- it redirects straight to `/dev-login` when
`LOCAL_DEV_MODE=true`. Pick an existing test organizer or create one by
email; no email is actually sent.

## How it fits together

- `next.config.ts` rewrites `/rest/v1/*` → PostgREST's own root. This exists
  because PostgREST has no built-in path-prefix option, but `supabase-js`
  always calls `{SUPABASE_URL}/rest/v1/...` -- real Supabase's Kong gateway is
  what adds that prefix in front of PostgREST; there's no Kong here, so the
  Next.js server does that one job instead. Zero extra processes.
- `src/lib/supabase/local-dev.ts` mints/verifies the JWTs `/dev-login` issues
  and stands in for the two `.auth.*` methods this app actually calls on a
  server client (`getUser`, `signOut` -- confirmed by grepping the whole app
  for every `.auth.` call site before writing this, not assumed).
- `src/lib/supabase/admin.ts` (the real service-role client) is **unchanged**
  -- a minted `service_role` JWT works with it exactly like a real one would,
  since PostgREST's role-switching doesn't care whether GoTrue or this shim
  issued the token, only that the signature is valid.
- `src/lib/storage.ts` branches to `public/uploads/` for photos when
  `LOCAL_DEV_MODE=true`; the real Supabase Storage path is untouched.

## What this does *not* prove

- Anything GoTrue actually does at runtime: email delivery, magic-link
  expiry, refresh-token rotation, OAuth providers. `/dev-login` is a
  shortcut, not a GoTrue reimplementation.
- Supabase Storage specifically (bucket policies, signed URLs, transforms) --
  photo upload is proven end-to-end, but against local disk, not
  `storage-api`.
- Anything about your real hosted Supabase project's own configuration
  (connection pooling, extensions enabled, Postgres version) -- this is
  PostgreSQL 16 locally; check what your Supabase project actually runs
  before assuming version parity matters for something you're testing.

RLS and the core data flow (builder → RSVP → guest dashboard → guest-limit
trigger) *are* proven end-to-end against this setup, including through a real
unauthenticated guest session — see the project's commit history for the
verification this setup was built and checked against.
