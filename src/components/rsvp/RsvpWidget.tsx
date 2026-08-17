"use client";

import { useEffect, useState } from "react";
import { getOrCreateGuestDeviceId } from "@/lib/guest-device-id";
import { useI18n } from "@/i18n/I18nProvider";
import type { RsvpStatus } from "@/lib/supabase/types";

type LoadState = "loading" | "ready";
type SubmitState = "idle" | "submitting" | "success" | "limit_reached" | "expired" | "error";

export function RsvpWidget({
  eventId,
  guestFirstName,
  guestLastName,
  guestToken,
}: {
  eventId: string;
  guestFirstName?: string | null;
  guestLastName?: string | null;
  guestToken?: string | null;
}) {
  const { dict: t } = useI18n();
  const STATUS_OPTIONS: { value: RsvpStatus; label: string }[] = [
    { value: "yes", label: t.rsvp.yes },
    { value: "no", label: t.rsvp.no },
    { value: "maybe", label: t.rsvp.maybe },
  ];
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [status, setStatus] = useState<RsvpStatus | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [displayName, setDisplayName] = useState(
    guestFirstName ? `${guestFirstName} ${guestLastName ?? ""}`.trim() : ""
  );
  // Lazy initializer instead of setting this in an effect: on the server it
  // resolves to "" (no window), then re-runs for real on the client's first
  // render -- deviceId is only used for fetch calls below, never rendered
  // directly, so there's nothing for that first pass to mismatch against.
  const [deviceId] = useState(() => getOrCreateGuestDeviceId());

  useEffect(() => {
    if (!deviceId) return;

    fetch(`/api/rsvp?event_id=${eventId}&device_guest_id=${deviceId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.rsvp) {
          setStatus(json.rsvp.status);
          setPartySize(json.rsvp.party_size);
          if (json.rsvp.display_name) setDisplayName(json.rsvp.display_name);
          setSubmitState("success");
        }
        setLoadState("ready");
      })
      .catch(() => setLoadState("ready"));
  }, [eventId, deviceId]);

  async function submit(nextStatus: RsvpStatus) {
    if (!deviceId) return;
    setSubmitState("submitting");
    setStatus(nextStatus);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          device_guest_id: deviceId,
          status: nextStatus,
          party_size: partySize,
          display_name: displayName || null,
          guest_token: guestToken || null,
        }),
      });

      if (res.ok) {
        setSubmitState("success");
        return;
      }

      const json = await res.json().catch(() => ({}));
      if (res.status === 409 && json.error === "guest_limit_reached") {
        setSubmitState("limit_reached");
      } else if (res.status === 410) {
        setSubmitState("expired");
      } else {
        setSubmitState("error");
      }
    } catch {
      setSubmitState("error");
    }
  }

  if (loadState === "loading") return null;

  if (submitState === "limit_reached") {
    return <RsvpMessage>{t.rsvp.limitReached}</RsvpMessage>;
  }

  if (submitState === "expired") {
    return <RsvpMessage>{t.rsvp.expired}</RsvpMessage>;
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t.rsvp.prompt}</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => submit(opt.value)}
            disabled={submitState === "submitting"}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
              status === opt.value
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                : "border-zinc-300 text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {status === "yes" && (
        <label className="mt-4 flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
          {t.rsvp.partySize}
          <input
            type="number"
            min={1}
            max={50}
            value={partySize}
            onChange={(e) => {
              const next = Number(e.target.value) || 1;
              setPartySize(next);
            }}
            onBlur={() => status && submit(status)}
            className="w-16 rounded-lg border border-zinc-300 px-2 py-1 text-center dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
      )}

      {!guestFirstName && (
        <label className="mt-4 flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {t.rsvp.nameLabel}
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={() => status && submit(status)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
      )}

      {submitState === "success" && status && (
        <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">{t.rsvp.submitted}</p>
      )}
      {submitState === "error" && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">{t.rsvp.errorGeneric}</p>
      )}
    </div>
  );
}

function RsvpMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      {children}
    </div>
  );
}
