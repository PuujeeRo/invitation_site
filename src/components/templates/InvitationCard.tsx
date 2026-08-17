import Image from "next/image";
import { getTemplate } from "@/lib/templates";
import { buildGreeting } from "@/lib/greeting";
import { formatEventDate } from "@/lib/format";
import type { EventType } from "@/lib/supabase/types";
import { CountdownTimer } from "./CountdownTimer";

export interface InvitationCardProps {
  eventName: string;
  eventType: EventType;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  description: string | null;
  photoUrl: string | null;
  templateId: string;
  isPaid: boolean;
  guestFirstName?: string | null;
  guestLastName?: string | null;
  countdownEnabled?: boolean;
  mapLink?: string | null;
  mapLinkLabel: string;
  watermarkText: string;
}

export function InvitationCard({
  eventName,
  eventType,
  eventDate,
  eventTime,
  location,
  description,
  photoUrl,
  templateId,
  isPaid,
  guestFirstName,
  guestLastName,
  countdownEnabled,
  mapLink,
  mapLinkLabel,
  watermarkText,
}: InvitationCardProps) {
  const template = getTemplate(templateId);
  const greeting = buildGreeting({ eventName, eventType, guestFirstName, guestLastName });

  return (
    <div
      className={`relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br shadow-xl ${template.gradient}`}
    >
      {photoUrl && (
        <div className="relative aspect-4/3 w-full animate-fade-in-up">
          <Image src={photoUrl} alt={eventName} fill className="object-cover" unoptimized />
        </div>
      )}

      <div className="flex flex-col items-center gap-3 px-8 py-10 text-center">
        <p
          className={`animate-fade-in-up text-sm font-medium [animation-delay:100ms] ${template.accent}`}
        >
          {greeting}
        </p>

        <h1
          className={`animate-fade-in-up text-3xl font-semibold tracking-tight [animation-delay:200ms] ${template.textOnGradient}`}
        >
          {eventName}
        </h1>

        <p className={`animate-fade-in-up text-base [animation-delay:300ms] ${template.textOnGradient}`}>
          {formatEventDate(eventDate, eventTime)}
        </p>

        {location && (
          <p
            className={`animate-fade-in-up text-sm opacity-80 [animation-delay:400ms] ${template.textOnGradient}`}
          >
            📍 {location}
          </p>
        )}

        {description && (
          <p
            className={`animate-fade-in-up mt-2 max-w-sm text-sm opacity-90 [animation-delay:500ms] ${template.textOnGradient}`}
          >
            {description}
          </p>
        )}

        {isPaid && countdownEnabled && (
          <div className="animate-fade-in-up mt-2 [animation-delay:600ms]">
            <CountdownTimer eventDate={eventDate} eventTime={eventTime} textClassName={template.textOnGradient} />
          </div>
        )}

        {isPaid && mapLink && (
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`animate-fade-in-up mt-2 rounded-full border px-4 py-2 text-sm font-medium [animation-delay:700ms] ${template.accent} border-current`}
          >
            {mapLinkLabel}
          </a>
        )}
      </div>

      {!isPaid && (
        <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {watermarkText}
        </div>
      )}
    </div>
  );
}
