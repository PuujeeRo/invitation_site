/**
 * Applies the real migrations to a throwaway local Postgres database and asserts
 * the database actually behaves the way the app assumes.
 *
 *   npx tsx scripts/verify-db.ts
 *
 * Needs a local PostgreSQL and these env vars (see .env.test.local.example):
 *   PGHOST PGPORT PGUSER PGPASSWORD
 *
 * This validates the SCHEMA, not the app: supabase-js talks to Supabase's REST
 * API rather than raw Postgres, so running the Next.js app still needs a real
 * Supabase project. What this does cover is the part that is pure database and
 * was previously never executed at all -- the migrations themselves, the
 * guest-limit trigger, the RSVP uniqueness rule, and the RLS policies.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import { EVENT_TYPES, freeGuestLimitFor } from "@/lib/event-types";

const TEST_DB = "naashir_test";
const ROOT = process.cwd();

// Load .env.test.local (git-ignored) so the script runs with no shell setup.
// Deliberately tiny and dependency-free: plain KEY=value, and a value already
// present in the real environment always wins.
function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] === undefined) {
      process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  }
}
loadEnvFile(join(ROOT, ".env.test.local"));

let failures = 0;
function assert(label: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  ${detail}` : ""}`);
}
function section(name: string) {
  console.log(`\n--- ${name} ---`);
}

function connCfg(database: string) {
  return {
    host: process.env.PGHOST || "127.0.0.1",
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD,
    database,
  };
}

async function main() {
  // ---- create a clean test database --------------------------------------
  const admin = new Client(connCfg("postgres"));
  await admin.connect();
  await admin.query(`drop database if exists ${TEST_DB} with (force)`);
  await admin.query(`create database ${TEST_DB}`);
  await admin.end();

  const db = new Client(connCfg(TEST_DB));
  await db.connect();

  // ---- apply shim + every migration, unmodified ---------------------------
  section("migrations apply");
  const files = [
    join(ROOT, "supabase/testing/shim.sql"),
    ...readdirSync(join(ROOT, "supabase/migrations"))
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .map((f) => join(ROOT, "supabase/migrations", f)),
  ];
  for (const file of files) {
    const name = file.split(/[\\/]/).pop() as string;
    try {
      await db.query(readFileSync(file, "utf8"));
      assert(`applies ${name}`, true);
    } catch (err) {
      assert(`applies ${name}`, false, String((err as Error).message).split("\n")[0]);
      throw err; // nothing downstream is meaningful if the schema is broken
    }
  }

  // ---- helpers ------------------------------------------------------------
  async function newOrganizer(): Promise<string> {
    const { rows } = await db.query<{ id: string }>(
      `insert into auth.users (email)
       values ('org+' || gen_random_uuid() || '@test.local') returning id`
    );
    return rows[0].id;
  }
  async function newEvent(organizerId: string, eventType: string, isPaid = false): Promise<string> {
    const { rows } = await db.query<{ id: string }>(
      `insert into public.events (organizer_id, event_type, name, event_date, slug, is_paid)
       values ($1, $2::event_type, 'Test', current_date + 30, 'slug-' || gen_random_uuid(), $3)
       returning id`,
      [organizerId, eventType, isPaid]
    );
    return rows[0].id;
  }
  async function rsvp(eventId: string, device: string, status = "yes") {
    return db.query(
      `insert into public.rsvps (event_id, device_guest_id, status)
       values ($1, $2, $3::rsvp_status)`,
      [eventId, device, status]
    );
  }
  const isLimitError = (e: unknown) => String((e as Error).message).includes("guest_limit_reached");

  // ---- auth.users -> profiles trigger -------------------------------------
  section("profiles trigger");
  const orgId = await newOrganizer();
  const prof = await db.query(`select id from public.profiles where id = $1`, [orgId]);
  assert("new auth user gets a profile row", prof.rowCount === 1);

  // ---- guest limit: app constants vs DB trigger ---------------------------
  // The real point of this block: the limit the organizer is SHOWN (from
  // lib/event-types.ts) must equal the limit the database actually ENFORCES.
  // Those drifting apart is invisible until a guest is wrongly turned away.
  section("free-plan guest limit (app constant vs DB trigger)");
  for (const type of EVENT_TYPES) {
    const expected = freeGuestLimitFor(type.id);
    const eventId = await newEvent(orgId, type.id);

    let accepted = 0;
    let blockedAt: number | null = null;
    for (let i = 0; i < expected + 1; i++) {
      try {
        await rsvp(eventId, `device-${i}`);
        accepted++;
      } catch (e) {
        if (!isLimitError(e)) throw e;
        blockedAt = i;
        break;
      }
    }
    assert(
      `${type.id}: DB enforces ${expected}`,
      accepted === expected && blockedAt === expected,
      `accepted=${accepted} blockedAt=${blockedAt}`
    );
  }

  // ---- paid events are unlimited -----------------------------------------
  section("paid event bypasses the limit");
  const paidEvent = await newEvent(orgId, "birthday", true);
  let paidOk = true;
  for (let i = 0; i < 15; i++) {
    try {
      await rsvp(paidEvent, `paid-device-${i}`);
    } catch {
      paidOk = false;
      break;
    }
  }
  assert("paid birthday accepts >10 guests", paidOk);

  // ---- the reason api/rsvp uses update-then-insert, not upsert ------------
  // At the limit an EXISTING device must still be able to change its answer.
  // An INSERT..ON CONFLICT would re-run the BEFORE INSERT trigger and be
  // rejected here, which is exactly the bug that route avoids.
  section("existing guest can change answer at the limit");
  const fullEvent = await newEvent(orgId, "birthday");
  for (let i = 0; i < 10; i++) await rsvp(fullEvent, `d-${i}`);

  let newBlocked = false;
  try {
    await rsvp(fullEvent, "d-new");
  } catch (e) {
    newBlocked = isLimitError(e);
  }
  assert("11th new device is blocked", newBlocked);

  const upd = await db.query(
    `update public.rsvps set status = 'no' where event_id = $1 and device_guest_id = 'd-0'`,
    [fullEvent]
  );
  assert("existing device can still switch yes -> no", upd.rowCount === 1);

  const cnt = await db.query<{ count: string }>(
    `select count(*)::text as count from public.rsvps where event_id = $1`,
    [fullEvent]
  );
  assert(
    "changing an answer does not consume a slot",
    cnt.rows[0].count === "10",
    `count=${cnt.rows[0].count}`
  );

  // ---- uniqueness + updated_at -------------------------------------------
  section("rsvp constraints");
  // Uniqueness must be checked on an event that is NOT at its limit: the BEFORE
  // INSERT limit trigger fires before the unique constraint is evaluated, so on a
  // full event a duplicate device is rejected as guest_limit_reached and the
  // constraint never gets a chance to speak.
  const spareEvent = await newEvent(orgId, "birthday");
  await rsvp(spareEvent, "dup-device");
  let dupBlocked = false;
  try {
    await rsvp(spareEvent, "dup-device");
  } catch (e) {
    dupBlocked = String((e as Error).message).includes("duplicate key");
  }
  assert("(event_id, device_guest_id) is unique", dupBlocked);

  // And the ordering above, asserted directly, since it is what makes the
  // update-then-insert flow in api/rsvp necessary rather than merely tidy.
  let limitWinsOnFullEvent = false;
  try {
    await rsvp(fullEvent, "d-0");
  } catch (e) {
    limitWinsOnFullEvent = isLimitError(e);
  }
  assert("on a full event the limit trigger fires before the unique constraint", limitWinsOnFullEvent);

  const touched = await db.query<{ changed: boolean }>(
    `select updated_at > created_at as changed from public.rsvps
      where event_id = $1 and device_guest_id = 'd-0'`,
    [fullEvent]
  );
  assert("updated_at trigger bumps on update", touched.rows[0].changed === true);

  // ---- named guest tokens -------------------------------------------------
  section("named guests");
  const g = await db.query<{ guest_token: string }>(
    `insert into public.named_guests (event_id, first_name) values ($1, 'Bat') returning guest_token`,
    [fullEvent]
  );
  assert(
    "guest_token auto-generated",
    /^[0-9a-f]{18}$/.test(g.rows[0].guest_token),
    g.rows[0].guest_token
  );

  // ---- RLS: an organizer must not see another organizer's event ----------
  // Superusers bypass RLS, so this runs as a plain role, the way the app's
  // authenticated requests do.
  section("row level security");
  const otherOrg = await newOrganizer();
  const otherEvent = await newEvent(otherOrg, "wedding");

  try {
    await db.query(`drop role if exists naashir_test_auth`);
    await db.query(`create role naashir_test_auth nologin`);
    await db.query(`grant usage on schema public to naashir_test_auth`);
    await db.query(
      `grant select, insert, update, delete on all tables in schema public to naashir_test_auth`
    );
    // PostgreSQL 16 no longer implies SET ROLE from CREATEROLE, so the grant has
    // to ask for it explicitly or the impersonation below is refused.
    await db.query(`grant naashir_test_auth to current_user with set true`);

    await db.query("begin");
    await db.query(`set local role naashir_test_auth`);
    await db.query(`select set_config('request.jwt.claim.sub', $1, true)`, [orgId]);
    const visible = await db.query<{ id: string }>(`select id from public.events where id = $1`, [
      otherEvent,
    ]);
    const own = await db.query<{ id: string }>(`select id from public.events where id = $1`, [
      fullEvent,
    ]);
    await db.query("rollback");

    assert("cannot read another organizer's event", visible.rowCount === 0);
    assert("can read own event", own.rowCount === 1);
  } catch (e) {
    // Report rather than abort: RLS needs privileges the test role may not have,
    // and that must not silently look like the security check having passed.
    await db.query("rollback").catch(() => {});
    assert("RLS policies enforced", false, `could not run: ${String((e as Error).message)}`);
  }

  await db.end();

  console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nFATAL:", (err as Error).message);
  process.exit(1);
});
