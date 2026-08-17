import Image from "next/image";
import { getTemplate } from "@/lib/templates";
import { buildGreeting } from "@/lib/greeting";
import { formatEventDate } from "@/lib/format";
import type { EventType } from "@/lib/supabase/types";
import type { EventTheme, EventCustomText } from "@/lib/theme";
import { CountdownTimer, type CountdownLabels } from "./CountdownTimer";
import { Ornament } from "./Ornament";

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
  countdownLabels: CountdownLabels;
  videoUrl?: string | null;
  theme?: EventTheme;
  customText?: EventCustomText;
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
  countdownLabels,
  videoUrl,
  theme,
  customText,
}: InvitationCardProps) {
  const template = getTemplate(templateId);
  const greeting =
    (isPaid && customText?.greetingOverride) ||
    buildGreeting({ eventName, eventType, guestFirstName, guestLastName });

  // Paid-only accent color override: arbitrary user hex can't be a static
  // Tailwind class (nothing to scan at build time), so it's an inline style
  // that wins over the template's default accent class.
  const accentStyle = isPaid && theme?.accentColor ? { color: theme.accentColor } : undefined;
  const accentClass = accentStyle ? "" : template.accent;

  const headingClass = template.uppercaseName
    ? "text-xl font-semibold uppercase tracking-[0.18em] sm:text-2xl"
    : template.display === "serif"
      ? "font-display text-2xl font-medium tracking-tight sm:text-4xl"
      : "text-2xl font-semibold tracking-tight sm:text-3xl";

  return (
    <article
      className={`animate-fade-in-up relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)] sm:rounded-3xl ${template.gradient}`}
    >
      {/* slow sheen, like light moving across paper stock */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-sheen absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      {photoUrl && (
        <div className="relative aspect-4/3 w-full">
          <Image src={photoUrl} alt={eventName} fill className="object-cover" unoptimized />
          {/* vignette so the photo melts into the card instead of ending on a hard seam */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/25 to-transparent" />
        </div>
      )}

      {isPaid && videoUrl && <video src={videoUrl} controls className="w-full" />}

      {/* inset "card within a card" frame -- the classic printed-invitation cue */}
      <div
        className={`pointer-events-none absolute inset-2 rounded-xl border sm:inset-3 sm:rounded-2xl ${template.frameBorder}`}
      />

      <div className="relative flex flex-col items-center gap-2.5 px-4 py-8 text-center sm:gap-3 sm:px-8 sm:py-10">
        <p
          className={`animate-fade-in-up text-xs font-medium text-balance [animation-delay:120ms] sm:text-sm ${accentClass}`}
          style={accentStyle}
        >
          {greeting}
        </p>

        <div className={`animate-fade-in-up [animation-delay:200ms] ${accentClass}`} style={accentStyle}>
          <Ornament motif={template.ornament} />
        </div>

        <h1
          className={`animate-fade-in-up text-balance [animation-delay:280ms] ${headingClass} ${template.textOnGradient}`}
        >
          {eventName}
        </h1>

        <p
          className={`animate-fade-in-up text-sm text-balance [animation-delay:360ms] sm:text-base ${template.textOnGradient}`}
        >
          {formatEventDate(eventDate, eventTime)}
        </p>

        {location && (
          <p
            className={`animate-fade-in-up text-xs text-balance opacity-80 [animation-delay:440ms] sm:text-sm ${template.textOnGradient}`}
          >
            📍 {location}
          </p>
        )}

        {description && (
          <>
            <div className={`animate-fade-in-up mt-1 h-px w-12 [animation-delay:500ms] ${template.divider}`} />
            <p
              className={`animate-fade-in-up max-w-sm text-xs text-pretty opacity-90 [animation-delay:520ms] sm:text-sm ${template.textOnGradient}`}
            >
              {description}
            </p>
          </>
        )}

        {isPaid && countdownEnabled && (
          <div className="animate-fade-in-up mt-2 w-full [animation-delay:600ms]">
            <CountdownTimer
              eventDate={eventDate}
              eventTime={eventTime}
              labels={countdownLabels}
              textClassName={template.textOnGradient}
              chipClassName={template.chip}
            />
          </div>
        )}

        {isPaid && mapLink && (
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`animate-fade-in-up mt-2 rounded-full border border-current px-4 py-2 text-xs font-medium transition-opacity hover:opacity-70 [animation-delay:680ms] sm:text-sm ${accentClass}`}
            style={accentStyle}
          >
            {mapLinkLabel}
          </a>
        )}
      </div>

      {!isPaid && (
        <div className="absolute right-2 bottom-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm sm:right-3 sm:bottom-3 sm:px-3 sm:py-1 sm:text-xs">
          {watermarkText}
        </div>
      )}
    </article>
  );
}
