import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/supabase/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (events ?? []) as EventRow[];

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Your events</h1>
        <Link
          href="/dashboard/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New invitation
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">You haven&apos;t created an invitation yet.</p>
          <Link href="/dashboard/new" className="text-sm font-medium underline underline-offset-4">
            Create your first one
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map((event) => (
            <li key={event.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{event.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  {event.event_date} · /{event.slug}
                  {event.is_paid ? " · Paid" : " · Free"}
                </p>
              </div>
              <Link
                href={`/dashboard/${event.id}/guests`}
                className="text-sm font-medium text-zinc-700 underline underline-offset-4 dark:text-zinc-300"
              >
                View responses
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
