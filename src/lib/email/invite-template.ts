import { buildGreeting } from "@/lib/greeting";
import { formatEventDate } from "@/lib/format";
import type { EventRow } from "@/lib/supabase/types";

export function buildInviteEmail(params: {
  event: Pick<EventRow, "name" | "event_type" | "event_date" | "event_time" | "location">;
  guestFirstName?: string | null;
  guestLastName?: string | null;
  link: string;
}) {
  const { event, guestFirstName, guestLastName, link } = params;
  const greeting = buildGreeting({
    eventName: event.name,
    eventType: event.event_type,
    guestFirstName,
    guestLastName,
  });
  const when = formatEventDate(event.event_date, event.event_time);

  const subject = `${event.name} — урилга`;
  const text = [
    greeting,
    "",
    when,
    event.location ? `📍 ${event.location}` : null,
    "",
    link,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 14px; color: #52525b;">${escapeHtml(greeting)}</p>
      <h1 style="font-size: 22px; margin: 8px 0;">${escapeHtml(event.name)}</h1>
      <p style="font-size: 14px; color: #27272a;">${escapeHtml(when)}</p>
      ${event.location ? `<p style="font-size: 14px; color: #27272a;">📍 ${escapeHtml(event.location)}</p>` : ""}
      <p style="margin-top: 24px;">
        <a href="${link}" style="display: inline-block; background: #18181b; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">
          Урилга нээх
        </a>
      </p>
    </div>
  `;

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
