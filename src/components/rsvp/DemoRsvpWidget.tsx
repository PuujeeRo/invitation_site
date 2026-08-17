"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { RsvpOptionButtons } from "./RsvpOptionButtons";
import type { RsvpStatus } from "@/lib/supabase/types";

// Same look and interaction as RsvpWidget, but state is local only -- nothing
// is sent anywhere. Used on the no-database /demo page.
export function DemoRsvpWidget() {
  const { dict: t } = useI18n();
  const [status, setStatus] = useState<RsvpStatus | null>(null);
  const [partySize, setPartySize] = useState(1);

  const STATUS_OPTIONS: { value: RsvpStatus; label: string }[] = [
    { value: "yes", label: t.rsvp.yes },
    { value: "no", label: t.rsvp.no },
    { value: "maybe", label: t.rsvp.maybe },
  ];

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t.rsvp.prompt}</p>

      <RsvpOptionButtons options={STATUS_OPTIONS} selected={status} onSelect={setStatus} />

      {status === "yes" && (
        <label className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-700 sm:text-sm dark:text-zinc-300">
          <span className="min-w-0">{t.rsvp.partySize}</span>
          <input
            type="number"
            min={1}
            max={50}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value) || 1)}
            className="w-14 shrink-0 rounded-lg border border-zinc-300 px-2 py-1.5 text-center dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
      )}

      {status && <p className="mt-3 text-xs text-zinc-500">{t.demo.rsvpNotSaved}</p>}
    </div>
  );
}
