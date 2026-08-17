# Naashir

Create an animated event invitation in a few clicks, share the link on Messenger, and watch guest RSVPs come in on a live dashboard. See [docs/Naashir_Product_Plan_v1.md](docs/Naashir_Product_Plan_v1.md) for the full product plan (pricing, guest-limit rules, build order).

## Stack

- **Next.js** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Postgres, Auth (magic link), Storage
- **QPay/SocialPay** and **Resend** — pluggable, behind provider interfaces (mocked/log-only until real credentials are set)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase project keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

Schema lives in `supabase/migrations/`. Apply it against your Supabase project (via the SQL editor, or `supabase db push` with the Supabase CLI once linked).

- `0001_init.sql` — enums, `profiles`/`events`/`named_guests`/`rsvps`/`payments` tables, RLS policies, and the guest-limit trigger.
- `0002_storage.sql` — the `event-media` storage bucket + upload policies.

### Access model

- The **browser/anon** Supabase client is only used for organizer auth and the dashboard (RLS-scoped to `organizer_id = auth.uid()`).
- Everything guest-facing (public invite page, RSVP submit, named-guest link lookup, payment webhook, email send) goes through **server route handlers using the service-role key**, which bypasses RLS and enforces its own checks.
- The free-plan guest limit (10 or 100 depending on event type) is enforced by a **database trigger** on `rsvps`, not just app logic, so it can't be bypassed regardless of which key performs the insert.

## Project structure

```
src/
  app/            routes (App Router)
  components/     templates, RSVP widget, share buttons
  lib/            supabase clients, slug/greeting/template logic, plan limits
supabase/
  migrations/     SQL schema + RLS + storage policies
docs/
  Naashir_Product_Plan_v1.md   product plan this app implements
```

## Scripts

```bash
npm run dev     # start dev server
npm run build   # production build (also type-checks)
npm run lint    # eslint
```

## Brand assets

| Asset | Use |
|---|---|
| [`src/components/brand/Logo.tsx`](src/components/brand/Logo.tsx) | In-app logo. `LogoMark` (icon only) and `Logo` (icon + wordmark). Uses `currentColor`, so it adapts to light/dark automatically — prefer this inside the app. |
| [`src/app/icon.svg`](src/app/icon.svg) | Favicon / app icon. Picked up automatically by the Next.js `app/icon.svg` convention. |
| [`public/logo-mark.svg`](public/logo-mark.svg) | Standalone monoline mark for use outside the app (README, docs). Fixed colors. |
| [`public/logo-tile.svg`](public/logo-tile.svg) | Solid gradient tile version, for where the logo needs its own background (social avatar, app icon). |

The mark echoes the invitation card's own visual language (the flap fold and the
four-point ornament), so brand and product read as one design. Rendered at
16–64px in [docs/screenshots/logo-sizes.png](docs/screenshots/logo-sizes.png).

> When editing an `.svg` by hand, never use a double hyphen as a dash inside an
> XML comment — it is illegal in XML and silently breaks the entire file with a
> parse error rather than just ignoring the comment.

## Design constraints

Guests almost always open invitations on a phone, from a Messenger link — the
public invitation page is mobile-first, and **280px (the Galaxy Fold's outer
screen) is the narrowest supported width**. Layout changes should be checked
there, not just at a comfortable phone size:

```bash
npm run dev -- -p 3002
npm install --no-save playwright && npx playwright install chromium  # first run only
node scripts/screenshots.js
```

That writes `docs/screenshots/` and **exits non-zero on any horizontal page
overflow** or console error, at 280px / 390px / desktop. Current reference
screenshots live in [docs/screenshots/](docs/screenshots/). `playwright` is
deliberately not a project dependency — it would add a large browser download
to every install for a tool only needed when checking layout.
